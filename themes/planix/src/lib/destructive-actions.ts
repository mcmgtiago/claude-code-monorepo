import { getDbPool } from "@/lib/db";
import { PROJECT_FILES_STORAGE_BUCKET } from "@/lib/project-files";
import { PROFILE_MEDIA_STORAGE_BUCKET } from "@/lib/profile";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const DISCUSSION_STORAGE_BUCKET = "project-discussions";

type DbExecutor = {
  query<T>(text: string, params?: unknown[]): Promise<{ rows: T[] }>;
};

type WorkspaceRow = {
  id: string;
  name: string;
  slug: string;
};

type StoragePathRow = {
  storage_path: string | null;
};

type ProfileMediaRow = {
  avatar_storage_path: string | null;
  cover_storage_path: string | null;
};

export type DeletedWorkspaceSummary = {
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string;
};

export type DeletedAccountSummary = {
  deletedWorkspaceCount: number;
  deletedWorkspaceNames: string[];
};

export class DestructiveActionError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "DestructiveActionError";
    this.status = status;
  }
}

function uniquePaths(paths: Array<string | null | undefined>) {
  return Array.from(new Set(paths.map((path) => path?.trim() ?? "").filter(Boolean)));
}

async function removeBucketFiles(bucket: string, paths: string[]) {
  const files = uniquePaths(paths);

  if (files.length === 0) {
    return;
  }

  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.storage.from(bucket).remove(files);

    if (error) {
      console.error(`Failed to clean up ${bucket} storage after destructive action:`, error);
    }
  } catch (error) {
    console.error(`Unexpected ${bucket} storage cleanup failure:`, error);
  }
}

async function cleanupWorkspaceStorage(paths: {
  projectFiles: string[];
  discussions: string[];
}) {
  await Promise.all([
    removeBucketFiles(PROJECT_FILES_STORAGE_BUCKET, paths.projectFiles),
    removeBucketFiles(DISCUSSION_STORAGE_BUCKET, paths.discussions),
  ]);
}

async function cleanupProfileStorage(paths: string[]) {
  await removeBucketFiles(PROFILE_MEDIA_STORAGE_BUCKET, paths);
}

async function getOwnedWorkspaces(executor: DbExecutor, userId: string) {
  const result = await executor.query<WorkspaceRow>(
    `
      select id::text, name, slug
      from public.workspaces
      where owner_user_id = $1
      order by created_at asc
    `,
    [userId],
  );

  return result.rows;
}

async function getWorkspaceStoragePaths(executor: DbExecutor, workspaceIds: string[]) {
  if (workspaceIds.length === 0) {
    return {
      projectFiles: [] as string[],
      discussions: [] as string[],
    };
  }

  const [projectFiles, discussions] = await Promise.all([
    executor.query<StoragePathRow>(
      `
        select storage_path
        from public.app_project_files
        where workspace_id = any($1::uuid[])
      `,
      [workspaceIds],
    ),
    executor.query<StoragePathRow>(
      `
        select storage_path
        from public.app_discussion_attachments
        where workspace_id = any($1::uuid[])
      `,
      [workspaceIds],
    ),
  ]);

  return {
    projectFiles: uniquePaths(projectFiles.rows.map((row) => row.storage_path)),
    discussions: uniquePaths(discussions.rows.map((row) => row.storage_path)),
  };
}

async function getProfileMediaPaths(executor: DbExecutor, userId: string) {
  const result = await executor.query<ProfileMediaRow>(
    `
      select avatar_storage_path, cover_storage_path
      from public.user_profiles
      where id = $1
      limit 1
    `,
    [userId],
  );

  return uniquePaths([
    result.rows[0]?.avatar_storage_path ?? null,
    result.rows[0]?.cover_storage_path ?? null,
  ]);
}

export async function deleteWorkspaceForOwner(userId: string, workspaceId: string): Promise<DeletedWorkspaceSummary> {
  const pool = getDbPool();
  const client = await pool.connect();
  let deletedWorkspace: WorkspaceRow | null = null;
  let workspaceStorage = {
    projectFiles: [] as string[],
    discussions: [] as string[],
  };

  try {
    await client.query("begin");

    const ownedWorkspace = await client.query<WorkspaceRow>(
      `
        select id::text, name, slug
        from public.workspaces
        where id = $1
          and owner_user_id = $2
        limit 1
      `,
      [workspaceId, userId],
    );

    deletedWorkspace = ownedWorkspace.rows[0] ?? null;

    if (!deletedWorkspace) {
      throw new DestructiveActionError("Only the workspace owner can delete this workspace.", 403);
    }

    workspaceStorage = await getWorkspaceStoragePaths(client, [workspaceId]);

    await client.query(
      `
        delete from public.workspaces
        where id = $1
          and owner_user_id = $2
      `,
      [workspaceId, userId],
    );

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }

  await cleanupWorkspaceStorage(workspaceStorage);

  if (!deletedWorkspace) {
    throw new DestructiveActionError("Workspace deletion failed.", 500);
  }

  return {
    workspaceId: deletedWorkspace.id,
    workspaceName: deletedWorkspace.name,
    workspaceSlug: deletedWorkspace.slug,
  };
}

export async function deleteAccountAndOwnedData(userId: string): Promise<DeletedAccountSummary> {
  const pool = getDbPool();
  const client = await pool.connect();
  let ownedWorkspaces: WorkspaceRow[] = [];
  let workspaceStorage = {
    projectFiles: [] as string[],
    discussions: [] as string[],
  };
  let profileStorage: string[] = [];

  try {
    await client.query("begin");

    ownedWorkspaces = await getOwnedWorkspaces(client, userId);
    workspaceStorage = await getWorkspaceStoragePaths(client, ownedWorkspaces.map((workspace) => workspace.id));
    profileStorage = await getProfileMediaPaths(client, userId);

    await client.query(
      `
        delete from public.app_workspace_activity
        where actor_user_id = $1
      `,
      [userId],
    );

    if (ownedWorkspaces.length > 0) {
      await client.query(
        `
          delete from public.workspaces
          where owner_user_id = $1
        `,
        [userId],
      );
    }

    const deletedUser = await client.query<{ id: string }>(
      `
        delete from auth.users
        where id = $1
        returning id::text
      `,
      [userId],
    );

    if (!deletedUser.rows[0]?.id) {
      throw new DestructiveActionError("Account deletion failed because the user could not be removed.", 404);
    }

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }

  await Promise.all([
    cleanupWorkspaceStorage(workspaceStorage),
    cleanupProfileStorage(profileStorage),
  ]);

  return {
    deletedWorkspaceCount: ownedWorkspaces.length,
    deletedWorkspaceNames: ownedWorkspaces.map((workspace) => workspace.name),
  };
}

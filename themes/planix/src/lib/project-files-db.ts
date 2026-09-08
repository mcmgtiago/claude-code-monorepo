import { getDbPool } from "@/lib/db";
import {
  PROJECT_FILE_MAX_BYTES,
  PROJECT_FILES_STORAGE_BUCKET,
  type ProjectFileRecord,
} from "@/lib/project-files";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

type AppProjectFileRow = {
  id: string;
  workspace_id: string | null;
  project_ref: string;
  document_id: string | null;
  name: string;
  mime_type: string;
  size_bytes: string | number;
  storage_path: string;
  created_at: string;
  updated_at: string;
};

type UploadProjectFilesInput = {
  workspaceId?: string | null;
  projectRef: string;
  documentId?: string | null;
  files: File[];
};

const DEFAULT_MIME_TYPE = "application/octet-stream";

let ensuredProjectFilesBucket: Promise<void> | null = null;

function createProjectFileId() {
  return `file-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function sanitizeFileName(name: string) {
  const trimmed = name.trim();
  const dotIndex = trimmed.lastIndexOf(".");
  const extension = dotIndex >= 0 ? trimmed.slice(dotIndex) : "";
  const baseName = dotIndex >= 0 ? trimmed.slice(0, dotIndex) : trimmed;

  return `${baseName.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 64) || "file"}${extension}`;
}

function buildDuplicateFileName(name: string) {
  const dotIndex = name.lastIndexOf(".");
  const extension = dotIndex >= 0 ? name.slice(dotIndex) : "";
  const baseName = dotIndex >= 0 ? name.slice(0, dotIndex) : name;

  return `${baseName}_copy${extension}`;
}

function ensureFileExtension(name: string, currentName: string) {
  const nextName = name.trim();

  if (!nextName) {
    return currentName;
  }

  if (nextName.includes(".")) {
    return nextName;
  }

  const dotIndex = currentName.lastIndexOf(".");
  const extension = dotIndex >= 0 ? currentName.slice(dotIndex) : "";

  return `${nextName}${extension}`;
}

function publicProjectFileUrl(storagePath: string) {
  const admin = createSupabaseAdminClient();
  return admin.storage.from(PROJECT_FILES_STORAGE_BUCKET).getPublicUrl(storagePath).data.publicUrl;
}

async function ensureProjectFilesBucket() {
  if (!ensuredProjectFilesBucket) {
    ensuredProjectFilesBucket = (async () => {
      const admin = createSupabaseAdminClient();
      const { data: buckets, error } = await admin.storage.listBuckets();

      if (error) {
        throw error;
      }

      if (!buckets.some((bucket) => bucket.name === PROJECT_FILES_STORAGE_BUCKET)) {
        const { error: createError } = await admin.storage.createBucket(PROJECT_FILES_STORAGE_BUCKET, {
          public: true,
          fileSizeLimit: `${Math.round(PROJECT_FILE_MAX_BYTES / (1024 * 1024))}MB`,
        });

        if (createError && !String(createError.message).toLowerCase().includes("already exists")) {
          throw createError;
        }
      }
    })();
  }

  return ensuredProjectFilesBucket;
}

function mapProjectFileRow(row: AppProjectFileRow): ProjectFileRecord {
  return {
    id: row.id,
    projectRef: row.project_ref,
    documentId: row.document_id,
    name: row.name,
    mimeType: row.mime_type,
    sizeBytes: Number(row.size_bytes),
    url: publicProjectFileUrl(row.storage_path),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function fetchProjectFileRows(projectRef: string, workspaceId?: string | null) {
  const pool = getDbPool();
  const result = workspaceId
    ? await pool.query<AppProjectFileRow>(
        `
          select
            id,
            workspace_id::text,
            project_ref,
            document_id,
            name,
            mime_type,
            size_bytes,
            storage_path,
            created_at::text,
            updated_at::text
          from public.app_project_files
          where workspace_id = $1
            and project_ref = $2
          order by document_id asc nulls last, updated_at desc, created_at desc
        `,
        [workspaceId, projectRef],
      )
    : await pool.query<AppProjectFileRow>(
        `
          select
            id,
            workspace_id::text,
            project_ref,
            document_id,
            name,
            mime_type,
            size_bytes,
            storage_path,
            created_at::text,
            updated_at::text
          from public.app_project_files
          where project_ref = $1
          order by document_id asc nulls last, updated_at desc, created_at desc
        `,
        [projectRef],
      );

  return result.rows;
}

async function removeProjectStorageFiles(storagePaths: string[]) {
  if (storagePaths.length === 0) {
    return;
  }

  await ensureProjectFilesBucket();
  const admin = createSupabaseAdminClient();
  await admin.storage.from(PROJECT_FILES_STORAGE_BUCKET).remove(storagePaths);
}

async function uploadFilesToStorage(projectRef: string, files: File[]) {
  if (files.length === 0) {
    return [] as Array<{
      id: string;
      name: string;
      mimeType: string;
      sizeBytes: number;
      storagePath: string;
    }>;
  }

  await ensureProjectFilesBucket();
  const admin = createSupabaseAdminClient();
  const uploaded = [] as Array<{
    id: string;
    name: string;
    mimeType: string;
    sizeBytes: number;
    storagePath: string;
  }>;

  for (const file of files) {
    if (file.size > PROJECT_FILE_MAX_BYTES) {
      throw new Error(`${file.name} exceeds the 50 MB upload limit.`);
    }

    const fileId = createProjectFileId();
    const storagePath = `${projectRef}/${fileId}-${sanitizeFileName(file.name)}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const { error } = await admin.storage.from(PROJECT_FILES_STORAGE_BUCKET).upload(storagePath, fileBuffer, {
      contentType: file.type || DEFAULT_MIME_TYPE,
      upsert: false,
    });

    if (error) {
      throw error;
    }

    uploaded.push({
      id: fileId,
      name: file.name,
      mimeType: file.type || DEFAULT_MIME_TYPE,
      sizeBytes: file.size,
      storagePath,
    });
  }

  return uploaded;
}

export async function getProjectFiles(projectRef: string, workspaceId?: string | null) {
  const rows = await fetchProjectFileRows(projectRef, workspaceId);
  return rows.map(mapProjectFileRow);
}

export async function uploadProjectFiles(input: UploadProjectFilesInput) {
  if (!input.projectRef.trim()) {
    throw new Error("Project reference is required.");
  }

  if (input.files.length === 0) {
    throw new Error("At least one file is required.");
  }

  const projectRef = input.projectRef.trim();
  const workspaceId = input.workspaceId?.trim() || null;
  const documentId = input.documentId?.trim() || null;
  const pool = getDbPool();
  const client = await pool.connect();
  const uploadedFiles = await uploadFilesToStorage(projectRef, input.files);
  const newlyUploadedPaths = uploadedFiles.map((file) => file.storagePath);

  try {
    await client.query("begin");

    let replacedRows: Array<Pick<AppProjectFileRow, "id" | "storage_path">> = [];

    if (documentId) {
      const existingResult = await client.query<Pick<AppProjectFileRow, "id" | "storage_path">>(
        workspaceId
          ? `
              select id, storage_path
              from public.app_project_files
              where workspace_id = $1
                and project_ref = $2
                and document_id = $3
            `
          : `
              select id, storage_path
              from public.app_project_files
              where project_ref = $1
                and document_id = $2
            `,
        workspaceId ? [workspaceId, projectRef, documentId] : [projectRef, documentId],
      );

      replacedRows = existingResult.rows;

      if (replacedRows.length > 0) {
        await client.query(
          workspaceId
            ? `
                delete from public.app_project_files
                where workspace_id = $1
                  and project_ref = $2
                  and document_id = $3
              `
            : `
                delete from public.app_project_files
                where project_ref = $1
                  and document_id = $2
              `,
          workspaceId ? [workspaceId, projectRef, documentId] : [projectRef, documentId],
        );
      }
    }

    for (const uploadedFile of uploadedFiles) {
      await client.query(
        `
          insert into public.app_project_files (
            id,
            workspace_id,
            project_ref,
            document_id,
            name,
            mime_type,
            size_bytes,
            storage_path
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
        [
          uploadedFile.id,
          workspaceId,
          projectRef,
          documentId,
          uploadedFile.name,
          uploadedFile.mimeType,
          uploadedFile.sizeBytes,
          uploadedFile.storagePath,
        ],
      );
    }

    await client.query("commit");
    await removeProjectStorageFiles(replacedRows.map((row) => row.storage_path));
  } catch (error) {
    await client.query("rollback");
    await removeProjectStorageFiles(newlyUploadedPaths);
    throw error;
  } finally {
    client.release();
  }

  return getProjectFiles(projectRef, workspaceId);
}

export async function renameProjectFile(projectRef: string, fileId: string, name: string, workspaceId?: string | null) {
  const nextName = name.trim();

  if (!projectRef.trim() || !fileId.trim() || !nextName) {
    throw new Error("Project file rename is missing required fields.");
  }

  const pool = getDbPool();
  const existingResult = workspaceId
    ? await pool.query<Pick<AppProjectFileRow, "name">>(
        `
          select name
          from public.app_project_files
          where workspace_id = $1
            and project_ref = $2
            and id = $3
          limit 1
        `,
        [workspaceId, projectRef, fileId],
      )
    : await pool.query<Pick<AppProjectFileRow, "name">>(
        `
          select name
          from public.app_project_files
          where project_ref = $1
            and id = $2
          limit 1
        `,
        [projectRef, fileId],
      );
  const currentName = existingResult.rows[0]?.name;

  if (!currentName) {
    throw new Error("Project file not found.");
  }

  if (workspaceId) {
    await pool.query(
      `
        update public.app_project_files
        set name = $4,
            updated_at = now()
        where workspace_id = $1
          and project_ref = $2
          and id = $3
      `,
      [workspaceId, projectRef, fileId, ensureFileExtension(nextName, currentName)],
    );
  } else {
    await pool.query(
      `
        update public.app_project_files
        set name = $3,
            updated_at = now()
        where project_ref = $1
          and id = $2
      `,
      [projectRef, fileId, ensureFileExtension(nextName, currentName)],
    );
  }

  return getProjectFiles(projectRef, workspaceId);
}

export async function duplicateProjectFile(projectRef: string, fileId: string, workspaceId?: string | null) {
  if (!projectRef.trim() || !fileId.trim()) {
    throw new Error("Project file duplicate is missing required fields.");
  }

  const pool = getDbPool();
  const result = workspaceId
    ? await pool.query<AppProjectFileRow>(
        `
          select
            id,
            workspace_id::text,
            project_ref,
            document_id,
            name,
            mime_type,
            size_bytes,
            storage_path,
            created_at::text,
            updated_at::text
          from public.app_project_files
          where workspace_id = $1
            and project_ref = $2
            and id = $3
          limit 1
        `,
        [workspaceId, projectRef, fileId],
      )
    : await pool.query<AppProjectFileRow>(
        `
          select
            id,
            workspace_id::text,
            project_ref,
            document_id,
            name,
            mime_type,
            size_bytes,
            storage_path,
            created_at::text,
            updated_at::text
          from public.app_project_files
          where project_ref = $1
            and id = $2
          limit 1
        `,
        [projectRef, fileId],
      );
  const currentFile = result.rows[0];

  if (!currentFile) {
    throw new Error("Project file not found.");
  }

  await ensureProjectFilesBucket();
  const admin = createSupabaseAdminClient();
  const duplicateId = createProjectFileId();
  const duplicatePath = `${projectRef}/${duplicateId}-${sanitizeFileName(buildDuplicateFileName(currentFile.name))}`;
  const { error: copyError } = await admin.storage.from(PROJECT_FILES_STORAGE_BUCKET).copy(currentFile.storage_path, duplicatePath);

  if (copyError) {
    throw copyError;
  }

  try {
    await pool.query(
      `
        insert into public.app_project_files (
          id,
          workspace_id,
          project_ref,
          document_id,
          name,
          mime_type,
          size_bytes,
          storage_path
        )
        values ($1, $2, $3, null, $4, $5, $6, $7)
      `,
      [
        duplicateId,
        workspaceId ?? currentFile.workspace_id ?? null,
        projectRef,
        buildDuplicateFileName(currentFile.name),
        currentFile.mime_type,
        Number(currentFile.size_bytes),
        duplicatePath,
      ],
    );
  } catch (error) {
    await removeProjectStorageFiles([duplicatePath]);
    throw error;
  }

  return getProjectFiles(projectRef, workspaceId);
}

export async function deleteProjectFile(projectRef: string, fileId: string, workspaceId?: string | null) {
  if (!projectRef.trim() || !fileId.trim()) {
    throw new Error("Project file delete is missing required fields.");
  }

  const pool = getDbPool();
  const result = workspaceId
    ? await pool.query<Pick<AppProjectFileRow, "storage_path">>(
        `
          delete from public.app_project_files
          where workspace_id = $1
            and project_ref = $2
            and id = $3
          returning storage_path
        `,
        [workspaceId, projectRef, fileId],
      )
    : await pool.query<Pick<AppProjectFileRow, "storage_path">>(
        `
          delete from public.app_project_files
          where project_ref = $1
            and id = $2
          returning storage_path
        `,
        [projectRef, fileId],
      );

  const storagePath = result.rows[0]?.storage_path;

  if (storagePath) {
    await removeProjectStorageFiles([storagePath]);
  }

  return getProjectFiles(projectRef, workspaceId);
}

export async function deleteAllProjectFiles(workspaceId: string, projectRef: string) {
  const pool = getDbPool();
  const result = await pool.query<Pick<AppProjectFileRow, "storage_path">>(
    `
      delete from public.app_project_files
      where workspace_id = $1
        and project_ref = $2
      returning storage_path
    `,
    [workspaceId, projectRef],
  );

  await removeProjectStorageFiles(result.rows.map((row) => row.storage_path));
}

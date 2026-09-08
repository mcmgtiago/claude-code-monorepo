import { Pool } from "pg";

import { env } from "@/lib/env";

declare global {
  var __planixPgPool: Pool | undefined;
}

type AuthLikeUser = {
  id: string;
  email?: string | null;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    full_name?: string;
    phone?: string;
  } | null;
};

export function getDbPool() {
  if (!globalThis.__planixPgPool) {
    globalThis.__planixPgPool = new Pool({
      connectionString: env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30_000,
    });
  }

  return globalThis.__planixPgPool;
}

export async function checkDatabaseConnection() {
  const pool = getDbPool();
  const result = await pool.query<{
    now: string;
    current_database: string;
    current_user: string;
  }>("select now()::text, current_database(), current_user");

  return result.rows[0];
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function defaultWorkspaceName(user: AuthLikeUser) {
  const fullName = user.user_metadata?.full_name?.trim();
  const firstName = user.user_metadata?.first_name?.trim();
  const emailLocalPart = user.email?.split("@")[0]?.trim();

  if (fullName) {
    return `${fullName}'s Workspace`;
  }

  if (firstName) {
    return `${firstName}'s Workspace`;
  }

  if (emailLocalPart) {
    return `${emailLocalPart} Workspace`;
  }

  return "Planix Workspace";
}

async function ensureUserProfileRow(client: Pool | PoolClientLike, user: AuthLikeUser) {
  const fullName = user.user_metadata?.full_name?.trim() || null;
  const firstName = user.user_metadata?.first_name?.trim() || null;
  const lastName = user.user_metadata?.last_name?.trim() || null;
  const phone = user.user_metadata?.phone?.trim() || null;
  const email = user.email?.trim().toLowerCase() || "";

  if (!user.id || !email) {
    throw new Error("Authenticated user is missing required profile data.");
  }

  const existingProfile = await client.query<{ id: string }>(
    `
      select id
      from public.user_profiles
      where id = $1
      limit 1
    `,
    [user.id],
  );
  const hadProfile = existingProfile.rows.length > 0;

  await client.query(
    `
      insert into public.user_profiles (id, email, first_name, last_name, full_name, phone)
      values ($1, $2, $3, $4, $5, $6)
      on conflict (id)
      do update set
        email = coalesce(public.user_profiles.email, excluded.email),
        first_name = coalesce(public.user_profiles.first_name, excluded.first_name),
        last_name = coalesce(public.user_profiles.last_name, excluded.last_name),
        full_name = coalesce(public.user_profiles.full_name, excluded.full_name),
        phone = coalesce(public.user_profiles.phone, excluded.phone)
    `,
    [user.id, email, firstName, lastName, fullName, phone],
  );

  return {
    email,
    createdProfile: !hadProfile,
  };
}

type PoolClientLike = {
  query: Pool["query"];
};

export async function ensureUserProfile(user: AuthLikeUser) {
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query("begin");
    const result = await ensureUserProfileRow(client, user);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function ensureUserProfileAndWorkspace(user: AuthLikeUser) {
  const pool = getDbPool();
  const workspaceName = defaultWorkspaceName(user);
  const workspaceSlug = `${slugify(workspaceName) || "workspace"}-${user.id.slice(0, 8)}`;
  const client = await pool.connect();

  try {
    await client.query("begin");

    const profile = await ensureUserProfileRow(client, user);

    const existingMembership = await client.query<{ workspace_id: string }>(
      `
        select workspace_id
        from public.workspace_members
        where user_id = $1
        order by
          case
            when status = 'active' then 0
            else 1
          end,
          created_at asc
        limit 1
      `,
      [user.id],
    );

    const pendingInviteResult = await client.query<{ workspace_id: string }>(
      `
        select workspace_id
        from public.workspace_invites
        where lower(email) = $1
          and status = 'pending'
        order by created_at asc
      `,
      [profile.email],
    );

    const invitedWorkspaceIds = Array.from(new Set(
      pendingInviteResult.rows
        .map((row) => row.workspace_id)
        .filter(Boolean),
    ));

    if (invitedWorkspaceIds.length > 0) {
      await client.query(
        `
          insert into public.workspace_members (workspace_id, user_id, role, status)
          select workspace_id, $1, 'member', 'active'
          from unnest($2::uuid[]) as workspace_id
          on conflict (workspace_id, user_id)
          do update set
            role = case
              when public.workspace_members.role = 'owner' then public.workspace_members.role
              else 'member'
            end,
            status = 'active'
        `,
        [user.id, invitedWorkspaceIds],
      );

      await client.query(
        `
          update public.workspace_invites
          set
            status = 'accepted',
            accepted_at = coalesce(accepted_at, now())
          where lower(email) = $1
            and workspace_id = any($2::uuid[])
            and status = 'pending'
        `,
        [profile.email, invitedWorkspaceIds],
      );

      await client.query("commit");

      return {
        workspaceId: existingMembership.rows[0]?.workspace_id ?? invitedWorkspaceIds[0],
        createdProfile: profile.createdProfile,
        createdWorkspace: false,
        acceptedInvite: true,
      };
    }

    if (existingMembership.rows[0]?.workspace_id) {
      await client.query("commit");
      return {
        workspaceId: existingMembership.rows[0].workspace_id,
        createdProfile: profile.createdProfile,
        createdWorkspace: false,
        acceptedInvite: false,
      };
    }

    const workspaceResult = await client.query<{ id: string }>(
      `
        insert into public.workspaces (
          name,
          slug,
          support_email,
          timezone,
          region,
          invite_policy,
          approval_flow,
          digest,
          owner_user_id
        )
        values ($1, $2, $3, $4, $5, 'admins-only', true, true, $6)
        returning id
      `,
      [workspaceName, workspaceSlug, profile.email, "Asia/Kolkata", "India", user.id],
    );

    const workspaceId = workspaceResult.rows[0]?.id;

    if (!workspaceId) {
      throw new Error("Failed to create the default workspace.");
    }

    await client.query(
      `
        insert into public.workspace_members (workspace_id, user_id, role, status)
        values ($1, $2, 'owner', 'active')
        on conflict (workspace_id, user_id) do nothing
      `,
      [workspaceId, user.id],
    );

    await client.query("commit");

    return {
      workspaceId,
      createdProfile: profile.createdProfile,
      createdWorkspace: true,
      acceptedInvite: false,
    };
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

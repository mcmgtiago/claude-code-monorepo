import { getConfiguredAppUrl } from "@/lib/app-url";
import { sendWorkspaceInviteEmail } from "@/lib/auth-email";
import { getDbPool } from "@/lib/db";
import { getProjectWorkspaceBundle, saveProjectWorkspaceBundle } from "@/lib/projects-db";
import { createPendingWorkspaceMember } from "@/lib/people";
import { ensureUserProfileAndSelectedWorkspace } from "@/lib/workspace-selection";

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

type WorkspaceSetupRow = {
  id: string;
  name: string;
  slug: string;
  setup_completed_at: string | null;
};

type PendingInviteRow = {
  email: string;
};

type ExistingUserRow = {
  id: string;
  email: string;
};

type WorkspaceNameRow = {
  name: string;
};

type WorkspaceMemberEmailRow = {
  email: string;
};

export type WorkspaceSetupState = {
  workspaceName: string;
  workspaceSlug: string;
  ownerEmail: string;
  completed: boolean;
  invites: string[];
};

type UpdateWorkspaceSetupInput = {
  workspaceName: string;
  invites: string[];
};

function slugifyWorkspaceName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function normalizeWorkspaceName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function isValidInviteEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeInviteEmails(invites: string[], ownerEmail: string) {
  return Array.from(
    new Set(
      invites
        .map((invite) => invite.trim().toLowerCase())
        .filter(Boolean)
        .filter((invite) => invite !== ownerEmail)
        .filter(isValidInviteEmail),
    ),
  ).slice(0, 12);
}

function resolveInviterName(user: AuthLikeUser) {
  const fullName = user.user_metadata?.full_name?.trim();
  const firstName = user.user_metadata?.first_name?.trim();
  const email = user.email?.trim().toLowerCase();

  if (fullName) {
    return fullName;
  }

  if (firstName) {
    return firstName;
  }

  return email || "A teammate";
}

async function getWorkspaceName(workspaceId: string) {
  const pool = getDbPool();
  const result = await pool.query<WorkspaceNameRow>(
    `
      select name
      from public.workspaces
      where id = $1
      limit 1
    `,
    [workspaceId],
  );

  return result.rows[0]?.name?.trim() || "Workspace";
}

async function listPendingInviteEmails(workspaceId: string) {
  const pool = getDbPool();
  const result = await pool.query<PendingInviteRow>(
    `
      select email
      from public.workspace_invites
      where workspace_id = $1
        and status = 'pending'
      order by created_at asc
    `,
    [workspaceId],
  );

  return result.rows.map((row) => row.email?.trim().toLowerCase()).filter(Boolean) as string[];
}

async function listWorkspaceMemberEmails(workspaceId: string) {
  const pool = getDbPool();
  const result = await pool.query<WorkspaceMemberEmailRow>(
    `
      select lower(profiles.email) as email
      from public.workspace_members members
      join public.user_profiles profiles
        on profiles.id = members.user_id
      where members.workspace_id = $1
        and members.status in ('active', 'pending')
      order by members.created_at asc
    `,
    [workspaceId],
  );

  return result.rows.map((row) => row.email?.trim().toLowerCase()).filter(Boolean) as string[];
}

export async function inviteWorkspaceMembers(user: AuthLikeUser, input: {
  emails: string[];
  workspaceId?: string;
  workspaceName?: string;
}) {
  const ownerEmail = user.email?.trim().toLowerCase() ?? "";

  if (!ownerEmail) {
    throw new Error("Authenticated user is missing an email address.");
  }

  const resolvedWorkspaceId = input.workspaceId?.trim() || (await ensureUserProfileAndSelectedWorkspace(user)).workspaceId;
  const normalizedInviteEmails = normalizeInviteEmails(input.emails, ownerEmail);

  if (normalizedInviteEmails.length === 0) {
    return [] as string[];
  }

  const [workspaceName, memberEmails, pendingInviteEmails] = await Promise.all([
    input.workspaceName?.trim() ? Promise.resolve(input.workspaceName.trim()) : getWorkspaceName(resolvedWorkspaceId),
    listWorkspaceMemberEmails(resolvedWorkspaceId),
    listPendingInviteEmails(resolvedWorkspaceId),
  ]);
  const memberEmailSet = new Set(memberEmails);
  const pendingInviteEmailSet = new Set(pendingInviteEmails);
  const nextInviteEmails = normalizedInviteEmails.filter(
    (email) => !memberEmailSet.has(email) && !pendingInviteEmailSet.has(email),
  );

  if (nextInviteEmails.length === 0) {
    return [] as string[];
  }

  const pool = getDbPool();
  const client = await pool.connect();
  const existingUserEmails = new Set<string>();

  try {
    await client.query("begin");

    const existingUsersResult = await client.query<ExistingUserRow>(
      `
        select id, lower(email) as email
        from auth.users
        where lower(email) = any($1::text[])
      `,
      [nextInviteEmails],
    );

    if (existingUsersResult.rows.length > 0) {
      existingUsersResult.rows.forEach((row) => existingUserEmails.add(row.email));

      await client.query(
        `
          insert into public.workspace_members (workspace_id, user_id, role, status)
          select $1, existing_user.id, 'member', 'pending'
          from unnest($2::uuid[]) as existing_user(id)
          on conflict (workspace_id, user_id)
          do update set
            role = case
              when public.workspace_members.role = 'owner' then public.workspace_members.role
              else 'member'
            end,
            status = case
              when public.workspace_members.role = 'owner' then public.workspace_members.status
              else 'pending'
            end
        `,
        [resolvedWorkspaceId, existingUsersResult.rows.map((row) => row.id)],
      );
    }

    await client.query(
      `
        insert into public.workspace_invites (workspace_id, email, invited_by_user_id, status)
        select $1, invite_email.email, $2, 'pending'
        from unnest($3::text[]) as invite_email(email)
        on conflict (workspace_id, email)
        do update set
          invited_by_user_id = excluded.invited_by_user_id,
          status = case
            when public.workspace_invites.status = 'accepted' then public.workspace_invites.status
            else 'pending'
          end
      `,
      [resolvedWorkspaceId, user.id, nextInviteEmails],
    );

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }

  const appUrl = getConfiguredAppUrl();
  const inviterName = resolveInviterName(user);

  await Promise.all(
    nextInviteEmails.map(async (inviteEmail) => {
      const existingAccount = existingUserEmails.has(inviteEmail);
      const actionUrl = existingAccount
        ? `${appUrl}/login?email=${encodeURIComponent(inviteEmail)}&next=${encodeURIComponent("/select-workspace")}`
        : `${appUrl}/signup?email=${encodeURIComponent(inviteEmail)}`;
      const result = await sendWorkspaceInviteEmail({
        workspaceId: resolvedWorkspaceId,
        workspaceName,
        invitedByName: inviterName,
        recipientEmail: inviteEmail,
        actionUrl,
        appUrl,
        existingAccount,
      });

      if (result.status === "failed") {
        console.error(`Failed to send workspace invite email to ${inviteEmail}: ${result.reason ?? "Unknown email error."}`);
      }
    }),
  );

  return nextInviteEmails;
}

async function fetchWorkspaceSetupState(workspaceId: string, ownerEmail: string): Promise<WorkspaceSetupState | null> {
  const pool = getDbPool();
  const [workspaceResult, invitesResult] = await Promise.all([
    pool.query<WorkspaceSetupRow>(
      `
        select id, name, slug, setup_completed_at
        from public.workspaces
        where id = $1
        limit 1
      `,
      [workspaceId],
    ),
    pool.query<PendingInviteRow>(
      `
        select email
        from public.workspace_invites
        where workspace_id = $1
          and status = 'pending'
        order by created_at asc
      `,
      [workspaceId],
    ),
  ]);

  const row = workspaceResult.rows[0];

  if (!row) {
    return null;
  }

  return {
    workspaceName: row.name,
    workspaceSlug: row.slug,
    ownerEmail,
    completed: Boolean(row.setup_completed_at),
    invites: invitesResult.rows.map((invite) => invite.email),
  };
}

export async function getWorkspaceSetupState(user: AuthLikeUser): Promise<WorkspaceSetupState> {
  const ownerEmail = user.email?.trim().toLowerCase() ?? "";

  if (!ownerEmail) {
    throw new Error("Authenticated user is missing an email address.");
  }

  const { workspaceId } = await ensureUserProfileAndSelectedWorkspace(user);
  const state = await getWorkspaceSetupStateForWorkspace(workspaceId, ownerEmail);

  return state;
}

export async function getWorkspaceSetupStateForWorkspace(workspaceId: string, ownerEmail: string): Promise<WorkspaceSetupState> {
  const normalizedOwnerEmail = ownerEmail.trim().toLowerCase();

  if (!normalizedOwnerEmail) {
    throw new Error("Authenticated user is missing an email address.");
  }

  const state = await fetchWorkspaceSetupState(workspaceId, normalizedOwnerEmail);

  if (!state) {
    throw new Error("Workspace setup could not be loaded.");
  }

  return state;
}

export async function completeWorkspaceSetup(user: AuthLikeUser, input: UpdateWorkspaceSetupInput): Promise<WorkspaceSetupState> {
  const ownerEmail = user.email?.trim().toLowerCase() ?? "";

  if (!ownerEmail) {
    throw new Error("Authenticated user is missing an email address.");
  }

  const workspaceName = normalizeWorkspaceName(input.workspaceName);

  if (!workspaceName) {
    throw new Error("Workspace name is required.");
  }

  const { workspaceId } = await ensureUserProfileAndSelectedWorkspace(user);
  const inviteEmails = normalizeInviteEmails(input.invites, ownerEmail);
  const nextSlug = `${slugifyWorkspaceName(workspaceName) || "workspace"}-${workspaceId.slice(0, 8)}`;
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query("begin");

    await client.query(
      `
        update public.workspaces
        set
          name = $2,
          slug = $3,
          setup_completed_at = coalesce(setup_completed_at, now())
        where id = $1
      `,
      [workspaceId, workspaceName, nextSlug],
    );

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }

  if (inviteEmails.length > 0) {
    const projectBundle = await getProjectWorkspaceBundle(user);
    const existingEmails = new Set(projectBundle.teamMembers.map((member) => member.email.trim().toLowerCase()));
    const nextTeamMembers = [
      ...projectBundle.teamMembers,
      ...inviteEmails
        .filter((email) => !existingEmails.has(email))
        .map((email) => createPendingWorkspaceMember(email)),
    ];

    if (nextTeamMembers.length !== projectBundle.teamMembers.length) {
      await saveProjectWorkspaceBundle(user, {
        projects: projectBundle.projects,
        teamMembers: nextTeamMembers,
        workspaceTeams: projectBundle.workspaceTeams,
        notifications: projectBundle.notifications,
        integrations: projectBundle.integrations,
      });
    }

    await inviteWorkspaceMembers(user, {
      workspaceId,
      workspaceName,
      emails: inviteEmails,
    });
  }

  return getWorkspaceSetupStateForWorkspace(workspaceId, ownerEmail);
}

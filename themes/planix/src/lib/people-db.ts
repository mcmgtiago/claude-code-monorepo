import type { TeamMemberRecord, WorkspaceProject } from "@/data/project-board";
import { getDbPool } from "@/lib/db";
import {
  buildMemberInitials,
  buildMemberNameFromEmail,
  createPendingWorkspaceMember,
  normalizeWorkspacePeopleMembers,
  normalizeWorkspaceTeams,
  type WorkspacePeopleMember,
  type WorkspaceTeamRecord,
} from "@/lib/people";
import { getProjectWorkspaceBundle, saveProjectWorkspaceBundle } from "@/lib/projects-db";
import { ensureUserProfileAndSelectedWorkspace } from "@/lib/workspace-selection";
import { inviteWorkspaceMembers } from "@/lib/workspace-setup-db";

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

type PendingInviteRow = {
  email: string;
};

type WorkspaceMemberProfileRow = {
  user_id: string;
  email: string;
  display_name: string;
  avatar_tone: WorkspacePeopleMember["avatarTone"] | null;
  role: string;
  status: string;
};

export type PeopleWorkspaceBundle = {
  teams: WorkspaceTeamRecord[];
  members: WorkspacePeopleMember[];
  projects: WorkspaceProject[];
};

type SavePeopleWorkspaceInput = {
  teams: WorkspaceTeamRecord[];
  members: WorkspacePeopleMember[];
  projects: WorkspaceProject[];
};

async function getPendingInviteEmails(workspaceId: string) {
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

  return result.rows.map((row) => row.email.trim().toLowerCase()).filter(Boolean);
}

async function deletePendingInvitesForEmails(workspaceId: string, emails: string[]) {
  if (emails.length === 0) {
    return;
  }

  const normalizedEmails = Array.from(new Set(
    emails.map((email) => email.trim().toLowerCase()).filter(Boolean),
  ));

  if (normalizedEmails.length === 0) {
    return;
  }

  const pool = getDbPool();

  await pool.query(
    `
      delete from public.workspace_invites
      where workspace_id = $1
        and status = 'pending'
        and lower(email) = any($2::text[])
    `,
    [workspaceId, normalizedEmails],
  );

  await pool.query(
    `
      delete from public.workspace_members members
      using public.user_profiles profiles
      where members.workspace_id = $1
        and members.status = 'pending'
        and members.user_id = profiles.id
        and lower(profiles.email) = any($2::text[])
    `,
    [workspaceId, normalizedEmails],
  );
}

async function listWorkspaceMemberProfiles(workspaceId: string) {
  const pool = getDbPool();
  const result = await pool.query<WorkspaceMemberProfileRow>(
    `
      select
        members.user_id::text as user_id,
        lower(coalesce(profiles.email, '')) as email,
        coalesce(
          nullif(trim(profiles.full_name), ''),
          nullif(trim(concat_ws(' ', profiles.first_name, profiles.last_name)), ''),
          split_part(coalesce(profiles.email, ''), '@', 1),
          'Team Member'
        ) as display_name,
        profiles.avatar_tone,
        members.role,
        members.status
      from public.workspace_members members
      left join public.user_profiles profiles
        on profiles.id = members.user_id
      where members.workspace_id = $1
        and members.status in ('active', 'pending')
      order by
        case members.status
          when 'active' then 0
          else 1
        end,
        members.created_at asc
    `,
    [workspaceId],
  );

  return result.rows.filter((row) => row.email);
}

function mergePendingInvitesIntoMembers(
  members: WorkspacePeopleMember[],
  pendingInviteEmails: string[],
  teams: WorkspaceTeamRecord[],
) {
  const existingEmails = new Set(members.map((member) => member.email.trim().toLowerCase()));
  const nextMembers = [...members];

  for (const email of pendingInviteEmails) {
    if (existingEmails.has(email)) {
      continue;
    }

    nextMembers.push(createPendingWorkspaceMember(email, teams[0]?.id));
    existingEmails.add(email);
  }

  return nextMembers;
}

function mergeWorkspaceMembershipsIntoMembers(
  members: WorkspacePeopleMember[],
  workspaceMembers: WorkspaceMemberProfileRow[],
  pendingInviteEmails: string[],
  teams: WorkspaceTeamRecord[],
) {
  const fallbackTeamId = teams[0]?.id ?? "team-general";
  const pendingInviteSet = new Set(pendingInviteEmails);
  const merged = new Map(
    members.map((member) => [member.email.trim().toLowerCase(), member] as const),
  );

  for (const workspaceMember of workspaceMembers) {
    const email = workspaceMember.email.trim().toLowerCase();
    const existing = merged.get(email);
    const displayName = existing?.name?.trim() || workspaceMember.display_name.trim() || buildMemberNameFromEmail(email);

    merged.set(email, {
      id: workspaceMember.user_id || existing?.id || `workspace-member-${email.replace(/[^a-z0-9]+/g, "-")}`,
      name: displayName,
      email,
      avatarInitials: existing?.avatarInitials?.trim() || buildMemberInitials(displayName),
      avatarTone: existing?.avatarTone ?? workspaceMember.avatar_tone ?? "sand",
      avatarImage: existing?.avatarImage,
      dateAdded: existing?.dateAdded?.trim() || "January 1, 2024",
      lastActive: workspaceMember.status === "pending"
        ? "Invitation sent"
        : existing?.lastActive === "Invitation sent" || pendingInviteSet.has(email)
          ? "Joined workspace"
          : (existing?.lastActive?.trim() || "Joined workspace"),
      teamId: existing?.teamId?.trim() || fallbackTeamId,
      role: existing?.role ?? (workspaceMember.role === "owner" ? "Admin" : "User"),
    });
  }

  for (const email of pendingInviteEmails) {
    if (merged.has(email)) {
      continue;
    }

    merged.set(email, createPendingWorkspaceMember(email, fallbackTeamId));
  }

  return Array.from(merged.values());
}

export async function getPeopleWorkspaceBundle(user: AuthLikeUser): Promise<PeopleWorkspaceBundle> {
  const { workspaceId } = await ensureUserProfileAndSelectedWorkspace(user);
  const workspaceBundle = await getProjectWorkspaceBundle(user);
  const teams = normalizeWorkspaceTeams(workspaceBundle.workspaceTeams);
  const [pendingInviteEmails, workspaceMembers] = await Promise.all([
    getPendingInviteEmails(workspaceId),
    listWorkspaceMemberProfiles(workspaceId),
  ]);
  const members = mergeWorkspaceMembershipsIntoMembers(
    mergePendingInvitesIntoMembers(
      normalizeWorkspacePeopleMembers(workspaceBundle.teamMembers, teams),
      pendingInviteEmails,
      teams,
    ),
    workspaceMembers,
    pendingInviteEmails,
    teams,
  );

  const needsSync =
    members.length !== workspaceBundle.teamMembers.length ||
    teams.length !== workspaceBundle.workspaceTeams.length ||
    JSON.stringify(members) !== JSON.stringify(workspaceBundle.teamMembers);

  if (needsSync) {
    await saveProjectWorkspaceBundle(user, {
      projects: workspaceBundle.projects,
      teamMembers: members,
      workspaceTeams: teams,
      notifications: workspaceBundle.notifications,
      integrations: workspaceBundle.integrations,
    });
  }

  return {
    teams,
    members,
    projects: workspaceBundle.projects,
  };
}

export async function savePeopleWorkspaceBundle(user: AuthLikeUser, input: SavePeopleWorkspaceInput): Promise<PeopleWorkspaceBundle> {
  const { workspaceId } = await ensureUserProfileAndSelectedWorkspace(user);
  const teams = normalizeWorkspaceTeams(input.teams);
  const members = normalizeWorkspacePeopleMembers(input.members as TeamMemberRecord[], teams);
  const nextMemberEmails = new Set(members.map((member) => member.email.trim().toLowerCase()));
  const pendingInviteEmails = await getPendingInviteEmails(workspaceId);
  const removedPendingInviteEmails = pendingInviteEmails.filter((email) => !nextMemberEmails.has(email));
  await saveProjectWorkspaceBundle(user, {
    projects: input.projects,
    teamMembers: members,
    workspaceTeams: teams,
  });

  await deletePendingInvitesForEmails(workspaceId, removedPendingInviteEmails);
  await inviteWorkspaceMembers(user, {
    workspaceId,
    emails: members.map((member) => member.email),
  });

  return getPeopleWorkspaceBundle(user);
}

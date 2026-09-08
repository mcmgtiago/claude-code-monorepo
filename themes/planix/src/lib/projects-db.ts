import { getDbPool } from "@/lib/db";
import {
  createDefaultProjectWorkspaceBundle,
  normalizeProjectWorkspaceBundle,
  type ProjectWorkspaceBundle,
} from "@/lib/project-workspace";
import { deleteProjectDiscussionsForWorkspace } from "@/lib/discussions-db";
import { deleteAllProjectFiles } from "@/lib/project-files-db";
import { deleteProjectTasksForWorkspace } from "@/lib/tasks-db";
import { deleteProjectTimeEntriesForWorkspace } from "@/lib/time-tracker-db";
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

type AppProjectWorkspaceRow = {
  projects: ProjectWorkspaceBundle["projects"] | null;
  team_members: ProjectWorkspaceBundle["teamMembers"] | null;
  workspace_teams: ProjectWorkspaceBundle["workspaceTeams"] | null;
  project_notifications: ProjectWorkspaceBundle["notifications"] | null;
  project_integrations: ProjectWorkspaceBundle["integrations"] | null;
};

async function ensureProjectWorkspaceRow(workspaceId: string) {
  const pool = getDbPool();
  const defaults = createDefaultProjectWorkspaceBundle();

  await pool.query(
    `
      insert into public.app_project_workspaces (
        workspace_id,
        projects,
        team_members,
        workspace_teams,
        project_notifications,
        project_integrations
      )
      values ($1, $2::jsonb, $3::jsonb, $4::jsonb, $5::jsonb, $6::jsonb)
      on conflict (workspace_id) do nothing
    `,
    [
      workspaceId,
      JSON.stringify(defaults.projects),
      JSON.stringify(defaults.teamMembers),
      JSON.stringify(defaults.workspaceTeams),
      JSON.stringify(defaults.notifications),
      JSON.stringify(defaults.integrations),
    ],
  );
}

export async function getProjectWorkspaceBundleForWorkspace(workspaceId: string) {
  await ensureProjectWorkspaceRow(workspaceId);

  const pool = getDbPool();
  const result = await pool.query<AppProjectWorkspaceRow>(
    `
      select
        projects,
        team_members,
        workspace_teams,
        project_notifications,
        project_integrations
      from public.app_project_workspaces
      where workspace_id = $1
      limit 1
    `,
    [workspaceId],
  );

  return normalizeProjectWorkspaceBundle({
    projects: result.rows[0]?.projects ?? undefined,
    teamMembers: result.rows[0]?.team_members ?? undefined,
    workspaceTeams: result.rows[0]?.workspace_teams ?? undefined,
    notifications: result.rows[0]?.project_notifications ?? undefined,
    integrations: result.rows[0]?.project_integrations ?? undefined,
  });
}

export async function deleteProjectResourcesForWorkspace(workspaceId: string, projectRef: string) {
  await deleteProjectTasksForWorkspace(workspaceId, projectRef);
  await deleteProjectTimeEntriesForWorkspace(workspaceId, projectRef);
  await deleteProjectDiscussionsForWorkspace(workspaceId, projectRef);
  await deleteAllProjectFiles(workspaceId, projectRef);
}

export async function getProjectWorkspaceBundle(user: AuthLikeUser) {
  const { workspaceId } = await ensureUserProfileAndSelectedWorkspace(user);
  return getProjectWorkspaceBundleForWorkspace(workspaceId);
}

export async function saveProjectWorkspaceBundleForWorkspace(
  workspaceId: string,
  bundle: Partial<ProjectWorkspaceBundle>,
  options?: { cleanupRemovedProjects?: boolean },
) {
  await ensureProjectWorkspaceRow(workspaceId);

  const currentBundle = await getProjectWorkspaceBundleForWorkspace(workspaceId);
  const nextBundle = normalizeProjectWorkspaceBundle({
    projects: bundle.projects ?? currentBundle.projects,
    teamMembers: bundle.teamMembers ?? currentBundle.teamMembers,
    workspaceTeams: bundle.workspaceTeams ?? currentBundle.workspaceTeams,
    notifications: bundle.notifications ?? currentBundle.notifications,
    integrations: bundle.integrations ?? currentBundle.integrations,
  });
  const pool = getDbPool();
  const removedProjectRefs = currentBundle.projects
    .map((project) => String(project.id))
    .filter((projectRef) => !nextBundle.projects.some((project) => String(project.id) === projectRef));

  await pool.query(
    `
      update public.app_project_workspaces
      set
        projects = $2::jsonb,
        team_members = $3::jsonb,
        workspace_teams = $4::jsonb,
        project_notifications = $5::jsonb,
        project_integrations = $6::jsonb
      where workspace_id = $1
    `,
    [
      workspaceId,
      JSON.stringify(nextBundle.projects),
      JSON.stringify(nextBundle.teamMembers),
      JSON.stringify(nextBundle.workspaceTeams),
      JSON.stringify(nextBundle.notifications),
      JSON.stringify(nextBundle.integrations),
    ],
  );

  if (options?.cleanupRemovedProjects !== false) {
    for (const projectRef of removedProjectRefs) {
      await deleteProjectResourcesForWorkspace(workspaceId, projectRef);
    }
  }

  return nextBundle;
}

export async function saveProjectWorkspaceBundle(
  user: AuthLikeUser,
  bundle: Partial<ProjectWorkspaceBundle>,
  options?: { cleanupRemovedProjects?: boolean },
) {
  const { workspaceId } = await ensureUserProfileAndSelectedWorkspace(user);
  return saveProjectWorkspaceBundleForWorkspace(workspaceId, bundle, options);
}

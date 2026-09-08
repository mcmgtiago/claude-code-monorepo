import {
  integrations,
  projectDocuments,
  projectGoals,
  type Integration,
  type ProjectDocument,
  type ProjectGoal,
  type ProjectNotification,
  type TeamMemberRecord,
  type WorkspaceProject,
} from "@/data/project-board";
import { normalizeIntegrationUrl } from "@/lib/integrations";
import { DEFAULT_WORKSPACE_TEAMS, normalizeWorkspaceTeams, type WorkspaceTeamRecord } from "@/lib/people";

export type ProjectWorkspaceBundle = {
  projects: WorkspaceProject[];
  teamMembers: TeamMemberRecord[];
  workspaceTeams: WorkspaceTeamRecord[];
  notifications: Record<string, ProjectNotification[]>;
  integrations: Record<string, Integration[]>;
};

function buildProjectDescription(
  name: string,
  projectType: string,
  clientName?: string,
  startDate?: string,
  deadline?: string,
) {
  const clientContext = clientName ? ` for ${clientName}` : "";
  const timelineContext = startDate && deadline
    ? ` running from ${startDate} to ${deadline}`
    : startDate
      ? ` kicking off on ${startDate}`
      : deadline
        ? ` scheduled through ${deadline}`
        : "";

  return `"${name}" is a ${projectType.toLowerCase()} project${clientContext}${timelineContext}. The workspace is organized to keep delivery, collaboration, and execution details in one place from kickoff through handoff.`;
}

export function cloneDefaultProjectDocuments(): ProjectDocument[] {
  return projectDocuments.map((document) => ({ ...document }));
}

export function cloneDefaultProjectGoals(): ProjectGoal[] {
  return projectGoals.map((goal) => ({ ...goal }));
}

export function cloneDefaultProjectNotifications() {
  return [];
}

export function cloneDefaultIntegrations(): Integration[] {
  return integrations.map((integration) => ({ ...integration }));
}

export function createInitialWorkspaceProjects(): WorkspaceProject[] {
  return [];
}

function normalizeProject(project: WorkspaceProject): WorkspaceProject {
  return {
    ...project,
    completed: Boolean(project.completed),
    projectType: project.projectType?.trim() || project.category,
    description: project.description?.trim() || buildProjectDescription(project.name, project.projectType?.trim() || project.category),
    documents: Array.isArray(project.documents) && project.documents.length > 0
      ? project.documents.map((document) => ({ ...document }))
      : cloneDefaultProjectDocuments(),
    goals: Array.isArray(project.goals) && project.goals.length > 0
      ? project.goals.map((goal) => ({ ...goal }))
      : cloneDefaultProjectGoals(),
    members: Array.isArray(project.members)
      ? project.members
        .filter((member) => typeof member?.name === "string" && member.name.trim())
        .map((member) => ({
          name: member.name.trim(),
          team: member.team?.trim() || DEFAULT_WORKSPACE_TEAMS[0]?.name || "Design",
          teamId: member.teamId?.trim() || undefined,
          email: member.email?.trim() || undefined,
        }))
      : [],
  };
}

function normalizeTeamMember(member: TeamMemberRecord): TeamMemberRecord {
  return {
    id: member.id,
    name: member.name.trim(),
    email: member.email.trim().toLowerCase(),
    avatarInitials: member.avatarInitials.trim() || member.name.trim().slice(0, 2).toUpperCase(),
    avatarTone: member.avatarTone,
    avatarImage: member.avatarImage?.trim() || undefined,
    dateAdded: member.dateAdded,
    lastActive: member.lastActive,
    teamId: member.teamId?.trim() || undefined,
    role: member.role ?? "User",
  };
}

function normalizeIntegration(integration: Integration): Integration {
  return {
    id: integration.id,
    name: integration.name.trim(),
    url: normalizeIntegrationUrl(integration.url) || integration.url.trim(),
    description: integration.description.trim(),
    category: integration.category,
    enabled: Boolean(integration.enabled),
    custom: Boolean(integration.custom),
  };
}

export function createDefaultProjectWorkspaceBundle(): ProjectWorkspaceBundle {
  const projects = createInitialWorkspaceProjects();

  return {
    projects,
    teamMembers: [],
    workspaceTeams: DEFAULT_WORKSPACE_TEAMS.map((team) => ({ ...team })),
    notifications: {},
    integrations: {},
  };
}

export function normalizeProjectWorkspaceBundle(
  bundle?: Partial<ProjectWorkspaceBundle> | null,
): ProjectWorkspaceBundle {
  const fallback = createDefaultProjectWorkspaceBundle();
  const projects = Array.isArray(bundle?.projects) && bundle.projects.length > 0
    ? bundle.projects
      .filter((project): project is WorkspaceProject => Boolean(project && typeof project.id === "number" && project.name))
      .map(normalizeProject)
    : [];
  const teamMembers = Array.isArray(bundle?.teamMembers) && bundle.teamMembers.length > 0
    ? bundle.teamMembers
      .filter((member): member is TeamMemberRecord => Boolean(member && member.id && member.name && member.email))
      .map(normalizeTeamMember)
    : [];
  const workspaceTeams = normalizeWorkspaceTeams(bundle?.workspaceTeams ?? fallback.workspaceTeams);
  const notifications = Object.fromEntries(
    projects.map((project) => {
      const key = String(project.id);
      const value = bundle?.notifications?.[key];

      return [
        key,
        Array.isArray(value) ? value : [],
      ];
    }),
  );
  const integrationsMap = bundle?.integrations ?? {};
  const normalizedIntegrations = Object.fromEntries(
    projects.map((project) => {
      const key = String(project.id);
      const value = integrationsMap[key];

      return [
        key,
        Array.isArray(value) && value.length > 0
          ? value
            .filter((integration): integration is Integration =>
              Boolean(integration && integration.id && integration.name && integration.url && integration.description),
            )
            .map(normalizeIntegration)
          : cloneDefaultIntegrations(),
      ];
    }),
  );

  return {
    projects,
    teamMembers,
    workspaceTeams,
    notifications,
    integrations: normalizedIntegrations,
  };
}

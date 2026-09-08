import type { TeamMemberRecord } from "@/data/project-board";

export type WorkspaceMemberRole = "Admin" | "User" | "Viewer";

export type WorkspaceTeamRecord = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type WorkspacePeopleMember = TeamMemberRecord & {
  teamId: string;
  role: WorkspaceMemberRole;
};

const DEFAULT_WORKSPACE_TEAM_NAMES = [
  "Design",
  "Development",
  "Marketing",
  "Research",
  "Product",
  "QA",
  "Management",
] as const;

export const DEFAULT_WORKSPACE_TEAMS: WorkspaceTeamRecord[] = DEFAULT_WORKSPACE_TEAM_NAMES.map((name, index) => ({
  id: `team-template-${index + 1}`,
  name,
  email: "",
  createdAt: "January 1, 2024",
}));

function cloneDefaultWorkspaceTeams() {
  return DEFAULT_WORKSPACE_TEAMS.map((team) => ({ ...team }));
}

export function buildMemberInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "NA";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function buildMemberNameFromEmail(email: string) {
  const localPart = email.trim().toLowerCase().split("@")[0] ?? "";
  const words = localPart
    .split(/[^a-z0-9]+/i)
    .map((word) => word.trim())
    .filter(Boolean);

  if (words.length === 0) {
    return "Pending Member";
  }

  return words.map((word) => `${word.slice(0, 1).toUpperCase()}${word.slice(1)}`).join(" ");
}

export function normalizeWorkspaceTeams(teams?: WorkspaceTeamRecord[] | null): WorkspaceTeamRecord[] {
  if (!Array.isArray(teams) || teams.length === 0) {
    return cloneDefaultWorkspaceTeams();
  }

  const normalizedTeams = teams
    .filter((team) => team && typeof team.id === "string" && typeof team.name === "string" && team.name.trim())
    .map((team) => ({
      id: team.id,
      name: team.name.trim(),
      email: team.email?.trim().toLowerCase() || "",
      createdAt: team.createdAt?.trim() || "January 1, 2024",
    }));

  return normalizedTeams.length > 0 ? normalizedTeams : cloneDefaultWorkspaceTeams();
}

export function normalizeWorkspacePeopleMembers(
  members: TeamMemberRecord[] | null | undefined,
  teams: WorkspaceTeamRecord[],
): WorkspacePeopleMember[] {
  const fallbackTeamId = teams[0]?.id ?? "team-general";

  return Array.isArray(members)
    ? members
      .filter((member): member is TeamMemberRecord => Boolean(member && member.id && member.email))
      .map((member) => ({
        id: member.id,
        name: member.name.trim() || buildMemberNameFromEmail(member.email),
        email: member.email.trim().toLowerCase(),
        avatarInitials: member.avatarInitials?.trim() || buildMemberInitials(member.name),
        avatarTone: member.avatarTone,
        avatarImage: member.avatarImage?.trim() || undefined,
        dateAdded: member.dateAdded?.trim() || "January 1, 2024",
        lastActive: member.lastActive?.trim() || "Updated just now",
        teamId: member.teamId?.trim() || fallbackTeamId,
        role: member.role ?? "User",
      }))
    : [];
}

export function createPendingWorkspaceMember(email: string, teamId?: string): WorkspacePeopleMember {
  const normalizedEmail = email.trim().toLowerCase();
  const name = buildMemberNameFromEmail(normalizedEmail);

  return {
    id: `invite-${normalizedEmail.replace(/[^a-z0-9]+/g, "-")}`,
    name,
    email: normalizedEmail,
    avatarInitials: buildMemberInitials(name),
    avatarTone: "sand",
    dateAdded: new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date()),
    lastActive: "Invitation sent",
    teamId: teamId || DEFAULT_WORKSPACE_TEAMS[0]?.id || "team-general",
    role: "User",
  };
}

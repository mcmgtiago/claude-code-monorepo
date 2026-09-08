export const teamAccessRoleOptions = ["ADMIN", "MANAGER", "MEMBER"] as const;
export const superuserAccessRoleOptions = ["SUPERUSER", "ADMIN", "MANAGER", "MEMBER"] as const;
export const teamStatusOptions = ["ACTIVE", "SUSPENDED"] as const;

export type TeamAccessRole = (typeof superuserAccessRoleOptions)[number];

type TeamPermissionActor = {
  id?: string | null;
  accessRole?: string | null;
  isWorkspaceOwner?: boolean;
};

type TeamPermissionSubject = {
  id?: string | null;
  accessRole?: string | null;
  isWorkspaceOwner?: boolean;
};

export function canManageTeam(role: string | null | undefined) {
  return role === "SUPERUSER" || role === "ADMIN" || role === "MANAGER";
}

export function canAccessSuperuser(role: string | null | undefined) {
  return role === "SUPERUSER";
}

function normalizeAccessRole(role: string | null | undefined): TeamAccessRole | null {
  if (role === "SUPERUSER" || role === "ADMIN" || role === "MANAGER" || role === "MEMBER") {
    return role;
  }

  return null;
}

export function isWorkspaceOwner(userId: string | null | undefined, workspaceOwnerId: string | null | undefined) {
  return Boolean(userId && workspaceOwnerId && userId === workspaceOwnerId);
}

export function listAssignableTeamRoles(actor: TeamPermissionActor) {
  const role = normalizeAccessRole(actor.accessRole);

  if (role === "SUPERUSER" || actor.isWorkspaceOwner) {
    return [...teamAccessRoleOptions];
  }

  if (role === "ADMIN") {
    return teamAccessRoleOptions.filter((value) => value !== "ADMIN");
  }

  if (role === "MANAGER") {
    return teamAccessRoleOptions.filter((value) => value === "MEMBER");
  }

  return [] as Array<(typeof teamAccessRoleOptions)[number]>;
}

export function canInviteTeamRole(actor: TeamPermissionActor, targetRole: string | null | undefined) {
  const role = normalizeAccessRole(targetRole);

  if (!role || role === "SUPERUSER") {
    return false;
  }

  return listAssignableTeamRoles(actor).includes(role);
}

export function canManageWorkspaceMember(actor: TeamPermissionActor, subject: TeamPermissionSubject) {
  const actorRole = normalizeAccessRole(actor.accessRole);
  const subjectRole = normalizeAccessRole(subject.accessRole);

  if (!actor.id || !subject.id || !actorRole || !subjectRole || actor.id === subject.id) {
    return false;
  }

  if (subjectRole === "SUPERUSER") {
    return actorRole === "SUPERUSER";
  }

  if (subject.isWorkspaceOwner) {
    return actorRole === "SUPERUSER";
  }

  if (actorRole === "SUPERUSER") {
    return true;
  }

  if (actor.isWorkspaceOwner) {
    return true;
  }

  if (actorRole === "ADMIN") {
    return subjectRole === "MANAGER" || subjectRole === "MEMBER";
  }

  if (actorRole === "MANAGER") {
    return subjectRole === "MEMBER";
  }

  return false;
}

export function assigneeInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export function assigneeTone(index: number) {
  switch (index % 3) {
    case 0:
      return "bg-[#eef4ff] text-[#386df4]";
    case 1:
      return "bg-[#fff2df] text-[#d59628]";
    default:
      return "bg-[#ffe7e4] text-[#d85b4b]";
  }
}

export function sanitizeAssignedUsers(
  assignedUsers: string[] | null | undefined,
  activeNames: string[],
  fallbackName?: string | null
) {
  const validNames = new Set(activeNames.map((name) => name.trim()).filter(Boolean));
  const unique = Array.from(new Set((assignedUsers || []).map((name) => name.trim()).filter(Boolean)));
  const filtered = unique.filter((name) => validNames.has(name));

  if (filtered.length) {
    return filtered;
  }

  return fallbackName && validNames.has(fallbackName.trim()) ? [fallbackName.trim()] : [];
}

export function getAccessRoleLabel(role: string) {
  if (role === "SUPERUSER") return "Superuser";
  if (role === "ADMIN") return "Admin";
  if (role === "MANAGER") return "Manager";
  return "Member";
}

export function getMemberStatusLabel(status: string) {
  if (status === "SUSPENDED") return "Suspended";
  if (status === "INVITED") return "Invited";
  return "Active";
}

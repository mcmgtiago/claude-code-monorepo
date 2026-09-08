import { canManageTeam, isWorkspaceOwner } from "@/lib/team";
import { getAssignedUserIds, getAssignedUserNames, parseAssignedUserEntries } from "@/lib/lead-assignees";

export const LEAD_CONTROL_DENIED_MESSAGE = "Only assigned users, managers, and admins can modify this lead.";

type LeadPermissionActor = {
  id?: string | null;
  fullName?: string | null;
  accessRole?: string | null;
};

type LeadPermissionWorkspace = {
  createdById?: string | null;
};

type LeadPermissionLead = {
  assignedUsers?: string[] | null;
  assignedUserIds?: string[] | null;
  assignedUsersJson?: string | null;
};

function normalizeAssignedUsers(value: string[] | null | undefined) {
  return Array.from(new Set((value || []).map((entry) => entry.trim()).filter(Boolean)));
}

export function getLeadAssignedUsers(lead: LeadPermissionLead) {
  if (lead.assignedUsers) {
    return normalizeAssignedUsers(lead.assignedUsers);
  }

  return getAssignedUserNames(parseAssignedUserEntries(lead.assignedUsersJson));
}

export function getLeadAssignedUserIds(lead: LeadPermissionLead) {
  if (lead.assignedUserIds) {
    return normalizeAssignedUsers(lead.assignedUserIds);
  }

  return getAssignedUserIds(parseAssignedUserEntries(lead.assignedUsersJson));
}

export function canControlLead(
  actor: LeadPermissionActor,
  workspace: LeadPermissionWorkspace,
  lead: LeadPermissionLead
) {
  if (isWorkspaceOwner(actor.id, workspace.createdById) || canManageTeam(actor.accessRole)) {
    return true;
  }

  if (actor.id && getLeadAssignedUserIds(lead).includes(actor.id)) {
    return true;
  }

  const actorName = actor.fullName?.trim();
  if (!actorName) {
    return false;
  }

  return getLeadAssignedUsers(lead).includes(actorName);
}

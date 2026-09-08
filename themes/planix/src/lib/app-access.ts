import { attachClientPortalAccessToUser, listClientPortalMembershipsForUser } from "@/lib/client-portal-db";
import { ensureUserProfileAndWorkspace } from "@/lib/db";
import { resolveWorkspaceSelectionState } from "@/lib/workspace-selection";

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

export type WorkspaceAppAccess = {
  kind: "workspace";
  workspaceId: string;
};

export type ClientAppAccess = {
  kind: "client";
  memberships: Awaited<ReturnType<typeof listClientPortalMembershipsForUser>>;
};

export type ResolvedAppAccess = WorkspaceAppAccess | ClientAppAccess | null;

export async function resolveAuthenticatedAppAccess(user: AuthLikeUser): Promise<ResolvedAppAccess> {
  await attachClientPortalAccessToUser(user);
  const selection = await resolveWorkspaceSelectionState(user.id);

  if (selection.selectedWorkspaceId) {
    return {
      kind: "workspace",
      workspaceId: selection.selectedWorkspaceId,
    };
  }

  const memberships = await listClientPortalMembershipsForUser(user.id);

  if (memberships.length > 0) {
    return {
      kind: "client",
      memberships,
    };
  }

  return null;
}

export async function resolveOrBootstrapAppAccess(user: AuthLikeUser): Promise<Exclude<ResolvedAppAccess, null>> {
  const access = await resolveAuthenticatedAppAccess(user);

  if (access) {
    return access;
  }

  const bootstrap = await ensureUserProfileAndWorkspace(user);

  return {
    kind: "workspace",
    workspaceId: bootstrap.workspaceId,
  };
}

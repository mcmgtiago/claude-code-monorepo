import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

import { ensureUserProfileAndWorkspace, getDbPool } from "@/lib/db";

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

type WorkspaceSelectionRow = {
  workspace_id: string;
  workspace_name: string;
  workspace_slug: string;
  role: string;
  created_at: string;
};

export type WorkspaceSelectionOption = {
  workspaceId: string;
  name: string;
  slug: string;
  role: string;
  createdAt: string;
};

export type WorkspaceSelectionState = {
  workspaces: WorkspaceSelectionOption[];
  selectedWorkspaceId: string | null;
  hasMultipleWorkspaces: boolean;
  requiresWorkspaceSelection: boolean;
};

export const ACTIVE_WORKSPACE_COOKIE = "planix.active-workspace";

const ACTIVE_WORKSPACE_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export function normalizeWorkspaceRedirectPath(value: string | null | undefined, fallback = "/dashboard") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}

async function readActiveWorkspaceCookieValue() {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(ACTIVE_WORKSPACE_COOKIE)?.value?.trim() || "";
  } catch {
    return "";
  }
}

export async function listActiveWorkspaceOptionsForUser(userId: string): Promise<WorkspaceSelectionOption[]> {
  const pool = getDbPool();
  const result = await pool.query<WorkspaceSelectionRow>(
    `
      select
        members.workspace_id::text as workspace_id,
        workspaces.name as workspace_name,
        workspaces.slug as workspace_slug,
        members.role,
        members.created_at::text as created_at
      from public.workspace_members members
      join public.workspaces workspaces
        on workspaces.id = members.workspace_id
      where members.user_id = $1
        and members.status = 'active'
      order by
        case members.role
          when 'owner' then 0
          else 1
        end,
        members.created_at asc
    `,
    [userId],
  );

  return result.rows.map((row) => ({
    workspaceId: row.workspace_id,
    name: row.workspace_name,
    slug: row.workspace_slug,
    role: row.role,
    createdAt: row.created_at,
  }));
}

export async function resolveWorkspaceSelectionState(userId: string): Promise<WorkspaceSelectionState> {
  const [workspaces, requestedWorkspaceId] = await Promise.all([
    listActiveWorkspaceOptionsForUser(userId),
    readActiveWorkspaceCookieValue(),
  ]);
  const requestedWorkspaceIsValid = workspaces.some((workspace) => workspace.workspaceId === requestedWorkspaceId);
  const selectedWorkspaceId = requestedWorkspaceIsValid
    ? requestedWorkspaceId
    : (workspaces[0]?.workspaceId ?? null);

  return {
    workspaces,
    selectedWorkspaceId,
    hasMultipleWorkspaces: workspaces.length > 1,
    requiresWorkspaceSelection: workspaces.length > 1 && !requestedWorkspaceIsValid,
  };
}

export async function ensureUserProfileAndSelectedWorkspace(user: AuthLikeUser) {
  const ensured = await ensureUserProfileAndWorkspace(user);
  const selection = await resolveWorkspaceSelectionState(user.id);

  return {
    ...ensured,
    workspaceId: selection.selectedWorkspaceId ?? ensured.workspaceId,
  };
}

export function setActiveWorkspaceCookie(response: NextResponse, workspaceId: string) {
  response.cookies.set(ACTIVE_WORKSPACE_COOKIE, workspaceId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ACTIVE_WORKSPACE_COOKIE_MAX_AGE,
  });
}

export function clearActiveWorkspaceCookie(response: NextResponse) {
  response.cookies.set(ACTIVE_WORKSPACE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}

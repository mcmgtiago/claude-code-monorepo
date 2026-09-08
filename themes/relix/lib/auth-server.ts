import "server-only";

import { cache } from "react";
import type { Route } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { canAccessSuperuser } from "@/lib/team";

function isPrismaUnknownFieldError(error: unknown) {
  return error instanceof Error && error.message.includes("Unknown field") && error.message.includes("model `User`");
}

type CurrentUser = {
  id: string;
  fullName: string;
  email: string;
  profileImageUrl?: string | null;
  sessionVersion: number;
  onboardingCompleted: boolean;
  workspaceName?: string | null;
  workspaceId?: string | null;
  accessRole: "SUPERUSER" | "ADMIN" | "MANAGER" | "MEMBER";
  status: "ACTIVE" | "INVITED" | "SUSPENDED";
} | null;

type SessionUser = {
  id: string;
  fullName: string;
  email: string;
  profileImageUrl?: string | null;
  onboardingCompleted?: boolean;
} | null;

type SessionAccountState = {
  sessionUser: NonNullable<SessionUser>;
  account: CurrentUser;
  isSessionCurrent: boolean;
} | null;

const currentUserSelect = {
  id: true,
  fullName: true,
  email: true,
  profileImageUrl: true,
  sessionVersion: true,
  onboardingCompleted: true,
  workspaceName: true,
  workspaceId: true,
  accessRole: true,
  status: true
} as const;

export function getAuthenticatedHomeRoute(user: { accessRole: string; onboardingCompleted?: boolean | null }): Route {
  if (canAccessSuperuser(user.accessRole)) {
    return "/superuser" as Route;
  }

  return (user.onboardingCompleted ? "/" : "/onboarding") as Route;
}

export const getCurrentSessionUser = cache(async (): Promise<SessionUser> => {
  const state = await getSessionAccountState();

  if (!state) {
    return null;
  }

  return state.sessionUser;
});

export const getSessionAccountState = cache(async (): Promise<SessionAccountState> => {
  const cookieStore = await cookies();
  const session = await verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (!session) {
    return null;
  }

  const sessionUser = {
    id: session.userId,
    fullName: session.fullName,
    email: session.email,
    profileImageUrl: session.profileImageUrl ?? null,
    onboardingCompleted: typeof session.onboardingCompleted === "boolean" ? session.onboardingCompleted : undefined
  } satisfies NonNullable<SessionUser>;

  let user: CurrentUser = null;

  try {
    user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: currentUserSelect
    });
  } catch (error) {
    if (!isPrismaUnknownFieldError(error)) {
      throw error;
    }

    const legacyUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        profileImageUrl: true,
        sessionVersion: true,
        onboardingCompleted: true,
        workspaceName: true,
        workspaceId: true
      }
    });

    user = legacyUser
      ? {
          ...legacyUser,
          accessRole: "MEMBER",
          status: "ACTIVE"
        }
      : null;
  }

  return {
    sessionUser,
    account: user,
    isSessionCurrent: Boolean(user && user.sessionVersion === session.sessionVersion)
  };
});

export const getCurrentUser = cache(async (): Promise<CurrentUser> => {
  const state = await getSessionAccountState();
  const user = state?.account ?? null;

  if (!user || !state?.isSessionCurrent || user.status !== "ACTIVE") {
    return null;
  }

  if (user.accessRole === "MEMBER" && (user.onboardingCompleted || user.workspaceName)) {
    const [adminCount, ownerCandidate] = await Promise.all([
      prisma.user.count({ where: { accessRole: { in: ["SUPERUSER", "ADMIN"] } } }),
      prisma.user.findFirst({
        where: {
          status: "ACTIVE",
          OR: [{ workspaceName: { not: null } }, { onboardingCompleted: true }]
        },
        orderBy: [{ onboardingCompleted: "desc" }, { createdAt: "asc" }],
        select: { id: true }
      })
    ]);

    if (adminCount === 0 && ownerCandidate?.id) {
      if (ownerCandidate.id !== user.id) {
        await prisma.user.update({
          where: { id: ownerCandidate.id },
          data: { accessRole: "ADMIN" }
        });

        return user;
      }

      return prisma.user.update({
        where: { id: ownerCandidate.id },
        data: { accessRole: "ADMIN" },
        select: currentUserSelect
      });
    }
  }

  return user;
});

export async function requireUser() {
  const state = await getSessionAccountState();

  if (!state?.sessionUser) {
    redirect("/login" as Route);
  }

  if (state.account?.status === "SUSPENDED") {
    redirect("/blocked" as Route);
  }

  if (!state.account || !state.isSessionCurrent || state.account.status !== "ACTIVE") {
    redirect("/login" as Route);
  }

  return state.account;
}

export async function requireCrmUser() {
  const user = await requireUser();

  if (canAccessSuperuser(user.accessRole)) {
    redirect("/superuser" as Route);
  }

  return user;
}

export async function requireSuperuser() {
  const user = await requireUser();

  if (!canAccessSuperuser(user.accessRole)) {
    redirect(getAuthenticatedHomeRoute(user));
  }

  return user;
}

export async function redirectIfAuthenticated() {
  const state = await getSessionAccountState();
  const user = state?.account ?? null;

  if (user?.status === "SUSPENDED") {
    redirect("/blocked" as Route);
  }

  if (user) {
    redirect(getAuthenticatedHomeRoute(user));
  }
}

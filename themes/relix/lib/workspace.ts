import "server-only";

import { cache } from "react";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, requireCrmUser, requireUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

type WorkspaceSummary = {
  id: string;
  name: string;
  slug: string;
  createdById: string | null;
};

export function slugifyWorkspaceName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "workspace";
}

export async function createUniqueWorkspaceSlug(baseName: string) {
  const baseSlug = slugifyWorkspaceName(baseName);
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.workspace.findUnique({
      where: { slug: candidate },
      select: { id: true }
    });

    if (!existing) {
      return candidate;
    }

    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }
}

async function resolveWorkspaceOwnerId(workspaceId: string, currentOwnerId: string | null | undefined) {
  if (currentOwnerId) {
    return currentOwnerId;
  }

  const ownerCandidate = await prisma.workspaceMembership.findFirst({
    where: {
      workspaceId,
      user: {
        status: "ACTIVE"
      },
      accessRole: {
        in: ["SUPERUSER", "ADMIN"]
      }
    },
    orderBy: [{ createdAt: "asc" }, { user: { createdAt: "asc" } }],
    select: {
      userId: true
    }
  });

  const fallbackCandidate =
    ownerCandidate ||
    (await prisma.workspaceMembership.findFirst({
      where: {
        workspaceId,
        user: {
          status: "ACTIVE"
        }
      },
      orderBy: [{ createdAt: "asc" }, { user: { createdAt: "asc" } }],
      select: {
        userId: true
      }
    }));

  const resolvedOwnerId = fallbackCandidate?.userId || null;

  if (resolvedOwnerId) {
    await prisma.workspace.update({
      where: { id: workspaceId },
      data: { createdById: resolvedOwnerId }
    });
  }

  return resolvedOwnerId;
}

async function getWorkspaceSummary(workspaceId: string): Promise<WorkspaceSummary | null> {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      id: true,
      name: true,
      slug: true,
      createdById: true
    }
  });

  if (!workspace) {
    return null;
  }

  const createdById = await resolveWorkspaceOwnerId(workspace.id, workspace.createdById);

  return {
    ...workspace,
    createdById
  };
}

export const getCurrentWorkspace = cache(async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser?.workspaceId) {
    return null;
  }

  return getWorkspaceSummary(currentUser.workspaceId);
});

export async function requireWorkspaceUser() {
  const user = await requireCrmUser();

  if (!user.workspaceId) {
    redirect("/onboarding" as Route);
  }

  return user;
}

export async function requireWorkspaceUserForAnyRole() {
  const user = await requireUser();

  if (!user.workspaceId) {
    redirect("/onboarding" as Route);
  }

  return user;
}

export async function requireWorkspaceContext() {
  const user = await requireWorkspaceUser();
  const workspace = await getWorkspaceSummary(user.workspaceId!);

  if (!workspace) {
    redirect("/onboarding" as Route);
  }

  await prisma.workspaceMembership.upsert({
    where: {
      userId_workspaceId: {
        userId: user.id,
        workspaceId: workspace.id
      }
    },
    update: {},
    create: {
      userId: user.id,
      workspaceId: workspace.id,
      accessRole: user.accessRole
    }
  });

  return {
    user,
    workspace
  };
}

export async function requireWorkspaceContextForAnyRole() {
  const user = await requireWorkspaceUserForAnyRole();
  const workspace = await getWorkspaceSummary(user.workspaceId!);

  if (!workspace) {
    redirect("/onboarding" as Route);
  }

  await prisma.workspaceMembership.upsert({
    where: {
      userId_workspaceId: {
        userId: user.id,
        workspaceId: workspace.id
      }
    },
    update: {},
    create: {
      userId: user.id,
      workspaceId: workspace.id,
      accessRole: user.accessRole
    }
  });

  return {
    user,
    workspace
  };
}

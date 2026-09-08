import "server-only";

import { prisma } from "@/lib/prisma";
import { createUniqueMeetingSlug } from "@/lib/meetings";
import { createUniqueWorkspaceSlug } from "@/lib/workspace";

type WorkspaceAccessRole = "SUPERUSER" | "ADMIN" | "MANAGER" | "MEMBER";

type WorkspaceUser = {
  id: string;
  fullName: string;
  email: string;
  accessRole: WorkspaceAccessRole;
  workspaceId?: string | null;
};

export async function ensureWorkspaceMembership(input: {
  userId: string;
  workspaceId: string;
  accessRole: WorkspaceAccessRole;
}) {
  return prisma.workspaceMembership.upsert({
    where: {
      userId_workspaceId: {
        userId: input.userId,
        workspaceId: input.workspaceId
      }
    },
    update: {
      accessRole: input.accessRole
    },
    create: {
      userId: input.userId,
      workspaceId: input.workspaceId,
      accessRole: input.accessRole
    }
  });
}

export async function ensureLegacyActiveWorkspaceMembership(user: WorkspaceUser) {
  if (!user.workspaceId) {
    return null;
  }

  return ensureWorkspaceMembership({
    userId: user.id,
    workspaceId: user.workspaceId,
    accessRole: user.accessRole
  });
}

export async function createWorkspaceForUser(input: {
  user: WorkspaceUser;
  workspaceName: string;
  website?: string | null;
  activate?: boolean;
}) {
  const workspaceName = input.workspaceName.trim();
  const slug = await createUniqueWorkspaceSlug(workspaceName);
  const meetingSlug = await createUniqueMeetingSlug(slug);
  const schedulingPageSlug = await createUniqueMeetingSlug(`${meetingSlug}-intro`);
  const role = input.user.accessRole === "SUPERUSER" ? "SUPERUSER" : "ADMIN";
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: {
        name: workspaceName,
        slug,
        website: input.website || null,
        createdById: input.user.id
      }
    });

    await tx.workspaceMembership.create({
      data: {
        userId: input.user.id,
        workspaceId: workspace.id,
        accessRole: role
      }
    });

    await tx.workspaceSetting.create({
      data: {
        workspaceId: workspace.id,
        countryCode: "IN",
        timezone: "Asia/Kolkata",
        currencyCode: "INR",
        locale: "en-IN",
        dateFormat: "DD MMM YYYY",
        timeFormat: "12h",
        weekStartsOn: "Monday"
      }
    });

    await tx.meetingPreference.create({
      data: {
        workspaceId: workspace.id,
        profileName: input.user.fullName,
        profileEmail: input.user.email,
        personalMeetingSlug: meetingSlug
      }
    });

    await tx.schedulingPage.create({
      data: {
        workspaceId: workspace.id,
        title: "Intro call",
        slug: schedulingPageSlug,
        durationMinutes: 30,
        hostType: "Single host",
        active: true,
        hostName: input.user.fullName,
        hostEmail: input.user.email
      }
    });

    if (workspaceName) {
      await tx.company.create({
        data: {
          workspaceId: workspace.id,
          name: workspaceName,
          website: input.website || null,
          stage: "Engaged"
        }
      });
    }

    if (input.activate ?? true) {
      await tx.user.update({
        where: { id: input.user.id },
        data: {
          workspaceId: workspace.id,
          workspaceName,
          accessRole: role,
          onboardingCompleted: true,
          onboardingCompletedAt: now
        }
      });
    }

    return workspace;
  });
}

export async function switchActiveWorkspace(input: {
  userId: string;
  email: string;
  workspaceId: string;
  inviteId?: string | null;
}) {
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    let membership = await tx.workspaceMembership.findUnique({
      where: {
        userId_workspaceId: {
          userId: input.userId,
          workspaceId: input.workspaceId
        }
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    if (!membership && input.inviteId) {
      const invite = await tx.teamInvite.findFirst({
        where: {
          id: input.inviteId,
          workspaceId: input.workspaceId,
          email: input.email,
          status: "PENDING",
          expiresAt: { gt: now }
        },
        include: {
          workspace: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      });

      if (!invite?.workspace) {
        throw new Error("This workspace invite is no longer available.");
      }

      membership = await tx.workspaceMembership.upsert({
        where: {
          userId_workspaceId: {
            userId: input.userId,
            workspaceId: invite.workspace.id
          }
        },
        update: {
          accessRole: invite.accessRole
        },
        create: {
          userId: input.userId,
          workspaceId: invite.workspace.id,
          accessRole: invite.accessRole
        },
        include: {
          workspace: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      });

      await tx.teamInvite.update({
        where: { id: invite.id },
        data: {
          status: "ACCEPTED",
          acceptedAt: now
        }
      });
    }

    if (!membership) {
      throw new Error("You do not have access to this workspace.");
    }

    await tx.user.update({
      where: { id: input.userId },
      data: {
        workspaceId: membership.workspaceId,
        workspaceName: membership.workspace.name,
        accessRole: membership.accessRole,
        onboardingCompleted: true,
        onboardingCompletedAt: now
      }
    });

    return membership.workspace;
  });
}

export async function getWorkspaceChoicesForUser(input: {
  userId: string;
  email: string;
  activeWorkspaceId?: string | null;
}) {
  const now = new Date();
  const [memberships, pendingInvites] = await Promise.all([
    prisma.workspaceMembership.findMany({
      where: { userId: input.userId },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: { createdAt: "asc" }
    }),
    prisma.teamInvite.findMany({
      where: {
        email: input.email,
        status: "PENDING",
        expiresAt: { gt: now },
        workspaceId: { not: null }
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })
  ]);
  const memberWorkspaceIds = new Set(memberships.map((membership) => membership.workspaceId));

  return {
    activeWorkspaceId: input.activeWorkspaceId || null,
    workspaces: memberships.map((membership) => ({
      id: membership.workspaceId,
      name: membership.workspace.name,
      slug: membership.workspace.slug,
      accessRole: membership.accessRole,
      active: membership.workspaceId === input.activeWorkspaceId
    })),
    invites: pendingInvites
      .filter((invite) => invite.workspace && !memberWorkspaceIds.has(invite.workspace.id))
      .map((invite) => ({
        id: invite.id,
        workspaceId: invite.workspace!.id,
        name: invite.workspace!.name,
        slug: invite.workspace!.slug,
        accessRole: invite.accessRole,
        invitedById: invite.invitedById
      }))
  };
}

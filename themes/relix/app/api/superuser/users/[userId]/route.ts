import { NextResponse } from "next/server";
import { z } from "zod";
import { sendDeletedEmail, sendRoleChangedEmail, sendSuspendedEmail } from "@/lib/account-lifecycle-email";
import { requireUser } from "@/lib/auth-server";
import { hashPassword } from "@/lib/auth-password";
import { prisma } from "@/lib/prisma";
import { canAccessSuperuser } from "@/lib/team";
import { getWorkspaceUserAvatarUrl } from "@/lib/user-avatar";

const updateUserSchema = z
  .object({
    fullName: z.string().min(2).optional(),
    email: z.string().email().optional(),
    accessRole: z.enum(["SUPERUSER", "ADMIN", "MANAGER", "MEMBER"]).optional(),
    status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
    workspaceId: z.string().cuid().nullable().optional(),
    jobRole: z.string().optional(),
    onboardingCompleted: z.boolean().optional(),
    newPassword: z.string().min(8).optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required."
  });

async function countOtherSuperusers(userId: string) {
  return prisma.user.count({
    where: {
      id: { not: userId },
      accessRole: "SUPERUSER",
      status: "ACTIVE"
    }
  });
}

export async function PATCH(request: Request, context: { params: Promise<{ userId: string }> }) {
  try {
    const currentUser = await requireUser();

    if (!canAccessSuperuser(currentUser.accessRole)) {
      return NextResponse.json({ error: "Only the superuser can access this control plane." }, { status: 403 });
    }

    const { userId } = await context.params;
    const payload = updateUserSchema.parse(await request.json());
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        accessRole: true,
        status: true,
        workspaceId: true,
        workspaceName: true
      }
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const nextRole = payload.accessRole ?? existingUser.accessRole;
    const nextStatus = payload.status ?? existingUser.status;

    if (
      existingUser.accessRole === "SUPERUSER" &&
      (nextRole !== "SUPERUSER" || nextStatus !== "ACTIVE") &&
      (await countOtherSuperusers(existingUser.id)) === 0
    ) {
      return NextResponse.json({ error: "Keep at least one active superuser account." }, { status: 400 });
    }

    if (payload.email) {
      const email = payload.email.trim().toLowerCase();
      const emailOwner = await prisma.user.findFirst({
        where: {
          id: { not: userId },
          email
        },
        select: { id: true }
      });

      if (emailOwner) {
        return NextResponse.json({ error: "Another account already uses this email." }, { status: 409 });
      }
    }

    const nextWorkspace = Object.prototype.hasOwnProperty.call(payload, "workspaceId")
      ? payload.workspaceId
        ? await prisma.workspace.findUnique({
            where: { id: payload.workspaceId },
            select: { id: true, name: true }
          })
        : null
      : undefined;

    if (payload.workspaceId && !nextWorkspace) {
      return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
    }

    const nextWorkspaceName = Object.prototype.hasOwnProperty.call(payload, "workspaceId")
      ? nextWorkspace?.name || null
      : existingUser.workspaceName || null;

    const newPasswordHash = payload.newPassword ? await hashPassword(payload.newPassword) : undefined;

    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          ...(payload.fullName ? { fullName: payload.fullName.trim() } : {}),
          ...(payload.email ? { email: payload.email.trim().toLowerCase() } : {}),
          ...(payload.accessRole ? { accessRole: payload.accessRole } : {}),
          ...(payload.status ? { status: payload.status } : {}),
          ...(nextStatus !== existingUser.status || newPasswordHash ? { sessionVersion: { increment: 1 } } : {}),
          ...(newPasswordHash ? { passwordHash: newPasswordHash } : {}),
          ...(Object.prototype.hasOwnProperty.call(payload, "workspaceId")
            ? {
                workspaceId: nextWorkspace?.id || null,
                workspaceName: nextWorkspace?.name || null,
                ...(payload.workspaceId === null && typeof payload.onboardingCompleted !== "boolean"
                  ? {
                      onboardingCompleted: false,
                      onboardingCompletedAt: null
                    }
                  : {})
              }
            : {}),
          ...(Object.prototype.hasOwnProperty.call(payload, "jobRole") ? { jobRole: payload.jobRole?.trim() || null } : {}),
          ...(typeof payload.onboardingCompleted === "boolean"
            ? {
                onboardingCompleted: payload.onboardingCompleted,
                onboardingCompletedAt: payload.onboardingCompleted ? new Date() : null
              }
            : {})
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          profileImageUrl: true,
          profileImageAsset: { select: { updatedAt: true } },
          accessRole: true,
          status: true,
          workspaceId: true,
          workspaceName: true,
          jobRole: true,
          onboardingCompleted: true,
          createdAt: true,
          lastActiveAt: true
        }
      });

      if (nextWorkspace) {
        await tx.workspaceMembership.upsert({
          where: {
            userId_workspaceId: {
              userId,
              workspaceId: nextWorkspace.id
            }
          },
          update: {
            accessRole: nextRole
          },
          create: {
            userId,
            workspaceId: nextWorkspace.id,
            accessRole: nextRole
          }
        });
      } else if (Object.prototype.hasOwnProperty.call(payload, "workspaceId") && existingUser.workspaceId) {
        await tx.workspaceMembership.deleteMany({
          where: {
            userId,
            workspaceId: existingUser.workspaceId
          }
        });
      } else if (payload.accessRole && existingUser.workspaceId) {
        await tx.workspaceMembership.upsert({
          where: {
            userId_workspaceId: {
              userId,
              workspaceId: existingUser.workspaceId
            }
          },
          update: {
            accessRole: nextRole
          },
          create: {
            userId,
            workspaceId: existingUser.workspaceId,
            accessRole: nextRole
          }
        });
      }

      return user;
    });

    const emailJobs: Array<Promise<void>> = [];

    if (nextRole !== existingUser.accessRole) {
      emailJobs.push(
        sendRoleChangedEmail({
          to: updatedUser.email,
          fullName: updatedUser.fullName,
          nextRole,
          changedByName: currentUser.fullName,
          workspaceName: nextWorkspaceName,
          senderUserId: currentUser.id
        })
      );
    }

    if (existingUser.status !== "SUSPENDED" && nextStatus === "SUSPENDED") {
      emailJobs.push(
        sendSuspendedEmail({
          to: updatedUser.email,
          fullName: updatedUser.fullName,
          changedByName: currentUser.fullName,
          workspaceName: nextWorkspaceName,
          senderUserId: currentUser.id
        })
      );
    }

    if (emailJobs.length > 0) {
      await Promise.allSettled(emailJobs);
    }

    return NextResponse.json({ user: { ...updatedUser, avatarUrl: getWorkspaceUserAvatarUrl(updatedUser) } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid user payload", issues: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update user" }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ userId: string }> }) {
  try {
    const currentUser = await requireUser();

    if (!canAccessSuperuser(currentUser.accessRole)) {
      return NextResponse.json({ error: "Only the superuser can access this control plane." }, { status: 403 });
    }

    const { userId } = await context.params;

    if (userId === currentUser.id) {
      return NextResponse.json({ error: "Delete this account from profile settings after assigning another superuser." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        accessRole: true,
        workspaceName: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (user.accessRole === "SUPERUSER" && (await countOtherSuperusers(user.id)) === 0) {
      return NextResponse.json({ error: "Keep at least one active superuser account." }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    await Promise.allSettled([
      sendDeletedEmail({
        to: user.email,
        fullName: user.fullName,
        changedByName: currentUser.fullName,
        workspaceName: user.workspaceName,
        senderUserId: currentUser.id
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete user" }, { status: 500 });
  }
}

import { z } from "zod";
import { NextResponse } from "next/server";
import { sendRoleChangedEmail, sendSuspendedEmail } from "@/lib/account-lifecycle-email";
import { prisma } from "@/lib/prisma";
import { canInviteTeamRole, canManageTeam, canManageWorkspaceMember, isWorkspaceOwner } from "@/lib/team";
import { getWorkspaceUserAvatarUrl } from "@/lib/user-avatar";
import { requireWorkspaceContext } from "@/lib/workspace";

const updateMemberSchema = z.object({
  accessRole: z.enum(["ADMIN", "MANAGER", "MEMBER"]).optional(),
  status: z.enum(["ACTIVE", "SUSPENDED"]).optional()
});

export async function PATCH(request: Request, context: { params: Promise<{ memberId: string }> }) {
  try {
    const { user: currentUser, workspace } = await requireWorkspaceContext();
    const currentUserIsWorkspaceOwner = isWorkspaceOwner(currentUser.id, workspace.createdById);

    if (!canManageTeam(currentUser.accessRole)) {
      return NextResponse.json({ error: "You do not have permission to manage the team." }, { status: 403 });
    }

    const { memberId } = await context.params;
    const payload = updateMemberSchema.parse(await request.json());
    const membership = await prisma.workspaceMembership.findUnique({
      where: {
        userId_workspaceId: {
          userId: memberId,
          workspaceId: workspace.id
        }
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profileImageUrl: true,
            profileImageAsset: { select: { updatedAt: true } },
            accessRole: true,
            status: true,
            workspaceId: true,
            createdAt: true,
            lastActiveAt: true
          }
        }
      }
    });

    if (!membership) {
      return NextResponse.json({ error: "Member not found." }, { status: 404 });
    }

    const member = {
      ...membership.user,
      accessRole: membership.accessRole
    };
    const memberIsWorkspaceOwner = isWorkspaceOwner(member.id, workspace.createdById);

    if (member.id === currentUser.id && payload.status === "SUSPENDED") {
      return NextResponse.json({ error: "You cannot suspend your own account." }, { status: 400 });
    }

    if (member.id === currentUser.id && payload.accessRole && payload.accessRole !== member.accessRole) {
      return NextResponse.json({ error: "You cannot change your own access role." }, { status: 400 });
    }

    if (
      !canManageWorkspaceMember(
        {
          id: currentUser.id,
          accessRole: currentUser.accessRole,
          isWorkspaceOwner: currentUserIsWorkspaceOwner
        },
        {
          id: member.id,
          accessRole: member.accessRole,
          isWorkspaceOwner: memberIsWorkspaceOwner
        }
      )
    ) {
      return NextResponse.json({ error: "You do not have permission to update this member." }, { status: 403 });
    }

    if (
      payload.accessRole &&
      !canInviteTeamRole(
        {
          id: currentUser.id,
          accessRole: currentUser.accessRole,
          isWorkspaceOwner: currentUserIsWorkspaceOwner
        },
        payload.accessRole
      )
    ) {
      return NextResponse.json({ error: "You do not have permission to assign that role." }, { status: 403 });
    }

    const nextRole = payload.accessRole ?? member.accessRole;
    const nextStatus = payload.status ?? member.status;
    const updatedMember = await prisma.$transaction(async (tx) => {
      if (payload.accessRole) {
        await tx.workspaceMembership.update({
          where: {
            userId_workspaceId: {
              userId: memberId,
              workspaceId: workspace.id
            }
          },
          data: { accessRole: payload.accessRole }
        });
      }

      const updatedUser = await tx.user.update({
        where: { id: memberId },
        data: {
          ...(payload.status ? { status: payload.status } : {}),
          ...(payload.accessRole && member.workspaceId === workspace.id ? { accessRole: payload.accessRole } : {}),
          ...(nextStatus !== member.status ? { sessionVersion: { increment: 1 } } : {})
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          profileImageUrl: true,
          profileImageAsset: { select: { updatedAt: true } },
          status: true,
          createdAt: true,
          lastActiveAt: true
        }
      });

      return {
        ...updatedUser,
        avatarUrl: getWorkspaceUserAvatarUrl(updatedUser),
        accessRole: nextRole,
        isWorkspaceOwner: memberIsWorkspaceOwner
      };
    });

    const emailJobs: Array<Promise<void>> = [];

    if (nextRole !== member.accessRole) {
      emailJobs.push(
        sendRoleChangedEmail({
          to: updatedMember.email,
          fullName: updatedMember.fullName,
          nextRole,
          changedByName: currentUser.fullName,
          workspaceName: workspace.name,
          senderUserId: currentUser.id
        })
      );
    }

    if (member.status !== "SUSPENDED" && nextStatus === "SUSPENDED") {
      emailJobs.push(
        sendSuspendedEmail({
          to: updatedMember.email,
          fullName: updatedMember.fullName,
          changedByName: currentUser.fullName,
          workspaceName: workspace.name,
          senderUserId: currentUser.id
        })
      );
    }

    if (emailJobs.length > 0) {
      await Promise.allSettled(emailJobs);
    }

    return NextResponse.json({ member: updatedMember });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid member payload", issues: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update member" }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ memberId: string }> }) {
  try {
    const { user: currentUser, workspace } = await requireWorkspaceContext();
    const currentUserIsWorkspaceOwner = isWorkspaceOwner(currentUser.id, workspace.createdById);

    if (!canManageTeam(currentUser.accessRole)) {
      return NextResponse.json({ error: "You do not have permission to manage the team." }, { status: 403 });
    }

    const { memberId } = await context.params;
    const membership = await prisma.workspaceMembership.findUnique({
      where: {
        userId_workspaceId: {
          userId: memberId,
          workspaceId: workspace.id
        }
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            workspaceId: true,
            status: true
          }
        }
      }
    });

    if (!membership) {
      return NextResponse.json({ error: "Member not found." }, { status: 404 });
    }

    const memberIsWorkspaceOwner = isWorkspaceOwner(membership.user.id, workspace.createdById);

    if (membership.user.id === currentUser.id) {
      return NextResponse.json({ error: "You cannot remove yourself from the workspace." }, { status: 400 });
    }

    if (
      !canManageWorkspaceMember(
        {
          id: currentUser.id,
          accessRole: currentUser.accessRole,
          isWorkspaceOwner: currentUserIsWorkspaceOwner
        },
        {
          id: membership.user.id,
          accessRole: membership.accessRole,
          isWorkspaceOwner: memberIsWorkspaceOwner
        }
      )
    ) {
      return NextResponse.json({ error: "You do not have permission to remove this member." }, { status: 403 });
    }

    await prisma.$transaction(async (tx) => {
      const fallbackMembership = await tx.workspaceMembership.findFirst({
        where: {
          userId: memberId,
          workspaceId: { not: workspace.id }
        },
        include: {
          workspace: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: "asc" }
      });

      await tx.workspaceMembership.delete({
        where: {
          userId_workspaceId: {
            userId: memberId,
            workspaceId: workspace.id
          }
        }
      });

      if (membership.user.workspaceId === workspace.id) {
        await tx.user.update({
          where: { id: memberId },
          data: fallbackMembership
            ? {
                workspaceId: fallbackMembership.workspaceId,
                workspaceName: fallbackMembership.workspace.name,
                accessRole: fallbackMembership.accessRole,
                onboardingCompleted: true,
                sessionVersion: { increment: 1 }
              }
            : {
                workspaceId: null,
                workspaceName: null,
                accessRole: "MEMBER",
                onboardingCompleted: false,
                onboardingCompletedAt: null,
                sessionVersion: { increment: 1 }
              }
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to remove member" }, { status: 500 });
  }
}

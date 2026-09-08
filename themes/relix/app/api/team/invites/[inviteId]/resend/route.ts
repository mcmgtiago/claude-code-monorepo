import { NextResponse } from "next/server";
import { createRandomToken, hashToken } from "@/lib/auth-password";
import { getAppBaseUrl } from "@/lib/app-url";
import { isSmtpConfigured, sendTeamInviteEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { canInviteTeamRole, canManageTeam, getAccessRoleLabel, isWorkspaceOwner } from "@/lib/team";
import { requireWorkspaceContext } from "@/lib/workspace";

export async function POST(request: Request, context: { params: Promise<{ inviteId: string }> }) {
  const { user: currentUser, workspace } = await requireWorkspaceContext();
  const currentUserIsWorkspaceOwner = isWorkspaceOwner(currentUser.id, workspace.createdById);

  if (!canManageTeam(currentUser.accessRole)) {
    return NextResponse.json({ error: "You do not have permission to manage the team." }, { status: 403 });
  }

  const { inviteId } = await context.params;
  const invite = await prisma.teamInvite.findUnique({
    where: { id: inviteId }
  });

  if (!invite || invite.status !== "PENDING" || invite.workspaceId !== workspace.id) {
    return NextResponse.json({ error: "This invite can no longer be resent." }, { status: 404 });
  }

  if (
    !canInviteTeamRole(
      {
        id: currentUser.id,
        accessRole: currentUser.accessRole,
        isWorkspaceOwner: currentUserIsWorkspaceOwner
      },
      invite.accessRole
    )
  ) {
    return NextResponse.json({ error: "You do not have permission to resend this invite." }, { status: 403 });
  }

  const token = createRandomToken(24);
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
  const inviteUrl = new URL("/signup", await getAppBaseUrl());
  inviteUrl.searchParams.set("invite", token);
  const smtpConfigured = await isSmtpConfigured(currentUser.id);

  await prisma.teamInvite.update({
    where: { id: invite.id },
    data: {
      tokenHash,
      expiresAt
    }
  });

  if (smtpConfigured) {
    await sendTeamInviteEmail({
      to: invite.email,
      invitedByName: currentUser.fullName,
      roleLabel: getAccessRoleLabel(invite.accessRole),
      inviteUrl: inviteUrl.toString(),
      senderUserId: currentUser.id
    });
  }

  return NextResponse.json({
    success: true,
    previewUrl: process.env.NODE_ENV === "production" || smtpConfigured ? undefined : inviteUrl.toString()
  });
}

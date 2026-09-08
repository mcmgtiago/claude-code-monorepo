import { createRandomToken, hashToken } from "@/lib/auth-password";
import { getAppBaseUrl } from "@/lib/app-url";
import { isSmtpConfigured, sendTeamInviteEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { getAccessRoleLabel } from "@/lib/team";

type TeamInviteAccessRole = "ADMIN" | "MANAGER" | "MEMBER";

export async function createOrRefreshTeamInvite(input: {
  workspaceId: string;
  email: string;
  fullName?: string | null;
  accessRole: TeamInviteAccessRole;
  invitedById: string;
  invitedByName: string;
  senderUserId?: string;
}) {
  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName?.trim() || null;
  const existingMember = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      workspaceId: true,
      workspaceMemberships: {
        where: { workspaceId: input.workspaceId },
        select: { id: true }
      }
    }
  });

  if (existingMember?.workspaceId === input.workspaceId || existingMember?.workspaceMemberships.length) {
    throw new Error("This email already belongs to this workspace.");
  }

  const existingInvite = await prisma.teamInvite.findFirst({
    where: { email, workspaceId: input.workspaceId }
  });

  const token = createRandomToken(24);
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
  const inviteUrl = new URL("/signup", await getAppBaseUrl());
  inviteUrl.searchParams.set("invite", token);
  const smtpConfigured = await isSmtpConfigured(input.senderUserId || input.invitedById);

  const invite = existingInvite
    ? await prisma.teamInvite.update({
        where: { id: existingInvite.id },
        data: {
          fullName,
          accessRole: input.accessRole,
          status: "PENDING",
          workspaceId: input.workspaceId,
          tokenHash,
          invitedById: input.invitedById,
          expiresAt,
          acceptedAt: null
        }
      })
    : await prisma.teamInvite.create({
        data: {
          email,
          workspaceId: input.workspaceId,
          fullName,
          accessRole: input.accessRole,
          tokenHash,
          invitedById: input.invitedById,
          expiresAt
        }
      });

  let warning: string | undefined;

  if (smtpConfigured) {
    try {
      await sendTeamInviteEmail({
        to: email,
        invitedByName: input.invitedByName,
        roleLabel: getAccessRoleLabel(input.accessRole),
        inviteUrl: inviteUrl.toString(),
        senderUserId: input.senderUserId || input.invitedById
      });
    } catch (error) {
      warning = error instanceof Error ? error.message : "Invite saved, but the email could not be sent.";
    }
  }

  return {
    invite,
    previewUrl: process.env.NODE_ENV === "production" || smtpConfigured ? undefined : inviteUrl.toString(),
    warning
  };
}

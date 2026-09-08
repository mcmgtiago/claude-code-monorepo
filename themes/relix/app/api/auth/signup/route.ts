import { z } from "zod";
import { NextResponse } from "next/server";
import { createSessionToken, PublicSessionUser, SESSION_COOKIE_NAME } from "@/lib/auth";
import { hashPassword, hashToken } from "@/lib/auth-password";
import { isSmtpConfigured, sendWelcomeEmail } from "@/lib/email";
import { getPasswordValidationMessage, isPasswordValid } from "@/lib/password-rules";
import { prisma } from "@/lib/prisma";
import { ensureWorkspaceMembership } from "@/lib/workspace-membership";

const signupSchema = z
  .object({
    fullName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    inviteToken: z.string().optional()
  })
  .superRefine((value, ctx) => {
    if (!isPasswordValid(value.password)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: getPasswordValidationMessage()
      });
    }
  });

function withSession(response: NextResponse, user: PublicSessionUser) {
  return createSessionToken(
    {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      sessionVersion: user.sessionVersion,
      onboardingCompleted: user.onboardingCompleted ?? false,
      profileImageUrl: user.profileImageUrl ?? null
    },
    60 * 60 * 24 * 14
  ).then((token) => {
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 14
    });

    return response;
  });
}

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const payload = signupSchema.parse(raw);
    const email = payload.email.trim().toLowerCase();
    const now = new Date();

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "An account already exists for this email." }, { status: 409 });
    }

    let invite = null;

    if (payload.inviteToken?.trim()) {
      invite = await prisma.teamInvite.findUnique({
        where: { tokenHash: hashToken(payload.inviteToken.trim()) }
      });

      if (!invite || invite.status !== "PENDING" || invite.expiresAt <= now) {
        return NextResponse.json({ error: "This invite is invalid or expired." }, { status: 400 });
      }

      if (invite.email !== email) {
        return NextResponse.json({ error: "Use the invited email address to join the team." }, { status: 400 });
      }
    } else {
      invite = await prisma.teamInvite.findFirst({
        where: {
          email,
          status: "PENDING",
          expiresAt: { gt: now }
        },
        orderBy: { createdAt: "desc" }
      });
    }

    const invitedWorkspace = invite?.workspaceId
      ? await prisma.workspace.findUnique({
          where: { id: invite.workspaceId },
          select: { id: true, name: true }
        })
      : null;
    const accessRole = invite?.accessRole ?? "ADMIN";
    const onboardingCompleted = Boolean(invite?.workspaceId);

    const user = await prisma.user.create({
      data: {
        fullName: payload.fullName.trim(),
        email,
        passwordHash: await hashPassword(payload.password),
        accessRole,
        status: "ACTIVE",
        workspaceId: invitedWorkspace?.id || null,
        workspaceName: invitedWorkspace?.name || null,
        onboardingCompleted,
        onboardingCompletedAt: onboardingCompleted ? now : null,
        lastActiveAt: now
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        sessionVersion: true,
        onboardingCompleted: true,
        profileImageUrl: true
      }
    });

    if (invite) {
      if (invite.workspaceId) {
        await ensureWorkspaceMembership({
          userId: user.id,
          workspaceId: invite.workspaceId,
          accessRole
        });
      }

      await prisma.teamInvite.update({
        where: { id: invite.id },
        data: {
          status: "ACCEPTED",
          acceptedAt: now
        }
      });
    }

    if (await isSmtpConfigured()) {
      void sendWelcomeEmail({ to: user.email, fullName: user.fullName });
    }

    return withSession(NextResponse.json({ user }), user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid signup payload", issues: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create account" }, { status: 500 });
  }
}

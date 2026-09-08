import { z } from "zod";
import { NextResponse } from "next/server";
import { sendPasswordChangedEmail } from "@/lib/account-lifecycle-email";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { hashPassword, hashToken, verifyPassword } from "@/lib/auth-password";
import { getPasswordValidationMessage, isPasswordValid } from "@/lib/password-rules";
import { prisma } from "@/lib/prisma";

const resetPasswordSchema = z
  .object({
    token: z.string().min(12),
    password: z.string().min(8)
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

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const payload = resetPasswordSchema.parse(raw);
    const tokenHash = hashToken(payload.token);
    const now = new Date();

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            passwordHash: true,
            sessionVersion: true,
            onboardingCompleted: true,
            profileImageUrl: true
          }
        }
      }
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= now) {
      return NextResponse.json({ error: "This reset link is invalid or expired." }, { status: 400 });
    }

    if (resetToken.user.passwordHash && (await verifyPassword(payload.password, resetToken.user.passwordHash))) {
      return NextResponse.json({ error: "New password must be different from the current password." }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: resetToken.userId },
      data: {
        passwordHash: await hashPassword(payload.password),
        sessionVersion: { increment: 1 },
        passwordResetTokens: {
          update: {
            where: { id: resetToken.id },
            data: { usedAt: now }
          }
        }
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        sessionVersion: true,
        onboardingCompleted: true,
        profileImageUrl: true
      }
    });

    const response = NextResponse.json({ ok: true });
    const sessionToken = await createSessionToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      sessionVersion: updatedUser.sessionVersion,
      onboardingCompleted: updatedUser.onboardingCompleted,
      profileImageUrl: updatedUser.profileImageUrl ?? null
    });

    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 14
    });

    void sendPasswordChangedEmail({
      to: updatedUser.email,
      fullName: updatedUser.fullName,
      changedAt: new Date().toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    }).catch(() => null);

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid reset password payload", issues: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to reset password" }, { status: 500 });
  }
}

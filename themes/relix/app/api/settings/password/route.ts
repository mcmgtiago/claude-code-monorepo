import { NextResponse } from "next/server";
import { z } from "zod";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { sendPasswordChangedEmail } from "@/lib/account-lifecycle-email";
import { hashPassword, verifyPassword } from "@/lib/auth-password";
import { getCurrentUser } from "@/lib/auth-server";
import { getPasswordValidationMessage, isPasswordValid } from "@/lib/password-rules";
import { prisma } from "@/lib/prisma";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().optional().default(""),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8)
  })
  .superRefine((value, ctx) => {
    if (!isPasswordValid(value.newPassword)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["newPassword"],
        message: getPasswordValidationMessage()
      });
    }

    if (value.newPassword !== value.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match."
      });
    }
  });

export async function PUT(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const raw = await request.json();
    const payload = changePasswordSchema.parse(raw);

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        passwordHash: true,
        sessionVersion: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.passwordHash && !payload.currentPassword.trim()) {
      return NextResponse.json({ error: "Current password is required." }, { status: 400 });
    }

    const matches = user.passwordHash ? await verifyPassword(payload.currentPassword, user.passwordHash) : true;
    if (!matches) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }

    const reusingCurrent = user.passwordHash ? await verifyPassword(payload.newPassword, user.passwordHash) : false;
    if (reusingCurrent) {
      return NextResponse.json({ error: "New password must be different from the current password." }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await hashPassword(payload.newPassword),
        sessionVersion: { increment: 1 }
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        sessionVersion: true
      }
    });

    const sessionToken = await createSessionToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      sessionVersion: updatedUser.sessionVersion,
      onboardingCompleted: currentUser.onboardingCompleted,
      profileImageUrl: currentUser.profileImageUrl ?? null
    });

    const response = NextResponse.json({ ok: true, passwordCreated: !user.passwordHash });
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
      }),
      senderUserId: updatedUser.id
    }).catch(() => null);

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid password update payload", issues: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update password" }, { status: 500 });
  }
}

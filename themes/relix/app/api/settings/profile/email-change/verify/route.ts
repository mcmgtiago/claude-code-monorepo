import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildAppUrl } from "@/lib/app-url";
import { createSessionToken, SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { hashToken } from "@/lib/auth-password";
import { sendEmailChangedEmail } from "@/lib/account-lifecycle-email";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token")?.trim() || "";

  if (!token) {
    return NextResponse.redirect(await buildAppUrl("/login?email-change=invalid"));
  }

  const now = new Date();
  const emailChangeToken = await prisma.emailChangeToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          sessionVersion: true,
          onboardingCompleted: true,
          profileImageUrl: true
        }
      }
    }
  });

  if (!emailChangeToken || emailChangeToken.usedAt || emailChangeToken.expiresAt <= now) {
    return NextResponse.redirect(await buildAppUrl("/login?email-change=invalid"));
  }

  const existingOwner = await prisma.user.findFirst({
    where: {
      email: emailChangeToken.newEmail,
      id: { not: emailChangeToken.userId }
    },
    select: { id: true }
  });

  if (existingOwner) {
    return NextResponse.redirect(await buildAppUrl("/login?email-change=conflict"));
  }

  const previousEmail = emailChangeToken.user.email;
  const updatedUser = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: emailChangeToken.userId },
      data: {
        email: emailChangeToken.newEmail,
        sessionVersion: { increment: 1 }
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

    await tx.emailChangeToken.update({
      where: { id: emailChangeToken.id },
      data: { usedAt: now }
    });

    await tx.emailChangeToken.updateMany({
      where: {
        userId: emailChangeToken.userId,
        usedAt: null
      },
      data: { usedAt: now }
    });

    return updated;
  });

  const changedAt = now.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  void Promise.allSettled([
    sendEmailChangedEmail({
      to: previousEmail,
      fullName: updatedUser.fullName,
      previousEmail,
      newEmail: updatedUser.email,
      changedAt,
      senderUserId: updatedUser.id
    }),
    sendEmailChangedEmail({
      to: updatedUser.email,
      fullName: updatedUser.fullName,
      previousEmail,
      newEmail: updatedUser.email,
      changedAt,
      senderUserId: updatedUser.id
    })
  ]);

  const cookieStore = await cookies();
  const currentSession = await verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  const signedInAsUpdatedUser = currentSession?.userId === updatedUser.id;

  const destination = signedInAsUpdatedUser ? "/settings?view=profile&account=email-change-success" : "/login?email-change=success";
  const response = NextResponse.redirect(await buildAppUrl(destination));

  if (signedInAsUpdatedUser) {
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
  }

  return response;
}

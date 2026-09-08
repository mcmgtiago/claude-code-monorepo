import { z } from "zod";
import { NextResponse } from "next/server";
import { createSessionToken, PublicSessionUser, SESSION_COOKIE_NAME } from "@/lib/auth";
import { verifyPassword } from "@/lib/auth-password";
import { isSmtpConfigured, sendSignInAlertEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

async function withSession(response: NextResponse, user: PublicSessionUser) {
  const token = await createSessionToken(
    {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      sessionVersion: user.sessionVersion,
      onboardingCompleted: user.onboardingCompleted ?? false,
      profileImageUrl: user.profileImageUrl ?? null
    },
    60 * 60 * 24 * 14
  );

  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14
  });

  return response;
}

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const payload = loginSchema.parse(raw);
    const email = payload.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        fullName: true,
        email: true,
        passwordHash: true,
        googleId: true,
        sessionVersion: true,
        onboardingCompleted: true,
        profileImageUrl: true,
        status: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    if (user.status === "SUSPENDED") {
      return NextResponse.json({ error: "This team account has been suspended." }, { status: 403 });
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        {
          error: user.googleId
            ? "This account is using Google sign-in only right now. Continue with Google, then create a password from Settings if you also want email login."
            : "Invalid email or password.",
          code: user.googleId ? "PASSWORD_NOT_SET" : "INVALID_CREDENTIALS"
        },
        { status: 401 }
      );
    }

    if (!(await verifyPassword(payload.password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid email or password.", code: "INVALID_CREDENTIALS" }, { status: 401 });
    }

    const now = new Date();
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: now }
    });

    if (await isSmtpConfigured()) {
      void sendSignInAlertEmail({
        to: user.email,
        fullName: user.fullName,
        signedInAt: now.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
      });
    }

    return withSession(
      NextResponse.json({
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email
        }
      }),
      user
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid login payload", issues: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to sign in" }, { status: 500 });
  }
}

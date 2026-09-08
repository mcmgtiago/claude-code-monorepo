import { z } from "zod";
import { NextResponse } from "next/server";
import { createRandomToken, hashToken } from "@/lib/auth-password";
import { getAppBaseUrl } from "@/lib/app-url";
import { isSmtpConfigured, sendPasswordResetEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

const forgotPasswordSchema = z.object({
  email: z.string().email()
});

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const payload = forgotPasswordSchema.parse(raw);
    const email = payload.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        fullName: true,
        email: true
      }
    });

    if (!user) {
      return NextResponse.json({ ok: true });
    }

    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null
      },
      data: {
        usedAt: new Date()
      }
    });

    const resetToken = createRandomToken(24);
    const resetUrl = new URL("/reset-password", await getAppBaseUrl());
    resetUrl.searchParams.set("token", resetToken);

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(resetToken),
        expiresAt: new Date(Date.now() + 1000 * 60 * 30)
      }
    });

    if (await isSmtpConfigured()) {
      await sendPasswordResetEmail({
        to: user.email,
        fullName: user.fullName,
        resetUrl: resetUrl.toString()
      });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({
      ok: true,
      previewUrl: process.env.NODE_ENV === "production" ? undefined : resetUrl.toString()
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid forgot password payload", issues: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to start password reset" }, { status: 500 });
  }
}

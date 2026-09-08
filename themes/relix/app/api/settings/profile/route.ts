import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { buildAppUrl } from "@/lib/app-url";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { createRandomToken, hashToken } from "@/lib/auth-password";
import { sendDeletedEmail, sendEmailChangeVerificationEmail } from "@/lib/account-lifecycle-email";
import { getCurrentUser } from "@/lib/auth-server";
import { isSmtpConfigured } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { removeLegacyProfileImage } from "@/lib/profile-images";

const profileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().optional().default(""),
  title: z.string().optional().default(""),
  email: z.string().email()
});

const deleteAccountSchema = z.object({
  confirmText: z.literal("DELETE")
});

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ")
  };
}

function isMissingEmailChangeTokenTableError(error: unknown) {
  return (
    (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") ||
    (error instanceof Error && /emailchangetoken|email_change_token/i.test(error.message))
  );
}

async function findPendingEmailChange(userId: string) {
  try {
    return await prisma.emailChangeToken.findFirst({
      where: {
        userId,
        usedAt: null,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: "desc" },
      select: { newEmail: true }
    });
  } catch (error) {
    if (isMissingEmailChangeTokenTableError(error)) {
      return null;
    }

    throw error;
  }
}

function buildProfileResponse(
  user: {
    fullName: string;
    email: string;
    jobRole: string | null;
    profileImageUrl: string | null;
    passwordHash: string | null;
    googleId: string | null;
  },
  pendingEmail?: string | null
) {
  const name = splitFullName(user.fullName);

  return {
    firstName: name.firstName,
    lastName: name.lastName,
    title: user.jobRole || "",
    email: user.email,
    profileImageUrl: user.profileImageUrl || "",
    hasPassword: Boolean(user.passwordHash),
    googleConnected: Boolean(user.googleId),
    pendingEmail: pendingEmail || ""
  };
}

export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [user, pendingChange] = await Promise.all([
    prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        fullName: true,
        email: true,
        jobRole: true,
        profileImageUrl: true,
        passwordHash: true,
        googleId: true
      }
    }),
    findPendingEmailChange(currentUser.id)
  ]);

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  return Response.json(buildProfileResponse(user, pendingChange?.newEmail || null), {
    headers: {
      "cache-control": "private, no-store, max-age=0"
    }
  });
}

export async function PUT(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const raw = await request.json();
    const payload = profileSchema.parse(raw);
    const nextEmail = payload.email.trim().toLowerCase();
    const fullName = `${payload.firstName.trim()} ${payload.lastName.trim()}`.trim();

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        jobRole: true,
        sessionVersion: true,
        profileImageUrl: true,
        passwordHash: true,
        googleId: true
      }
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const changingEmail = nextEmail !== user.email.toLowerCase();

    if (changingEmail) {
      const emailOwner = await prisma.user.findFirst({
        where: {
          email: nextEmail,
          id: { not: currentUser.id }
        },
        select: { id: true }
      });

      if (emailOwner) {
        return Response.json({ error: "Another account already uses this email." }, { status: 409 });
      }

      if (!(await isSmtpConfigured()) && process.env.NODE_ENV === "production") {
        return Response.json({ error: "Email sending is not configured for verified email changes." }, { status: 400 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        fullName,
        ...(changingEmail ? {} : { email: nextEmail }),
        jobRole: payload.title.trim() || null
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        jobRole: true,
        sessionVersion: true,
        profileImageUrl: true,
        passwordHash: true,
        googleId: true
      }
    });

    let pendingEmail: string | null = null;
    let previewUrl: string | undefined;
    let emailChangeRequested = false;

    if (changingEmail) {
      pendingEmail = nextEmail;
      emailChangeRequested = true;

      await prisma.emailChangeToken.deleteMany({
        where: {
          userId: user.id,
          usedAt: null
        }
      });

      const rawToken = createRandomToken(24);
      const verificationUrl = new URL(await buildAppUrl("/api/settings/profile/email-change/verify"));
      verificationUrl.searchParams.set("token", rawToken);

      await prisma.emailChangeToken.create({
        data: {
          userId: user.id,
          newEmail: nextEmail,
          tokenHash: hashToken(rawToken),
          expiresAt: new Date(Date.now() + 1000 * 60 * 30)
        }
      });

      if (await isSmtpConfigured()) {
        await sendEmailChangeVerificationEmail({
          to: nextEmail,
          fullName: updatedUser.fullName,
          newEmail: nextEmail,
          verificationUrl: verificationUrl.toString(),
          senderUserId: user.id
        });
      } else if (process.env.NODE_ENV !== "production") {
        previewUrl = verificationUrl.toString();
      }
    }

    const response = NextResponse.json({
      ...buildProfileResponse(updatedUser, pendingEmail),
      emailChangeRequested,
      previewUrl
    });

    const sessionToken = await createSessionToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      sessionVersion: updatedUser.sessionVersion,
      onboardingCompleted: currentUser.onboardingCompleted,
      profileImageUrl: updatedUser.profileImageUrl ?? null
    });

    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 14
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid account info", issues: error.issues }, { status: 400 });
    }

    return Response.json({ error: error instanceof Error ? error.message : "Unable to save account info" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const raw = await request.json().catch(() => ({}));
    deleteAccountSchema.parse(raw);

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        profileImageUrl: true,
        accessRole: true,
        workspaceName: true
      }
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      if (user.accessRole === "SUPERUSER") {
        const otherActiveSuperuserCount = await tx.user.count({
          where: {
            id: { not: user.id },
            status: "ACTIVE",
            accessRole: "SUPERUSER"
          }
        });

        if (otherActiveSuperuserCount === 0) {
          throw new Error("Create another active superuser before deleting this account.");
        }
      }

      if (user.accessRole === "ADMIN") {
        const otherActivePrivilegedCount = await tx.user.count({
          where: {
            id: { not: user.id },
            status: "ACTIVE",
            accessRole: {
              in: ["SUPERUSER", "ADMIN"]
            }
          }
        });

        if (otherActivePrivilegedCount === 0) {
          const promotionCandidate = await tx.user.findFirst({
            where: {
              id: { not: user.id },
              status: "ACTIVE"
            },
            orderBy: { createdAt: "asc" },
            select: { id: true }
          });

          if (promotionCandidate) {
            await tx.user.update({
              where: { id: promotionCandidate.id },
              data: { accessRole: "ADMIN" }
            });
          }
        }
      }

      await tx.user.delete({
        where: { id: user.id }
      });
    });

    await removeLegacyProfileImage(user.profileImageUrl);
    await Promise.allSettled([
      sendDeletedEmail({
        to: user.email,
        fullName: user.fullName,
        changedByName: user.fullName,
        workspaceName: user.workspaceName,
        senderUserId: currentUser.id
      })
    ]);

    const response = NextResponse.json({ ok: true, redirectTo: "/login" });
    response.cookies.set(SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Confirm account deletion by typing DELETE.", issues: error.issues }, { status: 400 });
    }

    if (error instanceof Error && error.message.includes("Create another active superuser")) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({ error: error instanceof Error ? error.message : "Unable to delete account" }, { status: 500 });
  }
}

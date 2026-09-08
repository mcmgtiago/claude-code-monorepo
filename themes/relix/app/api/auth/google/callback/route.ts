import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildAppUrl } from "@/lib/app-url";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import {
  exchangeGoogleLoginCode,
  GOOGLE_AUTH_NEXT_COOKIE,
  GOOGLE_AUTH_STATE_COOKIE
} from "@/lib/google-auth";
import { hasGoogleMailScope } from "@/lib/google-mail";
import { prisma } from "@/lib/prisma";

const SESSION_MAX_AGE = 60 * 60 * 24 * 14;

function clearOAuthCookies(response: NextResponse) {
  const expired = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
    path: "/"
  };
  response.cookies.set({ name: GOOGLE_AUTH_STATE_COOKIE, value: "", ...expired });
  response.cookies.set({ name: GOOGLE_AUTH_NEXT_COOKIE, value: "", ...expired });
  return response;
}

function getScopeTokens(scope: string | null | undefined) {
  return String(scope || "")
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const cookieStore = await cookies();
  const storedState = cookieStore.get(GOOGLE_AUTH_STATE_COOKIE)?.value;
  const next = cookieStore.get(GOOGLE_AUTH_NEXT_COOKIE)?.value || "/";

  const redirectError = async (reason: string) =>
    clearOAuthCookies(NextResponse.redirect(await buildAppUrl(`/login?error=${reason}`)));

  if (error) {
    return redirectError("google-denied");
  }
  if (!code || !state || !storedState || state !== storedState) {
    return redirectError("google-invalid");
  }

  try {
    const googleUser = await exchangeGoogleLoginCode(code);
    const email = googleUser.email.toLowerCase();

    // Find by googleId first, then by email
    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId: googleUser.sub }, { email }] },
      select: {
        id: true,
        fullName: true,
        email: true,
        googleId: true,
        profileImageUrl: true,
        sessionVersion: true,
        onboardingCompleted: true,
        status: true
      }
    });

    if (user) {
      if (user.status === "SUSPENDED") {
        return redirectError("suspended");
      }

      // Link googleId + update profile picture if not set
      await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: user.googleId ?? googleUser.sub,
          profileImageUrl: user.profileImageUrl || googleUser.picture || null,
          lastActiveAt: new Date()
        }
      });
    } else {
      // Create new user via Google sign-up
      user = await prisma.user.create({
        data: {
          fullName: googleUser.name,
          email,
          googleId: googleUser.sub,
          profileImageUrl: googleUser.picture || null,
          sessionVersion: 1,
          status: "ACTIVE"
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          googleId: true,
          profileImageUrl: true,
          sessionVersion: true,
          onboardingCompleted: true,
          status: true
        }
      });
    }

    if (hasGoogleMailScope(googleUser.grantedScope)) {
      const existingConnection = await prisma.googleCalendarConnection.findUnique({
        where: { userId: user.id }
      });
      const refreshToken = googleUser.refreshToken || existingConnection?.refreshToken;

      if (refreshToken) {
        const mergedScope = Array.from(new Set([...getScopeTokens(existingConnection?.scope), ...getScopeTokens(googleUser.grantedScope)])).join(" ");

        await prisma.googleCalendarConnection.upsert({
          where: { userId: user.id },
          update: {
            googleEmail: email,
            accessToken: googleUser.accessToken,
            refreshToken,
            scope: mergedScope || googleUser.grantedScope || existingConnection?.scope || null,
            tokenType: googleUser.tokenType || existingConnection?.tokenType || "Bearer",
            accessTokenExpiresAt: googleUser.accessTokenExpiresAt
          },
          create: {
            userId: user.id,
            googleEmail: email,
            accessToken: googleUser.accessToken,
            refreshToken,
            scope: mergedScope || googleUser.grantedScope || null,
            tokenType: googleUser.tokenType || "Bearer",
            accessTokenExpiresAt: googleUser.accessTokenExpiresAt
          }
        });
      }
    }

    const token = await createSessionToken(
      {
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        sessionVersion: user.sessionVersion,
        onboardingCompleted: user.onboardingCompleted ?? false,
        profileImageUrl: user.profileImageUrl ?? null
      },
      SESSION_MAX_AGE
    );

    const destination = user.onboardingCompleted ? next : "/onboarding";
    const response = NextResponse.redirect(await buildAppUrl(destination));

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE
    });

    return clearOAuthCookies(response);
  } catch (err) {
    console.error("[Google OAuth] Callback error:", err instanceof Error ? err.message : err);
    return redirectError("google-error");
  }
}

import { NextResponse } from "next/server";
import { buildAppUrl } from "@/lib/app-url";
import {
  buildGoogleLoginUrl,
  GOOGLE_AUTH_NEXT_COOKIE,
  GOOGLE_AUTH_STATE_COOKIE,
  isGoogleAuthConfigured
} from "@/lib/google-auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") || "/";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  if (!(await isGoogleAuthConfigured())) {
    return NextResponse.redirect(await buildAppUrl("/login?error=google-not-configured"));
  }

  const state = crypto.randomUUID();
  const authUrl = await buildGoogleLoginUrl(state);
  const response = NextResponse.redirect(authUrl);

  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10,
    path: "/"
  };

  response.cookies.set({ name: GOOGLE_AUTH_STATE_COOKIE, value: state, ...cookieOptions });
  response.cookies.set({ name: GOOGLE_AUTH_NEXT_COOKIE, value: safeNext, ...cookieOptions });

  return response;
}

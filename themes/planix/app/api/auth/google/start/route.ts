import { NextRequest, NextResponse } from "next/server";

import {
  GOOGLE_LOCAL_AUTH_STATE_COOKIE,
  createGoogleAuthState,
  getGoogleCallbackUrl,
  getGoogleClientId,
  isLocalGoogleAuthEnabled,
  normalizeAuthNextPath,
} from "@/lib/google-auth";

export async function GET(request: NextRequest) {
  const nextPath = normalizeAuthNextPath(request.nextUrl.searchParams.get("next"), "/dashboard");

  if (!(await isLocalGoogleAuthEnabled())) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("Local Google auth is not configured.")}`, request.nextUrl.origin));
  }

  const state = createGoogleAuthState(nextPath);
  const redirectUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

  redirectUrl.searchParams.set("client_id", await getGoogleClientId());
  redirectUrl.searchParams.set("redirect_uri", getGoogleCallbackUrl(request.nextUrl.origin));
  redirectUrl.searchParams.set("response_type", "code");
  redirectUrl.searchParams.set("scope", "openid email profile");
  redirectUrl.searchParams.set("prompt", "select_account");
  redirectUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(redirectUrl);

  response.cookies.set(GOOGLE_LOCAL_AUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });

  return response;
}

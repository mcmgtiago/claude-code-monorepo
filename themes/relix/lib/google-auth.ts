import "server-only";

import { buildAppUrl } from "@/lib/app-url";
import { getPlatformSettings, isPlatformGoogleConfigured } from "@/lib/platform-settings";

export const GOOGLE_AUTH_STATE_COOKIE = "google_auth_state";
export const GOOGLE_AUTH_NEXT_COOKIE = "google_auth_next";

const GOOGLE_AUTH_SCOPE = "openid email profile https://mail.google.com/";

type GoogleTokenResponse = {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
};

export type GoogleUserInfo = {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  email_verified?: boolean;
};

export type GoogleLoginResult = GoogleUserInfo & {
  accessToken: string;
  accessTokenExpiresAt: Date | null;
  grantedScope: string;
  refreshToken?: string | null;
  tokenType?: string | null;
};

async function getGoogleAuthConfig() {
  const platform = await getPlatformSettings();
  const clientId = platform.googleClientId;
  const clientSecret = platform.googleClientSecret;

  if (!clientId || !clientSecret) {
    throw new Error("Google login is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.");
  }

  return {
    clientId,
    clientSecret,
    redirectUri: await buildAppUrl("/api/auth/google/callback")
  };
}

export async function isGoogleAuthConfigured() {
  return isPlatformGoogleConfigured(await getPlatformSettings());
}

export async function buildGoogleLoginUrl(state: string) {
  const { clientId, redirectUri } = await getGoogleAuthConfig();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "offline",
    include_granted_scopes: "true",
    prompt: "consent",
    scope: GOOGLE_AUTH_SCOPE,
    state
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleLoginCode(code: string): Promise<GoogleLoginResult> {
  const { clientId, clientSecret, redirectUri } = await getGoogleAuthConfig();

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri
    })
  });

  const tokens = (await tokenResponse.json().catch(() => null)) as GoogleTokenResponse | null;

  if (!tokenResponse.ok || !tokens?.access_token) {
    throw new Error(tokens?.error_description || tokens?.error || "Failed to exchange Google authorization code.");
  }

  const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
    cache: "no-store"
  });

  const userInfo = (await userInfoResponse.json().catch(() => null)) as GoogleUserInfo | null;

  if (!userInfoResponse.ok || !userInfo?.sub || !userInfo?.email) {
    throw new Error("Failed to fetch Google account information.");
  }

  return {
    ...userInfo,
    accessToken: tokens.access_token,
    accessTokenExpiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
    grantedScope: tokens.scope || "",
    refreshToken: tokens.refresh_token || null,
    tokenType: tokens.token_type || null
  };
}

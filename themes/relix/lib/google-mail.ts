import "server-only";

import { buildAppUrl } from "@/lib/app-url";
import { hasGoogleCalendarScope } from "@/lib/google-calendar";
import { getPlatformSettings, isPlatformGoogleConfigured } from "@/lib/platform-settings";
import { prisma } from "@/lib/prisma";

export const GOOGLE_MAIL_STATE_COOKIE = "email_google_oauth_state";
export const GOOGLE_MAIL_RETURN_TO_COOKIE = "email_google_oauth_return_to";
const GOOGLE_MAIL_SCOPE = ["https://mail.google.com/", "https://www.googleapis.com/auth/userinfo.email"].join(" ");

type GoogleTokenResponse = {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
};

type GoogleApiError = {
  error?: {
    code?: number;
    message?: string;
  };
  error_description?: string;
};

async function getGoogleMailConfig() {
  const platform = await getPlatformSettings();
  const clientId = platform.googleClientId;
  const clientSecret = platform.googleClientSecret;

  if (!clientId || !clientSecret) {
    throw new Error("Google Mail is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET first.");
  }

  return {
    clientId,
    clientSecret,
    redirectUri: await buildAppUrl("/api/email/google/callback")
  };
}

function getGoogleError(payload: GoogleTokenResponse | GoogleApiError | null, fallback: string) {
  if (!payload) {
    return fallback;
  }

  if ("error" in payload && typeof payload.error === "string") {
    return payload.error_description || payload.error || fallback;
  }

  if ("error" in payload && payload.error && typeof payload.error === "object") {
    return payload.error.message || payload.error_description || fallback;
  }

  return payload.error_description || fallback;
}

async function readGoogleJson<T>(response: Response, fallbackMessage: string) {
  const payload = (await response.json().catch(() => null)) as T | GoogleTokenResponse | GoogleApiError | null;

  if (!response.ok) {
    throw new Error(getGoogleError(payload as GoogleTokenResponse | GoogleApiError | null, fallbackMessage));
  }

  return payload as T;
}

async function requestGoogleTokens(body: URLSearchParams, fallbackMessage: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    body
  });

  return readGoogleJson<GoogleTokenResponse>(response, fallbackMessage);
}

async function fetchGoogleUserEmail(accessToken: string) {
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    cache: "no-store"
  });

  const payload = (await response.json().catch(() => null)) as { email?: string } | GoogleApiError | null;

  if (!response.ok) {
    throw new Error(getGoogleError(payload as GoogleApiError | null, "Unable to read the Google account email."));
  }

  return payload && "email" in payload ? payload.email || null : null;
}

function getScopeTokens(scope: string | null | undefined) {
  return String(scope || "")
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function hasGoogleMailScope(scope: string | null | undefined) {
  return getScopeTokens(scope).includes("https://mail.google.com/");
}

export async function isGoogleMailConfigured() {
  return isPlatformGoogleConfigured(await getPlatformSettings());
}

export async function buildGoogleMailAuthUrl(state: string) {
  const { clientId, redirectUri } = await getGoogleMailConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "offline",
    include_granted_scopes: "true",
    prompt: "consent",
    scope: GOOGLE_MAIL_SCOPE,
    state
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function findAnyGoogleMailConnectionByUserId(userId: string) {
  const connection = await prisma.googleCalendarConnection.findUnique({
    where: { userId }
  });

  if (!connection || !connection.googleEmail || !connection.refreshToken) {
    return null;
  }

  return connection;
}

export async function findGoogleMailConnectionByUserId(userId: string) {
  const connection = await findAnyGoogleMailConnectionByUserId(userId);

  if (!connection || !hasGoogleMailScope(connection.scope)) {
    return null;
  }

  return connection;
}

export async function exchangeGoogleMailCode(code: string, userId: string, fallbackEmail: string) {
  const { clientId, clientSecret, redirectUri } = await getGoogleMailConfig();
  const tokens = await requestGoogleTokens(
    new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri
    }),
    "Unable to connect Gmail."
  );

  if (!tokens.access_token) {
    throw new Error("Google Mail did not return an access token.");
  }

  const existingConnection = await prisma.googleCalendarConnection.findUnique({
    where: { userId }
  });
  const googleEmail = (await fetchGoogleUserEmail(tokens.access_token).catch(() => null)) || existingConnection?.googleEmail || fallbackEmail;
  const refreshToken = tokens.refresh_token || existingConnection?.refreshToken;

  if (!refreshToken) {
    throw new Error("Google Mail did not return a refresh token. Try connecting again and approve access.");
  }

  const accessTokenExpiresAt = tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null;
  const mergedScope = Array.from(new Set([...getScopeTokens(existingConnection?.scope), ...getScopeTokens(tokens.scope), ...getScopeTokens(GOOGLE_MAIL_SCOPE)])).join(" ");

  return prisma.googleCalendarConnection.upsert({
    where: { userId },
    update: {
      googleEmail,
      accessToken: tokens.access_token,
      refreshToken,
      scope: mergedScope || tokens.scope || existingConnection?.scope || GOOGLE_MAIL_SCOPE,
      tokenType: tokens.token_type || existingConnection?.tokenType || "Bearer",
      accessTokenExpiresAt
    },
    create: {
      userId,
      googleEmail,
      accessToken: tokens.access_token,
      refreshToken,
      scope: mergedScope || tokens.scope || GOOGLE_MAIL_SCOPE,
      tokenType: tokens.token_type || "Bearer",
      accessTokenExpiresAt
    }
  });
}

async function refreshGoogleMailAccessToken(connection: NonNullable<Awaited<ReturnType<typeof prisma.googleCalendarConnection.findUnique>>>) {
  const { clientId, clientSecret } = await getGoogleMailConfig();
  const tokens = await requestGoogleTokens(
    new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: connection.refreshToken,
      grant_type: "refresh_token"
    }),
    "Unable to refresh Gmail access."
  );

  if (!tokens.access_token) {
    throw new Error("Google Mail did not return a fresh access token.");
  }

  const accessTokenExpiresAt = tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null;
  const mergedScope = Array.from(new Set([...getScopeTokens(connection.scope), ...getScopeTokens(tokens.scope)])).join(" ");

  return prisma.googleCalendarConnection.update({
    where: { id: connection.id },
    data: {
      accessToken: tokens.access_token,
      scope: mergedScope || connection.scope,
      tokenType: tokens.token_type || connection.tokenType,
      accessTokenExpiresAt
    }
  });
}

export async function getFreshGoogleMailConnectionByUserId(userId: string) {
  const connection = await findGoogleMailConnectionByUserId(userId);

  if (!connection) {
    return null;
  }

  let activeConnection = connection;

  if (!activeConnection.accessToken || !activeConnection.accessTokenExpiresAt || activeConnection.accessTokenExpiresAt.getTime() <= Date.now() + 60_000) {
    activeConnection = await refreshGoogleMailAccessToken(connection);
  }

  if (!activeConnection.accessToken) {
    throw new Error("Google Mail access could not be refreshed.");
  }

  const { clientId, clientSecret } = await getGoogleMailConfig();

  return {
    connection: activeConnection,
    accessToken: activeConnection.accessToken,
    clientId,
    clientSecret
  };
}

export async function disconnectGoogleMailConnection(userId: string) {
  const connection = await prisma.googleCalendarConnection.findUnique({
    where: { userId }
  });

  if (!connection) {
    return { disconnected: false, calendarStillConnected: false };
  }

  const nextScopeTokens = getScopeTokens(connection.scope).filter((token) => token !== "https://mail.google.com/");
  const nextScope = nextScopeTokens.join(" ");
  const calendarStillConnected = hasGoogleCalendarScope(nextScope);

  if (!nextScope) {
    await prisma.googleCalendarConnection.delete({
      where: { userId }
    });

    return {
      disconnected: true,
      calendarStillConnected: false
    };
  }

  await prisma.googleCalendarConnection.update({
    where: { userId },
    data: {
      scope: nextScope
    }
  });

  return {
    disconnected: true,
    calendarStillConnected
  };
}

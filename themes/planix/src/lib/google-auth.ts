import { getConfiguredAppUrl } from "@/lib/app-url";
import {
  getAppServiceSettings,
  isLocalGoogleAuthConfigured,
} from "@/lib/app-config";

export const GOOGLE_LOCAL_AUTH_STATE_COOKIE = "__planix_google_auth_state";

type GoogleAuthState = {
  nextPath: string;
  nonce: string;
};

export function normalizeAuthNextPath(value: string | null, fallback: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}

export async function isLocalGoogleAuthEnabled() {
  const services = await getAppServiceSettings();
  return isLocalGoogleAuthConfigured(services);
}

export async function getGoogleClientId() {
  const services = await getAppServiceSettings();
  const value = services.googleClientId.trim();

  if (!value) {
    throw new Error("Missing required environment variable: NEXT_PUBLIC_GOOGLE_CLIENT_ID");
  }

  return value;
}

export async function getGoogleClientSecret() {
  const services = await getAppServiceSettings();
  const value = services.googleClientSecret.trim();

  if (!value) {
    throw new Error("Missing required environment variable: GOOGLE_CLIENT_SECRET");
  }

  return value;
}

export function getGoogleCallbackUrl(fallbackOrigin?: string) {
  return new URL("/auth/google/callback", getConfiguredAppUrl(fallbackOrigin)).toString();
}

export function createGoogleAuthState(nextPath: string) {
  return Buffer.from(
    JSON.stringify({
      nextPath: normalizeAuthNextPath(nextPath, "/dashboard"),
      nonce: crypto.randomUUID(),
    } satisfies GoogleAuthState),
    "utf8",
  ).toString("base64url");
}

export function readGoogleAuthState(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Partial<GoogleAuthState>;

    if (typeof parsed.nonce !== "string" || typeof parsed.nextPath !== "string") {
      return null;
    }

    return {
      nonce: parsed.nonce,
      nextPath: normalizeAuthNextPath(parsed.nextPath, "/dashboard"),
    } satisfies GoogleAuthState;
  } catch {
    return null;
  }
}

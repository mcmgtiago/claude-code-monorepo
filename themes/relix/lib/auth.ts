export const SESSION_COOKIE_NAME = "nectra_session";

type SessionPayload = {
  userId: string;
  email: string;
  fullName: string;
  sessionVersion: number;
  onboardingCompleted?: boolean;
  profileImageUrl?: string | null;
  exp: number;
};

function getSessionSecret() {
  const value = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "";
  if (!value) {
    throw new Error("Authentication secret is not configured.");
  }

  return value;
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);

  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function signValue(value: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(getSessionSecret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));

  return toBase64Url(new Uint8Array(signature));
}

function encodePayload(payload: SessionPayload) {
  return toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
}

function decodePayload(value: string) {
  try {
    return JSON.parse(new TextDecoder().decode(fromBase64Url(value))) as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSessionToken(payload: Omit<SessionPayload, "exp">, maxAgeSeconds = 60 * 60 * 24 * 14) {
  const sessionPayload: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + maxAgeSeconds
  };
  const encodedPayload = encodePayload(sessionPayload);
  const signature = await signValue(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(token: string | undefined | null) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = await signValue(encodedPayload);
  if (expectedSignature !== signature) {
    return null;
  }

  const payload = decodePayload(encodedPayload);
  if (!payload || payload.exp <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

export type PublicSessionUser = {
  id: string;
  fullName: string;
  email: string;
  sessionVersion: number;
  onboardingCompleted?: boolean;
  profileImageUrl?: string | null;
};

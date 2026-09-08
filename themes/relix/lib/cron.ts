import { timingSafeEqual } from "node:crypto";

function readCronSecret() {
  const secret = process.env.CRON_SECRET?.trim();
  return secret && secret.length > 0 ? secret : null;
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function isCronSecretConfigured() {
  return Boolean(readCronSecret());
}

export function isAuthorizedCronRequest(request: Request) {
  const secret = readCronSecret();

  if (!secret) {
    return false;
  }

  const authorizationHeader = request.headers.get("authorization");
  const providedBearerToken = authorizationHeader?.startsWith("Bearer ") ? authorizationHeader.slice("Bearer ".length).trim() : null;
  const providedHeaderSecret = request.headers.get("x-cron-secret")?.trim() || null;
  const providedQuerySecret = new URL(request.url).searchParams.get("secret")?.trim() || null;

  return [providedBearerToken, providedHeaderSecret, providedQuerySecret].some((candidate) => {
    return candidate ? safeCompare(candidate, secret) : false;
  });
}

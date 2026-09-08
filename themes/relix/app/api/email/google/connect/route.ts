import { NextResponse } from "next/server";
import { buildAppUrl } from "@/lib/app-url";
import { requireUser } from "@/lib/auth-server";
import { buildGoogleMailAuthUrl, GOOGLE_MAIL_RETURN_TO_COOKIE, GOOGLE_MAIL_STATE_COOKIE, isGoogleMailConfigured } from "@/lib/google-mail";

const RETURN_URL = "/settings?view=mailbox";

function normalizeReturnTo(value: string | null) {
  if (!value || !value.startsWith("/settings") || value.startsWith("//")) {
    return null;
  }

  return value;
}

async function buildReturnUrl(status: string, returnTo: string | null) {
  const target = returnTo || RETURN_URL;
  const separator = target.includes("?") ? "&" : "?";
  return buildAppUrl(`${target}${separator}mailSetup=${status}`);
}

export async function GET(request: Request) {
  await requireUser();
  const url = new URL(request.url);
  const returnTo = normalizeReturnTo(url.searchParams.get("returnTo"));

  if (!(await isGoogleMailConfigured())) {
    return NextResponse.redirect(await buildReturnUrl("google-missing-config", returnTo));
  }

  const state = crypto.randomUUID();
  const response = NextResponse.redirect(await buildGoogleMailAuthUrl(state));

  response.cookies.set({
    name: GOOGLE_MAIL_STATE_COOKIE,
    value: state,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10,
    path: "/"
  });
  response.cookies.set({
    name: GOOGLE_MAIL_RETURN_TO_COOKIE,
    value: returnTo || "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10,
    path: "/"
  });

  return response;
}

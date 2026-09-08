import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildAppUrl } from "@/lib/app-url";
import { requireUser } from "@/lib/auth-server";
import { exchangeGoogleMailCode, GOOGLE_MAIL_RETURN_TO_COOKIE, GOOGLE_MAIL_STATE_COOKIE, isGoogleMailConfigured } from "@/lib/google-mail";

const RETURN_URL = "/settings?view=mailbox";
const ERROR_PARAM = "mailSetupError";

function normalizeReturnTo(value: string | undefined) {
  if (!value || !value.startsWith("/settings") || value.startsWith("//")) {
    return null;
  }

  return value;
}

async function buildReturnUrl(status: string, returnTo: string | null, errorMessage?: string | null) {
  const target = returnTo || RETURN_URL;
  const separator = target.includes("?") ? "&" : "?";
  const params = new URLSearchParams({ mailSetup: status });

  if (errorMessage) {
    params.set(ERROR_PARAM, errorMessage);
  }

  return buildAppUrl(`${target}${separator}${params.toString()}`);
}

export async function GET(request: Request) {
  const currentUser = await requireUser();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const cookieStore = await cookies();
  const storedState = cookieStore.get(GOOGLE_MAIL_STATE_COOKIE)?.value;
  const returnTo = normalizeReturnTo(cookieStore.get(GOOGLE_MAIL_RETURN_TO_COOKIE)?.value);

  const clearCookieResponse = async (status: string, errorMessage?: string | null) => {
    const response = NextResponse.redirect(await buildReturnUrl(status, returnTo, errorMessage));
    response.cookies.set({
      name: GOOGLE_MAIL_STATE_COOKIE,
      value: "",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0),
      path: "/"
    });
    response.cookies.set({
      name: GOOGLE_MAIL_RETURN_TO_COOKIE,
      value: "",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0),
      path: "/"
    });
    return response;
  };

  if (!(await isGoogleMailConfigured())) {
    return clearCookieResponse("google-missing-config");
  }

  if (error) {
    return clearCookieResponse("google-denied");
  }

  if (!code || !state || !storedState || state !== storedState) {
    return clearCookieResponse("google-invalid-state");
  }

  try {
    await exchangeGoogleMailCode(code, currentUser.id, currentUser.email);
    return clearCookieResponse("google-connected");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to connect Gmail.";
    return clearCookieResponse("google-error", message);
  }
}

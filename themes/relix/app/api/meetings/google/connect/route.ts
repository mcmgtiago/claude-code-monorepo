import { NextResponse } from "next/server";
import { buildAppUrl } from "@/lib/app-url";
import { requireUser } from "@/lib/auth-server";
import { buildGoogleCalendarAuthUrl, GOOGLE_CALENDAR_RETURN_TO_COOKIE, GOOGLE_CALENDAR_STATE_COOKIE, isGoogleCalendarConfigured } from "@/lib/google-calendar";

const RETURN_URL = "/meetings?tab=availability&mode=setup";

function normalizeReturnTo(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
}

async function buildReturnUrl(status: string, returnTo: string | null) {
  if (returnTo?.startsWith("/settings")) {
    const separator = returnTo.includes("?") ? "&" : "?";
    return buildAppUrl(`${returnTo}${separator}integrationSetup=google-meet-${status}`);
  }

  return buildAppUrl(`${RETURN_URL}&meetingSetup=google-${status}`);
}

export async function GET(request: Request) {
  await requireUser();
  const url = new URL(request.url);
  const returnTo = normalizeReturnTo(url.searchParams.get("returnTo"));

  if (!(await isGoogleCalendarConfigured())) {
    return NextResponse.redirect(await buildReturnUrl("missing-config", returnTo));
  }

  const state = crypto.randomUUID();
  const response = NextResponse.redirect(await buildGoogleCalendarAuthUrl(state));

  response.cookies.set({
    name: GOOGLE_CALENDAR_STATE_COOKIE,
    value: state,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10,
    path: "/"
  });
  response.cookies.set({
    name: GOOGLE_CALENDAR_RETURN_TO_COOKIE,
    value: returnTo || "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10,
    path: "/"
  });

  return response;
}

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildAppUrl } from "@/lib/app-url";
import { requireWorkspaceContext } from "@/lib/workspace";
import {
  applyGoogleMeetConnectionStatus,
  exchangeGoogleCalendarCode,
  GOOGLE_CALENDAR_RETURN_TO_COOKIE,
  GOOGLE_CALENDAR_STATE_COOKIE,
  isGoogleCalendarConfigured
} from "@/lib/google-calendar";
import { prisma } from "@/lib/prisma";

const RETURN_URL = "/meetings?tab=availability&mode=setup";
const ERROR_PARAM = "meetingSetupError";

function normalizeReturnTo(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
}

async function buildReturnUrl(status: string, returnTo: string | null, errorMessage?: string | null) {
  if (returnTo?.startsWith("/settings")) {
    const separator = returnTo.includes("?") ? "&" : "?";
    const params = new URLSearchParams({ integrationSetup: `google-meet-${status}` });

    if (errorMessage) {
      params.set(ERROR_PARAM, errorMessage);
    }

    return buildAppUrl(`${returnTo}${separator}${params.toString()}`);
  }

  const params = new URLSearchParams({ meetingSetup: `google-${status}` });

  if (errorMessage) {
    params.set(ERROR_PARAM, errorMessage);
  }

  return buildAppUrl(`${RETURN_URL}&${params.toString()}`);
}

export async function GET(request: Request) {
  const { user: currentUser, workspace } = await requireWorkspaceContext();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const cookieStore = await cookies();
  const storedState = cookieStore.get(GOOGLE_CALENDAR_STATE_COOKIE)?.value;
  const returnTo = normalizeReturnTo(cookieStore.get(GOOGLE_CALENDAR_RETURN_TO_COOKIE)?.value);

  const clearCookieResponse = async (status: string, errorMessage?: string | null) => {
    const response = NextResponse.redirect(await buildReturnUrl(status, returnTo, errorMessage));
    response.cookies.set({
      name: GOOGLE_CALENDAR_STATE_COOKIE,
      value: "",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0),
      path: "/"
    });
    response.cookies.set({
      name: GOOGLE_CALENDAR_RETURN_TO_COOKIE,
      value: "",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0),
      path: "/"
    });
    return response;
  };

  if (!(await isGoogleCalendarConfigured())) {
    return clearCookieResponse("missing-config");
  }

  if (error) {
    return clearCookieResponse("denied");
  }

  if (!code || !state || !storedState || state !== storedState) {
    return clearCookieResponse("invalid-state");
  }

  try {
    await exchangeGoogleCalendarCode(code, currentUser.id, currentUser.email);
    const preferences = await prisma.meetingPreference.upsert({
      where: { workspaceId: workspace.id },
      update: {},
      create: { workspaceId: workspace.id }
    });

    await applyGoogleMeetConnectionStatus(preferences, () => prisma.googleCalendarConnection.findUnique({ where: { userId: currentUser.id } }));
    return clearCookieResponse("connected");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to connect Google Calendar.";
    return clearCookieResponse("error", message);
  }
}

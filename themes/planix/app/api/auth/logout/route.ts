import { NextResponse } from "next/server";

import {
  DEMO_PROFILE_COOKIE_NAMES,
  DEMO_SESSION_COOKIE_NAMES,
  DEMO_SETTINGS_COOKIE_NAMES,
} from "@/lib/demo-session";

export async function POST() {
  const response = NextResponse.json({ ok: true });

  for (const cookieName of [...DEMO_SESSION_COOKIE_NAMES, ...DEMO_SETTINGS_COOKIE_NAMES, ...DEMO_PROFILE_COOKIE_NAMES]) {
    response.cookies.set(cookieName, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(0),
    });
  }

  return response;
}

import { NextResponse } from "next/server";

import { DEMO_SESSION_COOKIE_NAMES, DEMO_SESSION_VALUE } from "@/lib/demo-session";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
    nextPath?: string;
  };
  const email = body.email?.trim().toLowerCase() || "demo@planix.app";
  const password = body.password?.trim() || "demo-access";

  void password;

  const response = NextResponse.json({
    ok: true,
    signedIn: true,
    demo: true,
    workspaceReady: true,
    redirectPath: typeof body.nextPath === "string" && body.nextPath.startsWith("/") ? body.nextPath : "/dashboard",
    user: {
      email,
    },
  });

  for (const cookieName of DEMO_SESSION_COOKIE_NAMES) {
    response.cookies.set(cookieName, DEMO_SESSION_VALUE, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}

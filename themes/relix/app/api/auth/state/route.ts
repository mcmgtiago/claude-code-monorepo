import { NextResponse } from "next/server";
import { getSessionAccountState } from "@/lib/auth-server";

export async function GET() {
  const state = await getSessionAccountState();

  if (!state?.sessionUser) {
    return NextResponse.json(
      {
        authenticated: false,
        status: "SIGNED_OUT",
        redirectTo: "/login"
      },
      { status: 401 }
    );
  }

  if (state.account?.status === "SUSPENDED") {
    return NextResponse.json(
      {
        authenticated: false,
        status: "SUSPENDED",
        redirectTo: "/blocked"
      },
      { status: 403 }
    );
  }

  if (!state.account || !state.isSessionCurrent || state.account.status !== "ACTIVE") {
    return NextResponse.json(
      {
        authenticated: false,
        status: "UNAUTHORIZED",
        redirectTo: "/login"
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    status: state.account.status
  });
}

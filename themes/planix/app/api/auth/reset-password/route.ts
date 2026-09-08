import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { password?: string };

  if (!body.password?.trim()) {
    return NextResponse.json({ error: "New password is required." }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    message: "Password updated successfully.",
    redirectPath: "/dashboard",
  });
}

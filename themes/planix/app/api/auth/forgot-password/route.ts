import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: string };

  if (!body.email?.trim()) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    message: "Recovery email simulated. Continue to the reset screen in this template.",
  });
}

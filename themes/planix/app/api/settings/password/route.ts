import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  };

  if (!body.currentPassword?.trim() || !body.newPassword?.trim() || !body.confirmPassword?.trim()) {
    return NextResponse.json({ error: "All password fields are required." }, { status: 400 });
  }

  if (body.newPassword !== body.confirmPassword) {
    return NextResponse.json({ error: "New password and confirmation do not match." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

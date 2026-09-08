import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
  };

  if (!body.firstName?.trim() || !body.lastName?.trim() || !body.email?.trim() || !body.password?.trim()) {
    return NextResponse.json({ error: "First name, last name, email, and password are required." }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    signedIn: false,
    message: "Template account created. Use Login to enter the demo workspace.",
  });
}

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    currentDevice: {
      id: "current-session",
      device: "MacBook Pro · Chrome",
      location: "Current browser session",
      date: "Last verified just now",
      active: true,
      reported: false,
    },
  });
}

export async function POST() {
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    ok: true,
    mode: "demo",
    summary: {
      sent: 0,
      skipped: 0,
      duplicate: 0,
      failed: 0,
    },
  });
}

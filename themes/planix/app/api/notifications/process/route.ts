import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    ok: true,
    scope: "demo",
    result: {
      sent: 0,
      skipped: 0,
      duplicate: 0,
      failed: 0,
    },
  });
}

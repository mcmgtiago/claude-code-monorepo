import { NextResponse } from "next/server";

import type { ActivityItem } from "@/data/dashboard";
import { appendDemoActivity, getDemoActivity } from "@/lib/template-demo-store";

export async function GET() {
  return NextResponse.json({ ok: true, activity: getDemoActivity(), mode: "remote" });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { item?: ActivityItem };

  if (!body.item) {
    return NextResponse.json({ error: "Invalid activity item payload." }, { status: 400 });
  }

  return NextResponse.json({ ok: true, activity: appendDemoActivity(body.item), mode: "remote" });
}

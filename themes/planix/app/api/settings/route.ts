import { NextResponse } from "next/server";

import type { SettingsBundle } from "@/lib/settings";
import { getDemoSettings, updateDemoSettings } from "@/lib/template-demo-store";

export async function GET() {
  return NextResponse.json({ ok: true, settings: getDemoSettings(), mode: "remote" });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as Partial<SettingsBundle>;
  const settings = updateDemoSettings(body);
  return NextResponse.json({ ok: true, settings, mode: "remote" });
}

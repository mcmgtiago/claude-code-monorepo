import { NextResponse } from "next/server";

import { PLAN_SETTINGS_PRESETS } from "@/lib/settings";
import { getDemoSettings, updateDemoSettings } from "@/lib/template-demo-store";

export async function POST(request: Request) {
  const body = (await request.json()) as { planName?: string };
  const current = getDemoSettings();
  const planName = body.planName?.trim() || current.plan.name;
  const preset = PLAN_SETTINGS_PRESETS[planName as keyof typeof PLAN_SETTINGS_PRESETS] ?? PLAN_SETTINGS_PRESETS["Starter Plan"];
  const nextPlan = {
    ...current.plan,
    ...preset,
  };
  const settings = updateDemoSettings({ plan: nextPlan });
  return NextResponse.json({ ok: true, settings, mode: "remote" });
}

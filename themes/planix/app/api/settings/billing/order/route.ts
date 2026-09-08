import { NextResponse } from "next/server";

import { PLAN_SETTINGS_PRESETS } from "@/lib/settings";

export async function POST(request: Request) {
  const body = (await request.json()) as { planName?: string };
  const planName = body.planName?.trim() || "Starter Plan";
  const preset = PLAN_SETTINGS_PRESETS[planName as keyof typeof PLAN_SETTINGS_PRESETS];

  if (!preset) {
    return NextResponse.json({ error: "Plan name is required." }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    checkout: {
      keyId: "template_checkout_disabled",
      subscription: {
        id: `template-${planName.toLowerCase().replace(/\s+/g, "-")}`,
        status: "created",
      },
      plan: {
        name: preset.name,
        priceMonthly: preset.priceMonthly,
        currency: "USD",
      },
      prefill: {
        email: "demo@planix.app",
        name: "Ariana Cole",
        contact: "+14155550190",
      },
    },
  });
}

import { NextResponse } from "next/server";

import type { ProfileFormState } from "@/lib/profile";
import { getDemoProfile, updateDemoProfile } from "@/lib/template-demo-store";

export async function GET() {
  return NextResponse.json({ ok: true, profile: getDemoProfile(), mode: "remote" });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as Partial<ProfileFormState>;
  const profile = updateDemoProfile(body);
  return NextResponse.json({ ok: true, profile, mode: "remote" });
}

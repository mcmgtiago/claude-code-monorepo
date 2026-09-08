import { NextResponse } from "next/server";

import {
  getAuthenticatedSuperAdminUser,
  getSuperAdminDashboardData,
  type SuperAdminSettingsPatch,
  updateSuperAdminSettings,
} from "@/lib/super-admin";

export async function GET() {
  try {
    const user = await getAuthenticatedSuperAdminUser();

    if (!user) {
      return NextResponse.json({ error: "Super admin access required." }, { status: 403 });
    }

    const data = await getSuperAdminDashboardData();
    return NextResponse.json({ ok: true, settings: data.settings, secretStatus: data.secretStatus });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load admin settings." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const adminUser = await getAuthenticatedSuperAdminUser();

    if (!adminUser) {
      return NextResponse.json({ error: "Super admin access required." }, { status: 403 });
    }

    const body = (await request.json()) as SuperAdminSettingsPatch;
    const data = await updateSuperAdminSettings(adminUser, body);

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update admin settings." },
      { status: 500 },
    );
  }
}

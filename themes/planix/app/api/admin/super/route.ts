import { NextResponse } from "next/server";

import { getAuthenticatedSuperAdminUser, getSuperAdminDashboardData } from "@/lib/super-admin";

export async function GET() {
  try {
    const user = await getAuthenticatedSuperAdminUser();

    if (!user) {
      return NextResponse.json({ error: "Super admin access required." }, { status: 403 });
    }

    const data = await getSuperAdminDashboardData();

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load super admin dashboard." },
      { status: 500 },
    );
  }
}

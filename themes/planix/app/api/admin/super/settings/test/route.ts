import { NextResponse } from "next/server";

import { getAuthenticatedSuperAdminUser, testSuperAdminSmtpConnection } from "@/lib/super-admin";

export async function POST() {
  try {
    const adminUser = await getAuthenticatedSuperAdminUser();

    if (!adminUser) {
      return NextResponse.json({ error: "Super admin access required." }, { status: 403 });
    }

    const smtp = await testSuperAdminSmtpConnection(adminUser);
    return NextResponse.json({ ok: true, smtp });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "SMTP verification failed." },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";

import {
  deleteSuperAdminManagedUser,
  getAuthenticatedSuperAdminUser,
  updateSuperAdminManagedUser,
} from "@/lib/super-admin";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

type SuperAdminUserPatchBody = {
  name?: string;
  email?: string;
  jobTitle?: string;
  suspended?: boolean;
  suspendReason?: string;
  planName?: string;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const adminUser = await getAuthenticatedSuperAdminUser();

    if (!adminUser) {
      return NextResponse.json({ error: "Super admin access required." }, { status: 403 });
    }

    const { userId } = await context.params;
    const body = (await request.json()) as SuperAdminUserPatchBody;
    const data = await updateSuperAdminManagedUser(adminUser, userId, body);

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update managed user." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const adminUser = await getAuthenticatedSuperAdminUser();

    if (!adminUser) {
      return NextResponse.json({ error: "Super admin access required." }, { status: 403 });
    }

    const { userId } = await context.params;
    const data = await deleteSuperAdminManagedUser(adminUser, userId);

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete managed user." },
      { status: 500 },
    );
  }
}

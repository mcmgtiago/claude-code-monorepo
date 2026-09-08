import { NextResponse } from "next/server";

import {
  getAuthenticatedSuperAdminUser,
  type SuperAdminWorkspacePatch,
  updateSuperAdminManagedWorkspace,
} from "@/lib/super-admin";

type RouteContext = {
  params: Promise<{
    workspaceId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const adminUser = await getAuthenticatedSuperAdminUser();

    if (!adminUser) {
      return NextResponse.json({ error: "Super admin access required." }, { status: 403 });
    }

    const { workspaceId } = await context.params;
    const body = (await request.json()) as SuperAdminWorkspacePatch;
    const data = await updateSuperAdminManagedWorkspace(adminUser, workspaceId, body);

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update workspace." },
      { status: 500 },
    );
  }
}

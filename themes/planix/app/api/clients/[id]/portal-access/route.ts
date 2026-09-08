import { NextResponse } from "next/server";

import { getDemoPortalMembers } from "@/lib/template-demo-store";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  return NextResponse.json({ ok: true, members: getDemoPortalMembers(id) });
}

import { NextResponse } from "next/server";

import { updateDemoPortalMember } from "@/lib/template-demo-store";

type RouteContext = {
  params: Promise<{ id: string; memberId: string }>;
};

type PortalMemberPatchBody = {
  portalEnabled?: boolean;
  canMessage?: boolean;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id, memberId } = await context.params;
  const body = (await request.json()) as PortalMemberPatchBody;
  const member = updateDemoPortalMember(id, memberId, {
    portalEnabled: typeof body.portalEnabled === "boolean" ? body.portalEnabled : undefined,
    canMessage: typeof body.canMessage === "boolean" ? body.canMessage : undefined,
  });

  if (!member) {
    return NextResponse.json({ error: "Client portal member not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, member });
}

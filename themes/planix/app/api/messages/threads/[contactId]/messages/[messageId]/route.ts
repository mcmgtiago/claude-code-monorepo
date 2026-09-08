import { NextResponse } from "next/server";

import { deleteDemoMessage, updateDemoMessage } from "@/lib/template-demo-store";

type RouteContext = {
  params: Promise<{ contactId: string; messageId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { contactId, messageId } = await context.params;
  const body = (await request.json()) as { content?: string };
  const payload = updateDemoMessage(contactId, messageId, body.content?.trim() ?? "");

  if (!payload) {
    return NextResponse.json({ error: "Message not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { contactId, messageId } = await context.params;
  const payload = deleteDemoMessage(contactId, messageId);

  if (!payload) {
    return NextResponse.json({ error: "Message not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";

import { addDemoMeetingMessage } from "@/lib/template-demo-store";

type RouteContext = {
  params: Promise<{ contactId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { contactId } = await context.params;
  const body = (await request.json()) as { content?: string };
  const content = body.content?.trim() ?? "";

  if (!content) {
    return NextResponse.json({ error: "Meeting message content is required." }, { status: 400 });
  }

  return NextResponse.json({ ok: true, data: addDemoMeetingMessage(contactId, content) });
}

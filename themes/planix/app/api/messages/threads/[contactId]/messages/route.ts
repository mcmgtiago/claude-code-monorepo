import { NextResponse } from "next/server";

import type { ChatAttachment, ChatMessage } from "@/data/chats";
import { appendDemoMessage } from "@/lib/template-demo-store";

type RouteContext = {
  params: Promise<{ contactId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { contactId } = await context.params;
  const body = (await request.json()) as {
    content?: string;
    attachments?: ChatAttachment[];
  };

  const content = body.content?.trim() ?? "";
  const attachments = Array.isArray(body.attachments) ? body.attachments : [];

  if (!content && attachments.length === 0) {
    return NextResponse.json({ error: "Message content is required." }, { status: 400 });
  }

  const message: ChatMessage = {
    id: `message-${Date.now()}`,
    content,
    attachments,
    sender: "me",
    time: new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date()),
    type: attachments.length > 0 ? "attachment" : "text",
  };

  appendDemoMessage(contactId, message);
  return NextResponse.json({ ok: true, message });
}

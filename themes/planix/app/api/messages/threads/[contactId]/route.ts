import { NextResponse } from "next/server";

import type { ChatContact } from "@/data/chats";
import { deleteDemoThread, updateDemoThreadContact } from "@/lib/template-demo-store";

type RouteContext = {
  params: Promise<{ contactId: string }>;
};

type ThreadPatchBody = {
  pinned?: ChatContact["pinned"];
  muted?: ChatContact["muted"];
  restricted?: ChatContact["restricted"];
  blocked?: ChatContact["blocked"];
  archived?: ChatContact["archived"];
  hidden?: ChatContact["hidden"];
  unread?: ChatContact["unread"];
  contactStatus?: ChatContact["status"];
  reported?: ChatContact["reported"];
};

export async function PATCH(request: Request, context: RouteContext) {
  const { contactId } = await context.params;
  const body = (await request.json()) as ThreadPatchBody;
  const contact = updateDemoThreadContact(contactId, {
    pinned: body.pinned,
    muted: body.muted,
    restricted: body.restricted,
    blocked: body.blocked,
    archived: body.archived,
    hidden: body.hidden,
    unread: body.unread,
    status: body.contactStatus,
    reported: body.reported,
  });

  if (!contact) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, contact });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { contactId } = await context.params;
  deleteDemoThread(contactId);
  return NextResponse.json({ ok: true });
}

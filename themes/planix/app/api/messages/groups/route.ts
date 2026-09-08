import { NextResponse } from "next/server";

import { createDemoGroupChat } from "@/lib/template-demo-store";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    memberIds?: string[];
  };
  const name = body.name?.trim() ?? "";

  if (!name) {
    return NextResponse.json({ error: "Group name is required." }, { status: 400 });
  }

  const contactId = createDemoGroupChat(name, Array.isArray(body.memberIds) ? body.memberIds : []);
  return NextResponse.json({ ok: true, data: { contactId } });
}

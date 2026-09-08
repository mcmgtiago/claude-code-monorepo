import { NextResponse } from "next/server";

import type { ChatPreferences } from "@/data/chats";
import { getDemoMessagesPayload, updateDemoMessagePreferences } from "@/lib/template-demo-store";

type MessagesPatchBody = {
  preferences?: ChatPreferences;
};

export async function GET() {
  return NextResponse.json({ ok: true, data: getDemoMessagesPayload(), mode: "remote" });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as MessagesPatchBody;

  if (!body.preferences) {
    return NextResponse.json({ error: "No message preferences payload provided." }, { status: 400 });
  }

  const preferences = updateDemoMessagePreferences(body.preferences);
  return NextResponse.json({ ok: true, preferences });
}

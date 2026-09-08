import { NextResponse } from "next/server";

import { appendDemoMeetingSignal, listDemoMeetingSignals } from "@/lib/template-demo-store";

type RouteContext = {
  params: Promise<{ contactId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { contactId } = await context.params;
  const { searchParams } = new URL(request.url);
  const after = searchParams.get("after");
  return NextResponse.json({ ok: true, data: listDemoMeetingSignals(contactId, after) });
}

export async function POST(request: Request, context: RouteContext) {
  const { contactId } = await context.params;
  const body = (await request.json()) as {
    targetUserId?: string;
    type?: "offer" | "answer" | "ice-candidate";
    payload?: Record<string, unknown>;
  };

  if (!body.targetUserId?.trim() || !body.type || !body.payload) {
    return NextResponse.json({ error: "Meeting signal payload is invalid." }, { status: 400 });
  }

  const signal = appendDemoMeetingSignal(contactId, {
    meetingId: `meeting-${contactId}`,
    senderUserId: "participant-me",
    targetUserId: body.targetUserId.trim(),
    type: body.type,
    payload: body.payload,
  });

  return NextResponse.json({ ok: true, data: signal });
}

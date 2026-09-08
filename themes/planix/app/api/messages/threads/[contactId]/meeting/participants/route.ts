import { NextResponse } from "next/server";

import { addDemoMeetingParticipant, updateDemoMeetingParticipant } from "@/lib/template-demo-store";

type RouteContext = {
  params: Promise<{ contactId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { contactId } = await context.params;
  const body = (await request.json()) as { participantId?: string };
  const participantId = body.participantId?.trim() ?? "";

  if (!participantId) {
    return NextResponse.json({ error: "Participant id is required." }, { status: 400 });
  }

  return NextResponse.json({ ok: true, data: addDemoMeetingParticipant(contactId, participantId) });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { contactId } = await context.params;
  const body = (await request.json()) as {
    participantId?: string;
    micEnabled?: boolean;
    kicked?: boolean;
  };
  const participantId = body.participantId?.trim() ?? "";

  if (!participantId) {
    return NextResponse.json({ error: "Participant id is required." }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    data: updateDemoMeetingParticipant(contactId, participantId, {
      micEnabled: typeof body.micEnabled === "boolean" ? body.micEnabled : undefined,
      kicked: Boolean(body.kicked),
    }),
  });
}

import { NextResponse } from "next/server";

import { getDemoMeetingSession, updateDemoMeetingControls } from "@/lib/template-demo-store";

type RouteContext = {
  params: Promise<{ contactId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { contactId } = await context.params;
  return NextResponse.json({ ok: true, data: getDemoMeetingSession(contactId) });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { contactId } = await context.params;
  const body = (await request.json()) as {
    micEnabled?: boolean;
    cameraEnabled?: boolean;
    speakerEnabled?: boolean;
    screenSharing?: boolean;
    ended?: boolean;
    left?: boolean;
  };

  const data = updateDemoMeetingControls(contactId, body);
  return NextResponse.json({ ok: true, data });
}

import { NextResponse } from "next/server";

import { getDemoTimeTrackerDashboard, startDemoTimer, stopDemoTimer } from "@/lib/template-demo-store";
import { DEMO_TIME_TRACKER_ACTOR } from "@/lib/time-tracker";

function normalizeActorName(value?: string | null) {
  const actorName = value?.trim();
  return !actorName || actorName === "You" ? DEMO_TIME_TRACKER_ACTOR : actorName;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const actorName = normalizeActorName(searchParams.get("actorName"));
  return NextResponse.json({ ok: true, dashboard: getDemoTimeTrackerDashboard(actorName) });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    action?: "start";
    projectRef?: string;
    taskId?: number | null;
    actorName?: string;
  };

  if (body.action !== "start" || !body.projectRef?.trim()) {
    return NextResponse.json({ error: "Invalid time tracker action." }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    dashboard: startDemoTimer(body.projectRef.trim(), body.taskId ?? null, normalizeActorName(body.actorName)),
  }, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as {
    action?: "stop";
    entryId?: string;
    actorName?: string;
  };

  if (body.action !== "stop") {
    return NextResponse.json({ error: "Invalid time tracker action." }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    dashboard: stopDemoTimer(body.entryId?.trim() || null, normalizeActorName(body.actorName)),
  });
}

import { NextResponse } from "next/server";

import { reorderDemoTasks } from "@/lib/template-demo-store";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    tasks?: Array<{ id: number; statusId: string; sortOrder: number; projectRef: string }>;
  };

  if (!Array.isArray(body.tasks) || body.tasks.length === 0) {
    return NextResponse.json({ error: "Task reorder payload is required." }, { status: 400 });
  }

  reorderDemoTasks(body.tasks);
  return NextResponse.json({ ok: true });
}

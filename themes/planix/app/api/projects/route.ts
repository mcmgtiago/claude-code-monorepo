import { NextResponse } from "next/server";

import type { ProjectWorkspaceBundle } from "@/lib/project-workspace";
import { getDemoProjectWorkspaceBundle, setDemoProjectWorkspaceBundle } from "@/lib/template-demo-store";

export async function GET() {
  return NextResponse.json({ ok: true, bundle: getDemoProjectWorkspaceBundle(), mode: "remote" });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as Partial<ProjectWorkspaceBundle>;
  const bundle = setDemoProjectWorkspaceBundle(body);
  return NextResponse.json({ ok: true, bundle, mode: "remote" });
}

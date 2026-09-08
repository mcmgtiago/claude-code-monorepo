import { NextResponse } from "next/server";

import { deleteDemoProject } from "@/lib/template-demo-store";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const bundle = deleteDemoProject(Number(id));

  if (!bundle) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, bundle, mode: "remote" });
}

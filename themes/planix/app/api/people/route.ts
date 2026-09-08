import { NextResponse } from "next/server";

import { getDemoPeopleBundle, setDemoPeopleBundle } from "@/lib/template-demo-store";

export async function GET() {
  return NextResponse.json({ ok: true, bundle: getDemoPeopleBundle(), mode: "remote" });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as ReturnType<typeof getDemoPeopleBundle>;
  const bundle = setDemoPeopleBundle({
    teams: body.teams ?? [],
    members: body.members ?? [],
    projects: body.projects ?? [],
  });

  return NextResponse.json({ ok: true, bundle, mode: "remote" });
}

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const nextPath = requestUrl.searchParams.get("next")?.trim();
  return NextResponse.redirect(new URL(nextPath && nextPath.startsWith("/") ? nextPath : "/dashboard", requestUrl.origin));
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { nextPath?: string } | null;
  const redirectPath = body?.nextPath?.trim() || "/dashboard";
  return NextResponse.json({ ok: true, redirectPath });
}

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, items: [], mode: "remote" });
}

export async function POST() {
  return NextResponse.json({ ok: true, items: [], mode: "remote" });
}

export async function DELETE() {
  return NextResponse.json({ ok: true, items: [], mode: "remote" });
}

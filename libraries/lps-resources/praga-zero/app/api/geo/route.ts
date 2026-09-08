import { NextRequest, NextResponse } from "next/server";
import { getCityFromIP } from "@/lib/geo";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const geo = await getCityFromIP(request.headers);
  return NextResponse.json(geo, {
    headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600" },
  });
}
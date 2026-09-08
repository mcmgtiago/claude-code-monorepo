import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { canAccessSuperuser } from "@/lib/team";

const MAX_LOGO_SIZE = 2 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];

export async function GET() {
  const stored = await prisma.platformSetting.findUnique({
    where: { id: "platform" },
    select: { appLogoData: true, appLogoMimeType: true, updatedAt: true }
  });

  if (!stored?.appLogoData || !stored.appLogoMimeType) {
    return NextResponse.json({ error: "No custom logo set." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(stored.appLogoData), {
    headers: {
      "content-type": stored.appLogoMimeType,
      "cache-control": "public, max-age=60, stale-while-revalidate=300"
    }
  });
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireUser();

    if (!canAccessSuperuser(currentUser.accessRole)) {
      return NextResponse.json({ error: "Only the superuser can access this control plane." }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Logo file is required." }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Only PNG, JPG, WebP, or SVG files are allowed." }, { status: 400 });
    }

    if (file.size > MAX_LOGO_SIZE) {
      return NextResponse.json({ error: "Logo must be 2 MB or smaller." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    await prisma.platformSetting.upsert({
      where: { id: "platform" },
      update: { appLogoData: buffer, appLogoMimeType: file.type },
      create: { id: "platform", appLogoData: buffer, appLogoMimeType: file.type }
    });

    return NextResponse.json({ appLogoUrl: "/api/superuser/platform/logo" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to upload logo." }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const currentUser = await requireUser();

    if (!canAccessSuperuser(currentUser.accessRole)) {
      return NextResponse.json({ error: "Only the superuser can access this control plane." }, { status: 403 });
    }

    await prisma.platformSetting.upsert({
      where: { id: "platform" },
      update: { appLogoData: null, appLogoMimeType: null },
      create: { id: "platform" }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to remove logo." }, { status: 500 });
  }
}

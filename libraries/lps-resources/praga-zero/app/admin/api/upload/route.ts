import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { publicTenantPath } from "@/lib/tenants";

export const runtime = "nodejs";

function cleanSlug(value: FormDataEntryValue | null): string {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const slug = cleanSlug(formData.get("slug"));
  const file = formData.get("file");
  if (!slug || !(file instanceof File) || file.size === 0) {
    return NextResponse.json({ ok: false, error: "Envie slug e arquivo." }, { status: 400 });
  }

  const tenantDir = publicTenantPath(slug);
  await mkdir(tenantDir, { recursive: true });
  const ext = path.extname(file.name).toLowerCase() || ".png";
  const fileName = `${crypto.randomUUID()}${ext}`;
  await writeFile(path.join(tenantDir, fileName), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ ok: true, path: `/tenants/${slug}/${fileName}` });
}

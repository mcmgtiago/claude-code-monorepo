import { NextResponse } from "next/server";

import { getAuthenticatedSuperAdminUser } from "@/lib/super-admin";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const ADMIN_BRANDING_STORAGE_BUCKET = "admin-branding";
const MAX_LOGO_BYTES = 5 * 1024 * 1024;

let ensuredAdminBrandingBucket: Promise<void> | null = null;

function sanitizeFileName(name: string) {
  const trimmed = name.trim();
  const dotIndex = trimmed.lastIndexOf(".");
  const extension = dotIndex >= 0 ? trimmed.slice(dotIndex).toLowerCase() : "";
  const baseName = dotIndex >= 0 ? trimmed.slice(0, dotIndex) : trimmed;

  return `${baseName.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 64) || "logo"}${extension}`;
}

async function ensureBrandingBucket() {
  if (!ensuredAdminBrandingBucket) {
    ensuredAdminBrandingBucket = (async () => {
      const admin = createSupabaseAdminClient();
      const { data: buckets, error } = await admin.storage.listBuckets();

      if (error) {
        throw error;
      }

      if (!buckets.some((bucket) => bucket.name === ADMIN_BRANDING_STORAGE_BUCKET)) {
        const { error: createError } = await admin.storage.createBucket(ADMIN_BRANDING_STORAGE_BUCKET, {
          public: true,
          fileSizeLimit: `${Math.round(MAX_LOGO_BYTES / (1024 * 1024))}MB`,
        });

        if (createError && !String(createError.message).toLowerCase().includes("already exists")) {
          throw createError;
        }
      }
    })();
  }

  return ensuredAdminBrandingBucket;
}

export async function POST(request: Request) {
  try {
    const adminUser = await getAuthenticatedSuperAdminUser();

    if (!adminUser) {
      return NextResponse.json({ error: "Super admin access required." }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Logo file is required." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are supported for the app logo." }, { status: 400 });
    }

    if (file.size > MAX_LOGO_BYTES) {
      return NextResponse.json({ error: "Logo exceeds the 5 MB upload limit." }, { status: 400 });
    }

    await ensureBrandingBucket();

    const admin = createSupabaseAdminClient();
    const storagePath = `logos/${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${sanitizeFileName(file.name)}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await admin.storage.from(ADMIN_BRANDING_STORAGE_BUCKET).upload(storagePath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = admin.storage.from(ADMIN_BRANDING_STORAGE_BUCKET).getPublicUrl(storagePath);

    return NextResponse.json({
      ok: true,
      logoUrl: data.publicUrl,
      storagePath,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload logo." },
      { status: 500 },
    );
  }
}

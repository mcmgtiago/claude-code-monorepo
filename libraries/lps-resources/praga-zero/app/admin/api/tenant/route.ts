import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/config/siteConfig";
import { getPexelsMediaSet } from "@/config/pexels-curated";
import { publicTenantPath, tenantExists } from "@/lib/tenants";
import { formatPhone } from "@/lib/utils";
import type { TenantConfig, TenantTheme } from "@/config/tenantTypes";

export const runtime = "nodejs";

function cleanSlug(value: FormDataEntryValue | null): string {
  return String(value || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

function parseTheme(value: FormDataEntryValue | null): TenantTheme {
  try {
    const parsed = JSON.parse(String(value || "{}")) as TenantTheme;
    return {
      primary: parsed.primary || siteConfig.theme.primary,
      danger: parsed.danger || siteConfig.theme.danger,
      warning: parsed.warning || siteConfig.theme.warning,
      bg: parsed.bg || siteConfig.theme.bg,
      text: parsed.text || siteConfig.theme.text,
      muted: parsed.muted || siteConfig.theme.muted,
      surface: parsed.surface || siteConfig.theme.surface,
      radius: parsed.radius || "0.9rem",
    };
  } catch {
    return { ...siteConfig.theme, radius: "0.9rem" };
  }
}

async function saveLogo(slug: string, logo: FormDataEntryValue | null): Promise<string> {
  const tenantDir = publicTenantPath(slug);
  await mkdir(tenantDir, { recursive: true });

  if (!(logo instanceof File) || logo.size === 0) {
    return "/logo.svg";
  }

  const ext = path.extname(logo.name).toLowerCase() || ".png";
  const fileName = `logo${ext}`;
  const filePath = path.join(tenantDir, fileName);
  const buffer = Buffer.from(await logo.arrayBuffer());
  await writeFile(filePath, buffer);
  return `/tenants/${slug}/${fileName}`;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const slug = cleanSlug(formData.get("slug"));
  if (!slug) return NextResponse.json({ ok: false, error: "Slug inválido." }, { status: 400 });
  if (tenantExists(slug)) return NextResponse.json({ ok: false, error: "Já existe uma página com esse slug." }, { status: 409 });

  const companyName = String(formData.get("companyName") || "Nova Dedetizadora").trim();
  const phone = String(formData.get("phone") || siteConfig.company.phone).replace(/\D/g, "");
  const email = String(formData.get("email") || siteConfig.company.email).trim();
  const city = String(formData.get("city") || siteConfig.coverage.defaultCity).trim();
  const mediaSetId = String(formData.get("mediaSet") || "premium-urbano");
  const media = getPexelsMediaSet(mediaSetId);
  const theme = parseTheme(formData.get("theme"));
  const logo = await saveLogo(slug, formData.get("logo"));

  const tenant: TenantConfig = {
    slug,
    label: companyName,
    company: {
      ...siteConfig.company,
      name: companyName,
      phone,
      phoneFormatted: formatPhone(phone),
      email,
      instagram: `@${slug.replace(/-/g, "")}`,
      facebook: `/${slug}`,
      logo,
      shortDescription: `Empresa especializada em dedetização premium, controle de pragas urbanas e atendimento rápido em ${city}.`,
    },
    theme,
    media,
    coverage: {
      defaultCity: city,
      defaultState: "RS",
      neighborhoods: [...siteConfig.coverage.neighborhoods],
      regions: [...siteConfig.coverage.regions],
    },
    copyRef: "default",
    createdAt: new Date().toISOString().slice(0, 10),
  };

  const filePath = path.join(process.cwd(), "config", "tenants", `${slug}.json`);
  await writeFile(filePath, JSON.stringify(tenant, null, 2), "utf8");

  return NextResponse.json({ ok: true, slug });
}

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { siteConfig } from "@/config/siteConfig";
import { getPexelsMediaSet } from "@/config/pexels-curated";
import type { TenantConfig } from "@/config/tenantTypes";

const tenantsDir = path.join(process.cwd(), "config", "tenants");

export function defaultTenant(): TenantConfig {
  const media = getPexelsMediaSet("premium-urbano");
  return {
    slug: "praga-zero",
    label: "Praga Zero Premium",
    company: {
      ...siteConfig.company,
      logo: "/logo.svg",
    },
    theme: {
      ...siteConfig.theme,
      radius: "0.9rem",
    },
    media,
    coverage: {
      defaultCity: siteConfig.coverage.defaultCity,
      defaultState: siteConfig.coverage.defaultState,
      neighborhoods: [...siteConfig.coverage.neighborhoods],
      regions: [...siteConfig.coverage.regions],
    },
    copyRef: "default",
  };
}

function hydrateTenant(tenant: TenantConfig): TenantConfig {
  const mediaSet = getPexelsMediaSet(tenant.media.setId);
  return {
    ...tenant,
    company: {
      ...defaultTenant().company,
      ...tenant.company,
    },
    theme: {
      ...defaultTenant().theme,
      ...tenant.theme,
    },
    media: tenant.media.setId === "custom" ? {
      ...mediaSet,
      ...tenant.media,
      hero: tenant.media.hero?.src ? tenant.media.hero : mediaSet.hero,
      gallery: tenant.media.gallery?.length ? tenant.media.gallery : mediaSet.gallery,
      og: tenant.media.og?.src ? tenant.media.og : mediaSet.og,
    } : mediaSet,
    coverage: {
      ...defaultTenant().coverage,
      ...tenant.coverage,
    },
  };
}

export function listTenants(): TenantConfig[] {
  if (!existsSync(tenantsDir)) return [defaultTenant()];
  const files = readdirSync(tenantsDir).filter((file) => file.endsWith(".json"));
  const tenants = files.map((file) => loadTenant(file.replace(/\.json$/, ""))).filter(Boolean);
  return tenants.length ? tenants : [defaultTenant()];
}

export function loadTenant(slug: string): TenantConfig {
  const safeSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "");
  const filePath = path.join(tenantsDir, `${safeSlug}.json`);
  if (!existsSync(filePath)) return defaultTenant();
  const raw = readFileSync(filePath, "utf8");
  const tenant = JSON.parse(raw) as TenantConfig;
  return hydrateTenant(tenant);
}

export function tenantExists(slug: string): boolean {
  return existsSync(path.join(tenantsDir, `${slug}.json`));
}

export function publicTenantPath(slug: string): string {
  return path.join(process.cwd(), "public", "tenants", slug);
}

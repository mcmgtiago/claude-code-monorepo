import { prisma } from "@/lib/prisma";

const multiSegmentTlds = new Set([
  "ac.uk",
  "co.uk",
  "gov.uk",
  "org.uk",
  "co.in",
  "org.in",
  "gov.in",
  "com.au",
  "net.au",
  "org.au",
  "co.jp",
  "co.nz",
  "com.br",
  "com.mx"
]);

function normalizeWebsite(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  return trimmed.startsWith("http://") || trimmed.startsWith("https://") ? trimmed : `https://${trimmed}`;
}

function isIpAddress(hostname: string) {
  return /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname);
}

function getApexDomain(hostname: string) {
  const normalizedHostname = hostname.toLowerCase().replace(/^www\./, "");

  if (!normalizedHostname || normalizedHostname === "localhost" || isIpAddress(normalizedHostname)) {
    return normalizedHostname;
  }

  const parts = normalizedHostname.split(".").filter(Boolean);

  if (parts.length <= 2) {
    return normalizedHostname;
  }

  const suffix = parts.slice(-2).join(".");
  const sliceSize = multiSegmentTlds.has(suffix) ? 3 : 2;

  return parts.slice(-sliceSize).join(".");
}

export function getCompanyDomain(website: string | null | undefined) {
  if (!website) {
    return null;
  }

  try {
    const url = new URL(normalizeWebsite(website));
    return getApexDomain(url.hostname);
  } catch {
    return null;
  }
}

export function getCompanyLogoUrl(website: string | null | undefined) {
  const domain = getCompanyDomain(website);

  if (!domain) {
    return null;
  }

  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
}

export async function ensureCompanyLogoCache() {
  try {
    const companies = await prisma.company.findMany({
      where: {
        website: { not: null }
      },
      select: {
        id: true,
        website: true,
        logoUrl: true
      }
    });

    const updates = companies
      .map((company) => {
        const derivedLogoUrl = getCompanyLogoUrl(company.website);

        if (!derivedLogoUrl || company.logoUrl === derivedLogoUrl) {
          return null;
        }

        return prisma.company.update({
          where: { id: company.id },
          data: { logoUrl: derivedLogoUrl }
        });
      })
      .filter((value): value is ReturnType<typeof prisma.company.update> => Boolean(value));

    if (!updates.length) {
      return;
    }

    await prisma.$transaction(updates);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    // When the local Prisma client has not been regenerated yet, skip logo caching
    // instead of crashing the page render. The UI still falls back to initials.
    if (message.includes("Unknown field `logoUrl`")) {
      return;
    }

    throw error;
  }
}

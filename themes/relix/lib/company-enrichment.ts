import { prisma } from "@/lib/prisma";
import { getCompanyDirectory, slugifyCompanyName } from "@/lib/company-directory";
import { getCompanyDomain } from "@/lib/company-logo";

type EnrichedCompanyFields = {
  name?: string;
  website?: string;
  industry?: string;
  phone?: string;
  location?: string;
  description?: string;
  stage?: string;
  employeeCount?: number;
  foundedYear?: number;
  revenueLabel?: string;
  marketCapLabel?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  xUrl?: string;
  lists?: string[];
  keywords?: string[];
};

export type CompanyEnrichmentResult = {
  matched: boolean;
  sourceLabel: string;
  company: EnrichedCompanyFields;
};

function normalizeExternalUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function cleanWebsiteValue(value: string | null | undefined) {
  const domain = getCompanyDomain(value);
  return domain || value?.trim() || "";
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&nbsp;/gi, " ");
}

function cleanText(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return decodeHtml(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function extractMetaContent(html: string, key: string, attribute: "name" | "property" = "name") {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`<meta[^>]*${attribute}=["']${escapedKey}["'][^>]*content=["']([^"']+)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*${attribute}=["']${escapedKey}["'][^>]*>`, "i")
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return cleanText(match[1]);
    }
  }

  return "";
}

function extractTitle(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return cleanText(match?.[1]);
}

function extractLinkedinCompanySlug(value: string | null | undefined) {
  if (!value?.trim()) {
    return null;
  }

  try {
    const url = new URL(normalizeExternalUrl(value));
    const match = url.pathname.match(/\/company\/([^/?#]+)/i);
    return match?.[1]?.toLowerCase() || null;
  } catch {
    return null;
  }
}

function formatSlugLabel(value: string) {
  return value
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function inferIndustry(description: string, keywords: string[]) {
  const haystack = `${description} ${keywords.join(" ")}`.toLowerCase();

  if (haystack.includes("crm")) return "CRM";
  if (haystack.includes("payments") || haystack.includes("fintech")) return "FinTech";
  if (haystack.includes("cloud")) return "Cloud Platform";
  if (haystack.includes("commerce") || haystack.includes("e-commerce")) return "E-commerce";
  if (haystack.includes("marketing")) return "Marketing Automation";
  if (haystack.includes("meeting") || haystack.includes("video")) return "Collaboration";
  if (haystack.includes("streaming") || haystack.includes("media")) return "Media & Entertainment";
  if (haystack.includes("travel") || haystack.includes("hospitality")) return "Hospitality";
  if (haystack.includes("analytics") || haystack.includes("data")) return "Analytics";

  return "";
}

function inferKeywords(description: string, metaKeywords: string[]) {
  if (metaKeywords.length) {
    return metaKeywords.slice(0, 6);
  }

  const stopWords = new Set([
    "about",
    "across",
    "after",
    "build",
    "business",
    "company",
    "customer",
    "customers",
    "faster",
    "global",
    "helps",
    "leading",
    "modern",
    "platform",
    "product",
    "products",
    "scale",
    "software",
    "teams",
    "their",
    "with"
  ]);

  const unique = new Set<string>();
  for (const token of description.toLowerCase().split(/[^a-z0-9]+/)) {
    if (token.length < 4 || stopWords.has(token)) {
      continue;
    }

    unique.add(token);

    if (unique.size >= 5) {
      break;
    }
  }

  return Array.from(unique);
}

async function fetchWebsiteMetadata(website: string) {
  if (!website.trim()) {
    return null;
  }

  try {
    const response = await fetch(normalizeExternalUrl(website), {
      headers: {
        "user-agent": "relixcrm/1.0"
      },
      signal: AbortSignal.timeout(4000)
    });

    const contentType = response.headers.get("content-type") || "";
    if (!response.ok || !contentType.includes("text/html")) {
      return null;
    }

    const html = await response.text();
    const title = extractTitle(html);
    const siteName = extractMetaContent(html, "og:site_name", "property");
    const description = extractMetaContent(html, "description") || extractMetaContent(html, "og:description", "property");
    const metaKeywords = extractMetaContent(html, "keywords")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    return {
      title,
      siteName,
      description,
      metaKeywords
    };
  } catch {
    return null;
  }
}

async function findDirectoryCompany(website: string, linkedinUrl: string) {
  const [companies, contacts, leads] = await Promise.all([
    prisma.company.findMany({ include: { contacts: true }, orderBy: { name: "asc" } }),
    prisma.contact.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.lead.findMany({
      include: {
        contactRecord: { select: { id: true, fullName: true, email: true, phone: true } },
        notes: { orderBy: { createdAt: "desc" } },
        tasks: { orderBy: { createdAt: "desc" } }
      },
      orderBy: { updatedAt: "desc" }
    })
  ]);

  const directory = getCompanyDirectory(companies, contacts, leads);
  const websiteDomain = getCompanyDomain(website);
  const linkedinSlug = extractLinkedinCompanySlug(linkedinUrl);

  return (
    directory.find((company) => websiteDomain && getCompanyDomain(company.website) === websiteDomain) ||
    directory.find((company) => linkedinSlug && extractLinkedinCompanySlug(company.linkedinUrl) === linkedinSlug) ||
    directory.find((company) => websiteDomain && company.slug === slugifyCompanyName(websiteDomain.split(".")[0] || "")) ||
    directory.find((company) => linkedinSlug && company.slug === linkedinSlug) ||
    null
  );
}

export async function enrichCompanyFromSource(website: string, linkedinUrl: string): Promise<CompanyEnrichmentResult | null> {
  const cleanedWebsite = cleanWebsiteValue(website);
  const cleanedLinkedinUrl = linkedinUrl.trim();

  if (!cleanedWebsite && !cleanedLinkedinUrl) {
    return null;
  }

  const matchedCompany = await findDirectoryCompany(cleanedWebsite, cleanedLinkedinUrl);

  if (matchedCompany) {
    return {
      matched: true,
      sourceLabel: cleanWebsiteValue(matchedCompany.website) || matchedCompany.name,
      company: {
        name: matchedCompany.name,
        website: cleanWebsiteValue(matchedCompany.website),
        industry: matchedCompany.industries[0] || matchedCompany.industryLabel,
        phone: matchedCompany.phone,
        location: matchedCompany.location,
        description: matchedCompany.description,
        stage: matchedCompany.stage,
        employeeCount: matchedCompany.employeeCount,
        foundedYear: matchedCompany.foundedYear,
        revenueLabel: matchedCompany.revenueLabel,
        marketCapLabel: matchedCompany.marketCapLabel,
        linkedinUrl: matchedCompany.linkedinUrl,
        facebookUrl: matchedCompany.facebookUrl,
        xUrl: matchedCompany.xUrl,
        lists: matchedCompany.lists,
        keywords: matchedCompany.keywords
      }
    };
  }

  const metadata = cleanedWebsite ? await fetchWebsiteMetadata(cleanedWebsite) : null;
  const linkedinSlug = extractLinkedinCompanySlug(cleanedLinkedinUrl);
  const fallbackName =
    metadata?.siteName ||
    metadata?.title.split(/[\-|:|]/)[0]?.trim() ||
    (linkedinSlug ? formatSlugLabel(linkedinSlug) : "") ||
    formatSlugLabel((cleanedWebsite.split(".")[0] || "").replace(/^www$/i, ""));
  const description = metadata?.description || "";
  const keywords = inferKeywords(description, metadata?.metaKeywords || []);
  const industry = inferIndustry(description, keywords);

  return {
    matched: false,
    sourceLabel: cleanedWebsite || cleanedLinkedinUrl,
    company: {
      ...(fallbackName ? { name: fallbackName } : {}),
      ...(cleanedWebsite ? { website: cleanedWebsite } : {}),
      ...(cleanedLinkedinUrl ? { linkedinUrl: cleanedLinkedinUrl } : {}),
      ...(industry ? { industry } : {}),
      ...(description ? { description } : {}),
      ...(keywords.length ? { keywords } : {})
    }
  };
}

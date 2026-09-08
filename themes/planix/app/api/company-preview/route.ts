import { NextResponse } from "next/server";

import {
  getCompanyHostname,
  getCompanyNameFromHostname,
  normalizeCompanyWebsite,
} from "@/lib/company-brand";

type MetaRecord = {
  siteName: string;
  title: string;
  description: string;
  logoUrl: string;
  hostname: string;
  website: string;
};

function readMetaTag(html: string, key: string, attribute: "property" | "name" = "property") {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(
      `<meta[^>]*${attribute}=["']${escapedKey}["'][^>]*content=["']([^"']+)["'][^>]*>`,
      "i",
    ),
    new RegExp(
      `<meta[^>]*content=["']([^"']+)["'][^>]*${attribute}=["']${escapedKey}["'][^>]*>`,
      "i",
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);

    if (match?.[1]) {
      return decodeHtml(match[1].trim());
    }
  }

  return "";
}

function readTitle(html: string) {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match?.[1] ? decodeHtml(match[1].trim()) : "";
}

function readFavicon(html: string, website: string) {
  const linkMatch = html.match(
    /<link[^>]*rel=["'][^"']*(?:icon|apple-touch-icon)[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>/i,
  );

  if (!linkMatch?.[1]) {
    return "";
  }

  try {
    return new URL(linkMatch[1], website).toString();
  } catch {
    return "";
  }
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function cleanCompanyName({ siteName, title, hostname }: Pick<MetaRecord, "siteName" | "title" | "hostname">) {
  const candidate = siteName || title.split(/[|\-:]/)[0]?.trim() || getCompanyNameFromHostname(hostname);

  return candidate
    .replace(/\b(home|official site|welcome)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const websiteInput = searchParams.get("website") ?? "";
  const website = normalizeCompanyWebsite(websiteInput);
  const hostname = getCompanyHostname(websiteInput);

  if (!website || !hostname) {
    return NextResponse.json({ error: "Invalid website URL." }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(website, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36",
      },
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json({ error: "Could not fetch website metadata." }, { status: 502 });
    }

    const html = await response.text();
    const siteName = readMetaTag(html, "og:site_name");
    const title = readMetaTag(html, "og:title") || readTitle(html);
    const description =
      readMetaTag(html, "og:description") || readMetaTag(html, "description", "name");
    const openGraphImage = readMetaTag(html, "og:image");
    const favicon = readFavicon(html, response.url || website);

    return NextResponse.json({
      companyName: cleanCompanyName({ siteName, title, hostname }),
      description,
      hostname,
      website: response.url || website,
      logoUrl: openGraphImage || favicon || "",
    });
  } catch {
    return NextResponse.json({
      companyName: getCompanyNameFromHostname(hostname),
      description: "",
      hostname,
      website,
      logoUrl: "",
    });
  }
}

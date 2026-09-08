import { siteConfig } from "@/config/siteConfig";

export type GeoLocation = {
  city: string;
  state: string;
  region: string;
  country: string;
};

type CacheEntry = {
  value: GeoLocation;
  expiresAt: number;
};

const MAX_CACHE_ENTRIES = 100;
const TTL_MS = 24 * 60 * 60 * 1000;
const geoCache = new Map<string, CacheEntry>();

function fallbackGeo(): GeoLocation {
  return {
    city: siteConfig.coverage.defaultCity,
    state: siteConfig.coverage.defaultState,
    region: siteConfig.coverage.defaultState,
    country: "BR",
  };
}

function cleanHeaderValue(value: string | null): string | null {
  if (!value) return null;
  try {
    return decodeURIComponent(value).replace(/\+/g, " ").trim() || null;
  } catch {
    return value.trim() || null;
  }
}

function getIP(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const real = headers.get("x-real-ip")?.trim();
  const cf = headers.get("cf-connecting-ip")?.trim();
  return forwarded || real || cf || "local";
}

function setCache(key: string, value: GeoLocation): void {
  if (geoCache.size >= MAX_CACHE_ENTRIES) {
    const oldest = geoCache.keys().next().value;
    if (oldest) geoCache.delete(oldest);
  }
  geoCache.set(key, { value, expiresAt: Date.now() + TTL_MS });
}

function getCache(key: string): GeoLocation | null {
  const entry = geoCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    geoCache.delete(key);
    return null;
  }
  geoCache.delete(key);
  geoCache.set(key, entry);
  return entry.value;
}

async function fetchIpapi(ip: string): Promise<GeoLocation | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1500);
  try {
    const key = process.env.IPAPI_KEY;
    const url = key
      ? `https://ipapi.co/${ip}/json/?key=${encodeURIComponent(key)}`
      : `https://ipapi.co/${ip}/json/`;
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      city?: string;
      region_code?: string;
      region?: string;
      country_code?: string;
    };
    if (!data.city) return null;
    return {
      city: data.city,
      state: data.region_code || data.region || siteConfig.coverage.defaultState,
      region: data.region || data.region_code || siteConfig.coverage.defaultState,
      country: data.country_code || "BR",
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function getCityFromIP(headers: Headers): Promise<GeoLocation> {
  const vercelCity = cleanHeaderValue(headers.get("x-vercel-ip-city"));
  const vercelRegion = cleanHeaderValue(headers.get("x-vercel-ip-region"));
  if (vercelCity) {
    const result = { city: vercelCity, state: vercelRegion || siteConfig.coverage.defaultState, region: vercelRegion || siteConfig.coverage.defaultState, country: "BR" };
    if (process.env.NODE_ENV === "development") console.debug("[geo]", result);
    return result;
  }

  const cfCity = cleanHeaderValue(headers.get("cf-ipcity"));
  const cfRegion = cleanHeaderValue(headers.get("cf-region"));
  if (cfCity) {
    const result = { city: cfCity, state: cfRegion || siteConfig.coverage.defaultState, region: cfRegion || siteConfig.coverage.defaultState, country: "BR" };
    if (process.env.NODE_ENV === "development") console.debug("[geo]", result);
    return result;
  }

  const ip = getIP(headers);
  const cached = getCache(ip);
  if (cached) return cached;

  const fetched = await fetchIpapi(ip);
  const result = fetched || fallbackGeo();
  setCache(ip, result);
  if (process.env.NODE_ENV === "development") console.debug("[geo]", result);
  return result;
}
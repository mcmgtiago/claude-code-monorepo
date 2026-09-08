import { getPlatformSettings } from "@/lib/platform-settings";

const FALLBACK_APP_URL = "http://localhost:3000";

function normalizeBaseUrl(value?: string | null) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  const withProtocol =
    trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : trimmed.includes("localhost") || trimmed.startsWith("127.0.0.1")
        ? `http://${trimmed}`
        : `https://${trimmed}`;

  return withProtocol.replace(/\/+$/, "");
}

export async function getAppBaseUrl() {
  const platform = await getPlatformSettings();
  return normalizeBaseUrl(platform.appUrl) || FALLBACK_APP_URL;
}

export async function buildAppUrl(pathname: string) {
  const baseUrl = await getAppBaseUrl();
  return new URL(pathname.startsWith("/") ? pathname : `/${pathname}`, `${baseUrl}/`).toString();
}

export async function buildMeetingPageUrl(slug: string) {
  return buildAppUrl(`/meet/${slug}`);
}

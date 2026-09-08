import type { Integration } from "@/data/project-board";

export const INTEGRATION_CATEGORIES = ["Management", "Communication"] as const;

export function normalizeIntegrationUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    url.hash = "";
    url.search = "";
    return url.origin;
  } catch {
    return "";
  }
}

export function isValidIntegrationUrl(value: string) {
  return Boolean(normalizeIntegrationUrl(value));
}

export function getIntegrationHostname(value: string) {
  const normalized = normalizeIntegrationUrl(value);

  if (!normalized) {
    return null;
  }

  try {
    return new URL(normalized).hostname.replace(/^www\./i, "");
  } catch {
    return null;
  }
}

export function getIntegrationDisplayUrl(value: string) {
  return getIntegrationHostname(value) ?? value.trim();
}

export function getIntegrationLogoUrl(value: string) {
  const normalized = normalizeIntegrationUrl(value);

  if (!normalized) {
    return null;
  }

  return `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(normalized)}`;
}

export function createIntegrationId(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);

  return `int-${Date.now()}-${slug || "custom"}`;
}

export function normalizeIntegrationInput(
  input: Pick<Integration, "name" | "url" | "description" | "category">,
) {
  return {
    name: input.name.trim(),
    url: normalizeIntegrationUrl(input.url),
    description: input.description.trim(),
    category: input.category,
  };
}

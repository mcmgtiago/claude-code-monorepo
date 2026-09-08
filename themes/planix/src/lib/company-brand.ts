export function normalizeCompanyWebsite(website: string) {
  const value = website.trim();

  if (!value) {
    return "";
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `https://${value}`;
}

export function getCompanyHostname(website: string) {
  const normalized = normalizeCompanyWebsite(website);

  if (!normalized) {
    return "";
  }

  try {
    return new URL(normalized).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function getCompanyLogoUrl(website: string) {
  const hostname = getCompanyHostname(website);
  return hostname ? `https://unavatar.io/${hostname}` : "";
}

export function getCompanyLogoSources(website: string, logoUrl?: string) {
  const hostname = getCompanyHostname(website);
  const normalizedWebsite = normalizeCompanyWebsite(website);
  const sources = [
    logoUrl?.trim() || "",
    normalizedWebsite ? `${normalizedWebsite.replace(/\/+$/, "")}/favicon.ico` : "",
    hostname ? `https://unavatar.io/${hostname}` : "",
    hostname ? `https://www.google.com/s2/favicons?sz=128&domain=${hostname}` : "",
    hostname ? `https://icons.duckduckgo.com/ip3/${hostname}.ico` : "",
  ].filter(Boolean);

  return Array.from(new Set(sources));
}

export function getCompanyInitials(company: string) {
  return company
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function getCompanyNameFromHostname(website: string) {
  const hostname = getCompanyHostname(website);

  if (!hostname) {
    return "";
  }

  const root = hostname.split(".")[0] ?? "";

  return root
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

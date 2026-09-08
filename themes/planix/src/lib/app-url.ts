const DEFAULT_APP_URL = "http://localhost:3000";

function normalizeAppUrl(value: string | undefined | null) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);
    return url.origin;
  } catch {
    return null;
  }
}

export function getConfiguredAppUrl(fallbackOrigin?: string) {
  const configuredUrl = normalizeAppUrl(process.env.NEXT_PUBLIC_APP_URL);
  const runtimeOrigin = normalizeAppUrl(fallbackOrigin);

  return configuredUrl || runtimeOrigin || DEFAULT_APP_URL;
}

export function getConfiguredAppHost(fallbackOrigin?: string) {
  try {
    return new URL(getConfiguredAppUrl(fallbackOrigin)).host;
  } catch {
    return new URL(DEFAULT_APP_URL).host;
  }
}

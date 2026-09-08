const CURRENT_STORAGE_PREFIXES = [
  "planix.",
  "planix:",
  "planix_",
] as const;

const LEGACY_STORAGE_PREFIXES = [
  ["planix.", "planique."],
  ["planix:", "planique:"],
  ["planix_", "planique_"],
] as const;

const ALL_STORAGE_PREFIXES = [
  ...CURRENT_STORAGE_PREFIXES,
  ...LEGACY_STORAGE_PREFIXES.map(([, legacyPrefix]) => legacyPrefix),
] as const;

export function isCompatibleStorageKey(storageKey: string | null | undefined) {
  return typeof storageKey === "string"
    && ALL_STORAGE_PREFIXES.some((prefix) => storageKey.startsWith(prefix));
}

export function getLegacyStorageKeys(storageKey: string) {
  return LEGACY_STORAGE_PREFIXES
    .filter(([nextPrefix]) => storageKey.startsWith(nextPrefix))
    .map(([nextPrefix, legacyPrefix]) => `${legacyPrefix}${storageKey.slice(nextPrefix.length)}`);
}

export function readCompatibleLocalStorageItem(storageKey: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const currentValue = window.localStorage.getItem(storageKey);

  if (currentValue !== null) {
    return currentValue;
  }

  for (const legacyKey of getLegacyStorageKeys(storageKey)) {
    const legacyValue = window.localStorage.getItem(legacyKey);

    if (legacyValue !== null) {
      try {
        window.localStorage.setItem(storageKey, legacyValue);
        window.localStorage.removeItem(legacyKey);
      } catch {
        // Ignore migration write failures and keep the legacy value readable.
      }

      return legacyValue;
    }
  }

  return null;
}

export function writeCompatibleLocalStorageItem(storageKey: string, value: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, value);

  for (const legacyKey of getLegacyStorageKeys(storageKey)) {
    window.localStorage.removeItem(legacyKey);
  }
}

export function removeCompatibleLocalStorageItem(storageKey: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(storageKey);

  for (const legacyKey of getLegacyStorageKeys(storageKey)) {
    window.localStorage.removeItem(legacyKey);
  }
}

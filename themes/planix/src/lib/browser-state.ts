"use client";

import { clearMemoryCacheByPrefix } from "@/lib/resource-memory-cache";
import { isCompatibleStorageKey, removeCompatibleLocalStorageItem } from "@/lib/storage-compat";

export function clearPlanixBrowserState() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const storageKeys: string[] = [];

    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);

      if (typeof key === "string" && isCompatibleStorageKey(key)) {
        storageKeys.push(key);
      }
    }

    storageKeys.forEach((key) => removeCompatibleLocalStorageItem(key));
  } catch {
    // Ignore storage cleanup failures and continue redirecting the user.
  }

  clearMemoryCacheByPrefix("planix.cache");
}

"use client";

import { useEffect } from "react";

import {
  removeCompatibleLocalStorageItem,
  writeCompatibleLocalStorageItem,
} from "@/lib/storage-compat";
import { emitPersistentStateSync } from "@/lib/use-persistent-state";
import type { SettingsBundle } from "@/lib/settings";

export const SETTINGS_WORKSPACE_STORAGE_KEY = "planix.settings.workspace";
export const SETTINGS_NOTIFICATIONS_STORAGE_KEY = "planix.settings.notifications";
export const SETTINGS_PLAN_STORAGE_KEY = "planix.settings.plan";
export const SETTINGS_DEVICES_STORAGE_KEY = "planix.settings.devices";
export const PROJECT_TAGS_STORAGE_KEY = "planix.project.tags";
export const PROJECT_TYPES_STORAGE_KEY = "planix.project.types";

export async function readJsonSafely<T>(response: Response) {
  const text = await response.text();

  if (!text.trim()) {
    return null as T | null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null as T | null;
  }
}

function syncStoredValue<T>(storageKey: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    writeCompatibleLocalStorageItem(storageKey, JSON.stringify(value));
    emitPersistentStateSync(storageKey, value);
  } catch {
    // Ignore storage failures and keep settings usable.
  }
}

function clearStoredValue(storageKey: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    removeCompatibleLocalStorageItem(storageKey);
    emitPersistentStateSync(storageKey, null);
  } catch {
    // Ignore storage failures and keep settings usable.
  }
}

export function syncSettingsLocalBridges(settings: SettingsBundle) {
  syncStoredValue(SETTINGS_WORKSPACE_STORAGE_KEY, settings.workspace);
  syncStoredValue(PROJECT_TAGS_STORAGE_KEY, settings.projectTags);
  syncStoredValue(PROJECT_TYPES_STORAGE_KEY, settings.projectTypes);
  clearStoredValue(SETTINGS_NOTIFICATIONS_STORAGE_KEY);
  clearStoredValue(SETTINGS_PLAN_STORAGE_KEY);
  clearStoredValue(SETTINGS_DEVICES_STORAGE_KEY);
}

export function useSettingsBridgeHydration(enabled = true) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    async function hydrateBridges() {
      try {
        const response = await fetch("/api/settings", { cache: "no-store" });
        const payload = await readJsonSafely<{ settings?: SettingsBundle }>(response);

        if (!cancelled && response.ok && payload?.settings) {
          syncSettingsLocalBridges(payload.settings);
        }
      } catch {
        // Ignore hydration failures and keep existing local bridge values.
      }
    }

    void hydrateBridges();

    return () => {
      cancelled = true;
    };
  }, [enabled]);
}

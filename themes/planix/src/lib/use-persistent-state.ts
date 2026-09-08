"use client";

import { Dispatch, SetStateAction, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  getLegacyStorageKeys,
  readCompatibleLocalStorageItem,
  writeCompatibleLocalStorageItem,
} from "@/lib/storage-compat";
import { hasClientHydrated } from "@/lib/use-hydrated";

export const PERSISTENT_STATE_SYNC_EVENT = "planix:persistent-state-sync";
export const LEGACY_PERSISTENT_STATE_SYNC_EVENT = "planique:persistent-state-sync";

export function emitPersistentStateSync<T>(storageKey: string, value: T, sourceId?: string) {
  if (typeof window === "undefined") {
    return;
  }

  const compatibleStorageKeys = [storageKey, ...getLegacyStorageKeys(storageKey)];
  const eventNames = [PERSISTENT_STATE_SYNC_EVENT, LEGACY_PERSISTENT_STATE_SYNC_EVENT];

  for (const eventName of eventNames) {
    for (const compatibleStorageKey of compatibleStorageKeys) {
      window.dispatchEvent(new CustomEvent(eventName, {
        detail: {
          storageKey: compatibleStorageKey,
          value,
          sourceId,
        },
      }));
    }
  }
}

function serializeStoredValue<T>(value: T) {
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

function readStoredValue<T>(storageKey: string, fallbackValue: T): T {
  if (typeof window === "undefined") {
    return fallbackValue;
  }

  try {
    const storedValue = readCompatibleLocalStorageItem(storageKey);

    return storedValue !== null ? (JSON.parse(storedValue) as T) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

export function usePersistentState<T>(
  storageKey: string,
  initialValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const initialValueRef = useRef(initialValue);
  const canBootstrapFromStorage = typeof window !== "undefined" && hasClientHydrated();
  const instanceIdRef = useRef(`persistent-${Math.random().toString(36).slice(2, 10)}`);
  const lastSerializedValueRef = useRef<string | null>(serializeStoredValue(initialValueRef.current));
  const skipNextBroadcastRef = useRef(false);
  const [value, setValue] = useState<T>(() =>
    canBootstrapFromStorage
      ? readStoredValue(storageKey, initialValueRef.current)
      : initialValueRef.current,
  );
  const [hasLoadedStorage, setHasLoadedStorage] = useState(canBootstrapFromStorage);

  useLayoutEffect(() => {
    const nextValue = readStoredValue(storageKey, initialValueRef.current);
    lastSerializedValueRef.current = serializeStoredValue(nextValue);
    setValue(nextValue);
    setHasLoadedStorage(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hasLoadedStorage) {
      return;
    }

    const serializedValue = serializeStoredValue(value);

    if (skipNextBroadcastRef.current) {
      skipNextBroadcastRef.current = false;
      lastSerializedValueRef.current = serializedValue;
      return;
    }

    if (serializedValue === null || serializedValue === lastSerializedValueRef.current) {
      return;
    }

    try {
      writeCompatibleLocalStorageItem(storageKey, serializedValue);
      lastSerializedValueRef.current = serializedValue;
      emitPersistentStateSync(storageKey, value, instanceIdRef.current);
    } catch {
      // Ignore storage failures and keep the UI functional.
    }
  }, [hasLoadedStorage, storageKey, value]);

  useEffect(() => {
    const compatibleStorageKeys = [storageKey, ...getLegacyStorageKeys(storageKey)];

    function handleStorage(event: StorageEvent) {
      if (!compatibleStorageKeys.includes(event.key ?? "")) {
        return;
      }

      const nextValue = readStoredValue(storageKey, initialValueRef.current);
      const nextSerializedValue = serializeStoredValue(nextValue);

      if (nextSerializedValue === lastSerializedValueRef.current) {
        return;
      }

      skipNextBroadcastRef.current = true;
      lastSerializedValueRef.current = nextSerializedValue;
      setValue(nextValue);
    }

    function handleSync(event: Event) {
      const customEvent = event as CustomEvent<{
        storageKey?: string;
        value?: T;
        sourceId?: string;
      }>;

      if (
        !compatibleStorageKeys.includes(customEvent.detail?.storageKey ?? "")
        || customEvent.detail?.sourceId === instanceIdRef.current
      ) {
        return;
      }

      const nextValue = customEvent.detail.value ?? readStoredValue(storageKey, initialValueRef.current);
      const nextSerializedValue = serializeStoredValue(nextValue);

      if (nextSerializedValue === lastSerializedValueRef.current) {
        return;
      }

      skipNextBroadcastRef.current = true;
      lastSerializedValueRef.current = nextSerializedValue;
      setValue(nextValue);
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener(PERSISTENT_STATE_SYNC_EVENT, handleSync);
    window.addEventListener(LEGACY_PERSISTENT_STATE_SYNC_EVENT, handleSync);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(PERSISTENT_STATE_SYNC_EVENT, handleSync);
      window.removeEventListener(LEGACY_PERSISTENT_STATE_SYNC_EVENT, handleSync);
    };
  }, [storageKey]);

  return [value, setValue];
}

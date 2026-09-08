"use client";

type CacheRecord<T> = {
  value: T;
  updatedAt: number;
};

const resourceMemoryCache = new Map<string, CacheRecord<unknown>>();

export function readMemoryCache<T>(key: string, maxAgeMs = Number.POSITIVE_INFINITY) {
  const record = resourceMemoryCache.get(key) as CacheRecord<T> | undefined;

  if (!record) {
    return null;
  }

  if (Number.isFinite(maxAgeMs) && Date.now() - record.updatedAt > maxAgeMs) {
    resourceMemoryCache.delete(key);
    return null;
  }

  return record.value;
}

export function writeMemoryCache<T>(key: string, value: T) {
  resourceMemoryCache.set(key, {
    value,
    updatedAt: Date.now(),
  });
}

export function clearMemoryCache(key: string) {
  resourceMemoryCache.delete(key);
}

export function clearMemoryCacheByPrefix(prefix: string) {
  for (const key of resourceMemoryCache.keys()) {
    if (key.startsWith(prefix)) {
      resourceMemoryCache.delete(key);
    }
  }
}

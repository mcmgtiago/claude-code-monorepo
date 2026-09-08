"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const ignoredMutationPaths = new Set(["/api/auth/logout"]);

function isMutatingApiRequest(input: RequestInfo | URL, init?: RequestInit) {
  const method =
    init?.method ||
    (typeof input === "object" && "method" in input && typeof input.method === "string" ? input.method : "GET");
  const normalizedMethod = method.toUpperCase();

  if (normalizedMethod === "GET" || normalizedMethod === "HEAD" || normalizedMethod === "OPTIONS") {
    return false;
  }

  const href = typeof input === "string" || input instanceof URL ? input.toString() : input.url;
  const url = new URL(href, window.location.origin);

  return url.origin === window.location.origin && url.pathname.startsWith("/api/") && !ignoredMutationPaths.has(url.pathname);
}

export function CrmLiveRefresh({
  enabled
}: {
  enabled: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const refreshTimerRef = useRef<number | null>(null);
  const latestMutationAtRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const scheduleRefresh = () => {
      if (refreshTimerRef.current !== null) {
        window.clearTimeout(refreshTimerRef.current);
      }

      refreshTimerRef.current = window.setTimeout(() => {
        refreshTimerRef.current = null;
        router.refresh();
      }, 80);
    };

    const originalFetch = window.fetch.bind(window);

    window.fetch = async (input, init) => {
      const shouldRefresh = isMutatingApiRequest(input, init);
      const response = await originalFetch(input, init);

      if (shouldRefresh && response.ok) {
        latestMutationAtRef.current = Date.now();
        scheduleRefresh();
      }

      return response;
    };

    const handlePopState = () => {
      window.setTimeout(scheduleRefresh, 0);
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        scheduleRefresh();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        scheduleRefresh();
      }
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (refreshTimerRef.current !== null) {
        window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }

      window.fetch = originalFetch;
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, router]);

  useEffect(() => {
    if (!enabled || latestMutationAtRef.current === 0) {
      return;
    }

    if (Date.now() - latestMutationAtRef.current > 60000) {
      return;
    }

    if (refreshTimerRef.current !== null) {
      window.clearTimeout(refreshTimerRef.current);
    }

    refreshTimerRef.current = window.setTimeout(() => {
      refreshTimerRef.current = null;
      router.refresh();
    }, 80);
  }, [enabled, pathname, router, searchParams]);

  return null;
}

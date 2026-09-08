"use client";

import type { Route } from "next";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const crmRoutes: Route[] = [
  "/" as Route,
  "/pipeline" as Route,
  "/leads" as Route,
  "/contacts" as Route,
  "/companies" as Route,
  "/tasks" as Route,
  "/meetings" as Route,
  "/analytics" as Route,
  "/notifications" as Route,
  "/team" as Route,
  "/settings" as Route,
  "/inbox" as Route
];

const superuserRoutes: Route[] = ["/superuser" as Route];

type IdleWindow = Window &
  typeof globalThis & {
    requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number;
    cancelIdleCallback?: (handle: number) => void;
  };

export function RoutePrefetcher({
  enabled,
  superuser = false
}: {
  enabled: boolean;
  superuser?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const routes = (superuser ? superuserRoutes : crmRoutes).filter((route) => route !== pathname);
    const timeoutIds: number[] = [];
    let cancelled = false;

    const prefetchRoutes = () => {
      routes.forEach((route, index) => {
        const timeoutId = window.setTimeout(() => {
          if (!cancelled) {
            router.prefetch(route);
          }
        }, index * 180);
        timeoutIds.push(timeoutId);
      });
    };

    const idleWindow = window as IdleWindow;

    if (typeof idleWindow.requestIdleCallback === "function" && typeof idleWindow.cancelIdleCallback === "function") {
      const idleId = idleWindow.requestIdleCallback(prefetchRoutes, { timeout: 2500 });

      return () => {
        cancelled = true;
        idleWindow.cancelIdleCallback?.(idleId);
        timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
      };
    }

    const startTimeoutId = window.setTimeout(prefetchRoutes, 1200);
    timeoutIds.push(startTimeoutId);

    return () => {
      cancelled = true;
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [enabled, pathname, router, superuser]);

  return null;
}

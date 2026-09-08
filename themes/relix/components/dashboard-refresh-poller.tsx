"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

const refreshablePaths = new Set(["/", "/analytics"]);
const initialSyncDelayMs = 5000;
const syncIntervalMs = 60000;

type SyncResponse = {
  synced?: number;
  repaired?: number;
  updated?: number;
};

function emitMailSyncState(syncing: boolean) {
  window.dispatchEvent(new CustomEvent("crm-mail-sync-state", { detail: { syncing } }));
}

function hasMailboxChanges(result: SyncResponse | null) {
  return Boolean((result?.synced ?? 0) > 0 || (result?.repaired ?? 0) > 0 || (result?.updated ?? 0) > 0);
}

export function DashboardRefreshPoller() {
  const pathname = usePathname();
  const router = useRouter();
  const syncInFlightRef = useRef(false);

  useEffect(() => {
    if (!refreshablePaths.has(pathname)) {
      return;
    }

    const refresh = () => {
      if (syncInFlightRef.current) {
        return;
      }

      if (document.visibilityState !== "visible") {
        return;
      }

      syncInFlightRef.current = true;
      emitMailSyncState(true);

      void (async () => {
        let shouldRefresh = false;

        try {
          const response = await fetch("/api/email/sync", {
            method: "POST",
            headers: { "content-type": "application/json" },
            cache: "no-store"
          });
          const result = (await response.json().catch(() => null)) as SyncResponse | null;
          shouldRefresh = response.ok && hasMailboxChanges(result);
        } catch {
          // Silent retry on next poll.
        } finally {
          if (shouldRefresh) {
            const savedScroll = window.scrollY;
            router.refresh();
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                window.scrollTo({ top: savedScroll, behavior: "instant" });
              });
            });
          }

          emitMailSyncState(false);
          syncInFlightRef.current = false;
        }
      })();
    };

    const initialTimeoutId = window.setTimeout(refresh, initialSyncDelayMs);
    const intervalId = window.setInterval(refresh, syncIntervalMs);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      window.clearTimeout(initialTimeoutId);
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
      emitMailSyncState(false);
    };
  }, [pathname, router]);

  return null;
}

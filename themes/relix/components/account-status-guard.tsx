"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";

export function AccountStatusGuard() {
  const router = useRouter();
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    const check = async () => {
      try {
        const response = await fetch("/api/auth/state", {
          method: "GET",
          cache: "no-store"
        });
        const payload = (await response.json().catch(() => null)) as { redirectTo?: string; status?: string } | null;

        if (cancelled) {
          return;
        }

        if (response.status === 403 && payload?.status === "SUSPENDED") {
          setBlocked(true);
          router.replace((payload.redirectTo || "/blocked") as Route);
          router.refresh();
          return;
        }

        if (response.status === 401 && payload?.redirectTo) {
          router.replace(payload.redirectTo as Route);
          router.refresh();
        }
      } catch {
        // Ignore transient network failures and retry on the next interval.
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void check();
      }
    };

    void check();
    intervalId = setInterval(() => void check(), 30_000);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [router]);

  if (!blocked) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(15,23,42,0.92)] px-4">
      <div className="w-full max-w-3xl rounded-[32px] border border-red-200/40 bg-[linear-gradient(180deg,rgba(127,29,29,0.24),rgba(15,23,42,0.96))] p-8 text-white shadow-[0_32px_110px_rgba(15,23,42,0.42)] sm:p-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-red-300/30 bg-red-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-red-100">
          <ShieldAlert className="h-4 w-4" />
          Access blocked
        </div>
        <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">Your account has been suspended.</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
          Workspace access has been disabled. You are being redirected to the blocked account screen and all protected actions are now locked.
        </p>
      </div>
    </div>
  );
}

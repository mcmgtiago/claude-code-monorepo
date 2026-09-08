"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { AppLogo } from "@/components/app-logo";

type SuperuserShellProps = {
  children: React.ReactNode;
  currentUser: {
    fullName: string;
    email: string;
  };
  appName?: string;
  appLogoUrl?: string;
};

export function SuperuserShell({ children, currentUser, appName = "Relix", appLogoUrl = "" }: SuperuserShellProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(56,109,244,0.12),transparent_32%),linear-gradient(180deg,#f7faff_0%,#eef4ff_100%)]">
      <header className="border-b border-slate-200/80 bg-white/88 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <AppLogo src={appLogoUrl || undefined} className="h-11 w-[37px] shrink-0 sm:h-12 sm:w-[40px]" />
            <div>
              <div className="flex items-center gap-2 text-slate-900">
                <span className="text-[1.18rem] font-semibold tracking-tight">{appName}</span>
                <span className="rounded-full border border-[#d7e4ff] bg-[#eef4ff] px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-[#386df4]">
                  Superuser
                </span>
              </div>
              <div className="text-sm text-slate-500">Global users, workspaces, and platform defaults</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-right sm:block">
              <div className="text-sm font-semibold text-slate-900">{currentUser.fullName}</div>
              <div className="text-xs text-slate-500">{currentUser.email}</div>
            </div>
            <button
              onClick={() => {
                void (async () => {
                  setIsSigningOut(true);
                  await fetch("/api/auth/logout", { method: "POST" });
                  router.push("/login");
                  router.refresh();
                })();
              }}
              disabled={isSigningOut}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" />
              {isSigningOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

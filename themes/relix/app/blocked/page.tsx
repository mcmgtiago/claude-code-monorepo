import type { Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { getAuthenticatedHomeRoute, getSessionAccountState } from "@/lib/auth-server";
import { getPlatformSettings } from "@/lib/platform-settings";

type BlockedPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BlockedPage({ searchParams }: BlockedPageProps) {
  const [state, platform] = await Promise.all([getSessionAccountState(), getPlatformSettings()]);
  const params = searchParams ? await searchParams : null;

  if (state?.account?.status === "ACTIVE" && state.isSessionCurrent) {
    redirect(getAuthenticatedHomeRoute(state.account));
  }

  const suspendedAccount = state?.account?.status === "SUSPENDED" ? state.account : null;
  const emailFromQuery = typeof params?.email === "string" ? params.email : null;
  const email = suspendedAccount?.email || emailFromQuery || "your workspace email";
  const workspaceName = suspendedAccount?.workspaceName;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(248,113,113,0.16),transparent_42%),linear-gradient(180deg,#fff7f5_0%,#fff 52%,#f8fafc_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
        <section className="w-full overflow-hidden rounded-[36px] border border-red-200/80 bg-white shadow-[0_28px_90px_rgba(127,29,29,0.14)]">
          <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="border-b border-red-100 bg-[linear-gradient(180deg,#fff1ee_0%,#fff8f6_100%)] p-8 sm:p-10 lg:border-b-0 lg:border-r">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-red-600">
                <ShieldAlert className="h-4 w-4" />
                Access blocked
              </div>
              <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                This account has been suspended.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Access to {platform.appName} CRM is currently disabled for <span className="font-semibold text-slate-900">{email}</span>.
                {workspaceName ? ` Workspace: ${workspaceName}.` : ""} Contact your workspace admin or superuser to restore access.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-red-100 bg-white/90 p-5">
                  <div className="text-sm font-semibold text-slate-900">What is blocked</div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Dashboard, workspace data, email sync, reminders, tasks, and every protected workspace action.</p>
                </div>
                <div className="rounded-3xl border border-red-100 bg-white/90 p-5">
                  <div className="text-sm font-semibold text-slate-900">What to do next</div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Ask an admin to reactivate your account. Once restored, sign in again to continue.</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-between bg-slate-950 p-8 text-white sm:p-10">
              <div>
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-red-500/18 text-red-200">
                  <AlertTriangle className="h-8 w-8" />
                </div>
                <div className="mt-8 text-xs font-semibold uppercase tracking-[0.26em] text-red-200">Account status</div>
                <div className="mt-3 text-3xl font-semibold tracking-tight">Suspended</div>
                <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
                  This screen appears when a suspended account tries to sign in or when an active session is blocked by an admin. It is intentionally non-dismissible.
                </p>
              </div>
              <div className="mt-10 flex flex-col gap-3">
                <Link
                  href={"/login" as Route}
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  Back to sign in
                </Link>
                <p className="text-xs leading-6 text-slate-400">If this was unexpected, contact your workspace administrator or the {platform.appName} superuser.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

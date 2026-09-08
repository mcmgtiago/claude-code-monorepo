"use client";

import type { Route } from "next";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Menu } from "lucide-react";
import { AccountStatusGuard } from "@/components/account-status-guard";
import { AppLogo } from "@/components/app-logo";
import { DashboardRefreshPoller } from "@/components/dashboard-refresh-poller";
import { CrmLiveRefresh } from "@/components/crm-live-refresh";
import { ReminderDeliveryPoller } from "@/components/reminder-delivery-poller";
import { RoutePrefetcher } from "@/components/route-prefetcher";
import { RouteSkeleton } from "@/components/route-skeletons";
import { Sidebar } from "@/components/sidebar";
import { SuperuserShell } from "@/components/superuser-shell";
import { WorkspaceSwitcherModal } from "@/components/workspace-switcher-modal";
import { hasRouteSkeletonBeenSeen, markRouteSkeletonSeen, normalizeRouteKey, shouldShowRouteSkeleton } from "@/lib/route-skeleton";

type AppShellProps = {
  children: React.ReactNode;
  currentUser: {
    id: string;
    fullName: string;
    email: string;
    profileImageUrl?: string | null;
    onboardingCompleted?: boolean;
    accessRole?: string;
  } | null;
  appName?: string;
  appLogoUrl?: string;
  unreadNotificationsCount?: number;
  upcomingMeetingsCount?: number;
  openConversationsCount?: number;
};

type ShellCounts = {
  unreadNotificationsCount?: number;
  upcomingMeetingsCount?: number;
  openConversationsCount?: number;
};

const chromeLessPaths = new Set(["/login", "/signup", "/forgot-password", "/reset-password", "/blocked"]);

export function AppShell({
  children,
  currentUser,
  appName = "Relix",
  appLogoUrl = "",
  unreadNotificationsCount = 0,
  upcomingMeetingsCount = 0,
  openConversationsCount = 0
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const [desktopSidebarPreferenceReady, setDesktopSidebarPreferenceReady] = useState(false);
  const [liveUnreadNotificationsCount, setLiveUnreadNotificationsCount] = useState(unreadNotificationsCount);
  const [liveUpcomingMeetingsCount, setLiveUpcomingMeetingsCount] = useState(upcomingMeetingsCount);
  const [liveOpenConversationsCount, setLiveOpenConversationsCount] = useState(openConversationsCount);
  const [isMailSyncing, setIsMailSyncing] = useState(false);
  const [pendingSkeletonKey, setPendingSkeletonKey] = useState<string | null>(null);
  const isAuthPage = chromeLessPaths.has(pathname);
  const isOnboardingPage = pathname === "/onboarding";
  const isPublicMeetingPage = pathname.startsWith("/meet/");
  const isSuperuser = currentUser?.accessRole === "SUPERUSER";
  const isSuperuserPage = pathname.startsWith("/superuser");
  const desktopSidebarWidth = desktopSidebarCollapsed ? 84 : 224;
  const searchParamString = searchParams.toString();
  const currentLocationKey = searchParamString ? `${pathname}?${searchParamString}` : pathname;

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    if (isSuperuser && !isAuthPage && !isPublicMeetingPage && !isSuperuserPage) {
      router.replace("/superuser" as Route);
      return;
    }

    if (!isSuperuser && currentUser.onboardingCompleted === false && !isOnboardingPage && !isAuthPage) {
      router.replace("/onboarding" as Route);
      return;
    }

    if (isSuperuser && isOnboardingPage) {
      router.replace("/superuser" as Route);
      return;
    }

    if (!isSuperuser && currentUser.onboardingCompleted === true && isOnboardingPage) {
      router.replace("/" as Route);
    }
  }, [currentUser, isAuthPage, isOnboardingPage, isPublicMeetingPage, isSuperuser, isSuperuserPage, router]);

  useEffect(() => {
    if (!mobileNavOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    setLiveUnreadNotificationsCount(unreadNotificationsCount);
  }, [unreadNotificationsCount]);

  useEffect(() => {
    setLiveUpcomingMeetingsCount(upcomingMeetingsCount);
  }, [upcomingMeetingsCount]);

  useEffect(() => {
    setLiveOpenConversationsCount(openConversationsCount);
  }, [openConversationsCount]);

  useEffect(() => {
    if (!currentUser || isAuthPage || isOnboardingPage || isPublicMeetingPage || isSuperuserPage) {
      return;
    }

    const controller = new AbortController();

    void (async () => {
      try {
        const response = await fetch("/api/app-shell/counts", {
          headers: { accept: "application/json" },
          cache: "no-store",
          signal: controller.signal
        });
        const payload = (await response.json().catch(() => null)) as ShellCounts | null;

        if (!response.ok || !payload) {
          return;
        }

        setLiveUnreadNotificationsCount(payload.unreadNotificationsCount ?? 0);
        setLiveUpcomingMeetingsCount(payload.upcomingMeetingsCount ?? 0);
        setLiveOpenConversationsCount(payload.openConversationsCount ?? 0);
      } catch (error) {
        if ((error as { name?: string })?.name !== "AbortError") {
          // Counts are decorative; never block route changes for them.
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, [currentUser, isAuthPage, isOnboardingPage, isPublicMeetingPage, isSuperuserPage, pathname]);

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<{ count: number }>;
      setLiveOpenConversationsCount(customEvent.detail.count);
    };
    window.addEventListener("crm-inbox-unread-changed", handler);
    return () => window.removeEventListener("crm-inbox-unread-changed", handler);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<{ count: number }>;
      setLiveUnreadNotificationsCount(customEvent.detail.count);
    };
    window.addEventListener("crm-notifications-unread-changed", handler);
    return () => window.removeEventListener("crm-notifications-unread-changed", handler);
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ syncing?: boolean }>;
      setIsMailSyncing(Boolean(customEvent.detail?.syncing));
    };
    window.addEventListener("crm-mail-sync-state", handler);
    return () => window.removeEventListener("crm-mail-sync-state", handler);
  }, []);

  const skeletonShownAtRef = useRef(0);
  const pendingSkeletonKeyRef = useRef<string | null>(null);

  const handleBeforeNavigate = useCallback((href: string) => {
    const targetUrl = new URL(href, window.location.origin);
    const targetLocationKey = `${targetUrl.pathname}${targetUrl.search}`;
    if (targetLocationKey === currentLocationKey) {
      return;
    }

    const routeKey = normalizeRouteKey(href);
    if (shouldShowRouteSkeleton(routeKey) && !hasRouteSkeletonBeenSeen(routeKey)) {
      skeletonShownAtRef.current = performance.now();
      pendingSkeletonKeyRef.current = routeKey;
      setPendingSkeletonKey(routeKey);
    }
  }, [currentLocationKey]);

  useEffect(() => {
    markRouteSkeletonSeen(normalizeRouteKey(pathname));
  }, [pathname]);

  useEffect(() => {
    if (!pendingSkeletonKeyRef.current) return;
    const elapsed = performance.now() - skeletonShownAtRef.current;
    const remaining = Math.max(0, 350 - elapsed);
    const id = setTimeout(() => {
      pendingSkeletonKeyRef.current = null;
      setPendingSkeletonKey(null);
    }, remaining);
    return () => clearTimeout(id);
  }, [currentLocationKey]);

  useEffect(() => {
    const storedValue = window.localStorage.getItem("crm-sidebar-collapsed");
    setDesktopSidebarCollapsed(storedValue === "true");
    setDesktopSidebarPreferenceReady(true);
  }, []);

  useEffect(() => {
    if (!desktopSidebarPreferenceReady) {
      return;
    }

    window.localStorage.setItem("crm-sidebar-collapsed", String(desktopSidebarCollapsed));
  }, [desktopSidebarCollapsed, desktopSidebarPreferenceReady]);

  if (currentUser && !isSuperuser && currentUser.onboardingCompleted === false && !isOnboardingPage && !isAuthPage) {
    return <main className="min-h-screen bg-[#f6f9ff]" />;
  }

  if (isAuthPage || isOnboardingPage || isPublicMeetingPage) {
    return <main>{children}</main>;
  }

  if (isSuperuser && !isSuperuserPage) {
    return <main className="min-h-screen bg-[#f6f9ff]" />;
  }

  if (isSuperuser && currentUser) {
    return (
      <>
        <AccountStatusGuard />
        <RoutePrefetcher enabled superuser />
        <SuperuserShell
          currentUser={{
            fullName: currentUser.fullName,
            email: currentUser.email
          }}
          appName={appName}
          appLogoUrl={appLogoUrl}
        >
          {children}
        </SuperuserShell>
      </>
    );
  }

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-[#f6f9ff] transition-[grid-template-columns] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] xl:grid"
      style={{ gridTemplateColumns: `${desktopSidebarWidth}px minmax(0, 1fr)` }}
    >
      <AccountStatusGuard />
      <RoutePrefetcher enabled />
      <CrmLiveRefresh enabled={Boolean(currentUser)} />
      <DashboardRefreshPoller />
      <ReminderDeliveryPoller initialUnreadNotificationsCount={liveUnreadNotificationsCount} />
      {currentUser ? <WorkspaceSwitcherModal autoPrompt /> : null}
      <Sidebar
        key="desktop-sidebar"
        currentUser={currentUser}
        appName={appName}
        appLogoUrl={appLogoUrl}
        unreadNotificationsCount={liveUnreadNotificationsCount}
        upcomingMeetingsCount={liveUpcomingMeetingsCount}
        openConversationsCount={liveOpenConversationsCount}
        isMailSyncing={isMailSyncing}
        collapsed={desktopSidebarCollapsed}
        onToggleCollapse={() => setDesktopSidebarCollapsed((current) => !current)}
        onBeforeNavigate={handleBeforeNavigate}
      />
      <Sidebar
        key="mobile-sidebar"
        currentUser={currentUser}
        appName={appName}
        appLogoUrl={appLogoUrl}
        unreadNotificationsCount={liveUnreadNotificationsCount}
        upcomingMeetingsCount={liveUpcomingMeetingsCount}
        openConversationsCount={liveOpenConversationsCount}
        isMailSyncing={isMailSyncing}
        mobile
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        onBeforeNavigate={handleBeforeNavigate}
      />
      {mobileNavOpen ? <button onClick={() => setMobileNavOpen(false)} className="fixed inset-0 z-40 bg-[rgba(15,23,42,0.28)] xl:hidden" aria-label="Close navigation" /> : null}
      <main className="min-w-0 overflow-x-hidden px-3 py-3 md:px-5 lg:px-6">
        <div className="mb-3 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3.5 py-3 sm:px-4 sm:py-3.5 xl:hidden">
          <div className="flex min-w-0 items-center gap-3">
            <AppLogo src={appLogoUrl || undefined} className="h-11 w-[37px] shrink-0 sm:h-12 sm:w-[40px]" />
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-1.5">
                <div className="truncate leading-none text-[1.12rem] font-semibold tracking-tight text-slate-900 sm:text-[1.2rem]">{appName}</div>
                <span className="mt-0.5 shrink-0 self-start inline-flex items-center justify-center rounded-full border border-[#d7e4ff] bg-[#eef4ff] pl-[calc(0.375rem+0.24em)] pr-1.5 py-0.5 align-top text-[0.45rem] font-semibold uppercase tracking-[0.24em] text-[#386df4] sm:text-[0.5rem]">
                  CRM
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setMobileNavOpen(true)}
            className="rounded-xl border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50"
            aria-label="Open navigation"
          >
            <Menu className="h-4.5 w-4.5" />
          </button>
        </div>
        {pendingSkeletonKey ? (
          <div className="min-h-[calc(100vh-2rem)]">
            <RouteSkeleton routeKey={pendingSkeletonKey} />
          </div>
        ) : null}
        <div className={pendingSkeletonKey ? "hidden" : undefined}>
          {children}
        </div>
      </main>
    </div>
  );
}

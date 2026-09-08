"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Bell,
  Building2,
  ChevronDown,
  Cog,
  ContactRound,
  FolderKanban,
  Home,
  Inbox,
  CalendarDays,
  CheckSquare,
  ListFilter,
  ListTodo,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Search,
  Shield,
  X,
  UserRoundCheck,
  Users,
  BarChart3
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppLogo } from "@/components/app-logo";
import { useConfirmAction } from "@/components/confirm-action-modal";
import { SearchHotkeyButton, useCommandKFocus } from "@/components/search-hotkey";
import { cn } from "@/lib/utils";

type NavItem = {
  href: Route;
  label: string;
  icon: LucideIcon;
};

type SidebarSearchItem = {
  href: Route | { pathname: Route; query: Record<string, string> };
  label: string;
  groupLabel: string;
  keywords: string;
};

const taskSubItems = [
  { href: "/tasks" as Route, label: "All Tasks", section: "all", icon: ListTodo },
  { href: { pathname: "/tasks", query: { section: "status" } }, label: "By Status", section: "status", icon: ListFilter },
  { href: { pathname: "/tasks", query: { section: "assigned" } }, label: "Assigned to Me", section: "assigned", icon: UserRoundCheck }
] as const;

const sidebarItemClassName =
  "group relative flex items-center gap-2 overflow-hidden rounded-xl border border-transparent px-3 py-2 text-[13px] outline-none transition-[background-color,border-color,color,box-shadow] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-[inset_0_0_0_1px_rgb(226,232,240)] hover:bg-white hover:text-slate-900 focus-visible:border-[#9db7ff] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#386df4]/20";

const sidebarSubItemClassName =
  "group relative mt-1 flex items-center gap-2 overflow-hidden rounded-xl border border-transparent px-3 py-2 text-[13px] first:mt-0 outline-none transition-[background-color,border-color,color,box-shadow] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-[inset_0_0_0_1px_rgb(226,232,240)] hover:bg-white hover:text-slate-900 focus-visible:border-[#9db7ff] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#386df4]/20";

const sidebarActiveItemClassName =
  "border-[#bdd0ff] bg-[linear-gradient(135deg,#ffffff_0%,#eef4ff_48%,#f8fbff_100%)] font-medium text-slate-900 shadow-[inset_0_0_0_1px_rgba(56,109,244,0.14),inset_0_1px_0_rgba(255,255,255,0.98),0_12px_26px_-22px_rgba(56,109,244,0.82)] hover:shadow-[inset_0_0_0_1px_rgba(56,109,244,0.14),inset_0_1px_0_rgba(255,255,255,0.98),0_12px_26px_-22px_rgba(56,109,244,0.82)] hover:border-[#bdd0ff] hover:bg-[linear-gradient(135deg,#ffffff_0%,#eef4ff_48%,#f8fbff_100%)] hover:text-slate-900";

const sidebarInactiveItemClassName =
  "font-normal text-slate-600";

const sidebarActiveSubItemClassName =
  "border-[#c8d8ff] bg-[linear-gradient(135deg,#ffffff_0%,#f1f6ff_100%)] font-medium text-[#386df4] shadow-[inset_0_0_0_1px_rgba(56,109,244,0.12),inset_0_1px_0_rgba(255,255,255,0.95),0_8px_18px_-18px_rgba(56,109,244,0.72)] hover:shadow-[inset_0_0_0_1px_rgba(56,109,244,0.12),inset_0_1px_0_rgba(255,255,255,0.95),0_8px_18px_-18px_rgba(56,109,244,0.72)] hover:border-[#c8d8ff] hover:bg-[linear-gradient(135deg,#ffffff_0%,#f1f6ff_100%)] hover:text-[#386df4]";

const sidebarInactiveSubItemClassName =
  "font-normal text-slate-500";

function SidebarActiveChrome({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <>
      {!collapsed ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-2.5 left-1.5 w-1 rounded-full bg-[linear-gradient(180deg,#386df4_0%,#5d84ff_58%,#9db7ff_100%)] shadow-[0_0_12px_rgba(56,109,244,0.34)]"
        />
      ) : null}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-8 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-[#386df4]/10 blur-xl"
      />
    </>
  );
}

const groups: Array<{ title?: string; items: NavItem[] }> = [
  {
    items: [{ href: "/", label: "Dashboard", icon: Home }]
  },
  {
    title: "Prospecting",
    items: [
      { href: "/contacts", label: "People", icon: ContactRound },
      { href: "/companies", label: "Companies", icon: Building2 },
      { href: "/pipeline", label: "Pipeline", icon: FolderKanban }
    ]
  },
  {
    title: "Communication",
    items: [
      { href: "/inbox", label: "Emails", icon: Inbox },
      { href: "/meetings", label: "Meetings", icon: CalendarDays }
    ]
  },
  {
    title: "Execution",
    items: [
      { href: "/tasks", label: "Tasks", icon: CheckSquare },
      { href: "/analytics", label: "Analytics", icon: BarChart3 }
    ]
  },
  {
    title: "Other",
    items: [
      { href: "/team" as Route, label: "Team", icon: Users },
      { href: "/notifications", label: "Notifications", icon: Bell },
      { href: "/settings", label: "Settings", icon: Cog }
    ]
  }
];

export function Sidebar({
  currentUser,
  appName = "Relix",
  appLogoUrl = "",
  unreadNotificationsCount = 0,
  upcomingMeetingsCount = 0,
  openConversationsCount = 0,
  isMailSyncing = false,
  mobile = false,
  open = false,
  collapsed = false,
  onClose,
  onToggleCollapse,
  onBeforeNavigate
}: {
  currentUser: {
    id: string;
    fullName: string;
    email: string;
    profileImageUrl?: string | null;
    accessRole?: string;
  } | null;
  appName?: string;
  appLogoUrl?: string;
  unreadNotificationsCount?: number;
  upcomingMeetingsCount?: number;
  openConversationsCount?: number;
  isMailSyncing?: boolean;
  mobile?: boolean;
  open?: boolean;
  collapsed?: boolean;
  onClose?: () => void;
  onToggleCollapse?: () => void;
  onBeforeNavigate?: (href: string) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { confirm: requestConfirmation, confirmationDialog } = useConfirmAction();
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [tasksExpanded, setTasksExpanded] = useState(pathname.startsWith("/tasks"));
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [sidebarQuery, setSidebarQuery] = useState("");
  const [pendingSearchFocus, setPendingSearchFocus] = useState(false);
  const collapsedDesktop = !mobile && collapsed;
  const textTransitionClassName =
    "overflow-hidden transition-[max-width,opacity,transform,max-height,margin] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]";
  useCommandKFocus(searchInputRef, { enabled: mobile ? open : !collapsedDesktop, priority: 0 });

  useEffect(() => {
    if (pathname.startsWith("/tasks")) {
      setTasksExpanded(true);
    }
    if (mobile) {
      onClose?.();
    }
  }, [mobile, pathname]);

  useEffect(() => {
    if (!collapsedDesktop) {
      return;
    }

    setSidebarQuery("");
  }, [collapsedDesktop]);

  useEffect(() => {
    if (!pendingSearchFocus || collapsedDesktop) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
      setPendingSearchFocus(false);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [collapsedDesktop, pendingSearchFocus]);

  const activeTaskSection = searchParams.get("section") || "all";
  const navGroups = useMemo(() => {
    if (currentUser?.accessRole !== "SUPERUSER") {
      return groups;
    }

    return groups.map((group) =>
      group.title === "Other"
        ? {
            ...group,
            items: [...group.items, { href: "/superuser" as Route, label: "Superuser", icon: Shield }]
          }
        : group
    );
  }, [currentUser?.accessRole]);
  const userLabel = currentUser?.fullName || "Guest user";
  const userEmail = currentUser?.email || "Not signed in";
  const profileImageUrl = currentUser?.profileImageUrl || "";
  const searchWrapperClassName = mobile
    ? "w-full"
    : collapsedDesktop
      ? "mx-auto w-[44px]"
      : "mx-2";
  const initials = userLabel
    .split(" ")
    .map((part) => part[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const sidebarSearchItems = useMemo<SidebarSearchItem[]>(
      () => [
      ...navGroups.flatMap((group) =>
        group.items
          .filter((item) => item.href !== "/tasks")
          .map((item) => ({
            href: item.href,
            label: item.label,
            groupLabel: group.title || "Main",
            keywords: `${group.title || ""} ${item.label}`.toLowerCase()
          }))
      ),
      ...taskSubItems.map((item) => ({
        href: item.href,
        label: item.label,
        groupLabel: "Tasks",
        keywords: `tasks ${item.label}`.toLowerCase()
      }))
    ],
    [navGroups]
  );

  const normalizedSidebarQuery = sidebarQuery.trim().toLowerCase();
  const filteredSidebarItems = useMemo(
    () =>
      normalizedSidebarQuery
        ? sidebarSearchItems.filter((item) => item.keywords.includes(normalizedSidebarQuery)).slice(0, 6)
        : [],
    [normalizedSidebarQuery, sidebarSearchItems]
  );

  const getSidebarSearchHref = (href: SidebarSearchItem["href"]): Route => {
    if (typeof href === "string") {
      return href;
    }

    const params = new URLSearchParams(href.query);
    const queryString = params.toString();
    return (queryString ? `${href.pathname}?${queryString}` : href.pathname) as Route;
  };

  const navigateFromSidebarSearch = (item: SidebarSearchItem) => {
    const href = getSidebarSearchHref(item.href);
    onBeforeNavigate?.(href);
    router.push(href);
    setSidebarQuery("");
    onClose?.();
  };

  const focusSidebarSearch = () => {
    if (collapsedDesktop) {
      onToggleCollapse?.();
      setPendingSearchFocus(true);
      return;
    }

    searchInputRef.current?.focus();
  };

  const handleSignOut = () => {
    void (async () => {
      const confirmed = await requestConfirmation({
        title: "Sign out of workspace?",
        description: "Your current session will end and you will be redirected to the login screen.",
        confirmLabel: "Sign out",
        tone: "warning"
      });
      if (!confirmed) {
        return;
      }

      setIsSigningOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login" as Route);
      router.refresh();
    })();
  };

  return (
    <aside
      className={cn(
        "h-screen overflow-x-hidden overflow-y-auto overscroll-y-contain border-slate-200 bg-[#fbfcff] transition-[width,transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        mobile
          ? `fixed inset-y-0 left-0 z-50 w-[min(88vw,248px)] border-r transition-transform duration-200 ${
              open ? "translate-x-0" : "-translate-x-full"
            }`
          : "sticky top-0 hidden w-full border-r xl:block"
      )}
      aria-hidden={mobile ? !open : undefined}
    >
      <div className={cn("flex min-h-full flex-col py-4 transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]", collapsedDesktop ? "px-2" : "px-3.5")}>
        <div className={cn("flex gap-3 px-2", collapsedDesktop ? "flex-col items-center gap-2 px-1.5" : "items-center justify-between gap-2")}>
          <div className={cn("flex min-w-0 items-center", collapsedDesktop ? "w-full justify-center gap-0" : "flex-1 gap-2.5")}>
            <AppLogo
              src={appLogoUrl || undefined}
              className={cn(
                "shrink-0",
                collapsedDesktop ? "h-[48px] w-[40px]" : "h-10 w-[34px] sm:h-11 sm:w-[37px]"
              )}
            />
            <div
              className={cn(
                "min-w-0 overflow-hidden whitespace-nowrap transition-[max-width,max-height,opacity,transform,margin] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                collapsedDesktop ? "ml-0 max-h-0 max-w-0 -translate-x-1 opacity-0" : "ml-0 flex-1 max-h-10 max-w-[11.5rem] translate-x-0 opacity-100"
              )}
              aria-hidden={collapsedDesktop}
            >
              <div className="flex min-w-0 flex-nowrap items-start gap-1 pt-0.5">
                <div className="truncate whitespace-nowrap leading-none text-[1.36rem] font-semibold tracking-tight text-slate-900 sm:text-[1.52rem]">{appName}</div>
                <span className="relative -top-0.5 shrink-0 inline-flex items-center justify-center rounded-full border border-[#d7e4ff] bg-[#eef4ff] pl-[calc(0.375rem+0.24em)] pr-1.5 py-0.5 text-[0.45rem] font-semibold uppercase tracking-[0.24em] text-[#386df4] sm:text-[0.5rem]">
                  CRM
                </span>
              </div>
            </div>
          </div>
          {!mobile && collapsedDesktop ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="inline-flex h-[2.15rem] w-[2.15rem] shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-[0_8px_24px_rgba(15,23,42,0.05)] hover:border-slate-300 hover:text-slate-700"
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <PanelLeftOpen className="h-[1.05rem] w-[1.05rem]" />
            </button>
          ) : null}
          {!mobile && !collapsedDesktop ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-[0_8px_24px_rgba(15,23,42,0.05)] hover:border-slate-300 hover:text-slate-700"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          ) : null}
          {mobile ? (
            <button type="button" aria-label="Close navigation" onClick={onClose} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 xl:hidden">
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div suppressHydrationWarning className={cn("relative mt-3.5", searchWrapperClassName)}>
          {collapsedDesktop ? (
            <button
              type="button"
              onClick={focusSidebarSearch}
              className="mx-auto flex h-11 w-11 items-center justify-center rounded-[18px] border border-slate-200 bg-white text-slate-500 shadow-[0_10px_24px_rgba(15,23,42,0.04)] hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
              aria-label="Expand sidebar and search pages"
              title="Search pages"
            >
              <Search className="h-[1.05rem] w-[1.05rem]" />
            </button>
          ) : (
            <>
              <div className="rounded-xl border border-slate-200 bg-white px-2.5 py-2">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Search className="h-4 w-4 shrink-0" />
                  <input
                    ref={searchInputRef}
                    value={sidebarQuery}
                    onChange={(event) => setSidebarQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && filteredSidebarItems[0]) {
                        event.preventDefault();
                        navigateFromSidebarSearch(filteredSidebarItems[0]);
                      }

                      if (event.key === "Escape") {
                        setSidebarQuery("");
                      }
                    }}
                    placeholder="Search pages"
                    className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  />
                  <SearchHotkeyButton inputRef={searchInputRef} className="static translate-y-0" />
                </div>
              </div>

              {filteredSidebarItems.length ? (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
                  {filteredSidebarItems.map((item) => (
                    <button
                      key={`${item.groupLabel}-${item.label}`}
                      type="button"
                      onClick={() => navigateFromSidebarSearch(item)}
                      className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left text-sm last:border-b-0 hover:bg-slate-50"
                    >
                      <div>
                        <div className="font-medium text-slate-900">{item.label}</div>
                        <div className="mt-0.5 text-xs text-slate-400">{item.groupLabel}</div>
                      </div>
                      <span className="text-xs text-slate-400">Open</span>
                    </button>
                  ))}
                </div>
              ) : normalizedSidebarQuery ? (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
                  No pages found for "{sidebarQuery.trim()}".
                </div>
              ) : null}
            </>
          )}
        </div>

        <div className={cn("mt-3 min-h-0 flex-1 overflow-y-auto", collapsedDesktop ? "pr-0" : "pr-1")}>
          {navGroups.map((group, groupIndex) => (
            <div key={group.title || groupIndex} className={cn("mt-4.5", groupIndex === 0 && "mt-3")}>
              {group.title ? (
                <div
                  className={cn(
                    "px-3",
                    textTransitionClassName,
                    collapsedDesktop ? "mb-0 max-h-0 -translate-y-1 opacity-0" : "mb-2.5 max-h-8 translate-y-0 opacity-100"
                  )}
                  aria-hidden={collapsedDesktop}
                >
                  <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">{group.title}</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
                  </div>
                </div>
              ) : null}
              <nav className="space-y-1">
                {group.items.map((item) => {
                  if (item.href === "/tasks") {
                    const active = pathname.startsWith("/tasks");
                    const Icon = item.icon;

                    return (
                      <div key={`${group.title || "root"}-${item.href}`} className="space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (collapsedDesktop) {
                              onBeforeNavigate?.("/tasks");
                              router.push("/tasks" as Route);
                              onClose?.();
                              return;
                            }

                            setTasksExpanded((current) => !current);
                          }}
                          className={cn(
                            sidebarItemClassName,
                            collapsedDesktop ? "mx-auto h-11 w-11 justify-center gap-0 px-0 py-0" : "w-full text-left",
                            active
                              ? sidebarActiveItemClassName
                              : sidebarInactiveItemClassName
                          )}
                          title={collapsedDesktop ? "Tasks" : undefined}
                          aria-label={collapsedDesktop ? "Tasks" : undefined}
                        >
                          {active ? <SidebarActiveChrome collapsed={collapsedDesktop} /> : null}
                          <span
                            className={cn(
                              "relative z-10 flex shrink-0 items-center justify-center transition",
                              collapsedDesktop ? "h-8 w-8 rounded-lg" : "ml-0.5 h-7 w-7 rounded-md",
                              active
                                ? "bg-white text-[#386df4] shadow-[inset_0_0_0_1px_rgba(56,109,244,0.12),0_8px_18px_-12px_rgba(56,109,244,0.75)]"
                                : "text-slate-400 group-hover:text-[#386df4]"
                            )}
                          >
                            <Icon
                              className={cn(
                                "shrink-0 transition-colors",
                                collapsedDesktop ? "h-[1.1rem] w-[1.1rem]" : "h-4 w-4"
                              )}
                            />
                          </span>
                          {!collapsedDesktop ? (
                            <div
                              className={cn(
                                "relative z-10 flex flex-1 min-w-0 items-center justify-between gap-2 max-w-[11rem] translate-x-0 opacity-100",
                                textTransitionClassName
                              )}
                            >
                              <span className="truncate">Tasks</span>
                              <ChevronDown className={cn("h-4 w-4 shrink-0 transition", active ? "text-[#386df4]" : "text-slate-400", tasksExpanded && "rotate-180")} />
                            </div>
                          ) : null}
                        </button>

                        {tasksExpanded && !collapsedDesktop ? (
                          <div className="ml-5 border-l border-[#dce7ff] pl-3">
                            {taskSubItems.map((subItem) => {
                              const subActive = pathname === "/tasks" && activeTaskSection === subItem.section;
                              const SubIcon = subItem.icon;

                              return (
                                <Link
                                  key={subItem.section}
                                  href={subItem.href}
                                  prefetch
                                  onClick={() => { onBeforeNavigate?.(getSidebarSearchHref(subItem.href)); onClose?.(); }}
                                  className={cn(
                                    sidebarSubItemClassName,
                                    subActive
                                      ? sidebarActiveSubItemClassName
                                      : sidebarInactiveSubItemClassName
                                  )}
                                >
                                  {subActive ? (
                                    <span
                                      aria-hidden
                                      className="pointer-events-none absolute inset-y-2 left-1.5 w-1 rounded-full bg-[#386df4] shadow-[0_0_12px_rgba(56,109,244,0.35)]"
                                    />
                                  ) : null}
                                  <span
                                    className={cn(
                                      "relative z-10 ml-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition",
                                      subActive
                                        ? "bg-white text-[#386df4] shadow-[inset_0_0_0_1px_rgba(56,109,244,0.1)]"
                                        : "text-slate-400 group-hover:text-[#386df4]"
                                    )}
                                  >
                                    <SubIcon className="h-3.5 w-3.5 shrink-0 transition-colors" />
                                  </span>
                                  <span className="relative z-10 truncate">{subItem.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    );
                  }

                  const active =
                    item.href === "/"
                      ? pathname === item.href
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  const itemIsMailSyncing = item.href === "/inbox" && isMailSyncing;
                  const badgeCount =
                    item.href === "/notifications"
                      ? unreadNotificationsCount
                      : item.href === "/inbox"
                        ? openConversationsCount
                        : item.href === "/meetings"
                          ? upcomingMeetingsCount
                          : 0;

                  return (
                    <Link
                      key={`${group.title || "root"}-${item.href}`}
                      href={item.href}
                      prefetch
                      onClick={() => { onBeforeNavigate?.(item.href); onClose?.(); }}
                      title={collapsedDesktop ? item.label : undefined}
                      aria-label={collapsedDesktop ? item.label : undefined}
                      className={cn(
                        sidebarItemClassName,
                        collapsedDesktop && "mx-auto h-11 w-11 justify-center gap-0 px-0 py-0",
                        active
                          ? sidebarActiveItemClassName
                          : sidebarInactiveItemClassName
                      )}
                    >
                      {active ? <SidebarActiveChrome collapsed={collapsedDesktop} /> : null}
                      <span
                        className={cn(
                          "relative z-10 flex shrink-0 items-center justify-center transition",
                          collapsedDesktop ? "h-8 w-8 rounded-lg" : "ml-0.5 h-7 w-7 rounded-md",
                          active
                            ? "bg-white text-[#386df4] shadow-[inset_0_0_0_1px_rgba(56,109,244,0.12),0_8px_18px_-12px_rgba(56,109,244,0.75)]"
                            : "text-slate-400 group-hover:text-[#386df4]"
                        )}
                      >
                        <Icon
                          className={cn(
                            "shrink-0 transition-colors",
                            collapsedDesktop ? "h-[1.1rem] w-[1.1rem]" : "h-4 w-4",
                            itemIsMailSyncing && "animate-pulse"
                          )}
                        />
                        {itemIsMailSyncing ? (
                          <RefreshCw
                            className={cn(
                              "absolute -right-1 -top-1 shrink-0 animate-spin rounded-full bg-white p-[1px] text-[#386df4] ring-2 ring-[#fbfcff]",
                              collapsedDesktop ? "h-3.5 w-3.5" : "h-3 w-3"
                            )}
                          />
                        ) : null}
                        {collapsedDesktop && badgeCount > 0 && !itemIsMailSyncing ? (
                          <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-[#386df4] ring-2 ring-[#fbfcff]" />
                        ) : null}
                      </span>
                      {!collapsedDesktop ? (
                        <div
                          className={cn(
                            "relative z-10 flex flex-1 min-w-0 items-center gap-2 max-w-[11rem] translate-x-0 opacity-100",
                            textTransitionClassName
                          )}
                        >
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.href === "/notifications" && unreadNotificationsCount > 0 ? (
                            <span
                              className={cn(
                                "ml-auto inline-flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
                                active ? "bg-white text-[#386df4] ring-1 ring-[#d7e4ff]" : "bg-[#eef4ff] text-[#386df4]"
                              )}
                            >
                              {unreadNotificationsCount > 99 ? "99+" : unreadNotificationsCount}
                            </span>
                          ) : null}
                          {item.href === "/inbox" && openConversationsCount > 0 ? (
                            <span
                              className={cn(
                                "ml-auto inline-flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
                                active ? "bg-white text-[#386df4] ring-1 ring-[#d7e4ff]" : "bg-[#eef4ff] text-[#386df4]"
                              )}
                            >
                              {openConversationsCount > 99 ? "99+" : openConversationsCount}
                            </span>
                          ) : null}
                          {itemIsMailSyncing && openConversationsCount <= 0 ? (
                            <span
                              className={cn(
                                "ml-auto inline-flex h-5 shrink-0 items-center justify-center gap-1 rounded-full px-1.5 text-[10px] font-semibold",
                                active ? "bg-white text-[#386df4] ring-1 ring-[#d7e4ff]" : "bg-[#eef4ff] text-[#386df4]"
                              )}
                            >
                              <RefreshCw className="h-3 w-3 animate-spin" />
                              Sync
                            </span>
                          ) : null}
                          {item.href === "/meetings" && upcomingMeetingsCount > 0 ? (
                            <span
                              className={cn(
                                "ml-auto inline-flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
                                active ? "bg-white text-[#386df4] ring-1 ring-[#d7e4ff]" : "bg-[#eef4ff] text-[#386df4]"
                              )}
                            >
                              {upcomingMeetingsCount > 99 ? "99+" : upcomingMeetingsCount}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        <div className={cn("mt-4 rounded-2xl border border-slate-200 bg-white transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]", collapsedDesktop ? "px-2 py-2.5" : "p-3")}>
          <div className={cn("flex items-center", collapsedDesktop ? "justify-center" : "gap-3")}>
            {profileImageUrl ? (
              <img src={profileImageUrl} alt={userLabel} className="h-10 w-10 rounded-full border border-slate-200 object-cover" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(180deg,#edf4ff,#d7e6ff)] text-sm font-semibold text-[#386df4] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                {initials || "NA"}
              </div>
            )}
            <div
              className={cn(
                "min-w-0",
                textTransitionClassName,
                collapsedDesktop ? "ml-0 max-w-0 translate-x-1 opacity-0" : "ml-0 max-w-[9rem] translate-x-0 opacity-100"
              )}
              aria-hidden={collapsedDesktop}
            >
                <div className="truncate text-[0.92rem] font-semibold text-slate-900">{userLabel}</div>
                <div className="mt-0.5 truncate text-[0.78rem] text-slate-500">{userEmail}</div>
            </div>
          </div>
          {currentUser ? (
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              title={collapsedDesktop ? "Sign out" : undefined}
              aria-label={collapsedDesktop ? "Sign out" : undefined}
              className={cn(
                "mt-3 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-[#f8fbff] text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60",
                collapsedDesktop ? "w-full px-0 py-2.5" : "w-full gap-2 px-3 py-2.5"
              )}
            >
              <LogOut className={cn(collapsedDesktop ? "h-[1.05rem] w-[1.05rem]" : "h-4 w-4")} />
              <span
                className={cn(
                  textTransitionClassName,
                  collapsedDesktop ? "max-w-0 translate-x-1 opacity-0" : "max-w-[7rem] translate-x-0 opacity-100"
                )}
                aria-hidden={collapsedDesktop}
              >
                {isSigningOut ? "Signing out..." : "Sign out"}
              </span>
            </button>
          ) : null}
        </div>
      </div>
      {confirmationDialog}
    </aside>
  );
}

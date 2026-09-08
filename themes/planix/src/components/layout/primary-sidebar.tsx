"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Briefcase,
  CircleHelp,
  Headset,
  Headphones,
  KanbanSquare,
  LayoutDashboard,
  MessageSquareDot,
  Settings,
  LogOut,
  ShieldCheck,
  User,
  Users,
  ChevronRight,
  Menu,
  Volume2,
  X,
} from "lucide-react";

import { Avatar } from "@/components/dashboard/avatar";
import { useBranding } from "@/components/providers/brand-provider";
import { clearPlanixBrowserState } from "@/lib/browser-state";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/lib/use-hydrated";
import { usePersistentState } from "@/lib/use-persistent-state";
import {
  countUnreadMessages,
  countUnreadProjectNotifications,
  formatSidebarBadgeCount,
  MESSAGE_CONTACTS_STORAGE_KEY,
} from "@/lib/workspace-counts";
import type { ChatContact, MessagesPayload } from "@/data/chats";
import { defaultProfile, normalizeProfile } from "@/lib/profile";
import { PROFILE_IDENTITY_STORAGE_KEY, toProfileIdentity, type ProfileIdentity } from "@/lib/profile-client";
import { useNotificationsCenter } from "@/lib/notifications-center";
import { readJsonSafely } from "@/lib/settings-client";

type NavItem = {
  href: string;
  icon: typeof LayoutDashboard;
  label: string;
  badge: string | null;
};

const baseNavItems: NavItem[] = [
  { href: "/",              icon: LayoutDashboard, label: "Dashboard", badge: null },
  { href: "/clients",       icon: Briefcase,        label: "Clients",   badge: null },
  { href: "/projects/tasks",icon: KanbanSquare,     label: "Projects",  badge: null },
  { href: "/messages",      icon: MessageSquareDot, label: "Messages",  badge: null },
  { href: "/notifications", icon: Bell,             label: "Alerts",    badge: null },
  { href: "/people",        icon: Users,            label: "People",    badge: null },
  { href: "/settings",      icon: Settings,         label: "Settings",  badge: null },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/" || pathname === "/dashboard";
  if (href === "/clients") return pathname.startsWith("/clients");
  if (href === "/projects/tasks") return pathname.startsWith("/projects");
  if (href === "/messages") return pathname.startsWith("/messages");
  if (href === "/people") return pathname.startsWith("/people");
  if (href === "/faq") return pathname.startsWith("/faq");
  return href !== "#" && pathname.startsWith(href);
}

function PlanixMark() {
  const branding = useBranding();

  return (
    <div className="flex items-center justify-center">
      <img src={branding.logoUrl} alt={branding.appName} className="h-[52px] w-[52px] object-contain drop-shadow-md" />
    </div>
  );
}

function buildInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "NA";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function currentSectionLabel(pathname: string) {
  const activeItem = baseNavItems.find((item) => isActivePath(pathname, item.href));

  if (activeItem) {
    return activeItem.label;
  }

  if (pathname.startsWith("/faq")) {
    return "Help";
  }

  if (pathname.startsWith("/profile")) {
    return "Profile";
  }

  if (pathname.startsWith("/admin/super")) {
    return "Super Admin";
  }

  return "Workspace";
}

function Toggle({
  checked,
  onChange,
  variant = "light",
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  variant?: "light" | "dark";
}) {
  const isDark = variant === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200",
        checked ? "bg-[var(--accent)]" : isDark ? "bg-transparent" : "bg-white/15",
      )}
    >
      <span
        className={cn(
          "absolute h-4 w-4 rounded-full shadow transition-transform duration-200",
          isDark ? "bg-[#42444e]" : "bg-white",
          checked ? "translate-x-[22px]" : "translate-x-[4px]",
        )}
      />
    </button>
  );
}

// ── Profile popup ──────────────────────────────────────────────────────────────

function ProfilePopup({
  onClose,
  onSignOut,
  profile,
}: {
  onClose: () => void;
  onSignOut: () => void;
  profile: ProfileIdentity;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const initials = buildInitials(profile.fullName);

  function handleNavigation(href: string) {
    if (pathname === href) {
      onClose();
    }
    onClose();
  }

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute bottom-0 left-full z-50 ml-3 w-64 rounded-[var(--radius-xl)] border border-white/8 bg-[var(--panel-strong)] shadow-2xl overflow-hidden"
    >
      {/* User info */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/6">
        <Avatar
          initials={initials}
          tone={profile.avatarTone}
          imageSrc={profile.avatarUrl || undefined}
          size="md"
          className="shrink-0"
        />
        <div className="min-w-0">
          <p className="type-label font-semibold text-[var(--text-primary)] truncate">{profile.fullName}</p>
          <p className="type-caption text-[var(--text-muted)] truncate">{profile.jobTitle || "Workspace Member"}</p>
        </div>
      </div>

      {/* Menu items */}
      <div className="py-1">
        <Link
          href="/profile"
          onClick={() => handleNavigation("/profile")}
          className="flex w-full items-center justify-between px-4 py-3 type-ui text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-colors"
        >
          <span className="flex items-center gap-2.5">
            <User className="h-4 w-4 text-[var(--text-muted)]" />
            View Profile
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-[var(--text-muted)]" />
        </Link>
      </div>

      <div className="h-px bg-white/6" />

      <div className="py-1">
        <button
          type="button"
          onClick={onSignOut}
          className="flex w-full items-center gap-2.5 px-4 py-3 type-ui text-[var(--red)] hover:bg-white/5 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

function AudioSupportPanel({
  open,
  onClose,
  audioEnabled,
  onAudioToggle,
}: {
  open: boolean;
  onClose: () => void;
  audioEnabled: boolean;
  onAudioToggle: (value: boolean) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handler(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (open) {
      document.addEventListener("mousedown", handler);
    }

    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  function handleNavigate(href: string) {
    router.push(href);
    onClose();
  }

  return (
    <div
      ref={ref}
      className="absolute bottom-0 left-full z-50 ml-3 w-[288px] overflow-hidden rounded-[var(--radius-xl)] border border-white/8 bg-[var(--panel-strong)] shadow-2xl"
    >
      <div className="border-b border-white/6 px-4 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[var(--accent-soft)] text-[var(--accent)]">
            <Headset className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <p className="type-label font-semibold text-[var(--text-primary)]">Quick Support</p>
            <p className="mt-1 text-[12px] leading-[1.55] text-[var(--text-muted)]">
              Use this panel for help access and audio alert controls.
            </p>
          </div>
        </div>
      </div>

      <div className="border-b border-white/6 px-4 py-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="type-ui text-[var(--text-primary)]">Audio notifications</p>
            <p className="mt-1 text-[12px] text-[var(--text-muted)]">
              {audioEnabled ? "Enabled for reminders and updates." : "Muted across the workspace."}
            </p>
          </div>
          <Toggle checked={audioEnabled} onChange={onAudioToggle} variant="dark" />
        </div>
      </div>

      <div className="p-2">
        <button
          type="button"
          onClick={() => handleNavigate("/messages")}
          className="flex w-full items-center justify-between rounded-[14px] px-3 py-3 text-left transition hover:bg-white/5"
        >
          <span className="flex items-center gap-2.5 text-[var(--text-secondary)]">
            <MessageSquareDot className="h-4 w-4 text-[var(--text-muted)]" />
            Open Messages
          </span>
          <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
        </button>

        <button
          type="button"
          onClick={() => handleNavigate("/faq")}
          className="flex w-full items-center justify-between rounded-[14px] px-3 py-3 text-left transition hover:bg-white/5"
        >
          <span className="flex items-center gap-2.5 text-[var(--text-secondary)]">
            <CircleHelp className="h-4 w-4 text-[var(--text-muted)]" />
            Open Help Center
          </span>
          <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
        </button>
      </div>
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────

export function PrimarySidebar() {
  const branding = useBranding();
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useHydrated();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [audioPanelOpen, setAudioPanelOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = usePersistentState<boolean>(
    "planix.workspace.audio-enabled",
    true,
  );
  const [profileReady, setProfileReady] = useState(false);
  const [profile, setProfile] = usePersistentState<ProfileIdentity>(PROFILE_IDENTITY_STORAGE_KEY, {
    fullName: defaultProfile.fullName,
    email: defaultProfile.email,
    jobTitle: defaultProfile.jobTitle,
    avatarTone: defaultProfile.avatarTone,
    avatarUrl: defaultProfile.avatarUrl,
  });
  const {
    projectNotificationsStore,
    snoozedNotifications,
  } = useNotificationsCenter();
  const [messageContacts, setMessageContacts] = usePersistentState<ChatContact[]>(
    MESSAGE_CONTACTS_STORAGE_KEY,
    [],
  );
  const [showSuperAdmin, setShowSuperAdmin] = useState(false);
  const navItems = useMemo<NavItem[]>(
    () =>
      showSuperAdmin
        ? [...baseNavItems, { href: "/admin/super", icon: ShieldCheck, label: "Admin", badge: null }]
        : baseNavItems,
    [showSuperAdmin],
  );
  const messagesBadge = useMemo(
    () => formatSidebarBadgeCount(countUnreadMessages(messageContacts)),
    [messageContacts],
  );
  const alertsBadge = useMemo(
    () => formatSidebarBadgeCount(countUnreadProjectNotifications(projectNotificationsStore, snoozedNotifications)),
    [projectNotificationsStore, snoozedNotifications],
  );
  const visibleProfile = profileReady ? profile : {
    fullName: "",
    email: "",
    jobTitle: "",
    avatarTone: defaultProfile.avatarTone,
    avatarUrl: "",
  };
  const profileInitials = useMemo(() => buildInitials(visibleProfile.fullName), [visibleProfile.fullName]);
  const currentLabel = useMemo(() => currentSectionLabel(pathname), [pathname]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    let cancelled = false;

    async function hydrateMessageContacts() {
      try {
        const response = await fetch("/api/messages", { cache: "no-store" });
        const result = await readJsonSafely<{
          data?: MessagesPayload;
        }>(response);

        if (!cancelled && response.ok && result?.data?.contacts) {
          setMessageContacts(result.data.contacts);
        }
      } catch {
        // Keep sidebar usable even if the message summary request fails.
      }
    }

    void hydrateMessageContacts();

    return () => {
      cancelled = true;
    };
  }, [hydrated, setMessageContacts]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    let cancelled = false;

    async function hydrateProfileIdentity() {
      try {
        const response = await fetch("/api/profile", { cache: "no-store" });
        const result = await readJsonSafely<{
          profile?: Record<string, unknown>;
        }>(response);

        if (!cancelled && response.ok && result?.profile) {
          setProfile(toProfileIdentity(normalizeProfile(result.profile)));
        }
      } catch {
        // Keep the sidebar usable even if profile sync fails.
      } finally {
        if (!cancelled) {
          setProfileReady(true);
        }
      }
    }

    void hydrateProfileIdentity();

    return () => {
      cancelled = true;
    };
  }, [hydrated, setProfile]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    let cancelled = false;

    async function loadSuperAdminMeta() {
      try {
        const response = await fetch("/api/admin/super/meta", { cache: "no-store" });
        const result = await readJsonSafely<{ isSuperAdmin?: boolean }>(response);

        if (!cancelled && response.ok) {
          setShowSuperAdmin(Boolean(result?.isSuperAdmin));
        }
      } catch {
        if (!cancelled) {
          setShowSuperAdmin(false);
        }
      }
    }

    void loadSuperAdminMeta();

    return () => {
      cancelled = true;
    };
  }, [hydrated]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
    setAudioPanelOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  async function handleSignOut() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      clearPlanixBrowserState();
      setProfileOpen(false);
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <>
      <aside className="relative z-50 hidden h-full w-[88px] shrink-0 flex-col justify-start bg-[var(--sidebar)] px-3 py-6 lg:flex">
        <div className="flex flex-none flex-col items-center gap-4">
          <PlanixMark />
          <nav className="mt-6 flex flex-none flex-col gap-3">
            {navItems.map(({ href, icon: Icon, label, badge }) => {
              const active = isActivePath(pathname, href);
              const gradientId = `sidebar-active-${label.toLowerCase().replace(/\s+/g, "-")}`;
              const dynamicBadge = href === "/messages"
                ? messagesBadge
                : href === "/notifications"
                  ? alertsBadge
                  : badge;
              const sharedClassName = cn(
                "group relative isolate flex h-12 w-12 items-center justify-center rounded-[11px] border transition-all duration-300",
                active
                  ? "border-transparent bg-[rgba(28,18,15,0.96)] shadow-[0_14px_30px_rgba(251,138,116,0.14)]"
                  : "border-transparent text-[var(--text-muted)] hover:border-white/8 hover:bg-white/5",
              );

              const content = (
                <>
                  {active && (
                    <>
                      <span
                        className="pointer-events-none absolute inset-0 rounded-[11px]"
                        style={{
                          background:
                            "linear-gradient(140deg, rgba(255,240,216,0.95) 0%, rgba(255,195,143,0.72) 32%, rgba(251,138,116,0.42) 58%, rgba(251,138,116,0.12) 78%, rgba(255,255,255,0.04) 100%)",
                          WebkitMask:
                            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                          WebkitMaskComposite: "xor",
                          padding: "1px",
                        }}
                      />
                      <span className="pointer-events-none absolute inset-[1px] rounded-[10px] bg-[radial-gradient(circle_at_top,rgba(255,244,233,0.16),transparent_42%),linear-gradient(180deg,rgba(46,24,18,0.88)_0%,rgba(23,16,14,0.94)_100%)]" />
                      <svg aria-hidden="true" width="0" height="0" className="absolute">
                        <defs>
                          <linearGradient id={gradientId} x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#fff0d8" />
                            <stop offset="40%" stopColor="#ffc38f" />
                            <stop offset="100%" stopColor="#fb8a74" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </>
                  )}
                  <Icon
                    className="h-5 w-5 transition-transform duration-200"
                    strokeWidth={active ? 2.5 : 2}
                    style={active ? { stroke: `url(#${gradientId})`, filter: "drop-shadow(0 0 8px rgba(255, 195, 143, 0.28))" } : undefined}
                  />
                  {dynamicBadge && (
                    <span className="absolute -right-1.5 -top-1.5 z-10 rounded-[7px] bg-[linear-gradient(180deg,#7f231e_0%,#4f1214_55%,#30070c_100%)] px-1.5 py-0.5 text-[10px] font-bold tracking-widest text-[#ffe8e2] shadow-[0_8px_18px_rgba(70,10,14,0.34)]">
                      {dynamicBadge}
                    </span>
                  )}
                  <div className="absolute left-[calc(100%+14px)] top-1/2 pointer-events-none z-50 flex items-center opacity-0 transition-all duration-300 ease-out -translate-y-1/2 -translate-x-[10px] scale-95 group-hover:-translate-y-1/2 group-hover:translate-x-0 group-hover:scale-100 group-hover:opacity-100">
                    <span className="whitespace-nowrap rounded-lg border border-white/5 bg-[#141517] px-3 py-[5px] text-[13px] font-medium text-white shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                      {label}
                    </span>
                  </div>
                </>
              );

              return (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className={sharedClassName}
                >
                  <span className="relative z-10 flex h-full w-full items-center justify-center">
                    {content}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-3 flex w-full items-center justify-center">
          <span className="h-px w-9 bg-white/7" />
        </div>

        <div className="flex items-center gap-3 lg:mt-auto lg:flex-col">
          <Link
            href="/faq"
            aria-label="Support"
            className={cn(
              "relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full transition",
              pathname.startsWith("/faq")
                ? "border border-transparent bg-[rgba(28,18,15,0.96)] shadow-[0_12px_28px_rgba(251,138,116,0.15)]"
                : "bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-primary)]",
            )}
          >
            {pathname.startsWith("/faq") && (
              <>
                <span
                  className="pointer-events-none absolute inset-0 rounded-full"
                  style={{
                    background:
                      "linear-gradient(140deg, rgba(255,240,216,0.95) 0%, rgba(255,195,143,0.72) 32%, rgba(251,138,116,0.42) 58%, rgba(251,138,116,0.12) 78%, rgba(255,255,255,0.04) 100%)",
                    WebkitMask:
                      "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                    WebkitMaskComposite: "xor",
                    padding: "1px",
                  }}
                />
                <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_top,rgba(255,244,233,0.16),transparent_42%),linear-gradient(180deg,rgba(46,24,18,0.88)_0%,rgba(23,16,14,0.94)_100%)]" />
                <svg aria-hidden="true" width="0" height="0" className="absolute">
                  <defs>
                    <linearGradient id="sidebar-active-support" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#fff0d8" />
                      <stop offset="40%" stopColor="#ffc38f" />
                      <stop offset="100%" stopColor="#fb8a74" />
                    </linearGradient>
                  </defs>
                </svg>
              </>
            )}
            <CircleHelp
              className="relative z-10 h-4 w-4"
              style={
                pathname.startsWith("/faq")
                  ? { stroke: "url(#sidebar-active-support)", filter: "drop-shadow(0 0 8px rgba(255, 195, 143, 0.28))" }
                  : undefined
              }
            />
          </Link>
          <div className="relative">
            <button
              type="button"
              aria-label="Audio support"
              aria-expanded={audioPanelOpen}
              onClick={() => {
                setAudioPanelOpen((current) => !current);
                setProfileOpen(false);
              }}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full transition",
                !hydrated && "transition-none",
                audioPanelOpen
                  ? "border border-transparent bg-[rgba(28,18,15,0.96)] text-[var(--accent)] shadow-[0_12px_28px_rgba(251,138,116,0.15)]"
                  : "bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-primary)]",
              )}
            >
              <Headset className="h-4 w-4" />
            </button>
            <AudioSupportPanel
              open={audioPanelOpen}
              onClose={() => setAudioPanelOpen(false)}
              audioEnabled={audioEnabled}
              onAudioToggle={setAudioEnabled}
            />
          </div>

          <div className="relative">
            <button
              type="button"
              aria-label="Profile"
              onClick={() => setProfileOpen((v) => !v)}
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-full ring-2 transition",
                profileOpen
                  ? "ring-[var(--accent)]"
                  : "ring-[var(--accent)]/50 hover:ring-[var(--accent)]",
              )}
            >
              <Avatar
                initials={profileInitials}
                tone={visibleProfile.avatarTone}
                imageSrc={visibleProfile.avatarUrl || undefined}
                size="md"
                className="h-12 w-12"
              />
            </button>
            {profileOpen && <ProfilePopup profile={visibleProfile} onClose={() => setProfileOpen(false)} onSignOut={handleSignOut} />}
          </div>
        </div>
      </aside>

      <div className="relative z-40 flex w-full items-center justify-between gap-3 rounded-[var(--radius-xl)] border border-white/8 bg-[var(--sidebar)] px-4 py-3 lg:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <PlanixMark />
          <div className="min-w-0">
            <p className="truncate text-[0.78rem] uppercase tracking-[0.18em] text-[var(--text-muted)]">{branding.appName}</p>
            <p className="truncate text-[0.98rem] font-semibold text-[var(--text-primary)]">{currentLabel}</p>
          </div>
        </div>

        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen(true)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-white/8 bg-white/[0.04] text-[var(--text-primary)] transition hover:bg-white/[0.08]"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <aside className="absolute inset-y-0 left-0 flex w-[min(88vw,360px)] flex-col border-r border-white/8 bg-[var(--sidebar)] px-4 py-4 shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-4">
              <div className="flex min-w-0 items-center gap-3">
                <PlanixMark />
                <div className="min-w-0">
                  <p className="truncate text-[0.76rem] uppercase tracking-[0.18em] text-[var(--text-muted)]">Workspace</p>
                  <p className="truncate text-[1rem] font-semibold text-[var(--text-primary)]">{currentLabel}</p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-white/8 bg-white/[0.04] text-[var(--text-primary)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 flex-1 overflow-y-auto">
              <nav className="space-y-2">
                {navItems.map(({ href, icon: Icon, label, badge }) => {
                  const active = isActivePath(pathname, href);
                  const dynamicBadge = href === "/messages"
                    ? messagesBadge
                    : href === "/notifications"
                      ? alertsBadge
                      : badge;

                  return (
                    <Link
                      key={label}
                      href={href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-[16px] border px-4 py-3.5 transition",
                        active
                          ? "border-[var(--accent)]/28 bg-[linear-gradient(180deg,rgba(251,138,116,0.14)_0%,rgba(251,138,116,0.06)_100%)] text-[var(--text-primary)]"
                          : "border-white/8 bg-white/[0.03] text-[var(--text-secondary)] hover:bg-white/[0.06]",
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <span className={cn("flex h-10 w-10 items-center justify-center rounded-[12px]", active ? "bg-[rgba(28,18,15,0.92)]" : "bg-white/[0.04]")}>
                          <Icon className="h-4.5 w-4.5" />
                        </span>
                        <span className="text-[0.95rem] font-medium">{label}</span>
                      </span>
                      {dynamicBadge ? (
                        <span className="rounded-full bg-[linear-gradient(180deg,#7f231e_0%,#4f1214_55%,#30070c_100%)] px-2 py-0.5 text-[11px] font-bold tracking-wide text-[#ffe8e2]">
                          {dynamicBadge}
                        </span>
                      ) : (
                        <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-6 rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
                <div className="flex items-center gap-3">
                  <Avatar
                    initials={profileInitials}
                    tone={visibleProfile.avatarTone}
                    imageSrc={visibleProfile.avatarUrl || undefined}
                    size="md"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[0.95rem] font-semibold text-[var(--text-primary)]">{visibleProfile.fullName || "Workspace Member"}</p>
                    <p className="truncate text-[0.8rem] text-[var(--text-muted)]">{visibleProfile.jobTitle || "Workspace Member"}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between rounded-[14px] border border-white/8 bg-white/[0.03] px-4 py-3 text-[var(--text-secondary)]"
                  >
                    <span className="flex items-center gap-2.5">
                      <User className="h-4 w-4" />
                      View Profile
                    </span>
                    <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
                  </Link>

                  <Link
                    href="/faq"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between rounded-[14px] border border-white/8 bg-white/[0.03] px-4 py-3 text-[var(--text-secondary)]"
                  >
                    <span className="flex items-center gap-2.5">
                      <CircleHelp className="h-4 w-4" />
                      Help Center
                    </span>
                    <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3 border-t border-white/8 pt-4">
              <div className="flex items-center justify-between rounded-[16px] border border-white/8 bg-white/[0.03] px-4 py-3">
                <span className="flex items-center gap-2.5 text-[var(--text-secondary)]">
                  <Volume2 className="h-4 w-4 text-[var(--text-muted)]" />
                  Audio notifications
                </span>
                <Toggle checked={audioEnabled} onChange={setAudioEnabled} />
              </div>

              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="flex w-full items-center justify-center gap-2 rounded-[16px] border border-[var(--red)]/20 bg-[var(--red)]/8 px-4 py-3 text-[0.92rem] font-medium text-[var(--red)]"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

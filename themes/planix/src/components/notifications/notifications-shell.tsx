"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  Calendar,
  CheckCircle,
  Check,
  AlertTriangle,
  MessageSquare,
  Clock,
  Clock3,
  Trash2,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Avatar as ActivityAvatar } from "@/components/dashboard/avatar";
import { cn } from "@/lib/utils";
import { AppLoader } from "@/components/ui/app-loader";
import type { ActivityItem } from "@/data/dashboard";
import { usePersistentState } from "@/lib/use-persistent-state";
import { PrimarySidebar } from "@/components/layout/primary-sidebar";
import { type ProjectNotification } from "@/data/project-board";
import { useWorkspaceActivityFeed } from "@/lib/workspace-activity";
import type { NotificationsCenterData } from "@/lib/notifications-db";
import {
  buildProjectNotificationCompositeId,
} from "@/lib/workspace-counts";
import { useNotificationsCenter } from "@/lib/notifications-center";

// ── Shared components ──────────────────────────────────────────────────────────

type NotificationVisual =
  | { type: "avatar"; src?: string; initials?: string }
  | { type: "icon"; icon: React.ComponentType<{ className?: string }> };

type NotificationItem = {
  id: string;
  notificationId: string;
  projectRef: string;
  createdAt?: string;
  title: string;
  time: string;
  unread: boolean;
  desc: string;
  visual: NotificationVisual;
  tab: Exclude<TabId, "Snoozed" | "Activity">;
  snoozed?: boolean;
  section: string;
};

type NotificationGroup = {
  section: string;
  items: NotificationItem[];
};

function Avatar({ initials, src, dot }: { initials?: string; src?: string; dot?: boolean }) {
  return (
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[var(--panel-soft)] text-[14px] font-semibold text-[var(--text-primary)] border border-white/5">
      {src ? (
        <img src={src} alt="avatar" className="h-full w-full object-cover rounded-[14px]" />
      ) : (
        initials
      )}
      {dot && (
        <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--background)]">
          <span className="h-2 w-2 rounded-full bg-[var(--red)]" />
        </span>
      )}
    </div>
  );
}

function IconBox({
  icon: Icon,
  dot,
}: {
  icon: React.ComponentType<{ className?: string }>;
  dot?: boolean;
}) {
  return (
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[var(--panel-soft)] text-[var(--text-secondary)] border border-white/5">
      <Icon className="h-4.5 w-4.5" />
      {dot && (
        <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--background)]">
          <span className="h-2 w-2 rounded-full bg-[var(--red)]" />
        </span>
      )}
    </div>
  );
}

function NotificationVisualBox({
  visual,
  unread,
}: {
  visual: NotificationVisual;
  unread: boolean;
}) {
  if (visual.type === "avatar") {
    return <Avatar src={visual.src} initials={visual.initials} dot={unread} />;
  }

  return <IconBox icon={visual.icon} dot={unread} />;
}

// ── Tabs ───────────────────────────────────────────────────────────────────────

const TABS = ["Important", "Others", "Snoozed", "Activity"] as const;
type TabId = typeof TABS[number];
const NOTIFICATION_PANEL_PATCH = "border border-white/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))]";

// ── Notifications Data ─────────────────────────────────────────────────────────

function notificationVisual(notification: ProjectNotification): NotificationVisual {
  if (notification.initials) {
    return {
      type: "avatar",
      initials: notification.initials,
    };
  }

  if (notification.kind === "task" || notification.kind === "comment") {
    return { type: "icon", icon: MessageSquare };
  }

  if (notification.kind === "deadline" || notification.kind === "meeting") {
    return { type: "icon", icon: Calendar };
  }

  if (notification.kind === "completed") {
    return { type: "icon", icon: CheckCircle };
  }

  if (notification.kind === "milestone") {
    return { type: "icon", icon: AlertTriangle };
  }

  if (notification.kind === "overdue") {
    return { type: "icon", icon: Clock };
  }

  return { type: "icon", icon: Users };
}

function markAllReadInData(current: NotificationsCenterData): NotificationsCenterData {
  return {
    ...current,
    projectNotificationsStore: Object.fromEntries(
      Object.entries(current.projectNotificationsStore).map(([projectRef, projectNotifications]) => [
        projectRef,
        projectNotifications.map((notification) =>
          notification.unread
            ? { ...notification, unread: false }
            : notification,
        ),
      ]),
    ),
  };
}

function setNotificationReadInData(
  current: NotificationsCenterData,
  item: NotificationItem,
  unread: boolean,
): NotificationsCenterData {
  return {
    ...current,
    projectNotificationsStore: {
      ...current.projectNotificationsStore,
      [item.projectRef]: (current.projectNotificationsStore[item.projectRef] ?? []).map((notification) =>
        notification.id === item.notificationId
          ? { ...notification, unread }
          : notification,
      ),
    },
  };
}

function setNotificationSnoozedInData(
  current: NotificationsCenterData,
  item: NotificationItem,
  snoozed: boolean,
): NotificationsCenterData {
  const nextSnoozedNotifications = { ...current.snoozedNotifications };

  if (snoozed) {
    nextSnoozedNotifications[item.id] = true;
  } else {
    delete nextSnoozedNotifications[item.id];
  }

  return {
    ...current,
    snoozedNotifications: nextSnoozedNotifications,
  };
}

function removeNotificationInData(
  current: NotificationsCenterData,
  item: NotificationItem,
): NotificationsCenterData {
  const nextNotifications = (current.projectNotificationsStore[item.projectRef] ?? [])
    .filter((notification) => notification.id !== item.notificationId);
  const nextStore = {
    ...current.projectNotificationsStore,
  };

  if (nextNotifications.length === 0) {
    delete nextStore[item.projectRef];
  } else {
    nextStore[item.projectRef] = nextNotifications;
  }

  const nextSnoozedNotifications = { ...current.snoozedNotifications };
  delete nextSnoozedNotifications[item.id];

  return {
    ...current,
    projectNotificationsStore: nextStore,
    snoozedNotifications: nextSnoozedNotifications,
  };
}

export function NotificationsShell() {
  const {
    mode,
    error,
    isLoading,
    isMutating,
    workspaceProjects,
    projectNotificationsStore,
    snoozedNotifications,
    mutate,
    setLocalData,
  } = useNotificationsCenter({ requireFresh: true });
  const [workspaceActivity] = useWorkspaceActivityFeed();
  const [actionError, setActionError] = useState("");
  const [activeTab, setActiveTab] = usePersistentState<TabId>(
    "planix.notifications.active-tab",
    "Important",
  );
  const [collapsedSections, setCollapsedSections] = usePersistentState<Record<string, boolean>>(
    "planix.notifications.collapsed-sections",
    {},
  );

  const notifications = useMemo<NotificationItem[]>(() => {
    const projectNameByRef = new Map(
      workspaceProjects.map((project) => [String(project.id), project.name]),
    );

    return Object.entries(projectNotificationsStore)
      .flatMap(([projectRef, projectNotifications]) =>
        projectNotifications.map((notification) => {
          const compositeId = buildProjectNotificationCompositeId(projectRef, notification.id);
          const snoozed = Boolean(snoozedNotifications[compositeId]);

          return {
            id: compositeId,
            notificationId: notification.id,
            projectRef,
            createdAt: notification.createdAt,
            title: notification.title,
            time: notification.time,
            unread: Boolean(notification.unread),
            desc: notification.body,
            visual: notificationVisual(notification),
            tab: notification.unread ? ("Important" as const) : ("Others" as const),
            snoozed,
            section: projectNameByRef.get(projectRef) ?? `Project ${projectRef}`,
          };
        }),
      )
      .sort((left, right) => {
        if (left.snoozed !== right.snoozed) {
          return left.snoozed ? 1 : -1;
        }

        if (left.unread !== right.unread) {
          return left.unread ? -1 : 1;
        }

        const rightCreatedAt = right.createdAt ? Date.parse(right.createdAt) : Number.NaN;
        const leftCreatedAt = left.createdAt ? Date.parse(left.createdAt) : Number.NaN;

        if (Number.isFinite(rightCreatedAt) && Number.isFinite(leftCreatedAt) && rightCreatedAt !== leftCreatedAt) {
          return rightCreatedAt - leftCreatedAt;
        }

        return right.id.localeCompare(left.id);
      });
  }, [projectNotificationsStore, snoozedNotifications, workspaceProjects]);

  const tabCounts = useMemo(
    () => ({
      Important: notifications.filter((item) => item.unread && !item.snoozed).length,
      Others: notifications.filter((item) => !item.unread && !item.snoozed).length,
      Snoozed: notifications.filter((item) => item.snoozed).length,
      Activity: workspaceActivity.length,
    }),
    [notifications, workspaceActivity.length],
  );
  const unreadCount = tabCounts.Important;

  async function runRemoteMutation(
    updater: (current: NotificationsCenterData) => NotificationsCenterData,
    action: () => Promise<unknown>,
    fallbackMessage: string,
  ) {
    const previousData: NotificationsCenterData = {
      workspaceProjects,
      projectNotificationsStore,
      snoozedNotifications,
    };

    setLocalData(updater);

    try {
      await action();
    } catch (mutationError) {
      setLocalData(() => previousData);
      setActionError(mutationError instanceof Error ? mutationError.message : fallbackMessage);
    }
  }

  const visibleGroups = useMemo(() => {
    const filteredItems = notifications.filter((item) => {
      if (activeTab === "Activity") {
        return false;
      }

      if (activeTab === "Snoozed") {
        return item.snoozed;
      }

      return item.tab === activeTab && !item.snoozed;
    });

    return filteredItems.reduce<NotificationGroup[]>((groups, item) => {
      const existingGroup = groups.find((group) => group.section === item.section);

      if (existingGroup) {
        existingGroup.items.push(item);
        return groups;
      }

      return [...groups, { section: item.section, items: [item] }];
    }, []);
  }, [activeTab, notifications]);

  function toggleSection(section: string) {
    setCollapsedSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  }

  async function markAllRead() {
    setActionError("");

    if (mode === "remote") {
      await runRemoteMutation(
        markAllReadInData,
        () => mutate({ action: "mark-all-read" }),
        "Failed to mark notifications as read.",
      );
      return;
    }

    setLocalData(markAllReadInData);
  }

  async function handleReadToggle(item: NotificationItem) {
    setActionError("");
    const nextUnread = !item.unread;

    if (mode === "remote") {
      await runRemoteMutation(
        (current) => setNotificationReadInData(current, item, nextUnread),
        () => mutate({
          action: "set-read",
          projectRef: item.projectRef,
          notificationId: item.notificationId,
          unread: nextUnread,
        }),
        "Failed to update notification.",
      );
      return;
    }

    setLocalData((current) => setNotificationReadInData(current, item, nextUnread));
  }

  async function handleSnoozeToggle(item: NotificationItem) {
    setActionError("");
    const nextSnoozed = !item.snoozed;

    if (mode === "remote") {
      await runRemoteMutation(
        (current) => setNotificationSnoozedInData(current, item, nextSnoozed),
        () => mutate({
          action: "set-snoozed",
          projectRef: item.projectRef,
          notificationId: item.notificationId,
          snoozed: nextSnoozed,
        }),
        "Failed to update notification.",
      );
      return;
    }

    setLocalData((current) => setNotificationSnoozedInData(current, item, nextSnoozed));
  }

  async function handleRemove(item: NotificationItem) {
    setActionError("");

    if (mode === "remote") {
      await runRemoteMutation(
        (current) => removeNotificationInData(current, item),
        () => mutate({
          action: "remove",
          projectRef: item.projectRef,
          notificationId: item.notificationId,
        }),
        "Failed to remove notification.",
      );
      return;
    }

    setLocalData((current) => removeNotificationInData(current, item));
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-[var(--background)] selection:bg-[var(--accent)]/30 text-[var(--foreground)] lg:h-screen">
        <PrimarySidebar />

        <main className="flex flex-1 flex-col overflow-hidden bg-[rgba(12,12,14,0.92)] lg:border-l lg:border-white/6">
          <AppLoader
            fullscreen={false}
            compact
            label="Loading notifications"
            detail="Preparing your latest notification preferences"
            className="min-h-full w-full rounded-none border-0"
          />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--background)] selection:bg-[var(--accent)]/30 text-[var(--foreground)] lg:h-screen">
      <PrimarySidebar />

      <main className="flex flex-1 flex-col overflow-hidden bg-[rgba(12,12,14,0.92)] lg:border-l lg:border-white/6">
        <header className="shrink-0 border-b border-white/6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <h1 className="type-page-title tracking-tight text-white">Notifications</h1>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <div className="w-full space-y-8">
            <div className="flex flex-col">
              <div className="flex min-h-[44px] flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="max-w-[720px]">
                  <p className="text-[14px] text-[var(--text-muted)]">
                    {activeTab === "Activity"
                      ? "Workspace activity monitor across projects, people, settings, clients, and messages."
                      : unreadCount > 0
                      ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"} across your projects`
                      : "All caught up across your projects"}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start">
                  <button
                    type="button"
                    onClick={markAllRead}
                    disabled={activeTab === "Activity" || unreadCount === 0}
                    aria-hidden={activeTab === "Activity"}
                    className={cn(
                      "rounded-[var(--radius-md)] border px-4 py-2.5 text-[14px] font-medium transition",
                      activeTab === "Activity"
                        ? "pointer-events-none invisible"
                        : unreadCount > 0
                        ? "border-[var(--accent)]/22 bg-[var(--accent)]/10 text-[var(--accent)] hover:border-[var(--accent)]/32 hover:bg-[var(--accent)]/14"
                        : "cursor-not-allowed border-white/8 bg-white/[0.03] text-[var(--text-muted)]",
                    )}
                  >
                    {isMutating && activeTab !== "Activity" ? "Updating..." : "Mark all read"}
                  </button>
                </div>
              </div>

              {(error || actionError) && (
                <div className="mt-4 rounded-[14px] border border-[var(--red)]/14 bg-[var(--red)]/8 px-4 py-3 text-[13px] text-[var(--red)]">
                  {actionError || error}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex flex-wrap items-center gap-1 rounded-full border border-white/8 bg-[rgba(255,255,255,0.03)] p-1">
                  {TABS.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-200",
                        activeTab === tab
                          ? "bg-white/10 text-[var(--text-primary)] shadow-[0_10px_20px_rgba(0,0,0,0.14)]"
                          : "text-[var(--text-muted)] hover:bg-white/[0.04] hover:text-[var(--text-secondary)]",
                      )}
                    >
                      <span>{tab}</span>
                      <span
                        className={cn(
                          "inline-flex min-w-[22px] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold shadow-[0_8px_18px_rgba(70,10,14,0.18)]",
                          activeTab === tab
                            ? "bg-[linear-gradient(180deg,#7f231e_0%,#4f1214_55%,#30070c_100%)] text-[#ffe8e2]"
                            : "bg-[linear-gradient(180deg,rgba(105,28,28,0.78)_0%,rgba(62,15,18,0.82)_100%)] text-[#f0c7c2]",
                        )}
                      >
                        {String(tabCounts[tab]).padStart(2, "0")}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="inline-flex items-center rounded-full border border-white/8 bg-white/[0.03] px-3.5 py-2 text-[12.5px] text-[var(--text-secondary)]">
                  Grouped by project
                </div>
                <div className="inline-flex items-center rounded-full border border-white/8 bg-white/[0.03] px-3.5 py-2 text-[12.5px] text-[var(--text-secondary)]">
                  Newest first
                </div>
              </div>
            </div>

            {activeTab === "Activity" && (
              <div className={cn(NOTIFICATION_PANEL_PATCH, "rounded-[18px] p-5 shadow-[0_18px_36px_rgba(0,0,0,0.12)]")}>
                <div className="divide-y divide-white/6">
                  {workspaceActivity.map((item: ActivityItem) => (
                    <article key={item.id} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                      <ActivityAvatar
                        initials={item.initials}
                        tone={item.tone}
                        status={item.status}
                        size="sm"
                      />
                      <div className="min-w-0 pt-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-[0.92rem] font-semibold text-[var(--text-primary)]">{item.name}</h3>
                          <span className="text-[0.76rem] text-[var(--text-muted)]">{item.time}</span>
                        </div>
                        <p className="text-[0.82rem] leading-[1.45] text-[var(--text-secondary)]">{item.action}</p>
                        {item.detail && (
                          <p className="mt-1 text-[0.76rem] leading-[1.4] text-[var(--text-muted)]">{item.detail}</p>
                        )}
                      </div>
                    </article>
                  ))}
                  {workspaceActivity.length === 0 && (
                    <div className="py-6 text-center text-[13.5px] text-[var(--text-muted)]">
                      No workspace activity yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab !== "Activity" && visibleGroups.map((group) => (
              <div key={group.section} className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">{group.section}</h2>
                    <span className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[11px] text-[var(--text-secondary)]">
                      {group.items.length} item{group.items.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSection(group.section)}
                    className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border border-white/8 bg-white/[0.03] text-[var(--text-muted)] transition hover:bg-white/[0.06] hover:text-[var(--text-secondary)]"
                  >
                    {collapsedSections[group.section] ? (
                      <ChevronDown className="h-4.5 w-4.5" />
                    ) : (
                      <ChevronUp className="h-4.5 w-4.5" />
                    )}
                  </button>
                </div>

                {!collapsedSections[group.section] && (
                <div className="animate-[fade-slide-in_240ms_ease-out] space-y-3">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        NOTIFICATION_PANEL_PATCH,
                        "group relative flex gap-4 overflow-visible rounded-[16px] px-5 py-5 shadow-[0_18px_36px_rgba(0,0,0,0.12)] transition hover:border-white/10 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.022))]",
                        item.snoozed && "opacity-88",
                      )}
                    >
                      <NotificationVisualBox visual={item.visual} unread={item.unread} />

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight">
                            {item.title}
                          </h3>
                          <span className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[10px] text-[var(--text-secondary)]">
                            {item.projectRef === "0" ? "Workspace" : group.section}
                          </span>
                          <span className="text-[12.5px] text-[var(--text-muted)]">{item.time}</span>
                          {item.unread && (
                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--red)]" />
                          )}
                          {item.snoozed && (
                            <span className="rounded-full border border-[#f2c97d]/18 bg-[#f2c97d]/12 px-2.5 py-1 text-[10px] text-[#f2c97d]">
                              Snoozed
                            </span>
                          )}
                        </div>
                        <p className="mt-2 max-w-[92%] text-[13.5px] leading-[1.6] text-[var(--text-muted)]">
                          {item.desc}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5 self-start lg:self-center">
                        <button
                          type="button"
                          onClick={() => void handleReadToggle(item)}
                          className="inline-flex items-center gap-1.5 rounded-[10px] border border-white/8 bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-medium text-[var(--text-secondary)] transition hover:bg-white/[0.06] hover:text-[var(--text-primary)]"
                        >
                          <Check className="hidden h-3.5 w-3.5 lg:block" />
                          {item.unread ? "Read" : "Unread"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleSnoozeToggle(item)}
                          className="inline-flex items-center gap-1.5 rounded-[10px] border border-white/8 bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-medium text-[var(--text-secondary)] transition hover:bg-white/[0.06] hover:text-[var(--text-primary)]"
                        >
                          <Clock3 className="hidden h-3.5 w-3.5 lg:block" />
                          {item.snoozed ? "Inbox" : "Snooze"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleRemove(item)}
                          className="inline-flex items-center gap-1.5 rounded-[10px] border border-[var(--red)]/16 bg-[var(--red)]/8 px-2.5 py-1.5 text-[11px] font-medium text-[var(--red)] transition hover:bg-[var(--red)]/14"
                        >
                          <Trash2 className="hidden h-3.5 w-3.5 lg:block" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </div>
            ))}

            {activeTab !== "Activity" && visibleGroups.length === 0 && (
              <div className={cn(NOTIFICATION_PANEL_PATCH, "flex min-h-[320px] items-center justify-center rounded-[22px]")}>
                <div className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] border border-white/8 bg-white/[0.03] text-[var(--accent)]">
                    <Bell className="h-6 w-6" />
                  </div>
                  <p className="mt-4 text-[16px] font-semibold text-[var(--text-primary)]">No notifications here</p>
                  <p className="mt-1 text-[13.5px] text-[var(--text-muted)]">
                    {activeTab === "Snoozed"
                      ? "Snoozed items will appear here."
                      : "You are all caught up for this tab."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

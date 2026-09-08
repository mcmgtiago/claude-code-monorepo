"use client";

import type { Route } from "next";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Bell, BellRing, Building2, CalendarDays, CheckCheck, CheckCircle2, CheckSquare, Clock3, FolderKanban, Handshake, Inbox, Info, Link2, ListChecks, Mail, RotateCcw, Timer, Trash2, TrendingUp, Users } from "lucide-react";
import { Card } from "@/components/card";
import { useConfirmAction } from "@/components/confirm-action-modal";
import { FeedbackToast } from "@/components/feedback-toast";
import { cn } from "@/lib/utils";

export type NotificationListItem = {
  id: string;
  kind: string;
  title: string;
  body: string;
  link: string | null;
  readAt: string | null;
  emailedAt: string | null;
  scheduleLabel: string | null;
  scheduleKind: "scheduled" | "due" | "overdue" | null;
  isDone: boolean;
  createdAtLabel: string;
};

export type NotificationActivityItem = {
  id: string;
  title: string;
  description: string;
  href: Route;
  kind: "lead" | "contact" | "company" | "task" | "meeting";
  badge: string;
  createdAtLabel: string;
};

type FilterId = "all" | "unread" | "emailed";
const notificationsCountEventName = "crm-notifications-unread-changed";

const filters: Array<{ id: FilterId; label: string }> = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "emailed", label: "Emailed" }
];


const filterButtonClass =
  "inline-flex h-full items-center justify-center gap-[0.4rem] rounded-md px-3 text-[0.8125rem] font-medium leading-[1.15] transition-colors";
const rowActionButtonClass =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border bg-white px-3 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";
const metaItemClass = "inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600";

function notificationIcon(kind: string) {
  switch (kind) {
    case "LEAD_ASSIGNMENT":
      return <Handshake className="h-5 w-5" />;
    case "LEAD_STAGE_CHANGE":
      return <TrendingUp className="h-5 w-5" />;
    case "LEAD_REMINDER":
      return <Timer className="h-5 w-5" />;
    case "TASK_REMINDER":
      return <ListChecks className="h-5 w-5" />;
    case "TASK_ASSIGNED":
      return <CheckCircle2 className="h-5 w-5" />;
    case "EMAIL_THREAD":
    case "EMAIL_DELIVERY":
      return <Inbox className="h-5 w-5" />;
    case "MEETING":
    case "MEETING_REMINDER":
      return <CalendarDays className="h-5 w-5" />;
    default:
      return <BellRing className="h-5 w-5" />;
  }
}

async function parseJson<T>(response: Response) {
  const payload = (await response.json().catch(() => null)) as T | { error?: string } | null;

  if (!response.ok) {
    throw new Error((payload as { error?: string } | null)?.error || "Request failed");
  }

  return payload as T;
}

export function NotificationsCenter({
  initialNotifications,
  smtpConfigured,
  activityItems,
  reminderInAppEnabled,
  reminderEmailEnabled
}: {
  initialNotifications: NotificationListItem[];
  smtpConfigured: boolean;
  activityItems: NotificationActivityItem[];
  reminderInAppEnabled: boolean;
  reminderEmailEnabled: boolean;
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [markAllBusy, setMarkAllBusy] = useState(false);
  const [clearReadBusy, setClearReadBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const { confirm: requestConfirmation, confirmationDialog } = useConfirmAction();

  const emitUnreadCount = (count: number) => {
    window.dispatchEvent(new CustomEvent(notificationsCountEventName, { detail: { count: Math.max(0, count) } }));
  };

  const unreadCount = useMemo(() => notifications.filter((item) => !item.readAt).length, [notifications]);
  const readCount = useMemo(() => notifications.length - unreadCount, [notifications.length, unreadCount]);
  const emailedCount = useMemo(() => notifications.filter((item) => Boolean(item.emailedAt)).length, [notifications]);
  const linkedCount = useMemo(() => notifications.filter((item) => Boolean(item.link)).length, [notifications]);
  const unreadSummary = unreadCount
    ? unreadCount === 1
      ? "1 needs attention"
      : `${unreadCount} need attention`
    : "All caught up";
  const emailedSummary = emailedCount
    ? emailedCount === 1
      ? "1 also emailed"
      : `${emailedCount} also emailed`
    : "No email delivery";
  const linkedSummary = linkedCount
    ? linkedCount === 1
      ? "1 opens a record"
      : `${linkedCount} open records`
    : "No direct links";

  const filteredNotifications = useMemo(() => {
    switch (activeFilter) {
      case "unread":
        return notifications.filter((item) => !item.readAt);
      case "emailed":
        return notifications.filter((item) => Boolean(item.emailedAt));
      default:
        return notifications;
    }
  }, [activeFilter, notifications]);

  const toggleReadState = (notificationId: string, shouldMarkRead: boolean) => {
    void (async () => {
      setBusyId(notificationId);
      setFeedback(null);

      try {
        const payload = await parseJson<{ readAt: string | null }>(
          await fetch(`/api/notifications/${notificationId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ read: shouldMarkRead })
          })
        );

        setNotifications((current) =>
          current.map((item) => (item.id === notificationId ? { ...item, readAt: payload.readAt } : item))
        );
        emitUnreadCount(notifications.filter((item) => item.id === notificationId ? payload.readAt === null : !item.readAt).length);
        setFeedback(shouldMarkRead ? "Notification marked as read." : "Notification marked as unread.");
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to update notification.");
      } finally {
        setBusyId(null);
      }
    })();
  };

  const deleteNotification = (notificationId: string) => {
    void (async () => {
      const confirmed = await requestConfirmation({
        title: "Delete notification?",
        description: "This notification will be removed from your account activity list.",
        confirmLabel: "Delete notification",
        tone: "danger"
      });

      if (!confirmed) {
        return;
      }

      setBusyId(notificationId);
      setFeedback(null);

      try {
        await parseJson<{ id: string }>(
          await fetch(`/api/notifications/${notificationId}`, {
            method: "DELETE"
          })
        );

        setNotifications((current) => current.filter((item) => item.id !== notificationId));
        emitUnreadCount(notifications.filter((item) => item.id !== notificationId && !item.readAt).length);
        setFeedback("Notification deleted.");
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to delete notification.");
      } finally {
        setBusyId(null);
      }
    })();
  };

  const markAllAsRead = () => {
    if (!unreadCount) {
      return;
    }

    void (async () => {
      setMarkAllBusy(true);
      setFeedback(null);

      try {
        const payload = await parseJson<{ readAt: string; updatedCount: number }>(
          await fetch("/api/notifications", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ action: "mark_all_read" })
          })
        );

        setNotifications((current) => current.map((item) => (item.readAt ? item : { ...item, readAt: payload.readAt })));
        emitUnreadCount(0);
        setFeedback(
          payload.updatedCount === 1 ? "1 notification marked as read." : `${payload.updatedCount} notifications marked as read.`
        );
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to mark notifications as read.");
      } finally {
        setMarkAllBusy(false);
      }
    })();
  };

  const clearReadNotifications = () => {
    if (!readCount) {
      return;
    }

    void (async () => {
      const confirmed = await requestConfirmation({
        title: "Clear read notifications?",
        description: "All read notifications will be permanently removed. Unread notifications will stay in your list.",
        confirmLabel: "Clear read",
        tone: "warning"
      });

      if (!confirmed) {
        return;
      }

      setClearReadBusy(true);
      setFeedback(null);

      try {
        const payload = await parseJson<{ deletedCount: number }>(
          await fetch("/api/notifications", {
            method: "DELETE"
          })
        );

        setNotifications((current) => current.filter((item) => !item.readAt));
        emitUnreadCount(0);
        setFeedback(
          payload.deletedCount === 1 ? "1 read notification cleared." : `${payload.deletedCount} read notifications cleared.`
        );
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to clear read notifications.");
      } finally {
        setClearReadBusy(false);
      }
    })();
  };

  const activityCardSummary = activityItems.length
    ? "Recent updates across leads, people, companies, tasks, and meetings."
    : "Workspace activity will appear here as records start changing.";

  return (
    <>
      {feedback ? <FeedbackToast message={feedback} position="top-right" className="max-w-[min(32rem,calc(100vw-3rem))]" /> : null}
      {confirmationDialog}

      <div className="grid items-start gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="self-start">
          <div className="border-b border-slate-200 pb-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#386df4]">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Recent notifications</h2>
                  <p className="mt-1 text-sm text-slate-500">Lead assignments, deal stage changes, task reminders, and delivery updates.</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-start gap-2 lg:justify-end">
                <button
                  type="button"
                  onClick={markAllAsRead}
                  disabled={!unreadCount || markAllBusy}
                  className="crm-btn crm-btn-secondary"
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark all read
                </button>

                <button
                  type="button"
                  onClick={clearReadNotifications}
                  disabled={!readCount || clearReadBusy}
                  className="crm-btn crm-btn-danger"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear read
                </button>
              </div>
            </div>

            <div className="mt-4">
              <div className="inline-flex h-[2.25rem] items-center rounded-[0.7rem] border border-slate-200 bg-slate-50 p-[3px]">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setActiveFilter(filter.id)}
                    className={cn(
                      filterButtonClass,
                      activeFilter === filter.id ? "bg-[#eef4ff] text-[#386df4] shadow-[0_1px_2px_rgba(56,109,244,0.08)] ring-1 ring-[#386df4]/20" : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-700"
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {filteredNotifications.length ? (
              filteredNotifications.map((notification) => {
                const isUnread = !notification.readAt;
                const isBusy = busyId === notification.id;
                const bodyText = notification.scheduleLabel
                  ? notification.body.replace(/\s*Scheduled for .+\.?$/, "").trim()
                  : notification.body;

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "rounded-2xl border px-4 py-4 transition-colors",
                      isUnread ? "border-[#cdddff] bg-[#f8fbff]" : "border-slate-200 bg-white"
                    )}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className={cn(
                            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                            isUnread ? "bg-[#386df4] text-white" : "bg-[#eef4ff] text-[#386df4]"
                          )}
                        >
                          {notificationIcon(notification.kind)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                            <div className="min-w-0 pt-0.5">
                              <div className="flex min-w-0 items-center gap-2">
                                <div className="truncate text-[15px] font-semibold tracking-[-0.01em] text-slate-900 sm:text-base">
                                  {notification.title}
                                </div>
                                {isUnread ? <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#386df4]" aria-hidden /> : null}
                              </div>
                              <div className="mt-0.5 max-w-3xl text-[13.5px] leading-5.5 text-slate-600 sm:text-sm">
                                {bodyText}
                              </div>
                            </div>

                            <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                              {notification.link ? (
                                <Link
                                  href={notification.link as Route}
                                  className={cn(rowActionButtonClass, "border-slate-200 text-slate-700 hover:bg-slate-50")}
                                >
                                  <ArrowUpRight className="h-3.5 w-3.5" />
                                  Open
                                </Link>
                              ) : null}

                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => toggleReadState(notification.id, isUnread)}
                                className={cn(rowActionButtonClass, "border-slate-200 text-slate-700 hover:bg-slate-50")}
                              >
                                {isUnread ? (
                                  <>
                                    <CheckCheck className="h-3.5 w-3.5" />
                                    Mark read
                                  </>
                                ) : (
                                  <>
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    Mark unread
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => deleteNotification(notification.id)}
                                className={cn(rowActionButtonClass, "border-rose-200 text-rose-600 hover:bg-rose-50")}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            </div>
                          </div>

                        </div>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className={metaItemClass}>
                            <Clock3 className="h-3.5 w-3.5" />
                            Created {notification.createdAtLabel}
                          </div>
                          {notification.scheduleLabel && notification.scheduleKind ? (
                            <div
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs",
                                notification.isDone
                                  ? "bg-slate-100 text-slate-400 line-through"
                                  : notification.scheduleKind === "overdue"
                                    ? "bg-red-50 text-red-500"
                                    : "bg-emerald-50 text-emerald-600"
                              )}
                            >
                              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                              <span className="font-medium">
                                {notification.scheduleKind === "overdue"
                                  ? "Overdue"
                                  : notification.scheduleKind === "scheduled"
                                    ? "Set For"
                                    : "Due"}
                              </span>
                              <span>{notification.scheduleLabel}</span>
                            </div>
                          ) : null}
                          {notification.isDone ? (
                            <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-2.5 py-1.5 text-xs text-emerald-600">
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                              <span className="font-medium">Done</span>
                            </div>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                          <div
                            className={cn(
                              metaItemClass,
                              notification.emailedAt ? "text-[#1fa261]" : "text-slate-500"
                            )}
                          >
                            <Mail className="h-3.5 w-3.5" />
                            {notification.emailedAt ? "Emailed" : "In app"}
                          </div>
                          {notification.link ? (
                            <div className={metaItemClass}>
                              <Link2 className="h-3.5 w-3.5" />
                              Linked record
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
                {notifications.length ? "No notifications match this filter." : "No notifications yet."}
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Notification overview</h2>
                <p className="mt-1 text-sm text-slate-500">What needs attention right now.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">{notifications.length} total</span>
            </div>

            <div className="mt-4 grid gap-2.5 md:grid-cols-3">
              <div className="rounded-2xl border border-[#cdddff] bg-[linear-gradient(135deg,#f8fbff_0%,#eef4ff_100%)] px-3.5 py-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-semibold text-[#386df4]">Unread</div>
                    <div className="mt-1.5 text-[1.55rem] font-semibold tracking-tight text-slate-900">{unreadCount}</div>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-[#386df4]">
                    <BellRing className="h-4.5 w-4.5" />
                  </div>
                </div>
                <div className="mt-2 text-xs leading-5 text-slate-600">{unreadSummary}</div>
              </div>

              <div className="rounded-2xl border border-[#d8f1e4] bg-[linear-gradient(135deg,#f8fffb_0%,#eefbf5_100%)] px-3.5 py-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-semibold text-[#1fa261]">Emailed</div>
                    <div className="mt-1.5 text-[1.55rem] font-semibold tracking-tight text-slate-900">{emailedCount}</div>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-[#1fa261]">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                </div>
                <div className="mt-2 text-xs leading-5 text-slate-600">{emailedSummary}</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_100%)] px-3.5 py-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-500">Linked</div>
                    <div className="mt-1.5 text-[1.55rem] font-semibold tracking-tight text-slate-900">{linkedCount}</div>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-slate-600">
                    <Link2 className="h-4.5 w-4.5" />
                  </div>
                </div>
                <div className="mt-2 text-xs leading-5 text-slate-600">{linkedSummary}</div>
              </div>
            </div>
          </Card>

          <Card>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Reminder delivery</h2>
              <p className="mt-1 text-sm text-slate-500">How reminders are sent.</p>
            </div>

            <div className="mt-4 space-y-2.5">
              <div className="rounded-2xl border border-slate-200 bg-white px-3.5 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#386df4]">
                      <Bell className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">In-app reminders</div>
                      <div className="mt-0.5 text-xs leading-5 text-slate-500">
                        In-app alerts are created by the background reminder processor.
                      </div>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                      reminderInAppEnabled ? "bg-[#eefbf5] text-[#1fa261]" : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {reminderInAppEnabled ? "Always on" : "Turned off"}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white px-3.5 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#eefbf5] text-[#1fa261]">
                      <Mail className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">Reminder emails</div>
                      <div className="mt-0.5 text-xs leading-5 text-slate-500">
                        Emails send from the background reminder processor when email delivery is configured.
                      </div>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold",
                      reminderEmailEnabled && smtpConfigured ? "bg-[#eefbf5] text-[#1fa261]" : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {reminderEmailEnabled ? (smtpConfigured ? "Email enabled" : "Email setup needed") : "Turned off"}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-[#cdddff] bg-[linear-gradient(135deg,#f8fbff_0%,#eef4ff_100%)] px-3.5 py-3.5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-white text-[#386df4]">
                    <Info className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">Manual read control</div>
                    <div className="mt-0.5 text-xs leading-5 text-slate-500">
                      Notifications stay unread until you mark them.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden border-slate-200/90 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcff_100%)] p-0">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Activity monitor</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">{activityCardSummary}</p>
            </div>

            {activityItems.length ? (
              <div className="divide-y divide-slate-200">
                {activityItems.map((item) => (
                  <Link key={item.id} href={item.href} className="flex items-start gap-3 px-5 py-4 transition hover:bg-slate-50">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#386df4]">
                      {activityIcon(item.kind)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">{item.badge}</span>
                      </div>
                      <div className="mt-1 text-sm leading-6 text-slate-500">{item.description}</div>
                      <div className="mt-2 text-xs text-slate-400">{item.createdAtLabel}</div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-5 py-8">
                <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-[#fbfcff] px-6 py-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#386df4]">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="mt-4 text-[1.05rem] font-semibold text-slate-900">No recent activity</div>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                    Lead, company, contact, task, and meeting activity will appear here as your workspace becomes active.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

function activityIcon(kind: NotificationActivityItem["kind"]) {
  switch (kind) {
    case "lead":
      return <FolderKanban className="h-4 w-4" />;
    case "contact":
      return <Users className="h-4 w-4" />;
    case "company":
      return <Building2 className="h-4 w-4" />;
    case "task":
      return <CheckSquare className="h-4 w-4" />;
    case "meeting":
      return <CalendarDays className="h-4 w-4" />;
  }
}

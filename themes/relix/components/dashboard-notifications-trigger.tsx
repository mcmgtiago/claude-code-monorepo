"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  BellRing,
  CalendarDays,
  CheckCheck,
  CheckCircle2,
  Clock3,
  Handshake,
  Inbox,
  Info,
  Link2,
  ListChecks,
  RotateCcw,
  Timer,
  Trash2,
  TrendingUp,
  X
} from "lucide-react";
import { useConfirmAction } from "@/components/confirm-action-modal";
import { FeedbackToast } from "@/components/feedback-toast";
import { cn } from "@/lib/utils";

type DashboardNotificationItem = {
  id: string;
  title: string;
  body: string;
  link: string | null;
  readAt: string | null;
  createdAtLabel: string;
  kind: string;
};

const notificationsCountEventName = "crm-notifications-unread-changed";

const rowActionButtonClass =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border bg-white px-3 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";
const metaItemClass = "inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600";

function notificationIcon(kind: string) {
  if (kind === "LEAD_ASSIGNMENT") {
    return <Handshake className="h-5 w-5" />;
  }

  if (kind === "LEAD_STAGE_CHANGE") {
    return <TrendingUp className="h-5 w-5" />;
  }

  if (kind === "LEAD_REMINDER") {
    return <Timer className="h-5 w-5" />;
  }

  if (kind === "TASK_REMINDER") {
    return <ListChecks className="h-5 w-5" />;
  }

  if (kind === "TASK_ASSIGNED") {
    return <CheckCircle2 className="h-5 w-5" />;
  }

  if (kind === "EMAIL_THREAD" || kind === "EMAIL_DELIVERY") {
    return <Inbox className="h-5 w-5" />;
  }

  if (kind === "MEETING" || kind === "MEETING_REMINDER") {
    return <CalendarDays className="h-5 w-5" />;
  }

  return <Info className="h-5 w-5" />;
}

async function parseJson<T>(response: Response) {
  const payload = (await response.json().catch(() => null)) as T | { error?: string } | null;

  if (!response.ok) {
    throw new Error((payload as { error?: string } | null)?.error || "Request failed");
  }

  return payload as T;
}

export function DashboardNotificationsTrigger({
  unreadCount,
  notifications
}: {
  unreadCount: number;
  notifications: DashboardNotificationItem[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { confirm: requestConfirmation, confirmationDialog } = useConfirmAction();
  const [items, setItems] = useState(notifications);
  const [totalUnreadCount, setTotalUnreadCount] = useState(unreadCount);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setItems(notifications);
  }, [notifications]);

  useEffect(() => {
    setTotalUnreadCount(unreadCount);
  }, [unreadCount]);

  const syncUnreadCount = (updater: number | ((current: number) => number)) => {
    setTotalUnreadCount((current) => {
      const nextCount = typeof updater === "function" ? updater(current) : updater;
      const normalizedCount = Math.max(0, nextCount);
      window.dispatchEvent(new CustomEvent(notificationsCountEventName, { detail: { count: normalizedCount } }));
      return normalizedCount;
    });
  };

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

        setItems((current) => current.map((item) => (item.id === notificationId ? { ...item, readAt: payload.readAt } : item)));
        const target = items.find((item) => item.id === notificationId);
        const wasUnread = Boolean(target && !target.readAt);
        const willBeUnread = payload.readAt === null;
        if (wasUnread !== willBeUnread) {
          syncUnreadCount((current) => current + (willBeUnread ? 1 : -1));
        }
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

        const target = items.find((item) => item.id === notificationId);
        setItems((current) => current.filter((item) => item.id !== notificationId));
        if (target && !target.readAt) {
          syncUnreadCount((current) => current - 1);
        }
        setFeedback("Notification deleted.");
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to delete notification.");
      } finally {
        setBusyId(null);
      }
    })();
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-[#c8d8ff] hover:bg-[#f8fbff] hover:text-[#386df4]"
      >
        <Bell className="h-4 w-4" />
        Notifications
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-semibold",
            totalUnreadCount ? "bg-[#eef4ff] text-[#386df4]" : "bg-slate-100 text-slate-500"
          )}
        >
          {totalUnreadCount}
        </span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-[90] flex items-start justify-center bg-[rgba(15,23,42,0.36)] px-4 py-8 backdrop-blur-[2px] sm:items-center">
          <button
            type="button"
            aria-label="Close notifications preview"
            className="absolute inset-0"
            onClick={() => setOpen(false)}
          />

          <div className="relative z-[1] w-full max-w-[720px] overflow-hidden rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcff_100%)]">
            <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#f8fbff_0%,#eef4ff_100%)] px-5 py-3.5 sm:px-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#386df4]">
                    <BellRing className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
                      {totalUnreadCount ? (
                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#386df4]">
                          {totalUnreadCount} unread
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="max-h-[min(68vh,560px)] overflow-y-auto px-5 py-5 sm:px-6">
              {items.length ? (
                <div className="space-y-3">
                  {items.map((notification) => {
                    const isUnread = !notification.readAt;
                    const isBusy = busyId === notification.id;

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
                                    {notification.body}
                                  </div>
                                </div>

                                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                                  {notification.link ? (
                                    <Link
                                      href={notification.link as Route}
                                      onClick={() => {
                                        if (isUnread) {
                                          toggleReadState(notification.id, true);
                                        }
                                        setOpen(false);
                                      }}
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
                            </div>

                            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
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
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-[#fbfcff] px-6 py-10 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#386df4]">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="mt-4 text-[1.05rem] font-semibold text-slate-900">No notifications yet</div>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    Lead assignments, reminders, and workspace alerts will start appearing here as your CRM activity grows.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-sm text-slate-500">
                {items.length ? "Need the full list and filters?" : "Open the dedicated notifications page for the full workspace."}
              </p>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push("/notifications");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#386df4] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2d5de0]"
              >
                View all notifications
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {feedback ? <FeedbackToast message={feedback} position="top-right" className="max-w-[min(32rem,calc(100vw-3rem))]" /> : null}
      {confirmationDialog}
    </>
  );
}

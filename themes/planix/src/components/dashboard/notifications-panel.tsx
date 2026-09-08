"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Check, ExternalLink } from "lucide-react";

import { Avatar } from "@/components/dashboard/avatar";
import { Panel } from "@/components/ui/panel";
import { emitPersistentStateSync } from "@/lib/use-persistent-state";
import { writeCompatibleLocalStorageItem } from "@/lib/storage-compat";
import { useNotificationsCenter } from "@/lib/notifications-center";

function NotificationVisual({
  kind,
  initials,
  tone,
}: {
  kind: "avatar" | "calendar" | "check";
  initials: string;
  tone: Parameters<typeof Avatar>[0]["tone"];
}) {
  if (kind === "avatar") {
    return <Avatar initials={initials} tone={tone} size="sm" shape="soft" />;
  }

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[#8f8f91] text-white">
      {kind === "calendar" ? (
        <CalendarDays className="h-[18px] w-[18px]" strokeWidth={2.2} />
      ) : (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/28">
          <Check className="h-[14px] w-[14px]" strokeWidth={3} />
        </div>
      )}
    </div>
  );
}

export function NotificationsPanel() {
  const router = useRouter();
  const {
    workspaceProjects,
    projectNotificationsStore,
    snoozedNotifications,
  } = useNotificationsCenter();
  const openNotifications = () => {
    const nextTab = "Important";

    writeCompatibleLocalStorageItem("planix.notifications.active-tab", JSON.stringify(nextTab));
    emitPersistentStateSync("planix.notifications.active-tab", nextTab);
    router.push("/notifications");
  };
  const notifications = useMemo(() => {
    const projectNameByRef = new Map(workspaceProjects.map((project) => [String(project.id), project.name]));

    return Object.entries(projectNotificationsStore)
      .flatMap(([projectRef, projectNotifications]) =>
        projectNotifications.map((notification) => ({
          id: `${projectRef}-${notification.id}`,
          createdAt: notification.createdAt,
          title: notification.title,
          time: notification.time,
          body: notification.body,
          kind: notification.kind === "deadline" || notification.kind === "meeting"
            ? ("calendar" as const)
            : notification.kind === "completed"
              ? ("check" as const)
              : ("avatar" as const),
          tone: notification.avatarTone ?? "sand",
          initials: notification.initials ?? (projectNameByRef.get(projectRef)?.slice(0, 2).toUpperCase() || "PR"),
          snoozed: Boolean(snoozedNotifications[`${projectRef}::${notification.id}`]),
        })),
      )
      .filter((notification) => !notification.snoozed)
      .sort((left, right) => {
        const rightCreatedAt = right.createdAt ? Date.parse(right.createdAt) : Number.NaN;
        const leftCreatedAt = left.createdAt ? Date.parse(left.createdAt) : Number.NaN;

        if (Number.isFinite(rightCreatedAt) && Number.isFinite(leftCreatedAt) && rightCreatedAt !== leftCreatedAt) {
          return rightCreatedAt - leftCreatedAt;
        }

        return right.id.localeCompare(left.id);
      })
      .slice(0, 5);
  }, [projectNotificationsStore, snoozedNotifications, workspaceProjects]);

  return (
    <Panel
      title="Notifications"
      className="rounded-[var(--radius-xl)]"
      action={
        <button
          type="button"
          aria-label="Open notifications"
          className="soft-pill flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] text-[var(--text-secondary)]"
          onClick={openNotifications}
        >
          <ExternalLink className="h-4 w-4" />
        </button>
      }
    >
      {notifications.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-white/8 bg-white/[0.02] px-4 py-8 text-center text-[0.8rem] text-[var(--text-muted)]">
          No notifications yet.
        </div>
      ) : (
        <div className="divide-y divide-white/6">
        {notifications.map((notification) => (
          <article key={notification.id} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
            <NotificationVisual
              kind={notification.kind}
              initials={notification.initials}
              tone={notification.tone}
            />
            <div className="min-w-0 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[0.88rem] font-semibold text-[var(--text-primary)]">
                  {notification.title}
                </h3>
                <span className="text-[0.76rem] text-[var(--text-muted)]">{notification.time}</span>
              </div>
              <p className="mt-0.5 text-[0.78rem] leading-[1.35] text-[var(--text-secondary)]">
                {notification.body}
              </p>
            </div>
          </article>
        ))}
        </div>
      )}
    </Panel>
  );
}

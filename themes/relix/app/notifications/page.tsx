import { NotificationsCenter, type NotificationListItem } from "@/components/notifications-center";
import { Topbar } from "@/components/topbar";
import { isSmtpConfigured } from "@/lib/email";
import { formatLocalizedDateTime } from "@/lib/localization";
import { prisma } from "@/lib/prisma";
import { getRecentWorkspaceActivity } from "@/lib/recent-workspace-activity";
import { getWorkspaceLocalizationSettings } from "@/lib/workspace-localization";
import { requireWorkspaceContext } from "@/lib/workspace";

function readQueryParam(link: string | null, key: string) {
  if (!link) {
    return null;
  }

  try {
    const url = new URL(link, "http://localhost");
    const value = url.searchParams.get(key);
    return value && value.trim().length > 0 ? value : null;
  } catch {
    return null;
  }
}

export default async function NotificationsPage() {
  const { user: currentUser, workspace } = await requireWorkspaceContext();
  const [localization, notifications, smtpConfigured, recentActivity, reminderSettings] = await Promise.all([
    getWorkspaceLocalizationSettings(),
    prisma.appNotification.findMany({
      where: { userId: currentUser.id },
      orderBy: { createdAt: "desc" },
      take: 30
    }),
    isSmtpConfigured(currentUser.id),
    getRecentWorkspaceActivity(workspace.id, 8),
    prisma.workspaceSetting.findFirst({
      where: { workspaceId: workspace.id },
      select: {
        reminderInAppEnabled: true,
        reminderEmailEnabled: true
      }
    })
  ]);

  const reminderIds = Array.from(
    new Set(
      notifications
        .filter((notification) => notification.kind === "LEAD_REMINDER")
        .map((notification) => readQueryParam(notification.link, "reminderId"))
        .filter((value): value is string => Boolean(value))
    )
  );
  const taskIds = Array.from(
    new Set(
      notifications
        .filter((notification) => notification.kind === "TASK_REMINDER")
        .map((notification) => readQueryParam(notification.link, "taskId"))
        .filter((value): value is string => Boolean(value))
    )
  );
  const [reminders, tasks] = await Promise.all([
    reminderIds.length
      ? prisma.leadReminder.findMany({
          where: {
            id: { in: reminderIds },
            lead: { workspaceId: workspace.id }
          },
          select: {
            id: true,
            remindAt: true,
            completedAt: true
          }
        })
      : Promise.resolve([]),
    taskIds.length
      ? prisma.task.findMany({
          where: {
            id: { in: taskIds },
            workspaceId: workspace.id
          },
          select: {
            id: true,
            dueDate: true,
            status: true
          }
        })
      : Promise.resolve([])
  ]);
  const reminderMap = new Map(reminders.map((reminder) => [reminder.id, reminder]));
  const taskMap = new Map(tasks.map((task) => [task.id, task]));

  const notificationItems: NotificationListItem[] = notifications.map((notification) => ({
    id: notification.id,
    kind: notification.kind,
    title: notification.title,
    body: notification.body,
    link: notification.link,
    readAt: notification.readAt ? notification.readAt.toISOString() : null,
    emailedAt: notification.emailedAt ? notification.emailedAt.toISOString() : null,
    scheduleLabel:
      notification.kind === "LEAD_REMINDER"
        ? (() => {
            const reminderId = readQueryParam(notification.link, "reminderId");
            const reminder = reminderId ? reminderMap.get(reminderId) : null;
            return reminder ? formatLocalizedDateTime(reminder.remindAt, localization) : null;
          })()
        : notification.kind === "TASK_REMINDER"
          ? (() => {
              const taskId = readQueryParam(notification.link, "taskId");
              const task = taskId ? taskMap.get(taskId) : null;
              return task?.dueDate ? formatLocalizedDateTime(task.dueDate, localization) : null;
            })()
          : null,
    isDone:
      notification.kind === "LEAD_REMINDER"
        ? (() => {
            const reminderId = readQueryParam(notification.link, "reminderId");
            const reminder = reminderId ? reminderMap.get(reminderId) : null;
            return reminder ? reminder.completedAt !== null : false;
          })()
        : notification.kind === "TASK_REMINDER"
          ? (() => {
              const taskId = readQueryParam(notification.link, "taskId");
              const task = taskId ? taskMap.get(taskId) : null;
              return task?.status === "DONE";
            })()
          : false,
    scheduleKind:
      notification.kind === "LEAD_REMINDER"
        ? (() => {
            const reminderId = readQueryParam(notification.link, "reminderId");
            const reminder = reminderId ? reminderMap.get(reminderId) : null;
            return reminder ? (reminder.remindAt <= new Date() ? "overdue" : "scheduled") : null;
          })()
        : notification.kind === "TASK_REMINDER"
          ? (() => {
              const taskId = readQueryParam(notification.link, "taskId");
              const task = taskId ? taskMap.get(taskId) : null;
              return task?.dueDate ? (task.dueDate <= new Date() ? "overdue" : "due") : null;
            })()
          : null,
    createdAtLabel: formatLocalizedDateTime(notification.createdAt, localization)
  }));
  const activityItems = recentActivity.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    href: item.href,
    kind: item.kind,
    badge: item.badge,
    createdAtLabel: formatLocalizedDateTime(item.timestamp, localization)
  }));

  return (
    <div>
      <Topbar title="Notifications" subtitle="Lead assignments, deal updates, task reminders, and recent workspace activity." />
      <NotificationsCenter
        initialNotifications={notificationItems}
        smtpConfigured={smtpConfigured}
        activityItems={activityItems}
        reminderInAppEnabled={reminderSettings?.reminderInAppEnabled ?? true}
        reminderEmailEnabled={reminderSettings?.reminderEmailEnabled ?? true}
      />
    </div>
  );
}

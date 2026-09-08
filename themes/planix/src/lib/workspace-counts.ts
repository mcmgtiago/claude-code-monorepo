import type { ChatContact } from "@/data/chats";
import type { ProjectNotification } from "@/data/project-board";

export const PROJECT_NOTIFICATIONS_STORAGE_KEY = "planix.notifications.center.project-store";
export const PROJECT_NOTIFICATION_SNOOZED_STORAGE_KEY = "planix.notifications.center.snoozed";
export const MESSAGE_CONTACTS_STORAGE_KEY = "planix.messages.local-contacts";
export const MESSAGE_THREADS_STORAGE_KEY = "planix.messages.local-threads";
export const MESSAGE_PREFERENCES_STORAGE_KEY = "planix.messages.local-preferences";

export function countUnreadMessages(contacts: ChatContact[]) {
  return contacts.reduce((total, contact) => total + Math.max(0, contact.unread ?? 0), 0);
}

export function countUnreadProjectNotifications(
  notificationsStore: Record<string, ProjectNotification[]>,
  snoozedByCompositeId?: Record<string, boolean>,
) {
  return Object.entries(notificationsStore).reduce(
    (total, [projectRef, notifications]) =>
      total + notifications.filter((notification) =>
        notification.unread
        && !snoozedByCompositeId?.[buildProjectNotificationCompositeId(projectRef, notification.id)]
      ).length,
    0,
  );
}

export function countProjectNotifications(
  notificationsStore: Record<string, ProjectNotification[]>,
  projectRef: string,
) {
  return notificationsStore[projectRef]?.length ?? 0;
}

export function buildProjectNotificationCompositeId(projectRef: string, notificationId: string) {
  return `${projectRef}::${notificationId}`;
}

export function formatSidebarBadgeCount(count: number) {
  if (count <= 0) {
    return null;
  }

  if (count > 99) {
    return "99+";
  }

  return String(count).padStart(2, "0");
}

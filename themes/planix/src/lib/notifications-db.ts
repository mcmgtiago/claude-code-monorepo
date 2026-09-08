import type { ProjectNotification, WorkspaceProject } from "@/data/project-board";
import { getDbPool } from "@/lib/db";
import { getProjectWorkspaceBundle } from "@/lib/projects-db";
import { buildProjectNotificationCompositeId } from "@/lib/workspace-counts";
import { ensureUserProfileAndSelectedWorkspace } from "@/lib/workspace-selection";

type AuthLikeUser = {
  id: string;
  email?: string | null;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    full_name?: string;
    phone?: string;
  } | null;
};

type NotificationStateRow = {
  project_ref: string;
  notification_id: string;
  read_override: boolean | null;
  snoozed: boolean;
  removed: boolean;
};

export type NotificationsCenterData = {
  workspaceProjects: WorkspaceProject[];
  projectNotificationsStore: Record<string, ProjectNotification[]>;
  snoozedNotifications: Record<string, boolean>;
};

type NotificationIdentity = {
  projectRef: string;
  notificationId: string;
};

async function listNotificationStateRows(workspaceId: string, userId: string) {
  const pool = getDbPool();
  const result = await pool.query<NotificationStateRow>(
    `
      select
        project_ref,
        notification_id,
        read_override,
        snoozed,
        removed
      from public.app_notification_user_state
      where workspace_id = $1
        and user_id = $2
    `,
    [workspaceId, userId],
  );

  return result.rows;
}

function stateKey(projectRef: string, notificationId: string) {
  return `${projectRef}::${notificationId}`;
}

function normalizeReadOverride(baseUnread: boolean, requestedUnread: boolean) {
  if (requestedUnread === baseUnread) {
    return null;
  }

  return !requestedUnread;
}

async function writeNotificationStateRow(
  workspaceId: string,
  userId: string,
  state: NotificationStateRow,
) {
  const pool = getDbPool();

  if (state.read_override === null && !state.snoozed && !state.removed) {
    await pool.query(
      `
        delete from public.app_notification_user_state
        where workspace_id = $1
          and user_id = $2
          and project_ref = $3
          and notification_id = $4
      `,
      [workspaceId, userId, state.project_ref, state.notification_id],
    );
    return;
  }

  await pool.query(
    `
      insert into public.app_notification_user_state (
        workspace_id,
        user_id,
        project_ref,
        notification_id,
        read_override,
        snoozed,
        removed
      )
      values ($1, $2, $3, $4, $5, $6, $7)
      on conflict (workspace_id, user_id, project_ref, notification_id)
      do update set
        read_override = excluded.read_override,
        snoozed = excluded.snoozed,
        removed = excluded.removed
    `,
    [
      workspaceId,
      userId,
      state.project_ref,
      state.notification_id,
      state.read_override,
      state.snoozed,
      state.removed,
    ],
  );
}

async function resolveNotificationContext(user: AuthLikeUser) {
  const { workspaceId } = await ensureUserProfileAndSelectedWorkspace(user);
  const bundle = await getProjectWorkspaceBundle(user);

  return {
    workspaceId,
    bundle,
  };
}

function findNotification(
  notificationsStore: Record<string, ProjectNotification[]>,
  identity: NotificationIdentity,
) {
  return notificationsStore[identity.projectRef]?.find(
    (notification) => notification.id === identity.notificationId,
  );
}

function applyNotificationStateRowsToStore(
  notificationsStore: Record<string, ProjectNotification[]>,
  stateRows: NotificationStateRow[],
) {
  const stateByKey = new Map(
    stateRows.map((row) => [stateKey(row.project_ref, row.notification_id), row]),
  );

  return Object.fromEntries(
    Object.entries(notificationsStore).map(([projectRef, notifications]) => [
      projectRef,
      notifications.flatMap((notification) => {
        const state = stateByKey.get(stateKey(projectRef, notification.id));

        if (state?.removed) {
          return [];
        }

        return [{
          ...notification,
          unread: state?.read_override === null || state?.read_override === undefined
            ? Boolean(notification.unread)
            : !state.read_override,
        }];
      }),
    ]),
  );
}

export async function applyNotificationStateToProjectNotificationsStore(
  workspaceId: string,
  userId: string,
  notificationsStore: Record<string, ProjectNotification[]>,
) {
  const stateRows = await listNotificationStateRows(workspaceId, userId);
  return applyNotificationStateRowsToStore(notificationsStore, stateRows);
}

export async function getNotificationsCenterData(user: AuthLikeUser): Promise<NotificationsCenterData> {
  const { workspaceId, bundle } = await resolveNotificationContext(user);
  const stateRows = await listNotificationStateRows(workspaceId, user.id);
  const projectNotificationsStore = applyNotificationStateRowsToStore(bundle.notifications, stateRows);

  const snoozedNotifications = Object.fromEntries(
    stateRows.flatMap((row) => {
      if (!row.snoozed || row.removed) {
        return [];
      }

      return [[buildProjectNotificationCompositeId(row.project_ref, row.notification_id), true] as const];
    }),
  );

  return {
    workspaceProjects: bundle.projects,
    projectNotificationsStore,
    snoozedNotifications,
  };
}

export async function setNotificationReadState(
  user: AuthLikeUser,
  identity: NotificationIdentity & { unread: boolean },
) {
  const { workspaceId, bundle } = await resolveNotificationContext(user);
  const notification = findNotification(bundle.notifications, identity);

  if (!notification) {
    throw new Error("Notification not found.");
  }

  const existingRows = await listNotificationStateRows(workspaceId, user.id);
  const existingState = existingRows.find(
    (row) => row.project_ref === identity.projectRef && row.notification_id === identity.notificationId,
  );

  await writeNotificationStateRow(workspaceId, user.id, {
    project_ref: identity.projectRef,
    notification_id: identity.notificationId,
    read_override: normalizeReadOverride(Boolean(notification.unread), identity.unread),
    snoozed: existingState?.snoozed ?? false,
    removed: existingState?.removed ?? false,
  });

  return getNotificationsCenterData(user);
}

export async function setNotificationSnoozedState(
  user: AuthLikeUser,
  identity: NotificationIdentity & { snoozed: boolean },
) {
  const { workspaceId, bundle } = await resolveNotificationContext(user);
  const notification = findNotification(bundle.notifications, identity);

  if (!notification) {
    throw new Error("Notification not found.");
  }

  const existingRows = await listNotificationStateRows(workspaceId, user.id);
  const existingState = existingRows.find(
    (row) => row.project_ref === identity.projectRef && row.notification_id === identity.notificationId,
  );

  await writeNotificationStateRow(workspaceId, user.id, {
    project_ref: identity.projectRef,
    notification_id: identity.notificationId,
    read_override: existingState?.read_override ?? null,
    snoozed: identity.snoozed,
    removed: existingState?.removed ?? false,
  });

  return getNotificationsCenterData(user);
}

export async function removeNotificationForUser(
  user: AuthLikeUser,
  identity: NotificationIdentity,
) {
  const { workspaceId, bundle } = await resolveNotificationContext(user);
  const notification = findNotification(bundle.notifications, identity);

  if (!notification) {
    throw new Error("Notification not found.");
  }

  const existingRows = await listNotificationStateRows(workspaceId, user.id);
  const existingState = existingRows.find(
    (row) => row.project_ref === identity.projectRef && row.notification_id === identity.notificationId,
  );

  await writeNotificationStateRow(workspaceId, user.id, {
    project_ref: identity.projectRef,
    notification_id: identity.notificationId,
    read_override: existingState?.read_override ?? null,
    snoozed: existingState?.snoozed ?? false,
    removed: true,
  });

  return getNotificationsCenterData(user);
}

export async function markAllNotificationsRead(user: AuthLikeUser) {
  const { workspaceId, bundle } = await resolveNotificationContext(user);
  const existingRows = await listNotificationStateRows(workspaceId, user.id);
  const existingByKey = new Map(
    existingRows.map((row) => [stateKey(row.project_ref, row.notification_id), row]),
  );

  await Promise.all(
    Object.entries(bundle.notifications).flatMap(([projectRef, notifications]) =>
      notifications.map(async (notification) => {
        const existingState = existingByKey.get(stateKey(projectRef, notification.id));

        if (existingState?.removed) {
          return;
        }

        await writeNotificationStateRow(workspaceId, user.id, {
          project_ref: projectRef,
          notification_id: notification.id,
          read_override: normalizeReadOverride(Boolean(notification.unread), false),
          snoozed: existingState?.snoozed ?? false,
          removed: false,
        });
      }),
    ),
  );

  return getNotificationsCenterData(user);
}

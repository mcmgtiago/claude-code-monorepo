import type { ActivityItem, AvatarTone } from "@/data/dashboard";
import { getDbPool } from "@/lib/db";
import { ensureUserProfileAndSelectedWorkspace } from "@/lib/workspace-selection";

const MAX_ACTIVITY_ITEMS = 80;

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

type WorkspaceActivityRow = {
  activity_key: string;
  name: string;
  action: string;
  detail: string | null;
  tone: AvatarTone;
  initials: string;
  status: ActivityItem["status"];
  time_label: string | null;
  created_at: string;
};

function formatRelativeTime(timestamp: string) {
  const createdAt = new Date(timestamp).getTime();

  if (Number.isNaN(createdAt)) {
    return "Just now";
  }

  const diffMs = Math.max(0, Date.now() - createdAt);
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(createdAt));
}

function mapWorkspaceActivityRow(row: WorkspaceActivityRow): ActivityItem {
  const numericId = Number.parseInt(row.activity_key, 10);

  return {
    id: Number.isFinite(numericId) ? numericId : Date.parse(row.created_at),
    name: row.name,
    time: row.time_label?.trim() || formatRelativeTime(row.created_at),
    action: row.action,
    detail: row.detail?.trim() || undefined,
    tone: row.tone,
    initials: row.initials,
    status: row.status,
  };
}

export async function getWorkspaceActivityFeed(user: AuthLikeUser) {
  const { workspaceId } = await ensureUserProfileAndSelectedWorkspace(user);
  const pool = getDbPool();
  const result = await pool.query<WorkspaceActivityRow>(
    `
      select
        activity_key,
        name,
        action,
        detail,
        tone,
        initials,
        status,
        time_label,
        created_at
      from public.app_workspace_activity
      where workspace_id = $1
      order by created_at desc
      limit $2
    `,
    [workspaceId, MAX_ACTIVITY_ITEMS],
  );

  return result.rows.map(mapWorkspaceActivityRow);
}

export async function appendWorkspaceActivity(user: AuthLikeUser, item: ActivityItem) {
  const { workspaceId } = await ensureUserProfileAndSelectedWorkspace(user);
  const pool = getDbPool();
  const activityKey = String(item.id);

  await pool.query(
    `
      insert into public.app_workspace_activity (
        workspace_id,
        activity_key,
        actor_user_id,
        name,
        action,
        detail,
        tone,
        initials,
        status,
        time_label
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      on conflict (workspace_id, activity_key)
      do update set
        name = excluded.name,
        action = excluded.action,
        detail = excluded.detail,
        tone = excluded.tone,
        initials = excluded.initials,
        status = excluded.status,
        time_label = excluded.time_label
    `,
    [
      workspaceId,
      activityKey,
      user.id,
      item.name.trim() || "Workspace",
      item.action.trim(),
      item.detail?.trim() || null,
      item.tone,
      item.initials.trim() || "WS",
      item.status,
      item.time.trim() || "Just now",
    ],
  );

  await pool.query(
    `
      delete from public.app_workspace_activity
      where workspace_id = $1
        and activity_key not in (
          select activity_key
          from public.app_workspace_activity
          where workspace_id = $1
          order by created_at desc
          limit $2
        )
    `,
    [workspaceId, MAX_ACTIVITY_ITEMS],
  );

  return getWorkspaceActivityFeed(user);
}

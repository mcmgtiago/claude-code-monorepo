const COMPLETED_TASK_STATUSES = new Set(["completed", "done"]);

export function normalizeTaskStatusId(statusId?: string | null) {
  const normalized = statusId?.trim().toLowerCase() ?? "";

  if (!normalized) {
    return "";
  }

  return normalized === "done" ? "completed" : normalized;
}

export function isCompletedTaskStatus(statusId?: string | null) {
  return COMPLETED_TASK_STATUSES.has(normalizeTaskStatusId(statusId));
}

export function resolveTaskCompletedAt(task: {
  status_id?: string | null;
  created_at: string;
  completed_at?: string | null;
}) {
  if (task.completed_at?.trim()) {
    return task.completed_at;
  }

  return isCompletedTaskStatus(task.status_id) ? task.created_at : null;
}

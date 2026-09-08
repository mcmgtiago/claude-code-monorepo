import { getDbPool } from "@/lib/db";
import { isCompletedTaskStatus } from "@/lib/task-status";

export async function deleteProjectTasksForWorkspace(workspaceId: string, projectRef: string) {
  const pool = getDbPool();

  await pool.query(
    `
      delete from public.app_tasks
      where workspace_id = $1
        and project_ref = $2
    `,
    [workspaceId, projectRef],
  );
}

export type ProjectTaskSummary = {
  projectRef: string;
  total: number;
  open: number;
  progress: number;
  review: number;
  done: number;
};

export async function getProjectTaskSummariesForWorkspace(
  workspaceId: string,
  projectRefs: string[],
) {
  if (projectRefs.length === 0) {
    return {} as Record<string, ProjectTaskSummary>;
  }

  const pool = getDbPool();
  const result = await pool.query<{
    project_ref: string;
    status_id: string;
    count: string;
  }>(
    `
      select
        project_ref,
        status_id,
        count(*)::text as count
      from public.app_tasks
      where workspace_id = $1
        and project_ref = any($2::text[])
      group by project_ref, status_id
    `,
    [workspaceId, projectRefs],
  );

  const summaryMap: Record<string, ProjectTaskSummary> = {};

  for (const projectRef of projectRefs) {
    summaryMap[projectRef] = {
      projectRef,
      total: 0,
      open: 0,
      progress: 0,
      review: 0,
      done: 0,
    };
  }

  for (const row of result.rows) {
    const summary = summaryMap[row.project_ref];

    if (!summary) {
      continue;
    }

    const count = Number(row.count) || 0;
    summary.total += count;

    if (row.status_id === "open") {
      summary.open += count;
      continue;
    }

    if (row.status_id === "progress") {
      summary.progress += count;
      continue;
    }

    if (row.status_id === "review") {
      summary.review += count;
      continue;
    }

    if (isCompletedTaskStatus(row.status_id)) {
      summary.done += count;
    }
  }

  return summaryMap;
}

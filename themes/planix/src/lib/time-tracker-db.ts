import { getDbPool } from "@/lib/db";
import {
  TIME_TRACKER_WINDOW_DAYS,
  type TimeTrackerDashboardPayload,
  type TimeTrackerDailyPoint,
  type TimeTrackerEntryRecord,
  type TimeTrackerProjectBreakdownItem,
  type TimeTrackerTaskBreakdownItem,
} from "@/lib/time-tracker";

type TimeEntryRow = {
  id: string;
  project_ref: string;
  task_id: number | null;
  task_title: string | null;
  actor_name: string;
  started_at: string;
  ended_at: string | null;
  total_minutes: string | number;
};

type DailyRow = {
  date: string;
  total_minutes: string | number;
};

type ProjectBreakdownRow = {
  project_ref: string;
  total_minutes: string | number;
  entry_count: string | number;
  task_count: string | number;
};

type TaskBreakdownRow = {
  task_id: number | null;
  project_ref: string;
  task_title: string | null;
  total_minutes: string | number;
  tracked_total_minutes: string | number;
};

function createTimeEntryId() {
  return `time-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function numericValue(value: string | number | null | undefined) {
  const normalized = Number(value ?? 0);
  return Number.isFinite(normalized) ? normalized : 0;
}

function roundMinutes(value: string | number | null | undefined) {
  return Math.max(0, Math.round(numericValue(value)));
}

function buildActiveTimeEntriesQuery(input?: {
  workspaceId?: string | null;
  actorName?: string | null;
  entryId?: string | null;
  projectRef?: string | null;
  taskId?: number | null;
  limit?: number;
  forUpdate?: boolean;
}) {
  const params: Array<string | number> = [];
  const conditions = ["entry.ended_at is null"];
  const workspaceId = input?.workspaceId?.trim() || null;
  const actorName = input?.actorName?.trim() || "";
  const entryId = input?.entryId?.trim() || "";
  const projectRef = input?.projectRef?.trim() || "";

  if (workspaceId) {
    params.push(workspaceId);
    conditions.push(`entry.workspace_id = $${params.length}`);
  }

  if (actorName) {
    params.push(actorName);
    conditions.push(`entry.actor_name = $${params.length}`);
  }

  if (entryId) {
    params.push(entryId);
    conditions.push(`entry.id = $${params.length}`);
  }

  if (projectRef) {
    params.push(projectRef);
    conditions.push(`entry.project_ref = $${params.length}`);
  }

  if (input && "taskId" in input) {
    if (input.taskId === null) {
      conditions.push("entry.task_id is null");
    } else if (typeof input.taskId === "number") {
      params.push(input.taskId);
      conditions.push(`entry.task_id = $${params.length}`);
    }
  }

  const limitClause = typeof input?.limit === "number" ? `limit ${Math.max(1, Math.floor(input.limit))}` : "";
  const forUpdateClause = input?.forUpdate ? "for update of entry" : "";

  return {
    text: `
      select
        entry.id,
        entry.project_ref,
        entry.task_id,
        task.title as task_title,
        entry.actor_name,
        entry.started_at::text,
        entry.ended_at::text,
        extract(epoch from (coalesce(entry.ended_at, now()) - entry.started_at)) / 60.0 as total_minutes
      from public.app_time_entries entry
      left join public.app_tasks task on task.id = entry.task_id
      where ${conditions.join("\n        and ")}
      order by entry.started_at desc
      ${limitClause}
      ${forUpdateClause}
    `,
    params,
  };
}

function mapTimeEntryRow(row: TimeEntryRow): TimeTrackerEntryRecord {
  return {
    id: row.id,
    projectRef: row.project_ref,
    taskId: row.task_id ? Number(row.task_id) : null,
    taskTitle: row.task_title,
    actorName: row.actor_name,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    totalMinutes: roundMinutes(row.total_minutes),
  };
}

function formatDailyLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
  }).format(date);
}

function buildDailyFallback(days: number) {
  const points: TimeTrackerDailyPoint[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let index = days - 1; index >= 0; index -= 1) {
    const current = new Date(today);
    current.setDate(today.getDate() - index);
    points.push({
      date: current.toISOString().slice(0, 10),
      label: formatDailyLabel(current),
      totalMinutes: 0,
    });
  }

  return points;
}

export async function getActiveTimeEntries(actorName?: string | null, workspaceId?: string | null) {
  const pool = getDbPool();
  const query = buildActiveTimeEntriesQuery({ actorName, workspaceId });
  const result = await pool.query<TimeEntryRow>(query.text, query.params);
  return result.rows.map(mapTimeEntryRow);
}

export async function getActiveTimeEntry(actorName?: string | null, workspaceId?: string | null) {
  const entries = await getActiveTimeEntries(actorName, workspaceId);
  return entries[0] ?? null;
}

export async function startTimeEntry(input: {
  workspaceId?: string | null;
  projectRef: string;
  taskId?: number | null;
  actorName?: string | null;
}) {
  const projectRef = input.projectRef.trim();
  const workspaceId = input.workspaceId?.trim() || null;
  const actorName = input.actorName?.trim() || "You";

  if (!projectRef) {
    throw new Error("Project reference is required.");
  }

  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query("begin");

    const existingActiveQuery = buildActiveTimeEntriesQuery({
      workspaceId,
      actorName,
      projectRef,
      taskId: input.taskId ?? null,
      limit: 1,
      forUpdate: true,
    });
    const existingActiveResult = await client.query<TimeEntryRow>(existingActiveQuery.text, existingActiveQuery.params);

    if (existingActiveResult.rows[0]) {
      await client.query("commit");

      return {
        activeEntry: mapTimeEntryRow(existingActiveResult.rows[0]),
        dashboard: await getTimeTrackerDashboard(actorName, workspaceId),
      };
    }

    if (input.taskId) {
      const taskResult = workspaceId
        ? await client.query<{ id: number }>(
            `
              select id
              from public.app_tasks
              where id = $1
                and workspace_id = $2
                and project_ref = $3
              limit 1
            `,
            [input.taskId, workspaceId, projectRef],
          )
        : await client.query<{ id: number }>(
            `
              select id
              from public.app_tasks
              where id = $1
                and project_ref = $2
              limit 1
            `,
            [input.taskId, projectRef],
          );

      if (!taskResult.rows[0]) {
        throw new Error("Selected task does not belong to this project.");
      }
    }

    const entryId = createTimeEntryId();
    await client.query(
      `
        insert into public.app_time_entries (
          id,
          workspace_id,
          project_ref,
          task_id,
          actor_name
        )
        values ($1, $2, $3, $4, $5)
      `,
      [entryId, workspaceId, projectRef, input.taskId ?? null, actorName],
    );

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }

  return {
    activeEntry: await getActiveTimeEntry(actorName, workspaceId),
    dashboard: await getTimeTrackerDashboard(actorName, workspaceId),
  };
}

export async function stopActiveTimeEntry(input?: { entryId?: string | null; actorName?: string | null; workspaceId?: string | null }) {
  const pool = getDbPool();
  const client = await pool.connect();
  const fallbackActorName = input?.actorName?.trim() || "You";
  const workspaceId = input?.workspaceId?.trim() || null;
  let resolvedActorName = fallbackActorName;

  try {
    await client.query("begin");

    const targetActiveQuery = buildActiveTimeEntriesQuery(
      input?.entryId?.trim()
        ? {
            workspaceId,
            entryId: input.entryId,
            limit: 1,
            forUpdate: true,
          }
        : {
            workspaceId,
            actorName: fallbackActorName,
            limit: 1,
            forUpdate: true,
          },
    );
    const targetActiveResult = await client.query<TimeEntryRow>(targetActiveQuery.text, targetActiveQuery.params);
    const targetActiveRow = targetActiveResult.rows[0] ?? null;
    const activeId = targetActiveRow?.id ?? null;

    if (targetActiveRow?.actor_name?.trim()) {
      resolvedActorName = targetActiveRow.actor_name.trim();
    }

    if (!activeId) {
      throw new Error(input?.entryId?.trim() ? "This timer is no longer active." : "There is no active timer to stop.");
    }

    await client.query(
      `
        update public.app_time_entries
        set ended_at = now()
        where id = $1
      `,
      [activeId],
    );

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }

  return {
    activeEntry: await getActiveTimeEntry(resolvedActorName, workspaceId),
    dashboard: await getTimeTrackerDashboard(resolvedActorName, workspaceId),
  };
}

export async function getTimeTrackerDashboard(actorName?: string | null, workspaceId?: string | null): Promise<TimeTrackerDashboardPayload> {
  const pool = getDbPool();
  const normalizedActorName = actorName?.trim() || "You";
  const activeQuery = buildActiveTimeEntriesQuery({ actorName: normalizedActorName, workspaceId });

  const [activeResult, dailyResult, totalsResult, projectsResult, tasksResult] = workspaceId
    ? await Promise.all([
        pool.query<TimeEntryRow>(activeQuery.text, activeQuery.params),
        pool.query<DailyRow>(
          `
            with days as (
              select generate_series(
                (current_date - make_interval(days => $1 - 1))::date,
                current_date::date,
                interval '1 day'
              )::date as day
            )
            select
              days.day::text as date,
              coalesce(
                sum(
                  extract(
                    epoch from (
                      least(coalesce(entry.ended_at, now()), (days.day + interval '1 day')::timestamptz)
                      - greatest(entry.started_at, days.day::timestamptz)
                    )
                  ) / 60.0
                ),
                0
              ) as total_minutes
            from days
            left join public.app_time_entries entry
              on entry.started_at < (days.day + interval '1 day')::timestamptz
              and coalesce(entry.ended_at, now()) > days.day::timestamptz
              and entry.workspace_id = $2
              and entry.actor_name = $3
            group by days.day
            order by days.day asc
          `,
          [TIME_TRACKER_WINDOW_DAYS, workspaceId, normalizedActorName],
        ),
        pool.query<{ current_total_minutes: string | number; previous_total_minutes: string | number; today_minutes: string | number }>(
          `
            with today_window as (
              select current_date::timestamptz as start_at, (current_date + interval '1 day')::timestamptz as end_at
            ),
            current_window as (
              select
                (current_date - make_interval(days => $1 - 1))::timestamptz as start_at,
                (current_date + interval '1 day')::timestamptz as end_at
            ),
            previous_window as (
              select
                (current_date - make_interval(days => ($1 * 2) - 1))::timestamptz as start_at,
                (current_date - make_interval(days => $1 - 1))::timestamptz as end_at
            )
            select
              (
                select coalesce(sum(extract(epoch from (least(coalesce(entry.ended_at, now()), current_window.end_at) - greatest(entry.started_at, current_window.start_at))) / 60.0), 0)
                from public.app_time_entries entry, current_window
                where entry.started_at < current_window.end_at
                  and coalesce(entry.ended_at, now()) > current_window.start_at
                  and entry.workspace_id = $2
                  and entry.actor_name = $3
              ) as current_total_minutes,
              (
                select coalesce(sum(extract(epoch from (least(coalesce(entry.ended_at, now()), previous_window.end_at) - greatest(entry.started_at, previous_window.start_at))) / 60.0), 0)
                from public.app_time_entries entry, previous_window
                where entry.started_at < previous_window.end_at
                  and coalesce(entry.ended_at, now()) > previous_window.start_at
                  and entry.workspace_id = $2
                  and entry.actor_name = $3
              ) as previous_total_minutes,
              (
                select coalesce(sum(extract(epoch from (least(coalesce(entry.ended_at, now()), today_window.end_at) - greatest(entry.started_at, today_window.start_at))) / 60.0), 0)
                from public.app_time_entries entry, today_window
                where entry.started_at < today_window.end_at
                  and coalesce(entry.ended_at, now()) > today_window.start_at
                  and entry.workspace_id = $2
                  and entry.actor_name = $3
              ) as today_minutes
          `,
          [TIME_TRACKER_WINDOW_DAYS, workspaceId, normalizedActorName],
        ),
        pool.query<ProjectBreakdownRow>(
          `
            with current_window as (
              select
                (current_date - make_interval(days => $1 - 1))::timestamptz as start_at,
                (current_date + interval '1 day')::timestamptz as end_at
            )
            select
              entry.project_ref,
              coalesce(sum(extract(epoch from (least(coalesce(entry.ended_at, now()), current_window.end_at) - greatest(entry.started_at, current_window.start_at))) / 60.0), 0) as total_minutes,
              count(*) as entry_count,
              count(distinct entry.task_id) filter (where entry.task_id is not null) as task_count
            from public.app_time_entries entry, current_window
            where entry.started_at < current_window.end_at
              and coalesce(entry.ended_at, now()) > current_window.start_at
              and entry.workspace_id = $2
              and entry.actor_name = $3
            group by entry.project_ref
            having coalesce(sum(extract(epoch from (least(coalesce(entry.ended_at, now()), current_window.end_at) - greatest(entry.started_at, current_window.start_at))) / 60.0), 0) > 0
            order by total_minutes desc, entry.project_ref asc
            limit 6
          `,
          [TIME_TRACKER_WINDOW_DAYS, workspaceId, normalizedActorName],
        ),
        pool.query<TaskBreakdownRow>(
          `
            with current_window as (
              select
                (current_date - make_interval(days => $1 - 1))::timestamptz as start_at,
                (current_date + interval '1 day')::timestamptz as end_at
            ),
            grouped_tasks as (
              select
                entry.task_id,
                entry.project_ref,
                coalesce(task.title, 'General project time') as task_title,
                coalesce(sum(extract(epoch from (least(coalesce(entry.ended_at, now()), current_window.end_at) - greatest(entry.started_at, current_window.start_at))) / 60.0), 0) as total_minutes
              from public.app_time_entries entry
              left join public.app_tasks task on task.id = entry.task_id,
              current_window
              where entry.started_at < current_window.end_at
                and coalesce(entry.ended_at, now()) > current_window.start_at
                and entry.workspace_id = $2
                and entry.actor_name = $3
              group by entry.task_id, entry.project_ref, task.title
              having coalesce(sum(extract(epoch from (least(coalesce(entry.ended_at, now()), current_window.end_at) - greatest(entry.started_at, current_window.start_at))) / 60.0), 0) > 0
            )
            select
              task_id,
              project_ref,
              task_title,
              total_minutes,
              coalesce(sum(total_minutes) over (), 0) as tracked_total_minutes
            from grouped_tasks
            order by total_minutes desc, task_title asc
            limit 6
          `,
          [TIME_TRACKER_WINDOW_DAYS, workspaceId, normalizedActorName],
        ),
      ])
    : await Promise.all([
        pool.query<TimeEntryRow>(activeQuery.text, activeQuery.params),
        pool.query<DailyRow>(
      `
        with days as (
          select generate_series(
            (current_date - make_interval(days => $1 - 1))::date,
            current_date::date,
            interval '1 day'
          )::date as day
        )
        select
          days.day::text as date,
          coalesce(
            sum(
              extract(
                epoch from (
                  least(coalesce(entry.ended_at, now()), (days.day + interval '1 day')::timestamptz)
                  - greatest(entry.started_at, days.day::timestamptz)
                )
              ) / 60.0
            ),
            0
          ) as total_minutes
        from days
        left join public.app_time_entries entry
          on entry.started_at < (days.day + interval '1 day')::timestamptz
          and coalesce(entry.ended_at, now()) > days.day::timestamptz
          and entry.actor_name = $2
        group by days.day
        order by days.day asc
      `,
      [TIME_TRACKER_WINDOW_DAYS, normalizedActorName],
    ),
    pool.query<{ current_total_minutes: string | number; previous_total_minutes: string | number; today_minutes: string | number }>(
      `
        with today_window as (
          select current_date::timestamptz as start_at, (current_date + interval '1 day')::timestamptz as end_at
        ),
        current_window as (
          select
            (current_date - make_interval(days => $1 - 1))::timestamptz as start_at,
            (current_date + interval '1 day')::timestamptz as end_at
        ),
        previous_window as (
          select
            (current_date - make_interval(days => ($1 * 2) - 1))::timestamptz as start_at,
            (current_date - make_interval(days => $1 - 1))::timestamptz as end_at
        )
        select
          (
            select coalesce(sum(extract(epoch from (least(coalesce(entry.ended_at, now()), current_window.end_at) - greatest(entry.started_at, current_window.start_at))) / 60.0), 0)
            from public.app_time_entries entry, current_window
            where entry.started_at < current_window.end_at
              and coalesce(entry.ended_at, now()) > current_window.start_at
              and entry.actor_name = $2
          ) as current_total_minutes,
          (
            select coalesce(sum(extract(epoch from (least(coalesce(entry.ended_at, now()), previous_window.end_at) - greatest(entry.started_at, previous_window.start_at))) / 60.0), 0)
            from public.app_time_entries entry, previous_window
            where entry.started_at < previous_window.end_at
              and coalesce(entry.ended_at, now()) > previous_window.start_at
              and entry.actor_name = $2
          ) as previous_total_minutes,
          (
            select coalesce(sum(extract(epoch from (least(coalesce(entry.ended_at, now()), today_window.end_at) - greatest(entry.started_at, today_window.start_at))) / 60.0), 0)
            from public.app_time_entries entry, today_window
            where entry.started_at < today_window.end_at
              and coalesce(entry.ended_at, now()) > today_window.start_at
              and entry.actor_name = $2
          ) as today_minutes
      `,
      [TIME_TRACKER_WINDOW_DAYS, normalizedActorName],
    ),
    pool.query<ProjectBreakdownRow>(
      `
        with current_window as (
          select
            (current_date - make_interval(days => $1 - 1))::timestamptz as start_at,
            (current_date + interval '1 day')::timestamptz as end_at
        )
        select
          entry.project_ref,
          coalesce(sum(extract(epoch from (least(coalesce(entry.ended_at, now()), current_window.end_at) - greatest(entry.started_at, current_window.start_at))) / 60.0), 0) as total_minutes,
          count(*) as entry_count,
          count(distinct entry.task_id) filter (where entry.task_id is not null) as task_count
        from public.app_time_entries entry, current_window
        where entry.started_at < current_window.end_at
          and coalesce(entry.ended_at, now()) > current_window.start_at
          and entry.actor_name = $2
        group by entry.project_ref
        having coalesce(sum(extract(epoch from (least(coalesce(entry.ended_at, now()), current_window.end_at) - greatest(entry.started_at, current_window.start_at))) / 60.0), 0) > 0
        order by total_minutes desc, entry.project_ref asc
        limit 6
      `,
      [TIME_TRACKER_WINDOW_DAYS, normalizedActorName],
    ),
    pool.query<TaskBreakdownRow>(
      `
        with current_window as (
          select
            (current_date - make_interval(days => $1 - 1))::timestamptz as start_at,
            (current_date + interval '1 day')::timestamptz as end_at
        ),
        grouped_tasks as (
          select
            entry.task_id,
            entry.project_ref,
            coalesce(task.title, 'General project time') as task_title,
            coalesce(sum(extract(epoch from (least(coalesce(entry.ended_at, now()), current_window.end_at) - greatest(entry.started_at, current_window.start_at))) / 60.0), 0) as total_minutes
          from public.app_time_entries entry
          left join public.app_tasks task on task.id = entry.task_id,
          current_window
          where entry.started_at < current_window.end_at
            and coalesce(entry.ended_at, now()) > current_window.start_at
            and entry.actor_name = $2
          group by entry.task_id, entry.project_ref, task.title
          having coalesce(sum(extract(epoch from (least(coalesce(entry.ended_at, now()), current_window.end_at) - greatest(entry.started_at, current_window.start_at))) / 60.0), 0) > 0
        )
        select
          task_id,
          project_ref,
          task_title,
          total_minutes,
          coalesce(sum(total_minutes) over (), 0) as tracked_total_minutes
        from grouped_tasks
        order by total_minutes desc, task_title asc
        limit 6
      `,
      [TIME_TRACKER_WINDOW_DAYS, normalizedActorName],
    ),
      ]);

  const activeEntries = activeResult.rows.map(mapTimeEntryRow);
  const activeEntry = activeEntries[0] ?? null;
  const dailyMap = new Map(
    dailyResult.rows.map((row) => [
      row.date.slice(0, 10),
      roundMinutes(row.total_minutes),
    ]),
  );
  const daily = buildDailyFallback(TIME_TRACKER_WINDOW_DAYS).map((point) => ({
    ...point,
    totalMinutes: dailyMap.get(point.date) ?? point.totalMinutes,
  }));
  const totals = totalsResult.rows[0];
  const totalMinutes = roundMinutes(totals?.current_total_minutes);
  const previousPeriodMinutes = roundMinutes(totals?.previous_total_minutes);
  const todayMinutes = roundMinutes(totals?.today_minutes);
  const trendPercent = previousPeriodMinutes > 0
    ? Number((((totalMinutes - previousPeriodMinutes) / previousPeriodMinutes) * 100).toFixed(1))
    : totalMinutes > 0
      ? 100
      : null;

  const projectBreakdown: TimeTrackerProjectBreakdownItem[] = projectsResult.rows.map((row) => ({
    projectRef: row.project_ref,
    totalMinutes: roundMinutes(row.total_minutes),
    entryCount: Math.max(0, Math.round(numericValue(row.entry_count))),
    taskCount: Math.max(0, Math.round(numericValue(row.task_count))),
  }));

  const trackedTaskTotal = roundMinutes(tasksResult.rows[0]?.tracked_total_minutes);
  const taskBreakdown: TimeTrackerTaskBreakdownItem[] = tasksResult.rows.map((row) => {
    const taskMinutes = roundMinutes(row.total_minutes);
    const sharePercent = trackedTaskTotal > 0 ? Number(((taskMinutes / trackedTaskTotal) * 100).toFixed(1)) : 0;

    return {
      taskId: row.task_id ? Number(row.task_id) : null,
      projectRef: row.project_ref,
      title: row.task_title ?? "General project time",
      totalMinutes: taskMinutes,
      sharePercent,
    };
  });

  return {
    activeEntry,
    activeEntries,
    summary: {
      totalMinutes,
      todayMinutes,
      previousPeriodMinutes,
      trendPercent,
      daily,
    },
    projectBreakdown,
    taskBreakdown,
  };
}

export async function deleteProjectTimeEntriesForWorkspace(workspaceId: string, projectRef: string) {
  const pool = getDbPool();

  await pool.query(
    `
      delete from public.app_time_entries
      where workspace_id = $1
        and project_ref = $2
    `,
    [workspaceId, projectRef],
  );
}

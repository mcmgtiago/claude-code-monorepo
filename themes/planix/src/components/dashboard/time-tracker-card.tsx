"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Loader2,
  Square,
  RefreshCcw,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DashboardCardMenu } from "@/components/dashboard/dashboard-card-menu";
import { Panel } from "@/components/ui/panel";
import { type WorkspaceProject } from "@/data/project-board";
import {
  dispatchTimeTrackerChanged,
  TIME_TRACKER_CHANGED_EVENT,
  resolveTimeTrackerActorName,
  type TimeTrackerDashboardPayload,
} from "@/lib/time-tracker";
import { PROFILE_IDENTITY_STORAGE_KEY } from "@/lib/profile-client";
import { readJsonSafely, useSettingsBridgeHydration } from "@/lib/settings-client";
import { usePersistentState } from "@/lib/use-persistent-state";
import { getDemoWorkspaceProjects } from "@/lib/template-demo-store";
import { defaultWorkspaceForm } from "@/lib/settings";
import { cn } from "@/lib/utils";

const trackerTabs = ["Summary", "Projects", "Tasks"] as const;
const TRACKER_COLORS = ["#fb8a74", "#f0c36c", "#72d3cf", "#8bb7ff", "#d2a8ff", "#9bc27c"] as const;

type TrackerTab = (typeof trackerTabs)[number];

type DailyTooltipPayload = {
  value?: number | string;
  payload?: {
    label: string;
    totalMinutes: number;
  };
};

type BreakdownTooltipPayload = {
  payload?: {
    label: string;
    totalMinutes: number;
    meta: string;
    color: string;
  };
};

function formatMinutes(value: number) {
  const totalMinutes = Math.max(0, Math.round(value));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

function formatElapsed(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function LiveElapsedText({ startedAt }: { startedAt: string }) {
  const [elapsedLabel, setElapsedLabel] = useState(() => {
    const startedAtMs = new Date(startedAt).getTime();
    const nextSeconds = Number.isFinite(startedAtMs)
      ? Math.max(0, Math.floor((Date.now() - startedAtMs) / 1000))
      : 0;
    return formatElapsed(nextSeconds);
  });

  useEffect(() => {
    const updateElapsed = () => {
      const startedAtMs = new Date(startedAt).getTime();
      const nextSeconds = Number.isFinite(startedAtMs)
        ? Math.max(0, Math.floor((Date.now() - startedAtMs) / 1000))
        : 0;
      setElapsedLabel(formatElapsed(nextSeconds));
    };

    updateElapsed();
    const intervalId = window.setInterval(updateElapsed, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [startedAt]);

  return <>{elapsedLabel}</>;
}

function useCountUp(target: number, duration = 1100) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setCurrent(0);
      return;
    }

    let rafId: number;
    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(2, -10 * progress);
      setCurrent(Math.round(eased * target));
      if (progress < 1) rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  return current;
}

function formatTrend(value: number | null) {
  if (value === null) {
    return "No baseline";
  }

  if (value === 0) {
    return "0%";
  }

  return `${value > 0 ? "+" : ""}${value}%`;
}

function projectToneColor(project?: Pick<WorkspaceProject, "tone"> | null) {
  if (project?.tone === "peach") return "#fb8a74";
  if (project?.tone === "sand") return "#d7ab98";
  if (project?.tone === "olive") return "#9bc27c";
  if (project?.tone === "rose") return "#f3b0b7";
  if (project?.tone === "slate") return "#8bb7ff";
  return null;
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "").trim();
  const expanded = normalized.length === 3
    ? normalized.split("").map((char) => `${char}${char}`).join("")
    : normalized;

  if (!/^[0-9a-f]{6}$/i.test(expanded)) {
    return `rgba(255,255,255,${alpha})`;
  }

  const red = Number.parseInt(expanded.slice(0, 2), 16);
  const green = Number.parseInt(expanded.slice(2, 4), 16);
  const blue = Number.parseInt(expanded.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function DailyTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: DailyTooltipPayload[];
}) {
  const row = payload?.[0]?.payload;

  if (!active || !row) {
    return null;
  }

  return (
    <div className="rounded-[var(--radius-md)] border border-white/8 bg-[#1e1f23] px-3 py-2 text-[0.78rem] shadow-lg">
      <p className="text-[var(--text-muted)]">{row.label}</p>
      <p className="mt-0.5 font-semibold text-[var(--text-primary)]">{formatMinutes(row.totalMinutes)}</p>
    </div>
  );
}

function BreakdownTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: BreakdownTooltipPayload[];
}) {
  const row = payload?.[0]?.payload;

  if (!active || !row) {
    return null;
  }

  return (
    <div className="rounded-[var(--radius-md)] border border-white/8 bg-[#1e1f23] px-3 py-2 text-[0.78rem] shadow-lg">
      <p className="font-semibold text-[var(--text-primary)]">{row.label}</p>
      <p className="mt-0.5 text-[var(--text-secondary)]">{row.meta}</p>
      <p className="mt-1.5 font-semibold" style={{ color: row.color }}>
        {formatMinutes(row.totalMinutes)}
      </p>
    </div>
  );
}

function EmptyTrackerState({ label }: { label: string }) {
  return (
    <div className="animate-tt-in flex min-h-[268px] items-center justify-center rounded-[var(--radius-xl)] border border-dashed border-white/8 bg-[#0d0e10] px-5 py-8 text-center text-[0.82rem] text-[var(--text-muted)]">
      {label}
    </div>
  );
}

function SummaryView({
  isMounted,
  dashboard,
}: {
  isMounted: boolean;
  dashboard: TimeTrackerDashboardPayload;
}) {
  const animatedTotal = useCountUp(dashboard.summary.totalMinutes);
  const animatedToday = useCountUp(dashboard.summary.todayMinutes, 800);
  const animatedPrev = useCountUp(dashboard.summary.previousPeriodMinutes, 950);

  const dailyChartData = dashboard.summary.daily.map((point, index) => ({
    ...point,
    color: TRACKER_COLORS[index % TRACKER_COLORS.length],
  }));
  const activeEntriesCount = dashboard.activeEntries.length;
  const trendPositive = (dashboard.summary.trendPercent ?? 0) >= 0;

  return (
    <div className="animate-tt-in rounded-[var(--radius-xl)] border border-white/6 bg-[#0d0e10] p-4 sm:p-5">
      <div className="grid gap-4 xl:grid-cols-[minmax(196px,0.72fr)_minmax(0,1.28fr)] xl:items-end xl:gap-6">
        <div className="space-y-3.5 xl:max-w-[204px]">
          <div>
            <p className="type-ui text-[0.8rem] text-[var(--text-secondary)]">Tracked this week</p>
            <p className="type-metric-lg mt-1 text-[var(--text-primary)]">{formatMinutes(animatedTotal)}</p>
          </div>

          <div className="grid w-full gap-2 sm:w-fit sm:grid-cols-2 xl:w-[196px] xl:grid-cols-1">
            <div className="rounded-[10px] bg-white/[0.025] px-3 py-2.5 sm:w-[176px] xl:w-[196px]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[0.78rem] text-[var(--text-secondary)]">Today</span>
                <span className="text-[0.86rem] font-semibold text-[var(--text-primary)]">
                  {formatMinutes(animatedToday)}
                </span>
              </div>
            </div>
            <div className="rounded-[10px] bg-white/[0.025] px-3 py-2.5 sm:w-[176px] xl:w-[196px]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[0.78rem] text-[var(--text-secondary)]">Previous 7 days</span>
                <span className="text-[0.86rem] font-semibold text-[var(--text-primary)]">
                  {formatMinutes(animatedPrev)}
                </span>
              </div>
            </div>
            <div className="rounded-[10px] bg-white/[0.025] px-3 py-2.5 sm:w-[176px] xl:w-[196px]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[0.78rem] text-[var(--text-secondary)]">Active timers</span>
                <span className="text-[0.86rem] font-semibold text-[var(--text-primary)]">
                  {activeEntriesCount > 1
                    ? `${activeEntriesCount} running`
                    : dashboard.activeEntry
                      ? <LiveElapsedText startedAt={dashboard.activeEntry.startedAt} />
                      : "0"}
                </span>
              </div>
            </div>
          </div>

          <div className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8rem] font-semibold", trendPositive ? "text-[#4bd77f]" : "text-[#fb8a74]")}>
            <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full border-[1.5px] border-current opacity-90">
              {trendPositive ? <ArrowUpRight className="h-2.5 w-2.5" strokeWidth={3} /> : <ArrowDownRight className="h-2.5 w-2.5" strokeWidth={3} />}
            </span>
            {formatTrend(dashboard.summary.trendPercent)}
            <span className="font-normal text-[var(--text-muted)]">vs previous 7 days</span>
          </div>
        </div>

        <div className="h-[208px] sm:h-[248px] xl:min-w-0">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyChartData} margin={{ top: 8, right: 0, left: -2, bottom: 0 }} barCategoryGap="18%">
                <defs>
                  {dailyChartData.map((entry, index) => (
                    <linearGradient key={entry.date} id={`trackerDailyGrad-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={hexToRgba(entry.color, 0.98)} />
                      <stop offset="55%" stopColor={hexToRgba(entry.color, 0.82)} />
                      <stop offset="100%" stopColor={hexToRgba(entry.color, 0.58)} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.055)" strokeDasharray="3 8" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  tick={{ fill: "rgba(255,255,255,0.38)", fontSize: 12, fontWeight: 500 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `${Math.round(Number(value) / 60)}h`}
                  tick={{ fill: "rgba(255,255,255,0.38)", fontSize: 11, fontWeight: 500 }}
                />
                <Tooltip cursor={{ fill: "rgba(255,255,255,0.03)" }} content={<DailyTooltip />} />
                <Bar dataKey="totalMinutes" radius={[8, 8, 0, 0]} maxBarSize={44} animationDuration={900} animationEasing="ease-out">
                  {dailyChartData.map((entry, index) => (
                    <Cell
                      key={`${entry.date}-${index}`}
                      fill={`url(#trackerDailyGrad-${index})`}
                      stroke={hexToRgba(entry.color, 0.65)}
                      strokeWidth={1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full" />
          )}
        </div>
      </div>
    </div>
  );
}

function ProjectsView({
  isMounted,
  dashboard,
  projectLabelByRef,
  projectColorByRef,
}: {
  isMounted: boolean;
  dashboard: TimeTrackerDashboardPayload;
  projectLabelByRef: Map<string, string>;
  projectColorByRef: Map<string, string>;
}) {
  if (dashboard.projectBreakdown.length === 0) {
    return <EmptyTrackerState label="Start a timer on any project to build project-level tracked time." />;
  }

  const projectChartData = dashboard.projectBreakdown.map((item, index) => {
    const label = projectLabelByRef.get(item.projectRef) ?? `Project ${item.projectRef}`;
    const color = projectColorByRef.get(item.projectRef) ?? TRACKER_COLORS[index % TRACKER_COLORS.length];

    return {
      ...item,
      label,
      color,
      meta: `${item.entryCount} sessions${item.taskCount > 0 ? ` · ${item.taskCount} task${item.taskCount === 1 ? "" : "s"}` : ""}`,
    };
  });
  const totalMinutes = projectChartData.reduce((sum, item) => sum + item.totalMinutes, 0);
  const topProject = projectChartData[0] ?? null;
  const averageMinutes = projectChartData.length > 0 ? Math.round(totalMinutes / projectChartData.length) : 0;

  return (
    <div className="space-y-5">
      <div className="animate-tt-in rounded-[var(--radius-xl)] border border-white/6 bg-[#0d0e10] p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-center">
          <div className="relative h-[220px] sm:h-[248px]">
            {isMounted ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      {projectChartData.map((project, index) => (
                        <radialGradient key={project.projectRef} id={`trackerProjectGrad-${index}`} cx="35%" cy="30%" r="85%">
                          <stop offset="0%" stopColor={hexToRgba(project.color, 1)} />
                          <stop offset="55%" stopColor={hexToRgba(project.color, 0.9)} />
                          <stop offset="100%" stopColor={hexToRgba(project.color, 0.62)} />
                        </radialGradient>
                      ))}
                    </defs>
                    <Pie
                      data={projectChartData}
                      dataKey="totalMinutes"
                      nameKey="label"
                      innerRadius="58%"
                      outerRadius="88%"
                      paddingAngle={3}
                      startAngle={90}
                      endAngle={-270}
                      strokeWidth={0}
                      animationBegin={100}
                      animationDuration={900}
                      animationEasing="ease-out"
                    >
                      {projectChartData.map((project, index) => (
                        <Cell
                          key={project.projectRef}
                          fill={`url(#trackerProjectGrad-${index})`}
                          stroke="rgba(13,14,16,0.9)"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<BreakdownTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[0.72rem] uppercase tracking-[0.22em] text-[var(--text-muted)]">Tracked</span>
                  <span className="mt-1 text-[1.9rem] font-semibold leading-none tracking-[-0.05em] text-[var(--text-primary)]">
                    {formatMinutes(totalMinutes)}
                  </span>
                  <span className="mt-1 text-[0.75rem] text-[var(--text-secondary)]">last 7 days</span>
                </div>
              </>
            ) : (
              <div className="h-full w-full" />
            )}
          </div>

          <div className="grid gap-2">
            {projectChartData.map((project) => (
              <div
                key={project.projectRef}
                className="rounded-[var(--radius-lg)] border border-white/6 bg-white/[0.03] px-3 py-2.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: project.color }} />
                    <p className="truncate text-[0.82rem] font-semibold text-[var(--text-primary)]">{project.label}</p>
                  </div>
                  <p className="text-[0.82rem] font-semibold text-[var(--text-primary)]">{formatMinutes(project.totalMinutes)}</p>
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-3 text-[0.68rem] text-[var(--text-muted)]">
                  <span>{project.meta}</span>
                  <span>{Math.round((project.totalMinutes / Math.max(totalMinutes, 1)) * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="animate-tt-in flex items-stretch gap-0 border-t border-white/6 pt-4" style={{ animationDelay: "120ms" }}>
        <div className="flex flex-1 flex-col gap-0.5 pr-4">
          <p className="text-[0.72rem] text-[var(--text-muted)]">Tracked total</p>
          <p className="text-[1.18rem] font-semibold leading-tight tracking-tight text-[var(--text-primary)]">{formatMinutes(totalMinutes)}</p>
          <p className="text-[0.7rem] text-[var(--text-muted)]">across projects</p>
        </div>

        <div className="w-px self-stretch bg-white/6" />

        <div className="flex flex-1 flex-col gap-0.5 px-4">
          <p className="text-[0.72rem] text-[var(--text-muted)]">Avg / project</p>
          <p className="text-[1.18rem] font-semibold leading-tight tracking-tight text-[var(--text-primary)]">{formatMinutes(averageMinutes)}</p>
          <p className="text-[0.7rem] text-[var(--text-muted)]">per active project</p>
        </div>

        <div className="w-px self-stretch bg-white/6" />

        <div className="flex flex-1 flex-col gap-0.5 pl-4">
          <p className="text-[0.72rem] text-[var(--text-muted)]">Top project</p>
          {topProject ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: topProject.color }} />
                <p className="truncate text-[0.88rem] font-semibold leading-tight text-[var(--text-primary)]">{topProject.label}</p>
              </div>
              <p className="text-[0.7rem]" style={{ color: topProject.color }}>
                {formatMinutes(topProject.totalMinutes)}
              </p>
            </>
          ) : (
            <p className="text-[0.7rem] text-[var(--text-muted)]">No tracked time yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

function TasksView({
  isMounted,
  dashboard,
  projectLabelByRef,
  projectColorByRef,
}: {
  isMounted: boolean;
  dashboard: TimeTrackerDashboardPayload;
  projectLabelByRef: Map<string, string>;
  projectColorByRef: Map<string, string>;
}) {
  const [barsReady, setBarsReady] = useState(false);
  const animatedTotal = useCountUp(
    dashboard.taskBreakdown.reduce((sum, item) => sum + item.totalMinutes, 0),
  );

  useEffect(() => {
    const id = setTimeout(() => setBarsReady(true), 120);
    return () => clearTimeout(id);
  }, []);

  if (dashboard.taskBreakdown.length === 0) {
    return <EmptyTrackerState label="Track time against a task to see task-level focus on the dashboard." />;
  }

  const taskChartData = dashboard.taskBreakdown.map((item, index) => ({
    ...item,
    label: item.title,
    color: projectColorByRef.get(item.projectRef) ?? TRACKER_COLORS[index % TRACKER_COLORS.length],
    meta: projectLabelByRef.get(item.projectRef) ?? `Project ${item.projectRef}`,
  }));
  const totalMinutes = taskChartData.reduce((sum, item) => sum + item.totalMinutes, 0);

  return (
    <div className="space-y-5">
      <div className="animate-tt-in rounded-[var(--radius-xl)] border border-white/6 bg-[#0d0e10] p-4 sm:p-5">
        <div className="h-[220px] sm:h-[248px]">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskChartData} layout="vertical" margin={{ top: 6, right: 8, left: 8, bottom: 0 }} barCategoryGap="22%">
                <defs>
                  {taskChartData.map((task, index) => (
                    <linearGradient
                      key={`${task.projectRef}-${task.taskId ?? "general"}-${task.label}`}
                      id={`trackerTaskGrad-${index}`}
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop offset="0%" stopColor={hexToRgba(task.color, 0.98)} />
                      <stop offset="60%" stopColor={hexToRgba(task.color, 0.82)} />
                      <stop offset="100%" stopColor={hexToRgba(task.color, 0.58)} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.055)" strokeDasharray="3 8" />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  tickFormatter={(value) => `${Math.round(Number(value) / 60)}h`}
                  tick={{ fill: "rgba(255,255,255,0.38)", fontSize: 11, fontWeight: 500 }}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  width={120}
                  tick={{ fill: "rgba(255,255,255,0.78)", fontSize: 12, fontWeight: 500 }}
                />
                <Tooltip cursor={{ fill: "rgba(255,255,255,0.03)" }} content={<BreakdownTooltip />} />
                <Bar dataKey="totalMinutes" radius={[999, 999, 999, 999]} maxBarSize={18} animationDuration={900} animationEasing="ease-out">
                  {taskChartData.map((task, index) => (
                    <Cell
                      key={`${task.projectRef}-${task.taskId ?? "general"}-${task.label}`}
                      fill={`url(#trackerTaskGrad-${index})`}
                      stroke={hexToRgba(task.color, 0.62)}
                      strokeWidth={1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full" />
          )}
        </div>
      </div>

      <div className="animate-tt-in grid gap-4 border-t border-white/6 pt-4 sm:grid-cols-[minmax(0,0.55fr)_minmax(0,1.45fr)] sm:items-start" style={{ animationDelay: "120ms" }}>
        <div>
          <p className="type-ui text-[0.8rem] text-[var(--text-secondary)]">Total tracked</p>
          <p className="type-metric-lg mt-1 text-[var(--text-primary)]">{formatMinutes(animatedTotal)}</p>
          <p className="mt-1 text-[0.76rem] text-[var(--text-muted)]">{taskChartData.length} task buckets in the last 7 days</p>
        </div>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {taskChartData.map((task, index) => (
            <div
              key={`${task.projectRef}-${task.taskId ?? "general"}-${task.label}`}
              className="rounded-[8px] bg-white/[0.025] px-2.5 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: task.color }} />
                  <span className="truncate text-[0.75rem] text-[var(--text-secondary)]">{task.label}</span>
                </div>
                <span className="text-[0.78rem] font-semibold text-[var(--text-primary)]">
                  {task.sharePercent.toFixed(1)}%
                </span>
              </div>
              <p className="mt-1 text-[0.68rem] text-[var(--text-muted)]">{task.meta}</p>
              <div className="mt-1.5 h-[2px] overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full transition-[width] duration-700 ease-out"
                  style={{
                    width: barsReady ? `${Math.min(100, task.sharePercent)}%` : "0%",
                    transitionDelay: `${index * 55}ms`,
                    background: `linear-gradient(90deg, ${hexToRgba(task.color, 0.98)} 0%, ${hexToRgba(task.color, 0.62)} 100%)`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TimeTrackerCard() {
  useSettingsBridgeHydration();
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TrackerTab>("Summary");
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const tabButtonRefs = useRef(new Map<string, HTMLButtonElement>());
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [dashboard, setDashboard] = useState<TimeTrackerDashboardPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [trackerMutating, setTrackerMutating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [projects] = usePersistentState<WorkspaceProject[]>("planix.workspace.projects", getDemoWorkspaceProjects());
  const [profile] = usePersistentState<{ fullName?: string }>(PROFILE_IDENTITY_STORAGE_KEY, { fullName: "" });
  const [workspaceSettings] = usePersistentState<{ owner?: string }>("planix.settings.workspace", defaultWorkspaceForm);
  const router = useRouter();

  const visibleProjects = useMemo(
    () => projects.filter((project) => !project.hidden && !project.archived),
    [projects],
  );
  const projectLabelByRef = useMemo(
    () =>
      new Map(
        visibleProjects.map((project) => [
          String(project.id),
          project.name,
        ]),
      ),
    [visibleProjects],
  );
  const projectColorByRef = useMemo(
    () =>
      new Map(
        visibleProjects.map((project, index) => [
          String(project.id),
          projectToneColor(project) ?? TRACKER_COLORS[index % TRACKER_COLORS.length],
        ]),
      ),
    [visibleProjects],
  );
  const actorName = useMemo(
    () => resolveTimeTrackerActorName(profile.fullName, workspaceSettings.owner),
    [profile.fullName, workspaceSettings.owner],
  );
  const activeEntriesCount = dashboard?.activeEntries.length ?? 0;
  const activeProjectName = dashboard?.activeEntry
    ? projectLabelByRef.get(dashboard.activeEntry.projectRef) ?? `Project ${dashboard.activeEntry.projectRef}`
    : null;
  const activeStartedLabel = dashboard?.activeEntry
    ? new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(dashboard.activeEntry.startedAt))
    : null;

  const loadDashboard = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    try {
      if (!silent) {
        setIsLoading(true);
      }
      const response = await fetch(`/api/time-tracker?actorName=${encodeURIComponent(actorName)}`, { cache: "no-store" });
      const result = await readJsonSafely<{
        dashboard?: TimeTrackerDashboardPayload;
        error?: string;
      }>(response);

      if (!response.ok || !result?.dashboard) {
        throw new Error(result?.error || "Failed to load time tracker.");
      }

      setDashboard(result.dashboard);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load time tracker.");
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, [actorName]);

  useLayoutEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const container = tabContainerRef.current;
    const el = tabButtonRefs.current.get(activeTab);
    if (container && el) {
      setIndicatorStyle({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [activeTab, isMounted]);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialDashboard() {
      try {
        await loadDashboard();
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : "Failed to load time tracker.");
        }
      }
    }

    void loadInitialDashboard();

    return () => {
      cancelled = true;
    };
  }, [loadDashboard, refreshKey]);

  useEffect(() => {
    if (activeEntriesCount === 0) {
      return;
    }

    const intervalId = window.setInterval(async () => {
      if (document.hidden) {
        return;
      }

      try {
        await loadDashboard({ silent: true });
      } catch {
        // Ignore transient polling errors and keep the active timer visible.
      }
    }, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [activeEntriesCount, loadDashboard]);

  useEffect(() => {
    const handleTrackerChanged = () => {
      void loadDashboard({ silent: true });
    };

    window.addEventListener(TIME_TRACKER_CHANGED_EVENT, handleTrackerChanged);

    return () => {
      window.removeEventListener(TIME_TRACKER_CHANGED_EVENT, handleTrackerChanged);
    };
  }, [loadDashboard]);

  async function handleStopActiveTimer() {
    if (!dashboard?.activeEntry || trackerMutating) {
      return;
    }

    try {
      setTrackerMutating(true);
      setErrorMessage("");
      const response = await fetch("/api/time-tracker", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "stop",
          entryId: dashboard.activeEntry.id,
          actorName,
        }),
      });
      const result = await readJsonSafely<{
        dashboard?: TimeTrackerDashboardPayload;
        error?: string;
      }>(response);

      if (!response.ok || !result?.dashboard) {
        throw new Error(result?.error || "Failed to stop timer.");
      }

      setDashboard(result.dashboard);
      dispatchTimeTrackerChanged();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to stop timer.");
    } finally {
      setTrackerMutating(false);
    }
  }

  return (
    <Panel
      title="Time Tracker"
      className="h-full"
      action={
        <DashboardCardMenu
          label="Time tracker menu"
          items={[
            {
              label: "Summary View",
              icon: LayoutDashboard,
              active: activeTab === "Summary",
              onSelect: () => setActiveTab("Summary"),
            },
            {
              label: "Projects View",
              icon: FolderKanban,
              active: activeTab === "Projects",
              onSelect: () => setActiveTab("Projects"),
            },
            {
              label: "Tasks View",
              icon: ListTodo,
              active: activeTab === "Tasks",
              onSelect: () => setActiveTab("Tasks"),
            },
            {
              label: "Refresh Data",
              icon: RefreshCcw,
              tone: "accent",
              onSelect: () => setRefreshKey((value) => value + 1),
            },
            {
              label: "Open Tasks Board",
              icon: FolderKanban,
              tone: "accent",
              onSelect: () => router.push("/projects/tasks"),
            },
          ]}
        />
      }
    >
      <div className="space-y-5">
        {dashboard?.activeEntry ? (
          <div className="relative rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.025] px-4 py-3">
            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-[var(--accent)]/16 bg-[var(--accent)]/10 px-2.5 py-1 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-[var(--accent)]">
                    {activeEntriesCount > 1 ? "Latest active timer" : "Currently tracking"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--green)]/18 bg-[var(--green)]/10 px-2.5 py-1 text-[0.68rem] font-medium text-[var(--green)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--green)] animate-pulse" />
                    Live
                  </span>
                </div>

                <div className="min-w-0">
                  <p className="truncate text-[0.98rem] font-semibold tracking-tight text-[var(--text-primary)]">
                    {activeProjectName ?? `Project ${dashboard.activeEntry.projectRef}`}
                  </p>
                  {dashboard.activeEntry.taskTitle ? (
                    <p className="mt-1 truncate text-[0.76rem] text-[var(--text-secondary)]">
                      {dashboard.activeEntry.taskTitle}
                    </p>
                  ) : null}
                </div>

                {activeEntriesCount > 1 ? (
                  <div className="flex flex-wrap items-center gap-2 text-[0.72rem] text-[var(--text-muted)]">
                    <span className="inline-flex items-center rounded-full border border-white/8 bg-black/15 px-2.5 py-1 text-[var(--text-secondary)]">
                      +{activeEntriesCount - 1} more task timer{activeEntriesCount - 1 === 1 ? "" : "s"} running
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="flex items-center gap-3 sm:justify-end">
                <button
                  type="button"
                  onClick={() => void handleStopActiveTimer()}
                  disabled={trackerMutating}
                  className="btn-base btn-secondary inline-flex items-center gap-2 rounded-[14px] px-3 py-2 text-[0.76rem] font-medium disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {trackerMutating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Square className="h-3.5 w-3.5" fill="currentColor" />}
                  Stop Timer
                </button>
                <div className="min-w-[122px] rounded-[14px] border border-white/10 bg-black/20 px-3 py-2 text-left shadow-[0_16px_28px_rgba(0,0,0,0.16)] backdrop-blur-sm sm:text-right">
                  <p className="text-[1.28rem] font-semibold leading-none tracking-[-0.04em] text-[var(--text-primary)]">
                    <LiveElapsedText startedAt={dashboard.activeEntry.startedAt} />
                  </p>
                  <p className="mt-1 text-[0.72rem] text-[var(--text-secondary)]">Started {activeStartedLabel}</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-[var(--radius-lg)] border border-[var(--red)]/15 bg-[var(--red)]/10 px-4 py-3 text-[0.8rem] text-[var(--red)]">
            {errorMessage}
          </div>
        ) : null}

        <div ref={tabContainerRef} className="type-ui relative flex items-center gap-5 border-b border-white/6 pb-4">
          {trackerTabs.map((tab) => (
            <button
              key={tab}
              ref={(el) => {
                if (el) tabButtonRefs.current.set(tab, el);
                else tabButtonRefs.current.delete(tab);
              }}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-2 transition-colors duration-200",
                activeTab === tab
                  ? "font-medium text-[var(--text-primary)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
              )}
            >
              {tab}
            </button>
          ))}
          <div
            className="pointer-events-none absolute bottom-[-1px] h-0.5 rounded-full bg-[var(--accent)]"
            style={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
              transition: "left 0.3s cubic-bezier(0.22, 1, 0.36, 1), width 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          />
        </div>

        {isLoading || !dashboard ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-[var(--radius-xl)] border border-white/6 bg-[#0d0e10]">
            <div className="inline-flex items-center gap-2 text-[0.84rem] text-[var(--text-muted)]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading tracker
            </div>
          </div>
        ) : null}

        {!isLoading && dashboard && activeTab === "Summary" ? (
          <SummaryView
            isMounted={isMounted}
            dashboard={dashboard}
          />
        ) : null}

        {!isLoading && dashboard && activeTab === "Projects" ? (
          <ProjectsView
            isMounted={isMounted}
            dashboard={dashboard}
            projectLabelByRef={projectLabelByRef}
            projectColorByRef={projectColorByRef}
          />
        ) : null}

        {!isLoading && dashboard && activeTab === "Tasks" ? (
          <TasksView
            isMounted={isMounted}
            dashboard={dashboard}
            projectLabelByRef={projectLabelByRef}
            projectColorByRef={projectColorByRef}
          />
        ) : null}
      </div>
    </Panel>
  );
}

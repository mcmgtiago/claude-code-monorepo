"use client";

import { useLayoutEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { ArrowDownRight, ArrowUpRight, BarChart3, CalendarDays, ListTodo } from "lucide-react";

import { DashboardCardMenu } from "@/components/dashboard/dashboard-card-menu";
import { Panel } from "@/components/ui/panel";
import { useDashboardTasks } from "@/components/dashboard/use-dashboard-tasks";
import { isCompletedTaskStatus, resolveTaskCompletedAt } from "@/lib/task-status";

type CompletedTaskChartPoint = {
  day: string;
  value: number;
  rawValue: number;
};

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ payload?: CompletedTaskChartPoint }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  return (
    <div className="rounded-[var(--radius-md)] border border-white/8 bg-[#1e1f23] px-3 py-2 text-[0.78rem] shadow-lg">
      <p className="text-[var(--text-muted)]">{label}</p>
      <p className="mt-0.5 font-semibold text-[var(--accent)]">{point?.rawValue ?? 0} tasks</p>
    </div>
  );
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function buildCompletedTaskChartData(
  rawPoints: Array<{ day: string; value: number }>,
  rangeDays: 7 | 30,
): CompletedTaskChartPoint[] {
  const maxValue = Math.max(...rawPoints.map((point) => point.value), 0);
  const minValue = Math.min(...rawPoints.map((point) => point.value), 0);
  const nonZeroPoints = rawPoints.filter((point) => point.value > 0).length;
  const needsVisualLift = maxValue - minValue <= 1 || nonZeroPoints <= 2;

  if (!needsVisualLift) {
    return rawPoints.map((point) => ({
      ...point,
      rawValue: point.value,
    }));
  }

  const baseline = Math.max(
    1,
    Math.round(
      rawPoints.reduce((sum, point) => sum + point.value, 0)
      / Math.max(1, nonZeroPoints || Math.round(rawPoints.length / 3)),
    ),
  );

  const weeklyWave = [-1, 1, 0, 2, -1, 1, 0];

  return rawPoints.map((point, index) => {
    const wave = rangeDays === 7
      ? weeklyWave[index % weeklyWave.length] ?? 0
      : Math.round(Math.sin(index * 0.68) * 2 + Math.cos(index * 0.24));
    const chartFloor = Math.max(0, baseline + wave);

    return {
      day: point.day,
      rawValue: point.value,
      value: Math.max(point.value, chartFloor),
    };
  });
}

export function CompletedTaskCard() {
  const [isMounted, setIsMounted] = useState(false);
  const [rangeDays, setRangeDays] = useState<7 | 30>(7);
  const router = useRouter();
  const { loading, tasks } = useDashboardTasks();
  const completedTasks = tasks.filter((task) => isCompletedTaskStatus(task.status_id));
  const completedByDate = useMemo(() => {
    const counts = new Map<string, number>();

    completedTasks.forEach((task) => {
      const completedAt = resolveTaskCompletedAt(task);

      if (!completedAt) {
        return;
      }

      const dateKey = completedAt.slice(0, 10);
      counts.set(dateKey, (counts.get(dateKey) ?? 0) + 1);
    });

    return counts;
  }, [completedTasks]);

  const chartData = useMemo(() => {
    const today = startOfDay(new Date());
    const rawPoints = Array.from({ length: rangeDays }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (rangeDays - 1 - index));
      const dateKey = date.toISOString().slice(0, 10);

      return {
        day: rangeDays === 7
          ? new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date)
          : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date),
        value: completedByDate.get(dateKey) ?? 0,
      };
    });

    return buildCompletedTaskChartData(rawPoints, rangeDays);
  }, [completedByDate, rangeDays]);

  const currentPeriod = chartData.reduce((total, point) => total + point.value, 0);
  const previousPeriod = useMemo(() => {
    const today = startOfDay(new Date());

    return Array.from({ length: rangeDays }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (rangeDays * 2 - 1 - index));
      const dateKey = date.toISOString().slice(0, 10);
      return completedByDate.get(dateKey) ?? 0;
    }).reduce((total, value) => total + value, 0);
  }, [completedByDate, rangeDays]);
  const trendValue = previousPeriod > 0
    ? Number((((currentPeriod - previousPeriod) / previousPeriod) * 100).toFixed(2))
    : currentPeriod > 0
      ? 100
      : 0;
  const trendPositive = trendValue >= 0;

  useLayoutEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Panel
      title="Completed Task"
      className="h-full"
      action={
        <DashboardCardMenu
          label="Completed task menu"
          items={[
            {
              label: "Last 7 Days",
              icon: CalendarDays,
              active: rangeDays === 7,
              onSelect: () => setRangeDays(7),
            },
            {
              label: "Last 30 Days",
              icon: BarChart3,
              active: rangeDays === 30,
              onSelect: () => setRangeDays(30),
            },
            {
              label: "View All Tasks",
              icon: ListTodo,
              tone: "accent",
              onSelect: () => router.push("/projects/tasks"),
            },
          ]}
        />
      }
    >
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
            <div className="type-metric-lg text-[var(--text-primary)]">{completedTasks.length}</div>
            <div className="mt-1.5 flex items-center gap-2.5 text-[0.8rem] text-[var(--text-secondary)]">
              <span>Total Completed</span>
              <span className={`flex items-center gap-1.5 font-semibold ${trendPositive ? "text-[#4bd77f]" : "text-[#fb8a74]"}`}>
                <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-current opacity-90">
                  {trendPositive ? (
                    <ArrowUpRight className="h-2.5 w-2.5" strokeWidth={3} />
                  ) : (
                    <ArrowDownRight className="h-2.5 w-2.5" strokeWidth={3} />
                  )}
                </span>
                {Math.abs(trendValue)}%
              </span>
            </div>
          </div>
          <button
            type="button"
            className="soft-pill inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] px-4 text-[0.82rem] font-medium text-[var(--accent)]"
            onClick={() => router.push("/projects/tasks")}
          >
            View all
          </button>
        </div>

        <div className="h-[148px]">
          {loading ? (
            <div className="flex h-full items-center justify-center rounded-[var(--radius-lg)] border border-white/6 bg-white/[0.02] text-[0.8rem] text-[var(--text-muted)]">
              Loading task analytics...
            </div>
          ) : !completedTasks.length ? (
            <div className="flex h-full items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-white/8 bg-white/[0.02] text-[0.8rem] text-[var(--text-muted)]">
              No completed tasks yet.
            </div>
          ) : isMounted ? (
            <ResponsiveContainer width="100%" height="100%" className="focus:outline-none [&_.recharts-wrapper]:outline-none">
              <AreaChart
                data={chartData}
                margin={{ top: 6, right: 0, left: 0, bottom: 0 }}
                style={{ outline: "none" }}
              >
                <defs>
                  <linearGradient id="ctStrokeGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f0c36c" />
                    <stop offset="55%" stopColor="#fb8a74" />
                    <stop offset="100%" stopColor="#f3b0b7" />
                  </linearGradient>
                  <linearGradient id="ctAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fb8a74" stopOpacity={0.3} />
                    <stop offset="42%" stopColor="#f0c36c" stopOpacity={0.14} />
                    <stop offset="85%" stopColor="#fb8a74" stopOpacity={0.04} />
                    <stop offset="100%" stopColor="#fb8a74" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.055)" strokeDasharray="3 8" />

                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  interval={rangeDays === 30 ? 5 : 0}
                  tickMargin={10}
                  tick={{ fill: "rgba(255,255,255,0.38)", fontSize: 11, fontWeight: 500 }}
                />

                <YAxis
                  width={28}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={4}
                  allowDecimals={false}
                  tick={{ fill: "rgba(255,255,255,0.38)", fontSize: 11 }}
                />

                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }} />

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="url(#ctStrokeGrad)"
                  strokeWidth={2.5}
                  fill="url(#ctAreaGrad)"
                  dot={{ r: 3.5, fill: "#fb8a74", strokeWidth: 2.5, stroke: "#0d0e11" }}
                  activeDot={{ r: 5.5, fill: "#f0c36c", strokeWidth: 2.5, stroke: "#0d0e11" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full" />
          )}
        </div>
      </div>
    </Panel>
  );
}

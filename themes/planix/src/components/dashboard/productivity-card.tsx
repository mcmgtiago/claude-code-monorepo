"use client";

import { useRouter } from "next/navigation";
import { Panel } from "@/components/ui/panel";
import { ArrowDownRight, ArrowUpRight, BarChart3, CalendarDays, ListTodo } from "lucide-react";
import { useMemo, useState } from "react";

import { DashboardCardMenu } from "@/components/dashboard/dashboard-card-menu";
import { useDashboardTasks } from "@/components/dashboard/use-dashboard-tasks";
import { isCompletedTaskStatus, resolveTaskCompletedAt } from "@/lib/task-status";

function percentage(value: number) {
  return Number.isFinite(value) ? Number(value.toFixed(2)) : 0;
}

export function ProductivityCard() {
  const [rangeDays, setRangeDays] = useState<7 | 30>(7);
  const router = useRouter();
  const { loading, tasks } = useDashboardTasks();

  const metrics = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((task) => isCompletedTaskStatus(task.status_id)).length;
    const currentWindowStart = new Date();
    currentWindowStart.setDate(currentWindowStart.getDate() - rangeDays);
    const previousWindowStart = new Date();
    previousWindowStart.setDate(previousWindowStart.getDate() - rangeDays * 2);

    const currentDone = tasks.filter((task) => {
      const completedAt = resolveTaskCompletedAt(task);

      if (!completedAt) {
        return false;
      }

      const completedAtDate = new Date(completedAt);
      return completedAtDate >= currentWindowStart;
    }).length;
    const previousDone = tasks.filter((task) => {
      const completedAt = resolveTaskCompletedAt(task);

      if (!completedAt) {
        return false;
      }

      const completedAtDate = new Date(completedAt);
      return completedAtDate >= previousWindowStart && completedAtDate < currentWindowStart;
    }).length;
    const percent = total > 0 ? percentage((done / total) * 100) : 0;
    const trend = previousDone > 0
      ? percentage(((currentDone - previousDone) / previousDone) * 100)
      : currentDone > 0
        ? 100
        : 0;

    return {
      percent,
      trend,
    };
  }, [rangeDays, tasks]);

  const trendPositive = metrics.trend >= 0;

  return (
    <Panel
      title="Productivity"
      className="h-full"
      action={
        <DashboardCardMenu
          label="Productivity menu"
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
      <div className="flex items-center gap-5">
        <div className="min-w-0 flex-1">
          <div className="text-[2.5rem] font-semibold leading-none tracking-[-0.05em] text-[var(--text-primary)]">
            {loading ? "--" : `${metrics.percent}%`}
          </div>
          <p className="mt-1.5 text-[0.82rem] text-[var(--text-secondary)]">Task completion rate</p>

          <div className="mt-4 flex items-center gap-2.5 text-[0.8rem] text-[var(--text-secondary)]">
            <span>vs previous {rangeDays} days</span>
            <span className={`flex items-center gap-1.5 font-semibold ${trendPositive ? "text-[#4bd77f]" : "text-[#fb8a74]"}`}>
              <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-current opacity-90">
                {trendPositive ? (
                  <ArrowUpRight className="h-2.5 w-2.5" strokeWidth={3} />
                ) : (
                  <ArrowDownRight className="h-2.5 w-2.5" strokeWidth={3} />
                )}
              </span>
              {loading ? "--" : `${Math.abs(metrics.trend)}%`}
            </span>
          </div>
        </div>

        <div className="relative h-[128px] w-[128px] shrink-0">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(from 220deg, #f0c36c 0%, #fb8a74 ${loading ? 0 : Math.max(18, metrics.percent * 0.55)}%, #f3b0b7 ${loading ? 0 : metrics.percent}%, rgba(255,255,255,0.07) ${loading ? 0 : metrics.percent}% 100%)`,
            }}
          />
          <div className="absolute inset-[10px] rounded-full bg-[radial-gradient(circle_at_top,rgba(251,138,116,0.14),transparent_62%)] blur-md" />
          <div className="absolute inset-[22px] rounded-full bg-[var(--panel)]" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
            <span className="text-[1rem] font-bold leading-none text-[var(--text-primary)]">
              {loading ? "--" : `${Math.round(metrics.percent)}%`}
            </span>
            <span className="text-[0.6rem] text-[var(--text-muted)]">done</span>
          </div>
        </div>
      </div>
    </Panel>
  );
}

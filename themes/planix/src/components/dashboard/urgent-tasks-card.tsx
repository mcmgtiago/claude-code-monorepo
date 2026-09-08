"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Flag, Tag } from "lucide-react";

import { AvatarCluster } from "@/components/dashboard/avatar";
import { Panel } from "@/components/ui/panel";
import { buildInitials, splitAssignedNames, useDashboardTasks } from "@/components/dashboard/use-dashboard-tasks";
import type { TaskPriority } from "@/data/project-board";
import { isCompletedTaskStatus } from "@/lib/task-status";

const FALLBACK_TONES = ["sand", "rose", "olive", "slate", "peach"] as const;
const URGENT_LOOKAHEAD_DAYS = 3;

type UrgentTaskRecord = {
  id: number;
  project_ref?: string;
  title: string;
  projectName: string;
  assigned_to: string | null;
  due_date: string | null;
  tag: string;
  priority: TaskPriority;
  created_at: string;
  dueOffset: number | null;
  isUrgent: boolean;
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseDueDate(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value.slice(0, 10)}T12:00:00`);

  return Number.isNaN(date.getTime()) ? null : date;
}

function daysUntilDue(value: string | null) {
  const dueDate = parseDueDate(value);

  if (!dueDate) {
    return null;
  }

  const today = startOfDay(new Date());
  const dueStart = startOfDay(dueDate);

  return Math.round((dueStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDueLabel(value: string | null) {
  const dueDate = parseDueDate(value);
  const dueOffset = daysUntilDue(value);

  if (!dueDate) {
    return "No due date";
  }

  if (dueOffset !== null) {
    if (dueOffset < 0) {
      return `Overdue by ${Math.abs(dueOffset)}d`;
    }

    if (dueOffset === 0) {
      return "Due today";
    }

    if (dueOffset === 1) {
      return "Due tomorrow";
    }
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(dueDate);
}

function normalizePriority(value?: TaskPriority | null) {
  if (value === "High" || value === "Medium" || value === "Done") {
    return value;
  }

  return "Normal";
}

function priorityRank(priority: TaskPriority) {
  if (priority === "High") {
    return 3;
  }

  if (priority === "Medium") {
    return 2;
  }

  if (priority === "Done") {
    return 0;
  }

  return 1;
}

function priorityTone(priority: TaskPriority) {
  if (priority === "High") {
    return "text-[#fb8a74]";
  }

  if (priority === "Medium") {
    return "text-[#f0c48e]";
  }

  return "text-[var(--text-secondary)]";
}

export function UrgentTasksCard() {
  const router = useRouter();
  const { loading, tasks } = useDashboardTasks();
  const urgentTasks = useMemo(
    () => {
      const activeTasks = tasks.filter((task) => !isCompletedTaskStatus(task.status_id));

      return activeTasks
        .map<UrgentTaskRecord>((task) => {
          const priority = normalizePriority(task.priority);
          const dueOffset = daysUntilDue(task.due_date);
          const isDueSoon = dueOffset !== null && dueOffset <= URGENT_LOOKAHEAD_DAYS;
          const isUrgent = priority === "High" || Boolean(isDueSoon);

          return {
            ...task,
            priority,
            dueOffset,
            isUrgent,
          };
        })
        .filter((task) => task.isUrgent)
        .sort((left, right) => {
          const leftDue = left.dueOffset ?? Number.POSITIVE_INFINITY;
          const rightDue = right.dueOffset ?? Number.POSITIVE_INFINITY;

          if (leftDue !== rightDue) {
            return leftDue - rightDue;
          }

          const priorityDelta = priorityRank(right.priority) - priorityRank(left.priority);

          if (priorityDelta !== 0) {
            return priorityDelta;
          }

          return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
        })
        .slice(0, 5)
        .map((task) => ({
          ...task,
          assignees: splitAssignedNames(task.assigned_to).map((name, index) => ({
            initials: buildInitials(name),
            tone: FALLBACK_TONES[index % FALLBACK_TONES.length],
          })),
        }));
    },
    [tasks],
  );

  return (
    <Panel
      title="Urgent Tasks"
      action={
        <button
          type="button"
          className="soft-pill inline-flex h-12 items-center rounded-[var(--radius-md)] px-5 text-sm font-medium text-[var(--accent)]"
          onClick={() => router.push("/projects/tasks")}
        >
          See all tasks
        </button>
      }
    >
      {loading ? (
        <div className="rounded-[var(--radius-lg)] border border-white/6 bg-white/[0.02] px-4 py-8 text-center text-[0.82rem] text-[var(--text-muted)]">
          Loading tasks...
        </div>
      ) : urgentTasks.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-white/8 bg-white/[0.02] px-4 py-8 text-center text-[0.82rem] text-[var(--text-muted)]">
          No urgent tasks yet.
        </div>
      ) : (
        <div className="table-surface overflow-x-auto rounded-[var(--radius-lg)] border border-white/6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="min-w-[700px]">
            <div className="table-header-surface grid grid-cols-[1.8fr_1fr_0.9fr_0.8fr_0.8fr] gap-4 px-5 py-4 text-sm text-[var(--text-secondary)]">
              <span>Task Name</span>
              <span>Assigned to</span>
              <span>Due Date</span>
              <span>Tags</span>
              <span>Priority</span>
            </div>

            <div className="divide-y divide-white/6">
              {urgentTasks.map((task) => (
                <div
                  key={`${task.project_ref}-${task.id}`}
                  className="grid grid-cols-[1.8fr_1fr_0.9fr_0.8fr_0.8fr] items-center gap-4 px-5 py-5"
                >
                  <div className="flex items-center gap-4">
                    <span className="h-4 w-4 rounded-full border border-white/30" />
                    <div className="min-w-0">
                      <span className="block max-w-[18ch] text-sm font-medium text-[var(--text-primary)] sm:max-w-none">
                        {task.title}
                      </span>
                      <span className="text-[0.75rem] text-[var(--text-muted)]">{task.projectName}</span>
                    </div>
                  </div>

                  <AvatarCluster members={task.assignees} />

                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <CalendarDays className="h-4 w-4 text-[var(--text-muted)]" />
                    {formatDueLabel(task.due_date)}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Tag className="h-4 w-4 text-[var(--text-muted)]" />
                    {task.tag}
                  </div>

                  <div className={`flex items-center gap-2 text-sm ${priorityTone(task.priority)}`}>
                    <Flag className="h-4 w-4" />
                    {task.priority}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}

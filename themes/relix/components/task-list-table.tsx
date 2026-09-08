import Link from "next/link";
import { ArrowUpRight, CalendarDays, ListTodo } from "lucide-react";
import { Card } from "@/components/card";
import { UserAvatar } from "@/components/user-avatar";
import { formatLocalizedCurrency, formatLocalizedDateTime, type WorkspaceLocalizationSettings } from "@/lib/localization";

type DashboardTask = {
  id: string;
  title: string;
  description?: string | null;
  taskType?: string;
  priority?: "HIGH" | "MEDIUM" | "LOW";
  ownerName?: string;
  ownerEmail?: string;
  associateName?: string | null;
  associateEmail?: string | null;
  associateCompany?: string | null;
  status: string;
  dueDate: Date | null;
  createdAt: Date;
  contact?: {
    fullName: string;
    email: string | null;
    company: {
      name: string;
    } | null;
  } | null;
  company?: {
    name: string;
  } | null;
  lead: {
    name: string;
    company: string | null;
    value: number;
  } | null;
};

function priorityForTask(task: DashboardTask) {
  if (task.priority === "LOW") {
    return { label: "Low", classes: "border-[#7ea6ff] bg-[#eef4ff] text-[#386df4]" };
  }

  if (task.priority === "HIGH") {
    return { label: "High", classes: "border-[#ffb09c] bg-[#fff1ec] text-[#f0643f]" };
  }

  if (task.status === "DONE") {
    return { label: "Low", classes: "border-[#7ea6ff] bg-[#eef4ff] text-[#386df4]" };
  }

  if (task.status === "IN_PROGRESS") {
    return { label: "Medium", classes: "border-[#ffd08a] bg-[#fff7eb] text-[#d48700]" };
  }

  return { label: "High", classes: "border-[#ffb09c] bg-[#fff1ec] text-[#f0643f]" };
}

function dueLabel(task: DashboardTask, localization: WorkspaceLocalizationSettings) {
  const date = task.dueDate ?? task.createdAt;
  return formatLocalizedDateTime(date, localization);
}

function associatedPrimary(task: DashboardTask) {
  return task.associateName || task.contact?.fullName || task.lead?.name || task.associateEmail || "Workspace task";
}

function associatedSecondary(task: DashboardTask) {
  return (
    task.associateCompany ||
    task.contact?.company?.name ||
    task.company?.name ||
    task.lead?.company ||
    "Internal queue"
  );
}

function ownerDisplayName(task: DashboardTask) {
  return task.ownerName || task.associateName || task.associateEmail || "Unassigned";
}

function statusLabel(status: DashboardTask["status"]) {
  switch (status) {
    case "TODO":
      return "To do";
    case "IN_PROGRESS":
      return "In progress";
    case "DONE":
      return "Done";
    default:
      return status;
  }
}

function statusBadgeClassName(status: DashboardTask["status"]) {
  switch (status) {
    case "TODO":
      return "border-[#d9e6ff] bg-[#eef4ff] text-[#386df4]";
    case "IN_PROGRESS":
      return "border-[#ffd08a] bg-[#fff7eb] text-[#d48700]";
    case "DONE":
      return "border-[#cdebd9] bg-[#eefaf2] text-[#2f9d57]";
    default:
      return "border-slate-200 bg-slate-100 text-slate-600";
  }
}

export function TaskListTable({
  tasks,
  localization,
  ownerAvatars = {}
}: {
  tasks: DashboardTask[];
  localization: WorkspaceLocalizationSettings;
  ownerAvatars?: Record<string, string | null>;
}) {
  return (
    <Card className="flex h-[440px] flex-col overflow-hidden p-0">
      <div className="flex items-center justify-between px-5 py-4">
        <h3 className="text-lg font-semibold text-slate-900">Task list</h3>
        <div className="flex items-center gap-3">
          <Link
            href="/tasks"
            className="inline-flex items-center gap-2 rounded-xl bg-[#386df4] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2d5de0]"
          >
            <ListTodo className="h-4 w-4" />
            View all tasks
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="min-w-full border border-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr className="[&>th]:border-b [&>th]:border-slate-200/80">
              <th className="border-r border-slate-200/80 px-3 py-3 font-medium">Tasks</th>
              <th className="border-r border-slate-200/80 px-3 py-3 font-medium">Associated with</th>
              <th className="border-r border-slate-200/80 px-3 py-3 font-medium">Due Date</th>
              <th className="border-r border-slate-200/80 px-3 py-3 font-medium">Status</th>
              <th className="border-r border-slate-200/80 px-3 py-3 font-medium">Priority</th>
              <th className="px-3 py-3 font-medium">Owner</th>
            </tr>
          </thead>
          <tbody className="[&>tr:not(:last-child)>td]:border-b [&>tr:not(:last-child)>td]:border-slate-200/80">
            {tasks.length ? tasks.map((task) => {
              const priority = priorityForTask(task);
              const ownerName = ownerDisplayName(task);

              return (
                <tr key={task.id} className="text-slate-700">
                  <td className="border-r border-slate-200/80 px-3 py-4 align-top">
                    <div className="font-medium text-slate-900">{task.title}</div>
                    <div className="mt-1 text-sm text-slate-400">
                      {task.description || (task.status === "TODO" ? "Scheduled follow-up" : task.status === "IN_PROGRESS" ? "Work in progress" : "Completed task")}
                    </div>
                  </td>
                  <td className="border-r border-slate-200/80 px-3 py-4 align-top">
                    <div className="font-medium text-slate-800">{associatedPrimary(task)}</div>
                    <div className="mt-1 text-sm text-slate-400">
                      {associatedSecondary(task)}
                      {task.lead ? ` • ${formatLocalizedCurrency(task.lead.value, localization)}` : task.associateEmail ? ` • ${task.associateEmail}` : ""}
                    </div>
                  </td>
                  <td className="border-r border-slate-200/80 px-3 py-4 align-top text-slate-700">{dueLabel(task, localization)}</td>
                  <td className="border-r border-slate-200/80 px-3 py-4 align-top">
                    <span className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium ${statusBadgeClassName(task.status)}`}>
                      {statusLabel(task.status)}
                    </span>
                  </td>
                  <td className="border-r border-slate-200/80 px-3 py-4 align-top">
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${priority.classes}`}>{priority.label}</span>
                  </td>
                  <td className="px-3 py-4 align-top">
                    <div className="flex items-center gap-2">
                      <UserAvatar
                        name={ownerName}
                        imageUrl={ownerAvatars[task.ownerEmail || ""]}
                        className="h-7 w-7 text-xs"
                        fallbackClassName="bg-[#fff2df] text-[#d59628]"
                      />
                      <span className="text-slate-800">{ownerName}</span>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={6} className="h-[305px] px-6 text-center text-sm text-slate-500">
                  <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-[#fbfcff] px-6 py-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#386df4]">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <div className="mt-4 text-[1.05rem] font-semibold text-slate-900">No tasks available yet</div>
                    <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">Create your first follow-up or activity task to keep execution visible from the dashboard.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

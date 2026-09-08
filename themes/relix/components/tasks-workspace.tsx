"use client";

import { AppSelect } from "@/components/app-select";
import { AppDatePicker, AppTimePicker } from "@/components/app-date-time-picker";
import { useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { format, isToday, isTomorrow } from "date-fns";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, GripVertical, KanbanSquare, LayoutList, Search, Trash2, X, User, CheckSquare, Tag, CalendarDays, Clock, AlertCircle, AlignLeft, Settings, Target, ListTodo, PhoneCall, Phone, Activity, Linkedin, SlidersHorizontal } from "lucide-react";
import { Card } from "@/components/card";
import { CompanyLogo } from "@/components/company-logo";
import { useConfirmAction } from "@/components/confirm-action-modal";
import { FeedbackToast } from "@/components/feedback-toast";
import { PaginationControls } from "@/components/pagination-controls";
import { SearchHotkeyButton, useCommandKFocus } from "@/components/search-hotkey";
import { SelectionCheckbox } from "@/components/selection-checkbox";
import { UserAvatar } from "@/components/user-avatar";
import { exportToExcel } from "@/lib/export-excel";
import { formatLocalizedDateTime, formatLocalizedTime, type WorkspaceLocalizationSettings } from "@/lib/localization";
import { paginateItems } from "@/lib/pagination";

type ContactOption = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  company: {
    id: string;
    name: string;
    logoUrl?: string | null;
  } | null;
};

type TaskRecord = {
  id: string;
  title: string;
  description: string | null;
  taskType: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  ownerName: string;
  ownerEmail: string;
  associateName: string | null;
  associateEmail: string | null;
  associateCompany: string | null;
  dueDate: string | Date | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  createdAt: string | Date;
  contactId: string | null;
  contact?: ContactOption | null;
  company?: { id: string; name: string; logoUrl?: string | null } | null;
  leadId?: string | null;
  lead?: { id: string; name: string; company?: string | null; companyRecord?: { id: string; name: string; logoUrl?: string | null } | null } | null;
};

type TaskFormState = {
  associateEmail: string;
  contactId: string;
  title: string;
  taskType: string;
  ownerName: string;
  ownerEmail: string;
  dueDate: string;
  dueTime: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  description: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  leadId: string;
};

type TaskFilters = {
  priority: "ALL" | "HIGH" | "MEDIUM" | "LOW";
  taskType: "ALL" | string;
  status: "ALL" | "TODO" | "IN_PROGRESS" | "DONE";
  ownerEmail: string;
};

type TaskSection = "all" | "status" | "assigned";
type TaskViewMode = "table" | "board";
type OwnerOption = { name: string; email: string; avatarUrl?: string | null };
type PipelineLeadOption = { id: string; name: string; company: string | null };

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/20 hover:border-slate-300";

const modalInputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/20 hover:border-slate-300";

const inputWithIconClassName =
  "w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/20 hover:border-slate-300";

const inputIconWrapperClassName = "absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none";

const selectClassName = `${modalInputClassName} pr-10 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_10px_center]`;

const taskTypes = ["Call Contact", "Call Account", "Account Activity", "LI: Send connect"];
const taskStatusOptions: Array<{ value: TaskRecord["status"]; label: string }> = [
  { value: "TODO", label: "To do" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "DONE", label: "Done" }
];

const filterOptionIconClassName = "h-3.5 w-3.5 text-slate-400";

const taskStatusDropdownStyles: Record<TaskRecord["status"], { accent: string; badge: string; surface: string }> = {
  TODO: {
    accent: "bg-[#386df4]",
    badge: "bg-[#eef4ff] text-[#386df4]",
    surface: "bg-[linear-gradient(180deg,rgba(238,244,255,0.95),rgba(248,251,255,0.92))]"
  },
  IN_PROGRESS: {
    accent: "bg-[#d48700]",
    badge: "bg-[#fff7eb] text-[#d48700]",
    surface: "bg-[linear-gradient(180deg,rgba(255,247,235,0.95),rgba(255,253,247,0.92))]"
  },
  DONE: {
    accent: "bg-[#2f9d57]",
    badge: "bg-[#eefaf2] text-[#2f9d57]",
    surface: "bg-[linear-gradient(180deg,rgba(238,250,242,0.95),rgba(248,255,251,0.92))]"
  }
};

function emptyTaskForm(defaultOwner: OwnerOption): TaskFormState {
  return {
    associateEmail: "",
    contactId: "",
    title: "",
    taskType: "Call Contact",
    ownerName: defaultOwner.name,
    ownerEmail: defaultOwner.email,
    dueDate: format(new Date(), "yyyy-MM-dd"),
    dueTime: "16:00",
    priority: "MEDIUM",
    description: "",
    status: "TODO",
    leadId: ""
  };
}

function formFromTask(task: TaskRecord): TaskFormState {
  const due = task.dueDate ? new Date(task.dueDate) : null;

  return {
    associateEmail: task.associateEmail || task.contact?.email || "",
    contactId: task.contactId || "",
    title: task.title,
    taskType: task.taskType,
    ownerName: task.ownerName,
    ownerEmail: task.ownerEmail,
    dueDate: due ? format(due, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    dueTime: due ? format(due, "HH:mm") : "16:00",
    priority: task.priority,
    description: task.description || "",
    status: task.status,
    leadId: task.leadId || task.lead?.id || ""
  };
}

function dueLabel(task: TaskRecord, localization: WorkspaceLocalizationSettings) {
  const value = task.dueDate ? new Date(task.dueDate) : new Date(task.createdAt);

  if (isToday(value)) {
    return `Today • ${formatLocalizedTime(value, localization)}`;
  }

  if (isTomorrow(value)) {
    return `Tomorrow • ${formatLocalizedTime(value, localization)}`;
  }

  return formatLocalizedDateTime(value, localization);
}

function priorityTone(priority: TaskRecord["priority"]) {
  switch (priority) {
    case "HIGH":
      return "border-[#ffb09c] bg-[#fff1ec] text-[#f0643f]";
    case "LOW":
      return "border-[#7ea6ff] bg-[#eef4ff] text-[#386df4]";
    default:
      return "border-[#ffd08a] bg-[#fff7eb] text-[#d48700]";
  }
}

function priorityLabel(priority: TaskRecord["priority"]) {
  return priority.charAt(0) + priority.slice(1).toLowerCase();
}

function statusLabel(status: TaskRecord["status"]) {
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

function statusTone(status: TaskRecord["status"]) {
  switch (status) {
    case "TODO":
      return {
        columnClassName: "border-[#d9e6ff] bg-[linear-gradient(180deg,#f8fbff,rgba(238,244,255,0.7))]",
        headerBadgeClassName: "bg-[#eef4ff] text-[#386df4]",
        accentClassName: "bg-[#386df4]",
        dropClassName: "border-[#9bb7ff] bg-[#f3f7ff]"
      };
    case "IN_PROGRESS":
      return {
        columnClassName: "border-[#ffe0a6] bg-[linear-gradient(180deg,#fffdf7,rgba(255,247,235,0.84))]",
        headerBadgeClassName: "bg-[#fff7eb] text-[#d48700]",
        accentClassName: "bg-[#d48700]",
        dropClassName: "border-[#f0c774] bg-[#fff8ec]"
      };
    case "DONE":
      return {
        columnClassName: "border-[#cdebd9] bg-[linear-gradient(180deg,#f8fffb,rgba(238,250,242,0.84))]",
        headerBadgeClassName: "bg-[#eefaf2] text-[#2f9d57]",
        accentClassName: "bg-[#2f9d57]",
        dropClassName: "border-[#8bd0a5] bg-[#f1fbf5]"
      };
    default:
      return {
        columnClassName: "border-slate-200 bg-white",
        headerBadgeClassName: "bg-slate-100 text-slate-600",
        accentClassName: "bg-slate-400",
        dropClassName: "border-slate-300 bg-slate-50"
      };
  }
}

function TaskStatusDropdown({
  value,
  onChange,
  disabled = false,
  label
}: {
  value: TaskRecord["status"];
  onChange: (status: TaskRecord["status"]) => void;
  disabled?: boolean;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ left: number; top: number; width: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const tone = taskStatusDropdownStyles[value];

  const updateMenuPosition = () => {
    const button = buttonRef.current;
    if (!button) {
      return;
    }

    const rect = button.getBoundingClientRect();
    const viewportPadding = 12;
    const menuHeight = 150;
    const menuWidth = Math.max(rect.width, 204);
    const availableBelow = window.innerHeight - rect.bottom;
    const preferredTop = availableBelow < menuHeight && rect.top > menuHeight ? rect.top - menuHeight - 8 : rect.bottom + 8;
    const top = Math.min(
      Math.max(viewportPadding, preferredTop),
      Math.max(viewportPadding, window.innerHeight - menuHeight - viewportPadding)
    );

    setMenuPosition({
      left: Math.max(viewportPadding, Math.min(rect.left, window.innerWidth - menuWidth - viewportPadding)),
      top,
      width: menuWidth
    });
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    updateMenuPosition();

    const closeOnPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }

      setOpen(false);
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    window.addEventListener("pointerdown", closeOnPointerDown);
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("pointerdown", closeOnPointerDown);
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open]);

  const menu = open && menuPosition
    ? createPortal(
        <div
          ref={menuRef}
          role="listbox"
          aria-label={label}
          className="fixed z-[90] overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_14px_34px_rgba(15,23,42,0.12)]"
          style={{ left: menuPosition.left, top: menuPosition.top, width: menuPosition.width }}
        >
          <div className="grid gap-1">
            {taskStatusOptions.map((status) => {
              const active = status.value === value;
              const optionTone = taskStatusDropdownStyles[status.value];

              return (
                <button
                  key={status.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={(event) => {
                    event.stopPropagation();
                    setOpen(false);
                    if (!active) {
                      onChange(status.value);
                    }
                  }}
                  className={`group relative flex h-10 w-full items-center gap-2.5 rounded-lg border px-2.5 text-left transition ${
                    active
                      ? `border-slate-200 ${optionTone.surface}`
                      : "border-transparent bg-white hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span className={`h-4.5 w-1 shrink-0 rounded-full ${optionTone.accent}`} />
                  <span className="min-w-0 flex-1 truncate text-[0.9rem] font-medium text-slate-800">{status.label}</span>
                  {active ? (
                    <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-lg ${optionTone.badge}`}>
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={(event) => {
          event.stopPropagation();
          if (!disabled) {
            setOpen((current) => !current);
          }
        }}
        className="relative inline-flex h-8 min-w-[8.75rem] items-center rounded-lg border border-slate-200 bg-white py-0 pl-2.5 pr-8 text-sm font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className={`h-4.5 w-1 shrink-0 rounded-full ${tone.accent}`} />
          <span className="truncate">{statusLabel(value)}</span>
        </span>
        <ChevronDown className={`pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {menu}
    </>
  );
}

function taskSubtitle(task: TaskRecord) {
  if (task.description?.trim()) {
    return task.description.trim().split("\n")[0];
  }

  switch (task.taskType) {
    case "Call Account":
      return "Follow up with the account and confirm next steps.";
    case "Account Activity":
      return "Capture account activity and keep the record updated.";
    case "LI: Send connect":
      return "Send a personalized LinkedIn connection request.";
    default:
      return "Schedule call to discuss benefits and answer questions.";
  }
}

function associatedPrimary(task: TaskRecord) {
  return task.associateName || task.contact?.fullName || task.lead?.name || task.associateEmail || "Workspace task";
}

function associatedSecondary(task: TaskRecord) {
  const company = task.associateCompany || task.contact?.company?.name || task.company?.name || task.lead?.companyRecord?.name || task.lead?.company || "";
  const email = task.associateEmail || task.contact?.email || "";
  return [company, email].filter(Boolean).join(" • ") || "Internal queue";
}

function associatedCompany(task: TaskRecord) {
  const name = task.company?.name || task.contact?.company?.name || task.lead?.companyRecord?.name || task.lead?.company || task.associateCompany || "";
  const logoUrl = task.company?.logoUrl || task.contact?.company?.logoUrl || task.lead?.companyRecord?.logoUrl || null;

  return name ? { name, logoUrl } : null;
}

function combineDateTime(date: string, time: string) {
  if (!date) {
    return "";
  }

  const iso = new Date(`${date}T${time || "09:00"}:00`);
  return iso.toISOString();
}

function exportTasks(records: TaskRecord[], filename: string) {
  const exportData = records.map((task) => ({
    Task: task.title,
    Type: task.taskType,
    Status: statusLabel(task.status),
    Priority: priorityLabel(task.priority),
    Owner: task.ownerName,
    "Associated With": associatedPrimary(task),
    Context: associatedSecondary(task),
    "Due Date": task.dueDate ? new Date(task.dueDate).toISOString() : "",
    Description: task.description || ""
  }));

  exportToExcel(exportData, filename);
}

async function parseJson<T>(response: Response) {
  const payload = (await response.json().catch(() => null)) as T | { error?: string } | null;

  if (!response.ok) {
    throw new Error((payload as { error?: string } | null)?.error || "Request failed");
  }

  return payload as T;
}

function defaultViewModeForSection(section: TaskSection): TaskViewMode {
  return section === "status" ? "board" : "table";
}

function TaskModal({
  open,
  mode,
  ownerOptions,
  currentUserEmail,
  form,
  busy,
  onClose,
  onChange,
  onSubmit,
  onDelete,
  onMarkDone,
  pipelineLeads
}: {
  open: boolean;
  mode: "create" | "edit";
  ownerOptions: OwnerOption[];
  currentUserEmail: string;
  form: TaskFormState;
  busy: boolean;
  onClose: () => void;
  onChange: (next: TaskFormState) => void;
  onSubmit: () => void;
  onDelete: (() => void) | null;
  onMarkDone: (() => void) | null;
  pipelineLeads: PipelineLeadOption[];
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[rgba(15,23,42,0.28)] px-4 py-8 backdrop-blur-[2px]">
      <div className="flex max-h-[calc(100vh-4rem)] w-full max-w-[720px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-[1.35rem] font-semibold tracking-tight text-slate-900">{mode === "create" ? "New task" : "Edit Task"}</h2>
          <button onClick={onClose} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:bg-slate-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-6 py-5 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <CheckSquare className="h-4 w-4 text-[#386df4]" />
              Task Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Task title</label>
                <div className="relative">
                  <CheckSquare className={`${inputIconWrapperClassName} h-4 w-4`} />
                  <input className={inputWithIconClassName} placeholder="Follow up on proposal" value={form.title} onChange={(event) => onChange({ ...form, title: event.target.value })} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Task</label>
                  <div className="relative">
                    <AppSelect className={`${selectClassName} pl-10`} value={form.taskType} onChange={(event) => onChange({ ...form, taskType: event.target.value })}>
                      {taskTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </AppSelect>
                    <CheckSquare className={`${inputIconWrapperClassName} h-4 w-4 z-10 pointer-events-none`} />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Assigned to</label>
                  <div className="relative">
                    <AppSelect
                      className={`${selectClassName} pl-10`}
                      value={form.ownerEmail}
                      onChange={(event) => {
                        const owner = ownerOptions.find((item) => item.email === event.target.value) || ownerOptions[0];
                        onChange({ ...form, ownerEmail: owner.email, ownerName: owner.name });
                      }}
                    >
                      {ownerOptions.map((owner) => (
                        <option key={owner.email} value={owner.email}>
                          {owner.name}{owner.email === currentUserEmail ? " (You)" : ""}
                        </option>
                      ))}
                    </AppSelect>
                    <User className={`${inputIconWrapperClassName} h-4 w-4 z-10 pointer-events-none`} />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Status</label>
                  <div className="relative">
                    <AppSelect
                      className={`${selectClassName} pl-10`}
                      value={form.status}
                      onChange={(event) => onChange({ ...form, status: event.target.value as TaskFormState["status"] })}
                    >
                      {taskStatusOptions.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </AppSelect>
                    <CheckSquare className={`${inputIconWrapperClassName} h-4 w-4 z-10 pointer-events-none`} />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Due date</label>
                  <div className="relative">
                    <CalendarDays className={`${inputIconWrapperClassName} h-4 w-4`} />
                    <AppDatePicker className={inputWithIconClassName} value={form.dueDate} onChange={(dueDate) => onChange({ ...form, dueDate })} placeholder="Select due date" />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Time</label>
                  <div className="relative">
                    <Clock className={`${inputIconWrapperClassName} h-4 w-4`} />
                    <AppTimePicker className={inputWithIconClassName} value={form.dueTime} onChange={(dueTime) => onChange({ ...form, dueTime })} placeholder="Select time" />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Priority</label>
                  <div className="relative">
                    <AppSelect className={`${selectClassName} pl-10`} value={form.priority} onChange={(event) => onChange({ ...form, priority: event.target.value as TaskFormState["priority"] })}>
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </AppSelect>
                    <AlertCircle className={`${inputIconWrapperClassName} h-4 w-4 z-10 pointer-events-none`} />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Link to Lead (Optional)</label>
                <div className="relative">
                  <AppSelect 
                    className={`${selectClassName} pl-10`} 
                    value={form.leadId} 
                    onChange={(event) => onChange({ ...form, leadId: event.target.value })}
                  >
                     <option value="">No linked lead</option>
                     {pipelineLeads.map((lead) => (
                       <option key={lead.id} value={lead.id}>
                         {lead.name} {lead.company ? `- ${lead.company}` : ""}
                       </option>
                     ))}
                  </AppSelect>
                  <Target className={`${inputIconWrapperClassName} h-4 w-4 z-10 pointer-events-none`} />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Description</label>
                <div className="relative">
                  <AlignLeft className={`absolute left-3.5 top-3.5 text-slate-400 pointer-events-none h-4 w-4`} />
                  <textarea
                    rows={4}
                    className={`${inputWithIconClassName} min-h-[112px] resize-none pt-3.5`}
                    value={form.description}
                    onChange={(event) => onChange({ ...form, description: event.target.value })}
                    placeholder="Add task context or instructions..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
          <div className="flex items-center gap-2">
            {onDelete ? (
              <button
                onClick={onDelete}
                className="crm-btn rounded-xl border border-[#ffd4ca] bg-white px-4 py-2.5 text-sm font-medium text-[#e25f37] hover:bg-[#fff4f0]"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            ) : null}
            {onMarkDone ? (
              <button
                onClick={onMarkDone}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                Mark done
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onClose} className="crm-btn crm-btn-secondary">
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={busy || !form.title.trim()}
              className="rounded-xl bg-[#386df4] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (mode === "create" ? "Creating..." : "Saving...") : mode === "create" ? "Create task" : "Save task"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TasksWorkspace({
  initialTasks,
  initialSection,
  initialTaskId,
  localization,
  currentUser,
  teamMembers,
  pipelineLeads
}: {
  initialTasks: TaskRecord[];
  initialSection: TaskSection;
  initialTaskId?: string | null;
  localization: WorkspaceLocalizationSettings;
  currentUser: OwnerOption;
  teamMembers: Array<{ id: string; fullName: string; email: string; avatarUrl?: string | null }>;
  pipelineLeads: PipelineLeadOption[];
}) {
  const router = useRouter();
  const { confirm: requestConfirmation, confirmationDialog } = useConfirmAction();
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const ownerOptions = useMemo(
    () =>
      teamMembers.length
        ? teamMembers.map((member) => ({ name: member.fullName, email: member.email, avatarUrl: member.avatarUrl }))
        : [currentUser],
    [currentUser, teamMembers]
  );
  const defaultOwner = ownerOptions.find((owner) => owner.email === currentUser.email) || ownerOptions[0] || currentUser;
  const [tasks, setTasks] = useState(initialTasks);
  const [section, setSection] = useState<TaskSection>(initialSection);
  const [viewMode, setViewMode] = useState<TaskViewMode>(() => defaultViewModeForSection(initialSection));
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>({
    priority: "ALL",
    taskType: "ALL",
    status: "ALL",
    ownerEmail: "ALL"
  });
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [form, setForm] = useState<TaskFormState>(() => emptyTaskForm(defaultOwner));
  const [feedback, setFeedback] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TaskRecord["status"] | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [isModalActionPending, setIsModalActionPending] = useState(false);
  const [isBulkActionPending, setIsBulkActionPending] = useState(false);
  const [pendingStatusTaskIds, setPendingStatusTaskIds] = useState<string[]>([]);
  const [, startTransition] = useTransition();
  const dragStartedRef = useRef(false);
  const openedInitialTaskIdRef = useRef<string | null>(null);
  const deferredQuery = useDeferredValue(query);
  const ownerByEmail = useMemo(() => new Map(ownerOptions.map((owner) => [owner.email, owner])), [ownerOptions]);
  useCommandKFocus(searchInputRef);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  useEffect(() => {
    setSection(initialSection);
    setViewMode(defaultViewModeForSection(initialSection));
  }, [initialSection]);

  useEffect(() => {
    if (!initialTaskId || openedInitialTaskIdRef.current === initialTaskId) {
      return;
    }

    openedInitialTaskIdRef.current = initialTaskId;
    const task = tasks.find((item) => item.id === initialTaskId);

    if (!task) {
      setFeedback("Task not found or no longer available.");
      return;
    }

    setFeedback(null);
    setModalMode("edit");
    setActiveTaskId(task.id);
    setForm(formFromTask(task));
  }, [initialTaskId, tasks]);

  const ownerFilterOptions = useMemo(
    () =>
      Array.from(new Set(tasks.map((task) => `${task.ownerName}::${task.ownerEmail}`))).map((entry) => {
        const [name, email] = entry.split("::");
        return { name, email };
      }),
    [tasks]
  );

  const ownerFilterSelectOptions = useMemo(
    () => [
      { value: "ALL", label: "All owners", icon: <User className={filterOptionIconClassName} /> },
      ...ownerFilterOptions.map((owner) => ({
        value: owner.email,
        label: owner.name,
        icon: <User className={filterOptionIconClassName} />
      }))
    ],
    [ownerFilterOptions]
  );

  const priorityFilterSelectOptions = [
    { value: "ALL", label: "All priorities", icon: <AlertCircle className={filterOptionIconClassName} /> },
    { value: "HIGH", label: "High", icon: <AlertCircle className={filterOptionIconClassName} /> },
    { value: "MEDIUM", label: "Medium", icon: <AlertCircle className={filterOptionIconClassName} /> },
    { value: "LOW", label: "Low", icon: <AlertCircle className={filterOptionIconClassName} /> }
  ];

  const taskTypeFilterSelectOptions = [
    { value: "ALL", label: "All task types", icon: <ListTodo className={filterOptionIconClassName} /> },
    ...taskTypes.map((type) => ({ value: type, label: type, icon: <ListTodo className={filterOptionIconClassName} /> }))
  ];

  const statusFilterSelectOptions = [
    { value: "ALL", label: "All statuses", icon: <CheckSquare className={filterOptionIconClassName} /> },
    { value: "TODO", label: "To do", icon: <CheckSquare className={filterOptionIconClassName} /> },
    { value: "IN_PROGRESS", label: "In progress", icon: <CheckSquare className={filterOptionIconClassName} /> },
    { value: "DONE", label: "Done", icon: <CheckSquare className={filterOptionIconClassName} /> }
  ];

  const currentOwner = currentUser.email || ownerFilterOptions[0]?.email || ownerOptions[0]?.email || "ALL";

  useEffect(() => {
    if (section === "assigned") {
      setFilters((current) => ({ ...current, ownerEmail: currentOwner, status: "ALL" }));
      setShowFilters(false);
      return;
    }

    if (section === "status") {
      setShowFilters(true);
      setFilters((current) => ({ ...current, ownerEmail: "ALL" }));
      return;
    }

    setShowFilters(false);
    setFilters((current) => ({ ...current, ownerEmail: "ALL", status: "ALL" }));
  }, [currentOwner, section]);

  const filteredTasks = useMemo(() => {
    const value = deferredQuery.trim().toLowerCase();

    return tasks.filter((task) => {
      const haystack = `${task.title} ${associatedPrimary(task)} ${associatedSecondary(task)} ${task.taskType}`.toLowerCase();
      const matchesQuery = !value || haystack.includes(value);
      const matchesPriority = filters.priority === "ALL" || task.priority === filters.priority;
      const matchesTaskType = filters.taskType === "ALL" || task.taskType === filters.taskType;
      const matchesStatus = filters.status === "ALL" || task.status === filters.status;
      const matchesOwner = filters.ownerEmail === "ALL" || task.ownerEmail === filters.ownerEmail;

      return matchesQuery && matchesPriority && matchesTaskType && matchesStatus && matchesOwner;
    });
  }, [deferredQuery, filters, tasks]);

  useEffect(() => {
    setCurrentPage(1);
  }, [deferredQuery, filters]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredTasks.length / pageSize));

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, filteredTasks.length, pageSize]);

  const paginatedTasks = useMemo(() => paginateItems(filteredTasks, currentPage, pageSize), [currentPage, filteredTasks, pageSize]);
  const filteredTaskIdSet = useMemo(() => new Set(filteredTasks.map((task) => task.id)), [filteredTasks]);
  const selectedTaskIdSet = useMemo(() => new Set(selectedTaskIds), [selectedTaskIds]);
  const pendingStatusTaskIdSet = useMemo(() => new Set(pendingStatusTaskIds), [pendingStatusTaskIds]);
  const paginatedTaskIds = useMemo(() => paginatedTasks.items.map((task) => task.id), [paginatedTasks.items]);
  const selectedTasks = useMemo(() => tasks.filter((task) => selectedTaskIdSet.has(task.id)), [selectedTaskIdSet, tasks]);
  const allPageTasksSelected = paginatedTaskIds.length > 0 && paginatedTaskIds.every((taskId) => selectedTaskIdSet.has(taskId));
  const somePageTasksSelected = paginatedTaskIds.some((taskId) => selectedTaskIdSet.has(taskId));

  useEffect(() => {
    setSelectedTaskIds((current) => current.filter((taskId) => filteredTaskIdSet.has(taskId)));
  }, [filteredTaskIdSet]);

  const toggleTaskSelection = (taskId: string, checked: boolean) => {
    setSelectedTaskIds((current) =>
      checked ? (current.includes(taskId) ? current : [...current, taskId]) : current.filter((id) => id !== taskId)
    );
  };

  const toggleAllPageTasks = (checked: boolean) => {
    setSelectedTaskIds((current) => {
      if (checked) {
        const next = new Set(current);
        paginatedTaskIds.forEach((taskId) => next.add(taskId));
        return Array.from(next);
      }

      return current.filter((taskId) => !paginatedTaskIds.includes(taskId));
    });
  };

  const clearSelectedTasks = () => {
    setSelectedTaskIds([]);
  };

  const activeTask = tasks.find((task) => task.id === activeTaskId) || null;
  const activeOpenTasks = tasks.filter((task) => task.status !== "DONE");
  const statusCounts = {
    TODO: tasks.filter((task) => task.status === "TODO").length,
    IN_PROGRESS: tasks.filter((task) => task.status === "IN_PROGRESS").length,
    DONE: tasks.filter((task) => task.status === "DONE").length
  };
  const boardColumns: Array<{ key: TaskRecord["status"]; label: string }> = [
    { key: "TODO", label: "To do" },
    { key: "IN_PROGRESS", label: "In progress" },
    { key: "DONE", label: "Done" }
  ];

  const stats = [
    { label: "Total", value: activeOpenTasks.length, description: "All active tasks in this pipeline.", icon: ListTodo, color: "text-[#386df4]", bg: "bg-[#eef4ff]" },
    {
      label: "Call Contact",
      value: activeOpenTasks.filter((task) => task.taskType === "Call Contact").length,
      description: "scheduled calls for contacts.",
      icon: PhoneCall, color: "text-[#f46b38]", bg: "bg-[#fff2ee]"
    },
    {
      label: "Call Account",
      value: activeOpenTasks.filter((task) => task.taskType === "Call Account").length,
      description: "scheduled calls for accounts.",
      icon: Phone, color: "text-[#f4b34c]", bg: "bg-[#fffbf4]"
    },
    {
      label: "Account Activity",
      value: activeOpenTasks.filter((task) => task.taskType === "Account Activity").length,
      description: "account-level tasks.",
      icon: Activity, color: "text-[#38b259]", bg: "bg-[#eefcf2]"
    },
    {
      label: "LI: Send connect",
      value: activeOpenTasks.filter((task) => task.taskType === "LI: Send connect").length,
      description: "send LinkedIn requests.",
      icon: Linkedin, color: "text-[#0077b5]", bg: "bg-[#eaf5fd]"
    }
  ];

  const openCreateModal = () => {
    setFeedback(null);
    setModalMode("create");
    setActiveTaskId(null);
    setForm(emptyTaskForm(defaultOwner));
  };

  const openEditModal = (task: TaskRecord) => {
    setFeedback(null);
    setModalMode("edit");
    setActiveTaskId(task.id);
    setForm(formFromTask(task));
  };

  const closeModal = () => {
    setModalMode(null);
    setActiveTaskId(null);
    setForm(emptyTaskForm(defaultOwner));
  };

  const submitTask = () => {
    if (isModalActionPending || !form.title.trim()) {
      return;
    }

    setIsModalActionPending(true);

    startTransition(() => {
      void (async () => {
        setFeedback(null);

        try {
          const payload = {
            title: form.title,
            description: form.description,
            taskType: form.taskType,
            priority: form.priority,
            ownerName: form.ownerName,
            ownerEmail: form.ownerEmail,
            associateEmail: form.associateEmail,
            dueDate: combineDateTime(form.dueDate, form.dueTime),
            contactId: form.contactId,
            status: form.status,
            leadId: form.leadId || undefined
          };

          if (modalMode === "create") {
            const createdTask = await parseJson<TaskRecord>(
              await fetch("/api/tasks", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(payload)
              })
            );

            setTasks((current) => [createdTask, ...current]);
            setFeedback("Task created.");
          } else if (activeTask) {
            const updatedTask = await parseJson<TaskRecord>(
              await fetch(`/api/tasks/${activeTask.id}`, {
                method: "PATCH",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(payload)
              })
            );

            setTasks((current) => current.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
            setFeedback("Task updated.");
          }

          closeModal();
          router.refresh();
        } catch (error) {
          setFeedback(error instanceof Error ? error.message : "Unable to save task.");
        } finally {
          setIsModalActionPending(false);
        }
      })();
    });
  };

  const markDone = () => {
    if (!activeTask || isModalActionPending) {
      return;
    }

    setIsModalActionPending(true);

    startTransition(() => {
      void (async () => {
        try {
          const updatedTask = await parseJson<TaskRecord>(
            await fetch(`/api/tasks/${activeTask.id}`, {
              method: "PATCH",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ status: "DONE" })
            })
          );

          setTasks((current) => current.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
          setFeedback("Task marked done.");
          closeModal();
          router.refresh();
        } catch (error) {
          setFeedback(error instanceof Error ? error.message : "Unable to update task.");
        } finally {
          setIsModalActionPending(false);
        }
      })();
    });
  };

  const deleteTask = () => {
    if (!activeTask || isModalActionPending) {
      return;
    }

    void (async () => {
      const confirmed = await requestConfirmation({
        title: "Move task to trash?",
        description: `Task "${activeTask.title}" will be moved to the trash bin and can be restored from Settings.`,
        confirmLabel: "Move to trash"
      });
      if (!confirmed) {
        return;
      }

      setIsModalActionPending(true);

      startTransition(() => {
        void (async () => {
          try {
            await parseJson<{ ok: true }>(
              await fetch(`/api/tasks/${activeTask.id}`, {
                method: "DELETE"
              })
            );

            setTasks((current) => current.filter((task) => task.id !== activeTask.id));
            setFeedback("Task moved to trash.");
            closeModal();
            router.refresh();
          } catch (error) {
            setFeedback(error instanceof Error ? error.message : "Unable to delete task.");
          } finally {
            setIsModalActionPending(false);
          }
        })();
      });
    })();
  };

  const moveTaskToStatus = (taskId: string, nextStatus: TaskRecord["status"]) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.status === nextStatus || pendingStatusTaskIdSet.has(taskId)) {
      setDragTaskId(null);
      setDragOverStatus(null);
      return;
    }

    const previousStatus = task.status;
    setPendingStatusTaskIds((current) => (current.includes(taskId) ? current : [...current, taskId]));
    setTasks((current) => current.map((item) => (item.id === taskId ? { ...item, status: nextStatus } : item)));
    setFeedback(`Task moved to ${statusLabel(nextStatus)}.`);
    setDragTaskId(null);
    setDragOverStatus(null);

    startTransition(() => {
      void (async () => {
        try {
          const updatedTask = await parseJson<TaskRecord>(
            await fetch(`/api/tasks/${taskId}`, {
              method: "PATCH",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ status: nextStatus })
            })
          );

          setTasks((current) => current.map((item) => (item.id === updatedTask.id ? updatedTask : item)));
          router.refresh();
        } catch (error) {
          setTasks((current) => current.map((item) => (item.id === taskId ? { ...item, status: previousStatus } : item)));
          setFeedback(error instanceof Error ? error.message : "Unable to move task.");
        } finally {
          setPendingStatusTaskIds((current) => current.filter((id) => id !== taskId));
        }
      })();
    });
  };

  const updateTaskStatus = (task: TaskRecord, nextStatus: TaskRecord["status"]) => {
    if (task.status === nextStatus || pendingStatusTaskIdSet.has(task.id)) {
      return;
    }

    const previousStatus = task.status;
    setPendingStatusTaskIds((current) => (current.includes(task.id) ? current : [...current, task.id]));
    setTasks((current) => current.map((item) => (item.id === task.id ? { ...item, status: nextStatus } : item)));
    setFeedback(`Task moved to ${statusLabel(nextStatus)}.`);

    startTransition(() => {
      void (async () => {
        try {
          const updatedTask = await parseJson<TaskRecord>(
            await fetch(`/api/tasks/${task.id}`, {
              method: "PATCH",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ status: nextStatus })
            })
          );

          setTasks((current) => current.map((item) => (item.id === updatedTask.id ? updatedTask : item)));
          router.refresh();
        } catch (error) {
          setTasks((current) => current.map((item) => (item.id === task.id ? { ...item, status: previousStatus } : item)));
          setFeedback(error instanceof Error ? error.message : "Unable to update task status.");
        } finally {
          setPendingStatusTaskIds((current) => current.filter((id) => id !== task.id));
        }
      })();
    });
  };

  const handleExportSelectedTasks = () => {
    if (!selectedTasks.length) {
      return;
    }

    exportTasks(selectedTasks, "selected-tasks.xlsx");
    setFeedback(`Exported ${selectedTasks.length} selected task${selectedTasks.length === 1 ? "" : "s"}.`);
  };

  const handleBulkStatusUpdate = async (nextStatus: TaskRecord["status"]) => {
    if (!selectedTasks.length) {
      return;
    }

    setIsBulkActionPending(true);

    const results = await Promise.allSettled(
      selectedTasks.map(async (task) => {
        const updatedTask = await parseJson<TaskRecord>(
          await fetch(`/api/tasks/${task.id}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ status: nextStatus })
          })
        );

        return updatedTask;
      })
    );

    const updatedTasks = results.filter((result): result is PromiseFulfilledResult<TaskRecord> => result.status === "fulfilled");
    const failedCount = results.length - updatedTasks.length;

    if (updatedTasks.length) {
      const updatedById = new Map(updatedTasks.map((result) => [result.value.id, result.value]));
      setTasks((current) => current.map((task) => updatedById.get(task.id) || task));
    }

    setIsBulkActionPending(false);

    if (!updatedTasks.length) {
      setFeedback("Unable to update selected tasks.");
      return;
    }

    setFeedback(
      failedCount
        ? `Updated ${updatedTasks.length} task${updatedTasks.length === 1 ? "" : "s"}. ${failedCount} failed.`
        : nextStatus === "DONE"
          ? `Marked ${updatedTasks.length} task${updatedTasks.length === 1 ? "" : "s"} done.`
          : `Moved ${updatedTasks.length} task${updatedTasks.length === 1 ? "" : "s"} to ${statusLabel(nextStatus)}.`
    );
    router.refresh();
  };

  const handleDeleteSelectedTasks = async () => {
    if (!selectedTasks.length) {
      return;
    }

    const confirmed = await requestConfirmation({
      title: "Move selected tasks to trash?",
      description: `${selectedTasks.length} task${selectedTasks.length === 1 ? "" : "s"} will be moved to the trash bin and can be restored from Settings.`,
      confirmLabel: "Move to trash"
    });

    if (!confirmed) {
      return;
    }

    setIsBulkActionPending(true);

    const results = await Promise.allSettled(
      selectedTasks.map(async (task) => {
        await parseJson<{ ok: true }>(
          await fetch(`/api/tasks/${task.id}`, {
            method: "DELETE"
          })
        );

        return task.id;
      })
    );

    const deletedIds = results
      .filter((result): result is PromiseFulfilledResult<string> => result.status === "fulfilled")
      .map((result) => result.value);
    const failedCount = results.length - deletedIds.length;

    if (deletedIds.length) {
      const deletedIdSet = new Set(deletedIds);
      setTasks((current) => current.filter((task) => !deletedIdSet.has(task.id)));
      setSelectedTaskIds((current) => current.filter((taskId) => !deletedIdSet.has(taskId)));
    }

    setIsBulkActionPending(false);

    if (!deletedIds.length) {
      setFeedback("Unable to delete selected tasks.");
      return;
    }

    setFeedback(
      failedCount
        ? `Moved ${deletedIds.length} task${deletedIds.length === 1 ? "" : "s"} to trash. ${failedCount} failed.`
        : `Moved ${deletedIds.length} task${deletedIds.length === 1 ? "" : "s"} to trash.`
    );
    router.refresh();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
           <h1 className="text-[1.85rem] font-semibold tracking-tight text-slate-900">
             {section === "all" ? "All tasks" : section === "status" ? "Tasks by status" : "Assigned to me"}
           </h1>
           <p className="mt-1 text-sm text-slate-500">
             {section === "all"
               ? "Track every task in one queue."
               : section === "status"
                 ? "Filter task execution by workflow stage."
                 : "Review the tasks currently assigned to your account."}
           </p>
        </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {feedback ? (
              <FeedbackToast message={feedback} position="inline" />
            ) : null}
            <div className="inline-flex h-[2.25rem] items-center rounded-[0.7rem] border border-slate-200 bg-slate-50 p-[3px]">
              <button
                onClick={() => setViewMode("table")}
                className={`inline-flex h-full items-center gap-[0.4rem] rounded-md px-3 text-[0.8125rem] font-medium leading-[1.15] transition-colors ${
                  viewMode === "table" ? "bg-[#eef4ff] text-[#386df4] shadow-[0_1px_2px_rgba(56,109,244,0.08)] ring-1 ring-[#386df4]/20" : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-700"
                }`}
              >
                <LayoutList className="h-[0.95rem] w-[0.95rem]" />
                Table
              </button>
              <button
                onClick={() => setViewMode("board")}
                className={`inline-flex h-full items-center gap-[0.4rem] rounded-md px-3 text-[0.8125rem] font-medium leading-[1.15] transition-colors ${
                  viewMode === "board" ? "bg-[#eef4ff] text-[#386df4] shadow-[0_1px_2px_rgba(56,109,244,0.08)] ring-1 ring-[#386df4]/20" : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-700"
                }`}
              >
                <KanbanSquare className="h-[0.95rem] w-[0.95rem]" />
                Board
              </button>
            </div>

            <button onClick={openCreateModal} className="crm-btn crm-btn-primary">
              Create task
            </button>
          </div>
        </div>

        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-5">
          {stats.map((item) => (
            <Card key={item.label} className="overflow-hidden border-slate-200/90 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]">
               <div className="p-4 flex flex-col h-full justify-between">
                 <div>
                   <div className="flex items-center justify-between">
                     <div className="text-sm font-medium text-slate-500">{item.label}</div>
                     <item.icon className={`h-4 w-4 ${item.color}`} />
                   </div>
                   <div className="mt-2.5 text-[1.4rem] font-semibold tracking-tight text-slate-800">{item.value}</div>
                 </div>
                 <div className="mt-1.5 text-sm text-slate-400">{item.description}</div>
               </div>
            </Card>
          ))}
        </div>

        <div className="mt-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-end">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowFilters((current) => !current)}
              className="crm-btn crm-btn-secondary"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Show filters
            </button>

            <div className="relative min-w-[220px] max-w-[360px] flex-1 lg:min-w-[320px] lg:flex-none">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input ref={searchInputRef} className={`${inputClassName} pl-9 pr-14`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks, contacts, companies" />
              <SearchHotkeyButton inputRef={searchInputRef} />
            </div>
          </div>
        </div>

        {showFilters ? (
          <Card className="mt-3 p-3">
            <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
              <AppSelect
                className={inputClassName}
                value={filters.ownerEmail}
                onChange={(event) => setFilters((current) => ({ ...current, ownerEmail: event.target.value }))}
                disabled={section === "assigned"}
                options={ownerFilterSelectOptions}
                hideMenuIcons
              />
              <AppSelect
                className={inputClassName}
                value={filters.priority}
                onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value as TaskFilters["priority"] }))}
                options={priorityFilterSelectOptions}
                hideMenuIcons
              />
              <AppSelect
                className={inputClassName}
                value={filters.taskType}
                onChange={(event) => setFilters((current) => ({ ...current, taskType: event.target.value }))}
                options={taskTypeFilterSelectOptions}
                hideMenuIcons
              />
              <AppSelect
                className={inputClassName}
                value={filters.status}
                onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as TaskFilters["status"] }))}
                options={statusFilterSelectOptions}
                hideMenuIcons
              />
            </div>
          </Card>
        ) : null}

        {selectedTasks.length ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#c8d8ff] bg-[#f8fbff] px-4 py-3">
            <div className="text-sm font-medium text-slate-700">
              {selectedTasks.length} task{selectedTasks.length === 1 ? "" : "s"} selected
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => void handleBulkStatusUpdate("TODO")}
                disabled={isBulkActionPending}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                To do
              </button>
              <button
                onClick={() => void handleBulkStatusUpdate("IN_PROGRESS")}
                disabled={isBulkActionPending}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                In progress
              </button>
              <button
                onClick={() => void handleBulkStatusUpdate("DONE")}
                disabled={isBulkActionPending}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Mark done
              </button>
              <button
                onClick={handleExportSelectedTasks}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
              >
                Export selected
              </button>
              <button
                onClick={() => void handleDeleteSelectedTasks()}
                disabled={isBulkActionPending}
                className="crm-btn crm-btn-danger disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isBulkActionPending ? "Working..." : "Delete selected"}
              </button>
              <button
                onClick={clearSelectedTasks}
                className="crm-btn crm-btn-secondary text-slate-500 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </button>
            </div>
          </div>
        ) : null}

        {viewMode === "table" ? (
          <Card className="mt-3 overflow-hidden p-0">
            <div className="w-full overflow-x-auto">
              <table className="min-w-full border border-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr className="[&>th]:border-b [&>th]:border-slate-200/80">
                    <th className="border-r border-slate-200/80 px-3 py-3 font-medium">
                      <SelectionCheckbox
                        aria-label="Select all tasks on this page"
                        checked={allPageTasksSelected}
                        indeterminate={!allPageTasksSelected && somePageTasksSelected}
                        onChange={(event) => toggleAllPageTasks(event.target.checked)}
                      />
                    </th>
                    <th className="border-r border-slate-200/80 px-2.5 py-3 font-medium">Tasks</th>
                    <th className="border-r border-slate-200/80 px-2.5 py-3 font-medium">Associated with</th>
                    <th className="border-r border-slate-200/80 px-2.5 py-3 font-medium">Due Date</th>
                    <th className="border-r border-slate-200/80 px-2.5 py-3 font-medium">Status</th>
                    <th className="border-r border-slate-200/80 px-2.5 py-3 font-medium">Priority</th>
                    <th className="px-2.5 py-3 font-medium">Owner</th>
                  </tr>
                </thead>
                <tbody className="[&>tr:not(:last-child)>td]:border-b [&>tr:not(:last-child)>td]:border-slate-200/80">
                  {paginatedTasks.items.map((task) => {
                    const rowSelected = selectedTaskIdSet.has(task.id);

                    return (
                    <tr key={task.id} onClick={() => openEditModal(task)} className={`cursor-pointer text-slate-700 hover:bg-slate-50 ${rowSelected ? "bg-[#f8fbff]" : ""}`}>
                      <td className="border-r border-slate-200/80 px-3 py-3 align-top">
                        <SelectionCheckbox
                          aria-label={`Select ${task.title}`}
                          checked={rowSelected}
                          onClick={(event) => event.stopPropagation()}
                          onChange={(event) => toggleTaskSelection(task.id, event.target.checked)}
                          className="mt-1"
                        />
                      </td>
                      <td className="border-r border-slate-200/80 px-2.5 py-3 align-top">
                        <div className="font-medium text-slate-900">{task.title}</div>
                        <div className="mt-1 line-clamp-1 text-sm text-slate-400">{taskSubtitle(task)}</div>
                      </td>
                      <td className="border-r border-slate-200/80 px-2.5 py-3 align-top">
                        <div className="font-medium text-slate-800">{associatedPrimary(task)}</div>
                        <div className="mt-1 line-clamp-1 text-sm text-slate-400">{associatedSecondary(task)}</div>
                      </td>
                      <td className="border-r border-slate-200/80 px-2.5 py-3 align-top text-slate-700">{dueLabel(task, localization)}</td>
                      <td className="border-r border-slate-200/80 px-2.5 py-3 align-top">
                        <TaskStatusDropdown
                          label={`Update status for ${task.title}`}
                          value={task.status}
                          onChange={(status) => updateTaskStatus(task, status)}
                          disabled={isBulkActionPending || pendingStatusTaskIdSet.has(task.id)}
                        />
                      </td>
                      <td className="border-r border-slate-200/80 px-2.5 py-3 align-top">
                        <span className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium ${priorityTone(task.priority)}`}>
                          {priorityLabel(task.priority)}
                        </span>
                      </td>
                      <td className="px-2.5 py-3 align-top">
                        <div className="flex items-center gap-2">
                          <UserAvatar
                            name={task.ownerName}
                            imageUrl={ownerByEmail.get(task.ownerEmail)?.avatarUrl}
                            className="h-7 w-7 text-xs"
                            fallbackClassName="bg-[#fff2df] text-[#d59628]"
                          />
                          <span className="text-slate-800">{task.ownerName}</span>
                        </div>
                      </td>
                    </tr>
                  )})}
                  {!filteredTasks.length ? (
                    <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                          No tasks match the current search and filters.
                        </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <PaginationControls
              currentPage={paginatedTasks.safePage}
              pageSize={pageSize}
              pageSizeOptions={[8, 16, 24]}
              totalItems={filteredTasks.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={(value) => {
                setPageSize(value);
                setCurrentPage(1);
              }}
            />
          </Card>
        ) : (
          <div className="mt-3">
            <div className="pb-2">
              <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
                {boardColumns.map((column) => {
                  const columnTasks = filteredTasks.filter((task) => task.status === column.key);
                  const tone = statusTone(column.key);
                  const isDropActive = dragOverStatus === column.key;

                  return (
                    <div
                      key={column.key}
                      className={`flex flex-col min-h-[160px] overflow-hidden rounded-2xl border transition ${tone.columnClassName} ${isDropActive ? tone.dropClassName : ""}`}
                    >
                      <div className="flex flex-shrink-0 items-center justify-between border-b border-white/40 bg-white/40 px-4 py-3.5 backdrop-blur-sm">
                        <div className="flex items-center gap-2.5">
                          <h2 className="text-[15px] font-medium tracking-tight text-slate-900">{column.label}</h2>
                          <span className="flex h-5 items-center justify-center rounded-full bg-slate-200/60 px-2 text-[11px] font-medium text-slate-500">
                            {columnTasks.length}
                          </span>
                        </div>
                        <span className={`flex h-[26px] items-center whitespace-nowrap rounded-full px-3 text-[11px] font-medium tracking-wide ${tone.headerBadgeClassName}`}>
                          {statusLabel(column.key)}
                        </span>
                      </div>
                      <div
                        className="flex-1 flex flex-col gap-3 px-3.5 py-3 transition"
                        onDragOver={(event) => {
                          event.preventDefault();
                          if (dragTaskId) {
                            setDragOverStatus(column.key);
                          }
                        }}
                        onDragEnter={(event) => {
                          event.preventDefault();
                          if (dragTaskId) {
                            setDragOverStatus(column.key);
                          }
                        }}
                        onDragLeave={(event) => {
                          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                            setDragOverStatus((current) => (current === column.key ? null : current));
                          }
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          dragStartedRef.current = false;
                          const taskId = event.dataTransfer.getData("text/task-id") || dragTaskId;
                          if (taskId) {
                            moveTaskToStatus(taskId, column.key);
                          }
                        }}
                      >
                        {columnTasks.length ? (
                          columnTasks.map((task) => {
                            const company = associatedCompany(task);

                            return (
                              <div
                                key={task.id}
                                draggable
                                onDragStart={(event) => {
                                  dragStartedRef.current = true;
                                  event.dataTransfer.effectAllowed = "move";
                                  event.dataTransfer.setData("text/task-id", task.id);
                                  setDragTaskId(task.id);
                                }}
                                onDragEnd={() => {
                                  setDragTaskId(null);
                                  setDragOverStatus(null);
                                  window.setTimeout(() => {
                                    dragStartedRef.current = false;
                                  }, 0);
                                }}
                                className={`group relative flex w-full flex-col rounded-[16px] border bg-white p-4 text-left shadow-[0_4px_16px_rgba(15,23,42,0.03)] transition-all hover:-translate-y-1 hover:border-[#c8d8ff] hover:bg-[#fcfdff] hover:shadow-[0_8px_24px_rgba(56,109,244,0.06)] ${
                                  dragTaskId === task.id ? "cursor-grabbing opacity-70" : "cursor-grab border-slate-200"
                                }`}
                              >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="relative flex h-3 w-3 items-center justify-center">
                                    <div className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-20 ${tone.accentClassName}`} />
                                    <div className={`relative h-2 w-2 rounded-full ${tone.accentClassName}`} />
                                  </div>
                                  <span className="whitespace-nowrap rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">{task.taskType}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`inline-flex shrink-0 whitespace-nowrap rounded-[6px] border px-1.5 py-0.5 text-[10px] font-medium tracking-wide ${priorityTone(task.priority)}`}>
                                    {priorityLabel(task.priority)}
                                  </span>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEditModal(task);
                                    }}
                                    className="grid h-6 w-6 place-items-center rounded-md text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600"
                                  >
                                    <Settings className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                              <div className="mt-3 min-w-0">
                                <h3 className="truncate text-sm font-semibold text-slate-900 transition-colors group-hover:text-[#386df4]">{task.title}</h3>
                                <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">{taskSubtitle(task)}</p>
                              </div>
                              <div className="mt-3.5 flex flex-col gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
                                <div className="flex items-center gap-2.5 truncate">
                                  <User className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                  <span className="truncate text-sm font-medium text-slate-700">{associatedPrimary(task)}</span>
                                </div>
                                <div className="flex items-center gap-2.5 truncate">
                                  {company ? (
                                    <CompanyLogo
                                      name={company.name}
                                      logoUrl={company.logoUrl}
                                      className="h-4.5 w-4.5 shrink-0 rounded-none object-contain"
                                      fallbackClassName="flex items-center justify-center bg-[#ffe7e4] text-[#d85b4b]"
                                      textClassName="text-[9px] font-semibold"
                                    />
                                  ) : (
                                    <Tag className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                  )}
                                  <span className="truncate text-sm text-slate-500">{associatedSecondary(task)}</span>
                                </div>
                              </div>
                              <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-3.5">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                                  <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                                  <span>{dueLabel(task, localization)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <UserAvatar
                                    name={task.ownerName}
                                    imageUrl={ownerByEmail.get(task.ownerEmail)?.avatarUrl}
                                    className="h-[26px] w-[26px] text-[9px] shadow-sm ring-2 ring-white"
                                    fallbackClassName="bg-gradient-to-br from-[#ffd594] to-[#f4b34c] text-white"
                                  />
                                </div>
                              </div>
                              </div>
                            );
                          })
                        ) : (
                          <div
                            className={`flex flex-1 min-h-[120px] items-center justify-center rounded-[16px] border border-dashed text-sm font-medium ${
                              isDropActive ? "border-[#9bb7ff] bg-white text-[#386df4]" : "border-slate-200 bg-white/70 text-slate-400"
                            }`}
                          >
                            {dragTaskId ? "Drop task here" : "No tasks in this column"}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      <TaskModal
        open={modalMode !== null}
        mode={modalMode || "create"}
        ownerOptions={ownerOptions}
        currentUserEmail={currentUser.email}
        form={form}
        busy={isModalActionPending}
        onClose={closeModal}
        onChange={setForm}
        onSubmit={submitTask}
        onDelete={modalMode === "edit" ? deleteTask : null}
        onMarkDone={modalMode === "edit" && activeTask?.status !== "DONE" ? markDone : null}
        pipelineLeads={pipelineLeads}
      />
      {confirmationDialog}
    </div>
  );
}

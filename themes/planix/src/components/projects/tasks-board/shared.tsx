import { CalendarDays, CheckCircle2, ClipboardList, Clock3, Flag, MessageSquareMore, Users } from "lucide-react";

import {
  type BoardTask,
  boardColumns,
  boardMembers,
  type ProjectNotification,
  type TaskChecklistItem,
  type TaskCommentRecord,
  type TaskLinkRecord,
  sortOptions,
  type TagDefinition,
  type TaskPriority,
  type TaskColumn,
  topTabs,
  viewTabs,
} from "@/data/project-board";
import { readCompatibleLocalStorageItem } from "@/lib/storage-compat";
import { normalizeTaskStatusId } from "@/lib/task-status";

export type { TagDefinition };

export const DEFAULT_TAGS: TagDefinition[] = [
  { id: "tag-1", label: "Product Design", color: "#c9b5ff" },
  { id: "tag-2", label: "UI Design",      color: "#ffc4b0" },
  { id: "tag-3", label: "Landing Page",   color: "#f3b0b7" },
  { id: "tag-4", label: "Wireframe",      color: "#bfd7ff" },
  { id: "tag-5", label: "Marketing",      color: "#b5f0c5" },
];

export const TAG_COLOR_SWATCHES = [
  "#c9b5ff", "#bfd7ff", "#b5f0c5", "#fde68a",
  "#fcd3a0", "#ffc4b0", "#f3b0b7", "#a8f0e8",
] as const;

export function getTagColor(label: string, tags: TagDefinition[]): string {
  return tags.find((t) => t.label === label)?.color ?? "#c9b5ff";
}

export type DragState = {
  taskId: number;
  fromColumnId: string;
} | null;

export type ListStatusMenuState = {
  taskId: number;
  columnId: string;
  top: number;
  left: number;
} | null;

export type TaskFormState = {
  title: string;
  description: string;
  assignedTo: string[];
  statusId: string;
  tag: string;
  priority: TaskPriority;
  dueDate: string;
  reminderDate: string;
  subtasks: TaskChecklistItem[];
  notes: string[];
  links: TaskLinkRecord[];
  comments: TaskCommentRecord[];
  fileIds: string[];
};

export type DrawerTab = "description" | "comments" | "activities";
export type ProjectView = "Board View" | "List View" | "Timeline View";
export type TaskModalMode = "view" | "edit";
export type TaskModalState = {
  taskId: number;
  columnId: string;
  mode: TaskModalMode;
} | null;
export type TaskModalRecord = {
  task: BoardTask;
  columnId: string;
  columnTitle: string;
};
export type ProjectTopTab = "Overview" | "Tasks" | "Discussions" | "Team Members" | "Notifications" | "Files" | "Integrations";

export const BOARD_STORAGE_KEY = "planix.project-board.columns";
export const DEFAULT_TAG = "Product Design";
export const PRIORITY_OPTIONS: TaskPriority[] = ["Normal", "Medium", "High", "Done"];
export const PROJECT_TYPES = ["UX/UI Design", "Web Development", "Mobile App", "Marketing", "Research & Analytics"] as const;
export const TAG_OPTIONS = ["Product Design", "UI Design", "Landing Page", "Wireframe", "Marketing"] as const;

export function createTaskChecklistDraft(title = "", completed = false): TaskChecklistItem {
  return {
    id: `subtask-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    completed,
  };
}

export function toneSwatch(tone: string) {
  if (tone === "peach") return "bg-[#d68970]";
  if (tone === "sand") return "bg-[#90867a]";
  if (tone === "olive") return "bg-[#88936c]";
  if (tone === "rose") return "bg-[#c78579]";
  return "bg-[#62697a]";
}

export function tagToneClasses(tone: string) {
  if (tone === "rose") return "bg-[#f3b0b7] text-[#582d33]";
  if (tone === "blue") return "bg-[#bfd7ff] text-[#2f4f78]";
  if (tone === "violet") return "bg-[#c9b5ff] text-[#4e367d]";
  return "bg-[#d7ab98] text-[#5a392d]";
}

export function withColumnCounts(columns: TaskColumn[]) {
  return columns.map((column) => ({
    ...column,
    count: String(column.tasks.length).padStart(2, "0"),
  }));
}

export function createEmptyTaskForm(statusId: string): TaskFormState {
  return {
    title: "",
    description: "",
    assignedTo: [],
    statusId,
    tag: DEFAULT_TAG,
    priority: "Normal",
    dueDate: "",
    reminderDate: "",
    subtasks: [],
    notes: [],
    links: [],
    comments: [],
    fileIds: [],
  };
}

export function parseDueDateInput(dueLabel?: string) {
  if (!dueLabel) {
    return "";
  }

  const normalizedLabel = dueLabel.split(" - ")[0]?.trim() ?? dueLabel;
  const parsedDate = new Date(`${normalizedLabel}T12:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");

  return `${parsedDate.getFullYear()}-${month}-${day}`;
}

export function createTaskFormFromTask(task: BoardTask, columnId: string): TaskFormState {
  return {
    title: task.title,
    description: task.description,
    assignedTo: task.assignees.map((a) => a.name),
    statusId: columnId,
    tag: task.tag,
    priority: task.priority,
    dueDate: parseDueDateInput(task.dueLabel),
    reminderDate: task.reminderDate ?? "",
    subtasks: task.checklist.map((item) => ({ ...item })),
    notes: [...task.notes],
    links: task.linkItems.map((item) => ({ ...item })),
    comments: task.commentItems.map((item) => ({ ...item })),
    fileIds: [...task.attachmentFileIds],
  };
}

export function normalizeTaskChecklistItems(value: unknown): TaskChecklistItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      if (typeof item === "string") {
        const title = item.trim();
        return title
          ? {
              id: `subtask-${index + 1}`,
              title,
              completed: false,
            }
          : null;
      }

      if (!item || typeof item !== "object") {
        return null;
      }

      const title = "title" in item && typeof item.title === "string"
        ? item.title.trim()
        : "label" in item && typeof item.label === "string"
          ? item.label.trim()
          : "";

      if (!title) {
        return null;
      }

      const id = "id" in item && typeof item.id === "string" && item.id.trim()
        ? item.id.trim()
        : `subtask-${index + 1}`;

      return {
        id,
        title,
        completed: "completed" in item && typeof item.completed === "boolean" ? item.completed : false,
      };
    })
    .filter((item): item is TaskChecklistItem => Boolean(item));
}

function normalizeTaskLinkRecord(value: unknown, index: number): TaskLinkRecord | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const url = "url" in value && typeof value.url === "string" ? value.url.trim() : "";

  if (!url) {
    return null;
  }

  const id = "id" in value && typeof value.id === "string" && value.id.trim()
    ? value.id.trim()
    : `link-${index + 1}`;

  return { id, url };
}

function normalizeTaskCommentRecord(value: unknown, index: number): TaskCommentRecord | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const body = "body" in value && typeof value.body === "string" ? value.body.trim() : "";

  if (!body) {
    return null;
  }

  const id = "id" in value && typeof value.id === "string" && value.id.trim()
    ? value.id.trim()
    : `comment-${index + 1}`;

  return { id, body };
}

function normalizeTaskFileIds(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

export function getTagTone(tag: string): BoardTask["tagTone"] {
  if (tag === "Landing Page") return "rose";
  if (tag === "Wireframe") return "blue";
  if (tag === "UI Design" || tag === "Marketing") return "peach";
  return "violet";
}

export function formatDueDate(dateValue: string) {
  if (!dateValue) {
    return undefined;
  }

  const date = new Date(`${dateValue}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function toDateTimeLocalValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function formatReminderDateTime(value?: string | null) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function getPriorityMeta(priority: TaskPriority) {
  if (priority === "Done") return { label: "Done", tone: "text-[#dcb892]" };
  if (priority === "High") return { label: "High", tone: "text-[#f0c48e]" };
  if (priority === "Medium") return { label: "Medium", tone: "text-[#d7c5a2]" };
  return { label: "Normal", tone: "text-[var(--text-secondary)]" };
}

function priorityRank(priority: TaskPriority) {
  if (priority === "Done") return 4;
  if (priority === "High") return 3;
  if (priority === "Medium") return 2;
  return 1;
}

function buildAssigneeMember(name: string, index: number) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  const initials = parts.length === 0
    ? "NA"
    : parts.map((part) => part[0]?.toUpperCase() ?? "").join("");

  return {
    name,
    initials,
    tone: boardMembers[index % Math.max(boardMembers.length, 1)]?.tone ?? "sand",
  };
}

type ApiTaskRecord = {
  id: number;
  title: string;
  description: string;
  status_id: string;
  tag: string;
  priority?: TaskPriority | null;
  assigned_to: string | null;
  due_date: string | null;
  reminder_at?: string | null;
  reminder_date: string | null;
  created_by: string;
  subtasks: unknown;
  notes: string[] | null;
  created_at: string;
  completed_at?: string | null;
  links?: unknown;
  comments?: unknown;
  file_ids?: unknown;
  project_ref?: string;
  sort_order?: number;
};

function normalizeDueDateValue(value: string | null) {
  if (!value) {
    return undefined;
  }

  const normalized = value.slice(0, 10);
  return formatDueDate(normalized);
}

function normalizeDueDateIso(value: string | null) {
  return value ? value.slice(0, 10) : undefined;
}

function normalizeReminderValue(value: string | null | undefined) {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return toDateTimeLocalValue(parsed);
}

function parseAssignedMemberNames(value: string | null) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function mapApiTasksToColumns(tasks: ApiTaskRecord[]) {
  const columnsById = new Map(
    boardColumns.map((column) => [
      column.id,
      {
        ...column,
        tasks: [] as BoardTask[],
      },
    ]),
  );

  tasks.forEach((task) => {
    const targetColumn = columnsById.get(normalizeTaskStatusId(task.status_id)) ?? columnsById.get("open");

    if (!targetColumn) {
      return;
    }

    const assignedMembers = parseAssignedMemberNames(task.assigned_to)
      .map((name, index) => buildAssigneeMember(name, index));
    const linkItems = Array.isArray(task.links)
      ? task.links.map((item, index) => normalizeTaskLinkRecord(item, index)).filter((item): item is TaskLinkRecord => Boolean(item))
      : [];
    const commentItems = Array.isArray(task.comments)
      ? task.comments.map((item, index) => normalizeTaskCommentRecord(item, index)).filter((item): item is TaskCommentRecord => Boolean(item))
      : [];
    const attachmentFileIds = normalizeTaskFileIds(task.file_ids);

    targetColumn.tasks.push({
      id: Number(task.id),
      tag: task.tag,
      tagTone: getTagTone(task.tag),
      priority: PRIORITY_OPTIONS.includes(task.priority ?? "Normal") ? (task.priority ?? "Normal") : "Normal",
      title: task.title,
      description: task.description,
      checklist: normalizeTaskChecklistItems(task.subtasks),
      notes: Array.isArray(task.notes) ? task.notes : [],
      assignees: assignedMembers,
      attachments: attachmentFileIds.length,
      attachmentFileIds,
      comments: commentItems.length,
      commentItems,
      links: linkItems.length,
      linkItems,
      dueDate: normalizeDueDateIso(task.due_date),
      dueLabel: normalizeDueDateValue(task.due_date),
      reminderDate: normalizeReminderValue(task.reminder_at ?? task.reminder_date),
      reminderLabel: formatReminderDateTime(task.reminder_at ?? task.reminder_date),
    });
  });

  return withColumnCounts(Array.from(columnsById.values()));
}

export function getStoredProjectView(): ProjectView {
  if (typeof window === "undefined") {
    return "Board View";
  }

  try {
    const storedValue = readCompatibleLocalStorageItem("planix.projects.selected-view");

    if (!storedValue) {
      return "Board View";
    }

    const parsedValue = JSON.parse(storedValue) as ProjectView;

    return viewTabs.some((tab) => tab.label === parsedValue) ? parsedValue : "Board View";
  } catch {
    return "Board View";
  }
}

export function getStoredProjectTopTab(): ProjectTopTab {
  if (typeof window === "undefined") {
    return "Tasks";
  }

  try {
    const storedValue = readCompatibleLocalStorageItem("planix.projects.selected-top-tab");

    if (!storedValue) {
      return "Tasks";
    }

    const parsedValue = JSON.parse(storedValue) as ProjectTopTab;

    return topTabs.some((tab) => tab.label === parsedValue) ? parsedValue : "Tasks";
  } catch {
    return "Tasks";
  }
}

export function sortTasks(tasks: BoardTask[], selectedSort: string) {
  const nextTasks = [...tasks];

  nextTasks.sort((left, right) => {
    if (selectedSort === "Task Name") return left.title.localeCompare(right.title);
    if (selectedSort === "Assigned to") {
      return (left.assignees[0]?.name ?? "").localeCompare(right.assignees[0]?.name ?? "");
    }
    if (selectedSort === "Due Date") return (left.dueLabel ?? "zzzz").localeCompare(right.dueLabel ?? "zzzz");
    if (selectedSort === "Tags") return left.tag.localeCompare(right.tag);
    if (selectedSort === "Priority") return priorityRank(right.priority) - priorityRank(left.priority);
    if (selectedSort === "By Dated Closed") return right.id - left.id;
    return 0;
  });

  return nextTasks;
}

export function sortColumns(columns: TaskColumn[], selectedSort: string) {
  if (selectedSort === "Sort By" || !(sortOptions as readonly string[]).includes(selectedSort)) {
    return columns;
  }

  return withColumnCounts(
    columns.map((column) => ({
      ...column,
      tasks: sortTasks(column.tasks, selectedSort),
    })),
  );
}

export function columnBulletColor(columnId: string) {
  if (columnId === "open") return "bg-[#8bb7ff]";
  if (columnId === "progress") return "bg-[#fb8a74]";
  if (columnId === "review") return "bg-[#f0c36c]";
  if (columnId === "completed") return "bg-[#65d38c]";
  return "bg-[#c9b8a4]";
}

export function boardColumnSurfaceClasses(columnId: string) {
  if (columnId === "open") {
    return "border border-[#8bb7ff]/14 bg-[linear-gradient(180deg,rgba(139,183,255,0.18)_0%,rgba(23,27,34,0.96)_26%,rgba(15,16,18,1)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]";
  }

  if (columnId === "progress") {
    return "border border-[#fb8a74]/14 bg-[linear-gradient(180deg,rgba(251,138,116,0.18)_0%,rgba(34,24,22,0.96)_28%,rgba(15,16,18,1)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]";
  }

  if (columnId === "review") {
    return "border border-[#f0c36c]/14 bg-[linear-gradient(180deg,rgba(240,195,108,0.18)_0%,rgba(34,28,20,0.96)_28%,rgba(15,16,18,1)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]";
  }

  if (columnId === "completed") {
    return "border border-[#65d38c]/14 bg-[linear-gradient(180deg,rgba(101,211,140,0.18)_0%,rgba(20,30,24,0.96)_28%,rgba(15,16,18,1)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]";
  }

  return "border border-white/6 bg-[#0f1012]";
}

export function boardColumnEmptyStateClasses(columnId: string) {
  if (columnId === "open") {
    return "border-[#8bb7ff]/20 bg-[#8bb7ff]/[0.055] text-[#bcd4ff]";
  }

  if (columnId === "progress") {
    return "border-[#fb8a74]/20 bg-[#fb8a74]/[0.055] text-[#ffc2b4]";
  }

  if (columnId === "review") {
    return "border-[#f0c36c]/20 bg-[#f0c36c]/[0.055] text-[#f7d99a]";
  }

  if (columnId === "completed") {
    return "border-[#65d38c]/20 bg-[#65d38c]/[0.055] text-[#9de2b6]";
  }

  return "border-white/8 bg-white/[0.02] text-[var(--text-muted)]";
}

export function taskStatusIndicator(columnId: string) {
  if (columnId === "progress") {
    return (
      <span className="relative inline-flex h-3.5 w-3.5 shrink-0 overflow-hidden rounded-full border border-[#d7c5a2]/80">
        <span className="absolute inset-y-0 left-0 w-[7px] bg-[#e7d5b8]" />
      </span>
    );
  }

  if (columnId === "review") {
    return <span className="inline-flex h-3.5 w-3.5 shrink-0 rounded-full border border-[#c9b8a4] bg-[#c9b8a4]" />;
  }

  if (columnId === "completed") {
    return <span className="inline-flex h-3.5 w-3.5 shrink-0 rounded-full border border-[#af8f72] bg-[#af8f72]" />;
  }

  return <span className="inline-flex h-3.5 w-3.5 shrink-0 rounded-full border border-white/35" />;
}

export function taskProgressValue(task: BoardTask, columnId: string) {
  if (columnId === "completed") {
    return 100;
  }

  const completedChecklistCount = task.checklist.filter((item) => item.completed).length;

  if (task.checklist.length > 0) {
    const checklistRatio = completedChecklistCount / task.checklist.length;

    if (columnId === "review") {
      return Math.min(96, Math.max(78, Math.round(78 + checklistRatio * 18)));
    }

    if (columnId === "progress") {
      return Math.min(76, Math.max(36, Math.round(36 + checklistRatio * 40)));
    }

    return Math.min(36, Math.max(12, Math.round(12 + checklistRatio * 24)));
  }

  const checklistBoost = Math.min(task.checklist.length * 4, 12);

  if (columnId === "review") {
    return Math.min(96, 78 + checklistBoost);
  }

  if (columnId === "progress") {
    return Math.min(76, 52 + checklistBoost);
  }

  return Math.min(36, 20 + checklistBoost);
}

export function mergeStoredColumns(storedColumns: TaskColumn[]) {
  const storedById = new Map(storedColumns.map((column) => [column.id, column]));

  return withColumnCounts(
    boardColumns.map((defaultColumn) => {
      const storedColumn = storedById.get(defaultColumn.id);

      if (!storedColumn) {
        return defaultColumn;
      }

      return {
        ...defaultColumn,
        ...storedColumn,
        title: defaultColumn.title,
      };
    }),
  );
}

export function updateTaskDetails(
  columns: TaskColumn[],
  modalState: Exclude<TaskModalState, null>,
  nextForm: TaskFormState,
) {
  const sourceColumn = columns.find((column) => column.id === modalState.columnId);
  const sourceTask = sourceColumn?.tasks.find((task) => task.id === modalState.taskId);

  if (!sourceColumn || !sourceTask) {
    return columns;
  }

  const nextAssignees = nextForm.assignedTo.map((name, index) => buildAssigneeMember(name, index));
  const updatedTask: BoardTask = {
    ...sourceTask,
    title: nextForm.title.trim() || sourceTask.title,
    description: nextForm.description.trim() || sourceTask.description,
    tag: nextForm.tag,
    tagTone: getTagTone(nextForm.tag),
    priority: nextForm.priority,
    assignees: nextAssignees.length ? nextAssignees : sourceTask.assignees,
    checklist: normalizeTaskChecklistItems(nextForm.subtasks),
    notes: nextForm.notes.map((note) => note.trim()).filter(Boolean),
    linkItems: nextForm.links.map((item) => ({ ...item, url: item.url.trim() })).filter((item) => item.url),
    links: nextForm.links.map((item) => item.url.trim()).filter(Boolean).length,
    commentItems: nextForm.comments.map((item) => ({ ...item, body: item.body.trim() })).filter((item) => item.body),
    comments: nextForm.comments.map((item) => item.body.trim()).filter(Boolean).length,
    attachmentFileIds: [...nextForm.fileIds],
    attachments: nextForm.fileIds.length,
    dueDate: nextForm.dueDate || undefined,
    dueLabel: formatDueDate(nextForm.dueDate),
    reminderDate: nextForm.reminderDate || undefined,
    reminderLabel: formatReminderDateTime(nextForm.reminderDate),
  };

  if (modalState.columnId === nextForm.statusId) {
    return withColumnCounts(
      columns.map((column) =>
        column.id === modalState.columnId
          ? {
              ...column,
              tasks: column.tasks.map((task) => (task.id === modalState.taskId ? updatedTask : task)),
            }
          : column,
      ),
    );
  }

  return withColumnCounts(
    columns.map((column) => {
      if (column.id === modalState.columnId) {
        return {
          ...column,
          tasks: column.tasks.filter((task) => task.id !== modalState.taskId),
        };
      }

      if (column.id === nextForm.statusId) {
        return {
          ...column,
          tasks: [updatedTask, ...column.tasks],
        };
      }

      return column;
    }),
  );
}

export function moveTask(
  columns: TaskColumn[],
  dragState: Exclude<DragState, null>,
  toColumnId: string,
  targetTaskId?: number,
  position: "before" | "after" | "end" = "end",
) {
  const sourceColumn = columns.find((column) => column.id === dragState.fromColumnId);

  if (!sourceColumn) {
    return columns;
  }

  const draggedTask = sourceColumn.tasks.find((task) => task.id === dragState.taskId);

  if (!draggedTask) {
    return columns;
  }

  if (dragState.fromColumnId === toColumnId && targetTaskId === dragState.taskId) {
    return columns;
  }

  const nextColumns = columns.map((column) => ({
    ...column,
    tasks: column.tasks.filter((task) => task.id !== dragState.taskId),
  }));

  const targetColumn = nextColumns.find((column) => column.id === toColumnId);

  if (!targetColumn) {
    return columns;
  }

  if (targetTaskId === undefined) {
    targetColumn.tasks.push(draggedTask);
    return withColumnCounts(nextColumns);
  }

  const targetIndex = targetColumn.tasks.findIndex((task) => task.id === targetTaskId);
  const insertionIndex =
    targetIndex < 0
      ? targetColumn.tasks.length
      : position === "after"
        ? targetIndex + 1
        : targetIndex;

  if (insertionIndex < 0) {
    targetColumn.tasks.push(draggedTask);
  } else {
    targetColumn.tasks.splice(insertionIndex, 0, draggedTask);
  }

  return withColumnCounts(nextColumns);
}

export function notificationIcon(kind: ProjectNotification["kind"]) {
  if (kind === "deadline") return CalendarDays;
  if (kind === "completed") return CheckCircle2;
  if (kind === "milestone") return Flag;
  if (kind === "comment") return MessageSquareMore;
  if (kind === "overdue") return Clock3;
  if (kind === "meeting") return Users;
  return ClipboardList;
}

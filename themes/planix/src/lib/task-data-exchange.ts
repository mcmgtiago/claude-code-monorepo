import type { TaskChecklistItem, TaskPriority } from "@/data/project-board";
import { isCompletedTaskStatus, normalizeTaskStatusId } from "@/lib/task-status";

export const TASK_CSV_FORMATS = [
  {
    id: "standard",
    label: "Standard CSV",
    filenameSuffix: "standard",
    description: "Universal CSV columns that import cleanly into spreadsheets and most PM tools.",
  },
  {
    id: "jira",
    label: "Jira CSV",
    filenameSuffix: "jira",
    description: "Jira-friendly export with Summary, Issue Type, Labels, and workflow columns.",
  },
  {
    id: "asana",
    label: "Asana CSV",
    filenameSuffix: "asana",
    description: "Asana-friendly export with Task Name, Tags, Completed, and Section columns.",
  },
] as const;

export type TaskCsvFormat = (typeof TASK_CSV_FORMATS)[number]["id"];

export type TaskCsvRecord = {
  title: string;
  description: string;
  statusId: string;
  priority: TaskPriority;
  assignedTo: string[];
  dueDate: string | null;
  tag: string;
  checklist: TaskChecklistItem[];
  notes: string[];
  links: string[];
  comments: string[];
};

export type ImportedTaskDraft = {
  title: string;
  description: string;
  statusId: string;
  priority: TaskPriority;
  assignedTo: string[];
  dueDate: string | null;
  tag: string;
  subtasks: TaskChecklistItem[];
  notes: string[];
  links: { id: string; url: string }[];
  comments: { id: string; body: string }[];
};

export type ParsedTaskCsvResult = {
  tasks: ImportedTaskDraft[];
  skippedRowCount: number;
};

const STANDARD_HEADERS = [
  "Task Name",
  "Description",
  "Status",
  "Completed",
  "Priority",
  "Assignee",
  "Due Date",
  "Tag",
  "Checklist",
  "Notes",
  "Links",
] as const;

const JIRA_HEADERS = [
  "Summary",
  "Issue Type",
  "Status",
  "Priority",
  "Assignee",
  "Due Date",
  "Labels",
  "Description",
  "Subtasks",
  "Comments",
] as const;

const ASANA_HEADERS = [
  "Task Name",
  "Description",
  "Completed",
  "Assignee",
  "Due Date",
  "Tags",
  "Subtasks",
  "Notes",
  "Links",
  "Priority",
  "Section/Column",
] as const;

const TITLE_ALIASES = ["task name", "task", "name", "title", "summary", "issue summary"];
const DESCRIPTION_ALIASES = ["description", "details", "task description"];
const DESCRIPTION_FALLBACK_ALIASES = ["notes"];
const STATUS_ALIASES = ["status", "column", "section/column", "workflow state", "section"];
const COMPLETED_ALIASES = ["completed", "is completed", "done"];
const PRIORITY_ALIASES = ["priority", "importance"];
const ASSIGNEE_ALIASES = ["assignee", "assigned to", "owner", "assignees", "responsible"];
const DUE_DATE_ALIASES = ["due date", "due", "deadline", "due on"];
const TAG_ALIASES = ["tag", "tags", "label", "labels"];
const CHECKLIST_ALIASES = ["subtasks", "subtask", "checklist", "check list", "task checklist"];
const NOTES_ALIASES = ["internal notes", "comments", "comment", "activity comments"];
const LINKS_ALIASES = ["links", "link", "url", "urls", "attachments", "attachment urls"];

function escapeCsvValue(value: string) {
  return `"${value.replace(/"/g, "\"\"")}"`;
}

function stringifyCsvRows(rows: string[][]) {
  return rows.map((row) => row.map((value) => escapeCsvValue(value)).join(",")).join("\n");
}

function normalizeChecklistItems(value: unknown): TaskChecklistItem[] {
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

      return {
        id: "id" in item && typeof item.id === "string" && item.id.trim()
          ? item.id.trim()
          : `subtask-${index + 1}`,
        title,
        completed: "completed" in item && typeof item.completed === "boolean" ? item.completed : false,
      };
    })
    .filter((item): item is TaskChecklistItem => Boolean(item));
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function normalizeLinks(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return "";
      }

      return "url" in item && typeof item.url === "string" ? item.url.trim() : "";
    })
    .filter(Boolean);
}

function normalizeComments(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return "";
      }

      return "body" in item && typeof item.body === "string" ? item.body.trim() : "";
    })
    .filter(Boolean);
}

function formatStatusLabel(statusId: string) {
  const normalized = normalizeTaskStatusId(statusId);

  if (normalized === "progress") {
    return "In Progress";
  }

  if (normalized === "review") {
    return "In Review";
  }

  if (normalized === "completed") {
    return "Completed";
  }

  return "Open";
}

function formatChecklistValue(items: TaskChecklistItem[]) {
  return items.map((item) => `${item.completed ? "[x]" : "[ ]"} ${item.title}`).join("; ");
}

function formatListValue(items: string[]) {
  return items.join("; ");
}

function buildCsvRow(task: TaskCsvRecord, format: TaskCsvFormat) {
  const statusLabel = formatStatusLabel(task.statusId);
  const completedValue = isCompletedTaskStatus(task.statusId) ? "TRUE" : "FALSE";
  const assigneeValue = task.assignedTo.join(", ");
  const checklistValue = formatChecklistValue(task.checklist);
  const notesValue = formatListValue(task.notes);
  const linksValue = formatListValue(task.links);
  const commentsValue = formatListValue(task.comments);

  if (format === "jira") {
    return [
      task.title,
      "Task",
      statusLabel,
      task.priority,
      assigneeValue,
      task.dueDate ?? "",
      task.tag,
      task.description,
      checklistValue,
      commentsValue || notesValue || linksValue,
    ];
  }

  if (format === "asana") {
    return [
      task.title,
      task.description,
      completedValue,
      assigneeValue,
      task.dueDate ?? "",
      task.tag,
      checklistValue,
      notesValue,
      linksValue,
      task.priority,
      statusLabel,
    ];
  }

  return [
    task.title,
    task.description,
    statusLabel,
    completedValue,
    task.priority,
    assigneeValue,
    task.dueDate ?? "",
    task.tag,
    checklistValue,
    notesValue,
    linksValue,
  ];
}

export function serializeTasksToCsv(tasks: TaskCsvRecord[], format: TaskCsvFormat) {
  const headers = format === "jira"
    ? [...JIRA_HEADERS]
    : format === "asana"
      ? [...ASANA_HEADERS]
      : [...STANDARD_HEADERS];

  const rows = [
    headers,
    ...tasks.map((task) => buildCsvRow(task, format)),
  ];

  return stringifyCsvRows(rows);
}

function parseCsvRows(input: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const nextChar = input[index + 1];

    if (char === "\"") {
      if (inQuotes && nextChar === "\"") {
        value += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }

      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  return rows
    .map((currentRow) => currentRow.map((cell) => cell.trim()))
    .filter((currentRow) => currentRow.some((cell) => cell.length > 0));
}

function readCell(row: string[], headerMap: Map<string, number>, aliases: string[]) {
  for (const alias of aliases) {
    const index = headerMap.get(alias);

    if (index === undefined) {
      continue;
    }

    return row[index]?.trim() ?? "";
  }

  return "";
}

function parseBooleanValue(value: string) {
  return /^(true|yes|y|1|done|completed)$/i.test(value.trim());
}

function normalizeImportedStatus(statusValue: string, completedValue: string) {
  if (parseBooleanValue(completedValue)) {
    return "completed";
  }

  const normalized = normalizeTaskStatusId(statusValue);

  if (!normalized) {
    return "open";
  }

  if (normalized.includes("review")) {
    return "review";
  }

  if (normalized.includes("progress") || normalized.includes("doing") || normalized.includes("active")) {
    return "progress";
  }

  if (
    normalized.includes("done")
    || normalized.includes("complete")
    || normalized.includes("closed")
    || normalized.includes("resolved")
  ) {
    return "completed";
  }

  return "open";
}

function normalizeImportedPriority(priorityValue: string, statusId: string): TaskPriority {
  if (isCompletedTaskStatus(statusId)) {
    return "Done";
  }

  const normalized = priorityValue.trim().toLowerCase();

  if (!normalized) {
    return "Normal";
  }

  if (normalized.includes("high") || normalized.includes("urgent") || normalized.includes("critical") || normalized === "p1") {
    return "High";
  }

  if (normalized.includes("medium") || normalized === "normal" || normalized === "moderate" || normalized === "p2") {
    return "Medium";
  }

  return "Normal";
}

function normalizeImportedDate(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(normalized)) {
    return normalized.slice(0, 10);
  }

  const parsed = new Date(normalized);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function splitMultiValueField(value: string) {
  return value
    .split(/\n|;|,(?=\s*[A-Za-z0-9@[(])/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseChecklistField(value: string) {
  return splitMultiValueField(value)
    .map((item, index) => {
      const doneMatch = item.match(/^\[(x|X)\]\s*(.+)$/);
      const pendingMatch = item.match(/^\[\s*\]\s*(.+)$/);
      const pipedMatch = item.match(/^(.+?)\s*\|\s*(done|completed|true|false|pending)$/i);

      if (doneMatch) {
        return {
          id: `subtask-${index + 1}`,
          title: doneMatch[2].trim(),
          completed: true,
        };
      }

      if (pendingMatch) {
        return {
          id: `subtask-${index + 1}`,
          title: pendingMatch[1].trim(),
          completed: false,
        };
      }

      if (pipedMatch) {
        return {
          id: `subtask-${index + 1}`,
          title: pipedMatch[1].trim(),
          completed: /^(done|completed|true)$/i.test(pipedMatch[2]),
        };
      }

      return {
        id: `subtask-${index + 1}`,
        title: item,
        completed: false,
      };
    })
    .filter((item) => item.title);
}

function parseLinksField(value: string) {
  return splitMultiValueField(value).map((url, index) => ({
    id: `link-${index + 1}`,
    url,
  }));
}

function parseCommentsField(value: string) {
  return splitMultiValueField(value).map((body, index) => ({
    id: `comment-${index + 1}`,
    body,
  }));
}

function parseNotesField(value: string) {
  return splitMultiValueField(value);
}

export function parseTasksCsv(input: string): ParsedTaskCsvResult {
  const rows = parseCsvRows(input.replace(/^\uFEFF/, ""));

  if (rows.length === 0) {
    return {
      tasks: [],
      skippedRowCount: 0,
    };
  }

  const [headerRow, ...dataRows] = rows;
  const headerMap = new Map(
    headerRow.map((header, index) => [header.trim().toLowerCase(), index]),
  );

  const tasks = dataRows.flatMap((row) => {
    const title = readCell(row, headerMap, TITLE_ALIASES);

    if (!title) {
      return [];
    }

    const description = readCell(row, headerMap, DESCRIPTION_ALIASES)
      || readCell(row, headerMap, DESCRIPTION_FALLBACK_ALIASES);
    const statusId = normalizeImportedStatus(
      readCell(row, headerMap, STATUS_ALIASES),
      readCell(row, headerMap, COMPLETED_ALIASES),
    );
    const priority = normalizeImportedPriority(readCell(row, headerMap, PRIORITY_ALIASES), statusId);
    const assignedTo = splitMultiValueField(readCell(row, headerMap, ASSIGNEE_ALIASES));
    const tagValues = splitMultiValueField(readCell(row, headerMap, TAG_ALIASES));
    const checklistField = readCell(row, headerMap, CHECKLIST_ALIASES);
    const notesField = readCell(row, headerMap, NOTES_ALIASES);
    const linksField = readCell(row, headerMap, LINKS_ALIASES);

    return [{
      title,
      description,
      statusId,
      priority,
      assignedTo,
      dueDate: normalizeImportedDate(readCell(row, headerMap, DUE_DATE_ALIASES)),
      tag: tagValues[0] || "General",
      subtasks: parseChecklistField(checklistField),
      notes: parseNotesField(notesField),
      links: parseLinksField(linksField),
      comments: parseCommentsField(notesField),
    }];
  });

  return {
    tasks,
    skippedRowCount: Math.max(0, dataRows.length - tasks.length),
  };
}

export function mapTaskRowToCsvRecord(task: {
  title: string;
  description?: string | null;
  status_id?: string | null;
  priority?: string | null;
  assigned_to?: string | null;
  due_date?: string | null;
  tag?: string | null;
  subtasks?: unknown;
  notes?: unknown;
  links?: unknown;
  comments?: unknown;
}): TaskCsvRecord {
  const statusId = normalizeTaskStatusId(task.status_id) || "open";

  return {
    title: task.title.trim(),
    description: task.description?.trim() ?? "",
    statusId,
    priority: task.priority === "High" || task.priority === "Medium" || task.priority === "Done"
      ? task.priority
      : isCompletedTaskStatus(statusId)
        ? "Done"
        : "Normal",
    assignedTo: task.assigned_to
      ? task.assigned_to.split(",").map((item) => item.trim()).filter(Boolean)
      : [],
    dueDate: task.due_date?.slice(0, 10) ?? null,
    tag: task.tag?.trim() || "General",
    checklist: normalizeChecklistItems(task.subtasks),
    notes: normalizeStringArray(task.notes),
    links: normalizeLinks(task.links),
    comments: normalizeComments(task.comments),
  };
}

export function buildTaskCsvFilename(projectName: string, format: TaskCsvFormat) {
  const slug = projectName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const formatMeta = TASK_CSV_FORMATS.find((item) => item.id === format);

  return `${slug || "project"}-tasks-${formatMeta?.filenameSuffix ?? format}.csv`;
}

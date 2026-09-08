"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent as ReactDragEvent, type PointerEvent as ReactPointerEvent } from "react";
import {
  Archive,
  ArrowUp,
  Ban,
  Bell,
  Box,
  Check,
  Download,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Clock3,
  Copy,
  Crown,
  FileText,
  Flag,
  FolderKanban,

  Funnel,
  Grid2x2,
  Info,
  Link2,
  List,
  Loader2,
  MessageSquareMore,
  MessagesSquare,
  MoreHorizontal,
  MoreVertical,
  Pen,
  Pencil,
  Plus,
  Paperclip,
  Scan,
  Search,
  Settings,
  Star,
  Tag,
  Trash2,
  Users,
  UserRound,
  X,
  Zap,
} from "lucide-react";

import { Avatar, AvatarCluster } from "@/components/dashboard/avatar";
import { PrimarySidebar } from "@/components/layout/primary-sidebar";
import { AppLoader } from "@/components/ui/app-loader";
import { DatePicker } from "@/components/ui/date-picker";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { ModalCloseButton } from "@/components/ui/modal-close-button";
import { ReminderPicker } from "@/components/ui/reminder-picker";
import { CompanyLogo } from "@/components/clients/company-logo";
import type { ClientRecord } from "@/data/clients";
import {
  type BoardTask,
  boardColumns,
  boardMembers,
  type Integration,
    type ProjectNotification,
    type ProjectDocument,
    type ProjectGoal,
    type TaskChecklistItem,
    type TaskCommentRecord,
    type TaskLinkRecord,
    type WorkspaceProject,
  projectDocuments,
  projectGoals,
  type TaskColumn,
  timelineDays,
  timelineItems,
  timelineUsers,
  sortOptions,
  type TeamMemberRecord,
  topTabs,
  viewTabs,
} from "@/data/project-board";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/lib/use-hydrated";
import {
  formatProjectFileSize,
  PROJECT_FILE_ACCEPT_ATTRIBUTE,
  type ProjectFileRecord,
} from "@/lib/project-files";
import { usePersistentState } from "@/lib/use-persistent-state";
import { readMemoryCache, writeMemoryCache } from "@/lib/resource-memory-cache";
import { type ProjectWorkspaceBundle, cloneDefaultIntegrations } from "@/lib/project-workspace";
import { DEFAULT_WORKSPACE_TEAMS, normalizeWorkspaceTeams, type WorkspaceTeamRecord } from "@/lib/people";
import { defaultWorkspaceForm } from "@/lib/settings";
import { readJsonSafely, useSettingsBridgeHydration } from "@/lib/settings-client";
import { dispatchTaskDataChanged } from "@/lib/task-events";
import { buildTaskCsvFilename, TASK_CSV_FORMATS, type TaskCsvFormat } from "@/lib/task-data-exchange";
import { PROFILE_IDENTITY_STORAGE_KEY } from "@/lib/profile-client";
import { useNotificationsCenter } from "@/lib/notifications-center";
import {
  dispatchTimeTrackerChanged,
  resolveTimeTrackerActorName,
  TIME_TRACKER_CHANGED_EVENT,
  type TimeTrackerDashboardPayload,
} from "@/lib/time-tracker";
import {
  createWorkspaceActivityFromProjectNotification,
  pushWorkspaceActivity,
  useWorkspaceActivityFeed,
} from "@/lib/workspace-activity";
import {
  DEFAULT_TAGS,
  PROJECT_TYPES,
  TAG_COLOR_SWATCHES,
  TAG_OPTIONS,
  type TagDefinition,
  type DragState,
  type DrawerTab,
  type ListStatusMenuState,
  type ProjectTopTab,
  type ProjectView,
  type TaskFormState,
  type TaskModalMode,
  type TaskModalRecord,
  type TaskModalState,
  columnBulletColor,
  boardColumnEmptyStateClasses,
  boardColumnSurfaceClasses,
  createEmptyTaskForm,
  createTaskChecklistDraft,
  createTaskFormFromTask,
  formatDueDate,
  formatReminderDateTime,
  getTagColor,
  getTagTone,
  getPriorityMeta,
  mapApiTasksToColumns,
  moveTask,
  normalizeTaskChecklistItems,
  PRIORITY_OPTIONS,
  sortColumns,
  tagToneClasses,
  taskProgressValue,
  taskStatusIndicator,
  toneSwatch,
  updateTaskDetails,
  withColumnCounts,
} from "@/components/projects/tasks-board/shared";
import {
  FilesView,
  IntegrationsView,
  NotificationsDropdown,
  NotificationsView,
  ProjectActivityPanel,
  SearchOverlay,
  type SearchOverlayResult,
  SettingsDropdown,
} from "@/components/projects/tasks-board/support-panels";
import {
  AddMemberModal,
  DiscussionsView,
  type ProjectClientContact,
  type ProjectTeamMember,
  ProjectDirectorySidebar,
  TeamMembersView,
} from "@/components/projects/tasks-board/workspace-sections";
import { normalizeProjectWorkspaceBundle } from "@/lib/project-workspace";

type UploadedFile = {
  id: string;
  name: string;
  size: string;
  status: "uploading" | "completed";
  ext: "word" | "ppt" | "pdf" | "other";
};

type DocCategory = {
  id: string;
  title: string;
  description: string;
  file: UploadedFile | null;
};

type DocumentUploadDraft = DocCategory & {
  selectedFile: File | null;
  existingFileId: string | null;
};

type ProfileIdentityState = {
  fullName?: string;
};

const PROJECT_WORKSPACE_NOTIFICATIONS_STORAGE_KEY = "planix.workspace.project-notifications";

function formatElapsedTimerLabel(startedAt: string) {
  const started = new Date(startedAt).getTime();

  if (Number.isNaN(started)) {
    return "00:00";
  }

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - started) / 1000));
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function LiveElapsedTimerText({
  startedAt,
  className,
}: {
  startedAt: string;
  className?: string;
}) {
  const [label, setLabel] = useState(() => formatElapsedTimerLabel(startedAt));

  useEffect(() => {
    const updateElapsed = () => setLabel(formatElapsedTimerLabel(startedAt));
    updateElapsed();
    const timer = window.setInterval(updateElapsed, 1000);

    return () => window.clearInterval(timer);
  }, [startedAt]);

  return <span className={className}>{label}</span>;
}

function ActiveTaskTimerPill({
  startedAt,
  className,
}: {
  startedAt: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-[#ef8c62]/16 bg-[#ef8c62]/10 px-2 py-0.5 text-[0.66rem] font-medium tabular-nums text-[#efb08d]",
        className,
      )}
    >
      <ActiveTimerDot className="h-1.5 w-1.5" />
      <LiveElapsedTimerText startedAt={startedAt} />
    </span>
  );
}
function ActiveTimerDot({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-[9px] w-[9px] shrink-0 animate-pulse rounded-full bg-[#ef8c62] shadow-[0_0_0_2.5px_rgba(239,140,98,0.14)]",
        className,
      )}
    />
  );
}

function ActiveTimerIcon() {
  return (
    <span className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#ef8c62]/20 bg-[#ef8c62]/10 text-[#efb08d] shadow-[0_0_0_3px_rgba(239,140,98,0.08)]">
      <Clock3 className="h-[15px] w-[15px]" />
      <ActiveTimerDot className="absolute -right-[1px] -top-[1px]" />
    </span>
  );
}

function TaskChecklistStateIcon({
  completed,
  className,
}: {
  completed: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex h-5 w-5 items-center justify-center rounded-full border transition",
        completed
          ? "border-[var(--accent)]/28 bg-[linear-gradient(180deg,rgba(244,194,123,0.28)_0%,rgba(251,138,116,0.14)_100%)] text-[var(--accent-strong)]"
          : "border-white/16 bg-white/[0.03] text-transparent",
        className,
      )}
    >
      {completed ? <Check className="h-3 w-3" strokeWidth={2.5} /> : null}
    </span>
  );
}

function fileExtColor(ext: UploadedFile["ext"]) {
  if (ext === "word") return "bg-[#2463c4]";
  if (ext === "ppt") return "bg-[#c33a1d]";
  if (ext === "pdf") return "bg-[#c22222]";
  return "bg-[#4a4a5a]";
}

function fileExtLabel(ext: UploadedFile["ext"]) {
  if (ext === "word") return "W";
  if (ext === "ppt") return "P";
  if (ext === "pdf") return "PDF";
  return "F";
}

function detectExt(name: string): UploadedFile["ext"] {
  const lower = name.toLowerCase();
  if (lower.endsWith(".doc") || lower.endsWith(".docx")) return "word";
  if (lower.endsWith(".ppt") || lower.endsWith(".pptx")) return "ppt";
  if (lower.endsWith(".pdf")) return "pdf";
  return "other";
}

const DOC_CATEGORIES: Omit<DocCategory, "file">[] = [
  { id: "brief", title: "Project Brief", description: "Outlining the scope, objectives, and key details." },
  { id: "invoice", title: "Client Invoice", description: "Outlines the payment terms, due date, and methods." },
  { id: "design", title: "Design Requirements", description: "Outlines user expectations, technical specifications." },
];

const LEGACY_PROJECT_DOCUMENT_ID_MAP: Record<string, string> = {
  "doc-1": "brief",
  "doc-2": "invoice",
  "doc-3": "design",
};

function normalizeProjectDocumentId(input?: Pick<ProjectDocument, "id" | "title"> | null) {
  if (!input) {
    return "";
  }

  const normalizedId = LEGACY_PROJECT_DOCUMENT_ID_MAP[input.id] ?? input.id;

  if (normalizedId && DOC_CATEGORIES.some((category) => category.id === normalizedId)) {
    return normalizedId;
  }

  const normalizedTitle = input.title.trim().toLowerCase();
  const matchedCategory = DOC_CATEGORIES.find((category) => category.title.trim().toLowerCase() === normalizedTitle);

  return matchedCategory?.id ?? "";
}

function normalizeProjectDocuments(documents?: ProjectDocument[]) {
  const mappedDocuments = new Map<string, ProjectDocument>();

  (documents ?? []).forEach((document) => {
    const normalizedId = normalizeProjectDocumentId(document);

    if (!normalizedId) {
      return;
    }

    mappedDocuments.set(normalizedId, {
      ...document,
      id: normalizedId,
    });
  });

  return DOC_CATEGORIES.map((category) => {
    const existingDocument = mappedDocuments.get(category.id);

    return {
      id: category.id,
      title: existingDocument?.title ?? category.title,
      description: existingDocument?.description ?? category.description,
      linkedFileId: existingDocument?.linkedFileId,
      fileName: existingDocument?.fileName,
      fileSize: existingDocument?.fileSize,
      mimeType: existingDocument?.mimeType,
      storageUrl: existingDocument?.storageUrl,
      updatedAt: existingDocument?.updatedAt,
      fileType: existingDocument?.fileType,
    } satisfies ProjectDocument;
  });
}

function buildProjectDocumentsFromFiles(documents: ProjectDocument[] | undefined, files: ProjectFileRecord[]) {
  return normalizeProjectDocuments(documents).map((document) => {
    const linkedFile = files.find((file) => file.documentId === document.id) ?? null;

    if (!linkedFile) {
      return {
        ...document,
        linkedFileId: undefined,
        fileName: undefined,
        fileSize: undefined,
        mimeType: undefined,
        storageUrl: undefined,
        updatedAt: undefined,
        fileType: undefined,
      } satisfies ProjectDocument;
    }

    return {
      ...document,
      linkedFileId: linkedFile.id,
      fileName: linkedFile.name,
      fileSize: formatProjectFileSize(linkedFile.sizeBytes),
      mimeType: linkedFile.mimeType,
      storageUrl: linkedFile.url,
      updatedAt: linkedFile.updatedAt,
      fileType: detectExt(linkedFile.name),
    } satisfies ProjectDocument;
  });
}

const PROJECT_TONE_SEQUENCE = ["peach", "sand", "slate", "rose", "olive"] as const;
const PROJECT_SECTION_PATCH = "border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.045)_0%,rgba(255,255,255,0.02)_100%)]";
type AssigneeOption = (typeof boardMembers)[number];

function cloneDefaultProjectDocuments(): ProjectDocument[] {
  return normalizeProjectDocuments(projectDocuments);
}

function cloneDefaultProjectGoals(): ProjectGoal[] {
  return projectGoals.map((goal) => ({ ...goal }));
}

function cloneDefaultProjectNotifications(): ProjectNotification[] {
  return [];
}

function createTaskLinkDraft(): TaskLinkRecord {
  return {
    id: `link-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    url: "",
  };
}

function createTaskCommentDraft(): TaskCommentRecord {
  return {
    id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    body: "",
  };
}

function createProjectNotification(
  input: Pick<ProjectNotification, "title" | "body" | "kind"> & Partial<ProjectNotification>,
): ProjectNotification {
  return {
    id: `pn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: input.title,
    body: input.body,
    kind: input.kind,
    time: input.time ?? "Just now",
    group: input.group ?? "earlier",
    unread: input.unread ?? true,
    initials: input.initials,
    avatarTone: input.avatarTone,
    createdAt: input.createdAt ?? new Date().toISOString(),
    targetTab: input.targetTab,
    targetTaskId: input.targetTaskId,
    targetColumnId: input.targetColumnId,
  };
}

function humanizeTaskColumnId(columnId?: string | null) {
  if (!columnId) {
    return "the board";
  }

  return columnId
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function resolveTaskColumnTitle(columns: TaskColumn[], columnId?: string | null) {
  if (!columnId) {
    return "the board";
  }

  return columns.find((column) => column.id === columnId)?.title
    ?? boardColumns.find((column) => column.id === columnId)?.title
    ?? humanizeTaskColumnId(columnId);
}

function isCompletedTaskColumn(columnId?: string | null) {
  return columnId === "completed" || columnId === "done";
}
const PROJECT_TASKS_CACHE_MAX_AGE_MS = 1000 * 60 * 10;

function getProjectTasksCacheKey(projectRef: string) {
  return `planix.cache.project-board.tasks.${projectRef}`;
}

function readProjectTasksCache(projectRef: string) {
  return readMemoryCache<TaskColumn[]>(getProjectTasksCacheKey(projectRef), PROJECT_TASKS_CACHE_MAX_AGE_MS);
}

function extractDownloadFilename(contentDisposition: string | null) {
  if (!contentDisposition) {
    return null;
  }

  const match = contentDisposition.match(/filename="?([^"]+)"?/i);

  return match?.[1] ?? null;
}

function formatProjectDisplayDate(value?: string) {
  if (!value) {
    return "Not set";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(`${value}T12:00:00`);

    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
    }
  }

  return value;
}

function buildProjectInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "NP";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function buildProjectMemberFallbackEmail(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");

  return `${slug || "member"}@planix.app`;
}

function findWorkspaceTeamById(workspaceTeams: WorkspaceTeamRecord[], teamId?: string) {
  if (!teamId) {
    return undefined;
  }

  return workspaceTeams.find((team) => team.id === teamId);
}

function findWorkspaceTeamByName(workspaceTeams: WorkspaceTeamRecord[], teamName?: string) {
  const normalizedTeamName = teamName?.trim().toLowerCase();

  if (!normalizedTeamName) {
    return undefined;
  }

  return workspaceTeams.find((team) => team.name.trim().toLowerCase() === normalizedTeamName);
}

function resolveProjectAssignmentTeam(
  workspaceTeams: WorkspaceTeamRecord[],
  assignment: NonNullable<WorkspaceProject["members"]>[number],
  member?: Pick<TeamMemberRecord, "teamId">,
) {
  const matchedTeam = findWorkspaceTeamById(workspaceTeams, assignment.teamId)
    ?? findWorkspaceTeamById(workspaceTeams, member?.teamId)
    ?? findWorkspaceTeamByName(workspaceTeams, assignment.team);

  return {
    teamId: matchedTeam?.id ?? assignment.teamId ?? member?.teamId,
    teamName: matchedTeam?.name
      ?? assignment.team?.trim()
      ?? workspaceTeams[0]?.name
      ?? DEFAULT_WORKSPACE_TEAMS[0]?.name
      ?? "Design",
  };
}

function buildProjectDescription(
  name: string,
  projectType: string,
  clientName?: string,
  startDate?: string,
  deadline?: string,
) {
  const clientContext = clientName ? ` for ${clientName}` : "";
  const timelineContext = startDate && deadline
    ? ` running from ${formatProjectDisplayDate(startDate)} to ${formatProjectDisplayDate(deadline)}`
    : startDate
      ? ` kicking off on ${formatProjectDisplayDate(startDate)}`
      : deadline
        ? ` scheduled through ${formatProjectDisplayDate(deadline)}`
        : "";

  return `"${name}" is a ${projectType.toLowerCase()} project${clientContext}${timelineContext}. The workspace is organized to keep delivery, collaboration, and execution details in one place from kickoff through handoff.`;
}

type TaskDueFilter = "all" | "dated" | "undated" | "overdue" | "upcoming";

type TaskFiltersState = {
  statusId: string;
  assigneeName: string;
  tag: string;
  dueState: TaskDueFilter;
};

const DEFAULT_TASK_FILTERS: TaskFiltersState = {
  statusId: "all",
  assigneeName: "all",
  tag: "all",
  dueState: "all",
};

function parseTaskDueDate(value?: string) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isTaskOverdue(task: BoardTask) {
  const dueDate = parseTaskDueDate(task.dueDate);

  if (!dueDate) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dueDate.getTime() < today.getTime();
}

function applyTaskFilters(columns: TaskColumn[], filters: TaskFiltersState) {
  return withColumnCounts(
    columns.map((column) => ({
      ...column,
      tasks: column.tasks.filter((task) => {
        if (filters.statusId !== "all" && column.id !== filters.statusId) {
          return false;
        }

        if (filters.assigneeName !== "all" && !task.assignees.some((assignee) => assignee.name === filters.assigneeName)) {
          return false;
        }

        if (filters.tag !== "all" && task.tag !== filters.tag) {
          return false;
        }

        if (filters.dueState === "dated") {
          return Boolean(task.dueDate);
        }

        if (filters.dueState === "undated") {
          return !task.dueDate;
        }

        if (filters.dueState === "overdue") {
          return isTaskOverdue(task);
        }

        if (filters.dueState === "upcoming") {
          return Boolean(task.dueDate) && !isTaskOverdue(task);
        }

        return true;
      }),
    })),
  );
}

const INITIAL_WORKSPACE_PROJECTS: WorkspaceProject[] = [];

const INITIAL_PROJECT_INTEGRATIONS_STORE: Record<string, Integration[]> = {};
const TOUCH_DRAG_START_DELAY_MS = 180;
const TOUCH_DRAG_CANCEL_DISTANCE_PX = 10;

type TouchDragSession = {
  pointerId: number;
  taskId: number;
  fromColumnId: string;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  started: boolean;
};

function DocumentUploadModal({
  open,
  documents,
  onClose,
  onSave,
}: {
  open: boolean;
  documents: ProjectDocument[];
  onClose: () => void;
  onSave: (documents: DocumentUploadDraft[]) => Promise<void>;
}) {
  const [categories, setCategories] = useState<DocumentUploadDraft[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setErrorMessage(null);
    setCategories(
      DOC_CATEGORIES.map((category) => {
        const existingDocument = documents.find((document) => normalizeProjectDocumentId(document) === category.id);

        return {
          ...category,
          file: existingDocument?.fileName
            ? {
                id: existingDocument.linkedFileId ?? existingDocument.id,
                name: existingDocument.fileName,
                size: existingDocument.fileSize || "Uploaded file",
                status: "completed",
                ext: existingDocument.fileType || detectExt(existingDocument.fileName),
              }
            : null,
          selectedFile: null,
          existingFileId: existingDocument?.linkedFileId ?? null,
        };
      }),
    );
  }, [documents, open]);

  if (!open) return null;

  const handleFile = (index: number, file: File) => {
    const uploaded: UploadedFile = {
      id: `${file.name}-${Date.now()}`,
      name: file.name,
      size: formatProjectFileSize(file.size),
      status: "completed",
      ext: detectExt(file.name),
    };
    setCategories((prev) => prev.map((cat, i) => (i === index ? { ...cat, file: uploaded, selectedFile: file } : cat)));
  };

  const removeFile = (index: number) =>
    setCategories((prev) => prev.map((cat, i) => (i === index ? { ...cat, file: null, selectedFile: null } : cat)));

  async function handleSave() {
    try {
      setIsSaving(true);
      setErrorMessage(null);
      await onSave(categories);
      onClose();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to save project documents.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="modal-overlay-shell">
      <div className="modal-overlay-backdrop" onClick={onClose} />

      <div className="modal-surface modal-surface-scroll max-w-[520px] border border-white/8 bg-[#18191d] p-5 shadow-2xl sm:p-8">
        {/* Close */}
        <ModalCloseButton absolute onClick={onClose} aria-label="Close document upload modal" />

        {/* Icon */}
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] border border-white/8 bg-white/5">
          <ClipboardList className="h-5 w-5 text-[var(--text-secondary)]" />
        </div>

        <h2 className="type-card-title">Upload Your Necessary Documents</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Upload files for each document category below.</p>

        {/* Category rows */}
        <div className="mt-7 space-y-3">
          {categories.map((cat, index) => (
            <div
              key={cat.id}
              className={cn(PROJECT_SECTION_PATCH, "rounded-[var(--radius-xl)] p-4")}
            >
              {/* Category header */}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-white/5">
                  <FileText className="h-4 w-4 text-[var(--text-muted)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{cat.title}</p>
                  <p className="text-xs text-[var(--text-muted)]">{cat.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => inputRefs.current[index]?.click()}
                  className="btn-base btn-secondary flex shrink-0 items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-2 text-xs font-medium text-[var(--text-primary)]"
                >
                  <ArrowUp className="h-3 w-3" />
                  Upload
                </button>
                <input
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="file"
                  className="hidden"
                  accept={PROJECT_FILE_ACCEPT_ATTRIBUTE}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(index, file);
                  }}
                />
              </div>

              {/* Uploaded file row */}
              {cat.file && (
                <div className="mt-3 flex items-center gap-3 rounded-[var(--radius-md)] border border-white/6 bg-white/[0.025] px-3 py-2.5">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[0.6rem] font-bold text-white",
                      fileExtColor(cat.file.ext),
                    )}
                  >
                    {fileExtLabel(cat.file.ext)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-[var(--text-primary)]">{cat.file.name}</p>
                    <p className="text-[0.7rem] text-[var(--text-muted)]">
                      {cat.file.size}{" "}
                      <span className={cat.file.status === "uploading" ? "text-[var(--accent)]" : ""}>
                        {cat.file.status === "uploading" ? "· Uploading..." : "· Completed"}
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="shrink-0 text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {errorMessage && (
          <div className="mt-4 rounded-[var(--radius-lg)] border border-[var(--red)]/15 bg-[var(--red)]/10 px-4 py-3 text-sm text-[var(--red)]">
            {errorMessage}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-4">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving}
            className="btn-base btn-primary flex-1 rounded-[var(--radius-lg)] py-[15px] text-sm font-semibold"
          >
            {isSaving ? "Saving..." : "Save Documents"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="btn-base btn-secondary flex-1 rounded-[var(--radius-lg)] py-[15px] text-sm font-medium text-[var(--text-primary)]"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

function ProjectOverview({
  description,
  details,
  clientName,
  clientWebsite,
  clientLogoUrl,
  documents,
  goals,
  totalTasks,
  completedTasks,
  memberCount,
  memberAvatars,
  onEditProjectDetails,
  onUploadDocuments,
  onSetupGoals,
}: {
  description: string;
  details: {
    type: string;
    startDate: string;
    deadline: string;
  };
  clientName: string;
  clientWebsite?: string;
  clientLogoUrl?: string;
  documents: ProjectDocument[];
  goals: ProjectGoal[];
  totalTasks: number;
  completedTasks: number;
  memberCount: number;
  memberAvatars: { initials: string; tone: (typeof boardMembers)[number]["tone"] }[];
  onEditProjectDetails: () => void;
  onUploadDocuments: () => void;
  onSetupGoals: () => void;
}) {
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const clientConnected = clientName !== "No client linked";

  return (
    <div className="space-y-8">
      <div className="grid gap-4 xl:grid-cols-3">
        <div className={cn(PROJECT_SECTION_PATCH, "flex h-full min-h-[148px] flex-col overflow-hidden rounded-[var(--radius-lg)] p-4")}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[12.5px] font-medium text-[var(--text-muted)]">Linked Client</p>
              <p className="mt-3 truncate text-[1.08rem] font-semibold tracking-tight text-[var(--text-primary)]">{clientName}</p>
            </div>
            <CompanyLogo
              company={clientName}
              website={clientWebsite ?? ""}
              logoUrl={clientLogoUrl}
              size="sm"
              className="h-12 w-12 rounded-[var(--radius-md)]"
            />
          </div>

          <p className="mt-auto w-full pt-6 text-[0.74rem] text-[var(--text-muted)]">
            {clientConnected ? "Workspace relationship is active" : "No client linked to this project yet"}
          </p>

        </div>

        <div className={cn(PROJECT_SECTION_PATCH, "flex h-full min-h-[148px] flex-col overflow-hidden rounded-[var(--radius-lg)] p-4")}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[12.5px] font-medium text-[var(--text-muted)]">Team Members</p>
              <p className="mt-3 text-[1.22rem] font-semibold tracking-tight text-[var(--text-primary)]">{memberCount}</p>
            </div>
            {memberAvatars.length > 0 ? (
              <AvatarCluster members={memberAvatars.slice(0, 4)} />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-white/8 bg-white/[0.05]">
                <UserRound className="h-4.5 w-4.5 text-[var(--text-secondary)]" />
              </div>
            )}
          </div>

          <p className="mt-auto w-full pt-6 text-[0.74rem] text-[var(--text-muted)]">
            {memberCount === 0 ? "No assigned collaborators yet" : `${memberCount} active collaborators on this project`}
          </p>

        </div>

        <div className={cn(PROJECT_SECTION_PATCH, "overflow-hidden rounded-[var(--radius-lg)] p-4")}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[12.5px] font-medium text-[var(--text-muted)]">Tasks Completed</p>
              <p className="mt-3 text-[1.22rem] font-semibold tracking-tight text-[var(--text-primary)]">
                {completedTasks}/{totalTasks || 0}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-white/8 bg-white/[0.05]">
              <CheckCircle2 className="h-4.5 w-4.5 text-[var(--text-secondary)]" />
            </div>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.05]">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#f4c27b_0%,#fb8a74_100%)]"
              style={{ width: `${Math.max(8, completionRate)}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-[0.72rem] text-[var(--text-muted)]">
            <span>Completion rate</span>
            <span className="font-medium text-[var(--accent)]">{completionRate}%</span>
          </div>
        </div>
      </div>

      {/* Project Information */}
      <div>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Project Information</h2>
          <button
            type="button"
            onClick={onEditProjectDetails}
            className="btn-base btn-secondary inline-flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-[0.78rem] font-medium text-[var(--text-primary)]"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit Details
          </button>
        </div>

        {/* Project Details cards */}
        <div className="mt-5">
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Info className="h-4 w-4" />
            <span>Project Details</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {(
              [
                { Icon: Box, label: "Project Type", value: details.type },
                { Icon: CalendarDays, label: "Start Date", value: details.startDate },
                { Icon: CalendarDays, label: "Deadline", value: details.deadline },
              ] as const
            ).map(({ Icon, label, value }) => (
              <div
                key={label}
                className={cn(PROJECT_SECTION_PATCH, "flex items-center gap-3 rounded-[var(--radius-lg)] p-4")}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-white/6">
                  <Icon className="h-4 w-4 text-[var(--text-secondary)]" />
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">{label}</p>
                  <p className="mt-0.5 text-sm font-semibold text-[var(--text-primary)]">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className={cn(PROJECT_SECTION_PATCH, "mt-5 rounded-[var(--radius-lg)] p-5")}>
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <ClipboardList className="h-4 w-4" />
            <span>Project Summary</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">{description}</p>
        </div>

        {/* Documents */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <FileText className="h-4 w-4" />
              <span>Documents</span>
            </div>
            <button
              type="button"
              onClick={onUploadDocuments}
              className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-white/5 text-[var(--accent)] transition hover:bg-white/8"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className={cn(PROJECT_SECTION_PATCH, "flex flex-col items-center gap-3 rounded-[var(--radius-lg)] p-5 text-center")}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] bg-white/5">
                  <FileText className="h-5 w-5 text-[var(--text-muted)]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{doc.title}</p>
                  <p className="mt-1 text-xs leading-snug text-[var(--text-muted)]">{doc.description}</p>
                  <p className="mt-2 text-[11px] font-medium text-[var(--text-secondary)]">
                    {doc.fileName ? doc.fileName : "No file uploaded"}
                  </p>
                  {doc.fileSize && (
                    <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      {doc.fileSize}
                    </p>
                  )}
                  {doc.storageUrl && (
                    <a
                      href={doc.storageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[var(--accent)] transition hover:text-[var(--accent-strong)]"
                    >
                      Open file
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Project Goals */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Crown className="h-4 w-4" />
            <span>Project Goals</span>
          </div>
          <button
            type="button"
            onClick={onSetupGoals}
            className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-white/5 text-[var(--accent)] transition hover:bg-white/8"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-3 space-y-3">
          {goals.map((goal, index) => (
            <div
              key={goal.id}
              className={cn(PROJECT_SECTION_PATCH, "flex items-start gap-4 rounded-[var(--radius-lg)] px-4 py-4")}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-semibold text-white">
                {index + 1}
              </span>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                <span className="font-semibold text-[var(--text-primary)]">{goal.title}:</span> {goal.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GoalSetupModal({
  open,
  initialGoals,
  onClose,
  onSave,
}: {
  open: boolean;
  initialGoals: ProjectGoal[];
  onClose: () => void;
  onSave: (goals: ProjectGoal[]) => void;
}) {
  const [goals, setGoals] = useState<ProjectGoal[]>([]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setGoals(initialGoals.length ? initialGoals.map((goal) => ({ ...goal })) : [{ id: `goal-${Date.now()}`, title: "", description: "" }]);
  }, [initialGoals, open]);

  if (!open) return null;

  const updateGoal = (index: number, field: keyof ProjectGoal, value: string) =>
    setGoals((prev) => prev.map((goal, goalIndex) => (goalIndex === index ? { ...goal, [field]: value } : goal)));

  const addGoal = () =>
    setGoals((prev) => [...prev, { id: `goal-${Date.now()}-${prev.length + 1}`, title: "", description: "" }]);

  function handleSave() {
    const sanitizedGoals = goals
      .map((goal, index) => ({
        ...goal,
        title: goal.title.trim(),
        description: goal.description.trim(),
        id: goal.id || `goal-${index + 1}`,
      }))
      .filter((goal) => goal.title || goal.description);

    onSave(sanitizedGoals);
    onClose();
  }

  return (
    <div className="modal-overlay-shell">
      <div className="modal-overlay-backdrop" onClick={onClose} />

      <div className="modal-surface modal-surface-scroll max-w-[520px] border border-white/8 bg-[#18191d] p-5 shadow-2xl sm:p-8">
        {/* Close */}
        <ModalCloseButton absolute onClick={onClose} aria-label="Close goal setup modal" />

        {/* Icon */}
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] border border-white/8 bg-white/5">
          <Flag className="h-5 w-5 text-[var(--text-secondary)]" />
        </div>

        <h2 className="type-card-title">Setup Your Goals</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Start create and manage your project by few clicks!</p>

        {/* Goal inputs */}
        <div className="mt-7 space-y-3">
          {goals.map((goal, index) => (
            <div key={goal.id || index} className={cn(PROJECT_SECTION_PATCH, "rounded-[var(--radius-xl)] px-5 py-4")}>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {index === 0 ? "First Goal" : `Goal ${index + 1}`}
              </p>
              <input
                type="text"
                value={goal.title}
                onChange={(e) => updateGoal(index, "title", e.target.value)}
                placeholder={index === 0 ? "Enter your first goal" : `Enter goal ${index + 1}`}
                autoFocus={index === goals.length - 1 && index > 0}
                className="mt-2 w-full border-none bg-transparent p-0 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
              />
              <textarea
                value={goal.description}
                onChange={(e) => updateGoal(index, "description", e.target.value)}
                placeholder="Add a short description or success criteria"
                className="mt-3 min-h-[78px] w-full resize-none rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.03] px-3.5 py-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addGoal}
          className="btn-base btn-secondary mt-4 inline-flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium text-[var(--text-primary)]"
        >
          <Plus className="h-4 w-4" />
          Add new goal
        </button>

        <div className="mt-6 flex gap-4">
          <button
            type="button"
            onClick={handleSave}
            className="btn-base btn-primary flex-1 rounded-[var(--radius-lg)] py-[15px] text-sm font-semibold"
          >
            Save Goals
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-base btn-secondary flex-1 rounded-[var(--radius-lg)] py-[15px] text-sm font-medium text-[var(--text-primary)]"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

type CreateProjectFormState = {
  projectName: string;
  projectType: string;
  clientId: string;
  startDate: string;
  deadline: string;
  members: { name: string; team: string; teamId?: string }[];
};

const EMPTY_CREATE_PROJECT_FORM: CreateProjectFormState = {
  projectName: "",
  projectType: "",
  clientId: "",
  startDate: "",
  deadline: "",
  members: [],
};

type EditProjectDetailsFormState = {
  projectName: string;
  projectType: string;
  clientId: string;
  startDate: string;
  deadline: string;
  description: string;
};

function EditProjectDetailsModal({
  open,
  clients,
  initialValues,
  onClose,
  onSave,
}: {
  open: boolean;
  clients: ClientRecord[];
  initialValues: EditProjectDetailsFormState;
  onClose: () => void;
  onSave: (values: EditProjectDetailsFormState) => void;
}) {
  const [projectTypes] = usePersistentState<string[]>("planix.project.types", [...PROJECT_TYPES]);
  const [form, setForm] = useState<EditProjectDetailsFormState>(initialValues);

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(initialValues);
  }, [initialValues, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  const selectedClient = clients.find((client) => client.id === form.clientId);
  const isNameValid = form.projectName.trim().length > 0;
  const isTypeValid = form.projectType.trim().length > 0;
  const hasInvalidSchedule = Boolean(form.startDate && form.deadline && form.deadline < form.startDate);
  const canSave = isNameValid && isTypeValid && !hasInvalidSchedule;

  function handleSave() {
    if (!canSave) {
      return;
    }

    onSave({
      ...form,
      projectName: form.projectName.trim(),
      projectType: form.projectType.trim(),
      description: form.description.trim(),
    });
    onClose();
  }

  return (
    <div className="modal-overlay-shell">
      <div className="modal-overlay-backdrop" onClick={onClose} />

      <div className="modal-surface modal-surface-scroll max-w-[560px] border border-white/8 bg-[#18191d] p-5 shadow-2xl sm:p-8">
        <ModalCloseButton absolute onClick={onClose} aria-label="Close edit project details modal" />

        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] border border-white/8 bg-white/5">
          <ClipboardList className="h-5 w-5 text-[var(--text-secondary)]" />
        </div>

        <h2 className="type-card-title">Edit Project Details</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Update the project overview details shown to your team.
        </p>

        <div className="mt-7 space-y-4">
          <div className={cn(PROJECT_SECTION_PATCH, "rounded-[var(--radius-xl)] px-5 py-4")}>
            <label className="block text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">Project Name</label>
            <input
              type="text"
              value={form.projectName}
              onChange={(event) => setForm((current) => ({ ...current, projectName: event.target.value }))}
              placeholder="Enter project name"
              className="mt-2.5 w-full border-none bg-transparent p-0 text-[15px] font-medium text-[var(--text-primary)] outline-none placeholder:font-normal placeholder:text-[var(--text-muted)]"
              autoFocus
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className={cn(PROJECT_SECTION_PATCH, "block rounded-[var(--radius-xl)] px-5 py-4")}>
              <span className="block text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">Project Type</span>
              <select
                value={form.projectType}
                onChange={(event) => setForm((current) => ({ ...current, projectType: event.target.value }))}
                className="mt-2.5 w-full appearance-none border-none bg-transparent p-0 text-[14px] font-medium text-[var(--text-primary)] outline-none"
              >
                <option value="" className="bg-[#1c1d21] text-[var(--text-muted)]">Select type</option>
                {projectTypes.map((type) => (
                  <option key={type} value={type} className="bg-[#1c1d21] text-[var(--text-primary)]">
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label className={cn(PROJECT_SECTION_PATCH, "block rounded-[var(--radius-xl)] px-5 py-4")}>
              <span className="block text-[12.5px] font-medium text-[var(--text-muted)]">Linked Client</span>
              <select
                value={form.clientId}
                onChange={(event) => setForm((current) => ({ ...current, clientId: event.target.value }))}
                className="mt-2.5 w-full appearance-none border-none bg-transparent p-0 text-[14px] font-medium text-[var(--text-primary)] outline-none"
              >
                <option value="" className="bg-[#1c1d21] text-[var(--text-muted)]">No client linked</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id} className="bg-[#1c1d21] text-[var(--text-primary)]">
                    {client.company}
                  </option>
                ))}
              </select>
              {selectedClient && (
                <span className="mt-2 block text-[11px] text-[var(--text-muted)]">
                  {selectedClient.contactName} · {selectedClient.contactRole}
                </span>
              )}
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className={cn(PROJECT_SECTION_PATCH, "rounded-[var(--radius-xl)] px-5 py-4")}>
              <span className="block text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">Start Date</span>
              <div className="mt-2.5">
                <DatePicker
                  value={form.startDate}
                  onChange={(value) => setForm((current) => ({ ...current, startDate: value }))}
                  placeholder="Select start date"
                  triggerClassName="text-[0.9rem]"
                  align="left"
                  direction="up"
                />
              </div>
            </div>

            <div className={cn(PROJECT_SECTION_PATCH, "rounded-[var(--radius-xl)] px-5 py-4")}>
              <span className="block text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">Deadline</span>
              <div className="mt-2.5">
                <DatePicker
                  value={form.deadline}
                  onChange={(value) => setForm((current) => ({ ...current, deadline: value }))}
                  placeholder="Select deadline"
                  triggerClassName="text-[0.9rem]"
                  align="left"
                  direction="up"
                />
              </div>
            </div>
          </div>

          <div className={cn(PROJECT_SECTION_PATCH, "rounded-[var(--radius-xl)] px-5 py-4")}>
            <label className="block text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">Project Summary</label>
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Add a concise summary for this project"
              className="mt-2.5 min-h-[120px] w-full resize-none border-none bg-transparent p-0 text-[14px] leading-6 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
            />
          </div>
        </div>

        {hasInvalidSchedule && (
          <p className="mt-4 text-[12px] text-[var(--red)]">Deadline cannot be earlier than the start date.</p>
        )}

        <div className="mt-6 flex gap-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="btn-base btn-primary flex-1 rounded-[var(--radius-lg)] py-[15px] text-sm font-semibold"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-base btn-secondary flex-1 rounded-[var(--radius-lg)] py-[15px] text-sm font-medium text-[var(--text-primary)]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateProjectModal({
  open,
  clients,
  memberOptions,
  workspaceTeams,
  onClose,
  onCreate,
}: {
  open: boolean;
  clients: ClientRecord[];
  memberOptions: TeamMemberRecord[];
  workspaceTeams: WorkspaceTeamRecord[];
  onClose: () => void;
  onCreate: (project: CreateProjectFormState) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<CreateProjectFormState>(EMPTY_CREATE_PROJECT_FORM);
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const [clientMenuOpen, setClientMenuOpen] = useState(false);
  const [memberPickerOpen, setMemberPickerOpen] = useState(false);
  const [teamMenuOpenIdx, setTeamMenuOpenIdx] = useState<number | null>(null);
  const [projectTypes] = usePersistentState<string[]>("planix.project.types", [...PROJECT_TYPES]);
  const selectedClient = clients.find((client) => client.id === form.clientId);
  const selectableMembers = memberOptions.map((member, index) => ({
    name: member.name,
    initials: member.avatarInitials || buildProjectInitials(member.name),
    tone: member.avatarTone || PROJECT_TONE_SEQUENCE[index % PROJECT_TONE_SEQUENCE.length],
  }));
  const selectedNames = form.members.map((m) => m.name);
  const isNameValid = form.projectName.trim().length > 0;
  const hasInvalidSchedule = Boolean(form.startDate && form.deadline && form.deadline < form.startDate);
  const isDetailsValid = Boolean(
    form.projectType
    && form.startDate
    && form.deadline
    && !hasInvalidSchedule,
  );

  function closeMenus() {
    setTypeMenuOpen(false);
    setClientMenuOpen(false);
    setMemberPickerOpen(false);
    setTeamMenuOpenIdx(null);
  }

  function handleClose() {
    closeMenus();
    setForm(EMPTY_CREATE_PROJECT_FORM);
    setStep(1);
    onClose();
  }

  function handleStepChange(nextStep: 1 | 2 | 3) {
    closeMenus();
    setStep(nextStep);
  }

  function handleStepBack() {
    if (step === 1) {
      return;
    }

    handleStepChange((step - 1) as 1 | 2 | 3);
  }

  function handleCreateProject() {
    if (!isDetailsValid) {
      return;
    }

    onCreate({
      ...form,
      projectName: form.projectName.trim(),
      members: form.members.map((member) => ({ ...member })),
    });
    handleClose();
  }

  function toggleMember(name: string) {
    const matchingMember = memberOptions.find((member) => member.name === name);
    const matchingTeam = findWorkspaceTeamById(workspaceTeams, matchingMember?.teamId);

    setForm((prev) => ({
      ...prev,
      members: prev.members.some((m) => m.name === name)
        ? prev.members.filter((m) => m.name !== name)
        : [
            ...prev.members,
            {
              name,
              team: matchingTeam?.name ?? "",
              teamId: matchingTeam?.id,
            },
          ],
    }));
  }

  function updateMemberTeam(index: number, teamId: string) {
    const nextTeam = findWorkspaceTeamById(workspaceTeams, teamId);

    setForm((prev) => ({
      ...prev,
      members: prev.members.map((member, memberIndex) =>
        memberIndex === index
          ? {
              ...member,
              teamId: nextTeam?.id,
              team: nextTeam?.name ?? "",
            }
          : member,
      ),
    }));
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!open) return null;

  const stepDot = (n: 1 | 2 | 3) => {
    const isPastStep = n < step;

    return (
      <button
        type="button"
        onClick={() => {
          if (isPastStep) {
            handleStepChange(n);
          }
        }}
        disabled={!isPastStep}
        className={cn(
          "flex h-[22px] w-[22px] items-center justify-center rounded-full text-[10px] font-semibold transition-colors",
          isPastStep && "cursor-pointer",
          step > n
            ? "bg-[var(--accent)] text-[#160d09]"
            : step === n
              ? "border border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
              : "border border-white/10 text-[var(--text-muted)]",
        )}
      >
        {step > n ? (
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
            <path d="M1 3L3 5L7 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : n}
      </button>
    );
  };

  return (
    <div className="modal-overlay-shell">
      <div className="modal-overlay-backdrop" onClick={handleClose} />

      <div className="modal-surface modal-surface-scroll max-w-[520px] border border-white/8 bg-[#18191d] p-5 shadow-2xl sm:p-8">
        <div className="mb-7 grid grid-cols-[32px_minmax(0,1fr)_32px] items-start gap-4">
          <button
            type="button"
            onClick={handleStepBack}
            disabled={step === 1}
            className={cn(
              "mt-0.5 flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border border-white/8 bg-white/[0.04] text-[var(--text-muted)] transition hover:bg-white/[0.08] hover:text-[var(--text-primary)]",
              step === 1 && "pointer-events-none opacity-0",
            )}
            aria-label="Go back to previous step"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="justify-self-center">
            <div className="flex items-center gap-2">
              {stepDot(1)}
              <div className={cn("h-px w-8 transition-colors", step > 1 ? "bg-[var(--accent)]/40" : "bg-white/10")} />
              {stepDot(2)}
              <div className={cn("h-px w-8 transition-colors", step > 2 ? "bg-[var(--accent)]/40" : "bg-white/10")} />
              {stepDot(3)}
            </div>
          </div>

          <ModalCloseButton onClick={handleClose} aria-label="Close create project modal" />
        </div>

        {step === 1 ? (
          <>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] border border-white/8 bg-white/5">
              <ClipboardList className="h-5 w-5 text-[var(--text-secondary)]" />
            </div>
            <h2 className="type-card-title">Create New Project</h2>

            <div className={cn(
              PROJECT_SECTION_PATCH,
              "mt-6 rounded-[var(--radius-xl)] px-5 py-4",
              !isNameValid && form.projectName.length > 0 && "border-[var(--red)]/40",
            )}>
              <label className="block text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">Project Name</label>
              <input
                type="text"
                value={form.projectName}
                onChange={(e) => setForm((prev) => ({ ...prev, projectName: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && isNameValid) {
                    handleStepChange(2);
                  }
                }}
                placeholder="e.g. Brand Refresh 2026"
                className="mt-2.5 w-full border-none bg-transparent p-0 text-[15px] font-medium text-[var(--text-primary)] outline-none placeholder:font-normal placeholder:text-[var(--text-muted)]"
                autoFocus
              />
            </div>
            <p className="mt-3 text-[12px] text-[var(--text-muted)]">Project name is required before moving to the next step.</p>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  if (isNameValid) {
                    handleStepChange(2);
                  }
                }}
                disabled={!isNameValid}
                className="btn-base btn-primary flex-1 rounded-[var(--radius-lg)] py-3 text-sm font-semibold"
              >
                Continue
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="btn-base btn-secondary flex-1 rounded-[var(--radius-lg)] py-3 text-sm font-medium text-[var(--text-primary)]"
              >
                Cancel
              </button>
            </div>
          </>

        ) : step === 2 ? (
          <>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] border border-white/8 bg-white/5">
              <Scan className="h-5 w-5 text-[var(--text-secondary)]" />
            </div>
            <h2 className="type-card-title">Project Details</h2>

            <div className={cn(PROJECT_SECTION_PATCH, "mt-6 overflow-visible rounded-[var(--radius-xl)]")}>
              {/* Project Type */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setTypeMenuOpen((p) => !p); setClientMenuOpen(false); }}
                  className="flex w-full items-center gap-3.5 px-5 py-4 text-left transition hover:bg-white/[0.045]"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-white/6">
                    <Box className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] uppercase tracking-[0.1em] text-[var(--text-muted)]">Project Type</p>
                    <p className={cn("mt-0.5 text-[13.5px] font-medium", form.projectType ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]")}>
                      {form.projectType || "Select type"}
                    </p>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 shrink-0 text-[var(--text-muted)] transition", typeMenuOpen && "rotate-180")} />
                </button>
                {typeMenuOpen && (
                  <div className="absolute left-0 top-full z-20 w-full overflow-hidden rounded-b-[var(--radius-xl)] border border-t-0 border-white/8 bg-[#1c1d21] shadow-xl">
                    {projectTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => { setForm((p) => ({ ...p, projectType: type })); setTypeMenuOpen(false); }}
                        className={cn(
                          "flex w-full border-b border-white/5 px-5 py-2.5 text-left text-[13px] last:border-b-0 transition hover:bg-white/4",
                          form.projectType === type ? "font-medium text-[var(--text-primary)]" : "text-[var(--text-secondary)]",
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mx-5 h-px bg-white/6" />

              {/* Client */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setClientMenuOpen((p) => !p); setTypeMenuOpen(false); }}
                  className="flex w-full items-center gap-3.5 px-5 py-4 text-left transition hover:bg-white/[0.045]"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-white/6">
                    <Users className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] uppercase tracking-[0.1em] text-[var(--text-muted)]">Client</p>
                    <p className={cn("mt-0.5 text-[13.5px] font-medium", selectedClient ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]")}>
                      {selectedClient ? selectedClient.company : "No client linked"}
                    </p>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 shrink-0 text-[var(--text-muted)] transition", clientMenuOpen && "rotate-180")} />
                </button>
                {clientMenuOpen && (
                  <div className="absolute left-0 top-full z-20 w-full overflow-hidden rounded-b-[var(--radius-xl)] border border-t-0 border-white/8 bg-[#1c1d21] shadow-xl">
                    <button
                      type="button"
                      onClick={() => { setForm((p) => ({ ...p, clientId: "" })); setClientMenuOpen(false); }}
                      className={cn(
                        "flex w-full flex-col border-b border-white/5 px-5 py-3 text-left transition hover:bg-white/4",
                        !form.clientId ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]",
                      )}
                    >
                      <span className="text-[13px] font-medium">No client linked</span>
                      <span className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                        Create the project first and attach a client later
                      </span>
                    </button>
                    {clients.map((client) => (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => { setForm((p) => ({ ...p, clientId: client.id })); setClientMenuOpen(false); }}
                        className={cn(
                          "flex w-full flex-col border-b border-white/5 px-5 py-3 text-left last:border-b-0 transition hover:bg-white/4",
                          form.clientId === client.id ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]",
                        )}
                      >
                        <span className="text-[13px] font-medium">{client.company}</span>
                        <span className="mt-0.5 text-[11px] text-[var(--text-muted)]">{client.contactName} · {client.contactRole}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mx-5 h-px bg-white/6" />

              {/* Start Date */}
              <DatePicker
                value={form.startDate}
                onChange={(v) => setForm((p) => ({ ...p, startDate: v }))}
                variant="row"
                rowLabel="Start Date"
                placeholder="Select"
                icon={CalendarDays}
                align="left"
                direction="up"
                triggerClassName={cn("w-full", hasInvalidSchedule && "bg-[var(--red)]/[0.04]")}
              />

              <div className="mx-5 h-px bg-white/6" />

              {/* Deadline */}
              <DatePicker
                value={form.deadline}
                onChange={(v) => setForm((p) => ({ ...p, deadline: v }))}
                variant="row"
                rowLabel="Deadline"
                placeholder="Select"
                icon={Clock3}
                align="left"
                direction="up"
                triggerClassName={cn("w-full", hasInvalidSchedule && "bg-[var(--red)]/[0.04]")}
              />
            </div>
            <p className={cn(
              "mt-3 text-[12px]",
              hasInvalidSchedule ? "text-[var(--red)]" : "text-[var(--text-muted)]",
            )}>
              {hasInvalidSchedule
                ? "Deadline must be the same day as or later than the start date."
                : "Project type, start date, and deadline are required. Linking a client is optional."}
            </p>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  if (isDetailsValid) {
                    handleStepChange(3);
                  }
                }}
                disabled={!isDetailsValid}
                className="btn-base btn-primary flex-1 rounded-[var(--radius-lg)] py-3 text-sm font-semibold"
              >
                Continue
              </button>
              <button
                type="button"
                onClick={() => handleStepChange(1)}
                className="btn-base btn-secondary flex-1 rounded-[var(--radius-lg)] py-3 text-sm font-medium text-[var(--text-primary)]"
              >
                Back
              </button>
            </div>
          </>

        ) : (
          <>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] border border-white/8 bg-white/5">
              <UserRound className="h-5 w-5 text-[var(--text-secondary)]" />
            </div>
            <h2 className="type-card-title">Add Team Members</h2>

            {/* Member picker trigger */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => { setMemberPickerOpen((p) => !p); setTeamMenuOpenIdx(null); }}
                  className={cn(PROJECT_SECTION_PATCH, "flex w-full items-center justify-between gap-3 rounded-[var(--radius-xl)] px-5 py-3.5 text-left transition hover:bg-white/[0.045]")}
              >
                <div className="flex min-w-0 items-center gap-3">
                  {form.members.length > 0 ? (
                    <>
                      <AvatarCluster members={selectableMembers.filter((member) => selectedNames.includes(member.name)).slice(0, 3)} />
                      <span className="truncate text-[13.5px] font-medium text-[var(--text-primary)]">
                        {form.members.length === 1 ? form.members[0].name : `${form.members.length} members selected`}
                      </span>
                    </>
                  ) : (
                    <span className="text-[13.5px] text-[var(--text-secondary)]">Select members</span>
                  )}
                </div>
                <ChevronDown className={cn("h-4 w-4 shrink-0 text-[var(--text-muted)] transition", memberPickerOpen && "rotate-180")} />
              </button>

              {memberPickerOpen && (
                <div className="mt-2 max-h-[260px] w-full overflow-y-auto rounded-[var(--radius-xl)] border border-white/10 bg-[#202126] p-3 shadow-2xl">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Workspace Members</span>
                    <button type="button" onClick={() => setMemberPickerOpen(false)}>
                      <X className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                    </button>
                  </div>
                  <div className="space-y-0.5">
                    {selectableMembers.length > 0 ? selectableMembers.map((member) => {
                      const isSelected = selectedNames.includes(member.name);
                      return (
                        <button
                          key={member.name}
                          type="button"
                          onClick={() => toggleMember(member.name)}
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-[12px] px-2.5 py-2 text-left transition hover:bg-white/5",
                            isSelected ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]",
                          )}
                        >
                          <Avatar initials={member.initials} tone={member.tone} size="sm" />
                          <span className="flex-1 text-[13.5px]">{member.name}</span>
                          {isSelected && (
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[#160d09]">
                              <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                                <path d="M1 3L3 5L7 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </span>
                          )}
                        </button>
                      );
                    }) : (
                      <div className="rounded-[12px] border border-dashed border-white/8 px-3 py-4 text-[12px] text-[var(--text-muted)]">
                        No workspace members yet. Create the project first and invite teammates later.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Selected members — team assignment */}
            {form.members.length > 0 && (
              <div className="mt-3 space-y-2">
                {form.members.map((member, index) => {
                  const bm = selectableMembers.find((candidate) => candidate.name === member.name);
                  return (
                    <div key={member.name} className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-white/6 bg-white/[0.02] px-3.5 py-2.5">
                      {bm && <Avatar initials={bm.initials} tone={bm.tone} size="sm" />}
                      <span className="flex-1 truncate text-[13px] font-medium text-[var(--text-primary)]">{member.name}</span>

                      <select
                        value={member.teamId ?? findWorkspaceTeamByName(workspaceTeams, member.team)?.id ?? ""}
                        onChange={(event) => updateMemberTeam(index, event.target.value)}
                        onClick={() => setMemberPickerOpen(false)}
                        className={cn(
                          "w-[132px] rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-[11.5px] outline-none transition",
                          member.team ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]",
                        )}
                      >
                        <option value="" className="bg-[#202126] text-[var(--text-muted)]">Team</option>
                        {workspaceTeams.map((team) => (
                          <option key={team.id} value={team.id} className="bg-[#202126] text-[var(--text-primary)]">
                            {team.name}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => toggleMember(member.name)}
                        className="shrink-0 text-[var(--text-muted)] transition hover:text-[var(--red)]"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <p className="mt-3 text-[12px] text-[var(--text-muted)]">This step is optional. You can come back later and invite members from the workspace.</p>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={handleCreateProject}
                className="btn-base btn-primary flex-1 rounded-[var(--radius-lg)] py-3 text-sm font-semibold"
              >
                Create Project
              </button>
              <button
                type="button"
                onClick={() => handleStepChange(2)}
                className="btn-base btn-secondary flex-1 rounded-[var(--radius-lg)] py-3 text-sm font-medium text-[var(--text-primary)]"
              >
                Back
              </button>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="mt-3 w-full text-center text-[13px] text-[var(--text-muted)] transition hover:text-[var(--text-secondary)]"
            >
              Skip for now
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function TaskPreview({ type }: { type: "landing" | "wireframe" }) {
  if (type === "landing") {
    return (
      <div className="mb-4 overflow-hidden rounded-[var(--radius-lg)] border border-[#2c8b7b]/40 bg-[#1f8c78] p-2">
        <div className="rounded-[var(--radius-md)] bg-[#f4f1ec] p-3">
          <div className="grid grid-cols-[1fr_92px] gap-3">
            <div className="space-y-2">
              <div className="h-2.5 w-14 rounded-full bg-[#101010]/12" />
              <div className="h-4 w-full rounded-full bg-[#101010]/14" />
              <div className="h-4 w-11/12 rounded-full bg-[#101010]/14" />
              <div className="h-2.5 w-20 rounded-full bg-[#101010]/12" />
            </div>
            <div className="rounded-2xl bg-[radial-gradient(circle_at_35%_25%,#ffffff,#d9dfe3_44%,#acb5ba_70%,#81898e)]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 overflow-hidden rounded-[var(--radius-lg)] border border-white/8 bg-[#dbe8ff] p-2.5">
      <div className="relative h-[110px] rounded-[var(--radius-md)] bg-[linear-gradient(180deg,#fcfcfc,#e6ecf7)]">
        <div className="absolute left-4 top-5 h-[70px] w-[56px] rounded-md border border-[#212937]/15 bg-white/90" />
        <div className="absolute left-[86px] top-4 h-[82px] w-[106px] rounded-lg border border-[#212937]/12 bg-white/70" />
        <div className="absolute right-4 top-5 h-[64px] w-[74px] rotate-6 rounded-lg border border-[#212937]/10 bg-white/60" />
      </div>
    </div>
  );
}

function TagSelect({
  value,
  tags,
  onChange,
  variant = "default",
}: {
  value: string;
  tags: TagDefinition[];
  onChange: (v: string) => void;
  variant?: "default" | "minimal";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const tagColor = getTagColor(value, tags);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (variant === "minimal") {
    return (
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-2 border-b border-white/8 pb-2.5 text-left transition hover:border-white/14"
        >
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: tagColor }} />
          <span className="flex-1 text-[0.86rem] text-[var(--text-primary)]">{value}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
        </button>
        {open && (
          <div className="absolute left-0 right-0 top-full z-30 mt-1.5 rounded-[var(--radius-lg)] border border-white/10 bg-[#202126] p-1.5 shadow-2xl">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => { onChange(tag.label); setOpen(false); }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2 text-left text-[0.84rem] transition",
                  tag.label === value ? "bg-white/[0.06] text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]",
                )}
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: tag.color }} />
                {tag.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 rounded-[14px] border border-[#f2d1b6]/10 bg-[#181518] px-3.5 py-3 text-left transition hover:border-white/12 hover:bg-[#1b1718]"
      >
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: tagColor }} />
        <span className="flex-1 text-[0.86rem] font-medium text-[var(--text-primary)]">{value || "Select tag"}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1.5 rounded-[var(--radius-lg)] border border-white/10 bg-[#202126] p-1.5 shadow-2xl">
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => { onChange(tag.label); setOpen(false); }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2 text-left text-[0.84rem] transition",
                tag.label === value ? "bg-white/[0.06] text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]",
              )}
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: tag.color }} />
              {tag.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TaskCard({
  task,
  columnId,
  isTimerActive,
  isDragging,
  showDropIndicatorBefore,
  showDropIndicatorAfter,
  dragEnabled,
  tags,
  onOpenTask,
  onOpenTaskSettings,
  onOpenAddSubtask,
  onToggleChecklistItem,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onPointerDown,
}: {
  task: BoardTask;
  columnId: string;
  isTimerActive: boolean;
  isDragging: boolean;
  showDropIndicatorBefore: boolean;
  showDropIndicatorAfter: boolean;
  dragEnabled: boolean;
  tags: TagDefinition[];
  onOpenTask: () => void;
  onOpenTaskSettings: () => void;
  onOpenAddSubtask: () => void;
  onToggleChecklistItem: (checklistItemId: string) => void;
  onDragStart: (event: ReactDragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
  onDragOver: (event: ReactDragEvent<HTMLElement>) => void;
  onDrop: (event: ReactDragEvent<HTMLElement>) => void;
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
}) {
  const resourceStats = [
    { label: "Links", value: String(task.links).padStart(2, "0"), icon: ExternalLink, strokeWidth: 1.9 },
    { label: "Files", value: String(task.attachments).padStart(2, "0"), icon: Paperclip, strokeWidth: 1.9 },
    { label: "Comments", value: String(task.comments).padStart(2, "0"), icon: MessagesSquare, strokeWidth: 1.8 },
  ] as const;

  return (
    <article
      data-board-task-column={columnId}
      data-board-task-id={task.id}
      draggable={dragEnabled}
      onClick={onOpenTask}
      onPointerDown={onPointerDown}
      onDragStart={(event) => {
        if (!dragEnabled) {
          event.preventDefault();
          return;
        }

        onDragStart(event);
      }}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-lg)] border p-4 shadow-[0_18px_40px_rgba(0,0,0,0.26),inset_0_1px_0_rgba(255,255,255,0.05)] transition duration-200",
        columnId === "open" && "border-[#8bb7ff]/22 bg-[linear-gradient(180deg,rgba(139,183,255,0.28)_0%,rgba(54,65,87,0.98)_16%,rgba(24,28,36,1)_100%)] hover:border-[#8bb7ff]/34 hover:shadow-[0_26px_58px_rgba(0,0,0,0.34),0_0_0_1px_rgba(139,183,255,0.12),inset_0_1px_0_rgba(255,255,255,0.08)]",
        columnId === "progress" && "border-[#fb8a74]/22 bg-[linear-gradient(180deg,rgba(251,138,116,0.28)_0%,rgba(66,42,39,0.98)_16%,rgba(29,23,24,1)_100%)] hover:border-[#fb8a74]/34 hover:shadow-[0_26px_58px_rgba(0,0,0,0.34),0_0_0_1px_rgba(251,138,116,0.12),inset_0_1px_0_rgba(255,255,255,0.08)]",
        columnId === "review" && "border-[#f0c36c]/22 bg-[linear-gradient(180deg,rgba(240,195,108,0.28)_0%,rgba(70,56,36,0.98)_16%,rgba(31,26,21,1)_100%)] hover:border-[#f0c36c]/34 hover:shadow-[0_26px_58px_rgba(0,0,0,0.34),0_0_0_1px_rgba(240,195,108,0.12),inset_0_1px_0_rgba(255,255,255,0.08)]",
        columnId === "completed" && "border-[#65d38c]/22 bg-[linear-gradient(180deg,rgba(101,211,140,0.28)_0%,rgba(36,60,43,0.98)_16%,rgba(20,28,23,1)_100%)] hover:border-[#65d38c]/34 hover:shadow-[0_26px_58px_rgba(0,0,0,0.34),0_0_0_1px_rgba(101,211,140,0.12),inset_0_1px_0_rgba(255,255,255,0.08)]",
        !["open", "progress", "review", "completed"].includes(columnId) && "border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.14)_0%,rgba(38,41,48,0.98)_16%,rgba(20,22,26,1)_100%)] hover:border-white/20 hover:shadow-[0_26px_58px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.08)]",
        dragEnabled ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
        dragEnabled && "touch-manipulation",
        isDragging && "opacity-45",
      )}
    >
      {showDropIndicatorBefore ? (
        <div className="pointer-events-none absolute -top-2 left-3 right-3 z-20">
          <span className="block h-[2px] w-full rounded-full bg-[var(--accent)] shadow-[0_0_18px_rgba(251,138,116,0.28)]" />
        </div>
      ) : null}

      {showDropIndicatorAfter ? (
        <div className="pointer-events-none absolute -bottom-2 left-3 right-3 z-20">
          <span className="block h-[2px] w-full rounded-full bg-[var(--accent)] shadow-[0_0_18px_rgba(251,138,116,0.28)]" />
        </div>
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <span
          className="rounded-full px-2.5 py-1 text-xs font-medium"
          style={{ backgroundColor: `${getTagColor(task.tag, tags)}1a`, color: getTagColor(task.tag, tags) }}
        >
          {task.tag}
        </span>
        <div className="flex items-center gap-2">
          {isTimerActive ? <ActiveTimerIcon /> : null}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onOpenTaskSettings();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-white/8 bg-white/[0.03] text-[var(--text-secondary)] transition hover:bg-white/[0.06] hover:text-[var(--text-primary)]"
            title={`Open ${task.title} settings`}
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4">
        {task.preview && <TaskPreview type={task.preview} />}

        {task.dueLabel && (
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-[var(--red)]">
            <Clock3 className="h-3.5 w-3.5" />
            {task.dueLabel}
          </div>
        )}

        <h3 className="max-w-[24ch] text-[1.02rem] font-medium leading-6 text-[var(--text-primary)]">
          {task.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-5 text-[var(--text-muted)]">{task.description}</p>
      </div>

      {task.checklist.length > 0 && (
        <div className="mt-4 space-y-2 text-sm text-[var(--text-secondary)]">
          {task.checklist.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onToggleChecklistItem(item.id);
              }}
              className="flex w-full items-center gap-2 rounded-[12px] px-1.5 py-1 text-left transition hover:bg-white/[0.05]"
            >
              <TaskChecklistStateIcon completed={item.completed} className="h-4 w-4 shrink-0" />
              <span className={cn("truncate", item.completed && "text-[var(--text-muted)] line-through")}>
                {item.title}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onOpenAddSubtask();
          }}
          className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-white/8 bg-white/[0.03] text-[var(--text-secondary)] transition hover:bg-white/[0.06] hover:text-[var(--text-primary)]"
          title={`Add subtask to ${task.title}`}
        >
          <Plus className="h-4 w-4" />
        </button>
        <span className="text-[0.74rem] text-[var(--text-muted)]">Add subtask</span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/6 pt-4">
        <AvatarCluster members={task.assignees} />
        <div className="flex items-center gap-2 text-[0.7rem] font-medium text-[var(--text-muted)]">
          {resourceStats.map(({ label, value, icon: Icon, strokeWidth }) => (
            <span
              key={label}
              className="inline-flex h-6 items-center gap-1.5 rounded-[9px] border border-white/10 bg-white/[0.025] px-2 text-[var(--text-secondary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
            >
              <span className="flex items-center justify-center">
                <Icon className="h-3.5 w-3.5" strokeWidth={strokeWidth} />
              </span>
              <span className="tabular-nums text-[0.68rem]">{value}</span>
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function SortMenu({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="absolute right-0 top-[58px] z-30 w-[226px] rounded-[var(--radius-lg)] border border-white/6 bg-[#1a1b1e] p-3">
      <div className="mb-3 flex items-center justify-between px-2 py-1">
        <span className="text-sm font-medium text-[var(--text-primary)]">Sort By</span>
        <X className="h-4 w-4 text-[var(--text-secondary)]" />
      </div>

      <div className="mb-3 flex h-11 items-center gap-3 rounded-[var(--radius-md)] bg-white/5 px-4 text-sm text-[var(--text-muted)]">
        <Search className="h-4 w-4" />
        Search for a project
      </div>

      <div className="space-y-1">
        {sortOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={cn(
              "flex w-full items-center justify-between rounded-[var(--radius-md)] px-3 py-3 text-sm transition hover:bg-white/5",
              selected === option ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]",
            )}
          >
            {option}
            <ChevronRight className="h-4 w-4" />
          </button>
        ))}
      </div>
    </div>
  );
}

function FilterMenu({
  filters,
  statusOptions,
  assigneeOptions,
  tagOptions,
  onChange,
  onClear,
}: {
  filters: TaskFiltersState;
  statusOptions: TaskColumn[];
  assigneeOptions: typeof boardMembers;
  tagOptions: TagDefinition[];
  onChange: (patch: Partial<TaskFiltersState>) => void;
  onClear: () => void;
}) {
  return (
    <div className="absolute right-0 top-[58px] z-30 w-[280px] rounded-[var(--radius-lg)] border border-white/6 bg-[#1a1b1e] p-4 shadow-[0_20px_48px_rgba(0,0,0,0.42)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">Filter Tasks</p>
          <p className="mt-1 text-[0.72rem] text-[var(--text-muted)]">Refine the current project board.</p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-[0.72rem] font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
        >
          Clear
        </button>
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="mb-1.5 block text-[0.68rem] font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">Status</span>
          <select
            value={filters.statusId}
            onChange={(event) => onChange({ statusId: event.target.value })}
            className="w-full rounded-[var(--radius-md)] border border-white/8 bg-white/[0.04] px-3 py-2.5 text-[0.84rem] text-[var(--text-primary)] outline-none"
          >
            <option value="all">All statuses</option>
            {statusOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.title}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[0.68rem] font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">Assignee</span>
          <select
            value={filters.assigneeName}
            onChange={(event) => onChange({ assigneeName: event.target.value })}
            className="w-full rounded-[var(--radius-md)] border border-white/8 bg-white/[0.04] px-3 py-2.5 text-[0.84rem] text-[var(--text-primary)] outline-none"
          >
            <option value="all">All assignees</option>
            {assigneeOptions.map((option) => (
              <option key={option.name} value={option.name}>
                {option.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[0.68rem] font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">Tag</span>
          <select
            value={filters.tag}
            onChange={(event) => onChange({ tag: event.target.value })}
            className="w-full rounded-[var(--radius-md)] border border-white/8 bg-white/[0.04] px-3 py-2.5 text-[0.84rem] text-[var(--text-primary)] outline-none"
          >
            <option value="all">All tags</option>
            {tagOptions.map((option) => (
              <option key={option.id} value={option.label}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[0.68rem] font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">Due Date</span>
          <select
            value={filters.dueState}
            onChange={(event) => onChange({ dueState: event.target.value as TaskDueFilter })}
            className="w-full rounded-[var(--radius-md)] border border-white/8 bg-white/[0.04] px-3 py-2.5 text-[0.84rem] text-[var(--text-primary)] outline-none"
          >
            <option value="all">All tasks</option>
            <option value="dated">With due date</option>
            <option value="undated">Without due date</option>
            <option value="upcoming">Upcoming</option>
            <option value="overdue">Overdue</option>
          </select>
        </label>
      </div>
    </div>
  );
}

function TaskChecklistEditor({
  title,
  description,
  addLabel,
  emptyLabel,
  items,
  onAdd,
  onChange,
  onToggleComplete,
  onRemove,
}: {
  title: string;
  description?: string;
  addLabel: string;
  emptyLabel: string;
  items: TaskChecklistItem[];
  onAdd: () => void;
  onChange: (index: number, value: string) => void;
  onToggleComplete: (index: number) => void;
  onRemove: (index: number) => void;
}) {
  const completedCount = items.filter((item) => item.completed).length;

  return (
    <section className="rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 text-[0.96rem] font-semibold text-[var(--text-primary)]">
            <span className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-white/[0.04] text-[var(--accent)]">
              <ClipboardList className="h-4 w-4" />
            </span>
            {title}
          </p>
          {description ? <p className="mt-1 text-[0.74rem] text-[var(--text-muted)]">{description}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[0.68rem] text-[var(--text-muted)]">
            {completedCount}/{items.length} done
          </span>
          <button
            type="button"
            onClick={onAdd}
            className="btn-base btn-secondary inline-flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-1.5 text-[0.78rem] font-medium"
          >
            <Plus className="h-3.5 w-3.5" />
            {addLabel}
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center gap-2 rounded-[16px] border border-white/8 bg-white/[0.02] p-2"
          >
            <button
              type="button"
              onClick={() => onToggleComplete(index)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] bg-transparent transition hover:bg-white/[0.04]"
              aria-label={item.completed ? `Mark checklist item ${index + 1} as incomplete` : `Mark checklist item ${index + 1} as complete`}
            >
              <TaskChecklistStateIcon completed={item.completed} />
            </button>
            <input
              value={item.title}
              onChange={(event) => onChange(index, event.target.value)}
              placeholder={`Checklist item ${index + 1}`}
              className={cn(
                "w-full border-none bg-transparent px-1 py-1.5 text-[0.84rem] outline-none placeholder:text-[var(--text-muted)]",
                item.completed ? "text-[var(--text-muted)] line-through" : "text-[var(--text-primary)]",
              )}
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="btn-base btn-secondary h-9 w-9 shrink-0 rounded-[12px] p-0 text-[var(--text-secondary)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <div className="rounded-[16px] border border-dashed border-white/10 px-3.5 py-3 text-[0.76rem] text-[var(--text-muted)]">
            {emptyLabel}
          </div>
        )}
      </div>
    </section>
  );
}

function TaskTextListEditor({
  title,
  description,
  addLabel,
  emptyLabel,
  inputLabel,
  icon: Icon,
  items,
  onAdd,
  onChange,
  onRemove,
}: {
  title: string;
  description?: string;
  addLabel: string;
  emptyLabel: string;
  inputLabel: string;
  icon?: typeof ClipboardList;
  items: string[];
  onAdd: () => void;
  onChange: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <section className="rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 text-[0.96rem] font-semibold text-[var(--text-primary)]">
            {Icon ? (
              <span className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-white/[0.04] text-[var(--accent)]">
                <Icon className="h-4 w-4" />
              </span>
            ) : null}
            {title}
          </p>
          {description ? (
            <p className="mt-1 text-[0.74rem] text-[var(--text-muted)]">{description}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="btn-base btn-secondary inline-flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-1.5 text-[0.78rem] font-medium"
        >
          <Plus className="h-3.5 w-3.5" />
          {addLabel}
        </button>
      </div>

      <div className="mt-4 space-y-2.5">
        {items.map((item, index) => (
          <div
            key={`${inputLabel}-${index}`}
            className="flex items-center gap-2 rounded-[16px] border border-white/8 bg-white/[0.02] p-2"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] bg-white/[0.04] text-[0.74rem] font-medium text-[var(--text-secondary)]">
              {index + 1}
            </div>
            <input
              value={item}
              onChange={(event) => onChange(index, event.target.value)}
              placeholder={`${inputLabel} ${index + 1}`}
              className="w-full border-none bg-transparent px-1 py-1.5 text-[0.84rem] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="btn-base btn-secondary h-9 w-9 shrink-0 rounded-[12px] p-0 text-[var(--text-secondary)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <div className="rounded-[16px] border border-dashed border-white/10 px-3.5 py-3 text-[0.76rem] text-[var(--text-muted)]">
            {emptyLabel}
          </div>
        )}
      </div>
    </section>
  );
}

function TaskChecklistDisplay({
  title,
  description,
  items,
  emptyLabel,
  onToggle,
}: {
  title: string;
  description: string;
  items: TaskChecklistItem[];
  emptyLabel: string;
  onToggle?: (id: string) => void;
}) {
  const completedCount = items.filter((item) => item.completed).length;

  return (
    <section className="rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 text-[0.98rem] font-semibold text-[var(--text-primary)]">
            <span className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-white/[0.04] text-[var(--accent)]">
              <ClipboardList className="h-4 w-4" />
            </span>
            {title}
          </p>
          <p className="mt-1 text-[0.76rem] text-[var(--text-muted)]">{description}</p>
        </div>
        <span className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[0.68rem] text-[var(--text-muted)]">
          {completedCount}/{items.length} done
        </span>
      </div>

      <div className="mt-4 space-y-2.5">
        {items.length > 0 ? (
          items.map((item) => {
            const content = (
              <>
                <TaskChecklistStateIcon completed={item.completed} />
                <span
                  className={cn(
                    "flex-1 text-left text-[0.84rem]",
                    item.completed ? "text-[var(--text-muted)] line-through" : "text-[var(--text-secondary)]",
                  )}
                >
                  {item.title}
                </span>
              </>
            );

            if (onToggle) {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onToggle(item.id)}
                  className="flex w-full items-center gap-3 rounded-[16px] border border-white/8 bg-white/[0.02] px-3.5 py-3 text-left transition hover:border-white/12 hover:bg-white/[0.03]"
                >
                  {content}
                </button>
              );
            }

            return (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-[16px] border border-white/8 bg-white/[0.02] px-3.5 py-3"
              >
                {content}
              </div>
            );
          })
        ) : (
          <div className="rounded-[16px] border border-dashed border-white/10 px-3.5 py-3 text-[0.76rem] text-[var(--text-muted)]">
            {emptyLabel}
          </div>
        )}
      </div>
    </section>
  );
}

function TaskTextListDisplay({
  title,
  description,
  icon: Icon,
  items,
  emptyLabel,
}: {
  title: string;
  description: string;
  icon?: typeof ClipboardList;
  items: string[];
  emptyLabel: string;
}) {
  return (
    <section className="rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 text-[0.98rem] font-semibold text-[var(--text-primary)]">
            {Icon ? (
              <span className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-white/[0.04] text-[var(--accent)]">
                <Icon className="h-4 w-4" />
              </span>
            ) : null}
            {title}
          </p>
          <p className="mt-1 text-[0.76rem] text-[var(--text-muted)]">{description}</p>
        </div>
        <span className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[0.68rem] text-[var(--text-muted)]">
          {String(items.length).padStart(2, "0")} items
        </span>
      </div>

      <div className="mt-4 space-y-2.5">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div
              key={`${title}-${index}`}
              className="flex items-center gap-3 rounded-[16px] border border-white/8 bg-white/[0.02] px-3.5 py-3"
            >
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-[0.72rem] font-medium text-[var(--text-secondary)]">
                {index + 1}
              </span>
              <span className="text-[0.84rem] text-[var(--text-secondary)]">{item}</span>
            </div>
          ))
        ) : (
          <div className="rounded-[16px] border border-dashed border-white/10 px-3.5 py-3 text-[0.76rem] text-[var(--text-muted)]">
            {emptyLabel}
          </div>
        )}
      </div>
    </section>
  );
}

function TaskLinksDisplay({ items }: { items: TaskLinkRecord[] }) {
  return (
    <section className="rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 text-[0.98rem] font-semibold text-[var(--text-primary)]">
            <span className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-white/[0.04] text-[var(--accent)]">
              <Link2 className="h-4 w-4" />
            </span>
            Links
          </p>
        </div>
        <span className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[0.68rem] text-[var(--text-muted)]">
          {String(items.length).padStart(2, "0")} items
        </span>
      </div>

      <div className="mt-4 space-y-2.5">
        {items.length > 0 ? (
          items.map((item, index) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-[16px] border border-white/8 bg-white/[0.02] px-3.5 py-3 text-[0.84rem] text-[var(--text-secondary)] transition hover:border-white/12 hover:text-[var(--text-primary)]"
            >
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-[0.72rem] font-medium text-[var(--text-secondary)]">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 truncate">{item.url}</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
            </a>
          ))
        ) : (
          <div className="rounded-[16px] border border-dashed border-white/10 px-3.5 py-3 text-[0.76rem] text-[var(--text-muted)]">
            No links added for this task yet.
          </div>
        )}
      </div>
    </section>
  );
}

function TaskCommentsDisplay({ items }: { items: TaskCommentRecord[] }) {
  return (
    <section className="rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 text-[0.98rem] font-semibold text-[var(--text-primary)]">
            <span className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-white/[0.04] text-[var(--accent)]">
              <MessageSquareMore className="h-4 w-4" />
            </span>
            Comments
          </p>
        </div>
        <span className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[0.68rem] text-[var(--text-muted)]">
          {String(items.length).padStart(2, "0")} items
        </span>
      </div>

      <div className="mt-4 space-y-2.5">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div
              key={item.id}
              className="rounded-[16px] border border-white/8 bg-white/[0.02] px-3.5 py-3"
            >
              <div className="mb-2 flex items-center gap-2 text-[0.72rem] text-[var(--text-muted)]">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] font-medium">
                  {index + 1}
                </span>
                Comment
              </div>
              <p className="text-[0.82rem] leading-[1.55] text-[var(--text-secondary)]">{item.body}</p>
            </div>
          ))
        ) : (
          <div className="rounded-[16px] border border-dashed border-white/10 px-3.5 py-3 text-[0.76rem] text-[var(--text-muted)]">
            No comments added for this task yet.
          </div>
        )}
      </div>
    </section>
  );
}

function TaskFilesDisplay({ files }: { files: ProjectFileRecord[] }) {
  return (
    <section className="rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 text-[0.98rem] font-semibold text-[var(--text-primary)]">
            <span className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-white/[0.04] text-[var(--accent)]">
              <FileText className="h-4 w-4" />
            </span>
            Files
          </p>
        </div>
        <span className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[0.68rem] text-[var(--text-muted)]">
          {String(files.length).padStart(2, "0")} items
        </span>
      </div>

      <div className="mt-4 space-y-2.5">
        {files.length > 0 ? (
          files.map((file) => (
            <a
              key={file.id}
              href={file.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-[16px] border border-white/8 bg-white/[0.02] px-3.5 py-3 text-[0.84rem] text-[var(--text-secondary)] transition hover:border-white/12 hover:text-[var(--text-primary)]"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-white/[0.05] text-[var(--accent)]">
                <FileText className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate">{file.name}</span>
                <span className="mt-0.5 block text-[0.72rem] text-[var(--text-muted)]">{formatProjectFileSize(file.sizeBytes)}</span>
              </span>
              <Download className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
            </a>
          ))
        ) : (
          <div className="rounded-[16px] border border-dashed border-white/10 px-3.5 py-3 text-[0.76rem] text-[var(--text-muted)]">
            No files linked to this task yet.
          </div>
        )}
      </div>
    </section>
  );
}

function CreateTaskDrawer({
  open,
  form,
  columns,
  activeTab,
  assigneeOptions,
  assigneeMenuOpen,
  onClose,
  onTabChange,
  onTitleChange,
  onDescriptionChange,
  onDueDateChange,
  onReminderDateChange,
  onStatusChange,
  onTagChange,
  onPriorityChange,
  onToggleAssigneeMenu,
  onSelectAssignee,
  onAddSubtask,
  onSubtaskChange,
  onToggleSubtaskComplete,
  onRemoveSubtask,
  onAddNote,
  onNoteChange,
  onRemoveNote,
  onCreateTask,
  tags,
}: {
  open: boolean;
  form: TaskFormState;
  columns: TaskColumn[];
  tags: TagDefinition[];
  activeTab: DrawerTab;
  assigneeOptions: AssigneeOption[];
  assigneeMenuOpen: boolean;
  onClose: () => void;
  onTabChange: (tab: DrawerTab) => void;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDueDateChange: (value: string) => void;
  onReminderDateChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onTagChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onToggleAssigneeMenu: () => void;
  onSelectAssignee: (name: string) => void;
  onAddSubtask: () => void;
  onSubtaskChange: (index: number, value: string) => void;
  onToggleSubtaskComplete: (index: number) => void;
  onRemoveSubtask: (index: number) => void;
  onAddNote: () => void;
  onNoteChange: (index: number, value: string) => void;
  onRemoveNote: (index: number) => void;
  onCreateTask: () => void;
}) {
  const selectedAssignees = assigneeOptions.filter((member) => form.assignedTo.includes(member.name));
  const [assigneeQuery, setAssigneeQuery] = useState("");
  const filteredAssignees = useMemo(() => {
    const query = assigneeQuery.trim().toLowerCase();

    if (!query) {
      return assigneeOptions;
    }

    return assigneeOptions.filter((member) => member.name.toLowerCase().includes(query));
  }, [assigneeOptions, assigneeQuery]);

  useEffect(() => {
    if (!assigneeMenuOpen) {
      setAssigneeQuery("");
    }
  }, [assigneeMenuOpen]);

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-40 flex justify-end p-3 transition sm:p-4",
        open ? "opacity-100" : "opacity-0",
      )}
    >
      <div className="absolute inset-0 bg-black/12" />

      <aside
        className={cn(
          "relative flex h-full max-h-full w-full max-w-[430px] flex-col rounded-[var(--radius-xl)] border border-white/6 bg-[linear-gradient(180deg,#1b1c20_0%,#16171a_100%)] transition duration-200",
          open ? "pointer-events-auto translate-x-0" : "pointer-events-none translate-x-8",
        )}
      >
        <div className="shrink-0 border-b border-white/6 px-4 py-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-soft)] text-[var(--accent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <ClipboardList className="h-4 w-4" />
              </div>
              <h2 className="mt-3 text-[1.08rem] font-semibold tracking-tight text-[var(--text-primary)]">
                Create Task
              </h2>
            </div>

            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] border border-white/8 bg-white/[0.03] transition hover:bg-white/[0.06] hover:text-[var(--text-primary)]"
              >
                <Star className="h-3.5 w-3.5" />
              </button>
              <ModalCloseButton onClick={onClose} aria-label="Close create task drawer" />
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-4">
          <div className="rounded-[var(--radius-xl)] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.012))] p-4">
            <div className="flex items-center gap-3 border-b border-white/8 pb-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-soft)]/80 text-[var(--accent)]">
                <Pen className="h-4 w-4" />
              </div>
              <input
                value={form.title}
                onChange={(event) => onTitleChange(event.target.value)}
                placeholder="Enter task name"
                className="w-full border-none bg-transparent p-0 text-[1.05rem] font-semibold tracking-tight text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]/75"
              />
            </div>

            <div className="mt-4 grid gap-3">
              {/* Assigned To */}
              <div className="relative">
                <p className="mb-1.5 flex items-center gap-1.5 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  <UserRound className="h-3 w-3" />
                  Assigned To
                </p>
                <button
                  type="button"
                  onClick={onToggleAssigneeMenu}
                  className="flex w-full items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.04] px-3.5 py-2.5 text-left transition hover:border-white/12 hover:bg-white/[0.06]"
                >
                  {selectedAssignees.length > 0 ? (
                    <div className="flex min-w-0 items-center gap-2.5">
                      <AvatarCluster members={selectedAssignees.slice(0, 3)} />
                      <span className="truncate text-[0.88rem] font-medium text-[var(--text-primary)]">
                        {selectedAssignees.length === 1
                          ? selectedAssignees[0].name
                          : `${selectedAssignees.length} assignees`}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[0.88rem] text-[var(--text-muted)]">Select assignees</span>
                  )}
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
                </button>

                {assigneeMenuOpen && (
                  <div className="absolute left-0 right-0 top-full z-20 mt-1.5 rounded-[var(--radius-lg)] border border-white/10 bg-[#202126] p-3 shadow-2xl">
                    <div className="mb-3 flex items-center justify-between text-[0.88rem] font-medium text-[var(--text-primary)]">
                      Assign members
                      <button type="button" onClick={onToggleAssigneeMenu}>
                        <X className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                      </button>
                    </div>
                    <div className="mb-3 flex h-9 items-center gap-2 rounded-[var(--radius-md)] border border-white/8 bg-[#2a2d35] px-3 text-[0.84rem] text-[var(--text-muted)]">
                      <Search className="h-3.5 w-3.5" />
                      <input
                        value={assigneeQuery}
                        onChange={(event) => setAssigneeQuery(event.target.value)}
                        placeholder="Search for a member"
                        className="w-full bg-transparent text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                      />
                    </div>
                    <div className="space-y-1">
                      {filteredAssignees.map((member) => {
                        const isSelected = form.assignedTo.includes(member.name);
                        return (
                          <button
                            key={member.name}
                            type="button"
                            onClick={() => onSelectAssignee(member.name)}
                            className={cn(
                              "flex w-full items-center gap-2 rounded-[var(--radius-md)] px-2.5 py-2 text-left text-[0.84rem] transition hover:bg-white/5",
                              isSelected ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]",
                            )}
                          >
                            <Avatar initials={member.initials} tone={member.tone} size="sm" />
                            <span className="flex-1">{member.name}</span>
                            {isSelected && (
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[#160d09]">
                                <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                                  <path d="M1 3.5L3.5 6L8 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </span>
                            )}
                          </button>
                        );
                      })}
                      {filteredAssignees.length === 0 && (
                        <div className="rounded-[var(--radius-md)] border border-dashed border-white/10 px-3 py-3 text-[0.8rem] text-[var(--text-muted)]">
                          No teammate found for that search.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 2-col grid */}
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Due Date */}
                <div>
                  <p className="mb-1.5 flex items-center gap-1.5 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    <CalendarDays className="h-3 w-3" />
                    Due Date
                  </p>
                  <DatePicker
                    value={form.dueDate}
                    onChange={onDueDateChange}
                    align="left"
                    compact
                    triggerClassName="rounded-[var(--radius-lg)] bg-white/[0.04] shadow-none hover:border-white/12 hover:bg-white/[0.06]"
                  />
                </div>

                {/* Reminder */}
                <div>
                  <p className="mb-1.5 flex items-center gap-1.5 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    <Bell className="h-3 w-3" />
                    Reminder
                  </p>
                  <ReminderPicker
                    value={form.reminderDate}
                    onChange={onReminderDateChange}
                    align="left"
                    compact
                    triggerClassName="rounded-[var(--radius-lg)] bg-white/[0.04] shadow-none hover:border-white/12 hover:bg-white/[0.06]"
                  />
                </div>

                {/* Status */}
                <div>
                  <p className="mb-1.5 flex items-center gap-1.5 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    <Flag className="h-3 w-3" />
                    Status
                  </p>
                  <div className="relative">
                    <select
                      value={form.statusId}
                      onChange={(event) => onStatusChange(event.target.value)}
                      className="w-full appearance-none rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.04] px-3.5 py-2.5 pr-9 text-[0.86rem] font-medium text-[var(--text-primary)] outline-none"
                    >
                      {columns.map((column) => (
                        <option key={column.id} value={column.id} className="bg-[#1d1e22] text-[var(--text-primary)]">
                          {column.title}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
                  </div>
                </div>

                {/* Tag */}
                <div>
                  <p className="mb-1.5 flex items-center gap-1.5 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    <Tag className="h-3 w-3" />
                    Tag
                  </p>
                  <TagSelect value={form.tag} tags={tags} onChange={onTagChange} />
                </div>

                {/* Created By */}
                <div>
                  <p className="mb-1.5 flex items-center gap-1.5 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    <Crown className="h-3 w-3" />
                    Created By
                  </p>
                  <div className="flex items-center gap-2.5 rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.04] px-3.5 py-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-[0.68rem] font-semibold text-[var(--text-primary)]">
                      Y
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[0.86rem] font-medium text-[var(--text-primary)]">You</p>
                      <p className="text-[0.68rem] text-[var(--text-muted)]">Workspace owner</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="border-b border-white/8">
              <div className="flex items-center gap-2 text-[0.88rem]">
                {[
                  { id: "description", label: "Description", icon: Pen },
                  { id: "comments", label: "Comments", icon: MessageSquareMore },
                  { id: "activities", label: "Activities", icon: Zap },
                ].map((tab) => {
                  const Icon = tab.icon;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => onTabChange(tab.id as DrawerTab)}
                      className={cn(
                        "relative inline-flex items-center gap-2 pb-2.5 pr-3 text-[0.82rem] font-medium transition",
                        activeTab === tab.id
                          ? "text-[var(--text-primary)] after:absolute after:bottom-[-1px] after:left-0 after:h-0.5 after:w-[calc(100%-16px)] after:rounded-full after:bg-[var(--accent)]"
                          : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {activeTab === "description" ? (
              <textarea
                value={form.description}
                onChange={(event) => onDescriptionChange(event.target.value)}
                placeholder="Add context, deliverables, and handoff notes for this task..."
                rows={5}
                className="mt-3.5 min-h-[104px] w-full resize-none rounded-[18px] border border-white/8 bg-white/[0.025] p-3.5 text-[0.82rem] leading-[1.5] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
              />
            ) : (
              <div className="mt-3.5 rounded-[18px] border border-white/8 bg-white/[0.025] p-3.5 text-[0.8rem] text-[var(--text-muted)]">
                {activeTab === "comments"
                  ? "Comments will become available once this task is created and collaborators start replying."
                  : "Activity history will appear here after assignees, status, and due dates start changing."}
              </div>
            )}
          </div>

          <div className="mt-5 space-y-5 border-t border-white/8 pt-4">
            <TaskChecklistEditor
              title="Checklist"
              addLabel="Add Item"
              emptyLabel="No checklist items yet. Add a few checkpoints to make execution clearer."
              items={form.subtasks}
              onAdd={onAddSubtask}
              onChange={onSubtaskChange}
              onToggleComplete={onToggleSubtaskComplete}
              onRemove={onRemoveSubtask}
            />

            <TaskTextListEditor
              title="Notes"
              addLabel="Add Note"
              emptyLabel="No notes yet. Add task notes to keep details visible."
              inputLabel="Note"
              icon={FileText}
              items={form.notes}
              onAdd={onAddNote}
              onChange={onNoteChange}
              onRemove={onRemoveNote}
            />
          </div>
        </div>

        <div className="shrink-0 mt-auto border-t border-white/8 bg-black/10 px-4 py-3.5">
          <div className="mb-3 flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.03] px-3 py-2.5 text-[0.76rem] text-[var(--text-secondary)]">
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-[var(--accent)]" />
              Viewers can be added after task creation
            </div>
            <span className="rounded-full bg-white/6 px-2 py-0.5 text-[0.68rem] text-[var(--text-muted)]">
              Later
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-base btn-secondary flex-1 rounded-[var(--radius-md)] px-4 py-2.5 text-[0.82rem] font-medium"
            >
              Close Panel
            </button>
            <button
              type="button"
              onClick={onCreateTask}
              disabled={!form.title.trim()}
              className="btn-base btn-primary flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] px-4 py-2.5 text-[0.84rem] font-semibold"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Create Task
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function TaskDetailModal({
  taskRecord,
  projectRef,
  mode,
  form,
  columns,
  assigneeOptions,
  assigneeMenuOpen,
  onClose,
  onModeChange,
  onTitleChange,
  onDescriptionChange,
  onDueDateChange,
  onReminderDateChange,
  onStatusChange,
  onTagChange,
  onPriorityChange,
  onToggleAssigneeMenu,
  onSelectAssignee,
  onAddSubtask,
  onSubtaskChange,
  onToggleSubtaskComplete,
  onRemoveSubtask,
  onAddNote,
  onNoteChange,
  onRemoveNote,
  onAddLink,
  onLinkChange,
  onRemoveLink,
  onAddComment,
  onCommentChange,
  onRemoveComment,
  onToggleFileId,
  projectFiles,
  onUploadFiles,
  activeTrackerEntries,
  onTrackerEntriesChange,
  onSave,
  onDelete,
  tags,
}: {
  taskRecord: TaskModalRecord | null;
  projectRef: string;
  mode: TaskModalMode;
  form: TaskFormState;
  columns: TaskColumn[];
  assigneeOptions: AssigneeOption[];
  tags: TagDefinition[];
  assigneeMenuOpen: boolean;
  onClose: () => void;
  onModeChange: (mode: TaskModalMode) => void;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDueDateChange: (value: string) => void;
  onReminderDateChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onTagChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onToggleAssigneeMenu: () => void;
  onSelectAssignee: (name: string) => void;
  onAddSubtask: () => void;
  onSubtaskChange: (index: number, value: string) => void;
  onToggleSubtaskComplete: (index: number) => void;
  onRemoveSubtask: (index: number) => void;
  onAddNote: () => void;
  onNoteChange: (index: number, value: string) => void;
  onRemoveNote: (index: number) => void;
  onAddLink: () => void;
  onLinkChange: (index: number, value: string) => void;
  onRemoveLink: (index: number) => void;
  onAddComment: () => void;
  onCommentChange: (index: number, value: string) => void;
  onRemoveComment: (index: number) => void;
  onToggleFileId: (fileId: string) => void;
  projectFiles: ProjectFileRecord[];
  onUploadFiles: (files: File[]) => Promise<ProjectFileRecord[]>;
  activeTrackerEntries: TimeTrackerDashboardPayload["activeEntries"];
  onTrackerEntriesChange?: (entries: TimeTrackerDashboardPayload["activeEntries"]) => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  const [, setWorkspaceActivity] = useWorkspaceActivityFeed();
  const [profile] = usePersistentState<ProfileIdentityState>(PROFILE_IDENTITY_STORAGE_KEY, { fullName: "" });
  const [workspaceSettings] = usePersistentState<{ owner?: string }>("planix.settings.workspace", defaultWorkspaceForm);
  const [trackerMutating, setTrackerMutating] = useState(false);
  const [trackerStateLoading, setTrackerStateLoading] = useState(false);
  const [trackerError, setTrackerError] = useState("");
  const [trackerEntriesState, setTrackerEntriesState] = useState<TimeTrackerDashboardPayload["activeEntries"]>(activeTrackerEntries);
  const [taskFilesUploading, setTaskFilesUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const trackerLoadRequestRef = useRef(0);
  const actorName = resolveTimeTrackerActorName(profile.fullName, workspaceSettings.owner);
  const workspaceOwnerName = workspaceSettings.owner?.trim() || actorName;
  const task = taskRecord?.task ?? null;
  const taskId = taskRecord?.task.id ?? null;
  const columnId = taskRecord?.columnId ?? "open";
  const columnTitle = taskRecord?.columnTitle ?? "Open";
  const isWorkspaceOwner = actorName === workspaceOwnerName;
  const isAssignedActor = task?.assignees.some((assignee) => assignee.name === actorName) ?? false;
  const canTrackTask = isWorkspaceOwner || isAssignedActor;
  const activeTimeEntry = trackerEntriesState.find((entry) =>
    taskId !== null
    && entry.projectRef === projectRef
    && Number(entry.taskId) === Number(taskId),
  ) ?? null;
  const displayedTimerStartedAt = activeTimeEntry?.startedAt ?? null;
  const isTrackingThisTask = Boolean(task && activeTimeEntry);
  const trackerStatePending = trackerStateLoading && !displayedTimerStartedAt && !trackerMutating;
  const trackerStatusLabel = trackerStateLoading
    ? "Checking timer state"
    : isTrackingThisTask
      ? "Running"
      : "Not running";

  useEffect(() => {
    setTrackerEntriesState(activeTrackerEntries);
  }, [activeTrackerEntries]);

  const applyTrackerDashboard = useCallback((dashboard: TimeTrackerDashboardPayload) => {
    const nextEntries = dashboard.activeEntries ?? [];
    setTrackerEntriesState(nextEntries);
    onTrackerEntriesChange?.(nextEntries);
  }, [onTrackerEntriesChange]);

  const loadTaskTrackerState = useCallback(async () => {
    const requestId = trackerLoadRequestRef.current + 1;
    trackerLoadRequestRef.current = requestId;
    setTrackerStateLoading(true);

    try {
      const response = await fetch(`/api/time-tracker?actorName=${encodeURIComponent(actorName)}`, {
        cache: "no-store",
      });
      const result = await readJsonSafely<{
        dashboard?: TimeTrackerDashboardPayload;
        error?: string;
      }>(response);

      if (!response.ok || !result?.dashboard) {
        throw new Error(result?.error || "Failed to load timer state.");
      }

      if (requestId !== trackerLoadRequestRef.current) {
        return;
      }

      applyTrackerDashboard(result.dashboard);
      setTrackerError("");
    } catch (error) {
      if (requestId !== trackerLoadRequestRef.current) {
        return;
      }

      setTrackerError(error instanceof Error ? error.message : "Failed to load timer state.");
    } finally {
      if (requestId === trackerLoadRequestRef.current) {
        setTrackerStateLoading(false);
      }
    }
  }, [actorName, applyTrackerDashboard]);

  useEffect(() => {
    if (!taskRecord || taskId === null) {
      return;
    }

    setTrackerError("");
    void loadTaskTrackerState();
  }, [loadTaskTrackerState, taskId]);

  useEffect(() => {
    if (taskId === null) {
      return;
    }

    const handleTrackerChanged = () => {
      void loadTaskTrackerState();
    };

    window.addEventListener(TIME_TRACKER_CHANGED_EVENT, handleTrackerChanged);

    return () => {
      window.removeEventListener(TIME_TRACKER_CHANGED_EVENT, handleTrackerChanged);
    };
  }, [loadTaskTrackerState, taskId]);

  if (!taskRecord || !task) {
    return null;
  }

  const resolvedTask = task;
  const progressValue = taskProgressValue(task, columnId);
  const priorityMeta = getPriorityMeta(task.priority);
  const primaryAssignee = task.assignees[0] ?? null;
  const selectedAssigneeMembers = assigneeOptions.filter((member) => form.assignedTo.includes(member.name));
  const assignedNames = task.assignees.map((assignee) => assignee.name).join(", ");
  const linkedFiles = task.attachmentFileIds
    .map((fileId) => projectFiles.find((file) => file.id === fileId) ?? null)
    .filter((file): file is ProjectFileRecord => Boolean(file));
  const resourceCards = [
    { label: "Links", value: String(task.links).padStart(2, "0"), icon: Link2 },
    { label: "Files", value: String(task.attachments).padStart(2, "0"), icon: FileText },
    { label: "Comments", value: String(task.comments).padStart(2, "0"), icon: MessageSquareMore },
  ];

  async function handleTaskFilesSelected(fileList: FileList | null) {
    const files = fileList ? Array.from(fileList) : [];

    if (files.length === 0) {
      return;
    }

    try {
      setTaskFilesUploading(true);
      const uploadedFiles = await onUploadFiles(files);
      uploadedFiles.forEach((file) => onToggleFileId(file.id));
    } finally {
      setTaskFilesUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleStartTaskTimer() {
    if (!canTrackTask || trackerMutating) {
      return;
    }

    try {
      setTrackerMutating(true);
      setTrackerError("");
      const response = await fetch("/api/time-tracker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "start",
          projectRef,
          taskId: resolvedTask.id,
          actorName,
        }),
      });
      const result = await readJsonSafely<{
        dashboard?: TimeTrackerDashboardPayload;
        error?: string;
      }>(response);

      if (!response.ok || !result?.dashboard) {
        throw new Error(result?.error || "Failed to start task timer.");
      }

      applyTrackerDashboard(result.dashboard);
      dispatchTimeTrackerChanged();
      setWorkspaceActivity((current) =>
        pushWorkspaceActivity(current, {
          name: "Time Tracker",
          initials: "TT",
          tone: "peach",
          status: "busy",
          action: "Started task timer",
          detail: `${resolvedTask.title} · ${actorName}`,
        }),
      );
    } catch (error) {
      setTrackerError(error instanceof Error ? error.message : "Failed to start task timer.");
    } finally {
      setTrackerMutating(false);
    }
  }

  async function handleStopTaskTimer() {
    if (!activeTimeEntry || trackerMutating) {
      return;
    }

    try {
      setTrackerMutating(true);
      setTrackerError("");
      const response = await fetch("/api/time-tracker", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "stop",
          entryId: activeTimeEntry?.id,
          actorName,
        }),
      });
      const result = await readJsonSafely<{
        dashboard?: TimeTrackerDashboardPayload;
        error?: string;
      }>(response);

      if (!response.ok || !result?.dashboard) {
        throw new Error(result?.error || "Failed to stop task timer.");
      }

      applyTrackerDashboard(result.dashboard);
      dispatchTimeTrackerChanged();
      setWorkspaceActivity((current) =>
        pushWorkspaceActivity(current, {
          name: "Time Tracker",
          initials: "TT",
          tone: "olive",
          status: "neutral",
          action: "Stopped task timer",
          detail: `${resolvedTask.title} · ${actorName}`,
        }),
      );
    } catch (error) {
      setTrackerError(error instanceof Error ? error.message : "Failed to stop task timer.");
    } finally {
      setTrackerMutating(false);
    }
  }

  return (
    <div className="modal-overlay-shell">
      <div className="modal-overlay-backdrop bg-black/60" onClick={onClose} />

      <div className="modal-surface flex w-full max-w-[1080px] flex-col border border-[#f2d1b6]/12 bg-[linear-gradient(180deg,#201a18_0%,#151317_58%,#111216_100%)] shadow-[0_34px_100px_rgba(0,0,0,0.52)]">
        <div className="border-b border-[#f2d1b6]/12 bg-[linear-gradient(180deg,rgba(241,201,167,0.08),rgba(255,255,255,0.015))] px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#e0bf9e]">
                {mode === "edit" ? "Edit Task" : "Task Details"}
              </p>
              <h2 className="mt-2 truncate text-[1.5rem] font-semibold tracking-tight text-[var(--text-primary)] sm:text-[1.8rem]">
                {task.title}
              </h2>
            </div>
            <div className="flex items-center gap-2 self-start">
              <ModalCloseButton
                onClick={onClose}
                aria-label="Close task details modal"
                className="h-9 w-9 rounded-[var(--radius-md)]"
              />
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {mode === "view" ? (
            <div className="space-y-5">
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-stretch">
                <section className="rounded-[24px] border border-[#f2d1b6]/12 bg-[linear-gradient(135deg,rgba(231,158,116,0.14),rgba(28,25,23,0.82)_24%,rgba(18,17,20,0.96)_100%)] p-4 sm:p-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[#f1c9a7]/14 text-[#f3caa9]">
                          <Clock3 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 space-y-1">
                          <p className="text-[1rem] font-semibold uppercase tracking-[0.14em] text-[#e0bf9e]">
                            Time Tracking
                          </p>
                          <p className="text-[0.78rem] text-[var(--text-muted)]">
                            {trackerStatusLabel}
                          </p>
                        </div>
                      </div>
                      {!canTrackTask ? (
                        <div className="mt-4 rounded-[var(--radius-lg)] border border-[#f2d1b6]/12 bg-black/18 px-4 py-3.5">
                          <p className="text-[0.76rem] text-[var(--text-muted)]">
                            Only the workspace owner or assigned collaborators can activate this timer.
                          </p>
                        </div>
                      ) : null}
                    </div>

                    <div className="xl:ml-auto xl:w-[280px]">
                      {trackerError ? (
                        <div className="rounded-[var(--radius-lg)] border border-[var(--red)]/15 bg-[var(--red)]/10 px-3.5 py-3 text-[0.74rem] text-[var(--red)]">
                          {trackerError}
                        </div>
                      ) : null}
                      <div className={cn("flex flex-wrap items-center gap-2 xl:justify-end", trackerError ? "mt-3" : "")}>
                        {displayedTimerStartedAt ? (
                          <ActiveTaskTimerPill
                            startedAt={displayedTimerStartedAt}
                            className="min-h-9 border-[#ef8c62]/20 bg-[#ef8c62]/12 px-2.5 py-1 text-[0.7rem]"
                          />
                        ) : null}
                        <button
                          type="button"
                          onClick={() => {
                            if (trackerStatePending) {
                              return;
                            }

                            void (isTrackingThisTask ? handleStopTaskTimer() : handleStartTaskTimer());
                          }}
                          disabled={trackerMutating || trackerStatePending || (!canTrackTask && !isTrackingThisTask)}
                          className={cn(
                            "btn-base inline-flex items-center gap-2 rounded-[var(--radius-md)] px-3.5 py-2 text-[0.78rem] disabled:cursor-not-allowed disabled:opacity-50",
                            isTrackingThisTask ? "btn-secondary font-medium" : "btn-primary font-semibold",
                          )}
                        >
                          {trackerMutating || trackerStatePending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : isTrackingThisTask ? <Ban className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
                          {trackerMutating ? "Updating Timer" : trackerStatePending ? "Loading Timer" : isTrackingThisTask ? "Stop Timer" : "Start Timer"}
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="h-full rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-2.5">
                  <div className="grid h-full grid-cols-3 gap-2.5">
                    {resourceCards.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex min-w-0 items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-black/14 px-2.5 py-3 text-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.04] text-[var(--text-secondary)]">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <p className="text-[1rem] font-semibold text-[var(--text-primary)]">{value}</p>
                    </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="space-y-5">
                <section className="rounded-[24px] border border-[#f2d1b6]/10 bg-[linear-gradient(180deg,rgba(255,245,236,0.07),rgba(255,255,255,0.018))] p-4 sm:p-5">
                  <div>
                    <p className="text-[0.82rem] font-semibold uppercase tracking-[0.16em] text-[#e0bf9e]">Task Description</p>
                    <p className="mt-4 max-w-3xl text-[0.9rem] leading-7 text-[var(--text-secondary)]">{task.description}</p>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-[var(--radius-lg)] border border-[#f2d1b6]/10 bg-black/18 px-4 py-3.5 sm:col-span-2 xl:col-span-3">
                      <p className="text-[0.68rem] uppercase tracking-[0.14em] text-[var(--text-muted)]">Assigned To</p>
                      <div className="mt-2 flex items-center gap-2.5">
                        <Avatar initials={primaryAssignee?.initials ?? "NA"} tone={primaryAssignee?.tone ?? "slate"} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate text-[0.84rem] font-medium text-[var(--text-primary)]">{primaryAssignee?.name ?? "Unassigned"}</p>
                          <p className="text-[0.72rem] text-[var(--text-muted)]">{task.assignees.length > 0 ? assignedNames : "No assignees selected"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[var(--radius-lg)] border border-[#f2d1b6]/10 bg-black/18 px-4 py-3.5">
                      <p className="text-[0.68rem] uppercase tracking-[0.14em] text-[var(--text-muted)]">Status</p>
                      <p className="mt-2 text-[0.84rem] font-medium text-[var(--text-primary)]">{columnTitle}</p>
                    </div>
                    <div className="rounded-[var(--radius-lg)] border border-[#f2d1b6]/10 bg-black/18 px-4 py-3.5">
                      <p className="text-[0.68rem] uppercase tracking-[0.14em] text-[var(--text-muted)]">Priority</p>
                      <p className={cn("mt-2 text-[0.84rem] font-medium", priorityMeta.tone)}>{priorityMeta.label}</p>
                    </div>

                    <div className="rounded-[var(--radius-lg)] border border-[#f2d1b6]/10 bg-black/18 px-4 py-3.5">
                      <p className="text-[0.68rem] uppercase tracking-[0.14em] text-[var(--text-muted)]">Tag</p>
                      <span
                        className="mt-2 inline-flex rounded-full px-2.5 py-1 text-[0.72rem] font-medium"
                        style={{ backgroundColor: `${getTagColor(task.tag, tags)}1a`, color: getTagColor(task.tag, tags) }}
                      >
                        {task.tag}
                      </span>
                    </div>
                    <div className="rounded-[var(--radius-lg)] border border-[#f2d1b6]/10 bg-black/18 px-4 py-3.5">
                      <p className="text-[0.68rem] uppercase tracking-[0.14em] text-[var(--text-muted)]">Progress</p>
                      <p className="mt-2 text-[0.84rem] font-medium text-[var(--text-primary)]">{progressValue}% complete</p>
                    </div>

                    <div className="rounded-[var(--radius-lg)] border border-[#f2d1b6]/10 bg-black/18 px-4 py-3.5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[0.68rem] uppercase tracking-[0.14em] text-[var(--text-muted)]">Due Date</p>
                          <p className="mt-2 text-[0.84rem] font-medium text-[var(--text-primary)]">{task.dueLabel ?? "No date set"}</p>
                        </div>
                        <CalendarDays className="h-4 w-4 text-[var(--text-secondary)]" />
                      </div>
                    </div>
                    <div className="rounded-[18px] border border-[#f2d1b6]/10 bg-black/18 px-4 py-3.5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[0.68rem] uppercase tracking-[0.14em] text-[var(--text-muted)]">Reminder</p>
                          <p className="mt-2 text-[0.84rem] font-medium text-[var(--text-primary)]">{task.reminderLabel ?? "No reminder set"}</p>
                        </div>
                        <Bell className="h-4 w-4 text-[var(--text-secondary)]" />
                      </div>
                    </div>

                    <div className="rounded-[var(--radius-lg)] border border-[#f2d1b6]/10 bg-black/18 px-4 py-3.5 sm:col-span-2 xl:col-span-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[0.68rem] uppercase tracking-[0.14em] text-[var(--text-muted)]">Execution Progress</p>
                          <p className="mt-2 text-[0.84rem] font-medium text-[var(--text-primary)]">{progressValue}% complete</p>
                        </div>
                        <span className={cn("text-[0.78rem] font-medium", progressValue >= 100 ? "text-[#dcb892]" : "text-[var(--text-secondary)]")}>
                          {columnTitle}
                        </span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
                        <div className={cn("h-full rounded-full", columnBulletColor(columnId))} style={{ width: `${progressValue}%` }} />
                      </div>
                    </div>
                  </div>
                </section>

                {task.preview ? (
                  <section className="overflow-hidden rounded-[24px] border border-[#f2d1b6]/10 bg-[linear-gradient(180deg,rgba(255,242,231,0.07),rgba(255,255,255,0.018))]">
                    <div className="px-4 py-4 sm:px-5">
                      <TaskPreview type={task.preview} />
                    </div>
                  </section>
                ) : null}
              </div>

              <div className="grid gap-5 xl:grid-cols-2">
                <TaskChecklistDisplay
                  title="Execution Checklist"
                  description="Delivery checkpoints and handoff markers for this task."
                  items={task.checklist}
                  emptyLabel="No subtasks added for this task yet."
                  onToggle={(id) => {
                    const checklistIndex = form.subtasks.findIndex((item) => item.id === id);

                    if (checklistIndex >= 0) {
                      onToggleSubtaskComplete(checklistIndex);
                    }
                  }}
                />

                <TaskTextListDisplay
                  title="Notes"
                  description="Supporting details, feedback, and reminders captured for this task."
                  icon={FileText}
                  items={task.notes}
                  emptyLabel="No notes added for this task yet."
                />
              </div>

              <div className="grid gap-5 xl:grid-cols-3">
                <TaskLinksDisplay items={task.linkItems} />
                <TaskFilesDisplay files={linkedFiles} />
                <TaskCommentsDisplay items={task.commentItems} />
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid gap-5 xl:grid-cols-2">
              <div className="space-y-5">
                <section className="rounded-[24px] border border-[#f2d1b6]/10 bg-[linear-gradient(180deg,rgba(255,242,231,0.08),rgba(255,255,255,0.02))] p-4 sm:p-5">
                  <div className="flex items-center gap-3 border-b border-[#f2d1b6]/10 pb-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-soft)]/80 text-[var(--accent)]">
                      <Pen className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[0.76rem] uppercase tracking-[0.14em] text-[var(--text-muted)]">Task Title</p>
                      <input
                        value={form.title}
                        onChange={(event) => onTitleChange(event.target.value)}
                        placeholder="Enter task name"
                        className="mt-1 w-full border-none bg-transparent p-0 text-[1.08rem] font-semibold tracking-tight text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]/75"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-[0.76rem] uppercase tracking-[0.14em] text-[var(--text-muted)]">Description</p>
                    <textarea
                      value={form.description}
                      onChange={(event) => onDescriptionChange(event.target.value)}
                      placeholder="Add task context, deliverables, and expected outcomes..."
                      rows={7}
                      className="mt-2 min-h-[164px] w-full resize-none rounded-[var(--radius-lg)] border border-[#f2d1b6]/10 bg-black/18 p-4 text-[0.84rem] leading-[1.6] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                    />
                  </div>
                </section>

                <TaskChecklistEditor
                  title="Checklist"
                  addLabel="Add Item"
                  emptyLabel="No checklist items yet. Add a few checkpoints to make execution clearer."
                  items={form.subtasks}
                  onAdd={onAddSubtask}
                  onChange={onSubtaskChange}
                  onToggleComplete={onToggleSubtaskComplete}
                  onRemove={onRemoveSubtask}
                />

                <TaskTextListEditor
                  title="Notes"
                  addLabel="Add Note"
                  emptyLabel="No notes yet. Add details you want visible in task details."
                  inputLabel="Note"
                  icon={FileText}
                  items={form.notes}
                  onAdd={onAddNote}
                  onChange={onNoteChange}
                  onRemove={onRemoveNote}
                />

              </div>

              <div className="space-y-5">
                <section className="min-h-[640px] rounded-[24px] border border-[#f2d1b6]/10 bg-[linear-gradient(180deg,rgba(255,245,236,0.08),rgba(255,255,255,0.02))] p-4 sm:p-5">
                  <p className="text-[0.82rem] font-semibold uppercase tracking-[0.16em] text-[#e0bf9e]">
                    Task Setup
                  </p>

                  <div className="mt-4 space-y-4">
                    <div className="relative rounded-[var(--radius-lg)] border border-[#f2d1b6]/10 bg-black/18 px-4 py-3.5">
                      <div className="mb-2 flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
                        <UserRound className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                        Assigned To
                      </div>
                      <button
                        type="button"
                        onClick={onToggleAssigneeMenu}
                        className="flex w-full items-center justify-between gap-3 text-left text-[0.86rem] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                      >
                        {form.assignedTo.length > 0 ? (
                          <div className="flex min-w-0 items-center gap-2.5">
                            <AvatarCluster members={selectedAssigneeMembers.slice(0, 3)} />
                            <span className="truncate text-[var(--text-primary)]">
                              {form.assignedTo.length === 1 ? form.assignedTo[0] : `${form.assignedTo.length} assignees`}
                            </span>
                          </div>
                        ) : (
                          <span className="truncate">Select assignees</span>
                        )}
                        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
                      </button>

                      {assigneeMenuOpen && (
                        <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-[var(--radius-lg)] border border-[#f2d1b6]/10 bg-[#201a18] p-3 shadow-2xl">
                          <div className="mb-3 flex items-center justify-between text-[0.88rem] font-medium text-[var(--text-primary)]">
                            Assign members
                            <button type="button" onClick={onToggleAssigneeMenu}>
                              <X className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                            </button>
                          </div>
                          <div className="space-y-1">
                            {assigneeOptions.map((member) => {
                              const isSelected = form.assignedTo.includes(member.name);
                              return (
                                <button
                                  key={member.name}
                                  type="button"
                                  onClick={() => onSelectAssignee(member.name)}
                                  className={cn(
                                    "flex w-full items-center gap-2 rounded-[var(--radius-md)] px-2.5 py-2 text-left text-[0.84rem] transition hover:bg-white/5",
                                    isSelected ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]",
                                  )}
                                >
                                  <Avatar initials={member.initials} tone={member.tone} size="sm" />
                                  <span className="flex-1">{member.name}</span>
                                  {isSelected && (
                                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[#160d09]">
                                      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                                        <path d="M1 3.5L3.5 6L8 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-[var(--radius-lg)] border border-[#f2d1b6]/10 bg-black/18 px-4 py-3.5 sm:col-span-2">
                        <div className="mb-2 flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
                          <CalendarDays className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                          Due Date
                        </div>
                        <DatePicker
                          value={form.dueDate}
                          onChange={onDueDateChange}
                          variant="input"
                          align="left"
                          triggerClassName="border-[#f2d1b6]/10 bg-[#181518] text-[0.86rem] shadow-none hover:border-white/12 hover:bg-[#1b1718]"
                        />
                      </div>

                      <div className="rounded-[var(--radius-lg)] border border-[#f2d1b6]/10 bg-black/18 px-4 py-3.5 sm:col-span-2">
                        <div className="mb-2 flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
                          <Bell className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                          Reminder
                        </div>
                        <ReminderPicker
                          value={form.reminderDate}
                          onChange={onReminderDateChange}
                          align="left"
                          triggerClassName="border-[#f2d1b6]/10 bg-[#181518] text-[0.86rem] shadow-none hover:border-white/12 hover:bg-[#1b1718]"
                        />
                      </div>

                      <div className="rounded-[var(--radius-lg)] border border-[#f2d1b6]/10 bg-black/18 px-4 py-3.5">
                        <div className="mb-2 flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
                          <Flag className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                          Status
                        </div>
                        <div className="relative">
                          <select
                            value={form.statusId}
                            onChange={(event) => onStatusChange(event.target.value)}
                            className="w-full appearance-none rounded-[var(--radius-md)] border border-[#f2d1b6]/10 bg-[#181518] px-3.5 py-3 pr-9 text-[0.86rem] text-[var(--text-primary)] outline-none"
                          >
                            {columns.map((column) => (
                              <option key={column.id} value={column.id} className="bg-[#1d1e22] text-[var(--text-primary)]">
                                {column.title}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
                        </div>
                      </div>

                      <div className="rounded-[var(--radius-lg)] border border-[#f2d1b6]/10 bg-black/18 px-4 py-3.5">
                        <div className="mb-2 flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
                          <Tag className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                          Tag
                        </div>
                        <TagSelect value={form.tag} tags={tags} onChange={onTagChange} />
                      </div>

                      <div className="rounded-[var(--radius-lg)] border border-[#f2d1b6]/10 bg-black/18 px-4 py-3.5 sm:col-span-2">
                        <div className="mb-2 flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
                          <Flag className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                          Priority
                        </div>
                        <div className="relative">
                          <select
                            value={form.priority}
                            onChange={(event) => onPriorityChange(event.target.value)}
                            className="w-full appearance-none rounded-[var(--radius-md)] border border-[#f2d1b6]/10 bg-[#181518] px-3.5 py-3 pr-9 text-[0.86rem] text-[var(--text-primary)] outline-none"
                          >
                            {PRIORITY_OPTIONS.map((priority) => (
                              <option key={priority} value={priority} className="bg-[#1d1e22] text-[var(--text-primary)]">
                                {priority}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

              </div>
            </div>

                <section className="rounded-[24px] border border-[#f2d1b6]/10 bg-[linear-gradient(180deg,rgba(255,245,236,0.08),rgba(255,255,255,0.02))] p-4 sm:p-5">
                  <div className="grid gap-5 xl:grid-cols-3">
                    <section className="rounded-[var(--radius-lg)] border border-white/8 bg-black/14 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="inline-flex items-center gap-2 text-[0.92rem] font-semibold text-[var(--text-primary)]">
                          <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-white/[0.04] text-[var(--accent)]">
                            <Link2 className="h-4 w-4" />
                          </span>
                          Links
                        </p>
                        <button
                          type="button"
                          onClick={onAddLink}
                          className="btn-base btn-secondary inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] p-0 text-[var(--text-secondary)]"
                          aria-label="Add link"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="mt-4 space-y-2.5">
                        {form.links.map((link, index) => (
                          <div key={link.id} className="flex items-center gap-2 rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.02] p-2">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-white/[0.04] text-[var(--accent)]">
                              <Link2 className="h-3.5 w-3.5" />
                            </div>
                            <input
                              value={link.url}
                              onChange={(event) => onLinkChange(index, event.target.value)}
                              placeholder="https://"
                              className="w-full border-none bg-transparent px-1 py-1.5 text-[0.84rem] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                            />
                            <button
                              type="button"
                              onClick={() => onRemoveLink(index)}
                              className="btn-base btn-secondary h-9 w-9 shrink-0 rounded-[var(--radius-md)] p-0 text-[var(--text-secondary)]"
                              aria-label="Remove link"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                        {form.links.length === 0 ? (
                          <div className="flex min-h-[148px] items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-white/10 px-3.5 py-3 text-center text-[0.76rem] text-[var(--text-muted)]">
                            No links added yet.
                          </div>
                        ) : null}
                      </div>
                    </section>

                    <section className="rounded-[var(--radius-lg)] border border-white/8 bg-black/14 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="inline-flex items-center gap-2 text-[0.92rem] font-semibold text-[var(--text-primary)]">
                          <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-white/[0.04] text-[var(--accent)]">
                            <FileText className="h-4 w-4" />
                          </span>
                          Files
                        </p>
                        <div className="flex items-center gap-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept={PROJECT_FILE_ACCEPT_ATTRIBUTE}
                            className="hidden"
                            onChange={(event) => void handleTaskFilesSelected(event.target.files)}
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={taskFilesUploading}
                            className="btn-base btn-secondary inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] p-0 text-[var(--text-secondary)] disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Upload files"
                          >
                            {taskFilesUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2.5">
                        {projectFiles.map((file) => {
                          const selected = form.fileIds.includes(file.id);

                          return (
                            <label
                              key={file.id}
                              className={cn(
                                "flex cursor-pointer items-center gap-3 rounded-[var(--radius-lg)] border px-3.5 py-3 transition",
                                selected
                                  ? "border-[var(--accent)]/20 bg-[var(--accent)]/10"
                                  : "border-white/8 bg-white/[0.02] hover:border-white/12",
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => onToggleFileId(file.id)}
                                className="table-checkbox"
                              />
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-white/[0.05] text-[var(--accent)]">
                                <FileText className="h-4 w-4" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[0.84rem] text-[var(--text-primary)]">{file.name}</span>
                                <span className="mt-0.5 block text-[0.72rem] text-[var(--text-muted)]">{formatProjectFileSize(file.sizeBytes)}</span>
                              </span>
                            </label>
                          );
                        })}
                        {projectFiles.length === 0 ? (
                          <div className="flex min-h-[148px] items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-white/10 px-3.5 py-3 text-center text-[0.76rem] text-[var(--text-muted)]">
                            No project files available yet.
                          </div>
                        ) : null}
                      </div>
                    </section>

                    <section className="rounded-[var(--radius-lg)] border border-white/8 bg-black/14 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="inline-flex items-center gap-2 text-[0.92rem] font-semibold text-[var(--text-primary)]">
                          <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-white/[0.04] text-[var(--accent)]">
                            <MessageSquareMore className="h-4 w-4" />
                          </span>
                          Comments
                        </p>
                        <button
                          type="button"
                          onClick={onAddComment}
                          className="btn-base btn-secondary inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] p-0 text-[var(--text-secondary)]"
                          aria-label="Add comment"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="mt-4 space-y-2.5">
                        {form.comments.map((comment, index) => (
                          <div key={comment.id} className="flex items-start gap-2 rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.02] p-2">
                            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-white/[0.04] text-[var(--accent)]">
                              <MessageSquareMore className="h-3.5 w-3.5" />
                            </div>
                            <textarea
                              value={comment.body}
                              onChange={(event) => onCommentChange(index, event.target.value)}
                              rows={2}
                              placeholder={`Comment ${index + 1}`}
                              className="min-h-[74px] w-full resize-none border-none bg-transparent px-1 py-1.5 text-[0.84rem] leading-[1.5] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                            />
                            <button
                              type="button"
                              onClick={() => onRemoveComment(index)}
                              className="btn-base btn-secondary h-9 w-9 shrink-0 rounded-[var(--radius-md)] p-0 text-[var(--text-secondary)]"
                              aria-label="Remove comment"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                        {form.comments.length === 0 ? (
                          <div className="flex min-h-[148px] items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-white/10 px-3.5 py-3 text-center text-[0.76rem] text-[var(--text-muted)]">
                            No comments added yet.
                          </div>
                        ) : null}
                      </div>
                    </section>
                  </div>
                </section>
              </div>
          )}
        </div>

        <div className="border-t border-white/8 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.18))] px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-[0.76rem] leading-6 text-[var(--text-muted)]">
              {mode === "edit" ? "Changes update the current task immediately after save." : "Switch to edit mode if you need to update ownership, status, or task details."}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onDelete}
                className="btn-base btn-secondary rounded-[var(--radius-md)] px-4 py-2.5 text-[0.82rem] font-medium text-[var(--red)] hover:text-[var(--red)]"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-base btn-secondary rounded-[var(--radius-md)] px-4 py-2.5 text-[0.82rem] font-medium"
              >
                Close
              </button>
              {mode === "edit" ? (
                <button
                  type="button"
                  onClick={onSave}
                  disabled={!form.title.trim()}
                  className="btn-base btn-primary inline-flex items-center gap-2 rounded-[var(--radius-md)] px-4 py-2.5 text-[0.84rem] font-semibold"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Save Changes
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onModeChange("edit")}
                  className="btn-base btn-primary inline-flex items-center gap-2 rounded-[var(--radius-md)] px-4 py-2.5 text-[0.84rem] font-semibold"
                >
                  <Pen className="h-3.5 w-3.5" />
                  Edit Task
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function listStatusChipClasses(columnId: string) {
  if (columnId === "completed") return "border-[#af8f72]/30 bg-[#af8f72]/12 text-[#e7d3bd]";
  if (columnId === "review") return "border-[#ccb38f]/30 bg-[#ccb38f]/12 text-[#f0d9b8]";
  if (columnId === "progress") return "border-[#d7c5a2]/30 bg-[#d7c5a2]/12 text-[#f2e2c1]";
  return "border-white/10 bg-white/[0.03] text-[var(--text-secondary)]";
}

function ListViewSection({
  columns,
  tags,
  activeTrackedTaskIds,
  onOpenDrawer,
  onOpenTask,
  statusMenu,
  onToggleStatusMenu,
  onCloseStatusMenu,
  onSelectStatus,
}: {
  columns: TaskColumn[];
  tags: TagDefinition[];
  activeTrackedTaskIds: ReadonlySet<number>;
  onOpenDrawer: (columnId: string) => void;
  onOpenTask: (taskId: number, columnId: string, mode?: TaskModalMode) => void;
  statusMenu: ListStatusMenuState;
  onToggleStatusMenu: (taskId: number, columnId: string, anchorRect: DOMRect) => void;
  onCloseStatusMenu: () => void;
  onSelectStatus: (taskId: number, fromColumnId: string, toColumnId: string) => void;
}) {
  const rows = columns.flatMap((column) =>
    column.tasks.map((task) => ({
      task,
      columnId: column.id,
      columnTitle: column.title,
    })),
  );

  return (
    <div className="mt-6 pb-3" onClick={onCloseStatusMenu}>
      <section className="table-surface overflow-hidden rounded-[var(--radius-xl)] border border-white/6">
        <div className="table-header-surface flex items-center justify-between border-b border-white/6 px-5 py-4">
          <div className="flex items-center gap-3 text-[0.98rem] font-medium text-[var(--text-secondary)]">
            <ClipboardList className="h-4.5 w-4.5 text-[var(--accent)]" />
            Task List
            <span className="rounded-full bg-white/6 px-2 py-0.5 text-[0.72rem] text-[var(--text-muted)]">
              {String(rows.length).padStart(2, "0")} tasks
            </span>
          </div>
          <button
            type="button"
            onClick={() => onOpenDrawer(columns[0]?.id ?? "open")}
            className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-md)] border border-white/8 px-3.5 text-[0.86rem] font-medium text-[var(--text-secondary)] transition hover:bg-white/5 hover:text-[var(--text-primary)]"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        </div>

        <div className="overflow-x-auto pb-3">
          <div className="min-w-[1120px]">
            <div className="table-header-surface grid grid-cols-[1.55fr_0.78fr_0.8fr_0.9fr_1fr_0.75fr_0.7fr] items-stretch gap-1.5 border-b border-white/6 px-4 py-3.5 text-[12px] font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">
              <span className="flex h-full items-center border-r border-white/6 pr-4">Task</span>
              <span className="flex h-full items-center border-r border-white/6 pr-4">Status</span>
              <span className="flex h-full items-center border-r border-white/6 pr-4">Assigned</span>
              <span className="flex h-full items-center border-r border-white/6 pr-4">Due Date</span>
              <span className="flex h-full items-center border-r border-white/6 pr-4">Progress</span>
              <span className="flex h-full items-center border-r border-white/6 pr-4">Tag</span>
              <span className="flex h-full items-center">Priority</span>
            </div>

            <div className="divide-y divide-white/[0.07]">
              {rows.length === 0 && (
                <div className="flex min-h-[140px] items-center justify-center px-5 py-5 text-sm text-[var(--text-muted)]">
                  No tasks in this section
                </div>
              )}

              {rows.map(({ task, columnId, columnTitle }) => {
                const progressValue = taskProgressValue(task, columnId);
                const priorityMeta = getPriorityMeta(task.priority);
                const isTimerActive = activeTrackedTaskIds.has(task.id);

                return (
                  <div
                    key={task.id}
                    onClick={() => onOpenTask(task.id, columnId)}
                    className={cn(
                      "grid cursor-pointer grid-cols-[1.55fr_0.78fr_0.8fr_0.9fr_1fr_0.75fr_0.7fr] items-stretch gap-1.5 px-4 py-3.5 transition-colors hover:bg-white/[0.03]",
                      statusMenu?.taskId === task.id && statusMenu.columnId === columnId && "relative z-20",
                    )}
                  >
                    <div className="flex min-w-0 items-center border-r border-white/6 pr-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-white/8 bg-white/[0.03] text-[var(--text-muted)]">
                          <Box className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0">
                          <span className="flex items-center gap-2">
                            {isTimerActive ? <ActiveTimerDot /> : null}
                            <span className="block truncate text-[0.9rem] font-semibold text-[var(--text-primary)]">
                              {task.title}
                            </span>
                          </span>
                          <p className="mt-1 line-clamp-1 text-[0.75rem] leading-[1.4] text-[var(--text-muted)]">
                            {task.description}
                          </p>
                          <div className="mt-2 flex items-center gap-2.5 text-[0.68rem] text-[var(--text-muted)]">
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-[11px] w-[11px] shrink-0" />
                              {task.checklist.length > 0
                                ? `${String(task.checklist.filter((item) => item.completed).length).padStart(2, "0")}/${String(task.checklist.length).padStart(2, "0")}`
                                : "00"}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquareMore className="h-[11px] w-[11px] shrink-0" />
                              {String(task.comments).padStart(2, "0")}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-[11px] w-[11px] shrink-0" />
                              {String(task.attachments).padStart(2, "0")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex min-w-0 items-center border-r border-white/6 pr-4">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onToggleStatusMenu(task.id, columnId, event.currentTarget.getBoundingClientRect());
                        }}
                        className={cn(
                          "inline-flex min-w-0 items-center gap-0.5 rounded-full border px-1.5 py-[2px] text-[0.52rem] font-medium transition hover:bg-white/6 hover:text-[var(--text-primary)]",
                          listStatusChipClasses(columnId),
                        )}
                      >
                        <span className="scale-[0.72]">{taskStatusIndicator(columnId)}</span>
                        <span className="truncate">{columnTitle}</span>
                      </button>
                    </div>

                    <div className="flex min-w-0 items-center gap-3 border-r border-white/6 pr-4">
                      <AvatarCluster members={task.assignees.slice(0, 2)} />
                      <div className="min-w-0">
                        <p className="truncate text-[0.79rem] font-medium text-[var(--text-secondary)]">{task.assignees[0]?.name ?? "Unassigned"}</p>
                        <p className="text-[0.68rem] text-[var(--text-muted)]">
                          {task.assignees.length > 1 ? `+${task.assignees.length - 1} more` : "Primary owner"}
                        </p>
                      </div>
                    </div>

                    <div className="flex min-w-0 items-center gap-2 border-r border-white/6 pr-4 text-[0.8rem]">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border border-white/8 bg-white/[0.03] text-[var(--text-muted)]">
                        <CalendarDays className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[0.8rem] font-medium text-[var(--text-secondary)]">{task.dueLabel ?? "No due date"}</p>
                        <p className="text-[0.68rem] text-[var(--text-muted)]">
                          {task.dueLabel ? "Scheduled delivery" : "Date not assigned"}
                        </p>
                      </div>
                    </div>

                    <div className="flex min-w-0 items-center gap-3 border-r border-white/6 pr-4">
                      <div className="min-w-0 flex-1">
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/7">
                          <div
                            className={cn("h-full rounded-full transition-all", columnBulletColor(columnId))}
                            style={{ width: `${progressValue}%` }}
                          />
                        </div>
                        <p className="mt-1.5 text-[0.68rem] text-[var(--text-muted)]">Execution progress</p>
                      </div>
                      <span className="w-10 shrink-0 text-[0.78rem] font-medium text-[var(--text-secondary)]">
                        {progressValue}%
                      </span>
                    </div>

                    <div className="flex min-w-0 items-center gap-2 border-r border-white/6 pr-4 text-[0.8rem] text-[var(--text-secondary)]">
                      <span
                        className="rounded-full px-2.5 py-1 text-[0.68rem] font-medium"
                        style={{ backgroundColor: `${getTagColor(task.tag, tags)}1a`, color: getTagColor(task.tag, tags) }}
                      >
                        {task.tag}
                      </span>
                    </div>

                    <div className="flex min-w-0 items-center gap-2 text-[0.8rem]">
                      <Flag className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                      <span className={cn("truncate text-[0.78rem] font-medium", priorityMeta.tone)}>
                        {priorityMeta.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {statusMenu && (
        <>
          <div className="fixed inset-0 z-20" onClick={onCloseStatusMenu} />
          <div
            className="fixed z-30 w-[200px] rounded-[var(--radius-lg)] border border-white/8 bg-[#18191d] py-1 shadow-[0_20px_48px_rgba(0,0,0,0.42)]"
            style={{ top: statusMenu.top, left: statusMenu.left }}
            onClick={(event) => event.stopPropagation()}
          >
            {columns.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onSelectStatus(statusMenu.taskId, statusMenu.columnId, option.id)}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[0.67rem] text-[var(--text-secondary)] transition hover:bg-white/5 hover:text-[var(--text-primary)]"
              >
                <span className={cn("inline-flex h-2.5 w-2.5 shrink-0 rounded-full", columnBulletColor(option.id))} />
                {option.title}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function timelineToneClasses(tone: (typeof timelineItems)[number]["tone"]) {
  if (tone === "green") return { dot: "bg-[#4bd77f]", card: "bg-[#4bd77f]/10 border border-[#4bd77f]/20 text-[#4bd77f]" };
  if (tone === "violet") return { dot: "bg-[#b8a5ff]", card: "bg-[#b8a5ff]/10 border border-[#b8a5ff]/20 text-[#b8a5ff]" };
  if (tone === "yellow") return { dot: "bg-[#eadb95]", card: "bg-[#eadb95]/10 border border-[#eadb95]/20 text-[#eadb95]" };
  if (tone === "peach") return { dot: "bg-[#ff9b83]", card: "bg-[#ff9b83]/10 border border-[#ff9b83]/20 text-[#ff9b83]" };
  return { dot: "bg-[#a8cdfd]", card: "bg-[#a8cdfd]/10 border border-[#a8cdfd]/20 text-[#a8cdfd]" };
}

const timelineStartDate = new Date("2024-01-01T00:00:00Z"); // specific date for consistency

function getFormattedDay(dayIndex: number) {
  const date = new Date(timelineStartDate);
  date.setUTCDate(date.getUTCDate() + dayIndex - 1);
  const dayName = date.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
  const dayNum = date.getUTCDate().toString().padStart(2, "0");
  const isWeekend = date.getUTCDay() === 0 || date.getUTCDay() === 6;
  const isToday = dayIndex === 4; // Mock the 4th day as "Today" for demo
  return { dayName, dayNum, isWeekend, isToday };
}

function TimelineViewSection({ columns }: { columns: TaskColumn[] }) {
  const taskRows = columns.flatMap((column) =>
    column.tasks.map((task) => ({
      ...task,
      columnId: column.id,
      columnTitle: column.title,
      primaryAssignee: task.assignees[0] ?? null,
    })),
  );
  const dueDatedTasks = taskRows.filter((task) => task.dueDate && task.primaryAssignee);
  const sortedDueDates = dueDatedTasks
    .map((task) => new Date(`${task.dueDate}T00:00:00`))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((left, right) => left.getTime() - right.getTime());
  const timelineBaseDate = sortedDueDates[0] ?? timelineStartDate;
  const totalDays = timelineDays.length;
  const timelineUsersFromTasks = dueDatedTasks.reduce<typeof timelineUsers>((acc, task) => {
    if (!task.primaryAssignee || acc.some((user) => user.name === task.primaryAssignee?.name)) {
      return acc;
    }

    acc.push({
      id: task.primaryAssignee.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: task.primaryAssignee.name,
      role: task.columnTitle,
      initials: task.primaryAssignee.initials,
      tone: task.primaryAssignee.tone,
    });

    return acc;
  }, []);

  const timelineItemsFromTasks = dueDatedTasks
    .map((task) => {
      const dueDate = new Date(`${task.dueDate}T00:00:00`);
      const dayOffset = Math.floor((dueDate.getTime() - timelineBaseDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      if (dayOffset < 1 || dayOffset > totalDays || !task.primaryAssignee) {
        return null;
      }

      const tone =
        task.columnId === "completed"
          ? "green"
          : task.columnId === "review"
            ? "yellow"
            : task.columnId === "progress"
              ? "violet"
              : "blue";

      return {
        id: `timeline-${task.id}`,
        userId: task.primaryAssignee.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        title: task.title,
        startDay: dayOffset,
        span: 1,
        tone,
      } as const;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <div className="mt-6 overflow-x-auto pb-3">
      <section className="min-w-[1220px] overflow-hidden rounded-[var(--radius-xl)] bg-[#060607]">
        <div className="grid grid-cols-[360px_minmax(0,1fr)] border-b border-white/6 bg-[#181a1d]">
          <div className="flex items-center px-6 py-5 text-[0.98rem] font-medium text-[var(--text-secondary)]">
            Users
          </div>
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${totalDays}, minmax(0, 1fr))`,
            }}
          >
            {timelineDays.map((day) => {
              const currentDate = new Date(timelineBaseDate);
              currentDate.setUTCDate(timelineBaseDate.getUTCDate() + day - 1);
              const dayName = currentDate.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
              const dayNum = currentDate.getUTCDate().toString().padStart(2, "0");
              const isWeekend = currentDate.getUTCDay() === 0 || currentDate.getUTCDay() === 6;
              const todayUtc = new Date();
              const isToday =
                currentDate.getUTCFullYear() === todayUtc.getUTCFullYear()
                && currentDate.getUTCMonth() === todayUtc.getUTCMonth()
                && currentDate.getUTCDate() === todayUtc.getUTCDate();

              return (
                <div
                  key={day}
                  className={cn(
                    "relative flex flex-col items-center justify-center border-l border-white/6 py-3.5 transition",
                    isWeekend && "bg-white/[0.02]",
                  )}
                >
                  <span className={cn("text-[0.62rem] font-bold uppercase tracking-wider", isToday ? "text-[#fc7652]" : "text-[var(--text-muted)]")}>
                    {dayName}
                  </span>
                  <span className={cn("mt-1 text-[0.95rem] font-medium tracking-tight", isToday ? "text-[#fc7652]" : "text-[var(--text-primary)]")}>
                    {dayNum}
                  </span>
                  {isToday && <span className="absolute bottom-0 left-1/2 h-[3px] w-8 -translate-x-1/2 rounded-t-sm bg-[#fc7652]" />}
                </div>
              );
            })}
          </div>
        </div>

        {(timelineUsersFromTasks.length > 0 ? timelineUsersFromTasks : timelineUsers).map((user) => {
          const userItems = (timelineItemsFromTasks.length > 0 ? timelineItemsFromTasks : timelineItems).filter((item) => item.userId === user.id);

          return (
            <div key={user.id} className="grid grid-cols-[280px_minmax(0,1fr)] border-b border-white/6 last:border-b-0">
              <div className="flex items-center justify-between border-r border-white/6 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar initials={user.initials} tone={user.tone} size="sm" />
                  <div>
                    <p className="text-[0.85rem] font-semibold text-[var(--text-primary)]">{user.name}</p>
                    <p className="text-[0.7rem] font-medium text-[var(--text-muted)]">{user.role}</p>
                  </div>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              </div>

              <div className="relative h-[64px]">
                <div className="absolute inset-0 flex">
                  {timelineDays.map((day) => {
                    const { isWeekend, isToday } = getFormattedDay(day);
                    return (
                      <div
                        key={day}
                        className={cn(
                          "relative flex-1 border-l border-white/6 transition-colors",
                          isWeekend && "bg-white/[0.02]",
                        )}
                      >
                        {isToday && <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-[#fc7652]/30" />}
                      </div>
                    );
                  })}
                </div>

                {userItems.map((item) => {
                  const tone = timelineToneClasses(item.tone);

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "absolute top-1/2 flex h-[32px] -translate-y-1/2 items-center gap-2.5 rounded-[var(--radius-md)] px-3 text-[0.75rem] font-medium backdrop-blur-md transition-transform hover:scale-[1.01] hover:shadow-lg hover:z-10",
                        tone.card,
                      )}
                      style={{
                        left: `calc(${((item.startDay - 1) / totalDays) * 100}% + 8px)`,
                        width: `calc(${(item.span / totalDays) * 100}% - 16px)`,
                      }}
                    >
                      <span className={cn("h-2 w-2 shrink-0 rounded-full", tone.dot)} />
                      <span className="truncate">{item.title}</span>
                      <MoreVertical className="ml-auto h-3.5 w-3.5 opacity-0 shrink-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {timelineItemsFromTasks.length === 0 && (
        <div className="mt-4 rounded-[var(--radius-xl)] border border-dashed border-white/8 px-5 py-6 text-sm text-[var(--text-muted)]">
          Add task due dates and assignees to populate the live project timeline.
        </div>
      )}
    </div>
  );
}

function TagsPanel({
  open,
  tags,
  columns,
  onClose,
  onAdd,
  onRename,
  onDelete,
  onColorChange,
}: {
  open: boolean;
  tags: TagDefinition[];
  columns: TaskColumn[];
  onClose: () => void;
  onAdd: (label: string, color: string) => void;
  onRename: (id: string, label: string) => void;
  onDelete: (id: string) => void;
  onColorChange: (id: string, color: string) => void;
}) {
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState<string>(TAG_COLOR_SWATCHES[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState("");
  const [colorPickerOpenId, setColorPickerOpenId] = useState<string | null>(null);
  const [pendingDeleteTag, setPendingDeleteTag] = useState<TagDefinition | null>(null);

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    columns.forEach((col) => col.tasks.forEach((task) => {
      counts[task.tag] = (counts[task.tag] ?? 0) + 1;
    }));
    return counts;
  }, [columns]);

  function commitRename() {
    if (editingId && editingLabel.trim()) onRename(editingId, editingLabel.trim());
    setEditingId(null);
    setEditingLabel("");
  }

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-40 flex justify-end p-3 transition sm:p-4",
        open ? "opacity-100" : "opacity-0",
      )}
    >
      <div className="absolute inset-0 bg-black/12" />
      <aside
        className={cn(
          "relative flex h-full max-h-full w-full max-w-[320px] flex-col rounded-[var(--radius-xl)] border border-white/6 bg-[linear-gradient(180deg,#1b1c20_0%,#16171a_100%)] transition duration-200",
          open ? "pointer-events-auto translate-x-0" : "pointer-events-none translate-x-8",
        )}
      >
        {/* Header */}
        <div className="shrink-0 border-b border-white/6 px-4 py-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-soft)] text-[var(--accent)]">
                <Tag className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-[1.02rem] font-semibold tracking-tight text-[var(--text-primary)]">Tags</h2>
                <p className="text-[0.68rem] text-[var(--text-muted)]">{tags.length} label{tags.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <ModalCloseButton onClick={onClose} aria-label="Close tags panel" />
          </div>
        </div>

        {/* Tags list */}
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          {tags.length === 0 && (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-white/10 px-4 py-6 text-center text-[0.8rem] text-[var(--text-muted)]">
              No tags yet. Add one below.
            </div>
          )}
          <div className="space-y-1">
            {tags.map((tag) => {
              const count = tagCounts[tag.label] ?? 0;
              const isEditing = editingId === tag.id;
              const colorPickerOpen = colorPickerOpenId === tag.id;

              return (
                <div key={tag.id} className="group rounded-[var(--radius-lg)]">
                  <div className="flex items-center gap-2.5 rounded-[var(--radius-lg)] px-2.5 py-2 hover:bg-white/[0.035]">
                    {/* Color dot — click to change */}
                    <button
                      type="button"
                      onClick={() => setColorPickerOpenId(colorPickerOpen ? null : tag.id)}
                      className="h-3 w-3 shrink-0 rounded-full transition hover:scale-125"
                      style={{ backgroundColor: tag.color }}
                      title="Change color"
                    />

                    {/* Label */}
                    {isEditing ? (
                      <input
                        autoFocus
                        value={editingLabel}
                        onChange={(e) => setEditingLabel(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitRename();
                          if (e.key === "Escape") { setEditingId(null); setEditingLabel(""); }
                        }}
                        className="min-w-0 flex-1 border-none bg-transparent text-[0.84rem] font-medium text-[var(--text-primary)] outline-none"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setEditingId(tag.id); setEditingLabel(tag.label); }}
                        className="min-w-0 flex-1 truncate text-left text-[0.84rem] font-medium text-[var(--text-primary)] hover:text-[var(--accent)]"
                        title="Click to rename"
                      >
                        {tag.label}
                      </button>
                    )}

                    <span className="shrink-0 text-[0.7rem] tabular-nums text-[var(--text-muted)]">
                      {count > 0 ? count : ""}
                    </span>

                    <button
                      type="button"
                      onClick={() => setPendingDeleteTag(tag)}
                      className="shrink-0 text-[var(--text-muted)] opacity-0 transition hover:text-[var(--red)] group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Inline color picker */}
                  {colorPickerOpen && (
                    <div className="mb-1 flex flex-wrap gap-1.5 rounded-[var(--radius-md)] border border-white/8 bg-white/[0.03] px-3 py-2.5">
                      {TAG_COLOR_SWATCHES.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => { onColorChange(tag.id, color); setColorPickerOpenId(null); }}
                          className={cn(
                            "h-5 w-5 rounded-full transition hover:scale-110",
                            tag.color === color && "ring-2 ring-white/50 ring-offset-1 ring-offset-[#1b1c20]",
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* New tag */}
        <div className="shrink-0 border-t border-white/6 px-4 py-4">
          <p className="mb-3 text-[0.67rem] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">New tag</p>
          <div className="mb-3 flex flex-wrap gap-2">
            {TAG_COLOR_SWATCHES.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setNewColor(color)}
                className={cn(
                  "h-5 w-5 rounded-full transition hover:scale-110",
                  newColor === color && "ring-2 ring-white/50 ring-offset-1 ring-offset-[#16171a]",
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-[var(--radius-md)] border border-white/8 bg-white/[0.04] px-3 py-2 focus-within:border-white/20">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: newColor }} />
              <input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newLabel.trim()) {
                    onAdd(newLabel.trim(), newColor);
                    setNewLabel("");
                  }
                }}
                placeholder="Tag name..."
                className="w-full bg-transparent text-[0.84rem] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (newLabel.trim()) { onAdd(newLabel.trim(), newColor); setNewLabel(""); }
              }}
              className="btn-base btn-primary rounded-[var(--radius-md)] px-3 py-2 text-[0.82rem] font-semibold"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>
        </div>

        <DeleteConfirmationModal
          open={Boolean(pendingDeleteTag)}
          title="Delete tag?"
          description={
            pendingDeleteTag
              ? `Delete "${pendingDeleteTag.label}" from this project? Tasks using it will fall back to another available tag.`
              : ""
          }
          confirmLabel="Delete tag"
          onConfirm={() => {
            if (pendingDeleteTag) {
              onDelete(pendingDeleteTag.id);
              setPendingDeleteTag(null);
            }
          }}
          onClose={() => setPendingDeleteTag(null)}
        />
      </aside>
    </div>
  );
}

export function ProjectTasksBoardShell() {
  useSettingsBridgeHydration();
  const hydrated = useHydrated();
  const [, setWorkspaceActivity] = useWorkspaceActivityFeed();
  const [profile] = usePersistentState<ProfileIdentityState>(PROFILE_IDENTITY_STORAGE_KEY, { fullName: "" });
  const [workspaceSettings] = usePersistentState<{ owner?: string }>("planix.settings.workspace", defaultWorkspaceForm);
  const cachedProjectWorkspace = readMemoryCache<{
    mode: Exclude<"loading" | "remote" | "demo" | "local", "loading">;
    bundle: ProjectWorkspaceBundle;
  }>("planix.cache.project-workspace", 1000 * 60 * 10);
  const notificationsDropdownRef = useRef<HTMLDivElement | null>(null);
  const settingsDropdownRef = useRef<HTMLDivElement | null>(null);
  const [columns, setColumns] = useState<TaskColumn[]>(() => mapApiTasksToColumns([]));
  const [tasksLoading, setTasksLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [workspaceClients, setWorkspaceClients] = useState<ClientRecord[]>([]);
  const [projects, setProjects] = usePersistentState<WorkspaceProject[]>(
    "planix.workspace.projects",
    cachedProjectWorkspace?.bundle.projects ?? INITIAL_WORKSPACE_PROJECTS,
  );
  const [workspaceTeams, setWorkspaceTeams] = usePersistentState<WorkspaceTeamRecord[]>(
    "planix.people.teams",
    cachedProjectWorkspace?.bundle.workspaceTeams ?? DEFAULT_WORKSPACE_TEAMS,
  );
  const [teamMembers, setTeamMembers] = usePersistentState<TeamMemberRecord[]>(
    "planix.project.team-members",
    cachedProjectWorkspace?.bundle.teamMembers ?? [],
  );
  const [selectedTopTab, setSelectedTopTab] = usePersistentState<ProjectTopTab>(
    "planix.projects.selected-top-tab",
    "Tasks",
  );
  const [projectNotificationsStore, setProjectNotificationsStore] = usePersistentState<Record<string, ProjectNotification[]>>(
    PROJECT_WORKSPACE_NOTIFICATIONS_STORAGE_KEY,
    cachedProjectWorkspace?.bundle.notifications ?? {},
  );
  const [projectIntegrationsStore, setProjectIntegrationsStore] = usePersistentState<Record<string, Integration[]>>(
    "planix.project.integrations",
    cachedProjectWorkspace?.bundle.integrations ?? INITIAL_PROJECT_INTEGRATIONS_STORE,
  );
  const [projectSidebarCollapsed, setProjectSidebarCollapsed] = usePersistentState<boolean>(
    "planix.projects.sidebar-collapsed",
    false,
  );
  const [projectWorkspaceMode, setProjectWorkspaceMode] = useState<"loading" | "remote" | "demo" | "local">(cachedProjectWorkspace?.mode ?? "loading");
  const {
    isLoading: notificationsCenterLoading,
    mode: notificationsCenterMode,
    projectNotificationsStore: notificationsCenterStore,
    mutate: mutateNotificationsCenter,
    refresh: refreshNotificationsCenter,
    setLocalData: setNotificationsCenterLocalData,
  } = useNotificationsCenter({ requireFresh: true });
  const [projectFilesStore, setProjectFilesStore] = useState<Record<string, ProjectFileRecord[]>>({});
  const [projectFilesLoadingStore, setProjectFilesLoadingStore] = useState<Record<string, boolean>>({});
  const [projectFilesErrorStore, setProjectFilesErrorStore] = useState<Record<string, string | null>>({});
  const [activeTrackerEntries, setActiveTrackerEntries] = useState<TimeTrackerDashboardPayload["activeEntries"]>([]);
  const [activeTrackerLoading, setActiveTrackerLoading] = useState(false);
  const [activeTrackerReady, setActiveTrackerReady] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [pendingProjectDeleteId, setPendingProjectDeleteId] = useState<number | null>(null);
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [goalsModalOpen, setGoalsModalOpen] = useState(false);
  const [editProjectModalOpen, setEditProjectModalOpen] = useState(false);
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [discussionThreadCount, setDiscussionThreadCount] = useState(0);
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [tags, setTags] = usePersistentState<TagDefinition[]>("planix.project.tags", DEFAULT_TAGS);
  const [taskModal, setTaskModal] = useState<TaskModalState>(null);
  const [assigneeMenuOpen, setAssigneeMenuOpen] = useState(false);
  const [selectedSort, setSelectedSort] = usePersistentState<string>(
    "planix.projects.selected-sort",
    "Sort By",
  );
  const [selectedView, setSelectedView] = usePersistentState<ProjectView>(
    "planix.projects.selected-view",
    "Board View",
  );
  const [taskFilters, setTaskFilters] = useState<TaskFiltersState>(DEFAULT_TASK_FILTERS);
  const [dragState, setDragState] = useState<DragState>(null);
  const [listStatusMenu, setListStatusMenu] = useState<ListStatusMenuState>(null);
  const [taskForm, setTaskForm] = useState<TaskFormState>(() => createEmptyTaskForm(boardColumns[0].id));
  const [taskModalForm, setTaskModalForm] = useState<TaskFormState>(() => createEmptyTaskForm(boardColumns[0].id));
  const [drawerTab, setDrawerTab] = useState<DrawerTab>("description");
  const [pendingDeleteTask, setPendingDeleteTask] = useState<TaskModalRecord | null>(null);
  const [dragIndicator, setDragIndicator] = useState<{
    columnId: string;
    targetTaskId: number | null;
    position: "before" | "after" | "empty";
  } | null>(null);
  const projectsRef = useRef(projects);
  const teamMembersRef = useRef(teamMembers);
  const projectNotificationsRef = useRef(projectNotificationsStore);
  const projectIntegrationsRef = useRef(projectIntegrationsStore);
  const columnsRef = useRef(columns);
  const dragStateRef = useRef(dragState);
  const hasActiveTaskFiltersRef = useRef(false);
  const boardScrollViewportRef = useRef<HTMLDivElement | null>(null);
  const dragAutoScrollFrameRef = useRef<number | null>(null);
  const dragAutoScrollDirectionRef = useRef<-1 | 0 | 1>(0);
  const touchDragSessionRef = useRef<TouchDragSession | null>(null);
  const touchDragTimerRef = useRef<number | null>(null);
  const suppressCardClickRef = useRef<number | null>(null);
  const activeTrackerRevisionRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    async function loadWorkspaceClients() {
      try {
        const response = await fetch("/api/clients", { cache: "no-store" });
        const payload = await readJsonSafely<{ clients?: ClientRecord[] }>(response);

        if (!response.ok || !payload?.clients || cancelled) {
          return;
        }

        setWorkspaceClients(payload.clients);
      } catch {
        // Keep the current client list when the remote fetch is unavailable.
      }
    }

    void loadWorkspaceClients();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => () => {
    dragAutoScrollDirectionRef.current = 0;

    if (dragAutoScrollFrameRef.current !== null) {
      window.cancelAnimationFrame(dragAutoScrollFrameRef.current);
    }
  }, []);

  useEffect(() => {
    if (!createModalOpen && !editProjectModalOpen) {
      return;
    }

    let cancelled = false;

    async function refreshWorkspaceClients() {
      try {
        const response = await fetch("/api/clients", { cache: "no-store" });
        const payload = await readJsonSafely<{ clients?: ClientRecord[] }>(response);

        if (!response.ok || !payload?.clients || cancelled) {
          return;
        }

        setWorkspaceClients(payload.clients);
      } catch {
        // Leave the current client snapshot in place if refresh fails.
      }
    }

    void refreshWorkspaceClients();

    return () => {
      cancelled = true;
    };
  }, [createModalOpen, editProjectModalOpen]);

  const hasProjects = projects.length > 0;
  const activeProject = useMemo(
    () =>
      projects.find((project) => project.active)
      ?? projects[0]
      ?? {
        id: 0,
        name: "",
        category: "",
        tone: "sand" as const,
        initials: "",
      },
    [projects],
  );
  const activeProjectRef = hasProjects ? String(activeProject.id) : "";
  const activeProjectNotifications = activeProjectRef ? (notificationsCenterStore[activeProjectRef] ?? []) : [];
  const projectNotificationsReady = hydrated && !notificationsCenterLoading;
  const activeProjectIntegrations = activeProjectRef ? (projectIntegrationsStore[activeProjectRef] ?? cloneDefaultIntegrations()) : [];
  const activeProjectFiles = projectFilesStore[activeProjectRef] ?? [];
  const activeProjectFilesLoading = projectFilesLoadingStore[activeProjectRef] ?? false;
  const activeProjectFilesError = projectFilesErrorStore[activeProjectRef] ?? null;
  const activeProjectDetails = useMemo(
    () => ({
      type: activeProject?.projectType || activeProject?.category || "Not set",
      startDate: formatProjectDisplayDate(activeProject?.startDate),
      deadline: formatProjectDisplayDate(activeProject?.deadline),
    }),
    [activeProject],
  );
  const activeProjectDescription = activeProject?.description
    || (hasProjects
      ? buildProjectDescription(
          activeProject.name,
          activeProject.projectType || activeProject.category || "project",
          undefined,
          activeProject.startDate,
          activeProject.deadline,
        )
      : "");
  const activeProjectClient = useMemo(
    () => workspaceClients.find((client) => client.id === activeProject?.clientId),
    [activeProject?.clientId, workspaceClients],
  );
  const activeProjectClientName = useMemo(
    () => activeProjectClient?.company || "No client linked",
    [activeProjectClient],
  );
  const defaultWorkspaceTeamName = workspaceTeams[0]?.name ?? DEFAULT_WORKSPACE_TEAMS[0]?.name ?? "Design";
  const projectTeamMembers = useMemo<ProjectTeamMember[]>(() => {
    const assignedMembers = activeProject?.members ?? [];

    return assignedMembers.map((assignment, index) => {
      const assignmentKey = `${assignment.email?.trim().toLowerCase() || ""}::${assignment.name.trim().toLowerCase()}`;
      const matchingMember = teamMembers.find((member) =>
        (assignment.email && member.email.trim().toLowerCase() === assignment.email.trim().toLowerCase())
        || member.name.trim().toLowerCase() === assignment.name.trim().toLowerCase(),
      );
      const resolvedTeam = resolveProjectAssignmentTeam(workspaceTeams, assignment, matchingMember);

      return {
        assignmentKey,
        id: matchingMember?.id ?? `project-member-${activeProject.id}-${index}`,
        name: assignment.name,
        email: matchingMember?.email ?? assignment.email ?? buildProjectMemberFallbackEmail(assignment.name),
        messageContactId: matchingMember?.id,
        messageContactEmail: matchingMember?.email,
        avatarInitials: matchingMember?.avatarInitials ?? buildProjectInitials(assignment.name),
        avatarTone: matchingMember?.avatarTone ?? PROJECT_TONE_SEQUENCE[index % PROJECT_TONE_SEQUENCE.length],
        avatarImage: matchingMember?.avatarImage,
        dateAdded: matchingMember?.dateAdded ?? formatProjectDisplayDate(activeProject.startDate),
        lastActive: matchingMember?.lastActive ?? "Updated just now",
        teamId: resolvedTeam.teamId,
        team: resolvedTeam.teamName || defaultWorkspaceTeamName,
      };
    });
  }, [activeProject, defaultWorkspaceTeamName, teamMembers, workspaceTeams]);
  const activeProjectMembers = useMemo(
    () =>
      projectTeamMembers.slice(0, 5).map((member) => ({
        initials: member.avatarInitials,
        tone: member.avatarTone,
        imageSrc: member.avatarImage,
      })),
    [projectTeamMembers],
  );
  const taskAssigneeOptions = useMemo<AssigneeOption[]>(
    () =>
      projectTeamMembers.map((member) => ({
        name: member.name,
        initials: member.avatarInitials,
        tone: member.avatarTone,
      })),
    [projectTeamMembers],
  );
  const activeProjectOverflowCount = Math.max(projectTeamMembers.length - activeProjectMembers.length, 0);
  const actorName = resolveTimeTrackerActorName(profile.fullName, workspaceSettings.owner);
  const activeTrackedTaskIds = useMemo(
    () =>
      new Set(
        activeTrackerEntries
          .filter((entry) => entry.projectRef === activeProjectRef && entry.taskId !== null)
          .map((entry) => Number(entry.taskId)),
      ),
    [activeProjectRef, activeTrackerEntries],
  );
  const shouldTrackTaskActivity = selectedTopTab === "Tasks" || taskModal !== null;
  const applyActiveTrackerEntries = useCallback((entries: TimeTrackerDashboardPayload["activeEntries"]) => {
    activeTrackerRevisionRef.current += 1;
    setActiveTrackerEntries(entries);
    setActiveTrackerReady(true);
    setActiveTrackerLoading(false);
  }, []);
  const handleTaskModalTrackerEntriesChange = useCallback((entries: TimeTrackerDashboardPayload["activeEntries"]) => {
    applyActiveTrackerEntries(entries);
  }, [applyActiveTrackerEntries]);
  const loadActiveTracker = useCallback(
    async ({
      silent = false,
      clearOnError = true,
    }: {
      silent?: boolean;
      clearOnError?: boolean;
    } = {}) => {
      if (typeof document !== "undefined" && document.hidden) {
        return;
      }

      const requestRevision = activeTrackerRevisionRef.current + 1;
      activeTrackerRevisionRef.current = requestRevision;

      try {
        if (!silent) {
          setActiveTrackerLoading(true);
        }
        const response = await fetch(`/api/time-tracker?actorName=${encodeURIComponent(actorName)}`, {
          cache: "no-store",
        });
        const result = await readJsonSafely<{
          dashboard?: TimeTrackerDashboardPayload;
        }>(response);

        if (!response.ok || !result?.dashboard) {
          throw new Error("Failed to load tracker state.");
        }

        if (requestRevision !== activeTrackerRevisionRef.current) {
          return;
        }

        setActiveTrackerEntries(result.dashboard.activeEntries ?? []);
        setActiveTrackerReady(true);
      } catch {
        if (requestRevision !== activeTrackerRevisionRef.current) {
          return;
        }

        if (clearOnError) {
          setActiveTrackerEntries([]);
        }
        setActiveTrackerReady(true);
      } finally {
        if (!silent && requestRevision === activeTrackerRevisionRef.current) {
          setActiveTrackerLoading(false);
        }
      }
    },
    [actorName],
  );
  const activeProjectClientContacts = useMemo<ProjectClientContact[]>(() => {
    if (activeProjectClient?.employees?.length) {
      return activeProjectClient.employees.map((employee, index) => ({
        id: employee.id ?? `client-contact-${activeProjectClient.id}-${index}`,
        name: employee.name,
        role: employee.role,
        email: employee.email ?? `${employee.name.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@${activeProjectClient.website}`,
        company: activeProjectClient.company,
        avatarInitials: employee.initials ?? buildProjectInitials(employee.name),
        avatarTone: employee.tone ?? PROJECT_TONE_SEQUENCE[index % PROJECT_TONE_SEQUENCE.length],
        joinedOn: formatProjectDisplayDate(activeProject.startDate),
        location: employee.location,
        department: employee.department,
        status: employee.status ? employee.status[0].toUpperCase() + employee.status.slice(1) : "Active",
        website: activeProjectClient.website,
      }));
    }

    if (activeProjectClient) {
      return [{
        id: `${activeProjectClient.id}-primary-contact`,
        name: activeProjectClient.contactName,
        role: activeProjectClient.contactRole,
        email: activeProjectClient.email,
        company: activeProjectClient.company,
        avatarInitials: buildProjectInitials(activeProjectClient.contactName),
        avatarTone: activeProjectClient.owner.tone,
        joinedOn: formatProjectDisplayDate(activeProject.startDate),
        location: activeProjectClient.location,
        status: activeProjectClient.stage,
        website: activeProjectClient.website,
      }];
    }

    return [];
  }, [activeProject.startDate, activeProjectClient]);
  const activeProjectEditValues = useMemo<EditProjectDetailsFormState>(
    () => ({
      projectName: activeProject?.name ?? "",
      projectType: activeProject?.projectType || activeProject?.category || "",
      clientId: activeProject?.clientId ?? "",
      startDate: activeProject?.startDate ?? "",
      deadline: activeProject?.deadline ?? "",
      description: activeProject?.description || buildProjectDescription(
        activeProject?.name ?? "",
        activeProject?.projectType || activeProject?.category || "project",
        activeProjectClient?.company,
        activeProject?.startDate,
        activeProject?.deadline,
      ),
    }),
    [
      activeProject?.category,
      activeProject?.clientId,
      activeProject?.deadline,
      activeProject?.description,
      activeProject?.name,
      activeProject?.projectType,
      activeProject?.startDate,
      activeProjectClient?.company,
    ],
  );
  const activeProjectDocuments = useMemo(
    () => buildProjectDocumentsFromFiles(activeProject?.documents?.length ? activeProject.documents : cloneDefaultProjectDocuments(), activeProjectFiles),
    [activeProject?.documents, activeProjectFiles],
  );
  const activeProjectGoals = activeProject?.goals?.length ? activeProject.goals : cloneDefaultProjectGoals();
  const totalTasksCount = useMemo(
    () => columns.reduce((sum, column) => sum + column.tasks.length, 0),
    [columns],
  );
  const completedTasksCount = useMemo(
    () => columns.find((column) => column.id === "completed")?.tasks.length ?? 0,
    [columns],
  );
  const canMarkActiveProjectComplete = useMemo(
    () => totalTasksCount > 0 && completedTasksCount === totalTasksCount,
    [completedTasksCount, totalTasksCount],
  );
  const upcomingTasksCount = useMemo(
    () =>
      columns.reduce(
        (sum, column) =>
          sum
          + column.tasks.filter((task) => {
            const dueDate = parseTaskDueDate(task.dueDate);

            if (!dueDate) {
              return false;
            }

            return dueDate.getTime() >= Date.now();
          }).length,
        0,
      ),
    [columns],
  );
  const activeProjectMemberCount = activeProject?.members?.length || 0;
  const filteredColumns = useMemo(() => applyTaskFilters(columns, taskFilters), [columns, taskFilters]);
  const filteredTaskCount = useMemo(
    () => filteredColumns.reduce((sum, column) => sum + column.tasks.length, 0),
    [filteredColumns],
  );
  const hasActiveTaskFilters = useMemo(
    () =>
      taskFilters.statusId !== "all"
      || taskFilters.assigneeName !== "all"
      || taskFilters.tag !== "all"
      || taskFilters.dueState !== "all",
    [taskFilters],
  );
  const availableAssignees = useMemo(() => {
    const names = new Set(columns.flatMap((column) => column.tasks.flatMap((task) => task.assignees.map((assignee) => assignee.name))));
    return taskAssigneeOptions.filter((member) => names.has(member.name));
  }, [columns, taskAssigneeOptions]);
  const availableTags = useMemo(() => {
    const labels = new Set(columns.flatMap((column) => column.tasks.map((task) => task.tag)));
    return tags.filter((tag) => labels.has(tag.label));
  }, [columns, tags]);
  const projectSearchResults = useMemo<SearchOverlayResult[]>(() => {
    const taskResults = columns.flatMap((column) =>
      column.tasks.map((task) => ({
        id: `task-${task.id}`,
        title: task.title,
        description: `${column.title} task${task.dueLabel ? ` · Due ${task.dueLabel}` : ""}`,
        kind: "task" as const,
        searchText: [
          column.title,
          task.description,
          task.tag,
          task.priority,
          task.assignees.map((assignee) => assignee.name).join(" "),
          task.dueLabel ?? "",
        ].join(" "),
      })),
    );

    const memberResults = projectTeamMembers.map((member) => ({
      id: `member-${member.id}`,
      title: member.name,
      description: `Team member · ${member.team}`,
      kind: "member" as const,
      searchText: [member.team, member.role, member.email].filter(Boolean).join(" "),
    }));

    const documentResults = activeProjectDocuments.map((document) => ({
      id: `document-${document.id}`,
      title: document.title,
      description: `Document · ${document.fileName ?? document.description}`,
      kind: "document" as const,
      searchText: [document.description, document.fileName, document.mimeType, document.fileSize].filter(Boolean).join(" "),
    }));

    const fileResults = activeProjectFiles.map((file) => ({
      id: `file-${file.id}`,
      title: file.name,
      description: `File · ${formatProjectFileSize(file.sizeBytes)} · ${formatProjectDisplayDate(file.updatedAt)}`,
      kind: "file" as const,
      searchText: [file.mimeType, file.name].join(" "),
    }));

    const goalResults = activeProjectGoals.map((goal) => ({
      id: `goal-${goal.id}`,
      title: goal.title,
      description: `Goal · ${goal.description}`,
      kind: "goal" as const,
      searchText: goal.description,
    }));

    const detailResults: SearchOverlayResult[] = [
      {
        id: "detail-project-type",
        title: activeProjectDetails.type,
        description: "Project detail · Type",
        kind: "detail",
        searchText: `${activeProject.name} ${activeProjectDetails.type}`,
      },
      {
        id: "detail-start-date",
        title: activeProjectDetails.startDate,
        description: "Project detail · Start Date",
        kind: "detail",
        searchText: `${activeProject.name} ${activeProjectDetails.startDate}`,
      },
      {
        id: "detail-deadline",
        title: activeProjectDetails.deadline,
        description: "Project detail · Deadline",
        kind: "detail",
        searchText: `${activeProject.name} ${activeProjectDetails.deadline}`,
      },
    ];

    const notificationResults = activeProjectNotifications.map((notification) => ({
      id: `notification-${notification.id}`,
      title: notification.title,
      description: `Notification · ${notification.body}`,
      kind: "notification" as const,
      searchText: [notification.body, notification.kind, notification.targetTab, notification.time].filter(Boolean).join(" "),
    }));

    return [
      ...taskResults,
      ...memberResults,
      ...documentResults,
      ...fileResults,
      ...goalResults,
      ...detailResults,
      ...notificationResults,
    ];
  }, [
    activeProject.name,
    activeProjectDetails.deadline,
    activeProjectDetails.startDate,
    activeProjectDetails.type,
    activeProjectDocuments,
    activeProjectFiles,
    activeProjectGoals,
    columns,
    projectTeamMembers,
    activeProjectNotifications,
  ]);
  const selectedTaskRecord = useMemo<TaskModalRecord | null>(() => {
    if (!taskModal) {
      return null;
    }

    const selectedColumn = columns.find((column) => column.id === taskModal.columnId);
    const selectedTask = selectedColumn?.tasks.find((task) => task.id === taskModal.taskId);

    if (!selectedColumn || !selectedTask) {
      return null;
    }

    return {
      task: selectedTask,
      columnId: selectedColumn.id,
      columnTitle: selectedColumn.title,
    };
  }, [columns, taskModal]);

  useEffect(() => {
    if (!hasProjects || tasksLoading || !activeProject.completed) {
      return;
    }

    if (totalTasksCount > 0 && completedTasksCount === totalTasksCount) {
      return;
    }

    void handleSetActiveProjectCompleted(false, { notify: false });
  }, [
    activeProject.completed,
    completedTasksCount,
    hasProjects,
    tasksLoading,
    totalTasksCount,
  ]);

  useEffect(() => {
    if (!hydrated || !shouldTrackTaskActivity) {
      setActiveTrackerLoading(false);
      return;
    }

    const runLoad = async ({
      silent = false,
      clearOnError = true,
    }: {
      silent?: boolean;
      clearOnError?: boolean;
    } = {}) => {
      await loadActiveTracker({ silent, clearOnError });
    };

    void runLoad({ silent: activeTrackerReady, clearOnError: !activeTrackerReady });
    const pollInterval = window.setInterval(() => {
      void runLoad({ silent: true, clearOnError: false });
    }, activeTrackerEntries.length > 0 ? 30000 : 120000);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        void runLoad({ silent: true, clearOnError: false });
      }
    };
    const handleTrackerChanged = () => {
      void runLoad({ silent: true, clearOnError: false });
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener(TIME_TRACKER_CHANGED_EVENT, handleTrackerChanged);

    return () => {
      window.clearInterval(pollInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener(TIME_TRACKER_CHANGED_EVENT, handleTrackerChanged);
    };
  }, [activeTrackerEntries.length, activeTrackerReady, hydrated, loadActiveTracker, shouldTrackTaskActivity]);

  useEffect(() => {
    if (!hydrated || !taskModal) {
      return;
    }

    void loadActiveTracker({ silent: false, clearOnError: false });
  }, [hydrated, loadActiveTracker, taskModal]);

  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  useEffect(() => {
    columnsRef.current = columns;
  }, [columns]);

  useEffect(() => {
    dragStateRef.current = dragState;
  }, [dragState]);

  useEffect(() => {
    hasActiveTaskFiltersRef.current = hasActiveTaskFilters;
  }, [hasActiveTaskFilters]);

  useEffect(() => {
    teamMembersRef.current = teamMembers;
  }, [teamMembers]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    setWorkspaceTeams((currentTeams) => normalizeWorkspaceTeams(currentTeams));
  }, [hydrated, setWorkspaceTeams]);

  useEffect(() => {
    projectNotificationsRef.current = projectNotificationsStore;
  }, [projectNotificationsStore]);

  useEffect(() => {
    projectIntegrationsRef.current = projectIntegrationsStore;
  }, [projectIntegrationsStore]);

  useEffect(() => {
    if (projectWorkspaceMode === "loading") {
      return;
    }

    writeMemoryCache("planix.cache.project-workspace", {
      mode: projectWorkspaceMode,
      bundle: normalizeProjectWorkspaceBundle({
        projects,
        teamMembers,
        workspaceTeams,
        notifications: projectNotificationsStore,
        integrations: projectIntegrationsStore,
      }),
    });
  }, [projectIntegrationsStore, projectNotificationsStore, projectWorkspaceMode, projects, teamMembers, workspaceTeams]);

  function applyProjectWorkspaceBundle(bundle: ProjectWorkspaceBundle) {
    projectsRef.current = bundle.projects;
    teamMembersRef.current = bundle.teamMembers;
    projectNotificationsRef.current = bundle.notifications;
    projectIntegrationsRef.current = bundle.integrations;
    setProjects(bundle.projects);
    setTeamMembers(bundle.teamMembers);
    setProjectNotificationsStore(bundle.notifications);
    setProjectIntegrationsStore(bundle.integrations);
  }

  async function persistProjectWorkspaceBundle(input?: Partial<ProjectWorkspaceBundle>) {
    if (projectWorkspaceMode !== "remote") {
      return null;
    }

    const response = await fetch("/api/projects", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        projects: input?.projects ?? projectsRef.current,
        teamMembers: input?.teamMembers ?? teamMembersRef.current,
        notifications: input?.notifications ?? projectNotificationsRef.current,
        integrations: input?.integrations ?? projectIntegrationsRef.current,
      }),
    });
    const result = await readJsonSafely<{
      bundle?: ProjectWorkspaceBundle;
      error?: string;
    }>(response);

    if (!response.ok || !result?.bundle) {
      throw new Error(result?.error || "Project workspace update failed.");
    }

    applyProjectWorkspaceBundle(result.bundle);
    return result.bundle;
  }

  function dedupeNotificationRecipients(
    recipients: Array<{
      email?: string;
      name?: string;
    }>,
  ) {
    const seen = new Set<string>();

    return recipients
      .map((recipient) => ({
        email: recipient.email?.trim().toLowerCase() ?? "",
        name: recipient.name?.trim() || undefined,
      }))
      .filter((recipient) => {
        if (!recipient.email || seen.has(recipient.email)) {
          return false;
        }

        seen.add(recipient.email);
        return true;
      });
  }

  function resolveTaskNotificationRecipients(assigneeNames: string[]) {
    return dedupeNotificationRecipients(
      projectTeamMembers
        .filter((member) => assigneeNames.includes(member.name))
        .map((member) => ({
          email: member.email,
          name: member.name,
        })),
    );
  }

  async function dispatchNotificationEmailEvent(payload: {
    eventType: "project-created" | "task-assigned" | "task-stage-changed";
    eventKey: string;
    projectRef?: string;
    projectName?: string;
    projectType?: string;
    startDate?: string;
    deadline?: string;
    memberCount?: number;
    taskId?: number;
    taskTitle?: string;
    statusId?: string;
    previousStatusId?: string;
    dueDate?: string;
    reminderDate?: string;
    recipients: Array<{
      email?: string;
      name?: string;
    }>;
  }) {
    if (projectWorkspaceMode !== "remote") {
      return;
    }

    try {
      const response = await fetch("/api/notifications/email-event", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
        }),
      });

      if (!response.ok) {
        throw new Error("Notification email dispatch failed.");
      }
    } catch (error) {
      console.error("Failed to send notification email event:", error);
    }
  }

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    let cancelled = false;

    async function loadProjectWorkspace() {
      try {
        const response = await fetch("/api/projects", {
          cache: "no-store",
        });
        const result = await readJsonSafely<{
          bundle?: ProjectWorkspaceBundle;
          mode?: "remote" | "demo";
          error?: string;
        }>(response);

        if (!response.ok) {
          throw new Error(result?.error || "Failed to load project workspace.");
        }

        if (cancelled) {
          return;
        }

        if (result?.mode === "remote" && result.bundle) {
          applyProjectWorkspaceBundle(result.bundle);
          setWorkspaceTeams(normalizeWorkspaceTeams(result.bundle.workspaceTeams));
          setProjectWorkspaceMode("remote");
          return;
        }

        setProjectWorkspaceMode("demo");
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load project workspace:", error);
          setProjectWorkspaceMode("local");
        }
      } finally {
      }
    }

    void loadProjectWorkspace();

    return () => {
      cancelled = true;
    };
  }, [hydrated, setProjectIntegrationsStore, setProjectNotificationsStore, setProjects, setTeamMembers, setWorkspaceTeams]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (projectWorkspaceMode === "loading") {
      return;
    }

    if (!activeProjectRef) {
      setColumns(mapApiTasksToColumns([]));
      setTasksLoading(false);
      return;
    }

    const cachedColumns = readProjectTasksCache(activeProjectRef);

    if (cachedColumns) {
      setColumns(cachedColumns);
      setTasksLoading(false);
    } else {
      setTasksLoading(true);
    }

    async function loadTasks() {
      try {
        const response = await fetch(`/api/tasks?projectRef=${encodeURIComponent(activeProjectRef)}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          if (!cachedColumns) {
            setColumns(mapApiTasksToColumns([]));
          }
          setTasksLoading(false);
          return;
        }

        const result = await readJsonSafely<{
          tasks?: Array<{
            id: number;
            title: string;
            description: string;
            status_id: string;
            tag: string;
            priority: "Normal" | "Medium" | "High" | "Done";
            assigned_to: string | null;
            due_date: string | null;
            reminder_at: string | null;
            reminder_date: string | null;
            created_by: string;
            subtasks: unknown;
            notes: string[] | null;
            created_at: string;
          }>;
        }>(response);

        setColumns(mapApiTasksToColumns(Array.isArray(result?.tasks) ? result.tasks : []));
      } catch (error) {
        console.error("Failed to load tasks:", error);
        if (!cachedColumns) {
          setColumns(mapApiTasksToColumns([]));
        }
      } finally {
        setTasksLoading(false);
      }
    }

    void loadTasks();
  }, [activeProjectRef, hydrated, projectWorkspaceMode]);

  useEffect(() => {
    if (!activeProjectRef) {
      return;
    }

    if (projectWorkspaceMode === "remote" || projectWorkspaceMode === "loading") {
      return;
    }

    setProjectNotificationsStore((current) => {
      if (current[activeProjectRef]) {
        return current;
      }

      return {
        ...current,
        [activeProjectRef]: cloneDefaultProjectNotifications(),
      };
    });
  }, [activeProjectRef, projectWorkspaceMode, setProjectNotificationsStore]);

  useEffect(() => {
    if (!activeProjectRef) {
      setDiscussionThreadCount(0);
      return;
    }

    if (projectWorkspaceMode === "loading") {
      return;
    }

    let cancelled = false;

    async function loadDiscussionCount() {
      try {
        const response = await fetch(`/api/discussions?projectRef=${encodeURIComponent(activeProjectRef)}`, {
          cache: "no-store",
        });
        const result = await readJsonSafely<{
          discussions?: {
            threads?: Array<{ id: string }>;
          };
        }>(response);

        if (!cancelled && response.ok) {
          setDiscussionThreadCount(Array.isArray(result?.discussions?.threads) ? result.discussions.threads.length : 0);
        }
      } catch {
        if (!cancelled) {
          setDiscussionThreadCount(0);
        }
      }
    }

    void loadDiscussionCount();

    return () => {
      cancelled = true;
    };
  }, [activeProjectRef, projectWorkspaceMode]);

  useEffect(() => {
    if (!activeProjectRef) {
      setProjectFilesLoadingStore((current) => ({ ...current, "": false }));
      return;
    }

    if (projectWorkspaceMode === "loading") {
      return;
    }

    let cancelled = false;

    async function loadProjectFiles() {
      setProjectFilesLoadingStore((current) => ({ ...current, [activeProjectRef]: true }));
      setProjectFilesErrorStore((current) => ({ ...current, [activeProjectRef]: null }));

      try {
        const response = await fetch(`/api/project-files?projectRef=${encodeURIComponent(activeProjectRef)}`, {
          cache: "no-store",
        });
        const result = await readJsonSafely<{
          files?: ProjectFileRecord[];
          error?: string;
        }>(response);

        if (!response.ok) {
          throw new Error(result?.error || "Failed to load project files.");
        }

        if (!cancelled) {
          setProjectFilesStore((current) => ({
            ...current,
            [activeProjectRef]: Array.isArray(result?.files) ? result.files : [],
          }));
        }
      } catch (error) {
        if (!cancelled) {
          setProjectFilesErrorStore((current) => ({
            ...current,
            [activeProjectRef]: error instanceof Error ? error.message : "Failed to load project files.",
          }));
          setProjectFilesStore((current) => ({
            ...current,
            [activeProjectRef]: current[activeProjectRef] ?? [],
          }));
        }
      } finally {
        if (!cancelled) {
          setProjectFilesLoadingStore((current) => ({ ...current, [activeProjectRef]: false }));
        }
      }
    }

    void loadProjectFiles();

    return () => {
      cancelled = true;
    };
  }, [activeProjectRef, projectWorkspaceMode]);

  useEffect(() => {
    if (tasksLoading) {
      return;
    }

    writeMemoryCache(getProjectTasksCacheKey(activeProjectRef), columns);
  }, [activeProjectRef, columns, tasksLoading]);

  useEffect(() => {
    setTaskFilters(DEFAULT_TASK_FILTERS);
    setFilterOpen(false);
    setSortOpen(false);
    setListStatusMenu(null);
    setDrawerOpen(false);
    setTaskModal(null);
    setPendingDeleteTask(null);
  }, [activeProjectRef]);

  useEffect(() => {
    if (!notificationsOpen && !settingsOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (notificationsOpen && notificationsDropdownRef.current && !notificationsDropdownRef.current.contains(target)) {
        setNotificationsOpen(false);
      }

      if (settingsOpen && settingsDropdownRef.current && !settingsDropdownRef.current.contains(target)) {
        setSettingsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setNotificationsOpen(false);
        setSettingsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [notificationsOpen, settingsOpen]);

  const projectBoardReady = hydrated && projectWorkspaceMode !== "loading" && !tasksLoading;
  const activeProjectUnreadNotificationCount = useMemo(
    () => activeProjectNotifications.filter((notification) => notification.unread).length,
    [activeProjectNotifications],
  );
  const projectTopTabs = useMemo(
    () =>
      topTabs.map((tab) => {
        if (tab.label === "Discussions") {
          return {
            ...tab,
            badge: discussionThreadCount > 0 ? String(discussionThreadCount) : null,
          };
        }

        if (tab.label === "Notifications") {
          return {
            ...tab,
            badge: activeProjectUnreadNotificationCount > 0 ? String(activeProjectUnreadNotificationCount) : null,
          };
        }

        return {
          ...tab,
          badge: null,
        };
      }),
    [activeProjectUnreadNotificationCount, discussionThreadCount],
  );

  function applyActiveProjectFiles(nextFiles: ProjectFileRecord[]) {
    setProjectFilesStore((current) => ({
      ...current,
      [activeProjectRef]: nextFiles,
    }));
    setProjectFilesErrorStore((current) => ({
      ...current,
      [activeProjectRef]: null,
    }));
  }

  async function requestProjectFilesUpdate(
    input: Promise<Response>,
    fallbackMessage: string,
  ) {
    const response = await input;
    const result = await readJsonSafely<{
      files?: ProjectFileRecord[];
      error?: string;
    }>(response);

    if (!response.ok) {
      throw new Error(result?.error || fallbackMessage);
    }

    const nextFiles = Array.isArray(result?.files) ? result.files : [];
    applyActiveProjectFiles(nextFiles);
    return nextFiles;
  }

  async function handleUploadProjectFiles(files: File[]) {
    const formData = new FormData();
    formData.set("projectRef", activeProjectRef);
    files.forEach((file) => formData.append("files", file));
    const nextFiles = await requestProjectFilesUpdate(
      fetch("/api/project-files", {
        method: "POST",
        body: formData,
      }),
      "Failed to upload project files.",
    );

    prependProjectNotification(createProjectNotification({
      title: files.length === 1 ? "File uploaded" : "Files uploaded",
      body: files.length === 1
        ? `${files[0]?.name ?? "A file"} was added to the project files workspace.`
        : `${files.length} files were added to the project files workspace.`,
      kind: "comment",
      targetTab: "Files",
    }));
    setWorkspaceActivity((current) =>
      pushWorkspaceActivity(current, {
        name: activeProject.name,
        initials: activeProject.initials,
        tone: activeProject.tone,
        status: "online",
        action: files.length === 1 ? "Uploaded a project file" : `Uploaded ${files.length} project files`,
        detail: files[0]?.name ?? `${nextFiles.length} files`,
      }),
    );

    return nextFiles;
  }

  async function handleRenameProjectFile(fileId: string, name: string) {
    const targetFile = activeProjectFiles.find((file) => file.id === fileId);
    await requestProjectFilesUpdate(
      fetch("/api/project-files", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          action: "rename",
          projectRef: activeProjectRef,
          fileId,
          name,
        }),
      }),
      "Failed to rename the project file.",
    );

    prependProjectNotification(createProjectNotification({
      title: "File renamed",
      body: `${targetFile?.name ?? "A file"} was renamed in project files.`,
      kind: "comment",
      targetTab: "Files",
    }));
  }

  async function handleDuplicateProjectFile(fileId: string) {
    const targetFile = activeProjectFiles.find((file) => file.id === fileId);
    await requestProjectFilesUpdate(
      fetch("/api/project-files", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          action: "duplicate",
          projectRef: activeProjectRef,
          fileId,
        }),
      }),
      "Failed to duplicate the project file.",
    );

    prependProjectNotification(createProjectNotification({
      title: "File duplicated",
      body: `${targetFile?.name ?? "A file"} was copied in project files.`,
      kind: "comment",
      targetTab: "Files",
    }));
  }

  async function handleDeleteProjectFile(fileId: string) {
    const targetFile = activeProjectFiles.find((file) => file.id === fileId);
    await requestProjectFilesUpdate(
      fetch("/api/project-files", {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          projectRef: activeProjectRef,
          fileId,
        }),
      }),
      "Failed to delete the project file.",
    );

    prependProjectNotification(createProjectNotification({
      title: "File removed",
      body: `${targetFile?.name ?? "A file"} was removed from project files.`,
      kind: "comment",
      targetTab: "Files",
    }));
  }

  async function handleSaveProjectDocuments(drafts: DocumentUploadDraft[]) {
    const initialDocuments = new Map(
      activeProjectDocuments.map((document) => [document.id, document]),
    );
    const changedDrafts = drafts.filter((draft) => {
      const currentDocument = initialDocuments.get(draft.id);
      return Boolean(draft.selectedFile) || Boolean(!draft.file && currentDocument?.linkedFileId);
    });

    if (changedDrafts.length === 0) {
      return;
    }

    for (const draft of changedDrafts) {
      const currentDocument = initialDocuments.get(draft.id);

      if (draft.selectedFile) {
        const formData = new FormData();
        formData.set("projectRef", activeProjectRef);
        formData.set("documentId", draft.id);
        formData.append("files", draft.selectedFile);
        await requestProjectFilesUpdate(
          fetch("/api/project-files", {
            method: "POST",
            body: formData,
          }),
          `Failed to upload ${draft.title}.`,
        );
        continue;
      }

      if (!draft.file && currentDocument?.linkedFileId) {
        await requestProjectFilesUpdate(
          fetch("/api/project-files", {
            method: "DELETE",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({
              projectRef: activeProjectRef,
              fileId: currentDocument.linkedFileId,
            }),
          }),
          `Failed to remove ${draft.title}.`,
        );
      }
    }

    prependProjectNotification(createProjectNotification({
      title: "Documents updated",
      body: "Project documents were updated in the overview section.",
      kind: "comment",
      targetTab: "Overview",
    }));
    setWorkspaceActivity((current) =>
      pushWorkspaceActivity(current, {
        name: activeProject.name,
        initials: activeProject.initials,
        tone: activeProject.tone,
        status: "online",
        action: "Updated project documents",
        detail: `${changedDrafts.length} document slot${changedDrafts.length === 1 ? "" : "s"} updated`,
      }),
    );
  }

  function addTag(label: string, color: string) {
    setTags((current) => [...current, { id: `tag-${Date.now()}`, label, color }]);
  }

  function renameTag(id: string, label: string) {
    const oldLabel = tags.find((t) => t.id === id)?.label ?? "";
    setTags((current) => current.map((t) => (t.id === id ? { ...t, label } : t)));
    setColumns((current) =>
      withColumnCounts(
        current.map((col) => ({
          ...col,
          tasks: col.tasks.map((task) =>
            task.tag === oldLabel ? { ...task, tag: label } : task,
          ),
        })),
      ),
    );
  }

  function deleteTag(id: string) {
    const tag = tags.find((t) => t.id === id);
    if (!tag) return;
    const fallback = tags.find((t) => t.id !== id)?.label ?? "";
    setTags((current) => current.filter((t) => t.id !== id));
    setColumns((current) =>
      withColumnCounts(
        current.map((col) => ({
          ...col,
          tasks: col.tasks.map((task) =>
            task.tag === tag.label ? { ...task, tag: fallback, tagTone: getTagTone(fallback) } : task,
          ),
        })),
      ),
    );
  }

  function changeTagColor(id: string, color: string) {
    setTags((current) => current.map((t) => (t.id === id ? { ...t, color } : t)));
  }

  function setActiveProject(projectId: number) {
    const previousProjects = projectsRef.current;
    const nextProjects = projectsRef.current.map((project) => ({
      ...project,
      active: project.id === projectId,
    }));
    projectsRef.current = nextProjects;
    setProjects(nextProjects);

    if (projectWorkspaceMode === "remote") {
      void persistProjectWorkspaceBundle({ projects: nextProjects }).catch((error) => {
        console.error("Failed to persist active project:", error);
        projectsRef.current = previousProjects;
        setProjects(previousProjects);
      });
    }
  }

  function updateActiveProjectNotifications(
    updater: (currentNotifications: ProjectNotification[]) => ProjectNotification[],
  ) {
    const nextNotificationsStore = {
      ...projectNotificationsRef.current,
      [activeProjectRef]: updater(projectNotificationsRef.current[activeProjectRef] ?? cloneDefaultProjectNotifications()),
    };
    projectNotificationsRef.current = nextNotificationsStore;
    setProjectNotificationsStore(nextNotificationsStore);

    if (projectWorkspaceMode === "remote") {
      void persistProjectWorkspaceBundle({ notifications: nextNotificationsStore }).catch((error) => {
        console.error("Failed to persist project notifications:", error);
      });
    }

    return nextNotificationsStore;
  }

  function updateNotificationsCenterProjectStore(
    updater: (currentNotifications: ProjectNotification[]) => ProjectNotification[],
    projectRef = activeProjectRef,
  ) {
    if (!projectRef) {
      return;
    }

    setNotificationsCenterLocalData((current) => ({
      ...current,
      projectNotificationsStore: {
        ...current.projectNotificationsStore,
        [projectRef]: updater(current.projectNotificationsStore[projectRef] ?? []),
      },
    }));
  }

  function removeNotificationsCenterProject(projectRef: string) {
    setNotificationsCenterLocalData((current) => {
      const nextStore = { ...current.projectNotificationsStore };
      delete nextStore[projectRef];

      return {
        ...current,
        projectNotificationsStore: nextStore,
      };
    });
  }

  async function runProjectNotificationMutation(
    updater: (currentNotifications: ProjectNotification[]) => ProjectNotification[],
    action?: () => Promise<void>,
  ) {
    if (!activeProjectRef) {
      return;
    }

    const previousProjectNotifications = notificationsCenterStore[activeProjectRef] ?? [];
    updateNotificationsCenterProjectStore(updater);

    if (!action || notificationsCenterMode !== "remote") {
      return;
    }

    try {
      await action();
    } catch (error) {
      console.error("Failed to update project notification state:", error);
      updateNotificationsCenterProjectStore(() => previousProjectNotifications);
      void refreshNotificationsCenter().catch(() => {
        // Keep the current UI usable even if the refresh fails.
      });
    }
  }

  async function setProjectNotificationUnreadState(notification: ProjectNotification, unread: boolean) {
    if (!activeProjectRef || notification.unread === unread) {
      return;
    }

    await runProjectNotificationMutation(
      (currentNotifications) =>
        currentNotifications.map((currentNotification) =>
          currentNotification.id === notification.id
            ? { ...currentNotification, unread }
            : currentNotification,
        ),
      async () => {
        await mutateNotificationsCenter({
          action: "set-read",
          projectRef: activeProjectRef,
          notificationId: notification.id,
          unread,
        });
      },
    );
  }

  async function removeProjectNotificationForCurrentUser(notificationId: string) {
    if (!activeProjectRef) {
      return;
    }

    await runProjectNotificationMutation(
      (currentNotifications) =>
        currentNotifications.filter((notification) => notification.id !== notificationId),
      async () => {
        await mutateNotificationsCenter({
          action: "remove",
          projectRef: activeProjectRef,
          notificationId,
        });
      },
    );
  }

  function prependProjectNotification(notification: ProjectNotification) {
    updateActiveProjectNotifications((currentNotifications) => [notification, ...currentNotifications].slice(0, 50));
    updateNotificationsCenterProjectStore(
      (currentNotifications) => [notification, ...currentNotifications.filter((currentNotification) => currentNotification.id !== notification.id)].slice(0, 50),
    );
    setWorkspaceActivity((current) =>
      pushWorkspaceActivity(
        current,
        createWorkspaceActivityFromProjectNotification(activeProject.name, notification),
      ),
    );
  }

  function prependTaskStageChangedNotification(options: {
    taskId: number;
    taskTitle: string;
    previousColumnId?: string | null;
    nextColumnId: string;
    columnsSnapshot?: TaskColumn[];
  }) {
    const columnsSnapshot = options.columnsSnapshot ?? columnsRef.current;
    const previousColumnTitle = resolveTaskColumnTitle(columnsSnapshot, options.previousColumnId);
    const nextColumnTitle = resolveTaskColumnTitle(columnsSnapshot, options.nextColumnId);

    prependProjectNotification(createProjectNotification({
      title: isCompletedTaskColumn(options.nextColumnId) ? "Task completed" : "Task stage changed",
      body: options.previousColumnId && options.previousColumnId !== options.nextColumnId
        ? `"${options.taskTitle}" moved from ${previousColumnTitle} to ${nextColumnTitle}.`
        : `"${options.taskTitle}" moved to ${nextColumnTitle}.`,
      kind: isCompletedTaskColumn(options.nextColumnId) ? "completed" : "task",
      targetTab: "Tasks",
      targetTaskId: options.taskId,
      targetColumnId: options.nextColumnId,
    }));
  }

  function recordTaskChecklistActivity(options: {
    taskTitle: string;
    checklistItemTitle: string;
    completed: boolean;
  }) {
    setWorkspaceActivity((current) =>
      pushWorkspaceActivity(current, {
        name: activeProject.name,
        initials: activeProject.initials,
        tone: activeProject.tone,
        status: options.completed ? "online" : "neutral",
        action: options.completed ? "Completed checklist item" : "Reopened checklist item",
        detail: `${options.taskTitle} · ${options.checklistItemTitle}`,
      }),
    );
  }

  async function replaceActiveProjectIntegrations(nextIntegrations: Integration[]) {
    const previousIntegrationsStore = projectIntegrationsRef.current;
    const nextIntegrationsStore = {
      ...previousIntegrationsStore,
      [activeProjectRef]: nextIntegrations.map((integration) => ({ ...integration })),
    };

    projectIntegrationsRef.current = nextIntegrationsStore;
    setProjectIntegrationsStore(nextIntegrationsStore);

    if (projectWorkspaceMode === "remote") {
      try {
        await persistProjectWorkspaceBundle({ integrations: nextIntegrationsStore });
      } catch (error) {
        console.error("Failed to persist project integrations:", error);
        projectIntegrationsRef.current = previousIntegrationsStore;
        setProjectIntegrationsStore(previousIntegrationsStore);
        throw error;
      }
    }

    return nextIntegrationsStore;
  }

  async function handleToggleProjectIntegration(integrationId: string, enabled: boolean) {
    const currentIntegrations = projectIntegrationsRef.current[activeProjectRef] ?? cloneDefaultIntegrations();
    const targetIntegration = currentIntegrations.find((integration) => integration.id === integrationId);

    if (!targetIntegration) {
      return;
    }

    await replaceActiveProjectIntegrations(
      currentIntegrations.map((integration) =>
        integration.id === integrationId
          ? { ...integration, enabled }
          : integration,
      ),
    );

    setWorkspaceActivity((current) =>
      pushWorkspaceActivity(current, {
        name: activeProject.name,
        initials: activeProject.initials,
        tone: activeProject.tone,
        status: enabled ? "online" : "neutral",
        action: enabled ? "Connected integration" : "Disconnected integration",
        detail: targetIntegration.name,
      }),
    );
  }

  async function handleAddProjectIntegration(integration: Integration) {
    const currentIntegrations = projectIntegrationsRef.current[activeProjectRef] ?? cloneDefaultIntegrations();
    await replaceActiveProjectIntegrations([integration, ...currentIntegrations]);
    setWorkspaceActivity((current) =>
      pushWorkspaceActivity(current, {
        name: activeProject.name,
        initials: activeProject.initials,
        tone: activeProject.tone,
        status: "online",
        action: "Added integration",
        detail: integration.name,
      }),
    );
  }

  async function handleExportProjectData(format: TaskCsvFormat) {
    if (!activeProjectRef) {
      throw new Error("Select a project before exporting task data.");
    }

    const response = await fetch(
      `/api/tasks/export?projectRef=${encodeURIComponent(activeProjectRef)}&projectName=${encodeURIComponent(activeProject.name)}&format=${encodeURIComponent(format)}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const payload = await readJsonSafely<{ error?: string }>(response);
      throw new Error(payload?.error || "Failed to export project tasks.");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const fallbackFileName = buildTaskCsvFilename(activeProject.name, format);

    link.href = url;
    link.download = extractDownloadFilename(response.headers.get("content-disposition")) || fallbackFileName;
    link.click();
    URL.revokeObjectURL(url);

    const formatLabel = TASK_CSV_FORMATS.find((item) => item.id === format)?.label ?? "CSV";

    setWorkspaceActivity((current) =>
      pushWorkspaceActivity(current, {
        name: activeProject.name,
        initials: activeProject.initials,
        tone: activeProject.tone,
        status: "online",
        action: "Exported task data",
        detail: formatLabel,
      }),
    );

    return `${formatLabel} downloaded for ${activeProject.name}.`;
  }

  async function handleSetActiveProjectCompleted(nextCompleted: boolean, options?: { notify?: boolean }) {
    const previousProjects = projectsRef.current;
    const nextProjects = previousProjects.map((project) =>
      project.id === activeProject.id
        ? {
            ...project,
            completed: nextCompleted,
          }
        : project,
    );

    projectsRef.current = nextProjects;
    setProjects(nextProjects);

    if (projectWorkspaceMode === "remote") {
      try {
        await persistProjectWorkspaceBundle({ projects: nextProjects });
      } catch (error) {
        console.error("Failed to update project completion:", error);
        projectsRef.current = previousProjects;
        setProjects(previousProjects);
        throw error;
      }
    }

    if (options?.notify !== false) {
      prependProjectNotification(createProjectNotification({
        title: nextCompleted ? "Project completed" : "Project reopened",
        body: nextCompleted
          ? `"${activeProject.name}" was marked as completed.`
          : `"${activeProject.name}" was moved back to active projects.`,
        kind: nextCompleted ? "completed" : "milestone",
        targetTab: "Overview",
      }));
      setWorkspaceActivity((current) =>
        pushWorkspaceActivity(current, {
          name: activeProject.name,
          initials: activeProject.initials,
          tone: activeProject.tone,
          status: nextCompleted ? "online" : "neutral",
          action: nextCompleted ? "Completed project" : "Reopened project",
          detail: activeProject.projectType || activeProject.category,
        }),
      );
    }
  }

  async function handleImportProjectData(file: File) {
    if (!activeProjectRef) {
      throw new Error("Select a project before importing task data.");
    }

    const csv = await file.text();
    const response = await fetch("/api/tasks/import", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        projectRef: activeProjectRef,
        csv,
      }),
    });

    const payload = await readJsonSafely<{
      error?: string;
      importedCount?: number;
      skippedRowCount?: number;
      tasks?: Array<{
        id: number;
        title: string;
        description: string;
        status_id: string;
        tag: string;
        priority: "Normal" | "Medium" | "High" | "Done";
        assigned_to: string | null;
        due_date: string | null;
        reminder_at: string | null;
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
      }>;
    }>(response);

    if (!response.ok) {
      throw new Error(payload?.error || "Failed to import CSV file.");
    }

    const nextColumns = mapApiTasksToColumns(Array.isArray(payload?.tasks) ? payload.tasks : []);
    setColumns(nextColumns);
    dispatchTaskDataChanged();

    const importedCount = payload?.importedCount ?? 0;
    const skippedRowCount = payload?.skippedRowCount ?? 0;
    const activityDetail = skippedRowCount > 0
      ? `${importedCount} imported, ${skippedRowCount} skipped`
      : `${importedCount} imported`;

    setWorkspaceActivity((current) =>
      pushWorkspaceActivity(current, {
        name: activeProject.name,
        initials: activeProject.initials,
        tone: activeProject.tone,
        status: "online",
        action: "Imported task data",
        detail: activityDetail,
      }),
    );

    return skippedRowCount > 0
      ? `Imported ${importedCount} tasks from ${file.name}. Skipped ${skippedRowCount} blank or invalid rows.`
      : `Imported ${importedCount} tasks from ${file.name}.`;
  }

  async function handleRemoveProjectIntegration(integrationId: string) {
    const currentIntegrations = projectIntegrationsRef.current[activeProjectRef] ?? cloneDefaultIntegrations();
    const targetIntegration = currentIntegrations.find((integration) => integration.id === integrationId);

    if (!targetIntegration) {
      return;
    }

    await replaceActiveProjectIntegrations(
      currentIntegrations.filter((integration) => integration.id !== integrationId),
    );
    setWorkspaceActivity((current) =>
      pushWorkspaceActivity(current, {
        name: activeProject.name,
        initials: activeProject.initials,
        tone: activeProject.tone,
        status: "neutral",
        action: "Removed integration",
        detail: targetIntegration.name,
      }),
    );
  }

  async function toggleProjectNotificationRead(notificationId: string) {
    const notification = activeProjectNotifications.find((currentNotification) => currentNotification.id === notificationId);

    if (!notification) {
      return;
    }

    await setProjectNotificationUnreadState(notification, !notification.unread);
  }

  async function deleteProjectNotification(notificationId: string) {
    await removeProjectNotificationForCurrentUser(notificationId);
  }

  async function markAllProjectNotificationsRead() {
    const unreadNotifications = activeProjectNotifications.filter((notification) => notification.unread);

    if (unreadNotifications.length === 0) {
      return;
    }

    await runProjectNotificationMutation(
      (currentNotifications) =>
        currentNotifications.map((notification) => ({ ...notification, unread: false })),
      async () => {
        for (const notification of unreadNotifications) {
          await mutateNotificationsCenter({
            action: "set-read",
            projectRef: activeProjectRef,
            notificationId: notification.id,
            unread: false,
          });
        }
      },
    );
  }

  async function clearReadProjectNotifications() {
    const readNotifications = activeProjectNotifications.filter((notification) => !notification.unread);

    if (readNotifications.length === 0) {
      return;
    }

    await runProjectNotificationMutation(
      (currentNotifications) =>
        currentNotifications.filter((notification) => notification.unread),
      async () => {
        for (const notification of readNotifications) {
          await mutateNotificationsCenter({
            action: "remove",
            projectRef: activeProjectRef,
            notificationId: notification.id,
          });
        }
      },
    );
  }

  async function openProjectNotification(notification: ProjectNotification) {
    if (notification.unread) {
      await setProjectNotificationUnreadState(notification, false);
    }

    if (notification.targetTab === "Team Members") {
      setSelectedTopTab("Team Members");
      return;
    }

    if (notification.targetTab === "Overview") {
      setSelectedTopTab("Overview");
      return;
    }

    if (notification.targetTab === "Files") {
      setSelectedTopTab("Files");
      return;
    }

    if (notification.targetTab === "Tasks" && notification.targetTaskId && notification.targetColumnId) {
      setSelectedTopTab("Tasks");
      openTaskModal(notification.targetTaskId, notification.targetColumnId);
      return;
    }

    setSelectedTopTab("Notifications");
  }

  function handleSaveProjectDetails(values: EditProjectDetailsFormState) {
    const selectedClient = workspaceClients.find((client) => client.id === values.clientId);
    const nextDescription = values.description.trim()
      || buildProjectDescription(
        values.projectName,
        values.projectType,
        selectedClient?.company,
        values.startDate,
        values.deadline,
      );
    const previousProjects = projectsRef.current;
    const nextProjects = previousProjects.map((project) =>
      project.id === activeProject.id
        ? {
            ...project,
            name: values.projectName,
            initials: buildProjectInitials(values.projectName),
            category: values.projectType,
            projectType: values.projectType,
            clientId: values.clientId || undefined,
            startDate: values.startDate || undefined,
            deadline: values.deadline || undefined,
            description: nextDescription,
          }
        : project,
    );

    projectsRef.current = nextProjects;
    setProjects(nextProjects);

    if (projectWorkspaceMode === "remote") {
      void persistProjectWorkspaceBundle({ projects: nextProjects }).catch((error) => {
        console.error("Failed to persist project details:", error);
        projectsRef.current = previousProjects;
        setProjects(previousProjects);
      });
    }

    prependProjectNotification(createProjectNotification({
      title: "Project details updated",
      body: `Overview details for "${values.projectName}" were updated.`,
      kind: "milestone",
      targetTab: "Overview",
    }));
  }

  async function handleCopyProjectLink() {
    const projectSlug = activeProject.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const projectLink = typeof window !== "undefined"
      ? `${window.location.origin}/projects/tasks?project=${projectSlug || activeProject.id}`
      : `/projects/tasks?project=${projectSlug || activeProject.id}`;

    try {
      await navigator.clipboard.writeText(projectLink);
    } catch (error) {
      console.error("Failed to copy project link:", error);
    }

    setSettingsOpen(false);
  }

  function handleDuplicateActiveProject() {
    const previousProjects = projectsRef.current;
    const previousNotificationsStore = projectNotificationsRef.current;
    const previousIntegrationsStore = projectIntegrationsRef.current;
    const nextProjectId = previousProjects.reduce((maxId, project) => Math.max(maxId, project.id), 0) + 1;
    const nextProject: WorkspaceProject = {
      ...activeProject,
      id: nextProjectId,
      name: `${activeProject.name} Copy`,
      initials: buildProjectInitials(`${activeProject.name} Copy`),
      active: true,
      starred: false,
      hidden: false,
      archived: false,
      completed: false,
      members: activeProject.members?.map((member) => ({ ...member })) ?? [],
      documents: activeProject.documents?.map((document) => ({ ...document })) ?? cloneDefaultProjectDocuments(),
      goals: activeProject.goals?.map((goal) => ({ ...goal })) ?? cloneDefaultProjectGoals(),
    };
    const nextProjects = [nextProject, ...previousProjects.map((project) => ({ ...project, active: false }))];
    const nextNotificationsStore = {
      ...previousNotificationsStore,
      [String(nextProjectId)]: cloneDefaultProjectNotifications(),
    };
    const nextIntegrationsStore = {
      ...previousIntegrationsStore,
      [String(nextProjectId)]: (previousIntegrationsStore[activeProjectRef] ?? cloneDefaultIntegrations()).map((integration) => ({ ...integration })),
    };

    projectsRef.current = nextProjects;
    projectNotificationsRef.current = nextNotificationsStore;
    projectIntegrationsRef.current = nextIntegrationsStore;
    setProjects(nextProjects);
    setProjectNotificationsStore(nextNotificationsStore);
    setProjectIntegrationsStore(nextIntegrationsStore);

    if (projectWorkspaceMode === "remote") {
      void persistProjectWorkspaceBundle({
        projects: nextProjects,
        notifications: nextNotificationsStore,
        integrations: nextIntegrationsStore,
      }).catch((error) => {
        console.error("Failed to duplicate project:", error);
        projectsRef.current = previousProjects;
        projectNotificationsRef.current = previousNotificationsStore;
        projectIntegrationsRef.current = previousIntegrationsStore;
        setProjects(previousProjects);
        setProjectNotificationsStore(previousNotificationsStore);
        setProjectIntegrationsStore(previousIntegrationsStore);
      });
    }

    setSettingsOpen(false);
  }

  function handleToggleHideActiveProject() {
    const nextHiddenValue = !activeProject.hidden;
    const previousProjects = projectsRef.current;
    const nextProjects = previousProjects.map((project) => {
      if (project.id === activeProject.id) {
        return {
          ...project,
          hidden: nextHiddenValue,
          active: true,
        };
      }

      if (project.active) {
        return {
          ...project,
          active: false,
        };
      }

      return project;
    });

    projectsRef.current = nextProjects;
    setProjects(nextProjects);
    setSettingsOpen(false);

    if (projectWorkspaceMode === "remote") {
      void persistProjectWorkspaceBundle({ projects: nextProjects }).catch((error) => {
        console.error("Failed to update project visibility:", error);
        projectsRef.current = previousProjects;
        setProjects(previousProjects);
      });
    }
  }

  function handleArchiveActiveProject() {
    const previousProjects = projectsRef.current;
    const nextProjects = previousProjects.map((project) => {
      if (project.id === activeProject.id) {
        return {
          ...project,
          archived: true,
          hidden: false,
          active: true,
        };
      }

      if (project.active) {
        return {
          ...project,
          active: false,
        };
      }

      return project;
    });

    projectsRef.current = nextProjects;
    setProjects(nextProjects);
    setSettingsOpen(false);

    if (projectWorkspaceMode === "remote") {
      void persistProjectWorkspaceBundle({ projects: nextProjects }).catch((error) => {
        console.error("Failed to archive project:", error);
        projectsRef.current = previousProjects;
        setProjects(previousProjects);
      });
    }
  }

  function handleRestoreActiveProject() {
    const previousProjects = projectsRef.current;
    const nextProjects = previousProjects.map((project) => {
      if (project.id === activeProject.id) {
        return {
          ...project,
          archived: false,
          hidden: false,
          completed: false,
          active: true,
        };
      }

      if (project.active) {
        return {
          ...project,
          active: false,
        };
      }

      return project;
    });

    projectsRef.current = nextProjects;
    setProjects(nextProjects);
    setSettingsOpen(false);

    if (projectWorkspaceMode === "remote") {
      void persistProjectWorkspaceBundle({ projects: nextProjects }).catch((error) => {
        console.error("Failed to restore project:", error);
        projectsRef.current = previousProjects;
        setProjects(previousProjects);
      });
    }
  }

  function handleDeleteActiveProject() {
    setSettingsOpen(false);
    setPendingProjectDeleteId(activeProject.id);
  }

  function handleConfirmDeleteProject() {
    if (!pendingProjectDeleteId) {
      return;
    }
    const deletedProjectId = pendingProjectDeleteId;
    const deletedProject = projectsRef.current.find((project) => project.id === deletedProjectId) ?? null;
    const previousProjects = projectsRef.current;
    const previousNotificationsStore = projectNotificationsRef.current;
    const previousIntegrationsStore = projectIntegrationsRef.current;
    const previousCenterNotifications = notificationsCenterStore[String(deletedProjectId)] ?? [];
    const remainingProjects = previousProjects.filter((project) => project.id !== deletedProjectId);
    const visibleFallback = remainingProjects.find((project) => !project.hidden && !project.archived);
    const fallbackProjectId = visibleFallback?.id ?? remainingProjects[0]?.id ?? null;
    const nextProjects = remainingProjects.map((project) => ({
      ...project,
      active: fallbackProjectId !== null && project.id === fallbackProjectId,
    }));
    const nextNotificationsStore = { ...previousNotificationsStore };
    delete nextNotificationsStore[String(deletedProjectId)];
    const nextIntegrationsStore = { ...previousIntegrationsStore };
    delete nextIntegrationsStore[String(deletedProjectId)];

    projectsRef.current = nextProjects;
    projectNotificationsRef.current = nextNotificationsStore;
    projectIntegrationsRef.current = nextIntegrationsStore;
    setProjects(nextProjects);
    setProjectNotificationsStore(nextNotificationsStore);
    setProjectIntegrationsStore(nextIntegrationsStore);
    removeNotificationsCenterProject(String(deletedProjectId));
    setProjectFilesStore((current) => {
      const next = { ...current };
      delete next[String(deletedProjectId)];
      return next;
    });
    setProjectFilesLoadingStore((current) => {
      const next = { ...current };
      delete next[String(deletedProjectId)];
      return next;
    });
    setProjectFilesErrorStore((current) => {
      const next = { ...current };
      delete next[String(deletedProjectId)];
      return next;
    });
    setPendingProjectDeleteId(null);

    const recordProjectDeletionActivity = () => {
      if (!deletedProject) {
        return;
      }

      setWorkspaceActivity((current) =>
        pushWorkspaceActivity(current, {
          name: deletedProject.name,
          initials: deletedProject.initials,
          tone: deletedProject.tone,
          status: "neutral",
          action: "Deleted project",
          detail: deletedProject.projectType || deletedProject.category || undefined,
        }),
      );
    };

    if (projectWorkspaceMode === "remote") {
      void fetch(`/api/projects/${deletedProjectId}`, {
        method: "DELETE",
      })
        .then(async (response) => {
          const payload = await readJsonSafely<{
            ok?: boolean;
            bundle?: ProjectWorkspaceBundle;
            error?: string;
          }>(response);

          if (!response.ok || !payload?.bundle) {
            throw new Error(payload?.error || "Failed to delete project.");
          }

          projectsRef.current = payload.bundle.projects;
          projectNotificationsRef.current = payload.bundle.notifications;
          projectIntegrationsRef.current = payload.bundle.integrations;
          setProjects(payload.bundle.projects);
          setProjectNotificationsStore(payload.bundle.notifications);
          setProjectIntegrationsStore(payload.bundle.integrations);
          recordProjectDeletionActivity();
        })
        .catch((error) => {
          console.error("Failed to delete project:", error);
          projectsRef.current = previousProjects;
          projectNotificationsRef.current = previousNotificationsStore;
          projectIntegrationsRef.current = previousIntegrationsStore;
          setProjects(previousProjects);
          setProjectNotificationsStore(previousNotificationsStore);
          setProjectIntegrationsStore(previousIntegrationsStore);
          updateNotificationsCenterProjectStore(() => previousCenterNotifications, String(deletedProjectId));
        });
      return;
    }

    recordProjectDeletionActivity();
  }

  function buildTaskOrderPayload(nextColumns: TaskColumn[]) {
    return nextColumns.flatMap((column) =>
      column.tasks.map((task, index) => ({
        id: task.id,
        statusId: column.id,
        sortOrder: (index + 1) * 10,
        projectRef: activeProjectRef,
      })),
    );
  }

  async function persistTaskOrder(nextColumns: TaskColumn[]) {
    const response = await fetch("/api/tasks/reorder", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        tasks: buildTaskOrderPayload(nextColumns),
      }),
    });

    if (!response.ok) {
      throw new Error("Task reorder failed.");
    }

    dispatchTaskDataChanged();
  }

  function handleCreateProject(projectForm: CreateProjectFormState) {
    const client = workspaceClients.find((record) => record.id === projectForm.clientId);
    const previousProjects = projectsRef.current;
    const previousNotificationsStore = projectNotificationsRef.current;
    const previousIntegrationsStore = projectIntegrationsRef.current;
    const nextProjectId = previousProjects.reduce((maxId, project) => Math.max(maxId, project.id), 0) + 1;
    const nextProject: WorkspaceProject = {
      id: nextProjectId,
      name: projectForm.projectName,
      category: projectForm.projectType,
      tone: PROJECT_TONE_SEQUENCE[(nextProjectId - 1) % PROJECT_TONE_SEQUENCE.length],
      initials: buildProjectInitials(projectForm.projectName),
      active: true,
      completed: false,
      clientId: projectForm.clientId,
      projectType: projectForm.projectType,
      startDate: projectForm.startDate,
      deadline: projectForm.deadline,
      description: buildProjectDescription(
        projectForm.projectName,
        projectForm.projectType,
        client?.company,
        projectForm.startDate,
        projectForm.deadline,
      ),
      members: projectForm.members,
      documents: cloneDefaultProjectDocuments(),
      goals: cloneDefaultProjectGoals(),
    };
    const nextProjects = [
      nextProject,
      ...previousProjects.map((project) => ({ ...project, active: false })),
    ];
    const nextNotificationsStore = {
      ...previousNotificationsStore,
      [String(nextProjectId)]: cloneDefaultProjectNotifications(),
    };
    const nextIntegrationsStore = {
      ...previousIntegrationsStore,
      [String(nextProjectId)]: cloneDefaultIntegrations(),
    };
    const projectRecipients = dedupeNotificationRecipients(
      projectForm.members.map((member) => {
        const matchingMember = teamMembers.find((teamMember) => teamMember.name === member.name);

        return {
          email: matchingMember?.email,
          name: member.name,
        };
      }),
    );

    projectsRef.current = nextProjects;
    projectNotificationsRef.current = nextNotificationsStore;
    projectIntegrationsRef.current = nextIntegrationsStore;
    setProjects(nextProjects);
    setProjectNotificationsStore(nextNotificationsStore);
    setProjectIntegrationsStore(nextIntegrationsStore);

    if (projectWorkspaceMode === "remote") {
      void persistProjectWorkspaceBundle({
        projects: nextProjects,
        notifications: nextNotificationsStore,
        integrations: nextIntegrationsStore,
      })
        .then(() => {
          if (projectRecipients.length === 0) {
            return;
          }

          void dispatchNotificationEmailEvent({
            eventType: "project-created",
            eventKey: `project-created:${nextProjectId}:${Date.now()}`,
            projectRef: String(nextProjectId),
            projectName: nextProject.name,
            projectType: nextProject.projectType || nextProject.category,
            startDate: nextProject.startDate,
            deadline: nextProject.deadline,
            memberCount: nextProject.members?.length ?? projectRecipients.length,
            recipients: projectRecipients,
          });
        }).catch((error) => {
          console.error("Failed to create project:", error);
          projectsRef.current = previousProjects;
        projectNotificationsRef.current = previousNotificationsStore;
        projectIntegrationsRef.current = previousIntegrationsStore;
        setProjects(previousProjects);
        setProjectNotificationsStore(previousNotificationsStore);
        setProjectIntegrationsStore(previousIntegrationsStore);
      });
    }
  }

  function handleInviteTeamMembers(invitedMembers: TeamMemberRecord[]) {
    const previousProjects = projectsRef.current;
    const previousTeamMembers = teamMembersRef.current;
    const existingEmails = new Set(previousTeamMembers.map((member) => member.email.trim().toLowerCase()));
    const uniqueNewMembers = invitedMembers.filter((member) => !existingEmails.has(member.email.trim().toLowerCase()));
    const nextTeamMembers = [...uniqueNewMembers, ...previousTeamMembers];
    const nextProjects = previousProjects.map((project) =>
      project.id === activeProject.id
        ? {
            ...project,
            members: [
              ...(project.members ?? []),
              ...invitedMembers.map((member) => {
                const matchingMember = previousTeamMembers.find((existingMember) =>
                  existingMember.email.trim().toLowerCase() === member.email.trim().toLowerCase()
                  || existingMember.name.trim().toLowerCase() === member.name.trim().toLowerCase(),
                );
                const resolvedTeam = resolveProjectAssignmentTeam(
                  workspaceTeams,
                  {
                    name: member.name,
                    email: member.email,
                    team: defaultWorkspaceTeamName,
                    teamId: member.teamId,
                  },
                  matchingMember ?? member,
                );

                return {
                  name: member.name,
                  email: member.email,
                  teamId: resolvedTeam.teamId,
                  team: resolvedTeam.teamName,
                };
              }),
            ],
          }
        : project,
    );

    projectsRef.current = nextProjects;
    teamMembersRef.current = nextTeamMembers;
    setTeamMembers(nextTeamMembers);
    setProjects(nextProjects);

    if (projectWorkspaceMode === "remote") {
      void persistProjectWorkspaceBundle({
        projects: nextProjects,
        teamMembers: nextTeamMembers,
      }).catch((error) => {
        console.error("Failed to invite team members:", error);
        projectsRef.current = previousProjects;
        teamMembersRef.current = previousTeamMembers;
        setProjects(previousProjects);
        setTeamMembers(previousTeamMembers);
      });
    }

    prependProjectNotification(createProjectNotification({
      title: invitedMembers.length === 1 ? "Team member invited" : "Team members invited",
      body: invitedMembers.length === 1
        ? `${invitedMembers[0]?.name} was invited to join this project.`
        : `${invitedMembers.length} members were invited to join this project.`,
      kind: "meeting",
      initials: invitedMembers[0]?.avatarInitials,
      avatarTone: invitedMembers[0]?.avatarTone,
      targetTab: "Team Members",
    }));
  }

  function handleUpdateTeamMember(updatedMember: ProjectTeamMember) {
    const previousProjects = projectsRef.current;
    const previousTeamMembers = teamMembersRef.current;
    const selectedTeam = findWorkspaceTeamById(workspaceTeams, updatedMember.teamId)
      ?? findWorkspaceTeamByName(workspaceTeams, updatedMember.team);
    const nextTeamMembers = previousTeamMembers.some((member) =>
      member.id === updatedMember.id || member.email.trim().toLowerCase() === updatedMember.email.trim().toLowerCase(),
    )
      ? previousTeamMembers.map((member) =>
          member.id === updatedMember.id || member.email.trim().toLowerCase() === updatedMember.email.trim().toLowerCase()
            ? {
                ...member,
                name: updatedMember.name,
                email: updatedMember.email,
                avatarInitials: updatedMember.avatarInitials,
                avatarTone: updatedMember.avatarTone,
                avatarImage: updatedMember.avatarImage,
                dateAdded: updatedMember.dateAdded,
                lastActive: updatedMember.lastActive,
                teamId: selectedTeam?.id,
              }
            : member,
        )
      : [
          {
            id: updatedMember.id,
            name: updatedMember.name,
            email: updatedMember.email,
            avatarInitials: updatedMember.avatarInitials,
            avatarTone: updatedMember.avatarTone,
            avatarImage: updatedMember.avatarImage,
            dateAdded: updatedMember.dateAdded,
            lastActive: updatedMember.lastActive,
            teamId: selectedTeam?.id,
          },
          ...previousTeamMembers,
        ];
    const nextProjects = previousProjects.map((project) =>
      project.id === activeProject.id
        ? {
            ...project,
            members: (project.members ?? []).map((member) =>
              `${member.email?.trim().toLowerCase() || ""}::${member.name.trim().toLowerCase()}` === updatedMember.assignmentKey
                ? {
                    ...member,
                    name: updatedMember.name,
                    email: updatedMember.email,
                    teamId: selectedTeam?.id,
                    team: selectedTeam?.name ?? updatedMember.team,
                  }
                : member,
            ),
          }
        : project,
    );

    teamMembersRef.current = nextTeamMembers;
    projectsRef.current = nextProjects;
    setTeamMembers(nextTeamMembers);
    setProjects(nextProjects);

    if (projectWorkspaceMode === "remote") {
      void persistProjectWorkspaceBundle({
        projects: nextProjects,
        teamMembers: nextTeamMembers,
      }).catch((error) => {
        console.error("Failed to update team member:", error);
        projectsRef.current = previousProjects;
        teamMembersRef.current = previousTeamMembers;
        setProjects(previousProjects);
        setTeamMembers(previousTeamMembers);
      });
    }

    prependProjectNotification(createProjectNotification({
      title: "Team member updated",
      body: `${updatedMember.name}'s project member details were updated.`,
      kind: "comment",
      initials: updatedMember.avatarInitials,
      avatarTone: updatedMember.avatarTone,
      targetTab: "Team Members",
    }));
  }

  function handleDeleteTeamMember(memberId: string) {
    const memberToDelete = projectTeamMembers.find((member) => member.id === memberId);

    if (!memberToDelete) {
      return;
    }
    const previousProjects = projectsRef.current;
    const nextProjects = previousProjects.map((project) =>
      project.id === activeProject.id
        ? {
            ...project,
            members: (project.members ?? []).filter((member) =>
              `${member.email?.trim().toLowerCase() || ""}::${member.name.trim().toLowerCase()}` !== memberToDelete.assignmentKey,
            ),
          }
        : project,
    );

    projectsRef.current = nextProjects;
    setProjects(nextProjects);

    if (projectWorkspaceMode === "remote") {
      void persistProjectWorkspaceBundle({ projects: nextProjects }).catch((error) => {
        console.error("Failed to remove team member:", error);
        projectsRef.current = previousProjects;
        setProjects(previousProjects);
      });
    }

    prependProjectNotification(createProjectNotification({
      title: "Team member removed",
      body: `${memberToDelete.name} was removed from this project team.`,
      kind: "overdue",
      initials: memberToDelete.avatarInitials,
      avatarTone: memberToDelete.avatarTone,
      targetTab: "Team Members",
    }));
  }

  function handleToggleActiveProjectStar() {
    const previousProjects = projectsRef.current;
    const nextProjects = previousProjects.map((project) =>
      project.id === activeProject.id
        ? {
            ...project,
            starred: !project.starred,
          }
        : project,
    );

    projectsRef.current = nextProjects;
    setProjects(nextProjects);

    if (projectWorkspaceMode === "remote") {
      void persistProjectWorkspaceBundle({ projects: nextProjects }).catch((error) => {
        console.error("Failed to update project star state:", error);
        projectsRef.current = previousProjects;
        setProjects(previousProjects);
      });
    }
  }

  function handleSaveProjectGoals(goals: ProjectGoal[]) {
    const previousProjects = projectsRef.current;
    const nextProjects = previousProjects.map((project) =>
      project.id === activeProject.id
        ? {
            ...project,
            goals,
          }
        : project,
    );

    projectsRef.current = nextProjects;
    setProjects(nextProjects);

    if (projectWorkspaceMode === "remote") {
      void persistProjectWorkspaceBundle({ projects: nextProjects }).catch((error) => {
        console.error("Failed to persist project goals:", error);
        projectsRef.current = previousProjects;
        setProjects(previousProjects);
      });
    }

    prependProjectNotification(createProjectNotification({
      title: "Goals updated",
      body: "Project goals were updated for this workspace.",
      kind: "milestone",
      targetTab: "Overview",
    }));
  }

  const openDrawer = (columnId: string) => {
    setDrawerOpen(true);
    setTaskModal(null);
    setTaskForm(createEmptyTaskForm(columnId));
    setDrawerTab("description");
    setAssigneeMenuOpen(false);
    setListStatusMenu(null);
    setSortOpen(false);
    setFilterOpen(false);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setAssigneeMenuOpen(false);
    setDrawerTab("description");
    setTaskForm(createEmptyTaskForm(taskForm.statusId));
  };

  const openTaskModal = (taskId: number, columnId: string, mode: TaskModalMode = "view") => {
    const column = columns.find((item) => item.id === columnId);
    const task = column?.tasks.find((item) => item.id === taskId);

    if (!column || !task) {
      return;
    }

    setDrawerOpen(false);
    setSortOpen(false);
    setFilterOpen(false);
    setListStatusMenu(null);
    setAssigneeMenuOpen(false);
    setTaskModal({
      taskId,
      columnId,
      mode,
    });
    setTaskModalForm(createTaskFormFromTask(task, columnId));
  };

  const openTaskModalWithNewSubtask = (taskId: number, columnId: string) => {
    const column = columns.find((item) => item.id === columnId);
    const task = column?.tasks.find((item) => item.id === taskId);

    if (!column || !task) {
      return;
    }

    setDrawerOpen(false);
    setSortOpen(false);
    setFilterOpen(false);
    setListStatusMenu(null);
    setAssigneeMenuOpen(false);
    setTaskModal({
      taskId,
      columnId,
      mode: "edit",
    });
    setTaskModalForm({
      ...createTaskFormFromTask(task, columnId),
      subtasks: [...task.checklist.map((item) => ({ ...item })), createTaskChecklistDraft()],
    });
  };

  const closeTaskModal = () => {
    setTaskModal(null);
    setAssigneeMenuOpen(false);
  };

  function clearTouchDragTimer() {
    if (touchDragTimerRef.current !== null) {
      window.clearTimeout(touchDragTimerRef.current);
      touchDragTimerRef.current = null;
    }
  }

  function resolveTouchDropTargetAtPoint(clientX: number, clientY: number) {
    const element = document.elementFromPoint(clientX, clientY);
    const taskElement = element?.closest<HTMLElement>("[data-board-task-column][data-board-task-id]");

    if (taskElement) {
      const columnId = taskElement.dataset.boardTaskColumn ?? "";
      const taskId = Number(taskElement.dataset.boardTaskId ?? "");

      if (columnId && Number.isFinite(taskId)) {
        const rect = taskElement.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;

        return {
          columnId,
          targetTaskId: taskId,
          position: clientY > midpoint ? "after" as const : "before" as const,
        };
      }
    }

    const columnElement = element?.closest<HTMLElement>("[data-board-column-drop-zone]");
    const columnId = columnElement?.dataset.boardColumnDropZone ?? "";

    if (!columnId) {
      return null;
    }

    const target = resolveColumnDropTarget(columnId, clientY);

    if (!target) {
      return {
        columnId,
        targetTaskId: null,
        position: "empty" as const,
      };
    }

    return {
      columnId,
      targetTaskId: target.targetTaskId,
      position: target.position,
    };
  }

  function updateTouchDragIndicator(clientX: number, clientY: number) {
    const activeDragState = dragStateRef.current;

    if (!activeDragState || hasActiveTaskFiltersRef.current) {
      return;
    }

    const target = resolveTouchDropTargetAtPoint(clientX, clientY);

    if (!target) {
      setDragIndicator(null);
      return;
    }

    setDragIndicator({
      columnId: target.columnId,
      targetTaskId: target.targetTaskId,
      position: target.position,
    });
  }

  function finalizeTouchDrag(clientX: number, clientY: number) {
    const activeDragState = dragStateRef.current;
    const currentColumns = columnsRef.current;

    if (!activeDragState || hasActiveTaskFiltersRef.current) {
      return;
    }

    const target = resolveTouchDropTargetAtPoint(clientX, clientY);

    stopBoardAutoScroll();
    setDragIndicator(null);

    if (!target) {
      setDragState(null);
      return;
    }

    const previousColumns = currentColumns;
    const nextColumns = target.targetTaskId === null
      ? moveTask(currentColumns, activeDragState, target.columnId)
      : moveTask(currentColumns, activeDragState, target.columnId, target.targetTaskId, target.position);
    const movedTask = activeDragState.fromColumnId !== target.columnId
      ? currentColumns
        .find((column) => column.id === activeDragState.fromColumnId)
        ?.tasks.find((task) => task.id === activeDragState.taskId)
      : null;

    setColumns(nextColumns);
    setDragState(null);

    void persistTaskOrder(nextColumns)
      .then(() => {
        if (movedTask) {
          prependTaskStageChangedNotification({
            taskId: movedTask.id,
            taskTitle: movedTask.title,
            previousColumnId: activeDragState.fromColumnId,
            nextColumnId: target.columnId,
            columnsSnapshot: currentColumns,
          });
        }
      })
      .catch((error) => {
        console.error("Failed to persist touch drag task order:", error);
        setColumns(previousColumns);
      });
  }

  function handleTouchCardPointerDown(
    event: ReactPointerEvent<HTMLElement>,
    taskId: number,
    fromColumnId: string,
  ) {
    if (!event.isPrimary || event.pointerType === "mouse" || hasActiveTaskFiltersRef.current) {
      return;
    }

    const target = event.target as HTMLElement | null;

    if (target?.closest("button, a, input, textarea, select, label")) {
      return;
    }

    clearTouchDragTimer();
    touchDragSessionRef.current = {
      pointerId: event.pointerId,
      taskId,
      fromColumnId,
      startX: event.clientX,
      startY: event.clientY,
      currentX: event.clientX,
      currentY: event.clientY,
      started: false,
    };
    touchDragTimerRef.current = window.setTimeout(() => {
      const session = touchDragSessionRef.current;

      if (!session || session.pointerId !== event.pointerId || session.started) {
        return;
      }

      touchDragSessionRef.current = {
        ...session,
        started: true,
      };
      suppressCardClickRef.current = session.taskId;
      setDragState({
        taskId: session.taskId,
        fromColumnId: session.fromColumnId,
      });
      updateTouchDragIndicator(session.currentX, session.currentY);
    }, TOUCH_DRAG_START_DELAY_MS);
  }

  function handleSearchResultSelect(result: SearchOverlayResult) {
    setSearchOpen(false);

    if (result.kind === "task") {
      const taskId = Number(result.id.replace("task-", ""));
      const containingColumn = columns.find((column) => column.tasks.some((task) => task.id === taskId));

      if (containingColumn) {
        setSelectedTopTab("Tasks");
        openTaskModal(taskId, containingColumn.id);
      }
      return;
    }

    if (result.kind === "member") {
      setSelectedTopTab("Team Members");
      return;
    }

    if (result.kind === "file") {
      setSelectedTopTab("Files");
      return;
    }

    if (result.kind === "document") {
      const documentId = result.id.replace("document-", "");
      const matchingDocument = activeProjectDocuments.find((document) => document.id === documentId);

      if (matchingDocument?.linkedFileId) {
        setSelectedTopTab("Files");
        return;
      }

      setSelectedTopTab("Overview");
      return;
    }

    if (result.kind === "goal" || result.kind === "detail") {
      setSelectedTopTab("Overview");
      return;
    }

    if (result.kind === "notification") {
      const notificationId = result.id.replace("notification-", "");
      const matchingNotification = activeProjectNotifications.find((notification) => notification.id === notificationId);

      if (matchingNotification) {
        openProjectNotification(matchingNotification);
        return;
      }

      setSelectedTopTab("Notifications");
      return;
    }

    setSelectedTopTab("Overview");
  }

  const handleCardDrop = (toColumnId: string, beforeTaskId?: number) => {
    if (!dragState || hasActiveTaskFilters) {
      return;
    }

    setDragIndicator(null);
    dragAutoScrollDirectionRef.current = 0;

    if (dragAutoScrollFrameRef.current !== null) {
      window.cancelAnimationFrame(dragAutoScrollFrameRef.current);
      dragAutoScrollFrameRef.current = null;
    }

    const previousColumns = columns;
    const nextColumns = moveTask(columns, dragState, toColumnId, beforeTaskId);
    const movedTask = dragState.fromColumnId !== toColumnId
      ? previousColumns
        .find((column) => column.id === dragState.fromColumnId)
        ?.tasks.find((task) => task.id === dragState.taskId)
      : null;
    setColumns(nextColumns);

    void persistTaskOrder(nextColumns)
      .then(() => {
        if (movedTask) {
          prependTaskStageChangedNotification({
            taskId: movedTask.id,
            taskTitle: movedTask.title,
            previousColumnId: dragState.fromColumnId,
            nextColumnId: toColumnId,
            columnsSnapshot: previousColumns,
          });
        }
      })
      .catch((error) => {
        console.error("Failed to persist task order:", error);
        setColumns(previousColumns);
      });

    setDragState(null);
  };

  const updateBoardAutoScroll = (clientX: number) => {
    const viewport = boardScrollViewportRef.current;

    if (!viewport) {
      return;
    }

    const bounds = viewport.getBoundingClientRect();
    const edgeThreshold = Math.min(120, bounds.width * 0.18);
    const leftDistance = clientX - bounds.left;
    const rightDistance = bounds.right - clientX;
    const isNearLeftEdge = leftDistance <= edgeThreshold;
    const isNearRightEdge = rightDistance <= edgeThreshold;
    const nextDirection = isNearLeftEdge ? -1 : isNearRightEdge ? 1 : 0;
    const edgeDistance = isNearLeftEdge
      ? Math.max(0, leftDistance)
      : isNearRightEdge
        ? Math.max(0, rightDistance)
        : edgeThreshold;
    const edgePressure = nextDirection === 0
      ? 0
      : 1 - Math.min(edgeDistance, edgeThreshold) / edgeThreshold;
    const scrollStep = nextDirection === 0
      ? 0
      : 4 + edgePressure * 8;

    dragAutoScrollDirectionRef.current = nextDirection;
    viewport.dataset.dragScrollStep = String(scrollStep);

    if (nextDirection === 0) {
      if (dragAutoScrollFrameRef.current !== null) {
        window.cancelAnimationFrame(dragAutoScrollFrameRef.current);
        dragAutoScrollFrameRef.current = null;
      }
      return;
    }

    if (dragAutoScrollFrameRef.current !== null) {
      return;
    }

    const step = () => {
      const activeViewport = boardScrollViewportRef.current;
      const direction = dragAutoScrollDirectionRef.current;

      if (!activeViewport || direction === 0) {
        dragAutoScrollFrameRef.current = null;
        return;
      }

      const nextStep = Number(activeViewport.dataset.dragScrollStep ?? "0");
      activeViewport.scrollLeft += direction * (Number.isFinite(nextStep) ? nextStep : 0);
      dragAutoScrollFrameRef.current = window.requestAnimationFrame(step);
    };

    dragAutoScrollFrameRef.current = window.requestAnimationFrame(step);
  };

  const stopBoardAutoScroll = () => {
    dragAutoScrollDirectionRef.current = 0;

    if (dragAutoScrollFrameRef.current !== null) {
      window.cancelAnimationFrame(dragAutoScrollFrameRef.current);
      dragAutoScrollFrameRef.current = null;
    }

    if (boardScrollViewportRef.current) {
      delete boardScrollViewportRef.current.dataset.dragScrollStep;
    }
  };

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      const session = touchDragSessionRef.current;

      if (!session || session.pointerId !== event.pointerId) {
        return;
      }

      touchDragSessionRef.current = {
        ...session,
        currentX: event.clientX,
        currentY: event.clientY,
      };

      if (!session.started) {
        const movedDistance = Math.hypot(event.clientX - session.startX, event.clientY - session.startY);

        if (movedDistance > TOUCH_DRAG_CANCEL_DISTANCE_PX) {
          clearTouchDragTimer();
          touchDragSessionRef.current = null;
        }
        return;
      }

      if (event.cancelable) {
        event.preventDefault();
      }

      updateBoardAutoScroll(event.clientX);
      updateTouchDragIndicator(event.clientX, event.clientY);
    }

    function handlePointerFinish(event: PointerEvent) {
      const session = touchDragSessionRef.current;

      if (!session || session.pointerId !== event.pointerId) {
        return;
      }

      clearTouchDragTimer();
      touchDragSessionRef.current = null;

      if (!session.started) {
        return;
      }

      if (event.cancelable) {
        event.preventDefault();
      }

      finalizeTouchDrag(event.clientX, event.clientY);

      window.setTimeout(() => {
        if (suppressCardClickRef.current === session.taskId) {
          suppressCardClickRef.current = null;
        }
      }, 0);
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", handlePointerFinish, { passive: false });
    window.addEventListener("pointercancel", handlePointerFinish, { passive: false });

    return () => {
      clearTouchDragTimer();
      touchDragSessionRef.current = null;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerFinish);
      window.removeEventListener("pointercancel", handlePointerFinish);
    };
  }, []);

  const resolveColumnDropTarget = (toColumnId: string, clientY: number) => {
    const targetColumn = columns.find((column) => column.id === toColumnId);

    if (!targetColumn || targetColumn.tasks.length === 0) {
      return null;
    }

    const taskElements = targetColumn.tasks
      .map((task) => {
        const element = document.querySelector<HTMLElement>(
          `[data-board-task-column="${toColumnId}"][data-board-task-id="${task.id}"]`,
        );

        return element
          ? {
              taskId: task.id,
              rect: element.getBoundingClientRect(),
            }
          : null;
      })
      .filter((item): item is { taskId: number; rect: DOMRect } => Boolean(item));

    if (taskElements.length === 0) {
      return null;
    }

    const firstTask = taskElements[0];
    const lastTask = taskElements[taskElements.length - 1];

    if (clientY <= firstTask.rect.top + 8) {
      return { targetTaskId: firstTask.taskId, position: "before" as const };
    }

    if (clientY >= lastTask.rect.bottom - 8) {
      return { targetTaskId: lastTask.taskId, position: "after" as const };
    }

    const nearestTask = taskElements.reduce((closest, current) => {
      const closestDistance = Math.abs(clientY - (closest.rect.top + closest.rect.height / 2));
      const currentDistance = Math.abs(clientY - (current.rect.top + current.rect.height / 2));
      return currentDistance < closestDistance ? current : closest;
    });

    const midpoint = nearestTask.rect.top + nearestTask.rect.height / 2;

    return {
      targetTaskId: nearestTask.taskId,
      position: clientY > midpoint ? "after" as const : "before" as const,
    };
  };

  const updateDragIndicatorForColumn = (toColumnId: string, clientY: number) => {
    if (!dragState || hasActiveTaskFilters) {
      return;
    }

    const target = resolveColumnDropTarget(toColumnId, clientY);

    if (!target) {
      setDragIndicator({
        columnId: toColumnId,
        targetTaskId: null,
        position: "empty",
      });
      return;
    }

    setDragIndicator({
      columnId: toColumnId,
      targetTaskId: target.targetTaskId,
      position: target.position,
    });
  };

  const updateDragIndicatorForTask = (
    event: ReactDragEvent<HTMLElement>,
    toColumnId: string,
    targetTaskId: number,
  ) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const midpoint = bounds.top + bounds.height / 2;
    const position = event.clientY > midpoint ? "after" : "before";

    setDragIndicator({
      columnId: toColumnId,
      targetTaskId,
      position,
    });
  };

  const handleColumnDrop = (
    event: ReactDragEvent<HTMLElement>,
    toColumnId: string,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    stopBoardAutoScroll();
    setDragIndicator(null);

    if (!dragState || hasActiveTaskFilters) {
      return;
    }

    const target = resolveColumnDropTarget(toColumnId, event.clientY);

    if (!target) {
      handleCardDrop(toColumnId);
      return;
    }

    const previousColumns = columns;
    const nextColumns = moveTask(columns, dragState, toColumnId, target.targetTaskId, target.position);
    const movedTask = dragState.fromColumnId !== toColumnId
      ? previousColumns
        .find((column) => column.id === dragState.fromColumnId)
        ?.tasks.find((task) => task.id === dragState.taskId)
      : null;
    setColumns(nextColumns);

    void persistTaskOrder(nextColumns)
      .then(() => {
        if (movedTask) {
          prependTaskStageChangedNotification({
            taskId: movedTask.id,
            taskTitle: movedTask.title,
            previousColumnId: dragState.fromColumnId,
            nextColumnId: toColumnId,
            columnsSnapshot: previousColumns,
          });
        }
      })
      .catch((error) => {
        console.error("Failed to persist task order:", error);
        setColumns(previousColumns);
      });

    setDragState(null);
  };

  const handleTaskDrop = (
    event: ReactDragEvent<HTMLElement>,
    toColumnId: string,
    targetTaskId: number,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    stopBoardAutoScroll();
    setDragIndicator(null);

    const bounds = event.currentTarget.getBoundingClientRect();
    const midpoint = bounds.top + bounds.height / 2;
    const position = event.clientY > midpoint ? "after" : "before";

    if (!dragState || hasActiveTaskFilters) {
      return;
    }

    const previousColumns = columns;
    const nextColumns = moveTask(columns, dragState, toColumnId, targetTaskId, position);
    const movedTask = dragState.fromColumnId !== toColumnId
      ? previousColumns
        .find((column) => column.id === dragState.fromColumnId)
        ?.tasks.find((task) => task.id === dragState.taskId)
      : null;
    setColumns(nextColumns);

    void persistTaskOrder(nextColumns)
      .then(() => {
        if (movedTask) {
          prependTaskStageChangedNotification({
            taskId: movedTask.id,
            taskTitle: movedTask.title,
            previousColumnId: dragState.fromColumnId,
            nextColumnId: toColumnId,
            columnsSnapshot: previousColumns,
          });
        }
      })
      .catch((error) => {
        console.error("Failed to persist task order:", error);
        setColumns(previousColumns);
      });

    setDragState(null);
  };

  const handleDragStart = (taskId: number, fromColumnId: string) => {
    setDragIndicator(null);
    setDragState({
      taskId,
      fromColumnId,
    });
  };

  const handleDragEnd = () => {
    stopBoardAutoScroll();
    setDragIndicator(null);
    setDragState(null);
  };

  const handleSelectListStatus = (taskId: number, fromColumnId: string, toColumnId: string) => {
    const previousColumns = columns;
    const nextColumns = moveTask(
      columns,
      {
        taskId,
        fromColumnId,
      },
      toColumnId,
    );
    const movedTask = fromColumnId !== toColumnId
      ? previousColumns
        .find((column) => column.id === fromColumnId)
        ?.tasks.find((task) => task.id === taskId)
      : null;

    setColumns(nextColumns);

    void persistTaskOrder(nextColumns)
      .then(() => {
        if (movedTask) {
          prependTaskStageChangedNotification({
            taskId: movedTask.id,
            taskTitle: movedTask.title,
            previousColumnId: fromColumnId,
            nextColumnId: toColumnId,
            columnsSnapshot: previousColumns,
          });
        }
      })
      .catch((error) => {
        console.error("Failed to persist task status:", error);
        setColumns(previousColumns);
      });

    setListStatusMenu(null);
    setFilterOpen(false);
  };

  const handleToggleTaskChecklistFromCard = (taskId: number, columnId: string, checklistItemId: string) => {
    const sourceColumn = columns.find((column) => column.id === columnId);
    const sourceTask = sourceColumn?.tasks.find((task) => task.id === taskId);

    if (!sourceColumn || !sourceTask) {
      return;
    }

    const nextChecklist = sourceTask.checklist.map((item) =>
      item.id === checklistItemId ? { ...item, completed: !item.completed } : item,
    );
    const toggledItem = nextChecklist.find((item) => item.id === checklistItemId);
    const previousColumns = columns;
    const nextColumns = withColumnCounts(
      columns.map((column) =>
        column.id === columnId
          ? {
              ...column,
              tasks: column.tasks.map((task) =>
                task.id === taskId
                  ? {
                      ...task,
                      checklist: nextChecklist,
                    }
                  : task,
              ),
            }
          : column,
      ),
    );

    setColumns(nextColumns);

    if (taskModal?.taskId === taskId) {
      setTaskModalForm((current) => ({
        ...current,
        subtasks: current.subtasks.map((item) =>
          item.id === checklistItemId ? { ...item, completed: !item.completed } : item,
        ),
      }));
    }

    void fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        subtasks: nextChecklist,
        projectRef: activeProjectRef,
      }),
    })
      .then(() => {
        if (toggledItem) {
          recordTaskChecklistActivity({
            taskTitle: sourceTask.title,
            checklistItemTitle: toggledItem.title,
            completed: toggledItem.completed,
          });
        }
      })
      .catch((error) => {
        console.error("Failed to persist task checklist change from card:", error);
        setColumns(previousColumns);

        if (taskModal?.taskId === taskId) {
          setTaskModalForm((current) => ({
            ...current,
            subtasks: sourceTask.checklist.map((item) => ({ ...item })),
          }));
        }
      });
  };

  const handleSaveTaskModal = () => {
    if (!taskModal) {
      return;
    }

    const previousModalState = taskModal;
    const previousColumns = columns;
    const previousTask = previousColumns
      .flatMap((column) => column.tasks)
      .find((task) => task.id === taskModal.taskId);
    const previousAssigneeNames = new Set(previousTask?.assignees.map((assignee) => assignee.name) ?? []);
    const newlyAssignedRecipients = resolveTaskNotificationRecipients(
      taskModalForm.assignedTo.filter((name) => !previousAssigneeNames.has(name)),
    );
    const stageChangeRecipients = resolveTaskNotificationRecipients(taskModalForm.assignedTo);
    const hasStatusChange = previousModalState.columnId !== taskModalForm.statusId;
    const nextColumns = updateTaskDetails(columns, taskModal, taskModalForm);
    setColumns(nextColumns);
    setTaskModal((current) => (current ? { ...current, columnId: taskModalForm.statusId, mode: "view" } : current));
    setAssigneeMenuOpen(false);

    void fetch(`/api/tasks/${taskModal.taskId}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        title: taskModalForm.title,
        description: taskModalForm.description,
        statusId: taskModalForm.statusId,
        tag: taskModalForm.tag,
        priority: taskModalForm.priority,
        assignedTo: taskModalForm.assignedTo,
        dueDate: taskModalForm.dueDate,
        reminderDate: taskModalForm.reminderDate,
        subtasks: normalizeTaskChecklistItems(taskModalForm.subtasks),
        notes: taskModalForm.notes,
        links: taskModalForm.links,
        comments: taskModalForm.comments,
        fileIds: taskModalForm.fileIds,
        projectRef: activeProjectRef,
        sortOrder: buildTaskOrderPayload(nextColumns).find((item) => item.id === taskModal.taskId)?.sortOrder ?? null,
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Task update failed.");
        }

        await persistTaskOrder(nextColumns);

        if (hasStatusChange) {
          prependTaskStageChangedNotification({
            taskId: taskModal.taskId,
            taskTitle: taskModalForm.title.trim(),
            previousColumnId: previousModalState.columnId,
            nextColumnId: taskModalForm.statusId,
            columnsSnapshot: previousColumns,
          });
        } else {
          prependProjectNotification(createProjectNotification({
            title: "Task updated",
            body: `"${taskModalForm.title.trim()}" was updated in ${resolveTaskColumnTitle(previousColumns, taskModalForm.statusId)}.`,
            kind: "comment",
            targetTab: "Tasks",
            targetTaskId: taskModal.taskId,
            targetColumnId: taskModalForm.statusId,
          }));
        }

        if (newlyAssignedRecipients.length > 0) {
          void dispatchNotificationEmailEvent({
            eventType: "task-assigned",
            eventKey: `task-assigned:${taskModal.taskId}:${Date.now()}`,
            projectRef: activeProjectRef,
            projectName: activeProject.name,
            taskId: taskModal.taskId,
            taskTitle: taskModalForm.title.trim(),
            statusId: taskModalForm.statusId,
            dueDate: taskModalForm.dueDate,
            reminderDate: taskModalForm.reminderDate,
            recipients: newlyAssignedRecipients,
          });
        }

        if (hasStatusChange && stageChangeRecipients.length > 0) {
          void dispatchNotificationEmailEvent({
            eventType: "task-stage-changed",
            eventKey: `task-stage-modal:${taskModal.taskId}:${Date.now()}`,
            projectRef: activeProjectRef,
            projectName: activeProject.name,
            taskId: taskModal.taskId,
            taskTitle: taskModalForm.title.trim(),
            previousStatusId: previousModalState.columnId,
            statusId: taskModalForm.statusId,
            dueDate: taskModalForm.dueDate,
            recipients: stageChangeRecipients,
          });
        }
      })
      .catch((error) => {
        console.error("Failed to persist task changes:", error);
        setColumns(previousColumns);
        setTaskModal((current) => (current ? { ...current, columnId: previousModalState.columnId, mode: "edit" } : current));
      });
  };

  const handleCreateTask = () => {
    const title = taskForm.title.trim();

    if (!title) {
      return;
    }

    const assignees = taskAssigneeOptions.filter((member) => taskForm.assignedTo.includes(member.name));
    const tempTaskId = -Date.now();
    const nextTask: BoardTask = {
      id: tempTaskId,
      tag: taskForm.tag,
      tagTone: getTagTone(taskForm.tag),
      priority: taskForm.priority,
      title,
      description:
        taskForm.description.trim() ||
        "New task created from the board view. Update this placeholder content when backend data is wired in.",
      checklist: normalizeTaskChecklistItems(taskForm.subtasks),
      notes: taskForm.notes.map((note) => note.trim()).filter(Boolean),
      assignees,
      attachments: taskForm.fileIds.length,
      attachmentFileIds: [...taskForm.fileIds],
      comments: taskForm.comments.filter((comment) => comment.body.trim()).length,
      commentItems: taskForm.comments.map((comment) => ({ ...comment, body: comment.body.trim() })).filter((comment) => comment.body),
      links: taskForm.links.filter((link) => link.url.trim()).length,
      linkItems: taskForm.links.map((link) => ({ ...link, url: link.url.trim() })).filter((link) => link.url),
      dueDate: taskForm.dueDate || undefined,
      dueLabel: formatDueDate(taskForm.dueDate),
      reminderDate: taskForm.reminderDate || undefined,
      reminderLabel: formatReminderDateTime(taskForm.reminderDate),
    };

    const optimisticColumns = withColumnCounts(
      columns.map((column) =>
        column.id === taskForm.statusId
          ? { ...column, tasks: [nextTask, ...column.tasks] }
          : column,
      ),
    );

    setColumns(optimisticColumns);

    void fetch("/api/tasks", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        title,
        description: taskForm.description.trim(),
        statusId: taskForm.statusId,
        tag: taskForm.tag,
        priority: taskForm.priority,
        assignedTo: taskForm.assignedTo,
        dueDate: taskForm.dueDate,
        reminderDate: taskForm.reminderDate,
        createdBy: "You",
        subtasks: normalizeTaskChecklistItems(taskForm.subtasks),
        notes: taskForm.notes,
        links: taskForm.links,
        comments: taskForm.comments,
        fileIds: taskForm.fileIds,
        projectRef: activeProjectRef,
        sortOrder: 10,
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Task persistence failed.");
        }

        const result = await readJsonSafely<{
          task?: {
            id: number;
            title: string;
            description: string;
            status_id: string;
            tag: string;
            priority: "Normal" | "Medium" | "High" | "Done";
            assigned_to: string | null;
            due_date: string | null;
            reminder_at: string | null;
            reminder_date: string | null;
            created_by: string;
            subtasks: unknown;
            notes: string[] | null;
            links?: unknown;
            comments?: unknown;
            file_ids?: unknown;
            created_at: string;
          };
        }>(response);

        if (!result?.task) {
          return;
        }

        const persistedTask = mapApiTasksToColumns([result.task])
          .flatMap((column) => column.tasks)
          .find((task) => task.id === result.task?.id);

        if (!persistedTask) {
          return;
        }

        setColumns((currentColumns) =>
          withColumnCounts(
            currentColumns.map((column) =>
              column.id === taskForm.statusId
                ? {
                    ...column,
                    tasks: column.tasks.map((task) => (task.id === tempTaskId ? persistedTask : task)),
                  }
                : column,
            ),
          ),
        );

        const nextColumns = optimisticColumns.map((column) => ({
          ...column,
          tasks: column.tasks.map((task) => (task.id === tempTaskId ? persistedTask : task)),
        }));

        prependProjectNotification(createProjectNotification({
          title: "Task created",
          body: `"${persistedTask.title}" was added to ${columns.find((column) => column.id === taskForm.statusId)?.title ?? "the board"}.`,
          kind: "task",
          targetTab: "Tasks",
          targetTaskId: persistedTask.id,
          targetColumnId: taskForm.statusId,
        }));
        await persistTaskOrder(withColumnCounts(nextColumns));

      })
      .catch((error) => {
        console.error("Failed to persist task:", error);
        setColumns((currentColumns) =>
          withColumnCounts(
            currentColumns.map((column) => ({
              ...column,
              tasks: column.tasks.filter((task) => task.id !== tempTaskId),
            })),
          ),
        );
      });

    closeDrawer();
  };

  function handleDeleteTask() {
    if (!pendingDeleteTask) {
      return;
    }

    const previousColumns = columns;
    const nextColumns = withColumnCounts(
      columns.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => task.id !== pendingDeleteTask.task.id),
      })),
    );

    setColumns(nextColumns);
    setTaskModal(null);
    setPendingDeleteTask(null);
    prependProjectNotification(createProjectNotification({
      title: "Task deleted",
      body: `"${pendingDeleteTask.task.title}" was removed from the project board.`,
      kind: "overdue",
      targetTab: "Tasks",
    }));

    void fetch(`/api/tasks/${pendingDeleteTask.task.id}`, {
      method: "DELETE",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Task delete failed.");
        }

        await persistTaskOrder(nextColumns);
      })
      .catch((error) => {
        console.error("Failed to delete task:", error);
        setColumns(previousColumns);
      });
  }

  return (
    <main className="bg-dashboard relative z-0 min-h-screen overflow-x-hidden px-0 py-4 text-[var(--text-primary)] sm:p-6 lg:h-screen lg:overflow-hidden lg:p-0">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-[rgba(12,12,14,0.96)]"
      />
      <div className="flex w-full max-w-full flex-col lg:h-full lg:flex-row">
        <PrimarySidebar />

        <div className="flex max-w-full flex-1 overflow-hidden bg-[rgba(12,12,14,0.92)] lg:h-full lg:border-l lg:border-white/6">
          {!projectBoardReady ? (
            <div className="flex w-full items-center justify-center rounded-none border-y border-white/6 bg-[rgba(12,12,14,0.96)] sm:rounded-[var(--radius-xl)] sm:border sm:border-l-0 lg:rounded-none">
              <AppLoader
                fullscreen={false}
                compact
                label="Loading project workspace"
                detail="Preparing your latest board data"
                className="min-h-[calc(100vh-8rem)] w-full rounded-none border-0 lg:min-h-full"
              />
            </div>
          ) : (
            <div className="flex w-full max-w-full overflow-hidden rounded-none border-y border-white/6 bg-[rgba(12,12,14,0.96)] sm:rounded-[var(--radius-xl)] sm:border sm:border-l-0 lg:h-full lg:rounded-none">
              <div
                className={cn(
                  "shrink-0 overflow-hidden transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[width]",
                  projectSidebarCollapsed ? "lg:w-[84px]" : "lg:w-[268px]",
                )}
              >
                <ProjectDirectorySidebar
                  projects={projects}
                  clients={workspaceClients}
                  sidebarCollapsed={projectSidebarCollapsed}
                  onCreateProject={() => setCreateModalOpen(true)}
                  onSelectProject={setActiveProject}
                  onToggleSidebarCollapsed={() => setProjectSidebarCollapsed((current) => !current)}
                />
              </div>

              <section className="relative flex min-w-0 flex-1 flex-col lg:h-full lg:overflow-hidden">
                {!hasProjects ? (
                  <div className="flex min-h-[calc(100vh-8rem)] flex-1 items-center justify-center px-8 py-12 lg:min-h-0">
                    <div className="w-full max-w-[520px] rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.045)_0%,rgba(255,255,255,0.02)_100%)] p-8 text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] border border-white/8 bg-white/[0.04] text-[var(--text-secondary)]">
                        <FolderKanban className="h-7 w-7" />
                      </div>
                      <h1 className="mt-5 text-[1.5rem] font-semibold tracking-tight text-white">No projects yet</h1>
                      <p className="mt-2 text-[0.95rem] leading-6 text-[var(--text-secondary)]">
                        Start with your first workspace project. Tasks, files, discussions, notifications, and time tracking will appear here after creation.
                      </p>
                      <div className="mt-6 flex justify-center">
                        <button
                          type="button"
                          onClick={() => setCreateModalOpen(true)}
                          className="inline-flex h-12 items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--accent)]/28 bg-[linear-gradient(180deg,rgba(251,138,116,0.18)_0%,rgba(251,138,116,0.08)_100%)] px-5 text-sm font-semibold text-[var(--accent)] transition hover:border-[var(--accent)]/38 hover:bg-[linear-gradient(180deg,rgba(251,138,116,0.22)_0%,rgba(251,138,116,0.1)_100%)]"
                        >
                          <Plus className="h-4 w-4" />
                          Create first project
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                <>
                <div className="shrink-0 border-b border-white/6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="flex items-center gap-4">
                      {activeProjectClient ? (
                        <CompanyLogo
                          company={activeProjectClient.company}
                          website={activeProjectClient.website}
                          logoUrl={activeProjectClient.logoUrl}
                          size="lg"
                          className="h-14 w-14 rounded-[18px]"
                        />
                      ) : (
                        <Avatar initials={activeProject.initials} tone={activeProject.tone} size="lg" shape="soft" />
                      )}
                      <div>
                        <h1 className="type-page-title tracking-tight text-white">{activeProject.name}</h1>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <p className="type-ui text-[var(--text-muted)]">{activeProject.projectType || activeProject.category}</p>
                          {activeProject.completed && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-[#74d7a7]/25 bg-[#74d7a7]/10 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[#9ae5bd]">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => void handleSetActiveProjectCompleted(!activeProject.completed)}
                        disabled={!activeProject.completed && !canMarkActiveProjectComplete}
                        title={
                          activeProject.completed
                            ? "Move this project back to active projects."
                            : canMarkActiveProjectComplete
                              ? "Mark this project as completed."
                              : "Complete all project tasks before marking the project as completed."
                        }
                        className={cn(
                          "inline-flex h-10 items-center gap-2 rounded-[var(--radius-md)] border px-3.5 text-[0.8rem] font-medium transition disabled:cursor-not-allowed disabled:opacity-55",
                          activeProject.completed
                            ? "border-[#74d7a7]/28 bg-[#74d7a7]/12 text-[#b1efd0]"
                            : canMarkActiveProjectComplete
                              ? "border-[var(--accent)]/24 bg-[var(--accent)]/10 text-[var(--text-primary)]"
                              : "border-white/8 bg-white/4 text-[var(--text-muted)]",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-4 w-4 items-center justify-center rounded-[4px] border",
                            activeProject.completed
                              ? "border-[#74d7a7]/55 bg-[#74d7a7]/18 text-[#dffff0]"
                              : canMarkActiveProjectComplete
                                ? "border-[var(--accent)]/45 text-[var(--accent)]"
                                : "border-white/15 text-transparent",
                          )}
                        >
                          <Check className="h-3 w-3" />
                        </span>
                        {activeProject.completed ? "Completed project" : "Mark as complete"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSearchOpen(true)}
                        className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-white/5 text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                      >
                        <Search className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleToggleActiveProjectStar}
                        aria-pressed={Boolean(activeProject.starred)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-white/5 transition",
                          activeProject.starred ? "text-[#f5c842]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                        )}
                      >
                        <Star className={cn("h-4 w-4", activeProject.starred && "fill-current")} />
                      </button>
                      <div className="relative" ref={notificationsDropdownRef}>
                        <button
                          type="button"
                          onClick={() => { setNotificationsOpen((prev) => !prev); setSettingsOpen(false); }}
                          className="relative flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-white/5 text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                        >
                          <Bell className="h-4 w-4" />
                          {projectNotificationsReady && activeProjectNotifications.some((notification) => notification.unread) && (
                            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[var(--red)]" />
                          )}
                        </button>
                        <NotificationsDropdown
                          open={notificationsOpen}
                          onClose={() => setNotificationsOpen(false)}
                          notifications={activeProjectNotifications}
                          loading={!projectNotificationsReady}
                          onToggleRead={toggleProjectNotificationRead}
                          onDelete={deleteProjectNotification}
                          onMarkAllRead={markAllProjectNotificationsRead}
                          onOpenAll={() => {
                            setSelectedTopTab("Notifications");
                            setNotificationsOpen(false);
                          }}
                        />
                      </div>
                      <div className="relative" ref={settingsDropdownRef}>
                        <button
                          type="button"
                          onClick={() => { setSettingsOpen((prev) => !prev); setNotificationsOpen(false); }}
                          className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-white/5 text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                        <SettingsDropdown
                          open={settingsOpen}
                          onClose={() => setSettingsOpen(false)}
                          hideSpace={Boolean(activeProject.hidden)}
                          archivedSpace={Boolean(activeProject.archived)}
                          onRename={() => {
                            setEditProjectModalOpen(true);
                            setSettingsOpen(false);
                          }}
                          onCopyLink={handleCopyProjectLink}
                          onToggleHideSpace={handleToggleHideActiveProject}
                          onDuplicate={handleDuplicateActiveProject}
                          onArchive={handleArchiveActiveProject}
                          onRestore={handleRestoreActiveProject}
                          onDelete={handleDeleteActiveProject}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                    <div className="type-ui flex flex-wrap items-center gap-6 text-[var(--text-muted)]">
                      {projectTopTabs.map((tab, index) => {
                        const isActive = selectedTopTab === tab.label;

                        return (
                          <button
                            key={tab.label}
                            type="button"
                            onClick={() => setSelectedTopTab(tab.label as ProjectTopTab)}
                            className={cn(
                              "group relative flex animate-[fade-slide-in_240ms_ease-out] items-center gap-2 pb-3 text-[var(--text-muted)] transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-[var(--text-primary)]",
                              isActive && "text-[var(--text-primary)]",
                            )}
                            style={{ animationDelay: `${index * 35}ms` }}
                          >
                            <span className="relative z-10">{tab.label}</span>
                            {tab.badge && (
                              <span
                                className={cn(
                                  "relative z-10 rounded-full bg-[linear-gradient(180deg,#7f231e_0%,#4f1214_55%,#30070c_100%)] px-1.5 py-0.5 text-[0.6rem] font-semibold text-[#ffe8e2] shadow-[0_8px_18px_rgba(70,10,14,0.28)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                                  isActive ? "scale-100" : "group-hover:scale-105",
                                )}
                              >
                                {tab.badge}
                              </span>
                            )}
                            <span
                              aria-hidden="true"
                              className={cn(
                                "pointer-events-none absolute bottom-0 left-0 h-0.5 w-full origin-left rounded-full bg-[var(--text-primary)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                                isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                              )}
                            />
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-2 xl:pb-1">
                      <AvatarCluster members={activeProjectMembers} />
                      {activeProjectOverflowCount > 0 && (
                        <div className="type-ui flex h-9 items-center rounded-full bg-white/8 px-3 text-[var(--text-secondary)]">
                          +{activeProjectOverflowCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedTopTab === "Overview" ? (
                  <div className="flex min-h-0 flex-1 animate-[fade-slide-in_280ms_ease-out] overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                      <ProjectOverview
                        description={activeProjectDescription}
                        details={activeProjectDetails}
                        clientName={activeProjectClientName}
                        clientWebsite={activeProjectClient?.website}
                        clientLogoUrl={activeProjectClient?.logoUrl}
                        documents={activeProjectDocuments}
                        goals={activeProjectGoals}
                        totalTasks={totalTasksCount}
                        completedTasks={completedTasksCount}
                        memberCount={activeProjectMemberCount}
                        memberAvatars={activeProjectMembers}
                        onEditProjectDetails={() => setEditProjectModalOpen(true)}
                        onUploadDocuments={() => setDocumentModalOpen(true)}
                        onSetupGoals={() => setGoalsModalOpen(true)}
                      />
                    </div>
                    <ProjectActivityPanel />
                  </div>
                ) : selectedTopTab === "Discussions" ? (
                  <div className="min-h-0 flex-1 animate-[fade-slide-in_280ms_ease-out] overflow-y-auto">
                    <DiscussionsView
                      projectId={activeProjectRef}
                      teamMembers={teamMembers}
                      onCountsChange={(counts) => setDiscussionThreadCount(counts.threads)}
                    />
                  </div>
                ) : selectedTopTab === "Team Members" ? (
                  <div className="min-h-0 flex-1 animate-[fade-slide-in_280ms_ease-out] overflow-y-auto">
                    <TeamMembersView
                      members={projectTeamMembers}
                      clientContacts={activeProjectClientContacts}
                      projectName={activeProject.name}
                      workspaceTeams={workspaceTeams}
                      onAddMember={() => setAddMemberModalOpen(true)}
                      onUpdateMember={handleUpdateTeamMember}
                      onDeleteMember={handleDeleteTeamMember}
                    />
                  </div>
                ) : selectedTopTab === "Notifications" ? (
                  <div className="min-h-0 flex-1 animate-[fade-slide-in_280ms_ease-out] overflow-y-auto">
                    <NotificationsView
                      notifications={activeProjectNotifications}
                      loading={!projectNotificationsReady}
                      onToggleRead={toggleProjectNotificationRead}
                      onDelete={deleteProjectNotification}
                      onMarkAllRead={markAllProjectNotificationsRead}
                      onDeleteRead={clearReadProjectNotifications}
                      onOpenNotification={openProjectNotification}
                    />
                  </div>
                ) : selectedTopTab === "Files" ? (
                  <div className="min-h-0 flex-1 animate-[fade-slide-in_280ms_ease-out] overflow-y-auto">
                    <FilesView
                      projectRef={activeProjectRef}
                      files={activeProjectFiles}
                      documents={activeProjectDocuments}
                      loading={activeProjectFilesLoading}
                      errorMessage={activeProjectFilesError}
                      onUploadFiles={async (files) => {
                        await handleUploadProjectFiles(files);
                      }}
                      onRenameFile={handleRenameProjectFile}
                      onDuplicateFile={handleDuplicateProjectFile}
                      onDeleteFile={handleDeleteProjectFile}
                    />
                  </div>
                ) : selectedTopTab === "Integrations" ? (
                  <div className="min-h-0 flex-1 animate-[fade-slide-in_280ms_ease-out] overflow-y-auto">
                    <IntegrationsView
                      projectName={activeProject.name}
                      items={activeProjectIntegrations}
                      onToggleIntegration={handleToggleProjectIntegration}
                      onAddIntegration={handleAddProjectIntegration}
                      onRemoveIntegration={handleRemoveProjectIntegration}
                      onExportProjectData={handleExportProjectData}
                      onImportProjectData={handleImportProjectData}
                    />
                  </div>
                ) : selectedTopTab === "Tasks" ? (
                  <div className="min-h-0 flex-1 animate-[fade-slide-in_280ms_ease-out] overflow-y-auto px-6 py-5">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div className="flex flex-wrap items-center gap-3">
                        {viewTabs.map((tab) => (
                          <button
                            key={tab.label}
                            type="button"
                            onClick={() => setSelectedView(tab.label as ProjectView)}
                            className={cn(
                              "flex h-11 items-center gap-2 rounded-[var(--radius-md)] border border-white/6 px-4 text-sm transition",
                              selectedView === tab.label
                                ? "bg-white/7 text-[var(--text-primary)]"
                                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
                            )}
                          >
                            {tab.label === "Board View" && <Grid2x2 className="h-4 w-4" />}
                            {tab.label === "List View" && <List className="h-4 w-4" />}
                            {tab.label === "Timeline View" && <Clock3 className="h-4 w-4" />}
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="rounded-[var(--radius-md)] border border-white/6 bg-white/[0.03] px-4 py-2.5 text-[0.78rem] text-[var(--text-secondary)]">
                          {String(filteredTaskCount).padStart(2, "0")} visible
                          {hasActiveTaskFilters ? " after filters" : " tasks"}
                        </div>

                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => {
                              setSortOpen((prev) => !prev);
                              setFilterOpen(false);
                              setDrawerOpen(false);
                            }}
                            className="flex h-11 items-center gap-2 rounded-[var(--radius-md)] bg-white/7 px-4 text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                          >
                            <svg viewBox="0 0 16 16" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.5">
                              <path d="M5 3.5v9m0 0-2-2m2 2 2-2M11 12.5v-9m0 0-2 2m2-2 2 2" />
                            </svg>
                            {selectedSort}
                          </button>
                          {sortOpen && (
                            <SortMenu
                              selected={selectedSort}
                              onSelect={(value) => {
                                setSelectedSort(value);
                                setColumns((currentColumns) => sortColumns(currentColumns, value));
                                setSortOpen(false);
                              }}
                            />
                          )}
                        </div>

                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => {
                              setFilterOpen((prev) => !prev);
                              setSortOpen(false);
                              setDrawerOpen(false);
                            }}
                            className={cn(
                              "flex h-11 items-center gap-2 rounded-[var(--radius-md)] px-4 text-sm transition",
                              hasActiveTaskFilters || filterOpen
                                ? "bg-[var(--accent)]/12 text-[var(--accent)]"
                                : "bg-white/7 text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                            )}
                          >
                            <Funnel className="h-4 w-4" />
                            Filter
                            {hasActiveTaskFilters && (
                              <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white/10 px-1 text-[0.65rem] font-semibold">
                                {[taskFilters.statusId, taskFilters.assigneeName, taskFilters.tag, taskFilters.dueState].filter((value) => value !== "all").length}
                              </span>
                            )}
                          </button>
                          {filterOpen && (
                            <FilterMenu
                              filters={taskFilters}
                              statusOptions={columns}
                              assigneeOptions={availableAssignees}
                              tagOptions={availableTags}
                              onChange={(patch) => setTaskFilters((current) => ({ ...current, ...patch }))}
                              onClear={() => setTaskFilters(DEFAULT_TASK_FILTERS)}
                            />
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => { setTagsOpen((v) => !v); setDrawerOpen(false); setSortOpen(false); setFilterOpen(false); }}
                          className={cn(
                            "flex h-11 items-center gap-2 rounded-[var(--radius-md)] px-4 text-sm transition",
                            tagsOpen
                              ? "bg-[var(--accent)]/12 text-[var(--accent)]"
                              : "bg-white/7 text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                          )}
                        >
                          <Tag className="h-4 w-4" />
                          Tags
                          <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white/10 px-1 text-[0.65rem] font-semibold">
                            {tags.length}
                          </span>
                        </button>
                      </div>
                    </div>

                    {hasActiveTaskFilters && selectedView === "Board View" && (
                      <div className="mt-4 rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.03] px-4 py-3 text-[0.78rem] text-[var(--text-secondary)]">
                        Board drag and drop is disabled while filters are active. Clear filters to reorder tasks safely.
                      </div>
                    )}

                    {selectedView === "List View" ? (
                      <ListViewSection
                        columns={filteredColumns}
                        tags={tags}
                        activeTrackedTaskIds={activeTrackedTaskIds}
                        onOpenDrawer={openDrawer}
                        onOpenTask={openTaskModal}
                        statusMenu={listStatusMenu}
                        onToggleStatusMenu={(taskId, columnId, anchorRect) => {
                          setListStatusMenu((current) =>
                            current?.taskId === taskId && current.columnId === columnId
                              ? null
                              : (() => {
                                  const menuWidth = 200;
                                  const menuHeight = columns.length * 42 + 8;
                                  const gap = 8;
                                  const left = Math.min(anchorRect.left, window.innerWidth - menuWidth - 16);
                                  const showAbove =
                                    anchorRect.bottom + gap + menuHeight > window.innerHeight - 16
                                    && anchorRect.top - gap - menuHeight > 16;

                                  return {
                                    taskId,
                                    columnId,
                                    left,
                                    top: showAbove
                                      ? Math.max(16, anchorRect.top - menuHeight - gap)
                                      : Math.min(window.innerHeight - menuHeight - 16, anchorRect.bottom + gap),
                                  };
                                })(),
                          );
                        }}
                        onCloseStatusMenu={() => {
                          setListStatusMenu(null);
                        }}
                        onSelectStatus={handleSelectListStatus}
                      />
                    ) : selectedView === "Timeline View" ? (
                      <TimelineViewSection columns={filteredColumns} />
                    ) : (
                      <div
                        ref={boardScrollViewportRef}
                        className="mt-6 overflow-x-auto pb-3"
                        onDragOver={(event) => {
                          if (!hasActiveTaskFilters) {
                            updateBoardAutoScroll(event.clientX);
                          }
                        }}
                      >
                        <div
                          className="grid min-w-[1320px] gap-5"
                          style={{ gridTemplateColumns: `repeat(${filteredColumns.length}, minmax(0, 1fr))` }}
                        >
                          {filteredColumns.map((column) => (
                            <section
                              key={column.id}
                              className={cn("flex h-full min-h-[320px] flex-col overflow-hidden rounded-[var(--radius-xl)]", boardColumnSurfaceClasses(column.id))}
                            >
                              <div className="flex items-center justify-between px-4 py-4">
                                <div className="flex items-center gap-2 text-[1.02rem] font-medium text-[var(--text-secondary)]">
                                  <span className={cn("h-2.5 w-2.5 rounded-full", columnBulletColor(column.id))} />
                                  {column.title} ({column.count})
                                </div>
                                <button
                                  type="button"
                                  onClick={() => openDrawer(column.id)}
                                  className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--accent)]/18 bg-[linear-gradient(180deg,rgba(244,194,123,0.18)_0%,rgba(251,138,116,0.08)_100%)] text-[var(--accent)] shadow-[0_10px_24px_rgba(0,0,0,0.16)] transition hover:border-[var(--accent)]/28 hover:bg-[linear-gradient(180deg,rgba(244,194,123,0.24)_0%,rgba(251,138,116,0.12)_100%)] hover:text-[var(--accent-strong)]"
                                  title={`Add task in ${column.title}`}
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>

                              <div
                                data-board-column-drop-zone={column.id}
                                className="flex min-h-[240px] flex-1 flex-col gap-4 px-3 pb-3"
                                onDragOver={(event) => {
                                  if (!hasActiveTaskFilters) {
                                    event.preventDefault();
                                    updateBoardAutoScroll(event.clientX);
                                    updateDragIndicatorForColumn(column.id, event.clientY);
                                  }
                                }}
                                onDrop={(event) => {
                                  if (!hasActiveTaskFilters) {
                                    handleColumnDrop(event, column.id);
                                  }
                                }}
                              >
                                {column.tasks.length === 0 && (
                                  <div
                                    className={cn(
                                      "relative flex min-h-full flex-1 items-center justify-center rounded-[var(--radius-lg)] border border-dashed text-sm transition",
                                      boardColumnEmptyStateClasses(column.id),
                                      dragIndicator?.columnId === column.id && dragIndicator.position === "empty" && "border-[var(--accent)]/30 bg-[var(--accent)]/[0.06] text-[var(--text-primary)]",
                                    )}
                                  >
                                    {dragIndicator?.columnId === column.id && dragIndicator.position === "empty" ? (
                                      <div className="pointer-events-none absolute left-4 right-4 top-4">
                                        <span className="block h-[2px] w-full rounded-full bg-[var(--accent)] shadow-[0_0_18px_rgba(251,138,116,0.28)]" />
                                      </div>
                                    ) : null}
                                    {hasActiveTaskFilters ? "No filtered tasks here" : "Drop task here"}
                                  </div>
                                )}
                                {column.tasks.map((task) => (
                                  <TaskCard
                                    key={task.id}
                                    task={task}
                                    columnId={column.id}
                                    isTimerActive={activeTrackedTaskIds.has(task.id)}
                                    dragEnabled={!hasActiveTaskFilters}
                                    showDropIndicatorBefore={
                                      dragIndicator?.columnId === column.id
                                      && dragIndicator.targetTaskId === task.id
                                      && dragIndicator.position === "before"
                                    }
                                    showDropIndicatorAfter={
                                      dragIndicator?.columnId === column.id
                                      && dragIndicator.targetTaskId === task.id
                                      && dragIndicator.position === "after"
                                    }
                                    tags={tags}
                                    isDragging={dragState?.taskId === task.id}
                                    onOpenTask={() => {
                                      if (suppressCardClickRef.current === task.id) {
                                        suppressCardClickRef.current = null;
                                        return;
                                      }

                                      openTaskModal(task.id, column.id);
                                    }}
                                    onOpenTaskSettings={() => openTaskModal(task.id, column.id, "edit")}
                                    onOpenAddSubtask={() => openTaskModalWithNewSubtask(task.id, column.id)}
                                    onToggleChecklistItem={(checklistItemId) => {
                                      handleToggleTaskChecklistFromCard(task.id, column.id, checklistItemId);
                                    }}
                                    onPointerDown={(event) => {
                                      handleTouchCardPointerDown(event, task.id, column.id);
                                    }}
                                    onDragStart={(event) => {
                                      event.dataTransfer.effectAllowed = "move";
                                      handleDragStart(task.id, column.id);
                                    }}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={(event) => {
                                      if (!hasActiveTaskFilters) {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        updateBoardAutoScroll(event.clientX);
                                        updateDragIndicatorForTask(event, column.id, task.id);
                                      }
                                    }}
                                    onDrop={(event) => {
                                      if (!hasActiveTaskFilters) {
                                        handleTaskDrop(event, column.id, task.id);
                                      }
                                    }}
                                  />
                                ))}
                              </div>
                            </section>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="min-h-0 flex-1" />
                )}
                </>
                )}
              </section>
            </div>
          )}

          <SearchOverlay
            open={searchOpen}
            onClose={() => setSearchOpen(false)}
            results={projectSearchResults}
            onSelect={handleSearchResultSelect}
          />
          <DocumentUploadModal
            open={documentModalOpen}
            documents={activeProjectDocuments}
            onClose={() => setDocumentModalOpen(false)}
            onSave={handleSaveProjectDocuments}
          />
          <GoalSetupModal
            open={goalsModalOpen}
            initialGoals={activeProjectGoals}
            onClose={() => setGoalsModalOpen(false)}
            onSave={handleSaveProjectGoals}
          />
          <EditProjectDetailsModal
            open={editProjectModalOpen}
            clients={workspaceClients}
            initialValues={activeProjectEditValues}
            onClose={() => setEditProjectModalOpen(false)}
            onSave={handleSaveProjectDetails}
          />
          <AddMemberModal
            open={addMemberModalOpen}
            onClose={() => setAddMemberModalOpen(false)}
            existingMembers={projectTeamMembers}
            workspaceMembers={teamMembers}
            onInviteMembers={handleInviteTeamMembers}
          />
          <CreateProjectModal
            open={createModalOpen}
            clients={workspaceClients}
            memberOptions={teamMembers}
            workspaceTeams={workspaceTeams}
            onClose={() => setCreateModalOpen(false)}
            onCreate={handleCreateProject}
          />

          <DeleteConfirmationModal
            open={Boolean(pendingProjectDeleteId)}
            title="Move project to trash?"
            description={
              pendingProjectDeleteId
                ? `"${activeProject.name}" will move to workspace trash and can be restored from Settings. Type MOVE PROJECT to continue.`
                : ""
            }
            confirmLabel="Move project"
            confirmationKeyword="MOVE PROJECT"
            confirmationLabel="Type MOVE PROJECT to confirm"
            onConfirm={handleConfirmDeleteProject}
            onClose={() => setPendingProjectDeleteId(null)}
          />

          <TagsPanel
            open={tagsOpen}
            tags={tags}
            columns={columns}
            onClose={() => setTagsOpen(false)}
            onAdd={addTag}
            onRename={renameTag}
            onDelete={deleteTag}
            onColorChange={changeTagColor}
          />

          <CreateTaskDrawer
            open={drawerOpen}
            form={taskForm}
            columns={columns}
            tags={tags}
            activeTab={drawerTab}
            assigneeOptions={taskAssigneeOptions}
            assigneeMenuOpen={assigneeMenuOpen}
            onClose={closeDrawer}
            onTabChange={setDrawerTab}
            onTitleChange={(value) => {
              setTaskForm((current) => ({ ...current, title: value }));
            }}
            onDescriptionChange={(value) => {
              setTaskForm((current) => ({ ...current, description: value }));
            }}
            onDueDateChange={(value) => {
              setTaskForm((current) => ({ ...current, dueDate: value }));
            }}
            onReminderDateChange={(value) => {
              setTaskForm((current) => ({ ...current, reminderDate: value }));
            }}
            onStatusChange={(value) => {
              setTaskForm((current) => ({ ...current, statusId: value }));
            }}
            onTagChange={(value) => {
              setTaskForm((current) => ({ ...current, tag: value }));
            }}
            onPriorityChange={(value) => {
              setTaskForm((current) => ({ ...current, priority: value as typeof current.priority }));
            }}
            onToggleAssigneeMenu={() => setAssigneeMenuOpen((prev) => !prev)}
            onSelectAssignee={(name) => {
              setTaskForm((current) => ({
                ...current,
                assignedTo: current.assignedTo.includes(name)
                  ? current.assignedTo.filter((n) => n !== name)
                  : [...current.assignedTo, name],
              }));
            }}
            onAddSubtask={() => {
              setTaskForm((current) => ({ ...current, subtasks: [...current.subtasks, createTaskChecklistDraft()] }));
            }}
            onSubtaskChange={(index, value) => {
              setTaskForm((current) => ({
                ...current,
                subtasks: current.subtasks.map((subtask, subtaskIndex) =>
                  subtaskIndex === index ? { ...subtask, title: value } : subtask,
                ),
              }));
            }}
            onToggleSubtaskComplete={(index) => {
              setTaskForm((current) => ({
                ...current,
                subtasks: current.subtasks.map((subtask, subtaskIndex) =>
                  subtaskIndex === index ? { ...subtask, completed: !subtask.completed } : subtask,
                ),
              }));
            }}
            onRemoveSubtask={(index) => {
              setTaskForm((current) => ({
                ...current,
                subtasks: current.subtasks.filter((_, subtaskIndex) => subtaskIndex !== index),
              }));
            }}
            onAddNote={() => {
              setTaskForm((current) => ({ ...current, notes: [...current.notes, ""] }));
            }}
            onNoteChange={(index, value) => {
              setTaskForm((current) => ({
                ...current,
                notes: current.notes.map((note, noteIndex) =>
                  noteIndex === index ? value : note,
                ),
              }));
            }}
            onRemoveNote={(index) => {
              setTaskForm((current) => ({
                ...current,
                notes: current.notes.filter((_, noteIndex) => noteIndex !== index),
              }));
            }}
            onCreateTask={handleCreateTask}
          />
          <TaskDetailModal
            taskRecord={selectedTaskRecord}
            projectRef={activeProjectRef}
            mode={taskModal?.mode ?? "view"}
            form={taskModalForm}
            columns={columns}
            tags={tags}
            assigneeOptions={taskAssigneeOptions}
            assigneeMenuOpen={assigneeMenuOpen}
            onClose={closeTaskModal}
            onModeChange={(mode) => {
              if (!selectedTaskRecord || !taskModal) {
                return;
              }

              setTaskModal({ ...taskModal, mode });

              if (mode === "edit") {
                setTaskModalForm(createTaskFormFromTask(selectedTaskRecord.task, selectedTaskRecord.columnId));
              } else {
                setAssigneeMenuOpen(false);
              }
            }}
            onTitleChange={(value) => {
              setTaskModalForm((current) => ({ ...current, title: value }));
            }}
            onDescriptionChange={(value) => {
              setTaskModalForm((current) => ({ ...current, description: value }));
            }}
            onDueDateChange={(value) => {
              setTaskModalForm((current) => ({ ...current, dueDate: value }));
            }}
            onReminderDateChange={(value) => {
              setTaskModalForm((current) => ({ ...current, reminderDate: value }));
            }}
            onStatusChange={(value) => {
              setTaskModalForm((current) => ({ ...current, statusId: value }));
            }}
            onTagChange={(value) => {
              setTaskModalForm((current) => ({ ...current, tag: value }));
            }}
            onPriorityChange={(value) => {
              setTaskModalForm((current) => ({ ...current, priority: value as typeof current.priority }));
            }}
            onToggleAssigneeMenu={() => setAssigneeMenuOpen((prev) => !prev)}
            onSelectAssignee={(name) => {
              setTaskModalForm((current) => ({
                ...current,
                assignedTo: current.assignedTo.includes(name)
                  ? current.assignedTo.filter((n) => n !== name)
                  : [...current.assignedTo, name],
              }));
            }}
            onAddSubtask={() => {
              setTaskModalForm((current) => ({ ...current, subtasks: [...current.subtasks, createTaskChecklistDraft()] }));
            }}
            onSubtaskChange={(index, value) => {
              setTaskModalForm((current) => ({
                ...current,
                subtasks: current.subtasks.map((subtask, subtaskIndex) =>
                  subtaskIndex === index ? { ...subtask, title: value } : subtask,
                ),
              }));
            }}
            onToggleSubtaskComplete={(index) => {
              if (!taskModal) {
                return;
              }

              const nextForm = {
                ...taskModalForm,
                subtasks: taskModalForm.subtasks.map((subtask, subtaskIndex) =>
                  subtaskIndex === index ? { ...subtask, completed: !subtask.completed } : subtask,
                ),
              };

              if (taskModal.mode === "edit") {
                setTaskModalForm(nextForm);
                return;
              }

              const previousColumns = columns;
              const previousForm = taskModalForm;
              const nextColumns = updateTaskDetails(columns, taskModal, nextForm);
              const toggledItem = nextForm.subtasks[index];

              setTaskModalForm(nextForm);
              setColumns(nextColumns);

              void fetch(`/api/tasks/${taskModal.taskId}`, {
                method: "PATCH",
                headers: {
                  "content-type": "application/json",
                },
                body: JSON.stringify({
                  title: nextForm.title,
                  description: nextForm.description,
                  statusId: nextForm.statusId,
                  tag: nextForm.tag,
                  priority: nextForm.priority,
                  assignedTo: nextForm.assignedTo,
                  dueDate: nextForm.dueDate,
                  reminderDate: nextForm.reminderDate,
                  subtasks: normalizeTaskChecklistItems(nextForm.subtasks),
                  notes: nextForm.notes,
                  links: nextForm.links,
                  comments: nextForm.comments,
                  fileIds: nextForm.fileIds,
                  projectRef: activeProjectRef,
                }),
              })
                .then(() => {
                  if (toggledItem) {
                    recordTaskChecklistActivity({
                      taskTitle: nextForm.title.trim(),
                      checklistItemTitle: toggledItem.title,
                      completed: toggledItem.completed,
                    });
                  }
                })
                .catch((error) => {
                  console.error("Failed to persist checklist change:", error);
                  setTaskModalForm(previousForm);
                  setColumns(previousColumns);
                });
            }}
            onRemoveSubtask={(index) => {
              setTaskModalForm((current) => ({
                ...current,
                subtasks: current.subtasks.filter((_, subtaskIndex) => subtaskIndex !== index),
              }));
            }}
            onAddNote={() => {
              setTaskModalForm((current) => ({ ...current, notes: [...current.notes, ""] }));
            }}
            onNoteChange={(index, value) => {
              setTaskModalForm((current) => ({
                ...current,
                notes: current.notes.map((note, noteIndex) =>
                  noteIndex === index ? value : note,
                ),
              }));
            }}
            onRemoveNote={(index) => {
              setTaskModalForm((current) => ({
                ...current,
                notes: current.notes.filter((_, noteIndex) => noteIndex !== index),
              }));
            }}
            onAddLink={() => {
              setTaskModalForm((current) => ({ ...current, links: [...current.links, createTaskLinkDraft()] }));
            }}
            onLinkChange={(index, value) => {
              setTaskModalForm((current) => ({
                ...current,
                links: current.links.map((link, linkIndex) =>
                  linkIndex === index ? { ...link, url: value } : link,
                ),
              }));
            }}
            onRemoveLink={(index) => {
              setTaskModalForm((current) => ({
                ...current,
                links: current.links.filter((_, linkIndex) => linkIndex !== index),
              }));
            }}
            onAddComment={() => {
              setTaskModalForm((current) => ({ ...current, comments: [...current.comments, createTaskCommentDraft()] }));
            }}
            onCommentChange={(index, value) => {
              setTaskModalForm((current) => ({
                ...current,
                comments: current.comments.map((comment, commentIndex) =>
                  commentIndex === index ? { ...comment, body: value } : comment,
                ),
              }));
            }}
            onRemoveComment={(index) => {
              setTaskModalForm((current) => ({
                ...current,
                comments: current.comments.filter((_, commentIndex) => commentIndex !== index),
              }));
            }}
            onToggleFileId={(fileId) => {
              setTaskModalForm((current) => ({
                ...current,
                fileIds: current.fileIds.includes(fileId)
                  ? current.fileIds.filter((currentFileId) => currentFileId !== fileId)
                  : [...current.fileIds, fileId],
              }));
            }}
            projectFiles={activeProjectFiles}
            onUploadFiles={handleUploadProjectFiles}
            activeTrackerEntries={activeTrackerEntries}
            onTrackerEntriesChange={handleTaskModalTrackerEntriesChange}
            onSave={handleSaveTaskModal}
            onDelete={() => setPendingDeleteTask(selectedTaskRecord)}
          />
          <DeleteConfirmationModal
            open={Boolean(pendingDeleteTask)}
            title="Move task to trash?"
            description={
              pendingDeleteTask
                ? `"${pendingDeleteTask.task.title}" will move to workspace trash and can be restored from Settings.`
                : ""
            }
            confirmLabel="Move task"
            onConfirm={handleDeleteTask}
            onClose={() => setPendingDeleteTask(null)}
          />
        </div>
      </div>
    </main>
  );
}

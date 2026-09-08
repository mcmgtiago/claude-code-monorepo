"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  Archive,
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Link2,
  MoreHorizontal,
  Pen,
  Plus,
  Search,
  Trash2,
  Upload,
  UserRound,
  X,
  Zap,
  Ban,
  ClipboardList,
} from "lucide-react";

import { Avatar } from "@/components/dashboard/avatar";
import { useBranding } from "@/components/providers/brand-provider";
import type { ActivityItem } from "@/data/dashboard";
import {
  type Integration,
  type ProjectDocument,
  type ProjectNotification,
} from "@/data/project-board";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { ModalCloseButton } from "@/components/ui/modal-close-button";
import {
  INTEGRATION_CATEGORIES,
  createIntegrationId,
  getIntegrationDisplayUrl,
  getIntegrationLogoUrl,
  isValidIntegrationUrl,
  normalizeIntegrationInput,
  normalizeIntegrationUrl,
} from "@/lib/integrations";
import {
  formatProjectFileDate,
  formatProjectFileSize,
  PROJECT_FILE_ACCEPT_ATTRIBUTE,
  PROJECT_FILE_MAX_BYTES,
  type ProjectFileRecord,
} from "@/lib/project-files";
import { TASK_CSV_FORMATS, type TaskCsvFormat } from "@/lib/task-data-exchange";
import { useWorkspaceActivityFeed } from "@/lib/workspace-activity";
import { cn } from "@/lib/utils";

import { notificationIcon } from "./shared";

export type SearchOverlayResult = {
  id: string;
  title: string;
  description: string;
  kind: "task" | "member" | "document" | "goal" | "detail" | "notification" | "file";
  searchText?: string;
};

type TableMenuPosition = {
  top: number;
  left: number;
  openUpward: boolean;
};

function searchResultIcon(kind: SearchOverlayResult["kind"]) {
  if (kind === "task") return ClipboardList;
  if (kind === "member") return UserRound;
  if (kind === "document") return FileText;
  if (kind === "file") return Archive;
  if (kind === "goal") return Zap;
  if (kind === "notification") return Bell;
  return CalendarDays;
}

export function SearchOverlay({
  open,
  onClose,
  results,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  results: SearchOverlayResult[];
  onSelect: (result: SearchOverlayResult) => void;
}) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  const filteredResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return results.slice(0, 8);
    }

    return results.filter((result) =>
      result.title.toLowerCase().includes(normalizedQuery)
      || result.description.toLowerCase().includes(normalizedQuery)
      || result.searchText?.toLowerCase().includes(normalizedQuery),
    );
  }, [query, results]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="absolute inset-0 animate-[overlay-fade-in_180ms_ease-out] bg-black/60" onClick={onClose} />
      <div className="relative z-10 mx-auto mt-24 w-full max-w-[560px] px-4">
        <div className="flex animate-[panel-pop-in_220ms_cubic-bezier(0.16,1,0.3,1)] items-center gap-3 rounded-[var(--radius-xl)] border border-white/8 bg-[#18191d] px-5 py-4 shadow-2xl">
          <span className="text-[var(--text-muted)]">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </span>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects, tasks, members..."
            className="flex-1 border-none bg-transparent text-base text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
          />
          <ModalCloseButton onClick={onClose} aria-label="Close search overlay" className="h-8 w-8 shrink-0" />
        </div>

        <div className="mt-3 animate-[panel-pop-in_240ms_cubic-bezier(0.16,1,0.3,1)] overflow-hidden rounded-[var(--radius-xl)] border border-white/8 bg-[#18191d] shadow-2xl">
          {filteredResults.length > 0 ? (
            <div className="divide-y divide-white/6">
              {filteredResults.map((result) => {
                const Icon = searchResultIcon(result.kind);

                return (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() => {
                      onSelect(result);
                      setQuery("");
                    }}
                    className="flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-white/[0.03]"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-white/8 bg-white/[0.04] text-[var(--accent)]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.9rem] font-semibold text-[var(--text-primary)]">{result.title}</p>
                      <p className="mt-1 text-[0.76rem] text-[var(--text-muted)]">{result.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-5 py-8 text-center text-sm text-[var(--text-muted)]">
              No matching results found for this project.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FileIcon({ name }: { name: string }) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const cfg: Record<string, { label: string; bg: string; text: string }> = {
    docx: { label: "W", bg: "#1a5fb4", text: "#fff" },
    doc: { label: "W", bg: "#1a5fb4", text: "#fff" },
    xlsx: { label: "X", bg: "#26a541", text: "#fff" },
    xls: { label: "X", bg: "#26a541", text: "#fff" },
    pptx: { label: "P", bg: "#c94a2a", text: "#fff" },
    ppt: { label: "P", bg: "#c94a2a", text: "#fff" },
    psd: { label: "PS", bg: "#1c3a6e", text: "#4fa3e0" },
    ai: { label: "Ai", bg: "#2d1e00", text: "#f5a623" },
    jpg: { label: "JPG", bg: "#0e6b6b", text: "#fff" },
    jpeg: { label: "JPG", bg: "#0e6b6b", text: "#fff" },
    png: { label: "PNG", bg: "#0e6b6b", text: "#fff" },
    pdf: { label: "PDF", bg: "#8b1a1a", text: "#fff" },
    css: { label: "CSS", bg: "#1b4fa8", text: "#6eb4ff" },
  };
  const { label, bg, text } = cfg[ext] ?? { label: ext.toUpperCase().slice(0, 3), bg: "#333", text: "#fff" };
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[0.55rem] font-bold"
      style={{ backgroundColor: bg, color: text }}
    >
      {label}
    </div>
  );
}

export function FilesView({
  projectRef,
  files,
  documents,
  loading,
  errorMessage,
  onUploadFiles,
  onRenameFile,
  onDuplicateFile,
  onDeleteFile,
}: {
  projectRef: string;
  files: ProjectFileRecord[];
  documents: ProjectDocument[];
  loading: boolean;
  errorMessage: string | null;
  onUploadFiles: (files: File[]) => Promise<void>;
  onRenameFile: (fileId: string, name: string) => Promise<void>;
  onDuplicateFile: (fileId: string) => Promise<void>;
  onDeleteFile: (fileId: string) => Promise<void>;
}) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<TableMenuPosition | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingFile, setDeletingFile] = useState<ProjectFileRecord | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    type: "upload" | "rename" | "duplicate" | "delete";
    fileId?: string;
  } | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const uploadInputId = `project-files-upload-${projectRef}`;

  const documentLookup = useMemo(
    () => new Map(documents.map((document) => [document.id, document])),
    [documents],
  );
  const filteredFiles = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return files;
    }

    return files.filter((file) => {
      const linkedDocument = file.documentId ? documentLookup.get(file.documentId) : null;

      return file.name.toLowerCase().includes(normalizedQuery)
        || file.mimeType.toLowerCase().includes(normalizedQuery)
        || linkedDocument?.title.toLowerCase().includes(normalizedQuery);
    });
  }, [documentLookup, files, searchQuery]);

  function startRename(file: ProjectFileRecord) {
    setRenamingId(file.id);
    setRenameValue(file.name);
    setLocalError(null);
  }

  async function commitRename(id: string) {
    const nextName = renameValue.trim();

    if (!nextName) {
      setRenamingId(null);
      return;
    }

    try {
      setPendingAction({ type: "rename", fileId: id });
      setLocalError(null);
      await onRenameFile(id, nextName);
      setRenamingId(null);
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "Failed to rename the file.");
    } finally {
      setPendingAction(null);
    }
  }

  async function handleDuplicate(file: ProjectFileRecord) {
    try {
      setPendingAction({ type: "duplicate", fileId: file.id });
      setLocalError(null);
      await onDuplicateFile(file.id);
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "Failed to duplicate the file.");
    } finally {
      setPendingAction(null);
    }
  }

  async function confirmDelete(file: ProjectFileRecord) {
    try {
      setPendingAction({ type: "delete", fileId: file.id });
      setLocalError(null);
      await onDeleteFile(file.id);
      setDeletingFile(null);
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "Failed to delete the file.");
    } finally {
      setPendingAction(null);
    }
  }

  async function handleUploadSelection(fileList: FileList | null) {
    const nextFiles = Array.from(fileList ?? []);

    if (nextFiles.length === 0) {
      return;
    }

    try {
      setPendingAction({ type: "upload" });
      setLocalError(null);
      await onUploadFiles(nextFiles);
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "Failed to upload files.");
    } finally {
      setPendingAction(null);
    }
  }

  function toggleFileMenu(fileId: string, target: HTMLButtonElement) {
    if (openMenuId === fileId) {
      setOpenMenuId(null);
      setMenuPosition(null);
      return;
    }

    const rect = target.getBoundingClientRect();
    const estimatedMenuHeight = 174;
    const viewportHeight = window.innerHeight;
    const openUpward = viewportHeight - rect.bottom < estimatedMenuHeight + 16;

    setOpenMenuId(fileId);
    setMenuPosition({
      top: openUpward ? rect.top - 8 : rect.bottom + 8,
      left: rect.right,
      openUpward,
    });
  }

  return (
    <div className="px-6 py-5">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-[1rem] font-semibold tracking-tight text-[var(--text-primary)]">Project Files</h2>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative min-w-[260px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search files, types, or document slots"
              className="h-10 w-full rounded-[var(--radius-md)] border border-white/8 bg-white/[0.03] pl-9 pr-3 text-[0.84rem] text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-white/14"
            />
          </label>

          <label
            htmlFor={uploadInputId}
            className={cn(
              "inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--accent)]/20 bg-[linear-gradient(135deg,rgba(251,138,116,0.2),rgba(251,138,116,0.1))] px-4 text-[0.82rem] font-semibold text-[var(--text-primary)] shadow-[0_10px_24px_rgba(251,138,116,0.08)] transition hover:border-[var(--accent)]/30 hover:bg-[linear-gradient(135deg,rgba(251,138,116,0.26),rgba(251,138,116,0.14))]",
              pendingAction?.type === "upload" && "cursor-wait opacity-70",
            )}
          >
            <Plus className="h-4 w-4 text-[var(--accent)]" />
            {pendingAction?.type === "upload" ? "Uploading..." : "Upload files"}
          </label>
          <input
            id={uploadInputId}
            type="file"
            multiple
            className="hidden"
            accept={PROJECT_FILE_ACCEPT_ATTRIBUTE}
            onChange={(event) => {
              void handleUploadSelection(event.target.files);
              event.currentTarget.value = "";
            }}
          />
        </div>
      </div>

      {(errorMessage || localError) && (
        <div className="mb-4 rounded-[var(--radius-lg)] border border-[var(--red)]/15 bg-[var(--red)]/10 px-4 py-3 text-[0.82rem] text-[var(--red)]">
          {localError || errorMessage}
        </div>
      )}

      <div className="table-surface overflow-hidden rounded-[var(--radius-xl)] border border-white/6">
        <div className="table-header-surface grid grid-cols-[minmax(0,2fr)_minmax(140px,0.8fr)_1fr_1fr_100px_64px] border-b border-white/6 px-5 py-3 text-[0.78rem] font-medium text-[var(--text-muted)]">
          <span>File Name</span>
          <span>Document Slot</span>
          <span>Date Upload</span>
          <span>Last Update</span>
          <span>File Size</span>
          <span className="text-right" />
        </div>

        <div className="divide-y divide-white/6">
          {loading ? (
            <div className="px-5 py-10 text-center text-[0.9rem] text-[var(--text-muted)]">Loading project files...</div>
          ) : filteredFiles.length > 0 ? filteredFiles.map((file) => {
            const linkedDocument = file.documentId ? documentLookup.get(file.documentId) : null;

            return (
            <div key={file.id} className="grid grid-cols-[minmax(0,2fr)_minmax(140px,0.8fr)_1fr_1fr_100px_64px] items-center px-5 py-3 transition hover:bg-white/[0.025]">
              <div className="flex min-w-0 items-center gap-3">
                <FileIcon name={file.name} />
                {renamingId === file.id ? (
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(event) => setRenameValue(event.target.value)}
                    onBlur={() => {
                      void commitRename(file.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        void commitRename(file.id);
                      }
                      if (event.key === "Escape") setRenamingId(null);
                    }}
                    className="flex-1 min-w-0 rounded-[var(--radius-md)] border border-[var(--accent)] bg-white/5 px-2 py-1 text-[0.88rem] text-[var(--text-primary)] outline-none"
                  />
                ) : (
                  <div className="min-w-0">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block truncate text-[0.88rem] font-medium text-[var(--text-primary)] transition hover:text-[var(--accent)]"
                    >
                      {file.name}
                    </a>
                    <p className="truncate text-[0.75rem] text-[var(--text-muted)]">{file.mimeType}</p>
                  </div>
                )}
              </div>
              <div>
                {linkedDocument ? (
                  <>
                    <p className="text-[0.8rem] font-medium text-[var(--text-primary)]">{linkedDocument.title}</p>
                    <p className="text-[0.72rem] text-[var(--text-muted)]">Overview document</p>
                  </>
                ) : (
                  <span className="inline-flex rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[0.72rem] text-[var(--text-muted)]">
                    General upload
                  </span>
                )}
              </div>
              <span className="text-[0.82rem] text-[var(--text-secondary)]">{formatProjectFileDate(file.createdAt)}</span>
              <span className="text-[0.82rem] text-[var(--text-secondary)]">{formatProjectFileDate(file.updatedAt)}</span>
              <span className="text-[0.82rem] text-[var(--text-secondary)]">{formatProjectFileSize(file.sizeBytes)}</span>

              <div className="relative flex items-center justify-end">
                <button
                  type="button"
                  onClick={(event) => toggleFileMenu(file.id, event.currentTarget)}
                  disabled={Boolean(pendingAction)}
                  className="inline-flex h-9 w-10 items-center justify-center rounded-[var(--radius-md)] border border-white/10 bg-white/[0.03] text-[var(--text-secondary)] transition hover:border-white/15 hover:bg-white/[0.06] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {openMenuId === file.id && menuPosition && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => {
                        setOpenMenuId(null);
                        setMenuPosition(null);
                      }}
                    />
                    <div
                      className="fixed z-40 w-[180px] overflow-hidden rounded-[var(--radius-lg)] border border-white/8 bg-[#18191d] shadow-xl"
                      style={{
                        top: menuPosition.top,
                        left: menuPosition.left,
                        transform: menuPosition.openUpward ? "translate(-100%, -100%)" : "translateX(-100%)",
                      }}
                    >
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => {
                          setOpenMenuId(null);
                          setMenuPosition(null);
                        }}
                        className="flex items-center gap-3 px-4 py-3 text-left text-[0.84rem] text-[var(--text-secondary)] transition hover:bg-white/5 hover:text-[var(--text-primary)]"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open File
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuId(null);
                          setMenuPosition(null);
                          startRename(file);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-[0.84rem] text-[var(--text-secondary)] transition hover:bg-white/5 hover:text-[var(--text-primary)]"
                      >
                        <Pen className="h-3.5 w-3.5" />
                        Rename File
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuId(null);
                          setMenuPosition(null);
                          void handleDuplicate(file);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-[0.84rem] text-[var(--text-secondary)] transition hover:bg-white/5 hover:text-[var(--text-primary)]"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Duplicate File
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuId(null);
                          setMenuPosition(null);
                          setDeletingFile(file);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-[0.84rem] text-[var(--red)] transition hover:bg-white/5"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
          }) : (
            <div className="px-5 py-10 text-center">
              <p className="text-[0.95rem] font-semibold text-[var(--text-primary)]">
                {searchQuery.trim() ? "No matching files" : "No project files yet"}
              </p>
              <p className="mt-1 text-[0.82rem] text-[var(--text-muted)]">
                {searchQuery.trim()
                  ? "Try a different search term or clear the filter."
                  : "Upload deliverables here or attach them through the overview document slots."}
              </p>
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmationModal
        open={Boolean(deletingFile)}
        title="Delete file?"
        description={
          deletingFile
            ? `Delete "${deletingFile.name}" from project files?`
            : ""
        }
        confirmLabel="Delete file"
        onConfirm={() => {
          if (deletingFile) {
            void confirmDelete(deletingFile);
          }
        }}
        onClose={() => setDeletingFile(null)}
      />
    </div>
  );
}

function integrationFallbackStyle(name: string) {
  const palette = [
    { bg: "#161b22", text: "#ffffff" },
    { bg: "#2a4365", text: "#d6ebff" },
    { bg: "#4a154b", text: "#ffe6f7" },
    { bg: "#184e3b", text: "#ddffe4" },
    { bg: "#4c1d95", text: "#f0e6ff" },
    { bg: "#7c2d12", text: "#fff0e8" },
  ];
  const seed = name
    .split("")
    .reduce((total, char) => total + char.charCodeAt(0), 0);

  return palette[seed % palette.length] ?? palette[0];
}

function IntegrationLogo({
  name,
  url,
  className,
}: {
  name: string;
  url: string;
  className?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const logoUrl = imageFailed ? null : getIntegrationLogoUrl(url);
  const fallback = integrationFallbackStyle(name);
  const label = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2) || "AP";

  return (
    <div
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-md)] border border-white/8",
        className,
      )}
      style={{ backgroundColor: fallback.bg, color: fallback.text }}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={`${name} logo`}
          loading="lazy"
          onError={() => setImageFailed(true)}
          className="h-full w-full bg-white object-contain p-2"
        />
      ) : (
        <span className="text-[0.7rem] font-bold">{label}</span>
      )}
    </div>
  );
}

type IntegrationDraft = {
  name: string;
  url: string;
  description: string;
  category: Integration["category"];
};

function createEmptyIntegrationDraft(): IntegrationDraft {
  return {
    name: "",
    url: "",
    description: "",
    category: "Management",
  };
}

function AppBrandLogo({ className }: { className?: string }) {
  const branding = useBranding();

  return (
    <div className={cn("flex h-14 w-14 items-center justify-center", className)}>
      <img
        src={branding.logoUrl}
        alt={branding.appName}
        className="h-14 w-14 object-contain"
      />
    </div>
  );
}

const CONNECT_PERMISSIONS = [
  { Icon: UserRound, title: "Workspace identity", desc: "Use the project owner and team context to associate the connection." },
  { Icon: CalendarDays, title: "Timeline sync", desc: "Keep milestones, schedules, and project dates aligned across tools." },
  { Icon: Zap, title: "Delivery actions", desc: "Enable lightweight status syncing and connected workspace actions." },
];

function ConnectModal({
  name,
  url,
  description,
  onConnect,
  onCancel,
}: {
  name: string;
  url: string;
  description: string;
  onConnect: () => void;
  onCancel: () => void;
}) {
  const branding = useBranding();
  const normalizedUrl = normalizeIntegrationUrl(url);

  return (
    <div className="modal-overlay-shell">
      <div className="modal-overlay-backdrop" onClick={onCancel} />
      <div className="modal-surface modal-surface-scroll max-w-[520px] border border-white/8 bg-[#18191d] p-5 sm:p-8">
        <ModalCloseButton absolute onClick={onCancel} aria-label={`Close ${name} connect modal`} />
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <IntegrationLogo name={name} url={url} className="h-14 w-14 rounded-[var(--radius-lg)]" />
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--accent)]/60" />
            <span className="h-2 w-2 rounded-full bg-[var(--accent)]/30" />
          </div>
          <AppBrandLogo />
        </div>

        <h2 className="mb-1 text-center text-[1.1rem] font-medium text-[var(--text-primary)]">
          Connecting <span className="font-bold">{name}</span> to <span className="font-bold">{branding.appName}</span>
        </h2>
        <p className="mb-6 text-center text-[0.84rem] text-[var(--text-secondary)]">
          Enable this integration to keep project delivery data and external app activity in sync.
        </p>

        <div className="mb-6 rounded-[var(--radius-xl)] border border-white/6 bg-white/[0.03] p-4">
          <p className="text-[0.84rem] font-semibold text-[var(--text-primary)]">{getIntegrationDisplayUrl(url)}</p>
          <p className="mt-1 text-[0.76rem] leading-[1.5] text-[var(--text-secondary)]">{description}</p>
          {normalizedUrl && (
            <a
              href={normalizedUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-[0.75rem] font-medium text-[var(--accent)] transition hover:text-[var(--accent-strong)]"
            >
              Visit website
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

        <div className="mb-8 space-y-3 rounded-[var(--radius-xl)] border border-white/6 bg-white/[0.03] p-4 sm:p-5">
          {CONNECT_PERMISSIONS.map(({ Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-white/8">
                <Icon className="h-4 w-4 text-[var(--text-secondary)]" />
              </div>
              <div>
                <p className="text-[0.88rem] font-semibold text-[var(--text-primary)]">{title}</p>
                <p className="text-[0.78rem] text-[var(--text-secondary)]">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:gap-4">
          <button type="button" onClick={onConnect} className="btn-base btn-primary flex-1 rounded-[var(--radius-xl)] py-3.5 text-[0.95rem] font-semibold">
            Connect App
          </button>
          <button type="button" onClick={onCancel} className="btn-base btn-secondary flex-1 rounded-[var(--radius-xl)] py-3.5 text-[0.95rem] text-[var(--text-primary)]">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function AddIntegrationModal({
  draft,
  error,
  pending,
  onChange,
  onSubmit,
  onCancel,
}: {
  draft: IntegrationDraft;
  error: string;
  pending: boolean;
  onChange: (patch: Partial<IntegrationDraft>) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="modal-overlay-shell">
      <div className="modal-overlay-backdrop" onClick={onCancel} />
      <div className="modal-surface modal-surface-scroll max-w-[560px] border border-white/8 bg-[#18191d] p-5 sm:p-8">
        <ModalCloseButton absolute onClick={onCancel} aria-label="Close add integration modal" />
        <div className="mb-6">
          <h2 className="text-[1.05rem] font-semibold text-[var(--text-primary)]">Add Integration</h2>
          <p className="mt-1 text-[0.82rem] text-[var(--text-secondary)]">
            Enter the app website and Planix will resolve the logo from the domain automatically.
          </p>
        </div>

        <div className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-[0.78rem] font-medium text-[var(--text-secondary)]">App Name</span>
            <input
              type="text"
              value={draft.name}
              onChange={(event) => onChange({ name: event.target.value })}
              placeholder="Notion, Linear, Figma..."
              className="h-11 rounded-[var(--radius-md)] border border-white/8 bg-white/[0.04] px-4 text-[0.9rem] text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]/50"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-[0.78rem] font-medium text-[var(--text-secondary)]">Website URL</span>
            <input
              type="url"
              value={draft.url}
              onChange={(event) => onChange({ url: event.target.value })}
              placeholder="https://www.example.com"
              className="h-11 rounded-[var(--radius-md)] border border-white/8 bg-white/[0.04] px-4 text-[0.9rem] text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]/50"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-[0.78rem] font-medium text-[var(--text-secondary)]">Category</span>
            <select
              value={draft.category}
              onChange={(event) => onChange({ category: event.target.value as Integration["category"] })}
              className="h-11 rounded-[var(--radius-md)] border border-white/8 bg-white/[0.04] px-4 text-[0.9rem] text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]/50"
            >
              {INTEGRATION_CATEGORIES.map((category) => (
                <option key={category} value={category} className="bg-[#18191d]">
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-[0.78rem] font-medium text-[var(--text-secondary)]">Description</span>
            <textarea
              value={draft.description}
              onChange={(event) => onChange({ description: event.target.value })}
              rows={4}
              placeholder="Describe what this integration brings into the project workspace."
              className="rounded-[var(--radius-md)] border border-white/8 bg-white/[0.04] px-4 py-3 text-[0.9rem] text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]/50"
            />
          </label>

          {error && (
            <div className="rounded-[var(--radius-md)] border border-[var(--red)]/20 bg-[var(--red)]/8 px-4 py-3 text-[0.8rem] text-[var(--red)]">
              {error}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onSubmit}
            disabled={pending}
            className="btn-base btn-primary flex-1 rounded-[var(--radius-xl)] py-3 text-[0.92rem] font-semibold disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pending ? "Adding..." : "Add Integration"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="btn-base btn-secondary flex-1 rounded-[var(--radius-xl)] py-3 text-[0.92rem] text-[var(--text-primary)]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export function IntegrationsView({
  projectName,
  items,
  onToggleIntegration,
  onAddIntegration,
  onRemoveIntegration,
  onExportProjectData,
  onImportProjectData,
}: {
  projectName: string;
  items: Integration[];
  onToggleIntegration: (integrationId: string, enabled: boolean) => Promise<void>;
  onAddIntegration: (integration: Integration) => Promise<void>;
  onRemoveIntegration: (integrationId: string) => Promise<void>;
  onExportProjectData: (format: TaskCsvFormat) => Promise<string | void>;
  onImportProjectData: (file: File) => Promise<string | void>;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [pendingIntegrationId, setPendingIntegrationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [draft, setDraft] = useState<IntegrationDraft>(createEmptyIntegrationDraft);
  const [draftError, setDraftError] = useState("");
  const [draftPending, setDraftPending] = useState(false);
  const [exchangePending, setExchangePending] = useState<string | null>(null);
  const [exchangeMessage, setExchangeMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return items;
    }

    return items.filter((item) =>
      item.name.toLowerCase().includes(normalizedQuery)
      || item.description.toLowerCase().includes(normalizedQuery)
      || getIntegrationDisplayUrl(item.url).toLowerCase().includes(normalizedQuery),
    );
  }, [items, searchQuery]);

  function handleToggle(id: string) {
    const item = items.find((entry) => entry.id === id);
    if (!item) return;
    if (item.enabled) {
      setPendingIntegrationId(id);
      void onToggleIntegration(id, false).finally(() => setPendingIntegrationId((current) => (current === id ? null : current)));
    } else {
      setConnectingId(id);
    }
  }

  function handleConnect() {
    if (!connectingId) return;
    const nextId = connectingId;
    setPendingIntegrationId(nextId);
    setConnectingId(null);
    void onToggleIntegration(nextId, true).finally(() => {
      setPendingIntegrationId((current) => (current === nextId ? null : current));
    });
  }

  async function handleAdd() {
    const normalized = normalizeIntegrationInput(draft);

    if (!normalized.name || !normalized.url || !normalized.description) {
      setDraftError("Name, valid website URL, and description are required.");
      return;
    }

    if (!isValidIntegrationUrl(draft.url)) {
      setDraftError("Enter a valid website URL so the logo can be resolved from the domain.");
      return;
    }

    const hasDuplicate = items.some((item) => {
      const normalizedItemUrl = normalizeIntegrationUrl(item.url);

      return (
        item.name.trim().toLowerCase() === normalized.name.toLowerCase()
        || (normalizedItemUrl && normalizedItemUrl === normalized.url)
      );
    });

    if (hasDuplicate) {
      setDraftError("This integration is already available for the current project.");
      return;
    }

    try {
      setDraftPending(true);
      setDraftError("");
      await onAddIntegration({
        id: createIntegrationId(normalized.name),
        ...normalized,
        enabled: false,
        custom: true,
      });
      setShowAddModal(false);
      setDraft(createEmptyIntegrationDraft());
    } catch (error) {
      setDraftError(error instanceof Error ? error.message : "Failed to add integration.");
    } finally {
      setDraftPending(false);
    }
  }

  async function handleRemove(id: string) {
    setPendingIntegrationId(id);

    try {
      await onRemoveIntegration(id);
    } finally {
      setPendingIntegrationId((current) => (current === id ? null : current));
    }
  }

  async function handleExport(format: TaskCsvFormat) {
    setExchangePending(`export:${format}`);
    setExchangeMessage(null);

    try {
      const responseMessage = await onExportProjectData(format);
      const formatMeta = TASK_CSV_FORMATS.find((item) => item.id === format);
      setExchangeMessage({
        tone: "success",
        text: responseMessage || `${formatMeta?.label ?? "CSV"} exported for ${projectName}.`,
      });
    } catch (error) {
      setExchangeMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Failed to export project data.",
      });
    } finally {
      setExchangePending(null);
    }
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setExchangePending("import");
    setExchangeMessage(null);

    try {
      const responseMessage = await onImportProjectData(file);
      setExchangeMessage({
        tone: "success",
        text: responseMessage || `${file.name} imported into ${projectName}.`,
      });
    } catch (error) {
      setExchangeMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "Failed to import CSV file.",
      });
    } finally {
      setExchangePending(null);
    }
  }

  const connectingItem = items.find((item) => item.id === connectingId) ?? null;

  return (
    <div className="px-6 py-5">
      <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-center">
        <h2 className="shrink-0 text-[1.05rem] font-semibold text-[var(--text-primary)]">All Integrations</h2>
        <label className="relative block w-full xl:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search integrations or domains"
            className="h-10 w-full rounded-[var(--radius-md)] border border-white/8 bg-white/[0.03] pl-9 pr-3 text-[0.84rem] text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-white/14"
          />
        </label>
        <button
          type="button"
          onClick={() => {
            setDraftError("");
            setDraft(createEmptyIntegrationDraft());
            setShowAddModal(true);
          }}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--accent)]/20 bg-[linear-gradient(135deg,rgba(251,138,116,0.2),rgba(251,138,116,0.1))] px-4 text-[0.82rem] font-semibold text-[var(--text-primary)] shadow-[0_10px_24px_rgba(251,138,116,0.08)] transition hover:border-[var(--accent)]/30 hover:bg-[linear-gradient(135deg,rgba(251,138,116,0.26),rgba(251,138,116,0.14))]"
        >
          <Plus className="h-4 w-4 text-[var(--accent)]" />
          Add Integration
        </button>
      </div>

      <div className="mb-6 rounded-[var(--radius-xl)] border border-white/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-[640px]">
            <p className="text-[0.72rem] uppercase tracking-[0.12em] text-[var(--text-muted)]">Data Exchange</p>
            <h3 className="mt-1 text-[0.98rem] font-semibold text-[var(--text-primary)]">Import from Jira or Asana, export in portable CSV formats</h3>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            {TASK_CSV_FORMATS.map((format) => (
              <button
                key={format.id}
                type="button"
                onClick={() => void handleExport(format.id)}
                disabled={Boolean(exchangePending)}
                className="flex items-center gap-2 rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[0.78rem] font-medium text-[var(--text-primary)] transition hover:border-white/20 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-60"
                title={format.description}
              >
                <Download className="h-3.5 w-3.5 text-[var(--accent)]" />
                {exchangePending === `export:${format.id}` ? "Exporting..." : format.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={Boolean(exchangePending)}
              className="flex items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--accent)]/20 bg-[linear-gradient(135deg,rgba(251,138,116,0.18),rgba(251,138,116,0.08))] px-3.5 py-2 text-[0.78rem] font-semibold text-[var(--text-primary)] transition hover:border-[var(--accent)]/35 hover:bg-[linear-gradient(135deg,rgba(251,138,116,0.24),rgba(251,138,116,0.12))] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Upload className="h-3.5 w-3.5 text-[var(--accent)]" />
              {exchangePending === "import" ? "Importing..." : "Import CSV"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => void handleImport(event)}
            />
          </div>
        </div>

        {exchangeMessage && (
          <div
            className={cn(
              "mt-4 rounded-[var(--radius-lg)] border px-4 py-3 text-[0.78rem]",
              exchangeMessage.tone === "success"
                ? "border-emerald-500/20 bg-emerald-500/8 text-emerald-200"
                : "border-[var(--red)]/20 bg-[var(--red)]/8 text-[var(--red)]",
            )}
          >
            {exchangeMessage.text}
          </div>
        )}
      </div>

      {filteredItems.length === 0 ? (
        <div className="rounded-[var(--radius-xl)] border border-dashed border-white/10 bg-[var(--panel)] px-6 py-12 text-center">
          <p className="text-[0.98rem] font-semibold text-[var(--text-primary)]">
            {searchQuery.trim() ? "No matching integrations" : "No integrations yet"}
          </p>
          <p className="mt-2 text-[0.82rem] text-[var(--text-secondary)]">
            {searchQuery.trim()
              ? "Try a different app name or website domain."
              : "Add a website URL and Planix will attach it to this project workspace."}
          </p>
        </div>
      ) : INTEGRATION_CATEGORIES.map((category) => {
        const group = filteredItems.filter((item) => item.category === category);
        const isCollapsed = collapsed[category];

        if (group.length === 0) {
          return null;
        }

        return (
          <div key={category} className="mb-6">
            <button
              type="button"
              onClick={() => setCollapsed((prev) => ({ ...prev, [category]: !prev[category] }))}
              className="mb-4 flex w-full items-center justify-between text-[0.95rem] font-semibold text-[var(--text-primary)]"
            >
              {category}
              <ChevronDown className={cn("h-4 w-4 text-[var(--text-muted)] transition-transform", isCollapsed && "-rotate-180")} />
            </button>

            {!isCollapsed && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {group.map((item) => (
                  <div key={item.id} className="flex flex-col gap-3 rounded-[var(--radius-xl)] border border-white/6 bg-[var(--panel)] p-4 transition hover:bg-white/[0.04]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-3">
                        <IntegrationLogo name={item.name} url={item.url} />
                        <div className="min-w-0">
                          <p className="truncate text-[0.92rem] font-semibold text-[var(--text-primary)]">{item.name}</p>
                          <a
                            href={normalizeIntegrationUrl(item.url) || "#"}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(event) => {
                              if (!normalizeIntegrationUrl(item.url)) {
                                event.preventDefault();
                              }
                            }}
                            className="flex items-center gap-1 text-[0.76rem] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                          >
                            {getIntegrationDisplayUrl(item.url)}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.custom && (
                          <button
                            type="button"
                            onClick={() => void handleRemove(item.id)}
                            disabled={pendingIntegrationId === item.id}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/8 text-[var(--text-muted)] transition hover:border-[var(--red)]/30 hover:text-[var(--red)] disabled:cursor-not-allowed disabled:opacity-60"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleToggle(item.id)}
                          disabled={pendingIntegrationId === item.id}
                          className={cn(
                            "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-70",
                            item.enabled ? "bg-[var(--accent)]" : "bg-white/15",
                          )}
                        >
                          <span
                            className={cn(
                              "absolute h-4 w-4 rounded-full bg-white shadow transition-transform",
                              item.enabled ? "translate-x-[22px]" : "translate-x-[4px]",
                            )}
                          />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn(
                        "rounded-full px-2.5 py-1 text-[0.68rem] font-medium",
                        item.enabled
                          ? "bg-[var(--accent)]/12 text-[var(--accent)]"
                          : "bg-white/6 text-[var(--text-muted)]",
                      )}>
                        {item.enabled ? "Connected" : "Available"}
                      </span>
                      {item.custom && (
                        <span className="rounded-full bg-white/6 px-2.5 py-1 text-[0.68rem] font-medium text-[var(--text-muted)]">
                          Custom
                        </span>
                      )}
                    </div>
                    <p className="text-[0.78rem] leading-[1.45] text-[var(--text-secondary)]">{item.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {connectingItem && (
        <ConnectModal
          name={connectingItem.name}
          url={connectingItem.url}
          description={connectingItem.description}
          onConnect={handleConnect}
          onCancel={() => setConnectingId(null)}
        />
      )}

      {showAddModal && (
        <AddIntegrationModal
          draft={draft}
          error={draftError}
          pending={draftPending}
          onChange={(patch) => {
            setDraft((current) => ({ ...current, ...patch }));
            if (draftError) {
              setDraftError("");
            }
          }}
          onSubmit={() => void handleAdd()}
          onCancel={() => {
            setShowAddModal(false);
            setDraftError("");
            setDraft(createEmptyIntegrationDraft());
          }}
        />
      )}
    </div>
  );
}

export function NotificationsView({
  notifications,
  loading = false,
  onToggleRead,
  onDelete,
  onMarkAllRead,
  onDeleteRead,
  onOpenNotification,
}: {
  notifications: ProjectNotification[];
  loading?: boolean;
  onToggleRead: (notificationId: string) => void;
  onDelete: (notificationId: string) => void;
  onMarkAllRead: () => void;
  onDeleteRead: () => void;
  onOpenNotification: (notification: ProjectNotification) => void;
}) {
  const [deletingNotification, setDeletingNotification] = useState<ProjectNotification | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const unreadCount = notifications.filter((notification) => notification.unread).length;
  const readCount = Math.max(notifications.length - unreadCount, 0);
  const visibleNotifications = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return notifications.filter((notification) => {
      if (filter === "unread" && !notification.unread) {
        return false;
      }

      if (filter === "read" && notification.unread) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return (
        notification.title.toLowerCase().includes(normalizedQuery)
        || notification.body.toLowerCase().includes(normalizedQuery)
        || notification.kind.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [filter, notifications, query]);

  const earlier = visibleNotifications.filter((item) => item.group === "earlier");
  const past = visibleNotifications.filter((item) => item.group === "2023");

  function renderGroup(group: ProjectNotification[], label: string) {
    if (group.length === 0) {
      return null;
    }

    return (
      <div className="mb-6">
        <p className="mb-3 text-[0.82rem] text-[var(--text-muted)]">{label}</p>
        <div className="divide-y divide-white/6 overflow-hidden rounded-[var(--radius-xl)] border border-white/6">
          {group.map((notif) => {
            const Icon = notificationIcon(notif.kind);
            return (
              <div key={notif.id} className="relative flex items-start gap-4 bg-[var(--panel)] px-5 py-4 transition hover:bg-white/[0.025]">
                {notif.kind === "task" && notif.initials ? (
                  <Avatar initials={notif.initials} tone={notif.avatarTone ?? "sand"} size="sm" />
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-white/6">
                    <Icon className="h-4 w-4 text-[var(--text-secondary)]" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[0.88rem] font-semibold text-[var(--text-primary)]">{notif.title}</span>
                    <span className="text-[0.76rem] text-[var(--text-muted)]">{notif.time}</span>
                    {notif.unread && <span className="h-2 w-2 rounded-full bg-[var(--red)]" />}
                  </div>
                  <p className="mt-0.5 text-[0.78rem] leading-[1.45] text-[var(--text-secondary)]">{notif.body}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onOpenNotification(notif)}
                      className="text-[0.72rem] font-medium text-[var(--accent)] transition hover:text-[var(--accent-strong)]"
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleRead(notif.id)}
                      className="text-[0.72rem] font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                    >
                      {notif.unread ? "Mark as read" : "Mark as unread"}
                    </button>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5 self-start lg:self-center">
                  <button
                    type="button"
                    onClick={() => onToggleRead(notif.id)}
                    className="inline-flex items-center gap-1.5 rounded-[10px] border border-white/8 bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-medium text-[var(--text-secondary)] transition hover:bg-white/[0.06] hover:text-[var(--text-primary)]"
                  >
                    <Bell className="hidden h-3.5 w-3.5 lg:block" />
                    {notif.unread ? "Read" : "Unread"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingNotification(notif)}
                    className="inline-flex items-center gap-1.5 rounded-[10px] border border-[var(--red)]/16 bg-[var(--red)]/8 px-2.5 py-1.5 text-[11px] font-medium text-[var(--red)] transition hover:bg-[var(--red)]/14"
                  >
                    <Trash2 className="hidden h-3.5 w-3.5 lg:block" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-5">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex h-10 flex-1 items-center gap-3 rounded-[var(--radius-md)] border border-white/8 bg-white/[0.03] px-4">
          <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search notifications"
            className="flex-1 border-none bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(["all", "unread", "read"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[0.72rem] font-medium transition",
                filter === value
                  ? "border-[var(--accent)]/30 bg-[var(--accent)]/12 text-[var(--accent)]"
                  : "border-white/8 bg-white/[0.03] text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
              )}
            >
              {value === "all" ? "All" : value === "unread" ? "Unread" : "Read"}
            </button>
          ))}
          <button
            type="button"
            onClick={onMarkAllRead}
            disabled={unreadCount === 0}
            className="btn-base btn-secondary rounded-[var(--radius-md)] px-3 py-2 text-[0.78rem] font-medium text-[var(--text-primary)]"
          >
            Mark all read
          </button>
          <button
            type="button"
            onClick={onDeleteRead}
            disabled={readCount === 0}
            className="btn-base btn-secondary rounded-[var(--radius-md)] px-3 py-2 text-[0.78rem] font-medium text-[var(--text-primary)]"
          >
            Clear read
          </button>
        </div>
      </div>

      {loading && (
        <div className="rounded-[var(--radius-xl)] border border-white/8 px-5 py-8 text-center text-sm text-[var(--text-muted)]">
          Loading latest project notifications...
        </div>
      )}

      {!loading && renderGroup(earlier, "Earlier this month")}
      {!loading && renderGroup(past, "2023")}
      {!loading && notifications.length === 0 && (
        <div className="rounded-[var(--radius-xl)] border border-dashed border-white/8 px-5 py-8 text-center text-sm text-[var(--text-muted)]">
          No notifications for this project yet.
        </div>
      )}
      {!loading && notifications.length > 0 && visibleNotifications.length === 0 && (
        <div className="rounded-[var(--radius-xl)] border border-dashed border-white/8 px-5 py-8 text-center text-sm text-[var(--text-muted)]">
          No notifications match this search or filter.
        </div>
      )}

      <DeleteConfirmationModal
        open={Boolean(deletingNotification)}
        title="Delete notification?"
        description={
          deletingNotification
            ? `Delete "${deletingNotification.title}" from project notifications?`
            : ""
        }
        confirmLabel="Delete notification"
        onConfirm={() => {
          if (deletingNotification) {
            onDelete(deletingNotification.id);
            setDeletingNotification(null);
          }
        }}
        onClose={() => setDeletingNotification(null)}
      />
    </div>
  );
}

export function ProjectActivityPanel() {
  const [activity] = useWorkspaceActivityFeed();

  return (
    <aside className="flex w-[285px] shrink-0 flex-col overflow-hidden border-l border-white/6">
      <div className="shrink-0 px-5 pb-4 pt-5">
        <h2 className="text-base font-semibold text-[var(--text-primary)]">Recent Activity</h2>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="divide-y divide-white/6">
          {activity.map((item: ActivityItem) => (
            <div key={item.id} className="flex gap-3 rounded-[var(--radius-lg)] px-2 py-3 transition hover:bg-white/[0.03]">
              <div className="shrink-0">
                <Avatar initials={item.initials} tone={item.tone} status={item.status} size="sm" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[0.82rem] font-semibold text-[var(--text-primary)]">{item.name}</span>
                    <span className="ml-2 text-[0.75rem] text-[var(--text-muted)]">{item.time}</span>
                  </div>
                  {item.id <= 2 && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--red)]" />}
                </div>
                <p className="mt-0.5 text-[0.78rem] leading-snug text-[var(--text-muted)]">{item.action}</p>
                {item.detail && (
                  <p className="mt-1.5 text-[0.75rem] leading-snug text-[var(--text-muted)] opacity-75">{item.detail}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

const SETTINGS_ITEMS = [
  { key: "rename", label: "Rename", Icon: Pen, destructive: false, chevron: true, toggle: false },
  { key: "copy", label: "Copy Link", Icon: Link2, destructive: false, chevron: true, toggle: false },
  { key: "hide", label: "Hide Space", Icon: Ban, destructive: false, chevron: false, toggle: true },
  { key: "duplicate", label: "Duplicate Space", Icon: Copy, destructive: false, chevron: true, toggle: false },
  { key: "archive", label: "Archive Space", Icon: Archive, destructive: false, chevron: true, toggle: false },
  { key: "delete", label: "Delete Project", Icon: Trash2, destructive: true, chevron: true, toggle: false },
] as const;

export function SettingsDropdown({
  open,
  onClose,
  hideSpace,
  archivedSpace,
  onRename,
  onCopyLink,
  onToggleHideSpace,
  onDuplicate,
  onArchive,
  onRestore,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  hideSpace: boolean;
  archivedSpace: boolean;
  onRename: () => void;
  onCopyLink: () => void;
  onToggleHideSpace: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onDelete: () => void;
}) {

  if (!open) return null;

  return (
    <div className="absolute right-0 top-full z-40 mt-2 w-[280px] animate-[panel-pop-in_220ms_cubic-bezier(0.16,1,0.3,1)] overflow-hidden rounded-[var(--radius-xl)] border border-white/8 bg-[#18191d] shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
        <h3 className="text-base font-semibold text-[var(--text-primary)]">Settings</h3>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="p-2">
        {SETTINGS_ITEMS.map(({ key, label, Icon, destructive, chevron, toggle }) => (
          (() => {
            const resolvedLabel = key === "hide" && hideSpace ? "Show Space" : label;
            const finalLabel = key === "archive" && archivedSpace ? "Restore Space" : resolvedLabel;

            return (
          <button
            key={key}
            type="button"
            onClick={() => {
              if (key === "rename") onRename();
              if (key === "copy") onCopyLink();
              if (key === "hide") onToggleHideSpace();
              if (key === "duplicate") onDuplicate();
              if (key === "archive") {
                if (archivedSpace) onRestore();
                else onArchive();
              }
              if (key === "delete") onDelete();
            }}
            className={cn(
              "flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-3 text-left text-sm transition hover:bg-white/5",
              destructive ? "text-[var(--red)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{finalLabel}</span>
            {toggle && (
              <span
                className={cn(
                  "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
                  hideSpace ? "bg-[var(--accent)]" : "bg-white/15",
                )}
              >
                <span
                  className={cn(
                    "absolute h-3.5 w-3.5 rounded-full bg-white shadow transition-transform",
                    hideSpace ? "translate-x-[18px]" : "translate-x-[3px]",
                  )}
                />
              </span>
            )}
            {chevron && <ChevronRight className={cn("h-4 w-4 shrink-0", destructive ? "text-[var(--red)]" : "text-[var(--text-muted)]")} />}
          </button>
            );
          })()
        ))}
      </div>
    </div>
  );
}

export function NotificationsDropdown({
  open,
  onClose,
  notifications,
  loading = false,
  onToggleRead,
  onDelete,
  onMarkAllRead,
  onOpenAll,
}: {
  open: boolean;
  onClose: () => void;
  notifications: ProjectNotification[];
  loading?: boolean;
  onToggleRead: (notificationId: string) => void;
  onDelete: (notificationId: string) => void;
  onMarkAllRead: () => void;
  onOpenAll: () => void;
}) {
  if (!open) return null;
  const unreadCount = notifications.filter((notification) => notification.unread).length;
  return (
    <div className="absolute right-0 top-full z-40 mt-2 flex max-h-[min(78vh,680px)] w-[400px] animate-[panel-pop-in_220ms_cubic-bezier(0.16,1,0.3,1)] flex-col overflow-hidden rounded-[var(--radius-xl)] border border-white/8 bg-[#18191d] shadow-2xl">
      <div className="flex shrink-0 items-center justify-between border-b border-white/6 px-5 py-4">
        <div>
          <h3 className="text-base font-semibold text-[var(--text-primary)]">Notifications</h3>
          <p className="mt-1 text-[0.72rem] text-[var(--text-muted)]">
            {unreadCount > 0 ? `${unreadCount} unread updates` : "All caught up"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onMarkAllRead}
            className="text-[0.72rem] font-medium text-[var(--accent)] transition hover:text-[var(--accent-strong)]"
          >
            Mark all read
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-white/5">
        {loading ? (
          <div className="px-5 py-8 text-center text-sm text-[var(--text-muted)]">
            Loading latest notifications...
          </div>
        ) : notifications.length > 0 ? notifications.map((notif) => {
          const Icon = notificationIcon(notif.kind);
          return (
            <div key={notif.id} className="flex gap-4 px-5 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-white/6">
                <Icon className="h-4 w-4 text-[var(--text-secondary)]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{notif.title}</span>
                  <span className="shrink-0 text-xs text-[var(--text-muted)]">{notif.time}</span>
                  {notif.unread && <span className="h-2 w-2 rounded-full bg-[var(--red)]" />}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">{notif.body}</p>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onToggleRead(notif.id)}
                    className="text-[0.72rem] font-medium text-[var(--accent)] transition hover:text-[var(--accent-strong)]"
                  >
                    {notif.unread ? "Mark as read" : "Mark as unread"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(notif.id)}
                    className="text-[0.72rem] font-medium text-[var(--red)] transition hover:text-[var(--red)]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="px-5 py-8 text-center text-sm text-[var(--text-muted)]">
            No notifications for this project.
          </div>
        )}
        </div>
      </div>
      <div className="shrink-0 border-t border-white/6 px-5 py-4">
        <button type="button" onClick={onOpenAll} className="text-sm text-[var(--accent)] transition hover:text-[var(--accent-strong)]">
          Open notifications panel
        </button>
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent as ReactClipboardEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  Archive,
  Ban,
  Building2,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Clock3,
  Download,
  FolderKanban,
  ImageIcon,
  LoaderCircle,
  Mail,
  MessageSquareMore,
  Paperclip,
  Pencil,
  Plus,
  Search,
  Send,
  Smile,
  Star,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { CompanyLogo } from "@/components/clients/company-logo";
import { Avatar, AvatarCluster } from "@/components/dashboard/avatar";
import type { ClientRecord } from "@/data/clients";
import {
  type DiscussionReaction,
  type TeamMemberRecord,
  type WorkspaceProject,
} from "@/data/project-board";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { ModalCloseButton } from "@/components/ui/modal-close-button";
import { buildMessagesHref } from "@/lib/messages-navigation";
import type { WorkspaceTeamRecord } from "@/lib/people";
import { usePersistentState } from "@/lib/use-persistent-state";
import { cn } from "@/lib/utils";

import { toneSwatch } from "./shared";

export type ProjectTeamMember = TeamMemberRecord & {
  assignmentKey: string;
  team: string;
  messageContactId?: string;
  messageContactEmail?: string;
};

export type ProjectClientContact = {
  id: string;
  name: string;
  role: string;
  email: string;
  company: string;
  avatarInitials: string;
  avatarTone: TeamMemberRecord["avatarTone"];
  joinedOn: string;
  location?: string;
  department?: string;
  status?: string;
  website?: string;
};

const DEFAULT_DISCUSSION_REACTION = "👍";
const DISCUSSION_REACTION_LIBRARY = ["👍", "🔥", "🎉", "✅", "💡", "👀", "🚀"];
const DISCUSSION_CONTENT_EMOJIS = ["👍", "🔥", "🚀", "✅", "💡", "🎉", "🙏", "👀", "😂", "🤝", "📌", "❤️"];
const DISCUSSION_ATTACHMENT_LIMIT = 4;
const DISCUSSION_ATTACHMENT_MAX_SIZE = 50 * 1024 * 1024;
const DISCUSSION_FILE_ACCEPT = "image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip";
const DISCUSSION_PANEL_PATCH = "border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.045)_0%,rgba(255,255,255,0.02)_100%)]";
const EMPTY_DISCUSSION_BUCKET: ProjectDiscussionBucket = { threads: [], replies: [] };
const PROJECT_DIRECTORY_SECTIONS_STORAGE_KEY = "planix.projects.directory.sections";
const PROJECT_DIRECTORY_WRAPPER_STYLES: Record<ProjectDirectorySectionKey, string> = {
  visible: "rounded-[var(--radius-xl)] border border-[var(--accent)]/10 bg-[linear-gradient(180deg,rgba(251,138,116,0.06)_0%,rgba(251,138,116,0.01)_100%)] p-2",
  favourites: "rounded-[var(--radius-xl)] border border-[#f5c842]/10 bg-[linear-gradient(180deg,rgba(245,200,66,0.06)_0%,rgba(245,200,66,0.01)_100%)] p-2",
  completed: "rounded-[var(--radius-xl)] border border-[var(--green)]/10 bg-[linear-gradient(180deg,rgba(116,215,167,0.06)_0%,rgba(116,215,167,0.01)_100%)] p-2",
  hidden: "rounded-[var(--radius-xl)] border border-[#b8c4d1]/10 bg-[linear-gradient(180deg,rgba(184,196,209,0.06)_0%,rgba(184,196,209,0.01)_100%)] p-2",
  archived: "rounded-[var(--radius-xl)] border border-[#c59a6a]/10 bg-[linear-gradient(180deg,rgba(197,154,106,0.06)_0%,rgba(197,154,106,0.01)_100%)] p-2",
};
const PROJECT_DIRECTORY_SECTION_BUTTON_CLASS_NAME = "flex w-full items-center justify-between text-left text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] px-2 py-1.5";
const PROJECT_DIRECTORY_LABEL_CLASS_NAME = "truncate font-medium whitespace-nowrap";
const WORKSPACE_TABLE_ACTION_BUTTON_CLASS_NAME =
  "flex h-9 w-9 items-center justify-center rounded-[12px] border border-white/8 bg-white/[0.03] text-[var(--text-muted)] transition hover:bg-white/[0.06] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-40";
const WORKSPACE_TABLE_ACTION_BUTTON_DANGER_CLASS_NAME =
  "flex h-9 w-9 items-center justify-center rounded-[12px] border border-[var(--red)]/16 bg-[var(--red)]/10 text-[var(--red)] transition hover:bg-[var(--red)]/16 hover:text-[var(--red)] disabled:cursor-not-allowed disabled:opacity-40";

type ProjectDirectorySectionKey = "visible" | "favourites" | "completed" | "hidden" | "archived";
type ProjectDirectoryCollapsedSections = Record<ProjectDirectorySectionKey, boolean>;

const PROJECT_DIRECTORY_SECTION_COUNT_STYLES: Record<ProjectDirectorySectionKey, string> = {
  visible: "border-[var(--accent)]/20 bg-[var(--accent)]/12 text-[var(--accent-strong)]",
  favourites: "border-[#f5c842]/22 bg-[#f5c842]/12 text-[#f5c842]",
  completed: "border-[var(--green)]/22 bg-[var(--green)]/12 text-[var(--green)]",
  hidden: "border-[#8fa1b4]/20 bg-[#8fa1b4]/10 text-[#b8c4d1]",
  archived: "border-[#c59a6a]/20 bg-[#c59a6a]/10 text-[#d8b58c]",
};
const PROJECT_DIRECTORY_SECTION_ICON_STYLES: Record<ProjectDirectorySectionKey, string> = {
  visible: "text-[var(--accent)]",
  favourites: "text-[#f5c842]",
  completed: "text-[var(--green)]",
  hidden: "text-[#b8c4d1]",
  archived: "text-[#d8b58c]",
};

function buildProjectDirectoryCollapsedSections(
  counts: Record<ProjectDirectorySectionKey, number>,
): ProjectDirectoryCollapsedSections {
  return {
    visible: counts.visible === 0,
    favourites: counts.favourites === 0,
    completed: counts.completed === 0,
    hidden: counts.hidden === 0,
    archived: counts.archived === 0,
  };
}

function normalizeProjectDirectoryCollapsedSections(
  value: Partial<ProjectDirectoryCollapsedSections> | null | undefined,
  counts: Record<ProjectDirectorySectionKey, number>,
): ProjectDirectoryCollapsedSections {
  const defaults = buildProjectDirectoryCollapsedSections(counts);

  return {
    visible: value?.visible ?? defaults.visible,
    favourites: value?.favourites ?? defaults.favourites,
    completed: value?.completed ?? defaults.completed,
    hidden: value?.hidden ?? defaults.hidden,
    archived: value?.archived ?? defaults.archived,
  };
}

function ProjectDirectoryAnimatedList({
  isOpen,
  id,
  children,
}: {
  isOpen: boolean;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      className={cn(
        "grid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isOpen ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0 mt-0"
      )}
    >
      <div className="overflow-hidden space-y-1">
        {children}
      </div>
    </div>
  );
}

function ProjectDirectoryItemPatch({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-[1px] rounded-[calc(var(--radius-md)-1px)] bg-[linear-gradient(135deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.014)_46%,rgba(255,255,255,0)_100%)] opacity-80",
        className,
      )}
    />
  );
}

function ProjectSidebarAvatar({
  project,
  client,
}: {
  project: WorkspaceProject;
  client?: ClientRecord;
}) {
  if (client) {
    return (
      <CompanyLogo
        company={client.company}
        website={client.website}
        logoUrl={client.logoUrl}
        size="sm"
        className="h-9 w-9 rounded-[var(--radius-md)]"
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-[0.68rem] font-bold uppercase tracking-[0.08em]",
        toneSwatch(project.tone),
      )}
    >
      {project.initials}
    </div>
  );
}

function canOpenProjectMemberChat(
  member: Pick<ProjectTeamMember, "messageContactEmail" | "messageContactId" | "lastActive">,
) {
  return Boolean(member.messageContactId?.trim() || member.messageContactEmail?.trim())
    && member.lastActive !== "Invitation sent";
}

function findWorkspaceTeamByName(workspaceTeams: WorkspaceTeamRecord[], teamName?: string) {
  const normalizedTeamName = teamName?.trim().toLowerCase();

  if (!normalizedTeamName) {
    return undefined;
  }

  return workspaceTeams.find((team) => team.name.trim().toLowerCase() === normalizedTeamName);
}

type DiscussionAttachment = {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  dataUrl: string;
  kind: "image" | "file";
  file?: File;
};

type StoredDiscussionThread = {
  id: string;
  title: string;
  body: string;
  authorName: string;
  authorInitials: string;
  authorTone: TeamMemberRecord["avatarTone"];
  createdAt: string;
  starred: boolean;
  reactions: DiscussionReaction[];
  attachments: DiscussionAttachment[];
};

type StoredDiscussionReply = {
  id: string;
  threadId: string;
  content: string;
  authorName: string;
  authorInitials: string;
  authorTone: TeamMemberRecord["avatarTone"];
  createdAt: string;
  reactions: DiscussionReaction[];
  attachments: DiscussionAttachment[];
};

type ProjectDiscussionBucket = {
  threads: StoredDiscussionThread[];
  replies: StoredDiscussionReply[];
};

type DiscussionReplyMeta = {
  replyCount: number;
  lastReplyLabel: string;
  replyAvatars: { initials: string; tone: TeamMemberRecord["avatarTone"] }[];
};

type DiscussionsApiResponse = {
  ok?: boolean;
  error?: string;
  discussions?: ProjectDiscussionBucket;
  threadId?: string;
  replyId?: string;
};

type DiscussionComposerTarget = "thread" | "reply";

type DiscussionComposerProps = {
  mode: "thread" | "reply";
  author: {
    name: string;
    initials: string;
    tone: TeamMemberRecord["avatarTone"];
  };
  title?: string;
  body: string;
  attachments: DiscussionAttachment[];
  error?: string;
  submitLabel: string;
  submitDisabled: boolean;
  isAttaching?: boolean;
  isSubmitting?: boolean;
  onTitleChange?: (value: string) => void;
  onBodyChange: (value: string) => void;
  onSubmit: () => void;
  onInsertEmoji: (emoji: string) => void;
  onAttachFiles: (files: FileList | null) => void;
  onRemoveAttachment: (attachmentId: string) => void;
  onBodyKeyDown?: (event: ReactKeyboardEvent<HTMLTextAreaElement>) => void;
  onBodyPaste?: (event: ReactClipboardEvent<HTMLTextAreaElement>) => void;
};

function createDiscussionId(prefix: "thread" | "reply" | "attachment") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatDiscussionTimestamp(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatAttachmentSize(sizeBytes: number) {
  if (sizeBytes >= 1024 * 1024) {
    return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (sizeBytes >= 1024) {
    return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
  }

  return `${sizeBytes} B`;
}

function getDiscussionAttachmentBadge(name: string) {
  const extension = name.split(".").pop()?.trim().slice(0, 4).toUpperCase();

  return extension || "FILE";
}

function isImageAttachment(file: Pick<File, "name" | "type"> | DiscussionAttachment) {
  const mimeType = "mimeType" in file ? file.mimeType : file.type;

  return mimeType.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg)$/i.test(file.name);
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Unable to read the selected file."));
        return;
      }

      resolve(reader.result);
    };

    reader.onerror = () => reject(new Error("Unable to read the selected file."));
    reader.readAsDataURL(file);
  });
}

function appendEmojiToDraft(currentValue: string, emoji: string) {
  const trimmedValue = currentValue.trimEnd();

  if (!trimmedValue) {
    return emoji;
  }

  return /\s$/.test(currentValue) ? `${currentValue}${emoji}` : `${currentValue} ${emoji}`;
}

function formatDiscussionReplyMeta(replies: StoredDiscussionReply[]): DiscussionReplyMeta {
  if (!replies.length) {
    return {
      replyCount: 0,
      lastReplyLabel: "",
      replyAvatars: [],
    };
  }

  const latestReply = [...replies].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())[0];
  const replyAvatars = replies
    .slice()
    .reverse()
    .reduce<Array<{ initials: string; tone: TeamMemberRecord["avatarTone"] }>>((accumulator, reply) => {
      if (!accumulator.some((member) => member.initials === reply.authorInitials && member.tone === reply.authorTone)) {
        accumulator.push({ initials: reply.authorInitials, tone: reply.authorTone });
      }

      return accumulator;
    }, [])
    .slice(0, 3);

  return {
    replyCount: replies.length,
    lastReplyLabel: `Last reply ${formatDiscussionTimestamp(latestReply.createdAt)}`,
    replyAvatars,
  };
}

function normalizeDiscussionAttachments(attachments: unknown): DiscussionAttachment[] {
  if (!Array.isArray(attachments)) {
    return [];
  }

  return attachments.flatMap((attachment) => {
    if (!attachment || typeof attachment !== "object") {
      return [];
    }

    const candidate = attachment as Partial<DiscussionAttachment>;

    if (
      typeof candidate.id !== "string"
      || typeof candidate.name !== "string"
      || typeof candidate.dataUrl !== "string"
      || typeof candidate.sizeBytes !== "number"
      || typeof candidate.mimeType !== "string"
    ) {
      return [];
    }

    return [{
      id: candidate.id,
      name: candidate.name,
      mimeType: candidate.mimeType,
      sizeBytes: candidate.sizeBytes,
      dataUrl: candidate.dataUrl,
      kind: candidate.kind === "image" ? "image" : "file",
    }];
  });
}

function normalizeDiscussionBucket(bucket: ProjectDiscussionBucket): ProjectDiscussionBucket {
  return {
    threads: Array.isArray(bucket.threads)
      ? bucket.threads.map((thread) => ({
        ...thread,
        attachments: normalizeDiscussionAttachments(thread.attachments),
      }))
      : [],
    replies: Array.isArray(bucket.replies)
      ? bucket.replies.map((reply) => ({
        ...reply,
        attachments: normalizeDiscussionAttachments(reply.attachments),
      }))
      : [],
  };
}

function getDiscussionsFromResponse(payload: DiscussionsApiResponse | null | undefined) {
  return normalizeDiscussionBucket(payload?.discussions ?? EMPTY_DISCUSSION_BUCKET);
}

async function readDiscussionsResponse(response: Response) {
  try {
    return (await response.json()) as DiscussionsApiResponse;
  } catch {
    return null;
  }
}

function DiscussionAttachmentGallery({
  attachments,
  onRemove,
}: {
  attachments: DiscussionAttachment[];
  onRemove?: (attachmentId: string) => void;
}) {
  if (!attachments.length) {
    return null;
  }

  const imageAttachments = attachments.filter((attachment) => attachment.kind === "image");
  const fileAttachments = attachments.filter((attachment) => attachment.kind === "file");

  return (
    <div className="mt-4 space-y-3">
      {imageAttachments.length > 0 && (
        <div className={cn("grid gap-3", imageAttachments.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2")}>
          {imageAttachments.map((attachment) => (
            <div
              key={attachment.id}
              className="group relative overflow-hidden rounded-[var(--radius-xl)] border border-white/8 bg-[#0e0f12]"
            >
              <a href={attachment.dataUrl} target="_blank" rel="noreferrer" className="block">
                <img
                  src={attachment.dataUrl}
                  alt={attachment.name}
                  className="h-[200px] w-full object-cover transition duration-200 group-hover:scale-[1.01]"
                  draggable={false}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-4 pb-4 pt-8">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-white/68">
                    <ImageIcon className="h-3.5 w-3.5" />
                    Image
                  </div>
                  <p className="mt-2 truncate text-sm font-semibold text-white">{attachment.name}</p>
                  <p className="text-xs text-white/74">{formatAttachmentSize(attachment.sizeBytes)}</p>
                </div>
              </a>
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(attachment.id)}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/55 text-white transition hover:bg-black/70"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {fileAttachments.length > 0 && (
        <div className="grid gap-2">
          {fileAttachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.03] px-3 py-3"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-white/8 bg-white/[0.04] text-[0.64rem] font-semibold tracking-[0.08em] text-[var(--text-primary)]">
                {getDiscussionAttachmentBadge(attachment.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--text-primary)]">{attachment.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{formatAttachmentSize(attachment.sizeBytes)}</p>
              </div>
              <a
                href={attachment.dataUrl}
                download={attachment.name}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-white/8 bg-white/[0.03] text-[var(--text-secondary)] transition hover:bg-white/[0.08] hover:text-[var(--text-primary)]"
                title={`Download ${attachment.name}`}
              >
                <Download className="h-4 w-4" />
              </a>
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(attachment.id)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-white/8 bg-white/[0.03] text-[var(--text-secondary)] transition hover:bg-white/[0.08] hover:text-[var(--text-primary)]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DiscussionReactionsRow({
  reactions,
  onReact,
}: {
  reactions: DiscussionReaction[];
  onReact: (emoji: string) => void;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {reactions.map((reaction) => (
        <button
          key={reaction.emoji}
          type="button"
          onClick={() => onReact(reaction.emoji)}
          className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/4 px-2.5 py-1 text-xs text-[var(--text-secondary)] transition hover:bg-white/8"
        >
          <span>{reaction.emoji}</span>
          <span>{reaction.count}</span>
        </button>
      ))}

      {DISCUSSION_REACTION_LIBRARY
        .filter((emoji) => !reactions.some((reaction) => reaction.emoji === emoji))
        .slice(0, 4)
        .map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onReact(emoji)}
            className="flex h-7 min-w-7 items-center justify-center rounded-full border border-dashed border-white/10 bg-white/[0.02] px-2 text-sm text-[var(--text-muted)] transition hover:border-[var(--accent)]/18 hover:bg-white/[0.06] hover:text-[var(--text-primary)]"
          >
            {emoji}
          </button>
        ))}

      {!reactions.some((reaction) => reaction.emoji === DEFAULT_DISCUSSION_REACTION) && (
        <button
          type="button"
          onClick={() => onReact(DEFAULT_DISCUSSION_REACTION)}
          className="flex h-7 min-w-7 items-center justify-center rounded-full border border-white/8 bg-white/4 px-2 text-[var(--text-muted)] transition hover:bg-white/8"
        >
          <Plus className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

function DiscussionRepliesRow({
  replyCount,
  lastReplyLabel,
  replyAvatars,
  attachmentCount,
  onOpen,
}: DiscussionReplyMeta & {
  attachmentCount: number;
  onOpen?: () => void;
}) {
  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-white/6 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2.5">
        {replyCount > 0 ? <AvatarCluster members={replyAvatars} /> : null}
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {replyCount > 0 ? `${replyCount} repl${replyCount === 1 ? "y" : "ies"}` : "No replies yet"}
        </span>
        {attachmentCount > 0 && (
          <span className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            {attachmentCount} file{attachmentCount === 1 ? "" : "s"}
          </span>
        )}
        {lastReplyLabel && <span className="text-xs text-[var(--text-muted)]">{lastReplyLabel}</span>}
      </div>
      {onOpen && (
        <button
          type="button"
          onClick={onOpen}
          className="text-sm font-medium text-[var(--accent)] transition hover:text-[var(--accent-strong)]"
        >
          Open Thread
        </button>
      )}
    </div>
  );
}

function DiscussionThreadCard({
  thread,
  replyMeta,
  flat,
  active,
  onOpen,
  onToggleStar,
  onDelete,
  onReact,
}: {
  thread: StoredDiscussionThread;
  replyMeta: DiscussionReplyMeta;
  flat?: boolean;
  active?: boolean;
  onOpen?: () => void;
  onToggleStar: () => void;
  onDelete: () => void;
  onReact: (emoji: string) => void;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar initials={thread.authorInitials} tone={thread.authorTone} size="md" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate text-sm font-semibold text-[var(--text-primary)]">{thread.authorName}</span>
                {thread.starred && (
                  <span className="rounded-full border border-[var(--accent)]/18 bg-[var(--accent)]/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-[var(--accent)]">
                    Pinned
                  </span>
                )}
                <span className="text-xs text-[var(--text-muted)]">{formatDiscussionTimestamp(thread.createdAt)}</span>
              </div>
              {!flat && (
                <p className="mt-2 truncate text-[1rem] font-semibold text-[var(--text-primary)]">{thread.title}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleStar}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-[12px] border border-white/8 bg-white/[0.03] transition",
              thread.starred ? "text-[#f4c27b]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
            )}
            title={thread.starred ? "Unpin thread" : "Pin thread"}
          >
            <Star className={cn("h-3.5 w-3.5", thread.starred && "fill-current")} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex h-8 w-8 items-center justify-center rounded-[12px] border border-transparent bg-[var(--red)]/10 text-[var(--red)] transition hover:bg-[var(--red)]/16"
            title="Delete thread"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <p className={cn("mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-secondary)]", !flat && "line-clamp-5")}>
        {thread.body}
      </p>

      <DiscussionAttachmentGallery attachments={thread.attachments} />
      <DiscussionReactionsRow reactions={thread.reactions} onReact={onReact} />
      <DiscussionRepliesRow
        replyCount={replyMeta.replyCount}
        lastReplyLabel={replyMeta.lastReplyLabel}
        replyAvatars={replyMeta.replyAvatars}
        attachmentCount={thread.attachments.length}
        onOpen={onOpen}
      />
    </>
  );

  if (flat) {
    return <div className="py-6">{body}</div>;
  }

  return (
    <div className="py-4">
      <div
        className={cn(
          "rounded-[var(--radius-xl)] p-5 transition",
          active
            ? "border-[var(--accent)]/22 bg-[linear-gradient(180deg,rgba(251,138,116,0.08),rgba(255,255,255,0.03))]"
            : cn(DISCUSSION_PANEL_PATCH, "hover:bg-white/[0.03]"),
        )}
      >
        {body}
      </div>
    </div>
  );
}

function DiscussionReplyCard({
  reply,
  onDelete,
  onReact,
}: {
  reply: StoredDiscussionReply;
  onDelete: () => void;
  onReact: (emoji: string) => void;
}) {
  return (
    <div className="py-4">
      <div className={cn(DISCUSSION_PANEL_PATCH, "overflow-hidden rounded-[var(--radius-xl)]")}>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar initials={reply.authorInitials} tone={reply.authorTone} size="md" />
              <div className="min-w-0">
                <span className="text-sm font-semibold text-[var(--text-primary)]">{reply.authorName}</span>
                <span className="ml-2 text-xs text-[var(--text-muted)]">{formatDiscussionTimestamp(reply.createdAt)}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onDelete}
              className="flex h-8 w-8 items-center justify-center rounded-[12px] border border-transparent bg-[var(--red)]/10 text-[var(--red)] transition hover:bg-[var(--red)]/16"
              title="Delete reply"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-secondary)]">{reply.content}</p>
          <DiscussionAttachmentGallery attachments={reply.attachments} />
          <DiscussionReactionsRow reactions={reply.reactions} onReact={onReact} />
        </div>
      </div>
    </div>
  );
}

function DiscussionComposer({
  mode,
  author,
  title,
  body,
  attachments,
  error,
  submitLabel,
  submitDisabled,
  isAttaching = false,
  isSubmitting = false,
  onTitleChange,
  onBodyChange,
  onSubmit,
  onInsertEmoji,
  onAttachFiles,
  onRemoveAttachment,
  onBodyKeyDown,
  onBodyPaste,
}: DiscussionComposerProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className={cn(DISCUSSION_PANEL_PATCH, "rounded-[var(--radius-xl)] p-5")}>
      <div className="flex items-center gap-3">
        <Avatar initials={author.initials} tone={author.tone} size="md" />
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            {mode === "thread" ? "Start a discussion" : "Reply to thread"}
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            {mode === "thread"
              ? "Share updates, blockers, designs, or decisions with the team."
              : "Add context, decisions, screenshots, or attached files."}
          </p>
        </div>
      </div>

      {mode === "thread" && onTitleChange && (
        <input
          type="text"
          value={title ?? ""}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="Thread title"
          className="mt-5 w-full rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
        />
      )}

      <textarea
        value={body}
        onChange={(event) => onBodyChange(event.target.value)}
        onKeyDown={onBodyKeyDown}
        onPaste={onBodyPaste}
        placeholder={mode === "thread" ? "Share the context, question, or update for your team..." : "Write your reply..."}
        className="mt-4 min-h-[144px] w-full resize-none rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
      />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs text-[var(--text-secondary)]">
          <Smile className="h-3.5 w-3.5 text-[var(--accent)]" />
          Quick emoji
        </span>
        {DISCUSSION_CONTENT_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onInsertEmoji(emoji)}
            className="flex h-8 min-w-8 items-center justify-center rounded-full border border-white/8 bg-white/[0.03] px-2 text-sm transition hover:border-[var(--accent)]/18 hover:bg-white/[0.08]"
          >
            {emoji}
          </button>
        ))}
      </div>

      <DiscussionAttachmentGallery attachments={attachments} onRemove={onRemoveAttachment} />

      {error && (
        <p className="mt-3 text-xs text-[var(--red)]">{error}</p>
      )}

      {(isAttaching || isSubmitting) && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/16 bg-[var(--accent)]/10 px-3 py-1.5 text-xs text-[var(--accent)]">
          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
          {isSubmitting ? "Uploading to project storage..." : "Preparing attachments..."}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3 border-t border-white/6 pt-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isAttaching || isSubmitting}
            className="btn-base btn-secondary inline-flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium"
          >
            {isAttaching ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
            {isAttaching ? "Preparing files" : "Attach files"}
          </button>
          <p className="text-xs text-[var(--text-muted)]">
            Images, PDFs, docs, sheets, TXT, ZIP up to {formatAttachmentSize(DISCUSSION_ATTACHMENT_MAX_SIZE)} each. Files upload to project storage and stay with this discussion.
          </p>
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={submitDisabled}
          className="btn-base btn-primary inline-flex items-center gap-2 rounded-[var(--radius-md)] px-4 py-2.5 text-sm font-semibold"
        >
          {isSubmitting ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : mode === "thread" ? (
            <Plus className="h-4 w-4" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {isSubmitting ? (mode === "thread" ? "Uploading..." : "Sending...") : submitLabel}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={DISCUSSION_FILE_ACCEPT}
        multiple
        className="hidden"
        onChange={(event) => {
          onAttachFiles(event.target.files);
          event.target.value = "";
        }}
      />
    </div>
  );
}

export function DiscussionsView({
  projectId,
  teamMembers,
  onCountsChange,
}: {
  projectId: string;
  teamMembers: TeamMemberRecord[];
  onCountsChange?: (counts: { threads: number; replies: number }) => void;
}) {
  const [projectDiscussions, setProjectDiscussions] = useState<ProjectDiscussionBucket>(EMPTY_DISCUSSION_BUCKET);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadBody, setNewThreadBody] = useState("");
  const [threadAttachments, setThreadAttachments] = useState<DiscussionAttachment[]>([]);
  const [replyDraft, setReplyDraft] = useState("");
  const [replyAttachments, setReplyAttachments] = useState<DiscussionAttachment[]>([]);
  const [threadComposerError, setThreadComposerError] = useState("");
  const [replyComposerError, setReplyComposerError] = useState("");
  const [pendingDelete, setPendingDelete] = useState<{ type: "thread" | "reply"; id: string; label: string } | null>(null);
  const [discussionsLoading, setDiscussionsLoading] = useState(true);
  const [discussionsError, setDiscussionsError] = useState("");
  const [threadAttaching, setThreadAttaching] = useState(false);
  const [replyAttaching, setReplyAttaching] = useState(false);
  const [threadSubmitting, setThreadSubmitting] = useState(false);
  const [replySubmitting, setReplySubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    setSelectedThreadId(null);
    setSearch("");
    setNewThreadTitle("");
    setNewThreadBody("");
    setThreadAttachments([]);
    setReplyDraft("");
    setReplyAttachments([]);
    setThreadComposerError("");
    setReplyComposerError("");
    setPendingDelete(null);
    setDiscussionsError("");
    setThreadAttaching(false);
    setReplyAttaching(false);
    setProjectDiscussions(EMPTY_DISCUSSION_BUCKET);
    setDiscussionsLoading(true);

    async function loadDiscussions() {
      try {
        const response = await fetch(`/api/discussions?projectRef=${encodeURIComponent(projectId)}`, {
          cache: "no-store",
        });
        const payload = await readDiscussionsResponse(response);

        if (!response.ok || !payload?.ok) {
          throw new Error(payload?.error || "Failed to load discussions.");
        }

        if (!active) {
          return;
        }

        setProjectDiscussions(getDiscussionsFromResponse(payload));
      } catch (error) {
        console.error("Failed to load discussions:", error);

        if (!active) {
          return;
        }

        setProjectDiscussions(EMPTY_DISCUSSION_BUCKET);
        setDiscussionsError(error instanceof Error ? error.message : "Failed to load discussions.");
      } finally {
        if (active) {
          setDiscussionsLoading(false);
        }
      }
    }

    void loadDiscussions();

    return () => {
      active = false;
    };
  }, [projectId]);

  const currentAuthor = teamMembers[0]
    ? {
        name: teamMembers[0].name,
        initials: teamMembers[0].avatarInitials,
        tone: teamMembers[0].avatarTone,
      }
    : {
        name: "You",
        initials: "YO",
        tone: "sand" as const,
      };

  const repliesByThreadId = useMemo(() => {
    const replyMap: Record<string, StoredDiscussionReply[]> = {};

    projectDiscussions.replies.forEach((reply) => {
      replyMap[reply.threadId] = [...(replyMap[reply.threadId] ?? []), reply];
    });

    Object.values(replyMap).forEach((replies) => {
      replies.sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());
    });

    return replyMap;
  }, [projectDiscussions.replies]);

  const orderedThreads = useMemo(
    () =>
      [...projectDiscussions.threads].sort((left, right) => {
        if (left.starred !== right.starred) {
          return left.starred ? -1 : 1;
        }

        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      }),
    [projectDiscussions.threads],
  );

  const filteredThreads = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return orderedThreads;
    }

    return orderedThreads.filter((thread) => {
      const replies = repliesByThreadId[thread.id] ?? [];
      const searchableText = [
        thread.title,
        thread.body,
        thread.authorName,
        ...thread.attachments.map((attachment) => attachment.name),
        ...replies.flatMap((reply) => [
          reply.authorName,
          reply.content,
          ...reply.attachments.map((attachment) => attachment.name),
        ]),
      ].join(" ").toLowerCase();

      return searchableText.includes(query);
    });
  }, [orderedThreads, repliesByThreadId, search]);

  const selectedThread = useMemo(
    () => projectDiscussions.threads.find((thread) => thread.id === selectedThreadId) ?? null,
    [projectDiscussions.threads, selectedThreadId],
  );

  const selectedThreadReplies = useMemo(
    () => (selectedThreadId ? repliesByThreadId[selectedThreadId] ?? [] : []),
    [repliesByThreadId, selectedThreadId],
  );

  useEffect(() => {
    if (selectedThreadId && !projectDiscussions.threads.some((thread) => thread.id === selectedThreadId)) {
      setSelectedThreadId(null);
      setReplyDraft("");
      setReplyAttachments([]);
      setReplyComposerError("");
    }
  }, [projectDiscussions.threads, selectedThreadId]);

  useEffect(() => {
    onCountsChange?.({
      threads: projectDiscussions.threads.length,
      replies: projectDiscussions.replies.length,
    });
  }, [onCountsChange, projectDiscussions.replies.length, projectDiscussions.threads.length]);

  async function submitDiscussionRequest(request: RequestInit) {
    setDiscussionsError("");
    const response = await fetch("/api/discussions", request);
    const payload = await readDiscussionsResponse(response);

    if (!response.ok || !payload?.ok) {
      throw new Error(payload?.error || "Discussion request failed.");
    }

    const nextDiscussions = getDiscussionsFromResponse(payload);
    setProjectDiscussions(nextDiscussions);

    return payload;
  }

  async function attachFiles(target: DiscussionComposerTarget, files: FileList | null) {
    const fileList = Array.from(files ?? []);

    if (!fileList.length) {
      return;
    }

    const currentAttachments = target === "thread" ? threadAttachments : replyAttachments;
    const setAttachments = target === "thread" ? setThreadAttachments : setReplyAttachments;
    const setError = target === "thread" ? setThreadComposerError : setReplyComposerError;
    const setAttaching = target === "thread" ? setThreadAttaching : setReplyAttaching;
    const availableSlots = DISCUSSION_ATTACHMENT_LIMIT - currentAttachments.length;

    setError("");

    if (availableSlots <= 0) {
      setError(`You can attach up to ${DISCUSSION_ATTACHMENT_LIMIT} files per post.`);
      return;
    }

    const nextFiles = fileList.slice(0, availableSlots);
    const nextError = fileList.length > availableSlots
      ? `Only ${DISCUSSION_ATTACHMENT_LIMIT} attachments are allowed per post.`
      : "";
    const validFiles = nextFiles.filter((file) => file.size <= DISCUSSION_ATTACHMENT_MAX_SIZE);
    const oversizedFile = nextFiles.find((file) => file.size > DISCUSSION_ATTACHMENT_MAX_SIZE);

    if (!validFiles.length && oversizedFile) {
      setError(`${oversizedFile.name} is larger than ${formatAttachmentSize(DISCUSSION_ATTACHMENT_MAX_SIZE)}.`);
      return;
    }

    try {
      setAttaching(true);
      const preparedAttachments = await Promise.all(
        validFiles.map(async (file) => ({
          id: createDiscussionId("attachment"),
          name: file.name,
          mimeType: file.type || "application/octet-stream",
          sizeBytes: file.size,
          dataUrl: await readFileAsDataUrl(file),
          kind: isImageAttachment(file) ? ("image" as const) : ("file" as const),
          file,
        })),
      );

      setAttachments((current) => [...current, ...preparedAttachments]);

      if (oversizedFile) {
        setError(`${oversizedFile.name} was skipped because it is larger than ${formatAttachmentSize(DISCUSSION_ATTACHMENT_MAX_SIZE)}.`);
      } else if (nextError) {
        setError(nextError);
      }
    } catch {
      setError("One or more files could not be attached. Please try again.");
    } finally {
      setAttaching(false);
    }
  }

  function handleComposerPaste(
    target: DiscussionComposerTarget,
    event: ReactClipboardEvent<HTMLTextAreaElement>,
  ) {
    const clipboardFiles = Array.from(event.clipboardData.files ?? []);

    if (!clipboardFiles.length) {
      return;
    }

    event.preventDefault();
    void attachFiles(target, {
      ...clipboardFiles,
      length: clipboardFiles.length,
      item: (index: number) => clipboardFiles[index] ?? null,
    } as FileList);
  }

  async function handleCreateThread() {
    const trimmedTitle = newThreadTitle.trim();
    const trimmedBody = newThreadBody.trim();

    if (!trimmedTitle || !trimmedBody) {
      setThreadComposerError("Add both a title and a message to create the thread.");
      return;
    }

    try {
      setThreadSubmitting(true);
      const formData = new FormData();
      formData.set("mode", "thread");
      formData.set("projectRef", projectId);
      formData.set("title", trimmedTitle);
      formData.set("body", trimmedBody);
      formData.set("authorName", currentAuthor.name);
      formData.set("authorInitials", currentAuthor.initials);
      formData.set("authorTone", currentAuthor.tone);

      threadAttachments.forEach((attachment) => {
        if (attachment.file) {
          formData.append("attachments", attachment.file, attachment.name);
        }
      });

      const result = await submitDiscussionRequest({
        method: "POST",
        body: formData,
      });

      setNewThreadTitle("");
      setNewThreadBody("");
      setThreadAttachments([]);
      setThreadComposerError("");
      setSelectedThreadId(result.threadId ?? null);
    } catch (error) {
      setThreadComposerError(error instanceof Error ? error.message : "Failed to create the thread.");
    } finally {
      setThreadSubmitting(false);
    }
  }

  async function handleSendReply() {
    const trimmedReply = replyDraft.trim();

    if (!selectedThreadId) {
      return;
    }

    if (!trimmedReply) {
      setReplyComposerError("Write a reply before sending it.");
      return;
    }

    try {
      setReplySubmitting(true);
      const formData = new FormData();
      formData.set("mode", "reply");
      formData.set("projectRef", projectId);
      formData.set("threadId", selectedThreadId);
      formData.set("content", trimmedReply);
      formData.set("authorName", currentAuthor.name);
      formData.set("authorInitials", currentAuthor.initials);
      formData.set("authorTone", currentAuthor.tone);

      replyAttachments.forEach((attachment) => {
        if (attachment.file) {
          formData.append("attachments", attachment.file, attachment.name);
        }
      });

      await submitDiscussionRequest({
        method: "POST",
        body: formData,
      });

      setReplyDraft("");
      setReplyAttachments([]);
      setReplyComposerError("");
    } catch (error) {
      setReplyComposerError(error instanceof Error ? error.message : "Failed to send the reply.");
    } finally {
      setReplySubmitting(false);
    }
  }

  const handleThreadSubmitShortcut = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      handleCreateThread();
    }
  };

  const handleReplySubmitShortcut = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      handleSendReply();
    }
  };

  const searchBar = (
    <div className="sticky top-0 z-10 border-b border-white/6 bg-[rgba(12,12,14,0.96)] px-6 py-4">
      <div className="flex h-10 items-center gap-3 rounded-[var(--radius-md)] border border-white/8 bg-white/[0.03] px-4">
        <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={selectedThread ? "Search threads, replies, or shared files" : "Search discussions, replies, or attachments"}
          className="flex-1 border-none bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
        />
      </div>
    </div>
  );

  async function handleToggleStar(threadId: string, starred: boolean) {
    try {
      await submitDiscussionRequest({
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "toggle-star",
          projectRef: projectId,
          threadId,
          starred,
        }),
      });
    } catch (error) {
      setDiscussionsError(error instanceof Error ? error.message : "Failed to update the thread.");
    }
  }

  async function handleAddReaction(targetType: "thread" | "reply", targetId: string, emoji: string) {
    try {
      await submitDiscussionRequest({
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "add-reaction",
          projectRef: projectId,
          targetType,
          targetId,
          emoji,
        }),
      });
    } catch (error) {
      setDiscussionsError(error instanceof Error ? error.message : "Failed to update the reaction.");
    }
  }

  async function confirmDeleteDiscussionEntry() {
    if (!pendingDelete) {
      return;
    }

    try {
      await submitDiscussionRequest({
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectRef: projectId,
          targetType: pendingDelete.type,
          targetId: pendingDelete.id,
        }),
      });
      setPendingDelete(null);
    } catch (error) {
      setDiscussionsError(error instanceof Error ? error.message : "Failed to delete the discussion entry.");
    }
  }

  if (selectedThread) {
    const replyMeta = formatDiscussionReplyMeta(selectedThreadReplies);

    return (
      <div className="flex flex-col">
        {searchBar}

        {discussionsError && (
          <div className="border-b border-[var(--red)]/18 bg-[var(--red)]/8 px-6 py-3 text-sm text-[var(--red)]">
            {discussionsError}
          </div>
        )}

        <div className="border-b border-white/6 px-6 py-5">
          <button
            type="button"
            onClick={() => setSelectedThreadId(null)}
            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-white/8 bg-white/[0.03] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-white/[0.06] hover:text-[var(--text-primary)]"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to discussions
          </button>
        </div>

        <div className="divide-y divide-white/6 px-6">
          <DiscussionThreadCard
            thread={selectedThread}
            flat
            replyMeta={replyMeta}
            onToggleStar={() => {
              void handleToggleStar(selectedThread.id, !selectedThread.starred);
            }}
            onDelete={() => setPendingDelete({ type: "thread", id: selectedThread.id, label: selectedThread.title })}
            onReact={(emoji) => {
              void handleAddReaction("thread", selectedThread.id, emoji);
            }}
          />

          {selectedThreadReplies.length > 0 ? (
            selectedThreadReplies.map((reply) => (
              <DiscussionReplyCard
                key={reply.id}
                reply={reply}
                onDelete={() => setPendingDelete({ type: "reply", id: reply.id, label: reply.content.slice(0, 48) })}
                onReact={(emoji) => {
                  void handleAddReaction("reply", reply.id, emoji);
                }}
              />
            ))
          ) : (
            <div className="py-10 text-center text-sm text-[var(--text-muted)]">
              No replies yet. Share a message, emoji, or screenshot below to kick the thread forward.
            </div>
          )}

          <div className="py-6">
            <DiscussionComposer
              mode="reply"
              author={currentAuthor}
              body={replyDraft}
              attachments={replyAttachments}
              error={replyComposerError}
              submitLabel="Send Reply"
              submitDisabled={!replyDraft.trim() || replySubmitting}
              isAttaching={replyAttaching}
              isSubmitting={replySubmitting}
              onBodyChange={(value) => {
                setReplyDraft(value);
                if (replyComposerError) {
                  setReplyComposerError("");
                }
              }}
              onSubmit={handleSendReply}
              onInsertEmoji={(emoji) => {
                setReplyDraft((current) => appendEmojiToDraft(current, emoji));
                if (replyComposerError) {
                  setReplyComposerError("");
                }
              }}
              onAttachFiles={(files) => {
                void attachFiles("reply", files);
              }}
              onRemoveAttachment={(attachmentId) => {
                setReplyAttachments((current) => current.filter((attachment) => attachment.id !== attachmentId));
              }}
              onBodyKeyDown={handleReplySubmitShortcut}
              onBodyPaste={(event) => handleComposerPaste("reply", event)}
            />
          </div>
        </div>

        <DeleteConfirmationModal
          open={Boolean(pendingDelete)}
          title={pendingDelete?.type === "thread" ? "Delete discussion thread?" : "Delete reply?"}
          description={
            pendingDelete
              ? pendingDelete.type === "thread"
                ? `Delete "${pendingDelete.label}" and all replies in this thread?`
                : "Delete this reply from the discussion thread?"
              : ""
          }
          confirmLabel={pendingDelete?.type === "thread" ? "Delete thread" : "Delete reply"}
          onConfirm={() => {
            void confirmDeleteDiscussionEntry();
          }}
          onClose={() => setPendingDelete(null)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {searchBar}

      {discussionsError && (
        <div className="border-b border-[var(--red)]/18 bg-[var(--red)]/8 px-6 py-3 text-sm text-[var(--red)]">
          {discussionsError}
        </div>
      )}

      <div className="border-b border-white/6 px-6 py-5">
        <DiscussionComposer
          mode="thread"
          author={currentAuthor}
          title={newThreadTitle}
          body={newThreadBody}
          attachments={threadAttachments}
          error={threadComposerError}
          submitLabel="Create Thread"
          submitDisabled={!newThreadTitle.trim() || !newThreadBody.trim() || threadSubmitting}
          isAttaching={threadAttaching}
          isSubmitting={threadSubmitting}
          onTitleChange={(value) => {
            setNewThreadTitle(value);
            if (threadComposerError) {
              setThreadComposerError("");
            }
          }}
          onBodyChange={(value) => {
            setNewThreadBody(value);
            if (threadComposerError) {
              setThreadComposerError("");
            }
          }}
          onSubmit={handleCreateThread}
          onInsertEmoji={(emoji) => {
            setNewThreadBody((current) => appendEmojiToDraft(current, emoji));
            if (threadComposerError) {
              setThreadComposerError("");
            }
          }}
          onAttachFiles={(files) => {
            void attachFiles("thread", files);
          }}
          onRemoveAttachment={(attachmentId) => {
            setThreadAttachments((current) => current.filter((attachment) => attachment.id !== attachmentId));
          }}
          onBodyKeyDown={handleThreadSubmitShortcut}
          onBodyPaste={(event) => handleComposerPaste("thread", event)}
        />
      </div>

      <div className="divide-y divide-white/6 px-6">
        {discussionsLoading ? (
          <div className="py-12 text-center text-sm text-[var(--text-muted)]">
            Loading project discussions...
          </div>
        ) : filteredThreads.length > 0 ? (
          filteredThreads.map((thread, index) => {
            const repliesForThread = repliesByThreadId[thread.id] ?? [];
            const replyMeta = formatDiscussionReplyMeta(repliesForThread);

            return (
              <DiscussionThreadCard
                key={thread.id}
                thread={thread}
                flat={index === 0 && !search.trim()}
                active={selectedThreadId === thread.id}
                replyMeta={replyMeta}
                onOpen={() => {
                  setSelectedThreadId(thread.id);
                  setReplyDraft("");
                  setReplyAttachments([]);
                  setReplyComposerError("");
                }}
                onToggleStar={() => {
                  void handleToggleStar(thread.id, !thread.starred);
                }}
                onDelete={() => setPendingDelete({ type: "thread", id: thread.id, label: thread.title })}
                onReact={(emoji) => {
                  void handleAddReaction("thread", thread.id, emoji);
                }}
              />
            );
          })
        ) : (
          <div className="py-12 text-center text-sm text-[var(--text-muted)]">
            {search.trim()
              ? "No discussions match this search. Try thread titles, reply text, or attachment names."
              : "No discussion threads yet. Start the first one above."}
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        open={Boolean(pendingDelete)}
        title={pendingDelete?.type === "thread" ? "Delete discussion thread?" : "Delete reply?"}
        description={
          pendingDelete
            ? pendingDelete.type === "thread"
              ? `Delete "${pendingDelete.label}" and all replies in this thread?`
              : "Delete this reply from the discussion thread?"
            : ""
        }
        confirmLabel={pendingDelete?.type === "thread" ? "Delete thread" : "Delete reply"}
        onConfirm={() => {
          void confirmDeleteDiscussionEntry();
        }}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}

type InviteMemberRow = {
  id: string;
  name: string;
  email: string;
};

type WorkspaceMemberOption = {
  id: string;
  name: string;
  email: string;
  initials: string;
  tone: TeamMemberRecord["avatarTone"];
  imageSrc?: string;
  role: string;
};

type EditMemberFormState = {
  name: string;
  email: string;
  teamId: string;
  avatarTone: TeamMemberRecord["avatarTone"];
  avatarImage?: string;
};

const MEMBER_TONE_SEQUENCE: TeamMemberRecord["avatarTone"][] = ["sand", "slate", "peach", "rose", "olive"];
const MEMBER_AVATAR_MAX_SIZE = 2 * 1024 * 1024;

function getRandomMemberTone() {
  return MEMBER_TONE_SEQUENCE[Math.floor(Math.random() * MEMBER_TONE_SEQUENCE.length)] ?? "sand";
}

function createInviteMemberRow(): InviteMemberRow {
  return {
    id: `invite-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: "",
    email: "",
  };
}

function buildMemberInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "NM";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function formatMemberInviteDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function createEditMemberForm(
  member: ProjectTeamMember,
  workspaceTeams: WorkspaceTeamRecord[],
): EditMemberFormState {
  const matchedTeam = workspaceTeams.find((team) => team.id === member.teamId)
    ?? findWorkspaceTeamByName(workspaceTeams, member.team);

  return {
    name: member.name,
    email: member.email,
    teamId: matchedTeam?.id ?? "",
    avatarTone: member.avatarTone ?? getRandomMemberTone(),
    avatarImage: member.avatarImage,
  };
}

function EditTeamMemberModal({
  open,
  member,
  workspaceTeams,
  existingMembers,
  onClose,
  onSave,
}: {
  open: boolean;
  member: ProjectTeamMember | null;
  workspaceTeams: WorkspaceTeamRecord[];
  existingMembers: ProjectTeamMember[];
  onClose: () => void;
  onSave: (member: ProjectTeamMember) => void;
}) {
  const [form, setForm] = useState<EditMemberFormState | null>(null);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [teamError, setTeamError] = useState("");
  const [avatarError, setAvatarError] = useState("");

  useEffect(() => {
    if (!open || !member) {
      return;
    }

    setForm(createEditMemberForm(member, workspaceTeams));
    setNameError("");
    setEmailError("");
    setTeamError("");
    setAvatarError("");
  }, [member, open, workspaceTeams]);

  if (!open || !member || !form) {
    return null;
  }

  const currentMember = member;
  const currentForm = form;
  const duplicateMember = existingMembers.find(
    (existingMember) =>
      existingMember.id !== currentMember.id
      && existingMember.email.trim().toLowerCase() === currentForm.email.trim().toLowerCase(),
  );

  function handleSave() {
    const trimmedName = currentForm.name.trim();
    const trimmedEmail = currentForm.email.trim();
    const matchedTeam = workspaceTeams.find((team) => team.id === currentForm.teamId);

    let nextNameError = "";
    let nextEmailError = "";
    let nextTeamError = "";

    if (!trimmedName) {
      nextNameError = "Full name is required.";
    }

    if (!trimmedEmail) {
      nextEmailError = "Email is required.";
    } else if (!isValidEmail(trimmedEmail)) {
      nextEmailError = "Enter a valid email address.";
    } else if (duplicateMember) {
      nextEmailError = "Another team member already uses this email.";
    }

    if (!matchedTeam) {
      nextTeamError = "Choose a workspace team.";
    }

    setNameError(nextNameError);
    setEmailError(nextEmailError);
    setTeamError(nextTeamError);

    if (nextNameError || nextEmailError || nextTeamError || avatarError || !matchedTeam) {
      return;
    }

    onSave({
      ...currentMember,
      name: trimmedName,
      email: trimmedEmail,
      team: matchedTeam.name,
      teamId: matchedTeam.id,
      avatarInitials: buildMemberInitials(trimmedName),
      avatarTone: currentForm.avatarTone,
      avatarImage: currentForm.avatarImage,
      lastActive: currentMember.lastActive === "Invitation sent" ? currentMember.lastActive : "Updated just now",
    });
  }

  function handleAvatarUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setAvatarError("Upload a valid image file.");
      return;
    }

    if (file.size > MEMBER_AVATAR_MAX_SIZE) {
      setAvatarError("Image size should be under 2 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageResult = reader.result;

      if (typeof imageResult !== "string") {
        setAvatarError("Could not read the selected image.");
        return;
      }

      setForm((current) => (current ? { ...current, avatarImage: imageResult } : current));
      setAvatarError("");
    };

    reader.onerror = () => {
      setAvatarError("Could not read the selected image.");
    };

    reader.readAsDataURL(file);
  }

  return (
    <div className="modal-overlay-shell">
      <div className="modal-overlay-backdrop" onClick={onClose} />
      <div className="modal-surface modal-surface-scroll max-w-[560px] border border-white/8 bg-[#18191d] p-5 shadow-2xl sm:p-8">
        <ModalCloseButton absolute onClick={onClose} aria-label="Close edit member modal" />

        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] border border-white/8 bg-white/5">
          <Pencil className="h-5 w-5 text-[var(--text-secondary)]" />
        </div>

        <h2 className="type-card-title">Edit Team Member</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Update member details and avatar without breaking existing project member records.</p>

        <div className="mt-6 rounded-[var(--radius-xl)] border border-white/8 bg-[var(--panel-muted)] p-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <Avatar
                initials={buildMemberInitials(form.name)}
                tone={form.avatarTone}
                imageSrc={form.avatarImage}
                size="lg"
                shape="full"
              />
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Display Photo</p>
                <p className="mt-1 text-[12px] text-[var(--text-muted)]">Upload JPG, PNG, or WEBP up to 2 MB.</p>
              </div>
            </div>

            <div className="flex flex-1 flex-wrap items-center gap-2 sm:justify-end">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border border-white/8 bg-white/[0.04] px-3 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:bg-white/[0.07]">
                <Camera className="h-4 w-4 text-[var(--accent)]" />
                Upload Avatar
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
              {form.avatarImage && (
                <button
                  type="button"
                  onClick={() => {
                    setForm((current) => (current ? { ...current, avatarImage: undefined } : current));
                    setAvatarError("");
                  }}
                  className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-white/8 bg-white/[0.04] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-white/[0.07] hover:text-[var(--text-primary)]"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              )}
            </div>
          </div>

          {avatarError && (
            <p className="mt-3 text-[12px] text-[var(--red)]">{avatarError}</p>
          )}

        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Full Name</p>
            <input
              type="text"
              value={form.name}
              onChange={(event) => {
                setForm((current) => (current ? { ...current, name: event.target.value } : current));
                if (nameError) {
                  setNameError("");
                }
              }}
              placeholder="e.g. Alex Carter"
              className={cn(
                "mt-2 w-full rounded-[var(--radius-lg)] border bg-white/[0.03] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]",
                nameError ? "border-[var(--red)]/35" : "border-white/8",
              )}
            />
            {nameError && <p className="mt-2 text-[12px] text-[var(--red)]">{nameError}</p>}
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Email Address</p>
            <input
              type="email"
              value={form.email}
              onChange={(event) => {
                setForm((current) => (current ? { ...current, email: event.target.value } : current));
                if (emailError) {
                  setEmailError("");
                }
              }}
              placeholder="alex@company.com"
              className={cn(
                "mt-2 w-full rounded-[var(--radius-lg)] border bg-white/[0.03] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]",
                emailError ? "border-[var(--red)]/35" : "border-white/8",
              )}
            />
            {emailError && <p className="mt-2 text-[12px] text-[var(--red)]">{emailError}</p>}
          </div>
        </div>

        <div className="mt-4">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Assigned Team</p>
          <div className="relative mt-2">
            <select
              value={form.teamId}
              onChange={(event) => {
                setForm((current) => (current ? { ...current, teamId: event.target.value } : current));
                if (teamError) {
                  setTeamError("");
                }
              }}
              className={cn(
                "w-full appearance-none rounded-[var(--radius-lg)] border bg-white/[0.03] px-3.5 py-2.5 pr-10 text-sm text-[var(--text-primary)] outline-none",
                teamError ? "border-[var(--red)]/35" : "border-white/8",
              )}
            >
              <option value="" className="bg-[#1C1C1E] text-[var(--text-muted)]">Select team</option>
              {workspaceTeams.map((team) => (
                <option key={team.id} value={team.id} className="bg-[#1C1C1E] text-white">
                  {team.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          </div>
          {teamError && <p className="mt-2 text-[12px] text-[var(--red)]">{teamError}</p>}
        </div>

        <div className="mt-6 grid gap-3 rounded-[var(--radius-xl)] border border-white/8 bg-[var(--panel-muted)] p-4 sm:grid-cols-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Date Added</p>
            <p className="mt-1.5 text-sm font-medium text-[var(--text-secondary)]">{member.dateAdded}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Member Status</p>
            <p className="mt-1.5 text-sm font-medium text-[var(--text-secondary)]">
              {member.lastActive === "Invitation sent" ? "Pending invite" : "Active team member"}
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            type="button"
            onClick={handleSave}
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

export function AddMemberModal({
  open,
  onClose,
  existingMembers,
  workspaceMembers,
  onInviteMembers,
}: {
  open: boolean;
  onClose: () => void;
  existingMembers: TeamMemberRecord[];
  workspaceMembers: TeamMemberRecord[];
  onInviteMembers: (members: TeamMemberRecord[]) => void;
}) {
  const [rows, setRows] = useState<InviteMemberRow[]>(() => [createInviteMemberRow()]);
  const [peopleSelectorOpen, setPeopleSelectorOpen] = useState(false);
  const [peopleQuery, setPeopleQuery] = useState("");

  const workspacePeople = useMemo(() => {
    const options = new Map<string, WorkspaceMemberOption>();

    workspaceMembers.forEach((member) => {
      options.set(member.email.trim().toLowerCase(), {
        id: member.id,
        name: member.name,
        email: member.email,
        initials: member.avatarInitials,
        tone: member.avatarTone,
        imageSrc: member.avatarImage,
        role: "Current team member",
      });
    });

    return Array.from(options.values()).sort((left, right) => left.name.localeCompare(right.name));
  }, [workspaceMembers]);

  const existingEmails = new Set(existingMembers.map((member) => member.email.trim().toLowerCase()));
  const enteredEmails = rows
    .map((row) => row.email.trim().toLowerCase())
    .filter(Boolean);
  const selectedRowEmails = new Set(enteredEmails);
  const duplicateEmailCounts = enteredEmails.reduce<Record<string, number>>((counts, email) => {
    counts[email] = (counts[email] ?? 0) + 1;
    return counts;
  }, {});

  const rowStates = rows.map((row) => {
    const trimmedName = row.name.trim();
    const trimmedEmail = row.email.trim();
    const isFilled = Boolean(trimmedName || trimmedEmail);
    let error = "";

    if (trimmedName && !trimmedEmail) {
      error = "Email is required.";
    } else if (!trimmedName && trimmedEmail) {
      error = "Full name is required.";
    } else if (trimmedEmail && !isValidEmail(trimmedEmail)) {
      error = "Enter a valid email address.";
    } else if (trimmedEmail && existingEmails.has(trimmedEmail.toLowerCase())) {
      error = "This member is already in the team.";
    } else if (trimmedEmail && duplicateEmailCounts[trimmedEmail.toLowerCase()] > 1) {
      error = "Duplicate emails are not allowed.";
    }

    return {
      ...row,
      trimmedName,
      trimmedEmail,
      isFilled,
      error,
    };
  });

  const filledRows = rowStates.filter((row) => row.isFilled);
  const selectedWorkspacePeople = workspacePeople.filter((person) =>
    selectedRowEmails.has(person.email.trim().toLowerCase()),
  );
  const filteredWorkspacePeople = workspacePeople.filter((person) => {
    const query = peopleQuery.trim().toLowerCase();
    if (!query) {
      return true;
    }

    return (
      person.name.toLowerCase().includes(query)
      || person.email.toLowerCase().includes(query)
      || person.role.toLowerCase().includes(query)
    );
  });
  const canSubmit = filledRows.length > 0 && filledRows.every((row) => !row.error);

  if (!open) return null;

  const updateRow = (rowId: string, field: "name" | "email", value: string) =>
    setRows((prev) => prev.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)));

  const addRow = () => setRows((prev) => [...prev, createInviteMemberRow()]);
  const removeRow = (rowId: string) => setRows((prev) => prev.filter((row) => row.id !== rowId));

  const handleClose = () => {
    setRows([createInviteMemberRow()]);
    setPeopleSelectorOpen(false);
    setPeopleQuery("");
    onClose();
  };

  const addWorkspacePerson = (person: WorkspaceMemberOption) => {
    const normalizedEmail = person.email.trim().toLowerCase();
    if (existingEmails.has(normalizedEmail) || selectedRowEmails.has(normalizedEmail)) {
      return;
    }

    setRows((prev) => {
      const emptyRowIndex = prev.findIndex((row) => !row.name.trim() && !row.email.trim());

      if (emptyRowIndex >= 0) {
        return prev.map((row, index) =>
          index === emptyRowIndex
            ? { ...row, name: person.name, email: person.email }
            : row,
        );
      }

      return [...prev, { id: `invite-${Date.now()}-${person.id}`, name: person.name, email: person.email }];
    });

    setPeopleSelectorOpen(false);
    setPeopleQuery("");
  };

  const handleInviteMembers = () => {
    if (!canSubmit) {
      return;
    }

    const invitedOn = formatMemberInviteDate();
    const nextMembers = filledRows.map((row, index) => ({
      id: `tm-${Date.now()}-${index}`,
      name: row.trimmedName,
      email: row.trimmedEmail,
      avatarInitials: buildMemberInitials(row.trimmedName),
      avatarTone: MEMBER_TONE_SEQUENCE[(existingMembers.length + index) % MEMBER_TONE_SEQUENCE.length],
      dateAdded: invitedOn,
      lastActive: "Invitation sent",
    }));

    onInviteMembers(nextMembers);
    handleClose();
  };

  return (
    <div className="modal-overlay-shell">
      <div className="modal-overlay-backdrop" onClick={handleClose} />
      <div className="modal-surface modal-surface-scroll max-w-[520px] border border-white/8 bg-[#18191d] p-5 shadow-2xl sm:p-8">
        <ModalCloseButton absolute onClick={handleClose} aria-label="Close add members modal" />

        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] border border-white/8 bg-white/5">
          <UserRound className="h-5 w-5 text-[var(--text-secondary)]" />
        </div>

        <h2 className="type-card-title">Invite Your Members</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Add members with full name and email, or pick from workspace people to prefill them instantly.</p>

        <div className="relative mt-6">
          <button
            type="button"
            onClick={() => setPeopleSelectorOpen((current) => !current)}
            className="flex w-full items-center justify-between gap-3 rounded-[var(--radius-xl)] border border-white/8 bg-[var(--panel-muted)] px-5 py-3.5 text-left transition hover:bg-white/[0.025]"
          >
            <div className="flex min-w-0 items-center gap-3">
              {selectedWorkspacePeople.length > 0 ? (
                <>
                  <AvatarCluster
                    members={selectedWorkspacePeople.slice(0, 3).map((person) => ({
                      initials: person.initials,
                      tone: person.tone,
                      imageSrc: person.imageSrc,
                    }))}
                  />
                  <span className="truncate text-[13.5px] font-medium text-[var(--text-primary)]">
                    {selectedWorkspacePeople.length === 1
                      ? selectedWorkspacePeople[0].name
                      : `${selectedWorkspacePeople.length} people selected`}
                  </span>
                </>
              ) : (
                <span className="text-[13.5px] text-[var(--text-secondary)]">Select from workspace people</span>
              )}
            </div>
            <ChevronDown className={cn("h-4 w-4 shrink-0 text-[var(--text-muted)] transition", peopleSelectorOpen && "rotate-180")} />
          </button>

          {peopleSelectorOpen && (
            <div className="absolute left-0 top-full z-30 mt-1.5 w-full overflow-hidden rounded-[var(--radius-xl)] border border-white/10 bg-[#202126] p-3 shadow-2xl">
              <div className="mb-3 flex items-center justify-between text-[0.88rem] font-medium text-[var(--text-primary)]">
                Workspace People
                <button type="button" onClick={() => setPeopleSelectorOpen(false)}>
                  <X className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                </button>
              </div>

              <div className="mb-3 flex h-9 items-center gap-2 rounded-[var(--radius-md)] border border-white/8 bg-[#2a2d35] px-3 text-[0.84rem] text-[var(--text-muted)]">
                <Search className="h-3.5 w-3.5" />
                <input
                  value={peopleQuery}
                  onChange={(event) => setPeopleQuery(event.target.value)}
                  placeholder="Search for a person"
                  className="w-full bg-transparent text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                />
              </div>

              <div className="space-y-1">
                {filteredWorkspacePeople.map((person) => {
                  const normalizedEmail = person.email.trim().toLowerCase();
                  const alreadyOnTeam = existingEmails.has(normalizedEmail);
                  const alreadySelected = selectedRowEmails.has(normalizedEmail);
                  const disabled = alreadyOnTeam || alreadySelected;

                  return (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => addWorkspacePerson(person)}
                      disabled={disabled}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-[12px] px-2.5 py-2 text-left transition",
                        disabled
                          ? "cursor-not-allowed opacity-50"
                          : "hover:bg-white/5",
                      )}
                    >
                      <Avatar initials={person.initials} tone={person.tone} imageSrc={person.imageSrc} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-[var(--text-primary)]">{person.name}</p>
                        <p className="mt-0.5 truncate text-[11.5px] text-[var(--text-muted)]">
                          {person.role} · {person.email}
                        </p>
                      </div>
                      {alreadyOnTeam ? (
                        <span className="rounded-full border border-white/8 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">
                          In team
                        </span>
                      ) : alreadySelected ? (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[#160d09]">
                          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                            <path d="M1 3L3 5L7 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      ) : null}
                    </button>
                  );
                })}

                {filteredWorkspacePeople.length === 0 && (
                  <div className="rounded-[var(--radius-md)] border border-dashed border-white/10 px-3 py-3 text-[0.8rem] text-[var(--text-muted)]">
                    No person found for that search.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-7 space-y-3">
          {rowStates.map((row, index) => (
            <div
              key={row.id}
              className={cn(
                "rounded-[var(--radius-xl)] border border-white/8 bg-[var(--panel-muted)] px-5 py-4",
                row.error && "border-[var(--red)]/35",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Member {index + 1}</p>
                  <p className="mt-1 text-[12px] text-[var(--text-muted)]">Invite by name and work email.</p>
                </div>
                {rows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-[var(--text-muted)] transition hover:text-[var(--red)]"
                    aria-label={`Remove member ${index + 1}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Full Name</p>
                  <input
                    type="text"
                    value={row.name}
                    onChange={(event) => updateRow(row.id, "name", event.target.value)}
                    placeholder="e.g. Alex Carter"
                    className="mt-2 w-full rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.03] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                  />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Email Address</p>
                  <input
                    type="email"
                    value={row.email}
                    onChange={(event) => updateRow(row.id, "email", event.target.value)}
                    placeholder="alex@company.com"
                    className="mt-2 w-full rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.03] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                  />
                </div>
              </div>

              {row.error && (
                <p className="mt-3 text-[12px] text-[var(--red)]">{row.error}</p>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addRow}
          className="btn-base btn-secondary mt-4 inline-flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium text-[var(--text-primary)]"
        >
          <Plus className="h-4 w-4" />
          Add another member
        </button>

        <p className="mt-3 text-[12px] text-[var(--text-muted)]">Duplicate emails are blocked, and partial rows will not be submitted.</p>

        <div className="mt-6 flex gap-4">
          <button
            type="button"
            onClick={handleInviteMembers}
            disabled={!canSubmit}
            className="btn-base btn-primary flex-1 rounded-[var(--radius-lg)] py-[15px] text-sm font-semibold"
          >
            Add Members
          </button>
          <button type="button" onClick={handleClose} className="btn-base btn-secondary flex-1 rounded-[var(--radius-lg)] py-[15px] text-sm font-medium text-[var(--text-primary)]">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export function TeamMembersView({
  members,
  clientContacts,
  projectName,
  workspaceTeams,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
}: {
  members: ProjectTeamMember[];
  clientContacts: ProjectClientContact[];
  projectName: string;
  workspaceTeams: WorkspaceTeamRecord[];
  onAddMember: () => void;
  onUpdateMember: (member: ProjectTeamMember) => void;
  onDeleteMember: (memberId: string) => void;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [editingMember, setEditingMember] = useState<ProjectTeamMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<ProjectTeamMember | null>(null);
  const [selectedContact, setSelectedContact] = useState<ProjectClientContact | null>(null);

  const filteredTeam = members.filter(
    (m) =>
      !search
      || m.name.toLowerCase().includes(search.toLowerCase())
      || m.email.toLowerCase().includes(search.toLowerCase())
      || m.team.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredClients = clientContacts.filter(
    (c) =>
      !search
      || c.name.toLowerCase().includes(search.toLowerCase())
      || c.email.toLowerCase().includes(search.toLowerCase())
      || c.company.toLowerCase().includes(search.toLowerCase())
      || c.role.toLowerCase().includes(search.toLowerCase())
      || c.location?.toLowerCase().includes(search.toLowerCase())
      || c.department?.toLowerCase().includes(search.toLowerCase()),
  );

  function activityMeta(lastActive: string) {
    if (lastActive === "Invitation sent") {
      return { label: "Pending invite", dot: "bg-[var(--accent)]", text: "text-[var(--accent)]" };
    }

    const currentYear = String(new Date().getFullYear());
    const previousYear = String(new Date().getFullYear() - 1);

    return lastActive === "Updated just now" || lastActive.includes(currentYear) || lastActive.includes(previousYear)
      ? { label: "Active recently", dot: "bg-[#5cc18c]", text: "text-[#8fddb0]" }
      : { label: "Needs check-in", dot: "bg-[#f0b46b]", text: "text-[#f0c48e]" };
  }

  function handleExport() {
    const rows = [
      ["Type", "Name", "Email", "Team / Company", "Role / Status", "Joined"],
      ...members.map((member) => [
        "Team Member",
        member.name,
        member.email,
        member.team,
        member.lastActive === "Invitation sent" ? "Pending invite" : "Internal member",
        member.dateAdded,
      ]),
      ...clientContacts.map((contact) => [
        "Client Contact",
        contact.name,
        contact.email,
        contact.company,
        contact.role,
        contact.joinedOn,
      ]),
    ];

    const csv = rows
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, "\"\"")}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "project"}-team-members.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function openMail(email: string) {
    window.location.href = `mailto:${email}`;
  }

  function openMemberChat(member: ProjectTeamMember) {
    if (!canOpenProjectMemberChat(member)) {
      return;
    }

    router.push(buildMessagesHref({
      id: member.messageContactId,
      email: member.messageContactEmail,
      name: member.name,
    }));
  }

  return (
    <div className="flex flex-col">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-white/6 bg-[rgba(12,12,14,0.96)] px-6 py-4">
        <div className="flex h-10 flex-1 items-center gap-3 rounded-[var(--radius-md)] border border-white/8 bg-white/[0.03] px-4">
          <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search members or client contacts"
            className="flex-1 border-none bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
          />
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-white/8 bg-white/4 text-[var(--text-secondary)] transition hover:bg-white/8"
          title="Export members and contacts"
        >
          <Download className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onAddMember}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--accent)]/20 bg-[linear-gradient(135deg,rgba(251,138,116,0.2),rgba(251,138,116,0.1))] px-4 text-[0.82rem] font-semibold text-[var(--text-primary)] shadow-[0_10px_24px_rgba(251,138,116,0.08)] transition hover:border-[var(--accent)]/30 hover:bg-[linear-gradient(135deg,rgba(251,138,116,0.26),rgba(251,138,116,0.14))]"
        >
          <Plus className="h-4 w-4 text-[var(--accent)]" />
          Add Member
        </button>
      </div>

      {/* ── Our Team ─────────────────────────────────────────── */}
      <div className="border-b border-white/6">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-white/8 bg-white/[0.04] text-[var(--text-muted)]">
              <Users className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[1.08rem] font-semibold text-[var(--text-primary)]">Our Team</p>
              <p className="text-[0.82rem] text-[var(--text-muted)]">Internal assignees working on this project</p>
            </div>
          </div>
          <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-[0.72rem] font-medium text-[var(--text-secondary)]">
            {String(filteredTeam.length).padStart(2, "0")} members
          </span>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[868px]">
            <div className="grid grid-cols-[minmax(0,2.1fr)_0.95fr_1fr_1.1fr_132px] gap-3 border-b border-white/6 px-6 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">
              <span>Member</span>
              <span>Team</span>
              <span>Joined</span>
              <span>Last Seen</span>
              <span className="text-right">Actions</span>
            </div>

            <div className="divide-y divide-white/6">
              {filteredTeam.length === 0 && (
                <div className="flex min-h-[80px] items-center justify-center px-6 py-5 text-sm text-[var(--text-muted)]">
                  No team members match this search
                </div>
              )}
              {filteredTeam.map((member, index) => {
                const meta = activityMeta(member.lastActive);
                return (
                  <div
                    key={member.id}
                    className="grid grid-cols-[minmax(0,2.1fr)_0.95fr_1fr_1.1fr_132px] items-center gap-3 px-6 py-3.5 transition hover:bg-white/[0.03]"
                  >
                    <div className="flex min-w-0 items-center gap-3 pr-3">
                      <Avatar
                        initials={member.avatarInitials}
                        tone={member.avatarTone}
                        imageSrc={member.avatarImage}
                        size="md"
                        shape="full"
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-[0.9rem] font-semibold text-[var(--text-primary)]">{member.name}</p>
                          <span className="rounded-full border border-white/8 bg-white/[0.03] px-2 py-0.5 text-[0.64rem] font-medium uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                            {index < 2 ? "Core" : "Contributor"}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-[0.75rem] text-[var(--text-muted)]">{member.email}</p>
                      </div>
                    </div>
                    <div className="pr-3">
                      <p className="text-[0.68rem] uppercase tracking-[0.14em] text-[var(--text-muted)]">Assigned team</p>
                      <p className="mt-1.5 text-[0.82rem] font-medium text-[var(--text-secondary)]">{member.team}</p>
                    </div>
                    <div className="pr-3">
                      <p className="text-[0.68rem] uppercase tracking-[0.14em] text-[var(--text-muted)]">Date added</p>
                      <p className="mt-1.5 text-[0.82rem] font-medium text-[var(--text-secondary)]">{member.dateAdded}</p>
                    </div>
                    <div className="pr-3">
                      <div className="flex items-center gap-2">
                        <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
                        <span className={cn("text-[0.7rem] font-medium", meta.text)}>{meta.label}</span>
                      </div>
                      <p className="mt-1.5 text-[0.8rem] text-[var(--text-secondary)]">{member.lastActive}</p>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openMemberChat(member)}
                        disabled={!canOpenProjectMemberChat(member)}
                        className={WORKSPACE_TABLE_ACTION_BUTTON_CLASS_NAME}
                        title={canOpenProjectMemberChat(member) ? `Message ${member.name}` : `${member.name} is not available in messages yet`}
                      >
                        <MessageSquareMore className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingMember(member)}
                        className={WORKSPACE_TABLE_ACTION_BUTTON_CLASS_NAME}
                        title={`Edit ${member.name}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingMember(member)}
                        className={WORKSPACE_TABLE_ACTION_BUTTON_DANGER_CLASS_NAME}
                        title={`Remove ${member.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Client Contacts ───────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--accent)]/20 bg-[var(--accent)]/8 text-[var(--accent)]">
              <Building2 className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[1.08rem] font-semibold text-[var(--text-primary)]">Client Contacts</p>
              <p className="text-[0.82rem] text-[var(--text-muted)]">Stakeholders and reviewers from the client side</p>
            </div>
          </div>
          <span className="rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/8 px-3 py-1 text-[0.72rem] font-medium text-[var(--accent)]">
            {String(filteredClients.length).padStart(2, "0")} contacts
          </span>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[820px]">
            <div className="grid grid-cols-[minmax(0,2.15fr)_1fr_0.95fr_88px] gap-3 border-b border-white/6 px-6 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">
              <span>Contact</span>
              <span>Company</span>
              <span>Contact Status</span>
              <span className="text-right">Actions</span>
            </div>

            <div className="divide-y divide-white/6">
              {filteredClients.length === 0 && (
                <div className="flex min-h-[80px] items-center justify-center px-6 py-5 text-sm text-[var(--text-muted)]">
                  No client contacts match this search
                </div>
              )}
              {filteredClients.map((contact) => (
                <div
                  key={contact.id}
                  className="grid grid-cols-[minmax(0,2.15fr)_1fr_0.95fr_88px] items-center gap-3 px-6 py-3.5 transition hover:bg-white/[0.03]"
                >
                  <div className="flex min-w-0 items-center gap-3 pr-3">
                    <Avatar initials={contact.avatarInitials} tone={contact.avatarTone} size="md" shape="full" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-[0.9rem] font-semibold text-[var(--text-primary)]">{contact.name}</p>
                        <span className="rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/8 px-2 py-0.5 text-[0.64rem] font-medium text-[var(--accent)]">
                          {contact.role}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-[0.75rem] text-[var(--text-muted)]">{contact.email}</p>
                    </div>
                  </div>
                  <div className="pr-3">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3 w-3 shrink-0 text-[var(--text-muted)]" />
                      <p className="truncate text-[0.82rem] font-medium text-[var(--text-secondary)]">{contact.company}</p>
                    </div>
                  </div>
                  <div className="pr-3">
                    <p className="text-[0.68rem] uppercase tracking-[0.14em] text-[var(--text-muted)]">Status</p>
                    <p className="mt-1.5 text-[0.82rem] font-medium text-[var(--text-secondary)]">
                      {contact.status ?? contact.joinedOn}
                    </p>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openMail(contact.email)}
                      className={WORKSPACE_TABLE_ACTION_BUTTON_CLASS_NAME}
                      title="Send email"
                    >
                      <Mail className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedContact(contact)}
                      className={WORKSPACE_TABLE_ACTION_BUTTON_CLASS_NAME}
                      title="View profile"
                    >
                      <UserRound className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <EditTeamMemberModal
        open={Boolean(editingMember)}
        member={editingMember}
        workspaceTeams={workspaceTeams}
        existingMembers={members}
        onClose={() => setEditingMember(null)}
        onSave={(updatedMember) => {
          onUpdateMember(updatedMember);
          setEditingMember(null);
        }}
      />

      <DeleteConfirmationModal
        open={Boolean(deletingMember)}
        title="Remove team member?"
        description={
          deletingMember
            ? `Remove ${deletingMember.name} from this project team? Their workspace profile will stay available for other projects.`
            : ""
        }
        confirmLabel="Remove member"
        onConfirm={() => {
          if (deletingMember) {
            onDeleteMember(deletingMember.id);
            setDeletingMember(null);
          }
        }}
        onClose={() => setDeletingMember(null)}
      />

      {selectedContact && (
        <div className="modal-overlay-shell">
          <div className="modal-overlay-backdrop" onClick={() => setSelectedContact(null)} />
          <div className="modal-surface modal-surface-scroll max-w-[520px] border border-white/8 bg-[#18191d] p-5 shadow-2xl sm:p-8">
            <ModalCloseButton absolute onClick={() => setSelectedContact(null)} aria-label="Close client contact profile" />

            <div className="flex items-center gap-4">
              <Avatar initials={selectedContact.avatarInitials} tone={selectedContact.avatarTone} size="lg" shape="full" />
              <div className="min-w-0">
                <p className="truncate text-[1.08rem] font-semibold text-[var(--text-primary)]">{selectedContact.name}</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{selectedContact.role}</p>
                <p className="mt-1 text-[12px] text-[var(--text-muted)]">{selectedContact.company}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 rounded-[var(--radius-xl)] border border-white/8 bg-[var(--panel-muted)] p-4 sm:grid-cols-2">
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Email</p>
                <p className="mt-1.5 text-sm font-medium text-[var(--text-secondary)]">{selectedContact.email}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Joined Project</p>
                <p className="mt-1.5 text-sm font-medium text-[var(--text-secondary)]">{selectedContact.joinedOn}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Location</p>
                <p className="mt-1.5 text-sm font-medium text-[var(--text-secondary)]">{selectedContact.location ?? "Not provided"}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]">Department</p>
                <p className="mt-1.5 text-sm font-medium text-[var(--text-secondary)]">{selectedContact.department ?? "Not provided"}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                type="button"
                onClick={() => openMail(selectedContact.email)}
                className="btn-base btn-primary flex-1 rounded-[var(--radius-lg)] py-[15px] text-sm font-semibold"
              >
                Email Contact
              </button>
              {selectedContact.website ? (
                <button
                  type="button"
                  onClick={() => window.open(`https://${selectedContact.website}`, "_blank", "noopener,noreferrer")}
                  className="btn-base btn-secondary flex-1 rounded-[var(--radius-lg)] py-[15px] text-sm font-medium text-[var(--text-primary)]"
                >
                  Open Company Site
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedContact(null)}
                  className="btn-base btn-secondary flex-1 rounded-[var(--radius-lg)] py-[15px] text-sm font-medium text-[var(--text-primary)]"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ProjectDirectorySidebar({
  projects,
  clients,
  sidebarCollapsed,
  onCreateProject,
  onSelectProject,
  onToggleSidebarCollapsed,
}: {
  projects: WorkspaceProject[];
  clients: ClientRecord[];
  sidebarCollapsed: boolean;
  onCreateProject: () => void;
  onSelectProject: (projectId: number) => void;
  onToggleSidebarCollapsed: () => void;
}) {
  const [search, setSearch] = useState("");
  const [pendingSearchFocus, setPendingSearchFocus] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const query = search.trim().toLowerCase();
  const visibleProjects = useMemo(
    () => projects.filter((project) => !project.hidden && !project.archived && !project.completed),
    [projects],
  );
  const completedProjects = useMemo(
    () => projects.filter((project) => project.completed && !project.hidden && !project.archived),
    [projects],
  );
  const hiddenProjects = useMemo(
    () => projects.filter((project) => project.hidden && !project.archived).filter((project) =>
      !query
      || project.name.toLowerCase().includes(query)
      || project.category.toLowerCase().includes(query),
    ),
    [projects, query],
  );
  const filteredVisibleProjects = useMemo(
    () => visibleProjects.filter((project) =>
      !query
      || project.name.toLowerCase().includes(query)
      || project.category.toLowerCase().includes(query),
    ),
    [query, visibleProjects],
  );
  const filteredCompletedProjects = useMemo(
    () => completedProjects.filter((project) =>
      !query
      || project.name.toLowerCase().includes(query)
      || project.category.toLowerCase().includes(query),
    ),
    [completedProjects, query],
  );
  const favouriteProjects = useMemo(
    () => filteredVisibleProjects.filter((project) => project.starred),
    [filteredVisibleProjects],
  );
  const archivedProjects = useMemo(
    () => projects.filter((project) => project.archived).filter((project) =>
      !query
      || project.name.toLowerCase().includes(query)
      || project.category.toLowerCase().includes(query),
    ),
    [projects, query],
  );
  const sectionCounts = useMemo(
    () => ({
      visible: visibleProjects.length,
      favourites: visibleProjects.filter((project) => project.starred).length,
      completed: completedProjects.length,
      hidden: projects.filter((project) => project.hidden && !project.archived).length,
      archived: projects.filter((project) => project.archived).length,
    }),
    [completedProjects, projects, visibleProjects],
  );
  const [collapsedSections, setCollapsedSections] = usePersistentState<ProjectDirectoryCollapsedSections>(
    PROJECT_DIRECTORY_SECTIONS_STORAGE_KEY,
    buildProjectDirectoryCollapsedSections(sectionCounts),
  );
  const normalizedCollapsedSections = useMemo(
    () => normalizeProjectDirectoryCollapsedSections(collapsedSections, sectionCounts),
    [collapsedSections, sectionCounts],
  );

  useEffect(() => {
    setCollapsedSections((current) => {
      const next = normalizeProjectDirectoryCollapsedSections(current, sectionCounts);
      let changed = false;

      (Object.keys(sectionCounts) as ProjectDirectorySectionKey[]).forEach((key) => {
        if (sectionCounts[key] === 0 && !next[key]) {
          next[key] = true;
          changed = true;
        }
      });

      return changed ? next : current;
    });
  }, [sectionCounts, setCollapsedSections]);

  useEffect(() => {
    if (sidebarCollapsed || !pendingSearchFocus) {
      return;
    }

    searchInputRef.current?.focus();
    searchInputRef.current?.select();
    setPendingSearchFocus(false);
  }, [pendingSearchFocus, sidebarCollapsed]);

  const toggleSection = (section: ProjectDirectorySectionKey) => {
    setCollapsedSections((current) => ({
      ...normalizeProjectDirectoryCollapsedSections(current, sectionCounts),
      [section]: !normalizeProjectDirectoryCollapsedSections(current, sectionCounts)[section],
    }));
  };

  function handleSearchAction() {
    if (sidebarCollapsed) {
      setPendingSearchFocus(true);
      onToggleSidebarCollapsed();
      return;
    }

    searchInputRef.current?.focus();
    searchInputRef.current?.select();
  }

  const renderSectionCount = (section: ProjectDirectorySectionKey, count: number) => (
    <span
      className={cn(
        "inline-flex min-w-[1.75rem] items-center justify-center rounded-full border px-2 py-0.5 text-[0.68rem] font-medium",
        PROJECT_DIRECTORY_SECTION_COUNT_STYLES[section],
      )}
    >
      {count}
    </span>
  );
  const clientsById = useMemo(
    () => new Map(clients.map((client) => [client.id, client])),
    [clients],
  );
  const activeProject = useMemo(
    () => projects.find((project) => project.active) ?? projects[0] ?? null,
    [projects],
  );
  const activeProjectClient = activeProject?.clientId ? clientsById.get(activeProject.clientId) : undefined;

  if (sidebarCollapsed) {
    return (
      <aside className="flex h-full w-full flex-col items-center border-r border-white/6 bg-[var(--sidebar)] px-3 py-6 transition-[background-color,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
        <div className="flex w-full animate-[fade-slide-in_240ms_ease-out] flex-col items-center gap-2">
          <button
            type="button"
            onClick={onToggleSidebarCollapsed}
            aria-label="Expand project sidebar"
            className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-white/8 bg-white/[0.03] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleSearchAction}
            aria-label="Search projects"
            className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-white/8 bg-white/[0.03] text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex min-h-0 w-full animate-[fade-slide-in_280ms_ease-out] flex-1 flex-col items-center gap-2 overflow-y-auto px-1 py-1.5">
          {projects.map((project) => {
            const projectClient = project.clientId ? clientsById.get(project.clientId) : undefined;

            return (
              <button
                key={project.id}
                type="button"
                onClick={() => onSelectProject(project.id)}
                title={project.name}
                aria-label={`Open ${project.name}`}
                className={cn(
                  "relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-lg)] border bg-white/[0.03] p-1.5 transition hover:bg-white/[0.06]",
                  project.active
                    ? "border-[var(--accent)]/40 shadow-[0_10px_24px_rgba(0,0,0,0.16)] ring-1 ring-[var(--accent)]/30"
                    : "border-white/8",
                  (project.hidden || project.archived) && !project.active && "opacity-60",
                )}
              >
                <ProjectDirectoryItemPatch />
                <div className="relative z-10">
                  <ProjectSidebarAvatar project={project} client={projectClient} />
                </div>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onCreateProject}
          aria-label="Create new project"
          className="group inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--accent)]/18 bg-[linear-gradient(180deg,rgba(244,194,123,0.18)_0%,rgba(251,138,116,0.08)_100%)] text-[var(--text-primary)] shadow-[0_10px_24px_rgba(0,0,0,0.16)] transition hover:border-[var(--accent)]/28 hover:bg-[linear-gradient(180deg,rgba(244,194,123,0.24)_0%,rgba(251,138,116,0.12)_100%)]"
        >
          <Plus className="h-4 w-4" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="flex h-full w-full flex-col border-r border-white/6 bg-[var(--sidebar)] px-4 py-6 transition-[background-color,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:px-5 lg:h-full lg:self-stretch lg:overflow-hidden">
      <div className="flex min-h-0 flex-1 animate-[fade-slide-in_280ms_ease-out] flex-col overflow-y-auto">
        <div className="flex items-center gap-2">
          <div className="flex h-10 flex-1 items-center gap-3 rounded-[var(--radius-md)] border border-white/8 bg-white/[0.03] px-4 text-sm text-[var(--text-muted)]">
            <Search className="h-4 w-4" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search for a project"
              className="w-full border-none bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
            />
          </div>
          <button
            type="button"
            onClick={onToggleSidebarCollapsed}
            aria-label="Collapse project sidebar"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-white/8 bg-white/[0.03] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        <div className={cn("mt-6", PROJECT_DIRECTORY_WRAPPER_STYLES.visible)}>
          <button
            type="button"
            onClick={() => toggleSection("visible")}
            aria-expanded={!normalizedCollapsedSections.visible}
            aria-controls="project-directory-visible"
            className={PROJECT_DIRECTORY_SECTION_BUTTON_CLASS_NAME}
          >
            <span className="flex items-center gap-2.5">
              <FolderKanban className={cn("h-4 w-4", PROJECT_DIRECTORY_SECTION_ICON_STYLES.visible)} />
              <span className={PROJECT_DIRECTORY_LABEL_CLASS_NAME}>My Projects</span>
            </span>
            <div className="flex items-center gap-2">
              {renderSectionCount("visible", sectionCounts.visible)}
              <ChevronDown className={cn("h-4 w-4 transition-transform", normalizedCollapsedSections.visible && "-rotate-90")} />
            </div>
          </button>

          <ProjectDirectoryAnimatedList
            isOpen={!normalizedCollapsedSections.visible}
            id="project-directory-visible"
          >
            {filteredVisibleProjects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => onSelectProject(project.id)}
                className={cn(
                  "relative flex w-full items-center gap-3 overflow-hidden rounded-[var(--radius-md)] border border-white/[0.04] px-3 py-2 text-left transition hover:bg-[var(--accent)]/10",
                  project.active && "bg-[var(--accent)]/15",
                )}
              >
                <ProjectDirectoryItemPatch />
                <div className="relative z-10">
                  <ProjectSidebarAvatar project={project} client={project.clientId ? clientsById.get(project.clientId) : undefined} />
                </div>
                <div className="relative z-10 min-w-0 flex-1">
                  <p className="truncate text-[0.98rem] font-medium text-[var(--text-primary)]">{project.name}</p>
                  <p className="truncate text-[11px] text-[var(--text-muted)]">{project.category}</p>
                </div>
                <Star className={cn("relative z-10 h-4 w-4", project.starred ? "fill-[#f5c842] text-[#f5c842]" : "text-[var(--text-muted)]")} />
              </button>
            ))}
            {filteredVisibleProjects.length === 0 && (
              <div className="rounded-[var(--radius-md)] px-3 py-3 text-sm text-[var(--text-muted)]">
                No visible projects match this search.
              </div>
            )}
          </ProjectDirectoryAnimatedList>
        </div>

        <div className={cn("mt-3", PROJECT_DIRECTORY_WRAPPER_STYLES.favourites)}>
          <button
            type="button"
            onClick={() => toggleSection("favourites")}
            aria-expanded={!normalizedCollapsedSections.favourites}
            aria-controls="project-directory-favourites"
            className={PROJECT_DIRECTORY_SECTION_BUTTON_CLASS_NAME}
          >
            <span className="flex items-center gap-2.5">
              <Star className={cn("h-4 w-4", PROJECT_DIRECTORY_SECTION_ICON_STYLES.favourites)} />
              <span className={PROJECT_DIRECTORY_LABEL_CLASS_NAME}>My Favourites</span>
            </span>
            <div className="flex items-center gap-2">
              {renderSectionCount("favourites", sectionCounts.favourites)}
              <ChevronDown className={cn("h-4 w-4 transition-transform", normalizedCollapsedSections.favourites && "-rotate-90")} />
            </div>
          </button>

          <ProjectDirectoryAnimatedList
            isOpen={!normalizedCollapsedSections.favourites}
            id="project-directory-favourites"
          >
            {favouriteProjects.length > 0 ? (
              favouriteProjects.map((project) => (
                <button
                  key={`fav-${project.id}`}
                  type="button"
                  onClick={() => onSelectProject(project.id)}
                  className={cn(
                    "relative flex w-full items-center gap-3 overflow-hidden rounded-[var(--radius-md)] border border-white/[0.04] px-3 py-2 text-left transition hover:bg-[#f5c842]/10",
                    project.active && "bg-[#f5c842]/15",
                  )}
                >
                  <ProjectDirectoryItemPatch />
                  <div className="relative z-10">
                    <ProjectSidebarAvatar project={project} client={project.clientId ? clientsById.get(project.clientId) : undefined} />
                  </div>
                  <div className="relative z-10 min-w-0 flex-1">
                    <p className="truncate text-[0.92rem] font-medium text-[var(--text-primary)]">{project.name}</p>
                    <p className="truncate text-[11px] text-[var(--text-muted)]">{project.category}</p>
                  </div>
                  <Star className="relative z-10 h-4 w-4 fill-[#f5c842] text-[#f5c842]" />
                </button>
              ))
            ) : (
              <div className="rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--text-muted)]">
                No starred projects yet.
              </div>
            )}
          </ProjectDirectoryAnimatedList>
        </div>

        <div className={cn("mt-3", PROJECT_DIRECTORY_WRAPPER_STYLES.completed)}>
          <button
            type="button"
            onClick={() => toggleSection("completed")}
            aria-expanded={!normalizedCollapsedSections.completed}
            aria-controls="project-directory-completed"
            className={PROJECT_DIRECTORY_SECTION_BUTTON_CLASS_NAME}
          >
            <span className="flex items-center gap-2.5">
              <CheckCircle2 className={cn("h-4 w-4", PROJECT_DIRECTORY_SECTION_ICON_STYLES.completed)} />
              <span className={PROJECT_DIRECTORY_LABEL_CLASS_NAME}>Finished Projects</span>
            </span>
            <div className="flex items-center gap-2">
              {renderSectionCount("completed", sectionCounts.completed)}
              <ChevronDown className={cn("h-4 w-4 transition-transform", normalizedCollapsedSections.completed && "-rotate-90")} />
            </div>
          </button>

          <ProjectDirectoryAnimatedList
            isOpen={!normalizedCollapsedSections.completed}
            id="project-directory-completed"
          >
            {filteredCompletedProjects.length > 0 ? (
              filteredCompletedProjects.map((project) => (
                <button
                  key={`completed-${project.id}`}
                  type="button"
                  onClick={() => onSelectProject(project.id)}
                  className={cn(
                    "relative flex w-full items-center gap-3 overflow-hidden rounded-[var(--radius-md)] border border-white/[0.04] px-3 py-2 text-left transition hover:bg-[var(--green)]/10",
                    project.active && "bg-[var(--green)]/15",
                  )}
                >
                  <ProjectDirectoryItemPatch />
                  <div className="relative z-10">
                    <ProjectSidebarAvatar project={project} client={project.clientId ? clientsById.get(project.clientId) : undefined} />
                  </div>
                  <div className="relative z-10 min-w-0 flex-1">
                    <p className="truncate text-[0.92rem] font-medium text-[var(--text-primary)]">{project.name}</p>
                    <p className="truncate text-[11px] text-[var(--text-muted)]">{project.category}</p>
                  </div>
                  <CheckCircle2 className="relative z-10 h-4 w-4 text-[var(--green)]" />
                </button>
              ))
            ) : (
              <div className="rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--text-muted)]">
                No finished projects.
              </div>
            )}
          </ProjectDirectoryAnimatedList>
        </div>

        <div className={cn("mt-3", PROJECT_DIRECTORY_WRAPPER_STYLES.hidden)}>
          <button
            type="button"
            onClick={() => toggleSection("hidden")}
            aria-expanded={!normalizedCollapsedSections.hidden}
            aria-controls="project-directory-hidden"
            className={PROJECT_DIRECTORY_SECTION_BUTTON_CLASS_NAME}
          >
            <span className="flex items-center gap-2.5">
              <Ban className={cn("h-4 w-4", PROJECT_DIRECTORY_SECTION_ICON_STYLES.hidden)} />
              <span className={PROJECT_DIRECTORY_LABEL_CLASS_NAME}>Hidden Projects</span>
            </span>
            <div className="flex items-center gap-2">
              {renderSectionCount("hidden", sectionCounts.hidden)}
              <ChevronDown className={cn("h-4 w-4 transition-transform", normalizedCollapsedSections.hidden && "-rotate-90")} />
            </div>
          </button>

          <ProjectDirectoryAnimatedList
            isOpen={!normalizedCollapsedSections.hidden}
            id="project-directory-hidden"
          >
            {hiddenProjects.length > 0 ? (
              hiddenProjects.map((project) => (
                <button
                  key={`hidden-${project.id}`}
                  type="button"
                  onClick={() => onSelectProject(project.id)}
                  className={cn(
                    "relative flex w-full items-center gap-3 overflow-hidden rounded-[var(--radius-md)] border border-white/[0.04] px-3 py-2 text-left opacity-80 transition hover:bg-[#8fa1b4]/10",
                    project.active && "bg-[#8fa1b4]/15 opacity-100",
                  )}
                >
                  <ProjectDirectoryItemPatch />
                  <div className="relative z-10">
                    <ProjectSidebarAvatar project={project} client={project.clientId ? clientsById.get(project.clientId) : undefined} />
                  </div>
                  <div className="relative z-10 min-w-0 flex-1">
                    <p className="truncate text-[0.92rem] font-medium text-[var(--text-primary)]">{project.name}</p>
                    <p className="truncate text-[11px] text-[var(--text-muted)]">{project.category}</p>
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--text-muted)]">
                No hidden projects.
              </div>
            )}
          </ProjectDirectoryAnimatedList>
        </div>

        <div className={cn("mt-3", PROJECT_DIRECTORY_WRAPPER_STYLES.archived)}>
          <button
            type="button"
            onClick={() => toggleSection("archived")}
            aria-expanded={!normalizedCollapsedSections.archived}
            aria-controls="project-directory-archived"
            className={PROJECT_DIRECTORY_SECTION_BUTTON_CLASS_NAME}
          >
            <span className="flex items-center gap-2.5">
              <Archive className={cn("h-4 w-4", PROJECT_DIRECTORY_SECTION_ICON_STYLES.archived)} />
              <span className={PROJECT_DIRECTORY_LABEL_CLASS_NAME}>Archive Projects</span>
            </span>
            <div className="flex items-center gap-2">
              {renderSectionCount("archived", sectionCounts.archived)}
              <ChevronDown className={cn("h-4 w-4 transition-transform", normalizedCollapsedSections.archived && "-rotate-90")} />
            </div>
          </button>

          <ProjectDirectoryAnimatedList
            isOpen={!normalizedCollapsedSections.archived}
            id="project-directory-archived"
          >
            {archivedProjects.length > 0 ? (
              archivedProjects.map((project) => (
                <button
                  key={`arch-${project.id}`}
                  type="button"
                  onClick={() => onSelectProject(project.id)}
                  className={cn(
                    "relative flex w-full items-center gap-3 overflow-hidden rounded-[var(--radius-md)] border border-white/[0.04] px-3 py-2 text-left opacity-75 transition hover:bg-[#c59a6a]/10 hover:opacity-100",
                    project.active && "bg-[#c59a6a]/15 opacity-100",
                  )}
                >
                  <ProjectDirectoryItemPatch />
                  <div className="relative z-10">
                    <ProjectSidebarAvatar project={project} client={project.clientId ? clientsById.get(project.clientId) : undefined} />
                  </div>
                  <div className="relative z-10 min-w-0 flex-1">
                    <p className="truncate text-[0.92rem] font-medium text-[var(--text-primary)]">{project.name}</p>
                    <p className="truncate text-[11px] text-[var(--text-muted)]">{project.category}</p>
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--text-muted)]">
                No archived projects.
              </div>
            )}
          </ProjectDirectoryAnimatedList>
        </div>
      </div>

      <button
        type="button"
        onClick={onCreateProject}
        className="group mb-0 mt-5 inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--accent)]/20 bg-[linear-gradient(135deg,rgba(251,138,116,0.2),rgba(251,138,116,0.1))] px-4 text-[0.82rem] font-semibold text-[var(--text-primary)] shadow-[0_10px_24px_rgba(251,138,116,0.08)] transition hover:border-[var(--accent)]/30 hover:bg-[linear-gradient(135deg,rgba(251,138,116,0.26),rgba(251,138,116,0.14))]"
      >
        <Plus className="h-4 w-4 text-[var(--accent)]" />
        <span className="truncate whitespace-nowrap">Create New Project</span>
      </button>
    </aside>
  );
}

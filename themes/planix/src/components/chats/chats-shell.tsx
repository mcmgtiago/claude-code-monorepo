"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Phone,
  Video,
  MoreVertical,
  Send,
  PhoneMissed,
  X,
  ArrowLeft,
  Mic,
  Camera,
  Volume2,
  Monitor,
  Plus,
  ChevronRight,
  Pencil,
  Trash2,
  Ban,
  Smile,
  Image,
  Paperclip,
} from "lucide-react";
import { Avatar } from "@/components/dashboard/avatar";
import { ChatsMenuSidebar } from "@/components/chats/chats-menu-sidebar";
import type { ChatLaunchCandidate } from "@/components/chats/chats-menu-sidebar";
import { PrimarySidebar } from "@/components/layout/primary-sidebar";
import { AppLoader } from "@/components/ui/app-loader";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { readMemoryCache, writeMemoryCache } from "@/lib/resource-memory-cache";
import {
  readCompatibleLocalStorageItem,
  writeCompatibleLocalStorageItem,
} from "@/lib/storage-compat";
import { useHydrated } from "@/lib/use-hydrated";
import { emitPersistentStateSync } from "@/lib/use-persistent-state";
import {
  MESSAGE_CONTACTS_STORAGE_KEY,
  MESSAGE_PREFERENCES_STORAGE_KEY,
  MESSAGE_THREADS_STORAGE_KEY,
} from "@/lib/workspace-counts";
import { pushWorkspaceActivity, useWorkspaceActivityFeed } from "@/lib/workspace-activity";
import { cn } from "@/lib/utils";
import { usePersistentState } from "@/lib/use-persistent-state";
import {
  MESSAGE_CONTACT_EMAIL_PARAM,
  MESSAGE_CONTACT_ID_PARAM,
  MESSAGE_CONTACT_NAME_PARAM,
  resolveMessageContactId,
} from "@/lib/messages-navigation";
import {
  buildStructuredChatMessageContent,
  defaultChatPreferences,
  type ChatAttachment,
  type ChatMessage,
  type ChatMeetingCandidate,
  type ChatMeetingParticipant,
  type ChatMeetingSession,
  type ChatPreferences,
  type ChatContact,
  getChatMessagePreviewText,
  type MessagesPayload,
  summarizeChatAttachments,
} from "@/data/chats";
import { type MeetingRemoteMedia, useMeetingTransport } from "@/components/chats/use-meeting-transport";
import type { WorkspacePeopleMember } from "@/lib/people";

// ── Typing indicator ───────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <span className="flex items-center gap-[3px]">
      <span className="typing-dot block h-[4px] w-[4px] rounded-full bg-[var(--text-muted)]" />
      <span className="typing-dot block h-[4px] w-[4px] rounded-full bg-[var(--text-muted)]" />
      <span className="typing-dot block h-[4px] w-[4px] rounded-full bg-[var(--text-muted)]" />
    </span>
  );
}

function MediaStreamVideo({
  stream,
  muted = true,
  className,
}: {
  stream: MediaStream | null;
  muted?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    ref.current.srcObject = stream;
  }, [stream]);

  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted={muted}
      className={className}
    />
  );
}

function MediaStreamAudio({
  stream,
}: {
  stream: MediaStream | null;
}) {
  const ref = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    ref.current.srcObject = stream;
  }, [stream]);

  return <audio ref={ref} autoPlay playsInline className="hidden" />;
}

// ── Toggle switch ──────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  variant = "light",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  variant?: "light" | "dark";
}) {
  const isDark = variant === "dark";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200",
        checked
          ? "bg-[var(--accent)]"
          : isDark ? "bg-transparent" : "bg-white/15",
      )}
    >
      <span
        className={cn(
          "absolute h-4 w-4 rounded-full shadow transition-transform duration-200",
          isDark ? "bg-[#42444e]" : "bg-white",
          checked ? "translate-x-[22px]" : "translate-x-[4px]",
        )}
      />
    </button>
  );
}

const MESSAGES_CACHE_KEY = "planix.cache.messages";
const MESSAGES_CACHE_MAX_AGE_MS = 1000 * 60 * 10;
const CHAT_SURFACE =
  "border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.02)_100%)]";
const CHAT_COMPOSER_EMOJIS = ["😀", "😂", "😍", "🔥", "👏", "🙏", "👍", "✅", "🎉", "🚀", "❤️", "📌"];
const MAX_MESSAGE_ATTACHMENTS = 4;
const MAX_MESSAGE_ATTACHMENT_SIZE_BYTES = 2 * 1024 * 1024;

type MessagesCachePayload = {
  mode: "remote" | "local";
  payload: MessagesPayload;
};

type SendMessageInput = {
  content?: string;
  attachments?: ChatAttachment[];
};

function buildDefaultMessagesPayload(): MessagesPayload {
  return {
    contacts: [],
    threads: {},
    preferences: defaultChatPreferences,
  };
}

function readLocalPayload(): MessagesPayload {
  if (typeof window === "undefined") {
    return buildDefaultMessagesPayload();
  }

    const fallback = buildDefaultMessagesPayload();

  try {
    const storedContacts = readCompatibleLocalStorageItem(MESSAGE_CONTACTS_STORAGE_KEY);
    const storedThreads = readCompatibleLocalStorageItem(MESSAGE_THREADS_STORAGE_KEY);
    const storedPreferences = readCompatibleLocalStorageItem(MESSAGE_PREFERENCES_STORAGE_KEY);

    return {
      contacts: storedContacts ? (JSON.parse(storedContacts) as ChatContact[]) : fallback.contacts,
      threads: storedThreads ? (JSON.parse(storedThreads) as Record<string, typeof fallback.threads[string]>) : fallback.threads,
      preferences: storedPreferences ? (JSON.parse(storedPreferences) as ChatPreferences) : fallback.preferences,
    };
  } catch {
    return fallback;
  }
}

function writeLocalPayload(payload: MessagesPayload) {
  try {
    writeCompatibleLocalStorageItem(MESSAGE_CONTACTS_STORAGE_KEY, JSON.stringify(payload.contacts));
    writeCompatibleLocalStorageItem(MESSAGE_THREADS_STORAGE_KEY, JSON.stringify(payload.threads));
    writeCompatibleLocalStorageItem(MESSAGE_PREFERENCES_STORAGE_KEY, JSON.stringify(payload.preferences));
    emitPersistentStateSync(MESSAGE_CONTACTS_STORAGE_KEY, payload.contacts);
    emitPersistentStateSync(MESSAGE_THREADS_STORAGE_KEY, payload.threads);
    emitPersistentStateSync(MESSAGE_PREFERENCES_STORAGE_KEY, payload.preferences);
  } catch {
    // Ignore storage failures and keep chat usable.
  }
}

async function readJsonSafely<T>(response: Response) {
  const text = await response.text();

  if (!text.trim()) {
    return null as T | null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null as T | null;
  }
}

function formatThreadDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date).replace(",", " ·");
}

function formatThreadTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatElapsedTime(startedAt: string) {
  const started = new Date(startedAt).getTime();

  if (Number.isNaN(started)) {
    return "00:00";
  }

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - started) / 1000));
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  if (hours > 0) {
    return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
  }

  return [minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

function playIncomingMessageTone() {
  if (typeof window === "undefined") {
    return;
  }

  const audioContext = new window.AudioContext();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(660, audioContext.currentTime + 0.18);

  gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.05, audioContext.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.22);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.22);
  oscillator.onended = () => {
    void audioContext.close();
  };
}

function formatLastSeen(lastSeenAt: string | null | undefined) {
  if (!lastSeenAt) {
    return "";
  }

  const date = new Date(lastSeenAt);
  const diffMs = Date.now() - date.getTime();

  if (Number.isNaN(date.getTime()) || diffMs < 0) {
    return "";
  }

  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 1) {
    return "Last seen just now";
  }

  if (minutes < 60) {
    return `Last seen ${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `Last seen ${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `Last seen ${days}d ago`;
  }

  return `Last seen ${new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date)}`;
}

function getContactSubtitle(contact: ChatContact) {
  if (contact.typing) {
    return "Typing...";
  }

  if (contact.isGroup) {
    return contact.role || "Team chat";
  }

  if (contact.status === "online") {
    return "Online";
  }

  return formatLastSeen(contact.lastSeenAt) || contact.role;
}

function getThreadPreview(message: ChatMessage | undefined) {
  if (!message) {
    return {
      lastMessage: "No messages yet",
      time: "",
      callEnded: false,
    };
  }

  if (message.type === "missed-call") {
    return {
      lastMessage: message.content,
      time: message.time,
      callEnded: true,
    };
  }

  return {
    lastMessage: message.sender === "me"
      ? `You: ${getChatMessagePreviewText(message.type, message.content || summarizeChatAttachments(message.attachments ?? []))}`
      : getChatMessagePreviewText(message.type, message.content || summarizeChatAttachments(message.attachments ?? [])),
    time: message.time,
    callEnded: false,
  };
}

function createDraftAttachmentId() {
  return `attachment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

function readMessagesCache() {
  return readMemoryCache<MessagesCachePayload>(MESSAGES_CACHE_KEY, MESSAGES_CACHE_MAX_AGE_MS);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.trim());
}

// ── Participant menu ───────────────────────────────────────────────────────────

function ParticipantMenu({
  open,
  onClose,
  participant,
  pinned,
  canManage,
  onPin,
  onToggleMute,
  onKick,
}: {
  open: boolean;
  onClose: () => void;
  participant: ChatMeetingParticipant;
  pinned: boolean;
  canManage: boolean;
  onPin: (value: boolean) => void;
  onToggleMute: () => Promise<void>;
  onKick: () => Promise<void>;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute right-6 z-50 w-64 rounded-[var(--radius-xl)] border border-white/8 bg-[var(--panel-strong)] shadow-2xl overflow-hidden"
    >
      {[
        { label: "Pin to Screen", checked: pinned, onChange: onPin },
        {
          label: participant.micEnabled ? "Mute" : "Muted",
          checked: !participant.micEnabled,
          onChange: () => {
            if (!canManage || participant.isCurrentUser) {
              return;
            }

            void onToggleMute();
          },
          disabled: !canManage || participant.isCurrentUser,
        },
      ].map(({ label, checked, onChange, disabled }, i) => (
        <div key={label}>
          <div className="flex items-center justify-between px-5 py-4">
            <span className={cn("type-ui", disabled ? "text-[var(--text-muted)]" : "text-[var(--text-secondary)]")}>{label}</span>
            <Toggle checked={checked} onChange={onChange} variant="dark" />
          </div>
          {i === 0 && <div className="h-px bg-white/6" />}
        </div>
      ))}
      <div className="h-px bg-white/6" />
      <button
        type="button"
        onClick={() => void onKick()}
        disabled={!canManage || participant.isCurrentUser}
        className={cn(
          "flex w-full items-center justify-between px-5 py-4 type-ui transition-colors",
          !canManage || participant.isCurrentUser
            ? "cursor-not-allowed text-[var(--text-muted)]"
            : "text-[var(--text-secondary)] hover:bg-white/4",
        )}
      >
        Kick from the Call
        <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
      </button>
    </div>
  );
}

// ── Message bubble ─────────────────────────────────────────────────────────────

function MessageBubble({
  message,
  contact,
  isEditing,
  editDraft,
  saving,
  onEditDraftChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}: {
  message: ChatMessage;
  contact: ChatContact;
  isEditing: boolean;
  editDraft: string;
  saving: boolean;
  onEditDraftChange: (value: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: () => void;
}) {
  const isMe = message.sender === "me";
  const canEdit = isMe && message.type === "text" && !contact.isGroup;

  if (message.type === "missed-call") {
    return (
      <div className="mt-3 flex justify-end">
        <div className="group max-w-[66%]">
          <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--red)]/20 bg-[var(--red)]/15 px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--red)]">
              <PhoneMissed className="h-4 w-4 text-white" />
            </span>
            <div>
              <p className="type-label font-semibold text-[var(--text-primary)]">
                {message.content}
              </p>
              <p className="type-caption text-[var(--text-muted)]">
                Missed · {message.time}
              </p>
            </div>
          </div>
          <div className="mt-2 flex justify-end opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={onDelete}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/8 bg-[var(--panel-strong)] text-[var(--text-muted)] transition-colors hover:border-[var(--red)]/30 hover:text-[var(--red)]"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("group mt-3 flex gap-3", isMe && "flex-row-reverse")}>
      {!isMe && (
        <Avatar
          initials={contact.initials}
          tone={contact.tone}
          size="sm"
          status={contact.isGroup ? undefined : contact.status}
          className="shrink-0 mt-1"
        />
      )}
      <div className={cn("max-w-[66%]", isMe && "items-end flex flex-col")}>
        <div
          className={cn(
            "rounded-[var(--radius-lg)] px-4 py-3 type-ui leading-relaxed",
            isMe
              ? "rounded-tr-[4px] bg-[var(--panel-soft)] text-[var(--text-primary)]"
              : "rounded-tl-[4px] border border-white/5 bg-[var(--panel-strong)] text-[var(--text-primary)]",
          )}
        >
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editDraft}
                onChange={(event) => onEditDraftChange(event.target.value)}
                rows={3}
                className="w-full resize-none rounded-[var(--radius-md)] border border-white/8 bg-black/10 px-3 py-2 text-[14px] text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent)]/50"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="rounded-[var(--radius-md)] border border-white/8 px-3 py-1.5 text-[12px] font-medium text-[var(--text-secondary)] transition-colors hover:bg-white/6"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onSaveEdit}
                  disabled={!editDraft.trim() || saving}
                  className="rounded-[var(--radius-md)] bg-[var(--accent)] px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {message.content ? <p className="whitespace-pre-wrap break-words">{message.content}</p> : null}
              {message.attachments && message.attachments.length > 0 ? (
                <div className="space-y-2.5">
                  {message.attachments.map((attachment) =>
                    attachment.kind === "image" ? (
                      <a
                        key={attachment.id}
                        href={attachment.dataUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block overflow-hidden rounded-[var(--radius-lg)] border border-white/8 bg-black/10"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={attachment.dataUrl}
                          alt={attachment.name}
                          className="max-h-[280px] w-full object-cover"
                        />
                        <div className="flex items-center justify-between gap-3 border-t border-white/8 px-3 py-2 text-[11px] text-[var(--text-muted)]">
                          <span className="truncate">{attachment.name}</span>
                          <span>{formatAttachmentSize(attachment.sizeBytes)}</span>
                        </div>
                      </a>
                    ) : (
                      <a
                        key={attachment.id}
                        href={attachment.dataUrl}
                        download={attachment.name}
                        className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-white/8 bg-black/10 px-3 py-3 transition hover:bg-white/[0.04]"
                      >
                        <Paperclip className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-medium text-[var(--text-primary)]">{attachment.name}</p>
                          <p className="mt-1 text-[11px] text-[var(--text-muted)]">{formatAttachmentSize(attachment.sizeBytes)}</p>
                        </div>
                      </a>
                    ),
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
        {!isEditing && (
          <div className={cn("mt-1.5 flex items-center gap-2 text-[11px] text-[var(--text-muted)]", isMe && "justify-end")}>
            <span>{message.time}</span>
            {message.edited && <span>Edited</span>}
          </div>
        )}
        {!isEditing && message.reactions && message.reactions.length > 0 && (
          <div className={cn("mt-1.5 flex gap-1", isMe && "justify-end")}>
            {message.reactions.map((r, i) => (
              <span key={i} className="text-lg leading-none">
                {r}
              </span>
            ))}
          </div>
        )}
        {!isEditing && (
          <div className={cn("mt-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100", isMe && "justify-end")}>
            {canEdit && (
              <button
                type="button"
                onClick={onStartEdit}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/8 bg-[var(--panel-strong)] text-[var(--text-muted)] transition-colors hover:border-[var(--accent)]/30 hover:text-[var(--accent)]"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onDelete}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/8 bg-[var(--panel-strong)] text-[var(--text-muted)] transition-colors hover:border-[var(--red)]/30 hover:text-[var(--red)]"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Add participant popup ──────────────────────────────────────────────────────

function AddParticipantPopup({
  open,
  onClose,
  participants,
  onAddParticipant,
}: {
  open: boolean;
  onClose: () => void;
  participants: ChatMeetingCandidate[];
  onAddParticipant: (participantId: string) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const filtered = participants.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.role.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-50 mt-2 w-[280px] rounded-[var(--radius-xl)] border border-white/8 bg-[var(--panel-strong)] shadow-2xl overflow-hidden"
    >
      {/* Search */}
      <div className="p-3 pb-2">
        <div className="flex items-center gap-2.5 rounded-[var(--radius-lg)] bg-[var(--panel-soft)] px-3 py-2.5 border border-white/6">
          <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            autoFocus
            className="flex-1 bg-transparent type-ui text-[var(--text-secondary)] placeholder-[var(--text-muted)] outline-none"
          />
        </div>
      </div>

      {/* People list */}
      <div className="max-h-[420px] overflow-y-auto px-3 pb-3 space-y-1.5">
        {filtered.length === 0 && (
          <p className="py-6 text-center type-caption text-[var(--text-muted)]">No results</p>
        )}
        {filtered.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              void onAddParticipant(p.id);
            }}
            className="flex w-full items-center gap-3.5 rounded-[var(--radius-lg)] bg-[var(--panel-soft)] px-4 py-3.5 text-left hover:bg-white/6 transition-colors"
          >
            <Avatar initials={p.initials} tone={p.tone} size="md" />
            <div className="min-w-0">
              <p className="type-label font-semibold text-[var(--text-primary)] truncate">{p.name}</p>
              <p className="type-caption text-[var(--text-muted)] truncate">{p.role}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Video call modal ───────────────────────────────────────────────────────────

function VideoCallModal({
  contact,
  meeting,
  loading,
  error,
  localStream,
  remoteMediaById,
  transportError,
  onClose,
  onSendMessage,
  onAddParticipant,
  onToggleControls,
  onUpdateParticipant,
  onEndCall,
}: {
  contact: ChatContact;
  meeting: ChatMeetingSession | null;
  loading: boolean;
  error: string;
  localStream: MediaStream | null;
  remoteMediaById: Record<string, MeetingRemoteMedia>;
  transportError: string;
  onClose: () => void;
  onSendMessage: (content: string) => Promise<void>;
  onAddParticipant: (participantId: string) => Promise<void>;
  onToggleControls: (patch: {
    micEnabled?: boolean;
    cameraEnabled?: boolean;
    speakerEnabled?: boolean;
    screenSharing?: boolean;
  }) => Promise<void>;
  onUpdateParticipant: (participantId: string, patch: {
    micEnabled?: boolean;
    kicked?: boolean;
  }) => Promise<void>;
  onEndCall: () => Promise<void>;
}) {
  const [roomMsg, setRoomMsg] = useState("");
  const [participantMenuId, setParticipantMenuId] = useState<string | null>(null);
  const [addParticipantOpen, setAddParticipantOpen] = useState(false);
  const [pinnedParticipantId, setPinnedParticipantId] = useState<string | null>(contact.id);

  const selfParticipant = meeting?.participants.find((participant) => participant.isCurrentUser) ?? null;
  const canManageParticipants = Boolean(selfParticipant?.isHost);
  const pinnedParticipant = meeting?.participants.find((participant) => participant.id === pinnedParticipantId)
    ?? selfParticipant
    ?? meeting?.participants[0]
    ?? null;
  const pinnedRemoteMedia = pinnedParticipant ? remoteMediaById[pinnedParticipant.id] : null;
  const localHasVideo = Boolean(localStream?.getVideoTracks().some((track) => track.readyState === "live"));
  const pinnedHasRemoteVideo = Boolean(pinnedRemoteMedia?.hasVideo);

  useEffect(() => {
    setPinnedParticipantId(contact.id);
  }, [contact.id]);

  const controls = [
    {
      icon: Mic,
      label: "Mic",
      active: Boolean(selfParticipant?.micEnabled),
      onClick: () => onToggleControls({ micEnabled: !selfParticipant?.micEnabled }),
    },
    {
      icon: Camera,
      label: "Camera",
      active: Boolean(selfParticipant?.cameraEnabled),
      onClick: () => onToggleControls({ cameraEnabled: !selfParticipant?.cameraEnabled }),
    },
    {
      icon: Phone,
      label: selfParticipant?.isHost ? "End call" : "Leave call",
      danger: true,
      active: true,
      onClick: onEndCall,
    },
    {
      icon: Volume2,
      label: "Speaker",
      active: Boolean(selfParticipant?.speakerEnabled),
      onClick: () => onToggleControls({ speakerEnabled: !selfParticipant?.speakerEnabled }),
    },
    {
      icon: Monitor,
      label: "Screen share",
      active: Boolean(selfParticipant?.screenSharing),
      onClick: () => onToggleControls({ screenSharing: !selfParticipant?.screenSharing }),
    },
  ] as const;

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left — video feed */}
      <div className="flex flex-1 flex-col p-4 gap-3 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            aria-label="Back to chat"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] soft-pill text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="type-label font-semibold text-[var(--text-primary)]">Video Call</p>
            <p className="type-caption text-[var(--text-muted)] truncate">
              {meeting
                ? `${meeting.participants.length} participant${meeting.participants.length !== 1 ? "s" : ""} in this room`
                : `Preparing a room with ${contact.name}`}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-[var(--accent)]/15 px-3 py-1.5 text-[12px] font-semibold text-[var(--accent)]">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse" />
            {meeting ? formatElapsedTime(meeting.startedAt) : "Connecting"}
          </div>
        </div>

        {/* Video feed */}
        <div className={cn("relative flex-1 min-h-0 overflow-hidden rounded-[var(--radius-xl)]", CHAT_SURFACE)}>
          <div className="absolute inset-0 bg-gradient-to-b from-[#1e2029] via-[#191b22] to-[#0f1014]" />
          {selfParticipant?.isCurrentUser && pinnedParticipant?.id === selfParticipant.id && localHasVideo ? (
            <MediaStreamVideo
              stream={localStream}
              muted
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : pinnedRemoteMedia?.stream && pinnedHasRemoteVideo ? (
            <MediaStreamVideo
              stream={pinnedRemoteMedia.stream}
              muted
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <Avatar
                initials={pinnedParticipant?.initials ?? contact.initials}
                tone={pinnedParticipant?.tone ?? contact.tone}
                size="lg"
                className="!h-24 !w-24 text-3xl"
              />
              <div className="text-center">
                <p className="type-section-title font-semibold text-white">
                  {pinnedParticipant?.name ?? contact.name}
                </p>
                <p className="type-caption text-white/65">
                  {pinnedParticipant?.screenSharing ? "Sharing screen" : pinnedParticipant?.cameraEnabled ? "Camera on" : "Camera off"}
                </p>
              </div>
            </div>
          )}

          <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 backdrop-blur-sm">
            <Avatar initials={pinnedParticipant?.initials ?? contact.initials} tone={pinnedParticipant?.tone ?? contact.tone} size="sm" />
            <span className="type-caption font-medium text-white">
              {pinnedParticipant?.name ?? contact.name}
            </span>
          </div>

          <div className="absolute right-4 top-4 flex flex-wrap justify-end gap-2">
            {transportError && (
              <span className="rounded-full bg-[var(--red)]/20 px-3 py-1.5 text-[11px] font-medium text-[var(--red)]">
                {transportError}
              </span>
            )}
            {meeting?.status === "ended" && (
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white">
                Call ended
              </span>
            )}
          </div>

          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-[var(--red)] animate-pulse" />
              <span className="type-caption font-semibold text-white tabular-nums">
                {meeting ? formatElapsedTime(meeting.startedAt) : "Connecting"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 py-1">
          {controls.map((ctrl) => {
            const Icon = ctrl.icon;
            const isDanger = 'danger' in ctrl && ctrl.danger;
            return (
              <button
                key={ctrl.label}
                type="button"
                aria-label={ctrl.label}
                onClick={() => void ctrl.onClick()}
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full border border-white/15 transition-colors",
                  isDanger
                    ? "bg-[var(--red)] border-[var(--red)] text-white hover:bg-red-500"
                    : ctrl.active
                      ? "bg-[var(--accent)]/20 border-[var(--accent)]/30 text-[var(--accent)] hover:bg-[var(--accent)]/25"
                      : "bg-white/8 text-[var(--text-primary)] hover:bg-white/14",
                )}
              >
                <Icon className="h-5 w-5" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Right — participants + room chat */}
      <div className="flex w-[300px] shrink-0 flex-col border-l border-white/6 overflow-hidden">
        {/* Participants */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="type-section-title font-semibold text-[var(--text-primary)]">Participants</h3>
              <p className="type-caption text-[var(--text-muted)]">
                Total Members {meeting?.participants.length ?? 0}
              </p>
            </div>
            <div className="relative">
              {canManageParticipants && (
                <>
                  <button
                    type="button"
                    aria-label="Add participant"
                    onClick={() => setAddParticipantOpen((v) => !v)}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] soft-pill text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors",
                      addParticipantOpen && "text-[var(--text-primary)] bg-white/8",
                    )}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <AddParticipantPopup
                    open={addParticipantOpen}
                    onClose={() => setAddParticipantOpen(false)}
                    participants={meeting?.availableParticipants ?? []}
                    onAddParticipant={async (participantId) => {
                      await onAddParticipant(participantId);
                      setAddParticipantOpen(false);
                    }}
                  />
                </>
              )}
            </div>
          </div>

          <div className="mt-3 space-y-1">
            {(meeting?.participants ?? []).map((participant) => (
              <div key={participant.id} className="relative flex items-center gap-3 rounded-[var(--radius-md)] px-2 py-2.5 hover:bg-white/4 transition-colors">
                <Avatar initials={participant.initials} tone={participant.tone} size="md" status="online" />
                <div className="min-w-0 flex-1">
                  <p className="type-label font-semibold text-[var(--text-primary)] truncate">
                    {participant.name}
                  </p>
                  <p className="type-caption text-[var(--text-muted)] truncate">
                    {participant.isHost ? "Host" : participant.role}
                    {!participant.micEnabled ? " · Muted" : ""}
                    {participant.screenSharing ? " · Sharing" : ""}
                    {!participant.isCurrentUser && !remoteMediaById[participant.id]?.hasAudio && !remoteMediaById[participant.id]?.hasVideo ? " · Connecting" : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setParticipantMenuId((value) => value === participant.id ? null : participant.id)}
                  className={cn(
                    "text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors",
                    participantMenuId === participant.id && "text-[var(--text-secondary)]",
                  )}
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                {participantMenuId === participant.id && (
                  <ParticipantMenu
                    open
                    onClose={() => setParticipantMenuId(null)}
                    participant={participant}
                    pinned={participant.id === pinnedParticipantId}
                    canManage={canManageParticipants}
                    onPin={(value) => setPinnedParticipantId(value ? participant.id : null)}
                    onToggleMute={async () => {
                      await onUpdateParticipant(participant.id, { micEnabled: !participant.micEnabled });
                      setParticipantMenuId(null);
                    }}
                    onKick={async () => {
                      await onUpdateParticipant(participant.id, { kicked: true });
                      setParticipantMenuId(null);
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-white/6 mx-5" />

        {/* Room chat */}
        <div className="flex flex-1 flex-col overflow-hidden px-4 pt-4">
          <h3 className="type-label font-semibold text-[var(--text-primary)] mb-3">Room Chat</h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {loading ? (
              <div className="flex h-full items-center justify-center py-12">
                <p className="type-caption text-[var(--text-muted)]">Loading room messages...</p>
              </div>
            ) : meeting?.messages.length ? meeting.messages.map((msg) => (
              <div key={msg.id}>
                {!msg.isMe && (
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar initials={msg.initials} tone={msg.tone} size="sm" status="online" />
                    <span className="type-caption font-medium text-[var(--text-secondary)]">{msg.sender}</span>
                    <span className="type-caption text-[var(--text-muted)] ml-auto">{msg.time}</span>
                  </div>
                )}
                {msg.isMe && (
                  <div className="flex items-center gap-2 mb-1 justify-end">
                    <span className="type-caption font-medium text-[var(--text-secondary)]">{msg.sender}</span>
                    <span className="type-caption text-[var(--text-muted)]">{msg.time}</span>
                  </div>
                )}
                <div className={cn("ml-8", msg.isMe && "ml-0")}>
                  <div
                    className={cn(
                      "inline-block rounded-[var(--radius-md)] px-3 py-2 type-caption leading-relaxed",
                      msg.isMe
                        ? "bg-[var(--panel-soft)] text-[var(--text-primary)]"
                        : "bg-[var(--panel-strong)] border border-white/6 text-[var(--text-primary)]",
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            )) : (
              <div className="flex h-full items-center justify-center py-12">
                <p className="type-caption text-[var(--text-muted)]">
                  {error || "No room messages yet."}
                </p>
              </div>
            )}
          </div>

          {/* Room chat input */}
          <div className="py-3">
            <div className={cn("flex items-center gap-2 rounded-[var(--radius-lg)] px-3 py-2", CHAT_SURFACE)}>
              <input
                type="text"
                value={roomMsg}
                onChange={(e) => setRoomMsg(e.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    if (!roomMsg.trim()) {
                      return;
                    }

                    const nextMessage = roomMsg.trim();
                    setRoomMsg("");
                    void onSendMessage(nextMessage);
                  }
                }}
                placeholder="Send Your Message ..."
                className="flex-1 bg-transparent type-caption text-[var(--text-secondary)] placeholder-[var(--text-muted)] outline-none"
              />
              <button
                type="button"
                aria-label="Send"
                onClick={async () => {
                  if (!roomMsg.trim()) {
                    return;
                  }

                  const nextMessage = roomMsg.trim();
                  setRoomMsg("");
                  await onSendMessage(nextMessage);
                }}
                className="text-[var(--accent)] hover:text-[var(--accent-strong)] transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Action panel (⋮ menu) ──────────────────────────────────────────────────────

function ActionPanel({
  open,
  onClose,
  contact,
  onUpdateThread,
  onDeleteChat,
}: {
  open: boolean;
  onClose: () => void;
  contact: ChatContact;
  onUpdateThread: (patch: Partial<ChatContact>) => void;
  onDeleteChat: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const toggleRows = [
    {
      label: "Mute Notifications",
      checked: Boolean(contact.muted),
      onChange: (value: boolean) => onUpdateThread({ muted: value }),
    },
    {
      label: "Restrict",
      checked: Boolean(contact.restricted),
      onChange: (value: boolean) => onUpdateThread({ restricted: value }),
    },
    {
      label: "Pin",
      checked: Boolean(contact.pinned),
      onChange: (value: boolean) => onUpdateThread({ pinned: value }),
    },
    {
      label: "Archive Chat",
      checked: Boolean(contact.archived),
      onChange: (value: boolean) => onUpdateThread({ archived: value }),
    },
  ];
  const actionRows = [
    ...(
      contact.isGroup
        ? []
        : [
            {
              label: contact.blocked ? "Unblock User" : "Block User",
              onClick: () => onUpdateThread({ blocked: !contact.blocked }),
            },
            {
              label: contact.reported ? "Reported" : "Report User",
              onClick: () => onUpdateThread({ reported: !contact.reported }),
            },
          ]
    ),
    {
      label: "Delete Chat",
      onClick: onDeleteChat,
      destructive: true,
    },
  ];

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-50 mt-2 w-72 rounded-[var(--radius-xl)] border border-white/8 bg-[var(--panel-strong)] shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
        <h3 className="type-section-title font-semibold text-[var(--text-primary)]">Action</h3>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/6 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Toggle rows */}
      {toggleRows.map(({ label, checked, onChange }, i, arr) => (
        <div key={label}>
          <div className="flex items-center justify-between px-5 py-4">
            <span className="type-ui text-[var(--text-secondary)]">{label}</span>
            <Toggle checked={checked} onChange={onChange} />
          </div>
          {i < arr.length - 1 && <div className="h-px bg-white/6" />}
        </div>
      ))}

      {actionRows.length > 0 && <div className="h-px bg-white/6" />}

      {/* Chevron rows */}
      {actionRows.map(({ label, onClick, destructive }, i, arr) => (
        <div key={label}>
          <button
            type="button"
            onClick={onClick}
            className={cn(
              "flex w-full items-center justify-between px-5 py-4 type-ui transition-colors hover:bg-white/4",
              destructive ? "text-[var(--red)]" : "text-[var(--text-secondary)]",
            )}
          >
            {label}
            <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
          </button>
          {i < arr.length - 1 && <div className="h-px bg-white/6" />}
        </div>
      ))}
    </div>
  );
}

// ── Audio call overlay ─────────────────────────────────────────────────────────

function AudioCallOverlay({
  contact,
  meeting,
  loading,
  onClose,
  onToggleControls,
  onEndCall,
}: {
  contact: ChatContact;
  meeting: ChatMeetingSession | null;
  loading: boolean;
  onClose: () => void;
  onToggleControls: (patch: {
    micEnabled?: boolean;
    speakerEnabled?: boolean;
  }) => Promise<void>;
  onEndCall: () => Promise<void>;
}) {
  const selfParticipant = meeting?.participants.find((participant) => participant.isCurrentUser) ?? null;
  const endActionLabel = selfParticipant?.isHost ? "End call" : "Leave call";

  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[var(--background)]/95 backdrop-blur-sm">
      {/* Pulse rings */}
      <div className="relative flex items-center justify-center mb-8">
        <span className="pulse-ring absolute h-32 w-32 rounded-full border-2 border-[var(--accent)]/30" />
        <span className="pulse-ring-2 absolute h-32 w-32 rounded-full border-2 border-[var(--accent)]/15" />
        <Avatar initials={contact.initials} tone={contact.tone} size="lg"
          className="relative z-10 !h-20 !w-20 text-2xl" />
      </div>

      <h2 className="type-section-title font-semibold text-[var(--text-primary)] mb-1">
        {contact.name}
      </h2>
      <p className="type-caption text-[var(--text-muted)] mb-2">Voice Call</p>

      {/* Timer */}
      <p className="type-ui font-semibold tabular-nums text-[var(--accent)] mb-10">
        {loading || !meeting ? "Connecting" : formatElapsedTime(meeting.startedAt)}
      </p>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {[
          { icon: Mic, label: "Mic", active: Boolean(selfParticipant?.micEnabled), onClick: () => onToggleControls({ micEnabled: !selfParticipant?.micEnabled }) },
          { icon: Volume2, label: "Speaker", active: Boolean(selfParticipant?.speakerEnabled), onClick: () => onToggleControls({ speakerEnabled: !selfParticipant?.speakerEnabled }) },
        ].map(({ icon: Icon, label }) => (
          <button key={label} type="button" aria-label={label}
            onClick={() => void onToggleControls(label === "Mic" ? { micEnabled: !selfParticipant?.micEnabled } : { speakerEnabled: !selfParticipant?.speakerEnabled })}
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full border border-white/15 transition-colors",
              label === "Mic"
                ? selfParticipant?.micEnabled
                  ? "bg-[var(--accent)]/20 border-[var(--accent)]/30 text-[var(--accent)]"
                  : "bg-white/8 text-[var(--text-primary)] hover:bg-white/14"
                : selfParticipant?.speakerEnabled
                  ? "bg-[var(--accent)]/20 border-[var(--accent)]/30 text-[var(--accent)]"
                  : "bg-white/8 text-[var(--text-primary)] hover:bg-white/14",
            )}>
            <Icon className="h-5 w-5" />
          </button>
        ))}
        <button type="button" aria-label={endActionLabel} onClick={() => void onEndCall()}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--red)] text-white hover:bg-red-500 transition-colors">
          <Phone className="h-5 w-5" />
        </button>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-6 rounded-full border border-white/10 px-4 py-2 text-[12px] font-medium text-[var(--text-secondary)] transition-colors hover:bg-white/6"
      >
        Back to chat
      </button>
    </div>
  );
}

// ── Chat view ──────────────────────────────────────────────────────────────────

function ChatView({
  contact,
  thread,
  meeting,
  meetingLoading,
  showBackButton = false,
  onBack,
  onAudioCall,
  onVideoCall,
  onSendMessage,
  onTypingChange,
  onUpdateThread,
  onEditMessage,
  onDeleteMessage,
  onDeleteThread,
}: {
  contact: ChatContact;
  thread: MessagesPayload["threads"][string] | null;
  meeting: ChatMeetingSession | null;
  meetingLoading: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
  onAudioCall: () => void;
  onVideoCall: () => void;
  onSendMessage: (input: SendMessageInput) => Promise<void>;
  onTypingChange: (contactId: string, isTyping: boolean) => Promise<void>;
  onUpdateThread: (contactId: string, patch: Partial<ChatContact>) => Promise<void>;
  onEditMessage: (contactId: string, messageId: string, content: string) => Promise<void>;
  onDeleteMessage: (contactId: string, messageId: string) => Promise<void>;
  onDeleteThread: (contactId: string) => Promise<void>;
}) {
  const [actionOpen, setActionOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [draftMessage, setDraftMessage] = useState("");
  const [draftAttachments, setDraftAttachments] = useState<ChatAttachment[]>([]);
  const [composerError, setComposerError] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [processingMessageId, setProcessingMessageId] = useState<string | null>(null);
  const [deleteMessageId, setDeleteMessageId] = useState<string | null>(null);
  const [deleteChatOpen, setDeleteChatOpen] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);
  const isTypingRef = useRef(false);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setActionOpen(false);
    setSearchOpen(false);
    setSearchQuery("");
    setDraftMessage("");
    setDraftAttachments([]);
    setComposerError("");
    setEmojiPickerOpen(false);
    setEditingMessageId(null);
    setEditDraft("");
    setDeleteMessageId(null);
  }, [contact.id]);

  useEffect(() => {
    if (contact.isGroup) {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      if (isTypingRef.current) {
        isTypingRef.current = false;
      }

      return;
    }

    const hasDraft = draftMessage.trim().length > 0;

    if (!hasDraft) {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      if (isTypingRef.current) {
        isTypingRef.current = false;
        void onTypingChange(contact.id, false);
      }

      return;
    }

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      void onTypingChange(contact.id, true);
    }

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        void onTypingChange(contact.id, false);
      }
      typingTimeoutRef.current = null;
    }, 1800);
  }, [contact.id, draftMessage, onTypingChange]);

  useEffect(() => () => {
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    if (isTypingRef.current) {
      void onTypingChange(contact.id, false);
      isTypingRef.current = false;
    }
  }, [contact.id, onTypingChange]);

  useEffect(() => {
    if (!emojiPickerOpen) {
      return undefined;
    }

    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setEmojiPickerOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [emojiPickerOpen]);

  function closeSearch() {
    setSearchOpen(false);
    setSearchQuery("");
  }

  const visibleMessages = thread
    ? searchQuery.trim()
      ? thread.messages.filter(
          (m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : thread.messages
    : [];

  async function addAttachments(files: FileList | null, kind: "image" | "file") {
    if (!files || files.length === 0) {
      return;
    }

    setComposerError("");

    const nextFiles = Array.from(files);

    if (draftAttachments.length + nextFiles.length > MAX_MESSAGE_ATTACHMENTS) {
      setComposerError(`You can attach up to ${MAX_MESSAGE_ATTACHMENTS} files per message.`);
      return;
    }

    try {
      const attachments = await Promise.all(
        nextFiles.map(async (file) => {
          if (file.size > MAX_MESSAGE_ATTACHMENT_SIZE_BYTES) {
            throw new Error(`${file.name} exceeds the 2 MB attachment limit.`);
          }

          return {
            id: createDraftAttachmentId(),
            name: file.name,
            mimeType: file.type || (kind === "image" ? "image/*" : "application/octet-stream"),
            sizeBytes: file.size,
            dataUrl: await readFileAsDataUrl(file),
            kind,
          } satisfies ChatAttachment;
        }),
      );

      setDraftAttachments((current) => [...current, ...attachments]);
    } catch (error) {
      setComposerError(error instanceof Error ? error.message : "Failed to prepare attachments.");
    }
  }

  function removeDraftAttachment(attachmentId: string) {
    setDraftAttachments((current) => current.filter((attachment) => attachment.id !== attachmentId));
  }

  async function handleSendMessage() {
    const content = draftMessage.trim();

    if ((!content && draftAttachments.length === 0) || sending) {
      return;
    }

    setSending(true);
    setComposerError("");
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (isTypingRef.current) {
      isTypingRef.current = false;
      void onTypingChange(contact.id, false);
    }
    try {
      await onSendMessage({
        content,
        attachments: draftAttachments,
      });
      setDraftMessage("");
      setDraftAttachments([]);
      setEmojiPickerOpen(false);
    } finally {
      setSending(false);
    }
  }

  function startEditingMessage(message: ChatMessage) {
    setEditingMessageId(message.id);
    setEditDraft(message.content);
    setDeleteMessageId(null);
  }

  async function handleSaveEditedMessage() {
    if (!editingMessageId || !editDraft.trim()) {
      return;
    }

    setProcessingMessageId(editingMessageId);
    await onEditMessage(contact.id, editingMessageId, editDraft.trim());
    setProcessingMessageId(null);
    setEditingMessageId(null);
    setEditDraft("");
  }

  async function handleDeleteMessage() {
    if (!deleteMessageId) {
      return;
    }

    setProcessingMessageId(deleteMessageId);
    await onDeleteMessage(contact.id, deleteMessageId);
    setProcessingMessageId(null);
    setDeleteMessageId(null);

    if (editingMessageId === deleteMessageId) {
      setEditingMessageId(null);
      setEditDraft("");
    }
  }

  async function handleDeleteChat() {
    setDeleteChatOpen(false);
    await onDeleteThread(contact.id);
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* Chat header */}
      <div className="shrink-0 border-b border-white/6 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
          {showBackButton && onBack ? (
            <button
              type="button"
              aria-label="Back to chats"
              onClick={onBack}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-white/5 text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] lg:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          ) : null}
          <Avatar
            initials={contact.initials}
            tone={contact.tone}
            size="md"
            status={contact.isGroup ? undefined : contact.status}
          />
          <div>
            <h2 className="text-[0.95rem] font-semibold tracking-tight text-white sm:text-[1rem]">
              {contact.name}
            </h2>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
              <p className={cn("text-[0.78rem] sm:text-[0.8rem]", contact.typing ? "text-[var(--accent)]" : "text-[var(--text-muted)]")}>
                {getContactSubtitle(contact)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {/* Search */}
          <button
            type="button"
            aria-label="Search"
            onClick={() => { setSearchOpen((v) => !v); if (searchOpen) closeSearch(); }}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-white/5 text-[var(--text-muted)] transition hover:text-[var(--text-primary)]",
              searchOpen && "text-[var(--text-primary)] bg-white/8",
            )}
          >
            <Search className="h-4 w-4" />
          </button>
          {/* Call */}
          <button
            type="button"
            aria-label="Call"
            onClick={onAudioCall}
            disabled={contact.isGroup}
            className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-white/5 text-[var(--text-muted)] transition hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Phone className="h-4 w-4" />
          </button>
          {/* Video */}
          <button
            type="button"
            aria-label="Video"
            onClick={onVideoCall}
            disabled={contact.isGroup}
            className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-white/5 text-[var(--text-muted)] transition hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Video className="h-4 w-4" />
          </button>
          {(meetingLoading || meeting) && (
            <span className="rounded-full border border-white/8 bg-white/6 px-3 py-1 text-[11px] font-medium text-[var(--text-muted)]">
              {meetingLoading || !meeting ? "Connecting call..." : `${meeting.participants.length} in call`}
            </span>
          )}
          {/* ⋮ with action panel */}
          <div className="relative">
            <button
              type="button"
              aria-label="More"
              onClick={() => setActionOpen((v) => !v)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-white/5 text-[var(--text-muted)] transition hover:text-[var(--text-primary)]",
                actionOpen && "text-[var(--text-primary)] bg-white/8",
              )}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            <ActionPanel
              open={actionOpen}
              onClose={() => setActionOpen(false)}
              contact={contact}
              onUpdateThread={(patch) => {
                void onUpdateThread(contact.id, patch);
                if (patch.blocked) {
                  setActionOpen(false);
                }
              }}
              onDeleteChat={() => {
                setActionOpen(false);
                setDeleteChatOpen(true);
              }}
            />
          </div>
        </div>
        </div>
      </div>

      {/* Inline search bar */}
      {searchOpen && (
        <div className="flex items-center gap-2 border-b border-white/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.035)_0%,rgba(255,255,255,0.015)_100%)] px-4 py-3 sm:px-6 lg:px-8">
          <Search className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
          <input
            autoFocus
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="flex-1 bg-transparent type-caption text-[var(--text-secondary)] placeholder-[var(--text-muted)] outline-none"
          />
          {searchQuery && (
            <span className="type-caption text-[var(--text-muted)]">
              {visibleMessages.length} result{visibleMessages.length !== 1 ? "s" : ""}
            </span>
          )}
          <button type="button" onClick={closeSearch}
            className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 space-y-1 overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03),transparent_42%)] px-4 py-5 sm:px-6 lg:px-8">
        {thread ? (
          <>
            {!searchQuery && (
              <div className="mb-6 flex justify-center">
                <span className="type-caption rounded-full border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_100%)] px-4 py-1.5 text-[var(--text-muted)] shadow-[0_10px_24px_rgba(0,0,0,0.14)]">
                  {thread.date}
                </span>
              </div>
            )}
            {visibleMessages.length === 0 && searchQuery ? (
              <div className="flex h-full items-center justify-center pt-12">
                <p className="type-ui text-[var(--text-muted)]">No messages match &ldquo;{searchQuery}&rdquo;</p>
              </div>
            ) : (
              visibleMessages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  contact={contact}
                  isEditing={editingMessageId === msg.id}
                  editDraft={editingMessageId === msg.id ? editDraft : msg.content}
                  saving={processingMessageId === msg.id}
                  onEditDraftChange={setEditDraft}
                  onStartEdit={() => startEditingMessage(msg)}
                  onCancelEdit={() => {
                    setEditingMessageId(null);
                    setEditDraft("");
                  }}
                  onSaveEdit={() => void handleSaveEditedMessage()}
                  onDelete={() => setDeleteMessageId(msg.id)}
                />
              ))
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="w-full max-w-[420px] rounded-[var(--radius-xl)] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.045)_0%,rgba(255,255,255,0.02)_100%)] px-6 py-8 text-center">
              <p className="type-section-title text-[var(--text-secondary)]">No messages yet</p>
              <p className="mt-2 text-[0.92rem] text-[var(--text-muted)]">Start the conversation with your first message.</p>
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="border-t border-white/6 px-4 py-4 sm:px-6 lg:px-8">
        <div className={cn("rounded-[var(--radius-xl)] border border-white/6 px-3 py-3", CHAT_SURFACE)}>
          {draftAttachments.length > 0 ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {draftAttachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="inline-flex max-w-full items-center gap-2 rounded-[var(--radius-md)] border border-white/8 bg-white/[0.03] px-3 py-2 text-[12px] text-[var(--text-secondary)]"
                >
                  <span className="shrink-0 text-[var(--text-muted)]">
                    {attachment.kind === "image" ? <Image className="h-3.5 w-3.5" /> : <Paperclip className="h-3.5 w-3.5" />}
                  </span>
                  <span className="truncate">{attachment.name}</span>
                  <span className="text-[var(--text-muted)]">{formatAttachmentSize(attachment.sizeBytes)}</span>
                  <button
                    type="button"
                    onClick={() => removeDraftAttachment(attachment.id)}
                    className="flex h-5 w-5 items-center justify-center rounded-full text-[var(--text-muted)] transition hover:bg-white/[0.06] hover:text-[var(--text-primary)]"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2.5 sm:flex-nowrap">
            <div className="relative flex shrink-0 items-center gap-0" ref={emojiPickerRef}>
              <button
                type="button"
                aria-label="Emoji"
                onClick={() => setEmojiPickerOpen((current) => !current)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center text-[var(--text-muted)] transition hover:text-[var(--text-primary)]",
                  emojiPickerOpen && "text-[var(--text-primary)]",
                )}
              >
                <Smile className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.7} />
              </button>
              {emojiPickerOpen ? (
                <div className="absolute bottom-full left-0 z-20 mb-3 w-[260px] rounded-[var(--radius-xl)] border border-white/8 bg-[var(--panel-strong)] p-3 shadow-2xl">
                  <div className="grid grid-cols-6 gap-2">
                    {CHAT_COMPOSER_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setDraftMessage((current) => `${current}${emoji}`);
                          setEmojiPickerOpen(false);
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-[12px] text-lg transition hover:bg-white/[0.06]"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              <button
                type="button"
                aria-label="Image"
                onClick={() => imageInputRef.current?.click()}
                className="flex h-8 w-8 items-center justify-center text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
              >
                <Image className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.7} />
              </button>
              <button
                type="button"
                aria-label="Attach"
                onClick={() => attachmentInputRef.current?.click()}
                className="flex h-8 w-8 items-center justify-center text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
              >
                <Paperclip className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.7} />
              </button>
            </div>

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => {
                void addAttachments(event.target.files, "image");
                event.currentTarget.value = "";
              }}
            />
            <input
              ref={attachmentInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(event) => {
                void addAttachments(event.target.files, "file");
                event.currentTarget.value = "";
              }}
            />

            <input
              type="text"
              value={draftMessage}
              onChange={(event) => setDraftMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void handleSendMessage();
                }
              }}
              placeholder="Write a message..."
              className="min-w-0 flex-1 self-center bg-transparent text-[var(--text-secondary)] placeholder-[var(--text-muted)] outline-none type-ui"
            />
            <button
              type="button"
              aria-label="Send"
              onClick={() => void handleSendMessage()}
              disabled={(!draftMessage.trim() && draftAttachments.length === 0) || sending}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--accent)]/28 bg-[linear-gradient(180deg,rgba(251,138,116,0.22)_0%,rgba(251,138,116,0.1)_100%)] text-white shadow-[0_10px_24px_rgba(0,0,0,0.16)] transition hover:border-[var(--accent)]/38 hover:bg-[linear-gradient(180deg,rgba(251,138,116,0.28)_0%,rgba(251,138,116,0.14)_100%)] disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          {composerError ? (
            <p className="mt-3 text-[12px] text-[var(--red)]">{composerError}</p>
          ) : null}
        </div>
      </div>

      <DeleteConfirmationModal
        open={Boolean(deleteMessageId)}
        title="Delete message?"
        description="This will remove the message from this conversation view."
        confirmLabel="Delete message"
        onConfirm={() => void handleDeleteMessage()}
        onClose={() => setDeleteMessageId(null)}
      />

      <DeleteConfirmationModal
        open={deleteChatOpen}
        title="Delete chat?"
        description={`This will permanently remove the conversation with ${contact.name} from your inbox.`}
        confirmLabel="Delete chat"
        onConfirm={() => void handleDeleteChat()}
        onClose={() => setDeleteChatOpen(false)}
      />
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-1 items-center justify-center px-8 py-12">
      <div className="w-full max-w-[520px] rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.045)_0%,rgba(255,255,255,0.02)_100%)] p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] border border-white/8 bg-white/[0.04] text-[var(--text-secondary)]">
          <Send className="h-7 w-7 text-[var(--text-muted)]" />
        </div>
        <h2 className="mt-5 text-[1.5rem] font-semibold tracking-tight text-white">Select a conversation</h2>
        <p className="mt-2 text-[0.95rem] leading-6 text-[var(--text-secondary)]">
          Choose a thread from the sidebar to read updates, reply faster, and manage your workspace messages in one place.
        </p>
      </div>
    </div>
  );
}

// ── Root shell ─────────────────────────────────────────────────────────────────

export function ChatsShell() {
  const searchParams = useSearchParams();
  const hydrated = useHydrated();
  const [, setWorkspaceActivity] = useWorkspaceActivityFeed();
  const cachedMessages = readMessagesCache();
  const previousContactsRef = useRef<ChatContact[]>(cachedMessages?.payload.contacts ?? []);
  const skipNextIncomingAlertRef = useRef(true);
  const [activeId, setActiveId] = usePersistentState("planix.chats.active-thread", "chance");
  const [meetingMode, setMeetingMode] = useState<"audio" | "video" | null>(null);
  const [meeting, setMeeting] = useState<ChatMeetingSession | null>(null);
  const [meetingLoading, setMeetingLoading] = useState(false);
  const [meetingError, setMeetingError] = useState("");
  const [payload, setPayload] = useState<MessagesPayload>(cachedMessages?.payload ?? buildDefaultMessagesPayload);
  const [mode, setMode] = useState<"loading" | "remote" | "local">(cachedMessages?.mode ?? "loading");
  const [loadError, setLoadError] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "thread">("list");
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspacePeopleMember[]>([]);

  useEffect(() => {
    if (mode === "loading") {
      return;
    }

    writeMemoryCache<MessagesCachePayload>(MESSAGES_CACHE_KEY, {
      mode,
      payload,
    });
  }, [mode, payload]);

  async function fetchRemotePayload() {
    const response = await fetch("/api/messages", { cache: "no-store" });
    const result = await readJsonSafely<{
      data?: MessagesPayload;
      error?: string;
    }>(response);

    if (!response.ok || !result?.data) {
      throw new Error(result?.error || "Failed to load messages.");
    }

    return result.data;
  }

  async function fetchMeetingSession(contactId: string) {
    const response = await fetch(`/api/messages/threads/${contactId}/meeting`, { cache: "no-store" });
    const result = await readJsonSafely<{
      data?: ChatMeetingSession;
      error?: string;
    }>(response);

    if (!response.ok || !result?.data) {
      throw new Error(result?.error || "Failed to load meeting session.");
    }

    return result.data;
  }

  async function fetchWorkspaceMembers() {
    const response = await fetch("/api/people", { cache: "no-store" });
    const result = await readJsonSafely<{
      bundle?: { members?: WorkspacePeopleMember[] };
      error?: string;
    }>(response);

    if (!response.ok) {
      throw new Error(result?.error || "Failed to load workspace members.");
    }

    return result?.bundle?.members ?? [];
  }

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    let cancelled = false;

    async function loadMessages() {
      setLoadError("");

      try {
        const result = await fetchRemotePayload();

        if (!cancelled) {
          setPayload(result);
          setLoadError("");
          setMode("remote");
        }
      } catch (error) {
        if (!cancelled) {
          if (!cachedMessages) {
            setPayload(readLocalPayload());
            setMode("local");
          }

          setLoadError(error instanceof Error ? error.message : "Using local chat data.");
        }
      }
    }

    void loadMessages();

    return () => {
      cancelled = true;
    };
  }, [cachedMessages, hydrated]);

  useEffect(() => {
    if (!hydrated || mode === "loading") {
      return;
    }

    let cancelled = false;

    void fetchWorkspaceMembers()
      .then((members) => {
        if (!cancelled) {
          setWorkspaceMembers(members);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setWorkspaceMembers([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [hydrated, mode]);

  useEffect(() => {
    writeLocalPayload(payload);
  }, [payload]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const previousContacts = previousContactsRef.current;
    const incomingContacts = payload.contacts.filter((contact) => {
      const previous = previousContacts.find((item) => item.id === contact.id);
      const previousUnread = previous?.unread ?? 0;
      const nextUnread = contact.unread ?? 0;

      return nextUnread > previousUnread && contact.id !== activeId;
    });

    if (!skipNextIncomingAlertRef.current && incomingContacts.length > 0 && !payload.preferences.dnd) {
      if (payload.preferences.notifSound) {
        try {
          playIncomingMessageTone();
        } catch {
          // Ignore audio playback issues.
        }
      }

      if (typeof window !== "undefined" && document.hidden && "Notification" in window && Notification.permission === "granted") {
        const latestIncoming = incomingContacts[0];
        const unreadCount = latestIncoming.unread ?? 0;
        new Notification(latestIncoming.name, {
          body: unreadCount > 1
            ? `${unreadCount} unread messages`
            : latestIncoming.lastMessage.replace(/^You:\s*/, ""),
        });
      }
    }

    previousContactsRef.current = payload.contacts;
    skipNextIncomingAlertRef.current = false;
  }, [activeId, hydrated, payload.contacts, payload.preferences.dnd, payload.preferences.notifSound]);

  const blockedContacts = useMemo(
    () => payload.contacts.filter((contact) => contact.blocked),
    [payload.contacts],
  );
  const requestedContactId = searchParams.get(MESSAGE_CONTACT_ID_PARAM);
  const requestedContactEmail = searchParams.get(MESSAGE_CONTACT_EMAIL_PARAM);
  const requestedContactName = searchParams.get(MESSAGE_CONTACT_NAME_PARAM);
  const hasRequestedContact = Boolean(requestedContactId || requestedContactEmail || requestedContactName);
  const navigableContacts = useMemo(
    () => payload.contacts.filter((contact) => !contact.blocked),
    [payload.contacts],
  );
  const visibleContacts = useMemo(
    () => navigableContacts.filter((contact) => !contact.hidden),
    [navigableContacts],
  );
  const activeContact = navigableContacts.find((contact) => contact.id === activeId) ?? visibleContacts[0] ?? null;
  const activeThread = activeContact ? payload.threads[activeContact.id] ?? null : null;
  const launchCandidates = useMemo<ChatLaunchCandidate[]>(() => {
    const candidateMap = new Map<string, ChatLaunchCandidate>();

    for (const contact of navigableContacts) {
      if (contact.isGroup) {
        continue;
      }

      const key = (contact.email?.trim().toLowerCase() || contact.id).trim();
      candidateMap.set(key, {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        role: contact.role,
        initials: contact.initials,
        tone: contact.tone,
        available: true,
        contactId: contact.id,
      });
    }

    for (const member of workspaceMembers) {
      const normalizedEmail = member.email.trim().toLowerCase();
      const key = normalizedEmail || member.id;
      const existingContact = navigableContacts.find((contact) =>
        (!contact.isGroup)
        && (
          contact.id === member.id
          || (normalizedEmail && contact.email?.trim().toLowerCase() === normalizedEmail)
        ),
      );

      if (candidateMap.has(key)) {
        const current = candidateMap.get(key);
        if (current) {
          candidateMap.set(key, {
            ...current,
            name: member.name || current.name,
            role: member.role || current.role,
            initials: member.avatarInitials || current.initials,
            tone: member.avatarTone || current.tone,
          });
        }
        continue;
      }

      candidateMap.set(key, {
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        initials: member.avatarInitials,
        tone: member.avatarTone,
        available: Boolean(existingContact?.id) || (isUuid(member.id) && member.lastActive !== "Invitation sent"),
        contactId: existingContact?.id ?? (isUuid(member.id) && member.lastActive !== "Invitation sent" ? member.id : undefined),
      });
    }

    return Array.from(candidateMap.values()).sort((left, right) => left.name.localeCompare(right.name));
  }, [navigableContacts, workspaceMembers]);
  const {
    localStream: meetingLocalStream,
    remoteMedia: meetingRemoteMedia,
    remoteMediaById: meetingRemoteMediaById,
    transportError: meetingTransportError,
  } = useMeetingTransport({
    contactId: activeContact?.id ?? null,
    meeting,
    meetingMode,
    enabled: hydrated && mode === "remote" && Boolean(meetingMode) && Boolean(activeContact),
    onTransportPatch: updateMeetingControlsAction,
  });

  useEffect(() => {
    setMeeting(null);
    setMeetingError("");
    setMeetingLoading(false);
  }, [activeContact?.id]);

  useEffect(() => {
    const resolvedContactId = resolveMessageContactId(navigableContacts, {
      id: requestedContactId,
      email: requestedContactEmail,
      name: requestedContactName,
    });

    if (!resolvedContactId || resolvedContactId === activeId) {
      return;
    }

    setActiveId(resolvedContactId);

    const requestedContact = navigableContacts.find((contact) => contact.id === resolvedContactId);

    if (requestedContact?.hidden) {
      void updateThread(resolvedContactId, { hidden: false, archived: false });
    }
  }, [activeId, navigableContacts, requestedContactEmail, requestedContactId, requestedContactName, setActiveId]);

  useEffect(() => {
    if (hasRequestedContact) {
      setMobileView("thread");
    }
  }, [hasRequestedContact]);

  useEffect(() => {
    if (!activeContact && visibleContacts[0]) {
      setActiveId(visibleContacts[0].id);
    }
  }, [activeContact, setActiveId, visibleContacts]);

  useEffect(() => {
    if (!activeContact) {
      setMobileView("list");
    }
  }, [activeContact]);

  useEffect(() => {
    if (!activeContact || activeContact.unread === 0) {
      return;
    }

    void updateThread(activeContact.id, { unread: 0 });
  }, [activeContact?.id, activeContact?.unread]);

  async function patchRemoteThread(contactId: string, patch: Partial<ChatContact>) {
    const response = await fetch(`/api/messages/threads/${contactId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pinned: patch.pinned,
        muted: patch.muted,
        restricted: patch.restricted,
        blocked: patch.blocked,
        archived: patch.archived,
        hidden: patch.hidden,
        unread: patch.unread,
        contactStatus: patch.status,
        reported: patch.reported,
      }),
    });

    if (!response.ok) {
      const result = await readJsonSafely<{ error?: string }>(response);
      throw new Error(result?.error || "Failed to update conversation.");
    }
  }

  async function updateThread(contactId: string, patch: Partial<ChatContact>) {
    const previous = payload;

    setPayload((current) => ({
      ...current,
      contacts: current.contacts.map((contact) =>
        contact.id === contactId
          ? {
              ...contact,
              ...patch,
              unread: patch.unread ?? contact.unread,
            }
          : contact,
      ),
    }));

    if (mode === "remote") {
      try {
        await patchRemoteThread(contactId, patch);
        setPayload(await fetchRemotePayload());
        setLoadError("");
      } catch (error) {
        setPayload(previous);
        setLoadError(error instanceof Error ? error.message : "Failed to update conversation.");
      }
    }
  }

  async function updatePreferences(next: ChatPreferences) {
    const previous = payload.preferences;
    setPayload((current) => ({ ...current, preferences: next }));

    if (
      typeof window !== "undefined"
      && next.notifSound
      && !previous.notifSound
      && "Notification" in window
      && Notification.permission === "default"
    ) {
      void Notification.requestPermission().catch(() => undefined);
    }

    if (mode === "remote") {
      try {
        const response = await fetch("/api/messages", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ preferences: next }),
        });

        if (!response.ok) {
          const result = await readJsonSafely<{ error?: string }>(response);
          throw new Error(result?.error || "Failed to update message preferences.");
        }
        setLoadError("");
      } catch (error) {
        setPayload((current) => ({ ...current, preferences: previous }));
        setLoadError(error instanceof Error ? error.message : "Failed to update message preferences.");
      }
    }
  }

  async function sendMessage(contactId: string, input: SendMessageInput) {
    const previous = payload;
    const now = new Date();
    const time = formatThreadTime(now);
    const contact = payload.contacts.find((item) => item.id === contactId);
    const attachments = input.attachments ?? [];
    const content = input.content?.trim() ?? "";
    const previewText = content || summarizeChatAttachments(attachments);
    const nextType: ChatMessage["type"] = attachments.length > 0 ? "attachment" : "text";

    if (!previewText) {
      return;
    }

    const nextMessage: ChatMessage = {
      id: `local-${Date.now()}`,
      content,
      sender: "me",
      time,
      type: nextType,
      reactions: [],
      attachments,
    };

    setPayload((current) => ({
      preferences: current.preferences,
      contacts: current.contacts.map((contact) =>
        contact.id === contactId
          ? {
              ...contact,
              lastMessage: `You: ${previewText}`,
              time,
              unread: 0,
              callEnded: false,
            }
          : contact,
      ),
      threads: {
        ...current.threads,
        [contactId]: {
          contactId,
          date: current.threads[contactId]?.date ?? formatThreadDate(now),
          messages: [...(current.threads[contactId]?.messages ?? []), nextMessage],
        },
      },
    }));
    setWorkspaceActivity((current) =>
      pushWorkspaceActivity(current, {
        name: contact?.name ?? "Messages",
        initials: contact?.initials ?? "MS",
        tone: contact?.tone ?? "slate",
        status: "online",
        action: attachments.length > 0 ? "Shared an attachment" : "Sent a message",
        detail: previewText,
      }),
    );

    if (mode === "remote") {
      try {
        const response = await fetch(`/api/messages/threads/${contactId}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content,
            attachments,
          }),
        });

        if (!response.ok) {
          const result = await readJsonSafely<{ error?: string }>(response);
          throw new Error(result?.error || "Failed to send message.");
        }

        setPayload(await fetchRemotePayload());
        setLoadError("");
      } catch (error) {
        setPayload(previous);
        setLoadError(error instanceof Error ? error.message : "Failed to send message.");
      }
    }
  }

  async function editMessage(contactId: string, messageId: string, content: string) {
    const previous = payload;

    setPayload((current) => {
      const nextThread = current.threads[contactId];

      if (!nextThread) {
        return current;
      }

      const nextMessages = nextThread.messages.map((message) =>
        message.id === messageId
          ? {
              ...message,
              content,
              edited: true,
            }
          : message,
      );
      const preview = getThreadPreview(nextMessages[nextMessages.length - 1]);

      return {
        ...current,
        contacts: current.contacts.map((contact) =>
          contact.id === contactId
            ? {
                ...contact,
                lastMessage: preview.lastMessage,
                time: preview.time,
                callEnded: preview.callEnded,
              }
            : contact,
        ),
        threads: {
          ...current.threads,
          [contactId]: {
            ...nextThread,
            messages: nextMessages,
          },
        },
      };
    });

    if (mode === "remote") {
      try {
        const response = await fetch(`/api/messages/threads/${contactId}/messages/${messageId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        });

        if (!response.ok) {
          const result = await readJsonSafely<{ error?: string }>(response);
          throw new Error(result?.error || "Failed to update message.");
        }

        setPayload(await fetchRemotePayload());
        setLoadError("");
      } catch (error) {
        setPayload(previous);
        setLoadError(error instanceof Error ? error.message : "Failed to update message.");
      }
    }
  }

  async function deleteMessage(contactId: string, messageId: string) {
    const previous = payload;

    setPayload((current) => {
      const nextThread = current.threads[contactId];

      if (!nextThread) {
        return current;
      }

      const nextMessages = nextThread.messages.filter((message) => message.id !== messageId);
      const preview = getThreadPreview(nextMessages[nextMessages.length - 1]);

      return {
        ...current,
        contacts: current.contacts.map((contact) =>
          contact.id === contactId
            ? {
                ...contact,
                lastMessage: preview.lastMessage,
                time: preview.time,
                callEnded: preview.callEnded,
              }
            : contact,
        ),
        threads: {
          ...current.threads,
          [contactId]: {
            ...nextThread,
            messages: nextMessages,
          },
        },
      };
    });

    if (mode === "remote") {
      try {
        const response = await fetch(`/api/messages/threads/${contactId}/messages/${messageId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const result = await readJsonSafely<{ error?: string }>(response);
          throw new Error(result?.error || "Failed to delete message.");
        }

        setPayload(await fetchRemotePayload());
        setLoadError("");
      } catch (error) {
        setPayload(previous);
        setLoadError(error instanceof Error ? error.message : "Failed to delete message.");
      }
    }
  }

  async function deleteThread(contactId: string) {
    const previous = payload;
    const nextVisibleContacts = visibleContacts.filter((contact) => contact.id !== contactId);

    setPayload((current) => {
      const nextContacts = current.contacts.filter((contact) => contact.id !== contactId);
      const nextThreads = { ...current.threads };
      delete nextThreads[contactId];

      return {
        ...current,
        contacts: nextContacts,
        threads: nextThreads,
      };
    });

    if (activeId === contactId) {
      setActiveId(nextVisibleContacts[0]?.id ?? "");
    }

    if (mode === "remote") {
      try {
        const response = await fetch(`/api/messages/threads/${contactId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const result = await readJsonSafely<{ error?: string }>(response);
          throw new Error(result?.error || "Failed to delete chat.");
        }

        setPayload(await fetchRemotePayload());
        setLoadError("");
      } catch (error) {
        setPayload(previous);
        setLoadError(error instanceof Error ? error.message : "Failed to delete chat.");
      }
    }
  }

  async function updateTypingState(contactId: string, isTyping: boolean) {
    if (mode !== "remote") {
      return;
    }

    try {
      await fetch(`/api/messages/threads/${contactId}/typing`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isTyping }),
      });
    } catch {
      // Typing state is best-effort only.
    }
  }

  async function createGroupChat(name: string, memberIds: string[]) {
    if (mode !== "remote") {
      setLoadError("Group chat creation requires a live workspace session.");
      return false;
    }

    setCreatingGroup(true);

    try {
      const response = await fetch("/api/messages/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          memberIds,
        }),
      });
      const result = await readJsonSafely<{
        data?: { contactId: string };
        error?: string;
      }>(response);

      if (!response.ok || !result?.data) {
        throw new Error(result?.error || "Failed to create group chat.");
      }

      const nextPayload = await fetchRemotePayload();
      setPayload(nextPayload);
      setLoadError("");
      setActiveId(result.data.contactId);
      setMeetingMode(null);
      setMeeting(null);
      setMeetingError("");
      setMobileView("thread");
      return true;
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to create group chat.");
      return false;
    } finally {
      setCreatingGroup(false);
    }
  }

  async function openMeeting(nextMode: "audio" | "video") {
    setMeetingMode(nextMode);
    setMeetingError("");

    if (!activeContact || mode !== "remote") {
      if (mode !== "remote") {
        setMeetingError("Calls require a live workspace session.");
      }
      return;
    }

    if (activeContact.isGroup) {
      setMeetingMode(null);
      setMeetingError("Calls are only available for direct chats.");
      return;
    }

    setMeetingLoading(true);

    try {
      const result = await fetchMeetingSession(activeContact.id);
      setMeeting(result);
      setMeetingError("");
    } catch (error) {
      const nextError = error instanceof Error ? error.message : "Failed to load meeting session.";
      setMeetingError(nextError);

      if (nextError.includes("removed from this meeting")) {
        setMeetingMode(null);
        setMeeting(null);
      }
    } finally {
      setMeetingLoading(false);
    }
  }

  async function refreshMeeting(contactId: string, options?: { silent?: boolean }) {
    if (mode !== "remote") {
      return;
    }

    if (!options?.silent) {
      setMeetingLoading(true);
    }

    try {
      const result = await fetchMeetingSession(contactId);
      setMeeting(result);
      setMeetingError("");
    } catch (error) {
      const nextError = error instanceof Error ? error.message : "Failed to refresh meeting session.";
      setMeetingError(nextError);

      if (nextError.includes("removed from this meeting")) {
        setMeetingMode(null);
        setMeeting(null);
      }
    } finally {
      if (!options?.silent) {
        setMeetingLoading(false);
      }
    }
  }

  async function sendMeetingMessage(content: string) {
    if (!activeContact || mode !== "remote") {
      return;
    }

    try {
      const response = await fetch(`/api/messages/threads/${activeContact.id}/meeting/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });
      const result = await readJsonSafely<{
        data?: ChatMeetingSession;
        error?: string;
      }>(response);

      if (!response.ok || !result?.data) {
        throw new Error(result?.error || "Failed to send meeting message.");
      }

      setMeeting(result.data);
      setMeetingError("");
    } catch (error) {
      setMeetingError(error instanceof Error ? error.message : "Failed to send meeting message.");
    }
  }

  async function addMeetingParticipantAction(participantId: string) {
    if (!activeContact || mode !== "remote") {
      return;
    }

    try {
      const response = await fetch(`/api/messages/threads/${activeContact.id}/meeting/participants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ participantId }),
      });
      const result = await readJsonSafely<{
        data?: ChatMeetingSession;
        error?: string;
      }>(response);

      if (!response.ok || !result?.data) {
        throw new Error(result?.error || "Failed to add participant.");
      }

      setMeeting(result.data);
      setMeetingError("");
    } catch (error) {
      setMeetingError(error instanceof Error ? error.message : "Failed to add participant.");
    }
  }

  async function updateMeetingControlsAction(patch: {
    micEnabled?: boolean;
    cameraEnabled?: boolean;
    speakerEnabled?: boolean;
    screenSharing?: boolean;
  }) {
    if (!activeContact || mode !== "remote") {
      return;
    }

    try {
      const response = await fetch(`/api/messages/threads/${activeContact.id}/meeting`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patch),
      });
      const result = await readJsonSafely<{
        data?: ChatMeetingSession;
        error?: string;
      }>(response);

      if (!response.ok || !result?.data) {
        throw new Error(result?.error || "Failed to update meeting controls.");
      }

      setMeeting(result.data);
      setMeetingError("");
    } catch (error) {
      setMeetingError(error instanceof Error ? error.message : "Failed to update meeting controls.");
    }
  }

  async function updateMeetingParticipantAction(
    participantId: string,
    patch: {
      micEnabled?: boolean;
      kicked?: boolean;
    },
  ) {
    if (!activeContact || mode !== "remote") {
      return;
    }

    try {
      const response = await fetch(`/api/messages/threads/${activeContact.id}/meeting/participants`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participantId,
          ...patch,
        }),
      });
      const result = await readJsonSafely<{
        data?: ChatMeetingSession;
        error?: string;
      }>(response);

      if (!response.ok || !result?.data) {
        throw new Error(result?.error || "Failed to update meeting participant.");
      }

      setMeeting(result.data);
      setMeetingError("");
    } catch (error) {
      setMeetingError(error instanceof Error ? error.message : "Failed to update meeting participant.");
    }
  }

  async function endMeeting() {
    if (!activeContact || mode !== "remote") {
      setMeetingMode(null);
      setMeeting(null);
      return;
    }

    try {
      const selfParticipant = meeting?.participants.find((participant) => participant.isCurrentUser) ?? null;
      const response = await fetch(`/api/messages/threads/${activeContact.id}/meeting`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selfParticipant?.isHost ? { ended: true } : { left: true }),
      });
      const result = await readJsonSafely<{ error?: string }>(response);

      if (!response.ok) {
        throw new Error(result?.error || (selfParticipant?.isHost ? "Failed to end meeting." : "Failed to leave meeting."));
      }

      setMeetingMode(null);
      setMeeting(null);
      setMeetingError("");
    } catch (error) {
      setMeetingError(error instanceof Error ? error.message : "Failed to end meeting.");
    }
  }

  useEffect(() => {
    if (!hydrated || mode !== "remote") {
      return;
    }

    let cancelled = false;
    const intervalId = window.setInterval(() => {
      void fetchRemotePayload()
        .then((result) => {
          if (!cancelled) {
            setPayload(result);
            setLoadError("");
          }
        })
        .catch((error) => {
          if (!cancelled) {
            setLoadError(error instanceof Error ? error.message : "Failed to refresh messages.");
          }
        });
    }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [hydrated, mode]);

  useEffect(() => {
    if (!hydrated || mode !== "remote" || !meetingMode || !activeContact || activeContact.isGroup) {
      return;
    }

    let cancelled = false;

    void refreshMeeting(activeContact.id);

    const intervalId = window.setInterval(() => {
      void fetchMeetingSession(activeContact.id)
        .then((result) => {
          if (!cancelled) {
            setMeeting(result);
            setMeetingError("");
          }
        })
        .catch((error) => {
          if (!cancelled) {
            setMeetingError(error instanceof Error ? error.message : "Failed to refresh meeting session.");
          }
        });
    }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [activeContact?.id, hydrated, meetingMode, mode]);

  if (!hydrated || mode === "loading") {
    return (
      <main className="bg-dashboard min-h-screen p-4 text-[var(--text-primary)] sm:p-6 lg:h-screen lg:overflow-hidden lg:p-0">
        <div className="flex w-full flex-col lg:h-full lg:flex-row">
          <PrimarySidebar />
          <div className="flex flex-1 overflow-hidden bg-[rgba(12,12,14,0.92)] lg:h-full lg:border-l lg:border-white/6">
            <div className="flex w-full items-center justify-center rounded-[var(--radius-xl)] border border-white/6 border-l-0 bg-[rgba(12,12,14,0.96)] lg:rounded-none">
              <AppLoader
                fullscreen={false}
                compact
                label="Loading messages"
                detail="Preparing your latest conversations"
                className="min-h-[calc(100vh-8rem)] w-full rounded-none border-0 lg:min-h-full"
              />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-dashboard min-h-screen p-4 text-[var(--text-primary)] sm:p-6 lg:h-screen lg:overflow-hidden lg:p-0">
      <div className="flex w-full flex-col lg:h-full lg:flex-row">
        <PrimarySidebar />
        <div className="flex flex-1 overflow-hidden bg-[rgba(12,12,14,0.92)] lg:h-full lg:border-l lg:border-white/6">
          <div className="flex w-full overflow-hidden rounded-[var(--radius-xl)] border border-white/6 border-l-0 bg-[rgba(12,12,14,0.96)] lg:h-full lg:rounded-none">
            <ChatsMenuSidebar
              activeId={activeId}
              contacts={navigableContacts}
              launchCandidates={launchCandidates}
              blockedContacts={blockedContacts}
              preferences={payload.preferences}
              hidden={Boolean(meetingMode)}
              mobileHidden={mobileView === "thread"}
              onSelect={(id) => {
                setActiveId(id);
                setMeetingMode(null);
                setMeeting(null);
                setMeetingError("");
                setMobileView("thread");
                const selectedContact = navigableContacts.find((contact) => contact.id === id);
                if (selectedContact?.archived || selectedContact?.hidden) {
                  void updateThread(id, { archived: false, hidden: false });
                }
              }}
              onUnblock={(id) => {
                void updateThread(id, { blocked: false });
              }}
              onPreferencesChange={(next) => {
                void updatePreferences(next);
              }}
              onCreateGroup={createGroupChat}
              creatingGroup={creatingGroup}
              canCreateGroups={workspaceMembers.length > 0}
            />

            <div
              className={cn(
                "min-h-0 flex-1 flex-col overflow-hidden bg-[linear-gradient(180deg,rgba(15,15,18,0.96)_0%,rgba(12,12,14,0.92)_100%)]",
                mobileView === "list" && !meetingMode ? "hidden lg:flex" : "flex",
                meetingMode && "border-t border-white/6 lg:border-t-0 lg:border-l",
              )}
            >
              {Boolean(meetingMode) && meetingRemoteMedia.length > 0 && (
                <div className="hidden">
                  {meetingRemoteMedia.map((entry) => (
                    <MediaStreamAudio key={entry.participantId} stream={entry.stream} />
                  ))}
                </div>
              )}
              {loadError && (
                <div className="border-b border-[var(--accent)]/20 bg-[var(--accent)]/8 px-6 py-2.5 text-[12px] text-[var(--accent)]">
                  {loadError}
                </div>
              )}
              {(meetingError || meetingTransportError) && (
                <div className="border-b border-[var(--accent)]/20 bg-[var(--accent)]/8 px-6 py-2.5 text-[12px] text-[var(--accent)]">
                  {meetingError || meetingTransportError}
                </div>
              )}
              {meetingMode === "video" && activeContact ? (
                <VideoCallModal
                  contact={activeContact}
                  meeting={meeting}
                  loading={meetingLoading}
                  error={meetingError}
                  localStream={meetingLocalStream}
                  remoteMediaById={meetingRemoteMediaById}
                  transportError={meetingTransportError}
                  onClose={() => setMeetingMode(null)}
                  onSendMessage={sendMeetingMessage}
                  onAddParticipant={addMeetingParticipantAction}
                  onToggleControls={updateMeetingControlsAction}
                  onUpdateParticipant={updateMeetingParticipantAction}
                  onEndCall={endMeeting}
                />
              ) : meetingMode === "audio" && activeContact ? (
                <AudioCallOverlay
                  contact={activeContact}
                  meeting={meeting}
                  loading={meetingLoading}
                  onClose={() => setMeetingMode(null)}
                  onToggleControls={updateMeetingControlsAction}
                  onEndCall={endMeeting}
                />
              ) : activeContact ? (
                <ChatView
                  contact={activeContact}
                  thread={activeThread}
                  meeting={meeting}
                  meetingLoading={meetingLoading}
                  showBackButton
                  onBack={() => setMobileView("list")}
                  onAudioCall={() => void openMeeting("audio")}
                  onVideoCall={() => void openMeeting("video")}
                  onSendMessage={(input) => sendMessage(activeContact.id, input)}
                  onTypingChange={updateTypingState}
                  onUpdateThread={updateThread}
                  onEditMessage={editMessage}
                  onDeleteMessage={deleteMessage}
                  onDeleteThread={deleteThread}
                />
              ) : (
                <EmptyState />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

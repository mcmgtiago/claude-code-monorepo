"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Archive, Check, ChevronDown, MessageSquareMore, Pin, Plus, Search, Settings, UserRound, Users, X } from "lucide-react";

import { Avatar } from "@/components/dashboard/avatar";
import { ModalCloseButton } from "@/components/ui/modal-close-button";
import { cn } from "@/lib/utils";
import type { ChatContact, ChatPreferences } from "@/data/chats";

export type ChatLaunchCandidate = {
  id: string;
  name: string;
  email?: string;
  role: string;
  initials: string;
  tone: ChatContact["tone"];
  available: boolean;
  contactId?: string;
};

type ChatSectionKey = "pinned" | "groups" | "people" | "archived";

const CHAT_DIRECTORY_WRAPPER_STYLES: Record<ChatSectionKey, string> = {
  pinned: "rounded-[var(--radius-xl)] border border-[var(--accent)]/10 bg-[linear-gradient(180deg,rgba(251,138,116,0.06)_0%,rgba(251,138,116,0.01)_100%)] p-2",
  groups: "rounded-[var(--radius-xl)] border border-[#9b8cff]/10 bg-[linear-gradient(180deg,rgba(155,140,255,0.06)_0%,rgba(155,140,255,0.01)_100%)] p-2",
  people: "rounded-[var(--radius-xl)] border border-[#74d7a7]/10 bg-[linear-gradient(180deg,rgba(116,215,167,0.06)_0%,rgba(116,215,167,0.01)_100%)] p-2",
  archived: "rounded-[var(--radius-xl)] border border-[#c59a6a]/10 bg-[linear-gradient(180deg,rgba(197,154,106,0.06)_0%,rgba(197,154,106,0.01)_100%)] p-2",
};

const CHAT_DIRECTORY_SECTION_COUNT_STYLES: Record<ChatSectionKey, string> = {
  pinned: "border-[var(--accent)]/20 bg-[var(--accent)]/12 text-[var(--accent-strong)]",
  groups: "border-[#9b8cff]/20 bg-[#9b8cff]/12 text-[#cabdff]",
  people: "border-[#74d7a7]/20 bg-[#74d7a7]/12 text-[#9ae5bd]",
  archived: "border-[#c59a6a]/20 bg-[#c59a6a]/10 text-[#d8b58c]",
};

const CHAT_DIRECTORY_SECTION_ICONS: Record<ChatSectionKey, React.ComponentType<{ className?: string }>> = {
  pinned: Pin,
  groups: Users,
  people: UserRound,
  archived: Archive,
};

const CHAT_DIRECTORY_SECTION_ICON_STYLES: Record<ChatSectionKey, string> = {
  pinned: "text-[var(--accent)]",
  groups: "text-[#cabdff]",
  people: "text-[#9ae5bd]",
  archived: "text-[#d8b58c]",
};

const CHAT_DIRECTORY_SECTION_BUTTON_CLASS_NAME =
  "flex w-full items-center justify-between px-2 py-1.5 text-left text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]";

const CHAT_DIRECTORY_LABEL_CLASS_NAME = "truncate font-medium whitespace-nowrap";

function ChatSectionAnimatedList({
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
        isOpen ? "mt-2 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0",
      )}
    >
      <div className="overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200",
        checked ? "bg-[var(--accent)]" : "bg-white/15",
      )}
    >
      <span
        className={cn(
          "absolute h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
          checked ? "translate-x-[22px]" : "translate-x-[4px]",
        )}
      />
    </button>
  );
}

function BlockedUsersModal({
  open,
  onClose,
  blockedContacts,
  onUnblock,
}: {
  open: boolean;
  onClose: () => void;
  blockedContacts: ChatContact[];
  onUnblock: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (open) {
      document.addEventListener("mousedown", handler);
    }

    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="modal-overlay-shell z-[70]">
      <div className="modal-overlay-backdrop" onClick={onClose} />
      <div
        ref={ref}
        className="modal-surface w-full max-w-md overflow-hidden border border-white/8 bg-[var(--panel-strong)] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
          <div>
            <h3 className="type-section-title font-semibold text-[var(--text-primary)]">Blocked Users</h3>
            <p className="mt-1 text-[12px] text-[var(--text-muted)]">
              Review and restore blocked conversations.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close blocked users"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-white/6 hover:text-[var(--text-primary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[420px] overflow-y-auto px-5 py-4">
          {blockedContacts.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.02] px-4 py-8 text-center">
              <div className="text-[24px] font-semibold text-[var(--text-primary)]">0</div>
              <p className="mt-2 text-[13px] text-[var(--text-muted)]">No blocked users.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {blockedContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.02] px-3 py-3"
                >
                  <Avatar initials={contact.initials} tone={contact.tone} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-[var(--text-primary)]">{contact.name}</p>
                    <p className="truncate text-[12px] text-[var(--text-muted)]">{contact.role}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUnblock(contact.id)}
                    className="rounded-[var(--radius-md)] border border-white/8 px-3 py-1.5 text-[12px] font-medium text-[var(--text-primary)] transition-colors hover:bg-white/6"
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PreferencesPanel({
  open,
  onClose,
  preferences,
  blockedContacts,
  onUnblock,
  onPreferencesChange,
}: {
  open: boolean;
  onClose: () => void;
  preferences: ChatPreferences;
  blockedContacts: ChatContact[];
  onUnblock: (id: string) => void;
  onPreferencesChange: (next: ChatPreferences) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [blockedUsersOpen, setBlockedUsersOpen] = useState(false);

  useEffect(() => {
    function handler(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (open) {
      document.addEventListener("mousedown", handler);
    }

    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const rows = [
    { label: "Active Status", key: "activeStatus" as const },
    { label: "Notifications Sound", key: "notifSound" as const },
    { label: "Do Not Disturb", key: "dnd" as const },
  ];

  return (
    <div
      ref={ref}
      className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-[var(--radius-xl)] border border-white/8 bg-[var(--panel-strong)] shadow-2xl"
    >
      <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
        <h3 className="type-section-title font-semibold text-[var(--text-primary)]">Preferences</h3>
        <button
          type="button"
          aria-label="Close preferences"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-white/6 hover:text-[var(--text-primary)]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {rows.map(({ label, key }, index) => (
        <div key={label}>
          <div className="flex items-center justify-between px-5 py-4">
            <span className="type-ui text-[var(--text-secondary)]">{label}</span>
            <Toggle
              checked={preferences[key]}
              onChange={(value) =>
                onPreferencesChange({
                  ...preferences,
                  [key]: value,
                })
              }
            />
          </div>
          {index < rows.length - 1 && <div className="mx-0 h-px bg-white/6" />}
        </div>
      ))}

      <div className="mx-0 h-px bg-white/6" />

      <div className="px-5 py-4">
        <button
          type="button"
          onClick={() => setBlockedUsersOpen(true)}
          className="flex w-full items-center justify-between rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.02] px-4 py-3 text-left transition-colors hover:bg-white/[0.05]"
        >
          <span className="text-[13px] font-semibold text-[var(--text-primary)]">Blocked Users</span>
          <span className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-secondary)]">
            {blockedContacts.length}
          </span>
        </button>
      </div>

      <BlockedUsersModal
        open={blockedUsersOpen}
        onClose={() => setBlockedUsersOpen(false)}
        blockedContacts={blockedContacts}
        onUnblock={(id) => {
          onUnblock(id);
        }}
      />
    </div>
  );
}

function NewChatModal({
  open,
  onClose,
  contacts,
  candidates,
  creatingGroup,
  canCreateGroups,
  onOpenChat,
  onCreateGroup,
}: {
  open: boolean;
  onClose: () => void;
  contacts: ChatContact[];
  candidates: ChatLaunchCandidate[];
  creatingGroup: boolean;
  canCreateGroups: boolean;
  onOpenChat: (contactId: string) => void;
  onCreateGroup: (name: string, memberIds: string[]) => Promise<boolean>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"direct" | "group">("direct");
  const [search, setSearch] = useState("");
  const [groupName, setGroupName] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    function handler(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (open) {
      document.addEventListener("mousedown", handler);
    }

    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setMode("direct");
      setSearch("");
      setGroupName("");
      setSelectedIds([]);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const directConversations = new Set(
    contacts
      .filter((contact) => !contact.isGroup)
      .flatMap((contact) => [
        contact.id,
        contact.email?.trim().toLowerCase() ?? "",
      ])
      .filter(Boolean),
  );
  const filteredContacts = candidates
    .filter((candidate) => {
      const query = search.trim().toLowerCase();

      if (!query) {
        return true;
      }

      return (
        candidate.name.toLowerCase().includes(query)
        || candidate.role.toLowerCase().includes(query)
        || (candidate.email ?? "").toLowerCase().includes(query)
      );
    })
    .sort((left, right) => {
      const leftExisting = Number(
        directConversations.has(left.contactId ?? "")
        || directConversations.has(left.email?.trim().toLowerCase() ?? ""),
      );
      const rightExisting = Number(
        directConversations.has(right.contactId ?? "")
        || directConversations.has(right.email?.trim().toLowerCase() ?? ""),
      );

      return (
        Number(right.available) - Number(left.available)
        || rightExisting - leftExisting
        || left.name.localeCompare(right.name)
      );
    });
  const canSubmitGroup = groupName.trim().length > 0 && selectedIds.length > 0 && !creatingGroup;

  return (
    <div className="modal-overlay-shell z-[70]">
      <div className="modal-overlay-backdrop" onClick={onClose} />
      <div
        ref={ref}
        className="modal-surface modal-surface-scroll relative w-full max-w-[560px] overflow-hidden border border-white/8 bg-[#18191d] p-5 shadow-2xl sm:p-8"
      >
        <ModalCloseButton absolute onClick={onClose} aria-label="Close new message modal" />

        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] border border-white/8 bg-white/5">
          {mode === "direct" ? (
            <MessageSquareMore className="h-5 w-5 text-[var(--text-secondary)]" />
          ) : (
            <Users className="h-5 w-5 text-[var(--text-secondary)]" />
          )}
        </div>

        <div>
          <div className="flex w-full items-start justify-between gap-4">
            <h2 className="min-w-0 flex-1 pr-4 text-[1.35rem] font-semibold tracking-tight text-[var(--text-primary)]">
              {mode === "direct" ? "New message" : "Create group"}
            </h2>
            <div className="shrink-0 rounded-[var(--radius-lg)] border border-white/8 bg-[var(--panel-muted)] p-1">
              <div className="flex items-center gap-1">
                {[
                  { id: "direct" as const, label: "Direct message" },
                  ...(canCreateGroups ? [{ id: "group" as const, label: "Group chat" }] : []),
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMode(item.id)}
                    className={cn(
                      "rounded-[10px] px-2.5 py-1.5 text-[11px] font-semibold transition-colors",
                      mode === item.id
                        ? "bg-[var(--accent)] text-white shadow-[0_10px_24px_rgba(251,138,116,0.18)]"
                        : "text-[var(--text-secondary)] hover:bg-white/[0.04]",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {mode === "group" && (
            <div className="rounded-[var(--radius-xl)] border border-white/8 bg-[var(--panel-muted)] px-5 py-4">
              <label className="block text-sm font-medium text-[var(--text-primary)]">Group name</label>
              <input
                type="text"
                value={groupName}
                onChange={(event) => setGroupName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && canSubmitGroup) {
                    event.preventDefault();
                    void onCreateGroup(groupName, selectedIds).then((created) => {
                      if (created) {
                        onClose();
                      }
                    });
                  }
                }}
                placeholder="Design sync squad"
                className="mt-3 w-full rounded-[var(--radius-lg)] border border-transparent bg-transparent px-0 py-0 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
              />
            </div>
          )}

          <div className="rounded-[var(--radius-xl)] border border-white/8 bg-[var(--panel-muted)] px-5 py-4">
            <div className="flex items-center gap-2.5">
              <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={mode === "direct" ? "Search contacts" : "Search members"}
                className="flex-1 bg-transparent text-sm text-[var(--text-secondary)] outline-none placeholder:text-[var(--text-muted)]"
                autoFocus
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-white/6 hover:text-[var(--text-primary)]"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
            <div className="mt-3 flex items-center justify-between text-[12px] text-[var(--text-muted)]">
              <span>
                {filteredContacts.length} result{filteredContacts.length !== 1 ? "s" : ""}
              </span>
              {mode === "group" ? (
                <span>{selectedIds.length} selected</span>
              ) : (
                <span>Available contacts first</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 max-h-[420px] space-y-2 overflow-y-auto pr-1">
          {filteredContacts.length === 0 ? (
            <div className="rounded-[var(--radius-xl)] border border-white/8 bg-[var(--panel-muted)] px-6 py-10 text-center">
              <p className="text-sm font-medium text-[var(--text-primary)]">No contacts found</p>
              <p className="mt-2 text-[13px] text-[var(--text-muted)]">
                Try a different name, role, or email search.
              </p>
            </div>
          ) : mode === "direct" ? (
            <div className="space-y-2">
              {filteredContacts.map((contact) => {
                const hasConversation = directConversations.has(contact.contactId ?? "")
                  || directConversations.has(contact.email?.trim().toLowerCase() ?? "");

                return (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => {
                    if (!contact.available || !contact.contactId) {
                      return;
                    }
                    onOpenChat(contact.contactId);
                    onClose();
                  }}
                  disabled={!contact.available || !contact.contactId}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-[var(--radius-xl)] border px-4 py-3.5 text-left transition",
                    contact.available
                      ? "border-white/8 bg-[var(--panel-muted)] hover:border-[var(--accent)]/25 hover:bg-white/[0.04]"
                      : "border-white/8 bg-white/[0.02] opacity-55",
                  )}
                >
                  <Avatar initials={contact.initials} tone={contact.tone} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[13px] font-semibold text-[var(--text-primary)]">{contact.name}</p>
                      {hasConversation ? (
                        <span className="rounded-full border border-[var(--accent)]/18 bg-[var(--accent)]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">
                          Existing chat
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 truncate text-[12px] text-[var(--text-muted)]">
                      {contact.email || contact.role}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[12px] font-medium text-[var(--text-secondary)]">
                      {contact.available ? "Open chat" : "Unavailable"}
                    </p>
                    <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                      {contact.available ? contact.role : "Not available in messages yet"}
                    </p>
                  </div>
                </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredContacts.map((contact) => {
                const selected = selectedIds.includes(contact.id);

                return (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => setSelectedIds((current) =>
                      selected
                        ? current.filter((id) => id !== contact.id)
                        : contact.available
                          ? [...current, contact.id]
                          : current,
                    )}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-[var(--radius-xl)] border px-4 py-3.5 text-left transition",
                      selected
                        ? "border-[var(--accent)]/35 bg-[var(--accent)]/10 shadow-[0_12px_30px_rgba(251,138,116,0.12)]"
                        : "border-white/8 bg-[var(--panel-muted)] hover:bg-white/[0.04]",
                      !contact.available && "cursor-not-allowed opacity-50",
                    )}
                  >
                    <Avatar initials={contact.initials} tone={contact.tone} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-[13px] font-semibold text-[var(--text-primary)]">{contact.name}</p>
                        {contact.available ? (
                          <span className="rounded-full border border-[#74d7a7]/18 bg-[#74d7a7]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9ae5bd]">
                            Available
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 truncate text-[12px] text-[var(--text-muted)]">
                        {contact.available ? (contact.email || contact.role) : "Not available in messages yet"}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold",
                        selected
                          ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                          : "border-white/10 text-transparent",
                      )}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {mode === "group" && (
          <div className="mt-5">
            <button
              type="button"
              disabled={!canSubmitGroup}
              onClick={async () => {
                const created = await onCreateGroup(groupName, selectedIds);
                if (created) {
                  onClose();
                }
              }}
              className="btn-base btn-primary flex w-full items-center justify-center gap-2 rounded-[var(--radius-lg)] py-[15px] text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Users className="h-4 w-4" />
              {creatingGroup ? "Creating group..." : "Create group chat"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ContactItem({
  contact,
  active,
  onClick,
}: {
  contact: ChatContact;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-[var(--radius-md)] border border-white/[0.04] px-3 py-2.5 text-left transition-colors",
        active
          ? "border-[var(--accent)]/30 bg-white/7 shadow-[0_10px_24px_rgba(0,0,0,0.14)]"
          : "bg-white/[0.03] hover:bg-white/[0.06]",
      )}
    >
      <Avatar
        initials={contact.initials}
        tone={contact.tone}
        size="md"
        status={contact.isGroup ? undefined : contact.status}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="type-label truncate font-semibold text-[var(--text-primary)]">
            {contact.name}
          </span>
          <span className="type-caption shrink-0 text-[var(--text-muted)]">
            {contact.time}
          </span>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span className={cn(
            "type-caption truncate",
            contact.typing
              ? "text-[var(--accent)]"
              : contact.callEnded
                ? "text-[var(--red)]"
                : "text-[var(--text-muted)]",
          )}>
            {contact.typing ? "Typing..." : contact.lastMessage}
          </span>
          {contact.unread && contact.unread > 0 ? (
            <span className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[0.55rem] font-bold text-white">
              {contact.unread}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}

function ContactSection({
  title,
  sectionKey,
  contacts,
  activeId,
  onSelect,
  emptyMessage,
  showWhenEmpty = false,
}: {
  title: string;
  sectionKey: ChatSectionKey;
  contacts: ChatContact[];
  activeId: string;
  onSelect: (id: string) => void;
  emptyMessage?: string;
  showWhenEmpty?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);

  if (!showWhenEmpty && contacts.length === 0) {
    return null;
  }

  const sectionId = `chat-directory-${sectionKey}`;
  const SectionIcon = CHAT_DIRECTORY_SECTION_ICONS[sectionKey];

  return (
    <div className={CHAT_DIRECTORY_WRAPPER_STYLES[sectionKey]}>
      <button
        type="button"
        onClick={() => setCollapsed((value) => !value)}
        aria-expanded={!collapsed}
        aria-controls={sectionId}
        className={CHAT_DIRECTORY_SECTION_BUTTON_CLASS_NAME}
      >
        <span className="flex items-center gap-2.5">
          <SectionIcon className={cn("h-4 w-4", CHAT_DIRECTORY_SECTION_ICON_STYLES[sectionKey])} />
          <span className={CHAT_DIRECTORY_LABEL_CLASS_NAME}>{title}</span>
        </span>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex min-w-[1.75rem] items-center justify-center rounded-full border px-2 py-0.5 text-[0.68rem] font-medium",
              CHAT_DIRECTORY_SECTION_COUNT_STYLES[sectionKey],
            )}
          >
            {contacts.length}
          </span>
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-300", collapsed && "-rotate-90")} />
        </div>
      </button>

      <ChatSectionAnimatedList isOpen={!collapsed} id={sectionId}>
        <div className="flex flex-col gap-1.5">
          {contacts.map((contact) => (
            <ContactItem
              key={contact.id}
              contact={contact}
              active={activeId === contact.id}
              onClick={() => onSelect(contact.id)}
            />
          ))}
          {contacts.length === 0 && emptyMessage ? (
            <div className="rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--text-muted)]">
              {emptyMessage}
            </div>
          ) : null}
        </div>
      </ChatSectionAnimatedList>
    </div>
  );
}

export function ChatsMenuSidebar({
  activeId,
  contacts,
  launchCandidates,
  blockedContacts,
  preferences,
  onSelect,
  onUnblock,
  onPreferencesChange,
  onCreateGroup,
  canCreateGroups = true,
  hidden = false,
  mobileHidden = false,
  creatingGroup = false,
}: {
  activeId: string;
  contacts: ChatContact[];
  launchCandidates: ChatLaunchCandidate[];
  blockedContacts: ChatContact[];
  preferences: ChatPreferences;
  onSelect: (id: string) => void;
  onUnblock: (id: string) => void;
  onPreferencesChange: (next: ChatPreferences) => void;
  onCreateGroup: (name: string, memberIds: string[]) => Promise<boolean>;
  canCreateGroups?: boolean;
  hidden?: boolean;
  mobileHidden?: boolean;
  creatingGroup?: boolean;
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredContacts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return contacts;
    }

    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(query) ||
        contact.role.toLowerCase().includes(query) ||
        contact.lastMessage.toLowerCase().includes(query),
    );
  }, [contacts, search]);

  const pinnedContacts = filteredContacts.filter((contact) => contact.pinned && !contact.archived && !contact.hidden);
  const groupContacts = filteredContacts.filter((contact) => contact.isGroup && !contact.pinned && !contact.archived && !contact.hidden);
  const peopleContacts = filteredContacts.filter((contact) => !contact.isGroup && !contact.pinned && !contact.archived && !contact.hidden);
  const archivedContacts = filteredContacts.filter((contact) => contact.archived && !contact.hidden);

  if (hidden) return null;

  return (
    <aside
      className={cn(
        "h-full w-full shrink-0 flex-col border-b border-white/6 bg-[var(--sidebar)] lg:w-[320px] lg:border-r lg:border-b-0",
        mobileHidden ? "hidden lg:flex" : "flex",
      )}
    >
      <div className="border-b border-white/6 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="type-page-title text-white">Messages</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="New chat"
              onClick={() => setComposerOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border border-white/8 bg-white/[0.03] text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
            >
              <Plus className="h-4 w-4" />
            </button>
            <div className="relative">
              <button
                type="button"
                aria-label="Chat settings"
                onClick={() => setSettingsOpen((value) => !value)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border border-white/8 bg-white/[0.03] text-[var(--text-muted)] transition hover:text-[var(--text-primary)]",
                  settingsOpen && "bg-white/8 text-[var(--text-primary)]",
                )}
              >
                <Settings className="h-4 w-4" />
              </button>
              <PreferencesPanel
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                preferences={preferences}
                blockedContacts={blockedContacts}
                onUnblock={onUnblock}
                onPreferencesChange={onPreferencesChange}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="flex items-center gap-2.5 rounded-[var(--radius-md)] border border-white/8 bg-white/[0.03] px-4 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search for a message"
            className="flex-1 bg-transparent text-[14px] text-[var(--text-secondary)] outline-none placeholder:text-[var(--text-muted)]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex flex-col gap-3">
          <ContactSection
            title="Pinned"
            sectionKey="pinned"
            contacts={pinnedContacts}
            activeId={activeId}
            onSelect={onSelect}
          />
          <ContactSection
            title="Groups"
            sectionKey="groups"
            contacts={groupContacts}
            activeId={activeId}
            onSelect={onSelect}
          />
          <ContactSection
            title="People"
            sectionKey="people"
            contacts={peopleContacts}
            activeId={activeId}
            onSelect={onSelect}
          />
          <ContactSection
            title="Archived"
            sectionKey="archived"
            contacts={archivedContacts}
            activeId={activeId}
            onSelect={onSelect}
            showWhenEmpty
            emptyMessage="No archived conversations yet."
          />
          {filteredContacts.length === 0 && (
            <div className="rounded-[var(--radius-xl)] border border-white/8 bg-white/[0.03] px-4 py-10 text-center text-[13px] text-[var(--text-muted)]">
              No conversations match your search.
            </div>
          )}
        </div>
      </div>

      <NewChatModal
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        contacts={contacts}
        candidates={launchCandidates}
        creatingGroup={creatingGroup}
        canCreateGroups={canCreateGroups}
        onOpenChat={onSelect}
        onCreateGroup={onCreateGroup}
      />
    </aside>
  );
}

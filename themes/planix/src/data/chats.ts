import type { AvatarTone } from "@/data/dashboard";

export type ChatAttachment = {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  dataUrl: string;
  kind: "image" | "file";
};

export type ChatStructuredMessageContent = {
  text?: string;
  attachments?: ChatAttachment[];
};

type StoredChatStructuredMessageContent = ChatStructuredMessageContent & {
  version: 1;
};

export type ChatMessageType = "text" | "missed-call" | "attachment";

export type ChatContact = {
  id: string;
  name: string;
  email?: string;
  initials: string;
  tone: AvatarTone;
  role: string;
  isGroup?: boolean;
  groupKind?: "workspace" | "team" | "custom";
  memberCount?: number;
  status: "online" | "busy" | "neutral";
  lastMessage: string;
  time: string;
  unread?: number;
  callEnded?: boolean;
  pinned?: boolean;
  muted?: boolean;
  restricted?: boolean;
  blocked?: boolean;
  archived?: boolean;
  hidden?: boolean;
  reported?: boolean;
  typing?: boolean;
  lastSeenAt?: string | null;
};

export type ChatMessage = {
  id: string;
  content: string;
  sender: "me" | "them";
  time: string;
  reactions?: string[];
  type: ChatMessageType;
  edited?: boolean;
  attachments?: ChatAttachment[];
};

export type ChatThread = {
  contactId: string;
  date: string;
  messages: ChatMessage[];
};

export type ChatMeetingParticipant = {
  id: string;
  name: string;
  initials: string;
  tone: AvatarTone;
  role: string;
  isHost: boolean;
  isCurrentUser?: boolean;
  micEnabled: boolean;
  cameraEnabled: boolean;
  speakerEnabled: boolean;
  screenSharing: boolean;
  joinedAt: string;
};

export type ChatMeetingCandidate = {
  id: string;
  name: string;
  initials: string;
  tone: AvatarTone;
  role: string;
};

export type ChatMeetingMessage = {
  id: string;
  senderId: string;
  sender: string;
  initials: string;
  tone: AvatarTone;
  content: string;
  time: string;
  isMe: boolean;
};

export type ChatMeetingSignalType = "offer" | "answer" | "ice-candidate";

export type ChatMeetingSignalEnvelope = {
  id: string;
  meetingId: string;
  senderUserId: string;
  targetUserId: string;
  type: ChatMeetingSignalType;
  payload: Record<string, unknown>;
  createdAt: string;
};

export type ChatMeetingSession = {
  id: string;
  title: string;
  status: "active" | "ended";
  startedAt: string;
  endedAt?: string | null;
  participants: ChatMeetingParticipant[];
  availableParticipants: ChatMeetingCandidate[];
  messages: ChatMeetingMessage[];
};

export type ChatPreferences = {
  activeStatus: boolean;
  notifSound: boolean;
  dnd: boolean;
};

export type MessagesPayload = {
  contacts: ChatContact[];
  threads: Record<string, ChatThread>;
  preferences: ChatPreferences;
};

export const defaultChatPreferences: ChatPreferences = {
  activeStatus: true,
  notifSound: false,
  dnd: false,
};

export const pinnedContacts: ChatContact[] = [];

export const peopleContacts: ChatContact[] = [];

export const chatThreads: Record<string, ChatThread> = {};

export function buildStructuredChatMessageContent(payload: ChatStructuredMessageContent) {
  return JSON.stringify({
    version: 1,
    text: payload.text?.trim() || undefined,
    attachments: payload.attachments?.length ? payload.attachments : undefined,
  } satisfies StoredChatStructuredMessageContent);
}

export function parseStructuredChatMessageContent(value: string) {
  try {
    const parsed = JSON.parse(value) as StoredChatStructuredMessageContent;

    if (parsed?.version !== 1) {
      return null;
    }

    return {
      text: parsed.text?.trim() || "",
      attachments: parsed.attachments?.filter((attachment) =>
        Boolean(
          attachment
          && attachment.id
          && attachment.name
          && attachment.mimeType
          && typeof attachment.sizeBytes === "number"
          && attachment.dataUrl,
        ),
      ) ?? [],
    } satisfies ChatStructuredMessageContent;
  } catch {
    return null;
  }
}

export function summarizeChatAttachments(attachments: ChatAttachment[]) {
  if (attachments.length === 0) {
    return "";
  }

  const imageCount = attachments.filter((attachment) => attachment.kind === "image").length;

  if (attachments.length === 1) {
    return imageCount === 1 ? "Image" : "Attachment";
  }

  if (imageCount === attachments.length) {
    return `${attachments.length} images`;
  }

  return `${attachments.length} attachments`;
}

export function getChatMessagePreviewText(type: ChatMessageType, value: string) {
  if (type !== "attachment") {
    return value;
  }

  const parsed = parseStructuredChatMessageContent(value);

  if (!parsed) {
    return value;
  }

  return parsed.text || summarizeChatAttachments(parsed.attachments ?? []);
}

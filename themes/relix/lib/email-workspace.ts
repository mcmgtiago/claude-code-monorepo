import { format } from "date-fns";
import { normalizeEmailText, wrapEmailTextAsHtml } from "@/lib/email-content";
import { parseEmailAttachments, type EmailAttachmentMeta } from "@/lib/email-attachments";
import { splitEmailList, titleCaseFromEmail } from "@/lib/email-threading";

const bounceSubjectPattern = /undeliver|delivery[ -]status|failure notice|returned mail|mail delivery subsystem|couldn'?t be delivered|delivery has failed/i;
const bounceSenderPattern = /(mailer-daemon|postmaster|mail delivery subsystem)/i;

type DbMessage = {
  id: string;
  direction: string;
  subject: string;
  fromEmail: string;
  toEmail: string | null;
  ccEmail?: string | null;
  bccEmail?: string | null;
  body?: string | null;
  bodyHtml?: string | null;
  readAt: Date | string | null;
  attachmentsJson?: string | null;
  openedAt: Date | string | null;
  clickedAt: Date | string | null;
  clickCount: number;
  bouncedAt: Date | string | null;
  sentAt: Date | string;
};

type DbThread = {
  id: string;
  subject: string;
  fromName: string | null;
  fromEmail: string;
  toEmail: string | null;
  ccEmail?: string | null;
  bccEmail?: string | null;
  snippet: string | null;
  createdAt?: Date | string;
  starredAt?: Date | string | null;
  trashedAt?: Date | string | null;
  lastMessageAt: Date | string;
  messages: DbMessage[];
};

export const emailWorkspaceThreadSelect = {
  id: true,
  subject: true,
  fromName: true,
  fromEmail: true,
  toEmail: true,
  ccEmail: true,
  bccEmail: true,
  snippet: true,
  createdAt: true,
  starredAt: true,
  trashedAt: true,
  lastMessageAt: true,
  messages: {
    orderBy: {
      sentAt: "asc" as const
    },
    select: {
      id: true,
      direction: true,
      subject: true,
      fromEmail: true,
      toEmail: true,
      ccEmail: true,
      bccEmail: true,
      body: true,
      bodyHtml: true,
      readAt: true,
      attachmentsJson: true,
      openedAt: true,
      clickedAt: true,
      clickCount: true,
      bouncedAt: true,
      sentAt: true
    }
  }
} as const;

export const emailWorkspaceThreadListSelect = {
  id: true,
  subject: true,
  fromName: true,
  fromEmail: true,
  toEmail: true,
  ccEmail: true,
  bccEmail: true,
  snippet: true,
  createdAt: true,
  starredAt: true,
  trashedAt: true,
  lastMessageAt: true,
  messages: {
    orderBy: {
      sentAt: "asc" as const
    },
    select: {
      id: true,
      direction: true,
      subject: true,
      fromEmail: true,
      toEmail: true,
      ccEmail: true,
      bccEmail: true,
      readAt: true,
      openedAt: true,
      clickedAt: true,
      clickCount: true,
      bouncedAt: true,
      sentAt: true
    }
  }
} as const;

export type EmailWorkspaceMessage = {
  id: string;
  direction: "inbound" | "outbound";
  fromName: string;
  fromEmail: string;
  toName: string;
  toEmail: string;
  ccEmail: string;
  bccEmail: string;
  readAt: string | null;
  body: string;
  bodyHtml: string;
  rawBody: string;
  rawBodyHtml: string;
  attachments: EmailAttachmentMeta[];
  sentAt: string;
  sentAtValue: number;
};

export type EmailWorkspaceThread = {
  id: string;
  recipient: string;
  recipientEmail: string;
  subject: string;
  statuses: string[];
  sentLabel: string;
  sequence: string;
  preview: string;
  messages: EmailWorkspaceMessage[];
  mailbox: "inbox" | "sent" | "junk" | "trash";
  baseMailbox: "inbox" | "sent" | "junk";
  starred: boolean;
  trashed: boolean;
  lastMessageAtValue: number;
  latestDirection: "inbound" | "outbound";
  messageCount: number;
  unreadCount: number;
};

function isLikelyJunkThread(input: { subject: string; recipientEmail: string; preview: string; latestDirection?: "inbound" | "outbound" }) {
  if (input.latestDirection === "outbound") {
    return false;
  }

  if (isBounceNoticeThread(input)) {
    return false;
  }

  // Only check sender email and subject — body preview has too many false positives
  // (e.g. "invoice", "offer", "sale" are common in legitimate business emails)
  const haystack = `${input.subject} ${input.recipientEmail}`.toLowerCase();

  return /\b(unsubscribe|newsletter|mailer-daemon|postmaster|noreply|no-reply)\b/i.test(haystack);
}

function isBounceNoticeThread(input: { subject: string; recipientEmail: string }) {
  return bounceSubjectPattern.test(input.subject) || bounceSenderPattern.test(input.recipientEmail);
}

function firstEmail(value: string | null | undefined) {
  return splitEmailList(value)[0] || "";
}

function initialsFromEmail(email: string) {
  const [namePart] = email.split("@");
  const parts = namePart.split(/[._-]+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  }

  return namePart.slice(0, 2).toUpperCase();
}

function mapDbThread(thread: DbThread): EmailWorkspaceThread {
  const sortedMessages = [...thread.messages].sort((left, right) => new Date(left.sentAt).getTime() - new Date(right.sentAt).getTime());
  const senderEmail = thread.fromEmail;
  const senderName = thread.fromName || "Relix CRM";
  const lastDate = new Date(thread.lastMessageAt);
  const latestMessage = sortedMessages.at(-1);
  const latestInbound = [...sortedMessages].reverse().find((message) => message.direction === "inbound");
  const latestOutbound = [...sortedMessages].reverse().find((message) => message.direction === "outbound");
  const recipientEmail =
    latestInbound?.fromEmail ||
    firstEmail(latestOutbound?.toEmail) ||
    firstEmail(thread.toEmail) ||
    thread.fromEmail;
  const recipientName = latestInbound
    ? thread.fromName || titleCaseFromEmail(recipientEmail)
    : titleCaseFromEmail(recipientEmail);
  const previewText = normalizeEmailText(thread.snippet || sortedMessages.at(-1)?.body || "No preview available.") || "No preview available.";
  const baseMailbox = isLikelyJunkThread({
    subject: thread.subject,
    recipientEmail,
    preview: previewText,
    latestDirection: latestMessage?.direction === "inbound" ? "inbound" : "outbound"
  })
    ? "junk"
    : latestInbound
      ? "inbox"
      : "sent";
  const isBounceNotice = latestInbound
    ? isBounceNoticeThread({
        subject: thread.subject,
        recipientEmail
      })
    : false;
  const trashed = Boolean(thread.trashedAt);
  const starred = Boolean(thread.starredAt);
  const mailbox = trashed ? "trash" : baseMailbox;
  const statuses = Array.from(
    new Set([
      baseMailbox === "junk" ? "Junk" : null,
      isBounceNotice ? "Bounced" : null,
      latestOutbound?.bouncedAt ? "Bounced" : null,
      latestOutbound?.clickedAt ? "Clicked" : null,
      latestOutbound?.openedAt ? "Opened" : null,
      latestOutbound ? "Sent" : null,
      latestInbound && latestOutbound ? "Replied" : null,
      latestInbound && !latestOutbound ? "Received" : null
    ].filter(Boolean) as string[])
  );
  const unreadCount = sortedMessages.filter((message) => message.direction === "inbound" && !message.readAt).length;

  return {
    id: thread.id,
    recipient: recipientName,
    recipientEmail,
    subject: thread.subject,
    statuses,
    sentLabel: format(lastDate, "d MMM, yyyy"),
    sequence: "CRM Follow-up",
    preview: previewText,
    messages: sortedMessages.map((message) => {
      const rawBody = message.body || "";
      const rawBodyHtml = message.bodyHtml?.trim() || "";
      const normalizedBody = normalizeEmailText(rawBody);

      return {
        id: message.id,
        direction: message.direction === "outbound" ? "outbound" : "inbound",
        fromName:
          message.direction === "outbound"
            ? senderName
            : thread.fromName || titleCaseFromEmail(message.fromEmail),
        fromEmail: message.fromEmail,
        toName: message.direction === "outbound" ? recipientName : senderName,
        toEmail: message.toEmail || senderEmail,
        ccEmail: message.ccEmail || "",
        bccEmail: message.bccEmail || "",
        readAt: message.readAt ? new Date(message.readAt).toISOString() : null,
        body: normalizedBody,
        bodyHtml: rawBodyHtml || (normalizedBody ? wrapEmailTextAsHtml(normalizedBody) : ""),
        rawBody,
        rawBodyHtml,
        attachments: parseEmailAttachments(message.attachmentsJson),
        sentAt: format(new Date(message.sentAt), "d MMM, yyyy • h:mm a"),
        sentAtValue: new Date(message.sentAt).getTime()
      };
    }),
    mailbox,
    baseMailbox,
    starred,
    trashed,
    lastMessageAtValue: lastDate.getTime(),
    latestDirection: latestMessage?.direction === "inbound" ? "inbound" : "outbound",
    messageCount: sortedMessages.length,
    unreadCount
  };
}

export function getEmailWorkspaceThreads(dbThreads: DbThread[]) {
  return dbThreads.map(mapDbThread);
}

export function statusTone(status: string) {
  switch (status) {
    case "Replied":
      return "border-[#f9c266] bg-[#fff7e7] text-[#e49a1f]";
    case "Bounced":
      return "border-[#ff9c89] bg-[#fff1ec] text-[#f0643f]";
    case "Sent":
      return "border-[#52d39d] bg-[#eefbf5] text-[#18b46f]";
    case "Opened":
      return "border-[#68a0ff] bg-[#eef4ff] text-[#386df4]";
    case "Scheduled":
      return "border-slate-300 bg-slate-50 text-slate-500";
    case "Clicked":
      return "border-[#68a0ff] bg-[#eef4ff] text-[#386df4]";
    case "Received":
      return "border-[#cfd8e6] bg-[#f8fafc] text-slate-600";
    case "Junk":
      return "border-[#ead9ff] bg-[#f7f0ff] text-[#7c57c7]";
    default:
      return "border-slate-200 bg-slate-50 text-slate-500";
  }
}

export function avatarInitials(name: string, email: string) {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  }

  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return initialsFromEmail(email);
}

"use client";

import { AppSelect } from "@/components/app-select";
import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowUpDown,
  Bold,
  Check,
  ClipboardList,
  Clock3,
  Copy,
  Download,
  FileText,
  Forward,
  Inbox,
  Italic,
  MailWarning,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Mail,
  MailPlus,
  MessagesSquare,
  Paperclip,
  PenLine,
  RefreshCw,
  Reply,
  RotateCcw,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  Star,
  Trash2,
  Underline,
  X
} from "lucide-react";
import { Card } from "@/components/card";
import { useConfirmAction } from "@/components/confirm-action-modal";
import { FeedbackToast } from "@/components/feedback-toast";
import { useCommandKFocus } from "@/components/search-hotkey";
import { SelectionCheckbox } from "@/components/selection-checkbox";
import { ToggleSwitch } from "@/components/toggle-switch";
import {
  avatarInitials,
  getEmailWorkspaceThreads,
  statusTone,
  type EmailWorkspaceMessage,
  type EmailWorkspaceThread
} from "@/lib/email-workspace";
import { paginateItems } from "@/lib/pagination";

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/20 hover:border-slate-300";
const filterOptionIconClassName = "h-4 w-4 text-slate-400";

type MailboxKey = "inbox" | "sent" | "drafts" | "junk" | "starred" | "trash" | "all";
type MessageOrder = "newest" | "oldest";

type Filters = {
  status: string;
  sequence: string;
  readState: "all" | "read" | "unread";
};

type DraftEmail = {
  id: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  message: string;
  html: string;
  updatedAt: string;
};

type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  html: string;
  updatedAt: string;
};

type EmailSignature = {
  id: string;
  name: string;
  html: string;
  updatedAt: string;
};

type HtmlPreviewFitState = {
  contentHeight: number;
  contentWidth: number;
  frameHeight: number;
  scale: number;
};

type FeedbackState = {
  tone: "success" | "error";
  message: string;
};

type MailSetupState = {
  hasPersonalMailbox: boolean;
  canSendEmail: boolean;
  canSyncEmail: boolean;
  googleAuthAvailable: boolean;
};

type RelatedCrmLead = {
  id: string;
  name: string;
  status: string;
  email: string | null;
  company: string | null;
  contactId: string | null;
  contactName: string | null;
};

type RelatedCrmContact = {
  id: string;
  fullName: string;
  email: string | null;
  title: string | null;
  companyId: string | null;
  companyName: string | null;
};

type ThreadCrmLinksResponse = {
  contacts: RelatedCrmContact[];
  leads: RelatedCrmLead[];
  context: {
    participantEmails: string[];
  };
};

type MailSetupPrompt = "compose" | "sync" | null;

type ComposeAiAction = "write" | "rephrase" | "analyze";

type ComposeState =
  | {
      mode: "new" | "reply" | "forward" | "draft";
      draftId?: string;
      prefill?: {
        to?: string;
        cc?: string;
        bcc?: string;
        subject?: string;
        message?: string;
        html?: string;
      };
    }
  | null;

type ThreadApiResponse = Array<{
  id: string;
  subject: string;
  fromName: string | null;
  fromEmail: string;
  toEmail: string | null;
  ccEmail: string | null;
  bccEmail: string | null;
  snippet: string | null;
  starredAt: string | null;
  trashedAt: string | null;
  lastMessageAt: string;
  messages: Array<{
    id: string;
    direction: string;
    subject: string;
    fromEmail: string;
    toEmail: string | null;
    ccEmail: string | null;
    bccEmail: string | null;
    body?: string | null;
    bodyHtml?: string | null;
    attachmentsJson?: string | null;
    readAt: string | null;
    openedAt: string | null;
    clickedAt: string | null;
    clickCount: number;
    bouncedAt: string | null;
    sentAt: string;
  }>;
}>;

type ThreadReadOverride = {
  shouldMarkRead: boolean;
  readAt: string | null;
};

const draftStorageKey = "email_drafts_v1";
const templateStorageKey = "email_templates_v1";
const signatureStorageKey = "email_signature_html_v1";
const signatureAppendStorageKey = "email_signature_append_enabled_v1";
const signaturesStorageKey = "email_signatures_v1";
const activeSignatureIdStorageKey = "email_signature_active_id_v1";

async function parseJson<T>(response: Response) {
  const payload = (await response.json().catch(() => null)) as T | { error?: string } | null;

  if (!response.ok) {
    throw new Error((payload as { error?: string } | null)?.error || "Request failed");
  }

  return payload as T;
}

function threadMatchesReadState(thread: EmailWorkspaceThread, shouldMarkRead: boolean) {
  const inboundMessages = thread.messages.filter((message) => message.direction === "inbound");

  if (!inboundMessages.length) {
    return true;
  }

  return shouldMarkRead
    ? inboundMessages.every((message) => Boolean(message.readAt))
    : inboundMessages.every((message) => !message.readAt);
}

function applyThreadReadOverride(thread: EmailWorkspaceThread, override: ThreadReadOverride) {
  const overrideReadAt = override.readAt || new Date().toISOString();
  let changed = false;

  const messages = thread.messages.map((message) => {
    if (message.direction !== "inbound") {
      return message;
    }

    if (override.shouldMarkRead) {
      if (message.readAt) {
        return message;
      }

      changed = true;
      return {
        ...message,
        readAt: overrideReadAt
      };
    }

    if (!message.readAt) {
      return message;
    }

    changed = true;
    return {
      ...message,
      readAt: null
    };
  });

  if (!changed) {
    return thread;
  }

  return {
    ...thread,
    messages,
    unreadCount: messages.filter((message) => message.direction === "inbound" && !message.readAt).length
  };
}

function threadNeedsReadOverride(thread: EmailWorkspaceThread, override: ThreadReadOverride) {
  return thread.messages.some((message) => {
    if (message.direction !== "inbound") {
      return false;
    }

    return override.shouldMarkRead ? !message.readAt : Boolean(message.readAt);
  });
}

function mergeThreadsWithReadOverrides(threads: EmailWorkspaceThread[], overrides: Map<string, ThreadReadOverride>) {
  return threads.map((thread) => {
    const override = overrides.get(thread.id);

    if (!override) {
      return thread;
    }

    if (threadMatchesReadState(thread, override.shouldMarkRead)) {
      overrides.delete(thread.id);
      return thread;
    }

    return applyThreadReadOverride(thread, override);
  });
}

function threadHasLoadedMessageBodies(thread: EmailWorkspaceThread) {
  return thread.messages.some((message) => Boolean(message.rawBody || message.rawBodyHtml || message.body || message.bodyHtml || message.attachments.length));
}

function mergeThreadSummaryWithDetail(summary: EmailWorkspaceThread, detail: EmailWorkspaceThread) {
  const detailedMessages = new Map(detail.messages.map((message) => [message.id, message]));

  return {
    ...summary,
    messages: summary.messages.map((message) => {
      const detailedMessage = detailedMessages.get(message.id);

      if (!detailedMessage) {
        return message;
      }

      return {
        ...message,
        body: detailedMessage.body,
        bodyHtml: detailedMessage.bodyHtml,
        rawBody: detailedMessage.rawBody,
        rawBodyHtml: detailedMessage.rawBodyHtml,
        attachments: detailedMessage.attachments
      };
    })
  };
}

function hasSameThreadMessageSet(left: EmailWorkspaceThread, right: EmailWorkspaceThread) {
  if (left.messages.length !== right.messages.length) {
    return false;
  }

  const rightMessageIds = new Set(right.messages.map((message) => message.id));
  return left.messages.every((message) => rightMessageIds.has(message.id));
}

function preserveLoadedThreadDetails(
  summaries: EmailWorkspaceThread[],
  currentThreads: EmailWorkspaceThread[],
  detailedThreadIds: Set<string>
) {
  const currentById = new Map(currentThreads.map((thread) => [thread.id, thread]));

  return summaries.map((summary) => {
    const current = currentById.get(summary.id);
    return current && detailedThreadIds.has(summary.id) && hasSameThreadMessageSet(summary, current)
      ? mergeThreadSummaryWithDetail(summary, current)
      : summary;
  });
}

function emptyFilters(): Filters {
  return {
    status: "all",
    sequence: "all",
    readState: "all"
  };
}

function mailboxIconFor(key: MailboxKey) {
  switch (key) {
    case "inbox":
      return Inbox;
    case "sent":
      return Send;
    case "drafts":
      return FileText;
    case "junk":
      return MailWarning;
    case "starred":
      return Star;
    case "trash":
      return Trash2;
    case "all":
      return MailPlus;
    default:
      return Inbox;
  }
}

function getPlainTextFromHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li\b[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .trim();
}

function toEditorHtml(message: string) {
  if (!message.trim()) {
    return "<p><br></p>";
  }

  return message
    .split(/\n{2,}/)
    .map((block) => `<p>${block.replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

function formatDraftTimestamp(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatDraftRecipients(draft: DraftEmail) {
  return [
    draft.to ? `To ${draft.to}` : "recipient not set",
    draft.cc ? `Cc ${draft.cc}` : null,
    draft.bcc ? `Bcc ${draft.bcc}` : null
  ]
    .filter(Boolean)
    .join(" • ");
}

function prefixSubject(prefix: string, subject: string) {
  return subject.startsWith(prefix) ? subject : `${prefix}${subject}`;
}

function sanitizeMessageHtml(html: string) {
  return html
    .replace(/<!doctype[^>]*>/gi, "")
    .replace(/<html[\s\S]*?<body[^>]*>/gi, "")
    .replace(/<\/body>[\s\S]*?<\/html>/gi, "")
    .replace(/<head[\s\S]*?<\/head>/gi, "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

const richHtmlPreviewClassName =
  "text-slate-700 [&_a]:break-all [&_a]:text-[#386df4] [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-slate-200 [&_blockquote]:pl-4 [&_img]:max-w-full [&_li]:ml-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-slate-900 [&_pre]:p-4 [&_pre]:text-slate-100 [&_strong]:font-semibold [&_table]:max-w-full [&_ul]:list-disc [&_ul]:pl-5";

function FittedHtmlPreview({
  html,
  emptyHtml,
  minHeight = 160,
  maxHeight = 520,
  heightViewportRatio = 0.4,
  fitMode = "contain",
  containerClassName = "",
  viewportClassName = "",
  contentClassName = ""
}: {
  html: string;
  emptyHtml: string;
  minHeight?: number;
  maxHeight?: number;
  heightViewportRatio?: number;
  fitMode?: "adaptive" | "contain";
  containerClassName?: string;
  viewportClassName?: string;
  contentClassName?: string;
}) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const sanitizedHtml = useMemo(() => sanitizeMessageHtml(html) || emptyHtml, [emptyHtml, html]);
  const [fitState, setFitState] = useState<HtmlPreviewFitState>({
    contentHeight: minHeight,
    contentWidth: 0,
    frameHeight: minHeight,
    scale: 1
  });

  useEffect(() => {
    let frameId = 0;

    const measure = () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }

      frameId = requestAnimationFrame(() => {
        const viewport = viewportRef.current;
        const stage = stageRef.current;
        const content = contentRef.current;

        if (!viewport || !stage || !content) {
          return;
        }

        const preferredHeightLimit = typeof window === "undefined" ? maxHeight : Math.min(window.innerHeight * heightViewportRatio, maxHeight);
        const frameHeight = Math.max(minHeight, preferredHeightLimit);
        const availableWidth = Math.max(stage.clientWidth, 1);
        const availableHeight = Math.max(stage.clientHeight, 1);
        const naturalWidth = Math.max(content.scrollWidth, 1);
        const naturalHeight = Math.max(content.scrollHeight, 1);
        const scale =
          fitMode === "contain"
            ? Math.min(1, availableWidth / naturalWidth, availableHeight / naturalHeight)
            : Math.min(1, availableWidth / naturalWidth);

        setFitState((current) => {
          if (
            Math.abs(current.scale - scale) < 0.01 &&
            Math.abs(current.frameHeight - frameHeight) < 1 &&
            Math.abs(current.contentWidth - naturalWidth) < 1 &&
            Math.abs(current.contentHeight - naturalHeight) < 1
          ) {
            return current;
          }

          return {
            contentHeight: naturalHeight,
            contentWidth: naturalWidth,
            frameHeight,
            scale
          };
        });
      });
    };

    measure();

    if (typeof window === "undefined") {
      return () => {
        if (frameId) {
          cancelAnimationFrame(frameId);
        }
      };
    }

    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => measure());

    if (resizeObserver) {
      if (viewportRef.current) {
        resizeObserver.observe(viewportRef.current);
      }
      if (stageRef.current) {
        resizeObserver.observe(stageRef.current);
      }
      if (contentRef.current) {
        resizeObserver.observe(contentRef.current);
      }
    }

    const handleWindowResize = () => measure();
    window.addEventListener("resize", handleWindowResize);

    const images = Array.from(contentRef.current?.querySelectorAll("img") ?? []);
    for (const image of images) {
      image.addEventListener("load", measure);
      image.addEventListener("error", measure);
    }

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      resizeObserver?.disconnect();
      window.removeEventListener("resize", handleWindowResize);
      for (const image of images) {
        image.removeEventListener("load", measure);
        image.removeEventListener("error", measure);
      }
    };
  }, [fitMode, heightViewportRatio, maxHeight, minHeight, sanitizedHtml]);

  return (
    <div className={["overflow-hidden rounded-2xl border border-slate-200 bg-white", containerClassName].filter(Boolean).join(" ")}>
      <div
        ref={viewportRef}
        className={["overflow-hidden p-4", viewportClassName].filter(Boolean).join(" ")}
        style={{ height: `${fitState.frameHeight}px` }}
      >
        <div ref={stageRef} className="flex h-full w-full items-start justify-center overflow-hidden">
          <div
            style={{
              height: `${Math.max(1, fitState.contentHeight * fitState.scale)}px`,
              width: fitState.contentWidth ? `${Math.max(1, fitState.contentWidth * fitState.scale)}px` : "100%"
            }}
          >
            <div
              ref={contentRef}
              className={[richHtmlPreviewClassName, contentClassName].filter(Boolean).join(" ")}
              style={{
                width: fitState.contentWidth ? `${fitState.contentWidth}px` : undefined,
                transform: fitState.scale < 0.999 ? `scale(${fitState.scale})` : undefined,
                transformOrigin: "top left"
              }}
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function HtmlIframePreview({
  html,
  emptyHtml,
  minHeight = 220,
  maxHeight = 620,
  heightViewportRatio = 0.52,
  containerClassName = ""
}: {
  html: string;
  emptyHtml: string;
  minHeight?: number;
  maxHeight?: number;
  heightViewportRatio?: number;
  containerClassName?: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const previewDocument = useMemo(() => {
    const content = html.trim() || emptyHtml;
    const baseStyle = [
      "<style>",
      "body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #222; line-height: 1.5; }",
      "img { max-width: 100%; height: auto; }",
      "img[src^=\"cid:\"], img[data-email-image-broken=\"true\"] { display: none !important; }",
      "</style>"
    ].join("");
    
    if (content.toLowerCase().includes("<head>")) {
      return content.replace(/<head>/i, `<head>${baseStyle}`);
    }
    
    if (content.toLowerCase().includes("<body>")) {
      return content.replace(/<body>/i, `<body>${baseStyle}`);
    }
    
    return `${baseStyle}${content}`;
  }, [emptyHtml, html]);
  const [frameHeight, setFrameHeight] = useState(minHeight);

  useEffect(() => {
    const iframe = iframeRef.current;

    if (!iframe) {
      return;
    }

    let frameId = 0;

    const normalizeImages = () => {
      const document = iframe.contentDocument;

      if (!document) {
        return;
      }

      const images = Array.from(document.querySelectorAll("img"));

      for (const image of images) {
        const rawSrc = image.getAttribute("src") || "";

        if (rawSrc.startsWith("//")) {
          image.setAttribute("src", `https:${rawSrc}`);
        }

        if (rawSrc.toLowerCase().startsWith("cid:")) {
          image.setAttribute("data-email-image-broken", "true");
          continue;
        }

        image.addEventListener(
          "error",
          () => {
            image.setAttribute("data-email-image-broken", "true");
            measure();
          },
          { once: true }
        );
      }
    };

    const normalizeLinks = () => {
      const document = iframe.contentDocument;

      if (!document) {
        return;
      }

      const links = Array.from(document.querySelectorAll("a[href]"));

      for (const link of links) {
        const href = (link.getAttribute("href") || "").trim();

        if (!href) {
          continue;
        }

        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");

        if (href.startsWith("//")) {
          link.setAttribute("href", `https:${href}`);
        }
      }
    };

    const measure = () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }

      frameId = requestAnimationFrame(() => {
        const document = iframe.contentDocument;

        if (!document) {
          return;
        }

        const body = document.body;
        const root = document.documentElement;
        const preferredHeight = typeof window === "undefined" ? maxHeight : Math.min(window.innerHeight * heightViewportRatio, maxHeight);
        const contentHeight = Math.max(body?.scrollHeight || 0, body?.offsetHeight || 0, root?.scrollHeight || 0, root?.offsetHeight || 0);
        const nextHeight = Math.max(minHeight, Math.min(preferredHeight, contentHeight || minHeight));

        setFrameHeight((current) => (Math.abs(current - nextHeight) < 1 ? current : nextHeight));
      });
    };

    const handleLoad = () => {
      normalizeImages();
      normalizeLinks();
      measure();
    };
    iframe.addEventListener("load", handleLoad);
    normalizeImages();
    normalizeLinks();
    measure();

    const handleWindowResize = () => measure();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleWindowResize);
    }

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      iframe.removeEventListener("load", handleLoad);
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleWindowResize);
      }
    };
  }, [heightViewportRatio, maxHeight, minHeight, previewDocument]);

  return (
    <div className={["overflow-hidden rounded-2xl border border-slate-200 bg-white", containerClassName].filter(Boolean).join(" ")}>
      <iframe
        ref={iframeRef}
        title="HTML preview"
        srcDoc={previewDocument}
        sandbox="allow-same-origin allow-popups allow-downloads"
        className="block w-full border-0 bg-white"
        style={{ height: `${frameHeight}px` }}
      />
    </div>
  );
}

function getMessageTextContent(message: EmailWorkspaceMessage) {
  return (message.body || getPlainTextFromHtml(message.rawBodyHtml || message.bodyHtml) || message.rawBody || "").replace(/Â/g, "");
}

function formatAttachmentSize(size: number) {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

function getAttachmentLabel(contentType: string) {
  if (contentType.startsWith("image/")) {
    return "Image";
  }

  if (contentType === "application/pdf") {
    return "PDF";
  }

  if (contentType.includes("spreadsheet") || contentType.includes("excel")) {
    return "Spreadsheet";
  }

  if (contentType.includes("word") || contentType.includes("document")) {
    return "Document";
  }

  if (contentType.startsWith("text/")) {
    return "Text";
  }

  return "Attachment";
}

function getEmailAttachmentHref(messageId: string, attachmentIndex: number, forceDownload = false) {
  return `/api/email/messages/${messageId}/attachments/${attachmentIndex}${forceDownload ? "?download=1" : ""}`;
}

function renderMessageContent(message: EmailWorkspaceMessage) {
  if (message.rawBodyHtml.trim()) {
    return {
      kind: "html" as const,
      content: sanitizeMessageHtml(message.rawBodyHtml).replace(/Â/g, ""),
      rawUnsanitized: message.rawBodyHtml.replace(/Â/g, "")
    };
  }

  if (message.bodyHtml.trim()) {
    return {
      kind: "html" as const,
      content: sanitizeMessageHtml(message.bodyHtml).replace(/Â/g, ""),
      rawUnsanitized: message.bodyHtml.replace(/Â/g, "")
    };
  }

  return {
    kind: "text" as const,
    content: getMessageTextContent(message).replace(/Â/g, "") || "No readable message body is stored for this email yet."
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildParagraphHtml(lines: string[]) {
  return lines
    .map((line) => (line ? `<p>${escapeHtml(line)}</p>` : "<p><br></p>"))
    .join("");
}

const defaultSignatureLines = ["Best,", "Your Name", "Relix CRM"] as const;
const defaultSignatureHtml = buildParagraphHtml([...defaultSignatureLines]);
const defaultSignatureName = "Primary signature";

function createDefaultSignatures() {
  return [
    {
      id: "signature-primary",
      name: defaultSignatureName,
      html: defaultSignatureHtml,
      updatedAt: new Date("2026-01-01T00:00:00.000Z").toISOString()
    }
  ] satisfies EmailSignature[];
}

function createDefaultEmailTemplates() {
  const seededAt = new Date("2026-01-01T00:00:00.000Z").toISOString();

  return [
    {
      id: "intro",
      name: "Intro template",
      subject: "Quick introduction",
      html: buildParagraphHtml([
        "Hi there,",
        "I wanted to introduce myself and share a quick note on how we can help your team.",
        "If useful, I can send a short overview or set up a quick call this week."
      ]),
      updatedAt: seededAt
    },
    {
      id: "follow-up",
      name: "Follow-up",
      subject: "Following up on my previous email",
      html: buildParagraphHtml([
        "Hi there,",
        "Following up on my earlier note in case it got buried.",
        "If this is still relevant, I am happy to share details or answer any questions."
      ]),
      updatedAt: seededAt
    },
    {
      id: "meeting",
      name: "Meeting request",
      subject: "Would a quick call be helpful?",
      html: buildParagraphHtml([
        "Hi there,",
        "Would a short call this week be useful to walk through the main points and next steps?",
        "I can work around your schedule."
      ]),
      updatedAt: seededAt
    }
  ] satisfies EmailTemplate[];
}

function stripManagedSignature(html: string) {
  return html.replace(/<!--managed-signature-start-->[\s\S]*?<!--managed-signature-end-->/gi, "").trim();
}

function buildManagedSignatureBlock(signatureHtml: string) {
  const safeSignatureHtml = sanitizeMessageHtml(signatureHtml).trim();

  if (!safeSignatureHtml) {
    return "";
  }

  return [
    "<!--managed-signature-start-->",
    `<div data-email-signature="true" style="margin-top:24px;padding-top:16px;border-top:1px solid #dbe4f0;color:#475569;">${safeSignatureHtml}</div>`,
    "<!--managed-signature-end-->"
  ].join("");
}

function appendManagedSignatureHtml(html: string, signatureHtml: string) {
  const bodyHtml = stripManagedSignature(html) || "<p><br></p>";
  const signatureBlock = buildManagedSignatureBlock(signatureHtml);

  if (!signatureBlock) {
    return bodyHtml;
  }

  const quotedMarkerIndex = bodyHtml.indexOf('<div data-email-quoted="true"');

  if (quotedMarkerIndex >= 0) {
    return `${bodyHtml.slice(0, quotedMarkerIndex)}${signatureBlock}${bodyHtml.slice(quotedMarkerIndex)}`;
  }

  return `${bodyHtml}${signatureBlock}`;
}

function appendManagedSignatureText(message: string, signatureHtml: string) {
  const signatureText = getPlainTextFromHtml(signatureHtml);

  return [message.trim(), signatureText].filter(Boolean).join("\n\n");
}

function buildQuotedReplyHtml(message: EmailWorkspaceMessage | undefined) {
  if (!message) {
    return "<p><br></p>";
  }

  const rendered = renderMessageContent(message);
  const contentHtml = rendered.kind === "html" ? rendered.content : toEditorHtml(rendered.content);

  return [
    "<p><br></p>",
    `<div data-email-quoted="true" style="margin-top:20px;padding-top:16px;border-top:1px solid #dbe4f0;color:#5b6b82;">`,
    `<p style="margin:0 0 10px 0;font-size:13px;">On ${escapeHtml(message.sentAt)}, <strong>${escapeHtml(message.fromName)}</strong> &lt;${escapeHtml(message.fromEmail)}&gt; wrote:</p>`,
    `<blockquote style="margin:0;padding-left:16px;border-left:2px solid #dbe4f0;">${contentHtml}</blockquote>`,
    "</div>"
  ].join("");
}

function buildForwardedHtml(thread: EmailWorkspaceThread | null) {
  const message = thread?.messages.at(-1);

  if (!thread || !message) {
    return "<p><br></p>";
  }

  const rendered = renderMessageContent(message);
  const contentHtml = rendered.kind === "html" ? rendered.content : toEditorHtml(rendered.content);

  return [
    "<p><br></p>",
    `<div data-email-quoted="true" style="margin-top:20px;padding-top:16px;border-top:1px solid #dbe4f0;color:#5b6b82;">`,
    `<p style="margin:0 0 12px 0;font-size:13px;font-weight:600;">---------- Forwarded message ---------</p>`,
    `<p style="margin:0;font-size:13px;"><strong>From:</strong> ${escapeHtml(message.fromName)} &lt;${escapeHtml(message.fromEmail)}&gt;</p>`,
    `<p style="margin:4px 0 0 0;font-size:13px;"><strong>Date:</strong> ${escapeHtml(message.sentAt)}</p>`,
    `<p style="margin:4px 0 0 0;font-size:13px;"><strong>Subject:</strong> ${escapeHtml(thread.subject)}</p>`,
    `<p style="margin:4px 0 ${message.ccEmail ? "0" : "12px"} 0;font-size:13px;"><strong>To:</strong> ${escapeHtml(message.toEmail || "")}</p>`,
    message.ccEmail ? `<p style="margin:4px 0 12px 0;font-size:13px;"><strong>Cc:</strong> ${escapeHtml(message.ccEmail)}</p>` : "",
    `<div>${contentHtml}</div>`,
    "</div>"
  ].join("");
}

function ComposeModal({
  open,
  mode,
  title,
  initialTo,
  initialCc,
  initialBcc,
  initialSubject,
  initialMessage,
  initialHtml,
  busy,
  saveLabel,
  signatureConfigured,
  signatureAppendEnabled,
  onSignatureAppendChange,
  onClose,
  onSubmit,
  onSaveDraft
}: {
  open: boolean;
  mode: "new" | "reply" | "forward" | "draft";
  title: string;
  initialTo: string;
  initialCc: string;
  initialBcc: string;
  initialSubject: string;
  initialMessage: string;
  initialHtml?: string;
  busy: boolean;
  saveLabel: string;
  signatureConfigured: boolean;
  signatureAppendEnabled: boolean;
  onSignatureAppendChange: (value: boolean) => void;
  onClose: () => void;
  onSubmit: (payload: { to: string; cc: string; bcc: string; subject: string; message: string; html: string; files: File[] }) => void;
  onSaveDraft: (payload: { to: string; cc: string; bcc: string; subject: string; message: string; html: string }) => void;
}) {
  const [form, setForm] = useState({ to: initialTo, cc: initialCc, bcc: initialBcc, subject: initialSubject, html: "" });
  const [files, setFiles] = useState<File[]>([]);
  const [showCc, setShowCc] = useState(Boolean(initialCc.trim()));
  const [showBcc, setShowBcc] = useState(Boolean(initialBcc.trim()));
  const [aiBusyAction, setAiBusyAction] = useState<ComposeAiAction | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isRunningAi, startAiTransition] = useTransition();
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const nextHtml = initialHtml?.trim() || toEditorHtml(initialMessage);

    setForm({
      to: initialTo,
      cc: initialCc,
      bcc: initialBcc,
      subject: initialSubject,
      html: nextHtml
    });
    setShowCc(Boolean(initialCc.trim()));
    setShowBcc(Boolean(initialBcc.trim()));
    setFiles([]);
    setAiBusyAction(null);
    setAiError(null);
    setAiAnalysis(null);
    if (editorRef.current) {
      editorRef.current.innerHTML = nextHtml;
    }
  }, [initialBcc, initialCc, initialHtml, initialMessage, initialSubject, initialTo, open]);

  useEffect(() => {
    if (!open || !editorRef.current) {
      return;
    }

    requestAnimationFrame(() => {
      const editor = editorRef.current;
      if (!editor) {
        return;
      }

      editor.focus();
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(range);
    });
  }, [open, mode, initialHtml, initialMessage]);

  if (!open) {
    return null;
  }

  const syncEditorHtml = () => {
    const html = editorRef.current?.innerHTML || "<p><br></p>";
    setForm((current) => ({ ...current, html }));
    return html;
  };

  const setEditorHtml = (nextHtml: string) => {
    setForm((current) => ({ ...current, html: nextHtml }));

    if (editorRef.current) {
      editorRef.current.innerHTML = nextHtml;
    }
  };

  const applyCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncEditorHtml();
  };

  const handleInsertLink = () => {
    const value = window.prompt("Enter link URL");

    if (!value) {
      return;
    }

    applyCommand("createLink", value);
  };

  const currentHtml = editorRef.current?.innerHTML || form.html;
  const plainMessage = getPlainTextFromHtml(currentHtml);
  const canSaveDraft = Boolean(form.to.trim() || form.cc.trim() || form.bcc.trim() || form.subject.trim() || plainMessage);
  const aiBusy = busy || isRunningAi || aiBusyAction !== null;
  const aiActionCopy: Record<ComposeAiAction, { label: string; busyLabel: string; icon: typeof Sparkles; variant: "filled" | "outline" }> = {
    write: { label: "Write with AI", busyLabel: "Writing...", icon: Sparkles, variant: "filled" },
    rephrase: { label: "Rephrase", busyLabel: "Rephrasing...", icon: PenLine, variant: "outline" },
    analyze: { label: "Analyze", busyLabel: "Analyzing...", icon: ClipboardList, variant: "outline" }
  };

  const runAiAction = (action: ComposeAiAction) => {
    const html = syncEditorHtml();
    const message = getPlainTextFromHtml(html).trim();
    const subject = form.subject.trim();

    if (action === "write" && !subject && !message) {
      setAiError("Add a subject or a few draft notes before using Write with AI.");
      return;
    }

    if (action === "rephrase" && !message) {
      setAiError("Write something first so AI can rephrase it.");
      return;
    }

    if (action === "analyze" && !message) {
      setAiError("Write something first so AI can analyze it.");
      return;
    }

    setAiError(null);
    if (action !== "analyze") {
      setAiAnalysis(null);
    }
    setAiBusyAction(action);

    startAiTransition(() => {
      void (async () => {
        try {
          const response = await fetch("/api/email/ai", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              accept: "application/json"
            },
            body: JSON.stringify({
              action,
              to: form.to.trim(),
              subject,
              message,
              signatureEnabled: signatureConfigured && signatureAppendEnabled
            })
          });
          const result = (await response.json().catch(() => null)) as { error?: string; output?: string } | null;

          if (!response.ok) {
            throw new Error(result?.error || "Unable to run Email AI.");
          }

          const output = result?.output?.trim();

          if (!output) {
            throw new Error("Email AI returned an empty response.");
          }

          if (action === "analyze") {
            setAiAnalysis(output);
            return;
          }

          setEditorHtml(toEditorHtml(output));
        } catch (error) {
          setAiError(error instanceof Error ? error.message : "Unable to run Email AI.");
        } finally {
          setAiBusyAction(null);
        }
      })();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end bg-[rgba(15,23,42,0.14)] p-4 backdrop-blur-[2px] sm:p-6">
      <div className="flex max-h-[min(92vh,880px)] w-full max-w-[760px] flex-col overflow-hidden rounded-[18px] border border-slate-300 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] px-5 py-3.5">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {mode === "reply" ? "Replying in thread" : mode === "forward" ? "Forwarding email" : "Compose email"}
            </p>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-slate-500 hover:bg-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-1">
          <div className="flex items-center gap-3 border-b border-slate-200 py-3 text-sm">
            <div className="w-12 shrink-0 text-slate-500">To</div>
            <input
              dir="ltr"
              className="min-w-0 flex-1 border-0 bg-transparent px-0 py-0 text-sm text-slate-800 outline-none placeholder:text-slate-400"
              placeholder="Recipients"
              value={form.to}
              onChange={(event) => setForm((state) => ({ ...state, to: event.target.value }))}
            />
            <div className="flex shrink-0 items-center gap-2 text-xs font-medium text-slate-500">
              {!showCc ? (
                <button type="button" onClick={() => setShowCc(true)} className="hover:text-[#386df4]">
                  Cc
                </button>
              ) : null}
              {!showBcc ? (
                <button type="button" onClick={() => setShowBcc(true)} className="hover:text-[#386df4]">
                  Bcc
                </button>
              ) : null}
            </div>
          </div>
          {showCc ? (
            <div className="flex items-center gap-3 border-b border-slate-200 py-3 text-sm">
              <div className="w-12 shrink-0 text-slate-500">Cc</div>
              <input
                dir="ltr"
                className="min-w-0 flex-1 border-0 bg-transparent px-0 py-0 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                placeholder="CC recipients"
                value={form.cc}
                onChange={(event) => setForm((state) => ({ ...state, cc: event.target.value }))}
              />
            </div>
          ) : null}
          {showBcc ? (
            <div className="flex items-center gap-3 border-b border-slate-200 py-3 text-sm">
              <div className="w-12 shrink-0 text-slate-500">Bcc</div>
              <input
                dir="ltr"
                className="min-w-0 flex-1 border-0 bg-transparent px-0 py-0 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                placeholder="BCC recipients"
                value={form.bcc}
                onChange={(event) => setForm((state) => ({ ...state, bcc: event.target.value }))}
              />
            </div>
          ) : null}
          <div className="flex items-center gap-3 border-b border-slate-200 py-3 text-sm">
            <div className="w-12 shrink-0 text-slate-500">Subject</div>
            <input
              dir="ltr"
              className="min-w-0 flex-1 border-0 bg-transparent px-0 py-0 text-sm text-slate-800 outline-none placeholder:text-slate-400"
              placeholder="Subject"
              value={form.subject}
              onChange={(event) => setForm((state) => ({ ...state, subject: event.target.value }))}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-start gap-2">
            {(["write", "rephrase", "analyze"] as ComposeAiAction[]).map((action) => {
              const item = aiActionCopy[action];
              const Icon = aiBusyAction === action ? RefreshCw : item.icon;

              return (
                <button
                  key={action}
                  type="button"
                  disabled={aiBusy}
                  onClick={() => runAiAction(action)}
                  className={`crm-btn inline-flex w-fit shrink-0 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    item.variant === "filled"
                      ? "border-[#386df4] bg-[#386df4] text-white hover:bg-[#2d5de0]"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${aiBusyAction === action ? "animate-spin" : ""}`} />
                  <span>{aiBusyAction === action ? item.busyLabel : item.label}</span>
                </button>
              );
            })}
          </div>

          {aiError ? (
            <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{aiError}</div>
          ) : null}

          {aiAnalysis ? (
            <div className="mt-3 rounded-[18px] border border-[#d6e4ff] bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)] px-4 py-4 shadow-[0_10px_30px_rgba(56,109,244,0.08)]">
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <ClipboardList className="h-[18px] w-[18px] text-[#386df4]" />
                  Draft analysis
                </div>
                <button type="button" onClick={() => setAiAnalysis(null)} className="text-xs font-medium text-[#386df4] hover:text-[#234fc4]">
                  Clear
                </button>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{aiAnalysis}</p>
            </div>
          ) : null}

          <div className="mt-3 overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
            <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-2.5 py-2.5">
              {[
                { icon: Bold, label: "Bold", action: () => applyCommand("bold") },
                { icon: Italic, label: "Italic", action: () => applyCommand("italic") },
                { icon: Underline, label: "Underline", action: () => applyCommand("underline") },
                { icon: List, label: "Bullets", action: () => applyCommand("insertUnorderedList") },
                { icon: ListOrdered, label: "Numbers", action: () => applyCommand("insertOrderedList") },
                { icon: Link2, label: "Link", action: handleInsertLink }
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.action}
                  className="rounded-md border border-transparent p-2 text-slate-500 hover:border-slate-200 hover:bg-white hover:text-slate-700"
                  title={item.label}
                >
                  <item.icon className="h-4 w-4" />
                </button>
              ))}
            </div>

            <div
              ref={editorRef}
              dir="ltr"
              contentEditable
              spellCheck
              suppressContentEditableWarning
              onInput={() => syncEditorHtml()}
              className="max-h-[min(46vh,420px)] min-h-[280px] overflow-y-auto px-5 py-4 text-sm leading-7 text-slate-700 outline-none [&_a]:text-[#386df4] [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-slate-200 [&_blockquote]:pl-4 [&_li]:ml-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5"
            />
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
            <div>
              <div className="text-sm font-medium text-slate-900">Signature</div>
              <p className="mt-1 text-xs text-slate-500">
                {!signatureConfigured
                  ? "No signature is configured for this mailbox yet."
                  : signatureAppendEnabled
                    ? "Your saved HTML signature will be added when you send this email."
                    : "This email will send without the saved signature."}
              </p>
            </div>
            <ToggleSwitch checked={signatureConfigured && signatureAppendEnabled} disabled={!signatureConfigured} onChange={onSignatureAppendChange} />
          </div>

          <div className="my-5 rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-slate-900">Attachments</div>
                <p className="mt-1 text-xs text-slate-500">Files attach on send. Draft save stores only the message content.</p>
              </div>
              <label className="crm-btn crm-btn-secondary inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                <Paperclip className="h-4 w-4" />
                Add files
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    const nextFiles = Array.from(event.target.files || []);

                    if (nextFiles.length) {
                      setFiles((current) => [...current, ...nextFiles]);
                    }

                    event.target.value = "";
                  }}
                />
              </label>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {files.length ? (
                files.map((file) => (
                  <span key={`${file.name}-${file.size}`} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] text-slate-600">
                    <Paperclip className="h-3 w-3" />
                    <span className="max-w-[180px] truncate">{file.name}</span>
                    <span className="text-slate-400">{Math.max(1, Math.round(file.size / 1024))} KB</span>
                    <button type="button" onClick={() => setFiles((current) => current.filter((item) => item !== file))} className="text-slate-400 hover:text-slate-700">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">No files attached.</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-3.5">
          <button
            onClick={() => onSaveDraft({ to: form.to, cc: form.cc, bcc: form.bcc, subject: form.subject, message: plainMessage, html: syncEditorHtml() })}
            disabled={!canSaveDraft}
            className="crm-btn crm-btn-secondary rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saveLabel}
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <button onClick={onClose} className="crm-btn crm-btn-secondary rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button
              onClick={() => onSubmit({ to: form.to, cc: form.cc, bcc: form.bcc, subject: form.subject, message: plainMessage, html: syncEditorHtml(), files })}
              disabled={busy || aiBusy || !form.to.trim() || !form.subject.trim() || !plainMessage}
              className="inline-flex items-center gap-2 rounded-full bg-[#1a73e8] px-5 py-2 text-sm font-medium text-white hover:bg-[#1558b0] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {busy ? "Sending..." : "Send email"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplateManagerModal({
  open,
  templates,
  signatureHtml,
  signatureAppendEnabled,
  onClose,
  onSave,
  onDelete,
  onUseTemplate
}: {
  open: boolean;
  templates: EmailTemplate[];
  signatureHtml: string;
  signatureAppendEnabled: boolean;
  onClose: () => void;
  onSave: (template: { id?: string; name: string; subject: string; html: string }) => void;
  onDelete: (templateId: string) => void;
  onUseTemplate: (templateId: string) => void;
}) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", subject: "", html: "<p><br></p>" });
  const [editorMode, setEditorMode] = useState<"html" | "rich">("rich");
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const firstTemplate = templates[0] || null;
    setSelectedTemplateId(firstTemplate?.id || null);
    setForm({
      name: firstTemplate?.name || "",
      subject: firstTemplate?.subject || "",
      html: firstTemplate?.html || "<p><br></p>"
    });
    setEditorMode("rich");
  }, [open, templates]);

  useEffect(() => {
    if (!open || !editorRef.current) {
      return;
    }

    const nextHtml = form.html.trim() || "<p><br></p>";
    if (editorRef.current.innerHTML !== nextHtml) {
      editorRef.current.innerHTML = nextHtml;
    }
  }, [form.html, open]);

  if (!open) {
    return null;
  }

  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId) || null;
  const previewHtml = signatureAppendEnabled ? appendManagedSignatureHtml(form.html, signatureHtml) : stripManagedSignature(form.html) || "<p><br></p>";
  const canSave = Boolean(form.name.trim() && form.subject.trim() && getPlainTextFromHtml(form.html).trim());

  const syncEditorHtml = () => {
    const html = editorRef.current?.innerHTML || "<p><br></p>";
    setForm((current) => ({ ...current, html }));
    return html;
  };

  const applyCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncEditorHtml();
  };

  const handleInsertLink = () => {
    const value = window.prompt("Enter link URL");

    if (!value) {
      return;
    }

    applyCommand("createLink", value);
  };

  const loadTemplate = (template: EmailTemplate | null) => {
    setSelectedTemplateId(template?.id || null);
    setForm({
      name: template?.name || "",
      subject: template?.subject || "",
      html: template?.html || "<p><br></p>"
    });
    setEditorMode("rich");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[rgba(15,23,42,0.18)] px-4 py-4 backdrop-blur-[2px] sm:px-6 sm:py-6">
      <div className="flex w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white lg:max-h-[min(92vh,920px)] lg:flex-row">
        <div className="flex w-full shrink-0 flex-col border-b border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] p-5 lg:max-w-[280px] lg:border-b-0 lg:border-r">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">Template management</h2>
              <p className="mt-1 text-sm text-slate-500">Create, save, reuse, and tidy your outbound email templates.</p>
            </div>
            <button onClick={onClose} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50">
              <X className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => loadTemplate(null)}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#386df4] px-4 py-3 text-sm font-medium text-white hover:bg-[#2d5de0]"
          >
            <MailPlus className="h-4 w-4" />
            New template
          </button>

          <div className="mt-5 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {templates.map((template) => {
              const active = selectedTemplateId === template.id;

              return (
                <button
                  key={template.id}
                  onClick={() => loadTemplate(template)}
                  className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                    active ? "border-[#bfd2ff] bg-white shadow-[0_12px_30px_rgba(56,109,244,0.08)]" : "border-slate-200 bg-white/80 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  <div className="truncate text-sm font-semibold text-slate-900">{template.name}</div>
                  <div className="mt-1 truncate text-xs text-slate-500">{template.subject}</div>
                </button>
              );
            })}

            {!templates.length ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-6 text-center text-sm text-slate-500">
                No templates saved yet.
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid min-w-0 flex-1 gap-0 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:overflow-hidden">
          <div className="min-h-0 min-w-0 border-b border-slate-200 p-5 lg:overflow-y-auto lg:border-b-0 lg:border-r">
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Template name</label>
                <input
                  className={`${inputClassName} mt-2`}
                  placeholder="Q2 reactivation"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Subject line</label>
                <input
                  className={`${inputClassName} mt-2`}
                  placeholder="Checking in with a quick update"
                  value={form.subject}
                  onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <label className="block text-sm font-medium text-slate-700">Template body</label>
                  <span className="text-xs text-slate-400">
                    {signatureAppendEnabled ? "Saved signature is included in the preview on the right." : "Preview shows the template without the saved signature."}
                  </span>
                </div>
                <div className="mt-2 inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                  {[
                    { id: "rich", label: "Rich text" },
                    { id: "html", label: "HTML" }
                  ].map((option) => {
                    const active = editorMode === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          if (option.id === "html") {
                            syncEditorHtml();
                          }
                          setEditorMode(option.id as "html" | "rich");
                        }}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                          active ? "bg-white text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.08)]" : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                  {editorMode === "rich" ? (
                    <>
                      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-2.5 py-2.5">
                        {[
                          { icon: Bold, label: "Bold", action: () => applyCommand("bold") },
                          { icon: Italic, label: "Italic", action: () => applyCommand("italic") },
                          { icon: Underline, label: "Underline", action: () => applyCommand("underline") },
                          { icon: List, label: "Bullets", action: () => applyCommand("insertUnorderedList") },
                          { icon: ListOrdered, label: "Numbers", action: () => applyCommand("insertOrderedList") },
                          { icon: Link2, label: "Link", action: handleInsertLink }
                        ].map((item) => (
                          <button
                            key={item.label}
                            type="button"
                            onClick={item.action}
                            className="rounded-md border border-transparent p-2 text-slate-500 hover:border-slate-200 hover:bg-white hover:text-slate-700"
                            title={item.label}
                          >
                            <item.icon className="h-4 w-4" />
                          </button>
                        ))}
                      </div>

                      <div
                        ref={editorRef}
                        dir="ltr"
                        contentEditable
                        spellCheck
                        suppressContentEditableWarning
                        onInput={() => syncEditorHtml()}
                        className="max-h-[min(42vh,360px)] min-h-[260px] overflow-y-auto px-5 py-4 text-sm leading-7 text-slate-700 outline-none [&_a]:text-[#386df4] [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-slate-200 [&_blockquote]:pl-4 [&_li]:ml-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5"
                      />
                    </>
                  ) : (
                    <textarea
                      className="h-[320px] w-full resize-none border-0 bg-slate-50 px-4 py-3 font-mono text-[13px] leading-6 text-slate-700 outline-none placeholder:text-slate-400"
                      placeholder="<p>Hi there,</p><p>Quick note from our side...</p>"
                      value={form.html}
                      onChange={(event) => setForm((current) => ({ ...current, html: event.target.value }))}
                    />
                  )}
                </div>
                <p className="mt-2 text-xs text-slate-400">Use rich text for normal editing, or switch to HTML when you want to paste markup directly.</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
              <div className="flex flex-wrap items-center gap-2">
                {selectedTemplate ? (
                  <button
                    onClick={() => onDelete(selectedTemplate.id)}
                    className="crm-btn crm-btn-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {selectedTemplate ? (
                  <button
                    onClick={() => onUseTemplate(selectedTemplate.id)}
                    className="crm-btn crm-btn-secondary"
                  >
                    <Send className="h-4 w-4" />
                    Use template
                  </button>
                ) : null}
                <button
                  onClick={() =>
                    onSave({
                      id: selectedTemplate?.id,
                      name: form.name,
                      subject: form.subject,
                      html: form.html
                    })
                  }
                  disabled={!canSave}
                  className="rounded-xl bg-[#386df4] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {selectedTemplate ? "Save changes" : "Save template"}
                </button>
              </div>
            </div>
          </div>

          <div className="min-h-0 min-w-0 p-5 lg:overflow-y-auto">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Preview</div>
              <h3 className="mt-2 text-base font-semibold text-slate-900">{form.subject || "Template preview"}</h3>
              <p className="mt-1 text-sm text-slate-500">
                {signatureAppendEnabled
                  ? "Live preview of the email body with your saved signature appended."
                  : "Live preview of the email body without any signature appended."}
              </p>
            </div>

            <FittedHtmlPreview
              html={previewHtml}
              emptyHtml="<p>Preview your template here.</p>"
              minHeight={220}
              maxHeight={620}
              heightViewportRatio={0.52}
              containerClassName="mt-5"
              contentClassName="text-[15px] leading-7"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SignatureEditorModal({
  open,
  signatures,
  activeSignatureId,
  onClose,
  onSave,
  onDelete,
  onSetActive
}: {
  open: boolean;
  signatures: EmailSignature[];
  activeSignatureId: string | null;
  onClose: () => void;
  onSave: (signature: { id?: string; name: string; html: string }) => void;
  onDelete: (signatureId: string) => void;
  onSetActive: (signatureId: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [draft, setDraft] = useState(defaultSignatureHtml);
  const [editorMode, setEditorMode] = useState<"html" | "rich">("rich");
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const initialSignature = signatures.find((item) => item.id === activeSignatureId) || signatures[0] || null;

    if (initialSignature) {
      setSelectedId(initialSignature.id);
      setName(initialSignature.name);
      setDraft(initialSignature.html);
      setEditorMode("rich");
      return;
    }

    setSelectedId(null);
    setName(`Signature ${signatures.length + 1}`);
    setDraft(defaultSignatureHtml);
    setEditorMode("rich");
  }, [activeSignatureId, open, signatures]);

  useEffect(() => {
    if (!open || !editorRef.current) {
      return;
    }

    const nextHtml = draft.trim() || "<p><br></p>";
    if (editorRef.current.innerHTML !== nextHtml) {
      editorRef.current.innerHTML = nextHtml;
    }
  }, [draft, open]);

  if (!open) {
    return null;
  }

  const syncEditorHtml = () => {
    const html = editorRef.current?.innerHTML || "<p><br></p>";
    setDraft(html);
    return html;
  };

  const applyCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncEditorHtml();
  };

  const handleInsertLink = () => {
    const value = window.prompt("Enter link URL");

    if (!value) {
      return;
    }

    applyCommand("createLink", value);
  };

  const canSave = Boolean(name.trim() && getPlainTextFromHtml(draft).trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[rgba(15,23,42,0.18)] px-4 py-4 backdrop-blur-[2px] sm:px-6 sm:py-6">
      <div className="flex w-full max-w-[min(96vw,1500px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white lg:max-h-[min(92vh,920px)]">
        <div className="flex items-center justify-between border-b border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">Signatures</h2>
            <p className="mt-1 text-sm text-slate-500">Save more than one signature and choose which one is active.</p>
          </div>
          <button onClick={onClose} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid min-w-0 flex-1 gap-0 lg:grid-cols-[240px_minmax(0,1.12fr)_minmax(460px,1.38fr)] lg:overflow-hidden">
          <div className="flex min-h-0 flex-col border-b border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] p-5 lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Library</div>
              <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500">{signatures.length}</span>
            </div>

            <button
              onClick={() => {
                setSelectedId(null);
                setName(`Signature ${signatures.length + 1}`);
                setDraft(defaultSignatureHtml);
                setEditorMode("rich");
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#386df4] px-4 py-3 text-sm font-medium text-white hover:bg-[#2d5de0]"
            >
              <MailPlus className="h-4 w-4" />
              New signature
            </button>

            <div className="mt-5 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {signatures.map((signature) => {
                const active = selectedId === signature.id;
                const inUse = activeSignatureId === signature.id;

                return (
                  <button
                    key={signature.id}
                    onClick={() => {
                      setSelectedId(signature.id);
                      setName(signature.name);
                      setDraft(signature.html);
                      setEditorMode("rich");
                    }}
                    className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                      active ? "border-[#bfd2ff] bg-white shadow-[0_12px_30px_rgba(56,109,244,0.08)]" : "border-slate-200 bg-white/80 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="truncate text-sm font-semibold text-slate-900">{signature.name}</div>
                      {inUse ? (
                        <span className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-[11px] font-semibold text-[#386df4]">Active</span>
                      ) : null}
                    </div>
                  </button>
                );
              })}

              {!signatures.length ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-6 text-center text-sm text-slate-500">
                  No signatures saved yet.
                </div>
              ) : null}
            </div>
          </div>

          <div className="min-h-0 min-w-0 border-b border-slate-200 p-5 lg:overflow-y-auto lg:border-b-0 lg:border-r">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Editor</div>
                <h3 className="mt-2 text-base font-semibold text-slate-900">{selectedId ? "Edit signature" : "New signature"}</h3>
              </div>
              <button onClick={() => setDraft(defaultSignatureHtml)} className="text-xs font-medium text-[#386df4] hover:text-[#2d5de0]">
                Restore default
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Signature name</label>
                <input className={`${inputClassName} mt-2`} placeholder="Founder signature" value={name} onChange={(event) => setName(event.target.value)} />
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <label className="block text-sm font-medium text-slate-700">Signature body</label>
                  {activeSignatureId === selectedId ? (
                    <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#386df4]">Active</span>
                  ) : null}
                </div>
                <div className="mt-2 inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                  {[
                    { id: "rich", label: "Rich text" },
                    { id: "html", label: "HTML" }
                  ].map((option) => {
                    const active = editorMode === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          if (option.id === "html") {
                            syncEditorHtml();
                          }
                          setEditorMode(option.id as "html" | "rich");
                        }}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                          active ? "bg-white text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.08)]" : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                  {editorMode === "rich" ? (
                    <>
                      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-2.5 py-2.5">
                        {[
                          { icon: Bold, label: "Bold", action: () => applyCommand("bold") },
                          { icon: Italic, label: "Italic", action: () => applyCommand("italic") },
                          { icon: Underline, label: "Underline", action: () => applyCommand("underline") },
                          { icon: List, label: "Bullets", action: () => applyCommand("insertUnorderedList") },
                          { icon: ListOrdered, label: "Numbers", action: () => applyCommand("insertOrderedList") },
                          { icon: Link2, label: "Link", action: handleInsertLink }
                        ].map((item) => (
                          <button
                            key={item.label}
                            type="button"
                            onClick={item.action}
                            className="rounded-md border border-transparent p-2 text-slate-500 hover:border-slate-200 hover:bg-white hover:text-slate-700"
                            title={item.label}
                          >
                            <item.icon className="h-4 w-4" />
                          </button>
                        ))}
                      </div>

                      <div
                        ref={editorRef}
                        dir="ltr"
                        contentEditable
                        spellCheck
                        suppressContentEditableWarning
                        onInput={() => syncEditorHtml()}
                        className="max-h-[min(42vh,360px)] min-h-[260px] overflow-y-auto px-5 py-4 text-sm leading-7 text-slate-700 outline-none [&_a]:text-[#386df4] [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-slate-200 [&_blockquote]:pl-4 [&_li]:ml-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5"
                      />
                    </>
                  ) : (
                    <textarea
                      className="h-[320px] w-full resize-none border-0 bg-slate-50 px-4 py-3 font-mono text-[13px] leading-6 text-slate-700 outline-none placeholder:text-slate-400"
                      placeholder="<p>Best,</p><p>Your Name</p><p>Your Company</p>"
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                    />
                  )}
                </div>
                <p className="mt-2 text-xs text-slate-400">Use rich text for normal editing, or switch to HTML when you want to paste markup directly.</p>
              </div>
            </div>
          </div>

          <div className="min-h-0 min-w-0 p-5 lg:overflow-y-auto">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Preview</div>
              <h3 className="mt-2 text-base font-semibold text-slate-900">{name.trim() || "Signature preview"}</h3>
              <p className="mt-1 text-sm text-slate-500">Live preview of the signature that will be appended to emails.</p>
            </div>
            <HtmlIframePreview html={draft} emptyHtml="<p>No signature configured.</p>" containerClassName="mt-5" />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4">
          <div>
            {selectedId ? (
              <button
                onClick={() => onDelete(selectedId)}
                className="crm-btn crm-btn-danger"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedId && selectedId !== activeSignatureId ? (
              <button
                onClick={() => onSetActive(selectedId)}
                className="crm-btn crm-btn-secondary"
              >
                Set active
              </button>
            ) : null}
            <button onClick={onClose} className="crm-btn crm-btn-secondary">
              Cancel
            </button>
            <button
              onClick={() =>
                onSave({
                  id: selectedId || undefined,
                  name,
                  html: draft
                })
              }
              disabled={!canSave}
              className="rounded-xl bg-[#386df4] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {selectedId ? "Save changes" : "Save signature"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MailboxSetupModal({
  open,
  prompt,
  googleAuthAvailable,
  onClose,
  onConnectGmail,
  onOpenSettings
}: {
  open: boolean;
  prompt: MailSetupPrompt;
  googleAuthAvailable: boolean;
  onClose: () => void;
  onConnectGmail: () => void;
  onOpenSettings: () => void;
}) {
  if (!open || !prompt) {
    return null;
  }

  const isComposePrompt = prompt === "compose";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.18)] px-4 backdrop-blur-[2px] sm:px-6">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.14)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-[1.2rem] font-semibold tracking-tight text-slate-900">{isComposePrompt ? "Set up your mailbox" : "Set up inbox sync"}</h2>
          </div>
          <button onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 px-5 py-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
            {isComposePrompt
              ? "Use Gmail for the fastest setup, or save your own SMTP credentials in Settings."
              : "Use Gmail for the fastest setup, or save your own IMAP credentials in Settings."}
          </div>
          {!googleAuthAvailable ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Gmail connect is currently unavailable. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` first, or use manual settings.
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
          <button onClick={onClose} className="crm-btn crm-btn-secondary">
            Cancel
          </button>
          <button
            onClick={onOpenSettings}
            className="crm-btn crm-btn-secondary"
          >
            Open Settings
          </button>
          <button
            onClick={onConnectGmail}
            disabled={!googleAuthAvailable}
            className="inline-flex items-center gap-2 rounded-xl bg-[#386df4] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ArrowUpRight className="h-4 w-4" />
            Connect Gmail
          </button>
        </div>
      </div>
    </div>
  );
}

export function InboxWorkspace({
  initialThreads,
  initialCompose,
  initialSelectedThreadId,
  initialMailbox = "inbox",
  mailSetup
}: {
  initialThreads: EmailWorkspaceThread[];
  initialCompose?: { mode: "new"; to: string; subject: string; message: string } | null;
  initialSelectedThreadId?: string | null;
  initialMailbox?: MailboxKey;
  mailSetup: MailSetupState;
}) {
  const router = useRouter();
  const { confirm: requestConfirmation, confirmationDialog } = useConfirmAction();
  const [threads, setThreads] = useState(initialThreads);
  const [drafts, setDrafts] = useState<DraftEmail[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(createDefaultEmailTemplates());
  const [savedSignatures, setSavedSignatures] = useState<EmailSignature[]>(createDefaultSignatures());
  const [activeSignatureId, setActiveSignatureId] = useState<string | null>(createDefaultSignatures()[0]?.id || null);
  const [signatureAppendEnabled, setSignatureAppendEnabled] = useState(true);
  const [selectedMailbox, setSelectedMailbox] = useState<MailboxKey>(initialMailbox);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(initialSelectedThreadId || null);
  const [selectedThreadIds, setSelectedThreadIds] = useState<string[]>([]);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>(emptyFilters());
  const [messageOrder, setMessageOrder] = useState<MessageOrder>("oldest");
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [composeState, setComposeState] = useState<ComposeState>(initialCompose?.mode ? { mode: "new" } : null);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [showSignatureManager, setShowSignatureManager] = useState(false);
  const [mailSetupPrompt, setMailSetupPrompt] = useState<MailSetupPrompt>(null);
  const [isInboxSyncActive, setIsInboxSyncActive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isSending, startSendingTransition] = useTransition();
  const [isSyncing, startSyncTransition] = useTransition();
  const [threadActionBusy, setThreadActionBusy] = useState(false);
  const [selectedThreadCrmLinks, setSelectedThreadCrmLinks] = useState<ThreadCrmLinksResponse | null>(null);
  const [crmLinksLoading, setCrmLinksLoading] = useState(false);
  const [showCrmRecordsModal, setShowCrmRecordsModal] = useState(false);
  const [detailedThreadIds, setDetailedThreadIds] = useState<Set<string>>(() => new Set(initialThreads.filter(threadHasLoadedMessageBodies).map((thread) => thread.id)));
  const [threadDetailLoadingId, setThreadDetailLoadingId] = useState<string | null>(null);
  const [threadDetailErrorId, setThreadDetailErrorId] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const threadsRef = useRef(threads);
  const syncInFlightRef = useRef(false);
  const mailboxSetupAutoPromptedRef = useRef(false);
  const autoReadSuppressedThreadIdRef = useRef<string | null>(null);
  const threadReadOverridesRef = useRef<Map<string, ThreadReadOverride>>(new Map());
  const threadRepairInFlightRef = useRef<Set<string>>(new Set());
  const detailedThreadIdsRef = useRef(detailedThreadIds);
  useCommandKFocus(searchInputRef);

  useEffect(() => {
    threadsRef.current = threads;
  }, [threads]);

  useEffect(() => {
    const nextDetailIds = new Set(
      [...detailedThreadIdsRef.current, ...initialThreads.filter(threadHasLoadedMessageBodies).map((thread) => thread.id)].filter((threadId) =>
        initialThreads.some((thread) => thread.id === threadId)
      )
    );

    detailedThreadIdsRef.current = nextDetailIds;
    setDetailedThreadIds(nextDetailIds);
    setThreads((current) => {
      const nextThreads = preserveLoadedThreadDetails(mergeThreadsWithReadOverrides(initialThreads, threadReadOverridesRef.current), current, nextDetailIds);
      threadsRef.current = nextThreads;
      return nextThreads;
    });
  }, [initialThreads]);

  useEffect(() => {
    const inboxUnreadCount = threads.filter((thread) => thread.mailbox === "inbox" && thread.unreadCount > 0).length;
    window.dispatchEvent(new CustomEvent("crm-inbox-unread-changed", { detail: { count: inboxUnreadCount } }));
  }, [threads]);

  useEffect(() => {
    if (!initialSelectedThreadId) {
      return;
    }

    const matchedThread = initialThreads.find((thread) => thread.id === initialSelectedThreadId);
    if (!matchedThread) {
      return;
    }

    setSelectedMailbox(initialMailbox);
    setSelectedThreadId(matchedThread.id);
  }, [initialMailbox, initialSelectedThreadId, initialThreads]);

  useEffect(() => {
    if (autoReadSuppressedThreadIdRef.current && autoReadSuppressedThreadIdRef.current !== selectedThreadId) {
      autoReadSuppressedThreadIdRef.current = null;
    }
  }, [selectedThreadId]);

  useEffect(() => {
    if (mailSetup.hasPersonalMailbox) {
      mailboxSetupAutoPromptedRef.current = false;
      return;
    }

    setThreads([]);
    setSelectedThreadId(null);
    setSelectedThreadIds([]);

    if (!mailboxSetupAutoPromptedRef.current) {
      mailboxSetupAutoPromptedRef.current = true;
      setMailSetupPrompt("compose");
    }
  }, [mailSetup.hasPersonalMailbox]);

  useEffect(() => {
    setComposeState(initialCompose?.mode ? { mode: "new" } : null);
  }, [initialCompose?.message, initialCompose?.mode, initialCompose?.subject, initialCompose?.to]);

  useEffect(() => {
    if (!initialCompose?.mode || mailSetup.canSendEmail) {
      return;
    }

    setComposeState(null);
    setMailSetupPrompt("compose");
    router.replace("/inbox");
  }, [initialCompose?.mode, mailSetup.canSendEmail, router]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedDrafts = window.localStorage.getItem(draftStorageKey);
    const storedTemplates = window.localStorage.getItem(templateStorageKey);
    const storedSignatures = window.localStorage.getItem(signaturesStorageKey);
    const storedActiveSignatureId = window.localStorage.getItem(activeSignatureIdStorageKey);
    const storedSignature = window.localStorage.getItem(signatureStorageKey);
    const storedSignatureAppend = window.localStorage.getItem(signatureAppendStorageKey);

    if (storedDrafts) {
      try {
        const parsedDrafts = JSON.parse(storedDrafts) as DraftEmail[];
        setDrafts(Array.isArray(parsedDrafts) ? parsedDrafts : []);
      } catch {
        setDrafts([]);
      }
    }

    if (storedTemplates) {
      try {
        const parsedTemplates = JSON.parse(storedTemplates) as EmailTemplate[];
        const safeTemplates = Array.isArray(parsedTemplates)
          ? parsedTemplates.filter(
              (template): template is EmailTemplate =>
                Boolean(
                  template &&
                    typeof template.id === "string" &&
                    typeof template.name === "string" &&
                    typeof template.subject === "string" &&
                    typeof template.html === "string" &&
                    typeof template.updatedAt === "string"
                )
            )
          : [];
        setEmailTemplates(safeTemplates.length ? safeTemplates : createDefaultEmailTemplates());
      } catch {
        setEmailTemplates(createDefaultEmailTemplates());
      }
    }

    if (storedSignatures) {
      try {
        const parsedSignatures = JSON.parse(storedSignatures) as EmailSignature[];
        const safeSignatures = Array.isArray(parsedSignatures)
          ? parsedSignatures.filter(
              (signature): signature is EmailSignature =>
                Boolean(
                  signature &&
                    typeof signature.id === "string" &&
                    typeof signature.name === "string" &&
                    typeof signature.html === "string" &&
                    typeof signature.updatedAt === "string"
                )
            )
          : [];
        setSavedSignatures(safeSignatures);
        setActiveSignatureId(storedActiveSignatureId || safeSignatures[0]?.id || null);
      } catch {
        setSavedSignatures(createDefaultSignatures());
        setActiveSignatureId(createDefaultSignatures()[0]?.id || null);
      }
    } else if (storedSignature !== null) {
      const migratedSignatures = storedSignature.trim()
        ? [
            {
              id: "signature-primary",
              name: defaultSignatureName,
              html: storedSignature,
              updatedAt: new Date().toISOString()
            }
          ]
        : [];
      setSavedSignatures(migratedSignatures);
      setActiveSignatureId(migratedSignatures[0]?.id || null);
    }

    if (storedSignatureAppend !== null) {
      setSignatureAppendEnabled(storedSignatureAppend === "true");
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(draftStorageKey, JSON.stringify(drafts));
  }, [drafts]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(templateStorageKey, JSON.stringify(emailTemplates));
  }, [emailTemplates]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(signaturesStorageKey, JSON.stringify(savedSignatures));
  }, [savedSignatures]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (activeSignatureId) {
      window.localStorage.setItem(activeSignatureIdStorageKey, activeSignatureId);
    } else {
      window.localStorage.removeItem(activeSignatureIdStorageKey);
    }
  }, [activeSignatureId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const activeHtml = savedSignatures.find((signature) => signature.id === activeSignatureId)?.html || savedSignatures[0]?.html || "";
    window.localStorage.setItem(signatureStorageKey, activeHtml);
  }, [activeSignatureId, savedSignatures]);

  useEffect(() => {
    if (!savedSignatures.some((signature) => signature.id === activeSignatureId)) {
      setActiveSignatureId(savedSignatures[0]?.id || null);
    }
  }, [activeSignatureId, savedSignatures]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(signatureAppendStorageKey, String(signatureAppendEnabled));
  }, [signatureAppendEnabled]);

  const sequences = useMemo(() => Array.from(new Set(threads.map((thread) => thread.sequence))).sort(), [threads]);
  const statuses = useMemo(() => Array.from(new Set(threads.flatMap((thread) => thread.statuses))).sort(), [threads]);
  const templateLibrary = useMemo(
    () => [...emailTemplates].sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()),
    [emailTemplates]
  );
  const featuredTemplates = templateLibrary.slice(0, 3);
  const activeSignature = useMemo(
    () => savedSignatures.find((signature) => signature.id === activeSignatureId) || savedSignatures[0] || null,
    [activeSignatureId, savedSignatures]
  );
  const signatureHtml = activeSignature?.html || "";
  const signatureConfigured = Boolean(getPlainTextFromHtml(signatureHtml).trim());
  const readStateFilterOptions = useMemo(
    () => [
      { value: "all", label: "All emails", icon: <Mail className={filterOptionIconClassName} /> },
      { value: "unread", label: "Unread only", icon: <MailWarning className={filterOptionIconClassName} /> },
      { value: "read", label: "Read only", icon: <Check className={filterOptionIconClassName} /> }
    ],
    []
  );

  const mailboxCounts = useMemo(
    () => ({
      inbox: {
        total: threads.filter((thread) => thread.mailbox === "inbox").length,
        unread: threads.filter((thread) => thread.mailbox === "inbox" && thread.unreadCount > 0).length
      },
      sent: {
        total: threads.filter((thread) => thread.mailbox === "sent").length,
        unread: 0
      },
      junk: {
        total: threads.filter((thread) => thread.mailbox === "junk").length,
        unread: threads.filter((thread) => thread.mailbox === "junk" && thread.unreadCount > 0).length
      },
      starred: {
        total: threads.filter((thread) => thread.starred && !thread.trashed).length,
        unread: threads.filter((thread) => thread.starred && !thread.trashed && thread.unreadCount > 0).length
      },
      trash: {
        total: threads.filter((thread) => thread.mailbox === "trash").length,
        unread: 0
      },
      drafts: drafts.length,
      all: {
        total: threads.filter((thread) => !thread.trashed).length,
        unread: threads.filter((thread) => !thread.trashed && thread.unreadCount > 0).length
      }
    }),
    [drafts.length, threads]
  );

  const isThreadUnread = (thread: EmailWorkspaceThread) => thread.unreadCount > 0;
  const sequenceFilterOptions = useMemo(
    () => [
      { value: "all", label: "All sequences", icon: <List className={filterOptionIconClassName} /> },
      ...sequences.map((sequence) => ({
        value: sequence,
        label: sequence,
        icon: <List className={filterOptionIconClassName} />
      }))
    ],
    [sequences]
  );
  const statusFilterOptions = useMemo(
    () => [
      { value: "all", label: "All statuses", icon: <MessagesSquare className={filterOptionIconClassName} /> },
      ...statuses.map((status) => ({
        value: status,
        label: status,
        icon: <MessagesSquare className={filterOptionIconClassName} />
      }))
    ],
    [statuses]
  );

  const filteredThreads = useMemo(() => {
    const searchValue = deferredQuery.trim().toLowerCase();
    const mailboxThreads =
      selectedMailbox === "inbox"
        ? threads.filter((thread) => thread.mailbox === "inbox")
        : selectedMailbox === "sent"
          ? threads.filter((thread) => thread.mailbox === "sent")
          : selectedMailbox === "junk"
            ? threads.filter((thread) => thread.mailbox === "junk")
          : selectedMailbox === "starred"
            ? threads.filter((thread) => thread.starred && !thread.trashed)
          : selectedMailbox === "trash"
            ? threads.filter((thread) => thread.mailbox === "trash")
          : selectedMailbox === "all"
            ? threads.filter((thread) => !thread.trashed)
            : [];

    return mailboxThreads.filter((thread) => {
      const messageRecipients = thread.messages.map((message) => `${message.toEmail} ${message.ccEmail} ${message.bccEmail}`).join(" ");
      const haystack = `${thread.recipient} ${thread.recipientEmail} ${messageRecipients} ${thread.subject} ${thread.sequence} ${thread.preview}`.toLowerCase();
      const matchesQuery = !searchValue || haystack.includes(searchValue);
      const matchesStatus = filters.status === "all" || thread.statuses.includes(filters.status);
      const matchesSequence = filters.sequence === "all" || thread.sequence === filters.sequence;
      const unread = isThreadUnread(thread);
      const matchesReadState =
        filters.readState === "all" || (filters.readState === "unread" ? unread : !unread);
      return matchesQuery && matchesStatus && matchesSequence && matchesReadState;
    });
  }, [deferredQuery, filters.readState, filters.sequence, filters.status, selectedMailbox, threads]);

  const filteredDrafts = useMemo(() => {
    const searchValue = deferredQuery.trim().toLowerCase();

    return drafts
      .filter((draft) => {
        const haystack = `${draft.to} ${draft.cc || ""} ${draft.bcc || ""} ${draft.subject} ${draft.message}`.toLowerCase();
        return !searchValue || haystack.includes(searchValue);
      })
      .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
  }, [deferredQuery, drafts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [deferredQuery, filters.readState, filters.sequence, filters.status, selectedMailbox]);

  useEffect(() => {
    if (selectedMailbox === "drafts") {
      if (!filteredDrafts.some((draft) => draft.id === selectedDraftId)) {
        setSelectedDraftId(filteredDrafts[0]?.id || null);
      }
      setSelectedThreadId(null);
      return;
    }

    if (!filteredThreads.some((thread) => thread.id === selectedThreadId)) {
      setSelectedThreadId(filteredThreads[0]?.id || null);
    }
    setSelectedDraftId(null);
  }, [filteredDrafts, filteredThreads, selectedDraftId, selectedMailbox, selectedThreadId]);

  useEffect(() => {
    const filteredThreadIds = new Set(filteredThreads.map((thread) => thread.id));
    setSelectedThreadIds((current) => current.filter((threadId) => filteredThreadIds.has(threadId)));
  }, [filteredThreads]);

  useEffect(() => {
    const totalItems = selectedMailbox === "drafts" ? filteredDrafts.length : filteredThreads.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, filteredDrafts.length, filteredThreads.length, pageSize, selectedMailbox]);

  const selectedThread = threads.find((thread) => thread.id === selectedThreadId) ?? null;
  const selectedDraft = drafts.find((draft) => draft.id === selectedDraftId) ?? null;
  const selectedThreadNeedsDetail = Boolean(selectedThread && selectedMailbox !== "drafts" && !detailedThreadIds.has(selectedThread.id));
  const selectedThreadDetailLoading = Boolean(selectedThreadNeedsDetail && selectedThread && threadDetailLoadingId === selectedThread.id);
  const selectedThreadDetailError = Boolean(selectedThreadNeedsDetail && selectedThread && threadDetailErrorId === selectedThread.id);
  const selectedThreadNeedsImageRepair = Boolean(
    selectedThread?.messages.some((message) => /cid:[^"'\s>)]+/i.test(message.rawBodyHtml || message.bodyHtml))
  );
  const orderedSelectedMessages = useMemo(() => {
    if (!selectedThread) {
      return [];
    }

    const messages = [...selectedThread.messages];
    return messageOrder === "newest"
      ? messages.sort((left, right) => right.sentAtValue - left.sentAtValue)
      : messages.sort((left, right) => left.sentAtValue - right.sentAtValue);
  }, [messageOrder, selectedThread]);
  const paginatedThreads = useMemo(() => paginateItems(filteredThreads, currentPage, pageSize), [currentPage, filteredThreads, pageSize]);
  const paginatedDrafts = useMemo(() => paginateItems(filteredDrafts, currentPage, pageSize), [currentPage, filteredDrafts, pageSize]);
  const replyTarget =
    selectedThread?.messages
      .slice()
      .reverse()
      .find((message) => message.direction === "inbound")?.fromEmail || selectedThread?.recipientEmail || "";
  const crmRecordCount = selectedThreadCrmLinks ? selectedThreadCrmLinks.contacts.length + selectedThreadCrmLinks.leads.length : 0;
  const crmRecordsControl = (
    <button
      type="button"
      onClick={() => setShowCrmRecordsModal(true)}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-[#fbfcff] px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white"
    >
      <Link2 className="h-4 w-4 text-slate-400" />
      CRM records
      {crmLinksLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
      ) : (
        <span className="rounded-full bg-white px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
          {crmRecordCount}
        </span>
      )}
    </button>
  );

  useEffect(() => {
    if (!selectedThread || selectedMailbox === "drafts" || detailedThreadIds.has(selectedThread.id)) {
      return;
    }

    let cancelled = false;
    const threadId = selectedThread.id;
    setThreadDetailLoadingId(threadId);
    setThreadDetailErrorId((current) => (current === threadId ? null : current));

    void (async () => {
      try {
        const response = await fetch(`/api/email/threads/${threadId}`, { cache: "no-store" });
        const result = await parseJson<ThreadApiResponse[number]>(response);
        const [detailedThread] = mergeThreadsWithReadOverrides(getEmailWorkspaceThreads([result]), threadReadOverridesRef.current);

        if (!detailedThread || cancelled) {
          return;
        }

        setThreads((current) => {
          const nextThreads = current.map((thread) => (thread.id === threadId ? detailedThread : thread));
          threadsRef.current = nextThreads;
          return nextThreads;
        });
        const nextDetailedIds = new Set(detailedThreadIdsRef.current);
        nextDetailedIds.add(threadId);
        detailedThreadIdsRef.current = nextDetailedIds;
        setDetailedThreadIds(nextDetailedIds);
      } catch {
        if (!cancelled) {
          setThreadDetailErrorId(threadId);
        }
      } finally {
        if (!cancelled) {
          setThreadDetailLoadingId((current) => (current === threadId ? null : current));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [detailedThreadIds, selectedMailbox, selectedThread]);

  useEffect(() => {
    if (!selectedThread || selectedMailbox === "drafts") {
      setSelectedThreadCrmLinks(null);
      setCrmLinksLoading(false);
      setShowCrmRecordsModal(false);
      return;
    }

    let cancelled = false;
    setCrmLinksLoading(true);

    void (async () => {
      try {
        const response = await fetch(`/api/email/threads/related?threadId=${selectedThread.id}&includeThreads=false`, { cache: "no-store" });
        const result = await parseJson<ThreadCrmLinksResponse>(response);

        if (!cancelled) {
          setSelectedThreadCrmLinks(result);
        }
      } catch {
        if (!cancelled) {
          setSelectedThreadCrmLinks(null);
        }
      } finally {
        if (!cancelled) {
          setCrmLinksLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedMailbox, selectedThread]);
  useEffect(() => {
    if (!showCrmRecordsModal) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowCrmRecordsModal(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showCrmRecordsModal]);
  const refreshThreads = async () => {
    const response = await fetch("/api/email/threads", { cache: "no-store" });
    const result = await parseJson<ThreadApiResponse>(response);

    const nextThreads = mergeThreadsWithReadOverrides(getEmailWorkspaceThreads(result), threadReadOverridesRef.current);
    const nextDetailedIds = new Set(detailedThreadIdsRef.current);
    const nextThreadIds = new Set(nextThreads.map((thread) => thread.id));
    nextDetailedIds.forEach((threadId) => {
      if (!nextThreadIds.has(threadId)) {
        nextDetailedIds.delete(threadId);
      }
    });
    const currentThreads = threadsRef.current;
    const currentById = new Map(currentThreads.map((thread) => [thread.id, thread]));
    nextThreads.forEach((thread) => {
      const currentThread = currentById.get(thread.id);

      if (currentThread && nextDetailedIds.has(thread.id) && !hasSameThreadMessageSet(thread, currentThread)) {
        nextDetailedIds.delete(thread.id);
      }
    });
    const mergedThreads = preserveLoadedThreadDetails(nextThreads, currentThreads, nextDetailedIds);
    threadsRef.current = mergedThreads;
    setThreads(mergedThreads);
    detailedThreadIdsRef.current = nextDetailedIds;
    setDetailedThreadIds(nextDetailedIds);
    return mergedThreads;
  };

  useEffect(() => {
    if (!selectedThread || !selectedThreadNeedsImageRepair) {
      return;
    }

    const repairSet = threadRepairInFlightRef.current;

    if (repairSet.has(selectedThread.id)) {
      return;
    }

    repairSet.add(selectedThread.id);

    void (async () => {
      try {
        const response = await fetch(`/api/email/threads/${selectedThread.id}`, {
          method: "POST",
          headers: {
            accept: "application/json"
          }
        });
        const result = (await response.json().catch(() => null)) as { repaired?: number } | { error?: string } | null;

        if (!response.ok) {
          return;
        }

        if ((result as { repaired?: number } | null)?.repaired) {
          await refreshThreads();
        }
      } finally {
        repairSet.delete(selectedThread.id);
      }
    })();
  }, [selectedThread, selectedThreadNeedsImageRepair]);

  const applyThreadReadState = (ids: string[], override: ThreadReadOverride) => {
    const targetIds = new Set(ids);
    const changed = threads.some((thread) => targetIds.has(thread.id) && threadNeedsReadOverride(thread, override));

    setThreads((current) =>
      current.map((thread) => {
        if (!targetIds.has(thread.id)) {
          return thread;
        }

        const nextThread = applyThreadReadOverride(thread, override);

        return nextThread;
      })
    );

    return changed;
  };

  const updateThreadReadState = async ({
    ids,
    shouldMarkRead,
    successMessage,
    suppressAutoRead = false,
    keepalive = false
  }: {
    ids: string[];
    shouldMarkRead: boolean;
    successMessage?: string;
    suppressAutoRead?: boolean;
    keepalive?: boolean;
  }) => {
    if (!ids.length) {
      return;
    }

    const override: ThreadReadOverride = {
      shouldMarkRead,
      readAt: shouldMarkRead ? new Date().toISOString() : null
    };

    ids.forEach((id) => threadReadOverridesRef.current.set(id, override));
    const changed = applyThreadReadState(ids, override);

    if (suppressAutoRead && selectedThreadId && ids.includes(selectedThreadId)) {
      autoReadSuppressedThreadIdRef.current = selectedThreadId;
    } else if (shouldMarkRead && selectedThreadId && ids.includes(selectedThreadId)) {
      autoReadSuppressedThreadIdRef.current = null;
    }

    if (!changed) {
      return;
    }

    setThreadActionBusy(true);

    try {
      const response = await fetch("/api/email/threads", {
        method: "PATCH",
        keepalive,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ids, action: shouldMarkRead ? "markRead" : "markUnread" })
      });

      await parseJson<{ ok: true }>(response);
      void refreshThreads().catch(() => undefined);

      if (successMessage) {
        setFeedback({
          tone: "success",
          message: successMessage
        });
      }
    } catch {
      ids.forEach((id) => threadReadOverridesRef.current.delete(id));
      void refreshThreads().catch(() => undefined);
      autoReadSuppressedThreadIdRef.current = null;
      throw new Error(shouldMarkRead ? "Unable to mark email as read." : "Unable to mark email as unread.");
    } finally {
      setThreadActionBusy(false);
    }
  };

  useEffect(() => {
    if (
      !selectedThread ||
      selectedMailbox === "drafts" ||
      !isThreadUnread(selectedThread) ||
      autoReadSuppressedThreadIdRef.current === selectedThread.id
    ) {
      return;
    }

    void updateThreadReadState({ ids: [selectedThread.id], shouldMarkRead: true }).catch(() => undefined);
  }, [selectedMailbox, selectedThread, selectedThreadId]);

  const toggleThreadSelection = (threadId: string, checked: boolean) => {
    setSelectedThreadIds((current) => (checked ? [...current, threadId] : current.filter((id) => id !== threadId)));
  };

  const performThreadAction = async ({
    ids,
    method,
    action,
    successMessage
  }: {
    ids: string[];
    method: "PATCH" | "DELETE";
    action?: "trash" | "restore" | "star" | "unstar" | "markRead" | "markUnread";
    successMessage: string;
  }) => {
    setThreadActionBusy(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/email/threads", {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(action ? { ids, action } : { ids })
      });

      await parseJson<{ ok: true }>(response);
      await refreshThreads();
      router.refresh();
      setSelectedThreadIds((current) => current.filter((id) => !ids.includes(id)));
      setFeedback({
        tone: "success",
        message: successMessage
      });
    } catch (error) {
      void refreshThreads().catch(() => undefined);
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Unable to update email threads."
      });
    } finally {
      setThreadActionBusy(false);
    }
  };

  const copyToClipboard = async (value: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setFeedback({
        tone: "success",
        message: successMessage
      });
    } catch {
      setFeedback({
        tone: "error",
        message: "Unable to copy content."
      });
    }
  };

  const closeCompose = () => {
    setComposeState(null);

    if (initialCompose?.mode) {
      router.replace("/inbox");
    }
  };

  const openSettingsForPrompt = (prompt: Exclude<MailSetupPrompt, null>) => {
    setMailSetupPrompt(null);
    void prompt;
    router.push("/settings?view=mailbox");
  };

  const connectGmailForPrompt = () => {
    setMailSetupPrompt(null);
    window.location.assign("/api/email/google/connect?returnTo=/settings?view=mailbox");
  };

  const requestComposeAccess = () => {
    if (mailSetup.canSendEmail) {
      return true;
    }

    setMailSetupPrompt("compose");
    return false;
  };

  const openCrmRecordCompose = (email: string | null) => {
    if (!email || !requestComposeAccess()) {
      return;
    }

    setShowCrmRecordsModal(false);
    setComposeState({
      mode: "new",
      prefill: {
        to: email
      }
    });
  };

  const requestSyncAccess = () => {
    if (mailSetup.canSyncEmail) {
      return true;
    }

    setMailSetupPrompt("sync");
    return false;
  };

  const saveDraft = (payload: { to: string; cc: string; bcc: string; subject: string; message: string; html: string }) => {
    const draftId = composeState?.draftId || `draft-${Date.now()}`;
    const nextDraft: DraftEmail = {
      id: draftId,
      to: payload.to,
      cc: payload.cc,
      bcc: payload.bcc,
      subject: payload.subject,
      message: payload.message,
      html: payload.html,
      updatedAt: new Date().toISOString()
    };

    setDrafts((current) => {
      const rest = current.filter((draft) => draft.id !== draftId);
      return [nextDraft, ...rest].sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
    });
    setSelectedMailbox("drafts");
    setSelectedDraftId(draftId);
    setComposeState(null);
    setFeedback({
      tone: "success",
      message: composeState?.draftId ? "Draft updated." : "Draft saved."
    });
  };

  const deleteDraft = (draftId: string) => {
    void (async () => {
      const draft = drafts.find((item) => item.id === draftId);
      const confirmed = await requestConfirmation({
        title: "Delete draft?",
        description: draft?.subject?.trim()
          ? `Draft "${draft.subject.trim()}" will be removed from your saved drafts.`
          : "This draft will be removed from your saved drafts.",
        confirmLabel: "Delete draft"
      });
      if (!confirmed) {
        return;
      }

      setDrafts((current) => current.filter((draft) => draft.id !== draftId));
      if (selectedDraftId === draftId) {
        setSelectedDraftId(null);
      }
      setFeedback({
        tone: "success",
        message: "Draft deleted."
      });
    })();
  };

  const sendEmail = (payload: { to: string; cc: string; bcc: string; subject: string; message: string; html: string; files: File[] }) => {
    if (!mailSetup.canSendEmail) {
      setMailSetupPrompt("compose");
      return;
    }

    const composeSnapshot = composeState;
    const threadId = composeSnapshot?.mode === "reply" && selectedThread ? selectedThread.id : undefined;
    const draftId = composeSnapshot?.draftId;
    const shouldAppendSignature = signatureConfigured && signatureAppendEnabled;
    const htmlWithSignature = shouldAppendSignature ? appendManagedSignatureHtml(payload.html, signatureHtml) : stripManagedSignature(payload.html) || "<p><br></p>";
    const textWithSignature = shouldAppendSignature ? appendManagedSignatureText(payload.message, signatureHtml) : payload.message.trim();

    setComposeState(null);
    if (initialCompose?.mode) {
      router.replace("/inbox");
    }

    startSendingTransition(() => {
      void (async () => {
        setFeedback(null);

        try {
          const formData = new FormData();
          formData.set("to", payload.to);
          formData.set("cc", payload.cc);
          formData.set("bcc", payload.bcc);
          formData.set("subject", payload.subject);
          formData.set("message", textWithSignature);
          formData.set("html", htmlWithSignature);
          if (threadId) {
            formData.set("threadId", threadId);
          }
          payload.files.forEach((file) => formData.append("files", file));

          const response = await fetch("/api/email/send", {
            method: "POST",
            headers: {
              accept: "application/json"
            },
            body: formData
          });
          const result = (await response.json().catch(() => null)) as { error?: string } | { ok: true; threadId?: string } | null;

          if (!response.ok) {
            throw new Error((result as { error?: string } | null)?.error || "Unable to send email");
          }

          const successResult = result as { ok: true; threadId?: string } | null;

          if (draftId) {
            setDrafts((current) => current.filter((draft) => draft.id !== draftId));
            if (selectedDraftId === draftId) {
              setSelectedDraftId(null);
            }
          }

          const refreshedThreads = await refreshThreads();
          router.refresh();
          const updatedThreadId = successResult?.threadId;
          const updatedThread = updatedThreadId ? refreshedThreads.find((thread) => thread.id === updatedThreadId) : null;

          if (updatedThread) {
            setSelectedMailbox(updatedThread.mailbox);
            setSelectedThreadId(updatedThread.id);
          } else if (!threadId) {
            setSelectedMailbox("sent");
          }

          setFeedback({
            tone: "success",
            message: threadId ? "Reply sent and added to the thread." : "Email sent and tracked."
          });
        } catch (error) {
          const failedDraftId = draftId || `draft-${Date.now()}`;

          setDrafts((current) => {
            const rest = current.filter((draft) => draft.id !== failedDraftId);
            return [
              {
                id: failedDraftId,
                to: payload.to,
                cc: payload.cc,
                bcc: payload.bcc,
                subject: payload.subject,
                message: payload.message,
                html: payload.html,
                updatedAt: new Date().toISOString()
              },
              ...rest
            ].sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
          });
          setSelectedMailbox("drafts");
          setSelectedDraftId(failedDraftId);
          setFeedback({
            tone: "error",
            message: `${error instanceof Error ? error.message : "Unable to send email."} Your unsent email was saved as a draft.`
          });
        }
      })();
    });
  };

  const runInboxSync = async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!mailSetup.canSyncEmail) {
      return;
    }

    if (syncInFlightRef.current) {
      return;
    }

    syncInFlightRef.current = true;
    setIsInboxSyncActive(true);
    window.dispatchEvent(new CustomEvent("crm-mail-sync-state", { detail: { syncing: true } }));

    try {
      const response = await fetch("/api/email/sync", {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json"
        }
      });
      const result = (await response.json().catch(() => null)) as { error?: string; synced?: number; repaired?: number; updated?: number } | null;

      if (!response.ok) {
        throw new Error(result?.error || "Unable to sync inbox");
      }

      const syncedCount = result?.synced ?? 0;
      const repairedCount = result?.repaired ?? 0;
      const updatedCount = result?.updated ?? 0;

      if (syncedCount > 0 || repairedCount > 0 || updatedCount > 0) {
        await refreshThreads();
        router.refresh();
      }

      if (!silent) {
        const summary =
          repairedCount > 0
            ? `Inbox sync completed. ${syncedCount} new messages added and ${repairedCount} existing messages repaired.`
            : updatedCount > 0
              ? `Inbox sync completed. ${syncedCount} new messages added and ${updatedCount} read states updated.`
            : `Inbox sync completed. ${syncedCount} new messages added.`;

        setFeedback({
          tone: "success",
          message: summary
        });
      }
    } finally {
      window.dispatchEvent(new CustomEvent("crm-mail-sync-state", { detail: { syncing: false } }));
      syncInFlightRef.current = false;
      setIsInboxSyncActive(false);
    }
  };

  const syncInbox = () => {
    if (!requestSyncAccess()) {
      return;
    }

    startSyncTransition(() => {
      void (async () => {
        setFeedback(null);

        try {
          await runInboxSync();
        } catch (error) {
          setFeedback({
            tone: "error",
            message: error instanceof Error ? error.message : "Unable to sync inbox."
          });
        }
      })();
    });
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!mailSetup.canSyncEmail) {
      return;
    }

    const triggerSilentSync = () => {
      if (document.visibilityState !== "visible") {
        return;
      }

      void runInboxSync({ silent: true }).catch((err) => {
        console.error("[inbox-sync]", err);
      });
    };

    const firstSyncTimeoutId = window.setTimeout(triggerSilentSync, 5000);
    const intervalId = window.setInterval(triggerSilentSync, 60000);
    window.addEventListener("focus", triggerSilentSync);
    document.addEventListener("visibilitychange", triggerSilentSync);

    return () => {
      window.clearTimeout(firstSyncTimeoutId);
      window.clearInterval(intervalId);
      window.removeEventListener("focus", triggerSilentSync);
      document.removeEventListener("visibilitychange", triggerSilentSync);
    };
  }, [mailSetup.canSyncEmail]);

  const resetFilters = () => {
    setFilters(emptyFilters());
    setQuery("");
    setShowFilters(false);
  };

  const openBlankCompose = () => {
    if (!requestComposeAccess()) {
      return;
    }

    setComposeState({ mode: "new" });
  };

  const currentComposeTitle =
    composeState?.mode === "reply"
      ? "Reply"
      : composeState?.mode === "forward"
        ? "Forward"
        : composeState?.mode === "draft"
          ? "Edit draft"
          : "New Message";

  const initialComposeDraft = composeState?.draftId ? drafts.find((draft) => draft.id === composeState.draftId) : null;
  const currentComposeTo =
    composeState?.mode === "reply"
      ? replyTarget
      : composeState?.mode === "forward"
        ? ""
      : composeState?.mode === "draft"
        ? initialComposeDraft?.to || ""
        : composeState?.prefill?.to || initialCompose?.to || "";
  const currentComposeCc =
    composeState?.mode === "draft"
      ? initialComposeDraft?.cc || ""
      : composeState?.prefill?.cc || "";
  const currentComposeBcc =
    composeState?.mode === "draft"
      ? initialComposeDraft?.bcc || ""
      : composeState?.prefill?.bcc || "";
  const currentComposeSubject =
    composeState?.mode === "reply"
      ? prefixSubject("Re: ", selectedThread?.subject || "")
      : composeState?.mode === "forward"
        ? prefixSubject("Fwd: ", selectedThread?.subject || "")
        : composeState?.mode === "draft"
          ? initialComposeDraft?.subject || ""
          : composeState?.prefill?.subject || initialCompose?.subject || "";
  const currentComposeMessage =
    composeState?.mode === "draft"
        ? initialComposeDraft?.message || ""
        : composeState?.prefill?.message || initialCompose?.message || "";
  const currentComposeHtml =
    composeState?.mode === "draft"
      ? initialComposeDraft?.html || ""
      : composeState?.mode === "reply"
        ? buildQuotedReplyHtml(selectedThread?.messages.at(-1))
      : composeState?.mode === "forward"
        ? buildForwardedHtml(selectedThread)
        : composeState?.prefill?.html || "";

  const formatFolderCount = (counts: { total: number; unread: number }, options?: { showUnread?: boolean }) => {
    if (options?.showUnread && counts.unread > 0) {
      return `${counts.unread}/${counts.total}`;
    }

    return String(counts.total);
  };

  const folderButtons = [
    { key: "inbox" as const, label: "Inbox", icon: Inbox, count: formatFolderCount(mailboxCounts.inbox, { showUnread: true }) },
    { key: "sent" as const, label: "Sent", icon: Send, count: formatFolderCount(mailboxCounts.sent) },
    { key: "starred" as const, label: "Starred", icon: Star, count: formatFolderCount(mailboxCounts.starred, { showUnread: true }) },
    { key: "drafts" as const, label: "Drafts", icon: FileText, count: mailboxCounts.drafts },
    { key: "junk" as const, label: "Junk", icon: MailWarning, count: formatFolderCount(mailboxCounts.junk, { showUnread: true }) },
    { key: "trash" as const, label: "Trash", icon: Trash2, count: formatFolderCount(mailboxCounts.trash) },
    { key: "all" as const, label: "All mail", icon: MailPlus, count: formatFolderCount(mailboxCounts.all, { showUnread: true }) }
  ];
  const selectedThreadIdSet = useMemo(() => new Set(selectedThreadIds), [selectedThreadIds]);
  const visibleThreadIds = useMemo(
    () => (selectedMailbox === "drafts" ? [] : paginatedThreads.items.map((thread) => thread.id)),
    [paginatedThreads.items, selectedMailbox]
  );
  const visibleSelectedCount = visibleThreadIds.filter((threadId) => selectedThreadIdSet.has(threadId)).length;
  const allVisibleSelected = visibleThreadIds.length > 0 && visibleSelectedCount === visibleThreadIds.length;
  const someVisibleSelected = visibleSelectedCount > 0 && !allVisibleSelected;
  const selectedThreads = threads.filter((thread) => selectedThreadIdSet.has(thread.id));
  const allSelectedThreadsStarred = selectedThreads.length > 0 && selectedThreads.every((thread) => thread.starred);
  const selectedThreadsHaveUnread = selectedThreads.some((thread) => isThreadUnread(thread));
  const selectedThreadsHaveRead = selectedThreads.some((thread) => !isThreadUnread(thread));

  const toggleSelectAllVisibleThreads = (checked: boolean) => {
    if (!visibleThreadIds.length) {
      return;
    }

    setSelectedThreadIds((current) => {
      if (checked) {
        return Array.from(new Set([...current, ...visibleThreadIds]));
      }

      const visibleSet = new Set(visibleThreadIds);
      return current.filter((threadId) => !visibleSet.has(threadId));
    });
  };

  const markThreadsAsRead = (ids: string[]) => {
    if (!ids.length) {
      return;
    }

    setFeedback(null);
    void updateThreadReadState({
      ids,
      shouldMarkRead: true,
      successMessage: ids.length === 1 ? "Email marked as read." : `${ids.length} emails marked as read.`
    }).catch((error) => {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Unable to mark email as read."
      });
    });
  };

  const markThreadsAsUnread = (ids: string[]) => {
    if (!ids.length) {
      return;
    }

    setFeedback(null);
    void updateThreadReadState({
      ids,
      shouldMarkRead: false,
      suppressAutoRead: true,
      successMessage: ids.length === 1 ? "Email marked as unread." : `${ids.length} emails marked as unread.`
    }).catch((error) => {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Unable to mark email as unread."
      });
    });
  };

  const moveThreadsToTrash = (ids: string[]) => {
    if (!ids.length) {
      return;
    }

    void (async () => {
      const confirmed = await requestConfirmation({
        title: ids.length === 1 ? "Move email to trash?" : "Move emails to trash?",
        description:
          ids.length === 1
            ? "This conversation will move to Trash and can be restored later."
            : `${ids.length} conversations will move to Trash and can be restored later.`,
        confirmLabel: "Move to trash"
      });

      if (!confirmed) {
        return;
      }

      await performThreadAction({
        ids,
        method: "PATCH",
        action: "trash",
        successMessage: ids.length === 1 ? "Email moved to trash." : `${ids.length} emails moved to trash.`
      });
    })();
  };

  const restoreThreads = (ids: string[]) => {
    if (!ids.length) {
      return;
    }

    void performThreadAction({
      ids,
      method: "PATCH",
      action: "restore",
      successMessage: ids.length === 1 ? "Email restored." : `${ids.length} emails restored.`
    });
  };

  const toggleStarThreads = (ids: string[], shouldStar: boolean) => {
    if (!ids.length) {
      return;
    }

    const targetIds = new Set(ids);
    setThreads((current) =>
      current.map((thread) => (targetIds.has(thread.id) ? { ...thread, starred: shouldStar } : thread))
    );

    void performThreadAction({
      ids,
      method: "PATCH",
      action: shouldStar ? "star" : "unstar",
      successMessage: shouldStar
        ? ids.length === 1
          ? "Email starred."
          : `${ids.length} emails starred.`
        : ids.length === 1
          ? "Email unstarred."
          : `${ids.length} emails unstarred.`
    });
  };

  const deleteThreadsForever = (ids: string[]) => {
    if (!ids.length) {
      return;
    }

    void (async () => {
      const confirmed = await requestConfirmation({
        title: ids.length === 1 ? "Delete email forever?" : "Delete emails forever?",
        description:
          ids.length === 1
            ? "This conversation will be permanently removed from the workspace."
            : `${ids.length} conversations will be permanently removed from the workspace.`,
        confirmLabel: "Delete forever"
      });

      if (!confirmed) {
        return;
      }

      await performThreadAction({
        ids,
        method: "DELETE",
        successMessage: ids.length === 1 ? "Email deleted permanently." : `${ids.length} emails deleted permanently.`
      });
    })();
  };

  const openTemplateCompose = (templateId: string) => {
    if (!requestComposeAccess()) {
      return;
    }

    const template = emailTemplates.find((item) => item.id === templateId);

    if (!template) {
      return;
    }

    setComposeState({
      mode: "new",
      prefill: {
        subject: template.subject,
        html: sanitizeMessageHtml(template.html)
      }
    });
    setShowTemplateManager(false);
  };

  const saveTemplate = (payload: { id?: string; name: string; subject: string; html: string }) => {
    const nextTemplate: EmailTemplate = {
      id: payload.id || `template-${Date.now()}`,
      name: payload.name.trim(),
      subject: payload.subject.trim(),
      html: payload.html.trim() || "<p><br></p>",
      updatedAt: new Date().toISOString()
    };

    setEmailTemplates((current) => {
      const rest = current.filter((template) => template.id !== nextTemplate.id);
      return [nextTemplate, ...rest].sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
    });
    setFeedback({
      tone: "success",
      message: payload.id ? `Updated template "${nextTemplate.name}".` : `Saved template "${nextTemplate.name}".`
    });
  };

  const deleteTemplate = (templateId: string) => {
    void (async () => {
      const template = emailTemplates.find((item) => item.id === templateId);
      const confirmed = await requestConfirmation({
        title: "Delete template?",
        description: template
          ? `Template "${template.name}" will be removed from your saved library.`
          : "This template will be removed from your saved library.",
        confirmLabel: "Delete template"
      });
      if (!confirmed) {
        return;
      }

      setEmailTemplates((current) => current.filter((item) => item.id !== templateId));
      setFeedback({
        tone: "success",
        message: template ? `Deleted template "${template.name}".` : "Template deleted."
      });
    })();
  };

  const saveSignature = (payload: { id?: string; name: string; html: string }) => {
    const nextSignature: EmailSignature = {
      id: payload.id || `signature-${Date.now()}`,
      name: payload.name.trim(),
      html: payload.html.trim(),
      updatedAt: new Date().toISOString()
    };

    setSavedSignatures((current) => {
      const rest = current.filter((signature) => signature.id !== nextSignature.id);
      return [nextSignature, ...rest].sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
    });
    setActiveSignatureId(nextSignature.id);
    setFeedback({
      tone: "success",
      message: payload.id ? `Updated signature "${nextSignature.name}".` : `Saved signature "${nextSignature.name}".`
    });
  };

  const deleteSignature = (signatureId: string) => {
    void (async () => {
      const signature = savedSignatures.find((item) => item.id === signatureId);
      const confirmed = await requestConfirmation({
        title: "Delete signature?",
        description: signature
          ? `Signature "${signature.name}" will be removed from your saved signatures.`
          : "This signature will be removed from your saved signatures.",
        confirmLabel: "Delete signature"
      });
      if (!confirmed) {
        return;
      }

      const remaining = savedSignatures.filter((item) => item.id !== signatureId);

      setSavedSignatures(remaining);
      if (activeSignatureId === signatureId) {
        setActiveSignatureId(remaining[0]?.id || null);
      }
      setFeedback({
        tone: "success",
        message: signature ? `Deleted signature "${signature.name}".` : "Signature deleted."
      });
    })();
  };

  const setActiveSignature = (signatureId: string) => {
    setActiveSignatureId(signatureId);
    const signature = savedSignatures.find((item) => item.id === signatureId);
    setFeedback({
      tone: "success",
      message: signature ? `Active signature set to "${signature.name}".` : "Active signature updated."
    });
  };

  const activeList = selectedMailbox === "drafts" ? paginatedDrafts.items : paginatedThreads.items;
  const activeCount = selectedMailbox === "drafts" ? filteredDrafts.length : filteredThreads.length;
  const activeSafePage = selectedMailbox === "drafts" ? paginatedDrafts.safePage : paginatedThreads.safePage;
  const activeTotalPages = selectedMailbox === "drafts" ? paginatedDrafts.totalPages : paginatedThreads.totalPages;
  const activeStart = activeCount ? (activeSafePage - 1) * pageSize + 1 : 0;
  const activeEnd = activeCount ? Math.min(activeSafePage * pageSize, activeCount) : 0;
  const showMailboxSetupEmptyState = selectedMailbox !== "drafts" && !mailSetup.hasPersonalMailbox;
  return (
    <div className="relative overflow-x-hidden">
      <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-[1.85rem] font-semibold tracking-tight text-slate-900">Emails</h1>
          <p className="mt-1 text-sm text-slate-500">Mailbox-style email workspace with folders, drafts, syncing, and full thread reading.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {feedback ? <FeedbackToast message={feedback.message} tone={feedback.tone === "success" ? "info" : "error"} position="inline" /> : null}
          <button
            onClick={syncInbox}
            disabled={isSyncing || isInboxSyncActive}
            className="crm-btn crm-btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing || isInboxSyncActive ? "animate-spin" : ""}`} />
            {isSyncing || isInboxSyncActive ? "Syncing..." : "Sync inbox"}
          </button>
        </div>
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(260px,292px)_minmax(0,1fr)] xl:grid-cols-[220px_292px_minmax(0,1fr)]">
        <Card className="min-w-0 h-fit p-4 lg:col-span-2 xl:col-span-1">
          <button
            onClick={openBlankCompose}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#386df4] px-4 py-3 text-[15px] font-medium text-white hover:bg-[#2d5de0]"
          >
            <MailPlus className="h-4 w-4" />
            New message
          </button>

          <div className="mt-5">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Mailboxes</div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 xl:block xl:space-y-1.5 xl:overflow-visible xl:pb-0">
              {folderButtons.map((folder) => (
                <button
                  key={folder.key}
                  onClick={() => setSelectedMailbox(folder.key)}
                  className={`flex min-w-[128px] shrink-0 items-center justify-between rounded-xl px-3 py-2.5 text-sm transition sm:min-w-[140px] xl:w-full ${
                    selectedMailbox === folder.key ? "bg-[#eef4ff] text-[#386df4]" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <folder.icon className="h-4 w-4" />
                    {folder.label}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${selectedMailbox === folder.key ? "bg-white text-[#386df4]" : "bg-slate-100 text-slate-500"}`}>
                    {folder.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Templates</div>
              <button onClick={() => setShowTemplateManager(true)} className="text-xs font-medium text-[#386df4] hover:text-[#2d5de0]">
                Manage
              </button>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-1">
              {featuredTemplates.map((template) => (
                <div key={template.id} className="rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-900">{template.name}</div>
                      <div className="mt-1 truncate text-xs text-slate-500">{template.subject}</div>
                    </div>
                    <button
                      onClick={() => openTemplateCompose(template.id)}
                      className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-700 transition hover:border-[#bfd2ff] hover:bg-[#eef4ff] hover:text-[#386df4]"
                    >
                      <ArrowUpRight className="h-3 w-3" />
                      Use
                    </button>
                  </div>
                </div>
              ))}

              {!featuredTemplates.length ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                  Save your first email template to reuse subjects and HTML bodies.
                </div>
              ) : null}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Signatures</div>
              <button onClick={() => setShowSignatureManager(true)} className="text-xs font-medium text-[#386df4] hover:text-[#2d5de0]">
                Manage
              </button>
            </div>

            <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900">{activeSignature?.name || "No signature"}</div>
                  <div className="mt-1 text-xs text-slate-500">{signatureConfigured ? "Active signature" : "Add one to get started"}</div>
                </div>
                {signatureConfigured ? (
                  <span className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-[11px] font-semibold text-[#386df4]">Active</span>
                ) : null}
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                <div>
                  <div className="text-xs font-medium text-slate-700">Append signature</div>
                  <div className="mt-0.5 text-[11px] text-slate-500">{signatureConfigured ? "Optional" : "Add one first"}</div>
                </div>
                <ToggleSwitch checked={signatureConfigured && signatureAppendEnabled} disabled={!signatureConfigured} onChange={setSignatureAppendEnabled} />
              </div>
            </div>
          </div>

        </Card>

        <Card className="relative flex min-h-[560px] min-w-0 flex-col overflow-hidden !p-3 sm:min-h-[640px] lg:min-h-[760px] xl:h-[calc(100vh-130px)] xl:min-h-[calc(100vh-130px)]">
          <div className="relative border-b border-slate-200 bg-white px-4 py-4">
            <div className="relative w-full max-w-none sm:max-w-[360px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                className={`${inputClassName} border-slate-200/90 bg-white pl-9 pr-14 text-[13px] shadow-none`}
                placeholder={`Search ${selectedMailbox === "drafts" ? "drafts" : "emails"}`}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>

            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-2 overflow-x-auto">
                <button
                  onClick={() => setShowFilters((current) => !current)}
                  className="crm-btn crm-btn-secondary shrink-0"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </button>

                <button
                  onClick={resetFilters}
                  className="crm-btn crm-btn-secondary shrink-0"
                >
                  Reset
                </button>

              </div>

              <div className="shrink-0 text-[10px] text-slate-400 sm:text-right">
                <span className="font-medium text-slate-700">{activeCount ? `${activeStart}-${activeEnd}` : "0"} of {activeCount}</span>{" "}
                {selectedMailbox === "drafts" ? "drafts" : "threads"}
              </div>
            </div>

            {showFilters && selectedMailbox !== "drafts" ? (
              <div className="mt-2.5 grid gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <AppSelect
                    value={filters.readState}
                    onChange={(event) => setFilters((current) => ({ ...current, readState: event.target.value as Filters["readState"] }))}
                    options={readStateFilterOptions}
                    className={inputClassName}
                  />

                  <AppSelect
                    value={filters.status}
                    onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
                    options={statusFilterOptions}
                    className={inputClassName}
                  />
                </div>

                <AppSelect
                  value={filters.sequence}
                  onChange={(event) => setFilters((current) => ({ ...current, sequence: event.target.value }))}
                  options={sequenceFilterOptions}
                  className={inputClassName}
                />
              </div>
            ) : null}

            {selectedMailbox !== "drafts" && selectedThreadIds.length ? (
              <div className="mt-2.5 flex items-center justify-between gap-1.5 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5">
                    <label className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700">
                      <SelectionCheckbox
                        checked={allVisibleSelected}
                        indeterminate={someVisibleSelected}
                        onChange={(event) => toggleSelectAllVisibleThreads(event.target.checked)}
                        disabled={!visibleThreadIds.length || threadActionBusy}
                        className="accent-[#386df4]"
                      />
                      <span className="font-medium leading-none">{selectedThreadIds.length} selected</span>
                    </label>
                    <div className="flex shrink-0 items-center gap-1">
                    {selectedMailbox === "trash" ? (
                      <>
                        <button
                          type="button"
                          disabled={threadActionBusy}
                          onClick={() => restoreThreads(selectedThreadIds)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label="Restore selected"
                          title="Restore selected"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          disabled={threadActionBusy}
                          onClick={() => deleteThreadsForever(selectedThreadIds)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#ffd1c4] bg-[#fff4f0] text-[#e25f37] transition hover:bg-[#ffe9e1] disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label="Delete forever"
                          title="Delete forever"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <>
                        {selectedThreadsHaveUnread ? (
                          <button
                            type="button"
                            disabled={threadActionBusy}
                            onClick={() => markThreadsAsRead(selectedThreadIds)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            aria-label="Mark selected as read"
                            title="Mark selected as read"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        ) : null}
                        {selectedThreadsHaveRead ? (
                          <button
                            type="button"
                            disabled={threadActionBusy}
                            onClick={() => markThreadsAsUnread(selectedThreadIds)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            aria-label="Mark selected as unread"
                            title="Mark selected as unread"
                          >
                            <Mail className="h-3 w-3" />
                          </button>
                        ) : null}
                        <button
                          type="button"
                          disabled={threadActionBusy}
                          onClick={() => toggleStarThreads(selectedThreadIds, !allSelectedThreadsStarred)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label={allSelectedThreadsStarred ? "Unstar selected" : "Star selected"}
                          title={allSelectedThreadsStarred ? "Unstar selected" : "Star selected"}
                        >
                          <Star className={`h-3 w-3 ${allSelectedThreadsStarred ? "" : "fill-[#f5c84c] text-[#d89d1f]"}`} />
                        </button>
                        <button
                          type="button"
                          disabled={threadActionBusy}
                          onClick={() => moveThreadsToTrash(selectedThreadIds)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#ffd1c4] bg-[#fff4f0] text-[#e25f37] transition hover:bg-[#ffe9e1] disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label="Trash selected"
                          title="Trash selected"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => setSelectedThreadIds([])}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                      aria-label="Clear selection"
                      title="Clear selection"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    </div>
              </div>
            ) : null}

          </div>

          <div className="flex-1 overflow-y-auto bg-white px-3 py-3">
            {selectedMailbox === "drafts"
              ? activeList.map((item) => {
                  const draft = item as DraftEmail;
                  const active = selectedDraftId === draft.id;

                  return (
                    <div key={draft.id} className="pb-2 last:pb-0">
                      <button
                        onClick={() => setSelectedDraftId(draft.id)}
                        className={`flex min-h-[94px] w-full flex-col rounded-[10px] border px-2.5 py-2.5 text-left transition ${
                          active
                            ? "border-[#c8d8ff] bg-[#eef4ff] text-[#386df4]"
                            : "border-slate-200/80 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className={`truncate text-sm font-semibold ${active ? "text-[#386df4]" : "text-slate-900"}`}>{draft.subject || "(No subject)"}</div>
                            <div className={`mt-1 truncate text-sm ${active ? "text-[#5e84f7]" : "text-slate-500"}`}>{formatDraftRecipients(draft)}</div>
                          </div>
                          <span className={`text-[11px] font-medium ${active ? "text-[#5e84f7]" : "text-slate-400"}`}>{formatDraftTimestamp(draft.updatedAt)}</span>
                        </div>
                        <div className={`mt-auto flex items-center justify-between border-t pt-2 text-[11px] ${active ? "border-[#d7e4ff] text-[#5e84f7]" : "border-slate-100 text-slate-400"}`}>
                          <span className="font-medium">Draft</span>
                          <span>{draft.message ? `${draft.message.length} chars` : "Empty"}</span>
                        </div>
                      </button>
                    </div>
                  );
                })
              : activeList.map((item) => {
                  const thread = item as EmailWorkspaceThread;
                  const active = selectedThreadId === thread.id;
                  const unread = isThreadUnread(thread);
                  const MailboxIcon = mailboxIconFor(thread.mailbox);
                  const StatusIcon = thread.latestDirection === "inbound" ? Inbox : Send;

                  return (
                    <div key={thread.id} className="pb-2 last:pb-0">
                      <div
                        className={`relative overflow-hidden rounded-[12px] border transition ${
                          active
                            ? "border-[#c8d8ff] bg-[#eef4ff] text-[#386df4] shadow-[0_10px_24px_rgba(56,109,244,0.08)]"
                            : unread
                              ? "border-[#d8e4ff] bg-[#f7faff] text-slate-700 shadow-[0_8px_20px_rgba(56,109,244,0.04)]"
                              : "border-slate-200/80 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:shadow-[0_8px_20px_rgba(15,23,42,0.04)]"
                        }`}
                      >
                        <button
                          onClick={() => {
                            setSelectedThreadId(thread.id);

                            if (unread) {
                              void updateThreadReadState({ ids: [thread.id], shouldMarkRead: true, keepalive: true }).catch(() => undefined);
                            }
                          }}
                          className="flex w-full items-start gap-2.5 px-3 py-3 text-left"
                        >
                          <div
                            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                              active
                                ? "bg-white text-[#386df4]"
                                : unread
                                  ? "bg-[#e8f0ff] text-[#386df4]"
                                  : thread.latestDirection === "inbound"
                                    ? "bg-[#eef4ff] text-[#386df4]"
                                    : "bg-[#fff3df] text-[#d59628]"
                            }`}
                          >
                            {avatarInitials(thread.recipient, thread.recipientEmail)}
                          </div>

                          <div className="flex h-full min-w-0 flex-1 flex-col">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  {unread && !active ? <span className="h-2 w-2 shrink-0 rounded-full bg-[#386df4]" /> : null}
                                  <div className={`truncate text-sm font-semibold ${active ? "text-[#386df4]" : "text-slate-900"}`}>{thread.recipient}</div>
                                </div>
                                <div className={`mt-1 truncate pr-8 text-sm ${active ? "text-[#5e84f7]" : unread ? "font-medium text-slate-700" : "text-slate-500"}`}>{thread.subject}</div>
                              </div>
                              <div className={`shrink-0 text-[11px] font-medium ${active ? "text-[#5e84f7]" : unread ? "text-[#386df4]" : "text-slate-400"}`}>{thread.sentLabel}</div>
                            </div>
                          </div>
                        </button>

                        <div className={`flex flex-wrap items-center justify-between gap-2 border-t px-3 pb-3 pt-2 text-[11px] ${active ? "border-[#d7e4ff] text-[#5e84f7]" : "border-slate-100 text-slate-400"}`}>
                          <div className="flex min-w-0 items-center gap-2">
                            <div>
                            <SelectionCheckbox
                              checked={selectedThreadIdSet.has(thread.id)}
                              onChange={(event) => toggleThreadSelection(thread.id, event.target.checked)}
                              onClick={(event) => event.stopPropagation()}
                              disabled={threadActionBusy}
                              className="accent-[#386df4]"
                            />
                            </div>
                          <button
                            type="button"
                            disabled={threadActionBusy || thread.trashed}
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleStarThreads([thread.id], !thread.starred);
                            }}
                            className={`pointer-events-auto inline-flex h-6 w-6 items-center justify-center rounded-full border transition ${
                              thread.starred
                                ? "border-[#f5d889] bg-[#fff8de] text-[#d89d1f]"
                                : active
                                  ? "border-[#cfe0ff] bg-white text-[#5e84f7] hover:bg-[#f8fbff]"
                                  : "border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                            } disabled:cursor-not-allowed disabled:opacity-50`}
                            aria-label={thread.starred ? "Unstar email" : "Star email"}
                          >
                            <Star className={`h-3.5 w-3.5 ${thread.starred ? "fill-current" : ""}`} />
                          </button>
                            <span className="inline-flex min-w-0 items-center gap-1.5 font-medium">
                              <StatusIcon className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{thread.statuses[0] || (thread.latestDirection === "inbound" ? "Received" : "Sent")}</span>
                            </span>
                          </div>
                          <div className="inline-flex shrink-0 items-center gap-1.5">
                            <MessagesSquare className="h-3.5 w-3.5" />
                            <span>
                              {thread.messageCount} {thread.messageCount === 1 ? "msg" : "msgs"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

            {!activeCount ? (
              <div className="px-2 py-10">
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 px-6 py-12 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                  {showMailboxSetupEmptyState ? (
                    <>
                      <div className="text-sm font-medium text-slate-700">Mailbox not configured</div>
                      <p className="mt-2 text-sm text-slate-500">Add email settings to load inbox threads for this account.</p>
                    </>
                  ) : (
                    <>
                      <div className="text-sm font-medium text-slate-700">Nothing to show here yet</div>
                      <p className="mt-2 text-sm text-slate-500">
                        {selectedMailbox === "drafts"
                          ? "No drafts match the current search."
                          : selectedMailbox === "starred"
                            ? "No starred emails match the current search and filters."
                          : selectedMailbox === "junk"
                            ? "No junk emails match the current search and filters."
                          : selectedMailbox === "trash"
                            ? "No trashed emails match the current search and filters."
                            : "No email threads match the current mailbox and filters."}
                      </p>
                    </>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          {!showMailboxSetupEmptyState ? (
            <div className="flex items-center border-t border-slate-200/90 bg-white px-3 py-2.5 text-[11px] text-slate-500">
              <div className="flex min-w-0 flex-nowrap items-center gap-1.5 whitespace-nowrap">
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">Show</span>
                  <AppSelect
                    value={pageSize}
                    onChange={(event) => {
                      setPageSize(Number(event.target.value));
                      setCurrentPage(1);
                    }}
                    menuMinWidth={64}
                    className="min-w-[40px] rounded-full border border-slate-200 bg-white px-1.5 py-1 text-[11px] font-medium text-slate-700 outline-none transition focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/10"
                    style={{ paddingRight: "1.9rem" }}
                  >
                    {[10, 20, 30].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </AppSelect>
                </div>

                <button
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={activeSafePage === 1}
                  className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Prev
                </button>
                <div className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                  {activeSafePage} / {activeTotalPages}
                </div>
                <button
                  onClick={() => setCurrentPage((page) => Math.min(activeTotalPages, page + 1))}
                  disabled={activeSafePage === activeTotalPages}
                  className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </Card>

        <Card className="min-w-0 overflow-hidden p-0 lg:min-h-[760px] xl:min-h-[calc(100vh-130px)]">
          {selectedMailbox === "drafts" ? (
            selectedDraft ? (
              <div className="flex h-full flex-col">
              <div className="relative border-b border-slate-200 px-5 py-5">
                  <div className="flex flex-col gap-4">
                    <div className="min-w-0 flex-1 pr-0 lg:pr-44">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Draft</div>
                      <h2 className="mt-2 text-[1.35rem] font-semibold tracking-tight text-slate-900">{selectedDraft.subject || "(No subject)"}</h2>
                      <p className="mt-1 text-sm text-slate-500">{formatDraftRecipients(selectedDraft)} • Updated {formatDraftTimestamp(selectedDraft.updatedAt)}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          if (!requestComposeAccess()) {
                            return;
                          }

                          setComposeState({ mode: "draft", draftId: selectedDraft.id });
                        }}
                        className="crm-btn crm-btn-secondary"
                      >
                        <FileText className="h-4 w-4" />
                        Edit draft
                      </button>
                      <button
                        onClick={() => deleteDraft(selectedDraft.id)}
                        className="crm-btn crm-btn-secondary"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-white px-5 py-5">
                  {selectedDraft.html ? (
                    <div
                      className="text-[15px] leading-7 text-slate-700 [&_a]:text-[#386df4] [&_a]:underline [&_li]:ml-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5"
                      dangerouslySetInnerHTML={{ __html: sanitizeMessageHtml(selectedDraft.html) }}
                    />
                  ) : (
                    <div className="whitespace-pre-wrap text-[15px] leading-7 text-slate-700">{selectedDraft.message || "Draft body is empty."}</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center px-6 py-16 text-center">
                <div className="max-w-md">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eef4ff] text-[#386df4]">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h2 className="mt-4 text-[1.2rem] font-semibold text-slate-900">Choose a draft</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Saved drafts appear here. Open one to continue editing or create a new message.</p>
                </div>
              </div>
            )
          ) : selectedThread ? (
            <div className="flex h-full flex-col">
              <div className="relative border-b border-slate-200 px-5 py-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Conversation</div>
                    <h2 className="mt-2 text-[1.4rem] font-semibold tracking-tight text-slate-900">{selectedThread.subject}</h2>
                    <p className="mt-1 text-sm text-slate-500">With {selectedThread.recipient} • {selectedThread.recipientEmail}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedThread.statuses.map((status) => (
                        <span key={`detail-${status}`} className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusTone(status)}`}>
                          {status}
                        </span>
                      ))}
                    </div>
                    </div>

                    <div className="flex min-w-0 self-stretch flex-col items-start justify-between gap-3 lg:max-w-[46%] lg:items-end">
                      <div className="shrink-0">{crmRecordsControl}</div>
                      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                        {selectedThread.trashed ? (
                          <>
                          <button
                            type="button"
                            disabled={threadActionBusy}
                            onClick={() => restoreThreads([selectedThread.id])}
                            className="crm-btn crm-btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <RotateCcw className="h-4 w-4" />
                            Restore
                          </button>
                          <button
                            type="button"
                            disabled={threadActionBusy}
                            onClick={() => deleteThreadsForever([selectedThread.id])}
                            className="inline-flex items-center gap-2 rounded-xl border border-[#ffd1c4] bg-[#fff4f0] px-4 py-2.5 text-sm font-medium text-[#e25f37] transition hover:bg-[#ffe9e1] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete forever
                          </button>
                          </>
                        ) : (
                          <>
                          <button
                            type="button"
                            disabled={threadActionBusy}
                            onClick={() =>
                              isThreadUnread(selectedThread)
                                ? markThreadsAsRead([selectedThread.id])
                                : markThreadsAsUnread([selectedThread.id])
                            }
                            className="crm-btn crm-btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isThreadUnread(selectedThread) ? <Check className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                            {isThreadUnread(selectedThread) ? "Mark read" : "Mark unread"}
                          </button>
                          <button
                            type="button"
                            disabled={threadActionBusy}
                            onClick={() => toggleStarThreads([selectedThread.id], !selectedThread.starred)}
                            className={`crm-btn inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                              selectedThread.starred
                                ? "border-[#f5d889] bg-[#fff8de] text-[#d89d1f] hover:bg-[#fff2c7]"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <Star className={`h-4 w-4 ${selectedThread.starred ? "fill-current" : ""}`} />
                            {selectedThread.starred ? "Unstar" : "Star"}
                          </button>
                          <button
                            onClick={() => {
                              if (!requestComposeAccess()) {
                                return;
                              }

                              setComposeState({ mode: "reply" });
                            }}
                            className="crm-btn crm-btn-secondary"
                          >
                            <Reply className="h-4 w-4" />
                            Reply
                          </button>
                          <button
                            onClick={() => {
                              if (!requestComposeAccess()) {
                                return;
                              }

                              setComposeState({ mode: "forward" });
                            }}
                            className="crm-btn crm-btn-secondary"
                          >
                            <Forward className="h-4 w-4" />
                            Forward
                          </button>
                          <button
                            type="button"
                            disabled={threadActionBusy}
                            onClick={() => moveThreadsToTrash([selectedThread.id])}
                            className="crm-btn inline-flex items-center gap-2 rounded-xl border border-[#ffd1c4] bg-[#fff4f0] px-4 py-2.5 text-sm font-medium text-[#e25f37] transition hover:bg-[#ffe9e1] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Trash2 className="h-4 w-4" />
                            Move to trash
                          </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    <Clock3 className="h-3.5 w-3.5" />
                    {orderedSelectedMessages.length} message{orderedSelectedMessages.length === 1 ? "" : "s"}
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setMessageOrder((current) => (current === "oldest" ? "newest" : "oldest"))}
                      className="crm-btn crm-btn-secondary inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <ArrowUpDown className="h-4 w-4" />
                      {messageOrder === "oldest" ? "Oldest first" : "Newest first"}
                    </button>
                    <button
                      onClick={() => void copyToClipboard(selectedThread.recipientEmail, "Recipient email copied.")}
                      className="crm-btn crm-btn-secondary inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Copy className="h-4 w-4" />
                      Copy address
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-white px-5 py-2">
                {selectedThreadNeedsDetail ? (
                  <div className="flex items-center gap-3 py-8 text-sm text-slate-500">
                    {selectedThreadDetailError ? (
                      <MailWarning className="h-4 w-4 text-[#f0643f]" />
                    ) : (
                      <Loader2 className={`h-4 w-4 text-slate-400 ${selectedThreadDetailLoading ? "animate-spin" : ""}`} />
                    )}
                    <span>{selectedThreadDetailError ? "Unable to load this conversation right now." : "Loading conversation..."}</span>
                  </div>
                ) : orderedSelectedMessages.length ? (
                  <div>
                    {orderedSelectedMessages.map((message) => {
                      const rendered = renderMessageContent(message);

                      return (
                        <div key={message.id} className="border-b border-slate-200 py-5 last:border-b-0">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex items-start gap-3">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold ${
                                  message.direction === "outbound" ? "bg-[#fff2df] text-[#d59628]" : "bg-[#eef4ff] text-[#386df4]"
                                }`}
                              >
                                {avatarInitials(message.fromName, message.fromEmail)}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900">{message.fromName}</div>
                                <div className="text-sm text-slate-500">{message.fromEmail}</div>
                                <div className="mt-1 text-sm text-slate-400">To {message.toEmail}</div>
                                {message.ccEmail ? <div className="mt-1 text-sm text-slate-400">Cc {message.ccEmail}</div> : null}
                                {message.bccEmail ? <div className="mt-1 text-sm text-slate-400">Bcc {message.bccEmail}</div> : null}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
                              <span>{message.sentAt}</span>
                              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${message.direction === "outbound" ? "bg-[#fff7e8] text-[#c98817]" : "bg-[#eef4ff] text-[#386df4]"}`}>
                                {message.direction === "outbound" ? "Sent" : "Received"}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3">
                            {rendered.kind === "html" ? (
                              <HtmlIframePreview 
                                html={rendered.rawUnsanitized || rendered.content}
                                emptyHtml="<p>No content</p>"
                                containerClassName="w-full bg-white"
                                minHeight={120}
                                maxHeight={1600}
                                heightViewportRatio={0.8}
                              />
                            ) : (
                              <div className="whitespace-pre-wrap break-words text-[15px] leading-7 text-slate-700">{rendered.content}</div>
                            )}
                          </div>

                          {message.attachments.length ? (
                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                              {message.attachments.map((attachment, attachmentIndex) => (
                                <div
                                  key={`${message.id}-${attachment.fileName}-${attachmentIndex}`}
                                  className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50 p-3 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.45)]"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef4ff] text-[#386df4]">
                                      <Paperclip className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="truncate text-sm font-semibold text-slate-800" title={attachment.fileName}>
                                        {attachment.fileName}
                                      </div>
                                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                        <span className="rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-600">
                                          {getAttachmentLabel(attachment.contentType)}
                                        </span>
                                        <span>{formatAttachmentSize(attachment.size)}</span>
                                      </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                      <a
                                        href={getEmailAttachmentHref(message.id, attachmentIndex)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-[#386df4]/30 hover:text-[#386df4]"
                                      >
                                        <ArrowUpRight className="h-3 w-3" />
                                        View
                                      </a>
                                      <a
                                        href={getEmailAttachmentHref(message.id, attachmentIndex, true)}
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#386df4] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#2d5de0]"
                                      >
                                        <Download className="h-3 w-3" />
                                        Download
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-sm text-slate-500">
                    No stored thread history for this email yet.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center px-6 py-16 text-center">
              <div className="max-w-md">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eef4ff] text-[#386df4]">
                  <Inbox className="h-6 w-6" />
                </div>
                {!mailSetup.hasPersonalMailbox ? (
                  <>
                    <h2 className="mt-4 text-[1.2rem] font-semibold text-slate-900">Set up your mailbox</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">Connect Gmail or save your own SMTP and IMAP settings before sending and syncing email from this workspace.</p>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                      <button
                        onClick={connectGmailForPrompt}
                        disabled={!mailSetup.googleAuthAvailable}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#386df4] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                        Connect Gmail
                      </button>
                      <button
                        onClick={() => openSettingsForPrompt("compose")}
                        className="crm-btn crm-btn-secondary"
                      >
                        Open Settings
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="mt-4 text-[1.2rem] font-semibold text-slate-900">Choose a conversation</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">Open a thread from the selected mailbox to read the full email body, reply, or forward it.</p>
                  </>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
      <ComposeModal
        open={composeState !== null}
        mode={composeState?.mode || "new"}
        title={currentComposeTitle}
        initialTo={currentComposeTo}
        initialCc={currentComposeCc}
        initialBcc={currentComposeBcc}
        initialSubject={currentComposeSubject}
        initialMessage={currentComposeMessage}
        initialHtml={currentComposeHtml}
        busy={isSending}
        saveLabel={composeState?.mode === "draft" ? "Update draft" : "Save draft"}
        signatureConfigured={signatureConfigured}
        signatureAppendEnabled={signatureAppendEnabled}
        onSignatureAppendChange={setSignatureAppendEnabled}
        onClose={closeCompose}
        onSubmit={sendEmail}
        onSaveDraft={saveDraft}
      />

      <TemplateManagerModal
        open={showTemplateManager}
        templates={templateLibrary}
        signatureHtml={signatureHtml}
        signatureAppendEnabled={signatureAppendEnabled}
        onClose={() => setShowTemplateManager(false)}
        onSave={saveTemplate}
        onDelete={deleteTemplate}
        onUseTemplate={openTemplateCompose}
      />

      <SignatureEditorModal
        open={showSignatureManager}
        signatures={savedSignatures}
        activeSignatureId={activeSignatureId}
        onClose={() => setShowSignatureManager(false)}
        onDelete={deleteSignature}
        onSetActive={setActiveSignature}
        onSave={saveSignature}
      />
      {showCrmRecordsModal ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/36 p-4"
          onClick={() => setShowCrmRecordsModal(false)}
        >
          <div
            className="w-full max-w-[720px] overflow-hidden rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcff_100%)] shadow-[0_24px_70px_rgba(15,23,42,0.14)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="text-[1.15rem] font-semibold tracking-tight text-slate-900">Linked to this email thread</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {crmLinksLoading ? "Checking CRM matches for this conversation." : `${crmRecordCount} linked record${crmRecordCount === 1 ? "" : "s"} found.`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCrmRecordsModal(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-5 py-5">
              {crmLinksLoading ? (
                <div className="flex min-h-[240px] items-center justify-center text-sm text-slate-500">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading linked CRM records...
                </div>
              ) : crmRecordCount ? (
                <div className="space-y-5">
                  {selectedThreadCrmLinks?.contacts.length ? (
                    <div>
                      <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-400">Contacts</div>
                      <div className="mt-3 grid gap-3">
                        {selectedThreadCrmLinks.contacts.map((contact) => (
                          <div key={`crm-modal-contact-${contact.id}`} className="rounded-2xl border border-slate-200 bg-white p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <div className="text-base font-semibold text-slate-900">{contact.fullName}</div>
                                <div className="mt-1 text-sm text-slate-500">{contact.email || "No email saved"}</div>
                                {contact.title || contact.companyName ? (
                                  <div className="mt-2 text-sm text-slate-500">
                                    {[contact.title, contact.companyName].filter(Boolean).join(" • ")}
                                  </div>
                                ) : null}
                              </div>
                              <div className="flex flex-wrap gap-2 sm:justify-end">
                                {contact.email ? (
                                  <button
                                    type="button"
                                    onClick={() => openCrmRecordCompose(contact.email)}
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                  >
                                    <MailPlus className="h-4 w-4" />
                                    Compose email
                                  </button>
                                ) : null}
                                <Link
                                  href={`/contacts/${contact.id}`}
                                  onClick={() => setShowCrmRecordsModal(false)}
                                  className="inline-flex items-center gap-2 rounded-xl border border-[#d7e4ff] bg-[#eef4ff] px-3.5 py-2 text-sm font-medium text-[#386df4] transition hover:bg-[#dde8ff]"
                                >
                                  <ArrowUpRight className="h-4 w-4" />
                                  View in CRM
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {selectedThreadCrmLinks?.leads.length ? (
                    <div>
                      <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-400">Leads</div>
                      <div className="mt-3 grid gap-3">
                        {selectedThreadCrmLinks.leads.map((lead) => (
                          <div key={`crm-modal-lead-${lead.id}`} className="rounded-2xl border border-slate-200 bg-white p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <div className="text-base font-semibold text-slate-900">{lead.name}</div>
                                <div className="mt-1 text-sm text-slate-500">{lead.email || "No email saved"}</div>
                                <div className="mt-2 text-sm text-slate-500">{[lead.status, lead.company].filter(Boolean).join(" • ") || "Lead record"}</div>
                              </div>
                              <div className="flex flex-wrap gap-2 sm:justify-end">
                                {lead.email ? (
                                  <button
                                    type="button"
                                    onClick={() => openCrmRecordCompose(lead.email)}
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                  >
                                    <MailPlus className="h-4 w-4" />
                                    Compose email
                                  </button>
                                ) : null}
                                <Link
                                  href={`/leads?leadId=${lead.id}`}
                                  onClick={() => setShowCrmRecordsModal(false)}
                                  className="inline-flex items-center gap-2 rounded-xl border border-[#d7e4ff] bg-[#eef4ff] px-3.5 py-2 text-sm font-medium text-[#386df4] transition hover:bg-[#dde8ff]"
                                >
                                  <ArrowUpRight className="h-4 w-4" />
                                  View in CRM
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex min-h-[240px] flex-col items-center justify-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#eef4ff] text-[#386df4]">
                    <Link2 className="h-6 w-6" />
                  </div>
                  <h4 className="mt-4 text-[1.05rem] font-semibold text-slate-900">No CRM record linked yet</h4>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                    This email thread is not matched to a lead or contact yet. Once the CRM record is created with the same email address, it will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
      <MailboxSetupModal
        open={mailSetupPrompt !== null}
        prompt={mailSetupPrompt}
        googleAuthAvailable={mailSetup.googleAuthAvailable}
        onClose={() => setMailSetupPrompt(null)}
        onConnectGmail={connectGmailForPrompt}
        onOpenSettings={() => openSettingsForPrompt(mailSetupPrompt || "compose")}
      />
      {confirmationDialog}
    </div>
  );
}

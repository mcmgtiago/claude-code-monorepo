"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Download,
  ExternalLink,
  Forward,
  Inbox,
  Loader2,
  Mail,
  MessagesSquare,
  Reply,
  RotateCcw,
  Search,
  Star,
  Trash2,
  Paperclip,
  X
} from "lucide-react";
import { FeedbackToast } from "@/components/feedback-toast";
import { avatarInitials, statusTone, type EmailWorkspaceMessage, type EmailWorkspaceThread } from "@/lib/email-workspace";

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

type RelatedEmailResponse = {
  context: {
    kind: "lead" | "contact" | "thread" | "email";
    id?: string;
    label: string;
    primaryEmail: string | null;
    participantEmails: string[];
  };
  contacts: RelatedCrmContact[];
  leads: RelatedCrmLead[];
  threads: EmailWorkspaceThread[];
};

type FeedbackState = {
  tone: "success" | "error";
  message: string;
};

function getMessageTextContent(message: EmailWorkspaceMessage) {
  return message.body?.trim() || message.rawBody?.trim() || "";
}

function renderMessageContent(message: EmailWorkspaceMessage) {
  const html = message.bodyHtml?.trim() || message.rawBodyHtml?.trim() || "";
  if (html) {
    return { kind: "html" as const, content: html };
  }

  return {
    kind: "text" as const,
    content: getMessageTextContent(message) || "No content available."
  };
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

async function parseJson<T>(response: Response) {
  const payload = (await response.json().catch(() => null)) as T | { error?: string } | null;

  if (!response.ok) {
    throw new Error((payload as { error?: string } | null)?.error || "Request failed");
  }

  return payload as T;
}

export function RelatedEmailModal({
  open,
  onClose,
  leadId,
  contactId,
  email,
  title,
  subtitle,
  composeHref
}: {
  open: boolean;
  onClose: () => void;
  leadId?: string;
  contactId?: string;
  email?: string | null;
  title: string;
  subtitle?: string;
  composeHref?: string | null;
}) {
  const router = useRouter();
  const [data, setData] = useState<RelatedEmailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [threadActionBusy, setThreadActionBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const requestUrl = useMemo(() => {
    const params = new URLSearchParams();

    if (leadId) {
      params.set("leadId", leadId);
    } else if (contactId) {
      params.set("contactId", contactId);
    } else if (email) {
      params.set("email", email);
    } else {
      return null;
    }

    return `/api/email/threads/related?${params.toString()}`;
  }, [contactId, email, leadId]);

  useEffect(() => {
    if (!open || !requestUrl) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setFeedback(null);

    void (async () => {
      try {
        const response = await fetch(requestUrl, { cache: "no-store" });
        const result = await parseJson<RelatedEmailResponse>(response);

        if (cancelled) {
          return;
        }

        setData(result);
        setSelectedThreadId(result.threads[0]?.id || null);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setData(null);
        setSelectedThreadId(null);
        setFeedback({
          tone: "error",
          message: error instanceof Error ? error.message : "Unable to load related email."
        });
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, requestUrl]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, open]);

  const filteredThreads = useMemo(() => {
    const searchValue = query.trim().toLowerCase();
    if (!data) {
      return [];
    }

    return data.threads.filter((thread) => {
      const messageRecipients = thread.messages.map((message) => `${message.toEmail} ${message.ccEmail} ${message.bccEmail}`).join(" ");
      const haystack = `${thread.recipient} ${thread.recipientEmail} ${messageRecipients} ${thread.subject} ${thread.preview}`.toLowerCase();
      return !searchValue || haystack.includes(searchValue);
    });
  }, [data, query]);

  useEffect(() => {
    if (!filteredThreads.some((thread) => thread.id === selectedThreadId)) {
      setSelectedThreadId(filteredThreads[0]?.id || null);
    }
  }, [filteredThreads, selectedThreadId]);

  const selectedThread = filteredThreads.find((thread) => thread.id === selectedThreadId) || filteredThreads[0] || null;

  const refreshData = async () => {
    if (!requestUrl) {
      return;
    }

    const response = await fetch(requestUrl, { cache: "no-store" });
    const result = await parseJson<RelatedEmailResponse>(response);
    setData(result);
    setSelectedThreadId((current) => {
      if (current && result.threads.some((thread) => thread.id === current)) {
        return current;
      }

      return result.threads[0]?.id || null;
    });
  };

  const performThreadAction = async ({
    ids,
    method,
    action,
    successMessage
  }: {
    ids: string[];
    method: "PATCH" | "DELETE";
    action?: "trash" | "restore" | "star" | "unstar";
    successMessage: string;
  }) => {
    setThreadActionBusy(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/email/threads", {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(action ? { ids, action } : { ids })
      });

      await parseJson<{ ok: true }>(response);
      await refreshData();
      setFeedback({
        tone: "success",
        message: successMessage
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Unable to update email thread."
      });
    } finally {
      setThreadActionBusy(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.18)] p-4 backdrop-blur-[2px] sm:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex h-[min(92vh,860px)] w-full max-w-[1220px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.14)]">
        <div className="border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(56,109,244,0.08),transparent_28%),linear-gradient(180deg,#fbfdff_0%,#f4f8ff_100%)] px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-[1.35rem] font-semibold tracking-tight text-slate-900">{title}</h2>
              {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
              {data?.context.participantEmails.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {data.context.participantEmails.map((participantEmail) => (
                    <span key={participantEmail} className="rounded-full border border-[#d7e4ff] bg-white/90 px-3 py-1 text-xs font-medium text-slate-600">
                      {participantEmail}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              {composeHref ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push(composeHref as Route);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#386df4] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2d5de0]"
                >
                  <Mail className="h-4 w-4" />
                  Compose
                </button>
              ) : null}
              <button onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="flex min-h-0 flex-col border-b border-slate-200 bg-[#fbfcff] lg:border-b-0 lg:border-r">
            <div className="border-b border-slate-200 px-4 py-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search related emails"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/10"
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
              {loading ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading email history...
                </div>
              ) : filteredThreads.length ? (
                filteredThreads.map((thread) => {
                  const active = selectedThread?.id === thread.id;
                  return (
                    <button
                      key={thread.id}
                      type="button"
                      onClick={() => setSelectedThreadId(thread.id)}
                      className={`mb-2 flex w-full flex-col rounded-2xl border px-3 py-3 text-left transition last:mb-0 ${
                        active
                          ? "border-[#c8d8ff] bg-[#eef4ff] text-[#386df4] shadow-[0_12px_28px_rgba(56,109,244,0.08)]"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${active ? "bg-white text-[#386df4]" : "bg-[#eef4ff] text-[#386df4]"}`}>
                          {avatarInitials(thread.recipient, thread.recipientEmail)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`truncate text-sm font-semibold ${active ? "text-[#386df4]" : "text-slate-900"}`}>{thread.recipient}</div>
                          <div className={`mt-1 truncate text-sm ${active ? "text-[#5e84f7]" : "text-slate-600"}`}>{thread.subject}</div>
                          <div className={`mt-2 line-clamp-2 text-xs leading-5 ${active ? "text-[#5e84f7]" : "text-slate-400"}`}>{thread.preview}</div>
                        </div>
                      </div>
                      <div className={`mt-3 flex items-center justify-between border-t pt-2 text-[11px] ${active ? "border-[#d7e4ff] text-[#5e84f7]" : "border-slate-100 text-slate-400"}`}>
                        <span>{thread.sentLabel}</span>
                        <span>{thread.messageCount} {thread.messageCount === 1 ? "msg" : "msgs"}</span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eef4ff] text-[#386df4]">
                    <Inbox className="h-5 w-5" />
                  </div>
                  <div className="mt-4 text-sm font-semibold text-slate-900">No synced email found</div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Related email threads will appear here once this address has synced mailbox activity.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="min-h-0 bg-white">
            {selectedThread ? (
              <div className="flex h-full flex-col">
                <div className="border-b border-slate-200 px-5 py-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Conversation</div>
                      <h3 className="mt-2 text-[1.25rem] font-semibold tracking-tight text-slate-900">{selectedThread.subject}</h3>
                      <p className="mt-1 text-sm text-slate-500">With {selectedThread.recipient} • {selectedThread.recipientEmail}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedThread.statuses.map((status) => (
                          <span key={status} className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusTone(status)}`}>
                            {status}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {selectedThread.trashed ? (
                        <>
                          <button
                            type="button"
                            disabled={threadActionBusy}
                            onClick={() => void performThreadAction({ ids: [selectedThread.id], method: "PATCH", action: "restore", successMessage: "Email restored." })}
                            className="crm-btn crm-btn-secondary disabled:opacity-60"
                          >
                            <RotateCcw className="h-4 w-4" />
                            Restore
                          </button>
                          <button
                            type="button"
                            disabled={threadActionBusy}
                            onClick={() => void performThreadAction({ ids: [selectedThread.id], method: "DELETE", successMessage: "Email deleted permanently." })}
                            className="inline-flex items-center gap-2 rounded-xl border border-[#ffd1c4] bg-[#fff4f0] px-4 py-2.5 text-sm font-medium text-[#e25f37] hover:bg-[#ffe9e1] disabled:opacity-60"
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
                              void performThreadAction({
                                ids: [selectedThread.id],
                                method: "PATCH",
                                action: selectedThread.starred ? "unstar" : "star",
                                successMessage: selectedThread.starred ? "Email unstarred." : "Email starred."
                              })
                            }
                            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition disabled:opacity-60 ${
                              selectedThread.starred
                                ? "border-[#f5d889] bg-[#fff8de] text-[#d89d1f] hover:bg-[#fff2c7]"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <Star className={`h-4 w-4 ${selectedThread.starred ? "fill-current" : ""}`} />
                            {selectedThread.starred ? "Unstar" : "Star"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              router.push(`/inbox?thread=${selectedThread.id}&compose=new&to=${encodeURIComponent(selectedThread.recipientEmail)}&subject=${encodeURIComponent(`Re: ${selectedThread.subject}`)}`);
                            }}
                            className="crm-btn crm-btn-secondary"
                          >
                            <Reply className="h-4 w-4" />
                            Reply in inbox
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              router.push(`/inbox?thread=${selectedThread.id}`);
                            }}
                            className="crm-btn crm-btn-secondary"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Open in inbox
                          </button>
                          <button
                            type="button"
                            disabled={threadActionBusy}
                            onClick={() => void performThreadAction({ ids: [selectedThread.id], method: "PATCH", action: "trash", successMessage: "Email moved to trash." })}
                            className="inline-flex items-center gap-2 rounded-xl border border-[#ffd1c4] bg-[#fff4f0] px-4 py-2.5 text-sm font-medium text-[#e25f37] hover:bg-[#ffe9e1] disabled:opacity-60"
                          >
                            <Trash2 className="h-4 w-4" />
                            Move to trash
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {data && (data.contacts.length || data.leads.length) ? (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-[#fbfcff] p-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Connected CRM Records</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {data.contacts.map((contact) => (
                          <Link
                            key={`contact-${contact.id}`}
                            href={`/contacts/${contact.id}`}
                            onClick={onClose}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                          >
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            {contact.fullName}
                          </Link>
                        ))}
                        {data.leads.map((lead) => (
                          <Link
                            key={`lead-${lead.id}`}
                            href={`/leads?leadId=${lead.id}`}
                            onClick={onClose}
                            className="inline-flex items-center gap-2 rounded-full border border-[#d7e4ff] bg-[#eef4ff] px-3 py-1.5 text-xs font-medium text-[#386df4] hover:bg-[#dde8ff]"
                          >
                            <MessagesSquare className="h-3.5 w-3.5" />
                            {lead.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2">
                  {selectedThread.messages.map((message) => {
                    const rendered = renderMessageContent(message);

                    return (
                      <div key={message.id} className="border-b border-slate-200 py-5 last:border-b-0">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold ${message.direction === "outbound" ? "bg-[#fff2df] text-[#d59628]" : "bg-[#eef4ff] text-[#386df4]"}`}>
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

                        <div className="mt-4 flex items-center justify-end gap-2">
                          {message.direction === "inbound" ? (
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                router.push(`/inbox?thread=${selectedThread.id}&compose=new&to=${encodeURIComponent(message.fromEmail)}&subject=${encodeURIComponent(`Re: ${selectedThread.subject}`)}`);
                              }}
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                            >
                              <Forward className="h-3.5 w-3.5" />
                              Reply
                            </button>
                          ) : null}
                        </div>

                        <div className="mt-3">
                          {rendered.kind === "html" ? (
                            <div
                              className="overflow-x-auto break-words text-[15px] leading-7 text-slate-700 [&_a]:break-all [&_a]:text-[#386df4] [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-slate-200 [&_blockquote]:pl-4 [&_img]:max-w-full [&_li]:ml-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-slate-900 [&_pre]:p-4 [&_pre]:text-slate-100 [&_strong]:font-semibold [&_table]:max-w-full [&_ul]:list-disc [&_ul]:pl-5"
                              dangerouslySetInnerHTML={{ __html: rendered.content }}
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
                                className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50 p-3"
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
                                      <ExternalLink className="h-3 w-3" />
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
              </div>
            ) : (
              <div className="flex h-full items-center justify-center px-6 py-16 text-center">
                <div className="max-w-md">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eef4ff] text-[#386df4]">
                    <MessagesSquare className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-[1.2rem] font-semibold text-slate-900">No conversation selected</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">Choose a related email thread from the left to review the full conversation.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {feedback ? <div className="px-5 pb-4"><FeedbackToast message={feedback.message} position="inline" /></div> : null}
      </div>
    </div>
  );
}

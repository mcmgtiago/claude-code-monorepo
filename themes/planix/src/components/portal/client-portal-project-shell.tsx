"use client";

import Link from "next/link";
import { ArrowLeft, Bell, CalendarDays, Download, FolderKanban, MessageSquareMore, MessagesSquare, UserRound } from "lucide-react";

import type {
  ClientPortalDiscussion,
  ClientPortalFile,
  ClientPortalNotification,
  ClientPortalProject,
  ClientPortalTask,
} from "@/data/client-portal";
import { cn } from "@/lib/utils";

function statusClasses(status: string) {
  if (status === "Completed") {
    return "border-[var(--green)]/20 bg-[var(--green)]/10 text-[var(--green)]";
  }

  if (status === "Review" || status === "In Review") {
    return "border-[#f2c97d]/20 bg-[#f2c97d]/12 text-[#f2c97d]";
  }

  if (status === "In Delivery" || status === "In Progress") {
    return "border-[#7fb8ff]/20 bg-[#7fb8ff]/10 text-[#9dc5ff]";
  }

  return "border-[var(--accent)]/20 bg-[var(--accent)]/10 text-[var(--accent)]";
}

function taskStatusLabel(statusId: string) {
  if (statusId === "progress") {
    return "In Progress";
  }

  if (statusId === "review") {
    return "In Review";
  }

  if (statusId === "completed" || statusId === "done") {
    return "Completed";
  }

  return "Open";
}

function formatDate(value?: string | null) {
  if (!value) {
    return "No due date";
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatBytes(value: number) {
  if (value >= 1024 * 1024) {
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (value >= 1024) {
    return `${Math.round(value / 1024)} KB`;
  }

  return `${value} B`;
}

export function ClientPortalProjectShell({
  project,
  tasks,
  files,
  discussions,
  notifications,
  canMessage,
}: {
  project: ClientPortalProject;
  tasks: ClientPortalTask[];
  files: ClientPortalFile[];
  discussions: ClientPortalDiscussion[];
  notifications: ClientPortalNotification[];
  canMessage: boolean;
}) {
  return (
    <main className="bg-dashboard min-h-screen text-[var(--text-primary)]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-[28px] border border-white/8 bg-[rgba(12,12,14,0.92)] p-6 shadow-[0_32px_80px_rgba(0,0,0,0.3)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Link
                href="/portal"
                className="inline-flex items-center gap-2 rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.03] px-4 py-2 text-[13px] font-medium text-[var(--text-secondary)] transition hover:bg-white/[0.06] hover:text-[var(--text-primary)]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to portal
              </Link>
              <h1 className="mt-4 text-[2rem] font-semibold tracking-tight text-white">{project.name}</h1>
              <p className="mt-2 text-[14px] text-[var(--text-secondary)]">
                {project.clientName} · {project.service}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className={cn("inline-flex rounded-full border px-3 py-1.5 text-[12px] font-medium", statusClasses(project.status))}>
                {project.status}
              </span>
              {canMessage && (
                <Link
                  href="/messages"
                  className="inline-flex items-center gap-2 rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.03] px-4 py-2.5 text-[13px] font-medium text-[var(--text-primary)] transition hover:bg-white/[0.06]"
                >
                  <MessageSquareMore className="h-4 w-4" />
                  Message Team
                </Link>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Progress", value: `${project.progress}%`, icon: FolderKanban },
              { label: "Tasks", value: String(project.taskCount).padStart(2, "0"), icon: CalendarDays },
              { label: "Open Tasks", value: String(project.openTaskCount).padStart(2, "0"), icon: FolderKanban },
              { label: "Due Date", value: formatDate(project.dueDate), icon: CalendarDays },
            ].map((metric) => (
              <section
                key={metric.label}
                className="rounded-[22px] border border-white/8 bg-white/[0.04] px-5 py-5"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">{metric.label}</p>
                  <metric.icon className="h-4 w-4 text-[var(--text-muted)]" />
                </div>
                <p className="mt-4 text-[1.55rem] font-semibold tracking-tight text-white">{metric.value}</p>
              </section>
            ))}
          </div>

          {project.teamMembers.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-3 text-[13px] text-[var(--text-secondary)]">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5">
                <UserRound className="h-4 w-4 text-[var(--text-muted)]" />
                {project.teamMembers.join(", ")}
              </span>
            </div>
          )}
        </header>

        <section className="mt-6 rounded-[28px] border border-white/8 bg-[rgba(12,12,14,0.92)] p-5 shadow-[0_24px_64px_rgba(0,0,0,0.28)] sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[1.05rem] font-semibold text-[var(--text-primary)]">Project Tasks</h2>
            <span className="text-[12px] text-[var(--text-muted)]">{tasks.length} visible</span>
          </div>

          <div className="mt-5 space-y-3">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <article
                  key={task.id}
                  className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-[var(--text-primary)]">{task.title}</p>
                      {task.description && (
                        <p className="mt-2 text-[13px] leading-6 text-[var(--text-secondary)]">{task.description}</p>
                      )}
                    </div>
                    <span className={cn("inline-flex w-fit rounded-full border px-2.5 py-1 text-[11px] font-medium", statusClasses(taskStatusLabel(task.statusId)))}>
                      {taskStatusLabel(task.statusId)}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-[12px] text-[var(--text-muted)]">
                    <span>{task.priority}</span>
                    <span>{task.assignedTo || "Unassigned"}</span>
                    <span>{formatDate(task.dueDate)}</span>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[20px] border border-dashed border-white/10 px-4 py-10 text-center text-[13px] text-[var(--text-muted)]">
                No shared tasks for this project yet.
              </div>
            )}
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <section className="rounded-[28px] border border-white/8 bg-[rgba(12,12,14,0.92)] p-5 shadow-[0_24px_64px_rgba(0,0,0,0.28)] sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[1.05rem] font-semibold text-[var(--text-primary)]">Files</h2>
              <span className="text-[12px] text-[var(--text-muted)]">{files.length} shared</span>
            </div>

            <div className="mt-5 space-y-3">
              {files.length > 0 ? (
                files.slice(0, 10).map((file) => (
                  <a
                    key={file.id}
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-3 rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3.5 transition hover:bg-white/[0.06]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-[var(--text-primary)]">{file.name}</p>
                      <p className="mt-1 text-[11.5px] text-[var(--text-muted)]">
                        {formatBytes(file.sizeBytes)} · Updated {formatDateTime(file.updatedAt)}
                      </p>
                    </div>
                    <Download className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                  </a>
                ))
              ) : (
                <div className="rounded-[20px] border border-dashed border-white/10 px-4 py-10 text-center text-[13px] text-[var(--text-muted)]">
                  No shared files yet.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/8 bg-[rgba(12,12,14,0.92)] p-5 shadow-[0_24px_64px_rgba(0,0,0,0.28)] sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[1.05rem] font-semibold text-[var(--text-primary)]">Discussions</h2>
              <span className="text-[12px] text-[var(--text-muted)]">{discussions.length} threads</span>
            </div>

            <div className="mt-5 space-y-3">
              {discussions.length > 0 ? (
                discussions.map((thread) => (
                  <article
                    key={thread.id}
                    className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-[var(--text-primary)]">{thread.title}</p>
                        <p className="mt-1 text-[11.5px] text-[var(--text-muted)]">
                          {thread.authorName} · {formatDateTime(thread.createdAt)}
                        </p>
                      </div>
                      <MessagesSquare className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                    </div>
                    {thread.body && (
                      <p className="mt-3 line-clamp-3 text-[12.5px] leading-6 text-[var(--text-secondary)]">{thread.body}</p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-[11.5px] text-[var(--text-muted)]">
                      <span>{thread.replyCount} replies</span>
                      <span>{thread.attachmentCount} attachments</span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[20px] border border-dashed border-white/10 px-4 py-10 text-center text-[13px] text-[var(--text-muted)]">
                  No client-visible discussions yet.
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-[28px] border border-white/8 bg-[rgba(12,12,14,0.92)] p-5 shadow-[0_24px_64px_rgba(0,0,0,0.28)] sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[1.05rem] font-semibold text-[var(--text-primary)]">Recent Notifications</h2>
            <span className="text-[12px] text-[var(--text-muted)]">{notifications.length} items</span>
          </div>

          <div className="mt-5 space-y-3">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <article
                  key={notification.id}
                  className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-[var(--text-primary)]">{notification.title}</p>
                      <p className="mt-1 text-[11.5px] text-[var(--text-muted)]">{notification.time}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {notification.unread && <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />}
                      <Bell className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                    </div>
                  </div>
                  <p className="mt-3 text-[12.5px] leading-6 text-[var(--text-secondary)]">{notification.body}</p>
                </article>
              ))
            ) : (
              <div className="rounded-[20px] border border-dashed border-white/10 px-4 py-10 text-center text-[13px] text-[var(--text-muted)]">
                No notifications for this project yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import { CalendarDays, CheckCircle2, Clock3, FolderKanban, MessageSquareMore, ShieldCheck } from "lucide-react";

import type { ClientPortalDashboard } from "@/data/client-portal";
import { cn } from "@/lib/utils";

function statusClasses(status: string) {
  if (status === "Completed") {
    return "border-[var(--green)]/20 bg-[var(--green)]/10 text-[var(--green)]";
  }

  if (status === "Review") {
    return "border-[#f2c97d]/20 bg-[#f2c97d]/12 text-[#f2c97d]";
  }

  if (status === "In Delivery") {
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

export function ClientPortalShell({
  dashboard,
  viewerName,
}: {
  dashboard: ClientPortalDashboard;
  viewerName: string;
}) {
  return (
    <main className="bg-dashboard min-h-screen text-[var(--text-primary)]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-[28px] border border-white/8 bg-[linear-gradient(140deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-6 shadow-[0_32px_80px_rgba(0,0,0,0.32)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Client Portal
              </div>
              <h1 className="mt-4 text-[2rem] font-semibold tracking-tight text-white sm:text-[2.4rem]">
                Welcome back, {viewerName}
              </h1>
              <p className="mt-3 max-w-2xl text-[14px] leading-7 text-[var(--text-secondary)]">
                Review your active delivery work, track project progress, and stay aligned on task status without exposing internal workspace controls.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/messages"
                className="btn-base btn-secondary inline-flex items-center gap-2 rounded-[var(--radius-lg)] px-4 py-2.5 text-[13px] font-medium"
              >
                <MessageSquareMore className="h-4 w-4" />
                Open Messages
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Projects", value: String(dashboard.totalProjects).padStart(2, "0"), icon: FolderKanban },
              { label: "Tasks", value: String(dashboard.totalTasks).padStart(2, "0"), icon: CheckCircle2 },
              { label: "Open + In Progress", value: String(dashboard.openTasks).padStart(2, "0"), icon: Clock3 },
              { label: "In Review", value: String(dashboard.reviewTasks).padStart(2, "0"), icon: CalendarDays },
            ].map((metric) => (
              <section
                key={metric.label}
                className="rounded-[22px] border border-white/8 bg-white/[0.04] px-5 py-5"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">{metric.label}</p>
                  <metric.icon className="h-4 w-4 text-[var(--text-muted)]" />
                </div>
                <p className="mt-4 text-[1.8rem] font-semibold tracking-tight text-white">{metric.value}</p>
              </section>
            ))}
          </div>
        </header>

        <div className="mt-6 space-y-6">
          {dashboard.accounts.map((account) => (
            <section
              key={`${account.workspaceId}:${account.clientId}`}
              className="rounded-[28px] border border-white/8 bg-[rgba(12,12,14,0.92)] p-5 shadow-[0_24px_64px_rgba(0,0,0,0.28)] sm:p-6"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">Account</p>
                  <h2 className="mt-2 text-[1.4rem] font-semibold tracking-tight text-white">{account.clientName}</h2>
                  <p className="mt-2 text-[13px] text-[var(--text-secondary)]">
                    Signed in as {account.memberName} · {account.memberRole}
                  </p>
                </div>
                {account.canMessage && (
                  <Link
                    href="/messages"
                    className="inline-flex w-fit items-center gap-2 rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.03] px-4 py-2.5 text-[13px] font-medium text-[var(--text-primary)] transition hover:bg-white/[0.06]"
                  >
                    <MessageSquareMore className="h-4 w-4" />
                    Message Team
                  </Link>
                )}
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">Projects</h3>
                    <span className="text-[12px] text-[var(--text-muted)]">{account.projects.length} total</span>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {account.projects.length > 0 ? (
                      account.projects.map((project) => (
                        <Link
                          key={project.id}
                          href={`/portal/projects/${project.id}`}
                          className="rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] px-4 py-4 transition hover:bg-white/[0.06]"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-[14px] font-semibold text-[var(--text-primary)]">{project.name}</p>
                              <p className="mt-1 truncate text-[12px] text-[var(--text-muted)]">{project.service}</p>
                            </div>
                            <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium", statusClasses(project.status))}>
                              {project.status}
                            </span>
                          </div>

                          <div className="mt-4 flex items-center justify-between gap-4">
                            <div className="h-2 flex-1 rounded-full bg-white/8">
                              <div
                                className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-strong))]"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                            <span className="text-[12px] font-medium text-[var(--text-secondary)]">{project.progress}%</span>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center gap-3 text-[12px] text-[var(--text-muted)]">
                            <span>{project.taskCount} tasks</span>
                            <span>{project.openTaskCount} open</span>
                            <span>{formatDate(project.dueDate)}</span>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="rounded-[20px] border border-dashed border-white/10 px-4 py-8 text-center text-[13px] text-[var(--text-muted)]">
                        No active client projects yet.
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">Latest Tasks</h3>
                    <span className="text-[12px] text-[var(--text-muted)]">{account.tasks.length} total</span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {account.tasks.length > 0 ? (
                      account.tasks.slice(0, 8).map((task) => (
                        <article
                          key={task.id}
                          className="rounded-[18px] border border-white/8 bg-white/[0.025] px-4 py-3.5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-[13px] font-semibold text-[var(--text-primary)]">{task.title}</p>
                              <p className="mt-1 truncate text-[12px] text-[var(--text-muted)]">{task.projectName}</p>
                            </div>
                            <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium", statusClasses(taskStatusLabel(task.statusId)))}>
                              {taskStatusLabel(task.statusId)}
                            </span>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-3 text-[11.5px] text-[var(--text-muted)]">
                            <span>{task.priority}</span>
                            <span>{task.assignedTo || "Unassigned"}</span>
                            <span>{formatDate(task.dueDate)}</span>
                          </div>
                        </article>
                      ))
                    ) : (
                      <div className="rounded-[20px] border border-dashed border-white/10 px-4 py-8 text-center text-[13px] text-[var(--text-muted)]">
                        No tasks shared with this client yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          ))}

          {dashboard.accounts.length === 0 && (
            <section className="rounded-[28px] border border-dashed border-white/10 bg-[rgba(12,12,14,0.86)] px-6 py-12 text-center">
              <h2 className="text-[1.2rem] font-semibold text-white">No client access is enabled yet</h2>
              <p className="mt-3 text-[14px] text-[var(--text-muted)]">
                Ask your workspace team to enable portal access for your client record.
              </p>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

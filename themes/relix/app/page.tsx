export const dynamic = "force-dynamic";
export const revalidate = 0;

import type { ReactNode } from "react";
import type { Route } from "next";
import Link from "next/link";
import { ArrowUpRight, Bell, Building2, CalendarDays, CheckSquare, FolderKanban, Inbox, MailCheck, Users } from "lucide-react";
import { countByMonth, formatDelta, shiftMonth, startOfMonth, sumByMonth } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/card";
import { DashboardNotificationsTrigger } from "@/components/dashboard-notifications-trigger";
import { DashboardAnalytics } from "@/components/dashboard-analytics";
import { MetricCard } from "@/components/metric-card";
import { TaskListTable } from "@/components/task-list-table";
import { Topbar } from "@/components/topbar";
import { leadStatusLabels, leadStatuses } from "@/lib/crm";
import { emailWorkspaceThreadListSelect, getEmailWorkspaceThreads } from "@/lib/email-workspace";
import { formatLocalizedCurrency, formatLocalizedDateTime, formatLocalizedMonth } from "@/lib/localization";
import { ensureActiveMailboxData } from "@/lib/mailbox-maintenance";
import { getRecentWorkspaceActivity, type WorkspaceActivityItem } from "@/lib/recent-workspace-activity";
import { getWorkspaceUserAvatarUrl } from "@/lib/user-avatar";
import { getWorkspaceLocalizationSettings } from "@/lib/workspace-localization";
import { requireWorkspaceContext } from "@/lib/workspace";

export default async function DashboardPage() {
  const { user: currentUser, workspace } = await requireWorkspaceContext();
  const [hasActiveMailbox, localization] = await Promise.all([
    ensureActiveMailboxData(currentUser.id),
    getWorkspaceLocalizationSettings()
  ]);
  const now = new Date();
  const currentMonth = startOfMonth(now);
  const previousMonth = shiftMonth(currentMonth, -1);
  const recentMonths = Array.from({ length: 6 }, (_, index) => shiftMonth(currentMonth, index - 5));

  const [
    leads,
    tasks,
    openTasks,
    companiesCount,
    contactsCount,
    threads,
    emailMessages,
    upcomingMeetingsCount,
    unreadNotificationsCount,
    latestNotifications,
    recentActivity
  ] = await Promise.all([
    prisma.lead.findMany({
      where: { workspaceId: workspace.id },
      select: {
        id: true,
        status: true,
        value: true,
        createdAt: true
      },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.task.findMany({
      where: {
        workspaceId: workspace.id,
        status: {
          not: "DONE"
        }
      },
      include: {
        lead: true,
        contact: {
          include: {
            company: true
          }
        },
        company: true
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      take: 8
    }),
    prisma.task.findMany({
      where: {
        workspaceId: workspace.id,
        status: {
          not: "DONE"
        }
      },
      select: {
        createdAt: true
      }
    }),
    prisma.company.count({ where: { workspaceId: workspace.id } }),
    prisma.contact.count({ where: { workspaceId: workspace.id } }),
    hasActiveMailbox
      ? prisma.emailThread.findMany({
          where: { workspaceId: workspace.id, mailboxUserId: currentUser.id },
          select: emailWorkspaceThreadListSelect
        })
      : Promise.resolve([]),
    hasActiveMailbox
      ? prisma.emailMessage.findMany({
          where: { workspaceId: workspace.id, mailboxUserId: currentUser.id, direction: "outbound" },
          select: {
            sentAt: true
          }
        })
      : Promise.resolve([]),
    prisma.meetingEvent.count({
      where: {
        workspaceId: workspace.id,
        startsAt: {
          gte: now
        }
      }
    }),
    prisma.appNotification.count({
      where: {
        userId: currentUser.id,
        readAt: null
      }
    }),
    prisma.appNotification.findMany({
      where: {
        userId: currentUser.id
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        kind: true,
        title: true,
        body: true,
        link: true,
        readAt: true,
        createdAt: true
      }
    }),
    getRecentWorkspaceActivity(workspace.id, 8)
  ]);

  const taskOwnerUsers = await prisma.user.findMany({
    where: {
      workspaceId: workspace.id,
      email: { in: Array.from(new Set(tasks.map((task) => task.ownerEmail).filter(Boolean))) }
    },
    select: { id: true, email: true, profileImageUrl: true, profileImageAsset: { select: { updatedAt: true } } }
  });
  const taskOwnerAvatars = Object.fromEntries(taskOwnerUsers.map((user) => [user.email, getWorkspaceUserAvatarUrl(user)]));

  const openLeadStatuses = new Set(["NEW", "QUALIFIED", "PROPOSAL", "NEGOTIATION"]);
  const activeLeads = leads.filter((lead) => openLeadStatuses.has(lead.status));
  const activePipelineValue = activeLeads.reduce((sum, lead) => sum + lead.value, 0);
  const wonLeads = leads.filter((lead) => lead.status === "WON").length;
  const closedLeads = leads.filter((lead) => lead.status === "WON" || lead.status === "LOST");
  const winRate = closedLeads.length ? Math.round((wonLeads / closedLeads.length) * 100) : 0;

  const inboxThreadIds = new Set(getEmailWorkspaceThreads(threads).filter((thread) => thread.mailbox === "inbox").map((thread) => thread.id));
  const inboxThreadsCount = inboxThreadIds.size;
  const inboxThreadCreatedDates = threads.filter((thread) => inboxThreadIds.has(thread.id)).map((thread) => new Date(thread.createdAt));
  const leadCreatedDates = leads.map((lead) => new Date(lead.createdAt));
  const emailSentDates = emailMessages.map((message) => new Date(message.sentAt));
  const leadValueDates = leads.map((lead) => ({ date: new Date(lead.createdAt), value: lead.value }));
  const openTaskDates = openTasks.map((task) => new Date(task.createdAt));

  const analyticsData = Array.from({ length: 36 }, (_, i) => shiftMonth(currentMonth, -35 + i)).map((month) => ({
    month: formatLocalizedMonth(month, localization),
    pipelineFlow: countByMonth(leadCreatedDates, month),
    engagements: countByMonth(emailSentDates, month)
  }));

  const leadPipelineTrend = formatDelta(countByMonth(leadCreatedDates, currentMonth), countByMonth(leadCreatedDates, previousMonth));
  const conversationsTrend = formatDelta(countByMonth(inboxThreadCreatedDates, currentMonth), countByMonth(inboxThreadCreatedDates, previousMonth));
  const tasksTrend = formatDelta(countByMonth(openTaskDates, currentMonth), countByMonth(openTaskDates, previousMonth));
  const pipelineValueTrend = formatDelta(sumByMonth(leadValueDates, currentMonth), sumByMonth(leadValueDates, previousMonth));

  const funnelStages = leadStatuses.map((status) => ({
    key: status,
    label: leadStatusLabels[status],
    count: leads.filter((lead) => lead.status === status).length,
    color:
      status === "NEW"
        ? "bg-[#386df4]"
        : status === "QUALIFIED"
          ? "bg-[#ff6b45]"
          : status === "PROPOSAL"
            ? "bg-[#35c36d]"
            : status === "NEGOTIATION"
              ? "bg-[#f5b546]"
              : status === "WON"
                ? "bg-[#294a9f]"
                : "bg-rose-400"
  }));
  const funnelMax = Math.max(...funnelStages.map((stage) => stage.count), 1);
  const hasLeadData = leads.length > 0;
  const hasTaskData = tasks.length > 0;
  return (
    <div>
      <Topbar title="Dashboard" subtitle="Live CRM snapshot based on companies, people, pipeline, inbox, and tasks.">
        <DashboardNotificationsTrigger
          unreadCount={unreadNotificationsCount}
          notifications={latestNotifications.map((notification) => ({
            id: notification.id,
            kind: notification.kind,
            title: notification.title,
            body: notification.body,
            link: notification.link,
            readAt: notification.readAt ? notification.readAt.toISOString() : null,
            createdAtLabel: formatLocalizedDateTime(notification.createdAt, localization)
          }))}
        />
        <Link href="/pipeline" className="crm-btn crm-btn-secondary">
          <FolderKanban className="h-4 w-4" />
          View pipeline
        </Link>
        <Link href="/inbox" className="crm-btn crm-btn-secondary">
          <Inbox className="h-4 w-4" />
          Open inbox
        </Link>
        <Link href="/tasks" className="crm-btn crm-btn-primary">
          <CalendarDays className="h-4 w-4" />
          Review tasks
        </Link>
      </Topbar>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Lead Pipeline"
          value={String(activeLeads.length).padStart(2, "0")}
          trend={leadPipelineTrend.label}
          tone={leadPipelineTrend.tone}
          href="/pipeline"
          icon={FolderKanban}
          helper={activeLeads.length ? "Active opportunity count" : "No active opportunities yet"}
        />
        <MetricCard
          label="Inbox Conversations"
          value={String(inboxThreadsCount).padStart(2, "0")}
          trend={conversationsTrend.label}
          tone={conversationsTrend.tone}
          href="/inbox"
          icon={Inbox}
          helper={inboxThreadsCount ? "Active inbox conversations" : "Inbox is quiet right now"}
        />
        <MetricCard
          label="Open Tasks"
          value={String(openTasks.length).padStart(2, "0")}
          trend={tasksTrend.label}
          tone={tasksTrend.tone}
          href="/tasks"
          icon={CalendarDays}
          helper={openTasks.length ? "Pending execution items" : "No outstanding tasks"}
        />
        <MetricCard
          label="Pipeline Value"
          value={formatLocalizedCurrency(activePipelineValue, localization)}
          trend={pipelineValueTrend.label}
          tone={pipelineValueTrend.tone}
          href="/pipeline"
          icon={MailCheck}
          helper={activePipelineValue ? "Open deal value in pipeline" : "No active deal value yet"}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.55fr_0.68fr] items-stretch">
        <DashboardAnalytics data={analyticsData} />

        <Card className="flex h-full flex-col overflow-hidden border-slate-200/90 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcff_100%)] p-0">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Pipeline funnel</h3>
              <p className="mt-1 text-sm text-slate-500">Lead distribution by stage.</p>
            </div>
            <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600">{winRate}% win rate</div>
          </div>
          {hasLeadData ? (
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
              {funnelStages.map((stage, stageIndex) => {
                const percentage = stage.count ? Math.round((stage.count / funnelMax) * 100) : 0;

                return (
                  <div key={stage.key}>
                    <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                      <span className="text-slate-600">{stage.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800">{stage.count}</span>
                        <span className="text-slate-400">{percentage}%</span>
                      </div>
                    </div>
                    <div className="h-5 overflow-hidden rounded-md bg-slate-100">
                      <div
                        className={`h-full rounded-md ${stage.color}`}
                        style={{
                          "--target-width": `${Math.max(8, percentage)}%`,
                          animation: `barFill 1s cubic-bezier(0.16, 1, 0.3, 1) ${stageIndex * 150}ms both`
                        } as React.CSSProperties}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="pt-2">
                <Link href="/pipeline" className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-medium text-slate-800 hover:bg-slate-50">
                  View pipeline details
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center px-5 py-8">
              <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-[#fbfcff] px-6 py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#386df4]">
                  <FolderKanban className="h-5 w-5" />
                </div>
                <div className="mt-4 text-[1.05rem] font-semibold text-slate-900">No pipeline yet</div>
                <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">Create your first deal to start tracking stage movement and conversion across the funnel.</p>
                <Link href="/pipeline" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#386df4] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2d5de0]">
                  Open pipeline
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.5fr_0.8fr]">
        <TaskListTable tasks={tasks} localization={localization} ownerAvatars={taskOwnerAvatars} />
        <ActivityMonitor items={recentActivity} localization={localization} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Companies"
          value={companiesCount}
          description="Company accounts saved and ready for your team to review in CRM."
          href="/companies"
          icon={<Building2 className="h-5 w-5" />}
          linkLabel="View companies"
          animationDelay={0}
        />
        <StatCard
          label="People"
          value={contactsCount}
          description="Tracked contacts connected to your accounts, deals, and pipeline activity."
          href="/contacts"
          icon={<Users className="h-5 w-5" />}
          linkLabel="View people"
          animationDelay={80}
        />
        <StatCard
          label="Upcoming meetings"
          value={upcomingMeetingsCount}
          description="Upcoming meetings scheduled across your connected calendar workspace."
          href="/meetings"
          icon={<CalendarDays className="h-5 w-5" />}
          linkLabel="View meetings"
          animationDelay={160}
        />
        <StatCard
          label="Won deals"
          value={wonLeads}
          description="Closed-won deals currently counted toward your pipeline performance."
          href="/pipeline"
          icon={<FolderKanban className="h-5 w-5" />}
          linkLabel="View deals"
          animationDelay={240}
        />
      </div>
    </div>
  );
}

function activityIcon(kind: WorkspaceActivityItem["kind"]) {
  switch (kind) {
    case "lead":
      return <FolderKanban className="h-4 w-4" />;
    case "contact":
      return <Users className="h-4 w-4" />;
    case "company":
      return <Building2 className="h-4 w-4" />;
    case "task":
      return <CheckSquare className="h-4 w-4" />;
    case "meeting":
      return <CalendarDays className="h-4 w-4" />;
  }
}

function ActivityMonitor({
  items,
  localization
}: {
  items: WorkspaceActivityItem[];
  localization: Awaited<ReturnType<typeof getWorkspaceLocalizationSettings>>;
}) {
  return (
    <Card className="flex h-[440px] flex-col overflow-hidden border-slate-200/90 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcff_100%)] p-0">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Activity monitor</h3>
        </div>
        <Link
          href="/notifications"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-[#c8d8ff] hover:bg-[#f8fbff] hover:text-[#386df4]"
        >
          <Bell className="h-4 w-4" />
          View notifications
        </Link>
      </div>

      {items.length ? (
        <div className="min-h-0 flex-1 divide-y divide-slate-200 overflow-y-auto">
          {items.map((item) => (
            <Link key={item.id} href={item.href} className="flex items-start gap-3 px-5 py-4 transition hover:bg-slate-50">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#386df4]">
                {activityIcon(item.kind)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">{item.badge}</span>
                </div>
                <div className="mt-1 text-sm leading-6 text-slate-500">{item.description}</div>
                <div className="mt-2 text-xs text-slate-400">{formatLocalizedDateTime(item.timestamp, localization)}</div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center px-5 py-8">
          <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-[#fbfcff] px-6 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#386df4]">
              <Bell className="h-5 w-5" />
            </div>
            <div className="mt-4 text-[1.05rem] font-semibold text-slate-900">No recent activity</div>
            <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
              Lead, company, contact, task, and meeting activity will appear here as your workspace becomes active.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}


function OverviewTile({ label, value, href }: { label: string; value: number; href: Route }) {
  return (
    <Link href={href} className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.05)] hover:bg-white">
      <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">{label}</div>
      <div className="mt-2 text-[1.55rem] font-semibold tracking-tight text-slate-900">{value}</div>
    </Link>
  );
}

function StatCard({
  label,
  value,
  description,
  href,
  icon,
  linkLabel,
  animationDelay = 0
}: {
  label: string;
  value: number;
  description: string;
  href: Route;
  icon: ReactNode;
  linkLabel: string;
  animationDelay?: number;
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_52%,#eef4ff_100%)] p-0 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
      style={{ animation: `fadeInUp 0.55s cubic-bezier(0.16, 1, 0.3, 1) ${animationDelay}ms both` }}
    >
      <div className="relative flex h-full flex-col px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <div className="mt-4 text-[2.15rem] font-semibold leading-none tracking-tight text-slate-900">{value}</div>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e8efff] text-[#386df4]">
            {icon}
          </div>
        </div>

        <p className="mt-4 flex-1 text-sm leading-6 text-slate-400">{description}</p>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <Link
            href={href}
            className="inline-flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-[#386df4]"
          >
            {linkLabel}
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

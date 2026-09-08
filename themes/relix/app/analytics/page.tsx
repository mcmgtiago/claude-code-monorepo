export const dynamic = "force-dynamic";
export const revalidate = 0;

import { Building2, CheckCircle2, CircleDollarSign, ContactRound, FolderKanban, Inbox, Trophy, WalletCards } from "lucide-react";
import { DashboardAnalytics } from "@/components/dashboard-analytics";
import { RevenueAnalytics } from "@/components/revenue-analytics";
import { LeadStatusAnalytics } from "@/components/lead-status-analytics";
import { TaskActivityAnalytics } from "@/components/task-activity-analytics";
import { MetricCard } from "@/components/metric-card";
import { countByMonth, formatDelta, getMonthKey, shiftMonth, startOfMonth, sumByMonth } from "@/lib/analytics";
import { emailWorkspaceThreadListSelect, getEmailWorkspaceThreads } from "@/lib/email-workspace";
import { Topbar } from "@/components/topbar";
import { formatLocalizedCurrency, formatLocalizedMonth } from "@/lib/localization";
import { ensureActiveMailboxData } from "@/lib/mailbox-maintenance";
import { prisma } from "@/lib/prisma";
import { getWorkspaceLocalizationSettings } from "@/lib/workspace-localization";
import { requireWorkspaceContext } from "@/lib/workspace";

export default async function AnalyticsPage() {
  const { user, workspace } = await requireWorkspaceContext();
  const [localization, hasActiveMailbox] = await Promise.all([
    getWorkspaceLocalizationSettings(),
    ensureActiveMailboxData(user.id)
  ]);
  const now = new Date();
  const currentMonth = startOfMonth(now);
  const previousMonth = shiftMonth(currentMonth, -1);
  const recentMonths = Array.from({ length: 12 }, (_, index) => shiftMonth(currentMonth, index - 11));

  const [leads, threads, contacts, emailMessages, tasks, companies] = await Promise.all([
    prisma.lead.findMany({
      where: { workspaceId: workspace.id },
      select: {
        status: true,
        value: true,
        createdAt: true,
        updatedAt: true
      }
    }),
    hasActiveMailbox
      ? prisma.emailThread.findMany({
          where: { workspaceId: workspace.id, mailboxUserId: user.id },
          select: emailWorkspaceThreadListSelect
        })
      : Promise.resolve([]),
    prisma.contact.findMany({
      where: { workspaceId: workspace.id },
      select: {
        createdAt: true
      }
    }),
    hasActiveMailbox
      ? prisma.emailMessage.findMany({
          where: { workspaceId: workspace.id, mailboxUserId: user.id, direction: "outbound" },
          select: {
            sentAt: true
          }
        })
      : Promise.resolve([]),
    prisma.task.findMany({
      where: { workspaceId: workspace.id },
      select: {
        status: true,
        createdAt: true,
        updatedAt: true
      }
    }),
    prisma.company.findMany({
      where: { workspaceId: workspace.id },
      select: {
        createdAt: true
      }
    })
  ]);

  const contactCreatedDates = contacts.map((contact) => new Date(contact.createdAt));
  const companyCreatedDates = companies.map((company) => new Date(company.createdAt));
  const inboxThreadIds = new Set(getEmailWorkspaceThreads(threads).filter((thread) => thread.mailbox === "inbox").map((thread) => thread.id));
  const inboxThreadsCount = inboxThreadIds.size;
  const inboxThreadCreatedDates = threads.filter((thread) => inboxThreadIds.has(thread.id)).map((thread) => new Date(thread.createdAt));
  const leadCreatedDates = leads.map((lead) => new Date(lead.createdAt));
  const emailSentDates = emailMessages.map((message) => new Date(message.sentAt));
  const completedTaskDates = tasks.filter((t) => t.status === "DONE").map((t) => new Date(t.updatedAt));

  const qualifiedLeadCreatedDates = leads.filter((lead) => lead.status === "QUALIFIED").map((lead) => new Date(lead.createdAt));
  const openLeadStatuses = new Set(["NEW", "QUALIFIED", "PROPOSAL", "NEGOTIATION"]);
  const activeLeads = leads.filter((lead) => openLeadStatuses.has(lead.status));
  const leadValueDates = activeLeads.map((lead) => ({ date: new Date(lead.createdAt), value: lead.value }));

  const analyticsData = Array.from({ length: 36 }, (_, i) => shiftMonth(currentMonth, -35 + i)).map((month) => ({
    month: formatLocalizedMonth(month, localization),
    pipelineFlow: countByMonth(leadCreatedDates, month),
    engagements: countByMonth(emailSentDates, month)
  }));

  const revenueData = recentMonths.map((month) => {
    const monthKey = getMonthKey(month);
    const wonThisMonth = leads.filter(l => l.status === "WON" && getMonthKey(new Date(l.updatedAt)) === monthKey);
    const rev = wonThisMonth.reduce((sum, l) => sum + l.value, 0);

    const pipeThisMonth = leads.filter(l => getMonthKey(new Date(l.createdAt)) === monthKey);
    const pipe = pipeThisMonth.reduce((sum, l) => sum + l.value, 0);

    return {
      month: formatLocalizedMonth(month, localization),
      pipelineValue: pipe,
      revenue: rev
    };
  });

  const taskVelocityData = recentMonths.map((month) => {
    const monthKey = getMonthKey(month);
    const completed = tasks.filter(t => t.status === "DONE" && getMonthKey(new Date(t.updatedAt)) === monthKey).length;
    const opened = tasks.filter(t => getMonthKey(new Date(t.createdAt)) === monthKey).length;
    return {
      month: formatLocalizedMonth(month, localization),
      completed,
      opened
    };
  });

  const leadStatusData = [
    { name: "NEW", value: leads.filter(l => l.status === "NEW").length, color: "#386df4", label: "New" },
    { name: "QUALIFIED", value: leads.filter(l => l.status === "QUALIFIED").length, color: "#ff6b45", label: "Qualified" },
    { name: "PROPOSAL", value: leads.filter(l => l.status === "PROPOSAL").length, color: "#35c36d", label: "Proposal" },
    { name: "NEGOTIATION", value: leads.filter(l => l.status === "NEGOTIATION").length, color: "#f5b546", label: "Negotiation" },
    { name: "WON", value: leads.filter(l => l.status === "WON").length, color: "#294a9f", label: "Won" },
    { name: "LOST", value: leads.filter(l => l.status === "LOST").length, color: "#fb7185", label: "Lost" }
  ];

  const trackedContactsTrend = formatDelta(countByMonth(contactCreatedDates, currentMonth), countByMonth(contactCreatedDates, previousMonth));
  const trackedCompaniesTrend = formatDelta(countByMonth(companyCreatedDates, currentMonth), countByMonth(companyCreatedDates, previousMonth));
  const openThreadsTrend = formatDelta(countByMonth(inboxThreadCreatedDates, currentMonth), countByMonth(inboxThreadCreatedDates, previousMonth));
  const completedTasksTrend = formatDelta(countByMonth(completedTaskDates, currentMonth), countByMonth(completedTaskDates, previousMonth));
  const qualifiedLeadsTrend = formatDelta(countByMonth(qualifiedLeadCreatedDates, currentMonth), countByMonth(qualifiedLeadCreatedDates, previousMonth));
  const projectedValueTrend = formatDelta(sumByMonth(leadValueDates, currentMonth), sumByMonth(leadValueDates, previousMonth));

  // Win Rate
  const currentMonthKey = getMonthKey(currentMonth);
  const previousMonthKey = getMonthKey(previousMonth);
  
  const getWinRate = (monthKey: string) => {
    const closedLeads = leads.filter(l => ["WON", "LOST"].includes(l.status) && getMonthKey(new Date(l.updatedAt)) === monthKey);
    if (closedLeads.length === 0) return 0;
    const wonLeads = closedLeads.filter(l => l.status === "WON").length;
    return (wonLeads / closedLeads.length) * 100;
  };
  
  const currentWinRate = getWinRate(currentMonthKey);
  const previousWinRate = getWinRate(previousMonthKey);
  
  const winRateTrendLabel = `${Math.abs(Math.round(currentWinRate - previousWinRate))}%`;
  const winRateTone = currentWinRate > previousWinRate ? "positive" : currentWinRate < previousWinRate ? "negative" : "neutral";

  // Average Deal Size
  const getAvgDealSize = (monthKey: string) => {
    const wonLeads = leads.filter(l => l.status === "WON" && getMonthKey(new Date(l.updatedAt)) === monthKey);
    if (wonLeads.length === 0) return 0;
    const totalValue = wonLeads.reduce((sum, l) => sum + l.value, 0);
    return totalValue / wonLeads.length;
  };

  const currentAvgDeal = getAvgDealSize(currentMonthKey);
  const previousAvgDeal = getAvgDealSize(previousMonthKey);
  const avgDealTrend = formatDelta(currentAvgDeal, previousAvgDeal);

  // Totals for top cards
  const totalQualifiedLeads = leads.filter((lead) => lead.status === "QUALIFIED").length;
  const totalValue = activeLeads.reduce((sum, lead) => sum + lead.value, 0);
  const totalCompletedTasks = tasks.filter((t) => t.status === "DONE").length;
  
  const allClosedLeads = leads.filter(l => ["WON", "LOST"].includes(l.status));
  const allTimeWinRate = allClosedLeads.length > 0 
    ? (leads.filter(l => l.status === "WON").length / allClosedLeads.length) * 100 
    : 0;
  
  const allWonLeads = leads.filter(l => l.status === "WON");
  const allTimeAvgDeal = allWonLeads.length > 0
    ? allWonLeads.reduce((sum, l) => sum + l.value, 0) / allWonLeads.length
    : 0;

  return (
    <div>
      <Topbar title="Analytics" subtitle="Track engagement trends, pipeline movement, and revenue signals in one view." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Row 1 */}
        <MetricCard
          label="Tracked contacts"
          value={String(contacts.length).padStart(2, "0")}
          trend={trackedContactsTrend.label}
          tone={trackedContactsTrend.tone}
          icon={ContactRound}
          helper="New contacts added vs last month"
          animationDelay={0}
        />
        <MetricCard
          label="Tracked companies"
          value={String(companies.length).padStart(2, "0")}
          trend={trackedCompaniesTrend.label}
          tone={trackedCompaniesTrend.tone}
          icon={Building2}
          helper="New companies added vs last month"
          animationDelay={40}
        />
        <MetricCard
          label="Completed tasks"
          value={String(totalCompletedTasks).padStart(2, "0")}
          trend={completedTasksTrend.label}
          tone={completedTasksTrend.tone}
          icon={CheckCircle2}
          helper="Tasks completed vs last month"
          animationDelay={80}
        />
        <MetricCard
          label="Inbox threads"
          value={String(inboxThreadsCount).padStart(2, "0")}
          trend={openThreadsTrend.label}
          tone={openThreadsTrend.tone}
          icon={Inbox}
          helper="New inbox threads opened vs last month"
          animationDelay={120}
        />

        {/* Row 2 */}
        <MetricCard
          label="Projected value"
          value={formatLocalizedCurrency(totalValue, localization)}
          trend={projectedValueTrend.label}
          tone={projectedValueTrend.tone}
          icon={WalletCards}
          helper="New pipeline value added vs last month"
          animationDelay={160}
        />
        <MetricCard
          label="Qualified leads"
          value={String(totalQualifiedLeads).padStart(2, "0")}
          trend={qualifiedLeadsTrend.label}
          tone={qualifiedLeadsTrend.tone}
          icon={FolderKanban}
          helper="Qualified leads created vs last month"
          animationDelay={200}
        />
        <MetricCard
          label="Win rate"
          value={`${Math.round(allTimeWinRate)}%`}
          trend={currentWinRate === 0 && previousWinRate === 0 ? "No change" : winRateTrendLabel}
          tone={currentWinRate === 0 && previousWinRate === 0 ? "neutral" : winRateTone}
          icon={Trophy}
          helper="Percentage of closed deals won vs last month"
          animationDelay={240}
        />
        <MetricCard
          label="Average deal size"
          value={formatLocalizedCurrency(allTimeAvgDeal, localization)}
          trend={avgDealTrend.label}
          tone={avgDealTrend.tone}
          icon={CircleDollarSign}
          helper="Avg value of won deals vs last month"
          animationDelay={280}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <DashboardAnalytics
          data={analyticsData}
        />
        <RevenueAnalytics
          data={revenueData}
          localization={localization}
          description="Pipeline value added vs confirmed revenue over the last 12 months."
          rangeLabel="Last 12 months"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <TaskActivityAnalytics data={taskVelocityData} />
        <LeadStatusAnalytics data={leadStatusData} />
      </div>
    </div>
  );
}

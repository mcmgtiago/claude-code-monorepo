import type { Route } from "next";
import { leadStatusLabels } from "@/lib/crm";
import { prisma } from "@/lib/prisma";

export type WorkspaceActivityItem = {
  id: string;
  title: string;
  description: string;
  href: Route;
  timestamp: Date;
  kind: "lead" | "contact" | "company" | "task" | "meeting";
  badge: string;
};

export async function getRecentWorkspaceActivity(workspaceId: string, limit = 8): Promise<WorkspaceActivityItem[]> {
  const [recentLeadActivity, recentContactActivity, recentCompanyActivity, recentTaskActivity, recentMeetingActivity] = await Promise.all([
    prisma.lead.findMany({
      where: { workspaceId },
      select: {
        id: true,
        name: true,
        company: true,
        status: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { updatedAt: "desc" },
      take: 5
    }),
    prisma.contact.findMany({
      where: { workspaceId },
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: { name: true }
        }
      },
      orderBy: { updatedAt: "desc" },
      take: 5
    }),
    prisma.company.findMany({
      where: { workspaceId },
      select: {
        id: true,
        name: true,
        industry: true,
        location: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { updatedAt: "desc" },
      take: 5
    }),
    prisma.task.findMany({
      where: { workspaceId },
      select: {
        id: true,
        title: true,
        taskType: true,
        ownerName: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { updatedAt: "desc" },
      take: 5
    }),
    prisma.meetingEvent.findMany({
      where: { workspaceId },
      select: {
        id: true,
        title: true,
        hostName: true,
        startsAt: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" },
      take: 5
    })
  ]);

  return [
    ...recentLeadActivity.map<WorkspaceActivityItem>((lead) => ({
      id: `lead-${lead.id}`,
      title: lead.updatedAt > lead.createdAt ? "Lead updated" : "Lead created",
      description: `${lead.name}${lead.company ? ` • ${lead.company}` : ""} • ${leadStatusLabels[lead.status]}`,
      href: "/pipeline",
      timestamp: new Date(lead.updatedAt),
      kind: "lead",
      badge: lead.updatedAt > lead.createdAt ? "Updated" : "Created"
    })),
    ...recentContactActivity.map<WorkspaceActivityItem>((contact) => ({
      id: `contact-${contact.id}`,
      title: contact.updatedAt > contact.createdAt ? "Person updated" : "Person added",
      description: `${contact.fullName}${contact.company?.name ? ` • ${contact.company.name}` : contact.email ? ` • ${contact.email}` : ""}`,
      href: `/contacts/${contact.id}` as Route,
      timestamp: new Date(contact.updatedAt),
      kind: "contact",
      badge: contact.updatedAt > contact.createdAt ? "Updated" : "New"
    })),
    ...recentCompanyActivity.map<WorkspaceActivityItem>((company) => ({
      id: `company-${company.id}`,
      title: company.updatedAt > company.createdAt ? "Company updated" : "Company added",
      description: `${company.name}${company.industry ? ` • ${company.industry}` : company.location ? ` • ${company.location}` : ""}`,
      href: `/companies/${company.id}` as Route,
      timestamp: new Date(company.updatedAt),
      kind: "company",
      badge: company.updatedAt > company.createdAt ? "Updated" : "New"
    })),
    ...recentTaskActivity.map<WorkspaceActivityItem>((task) => ({
      id: `task-${task.id}`,
      title: task.updatedAt > task.createdAt ? "Task updated" : "Task created",
      description: `${task.title} • ${task.taskType} • ${task.ownerName}`,
      href: "/tasks",
      timestamp: new Date(task.updatedAt),
      kind: "task",
      badge: task.updatedAt > task.createdAt ? "Updated" : "New"
    })),
    ...recentMeetingActivity.map<WorkspaceActivityItem>((meeting) => ({
      id: `meeting-${meeting.id}`,
      title: "Meeting scheduled",
      description: `${meeting.title} • ${meeting.hostName}`,
      href: "/meetings",
      timestamp: new Date(meeting.createdAt),
      kind: "meeting",
      badge: "Meeting"
    }))
  ]
    .sort((left, right) => right.timestamp.getTime() - left.timestamp.getTime())
    .slice(0, limit);
}

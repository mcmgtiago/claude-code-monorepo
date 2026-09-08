import { TrashEntityType, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type DbClient = Prisma.TransactionClient | typeof prisma;
const leadTrashEntityType = "LEAD" as TrashEntityType;

type ContactSnapshot = {
  id: string;
  workspaceId: string | null;
  fullName: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  stage: string | null;
  linkedinUrl: string | null;
  location: string | null;
  timeZone: string | null;
  companyId: string | null;
  createdAt: string;
  updatedAt: string;
};

type LeadSnapshot = {
  id: string;
  workspaceId: string | null;
  name: string;
  summary: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  companyId: string | null;
  contactId: string | null;
  source: string | null;
  status: "NEW" | "QUALIFIED" | "PROPOSAL" | "NEGOTIATION" | "WON" | "LOST";
  sortOrder: number;
  value: number;
  score: number;
  dueDate: string | null;
  attachmentsCount: number;
  assignedUsersJson: string | null;
  lastContact: string | null;
  createdAt: string;
  updatedAt: string;
};

type CompanySnapshot = {
  id: string;
  workspaceId: string | null;
  name: string;
  website: string | null;
  logoUrl: string | null;
  industry: string | null;
  type: string | null;
  phone: string | null;
  location: string | null;
  description: string | null;
  stage: string | null;
  employeeCount: number | null;
  foundedYear: number | null;
  revenueLabel: string | null;
  marketCapLabel: string | null;
  linkedinUrl: string | null;
  facebookUrl: string | null;
  xUrl: string | null;
  listsJson: string | null;
  keywordsJson: string | null;
  createdAt: string;
  updatedAt: string;
};

type TaskSnapshot = {
  id: string;
  workspaceId: string | null;
  title: string;
  description: string | null;
  taskType: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  ownerName: string;
  ownerEmail: string;
  associateName: string | null;
  associateEmail: string | null;
  associateCompany: string | null;
  dueDate: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  leadId: string | null;
  contactId: string | null;
  companyId: string | null;
  createdAt: string;
  updatedAt: string;
};

type MeetingEventSnapshot = {
  id: string;
  workspaceId: string | null;
  title: string;
  startsAt: string;
  endsAt: string;
  locationType: "GOOGLE_MEET" | "ZOOM" | "MICROSOFT_TEAMS" | "CUSTOM_LINK";
  locationLabel: string | null;
  meetingUrl: string | null;
  recordMeeting: boolean;
  insightEnabled: boolean;
  hostName: string;
  hostEmail: string;
  createdAt: string;
  updatedAt: string;
};

type SchedulingPageSnapshot = {
  id: string;
  workspaceId: string | null;
  title: string;
  slug: string;
  durationMinutes: number;
  hostType: string;
  active: boolean;
  hostName: string;
  hostEmail: string;
  createdAt: string;
  updatedAt: string;
};

type TrashSnapshot =
  | LeadSnapshot
  | ContactSnapshot
  | CompanySnapshot
  | TaskSnapshot
  | MeetingEventSnapshot
  | SchedulingPageSnapshot;

function formatDescription(parts: Array<string | null | undefined>) {
  const value = parts.filter(Boolean).join(" • ").trim();
  return value || null;
}

export async function archiveContact(tx: DbClient, contactId: string) {
  const contact = await tx.contact.findUnique({
    where: { id: contactId },
    include: {
      company: {
        select: { name: true }
      }
    }
  });

  if (!contact) {
    throw new Error("Contact not found");
  }

  const payload: ContactSnapshot = {
    id: contact.id,
    workspaceId: contact.workspaceId,
    fullName: contact.fullName,
    email: contact.email,
    phone: contact.phone,
    title: contact.title,
    stage: contact.stage,
    linkedinUrl: contact.linkedinUrl,
    location: contact.location,
    timeZone: contact.timeZone,
    companyId: contact.companyId,
    createdAt: contact.createdAt.toISOString(),
    updatedAt: contact.updatedAt.toISOString()
  };

  await tx.trashEntry.create({
    data: {
      workspaceId: contact.workspaceId,
      entityType: TrashEntityType.CONTACT,
      entityId: contact.id,
      title: contact.fullName,
      description: formatDescription([contact.company?.name, contact.email]),
      payload
    }
  });
}

export async function archiveLead(tx: DbClient, leadId: string) {
  const lead = await tx.lead.findUnique({
    where: { id: leadId },
    include: {
      companyRecord: {
        select: { name: true }
      }
    }
  });

  if (!lead) {
    throw new Error("Lead not found");
  }

  const payload: LeadSnapshot = {
    id: lead.id,
    workspaceId: lead.workspaceId,
    name: lead.name,
    summary: lead.summary,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    companyId: lead.companyId,
    contactId: lead.contactId,
    source: lead.source,
    status: lead.status,
    sortOrder: lead.sortOrder,
    value: lead.value,
    score: lead.score,
    dueDate: lead.dueDate ? lead.dueDate.toISOString() : null,
    attachmentsCount: lead.attachmentsCount,
    assignedUsersJson: lead.assignedUsersJson,
    lastContact: lead.lastContact ? lead.lastContact.toISOString() : null,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString()
  };

  await tx.trashEntry.create({
    data: {
      workspaceId: lead.workspaceId,
      entityType: leadTrashEntityType,
      entityId: lead.id,
      title: lead.name,
      description: formatDescription([lead.companyRecord?.name || lead.company, lead.source]),
      payload
    }
  });
}

export async function archiveCompany(tx: DbClient, companyId: string) {
  const company = await tx.company.findUnique({ where: { id: companyId } });

  if (!company) {
    throw new Error("Company not found");
  }

  const payload: CompanySnapshot = {
    id: company.id,
    workspaceId: company.workspaceId,
    name: company.name,
    website: company.website,
    logoUrl: company.logoUrl,
    industry: company.industry,
    type: company.type,
    phone: company.phone,
    location: company.location,
    description: company.description,
    stage: company.stage,
    employeeCount: company.employeeCount,
    foundedYear: company.foundedYear,
    revenueLabel: company.revenueLabel,
    marketCapLabel: company.marketCapLabel,
    linkedinUrl: company.linkedinUrl,
    facebookUrl: company.facebookUrl,
    xUrl: company.xUrl,
    listsJson: company.listsJson,
    keywordsJson: company.keywordsJson,
    createdAt: company.createdAt.toISOString(),
    updatedAt: company.updatedAt.toISOString()
  };

  await tx.trashEntry.create({
    data: {
      workspaceId: company.workspaceId,
      entityType: TrashEntityType.COMPANY,
      entityId: company.id,
      title: company.name,
      description: formatDescription([company.industry, company.location]),
      payload
    }
  });
}

export async function archiveTask(tx: DbClient, taskId: string) {
  const task = await tx.task.findUnique({ where: { id: taskId } });

  if (!task) {
    throw new Error("Task not found");
  }

  const payload: TaskSnapshot = {
    id: task.id,
    workspaceId: task.workspaceId,
    title: task.title,
    description: task.description,
    taskType: task.taskType,
    priority: task.priority,
    ownerName: task.ownerName,
    ownerEmail: task.ownerEmail,
    associateName: task.associateName,
    associateEmail: task.associateEmail,
    associateCompany: task.associateCompany,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    status: task.status,
    leadId: task.leadId,
    contactId: task.contactId,
    companyId: task.companyId,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString()
  };

  await tx.trashEntry.create({
    data: {
      workspaceId: task.workspaceId,
      entityType: TrashEntityType.TASK,
      entityId: task.id,
      title: task.title,
      description: formatDescription([task.taskType, task.ownerName]),
      payload
    }
  });
}

export async function archiveMeetingEvent(tx: DbClient, meetingId: string) {
  const meeting = await tx.meetingEvent.findUnique({ where: { id: meetingId } });

  if (!meeting) {
    throw new Error("Meeting not found");
  }

  const payload: MeetingEventSnapshot = {
    id: meeting.id,
    workspaceId: meeting.workspaceId,
    title: meeting.title,
    startsAt: meeting.startsAt.toISOString(),
    endsAt: meeting.endsAt.toISOString(),
    locationType: meeting.locationType,
    locationLabel: meeting.locationLabel,
    meetingUrl: meeting.meetingUrl,
    recordMeeting: meeting.recordMeeting,
    insightEnabled: meeting.insightEnabled,
    hostName: meeting.hostName,
    hostEmail: meeting.hostEmail,
    createdAt: meeting.createdAt.toISOString(),
    updatedAt: meeting.updatedAt.toISOString()
  };

  await tx.trashEntry.create({
    data: {
      workspaceId: meeting.workspaceId,
      entityType: TrashEntityType.MEETING_EVENT,
      entityId: meeting.id,
      title: meeting.title,
      description: formatDescription([meeting.hostName, meeting.locationLabel]),
      payload
    }
  });
}

export async function archiveSchedulingPage(tx: DbClient, pageId: string) {
  const page = await tx.schedulingPage.findUnique({ where: { id: pageId } });

  if (!page) {
    throw new Error("Scheduling page not found");
  }

  const payload: SchedulingPageSnapshot = {
    id: page.id,
    workspaceId: page.workspaceId,
    title: page.title,
    slug: page.slug,
    durationMinutes: page.durationMinutes,
    hostType: page.hostType,
    active: page.active,
    hostName: page.hostName,
    hostEmail: page.hostEmail,
    createdAt: page.createdAt.toISOString(),
    updatedAt: page.updatedAt.toISOString()
  };

  await tx.trashEntry.create({
    data: {
      workspaceId: page.workspaceId,
      entityType: TrashEntityType.SCHEDULING_PAGE,
      entityId: page.id,
      title: page.title,
      description: formatDescription([`${page.durationMinutes} min`, page.slug]),
      payload
    }
  });
}

function asSnapshot<T extends TrashSnapshot>(payload: Prisma.JsonValue) {
  return payload as unknown as T;
}

export async function restoreTrashEntry(trashEntryId: string, fallbackWorkspaceId: string) {
  return prisma.$transaction(async (tx) => {
    const entry = await tx.trashEntry.findUnique({ where: { id: trashEntryId } });

    if (!entry) {
      throw new Error("Trash item not found");
    }

    if (entry.workspaceId && entry.workspaceId !== fallbackWorkspaceId) {
      throw new Error("Trash item not found");
    }

    const workspaceId = entry.workspaceId || fallbackWorkspaceId;

    switch (entry.entityType) {
      case leadTrashEntityType: {
        const payload = asSnapshot<LeadSnapshot>(entry.payload);
        const [contact, company] = await Promise.all([
          payload.contactId ? tx.contact.findUnique({ where: { id: payload.contactId }, select: { id: true } }) : Promise.resolve(null),
          payload.companyId ? tx.company.findUnique({ where: { id: payload.companyId }, select: { id: true, name: true } }) : Promise.resolve(null)
        ]);

        await tx.lead.create({
          data: {
            id: payload.id,
            workspaceId,
            name: payload.name,
            summary: payload.summary,
            email: payload.email,
            phone: payload.phone,
            company: company?.name || payload.company,
            companyId: company?.id || null,
            contactId: contact?.id || null,
            source: payload.source,
            status: payload.status,
            sortOrder: payload.sortOrder,
            value: payload.value,
            score: payload.score,
            dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
            attachmentsCount: 0,
            attachmentsJson: null,
            assignedUsersJson: payload.assignedUsersJson,
            lastContact: payload.lastContact ? new Date(payload.lastContact) : null,
            createdAt: new Date(payload.createdAt),
            updatedAt: new Date(payload.updatedAt)
          }
        });
        break;
      }
      case TrashEntityType.CONTACT: {
        const payload = asSnapshot<ContactSnapshot>(entry.payload);
        const existingCompany = payload.companyId ? await tx.company.findUnique({ where: { id: payload.companyId }, select: { id: true } }) : null;

        await tx.contact.create({
          data: {
            id: payload.id,
            workspaceId,
            fullName: payload.fullName,
            email: payload.email,
            phone: payload.phone,
            title: payload.title,
            stage: payload.stage,
            linkedinUrl: payload.linkedinUrl,
            location: payload.location,
            timeZone: payload.timeZone,
            companyId: existingCompany?.id || null,
            createdAt: new Date(payload.createdAt),
            updatedAt: new Date(payload.updatedAt)
          }
        });
        break;
      }
      case TrashEntityType.COMPANY: {
        const payload = asSnapshot<CompanySnapshot>(entry.payload);

        await tx.company.create({
          data: {
            id: payload.id,
            workspaceId,
            name: payload.name,
            website: payload.website,
            logoUrl: payload.logoUrl,
            industry: payload.industry,
            type: payload.type,
            phone: payload.phone,
            location: payload.location,
            description: payload.description,
            stage: payload.stage,
            employeeCount: payload.employeeCount,
            foundedYear: payload.foundedYear,
            revenueLabel: payload.revenueLabel,
            marketCapLabel: payload.marketCapLabel,
            linkedinUrl: payload.linkedinUrl,
            facebookUrl: payload.facebookUrl,
            xUrl: payload.xUrl,
            listsJson: payload.listsJson,
            keywordsJson: payload.keywordsJson,
            createdAt: new Date(payload.createdAt),
            updatedAt: new Date(payload.updatedAt)
          }
        });
        break;
      }
      case TrashEntityType.TASK: {
        const payload = asSnapshot<TaskSnapshot>(entry.payload);
        const [lead, contact, company] = await Promise.all([
          payload.leadId ? tx.lead.findUnique({ where: { id: payload.leadId }, select: { id: true } }) : Promise.resolve(null),
          payload.contactId ? tx.contact.findUnique({ where: { id: payload.contactId }, select: { id: true } }) : Promise.resolve(null),
          payload.companyId ? tx.company.findUnique({ where: { id: payload.companyId }, select: { id: true } }) : Promise.resolve(null)
        ]);

        await tx.task.create({
          data: {
            id: payload.id,
            workspaceId,
            title: payload.title,
            description: payload.description,
            taskType: payload.taskType,
            priority: payload.priority,
            ownerName: payload.ownerName,
            ownerEmail: payload.ownerEmail,
            associateName: payload.associateName,
            associateEmail: payload.associateEmail,
            associateCompany: payload.associateCompany,
            dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
            status: payload.status,
            leadId: lead?.id || null,
            contactId: contact?.id || null,
            companyId: company?.id || null,
            createdAt: new Date(payload.createdAt),
            updatedAt: new Date(payload.updatedAt)
          }
        });
        break;
      }
      case TrashEntityType.MEETING_EVENT: {
        const payload = asSnapshot<MeetingEventSnapshot>(entry.payload);

        await tx.meetingEvent.create({
          data: {
            id: payload.id,
            workspaceId,
            title: payload.title,
            startsAt: new Date(payload.startsAt),
            endsAt: new Date(payload.endsAt),
            locationType: payload.locationType,
            locationLabel: payload.locationLabel,
            meetingUrl: payload.meetingUrl,
            recordMeeting: payload.recordMeeting,
            insightEnabled: payload.insightEnabled,
            hostName: payload.hostName,
            hostEmail: payload.hostEmail,
            externalCalendarProvider: null,
            externalCalendarId: null,
            externalEventId: null,
            createdAt: new Date(payload.createdAt),
            updatedAt: new Date(payload.updatedAt)
          }
        });
        break;
      }
      case TrashEntityType.SCHEDULING_PAGE: {
        const payload = asSnapshot<SchedulingPageSnapshot>(entry.payload);

        await tx.schedulingPage.create({
          data: {
            id: payload.id,
            workspaceId,
            title: payload.title,
            slug: payload.slug,
            durationMinutes: payload.durationMinutes,
            hostType: payload.hostType,
            active: payload.active,
            hostName: payload.hostName,
            hostEmail: payload.hostEmail,
            createdAt: new Date(payload.createdAt),
            updatedAt: new Date(payload.updatedAt)
          }
        });
        break;
      }
    }

    await tx.trashEntry.delete({ where: { id: entry.id } });
    return entry;
  });
}

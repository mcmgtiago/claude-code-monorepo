import { parseLeadAttachments } from "@/lib/lead-attachments";
import { getAssignedUserIds, getAssignedUserNames, parseAssignedUserEntries } from "@/lib/lead-assignees";

type LeadRecord = {
  companyId?: string | null;
  companyRecord?: { id: string; name: string; logoUrl?: string | null } | null;
  contactId?: string | null;
  contactRecord?: { id: string; fullName: string; email: string | null; phone: string | null } | null;
  assignedUsersJson: string | null;
  attachmentsJson?: string | null;
  summary: string | null;
  dueDate: Date | string | null;
  attachmentsCount: number | null;
  lastContact?: Date | string | null;
  company?: string | null;
  source?: string | null;
  sortOrder?: number | null;
  notes: Array<{ id: string; body: string; createdAt?: Date | string }>;
  tasks: Array<{ id: string; title: string; createdAt?: Date | string; status?: string; dueDate?: Date | string | null }>;
  reminders?: Array<{ id: string; title: string; remindAt: Date | string; completedAt?: Date | string | null; createdAt?: Date | string }>;
} & Record<string, unknown>;

export function serializeLead<T extends LeadRecord>(lead: T) {
  const assignedUserEntries = parseAssignedUserEntries(lead.assignedUsersJson);
  const assignedUsers = getAssignedUserNames(assignedUserEntries);
  const assignedUserIds = getAssignedUserIds(assignedUserEntries);
  const attachments = parseLeadAttachments(lead.attachmentsJson);
  const companyName = lead.companyRecord?.name || lead.company || null;
  const contactName = lead.contactRecord?.fullName || null;

  return {
    ...lead,
    sortOrder: lead.sortOrder ?? 0,
    companyId: lead.companyId || lead.companyRecord?.id || null,
    contactId: lead.contactId || lead.contactRecord?.id || null,
    contactName,
    company: companyName,
    companyLogoUrl: lead.companyRecord?.logoUrl || null,
    email: lead.contactRecord?.email || lead.email || null,
    phone: lead.contactRecord?.phone || lead.phone || null,
    summary: lead.summary || `Keep ${contactName || companyName || "this account"} moving from ${lead.source || "the current channel"}.`,
    dueDate: lead.dueDate || lead.lastContact || null,
    attachmentsCount: attachments.length || lead.attachmentsCount || 0,
    attachments,
    assignedUsers,
    assignedUserIds,
    reminders: (lead.reminders || []).map((reminder) => ({
      id: reminder.id,
      title: reminder.title,
      remindAt: reminder.remindAt,
      completedAt: reminder.completedAt || null,
      createdAt: reminder.createdAt || null
    }))
  };
}

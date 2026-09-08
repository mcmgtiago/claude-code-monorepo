import type { Prisma } from "@prisma/client";
import { isAutoCreatedLeadContact } from "@/lib/lead-contact-cleanup";
import { prisma } from "@/lib/prisma";
import { archiveContact, archiveLead } from "@/lib/trash";

type DbClient = Prisma.TransactionClient | typeof prisma;

function normalizeText(value: string | null | undefined) {
  const normalized = value?.trim() || "";
  return normalized || null;
}

export function leadHasAnchor(input: {
  companyId?: string | null;
  company?: string | null;
  contactId?: string | null;
}) {
  return Boolean(normalizeText(input.contactId) || normalizeText(input.companyId) || normalizeText(input.company));
}

export async function deleteLeadWithCleanup(tx: DbClient, leadId: string) {
  const lead = await tx.lead.findUnique({
    where: { id: leadId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      companyId: true,
      contactId: true,
      createdAt: true
    }
  });

  if (!lead) {
    throw new Error("Lead not found");
  }

  await archiveLead(tx, leadId);

  await tx.task.updateMany({
    where: { leadId },
    data: { leadId: null }
  });

  await tx.note.deleteMany({
    where: { leadId }
  });

  const linkedContact =
    lead.contactId
      ? await tx.contact.findUnique({
          where: { id: lead.contactId },
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            companyId: true,
            title: true,
            stage: true,
            linkedinUrl: true,
            location: true,
            timeZone: true,
            customFieldsJson: true,
            createdAt: true,
            _count: {
              select: {
                leads: true,
                tasks: true
              }
            }
          }
        })
      : null;
  const deleteLinkedContact =
    linkedContact &&
    isAutoCreatedLeadContact(linkedContact, {
      contactId: lead.contactId,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      companyId: lead.companyId,
      createdAt: lead.createdAt.toISOString()
    });

  await tx.lead.delete({
    where: { id: leadId }
  });

  if (deleteLinkedContact && linkedContact) {
    await archiveContact(tx, linkedContact.id);
    await tx.contact.delete({
      where: { id: linkedContact.id }
    });
  }
}

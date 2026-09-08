import { prisma } from "@/lib/prisma";
import { collectThreadParticipants, normalizeEmail } from "@/lib/email-threading";
import { getEmailWorkspaceThreads, type EmailWorkspaceThread } from "@/lib/email-workspace";

export type RelatedCrmLead = {
  id: string;
  name: string;
  status: string;
  email: string | null;
  company: string | null;
  contactId: string | null;
  contactName: string | null;
};

export type RelatedCrmContact = {
  id: string;
  fullName: string;
  email: string | null;
  title: string | null;
  companyId: string | null;
  companyName: string | null;
};

export type RelatedEmailContext = {
  kind: "lead" | "contact" | "thread" | "email";
  id?: string;
  label: string;
  primaryEmail: string | null;
  participantEmails: string[];
};

function uniqueParticipantEmails(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values
        .map((value) => normalizeEmail(value))
        .filter(Boolean)
    )
  );
}

export async function getCrmRecordsForParticipantEmails({
  workspaceId,
  participantEmails
}: {
  workspaceId: string;
  participantEmails: Array<string | null | undefined>;
}) {
  const normalizedEmails = uniqueParticipantEmails(participantEmails);

  if (!normalizedEmails.length) {
    return {
      leads: [] as RelatedCrmLead[],
      contacts: [] as RelatedCrmContact[]
    };
  }

  const [contacts, leads] = await Promise.all([
    prisma.contact.findMany({
      where: {
        workspaceId,
        email: { in: normalizedEmails }
      },
      orderBy: { fullName: "asc" },
      select: {
        id: true,
        fullName: true,
        email: true,
        title: true,
        companyId: true,
        company: {
          select: { name: true }
        }
      }
    }),
    prisma.lead.findMany({
      where: {
        workspaceId,
        OR: [
          { email: { in: normalizedEmails } },
          {
            contactRecord: {
              is: {
                email: { in: normalizedEmails }
              }
            }
          }
        ]
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        status: true,
        email: true,
        company: true,
        companyRecord: {
          select: { name: true }
        },
        contactId: true,
        contactRecord: {
          select: {
            fullName: true,
            email: true
          }
        }
      }
    })
  ]);

  const mappedContacts = contacts.map((contact) => ({
    id: contact.id,
    fullName: contact.fullName,
    email: contact.email,
    title: contact.title,
    companyId: contact.companyId,
    companyName: contact.company?.name || null
  }));

  const mappedLeads = Array.from(
    new Map(
      leads.map((lead) => [
        lead.id,
        {
          id: lead.id,
          name: lead.name,
          status: lead.status,
          email: lead.contactRecord?.email || lead.email || null,
          company: lead.companyRecord?.name || lead.company || null,
          contactId: lead.contactId,
          contactName: lead.contactRecord?.fullName || null
        }
      ])
    ).values()
  );

  return {
    leads: mappedLeads,
    contacts: mappedContacts
  };
}

export async function getEmailThreadsForParticipantEmails({
  workspaceId,
  mailboxUserId,
  participantEmails
}: {
  workspaceId: string;
  mailboxUserId: string;
  participantEmails: Array<string | null | undefined>;
}) {
  const normalizedEmails = uniqueParticipantEmails(participantEmails);

  if (!normalizedEmails.length) {
    return [] as EmailWorkspaceThread[];
  }

  const threads = await prisma.emailThread.findMany({
    where: {
      workspaceId,
      mailboxUserId,
      OR: [
        { fromEmail: { in: normalizedEmails } },
        ...normalizedEmails.flatMap((email) => [
          { toEmail: { contains: email } },
          { ccEmail: { contains: email } },
          { bccEmail: { contains: email } }
        ]),
        {
          messages: {
            some: {
              OR: [
                { fromEmail: { in: normalizedEmails } },
                ...normalizedEmails.flatMap((email) => [
                  { toEmail: { contains: email } },
                  { ccEmail: { contains: email } },
                  { bccEmail: { contains: email } }
                ])
              ]
            }
          }
        }
      ]
    },
    include: {
      messages: {
        orderBy: { sentAt: "asc" }
      }
    },
    orderBy: { lastMessageAt: "desc" }
  });

  return getEmailWorkspaceThreads(threads);
}

export async function getLeadEmailContext({
  workspaceId,
  leadId
}: {
  workspaceId: string;
  leadId: string;
}) {
  const lead = await prisma.lead.findFirst({
    where: { id: leadId, workspaceId },
    select: {
      id: true,
      name: true,
      email: true,
      contactRecord: {
        select: {
          email: true
        }
      }
    }
  });

  if (!lead) {
    return null;
  }

  const participantEmails = uniqueParticipantEmails([lead.contactRecord?.email || null, lead.email]);

  return {
    kind: "lead" as const,
    id: lead.id,
    label: lead.name,
    primaryEmail: participantEmails[0] || null,
    participantEmails
  };
}

export async function getContactEmailContext({
  workspaceId,
  contactId
}: {
  workspaceId: string;
  contactId: string;
}) {
  const contact = await prisma.contact.findFirst({
    where: { id: contactId, workspaceId },
    select: {
      id: true,
      fullName: true,
      email: true,
      leads: {
        select: {
          email: true
        }
      }
    }
  });

  if (!contact) {
    return null;
  }

  const participantEmails = uniqueParticipantEmails([contact.email, ...contact.leads.map((lead) => lead.email)]);

  return {
    kind: "contact" as const,
    id: contact.id,
    label: contact.fullName,
    primaryEmail: participantEmails[0] || null,
    participantEmails
  };
}

export async function getThreadEmailContext({
  workspaceId,
  mailboxUserId,
  threadId
}: {
  workspaceId: string;
  mailboxUserId: string;
  threadId: string;
}) {
  const thread = await prisma.emailThread.findFirst({
    where: {
      id: threadId,
      workspaceId,
      mailboxUserId
    },
    select: {
      id: true,
      subject: true,
      fromEmail: true,
      toEmail: true,
      ccEmail: true,
      bccEmail: true,
      messages: {
        select: {
          fromEmail: true,
          toEmail: true,
          ccEmail: true,
          bccEmail: true
        }
      }
    }
  });

  if (!thread) {
    return null;
  }

  const participantEmails = uniqueParticipantEmails(collectThreadParticipants(thread));

  return {
    kind: "thread" as const,
    id: thread.id,
    label: thread.subject,
    primaryEmail: participantEmails[0] || null,
    participantEmails
  };
}

export function getDirectEmailContext(email: string) {
  const participantEmails = uniqueParticipantEmails([email]);

  return {
    kind: "email" as const,
    label: participantEmails[0] || email,
    primaryEmail: participantEmails[0] || null,
    participantEmails
  };
}

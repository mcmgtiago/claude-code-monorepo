import "server-only";

import { type LeadStatus } from "@prisma/client";
import { getPreferredWorkspaceSenderUserId, sendTrackedEmail } from "@/lib/email";
import { buildLeadAssignmentEmail, buildLeadStageChangeEmail } from "@/lib/email-html";
import { buildAppUrl } from "@/lib/app-url";
import { type AssignedUserEntry, parseAssignedUserEntries } from "@/lib/lead-assignees";
import { prisma } from "@/lib/prisma";

const leadStatusLabels: Record<LeadStatus, string> = {
  NEW: "New",
  QUALIFIED: "Qualified",
  PROPOSAL: "Proposal",
  NEGOTIATION: "Negotiation",
  WON: "Won",
  LOST: "Lost"
};

async function deliverNotificationEmail(input: {
  senderUserId: string | null;
  workspaceId: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  if (!input.senderUserId) {
    return null;
  }

  try {
    await sendTrackedEmail({
      userId: input.senderUserId,
      workspaceId: input.workspaceId,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html
    });

    return new Date();
  } catch {
    return null;
  }
}

export async function notifyLeadAssignment(input: {
  workspaceId: string;
  leadId: string;
  leadName: string;
  companyName?: string | null;
  assignedUsers: AssignedUserEntry[];
  actorUserId: string;
  actorName: string;
}) {
  if (!input.assignedUsers.length) {
    return;
  }

  const assignedUserIds = Array.from(new Set(input.assignedUsers.map((entry) => entry.id).filter(Boolean))) as string[];
  const assignedUserNames = Array.from(new Set(input.assignedUsers.map((entry) => entry.fullName).filter(Boolean)));
  const recipients = await prisma.user.findMany({
    where: {
      workspaceId: input.workspaceId,
      status: "ACTIVE",
      OR: [
        ...(assignedUserIds.length ? [{ id: { in: assignedUserIds } }] : []),
        ...(assignedUserNames.length ? [{ fullName: { in: assignedUserNames } }] : [])
      ],
      NOT: {
        id: input.actorUserId
      }
    },
    select: {
      id: true,
      fullName: true,
      email: true
    }
  });

  if (!recipients.length) {
    return;
  }

  const [senderUserId, ctaUrl] = await Promise.all([
    getPreferredWorkspaceSenderUserId(input.workspaceId),
    buildAppUrl(`/pipeline?leadId=${encodeURIComponent(input.leadId)}`)
  ]);

  await Promise.all(
    recipients.map(async (recipient) => {
      const html = buildLeadAssignmentEmail({
        recipientName: recipient.fullName,
        actorName: input.actorName,
        leadName: input.leadName,
        companyName: input.companyName ?? null,
        ctaUrl
      });

      const emailedAt = await deliverNotificationEmail({
        senderUserId,
        workspaceId: input.workspaceId,
        to: recipient.email,
        subject: `Lead assigned: ${input.leadName}`,
        text: `Hi ${recipient.fullName},\n\n${input.actorName} assigned you to lead "${input.leadName}".\n${input.companyName ? `Company: ${input.companyName}\n` : ""}\nOpen CRM to review the lead.`,
        html
      });

      await prisma.appNotification.create({
        data: {
          userId: recipient.id,
          kind: "LEAD_ASSIGNMENT",
          title: `Lead assigned: ${input.leadName}`,
          body: input.companyName
            ? `${input.actorName} assigned you to ${input.leadName} at ${input.companyName}.`
            : `${input.actorName} assigned you to ${input.leadName}.`,
          link: `/pipeline?leadId=${encodeURIComponent(input.leadId)}`,
          emailedAt
        }
      });
    })
  );
}

export async function notifyLeadStageChange(input: {
  workspaceId: string;
  leadId: string;
  leadName: string;
  companyName?: string | null;
  assignedUsers: AssignedUserEntry[];
  previousStatus: LeadStatus;
  nextStatus: LeadStatus;
  actorUserId: string;
  actorName: string;
}) {
  if (input.previousStatus === input.nextStatus || !input.assignedUsers.length) {
    return;
  }

  const assignedUserIds = Array.from(new Set(input.assignedUsers.map((entry) => entry.id).filter(Boolean))) as string[];
  const assignedUserNames = Array.from(new Set(input.assignedUsers.map((entry) => entry.fullName).filter(Boolean)));
  const recipients = await prisma.user.findMany({
    where: {
      workspaceId: input.workspaceId,
      status: "ACTIVE",
      OR: [
        ...(assignedUserIds.length ? [{ id: { in: assignedUserIds } }] : []),
        ...(assignedUserNames.length ? [{ fullName: { in: assignedUserNames } }] : [])
      ],
      NOT: {
        id: input.actorUserId
      }
    },
    select: {
      id: true,
      fullName: true,
      email: true
    }
  });

  if (!recipients.length) {
    return;
  }

  const fromLabel = leadStatusLabels[input.previousStatus];
  const toLabel = leadStatusLabels[input.nextStatus];

  const [senderUserId, ctaUrl] = await Promise.all([
    getPreferredWorkspaceSenderUserId(input.workspaceId),
    buildAppUrl(`/pipeline?leadId=${encodeURIComponent(input.leadId)}`)
  ]);

  await Promise.all(
    recipients.map(async (recipient) => {
      const html = buildLeadStageChangeEmail({
        recipientName: recipient.fullName,
        actorName: input.actorName,
        leadName: input.leadName,
        companyName: input.companyName ?? null,
        previousStage: fromLabel,
        nextStage: toLabel,
        ctaUrl
      });

      const emailedAt = await deliverNotificationEmail({
        senderUserId,
        workspaceId: input.workspaceId,
        to: recipient.email,
        subject: `Deal stage changed: ${input.leadName}`,
        text: `Hi ${recipient.fullName},\n\n${input.actorName} moved "${input.leadName}" from ${fromLabel} to ${toLabel}.\n${input.companyName ? `Company: ${input.companyName}\n` : ""}\nOpen CRM to review the deal.`,
        html
      });

      await prisma.appNotification.create({
        data: {
          userId: recipient.id,
          kind: "LEAD_STAGE_CHANGE",
          title: `Deal stage changed: ${input.leadName}`,
          body: `${input.actorName} moved ${input.leadName} from ${fromLabel} to ${toLabel}.`,
          link: `/pipeline?leadId=${encodeURIComponent(input.leadId)}`,
          emailedAt
        }
      });
    })
  );
}

export function parseAssignedUsersJson(value: string | null | undefined) {
  return parseAssignedUserEntries(value);
}

import { LeadStatus } from "@prisma/client";
import { z } from "zod";
import { revalidateCrmDataPaths } from "@/lib/crm-revalidation";
import { deleteLeadWithCleanup, leadHasAnchor } from "@/lib/lead-lifecycle";
import { getAssignedUserIds, resolveAssignedUsersFromInput, serializeAssignedUserEntries } from "@/lib/lead-assignees";
import { notifyLeadAssignment, notifyLeadStageChange, parseAssignedUsersJson } from "@/lib/lead-notifications";
import { canControlLead, LEAD_CONTROL_DENIED_MESSAGE } from "@/lib/lead-permissions";
import { serializeLead } from "@/lib/lead-serializer";
import { resolveLeadCompany, resolveLeadContact } from "@/lib/lead-sync";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceContext } from "@/lib/workspace";

const leadUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  summary: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  contactId: z.string().optional().nullable().or(z.literal("")),
  companyId: z.string().optional().nullable().or(z.literal("")),
  company: z.string().optional(),
  source: z.string().optional(),
  status: z.nativeEnum(LeadStatus).optional(),
  value: z.coerce.number().optional(),
  score: z.coerce.number().min(0).max(100).optional(),
  dueDate: z.string().datetime().optional().or(z.literal("")),
  assignedUsers: z.array(z.string()).optional(),
  sortOrder: z.coerce.number().optional(),
  lastContact: z.string().datetime().optional().or(z.literal("")),
  note: z.string().min(1).optional()
});

const LEAD_ORDER_STEP = 1000;

export async function GET(_request: Request, context: { params: Promise<{ leadId: string }> }) {
  const { workspace } = await requireWorkspaceContext();
  const { leadId } = await context.params;

  const lead = await prisma.lead.findFirst({
    where: { id: leadId, workspaceId: workspace.id },
    include: {
      companyRecord: { select: { id: true, name: true, logoUrl: true } },
      contactRecord: { select: { id: true, fullName: true, email: true, phone: true } },
      notes: { orderBy: { createdAt: "desc" } },
      tasks: { orderBy: { createdAt: "desc" } },
      reminders: { orderBy: [{ completedAt: "asc" }, { remindAt: "asc" }] }
    }
  });

  if (!lead) {
    return Response.json({ error: "Lead not found" }, { status: 404 });
  }

  return Response.json(serializeLead(lead));
}

export async function PATCH(request: Request, context: { params: Promise<{ leadId: string }> }) {
  const { user, workspace } = await requireWorkspaceContext();
  const { leadId } = await context.params;

  try {
    const raw = await request.json();
    const payload = leadUpdateSchema.parse(raw);
    const activeTeam = payload.assignedUsers
      ? await prisma.user.findMany({
          where: { status: "ACTIVE", workspaceId: workspace.id },
          select: { id: true, fullName: true }
        })
      : [];
    const assignedUsers =
      payload.assignedUsers !== undefined
        ? resolveAssignedUsersFromInput(
            payload.assignedUsers,
            activeTeam
          )
        : undefined;
    const currentLead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: {
        id: true,
        workspaceId: true,
        name: true,
        email: true,
        phone: true,
        companyId: true,
        company: true,
        contactId: true,
        status: true,
        sortOrder: true,
        assignedUsersJson: true
      }
    });

    if (!currentLead || currentLead.workspaceId !== workspace.id) {
      return Response.json({ error: "Lead not found" }, { status: 404 });
    }

    if (!canControlLead(user, workspace, { assignedUsersJson: currentLead.assignedUsersJson })) {
      return Response.json({ error: LEAD_CONTROL_DENIED_MESSAGE }, { status: 403 });
    }

    const company =
      payload.companyId !== undefined || payload.company !== undefined
        ? await resolveLeadCompany({
            workspaceId: workspace.id,
            companyId: payload.companyId === null ? "" : payload.companyId,
            company: payload.company
          })
        : {
            companyId: currentLead.companyId,
            company: currentLead.company
          };

    const shouldSyncContact =
      payload.contactId !== undefined ||
      payload.name !== undefined ||
      payload.email !== undefined ||
      payload.phone !== undefined ||
      payload.companyId !== undefined ||
      payload.company !== undefined;

    const contact = shouldSyncContact
      ? await resolveLeadContact(
          {
            workspaceId: workspace.id,
            contactId: payload.contactId === null ? "" : payload.contactId ?? currentLead.contactId,
            name: payload.name ?? currentLead.name,
            email: payload.email ?? currentLead.email,
            phone: payload.phone ?? currentLead.phone,
            companyId: company.companyId,
            company: company.company
          },
          company
        )
      : null;

    const nextContactId = contact ? contact.contactId : currentLead.contactId;
    if (!leadHasAnchor({ companyId: company.companyId, company: company.company, contactId: nextContactId })) {
      return Response.json({ error: "Lead must be linked to a person or company." }, { status: 400 });
    }

    const nextStatus = payload.status ?? currentLead.status;
    const stageOrder =
      payload.sortOrder !== undefined || nextStatus !== currentLead.status
        ? await prisma.lead.aggregate({
            where: {
              workspaceId: workspace.id,
              status: nextStatus,
              NOT: { id: leadId }
            },
            _max: { sortOrder: true }
          })
        : null;
    const nextSortOrder =
      payload.sortOrder !== undefined
        ? payload.sortOrder
        : nextStatus !== currentLead.status
          ? (stageOrder?._max.sortOrder ?? 0) + LEAD_ORDER_STEP
          : undefined;

    const lead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        ...(payload.name !== undefined ? { name: payload.name } : {}),
        ...(payload.summary !== undefined ? { summary: payload.summary || null } : {}),
        ...(payload.email !== undefined ? { email: payload.email || null } : {}),
        ...(payload.phone !== undefined ? { phone: payload.phone || null } : {}),
        ...(company ? { company: company.company, companyId: company.companyId } : {}),
        ...(contact ? { contactId: contact.contactId } : {}),
        ...(payload.source !== undefined ? { source: payload.source || null } : {}),
        ...(payload.status !== undefined ? { status: payload.status } : {}),
        ...(nextSortOrder !== undefined ? { sortOrder: nextSortOrder } : {}),
        ...(payload.value !== undefined ? { value: payload.value } : {}),
        ...(payload.score !== undefined ? { score: payload.score } : {}),
        ...(payload.dueDate !== undefined ? { dueDate: payload.dueDate ? new Date(payload.dueDate) : null } : {}),
        ...(assignedUsers !== undefined ? { assignedUsersJson: serializeAssignedUserEntries(assignedUsers) } : {}),
        ...(payload.lastContact !== undefined
          ? { lastContact: payload.lastContact ? new Date(payload.lastContact) : null }
          : {}),
        ...(payload.note
          ? {
              notes: {
                create: [{ body: payload.note }]
              }
            }
          : {})
      },
      include: {
        companyRecord: { select: { id: true, name: true, logoUrl: true } },
        contactRecord: { select: { id: true, fullName: true, email: true, phone: true } },
        notes: { orderBy: { createdAt: "desc" } },
        tasks: { orderBy: { createdAt: "desc" } },
        reminders: { orderBy: [{ completedAt: "asc" }, { remindAt: "asc" }] }
      }
    });

    const previousAssignedUsers = parseAssignedUsersJson(currentLead.assignedUsersJson);
    const previousAssignedUserIds = getAssignedUserIds(previousAssignedUsers);
    const nextAssignedUsers = assignedUsers !== undefined ? assignedUsers : previousAssignedUsers;
    const nextAssignedUserIds = getAssignedUserIds(nextAssignedUsers);
    const newlyAssignedUsers = nextAssignedUsers.filter((entry) => entry.id && !previousAssignedUserIds.includes(entry.id));

    if (newlyAssignedUsers.length) {
      await notifyLeadAssignment({
        workspaceId: workspace.id,
        leadId: lead.id,
        leadName: lead.name,
        companyName: lead.companyRecord?.name || lead.company || null,
        assignedUsers: newlyAssignedUsers,
        actorUserId: user.id,
        actorName: user.fullName
      });
    }

    if (currentLead.status !== lead.status) {
      await notifyLeadStageChange({
        workspaceId: workspace.id,
        leadId: lead.id,
        leadName: lead.name,
        companyName: lead.companyRecord?.name || lead.company || null,
        assignedUsers: nextAssignedUsers.filter((entry) => !entry.id || nextAssignedUserIds.includes(entry.id)),
        previousStatus: currentLead.status,
        nextStatus: lead.status,
        actorUserId: user.id,
        actorName: user.fullName
      });
    }

    revalidateCrmDataPaths(
      lead.companyId ? `/companies/${lead.companyId}` : "",
      lead.contactId ? `/contacts/${lead.contactId}` : ""
    );

    return Response.json(serializeLead(lead));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid lead update payload", issues: error.issues }, { status: 400 });
    }

    return Response.json({ error: error instanceof Error ? error.message : "Unable to update lead" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ leadId: string }> }) {
  const { user, workspace } = await requireWorkspaceContext();
  const { leadId } = await context.params;

  try {
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, workspaceId: workspace.id },
      select: { id: true, assignedUsersJson: true }
    });

    if (!lead) {
      return Response.json({ error: "Lead not found" }, { status: 404 });
    }

    if (!canControlLead(user, workspace, { assignedUsersJson: lead.assignedUsersJson })) {
      return Response.json({ error: LEAD_CONTROL_DENIED_MESSAGE }, { status: 403 });
    }

    await prisma.$transaction(async (tx) => {
      await deleteLeadWithCleanup(tx, leadId);
    });

    revalidateCrmDataPaths();

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to delete lead" }, { status: 500 });
  }
}

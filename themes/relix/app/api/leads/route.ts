import { LeadStatus } from "@prisma/client";
import { z } from "zod";
import { revalidateCrmDataPaths } from "@/lib/crm-revalidation";
import { leadHasAnchor } from "@/lib/lead-lifecycle";
import { resolveAssignedUsersFromInput, serializeAssignedUserEntries } from "@/lib/lead-assignees";
import { notifyLeadAssignment } from "@/lib/lead-notifications";
import { serializeLead } from "@/lib/lead-serializer";
import { resolveLeadCompany, resolveLeadContact } from "@/lib/lead-sync";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceContext } from "@/lib/workspace";

const leadSchema = z.object({
  name: z.string().min(2),
  summary: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  contactId: z.string().optional().or(z.literal("")),
  companyId: z.string().optional().or(z.literal("")),
  company: z.string().optional(),
  source: z.string().optional(),
  status: z.nativeEnum(LeadStatus).optional(),
  value: z.coerce.number().default(0),
  score: z.coerce.number().min(0).max(100).default(0),
  dueDate: z.string().datetime().optional().or(z.literal("")),
  assignedUsers: z.array(z.string()).optional(),
  notes: z.string().optional()
});

const LEAD_ORDER_STEP = 1000;

export async function GET() {
  const { workspace } = await requireWorkspaceContext();
  const leads = await prisma.lead.findMany({
    where: { workspaceId: workspace.id },
    include: {
      companyRecord: { select: { id: true, name: true, logoUrl: true } },
      contactRecord: { select: { id: true, fullName: true, email: true, phone: true } },
      notes: { orderBy: { createdAt: "desc" } },
      tasks: { orderBy: { createdAt: "desc" } },
      reminders: { orderBy: [{ completedAt: "asc" }, { remindAt: "asc" }] }
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
  });

  return Response.json(leads.map((lead) => serializeLead(lead)));
}

export async function POST(request: Request) {
  try {
    const { user, workspace } = await requireWorkspaceContext();
    const raw = await request.json();
    const payload = leadSchema.parse(raw);
    const activeTeam = await prisma.user.findMany({
      where: { status: "ACTIVE", workspaceId: workspace.id },
      select: { id: true, fullName: true }
    });
    const assignedUsers = resolveAssignedUsersFromInput(
      payload.assignedUsers,
      activeTeam,
      user.id
    );
    const company = await resolveLeadCompany({ ...payload, workspaceId: workspace.id });
    const contact = await resolveLeadContact({ ...payload, workspaceId: workspace.id }, company);

    if (!leadHasAnchor({ companyId: company.companyId, company: company.company, contactId: contact.contactId })) {
      return Response.json({ error: "Lead must be linked to a person or company." }, { status: 400 });
    }

    const targetStatus = payload.status ?? LeadStatus.NEW;
    const stageOrder = await prisma.lead.aggregate({
      where: { workspaceId: workspace.id, status: targetStatus },
      _max: { sortOrder: true }
    });

    const lead = await prisma.lead.create({
      data: {
        workspaceId: workspace.id,
        name: payload.name,
        summary: payload.summary || null,
        email: payload.email || null,
        phone: payload.phone || null,
        company: company.company,
        companyId: company.companyId,
        contactId: contact.contactId,
        source: payload.source || null,
        status: targetStatus,
        sortOrder: (stageOrder._max.sortOrder ?? 0) + LEAD_ORDER_STEP,
        value: payload.value,
        score: payload.score,
        dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
        attachmentsCount: 0,
        attachmentsJson: null,
        assignedUsersJson: serializeAssignedUserEntries(assignedUsers),
        lastContact: null,
        notes: payload.notes
          ? {
              create: [{ body: payload.notes }]
            }
          : undefined
      },
      include: {
        companyRecord: { select: { id: true, name: true, logoUrl: true } },
        contactRecord: { select: { id: true, fullName: true, email: true, phone: true } },
        notes: { orderBy: { createdAt: "desc" } },
        tasks: { orderBy: { createdAt: "desc" } },
        reminders: { orderBy: [{ completedAt: "asc" }, { remindAt: "asc" }] }
      }
    });

    await notifyLeadAssignment({
      workspaceId: workspace.id,
      leadId: lead.id,
      leadName: lead.name,
      companyName: lead.companyRecord?.name || lead.company || null,
      assignedUsers,
      actorUserId: user.id,
      actorName: user.fullName
    });

    revalidateCrmDataPaths(
      lead.companyId ? `/companies/${lead.companyId}` : "",
      lead.contactId ? `/contacts/${lead.contactId}` : ""
    );

    return Response.json(serializeLead(lead), { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid lead payload", issues: error.issues }, { status: 400 });
    }

    return Response.json({ error: error instanceof Error ? error.message : "Unable to create lead" }, { status: 500 });
  }
}

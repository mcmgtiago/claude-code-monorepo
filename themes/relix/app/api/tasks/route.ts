import { TaskPriority, TaskStatus } from "@prisma/client";
import { z } from "zod";
import { revalidateCrmDataPaths } from "@/lib/crm-revalidation";
import { getPreferredWorkspaceSenderUserId, sendTrackedEmail } from "@/lib/email";
import { buildTaskAssignmentEmail } from "@/lib/email-html";
import { canControlLead, LEAD_CONTROL_DENIED_MESSAGE } from "@/lib/lead-permissions";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceContext } from "@/lib/workspace";

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  taskType: z.string().min(1),
  priority: z.nativeEnum(TaskPriority),
  ownerName: z.string().min(1).optional(),
  ownerEmail: z.string().email().optional().or(z.literal("")),
  associateName: z.string().optional(),
  associateEmail: z.string().email().optional().or(z.literal("")),
  associateCompany: z.string().optional(),
  dueDate: z.string().datetime().optional().or(z.literal("")),
  status: z.nativeEnum(TaskStatus).optional(),
  leadId: z.string().optional().or(z.literal("")),
  contactId: z.string().optional().or(z.literal("")),
  companyId: z.string().optional().or(z.literal(""))
});

async function resolveWorkspaceCompany(companyId: string | undefined, workspaceId: string) {
  if (!companyId) {
    return null;
  }

  const company = await prisma.company.findFirst({
    where: { id: companyId, workspaceId },
    select: { id: true }
  });

  if (!company) {
    throw new Error("Selected company was not found");
  }

  return company.id;
}

async function resolveWorkspaceLead(leadId: string | undefined, workspaceId: string) {
  if (!leadId) {
    return null;
  }

  const lead = await prisma.lead.findFirst({
    where: { id: leadId, workspaceId },
    select: { id: true, assignedUsersJson: true }
  });

  if (!lead) {
    throw new Error("Selected lead was not found");
  }

  return lead;
}

async function hydrateAssociation(payload: z.infer<typeof taskSchema>) {
  const { workspace } = await requireWorkspaceContext();
  const companyId = await resolveWorkspaceCompany(payload.companyId, workspace.id);

  if (!payload.contactId) {
    return {
      contactId: null,
      companyId,
      associateName: payload.associateName || payload.associateEmail || null,
      associateEmail: payload.associateEmail || null,
      associateCompany: payload.associateCompany || null
    };
  }

  const contact = await prisma.contact.findUnique({
    where: { id: payload.contactId },
    include: { company: true }
  });

  if (!contact || contact.workspaceId !== workspace.id) {
    throw new Error("Selected contact was not found");
  }

  return {
    contactId: contact.id,
    companyId: companyId || contact.companyId || null,
    associateName: payload.associateName || contact.fullName,
    associateEmail: payload.associateEmail || contact.email || null,
    associateCompany: payload.associateCompany || contact.company?.name || null
  };
}

export async function GET() {
  const { workspace } = await requireWorkspaceContext();
  const tasks = await prisma.task.findMany({
    where: { workspaceId: workspace.id },
    include: {
      lead: {
        include: {
          companyRecord: { select: { id: true, name: true, logoUrl: true } }
        }
      },
      contact: {
        include: {
          company: true
        }
      },
      company: true
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }]
  });

  return Response.json(tasks);
}

export async function POST(request: Request) {
  const { user: currentUser, workspace } = await requireWorkspaceContext();

  try {
    const raw = await request.json();
    const payload = taskSchema.parse(raw);
    const association = await hydrateAssociation(payload);
    const lead = await resolveWorkspaceLead(payload.leadId, workspace.id);

    if (lead && !canControlLead(currentUser, workspace, { assignedUsersJson: lead.assignedUsersJson })) {
      return Response.json({ error: LEAD_CONTROL_DENIED_MESSAGE }, { status: 403 });
    }

    const task = await prisma.task.create({
      data: {
        workspaceId: workspace.id,
        title: payload.title,
        description: payload.description || null,
        taskType: payload.taskType,
        priority: payload.priority,
        ownerName: payload.ownerName || currentUser.fullName,
        ownerEmail: payload.ownerEmail || currentUser.email,
        dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
        status: payload.status || TaskStatus.TODO,
        leadId: lead?.id || null,
        ...association
      },
      include: {
        lead: {
          include: {
            companyRecord: { select: { id: true, name: true, logoUrl: true } }
          }
        },
        contact: {
          include: {
            company: true
          }
        },
        company: true
      }
    });

    // Send assignment email to the task owner
    try {
      const senderUserId = await getPreferredWorkspaceSenderUserId(workspace.id);
      const recipientEmail = task.ownerEmail;
      if (senderUserId && recipientEmail) {
        const dueDateStr = task.dueDate
          ? new Date(task.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
          : null;
        await sendTrackedEmail({
          userId: senderUserId,
          workspaceId: workspace.id,
          to: recipientEmail,
          subject: `Task assigned: ${task.title}`,
          html: buildTaskAssignmentEmail({
            recipientName: task.ownerName,
            taskTitle: task.title,
            taskType: task.taskType,
            priority: task.priority,
            assignedBy: currentUser.fullName,
            dueDate: dueDateStr,
            associateName: task.associateName ?? null,
            associateCompany: task.associateCompany ?? null
          })
        });
      }
    } catch {
      // Email failure should not block task creation
    }

    revalidateCrmDataPaths();

    return Response.json(task, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid task payload", issues: error.issues }, { status: 400 });
    }

    return Response.json({ error: error instanceof Error ? error.message : "Unable to create task" }, { status: 500 });
  }
}

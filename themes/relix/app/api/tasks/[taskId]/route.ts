import { TaskPriority, TaskStatus } from "@prisma/client";
import { z } from "zod";
import { revalidateCrmDataPaths } from "@/lib/crm-revalidation";
import { getPreferredWorkspaceSenderUserId, sendTrackedEmail } from "@/lib/email";
import { buildTaskStatusChangeEmail } from "@/lib/email-html";
import { prisma } from "@/lib/prisma";
import { archiveTask } from "@/lib/trash";
import { requireWorkspaceContext } from "@/lib/workspace";

const taskUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  taskType: z.string().min(1).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
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
  if (companyId === undefined) {
    return undefined;
  }

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
  if (leadId === undefined) {
    return undefined;
  }

  if (!leadId) {
    return null;
  }

  const lead = await prisma.lead.findFirst({
    where: { id: leadId, workspaceId },
    select: { id: true }
  });

  if (!lead) {
    throw new Error("Selected lead was not found");
  }

  return lead.id;
}

async function hydrateAssociation(payload: z.infer<typeof taskUpdateSchema>, companyId: string | null | undefined) {
  const { workspace } = await requireWorkspaceContext();

  if (payload.contactId === undefined) {
    return {};
  }

  if (!payload.contactId) {
    return {
      contactId: null,
      companyId,
      associateName: payload.associateName === undefined ? (payload.associateEmail === undefined ? undefined : payload.associateEmail || null) : payload.associateName || null,
      associateEmail: payload.associateEmail === undefined ? undefined : payload.associateEmail || null,
      associateCompany: payload.associateCompany === undefined ? undefined : payload.associateCompany || null
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

export async function PATCH(request: Request, context: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await context.params;
  const { user: currentUser, workspace } = await requireWorkspaceContext();

  try {
    const raw = await request.json();
    const payload = taskUpdateSchema.parse(raw);
    const companyId = await resolveWorkspaceCompany(payload.companyId, workspace.id);
    const association = await hydrateAssociation(payload, companyId);
    const leadId = await resolveWorkspaceLead(payload.leadId, workspace.id);

    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, workspaceId: workspace.id },
      select: { id: true, status: true, title: true, ownerEmail: true, ownerName: true }
    });

    if (!existingTask) {
      return Response.json({ error: "Task not found" }, { status: 404 });
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(payload.title !== undefined ? { title: payload.title } : {}),
        ...(payload.description !== undefined ? { description: payload.description || null } : {}),
        ...(payload.taskType !== undefined ? { taskType: payload.taskType } : {}),
        ...(payload.priority !== undefined ? { priority: payload.priority } : {}),
        ...(payload.ownerName !== undefined ? { ownerName: payload.ownerName } : {}),
        ...(payload.ownerEmail !== undefined ? { ownerEmail: payload.ownerEmail || currentUser.email } : {}),
        ...(payload.dueDate !== undefined ? { dueDate: payload.dueDate ? new Date(payload.dueDate) : null } : {}),
        ...(payload.status !== undefined ? { status: payload.status } : {}),
        ...(leadId !== undefined ? { leadId } : {}),
        ...(payload.contactId !== undefined ? association : {}),
        ...(companyId !== undefined && payload.contactId === undefined ? { companyId } : {}),
        ...(payload.associateName !== undefined && payload.contactId === undefined ? { associateName: payload.associateName || null } : {}),
        ...(payload.associateEmail !== undefined && payload.contactId === undefined ? { associateEmail: payload.associateEmail || null } : {}),
        ...(payload.associateCompany !== undefined && payload.contactId === undefined ? { associateCompany: payload.associateCompany || null } : {})
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

    // Send email if status changed
    if (payload.status && payload.status !== existingTask.status) {
      try {
        const senderUserId = await getPreferredWorkspaceSenderUserId(workspace.id);
        const recipientEmail = payload.ownerEmail || existingTask.ownerEmail;
        const recipientName = payload.ownerName || existingTask.ownerName;
        const taskTitle = payload.title || existingTask.title;
        const statusLabels: Record<string, string> = { TODO: "To Do", IN_PROGRESS: "In Progress", DONE: "Done" };
        const newStatusLabel = statusLabels[payload.status] ?? payload.status;

        if (senderUserId && recipientEmail) {
          await sendTrackedEmail({
            userId: senderUserId,
            workspaceId: workspace.id,
            to: recipientEmail,
            subject: `Task status updated: ${taskTitle}`,
            html: buildTaskStatusChangeEmail({
              recipientName,
              taskTitle,
              newStatus: newStatusLabel,
              updatedBy: currentUser.fullName
            })
          });
        }
      } catch {
        // Email failure should not block the update
      }
    }

    revalidateCrmDataPaths();

    return Response.json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid task update payload", issues: error.issues }, { status: 400 });
    }

    return Response.json({ error: error instanceof Error ? error.message : "Unable to update task" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ taskId: string }> }) {
  const { workspace } = await requireWorkspaceContext();
  const { taskId } = await context.params;

  try {
    const task = await prisma.task.findFirst({
      where: { id: taskId, workspaceId: workspace.id },
      select: { id: true }
    });

    if (!task) {
      return Response.json({ error: "Task not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await archiveTask(tx, taskId);
      await tx.task.delete({ where: { id: taskId } });
    });
    revalidateCrmDataPaths();
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to delete task" }, { status: 500 });
  }
}

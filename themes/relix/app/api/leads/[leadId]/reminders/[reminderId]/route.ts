import { z } from "zod";
import { canControlLead, LEAD_CONTROL_DENIED_MESSAGE } from "@/lib/lead-permissions";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceContext } from "@/lib/workspace";

const updateReminderSchema = z.object({
  title: z.string().min(1).optional(),
  remindAt: z.string().datetime().optional(),
  completed: z.boolean().optional()
});

export async function PATCH(request: Request, context: { params: Promise<{ leadId: string; reminderId: string }> }) {
  const { leadId, reminderId } = await context.params;

  try {
    const { user, workspace } = await requireWorkspaceContext();
    const raw = await request.json();
    const payload = updateReminderSchema.parse(raw);
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

    const existing = await prisma.leadReminder.findFirst({
      where: {
        id: reminderId,
        leadId
      },
      select: { id: true }
    });

    if (!existing) {
      return Response.json({ error: "Reminder not found" }, { status: 404 });
    }

    const reminder = await prisma.leadReminder.update({
      where: { id: reminderId },
      data: {
        ...(payload.title !== undefined ? { title: payload.title.trim() } : {}),
        ...(payload.remindAt !== undefined ? { remindAt: new Date(payload.remindAt) } : {}),
        ...(payload.completed !== undefined ? { completedAt: payload.completed ? new Date() : null } : {})
      }
    });

    return Response.json(reminder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid reminder update payload", issues: error.issues }, { status: 400 });
    }

    return Response.json({ error: error instanceof Error ? error.message : "Unable to update reminder" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ leadId: string; reminderId: string }> }) {
  const { leadId, reminderId } = await context.params;

  try {
    const { user, workspace } = await requireWorkspaceContext();
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

    const existing = await prisma.leadReminder.findFirst({
      where: {
        id: reminderId,
        leadId
      },
      select: { id: true }
    });

    if (!existing) {
      return Response.json({ error: "Reminder not found" }, { status: 404 });
    }

    await prisma.leadReminder.delete({
      where: { id: reminderId }
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to delete reminder" }, { status: 500 });
  }
}

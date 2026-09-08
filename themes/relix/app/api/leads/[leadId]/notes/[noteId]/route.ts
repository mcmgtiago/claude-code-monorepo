import { canControlLead, LEAD_CONTROL_DENIED_MESSAGE } from "@/lib/lead-permissions";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceContext } from "@/lib/workspace";

export async function DELETE(_request: Request, context: { params: Promise<{ leadId: string; noteId: string }> }) {
  const { leadId, noteId } = await context.params;

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

    await prisma.note.delete({
      where: {
        id: noteId,
        leadId
      }
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: "Unable to delete note" }, { status: 500 });
  }
}

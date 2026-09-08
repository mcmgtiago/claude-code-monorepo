import { z } from "zod";
import { canControlLead, LEAD_CONTROL_DENIED_MESSAGE } from "@/lib/lead-permissions";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceContext } from "@/lib/workspace";

const postSchema = z.object({
  body: z.string().min(1)
});

export async function POST(request: Request, context: { params: Promise<{ leadId: string }> }) {
  const { leadId } = await context.params;

  try {
    const { user, workspace } = await requireWorkspaceContext();
    const raw = await request.json();
    const payload = postSchema.parse(raw);
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

    const note = await prisma.note.create({
      data: {
        leadId,
        body: payload.body
      }
    });

    return Response.json(note, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid note payload", issues: error.issues }, { status: 400 });
    }
    return Response.json({ error: error instanceof Error ? error.message : "Unable to add note" }, { status: 500 });
  }
}

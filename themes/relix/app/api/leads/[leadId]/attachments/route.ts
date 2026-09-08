import { NextResponse } from "next/server";
import { canControlLead, LEAD_CONTROL_DENIED_MESSAGE } from "@/lib/lead-permissions";
import { parseLeadAttachments, saveLeadAttachment, serializeLeadAttachments } from "@/lib/lead-attachments";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceContext } from "@/lib/workspace";

export async function POST(request: Request, context: { params: Promise<{ leadId: string }> }) {
  const { leadId } = await context.params;

  try {
    const { user, workspace } = await requireWorkspaceContext();
    const formData = await request.formData();
    const files = formData.getAll("files").filter((value): value is File => value instanceof File);

    if (!files.length) {
      return NextResponse.json({ error: "No files received." }, { status: 400 });
    }

    const lead = await prisma.lead.findFirst({
      where: { id: leadId, workspaceId: workspace.id },
      select: {
        id: true,
        assignedUsersJson: true,
        attachmentsJson: true
      }
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    if (!canControlLead(user, workspace, { assignedUsersJson: lead.assignedUsersJson })) {
      return NextResponse.json({ error: LEAD_CONTROL_DENIED_MESSAGE }, { status: 403 });
    }

    const existingAttachments = parseLeadAttachments(lead.attachmentsJson);
    const uploadedAttachments = [];

    for (const file of files) {
      uploadedAttachments.push(await saveLeadAttachment(leadId, file));
    }

    const nextAttachments = [...existingAttachments, ...uploadedAttachments];

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        attachmentsCount: nextAttachments.length,
        attachmentsJson: serializeLeadAttachments(nextAttachments)
      }
    });

    return NextResponse.json({ attachments: nextAttachments });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to upload attachment." }, { status: 500 });
  }
}

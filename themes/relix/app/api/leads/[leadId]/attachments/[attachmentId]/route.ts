import { NextResponse } from "next/server";
import { canControlLead, LEAD_CONTROL_DENIED_MESSAGE } from "@/lib/lead-permissions";
import { parseLeadAttachments, readLeadAttachmentFile, removeLeadAttachmentFile, serializeLeadAttachments } from "@/lib/lead-attachments";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceContext } from "@/lib/workspace";

export async function GET(_request: Request, context: { params: Promise<{ leadId: string; attachmentId: string }> }) {
  const { leadId, attachmentId } = await context.params;
  const { workspace } = await requireWorkspaceContext();

  const lead = await prisma.lead.findFirst({
    where: { id: leadId, workspaceId: workspace.id },
    select: { attachmentsJson: true }
  });

  if (!lead) {
    return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  }

  const attachment = parseLeadAttachments(lead.attachmentsJson).find((item) => item.id === attachmentId);
  if (!attachment || !attachment.storageKey) {
    return NextResponse.json({ error: "Attachment not found." }, { status: 404 });
  }

  let fileBuffer: Buffer;

  try {
    fileBuffer = await readLeadAttachmentFile(leadId, attachmentId, attachment.storageKey);
  } catch {
    return NextResponse.json({ error: "Attachment file is missing." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(fileBuffer), {
    headers: {
      "content-type": attachment.mimeType || "application/octet-stream",
      "content-disposition": `attachment; filename="${attachment.fileName}"`
    }
  });
}

export async function DELETE(_request: Request, context: { params: Promise<{ leadId: string; attachmentId: string }> }) {
  const { leadId, attachmentId } = await context.params;
  const { user, workspace } = await requireWorkspaceContext();

  const lead = await prisma.lead.findFirst({
    where: { id: leadId, workspaceId: workspace.id },
    select: {
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

  const attachments = parseLeadAttachments(lead.attachmentsJson);
  const attachment = attachments.find((item) => item.id === attachmentId);

  if (!attachment) {
    return NextResponse.json({ error: "Attachment not found." }, { status: 404 });
  }

  await removeLeadAttachmentFile(leadId, attachmentId, attachment.storageKey);

  const nextAttachments = attachments.filter((item) => item.id !== attachmentId);

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      attachmentsCount: nextAttachments.length,
      attachmentsJson: nextAttachments.length ? serializeLeadAttachments(nextAttachments) : null
    }
  });

  return NextResponse.json({ attachments: nextAttachments });
}

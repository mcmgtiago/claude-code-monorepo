import { z } from "zod";
import { splitEmailList } from "@/lib/email-threading";
import { requireWorkspaceContextForAnyRole } from "@/lib/workspace";
import { sendTrackedEmail, type EmailAttachmentInput } from "@/lib/email";

const emailAddressSchema = z.string().email();

function hasValidRecipientList(value: string, options: { required: boolean }) {
  const recipients = splitEmailList(value);

  if (!recipients.length) {
    return !options.required;
  }

  return recipients.every((recipient) => emailAddressSchema.safeParse(recipient).success);
}

const emailSchema = z.object({
  to: z.string().refine((value) => hasValidRecipientList(value, { required: true }), "Enter at least one valid recipient."),
  cc: z.string().optional().default("").refine((value) => hasValidRecipientList(value, { required: false }), "Enter valid CC recipients."),
  bcc: z.string().optional().default("").refine((value) => hasValidRecipientList(value, { required: false }), "Enter valid BCC recipients."),
  subject: z.string().min(1),
  message: z.string().min(1),
  html: z.string().optional(),
  threadId: z.string().min(1).optional()
});

async function parseRequest(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return {
      contentType,
      data: await request.json(),
      attachments: [] as EmailAttachmentInput[]
    };
  }

  const formData = await request.formData();
  const files = formData.getAll("files");
  const attachments: EmailAttachmentInput[] = [];

  for (const file of files) {
    if (!(file instanceof File)) {
      continue;
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    attachments.push({
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      size: file.size,
      content: buffer
    });
  }

  return {
    contentType,
    data: {
      to: String(formData.get("to") || ""),
      cc: String(formData.get("cc") || ""),
      bcc: String(formData.get("bcc") || ""),
      subject: String(formData.get("subject") || ""),
      message: String(formData.get("message") || ""),
      html: String(formData.get("html") || "") || undefined,
      threadId: String(formData.get("threadId") || "") || undefined
    },
    attachments
  };
}

export async function POST(request: Request) {
  try {
    const { user, workspace } = await requireWorkspaceContextForAnyRole();
    const { data, attachments } = await parseRequest(request);
    const payload = emailSchema.parse(data);

    const result = await sendTrackedEmail({
      userId: user.id,
      workspaceId: workspace.id,
      to: payload.to,
      cc: payload.cc,
      bcc: payload.bcc,
      subject: payload.subject,
      text: payload.message,
      html:
        payload.html ||
        `<div style="font-family:Avenir Next,Segoe UI,Helvetica Neue,Arial,sans-serif;line-height:1.7">${payload.message.replace(/\n/g, "<br/>")}</div>`,
      threadId: payload.threadId,
      attachments,
      personalOnly: true
    });

    return Response.json({ ok: true, id: result.messageId, threadId: result.threadId });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid email payload", issues: error.issues }, { status: 400 });
    }

    return Response.json({ error: error instanceof Error ? error.message : "Unable to send email" }, { status: 500 });
  }
}

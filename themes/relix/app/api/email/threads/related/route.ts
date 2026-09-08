import { z } from "zod";
import {
  getContactEmailContext,
  getCrmRecordsForParticipantEmails,
  getDirectEmailContext,
  getEmailThreadsForParticipantEmails,
  getLeadEmailContext,
  getThreadEmailContext
} from "@/lib/email-crm-links";
import { requireWorkspaceContextForAnyRole } from "@/lib/workspace";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  leadId: z.string().min(1).optional(),
  contactId: z.string().min(1).optional(),
  threadId: z.string().min(1).optional(),
  email: z.string().email().optional(),
  includeThreads: z.enum(["true", "false"]).optional()
});

export async function GET(request: Request) {
  try {
    const { user, workspace } = await requireWorkspaceContextForAnyRole();
    const url = new URL(request.url);
    const payload = querySchema.parse({
      leadId: url.searchParams.get("leadId") || undefined,
      contactId: url.searchParams.get("contactId") || undefined,
      threadId: url.searchParams.get("threadId") || undefined,
      email: url.searchParams.get("email") || undefined,
      includeThreads: url.searchParams.get("includeThreads") || undefined
    });

    const context =
      (payload.leadId
        ? await getLeadEmailContext({ workspaceId: workspace.id, leadId: payload.leadId })
        : null) ||
      (payload.contactId
        ? await getContactEmailContext({ workspaceId: workspace.id, contactId: payload.contactId })
        : null) ||
      (payload.threadId
        ? await getThreadEmailContext({ workspaceId: workspace.id, mailboxUserId: user.id, threadId: payload.threadId })
        : null) ||
      (payload.email ? getDirectEmailContext(payload.email) : null);

    if (!context) {
      return Response.json({ error: "No related email context found." }, { status: 404 });
    }

    const { contacts, leads } = await getCrmRecordsForParticipantEmails({
      workspaceId: workspace.id,
      participantEmails: context.participantEmails
    });

    const includeThreads = payload.includeThreads !== "false";
    const threads = includeThreads
      ? await getEmailThreadsForParticipantEmails({
          workspaceId: workspace.id,
          mailboxUserId: user.id,
          participantEmails: context.participantEmails
        })
      : [];

    return Response.json({
      context,
      contacts,
      leads,
      threads
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid related email query.", issues: error.issues }, { status: 400 });
    }

    return Response.json({ error: error instanceof Error ? error.message : "Unable to load related email records." }, { status: 500 });
  }
}

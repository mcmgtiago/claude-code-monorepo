import { emailWorkspaceThreadSelect } from "@/lib/email-workspace";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceContextForAnyRole } from "@/lib/workspace";
import { repairEmailThreadBodies } from "@/lib/imap";

export async function GET(_request: Request, context: { params: Promise<{ threadId: string }> }) {
  const { user, workspace } = await requireWorkspaceContextForAnyRole();
  const { threadId } = await context.params;

  const thread = await prisma.emailThread.findFirst({
    where: { id: threadId, workspaceId: workspace.id, mailboxUserId: user.id },
    select: emailWorkspaceThreadSelect
  });

  if (!thread) {
    return Response.json({ error: "Thread not found" }, { status: 404 });
  }

  return Response.json(thread);
}

export async function POST(_request: Request, context: { params: Promise<{ threadId: string }> }) {
  try {
    const { user, workspace } = await requireWorkspaceContextForAnyRole();
    const { threadId } = await context.params;

    const thread = await prisma.emailThread.findFirst({
      where: { id: threadId, workspaceId: workspace.id, mailboxUserId: user.id },
      select: { id: true }
    });

    if (!thread) {
      return Response.json({ error: "Thread not found" }, { status: 404 });
    }

    const result = await repairEmailThreadBodies({
      userId: user.id,
      workspaceId: workspace.id,
      threadId
    });

    return Response.json({ ok: true, ...result });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to repair email thread" }, { status: 500 });
  }
}

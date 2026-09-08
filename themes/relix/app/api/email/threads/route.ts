import { unstable_noStore } from "next/cache";
import { z } from "zod";
import { emailWorkspaceThreadListSelect } from "@/lib/email-workspace";
import { syncRemoteThreadReadState } from "@/lib/imap";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceContextForAnyRole } from "@/lib/workspace";

export const dynamic = "force-dynamic";

const emailThreadIdsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1)
});

const emailThreadActionSchema = emailThreadIdsSchema.extend({
  action: z.enum(["trash", "restore", "star", "unstar", "markRead", "markUnread"])
});

export async function GET() {
  unstable_noStore();
  try {
    const { user, workspace } = await requireWorkspaceContextForAnyRole();

    const threads = await prisma.emailThread.findMany({
      where: {
        workspaceId: workspace.id,
        mailboxUserId: user.id
      },
      select: emailWorkspaceThreadListSelect,
      orderBy: { lastMessageAt: "desc" }
    });

    return Response.json(threads);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load email threads" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  unstable_noStore();
  try {
    const { user, workspace } = await requireWorkspaceContextForAnyRole();
    const raw = await request.json();
    const payload = emailThreadActionSchema.parse(raw);
    const now = new Date();
    const authorizedThreads = await prisma.emailThread.findMany({
      where: { id: { in: payload.ids }, workspaceId: workspace.id, mailboxUserId: user.id },
      select: { id: true }
    });
    const authorizedThreadIds = authorizedThreads.map((thread) => thread.id);

    if (!authorizedThreadIds.length) {
      return Response.json({ ok: true, action: payload.action, count: 0 });
    }

    if (payload.action === "trash") {
      await prisma.emailThread.updateMany({
        where: { id: { in: authorizedThreadIds }, workspaceId: workspace.id, mailboxUserId: user.id },
        data: { trashedAt: now }
      } as never);
    } else if (payload.action === "restore") {
      await prisma.emailThread.updateMany({
        where: { id: { in: authorizedThreadIds }, workspaceId: workspace.id, mailboxUserId: user.id },
        data: { trashedAt: null }
      } as never);
    } else if (payload.action === "star") {
      await prisma.emailThread.updateMany({
        where: { id: { in: authorizedThreadIds }, workspaceId: workspace.id, mailboxUserId: user.id },
        data: { starredAt: now }
      } as never);
    } else if (payload.action === "markRead") {
      await prisma.emailMessage.updateMany({
        where: {
          threadId: { in: authorizedThreadIds },
          direction: "inbound",
          readAt: null
        },
        data: { readAt: now, workspaceId: workspace.id, mailboxUserId: user.id }
      });

      await syncRemoteThreadReadState({
        userId: user.id,
        workspaceId: workspace.id,
        threadIds: authorizedThreadIds,
        shouldMarkRead: true
      }).catch((error) => {
        console.error("Unable to sync remote read state", error);
      });
    } else if (payload.action === "markUnread") {
      await syncRemoteThreadReadState({
        userId: user.id,
        workspaceId: workspace.id,
        threadIds: authorizedThreadIds,
        shouldMarkRead: false
      });

      await prisma.emailMessage.updateMany({
        where: {
          threadId: { in: authorizedThreadIds },
          direction: "inbound"
        },
        data: { readAt: null, workspaceId: workspace.id, mailboxUserId: user.id }
      });
    } else {
      await prisma.emailThread.updateMany({
        where: { id: { in: authorizedThreadIds }, workspaceId: workspace.id, mailboxUserId: user.id },
        data: { starredAt: null }
      } as never);
    }

    return Response.json({ ok: true, action: payload.action, count: authorizedThreadIds.length });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid email thread action", issues: error.issues }, { status: 400 });
    }

    return Response.json({ error: error instanceof Error ? error.message : "Unable to update email threads" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { user, workspace } = await requireWorkspaceContextForAnyRole();
    const raw = await request.json();
    const payload = emailThreadIdsSchema.parse(raw);

    await prisma.$transaction(async (tx) => {
      await tx.emailMessage.deleteMany({
        where: { threadId: { in: payload.ids }, workspaceId: workspace.id, mailboxUserId: user.id }
      });

      await tx.emailThread.deleteMany({
        where: { id: { in: payload.ids }, workspaceId: workspace.id, mailboxUserId: user.id }
      });
    });

    return Response.json({ ok: true, count: payload.ids.length });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid email thread delete request", issues: error.issues }, { status: 400 });
    }

    return Response.json({ error: error instanceof Error ? error.message : "Unable to delete email threads" }, { status: 500 });
  }
}

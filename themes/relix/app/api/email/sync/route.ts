import { hasAnyPersonalMailboxSyncConnection } from "@/lib/mailbox-maintenance";
import { requireWorkspaceContextForAnyRole } from "@/lib/workspace";
import { syncRecentInbox } from "@/lib/imap";

export async function POST(request: Request) {
  try {
    const { user, workspace } = await requireWorkspaceContextForAnyRole();

    if (!(await hasAnyPersonalMailboxSyncConnection(user.id))) {
      return Response.json({ ok: true, skipped: true, synced: 0, repaired: 0 });
    }

    const result = await syncRecentInbox({ userId: user.id, workspaceId: workspace.id });
    return Response.json({ ok: true, ...result });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to sync inbox" }, { status: 500 });
  }
}

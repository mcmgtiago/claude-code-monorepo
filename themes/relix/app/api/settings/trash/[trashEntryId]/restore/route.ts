import { requireWorkspaceContext } from "@/lib/workspace";
import { restoreTrashEntry } from "@/lib/trash";

export async function POST(_request: Request, context: { params: Promise<{ trashEntryId: string }> }) {
  const { workspace } = await requireWorkspaceContext();
  const { trashEntryId } = await context.params;

  try {
    const restored = await restoreTrashEntry(trashEntryId, workspace.id);
    return Response.json({ ok: true, restored });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to restore trash item" }, { status: 500 });
  }
}

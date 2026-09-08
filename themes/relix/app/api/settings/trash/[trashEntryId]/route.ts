import { requireWorkspaceContext } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: Request, context: { params: Promise<{ trashEntryId: string }> }) {
  const { workspace } = await requireWorkspaceContext();
  const { trashEntryId } = await context.params;

  try {
    const entry = await prisma.trashEntry.findUnique({
      where: { id: trashEntryId },
      select: { id: true, workspaceId: true }
    });

    if (!entry || (entry.workspaceId && entry.workspaceId !== workspace.id)) {
      return Response.json({ error: "Trash item not found" }, { status: 404 });
    }

    await prisma.trashEntry.delete({ where: { id: trashEntryId } });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to permanently delete trash item" }, { status: 500 });
  }
}

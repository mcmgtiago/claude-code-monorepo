import { requireWorkspaceContext } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { workspace } = await requireWorkspaceContext();

  const items = await prisma.trashEntry.findMany({
    where: {
      OR: [
        { workspaceId: workspace.id },
        { workspaceId: null }
      ]
    },
    orderBy: { deletedAt: "desc" }
  });

  return Response.json(items);
}

export async function DELETE() {
  const { workspace } = await requireWorkspaceContext();

  try {
    const result = await prisma.trashEntry.deleteMany({
      where: {
        OR: [
          { workspaceId: workspace.id },
          { workspaceId: null }
        ]
      }
    });

    return Response.json({ ok: true, count: result.count });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to permanently delete trash items" },
      { status: 500 }
    );
  }
}

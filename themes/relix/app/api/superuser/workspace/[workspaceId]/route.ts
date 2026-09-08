import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { canAccessSuperuser } from "@/lib/team";

export async function DELETE(_: Request, context: { params: Promise<{ workspaceId: string }> }) {
  try {
    const currentUser = await requireUser();

    if (!canAccessSuperuser(currentUser.accessRole)) {
      return NextResponse.json({ error: "Only the superuser can access this control plane." }, { status: 403 });
    }

    const { workspaceId } = await context.params;

    if (currentUser.workspaceId === workspaceId) {
      return NextResponse.json({ error: "Move your own account to another workspace before deleting this one." }, { status: 400 });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true, name: true }
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.user.updateMany({
        where: { workspaceId },
        data: {
          workspaceId: null,
          workspaceName: null,
          onboardingCompleted: false,
          onboardingCompletedAt: null
        }
      }),
      prisma.workspace.delete({
        where: { id: workspaceId }
      })
    ]);

    return NextResponse.json({ success: true, workspaceId, workspaceName: workspace.name });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete workspace" }, { status: 500 });
  }
}

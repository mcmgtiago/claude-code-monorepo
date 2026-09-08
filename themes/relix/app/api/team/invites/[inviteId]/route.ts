import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canInviteTeamRole, canManageTeam, isWorkspaceOwner } from "@/lib/team";
import { requireWorkspaceContext } from "@/lib/workspace";

export async function DELETE(_: Request, context: { params: Promise<{ inviteId: string }> }) {
  const { user: currentUser, workspace } = await requireWorkspaceContext();
  const currentUserIsWorkspaceOwner = isWorkspaceOwner(currentUser.id, workspace.createdById);

  if (!canManageTeam(currentUser.accessRole)) {
    return NextResponse.json({ error: "You do not have permission to manage the team." }, { status: 403 });
  }

  const { inviteId } = await context.params;
  const invite = await prisma.teamInvite.findFirst({
    where: { id: inviteId, workspaceId: workspace.id, status: "PENDING" },
    select: { id: true, accessRole: true }
  });

  if (!invite) {
    return NextResponse.json({ error: "Invite not found." }, { status: 404 });
  }

  if (
    !canInviteTeamRole(
      {
        id: currentUser.id,
        accessRole: currentUser.accessRole,
        isWorkspaceOwner: currentUserIsWorkspaceOwner
      },
      invite.accessRole
    )
  ) {
    return NextResponse.json({ error: "You do not have permission to revoke this invite." }, { status: 403 });
  }

  const result = await prisma.teamInvite.updateMany({
    where: { id: invite.id, workspaceId: workspace.id },
    data: { status: "REVOKED" }
  });

  return NextResponse.json({ success: true });
}

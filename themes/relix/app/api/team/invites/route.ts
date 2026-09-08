import { z } from "zod";
import { NextResponse } from "next/server";
import { canInviteTeamRole, canManageTeam, isWorkspaceOwner } from "@/lib/team";
import { createOrRefreshTeamInvite } from "@/lib/team-invites";
import { requireWorkspaceContext } from "@/lib/workspace";

const createInviteSchema = z.object({
  email: z.string().email(),
  fullName: z.string().trim().optional().default(""),
  accessRole: z.enum(["ADMIN", "MANAGER", "MEMBER"])
});

export async function POST(request: Request) {
  try {
    const { user: currentUser, workspace } = await requireWorkspaceContext();
    const currentUserIsWorkspaceOwner = isWorkspaceOwner(currentUser.id, workspace.createdById);

    if (!canManageTeam(currentUser.accessRole)) {
      return NextResponse.json({ error: "You do not have permission to manage the team." }, { status: 403 });
    }

    const raw = await request.json();
    const payload = createInviteSchema.parse(raw);
    const email = payload.email.trim().toLowerCase();

    if (
      !canInviteTeamRole(
        {
          id: currentUser.id,
          accessRole: currentUser.accessRole,
          isWorkspaceOwner: currentUserIsWorkspaceOwner
        },
        payload.accessRole
      )
    ) {
      return NextResponse.json({ error: "You do not have permission to invite that role." }, { status: 403 });
    }

    const { invite, previewUrl, warning } = await createOrRefreshTeamInvite({
      workspaceId: workspace.id,
      email,
      fullName: payload.fullName,
      accessRole: payload.accessRole,
      invitedById: currentUser.id,
      invitedByName: currentUser.fullName,
      senderUserId: currentUser.id
    });

    return NextResponse.json({
      invite: {
        id: invite.id,
        email: invite.email,
        fullName: invite.fullName,
        accessRole: invite.accessRole,
        status: invite.status,
        createdAt: invite.createdAt,
        expiresAt: invite.expiresAt,
        invitedBy: {
          fullName: currentUser.fullName
        }
      },
      previewUrl,
      warning
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid invite payload", issues: error.issues }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Unable to invite member";
    const status = message.includes("already exists") || message.includes("already belongs") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

import { z } from "zod";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import { switchActiveWorkspace } from "@/lib/workspace-membership";

const switchWorkspaceSchema = z.object({
  workspaceId: z.string().min(1),
  inviteId: z.string().min(1).optional()
});

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = switchWorkspaceSchema.parse(await request.json());
    const workspace = await switchActiveWorkspace({
      userId: currentUser.id,
      email: currentUser.email,
      workspaceId: payload.workspaceId,
      inviteId: payload.inviteId
    });

    return NextResponse.json({
      workspace
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid workspace selection", issues: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to switch workspace" }, { status: 500 });
  }
}

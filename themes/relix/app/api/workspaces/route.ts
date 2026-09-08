import { z } from "zod";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-server";
import {
  createWorkspaceForUser,
  ensureLegacyActiveWorkspaceMembership,
  getWorkspaceChoicesForUser
} from "@/lib/workspace-membership";

const createWorkspaceSchema = z.object({
  workspaceName: z.string().min(2),
  companyWebsite: z.string().optional().default("")
});

function normalizeWebsite(input: string) {
  const value = input.trim();
  if (!value) {
    return null;
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `https://${value}`;
}

export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureLegacyActiveWorkspaceMembership(currentUser);

  const choices = await getWorkspaceChoicesForUser({
    userId: currentUser.id,
    email: currentUser.email,
    activeWorkspaceId: currentUser.workspaceId
  });

  return NextResponse.json(choices);
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = createWorkspaceSchema.parse(await request.json());
    const workspace = await createWorkspaceForUser({
      user: currentUser,
      workspaceName: payload.workspaceName,
      website: normalizeWebsite(payload.companyWebsite),
      activate: true
    });

    return NextResponse.json({
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid workspace payload", issues: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create workspace" }, { status: 500 });
  }
}

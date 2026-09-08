import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceContextForAnyRole, slugifyWorkspaceName } from "@/lib/workspace";

const workspaceSettingsSchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().optional().default(""),
  website: z.string().trim().optional().default("")
});

function normalizeWebsite(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

async function createUniqueWorkspaceSlug(baseName: string, currentWorkspaceId: string) {
  const baseSlug = slugifyWorkspaceName(baseName);
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.workspace.findUnique({
      where: { slug: candidate },
      select: { id: true }
    });

    if (!existing || existing.id === currentWorkspaceId) {
      return candidate;
    }

    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }
}

export async function GET() {
  try {
    const { workspace } = await requireWorkspaceContextForAnyRole();
    const workspaceProfile = await prisma.workspace.findUnique({
      where: { id: workspace.id },
      select: {
        id: true,
        name: true,
        slug: true,
        website: true
      }
    });

    if (!workspaceProfile) {
      return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
    }

    return NextResponse.json({
      id: workspaceProfile.id,
      name: workspaceProfile.name,
      slug: workspaceProfile.slug,
      website: workspaceProfile.website || ""
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load workspace settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { user, workspace } = await requireWorkspaceContextForAnyRole();

    if (workspace.createdById !== user.id) {
      return NextResponse.json({ error: "Only the workspace owner can update the workspace profile." }, { status: 403 });
    }

    const payload = workspaceSettingsSchema.parse(await request.json());
    const name = payload.name;
    const requestedSlug = payload.slug || name;
    const slug = await createUniqueWorkspaceSlug(requestedSlug, workspace.id);
    const website = normalizeWebsite(payload.website);

    const [updatedWorkspace] = await prisma.$transaction([
      prisma.workspace.update({
        where: { id: workspace.id },
        data: {
          name,
          slug,
          website
        },
        select: {
          id: true,
          name: true,
          slug: true,
          website: true
        }
      }),
      prisma.user.updateMany({
        where: { workspaceId: workspace.id },
        data: {
          workspaceName: name,
          companyWebsite: website
        }
      }),
      prisma.company.updateMany({
        where: {
          workspaceId: workspace.id,
          name: workspace.name
        },
        data: {
          name,
          website
        }
      })
    ]);

    return NextResponse.json({
      id: updatedWorkspace.id,
      name: updatedWorkspace.name,
      slug: updatedWorkspace.slug,
      website: updatedWorkspace.website || ""
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid workspace settings", issues: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update workspace settings" }, { status: 500 });
  }
}

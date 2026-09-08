import { z } from "zod";
import { isMeetingSlugAvailable } from "@/lib/meetings";
import { normalizeMeetingSlug } from "@/lib/meeting-booking";
import { prisma } from "@/lib/prisma";
import { archiveSchedulingPage } from "@/lib/trash";
import { requireWorkspaceContext } from "@/lib/workspace";

const schedulingPageUpdateSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  slug: z.string().trim().min(1).max(80).optional(),
  durationMinutes: z.number().int().positive().max(480).optional(),
  hostType: z.string().trim().min(1).max(80).optional(),
  active: z.boolean().optional(),
  hostName: z.string().trim().max(120).optional(),
  hostEmail: z.string().email().optional().or(z.literal(""))
});

export async function PATCH(request: Request, context: { params: Promise<{ pageId: string }> }) {
  const { user: currentUser, workspace } = await requireWorkspaceContext();
  const { pageId } = await context.params;

  try {
    const raw = await request.json();
    const payload = schedulingPageUpdateSchema.parse(raw);
    const normalizedSlug = payload.slug !== undefined ? normalizeMeetingSlug(payload.slug) : undefined;

    if (payload.slug !== undefined && !normalizedSlug) {
      return Response.json({ error: "Scheduling page slug is required." }, { status: 400 });
    }

    const existingPage = await prisma.schedulingPage.findFirst({
      where: { id: pageId, workspaceId: workspace.id },
      select: { id: true }
    });

    if (!existingPage) {
      return Response.json({ error: "Scheduling page not found." }, { status: 404 });
    }

    if (
      normalizedSlug !== undefined &&
      !(await isMeetingSlugAvailable(normalizedSlug, {
        excludeSchedulingPageId: pageId
      }))
    ) {
      return Response.json({ error: "That booking link is already in use. Choose another slug." }, { status: 409 });
    }

    const page = await prisma.schedulingPage.update({
      where: { id: pageId },
      data: {
        ...(payload.title !== undefined ? { title: payload.title } : {}),
        ...(normalizedSlug !== undefined ? { slug: normalizedSlug } : {}),
        ...(payload.durationMinutes !== undefined ? { durationMinutes: payload.durationMinutes } : {}),
        ...(payload.hostType !== undefined ? { hostType: payload.hostType } : {}),
        ...(payload.active !== undefined ? { active: payload.active } : {}),
        ...(payload.hostName !== undefined ? { hostName: payload.hostName } : {}),
        ...(payload.hostEmail !== undefined ? { hostEmail: payload.hostEmail || currentUser.email } : {})
      }
    });

    return Response.json(page);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid scheduling page update payload", issues: error.issues }, { status: 400 });
    }

    return Response.json({ error: error instanceof Error ? error.message : "Unable to update scheduling page" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ pageId: string }> }) {
  const { workspace } = await requireWorkspaceContext();
  const { pageId } = await context.params;

  try {
    const page = await prisma.schedulingPage.findFirst({
      where: { id: pageId, workspaceId: workspace.id },
      select: { id: true }
    });

    if (!page) {
      return Response.json({ error: "Scheduling page not found." }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await archiveSchedulingPage(tx, pageId);
      await tx.schedulingPage.delete({ where: { id: pageId } });
    });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to delete scheduling page" }, { status: 500 });
  }
}

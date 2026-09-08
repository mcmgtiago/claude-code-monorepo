import { z } from "zod";
import { ensureMeetingWorkspaceDefaults, isMeetingSlugAvailable } from "@/lib/meetings";
import { normalizeMeetingSlug } from "@/lib/meeting-booking";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceContext } from "@/lib/workspace";

const schedulingPageSchema = z.object({
  title: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(80),
  durationMinutes: z.number().int().positive().max(480),
  hostType: z.string().trim().min(1).max(80).optional(),
  active: z.boolean().optional(),
  hostName: z.string().trim().max(120).optional(),
  hostEmail: z.string().email().optional().or(z.literal(""))
});

export async function GET() {
  const { workspace } = await requireWorkspaceContext();
  await ensureMeetingWorkspaceDefaults(workspace.id);

  const pages = await prisma.schedulingPage.findMany({
    where: { workspaceId: workspace.id },
    orderBy: [{ active: "desc" }, { durationMinutes: "asc" }, { createdAt: "asc" }]
  });

  return Response.json(pages);
}

export async function POST(request: Request) {
  const { user: currentUser, workspace } = await requireWorkspaceContext();

  try {
    const raw = await request.json();
    const payload = schedulingPageSchema.parse(raw);
    const normalizedSlug = normalizeMeetingSlug(payload.slug);

    if (!normalizedSlug) {
      return Response.json({ error: "Scheduling page slug is required." }, { status: 400 });
    }

    if (!(await isMeetingSlugAvailable(normalizedSlug))) {
      return Response.json({ error: "That booking link is already in use. Choose another slug." }, { status: 409 });
    }

    const page = await prisma.schedulingPage.create({
      data: {
        workspaceId: workspace.id,
        title: payload.title,
        slug: normalizedSlug,
        durationMinutes: payload.durationMinutes,
        hostType: payload.hostType || "Single host",
        active: payload.active ?? true,
        hostName: payload.hostName || currentUser.fullName,
        hostEmail: payload.hostEmail || currentUser.email
      }
    });

    return Response.json(page, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid scheduling page payload", issues: error.issues }, { status: 400 });
    }

    return Response.json({ error: error instanceof Error ? error.message : "Unable to create scheduling page" }, { status: 500 });
  }
}

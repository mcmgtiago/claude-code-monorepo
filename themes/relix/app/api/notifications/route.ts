import { z } from "zod";
import { requireUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

const notificationsActionSchema = z.object({
  action: z.literal("mark_all_read")
});

export async function PATCH(request: Request) {
  const currentUser = await requireUser();

  try {
    const raw = await request.json();
    const payload = notificationsActionSchema.parse(raw);

    if (payload.action !== "mark_all_read") {
      return Response.json({ error: "Unsupported notification action" }, { status: 400 });
    }

    const readAt = new Date();
    const result = await prisma.appNotification.updateMany({
      where: {
        userId: currentUser.id,
        readAt: null
      },
      data: {
        readAt
      }
    });

    return Response.json({
      updatedCount: result.count,
      readAt: readAt.toISOString()
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid notification action", issues: error.issues }, { status: 400 });
    }

    return Response.json({ error: error instanceof Error ? error.message : "Unable to update notifications" }, { status: 500 });
  }
}

export async function DELETE() {
  const currentUser = await requireUser();

  try {
    const result = await prisma.appNotification.deleteMany({
      where: {
        userId: currentUser.id,
        readAt: {
          not: null
        }
      }
    });

    return Response.json({
      deletedCount: result.count
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to clear read notifications" }, { status: 500 });
  }
}

import { z } from "zod";
import { requireUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

const notificationUpdateSchema = z.object({
  read: z.boolean()
});

export async function PATCH(request: Request, context: { params: Promise<{ notificationId: string }> }) {
  const currentUser = await requireUser();
  const { notificationId } = await context.params;

  try {
    const raw = await request.json();
    const payload = notificationUpdateSchema.parse(raw);
    const readAt = payload.read ? new Date() : null;

    const result = await prisma.appNotification.updateMany({
      where: {
        id: notificationId,
        userId: currentUser.id
      },
      data: {
        readAt
      }
    });

    if (!result.count) {
      return Response.json({ error: "Notification not found" }, { status: 404 });
    }

    return Response.json({
      id: notificationId,
      readAt: readAt ? readAt.toISOString() : null
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid notification update", issues: error.issues }, { status: 400 });
    }

    return Response.json({ error: error instanceof Error ? error.message : "Unable to update notification" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ notificationId: string }> }) {
  const currentUser = await requireUser();
  const { notificationId } = await context.params;

  try {
    const result = await prisma.appNotification.deleteMany({
      where: {
        id: notificationId,
        userId: currentUser.id
      }
    });

    if (!result.count) {
      return Response.json({ error: "Notification not found" }, { status: 404 });
    }

    return Response.json({
      id: notificationId
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to delete notification" }, { status: 500 });
  }
}

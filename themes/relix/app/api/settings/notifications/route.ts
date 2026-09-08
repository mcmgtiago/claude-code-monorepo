import { z } from "zod";
import { getCurrentUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceContext } from "@/lib/workspace";

const notificationSettingsSchema = z.object({
  reminderInAppEnabled: z.boolean(),
  reminderEmailEnabled: z.boolean()
});

const defaultNotificationSettings = {
  reminderInAppEnabled: true,
  reminderEmailEnabled: true
};

function normalizeNotificationSettings(
  settings:
    | {
        reminderInAppEnabled: boolean | null;
        reminderEmailEnabled: boolean | null;
      }
    | null
) {
  return {
    reminderInAppEnabled: settings?.reminderInAppEnabled ?? defaultNotificationSettings.reminderInAppEnabled,
    reminderEmailEnabled: settings?.reminderEmailEnabled ?? defaultNotificationSettings.reminderEmailEnabled
  };
}

export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { workspace } = await requireWorkspaceContext();
    const settings = await prisma.workspaceSetting.findFirst({
      where: { workspaceId: workspace.id },
      select: {
        reminderInAppEnabled: true,
        reminderEmailEnabled: true
      }
    });

    return Response.json(normalizeNotificationSettings(settings));
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load notification settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { workspace } = await requireWorkspaceContext();
    const raw = await request.json();
    const payload = notificationSettingsSchema.parse(raw);

    const settings = await prisma.workspaceSetting.upsert({
      where: { workspaceId: workspace.id },
      update: {
        reminderInAppEnabled: payload.reminderInAppEnabled,
        reminderEmailEnabled: payload.reminderEmailEnabled
      },
      create: {
        workspaceId: workspace.id,
        reminderInAppEnabled: payload.reminderInAppEnabled,
        reminderEmailEnabled: payload.reminderEmailEnabled
      }
    });

    return Response.json(normalizeNotificationSettings(settings));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid notification settings", issues: error.issues }, { status: 400 });
    }

    return Response.json({ error: error instanceof Error ? error.message : "Unable to save notification settings" }, { status: 500 });
  }
}

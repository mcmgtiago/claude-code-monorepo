import { requireWorkspaceContext } from "@/lib/workspace";
import { processDueReminderNotificationsForUser } from "@/lib/reminder-notifications";
import { processDueTaskNotificationsForUser } from "@/lib/task-notifications";

export async function POST() {
  try {
    const { user, workspace } = await requireWorkspaceContext();
    const [reminders, tasks] = await Promise.all([
      processDueReminderNotificationsForUser({
        userId: user.id,
        workspaceId: workspace.id
      }),
      processDueTaskNotificationsForUser({
        userId: user.id,
        workspaceId: workspace.id
      })
    ]);

    return Response.json({
      reminders,
      tasks
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to process reminder notifications" }, { status: 500 });
  }
}

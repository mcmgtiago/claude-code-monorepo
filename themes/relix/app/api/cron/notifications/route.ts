import { isAuthorizedCronRequest, isCronSecretConfigured } from "@/lib/cron";
import { processDueReminderNotifications } from "@/lib/reminder-notifications";
import { processDueTaskNotifications } from "@/lib/task-notifications";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function runNotificationsCron(request: Request) {
  if (!isCronSecretConfigured()) {
    return Response.json({ error: "CRON_SECRET is not configured." }, { status: 503 });
  }

  if (!isAuthorizedCronRequest(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [reminders, tasks] = await Promise.all([
    processDueReminderNotifications(),
    processDueTaskNotifications()
  ]);

  return Response.json({
    processedAt: new Date().toISOString(),
    reminders,
    tasks
  });
}

export async function GET(request: Request) {
  try {
    return await runNotificationsCron(request);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to process scheduled notifications" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    return await runNotificationsCron(request);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to process scheduled notifications" }, { status: 500 });
  }
}

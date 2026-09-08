import { NotificationsShell } from "@/components/notifications/notifications-shell";
import { redirectToWorkspaceSetupIfNeeded } from "@/lib/workspace-setup-guard";

export default async function NotificationsPage() {
  await redirectToWorkspaceSetupIfNeeded();
  return <NotificationsShell />;
}

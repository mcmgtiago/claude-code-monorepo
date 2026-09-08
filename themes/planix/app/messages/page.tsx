import { ChatsShell } from "@/components/chats/chats-shell";
import { redirectToWorkspaceSetupIfNeeded } from "@/lib/workspace-setup-guard";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  await redirectToWorkspaceSetupIfNeeded({ allowClient: true });
  return <ChatsShell />;
}

import { ClientsShell } from "@/components/clients/clients-shell";
import { redirectToWorkspaceSetupIfNeeded } from "@/lib/workspace-setup-guard";

export default async function ClientsPage() {
  await redirectToWorkspaceSetupIfNeeded();
  return <ClientsShell />;
}

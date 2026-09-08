import { SettingsShell } from "@/components/settings/settings-shell";
import { getBillingUiConfig } from "@/lib/billing";
import { redirectToWorkspaceSetupIfNeeded } from "@/lib/workspace-setup-guard";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await redirectToWorkspaceSetupIfNeeded();
  const billing = getBillingUiConfig();

  return <SettingsShell billing={billing} />;
}

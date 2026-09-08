import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getBillingUiConfig } from "@/lib/billing";
import { redirectToWorkspaceSetupIfNeeded } from "@/lib/workspace-setup-guard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await redirectToWorkspaceSetupIfNeeded();
  const billing = getBillingUiConfig();

  return <DashboardShell billing={billing} />;
}

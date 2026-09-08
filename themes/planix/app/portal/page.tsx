import { ClientPortalShell } from "@/components/portal/client-portal-shell";
import { getDemoPortalDashboard } from "@/lib/template-demo-store";

export const dynamic = "force-dynamic";

export default async function ClientPortalPage() {
  return <ClientPortalShell dashboard={getDemoPortalDashboard()} viewerName="Ariana Cole" />;
}

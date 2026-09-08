import { SuperAdminShell } from "@/components/admin/super-admin-shell";
import { getSuperAdminDashboardData, requireSuperAdminUser } from "@/lib/super-admin";

export default async function SuperAdminPage() {
  await requireSuperAdminUser();
  const data = await getSuperAdminDashboardData();

  return <SuperAdminShell initialData={data} />;
}

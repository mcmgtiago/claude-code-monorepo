import { notFound } from "next/navigation";

import { CompanyShell } from "@/components/clients/company-shell";
import {
  buildDemoCompanyProfile,
  getDemoClientById,
  getDemoOwnerOptions,
  getDemoPeopleBundle,
} from "@/lib/template-demo-store";

export default async function ClientCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = getDemoClientById(id);
  const profile = buildDemoCompanyProfile(id);

  if (!client || !profile) {
    notFound();
  }

  return (
    <CompanyShell
      client={client}
      profile={profile}
      ownerOptions={getDemoOwnerOptions()}
      teamOptions={getDemoPeopleBundle().teams}
    />
  );
}

import { CompaniesWorkspace } from "@/components/companies-workspace";
import { getCompanyDirectory } from "@/lib/company-directory";
import { ensureCompanyLogoCache } from "@/lib/company-logo";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceContext } from "@/lib/workspace";

export default async function CompaniesPage() {
  await ensureCompanyLogoCache();
  const { workspace } = await requireWorkspaceContext();

  const [companies, contacts, leads] = await Promise.all([
    prisma.company.findMany({ where: { workspaceId: workspace.id }, include: { contacts: true }, orderBy: { name: "asc" } }),
    prisma.contact.findMany({ where: { workspaceId: workspace.id }, orderBy: { createdAt: "desc" } }),
    prisma.lead.findMany({
      where: { workspaceId: workspace.id },
      include: {
        contactRecord: { select: { id: true, fullName: true, email: true, phone: true } },
        notes: { orderBy: { createdAt: "desc" } },
        tasks: { orderBy: { createdAt: "desc" } }
      },
      orderBy: { updatedAt: "desc" }
    })
  ]);

  const directory = getCompanyDirectory(companies, contacts, leads);

  return <CompaniesWorkspace companies={directory} />;
}

import { notFound } from "next/navigation";
import { CompanyProfileView } from "@/components/company-profile-view";
import { requireUser } from "@/lib/auth-server";
import { getCompanyByParam, getCompanyDirectory } from "@/lib/company-directory";
import { ensureCompanyLogoCache } from "@/lib/company-logo";
import { prisma } from "@/lib/prisma";
import { getWorkspaceUserAvatarUrl } from "@/lib/user-avatar";
import { getWorkspaceLocalizationSettings } from "@/lib/workspace-localization";
import { requireWorkspaceContext } from "@/lib/workspace";

export const dynamic = "force-dynamic";

export default async function CompanyDetailPage({
  params
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const { user: currentUser, workspace } = await requireWorkspaceContext();
  const localization = await getWorkspaceLocalizationSettings();

  await ensureCompanyLogoCache();

  const [companies, contacts, leads, teamMembers] = await Promise.all([
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
    }),
    prisma.user.findMany({
      where: { status: "ACTIVE", workspaceId: workspace.id },
      orderBy: { fullName: "asc" },
      select: { id: true, fullName: true, email: true, profileImageUrl: true, profileImageAsset: { select: { updatedAt: true } } }
    })
  ]);

  const orderedTeamMembers = [...teamMembers]
    .sort((left, right) => {
      if (left.id === currentUser.id) return -1;
      if (right.id === currentUser.id) return 1;
      return left.fullName.localeCompare(right.fullName);
    })
    .map((member) => ({
      id: member.id,
      fullName: member.fullName,
      email: member.email,
      avatarUrl: getWorkspaceUserAvatarUrl(member)
    }));

  const directory = getCompanyDirectory(companies, contacts, leads);
  const profile = getCompanyByParam(companyId, companies, contacts, leads);

  if (!profile) {
    notFound();
  }

  return (
    <CompanyProfileView
      profile={profile}
      companies={directory.map((company) => ({
        id: company.id || company.slug,
        name: company.name,
        companyType: company.companyType || null,
        website: company.website || null,
        phone: company.phone || null,
        industry: company.industries[0] || company.industryLabel || null,
        location: company.location || null,
        description: company.description || null,
        logoUrl: company.logoUrl || null,
        contactsCount: company.contactsCount
      }))}
      teamMembers={orderedTeamMembers}
      localization={localization}
    />
  );
}

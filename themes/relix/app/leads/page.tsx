import { TrashEntityType } from "@prisma/client";
import { LeadsWorkspace } from "@/components/leads-workspace";
import { shouldHideContactFromLeadPicker } from "@/lib/lead-contact-cleanup";
import { prisma } from "@/lib/prisma";
import { serializeLead } from "@/lib/lead-serializer";
import { getWorkspaceUserAvatarUrl } from "@/lib/user-avatar";
import { getWorkspaceLocalizationSettings } from "@/lib/workspace-localization";
import { requireWorkspaceContext } from "@/lib/workspace";

export default async function LeadsPage({
  searchParams
}: {
  searchParams?: Promise<{ leadId?: string }>;
}) {
  const params = await searchParams;
  const { user: currentUser, workspace } = await requireWorkspaceContext();
  const localization = await getWorkspaceLocalizationSettings();
  const [leads, companies, teamMembers, contacts, trashedLeadEntries] = await Promise.all([
    prisma.lead.findMany({
      where: { workspaceId: workspace.id },
      include: {
        companyRecord: { select: { id: true, name: true } },
        contactRecord: { select: { id: true, fullName: true, email: true, phone: true } },
        notes: { orderBy: { createdAt: "desc" } },
        tasks: { orderBy: { createdAt: "desc" } },
        reminders: { orderBy: [{ completedAt: "asc" }, { remindAt: "asc" }] }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.company.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true }
    }),
    prisma.user.findMany({
      where: { status: "ACTIVE", workspaceId: workspace.id },
      orderBy: { fullName: "asc" },
      select: { id: true, fullName: true, email: true, profileImageUrl: true, profileImageAsset: { select: { updatedAt: true } } }
    }),
    prisma.contact.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { fullName: "asc" },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        companyId: true,
        title: true,
        stage: true,
        linkedinUrl: true,
        location: true,
        timeZone: true,
        customFieldsJson: true,
        createdAt: true,
        _count: {
          select: {
            leads: true,
            tasks: true
          }
        },
        company: { select: { name: true } }
      }
    }),
    prisma.trashEntry.findMany({
      where: {
        workspaceId: workspace.id,
        entityType: TrashEntityType.LEAD
      },
      select: { payload: true }
    })
  ]);
  const trashedLeadSnapshots = trashedLeadEntries
    .map((entry) => entry.payload)
    .filter(
      (payload): payload is {
        contactId: string | null;
        name: string;
        email: string | null;
        phone: string | null;
        companyId: string | null;
        createdAt: string;
      } =>
        Boolean(
          payload &&
            typeof payload === "object" &&
            "name" in payload &&
            "createdAt" in payload
        )
    );
  const leadPickerContacts = contacts.filter((contact) => !shouldHideContactFromLeadPicker(contact, trashedLeadSnapshots));

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
  const serializedLeads = leads.map((lead) => serializeLead(lead));

  return (
    <LeadsWorkspace
      initialLeads={serializedLeads}
      companies={companies}
      contacts={leadPickerContacts.map((contact) => ({
        id: contact.id,
        fullName: contact.fullName,
        email: contact.email,
        phone: contact.phone,
        companyId: contact.companyId,
        companyName: contact.company?.name || null
      }))}
      teamMembers={orderedTeamMembers}
      currentUserId={currentUser.id}
      currentUserName={currentUser.fullName}
      localization={localization}
      initialSelectedLeadId={params?.leadId || null}
    />
  );
}

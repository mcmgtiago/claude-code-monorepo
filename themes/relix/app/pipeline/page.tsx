import { requireUser } from "@/lib/auth-server";
import { TrashEntityType } from "@prisma/client";
import { shouldHideContactFromLeadPicker } from "@/lib/lead-contact-cleanup";
import { prisma } from "@/lib/prisma";
import { serializeLead } from "@/lib/lead-serializer";
import { getWorkspaceUserAvatarUrl } from "@/lib/user-avatar";
import { Topbar } from "@/components/topbar";
import { PipelineBoard } from "@/components/pipeline-board";
import { getWorkspaceLocalizationSettings } from "@/lib/workspace-localization";
import { requireWorkspaceContext } from "@/lib/workspace";

export default async function PipelinePage({
  searchParams
}: {
  searchParams: Promise<{ createLead?: string; contactId?: string; companyId?: string }>;
}) {
  const { user: currentUser, workspace } = await requireWorkspaceContext();
  const params = await searchParams;
  const localization = await getWorkspaceLocalizationSettings();

  const [leads, companies, teamMembers, contacts, trashedLeadEntries] = await Promise.all([
    prisma.lead.findMany({
      where: { workspaceId: workspace.id },
      include: {
        companyRecord: { select: { id: true, name: true, logoUrl: true } },
        contactRecord: { select: { id: true, fullName: true, email: true, phone: true } },
        notes: { orderBy: { createdAt: "desc" } },
        tasks: { orderBy: { createdAt: "desc" } },
        reminders: { orderBy: [{ completedAt: "asc" }, { remindAt: "asc" }] }
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
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

  const initialContact = params.contactId ? leadPickerContacts.find((contact) => contact.id === params.contactId) || null : null;
  const initialCompany = params.companyId ? companies.find((company) => company.id === params.companyId) || null : null;
  
  let initialLeadDraft = null;
  
  if (params.createLead === "1") {
    if (initialContact) {
      initialLeadDraft = {
        contactId: initialContact.id,
        name: initialContact.fullName,
        email: initialContact.email || "",
        phone: initialContact.phone || "",
        companyId: initialContact.companyId || "",
        company: initialContact.company?.name || ""
      };
    } else if (initialCompany) {
      initialLeadDraft = {
        name: `${initialCompany.name} Deal`,
        companyId: initialCompany.id,
        company: initialCompany.name
      };
    }
  }

  return (
    <div>
      <Topbar title="Pipeline" subtitle="Move revenue through each stage and keep value forecasts current." />
      <PipelineBoard
        leads={serializedLeads}
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
        currentUserAccessRole={currentUser.accessRole}
        workspaceOwnerId={workspace.createdById}
        initialLeadDraft={initialLeadDraft}
        localization={localization}
      />
    </div>
  );
}

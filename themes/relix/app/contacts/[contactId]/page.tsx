import { notFound } from "next/navigation";
import { ContactProfileView } from "@/components/contact-profile-view";
import { getCompanyDirectory } from "@/lib/company-directory";
import { ensureCompanyLogoCache } from "@/lib/company-logo";
import { serializeContactRecord } from "@/lib/contact-records";
import { serializeLead } from "@/lib/lead-serializer";
import { parsePeopleFieldDefinitions } from "@/lib/people-fields";
import { getContactCustomFieldsJson, getUserPeopleFieldPrefs, getWorkspacePeopleFieldsJson } from "@/lib/people-field-storage";
import { prisma } from "@/lib/prisma";
import { getWorkspaceLocalizationSettings } from "@/lib/workspace-localization";
import { requireWorkspaceContext } from "@/lib/workspace";

export const dynamic = "force-dynamic";

export default async function ContactDetailPage({
  params
}: {
  params: Promise<{ contactId: string }>;
}) {
  const { contactId } = await params;
  const { user, workspace } = await requireWorkspaceContext();

  await ensureCompanyLogoCache();
  const localization = await getWorkspaceLocalizationSettings();

  const contact = await prisma.contact.findFirst({
    where: { id: contactId, workspaceId: workspace.id },
    include: {
      company: {
        include: {
          contacts: {
            select: { id: true }
          }
        }
      }
    }
  });

  if (!contact) {
    notFound();
  }

  const [companies, contacts, leads, workspacePeopleFieldsJson, currentUser, contactCustomFieldsJson] = await Promise.all([
    prisma.company.findMany({
      where: { workspaceId: workspace.id },
      include: { contacts: true },
      orderBy: { name: "asc" }
    }),
    prisma.contact.findMany({ where: { workspaceId: workspace.id }, orderBy: { fullName: "asc" } }),
    prisma.lead.findMany({
      where: { workspaceId: workspace.id },
      include: {
        companyRecord: { select: { id: true, name: true } },
        contactRecord: { select: { id: true, fullName: true, email: true, phone: true } },
        notes: { orderBy: { createdAt: "desc" } },
        tasks: { orderBy: { createdAt: "desc" } },
        reminders: { orderBy: [{ completedAt: "asc" }, { remindAt: "asc" }] }
      },
      orderBy: { updatedAt: "desc" }
    }),
    getWorkspacePeopleFieldsJson(workspace.id),
    getUserPeopleFieldPrefs(user.id),
    getContactCustomFieldsJson(contact.id)
  ]);

  const companyDirectory = getCompanyDirectory(companies, contacts, leads);
  const companyOptions = companyDirectory.map((company) => ({
    id: company.id || company.slug,
    name: company.name,
    companyType: company.companyType,
    website: company.website || null,
    phone: company.phone || null,
    industry: company.industries[0] || company.industryLabel || null,
    location: company.location || null,
    description: company.description || null,
    logoUrl: company.logoUrl || null,
    contactsCount: company.contactsCount
  }));
  const companySnapshot = contact.company
    ? companyDirectory.find((company) => company.id === contact.companyId || company.name.toLowerCase() === contact.company?.name.toLowerCase()) || null
    : null;
  const serializedContact = serializeContactRecord({ ...contact, customFieldsJson: contactCustomFieldsJson });
  const enrichedContact = {
    ...serializedContact,
    company: contact.company
      ? {
          ...contact.company,
          website: contact.company.website || companySnapshot?.website || null,
          phone: contact.company.phone || companySnapshot?.phone || null,
          logoUrl: contact.company.logoUrl || companySnapshot?.logoUrl || null,
          industry: contact.company.industry || companySnapshot?.industries[0] || companySnapshot?.industryLabel || null,
          location: contact.company.location || companySnapshot?.location || null,
          description: contact.company.description || companySnapshot?.description || null,
          type: contact.company.type || companySnapshot?.companyType || null
        }
      : null
  };
  const relatedContacts = contact.companyId
    ? contacts
        .filter((item) => item.companyId === contact.companyId && item.id !== contact.id)
        .slice(0, 6)
        .map((item) => ({
          id: item.id,
          fullName: item.fullName,
          title: item.title,
          email: item.email
        }))
    : [];
  const linkedLeads = leads
    .map((lead) => serializeLead(lead))
    .filter((lead) => lead.contactId === contact.id)
    .slice(0, 6)
    .map((lead) => ({
      id: lead.id,
      name: lead.name,
      status: lead.status,
      value: lead.value,
      dueDate: lead.dueDate,
      assignedUsers: lead.assignedUsers || [],
      remindersCount: (lead.reminders || []).filter((reminder) => !reminder.completedAt).length
    }));

  return (
    <ContactProfileView
      contact={enrichedContact}
      companies={companyOptions}
      customFields={[
        ...parsePeopleFieldDefinitions(workspacePeopleFieldsJson),
        ...parsePeopleFieldDefinitions(currentUser?.peoplePrivateFieldsJson || null)
      ]}
      relatedContacts={relatedContacts}
      linkedLeads={linkedLeads}
      localization={localization}
    />
  );
}

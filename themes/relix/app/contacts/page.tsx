import { prisma } from "@/lib/prisma";
import { attachContactCustomFieldJson, serializeContactRecords } from "@/lib/contact-records";
import { ContactsWorkspace } from "@/components/contacts-workspace";
import { getCompanyDirectory } from "@/lib/company-directory";
import { ensureCompanyLogoCache } from "@/lib/company-logo";
import { parseDisplayedPeopleFieldIds, parsePeopleFieldDefinitions } from "@/lib/people-fields";
import { getContactCustomFieldsJsonByIds, getUserPeopleFieldPrefs, getWorkspacePeopleFieldsJson } from "@/lib/people-field-storage";
import { requireWorkspaceContext } from "@/lib/workspace";

export default async function ContactsPage() {
  await ensureCompanyLogoCache();
  const { user, workspace } = await requireWorkspaceContext();

  const [contacts, companies, leads, workspacePeopleFieldsJson, currentUser] = await Promise.all([
    prisma.contact.findMany({ where: { workspaceId: workspace.id }, include: { company: true }, orderBy: { createdAt: "desc" } }),
    prisma.company.findMany({ where: { workspaceId: workspace.id }, include: { contacts: true }, orderBy: { createdAt: "desc" } }),
    prisma.lead.findMany({
      where: { workspaceId: workspace.id },
      include: {
        contactRecord: { select: { id: true, fullName: true, email: true, phone: true } },
        notes: { orderBy: { createdAt: "desc" } },
        tasks: { orderBy: { createdAt: "desc" } }
      },
      orderBy: { updatedAt: "desc" }
    }),
    getWorkspacePeopleFieldsJson(workspace.id),
    getUserPeopleFieldPrefs(user.id)
  ]);

  const contactsWithCustomFieldJson = attachContactCustomFieldJson(contacts, await getContactCustomFieldsJsonByIds(contacts.map((contact) => contact.id)));
  const directory = getCompanyDirectory(companies, contacts, leads);
  const globalFields = parsePeopleFieldDefinitions(workspacePeopleFieldsJson);
  const privateFields = parsePeopleFieldDefinitions(currentUser?.peoplePrivateFieldsJson || null);
  const displayedFieldIds = parseDisplayedPeopleFieldIds(currentUser?.peopleDisplayedFieldsJson || null);

  return (
    <ContactsWorkspace
      initialContacts={serializeContactRecords(contactsWithCustomFieldJson)}
      initialCompanies={directory.map((company) => ({
        id: company.id || company.slug,
        name: company.name,
        companyType: company.companyType || null,
        phone: company.phone || null,
        website: company.website || null,
        industry: company.industries[0] || company.industryLabel || null,
        location: company.location || null,
        description: company.description || null
      }))}
      initialGlobalFields={globalFields}
      initialPrivateFields={privateFields}
      initialDisplayedFieldIds={displayedFieldIds}
    />
  );
}

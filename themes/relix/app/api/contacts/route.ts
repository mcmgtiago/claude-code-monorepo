import { z } from "zod";
import { serializeContactRecord, serializeContactRecords } from "@/lib/contact-records";
import { normalizePeopleFieldValueForType, parsePeopleFieldDefinitions, serializePeopleFieldValues, type PeopleFieldType } from "@/lib/people-fields";
import { getContactCustomFieldsJsonByIds, getUserPeopleFieldPrefs, getWorkspacePeopleFieldsJson, saveContactCustomFieldsJson } from "@/lib/people-field-storage";
import { upsertLinkedCompany } from "@/lib/company-record-sync";
import { revalidateCrmDataPaths } from "@/lib/crm-revalidation";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceContext } from "@/lib/workspace";

const customFieldValueSchema = z.union([z.string(), z.number(), z.boolean(), z.array(z.string()), z.null()]);

const contactSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  title: z.string().optional(),
  stage: z.string().optional(),
  linkedinUrl: z.string().optional(),
  location: z.string().optional(),
  timeZone: z.string().optional(),
  companyId: z.string().optional(),
  companyName: z.string().optional(),
  companyType: z.string().optional(),
  companyPhone: z.string().optional(),
  companyWebsite: z.string().optional(),
  companyIndustry: z.string().optional(),
  companyLocation: z.string().optional(),
  companyDescription: z.string().optional(),
  customFields: z.record(z.string(), customFieldValueSchema).optional()
});

export async function GET() {
  const { workspace } = await requireWorkspaceContext();
  const contacts = await prisma.contact.findMany({
    where: { workspaceId: workspace.id },
    include: { company: true },
    orderBy: { createdAt: "desc" }
  });
  const customFieldsById = await getContactCustomFieldsJsonByIds(contacts.map((contact) => contact.id));

  return Response.json(serializeContactRecords(contacts.map((contact) => ({ ...contact, customFieldsJson: customFieldsById.get(contact.id) || null }))));
}

export async function POST(request: Request) {
  try {
    const { user, workspace } = await requireWorkspaceContext();
    const raw = await request.json();
    const payload = contactSchema.parse(raw);
    const [workspacePeopleFieldsJson, currentUser] = await Promise.all([
      getWorkspacePeopleFieldsJson(workspace.id),
      getUserPeopleFieldPrefs(user.id)
    ]);
    const allFieldDefinitions = [
      ...parsePeopleFieldDefinitions(workspacePeopleFieldsJson),
      ...parsePeopleFieldDefinitions(currentUser?.peoplePrivateFieldsJson || null)
    ];
    const customFieldMap = new Map(
      allFieldDefinitions.map((field) => [field.id, field.type] as const)
    );
    const normalizedCustomFields = Object.fromEntries(
      Object.entries(payload.customFields || {}).map(([fieldId, value]) => [
        fieldId,
        normalizePeopleFieldValueForType((customFieldMap.get(fieldId) || "singleLineText") as PeopleFieldType, value)
      ])
    );

    const company = await upsertLinkedCompany({
      workspaceId: workspace.id,
      companyId: payload.companyId || null,
      companyName: payload.companyName || null,
      companyType: payload.companyType || null,
      companyPhone: payload.companyPhone || null,
      companyWebsite: payload.companyWebsite || null,
      companyIndustry: payload.companyIndustry || null,
      companyLocation: payload.companyLocation || null,
      companyDescription: payload.companyDescription || null
    });

    const contact = await prisma.contact.create({
      data: {
        workspaceId: workspace.id,
        fullName: `${payload.firstName} ${payload.lastName}`.trim(),
        email: payload.email || null,
        phone: payload.phone || null,
        title: payload.title || null,
        stage: payload.stage || null,
        linkedinUrl: payload.linkedinUrl || null,
        location: payload.location || null,
        timeZone: payload.timeZone || null,
        companyId: company.companyId
      },
      include: { company: true }
    });

    await saveContactCustomFieldsJson(contact.id, serializePeopleFieldValues(normalizedCustomFields));

    revalidateCrmDataPaths(`/contacts/${contact.id}`, contact.companyId ? `/companies/${contact.companyId}` : "");

    return Response.json(serializeContactRecord({ ...contact, customFieldsJson: serializePeopleFieldValues(normalizedCustomFields) }), { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid contact payload", issues: error.issues }, { status: 400 });
    }

    return Response.json({ error: error instanceof Error ? error.message : "Unable to create contact" }, { status: 500 });
  }
}

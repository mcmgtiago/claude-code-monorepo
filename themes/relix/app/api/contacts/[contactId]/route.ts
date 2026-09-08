import { z } from "zod";
import { serializeContactRecord } from "@/lib/contact-records";
import { upsertLinkedCompany } from "@/lib/company-record-sync";
import { revalidateCrmDataPaths } from "@/lib/crm-revalidation";
import { deleteLeadWithCleanup } from "@/lib/lead-lifecycle";
import {
  normalizePeopleFieldValueForType,
  parsePeopleFieldDefinitions,
  serializePeopleFieldValues,
  type PeopleFieldType
} from "@/lib/people-fields";
import { getContactCustomFieldsJson, getUserPeopleFieldPrefs, getWorkspacePeopleFieldsJson, saveContactCustomFieldsJson } from "@/lib/people-field-storage";
import { prisma } from "@/lib/prisma";
import { archiveContact } from "@/lib/trash";
import { requireWorkspaceContext } from "@/lib/workspace";

const customFieldValueSchema = z.union([z.string(), z.number(), z.boolean(), z.array(z.string()), z.null()]);

const contactUpdateSchema = z.object({
  fullName: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  title: z.string().optional(),
  stage: z.string().optional(),
  linkedinUrl: z.string().optional(),
  location: z.string().optional(),
  timeZone: z.string().optional(),
  companyId: z.string().optional().nullable().or(z.literal("")),
  companyName: z.string().optional(),
  companyType: z.string().optional(),
  companyPhone: z.string().optional(),
  companyWebsite: z.string().optional(),
  companyIndustry: z.string().optional(),
  companyLocation: z.string().optional(),
  companyDescription: z.string().optional(),
  customFields: z.record(z.string(), customFieldValueSchema).optional()
});

export async function GET(_request: Request, context: { params: Promise<{ contactId: string }> }) {
  const { workspace } = await requireWorkspaceContext();
  const { contactId } = await context.params;

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
    return Response.json({ error: "Contact not found" }, { status: 404 });
  }

  return Response.json(serializeContactRecord({ ...contact, customFieldsJson: await getContactCustomFieldsJson(contact.id) }));
}

export async function PATCH(request: Request, context: { params: Promise<{ contactId: string }> }) {
  const { user, workspace } = await requireWorkspaceContext();
  const { contactId } = await context.params;

  try {
    const raw = await request.json();
    const payload = contactUpdateSchema.parse(raw);
    const [workspacePeopleFieldsJson, currentUser] = await Promise.all([
      getWorkspacePeopleFieldsJson(workspace.id),
      getUserPeopleFieldPrefs(user.id)
    ]);
    const allFieldDefinitions = [
      ...parsePeopleFieldDefinitions(workspacePeopleFieldsJson),
      ...parsePeopleFieldDefinitions(currentUser?.peoplePrivateFieldsJson || null)
    ];
    const customFieldMap = new Map(allFieldDefinitions.map((field) => [field.id, field.type] as const));
    const normalizedCustomFields =
      payload.customFields !== undefined
        ? Object.fromEntries(
            Object.entries(payload.customFields).map(([fieldId, value]) => [
              fieldId,
              normalizePeopleFieldValueForType((customFieldMap.get(fieldId) || "singleLineText") as PeopleFieldType, value)
            ])
          )
        : undefined;

    const company = payload.companyId !== undefined || payload.companyName !== undefined
      ? await upsertLinkedCompany({
          workspaceId: workspace.id,
          companyId: payload.companyId === "" ? null : payload.companyId || null,
          companyName: payload.companyName || null,
          companyType: payload.companyType || null,
          companyPhone: payload.companyPhone || null,
          companyWebsite: payload.companyWebsite || null,
          companyIndustry: payload.companyIndustry || null,
          companyLocation: payload.companyLocation || null,
          companyDescription: payload.companyDescription || null
        })
      : null;

    const existingContact = await prisma.contact.findFirst({
      where: { id: contactId, workspaceId: workspace.id },
      select: { id: true }
    });

    if (!existingContact) {
      return Response.json({ error: "Contact not found" }, { status: 404 });
    }

    const contact = await prisma.contact.update({
      where: { id: contactId },
      data: {
        ...(payload.fullName !== undefined ? { fullName: payload.fullName.trim() } : {}),
        ...(payload.email !== undefined ? { email: payload.email || null } : {}),
        ...(payload.phone !== undefined ? { phone: payload.phone || null } : {}),
        ...(payload.title !== undefined ? { title: payload.title || null } : {}),
        ...(payload.stage !== undefined ? { stage: payload.stage || null } : {}),
        ...(payload.linkedinUrl !== undefined ? { linkedinUrl: payload.linkedinUrl || null } : {}),
        ...(payload.location !== undefined ? { location: payload.location || null } : {}),
        ...(payload.timeZone !== undefined ? { timeZone: payload.timeZone || null } : {}),
        ...(company ? { companyId: company.companyId } : {})
      },
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

    if (normalizedCustomFields !== undefined) {
      await saveContactCustomFieldsJson(contact.id, serializePeopleFieldValues(normalizedCustomFields));
    }

    revalidateCrmDataPaths(`/contacts/${contactId}`, contact.companyId ? `/companies/${contact.companyId}` : "");

    return Response.json(
      serializeContactRecord({
        ...contact,
        customFieldsJson: normalizedCustomFields !== undefined ? serializePeopleFieldValues(normalizedCustomFields) : await getContactCustomFieldsJson(contact.id)
      })
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid contact update payload", issues: error.issues }, { status: 400 });
    }

    return Response.json({ error: error instanceof Error ? error.message : "Unable to update contact" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ contactId: string }> }) {
  const { workspace } = await requireWorkspaceContext();
  const { contactId } = await context.params;

  try {
    await prisma.$transaction(async (tx) => {
      await archiveContact(tx, contactId);

      const linkedLeads = await tx.lead.findMany({
        where: { contactId, workspaceId: workspace.id },
        select: {
          id: true,
          companyId: true,
          company: true
        }
      });

      for (const lead of linkedLeads) {
        if (lead.companyId || lead.company) {
          await tx.lead.update({
            where: { id: lead.id },
            data: { contactId: null }
          });
        } else {
          await deleteLeadWithCleanup(tx, lead.id);
        }
      }

      await tx.contact.delete({
        where: { id: contactId }
      });
    });

    revalidateCrmDataPaths(`/contacts/${contactId}`);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Unable to delete contact" }, { status: 500 });
  }
}

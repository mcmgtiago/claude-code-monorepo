import { upsertLinkedCompany } from "@/lib/company-record-sync";
import { prisma } from "@/lib/prisma";

type LeadSyncInput = {
  workspaceId?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  companyId?: string | null;
  company?: string | null;
  contactId?: string | null;
};

function normalizeText(value: string | null | undefined) {
  const normalized = value?.trim() || "";
  return normalized || null;
}

export async function resolveLeadCompany(payload: Pick<LeadSyncInput, "workspaceId" | "companyId" | "company">) {
  const providedCompanyName = normalizeText(payload.company);

  if (!normalizeText(payload.companyId) && !providedCompanyName) {
    return { companyId: null, company: null };
  }

  const company = await upsertLinkedCompany({
    workspaceId: payload.workspaceId || null,
    companyId: payload.companyId || null,
    companyName: providedCompanyName
  });

  return { companyId: company.companyId, company: company.companyName };
}

export async function resolveLeadContact(
  payload: LeadSyncInput,
  company: { companyId: string | null; company: string | null }
) {
  const workspaceId = normalizeText(payload.workspaceId);
  const providedContactId = normalizeText(payload.contactId);
  const fullName = normalizeText(payload.name);
  const email = normalizeText(payload.email);
  const phone = normalizeText(payload.phone);
  const companyId = company.companyId;

  const syncData = {
    ...(fullName ? { fullName } : {}),
    email,
    phone,
    companyId
  };

  if (providedContactId) {
    const existingContact = await prisma.contact.findUnique({
      where: { id: providedContactId },
      select: { id: true, workspaceId: true }
    });

    if (!existingContact || (workspaceId && existingContact.workspaceId !== workspaceId)) {
      throw new Error("Selected contact was not found");
    }

    const contact = await prisma.contact.update({
      where: { id: providedContactId },
      data: syncData,
      select: { id: true, fullName: true }
    });

    return { contactId: contact.id, contactName: contact.fullName };
  }

  if (!fullName || (!email && !phone && !companyId)) {
    return { contactId: null, contactName: fullName };
  }

  if (email) {
    const existingByEmail = await prisma.contact.findFirst({
      where: {
        ...(workspaceId ? { workspaceId } : {}),
        email: {
          equals: email,
          mode: "insensitive"
        }
      },
      select: { id: true }
    });

    if (existingByEmail) {
      const contact = await prisma.contact.update({
        where: { id: existingByEmail.id },
        data: syncData,
        select: { id: true, fullName: true }
      });

      return { contactId: contact.id, contactName: contact.fullName };
    }
  }

  if (companyId) {
    const existingByNameAndCompany = await prisma.contact.findFirst({
      where: {
        ...(workspaceId ? { workspaceId } : {}),
        fullName: {
          equals: fullName,
          mode: "insensitive"
        },
        companyId
      },
      select: { id: true }
    });

    if (existingByNameAndCompany) {
      const contact = await prisma.contact.update({
        where: { id: existingByNameAndCompany.id },
        data: syncData,
        select: { id: true, fullName: true }
      });

      return { contactId: contact.id, contactName: contact.fullName };
    }
  }

  const createdContact = await prisma.contact.create({
    data: {
      workspaceId,
      fullName,
      email,
      phone,
      companyId
    },
    select: { id: true, fullName: true }
  });

  return { contactId: createdContact.id, contactName: createdContact.fullName };
}

import { getCompanyLogoUrl } from "@/lib/company-logo";
import { prisma } from "@/lib/prisma";

type CompanyReferenceInput = {
  workspaceId?: string | null;
  companyId?: string | null;
  companyName?: string | null;
  companyType?: string | null;
  companyPhone?: string | null;
  companyWebsite?: string | null;
  companyIndustry?: string | null;
  companyLocation?: string | null;
  companyDescription?: string | null;
};

function normalizeText(value: string | null | undefined) {
  const normalized = value?.trim() || "";
  return normalized || null;
}

function pickValue(...values: Array<string | null | undefined>) {
  for (const value of values) {
    const normalized = normalizeText(value);
    if (normalized) {
      return normalized;
    }
  }

  return null;
}

export async function upsertLinkedCompany(input: CompanyReferenceInput) {
  const workspaceId = normalizeText(input.workspaceId);
  const requestedCompanyId = normalizeText(input.companyId);
  const requestedCompanyName = normalizeText(input.companyName);

  let existingCompany = null;

  if (requestedCompanyId) {
    existingCompany = await prisma.company.findUnique({
      where: { id: requestedCompanyId }
    });

    if (existingCompany && workspaceId && existingCompany.workspaceId !== workspaceId) {
      existingCompany = null;
    }
  }

  if (!existingCompany && requestedCompanyName) {
    existingCompany = await prisma.company.findFirst({
      where: {
        ...(workspaceId ? { workspaceId } : {}),
        name: {
          equals: requestedCompanyName,
          mode: "insensitive"
        }
      }
    });
  }

  const effectiveCompanyName = requestedCompanyName || existingCompany?.name || null;

  if (!effectiveCompanyName) {
    return { companyId: null, companyName: null };
  }

  const website = pickValue(input.companyWebsite, existingCompany?.website);
  const data = {
    name: effectiveCompanyName,
    type: pickValue(input.companyType, existingCompany?.type),
    phone: pickValue(input.companyPhone, existingCompany?.phone),
    website,
    logoUrl: getCompanyLogoUrl(website) || existingCompany?.logoUrl || null,
    industry: pickValue(input.companyIndustry, existingCompany?.industry),
    location: pickValue(input.companyLocation, existingCompany?.location),
    description: pickValue(input.companyDescription, existingCompany?.description),
    stage: pickValue(existingCompany?.stage),
    linkedinUrl: pickValue(existingCompany?.linkedinUrl),
    listsJson: existingCompany?.listsJson || null,
    keywordsJson: existingCompany?.keywordsJson || null
  };

  const company = existingCompany
    ? await prisma.company.update({
        where: { id: existingCompany.id },
        data
      })
    : await prisma.company.create({
        data: {
          workspaceId,
          ...data
        }
      });

  return { companyId: company.id, companyName: company.name };
}

type CompanyRecord = {
  id: string;
  name: string;
  website: string | null;
  industry: string | null;
  type: string | null;
  phone: string | null;
  location: string | null;
  description: string | null;
  stage: string | null;
  employeeCount: number | null;
  foundedYear: number | null;
  revenueLabel: string | null;
  marketCapLabel: string | null;
  linkedinUrl: string | null;
  facebookUrl: string | null;
  xUrl: string | null;
  listsJson?: string | null;
  keywordsJson?: string | null;
};

function parseStoredStringArray(value: string | null | undefined) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    }
  } catch {
    return [];
  }

  return [];
}

export function serializeCompany<T extends CompanyRecord>(company: T) {
  return {
    ...company,
    lists: parseStoredStringArray(company.listsJson),
    keywords: parseStoredStringArray(company.keywordsJson)
  };
}

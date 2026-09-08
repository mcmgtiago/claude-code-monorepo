import { format } from "date-fns";
import type { Company, Contact, Lead, Note, Task } from "@prisma/client";
import { getCompanyLogoUrl } from "@/lib/company-logo";
import { type LeadStatusValue, leadStatusLabels } from "@/lib/crm";
import { serializeLead } from "@/lib/lead-serializer";
import { assigneeInitials } from "@/lib/team";

type DbCompany = Company & { contacts: Contact[] };
type DbLead = Lead & {
  notes: Note[];
  tasks: Task[];
};

export type CompanyDirectoryItem = {
  slug: string;
  id: string | null;
  name: string;
  mark: string;
  markClassName: string;
  companyType: string | null;
  employeeCount: number;
  industryLabel: string;
  industries: string[];
  location: string;
  revenueLabel: string;
  marketCapLabel: string;
  foundedYear: number;
  website: string;
  logoUrl: string | null;
  description: string;
  linkedinUrl: string;
  facebookUrl: string;
  xUrl: string;
  keywords: string[];
  phone: string;
  stage: string;
  lists: string[];
  contactsCount: number;
  employees: Array<{
    id: string;
    name: string;
    title: string;
    location: string;
    email: string | null;
    phone: string | null;
    linkedinUrl: string | null;
    isPersisted: boolean;
  }>;
  deals: Array<{
    id: string;
    title: string;
    status: LeadStatusValue;
    sortOrder: number;
    stageLabel: string;
    value: number;
    valueLabel: string;
    owner: string;
    ownerId: string | null;
    summary: string;
    dueDate: string | null;
    dueLabel: string;
    attachmentsCount: number;
    commentsCount: number;
    reminderCount: number;
    participantInitials: string[];
  }>;
};

type CompanySeed = Omit<
  CompanyDirectoryItem,
  "id" | "contactsCount" | "employees" | "deals" | "companyType" | "logoUrl"
> & {
  companyType?: string | null;
  logoUrl?: string | null;
};

function parseStoredStringArray(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    }
  } catch {
    return null;
  }

  return null;
}

export function slugifyCompanyName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function buildFallbackSeed(name: string): CompanySeed {
  return {
    slug: slugifyCompanyName(name),
    name,
    mark: name.slice(0, 2).toUpperCase(),
    markClassName: "bg-[#eef4ff] text-[#386df4]",
    employeeCount: 0,
    industryLabel: "Not set",
    industries: [],
    location: "",
    revenueLabel: "",
    marketCapLabel: "",
    foundedYear: 0,
    website: "",
    linkedinUrl: "",
    facebookUrl: "",
    xUrl: "",
    description: "",
    keywords: [],
    phone: "",
    stage: "",
    lists: []
  };
}

function buildEmployees(dbContacts: Contact[]) {
  const mappedContacts = dbContacts.map((contact) => ({
    id: contact.id,
    name: contact.fullName,
    title: contact.title || "Not set",
    location: contact.location || "Not set",
    email: contact.email || null,
    phone: contact.phone || null,
    linkedinUrl: contact.linkedinUrl || null,
    isPersisted: true
  }));
  const seen = new Set<string>();

  return mappedContacts.filter((employee) => {
    const key = employee.name.toLowerCase();
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function buildDeals(dbLeads: DbLead[]) {
  return dbLeads
    .map((lead) => serializeLead(lead))
    .map((lead) => ({
      id: String(lead.id),
      title: String(lead.name),
      status: lead.status as LeadStatusValue,
      sortOrder: Number(lead.sortOrder || 0),
      stageLabel: leadStatusLabels[lead.status as LeadStatusValue],
      value: Number(lead.value || 0),
      valueLabel: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
      }).format(Number(lead.value || 0)),
      owner: lead.assignedUsers[0] || "Unassigned",
      ownerId: lead.assignedUserIds[0] || null,
      summary: String(lead.summary || ""),
      dueDate: lead.dueDate ? new Date(lead.dueDate).toISOString() : null,
      dueLabel: lead.dueDate ? format(new Date(lead.dueDate), "MMM d") : "No date",
      attachmentsCount: Number(lead.attachmentsCount || 0),
      commentsCount: Array.isArray(lead.notes) ? lead.notes.length : 0,
      reminderCount: Array.isArray(lead.reminders) ? lead.reminders.filter((reminder) => !reminder.completedAt).length : 0,
      participantInitials: (lead.assignedUsers || []).slice(0, 4).map((user) => assigneeInitials(user))
    }))
    .sort((left, right) => {
      if (left.sortOrder !== right.sortOrder) {
        return left.sortOrder - right.sortOrder;
      }

      return left.title.localeCompare(right.title);
    });
}

function materializeCompany(seed: CompanySeed, dbCompany: DbCompany, dbContacts: Contact[], dbLeads: DbLead[]): CompanyDirectoryItem {
  const storedLists = parseStoredStringArray(dbCompany.listsJson);
  const storedKeywords = parseStoredStringArray(dbCompany.keywordsJson);

  return {
    ...seed,
    id: dbCompany.id,
    companyType: dbCompany.type || null,
    employeeCount: dbCompany.employeeCount || seed.employeeCount,
    website: dbCompany.website || seed.website,
    logoUrl: dbCompany.logoUrl || getCompanyLogoUrl(dbCompany.website || seed.website),
    industryLabel: dbCompany.industry || seed.industryLabel,
    industries: dbCompany.industry ? [dbCompany.industry, ...seed.industries.filter((item) => item !== dbCompany.industry)] : seed.industries,
    location: dbCompany.location || seed.location,
    revenueLabel: dbCompany.revenueLabel || seed.revenueLabel,
    marketCapLabel: dbCompany.marketCapLabel || seed.marketCapLabel,
    foundedYear: dbCompany.foundedYear || seed.foundedYear,
    description: dbCompany.description || seed.description,
    linkedinUrl: dbCompany.linkedinUrl || seed.linkedinUrl,
    facebookUrl: dbCompany.facebookUrl || seed.facebookUrl,
    xUrl: dbCompany.xUrl || seed.xUrl,
    keywords: storedKeywords?.length ? storedKeywords : seed.keywords,
    phone: dbCompany.phone || seed.phone,
    stage: dbCompany.stage || seed.stage,
    lists: storedLists?.length ? storedLists : seed.lists,
    contactsCount: dbContacts.length,
    employees: buildEmployees(dbContacts),
    deals: buildDeals(dbLeads)
  };
}

export function getCompanyDirectory(dbCompanies: DbCompany[], contacts: Contact[], leads: DbLead[]) {
  return dbCompanies
    .map((company) => {
      const seed = buildFallbackSeed(company.name);
      const dbContacts = contacts.filter((contact) => contact.companyId === company.id);
      const dbLeads = leads.filter((lead) => lead.companyId === company.id || lead.company?.toLowerCase() === company.name.toLowerCase());

      return materializeCompany(seed, company, dbContacts, dbLeads);
    })
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function getCompanyByParam(param: string, dbCompanies: DbCompany[], contacts: Contact[], leads: DbLead[]) {
  const directory = getCompanyDirectory(dbCompanies, contacts, leads);
  const normalizedParam = param.toLowerCase();

  return (
    directory.find((company) => company.slug === normalizedParam) ||
    directory.find((company) => company.id === param) ||
    directory.find((company) => slugifyCompanyName(company.name) === normalizedParam) ||
    null
  );
}

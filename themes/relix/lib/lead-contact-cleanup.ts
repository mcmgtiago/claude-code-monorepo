function normalizeText(value: string | null | undefined) {
  const normalized = value?.trim() || "";
  return normalized || null;
}

type LeadSnapshotLike = {
  contactId: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  companyId: string | null;
  createdAt: string;
};

type SparseContactLike = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  companyId: string | null;
  title: string | null;
  stage: string | null;
  linkedinUrl: string | null;
  location: string | null;
  timeZone: string | null;
  customFieldsJson: string | null;
  createdAt: Date;
  _count: {
    leads: number;
    tasks: number;
  };
};

export function isAutoCreatedLeadContact(contact: SparseContactLike, lead: LeadSnapshotLike) {
  const matchesLeadCoreFields =
    normalizeText(contact.id) === normalizeText(lead.contactId) &&
    normalizeText(contact.fullName) === normalizeText(lead.name) &&
    normalizeText(contact.email) === normalizeText(lead.email) &&
    normalizeText(contact.phone) === normalizeText(lead.phone) &&
    normalizeText(contact.companyId) === normalizeText(lead.companyId);
  const hasExtendedProfileData = Boolean(
    normalizeText(contact.title) ||
      normalizeText(contact.stage) ||
      normalizeText(contact.linkedinUrl) ||
      normalizeText(contact.location) ||
      normalizeText(contact.timeZone) ||
      normalizeText(contact.customFieldsJson)
  );
  const leadCreatedAt = new Date(lead.createdAt);
  const createdNearLead = Math.abs(contact.createdAt.getTime() - leadCreatedAt.getTime()) <= 5 * 60 * 1000;

  return (
    matchesLeadCoreFields &&
    !hasExtendedProfileData &&
    createdNearLead &&
    contact._count.leads <= 1 &&
    contact._count.tasks === 0
  );
}

export function shouldHideContactFromLeadPicker(contact: SparseContactLike, trashedLeads: LeadSnapshotLike[]) {
  if (contact._count.leads > 0) {
    return false;
  }

  return trashedLeads.some((lead) => isAutoCreatedLeadContact(contact, lead));
}

import type { ChatContact } from "@/data/chats";

export const MESSAGE_CONTACT_ID_PARAM = "contactId";
export const MESSAGE_CONTACT_EMAIL_PARAM = "contactEmail";
export const MESSAGE_CONTACT_NAME_PARAM = "contactName";

type MessageNavigationTarget = {
  id?: string | null;
  email?: string | null;
  name?: string | null;
};

function normalizeValue(value?: string | null) {
  return value?.trim() || "";
}

function normalizeEmail(value?: string | null) {
  return normalizeValue(value).toLowerCase();
}

function normalizeName(value?: string | null) {
  return normalizeValue(value).toLowerCase();
}

export function buildMessagesHref(target: MessageNavigationTarget) {
  const params = new URLSearchParams();
  const contactId = normalizeValue(target.id);
  const contactEmail = normalizeEmail(target.email);
  const contactName = normalizeValue(target.name);

  if (contactId) {
    params.set(MESSAGE_CONTACT_ID_PARAM, contactId);
  }

  if (contactEmail) {
    params.set(MESSAGE_CONTACT_EMAIL_PARAM, contactEmail);
  }

  if (contactName) {
    params.set(MESSAGE_CONTACT_NAME_PARAM, contactName);
  }

  const query = params.toString();
  return query ? `/messages?${query}` : "/messages";
}

export function resolveMessageContactId(
  contacts: ChatContact[],
  target: MessageNavigationTarget,
) {
  const contactId = normalizeValue(target.id);

  if (contactId && contacts.some((contact) => contact.id === contactId)) {
    return contactId;
  }

  const contactEmail = normalizeEmail(target.email);

  if (contactEmail) {
    const emailMatch = contacts.find((contact) => normalizeEmail(contact.email) === contactEmail);

    if (emailMatch) {
      return emailMatch.id;
    }
  }

  const contactName = normalizeName(target.name);

  if (!contactName) {
    return null;
  }

  return contacts.find((contact) => normalizeName(contact.name) === contactName)?.id ?? null;
}

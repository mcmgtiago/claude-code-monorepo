import type { Contact, Company } from "@prisma/client";
import { parsePeopleFieldValues, type PeopleFieldValues } from "@/lib/people-fields";

type ContactWithCompany = Contact & {
  company?: Company | null;
};

export type ContactRecordWithCustomFields = ContactWithCompany & {
  customFields: PeopleFieldValues;
};

export function serializeContactRecord<T extends ContactWithCompany>(contact: T): Omit<T, "customFieldsJson"> & { customFields: PeopleFieldValues } {
  const { customFieldsJson, ...rest } = contact as T & { customFieldsJson?: string | null };

  return {
    ...rest,
    customFields: parsePeopleFieldValues(customFieldsJson || null)
  };
}

export function serializeContactRecords<T extends ContactWithCompany>(contacts: T[]) {
  return contacts.map((contact) => serializeContactRecord(contact));
}

export function attachContactCustomFieldJson<T extends { id: string }>(
  contacts: T[],
  customFieldsById: Map<string, string | null>
): Array<T & { customFieldsJson: string | null }> {
  return contacts.map((contact) => ({
    ...contact,
    customFieldsJson: customFieldsById.get(contact.id) || null
  }));
}

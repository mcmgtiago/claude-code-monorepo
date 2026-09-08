export type PeopleFieldType =
  | "singleLineText"
  | "multiLineText"
  | "number"
  | "singleSelect"
  | "multiPicklist"
  | "date"
  | "dateTime"
  | "checkbox"
  | "userLookup";

export type PeopleFieldScope = "global" | "private";

export type PeopleFieldDefinition = {
  id: string;
  label: string;
  type: PeopleFieldType;
  builtIn?: boolean;
  required?: boolean;
  scope?: PeopleFieldScope;
  options?: string[];
};

export type PeopleFieldValue = string | number | boolean | string[] | null;
export type PeopleFieldValues = Record<string, PeopleFieldValue>;

const allowedFieldTypes = new Set<PeopleFieldType>([
  "singleLineText",
  "multiLineText",
  "number",
  "singleSelect",
  "multiPicklist",
  "date",
  "dateTime",
  "checkbox",
  "userLookup"
]);

function isPeopleFieldType(value: unknown): value is PeopleFieldType {
  return typeof value === "string" && allowedFieldTypes.has(value as PeopleFieldType);
}

export function normalizePeopleFieldId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function parsePeopleFieldDefinitions(value: string | null | undefined): PeopleFieldDefinition[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.flatMap((item) => {
      if (!item || typeof item !== "object") {
        return [];
      }

      const candidate = item as Record<string, unknown>;
      const id = typeof candidate.id === "string" ? normalizePeopleFieldId(candidate.id) : "";
      const label = typeof candidate.label === "string" ? candidate.label.trim() : "";
      const type = isPeopleFieldType(candidate.type) ? candidate.type : null;
      const scope = candidate.scope === "global" ? "global" : "private";
      const options = Array.isArray(candidate.options) ? candidate.options.filter((option): option is string => typeof option === "string" && option.trim().length > 0) : [];

      if (!id || !label || !type) {
        return [];
      }

      return [
        {
          id,
          label,
          type,
          scope,
          builtIn: Boolean(candidate.builtIn),
          required: Boolean(candidate.required),
          options
        } satisfies PeopleFieldDefinition
      ];
    });
  } catch {
    return [];
  }
}

export function serializePeopleFieldDefinitions(fields: PeopleFieldDefinition[]) {
  if (!fields.length) {
    return null;
  }

  return JSON.stringify(
    fields.map((field) => ({
      id: normalizePeopleFieldId(field.id),
      label: field.label.trim(),
      type: field.type,
      scope: field.scope === "global" ? "global" : "private",
      builtIn: Boolean(field.builtIn),
      required: Boolean(field.required),
      options: (field.options || []).map((option) => option.trim()).filter(Boolean)
    }))
  );
}

export function parseDisplayedPeopleFieldIds(value: string | null | undefined) {
  if (!value) {
    return [] as string[];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item): item is string => typeof item === "string")
      .map((item) => normalizePeopleFieldId(item))
      .filter(Boolean);
  } catch {
    return [];
  }
}

export function serializeDisplayedPeopleFieldIds(fieldIds: string[]) {
  if (!fieldIds.length) {
    return null;
  }

  return JSON.stringify(Array.from(new Set(fieldIds.map((fieldId) => normalizePeopleFieldId(fieldId)).filter(Boolean))));
}

function normalizeStoredFieldValue(value: unknown): PeopleFieldValue {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  return null;
}

export function parsePeopleFieldValues(value: string | null | undefined): PeopleFieldValues {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed).flatMap(([fieldId, fieldValue]) => {
        const normalizedId = normalizePeopleFieldId(fieldId);
        if (!normalizedId) {
          return [];
        }

        return [[normalizedId, normalizeStoredFieldValue(fieldValue)]];
      })
    );
  } catch {
    return {};
  }
}

export function serializePeopleFieldValues(values: PeopleFieldValues) {
  const nextEntries = Object.entries(values).flatMap(([fieldId, fieldValue]) => {
    const normalizedId = normalizePeopleFieldId(fieldId);
    const normalizedValue = normalizeStoredFieldValue(fieldValue);

    if (!normalizedId || normalizedValue === null || normalizedValue === "") {
      return [];
    }

    if (Array.isArray(normalizedValue) && normalizedValue.length === 0) {
      return [];
    }

    return [[normalizedId, normalizedValue]];
  });

  if (!nextEntries.length) {
    return null;
  }

  return JSON.stringify(Object.fromEntries(nextEntries));
}

export function normalizePeopleFieldValueForType(type: PeopleFieldType, value: unknown): PeopleFieldValue {
  if (value === null || value === undefined) {
    return null;
  }

  switch (type) {
    case "checkbox":
      return Boolean(value);
    case "number": {
      if (typeof value === "number") {
        return Number.isFinite(value) ? value : null;
      }

      if (typeof value === "string" && value.trim()) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
      }

      return null;
    }
    case "multiPicklist":
      if (Array.isArray(value)) {
        return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
      }

      if (typeof value === "string") {
        return value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }

      return [];
    default:
      return typeof value === "string" ? value.trim() : String(value);
  }
}

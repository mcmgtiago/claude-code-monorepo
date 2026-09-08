"use client";

import { AppSelect } from "@/components/app-select";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { DragEvent, ReactNode } from "react";
import {
  BookOpen,
  Building2,
  ChevronDown,
  Clipboard,
  Download,
  GripVertical,
  Linkedin,
  Mail,
  PencilLine,
  Phone,
  Plus,
  Search,
  Settings2,
  SlidersHorizontal,
  TextCursorInput,
  Trash2,
  Upload,
  X
} from "lucide-react";
import { Card } from "@/components/card";
import { CompanyLogo } from "@/components/company-logo";
import { useConfirmAction } from "@/components/confirm-action-modal";
import { ContactFormModal } from "@/components/contact-form-modal";
import { PaginationControls } from "@/components/pagination-controls";
import { SearchHotkeyButton, useCommandKFocus } from "@/components/search-hotkey";
import { SelectionCheckbox } from "@/components/selection-checkbox";
import { TableActionMenu } from "@/components/table-action-menu";
import { paginateItems } from "@/lib/pagination";
import { exportToExcel } from "@/lib/export-excel";
import {
  normalizePeopleFieldId,
  normalizePeopleFieldValueForType,
  type PeopleFieldDefinition,
  type PeopleFieldType,
  type PeopleFieldValue,
  type PeopleFieldValues
} from "@/lib/people-fields";

type ContactRecord = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  stage: string | null;
  linkedinUrl: string | null;
  location: string | null;
  timeZone: string | null;
  customFields: PeopleFieldValues;
  company: {
    id: string;
    name: string;
    type: string | null;
    phone: string | null;
    logoUrl: string | null;
    website: string | null;
    industry: string | null;
  } | null;
};

type CompanyOption = {
  id: string;
  name: string;
  companyType?: string | null;
  website?: string | null;
  phone?: string | null;
  industry?: string | null;
  location?: string | null;
  description?: string | null;
};

type CreateFieldForm = {
  name: string;
  type: PeopleFieldType | "";
  scope: "global" | "private";
  options: string[];
};

type Filters = {
  company: string;
  stage: string;
  hasEmail: "all" | "yes" | "no";
  hasPhone: "all" | "yes" | "no";
};

type SortOption = "relevance" | "name-asc" | "title-asc" | "company-asc" | "newest";

type SavedSearch = {
  id: string;
  name: string;
  query: string;
  filters: Filters;
  sort: SortOption;
};

type ViewPreset = {
  id: string;
  name: string;
  query: string;
  filters: Filters;
  sort: SortOption;
};

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/10";
const filterOptionIconClassName = "h-3.5 w-3.5 text-slate-400";

const builtInFields: PeopleFieldDefinition[] = [
  { id: "name", label: "Name", type: "singleLineText", builtIn: true, required: true },
  { id: "title", label: "Job title", type: "singleLineText", builtIn: true },
  { id: "company", label: "Company", type: "singleLineText", builtIn: true },
  { id: "email", label: "Emails", type: "singleLineText", builtIn: true },
  { id: "phone", label: "Phone number", type: "singleLineText", builtIn: true },
  { id: "actions", label: "Actions", type: "singleLineText", builtIn: true }
];

const defaultDisplayedFieldIds = builtInFields.map((field) => field.id);
const savedSearchesStorageKey = "people_saved_searches_v1";

const fieldTypeOptions: Array<{ id: PeopleFieldType; label: string }> = [
  { id: "singleLineText", label: "Single-line text" },
  { id: "multiLineText", label: "Multi-line text" },
  { id: "number", label: "Number" },
  { id: "singleSelect", label: "Single-select picklist" },
  { id: "multiPicklist", label: "Multi Picklist" },
  { id: "date", label: "Date" },
  { id: "dateTime", label: "Date/time" },
  { id: "checkbox", label: "Checkbox" },
  { id: "userLookup", label: "User lookup" }
];

const emptyFilters = (): Filters => ({
  company: "",
  stage: "",
  hasEmail: "all",
  hasPhone: "all"
});

const defaultViewPresets: ViewPreset[] = [
  { id: "all-people", name: "Default view", query: "", filters: emptyFilters(), sort: "relevance" },
  {
    id: "outreach-ready",
    name: "Outreach ready",
    query: "",
    filters: { company: "", stage: "", hasEmail: "yes", hasPhone: "all" },
    sort: "relevance"
  },
  {
    id: "missing-mobile",
    name: "Missing mobile",
    query: "",
    filters: { company: "", stage: "", hasEmail: "all", hasPhone: "no" },
    sort: "name-asc"
  },
  {
    id: "qualified-contacts",
    name: "Qualified contacts",
    query: "",
    filters: { company: "", stage: "Qualified", hasEmail: "all", hasPhone: "all" },
    sort: "company-asc"
  }
];

function companyBadge(name: string) {
  const palette = [
    "bg-[#eef4ff] text-[#386df4]",
    "bg-[#fff3e8] text-[#f0643f]",
    "bg-[#eefaf2] text-[#2f9d57]",
    "bg-[#f1edff] text-[#6f4bd8]",
    "bg-[#fff5db] text-[#d49a15]"
  ];
  const index = name.length % palette.length;
  return palette[index];
}

function emptyCreateFieldForm(): CreateFieldForm {
  return {
    name: "",
    type: "",
    scope: "private",
    options: ["", ""]
  };
}

function typeLabel(type: PeopleFieldType | "") {
  return fieldTypeOptions.find((option) => option.id === type)?.label || "";
}

function sortLabel(sort: SortOption) {
  switch (sort) {
    case "name-asc":
      return "Name A-Z";
    case "title-asc":
      return "Job title";
    case "company-asc":
      return "Company";
    case "newest":
      return "Newest";
    default:
      return "Relevance";
  }
}

function composeEmailHref(contact: ContactRecord) {
  if (!contact.email) {
    return "/inbox";
  }

  const params = new URLSearchParams({
    compose: "new",
    to: contact.email,
    subject: `Follow up with ${contact.fullName}`
  });

  return `/inbox?${params.toString()}`;
}

function composePipelineHref(contact: ContactRecord) {
  const params = new URLSearchParams({
    createLead: "1",
    contactId: contact.id
  });

  return `/pipeline?${params.toString()}`;
}

function emptyImportText() {
  return "firstName,lastName,email,title,companyName,phone,stage,location\nAva,Stone,ava@example.com,Account Executive,Acme,+1 555 120 4500,Qualified,New York";
}

function fieldValueToExportString(value: PeopleFieldValue) {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

function readCustomFieldValue(contact: ContactRecord, field: PeopleFieldDefinition) {
  if (field.id in contact.customFields) {
    return contact.customFields[field.id] ?? null;
  }

  const normalized = normalizePeopleFieldId(field.label);

  switch (normalized) {
    case "industry":
      return contact.company?.industry || null;
    case "location":
      return contact.location || null;
    case "stage":
      return contact.stage || null;
    case "time-zone":
    case "timezone":
      return contact.timeZone || null;
    case "linkedin":
    case "linkedin-url":
      return contact.linkedinUrl || null;
    case "website":
      return contact.company?.website || null;
    case "company-type":
      return contact.company?.type || null;
    case "company-phone":
      return contact.company?.phone || null;
    default:
      return null;
  }
}

function renderCustomFieldValue(contact: ContactRecord, field: PeopleFieldDefinition) {
  const value = readCustomFieldValue(contact, field);

  if (value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) {
    return <span className="text-slate-300">-</span>;
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (field.type === "multiPicklist") {
    const tokens = Array.isArray(value)
      ? value
      : String(value)
          .split(/[,/]/)
          .map((item) => item.trim())
          .filter(Boolean);

    return (
      <div className="flex flex-wrap gap-1.5">
        {tokens.map((token) => (
          <span key={token} className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-xs font-medium text-[#386df4]">
            {token}
          </span>
        ))}
      </div>
    );
  }

  if (normalizePeopleFieldId(field.label) === "linkedin-url") {
    return (
      <a href={String(value).startsWith("http") ? String(value) : `https://${String(value)}`} target="_blank" rel="noreferrer" className="hover:text-[#386df4]">
        {String(value)}
      </a>
    );
  }

  if (normalizePeopleFieldId(field.label) === "company-phone") {
    return (
      <a href={`tel:${String(value)}`} className="hover:text-[#386df4]">
        {String(value)}
      </a>
    );
  }

  return String(value);
}

function exportContacts(records: ContactRecord[], fields: PeopleFieldDefinition[], filename: string) {
  const exportableFields = fields.filter((field) => field.id !== "actions");
  const exportData = records.map((contact) =>
    Object.fromEntries(
      exportableFields.map((field) => {
        switch (field.id) {
          case "name":
            return [field.label, contact.fullName];
          case "email":
            return [field.label, contact.email || ""];
          case "phone":
            return [field.label, contact.phone || ""];
          case "title":
            return [field.label, contact.title || ""];
          case "company":
            return [field.label, contact.company?.name || ""];
          default:
            return [field.label, fieldValueToExportString(readCustomFieldValue(contact, field))];
        }
      })
    )
  );

  exportToExcel(exportData, filename);
}

function headerClassName(hasBorder: boolean) {
  return `${hasBorder ? "border-r border-slate-200/80 " : ""}px-2.5 py-3 font-medium`;
}

function cellClassName(hasBorder: boolean) {
  return `${hasBorder ? "border-r border-slate-200/80 " : ""}px-2.5 py-3 align-top`;
}

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function parseImportRows(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase());

  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    const row = headers.reduce<Record<string, string>>((accumulator, header, index) => {
      accumulator[header] = cells[index] || "";
      return accumulator;
    }, {});

    const [firstName = "", ...rest] = (row.fullname || row.full_name || "").split(" ").filter(Boolean);
    const lastName = rest.join(" ");

    return {
      firstName: row.firstname || row.first_name || firstName,
      lastName: row.lastname || row.last_name || lastName,
      email: row.email || "",
      phone: row.phone || row.phone_number || "",
      title: row.title || row.job_title || "",
      companyName: row.company || row.companyname || row.company_name || "",
      stage: row.stage || "",
      location: row.location || "",
      linkedinUrl: row.linkedin || row.linkedinurl || row.linkedin_url || "",
      timeZone: row.timezone || row.time_zone || ""
    };
  });
}

function derivePromptResult(prompt: string, contacts: ContactRecord[], companies: CompanyOption[]) {
  const value = prompt.trim().toLowerCase();
  const nextFilters = emptyFilters();
  let nextQuery = "";
  let nextSort: SortOption = "relevance";
  const notes: string[] = [];

  if (value.includes("without email") || value.includes("missing email")) {
    nextFilters.hasEmail = "no";
    notes.push("Showing contacts without email");
  } else if (value.includes("with email") || value.includes("email ready")) {
    nextFilters.hasEmail = "yes";
    notes.push("Showing contacts with email");
  }

  if (value.includes("without phone") || value.includes("missing phone") || value.includes("missing mobile")) {
    nextFilters.hasPhone = "no";
    notes.push("Showing contacts without phone");
  } else if (value.includes("with phone") || value.includes("mobile ready")) {
    nextFilters.hasPhone = "yes";
    notes.push("Showing contacts with phone");
  }

  const companyMatch = companies.find((company) => value.includes(company.name.toLowerCase()));
  if (companyMatch) {
    nextFilters.company = companyMatch.name;
    notes.push(`Filtered to ${companyMatch.name}`);
  }

  const stageMatch = ["lead", "qualified", "customer", "evangelist"].find((stage) => value.includes(stage));
  if (stageMatch) {
    nextFilters.stage = stageMatch.charAt(0).toUpperCase() + stageMatch.slice(1);
    notes.push(`Stage set to ${nextFilters.stage}`);
  }

  const locationContact = contacts.find((contact) => contact.location && value.includes(contact.location.toLowerCase()));
  if (locationContact?.location) {
    nextQuery = locationContact.location;
    notes.push(`Searching by location: ${locationContact.location}`);
  }

  const titleKeywords = ["manager", "engineer", "analyst", "director", "specialist", "executive"];
  const matchedTitle = titleKeywords.find((keyword) => value.includes(keyword));
  if (matchedTitle) {
    nextQuery = matchedTitle;
    notes.push(`Searching titles for "${matchedTitle}"`);
  }

  if (value.includes("alphabetical") || value.includes("a-z")) {
    nextSort = "name-asc";
    notes.push("Sorting by name");
  } else if (value.includes("company")) {
    nextSort = "company-asc";
    notes.push("Sorting by company");
  } else if (value.includes("job title") || value.includes("titles")) {
    nextSort = "title-asc";
    notes.push("Sorting by job title");
  } else if (value.includes("recent") || value.includes("newest")) {
    nextSort = "newest";
    notes.push("Sorting by newest");
  }

  if (value.includes("outreach ready")) {
    nextFilters.hasEmail = "yes";
    nextSort = "relevance";
    notes.push("Focused on outreach-ready contacts");
  }

  if (value.includes('"')) {
    const quoted = value.match(/"([^"]+)"/);
    if (quoted?.[1]) {
      nextQuery = quoted[1];
      notes.push(`Searching for "${quoted[1]}"`);
    }
  }

  if (!notes.length) {
    notes.push("Applied best-effort search and ranking.");
  }

  return {
    query: nextQuery,
    filters: nextFilters,
    sort: nextSort,
    summary: notes.join(" • ")
  };
}

export function ContactsWorkspace({
  initialContacts,
  initialCompanies,
  initialGlobalFields,
  initialPrivateFields,
  initialDisplayedFieldIds
}: {
  initialContacts: ContactRecord[];
  initialCompanies: CompanyOption[];
  initialGlobalFields: PeopleFieldDefinition[];
  initialPrivateFields: PeopleFieldDefinition[];
  initialDisplayedFieldIds: string[];
}) {
  const router = useRouter();
  const { confirm: requestConfirmation, confirmationDialog } = useConfirmAction();
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [contacts, setContacts] = useState(initialContacts);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [sortOption, setSortOption] = useState<SortOption>("relevance");
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAiPromptModal, setShowAiPromptModal] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [saveSearchName, setSaveSearchName] = useState("");
  const [showSaveSearchModal, setShowSaveSearchModal] = useState(false);
  const [importText, setImportText] = useState(emptyImportText);
  const [importFeedback, setImportFeedback] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [activeViewName, setActiveViewName] = useState("Default view");
  const [showFieldsPanel, setShowFieldsPanel] = useState(false);
  const [actionMenuContactId, setActionMenuContactId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [fieldPanelView, setFieldPanelView] = useState<"fields" | "create">("fields");
  const [globalFields, setGlobalFields] = useState<PeopleFieldDefinition[]>(initialGlobalFields);
  const [privateFields, setPrivateFields] = useState<PeopleFieldDefinition[]>(initialPrivateFields);
  const [displayedFieldIds, setDisplayedFieldIds] = useState<string[]>(initialDisplayedFieldIds.length ? initialDisplayedFieldIds : defaultDisplayedFieldIds);
  const [createFieldForm, setCreateFieldForm] = useState<CreateFieldForm>(emptyCreateFieldForm);
  const [showFieldTypeOptions, setShowFieldTypeOptions] = useState(false);
  const [draggedFieldId, setDraggedFieldId] = useState<string | null>(null);
  const [fieldFeedback, setFieldFeedback] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(16);
  const [isImportPending, startImportTransition] = useTransition();
  const [isDeletePending, setIsDeletePending] = useState<string | null>(null);
  const [isBulkDeletePending, setIsBulkDeletePending] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const deferredQuery = useDeferredValue(query);
  useCommandKFocus(searchInputRef);

  useEffect(() => {
    setContacts(initialContacts);
  }, [initialContacts]);

  useEffect(() => {
    setGlobalFields(initialGlobalFields);
  }, [initialGlobalFields]);

  useEffect(() => {
    setPrivateFields(initialPrivateFields);
  }, [initialPrivateFields]);

  useEffect(() => {
    setDisplayedFieldIds(initialDisplayedFieldIds.length ? initialDisplayedFieldIds : defaultDisplayedFieldIds);
  }, [initialDisplayedFieldIds]);

  useEffect(() => {
    if (!actionMenuContactId) {
      return;
    }

    const handleWindowClick = () => setActionMenuContactId(null);
    window.addEventListener("click", handleWindowClick);

    return () => window.removeEventListener("click", handleWindowClick);
  }, [actionMenuContactId]);

  useEffect(() => {
    if (!actionFeedback) {
      return;
    }

    const timeoutId = window.setTimeout(() => setActionFeedback(null), 2800);
    return () => window.clearTimeout(timeoutId);
  }, [actionFeedback]);

  useEffect(() => {
    try {
      const storedSavedSearches = window.localStorage.getItem(savedSearchesStorageKey);

      if (storedSavedSearches) {
        const parsed = JSON.parse(storedSavedSearches) as SavedSearch[];
        setSavedSearches(Array.isArray(parsed) ? parsed : []);
      }
    } catch {
      setSavedSearches([]);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(savedSearchesStorageKey, JSON.stringify(savedSearches));
  }, [hydrated, savedSearches]);

  const customFields = useMemo(() => [...globalFields, ...privateFields], [globalFields, privateFields]);
  const allFields = useMemo(() => [...builtInFields, ...customFields], [customFields]);
  const fieldMap = useMemo(() => new Map(allFields.map((field) => [field.id, field])), [allFields]);

  const visibleFields = useMemo(
    () =>
      displayedFieldIds
        .map((fieldId) => fieldMap.get(fieldId))
        .filter((field): field is PeopleFieldDefinition => Boolean(field)),
    [displayedFieldIds, fieldMap]
  );

  const filteredContacts = useMemo(() => {
    const searched = contacts.filter((contact) => {
      const customValueText = Object.values(contact.customFields)
        .flatMap((value) => (Array.isArray(value) ? value : value === null || value === undefined ? [] : [String(value)]))
        .join(" ");
      const haystack = `${contact.fullName} ${contact.title || ""} ${contact.email || ""} ${contact.company?.name || ""} ${contact.location || ""} ${contact.stage || ""} ${customValueText}`.toLowerCase();
      if (!haystack.includes(deferredQuery.trim().toLowerCase())) {
        return false;
      }

      if (filters.company && contact.company?.name !== filters.company) {
        return false;
      }

      if (filters.stage && (contact.stage || "") !== filters.stage) {
        return false;
      }

      if (filters.hasEmail === "yes" && !contact.email) {
        return false;
      }

      if (filters.hasEmail === "no" && contact.email) {
        return false;
      }

      if (filters.hasPhone === "yes" && !contact.phone) {
        return false;
      }

      if (filters.hasPhone === "no" && contact.phone) {
        return false;
      }

      return true;
    });

    const next = [...searched];

    switch (sortOption) {
      case "name-asc":
        next.sort((left, right) => left.fullName.localeCompare(right.fullName));
        break;
      case "title-asc":
        next.sort((left, right) => (left.title || "").localeCompare(right.title || ""));
        break;
      case "company-asc":
        next.sort((left, right) => (left.company?.name || "").localeCompare(right.company?.name || ""));
        break;
      case "newest":
        next.reverse();
        break;
      default:
        next.sort((left, right) => {
          const leftScore = [
            left.email ? 2 : 0,
            left.phone ? 1 : 0,
            left.company ? 1 : 0,
            left.stage === "Qualified" ? 1 : 0
          ].reduce((sum, value) => sum + value, 0);
          const rightScore = [
            right.email ? 2 : 0,
            right.phone ? 1 : 0,
            right.company ? 1 : 0,
            right.stage === "Qualified" ? 1 : 0
          ].reduce((sum, value) => sum + value, 0);

          return rightScore - leftScore || left.fullName.localeCompare(right.fullName);
        });
        break;
    }

    return next;
  }, [contacts, deferredQuery, filters, sortOption]);

  useEffect(() => {
    setCurrentPage(1);
  }, [deferredQuery, filters, sortOption]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredContacts.length / pageSize));

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, filteredContacts.length, pageSize]);

  const paginatedContacts = useMemo(() => paginateItems(filteredContacts, currentPage, pageSize), [currentPage, filteredContacts, pageSize]);
  const hiddenFields = allFields.filter((field) => !displayedFieldIds.includes(field.id) && !field.required);
  const stageOptions = Array.from(new Set(contacts.map((contact) => contact.stage).filter(Boolean))) as string[];
  const companyOptions = Array.from(new Set(contacts.map((contact) => contact.company?.name).filter(Boolean))) as string[];
  const companyFilterSelectOptions = useMemo(
    () => [
      { value: "", label: "All companies", icon: <Building2 className={filterOptionIconClassName} /> },
      ...companyOptions.map((company) => ({
        value: company,
        label: company,
        icon: <Building2 className={filterOptionIconClassName} />
      }))
    ],
    [companyOptions]
  );
  const stageFilterSelectOptions = useMemo(
    () => [
      { value: "", label: "All stages", icon: <TextCursorInput className={filterOptionIconClassName} /> },
      ...stageOptions.map((stage) => ({
        value: stage,
        label: stage,
        icon: <TextCursorInput className={filterOptionIconClassName} />
      }))
    ],
    [stageOptions]
  );
  const emailStateFilterSelectOptions = useMemo(
    () => [
      { value: "all", label: "Any email state", icon: <Mail className={filterOptionIconClassName} /> },
      { value: "yes", label: "Has email", icon: <Mail className={filterOptionIconClassName} /> },
      { value: "no", label: "Missing email", icon: <Mail className={filterOptionIconClassName} /> }
    ],
    []
  );
  const phoneStateFilterSelectOptions = useMemo(
    () => [
      { value: "all", label: "Any phone state", icon: <Phone className={filterOptionIconClassName} /> },
      { value: "yes", label: "Has phone", icon: <Phone className={filterOptionIconClassName} /> },
      { value: "no", label: "Missing phone", icon: <Phone className={filterOptionIconClassName} /> }
    ],
    []
  );
  const sortSelectOptions = useMemo(
    () => [
      { value: "relevance", label: "Relevance", icon: <Search className={filterOptionIconClassName} /> },
      { value: "name-asc", label: "Name A-Z", icon: <TextCursorInput className={filterOptionIconClassName} /> },
      { value: "title-asc", label: "Job title", icon: <BookOpen className={filterOptionIconClassName} /> },
      { value: "company-asc", label: "Company", icon: <Building2 className={filterOptionIconClassName} /> },
      { value: "newest", label: "Newest", icon: <GripVertical className={filterOptionIconClassName} /> }
    ],
    []
  );
  const visibleEmailCount = useMemo(() => filteredContacts.filter((contact) => Boolean(contact.email)).length, [filteredContacts]);
  const visiblePhoneCount = useMemo(() => filteredContacts.filter((contact) => Boolean(contact.phone)).length, [filteredContacts]);
  const linkedCompanyCount = useMemo(() => filteredContacts.filter((contact) => Boolean(contact.company)).length, [filteredContacts]);
  const filteredContactIdSet = useMemo(() => new Set(filteredContacts.map((contact) => contact.id)), [filteredContacts]);
  const selectedContactIdSet = useMemo(() => new Set(selectedContactIds), [selectedContactIds]);
  const paginatedContactIds = useMemo(() => paginatedContacts.items.map((contact) => contact.id), [paginatedContacts.items]);
  const selectedContacts = useMemo(() => contacts.filter((contact) => selectedContactIdSet.has(contact.id)), [contacts, selectedContactIdSet]);
  const allPageContactsSelected = paginatedContactIds.length > 0 && paginatedContactIds.every((contactId) => selectedContactIdSet.has(contactId));
  const somePageContactsSelected = paginatedContactIds.some((contactId) => selectedContactIdSet.has(contactId));

  useEffect(() => {
    setSelectedContactIds((current) => current.filter((contactId) => filteredContactIdSet.has(contactId)));
  }, [filteredContactIdSet]);

  const toggleContactSelection = (contactId: string, checked: boolean) => {
    setSelectedContactIds((current) =>
      checked ? (current.includes(contactId) ? current : [...current, contactId]) : current.filter((id) => id !== contactId)
    );
  };

  const toggleAllPageContacts = (checked: boolean) => {
    setSelectedContactIds((current) => {
      if (checked) {
        const next = new Set(current);
        paginatedContactIds.forEach((contactId) => next.add(contactId));
        return Array.from(next);
      }

      return current.filter((contactId) => !paginatedContactIds.includes(contactId));
    });
  };

  const clearSelectedContacts = () => {
    setSelectedContactIds([]);
  };

  const persistFieldPreferences = async ({
    nextGlobalFields = globalFields,
    nextPrivateFields = privateFields,
    nextDisplayedFieldIds = displayedFieldIds
  }: {
    nextGlobalFields?: PeopleFieldDefinition[];
    nextPrivateFields?: PeopleFieldDefinition[];
    nextDisplayedFieldIds?: string[];
  }) => {
    try {
      const response = await fetch("/api/contacts/fields", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          globalFields: nextGlobalFields,
          privateFields: nextPrivateFields,
          displayedFieldIds: nextDisplayedFieldIds
        })
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to save field preferences");
      }

      setFieldFeedback(null);
    } catch (error) {
      setFieldFeedback(error instanceof Error ? error.message : "Unable to save field preferences.");
    }
  };

  const removeField = (fieldId: string) => {
    const field = fieldMap.get(fieldId);
    if (!field || field.required) {
      return;
    }

    const nextDisplayedFieldIds = displayedFieldIds.filter((id) => id !== fieldId);
    setDisplayedFieldIds(nextDisplayedFieldIds);
    void persistFieldPreferences({ nextDisplayedFieldIds });
  };

  const restoreField = (fieldId: string) => {
    const nextDisplayedFieldIds = displayedFieldIds.includes(fieldId) ? displayedFieldIds : [...displayedFieldIds, fieldId];
    setDisplayedFieldIds(nextDisplayedFieldIds);
    void persistFieldPreferences({ nextDisplayedFieldIds });
  };

  const handleFieldDrop = (targetFieldId: string) => {
    if (!draggedFieldId || draggedFieldId === targetFieldId) {
      return;
    }

    const nextDisplayedFieldIds = [...displayedFieldIds];
    const draggedIndex = nextDisplayedFieldIds.indexOf(draggedFieldId);
    const targetIndex = nextDisplayedFieldIds.indexOf(targetFieldId);

    if (draggedIndex === -1 || targetIndex === -1) {
      return;
    }

    nextDisplayedFieldIds.splice(draggedIndex, 1);
    nextDisplayedFieldIds.splice(targetIndex, 0, draggedFieldId);
    setDisplayedFieldIds(nextDisplayedFieldIds);
    void persistFieldPreferences({ nextDisplayedFieldIds });
  };

  const applySearchConfig = (name: string, nextQuery: string, nextFilters: Filters, nextSort: SortOption) => {
    setQuery(nextQuery);
    setFilters(nextFilters);
    setSortOption(nextSort);
    setActiveViewName(name);
    setShowViewMenu(false);
  };

  const handleDeleteContact = async (contact: ContactRecord) => {
    const confirmed = await requestConfirmation({
      title: "Move contact to trash?",
      description: `${contact.fullName} will be moved to the trash bin and can be restored from Settings.`,
      confirmLabel: "Move to trash"
    });
    if (!confirmed) {
      return;
    }

    setActionMenuContactId(null);
    setIsDeletePending(contact.id);

    try {
      const response = await fetch(`/api/contacts/${contact.id}`, { method: "DELETE" });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to delete contact");
      }

      setContacts((current) => current.filter((c) => c.id !== contact.id));
      setActionFeedback({ tone: "success", message: "Contact moved to trash." });
      router.refresh();
    } catch (error) {
      setActionFeedback({ tone: "error", message: error instanceof Error ? error.message : "Unable to delete contact." });
    } finally {
      setIsDeletePending(null);
    }
  };

  const handleDownloadSample = () => {
    const blob = new Blob([emptyImportText()], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "sample_contacts.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        setImportText(text);
      }
    };
    reader.readAsText(file);
    // Reset input so the same file could be selected again if needed
    event.target.value = "";
  };

  const handleExport = () => {
    exportContacts(filteredContacts, visibleFields, "contacts.xlsx");
  };

  const handleExportSelectedContacts = () => {
    if (!selectedContacts.length) {
      return;
    }

    exportContacts(selectedContacts, visibleFields, "selected-contacts.xlsx");
    setActionFeedback({ tone: "success", message: `Exported ${selectedContacts.length} selected contact${selectedContacts.length === 1 ? "" : "s"}.` });
  };

  const handleSaveSearch = () => {
    if (!saveSearchName.trim()) {
      return;
    }

    const nextSavedSearch: SavedSearch = {
      id: `${normalizePeopleFieldId(saveSearchName)}-${Date.now()}`,
      name: saveSearchName.trim(),
      query,
      filters,
      sort: sortOption
    };

    setSavedSearches((current) => [nextSavedSearch, ...current]);
    setActiveViewName(nextSavedSearch.name);
    setSaveSearchName("");
    setShowSaveSearchModal(false);
  };

  const handleCreateField = () => {
    setFieldFeedback(null);

    if (!createFieldForm.name.trim()) {
      setFieldFeedback("Field name is required.");
      return;
    }

    if (!createFieldForm.type) {
      setFieldFeedback("Field type is required.");
      return;
    }

    const normalizedId = normalizePeopleFieldId(createFieldForm.name);
    if (!normalizedId) {
      setFieldFeedback("Field name is invalid.");
      return;
    }

    if (allFields.some((field) => field.id === normalizedId)) {
      setFieldFeedback("A field with this name already exists.");
      return;
    }

    const options = createFieldForm.options.map((option) => option.trim()).filter(Boolean);
    if ((createFieldForm.type === "singleSelect" || createFieldForm.type === "multiPicklist") && options.length === 0) {
      setFieldFeedback("Picklist fields need at least one option.");
      return;
    }

    const newField: PeopleFieldDefinition = {
      id: normalizedId,
      label: createFieldForm.name.trim(),
      type: createFieldForm.type,
      builtIn: false,
      scope: createFieldForm.scope,
      options
    };

    const nextGlobalFields = createFieldForm.scope === "global" ? [...globalFields, newField] : globalFields;
    const nextPrivateFields = createFieldForm.scope === "private" ? [...privateFields, newField] : privateFields;
    const nextDisplayedFieldIds = displayedFieldIds.includes(newField.id) ? displayedFieldIds : [...displayedFieldIds, newField.id];

    if (createFieldForm.scope === "global") {
      setGlobalFields(nextGlobalFields);
    } else {
      setPrivateFields(nextPrivateFields);
    }

    setDisplayedFieldIds(nextDisplayedFieldIds);
    setCreateFieldForm(emptyCreateFieldForm());
    setFieldPanelView("fields");
    setShowFieldTypeOptions(false);
    void persistFieldPreferences({
      nextGlobalFields,
      nextPrivateFields,
      nextDisplayedFieldIds
    });
  };

  const handleImport = () => {
    startImportTransition(() => {
      void (async () => {
        setImportFeedback(null);
        const rows = parseImportRows(importText);

        if (!rows.length) {
          setImportFeedback("Add a valid CSV header and at least one row.");
          return;
        }

        const createdContacts: ContactRecord[] = [];

        for (const row of rows) {
          if (!row.firstName || !row.lastName) {
            continue;
          }

          const response = await fetch("/api/contacts", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(row)
          });

          const payload = (await response.json().catch(() => null)) as ContactRecord | { error?: string } | null;

          if (!response.ok) {
            throw new Error((payload as { error?: string } | null)?.error || "Import failed");
          }

          createdContacts.push(payload as ContactRecord);
        }

        if (!createdContacts.length) {
          setImportFeedback("No valid contacts were created from the import.");
          return;
        }

        setContacts((current) => [...createdContacts.reverse(), ...current]);
        setImportFeedback(`Imported ${createdContacts.length} contacts.`);
      })().catch((error) => {
        setImportFeedback(error instanceof Error ? error.message : "Import failed.");
      });
    });
  };

  const handleAiPrompt = () => {
    if (!aiPrompt.trim()) {
      setAiFeedback("Add a prompt first.");
      return;
    }

    const result = derivePromptResult(aiPrompt, contacts, initialCompanies);
    applySearchConfig("AI prompt result", result.query, result.filters, result.sort);
    setAiFeedback(result.summary);
  };

  const handleCopyValue = async (value: string | null | undefined, label: string) => {
    if (!value) {
      setActionFeedback({ tone: "error", message: `No ${label.toLowerCase()} is saved for this contact.` });
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setActionFeedback({ tone: "success", message: `${label} copied to clipboard.` });
    } catch {
      setActionFeedback({ tone: "error", message: `Unable to copy ${label.toLowerCase()}.` });
    }
  };

  const handleCopySelectedValues = async (values: string[], emptyMessage: string, successLabel: string) => {
    if (!values.length) {
      setActionFeedback({ tone: "error", message: emptyMessage });
      return;
    }

    try {
      await navigator.clipboard.writeText(values.join(", "));
      setActionFeedback({ tone: "success", message: `${successLabel} copied.` });
    } catch {
      setActionFeedback({ tone: "error", message: `Unable to copy ${successLabel.toLowerCase()}.` });
    }
  };

  const handleEmailSelectedContacts = () => {
    const emails = selectedContacts
      .map((contact) => contact.email)
      .filter((email): email is string => Boolean(email));

    if (!emails.length) {
      setActionFeedback({ tone: "error", message: "No email addresses are available for the selected contacts." });
      return;
    }

    const params = new URLSearchParams({
      compose: "new",
      to: emails.join(","),
      subject: "Follow up"
    });

    window.location.assign(`/inbox?${params.toString()}`);
  };

  const handleDeleteSelectedContacts = async () => {
    if (!selectedContacts.length) {
      return;
    }

    const confirmed = await requestConfirmation({
      title: "Move selected contacts to trash?",
      description: `${selectedContacts.length} contact${selectedContacts.length === 1 ? "" : "s"} will be moved to the trash bin and can be restored from Settings.`,
      confirmLabel: "Move to trash"
    });

    if (!confirmed) {
      return;
    }

    setIsBulkDeletePending(true);
    setActionMenuContactId(null);

    const results = await Promise.allSettled(
      selectedContacts.map(async (contact) => {
        const response = await fetch(`/api/contacts/${contact.id}`, { method: "DELETE" });
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;

        if (!response.ok) {
          throw new Error(payload?.error || "Unable to delete contact");
        }

        return contact.id;
      })
    );

    const deletedIds = results
      .filter((result): result is PromiseFulfilledResult<string> => result.status === "fulfilled")
      .map((result) => result.value);
    const failedCount = results.length - deletedIds.length;

    if (deletedIds.length) {
      const deletedIdSet = new Set(deletedIds);
      setContacts((current) => current.filter((contact) => !deletedIdSet.has(contact.id)));
      setSelectedContactIds((current) => current.filter((contactId) => !deletedIdSet.has(contactId)));
    }

    setIsBulkDeletePending(false);

    if (!deletedIds.length) {
      setActionFeedback({ tone: "error", message: "Unable to delete selected contacts." });
      return;
    }

    setActionFeedback({
      tone: failedCount ? "error" : "success",
      message: failedCount
        ? `Moved ${deletedIds.length} contact${deletedIds.length === 1 ? "" : "s"} to trash. ${failedCount} failed.`
        : `Moved ${deletedIds.length} contact${deletedIds.length === 1 ? "" : "s"} to trash.`
    });
    router.refresh();
  };

  const renderFieldCell = (contact: ContactRecord, field: PeopleFieldDefinition): ReactNode => {
    switch (field.id) {
      case "name":
        return (
          <Link href={`/contacts/${contact.id}` as Route} className="font-medium text-slate-900 hover:text-[#386df4]">
            {contact.fullName}
          </Link>
        );
      case "title":
        return contact.title || <span className="text-slate-300">-</span>;
      case "company":
        return contact.company ? (
          <Link href={`/companies/${contact.company.id}` as Route} className="flex items-center gap-3 hover:text-[#386df4]">
            <CompanyLogo
              name={contact.company.name}
              logoUrl={contact.company.logoUrl}
              className="h-6 w-6 rounded-none object-contain"
              fallbackClassName={`flex items-center justify-center rounded-md text-xs font-semibold ${companyBadge(contact.company.name)}`}
            />
            <span className="text-slate-800">{contact.company.name}</span>
          </Link>
        ) : (
          <span className="text-slate-400">Independent</span>
        );
      case "email":
        return contact.email ? (
          <Link href={composeEmailHref(contact) as Route} className="flex items-center gap-2 hover:text-[#386df4]">
            <span>{contact.email}</span>
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-500">+0</span>
          </Link>
        ) : (
          <Link href={`/contacts/${contact.id}` as Route} className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[12px] text-slate-700 hover:bg-slate-50">
            <Mail className="h-3.5 w-3.5" />
            Add email
          </Link>
        );
      case "phone":
        return contact.phone ? (
          <a href={`tel:${contact.phone}`} className="flex items-center gap-2 hover:text-[#386df4]">
            <span>{contact.phone}</span>
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-500">+0</span>
          </a>
        ) : (
          <Link href={`/contacts/${contact.id}` as Route} className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[12px] text-slate-700 hover:bg-slate-50">
            <Phone className="h-3.5 w-3.5" />
            Add mobile
          </Link>
        );
      case "actions":
        return (
          <div className="flex flex-wrap items-center gap-1">
            <Link
              href={`/contacts/${contact.id}` as Route}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[12px] text-slate-700 hover:bg-slate-50"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Open
            </Link>
            {contact.email ? (
              <Link href={composeEmailHref(contact) as Route} className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[12px] text-slate-700 hover:bg-slate-50">
                <Mail className="h-3.5 w-3.5" />
                Email
              </Link>
            ) : (
              <button
                disabled
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[12px] text-slate-400 disabled:cursor-not-allowed"
              >
                <Mail className="h-3.5 w-3.5" />
                Email
              </button>
            )}
          </div>
        );
      default:
        return renderCustomFieldValue(contact, field);
    }
  };

  return (
    <div className="relative">
      <div className="mb-3 flex flex-col gap-3 border-b border-slate-200 pb-3 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-[1.6rem] font-semibold tracking-tight text-slate-900">People</h1>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExport}
            className="crm-btn crm-btn-secondary"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="crm-btn crm-btn-secondary"
          >
            <Upload className="h-3.5 w-3.5" />
            Import
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="crm-btn crm-btn-primary"
          >
            <Plus className="h-3.5 w-3.5" />
            Create contact
          </button>
        </div>
      </div>

      <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowFilterBar((current) => !current)}
            className="crm-btn crm-btn-secondary"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {showFilterBar ? "Hide filters" : "Show filters"}
          </button>
          <AppSelect
            className="h-[2.25rem] min-w-[140px] rounded-[0.7rem] border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700"
            value={sortOption}
            onChange={(event) => setSortOption(event.target.value as SortOption)}
            options={sortSelectOptions}
            menuMinWidth={156}
            hideMenuIcons
          />
          <button
            onClick={() => {
              setShowFieldsPanel(true);
              setFieldPanelView("fields");
            }}
            className="crm-btn crm-btn-secondary inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
          >
            <Settings2 className="h-3.5 w-3.5" />
            Manage fields
          </button>
        </div>

        <div className="relative min-w-[220px] sm:min-w-[280px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input ref={searchInputRef} className={`${inputClassName} pl-9 pr-14`} placeholder="Search" value={query} onChange={(event) => setQuery(event.target.value)} />
            <SearchHotkeyButton inputRef={searchInputRef} />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
        <span>
          Showing <span className="font-semibold text-slate-900">{filteredContacts.length}</span> of{" "}
          <span className="font-semibold text-slate-900">{contacts.length}</span> people
        </span>
        <span>
          With email <span className="font-semibold text-slate-900">{visibleEmailCount}</span>
        </span>
        <span>
          With phone <span className="font-semibold text-slate-900">{visiblePhoneCount}</span>
        </span>
        <span>
          Linked to companies <span className="font-semibold text-slate-900">{linkedCompanyCount}</span>
        </span>
      </div>

      {actionFeedback ? (
        <div
          className={`mb-3 rounded-xl border px-4 py-2.5 text-sm ${
            actionFeedback.tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-600"
          }`}
        >
          {actionFeedback.message}
        </div>
      ) : null}

      {selectedContacts.length ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#c8d8ff] bg-[#f8fbff] px-4 py-3">
          <div className="text-sm font-medium text-slate-700">
            {selectedContacts.length} contact{selectedContacts.length === 1 ? "" : "s"} selected
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleEmailSelectedContacts}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
            >
              <Mail className="h-3.5 w-3.5" />
              Email selected
            </button>
            <button
              onClick={() =>
                void handleCopySelectedValues(
                  selectedContacts.map((contact) => contact.email).filter((email): email is string => Boolean(email)),
                  "No email addresses are available for the selected contacts.",
                  "Emails"
                )
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
            >
              <Clipboard className="h-3.5 w-3.5" />
              Copy emails
            </button>
            <button
              onClick={() =>
                void handleCopySelectedValues(
                  selectedContacts.map((contact) => contact.phone).filter((phone): phone is string => Boolean(phone)),
                  "No phone numbers are available for the selected contacts.",
                  "Phone numbers"
                )
              }
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
            >
              <Phone className="h-3.5 w-3.5" />
              Copy phones
            </button>
            <button
              onClick={handleExportSelectedContacts}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" />
              Export selected
            </button>
            <button
              onClick={() => void handleDeleteSelectedContacts()}
              disabled={isBulkDeletePending}
              className="crm-btn crm-btn-danger disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isBulkDeletePending ? "Deleting..." : "Delete selected"}
            </button>
            <button
              onClick={clearSelectedContacts}
              className="crm-btn crm-btn-secondary text-slate-500 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
        </div>
      ) : null}

      {showFilterBar ? (
        <div className="mb-4 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 lg:grid-cols-[1fr_1fr_180px_180px_auto]">
          <AppSelect
            className={inputClassName}
            value={filters.company}
            onChange={(event) => setFilters((current) => ({ ...current, company: event.target.value }))}
            options={companyFilterSelectOptions}
            hideMenuIcons
          />
          <AppSelect
            className={inputClassName}
            value={filters.stage}
            onChange={(event) => setFilters((current) => ({ ...current, stage: event.target.value }))}
            options={stageFilterSelectOptions}
            hideMenuIcons
          />
          <AppSelect
            className={inputClassName}
            value={filters.hasEmail}
            onChange={(event) => setFilters((current) => ({ ...current, hasEmail: event.target.value as Filters["hasEmail"] }))}
            options={emailStateFilterSelectOptions}
            hideMenuIcons
          />
          <AppSelect
            className={inputClassName}
            value={filters.hasPhone}
            onChange={(event) => setFilters((current) => ({ ...current, hasPhone: event.target.value as Filters["hasPhone"] }))}
            options={phoneStateFilterSelectOptions}
            hideMenuIcons
          />
          <button
            onClick={() => {
              setFilters(emptyFilters());
              setQuery("");
              setSortOption("relevance");
              setActiveViewName("Default view");
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
          >
            <X className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      ) : null}

      <Card className="overflow-hidden p-0">
        <div className="w-full overflow-x-auto">
          <table className="min-w-full border border-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr className="[&>th]:border-b [&>th]:border-slate-200/80">
                <th className="w-10 border-r border-slate-200/80 px-3 py-3 font-medium">
                  <SelectionCheckbox
                    aria-label="Select all contacts on this page"
                    checked={allPageContactsSelected}
                    indeterminate={!allPageContactsSelected && somePageContactsSelected}
                    onChange={(event) => toggleAllPageContacts(event.target.checked)}
                  />
                </th>
                {visibleFields.map((field, index) => (
                  <th key={field.id} className={headerClassName(index < visibleFields.length - 1)}>
                    {field.label}
                  </th>
                ))}
                <th className="w-10 px-3 py-4 font-medium">
                  <button
                    onClick={() => {
                      setShowFieldsPanel(true);
                      setFieldPanelView("fields");
                    }}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="[&>tr:not(:last-child)>td]:border-b [&>tr:not(:last-child)>td]:border-slate-200/80">
              {paginatedContacts.items.map((contact) => {
                const menuOpen = actionMenuContactId === contact.id;
                const rowSelected = selectedContactIdSet.has(contact.id);

                return (
                <tr key={contact.id} className={`text-slate-700 ${rowSelected ? "bg-[#f8fbff]" : ""}`}>
                  <td className="border-r border-slate-200/80 px-3 py-3 align-top">
                    <SelectionCheckbox
                      aria-label={`Select ${contact.fullName}`}
                      checked={rowSelected}
                      onChange={(event) => toggleContactSelection(contact.id, event.target.checked)}
                      className="mt-1"
                    />
                  </td>
                  {visibleFields.map((field, index) => (
                    <td key={`${contact.id}-${field.id}`} className={cellClassName(index < visibleFields.length - 1)}>
                      {renderFieldCell(contact, field)}
                    </td>
                  ))}
                  <td className="px-2.5 py-3 align-top">
                    <TableActionMenu
                      open={menuOpen}
                      onOpenChange={(nextOpen) => setActionMenuContactId(nextOpen ? contact.id : null)}
                      minWidth={200}
                      ariaLabel={`Open actions for ${contact.fullName}`}
                    >
                          {contact.phone ? (
                            <a href={`tel:${contact.phone}`} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">
                              <Phone className="h-4 w-4" />
                              Call contact
                            </a>
                          ) : (
                            <button
                              disabled
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-400 disabled:cursor-not-allowed"
                            >
                              <Phone className="h-4 w-4" />
                              Call contact
                            </button>
                          )}
                          {contact.company ? (
                            <Link
                              href={`/companies/${contact.company.id}` as Route}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <Building2 className="h-4 w-4" />
                              View company
                            </Link>
                          ) : (
                            <button
                              disabled
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-400 disabled:cursor-not-allowed"
                            >
                              <Building2 className="h-4 w-4" />
                              View company
                            </button>
                          )}
                          <Link
                            href={composePipelineHref(contact) as Route}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Plus className="h-4 w-4" />
                            Add to pipeline
                          </Link>
                          {contact.linkedinUrl ? (
                            <a
                              href={contact.linkedinUrl.startsWith("http") ? contact.linkedinUrl : `https://${contact.linkedinUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <Linkedin className="h-4 w-4" />
                              Open LinkedIn
                            </a>
                          ) : (
                            <button
                              disabled
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-400 disabled:cursor-not-allowed"
                            >
                              <Linkedin className="h-4 w-4" />
                              Open LinkedIn
                            </button>
                          )}
                          <button
                            onClick={() => void handleCopyValue(contact.email, "Email")}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Clipboard className="h-4 w-4" />
                            Copy email
                          </button>
                          <button
                            onClick={() => void handleCopyValue(contact.phone, "Phone")}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Clipboard className="h-4 w-4" />
                            Copy phone
                          </button>
                          <button
                            onClick={() => void handleDeleteContact(contact)}
                            disabled={isDeletePending === contact.id}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            {isDeletePending === contact.id ? "Deleting..." : "Delete"}
                          </button>
                    </TableActionMenu>
                  </td>
                </tr>
              )})}
              {!paginatedContacts.items.length ? (
                <tr>
                  <td colSpan={visibleFields.length + 2} className="px-6 py-12 text-center text-sm text-slate-500">
                    No people match the current search and filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <PaginationControls
          currentPage={paginatedContacts.safePage}
          pageSize={pageSize}
          pageSizeOptions={[8, 16, 24, 32]}
          totalItems={filteredContacts.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={(value) => {
            setPageSize(value);
            setCurrentPage(1);
          }}
        />
      </Card>

      {showAiPromptModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[rgba(15,23,42,0.2)] px-4 py-8 sm:px-6">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-[1.45rem] font-semibold tracking-tight text-slate-900">Run AI prompt</h2>
              <button onClick={() => setShowAiPromptModal(false)} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 px-6 py-5">
              <textarea
                rows={8}
                className={`${inputClassName} min-h-[200px] resize-none`}
                placeholder='Try: "show qualified contacts at shopify with email" or "missing mobile for directors"'
                value={aiPrompt}
                onChange={(event) => setAiPrompt(event.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                {["Outreach ready contacts", "Missing mobile at Netflix", "Qualified people with email", 'Find "manager" contacts'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setAiPrompt(suggestion)}
                    className="rounded-full bg-[#eef4ff] px-3 py-1.5 text-sm text-[#386df4] hover:bg-[#dfe9ff]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              {aiFeedback ? <div className="rounded-xl border border-[#c8d8ff] bg-[#eef4ff] px-4 py-3 text-sm text-[#386df4]">{aiFeedback}</div> : null}
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button onClick={() => setShowAiPromptModal(false)} className="crm-btn crm-btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleAiPrompt}
                disabled={!aiPrompt.trim()}
                className="rounded-xl bg-[#386df4] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Apply prompt
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {showImportModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[rgba(15,23,42,0.2)] px-4 py-8 sm:px-6">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-[1.45rem] font-semibold tracking-tight text-slate-900">Import contacts</h2>
              <button onClick={() => setShowImportModal(false)} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 px-6 py-5">
              <div className="flex flex-col gap-4">
                <div className="text-sm leading-6 text-slate-500">
                  Upload a CSV file with columns like <code>firstName,lastName,email,title,companyName,phone,stage,location</code>.
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleDownloadSample}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Download className="h-4 w-4" />
                    Download sample CSV
                  </button>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#c8d8ff] bg-[#eef4ff] px-3 py-2 text-sm font-medium text-[#386df4] hover:bg-[#dfe9ff]">
                    <Upload className="h-4 w-4" />
                    Upload CSV file
                    <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
              </div>
              
              {importText !== emptyImportText() && importText.trim().length > 0 ? (
                 <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                   File loaded and ready to import.
                 </div>
              ) : null}

              {importFeedback ? <div className="rounded-xl border border-[#c8d8ff] bg-[#eef4ff] px-4 py-3 text-sm text-[#386df4]">{importFeedback}</div> : null}
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button onClick={() => setShowImportModal(false)} className="crm-btn crm-btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={isImportPending || importText === emptyImportText() || !importText.trim()}
                className="rounded-xl bg-[#386df4] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isImportPending ? "Importing..." : "Import contacts"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showSaveSearchModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[rgba(15,23,42,0.2)] px-4 py-8 sm:px-6">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-[1.45rem] font-semibold tracking-tight text-slate-900">Save as new search</h2>
              <button onClick={() => setShowSaveSearchModal(false)} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 px-6 py-5">
              <input
                className={inputClassName}
                placeholder="Search name"
                value={saveSearchName}
                onChange={(event) => setSaveSearchName(event.target.value)}
              />
              <div className="text-sm text-slate-500">This saves the current query, filters, and sort order to your browser.</div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button onClick={() => setShowSaveSearchModal(false)} className="crm-btn crm-btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleSaveSearch}
                disabled={!saveSearchName.trim()}
                className="rounded-xl bg-[#386df4] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Save search
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showFieldsPanel ? (
        <div className="fixed inset-y-0 right-0 z-50 w-full border-l border-slate-200 bg-white sm:w-[520px]">
          {fieldPanelView === "fields" ? (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5">
                <h2 className="text-[1.55rem] font-semibold tracking-tight text-slate-900">Fields</h2>
                <button onClick={() => setShowFieldsPanel(false)} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
                <div className="mb-6 text-sm text-slate-600">
                  Displayed field <span className="ml-2 rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-500">{visibleFields.length}</span>
                </div>

                <div className="space-y-3">
                  {visibleFields.map((field) => (
                    <div
                      key={field.id}
                      draggable={!field.required}
                      onDragStart={() => setDraggedFieldId(field.id)}
                      onDragOver={(event: DragEvent<HTMLDivElement>) => event.preventDefault()}
                      onDrop={() => handleFieldDrop(field.id)}
                      onDragEnd={() => setDraggedFieldId(null)}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-3 ${
                        field.required ? "border-slate-100 bg-slate-50 text-slate-300" : "border-slate-200 bg-white"
                      }`}
                    >
                      <GripVertical className={`h-4 w-4 ${field.required ? "text-slate-300" : "text-slate-400"}`} />
                      <div className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800">
                        {field.label}
                      </div>
                      <button
                        onClick={() => removeField(field.id)}
                        disabled={field.required}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {hiddenFields.length ? (
                  <div className="mt-8">
                    <div className="mb-3 text-sm font-medium text-slate-500">Hidden fields</div>
                    <div className="flex flex-wrap gap-2">
                      {hiddenFields.map((field) => (
                        <button
                          key={field.id}
                          onClick={() => restoreField(field.id)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Plus className="h-4 w-4" />
                          {field.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <button
                  onClick={() => {
                    setFieldPanelView("create");
                    setCreateFieldForm(emptyCreateFieldForm());
                    setFieldFeedback(null);
                    setShowFieldTypeOptions(false);
                  }}
                  className="mt-6 crm-btn crm-btn-secondary"
                >
                  <Plus className="h-4 w-4" />
                  Add fields
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setFieldPanelView("fields");
                      setShowFieldTypeOptions(false);
                    }}
                    className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                  >
                    <ChevronDown className="h-5 w-5 rotate-90" />
                  </button>
                  <h2 className="text-[1.55rem] font-semibold tracking-tight text-slate-900">Create field</h2>
                </div>
                <button onClick={() => setShowFieldsPanel(false)} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {showFieldTypeOptions ? (
                  <div className="px-4 py-5 sm:px-6 sm:py-6">
                    <div className="mb-4 text-[1.02rem] font-medium text-slate-900">Select fields type</div>
                    <div className="space-y-2">
                      {fieldTypeOptions.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => {
                            setCreateFieldForm((current) => ({ ...current, type: option.id }));
                            setShowFieldTypeOptions(false);
                          }}
                          className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm ${
                            createFieldForm.type === option.id
                              ? "border-[#386df4] bg-[#386df4] text-white shadow-[inset_0_0_0_2px_rgba(255,255,255,0.9)]"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <TextCursorInput className="h-4 w-4" />
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-5 px-4 py-5 sm:px-6 sm:py-6">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-600">Field name</label>
                        <input
                          className={inputClassName}
                          placeholder="Enter a name"
                          value={createFieldForm.name}
                          onChange={(event) => setCreateFieldForm((current) => ({ ...current, name: event.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-600">Field type</label>
                        <button
                          onClick={() => setShowFieldTypeOptions(true)}
                          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 hover:bg-slate-50"
                        >
                          <span>{createFieldForm.type ? typeLabel(createFieldForm.type) : "Select field type"}</span>
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        </button>
                        <div className="mt-2 text-sm text-slate-400">Field type cannot be changed after the field is created</div>
                      </div>

                      {createFieldForm.type === "singleSelect" || createFieldForm.type === "multiPicklist" ? (
                        <div>
                          <div className="mb-3 text-sm font-medium text-slate-600">Custom picklist value set</div>
                          <div className="space-y-3">
                            {createFieldForm.options.map((option, index) => (
                              <div key={`picklist-${index}`} className="flex items-center gap-3">
                                <GripVertical className="h-4 w-4 text-slate-400" />
                                <input
                                  className={`${inputClassName} flex-1`}
                                  placeholder={`Option ${index + 1}`}
                                  value={option}
                                  onChange={(event) =>
                                    setCreateFieldForm((current) => ({
                                      ...current,
                                      options: current.options.map((item, itemIndex) => (itemIndex === index ? event.target.value : item))
                                    }))
                                  }
                                />
                                <button
                                  onClick={() =>
                                    setCreateFieldForm((current) => ({
                                      ...current,
                                      options: current.options.filter((_, itemIndex) => itemIndex !== index)
                                    }))
                                  }
                                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-50"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() => setCreateFieldForm((current) => ({ ...current, options: [...current.options, ""] }))}
                            className="mt-4 crm-btn crm-btn-secondary"
                          >
                            <Plus className="h-4 w-4" />
                            Add option
                          </button>
                        </div>
                      ) : null}
                    </div>

                    <div className="border-t border-slate-200 px-4 py-5 sm:px-6 sm:py-6">
                      <div className="mb-4 text-[1.05rem] font-medium text-slate-900">Save field as</div>
                      <div className="space-y-4">
                        <label className="flex cursor-pointer items-start gap-3">
                          <input
                            type="radio"
                            name="fieldScope"
                            checked={createFieldForm.scope === "global"}
                            onChange={() => setCreateFieldForm((current) => ({ ...current, scope: "global" }))}
                            className="mt-1 h-4 w-4 border-slate-300 text-[#386df4]"
                          />
                          <div>
                            <div className="text-sm font-medium text-slate-800">Global custom field</div>
                            <div className="mt-1 text-sm text-slate-400">This field will be visible to everyone</div>
                          </div>
                        </label>
                        <label className="flex cursor-pointer items-start gap-3">
                          <input
                            type="radio"
                            name="fieldScope"
                            checked={createFieldForm.scope === "private"}
                            onChange={() => setCreateFieldForm((current) => ({ ...current, scope: "private" }))}
                            className="mt-1 h-4 w-4 border-slate-300 text-[#386df4]"
                          />
                          <div>
                            <div className="text-sm font-medium text-slate-800">Private field</div>
                            <div className="mt-1 text-sm text-slate-400">This field will be private to you</div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {fieldFeedback ? <div className="border-t border-slate-200 px-4 py-4 text-sm text-[#386df4] sm:px-6">{fieldFeedback}</div> : null}

              {!showFieldTypeOptions ? (
                <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 px-4 py-4 sm:px-6">
                  <button
                    onClick={() => setFieldPanelView("fields")}
                    className="crm-btn crm-btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateField}
                    disabled={
                      !createFieldForm.name.trim() ||
                      !createFieldForm.type ||
                      ((createFieldForm.type === "singleSelect" || createFieldForm.type === "multiPicklist") &&
                        createFieldForm.options.every((option) => !option.trim()))
                    }
                    className="rounded-xl bg-[#386df4] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Save
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      ) : null}

      <ContactFormModal
        open={showCreateModal}
        companies={initialCompanies}
        customFields={customFields}
        onClose={() => setShowCreateModal(false)}
        onCreated={(contact) => setContacts((current) => [contact, ...current])}
      />
      {confirmationDialog}
    </div>
  );
}

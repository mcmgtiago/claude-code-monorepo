"use client";

import { AppSelect } from "@/components/app-select";
import { AppCombobox } from "@/components/app-combobox";
import { AppDatePicker } from "@/components/app-date-time-picker";
import type { Route } from "next";
import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import {
  Activity,
  AlignLeft,
  BellRing,
  Building2,
  CalendarDays,
  Check,
  CheckSquare,
  ChevronDown,
  Cog,
  DollarSign,
  Download,
  Grid2x2,
  LayoutList,
  Mail,
  MessageSquare,
  MessagesSquare,
  Paperclip,
  Phone,
  Plus,
  Search,
  SlidersHorizontal,
  StickyNote,
  Target,
  Trash2,
  User,
  Users,
  Waypoints,
  X
} from "lucide-react";
import { Card } from "@/components/card";
import { CompanyLogo } from "@/components/company-logo";
import { useConfirmAction } from "@/components/confirm-action-modal";
import { FeedbackToast } from "@/components/feedback-toast";
import { LeadRemindersPanel, type LeadReminderRecord } from "@/components/lead-reminders-panel";
import { RelatedEmailModal } from "@/components/related-email-modal";
import { useCommandKFocus } from "@/components/search-hotkey";
import { UserAvatar } from "@/components/user-avatar";
import type { LeadAttachment } from "@/lib/lead-attachments";
import { canControlLead, LEAD_CONTROL_DENIED_MESSAGE } from "@/lib/lead-permissions";
import { leadStatusLabels, leadStatuses, leadStatusTones, type LeadStatusValue } from "@/lib/crm";
import { exportToExcel } from "@/lib/export-excel";
import { formatLocalizedCurrency, formatLocalizedDate, type WorkspaceLocalizationSettings } from "@/lib/localization";
import { assigneeTone } from "@/lib/team";

type PipelineLead = {
  id: string;
  contactId: string | null;
  contactName: string | null;
  name: string;
  summary: string;
  companyId: string | null;
  company: string | null;
  companyLogoUrl?: string | null;
  email: string | null;
  phone: string | null;
  source: string | null;
  status: LeadStatusValue;
  sortOrder: number;
  value: number;
  score: number;
  dueDate: string | Date | null;
  attachmentsCount: number;
  attachments: LeadAttachment[];
  assignedUsers: string[];
  assignedUserIds: string[];
  notes: Array<{ id: string; body: string }>;
  tasks: Array<{ id: string; title: string; status: string; dueDate?: Date | string | null }>;
  reminders: LeadReminderRecord[];
};

type CompanyOption = {
  id: string;
  name: string;
};

type TeamMemberOption = {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
};

type ContactOption = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  companyId: string | null;
  companyName: string | null;
};

type LeadFormState = {
  contactId: string;
  name: string;
  summary: string;
  email: string;
  phone: string;
  companyId: string;
  company: string;
  source: string;
  status: LeadStatusValue;
  value: string;
  score: string;
  dueDate: string;
  assignedUserIds: string[];
  note: string;
};

const leadSourceOptions = [
  "Inbound",
  "Outbound",
  "Referral",
  "Website",
  "LinkedIn",
  "Email",
  "Ads",
  "Event",
  "Partner",
  "Existing Customer",
  "Manual Entry",
  "Other"
];

type CardDropPlacement = "before" | "after";
type TableSortOption = "name-asc" | "company-asc" | "value-desc" | "due-date-asc" | "stage";

const stageDropdownStyles: Record<LeadStatusValue, { accent: string; badge: string; surface: string }> = {
  NEW: {
    accent: "bg-slate-400",
    badge: "bg-slate-200 text-slate-600",
    surface: "bg-[linear-gradient(180deg,rgba(238,244,255,0.95),rgba(246,248,252,0.92))]"
  },
  QUALIFIED: {
    accent: "bg-emerald-400",
    badge: "bg-cyan-50 text-cyan-700",
    surface: "bg-[linear-gradient(180deg,rgba(231,248,255,0.95),rgba(243,249,255,0.92))]"
  },
  PROPOSAL: {
    accent: "bg-indigo-400",
    badge: "bg-indigo-50 text-indigo-700",
    surface: "bg-[linear-gradient(180deg,rgba(238,240,255,0.95),rgba(246,247,255,0.92))]"
  },
  NEGOTIATION: {
    accent: "bg-amber-400",
    badge: "bg-amber-50 text-amber-700",
    surface: "bg-[linear-gradient(180deg,rgba(255,247,232,0.95),rgba(255,251,243,0.92))]"
  },
  WON: {
    accent: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700",
    surface: "bg-[linear-gradient(180deg,rgba(236,251,242,0.95),rgba(245,252,247,0.92))]"
  },
  LOST: {
    accent: "bg-rose-400",
    badge: "bg-rose-50 text-rose-700",
    surface: "bg-[linear-gradient(180deg,rgba(255,239,241,0.95),rgba(255,246,247,0.92))]"
  }
};

function StageDropdown({
  value,
  onChange,
  disabled = false
}: {
  value: LeadStatusValue;
  onChange: (status: LeadStatusValue) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ left: number; top: number; width: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const tone = stageDropdownStyles[value];

  const updateMenuPosition = () => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const viewportPadding = 12;
    const menuHeight = 256;
    const menuWidth = Math.max(rect.width, 204);
    const availableBelow = window.innerHeight - rect.bottom;
    const preferredTop = availableBelow < menuHeight && rect.top > menuHeight ? rect.top - menuHeight - 8 : rect.bottom + 8;
    const top = Math.min(
      Math.max(viewportPadding, preferredTop),
      Math.max(viewportPadding, window.innerHeight - menuHeight - viewportPadding)
    );

    setMenuPosition({
      left: Math.max(viewportPadding, Math.min(rect.left, window.innerWidth - menuWidth - viewportPadding)),
      top,
      width: menuWidth
    });
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    updateMenuPosition();

    const closeOnPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }

      setOpen(false);
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    window.addEventListener("pointerdown", closeOnPointerDown);
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("pointerdown", closeOnPointerDown);
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open]);

  const menu = open && menuPosition
    ? createPortal(
        <div
          ref={menuRef}
          role="listbox"
          aria-label="Change lead stage"
          className="fixed z-[90] overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_14px_34px_rgba(15,23,42,0.12)]"
          style={{ left: menuPosition.left, top: menuPosition.top, width: menuPosition.width }}
        >
          <div className="grid gap-1">
            {leadStatuses.map((status) => {
              const active = status === value;
              const optionTone = stageDropdownStyles[status];

              return (
                <button
                  key={status}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    setOpen(false);
                    if (!active) {
                      onChange(status);
                    }
                  }}
                  className={`group relative flex h-10 w-full items-center gap-2.5 rounded-lg border px-2.5 text-left transition ${
                    active
                      ? `border-slate-200 ${optionTone.surface}`
                      : "border-transparent bg-white hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span className={`h-4.5 w-1 shrink-0 rounded-full ${optionTone.accent}`} />
                  <span className="min-w-0 flex-1 truncate text-[0.9rem] font-medium text-slate-800">{leadStatusLabels[status]}</span>
                  {active ? (
                    <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-lg ${optionTone.badge}`}>
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          if (!disabled) {
            setOpen((current) => !current);
          }
        }}
        className="relative inline-flex h-8 min-w-[8.75rem] items-center rounded-lg border border-slate-200 bg-white py-0 pl-2.5 pr-8 text-sm font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className={`h-4.5 w-1 shrink-0 rounded-full ${tone.accent}`} />
          <span className="truncate">{leadStatusLabels[value]}</span>
        </span>
        <ChevronDown className={`pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {menu}
    </>
  );
}

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/20 hover:border-slate-300";

const compactInputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/10 hover:border-slate-300";

const inputWithIconClassName =
  "w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/20 hover:border-slate-300";

const inputIconWrapperClassName = "absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none";

const selectClassName = `${inputClassName} pr-10 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_10px_center]`;

const LEAD_ORDER_STEP = 1000;
const UNASSIGNED_FILTER_VALUE = "__UNASSIGNED__";
const filterOptionIconClassName = "h-3.5 w-3.5 text-slate-400";
const stageRank = Object.fromEntries(leadStatuses.map((status, index) => [status, index])) as Record<LeadStatusValue, number>;

const tableSortSelectOptions = [
  { value: "name-asc", label: "Lead name", icon: <User className={filterOptionIconClassName} /> },
  { value: "company-asc", label: "Company", icon: <Building2 className={filterOptionIconClassName} /> },
  { value: "value-desc", label: "Highest value", icon: <DollarSign className={filterOptionIconClassName} /> },
  { value: "due-date-asc", label: "Due date", icon: <CalendarDays className={filterOptionIconClassName} /> },
  { value: "stage", label: "Stage", icon: <Target className={filterOptionIconClassName} /> }
] as const;

function comparePipelineLeads(left: PipelineLead, right: PipelineLead) {
  if (left.sortOrder !== right.sortOrder) {
    return left.sortOrder - right.sortOrder;
  }

  return 0;
}

function sortPipelineLeads(leads: PipelineLead[]) {
  return [...leads].sort(comparePipelineLeads);
}

function updateLeadCollection(
  leads: PipelineLead[],
  leadId: string,
  updater: (lead: PipelineLead) => PipelineLead
) {
  return sortPipelineLeads(leads.map((lead) => (lead.id === leadId ? updater(lead) : lead)));
}

function replaceLeadInCollection(leads: PipelineLead[], updatedLead: PipelineLead) {
  return sortPipelineLeads(leads.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead)));
}

function appendLeadToCollection(leads: PipelineLead[], nextLead: PipelineLead) {
  return sortPipelineLeads([...leads, nextLead]);
}

function compareLeadText(left: string | null | undefined, right: string | null | undefined) {
  return (left || "").localeCompare(right || "", undefined, { sensitivity: "base" });
}

function compareLeadDates(left: string | Date | null, right: string | Date | null) {
  const leftValue = left ? new Date(left).getTime() : Number.POSITIVE_INFINITY;
  const rightValue = right ? new Date(right).getTime() : Number.POSITIVE_INFINITY;
  return leftValue - rightValue;
}

function sortDisplayedLeads(leads: PipelineLead[], sortOption: TableSortOption) {
  const next = [...leads];

  switch (sortOption) {
    case "company-asc":
      return next.sort((left, right) => compareLeadText(left.company, right.company) || compareLeadText(left.name, right.name));
    case "value-desc":
      return next.sort((left, right) => right.value - left.value || compareLeadText(left.name, right.name));
    case "due-date-asc":
      return next.sort((left, right) => compareLeadDates(left.dueDate, right.dueDate) || compareLeadText(left.name, right.name));
    case "stage":
      return next.sort((left, right) => (stageRank[left.status] ?? 0) - (stageRank[right.status] ?? 0) || compareLeadText(left.name, right.name));
    case "name-asc":
    default:
      return next.sort((left, right) => compareLeadText(left.name, right.name) || compareLeadText(left.company, right.company));
  }
}

function getNextStageSortOrder(leads: PipelineLead[], status: LeadStatusValue, excludeLeadId?: string) {
  const stageLeads = leads.filter((lead) => lead.status === status && lead.id !== excludeLeadId);
  const maxSortOrder = stageLeads.reduce((max, lead) => Math.max(max, lead.sortOrder), 0);
  return maxSortOrder + LEAD_ORDER_STEP;
}

function getSortOrderBetween(previous?: number, next?: number) {
  if (previous === undefined && next === undefined) {
    return LEAD_ORDER_STEP;
  }

  if (previous === undefined) {
    return next! - LEAD_ORDER_STEP;
  }

  if (next === undefined) {
    return previous + LEAD_ORDER_STEP;
  }

  return previous + (next - previous) / 2;
}

function getDropSortOrder(
  leads: PipelineLead[],
  status: LeadStatusValue,
  movingLeadId: string,
  targetLeadId?: string,
  placement: CardDropPlacement = "after"
) {
  const stageLeads = leads.filter((lead) => lead.status === status && lead.id !== movingLeadId).sort(comparePipelineLeads);

  if (!targetLeadId) {
    return getNextStageSortOrder(leads, status, movingLeadId);
  }

  const targetIndex = stageLeads.findIndex((lead) => lead.id === targetLeadId);

  if (targetIndex === -1) {
    return getNextStageSortOrder(leads, status, movingLeadId);
  }

  const insertionIndex = placement === "before" ? targetIndex : targetIndex + 1;
  return getSortOrderBetween(stageLeads[insertionIndex - 1]?.sortOrder, stageLeads[insertionIndex]?.sortOrder);
}

const boardColumns: Array<{
  key: LeadStatusValue;
  accent: string;
  countBadgeClass: string;
  backgroundClass: string;
}> = [
  {
    key: "NEW",
    accent: stageDropdownStyles.NEW.accent,
    countBadgeClass: stageDropdownStyles.NEW.badge,
    backgroundClass: stageDropdownStyles.NEW.surface
  },
  {
    key: "QUALIFIED",
    accent: stageDropdownStyles.QUALIFIED.accent,
    countBadgeClass: stageDropdownStyles.QUALIFIED.badge,
    backgroundClass: stageDropdownStyles.QUALIFIED.surface
  },
  {
    key: "PROPOSAL",
    accent: stageDropdownStyles.PROPOSAL.accent,
    countBadgeClass: stageDropdownStyles.PROPOSAL.badge,
    backgroundClass: stageDropdownStyles.PROPOSAL.surface
  },
  {
    key: "NEGOTIATION",
    accent: stageDropdownStyles.NEGOTIATION.accent,
    countBadgeClass: stageDropdownStyles.NEGOTIATION.badge,
    backgroundClass: stageDropdownStyles.NEGOTIATION.surface
  },
  {
    key: "WON",
    accent: stageDropdownStyles.WON.accent,
    countBadgeClass: stageDropdownStyles.WON.badge,
    backgroundClass: stageDropdownStyles.WON.surface
  },
  {
    key: "LOST",
    accent: stageDropdownStyles.LOST.accent,
    countBadgeClass: stageDropdownStyles.LOST.badge,
    backgroundClass: stageDropdownStyles.LOST.surface
  }
];

function emptyLeadForm(status: LeadStatusValue = "NEW", defaultAssignedUserIds: string[] = []): LeadFormState {
  return {
    contactId: "",
    name: "",
    summary: "",
    email: "",
    phone: "",
    companyId: "",
    company: "",
    source: "",
    status,
    value: "",
    score: "",
    dueDate: "",
    assignedUserIds: defaultAssignedUserIds,
    note: ""
  };
}

function formFromLead(lead: PipelineLead): LeadFormState {
  return {
    contactId: lead.contactId || "",
    name: lead.name,
    summary: lead.summary || "",
    email: lead.email || "",
    phone: lead.phone || "",
    companyId: lead.companyId || "",
    company: lead.company || "",
    source: lead.source || "",
    status: lead.status,
    value: String(lead.value || 0),
    score: String(lead.score || 0),
    dueDate: lead.dueDate ? format(new Date(lead.dueDate), "yyyy-MM-dd") : "",
    assignedUserIds: lead.assignedUserIds || [],
    note: ""
  };
}

function formatDueLabel(value: string | Date | null, localization: WorkspaceLocalizationSettings) {
  if (!value) {
    return "No date";
  }

  return formatLocalizedDate(value, localization, "monthDay");
}

function toggleUser(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function matchCompanyOption(companies: CompanyOption[], value: string) {
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  return companies.find((company) => company.name.trim().toLowerCase() === normalized) || null;
}

function matchContactOption(contacts: ContactOption[], value: string) {
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  return contacts.find((contact) => contact.fullName.trim().toLowerCase() === normalized) || null;
}

function applySelectedContact(form: LeadFormState, contact: ContactOption): LeadFormState {
  return {
    ...form,
    contactId: contact.id,
    name: contact.fullName,
    email: contact.email || form.email,
    phone: contact.phone || form.phone,
    companyId: contact.companyId || form.companyId,
    company: contact.companyName || form.company
  };
}

function applySelectedCompany(form: LeadFormState, company: CompanyOption): LeadFormState {
  return {
    ...form,
    companyId: company.id,
    company: company.name
  };
}

async function parseJson<T>(response: Response) {
  const payload = (await response.json().catch(() => null)) as T | { error?: string } | null;

  if (!response.ok) {
    throw new Error((payload as { error?: string } | null)?.error || "Request failed");
  }

  return payload as T;
}

function formatFileSize(size: number) {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (size >= 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${size} B`;
}

async function uploadLeadFiles(leadId: string, files: File[]) {
  if (!files.length) {
    return [] as LeadAttachment[];
  }

  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const payload = await parseJson<{ attachments: LeadAttachment[] }>(
    await fetch(`/api/leads/${leadId}/attachments`, {
      method: "POST",
      body: formData
    })
  );

  return payload.attachments;
}

function LeadFormFields({
  form,
  companies,
  contacts,
  teamMembers,
  onChange,
  disabled = false
}: {
  form: LeadFormState;
  companies: CompanyOption[];
  contacts: ContactOption[];
  teamMembers: TeamMemberOption[];
  onChange: (next: LeadFormState) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <User className="h-4 w-4 text-[#386df4]" />
          Lead Details
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Person / lead name</label>
            <div className="relative">
              <User className={`${inputIconWrapperClassName} h-4 w-4`} />
              <AppCombobox
                className={inputWithIconClassName}
                disabled={disabled}
                value={form.name}
                options={contacts.map((contact) => ({
                  id: contact.id,
                  value: contact.fullName,
                  label: contact.fullName,
                  description: contact.companyName || contact.email || undefined
                }))}
                onValueChange={(nextValue) => {
                  const contact = matchContactOption(contacts, nextValue);

                  if (contact) {
                    onChange(applySelectedContact(form, contact));
                    return;
                  }

                  onChange({ ...form, name: nextValue, contactId: "" });
                }}
                onOptionSelect={(option) => {
                  const contact = contacts.find((item) => item.id === option.id) || matchContactOption(contacts, option.value);
                  onChange(contact ? applySelectedContact(form, contact) : { ...form, name: option.value, contactId: "" });
                }}
                placeholder="Select an existing person or type a new name"
                emptyLabel="No existing person. A new lead will be created."
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Company</label>
            <div className="relative">
              <Building2 className={`${inputIconWrapperClassName} h-4 w-4`} />
              <AppCombobox
                className={inputWithIconClassName}
                disabled={disabled}
                placeholder="Select an existing company or type a new one"
                value={form.company}
                options={companies.map((company) => ({
                  id: company.id,
                  value: company.name,
                  label: company.name
                }))}
                onValueChange={(nextValue) => {
                  const company = matchCompanyOption(companies, nextValue);
                  onChange(company ? applySelectedCompany(form, company) : { ...form, company: nextValue, companyId: "" });
                }}
                onOptionSelect={(option) => {
                  const company = companies.find((item) => item.id === option.id) || matchCompanyOption(companies, option.value);
                  onChange(company ? applySelectedCompany(form, company) : { ...form, company: option.value, companyId: "" });
                }}
                emptyLabel="No existing company. It will be created on save."
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Summary</label>
            <div className="relative">
              <AlignLeft className={`absolute left-3.5 top-3.5 text-slate-400 pointer-events-none h-4 w-4`} />
              <textarea
                rows={3}
                className={`${inputWithIconClassName} min-h-[92px] resize-none pt-3.5`}
                value={form.summary}
                disabled={disabled}
                onChange={(event) => onChange({ ...form, summary: event.target.value })}
                placeholder="Add the one-line context shown on the card."
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Email</label>
            <div className="relative">
              <Mail className={`${inputIconWrapperClassName} h-4 w-4`} />
              <input className={inputWithIconClassName} placeholder="lead@company.com" value={form.email} disabled={disabled} onChange={(event) => onChange({ ...form, email: event.target.value })} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Phone</label>
            <div className="relative">
              <Phone className={`${inputIconWrapperClassName} h-4 w-4`} />
              <input className={inputWithIconClassName} placeholder="+1 (555) 000-0000" value={form.phone} disabled={disabled} onChange={(event) => onChange({ ...form, phone: event.target.value })} />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Target className="h-4 w-4 text-[#386df4]" />
          Pipeline Information
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 lg:gap-2.5">
          <div className="md:col-span-2 lg:col-span-1">
            <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Source</label>
            <div className="relative">
              <Waypoints className={`${inputIconWrapperClassName} z-10 h-4 w-4`} />
              <AppSelect className={`${selectClassName} pl-10`} value={form.source} disabled={disabled} placeholder="Select source" onChange={(event) => onChange({ ...form, source: event.target.value })}>
                {leadSourceOptions.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </AppSelect>
            </div>
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Stage</label>
            <div className="relative">
              <AppSelect className={`${selectClassName} pl-10`} value={form.status} disabled={disabled} onChange={(event) => onChange({ ...form, status: event.target.value as LeadStatusValue })}>
                {leadStatuses.map((status) => (
                  <option key={status} value={status}>
                    {leadStatusLabels[status]}
                  </option>
                ))}
              </AppSelect>
              <Target className={`${inputIconWrapperClassName} h-4 w-4 z-10 pointer-events-none`} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Value</label>
            <div className="relative">
              <DollarSign className={`${inputIconWrapperClassName} h-4 w-4`} />
              <input className={inputWithIconClassName} placeholder="10000" type="number" min="0" disabled={disabled} value={form.value} onChange={(event) => onChange({ ...form, value: event.target.value })} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Score</label>
            <div className="relative">
              <Activity className={`${inputIconWrapperClassName} h-4 w-4`} />
              <input className={inputWithIconClassName} placeholder="50" type="number" min="0" max="100" disabled={disabled} value={form.score} onChange={(event) => onChange({ ...form, score: event.target.value })} />
            </div>
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Due date</label>
            <div className="relative">
              <CalendarDays className={`${inputIconWrapperClassName} h-4 w-4`} />
              <AppDatePicker className={inputWithIconClassName} value={form.dueDate} disabled={disabled} onChange={(dueDate) => onChange({ ...form, dueDate })} placeholder="Select due date" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Users className="h-4 w-4 text-[#386df4]" />
          Assignment
        </h3>
        <div className="space-y-4">
          <div>
            <label className="mb-2.5 block text-xs font-semibold uppercase text-slate-500">Assigned team</label>
            <div className="flex flex-wrap gap-2">
              {teamMembers.length ? teamMembers.map((user, index) => {
                const active = form.assignedUserIds.includes(user.id);

                return (
                  <button
                    key={user.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange({ ...form, assignedUserIds: toggleUser(form.assignedUserIds, user.id) })}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${
                      active ? "border-[#bcd0ff] bg-[#eef4ff] text-[#386df4]" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
                  >
                    <UserAvatar name={user.fullName} imageUrl={user.avatarUrl} className="h-6 w-6 text-[10px]" fallbackClassName={assigneeTone(index)} />
                    {user.fullName}
                  </button>
                );
              }) : <p className="text-sm text-slate-500">No active team members available yet.</p>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function LeadModal({
  open,
  form,
  companies,
  contacts,
  teamMembers,
  busy,
  stagedFiles,
  onClose,
  onChange,
  onSubmit,
  onFilesChange,
  onRemoveFile
}: {
  open: boolean;
  form: LeadFormState;
  companies: CompanyOption[];
  contacts: ContactOption[];
  teamMembers: TeamMemberOption[];
  busy: boolean;
  stagedFiles: File[];
  onClose: () => void;
  onChange: (next: LeadFormState) => void;
  onSubmit: () => void;
  onFilesChange: (files: File[]) => void;
  onRemoveFile: (fileName: string) => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[rgba(15,23,42,0.28)] px-4 py-8 backdrop-blur-[2px]">
      <div className="flex max-h-[calc(100vh-4rem)] w-full max-w-[800px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-[1.35rem] font-semibold tracking-tight text-slate-900">Create pipeline lead</h2>
          <button onClick={onClose} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:bg-slate-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200">
          <LeadFormFields form={form} companies={companies} contacts={contacts} teamMembers={teamMembers} onChange={onChange} />

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-slate-800">Attachments</div>
                <p className="mt-1 text-xs text-slate-500">Files upload after lead creation. Allowed: PDF, Office docs, images, TXT, CSV.</p>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                <Paperclip className="h-4 w-4" />
                Add files
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.csv"
                  className="hidden"
                  onChange={(event) => {
                    const nextFiles = Array.from(event.target.files || []);
                    if (nextFiles.length) {
                      onFilesChange([...stagedFiles, ...nextFiles]);
                    }
                    event.target.value = "";
                  }}
                />
              </label>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {stagedFiles.length ? (
                stagedFiles.map((file) => (
                  <span key={`${file.name}-${file.size}`} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] text-slate-600">
                    <Paperclip className="h-3 w-3" />
                    <span className="max-w-[180px] truncate">{file.name}</span>
                    <span className="text-slate-400">{formatFileSize(file.size)}</span>
                    <button type="button" onClick={() => onRemoveFile(file.name)} className="text-slate-400 hover:text-slate-700">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">No files staged yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end border-t border-slate-200 bg-white px-6 py-4">
          <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
            <button onClick={onClose} className="crm-btn crm-btn-secondary">
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={busy || !form.name.trim()}
              className="rounded-xl bg-[#386df4] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Creating..." : "Create lead"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditLeadModal({
  open,
  lead,
  form,
  companies,
  contacts,
  teamMembers,
  busy,
  attachmentsBusy,
  remindersBusy,
  onClose,
  onChange,
  onSubmit,
  onUploadAttachments,
  onDeleteAttachment,
  localization,
  onCreateReminder,
  onToggleReminder,
  onEditReminder,
  onDeleteReminder,
  onCreateNote,
  onDeleteNote,
  onCreateTask,
  onDeleteLead,
  canEdit,
  permissionHint
}: {
  open: boolean;
  lead: PipelineLead | null;
  form: LeadFormState;
  companies: CompanyOption[];
  contacts: ContactOption[];
  teamMembers: TeamMemberOption[];
  busy: boolean;
  attachmentsBusy: boolean;
  remindersBusy: boolean;
  onClose: () => void;
  onChange: (next: LeadFormState) => void;
  onSubmit: () => void;
  onUploadAttachments: (files: File[]) => void;
  onDeleteAttachment: (attachmentId: string) => void;
  localization: WorkspaceLocalizationSettings;
  onCreateReminder: (payload: { title: string; remindAt: string }) => void;
  onToggleReminder: (reminderId: string, completed: boolean) => void;
  onEditReminder: (reminderId: string, payload: { title: string; remindAt: string }) => void;
  onDeleteReminder: (reminderId: string) => void;
  onCreateNote: (body: string) => void;
  onDeleteNote: (noteId: string) => void;
  onCreateTask: (title: string) => void;
  onDeleteLead: () => void;
  canEdit: boolean;
  permissionHint: string;
}) {
  const [showRelatedEmailModal, setShowRelatedEmailModal] = useState(false);

  useEffect(() => {
    if (!open) {
      setShowRelatedEmailModal(false);
    }
  }, [open]);

  if (!open || !lead) {
    return null;
  }

  const composeLeadHref = lead.email
    ? (`/inbox?${new URLSearchParams({
        compose: "new",
        to: lead.email,
        subject: `Follow up with ${lead.name}`
      }).toString()}` as Route)
    : null;

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[rgba(15,23,42,0.28)] px-4 py-8 backdrop-blur-[2px]">
      <div className="flex max-h-[calc(100vh-4rem)] w-full max-w-[820px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-start justify-between gap-6 border-b border-slate-200 px-6 py-5">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-[1.55rem] font-semibold tracking-tight text-slate-900">{lead.name}</h2>
              <span className={`inline-flex rounded-full border px-4 py-1.5 text-sm ${leadStatusTones[lead.status]}`}>
                {leadStatusLabels[lead.status]}
              </span>
            </div>
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
              Update the pipeline record and keep the next action current.
            </p>
          </div>
          <button onClick={onClose} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:bg-slate-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto px-6 py-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200">
          <div className="rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,#fbfdff_0%,#f5f8ff_100%)] p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900">Email access</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {lead.email ? (
                    <span className="rounded-full border border-[#d7e4ff] bg-white px-3 py-1 text-xs font-medium text-slate-600">
                      {lead.email}
                    </span>
                  ) : (
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">
                      No email linked yet
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {composeLeadHref ? (
                  <Link
                    href={composeLeadHref}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <Mail className="h-4 w-4" />
                    Compose email
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={() => setShowRelatedEmailModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <MessagesSquare className="h-4 w-4" />
                  Email history
                </button>
              </div>
            </div>
          </div>

          {!canEdit ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {permissionHint}
            </div>
          ) : null}

          <LeadFormFields form={form} companies={companies} contacts={contacts} teamMembers={teamMembers} onChange={onChange} disabled={!canEdit} />

          <div className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="m-0 flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Paperclip className="h-4 w-4 text-[#386df4]" />
                    Attachments
                  </h3>
                  <label
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 ${
                      attachmentsBusy || !canEdit ? "pointer-events-none opacity-60" : ""
                    }`}
                  >
                    <Paperclip className="h-4 w-4" />
                    {attachmentsBusy ? "Uploading..." : "Upload files"}
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.csv"
                      className="hidden"
                      disabled={!canEdit}
                      onChange={(event) => {
                        const nextFiles = Array.from(event.target.files || []);
                        if (nextFiles.length) {
                          onUploadAttachments(nextFiles);
                        }
                        event.target.value = "";
                      }}
                    />
                  </label>
                </div>
                <div className="flex flex-1 flex-wrap content-start gap-2 text-sm text-slate-500">
                  {lead.attachments.length ? (
                    lead.attachments.map((attachment) => (
                      <span
                        key={attachment.id}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[12px] font-medium text-slate-600 transition hover:bg-slate-100"
                      >
                        <Paperclip className="h-3.5 w-3.5 text-slate-400" />
                        <span className="max-w-[170px] truncate">{attachment.fileName}</span>
                        <span className="text-slate-400">{formatFileSize(attachment.size)}</span>
                        {attachment.storageKey ? (
                          <a
                            href={`/api/leads/${lead.id}/attachments/${attachment.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-400 hover:text-slate-700"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </a>
                        ) : null}
                        {canEdit ? (
                          <button type="button" onClick={() => onDeleteAttachment(attachment.id)} className="text-slate-400 hover:text-rose-500">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        ) : null}
                      </span>
                    ))
                  ) : (
                    <p>No attachments added yet.</p>
                  )}
                </div>
              </div>

              <LeadRemindersPanel
                reminders={lead.reminders}
                localization={localization}
                busy={busy || remindersBusy}
                canEdit={canEdit}
                compact
                className="h-full"
                onCreate={onCreateReminder}
                onToggleComplete={onToggleReminder}
                onEdit={onEditReminder}
                onDelete={onDeleteReminder}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col h-full">
                <h3 className="mb-4 flex items-center justify-between gap-2 text-sm font-semibold text-slate-900">
                  <span className="flex items-center gap-2"><StickyNote className="h-4 w-4 text-[#386df4]" /> Notes</span>
                </h3>
                <div className="flex-1 space-y-3 text-sm text-slate-600 overflow-y-auto pr-1 mb-4 max-h-[220px]">
                  {lead.notes.length ? lead.notes.map((note) => (
                    <div key={note.id} className="group flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 transition sm:flex-row sm:items-start sm:justify-between hover:border-[#c8d8ff] hover:bg-[#eef4ff]">
                       <p className="whitespace-pre-wrap leading-relaxed text-slate-800 font-medium text-sm">{note.body}</p>
                       <div className="flex shrink-0">
                         <button
                           type="button"
                           onClick={() => onDeleteNote(note.id)}
                           disabled={busy || !canEdit}
                           className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition opacity-0 group-hover:opacity-100"
                         >
                           <Trash2 className="h-3.5 w-3.5" />
                           Delete
                         </button>
                       </div>
                    </div>
                  )) : <p>No notes added yet.</p>}
                </div>
                <div className="relative pt-3 border-t border-slate-100">
                   <div className="flex items-end gap-2">
                     <textarea
                       rows={2}
                       className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/10"
                       placeholder="Type a new note..."
                       id={`new-note-${lead.id}`}
                       disabled={busy || !canEdit}
                     />
                     <button
                       type="button"
                       disabled={busy || !canEdit}
                       onClick={() => {
                         const el = document.getElementById(`new-note-${lead.id}`) as HTMLTextAreaElement;
                         if (el.value.trim()) {
                           onCreateNote(el.value.trim());
                           el.value = '';
                         }
                       }}
                       className="rounded-xl shrink-0 bg-[#386df4] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60"
                     >
                        Add note
                     </button>
                   </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col h-full">
                <h3 className="mb-4 flex items-center justify-between gap-2 text-sm font-semibold text-slate-900">
                   <span className="flex items-center gap-2"><CheckSquare className="h-4 w-4 text-[#386df4]" /> Related tasks</span>
                </h3>
                <div className="space-y-3 text-sm text-slate-600 mb-4 overflow-y-auto pr-1 flex-1 max-h-[220px]">
                   {lead.tasks.length ? lead.tasks.map((task) => (
                      <Link
                        key={task.id}
                        href={`/tasks?taskId=${encodeURIComponent(task.id)}` as Route}
                        className="flex flex-col gap-1.5 rounded-xl border border-slate-100 bg-slate-50 p-4 text-left transition hover:border-[#c8d8ff] hover:bg-[#eef4ff]"
                      >
                         <div className="flex items-center justify-between gap-3">
                           <span className="font-medium text-slate-800 line-clamp-2">{task.title}</span>
                           <span className="text-[10px] uppercase font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">{task.status.replace("_", " ")}</span>
                         </div>
                      </Link>
                   )) : <p>No tasks linked yet.</p>}
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                     <input
                       type="text"
                       className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/10"
                       placeholder="Quick task title..."
                       id={`new-task-${lead.id}`}
                       disabled={busy || !canEdit}
                       onKeyDown={(e) => {
                         if (e.key === 'Enter') {
                            e.preventDefault();
                            const el = e.currentTarget;
                            if (el.value.trim()) {
                               onCreateTask(el.value.trim());
                               el.value = '';
                            }
                         }
                       }}
                     />
                     <button
                       type="button"
                       disabled={busy || !canEdit}
                       onClick={() => {
                         const el = document.getElementById(`new-task-${lead.id}`) as HTMLInputElement;
                         if (el.value.trim()) {
                           onCreateTask(el.value.trim());
                           el.value = '';
                         }
                       }}
                       className="rounded-xl shrink-0 bg-[#386df4] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60"
                     >
                        Add task
                     </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-6 py-4">
          <button
            type="button"
            onClick={onDeleteLead}
            disabled={busy || !canEdit}
            className="crm-btn rounded-xl border border-[#ffd1c4] bg-[#fff4f0] px-4 py-2.5 text-sm font-medium text-[#e25f37] transition hover:bg-[#ffe9e1] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
            Move to trash
          </button>

          <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
            <button onClick={onClose} className="crm-btn crm-btn-secondary">
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={busy || !canEdit}
              className="rounded-xl bg-[#386df4] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
      <RelatedEmailModal
        open={showRelatedEmailModal}
        onClose={() => setShowRelatedEmailModal(false)}
        leadId={lead.id}
        email={lead.email}
        title={`${lead.name} email history`}
        composeHref={composeLeadHref}
      />
    </>
  );
}

export function PipelineBoard({
  leads: initialLeads,
  companies,
  contacts,
  teamMembers,
  currentUserId,
  currentUserName,
  currentUserAccessRole,
  workspaceOwnerId,
  initialLeadDraft = null,
  localization
}: {
  leads: PipelineLead[];
  companies: CompanyOption[];
  contacts: ContactOption[];
  teamMembers: TeamMemberOption[];
  currentUserId: string;
  currentUserName: string;
  currentUserAccessRole: string;
  workspaceOwnerId: string | null;
  initialLeadDraft?: Partial<LeadFormState> | null;
  localization: WorkspaceLocalizationSettings;
}) {
  const { confirm: requestConfirmation, confirmationDialog } = useConfirmAction();
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const defaultAssignedUserIds = currentUserId ? [currentUserId] : teamMembers[0] ? [teamMembers[0].id] : [];
  const [leads, setLeads] = useState(() => sortPipelineLeads(initialLeads));
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<LeadStatusValue | "ALL">("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(initialLeads[0]?.id ?? null);
  const [editForm, setEditForm] = useState<LeadFormState>(initialLeads[0] ? formFromLead(initialLeads[0]) : emptyLeadForm("NEW", defaultAssignedUserIds));
  const [createForm, setCreateForm] = useState<LeadFormState>(() => emptyLeadForm("NEW", defaultAssignedUserIds));
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [createAttachmentFiles, setCreateAttachmentFiles] = useState<File[]>([]);
  const [viewMode, setViewMode] = useState<"board" | "table">("board");
  const [tableSortOption, setTableSortOption] = useState<TableSortOption>("name-asc");
  const [dragLeadId, setDragLeadId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<LeadStatusValue | null>(null);
  const [dragOverLead, setDragOverLead] = useState<{ leadId: string; placement: CardDropPlacement } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [attachmentsBusy, setAttachmentsBusy] = useState(false);
  const [remindersBusy, setRemindersBusy] = useState(false);
  const deferredQuery = useDeferredValue(query);
  const teamMemberById = useMemo(() => new Map(teamMembers.map((member) => [member.id, member])), [teamMembers]);
  const permissionHint = LEAD_CONTROL_DENIED_MESSAGE.replace("modify", "edit");
  const assigneeFilterOptions = useMemo(
    () =>
      Array.from(
        new Set([
          ...teamMembers.map((member) => member.fullName.trim()).filter(Boolean),
          ...leads.flatMap((lead) => lead.assignedUsers.map((user) => user.trim()).filter(Boolean))
        ])
      ).sort((left, right) => left.localeCompare(right)),
    [leads, teamMembers]
  );
  const sourceFilterOptions = useMemo(() => {
    const options: string[] = [];
    const seen = new Set<string>();

    const addOption = (value: string | null | undefined) => {
      const normalized = value?.trim();
      if (!normalized) {
        return;
      }

      const key = normalized.toLowerCase();
      if (seen.has(key)) {
        return;
      }

      seen.add(key);
      options.push(normalized);
    };

    leadSourceOptions.forEach(addOption);
    leads.forEach((lead) => addOption(lead.source));

    return options;
  }, [leads]);
  const stageFilterSelectOptions = useMemo(
    () => [
      { value: "ALL", label: "All stages", icon: <Target className={filterOptionIconClassName} /> },
      ...leadStatuses.map((status) => ({
        value: status,
        label: leadStatusLabels[status],
        icon: <Target className={filterOptionIconClassName} />
      }))
    ],
    []
  );
  const assigneeFilterSelectOptions = useMemo(
    () => [
      { value: "ALL", label: "All assignees", icon: <Users className={filterOptionIconClassName} /> },
      { value: UNASSIGNED_FILTER_VALUE, label: "Unassigned", icon: <User className={filterOptionIconClassName} /> },
      ...assigneeFilterOptions.map((assignee) => ({
        value: assignee,
        label: assignee,
        icon: <Users className={filterOptionIconClassName} />
      }))
    ],
    [assigneeFilterOptions]
  );
  const sourceFilterSelectOptions = useMemo(
    () => [
      { value: "ALL", label: "All sources", icon: <Waypoints className={filterOptionIconClassName} /> },
      ...sourceFilterOptions.map((source) => ({
        value: source,
        label: source,
        icon: <Waypoints className={filterOptionIconClassName} />
      }))
    ],
    [sourceFilterOptions]
  );
  const hasActiveFilters = query.trim().length > 0 || stageFilter !== "ALL" || assigneeFilter !== "ALL" || sourceFilter !== "ALL";
  useCommandKFocus(searchInputRef, { enabled: showFilters });
  const dragStartedRef = useRef(false);
  const prefillsAppliedRef = useRef(false);
  const boardScrollRef = useRef<HTMLDivElement | null>(null);
  const dragScrollVelocityRef = useRef(0);
  const dragScrollFrameRef = useRef<number | null>(null);

  function stopBoardDragScroll() {
    dragScrollVelocityRef.current = 0;
    if (dragScrollFrameRef.current !== null) {
      cancelAnimationFrame(dragScrollFrameRef.current);
      dragScrollFrameRef.current = null;
    }
  }

  function clearBoardDragState() {
    stopBoardDragScroll();
    setDragLeadId(null);
    setDragOverStage(null);
    setDragOverLead(null);
  }

  function startBoardDragScroll() {
    if (dragScrollFrameRef.current !== null) {
      return;
    }

    const step = () => {
      const container = boardScrollRef.current;
      const velocity = dragScrollVelocityRef.current;

      if (!container || !dragLeadId || velocity === 0) {
        dragScrollFrameRef.current = null;
        return;
      }

      const previousLeft = container.scrollLeft;
      container.scrollLeft += velocity;

      if (container.scrollLeft === previousLeft) {
        dragScrollFrameRef.current = null;
        return;
      }

      dragScrollFrameRef.current = requestAnimationFrame(step);
    };

    dragScrollFrameRef.current = requestAnimationFrame(step);
  }

  function updateBoardDragScroll(clientX: number) {
    const container = boardScrollRef.current;

    if (!container || !dragLeadId) {
      stopBoardDragScroll();
      return;
    }

    const rect = container.getBoundingClientRect();
    const edgeThreshold = Math.min(96, rect.width * 0.18);
    let nextVelocity = 0;

    if (clientX < rect.left + edgeThreshold) {
      const intensity = (rect.left + edgeThreshold - clientX) / edgeThreshold;
      nextVelocity = -Math.max(2.5, intensity * 18);
    } else if (clientX > rect.right - edgeThreshold) {
      const intensity = (clientX - (rect.right - edgeThreshold)) / edgeThreshold;
      nextVelocity = Math.max(2.5, intensity * 18);
    }

    dragScrollVelocityRef.current = nextVelocity;

    if (nextVelocity === 0) {
      stopBoardDragScroll();
      return;
    }

    startBoardDragScroll();
  }

  useEffect(() => {
    setLeads(sortPipelineLeads(initialLeads));
  }, [initialLeads]);

  useEffect(() => {
    if (!dragLeadId) {
      dragScrollVelocityRef.current = 0;
      if (dragScrollFrameRef.current !== null) {
        cancelAnimationFrame(dragScrollFrameRef.current);
        dragScrollFrameRef.current = null;
      }
      setDragOverLead(null);
    }
  }, [dragLeadId]);

  useEffect(() => {
    return () => {
      dragScrollVelocityRef.current = 0;
      if (dragScrollFrameRef.current !== null) {
        cancelAnimationFrame(dragScrollFrameRef.current);
        dragScrollFrameRef.current = null;
      }
    };
  }, []);

  const filteredLeads = useMemo(() => {
    const value = deferredQuery.trim().toLowerCase();

    return leads.filter((lead) => {
      const haystack = `${lead.name} ${lead.summary} ${lead.company || ""} ${lead.email || ""} ${lead.source || ""} ${lead.assignedUsers.join(" ")}`.toLowerCase();
      const matchesQuery = !value || haystack.includes(value);
      const matchesStage = stageFilter === "ALL" || lead.status === stageFilter;
      const matchesAssignee =
        assigneeFilter === "ALL"
          ? true
          : assigneeFilter === UNASSIGNED_FILTER_VALUE
            ? lead.assignedUsers.length === 0
            : lead.assignedUsers.includes(assigneeFilter);
      const matchesSource = sourceFilter === "ALL" || (lead.source || "").trim() === sourceFilter;
      return matchesQuery && matchesStage && matchesAssignee && matchesSource;
    });
  }, [assigneeFilter, deferredQuery, leads, sourceFilter, stageFilter]);

  const visibleLeads = useMemo(
    () => (viewMode === "board" ? filteredLeads : sortDisplayedLeads(filteredLeads, tableSortOption)),
    [filteredLeads, tableSortOption, viewMode]
  );

  const reorderingLocked = hasActiveFilters;

  const selectedLead = useMemo(
    () => filteredLeads.find((lead) => lead.id === selectedLeadId) ?? leads.find((lead) => lead.id === selectedLeadId) ?? null,
    [filteredLeads, leads, selectedLeadId]
  );
  const canControlLeadRecord = (lead: PipelineLead | null) =>
    Boolean(
      lead &&
        canControlLead(
          { id: currentUserId, fullName: currentUserName, accessRole: currentUserAccessRole },
          { createdById: workspaceOwnerId },
          lead
        )
    );
  const selectedLeadCanEdit = canControlLeadRecord(selectedLead);

  const assertLeadControl = (lead: PipelineLead | null) => {
    if (canControlLeadRecord(lead)) {
      return true;
    }

    setFeedback(permissionHint);
    return false;
  };

  useEffect(() => {
    if (!selectedLeadId && filteredLeads[0]) {
      setSelectedLeadId(filteredLeads[0].id);
    }
  }, [filteredLeads, selectedLeadId]);

  useEffect(() => {
    if (selectedLead) {
      setEditForm(formFromLead(selectedLead));
    }
  }, [selectedLead]);

  useEffect(() => {
    if (!initialLeadDraft || prefillsAppliedRef.current) {
      return;
    }

    prefillsAppliedRef.current = true;
    setCreateForm({
      ...emptyLeadForm("NEW", defaultAssignedUserIds),
      ...initialLeadDraft,
      assignedUserIds: initialLeadDraft.assignedUserIds?.length ? initialLeadDraft.assignedUserIds : defaultAssignedUserIds
    });
    setCreateAttachmentFiles([]);
    setShowCreateModal(true);
  }, [defaultAssignedUserIds, initialLeadDraft]);

  const activePipeline = filteredLeads.filter((lead) => !["WON", "LOST"].includes(lead.status));
  const totalPipelineValue = activePipeline.reduce((sum, lead) => sum + lead.value, 0);
  const avgScore = activePipeline.length ? Math.round(activePipeline.reduce((sum, lead) => sum + lead.score, 0) / activePipeline.length) : 0;

  const handleExportLeads = () => {
    const exportData = filteredLeads.map((lead) => ({
      "Lead Name": lead.name,
      "Summary": lead.summary || "",
      "Company": lead.company || "",
      "Contact Name": lead.contactName || "",
      "Email": lead.email || "",
      "Phone": lead.phone || "",
      "Source": lead.source || "",
      "Stage": leadStatusLabels[lead.status],
      "Value": lead.value,
      "Score": lead.score,
      "Due Date": formatDueLabel(lead.dueDate, localization),
      "Assigned Users": (lead.assignedUsers.length ? lead.assignedUsers : ["Unassigned"]).join(", "),
      "Attachments": lead.attachmentsCount,
      "Notes": lead.notes.length,
      "Open Reminders": lead.reminders.filter((reminder) => !reminder.completedAt).length
    }));

    exportToExcel(exportData, "pipeline-leads.xlsx");
  };

  const openCreateLead = (status: LeadStatusValue = "NEW") => {
    setCreateForm(emptyLeadForm(status, defaultAssignedUserIds));
    setCreateAttachmentFiles([]);
    setShowCreateModal(true);
  };

  const openEditLead = (leadId: string) => {
    const lead = leads.find((entry) => entry.id === leadId);

    if (!lead) {
      return;
    }

    setSelectedLeadId(leadId);
    setEditForm(formFromLead(lead));
    setShowEditModal(true);
  };

  const saveLead = () => {
    if (!selectedLead) {
      return;
    }

    if (!assertLeadControl(selectedLead)) {
      return;
    }

    void (async () => {
      setIsSaving(true);
      try {
        const updatedLead = await parseJson<PipelineLead>(
          await fetch(`/api/leads/${selectedLead.id}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              contactId: editForm.contactId,
              name: editForm.name,
              summary: editForm.summary,
              email: editForm.email,
              phone: editForm.phone,
              companyId: editForm.companyId,
              company: editForm.company,
              source: editForm.source,
              status: editForm.status,
              value: Number(editForm.value || 0),
              score: Number(editForm.score || 0),
              dueDate: editForm.dueDate ? new Date(`${editForm.dueDate}T09:00:00`).toISOString() : "",
              assignedUsers: editForm.assignedUserIds,
              note: editForm.note.trim() || undefined,
              lastContact: new Date().toISOString()
            })
          })
        );

        setLeads((current) => replaceLeadInCollection(current, updatedLead));
        setEditForm(formFromLead(updatedLead));
        setShowEditModal(false);
        setFeedback("Pipeline lead updated.");
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to update lead.");
      } finally {
        setIsSaving(false);
      }
    })();
  };

  const createLead = () => {
    void (async () => {
      setIsSaving(true);
      try {
        let lead = await parseJson<PipelineLead>(
          await fetch("/api/leads", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              contactId: createForm.contactId,
              name: createForm.name,
              summary: createForm.summary,
              email: createForm.email,
              phone: createForm.phone,
              companyId: createForm.companyId,
              company: createForm.company,
              source: createForm.source,
              status: createForm.status,
              value: Number(createForm.value || 0),
              score: Number(createForm.score || 0),
              dueDate: createForm.dueDate ? new Date(`${createForm.dueDate}T09:00:00`).toISOString() : "",
              assignedUsers: createForm.assignedUserIds,
              notes: createForm.note
            })
          })
        );

        if (createAttachmentFiles.length) {
          const attachments = await uploadLeadFiles(lead.id, createAttachmentFiles);
          lead = { ...lead, attachments, attachmentsCount: attachments.length };
        }

        setLeads((current) => appendLeadToCollection(current, lead));
        setSelectedLeadId(lead.id);
        setShowCreateModal(false);
        setCreateForm(emptyLeadForm("NEW", defaultAssignedUserIds));
        setCreateAttachmentFiles([]);
        setFeedback(createAttachmentFiles.length ? "Lead added and files uploaded." : "Lead added to pipeline.");
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to create lead.");
      } finally {
        setIsSaving(false);
      }
    })();
  };

  const deleteLead = () => {
    if (!selectedLead) {
      return;
    }

    if (!assertLeadControl(selectedLead)) {
      return;
    }

    void (async () => {
      const confirmed = await requestConfirmation({
        title: "Move lead to trash?",
        description: `Lead "${selectedLead.name}" will be moved to trash. Related reminders and notes will be removed, and linked tasks will remain available without this lead connection.`,
        confirmLabel: "Move to trash"
      });

      if (!confirmed) {
        return;
      }

      setIsSaving(true);
      try {
        await parseJson<{ ok: true }>(
          await fetch(`/api/leads/${selectedLead.id}`, {
            method: "DELETE"
          })
        );

        const nextLeads = leads.filter((lead) => lead.id !== selectedLead.id);
        setLeads(nextLeads);
        setSelectedLeadId((current) => (current === selectedLead.id ? nextLeads[0]?.id ?? null : current));
        setShowEditModal(false);
        setFeedback("Lead moved to trash.");
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to delete lead.");
      } finally {
        setIsSaving(false);
      }
    })();
  };

  const uploadAttachmentsForLead = (leadId: string, files: File[]) => {
    if (!files.length) {
      return;
    }

    const lead = leads.find((item) => item.id === leadId);
    if (!assertLeadControl(lead || null)) {
      return;
    }

    void (async () => {
      setAttachmentsBusy(true);
      try {
        const attachments = await uploadLeadFiles(leadId, files);
        setLeads((current) =>
          updateLeadCollection(current, leadId, (lead) => ({ ...lead, attachments, attachmentsCount: attachments.length }))
        );
        setFeedback("Attachments uploaded.");
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to upload attachment.");
      } finally {
        setAttachmentsBusy(false);
      }
    })();
  };

  const deleteAttachmentFromLead = (leadId: string, attachmentId: string) => {
    const lead = leads.find((item) => item.id === leadId);
    const attachment = lead?.attachments.find((item) => item.id === attachmentId);
    if (!assertLeadControl(lead || null)) {
      return;
    }
    void (async () => {
      const confirmed = await requestConfirmation({
        title: "Remove attachment?",
        description: attachment
          ? `Attachment "${attachment.fileName}" will be removed from this lead.`
          : "This attachment will be removed from this lead.",
        confirmLabel: "Remove attachment",
        tone: "warning"
      });
      if (!confirmed) {
        return;
      }

      setAttachmentsBusy(true);
      try {
        const payload = await parseJson<{ attachments: LeadAttachment[] }>(
          await fetch(`/api/leads/${leadId}/attachments/${attachmentId}`, {
            method: "DELETE"
          })
        );

        setLeads((current) =>
          updateLeadCollection(current, leadId, (lead) => ({
            ...lead,
            attachments: payload.attachments,
            attachmentsCount: payload.attachments.length
          }))
        );
        setFeedback("Attachment removed.");
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to remove attachment.");
      } finally {
        setAttachmentsBusy(false);
      }
    })();
  };

  const createNoteForLead = (leadId: string, body: string) => {
    const lead = leads.find((item) => item.id === leadId);
    if (!assertLeadControl(lead || null)) {
      return;
    }

    void (async () => {
      setIsSaving(true);
      try {
        const note = await parseJson<{ id: string; body: string }>(
          await fetch(`/api/leads/${leadId}/notes`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ body })
          })
        );
        setLeads((current) =>
          updateLeadCollection(current, leadId, (lead) => ({ ...lead, notes: [note, ...lead.notes] }))
        );
        setFeedback("Note added.");
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to add note.");
      } finally {
        setIsSaving(false);
      }
    })();
  };

  const deleteNoteFromLead = (leadId: string, noteId: string) => {
    const lead = leads.find((item) => item.id === leadId);
    const note = lead?.notes.find((item) => item.id === noteId);
    if (!assertLeadControl(lead || null)) {
      return;
    }
    void (async () => {
      const confirmed = await requestConfirmation({
        title: "Delete note?",
        description: note
          ? `This note will be deleted: "${note.body.slice(0, 80)}${note.body.length > 80 ? "..." : ""}"`
          : "This note will be deleted from the selected lead.",
        confirmLabel: "Delete note"
      });
      if (!confirmed) {
        return;
      }

      setIsSaving(true);
      try {
        await fetch(`/api/leads/${leadId}/notes/${noteId}`, { method: "DELETE" });
        setLeads((current) =>
          updateLeadCollection(current, leadId, (lead) => ({
            ...lead,
            notes: lead.notes.filter((note) => note.id !== noteId)
          }))
        );
        setFeedback("Note deleted.");
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to delete note.");
      } finally {
        setIsSaving(false);
      }
    })();
  };

  const createTaskForLead = (leadId: string, title: string) => {
    const lead = leads.find((item) => item.id === leadId);
    if (!assertLeadControl(lead || null)) {
      return;
    }

    void (async () => {
      setIsSaving(true);
      try {
        const task = await parseJson<{ id: string; title: string; status: string }>(
          await fetch(`/api/tasks`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ 
               title, 
               taskType: "Account Activity",
               priority: "MEDIUM", 
               leadId 
            })
          })
        );
        setLeads((current) =>
          updateLeadCollection(current, leadId, (lead) => ({ ...lead, tasks: [task, ...lead.tasks] }))
        );
        setFeedback("Task created.");
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to create task.");
      } finally {
        setIsSaving(false);
      }
    })();
  };

  const createReminderForLead = (leadId: string, payload: { title: string; remindAt: string }) => {
    const lead = leads.find((item) => item.id === leadId);
    if (!assertLeadControl(lead || null)) {
      return;
    }

    void (async () => {
      setRemindersBusy(true);
      try {
        const reminder = await parseJson<LeadReminderRecord>(
          await fetch(`/api/leads/${leadId}/reminders`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload)
          })
        );

        setLeads((current) =>
          updateLeadCollection(current, leadId, (lead) => ({ ...lead, reminders: [...lead.reminders, reminder] }))
        );
        setFeedback("Reminder added.");
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to add reminder.");
      } finally {
        setRemindersBusy(false);
      }
    })();
  };

  const toggleReminderForLead = (leadId: string, reminderId: string, completed: boolean) => {
    const lead = leads.find((item) => item.id === leadId);
    if (!assertLeadControl(lead || null)) {
      return;
    }

    void (async () => {
      setRemindersBusy(true);
      try {
        const reminder = await parseJson<LeadReminderRecord>(
          await fetch(`/api/leads/${leadId}/reminders/${reminderId}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ completed })
          })
        );

        setLeads((current) =>
          updateLeadCollection(current, leadId, (lead) => ({
            ...lead,
            reminders: lead.reminders.map((entry) => (entry.id === reminder.id ? reminder : entry))
          }))
        );
        setFeedback(completed ? "Reminder marked done." : "Reminder reopened.");
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to update reminder.");
      } finally {
        setRemindersBusy(false);
      }
    })();
  };

  const editReminderForLead = (leadId: string, reminderId: string, payload: { title: string; remindAt: string }) => {
    const lead = leads.find((item) => item.id === leadId);
    if (!assertLeadControl(lead || null)) {
      return;
    }

    void (async () => {
      setRemindersBusy(true);
      try {
        const reminder = await parseJson<LeadReminderRecord>(
          await fetch(`/api/leads/${leadId}/reminders/${reminderId}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload)
          })
        );
        setLeads((current) =>
          updateLeadCollection(current, leadId, (lead) => ({
            ...lead,
            reminders: lead.reminders.map((r) => (r.id === reminderId ? reminder : r))
          }))
        );
        setFeedback("Reminder updated.");
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to update reminder.");
      } finally {
        setRemindersBusy(false);
      }
    })();
  };

  const deleteReminderFromLead = (leadId: string, reminderId: string) => {
    const lead = leads.find((item) => item.id === leadId);
    const reminder = lead?.reminders.find((item) => item.id === reminderId);
    if (!assertLeadControl(lead || null)) {
      return;
    }
    void (async () => {
      const confirmed = await requestConfirmation({
        title: "Delete reminder?",
        description: reminder
          ? `Reminder "${reminder.title}" will be removed from this lead.`
          : "This reminder will be removed from this lead.",
        confirmLabel: "Delete reminder"
      });
      if (!confirmed) {
        return;
      }

      setRemindersBusy(true);
      try {
        await parseJson<{ ok: true }>(
          await fetch(`/api/leads/${leadId}/reminders/${reminderId}`, {
            method: "DELETE"
          })
        );

        setLeads((current) =>
          updateLeadCollection(current, leadId, (lead) => ({
            ...lead,
            reminders: lead.reminders.filter((entry) => entry.id !== reminderId)
          }))
        );
        setFeedback("Reminder deleted.");
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to delete reminder.");
      } finally {
        setRemindersBusy(false);
      }
    })();
  };

  const moveLead = (
    leadId: string,
    status: LeadStatusValue,
    targetLeadId?: string,
    placement: CardDropPlacement = "after"
  ) => {
    const lead = leads.find((entry) => entry.id === leadId);

    if (!lead) {
      clearBoardDragState();
      return;
    }

    if (!assertLeadControl(lead)) {
      clearBoardDragState();
      return;
    }

    if (targetLeadId === leadId) {
      clearBoardDragState();
      return;
    }

    if (reorderingLocked && targetLeadId && lead.status === status) {
      setFeedback("Clear search to reorder cards by drag.");
      clearBoardDragState();
      return;
    }

    const nextSortOrder = getDropSortOrder(leads, status, leadId, targetLeadId, placement);

    if (lead.status === status && lead.sortOrder === nextSortOrder) {
      clearBoardDragState();
      return;
    }

    const previousStatus = lead.status;
    const previousSortOrder = lead.sortOrder;
    setLeads((current) =>
      updateLeadCollection(current, leadId, (item) => ({ ...item, status, sortOrder: nextSortOrder }))
    );
    setSelectedLeadId(leadId);
    clearBoardDragState();

    void (async () => {
      try {
        const updatedLead = await parseJson<PipelineLead>(
          await fetch(`/api/leads/${leadId}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              status,
              sortOrder: nextSortOrder,
              ...(previousStatus !== status ? { lastContact: new Date().toISOString() } : {})
            })
          })
        );

        setLeads((current) => replaceLeadInCollection(current, updatedLead));
        setSelectedLeadId(updatedLead.id);
        if (previousStatus !== updatedLead.status) {
          setFeedback(`${updatedLead.name} moved to ${leadStatusLabels[updatedLead.status]}.`);
        }
      } catch (error) {
        setLeads((current) =>
          updateLeadCollection(current, leadId, (item) => ({
            ...item,
            status: previousStatus,
            sortOrder: previousSortOrder
          }))
        );
        setFeedback(error instanceof Error ? error.message : "Unable to move lead.");
      }
    })();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowFilters((current) => !current)}
            className="crm-btn crm-btn-secondary"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {showFilters ? "Hide filters" : "Show filters"}
          </button>
          <div className="inline-flex h-[2.25rem] items-center rounded-[0.7rem] border border-slate-200 bg-slate-50 p-[3px]">
            <button
              onClick={() => setViewMode("board")}
              className={`inline-flex h-full items-center gap-[0.4rem] rounded-md px-3 text-[0.8125rem] font-medium leading-[1.15] transition-colors ${
                viewMode === "board" ? "bg-[#eef4ff] text-[#386df4] shadow-[0_1px_2px_rgba(56,109,244,0.08)] ring-1 ring-[#386df4]/20" : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-700"
              }`}
            >
              <Grid2x2 className="h-[0.95rem] w-[0.95rem]" />
              Board
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`inline-flex h-full items-center gap-[0.4rem] rounded-md px-3 text-[0.8125rem] font-medium leading-[1.15] transition-colors ${
                viewMode === "table" ? "bg-[#eef4ff] text-[#386df4] shadow-[0_1px_2px_rgba(56,109,244,0.08)] ring-1 ring-[#386df4]/20" : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-700"
              }`}
            >
              <LayoutList className="h-[0.95rem] w-[0.95rem]" />
              Table
            </button>
          </div>
          {viewMode === "table" ? (
            <AppSelect
              className="h-[2.25rem] min-w-[140px] rounded-[0.7rem] border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700"
              value={tableSortOption}
              onChange={(event) => setTableSortOption(event.target.value as TableSortOption)}
              options={[...tableSortSelectOptions]}
              menuMinWidth={156}
              hideMenuIcons
            />
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="rounded-full bg-[#eef4ff] px-3 py-1.5 text-sm font-medium text-[#386df4]">
            {activePipeline.length} active opportunities
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
            {formatLocalizedCurrency(totalPipelineValue, localization)} open value
          </div>
          <div className="rounded-full bg-[#eef8f2] px-3 py-1.5 text-sm font-medium text-[#2f9d57]">
            Avg score {avgScore}
          </div>
          <button
            onClick={handleExportLeads}
            className="crm-btn crm-btn-secondary"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
          <button
            onClick={() => openCreateLead()}
            className="crm-btn crm-btn-primary"
          >
            <Plus className="h-3.5 w-3.5" />
            New lead
          </button>
        </div>
      </div>

      {feedback ? <FeedbackToast message={feedback} position="top-right" className="max-w-[min(32rem,calc(100vw-3rem))]" /> : null}

      {showFilters ? (
        <Card className="p-3">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.3fr)_220px_220px_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search pipeline"
                className={`${compactInputClassName} pl-9 pr-14`}
              />
            </div>
            <div className="relative">
              <AppSelect
                className={`${compactInputClassName} min-w-[190px]`}
                value={stageFilter}
                onChange={(event) => setStageFilter(event.target.value as LeadStatusValue | "ALL")}
                options={stageFilterSelectOptions}
                hideMenuIcons
              />
            </div>
            <div className="relative">
              <AppSelect
                className={`${compactInputClassName} min-w-[190px]`}
                value={assigneeFilter}
                onChange={(event) => setAssigneeFilter(event.target.value)}
                options={assigneeFilterSelectOptions}
                hideMenuIcons
              />
            </div>
            <div className="relative">
              <AppSelect
                className={`${compactInputClassName} min-w-[190px]`}
                value={sourceFilter}
                onChange={(event) => setSourceFilter(event.target.value)}
                options={sourceFilterSelectOptions}
                hideMenuIcons
              />
            </div>
          </div>
          {hasActiveFilters ? (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setStageFilter("ALL");
                  setAssigneeFilter("ALL");
                  setSourceFilter("ALL");
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
              >
                Clear filters
              </button>
            </div>
          ) : null}
        </Card>
      ) : null}

      {viewMode === "board" ? (
        <div
          ref={boardScrollRef}
          className="pipeline-board-scroll overflow-x-auto px-1 pb-3 pt-1 [scrollbar-color:#b8c7e6_transparent] [scrollbar-width:thin]"
          onDragOver={(event) => {
            if (!dragLeadId) {
              return;
            }

            event.preventDefault();
            updateBoardDragScroll(event.clientX);
          }}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              stopBoardDragScroll();
            }
          }}
          onDrop={() => {
            stopBoardDragScroll();
          }}
        >
          <div className="mb-4 grid min-w-max auto-cols-[minmax(250px,270px)] grid-flow-col items-start gap-3">
          {boardColumns.map((column, index) => {
            const items = visibleLeads.filter((lead) => lead.status === column.key);
            const stageValue = items.reduce((sum, lead) => sum + lead.value, 0);
            const isDropActive = dragOverStage === column.key;

            return (
              <div
                key={column.key}
                className={`flex min-w-[250px] flex-col rounded-2xl border border-slate-200/60 px-3 py-3 transition ${
                  isDropActive ? "bg-[#edf4ff] ring-1 ring-[#386df4]/20" : column.backgroundClass
                }`}
                style={{ animation: `fadeInUp 0.65s cubic-bezier(0.16, 1, 0.3, 1) ${Math.min(index * 120, 800)}ms both` }}
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-4.5 w-1 rounded-full ${column.accent}`} />
                    <span className="text-[0.95rem] font-medium text-slate-800">{leadStatusLabels[column.key]}</span>
                    <span className={`rounded-lg px-2 py-0.5 text-[11px] ${column.countBadgeClass}`}>{items.length}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <button onClick={() => openCreateLead(column.key)} className="rounded-lg p-1 hover:bg-white hover:text-slate-700">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div
                  className="space-y-2.5"
                  onDragOver={(event) => {
                    event.preventDefault();
                    if (dragLeadId) {
                      setDragOverStage(column.key);
                      setDragOverLead(null);
                    }
                  }}
                  onDragEnter={(event) => {
                    event.preventDefault();
                    if (dragLeadId) {
                      setDragOverStage(column.key);
                      setDragOverLead(null);
                    }
                  }}
                  onDragLeave={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                      setDragOverStage((current) => (current === column.key ? null : current));
                      setDragOverLead(null);
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const leadId = event.dataTransfer.getData("text/lead-id") || dragLeadId;
                    if (leadId) {
                      moveLead(leadId, column.key);
                    }
                  }}
                >
                  {items.length ? (
                    items.map((lead, leadIndex) => {
                      const dragMarkerPlacement = dragOverLead?.leadId === lead.id ? dragOverLead.placement : null;
                      const canEditLead = canControlLeadRecord(lead);
                      return (
                      <div
                        key={lead.id}
                        draggable={!reorderingLocked && canEditLead}
                        onDragStart={(event) => {
                          if (reorderingLocked || !canEditLead) {
                            event.preventDefault();
                            if (!canEditLead) {
                              setFeedback(permissionHint);
                            }
                            return;
                          }

                          dragStartedRef.current = true;
                          event.dataTransfer.effectAllowed = "move";
                          event.dataTransfer.setData("text/lead-id", lead.id);
                          setDragLeadId(lead.id);
                          // Clone to body so overflow containers don't clip the drag ghost
                          const el = event.currentTarget as HTMLElement;
                          const rect = el.getBoundingClientRect();
                          const clone = el.cloneNode(true) as HTMLElement;
                          clone.style.cssText = `position:fixed;top:-9999px;left:-9999px;width:${rect.width}px;pointer-events:none;opacity:1;`;
                          document.body.appendChild(clone);
                          event.dataTransfer.setDragImage(clone, event.clientX - rect.left, event.clientY - rect.top);
                          window.setTimeout(() => document.body.removeChild(clone), 0);
                        }}
                        onDragEnd={() => {
                          clearBoardDragState();
                          window.setTimeout(() => {
                            dragStartedRef.current = false;
                          }, 0);
                        }}
                        onDragOver={(event) => {
                          if (!dragLeadId || dragLeadId === lead.id || reorderingLocked) {
                            return;
                          }

                          event.preventDefault();
                          event.stopPropagation();
                          updateBoardDragScroll(event.clientX);
                          const rect = event.currentTarget.getBoundingClientRect();
                          const placement = event.clientY < rect.top + rect.height / 2 ? "before" : "after";
                          setDragOverStage(column.key);
                          setDragOverLead({ leadId: lead.id, placement });
                        }}
                        onDragLeave={(event) => {
                          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                            setDragOverLead((current) => (current?.leadId === lead.id ? null : current));
                          }
                        }}
                        onDrop={(event) => {
                          if (!dragLeadId || dragLeadId === lead.id || reorderingLocked) {
                            return;
                          }

                          event.preventDefault();
                          event.stopPropagation();
                          moveLead(dragLeadId, column.key, lead.id, dragMarkerPlacement || "after");
                        }}
                        className={`group relative flex w-full flex-col rounded-[16px] border bg-white p-4 text-left shadow-[0_4px_16px_rgba(15,23,42,0.03)] transition-all hover:-translate-y-1 hover:border-[#c8d8ff] hover:bg-[#fcfdff] hover:shadow-[0_8px_24px_rgba(56,109,244,0.06)] ${
                          selectedLeadId === lead.id ? "border-[#bcd0ff] ring-2 ring-[#386df4]/10" : "border-slate-200"
                        } ${
                          canEditLead ? (dragLeadId === lead.id ? "cursor-grabbing opacity-70" : "cursor-grab") : "cursor-default"
                        }`}
                        style={{ animation: `scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${Math.min(index * 120 + leadIndex * 80 + 200, 1000)}ms both` }}
                      >
                        {dragMarkerPlacement ? (
                          <div
                            className={`pointer-events-none absolute left-3 right-3 z-10 h-1 rounded-full bg-[#386df4] ${
                              dragMarkerPlacement === "before" ? "top-0 -translate-y-1/2" : "bottom-0 translate-y-1/2"
                            }`}
                          />
                        ) : null}
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="min-w-0 pr-8">
                            <div className="truncate text-[14px] font-medium leading-[1.2rem] text-slate-900 transition-colors group-hover:text-[#386df4]">{lead.name}</div>
                            <p className="mt-1 line-clamp-2 text-[12px] leading-[1.1rem] text-slate-500">{lead.summary || "No summary added yet."}</p>
                          </div>
                          
                          <div className="absolute right-3.5 top-3.5 flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                openEditLead(lead.id);
                              }}
                              title={canEditLead ? "Edit lead" : "View lead"}
                              className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-all hover:bg-slate-50 hover:text-[#386df4]"
                            >
                              <Cog className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-slate-400">
                          <span className="inline-flex items-center gap-1.5">
                            <CompanyLogo
                              name={lead.company || "Unknown company"}
                              logoUrl={lead.companyLogoUrl}
                              className="h-4.5 w-4.5 rounded-none object-contain"
                              fallbackClassName="flex items-center justify-center bg-[#ffe7e4] text-[#d85b4b]"
                              textClassName="text-[9px] font-semibold"
                            />
                            {lead.company || "No company"}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {formatDueLabel(lead.dueDate, localization)}
                          </span>
                        </div>

                        <div className="mt-3 text-[1.35rem] font-semibold tracking-tight text-slate-900">{formatLocalizedCurrency(lead.value, localization)}</div>

                        <div className="mt-3 border-t border-slate-100 pt-3">
                          <div className="flex items-center justify-between">
                            <div className="flex -space-x-2">
                              {(lead.assignedUsers.length ? lead.assignedUsers : ["Unassigned"]).map((user, index) => (
                                <UserAvatar
                                  key={`${lead.id}-${user}-${index}`}
                                  name={user}
                                  imageUrl={teamMemberById.get(lead.assignedUserIds[index] || "")?.avatarUrl}
                                  className="h-6 w-6 border-2 border-white text-[9px]"
                                  fallbackClassName={assigneeTone(index)}
                                  title={user}
                                />
                              ))}
                            </div>

                            <div className="flex items-center gap-1.5 text-slate-400">
                              <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-0.5 text-[10px]">
                                <Paperclip className="h-3 w-3" />
                                {lead.attachmentsCount}
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-0.5 text-[10px]">
                                <MessageSquare className="h-3 w-3" />
                                {lead.notes.length}
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-0.5 text-[10px]">
                                <BellRing className="h-3 w-3" />
                                {lead.reminders.filter((reminder) => !reminder.completedAt).length}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )})
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-8 text-center text-[0.9rem] leading-6 text-slate-400">
                      No leads
                      <br />
                      in this
                      <br />
                      stage.
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-200 px-1 pt-4 text-sm">
                  <span className="text-slate-500">Total value</span>
                  <span className="font-semibold text-slate-900">{formatLocalizedCurrency(stageValue, localization)}</span>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="w-full overflow-x-auto">
            <table className="min-w-full border border-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr className="[&>th]:border-b [&>th]:border-slate-200/80">
                  <th className="border-r border-slate-200/80 px-3 py-3 font-medium">Lead</th>
                  <th className="border-r border-slate-200/80 px-3 py-3 font-medium">Company</th>
                  <th className="border-r border-slate-200/80 px-3 py-3 font-medium">Due date</th>
                  <th className="border-r border-slate-200/80 px-3 py-3 font-medium">Assigned</th>
                  <th className="border-r border-slate-200/80 px-3 py-3 font-medium">Stage</th>
                  <th className="border-r border-slate-200/80 px-3 py-3 font-medium">Value</th>
                  <th className="border-r border-slate-200/80 px-3 py-3 font-medium">Score</th>
                  <th className="w-12 px-3 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="[&>tr:not(:last-child)>td]:border-b [&>tr:not(:last-child)>td]:border-slate-200/80">
                {visibleLeads.map((lead) => (
                  <tr key={lead.id} className="text-slate-700">
                    <td className="border-r border-slate-200/80 px-3 py-3 align-top">
                      <div className="font-medium text-slate-900">{lead.name}</div>
                      <div className="mt-1 text-sm text-slate-400">{lead.summary || "No summary added."}</div>
                    </td>
                    <td className="border-r border-slate-200/80 px-3 py-3 align-top">
                      {lead.company ? (
                        lead.companyId ? (
                          <Link href={`/companies/${lead.companyId}` as Route} className="group flex w-max items-center gap-3">
                            <CompanyLogo
                              name={lead.company}
                              logoUrl={lead.companyLogoUrl}
                              className="h-6 w-6 rounded-none object-contain"
                              fallbackClassName="flex h-6 w-6 items-center justify-center rounded-md bg-[#ffe7e4] text-[10px] font-semibold text-[#d85b4b]"
                            />
                            <span className="font-medium text-slate-800 transition-colors group-hover:text-[#386df4]">{lead.company}</span>
                          </Link>
                        ) : (
                          <div className="flex items-center gap-3">
                            <CompanyLogo
                              name={lead.company}
                              logoUrl={lead.companyLogoUrl}
                              className="h-6 w-6 rounded-none object-contain"
                              fallbackClassName="flex h-6 w-6 items-center justify-center rounded-md bg-[#ffe7e4] text-[10px] font-semibold text-[#d85b4b]"
                            />
                            <span className="font-medium text-slate-800">{lead.company}</span>
                          </div>
                        )
                      ) : (
                        <span className="text-slate-400">No company set</span>
                      )}
                    </td>
                    <td className="border-r border-slate-200/80 px-3 py-3 align-top">{formatDueLabel(lead.dueDate, localization)}</td>
                    <td className="border-r border-slate-200/80 px-3 py-3 align-top">
                      <div className="flex -space-x-2">
                        {(lead.assignedUsers.length ? lead.assignedUsers : ["Unassigned"]).map((user, index) => (
                          <UserAvatar
                            key={`${lead.id}-${user}-table-${index}`}
                            name={user}
                            imageUrl={teamMemberById.get(lead.assignedUserIds[index] || "")?.avatarUrl}
                            className="h-7 w-7 border-2 border-white text-[10px]"
                            fallbackClassName={assigneeTone(index)}
                            title={user}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="border-r border-slate-200/80 px-3 py-3 align-top">
                      <StageDropdown
                        value={lead.status}
                        disabled={!canControlLeadRecord(lead)}
                        onChange={(status) => moveLead(lead.id, status)}
                      />
                    </td>
                    <td className="border-r border-slate-200/80 px-3 py-3 align-top font-medium text-slate-900">{formatLocalizedCurrency(lead.value, localization)}</td>
                    <td className="border-r border-slate-200/80 px-3 py-3 align-top">{lead.score}</td>
                    <td className="px-3 py-3 align-top">
                      <button
                        type="button"
                        onClick={() => openEditLead(lead.id)}
                        aria-label={`Edit ${lead.name}`}
                        title={canControlLeadRecord(lead) ? `Edit ${lead.name}` : `View ${lead.name}`}
                        className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-50"
                      >
                        <Cog className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {!filteredLeads.length ? (
                  <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-500">
                        No pipepline items match the current search and filters.
                      </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <LeadModal
        open={showCreateModal}
        form={createForm}
        companies={companies}
        contacts={contacts}
        teamMembers={teamMembers}
        busy={isSaving || attachmentsBusy}
        stagedFiles={createAttachmentFiles}
        onClose={() => {
          setShowCreateModal(false);
          setCreateAttachmentFiles([]);
        }}
        onChange={setCreateForm}
        onSubmit={createLead}
        onFilesChange={setCreateAttachmentFiles}
        onRemoveFile={(fileName) => setCreateAttachmentFiles((current) => current.filter((file) => file.name !== fileName))}
      />
      <EditLeadModal
        open={showEditModal}
        lead={selectedLead}
        form={editForm}
        companies={companies}
        contacts={contacts}
        teamMembers={teamMembers}
        busy={isSaving}
        attachmentsBusy={attachmentsBusy}
        remindersBusy={remindersBusy}
        onClose={() => setShowEditModal(false)}
        onChange={setEditForm}
        onSubmit={saveLead}
        onUploadAttachments={(files) => {
          if (selectedLead) {
            uploadAttachmentsForLead(selectedLead.id, files);
          }
        }}
        onDeleteAttachment={(attachmentId) => {
          if (selectedLead) {
            deleteAttachmentFromLead(selectedLead.id, attachmentId);
          }
        }}
        localization={localization}
        onCreateReminder={(payload) => {
          if (selectedLead) {
            createReminderForLead(selectedLead.id, payload);
          }
        }}
        onToggleReminder={(reminderId, completed) => {
          if (selectedLead) {
            toggleReminderForLead(selectedLead.id, reminderId, completed);
          }
        }}
        onEditReminder={(reminderId, payload) => {
          if (selectedLead) {
            editReminderForLead(selectedLead.id, reminderId, payload);
          }
        }}
        onDeleteReminder={(reminderId) => {
          if (selectedLead) {
            deleteReminderFromLead(selectedLead.id, reminderId);
          }
        }}
        onCreateNote={(body) => {
          if (selectedLead) {
             createNoteForLead(selectedLead.id, body);
          }
        }}
        onDeleteNote={(noteId) => {
          if (selectedLead) {
             deleteNoteFromLead(selectedLead.id, noteId);
          }
        }}
        onCreateTask={(title) => {
          if (selectedLead) {
             createTaskForLead(selectedLead.id, title);
          }
        }}
        onDeleteLead={deleteLead}
        canEdit={selectedLeadCanEdit}
        permissionHint={permissionHint}
      />
      {confirmationDialog}
    </div>
  );
}

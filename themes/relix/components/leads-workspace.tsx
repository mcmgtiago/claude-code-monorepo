"use client";

import { AppSelect } from "@/components/app-select";
import { AppCombobox } from "@/components/app-combobox";
import { AppDatePicker } from "@/components/app-date-time-picker";
import type { Route } from "next";
import { useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  AlignLeft,
  Building2,
  CalendarDays,
  DollarSign,
  Mail,
  MessagesSquare,
  Paperclip,
  Phone,
  Plus,
  Target,
  Trash2,
  User,
  Users,
  Waypoints,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/card";
import { useConfirmAction } from "@/components/confirm-action-modal";
import { FeedbackToast } from "@/components/feedback-toast";
import type { LeadReminderRecord } from "@/components/lead-reminders-panel";
import { RelatedEmailModal } from "@/components/related-email-modal";
import { useCommandKFocus } from "@/components/search-hotkey";
import type { LeadAttachment } from "@/lib/lead-attachments";
import { UserAvatar } from "@/components/user-avatar";
import { Topbar } from "@/components/topbar";
import { leadStatusLabels, leadStatuses, leadStatusTones, type LeadStatusValue } from "@/lib/crm";
import { formatLocalizedCurrency, formatLocalizedDateTime, type WorkspaceLocalizationSettings } from "@/lib/localization";
import { assigneeTone } from "@/lib/team";

type LeadRecord = {
  id: string;
  contactId: string | null;
  contactName?: string | null;
  companyId: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  source: string | null;
  status: LeadStatusValue;
  value: number;
  score: number;
  lastContact: string | Date | null;
  assignedUsers: string[];
  assignedUserIds: string[];
  notes: Array<{ id: string; body: string; createdAt: string | Date }>;
  tasks: Array<{ id: string; title: string; status: string; dueDate: string | Date | null; createdAt: string | Date }>;
  reminders: LeadReminderRecord[];
};

type CompanyOption = {
  id: string;
  name: string;
};

type ContactOption = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  companyId: string | null;
  companyName: string | null;
};

type TeamMemberOption = {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
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

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/10";

const inputWithIconClassName =
  "w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/20";

const inputIconWrapperClassName = "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400";

const selectClassName = `${inputClassName} appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_10px_center] bg-no-repeat pr-10`;
const filterOptionIconClassName = "h-3.5 w-3.5 text-slate-400";

const panelButtonClassName =
  "inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60";

const previewActionButtonClassName =
  "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60";

const leadBoardPatchTones: Record<LeadStatusValue, string> = {
  NEW: "bg-slate-50",
  QUALIFIED: "bg-cyan-50/70",
  PROPOSAL: "bg-indigo-50/70",
  NEGOTIATION: "bg-amber-50/70",
  WON: "bg-emerald-50/70",
  LOST: "bg-rose-50/70"
};

const selectedLeadRowTones: Record<LeadStatusValue, string> = {
  NEW: "bg-slate-100 text-slate-900",
  QUALIFIED: "bg-cyan-50 text-slate-900",
  PROPOSAL: "bg-indigo-50 text-slate-900",
  NEGOTIATION: "bg-amber-50 text-slate-900",
  WON: "bg-emerald-50 text-slate-900",
  LOST: "bg-rose-50 text-slate-900"
};

function emptyLeadForm(defaultAssignedUserIds: string[] = []): LeadFormState {
  return {
    contactId: "",
    name: "",
    summary: "",
    email: "",
    phone: "",
    companyId: "",
    company: "",
    source: "",
    status: "NEW",
    value: "0",
    score: "0",
    dueDate: "",
    assignedUserIds: defaultAssignedUserIds,
    note: ""
  };
}

function formatLastContact(value: string | Date | null) {
  if (!value) {
    return "Never";
  }

  return formatDistanceToNow(new Date(value), { addSuffix: true });
}

async function parseJson<T>(response: Response) {
  const payload = (await response.json().catch(() => null)) as T | { error?: string } | null;

  if (!response.ok) {
    throw new Error((payload as { error?: string } | null)?.error || "Request failed");
  }

  return payload as T;
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

function toggleUser(users: string[], value: string) {
  return users.includes(value) ? users.filter((entry) => entry !== value) : [...users, value];
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

function previewValue(value: string | null | undefined) {
  return value?.trim() || "Not set";
}

function reminderDateLabel(reminder: LeadReminderRecord, localization: WorkspaceLocalizationSettings) {
  if (reminder.completedAt) {
    return `Completed ${formatLocalizedDateTime(reminder.completedAt, localization)}`;
  }

  return `Due ${formatLocalizedDateTime(reminder.remindAt, localization)}`;
}

function LeadFormFields({
  form,
  companies,
  contacts,
  teamMembers,
  onChange
}: {
  form: LeadFormState;
  companies: CompanyOption[];
  contacts: ContactOption[];
  teamMembers: TeamMemberOption[];
  onChange: (next: LeadFormState) => void;
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
                placeholder="Select an existing person or type a new name"
                value={form.name}
                options={contacts.map((contact) => ({
                  id: contact.id,
                  value: contact.fullName,
                  label: contact.fullName,
                  description: contact.companyName || contact.email || undefined
                }))}
                onValueChange={(nextValue) => {
                  const contact = matchContactOption(contacts, nextValue);
                  onChange(contact ? applySelectedContact(form, contact) : { ...form, name: nextValue, contactId: "" });
                }}
                onOptionSelect={(option) => {
                  const contact = contacts.find((item) => item.id === option.id) || matchContactOption(contacts, option.value);
                  onChange(contact ? applySelectedContact(form, contact) : { ...form, name: option.value, contactId: "" });
                }}
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
              <AlignLeft className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <textarea
                rows={3}
                className={`${inputWithIconClassName} min-h-[92px] resize-none pt-3.5`}
                value={form.summary}
                onChange={(event) => onChange({ ...form, summary: event.target.value })}
                placeholder="Add the one-line context shown on the card."
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Email</label>
            <div className="relative">
              <Mail className={`${inputIconWrapperClassName} h-4 w-4`} />
              <input className={inputWithIconClassName} placeholder="lead@company.com" value={form.email} onChange={(event) => onChange({ ...form, email: event.target.value })} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Phone</label>
            <div className="relative">
              <Phone className={`${inputIconWrapperClassName} h-4 w-4`} />
              <input className={inputWithIconClassName} placeholder="+1 (555) 000-0000" value={form.phone} onChange={(event) => onChange({ ...form, phone: event.target.value })} />
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
              <AppSelect className={`${selectClassName} pl-10`} value={form.source} placeholder="Select source" onChange={(event) => onChange({ ...form, source: event.target.value })}>
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
              <AppSelect className={`${selectClassName} pl-10`} value={form.status} onChange={(event) => onChange({ ...form, status: event.target.value as LeadStatusValue })}>
                {leadStatuses.map((status) => (
                  <option key={status} value={status}>
                    {leadStatusLabels[status]}
                  </option>
                ))}
              </AppSelect>
              <Target className={`${inputIconWrapperClassName} z-10 h-4 w-4`} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Value</label>
            <div className="relative">
              <DollarSign className={`${inputIconWrapperClassName} h-4 w-4`} />
              <input className={inputWithIconClassName} placeholder="10000" type="number" min="0" value={form.value} onChange={(event) => onChange({ ...form, value: event.target.value })} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Score</label>
            <div className="relative">
              <Activity className={`${inputIconWrapperClassName} h-4 w-4`} />
              <input className={inputWithIconClassName} placeholder="50" type="number" min="0" max="100" value={form.score} onChange={(event) => onChange({ ...form, score: event.target.value })} />
            </div>
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Due date</label>
            <div className="relative">
              <CalendarDays className={`${inputIconWrapperClassName} h-4 w-4`} />
              <AppDatePicker className={inputWithIconClassName} value={form.dueDate} onChange={(dueDate) => onChange({ ...form, dueDate })} placeholder="Select due date" />
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
              {teamMembers.length ? (
                teamMembers.map((user, index) => {
                  const active = form.assignedUserIds.includes(user.id);

                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => onChange({ ...form, assignedUserIds: toggleUser(form.assignedUserIds, user.id) })}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${
                        active ? "border-[#bcd0ff] bg-[#eef4ff] text-[#386df4]" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <UserAvatar name={user.fullName} imageUrl={user.avatarUrl} className="h-6 w-6 text-[10px]" fallbackClassName={assigneeTone(index)} />
                      {user.fullName}
                    </button>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500">No active team members available yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateLeadModal({
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
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-track]:bg-transparent">
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
            <button type="button" onClick={onClose} className="crm-btn crm-btn-secondary">
              Cancel
            </button>
            <button
              type="button"
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

export function LeadsWorkspace({
  initialLeads,
  companies,
  contacts,
  teamMembers,
  currentUserId,
  currentUserName,
  localization,
  initialSelectedLeadId
}: {
  initialLeads: LeadRecord[];
  companies: CompanyOption[];
  contacts: ContactOption[];
  teamMembers: TeamMemberOption[];
  currentUserId: string;
  currentUserName: string;
  localization: WorkspaceLocalizationSettings;
  initialSelectedLeadId?: string | null;
}) {
  const router = useRouter();
  const { confirm: requestConfirmation, confirmationDialog } = useConfirmAction();
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [leads, setLeads] = useState(initialLeads);
  const [selectedLeadId, setSelectedLeadId] = useState(() => initialSelectedLeadId || initialLeads[0]?.id || null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatusValue | "ALL">("ALL");
  const defaultAssignedUserIds = currentUserId ? [currentUserId] : teamMembers[0] ? [teamMembers[0].id] : [];
  const [createForm, setCreateForm] = useState<LeadFormState>(() => emptyLeadForm(defaultAssignedUserIds));
  const [createAttachmentFiles, setCreateAttachmentFiles] = useState<File[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showCreateLeadModal, setShowCreateLeadModal] = useState(false);
  const [showRelatedEmailModal, setShowRelatedEmailModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);
  const teamMemberById = useMemo(() => new Map(teamMembers.map((member) => [member.id, member])), [teamMembers]);
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
  useCommandKFocus(searchInputRef);

  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  useEffect(() => {
    if (initialSelectedLeadId && initialLeads.some((lead) => lead.id === initialSelectedLeadId)) {
      setSelectedLeadId(initialSelectedLeadId);
    }
  }, [initialLeads, initialSelectedLeadId]);

  const selectedLead = leads.find((lead) => lead.id === selectedLeadId) ?? null;

  const filteredLeads = leads.filter((lead) => {
    const matchesStatus = statusFilter === "ALL" ? true : lead.status === statusFilter;
    const haystack = `${lead.name} ${lead.email || ""} ${lead.company || ""}`.toLowerCase();
    const matchesQuery = haystack.includes(deferredQuery.trim().toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const composeLeadHref = selectedLead?.email
    ? (`/inbox?${new URLSearchParams({
        compose: "new",
        to: selectedLead.email,
        subject: `Follow up with ${selectedLead.name}`
      }).toString()}` as Route)
    : null;

  const openCreateLeadModal = () => {
    setCreateForm(emptyLeadForm(defaultAssignedUserIds));
    setCreateAttachmentFiles([]);
    setShowCreateLeadModal(true);
  };

  const closeCreateLeadModal = () => {
    setCreateForm(emptyLeadForm(defaultAssignedUserIds));
    setCreateAttachmentFiles([]);
    setShowCreateLeadModal(false);
  };

  const handleCreateLead = () => {
    startTransition(() => {
      void (async () => {
        setFeedback(null);

        try {
          const lead = await parseJson<LeadRecord>(
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
            await uploadLeadFiles(lead.id, createAttachmentFiles);
          }

          setLeads((current) => [lead, ...current]);
          setSelectedLeadId(lead.id);
          setCreateForm(emptyLeadForm(defaultAssignedUserIds));
          setCreateAttachmentFiles([]);
          setShowCreateLeadModal(false);
          setFeedback(createAttachmentFiles.length ? "Lead created and files uploaded." : "Lead created.");
          router.refresh();
        } catch (error) {
          setFeedback(error instanceof Error ? error.message : "Unable to create lead.");
        }
      })();
    });
  };

  const deleteLead = () => {
    if (!selectedLead) {
      return;
    }

    void (async () => {
      const confirmed = await requestConfirmation({
        title: "Move lead to trash?",
        description: `Lead "${selectedLead.name}" will be moved to trash. Related reminders and notes will be removed, and linked tasks will remain without this lead connection.`,
        confirmLabel: "Move to trash"
      });

      if (!confirmed) {
        return;
      }

      startTransition(() => {
        void (async () => {
          setFeedback(null);

          try {
            await parseJson<{ ok: true }>(
              await fetch(`/api/leads/${selectedLead.id}`, {
                method: "DELETE"
              })
            );

            setLeads((current) => {
              const nextLeads = current.filter((lead) => lead.id !== selectedLead.id);
              setSelectedLeadId(nextLeads[0]?.id ?? null);
              return nextLeads;
            });
            setFeedback("Lead moved to trash.");
            router.refresh();
          } catch (error) {
            setFeedback(error instanceof Error ? error.message : "Unable to delete lead.");
          }
        })();
      });
    })();
  };

  return (
    <>
      <Topbar title="Leads" subtitle="Run qualification, edit pipeline metadata, and add notes without leaving the workspace.">
        <button
          type="button"
          onClick={openCreateLeadModal}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#386df4] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2d5de0]"
        >
          <Plus className="h-4 w-4" />
          New lead
        </button>
      </Topbar>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <Card className="p-0">
          <div className={`rounded-t-xl border-b border-slate-200 px-5 py-5 transition-colors ${selectedLead ? leadBoardPatchTones[selectedLead.status] : "bg-white"}`}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Lead Command Board</h3>
                <p className="mt-1 text-sm text-slate-500">Search, filter, and open a selected lead preview.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
                <input
                  ref={searchInputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by name, email, or company"
                  className={inputClassName}
                />
                <AppSelect
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as LeadStatusValue | "ALL")}
                  className={inputClassName}
                  options={stageFilterSelectOptions}
                  hideMenuIcons
                />
              </div>
            </div>
          </div>

          <div className="w-full overflow-x-auto pt-4">
            <table className="min-w-full border border-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr className="[&>th]:border-b [&>th]:border-slate-200/80">
                  <th className="px-4 py-3 font-medium">Lead</th>
                  <th className="px-4 py-3 font-medium">Stage</th>
                  <th className="px-4 py-3 font-medium">Value</th>
                  <th className="px-4 py-3 font-medium">Score</th>
                  <th className="px-4 py-3 font-medium">Last contact</th>
                </tr>
              </thead>
              <tbody className="[&>tr:not(:last-child)>td]:border-b [&>tr:not(:last-child)>td]:border-slate-200/80">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLeadId(lead.id)}
                    className={`cursor-pointer transition ${
                      lead.id === selectedLeadId ? selectedLeadRowTones[lead.status] : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-slate-900">{lead.name}</div>
                        <div className="mt-1 text-xs text-slate-400">
                          {lead.email || "No email"} {lead.company ? `· ${lead.company}` : ""}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs ${leadStatusTones[lead.status]}`}>
                        {leadStatusLabels[lead.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">{formatLocalizedCurrency(lead.value, localization)}</td>
                    <td className="px-4 py-3">{lead.score}</td>
                    <td className="px-4 py-3 text-slate-500">{formatLastContact(lead.lastContact)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{selectedLead ? "Selected lead preview" : "Lead Preview"}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedLead ? selectedLead.name : "Select a lead from the table to preview it here."}
                </p>
              </div>
              {selectedLead ? (
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs ${leadStatusTones[selectedLead.status]}`}>
                  {leadStatusLabels[selectedLead.status]}
                </span>
              ) : null}
            </div>

          {selectedLead ? (
            <div className="mt-5 space-y-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">Value</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900">{formatLocalizedCurrency(selectedLead.value, localization)}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">Score</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900">{selectedLead.score}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">Last contact</div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">{formatLastContact(selectedLead.lastContact)}</div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="grid gap-4 text-sm sm:grid-cols-2">
                  {[
                    ["Contact", previewValue(selectedLead.contactName || selectedLead.name)],
                    ["Email", previewValue(selectedLead.email)],
                    ["Phone", previewValue(selectedLead.phone)],
                    ["Company", previewValue(selectedLead.company)],
                    ["Source", previewValue(selectedLead.source)],
                    ["Stage", leadStatusLabels[selectedLead.status]]
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">{label}</div>
                      <div className="mt-1 break-words font-medium text-slate-800">{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-slate-900">Assigned team</div>
                  {selectedLead.assignedUsers.length ? <span className="text-xs text-slate-400">{selectedLead.assignedUsers.length} selected</span> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedLead.assignedUsers.length ? (
                    selectedLead.assignedUsers.map((user, index) => (
                      <span key={user} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                        <UserAvatar name={user} imageUrl={teamMemberById.get(selectedLead.assignedUserIds[index] || "")?.avatarUrl} className="h-6 w-6 text-[10px]" fallbackClassName={assigneeTone(index)} />
                        {user}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No team members assigned.</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {selectedLead.email ? (
                  <button
                    type="button"
                    onClick={() => router.push(composeLeadHref as Route)}
                    className={`${previewActionButtonClassName} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Compose email
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setShowRelatedEmailModal(true)}
                  className={`${previewActionButtonClassName} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}
                >
                  <MessagesSquare className="mr-2 h-4 w-4" />
                  Email history
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={deleteLead}
                  className={`${previewActionButtonClassName} border border-[#ffd1c4] bg-[#fff4f0] text-[#e25f37] hover:bg-[#ffe9e1]`}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Move to trash
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm font-medium text-slate-900">Recent notes</div>
                  <div className="mt-3 space-y-3 text-sm text-slate-600">
                    {selectedLead.notes.length ? selectedLead.notes.map((note) => <p key={note.id}>{note.body}</p>) : <p>No notes yet.</p>}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm font-medium text-slate-900">Open tasks</div>
                  <div className="mt-3 space-y-3 text-sm text-slate-600">
                    {selectedLead.tasks.length ? (
                      selectedLead.tasks.map((task) => (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() => router.push(`/tasks?taskId=${encodeURIComponent(task.id)}` as Route)}
                          className="block w-full rounded-lg text-left font-medium text-slate-700 transition hover:text-[#386df4]"
                        >
                          {task.title}
                        </button>
                      ))
                    ) : (
                      <p>No tasks yet.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-medium text-slate-900">Reminders</div>
                <div className="mt-3 space-y-3 text-sm text-slate-600">
                  {selectedLead.reminders.length ? (
                    [...selectedLead.reminders]
                      .sort((left, right) => new Date(left.remindAt).getTime() - new Date(right.remindAt).getTime())
                      .map((reminder) => (
                        <div key={reminder.id} className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                          <div className={reminder.completedAt ? "font-medium text-slate-500 line-through" : "font-medium text-slate-800"}>{reminder.title}</div>
                          <div className="mt-1 text-xs text-slate-500">{reminderDateLabel(reminder, localization)}</div>
                        </div>
                      ))
                  ) : (
                    <p>No reminders added yet.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">Select a lead from the table to preview it here.</div>
          )}
          </Card>

          {feedback ? <FeedbackToast message={feedback} position="inline" /> : null}
        </div>
      </div>

      <CreateLeadModal
        open={showCreateLeadModal}
        form={createForm}
        companies={companies}
        contacts={contacts}
        teamMembers={teamMembers}
        busy={isPending}
        stagedFiles={createAttachmentFiles}
        onClose={closeCreateLeadModal}
        onChange={setCreateForm}
        onSubmit={handleCreateLead}
        onFilesChange={setCreateAttachmentFiles}
        onRemoveFile={(fileName) => setCreateAttachmentFiles((files) => files.filter((file) => file.name !== fileName))}
      />
      <RelatedEmailModal
        open={showRelatedEmailModal && selectedLead !== null}
        onClose={() => setShowRelatedEmailModal(false)}
        leadId={selectedLead?.id}
        email={selectedLead?.email}
        title={selectedLead ? `${selectedLead.name} email history` : "Email history"}
        subtitle="Review every synced thread tied to this lead and manage it without leaving CRM."
        composeHref={composeLeadHref}
      />
      {confirmationDialog}
    </>
  );
}

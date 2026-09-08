"use client";

import { AppSelect } from "@/components/app-select";
import { AppDatePicker } from "@/components/app-date-time-picker";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  Clipboard,
  Download,
  Link2,
  Linkedin,
  ListPlus,
  PencilLine,
  Plus,
  Search,
  MapPin,
  SlidersHorizontal,
  Trash2,
  X
} from "lucide-react";
import { Card } from "@/components/card";
import { useConfirmAction } from "@/components/confirm-action-modal";
import { FeedbackToast } from "@/components/feedback-toast";
import { CompanyLogo } from "@/components/company-logo";
import { CompanyFormModal } from "@/components/company-form-modal";
import { ContactFormModal } from "@/components/contact-form-modal";
import { PaginationControls } from "@/components/pagination-controls";
import { SearchHotkeyButton, useCommandKFocus } from "@/components/search-hotkey";
import { SelectionCheckbox } from "@/components/selection-checkbox";
import { TableActionMenu } from "@/components/table-action-menu";
import { leadStatusLabels, leadStatuses, type LeadStatusValue } from "@/lib/crm";
import type { CompanyDirectoryItem } from "@/lib/company-directory";
import { paginateItems } from "@/lib/pagination";
import { exportToExcel } from "@/lib/export-excel";

function composePipelineHref(company: CompanyDirectoryItem) {
  const params = new URLSearchParams({
    createLead: "1",
    companyId: company.id || ""
  });

  return `/pipeline?${params.toString()}`;
}

const inputClassName = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/10";
const filterOptionIconClassName = "h-3.5 w-3.5 text-slate-400";

const modalInputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/10";

type CompanyFormRecord = {
  id: string | null;
  name: string;
  website: string | null;
  industry: string | null;
  type: string | null;
  phone: string | null;
  location: string | null;
  description: string | null;
  stage: string | null;
  linkedinUrl: string | null;
  lists: string[];
  keywords: string[];
};

type SavedCompanyRecord = CompanyFormRecord & {
  logoUrl?: string | null;
  employeeCount?: number | null;
  revenueLabel?: string | null;
  marketCapLabel?: string | null;
  foundedYear?: number | null;
  facebookUrl?: string | null;
  xUrl?: string | null;
};

type TaskFormState = {
  title: string;
  taskType: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "TODO" | "IN_PROGRESS" | "DONE";
  dueDate: string;
  description: string;
};

type CompanySortOption = "name-asc" | "name-desc" | "contacts-desc" | "stage-asc" | "pipeline-value-desc";

const taskTypeOptions = ["Call Contact", "Call Account", "Account Activity", "LI: Send connect"];

function normalizeExternalUrl(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function companyToFormRecord(company: CompanyDirectoryItem): CompanyFormRecord {
  return {
    id: company.id,
    name: company.name,
    website: company.website || null,
    industry: company.industries[0] || company.industryLabel || null,
    type: company.companyType,
    phone: company.phone || null,
    location: company.location || null,
    description: company.description || null,
    stage: company.stage || null,
    linkedinUrl: company.linkedinUrl || null,
    lists: company.lists,
    keywords: company.keywords
  };
}

function slugifySavedCompanyName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function savedCompanyToDirectoryItem(company: SavedCompanyRecord, existing?: CompanyDirectoryItem): CompanyDirectoryItem {
  const name = company.name.trim();
  const industry = company.industry?.trim() || "";
  const website = company.website?.trim() || "";

  return {
    slug: slugifySavedCompanyName(name),
    id: company.id,
    name,
    mark: name.slice(0, 2).toUpperCase(),
    markClassName: existing?.markClassName || "bg-[#eef4ff] text-[#386df4]",
    companyType: company.type || null,
    employeeCount: company.employeeCount ?? existing?.employeeCount ?? 0,
    industryLabel: industry || "Not set",
    industries: industry ? [industry] : [],
    location: company.location || "",
    revenueLabel: company.revenueLabel || existing?.revenueLabel || "",
    marketCapLabel: company.marketCapLabel || existing?.marketCapLabel || "",
    foundedYear: company.foundedYear ?? existing?.foundedYear ?? 0,
    website,
    logoUrl: company.logoUrl ?? existing?.logoUrl ?? null,
    description: company.description || "",
    linkedinUrl: company.linkedinUrl || "",
    facebookUrl: company.facebookUrl || existing?.facebookUrl || "",
    xUrl: company.xUrl || existing?.xUrl || "",
    keywords: company.keywords || [],
    phone: company.phone || "",
    stage: company.stage || "",
    lists: company.lists || [],
    contactsCount: existing?.contactsCount ?? 0,
    employees: existing?.employees ?? [],
    deals: existing?.deals ?? []
  };
}

function createEmptyTaskForm(): TaskFormState {
  return {
    title: "",
    taskType: "Account Activity",
    priority: "MEDIUM",
    status: "TODO",
    dueDate: "",
    description: ""
  };
}

function exportCompanies(records: CompanyDirectoryItem[], filename: string) {
  const exportData = records.map((company) => ({
    "Company Name": company.name,
    Industry: company.industryLabel || company.industries.join(", ") || "",
    Stage: company.stage || "",
    "Contacts Count": company.contactsCount,
    Location: company.location || "",
    Website: company.website || "",
    "LinkedIn URL": company.linkedinUrl || "",
    Type: company.companyType || "",
    Phone: company.phone || "",
    Description: company.description || ""
  }));

  exportToExcel(exportData, filename);
}

function companyOpenPipelineValue(company: CompanyDirectoryItem) {
  return company.deals
    .filter((deal) => deal.status !== "WON" && deal.status !== "LOST")
    .reduce((sum, deal) => sum + deal.value, 0);
}

function QuickCreateTaskModal({
  company,
  open,
  form,
  busy,
  feedback,
  onChange,
  onClose,
  onSubmit
}: {
  company: { id: string | null; name: string } | null;
  open: boolean;
  form: TaskFormState;
  busy: boolean;
  feedback: string | null;
  onChange: (next: TaskFormState) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  if (!open || !company) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[rgba(15,23,42,0.28)] px-4 py-8 backdrop-blur-[2px]">
      <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
          <div>
            <h2 className="text-[1.15rem] font-semibold text-slate-900">Add task</h2>
            <p className="mt-1 text-sm text-slate-500">{company.name}</p>
          </div>
          <button onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 px-5 py-5">
          <div className="grid gap-3 md:grid-cols-[1.15fr_0.85fr]">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">Task title</label>
              <input
                className={modalInputClassName}
                placeholder="Prepare follow-up plan"
                value={form.title}
                onChange={(event) => onChange({ ...form, title: event.target.value })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">Task type</label>
              <AppSelect className={modalInputClassName} value={form.taskType} onChange={(event) => onChange({ ...form, taskType: event.target.value })}>
                {taskTypeOptions.map((taskType) => (
                  <option key={taskType} value={taskType}>
                    {taskType}
                  </option>
                ))}
              </AppSelect>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">Priority</label>
              <AppSelect
                className={modalInputClassName}
                value={form.priority}
                onChange={(event) => onChange({ ...form, priority: event.target.value as TaskFormState["priority"] })}
              >
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </AppSelect>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">Status</label>
              <AppSelect
                className={modalInputClassName}
                value={form.status}
                onChange={(event) => onChange({ ...form, status: event.target.value as TaskFormState["status"] })}
              >
                <option value="TODO">To do</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="DONE">Done</option>
              </AppSelect>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-600">Due date</label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <AppDatePicker className={`${modalInputClassName} pl-10`} value={form.dueDate} onChange={(dueDate) => onChange({ ...form, dueDate })} placeholder="Select due date" />
              </div>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">Description</label>
            <textarea
              rows={4}
              className={`${modalInputClassName} min-h-[110px] resize-none`}
              placeholder="Add task context or next step notes."
              value={form.description}
              onChange={(event) => onChange({ ...form, description: event.target.value })}
            />
          </div>
          {feedback ? <FeedbackToast message={feedback} position="inline" /> : null}
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-3.5">
          <button onClick={onClose} className="crm-btn crm-btn-secondary">
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={busy || !form.title.trim()}
            className="rounded-xl bg-[#386df4] px-4 py-2 text-sm font-medium text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Creating..." : "Create task"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function CompaniesWorkspace({ companies }: { companies: CompanyDirectoryItem[] }) {
  const router = useRouter();
  const { confirm: requestConfirmation, confirmationDialog } = useConfirmAction();
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [companyRecords, setCompanyRecords] = useState(companies);
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState<CompanySortOption>("name-asc");
  const [stageFilter, setStageFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [showCreateCompanyModal, setShowCreateCompanyModal] = useState(false);
  const [companyModalMode, setCompanyModalMode] = useState<"create" | "edit">("create");
  const [selectedCompany, setSelectedCompany] = useState<CompanyFormRecord | null>(null);
  const [contactCompany, setContactCompany] = useState<{ id: string | null; name: string } | null>(null);
  const [taskCompany, setTaskCompany] = useState<CompanyDirectoryItem | null>(null);
  const [taskForm, setTaskForm] = useState<TaskFormState>(createEmptyTaskForm);
  const [taskFeedback, setTaskFeedback] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [actionMenuSlug, setActionMenuSlug] = useState<string | null>(null);
  const [isTaskPending, setIsTaskPending] = useState(false);
  const [isDeletePending, setIsDeletePending] = useState<string | null>(null);
  const [isBulkActionPending, setIsBulkActionPending] = useState(false);
  const [selectedCompanySlugs, setSelectedCompanySlugs] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(16);
  const [openingCompanyName, setOpeningCompanyName] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);
  useCommandKFocus(searchInputRef);

  useEffect(() => {
    setCompanyRecords(companies);
  }, [companies]);

  const availableStages = useMemo(() => Array.from(new Set(companyRecords.map((company) => company.stage).filter((value): value is string => Boolean(value)))).sort(), [companyRecords]);
  const availableIndustries = useMemo(
    () => Array.from(new Set(companyRecords.flatMap((company) => company.industries).filter(Boolean))).sort(),
    [companyRecords]
  );
  const stageFilterSelectOptions = useMemo(
    () => [
      { value: "all", label: "All stages", icon: <BriefcaseBusiness className={filterOptionIconClassName} /> },
      ...availableStages.map((stage) => ({
        value: stage,
        label: stage,
        icon: <BriefcaseBusiness className={filterOptionIconClassName} />
      }))
    ],
    [availableStages]
  );
  const industryFilterSelectOptions = useMemo(
    () => [
      { value: "all", label: "All industries", icon: <Building2 className={filterOptionIconClassName} /> },
      ...availableIndustries.map((industry) => ({
        value: industry,
        label: industry,
        icon: <Building2 className={filterOptionIconClassName} />
      }))
    ],
    [availableIndustries]
  );
  const sortSelectOptions = useMemo(
    () => [
      { value: "name-asc", label: "Name A-Z", icon: <Building2 className={filterOptionIconClassName} /> },
      { value: "name-desc", label: "Name Z-A", icon: <Building2 className={filterOptionIconClassName} /> },
      { value: "contacts-desc", label: "Most contacts", icon: <BookOpen className={filterOptionIconClassName} /> },
      { value: "stage-asc", label: "Stage", icon: <BriefcaseBusiness className={filterOptionIconClassName} /> },
      { value: "pipeline-value-desc", label: "Pipeline value", icon: <ListPlus className={filterOptionIconClassName} /> }
    ],
    []
  );

  useEffect(() => {
    if (!actionMenuSlug) {
      return;
    }

    const handleWindowClick = () => setActionMenuSlug(null);
    window.addEventListener("click", handleWindowClick);

    return () => window.removeEventListener("click", handleWindowClick);
  }, [actionMenuSlug]);

  useEffect(() => {
    if (!actionFeedback) {
      return;
    }

    const timeoutId = window.setTimeout(() => setActionFeedback(null), 2800);
    return () => window.clearTimeout(timeoutId);
  }, [actionFeedback]);

  const filteredCompanies = useMemo(() => {
    const value = deferredQuery.trim().toLowerCase();

    const searched = companyRecords.filter((company) => {
      const haystack = `${company.name} ${company.industryLabel} ${company.location} ${company.stage || ""} ${company.industries.join(" ")}`.toLowerCase();
      const matchesQuery = haystack.includes(value);
      const matchesStage = stageFilter === "all" || (company.stage || "").toLowerCase() === stageFilter.toLowerCase();
      const matchesIndustry = industryFilter === "all" || company.industries.some((industry) => industry.toLowerCase() === industryFilter.toLowerCase());
      return matchesQuery && matchesStage && matchesIndustry;
    });

    const next = [...searched];

    switch (sortOption) {
      case "name-desc":
        next.sort((left, right) => right.name.localeCompare(left.name));
        break;
      case "contacts-desc":
        next.sort((left, right) => right.contactsCount - left.contactsCount || left.name.localeCompare(right.name));
        break;
      case "stage-asc":
        next.sort((left, right) => (left.stage || "").localeCompare(right.stage || "") || left.name.localeCompare(right.name));
        break;
      case "pipeline-value-desc":
        next.sort((left, right) => companyOpenPipelineValue(right) - companyOpenPipelineValue(left) || left.name.localeCompare(right.name));
        break;
      case "name-asc":
      default:
        next.sort((left, right) => left.name.localeCompare(right.name));
        break;
    }

    return next;
  }, [companyRecords, deferredQuery, industryFilter, sortOption, stageFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [deferredQuery, industryFilter, sortOption, stageFilter]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / pageSize));

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, filteredCompanies.length, pageSize]);

  const paginatedCompanies = useMemo(() => paginateItems(filteredCompanies, currentPage, pageSize), [currentPage, filteredCompanies, pageSize]);
  const filteredCompanySlugSet = useMemo(() => new Set(filteredCompanies.map((company) => company.slug)), [filteredCompanies]);
  const selectedCompanySlugSet = useMemo(() => new Set(selectedCompanySlugs), [selectedCompanySlugs]);
  const paginatedCompanySlugs = useMemo(() => paginatedCompanies.items.map((company) => company.slug), [paginatedCompanies.items]);
  const selectedCompanies = useMemo(() => companyRecords.filter((company) => selectedCompanySlugSet.has(company.slug)), [companyRecords, selectedCompanySlugSet]);
  const allPageCompaniesSelected = paginatedCompanySlugs.length > 0 && paginatedCompanySlugs.every((slug) => selectedCompanySlugSet.has(slug));
  const somePageCompaniesSelected = paginatedCompanySlugs.some((slug) => selectedCompanySlugSet.has(slug));

  useEffect(() => {
    setSelectedCompanySlugs((current) => current.filter((slug) => filteredCompanySlugSet.has(slug)));
  }, [filteredCompanySlugSet]);

  const toggleCompanySelection = (companySlug: string, checked: boolean) => {
    setSelectedCompanySlugs((current) =>
      checked ? (current.includes(companySlug) ? current : [...current, companySlug]) : current.filter((slug) => slug !== companySlug)
    );
  };

  const toggleAllPageCompanies = (checked: boolean) => {
    setSelectedCompanySlugs((current) => {
      if (checked) {
        const next = new Set(current);
        paginatedCompanySlugs.forEach((companySlug) => next.add(companySlug));
        return Array.from(next);
      }

      return current.filter((companySlug) => !paginatedCompanySlugs.includes(companySlug));
    });
  };

  const clearSelectedCompanies = () => {
    setSelectedCompanySlugs([]);
  };

  const handleEditCompany = (company: CompanyDirectoryItem) => {
    setCompanyModalMode(company.id ? "edit" : "create");
    setSelectedCompany(companyToFormRecord(company));
  };

  const handleCopyWebsite = async (company: CompanyDirectoryItem) => {
    const url = normalizeExternalUrl(company.website);
    if (!url) {
      setActionFeedback({ tone: "error", message: "No website is saved for this company." });
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setActionFeedback({ tone: "success", message: "Website copied to clipboard." });
    } catch {
      setActionFeedback({ tone: "error", message: "Unable to copy website." });
    }
  };

  const handleDeleteCompany = async (company: CompanyDirectoryItem) => {
    if (!company.id) {
      setActionFeedback({ tone: "error", message: "Company must be saved before it can be deleted." });
      return;
    }

    const confirmed = await requestConfirmation({
      title: "Move company to trash?",
      description: `${company.name} will be moved to the trash bin. Linked contacts and tasks will stay in place but remain detached.`,
      confirmLabel: "Move to trash"
    });
    if (!confirmed) {
      return;
    }

    setActionMenuSlug(null);
    setIsDeletePending(company.slug);

    try {
      const response = await fetch(`/api/companies/${company.id}`, { method: "DELETE" });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to delete company");
      }

      setCompanyRecords((current) => current.filter((currentCompany) => currentCompany.slug !== company.slug));
      setSelectedCompanySlugs((current) => current.filter((slug) => slug !== company.slug));
      setActionFeedback({ tone: "success", message: "Company moved to trash." });
      router.refresh();
    } catch (error) {
      setActionFeedback({ tone: "error", message: error instanceof Error ? error.message : "Unable to delete company." });
    } finally {
      setIsDeletePending(null);
    }
  };



  const handleCreateTask = async () => {
    if (!taskCompany) {
      return;
    }

    setIsTaskPending(true);
    setTaskFeedback(null);

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: taskForm.title.trim(),
          description: taskForm.description.trim(),
          taskType: taskForm.taskType,
          priority: taskForm.priority,
          status: taskForm.status,
          associateCompany: taskCompany.name,
          companyId: taskCompany.id || "",
          dueDate: taskForm.dueDate ? new Date(`${taskForm.dueDate}T09:00:00.000Z`).toISOString() : ""
        })
      });
      const payload = (await response.json().catch(() => null)) as { id?: string; error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to create task");
      }

      setTaskCompany(null);
      setTaskForm(createEmptyTaskForm());
      setActionFeedback({ tone: "success", message: "Task created." });
      router.push("/tasks" as Route);
    } catch (error) {
      setTaskFeedback(error instanceof Error ? error.message : "Unable to create task.");
    } finally {
      setIsTaskPending(false);
    }
  };

  const handleExportCompanies = () => {
    exportCompanies(filteredCompanies, "companies.xlsx");
  };

  const handleExportSelectedCompanies = () => {
    if (!selectedCompanies.length) {
      return;
    }

    exportCompanies(selectedCompanies, "selected-companies.xlsx");
    setActionFeedback({ tone: "success", message: `Exported ${selectedCompanies.length} selected compan${selectedCompanies.length === 1 ? "y" : "ies"}.` });
  };

  const handleCopySelectedWebsites = async () => {
    const websites = selectedCompanies
      .map((company) => normalizeExternalUrl(company.website))
      .filter((website): website is string => Boolean(website));

    if (!websites.length) {
      setActionFeedback({ tone: "error", message: "No websites are available for the selected companies." });
      return;
    }

    try {
      await navigator.clipboard.writeText(websites.join("\n"));
      setActionFeedback({ tone: "success", message: "Websites copied to clipboard." });
    } catch {
      setActionFeedback({ tone: "error", message: "Unable to copy websites." });
    }
  };

  const handleBulkStageUpdate = async (nextStage: LeadStatusValue | "CLEAR") => {
    if (!selectedCompanies.length) {
      return;
    }

    const savedCompanies = selectedCompanies.filter((company) => company.id);
    if (!savedCompanies.length) {
      setActionFeedback({ tone: "error", message: "Selected companies must be saved before stage can be updated." });
      return;
    }

    setIsBulkActionPending(true);
    setActionMenuSlug(null);

    const stageLabel = nextStage === "CLEAR" ? "" : leadStatusLabels[nextStage];
    const results = await Promise.allSettled(
      savedCompanies.map(async (company) => {
        const response = await fetch(`/api/companies/${company.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ stage: stageLabel })
        });
        const payload = (await response.json().catch(() => null)) as { error?: string } | CompanyDirectoryItem | null;

        if (!response.ok) {
          throw new Error((payload as { error?: string } | null)?.error || "Unable to update company stage");
        }

        return {
          slug: company.slug,
          stage: stageLabel
        };
      })
    );

    const updatedCompanies = results.filter((result): result is PromiseFulfilledResult<{ slug: string; stage: string }> => result.status === "fulfilled");
    const failedCount = results.length - updatedCompanies.length;

    if (updatedCompanies.length) {
      const updatedStageBySlug = new Map(updatedCompanies.map((result) => [result.value.slug, result.value.stage]));
      setCompanyRecords((current) =>
        current.map((company) => (updatedStageBySlug.has(company.slug) ? { ...company, stage: updatedStageBySlug.get(company.slug) || "" } : company))
      );
    }

    setIsBulkActionPending(false);

    if (!updatedCompanies.length) {
      setActionFeedback({ tone: "error", message: "Unable to update stages for the selected companies." });
      return;
    }

    setActionFeedback({
      tone: failedCount ? "error" : "success",
      message: failedCount
        ? `Updated ${updatedCompanies.length} compan${updatedCompanies.length === 1 ? "y" : "ies"}. ${failedCount} failed.`
        : nextStage === "CLEAR"
          ? `Cleared stage for ${updatedCompanies.length} compan${updatedCompanies.length === 1 ? "y" : "ies"}.`
          : `Updated stage for ${updatedCompanies.length} compan${updatedCompanies.length === 1 ? "y" : "ies"}.`
    });
  };

  const handleDeleteSelectedCompanies = async () => {
    if (!selectedCompanies.length) {
      return;
    }

    const savedCompanies = selectedCompanies.filter((company) => company.id);
    if (!savedCompanies.length) {
      setActionFeedback({ tone: "error", message: "Selected companies must be saved before they can be deleted." });
      return;
    }

    const confirmed = await requestConfirmation({
      title: "Move selected companies to trash?",
      description: `${savedCompanies.length} compan${savedCompanies.length === 1 ? "y will" : "ies will"} be moved to the trash bin. Linked contacts and tasks will stay in place but remain detached.`,
      confirmLabel: "Move to trash"
    });

    if (!confirmed) {
      return;
    }

    setIsBulkActionPending(true);
    setActionMenuSlug(null);

    const results = await Promise.allSettled(
      savedCompanies.map(async (company) => {
        const response = await fetch(`/api/companies/${company.id}`, { method: "DELETE" });
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;

        if (!response.ok) {
          throw new Error(payload?.error || "Unable to delete company");
        }

        return company.slug;
      })
    );

    const deletedSlugs = results
      .filter((result): result is PromiseFulfilledResult<string> => result.status === "fulfilled")
      .map((result) => result.value);
    const failedCount = results.length - deletedSlugs.length;

    if (deletedSlugs.length) {
      const deletedSlugSet = new Set(deletedSlugs);
      setCompanyRecords((current) => current.filter((company) => !deletedSlugSet.has(company.slug)));
      setSelectedCompanySlugs((current) => current.filter((slug) => !deletedSlugSet.has(slug)));
    }

    setIsBulkActionPending(false);

    if (!deletedSlugs.length) {
      setActionFeedback({ tone: "error", message: "Unable to delete selected companies." });
      return;
    }

    setActionFeedback({
      tone: failedCount ? "error" : "success",
      message: failedCount
        ? `Moved ${deletedSlugs.length} compan${deletedSlugs.length === 1 ? "y" : "ies"} to trash. ${failedCount} failed.`
        : `Moved ${deletedSlugs.length} compan${deletedSlugs.length === 1 ? "y" : "ies"} to trash.`
    });
    router.refresh();
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-[1.6rem] font-semibold tracking-tight text-slate-900">Companies</h1>
          <p className="mt-1 text-sm text-slate-500">Manage real company records, linked contacts, deals, and account activity.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportCompanies}
            className="crm-btn crm-btn-secondary"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
          <button
            onClick={() => {
              setCompanyModalMode("create");
              setSelectedCompany(null);
              setShowCreateCompanyModal(true);
            }}
            className="crm-btn crm-btn-primary"
          >
            <Plus className="h-3.5 w-3.5" />
            New company
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowFilters((current) => !current)}
            className="crm-btn crm-btn-secondary"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {showFilters ? "Hide filters" : "Show filters"}
          </button>
          <AppSelect
            className="h-[2.25rem] min-w-[140px] rounded-[0.7rem] border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700"
            value={sortOption}
            onChange={(event) => setSortOption(event.target.value as CompanySortOption)}
            options={sortSelectOptions}
            menuMinWidth={156}
            hideMenuIcons
          />
        </div>

        <div className="relative min-w-[220px] max-w-[360px] flex-1 lg:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input ref={searchInputRef} className={`${inputClassName} pl-9 pr-14`} placeholder="Search" value={query} onChange={(event) => setQuery(event.target.value)} />
            <SearchHotkeyButton inputRef={searchInputRef} />
        </div>
      </div>

      {showFilters ? (
        <Card className="mb-4 p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <AppSelect
              className={inputClassName}
              value={stageFilter}
              onChange={(event) => setStageFilter(event.target.value)}
              options={stageFilterSelectOptions}
              hideMenuIcons
            />
            <AppSelect
              className={inputClassName}
              value={industryFilter}
              onChange={(event) => setIndustryFilter(event.target.value)}
              options={industryFilterSelectOptions}
              hideMenuIcons
            />
            <button
              onClick={() => {
                setStageFilter("all");
                setIndustryFilter("all");
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
            >
              <X className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        </Card>
      ) : null}

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
        <div>
          Showing <span className="font-medium text-slate-700">{filteredCompanies.length}</span> of <span className="font-medium text-slate-700">{companyRecords.length}</span> companies
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span>Saved: <span className="font-medium text-slate-700">{companyRecords.filter((company) => company.id).length}</span></span>
          <span>Contacts linked: <span className="font-medium text-slate-700">{companyRecords.reduce((sum, company) => sum + company.contactsCount, 0)}</span></span>
        </div>
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

      {selectedCompanies.length ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#c8d8ff] bg-[#f8fbff] px-4 py-3">
          <div className="text-sm font-medium text-slate-700">
            {selectedCompanies.length} compan{selectedCompanies.length === 1 ? "y" : "ies"} selected
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopySelectedWebsites}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
            >
              <Clipboard className="h-3.5 w-3.5" />
              Copy websites
            </button>
            {leadStatuses.map((status) => (
              <button
                key={status}
                onClick={() => void handleBulkStageUpdate(status)}
                disabled={isBulkActionPending}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {leadStatusLabels[status]}
              </button>
            ))}
            <button
              onClick={() => void handleBulkStageUpdate("CLEAR")}
              disabled={isBulkActionPending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Clear stage
            </button>
            <button
              onClick={handleExportSelectedCompanies}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" />
              Export selected
            </button>
            <button
              onClick={() => void handleDeleteSelectedCompanies()}
              disabled={isBulkActionPending}
              className="crm-btn crm-btn-danger disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isBulkActionPending ? "Working..." : "Delete selected"}
            </button>
            <button
              onClick={clearSelectedCompanies}
              className="crm-btn crm-btn-secondary text-slate-500 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
        </div>
      ) : null}

      <Card className="overflow-hidden p-0">
        <div className="w-full overflow-x-auto">
          <table className="min-w-full border border-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr className="[&>th]:border-b [&>th]:border-slate-200/80">
                <th className="w-10 border-r border-slate-200/80 px-3 py-3 font-medium">
                  <SelectionCheckbox
                    aria-label="Select all companies on this page"
                    checked={allPageCompaniesSelected}
                    indeterminate={!allPageCompaniesSelected && somePageCompaniesSelected}
                    onChange={(event) => toggleAllPageCompanies(event.target.checked)}
                  />
                </th>
                <th className="border-r border-slate-200/80 px-2.5 py-3 font-medium">Company name</th>
                <th className="border-r border-slate-200/80 px-2.5 py-3 font-medium">Contacts</th>
                <th className="border-r border-slate-200/80 px-2.5 py-3 font-medium">Industries</th>
                <th className="border-r border-slate-200/80 px-2.5 py-3 font-medium">Stage</th>
                <th className="border-r border-slate-200/80 px-2.5 py-3 font-medium">Location</th>
                <th className="border-r border-slate-200/80 px-2.5 py-3 font-medium">Links</th>
                <th className="border-r border-slate-200/80 px-2.5 py-3 font-medium">Action</th>
                <th className="w-14 px-2.5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="[&>tr:not(:last-child)>td]:border-b [&>tr:not(:last-child)>td]:border-slate-200/80">
              {paginatedCompanies.items.length ? paginatedCompanies.items.map((company) => {
                const websiteUrl = normalizeExternalUrl(company.website);
                const linkedinUrl = normalizeExternalUrl(company.linkedinUrl);
                const menuOpen = actionMenuSlug === company.slug;
                const rowSelected = selectedCompanySlugSet.has(company.slug);

                return (
                  <tr key={company.slug} className={`text-slate-700 ${rowSelected ? "bg-[#f8fbff]" : ""}`}>
                    <td className="border-r border-slate-200/80 px-3 py-3 align-top">
                      <SelectionCheckbox
                        aria-label={`Select ${company.name}`}
                        checked={rowSelected}
                        onChange={(event) => toggleCompanySelection(company.slug, event.target.checked)}
                        className="mt-1"
                      />
                    </td>
                    <td className="border-r border-slate-200/80 px-2.5 py-3 align-top">
                      <Link href={`/companies/${company.slug}` as Route} className="flex items-center gap-3 font-medium text-slate-900 hover:text-[#386df4]">
                        <CompanyLogo
                          name={company.name}
                          logoUrl={company.logoUrl}
                          className="h-6 w-6 rounded-none object-contain"
                          fallbackClassName={`flex items-center justify-center rounded-md font-semibold ${company.markClassName}`}
                        />
                        {company.name}
                      </Link>
                    </td>
                    <td className="border-r border-slate-200/80 px-2.5 py-3 align-top">{company.contactsCount}</td>
                    <td className="border-r border-slate-200/80 px-2.5 py-3 align-top">
                      <div className="flex items-center gap-2">
                        <span>{company.industryLabel}</span>
                        {company.industries.length > 1 ? (
                          <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-500">+{company.industries.length - 1}</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="border-r border-slate-200/80 px-2.5 py-3 align-top">
                      {company.stage ? <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600">{company.stage}</span> : <span className="text-slate-300">Not set</span>}
                    </td>
                    <td className="border-r border-slate-200/80 px-2.5 py-3 align-top">
                      <div className="inline-flex items-center gap-2 text-slate-600">
                        <MapPin className="h-4 w-4 text-slate-300" />
                        <span>{company.location || "Not set"}</span>
                      </div>
                    </td>
                    <td className="border-r border-slate-200/80 px-2.5 py-3 align-top">
                      <div className="flex items-center gap-4 text-slate-500">
                        {websiteUrl ? (
                          <a href={websiteUrl} target="_blank" rel="noreferrer" className="hover:text-slate-800">
                            <Link2 className="h-4 w-4" />
                          </a>
                        ) : (
                          <span className="text-slate-300">
                            <Link2 className="h-4 w-4" />
                          </span>
                        )}
                        {linkedinUrl ? (
                          <a href={linkedinUrl} target="_blank" rel="noreferrer" className="hover:text-slate-800">
                            <Linkedin className="h-4 w-4" />
                          </a>
                        ) : (
                          <span className="text-slate-300">
                            <Linkedin className="h-4 w-4" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="border-r border-slate-200/80 px-2.5 py-3 align-top">
                      <div className="flex flex-wrap items-center gap-1">
                        <Link
                          href={`/companies/${company.id || company.slug}` as Route}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[12px] text-slate-700 hover:bg-slate-50"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          Open
                        </Link>
                        <button
                          onClick={() => handleEditCompany(company)}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[12px] text-slate-700 hover:bg-slate-50"
                        >
                          <PencilLine className="h-3.5 w-3.5" />
                          {company.id ? "Edit" : "Save"}
                        </button>
                      </div>
                    </td>
                    <td className="px-2.5 py-3 align-top">
                      <TableActionMenu
                        open={menuOpen}
                        onOpenChange={(nextOpen) => setActionMenuSlug(nextOpen ? company.slug : null)}
                        minWidth={190}
                        ariaLabel={`Open actions for ${company.name}`}
                      >
                        <Link
                          href={composePipelineHref(company) as Route}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <BriefcaseBusiness className="h-4 w-4" />
                          Add deal
                        </Link>
                        <button
                          onClick={() => {
                            setActionMenuSlug(null);
                            setContactCompany({ id: company.id, name: company.name });
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <ListPlus className="h-4 w-4" />
                          Add person
                        </button>
                        <button
                          onClick={() => {
                            setActionMenuSlug(null);
                            setTaskCompany(company);
                            setTaskForm(createEmptyTaskForm());
                            setTaskFeedback(null);
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <ListPlus className="h-4 w-4" />
                          Add task
                        </button>
                        <button
                          onClick={() => void handleCopyWebsite(company)}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Clipboard className="h-4 w-4" />
                          Copy website
                        </button>
                        <button
                          onClick={() => void handleDeleteCompany(company)}
                          disabled={!company.id || isDeletePending === company.slug}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          {isDeletePending === company.slug ? "Deleting..." : "Delete"}
                        </button>
                      </TableActionMenu>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-sm text-slate-500">
                        No companies match the current search and filters.
                      </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <PaginationControls
          currentPage={paginatedCompanies.safePage}
          pageSize={pageSize}
          pageSizeOptions={[8, 16, 24, 32]}
          totalItems={filteredCompanies.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={(value) => {
            setPageSize(value);
            setCurrentPage(1);
          }}
        />
      </Card>

      <CompanyFormModal
        open={showCreateCompanyModal || selectedCompany !== null}
        mode={selectedCompany ? companyModalMode : "create"}
        company={selectedCompany}
        titleOverride={selectedCompany ? (selectedCompany.id ? "Edit company" : "Save company") : undefined}
        submitLabelOverride={selectedCompany ? (selectedCompany.id ? "Save changes" : "Save company") : undefined}
        onClose={() => {
          setShowCreateCompanyModal(false);
          setSelectedCompany(null);
        }}
        onSaved={(company) => {
          const savedCompany = company as SavedCompanyRecord;
          setCompanyRecords((current) => {
            const existing = current.find((currentCompany) => currentCompany.id === savedCompany.id);
            const nextCompany = savedCompanyToDirectoryItem(savedCompany, existing);
            const withoutSavedCompany = current.filter((currentCompany) => currentCompany.id !== savedCompany.id);

            return [...withoutSavedCompany, nextCompany].sort((left, right) => left.name.localeCompare(right.name));
          });
          setShowCreateCompanyModal(false);
          setSelectedCompany(null);
          if (company.id) {
            setOpeningCompanyName(company.name);
            router.push(`/companies/${company.id}` as Route);
          } else {
            router.refresh();
          }
        }}
      />

      <ContactFormModal
        open={contactCompany !== null}
        companies={companyRecords.filter((company) => company.id).map((company) => ({
          id: company.id!,
          name: company.name,
          companyType: company.companyType || null,
          phone: company.phone || null,
          website: company.website || null,
          industry: company.industries[0] || company.industryLabel || null,
          location: company.location || null,
          description: company.description || null
        }))}
        defaultCompanyId={contactCompany?.id || undefined}
        defaultCompanyName={contactCompany?.name || undefined}
        onClose={() => setContactCompany(null)}
        onCreated={(contact) => {
          setContactCompany(null);
          router.push(`/contacts/${contact.id}` as Route);
        }}
      />

      <QuickCreateTaskModal
        company={taskCompany}
        open={taskCompany !== null}
        form={taskForm}
        busy={isTaskPending}
        feedback={taskFeedback}
        onChange={setTaskForm}
        onClose={() => {
          setTaskCompany(null);
          setTaskFeedback(null);
        }}
        onSubmit={() => void handleCreateTask()}
      />
      {confirmationDialog}
      {openingCompanyName ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/10 px-4 backdrop-blur-md">
          <div className="company-opening-card relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/80 bg-white/95 p-5 text-center shadow-[0_24px_80px_rgba(15,23,42,0.18)] ring-1 ring-slate-950/5">
            <div className="absolute inset-x-0 top-0 h-1 overflow-hidden bg-slate-100">
              <div className="company-opening-progress h-full w-1/2 rounded-r-full bg-[#386df4] shadow-[0_0_18px_rgba(56,109,244,0.42)]" />
            </div>
            <div className="mx-auto mt-1 flex h-14 w-14 items-center justify-center rounded-full bg-[#eef4ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
              <div className="company-opening-ring absolute h-14 w-14 rounded-full border border-[#386df4]/20 border-t-[#386df4]" />
              <Building2 className="relative h-6 w-6 text-[#386df4]" />
            </div>
            <div className="mt-4 text-xs font-semibold uppercase text-slate-400">Opening company</div>
            <div className="mt-1 truncate text-base font-semibold text-slate-950">{openingCompanyName}</div>
            <div className="mx-auto mt-4 flex w-14 justify-between">
              <span className="company-opening-dot h-1.5 w-1.5 rounded-full bg-[#386df4]" />
              <span className="company-opening-dot h-1.5 w-1.5 rounded-full bg-[#386df4]" style={{ animationDelay: "120ms" }} />
              <span className="company-opening-dot h-1.5 w-1.5 rounded-full bg-[#386df4]" style={{ animationDelay: "240ms" }} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

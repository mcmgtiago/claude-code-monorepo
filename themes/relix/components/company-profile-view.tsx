"use client";

import { AppSelect } from "@/components/app-select";
import { AppDatePicker } from "@/components/app-date-time-picker";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BellRing,
  BookOpen,
  Building2,
  CalendarDays,
  Clipboard,
  Cog,
  Download,
  Grid2x2,
  LayoutList,
  Mail,
  MapPin,
  MessageSquare,
  Paperclip,
  Phone,
  Plus,
  Search,
  SlidersHorizontal,
  Target,
  Trash2,
  Users,
  X,
  Globe2,
  Linkedin
} from "lucide-react";
import { Card } from "@/components/card";
import { CompanyLogo } from "@/components/company-logo";
import { CompanyFormModal } from "@/components/company-form-modal";
import { useConfirmAction } from "@/components/confirm-action-modal";
import { ContactFormModal } from "@/components/contact-form-modal";
import { FeedbackToast } from "@/components/feedback-toast";
import { PaginationControls } from "@/components/pagination-controls";
import { useCommandKFocus } from "@/components/search-hotkey";
import { SelectionCheckbox } from "@/components/selection-checkbox";
import { TableActionMenu } from "@/components/table-action-menu";
import { UserAvatar } from "@/components/user-avatar";
import type { CompanyDirectoryItem } from "@/lib/company-directory";
import { leadStatusLabels, leadStatuses, leadStatusTones, type LeadStatusValue } from "@/lib/crm";
import {
  formatLocalizedCurrency,
  formatLocalizedDate,
  type WorkspaceLocalizationSettings
} from "@/lib/localization";
import { paginateItems } from "@/lib/pagination";

type CompanyProfileViewProps = {
  profile: CompanyDirectoryItem;
  companies: Array<{
    id: string;
    name: string;
    companyType: string | null;
    website: string | null;
    phone: string | null;
    industry: string | null;
    location: string | null;
    description: string | null;
    logoUrl: string | null;
    contactsCount: number;
  }>;
  teamMembers: Array<{
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string | null;
  }>;
  localization: WorkspaceLocalizationSettings;
};

type DealRecord = CompanyDirectoryItem["deals"][number];
type EmployeeRecord = CompanyDirectoryItem["employees"][number];

type DealFormState = {
  title: string;
  status: LeadStatusValue;
  value: string;
  ownerId: string;
  summary: string;
  dueDate: string;
};

type EmployeeFilters = {
  hasEmail: "all" | "yes" | "no";
  hasPhone: "all" | "yes" | "no";
};

type EmployeeSortOption = "relevance" | "name-asc" | "title-asc" | "location-asc";

type LeadApiRecord = {
  id: string;
  name: string;
  status: LeadStatusValue;
  sortOrder: number;
  value: number;
  summary: string;
  dueDate: string | null;
  attachmentsCount: number;
  notes: Array<{ id: string; body: string }>;
  reminders?: Array<{ id: string; completedAt?: string | null }>;
  assignedUsers: string[];
  assignedUserIds: string[];
};

type CardDropPlacement = "before" | "after";

const LEAD_ORDER_STEP = 1000;

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/10";
const filterOptionIconClassName = "h-3.5 w-3.5 text-slate-400";

const emptyEmployeeFilters = (): EmployeeFilters => ({
  hasEmail: "all",
  hasPhone: "all"
});

function normalizeExternalUrl(value: string) {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `https://${value}`;
}

function composeEmployeeEmailHref(employee: EmployeeRecord) {
  if (!employee.email) {
    return `/contacts/${employee.id}`;
  }

  const params = new URLSearchParams({
    compose: "new",
    to: employee.email,
    subject: `Follow up with ${employee.name}`
  });

  return `/inbox?${params.toString()}`;
}

function composeEmployeePipelineHref(employee: EmployeeRecord) {
  const params = new URLSearchParams({
    create: "1",
    contactId: employee.id
  });

  return `/pipeline?${params.toString()}`;
}

function emptyDealForm(status: LeadStatusValue = "NEW", defaultOwnerId = ""): DealFormState {
  return {
    title: "",
    status,
    value: "",
    ownerId: defaultOwnerId,
    summary: "",
    dueDate: ""
  };
}

function formFromDeal(deal: DealRecord): DealFormState {
  return {
    title: deal.title,
    status: deal.status,
    value: String(deal.value || 0),
    ownerId: deal.ownerId || "",
    summary: deal.summary,
    dueDate: formatDateInputValue(deal.dueDate)
  };
}

function parseCurrencyValue(value: string) {
  const digits = value.replace(/[^0-9.]/g, "");
  if (!digits) {
    return 0;
  }

  const amount = Number(digits);
  return Number.isFinite(amount) ? amount : 0;
}

function formatDateInputValue(value: string | Date | null) {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
}

function isLeadApiRecord(value: unknown): value is LeadApiRecord {
  return Boolean(
    value &&
      typeof value === "object" &&
      "id" in value &&
      "name" in value &&
      "status" in value
  );
}

function formatDealFromLead(lead: LeadApiRecord, localization: WorkspaceLocalizationSettings): DealRecord {
  return {
    id: lead.id,
    title: lead.name,
    status: lead.status,
    sortOrder: lead.sortOrder ?? 0,
    stageLabel: leadStatusLabels[lead.status],
    value: lead.value || 0,
    valueLabel: formatLocalizedCurrency(lead.value || 0, localization),
    owner: lead.assignedUsers[0] || "Unassigned",
    ownerId: lead.assignedUserIds[0] || null,
    summary: lead.summary || "",
    dueDate: lead.dueDate,
    dueLabel: lead.dueDate ? formatLocalizedDate(lead.dueDate, localization, "monthDay") : "No date",
    attachmentsCount: lead.attachmentsCount || 0,
    commentsCount: Array.isArray(lead.notes) ? lead.notes.length : 0,
    reminderCount: Array.isArray(lead.reminders) ? lead.reminders.filter((reminder) => !reminder.completedAt).length : 0,
    participantInitials: (lead.assignedUsers || []).slice(0, 4).map((user: string) =>
      user
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || "")
        .join("")
    )
  };
}

function compareDeals(left: DealRecord, right: DealRecord) {
  if (left.sortOrder !== right.sortOrder) {
    return left.sortOrder - right.sortOrder;
  }

  return left.title.localeCompare(right.title);
}

function sortDeals(deals: DealRecord[]) {
  return [...deals].sort(compareDeals);
}

function updateDealCollection(deals: DealRecord[], dealId: string, updater: (deal: DealRecord) => DealRecord) {
  return sortDeals(deals.map((deal) => (deal.id === dealId ? updater(deal) : deal)));
}

function replaceDealInCollection(deals: DealRecord[], updatedDeal: DealRecord) {
  return sortDeals(deals.map((deal) => (deal.id === updatedDeal.id ? updatedDeal : deal)));
}

function appendDealToCollection(deals: DealRecord[], nextDeal: DealRecord) {
  return sortDeals([...deals, nextDeal]);
}

function getNextStageSortOrder(deals: DealRecord[], status: LeadStatusValue, excludeDealId?: string) {
  const stageDeals = deals.filter((deal) => deal.status === status && deal.id !== excludeDealId);
  const maxSortOrder = stageDeals.reduce((max, deal) => Math.max(max, deal.sortOrder), 0);
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
  deals: DealRecord[],
  status: LeadStatusValue,
  movingDealId: string,
  targetDealId?: string,
  placement: CardDropPlacement = "after"
) {
  const stageDeals = deals.filter((deal) => deal.status === status && deal.id !== movingDealId).sort(compareDeals);

  if (!targetDealId) {
    return getNextStageSortOrder(deals, status, movingDealId);
  }

  const targetIndex = stageDeals.findIndex((deal) => deal.id === targetDealId);

  if (targetIndex === -1) {
    return getNextStageSortOrder(deals, status, movingDealId);
  }

  const insertionIndex = placement === "before" ? targetIndex : targetIndex + 1;
  return getSortOrderBetween(stageDeals[insertionIndex - 1]?.sortOrder, stageDeals[insertionIndex]?.sortOrder);
}

function DealModal({
  open,
  mode,
  form,
  teamMembers,
  busy,
  onClose,
  onChange,
  onSubmit,
  onDelete
}: {
  open: boolean;
  mode: "create" | "edit";
  form: DealFormState;
  teamMembers: Array<{
    id: string;
    fullName: string;
    email: string;
  }>;
  busy: boolean;
  onClose: () => void;
  onChange: (next: DealFormState) => void;
  onSubmit: () => void;
  onDelete: () => void;
}) {
  if (!open) {
    return null;
  }

  const modalInputClassName =
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/10";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.22)] px-4 py-8 backdrop-blur-[2px]">
      <div className="flex max-h-[calc(100vh-4rem)] w-full max-w-[760px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
          <h2 className="text-[1.15rem] font-semibold text-slate-900">{mode === "create" ? "New deal" : "Edit deal"}</h2>
          <button onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
            <Plus className="h-4 w-4 rotate-45" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-5 py-5">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Deal title</label>
              <input className={modalInputClassName} value={form.title} onChange={(event) => onChange({ ...form, title: event.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Stage</label>
              <AppSelect className={modalInputClassName} value={form.status} onChange={(event) => onChange({ ...form, status: event.target.value as LeadStatusValue })}>
                {leadStatuses.map((status) => (
                  <option key={status} value={status}>
                    {leadStatusLabels[status]}
                  </option>
                ))}
              </AppSelect>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Deal value</label>
              <input className={modalInputClassName} type="number" min="0" placeholder="95000" value={form.value} onChange={(event) => onChange({ ...form, value: event.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Owner</label>
              <AppSelect className={modalInputClassName} value={form.ownerId} onChange={(event) => onChange({ ...form, ownerId: event.target.value })}>
                <option value="">Unassigned</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.fullName}
                  </option>
                ))}
              </AppSelect>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Due date</label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <AppDatePicker className={`${modalInputClassName} pl-10`} value={form.dueDate} onChange={(dueDate) => onChange({ ...form, dueDate })} placeholder="Select due date" />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Summary</label>
            <textarea rows={4} className={`${modalInputClassName} min-h-[104px] resize-none`} value={form.summary} onChange={(event) => onChange({ ...form, summary: event.target.value })} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-5 py-3.5">
          {mode === "edit" ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={busy}
              className="crm-btn rounded-xl border border-[#ffd1c4] bg-[#fff4f0] px-4 py-2 text-sm font-medium text-[#e25f37] hover:bg-[#ffe9e1] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              Move to trash
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            <button onClick={onClose} className="crm-btn crm-btn-secondary">
              Cancel
            </button>
            <button onClick={onSubmit} disabled={busy || !form.title.trim()} className="rounded-xl bg-[#386df4] px-4 py-2 text-sm font-medium text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60">
              {busy ? "Saving..." : mode === "create" ? "Create deal" : "Save deal"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CompanyProfileView({ profile: initialProfile, companies, teamMembers, localization }: CompanyProfileViewProps) {
  const router = useRouter();
  const { confirm: requestConfirmation, confirmationDialog } = useConfirmAction();
  const defaultOwnerId = teamMembers[0]?.id || "";
  const [profile, setProfile] = useState(initialProfile);
  const [activeTab, setActiveTab] = useState<"overview" | "employees" | "deals">("overview");
  const [employeeQuery, setEmployeeQuery] = useState("");
  const [employeeFilters, setEmployeeFilters] = useState<EmployeeFilters>(emptyEmployeeFilters());
  const [employeeSortOption, setEmployeeSortOption] = useState<EmployeeSortOption>("relevance");
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [actionMenuEmployeeId, setActionMenuEmployeeId] = useState<string | null>(null);
  const [employeeFeedback, setEmployeeFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [isEmployeeDeletePending, setIsEmployeeDeletePending] = useState<string | null>(null);
  const [isBulkEmployeeDeletePending, setIsBulkEmployeeDeletePending] = useState(false);
  const [dealView, setDealView] = useState<"board" | "table">("board");
  const [dealCards, setDealCards] = useState(() => sortDeals(profile.deals));
  const [dealQuery, setDealQuery] = useState("");
  const [dealStageFilter, setDealStageFilter] = useState<LeadStatusValue | "ALL">("ALL");
  const [showDealFilters, setShowDealFilters] = useState(false);
  const [showDealModal, setShowDealModal] = useState(false);
  const [editingDealId, setEditingDealId] = useState<string | null>(null);
  const [dealForm, setDealForm] = useState<DealFormState>(emptyDealForm("NEW", defaultOwnerId));
  const [isSavingDeal, setIsSavingDeal] = useState(false);
  const [showEditCompanyModal, setShowEditCompanyModal] = useState(false);
  const [showCreateContactModal, setShowCreateContactModal] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [dragDealId, setDragDealId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<LeadStatusValue | null>(null);
  const [dragOverDeal, setDragOverDeal] = useState<{ dealId: string; placement: CardDropPlacement } | null>(null);
  const [employeesCurrentPage, setEmployeesCurrentPage] = useState(1);
  const [employeesPageSize, setEmployeesPageSize] = useState(15);
  const deferredEmployeeQuery = useDeferredValue(employeeQuery);
  const deferredDealQuery = useDeferredValue(dealQuery);
  const teamMemberByName = useMemo(() => new Map(teamMembers.map((member) => [member.fullName, member])), [teamMembers]);
  const teamMemberByNameLower = useMemo(() => new Map(teamMembers.map((member) => [member.fullName.trim().toLowerCase(), member])), [teamMembers]);
  const dealStageFilterSelectOptions = useMemo(
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
  const employeeSearchInputRef = useRef<HTMLInputElement | null>(null);
  const dealSearchInputRef = useRef<HTMLInputElement | null>(null);
  const dragStartedRef = useRef(false);
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
    setDragDealId(null);
    setDragOverStage(null);
    setDragOverDeal(null);
  }

  function startBoardDragScroll() {
    if (dragScrollFrameRef.current !== null) {
      return;
    }

    const step = () => {
      const container = boardScrollRef.current;
      const velocity = dragScrollVelocityRef.current;

      if (!container || !dragDealId || velocity === 0) {
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

    if (!container || !dragDealId) {
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
    setProfile(initialProfile);
    setDealCards(sortDeals(initialProfile.deals));
    setSelectedEmployeeIds([]);
    setActionMenuEmployeeId(null);
  }, [initialProfile]);

  useEffect(() => {
    if (!dragDealId) {
      dragScrollVelocityRef.current = 0;
      if (dragScrollFrameRef.current !== null) {
        cancelAnimationFrame(dragScrollFrameRef.current);
        dragScrollFrameRef.current = null;
      }
      setDragOverDeal(null);
    }
  }, [dragDealId]);

  useEffect(() => {
    return () => {
      dragScrollVelocityRef.current = 0;
      if (dragScrollFrameRef.current !== null) {
        cancelAnimationFrame(dragScrollFrameRef.current);
        dragScrollFrameRef.current = null;
      }
    };
  }, []);

  const filteredEmployees = useMemo(() => {
    const value = deferredEmployeeQuery.trim().toLowerCase();
    const next = profile.employees.filter((employee) => {
      const haystack = `${employee.name} ${employee.title} ${employee.location} ${employee.email || ""} ${employee.phone || ""}`.toLowerCase();
      if (!haystack.includes(value)) {
        return false;
      }

      if (employeeFilters.hasEmail === "yes" && !employee.email) {
        return false;
      }

      if (employeeFilters.hasEmail === "no" && employee.email) {
        return false;
      }

      if (employeeFilters.hasPhone === "yes" && !employee.phone) {
        return false;
      }

      if (employeeFilters.hasPhone === "no" && employee.phone) {
        return false;
      }

      return true;
    });

    switch (employeeSortOption) {
      case "name-asc":
        next.sort((left, right) => left.name.localeCompare(right.name));
        break;
      case "title-asc":
        next.sort((left, right) => left.title.localeCompare(right.title));
        break;
      case "location-asc":
        next.sort((left, right) => left.location.localeCompare(right.location));
        break;
      default:
        next.sort((left, right) => {
          const leftScore = [left.email ? 2 : 0, left.phone ? 1 : 0, left.linkedinUrl ? 1 : 0].reduce((sum, item) => sum + item, 0);
          const rightScore = [right.email ? 2 : 0, right.phone ? 1 : 0, right.linkedinUrl ? 1 : 0].reduce((sum, item) => sum + item, 0);
          return rightScore - leftScore || left.name.localeCompare(right.name);
        });
        break;
    }

    return next;
  }, [deferredEmployeeQuery, employeeFilters, employeeSortOption, profile.employees]);

  useEffect(() => {
    setEmployeesCurrentPage(1);
  }, [deferredEmployeeQuery, employeeFilters, employeeSortOption]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / employeesPageSize));

    if (employeesCurrentPage > totalPages) {
      setEmployeesCurrentPage(totalPages);
    }
  }, [employeesCurrentPage, employeesPageSize, filteredEmployees.length]);

  const paginatedEmployees = useMemo(
    () => paginateItems(filteredEmployees, employeesCurrentPage, employeesPageSize),
    [employeesCurrentPage, employeesPageSize, filteredEmployees]
  );
  const filteredEmployeeIdSet = useMemo(() => new Set(filteredEmployees.map((employee) => employee.id)), [filteredEmployees]);
  const selectedEmployeeIdSet = useMemo(() => new Set(selectedEmployeeIds), [selectedEmployeeIds]);
  const paginatedEmployeeIds = useMemo(() => paginatedEmployees.items.map((employee) => employee.id), [paginatedEmployees.items]);
  const selectedEmployees = useMemo(
    () => profile.employees.filter((employee) => selectedEmployeeIdSet.has(employee.id)),
    [profile.employees, selectedEmployeeIdSet]
  );
  const allPageEmployeesSelected = paginatedEmployeeIds.length > 0 && paginatedEmployeeIds.every((employeeId) => selectedEmployeeIdSet.has(employeeId));
  const somePageEmployeesSelected = paginatedEmployeeIds.some((employeeId) => selectedEmployeeIdSet.has(employeeId));
  const visibleEmployeeEmailCount = useMemo(() => filteredEmployees.filter((employee) => Boolean(employee.email)).length, [filteredEmployees]);
  const visibleEmployeePhoneCount = useMemo(() => filteredEmployees.filter((employee) => Boolean(employee.phone)).length, [filteredEmployees]);
  const visibleEmployeeLinkedinCount = useMemo(() => filteredEmployees.filter((employee) => Boolean(employee.linkedinUrl)).length, [filteredEmployees]);
  const employeeFiltersActive =
    employeeQuery.trim().length > 0 ||
    employeeSortOption !== "relevance" ||
    employeeFilters.hasEmail !== "all" ||
    employeeFilters.hasPhone !== "all";
  useCommandKFocus(employeeSearchInputRef, { enabled: activeTab === "employees", priority: 12 });
  useCommandKFocus(dealSearchInputRef, { enabled: activeTab === "deals" && showDealFilters, priority: 12 });

  useEffect(() => {
    setSelectedEmployeeIds((current) => current.filter((employeeId) => filteredEmployeeIdSet.has(employeeId)));
  }, [filteredEmployeeIdSet]);

  const toggleEmployeeSelection = (employeeId: string, checked: boolean) => {
    setSelectedEmployeeIds((current) =>
      checked ? (current.includes(employeeId) ? current : [...current, employeeId]) : current.filter((id) => id !== employeeId)
    );
  };

  const toggleAllPageEmployees = (checked: boolean) => {
    setSelectedEmployeeIds((current) => {
      if (checked) {
        const next = new Set(current);
        paginatedEmployeeIds.forEach((employeeId) => next.add(employeeId));
        return Array.from(next);
      }

      return current.filter((employeeId) => !paginatedEmployeeIds.includes(employeeId));
    });
  };

  const clearSelectedEmployees = () => {
    setSelectedEmployeeIds([]);
  };

  const handleCopyEmployeeValue = async (value: string | null | undefined, label: string) => {
    if (!value) {
      setEmployeeFeedback({ tone: "error", message: `No ${label.toLowerCase()} is saved for this employee.` });
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setEmployeeFeedback({ tone: "success", message: `${label} copied to clipboard.` });
    } catch {
      setEmployeeFeedback({ tone: "error", message: `Unable to copy ${label.toLowerCase()}.` });
    }
  };

  const handleCopySelectedEmployeeValues = async (values: string[], emptyMessage: string, successLabel: string) => {
    if (!values.length) {
      setEmployeeFeedback({ tone: "error", message: emptyMessage });
      return;
    }

    try {
      await navigator.clipboard.writeText(values.join(", "));
      setEmployeeFeedback({ tone: "success", message: `${successLabel} copied.` });
    } catch {
      setEmployeeFeedback({ tone: "error", message: `Unable to copy ${successLabel.toLowerCase()}.` });
    }
  };

  const handleEmailSelectedEmployees = () => {
    const emails = selectedEmployees.map((employee) => employee.email).filter((email): email is string => Boolean(email));

    if (!emails.length) {
      setEmployeeFeedback({ tone: "error", message: "No email addresses are available for the selected employees." });
      return;
    }

    const params = new URLSearchParams({
      compose: "new",
      to: emails.join(","),
      subject: "Follow up"
    });

    window.location.assign(`/inbox?${params.toString()}`);
  };

  const removeEmployeesFromProfile = (employeeIds: string[]) => {
    const deletedIdSet = new Set(employeeIds);
    setProfile((current) => ({
      ...current,
      contactsCount: Math.max(current.contactsCount - employeeIds.length, 0),
      employees: current.employees.filter((employee) => !deletedIdSet.has(employee.id))
    }));
    setSelectedEmployeeIds((current) => current.filter((employeeId) => !deletedIdSet.has(employeeId)));
  };

  const handleDeleteEmployee = async (employee: EmployeeRecord) => {
    const confirmed = await requestConfirmation({
      title: "Move employee to trash?",
      description: `${employee.name} will be moved to the trash bin and can be restored from Settings.`,
      confirmLabel: "Move to trash"
    });

    if (!confirmed) {
      return;
    }

    setActionMenuEmployeeId(null);
    setIsEmployeeDeletePending(employee.id);

    try {
      const response = await fetch(`/api/contacts/${employee.id}`, { method: "DELETE" });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to delete employee");
      }

      removeEmployeesFromProfile([employee.id]);
      setEmployeeFeedback({ tone: "success", message: `${employee.name} moved to trash.` });
      router.refresh();
    } catch (error) {
      setEmployeeFeedback({ tone: "error", message: error instanceof Error ? error.message : "Unable to delete employee." });
    } finally {
      setIsEmployeeDeletePending(null);
    }
  };

  const handleDeleteSelectedEmployees = async () => {
    if (!selectedEmployees.length) {
      return;
    }

    const confirmed = await requestConfirmation({
      title: "Move selected employees to trash?",
      description: `${selectedEmployees.length} employee${selectedEmployees.length === 1 ? "" : "s"} will be moved to the trash bin and can be restored from Settings.`,
      confirmLabel: "Move to trash"
    });

    if (!confirmed) {
      return;
    }

    setActionMenuEmployeeId(null);
    setIsBulkEmployeeDeletePending(true);

    const results = await Promise.allSettled(
      selectedEmployees.map(async (employee) => {
        const response = await fetch(`/api/contacts/${employee.id}`, { method: "DELETE" });
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;

        if (!response.ok) {
          throw new Error(payload?.error || "Unable to delete employee");
        }

        return employee.id;
      })
    );

    const deletedIds = results
      .filter((result): result is PromiseFulfilledResult<string> => result.status === "fulfilled")
      .map((result) => result.value);
    const failedCount = results.length - deletedIds.length;

    if (deletedIds.length) {
      removeEmployeesFromProfile(deletedIds);
    }

    setIsBulkEmployeeDeletePending(false);

    if (!deletedIds.length) {
      setEmployeeFeedback({ tone: "error", message: "Unable to delete selected employees." });
      return;
    }

    setEmployeeFeedback({
      tone: failedCount ? "error" : "success",
      message: failedCount
        ? `Moved ${deletedIds.length} employee${deletedIds.length === 1 ? "" : "s"} to trash. ${failedCount} failed.`
        : `Moved ${deletedIds.length} employee${deletedIds.length === 1 ? "" : "s"} to trash.`
    });
    router.refresh();
  };
  const boardColumns: Array<{
    key: LeadStatusValue;
    label: string;
    accent: string;
    countBadgeClass: string;
    backgroundClass: string;
  }> = [
    {
      key: "NEW",
      label: leadStatusLabels.NEW,
      accent: "bg-slate-400",
      countBadgeClass: "bg-slate-200 text-slate-600",
      backgroundClass: "bg-[linear-gradient(180deg,rgba(238,244,255,0.95),rgba(246,248,252,0.92))]"
    },
    {
      key: "QUALIFIED",
      label: leadStatusLabels.QUALIFIED,
      accent: "bg-emerald-400",
      countBadgeClass: "bg-cyan-50 text-cyan-700",
      backgroundClass: "bg-[linear-gradient(180deg,rgba(231,248,255,0.95),rgba(243,249,255,0.92))]"
    },
    {
      key: "PROPOSAL",
      label: leadStatusLabels.PROPOSAL,
      accent: "bg-indigo-400",
      countBadgeClass: "bg-indigo-50 text-indigo-700",
      backgroundClass: "bg-[linear-gradient(180deg,rgba(238,240,255,0.95),rgba(246,247,255,0.92))]"
    },
    {
      key: "NEGOTIATION",
      label: leadStatusLabels.NEGOTIATION,
      accent: "bg-amber-400",
      countBadgeClass: "bg-amber-50 text-amber-700",
      backgroundClass: "bg-[linear-gradient(180deg,rgba(255,247,232,0.95),rgba(255,251,243,0.92))]"
    },
    {
      key: "WON",
      label: leadStatusLabels.WON,
      accent: "bg-emerald-500",
      countBadgeClass: "bg-emerald-50 text-emerald-700",
      backgroundClass: "bg-[linear-gradient(180deg,rgba(237,252,243,0.95),rgba(245,255,249,0.92))]"
    },
    {
      key: "LOST",
      label: leadStatusLabels.LOST,
      accent: "bg-rose-400",
      countBadgeClass: "bg-rose-50 text-rose-700",
      backgroundClass: "bg-[linear-gradient(180deg,rgba(255,240,242,0.95),rgba(255,247,248,0.92))]"
    }
  ];

  const filteredDeals = useMemo(() => {
    return dealCards.filter((deal) => {
      const haystack = `${deal.title} ${deal.summary} ${deal.owner} ${deal.stageLabel}`.toLowerCase();
      const matchesQuery = !deferredDealQuery.trim() || haystack.includes(deferredDealQuery.trim().toLowerCase());
      const matchesStage = dealStageFilter === "ALL" || deal.status === dealStageFilter;
      return matchesQuery && matchesStage;
    });
  }, [dealCards, dealStageFilter, deferredDealQuery]);
  const reorderingLocked = Boolean(dealQuery.trim());

  const localizedDeals = useMemo(
    () =>
      filteredDeals.map((deal) => ({
        ...deal,
        valueLabel: formatLocalizedCurrency(deal.value || 0, localization),
        dueLabel: deal.dueDate ? formatLocalizedDate(deal.dueDate, localization, "monthDay") : "No date"
      })),
    [filteredDeals, localization]
  );

  const createNewDeal = (status: LeadStatusValue = "NEW") => {
    setEditingDealId(null);
    setDealForm(emptyDealForm(status, defaultOwnerId));
    setShowDealModal(true);
  };

  const saveDeal = () => {
    void (async () => {
      setIsSavingDeal(true);
      try {
        const payload = {
          name: dealForm.title,
          summary: dealForm.summary,
          companyId: profile.id || "",
          company: profile.name,
          status: dealForm.status,
          value: parseCurrencyValue(dealForm.value),
          dueDate: dealForm.dueDate ? new Date(`${dealForm.dueDate}T09:00:00`).toISOString() : "",
          assignedUsers: dealForm.ownerId ? [dealForm.ownerId] : []
        };

        const response = await fetch(editingDealId ? `/api/leads/${editingDealId}` : "/api/leads", {
          method: editingDealId ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload)
        });
        const lead = (await response.json().catch(() => null)) as unknown;

        if (!response.ok || !isLeadApiRecord(lead)) {
          throw new Error("Unable to save deal.");
        }

        const nextDeal = formatDealFromLead(lead, localization);

        setDealCards((current) =>
          editingDealId ? replaceDealInCollection(current, nextDeal) : appendDealToCollection(current, nextDeal)
        );
        setShowDealModal(false);
        setEditingDealId(null);
        setDealForm(emptyDealForm("NEW", defaultOwnerId));
      } catch (error) {
        console.error(error);
      } finally {
        setIsSavingDeal(false);
      }
    })();
  };

  const openEditDeal = (deal: DealRecord) => {
    setEditingDealId(deal.id);
    setDealForm(formFromDeal(deal));
    setShowDealModal(true);
  };

  const deleteDeal = () => {
    if (!editingDealId) {
      return;
    }

    const deal = dealCards.find((entry) => entry.id === editingDealId);
    if (!deal) {
      return;
    }

    void (async () => {
      const confirmed = await requestConfirmation({
        title: "Move lead to trash?",
        description: `Lead "${deal.title}" will be moved to trash. Related reminders and notes will be removed, and linked tasks will remain available without this deal connection.`,
        confirmLabel: "Move to trash"
      });

      if (!confirmed) {
        return;
      }

      setIsSavingDeal(true);
      try {
        const response = await fetch(`/api/leads/${deal.id}`, {
          method: "DELETE"
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error || "Unable to delete lead.");
        }

        setDealCards((current) => current.filter((entry) => entry.id !== deal.id));
        setShowDealModal(false);
        setEditingDealId(null);
        setDealForm(emptyDealForm("NEW", defaultOwnerId));
        setFeedback("Lead moved to trash.");
        router.refresh();
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to delete lead.");
      } finally {
        setIsSavingDeal(false);
      }
    })();
  };

  const importDeals = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const text = await file.text();
    const rows = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (rows.length < 2) {
      return;
    }

    const imported: DealRecord[] = [];

    for (const [index, row] of rows.slice(1).entries()) {
      const [title, stage, valueLabel, owner, summary, dueDate] = row.split(",");
      const normalizedStatus =
        leadStatuses.find((status) => leadStatusLabels[status].toLowerCase() === (stage?.trim() || "").toLowerCase()) || "NEW";

      const ownerMember = owner?.trim() ? teamMemberByNameLower.get(owner.trim().toLowerCase()) : null;
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: title?.trim() || `Imported deal ${index + 1}`,
          status: normalizedStatus,
          value: parseCurrencyValue(valueLabel || "0"),
          companyId: profile.id || "",
          company: profile.name,
          assignedUsers: ownerMember ? [ownerMember.id] : defaultOwnerId ? [defaultOwnerId] : [],
          summary: summary?.trim() || "Imported from CSV.",
          dueDate: dueDate?.trim() ? new Date(`${dueDate.trim()}T09:00:00`).toISOString() : ""
        })
      });
      const lead = (await response.json().catch(() => null)) as unknown;

      if (!response.ok || !isLeadApiRecord(lead)) {
        continue;
      }

      imported.push(formatDealFromLead(lead, localization));
    }

    setDealCards((current) => sortDeals([...imported, ...current]));
    event.target.value = "";
  };

  const moveDeal = (
    dealId: string,
    status: LeadStatusValue,
    targetDealId?: string,
    placement: CardDropPlacement = "after"
  ) => {
    const deal = dealCards.find((entry) => entry.id === dealId);

    if (!deal) {
      clearBoardDragState();
      return;
    }

    if (targetDealId === dealId) {
      clearBoardDragState();
      return;
    }

    if (reorderingLocked && targetDealId && deal.status === status) {
      setFeedback("Clear search to reorder cards by drag.");
      clearBoardDragState();
      return;
    }

    const nextSortOrder = getDropSortOrder(dealCards, status, dealId, targetDealId, placement);

    if (deal.status === status && deal.sortOrder === nextSortOrder) {
      clearBoardDragState();
      return;
    }

    const previousStatus = deal.status;
    const previousSortOrder = deal.sortOrder;
    setDealCards((current) =>
      updateDealCollection(current, dealId, (item) => ({ ...item, status, sortOrder: nextSortOrder, stageLabel: leadStatusLabels[status] }))
    );
    clearBoardDragState();

    void (async () => {
      try {
        const response = await fetch(`/api/leads/${dealId}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            status,
            sortOrder: nextSortOrder,
            ...(previousStatus !== status ? { lastContact: new Date().toISOString() } : {})
          })
        });
        const lead = (await response.json().catch(() => null)) as unknown;

        if (!response.ok || !isLeadApiRecord(lead)) {
          throw new Error("Unable to move deal.");
        }

        const nextDeal = formatDealFromLead(lead, localization);
        setDealCards((current) => replaceDealInCollection(current, nextDeal));
        if (previousStatus !== nextDeal.status) {
          setFeedback(`${nextDeal.title} moved to ${leadStatusLabels[nextDeal.status]}.`);
        }
      } catch (error) {
        setDealCards((current) =>
          updateDealCollection(current, dealId, (item) => ({
            ...item,
            status: previousStatus,
            sortOrder: previousSortOrder,
            stageLabel: leadStatusLabels[previousStatus]
          }))
        );
        setFeedback(error instanceof Error ? error.message : "Unable to move deal.");
      }
    })();
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Link href="/companies" className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/companies" className="font-medium text-slate-400 hover:text-slate-700">
              Companies
            </Link>
            <span>›</span>
            <span className="text-base font-semibold text-slate-900">{profile.name}</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <CompanyLogo
              name={profile.name}
              logoUrl={profile.logoUrl}
              className="h-16 w-16 rounded-[20%] border border-slate-200 bg-white object-contain p-3"
              fallbackClassName={`flex items-center justify-center rounded-[20%] text-[1.85rem] font-semibold ${profile.markClassName}`}
              textClassName=""
            />
            <div>
              <h1 className="text-[1.8rem] font-semibold tracking-tight text-slate-900">{profile.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-5 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" />
                  {profile.industryLabel}
                </span>
                {profile.location ? (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </span>
                ) : null}
                {profile.website ? (
                  <a href={normalizeExternalUrl(profile.website)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-slate-800">
                    <Globe2 className="h-4 w-4" />
                    {profile.website}
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <Globe2 className="h-4 w-4" />
                    Website not set
                  </span>
                )}
                {profile.linkedinUrl ? (
                  <a href={normalizeExternalUrl(profile.linkedinUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-slate-800">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowCreateContactModal(true)}
              className="crm-btn crm-btn-secondary"
            >
              <Plus className="h-4 w-4" />
              Add person
            </button>
            <button
              onClick={() => setShowEditCompanyModal(true)}
              className="crm-btn crm-btn-secondary"
            >
              <Building2 className="h-4 w-4" />
              Edit company
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-6 border-b border-slate-200">
        {[
          { id: "overview", label: "Overview" },
          { id: "employees", label: "Employees" },
          { id: "deals", label: "Deals" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as "overview" | "employees" | "deals")}
            className={`border-b-2 px-2 py-4 text-[1.02rem] font-medium ${
              activeTab === tab.id ? "border-[#386df4] text-[#386df4]" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" ? (
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <Card className="p-0">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-lg font-semibold text-slate-900">Company summary</h2>
              </div>
              <div className="space-y-5 px-5 py-5">
                <p className="text-sm leading-7 text-slate-500">{profile.description || "No company summary added yet."}</p>

                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { label: "Industry", value: profile.industries[0] || profile.industryLabel || "Not set" },
                    { label: "Stage", value: profile.stage || "Not set" },
                    { label: "Location", value: profile.location || "Not set" },
                    { label: "Phone", value: profile.phone || "Not set" }
                  ].map((item) => (
                    <div key={item.label} className="grid grid-cols-[96px_1fr] gap-4">
                      <div className="text-sm text-slate-500">{item.label}</div>
                      <div className="text-sm font-medium text-slate-900">{item.value}</div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Website</div>
                    <div className="mt-2 text-sm font-medium text-slate-900">
                      {profile.website ? (
                        <a href={normalizeExternalUrl(profile.website)} target="_blank" rel="noreferrer" className="text-[#386df4] hover:text-[#2d5de0]">
                          {profile.website}
                        </a>
                      ) : (
                        "Not set"
                      )}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">LinkedIn</div>
                    <div className="mt-2 text-sm font-medium text-slate-900">
                      {profile.linkedinUrl ? (
                        <a href={normalizeExternalUrl(profile.linkedinUrl)} target="_blank" rel="noreferrer" className="text-[#386df4] hover:text-[#2d5de0]">
                          {profile.linkedinUrl.replace(/^https?:\/\//, "")}
                        </a>
                      ) : (
                        "Not set"
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-3 text-sm text-slate-500">Keywords</div>
                  <div className="flex flex-wrap gap-2">
                    {profile.keywords.length ? (
                      profile.keywords.map((keyword) => (
                        <span key={keyword} className="rounded-full bg-[#eef3fb] px-3 py-1.5 text-sm text-slate-500">
                          {keyword}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">No keywords added.</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-0">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-lg font-semibold text-slate-900">CRM details</h2>
              </div>
              <div className="grid gap-4 px-5 py-5 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Contacts</div>
                  <div className="mt-2 text-xl font-semibold text-slate-900">{profile.contactsCount}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Employees added</div>
                  <div className="mt-2 text-xl font-semibold text-slate-900">{profile.employees.length}</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Deals</div>
                  <div className="mt-2 text-xl font-semibold text-slate-900">{dealCards.length}</div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-0">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-lg font-semibold text-slate-900">Lists</h2>
              </div>
              <div className="flex flex-wrap gap-2 px-5 py-5">
                {profile.lists.length ? (
                  profile.lists.map((list) => (
                    <span key={list} className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700">
                      {list}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">No lists assigned.</span>
                )}
              </div>
            </Card>
          </div>
        </div>
      ) : null}

      {activeTab === "employees" ? (
        <div>
          <div className="mb-4 rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_170px_170px_170px_auto]">
            <div className="relative min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                ref={employeeSearchInputRef}
                className={`${inputClassName} rounded-lg px-3 py-2 pl-9 pr-4 text-[13px]`}
                placeholder="Search employees"
                value={employeeQuery}
                onChange={(event) => setEmployeeQuery(event.target.value)}
              />
            </div>
            <div className="relative">
              <LayoutList className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <AppSelect
                className={`${inputClassName} rounded-lg px-3 py-2 pl-9 text-[13px]`}
                value={employeeSortOption}
                onChange={(event) => setEmployeeSortOption(event.target.value as EmployeeSortOption)}
              >
                <option value="relevance">Sort: Relevance</option>
                <option value="name-asc">Sort: Name</option>
                <option value="title-asc">Sort: Title</option>
                <option value="location-asc">Sort: Location</option>
              </AppSelect>
            </div>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <AppSelect
                className={`${inputClassName} rounded-lg px-3 py-2 pl-9 text-[13px]`}
                value={employeeFilters.hasEmail}
                onChange={(event) => setEmployeeFilters((current) => ({ ...current, hasEmail: event.target.value as EmployeeFilters["hasEmail"] }))}
              >
                <option value="all">Email: Any</option>
                <option value="yes">Email: Has email</option>
                <option value="no">Email: Missing</option>
              </AppSelect>
            </div>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <AppSelect
                className={`${inputClassName} rounded-lg px-3 py-2 pl-9 text-[13px]`}
                value={employeeFilters.hasPhone}
                onChange={(event) => setEmployeeFilters((current) => ({ ...current, hasPhone: event.target.value as EmployeeFilters["hasPhone"] }))}
              >
                <option value="all">Phone: Any</option>
                <option value="yes">Phone: Has phone</option>
                <option value="no">Phone: Missing</option>
              </AppSelect>
            </div>
            <button
              onClick={() => {
                setEmployeeFilters(emptyEmployeeFilters());
                setEmployeeQuery("");
                setEmployeeSortOption("relevance");
              }}
              disabled={!employeeFiltersActive}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
            <span>
              Showing <span className="font-semibold text-slate-900">{filteredEmployees.length}</span> of{" "}
              <span className="font-semibold text-slate-900">{profile.employees.length}</span> employees
            </span>
            <span>
              With email <span className="font-semibold text-slate-900">{visibleEmployeeEmailCount}</span>
            </span>
            <span>
              With phone <span className="font-semibold text-slate-900">{visibleEmployeePhoneCount}</span>
            </span>
            <span>
              With LinkedIn <span className="font-semibold text-slate-900">{visibleEmployeeLinkedinCount}</span>
            </span>
          </div>

          <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            Employees are only shown when you manually add valid company contacts.
          </div>

          {employeeFeedback ? (
            <div
              className={`mb-3 rounded-xl border px-4 py-2.5 text-sm ${
                employeeFeedback.tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-600"
              }`}
            >
              {employeeFeedback.message}
            </div>
          ) : null}

          {selectedEmployees.length ? (
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#c8d8ff] bg-[#f8fbff] px-4 py-3">
              <div className="text-sm font-medium text-slate-700">
                {selectedEmployees.length} employee{selectedEmployees.length === 1 ? "" : "s"} selected
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleEmailSelectedEmployees}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Email selected
                </button>
                <button
                  onClick={() =>
                    void handleCopySelectedEmployeeValues(
                      selectedEmployees.map((employee) => employee.email).filter((email): email is string => Boolean(email)),
                      "No email addresses are available for the selected employees.",
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
                    void handleCopySelectedEmployeeValues(
                      selectedEmployees.map((employee) => employee.phone).filter((phone): phone is string => Boolean(phone)),
                      "No phone numbers are available for the selected employees.",
                      "Phone numbers"
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Copy phones
                </button>
                <button
                  onClick={() => void handleDeleteSelectedEmployees()}
                  disabled={isBulkEmployeeDeletePending}
                  className="crm-btn crm-btn-danger disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isBulkEmployeeDeletePending ? "Deleting..." : "Delete selected"}
                </button>
                <button
                  onClick={clearSelectedEmployees}
                  className="crm-btn crm-btn-secondary inline-flex items-center gap-1.5 rounded-lg text-slate-500 hover:text-slate-700"
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
                        aria-label="Select all employees on this page"
                        checked={allPageEmployeesSelected}
                        indeterminate={!allPageEmployeesSelected && somePageEmployeesSelected}
                        onChange={(event) => toggleAllPageEmployees(event.target.checked)}
                      />
                    </th>
                    <th className="border-r border-slate-200/80 px-3 py-4 font-medium">Name</th>
                    <th className="border-r border-slate-200/80 px-3 py-4 font-medium">Title</th>
                    <th className="border-r border-slate-200/80 px-3 py-4 font-medium">Email</th>
                    <th className="border-r border-slate-200/80 px-3 py-4 font-medium">Phone</th>
                    <th className="border-r border-slate-200/80 px-3 py-4 font-medium">Location</th>
                    <th className="w-10 px-3 py-4 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="[&>tr:not(:last-child)>td]:border-b [&>tr:not(:last-child)>td]:border-slate-200/80">
                  {paginatedEmployees.items.length ? (
                    paginatedEmployees.items.map((employee) => (
                      <tr key={employee.id} className={`text-slate-700 ${selectedEmployeeIdSet.has(employee.id) ? "bg-[#f8fbff]" : ""}`}>
                        <td className="border-r border-slate-200/80 px-3 py-3 align-top">
                          <SelectionCheckbox
                            aria-label={`Select ${employee.name}`}
                            checked={selectedEmployeeIdSet.has(employee.id)}
                            onChange={(event) => toggleEmployeeSelection(employee.id, event.target.checked)}
                            className="mt-1"
                          />
                        </td>
                        <td className="border-r border-slate-200/80 px-3 py-4 align-top">
                          <Link href={`/contacts/${employee.id}` as Route} className="font-medium text-slate-900 hover:text-[#386df4]">
                            {employee.name}
                          </Link>
                        </td>
                        <td className="border-r border-slate-200/80 px-3 py-4 align-top">{employee.title}</td>
                        <td className="border-r border-slate-200/80 px-3 py-4 align-top">
                          {employee.email ? (
                            <Link href={composeEmployeeEmailHref(employee) as Route} className="flex items-center gap-2 hover:text-[#386df4]">
                              <span>{employee.email}</span>
                              <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-500">+0</span>
                            </Link>
                          ) : (
                            <Link href={`/contacts/${employee.id}` as Route} className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[12px] text-slate-700 hover:bg-slate-50">
                              <Mail className="h-3.5 w-3.5" />
                              Add email
                            </Link>
                          )}
                        </td>
                        <td className="border-r border-slate-200/80 px-3 py-4 align-top">
                          {employee.phone ? (
                            <a href={`tel:${employee.phone}`} className="flex items-center gap-2 hover:text-[#386df4]">
                              <span>{employee.phone}</span>
                              <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-500">+0</span>
                            </a>
                          ) : (
                            <Link href={`/contacts/${employee.id}` as Route} className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[12px] text-slate-700 hover:bg-slate-50">
                              <Phone className="h-3.5 w-3.5" />
                              Add mobile
                            </Link>
                          )}
                        </td>
                        <td className="border-r border-slate-200/80 px-3 py-4 align-top">{employee.location}</td>
                        <td className="px-2.5 py-3 align-top">
                          <TableActionMenu
                            open={actionMenuEmployeeId === employee.id}
                            onOpenChange={(nextOpen) => setActionMenuEmployeeId(nextOpen ? employee.id : null)}
                            minWidth={200}
                            ariaLabel={`Open actions for ${employee.name}`}
                          >
                            <Link
                              href={`/contacts/${employee.id}` as Route}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <BookOpen className="h-4 w-4" />
                              Open contact
                            </Link>
                            {employee.phone ? (
                              <a href={`tel:${employee.phone}`} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">
                                <Phone className="h-4 w-4" />
                                Call employee
                              </a>
                            ) : (
                              <button
                                disabled
                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-400 disabled:cursor-not-allowed"
                              >
                                <Phone className="h-4 w-4" />
                                Call employee
                              </button>
                            )}
                            {employee.email ? (
                              <Link
                                href={composeEmployeeEmailHref(employee) as Route}
                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                              >
                                <Mail className="h-4 w-4" />
                                Email employee
                              </Link>
                            ) : (
                              <button
                                disabled
                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-400 disabled:cursor-not-allowed"
                              >
                                <Mail className="h-4 w-4" />
                                Email employee
                              </button>
                            )}
                            <Link
                              href={composeEmployeePipelineHref(employee) as Route}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <Plus className="h-4 w-4" />
                              Add to pipeline
                            </Link>
                            {employee.linkedinUrl ? (
                              <a
                                href={normalizeExternalUrl(employee.linkedinUrl)}
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
                              onClick={() => void handleCopyEmployeeValue(employee.email, "Email")}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <Clipboard className="h-4 w-4" />
                              Copy email
                            </button>
                            <button
                              onClick={() => void handleCopyEmployeeValue(employee.phone, "Phone")}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <Clipboard className="h-4 w-4" />
                              Copy phone
                            </button>
                            <button
                              onClick={() => void handleDeleteEmployee(employee)}
                              disabled={isEmployeeDeletePending === employee.id}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              {isEmployeeDeletePending === employee.id ? "Deleting..." : "Delete"}
                            </button>
                          </TableActionMenu>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="text-slate-500">
                      <td colSpan={7} className="px-6 py-10 text-center text-sm">
                        No employees added yet. Use `Add person` to attach verified company contacts.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <PaginationControls
              currentPage={paginatedEmployees.safePage}
              pageSize={employeesPageSize}
              pageSizeOptions={[10, 15, 20]}
              totalItems={filteredEmployees.length}
              onPageChange={setEmployeesCurrentPage}
              onPageSizeChange={(value) => {
                setEmployeesPageSize(value);
                setEmployeesCurrentPage(1);
              }}
            />
          </Card>
        </div>
      ) : null}

      {activeTab === "deals" ? (
        <div>
          {feedback ? <FeedbackToast message={feedback} position="top-right" className="max-w-[min(32rem,calc(100vw-3rem))]" /> : null}

          <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowDealFilters((current) => !current)}
                className={`crm-btn crm-btn-secondary inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium ${
                  showDealFilters ? "border-[#c8d8ff] bg-[#eef4ff] text-[#386df4]" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Show filters
              </button>
              <div className="flex items-center rounded-xl bg-[#eef3fb] p-1">
                <button
                  onClick={() => setDealView("board")}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
                    dealView === "board" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
                  }`}
                >
                  <Grid2x2 className="h-4 w-4" />
                  Board
                </button>
                <button
                  onClick={() => setDealView("table")}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
                    dealView === "table" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
                  }`}
                >
                  <LayoutList className="h-4 w-4" />
                  Table
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#386df4] bg-white px-4 py-2.5 text-sm font-medium text-[#386df4] hover:bg-[#eef4ff]">
                <Download className="h-4 w-4" />
                Import CSV
                <input type="file" accept=".csv" className="hidden" onChange={importDeals} />
              </label>
              <button
                onClick={() => createNewDeal("NEW")}
                className="inline-flex items-center gap-2 rounded-xl bg-[#386df4] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2d5de0]"
              >
                <Plus className="h-4 w-4" />
                New deal
              </button>
            </div>
          </div>

          {showDealFilters ? (
            <Card className="mb-4 p-3">
              <div className="grid gap-3 md:grid-cols-[minmax(0,1.25fr)_220px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    ref={dealSearchInputRef}
                    className={`${inputClassName} rounded-lg px-3 py-2 pl-9 pr-14 text-[13px]`}
                    placeholder="Search deals"
                    value={dealQuery}
                    onChange={(event) => setDealQuery(event.target.value)}
                  />
                </div>
                <AppSelect
                  className={`${inputClassName} rounded-lg px-3 py-2 text-[13px]`}
                  value={dealStageFilter}
                  onChange={(event) => setDealStageFilter(event.target.value as LeadStatusValue | "ALL")}
                  options={dealStageFilterSelectOptions}
                  hideMenuIcons
                />
              </div>
            </Card>
          ) : null}

          {dealView === "board" ? (
            <div
              ref={boardScrollRef}
              className="overflow-x-auto px-1 pb-3 pt-1 [scrollbar-color:#b8c7e6_transparent] [scrollbar-width:thin]"
              onDragOver={(event) => {
                if (!dragDealId) {
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
                {boardColumns.map((column) => {
                  const columnDeals = localizedDeals.filter((deal) => deal.status === column.key);
                  const totalValue = columnDeals.reduce((sum, deal) => sum + deal.value, 0);
                  const isDropActive = dragOverStage === column.key;

                  return (
                    <div
                      key={column.key}
                      className={`flex min-w-[250px] flex-col rounded-2xl border border-slate-200/60 px-3 py-3 transition ${
                        isDropActive ? "bg-[#edf4ff] ring-1 ring-[#386df4]/20" : column.backgroundClass
                      }`}
                    >
                      <div className="mb-3 flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <span className={`h-4.5 w-1 rounded-full ${column.accent}`} />
                          <span className="text-[0.95rem] font-medium text-slate-800">{column.label}</span>
                          <span className={`rounded-lg px-2 py-0.5 text-[11px] ${column.countBadgeClass}`}>{columnDeals.length}</span>
                        </div>
                        <button onClick={() => createNewDeal(column.key)} className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-slate-700">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div
                        className="space-y-2.5"
                        onDragOver={(event) => {
                          event.preventDefault();
                          if (dragDealId) {
                            setDragOverStage(column.key);
                            setDragOverDeal(null);
                          }
                        }}
                        onDragEnter={(event) => {
                          event.preventDefault();
                          if (dragDealId) {
                            setDragOverStage(column.key);
                            setDragOverDeal(null);
                          }
                        }}
                        onDragLeave={(event) => {
                          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                            setDragOverStage((current) => (current === column.key ? null : current));
                            setDragOverDeal(null);
                          }
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          const dealId = event.dataTransfer.getData("text/deal-id") || dragDealId;
                          if (dealId) {
                            moveDeal(dealId, column.key);
                          }
                        }}
                      >
                        {columnDeals.length ? (
                          columnDeals.map((deal) => (
                            <div
                              key={deal.id}
                              draggable
                              onDragStart={(event) => {
                                dragStartedRef.current = true;
                                event.dataTransfer.effectAllowed = "move";
                                event.dataTransfer.setData("text/deal-id", deal.id);
                                setDragDealId(deal.id);
                              }}
                              onDragEnd={() => {
                                clearBoardDragState();
                                window.setTimeout(() => {
                                  dragStartedRef.current = false;
                                }, 0);
                              }}
                              onDragOver={(event) => {
                                if (!dragDealId || dragDealId === deal.id || reorderingLocked) {
                                  return;
                                }

                                event.preventDefault();
                                event.stopPropagation();
                                updateBoardDragScroll(event.clientX);
                                const rect = event.currentTarget.getBoundingClientRect();
                                const placement = event.clientY < rect.top + rect.height / 2 ? "before" : "after";
                                setDragOverStage(column.key);
                                setDragOverDeal({ dealId: deal.id, placement });
                              }}
                              onDragLeave={(event) => {
                                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                                  setDragOverDeal((current) => (current?.dealId === deal.id ? null : current));
                                }
                              }}
                              onDrop={(event) => {
                                const dragMarkerPlacement = dragOverDeal?.dealId === deal.id ? dragOverDeal.placement : null;

                                if (!dragDealId || dragDealId === deal.id || reorderingLocked) {
                                  return;
                                }

                                event.preventDefault();
                                event.stopPropagation();
                                moveDeal(dragDealId, column.key, deal.id, dragMarkerPlacement || "after");
                              }}
                              className={`group relative flex w-full flex-col rounded-[16px] border bg-white p-4 text-left shadow-[0_4px_16px_rgba(15,23,42,0.03)] transition-all hover:-translate-y-1 hover:border-[#c8d8ff] hover:bg-[#fcfdff] hover:shadow-[0_8px_24px_rgba(56,109,244,0.06)] ${
                                dragDealId === deal.id ? "cursor-grabbing opacity-70" : "cursor-grab"
                              } ${
                                dragOverDeal?.dealId === deal.id ? "border-[#bcd0ff]" : "border-slate-200"
                              }`}
                            >
                              {dragOverDeal?.dealId === deal.id ? (
                                <div
                                  className={`pointer-events-none absolute left-3 right-3 z-10 h-1 rounded-full bg-[#386df4] ${
                                    dragOverDeal.placement === "before" ? "top-0 -translate-y-1/2" : "bottom-0 translate-y-1/2"
                                  }`}
                                />
                              ) : null}
                              <div className="flex items-start justify-between gap-2.5">
                                <div className="min-w-0 pr-8">
                                  <div className="truncate text-[14px] font-medium leading-[1.2rem] text-slate-900 transition-colors group-hover:text-[#386df4]">{deal.title}</div>
                                  <p className="mt-1 line-clamp-2 text-[12px] leading-[1.1rem] text-slate-500">{deal.summary || "No summary added yet."}</p>
                                </div>

                                <div className="absolute right-3.5 top-3.5 flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => openEditDeal(deal)}
                                    className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-all hover:bg-slate-50 hover:text-[#386df4]"
                                  >
                                    <Cog className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>

                              <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-slate-400">
                                <span className="inline-flex items-center gap-1.5">
                                  <CompanyLogo
                                    name={profile.name}
                                    logoUrl={profile.logoUrl}
                                    className="h-4.5 w-4.5 rounded-none object-contain"
                                    fallbackClassName={`flex items-center justify-center rounded-[5px] text-[9px] font-semibold ${profile.markClassName}`}
                                  />
                                  {profile.name}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                  <CalendarDays className="h-3.5 w-3.5" />
                                  {deal.dueLabel}
                                </span>
                              </div>

                              <div className="mt-3 text-[1.35rem] font-semibold tracking-tight text-slate-900">{deal.valueLabel}</div>

                              <div className="mt-3 border-t border-slate-100 pt-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <UserAvatar
                                      name={deal.owner}
                                      imageUrl={teamMemberByName.get(deal.owner)?.avatarUrl}
                                      className="h-6 w-6 border-2 border-white text-[9px]"
                                      fallbackClassName="bg-[#eef4ff] text-[#386df4]"
                                      title={deal.owner}
                                    />
                                    <span className="truncate text-xs font-medium text-slate-500">{deal.owner}</span>
                                  </div>

                                  <div className="flex items-center gap-1.5 text-slate-400">
                                    <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-0.5 text-[10px]">
                                      <Paperclip className="h-3 w-3" />
                                      {deal.attachmentsCount}
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-0.5 text-[10px]">
                                      <MessageSquare className="h-3 w-3" />
                                      {deal.commentsCount}
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-0.5 text-[10px]">
                                      <BellRing className="h-3 w-3" />
                                      {deal.reminderCount}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-8 text-center text-[0.9rem] leading-6 text-slate-400">
                            No deals
                            <br />
                            in this
                            <br />
                            stage.
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-200 px-1 pt-4 text-sm">
                        <span className="text-slate-500">Total value</span>
                        <span className="font-semibold text-slate-900">{formatLocalizedCurrency(totalValue || 0, localization)}</span>
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
                      <th className="border-r border-slate-200/80 px-4 py-4 font-medium">Deal</th>
                      <th className="border-r border-slate-200/80 px-3 py-4 font-medium">Stage</th>
                      <th className="border-r border-slate-200/80 px-3 py-4 font-medium">Value</th>
                      <th className="border-r border-slate-200/80 px-3 py-4 font-medium">Due</th>
                      <th className="border-r border-slate-200/80 px-3 py-4 font-medium">Owner</th>
                      <th className="w-12 px-3 py-4 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="[&>tr:not(:last-child)>td]:border-b [&>tr:not(:last-child)>td]:border-slate-200/80">
                    {localizedDeals.map((deal) => (
                      <tr key={deal.id} className="text-slate-700 hover:bg-slate-50">
                        <td className="border-r border-slate-200/80 px-4 py-4">
                          <div className="font-medium text-slate-900">{deal.title}</div>
                          <div className="mt-1 text-sm text-slate-400">{deal.summary}</div>
                        </td>
                        <td className="border-r border-slate-200/80 px-3 py-4">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${leadStatusTones[deal.status]}`}>{deal.stageLabel}</span>
                        </td>
                        <td className="border-r border-slate-200/80 px-3 py-4 font-medium text-slate-900">{deal.valueLabel}</td>
                        <td className="border-r border-slate-200/80 px-3 py-4">{deal.dueLabel}</td>
                        <td className="border-r border-slate-200/80 px-3 py-4">
                          <div className="flex items-center gap-2">
                            <UserAvatar
                              name={deal.owner}
                              imageUrl={teamMemberByName.get(deal.owner)?.avatarUrl}
                              className="h-7 w-7 text-xs"
                              fallbackClassName="bg-[#eef4ff] text-[#386df4]"
                            />
                            <span>{deal.owner}</span>
                          </div>
                        </td>
                        <td className="px-3 py-4">
                          <button
                            type="button"
                            onClick={() => openEditDeal(deal)}
                            className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-50"
                          >
                            <Cog className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!localizedDeals.length ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                          No deals match the current search and filters.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      ) : null}

      <DealModal
        open={showDealModal}
        mode={editingDealId ? "edit" : "create"}
        form={dealForm}
        teamMembers={teamMembers}
        busy={isSavingDeal}
        onClose={() => {
          setShowDealModal(false);
          setEditingDealId(null);
          setDealForm(emptyDealForm("NEW", defaultOwnerId));
        }}
        onChange={setDealForm}
        onSubmit={saveDeal}
        onDelete={deleteDeal}
      />

      <CompanyFormModal
        open={showEditCompanyModal}
        mode={profile.id ? "edit" : "create"}
        titleOverride="Edit company"
        submitLabelOverride="Save changes"
        company={{
          id: profile.id || "",
          name: profile.name,
          website: profile.website,
          industry: profile.industries[0] || profile.industryLabel,
          type: profile.companyType,
          phone: profile.phone,
          location: profile.location,
          description: profile.description,
          stage: profile.stage,
          linkedinUrl: profile.linkedinUrl,
          lists: profile.lists,
          keywords: profile.keywords
        }}
        onClose={() => setShowEditCompanyModal(false)}
        onSaved={(company) => {
          setShowEditCompanyModal(false);
          setProfile((current) => ({
            ...current,
            id: company.id,
            name: company.name,
            website: company.website || current.website,
            industryLabel: company.industry || current.industryLabel,
            industries: company.industry
              ? [company.industry, ...current.industries.filter((item) => item !== company.industry)]
              : current.industries,
            companyType: company.type ?? current.companyType,
            phone: company.phone || current.phone,
            location: company.location || current.location,
            description: company.description || current.description,
            stage: company.stage || current.stage,
            linkedinUrl: company.linkedinUrl || current.linkedinUrl,
            lists: company.lists,
            keywords: company.keywords
          }));
          router.refresh();
        }}
      />

      <ContactFormModal
        open={showCreateContactModal}
        companies={companies}
        defaultCompanyId={profile.id}
        defaultCompanyName={profile.name}
        onClose={() => setShowCreateContactModal(false)}
        onCreated={(contact) => {
          setShowCreateContactModal(false);
          router.push(`/contacts/${contact.id}` as Route);
        }}
      />
      {confirmationDialog}
    </div>
  );
}

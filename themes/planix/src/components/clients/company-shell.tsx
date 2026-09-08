"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Clock3,
  Flag,
  Funnel,
  Globe2,
  Grid2x2,
  List,
  Mail,
  MapPin,
  MessageSquareMore,
  MoreHorizontal,
  MoreVertical,
  Pencil,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Avatar } from "@/components/dashboard/avatar";
import type { AvatarTone } from "@/data/dashboard";
import { ClientFormModal, type ClientFormValues } from "@/components/clients/client-form-modal";
import { CompanyLogo } from "@/components/clients/company-logo";
import { PrimarySidebar } from "@/components/layout/primary-sidebar";
import { ModalCloseButton } from "@/components/ui/modal-close-button";
import { type ClientOwnerOption, type ClientRecord, type CompanyProfile } from "@/data/clients";
import type { ClientPortalMember } from "@/data/client-portal";
import { buildMessagesHref } from "@/lib/messages-navigation";
import type { WorkspaceTeamRecord } from "@/lib/people";
import { cn } from "@/lib/utils";
import { usePersistentState } from "@/lib/use-persistent-state";

type CompanyTab = "Overview" | "Members" | "Projects";
type CompanyProjectView = "Board View" | "List View" | "Timeline View";
type CompanyProjectSort = "Sort By" | "Project Name" | "Owner" | "Due Date" | "Budget" | "Progress";
type CompanyProjectFilter = "All Projects" | CompanyProfile["projects"][number]["status"];

const companyProjectViews: CompanyProjectView[] = ["Board View", "List View", "Timeline View"];
const companyProjectSortOptions: CompanyProjectSort[] = [
  "Sort By",
  "Project Name",
  "Owner",
  "Due Date",
  "Budget",
  "Progress",
];
const companyProjectFilterOptions: CompanyProjectFilter[] = [
  "All Projects",
  "Discovery",
  "In Delivery",
  "Review",
  "Completed",
];
const memberToneCycle: AvatarTone[] = ["sand", "olive", "peach", "rose", "slate"];

type MemberFormValues = {
  name: string;
  role: string;
  department: string;
  email: string;
  location: string;
  status: CompanyProfile["employees"][number]["status"];
};

type ClientNote = {
  id: string;
  body: string;
  createdAt: string;
};

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function projectStatusClasses(status: CompanyProfile["projects"][number]["status"]) {
  if (status === "Completed") return "bg-[var(--green)]/10 text-[var(--green)] border-[var(--green)]/20";
  if (status === "Review") return "bg-[#f2c97d]/12 text-[#f2c97d] border-[#f2c97d]/18";
  if (status === "In Delivery") return "bg-[#7fb8ff]/10 text-[#9dc5ff] border-[#7fb8ff]/20";
  return "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20";
}

function employeeStatusClasses(status: CompanyProfile["employees"][number]["status"]) {
  if (status === "active") return "bg-[var(--green)]/10 text-[var(--green)]";
  if (status === "review") return "bg-[#f2c97d]/12 text-[#f2c97d]";
  return "bg-white/8 text-[var(--text-secondary)]";
}

function stageClasses(stage: ClientRecord["stage"]) {
  if (stage === "Active") return "bg-[var(--green)]/10 text-[var(--green)] border-[var(--green)]/20";
  if (stage === "Expansion") return "bg-[#7fb8ff]/10 text-[#9dc5ff] border-[#7fb8ff]/20";
  if (stage === "Paused") return "bg-white/6 text-[var(--text-secondary)] border-white/10";
  return "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20";
}

function healthClasses(health: ClientRecord["health"]) {
  if (health === "Healthy") return "bg-[var(--green)]/10 text-[var(--green)] border-[var(--green)]/20";
  if (health === "Watch") return "bg-[#f2c97d]/12 text-[#f2c97d] border-[#f2c97d]/18";
  return "bg-[var(--red)]/12 text-[var(--red)] border-[var(--red)]/18";
}

function portalStatusClasses(enabled: boolean) {
  return enabled
    ? "border-[var(--green)]/20 bg-[var(--green)]/10 text-[var(--green)]"
    : "border-white/10 bg-white/[0.04] text-[var(--text-muted)]";
}

function parseRevenueInput(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

function projectOwnerMeta(name: string, ownerOptions: ClientOwnerOption[]) {
  const owner = ownerOptions.find((item) => item.name === name);
  return {
    initials:
      name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("") || "NA",
    tone: owner?.tone ?? "slate",
  } as const;
}

function sortCompanyProjects(
  projects: CompanyProfile["projects"],
  selectedSort: CompanyProjectSort,
) {
  if (selectedSort === "Sort By") {
    return projects;
  }

  return [...projects].sort((left, right) => {
    if (selectedSort === "Project Name") return left.name.localeCompare(right.name);
    if (selectedSort === "Owner") return left.ownerName.localeCompare(right.ownerName);
    if (selectedSort === "Due Date") {
      return new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime();
    }
    if (selectedSort === "Budget") return right.budget - left.budget;
    if (selectedSort === "Progress") return right.progress - left.progress;
    return 0;
  });
}

function timelineSpan(status: CompanyProfile["projects"][number]["status"]) {
  if (status === "In Delivery") return 3;
  if (status === "Discovery") return 2;
  return 1;
}

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "NA"
  );
}

function buildClientSummary(
  client: ClientRecord,
  profile: CompanyProfile,
  members: CompanyProfile["employees"],
  projects: CompanyProfile["projects"],
) {
  const openProjects = projects.filter((project) => project.status !== "Completed").length;

  return [
    `${client.company} client summary`,
    `Stage: ${client.stage}`,
    `Health: ${client.health}`,
    `Primary contact: ${client.contactName}${client.contactRole ? `, ${client.contactRole}` : ""}`,
    `Annual contract: ${currency(client.arr)}`,
    `Next renewal: ${formatDate(client.nextRenewal)}`,
    `Open projects: ${String(openProjects).padStart(2, "0")}`,
    `Tracked members: ${String(members.length).padStart(2, "0")}`,
    `Contract model: ${profile.contractModel}`,
    `Primary goal: ${profile.primaryGoal}`,
  ].join("\n");
}

async function readResponseJson<T>(response: Response) {
  const text = await response.text();

  if (!text.trim()) {
    return null as T | null;
  }

  return JSON.parse(text) as T;
}

function MemberFormModal({
  open,
  onClose,
  initialMember,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  initialMember?: CompanyProfile["employees"][number] | null;
  onSubmit: (values: MemberFormValues) => void;
}) {
  const [form, setForm] = useState<MemberFormValues>({
    name: "",
    role: "",
    department: "",
    email: "",
    location: "",
    status: "active",
  });

  useEffect(() => {
    if (!open) return;

    if (initialMember) {
      setForm({
        name: initialMember.name,
        role: initialMember.role,
        department: initialMember.department,
        email: initialMember.email,
        location: initialMember.location,
        status: initialMember.status,
      });
      return;
    }

    setForm({
      name: "",
      role: "",
      department: "",
      email: "",
      location: "",
      status: "active",
    });
  }, [initialMember, open]);

  if (!open) return null;

  function updateField<K extends keyof MemberFormValues>(key: K, value: MemberFormValues[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit() {
    if (!form.name.trim() || !form.role.trim() || !form.email.trim()) {
      return;
    }

    onSubmit(form);
  }

  return (
    <div className="modal-overlay-shell">
      <div className="modal-overlay-backdrop bg-black/60" onClick={onClose} />
      <div className="modal-surface modal-surface-scroll max-w-[720px] border border-white/8 bg-[#18191d] p-5 shadow-2xl sm:p-7">
        <ModalCloseButton absolute onClick={onClose} aria-label="Close member form" />

        <div className="mb-6">
          <h2 className="text-[1.45rem] font-semibold tracking-tight text-[var(--text-primary)]">
            {initialMember ? "Update member profile" : "Create member profile"}
          </h2>
          <p className="mt-1 text-[14px] text-[var(--text-muted)]">
            Keep the client team current with role, department, location, and email details.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[
            { key: "name", label: "Full Name", placeholder: "Sienna Hart", icon: Users },
            { key: "role", label: "Role", placeholder: "VP Product", icon: Flag },
            { key: "department", label: "Department", placeholder: "Product", icon: Building2 },
            { key: "email", label: "Email", placeholder: "name@company.com", icon: Mail },
            { key: "location", label: "Location", placeholder: "Austin", icon: MapPin },
          ].map((field) => (
            <label
              key={field.key}
              className="rounded-[var(--radius-lg)] border border-white/8 bg-[var(--panel-muted)] px-4 py-3.5"
            >
              <span className="inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                <field.icon className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                {field.label}
              </span>
              <input
                value={form[field.key as keyof MemberFormValues] as string}
                onChange={(event) =>
                  updateField(field.key as keyof MemberFormValues, event.target.value as never)
                }
                placeholder={field.placeholder}
                className="mt-2 w-full border-none bg-transparent p-0 text-[14.5px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
              />
            </label>
          ))}

          <label className="rounded-[var(--radius-lg)] border border-white/8 bg-[var(--panel-muted)] px-4 py-3.5">
            <span className="inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
              <Clock3 className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
              Status
            </span>
            <select
              value={form.status}
              onChange={(event) => updateField("status", event.target.value as MemberFormValues["status"])}
              className="mt-2 w-full appearance-none border-none bg-transparent p-0 text-[14.5px] text-[var(--text-primary)] outline-none"
            >
              <option value="active" className="bg-[#1C1C1E] text-white">Active</option>
              <option value="review" className="bg-[#1C1C1E] text-white">In Review</option>
              <option value="offline" className="bg-[#1C1C1E] text-white">Offline</option>
            </select>
          </label>
        </div>

        <div className="mt-7 flex gap-4">
          <button
            type="button"
            onClick={handleSubmit}
            className="btn-base btn-primary flex-1 rounded-[var(--radius-lg)] py-3 text-[14px] font-semibold"
          >
            {initialMember ? "Update Member" : "Save Member"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-base btn-secondary flex-1 rounded-[var(--radius-lg)] py-3 text-[14px] font-medium text-[var(--text-primary)]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function ClientNoteModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (noteBody: string) => void;
}) {
  const [noteBody, setNoteBody] = useState("");
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  useEffect(() => {
    if (!open) {
      setNoteBody("");
      setHasAttemptedSubmit(false);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const trimmedNote = noteBody.trim();
  const noteError = hasAttemptedSubmit && !trimmedNote ? "Note text is required." : "";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasAttemptedSubmit(true);

    if (!trimmedNote) {
      return;
    }

    onSubmit(trimmedNote);
    setNoteBody("");
    setHasAttemptedSubmit(false);
  }

  return (
    <div className="modal-overlay-shell">
      <div className="modal-overlay-backdrop bg-black/60" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="modal-surface relative flex w-full max-w-[560px] flex-col border border-white/8 bg-[#18191d] shadow-[0_32px_80px_rgba(0,0,0,0.52)]"
      >
        <ModalCloseButton absolute onClick={onClose} aria-label="Close client note form" />

        <div className="border-b border-white/8 px-5 py-5 sm:px-6">
          <div className="pr-10">
            <h2 className="text-[1.32rem] font-semibold tracking-tight text-[var(--text-primary)]">Add client note</h2>
          </div>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <label className="block">
            <span className="text-[0.72rem] font-medium uppercase tracking-[0.15em] text-[var(--text-muted)]">
              Note
            </span>
            <textarea
              value={noteBody}
              onChange={(event) => setNoteBody(event.target.value)}
              rows={6}
              placeholder="Add context, follow-ups, stakeholder updates, or delivery notes..."
              className="mt-2 w-full resize-none rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.04] px-3.5 py-3 text-[0.92rem] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] transition focus:border-white/20 focus:bg-white/[0.055]"
            />
          </label>
          {noteError ? <p className="mt-2 text-[0.74rem] text-[var(--red)]">{noteError}</p> : null}
        </div>

        <div className="border-t border-white/8 px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[0.74rem] text-[var(--text-muted)]">
              Notes are stored per client and stay available on this page.
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="btn-base btn-secondary rounded-[var(--radius-lg)] border border-white/8 px-5 py-2.5 text-[13px] font-medium text-[var(--text-primary)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-base btn-primary rounded-[var(--radius-lg)] px-5 py-2.5 text-[13px] font-semibold"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export function CompanyShell({
  client,
  profile,
  ownerOptions,
  teamOptions,
}: {
  client: ClientRecord;
  profile: CompanyProfile;
  ownerOptions: ClientOwnerOption[];
  teamOptions: WorkspaceTeamRecord[];
}) {
  const router = useRouter();
  const [clientState, setClientState] = useState(client);
  const [members, setMembers] = useState(profile.employees);
  const [activeTab, setActiveTab] = usePersistentState<CompanyTab>(
    `planix.company.${client.id}.active-tab`,
    "Overview",
  );
  const [projects, setProjects] = useState(profile.projects);
  const [selectedProjectView, setSelectedProjectView] = usePersistentState<CompanyProjectView>(
    `planix.company.${client.id}.project-view`,
    "Board View",
  );
  const [selectedProjectSort, setSelectedProjectSort] = usePersistentState<CompanyProjectSort>(
    `planix.company.${client.id}.project-sort`,
    "Sort By",
  );
  const [selectedProjectFilter, setSelectedProjectFilter] = usePersistentState<CompanyProjectFilter>(
    `planix.company.${client.id}.project-filter`,
    "All Projects",
  );
  const [projectSortOpen, setProjectSortOpen] = useState(false);
  const [projectFilterOpen, setProjectFilterOpen] = useState(false);
  const [editClientOpen, setEditClientOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [portalMembers, setPortalMembers] = useState<ClientPortalMember[]>([]);
  const [portalAccessError, setPortalAccessError] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(true);
  const [portalSavingKey, setPortalSavingKey] = useState<string | null>(null);
  const [clientNotes, setClientNotes] = usePersistentState<ClientNote[]>(
    `planix.company.${client.id}.notes`,
    [],
  );
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const sortRef = useRef<HTMLDivElement | null>(null);
  const filterRef = useRef<HTMLDivElement | null>(null);

  const availableOwnerOptions = useMemo(() => {
    const ownersByName = new Map(ownerOptions.map((owner) => [owner.name, owner]));

    if (!ownersByName.has(clientState.owner.name)) {
      ownersByName.set(clientState.owner.name, {
        id: clientState.owner.id ?? clientState.owner.name,
        name: clientState.owner.name,
        initials: clientState.owner.initials,
        tone: clientState.owner.tone,
        role: clientState.owner.role || "Account owner",
        email: clientState.owner.email,
      });
    }

    return [...ownersByName.values()];
  }, [clientState.owner, ownerOptions]);

  useEffect(() => {
    setClientState(client);
  }, [client]);

  useEffect(() => {
    setProjects(profile.projects);
  }, [profile.projects]);

  useEffect(() => {
    setMembers(profile.employees);
  }, [profile.employees]);

  async function loadPortalMembers(clientId: string) {
    setPortalLoading(true);
    setPortalAccessError(null);

    try {
      const response = await fetch(`/api/clients/${clientId}/portal-access`, {
        cache: "no-store",
      });
      const payload = await readResponseJson<{
        members?: ClientPortalMember[];
        error?: string;
      }>(response);

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to load client portal access.");
      }

      setPortalMembers(payload?.members ?? []);
    } catch (error) {
      setPortalAccessError(error instanceof Error ? error.message : "Failed to load client portal access.");
    } finally {
      setPortalLoading(false);
    }
  }

  useEffect(() => {
    void loadPortalMembers(clientState.id);
  }, [clientState.id]);

  useEffect(() => {
    if (!actionFeedback) {
      return;
    }

    const timer = window.setTimeout(() => {
      setActionFeedback(null);
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [actionFeedback]);

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setProjectSortOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setProjectFilterOpen(false);
      }
    }

    if (projectSortOpen || projectFilterOpen) {
      document.addEventListener("mousedown", handleOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutside);
    };
  }, [projectFilterOpen, projectSortOpen]);

  const overviewMetrics = useMemo(
    () => [
      { label: "Annual Contract", value: currency(clientState.arr) },
      { label: "Active Projects", value: String(projects.filter((project) => project.status !== "Completed").length).padStart(2, "0") },
      { label: "Members", value: String(members.length).padStart(2, "0") },
      { label: "Next Renewal", value: formatDate(clientState.nextRenewal) },
    ],
    [clientState.arr, clientState.nextRenewal, members.length, projects],
  );

  const overviewActivity = useMemo(() => {
    const nextProject = [...projects].sort(
      (left, right) => new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime(),
    )[0];
    const flaggedMember = members.find((employee) => employee.status !== "active") ?? members[0];
    const ownerMeta = nextProject ? projectOwnerMeta(nextProject.ownerName, availableOwnerOptions) : null;

    return [
      {
        id: "account",
        initials: clientState.owner.initials,
        tone: clientState.owner.tone,
        status:
          clientState.health === "Healthy"
            ? "online"
            : clientState.health === "Watch"
              ? "neutral"
              : "busy",
        name: clientState.owner.name,
        time: "Latest update",
        action: clientState.lastActivity,
        detail: `${clientState.stage} account · ${clientState.health} health`,
      },
      nextProject
        ? {
            id: "project",
            initials: ownerMeta?.initials ?? "NA",
            tone: ownerMeta?.tone ?? "slate",
            status: nextProject.status === "Review" ? "neutral" : "online",
            name: nextProject.ownerName,
            time: `Due ${formatDate(nextProject.dueDate)}`,
            action: `Leading ${nextProject.name}`,
            detail: `${nextProject.service} · ${nextProject.progress}% complete`,
          }
        : null,
      flaggedMember
        ? {
            id: "member",
            initials: flaggedMember.initials,
            tone: flaggedMember.tone,
            status:
              flaggedMember.status === "active"
                ? "online"
                : flaggedMember.status === "review"
                  ? "neutral"
                  : "busy",
            name: flaggedMember.name,
            time: flaggedMember.location,
            action:
              flaggedMember.status === "active"
                ? "Actively engaged in current workstreams"
                : flaggedMember.status === "review"
                  ? "Needs review on current deliverables"
                  : "Currently offline from active work",
            detail: `${flaggedMember.role} · ${flaggedMember.department}`,
          }
        : null,
    ].filter(
      (
        item,
      ): item is {
        id: string;
        initials: string;
        tone: ClientRecord["owner"]["tone"];
        status: "online" | "neutral" | "busy";
        name: string;
        time: string;
        action: string;
        detail: string;
      } => item !== null,
    );
  }, [availableOwnerOptions, clientState.health, clientState.lastActivity, clientState.stage, members, projects]);

  const visibleProjects = useMemo(() => {
    const filtered =
      selectedProjectFilter === "All Projects"
        ? projects
        : projects.filter((project) => project.status === selectedProjectFilter);

    return sortCompanyProjects(filtered, selectedProjectSort);
  }, [projects, selectedProjectFilter, selectedProjectSort]);

  const boardColumns = useMemo(
    () =>
      [
        { id: "Discovery", title: "Discovery" },
        { id: "In Delivery", title: "In Delivery" },
        { id: "Review", title: "Review" },
        { id: "Completed", title: "Completed" },
      ].map((column) => ({
        ...column,
        projects: visibleProjects.filter((project) => project.status === column.id),
      })),
    [visibleProjects],
  );

  const timelineWeeks = useMemo(() => {
    const base = new Date("2026-03-24T00:00:00");
    return Array.from({ length: 6 }, (_, index) => {
      const start = new Date(base);
      start.setDate(base.getDate() + index * 7);
      return {
        id: index + 1,
        label: start.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      };
    });
  }, []);

  function serializeMembers(nextMembers: CompanyProfile["employees"]): ClientRecord["employees"] {
    return nextMembers.map((member) => ({
      id: member.id,
      name: member.name,
      role: member.role,
      department: member.department,
      email: member.email,
      location: member.location,
      initials: member.initials,
      tone: member.tone,
      status: member.status,
    }));
  }

  function findPortalMember(clientMemberId: string) {
    return portalMembers.find((member) => member.clientMemberId === clientMemberId) ?? null;
  }

  const primaryPortalMember = findPortalMember("primary-contact");

  async function updatePortalMember(
    clientMemberId: string,
    patch: {
      portalEnabled?: boolean;
      canMessage?: boolean;
    },
  ) {
    setPortalSavingKey(clientMemberId);
    setPortalAccessError(null);

    try {
      const response = await fetch(`/api/clients/${clientState.id}/portal-access/${clientMemberId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patch),
      });
      const payload = await readResponseJson<{
        member?: ClientPortalMember;
        error?: string;
      }>(response);

      if (!response.ok || !payload?.member) {
        throw new Error(payload?.error || "Failed to update client portal access.");
      }

      setPortalMembers((current) => {
        const nextMembers = current.map((member) => (
          member.clientMemberId === clientMemberId
            ? payload.member ?? member
            : member
        ));

        if (!nextMembers.some((member) => member.clientMemberId === clientMemberId) && payload.member) {
          return [...nextMembers, payload.member];
        }

        return nextMembers;
      });
      setActionFeedback({
        tone: "success",
        message: patch.portalEnabled === false
          ? "Client portal access disabled."
          : patch.portalEnabled === true
            ? "Client portal access enabled."
            : patch.canMessage === false
              ? "Client messaging disabled."
              : "Client messaging enabled.",
      });
    } catch (error) {
      setPortalAccessError(error instanceof Error ? error.message : "Failed to update client portal access.");
    } finally {
      setPortalSavingKey(null);
    }
  }

  function openClientPortalChat(member: ClientPortalMember) {
    if (!member.linkedUserId || !member.portalEnabled || !member.canMessage) {
      return;
    }

    router.push(buildMessagesHref({
      id: member.linkedUserId,
      email: member.email,
      name: member.memberName,
    }));
  }

  async function persistClientPatch(patch: Record<string, unknown>) {
    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await fetch(`/api/clients/${clientState.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patch),
      });
      const payload = (await response.json()) as { client?: ClientRecord; error?: string };

      if (!response.ok || !payload.client) {
        throw new Error(payload.error || "Failed to save client changes.");
      }

      setClientState(payload.client);
      void loadPortalMembers(payload.client.id);
      router.refresh();

      return payload.client;
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save client changes.");
      return null;
    } finally {
      setIsSaving(false);
    }
  }

  async function updateClient(form: ClientFormValues) {
    const owner = availableOwnerOptions.find((item) => item.name === form.ownerName) ?? {
      id: clientState.owner.id ?? clientState.owner.name,
      name: clientState.owner.name,
      initials: clientState.owner.initials,
      tone: clientState.owner.tone,
      role: clientState.owner.role || "Account owner",
      email: clientState.owner.email,
    };
    const nextMembers = (() => {
      const formEmployees = form.employees.filter((e) => e.name.trim());

      return formEmployees.map((employee, index) => {
        const existing = members.find(
          (member) => member.name.toLowerCase() === employee.name.trim().toLowerCase(),
        );

        if (existing) {
          return {
            ...existing,
            role: employee.role.trim() || existing.role,
            department: employee.department.trim() || existing.department,
          };
        }

        return {
          id: `member-${Date.now()}-${index}`,
          name: employee.name.trim(),
          role: employee.role.trim() || "Team Member",
          department: employee.department.trim() || teamOptions[0]?.name || "Client Team",
          email: "",
          location: clientState.location,
          initials: getInitials(employee.name.trim()),
          tone: memberToneCycle[index % memberToneCycle.length] ?? "sand",
          status: "active",
        } satisfies CompanyProfile["employees"][number];
      });
    })();

    const updatedClient = await persistClientPatch({
      company: form.company.trim(),
      contactName: form.contactName.trim(),
      contactRole: form.contactRole.trim() || "Primary Contact",
      email: form.email.trim(),
      location: form.location.trim() || "Remote",
      website: form.website.trim() || `${form.company.trim().toLowerCase().replace(/\s+/g, "")}.com`,
      logoUrl: form.logoUrl,
      ownerId: form.ownerId,
      ownerName: owner.name,
      stage: form.stage,
      health: form.health,
      arr: parseRevenueInput(form.arr),
      nextRenewal: form.nextRenewal || clientState.nextRenewal,
      lastActivity: "Client profile updated just now",
      employees: serializeMembers(nextMembers),
    });

    if (!updatedClient) {
      return;
    }

    setMembers(nextMembers);
    setEditClientOpen(false);
  }

  function openAddMember() {
    setEditingMemberId(null);
    setMemberModalOpen(true);
  }

  function openEditMember(memberId: string) {
    setEditingMemberId(memberId);
    setMemberModalOpen(true);
  }

  async function handleMemberSubmit(form: MemberFormValues) {
    const nextMembers = editingMemberId
      ? members.map((member) =>
          member.id === editingMemberId
            ? {
                ...member,
                name: form.name.trim(),
                role: form.role.trim(),
                department: form.department.trim(),
                email: form.email.trim(),
                location: form.location.trim(),
                initials: getInitials(form.name),
                status: form.status,
              }
            : member,
        )
      : [
          ...members,
          {
            id: `member-${Date.now()}`,
            name: form.name.trim(),
            role: form.role.trim(),
            department: form.department.trim(),
            email: form.email.trim(),
            location: form.location.trim(),
            initials: getInitials(form.name),
            tone: memberToneCycle[members.length % memberToneCycle.length] ?? "sand",
            status: form.status,
          } satisfies CompanyProfile["employees"][number],
        ];

    const updatedClient = await persistClientPatch({
      employees: serializeMembers(nextMembers),
      lastActivity: editingMemberId
        ? "Client member updated just now"
        : "Client member added just now",
    });

    if (!updatedClient) {
      return;
    }

    setMembers(nextMembers);
    setMemberModalOpen(false);
    setEditingMemberId(null);
  }

  async function handleShareSummary() {
    const summary = buildClientSummary(clientState, profile, members, projects);

    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({
          title: `${clientState.company} summary`,
          text: summary,
          url: window.location.href,
        });
        setActionFeedback({ tone: "success", message: "Client summary shared." });
        return;
      }

      await navigator.clipboard.writeText(`${summary}\n\n${window.location.href}`);
      setActionFeedback({ tone: "success", message: "Client summary copied to clipboard." });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setActionFeedback({ tone: "error", message: "Unable to share the client summary right now." });
    }
  }

  function handleAddNote(noteBody: string) {
    setClientNotes((current) => [
      {
        id: `note-${Date.now()}`,
        body: noteBody,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    setNoteModalOpen(false);
    setActionFeedback({ tone: "success", message: "Client note saved." });
  }

  const editingMember = editingMemberId
    ? members.find((member) => member.id === editingMemberId) ?? null
    : null;

  return (
    <main className="bg-dashboard min-h-screen text-[var(--text-primary)] lg:h-screen lg:overflow-hidden lg:p-0">
      <div className="flex w-full flex-col lg:h-full lg:flex-row">
        <PrimarySidebar />

        <div className="flex flex-1 overflow-hidden bg-[rgba(12,12,14,0.92)] lg:h-full lg:border-l lg:border-white/6">
          <div className="flex flex-1 flex-col overflow-hidden">
            <header className="shrink-0 border-b border-white/6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex flex-col gap-4">
                  <div>
                    <Link
                      href="/clients"
                      className="btn-base btn-secondary inline-flex h-11 items-center gap-2 rounded-[var(--radius-lg)] px-4 text-[13px] font-medium"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to clients
                    </Link>
                  </div>

                  <div className="flex items-center gap-5">
                    <CompanyLogo
                      company={clientState.company}
                      website={clientState.website}
                      logoUrl={clientState.logoUrl}
                      size="xl"
                    />
                    <div className="min-w-0">
                      <h1 className="type-page-title tracking-tight text-white">{clientState.company}</h1>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-[13px] text-[var(--text-secondary)]">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5">
                          <Globe2 className="h-4 w-4 text-[var(--text-muted)]" />
                          {clientState.website}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5">
                          <Building2 className="h-4 w-4 text-[var(--text-muted)]" />
                          {profile.industry}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5">
                          <MapPin className="h-4 w-4 text-[var(--text-muted)]" />
                          {profile.headquarters}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => void handleShareSummary()}
                    className="btn-base btn-secondary rounded-[var(--radius-md)] px-4 py-2.5 text-[14px] font-medium"
                  >
                    Share Summary
                  </button>
                  <button
                    type="button"
                    onClick={() => setNoteModalOpen(true)}
                    className="btn-base btn-primary rounded-[var(--radius-md)] px-4 py-2.5 text-[14px] font-semibold"
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
              {saveError && (
                <div className="mb-6 rounded-[var(--radius-lg)] border border-[var(--red)]/20 bg-[var(--red)]/10 px-4 py-3 text-[13px] text-[var(--text-primary)]">
                  {saveError}
                </div>
              )}

              {portalAccessError && (
                <div className="mb-6 rounded-[var(--radius-lg)] border border-[var(--red)]/20 bg-[var(--red)]/10 px-4 py-3 text-[13px] text-[var(--text-primary)]">
                  {portalAccessError}
                </div>
              )}

              {actionFeedback && (
                <div
                  className={cn(
                    "mb-6 rounded-[var(--radius-lg)] px-4 py-3 text-[13px] text-[var(--text-primary)]",
                    actionFeedback.tone === "success"
                      ? "border border-[var(--green)]/20 bg-[var(--green)]/10"
                      : "border border-[var(--red)]/20 bg-[var(--red)]/10",
                  )}
                >
                  {actionFeedback.message}
                </div>
              )}

              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
                {overviewMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-[var(--radius-xl)] border border-white/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] px-5 py-5"
                  >
                    <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">{metric.label}</p>
                    <p className="mt-4 text-[1.55rem] font-semibold tracking-tight text-[var(--text-primary)]">{metric.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-b border-white/6">
                <div className="type-ui flex flex-wrap items-center gap-6 text-[var(--text-muted)]">
                  {(["Overview", "Members", "Projects"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "relative pb-3 text-[14px] font-medium transition hover:text-[var(--text-primary)]",
                        activeTab === tab
                          ? "text-[var(--text-primary)] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-[var(--text-primary)]"
                          : "text-[var(--text-muted)]",
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {activeTab === "Overview" && (
                <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
                  <div className="space-y-6">
                    <section className="rounded-[var(--radius-xl)] border border-white/6 bg-[var(--panel-strong)] p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="text-[1.05rem] font-semibold tracking-tight text-[var(--text-primary)]">Company Details</h2>
                          <p className="mt-1 text-[13px] text-[var(--text-muted)]">
                            Core account information, client profile settings, and operating context.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditClientOpen(true)}
                          disabled={isSaving}
                          className="btn-base btn-secondary rounded-[var(--radius-md)] px-4 py-2.5 text-[13px] font-medium"
                        >
                          Edit Client
                        </button>
                      </div>

                      <div className="mt-5 rounded-[var(--radius-lg)] border border-white/6 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <p className="inline-flex items-center gap-2 text-[11.5px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                              <span className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] border border-white/8 bg-white/[0.04] text-[var(--text-secondary)]">
                                <Building2 className="h-3.5 w-3.5" />
                              </span>
                              Legal Name
                            </p>
                            <h3 className="mt-2 text-[1.18rem] font-semibold tracking-tight text-[var(--text-primary)]">
                              {profile.legalName}
                            </h3>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[12px] font-medium", stageClasses(clientState.stage))}>
                                {clientState.stage}
                              </span>
                              <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[12px] font-medium", healthClasses(clientState.health))}>
                                {clientState.health}
                              </span>
                              <span className="inline-flex rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[12px] font-medium text-[var(--text-secondary)]">
                                {profile.contractModel}
                              </span>
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[340px]">
                            <div className="rounded-[var(--radius-lg)] border border-white/6 bg-white/[0.03] px-4 py-3.5">
                              <p className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">
                                <Globe2 className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                                Website
                              </p>
                              <p className="mt-2 text-[14px] font-medium text-[var(--text-primary)]">{clientState.website}</p>
                            </div>
                            <div className="rounded-[var(--radius-lg)] border border-white/6 bg-white/[0.03] px-4 py-3.5">
                              <p className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">
                                <CalendarDays className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                                Renewal
                              </p>
                              <p className="mt-2 text-[14px] font-medium text-[var(--text-primary)]">{formatDate(clientState.nextRenewal)}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        {[
                          { label: "Industry", value: profile.industry, icon: Building2 },
                          { label: "Company Size", value: profile.companySize, icon: Users },
                          { label: "Founded", value: profile.founded, icon: CalendarDays },
                          { label: "Headquarters", value: profile.headquarters, icon: MapPin },
                          { label: "Timezone", value: profile.timezone, icon: Clock3 },
                          { label: "Contract Model", value: profile.contractModel, icon: Building2 },
                          { label: "Primary Goal", value: profile.primaryGoal, icon: Flag },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className={cn(
                              "rounded-[var(--radius-lg)] border border-white/6 bg-white/[0.02] px-4 py-4",
                              item.label === "Primary Goal" && "sm:col-span-2",
                            )}
                          >
                            <p className="inline-flex items-center gap-2 text-[11.5px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                              <span className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] border border-white/8 bg-white/[0.04] text-[var(--text-secondary)]">
                                <item.icon className="h-3.5 w-3.5" />
                              </span>
                              {item.label}
                            </p>
                            <p className="mt-2 text-[14px] leading-6 text-[var(--text-primary)]">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="rounded-[var(--radius-xl)] border border-white/6 bg-[var(--panel-strong)] p-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-[1.05rem] font-semibold tracking-tight text-[var(--text-primary)]">Active Project Snapshot</h2>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab("Projects");
                            setSelectedProjectView("List View");
                            setSelectedProjectFilter("All Projects");
                          }}
                          aria-label="Open all client projects"
                          title="Open all client projects"
                          className="text-[var(--text-muted)] transition hover:text-[var(--text-secondary)]"
                        >
                          <MoreHorizontal className="h-4.5 w-4.5" />
                        </button>
                      </div>

                      <div className="mt-4 space-y-3">
                        {profile.projects.map((project) => (
                          <div
                            key={project.id}
                            className="rounded-[var(--radius-lg)] border border-white/6 bg-white/[0.02] px-4 py-3.5"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-[14.5px] font-semibold text-[var(--text-primary)]">{project.name}</p>
                                <p className="mt-1 text-[12.5px] text-[var(--text-muted)]">{project.service}</p>
                              </div>
                              <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[12px] font-medium", projectStatusClasses(project.status))}>
                                {project.status}
                              </span>
                            </div>
                            <div className="mt-4 flex items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="h-2 rounded-full bg-white/6">
                                  <div
                                    className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-strong))]"
                                    style={{ width: `${project.progress}%` }}
                                  />
                                </div>
                              </div>
                              <span className="text-[12.5px] font-medium text-[var(--text-secondary)]">{project.progress}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  <div className="space-y-6">
                    <section className="rounded-[var(--radius-xl)] border border-white/6 bg-[var(--panel-strong)] p-6">
                      <h2 className="text-[1.05rem] font-semibold tracking-tight text-[var(--text-primary)]">Primary Contact</h2>
                      <div className="mt-5 rounded-[var(--radius-lg)] border border-white/6 bg-white/[0.02] p-4">
                        <div className="flex items-center gap-3">
                          <Avatar initials={clientState.contactName.split(" ").map((part) => part[0]).slice(0, 2).join("")} tone={clientState.owner.tone} size="md" />
                          <div>
                            <p className="text-[15px] font-semibold text-[var(--text-primary)]">{clientState.contactName}</p>
                            <p className="text-[13px] text-[var(--text-secondary)]">{clientState.contactRole}</p>
                          </div>
                        </div>
                        <div className="mt-4 space-y-3 text-[13px] text-[var(--text-secondary)]">
                          <p className="inline-flex items-center gap-2">
                            <Mail className="h-4 w-4 text-[var(--text-muted)]" />
                            {clientState.email}
                          </p>
                          <p className="inline-flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-[var(--text-muted)]" />
                            {clientState.location}
                          </p>
                          <p className="inline-flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-[var(--text-muted)]" />
                            Renewal {formatDate(clientState.nextRenewal)}
                          </p>
                        </div>
                        <div className="mt-5 rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.03] p-4">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="inline-flex items-center gap-2 text-[11.5px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                                <ShieldCheck className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                                Portal Access
                              </p>
                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium", portalStatusClasses(primaryPortalMember?.portalEnabled ?? false))}>
                                  {portalLoading
                                    ? "Loading"
                                    : primaryPortalMember?.portalEnabled
                                      ? "Portal enabled"
                                      : "Portal disabled"}
                                </span>
                                <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium", portalStatusClasses(Boolean(primaryPortalMember?.canMessage && primaryPortalMember?.portalEnabled)))}>
                                  {primaryPortalMember?.portalEnabled && primaryPortalMember?.canMessage
                                    ? "Messaging on"
                                    : "Messaging off"}
                                </span>
                              </div>
                              <p className="mt-3 text-[12.5px] text-[var(--text-muted)]">
                                {primaryPortalMember?.linkedUserId
                                  ? `Linked login · ${primaryPortalMember.email}`
                                  : primaryPortalMember?.portalEnabled
                                    ? "Awaiting first client login"
                                    : "Client portal is disabled for the primary contact"}
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                disabled={portalLoading || portalSavingKey === "primary-contact"}
                                onClick={() => void updatePortalMember("primary-contact", {
                                  portalEnabled: !(primaryPortalMember?.portalEnabled ?? false),
                                })}
                                className="btn-base btn-secondary rounded-[var(--radius-md)] px-3.5 py-2 text-[12px] font-medium disabled:opacity-60"
                              >
                                {(primaryPortalMember?.portalEnabled ?? false) ? "Disable portal" : "Enable portal"}
                              </button>
                              <button
                                type="button"
                                disabled={portalLoading || !primaryPortalMember?.portalEnabled || portalSavingKey === "primary-contact"}
                                onClick={() => void updatePortalMember("primary-contact", {
                                  canMessage: !Boolean(primaryPortalMember?.canMessage),
                                })}
                                className="btn-base btn-secondary rounded-[var(--radius-md)] px-3.5 py-2 text-[12px] font-medium disabled:opacity-60"
                              >
                                {primaryPortalMember?.canMessage ? "Disable messaging" : "Enable messaging"}
                              </button>
                              <button
                                type="button"
                                disabled={!primaryPortalMember?.linkedUserId || !primaryPortalMember?.portalEnabled || !primaryPortalMember?.canMessage}
                                onClick={() => {
                                  if (primaryPortalMember) {
                                    openClientPortalChat(primaryPortalMember);
                                  }
                                }}
                                className="btn-base btn-primary inline-flex items-center gap-2 rounded-[var(--radius-md)] px-3.5 py-2 text-[12px] font-semibold disabled:opacity-60"
                              >
                                <MessageSquareMore className="h-4 w-4" />
                                Message
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="rounded-[var(--radius-xl)] border border-white/6 bg-[var(--panel-strong)] p-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-[1.05rem] font-semibold tracking-tight text-[var(--text-primary)]">Members</h2>
                        <span className="text-[12px] font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">
                          {members.length} total
                        </span>
                      </div>
                      <div className="mt-5 divide-y divide-white/6">
                        {members.map((employee) => {
                          const portalMember = findPortalMember(employee.id);

                          return (
                          <article
                            key={employee.id}
                            className="flex items-start gap-3 py-4 first:pt-0 last:pb-0"
                          >
                            <Avatar
                              initials={employee.initials}
                              tone={employee.tone}
                              size="sm"
                              status={
                                employee.status === "active"
                                  ? "online"
                                  : employee.status === "review"
                                    ? "neutral"
                                    : "busy"
                              }
                            />
                            <div className="min-w-0 flex-1 pt-0.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-[0.88rem] font-semibold text-[var(--text-primary)]">{employee.name}</h3>
                                <span className="text-[0.76rem] text-[var(--text-muted)]">{employee.location}</span>
                              </div>
                              <p className="text-[0.78rem] leading-[1.35] text-[var(--text-secondary)]">
                                {employee.role} in {employee.department}
                              </p>
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium", portalStatusClasses(portalMember?.portalEnabled ?? false))}>
                                  {portalMember?.portalEnabled ? "Portal on" : "Portal off"}
                                </span>
                                <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium", portalStatusClasses(Boolean(portalMember?.portalEnabled && portalMember?.canMessage)))}>
                                  {portalMember?.portalEnabled && portalMember?.canMessage ? "Messaging on" : "Messaging off"}
                                </span>
                              </div>
                            </div>
                            <span className={cn("inline-flex w-fit shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium", employeeStatusClasses(employee.status))}>
                              {employee.status === "active" ? "Active" : employee.status === "review" ? "In Review" : "Offline"}
                            </span>
                          </article>
                          );
                        })}
                      </div>
                    </section>

                    <section className="rounded-[var(--radius-xl)] border border-white/6 bg-[var(--panel-strong)] p-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-[1.05rem] font-semibold tracking-tight text-[var(--text-primary)]">Activity</h2>
                        <span className="text-[12px] font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">
                          Recent
                        </span>
                      </div>
                      <div className="mt-5 divide-y divide-white/6">
                        {overviewActivity.map((item) => (
                          <article
                            key={item.id}
                            className="flex items-start gap-3 py-4 first:pt-0 last:pb-0"
                          >
                            <Avatar initials={item.initials} tone={item.tone} status={item.status} size="sm" />
                            <div className="min-w-0 pt-0.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-[0.88rem] font-semibold text-[var(--text-primary)]">{item.name}</h3>
                                <span className="text-[0.76rem] text-[var(--text-muted)]">{item.time}</span>
                              </div>
                              <p className="text-[0.78rem] leading-[1.35] text-[var(--text-secondary)]">{item.action}</p>
                              <div className="mt-1 rounded-[var(--radius-md)] border border-white/6 px-2.5 py-1.5 text-[0.76rem] leading-[1.35] text-[var(--text-secondary)]">
                                {item.detail}
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    </section>

                    <section className="rounded-[var(--radius-xl)] border border-white/6 bg-[var(--panel-strong)] p-6">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h2 className="text-[1.05rem] font-semibold tracking-tight text-[var(--text-primary)]">Notes</h2>
                          <p className="mt-1 text-[13px] text-[var(--text-muted)]">
                            Internal notes for this client account.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNoteModalOpen(true)}
                          className="btn-base btn-secondary rounded-[var(--radius-md)] px-3.5 py-2 text-[12.5px] font-medium"
                        >
                          Add Note
                        </button>
                      </div>
                      <div className="mt-5 space-y-3">
                        {clientNotes.length > 0 ? (
                          clientNotes.map((note) => (
                            <article
                              key={note.id}
                              className="rounded-[var(--radius-lg)] border border-white/6 bg-white/[0.02] px-4 py-4"
                            >
                              <p className="text-[13.5px] leading-6 text-[var(--text-primary)]">{note.body}</p>
                              <p className="mt-3 text-[11.5px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                                {formatDateTime(note.createdAt)}
                              </p>
                            </article>
                          ))
                        ) : (
                          <div className="rounded-[var(--radius-lg)] border border-dashed border-white/8 px-4 py-8 text-center text-[13px] text-[var(--text-muted)]">
                            No client notes yet.
                          </div>
                        )}
                      </div>
                    </section>
                  </div>
                </div>
              )}

              {activeTab === "Members" && (
                <div className="table-surface mt-6 overflow-hidden rounded-[var(--radius-xl)] border border-white/6">
                  <div className="table-header-surface flex items-center justify-between border-b border-white/6 px-6 py-4">
                    <div className="text-[12px] font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">
                      Client Members
                    </div>
                    <button
                      type="button"
                      onClick={openAddMember}
                      disabled={isSaving}
                      className="btn-base btn-primary inline-flex items-center gap-2 rounded-[var(--radius-md)] px-3.5 py-2 text-[13px] font-semibold"
                    >
                      <Plus className="h-4 w-4" />
                      Add Member
                    </button>
                  </div>
                  <div className="table-header-surface grid grid-cols-[1.25fr_0.9fr_0.95fr_0.85fr_0.85fr_1.15fr_1.25fr] gap-4 border-b border-white/6 px-6 py-4 text-[12px] font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    <span>Name</span>
                    <span>Role</span>
                    <span>Department</span>
                    <span>Location</span>
                    <span>Status</span>
                    <span>Portal</span>
                    <span className="text-right">Actions</span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {members.map((employee) => {
                      const portalMember = findPortalMember(employee.id);
                      const portalEnabled = portalMember?.portalEnabled ?? false;
                      const portalMessagingEnabled = portalEnabled && Boolean(portalMember?.canMessage);
                      const canMessageClient = portalMessagingEnabled && Boolean(portalMember?.linkedUserId);

                      return (
                      <div key={employee.id} className="grid grid-cols-[1.25fr_0.9fr_0.95fr_0.85fr_0.85fr_1.15fr_1.25fr] items-center gap-4 px-6 py-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <Avatar initials={employee.initials} tone={employee.tone} size="sm" />
                            <div className="min-w-0">
                              <p className="truncate text-[14.5px] font-semibold text-[var(--text-primary)]">{employee.name}</p>
                              <p className="truncate text-[12.5px] text-[var(--text-muted)]">{employee.email}</p>
                            </div>
                          </div>
                        </div>
                        <span className="text-[13px] text-[var(--text-secondary)]">{employee.role}</span>
                        <span className="text-[13px] text-[var(--text-secondary)]">{employee.department}</span>
                        <span className="text-[13px] text-[var(--text-secondary)]">{employee.location}</span>
                        <span className={cn("inline-flex w-fit rounded-full px-2.5 py-1 text-[12px] font-medium", employeeStatusClasses(employee.status))}>
                          {employee.status === "active" ? "Active" : employee.status === "review" ? "In Review" : "Offline"}
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium", portalStatusClasses(portalEnabled))}>
                              {portalEnabled ? "Portal on" : "Portal off"}
                            </span>
                            <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium", portalStatusClasses(portalMessagingEnabled))}>
                              {portalMessagingEnabled ? "Messaging on" : "Messaging off"}
                            </span>
                          </div>
                          <p className="mt-2 text-[11.5px] text-[var(--text-muted)]">
                            {portalLoading
                              ? "Loading access"
                              : portalMember?.linkedUserId
                                ? "Linked login"
                                : portalEnabled
                                  ? "Awaiting first login"
                                  : "No portal access"}
                          </p>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            disabled={portalLoading || portalSavingKey === employee.id}
                            onClick={() => void updatePortalMember(employee.id, {
                              portalEnabled: !portalEnabled,
                            })}
                            className="flex h-9 items-center justify-center rounded-[var(--radius-md)] border border-white/8 bg-white/[0.03] px-3 text-[11px] font-medium text-[var(--text-secondary)] transition hover:bg-white/[0.06] hover:text-[var(--text-primary)] disabled:opacity-60"
                          >
                            {portalEnabled ? "Portal off" : "Portal on"}
                          </button>
                          <button
                            type="button"
                            disabled={portalLoading || !portalEnabled || portalSavingKey === employee.id}
                            onClick={() => void updatePortalMember(employee.id, {
                              canMessage: !Boolean(portalMember?.canMessage),
                            })}
                            className="flex h-9 items-center justify-center rounded-[var(--radius-md)] border border-white/8 bg-white/[0.03] px-3 text-[11px] font-medium text-[var(--text-secondary)] transition hover:bg-white/[0.06] hover:text-[var(--text-primary)] disabled:opacity-60"
                          >
                            {portalMember?.canMessage ? "Msg off" : "Msg on"}
                          </button>
                          <button
                            type="button"
                            disabled={!canMessageClient}
                            title={canMessageClient ? `Message ${employee.name}` : `${employee.name} must log in first`}
                            onClick={() => portalMember && openClientPortalChat(portalMember)}
                            className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border border-white/8 bg-white/[0.03] text-[var(--text-muted)] transition hover:bg-white/[0.06] hover:text-[var(--text-primary)] disabled:opacity-50"
                          >
                            <MessageSquareMore className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditMember(employee.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border border-white/8 bg-white/[0.03] text-[var(--text-muted)] transition hover:bg-white/[0.06] hover:text-[var(--text-primary)]"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === "Projects" && (
                <div className="mt-6">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                      {companyProjectViews.map((view) => (
                        <button
                          key={view}
                          type="button"
                          onClick={() => setSelectedProjectView(view)}
                          className={cn(
                            "flex h-11 items-center gap-2 rounded-[var(--radius-md)] border border-white/6 px-4 text-sm transition",
                            selectedProjectView === view
                              ? "bg-white/7 text-[var(--text-primary)]"
                              : "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
                          )}
                        >
                          {view === "Board View" && <Grid2x2 className="h-4 w-4" />}
                          {view === "List View" && <List className="h-4 w-4" />}
                          {view === "Timeline View" && <Clock3 className="h-4 w-4" />}
                          {view}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative" ref={sortRef}>
                        <button
                          type="button"
                          onClick={() => {
                            setProjectSortOpen((current) => !current);
                            setProjectFilterOpen(false);
                          }}
                          className="flex h-11 items-center gap-2 rounded-[var(--radius-md)] bg-white/7 px-4 text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                        >
                          <svg viewBox="0 0 16 16" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.5">
                            <path d="M5 3.5v9m0 0-2-2m2 2 2-2M11 12.5v-9m0 0-2 2m2-2 2 2" />
                          </svg>
                          {selectedProjectSort}
                        </button>
                        {projectSortOpen && (
                          <div className="absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-[var(--radius-lg)] border border-white/8 bg-[#191a1d] py-1 shadow-2xl">
                            {companyProjectSortOptions.map((option) => (
                              <button
                                key={option}
                                type="button"
                                onClick={() => {
                                  setSelectedProjectSort(option);
                                  setProjectSortOpen(false);
                                }}
                                className={cn(
                                  "flex w-full items-center px-4 py-2.5 text-left text-[13px] font-medium transition hover:bg-white/5",
                                  selectedProjectSort === option
                                    ? "text-[var(--text-primary)]"
                                    : "text-[var(--text-secondary)]",
                                )}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="relative" ref={filterRef}>
                        <button
                          type="button"
                          onClick={() => {
                            setProjectFilterOpen((current) => !current);
                            setProjectSortOpen(false);
                          }}
                          className="flex h-11 items-center gap-2 rounded-[var(--radius-md)] bg-white/7 px-4 text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                        >
                          <Funnel className="h-4 w-4" />
                          Filter
                        </button>
                        {projectFilterOpen && (
                          <div className="absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-[var(--radius-lg)] border border-white/8 bg-[#191a1d] py-1 shadow-2xl">
                            {companyProjectFilterOptions.map((option) => (
                              <button
                                key={option}
                                type="button"
                                onClick={() => {
                                  setSelectedProjectFilter(option);
                                  setProjectFilterOpen(false);
                                }}
                                className={cn(
                                  "flex w-full items-center justify-between px-4 py-2.5 text-left text-[13px] font-medium transition hover:bg-white/5",
                                  selectedProjectFilter === option
                                    ? "text-[var(--text-primary)]"
                                    : "text-[var(--text-secondary)]",
                                )}
                              >
                                {option}
                                {selectedProjectFilter === option && <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedProjectView === "List View" ? (
                    <div className="table-surface mt-6 overflow-hidden rounded-[var(--radius-xl)] border border-white/6">
                      <div className="table-header-surface grid grid-cols-[1.45fr_1fr_0.92fr_0.92fr_0.86fr_1fr] gap-4 border-b border-white/6 px-6 py-4 text-[12px] font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">
                        <span>Project</span>
                        <span>Service</span>
                        <span>Lead</span>
                        <span>Due Date</span>
                        <span>Status</span>
                        <span>Progress</span>
                      </div>
                      <div className="divide-y divide-white/5">
                        {visibleProjects.map((project) => {
                          const ownerMeta = projectOwnerMeta(project.ownerName, availableOwnerOptions);

                          return (
                            <div key={project.id} className="grid grid-cols-[1.45fr_1fr_0.92fr_0.92fr_0.86fr_1fr] items-center gap-4 px-6 py-4">
                              <div className="min-w-0">
                                <p className="truncate text-[14.5px] font-semibold text-[var(--text-primary)]">{project.name}</p>
                                <p className="mt-1 text-[12.5px] text-[var(--text-muted)]">
                                  {project.budget > 0 ? currency(project.budget) : "Tracked in workspace"}
                                </p>
                              </div>
                              <span className="text-[13px] text-[var(--text-secondary)]">{project.service}</span>
                              <div className="flex items-center gap-3">
                                <Avatar initials={ownerMeta.initials} tone={ownerMeta.tone} size="sm" />
                                <span className="text-[13px] text-[var(--text-secondary)]">{project.ownerName}</span>
                              </div>
                              <span className="text-[13px] text-[var(--text-secondary)]">{formatDate(project.dueDate)}</span>
                              <span className={cn("inline-flex w-fit rounded-full border px-2.5 py-1 text-[12px] font-medium", projectStatusClasses(project.status))}>
                                {project.status}
                              </span>
                              <div className="min-w-0">
                                <div className="h-2 rounded-full bg-white/6">
                                  <div
                                    className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-strong))]"
                                    style={{ width: `${project.progress}%` }}
                                  />
                                </div>
                                <p className="mt-1 text-[12px] text-[var(--text-muted)]">{project.progress}% complete</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : selectedProjectView === "Timeline View" ? (
                    <div className="table-surface mt-6 overflow-x-auto rounded-[var(--radius-xl)] border border-white/6">
                      <div className="min-w-[900px]">
                        <div className="table-header-surface grid grid-cols-[280px_repeat(6,minmax(0,1fr))] border-b border-white/6">
                          <div className="px-6 py-4 text-[12px] font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">
                            Projects
                          </div>
                          {timelineWeeks.map((week) => (
                            <div
                              key={week.id}
                              className="border-l border-white/6 px-4 py-4 text-center text-[12px] font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]"
                            >
                              {week.label}
                            </div>
                          ))}
                        </div>

                        {visibleProjects.map((project) => {
                          const due = new Date(`${project.dueDate}T00:00:00`);
                          const weekOffset = Math.max(
                            0,
                            Math.min(
                              timelineWeeks.length - 1,
                              Math.floor(
                                (due.getTime() - new Date("2026-03-24T00:00:00").getTime()) / (1000 * 60 * 60 * 24 * 7),
                              ),
                            ),
                          );
                          const span = timelineSpan(project.status);
                          const start = Math.max(0, weekOffset - span + 1);

                          return (
                            <div key={project.id} className="grid grid-cols-[280px_repeat(6,minmax(0,1fr))] border-b border-white/5 last:border-b-0">
                              <div className="border-r border-white/6 px-6 py-4">
                                <p className="text-[14px] font-semibold text-[var(--text-primary)]">{project.name}</p>
                                <p className="mt-1 text-[12px] text-[var(--text-muted)]">{project.service}</p>
                              </div>
                              <div className="relative col-span-6 h-[74px]">
                                <div className="absolute inset-0 grid grid-cols-6">
                                  {timelineWeeks.map((week) => (
                                    <div key={week.id} className="border-l border-white/6" />
                                  ))}
                                </div>
                                <div
                                  className={cn(
                                    "absolute top-1/2 flex h-9 -translate-y-1/2 items-center gap-2 rounded-[var(--radius-md)] px-3 text-[12px] font-medium",
                                    projectStatusClasses(project.status),
                                  )}
                                  style={{
                                    left: `calc(${(start / timelineWeeks.length) * 100}% + 8px)`,
                                    width: `calc(${(span / timelineWeeks.length) * 100}% - 16px)`,
                                  }}
                                >
                                  <span className="truncate">{project.name}</span>
                                  <span className="ml-auto text-[11px] opacity-80">{project.progress}%</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 overflow-x-auto pb-2">
                      <div className="grid min-w-[980px] grid-cols-4 gap-5">
                        {boardColumns.map((column) => (
                          <section key={column.id} className="rounded-[var(--radius-xl)] bg-[#0f1012]">
                            <div className="flex items-center justify-between px-4 py-4">
                              <div className="flex items-center gap-2 text-[1.02rem] font-medium text-[var(--text-secondary)]">
                                <span className="h-2.5 w-2.5 rounded-full bg-[#d6c5ad]" />
                                {column.title} ({String(column.projects.length).padStart(2, "0")})
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedProjectFilter(
                                    selectedProjectFilter === column.id
                                      ? "All Projects"
                                      : (column.id as CompanyProjectFilter),
                                  );
                                }}
                                aria-label={`Filter projects by ${column.title}`}
                                title={`Filter projects by ${column.title}`}
                                className="text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="space-y-4 px-4 pb-4">
                              {column.projects.map((project) => {
                                const ownerMeta = projectOwnerMeta(project.ownerName, availableOwnerOptions);
                                return (
                                  <article
                                    key={project.id}
                                    className="rounded-[var(--radius-lg)] border border-white/6 bg-[var(--panel-strong)] p-4"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <p className="text-[14.5px] font-semibold text-[var(--text-primary)]">{project.name}</p>
                                        <p className="mt-1 text-[12px] text-[var(--text-muted)]">{project.service}</p>
                                      </div>
                                      <span className="text-[12px] font-medium text-[var(--text-secondary)]">
                                        {formatDate(project.dueDate)}
                                      </span>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-3">
                                        <Avatar initials={ownerMeta.initials} tone={ownerMeta.tone} size="sm" />
                                        <div>
                                          <p className="text-[12.5px] font-medium text-[var(--text-primary)]">{project.ownerName}</p>
                                          <p className="text-[11.5px] text-[var(--text-muted)]">
                                            {project.budget > 0 ? currency(project.budget) : "Tracked in workspace"}
                                          </p>
                                        </div>
                                      </div>
                                      <span className={cn("inline-flex rounded-[var(--radius-md)] border px-3 py-2 text-[12px] font-medium", projectStatusClasses(project.status))}>
                                        {project.status}
                                      </span>
                                    </div>

                                    <div className="mt-4">
                                      <div className="h-2 rounded-full bg-white/6">
                                        <div
                                          className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-strong))]"
                                          style={{ width: `${project.progress}%` }}
                                        />
                                      </div>
                                      <p className="mt-1 text-[12px] text-[var(--text-muted)]">{project.progress}% complete</p>
                                    </div>
                                  </article>
                                );
                              })}

                              {column.projects.length === 0 && (
                                <div className="rounded-[var(--radius-lg)] border border-dashed border-white/8 px-4 py-10 text-center text-[13px] text-[var(--text-muted)]">
                                  No projects here
                                </div>
                              )}
                            </div>
                          </section>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ClientFormModal
        open={editClientOpen}
        onClose={() => setEditClientOpen(false)}
        initialClient={{
          ...clientState,
          employees: members.map((member) => ({
            name: member.name,
            role: member.role,
            department: member.department,
          })),
        }}
        ownerOptions={availableOwnerOptions}
        teamOptions={teamOptions}
        submitError={saveError}
        onSubmit={updateClient}
      />
      <ClientNoteModal
        open={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        onSubmit={handleAddNote}
      />
      <MemberFormModal
        open={memberModalOpen}
        onClose={() => {
          setMemberModalOpen(false);
          setEditingMemberId(null);
        }}
        initialMember={editingMember}
        onSubmit={handleMemberSubmit}
      />
    </main>
  );
}

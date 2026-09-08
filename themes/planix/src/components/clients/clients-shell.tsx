"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  Building2,
  CalendarDays,
  Flag,
  Globe2,
  MoreHorizontal,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";

import { AvatarCluster } from "@/components/dashboard/avatar";
import { ClientFormModal, type ClientFormValues } from "@/components/clients/client-form-modal";
import { CompanyLogo } from "@/components/clients/company-logo";
import { PrimarySidebar } from "@/components/layout/primary-sidebar";
import { AppLoader } from "@/components/ui/app-loader";
import {
  clientHealthOptions,
  type ClientOwnerOption,
  clientSortOptions,
  clientStageOptions,
  type ClientHealth,
  type ClientRecord,
  type ClientStage,
} from "@/data/clients";
import type { AvatarTone } from "@/data/dashboard";
import type { WorkspaceTeamRecord } from "@/lib/people";
import { cn } from "@/lib/utils";
import { readMemoryCache, writeMemoryCache } from "@/lib/resource-memory-cache";
import { readJsonSafely } from "@/lib/settings-client";
import { pushWorkspaceActivity, useWorkspaceActivityFeed } from "@/lib/workspace-activity";

type SortOption = (typeof clientSortOptions)[number];
type TableMenuPosition = {
  top: number;
  left: number;
  openUpward: boolean;
};

type ClientApiPatch = {
  company?: string;
  contactName?: string;
  contactRole?: string;
  email?: string;
  location?: string;
  website?: string;
  logoUrl?: string;
  ownerId?: string;
  ownerName?: string;
  stage?: ClientStage;
  health?: ClientHealth;
  arr?: string | number;
  nextRenewal?: string;
  lastActivity?: string;
  priority?: boolean;
  archived?: boolean;
  employees?: ClientRecord["employees"];
};

const memberToneCycle: AvatarTone[] = ["sand", "olive", "peach", "rose", "slate"];

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function stageClasses(stage: ClientStage) {
  if (stage === "Active") return "bg-[var(--green)]/10 text-[var(--green)] border-[var(--green)]/20";
  if (stage === "Expansion") return "bg-[#7fb8ff]/10 text-[#9dc5ff] border-[#7fb8ff]/20";
  if (stage === "Paused") return "bg-white/6 text-[var(--text-secondary)] border-white/10";
  return "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20";
}

function healthClasses(health: ClientHealth) {
  if (health === "Healthy") return "bg-[var(--green)]/10 text-[var(--green)] border-[var(--green)]/20";
  if (health === "Watch") return "bg-[#f2c97d]/12 text-[#f2c97d] border-[#f2c97d]/18";
  return "bg-[var(--red)]/12 text-[var(--red)] border-[var(--red)]/18";
}

function parseRevenueInput(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

function buildInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "NA";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getClientMembersMeta(client: ClientRecord) {
  const employees = (client.employees ?? []).filter((employee) => employee.name.trim());

  if (employees.length === 0) {
    return {
      count: 1,
      department: client.contactRole || "Primary Contact",
      avatars: [{ initials: buildInitials(client.contactName), tone: client.owner.tone }],
    };
  }

  return {
    count: employees.length,
    department: employees[0]?.department || "Client Team",
    avatars: employees.slice(0, 3).map((employee, index) => ({
      initials: employee.initials?.trim() || buildInitials(employee.name),
      tone: employee.tone || memberToneCycle[index % memberToneCycle.length] || "sand",
    })),
  };
}

export function ClientsShell() {
  const [, setWorkspaceActivity] = useWorkspaceActivityFeed();
  const cachedClients = readMemoryCache<ClientRecord[]>("planix.cache.clients", 1000 * 60 * 10);
  const [clients, setClients] = useState<ClientRecord[]>(cachedClients ?? []);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<"All Stages" | ClientStage>("All Stages");
  const [healthFilter, setHealthFilter] = useState<"All Health" | ClientHealth>("All Health");
  const [ownerFilter, setOwnerFilter] = useState<"All Owners" | string>("All Owners");
  const [sortBy, setSortBy] = useState<SortOption>("Newest activity");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<TableMenuPosition | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [ownerOptions, setOwnerOptions] = useState<ClientOwnerOption[]>([]);
  const [teamOptions, setTeamOptions] = useState<WorkspaceTeamRecord[]>([]);
  const [isLoading, setIsLoading] = useState(() => !cachedClients);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadClients() {
      setErrorMessage(null);

      try {
        const response = await fetch("/api/clients", { cache: "no-store" });
        const payload = await readJsonSafely<{
          clients?: ClientRecord[];
          ownerOptions?: ClientOwnerOption[];
          teamOptions?: WorkspaceTeamRecord[];
          error?: string;
        }>(response);

        if (!response.ok) {
          throw new Error(payload?.error || "Failed to load clients.");
        }

        if (!cancelled) {
          setClients(payload?.clients ?? []);
          setOwnerOptions(payload?.ownerOptions ?? []);
          setTeamOptions(payload?.teamOptions ?? []);
          writeMemoryCache("planix.cache.clients", payload?.clients ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : "Failed to load clients.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadClients();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (clients.length > 0) {
      writeMemoryCache("planix.cache.clients", clients);
    }
  }, [clients]);

  const activeClients = useMemo(
    () => clients.filter((client) => !client.archived),
    [clients],
  );

  const availableOwnerOptions = useMemo(() => {
    const ownersByName = new Map(ownerOptions.map((owner) => [owner.name, owner]));

    for (const client of activeClients) {
      if (!ownersByName.has(client.owner.name)) {
        ownersByName.set(client.owner.name, {
          id: client.owner.id ?? client.owner.name,
          name: client.owner.name,
          initials: client.owner.initials,
          tone: client.owner.tone,
          role: client.owner.role || "Account owner",
          email: client.owner.email,
        });
      }
    }

    return [...ownersByName.values()].sort((left, right) => left.name.localeCompare(right.name));
  }, [activeClients, ownerOptions]);

  const filteredClients = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();
    const next = activeClients.filter((client) => {
      const matchesSearch =
        !search ||
        client.company.toLowerCase().includes(search) ||
        client.contactName.toLowerCase().includes(search) ||
        client.email.toLowerCase().includes(search) ||
        client.website.toLowerCase().includes(search);

      const matchesStage = stageFilter === "All Stages" || client.stage === stageFilter;
      const matchesHealth = healthFilter === "All Health" || client.health === healthFilter;
      const matchesOwner = ownerFilter === "All Owners" || client.owner.name === ownerFilter;

      return matchesSearch && matchesStage && matchesHealth && matchesOwner;
    });

    if (sortBy === "ARR high to low") {
      return [...next].sort((left, right) => right.arr - left.arr);
    }

    if (sortBy === "Renewal date") {
      return [...next].sort(
        (left, right) => new Date(left.nextRenewal).getTime() - new Date(right.nextRenewal).getTime(),
      );
    }

    if (sortBy === "Company name") {
      return [...next].sort((left, right) => left.company.localeCompare(right.company));
    }

    return next;
  }, [activeClients, healthFilter, ownerFilter, searchQuery, sortBy, stageFilter]);

  useEffect(() => {
    setSelectedIds((current) => current.filter((id) => filteredClients.some((client) => client.id === id)));
  }, [filteredClients]);

  const allVisibleSelected =
    filteredClients.length > 0 && filteredClients.every((client) => selectedIds.includes(client.id));

  const metrics = useMemo(() => {
    const visibleClients = filteredClients;
    const totalActiveArr = activeClients.reduce((sum, client) => sum + client.arr, 0);
    const totalVisibleArr = visibleClients.reduce((sum, client) => sum + client.arr, 0);
    const priorityVisible = visibleClients.filter((client) => client.priority).length;
    const hiddenAccounts = Math.max(activeClients.length - visibleClients.length, 0);
    const renewalsSoon = visibleClients.filter((client) => {
      const renewal = new Date(`${client.nextRenewal}T00:00:00`).getTime();
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const horizon = today + 1000 * 60 * 60 * 24 * 90;
      return renewal <= horizon;
    });
    const nextRenewal = [...renewalsSoon].sort(
      (left, right) => new Date(left.nextRenewal).getTime() - new Date(right.nextRenewal).getTime(),
    )[0];
    const atRiskAccounts = visibleClients.filter(
      (client) => client.health === "At Risk" || client.invoiceStatus === "Overdue",
    );
    const watchAccounts = visibleClients.filter((client) => client.health === "Watch").length;
    const overdueInvoices = visibleClients.filter((client) => client.invoiceStatus === "Overdue").length;

    return [
      {
        label: "Active Accounts",
        value: String(visibleClients.length).padStart(2, "0"),
        tone: "text-[var(--text-primary)]",
        icon: Building2,
        iconTone: "text-[#9dc5ff]",
        iconSurface: "bg-[#7fb8ff]/12 border-[#7fb8ff]/20",
        detail:
          hiddenAccounts > 0
            ? `${priorityVisible} priority · ${hiddenAccounts} hidden by filters`
            : `${priorityVisible} priority accounts in view`,
      },
      {
        label: "Managed ARR",
        value: currency(totalVisibleArr),
        tone: "text-[var(--text-primary)]",
        icon: TrendingUp,
        iconTone: "text-[var(--green)]",
        iconSurface: "bg-[var(--green)]/12 border-[var(--green)]/20",
        detail:
          totalVisibleArr === totalActiveArr
            ? "Full client portfolio ARR"
            : `${currency(totalActiveArr - totalVisibleArr)} outside current filters`,
      },
      {
        label: "Renewals In 90 Days",
        value: String(renewalsSoon.length).padStart(2, "0"),
        tone: "text-[var(--accent)]",
        icon: CalendarDays,
        iconTone: "text-[var(--accent)]",
        iconSurface: "bg-[var(--accent)]/12 border-[var(--accent)]/20",
        detail: nextRenewal
          ? `Next: ${nextRenewal.company} · ${new Date(`${nextRenewal.nextRenewal}T00:00:00`).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}`
          : "No renewals due in the next 90 days",
      },
      {
        label: "Accounts At Risk",
        value: String(atRiskAccounts.length).padStart(2, "0"),
        tone: "text-[#f2c97d]",
        icon: ShieldAlert,
        iconTone: "text-[#f2c97d]",
        iconSurface: "bg-[#f2c97d]/12 border-[#f2c97d]/20",
        detail:
          atRiskAccounts.length > 0
            ? `${watchAccounts} on watch · ${overdueInvoices} overdue invoice${overdueInvoices === 1 ? "" : "s"}`
            : "No at-risk accounts in current view",
      },
    ];
  }, [activeClients, filteredClients]);

  function toggleSelection(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function toggleSelectAll() {
    if (allVisibleSelected) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(filteredClients.map((client) => client.id));
  }

  function buildClientPayload(form: ClientFormValues): ClientApiPatch {
    return {
      company: form.company.trim(),
      contactName: form.contactName.trim(),
      contactRole: form.contactRole.trim() || "Primary Contact",
      email: form.email.trim(),
      location: form.location.trim() || "Remote",
      website: form.website.trim() || `${form.company.trim().toLowerCase().replace(/\s+/g, "")}.com`,
      logoUrl: form.logoUrl,
      ownerId: form.ownerId,
      ownerName: form.ownerName,
      stage: form.stage,
      health: form.health,
      arr: parseRevenueInput(form.arr),
      nextRenewal: form.nextRenewal || "2026-12-31",
      employees: form.employees
        .filter((employee) => employee.name.trim())
        .map((employee) => ({
          name: employee.name.trim(),
          role: employee.role.trim(),
          department: employee.department.trim(),
        })),
    };
  }

  async function patchClient(id: string, patch: ClientApiPatch) {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patch),
      });
      const payload = await readJsonSafely<{ client?: ClientRecord; error?: string }>(response);

      if (!response.ok || !payload?.client) {
        throw new Error(payload?.error || "Failed to save client changes.");
      }

      const nextClient = payload.client;

      setClients((current) =>
        current.map((client) => (client.id === id ? nextClient : client)),
      );
      setWorkspaceActivity((current) =>
        pushWorkspaceActivity(current, {
          name: nextClient.company,
          initials: nextClient.company.slice(0, 2).toUpperCase(),
          tone: nextClient.owner.tone,
          status: patch.archived ? "neutral" : "online",
          action: patch.lastActivity || "Client profile updated",
          detail: nextClient.stage,
        }),
      );
      return payload.client;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to save client changes.");
      return null;
    } finally {
      setIsSaving(false);
    }
  }

  async function createClient(form: ClientFormValues) {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildClientPayload(form)),
      });
      const payload = await readJsonSafely<{ client?: ClientRecord; error?: string }>(response);

      if (!response.ok || !payload?.client) {
        throw new Error(payload?.error || "Failed to create the client.");
      }

      const nextClient = payload.client;

      setClients((current) => [nextClient, ...current]);
      setWorkspaceActivity((current) =>
        pushWorkspaceActivity(current, {
          name: nextClient.company,
          initials: nextClient.company.slice(0, 2).toUpperCase(),
          tone: nextClient.owner.tone,
          status: "online",
          action: "Added a new client",
          detail: nextClient.contactName,
        }),
      );
      setCreateOpen(false);
      setEditingClientId(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to create the client.");
    } finally {
      setIsSaving(false);
    }
  }

  async function updateExistingClient(form: ClientFormValues) {
    if (!editingClientId) return;

    const updatedClient = await patchClient(editingClientId, {
      ...buildClientPayload(form),
      lastActivity: "Client profile updated just now",
    });

    if (!updatedClient) {
      return;
    }

    setCreateOpen(false);
    setEditingClientId(null);
  }

  async function archiveSelected() {
    if (selectedIds.length === 0) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const responses = await Promise.all(
        selectedIds.map(async (id) => {
          const response = await fetch(`/api/clients/${id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              archived: true,
              lastActivity: "Client archived just now",
            } satisfies ClientApiPatch),
          });
          const payload = await readJsonSafely<{ client?: ClientRecord; error?: string }>(response);

          if (!response.ok || !payload?.client) {
            throw new Error(payload?.error || "Failed to archive one or more clients.");
          }

          return payload.client;
        }),
      );

      setClients((current) =>
        current.map((client) => responses.find((item) => item.id === client.id) ?? client),
      );
      setWorkspaceActivity((current) =>
        pushWorkspaceActivity(current, {
          name: "Clients",
          initials: "CL",
          tone: "rose",
          status: "neutral",
          action: `Archived ${responses.length} client${responses.length === 1 ? "" : "s"}`,
          detail: responses.map((client) => client.company).join(", "),
        }),
      );
      setSelectedIds([]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to archive selected clients.");
    } finally {
      setIsSaving(false);
    }
  }

  async function moveClientsToTrash(clientIds: string[]) {
    if (clientIds.length === 0) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    const deletedClients = clients.filter((client) => clientIds.includes(client.id));

    try {
      const responses = await Promise.all(
        clientIds.map(async (id) => {
          const response = await fetch(`/api/clients/${id}`, {
            method: "DELETE",
          });
          const payload = await readJsonSafely<{ ok?: boolean; error?: string }>(response);

          if (!response.ok || !payload?.ok) {
            throw new Error(payload?.error || "Failed to move one or more clients to trash.");
          }

          return id;
        }),
      );

      setClients((current) => current.filter((client) => !responses.includes(client.id)));
      setSelectedIds((current) => current.filter((id) => !responses.includes(id)));
      setWorkspaceActivity((current) =>
        pushWorkspaceActivity(current, {
          name: "Clients",
          initials: "CL",
          tone: "rose",
          status: "neutral",
          action: `Moved ${responses.length} client${responses.length === 1 ? "" : "s"} to trash`,
          detail: deletedClients.map((client) => client.company).join(", "),
        }),
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to move clients to trash.");
    } finally {
      setIsSaving(false);
    }
  }

  function openCreateModal() {
    setErrorMessage(null);
    setEditingClientId(null);
    setCreateOpen(true);
  }

  function openEditModal(client: ClientRecord) {
    setErrorMessage(null);
    setEditingClientId(client.id);
    setCreateOpen(true);
  }

  function toggleClientMenu(clientId: string, target: HTMLButtonElement) {
    if (openMenuId === clientId) {
      setOpenMenuId(null);
      setMenuPosition(null);
      return;
    }

    const rect = target.getBoundingClientRect();
    const estimatedMenuHeight = 172;
    const viewportHeight = window.innerHeight;
    const openUpward = viewportHeight - rect.bottom < estimatedMenuHeight + 16;

    setOpenMenuId(clientId);
    setMenuPosition({
      top: openUpward ? rect.top - 8 : rect.bottom + 8,
      left: rect.right,
      openUpward,
    });
  }

  const editingClient = editingClientId
    ? clients.find((client) => client.id === editingClientId) ?? null
    : null;

  return (
    <main className="bg-dashboard min-h-screen text-[var(--text-primary)] lg:h-screen lg:overflow-hidden lg:p-0">
      <div className="flex w-full flex-col lg:h-full lg:flex-row">
        <PrimarySidebar />

        <div className="flex flex-1 overflow-hidden bg-[rgba(12,12,14,0.92)] lg:h-full lg:border-l lg:border-white/6">
          {isLoading ? (
            <div className="flex w-full items-center justify-center rounded-[var(--radius-xl)] border border-white/6 border-l-0 bg-[rgba(12,12,14,0.96)] lg:rounded-none">
              <AppLoader
                fullscreen={false}
                compact
                className="min-h-[calc(100vh-8rem)] w-full rounded-none border-0 lg:min-h-full"
                label="Loading clients"
                detail="Preparing your latest client data"
              />
            </div>
          ) : (
            <div className="flex flex-1 flex-col overflow-hidden">
              <header className="shrink-0 border-b border-white/6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <h1 className="type-page-title tracking-tight text-white">Clients</h1>
                  </div>

                  <button
                    type="button"
                    onClick={openCreateModal}
                    className="btn-base btn-primary flex items-center gap-2 self-start rounded-[var(--radius-md)] px-4 py-2.5 text-[14px] font-semibold"
                  >
                    <Plus className="h-4 w-4" strokeWidth={2.5} />
                    Add Client
                  </button>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
                {selectedIds.length > 0 && (
                  <div className="mb-6 flex flex-wrap items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => void archiveSelected()}
                      disabled={isSaving}
                      className="btn-base btn-secondary rounded-[var(--radius-md)] px-4 py-2.5 text-[14px] font-medium"
                    >
                      Archive Selected ({selectedIds.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => void moveClientsToTrash(selectedIds)}
                      disabled={isSaving}
                      className="btn-base rounded-[var(--radius-md)] border border-[var(--red)]/20 bg-[var(--red)]/10 px-4 py-2.5 text-[14px] font-medium text-[var(--red)]"
                    >
                      Move Selected To Trash
                    </button>
                  </div>
                )}

                {errorMessage && !createOpen && (
                  <div className="mb-6 flex items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-[var(--red)]/20 bg-[var(--red)]/10 px-4 py-3 text-[13px] text-[var(--text-primary)]">
                    <span>{errorMessage}</span>
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--red)]"
                    >
                      Retry
                    </button>
                  </div>
                )}

              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="group overflow-hidden rounded-[var(--radius-xl)] border border-white/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] px-5 py-5 shadow-[0_18px_36px_rgba(0,0,0,0.14)] transition hover:border-white/10 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[15.5px] font-medium text-[var(--text-muted)]">{metric.label}</p>
                        <p className={cn("mt-4 text-[1.9rem] font-semibold tracking-tight", metric.tone)}>{metric.value}</p>
                      </div>
                      <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border", metric.iconSurface)}>
                        <metric.icon className={cn("h-5 w-5", metric.iconTone)} />
                      </div>
                    </div>
                    <div className="mt-4 h-px bg-white/6" />
                    <p className="mt-3 text-[13px] leading-5 text-[var(--text-secondary)]">{metric.detail}</p>
                  </div>
                ))}
              </div>

              <div className="table-surface mt-6 rounded-[var(--radius-xl)] border border-white/6">
                <div className="flex flex-col gap-4 border-b border-white/6 px-5 py-5 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex flex-1 flex-col gap-3 lg:flex-row">
                    <div className="flex min-w-[260px] flex-1 items-center gap-3 rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.02] px-4 py-3">
                      <Search className="h-4 w-4 text-[var(--text-muted)]" />
                      <input
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Search company, contact, email, or website"
                        className="w-full bg-transparent text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                      />
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <label className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.02] px-4 py-3 text-[13px] text-[var(--text-secondary)]">
                        <Building2 className="h-4 w-4 text-[var(--text-muted)]" />
                        <select
                          value={stageFilter}
                          onChange={(event) => setStageFilter(event.target.value as "All Stages" | ClientStage)}
                          className="appearance-none bg-transparent text-[14px] text-[var(--text-primary)] outline-none"
                        >
                          <option value="All Stages" className="bg-[#1C1C1E] text-white">All Stages</option>
                          {clientStageOptions.map((option) => (
                            <option key={option} value={option} className="bg-[#1C1C1E] text-white">
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.02] px-4 py-3 text-[13px] text-[var(--text-secondary)]">
                        <ShieldAlert className="h-4 w-4 text-[var(--text-muted)]" />
                        <select
                          value={healthFilter}
                          onChange={(event) => setHealthFilter(event.target.value as "All Health" | ClientHealth)}
                          className="appearance-none bg-transparent text-[14px] text-[var(--text-primary)] outline-none"
                        >
                          <option value="All Health" className="bg-[#1C1C1E] text-white">All Health</option>
                          {clientHealthOptions.map((option) => (
                            <option key={option} value={option} className="bg-[#1C1C1E] text-white">
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.02] px-4 py-3 text-[13px] text-[var(--text-secondary)]">
                        <Users className="h-4 w-4 text-[var(--text-muted)]" />
                        <select
                          value={ownerFilter}
                          onChange={(event) => setOwnerFilter(event.target.value)}
                          className="appearance-none bg-transparent text-[14px] text-[var(--text-primary)] outline-none"
                        >
                          <option value="All Owners" className="bg-[#1C1C1E] text-white">All Owners</option>
                          {availableOwnerOptions.map((owner) => (
                            <option key={owner.name} value={owner.name} className="bg-[#1C1C1E] text-white">
                              {owner.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>

                  <label className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.02] px-4 py-3 text-[13px] text-[var(--text-secondary)]">
                    <ArrowUpDown className="h-4 w-4 text-[var(--text-muted)]" />
                    <select
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value as SortOption)}
                      className="appearance-none bg-transparent text-[14px] text-[var(--text-primary)] outline-none"
                    >
                      {clientSortOptions.map((option) => (
                        <option key={option} value={option} className="bg-[#1C1C1E] text-white">
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="overflow-x-auto">
                  <div className="min-w-[980px]">
                    <div className="table-header-surface grid grid-cols-[38px_1.35fr_1.08fr_0.78fr_0.82fr_0.62fr_64px] items-stretch gap-1.5 border-b border-white/6 px-4 py-3.5 text-[12px] font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">
                      <div className="flex h-full items-center justify-center border-r border-white/6 pr-4">
                        <input
                          type="checkbox"
                          checked={allVisibleSelected}
                          onChange={toggleSelectAll}
                          className="table-checkbox"
                        />
                      </div>
                      <span className="flex h-full items-center border-r border-white/6 pr-4">Client</span>
                      <span className="flex h-full items-center border-r border-white/6 pr-4">Members</span>
                      <span className="flex h-full items-center border-r border-white/6 pr-4">Stage</span>
                      <span className="flex h-full items-center border-r border-white/6 pr-4">Health</span>
                      <span className="flex h-full items-center border-r border-white/6 pr-4">Projects</span>
                      <span className="flex h-full items-center" />
                    </div>

                    <div className="divide-y divide-white/5">
                      {filteredClients.map((client) => (
                        <div
                          key={client.id}
                          className="grid grid-cols-[38px_1.35fr_1.08fr_0.78fr_0.82fr_0.62fr_64px] items-stretch gap-1.5 px-4 py-3.5 transition-colors hover:bg-white/[0.025]"
                        >
                          <div className="flex h-full items-center justify-center border-r border-white/6 pr-4">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(client.id)}
                              onChange={() => toggleSelection(client.id)}
                              className="table-checkbox"
                            />
                          </div>

                          <div className="flex min-w-0 items-center border-r border-white/6 pr-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <CompanyLogo company={client.company} website={client.website} logoUrl={client.logoUrl} size="md" />
                              <div className="min-w-0 flex-1">
                                <div className="flex min-w-0 items-center gap-2">
                                  <Link
                                    href={`/clients/${client.id}`}
                                    className="block min-w-0 flex-1 truncate text-[15px] font-semibold tracking-tight text-[var(--text-primary)] transition hover:text-[var(--accent)]"
                                  >
                                    {client.company}
                                  </Link>
                                  {client.priority && <Flag className="h-3.5 w-3.5 fill-[var(--accent)] text-[var(--accent)]" />}
                                </div>
                                <div className="mt-1 inline-flex max-w-full items-center gap-1.5 text-[11.5px] text-[var(--text-muted)]">
                                  <Globe2 className="h-3 w-3 shrink-0" />
                                  <span className="truncate">{client.website}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex min-w-0 items-center border-r border-white/6 pr-3">
                            {(() => {
                              const members = getClientMembersMeta(client);

                              return (
                                <div className="flex items-center gap-3">
                                  <AvatarCluster members={members.avatars} size="sm" />
                                  <div className="min-w-0">
                                    <p className="truncate text-[14px] font-medium text-[var(--text-primary)]">
                                      {String(members.count).padStart(2, "0")} members
                                    </p>
                                    <p className="text-[12px] text-[var(--text-muted)]">
                                      {members.department}
                                    </p>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>

                          <div className="flex h-full items-center border-r border-white/6 pr-4">
                            <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[12px] font-medium", stageClasses(client.stage))}>
                              {client.stage}
                            </span>
                          </div>

                          <div className="flex h-full items-center border-r border-white/6 pr-4">
                            <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[12px] font-medium", healthClasses(client.health))}>
                              {client.health}
                            </span>
                          </div>

                          <div className="flex h-full items-center border-r border-white/6 pr-4">
                            <div>
                              <p className="text-[15px] font-semibold text-[var(--text-primary)]">{client.activeProjects}</p>
                              <p className="text-[12px] text-[var(--text-muted)]">open workstreams</p>
                            </div>
                          </div>

                          <div className="relative flex h-full items-center justify-end">
                            <button
                              type="button"
                              onClick={(event) => toggleClientMenu(client.id, event.currentTarget)}
                              className="inline-flex h-9 w-10 items-center justify-center rounded-[var(--radius-md)] border border-white/10 bg-white/[0.03] text-[var(--text-secondary)] transition hover:border-white/15 hover:bg-white/[0.06] hover:text-[var(--text-primary)]"
                            >
                              <MoreHorizontal className="h-4.5 w-4.5" />
                            </button>
                            {openMenuId === client.id && menuPosition && (
                              <>
                                <div
                                  className="fixed inset-0 z-20"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    setMenuPosition(null);
                                  }}
                                />
                                <div
                                  className="fixed z-30 w-44 overflow-hidden rounded-[var(--radius-lg)] border border-white/8 bg-[#191a1d] py-1 shadow-2xl"
                                  style={{
                                    top: menuPosition.top,
                                    left: menuPosition.left,
                                    transform: menuPosition.openUpward ? "translate(-100%, -100%)" : "translateX(-100%)",
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      setMenuPosition(null);
                                      openEditModal(client);
                                    }}
                                    className="flex w-full items-center px-4 py-2.5 text-left text-[13px] font-medium text-[var(--text-secondary)] transition hover:bg-white/5 hover:text-[var(--text-primary)]"
                                  >
                                    Edit client
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      setMenuPosition(null);
                                      void patchClient(client.id, {
                                        priority: !client.priority,
                                        lastActivity: client.priority
                                          ? "Priority status removed just now"
                                          : "Marked as priority just now",
                                      });
                                    }}
                                    className="flex w-full items-center px-4 py-2.5 text-left text-[13px] font-medium text-[var(--text-secondary)] transition hover:bg-white/5 hover:text-[var(--text-primary)]"
                                  >
                                    <Flag className="mr-2 h-3.5 w-3.5 shrink-0" />
                                    {client.priority ? "Remove priority" : "Mark priority"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      setMenuPosition(null);
                                      void patchClient(client.id, {
                                        stage: client.stage === "Paused" ? "Active" : "Paused",
                                        lastActivity:
                                          client.stage === "Paused"
                                            ? "Client account resumed just now"
                                            : "Client account paused just now",
                                      });
                                    }}
                                    className="flex w-full items-center px-4 py-2.5 text-left text-[13px] font-medium text-[var(--text-secondary)] transition hover:bg-white/5 hover:text-[var(--text-primary)]"
                                  >
                                    {client.stage === "Paused" ? "Resume account" : "Pause account"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      setMenuPosition(null);
                                      void patchClient(client.id, {
                                        archived: true,
                                        lastActivity: "Client archived just now",
                                      });
                                    }}
                                    className="flex w-full items-center px-4 py-2.5 text-left text-[13px] font-medium text-[var(--red)] transition hover:bg-white/5"
                                  >
                                    Archive client
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      setMenuPosition(null);
                                      void moveClientsToTrash([client.id]);
                                    }}
                                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[13px] font-medium text-[var(--red)] transition hover:bg-white/5"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Move to trash
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ))}

                      {filteredClients.length === 0 && (
                        <div className="flex min-h-[280px] items-center justify-center px-6 py-8">
                          <div className="text-center">
                            <p className="text-[15px] font-semibold text-[var(--text-primary)]">No clients match this view</p>
                            <p className="mt-1 text-[13.5px] text-[var(--text-muted)]">
                              Adjust your search or filters to surface another account segment.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ClientFormModal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setEditingClientId(null);
        }}
        initialClient={editingClient}
        ownerOptions={availableOwnerOptions}
        teamOptions={teamOptions}
        submitError={errorMessage}
        onSubmit={editingClient ? updateExistingClient : createClient}
      />
    </main>
  );
}

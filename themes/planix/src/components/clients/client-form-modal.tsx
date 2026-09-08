"use client";

import React, { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Building2, ChevronDown, FileText, Plus, Search, Users, X, ShieldCheck } from "lucide-react";

import { DatePicker } from "@/components/ui/date-picker";
import { ModalCloseButton } from "@/components/ui/modal-close-button";
import { Avatar } from "@/components/dashboard/avatar";
import {
  clientHealthOptions,
  clientStageOptions,
  type ClientHealth,
  type ClientOwnerOption,
  type ClientRecord,
  type ClientStage,
} from "@/data/clients";
import { getCompanyHostname, getCompanyNameFromHostname } from "@/lib/company-brand";
import type { WorkspaceTeamRecord } from "@/lib/people";
import { cn } from "@/lib/utils";

export type ClientFormValues = {
  company: string;
  contactName: string;
  contactRole: string;
  email: string;
  location: string;
  website: string;
  logoUrl: string;
  ownerId: string;
  ownerName: string;
  stage: ClientStage;
  health: ClientHealth;
  arr: string;
  nextRenewal: string;
  employees: Array<{ name: string; role: string; department: string }>;
};

type CompanyPreview = {
  companyName: string;
  description: string;
  hostname: string;
  website: string;
  logoUrl: string;
};

function sanitizeRevenueInput(value: string) {
  return value.replace(/[^\d]/g, "").slice(0, 9);
}

function parseRevenueInput(value: string) {
  const sanitized = sanitizeRevenueInput(value);
  return sanitized ? Number(sanitized) : 0;
}

function formatRevenueValue(value: string) {
  const numeric = parseRevenueInput(value);
  if (!numeric) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(numeric);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function buildInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "NA";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

const inputCls =
  "w-full rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.04] px-3.5 py-2.5 text-[0.9rem] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] transition focus:border-white/20 focus:bg-white/[0.055]";

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-[0.7rem] font-medium uppercase tracking-[0.15em] text-[var(--text-muted)]">
        {label}
        {required && <span className="ml-1 text-[var(--accent)]">*</span>}
      </p>
      {children}
      {error && <p className="text-[0.7rem] text-[var(--red)]">{error}</p>}
    </div>
  );
}

function Divider({ label, icon: Icon }: { label: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] border border-white/8 bg-white/[0.04] text-[var(--text-muted)]">
        <Icon className="h-3 w-3" />
      </div>
      <span className="shrink-0 text-[0.67rem] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
        {label}
      </span>
      <div className="flex-1 border-t border-white/8" />
    </div>
  );
}

export function ClientFormModal({
  open,
  onClose,
  initialClient,
  ownerOptions,
  teamOptions,
  submitError,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  initialClient?: ClientRecord | null;
  ownerOptions: ClientOwnerOption[];
  teamOptions: WorkspaceTeamRecord[];
  submitError?: string | null;
  onSubmit: (client: ClientFormValues) => void;
}) {
  const [form, setForm] = useState<ClientFormValues>({
    company: "",
    contactName: "",
    contactRole: "",
    email: "",
    location: "",
    website: "",
    logoUrl: "",
    ownerId: "",
    ownerName: "",
    stage: "Onboarding",
    health: "Healthy",
    arr: "",
    nextRenewal: "",
    employees: [],
  });
  const [preview, setPreview] = useState<CompanyPreview | null>(null);
  const [previewStatus, setPreviewStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [autoFilledCompany, setAutoFilledCompany] = useState("");
  const [ownerMenuOpen, setOwnerMenuOpen] = useState(false);
  const [ownerQuery, setOwnerQuery] = useState("");
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const ownerMenuRef = useRef<HTMLDivElement>(null);

  const filteredOwners = useMemo(
    () =>
      ownerQuery.trim()
        ? ownerOptions.filter((o) => o.name.toLowerCase().includes(ownerQuery.toLowerCase()))
        : ownerOptions,
    [ownerOptions, ownerQuery],
  );

  useEffect(() => {
    if (!open) return;

    if (initialClient) {
      setForm({
        company: initialClient.company,
        contactName: initialClient.contactName,
        contactRole: initialClient.contactRole,
        email: initialClient.email,
        location: initialClient.location,
        website: initialClient.website,
        logoUrl: initialClient.logoUrl ?? "",
        ownerId: ownerOptions.find((owner) => owner.name === initialClient.owner.name)?.id ?? "",
        ownerName: initialClient.owner.name,
        stage: initialClient.stage,
        health: initialClient.health,
        arr: String(initialClient.arr),
        nextRenewal: initialClient.nextRenewal,
        employees: (initialClient.employees ?? []).map((employee) => ({
          name: employee.name,
          role: employee.role,
          department: employee.department ?? "",
        })),
      });
      setPreview(null);
      setPreviewStatus("idle");
      setAutoFilledCompany("");
      setHasAttemptedSubmit(false);
      return;
    }

    setForm({
      company: "",
      contactName: "",
      contactRole: "",
      email: "",
      location: "",
      website: "",
      logoUrl: "",
      ownerId: "",
      ownerName: "",
      stage: "Onboarding",
      health: "Healthy",
      arr: "",
      nextRenewal: "",
      employees: [],
    });
    setPreview(null);
    setPreviewStatus("idle");
    setAutoFilledCompany("");
    setHasAttemptedSubmit(false);
  }, [initialClient, open]);

  useEffect(() => {
    if (!open || initialClient) return;

    setForm((current) => {
      if (
        current.ownerId
        && ownerOptions.some((owner) => owner.id === current.ownerId)
      ) {
        return current;
      }

      const nextOwner = ownerOptions.find((owner) => owner.name === current.ownerName);

      return {
        ...current,
        ownerId: nextOwner?.id ?? "",
        ownerName: nextOwner?.name ?? "",
      };
    });
  }, [initialClient, open, ownerOptions]);

  useEffect(() => {
    if (!open) return;

    const hostname = getCompanyHostname(form.website);

    if (!hostname) {
      setPreview(null);
      setPreviewStatus("idle");
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        setPreviewStatus("loading");

        const response = await fetch(
          `/api/company-preview?website=${encodeURIComponent(form.website.trim())}`,
          { signal: controller.signal },
        );

        if (!response.ok) throw new Error("Preview failed");

        const nextPreview = (await response.json()) as CompanyPreview;
        setPreview(nextPreview);
        setPreviewStatus("ready");

        if (nextPreview.companyName && (!form.company.trim() || form.company.trim() === autoFilledCompany)) {
          setForm((c) => ({ ...c, company: nextPreview.companyName, logoUrl: nextPreview.logoUrl }));
          setAutoFilledCompany(nextPreview.companyName);
          return;
        }

        setForm((c) => ({ ...c, logoUrl: nextPreview.logoUrl }));
      } catch {
        if (controller.signal.aborted) return;

        setPreview({
          companyName: getCompanyNameFromHostname(hostname),
          description: "",
          hostname,
          website: form.website.trim(),
          logoUrl: "",
        });
        setPreviewStatus("error");
        setForm((c) => ({ ...c, logoUrl: "" }));
      }
    }, 500);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [autoFilledCompany, form.company, form.website, open]);

  useEffect(() => {
    if (!ownerMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (ownerMenuRef.current && !ownerMenuRef.current.contains(e.target as Node)) {
        setOwnerMenuOpen(false);
        setOwnerQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [ownerMenuOpen]);

  const companyError = hasAttemptedSubmit && !form.company.trim() ? "Required" : "";
  const contactNameError = hasAttemptedSubmit && !form.contactName.trim() ? "Required" : "";
  const ownerError = hasAttemptedSubmit && (!form.ownerName.trim() || !form.ownerId.trim()) ? "Select an account owner." : "";
  const emailError = hasAttemptedSubmit
    ? !form.email.trim()
      ? "Required"
      : !isValidEmail(form.email)
        ? "Enter a valid work email."
        : ""
    : "";
  const canSubmit =
    Boolean(form.company.trim()) &&
    Boolean(form.contactName.trim()) &&
    Boolean(form.ownerName.trim()) &&
    Boolean(form.ownerId.trim()) &&
    !emailError;
  const revenueSummary = useMemo(() => formatRevenueValue(form.arr), [form.arr]);

  if (!open) return null;

  function updateField<K extends keyof ClientFormValues>(key: K, value: ClientFormValues[K]) {
    setForm((c) => ({ ...c, [key]: value }));
  }

  function addEmployee() {
    setForm((c) => ({
      ...c,
      employees: [...c.employees, { name: "", role: "", department: teamOptions[0]?.name ?? "" }],
    }));
  }

  function removeEmployee(index: number) {
    setForm((c) => ({ ...c, employees: c.employees.filter((_, i) => i !== index) }));
  }

  function updateEmployee(index: number, field: "name" | "role" | "department", value: string) {
    setForm((c) => ({
      ...c,
      employees: c.employees.map((emp, i) => i === index ? { ...emp, [field]: value } : emp),
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasAttemptedSubmit(true);
    if (!canSubmit) return;
    onSubmit({
      ...form,
      company: form.company.trim(),
      contactName: form.contactName.trim(),
      contactRole: form.contactRole.trim(),
      email: form.email.trim(),
      location: form.location.trim(),
      website: form.website.trim(),
      ownerId: form.ownerId,
      arr: sanitizeRevenueInput(form.arr),
      employees: form.employees.map((employee) => ({
        name: employee.name.trim(),
        role: employee.role.trim(),
        department: employee.department.trim(),
      })),
    });
  }

  return (
    <div className="modal-overlay-shell">
      <div className="modal-overlay-backdrop" onClick={onClose} />

      <form
        onSubmit={handleSubmit}
        className="modal-surface relative flex w-full max-w-[580px] flex-col border border-white/8 bg-[#18191d] shadow-[0_32px_80px_rgba(0,0,0,0.52)]"
      >
        {/* Close */}
        <ModalCloseButton absolute onClick={onClose} aria-label="Close client form" />

        {/* Header */}
        <div className="border-b border-white/8 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3.5 pr-10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.04]">
              <Building2 className="h-[18px] w-[18px] text-[var(--accent)]" />
            </div>
            <div>
              <h2 className="type-card-title text-[var(--text-primary)]">
                {initialClient ? "Update client record" : "Create client record"}
              </h2>
              {initialClient && (
                <p className="mt-0.5 text-[0.78rem] text-[var(--text-muted)]">
                  Update account details and ownership.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="space-y-4">

            <div className="grid grid-cols-2 gap-3">
              <Field label="Company" required error={companyError}>
                <input
                  value={form.company}
                  onChange={(e) => updateField("company", e.target.value)}
                  placeholder="Client company name"
                  autoComplete="organization"
                  className={inputCls}
                />
              </Field>

              <Field label="Website">
                <div className="relative">
                  <input
                    value={form.website}
                    onChange={(e) => setForm((c) => ({ ...c, website: e.target.value, logoUrl: "" }))}
                    placeholder="company.com"
                    autoComplete="url"
                    className={inputCls}
                  />
                  {previewStatus === "loading" && (
                    <span className="absolute right-3 top-1/2 h-2 w-2 -translate-y-1/2 animate-pulse rounded-full bg-[var(--accent)]" />
                  )}
                  {previewStatus === "ready" && (
                    <span className="absolute right-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[var(--green)]" />
                  )}
                </div>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Contact Name" required error={contactNameError}>
                <input
                  value={form.contactName}
                  onChange={(e) => updateField("contactName", e.target.value)}
                  placeholder="Sienna Hart"
                  autoComplete="name"
                  className={inputCls}
                />
              </Field>

              <Field label="Role">
                <input
                  value={form.contactRole}
                  onChange={(e) => updateField("contactRole", e.target.value)}
                  placeholder="VP Product"
                  autoComplete="organization-title"
                  className={inputCls}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Email" required error={emailError}>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="name@company.com"
                  autoComplete="email"
                  className={cn(inputCls, emailError && "border-[var(--red)]/40 focus:border-[var(--red)]/60")}
                />
              </Field>

              <Field label="Location">
                <input
                  value={form.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="Austin, TX"
                  autoComplete="address-level2"
                  className={inputCls}
                />
              </Field>
            </div>

            <Divider label="Ownership & Status" icon={ShieldCheck} />

            <Field label="Account Owner" required error={ownerError}>
              <div className="relative" ref={ownerMenuRef}>
                {(() => {
                  const selectedOwner = ownerOptions.find((owner) => owner.id === form.ownerId)
                    ?? ownerOptions.find((owner) => owner.name === form.ownerName)
                    ?? (
                    form.ownerName
                      ? {
                          id: form.ownerName,
                          name: form.ownerName,
                          initials: buildInitials(form.ownerName),
                          tone: "sand" as const,
                          role: "Workspace member",
                        }
                      : null
                  );
                  return (
                    <button
                      type="button"
                      onClick={() => {
                        if (ownerOptions.length === 0) return;
                        setOwnerMenuOpen((v) => !v);
                        setOwnerQuery("");
                      }}
                      disabled={ownerOptions.length === 0}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-[var(--radius-lg)] border bg-white/[0.04] px-3.5 py-2.5 text-left transition hover:border-white/12 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60",
                        ownerError ? "border-[var(--red)]/40" : "border-white/8",
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <Avatar initials={selectedOwner?.initials ?? "NA"} tone={selectedOwner?.tone ?? "sand"} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate text-[0.88rem] font-medium text-[var(--text-primary)]">
                            {selectedOwner?.name || (ownerOptions.length > 0 ? "Select account owner" : "No workspace member found")}
                          </p>
                          <p className="text-[0.68rem] text-[var(--text-muted)]">
                            {selectedOwner?.role || (ownerOptions.length > 0 ? "Choose a workspace member" : "Invite a workspace member first")}
                          </p>
                        </div>
                      </div>
                      <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-[var(--text-muted)] transition", ownerMenuOpen && "rotate-180")} />
                    </button>
                  );
                })()}

                {ownerMenuOpen && (
                  <div className="absolute left-0 right-0 top-full z-20 mt-1.5 rounded-[var(--radius-lg)] border border-white/10 bg-[#202126] p-3 shadow-2xl">
                    <div className="mb-2.5 flex items-center justify-between text-[0.88rem] font-medium text-[var(--text-primary)]">
                      Select owner
                      <button type="button" onClick={() => { setOwnerMenuOpen(false); setOwnerQuery(""); }}>
                        <X className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                      </button>
                    </div>
                    <div className="mb-2.5 flex h-9 items-center gap-2 rounded-[var(--radius-md)] border border-white/8 bg-[#2a2d35] px-3 text-[0.84rem] text-[var(--text-muted)]">
                      <Search className="h-3.5 w-3.5 shrink-0" />
                      <input
                        value={ownerQuery}
                        onChange={(e) => setOwnerQuery(e.target.value)}
                        placeholder="Search team member"
                        className="w-full bg-transparent text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                      />
                    </div>
                    <div className="space-y-1">
                      {filteredOwners.map((owner) => (
                        <button
                          key={owner.id}
                          type="button"
                          onClick={() => {
                            updateField("ownerId", owner.id);
                            updateField("ownerName", owner.name);
                            setOwnerMenuOpen(false);
                            setOwnerQuery("");
                          }}
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-[var(--radius-md)] px-2.5 py-2 text-left text-[0.84rem] transition",
                            owner.name === form.ownerName
                              ? "bg-white/[0.06] text-[var(--text-primary)]"
                              : "text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]",
                          )}
                        >
                          <Avatar initials={owner.initials} tone={owner.tone} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate text-[0.84rem]">{owner.name}</p>
                            <p className="truncate text-[0.68rem] text-[var(--text-muted)]">{owner.role}</p>
                          </div>
                        </button>
                      ))}
                      {filteredOwners.length === 0 && (
                        <div className="rounded-[var(--radius-md)] border border-dashed border-white/10 px-3 py-3 text-[0.8rem] text-[var(--text-muted)]">
                          No team member found.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Stage">
                <div className="relative">
                  <select
                    value={form.stage}
                    onChange={(e) => updateField("stage", e.target.value as ClientStage)}
                    className={cn(inputCls, "appearance-none pr-8")}
                  >
                    {clientStageOptions.map((option) => (
                      <option key={option} value={option} className="bg-[#1c1d21] text-white">
                        {option}
                      </option>
                    ))}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </Field>

              <Field label="Health">
                <div className="relative">
                  <select
                    value={form.health}
                    onChange={(e) => updateField("health", e.target.value as ClientHealth)}
                    className={cn(inputCls, "appearance-none pr-8")}
                  >
                    {clientHealthOptions.map((option) => (
                      <option key={option} value={option} className="bg-[#1c1d21] text-white">
                        {option}
                      </option>
                    ))}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </Field>
            </div>

            <Divider label="Team Members" icon={Users} />

            <div className="space-y-2">
              {form.employees.map((emp, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="grid flex-1 gap-2 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,0.9fr)]">
                    <input
                      value={emp.name}
                      onChange={(e) => updateEmployee(index, "name", e.target.value)}
                      placeholder="Full name"
                      className={cn(inputCls, "flex-1")}
                    />
                    <input
                      value={emp.role}
                      onChange={(e) => updateEmployee(index, "role", e.target.value)}
                      placeholder="Role"
                      className={cn(inputCls, "flex-1")}
                    />
                    <div className="relative">
                      <select
                        value={emp.department}
                        onChange={(e) => updateEmployee(index, "department", e.target.value)}
                        className={cn(inputCls, "appearance-none pr-8")}
                      >
                        <option value="" className="bg-[#1c1d21] text-white">
                          {teamOptions.length > 0 ? "Select team" : "No teams"}
                        </option>
                        {teamOptions.map((team) => (
                          <option key={team.id} value={team.name} className="bg-[#1c1d21] text-white">
                            {team.name}
                          </option>
                        ))}
                      </select>
                      <svg className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEmployee(index)}
                    className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-[var(--radius-lg)] border border-white/8 text-[var(--text-muted)] transition hover:border-[var(--red)]/30 hover:bg-[var(--red)]/8 hover:text-[var(--red)]"
                  >
                    <Plus className="h-3.5 w-3.5 rotate-45" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addEmployee}
                className="flex items-center gap-2 rounded-[var(--radius-lg)] border border-dashed border-white/12 px-3.5 py-2.5 text-[0.82rem] text-[var(--text-muted)] transition hover:border-white/20 hover:text-[var(--text-secondary)]"
              >
                <Plus className="h-3.5 w-3.5" />
                Add team member
              </button>
            </div>

            <Divider label="Contract" icon={FileText} />

            <div className="grid grid-cols-2 gap-3">
              <Field label="Annual Revenue">
                <div className={cn(inputCls, "flex items-center gap-2 py-0")}>
                  <span className="shrink-0 text-[0.9rem] font-semibold text-[var(--accent)]">$</span>
                  <input
                    value={form.arr}
                    onChange={(e) => updateField("arr", sanitizeRevenueInput(e.target.value))}
                    inputMode="numeric"
                    placeholder="54,000"
                    className="w-full bg-transparent py-2.5 text-[0.9rem] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                  />
                </div>
                {revenueSummary && (
                  <p className="text-[0.7rem] text-[var(--text-muted)]">{revenueSummary} / year</p>
                )}
              </Field>

              <Field label="Next Renewal">
                <DatePicker
                  value={form.nextRenewal}
                  onChange={(v) => updateField("nextRenewal", v)}
                  align="left"
                  compact
                  triggerClassName="w-full rounded-[var(--radius-lg)] bg-white/[0.04] shadow-none hover:border-white/12 hover:bg-white/[0.06]"
                />
              </Field>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/8 px-6 py-4">
          {submitError ? (
            <div className="mb-4 rounded-[var(--radius-lg)] border border-[var(--red)]/20 bg-[var(--red)]/10 px-4 py-3 text-[13px] text-[var(--text-primary)]">
              {submitError}
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3">
            <p className="text-[0.74rem] text-[var(--text-muted)]">
              Company, contact name, and email are required.
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
                {initialClient ? "Update Client" : "Save Client"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

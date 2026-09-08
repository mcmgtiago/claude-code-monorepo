"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeDollarSign,
  Building2,
  ImageUp,
  KeyRound,
  LayoutDashboard,
  Loader2,
  Mail,
  PencilLine,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  WalletCards,
} from "lucide-react";

import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { ModalCloseButton } from "@/components/ui/modal-close-button";
import type { AppMasterSettings } from "@/lib/app-config";
import { BILLING_PLAN_ORDER } from "@/lib/billing-plans";
import type {
  SuperAdminDashboardData,
  SuperAdminManagedUser,
  SuperAdminManagedWorkspace,
  SuperAdminOperationalData,
  SuperAdminSettingsPatch,
} from "@/lib/super-admin";
import { cn } from "@/lib/utils";

type SaveState = {
  kind: "success" | "error";
  message: string;
} | null;

type UserPatch = {
  suspended?: boolean;
  planName?: string;
  suspendReason?: string;
};

type WorkspacePatch = Partial<Pick<
  SuperAdminManagedWorkspace,
  "name" | "slug" | "supportEmail" | "timezone" | "region" | "invitePolicy" | "approvalFlow" | "digest"
>>;

type UserEditorDraft = {
  name: string;
  email: string;
  jobTitle: string;
};

type AdminSectionKey = "summary" | "branding" | "mail" | "services" | "users" | "workspaces";

type SecretDraft = {
  smtpPass: string;
  googleClientSecret: string;
  turnCredential: string;
};

const ADMIN_PANEL_SURFACE =
  "border border-white/6 bg-[#0d0e10]";
const ADMIN_FIELD_SURFACE = "border border-white/8 bg-[#131418]";
const ADMIN_ROW_SURFACE = "border border-white/6 bg-[rgba(255,255,255,0.02)]";

const EMPTY_SECRET_DRAFT: SecretDraft = {
  smtpPass: "",
  googleClientSecret: "",
  turnCredential: "",
};

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatLastSeen(value: string | null | undefined) {
  if (!value) {
    return "Never active";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Never active";
  }

  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    return "Active in the last hour";
  }

  if (diffHours < 24) {
    return `Active ${diffHours}h ago`;
  }

  if (diffDays < 30) {
    return `Active ${diffDays}d ago`;
  }

  return `Last seen ${formatDate(value)}`;
}

const PLAN_OPTIONS = BILLING_PLAN_ORDER;

function normalizeDraftValue(value: string) {
  return value.trim();
}

function buildSettingsPatch(
  base: AppMasterSettings,
  draft: AppMasterSettings,
  secrets: SecretDraft,
): SuperAdminSettingsPatch {
  const branding: NonNullable<SuperAdminSettingsPatch["branding"]> = {};
  const smtp: NonNullable<SuperAdminSettingsPatch["smtp"]> = {};
  const platform: NonNullable<SuperAdminSettingsPatch["platform"]> = {};
  const services: NonNullable<SuperAdminSettingsPatch["services"]> = {};

  if (normalizeDraftValue(draft.branding.appName) !== normalizeDraftValue(base.branding.appName)) {
    branding.appName = draft.branding.appName;
  }
  if (normalizeDraftValue(draft.branding.companyName) !== normalizeDraftValue(base.branding.companyName)) {
    branding.companyName = draft.branding.companyName;
  }
  if (normalizeDraftValue(draft.branding.appTagline) !== normalizeDraftValue(base.branding.appTagline)) {
    branding.appTagline = draft.branding.appTagline;
  }
  if (normalizeDraftValue(draft.branding.logoUrl) !== normalizeDraftValue(base.branding.logoUrl)) {
    branding.logoUrl = draft.branding.logoUrl;
  }
  if (normalizeDraftValue(draft.branding.supportEmail) !== normalizeDraftValue(base.branding.supportEmail)) {
    branding.supportEmail = draft.branding.supportEmail;
  }
  if (normalizeDraftValue(draft.branding.primaryDomain) !== normalizeDraftValue(base.branding.primaryDomain)) {
    branding.primaryDomain = draft.branding.primaryDomain;
  }
  if (normalizeDraftValue(draft.branding.marketingSiteUrl) !== normalizeDraftValue(base.branding.marketingSiteUrl)) {
    branding.marketingSiteUrl = draft.branding.marketingSiteUrl;
  }

  if (normalizeDraftValue(draft.smtp.host) !== normalizeDraftValue(base.smtp.host)) {
    smtp.host = draft.smtp.host;
  }
  if (draft.smtp.port !== base.smtp.port) {
    smtp.port = draft.smtp.port;
  }
  if (normalizeDraftValue(draft.smtp.user) !== normalizeDraftValue(base.smtp.user)) {
    smtp.user = draft.smtp.user;
  }
  if (normalizeDraftValue(draft.smtp.from) !== normalizeDraftValue(base.smtp.from)) {
    smtp.from = draft.smtp.from;
  }
  if (normalizeDraftValue(draft.smtp.contactToEmail) !== normalizeDraftValue(base.smtp.contactToEmail)) {
    smtp.contactToEmail = draft.smtp.contactToEmail;
  }
  if (normalizeDraftValue(secrets.smtpPass)) {
    smtp.pass = secrets.smtpPass;
  }

  if (draft.platform.allowNewSignups !== base.platform.allowNewSignups) {
    platform.allowNewSignups = draft.platform.allowNewSignups;
  }

  if (normalizeDraftValue(draft.services.googleClientId) !== normalizeDraftValue(base.services.googleClientId)) {
    services.googleClientId = draft.services.googleClientId;
  }
  if (normalizeDraftValue(secrets.googleClientSecret)) {
    services.googleClientSecret = secrets.googleClientSecret;
  }
  if (normalizeDraftValue(draft.services.webrtcIceServers) !== normalizeDraftValue(base.services.webrtcIceServers)) {
    services.webrtcIceServers = draft.services.webrtcIceServers;
  }
  if (normalizeDraftValue(draft.services.turnUrl) !== normalizeDraftValue(base.services.turnUrl)) {
    services.turnUrl = draft.services.turnUrl;
  }
  if (normalizeDraftValue(draft.services.turnUsername) !== normalizeDraftValue(base.services.turnUsername)) {
    services.turnUsername = draft.services.turnUsername;
  }
  if (normalizeDraftValue(secrets.turnCredential)) {
    services.turnCredential = secrets.turnCredential;
  }

  return {
    ...(Object.keys(branding).length > 0 ? { branding } : {}),
    ...(Object.keys(smtp).length > 0 ? { smtp } : {}),
    ...(Object.keys(platform).length > 0 ? { platform } : {}),
    ...(Object.keys(services).length > 0 ? { services } : {}),
  };
}

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: typeof Users;
}) {
  return (
    <div className={cn("overflow-hidden rounded-[var(--radius-xl)] p-5", ADMIN_PANEL_SURFACE)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">{label}</p>
          <p className="mt-3 break-words text-[2rem] font-semibold tracking-[-0.05em] text-white">{value}</p>
          <p className="mt-2 break-words text-sm leading-6 text-white/58">{helper}</p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border border-[var(--accent)]/18 bg-[var(--accent)]/8 text-[var(--accent)]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-[var(--radius-xl)] p-6", ADMIN_PANEL_SURFACE, className)}>
      <div className="mb-5 border-b border-white/6 pb-5">
        <h2 className="text-[1.25rem] font-semibold tracking-[-0.04em] text-white">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-white/55">{description}</p>
      </div>
      {children}
    </section>
  );
}

function SectionNavButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof LayoutDashboard;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-[var(--radius-lg)] border px-4 py-3 text-left transition",
        active
          ? "border-[var(--accent)]/28 bg-[var(--accent)]/8"
          : `${ADMIN_ROW_SURFACE} hover:border-white/10 hover:bg-white/[0.03]`,
      )}
    >
      <span className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border",
        active
          ? "border-[var(--accent)]/20 bg-[var(--accent)]/12 text-[var(--accent)]"
          : "border-white/8 bg-white/[0.03] text-white/60",
      )}>
        <Icon className="h-4.5 w-4.5" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-white">{label}</span>
      </span>
    </button>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/44">{label}</span>
      {hint ? <span className="mt-1 block text-[12px] leading-5 text-white/38">{hint}</span> : null}
      <div className="mt-2">{children}</div>
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-12 w-full rounded-[var(--radius-lg)] px-4 text-[14.5px] text-white outline-none transition placeholder:text-white/28 focus:border-[var(--accent)]/60",
        ADMIN_FIELD_SURFACE,
        props.className,
      )}
    />
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors duration-200",
        checked ? "border-[var(--accent)]/22 bg-[var(--accent)]/18" : "border-white/10 bg-white/[0.04]",
      )}
    >
      <span
        className={cn(
          "absolute h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
          checked ? "translate-x-[22px]" : "translate-x-[4px]",
        )}
      />
    </button>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 rounded-[var(--radius-lg)] px-4 py-3.5", ADMIN_ROW_SURFACE)}>
      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="mt-1 text-[13px] leading-5 text-white/50">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function UserEditorModal({
  open,
  user,
  draft,
  isSaving,
  errorMessage,
  onChange,
  onClose,
  onSave,
}: {
  open: boolean;
  user: SuperAdminManagedUser | null;
  draft: UserEditorDraft;
  isSaving: boolean;
  errorMessage: string;
  onChange: (patch: Partial<UserEditorDraft>) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  if (!open || !user) {
    return null;
  }

  return (
    <div className="modal-overlay-shell">
      <div className="modal-overlay-backdrop" onClick={onClose} />
      <div className="modal-surface modal-surface-scroll max-w-[720px] border border-white/8 bg-[#18191d] p-5 sm:p-6">
        <ModalCloseButton absolute onClick={onClose} aria-label="Close user editor" />
        <div className="border-b border-white/6 pb-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">User Management</p>
          <h2 className="mt-3 text-[1.5rem] font-semibold tracking-[-0.04em] text-white">Edit user account</h2>
          <p className="mt-2 text-sm leading-6 text-white/55">
            Update identity details while keeping billing and account status controls separate.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Full Name">
            <TextInput value={draft.name} onChange={(event) => onChange({ name: event.target.value })} />
          </Field>
          <Field label="Email Address">
            <TextInput value={draft.email} onChange={(event) => onChange({ email: event.target.value })} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Job Title">
              <TextInput value={draft.jobTitle} onChange={(event) => onChange({ jobTitle: event.target.value })} />
            </Field>
          </div>
        </div>

        <div className={cn("mt-5 grid gap-3 rounded-[var(--radius-xl)] p-4 md:grid-cols-3", ADMIN_ROW_SURFACE)}>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Plan</p>
            <p className="mt-2 text-sm font-semibold text-white">{user.plan.name}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Status</p>
            <p className="mt-2 text-sm font-semibold text-white">{user.suspended ? "Suspended" : "Active"}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Last Seen</p>
            <p className="mt-2 text-sm font-semibold text-white">{formatLastSeen(user.lastSeenAt)}</p>
          </div>
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-[var(--radius-lg)] border border-[var(--red)]/20 bg-[var(--red)]/8 px-4 py-3 text-sm text-[var(--red)]">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="btn-base btn-secondary inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] px-5 text-sm font-medium text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="btn-base btn-primary inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <PencilLine className="h-4 w-4" />}
            Save User
          </button>
        </div>
      </div>
    </div>
  );
}

function ManagedUserRow({
  user,
  onUpdate,
  onEdit,
  onDelete,
}: {
  user: SuperAdminManagedUser;
  onUpdate: (userId: string, patch: UserPatch) => Promise<void>;
  onEdit: (user: SuperAdminManagedUser) => void;
  onDelete: (user: SuperAdminManagedUser) => void;
}) {
  const [nextPlan, setNextPlan] = useState(user.plan.name);
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  async function handlePlanSave() {
    if (nextPlan === user.plan.name) {
      return;
    }

    setIsSavingPlan(true);
    await onUpdate(user.id, { planName: nextPlan });
    setIsSavingPlan(false);
  }

  async function handleStatusToggle() {
    setIsSavingStatus(true);
    await onUpdate(user.id, {
      suspended: !user.suspended,
      suspendReason: user.suspended ? "" : "Suspended by super admin",
    });
    setIsSavingStatus(false);
  }

  return (
    <div className={cn("grid gap-4 rounded-[var(--radius-xl)] p-4 xl:grid-cols-[minmax(0,1.45fr)_0.85fr_0.85fr_0.8fr_0.95fr]", ADMIN_ROW_SURFACE)}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-white">{user.name}</p>
          {user.suspended ? (
            <span className="rounded-full border border-[var(--red)]/24 bg-[var(--red)]/12 px-2 py-0.5 text-[11px] font-medium text-[var(--red)]">
              Suspended
            </span>
          ) : null}
        </div>
        <p className="mt-1 truncate text-sm text-white/65">{user.email}</p>
        <p className="mt-1 text-[12px] text-white/42">
          {user.jobTitle} • Joined {formatDate(user.createdAt)}
        </p>
        <p className="mt-1 text-[12px] text-white/38">{formatLastSeen(user.lastSeenAt)}</p>
        <p className="mt-2 truncate text-[12px] text-white/38">
          {user.workspaceNames.length > 0 ? user.workspaceNames.join(", ") : "No workspaces yet"}
        </p>
      </div>

      <div className={cn("rounded-[var(--radius-lg)] px-3 py-3", ADMIN_FIELD_SURFACE)}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Footprint</p>
        <p className="mt-2 text-sm font-semibold text-white">{user.workspacesActive} active</p>
        <p className="mt-1 text-[12px] text-white/42">{user.workspacesOwned} owner • {user.workspacesPending} pending</p>
      </div>

      <div className={cn("rounded-[var(--radius-lg)] px-3 py-3", ADMIN_FIELD_SURFACE)}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Billing</p>
        <p className="mt-2 text-sm font-semibold text-white">{formatMoney(user.plan.priceMonthly)}</p>
        <p className="mt-1 text-[12px] text-white/42">Renews {user.plan.renewsOn || "not scheduled"}</p>
      </div>

      <div className={cn("rounded-[var(--radius-lg)] px-3 py-3", ADMIN_FIELD_SURFACE)}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Plan</p>
        <select
          value={nextPlan}
          onChange={(event) => setNextPlan(event.target.value)}
          className={cn("mt-2 h-10 w-full rounded-[var(--radius-lg)] px-3 text-sm text-white outline-none", ADMIN_FIELD_SURFACE)}
        >
          {PLAN_OPTIONS.map((option) => (
            <option key={option} value={option} className="bg-[#17181d] text-white">
              {option}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => void handlePlanSave()}
          disabled={isSavingPlan || nextPlan === user.plan.name}
          className="btn-base btn-secondary mt-2 inline-flex h-9 w-full items-center justify-center rounded-[var(--radius-md)] text-[12px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSavingPlan ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save plan"}
        </button>
      </div>

      <div className={cn("rounded-[var(--radius-lg)] px-3 py-3", ADMIN_FIELD_SURFACE)}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Controls</p>
        <button
          type="button"
          onClick={() => void handleStatusToggle()}
          disabled={isSavingStatus}
          className={cn(
            "mt-2 inline-flex h-9 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border px-3 text-[12px] font-medium transition disabled:cursor-not-allowed disabled:opacity-40",
            user.suspended
              ? "border-[var(--green)]/24 bg-[var(--green)]/10 text-[var(--green)]"
              : "border-[var(--red)]/24 bg-[var(--red)]/10 text-[var(--red)]",
          )}
        >
          {isSavingStatus ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : user.suspended ? (
            <ShieldCheck className="h-3.5 w-3.5" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5" />
          )}
          {user.suspended ? "Reactivate" : "Suspend"}
        </button>
        {user.suspended ? (
          <p className="mt-2 text-[12px] leading-5 text-white/42">
            {user.suspendReason || "Access disabled by admin."}
          </p>
        ) : null}
        <div className="mt-3 grid gap-2">
          <button
            type="button"
            onClick={() => onEdit(user)}
            className="btn-base btn-secondary inline-flex h-9 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] text-[12px] font-medium text-white"
          >
            <PencilLine className="h-3.5 w-3.5" />
            Edit user
          </button>
          <button
            type="button"
            onClick={() => onDelete(user)}
            className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--red)]/20 bg-[var(--red)]/10 text-[12px] font-medium text-[var(--red)] transition hover:bg-[var(--red)]/14"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function WorkspaceCard({
  workspace,
  onSave,
}: {
  workspace: SuperAdminManagedWorkspace;
  onSave: (workspaceId: string, patch: WorkspacePatch) => Promise<void>;
}) {
  const [draft, setDraft] = useState<WorkspacePatch>({
    name: workspace.name,
    slug: workspace.slug,
    supportEmail: workspace.supportEmail,
    timezone: workspace.timezone,
    region: workspace.region,
    invitePolicy: workspace.invitePolicy,
    approvalFlow: workspace.approvalFlow,
    digest: workspace.digest,
  });
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges =
    (draft.name ?? "").trim() !== workspace.name
    || (draft.slug ?? "").trim() !== workspace.slug
    || (draft.supportEmail ?? "").trim() !== workspace.supportEmail
    || (draft.timezone ?? "").trim() !== workspace.timezone
    || (draft.region ?? "").trim() !== workspace.region
    || (draft.invitePolicy ?? "admins-only") !== workspace.invitePolicy
    || Boolean(draft.approvalFlow) !== workspace.approvalFlow
    || Boolean(draft.digest) !== workspace.digest;

  async function handleSave() {
    setIsSaving(true);
    await onSave(workspace.id, draft);
    setIsSaving(false);
  }

  return (
    <div className={cn("rounded-[var(--radius-xl)] p-5", ADMIN_PANEL_SURFACE)}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-[1.1rem] font-semibold tracking-[-0.04em] text-white">{workspace.name}</p>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-white/55">
              /{workspace.slug}
            </span>
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-medium",
                workspace.setupCompletedAt
                  ? "border-[var(--green)]/18 bg-[var(--green)]/10 text-[var(--green)]"
                  : "border-[var(--accent)]/20 bg-[var(--accent)]/10 text-[var(--accent)]",
              )}
            >
              {workspace.setupCompletedAt ? "Setup complete" : "Needs setup"}
            </span>
          </div>
          <p className="mt-2 text-sm text-white/58">
            {workspace.ownerName}
            {workspace.ownerEmail ? ` • ${workspace.ownerEmail}` : " • Owner email unavailable"}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[12px] text-white/42">
            <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1">
              Created {formatDate(workspace.createdAt)}
            </span>
            <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1">
              TZ {workspace.timezone}
            </span>
            {workspace.region ? (
              <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1">
                Region {workspace.region}
              </span>
            ) : null}
            {workspace.supportEmail ? (
              <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1">
                Support {workspace.supportEmail}
              </span>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving || !hasChanges}
          className="btn-base btn-primary inline-flex h-10 w-full items-center justify-center rounded-[var(--radius-md)] px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save workspace"}
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <div className={cn("rounded-[var(--radius-lg)] px-3.5 py-3.5", ADMIN_FIELD_SURFACE)}>
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">Owner</p>
          <p className="mt-2 truncate text-sm font-semibold text-white">{workspace.ownerName}</p>
          <p className="mt-1 truncate text-[12px] text-white/42">{workspace.ownerEmail || "No owner email"}</p>
        </div>
          <div className={cn("rounded-[var(--radius-lg)] px-3 py-3", ADMIN_FIELD_SURFACE)}>
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">Members</p>
            <p className="mt-2 text-sm font-semibold text-white">{workspace.activeMembers}/{workspace.totalMembers}</p>
          </div>
          <div className={cn("rounded-[var(--radius-lg)] px-3 py-3", ADMIN_FIELD_SURFACE)}>
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">Invites</p>
            <p className="mt-2 text-sm font-semibold text-white">{workspace.pendingInvites}</p>
          </div>
          <div className={cn("rounded-[var(--radius-lg)] px-3 py-3", ADMIN_FIELD_SURFACE)}>
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">Projects</p>
            <p className="mt-2 text-sm font-semibold text-white">{workspace.projectCount}</p>
          </div>
          <div className={cn("rounded-[var(--radius-lg)] px-3 py-3", ADMIN_FIELD_SURFACE)}>
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">Tasks</p>
            <p className="mt-2 text-sm font-semibold text-white">{workspace.taskCount}</p>
          </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_320px]">
        <div className={cn("rounded-[var(--radius-xl)] p-4 sm:p-5", ADMIN_ROW_SURFACE)}>
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/42">Workspace Details</p>
            <p className="mt-2 text-sm leading-6 text-white/54">
              Keep the customer-facing identity, contact routes, and membership gate aligned from one compact panel.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Workspace Name">
              <TextInput value={draft.name ?? ""} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} />
            </Field>
            <Field label="Slug">
              <TextInput value={draft.slug ?? ""} onChange={(event) => setDraft((current) => ({ ...current, slug: event.target.value }))} />
            </Field>
            <Field label="Support Email">
              <TextInput value={draft.supportEmail ?? ""} onChange={(event) => setDraft((current) => ({ ...current, supportEmail: event.target.value }))} />
            </Field>
            <Field label="Timezone">
              <TextInput value={draft.timezone ?? ""} onChange={(event) => setDraft((current) => ({ ...current, timezone: event.target.value }))} />
            </Field>
            <Field label="Region">
              <TextInput value={draft.region ?? ""} onChange={(event) => setDraft((current) => ({ ...current, region: event.target.value }))} />
            </Field>
            <Field label="Invite Policy">
              <select
                value={draft.invitePolicy ?? "admins-only"}
                onChange={(event) => setDraft((current) => ({
                  ...current,
                  invitePolicy: event.target.value as SuperAdminManagedWorkspace["invitePolicy"],
                }))}
                className={cn("h-12 w-full rounded-[var(--radius-lg)] px-4 text-sm text-white outline-none", ADMIN_FIELD_SURFACE)}
              >
                <option value="admins-only" className="bg-[#17181d] text-white">Admins Only</option>
                <option value="members-with-approval" className="bg-[#17181d] text-white">Members With Approval</option>
                <option value="open" className="bg-[#17181d] text-white">Open</option>
              </select>
            </Field>
          </div>
        </div>

        <div className="grid gap-4">
          <div className={cn("rounded-[var(--radius-xl)] p-4 sm:p-5", ADMIN_ROW_SURFACE)}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/42">Delivery Controls</p>
            <div className="mt-4 grid gap-3">
              <ToggleRow
                label="Approval Flow"
                description="Require admin review during workspace member intake."
                checked={Boolean(draft.approvalFlow)}
                onChange={(value) => setDraft((current) => ({ ...current, approvalFlow: value }))}
              />
              <ToggleRow
                label="Digest"
                description="Keep digest notifications enabled at workspace level."
                checked={Boolean(draft.digest)}
                onChange={(value) => setDraft((current) => ({ ...current, digest: value }))}
              />
            </div>
          </div>

          <div className={cn("rounded-[var(--radius-xl)] p-4 sm:p-5", ADMIN_ROW_SURFACE)}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/42">Change Summary</p>
            <p className="mt-2 text-sm leading-6 text-white/54">
              {hasChanges
                ? "Unsaved workspace edits are ready. Save when the customer-facing details look correct."
                : "No pending edits. This workspace is currently aligned with saved platform settings."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SuperAdminShell({
  initialData,
}: {
  initialData: SuperAdminDashboardData;
}) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [settingsDraft, setSettingsDraft] = useState<AppMasterSettings>(initialData.settings);
  const [secretDraft, setSecretDraft] = useState<SecretDraft>(EMPTY_SECRET_DRAFT);
  const [activeSection, setActiveSection] = useState<AdminSectionKey>("summary");
  const [userQuery, setUserQuery] = useState("");
  const [workspaceQuery, setWorkspaceQuery] = useState("");
  const [saveState, setSaveState] = useState<SaveState>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [editingUser, setEditingUser] = useState<SuperAdminManagedUser | null>(null);
  const [userEditorDraft, setUserEditorDraft] = useState<UserEditorDraft>({ name: "", email: "", jobTitle: "" });
  const [userEditorError, setUserEditorError] = useState("");
  const [isSavingUserEditor, setIsSavingUserEditor] = useState(false);
  const [deletingUser, setDeletingUser] = useState<SuperAdminManagedUser | null>(null);
  const [deleteUserError, setDeleteUserError] = useState("");
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const logoUploadInputRef = useRef<HTMLInputElement | null>(null);
  const visibleBranding = settingsDraft.branding;

  const filteredUsers = useMemo(() => {
    const normalized = userQuery.trim().toLowerCase();

    if (!normalized) {
      return data.users;
    }

    return data.users.filter((user) =>
      user.name.toLowerCase().includes(normalized)
      || user.email.toLowerCase().includes(normalized)
      || user.plan.name.toLowerCase().includes(normalized)
      || user.workspaceNames.some((workspace) => workspace.toLowerCase().includes(normalized)),
    );
  }, [data.users, userQuery]);

  const filteredWorkspaces = useMemo(() => {
    const normalized = workspaceQuery.trim().toLowerCase();

    if (!normalized) {
      return data.workspaces;
    }

    return data.workspaces.filter((workspace) =>
      workspace.name.toLowerCase().includes(normalized)
      || workspace.slug.toLowerCase().includes(normalized)
      || workspace.ownerName.toLowerCase().includes(normalized)
      || workspace.ownerEmail.toLowerCase().includes(normalized),
    );
  }, [data.workspaces, workspaceQuery]);

  function syncDashboard(next: SuperAdminDashboardData, options?: { preserveSettingsDraft?: boolean }) {
    setData(next);
    if (!options?.preserveSettingsDraft) {
      setSettingsDraft(next.settings);
      setSecretDraft(EMPTY_SECRET_DRAFT);
    }
  }

  function syncOperationalData(next: SuperAdminOperationalData) {
    setData((current) => ({
      ...current,
      ...next,
    }));
  }

  function openUserEditor(user: SuperAdminManagedUser) {
    setEditingUser(user);
    setUserEditorDraft({
      name: user.name,
      email: user.email,
      jobTitle: user.jobTitle === "Workspace Member" ? "" : user.jobTitle,
    });
    setUserEditorError("");
  }

  function closeUserEditor() {
    setEditingUser(null);
    setUserEditorError("");
    setIsSavingUserEditor(false);
  }

  function openDeleteUser(user: SuperAdminManagedUser) {
    setDeletingUser(user);
    setDeleteUserError("");
  }

  function closeDeleteUser() {
    setDeletingUser(null);
    setDeleteUserError("");
    setIsDeletingUser(false);
  }

  async function updateUser(userId: string, patch: UserPatch) {
    setSaveState(null);

    try {
      const response = await fetch(`/api/admin/super/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patch),
      });

      const result = await response.json() as { data?: SuperAdminOperationalData; error?: string };

      if (!response.ok || !result.data) {
        throw new Error(result.error || "Failed to update managed user.");
      }

      syncOperationalData(result.data);
      setSaveState({ kind: "success", message: "User controls updated." });
    } catch (error) {
      setSaveState({ kind: "error", message: error instanceof Error ? error.message : "Failed to update managed user." });
    }
  }

  async function updateWorkspace(workspaceId: string, patch: WorkspacePatch) {
    setSaveState(null);

    try {
      const response = await fetch(`/api/admin/super/workspaces/${workspaceId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patch),
      });

      const result = await response.json() as { data?: SuperAdminOperationalData; error?: string };

      if (!response.ok || !result.data) {
        throw new Error(result.error || "Failed to update workspace.");
      }

      syncOperationalData(result.data);
      setSaveState({ kind: "success", message: "Workspace settings updated." });
    } catch (error) {
      setSaveState({ kind: "error", message: error instanceof Error ? error.message : "Failed to update workspace." });
    }
  }

  async function saveUserEditor() {
    if (!editingUser) {
      return;
    }

    setIsSavingUserEditor(true);
    setUserEditorError("");
    setSaveState(null);

    try {
      const response = await fetch(`/api/admin/super/users/${editingUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userEditorDraft.name,
          email: userEditorDraft.email,
          jobTitle: userEditorDraft.jobTitle,
        }),
      });

      const result = await response.json() as { data?: SuperAdminOperationalData; error?: string };

      if (!response.ok || !result.data) {
        throw new Error(result.error || "Failed to update managed user.");
      }

      syncOperationalData(result.data);
      closeUserEditor();
      setSaveState({ kind: "success", message: "User profile updated." });
    } catch (error) {
      setUserEditorError(error instanceof Error ? error.message : "Failed to update managed user.");
    } finally {
      setIsSavingUserEditor(false);
    }
  }

  async function deleteUser() {
    if (!deletingUser) {
      return;
    }

    setIsDeletingUser(true);
    setDeleteUserError("");
    setSaveState(null);

    try {
      const response = await fetch(`/api/admin/super/users/${deletingUser.id}`, {
        method: "DELETE",
      });

      const result = await response.json() as { data?: SuperAdminOperationalData; error?: string };

      if (!response.ok || !result.data) {
        throw new Error(result.error || "Failed to delete managed user.");
      }

      syncOperationalData(result.data);
      closeDeleteUser();
      setSaveState({ kind: "success", message: "User account deleted." });
    } catch (error) {
      setDeleteUserError(error instanceof Error ? error.message : "Failed to delete managed user.");
    } finally {
      setIsDeletingUser(false);
    }
  }

  async function saveSettings() {
    const patch = buildSettingsPatch(data.settings, settingsDraft, secretDraft);

    if (settingsDraft.smtp.port <= 0 || !Number.isInteger(settingsDraft.smtp.port)) {
      setSaveState({ kind: "error", message: "SMTP port must be a positive number." });
      return;
    }

    if (Object.keys(patch).length === 0) {
      setSaveState({ kind: "success", message: "No settings changes to save." });
      return;
    }

    setIsSavingSettings(true);
    setSaveState(null);

    try {
      const response = await fetch("/api/admin/super/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patch),
      });

      const result = await response.json() as { data?: SuperAdminDashboardData; error?: string };

      if (!response.ok || !result.data) {
        throw new Error(result.error || "Failed to save admin settings.");
      }

      syncDashboard(result.data);
      setSaveState({ kind: "success", message: "Master settings saved." });
      router.refresh();
    } catch (error) {
      setSaveState({ kind: "error", message: error instanceof Error ? error.message : "Failed to save admin settings." });
    } finally {
      setIsSavingSettings(false);
    }
  }

  async function testSmtp() {
    setIsTestingSmtp(true);
    setSaveState(null);

    try {
      const response = await fetch("/api/admin/super/settings/test", {
        method: "POST",
      });
      const result = await response.json() as { smtp?: { host: string; port: number; user: string }; error?: string };

      if (!response.ok || !result.smtp) {
        throw new Error(result.error || "SMTP verification failed.");
      }

      setSaveState({
        kind: "success",
        message: `SMTP connected on ${result.smtp.host}:${result.smtp.port} as ${result.smtp.user}.`,
      });
    } catch (error) {
      setSaveState({ kind: "error", message: error instanceof Error ? error.message : "SMTP verification failed." });
    } finally {
      setIsTestingSmtp(false);
    }
  }

  async function handleLogoFileSelected(fileList: FileList | null) {
    const file = fileList?.[0];

    if (!file) {
      return;
    }

    setIsUploadingLogo(true);
    setSaveState(null);

    try {
      const formData = new FormData();
      formData.set("file", file);
      const response = await fetch("/api/admin/super/settings/logo", {
        method: "POST",
        body: formData,
      });
      const result = await response.json() as { logoUrl?: string; error?: string };

      if (!response.ok || !result.logoUrl) {
        throw new Error(result.error || "Failed to upload app logo.");
      }

      setSettingsDraft((current) => ({
        ...current,
        branding: {
          ...current.branding,
          logoUrl: result.logoUrl!,
        },
      }));
      setSaveState({ kind: "success", message: "Logo uploaded. Save master settings to publish it across the app." });
    } catch (error) {
      setSaveState({ kind: "error", message: error instanceof Error ? error.message : "Failed to upload app logo." });
    } finally {
      setIsUploadingLogo(false);
      if (logoUploadInputRef.current) {
        logoUploadInputRef.current.value = "";
      }
    }
  }

  const adminSections = [
    {
      key: "summary",
      label: "Overview",
      description: "Platform health, counts, and operator actions.",
      icon: LayoutDashboard,
    },
    {
      key: "branding",
      label: "Branding",
      description: "App name, logo, domain, and public identity.",
      icon: Sparkles,
    },
    {
      key: "mail",
      label: "Mail + Gates",
      description: "SMTP credentials, sender setup, and signup controls.",
      icon: Mail,
    },
    {
      key: "services",
      label: "API Keys",
      description: "Google auth, ICE servers, and TURN relay credentials.",
      icon: KeyRound,
    },
    {
      key: "users",
      label: "Users",
      description: "Subscription control, suspension, and account ops.",
      icon: Users,
    },
    {
      key: "workspaces",
      label: "Workspaces",
      description: "Workspace naming, support, and access defaults.",
      icon: Building2,
    },
  ] as const satisfies ReadonlyArray<{
    key: AdminSectionKey;
    label: string;
    description: string;
    icon: typeof LayoutDashboard;
  }>;

  return (
    <main className="bg-dashboard min-h-[100dvh] p-3 text-white sm:p-4 md:p-6 lg:h-screen lg:overflow-hidden lg:p-0">
      <div className="mx-auto w-full max-w-[1720px] lg:h-full">
        <div className="flex flex-col gap-3 lg:h-full lg:flex-row lg:gap-0">
          <aside className={cn("rounded-[var(--radius-xl)] p-4 lg:h-full lg:w-[292px] lg:overflow-y-auto lg:rounded-none lg:border-r lg:border-white/6", ADMIN_PANEL_SURFACE)}>
            <div className={cn("rounded-[var(--radius-xl)] p-4", ADMIN_ROW_SURFACE)}>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/22 bg-[var(--accent)]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Super Admin
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center">
                  <img src={visibleBranding.logoUrl} alt={visibleBranding.appName} className="h-full w-full object-contain" />
                </div>
                <p className="text-[1.35rem] font-semibold tracking-[-0.04em] text-white">
                  {visibleBranding.appName} Master Console
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {adminSections.map((section) => (
                <SectionNavButton
                  key={section.key}
                  icon={section.icon}
                  label={section.label}
                  active={activeSection === section.key}
                  onClick={() => setActiveSection(section.key)}
                />
              ))}
            </div>

            <div className="mt-4 grid gap-3">
              <Link
                href="/dashboard"
                className="btn-base btn-secondary inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] px-4 text-sm font-medium text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to app
              </Link>
              <button
                type="button"
                onClick={() => void testSmtp()}
                disabled={isTestingSmtp}
                className="btn-base btn-secondary inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-45"
              >
                {isTestingSmtp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                Test SMTP
              </button>
              <button
                type="button"
                onClick={() => void saveSettings()}
                disabled={isSavingSettings}
                className="btn-base btn-primary inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45"
              >
                {isSavingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Save Settings
              </button>
            </div>
          </aside>

          <div className={cn("min-w-0 rounded-[var(--radius-xl)] p-5 sm:p-6 lg:h-full lg:flex-1 lg:overflow-y-auto lg:rounded-none lg:p-8", ADMIN_PANEL_SURFACE)}>
            <div className="border-b border-white/6 pb-5">
              <h1 className="text-[2.2rem] font-semibold tracking-[-0.06em] text-white sm:text-[2.8rem]">
                Master control for {visibleBranding.appName}
              </h1>
            </div>

            {saveState ? (
              <div
                className={cn(
                  "mt-5 flex items-center gap-2 rounded-[var(--radius-lg)] border px-4 py-3 text-sm",
                  saveState.kind === "error"
                    ? "border-[var(--red)]/20 bg-[var(--red)]/10 text-[var(--red)]"
                    : "border-[var(--green)]/20 bg-[var(--green)]/10 text-[var(--green)]",
                )}
              >
                <AlertTriangle className="h-4 w-4" />
                {saveState.message}
              </div>
            ) : null}

            <div className="mt-6 space-y-6">
              {activeSection === "summary" ? (
                <>
                  <div className="grid gap-4 xl:grid-cols-4">
                    <MetricCard
                      label="Total Users"
                      value={String(data.summary.totalUsers).padStart(2, "0")}
                      helper={`${data.summary.activeUsers} active accounts`}
                      icon={Users}
                    />
                    <MetricCard
                      label="Suspended"
                      value={String(data.summary.suspendedUsers).padStart(2, "0")}
                      helper="Accounts currently blocked from workspace access"
                      icon={AlertTriangle}
                    />
                    <MetricCard
                      label="Paid Subscriptions"
                      value={String(data.summary.paidSubscriptions).padStart(2, "0")}
                      helper={`${data.summary.totalWorkspaces} workspaces under management`}
                      icon={WalletCards}
                    />
                    <MetricCard
                      label="MRR"
                      value={formatMoney(data.summary.monthlyRecurringRevenue)}
                      helper="Estimated from assigned plan presets"
                      icon={BadgeDollarSign}
                    />
                  </div>

                  <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
                    <SectionCard
                      title="Operations Snapshot"
                      description="Current platform status at a glance."
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className={cn("min-w-0 rounded-[var(--radius-lg)] p-5", ADMIN_ROW_SURFACE)}>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/42">Brand</p>
                          <p className="mt-3 break-words text-lg font-semibold text-white">{settingsDraft.branding.companyName}</p>
                          <p className="mt-1 break-words text-sm text-white/52">{settingsDraft.branding.appName}</p>
                        </div>
                        <div className={cn("min-w-0 rounded-[var(--radius-lg)] p-5", ADMIN_ROW_SURFACE)}>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/42">Signup Gate</p>
                          <p className="mt-3 text-lg font-semibold text-white">
                            {settingsDraft.platform.allowNewSignups ? "Open" : "Closed"}
                          </p>
                          <p className="mt-1 text-sm text-white/52">Public account creation status</p>
                        </div>
                        <div className={cn("min-w-0 rounded-[var(--radius-lg)] p-5", ADMIN_ROW_SURFACE)}>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/42">Primary Domain</p>
                          <p className="mt-3 break-words text-lg font-semibold text-white">{settingsDraft.branding.primaryDomain || "Not configured"}</p>
                          <p className="mt-1 break-words text-sm text-white/52">Used for public brand identity</p>
                        </div>
                        <div className={cn("min-w-0 rounded-[var(--radius-lg)] p-5", ADMIN_ROW_SURFACE)}>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/42">SMTP Sender</p>
                          <p className="mt-3 break-words text-lg font-semibold text-white">{settingsDraft.smtp.from || "Not configured"}</p>
                          <p className="mt-1 break-words text-sm text-white/52">Outbound notification identity</p>
                        </div>
                        <div className={cn("min-w-0 rounded-[var(--radius-lg)] p-5", ADMIN_ROW_SURFACE)}>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/42">Google Auth</p>
                          <p className="mt-3 text-lg font-semibold text-white">
                            {settingsDraft.services.googleClientId && data.secretStatus.googleClientSecretConfigured ? "Ready" : "Not configured"}
                          </p>
                          <p className="mt-1 text-sm text-white/52">Local Google login availability</p>
                        </div>
                        <div className={cn("min-w-0 rounded-[var(--radius-lg)] p-5", ADMIN_ROW_SURFACE)}>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/42">RTC Relay</p>
                          <p className="mt-3 text-lg font-semibold text-white">
                            {settingsDraft.services.webrtcIceServers || settingsDraft.services.turnUrl ? "Custom" : "Fallback STUN"}
                          </p>
                          <p className="mt-1 text-sm text-white/52">Meeting transport server configuration</p>
                        </div>
                      </div>
                    </SectionCard>

                    <SectionCard
                      title="Current Brand Preview"
                      description="Quick preview of the platform identity now configured."
                    >
                      <div className={cn("rounded-[var(--radius-xl)] p-6", ADMIN_ROW_SURFACE)}>
                        <div className="flex items-center gap-4">
                          <div className="flex h-16 w-16 items-center justify-center rounded-[20px] border border-white/10 bg-[#131418]">
                            <img src={settingsDraft.branding.logoUrl} alt={settingsDraft.branding.appName} className="h-11 w-11 object-contain" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/42">Branding</p>
                            <div className="relative mt-2 inline-block max-w-full pr-16">
                              <span className="absolute -right-0 top-0 rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-[0.52rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                                {settingsDraft.branding.appName}
                              </span>
                              <p className="break-words pr-2 text-[1.35rem] font-semibold tracking-[-0.05em] text-white">
                                {settingsDraft.branding.companyName}
                              </p>
                            </div>
                            <p className="mt-2 break-words text-sm leading-6 text-white/55">{settingsDraft.branding.appTagline || "No tagline configured yet."}</p>
                          </div>
                        </div>
                      </div>
                    </SectionCard>
                  </div>
                </>
              ) : null}

              {activeSection === "branding" ? (
                <SectionCard
                  title="Brand Identity"
                  description="Update the app name, domain, support channels, and logo from one clean settings form."
                >
                  <input
                    ref={logoUploadInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => void handleLogoFileSelected(event.target.files)}
                  />

                  <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                      <div className={cn("rounded-[var(--radius-xl)] p-5", ADMIN_ROW_SURFACE)}>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/42">Logo Preview</p>
                      <div className={cn("mt-4 flex h-[220px] items-center justify-center rounded-[var(--radius-xl)]", ADMIN_FIELD_SURFACE)}>
                        <img src={settingsDraft.branding.logoUrl} alt={settingsDraft.branding.appName} className="max-h-[96px] max-w-[180px] object-contain" />
                      </div>
                      <div className="mt-4 grid gap-3">
                        <button
                          type="button"
                          onClick={() => logoUploadInputRef.current?.click()}
                          disabled={isUploadingLogo}
                          className="btn-base btn-primary inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          {isUploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageUp className="h-4 w-4" />}
                          Upload Logo
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="App Name">
                        <TextInput
                          value={settingsDraft.branding.appName}
                          onChange={(event) => setSettingsDraft((current) => ({
                            ...current,
                            branding: { ...current.branding, appName: event.target.value },
                          }))}
                        />
                      </Field>
                      <Field label="Company Name">
                        <TextInput
                          value={settingsDraft.branding.companyName}
                          onChange={(event) => setSettingsDraft((current) => ({
                            ...current,
                            branding: { ...current.branding, companyName: event.target.value },
                          }))}
                        />
                      </Field>
                      <Field label="Logo URL">
                        <TextInput
                          value={settingsDraft.branding.logoUrl}
                          onChange={(event) => setSettingsDraft((current) => ({
                            ...current,
                            branding: { ...current.branding, logoUrl: event.target.value },
                          }))}
                        />
                      </Field>
                        <Field label="Support Email">
                        <TextInput
                          value={settingsDraft.branding.supportEmail}
                          onChange={(event) => setSettingsDraft((current) => ({
                            ...current,
                            branding: { ...current.branding, supportEmail: event.target.value },
                          }))}
                        />
                      </Field>
                      <Field label="Primary Domain">
                        <TextInput
                          value={settingsDraft.branding.primaryDomain}
                          onChange={(event) => setSettingsDraft((current) => ({
                            ...current,
                            branding: { ...current.branding, primaryDomain: event.target.value },
                          }))}
                        />
                      </Field>
                      <Field label="Marketing Site">
                        <TextInput
                          value={settingsDraft.branding.marketingSiteUrl}
                          onChange={(event) => setSettingsDraft((current) => ({
                            ...current,
                            branding: { ...current.branding, marketingSiteUrl: event.target.value },
                          }))}
                        />
                      </Field>
                      <div className="md:col-span-2">
                        <Field label="Tagline">
                          <TextInput
                            value={settingsDraft.branding.appTagline}
                            onChange={(event) => setSettingsDraft((current) => ({
                              ...current,
                              branding: { ...current.branding, appTagline: event.target.value },
                            }))}
                          />
                        </Field>
                      </div>
                    </div>
                  </div>
                </SectionCard>
              ) : null}

              {activeSection === "mail" ? (
                <SectionCard
                  title="Mail Relay + Platform Gates"
                  description="SMTP credentials, sender identity, and signup controls stay here."
                >
                  <div className="grid gap-4">
                    <Field label="SMTP Host" hint="Leave empty to disable custom SMTP host settings.">
                      <TextInput
                        value={settingsDraft.smtp.host}
                        onChange={(event) => setSettingsDraft((current) => ({
                          ...current,
                          smtp: { ...current.smtp, host: event.target.value },
                        }))}
                      />
                    </Field>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="SMTP Port">
                        <TextInput
                          type="number"
                          min={1}
                          inputMode="numeric"
                          value={String(settingsDraft.smtp.port)}
                          onChange={(event) => setSettingsDraft((current) => ({
                            ...current,
                            smtp: { ...current.smtp, port: Number(event.target.value) || 0 },
                          }))}
                        />
                      </Field>
                      <Field label="SMTP User" hint="Leave empty to clear the stored SMTP username.">
                        <TextInput
                          value={settingsDraft.smtp.user}
                          onChange={(event) => setSettingsDraft((current) => ({
                            ...current,
                            smtp: { ...current.smtp, user: event.target.value },
                          }))}
                        />
                      </Field>
                    </div>
                    <Field
                      label="SMTP Password / API Key"
                      hint={data.secretStatus.smtpPassConfigured ? "Stored secret is hidden. Enter a new value only when rotating it." : "No SMTP secret stored yet."}
                    >
                      <TextInput
                        type="password"
                        autoComplete="new-password"
                        placeholder={data.secretStatus.smtpPassConfigured ? "Leave blank to keep current secret" : "Enter SMTP password or API key"}
                        value={secretDraft.smtpPass}
                        onChange={(event) => setSecretDraft((current) => ({
                          ...current,
                          smtpPass: event.target.value,
                        }))}
                      />
                    </Field>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="SMTP From" hint="Leave empty to clear the custom sender address.">
                        <TextInput
                          value={settingsDraft.smtp.from}
                          onChange={(event) => setSettingsDraft((current) => ({
                            ...current,
                            smtp: { ...current.smtp, from: event.target.value },
                          }))}
                        />
                      </Field>
                      <Field label="Contact Inbox" hint="Leave empty to clear the routed contact inbox.">
                        <TextInput
                          value={settingsDraft.smtp.contactToEmail}
                          onChange={(event) => setSettingsDraft((current) => ({
                            ...current,
                            smtp: { ...current.smtp, contactToEmail: event.target.value },
                          }))}
                        />
                      </Field>
                    </div>

                    <ToggleRow
                      label="Allow New Signups"
                      description="Block the public signup route instantly while keeping current customers active."
                      checked={settingsDraft.platform.allowNewSignups}
                      onChange={(value) => setSettingsDraft((current) => ({
                        ...current,
                        platform: { ...current.platform, allowNewSignups: value },
                      }))}
                    />

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => void saveSettings()}
                        disabled={isSavingSettings}
                        className="btn-base btn-primary inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        {isSavingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                        Save Mail Settings
                      </button>
                    </div>
                  </div>
                </SectionCard>
              ) : null}

              {activeSection === "services" ? (
                <SectionCard
                  title="API Keys + Service Credentials"
                  description="Manage runtime credentials that power Google sign-in and browser-side meeting transport."
                >
                  <div className="grid gap-6 xl:grid-cols-2">
                    <div className={cn("rounded-[var(--radius-xl)] p-5", ADMIN_ROW_SURFACE)}>
                      <div className="mb-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/42">Google OAuth</p>
                        <p className="mt-2 text-sm leading-6 text-white/55">
                          When both values are present, signup and login can use the app-managed Google OAuth flow.
                        </p>
                      </div>
                      <div className="grid gap-4">
                        <Field label="Google Client ID">
                          <TextInput
                            value={settingsDraft.services.googleClientId}
                            onChange={(event) => setSettingsDraft((current) => ({
                              ...current,
                              services: { ...current.services, googleClientId: event.target.value },
                            }))}
                          />
                        </Field>
                        <Field
                          label="Google Client Secret"
                          hint={data.secretStatus.googleClientSecretConfigured ? "Stored secret is hidden. Enter a new value only when rotating it." : "No Google client secret stored yet."}
                        >
                          <TextInput
                            type="password"
                            autoComplete="new-password"
                            placeholder={data.secretStatus.googleClientSecretConfigured ? "Leave blank to keep current secret" : "Enter Google client secret"}
                            value={secretDraft.googleClientSecret}
                            onChange={(event) => setSecretDraft((current) => ({
                              ...current,
                              googleClientSecret: event.target.value,
                            }))}
                          />
                        </Field>
                      </div>
                    </div>

                    <div className={cn("rounded-[var(--radius-xl)] p-5", ADMIN_ROW_SURFACE)}>
                      <div className="mb-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/42">Meeting Relay</p>
                        <p className="mt-2 text-sm leading-6 text-white/55">
                          These credentials are exposed to browsers for live calls, so use TURN credentials meant for client-side WebRTC.
                        </p>
                      </div>
                      <div className="grid gap-4">
                        <Field label="ICE Servers JSON" hint='Optional JSON array. Example: [{"urls":["stun:stun.l.google.com:19302"]}]'>
                          <TextInput
                            value={settingsDraft.services.webrtcIceServers}
                            onChange={(event) => setSettingsDraft((current) => ({
                              ...current,
                              services: { ...current.services, webrtcIceServers: event.target.value },
                            }))}
                          />
                        </Field>
                        <Field label="TURN URL">
                          <TextInput
                            value={settingsDraft.services.turnUrl}
                            onChange={(event) => setSettingsDraft((current) => ({
                              ...current,
                              services: { ...current.services, turnUrl: event.target.value },
                            }))}
                          />
                        </Field>
                        <div className="grid gap-4 md:grid-cols-2">
                          <Field label="TURN Username">
                            <TextInput
                              value={settingsDraft.services.turnUsername}
                              onChange={(event) => setSettingsDraft((current) => ({
                                ...current,
                                services: { ...current.services, turnUsername: event.target.value },
                              }))}
                            />
                          </Field>
                          <Field
                            label="TURN Credential"
                            hint={data.secretStatus.turnCredentialConfigured ? "Stored credential is hidden. Enter a new value only when rotating it." : "No TURN credential stored yet."}
                          >
                            <TextInput
                              type="password"
                              autoComplete="new-password"
                              placeholder={data.secretStatus.turnCredentialConfigured ? "Leave blank to keep current credential" : "Enter TURN credential"}
                              value={secretDraft.turnCredential}
                              onChange={(event) => setSecretDraft((current) => ({
                                ...current,
                                turnCredential: event.target.value,
                              }))}
                            />
                          </Field>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => void saveSettings()}
                      disabled={isSavingSettings}
                      className="btn-base btn-primary inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {isSavingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                      Save API Keys
                    </button>
                  </div>
                </SectionCard>
              ) : null}

              {activeSection === "users" ? (
                <SectionCard
                  title="User Management"
                  description="Search everyone on the platform, switch billing plan presets, and suspend or reactivate accounts."
                >
                  <div className={cn("mb-5 flex h-12 items-center gap-3 rounded-[var(--radius-lg)] px-4", ADMIN_FIELD_SURFACE)}>
                    <Search className="h-4 w-4 text-white/40" />
                    <input
                      type="text"
                      value={userQuery}
                      onChange={(event) => setUserQuery(event.target.value)}
                      placeholder="Search user, email, workspace, or plan"
                      className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/28"
                    />
                  </div>
                  <div className="grid gap-4">
                    {filteredUsers.length === 0 ? (
                      <div className="rounded-[var(--radius-lg)] border border-dashed border-white/10 px-4 py-12 text-center text-sm text-white/48">
                        No users match this search.
                      </div>
                    ) : (
                      filteredUsers.map((user) => (
                        <ManagedUserRow
                          key={user.id}
                          user={user}
                          onUpdate={updateUser}
                          onEdit={openUserEditor}
                          onDelete={openDeleteUser}
                        />
                      ))
                    )}
                  </div>
                </SectionCard>
              ) : null}

              {activeSection === "workspaces" ? (
                <SectionCard
                  title="Workspace Management"
                  description="Edit workspace naming, support contacts, access policy, and delivery defaults without touching each customer account manually."
                >
                  <div className={cn("mb-5 flex h-12 items-center gap-3 rounded-[var(--radius-lg)] px-4", ADMIN_FIELD_SURFACE)}>
                    <Building2 className="h-4 w-4 text-white/40" />
                    <input
                      type="text"
                      value={workspaceQuery}
                      onChange={(event) => setWorkspaceQuery(event.target.value)}
                      placeholder="Search workspace, slug, owner, or owner email"
                      className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/28"
                    />
                  </div>
                  <div className="grid gap-4">
                    {filteredWorkspaces.length === 0 ? (
                      <div className="rounded-[var(--radius-lg)] border border-dashed border-white/10 px-4 py-12 text-center text-sm text-white/48">
                        No workspaces match this search.
                      </div>
                    ) : (
                      filteredWorkspaces.map((workspace) => (
                        <WorkspaceCard key={workspace.id} workspace={workspace} onSave={updateWorkspace} />
                      ))
                    )}
                  </div>
                </SectionCard>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <UserEditorModal
        open={Boolean(editingUser)}
        user={editingUser}
        draft={userEditorDraft}
        isSaving={isSavingUserEditor}
        errorMessage={userEditorError}
        onChange={(patch) => setUserEditorDraft((current) => ({ ...current, ...patch }))}
        onClose={closeUserEditor}
        onSave={() => void saveUserEditor()}
      />

      <DeleteConfirmationModal
        open={Boolean(deletingUser)}
        title="Delete user account?"
        description={
          deletingUser
            ? `This will permanently remove ${deletingUser.name}, their owned workspaces, and related account data from the platform.`
            : ""
        }
        confirmLabel="Delete User"
        confirmationKeyword={deletingUser?.email ?? undefined}
        confirmationLabel={deletingUser ? `Type ${deletingUser.email} to confirm permanent deletion` : undefined}
        errorMessage={deleteUserError}
        isConfirming={isDeletingUser}
        onConfirm={() => void deleteUser()}
        onClose={closeDeleteUser}
      />
    </main>
  );
}

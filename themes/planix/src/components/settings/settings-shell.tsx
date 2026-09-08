"use client";

import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArchiveX,
  BadgeCheck,
  Bell,
  Building2,
  CalendarDays,
  Check,
  Clock3,
  Eye,
  EyeOff,
  FolderKanban,
  Globe2,
  KeyRound,
  Mail,
  MapPin,
  OctagonAlert,
  Pencil,
  Plus,
  Save,
  ShieldCheck,
  Tag,
  Trash2,
  UserRound,
  UserX,
  X,
} from "lucide-react";

import { WorkspaceSelectionModal } from "@/components/auth/workspace-selection-modal";
import { DEFAULT_TAGS, TAG_COLOR_SWATCHES, type TagDefinition } from "@/components/projects/tasks-board/shared";
import { PrimarySidebar } from "@/components/layout/primary-sidebar";
import { AppLoader } from "@/components/ui/app-loader";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import type { BillingPlanCatalogItem, BillingPlanName, BillingUiConfig } from "@/lib/billing";
import { getConfiguredAppHost } from "@/lib/app-url";
import { clearPlanixBrowserState } from "@/lib/browser-state";
import { clearMemoryCache, readMemoryCache, writeMemoryCache } from "@/lib/resource-memory-cache";
import {
  writeCompatibleLocalStorageItem,
} from "@/lib/storage-compat";
import { useHydrated } from "@/lib/use-hydrated";
import { usePersistentState } from "@/lib/use-persistent-state";
import { pushWorkspaceActivity, useWorkspaceActivityFeed } from "@/lib/workspace-activity";
import {
  defaultNotificationPreferences,
  defaultPlanSettings,
  defaultSavedDevices,
  defaultSettingsBundle,
  defaultWorkspaceForm,
  type NotificationPreferences,
  type PlanSettings,
  type SavedDevice,
  type SettingsBundle,
  type WorkspaceFormState,
} from "@/lib/settings";
import {
  readJsonSafely,
  syncSettingsLocalBridges,
} from "@/lib/settings-client";
import type { WorkspaceSelectionOption } from "@/lib/workspace-selection";
import type { WorkspaceTrashItem } from "@/lib/trash";
import { cn } from "@/lib/utils";

type SettingsMode = "loading" | "remote" | "local" | "demo";
type SaveResult<T> = {
  ok: boolean;
  value?: T;
  message: string;
};

type RazorpayCheckoutPayload = {
  keyId: string;
  subscription: {
    id: string;
    status: string;
  };
  plan: BillingPlanCatalogItem;
  prefill: {
    email: string;
    name: string;
    contact: string;
  };
};

type RazorpayCheckoutOptions = {
  key: string;
  name: string;
  description: string;
  subscription_id: string;
  prefill?: {
    email?: string;
    name?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
  handler?: (response: {
    razorpay_subscription_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void | Promise<void>;
};

type RazorpayInstance = {
  open: () => void;
  on?: (event: "payment.failed", handler: (payload: { error?: { description?: string } }) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
  }
}

const DEFAULT_PROJECT_TYPES = ["UX/UI Design", "Web Development", "Mobile App", "Marketing", "Research & Analytics"];
const AUDIO_STORAGE_KEY = "planix.workspace.audio-enabled";
const APP_HOST = getConfiguredAppHost();
const SALES_CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "hello@example.com";
const SETTINGS_CACHE_KEY = "planix.cache.settings";
const SETTINGS_CACHE_MAX_AGE_MS = 1000 * 60 * 10;
const SETTINGS_PANEL_SURFACE =
  "border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.045)_0%,rgba(255,255,255,0.02)_100%)]";
const SETTINGS_FIELD_SURFACE = "border border-white/8 bg-white/[0.03]";
const SETTINGS_ROW_SURFACE = "border border-white/6 bg-white/[0.02]";

type SettingsCachePayload = {
  mode: Exclude<SettingsMode, "loading">;
  settings: SettingsBundle;
};

function readSettingsCache() {
  return readMemoryCache<SettingsCachePayload>(SETTINGS_CACHE_KEY, SETTINGS_CACHE_MAX_AGE_MS);
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200",
        checked ? "bg-[var(--accent)]" : "bg-white/15",
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

function WorkspaceField({
  icon: Icon,
  label,
  description,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("rounded-[var(--radius-xl)] p-5", SETTINGS_PANEL_SURFACE)}>
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-white/8 bg-white/[0.045] text-[var(--text-secondary)]">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">{label}</h3>
          <p className="mt-1 text-[13px] leading-5 text-[var(--text-muted)]">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function WorkspaceLabel({
  icon: Icon,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-2 text-[13px] font-medium text-[var(--text-muted)]">
      <Icon className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
      {children}
    </span>
  );
}

function WorkspaceInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={cn(
        "w-full rounded-[var(--radius-lg)] px-4 py-3 text-[14.5px] text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]/60",
        SETTINGS_FIELD_SURFACE,
      )}
    />
  );
}

function writeAudioPreference(enabled: boolean) {
  try {
    writeCompatibleLocalStorageItem(AUDIO_STORAGE_KEY, JSON.stringify(enabled));
  } catch {
    // Ignore storage failures and keep the UI responsive.
  }
}

function formatPlanPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPlanPriceWithCurrency(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return formatPlanPrice(value);
  }
}

function findBillingPlan(plans: BillingPlanCatalogItem[], planName: string) {
  return plans.find((plan) => plan.name === planName) ?? null;
}

let razorpayScriptPromise: Promise<void> | null = null;

function loadRazorpayCheckoutScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay checkout is only available in the browser."));
  }

  if (window.Razorpay) {
    return Promise.resolve();
  }

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Razorpay checkout."));
      document.head.appendChild(script);
    });
  }

  return razorpayScriptPromise;
}

function formatIsoDate(value: string) {
  if (!value) {
    return "Not scheduled";
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function WorkspacePanel({
  value,
  onSave,
}: {
  value: WorkspaceFormState;
  onSave: (next: WorkspaceFormState) => Promise<SaveResult<WorkspaceFormState>>;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(value);
  const [savedMessage, setSavedMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [workspaceOptions, setWorkspaceOptions] = useState<WorkspaceSelectionOption[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [workspacePickerOpen, setWorkspacePickerOpen] = useState(false);
  const [isLoadingWorkspacePicker, setIsLoadingWorkspacePicker] = useState(false);
  const [pendingWorkspaceId, setPendingWorkspaceId] = useState<string | null>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(value);

  function updateField<K extends keyof WorkspaceFormState>(key: K, nextValue: WorkspaceFormState[K]) {
    setDraft((current) => ({ ...current, [key]: nextValue }));
    setSavedMessage("");
    setErrorMessage("");
  }

  async function handleSave() {
    setIsSaving(true);
    setSavedMessage("");
    setErrorMessage("");
    const result = await onSave(draft);
    setIsSaving(false);

    if (result.ok) {
      setSavedMessage(result.message);
      if (result.value) {
        setDraft(result.value);
      }
      return;
    }

    setErrorMessage(result.message);
  }

  async function openWorkspacePicker() {
    setIsLoadingWorkspacePicker(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/auth/workspace-selection", {
        cache: "no-store",
      });
      const result = await readJsonSafely<{
        error?: string;
        workspaces?: WorkspaceSelectionOption[];
        selectedWorkspaceId?: string | null;
      }>(response);

      if (!response.ok) {
        throw new Error(result?.error || "Workspace options could not be loaded.");
      }

      const workspaces = Array.isArray(result?.workspaces) ? result.workspaces : [];

      if (workspaces.length <= 1) {
        setErrorMessage("This account only belongs to one active workspace.");
        return;
      }

      setWorkspaceOptions(workspaces);
      setSelectedWorkspaceId(result?.selectedWorkspaceId ?? null);
      setWorkspacePickerOpen(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Workspace options could not be loaded.");
    } finally {
      setIsLoadingWorkspacePicker(false);
    }
  }

  async function handleWorkspaceSwitch(workspaceId: string) {
    setPendingWorkspaceId(workspaceId);
    setErrorMessage("");

    try {
      const response = await fetch("/api/auth/workspace-selection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId,
          nextPath: "/settings",
        }),
      });
      const result = await readJsonSafely<{
        error?: string;
        redirectPath?: string;
        selectedWorkspaceId?: string;
      }>(response);

      if (!response.ok || !result?.redirectPath) {
        throw new Error(result?.error || "Workspace switch could not be completed.");
      }

      setSelectedWorkspaceId(result.selectedWorkspaceId ?? workspaceId);
      setWorkspacePickerOpen(false);
      router.replace(result.redirectPath);
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Workspace switch could not be completed.");
    } finally {
      setPendingWorkspaceId(null);
    }
  }

  return (
    <>
      <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">Workspace</h2>
          <p className="mt-1.5 text-[15px] text-[var(--text-muted)]">
            Manage workspace identity, routing, and access rules here.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void openWorkspacePicker()}
            disabled={isLoadingWorkspacePicker || Boolean(pendingWorkspaceId)}
            className="btn-base btn-secondary flex items-center gap-2 rounded-[var(--radius-md)] px-4 py-2.5 text-[14px] font-medium disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Building2 className="h-4 w-4" />
            {isLoadingWorkspacePicker ? "Opening..." : "Switch Workspace"}
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={!hasChanges || isSaving}
            className="btn-base btn-primary flex items-center gap-2 rounded-[var(--radius-md)] px-4 py-2.5 text-[14px] font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {(hasChanges || savedMessage || errorMessage) && (
        <div
          className={cn(
            "flex items-center gap-2 rounded-[var(--radius-lg)] border px-4 py-3 text-[14px]",
            errorMessage
              ? "border-[var(--red)]/20 bg-[var(--red)]/8 text-[var(--red)]"
              : hasChanges
                ? "border-[var(--accent)]/20 bg-[var(--accent)]/8 text-[var(--accent)]"
                : "border-[var(--green)]/20 bg-[var(--green)]/8 text-[var(--green)]",
          )}
        >
          <BadgeCheck className="h-4 w-4 shrink-0" />
          {errorMessage || (hasChanges ? "You have unsaved workspace changes." : savedMessage)}
        </div>
      )}

      <div className="space-y-6">
        <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--accent)]/18 bg-[linear-gradient(180deg,rgba(251,138,116,0.14)_0%,rgba(255,255,255,0.03)_44%,rgba(255,255,255,0.02)_100%)]">
          <div className="flex flex-col gap-5 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] border border-[var(--accent)]/18 bg-[linear-gradient(180deg,rgba(251,138,116,0.16)_0%,rgba(255,255,255,0.04)_100%)] text-[var(--accent)] shadow-[0_18px_40px_-28px_rgba(251,138,116,0.7)]">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-[1.1rem] font-semibold tracking-tight text-[var(--text-primary)]">{draft.name || "Workspace"}</h3>
                <div className="mt-2 inline-flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/8 bg-white/5 text-[var(--accent)]">
                    <UserRound className="h-3.5 w-3.5" />
                  </span>
                  <span>Owner: {draft.owner || "Not set"}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.045)_0%,rgba(255,255,255,0.02)_100%)] p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/8 bg-white/5 text-[var(--accent)]">
                  <Globe2 className="h-4.5 w-4.5" />
                </div>
                <p className="text-[12px] font-medium tracking-[0.04em] text-[var(--text-muted)]">Slug</p>
                <p className="mt-2 break-all text-[14px] font-semibold text-[var(--text-primary)]">{draft.slug || "Not set"}</p>
              </div>

              <div className="rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.045)_0%,rgba(255,255,255,0.02)_100%)] p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/8 bg-white/5 text-[var(--accent)]">
                  <Clock3 className="h-4.5 w-4.5" />
                </div>
                <p className="text-[12px] font-medium tracking-[0.04em] text-[var(--text-muted)]">Timezone</p>
                <p className="mt-2 text-[14px] font-semibold text-[var(--text-primary)]">{draft.timezone}</p>
              </div>

              <div className="rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.045)_0%,rgba(255,255,255,0.02)_100%)] p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/8 bg-white/5 text-[var(--accent)]">
                  <MapPin className="h-4.5 w-4.5" />
                </div>
                <p className="text-[12px] font-medium tracking-[0.04em] text-[var(--text-muted)]">Region</p>
                <p className="mt-2 text-[14px] font-semibold text-[var(--text-primary)]">{draft.region || "Not set"}</p>
              </div>
            </div>
          </div>
        </div>

        <WorkspaceField
          icon={Building2}
          label="Workspace Identity"
          description="This controls how the workspace is labeled across the product."
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label>
                <WorkspaceLabel icon={Building2}>Workspace Name</WorkspaceLabel>
              </label>
              <WorkspaceInput value={draft.name} onChange={(next) => updateField("name", next)} placeholder="Enter workspace name" />
            </div>
            <div className="space-y-2">
              <label>
                <WorkspaceLabel icon={UserRound}>Workspace Owner</WorkspaceLabel>
              </label>
              <WorkspaceInput value={draft.owner} onChange={(next) => updateField("owner", next)} placeholder="Enter owner name" />
            </div>
          </div>
        </WorkspaceField>

        <WorkspaceField
          icon={Globe2}
          label="Workspace Routing"
          description="Use a stable slug and support mailbox for workspace-facing links and notifications."
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label>
                <WorkspaceLabel icon={Globe2}>Workspace Slug</WorkspaceLabel>
              </label>
              <div className="flex items-center overflow-hidden rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.03]">
                <span className="border-r border-white/8 px-4 py-3 text-[13px] text-[var(--text-muted)]">{APP_HOST}/</span>
                <input
                  type="text"
                  value={draft.slug}
                  onChange={(event) => updateField("slug", event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-{2,}/g, "-"))}
                  className="flex-1 bg-transparent px-4 py-3 text-[14.5px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                  placeholder="workspace-slug"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label>
                <WorkspaceLabel icon={Mail}>Support Email</WorkspaceLabel>
              </label>
              <WorkspaceInput type="email" value={draft.supportEmail} onChange={(next) => updateField("supportEmail", next)} placeholder="support@company.com" />
            </div>
          </div>
        </WorkspaceField>

        <WorkspaceField
          icon={Clock3}
          label="Regional Defaults"
          description="Keep timezone and region aligned for due dates, notifications, and reporting."
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label>
                <WorkspaceLabel icon={Clock3}>Timezone</WorkspaceLabel>
              </label>
              <select
                value={draft.timezone}
                onChange={(event) => updateField("timezone", event.target.value)}
                className="w-full appearance-none rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.03] px-4 py-3 text-[14.5px] text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent)]/60"
              >
                <option value="Asia/Kolkata" className="bg-[#1C1C1E] text-white">Asia/Kolkata</option>
                <option value="UTC" className="bg-[#1C1C1E] text-white">UTC</option>
                <option value="America/New_York" className="bg-[#1C1C1E] text-white">America/New_York</option>
                <option value="Europe/London" className="bg-[#1C1C1E] text-white">Europe/London</option>
              </select>
            </div>
            <div className="space-y-2">
              <label>
                <WorkspaceLabel icon={MapPin}>Primary Region</WorkspaceLabel>
              </label>
              <WorkspaceInput value={draft.region} onChange={(next) => updateField("region", next)} placeholder="Enter region" />
            </div>
          </div>
        </WorkspaceField>

        <WorkspaceField
          icon={ShieldCheck}
          label="Access Rules"
          description="Keep workspace-level permissions and invite behavior separate from People management."
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label>
                <WorkspaceLabel icon={ShieldCheck}>Invite Policy</WorkspaceLabel>
              </label>
              <select
                value={draft.invitePolicy}
                onChange={(event) => updateField("invitePolicy", event.target.value as WorkspaceFormState["invitePolicy"])}
                className="w-full appearance-none rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.03] px-4 py-3 text-[14.5px] text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent)]/60"
              >
                <option value="admins-only" className="bg-[#1C1C1E] text-white">Admins only</option>
                <option value="members-with-approval" className="bg-[#1C1C1E] text-white">Members with approval</option>
                <option value="open" className="bg-[#1C1C1E] text-white">Anyone with link</option>
              </select>
            </div>

            {[
              {
                key: "approvalFlow" as const,
                label: "Require admin approval",
                description: "New invites must be approved before getting access to the workspace.",
                icon: CalendarDays,
              },
              {
                key: "digest" as const,
                label: "Send workspace digest",
                description: "Keep owners updated with a regular workspace-level summary.",
                icon: Bell,
              },
            ].map((item) => (
              <div key={item.key} className="flex items-start justify-between gap-4 rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.02] px-4 py-3.5">
                <div>
                  <p className="inline-flex items-center gap-2 text-[14px] font-semibold text-[var(--text-primary)]">
                    <item.icon className="h-4 w-4 text-[var(--text-secondary)]" />
                    {item.label}
                  </p>
                  <p className="mt-1 text-[13px] leading-5 text-[var(--text-muted)]">{item.description}</p>
                </div>
                <Toggle checked={draft[item.key]} onChange={(next) => updateField(item.key, next)} />
              </div>
            ))}
          </div>
        </WorkspaceField>

        <WorkspaceField
          icon={Building2}
          label="Workspace Context"
          description="If this login belongs to multiple workspaces, switch the active workspace from here."
        >
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.02] px-4 py-4">
            <div>
              <p className="text-[14px] font-semibold text-[var(--text-primary)]">Current workspace context</p>
              <p className="mt-1 text-[13px] text-[var(--text-muted)]">
                Open the workspace picker and choose which workspace this session should use.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void openWorkspacePicker()}
              disabled={isLoadingWorkspacePicker || Boolean(pendingWorkspaceId)}
              className="btn-base btn-secondary rounded-[var(--radius-md)] px-4 py-2.5 text-[13px] font-medium disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pendingWorkspaceId ? "Switching..." : isLoadingWorkspacePicker ? "Opening..." : "Change Workspace"}
            </button>
          </div>
        </WorkspaceField>
      </div>
      </div>
      <WorkspaceSelectionModal
        open={workspacePickerOpen}
        title="Switch workspace"
        subtitle="Choose which workspace this session should use."
        workspaces={workspaceOptions}
        selectedWorkspaceId={selectedWorkspaceId}
        pendingWorkspaceId={pendingWorkspaceId}
        onSelect={(workspaceId) => {
          void handleWorkspaceSwitch(workspaceId);
        }}
        onClose={() => {
          if (!pendingWorkspaceId) {
            setWorkspacePickerOpen(false);
          }
        }}
      />
    </>
  );
}

function PasswordPanel({
  mode,
  currentDevice,
  devices,
  onSignOutOthers,
  onChangePassword,
}: {
  mode: SettingsMode;
  currentDevice: SavedDevice | null;
  devices: SavedDevice[];
  onSignOutOthers: () => Promise<SaveResult<null>>;
  onChangePassword: (payload: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<SaveResult<null>>;
}) {
  const [show, setShow] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [securityMessage, setSecurityMessage] = useState("");
  const [securityError, setSecurityError] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSigningOutOthers, setIsSigningOutOthers] = useState(false);

  function updateField(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    setSecurityMessage("");
    setSecurityError("");
  }

  async function handlePasswordSave() {
    setIsSavingPassword(true);
    setSecurityMessage("");
    setSecurityError("");
    const result = await onChangePassword(form);
    setIsSavingPassword(false);

    if (!result.ok) {
      setSecurityError(result.message);
      return;
    }

    setSecurityMessage(result.message);
    setForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  }

  async function handleSignOutOthers() {
    setIsSigningOutOthers(true);
    setSecurityMessage("");
    setSecurityError("");
    const result = await onSignOutOthers();
    setIsSigningOutOthers(false);

    if (!result.ok) {
      setSecurityError(result.message);
      return;
    }

    setSecurityMessage(result.message);
  }

  const otherDevices = devices.filter((device) => device.id !== currentDevice?.id);

  return (
    <div className="w-full space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">Password</h2>
        </div>
        <p className="mt-1.5 text-[15px] text-[var(--text-muted)]">
          Update your account password and review active devices.
        </p>
      </div>

      {(securityMessage || securityError) && (
        <div
          className={cn(
            "flex items-center gap-2 rounded-[var(--radius-lg)] border px-4 py-3 text-[14px]",
            securityError
              ? "border-[var(--red)]/20 bg-[var(--red)]/8 text-[var(--red)]"
              : "border-[var(--green)]/20 bg-[var(--green)]/8 text-[var(--green)]",
          )}
        >
          <BadgeCheck className="h-4 w-4 shrink-0" />
          {securityError || securityMessage}
        </div>
      )}

      <div className={cn("rounded-[var(--radius-xl)] p-6", SETTINGS_PANEL_SURFACE)}>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Change Password</h3>
            <p className="mt-1 text-[13px] text-[var(--text-muted)]">
              {mode === "remote"
                ? "Your current password is verified before the new one is applied."
                : "Sign in with your account to update the password."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handlePasswordSave()}
            disabled={mode !== "remote" || isSavingPassword}
            className="btn-base btn-primary rounded-[var(--radius-md)] px-4 py-2.5 text-[14px] font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSavingPassword ? "Updating..." : "Update Password"}
          </button>
        </div>

        <div className="space-y-4">
          {[
            { key: "currentPassword", label: "Current password" },
            { key: "newPassword", label: "New password" },
            { key: "confirmPassword", label: "Confirm new password" },
          ].map((field) => (
            <div key={field.key} className="space-y-2">
              <label className="text-[13px] font-medium text-[var(--text-muted)]">{field.label}</label>
              <div className={cn("flex items-center rounded-[var(--radius-xl)] px-5 py-3.5", SETTINGS_ROW_SURFACE)}>
                <KeyRound className="mr-3 h-4.5 w-4.5 text-[var(--text-secondary)]" />
                <input
                  type={show[field.key as keyof typeof show] ? "text" : "password"}
                  value={form[field.key as keyof typeof form]}
                  onChange={(event) => updateField(field.key as keyof typeof form, event.target.value)}
                  className="flex-1 bg-transparent text-[15px] font-medium tracking-widest text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShow((current) => ({
                      ...current,
                      [field.key]: !current[field.key as keyof typeof current],
                    }))
                  }
                  className="text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)]"
                >
                  {show[field.key as keyof typeof show] ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="type-section-title font-semibold text-[var(--text-primary)]">Session Security</h2>
            <p className="type-ui mt-1 text-[var(--text-muted)]">
              Review your current session and revoke all other active account sessions.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleSignOutOthers()}
            disabled={mode !== "remote" || isSigningOutOthers}
            className="btn-base btn-secondary rounded-[var(--radius-md)] px-4 py-2.5 text-[13px] font-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSigningOutOthers ? "Signing Out..." : "Sign Out Others"}
          </button>
        </div>
        <div className={cn("rounded-[var(--radius-xl)] p-5", SETTINGS_PANEL_SURFACE)}>
          {currentDevice ? (
            <div className="space-y-4">
              <div className={cn("rounded-[var(--radius-lg)] px-4 py-4", SETTINGS_ROW_SURFACE)}>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">{currentDevice.device}</span>
                  <span className="flex items-center gap-1.5 rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/12 px-2.5 py-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                    <span className="text-[12px] font-semibold uppercase tracking-wide text-[var(--accent)]">Current session</span>
                  </span>
                </div>
                <p className="mt-1.5 text-[13px] text-[var(--text-muted)]">
                  {currentDevice.location} · {currentDevice.date}
                </p>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-[14px] font-semibold tracking-tight text-[var(--text-primary)]">Saved Devices</h3>
                  <span className="text-[12px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                    {otherDevices.length}
                  </span>
                </div>
                {otherDevices.length > 0 ? (
                  <div className="space-y-2">
                    {otherDevices.map((device) => (
                      <div key={device.id} className={cn("rounded-[var(--radius-lg)] px-4 py-4", SETTINGS_ROW_SURFACE)}>
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="text-[14px] font-semibold tracking-tight text-[var(--text-primary)]">{device.device}</span>
                          {device.active ? (
                            <span className="flex items-center gap-1.5 rounded-full border border-[var(--green)]/20 bg-[var(--green)]/10 px-2.5 py-0.5 text-[12px] font-semibold uppercase tracking-wide text-[var(--green)]">
                              <Check className="h-3 w-3" />
                              Active
                            </span>
                          ) : null}
                          {device.reported ? (
                            <span className="flex items-center gap-1.5 rounded-full border border-[var(--red)]/20 bg-[var(--red)]/10 px-2.5 py-0.5 text-[12px] font-semibold uppercase tracking-wide text-[var(--red)]">
                              <OctagonAlert className="h-3 w-3" />
                              Review
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1.5 text-[13px] text-[var(--text-muted)]">
                          {device.location} · {device.date}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={cn("rounded-[var(--radius-lg)] px-4 py-4 text-[14px] text-[var(--text-muted)]", SETTINGS_ROW_SURFACE)}>
                    No additional saved devices are recorded for this account.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.03] px-4 py-4 text-[14px] text-[var(--text-muted)]">
              Session details are only available while you are signed in with a live account session.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PlanPanel({
  value,
  onSave,
  mode,
  billing,
}: {
  value: PlanSettings;
  onSave: (next: PlanSettings) => Promise<SaveResult<PlanSettings>>;
  mode: SettingsMode;
  billing: BillingUiConfig;
}) {
  const [draft, setDraft] = useState(value);
  const [savedMessage, setSavedMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(value);
  const currentPlan = findBillingPlan(billing.plans, value.name);
  const selectedPlan = findBillingPlan(billing.plans, draft.name);
  const requiresCheckout = mode === "remote" && hasChanges && Boolean(selectedPlan?.isPaid);
  const isPendingPlanChange = draft.name !== value.name;
  const saveLabel = isSaving
    ? requiresCheckout
      ? "Opening Razorpay..."
      : "Saving..."
    : requiresCheckout
      ? "Continue to Payment"
      : "Save Plan";

  async function handleSave() {
    setIsSaving(true);
    setSavedMessage("");
    setErrorMessage("");
    const result = await onSave(draft);
    setIsSaving(false);

    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }

    setSavedMessage(result.message);
    if (result.value) {
      setDraft(result.value);
    }
  }

  function downloadInvoice(item: PlanSettings["billingHistory"][number]) {
    const content = [
      `Invoice: ${item.invoiceNumber || item.id}`,
      `Date: ${item.date}`,
      `Plan: ${item.planName || draft.name}`,
      `Amount: ${item.amount}`,
      `Status: ${item.status}`,
      item.currency ? `Currency: ${item.currency}` : "",
      item.renewalDate ? `Next renewal: ${item.renewalDate}` : "",
      item.razorpayPaymentId ? `Razorpay payment: ${item.razorpayPaymentId}` : "",
      item.razorpayOrderId ? `Razorpay order: ${item.razorpayOrderId}` : "",
      item.receipt ? `Receipt: ${item.receipt}` : "",
    ].filter(Boolean).join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${item.invoiceNumber || item.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">Current Plan</h2>
          <p className="mt-1.5 text-[15px] text-[var(--text-muted)]">Manage your subscription details and billing history.</p>
        </div>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={!hasChanges || isSaving}
          className="btn-base btn-primary rounded-[var(--radius-md)] px-4 py-2.5 text-[14.5px] font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saveLabel}
        </button>
      </div>

      {(savedMessage || errorMessage) && (
        <div
          className={cn(
            "flex items-center gap-2 rounded-[var(--radius-lg)] border px-4 py-3 text-[14px]",
            errorMessage
              ? "border-[var(--red)]/20 bg-[var(--red)]/8 text-[var(--red)]"
              : "border-[var(--green)]/20 bg-[var(--green)]/8 text-[var(--green)]",
          )}
        >
          <BadgeCheck className="h-4 w-4 shrink-0" />
          {errorMessage || savedMessage}
        </div>
      )}

      <div className="rounded-[var(--radius-xl)] border border-[var(--accent)]/30 bg-[linear-gradient(180deg,rgba(251,138,116,0.12)_0%,rgba(255,255,255,0.025)_100%)] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[12px] font-bold uppercase tracking-widest text-[var(--accent)]">{value.name}</span>
            <p className="mt-1 text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              {formatPlanPriceWithCurrency(value.priceMonthly, currentPlan?.currency || "USD")}
              <span className="text-[15px] font-normal text-[var(--text-muted)]"> / month</span>
            </p>
            <p className="mt-1 text-[13px] font-medium text-[var(--text-muted)]">Renews on {formatIsoDate(value.renewsOn)}</p>
            {isPendingPlanChange ? (
              <p className="mt-2 text-[13px] text-[var(--text-secondary)]">
                Selected next: {draft.name}
                {requiresCheckout ? " after payment is completed." : " when you save changes."}
              </p>
            ) : null}
          </div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            { label: "Team Members", value: `${value.teamMembersUsed} / ${value.teamMembersLimit}` },
            { label: "Projects", value: `${value.projectsUsed} / ${value.projectsLimit}` },
            { label: "Storage", value: `${value.storageUsedGb.toFixed(1)} GB / ${value.storageLimitGb} GB` },
          ].map((item) => (
            <div key={item.label} className={cn("rounded-[var(--radius-lg)] px-4 py-3", SETTINGS_ROW_SURFACE)}>
              <p className="text-[13px] font-medium text-[var(--text-muted)]">{item.label}</p>
              <p className="mt-0.5 text-[15px] font-semibold text-[var(--text-primary)]">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={cn("rounded-[var(--radius-xl)] p-5", SETTINGS_PANEL_SURFACE)}>
        <h3 className="mb-4 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Change Plan</h3>
        {isPendingPlanChange ? (
          <div className="mb-4 rounded-[var(--radius-lg)] border border-[var(--accent)]/20 bg-[var(--accent)]/8 px-4 py-3 text-[13px] text-[var(--text-secondary)]">
            {requiresCheckout
              ? `${draft.name} will activate after a successful Razorpay payment.`
              : `${draft.name} will become active when you save changes.`}
          </div>
        ) : null}
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {billing.plans.map((plan) => (
            <button
              key={plan.name}
              type="button"
              onClick={() =>
                setDraft((current) => ({
                  ...current,
                  name: plan.name,
                  priceMonthly: plan.priceMonthly,
                  teamMembersLimit: plan.teamMembersLimit,
                  projectsLimit: plan.projectsLimit,
                  storageLimitGb: plan.storageLimitGb,
                }))
              }
              className={cn(
                "group relative flex min-h-[196px] flex-col justify-between overflow-hidden rounded-[16px] border px-4 py-4 text-left transition-all duration-200",
                draft.name === plan.name
                  ? "border-[var(--accent)]/40 bg-[linear-gradient(180deg,rgba(251,138,116,0.14)_0%,rgba(255,255,255,0.04)_100%)] shadow-[0_16px_36px_rgba(0,0,0,0.22)]"
                  : plan.isPaid
                    ? "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055)_0%,rgba(255,255,255,0.025)_100%)] hover:border-white/16 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.07)_0%,rgba(255,255,255,0.03)_100%)]"
                    : "border-white/8 bg-white/[0.03] hover:border-white/14 hover:bg-white/[0.05]",
              )}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={cn(
                      "text-[11px] font-semibold uppercase tracking-[0.18em]",
                      draft.name === plan.name ? "text-[var(--accent)]" : "text-[var(--text-muted)]",
                    )}>
                      {plan.isPaid ? "Premium tier" : "Included"}
                    </p>
                    <p className="mt-2 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">{plan.name}</p>
                  </div>
                  {draft.name === plan.name ? (
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--accent)]/22 bg-[var(--accent)]/14 text-[var(--accent)]">
                      <Check className="h-4 w-4" />
                    </span>
                  ) : null}
                </div>
                <p className="mt-5 text-[27px] font-semibold tracking-tight text-[var(--text-primary)]">
                  {formatPlanPriceWithCurrency(plan.priceMonthly, plan.currency)}
                  <span className="ml-1 text-[13px] font-medium text-[var(--text-muted)]">/ month</span>
                </p>
                <p className="mt-3 text-[12px] leading-5 text-[var(--text-secondary)]">
                  Designed for {plan.teamMembersLimit <= 5 ? "small teams and early delivery" : plan.teamMembersLimit <= 20 ? "growing teams with active delivery" : "larger teams running multiple workstreams"}.
                </p>
              </div>
              <div className="mt-5 space-y-2 border-t border-white/8 pt-4">
                <div className="flex items-center justify-between gap-3 text-[12.5px]">
                  <span className="text-[var(--text-muted)]">Seats</span>
                  <span className="font-medium text-[var(--text-primary)]">{plan.teamMembersLimit}</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-[12.5px]">
                  <span className="text-[var(--text-muted)]">Projects</span>
                  <span className="font-medium text-[var(--text-primary)]">{plan.projectsLimit}</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-[12.5px]">
                  <span className="text-[var(--text-muted)]">Storage</span>
                  <span className="font-medium text-[var(--text-primary)]">{plan.storageLimitGb} GB</span>
                </div>
              </div>
            </button>
          ))}
          <a
            href={`mailto:${SALES_CONTACT_EMAIL}?subject=${encodeURIComponent("Enterprise Plan Inquiry")}`}
            className="group relative flex min-h-[196px] flex-col justify-between overflow-hidden rounded-[16px] border border-[var(--accent)]/22 bg-[linear-gradient(180deg,rgba(251,138,116,0.08)_0%,rgba(255,255,255,0.03)_100%)] px-4 py-4 text-left transition-all duration-200 hover:border-[var(--accent)]/32 hover:bg-[linear-gradient(180deg,rgba(251,138,116,0.12)_0%,rgba(255,255,255,0.04)_100%)]"
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Custom</p>
              <p className="mt-2 text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Enterprise</p>
              <p className="mt-5 text-[27px] font-semibold tracking-tight text-[var(--text-primary)]">Custom</p>
              <p className="mt-3 text-[12px] leading-5 text-[var(--text-secondary)]">
                Tailored limits, onboarding support, and a cleaner rollout for higher-volume workspaces.
              </p>
            </div>
            <div className="mt-5 border-t border-[var(--accent)]/16 pt-4">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                Contact Sales
              </p>
            </div>
          </a>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Billing History</h3>
        {draft.billingHistory.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-4 border-b border-white/5 py-3.5 last:border-0">
            <div>
              <p className="type-ui text-[var(--text-secondary)]">{formatIsoDate(item.date)}</p>
              {item.invoiceNumber ? (
                <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]">{item.invoiceNumber}</p>
              ) : null}
            </div>
            <span className="type-ui font-semibold text-[var(--text-primary)]">{item.amount}</span>
            <span
              className={cn(
                "type-caption rounded-full px-2.5 py-0.5",
                item.status === "Paid"
                  ? "bg-[var(--green)]/10 text-[var(--green)]"
                  : item.status === "Pending"
                    ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "bg-[var(--red)]/10 text-[var(--red)]",
              )}
            >
              {item.status}
            </span>
            <button
              type="button"
              onClick={() => downloadInvoice(item)}
              className="type-caption text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)]"
            >
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationsPanel({
  value,
  onSave,
}: {
  value: NotificationPreferences;
  onSave: (next: NotificationPreferences) => Promise<SaveResult<NotificationPreferences>>;
}) {
  const [draft, setDraft] = useState(value);
  const [savedMessage, setSavedMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(value);
  const rows = [
    { key: "email", label: "Email Notifications", desc: "Receive updates via email" },
    { key: "push", label: "Push Notifications", desc: "Browser and mobile push alerts" },
    { key: "inApp", label: "In-App Alerts", desc: "Show alerts inside the dashboard" },
    { key: "sound", label: "Notification Sound", desc: "Play a sound for new notifications" },
    { key: "tasks", label: "Task Reminders", desc: "Get reminded about upcoming deadlines" },
    { key: "mentions", label: "Mentions", desc: "When someone @mentions you" },
    { key: "team", label: "Team Updates", desc: "When teammates join or leave projects" },
    { key: "digest", label: "Weekly Digest", desc: "Summary of your week every Monday" },
  ] as const;

  async function handleSave() {
    setIsSaving(true);
    setSavedMessage("");
    setErrorMessage("");
    const result = await onSave(draft);
    setIsSaving(false);

    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }

    setSavedMessage(result.message);
    if (result.value) {
      setDraft(result.value);
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">Notifications</h2>
          <p className="mt-1.5 text-[15px] text-[var(--text-muted)]">Choose how and when you want to be notified.</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setDraft(value)}
            disabled={!hasChanges || isSaving}
            className="btn-base btn-secondary rounded-[var(--radius-md)] px-4 py-2.5 text-[14px] font-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={!hasChanges || isSaving}
            className="btn-base btn-primary rounded-[var(--radius-md)] px-4 py-2.5 text-[14px] font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {(savedMessage || errorMessage || hasChanges) && (
        <div
          className={cn(
            "flex items-center gap-2 rounded-[var(--radius-lg)] border px-4 py-3 text-[14px]",
            errorMessage
              ? "border-[var(--red)]/20 bg-[var(--red)]/8 text-[var(--red)]"
              : hasChanges
                ? "border-[var(--accent)]/20 bg-[var(--accent)]/8 text-[var(--accent)]"
                : "border-[var(--green)]/20 bg-[var(--green)]/8 text-[var(--green)]",
          )}
        >
          <BadgeCheck className="h-4 w-4 shrink-0" />
          {errorMessage || (hasChanges ? "You have unsaved notification changes." : savedMessage)}
        </div>
      )}

      <div className="space-y-0">
        {rows.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between gap-6 border-b border-white/5 py-4 last:border-0">
            <div>
              <p className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">{label}</p>
              <p className="mt-0.5 text-[14px] text-[var(--text-muted)]">{desc}</p>
            </div>
            <Toggle
              checked={draft[key]}
              onChange={(next) => {
                setDraft((current) => ({ ...current, [key]: next }));
                setSavedMessage("");
                setErrorMessage("");
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectsPanel({
  tags,
  projectTypes,
  onSave,
}: {
  tags: TagDefinition[];
  projectTypes: string[];
  onSave: (next: { projectTags: TagDefinition[]; projectTypes: string[] }) => Promise<SaveResult<{
    projectTags: TagDefinition[];
    projectTypes: string[];
  }>>;
}) {
  const [draftTags, setDraftTags] = useState(tags);
  const [draftProjectTypes, setDraftProjectTypes] = useState(projectTypes);
  const [pendingDeleteTag, setPendingDeleteTag] = useState<TagDefinition | null>(null);
  const [pendingDeleteTypeIdx, setPendingDeleteTypeIdx] = useState<number | null>(null);
  const [addingTag, setAddingTag] = useState(false);
  const [newTagLabel, setNewTagLabel] = useState("");
  const [newTagColor, setNewTagColor] = useState<string>(TAG_COLOR_SWATCHES[0]);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editTagLabel, setEditTagLabel] = useState("");
  const [editTagColor, setEditTagColor] = useState<string>(TAG_COLOR_SWATCHES[0]);
  const [addingType, setAddingType] = useState(false);
  const [newType, setNewType] = useState("");
  const [editingTypeIdx, setEditingTypeIdx] = useState<number | null>(null);
  const [editTypeValue, setEditTypeValue] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraftTags(tags);
  }, [tags]);

  useEffect(() => {
    setDraftProjectTypes(projectTypes);
  }, [projectTypes]);

  const hasChanges = JSON.stringify(draftTags) !== JSON.stringify(tags)
    || JSON.stringify(draftProjectTypes) !== JSON.stringify(projectTypes);

  async function handleSave() {
    setIsSaving(true);
    setSavedMessage("");
    setErrorMessage("");
    const result = await onSave({
      projectTags: draftTags,
      projectTypes: draftProjectTypes,
    });
    setIsSaving(false);

    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }

    setSavedMessage(result.message);
  }

  function handleAddTag() {
    const label = newTagLabel.trim();
    if (!label) return;
    setDraftTags([...draftTags, { id: `tag-${Date.now()}`, label, color: newTagColor }]);
    setNewTagLabel("");
    setNewTagColor(TAG_COLOR_SWATCHES[0]);
    setAddingTag(false);
    setSavedMessage("");
    setErrorMessage("");
  }

  function handleStartEditTag(tag: TagDefinition) {
    setEditingTagId(tag.id);
    setEditTagLabel(tag.label);
    setEditTagColor(tag.color);
    setAddingTag(false);
  }

  function handleSaveEditTag() {
    const label = editTagLabel.trim();
    if (!label || !editingTagId) return;
    setDraftTags(draftTags.map((tag) => (tag.id === editingTagId ? { ...tag, label, color: editTagColor } : tag)));
    setEditingTagId(null);
    setSavedMessage("");
    setErrorMessage("");
  }

  function handleDeleteTag(id: string) {
    setDraftTags(draftTags.filter((tag) => tag.id !== id));
    setPendingDeleteTag(null);
    setSavedMessage("");
    setErrorMessage("");
  }

  function handleAddType() {
    const label = newType.trim();
    if (!label) return;
    setDraftProjectTypes([...draftProjectTypes, label]);
    setNewType("");
    setAddingType(false);
    setSavedMessage("");
    setErrorMessage("");
  }

  function handleSaveEditType() {
    const label = editTypeValue.trim();
    if (!label || editingTypeIdx === null) return;
    setDraftProjectTypes(draftProjectTypes.map((type, index) => (index === editingTypeIdx ? label : type)));
    setEditingTypeIdx(null);
    setSavedMessage("");
    setErrorMessage("");
  }

  function handleDeleteType(idx: number) {
    setDraftProjectTypes(draftProjectTypes.filter((_, index) => index !== idx));
    setPendingDeleteTypeIdx(null);
    setSavedMessage("");
    setErrorMessage("");
  }

  const colorRow = (selected: string, onSelect: (color: string) => void) => (
    <div className="flex shrink-0 gap-1.5">
      {TAG_COLOR_SWATCHES.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onSelect(color)}
          className="h-5 w-5 shrink-0 rounded-full border-2 transition-transform hover:scale-110"
          style={{ backgroundColor: color, borderColor: selected === color ? "white" : "transparent" }}
        />
      ))}
    </div>
  );

  return (
    <div className="w-full space-y-8">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">Projects</h2>
        <p className="mt-1.5 text-[15px] text-[var(--text-muted)]">
          Manage default tags and project types used across all projects.
        </p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="text-[13px] text-[var(--text-muted)]">
          These defaults are shared across your workspace.
        </div>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={!hasChanges || isSaving}
          className="btn-base btn-primary rounded-[var(--radius-md)] px-4 py-2.5 text-[14px] font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {(savedMessage || errorMessage || hasChanges) && (
        <div
          className={cn(
            "flex items-center gap-2 rounded-[var(--radius-lg)] border px-4 py-3 text-[14px]",
            errorMessage
              ? "border-[var(--red)]/20 bg-[var(--red)]/8 text-[var(--red)]"
              : hasChanges
                ? "border-[var(--accent)]/20 bg-[var(--accent)]/8 text-[var(--accent)]"
                : "border-[var(--green)]/20 bg-[var(--green)]/8 text-[var(--green)]",
          )}
        >
          <BadgeCheck className="h-4 w-4 shrink-0" />
          {errorMessage || (hasChanges ? "You have unsaved project settings changes." : savedMessage)}
        </div>
      )}

      <div className={cn("rounded-[var(--radius-xl)] p-5", SETTINGS_PANEL_SURFACE)}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-white/8 bg-white/[0.045] text-[var(--text-secondary)]">
              <Tag className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Tags</h3>
              <p className="mt-0.5 text-[13px] text-[var(--text-muted)]">Labels used to categorize tasks across projects.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setAddingTag(true);
              setEditingTagId(null);
            }}
            className="btn-base btn-secondary flex items-center gap-1.5 rounded-[var(--radius-md)] px-3.5 py-2 text-[13px] font-medium"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Tag
          </button>
        </div>

        <div className="space-y-1.5">
          {draftTags.map((tag) =>
            editingTagId === tag.id ? (
              <div key={tag.id} className={cn("flex items-center gap-3 rounded-[var(--radius-lg)] px-4 py-3", SETTINGS_FIELD_SURFACE)}>
                {colorRow(editTagColor, setEditTagColor)}
                <input
                  autoFocus
                  value={editTagLabel}
                  onChange={(event) => setEditTagLabel(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleSaveEditTag();
                    if (event.key === "Escape") setEditingTagId(null);
                  }}
                  className="min-w-0 flex-1 bg-transparent text-[14px] text-[var(--text-primary)] outline-none"
                />
                <button type="button" onClick={handleSaveEditTag} className="shrink-0 text-[var(--green)] transition-opacity hover:opacity-70">
                  <Check className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setEditingTagId(null)} className="shrink-0 text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div key={tag.id} className={cn("group flex items-center gap-3 rounded-[var(--radius-lg)] px-4 py-3 hover:bg-white/[0.03]", SETTINGS_ROW_SURFACE)}>
                <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ backgroundColor: tag.color }} />
                <span className="flex-1 text-[14px] text-[var(--text-primary)]">{tag.label}</span>
                <button
                  type="button"
                  onClick={() => handleStartEditTag(tag)}
                  className="shrink-0 text-[var(--text-muted)] opacity-0 transition-all hover:text-[var(--text-secondary)] group-hover:opacity-100"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPendingDeleteTag(tag)}
                  className="shrink-0 text-[var(--text-muted)] opacity-0 transition-all hover:text-[var(--red)] group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ),
          )}

          {addingTag && (
            <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--accent)]/30 bg-[var(--accent)]/5 px-4 py-3">
              {colorRow(newTagColor, setNewTagColor)}
              <input
                autoFocus
                value={newTagLabel}
                onChange={(event) => setNewTagLabel(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleAddTag();
                  if (event.key === "Escape") setAddingTag(false);
                }}
                placeholder="Tag label"
                className="min-w-0 flex-1 bg-transparent text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
              />
              <button type="button" onClick={handleAddTag} className="shrink-0 text-[var(--green)] transition-opacity hover:opacity-70">
                <Check className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setAddingTag(false)} className="shrink-0 text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={cn("rounded-[var(--radius-xl)] p-5", SETTINGS_PANEL_SURFACE)}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-white/8 bg-white/[0.045] text-[var(--text-secondary)]">
              <FolderKanban className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Project Types</h3>
              <p className="mt-0.5 text-[13px] text-[var(--text-muted)]">Options shown when creating a new project.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setAddingType(true);
              setEditingTypeIdx(null);
            }}
            className="btn-base btn-secondary flex items-center gap-1.5 rounded-[var(--radius-md)] px-3.5 py-2 text-[13px] font-medium"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Type
          </button>
        </div>

        <div className="space-y-1.5">
          {draftProjectTypes.map((type, idx) =>
            editingTypeIdx === idx ? (
              <div key={idx} className={cn("flex items-center gap-3 rounded-[var(--radius-lg)] px-4 py-3", SETTINGS_FIELD_SURFACE)}>
                <input
                  autoFocus
                  value={editTypeValue}
                  onChange={(event) => setEditTypeValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleSaveEditType();
                    if (event.key === "Escape") setEditingTypeIdx(null);
                  }}
                  className="min-w-0 flex-1 bg-transparent text-[14px] text-[var(--text-primary)] outline-none"
                />
                <button type="button" onClick={handleSaveEditType} className="shrink-0 text-[var(--green)] transition-opacity hover:opacity-70">
                  <Check className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setEditingTypeIdx(null)} className="shrink-0 text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div key={idx} className={cn("group flex items-center gap-3 rounded-[var(--radius-lg)] px-4 py-3 hover:bg-white/[0.03]", SETTINGS_ROW_SURFACE)}>
                <span className="flex-1 text-[14px] text-[var(--text-primary)]">{type}</span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingTypeIdx(idx);
                    setEditTypeValue(type);
                    setAddingType(false);
                  }}
                  className="shrink-0 text-[var(--text-muted)] opacity-0 transition-all hover:text-[var(--text-secondary)] group-hover:opacity-100"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPendingDeleteTypeIdx(idx)}
                  className="shrink-0 text-[var(--text-muted)] opacity-0 transition-all hover:text-[var(--red)] group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ),
          )}

          {addingType && (
            <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--accent)]/30 bg-[var(--accent)]/5 px-4 py-3">
              <input
                autoFocus
                value={newType}
                onChange={(event) => setNewType(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleAddType();
                  if (event.key === "Escape") setAddingType(false);
                }}
                placeholder="Type name"
                className="min-w-0 flex-1 bg-transparent text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
              />
              <button type="button" onClick={handleAddType} className="shrink-0 text-[var(--green)] transition-opacity hover:opacity-70">
                <Check className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setAddingType(false)} className="shrink-0 text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmationModal
        open={Boolean(pendingDeleteTag)}
        title="Delete tag?"
        description={
          pendingDeleteTag
            ? `Delete "${pendingDeleteTag.label}" from project settings? This cannot be undone from this screen.`
            : ""
        }
        confirmLabel="Delete tag"
        onConfirm={() => {
          if (pendingDeleteTag) {
            handleDeleteTag(pendingDeleteTag.id);
          }
        }}
        onClose={() => setPendingDeleteTag(null)}
      />

      <DeleteConfirmationModal
        open={pendingDeleteTypeIdx !== null}
        title="Delete project type?"
        description={
          pendingDeleteTypeIdx !== null
            ? `Delete "${draftProjectTypes[pendingDeleteTypeIdx]}" from project type options?`
            : ""
        }
        confirmLabel="Delete type"
        onConfirm={() => {
          if (pendingDeleteTypeIdx !== null) {
            handleDeleteType(pendingDeleteTypeIdx);
          }
        }}
        onClose={() => setPendingDeleteTypeIdx(null)}
      />
    </div>
  );
}

function DangerPanel({
  mode,
  onDeleteAccount,
}: {
  mode: SettingsMode;
  onDeleteAccount: () => Promise<SaveResult<null>>;
}) {
  const [pendingAction, setPendingAction] = useState<"account" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<"account" | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const destructiveActionsEnabled = mode === "remote";
  const destructiveActionsMessage = mode === "demo"
    ? "Account deletion is disabled in demo sessions."
    : "Account deletion requires a signed-in account session.";

  async function handleConfirm(action: "account") {
    setIsSubmitting(action);
    setErrorMessage("");

    const result = await onDeleteAccount();

    if (!result.ok) {
      setErrorMessage(result.message);
      setIsSubmitting(null);
      return;
    }

    setPendingAction(null);
    setIsSubmitting(null);
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">Danger Zone</h2>
        <p className="mt-1.5 text-[15px] text-[var(--text-muted)]">
          This action is permanent. Remove the account entirely.
        </p>
      </div>

      {!destructiveActionsEnabled && (
        <div className="rounded-[var(--radius-lg)] border border-[var(--accent)]/20 bg-[var(--accent)]/8 px-4 py-3 text-[13px] text-[var(--accent)]">
          {destructiveActionsMessage}
        </div>
      )}

      <section className="rounded-[var(--radius-xl)] border border-[var(--red)]/20 bg-[linear-gradient(180deg,rgba(149,29,42,0.16)_0%,rgba(255,255,255,0.02)_100%)] p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-[var(--red)]/20 bg-[var(--red)]/10 text-[var(--red)]">
            <UserRound className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Delete Account</h3>
            <p className="mt-1 text-[13px] leading-5 text-[var(--text-muted)]">
              Permanently remove this login, personal profile, saved settings, and any workspaces you own. You will be signed out immediately.
            </p>
            <p className="mt-3 text-[12px] leading-5 text-[var(--text-muted)]">
              Use this only when you want the entire account removed from the app.
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={!destructiveActionsEnabled}
          onClick={() => {
            setErrorMessage("");
            setPendingAction("account");
          }}
          className="btn-base mt-5 inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--red)]/20 bg-[var(--red)]/12 px-4 py-2.5 text-[14px] font-semibold text-[var(--red)] transition hover:bg-[var(--red)]/16 disabled:cursor-not-allowed disabled:opacity-55"
        >
          <UserX className="h-4 w-4" />
          Delete Account
        </button>
      </section>

      <DeleteConfirmationModal
        open={pendingAction === "account"}
        title="Delete account?"
        description="This cannot be undone. Your account, profile data, saved settings, and any owned workspaces will be deleted permanently."
        confirmLabel="Delete account"
        confirmationKeyword="DELETE ACCOUNT"
        confirmationLabel="Type DELETE ACCOUNT to confirm"
        errorMessage={pendingAction === "account" ? errorMessage : ""}
        isConfirming={isSubmitting === "account"}
        onConfirm={() => {
          void handleConfirm("account");
        }}
        onClose={() => {
          if (isSubmitting) {
            return;
          }

          setPendingAction(null);
          setErrorMessage("");
        }}
      />
    </div>
  );
}

function TrashPanel({
  mode,
  items,
  isLoading,
  actionId,
  errorMessage,
  onRestore,
  onPermanentDelete,
}: {
  mode: SettingsMode;
  items: WorkspaceTrashItem[];
  isLoading: boolean;
  actionId: string | null;
  errorMessage: string;
  onRestore: (trashId: string) => void;
  onPermanentDelete: (trashId: string) => void;
}) {
  if (mode !== "remote") {
    return (
      <div className="space-y-6">
        <div className={cn("rounded-[var(--radius-xl)] p-5", SETTINGS_PANEL_SURFACE)}>
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">Trash</h2>
          <p className="mt-2 text-[13px] leading-6 text-[var(--text-muted)]">
            Trash is currently available for signed-in workspace sessions. Demo and offline/local sessions do not keep
            a recoverable server trash history.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={cn("rounded-[var(--radius-xl)] p-5", SETTINGS_PANEL_SURFACE)}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">Workspace Trash</h2>
            <p className="mt-1 text-[13px] leading-6 text-[var(--text-muted)]">
              Deleted tasks, projects, people entries, and clients land here first. Restore them or permanently delete them.
            </p>
          </div>
          <span className="rounded-full border border-white/8 px-3 py-1 text-[12px] font-medium text-[var(--text-secondary)]">
            {String(items.length).padStart(2, "0")} items
          </span>
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-[var(--radius-lg)] border border-[var(--red)]/20 bg-[var(--red)]/10 px-4 py-3 text-[13px] text-[var(--red)]">
            {errorMessage}
          </div>
        ) : null}

        {isLoading ? (
          <div className="mt-5 rounded-[var(--radius-lg)] border border-white/8 bg-white/[0.02] px-4 py-8 text-center text-[13px] text-[var(--text-muted)]">
            Loading trash items...
          </div>
        ) : items.length === 0 ? (
          <div className="mt-5 rounded-[var(--radius-lg)] border border-dashed border-white/8 bg-white/[0.02] px-4 py-8 text-center text-[13px] text-[var(--text-muted)]">
            Trash is empty.
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {items.map((item) => {
              const isBusy = actionId === item.id;
              const deletedLabel = new Date(item.deletedAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              });

              return (
                <div key={item.id} className={cn("rounded-[var(--radius-lg)] px-4 py-4", SETTINGS_ROW_SURFACE)}>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/8 px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
                          {item.itemType}
                        </span>
                        <h3 className="text-[14px] font-semibold text-[var(--text-primary)]">{item.itemLabel}</h3>
                      </div>
                      <p className="mt-1 text-[12.5px] text-[var(--text-secondary)]">
                        {item.summary || "Deleted workspace item"}
                      </p>
                      <p className="mt-1 text-[12px] text-[var(--text-muted)]">Deleted {deletedLabel}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => onRestore(item.id)}
                        className="btn-base btn-secondary rounded-[var(--radius-md)] px-3.5 py-2 text-[13px] font-medium"
                      >
                        Restore
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => onPermanentDelete(item.id)}
                        className="btn-base rounded-[var(--radius-md)] border border-[var(--red)]/20 bg-[var(--red)]/10 px-3.5 py-2 text-[13px] font-medium text-[var(--red)]"
                      >
                        Permanently Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const tabs = [
  { id: "workspace", label: "Workspace", icon: Building2 },
  { id: "password", label: "Password", icon: KeyRound },
  { id: "plan", label: "Plan", icon: Tag },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "trash", label: "Trash", icon: ArchiveX },
  { id: "danger", label: "Danger", icon: OctagonAlert },
] as const;

type TabId = typeof tabs[number]["id"];

function isTabId(value: string | null): value is TabId {
  return tabs.some((tab) => tab.id === value);
}

export function SettingsShell({
  billing,
}: {
  billing: BillingUiConfig;
}) {
  const searchParams = useSearchParams();
  const hydrated = useHydrated();
  const [, setWorkspaceActivity] = useWorkspaceActivityFeed();
  const cachedSettingsRef = useRef(readSettingsCache());
  const cachedSettings = cachedSettingsRef.current;
  const [active, setActive] = usePersistentState<TabId>("planix.settings.active-tab", "workspace");
  const [localWorkspace, setLocalWorkspace] = useState<WorkspaceFormState>(cachedSettings?.settings.workspace ?? defaultWorkspaceForm);
  const [localNotifications, setLocalNotifications] = useState<NotificationPreferences>(cachedSettings?.settings.notifications ?? defaultNotificationPreferences);
  const [localPlan, setLocalPlan] = useState<PlanSettings>(cachedSettings?.settings.plan ?? defaultPlanSettings);
  const [localDevices, setLocalDevices] = useState<SavedDevice[]>(cachedSettings?.settings.devices ?? defaultSavedDevices);
  const [localProjectTags, setLocalProjectTags] = useState<TagDefinition[]>(cachedSettings?.settings.projectTags ?? DEFAULT_TAGS);
  const [localProjectTypes, setLocalProjectTypes] = useState<string[]>(cachedSettings?.settings.projectTypes ?? [...DEFAULT_PROJECT_TYPES]);
  const [mode, setMode] = useState<SettingsMode>(cachedSettings?.mode ?? "loading");
  const [settings, setSettings] = useState<SettingsBundle>(cachedSettings?.settings ?? defaultSettingsBundle);
  const [currentDevice, setCurrentDevice] = useState<SavedDevice | null>(null);
  const [loadError, setLoadError] = useState("");
  const [trashItems, setTrashItems] = useState<WorkspaceTrashItem[]>([]);
  const [trashLoading, setTrashLoading] = useState(false);
  const [trashError, setTrashError] = useState("");
  const [trashActionId, setTrashActionId] = useState<string | null>(null);
  const focusedTab = searchParams.get("tab");

  useEffect(() => {
    if (!hydrated || !isTabId(focusedTab) || active === focusedTab) {
      return;
    }

    setActive(focusedTab);
  }, [active, focusedTab, hydrated, setActive]);

  useEffect(() => {
    if (mode === "loading") {
      return;
    }

    writeMemoryCache<SettingsCachePayload>(SETTINGS_CACHE_KEY, {
      mode,
      settings,
    });
  }, [mode, settings]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    let cancelled = false;

    async function loadSettings() {
      setLoadError("");

      try {
        const [settingsResponse, securityResponse] = await Promise.all([
          fetch("/api/settings", { cache: "no-store" }),
          fetch("/api/settings/security", { cache: "no-store" }),
        ]);
        const settingsPayload = await readJsonSafely<{
          settings?: SettingsBundle;
          error?: string;
          mode?: "remote" | "demo";
        }>(settingsResponse);
        const securityPayload = await readJsonSafely<{
          currentDevice?: SavedDevice;
        }>(securityResponse);
        if (!settingsResponse.ok || !settingsPayload?.settings) {
          throw new Error(settingsPayload?.error || "Settings sync is temporarily unavailable.");
        }

        if (cancelled) {
          return;
        }

        setSettings(settingsPayload.settings);
        setLocalWorkspace(settingsPayload.settings.workspace);
        setLocalNotifications(settingsPayload.settings.notifications);
        setLocalPlan(settingsPayload.settings.plan);
        setLocalDevices(settingsPayload.settings.devices);
        setLocalProjectTags(settingsPayload.settings.projectTags);
        setLocalProjectTypes(settingsPayload.settings.projectTypes);
        setCurrentDevice(securityResponse.ok ? (securityPayload?.currentDevice ?? null) : null);
        syncSettingsLocalBridges(settingsPayload.settings);
        writeAudioPreference(settingsPayload.settings.notifications.sound);
        setMode(settingsPayload.mode === "demo" ? "demo" : "remote");
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (!cachedSettings) {
          setSettings({
            workspace: localWorkspace,
            notifications: localNotifications,
            plan: localPlan,
            devices: localDevices,
          projectTags: localProjectTags,
          projectTypes: localProjectTypes,
        });
        setCurrentDevice(null);
        writeAudioPreference(localNotifications.sound);
        setMode("local");
        }

        setLoadError(error instanceof Error ? error.message : "Settings sync is temporarily unavailable.");
      }
    }

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated || mode === "loading") {
      return;
    }

    if (mode !== "remote") {
      setTrashItems([]);
      setTrashError("");
      setTrashLoading(false);
      return;
    }

    let cancelled = false;

    async function loadTrash() {
      setTrashLoading(true);
      setTrashError("");

      try {
        const response = await fetch("/api/settings/trash", { cache: "no-store" });
        const payload = await readJsonSafely<{
          items?: WorkspaceTrashItem[];
          error?: string;
        }>(response);

        if (!response.ok) {
          throw new Error(payload?.error || "Failed to load trash.");
        }

        if (!cancelled) {
          setTrashItems(payload?.items ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          setTrashError(error instanceof Error ? error.message : "Failed to load trash.");
        }
      } finally {
        if (!cancelled) {
          setTrashLoading(false);
        }
      }
    }

    void loadTrash();

    return () => {
      cancelled = true;
    };
  }, [hydrated, mode]);

  useEffect(() => {
    if (mode !== "local") {
      return;
    }

    setSettings({
      workspace: localWorkspace,
      notifications: localNotifications,
      plan: localPlan,
      devices: localDevices,
      projectTags: localProjectTags,
      projectTypes: localProjectTypes,
    });
  }, [localDevices, localNotifications, localPlan, localProjectTags, localProjectTypes, localWorkspace, mode]);

  function applySettingsBundle(nextSettings: SettingsBundle, nextMode: "remote" | "demo" = "remote") {
    setSettings(nextSettings);
    setLocalWorkspace(nextSettings.workspace);
    setLocalNotifications(nextSettings.notifications);
    setLocalPlan(nextSettings.plan);
    setLocalDevices(nextSettings.devices);
    setLocalProjectTags(nextSettings.projectTags);
    setLocalProjectTypes(nextSettings.projectTypes);
    syncSettingsLocalBridges(nextSettings);
    writeAudioPreference(nextSettings.notifications.sound);
    setMode(nextMode);
  }

  async function patchRemote(patch: Partial<SettingsBundle>) {
    const response = await fetch("/api/settings", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patch),
    });
    const payload = await readJsonSafely<{
      settings?: SettingsBundle;
      error?: string;
      mode?: "remote" | "demo";
    }>(response);

    if (!response.ok || !payload?.settings) {
      throw new Error(payload?.error || "Failed to save settings.");
    }

    applySettingsBundle(payload.settings, payload.mode === "demo" ? "demo" : "remote");
    return payload.settings;
  }

  async function startPaidPlanCheckout(planName: BillingPlanName) {
    if (!billing.razorpayEnabled) {
      throw new Error("Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET first.");
    }

    await loadRazorpayCheckoutScript();

    if (!window.Razorpay) {
      throw new Error("Razorpay checkout did not initialize.");
    }

    const orderResponse = await fetch("/api/settings/billing/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ planName }),
    });
    const orderPayload = await readJsonSafely<{
      checkout?: RazorpayCheckoutPayload;
      error?: string;
    }>(orderResponse);

    if (!orderResponse.ok || !orderPayload?.checkout) {
      throw new Error(orderPayload?.error || "Failed to create a billing order.");
    }

    const checkout = orderPayload.checkout;
    const RazorpayCtor = window.Razorpay;

    if (!RazorpayCtor) {
      throw new Error("Razorpay checkout did not initialize.");
    }

    return new Promise<SettingsBundle>((resolve, reject) => {
      let settled = false;

      function finish<T>(callback: () => T) {
        if (settled) {
          return;
        }

        settled = true;
        callback();
      }

      const razorpay = new RazorpayCtor({
        key: checkout.keyId,
        name: "Planix",
        description: `Activate ${checkout.plan.name}`,
        subscription_id: checkout.subscription.id,
        prefill: {
          email: checkout.prefill.email || undefined,
          name: checkout.prefill.name || undefined,
          contact: checkout.prefill.contact || undefined,
        },
        notes: {
          plan_name: checkout.plan.name,
        },
        theme: {
          color: "#fb8a74",
        },
        modal: {
          ondismiss: () => finish(() => reject(new Error("Razorpay checkout was cancelled."))),
        },
        handler: async (response) => {
          try {
            const verifyResponse = await fetch("/api/settings/billing/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                planName,
                ...response,
              }),
            });
            const verifyPayload = await readJsonSafely<{
              settings?: SettingsBundle;
              error?: string;
            }>(verifyResponse);

            if (!verifyResponse.ok || !verifyPayload?.settings) {
              throw new Error(verifyPayload?.error || "Payment verification failed.");
            }

            finish(() => resolve(verifyPayload.settings!));
          } catch (error) {
            finish(() => reject(error instanceof Error ? error : new Error("Payment verification failed.")));
          }
        },
      });

      razorpay.on?.("payment.failed", (payload) => {
        finish(() => reject(new Error(payload.error?.description || "Payment failed.")));
      });

      razorpay.open();
    });
  }

  async function saveWorkspace(next: WorkspaceFormState): Promise<SaveResult<WorkspaceFormState>> {
    try {
      if (mode === "remote" || mode === "demo") {
        const saved = await patchRemote({ workspace: next });
        setWorkspaceActivity((current) =>
          pushWorkspaceActivity(current, {
            name: "Settings",
            initials: "ST",
            tone: "sand",
            status: "online",
            action: "Updated workspace settings",
            detail: saved.workspace.name,
          }),
        );
        return {
          ok: true,
          value: saved.workspace,
          message: "Workspace settings saved.",
        };
      }

      setLocalWorkspace(next);
      syncSettingsLocalBridges({
        ...settings,
        workspace: next,
      });
      setWorkspaceActivity((current) =>
        pushWorkspaceActivity(current, {
          name: "Settings",
          initials: "ST",
          tone: "sand",
          status: "online",
          action: "Updated workspace settings",
          detail: next.name,
        }),
      );
      return { ok: true, value: next, message: "Workspace settings saved." };
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : "Failed to save workspace settings." };
    }
  }

  async function saveNotifications(next: NotificationPreferences): Promise<SaveResult<NotificationPreferences>> {
    try {
      writeAudioPreference(next.sound);

      if (mode === "remote" || mode === "demo") {
        const saved = await patchRemote({ notifications: next });
        setWorkspaceActivity((current) =>
          pushWorkspaceActivity(current, {
            name: "Settings",
            initials: "ST",
            tone: "peach",
            status: "online",
            action: "Updated notification preferences",
            detail: saved.notifications.sound ? "Sound enabled" : "Sound disabled",
          }),
        );
        return {
          ok: true,
          value: saved.notifications,
          message: "Notification settings saved.",
        };
      }

      setLocalNotifications(next);
      syncSettingsLocalBridges({
        ...settings,
        notifications: next,
      });
      setWorkspaceActivity((current) =>
        pushWorkspaceActivity(current, {
          name: "Settings",
          initials: "ST",
          tone: "peach",
          status: "online",
          action: "Updated notification preferences",
          detail: next.sound ? "Sound enabled" : "Sound disabled",
        }),
      );
      return { ok: true, value: next, message: "Notification settings saved." };
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : "Failed to save notification settings." };
    }
  }

  async function savePlan(next: PlanSettings): Promise<SaveResult<PlanSettings>> {
    try {
      const targetPlan = findBillingPlan(billing.plans, next.name);

      if (mode === "remote" && targetPlan?.isPaid) {
        const savedSettings = await startPaidPlanCheckout(targetPlan.name);
        applySettingsBundle(savedSettings, "remote");
        setWorkspaceActivity((current) =>
          pushWorkspaceActivity(current, {
            name: "Billing",
            initials: "BL",
            tone: "olive",
            status: "neutral",
            action: "Activated paid workspace plan",
            detail: savedSettings.plan.name,
          }),
        );
        return {
          ok: true,
          value: savedSettings.plan,
          message: `${savedSettings.plan.name} is now active. Invoice details were emailed to your billing address.`,
        };
      }

      const nextPlan = targetPlan?.name === "Starter Plan"
        ? {
            ...next,
            renewsOn: "",
          }
        : next;

      if (mode === "remote" || mode === "demo") {
        const saved = await patchRemote({ plan: nextPlan });
        setWorkspaceActivity((current) =>
          pushWorkspaceActivity(current, {
            name: "Billing",
            initials: "BL",
            tone: "olive",
            status: "neutral",
            action: "Updated workspace plan",
            detail: saved.plan.name,
          }),
        );
        return {
          ok: true,
          value: saved.plan,
          message: targetPlan?.name === "Starter Plan" ? "Starter Plan activated." : "Plan settings saved.",
        };
      }

      setLocalPlan(nextPlan);
      syncSettingsLocalBridges({
        ...settings,
        plan: nextPlan,
      });
      setWorkspaceActivity((current) =>
        pushWorkspaceActivity(current, {
          name: "Billing",
          initials: "BL",
          tone: "olive",
          status: "neutral",
          action: "Updated workspace plan",
          detail: nextPlan.name,
        }),
      );
      return { ok: true, value: nextPlan, message: "Plan settings saved." };
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : "Failed to save plan settings." };
    }
  }

  async function signOutOtherSessions(): Promise<SaveResult<null>> {
    if (mode !== "remote") {
      return { ok: false, message: "Session revocation requires a signed-in account session." };
    }

    try {
      const response = await fetch("/api/settings/security", {
        method: "POST",
      });
      const body = await readJsonSafely<{ ok?: boolean; error?: string }>(response);

      if (!response.ok) {
        throw new Error(body?.error || "Failed to sign out other sessions.");
      }

      if (localDevices.length > 0) {
        const nextDevices = localDevices.map((device) => ({
          ...device,
          active: false,
        }));

        try {
          const saved = await patchRemote({ devices: nextDevices });
          setLocalDevices(saved.devices);
          setSettings((current) => ({
            ...current,
            devices: saved.devices,
          }));
        } catch {
          setLocalDevices(nextDevices);
          setSettings((current) => ({
            ...current,
            devices: nextDevices,
          }));
        }
      }

      setWorkspaceActivity((current) =>
        pushWorkspaceActivity(current, {
          name: "Security",
          initials: "SC",
          tone: "slate",
          status: "neutral",
          action: "Signed out other sessions",
        }),
      );
      return { ok: true, message: "Other active sessions were signed out." };
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : "Failed to sign out other sessions." };
    }
  }

  async function saveProjectSettings(next: {
    projectTags: TagDefinition[];
    projectTypes: string[];
  }): Promise<SaveResult<{ projectTags: TagDefinition[]; projectTypes: string[] }>> {
    try {
      if (mode === "remote" || mode === "demo") {
        const saved = await patchRemote(next);
        setWorkspaceActivity((current) =>
          pushWorkspaceActivity(current, {
            name: "Projects",
            initials: "PJ",
            tone: "olive",
            status: "online",
            action: "Updated project defaults",
            detail: `${saved.projectTags.length} tags · ${saved.projectTypes.length} project types`,
          }),
        );
        return {
          ok: true,
          value: {
            projectTags: saved.projectTags,
            projectTypes: saved.projectTypes,
          },
          message: "Project defaults saved.",
        };
      }

      setLocalProjectTags(next.projectTags);
      setLocalProjectTypes(next.projectTypes);
      syncSettingsLocalBridges({
        ...settings,
        projectTags: next.projectTags,
        projectTypes: next.projectTypes,
      });
      setWorkspaceActivity((current) =>
        pushWorkspaceActivity(current, {
          name: "Projects",
          initials: "PJ",
          tone: "olive",
          status: "online",
          action: "Updated project defaults",
          detail: `${next.projectTags.length} tags · ${next.projectTypes.length} project types`,
        }),
      );
      return { ok: true, value: next, message: "Project defaults saved." };
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : "Failed to save project defaults." };
    }
  }

  async function changePassword(payload: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<SaveResult<null>> {
    if (mode !== "remote") {
      return { ok: false, message: "Password updates require a signed-in account session." };
    }

    try {
      const response = await fetch("/api/settings/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const body = await readJsonSafely<{ ok?: boolean; error?: string }>(response);

      if (!response.ok) {
        throw new Error(body?.error || "Failed to update password.");
      }

      setWorkspaceActivity((current) =>
        pushWorkspaceActivity(current, {
          name: "Security",
          initials: "SC",
          tone: "rose",
          status: "busy",
          action: "Changed workspace password",
        }),
      );
      return { ok: true, message: "Password updated successfully." };
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : "Failed to update password." };
    }
  }

  async function deleteAccount(): Promise<SaveResult<null>> {
    if (mode !== "remote") {
      return { ok: false, message: "Account deletion requires a signed-in account session." };
    }

    try {
      const response = await fetch("/api/settings/account", {
        method: "DELETE",
      });
      const body = await readJsonSafely<{ ok?: boolean; error?: string }>(response);

      if (!response.ok) {
        throw new Error(body?.error || "Failed to delete account.");
      }

      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch {
        // Ignore logout cleanup failures after the account has already been removed.
      }

      clearPlanixBrowserState();
      window.location.replace("/login");
      return { ok: true, message: "Account deleted." };
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : "Failed to delete account." };
    }
  }

  async function mutateTrash(
    action: "restore" | "permanently-delete",
    trashId: string,
  ) {
    if (mode !== "remote") {
      return;
    }

    try {
      setTrashActionId(trashId);
      setTrashError("");
      const response = await fetch("/api/settings/trash", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          action,
          trashId,
        }),
      });
      const payload = await readJsonSafely<{
        ok?: boolean;
        items?: WorkspaceTrashItem[];
        error?: string;
      }>(response);

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || "Trash update failed.");
      }

      setTrashItems(payload.items ?? []);
    } catch (error) {
      setTrashError(error instanceof Error ? error.message : "Trash update failed.");
    } finally {
      setTrashActionId(null);
    }
  }

  if (!hydrated || mode === "loading") {
    return (
      <main className="bg-dashboard min-h-screen text-[var(--text-primary)] lg:h-screen lg:overflow-hidden lg:p-0">
        <div className="flex w-full flex-col lg:h-full lg:flex-row">
          <PrimarySidebar />
          <div className="flex flex-1 overflow-hidden bg-[rgba(12,12,14,0.92)] lg:h-full lg:border-l lg:border-white/6">
            <AppLoader
              fullscreen={false}
              compact
              label="Loading settings"
              detail="Preparing your latest preferences"
              className="min-h-[calc(100vh-8rem)] w-full rounded-none border-0 lg:min-h-full"
            />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-dashboard min-h-screen text-[var(--text-primary)] lg:h-screen lg:overflow-hidden lg:p-0">
      <div className="flex w-full flex-col lg:h-full lg:flex-row">
        <PrimarySidebar />

        <div className="flex flex-1 overflow-hidden bg-[rgba(12,12,14,0.92)] lg:h-full lg:border-l lg:border-white/6">
          <div className="hidden w-[260px] shrink-0 flex-col border-r border-white/6 bg-[var(--sidebar)] lg:flex">
            <div className="flex shrink-0 items-center border-b border-white/6 px-6 py-6">
              <h1 className="type-page-title tracking-tight text-white">Settings</h1>
            </div>
            <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-5">
              {tabs.map(({ id, label, icon: Icon }) => {
                const isActive = active === id;
                const gradientId = `settings-tab-${id}`;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActive(id)}
                    className={cn(
                      "group relative flex w-full items-center gap-2.5 rounded-[11px] border px-2.5 py-2 text-sm outline-none transition-all duration-200",
                      isActive
                        ? "border-transparent bg-[rgba(25,18,15,0.94)] text-[var(--text-primary)] shadow-[0_8px_18px_rgba(251,138,116,0.08)]"
                        : "border-transparent text-[var(--text-muted)] hover:border-white/8 hover:bg-white/[0.04]",
                    )}
                  >
                    {isActive && (
                      <>
                        <span
                          className="pointer-events-none absolute inset-0 rounded-[11px]"
                          style={{
                            background:
                              "linear-gradient(140deg, rgba(255,214,176,0.72) 0%, rgba(255,181,128,0.5) 34%, rgba(251,138,116,0.28) 66%, rgba(251,138,116,0.1) 100%)",
                            WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                            WebkitMaskComposite: "xor",
                            padding: "1px",
                          }}
                        />
                        <span className="pointer-events-none absolute inset-[1px] rounded-[10px] bg-[linear-gradient(180deg,rgba(40,23,18,0.92)_0%,rgba(24,17,14,0.96)_100%)]" />
                        <svg aria-hidden="true" width="0" height="0" className="absolute">
                          <defs>
                            <linearGradient id={gradientId} x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                              <stop offset="0%" stopColor="#ffd7b2" />
                              <stop offset="40%" stopColor="#ffb987" />
                              <stop offset="100%" stopColor="#fb8a74" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </>
                    )}
                    <div
                      className={cn(
                        "relative z-10 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px] transition-all duration-200",
                        isActive ? "bg-[rgba(255,255,255,0.02)]" : "text-[var(--text-muted)]",
                      )}
                    >
                      <Icon
                        className={cn("h-4 w-4 transition-transform duration-200", isActive && "scale-[1.04]")}
                        strokeWidth={isActive ? 2.4 : 2}
                        style={
                          isActive
                            ? {
                                stroke: `url(#${gradientId})`,
                                filter: "drop-shadow(0 0 4px rgba(255, 185, 135, 0.16))",
                              }
                            : undefined
                        }
                      />
                    </div>
                    <span className="relative z-10 text-[13px] font-medium tracking-wide">{label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex flex-1 flex-col overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.015)_0%,rgba(255,255,255,0.005)_100%)]">
            <div className="border-b border-white/6 px-4 py-4 lg:hidden">
              <div className="flex flex-col gap-3">
                <div>
                  <h1 className="type-page-title tracking-tight text-white">Settings</h1>
                </div>
                <div className="relative">
                  <select
                    value={active}
                    onChange={(event) => setActive(event.target.value as typeof active)}
                    className="w-full appearance-none rounded-[var(--radius-xl)] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-[var(--text-primary)] outline-none"
                  >
                    {tabs.map((tab) => (
                      <option key={tab.id} value={tab.id} className="bg-[#1C1C1E] text-white">
                        {tab.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
              {loadError && mode === "local" && (
                <div className="mb-6 rounded-[var(--radius-lg)] border border-[var(--accent)]/20 bg-[var(--accent)]/8 px-4 py-3 text-[13px] text-[var(--accent)]">
                  Settings sync is temporarily unavailable. You can keep editing and save changes normally.
                </div>
              )}

              {active === "workspace" && <WorkspacePanel value={settings.workspace} onSave={saveWorkspace} />}
              {active === "password" && (
                <PasswordPanel
                  mode={mode}
                  currentDevice={currentDevice}
                  devices={settings.devices}
                  onSignOutOthers={signOutOtherSessions}
                  onChangePassword={changePassword}
                />
              )}
              {active === "plan" && <PlanPanel value={settings.plan} onSave={savePlan} mode={mode} billing={billing} />}
              {active === "notifications" && (
                <NotificationsPanel value={settings.notifications} onSave={saveNotifications} />
              )}
              {active === "projects" && (
                <ProjectsPanel
                  tags={settings.projectTags}
                  projectTypes={settings.projectTypes}
                  onSave={saveProjectSettings}
                />
              )}
              {active === "trash" && (
                <TrashPanel
                  mode={mode}
                  items={trashItems}
                  isLoading={trashLoading}
                  actionId={trashActionId}
                  errorMessage={trashError}
                  onRestore={(trashId) => {
                    void mutateTrash("restore", trashId);
                  }}
                  onPermanentDelete={(trashId) => {
                    void mutateTrash("permanently-delete", trashId);
                  }}
                />
              )}
              {active === "danger" && (
                <DangerPanel
                  mode={mode}
                  onDeleteAccount={deleteAccount}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

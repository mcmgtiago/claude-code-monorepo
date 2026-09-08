"use client";

import { AppSelect } from "@/components/app-select";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Bell,
  type LucideIcon,
  Eye,
  EyeOff,
  Globe2,
  ImageUp,
  LockKeyhole,
  Mail,
  MessageSquare,
  Trash2,
  X,
  User,
  Briefcase,
  Clock,
  DollarSign,
  Globe,
  CalendarDays,
  MenuSquare,
  MailOpen,
  MousePointerClick,
  Server
} from "lucide-react";
import { FeedbackToast } from "@/components/feedback-toast";
import { MeetingProviderLogo } from "@/components/meeting-provider-logo";
import { useConfirmAction } from "@/components/confirm-action-modal";
import { ToggleSwitch } from "@/components/toggle-switch";
import { WorkspaceSwitcherModal } from "@/components/workspace-switcher-modal";
import type { SettingsIntegrationItem } from "@/lib/settings-integrations";
import { Topbar } from "@/components/topbar";
import { getPasswordRequirementState, passwordRequirementLabels } from "@/lib/password-rules";
import { cn } from "@/lib/utils";

type SettingsView =
  | "profile"
  | "workspace"
  | "localization"
  | "email"
  | "mailbox"
  | "smtp"
  | "imap"
  | "conversations"
  | "notifications"
  | "integrations"
  | "trash";
type PasswordStep = 1 | 2;

type ProfileForm = {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  profileImageUrl: string;
  hasPassword: boolean;
  googleConnected: boolean;
  pendingEmail: string;
};

type WorkspaceProfile = {
  id: string;
  name: string;
  slug: string;
  website: string;
};

type LocalizationSettings = {
  countryCode: string;
  timezone: string;
  currencyCode: string;
  locale: string;
  dateFormat: string;
  timeFormat: string;
  weekStartsOn: string;
};

type EmailSettings = {
  appendOptOut: boolean;
  optOutMessage: string;
  oneClickUnsubscribe: boolean;
  openTracking: boolean;
  clickTracking: boolean;
};

type ConversationSettings = {
  privateConversations: boolean;
  revokeSharedRecordings: boolean;
};

type NotificationPreferences = {
  reminderInAppEnabled: boolean;
  reminderEmailEnabled: boolean;
};

type SmtpSettings = {
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  openTrackingEnabled: boolean;
  clickTrackingEnabled: boolean;
  configured: boolean;
  googleConnected?: boolean;
  googleEmail?: string;
  googleReady?: boolean;
  googleAuthAvailable?: boolean;
  personalConfigured?: boolean;
  workspaceConfigured?: boolean;
  platformConfigured?: boolean;
  configuredSource?: "google" | "personal" | "workspace" | "platform" | "none";
  mailboxCleared?: boolean;
  gmailDisconnected?: boolean;
};

type ImapSettings = {
  imapHost: string;
  imapPort: string;
  imapUser: string;
  imapPass: string;
  imapSecure: boolean;
  configured: boolean;
  googleConnected?: boolean;
  googleEmail?: string;
  googleReady?: boolean;
  googleAuthAvailable?: boolean;
  personalConfigured?: boolean;
  workspaceConfigured?: boolean;
  platformConfigured?: boolean;
  configuredSource?: "google" | "personal" | "workspace" | "platform" | "none";
  mailboxCleared?: boolean;
  gmailDisconnected?: boolean;
};

type TrashItem = {
  id: string;
  entityType: "LEAD" | "CONTACT" | "COMPANY" | "TASK" | "MEETING_EVENT" | "SCHEDULING_PAGE";
  entityId: string;
  title: string;
  description: string | null;
  deletedAt: string;
};

type IntegrationsResponse = {
  integrations: SettingsIntegrationItem[];
  feedback?: string;
  error?: string;
};

const storageKey = "nectra_settings_workspace_v1";

const inputWithIconClassName =
  "w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/20 hover:border-slate-300";

const inputIconWrapperClassName = "absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none h-4 w-4 z-10";
const settingsPanelSectionClassName = "space-y-5";
const settingsPanelSectionWithDividerClassName = "space-y-5 border-b border-slate-200 pb-6 last:border-b-0 last:pb-0";

const selectWithIconClassName = `${inputWithIconClassName} pr-10 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_10px_center]`;

const defaultProfileForm: ProfileForm = {
  firstName: "",
  lastName: "",
  title: "",
  email: "",
  profileImageUrl: "",
  hasPassword: false,
  googleConnected: false,
  pendingEmail: ""
};

const defaultWorkspaceProfile: WorkspaceProfile = {
  id: "",
  name: "",
  slug: "",
  website: ""
};

const defaultEmailSettings: EmailSettings = {
  appendOptOut: false,
  optOutMessage: "No longer interest with this messages? <%unsubscribe%>",
  oneClickUnsubscribe: false,
  openTracking: false,
  clickTracking: false
};

const defaultLocalizationSettings: LocalizationSettings = {
  countryCode: "IN",
  timezone: "Asia/Kolkata",
  currencyCode: "INR",
  locale: "en-IN",
  dateFormat: "DD MMM YYYY",
  timeFormat: "12h",
  weekStartsOn: "Monday"
};

const defaultConversationSettings: ConversationSettings = {
  privateConversations: false,
  revokeSharedRecordings: false
};

const defaultNotificationPreferences: NotificationPreferences = {
  reminderInAppEnabled: true,
  reminderEmailEnabled: true
};

const defaultSmtpSettings: SmtpSettings = {
  smtpHost: "",
  smtpPort: "587",
  smtpUser: "",
  smtpPass: "",
  smtpFrom: "",
  openTrackingEnabled: true,
  clickTrackingEnabled: true,
  configured: false,
  googleConnected: false,
  googleEmail: "",
  googleReady: false,
  googleAuthAvailable: false,
  personalConfigured: false,
  workspaceConfigured: false,
  platformConfigured: false,
  configuredSource: "none"
};

const defaultImapSettings: ImapSettings = {
  imapHost: "",
  imapPort: "993",
  imapUser: "",
  imapPass: "",
  imapSecure: true,
  configured: false,
  googleConnected: false,
  googleEmail: "",
  googleReady: false,
  googleAuthAvailable: false,
  personalConfigured: false,
  workspaceConfigured: false,
  platformConfigured: false,
  configuredSource: "none"
};

const countryOptions = [
  { code: "IN", label: "India" },
  { code: "US", label: "United States" },
  { code: "GB", label: "United Kingdom" },
  { code: "AE", label: "United Arab Emirates" },
  { code: "SG", label: "Singapore" },
  { code: "AU", label: "Australia" }
];

const timezoneOptions = [
  "Asia/Kolkata",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Asia/Dubai",
  "Asia/Singapore",
  "Australia/Sydney"
];

const currencyOptions = [
  { code: "INR", label: "Indian Rupee" },
  { code: "USD", label: "US Dollar" },
  { code: "GBP", label: "British Pound" },
  { code: "AED", label: "UAE Dirham" },
  { code: "SGD", label: "Singapore Dollar" },
  { code: "AUD", label: "Australian Dollar" }
];

const localeOptions = ["en-IN", "en-US", "en-GB", "ar-AE", "en-SG", "en-AU"];
const dateFormatOptions = ["DD MMM YYYY", "MMM DD, YYYY", "DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];
const timeFormatOptions = ["12h", "24h"];
const weekStartOptions = ["Monday", "Sunday", "Saturday"];

const settingsMenuItems: Array<{
  id: SettingsView;
  label: string;
  icon: LucideIcon;
}> = [
  { id: "profile", label: "Profile", icon: User },
  { id: "workspace", label: "Workspace", icon: Briefcase },
  { id: "localization", label: "Localization", icon: Globe2 },
  { id: "email", label: "Email Preferences", icon: Mail },
  { id: "mailbox", label: "Mailbox Setup", icon: Server },
  { id: "conversations", label: "Conversations", icon: MessageSquare },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "integrations", label: "Integrations", icon: MenuSquare },
  { id: "trash", label: "Trash Bin", icon: Trash2 }
];

const settingsViewMeta: Record<SettingsView, { title: string; description: string; eyebrow: string }> = {
  profile: {
    eyebrow: "Account",
    title: "Profile",
    description: ""
  },
  workspace: {
    eyebrow: "Company",
    title: "Workspace",
    description: ""
  },
  localization: {
    eyebrow: "Preferences",
    title: "Localization",
    description: ""
  },
  email: {
    eyebrow: "Messaging",
    title: "Email Preferences",
    description: ""
  },
  mailbox: {
    eyebrow: "Messaging",
    title: "Mailbox Setup",
    description: ""
  },
  smtp: {
    eyebrow: "Messaging",
    title: "SMTP Delivery",
    description: ""
  },
  imap: {
    eyebrow: "Messaging",
    title: "Inbox Sync",
    description: ""
  },
  conversations: {
    eyebrow: "Privacy",
    title: "Conversations",
    description: ""
  },
  notifications: {
    eyebrow: "Alerts",
    title: "Notifications",
    description: ""
  },
  integrations: {
    eyebrow: "Apps",
    title: "Integrations",
    description: ""
  },
  trash: {
    eyebrow: "Recovery",
    title: "Trash Bin",
    description: ""
  }
};

const trashEntityLabels: Record<TrashItem["entityType"], string> = {
  LEAD: "Lead",
  CONTACT: "Contact",
  COMPANY: "Company",
  TASK: "Task",
  MEETING_EVENT: "Meeting",
  SCHEDULING_PAGE: "Scheduling page"
};

function ToggleField({
  title,
  description,
  checked,
  onChange,
  children,
  cardClassName = "rounded-2xl border border-slate-200 bg-white p-4",
  descriptionClassName = "mt-2 max-w-[540px] text-sm leading-6 text-slate-500"
}: {
  title: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  children?: ReactNode;
  cardClassName?: string;
  descriptionClassName?: string;
}) {
  return (
    <div className={cardClassName}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="text-[1rem] font-medium text-slate-900">{title}</div>
          {description ? <p className={descriptionClassName}>{description}</p> : null}
          {children}
        </div>
        <div className="flex shrink-0 items-start sm:pt-0.5">
          <ToggleSwitch checked={checked} onChange={onChange} />
        </div>
      </div>
    </div>
  );
}

function getConnectionSourceLabel(source: "google" | "personal" | "workspace" | "platform" | "none" | undefined, kind: "smtp" | "imap") {
  if (source === "google") {
    return kind === "smtp"
      ? "Sending is currently using your connected Gmail account."
      : "Inbox sync is currently using your connected Gmail account.";
  }

  if (source === "personal") {
    return `Your personal ${kind.toUpperCase()} credentials are active for this workspace.`;
  }

  return `No personal ${kind.toUpperCase()} connection is active for this account yet.`;
}

function normalizeSettingsView(value: SettingsView | string | undefined | null): SettingsView {
  if (value === "smtp" || value === "imap" || value === "mailbox") {
    return "mailbox";
  }

  if (
    value === "profile" ||
    value === "workspace" ||
    value === "localization" ||
    value === "email" ||
    value === "conversations" ||
    value === "notifications" ||
    value === "integrations" ||
    value === "trash"
  ) {
    return value;
  }

  return "profile";
}

function PasswordModal({
  open,
  step,
  busy,
  hasPassword,
  googleConnected,
  currentPassword,
  newPassword,
  confirmPassword,
  onClose,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onContinue,
  onSave
}: {
  open: boolean;
  step: PasswordStep;
  busy: boolean;
  hasPassword: boolean;
  googleConnected: boolean;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  onClose: () => void;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onContinue: () => void;
  onSave: () => void;
}) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const requirementState = useMemo(() => getPasswordRequirementState(newPassword), [newPassword]);
  const requirements = useMemo(
    () => [
      { id: "length", label: passwordRequirementLabels.length, passed: requirementState.length },
      { id: "uppercase", label: passwordRequirementLabels.uppercase, passed: requirementState.uppercase },
      { id: "number", label: passwordRequirementLabels.number, passed: requirementState.number },
      { id: "special", label: passwordRequirementLabels.special, passed: requirementState.special }
    ],
    [requirementState]
  );

  const score = requirements.filter((item) => item.passed).length;
  const passwordStrengthLabel = score >= 4 ? "Great" : score >= 3 ? "Good" : score >= 2 ? "Fair" : "Weak";
  const canSave = score === 4 && confirmPassword.length > 0 && newPassword === confirmPassword;
  const isCreateFlow = !hasPassword;
  const modalTitle = isCreateFlow ? "Create password" : "Change password";
  const saveButtonLabel = busy ? (isCreateFlow ? "Creating..." : "Updating...") : isCreateFlow ? "Create password" : "Change password";

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.18)] px-4 py-8 backdrop-blur-[2px]">
      <div className="flex max-h-[calc(100vh-4rem)] w-full max-w-[560px] flex-col rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
          <h2 className="text-[1.1rem] font-semibold text-slate-900">
            {modalTitle} {!isCreateFlow ? <span className="font-normal text-slate-500">(Step {step})</span> : null}
          </h2>
          <button onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!isCreateFlow && step === 1 ? (
          <>
              <div className="space-y-4 overflow-y-auto px-5 py-5">
                <p className="text-sm leading-6 text-slate-500">Enter your current password to continue.</p>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Current password</label>
                  <div className="relative">
                    <LockKeyhole className={inputIconWrapperClassName} />
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      className={`${inputWithIconClassName} pr-12`}
                      value={currentPassword}
                      onChange={(event) => onCurrentPasswordChange(event.target.value)}
                    />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-3.5">
              <button onClick={onClose} className="crm-btn crm-btn-secondary">
                Cancel
              </button>
              <button
                onClick={onContinue}
                disabled={!currentPassword.trim()}
                className="rounded-xl bg-[#386df4] px-4 py-2 text-sm font-medium text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4 overflow-y-auto px-5 py-5">
              <p className="text-sm leading-6 text-slate-500">
                {isCreateFlow
                  ? googleConnected
                    ? "You signed in with Google. Create a password to also enable email and password login for this same account."
                    : "Create a password for this account."
                  : "Enter your new password. Your new password must be different from your current password."}
              </p>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">New password</label>
                <div className="relative">
                  <LockKeyhole className={inputIconWrapperClassName} />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    className={`${inputWithIconClassName} pr-12`}
                    value={newPassword}
                    onChange={(event) => onNewPasswordChange(event.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <div className="mt-4 flex items-center gap-1.5">
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className={cn(
                        "h-1.5 flex-1 rounded-full",
                        index < score ? "bg-[#5c74ff]" : "bg-slate-200"
                      )}
                    />
                  ))}
                  <span className="ml-2 text-sm font-medium text-[#386df4]">{passwordStrengthLabel}</span>
                </div>

                <div className="grid gap-2 pt-2 text-sm text-slate-500 sm:grid-cols-2">
                  {requirements.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <span
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold",
                          item.passed ? "bg-[#386df4] text-white" : "bg-slate-200 text-slate-500"
                        )}
                      >
                        •
                      </span>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Confirm new password</label>
                <div className="relative">
                  <LockKeyhole className={inputIconWrapperClassName} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className={`${inputWithIconClassName} pr-12`}
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(event) => onConfirmPasswordChange(event.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-3.5">
              <button onClick={onClose} className="crm-btn crm-btn-secondary">
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={busy || !canSave}
                className="rounded-xl bg-[#386df4] px-4 py-2 text-sm font-medium text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saveButtonLabel}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DeleteAccountModal({
  open,
  busy,
  confirmText,
  onClose,
  onConfirmTextChange,
  onDelete
}: {
  open: boolean;
  busy: boolean;
  confirmText: string;
  onClose: () => void;
  onConfirmTextChange: (value: string) => void;
  onDelete: () => void;
}) {
  if (!open) {
    return null;
  }

  const canDelete = confirmText.trim() === "DELETE" && !busy;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.18)] px-4 py-8 backdrop-blur-[2px]">
      <div className="flex w-full max-w-[560px] flex-col rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-[1.1rem] font-semibold text-slate-900">Delete account</h2>
              <p className="text-sm text-slate-500">This action cannot be undone.</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="rounded-2xl border border-rose-100 bg-rose-50/70 px-4 py-4 text-sm leading-6 text-rose-700">
            Your profile, session access, notifications, invites, and connected account data will be permanently removed.
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Type DELETE to confirm</label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15"
              placeholder="DELETE"
              value={confirmText}
              onChange={(event) => onConfirmTextChange(event.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-3.5">
          <button onClick={onClose} className="crm-btn crm-btn-secondary">
            Cancel
          </button>
          <button
            onClick={onDelete}
            disabled={!canDelete}
            className="crm-btn rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
            {busy ? "Deleting..." : "Delete account"}
          </button>
        </div>
      </div>
    </div>
  );
}

function IntegrationRow({
  integration,
  onAction,
  busy = false
}: {
  integration: SettingsIntegrationItem;
  onAction?: (integration: SettingsIntegrationItem) => void;
  busy?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.03)]">
      <div className="flex items-start gap-4">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold", integration.tone)}>
          {integration.providerLogo ? <MeetingProviderLogo provider={integration.providerLogo} iconClassName="h-5 w-5" /> : integration.badge}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-[1.02rem] font-semibold text-slate-900">{integration.name}</div>
            {integration.statusLabel ? (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]",
                  integration.availability === "connected"
                    ? "bg-[#eefbf5] text-[#1fa261]"
                    : integration.availability === "coming_soon"
                      ? "bg-slate-100 text-slate-500"
                      : "bg-[#eef4ff] text-[#386df4]"
                )}
              >
                {integration.statusLabel}
              </span>
            ) : null}
          </div>
          <div className="mt-1 max-w-[820px] text-sm leading-6 text-slate-500">{integration.description}</div>
          {integration.detail ? <div className="mt-2 text-xs font-medium text-slate-400">{integration.detail}</div> : null}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onAction?.(integration)}
        disabled={!onAction || integration.disabled || busy}
        className={cn(
          "rounded-xl border px-4 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60",
          integration.actionVariant === "primary"
            ? "border-[#386df4] bg-[#386df4] text-white hover:bg-[#2d5de0]"
            : integration.actionVariant === "secondary"
              ? "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
              : "border-slate-200 bg-slate-50 text-slate-400"
        )}
      >
        {busy ? "Working..." : integration.actionLabel}
      </button>
    </div>
  );
}

type WorkspaceSmtpSettings = {
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  configured: boolean;
};

const defaultWorkspaceSmtpSettings: WorkspaceSmtpSettings = {
  smtpHost: "",
  smtpPort: "587",
  smtpUser: "",
  smtpPass: "",
  smtpFrom: "",
  configured: false
};

export function SettingsWorkspace({
  accessRole,
  isWorkspaceOwner = false,
  initialFeedback = null,
  initialView,
  initialProfile
}: {
  accessRole?: string;
  isWorkspaceOwner?: boolean;
  initialFeedback?: string | null;
  initialView?: SettingsView;
  initialProfile?: Partial<ProfileForm>;
}) {
  const router = useRouter();
  const { confirm: requestConfirmation, confirmationDialog } = useConfirmAction();
  const [activeView, setActiveView] = useState<SettingsView>(normalizeSettingsView(initialView));
  const [profileForm, setProfileForm] = useState<ProfileForm>(() => ({
    ...defaultProfileForm,
    ...(initialProfile || {}),
    hasPassword: Boolean(initialProfile?.hasPassword),
    googleConnected: Boolean(initialProfile?.googleConnected),
    pendingEmail: initialProfile?.pendingEmail || ""
  }));
  const [profileLoaded, setProfileLoaded] = useState(Boolean(initialProfile));
  const [workspaceProfile, setWorkspaceProfile] = useState(defaultWorkspaceProfile);
  const [localizationSettings, setLocalizationSettings] = useState(defaultLocalizationSettings);
  const [emailSettings, setEmailSettings] = useState(defaultEmailSettings);
  const [conversationSettings, setConversationSettings] = useState(defaultConversationSettings);
  const [notificationPreferences, setNotificationPreferences] = useState(defaultNotificationPreferences);
  const [integrations, setIntegrations] = useState<SettingsIntegrationItem[]>([]);
  const [smtpSettings, setSmtpSettings] = useState(defaultSmtpSettings);
  const [imapSettings, setImapSettings] = useState(defaultImapSettings);
  const [workspaceSmtp, setWorkspaceSmtp] = useState<WorkspaceSmtpSettings>(defaultWorkspaceSmtpSettings);
  const [workspaceSmtpBusy, setWorkspaceSmtpBusy] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);
  const [passwordStep, setPasswordStep] = useState<PasswordStep>(1);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleteAccountConfirmText, setDeleteAccountConfirmText] = useState("");
  const [feedback, setFeedback] = useState<string | null>(initialFeedback);
  const [accountBusy, setAccountBusy] = useState(false);
  const [deleteAccountBusy, setDeleteAccountBusy] = useState(false);
  const [profileImageBusy, setProfileImageBusy] = useState(false);
  const [workspaceProfileBusy, setWorkspaceProfileBusy] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [smtpBusy, setSmtpBusy] = useState(false);
  const [imapBusy, setImapBusy] = useState(false);
  const [localizationBusy, setLocalizationBusy] = useState(false);
  const [notificationPreferencesBusy, setNotificationPreferencesBusy] = useState(false);
  const [trashEntries, setTrashEntries] = useState<TrashItem[]>([]);
  const [trashBusy, setTrashBusy] = useState(false);
  const [trashActionId, setTrashActionId] = useState<string | null>(null);
  const [trashBulkDeleteBusy, setTrashBulkDeleteBusy] = useState(false);
  const [integrationsBusy, setIntegrationsBusy] = useState(false);
  const [integrationActionId, setIntegrationActionId] = useState<string | null>(null);
  const [slackSetupOpen, setSlackSetupOpen] = useState(false);
  const [slackWebhookUrl, setSlackWebhookUrl] = useState("");
  const [workspaceSwitcherOpen, setWorkspaceSwitcherOpen] = useState(false);

  useEffect(() => {
    if (initialView) {
      setActiveView(normalizeSettingsView(initialView));
    }
  }, [initialView]);

  useEffect(() => {
    if (initialFeedback) {
      setFeedback(initialFeedback);
    }
  }, [initialFeedback]);

  const loadTrashEntries = async () => {
    setTrashBusy(true);

    try {
      const response = await fetch("/api/settings/trash");
      const payload = (await response.json().catch(() => null)) as TrashItem[] | { error?: string } | null;

      if (!response.ok) {
        throw new Error((payload as { error?: string } | null)?.error || "Unable to load trash");
      }

      setTrashEntries(Array.isArray(payload) ? payload : []);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to load trash.");
    } finally {
      setTrashBusy(false);
    }
  };

  const loadIntegrations = async ({ showBusy = true }: { showBusy?: boolean } = {}) => {
    if (showBusy) {
      setIntegrationsBusy(true);
    }

    try {
      const response = await fetch("/api/settings/integrations");
      const payload = (await response.json().catch(() => null)) as IntegrationsResponse | null;

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to load integrations");
      }

      setIntegrations(payload?.integrations || []);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to load integrations.");
      setIntegrations([]);
    } finally {
      if (showBusy) {
        setIntegrationsBusy(false);
      }
    }
  };

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/settings/profile", { cache: "no-store" });
        const payload = (await response.json().catch(() => null)) as Partial<ProfileForm> | { error?: string } | null;
        if (!response.ok) {
          throw new Error((payload as { error?: string } | null)?.error || "Unable to load account info");
        }

        setProfileForm({
          ...defaultProfileForm,
          ...(payload || {}),
          hasPassword: Boolean((payload as Partial<ProfileForm> | null)?.hasPassword),
          googleConnected: Boolean((payload as Partial<ProfileForm> | null)?.googleConnected),
          pendingEmail: (payload as Partial<ProfileForm> | null)?.pendingEmail || ""
        });
      } catch {
        // Keep any server-provided profile state instead of falling back to "Create password".
      } finally {
        setProfileLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/settings/workspace");
        const payload = (await response.json().catch(() => null)) as WorkspaceProfile | { error?: string } | null;
        if (!response.ok) {
          throw new Error((payload as { error?: string } | null)?.error || "Unable to load workspace settings");
        }

        setWorkspaceProfile(payload as WorkspaceProfile);
      } catch {
        setWorkspaceProfile(defaultWorkspaceProfile);
      }
    })();
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/settings/localization");
        const payload = (await response.json().catch(() => null)) as LocalizationSettings | { error?: string } | null;
        if (!response.ok) {
          throw new Error((payload as { error?: string } | null)?.error || "Unable to load localization settings");
        }

        setLocalizationSettings(payload as LocalizationSettings);
      } catch {
        setLocalizationSettings(defaultLocalizationSettings);
      }
    })();
  }, []);

  useEffect(() => {
    void loadTrashEntries();
  }, []);

  useEffect(() => {
    void loadIntegrations();
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/settings/email");
        const payload = (await response.json().catch(() => null)) as SmtpSettings | { error?: string } | null;
        if (!response.ok) {
          throw new Error((payload as { error?: string } | null)?.error || "Unable to load SMTP settings");
        }

        setSmtpSettings(payload as SmtpSettings);
        setEmailSettings((state) => ({
          ...state,
          openTracking: (payload as SmtpSettings).openTrackingEnabled,
          clickTracking: (payload as SmtpSettings).clickTrackingEnabled
        }));
      } catch {
        setSmtpSettings(defaultSmtpSettings);
      }
    })();
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/settings/imap");
        const payload = (await response.json().catch(() => null)) as ImapSettings | { error?: string } | null;
        if (!response.ok) {
          throw new Error((payload as { error?: string } | null)?.error || "Unable to load IMAP settings");
        }

        setImapSettings(payload as ImapSettings);
      } catch {
        setImapSettings(defaultImapSettings);
      }
    })();
  }, []);

  useEffect(() => {
    if (!(accessRole === "SUPERUSER" || accessRole === "ADMIN" || accessRole === "MANAGER")) return;
    void (async () => {
      try {
        const response = await fetch("/api/settings/workspace-smtp");
        const payload = (await response.json().catch(() => null)) as WorkspaceSmtpSettings | { error?: string } | null;
        if (!response.ok) return;
        setWorkspaceSmtp(payload as WorkspaceSmtpSettings);
      } catch {
        // silently ignore — workspace SMTP is optional
      }
    })();
  }, [accessRole]);

  const saveWorkspaceSmtp = async () => {
    setWorkspaceSmtpBusy(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/settings/workspace-smtp", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(workspaceSmtp)
      });
      const payload = (await response.json().catch(() => null)) as WorkspaceSmtpSettings | { error?: string } | null;
      if (!response.ok) throw new Error((payload as { error?: string } | null)?.error || "Unable to save workspace SMTP");
      setWorkspaceSmtp(payload as WorkspaceSmtpSettings);
      setFeedback("Workspace mail defaults saved.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to save workspace SMTP settings.");
    } finally {
      setWorkspaceSmtpBusy(false);
    }
  };

  const clearWorkspaceSmtp = async () => {
    setWorkspaceSmtpBusy(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/settings/workspace-smtp", { method: "DELETE" });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || "Unable to clear workspace SMTP");
      }
      setWorkspaceSmtp(defaultWorkspaceSmtpSettings);
      setFeedback("Workspace mail defaults cleared.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to clear workspace SMTP settings.");
    } finally {
      setWorkspaceSmtpBusy(false);
    }
  };

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/settings/notifications");
        const payload = (await response.json().catch(() => null)) as NotificationPreferences | { error?: string } | null;
        if (!response.ok) {
          throw new Error((payload as { error?: string } | null)?.error || "Unable to load notification settings");
        }

        setNotificationPreferences(payload as NotificationPreferences);
      } catch {
        setNotificationPreferences(defaultNotificationPreferences);
      }
    })();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedState = window.localStorage.getItem(storageKey);
    if (!storedState) {
      return;
    }

    try {
      const parsed = JSON.parse(storedState) as {
        tab?: SettingsView;
        activeView?: SettingsView;
        emailSettings?: EmailSettings;
        conversationSettings?: ConversationSettings;
        notificationPreferences?: NotificationPreferences;
      };

      const storedView = initialView ? undefined : parsed.activeView || parsed.tab;
      if (storedView) {
        setActiveView(normalizeSettingsView(storedView));
      }
      if (parsed.emailSettings) {
        setEmailSettings(parsed.emailSettings);
      }
      if (parsed.conversationSettings) {
        setConversationSettings(parsed.conversationSettings);
      }
      if (parsed.notificationPreferences) {
        setNotificationPreferences(parsed.notificationPreferences);
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [initialView]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        activeView,
        emailSettings,
        conversationSettings,
        notificationPreferences
      })
    );
  }, [activeView, conversationSettings, emailSettings, notificationPreferences]);

  const connectedIntegrations = integrations.filter((item) => item.availability === "connected");
  const availableIntegrations = integrations.filter((item) => item.availability === "available");
  const comingSoonIntegrations = integrations.filter((item) => item.availability === "coming_soon");
  const enabledReminderChannelCount = Number(notificationPreferences.reminderInAppEnabled) + Number(notificationPreferences.reminderEmailEnabled);
  const currentViewMeta = settingsViewMeta[activeView];
  const canManageWorkspace = accessRole === "SUPERUSER" || accessRole === "ADMIN" || accessRole === "MANAGER";
  const canEditWorkspaceProfile = isWorkspaceOwner;
  const passwordButtonLabel = !profileLoaded ? "Password" : profileForm.hasPassword ? "Change password" : "Create password";

  const submitIntegrationAction = (integrationId: "google-meet" | "slack", action: "connect" | "disconnect", webhookUrl?: string) => {
    void (async () => {
      setIntegrationActionId(integrationId);
      setFeedback(null);

      try {
        const response = await fetch("/api/settings/integrations", {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            integrationId,
            action,
            webhookUrl
          })
        });
        const payload = (await response.json().catch(() => null)) as IntegrationsResponse | null;

        if (!response.ok) {
          throw new Error(payload?.error || "Unable to update integration");
        }

        setIntegrations(payload?.integrations || []);
        setFeedback(payload?.feedback || null);

        if (integrationId === "slack" && action === "connect") {
          setSlackWebhookUrl("");
          setSlackSetupOpen(false);
        }
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to update integration.");
      } finally {
        setIntegrationActionId(null);
      }
    })();
  };

  const handleIntegrationAction = (integration: SettingsIntegrationItem) => {
    if (integration.disabled) {
      return;
    }

    if (integration.id === "google-meet") {
      if (integration.connected) {
        submitIntegrationAction("google-meet", "disconnect");
        return;
      }

      window.location.href = "/api/meetings/google/connect?returnTo=/settings?view=integrations";
      return;
    }

    if (integration.id === "slack") {
      if (integration.connected) {
        submitIntegrationAction("slack", "disconnect");
        return;
      }

      setSlackSetupOpen(true);
    }
  };

  const uploadProfileImage = (file: File) => {
    void (async () => {
      setProfileImageBusy(true);
      setFeedback(null);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/settings/profile/photo", {
          method: "POST",
          body: formData
        });
        const payload = (await response.json().catch(() => null)) as { profileImageUrl?: string; error?: string } | null;

        if (!response.ok) {
          throw new Error(payload?.error || "Unable to upload profile picture");
        }

        setProfileForm((state) => ({ ...state, profileImageUrl: payload?.profileImageUrl || "" }));
        setFeedback("Profile picture updated.");
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to upload profile picture.");
      } finally {
        setProfileImageBusy(false);
      }
    })();
  };

  const removeProfileImage = () => {
    void (async () => {
      const confirmed = await requestConfirmation({
        title: "Remove profile picture?",
        description: "Your current profile picture will be removed from the workspace.",
        confirmLabel: "Remove picture",
        tone: "warning"
      });
      if (!confirmed) {
        return;
      }

      setProfileImageBusy(true);
      setFeedback(null);

      try {
        const response = await fetch("/api/settings/profile/photo", {
          method: "DELETE"
        });
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;

        if (!response.ok) {
          throw new Error(payload?.error || "Unable to remove profile picture");
        }

        setProfileForm((state) => ({ ...state, profileImageUrl: "" }));
        setFeedback("Profile picture removed.");
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to remove profile picture.");
      } finally {
        setProfileImageBusy(false);
      }
    })();
  };

  const closePasswordModal = () => {
    setPasswordModalOpen(false);
    setPasswordStep(1);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const closeDeleteAccountModal = (force = false) => {
    if (deleteAccountBusy && !force) {
      return;
    }

    setDeleteAccountModalOpen(false);
    setDeleteAccountConfirmText("");
  };

  const saveSmtpSettings = () => {
    void (async () => {
      setSmtpBusy(true);
      setFeedback(null);

      try {
        const response = await fetch("/api/settings/email", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            smtpHost: smtpSettings.smtpHost,
            smtpPort: smtpSettings.smtpPort,
            smtpUser: smtpSettings.smtpUser,
            smtpPass: smtpSettings.smtpPass,
            smtpFrom: smtpSettings.smtpFrom,
            openTrackingEnabled: emailSettings.openTracking,
            clickTrackingEnabled: emailSettings.clickTracking
          })
        });
        const payload = (await response.json().catch(() => null)) as SmtpSettings | { error?: string } | null;

        if (!response.ok) {
          throw new Error((payload as { error?: string } | null)?.error || "Unable to save SMTP settings");
        }

        setSmtpSettings(payload as SmtpSettings);
        setEmailSettings((state) => ({
          ...state,
          openTracking: (payload as SmtpSettings).openTrackingEnabled,
          clickTracking: (payload as SmtpSettings).clickTrackingEnabled
        }));
        setFeedback("SMTP settings saved.");
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to save SMTP settings.");
      } finally {
        setSmtpBusy(false);
      }
    })();
  };

  const saveImapSettings = () => {
    void (async () => {
      setImapBusy(true);
      setFeedback(null);

      try {
        const response = await fetch("/api/settings/imap", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            imapHost: imapSettings.imapHost,
            imapPort: imapSettings.imapPort,
            imapUser: imapSettings.imapUser,
            imapPass: imapSettings.imapPass,
            imapSecure: imapSettings.imapSecure
          })
        });
        const payload = (await response.json().catch(() => null)) as ImapSettings | { error?: string } | null;

        if (!response.ok) {
          throw new Error((payload as { error?: string } | null)?.error || "Unable to save IMAP settings");
        }

        setImapSettings(payload as ImapSettings);

        const syncResponse = await fetch("/api/email/sync", {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json"
          }
        });
        const syncPayload = (await syncResponse.json().catch(() => null)) as { error?: string; synced?: number; repaired?: number } | null;

        if (!syncResponse.ok) {
          setFeedback(`IMAP settings saved, but inbox sync failed: ${syncPayload?.error || "Unable to sync inbox"}`);
          return;
        }

        const syncedCount = syncPayload?.synced ?? 0;
        const repairedCount = syncPayload?.repaired ?? 0;

        if (syncedCount > 0 || repairedCount > 0) {
          setFeedback(
            repairedCount > 0
              ? `IMAP settings saved. Inbox sync added ${syncedCount} new messages and repaired ${repairedCount} existing messages.`
              : `IMAP settings saved. Inbox sync added ${syncedCount} new messages.`
          );
          return;
        }

        setFeedback("IMAP settings saved. Inbox sync ran, but no recent messages were imported.");
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to save IMAP settings.");
      } finally {
        setImapBusy(false);
      }
    })();
  };

  const disconnectGoogleMail = () => {
    void (async () => {
      const confirmed = await requestConfirmation({
        title: "Disconnect Gmail?",
        description: "Gmail sending and inbox sync will stop for this account. Stored mailbox emails will also be cleared.",
        confirmLabel: "Disconnect Gmail",
        tone: "warning"
      });

      if (!confirmed) {
        return;
      }

      setSmtpBusy(true);
      setImapBusy(true);
      setFeedback(null);

      try {
        const response = await fetch("/api/email/google/disconnect", {
          method: "POST"
        });
        const payload = (await response.json().catch(() => null)) as { error?: string; mailboxCleared?: boolean; calendarStillConnected?: boolean } | null;

        if (!response.ok) {
          throw new Error(payload?.error || "Unable to disconnect Gmail");
        }

        const [smtpResponse, imapResponse] = await Promise.all([fetch("/api/settings/email"), fetch("/api/settings/imap")]);
        const smtpPayload = (await smtpResponse.json().catch(() => null)) as SmtpSettings | { error?: string } | null;
        const imapPayload = (await imapResponse.json().catch(() => null)) as ImapSettings | { error?: string } | null;

        if (!smtpResponse.ok) {
          throw new Error((smtpPayload as { error?: string } | null)?.error || "Unable to reload SMTP settings");
        }

        if (!imapResponse.ok) {
          throw new Error((imapPayload as { error?: string } | null)?.error || "Unable to reload IMAP settings");
        }

        setSmtpSettings(smtpPayload as SmtpSettings);
        setImapSettings(imapPayload as ImapSettings);
        setEmailSettings((state) => ({
          ...state,
          openTracking: (smtpPayload as SmtpSettings).openTrackingEnabled,
          clickTracking: (smtpPayload as SmtpSettings).clickTrackingEnabled
        }));
        setFeedback(
          payload?.calendarStillConnected
            ? "Gmail disconnected and mailbox data cleared. Google Calendar stays connected."
            : "Gmail disconnected and mailbox data cleared."
        );
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to disconnect Gmail.");
      } finally {
        setSmtpBusy(false);
        setImapBusy(false);
      }
    })();
  };

  const saveLocalizationSettings = () => {
    void (async () => {
      setLocalizationBusy(true);
      setFeedback(null);

      try {
        const response = await fetch("/api/settings/localization", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(localizationSettings)
        });
        const payload = (await response.json().catch(() => null)) as LocalizationSettings | { error?: string } | null;

        if (!response.ok) {
          throw new Error((payload as { error?: string } | null)?.error || "Unable to save localization settings");
        }

        setLocalizationSettings(payload as LocalizationSettings);
        setFeedback("Localization settings saved.");
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to save localization settings.");
      } finally {
        setLocalizationBusy(false);
      }
    })();
  };

  const saveNotificationPreferences = () => {
    void (async () => {
      setNotificationPreferencesBusy(true);
      setFeedback(null);

      try {
        const response = await fetch("/api/settings/notifications", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(notificationPreferences)
        });
        const payload = (await response.json().catch(() => null)) as NotificationPreferences | { error?: string } | null;

        if (!response.ok) {
          throw new Error((payload as { error?: string } | null)?.error || "Unable to save notification settings");
        }

        setNotificationPreferences(payload as NotificationPreferences);
        setFeedback("Notification settings saved.");
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to save notification settings.");
      } finally {
        setNotificationPreferencesBusy(false);
      }
    })();
  };

  const saveWorkspaceProfile = () => {
    void (async () => {
      setWorkspaceProfileBusy(true);
      setFeedback(null);

      try {
        const response = await fetch("/api/settings/workspace", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(workspaceProfile)
        });
        const payload = (await response.json().catch(() => null)) as WorkspaceProfile | { error?: string } | null;

        if (!response.ok) {
          throw new Error((payload as { error?: string } | null)?.error || "Unable to save workspace settings");
        }

        setWorkspaceProfile(payload as WorkspaceProfile);
        setFeedback("Workspace settings saved.");
        router.refresh();
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to save workspace settings.");
      } finally {
        setWorkspaceProfileBusy(false);
      }
    })();
  };

  const saveAccountInfo = () => {
    void (async () => {
      setAccountBusy(true);
      setFeedback(null);

      try {
        const response = await fetch("/api/settings/profile", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(profileForm)
        });
        const payload = (await response.json().catch(() => null)) as (ProfileForm & { emailChangeRequested?: boolean; previewUrl?: string; code?: string; error?: string }) | null;

        if (!response.ok) {
          throw new Error((payload as { error?: string } | null)?.error || "Unable to save account info");
        }

        setProfileForm(payload as ProfileForm);
        if (payload?.emailChangeRequested) {
          setFeedback(payload.previewUrl ? `Verification link ready: ${payload.previewUrl}` : "Check your new inbox to verify the email change.");
        } else {
          setFeedback("Account info updated.");
        }
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to save account info.");
      } finally {
        setAccountBusy(false);
      }
    })();
  };

  const savePassword = () => {
    void (async () => {
      setPasswordBusy(true);
      setFeedback(null);

      try {
        const response = await fetch("/api/settings/password", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword
          })
        });
        const payload = (await response.json().catch(() => null)) as { error?: string; code?: string; passwordCreated?: boolean } | null;

        if (!response.ok) {
          throw new Error(payload?.error || "Unable to update password");
        }

        setProfileForm((state) => ({ ...state, hasPassword: true }));
        setFeedback(
          (payload as { passwordCreated?: boolean } | null)?.passwordCreated
            ? profileForm.googleConnected
              ? "Password created. This account can now sign in with Google or with email and password."
              : "Password created."
            : "Password updated."
        );
        closePasswordModal();
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to update password.");
      } finally {
        setPasswordBusy(false);
      }
    })();
  };

  const deleteAccount = () => {
    void (async () => {
      setDeleteAccountBusy(true);
      setFeedback(null);

      try {
        const response = await fetch("/api/settings/profile", {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ confirmText: deleteAccountConfirmText.trim() })
        });
        const payload = (await response.json().catch(() => null)) as { error?: string; redirectTo?: string } | null;

        if (!response.ok) {
          throw new Error(payload?.error || "Unable to delete account");
        }

        closeDeleteAccountModal(true);
        router.push(((payload?.redirectTo as Route | undefined) || "/login") as Route);
        router.refresh();
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to delete account.");
      } finally {
        setDeleteAccountBusy(false);
      }
    })();
  };

  const restoreTrashItem = (item: TrashItem) => {
    void (async () => {
      setTrashActionId(item.id);
      setFeedback(null);

      try {
        const response = await fetch(`/api/settings/trash/${item.id}/restore`, {
          method: "POST"
        });
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;

        if (!response.ok) {
          throw new Error(payload?.error || "Unable to restore item");
        }

        setTrashEntries((current) => current.filter((entry) => entry.id !== item.id));
        setFeedback(`${item.title} restored.`);
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to restore item.");
      } finally {
        setTrashActionId(null);
      }
    })();
  };

  const permanentlyDeleteTrashItem = (item: TrashItem) => {
    void (async () => {
      const confirmed = await requestConfirmation({
        title: "Delete from trash permanently?",
        description: `${item.title} will be removed from the trash bin and can no longer be restored.`,
        confirmLabel: "Delete permanently",
        tone: "warning"
      });

      if (!confirmed) {
        return;
      }

      setTrashActionId(item.id);
      setFeedback(null);

      try {
        const response = await fetch(`/api/settings/trash/${item.id}`, {
          method: "DELETE"
        });
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;

        if (!response.ok) {
          throw new Error(payload?.error || "Unable to delete trash item");
        }

        setTrashEntries((current) => current.filter((entry) => entry.id !== item.id));
        setFeedback(`${item.title} removed from trash.`);
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to delete trash item.");
      } finally {
        setTrashActionId(null);
      }
    })();
  };

  const permanentlyDeleteAllTrashItems = () => {
    void (async () => {
      const itemCount = trashEntries.length;

      if (!itemCount) {
        return;
      }

      const confirmed = await requestConfirmation({
        title: "Delete all trash permanently?",
        description: `${itemCount} trash item${itemCount === 1 ? "" : "s"} will be removed permanently and cannot be restored.`,
        confirmLabel: "Delete all permanently",
        tone: "warning"
      });

      if (!confirmed) {
        return;
      }

      setTrashBulkDeleteBusy(true);
      setFeedback(null);

      try {
        const response = await fetch("/api/settings/trash", {
          method: "DELETE"
        });
        const payload = (await response.json().catch(() => null)) as { error?: string; count?: number } | null;

        if (!response.ok) {
          throw new Error(payload?.error || "Unable to delete trash items");
        }

        const deletedCount = payload?.count ?? itemCount;
        setTrashEntries([]);
        setFeedback(`Removed ${deletedCount} trash item${deletedCount === 1 ? "" : "s"} permanently.`);
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to delete trash items.");
      } finally {
        setTrashBulkDeleteBusy(false);
      }
    })();
  };

  const renderWorkspaceSmtpSection = () => (
    <section className={settingsPanelSectionClassName}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[1.08rem] font-semibold text-slate-900">Workspace mail defaults</h2>
          <p className="mt-1 max-w-[540px] text-sm leading-6 text-slate-500">
            Team members who have not configured personal SMTP will send mail through these credentials. Falls back to platform SMTP if left empty.
          </p>
        </div>
        <span className={cn("shrink-0 rounded-full px-3 py-1 text-xs font-semibold", workspaceSmtp.configured ? "bg-[#eefbf5] text-[#1fa261]" : "bg-slate-100 text-slate-600")}>
          {workspaceSmtp.configured ? "Configured" : "Not set"}
        </span>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="space-y-3">
          <div className="relative">
            <Server className={inputIconWrapperClassName} />
            <input
              className={inputWithIconClassName}
              placeholder="SMTP host  (e.g. smtp.gmail.com)"
              value={workspaceSmtp.smtpHost}
              onChange={(e) => setWorkspaceSmtp((s) => ({ ...s, smtpHost: e.target.value }))}
              disabled={workspaceSmtpBusy}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Server className={inputIconWrapperClassName} />
              <input
                className={inputWithIconClassName}
                placeholder="Port  (587)"
                value={workspaceSmtp.smtpPort}
                onChange={(e) => setWorkspaceSmtp((s) => ({ ...s, smtpPort: e.target.value }))}
                disabled={workspaceSmtpBusy}
              />
            </div>
            <div className="relative">
              <Mail className={inputIconWrapperClassName} />
              <input
                className={inputWithIconClassName}
                placeholder="From address"
                value={workspaceSmtp.smtpFrom}
                onChange={(e) => setWorkspaceSmtp((s) => ({ ...s, smtpFrom: e.target.value }))}
                disabled={workspaceSmtpBusy}
              />
            </div>
          </div>
          <div className="relative">
            <Mail className={inputIconWrapperClassName} />
            <input
              className={inputWithIconClassName}
              placeholder="SMTP username"
              value={workspaceSmtp.smtpUser}
              onChange={(e) => setWorkspaceSmtp((s) => ({ ...s, smtpUser: e.target.value }))}
              disabled={workspaceSmtpBusy}
            />
          </div>
          <div className="relative">
            <LockKeyhole className={inputIconWrapperClassName} />
            <input
              type="password"
              className={inputWithIconClassName}
              placeholder="SMTP password / app password"
              value={workspaceSmtp.smtpPass}
              onChange={(e) => setWorkspaceSmtp((s) => ({ ...s, smtpPass: e.target.value }))}
              disabled={workspaceSmtpBusy}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          {workspaceSmtp.configured ? (
            <button
              type="button"
              onClick={() => void clearWorkspaceSmtp()}
              disabled={workspaceSmtpBusy}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
            >
              {workspaceSmtpBusy ? "Working..." : "Clear workspace SMTP"}
            </button>
          ) : <span />}
          <button
            type="button"
            onClick={() => void saveWorkspaceSmtp()}
            disabled={workspaceSmtpBusy || !workspaceSmtp.smtpHost.trim() || !workspaceSmtp.smtpUser.trim() || !workspaceSmtp.smtpPass.trim() || !workspaceSmtp.smtpFrom.trim()}
            className="rounded-xl bg-[#386df4] px-5 py-2.5 text-sm font-medium text-white shadow-[0_4px_12px_rgba(56,109,244,0.25)] hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {workspaceSmtpBusy ? "Saving..." : "Save workspace SMTP"}
          </button>
        </div>
      </div>
    </section>
  );

  const renderSmtpSettingsSection = () => (
    <section className={settingsPanelSectionClassName}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[1.08rem] font-semibold text-slate-900">Personal SMTP credentials</h2>
        </div>
        <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", smtpSettings.configured ? "bg-[#eefbf5] text-[#1fa261]" : "bg-slate-100 text-slate-600")}>
          {smtpSettings.configured ? "Configured" : "Missing"}
        </span>
      </div>

      <div className={cn("mb-4 rounded-2xl border px-4 py-3 text-sm", smtpSettings.configured ? "border-[#d8efe2] bg-[#f4fcf7] text-[#256b48]" : "border-slate-200 bg-slate-50 text-slate-600")}>
        {getConnectionSourceLabel(smtpSettings.configuredSource, "smtp")}
      </div>

      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2.5 text-[1rem] font-medium text-slate-900">
              <MeetingProviderLogo provider="GMAIL" className="h-5 w-5 shrink-0" />
              <span>Connect Gmail with Google</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {smtpSettings.googleReady
                ? `Connected as ${smtpSettings.googleEmail}. Gmail OAuth now takes priority over manual SMTP for this user.`
                : smtpSettings.googleConnected
                  ? `Google account ${smtpSettings.googleEmail} is connected, but Gmail mail scope is still missing. Reconnect once to enable sending and inbox sync.`
                  : "Let every user sign in with Gmail instead of managing app passwords manually."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {smtpSettings.googleReady ? (
              <button
                type="button"
                disabled={smtpBusy || imapBusy}
                onClick={disconnectGoogleMail}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X className="h-4.5 w-4.5 shrink-0" />
                Disconnect Gmail
              </button>
            ) : null}
            <button
              type="button"
              disabled={!smtpSettings.googleAuthAvailable || smtpBusy || imapBusy}
              onClick={() => {
                window.location.href = "/api/email/google/connect?returnTo=/settings?view=mailbox";
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <MeetingProviderLogo provider="GMAIL" className="h-4.5 w-4.5 shrink-0" />
              {smtpSettings.googleReady ? "Reconnect Gmail" : "Connect Gmail"}
            </button>
          </div>
        </div>
        {!smtpSettings.googleAuthAvailable ? (
          <div className="mt-3 text-sm text-amber-600">Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in env to enable Gmail OAuth.</div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">SMTP host</label>
          <div className="relative">
            <Server className={inputIconWrapperClassName} />
            <input
              className={inputWithIconClassName}
              placeholder="smtp.gmail.com"
              value={smtpSettings.smtpHost}
              onChange={(event) => setSmtpSettings((state) => ({ ...state, smtpHost: event.target.value }))}
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">SMTP port</label>
          <div className="relative">
            <Server className={inputIconWrapperClassName} />
            <input
              className={inputWithIconClassName}
              placeholder="587"
              value={smtpSettings.smtpPort}
              onChange={(event) => setSmtpSettings((state) => ({ ...state, smtpPort: event.target.value }))}
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">SMTP user</label>
          <div className="relative">
            <Mail className={inputIconWrapperClassName} />
            <input
              className={inputWithIconClassName}
              placeholder="info@example.com"
              value={smtpSettings.smtpUser}
              onChange={(event) => setSmtpSettings((state) => ({ ...state, smtpUser: event.target.value }))}
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">SMTP from</label>
          <div className="relative">
            <Mail className={inputIconWrapperClassName} />
            <input
              className={inputWithIconClassName}
              placeholder="Relix CRM <info@example.com>"
              value={smtpSettings.smtpFrom}
              onChange={(event) => setSmtpSettings((state) => ({ ...state, smtpFrom: event.target.value }))}
            />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">SMTP password / app password</label>
        <div className="relative">
          <LockKeyhole className={inputIconWrapperClassName} />
          <input
            type="password"
            className={inputWithIconClassName}
            placeholder="Enter SMTP password"
            value={smtpSettings.smtpPass}
            onChange={(event) => setSmtpSettings((state) => ({ ...state, smtpPass: event.target.value }))}
          />
        </div>
      </div>

      <ToggleField
        title="Email delivery status"
        description={
          smtpSettings.configuredSource === "google"
            ? "Sending is using your connected Gmail account."
            : smtpSettings.configuredSource === "personal"
              ? "Configured and ready to send from your mailbox."
              : "Add your own SMTP credentials or connect Gmail to send from Inbox."
        }
        checked={emailSettings.openTracking}
        onChange={(value) => setEmailSettings((state) => ({ ...state, openTracking: value }))}
        cardClassName="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
        descriptionClassName="mt-1 text-sm text-slate-500"
      >
        <div className="mt-3 text-sm font-medium text-slate-500 sm:mt-2">Open tracking</div>
      </ToggleField>

      <div className="mt-6 flex flex-wrap justify-end gap-2">
        {(smtpSettings.personalConfigured ||
          smtpSettings.smtpHost ||
          smtpSettings.smtpPort !== "587" ||
          smtpSettings.smtpUser ||
          smtpSettings.smtpPass ||
          smtpSettings.smtpFrom) && (
          <button
            onClick={() => {
              void (async () => {
                const confirmed = await requestConfirmation({
                  title: "Clear personal SMTP?",
                  description:
                    "Your SMTP settings will be removed. If this is your last personal mail connection, Gmail will also be disconnected and stored mailbox emails will be cleared for this account.",
                  confirmLabel: "Clear SMTP",
                  tone: "warning"
                });

                if (!confirmed) {
                  return;
                }

                setSmtpBusy(true);
                setFeedback(null);

                try {
                  const response = await fetch("/api/settings/email?disconnectGmailIfLast=1", {
                    method: "DELETE"
                  });
                  const payload = (await response.json().catch(() => null)) as SmtpSettings | { error?: string } | null;

                  if (!response.ok) {
                    throw new Error((payload as { error?: string } | null)?.error || "Unable to clear SMTP settings");
                  }

                  setSmtpSettings(payload as SmtpSettings);
                  setEmailSettings((state) => ({
                    ...state,
                    openTracking: (payload as SmtpSettings).openTrackingEnabled,
                    clickTracking: (payload as SmtpSettings).clickTrackingEnabled
                  }));
                  setFeedback(
                    (payload as SmtpSettings).gmailDisconnected
                      ? "Personal SMTP cleared. Gmail was also disconnected because it was the last active mail connection, and mailbox data was removed."
                      : (payload as SmtpSettings).mailboxCleared
                        ? "Personal SMTP cleared and mailbox data removed."
                        : "Personal SMTP cleared. Mailbox data was kept because another personal connection is still active."
                  );
                } catch (error) {
                  setFeedback(error instanceof Error ? error.message : "Unable to clear SMTP settings.");
                } finally {
                  setSmtpBusy(false);
                }
              })();
            }}
            disabled={smtpBusy}
            className="crm-btn crm-btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
          >
            Clear personal SMTP
          </button>
        )}
        <button
          onClick={saveSmtpSettings}
          disabled={
            smtpBusy ||
            !smtpSettings.smtpHost.trim() ||
            !smtpSettings.smtpPort.trim() ||
            !smtpSettings.smtpUser.trim() ||
            !smtpSettings.smtpPass.trim() ||
            !smtpSettings.smtpFrom.trim()
          }
          className="inline-flex items-center gap-2 rounded-xl bg-[#386df4] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Mail className="h-4 w-4" />
          {smtpBusy ? "Saving..." : "Save personal SMTP"}
        </button>
      </div>
    </section>
  );

  const renderImapSettingsSection = () => (
    <section className={settingsPanelSectionClassName}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[1.08rem] font-semibold text-slate-900">Personal IMAP connection</h2>
        </div>
        <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", imapSettings.configured ? "bg-[#eefbf5] text-[#1fa261]" : "bg-slate-100 text-slate-600")}>
          {imapSettings.configured ? "Configured" : "Missing"}
        </span>
      </div>

      <div className={cn("mb-4 rounded-2xl border px-4 py-3 text-sm", imapSettings.configured ? "border-[#d8efe2] bg-[#f4fcf7] text-[#256b48]" : "border-slate-200 bg-slate-50 text-slate-600")}>
        {getConnectionSourceLabel(imapSettings.configuredSource, "imap")}
      </div>

      {imapSettings.googleReady ? (
        <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {`Gmail inbox sync is active for ${imapSettings.googleEmail}. Manual IMAP stays available only as a backup for this user.`}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">IMAP host</label>
          <div className="relative">
            <Server className={inputIconWrapperClassName} />
            <input
              className={inputWithIconClassName}
              placeholder="imap.gmail.com"
              value={imapSettings.imapHost}
              onChange={(event) => setImapSettings((state) => ({ ...state, imapHost: event.target.value }))}
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">IMAP port</label>
          <div className="relative">
            <Server className={inputIconWrapperClassName} />
            <input
              className={inputWithIconClassName}
              placeholder="993"
              value={imapSettings.imapPort}
              onChange={(event) => setImapSettings((state) => ({ ...state, imapPort: event.target.value }))}
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">IMAP user</label>
          <div className="relative">
            <Mail className={inputIconWrapperClassName} />
            <input
              className={inputWithIconClassName}
              placeholder="info@example.com"
              value={imapSettings.imapUser}
              onChange={(event) => setImapSettings((state) => ({ ...state, imapUser: event.target.value }))}
            />
          </div>
        </div>
        <div className="flex items-end">
        <ToggleField
          title="Use secure IMAP"
          description="Keep SSL/TLS enabled for inbox sync on port 993."
          checked={imapSettings.imapSecure}
          onChange={(value) => setImapSettings((state) => ({ ...state, imapSecure: value }))}
          cardClassName="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
          descriptionClassName="mt-1 text-sm text-slate-500"
        />
      </div>
      </div>

      <div className="mt-4">
        <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">IMAP password / app password</label>
        <div className="relative">
          <LockKeyhole className={inputIconWrapperClassName} />
          <input
            type="password"
            className={inputWithIconClassName}
            placeholder="Enter IMAP password"
            value={imapSettings.imapPass}
            onChange={(event) => setImapSettings((state) => ({ ...state, imapPass: event.target.value }))}
          />
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
        {imapSettings.configuredSource === "google"
          ? "Inbox sync is ready through your connected Gmail account."
          : imapSettings.configuredSource === "personal"
            ? "Inbox sync is ready to mirror your mailbox activity."
            : imapSettings.configuredSource === "workspace"
              ? "Inbox sync will use workspace defaults until you save personal IMAP."
              : imapSettings.configuredSource === "platform"
                ? "Inbox sync will use the platform fallback until you save personal IMAP."
                : "Add IMAP credentials to sync inbox, sent, and junk folders."}
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-2">
        {(imapSettings.personalConfigured ||
          imapSettings.imapHost ||
          imapSettings.imapPort !== "993" ||
          imapSettings.imapUser ||
          imapSettings.imapPass) && (
          <button
            onClick={() => {
              void (async () => {
                const confirmed = await requestConfirmation({
                  title: "Clear personal IMAP?",
                  description:
                    "Your IMAP settings will be removed. If this is your last personal mail connection, Gmail will also be disconnected and stored mailbox emails will be cleared for this account.",
                  confirmLabel: "Clear IMAP",
                  tone: "warning"
                });

                if (!confirmed) {
                  return;
                }

                setImapBusy(true);
                setFeedback(null);

                try {
                  const response = await fetch("/api/settings/imap?disconnectGmailIfLast=1", {
                    method: "DELETE"
                  });
                  const payload = (await response.json().catch(() => null)) as ImapSettings | { error?: string } | null;

                  if (!response.ok) {
                    throw new Error((payload as { error?: string } | null)?.error || "Unable to clear IMAP settings");
                  }

                  setImapSettings(payload as ImapSettings);
                  setFeedback(
                    (payload as ImapSettings).gmailDisconnected
                      ? "Personal IMAP cleared. Gmail was also disconnected because it was the last active mail connection, and mailbox data was removed."
                      : (payload as ImapSettings).mailboxCleared
                        ? "Personal IMAP cleared and mailbox data removed."
                        : "Personal IMAP cleared. Mailbox data was kept because another personal connection is still active."
                  );
                } catch (error) {
                  setFeedback(error instanceof Error ? error.message : "Unable to clear IMAP settings.");
                } finally {
                  setImapBusy(false);
                }
              })();
            }}
            disabled={imapBusy}
            className="crm-btn crm-btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
          >
            Clear personal IMAP
          </button>
        )}
        <button
          onClick={saveImapSettings}
          disabled={imapBusy || !imapSettings.imapHost.trim() || !imapSettings.imapPort.trim() || !imapSettings.imapUser.trim() || !imapSettings.imapPass.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-[#386df4] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Server className="h-4 w-4" />
          {imapBusy ? "Saving..." : "Save personal IMAP"}
        </button>
      </div>
    </section>
  );

  const renderActiveView = () => {
    switch (activeView) {
      case "profile":
        return (
          <div className="space-y-6">
            <section className={settingsPanelSectionWithDividerClassName}>
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex items-center gap-4">
                  {profileForm.profileImageUrl ? (
                    <img
                      src={profileForm.profileImageUrl}
                      alt={`${profileForm.firstName || "User"} profile`}
                      className="h-24 w-24 rounded-full border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[linear-gradient(180deg,#edf4ff,#d7e6ff)] text-2xl font-semibold text-[#386df4]">
                      {`${profileForm.firstName[0] || ""}${profileForm.lastName[0] || ""}`.trim() || "NA"}
                    </div>
                  )}
                  <div>
                    <div className="text-[1.04rem] font-semibold text-slate-900">Profile picture</div>
                    <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                      JPG, PNG, WebP - Max 10 MB
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <label
                    className={cn(
                      "crm-btn crm-btn-secondary cursor-pointer text-slate-800",
                      profileImageBusy && "pointer-events-none opacity-60"
                    )}
                  >
                    <ImageUp className="h-4 w-4" />
                    {profileImageBusy ? "Uploading..." : "Upload image"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          uploadProfileImage(file);
                        }
                        event.target.value = "";
                      }}
                    />
                  </label>
                  {profileForm.profileImageUrl ? (
                    <button
                      onClick={removeProfileImage}
                      disabled={profileImageBusy}
                      className="crm-btn crm-btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
            </section>

            <section className={settingsPanelSectionWithDividerClassName}>
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-[1.08rem] font-semibold text-slate-900">Personal details</h2>
                </div>
                <span className="rounded-md bg-[#edf4ff] px-3 py-1 text-xs font-semibold text-[#386df4]">Account</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">First name</label>
                  <div className="relative">
                    <User className={inputIconWrapperClassName} />
                    <input
                      className={inputWithIconClassName}
                      value={profileForm.firstName}
                      placeholder="Enter first name"
                      onChange={(event) => setProfileForm((state) => ({ ...state, firstName: event.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Last name</label>
                  <div className="relative">
                    <User className={inputIconWrapperClassName} />
                    <input
                      className={inputWithIconClassName}
                      value={profileForm.lastName}
                      placeholder="Enter last name"
                      onChange={(event) => setProfileForm((state) => ({ ...state, lastName: event.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Title</label>
                  <div className="relative">
                    <Briefcase className={inputIconWrapperClassName} />
                    <input
                      className={inputWithIconClassName}
                      value={profileForm.title}
                      placeholder="e.g. Account Executive"
                      onChange={(event) => setProfileForm((state) => ({ ...state, title: event.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Email</label>
                  <div className="relative">
                    <Mail className={inputIconWrapperClassName} />
                    <input
                      className={inputWithIconClassName}
                      type="email"
                      value={profileForm.email}
                      placeholder="email@company.com"
                      onChange={(event) => setProfileForm((state) => ({ ...state, email: event.target.value }))}
                    />
                  </div>
                  {profileForm.pendingEmail ? (
                    <p className="mt-2 text-sm leading-6 text-amber-700">
                      Pending verification: {profileForm.pendingEmail}. Your sign-in email will update after you open the verification link.
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={saveAccountInfo}
                  disabled={accountBusy || !profileForm.firstName.trim() || !profileForm.email.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#386df4] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Mail className="h-4 w-4" />
                  {accountBusy ? "Saving..." : "Save profile"}
                </button>
              </div>
            </section>

            <section className={settingsPanelSectionWithDividerClassName}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-[1.08rem] font-semibold text-slate-900">Password & security</h2>
                </div>
                <button
                  onClick={() => {
                    setFeedback(null);
                    setPasswordModalOpen(true);
                    setPasswordStep(profileForm.hasPassword ? 1 : 2);
                  }}
                  className="crm-btn crm-btn-secondary text-slate-800"
                >
                  <LockKeyhole className="h-4 w-4" />
                  {passwordButtonLabel}
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Google sign-in</div>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {profileForm.googleConnected ? "Google OAuth is linked to this account." : "Google sign-in is not linked to this account."}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold",
                        profileForm.googleConnected ? "bg-[#eefbf5] text-[#1fa261]" : "bg-slate-200 text-slate-600"
                      )}
                    >
                      {profileForm.googleConnected ? "Connected" : "Not linked"}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Email + password</div>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {profileForm.hasPassword ? "A password is set for direct email sign-in." : "No password is set yet for direct email sign-in."}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold",
                        profileForm.hasPassword ? "bg-[#eefbf5] text-[#1fa261]" : "bg-amber-100 text-amber-700"
                      )}
                    >
                      {profileForm.hasPassword ? "Ready" : "Not set"}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm leading-6 text-slate-500">
                {profileForm.googleConnected && profileForm.hasPassword
                  ? "This account can sign in with Google or with email and password."
                  : profileForm.googleConnected
                    ? "This account currently signs in with Google only. Create a password to let the same user log in with email and password too."
                    : profileForm.hasPassword
                      ? "This account signs in with email and password."
                      : "Set a password to enable direct email sign-in for this account."}
              </p>
            </section>

            <section className="rounded-2xl border border-rose-200 bg-[linear-gradient(180deg,#fffafa_0%,#fff4f4_100%)] p-5 shadow-[0_12px_32px_rgba(15,23,42,0.04)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[1.08rem] font-semibold text-slate-900">Delete account</div>
                  <p className="mt-1 text-sm leading-6 text-slate-600 lg:whitespace-nowrap">
                    Permanently remove this account and clear access to the workspace. This cannot be undone.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setFeedback(null);
                    setDeleteAccountModalOpen(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete account
                </button>
              </div>
            </section>
          </div>
        );
      case "workspace":
        return (
          <section className={settingsPanelSectionClassName}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[1.08rem] font-semibold text-slate-900">Workspace profile</h2>
                <p className="mt-1 max-w-[540px] text-sm leading-6 text-slate-500">
                  Rename the active workspace and keep the company website aligned for this workspace.
                </p>
                {!canEditWorkspaceProfile ? (
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Only the workspace owner can edit this profile.
                  </p>
                ) : null}
              </div>
              <span className="rounded-md bg-[#edf4ff] px-3 py-1 text-xs font-semibold text-[#386df4]">
                {canEditWorkspaceProfile ? "Editable" : "View only"}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Workspace name</label>
                <div className="relative">
                  <Briefcase className={inputIconWrapperClassName} />
                  <input
                    className={inputWithIconClassName}
                    value={workspaceProfile.name}
                    placeholder="Company or workspace name"
                    onChange={(event) => setWorkspaceProfile((state) => ({ ...state, name: event.target.value }))}
                    disabled={!canEditWorkspaceProfile || workspaceProfileBusy}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Workspace slug</label>
                <div className="relative">
                  <Globe className={inputIconWrapperClassName} />
                  <input
                    className={inputWithIconClassName}
                    value={workspaceProfile.slug}
                    placeholder="workspace-slug"
                    onChange={(event) => setWorkspaceProfile((state) => ({ ...state, slug: event.target.value }))}
                    disabled={!canEditWorkspaceProfile || workspaceProfileBusy}
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Company website</label>
                <div className="relative">
                  <Globe2 className={inputIconWrapperClassName} />
                  <input
                    className={inputWithIconClassName}
                    value={workspaceProfile.website}
                    placeholder="https://company.com"
                    onChange={(event) => setWorkspaceProfile((state) => ({ ...state, website: event.target.value }))}
                    disabled={!canEditWorkspaceProfile || workspaceProfileBusy}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm leading-6 text-slate-500">
                {canEditWorkspaceProfile
                  ? "Workspace switcher, team pages, and active user workspace labels update after saving."
                  : "The workspace owner manages the workspace name, slug, and website shown across the app."}
              </p>
              <button
                onClick={saveWorkspaceProfile}
                disabled={!canEditWorkspaceProfile || workspaceProfileBusy || !workspaceProfile.name.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#386df4] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Briefcase className="h-4 w-4" />
                {workspaceProfileBusy ? "Saving..." : "Save workspace"}
              </button>
            </div>
          </section>
        );
      case "localization":
        return (
          <section className={settingsPanelSectionClassName}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[1.08rem] font-semibold text-slate-900">Workspace defaults</h2>
              </div>
              <span className="rounded-full bg-[#edf4ff] px-3 py-1 text-xs font-semibold text-[#386df4]">Locale</span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Country</label>
                <div className="relative">
                  <Globe className={inputIconWrapperClassName} />
                  <AppSelect
                    className={selectWithIconClassName}
                    value={localizationSettings.countryCode}
                    onChange={(event) => setLocalizationSettings((state) => ({ ...state, countryCode: event.target.value }))}
                  >
                    {countryOptions.map((option) => (
                      <option key={option.code} value={option.code}>
                        {option.label}
                      </option>
                    ))}
                  </AppSelect>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Timezone</label>
                <div className="relative">
                  <Clock className={inputIconWrapperClassName} />
                  <AppSelect
                    className={selectWithIconClassName}
                    value={localizationSettings.timezone}
                    onChange={(event) => setLocalizationSettings((state) => ({ ...state, timezone: event.target.value }))}
                  >
                    {timezoneOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </AppSelect>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Currency</label>
                <div className="relative">
                  <DollarSign className={inputIconWrapperClassName} />
                  <AppSelect
                    className={selectWithIconClassName}
                    value={localizationSettings.currencyCode}
                    onChange={(event) => setLocalizationSettings((state) => ({ ...state, currencyCode: event.target.value }))}
                  >
                    {currencyOptions.map((option) => (
                      <option key={option.code} value={option.code}>
                        {option.code} · {option.label}
                      </option>
                    ))}
                  </AppSelect>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Locale</label>
                <div className="relative">
                  <Globe className={inputIconWrapperClassName} />
                  <AppSelect
                    className={selectWithIconClassName}
                    value={localizationSettings.locale}
                    onChange={(event) => setLocalizationSettings((state) => ({ ...state, locale: event.target.value }))}
                  >
                    {localeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </AppSelect>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Date format</label>
                <div className="relative">
                  <CalendarDays className={inputIconWrapperClassName} />
                  <AppSelect
                    className={selectWithIconClassName}
                    value={localizationSettings.dateFormat}
                    onChange={(event) => setLocalizationSettings((state) => ({ ...state, dateFormat: event.target.value }))}
                  >
                    {dateFormatOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </AppSelect>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Time format</label>
                <div className="relative">
                  <Clock className={inputIconWrapperClassName} />
                  <AppSelect
                    className={selectWithIconClassName}
                    value={localizationSettings.timeFormat}
                    onChange={(event) => setLocalizationSettings((state) => ({ ...state, timeFormat: event.target.value }))}
                  >
                    {timeFormatOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </AppSelect>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Week starts on</label>
              <div className="relative">
                <CalendarDays className={inputIconWrapperClassName} />
                <AppSelect
                  className={selectWithIconClassName}
                  value={localizationSettings.weekStartsOn}
                  onChange={(event) => setLocalizationSettings((state) => ({ ...state, weekStartsOn: event.target.value }))}
                >
                  {weekStartOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </AppSelect>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={saveLocalizationSettings}
                disabled={localizationBusy}
                className="inline-flex items-center gap-2 rounded-xl bg-[#386df4] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Globe2 className="h-4 w-4" />
                {localizationBusy ? "Saving..." : "Save localization"}
              </button>
            </div>
          </section>
        );
      case "email":
        return (
          <section className={settingsPanelSectionClassName}>
            <div className="mb-5">
              <h2 className="text-[1.08rem] font-semibold text-slate-900">Outbound email behavior</h2>
            </div>

            <div className="space-y-5">
              <ToggleField
                title="Append the following opt-out message after my signatures in sequences"
                checked={emailSettings.appendOptOut}
                onChange={(value) => setEmailSettings((state) => ({ ...state, appendOptOut: value }))}
                cardClassName="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                descriptionClassName="mt-3 text-sm leading-6 text-slate-500"
              >
                <div className="relative mt-3">
                  <MenuSquare className={inputIconWrapperClassName} />
                  <input
                    className={inputWithIconClassName}
                    value={emailSettings.optOutMessage}
                    onChange={(event) => setEmailSettings((state) => ({ ...state, optOutMessage: event.target.value }))}
                  />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Surround your opt-out link with brackets {"<%"}and{" %>"}. E.g. If you don’t want to hear from me, you can {"<%unsubscribe here%>"}.
                </p>
              </ToggleField>

              <ToggleField
                title="Include one-click unsubscribe headers"
                description="Recommended for organizations that send 5,000 emails or more within a 24-hour period."
                checked={emailSettings.oneClickUnsubscribe}
                onChange={(value) => setEmailSettings((state) => ({ ...state, oneClickUnsubscribe: value }))}
              />

              <div className="grid gap-4 xl:grid-cols-2">
                <div
                  className={cn(
                    "rounded-2xl border p-5",
                    emailSettings.openTracking
                      ? "border-emerald-200 bg-emerald-50/70"
                      : "border-slate-200 bg-white"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-11 w-11 items-center justify-center rounded-2xl border",
                          emailSettings.openTracking
                            ? "border-emerald-200 bg-white text-emerald-600"
                            : "border-slate-200 bg-slate-50 text-slate-500"
                        )}
                      >
                        <MailOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <div className={cn("text-xs font-semibold uppercase tracking-[0.24em]", emailSettings.openTracking ? "text-emerald-700" : "text-slate-400")}>
                          {emailSettings.openTracking ? "Live" : "Off"}
                        </div>
                        <p className="mt-0.5 text-sm font-medium text-slate-600">Engagement signal</p>
                        <p className="mt-0.5 text-xs text-slate-400">Track message opens for outbound email.</p>
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={emailSettings.openTracking}
                      onChange={(value) => setEmailSettings((state) => ({ ...state, openTracking: value }))}
                    />
                  </div>
                </div>

                <div
                  className={cn(
                    "rounded-2xl border p-5",
                    emailSettings.clickTracking
                      ? "border-cyan-200 bg-cyan-50/70"
                      : "border-slate-200 bg-white"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-11 w-11 items-center justify-center rounded-2xl border",
                          emailSettings.clickTracking
                            ? "border-cyan-200 bg-white text-cyan-600"
                            : "border-slate-200 bg-slate-50 text-slate-500"
                        )}
                      >
                        <MousePointerClick className="h-5 w-5" />
                      </div>
                      <div>
                        <div className={cn("text-xs font-semibold uppercase tracking-[0.24em]", emailSettings.clickTracking ? "text-cyan-700" : "text-slate-400")}>
                          {emailSettings.clickTracking ? "Live" : "Off"}
                        </div>
                        <p className="mt-0.5 text-sm font-medium text-slate-600">Link analytics</p>
                        <p className="mt-0.5 text-xs text-slate-400">Track clicks on links added to outbound email.</p>
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={emailSettings.clickTracking}
                      onChange={(value) => setEmailSettings((state) => ({ ...state, clickTracking: value }))}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      case "mailbox":
        return (
          <div className="space-y-6">
            {renderSmtpSettingsSection()}
            {renderImapSettingsSection()}
            {canManageWorkspace ? renderWorkspaceSmtpSection() : null}
          </div>
        );
      case "smtp":
        return renderSmtpSettingsSection();
      case "imap":
        return renderImapSettingsSection();
      case "conversations":
        return (
          <section className={settingsPanelSectionClassName}>
            <div className="mb-5">
              <h2 className="text-[1.08rem] font-semibold text-slate-900">Conversation access</h2>
            </div>

            <div className="space-y-4">
              <ToggleField
                title="Enable private conversations"
                description="Keep conversations private. Only hosts, internal participants, and people with the link can access them."
                checked={conversationSettings.privateConversations}
                onChange={(value) => setConversationSettings((state) => ({ ...state, privateConversations: value }))}
              />

              <ToggleField
                title="Revoke access to all shared recording links"
                description="People you previously shared recordings with will no longer be able to access them."
                checked={conversationSettings.revokeSharedRecordings}
                onChange={(value) => setConversationSettings((state) => ({ ...state, revokeSharedRecordings: value }))}
              />
            </div>
          </section>
        );
      case "notifications":
        return (
          <section className={settingsPanelSectionClassName}>
            <div className="mb-5">
              <h2 className="text-[1.08rem] font-semibold text-slate-900">Reminder delivery</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Choose whether reminders should appear inside CRM, send by email, or both when the background reminder processor runs.
              </p>
            </div>

            <div className="space-y-3">
              <ToggleField
                title="In-app reminders"
                description="Create reminder notifications inside CRM when the background processor picks up a due lead or task reminder."
                checked={notificationPreferences.reminderInAppEnabled}
                onChange={(value) => setNotificationPreferences((state) => ({ ...state, reminderInAppEnabled: value }))}
              />

              <ToggleField
                title="Reminder emails"
                description="Send reminder emails from the background processor when email delivery is configured successfully."
                checked={notificationPreferences.reminderEmailEnabled}
                onChange={(value) => setNotificationPreferences((state) => ({ ...state, reminderEmailEnabled: value }))}
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={saveNotificationPreferences}
                disabled={notificationPreferencesBusy}
                className="inline-flex items-center justify-center rounded-xl bg-[#386df4] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {notificationPreferencesBusy ? "Saving..." : "Save reminder settings"}
              </button>
            </div>
          </section>
        );
      case "integrations":
        return (
          <div className="space-y-8">
            <section className={settingsPanelSectionWithDividerClassName}>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-[1.08rem] font-semibold text-slate-900">Connected integrations</h2>
                </div>
                <span className="rounded-full bg-[#eefbf5] px-3 py-1 text-xs font-semibold text-[#1fa261]">
                  {connectedIntegrations.length} connected
                </span>
              </div>
              {integrationsBusy ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-sm text-slate-500">
                  Loading integrations...
                </div>
              ) : connectedIntegrations.length ? (
                <div className="space-y-3">
                  {connectedIntegrations.map((integration) => (
                    <IntegrationRow
                      key={integration.id}
                      integration={integration}
                      onAction={handleIntegrationAction}
                      busy={integrationActionId === integration.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-sm text-slate-500">
                  No integrations are connected yet.
                </div>
              )}
            </section>

            <section className={comingSoonIntegrations.length ? settingsPanelSectionWithDividerClassName : settingsPanelSectionClassName}>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-[1.08rem] font-semibold text-slate-900">Available integrations</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {availableIntegrations.length} available
                </span>
              </div>
              {slackSetupOpen ? (
                <div className="rounded-2xl border border-[#c8d8ff] bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)] p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="flex-1">
                      <div className="text-[1rem] font-semibold text-slate-900">Slack incoming webhook</div>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Paste a Slack incoming webhook URL. A confirmation message will be sent before the workspace saves it.
                      </p>
                      <div className="mt-3">
                        <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Webhook URL</label>
                        <div className="relative">
                          <MessageSquare className={inputIconWrapperClassName} />
                          <input
                            className={inputWithIconClassName}
                            placeholder="https://hooks.slack.com/services/..."
                            value={slackWebhookUrl}
                            onChange={(event) => setSlackWebhookUrl(event.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSlackSetupOpen(false);
                          setSlackWebhookUrl("");
                        }}
                        className="crm-btn crm-btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => submitIntegrationAction("slack", "connect", slackWebhookUrl)}
                        disabled={!slackWebhookUrl.trim() || integrationActionId === "slack"}
                        className="rounded-xl border border-[#386df4] bg-[#386df4] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {integrationActionId === "slack" ? "Connecting..." : "Connect Slack"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
              {integrationsBusy ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-sm text-slate-500">
                  Loading integrations...
                </div>
              ) : availableIntegrations.length ? (
                <div className="space-y-3">
                  {availableIntegrations.map((integration) => (
                    <IntegrationRow
                      key={integration.id}
                      integration={integration}
                      onAction={handleIntegrationAction}
                      busy={integrationActionId === integration.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6 text-sm text-slate-500">
                  No additional live integrations are available right now.
                </div>
              )}
            </section>

            {comingSoonIntegrations.length ? (
              <section className={settingsPanelSectionClassName}>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-[1.08rem] font-semibold text-slate-900">Coming soon</h2>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {comingSoonIntegrations.length} planned
                  </span>
                </div>
                <div className="space-y-3">
                  {comingSoonIntegrations.map((integration) => (
                    <IntegrationRow key={integration.id} integration={integration} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        );
      case "trash":
        return (
          <div className="space-y-8">
            <section className={settingsPanelSectionWithDividerClassName}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-[1.08rem] font-semibold text-slate-900">Deleted records</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Recently deleted contacts, companies, tasks, and meeting records appear here until they are restored or removed permanently.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {trashEntries.length} item{trashEntries.length === 1 ? "" : "s"}
                  </span>
                  {trashEntries.length ? (
                    <button
                      onClick={permanentlyDeleteAllTrashItems}
                      disabled={trashBusy || trashBulkDeleteBusy}
                      className="crm-btn crm-btn-danger disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {trashBulkDeleteBusy ? "Deleting..." : "Delete all"}
                    </button>
                  ) : null}
                  <button
                    onClick={() => void loadTrashEntries()}
                    disabled={trashBusy || trashBulkDeleteBusy}
                    className="crm-btn crm-btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {trashBusy ? "Refreshing..." : "Refresh"}
                  </button>
                </div>
              </div>
            </section>

            <section className={settingsPanelSectionClassName}>
              {trashEntries.length ? (
                <div className="space-y-3">
                  {trashEntries.map((item) => {
                    const isWorking = trashBulkDeleteBusy || trashActionId === item.id;

                    return (
                      <div key={item.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#386df4]">
                                {trashEntityLabels[item.entityType]}
                              </span>
                              <span className="text-xs text-slate-400">
                                Deleted {new Date(item.deletedAt).toLocaleString()}
                              </span>
                            </div>
                            <div className="mt-2 text-[1rem] font-semibold text-slate-900">{item.title}</div>
                            {item.description ? <div className="mt-1 text-sm text-slate-500">{item.description}</div> : null}
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <button
                              onClick={() => restoreTrashItem(item)}
                              disabled={isWorking}
                              className="crm-btn crm-btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isWorking ? "Working..." : "Restore"}
                            </button>
                            <button
                              onClick={() => permanentlyDeleteTrashItem(item)}
                              disabled={isWorking}
                              className="crm-btn crm-btn-danger rounded-xl disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Delete permanently
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                    <Trash2 className="h-5 w-5" />
                  </div>
                  <div className="mt-4 text-[1rem] font-semibold text-slate-900">Trash is empty</div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Deleted records will show up here automatically when they are moved to the trash bin.
                  </p>
                </div>
              )}
            </section>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Topbar title="Settings" subtitle="Manage profile, messaging, privacy, notifications, integrations, and trash recovery.">
        <div className="flex min-w-0 items-center justify-end gap-3">
          {feedback ? <FeedbackToast message={feedback} position="inline" className="max-w-[min(30rem,calc(100vw-16rem))] truncate" /> : null}
          <button
            type="button"
            onClick={() => setWorkspaceSwitcherOpen(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.04)] hover:bg-slate-50"
          >
            <Briefcase className="h-4 w-4 text-[#386df4]" />
            Switch workspace
          </button>
        </div>
      </Topbar>

      <div className="grid gap-6 lg:items-start lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-5 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <nav className="space-y-1 p-2.5">
              {settingsMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                const badge =
                  item.id === "integrations"
                    ? `${connectedIntegrations.length}`
                    : item.id === "notifications"
                      ? `${enabledReminderChannelCount}`
                      : item.id === "trash"
                        ? `${trashEntries.length}`
                      : null;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition",
                      isActive
                        ? "border-[#386df4]/20 bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)]"
                        : "border-transparent bg-white hover:border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border",
                        isActive ? "border-[#bfd2ff] bg-white text-[#386df4]" : "border-slate-200 bg-slate-50 text-slate-500"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className={cn("min-w-0 flex-1 text-sm font-semibold", isActive ? "text-slate-900" : "text-slate-700")}>{item.label}</div>
                    {badge ? (
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", isActive ? "bg-white text-[#386df4]" : "bg-slate-100 text-slate-500")}>
                        {badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        <section className="min-w-0 self-start overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
          <div className="border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f9fbff_100%)] px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-[2rem] font-semibold tracking-tight text-slate-900">{currentViewMeta.title}</h2>
              </div>
            </div>
          </div>

          <div className="bg-[radial-gradient(circle_at_top_left,rgba(56,109,244,0.05),transparent_28%),linear-gradient(180deg,#ffffff_0%,#fcfdff_100%)] px-6 py-6 sm:px-8">
            {renderActiveView()}
          </div>
        </section>
      </div>

      <PasswordModal
        open={passwordModalOpen}
        step={passwordStep}
        busy={passwordBusy}
        hasPassword={profileForm.hasPassword}
        googleConnected={profileForm.googleConnected}
        currentPassword={currentPassword}
        newPassword={newPassword}
        confirmPassword={confirmPassword}
        onClose={closePasswordModal}
        onCurrentPasswordChange={setCurrentPassword}
        onNewPasswordChange={setNewPassword}
        onConfirmPasswordChange={setConfirmPassword}
        onContinue={() => setPasswordStep(2)}
        onSave={savePassword}
      />
      <DeleteAccountModal
        open={deleteAccountModalOpen}
        busy={deleteAccountBusy}
        confirmText={deleteAccountConfirmText}
        onClose={closeDeleteAccountModal}
        onConfirmTextChange={setDeleteAccountConfirmText}
        onDelete={deleteAccount}
      />
      {confirmationDialog}
      <WorkspaceSwitcherModal open={workspaceSwitcherOpen} onOpenChange={setWorkspaceSwitcherOpen} />
    </div>
  );
}

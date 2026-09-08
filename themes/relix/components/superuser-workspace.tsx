"use client";

import { AppSelect } from "@/components/app-select";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Building2,
  Globe2,
  KeyRound,
  Link2,
  Mail,
  Plus,
  Save,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  Upload,
  User,
  UserPlus,
  Users,
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FeedbackToast } from "@/components/feedback-toast";
import { useConfirmAction } from "@/components/confirm-action-modal";
import { useCommandKFocus } from "@/components/search-hotkey";
import { UserAvatar } from "@/components/user-avatar";
import { getAccessRoleLabel, getMemberStatusLabel, superuserAccessRoleOptions, teamStatusOptions } from "@/lib/team";

type ManagedUser = {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  accessRole: string;
  status: string;
  workspaceId: string | null;
  workspaceName: string | null;
  jobRole: string | null;
  onboardingCompleted: boolean;
  createdAt: string;
  lastActiveAt: string | null;
};

type EssentialsState = {
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  openTrackingEnabled: boolean;
  clickTrackingEnabled: boolean;
  imapHost: string;
  imapPort: string;
  imapUser: string;
  imapPass: string;
  imapSecure: boolean;
  countryCode: string;
  timezone: string;
  currencyCode: string;
  locale: string;
  dateFormat: string;
  timeFormat: string;
  weekStartsOn: string;
};

type ManagedWorkspace = {
  id: string;
  name: string;
  slug: string;
  website: string;
  createdAt: string;
  ownerName: string | null;
  ownerEmail: string | null;
  memberCount: number;
  activeMembers: number;
  pendingInvites: number;
  totalRecords: number;
  smtpConfigured: boolean;
  imapConfigured: boolean;
  profileName: string;
  profileEmail: string;
  personalMeetingSlug: string;
  essentials: EssentialsState;
};

type Overview = {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  pendingInvites: number;
  totalRecords: number;
  totalWorkspaces: number;
};

type WorkspaceProfile = {
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string;
  companyWebsite: string;
  profileName: string;
  profileEmail: string;
  personalMeetingSlug: string;
};

type PlatformSettingsState = {
  appName: string;
  appDescription: string;
  appLogoUrl: string;
  appUrl: string;
  supportEmail: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  imapHost: string;
  imapPort: string;
  imapUser: string;
  imapPass: string;
  imapSecure: boolean;
  googleClientId: string;
  googleClientSecret: string;
  openAiApiKey: string;
  openAiModel: string;
  openTrackingEnabled: boolean;
  clickTrackingEnabled: boolean;
};

type SuperuserPanel = "overview" | "users" | "workspaces" | "platform" | "workspace";

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/20 hover:border-slate-300";
const inputWithIconClassName =
  "w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/20 hover:border-slate-300";
const inputIconWrapperClassName = "pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400";
const selectClassName = `${inputClassName} appearance-none pr-10 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_10px_center] bg-no-repeat`;
const checkboxClassName = "h-4 w-4 rounded border-slate-300 text-[#386df4] focus:ring-[#386df4]/40";

const defaultEssentialsState: EssentialsState = {
  smtpHost: "",
  smtpPort: "",
  smtpUser: "",
  smtpPass: "",
  smtpFrom: "",
  openTrackingEnabled: true,
  clickTrackingEnabled: true,
  imapHost: "",
  imapPort: "",
  imapUser: "",
  imapPass: "",
  imapSecure: true,
  countryCode: "IN",
  timezone: "Asia/Kolkata",
  currencyCode: "INR",
  locale: "en-IN",
  dateFormat: "DD MMM YYYY",
  timeFormat: "12h",
  weekStartsOn: "Monday"
};

const defaultCreateUserForm = {
  fullName: "",
  email: "",
  password: "",
  accessRole: "MEMBER",
  jobRole: "",
  workspaceId: ""
};

const defaultCreateWorkspaceForm = {
  workspaceName: "",
  companyWebsite: ""
};

function roleTone(role: string) {
  if (role === "SUPERUSER") return "bg-[#edf7f3] text-[#0f8b5f]";
  if (role === "ADMIN") return "bg-[#eef4ff] text-[#386df4]";
  if (role === "MANAGER") return "bg-[#f7f1ff] text-[#6b4fe0]";
  return "bg-slate-100 text-slate-600";
}

function statusTone(status: string) {
  if (status === "ACTIVE") return "bg-[#eefbf5] text-[#1fa261]";
  if (status === "SUSPENDED") return "bg-[#fff4f0] text-[#d25d37]";
  return "bg-slate-100 text-slate-600";
}

function initials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function workspaceToProfileState(workspace: ManagedWorkspace | null): WorkspaceProfile {
  return workspace
    ? {
        workspaceId: workspace.id,
        workspaceName: workspace.name,
        workspaceSlug: workspace.slug,
        companyWebsite: workspace.website,
        profileName: workspace.profileName,
        profileEmail: workspace.profileEmail,
        personalMeetingSlug: workspace.personalMeetingSlug
      }
    : {
        workspaceId: "",
        workspaceName: "",
        workspaceSlug: "",
        companyWebsite: "",
        profileName: "",
        profileEmail: "",
        personalMeetingSlug: ""
      };
}


function IconInput({
  icon: Icon,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  icon: LucideIcon;
}) {
  return (
    <div className="relative">
      <Icon className={inputIconWrapperClassName} />
      <input {...props} className={`${inputWithIconClassName}${className ? ` ${className}` : ""}`} />
    </div>
  );
}

function IconSelect({
  icon: Icon,
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <Icon className={inputIconWrapperClassName} />
      <AppSelect {...props} className={`${selectClassName} pl-10 ${className || ""}`}>
        {children}
      </AppSelect>
    </div>
  );
}

export function SuperuserWorkspace({
  currentUserId,
  currentUserName,
  currentUserEmail,
  currentUserWorkspaceId,
  users,
  workspaces,
  overview,
  platformSettings
}: {
  currentUserId: string;
  currentUserName: string;
  currentUserEmail: string;
  currentUserWorkspaceId: string | null;
  users: ManagedUser[];
  workspaces: ManagedWorkspace[];
  overview: Overview;
  platformSettings: PlatformSettingsState;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [userRows, setUserRows] = useState(users);
  const [workspaceRows, setWorkspaceRows] = useState(workspaces);
  const [createUserForm, setCreateUserForm] = useState({
    ...defaultCreateUserForm,
    workspaceId: currentUserWorkspaceId || workspaces[0]?.id || ""
  });
  const [createWorkspaceForm, setCreateWorkspaceForm] = useState(defaultCreateWorkspaceForm);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(workspaces[0]?.id || "");
  const [userPasswordMap, setUserPasswordMap] = useState<Record<string, string>>({});
  const [workspaceState, setWorkspaceState] = useState<WorkspaceProfile>(() => workspaceToProfileState(workspaces[0] || null));
  const [essentialsState, setEssentialsState] = useState<EssentialsState>(workspaces[0]?.essentials || defaultEssentialsState);
  const [platformState, setPlatformState] = useState<PlatformSettingsState>(platformSettings);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const [activePanel, setActivePanel] = useState<SuperuserPanel>("overview");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const { confirm, confirmationDialog } = useConfirmAction();
  useCommandKFocus(searchInputRef);

  useEffect(() => {
    setUserRows(users);
  }, [users]);

  useEffect(() => {
    setWorkspaceRows(workspaces);
  }, [workspaces]);

  useEffect(() => {
    setPlatformState(platformSettings);
  }, [platformSettings]);

  useEffect(() => {
    if (!selectedWorkspaceId && workspaces[0]?.id) {
      setSelectedWorkspaceId(workspaces[0].id);
    }
  }, [selectedWorkspaceId, workspaces]);

  const selectedWorkspace = useMemo(
    () => workspaceRows.find((workspace) => workspace.id === selectedWorkspaceId) || null,
    [selectedWorkspaceId, workspaceRows]
  );

  useEffect(() => {
    setWorkspaceState(workspaceToProfileState(selectedWorkspace));
    setEssentialsState(selectedWorkspace?.essentials || defaultEssentialsState);
  }, [selectedWorkspace]);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return userRows;
    }

    return userRows.filter((user) =>
      [
        user.fullName,
        user.email,
        user.workspaceName || "",
        user.jobRole || "",
        getAccessRoleLabel(user.accessRole),
        getMemberStatusLabel(user.status)
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [deferredQuery, userRows]);

  const configuredWorkspaceCount = workspaceRows.filter((workspace) => workspace.smtpConfigured || workspace.imapConfigured).length;
  const panelItems: Array<{ id: SuperuserPanel; label: string; icon: LucideIcon; meta: string }> = [
    { id: "overview", label: "Overview", icon: ShieldCheck, meta: "Global summary" },
    { id: "users", label: "Users", icon: Users, meta: `${userRows.length}` },
    { id: "workspaces", label: "Workspaces", icon: Building2, meta: `${workspaceRows.length || overview.totalWorkspaces}` },
    { id: "platform", label: "Platform", icon: Globe2, meta: "Runtime defaults" },
    { id: "workspace", label: "Editor", icon: Shield, meta: selectedWorkspace ? selectedWorkspace.name : "Select one" }
  ];

  const patchUser = (userId: string, payload: Record<string, unknown>, successMessage: string) => {
    setFeedback(null);
    startTransition(() => {
      void (async () => {
        try {
          const response = await fetch(`/api/superuser/users/${userId}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload)
          });
          const result = (await response.json().catch(() => null)) as { error?: string; user?: ManagedUser } | null;

          if (!response.ok || !result?.user) {
            throw new Error(result?.error || "Unable to update user");
          }

          setUserRows((current) => current.map((user) => (user.id === result.user?.id ? result.user : user)));
          setFeedback(successMessage);
          router.refresh();
        } catch (error) {
          setFeedback(error instanceof Error ? error.message : "Unable to update user");
        }
      })();
    });
  };

  const resetUserPassword = (userId: string, newPassword: string) => {
    setFeedback(null);
    startTransition(() => {
      void (async () => {
        try {
          const response = await fetch(`/api/superuser/users/${userId}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ newPassword })
          });
          const result = (await response.json().catch(() => null)) as { error?: string; user?: ManagedUser } | null;
          if (!response.ok || !result?.user) throw new Error(result?.error || "Unable to update password");
          setUserPasswordMap((current) => { const next = { ...current }; delete next[userId]; return next; });
          setFeedback("Password updated.");
        } catch (error) {
          setFeedback(error instanceof Error ? error.message : "Unable to update password");
        }
      })();
    });
  };

  const saveWorkspaceProfile = () => {
    if (!workspaceState.workspaceId) {
      return;
    }

    setFeedback(null);
    startTransition(() => {
      void (async () => {
        try {
          const response = await fetch("/api/superuser/workspace", {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(workspaceState)
          });
          const result = (await response.json().catch(() => null)) as Partial<WorkspaceProfile> & { error?: string };

          if (!response.ok) {
            throw new Error(result.error || "Unable to update workspace profile");
          }

          setWorkspaceRows((current) =>
            current.map((workspace) =>
              workspace.id === workspaceState.workspaceId
                ? {
                    ...workspace,
                    name: result.workspaceName || workspaceState.workspaceName,
                    slug: result.workspaceSlug || workspaceState.workspaceSlug,
                    website: result.companyWebsite ?? workspaceState.companyWebsite,
                    profileName: result.profileName || workspaceState.profileName,
                    profileEmail: result.profileEmail || workspaceState.profileEmail,
                    personalMeetingSlug: result.personalMeetingSlug || workspaceState.personalMeetingSlug
                  }
                : workspace
            )
          );
          setUserRows((current) =>
            current.map((user) =>
              user.workspaceId === workspaceState.workspaceId
                ? { ...user, workspaceName: result.workspaceName || workspaceState.workspaceName }
                : user
            )
          );
          setFeedback("Workspace profile updated.");
          router.refresh();
        } catch (error) {
          setFeedback(error instanceof Error ? error.message : "Unable to update workspace profile");
        }
      })();
    });
  };

  const saveEssentials = () => {
    if (!selectedWorkspaceId) {
      return;
    }

    setFeedback(null);
    startTransition(() => {
      void (async () => {
        try {
          const response = await fetch("/api/superuser/essentials", {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              workspaceId: selectedWorkspaceId,
              ...essentialsState
            })
          });
          const result = (await response.json().catch(() => null)) as (EssentialsState & { error?: string }) | null;

          if (!response.ok || !result) {
            throw new Error(result?.error || "Unable to update essentials");
          }

          const nextState = {
            smtpHost: result.smtpHost,
            smtpPort: result.smtpPort,
            smtpUser: result.smtpUser,
            smtpPass: result.smtpPass,
            smtpFrom: result.smtpFrom,
            openTrackingEnabled: result.openTrackingEnabled,
            clickTrackingEnabled: result.clickTrackingEnabled,
            imapHost: result.imapHost,
            imapPort: result.imapPort,
            imapUser: result.imapUser,
            imapPass: result.imapPass,
            imapSecure: result.imapSecure,
            countryCode: result.countryCode,
            timezone: result.timezone,
            currencyCode: result.currencyCode,
            locale: result.locale,
            dateFormat: result.dateFormat,
            timeFormat: result.timeFormat,
            weekStartsOn: result.weekStartsOn
          };

          setEssentialsState(nextState);
          setWorkspaceRows((current) =>
            current.map((workspace) =>
              workspace.id === selectedWorkspaceId
                ? {
                    ...workspace,
                    essentials: nextState,
                    smtpConfigured: Boolean(result.smtpHost && result.smtpPort && result.smtpUser && result.smtpPass && result.smtpFrom),
                    imapConfigured: Boolean(result.imapHost && result.imapPort && result.imapUser && result.imapPass)
                  }
                : workspace
            )
          );
          setFeedback("Workspace essentials updated.");
        } catch (error) {
          setFeedback(error instanceof Error ? error.message : "Unable to update essentials");
        }
      })();
    });
  };

  const uploadLogo = async () => {
    if (!logoFile) return;
    setIsUploadingLogo(true);
    setFeedback(null);
    try {
      const form = new FormData();
      form.append("file", logoFile);
      const response = await fetch("/api/superuser/platform/logo", { method: "POST", body: form });
      const result = (await response.json().catch(() => null)) as { appLogoUrl?: string; error?: string } | null;
      if (!response.ok || !result) {
        throw new Error(result?.error || "Unable to upload logo");
      }
      setPlatformState((current) => ({ ...current, appLogoUrl: `${result.appLogoUrl}?v=${Date.now()}` }));
      setLogoFile(null);
      setLogoPreview("");
      setFeedback("Logo updated.");
      router.refresh();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to upload logo");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const removeLogo = async () => {
    setIsUploadingLogo(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/superuser/platform/logo", { method: "DELETE" });
      if (!response.ok) throw new Error("Unable to remove logo");
      setPlatformState((current) => ({ ...current, appLogoUrl: "" }));
      setLogoFile(null);
      setLogoPreview("");
      setFeedback("Logo removed.");
      router.refresh();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to remove logo");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const savePlatformSettings = () => {
    setFeedback(null);
    startTransition(() => {
      void (async () => {
        try {
          const response = await fetch("/api/superuser/platform", {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(platformState)
          });
          const result = (await response.json().catch(() => null)) as (PlatformSettingsState & { error?: string }) | null;

          if (!response.ok || !result) {
            throw new Error(result?.error || "Unable to update platform settings");
          }

          setPlatformState(result);
          setFeedback("Platform defaults updated.");
          router.refresh();
        } catch (error) {
          setFeedback(error instanceof Error ? error.message : "Unable to update platform settings");
        }
      })();
    });
  };

  const createWorkspace = () => {
    if (!createWorkspaceForm.workspaceName.trim()) {
      return;
    }

    setFeedback(null);
    startTransition(() => {
      void (async () => {
        try {
          const response = await fetch("/api/superuser/workspace", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              workspaceName: createWorkspaceForm.workspaceName.trim(),
              companyWebsite: createWorkspaceForm.companyWebsite.trim()
            })
          });
          const result = (await response.json().catch(() => null)) as { error?: string; id?: string; name?: string; slug?: string; website?: string } | null;

          if (!response.ok || !result?.id || !result.name || !result.slug) {
            throw new Error(result?.error || "Unable to create workspace");
          }

          const nextWorkspace: ManagedWorkspace = {
            id: result.id,
            name: result.name,
            slug: result.slug,
            website: result.website || "",
            createdAt: new Date().toISOString(),
            ownerName: currentUserName,
            ownerEmail: currentUserEmail,
            memberCount: 1,
            activeMembers: 1,
            pendingInvites: 0,
            totalRecords: 0,
            smtpConfigured: false,
            imapConfigured: false,
            profileName: currentUserName,
            profileEmail: currentUserEmail,
            personalMeetingSlug: result.slug,
            essentials: defaultEssentialsState
          };

          setWorkspaceRows((current) => [nextWorkspace, ...current]);
          setSelectedWorkspaceId(result.id);
          setCreateWorkspaceForm(defaultCreateWorkspaceForm);
          setFeedback("Workspace created.");
          router.refresh();
        } catch (error) {
          setFeedback(error instanceof Error ? error.message : "Unable to create workspace");
        }
      })();
    });
  };

  const deleteWorkspace = (workspaceId: string, workspaceName: string) => {
    void (async () => {
      const approved = await confirm({
        title: "Delete this workspace?",
        description: "All workspace data will be removed. Members will lose workspace access until reassigned.",
        confirmLabel: "Delete workspace",
        tone: "danger"
      });

      if (!approved) {
        return;
      }

      setFeedback(null);
      startTransition(() => {
        void (async () => {
          try {
            const response = await fetch(`/api/superuser/workspace/${workspaceId}`, {
              method: "DELETE"
            });
            const result = (await response.json().catch(() => null)) as { error?: string } | null;

            if (!response.ok) {
              throw new Error(result?.error || "Unable to delete workspace");
            }

            setWorkspaceRows((current) => {
              const next = current.filter((workspace) => workspace.id !== workspaceId);
              if (selectedWorkspaceId === workspaceId) {
                setSelectedWorkspaceId(next[0]?.id || "");
              }
              return next;
            });
            setUserRows((current) =>
              current.map((user) =>
                user.workspaceId === workspaceId
                  ? {
                      ...user,
                      workspaceId: null,
                      workspaceName: null,
                      onboardingCompleted: false
                    }
                  : user
              )
            );
            setFeedback(`Workspace "${workspaceName}" deleted.`);
          } catch (error) {
            setFeedback(error instanceof Error ? error.message : "Unable to delete workspace");
          }
        })();
      });
    })();
  };

  return (
    <div className="flex min-h-[calc(100vh-88px)] gap-6">

      {/* ── Desktop sidebar nav ── */}
      <aside className="hidden w-52 shrink-0 lg:block">
        <div className="sticky top-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Control Panel</p>
          </div>
          <nav className="p-2.5">
            {panelItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePanel === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActivePanel(item.id)}
                  className={`mb-0.5 flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-left transition ${
                    isActive
                      ? "bg-[#386df4] text-white shadow-[0_4px_12px_rgba(56,109,244,0.3)]"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium leading-none">{item.label}</div>
                    <div className={`mt-1 truncate text-[11px] leading-none ${isActive ? "text-blue-100" : "text-slate-400"}`}>{item.meta}</div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* ── Mobile top nav ── */}
      <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1 lg:hidden">
        {panelItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActivePanel(item.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                isActive ? "bg-[#386df4] text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* ── Main content ── */}
      <div className="min-w-0 flex-1">
        {feedback ? <FeedbackToast message={feedback} position="inline" /> : null}

        {/* OVERVIEW */}
        {activePanel === "overview" ? (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Overview</h1>
                <p className="mt-0.5 text-sm text-slate-500">Platform-wide health at a glance.</p>
              </div>
              <span className="shrink-0 rounded-full border border-[#c3f0d8] bg-[#eefbf5] px-3 py-1 text-xs font-semibold text-[#1fa261]">Live</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {/* Users */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Users</span>
                  <div className="rounded-2xl bg-[#eef4ff] p-2.5 text-[#386df4]"><Users className="h-4 w-4" /></div>
                </div>
                <div className="mt-3 text-[2rem] font-semibold tracking-tight text-slate-900">{userRows.length}</div>
                <div className="mt-2.5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-[#386df4] transition-all" style={{ width: userRows.length ? `${Math.round((overview.activeUsers / userRows.length) * 100)}%` : "0%" }} />
                  </div>
                  <span className="text-xs text-slate-400">{overview.activeUsers} active</span>
                </div>
                {overview.suspendedUsers > 0 ? <div className="mt-1.5 text-xs text-[#d25d37]">{overview.suspendedUsers} suspended</div> : null}
              </div>

              {/* Workspaces */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Workspaces</span>
                  <div className="rounded-2xl bg-[#fff7e8] p-2.5 text-[#c68a16]"><Building2 className="h-4 w-4" /></div>
                </div>
                <div className="mt-3 text-[2rem] font-semibold tracking-tight text-slate-900">{workspaceRows.length || overview.totalWorkspaces}</div>
                <div className="mt-2.5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-[#c68a16] transition-all" style={{ width: workspaceRows.length ? `${Math.round((configuredWorkspaceCount / workspaceRows.length) * 100)}%` : "0%" }} />
                  </div>
                  <span className="text-xs text-slate-400">{configuredWorkspaceCount} with mail</span>
                </div>
              </div>

              {/* Pending invites */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Pending invites</span>
                  <div className="rounded-2xl bg-[#f7f1ff] p-2.5 text-[#6b4fe0]"><Mail className="h-4 w-4" /></div>
                </div>
                <div className="mt-3 text-[2rem] font-semibold tracking-tight text-slate-900">{overview.pendingInvites}</div>
                <div className="mt-2.5 text-sm text-slate-400">Awaiting sign-up</div>
              </div>

              {/* CRM records */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">CRM records</span>
                  <div className="rounded-2xl bg-[#eefbf5] p-2.5 text-[#1fa261]"><Globe2 className="h-4 w-4" /></div>
                </div>
                <div className="mt-3 text-[2rem] font-semibold tracking-tight text-slate-900">{overview.totalRecords}</div>
                <div className="mt-2.5 text-xs text-slate-400">Leads · contacts · tasks · email · meetings</div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
              <div className="border-b border-slate-100 bg-[#f8fbff] px-5 py-4">
                <h3 className="text-sm font-semibold text-slate-900">Quick actions</h3>
              </div>
              <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
                <button type="button" onClick={() => setActivePanel("users")} className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-[#386df4]/40 hover:bg-[#f8fbff]">
                  <UserPlus className="h-4 w-4 shrink-0 text-[#386df4]" />
                  <span className="text-sm font-medium text-slate-700">Create user</span>
                </button>
                <button type="button" onClick={() => setActivePanel("workspaces")} className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-[#c68a16]/40 hover:bg-[#fffbf2]">
                  <Plus className="h-4 w-4 shrink-0 text-[#c68a16]" />
                  <span className="text-sm font-medium text-slate-700">New workspace</span>
                </button>
                <button type="button" onClick={() => setActivePanel("platform")} className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-[#6b4fe0]/40 hover:bg-[#f9f7ff]">
                  <Globe2 className="h-4 w-4 shrink-0 text-[#6b4fe0]" />
                  <span className="text-sm font-medium text-slate-700">Platform defaults</span>
                </button>
                <button type="button" onClick={() => setActivePanel("workspace")} className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-[#1fa261]/40 hover:bg-[#f5fdf9]">
                  <Shield className="h-4 w-4 shrink-0 text-[#1fa261]" />
                  <span className="text-sm font-medium text-slate-700">Workspace editor</span>
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* USERS */}
        {activePanel === "users" ? (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Users</h1>
                <p className="mt-0.5 text-sm text-slate-500">Create accounts, assign workspaces, and manage access roles.</p>
              </div>
              <span className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600">{userRows.length} total</span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className={inputIconWrapperClassName} />
              <input ref={searchInputRef} className={inputWithIconClassName} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, email, workspace, or role…" />
            </div>

            {/* Add user form */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
              <div className="flex items-center gap-2.5 border-b border-slate-100 bg-[#f8fbff] px-5 py-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#386df4]/10">
                  <UserPlus className="h-3.5 w-3.5 text-[#386df4]" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">New user</h3>
              </div>
              <div className="p-5">
                <div className="grid gap-3 md:grid-cols-2">
                  <IconInput icon={User} placeholder="Full name" value={createUserForm.fullName} onChange={(event) => setCreateUserForm((current) => ({ ...current, fullName: event.target.value }))} disabled={isPending} />
                  <IconInput icon={Mail} placeholder="email@company.com" value={createUserForm.email} onChange={(event) => setCreateUserForm((current) => ({ ...current, email: event.target.value }))} disabled={isPending} />
                  <IconInput icon={KeyRound} placeholder="Temporary password" type="password" value={createUserForm.password} onChange={(event) => setCreateUserForm((current) => ({ ...current, password: event.target.value }))} disabled={isPending} />
                  <IconSelect icon={Shield} value={createUserForm.accessRole} onChange={(event) => setCreateUserForm((current) => ({ ...current, accessRole: event.target.value }))} disabled={isPending}>
                    {superuserAccessRoleOptions.map((role) => (
                      <option key={role} value={role}>{getAccessRoleLabel(role)}</option>
                    ))}
                  </IconSelect>
                  <IconInput icon={Briefcase} placeholder="Job title (optional)" value={createUserForm.jobRole} onChange={(event) => setCreateUserForm((current) => ({ ...current, jobRole: event.target.value }))} disabled={isPending} />
                  <IconSelect icon={Building2} value={createUserForm.workspaceId} onChange={(event) => setCreateUserForm((current) => ({ ...current, workspaceId: event.target.value }))} disabled={isPending}>
                    <option value="">No workspace yet</option>
                    {workspaceRows.map((workspace) => (
                      <option key={workspace.id} value={workspace.id}>{workspace.name}</option>
                    ))}
                  </IconSelect>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                      setFeedback(null);
                      startTransition(() => {
                        void (async () => {
                          try {
                            const response = await fetch("/api/superuser/users", {
                              method: "POST",
                              headers: { "content-type": "application/json" },
                              body: JSON.stringify({ ...createUserForm, workspaceId: createUserForm.workspaceId || null })
                            });
                            const result = (await response.json().catch(() => null)) as { error?: string; user?: ManagedUser } | null;
                            if (!response.ok || !result?.user) throw new Error(result?.error || "Unable to create user");
                            setUserRows((current) => [result.user!, ...current]);
                            setWorkspaceRows((current) =>
                              current.map((workspace) =>
                                workspace.id === result.user?.workspaceId
                                  ? { ...workspace, memberCount: workspace.memberCount + 1, activeMembers: result.user?.status === "ACTIVE" ? workspace.activeMembers + 1 : workspace.activeMembers }
                                  : workspace
                              )
                            );
                            setCreateUserForm({ ...defaultCreateUserForm, workspaceId: selectedWorkspaceId });
                            setFeedback("User created successfully.");
                            router.refresh();
                          } catch (error) {
                            setFeedback(error instanceof Error ? error.message : "Unable to create user");
                          }
                        })();
                      });
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#386df4] px-5 py-2.5 text-sm font-medium text-white shadow-[0_4px_12px_rgba(56,109,244,0.25)] transition hover:bg-[#2f5fe0] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Plus className="h-4 w-4" />
                    {isPending ? "Creating…" : "Create user"}
                  </button>
                </div>
              </div>
            </div>

            {/* User list */}
            <div className="space-y-3">
              {filteredUsers.length ? (
                filteredUsers.map((user) => {
                  const isCurrentUser = user.id === currentUserId;
                  return (
                    <div key={user.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
                      {/* User header row */}
                      <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            name={user.fullName}
                            imageUrl={user.avatarUrl}
                            className="h-10 w-10 rounded-xl text-sm"
                            fallbackClassName="bg-gradient-to-br from-[#eef4ff] to-[#dbe8ff] text-[#386df4]"
                          />
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-slate-900">{user.fullName}</span>
                              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${roleTone(user.accessRole)}`}>{getAccessRoleLabel(user.accessRole)}</span>
                              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusTone(user.status)}`}>{getMemberStatusLabel(user.status)}</span>
                              {isCurrentUser ? <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">You</span> : null}
                            </div>
                            <div className="mt-0.5 text-sm text-slate-500">{user.email}</div>
                            <div className="mt-1 text-xs text-slate-400">
                              Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                              {user.lastActiveAt ? ` · Active ${formatDistanceToNow(new Date(user.lastActiveAt), { addSuffix: true })}` : " · Never active"}
                            </div>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            type="button"
                            onClick={() => patchUser(user.id, { fullName: user.fullName, email: user.email, accessRole: user.accessRole, status: user.status, workspaceId: user.workspaceId, jobRole: user.jobRole || "", onboardingCompleted: user.onboardingCompleted }, "User updated.")}
                            disabled={isPending}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#386df4] px-3.5 py-2 text-sm font-medium text-white transition hover:bg-[#2f5fe0] disabled:opacity-60"
                          >
                            <Save className="h-3.5 w-3.5" />
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              void (async () => {
                                const approved = await confirm({ title: "Delete this user?", description: "The account will be removed permanently. This cannot be undone.", confirmLabel: "Delete user", tone: "danger" });
                                if (!approved) return;
                                setFeedback(null);
                                startTransition(() => {
                                  void (async () => {
                                    try {
                                      const response = await fetch(`/api/superuser/users/${user.id}`, { method: "DELETE" });
                                      const result = (await response.json().catch(() => null)) as { error?: string } | null;
                                      if (!response.ok) throw new Error(result?.error || "Unable to delete user");
                                      setUserRows((current) => current.filter((item) => item.id !== user.id));
                                      setWorkspaceRows((current) => current.map((workspace) => workspace.id === user.workspaceId ? { ...workspace, memberCount: Math.max(0, workspace.memberCount - 1), activeMembers: user.status === "ACTIVE" ? Math.max(0, workspace.activeMembers - 1) : workspace.activeMembers } : workspace));
                                      setFeedback("User deleted.");
                                      router.refresh();
                                    } catch (error) {
                                      setFeedback(error instanceof Error ? error.message : "Unable to delete user");
                                    }
                                  })();
                                });
                              })();
                            }}
                            disabled={isPending || isCurrentUser}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#ffd9d1] bg-[#fff7f5] px-3.5 py-2 text-sm font-medium text-[#c04d2a] transition hover:bg-[#fff1ed] disabled:opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                      {/* Editable fields */}
                      <div className="border-t border-slate-100 bg-[#fafbfe] px-5 py-4">
                        <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
                          <input className={inputClassName} value={user.fullName} onChange={(event) => setUserRows((current) => current.map((row) => row.id === user.id ? { ...row, fullName: event.target.value } : row))} disabled={isPending} placeholder="Full name" />
                          <input className={inputClassName} value={user.email} onChange={(event) => setUserRows((current) => current.map((row) => row.id === user.id ? { ...row, email: event.target.value } : row))} disabled={isPending} placeholder="Email" />
                          <AppSelect className={selectClassName} value={user.workspaceId || ""} onChange={(event) => { const ws = workspaceRows.find((w) => w.id === event.target.value) || null; setUserRows((current) => current.map((row) => row.id === user.id ? { ...row, workspaceId: ws?.id || null, workspaceName: ws?.name || null } : row)); }} disabled={isPending}>
                            <option value="">No workspace</option>
                            {workspaceRows.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                          </AppSelect>
                          <input className={inputClassName} value={user.jobRole || ""} onChange={(event) => setUserRows((current) => current.map((row) => row.id === user.id ? { ...row, jobRole: event.target.value } : row))} disabled={isPending} placeholder="Job title" />
                          <AppSelect className={selectClassName} value={user.accessRole} onChange={(event) => setUserRows((current) => current.map((row) => row.id === user.id ? { ...row, accessRole: event.target.value } : row))} disabled={isPending}>
                            {superuserAccessRoleOptions.map((role) => <option key={role} value={role}>{getAccessRoleLabel(role)}</option>)}
                          </AppSelect>
                          <AppSelect className={selectClassName} value={user.status} onChange={(event) => setUserRows((current) => current.map((row) => row.id === user.id ? { ...row, status: event.target.value } : row))} disabled={isPending}>
                            {teamStatusOptions.map((s) => <option key={s} value={s}>{getMemberStatusLabel(s)}</option>)}
                          </AppSelect>
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                          <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                            <input type="checkbox" className={checkboxClassName} checked={user.onboardingCompleted} onChange={(event) => setUserRows((current) => current.map((row) => row.id === user.id ? { ...row, onboardingCompleted: event.target.checked } : row))} disabled={isPending} />
                            Onboarding completed
                          </label>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <div className="relative flex-1">
                            <KeyRound className={inputIconWrapperClassName} />
                            <input
                              type="password"
                              className={inputWithIconClassName}
                              value={userPasswordMap[user.id] || ""}
                              onChange={(event) => setUserPasswordMap((current) => ({ ...current, [user.id]: event.target.value }))}
                              placeholder="Set new password…"
                              disabled={isPending}
                            />
                          </div>
                          {userPasswordMap[user.id] ? (
                            <button
                              type="button"
                              onClick={() => resetUserPassword(user.id, userPasswordMap[user.id] || "")}
                              disabled={isPending || (userPasswordMap[user.id]?.length ?? 0) < 8}
                              className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-[#386df4] px-3.5 py-2.5 text-sm font-medium text-white transition hover:bg-[#2f5fe0] disabled:opacity-60"
                            >
                              <KeyRound className="h-3.5 w-3.5" />
                              Set
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-12 text-center text-sm text-slate-400">No users match this search.</div>
              )}
            </div>
          </div>
        ) : null}

        {/* WORKSPACES */}
        {activePanel === "workspaces" ? (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Workspaces</h1>
                <p className="mt-0.5 text-sm text-slate-500">Create tenants, inspect health, and open the workspace editor.</p>
              </div>
              <span className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600">{workspaceRows.length} total</span>
            </div>

            {/* Create workspace */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
              <div className="flex items-center gap-2.5 border-b border-slate-100 bg-[#f8fbff] px-5 py-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#386df4]/10">
                  <Plus className="h-3.5 w-3.5 text-[#386df4]" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">New workspace</h3>
              </div>
              <div className="grid gap-3 p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                <IconInput icon={Building2} value={createWorkspaceForm.workspaceName} onChange={(event) => setCreateWorkspaceForm((current) => ({ ...current, workspaceName: event.target.value }))} placeholder="Workspace name" disabled={isPending} />
                <IconInput icon={Globe2} value={createWorkspaceForm.companyWebsite} onChange={(event) => setCreateWorkspaceForm((current) => ({ ...current, companyWebsite: event.target.value }))} placeholder="Company website" disabled={isPending} />
                <button type="button" onClick={createWorkspace} disabled={isPending || !createWorkspaceForm.workspaceName.trim()} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#386df4] px-4 py-2.5 text-sm font-medium text-white shadow-[0_4px_12px_rgba(56,109,244,0.25)] transition hover:bg-[#2f5fe0] disabled:cursor-not-allowed disabled:opacity-60">
                  <Plus className="h-4 w-4" />
                  Create
                </button>
              </div>
            </div>

            {/* Workspace list */}
            <div className="space-y-3">
              {workspaceRows.length ? workspaceRows.map((workspace) => {
                const active = workspace.id === selectedWorkspaceId;
                return (
                  <div key={workspace.id} className={`overflow-hidden rounded-2xl border transition ${active ? "border-[#b6d0ff] bg-white shadow-[0_0_0_3px_rgba(56,109,244,0.08)]" : "border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]"}`}>
                    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <button type="button" onClick={() => { setSelectedWorkspaceId(workspace.id); setActivePanel("workspace"); }} className="min-w-0 text-left">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-slate-900">{workspace.name}</span>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">{workspace.slug}</span>
                          {active ? <span className="rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-[11px] font-semibold text-[#386df4]">Selected</span> : null}
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          {workspace.ownerName || "No owner"}{workspace.ownerEmail ? ` · ${workspace.ownerEmail}` : ""}
                          {workspace.website ? ` · ${workspace.website}` : ""}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <span className="rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-[11px] font-semibold text-[#386df4]">{workspace.memberCount} members</span>
                          <span className="rounded-full bg-[#eefbf5] px-2.5 py-0.5 text-[11px] font-semibold text-[#1fa261]">{workspace.activeMembers} active</span>
                          <span className="rounded-full bg-[#fff7e8] px-2.5 py-0.5 text-[11px] font-semibold text-[#c68a16]">{workspace.totalRecords} records</span>
                          {workspace.smtpConfigured ? <span className="rounded-full bg-[#eefbf5] px-2.5 py-0.5 text-[11px] font-semibold text-[#1fa261]">SMTP ✓</span> : null}
                        </div>
                      </button>
                      <div className="flex shrink-0 items-center gap-2">
                        <button type="button" onClick={() => { setSelectedWorkspaceId(workspace.id); setActivePanel("workspace"); }} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                          <Shield className="h-3.5 w-3.5 text-slate-400" />
                          Manage
                        </button>
                        <button type="button" onClick={() => deleteWorkspace(workspace.id, workspace.name)} disabled={isPending || workspace.id === currentUserWorkspaceId} className="inline-flex items-center gap-1.5 rounded-xl border border-[#ffd9d1] bg-[#fff7f5] px-3.5 py-2 text-sm font-medium text-[#c04d2a] transition hover:bg-[#fff1ed] disabled:opacity-50">
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }) : <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-12 text-center text-sm text-slate-400">No workspaces yet.</div>}
            </div>
          </div>
        ) : null}

        {/* PLATFORM */}
        {activePanel === "platform" ? (
          <div className="space-y-5">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Platform defaults</h1>
              <p className="mt-0.5 text-sm text-slate-500">Runtime values that override <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">.env</code> across all tenants.</p>
            </div>

            {/* Branding */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
              <div className="flex items-center gap-2.5 border-b border-slate-100 bg-[#f8fbff] px-5 py-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#386df4]/10">
                  <Shield className="h-3.5 w-3.5 text-[#386df4]" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Branding</h3>
              </div>
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-[#f8fbff]">
                      {logoPreview || platformState.appLogoUrl ? (
                        <img src={logoPreview || platformState.appLogoUrl} alt="Logo" className="h-full w-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-slate-400">No logo</span>
                      )}
                    </div>
                    <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; setLogoFile(file); const reader = new FileReader(); reader.onload = (e) => setLogoPreview(e.target?.result as string); reader.readAsDataURL(file); }} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => logoInputRef.current?.click()} disabled={isUploadingLogo} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60">
                        <Upload className="h-3.5 w-3.5" />
                        Choose file
                      </button>
                      {logoFile ? (
                        <button type="button" onClick={() => void uploadLogo()} disabled={isUploadingLogo} className="inline-flex items-center gap-1.5 rounded-xl bg-[#386df4] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#2f5fe0] disabled:opacity-60">
                          <Save className="h-3.5 w-3.5" />
                          {isUploadingLogo ? "Uploading…" : "Upload logo"}
                        </button>
                      ) : null}
                      {platformState.appLogoUrl && !logoFile ? (
                        <button type="button" onClick={() => void removeLogo()} disabled={isUploadingLogo} className="inline-flex items-center gap-1.5 rounded-xl border border-[#ffd9d1] bg-[#fff7f5] px-3 py-2 text-sm font-medium text-[#c04d2a] transition hover:bg-[#fff1ed] disabled:opacity-60">
                          <X className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      ) : null}
                    </div>
                    <p className="text-xs text-slate-400">PNG, JPG, SVG or WebP · max 2 MB</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <IconInput icon={Shield} placeholder="App name" value={platformState.appName} onChange={(event) => setPlatformState((current) => ({ ...current, appName: event.target.value }))} disabled={isPending} />
                  <IconInput icon={Link2} placeholder="App URL" value={platformState.appUrl} onChange={(event) => setPlatformState((current) => ({ ...current, appUrl: event.target.value }))} disabled={isPending} />
                </div>
                <div className="mt-3">
                  <textarea placeholder="App description (shown on login page, emails, etc.)" value={platformState.appDescription} onChange={(event) => setPlatformState((current) => ({ ...current, appDescription: event.target.value }))} disabled={isPending} rows={2} className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/20 hover:border-slate-300 disabled:opacity-60" />
                </div>
              </div>
            </div>

            {/* Support & Tracking */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
              <div className="flex items-center gap-2.5 border-b border-slate-100 bg-[#f8fbff] px-5 py-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#386df4]/10">
                  <Mail className="h-3.5 w-3.5 text-[#386df4]" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Support &amp; tracking</h3>
              </div>
              <div className="space-y-3 p-5">
                <IconInput icon={Mail} placeholder="Support email" value={platformState.supportEmail} onChange={(event) => setPlatformState((current) => ({ ...current, supportEmail: event.target.value }))} disabled={isPending} />
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-slate-200 bg-[#f8fbff] px-4 py-3">
                  <span className="text-sm font-medium text-slate-700">Email tracking</span>
                  <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" className={checkboxClassName} checked={platformState.openTrackingEnabled} onChange={(event) => setPlatformState((current) => ({ ...current, openTrackingEnabled: event.target.checked }))} /> Open tracking</label>
                  <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" className={checkboxClassName} checked={platformState.clickTrackingEnabled} onChange={(event) => setPlatformState((current) => ({ ...current, clickTrackingEnabled: event.target.checked }))} /> Click tracking</label>
                </div>
              </div>
            </div>

            {/* SMTP */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
              <div className="flex items-center gap-2.5 border-b border-slate-100 bg-[#f8fbff] px-5 py-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#386df4]/10">
                  <Mail className="h-3.5 w-3.5 text-[#386df4]" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">SMTP — outgoing mail</h3>
              </div>
              <div className="grid gap-3 p-5 md:grid-cols-2">
                <IconInput icon={Mail} placeholder="SMTP host" value={platformState.smtpHost} onChange={(event) => setPlatformState((current) => ({ ...current, smtpHost: event.target.value }))} disabled={isPending} />
                <IconInput icon={Shield} placeholder="Port (e.g. 587)" value={platformState.smtpPort} onChange={(event) => setPlatformState((current) => ({ ...current, smtpPort: event.target.value }))} disabled={isPending} />
                <IconInput icon={User} placeholder="Username" value={platformState.smtpUser} onChange={(event) => setPlatformState((current) => ({ ...current, smtpUser: event.target.value }))} disabled={isPending} />
                <IconInput icon={KeyRound} placeholder="Password" value={platformState.smtpPass} onChange={(event) => setPlatformState((current) => ({ ...current, smtpPass: event.target.value }))} disabled={isPending} />
                <IconInput icon={Mail} placeholder="From address" value={platformState.smtpFrom} onChange={(event) => setPlatformState((current) => ({ ...current, smtpFrom: event.target.value }))} disabled={isPending} />
              </div>
            </div>

            {/* Google OAuth */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
              <div className="flex items-center gap-2.5 border-b border-slate-100 bg-[#f8fbff] px-5 py-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#386df4]/10">
                  <Globe2 className="h-3.5 w-3.5 text-[#386df4]" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Google OAuth</h3>
              </div>
              <div className="grid gap-3 p-5 md:grid-cols-2">
                <IconInput icon={Globe2} placeholder="Client ID" value={platformState.googleClientId} onChange={(event) => setPlatformState((current) => ({ ...current, googleClientId: event.target.value }))} disabled={isPending} />
                <IconInput icon={KeyRound} placeholder="Client secret" value={platformState.googleClientSecret} onChange={(event) => setPlatformState((current) => ({ ...current, googleClientSecret: event.target.value }))} disabled={isPending} />
              </div>
            </div>

            {/* OpenAI */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
              <div className="flex items-center gap-2.5 border-b border-slate-100 bg-[#f8fbff] px-5 py-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#386df4]/10">
                  <Globe2 className="h-3.5 w-3.5 text-[#386df4]" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">OpenAI / Email AI</h3>
              </div>
              <div className="p-5">
                <div className="grid gap-3 md:grid-cols-2">
                  <IconInput icon={KeyRound} type="password" placeholder="API key" value={platformState.openAiApiKey} onChange={(event) => setPlatformState((current) => ({ ...current, openAiApiKey: event.target.value }))} disabled={isPending} />
                  <IconInput icon={Globe2} placeholder="Model (e.g. gpt-4o-mini)" value={platformState.openAiModel} onChange={(event) => setPlatformState((current) => ({ ...current, openAiModel: event.target.value }))} disabled={isPending} />
                </div>
                <p className="mt-3 text-xs text-slate-400">Falls back to <code className="rounded bg-slate-100 px-1 py-0.5">OPENAI_API_KEY</code> in <code className="rounded bg-slate-100 px-1 py-0.5">.env</code> if empty.</p>
              </div>
            </div>

            {/* Save bar */}
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#b6d0ff] bg-[#eef4ff] px-5 py-3.5">
              <p className="text-sm text-[#386df4]">Changes override <code className="rounded bg-[#dce9ff] px-1.5 py-0.5 text-xs">.env</code> at runtime for all platform paths.</p>
              <button type="button" onClick={savePlatformSettings} disabled={isPending} className="inline-flex items-center gap-2 rounded-xl bg-[#386df4] px-5 py-2.5 text-sm font-medium text-white shadow-[0_4px_12px_rgba(56,109,244,0.25)] transition hover:bg-[#2f5fe0] disabled:cursor-not-allowed disabled:opacity-60">
                <Save className="h-4 w-4" />
                {isPending ? "Saving…" : "Save platform"}
              </button>
            </div>
          </div>
        ) : null}

        {/* WORKSPACE EDITOR */}
        {activePanel === "workspace" ? (
          selectedWorkspace ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">{selectedWorkspace.name}</h1>
                  <p className="mt-0.5 text-sm text-slate-500">Manage identity, mail defaults, and localization for this workspace.</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-1.5">
                  <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold text-[#386df4]">{selectedWorkspace.memberCount} members</span>
                  <span className="rounded-full bg-[#fff7e8] px-3 py-1 text-xs font-semibold text-[#c68a16]">{selectedWorkspace.totalRecords} records</span>
                </div>
              </div>

              {/* Workspace identity */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
                <div className="flex items-center gap-2.5 border-b border-slate-100 bg-[#f8fbff] px-5 py-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#386df4]/10">
                    <Building2 className="h-3.5 w-3.5 text-[#386df4]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Identity</h3>
                    <p className="text-xs text-slate-400">Workspace name and meeting scheduler profile.</p>
                  </div>
                </div>
                <div className="space-y-4 p-5">
                  <div className="grid gap-3 md:grid-cols-2">
                    <IconInput icon={Building2} value={workspaceState.workspaceName} onChange={(event) => setWorkspaceState((current) => ({ ...current, workspaceName: event.target.value }))} placeholder="Workspace name" disabled={isPending} />
                    <IconInput icon={Link2} value={workspaceState.workspaceSlug} onChange={(event) => setWorkspaceState((current) => ({ ...current, workspaceSlug: event.target.value.toLowerCase() }))} placeholder="Workspace slug" disabled={isPending} />
                    <div className="md:col-span-2">
                      <IconInput icon={Globe2} value={workspaceState.companyWebsite} onChange={(event) => setWorkspaceState((current) => ({ ...current, companyWebsite: event.target.value }))} placeholder="Company website" disabled={isPending} />
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-medium text-slate-500">Meeting scheduler — shown on the public booking page</p>
                    <div className="grid gap-3 md:grid-cols-2">
                      <IconInput icon={User} value={workspaceState.profileName} onChange={(event) => setWorkspaceState((current) => ({ ...current, profileName: event.target.value }))} placeholder="Host display name" disabled={isPending} />
                      <IconInput icon={Mail} value={workspaceState.profileEmail} onChange={(event) => setWorkspaceState((current) => ({ ...current, profileEmail: event.target.value }))} placeholder="Host email" disabled={isPending} />
                      <div className="md:col-span-2">
                        <IconInput icon={Link2} value={workspaceState.personalMeetingSlug} onChange={(event) => setWorkspaceState((current) => ({ ...current, personalMeetingSlug: event.target.value.toLowerCase() }))} placeholder="booking-slug  →  /meet/booking-slug" disabled={isPending} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end border-t border-slate-100 px-5 py-3.5">
                  <button type="button" onClick={saveWorkspaceProfile} disabled={isPending || !workspaceState.workspaceName.trim() || !workspaceState.profileEmail.trim()} className="inline-flex items-center gap-2 rounded-xl bg-[#386df4] px-5 py-2.5 text-sm font-medium text-white shadow-[0_4px_12px_rgba(56,109,244,0.25)] transition hover:bg-[#2f5fe0] disabled:opacity-60">
                    <Save className="h-4 w-4" />
                    {isPending ? "Saving…" : "Save identity"}
                  </button>
                </div>
              </div>

              {/* Localization */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
                <div className="flex items-center gap-2.5 border-b border-slate-100 bg-[#f8fbff] px-5 py-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#386df4]/10">
                    <Globe2 className="h-3.5 w-3.5 text-[#386df4]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Localization</h3>
                    <p className="text-xs text-slate-400">Regional defaults — used for date/time display, number formatting, and scheduling.</p>
                  </div>
                </div>
                <div className="p-5">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-500">Timezone</label>
                      <AppSelect className={selectClassName} value={essentialsState.timezone} onChange={(event) => setEssentialsState((current) => ({ ...current, timezone: event.target.value }))} disabled={isPending}>
                        <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                        <option value="Asia/Dubai">Asia/Dubai (GST +4)</option>
                        <option value="Asia/Singapore">Asia/Singapore (SGT +8)</option>
                        <option value="Europe/London">Europe/London (GMT/BST)</option>
                        <option value="Europe/Paris">Europe/Paris (CET +1)</option>
                        <option value="America/New_York">America/New_York (EST -5)</option>
                        <option value="America/Chicago">America/Chicago (CST -6)</option>
                        <option value="America/Los_Angeles">America/Los_Angeles (PST -8)</option>
                        <option value="UTC">UTC</option>
                      </AppSelect>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-500">Currency</label>
                      <AppSelect className={selectClassName} value={essentialsState.currencyCode} onChange={(event) => setEssentialsState((current) => ({ ...current, currencyCode: event.target.value }))} disabled={isPending}>
                        <option value="INR">INR — Indian Rupee</option>
                        <option value="USD">USD — US Dollar</option>
                        <option value="EUR">EUR — Euro</option>
                        <option value="GBP">GBP — British Pound</option>
                        <option value="AED">AED — UAE Dirham</option>
                        <option value="SGD">SGD — Singapore Dollar</option>
                        <option value="AUD">AUD — Australian Dollar</option>
                        <option value="CAD">CAD — Canadian Dollar</option>
                      </AppSelect>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-500">Date format</label>
                      <AppSelect className={selectClassName} value={essentialsState.dateFormat} onChange={(event) => setEssentialsState((current) => ({ ...current, dateFormat: event.target.value }))} disabled={isPending}>
                        <option value="DD MMM YYYY">DD MMM YYYY  (12 Jan 2025)</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY  (12/01/2025)</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY  (01/12/2025)</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD  (2025-01-12)</option>
                      </AppSelect>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-500">Time format</label>
                      <AppSelect className={selectClassName} value={essentialsState.timeFormat} onChange={(event) => setEssentialsState((current) => ({ ...current, timeFormat: event.target.value }))} disabled={isPending}>
                        <option value="12h">12h  (2:30 PM)</option>
                        <option value="24h">24h  (14:30)</option>
                      </AppSelect>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-500">Week starts on</label>
                      <AppSelect className={selectClassName} value={essentialsState.weekStartsOn} onChange={(event) => setEssentialsState((current) => ({ ...current, weekStartsOn: event.target.value }))} disabled={isPending}>
                        <option value="Monday">Monday</option>
                        <option value="Sunday">Sunday</option>
                        <option value="Saturday">Saturday</option>
                      </AppSelect>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-500">Country code</label>
                      <input className={inputClassName} value={essentialsState.countryCode} onChange={(event) => setEssentialsState((current) => ({ ...current, countryCode: event.target.value.toUpperCase() }))} placeholder="e.g. IN" maxLength={2} disabled={isPending} />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end border-t border-slate-100 px-5 py-3.5">
                  <button type="button" onClick={saveEssentials} disabled={isPending} className="inline-flex items-center gap-2 rounded-xl bg-[#386df4] px-5 py-2.5 text-sm font-medium text-white shadow-[0_4px_12px_rgba(56,109,244,0.25)] transition hover:bg-[#2f5fe0] disabled:opacity-60">
                    <Save className="h-4 w-4" />
                    {isPending ? "Saving…" : "Save localization"}
                  </button>
                </div>
              </div>

              {/* Snapshot stats */}
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Members", value: String(selectedWorkspace.memberCount) },
                  { label: "Active members", value: String(selectedWorkspace.activeMembers) },
                  { label: "Pending invites", value: String(selectedWorkspace.pendingInvites) },
                  { label: "Total records", value: String(selectedWorkspace.totalRecords) }
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
                    <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-8 py-16 text-center shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
              <Building2 className="mb-3 h-8 w-8 text-slate-300" />
              <p className="text-sm font-medium text-slate-500">No workspace selected</p>
              <p className="mt-1 text-sm text-slate-400">Go to <button type="button" onClick={() => setActivePanel("workspaces")} className="text-[#386df4] hover:underline">Workspaces</button> and click Manage on any workspace.</p>
            </div>
          )
        ) : null}
      </div>

      {confirmationDialog}
    </div>
  );
}

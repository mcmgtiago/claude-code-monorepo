import { DEFAULT_TAGS, PROJECT_TYPES, type TagDefinition } from "@/components/projects/tasks-board/shared";

export type WorkspaceFormState = {
  name: string;
  slug: string;
  supportEmail: string;
  timezone: string;
  region: string;
  owner: string;
  invitePolicy: "admins-only" | "members-with-approval" | "open";
  approvalFlow: boolean;
  digest: boolean;
};

export type NotificationPreferences = {
  email: boolean;
  push: boolean;
  inApp: boolean;
  sound: boolean;
  tasks: boolean;
  mentions: boolean;
  team: boolean;
  digest: boolean;
};

export type BillingHistoryItem = {
  id: string;
  date: string;
  amount: string;
  status: "Paid" | "Pending" | "Failed";
  invoiceNumber?: string;
  currency?: string;
  planName?: string;
  renewalDate?: string;
  receipt?: string;
  amountSubunits?: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
};

export type PlanSettings = {
  name: string;
  priceMonthly: number;
  renewsOn: string;
  teamMembersUsed: number;
  teamMembersLimit: number;
  projectsUsed: number;
  projectsLimit: number;
  storageUsedGb: number;
  storageLimitGb: number;
  billingHistory: BillingHistoryItem[];
};

export type SavedDevice = {
  id: string;
  device: string;
  location: string;
  date: string;
  active: boolean;
  reported?: boolean;
};

export type SettingsBundle = {
  workspace: WorkspaceFormState;
  notifications: NotificationPreferences;
  plan: PlanSettings;
  devices: SavedDevice[];
  projectTags: TagDefinition[];
  projectTypes: string[];
};

export const defaultWorkspaceForm: WorkspaceFormState = {
  name: "Workspace",
  slug: "workspace",
  supportEmail: "",
  timezone: "UTC",
  region: "",
  owner: "",
  invitePolicy: "admins-only",
  approvalFlow: true,
  digest: true,
};

export const defaultNotificationPreferences: NotificationPreferences = {
  email: true,
  push: true,
  inApp: true,
  sound: false,
  tasks: true,
  mentions: true,
  team: false,
  digest: true,
};

export const PLAN_SETTINGS_PRESETS = {
  "Starter Plan": {
    name: "Starter Plan",
    priceMonthly: 0,
    teamMembersLimit: 5,
    projectsLimit: 3,
    storageLimitGb: 2,
  },
  "Pro Plan": {
    name: "Pro Plan",
    priceMonthly: 199,
    teamMembersLimit: 20,
    projectsLimit: 10,
    storageLimitGb: 10,
  },
  "Growth Plan": {
    name: "Growth Plan",
    priceMonthly: 599,
    teamMembersLimit: 50,
    projectsLimit: 30,
    storageLimitGb: 50,
  },
} as const satisfies Record<string, Pick<PlanSettings, "name" | "priceMonthly" | "teamMembersLimit" | "projectsLimit" | "storageLimitGb">>;

export function applyCanonicalPlanSettings(plan: PlanSettings): PlanSettings {
  const preset = PLAN_SETTINGS_PRESETS[plan.name as keyof typeof PLAN_SETTINGS_PRESETS];

  if (!preset) {
    return plan;
  }

  return {
    ...plan,
    ...preset,
    renewsOn: preset.name === "Starter Plan" ? "" : plan.renewsOn,
  };
}

export const defaultPlanSettings: PlanSettings = {
  ...PLAN_SETTINGS_PRESETS["Starter Plan"],
  renewsOn: "",
  teamMembersUsed: 0,
  projectsUsed: 0,
  storageUsedGb: 0,
  billingHistory: [],
};

export const defaultSavedDevices: SavedDevice[] = [];

function cloneDefaultProjectTags() {
  return DEFAULT_TAGS.map((tag) => ({ ...tag }));
}

export function applyCanonicalProjectTags(tags: TagDefinition[] | null | undefined): TagDefinition[] {
  if (!Array.isArray(tags)) {
    return cloneDefaultProjectTags();
  }

  const normalized: TagDefinition[] = [];
  const seenLabels = new Set<string>();

  for (const [index, tag] of tags.entries()) {
    const id = typeof tag?.id === "string" ? tag.id.trim() : "";
    const label = typeof tag?.label === "string" ? tag.label.trim() : "";
    const color = typeof tag?.color === "string" ? tag.color.trim() : "";
    const labelKey = label.toLowerCase();

    if (!label || !color || seenLabels.has(labelKey)) {
      continue;
    }

    seenLabels.add(labelKey);
    normalized.push({
      id: id || `tag-${index + 1}`,
      label,
      color,
    });
  }

  return normalized.length > 0 ? normalized : cloneDefaultProjectTags();
}

export function applyCanonicalProjectTypes(projectTypes: string[] | null | undefined): string[] {
  if (!Array.isArray(projectTypes)) {
    return [...PROJECT_TYPES];
  }

  const normalized: string[] = [];
  const seenTypes = new Set<string>();

  for (const projectType of projectTypes) {
    const value = typeof projectType === "string" ? projectType.trim() : "";
    const valueKey = value.toLowerCase();

    if (!value || seenTypes.has(valueKey)) {
      continue;
    }

    seenTypes.add(valueKey);
    normalized.push(value);
  }

  return normalized.length > 0 ? normalized : [...PROJECT_TYPES];
}

export const defaultSettingsBundle: SettingsBundle = {
  workspace: defaultWorkspaceForm,
  notifications: defaultNotificationPreferences,
  plan: defaultPlanSettings,
  devices: defaultSavedDevices,
  projectTags: cloneDefaultProjectTags(),
  projectTypes: [...PROJECT_TYPES],
};

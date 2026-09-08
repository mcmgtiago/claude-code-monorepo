import { getDbPool } from "@/lib/db";
import {
  applyCanonicalProjectTags,
  applyCanonicalProjectTypes,
  applyCanonicalPlanSettings,
  defaultNotificationPreferences,
  defaultPlanSettings,
  defaultSavedDevices,
  defaultWorkspaceForm,
  type NotificationPreferences,
  type PlanSettings,
  type SavedDevice,
  type SettingsBundle,
  type WorkspaceFormState,
} from "@/lib/settings";
import type { TagDefinition } from "@/components/projects/tasks-board/shared";
import { ensureUserProfileAndSelectedWorkspace } from "@/lib/workspace-selection";

type AuthLikeUser = {
  id: string;
  email?: string | null;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    full_name?: string;
    phone?: string;
  } | null;
};

type WorkspaceRow = {
  id: string;
  name: string;
  slug: string;
  support_email: string | null;
  timezone: string;
  region: string | null;
  invite_policy: WorkspaceFormState["invitePolicy"];
  approval_flow: boolean;
  digest: boolean;
  owner_name: string | null;
  project_tags: TagDefinition[] | null;
  project_types: string[] | null;
};

type UserSettingsRow = {
  notification_preferences: NotificationPreferences | null;
  billing_plan: PlanSettings | null;
  devices: SavedDevice[] | null;
};

function normalizeWorkspaceRow(row: WorkspaceRow): WorkspaceFormState {
  return {
    name: row.name || defaultWorkspaceForm.name,
    slug: row.slug || defaultWorkspaceForm.slug,
    supportEmail: row.support_email || defaultWorkspaceForm.supportEmail,
    timezone: row.timezone || defaultWorkspaceForm.timezone,
    region: row.region || defaultWorkspaceForm.region,
    owner: row.owner_name || defaultWorkspaceForm.owner,
    invitePolicy: row.invite_policy || defaultWorkspaceForm.invitePolicy,
    approvalFlow: row.approval_flow,
    digest: row.digest,
  };
}

function normalizeNotifications(value: NotificationPreferences | null | undefined) {
  return {
    ...defaultNotificationPreferences,
    ...(value ?? {}),
  };
}

function normalizePlan(value: PlanSettings | null | undefined) {
  return applyCanonicalPlanSettings({
    ...defaultPlanSettings,
    ...(value ?? {}),
    billingHistory: value?.billingHistory ?? defaultPlanSettings.billingHistory,
  });
}

function shouldPersistNormalizedPlan(
  rawPlan: PlanSettings | null | undefined,
  normalizedPlan: PlanSettings,
) {
  if (!rawPlan) {
    return false;
  }

  return rawPlan.name !== normalizedPlan.name
    || rawPlan.priceMonthly !== normalizedPlan.priceMonthly
    || rawPlan.renewsOn !== normalizedPlan.renewsOn
    || rawPlan.teamMembersLimit !== normalizedPlan.teamMembersLimit
    || rawPlan.projectsLimit !== normalizedPlan.projectsLimit
    || rawPlan.storageLimitGb !== normalizedPlan.storageLimitGb;
}

function normalizeDevices(value: SavedDevice[] | null | undefined) {
  return Array.isArray(value) && value.length > 0 ? value : defaultSavedDevices;
}

function normalizeProjectTags(value: TagDefinition[] | null | undefined) {
  return applyCanonicalProjectTags(value);
}

function normalizeProjectTypes(value: string[] | null | undefined) {
  return applyCanonicalProjectTypes(value);
}

export async function ensureAppUserSettings(userId: string) {
  const pool = getDbPool();
  await pool.query(
    `
      insert into public.app_user_settings (user_id)
      values ($1)
      on conflict (user_id) do nothing
    `,
    [userId],
  );
}

export async function getUserSettingsBundle(user: AuthLikeUser): Promise<SettingsBundle> {
  const { workspaceId } = await ensureUserProfileAndSelectedWorkspace(user);
  await ensureAppUserSettings(user.id);

  const pool = getDbPool();
  const [workspaceResult, settingsResult] = await Promise.all([
    pool.query<WorkspaceRow>(
      `
        select
          w.id,
          w.name,
          w.slug,
          w.support_email,
          w.timezone,
          w.region,
          w.invite_policy,
          w.approval_flow,
          w.digest,
          w.project_tags,
          w.project_types,
          coalesce(up.full_name, up.first_name, split_part(up.email, '@', 1)) as owner_name
        from public.workspaces w
        left join public.user_profiles up on up.id = w.owner_user_id
        where w.id = $1
        limit 1
      `,
      [workspaceId],
    ),
    pool.query<UserSettingsRow>(
      `
        select notification_preferences, billing_plan, devices
        from public.app_user_settings
        where user_id = $1
        limit 1
      `,
      [user.id],
    ),
  ]);

  const workspace = workspaceResult.rows[0]
    ? normalizeWorkspaceRow(workspaceResult.rows[0])
    : defaultWorkspaceForm;
  const settings = settingsResult.rows[0];
  const plan = normalizePlan(settings?.billing_plan);

  if (shouldPersistNormalizedPlan(settings?.billing_plan, plan)) {
    await pool.query(
      `
        update public.app_user_settings
        set billing_plan = $2::jsonb
        where user_id = $1
      `,
      [user.id, JSON.stringify(plan)],
    );
  }

  return {
    workspace,
    notifications: normalizeNotifications(settings?.notification_preferences),
    plan,
    devices: normalizeDevices(settings?.devices),
    projectTags: normalizeProjectTags(workspaceResult.rows[0]?.project_tags),
    projectTypes: normalizeProjectTypes(workspaceResult.rows[0]?.project_types),
  };
}

export async function updateWorkspaceSettings(user: AuthLikeUser, workspace: WorkspaceFormState) {
  const { workspaceId } = await ensureUserProfileAndSelectedWorkspace(user);
  const pool = getDbPool();
  await pool.query(
    `
      update public.user_profiles
      set full_name = $2
      where id = $1
    `,
    [user.id, workspace.owner.trim() || defaultWorkspaceForm.owner],
  );
  const result = await pool.query<WorkspaceRow>(
    `
      update public.workspaces
      set
        name = $2,
        slug = $3,
        support_email = $4,
        timezone = $5,
        region = $6,
        invite_policy = $7,
        approval_flow = $8,
        digest = $9
      where id = $1
      returning
        id,
        name,
        slug,
        support_email,
        timezone,
        region,
        invite_policy,
        approval_flow,
        digest,
        $10::text as owner_name
    `,
    [
      workspaceId,
      workspace.name.trim() || defaultWorkspaceForm.name,
      workspace.slug.trim() || defaultWorkspaceForm.slug,
      workspace.supportEmail.trim() || null,
      workspace.timezone.trim() || defaultWorkspaceForm.timezone,
      workspace.region.trim() || null,
      workspace.invitePolicy,
      workspace.approvalFlow,
      workspace.digest,
      workspace.owner.trim() || defaultWorkspaceForm.owner,
    ],
  );

  return result.rows[0] ? normalizeWorkspaceRow(result.rows[0]) : defaultWorkspaceForm;
}

export async function updateUserSettings(
  userId: string,
  patch: Partial<Pick<SettingsBundle, "notifications" | "plan" | "devices">>,
) {
  await ensureAppUserSettings(userId);

  const pool = getDbPool();
  const currentResult = await pool.query<UserSettingsRow>(
    `
      select notification_preferences, billing_plan, devices
      from public.app_user_settings
      where user_id = $1
      limit 1
    `,
    [userId],
  );
  const current = currentResult.rows[0];
  const notifications = patch.notifications
    ? normalizeNotifications(patch.notifications)
    : normalizeNotifications(current?.notification_preferences);
  const plan = patch.plan ? normalizePlan(patch.plan) : normalizePlan(current?.billing_plan);
  const devices = patch.devices ? normalizeDevices(patch.devices) : normalizeDevices(current?.devices);

  const result = await pool.query<UserSettingsRow>(
    `
      update public.app_user_settings
      set
        notification_preferences = $2::jsonb,
        billing_plan = $3::jsonb,
        devices = $4::jsonb
      where user_id = $1
      returning notification_preferences, billing_plan, devices
    `,
    [
      userId,
      JSON.stringify(notifications),
      JSON.stringify(plan),
      JSON.stringify(devices),
    ],
  );

  return {
    notifications: normalizeNotifications(result.rows[0]?.notification_preferences),
    plan: normalizePlan(result.rows[0]?.billing_plan),
    devices: normalizeDevices(result.rows[0]?.devices),
  };
}

export async function updateWorkspaceProjectDefaults(
  user: AuthLikeUser,
  patch: {
    projectTags?: TagDefinition[];
    projectTypes?: string[];
  },
) {
  const { workspaceId } = await ensureUserProfileAndSelectedWorkspace(user);
  const pool = getDbPool();
  const currentResult = await pool.query<Pick<WorkspaceRow, "project_tags" | "project_types">>(
    `
      select project_tags, project_types
      from public.workspaces
      where id = $1
      limit 1
    `,
    [workspaceId],
  );
  const current = currentResult.rows[0];
  const projectTags = patch.projectTags ? normalizeProjectTags(patch.projectTags) : normalizeProjectTags(current?.project_tags);
  const projectTypes = patch.projectTypes ? normalizeProjectTypes(patch.projectTypes) : normalizeProjectTypes(current?.project_types);

  const result = await pool.query<Pick<WorkspaceRow, "project_tags" | "project_types">>(
    `
      update public.workspaces
      set
        project_tags = $2::jsonb,
        project_types = $3::jsonb
      where id = $1
      returning project_tags, project_types
    `,
    [
      workspaceId,
      JSON.stringify(projectTags),
      JSON.stringify(projectTypes),
    ],
  );

  return {
    projectTags: normalizeProjectTags(result.rows[0]?.project_tags),
    projectTypes: normalizeProjectTypes(result.rows[0]?.project_types),
  };
}

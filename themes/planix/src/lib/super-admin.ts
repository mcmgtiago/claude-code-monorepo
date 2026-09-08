import { redirect } from "next/navigation";

import { getAppMasterSettings, type AppMasterSettings } from "@/lib/app-config";
import { BILLING_PLAN_ORDER } from "@/lib/billing-plans";
import { getDbPool, ensureUserProfileAndWorkspace } from "@/lib/db";
import { deleteAccountAndOwnedData } from "@/lib/destructive-actions";
import { ensureAppUserSettings } from "@/lib/settings-db";
import { PLAN_SETTINGS_PRESETS, applyCanonicalPlanSettings, defaultPlanSettings, type PlanSettings } from "@/lib/settings";
import { verifyMailerConnection } from "@/lib/mailer";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";

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

type SuperAdminUserRow = {
  id: string;
  email: string;
  display_name: string;
  job_title: string | null;
  created_at: string;
  last_seen_at: string | null;
  active_workspace_count: string;
  pending_workspace_count: string;
  owned_workspace_count: string;
  workspace_names: string | null;
  billing_plan: PlanSettings | null;
  suspended: boolean | null;
  suspend_reason: string | null;
};

type SuperAdminWorkspaceRow = {
  id: string;
  name: string;
  slug: string;
  support_email: string | null;
  timezone: string;
  region: string | null;
  invite_policy: "admins-only" | "members-with-approval" | "open";
  approval_flow: boolean;
  digest: boolean;
  created_at: string;
  setup_completed_at: string | null;
  owner_name: string | null;
  owner_email: string | null;
  total_member_count: string;
  active_member_count: string;
  pending_invite_count: string;
  project_count: string;
  task_count: string;
};

type PlanPresetName = (typeof BILLING_PLAN_ORDER)[number];

export type SuperAdminManagedUser = {
  id: string;
  email: string;
  name: string;
  jobTitle: string;
  createdAt: string;
  lastSeenAt: string | null;
  workspacesActive: number;
  workspacesPending: number;
  workspacesOwned: number;
  workspaceNames: string[];
  plan: PlanSettings;
  suspended: boolean;
  suspendReason: string;
};

export type SuperAdminManagedWorkspace = {
  id: string;
  name: string;
  slug: string;
  supportEmail: string;
  timezone: string;
  region: string;
  invitePolicy: "admins-only" | "members-with-approval" | "open";
  approvalFlow: boolean;
  digest: boolean;
  createdAt: string;
  setupCompletedAt: string | null;
  ownerName: string;
  ownerEmail: string;
  totalMembers: number;
  activeMembers: number;
  pendingInvites: number;
  projectCount: number;
  taskCount: number;
};

export type SuperAdminDashboardData = {
  summary: {
    totalUsers: number;
    activeUsers: number;
    suspendedUsers: number;
    totalWorkspaces: number;
    paidSubscriptions: number;
    monthlyRecurringRevenue: number;
  };
  settings: AppMasterSettings;
  secretStatus: {
    smtpPassConfigured: boolean;
    googleClientSecretConfigured: boolean;
    turnCredentialConfigured: boolean;
  };
  users: SuperAdminManagedUser[];
  workspaces: SuperAdminManagedWorkspace[];
};

export type SuperAdminOperationalData = Omit<SuperAdminDashboardData, "settings" | "secretStatus">;

export type SuperAdminSettingsPatch = {
  branding?: Partial<AppMasterSettings["branding"]>;
  smtp?: Partial<AppMasterSettings["smtp"]>;
  platform?: Partial<AppMasterSettings["platform"]>;
  services?: Partial<AppMasterSettings["services"]>;
};

export type SuperAdminWorkspacePatch = Partial<Pick<
  SuperAdminManagedWorkspace,
  "name" | "slug" | "supportEmail" | "timezone" | "region" | "invitePolicy" | "approvalFlow" | "digest"
>>;

function parseSuperAdminEmails() {
  const configuredLoginEmail = process.env.PLANIX_SUPER_ADMIN_EMAIL?.trim().toLowerCase()
    || process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase()
    || "";
  const raw = process.env.PLANIX_SUPER_ADMIN_EMAILS ?? process.env.SUPER_ADMIN_EMAILS ?? "";

  return new Set(
    [configuredLoginEmail, ...raw.split(",")]
      .filter(Boolean)
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  );
}

function getConfiguredSuperAdminLogin() {
  const email = process.env.PLANIX_SUPER_ADMIN_EMAIL?.trim().toLowerCase()
    || process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase()
    || "";
  const password = process.env.PLANIX_SUPER_ADMIN_PASSWORD?.trim()
    || process.env.SUPER_ADMIN_PASSWORD?.trim()
    || "";

  if (!email || !password) {
    return null;
  }

  return { email, password };
}

export function isConfiguredSuperAdminLoginEmail(email?: string | null) {
  const configured = getConfiguredSuperAdminLogin();

  if (!configured || !email) {
    return false;
  }

  return configured.email === email.trim().toLowerCase();
}

export async function ensureConfiguredSuperAdminAuthUser() {
  const configured = getConfiguredSuperAdminLogin();

  if (!configured) {
    return;
  }

  const pool = getDbPool();
  const existingUserResult = await pool.query<{ id: string }>(
    `
      select id::text as id
      from auth.users
      where lower(email) = $1
      limit 1
    `,
    [configured.email],
  );

  const adminClient = createSupabaseAdminClient();
  const userMetadata = {
    full_name: "Planix Super Admin",
    first_name: "Planix",
    last_name: "Admin",
  };

  if (existingUserResult.rows[0]?.id) {
    const { error } = await adminClient.auth.admin.updateUserById(existingUserResult.rows[0].id, {
      email: configured.email,
      password: configured.password,
      email_confirm: true,
      user_metadata: userMetadata,
    });

    if (error) {
      throw new Error(error.message);
    }

    return;
  }

  const { error } = await adminClient.auth.admin.createUser({
    email: configured.email,
    password: configured.password,
    email_confirm: true,
    user_metadata: userMetadata,
  });

  if (error) {
    throw new Error(error.message);
  }
}

function displayNameFromEmail(email: string) {
  return email.split("@")[0] ?? "User";
}

function normalizePlanName(planName: string): PlanPresetName {
  if (planName === "Pro Plan" || planName === "Growth Plan") {
    return planName;
  }

  return "Starter Plan";
}

function nextRenewalDate() {
  const next = new Date();
  next.setMonth(next.getMonth() + 1);
  return next.toISOString().slice(0, 10);
}

function normalizePlanForAdmin(plan: PlanSettings | null | undefined): PlanSettings {
  return applyCanonicalPlanSettings({
    ...defaultPlanSettings,
    ...(plan ?? {}),
    billingHistory: Array.isArray(plan?.billingHistory) ? plan.billingHistory : [],
  });
}

function trimOrEmpty(value?: string | null) {
  return value?.trim() || "";
}

function parseCount(value?: string | null) {
  return Number.parseInt(value ?? "0", 10) || 0;
}

function splitDisplayName(fullName: string) {
  const normalized = fullName.trim().replace(/\s+/g, " ");

  if (!normalized) {
    return { firstName: "", lastName: "" };
  }

  const [firstName, ...rest] = normalized.split(" ");

  return {
    firstName: firstName ?? "",
    lastName: rest.join(" ").trim(),
  };
}

export function isSuperAdminEmail(email?: string | null) {
  if (!email) {
    return false;
  }

  return parseSuperAdminEmails().has(email.trim().toLowerCase());
}

export async function getAuthenticatedSuperAdminUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  if (!isSuperAdminEmail(user.email)) {
    return null;
  }

  if (await isUserSuspended(user.id)) {
    return null;
  }

  return user;
}

export async function requireSuperAdminUser() {
  const user = await getAuthenticatedSuperAdminUser();

  if (!user) {
    redirect("/dashboard");
  }

  return user;
}

export async function isUserSuspended(userId: string) {
  const pool = getDbPool();
  const result = await pool.query<{ suspended: boolean }>(
    `
      select suspended
      from public.app_admin_user_controls
      where user_id = $1
      limit 1
    `,
    [userId],
  );

  return Boolean(result.rows[0]?.suspended);
}

export async function ensureUserIsNotSuspended(user: AuthLikeUser) {
  await ensureUserProfileAndWorkspace(user);
  return !(await isUserSuspended(user.id));
}

export async function getSuperAdminMeta(user: AuthLikeUser) {
  const suspended = await isUserSuspended(user.id);

  return {
    isSuperAdmin: isSuperAdminEmail(user.email) && !suspended,
    suspended,
  };
}

function summarizeSuperAdminOperations(
  users: SuperAdminManagedUser[],
  workspaces: SuperAdminManagedWorkspace[],
): SuperAdminOperationalData {
  const totalUsers = users.length;
  const suspendedUsers = users.filter((user) => user.suspended).length;
  const activeUsers = totalUsers - suspendedUsers;
  const paidSubscriptions = users.filter((user) => user.plan.priceMonthly > 0).length;
  const monthlyRecurringRevenue = users.reduce((sum, user) => sum + Math.max(0, user.plan.priceMonthly || 0), 0);

  return {
    summary: {
      totalUsers,
      activeUsers,
      suspendedUsers,
      totalWorkspaces: workspaces.length,
      paidSubscriptions,
      monthlyRecurringRevenue,
    },
    users,
    workspaces,
  };
}

async function getSuperAdminOperationalData(): Promise<SuperAdminOperationalData> {
  const [users, workspaces] = await Promise.all([
    getSuperAdminUsers(),
    getSuperAdminWorkspaces(),
  ]);

  return summarizeSuperAdminOperations(users, workspaces);
}

function redactSuperAdminSettings(settings: AppMasterSettings): AppMasterSettings {
  return {
    ...settings,
    smtp: {
      ...settings.smtp,
      pass: "",
    },
    services: {
      ...settings.services,
      googleClientSecret: "",
      turnCredential: "",
    },
  };
}

function getSuperAdminSecretStatus(settings: AppMasterSettings) {
  return {
    smtpPassConfigured: Boolean(settings.smtp.pass.trim()),
    googleClientSecretConfigured: Boolean(settings.services.googleClientSecret.trim()),
    turnCredentialConfigured: Boolean(settings.services.turnCredential.trim()),
  };
}

async function getSuperAdminUsers() {
  const pool = getDbPool();
  const result = await pool.query<SuperAdminUserRow>(
    `
      with membership_stats as (
        select
          members.user_id::text as user_id,
          count(*) filter (where members.status = 'active')::text as active_workspace_count,
          count(*) filter (where members.status = 'pending')::text as pending_workspace_count,
          count(*) filter (where members.role = 'owner')::text as owned_workspace_count,
          string_agg(distinct workspaces.name, '||' order by workspaces.name) filter (
            where members.status in ('active', 'pending', 'suspended')
          ) as workspace_names
        from public.workspace_members members
        join public.workspaces workspaces on workspaces.id = members.workspace_id
        group by members.user_id
      )
      select
        profiles.id::text as id,
        profiles.email,
        coalesce(
          nullif(trim(profiles.full_name), ''),
          nullif(trim(concat_ws(' ', profiles.first_name, profiles.last_name)), ''),
          split_part(profiles.email, '@', 1),
          'User'
        ) as display_name,
        profiles.job_title,
        profiles.created_at::text,
        profiles.last_seen_at::text,
        coalesce(membership_stats.active_workspace_count, '0') as active_workspace_count,
        coalesce(membership_stats.pending_workspace_count, '0') as pending_workspace_count,
        coalesce(membership_stats.owned_workspace_count, '0') as owned_workspace_count,
        membership_stats.workspace_names,
        settings.billing_plan,
        controls.suspended,
        controls.suspend_reason
      from public.user_profiles profiles
      left join public.app_user_settings settings on settings.user_id = profiles.id
      left join membership_stats on membership_stats.user_id = profiles.id::text
      left join public.app_admin_user_controls controls on controls.user_id = profiles.id
      order by coalesce(controls.suspended, false) desc, profiles.created_at desc
    `,
  );

  return result.rows.map((row) => {
    const plan = normalizePlanForAdmin(row.billing_plan);

    return {
      id: row.id,
      email: row.email,
      name: row.display_name.trim() || displayNameFromEmail(row.email),
      jobTitle: row.job_title?.trim() || "Workspace Member",
      createdAt: row.created_at,
      lastSeenAt: row.last_seen_at,
      workspacesActive: parseCount(row.active_workspace_count),
      workspacesPending: parseCount(row.pending_workspace_count),
      workspacesOwned: parseCount(row.owned_workspace_count),
      workspaceNames: row.workspace_names ? row.workspace_names.split("||").filter(Boolean) : [],
      plan,
      suspended: Boolean(row.suspended),
      suspendReason: row.suspend_reason?.trim() || "",
    } satisfies SuperAdminManagedUser;
  });
}

async function getSuperAdminWorkspaces() {
  const pool = getDbPool();
  const result = await pool.query<SuperAdminWorkspaceRow>(
    `
      with member_stats as (
        select
          workspace_id::text as workspace_id,
          count(*)::text as total_member_count,
          count(*) filter (where status = 'active')::text as active_member_count
        from public.workspace_members
        group by workspace_id
      ),
      invite_stats as (
        select
          workspace_id::text as workspace_id,
          count(*) filter (where status = 'pending')::text as pending_invite_count
        from public.workspace_invites
        group by workspace_id
      ),
      project_stats as (
        select
          workspace_id::text as workspace_id,
          coalesce(jsonb_array_length(projects), 0)::text as project_count
        from public.app_project_workspaces
      ),
      task_stats as (
        select
          workspace_id::text as workspace_id,
          count(*)::text as task_count
        from public.app_tasks
        group by workspace_id
      )
      select
        workspaces.id::text as id,
        workspaces.name,
        workspaces.slug,
        workspaces.support_email,
        workspaces.timezone,
        workspaces.region,
        workspaces.invite_policy,
        workspaces.approval_flow,
        workspaces.digest,
        workspaces.created_at::text,
        workspaces.setup_completed_at::text,
        coalesce(owner.full_name, owner.first_name, split_part(owner.email, '@', 1), 'Workspace Owner') as owner_name,
        owner.email as owner_email,
        coalesce(member_stats.total_member_count, '0') as total_member_count,
        coalesce(member_stats.active_member_count, '0') as active_member_count,
        coalesce(invite_stats.pending_invite_count, '0') as pending_invite_count,
        coalesce(project_stats.project_count, '0') as project_count,
        coalesce(task_stats.task_count, '0') as task_count
      from public.workspaces
      left join public.user_profiles owner on owner.id = workspaces.owner_user_id
      left join member_stats on member_stats.workspace_id = workspaces.id::text
      left join invite_stats on invite_stats.workspace_id = workspaces.id::text
      left join project_stats on project_stats.workspace_id = workspaces.id::text
      left join task_stats on task_stats.workspace_id = workspaces.id::text
      order by workspaces.created_at desc
    `,
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    supportEmail: trimOrEmpty(row.support_email),
    timezone: row.timezone,
    region: trimOrEmpty(row.region),
    invitePolicy: row.invite_policy,
    approvalFlow: row.approval_flow,
    digest: row.digest,
    createdAt: row.created_at,
    setupCompletedAt: row.setup_completed_at,
    ownerName: trimOrEmpty(row.owner_name) || "Workspace Owner",
    ownerEmail: trimOrEmpty(row.owner_email),
    totalMembers: parseCount(row.total_member_count),
    activeMembers: parseCount(row.active_member_count),
    pendingInvites: parseCount(row.pending_invite_count),
    projectCount: parseCount(row.project_count),
    taskCount: parseCount(row.task_count),
  } satisfies SuperAdminManagedWorkspace));
}

export async function getSuperAdminDashboardData(): Promise<SuperAdminDashboardData> {
  const [operations, settings] = await Promise.all([
    getSuperAdminOperationalData(),
    getAppMasterSettings(),
  ]);

  return {
    ...operations,
    settings: redactSuperAdminSettings(settings),
    secretStatus: getSuperAdminSecretStatus(settings),
  };
}

export async function updateSuperAdminManagedUser(
  adminUser: AuthLikeUser,
  targetUserId: string,
  patch: {
    name?: string;
    email?: string;
    jobTitle?: string;
    suspended?: boolean;
    suspendReason?: string;
    planName?: string;
  },
) {
  if (!isSuperAdminEmail(adminUser.email)) {
    throw new Error("Super admin access required.");
  }

  if (targetUserId === adminUser.id && patch.suspended) {
    throw new Error("You cannot suspend your own super admin account.");
  }

  const pool = getDbPool();
  const profileResult = await pool.query<{
    email: string;
    full_name: string | null;
    job_title: string | null;
  }>(
    `
      select email, full_name, job_title
      from public.user_profiles
      where id = $1
      limit 1
    `,
    [targetUserId],
  );

  const currentProfile = profileResult.rows[0];

  if (!currentProfile?.email) {
    throw new Error("Managed user profile could not be found.");
  }

  const nextEmail = patch.email !== undefined ? trimOrEmpty(patch.email).toLowerCase() : currentProfile.email.trim().toLowerCase();
  const nextName = patch.name !== undefined ? trimOrEmpty(patch.name) : trimOrEmpty(currentProfile.full_name);
  const nextJobTitle = patch.jobTitle !== undefined ? trimOrEmpty(patch.jobTitle) : trimOrEmpty(currentProfile.job_title);

  if (!nextEmail || !nextEmail.includes("@")) {
    throw new Error("A valid user email is required.");
  }

  if (!nextName) {
    throw new Error("User name is required.");
  }

  if (targetUserId === adminUser.id && nextEmail !== currentProfile.email.trim().toLowerCase()) {
    throw new Error("You cannot change your own super admin login email from this panel.");
  }

  if (
    nextEmail !== currentProfile.email.trim().toLowerCase()
    && (isConfiguredSuperAdminLoginEmail(currentProfile.email) || isSuperAdminEmail(currentProfile.email))
  ) {
    throw new Error("Super admin login email must stay protected.");
  }

  if (
    nextEmail !== currentProfile.email.trim().toLowerCase()
    && (isConfiguredSuperAdminLoginEmail(nextEmail) || isSuperAdminEmail(nextEmail))
  ) {
    throw new Error("This email is reserved for a super admin account.");
  }

  if (
    patch.name !== undefined
    || patch.email !== undefined
    || patch.jobTitle !== undefined
  ) {
    const { firstName, lastName } = splitDisplayName(nextName);
    const adminClient = createSupabaseAdminClient();
    const { error } = await adminClient.auth.admin.updateUserById(targetUserId, {
      email: nextEmail,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        full_name: nextName,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    await pool.query(
      `
        update public.user_profiles
        set
          email = $2,
          first_name = $3,
          last_name = $4,
          full_name = $5,
          job_title = $6
        where id = $1
      `,
      [
        targetUserId,
        nextEmail,
        firstName || null,
        lastName || null,
        nextName,
        nextJobTitle || null,
      ],
    );
  }

  if (typeof patch.suspended === "boolean" || typeof patch.suspendReason === "string") {
    await pool.query(
      `
        insert into public.app_admin_user_controls (user_id, suspended, suspend_reason, updated_by)
        values ($1, $2, $3, $4)
        on conflict (user_id)
        do update set
          suspended = excluded.suspended,
          suspend_reason = excluded.suspend_reason,
          updated_by = excluded.updated_by
      `,
      [
        targetUserId,
        Boolean(patch.suspended),
        patch.suspended ? (patch.suspendReason?.trim() || "Suspended by super admin") : null,
        adminUser.id,
      ],
    );
  }

  if (patch.planName) {
    await ensureAppUserSettings(targetUserId);
    const currentResult = await pool.query<{ billing_plan: PlanSettings | null }>(
      `
        select billing_plan
        from public.app_user_settings
        where user_id = $1
        limit 1
      `,
      [targetUserId],
    );

    const currentPlan = normalizePlanForAdmin(currentResult.rows[0]?.billing_plan);
    const preset = PLAN_SETTINGS_PRESETS[normalizePlanName(patch.planName)];
    const nextPlan: PlanSettings = {
      ...currentPlan,
      ...preset,
      renewsOn: preset.priceMonthly > 0 ? (currentPlan.renewsOn || nextRenewalDate()) : "",
    };

    await pool.query(
      `
        update public.app_user_settings
        set billing_plan = $2::jsonb
        where user_id = $1
      `,
      [targetUserId, JSON.stringify(nextPlan)],
    );
  }

  return getSuperAdminOperationalData();
}

export async function deleteSuperAdminManagedUser(
  adminUser: AuthLikeUser,
  targetUserId: string,
) {
  if (!isSuperAdminEmail(adminUser.email)) {
    throw new Error("Super admin access required.");
  }

  if (targetUserId === adminUser.id) {
    throw new Error("You cannot delete your own super admin account.");
  }

  const pool = getDbPool();
  const profileResult = await pool.query<{ email: string | null }>(
    `
      select email
      from public.user_profiles
      where id = $1
      limit 1
    `,
    [targetUserId],
  );

  const targetEmail = trimOrEmpty(profileResult.rows[0]?.email).toLowerCase();

  if (!targetEmail) {
    throw new Error("Managed user profile could not be found.");
  }

  if (isConfiguredSuperAdminLoginEmail(targetEmail) || isSuperAdminEmail(targetEmail)) {
    throw new Error("Protected super admin accounts cannot be deleted from this panel.");
  }

  await deleteAccountAndOwnedData(targetUserId);

  return getSuperAdminOperationalData();
}

export async function updateSuperAdminManagedWorkspace(
  adminUser: AuthLikeUser,
  workspaceId: string,
  patch: SuperAdminWorkspacePatch,
) {
  if (!isSuperAdminEmail(adminUser.email)) {
    throw new Error("Super admin access required.");
  }

  const pool = getDbPool();
  await pool.query(
    `
      update public.workspaces
      set
        name = coalesce($2, name),
        slug = coalesce($3, slug),
        support_email = case when $4::text is null then support_email else nullif($4, '') end,
        timezone = coalesce($5, timezone),
        region = case when $6::text is null then region else nullif($6, '') end,
        invite_policy = coalesce($7, invite_policy),
        approval_flow = coalesce($8, approval_flow),
        digest = coalesce($9, digest)
      where id = $1
    `,
    [
      workspaceId,
      patch.name?.trim() || null,
      patch.slug?.trim() || null,
      patch.supportEmail === undefined ? null : patch.supportEmail.trim(),
      patch.timezone?.trim() || null,
      patch.region === undefined ? null : patch.region.trim(),
      patch.invitePolicy ?? null,
      typeof patch.approvalFlow === "boolean" ? patch.approvalFlow : null,
      typeof patch.digest === "boolean" ? patch.digest : null,
    ],
  );

  return getSuperAdminOperationalData();
}

export async function updateSuperAdminSettings(
  adminUser: AuthLikeUser,
  patch: SuperAdminSettingsPatch,
) {
  if (!isSuperAdminEmail(adminUser.email)) {
    throw new Error("Super admin access required.");
  }

  const current = await getAppMasterSettings();
  const next: AppMasterSettings = {
    branding: {
      ...current.branding,
      ...(patch.branding ?? {}),
      appName: patch.branding?.appName !== undefined ? trimOrEmpty(patch.branding.appName) : current.branding.appName,
      companyName: patch.branding?.companyName !== undefined ? trimOrEmpty(patch.branding.companyName) : current.branding.companyName,
      appTagline: patch.branding?.appTagline !== undefined ? trimOrEmpty(patch.branding.appTagline) : current.branding.appTagline,
      logoUrl: patch.branding?.logoUrl !== undefined ? trimOrEmpty(patch.branding.logoUrl) : current.branding.logoUrl,
      supportEmail: patch.branding?.supportEmail !== undefined ? trimOrEmpty(patch.branding.supportEmail) : current.branding.supportEmail,
      primaryDomain: patch.branding?.primaryDomain !== undefined ? trimOrEmpty(patch.branding.primaryDomain) : current.branding.primaryDomain,
      marketingSiteUrl: patch.branding?.marketingSiteUrl !== undefined ? trimOrEmpty(patch.branding.marketingSiteUrl) : current.branding.marketingSiteUrl,
    },
    smtp: {
      ...current.smtp,
      ...(patch.smtp ?? {}),
      host: patch.smtp?.host !== undefined ? trimOrEmpty(patch.smtp.host) : current.smtp.host,
      port: typeof patch.smtp?.port === "number" && Number.isFinite(patch.smtp.port)
        ? patch.smtp.port
        : current.smtp.port,
      user: patch.smtp?.user !== undefined ? trimOrEmpty(patch.smtp.user) : current.smtp.user,
      pass: patch.smtp?.pass !== undefined ? trimOrEmpty(patch.smtp.pass) : current.smtp.pass,
      from: patch.smtp?.from !== undefined ? trimOrEmpty(patch.smtp.from) : current.smtp.from,
      contactToEmail: patch.smtp?.contactToEmail !== undefined ? trimOrEmpty(patch.smtp.contactToEmail) : current.smtp.contactToEmail,
    },
    platform: {
      ...current.platform,
      ...(patch.platform ?? {}),
      allowNewSignups: patch.platform?.allowNewSignups ?? current.platform.allowNewSignups,
    },
    services: {
      ...current.services,
      ...(patch.services ?? {}),
      googleClientId: patch.services?.googleClientId !== undefined
        ? trimOrEmpty(patch.services.googleClientId)
        : current.services.googleClientId,
      googleClientSecret: patch.services?.googleClientSecret !== undefined
        ? trimOrEmpty(patch.services.googleClientSecret)
        : current.services.googleClientSecret,
      webrtcIceServers: patch.services?.webrtcIceServers !== undefined
        ? trimOrEmpty(patch.services.webrtcIceServers)
        : current.services.webrtcIceServers,
      turnUrl: patch.services?.turnUrl !== undefined
        ? trimOrEmpty(patch.services.turnUrl)
        : current.services.turnUrl,
      turnUsername: patch.services?.turnUsername !== undefined
        ? trimOrEmpty(patch.services.turnUsername)
        : current.services.turnUsername,
      turnCredential: patch.services?.turnCredential !== undefined
        ? trimOrEmpty(patch.services.turnCredential)
        : current.services.turnCredential,
    },
  };

  if (!next.branding.appName) {
    throw new Error("App name is required.");
  }

  if (!next.branding.companyName) {
    throw new Error("Company name is required.");
  }

  if (!next.branding.logoUrl) {
    throw new Error("Logo URL is required.");
  }

  if (!next.branding.primaryDomain) {
    throw new Error("Primary domain is required.");
  }

  if (!Number.isInteger(next.smtp.port) || next.smtp.port <= 0) {
    throw new Error("SMTP port must be a positive number.");
  }

  const pool = getDbPool();
  await pool.query(
    `
      insert into public.app_admin_settings (
        id,
        app_name,
        company_name,
        app_tagline,
        logo_url,
        support_email,
        primary_domain,
        marketing_site_url,
        smtp_host,
        smtp_port,
        smtp_user,
        smtp_pass,
        smtp_from,
        contact_to_email,
        allow_new_signups,
        google_client_id,
        google_client_secret,
        webrtc_ice_servers,
        turn_url,
        turn_username,
        turn_credential,
        updated_by
      )
      values (
        1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
      )
      on conflict (id)
      do update set
        app_name = excluded.app_name,
        company_name = excluded.company_name,
        app_tagline = excluded.app_tagline,
        logo_url = excluded.logo_url,
        support_email = excluded.support_email,
        primary_domain = excluded.primary_domain,
        marketing_site_url = excluded.marketing_site_url,
        smtp_host = excluded.smtp_host,
        smtp_port = excluded.smtp_port,
        smtp_user = excluded.smtp_user,
        smtp_pass = excluded.smtp_pass,
        smtp_from = excluded.smtp_from,
        contact_to_email = excluded.contact_to_email,
        allow_new_signups = excluded.allow_new_signups,
        google_client_id = excluded.google_client_id,
        google_client_secret = excluded.google_client_secret,
        webrtc_ice_servers = excluded.webrtc_ice_servers,
        turn_url = excluded.turn_url,
        turn_username = excluded.turn_username,
        turn_credential = excluded.turn_credential,
        updated_by = excluded.updated_by
    `,
    [
      next.branding.appName,
      next.branding.companyName,
      next.branding.appTagline || null,
      next.branding.logoUrl,
      next.branding.supportEmail || null,
      next.branding.primaryDomain || null,
      next.branding.marketingSiteUrl || null,
      next.smtp.host,
      next.smtp.port,
      next.smtp.user,
      next.smtp.pass,
      next.smtp.from,
      next.smtp.contactToEmail,
      next.platform.allowNewSignups,
      next.services.googleClientId || null,
      next.services.googleClientSecret || null,
      next.services.webrtcIceServers || null,
      next.services.turnUrl || null,
      next.services.turnUsername || null,
      next.services.turnCredential || null,
      adminUser.id,
    ],
  );

  return getSuperAdminDashboardData();
}

export async function testSuperAdminSmtpConnection(adminUser: AuthLikeUser) {
  if (!isSuperAdminEmail(adminUser.email)) {
    throw new Error("Super admin access required.");
  }

  return verifyMailerConnection();
}

import { getDbPool } from "@/lib/db";
import {
  type ClientEmployeeRecord,
  type ClientOwnerOption,
  type ClientRecord,
  type CompanyEmployee,
  type CompanyProfile,
} from "@/data/clients";
import type { WorkspaceProject } from "@/data/project-board";
import type { AvatarTone } from "@/data/dashboard";
import { normalizeProjectWorkspaceBundle } from "@/lib/project-workspace";
import type { ProjectTaskSummary } from "@/lib/tasks-db";

type ClientEmployeeInput = Partial<ClientEmployeeRecord>;

type AppClientRow = {
  id: string;
  workspace_id: string | null;
  company: string;
  contact_name: string;
  contact_role: string;
  email: string;
  location: string;
  website: string;
  logo_url: string | null;
  owner_name: string;
  owner_initials: string;
  owner_tone: string;
  stage: ClientRecord["stage"];
  health: ClientRecord["health"];
  invoice_status: ClientRecord["invoiceStatus"];
  active_projects: number;
  arr: number;
  last_activity: string;
  next_renewal: string;
  priority: boolean;
  archived: boolean;
  employees: ClientEmployeeInput[] | null;
};

type BuildCompanyProfileOptions = {
  linkedProjects?: WorkspaceProject[];
  taskSummaries?: Record<string, ProjectTaskSummary>;
};

type AppProjectWorkspaceProjectsRow = {
  projects: WorkspaceProject[] | null;
};

const EMPLOYEE_TONES: AvatarTone[] = ["sand", "olive", "peach", "rose", "slate"];
const AVATAR_TONES: AvatarTone[] = ["sand", "olive", "peach", "rose", "slate"];

type WorkspaceOwnerRow = {
  id: string;
  display_name: string;
  email: string | null;
  role_label: string;
  avatar_tone: string | null;
};

function normalizeAvatarTone(value: string | null | undefined): AvatarTone {
  return AVATAR_TONES.find((tone) => tone === value) ?? "sand";
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

function normalizeEmployees(employees: ClientEmployeeInput[] | null | undefined) {
  return (employees ?? [])
    .map((employee, index) => ({
      id: employee.id?.trim() || `employee-${index + 1}`,
      name: employee.name?.trim() ?? "",
      role: employee.role?.trim() ?? "",
      department: employee.department?.trim() ?? "",
      email: employee.email?.trim() ?? "",
      location: employee.location?.trim() ?? "",
      initials: employee.initials?.trim() ?? "",
      tone: employee.tone,
      status: employee.status,
    }))
    .filter((employee) => employee.name);
}

function toEmployeeProfile(
  employees: ClientEmployeeInput[] | null | undefined,
  contactName: string,
  contactRole: string,
  email: string,
  location: string,
) {
  const normalizedEmployees = normalizeEmployees(employees);

  if (normalizedEmployees.length === 0) {
    return [
      {
        id: "employee-1",
        name: contactName,
        role: contactRole || "Primary Contact",
        department: "Client Team",
        email,
        location,
        initials: buildInitials(contactName),
        tone: EMPLOYEE_TONES[0],
        status: "active",
      } satisfies CompanyEmployee,
    ];
  }

  return normalizedEmployees.map((employee, index) => ({
    id: employee.id || `employee-${index + 1}`,
    name: employee.name,
    role: employee.role || "Team Member",
    department: employee.department || "Client Team",
    email:
      employee.email ||
      (index === 0
        ? email
        : `${employee.name.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "") || "member"}@${email.split("@")[1] ?? "client.com"}`),
    location: employee.location || location,
    initials: employee.initials || buildInitials(employee.name),
    tone: employee.tone || (EMPLOYEE_TONES[index % EMPLOYEE_TONES.length] ?? "sand"),
    status: employee.status || (index === 0 ? "active" : "review"),
  })) satisfies CompanyEmployee[];
}

function defaultCompanyProfile(client: ClientRecord): CompanyProfile {
  return {
    clientId: client.id,
    legalName: `${client.company} Inc.`,
    industry: "Client Account",
    companySize: `${Math.max((client.employees?.length ?? 1) * 12, 24)} employees`,
    headquarters: client.location || "Remote",
    founded: "2024",
    timezone: "UTC",
    overview: `${client.company} is an active client account managed in Planix. This profile is generated from the current client record until a richer company profile is available.`,
    primaryGoal: "Maintain delivery visibility and keep the client relationship current.",
    contractModel: "Client account",
    employees: toEmployeeProfile(
      client.employees,
      client.contactName,
      client.contactRole,
      client.email,
      client.location,
    ),
    projects: [],
  };
}

function deriveProjectStatus(summary?: ProjectTaskSummary): CompanyProfile["projects"][number]["status"] {
  if (!summary || summary.total === 0) {
    return "Discovery";
  }

  if (summary.done >= summary.total) {
    return "Completed";
  }

  if (summary.review > 0) {
    return "Review";
  }

  if (summary.progress > 0 || summary.done > 0) {
    return "In Delivery";
  }

  return "Discovery";
}

function deriveProjectProgress(summary?: ProjectTaskSummary) {
  if (!summary || summary.total === 0) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round((summary.done / summary.total) * 100)));
}

function deriveLinkedCompanyProjects(
  client: ClientRecord,
  linkedProjects: WorkspaceProject[] | undefined,
  taskSummaries: Record<string, ProjectTaskSummary> | undefined,
) {
  if (!linkedProjects) {
    return undefined;
  }

  return linkedProjects
    .filter((project) => !project.archived && project.clientId === client.id)
    .map((project) => {
      const summary = taskSummaries?.[String(project.id)];
      const leadMember = project.members?.find((member) => member.name.trim());

      return {
        id: String(project.id),
        name: project.name,
        service: project.projectType?.trim() || project.category,
        status: deriveProjectStatus(summary),
        ownerName: leadMember?.name?.trim() || client.owner.name,
        dueDate: project.deadline || project.startDate || client.nextRenewal,
        budget: 0,
        progress: deriveProjectProgress(summary),
      } satisfies CompanyProfile["projects"][number];
    })
    .sort((left, right) => left.dueDate.localeCompare(right.dueDate));
}

async function getWorkspaceProjectCountMap(workspaceId: string) {
  const pool = getDbPool();
  const result = await pool.query<AppProjectWorkspaceProjectsRow>(
    `
      select projects
      from public.app_project_workspaces
      where workspace_id = $1
      limit 1
    `,
    [workspaceId],
  );
  const workspaceProjects = normalizeProjectWorkspaceBundle({
    projects: result.rows[0]?.projects ?? undefined,
  }).projects;

  return workspaceProjects.reduce<Record<string, number>>((counts, project) => {
    if (project.archived || !project.clientId) {
      return counts;
    }

    counts[project.clientId] = (counts[project.clientId] ?? 0) + 1;
    return counts;
  }, {});
}

export async function hydrateClientProjectCount(workspaceId: string | null, client: ClientRecord) {
  if (!workspaceId) {
    return client;
  }

  const projectCountMap = await getWorkspaceProjectCountMap(workspaceId);

  return {
    ...client,
    activeProjects: projectCountMap[client.id] ?? 0,
  };
}

export function mapDbClientRow(row: AppClientRow): ClientRecord {
  return {
    id: row.id,
    company: row.company,
    contactName: row.contact_name,
    contactRole: row.contact_role,
    email: row.email,
    location: row.location,
    website: row.website,
    logoUrl: row.logo_url ?? undefined,
    owner: {
      name: row.owner_name,
      initials: row.owner_initials || buildInitials(row.owner_name),
      tone: normalizeAvatarTone(row.owner_tone),
    },
    stage: row.stage,
    health: row.health,
    invoiceStatus: row.invoice_status,
    activeProjects: row.active_projects,
    arr: row.arr,
    lastActivity: row.last_activity,
    nextRenewal: row.next_renewal,
    priority: row.priority,
    archived: row.archived,
    employees: normalizeEmployees(row.employees),
  };
}

export async function listClientOwnerOptions(workspaceId: string | null): Promise<ClientOwnerOption[]> {
  const pool = getDbPool();

  if (!workspaceId) {
    const result = await pool.query<{
      id: string;
      owner_name: string;
      owner_initials: string;
      owner_tone: string;
    }>(
      `
        select distinct on (owner_name)
          owner_name as id,
          owner_name,
          owner_initials,
          owner_tone
        from public.app_clients
        where workspace_id is null
        order by owner_name asc
      `,
    );

    return result.rows.map((row) => ({
      id: row.id,
      name: row.owner_name.trim() || "Team Member",
      initials: row.owner_initials?.trim() || buildInitials(row.owner_name),
      tone: normalizeAvatarTone(row.owner_tone),
      role: "Workspace member",
    }));
  }

  const result = await pool.query<WorkspaceOwnerRow>(
    `
      select
        members.user_id::text as id,
        coalesce(
          nullif(trim(profiles.full_name), ''),
          nullif(trim(concat_ws(' ', profiles.first_name, profiles.last_name)), ''),
          split_part(coalesce(profiles.email, ''), '@', 1),
          'Team Member'
        ) as display_name,
        profiles.email,
        coalesce(
          nullif(trim(profiles.job_title), ''),
          case members.role
            when 'owner' then 'Owner'
            when 'member' then 'Member'
            else initcap(members.role)
          end,
          'Team Member'
        ) as role_label,
        profiles.avatar_tone
      from public.workspace_members members
      left join public.user_profiles profiles
        on profiles.id = members.user_id
      where members.workspace_id = $1
        and members.status in ('active', 'pending')
      order by members.created_at asc
    `,
    [workspaceId],
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.display_name.trim() || "Team Member",
    initials: buildInitials(row.display_name),
    tone: normalizeAvatarTone(row.avatar_tone),
    role: row.role_label.trim() || "Team Member",
    email: row.email?.trim().toLowerCase() || undefined,
  }));
}

export async function listDbClients(workspaceId: string | null) {
  const pool = getDbPool();
  const selectColumns = `
      select
        workspace_id,
        id,
        company,
        contact_name,
        contact_role,
        email,
        location,
        website,
        logo_url,
        owner_name,
        owner_initials,
        owner_tone,
        stage,
        health,
        invoice_status,
        active_projects,
        arr,
        last_activity,
        next_renewal::text,
        priority,
        archived,
        employees
      from public.app_clients
  `;
  const result = workspaceId
    ? await pool.query<AppClientRow>(
        `
          ${selectColumns}
          where workspace_id = $1
          order by created_at desc
        `,
        [workspaceId],
      )
    : await pool.query<AppClientRow>(
        `
          ${selectColumns}
          where workspace_id is null
          order by created_at desc
        `,
      );

  const clients = result.rows.map(mapDbClientRow);

  if (!workspaceId) {
    return clients;
  }

  const projectCountMap = await getWorkspaceProjectCountMap(workspaceId);

  return clients.map((client) => ({
    ...client,
    activeProjects: projectCountMap[client.id] ?? 0,
  }));
}

export async function getDbClientById(workspaceId: string | null, id: string) {
  const pool = getDbPool();
  const selectColumns = `
      select
        workspace_id,
        id,
        company,
        contact_name,
        contact_role,
        email,
        location,
        website,
        logo_url,
        owner_name,
        owner_initials,
        owner_tone,
        stage,
        health,
        invoice_status,
        active_projects,
        arr,
        last_activity,
        next_renewal::text,
        priority,
        archived,
        employees
      from public.app_clients
  `;
  const result = workspaceId
    ? await pool.query<AppClientRow>(
        `
          ${selectColumns}
          where workspace_id = $1
            and id = $2
          limit 1
        `,
        [workspaceId, id],
      )
    : await pool.query<AppClientRow>(
        `
          ${selectColumns}
          where workspace_id is null
            and id = $1
          limit 1
        `,
        [id],
      );

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  const client = mapDbClientRow(row);

  if (!workspaceId) {
    return client;
  }

  return hydrateClientProjectCount(workspaceId, client);
}

export function buildCompanyProfile(client: ClientRecord, options?: BuildCompanyProfileOptions) {
  const employeeProfile = toEmployeeProfile(
    client.employees,
    client.contactName,
    client.contactRole,
    client.email,
    client.location,
  );
  const fallback = defaultCompanyProfile(client);
  const linkedProjects = deriveLinkedCompanyProjects(client, options?.linkedProjects, options?.taskSummaries);
  const primaryGoal = client.health === "At Risk"
    ? "Stabilize delivery confidence and reduce account risk."
    : client.stage === "Onboarding"
      ? "Establish a clean kickoff and align the first active workstreams."
      : client.stage === "Expansion"
        ? "Expand delivery impact while keeping stakeholder alignment tight."
        : client.stage === "Paused"
          ? "Keep context organized and ready for restart."
          : "Maintain delivery momentum and relationship health.";
  const contractModel = client.stage === "Onboarding"
    ? "Onboarding engagement"
    : client.stage === "Expansion"
      ? "Growth engagement"
      : client.stage === "Paused"
        ? "Paused engagement"
        : "Active account support";

  return {
    ...fallback,
    industry: "Client Account",
    companySize: `${Math.max(employeeProfile.length, 1)} tracked contact${employeeProfile.length === 1 ? "" : "s"}`,
    headquarters: client.location || fallback.headquarters,
    founded: "Not set",
    timezone: "Not set",
    overview: `${client.company} is a ${client.stage.toLowerCase()} client account in Planix. The profile reflects the current relationship, key contacts, and linked delivery workspaces.`,
    primaryGoal,
    contractModel,
    employees: employeeProfile,
    projects: linkedProjects ?? fallback.projects,
  };
}

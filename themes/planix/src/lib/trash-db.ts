import { getDbPool } from "@/lib/db";
import { getProjectWorkspaceBundleForWorkspace, saveProjectWorkspaceBundleForWorkspace, deleteProjectResourcesForWorkspace } from "@/lib/projects-db";
import type { CreateTrashItemInput, TrashPayload, WorkspaceTrashItem } from "@/lib/trash";

type TrashRow = {
  id: string;
  workspace_id: string | null;
  item_type: WorkspaceTrashItem["itemType"];
  item_key: string;
  item_label: string;
  summary: string;
  payload: TrashPayload;
  deleted_at: string;
};

let ensuredTrashSchemaPromise: Promise<void> | null = null;

function createTrashId() {
  return `trash_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

async function ensureTrashSchema() {
  if (!ensuredTrashSchemaPromise) {
    const pool = getDbPool();
    ensuredTrashSchemaPromise = pool.query(`
      create table if not exists public.app_workspace_trash (
        id text primary key,
        workspace_id uuid references public.workspaces (id) on delete cascade,
        item_type text not null,
        item_key text not null,
        item_label text not null,
        summary text not null default '',
        payload jsonb not null,
        deleted_by_user_id uuid,
        deleted_at timestamptz not null default now(),
        created_at timestamptz not null default now()
      );
      create index if not exists app_workspace_trash_workspace_deleted_idx
        on public.app_workspace_trash (workspace_id, deleted_at desc);
      create index if not exists app_workspace_trash_workspace_type_key_idx
        on public.app_workspace_trash (workspace_id, item_type, item_key);
    `).then(() => undefined);
  }

  await ensuredTrashSchemaPromise;
}

function mapTrashRow(row: TrashRow): WorkspaceTrashItem {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    itemType: row.item_type,
    itemKey: row.item_key,
    itemLabel: row.item_label,
    summary: row.summary,
    deletedAt: row.deleted_at,
    payload: row.payload,
  };
}

export async function listWorkspaceTrashItems(workspaceId: string | null) {
  await ensureTrashSchema();
  const pool = getDbPool();
  const result = workspaceId
    ? await pool.query<TrashRow>(
        `
          select id, workspace_id, item_type, item_key, item_label, summary, payload, deleted_at::text
          from public.app_workspace_trash
          where workspace_id = $1
          order by deleted_at desc, created_at desc
        `,
        [workspaceId],
      )
    : await pool.query<TrashRow>(
        `
          select id, workspace_id, item_type, item_key, item_label, summary, payload, deleted_at::text
          from public.app_workspace_trash
          where workspace_id is null
          order by deleted_at desc, created_at desc
        `,
      );

  return result.rows.map(mapTrashRow);
}

export async function createWorkspaceTrashItem(input: CreateTrashItemInput) {
  await ensureTrashSchema();
  const pool = getDbPool();

  await pool.query(
    `
      delete from public.app_workspace_trash
      where workspace_id is not distinct from $1
        and item_type = $2
        and item_key = $3
    `,
    [input.workspaceId, input.itemType, input.itemKey],
  );

  const id = createTrashId();
  await pool.query(
    `
      insert into public.app_workspace_trash (
        id,
        workspace_id,
        item_type,
        item_key,
        item_label,
        summary,
        payload,
        deleted_by_user_id
      )
      values ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)
    `,
    [
      id,
      input.workspaceId,
      input.itemType,
      input.itemKey,
      input.itemLabel,
      input.summary?.trim() ?? "",
      JSON.stringify(input.payload),
      input.deletedByUserId ?? null,
    ],
  );

  return id;
}

export async function getWorkspaceTrashItemById(workspaceId: string | null, trashId: string) {
  await ensureTrashSchema();
  const pool = getDbPool();
  const result = workspaceId
    ? await pool.query<TrashRow>(
        `
          select id, workspace_id, item_type, item_key, item_label, summary, payload, deleted_at::text
          from public.app_workspace_trash
          where id = $1
            and workspace_id = $2
          limit 1
        `,
        [trashId, workspaceId],
      )
    : await pool.query<TrashRow>(
        `
          select id, workspace_id, item_type, item_key, item_label, summary, payload, deleted_at::text
          from public.app_workspace_trash
          where id = $1
            and workspace_id is null
          limit 1
        `,
        [trashId],
      );

  const row = result.rows[0];
  return row ? mapTrashRow(row) : null;
}

export async function deleteWorkspaceTrashItem(workspaceId: string | null, trashId: string) {
  await ensureTrashSchema();
  const pool = getDbPool();

  await pool.query(
    workspaceId
      ? `
          delete from public.app_workspace_trash
          where id = $1
            and workspace_id = $2
        `
      : `
          delete from public.app_workspace_trash
          where id = $1
            and workspace_id is null
        `,
    workspaceId ? [trashId, workspaceId] : [trashId],
  );
}

async function restoreTaskPayload(workspaceId: string | null, payload: Extract<TrashPayload, { kind: "task" }>) {
  const pool = getDbPool();
  const task = payload.task;

  await pool.query(
    `
      insert into public.app_tasks (
        id,
        workspace_id,
        title,
        description,
        status_id,
        tag,
        priority,
        assigned_to,
        due_date,
        reminder_at,
        reminder_date,
        created_by,
        subtasks,
        notes,
        links,
        comments,
        file_ids,
        project_ref,
        sort_order,
        created_at,
        completed_at
      )
      values (
        $1, $2, $3, $4, $5, $6, $7, $8, $9::date, $10::timestamptz, $11::date, $12,
        $13::jsonb, $14::jsonb, $15::jsonb, $16::jsonb, $17::jsonb, $18, $19, $20::timestamptz, $21::timestamptz
      )
    `,
    [
      task.id,
      workspaceId,
      task.title,
      task.description,
      task.status_id,
      task.tag,
      task.priority,
      task.assigned_to,
      task.due_date,
      task.reminder_at,
      task.reminder_date,
      task.created_by,
      JSON.stringify(task.subtasks ?? []),
      JSON.stringify(task.notes ?? []),
      JSON.stringify(task.links ?? []),
      JSON.stringify(task.comments ?? []),
      JSON.stringify(task.file_ids ?? []),
      task.project_ref,
      task.sort_order,
      task.created_at,
      task.completed_at,
    ],
  );
}

async function restoreProjectPayload(workspaceId: string, payload: Extract<TrashPayload, { kind: "project" }>) {
  const bundle = await getProjectWorkspaceBundleForWorkspace(workspaceId);
  const projectId = payload.project.project.id;
  const projectKey = String(projectId);
  const nextProjects = [
    { ...payload.project.project, archived: false, hidden: false, active: true },
    ...bundle.projects
      .filter((project) => project.id !== projectId)
      .map((project) => ({ ...project, active: false })),
  ];

  await saveProjectWorkspaceBundleForWorkspace(
    workspaceId,
    {
      projects: nextProjects,
      teamMembers: bundle.teamMembers,
      workspaceTeams: bundle.workspaceTeams,
      notifications: {
        ...bundle.notifications,
        [projectKey]: payload.project.notifications ?? [],
      },
      integrations: {
        ...bundle.integrations,
        [projectKey]: payload.project.integrations ?? [],
      },
    },
    { cleanupRemovedProjects: false },
  );
}

async function restoreClientPayload(workspaceId: string | null, payload: Extract<TrashPayload, { kind: "client" }>) {
  const pool = getDbPool();
  const client = payload.client;

  await pool.query(
    `
      insert into public.app_clients (
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
        next_renewal,
        priority,
        archived,
        employees
      )
      values (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17, $18, $19::date, $20, false, $21::jsonb
      )
    `,
    [
      workspaceId,
      client.id,
      client.company,
      client.contactName,
      client.contactRole,
      client.email,
      client.location,
      client.website,
      client.logoUrl ?? null,
      client.owner.name,
      client.owner.initials,
      client.owner.tone,
      client.stage,
      client.health,
      client.invoiceStatus,
      client.activeProjects,
      client.arr,
      client.lastActivity,
      client.nextRenewal,
      client.priority,
      JSON.stringify(client.employees ?? []),
    ],
  );
}

async function restoreMemberPayload(workspaceId: string, payload: Extract<TrashPayload, { kind: "member" }>) {
  const bundle = await getProjectWorkspaceBundleForWorkspace(workspaceId);
  const nextMembers = [
    payload.member,
    ...bundle.teamMembers.filter((member) => member.id !== payload.member.id),
  ];
  const nextProjects = bundle.projects.map((project) => {
    const assignment = payload.assignments.find((item) => item.projectId === project.id);
    return assignment
      ? { ...project, members: assignment.members }
      : project;
  });

  await saveProjectWorkspaceBundleForWorkspace(
    workspaceId,
    {
      projects: nextProjects,
      teamMembers: nextMembers,
      workspaceTeams: bundle.workspaceTeams,
      notifications: bundle.notifications,
      integrations: bundle.integrations,
    },
    { cleanupRemovedProjects: false },
  );
}

async function restoreTeamPayload(workspaceId: string, payload: Extract<TrashPayload, { kind: "team" }>) {
  const bundle = await getProjectWorkspaceBundleForWorkspace(workspaceId);
  const nextTeams = [payload.team, ...bundle.workspaceTeams.filter((team) => team.id !== payload.team.id)];

  await saveProjectWorkspaceBundleForWorkspace(
    workspaceId,
    {
      projects: bundle.projects,
      teamMembers: bundle.teamMembers,
      workspaceTeams: nextTeams,
      notifications: bundle.notifications,
      integrations: bundle.integrations,
    },
    { cleanupRemovedProjects: false },
  );
}

export async function restoreWorkspaceTrashItem(workspaceId: string | null, item: WorkspaceTrashItem) {
  switch (item.payload.kind) {
    case "task":
      await restoreTaskPayload(workspaceId, item.payload);
      return;
    case "project":
      if (!workspaceId) {
        throw new Error("Project restore requires a workspace.");
      }
      await restoreProjectPayload(workspaceId, item.payload);
      return;
    case "client":
      await restoreClientPayload(workspaceId, item.payload);
      return;
    case "member":
      if (!workspaceId) {
        throw new Error("Member restore requires a workspace.");
      }
      await restoreMemberPayload(workspaceId, item.payload);
      return;
    case "team":
      if (!workspaceId) {
        throw new Error("Team restore requires a workspace.");
      }
      await restoreTeamPayload(workspaceId, item.payload);
      return;
    default:
      throw new Error("Unsupported trash item.");
  }
}

export async function permanentlyDeleteWorkspaceTrashItem(workspaceId: string | null, item: WorkspaceTrashItem) {
  if (item.payload.kind === "project" && workspaceId) {
    await deleteProjectResourcesForWorkspace(workspaceId, String(item.payload.project.project.id));
  }

  await deleteWorkspaceTrashItem(workspaceId, item.id);
}

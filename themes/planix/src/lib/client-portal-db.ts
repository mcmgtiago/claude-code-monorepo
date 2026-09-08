import { listDbClients, getDbClientById } from "@/lib/clients-db";
import type { ClientRecord } from "@/data/clients";
import { ensureUserProfile, getDbPool } from "@/lib/db";
import type {
  ClientPortalAccount,
  ClientPortalDashboard,
  ClientPortalDiscussion,
  ClientPortalFile,
  ClientPortalMember,
  ClientPortalNotification,
  ClientPortalProject,
  ClientPortalProjectDetail,
  ClientPortalTask,
} from "@/data/client-portal";
import { getProjectWorkspaceBundleForWorkspace } from "@/lib/projects-db";
import { getProjectTaskSummariesForWorkspace, type ProjectTaskSummary } from "@/lib/tasks-db";
import type { WorkspaceProject } from "@/data/project-board";
import type { Pool } from "pg";
import { getProjectFiles } from "@/lib/project-files-db";
import type { ProjectNotification } from "@/data/project-board";

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

type Queryable = {
  query: Pool["query"];
};

type AppClientPortalMemberRow = {
  id: string;
  workspace_id: string;
  client_id: string;
  client_member_id: string;
  email: string;
  member_name: string;
  member_role: string;
  access_level: "viewer";
  portal_enabled: boolean;
  can_message: boolean;
  linked_user_id: string | null;
  last_login_at: string | null;
  client_name: string;
};

type TaskRow = {
  id: string;
  title: string;
  description: string;
  status_id: string;
  priority: string;
  assigned_to: string | null;
  due_date: string | null;
  created_at: string;
  project_ref: string;
};

type DiscussionThreadRow = {
  id: string;
  title: string;
  body: string;
  author_name: string;
  created_at: string;
};

type DiscussionReplyCountRow = {
  thread_id: string;
  reply_count: string;
};

type DiscussionAttachmentCountRow = {
  thread_id: string | null;
  reply_id: string | null;
  attachment_count: string;
};

function normalizeEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() || "";
}

function buildPortalSourceMembers(client: ClientRecord) {
  const sourceMembers: Array<{
    clientMemberId: string;
    email: string;
    memberName: string;
    memberRole: string;
  }> = [
    {
      clientMemberId: "primary-contact",
      email: normalizeEmail(client.email),
      memberName: client.contactName.trim(),
      memberRole: client.contactRole.trim() || "Primary Contact",
    },
    ...(client.employees ?? []).map((member, index) => ({
      clientMemberId: member.id?.trim() || `employee-${index + 1}`,
      email: normalizeEmail(member.email),
      memberName: member.name.trim(),
      memberRole: member.role.trim() || "Client Member",
    })),
  ].filter((member) => member.email && member.memberName);

  const uniqueMembers = new Map<string, (typeof sourceMembers)[number]>();

  for (const member of sourceMembers) {
    const key = member.email;

    if (!uniqueMembers.has(key)) {
      uniqueMembers.set(key, member);
    }
  }

  return Array.from(uniqueMembers.values());
}

async function syncKnownPortalMemberLinks(
  workspaceId: string,
  clientId: string,
  queryable: Queryable = getDbPool(),
) {
  await queryable.query(
    `
      update public.app_client_portal_members portal
      set linked_user_id = profiles.id
      from public.user_profiles profiles
      where portal.workspace_id = $1
        and portal.client_id = $2
        and lower(profiles.email) = lower(portal.email)
        and (portal.linked_user_id is distinct from profiles.id)
    `,
    [workspaceId, clientId],
  );
}

function mapPortalMemberRow(row: AppClientPortalMemberRow): ClientPortalMember {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    clientId: row.client_id,
    clientMemberId: row.client_member_id,
    clientName: row.client_name,
    memberName: row.member_name,
    memberRole: row.member_role,
    email: row.email,
    accessLevel: row.access_level,
    portalEnabled: row.portal_enabled,
    canMessage: row.can_message,
    linkedUserId: row.linked_user_id ?? undefined,
    lastLoginAt: row.last_login_at,
  };
}

function deriveProjectStatus(summary?: ProjectTaskSummary): ClientPortalProject["status"] {
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

function mapPortalProject(
  workspaceId: string,
  clientId: string,
  clientName: string,
  project: WorkspaceProject,
  summary?: ProjectTaskSummary,
): ClientPortalProject {
  const openTaskCount = Math.max(0, (summary?.total ?? 0) - (summary?.done ?? 0));

  return {
    id: project.id,
    workspaceId,
    clientId,
    clientName,
    name: project.name,
    service: project.projectType?.trim() || project.category,
    status: deriveProjectStatus(summary),
    progress: deriveProjectProgress(summary),
    dueDate: project.deadline || project.startDate,
    teamMembers: (project.members ?? []).map((member) => member.name.trim()).filter(Boolean),
    taskCount: summary?.total ?? 0,
    openTaskCount,
  };
}

export async function syncClientPortalMembersForClient(
  workspaceId: string,
  client: ClientRecord,
  options?: {
    actorUserId?: string | null;
    queryable?: Queryable;
  },
) {
  const queryable = options?.queryable ?? getDbPool();
  const sourceMembers = buildPortalSourceMembers(client);
  const memberIds = sourceMembers.map((member) => member.clientMemberId);

  await queryable.query(
    `
      delete from public.app_client_portal_members
      where workspace_id = $1
        and client_id = $2
        and client_member_id <> all($3::text[])
    `,
    [workspaceId, client.id, memberIds.length > 0 ? memberIds : [""]],
  );

  for (const member of sourceMembers) {
    await queryable.query(
      `
        insert into public.app_client_portal_members (
          workspace_id,
          client_id,
          client_member_id,
          email,
          member_name,
          member_role,
          invited_by_user_id
        )
        values ($1, $2, $3, $4, $5, $6, $7)
        on conflict (workspace_id, client_id, client_member_id)
        do update set
          email = excluded.email,
          member_name = excluded.member_name,
          member_role = excluded.member_role,
          invited_by_user_id = coalesce(public.app_client_portal_members.invited_by_user_id, excluded.invited_by_user_id)
      `,
      [
        workspaceId,
        client.id,
        member.clientMemberId,
        member.email,
        member.memberName,
        member.memberRole,
        options?.actorUserId ?? null,
      ],
    );
  }

  await syncKnownPortalMemberLinks(workspaceId, client.id, queryable);
}

export async function ensureClientPortalMembersForWorkspace(workspaceId: string) {
  const clients = await listDbClients(workspaceId);
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query("begin");

    for (const clientRecord of clients) {
      await syncClientPortalMembersForClient(workspaceId, clientRecord, {
        queryable: client,
      });
    }

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

async function listExistingPortalTargetsByEmail(email: string) {
  const pool = getDbPool();
  const result = await pool.query<{ workspace_id: string; client_id: string }>(
    `
      select distinct
        workspace_id::text as workspace_id,
        client_id
      from public.app_client_portal_members
      where lower(email) = $1
        and portal_enabled = true
      order by workspace_id asc, client_id asc
    `,
    [email],
  );

  return result.rows;
}

export async function attachClientPortalAccessToUser(user: AuthLikeUser) {
  const profile = await ensureUserProfile(user);

  if (!profile.email) {
    return [] as ClientPortalMember[];
  }

  const portalTargets = await listExistingPortalTargetsByEmail(profile.email);

  if (portalTargets.length === 0) {
    return [] as ClientPortalMember[];
  }

  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query("begin");

    for (const target of portalTargets) {
      await syncKnownPortalMemberLinks(target.workspace_id, target.client_id, client);
    }

    await client.query(
      `
        update public.app_client_portal_members
        set
          linked_user_id = $1,
          last_login_at = now()
        where lower(email) = $2
          and portal_enabled = true
      `,
      [user.id, profile.email],
    );

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }

  return listClientPortalMembershipsForUser(user.id);
}

export async function listClientPortalMembershipsForUser(userId: string) {
  const pool = getDbPool();
  const result = await pool.query<AppClientPortalMemberRow>(
    `
      select distinct on (portal.workspace_id, portal.client_id)
        portal.id::text as id,
        portal.workspace_id::text as workspace_id,
        portal.client_id,
        portal.client_member_id,
        portal.email,
        portal.member_name,
        portal.member_role,
        portal.access_level,
        portal.portal_enabled,
        portal.can_message,
        portal.linked_user_id::text as linked_user_id,
        portal.last_login_at::text,
        clients.company as client_name
      from public.app_client_portal_members portal
      join public.app_clients clients
        on clients.workspace_id = portal.workspace_id
       and clients.id = portal.client_id
      where portal.linked_user_id = $1::uuid
        and portal.portal_enabled = true
      order by portal.workspace_id, portal.client_id, case when portal.client_member_id = 'primary-contact' then 0 else 1 end, portal.member_name asc
    `,
    [userId],
  );

  return result.rows.map(mapPortalMemberRow);
}

export async function getClientPortalMembers(workspaceId: string, clientId: string) {
  const clientRecord = await getDbClientById(workspaceId, clientId);

  if (!clientRecord) {
    return [] as ClientPortalMember[];
  }

  await syncClientPortalMembersForClient(workspaceId, clientRecord);

  const pool = getDbPool();
  const result = await pool.query<AppClientPortalMemberRow>(
    `
      select
        portal.id::text as id,
        portal.workspace_id::text as workspace_id,
        portal.client_id,
        portal.client_member_id,
        portal.email,
        portal.member_name,
        portal.member_role,
        portal.access_level,
        portal.portal_enabled,
        portal.can_message,
        portal.linked_user_id::text as linked_user_id,
        portal.last_login_at::text,
        clients.company as client_name
      from public.app_client_portal_members portal
      join public.app_clients clients
        on clients.workspace_id = portal.workspace_id
       and clients.id = portal.client_id
      where portal.workspace_id = $1
        and portal.client_id = $2
      order by
        case when portal.client_member_id = 'primary-contact' then 0 else 1 end,
        portal.member_name asc
    `,
    [workspaceId, clientId],
  );

  return result.rows.map(mapPortalMemberRow);
}

export async function updateClientPortalMemberSettings(
  workspaceId: string,
  clientId: string,
  clientMemberId: string,
  patch: {
    portalEnabled?: boolean;
    canMessage?: boolean;
  },
) {
  const pool = getDbPool();
  const result = await pool.query<AppClientPortalMemberRow>(
    `
      update public.app_client_portal_members portal
      set
        portal_enabled = coalesce($4, portal.portal_enabled),
        can_message = case
          when coalesce($4, portal.portal_enabled) = false then false
          else coalesce($5, portal.can_message)
        end
      from public.app_clients clients
      where portal.workspace_id = $1
        and portal.client_id = $2
        and portal.client_member_id = $3
        and clients.workspace_id = portal.workspace_id
        and clients.id = portal.client_id
      returning
        portal.id::text as id,
        portal.workspace_id::text as workspace_id,
        portal.client_id,
        portal.client_member_id,
        portal.email,
        portal.member_name,
        portal.member_role,
        portal.access_level,
        portal.portal_enabled,
        portal.can_message,
        portal.linked_user_id::text as linked_user_id,
        portal.last_login_at::text,
        clients.company as client_name
    `,
    [
      workspaceId,
      clientId,
      clientMemberId,
      typeof patch.portalEnabled === "boolean" ? patch.portalEnabled : null,
      typeof patch.canMessage === "boolean" ? patch.canMessage : null,
    ],
  );

  return result.rows[0] ? mapPortalMemberRow(result.rows[0]) : null;
}

export async function getClientPortalDashboard(user: AuthLikeUser): Promise<ClientPortalDashboard> {
  await attachClientPortalAccessToUser(user);
  const memberships = await listClientPortalMembershipsForUser(user.id);
  const taskPool = getDbPool();
  const accounts: ClientPortalAccount[] = [];

  for (const membership of memberships) {
    const bundle = await getProjectWorkspaceBundleForWorkspace(membership.workspaceId);
    const projects = bundle.projects.filter(
      (project) => !project.archived && !project.hidden && project.clientId === membership.clientId,
    );
    const projectRefs = projects.map((project) => String(project.id));
    const taskSummaries = await getProjectTaskSummariesForWorkspace(membership.workspaceId, projectRefs);
    const tasksResult = projectRefs.length > 0
      ? await taskPool.query<TaskRow>(
          `
            select
              id::text as id,
              title,
              description,
              status_id,
              priority,
              assigned_to,
              due_date::text,
              created_at::text,
              project_ref
            from public.app_tasks
            where workspace_id = $1
              and project_ref = any($2::text[])
            order by
              case
                when due_date is null then 1
                else 0
              end,
              due_date asc,
              created_at desc
          `,
          [membership.workspaceId, projectRefs],
        )
      : { rows: [] as TaskRow[] };
    const portalProjects = projects.map((project) =>
      mapPortalProject(
        membership.workspaceId,
        membership.clientId,
        membership.clientName,
        project,
        taskSummaries[String(project.id)],
      ),
    );
    const projectNameById = new Map(portalProjects.map((project) => [String(project.id), project.name]));
    const portalTasks = tasksResult.rows.map((row) => ({
      id: Number(row.id),
      projectId: Number(row.project_ref),
      projectName: projectNameById.get(row.project_ref) ?? "Project",
      title: row.title,
      description: row.description,
      statusId: row.status_id,
      priority: row.priority,
      assignedTo: row.assigned_to ?? "",
      dueDate: row.due_date,
      createdAt: row.created_at,
    })) satisfies ClientPortalTask[];

    accounts.push({
      workspaceId: membership.workspaceId,
      clientId: membership.clientId,
      clientName: membership.clientName,
      memberName: membership.memberName,
      memberRole: membership.memberRole,
      canMessage: membership.canMessage,
      projects: portalProjects,
      tasks: portalTasks,
    });
  }

  const allTasks = accounts.flatMap((account) => account.tasks);

  return {
    accounts,
    totalProjects: accounts.reduce((sum, account) => sum + account.projects.length, 0),
    totalTasks: allTasks.length,
    openTasks: allTasks.filter((task) => task.statusId === "open" || task.statusId === "progress").length,
    reviewTasks: allTasks.filter((task) => task.statusId === "review").length,
    completedTasks: allTasks.filter((task) => task.statusId === "completed" || task.statusId === "done").length,
  };
}

export async function getClientPortalProject(user: AuthLikeUser, projectId: number) {
  const dashboard = await getClientPortalDashboard(user);
  const pool = getDbPool();

  for (const account of dashboard.accounts) {
    const project = account.projects.find((entry) => entry.id === projectId);

    if (project) {
      const projectRef = String(projectId);
      const [files, threadResult, replyCountResult, attachmentCountResult] = await Promise.all([
        getProjectFiles(projectRef, account.workspaceId),
        pool.query<DiscussionThreadRow>(
          `
            select
              id,
              title,
              body,
              author_name,
              created_at::text
            from public.app_discussion_threads
            where workspace_id = $1
              and project_ref = $2
            order by starred desc, created_at desc
            limit 12
          `,
          [account.workspaceId, projectRef],
        ),
        pool.query<DiscussionReplyCountRow>(
          `
            select
              thread_id,
              count(*)::text as reply_count
            from public.app_discussion_replies
            where workspace_id = $1
              and project_ref = $2
            group by thread_id
          `,
          [account.workspaceId, projectRef],
        ),
        pool.query<DiscussionAttachmentCountRow>(
          `
            select
              thread_id,
              reply_id,
              count(*)::text as attachment_count
            from public.app_discussion_attachments
            where workspace_id = $1
              and project_ref = $2
            group by thread_id, reply_id
          `,
          [account.workspaceId, projectRef],
        ),
      ]);
      const replyCountByThreadId = new Map(
        replyCountResult.rows.map((row) => [row.thread_id, Number(row.reply_count) || 0]),
      );
      const attachmentCountByThreadId = new Map<string, number>();

      for (const row of attachmentCountResult.rows) {
        if (!row.thread_id) {
          continue;
        }

        attachmentCountByThreadId.set(
          row.thread_id,
          (attachmentCountByThreadId.get(row.thread_id) ?? 0) + (Number(row.attachment_count) || 0),
        );
      }

      const portalFiles: ClientPortalFile[] = files.map((file) => ({
        id: file.id,
        name: file.name,
        url: file.url,
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
        updatedAt: file.updatedAt,
      }));
      const discussions: ClientPortalDiscussion[] = threadResult.rows.map((row) => ({
        id: row.id,
        title: row.title,
        body: row.body,
        authorName: row.author_name,
        createdAt: row.created_at,
        replyCount: replyCountByThreadId.get(row.id) ?? 0,
        attachmentCount: attachmentCountByThreadId.get(row.id) ?? 0,
      }));
      const rawNotifications = ((await getProjectWorkspaceBundleForWorkspace(account.workspaceId)).notifications[projectRef] ?? []) as ProjectNotification[];
      const notifications: ClientPortalNotification[] = rawNotifications
        .slice()
        .sort((left, right) => {
          const leftTime = new Date(left.createdAt ?? "").getTime();
          const rightTime = new Date(right.createdAt ?? "").getTime();

          if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) {
            return 0;
          }

          return rightTime - leftTime;
        })
        .slice(0, 12)
        .map((notification) => ({
          id: notification.id,
          title: notification.title,
          body: notification.body,
          time: notification.time,
          kind: notification.kind,
          unread: Boolean(notification.unread),
        }));

      return {
        account,
        project,
        tasks: account.tasks.filter((task) => task.projectId === projectId),
        files: portalFiles,
        discussions,
        notifications,
      } satisfies ClientPortalProjectDetail;
    }
  }

  return null;
}

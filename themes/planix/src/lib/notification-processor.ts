import { getConfiguredAppUrl } from "@/lib/app-url";
import { getDbPool } from "@/lib/db";
import {
  buildTaskAssignedEmail,
  buildTaskChecklistCompletedEmail,
  buildTaskReminderEmail,
  buildTaskStageChangedEmail,
  buildUnreadChatEmail,
  buildWorkspaceDigestEmail,
  formatNotificationStatusLabel,
  sendNotificationEmail,
} from "@/lib/notification-email";
import {
  normalizeProjectWorkspaceBundle,
  type ProjectWorkspaceBundle,
} from "@/lib/project-workspace";

type NotificationRecipient = {
  email: string;
  name?: string;
};

type WorkspaceBundleRow = {
  workspace_id: string;
  workspace_name: string;
  projects: ProjectWorkspaceBundle["projects"] | null;
  team_members: ProjectWorkspaceBundle["teamMembers"] | null;
  workspace_teams: ProjectWorkspaceBundle["workspaceTeams"] | null;
  project_notifications: ProjectWorkspaceBundle["notifications"] | null;
  project_integrations: ProjectWorkspaceBundle["integrations"] | null;
};

type ReminderTaskRow = {
  id: number;
  workspace_id: string;
  title: string;
  status_id: string;
  assigned_to: string | null;
  due_date: string | null;
  reminder_at: string | null;
  reminder_date: string | null;
  project_ref: string;
};

type DigestRecipientRow = {
  user_id: string;
  workspace_id: string;
  email: string;
  display_name: string | null;
  workspace_name: string;
};

type WorkspaceTaskCountRow = {
  workspace_id: string;
  active_task_count: string;
  due_today_count: string;
  reminder_count: string;
};

type WorkspaceDueProjectRow = {
  workspace_id: string;
  project_ref: string;
  total: string;
};

type UserUnreadChatRow = {
  user_id: string;
  workspace_id: string;
  unread_count: string;
};

type ChatUnreadRow = {
  thread_id: string;
  user_id: string;
  workspace_id: string | null;
  email: string;
  display_name: string | null;
  contact_name: string;
  unread_count: number;
  latest_message: string;
  latest_sent_at: string;
  hours_unread: number;
};

type ProcessOptions = {
  appUrl?: string;
  workspaceId?: string;
};

type ProcessSummary = {
  sent: number;
  skipped: number;
  duplicate: number;
  failed: number;
};

type WorkspaceBundleContext = {
  workspaceId: string;
  workspaceName: string;
  bundle: ProjectWorkspaceBundle;
};

function emptySummary(): ProcessSummary {
  return {
    sent: 0,
    skipped: 0,
    duplicate: 0,
    failed: 0,
  };
}

function mergeSummary(target: ProcessSummary, source: ProcessSummary) {
  target.sent += source.sent;
  target.skipped += source.skipped;
  target.duplicate += source.duplicate;
  target.failed += source.failed;
}

function applySendStatus(summary: ProcessSummary, status: "sent" | "skipped" | "duplicate" | "failed") {
  summary[status] += 1;
}

function normalizeEmail(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

function buildReminderEventKey(task: ReminderTaskRow) {
  return `${task.id}:${task.reminder_at ?? task.reminder_date ?? "unscheduled"}`;
}

function parseAssignedNames(value?: string | null) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function dedupeRecipients(recipients: NotificationRecipient[]) {
  const seen = new Set<string>();

  return recipients.filter((recipient) => {
    const email = normalizeEmail(recipient.email);

    if (!email || seen.has(email)) {
      return false;
    }

    seen.add(email);
    return true;
  });
}

function resolveProjectMemberRecipients(
  context: WorkspaceBundleContext,
  projectRef: string,
  selectors: string[],
): NotificationRecipient[] {
  const project = context.bundle.projects.find((entry) => String(entry.id) === projectRef);
  const desired = selectors.map((item) => item.trim().toLowerCase()).filter(Boolean);

  if (desired.length === 0) {
    return [];
  }

  const recipients = desired.flatMap((selector) => {
    const projectMember = project?.members?.find((member) => {
      const memberEmail = normalizeEmail(member.email);
      return memberEmail === selector || member.name.trim().toLowerCase() === selector;
    });

    if (projectMember?.email) {
      return [{
        email: projectMember.email,
        name: projectMember.name,
      } satisfies NotificationRecipient];
    }

    const teamMember = context.bundle.teamMembers.find((member) => {
      const memberEmail = normalizeEmail(member.email);
      return memberEmail === selector || member.name.trim().toLowerCase() === selector;
    });

    if (teamMember?.email) {
      return [{
        email: teamMember.email,
        name: teamMember.name,
      } satisfies NotificationRecipient];
    }

    if (selector.includes("@")) {
      return [{ email: selector } satisfies NotificationRecipient];
    }

    return [];
  });

  return dedupeRecipients(recipients);
}

async function loadWorkspaceBundleContext(
  workspaceId: string,
  cache: Map<string, WorkspaceBundleContext>,
): Promise<WorkspaceBundleContext | null> {
  if (cache.has(workspaceId)) {
    return cache.get(workspaceId) ?? null;
  }

  const pool = getDbPool();
  const result = await pool.query<WorkspaceBundleRow>(
    `
      select
        workspace.workspace_id,
        workspaces.name as workspace_name,
        workspace.projects,
        workspace.team_members,
        workspace.workspace_teams,
        workspace.project_notifications,
        workspace.project_integrations
      from public.app_project_workspaces workspace
      join public.workspaces workspaces on workspaces.id = workspace.workspace_id
      where workspace.workspace_id = $1
      limit 1
    `,
    [workspaceId],
  );

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  const context = {
    workspaceId: row.workspace_id,
    workspaceName: row.workspace_name,
    bundle: normalizeProjectWorkspaceBundle({
      projects: row.projects ?? undefined,
      teamMembers: row.team_members ?? undefined,
      workspaceTeams: row.workspace_teams ?? undefined,
      notifications: row.project_notifications ?? undefined,
      integrations: row.project_integrations ?? undefined,
    }),
  } satisfies WorkspaceBundleContext;

  cache.set(workspaceId, context);
  return context;
}

async function persistWorkspaceNotifications(context: WorkspaceBundleContext) {
  const pool = getDbPool();

  await pool.query(
    `
      update public.app_project_workspaces
      set project_notifications = $2::jsonb
      where workspace_id = $1
    `,
    [context.workspaceId, JSON.stringify(context.bundle.notifications)],
  );
}

function appendReminderNotification(
  context: WorkspaceBundleContext,
  task: ReminderTaskRow,
  projectName: string,
) {
  const eventId = `task-reminder-${buildReminderEventKey(task)}`;
  const currentProjectNotifications = context.bundle.notifications[task.project_ref] ?? [];

  if (currentProjectNotifications.some((notification) => notification.id === eventId)) {
    return false;
  }

  context.bundle.notifications = {
    ...context.bundle.notifications,
    [task.project_ref]: [
      {
        id: eventId,
        title: "Task reminder",
        time: "Now",
        body: `Reminder sent for \"${task.title}\" in ${projectName}.`,
        kind: "deadline",
        group: "earlier",
        unread: true,
        createdAt: new Date().toISOString(),
        targetTab: "Tasks",
        targetTaskId: task.id,
        targetColumnId: task.status_id,
      },
      ...currentProjectNotifications,
    ],
  };

  return true;
}

function appendProjectTaskNotification(
  context: WorkspaceBundleContext,
  options: {
    eventId: string;
    projectRef: string;
    title: string;
    body: string;
    kind: "task" | "completed";
    taskId: number;
    targetColumnId?: string | null;
  },
) {
  const currentProjectNotifications = context.bundle.notifications[options.projectRef] ?? [];

  if (currentProjectNotifications.some((notification) => notification.id === options.eventId)) {
    return false;
  }

  context.bundle.notifications = {
    ...context.bundle.notifications,
    [options.projectRef]: [
      {
        id: options.eventId,
        title: options.title,
        time: "Now",
        body: options.body,
        kind: options.kind,
        group: "earlier",
        unread: true,
        createdAt: new Date().toISOString(),
        targetTab: "Tasks",
        targetTaskId: options.taskId,
        targetColumnId: options.targetColumnId ?? undefined,
      },
      ...currentProjectNotifications,
    ],
  };

  return true;
}

function filterRecipientsExcludingEmails(
  recipients: NotificationRecipient[],
  excludeEmails?: string[],
) {
  const blocked = new Set((excludeEmails ?? []).map((email) => normalizeEmail(email)).filter(Boolean));

  return recipients.filter((recipient) => !blocked.has(normalizeEmail(recipient.email)));
}

export async function resolveWorkspaceTaskRecipients(options: {
  workspaceId: string;
  projectRef: string;
  assignedTo?: string | null;
}) {
  const context = await loadWorkspaceBundleContext(options.workspaceId, new Map());

  if (!context) {
    return {
      projectName: "Project",
      recipients: [] as NotificationRecipient[],
    };
  }

  const project = context.bundle.projects.find((entry) => String(entry.id) === options.projectRef);

  return {
    projectName: project?.name ?? "Project",
    recipients: resolveProjectMemberRecipients(context, options.projectRef, parseAssignedNames(options.assignedTo)),
  };
}

export async function sendTaskStageChangedNotification(options: {
  workspaceId: string;
  projectRef: string;
  taskId: number;
  taskTitle: string;
  assignedTo?: string | null;
  dueDate?: string | null;
  previousStatusId: string;
  nextStatusId: string;
  updatedBy: string;
  appUrl?: string;
  eventKeyPrefix?: string;
}) {
  const summary = emptySummary();
  const resolved = await resolveWorkspaceTaskRecipients({
    workspaceId: options.workspaceId,
    projectRef: options.projectRef,
    assignedTo: options.assignedTo,
  });
  const baseAppUrl = options.appUrl ?? getConfiguredAppUrl();

  for (const recipient of resolved.recipients) {
    const email = await buildTaskStageChangedEmail({
      recipientName: recipient.name,
      taskTitle: options.taskTitle,
      projectName: resolved.projectName,
      updatedBy: options.updatedBy,
      previousStatusLabel: formatNotificationStatusLabel(options.previousStatusId),
      nextStatusLabel: formatNotificationStatusLabel(options.nextStatusId),
      dueDate: options.dueDate,
      appUrl: baseAppUrl,
    });
    const result = await sendNotificationEmail({
      workspaceId: options.workspaceId,
      eventKey: `${options.eventKeyPrefix ?? "task-stage"}:${options.taskId}:${options.previousStatusId}:${options.nextStatusId}:${normalizeEmail(recipient.email)}`,
      category: "task-stage-changed",
      subject: email.subject,
      to: recipient,
      html: email.html,
      text: email.text,
      metadata: {
        taskId: options.taskId,
        projectRef: options.projectRef,
        previousStatusId: options.previousStatusId,
        nextStatusId: options.nextStatusId,
      },
      preferenceKey: "tasks",
    });

    applySendStatus(summary, result.status);
  }

  return summary;
}

export async function sendTaskAssignedNotification(options: {
  workspaceId: string;
  projectRef: string;
  taskId: number;
  taskTitle: string;
  assignedTo?: string | null;
  dueDate?: string | null;
  reminderDate?: string | null;
  statusId?: string | null;
  assignedBy: string;
  excludeEmails?: string[];
  appUrl?: string;
  eventKeyPrefix?: string;
}) {
  const summary = emptySummary();
  const resolved = await resolveWorkspaceTaskRecipients({
    workspaceId: options.workspaceId,
    projectRef: options.projectRef,
    assignedTo: options.assignedTo,
  });
  const recipients = filterRecipientsExcludingEmails(resolved.recipients, options.excludeEmails);
  const baseAppUrl = options.appUrl ?? getConfiguredAppUrl();

  for (const recipient of recipients) {
    const email = await buildTaskAssignedEmail({
      recipientName: recipient.name,
      taskTitle: options.taskTitle,
      projectName: resolved.projectName,
      assignedBy: options.assignedBy,
      statusLabel: formatNotificationStatusLabel(options.statusId),
      dueDate: options.dueDate,
      reminderDate: options.reminderDate,
      appUrl: baseAppUrl,
    });
    const result = await sendNotificationEmail({
      workspaceId: options.workspaceId,
      eventKey: `${options.eventKeyPrefix ?? "task-assigned"}:${options.taskId}:${normalizeEmail(recipient.email)}`,
      category: "task-assigned",
      subject: email.subject,
      to: recipient,
      html: email.html,
      text: email.text,
      metadata: {
        taskId: options.taskId,
        projectRef: options.projectRef,
        statusId: options.statusId ?? null,
      },
      preferenceKey: "tasks",
    });

    applySendStatus(summary, result.status);
  }

  if (recipients.length > 0) {
    const context = await loadWorkspaceBundleContext(options.workspaceId, new Map());

    if (
      context
      && appendProjectTaskNotification(context, {
        eventId: `task-assigned:${options.taskId}`,
        projectRef: options.projectRef,
        title: "Task assigned",
        body: `"${options.taskTitle}" was assigned and shared with the task owners.`,
        kind: "task",
        taskId: options.taskId,
        targetColumnId: options.statusId,
      })
    ) {
      await persistWorkspaceNotifications(context);
    }
  }

  return summary;
}

export async function sendTaskChecklistCompletedNotification(options: {
  workspaceId: string;
  projectRef: string;
  taskId: number;
  taskTitle: string;
  checklistItemId: string;
  checklistItemTitle: string;
  assignedTo?: string | null;
  statusId?: string | null;
  completedBy: string;
  excludeEmails?: string[];
  appUrl?: string;
  eventKeyPrefix?: string;
}) {
  const summary = emptySummary();
  const resolved = await resolveWorkspaceTaskRecipients({
    workspaceId: options.workspaceId,
    projectRef: options.projectRef,
    assignedTo: options.assignedTo,
  });
  const recipients = filterRecipientsExcludingEmails(resolved.recipients, options.excludeEmails);
  const baseAppUrl = options.appUrl ?? getConfiguredAppUrl();

  for (const recipient of recipients) {
    const email = await buildTaskChecklistCompletedEmail({
      recipientName: recipient.name,
      taskTitle: options.taskTitle,
      checklistItemTitle: options.checklistItemTitle,
      projectName: resolved.projectName,
      completedBy: options.completedBy,
      statusLabel: formatNotificationStatusLabel(options.statusId),
      appUrl: baseAppUrl,
    });
    const result = await sendNotificationEmail({
      workspaceId: options.workspaceId,
      eventKey: `${options.eventKeyPrefix ?? "task-checklist-completed"}:${options.taskId}:${options.checklistItemId}:${normalizeEmail(recipient.email)}`,
      category: "task-checklist-completed",
      subject: email.subject,
      to: recipient,
      html: email.html,
      text: email.text,
      metadata: {
        taskId: options.taskId,
        checklistItemId: options.checklistItemId,
        projectRef: options.projectRef,
        statusId: options.statusId ?? null,
      },
      preferenceKey: "tasks",
    });

    applySendStatus(summary, result.status);
  }

  if (recipients.length > 0) {
    const context = await loadWorkspaceBundleContext(options.workspaceId, new Map());

    if (
      context
      && appendProjectTaskNotification(context, {
        eventId: `task-checklist-completed:${options.taskId}:${options.checklistItemId}`,
        projectRef: options.projectRef,
        title: "Checklist item completed",
        body: `${options.completedBy} completed "${options.checklistItemTitle}" on "${options.taskTitle}".`,
        kind: "completed",
        taskId: options.taskId,
        targetColumnId: options.statusId,
      })
    ) {
      await persistWorkspaceNotifications(context);
    }
  }

  return summary;
}

export async function processTaskReminderEmails(options: ProcessOptions = {}) {
  const summary = emptySummary();
  const pool = getDbPool();
  const appUrl = options.appUrl ?? getConfiguredAppUrl();
  const bundleCache = new Map<string, WorkspaceBundleContext>();
  const result = await pool.query<ReminderTaskRow>(
    `
      select id, workspace_id, title, status_id, assigned_to, due_date::text, reminder_date::text, project_ref
      , reminder_at::text
      from public.app_tasks
      where reminder_at is not null
        and reminder_at <= now()
        and workspace_id is not null
        and ($1::uuid is null or workspace_id = $1::uuid)
      order by id asc
    `,
    [options.workspaceId ?? null],
  );

  for (const task of result.rows) {
    const context = await loadWorkspaceBundleContext(task.workspace_id, bundleCache);

    if (!context) {
      continue;
    }

    const project = context.bundle.projects.find((entry) => String(entry.id) === task.project_ref);
    const recipients = resolveProjectMemberRecipients(context, task.project_ref, parseAssignedNames(task.assigned_to));

    for (const recipient of recipients) {
      const email = await buildTaskReminderEmail({
        recipientName: recipient.name,
        taskTitle: task.title,
        projectName: project?.name ?? "Project",
        statusLabel: formatNotificationStatusLabel(task.status_id),
        dueDate: task.due_date,
        reminderDate: task.reminder_at ?? task.reminder_date,
        appUrl,
      });
      const sendResult = await sendNotificationEmail({
        workspaceId: task.workspace_id,
        eventKey: `task-reminder:${buildReminderEventKey(task)}:${normalizeEmail(recipient.email)}`,
        category: "task-reminder",
        subject: email.subject,
        to: recipient,
        html: email.html,
        text: email.text,
        metadata: {
          taskId: task.id,
          projectRef: task.project_ref,
          reminderDate: task.reminder_at ?? task.reminder_date,
        },
        preferenceKey: "tasks",
      });

      applySendStatus(summary, sendResult.status);
    }

    if (recipients.length > 0 && appendReminderNotification(context, task, project?.name ?? "Project")) {
      await persistWorkspaceNotifications(context);
    }
  }

  return summary;
}

export async function processWorkspaceDigestEmails(options: ProcessOptions = {}) {
  const summary = emptySummary();
  const pool = getDbPool();
  const appUrl = options.appUrl ?? getConfiguredAppUrl();
  const todayKey = new Date().toISOString().slice(0, 10);
  const bundleCache = new Map<string, WorkspaceBundleContext>();
  const [recipientsResult, taskCountsResult, dueProjectsResult, unreadChatsResult] = await Promise.all([
    pool.query<DigestRecipientRow>(
      `
        select
          members.user_id,
          members.workspace_id,
          profiles.email,
          coalesce(profiles.full_name, profiles.first_name, split_part(profiles.email, '@', 1)) as display_name,
          workspaces.name as workspace_name
        from public.workspace_members members
        join public.user_profiles profiles on profiles.id = members.user_id
        join public.workspaces workspaces on workspaces.id = members.workspace_id
        where members.status = 'active'
          and ($1::uuid is null or members.workspace_id = $1::uuid)
      `,
      [options.workspaceId ?? null],
    ),
    pool.query<WorkspaceTaskCountRow>(
      `
        select
          workspace_id,
          count(*) filter (where status_id not in ('completed', 'done'))::text as active_task_count,
          count(*) filter (where due_date = current_date)::text as due_today_count,
          count(*) filter (where reminder_at is not null and reminder_at::date = current_date)::text as reminder_count
        from public.app_tasks
        where workspace_id is not null
          and ($1::uuid is null or workspace_id = $1::uuid)
        group by workspace_id
      `,
      [options.workspaceId ?? null],
    ),
    pool.query<WorkspaceDueProjectRow>(
      `
        select workspace_id, project_ref, count(*)::text as total
        from public.app_tasks
        where due_date = current_date
          and workspace_id is not null
          and ($1::uuid is null or workspace_id = $1::uuid)
        group by workspace_id, project_ref
      `,
      [options.workspaceId ?? null],
    ),
    pool.query<UserUnreadChatRow>(
      `
        select
          members.user_id,
          members.workspace_id,
          sum(threads.unread_count)::text as unread_count
        from public.workspace_members members
        join public.app_chat_threads threads on threads.user_id = members.user_id
        where members.status = 'active'
          and threads.unread_count > 0
          and ($1::uuid is null or members.workspace_id = $1::uuid)
        group by members.user_id, members.workspace_id
      `,
      [options.workspaceId ?? null],
    ),
  ]);

  const taskCountsByWorkspace = new Map(
    taskCountsResult.rows.map((row) => [
      row.workspace_id,
      {
        activeTaskCount: Number(row.active_task_count || 0),
        dueTodayCount: Number(row.due_today_count || 0),
        reminderCount: Number(row.reminder_count || 0),
      },
    ]),
  );
  const unreadChatsByUser = new Map(
    unreadChatsResult.rows.map((row) => [`${row.workspace_id}:${row.user_id}`, Number(row.unread_count || 0)]),
  );
  const dueProjectsByWorkspace = dueProjectsResult.rows.reduce<Map<string, WorkspaceDueProjectRow[]>>((map, row) => {
    const current = map.get(row.workspace_id) ?? [];
    current.push(row);
    map.set(row.workspace_id, current);
    return map;
  }, new Map());

  for (const recipient of recipientsResult.rows) {
    const context = await loadWorkspaceBundleContext(recipient.workspace_id, bundleCache);

    if (!context) {
      continue;
    }

    const counts = taskCountsByWorkspace.get(recipient.workspace_id) ?? {
      activeTaskCount: 0,
      dueTodayCount: 0,
      reminderCount: 0,
    };
    const unreadChatCount = unreadChatsByUser.get(`${recipient.workspace_id}:${recipient.user_id}`) ?? 0;

    if (
      context.bundle.projects.length === 0
      && counts.activeTaskCount === 0
      && counts.dueTodayCount === 0
      && counts.reminderCount === 0
      && unreadChatCount === 0
    ) {
      continue;
    }

    const highlightedProjects = (dueProjectsByWorkspace.get(recipient.workspace_id) ?? [])
      .sort((left, right) => Number(right.total) - Number(left.total))
      .slice(0, 4)
      .map((entry) => {
        const project = context.bundle.projects.find((item) => String(item.id) === entry.project_ref);
        return project ? `${project.name}: ${entry.total} task${entry.total === "1" ? "" : "s"} due today` : "";
      })
      .filter(Boolean);
    const email = await buildWorkspaceDigestEmail({
      recipientName: recipient.display_name ?? undefined,
      workspaceName: recipient.workspace_name,
      projectCount: context.bundle.projects.length,
      activeTaskCount: counts.activeTaskCount,
      dueTodayCount: counts.dueTodayCount,
      reminderCount: counts.reminderCount,
      unreadChatCount,
      highlightedProjects,
      appUrl,
    });
    const sendResult = await sendNotificationEmail({
      workspaceId: recipient.workspace_id,
      eventKey: `workspace-digest:${recipient.user_id}:${todayKey}`,
      category: "workspace-digest",
      subject: email.subject,
      to: {
        email: recipient.email,
        name: recipient.display_name ?? undefined,
      },
      html: email.html,
      text: email.text,
      metadata: {
        workspaceId: recipient.workspace_id,
        projectCount: context.bundle.projects.length,
        activeTaskCount: counts.activeTaskCount,
        dueTodayCount: counts.dueTodayCount,
        unreadChatCount,
      },
      preferenceKey: "digest",
    });

    applySendStatus(summary, sendResult.status);
  }

  return summary;
}

export async function processUnreadChatEmails(options: ProcessOptions = {}) {
  const summary = emptySummary();
  const pool = getDbPool();
  const appUrl = options.appUrl ?? getConfiguredAppUrl();
  const result = await pool.query<ChatUnreadRow>(
    `
      select
        threads.id as thread_id,
        threads.user_id,
        membership.workspace_id,
        profiles.email,
        coalesce(profiles.full_name, profiles.first_name, split_part(profiles.email, '@', 1)) as display_name,
        threads.contact_name,
        threads.unread_count,
        latest.content as latest_message,
        latest.sent_at::text as latest_sent_at,
        greatest(8, floor(extract(epoch from (now() - latest.sent_at)) / 3600))::int as hours_unread
      from public.app_chat_threads threads
      join public.user_profiles profiles on profiles.id = threads.user_id
      left join public.app_chat_preferences chat_preferences
        on chat_preferences.user_id = threads.user_id
      left join lateral (
        select workspace_id
        from public.workspace_members
        where user_id = threads.user_id
        order by created_at asc
        limit 1
      ) membership on true
      join lateral (
        select content, sent_at
        from public.app_chat_messages messages
        where messages.thread_id = threads.id
          and messages.sender = 'them'
        order by messages.sent_at desc
        limit 1
      ) latest on true
      where threads.unread_count > 0
        and threads.muted = false
        and threads.blocked = false
        and coalesce(chat_preferences.do_not_disturb, false) = false
        and latest.sent_at <= now() - interval '8 hours'
        and ($1::uuid is null or membership.workspace_id = $1::uuid)
    `,
    [options.workspaceId ?? null],
  );

  for (const thread of result.rows) {
    const email = await buildUnreadChatEmail({
      recipientName: thread.display_name ?? undefined,
      contactName: thread.contact_name,
      unreadCount: thread.unread_count,
      hoursUnread: thread.hours_unread,
      preview: thread.latest_message,
      appUrl,
    });
    const sendResult = await sendNotificationEmail({
      workspaceId: thread.workspace_id,
      eventKey: `chat-unread:${thread.thread_id}:${thread.latest_sent_at}`,
      category: "chat-unread",
      subject: email.subject,
      to: {
        email: thread.email,
        name: thread.display_name ?? undefined,
      },
      html: email.html,
      text: email.text,
      metadata: {
        threadId: thread.thread_id,
        unreadCount: thread.unread_count,
        latestSentAt: thread.latest_sent_at,
      },
      preferenceKey: "mentions",
    });

    applySendStatus(summary, sendResult.status);
  }

  return summary;
}

export async function processAllNotificationEmails(options: ProcessOptions = {}) {
  const reminders = await processTaskReminderEmails(options);
  const digests = await processWorkspaceDigestEmails(options);
  const chats = await processUnreadChatEmails(options);
  const total = emptySummary();

  mergeSummary(total, reminders);
  mergeSummary(total, digests);
  mergeSummary(total, chats);

  return {
    reminders,
    digests,
    chats,
    total,
  };
}

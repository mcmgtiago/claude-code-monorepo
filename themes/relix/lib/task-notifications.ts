import "server-only";

import { TaskReminderTrigger } from "@prisma/client";
import { getPreferredWorkspaceSenderUserId, sendTrackedEmail } from "@/lib/email";
import { buildTaskReminderEmail } from "@/lib/email-html";
import { formatLocalizedDateTime, normalizeLocalizationSettings } from "@/lib/localization";
import { prisma } from "@/lib/prisma";

type TriggerConfig = {
  trigger: TaskReminderTrigger;
  label: string;
  offsetMs: number;
};

const triggerConfigs: TriggerConfig[] = [
  {
    trigger: TaskReminderTrigger.DAY_BEFORE,
    label: "1 day before",
    offsetMs: 24 * 60 * 60 * 1000
  },
  {
    trigger: TaskReminderTrigger.HOUR_BEFORE,
    label: "1 hour before",
    offsetMs: 60 * 60 * 1000
  }
];

function buildTaskLink(taskId: string, trigger: TaskReminderTrigger) {
  return `/tasks?taskId=${encodeURIComponent(taskId)}&trigger=${encodeURIComponent(trigger)}`;
}

type TaskRecipient = {
  id: string;
  fullName: string;
  email: string;
  workspaceId: string | null;
  status: string;
};

type DueTaskRecord = {
  id: string;
  workspaceId: string | null;
  title: string;
  dueDate: Date | null;
  ownerEmail: string;
  associateName: string | null;
  associateCompany: string | null;
  updatedAt: Date;
};

type TaskProcessingInput = {
  workspaceId?: string;
  now?: Date;
};

type TaskProcessingResult = {
  deliveredInApp: number;
  deliveredEmail: number;
  candidates: number;
};

async function listReminderCandidateTasks(input: TaskProcessingInput = {}) {
  return prisma.task.findMany({
    where: {
      workspaceId: input.workspaceId,
      status: "TODO",
      dueDate: {
        not: null
      }
    },
    select: {
      id: true,
      workspaceId: true,
      title: true,
      dueDate: true,
      ownerEmail: true,
      associateName: true,
      associateCompany: true,
      updatedAt: true
    }
  });
}

async function deliverTaskReminderToUser(input: {
  currentUser: TaskRecipient;
  task: DueTaskRecord;
  trigger: TriggerConfig;
  senderUserId: string | null;
  reminderInAppEnabled: boolean;
  reminderEmailEnabled: boolean;
  localization: ReturnType<typeof normalizeLocalizationSettings>;
  overdue: boolean;
}) {
  let deliveredInApp = 0;
  let deliveredEmail = 0;
  const dueDateLabel = input.task.dueDate ? formatLocalizedDateTime(input.task.dueDate, input.localization) : null;
  const body = input.overdue
    ? `${input.task.title} is overdue. It was scheduled for ${dueDateLabel}.`
    : `${input.task.title} is due ${input.trigger.label}. Scheduled for ${dueDateLabel}.`;
  const link = buildTaskLink(input.task.id, input.trigger.trigger);

  const delivery = await prisma.taskReminderDelivery.upsert({
    where: {
      taskId_userId_trigger: {
        taskId: input.task.id,
        userId: input.currentUser.id,
        trigger: input.trigger.trigger
      }
    },
    update: {},
    create: {
      taskId: input.task.id,
      userId: input.currentUser.id,
      trigger: input.trigger.trigger
    }
  });

  if (input.reminderInAppEnabled && !delivery.notifiedAt) {
    const marked = await prisma.taskReminderDelivery.updateMany({
      where: {
        id: delivery.id,
        notifiedAt: null
      },
      data: {
        notifiedAt: new Date()
      }
    });

    if (marked.count > 0) {
      await prisma.appNotification.create({
        data: {
          userId: input.currentUser.id,
          kind: "TASK_REMINDER",
          title: input.task.title,
          body,
          link
        }
      });
      deliveredInApp += 1;
    }
  }

  if (input.reminderEmailEnabled && !delivery.emailedAt && input.senderUserId && dueDateLabel) {
    try {
      await sendTrackedEmail({
        userId: input.senderUserId,
        workspaceId: input.currentUser.workspaceId || input.task.workspaceId || "",
        to: input.currentUser.email,
        subject: `Task reminder: ${input.task.title}`,
        html: buildTaskReminderEmail({
          recipientName: input.currentUser.fullName,
          taskTitle: input.task.title,
          dueDate: dueDateLabel,
          reminderWindow: input.trigger.label,
          associateName: input.task.associateName ?? null,
          associateCompany: input.task.associateCompany ?? null,
          overdue: input.overdue
        })
      });

      const emailed = await prisma.taskReminderDelivery.updateMany({
        where: {
          id: delivery.id,
          emailedAt: null
        },
        data: {
          emailedAt: new Date()
        }
      });

      if (emailed.count > 0) {
        await prisma.appNotification.updateMany({
          where: {
            userId: input.currentUser.id,
            kind: "TASK_REMINDER",
            title: input.task.title,
            link,
            emailedAt: null
          },
          data: {
            emailedAt: new Date()
          }
        });
        deliveredEmail += 1;
      }
    } catch {
      // In-app notification should still persist even if SMTP sending fails.
    }
  }

  return {
    deliveredInApp,
    deliveredEmail
  };
}

export async function processDueTaskNotificationsForUser(input: { userId: string; workspaceId: string }) {
  const now = new Date();
  const currentUser = await prisma.user.findUnique({
    where: { id: input.userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      workspaceId: true,
      status: true
    }
  });

  if (!currentUser || currentUser.status !== "ACTIVE" || currentUser.workspaceId !== input.workspaceId) {
    return { deliveredInApp: 0, deliveredEmail: 0, candidates: 0 };
  }

  const [workspaceSettings, senderUserId, tasks] = await Promise.all([
    prisma.workspaceSetting.findFirst({
      where: { workspaceId: input.workspaceId },
      select: {
        countryCode: true,
        timezone: true,
        currencyCode: true,
        locale: true,
        dateFormat: true,
        timeFormat: true,
        weekStartsOn: true,
        reminderInAppEnabled: true,
        reminderEmailEnabled: true
      }
    }),
    getPreferredWorkspaceSenderUserId(input.workspaceId),
    prisma.task.findMany({
      where: {
        workspaceId: input.workspaceId,
        status: "TODO",
        dueDate: {
          not: null
        },
        ownerEmail: currentUser.email
      },
      select: {
        id: true,
        workspaceId: true,
        title: true,
        dueDate: true,
        ownerEmail: true,
        associateName: true,
        associateCompany: true,
        updatedAt: true
      }
    })
  ]);

  const localization = normalizeLocalizationSettings(workspaceSettings);
  const reminderInAppEnabled = workspaceSettings?.reminderInAppEnabled ?? true;
  const reminderEmailEnabled = workspaceSettings?.reminderEmailEnabled ?? true;
  let deliveredInApp = 0;
  let deliveredEmail = 0;
  let candidates = 0;

  for (const task of tasks) {
    if (!task.dueDate) {
      continue;
    }

    for (const config of triggerConfigs) {
      const thresholdAt = new Date(task.dueDate.getTime() - config.offsetMs);

      if (now < thresholdAt || task.updatedAt > thresholdAt) {
        continue;
      }

      candidates += 1;
      const overdue = now >= task.dueDate;
      const result = await deliverTaskReminderToUser({
        currentUser,
        task,
        trigger: config,
        senderUserId,
        reminderInAppEnabled,
        reminderEmailEnabled,
        localization,
        overdue
      });
      deliveredInApp += result.deliveredInApp;
      deliveredEmail += result.deliveredEmail;
    }
  }

  return {
    deliveredInApp,
    deliveredEmail,
    candidates
  };
}

export async function processDueTaskNotifications(input: TaskProcessingInput = {}): Promise<TaskProcessingResult> {
  const now = input.now || new Date();
  const tasks = await listReminderCandidateTasks(input);

  if (!tasks.length) {
    return { deliveredInApp: 0, deliveredEmail: 0, candidates: 0 };
  }

  const workspaceIds = Array.from(
    new Set(tasks.map((task) => task.workspaceId).filter((workspaceId): workspaceId is string => Boolean(workspaceId)))
  );

  if (!workspaceIds.length) {
    return { deliveredInApp: 0, deliveredEmail: 0, candidates: 0 };
  }

  const ownerEmails = Array.from(new Set(tasks.map((task) => task.ownerEmail).filter(Boolean)));
  const [workspaceSettings, users, senderUserIds] = await Promise.all([
    prisma.workspaceSetting.findMany({
      where: { workspaceId: { in: workspaceIds } },
      select: {
        workspaceId: true,
        countryCode: true,
        timezone: true,
        currencyCode: true,
        locale: true,
        dateFormat: true,
        timeFormat: true,
        weekStartsOn: true,
        reminderInAppEnabled: true,
        reminderEmailEnabled: true
      }
    }),
    prisma.user.findMany({
      where: {
        status: "ACTIVE",
        workspaceId: { in: workspaceIds },
        email: { in: ownerEmails }
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        workspaceId: true,
        status: true
      }
    }),
    Promise.all(
      workspaceIds.map(async (workspaceId) => [workspaceId, await getPreferredWorkspaceSenderUserId(workspaceId)] as const)
    )
  ]);

  const settingsByWorkspaceId = new Map(workspaceSettings.map((settings) => [settings.workspaceId, settings]));
  const senderUserIdByWorkspaceId = new Map(senderUserIds);
  const usersByWorkspaceAndEmail = new Map<string, TaskRecipient>();

  for (const user of users) {
    if (!user.workspaceId) {
      continue;
    }

    usersByWorkspaceAndEmail.set(`${user.workspaceId}:${user.email.toLowerCase()}`, user);
  }

  let deliveredInApp = 0;
  let deliveredEmail = 0;
  let candidates = 0;

  for (const task of tasks) {
    if (!task.workspaceId || !task.dueDate) {
      continue;
    }

    const recipient = usersByWorkspaceAndEmail.get(`${task.workspaceId}:${task.ownerEmail.toLowerCase()}`);

    if (!recipient) {
      continue;
    }

    const workspaceSettingsForTask = settingsByWorkspaceId.get(task.workspaceId);
    const localization = normalizeLocalizationSettings(workspaceSettingsForTask);
    const reminderInAppEnabled = workspaceSettingsForTask?.reminderInAppEnabled ?? true;
    const reminderEmailEnabled = workspaceSettingsForTask?.reminderEmailEnabled ?? true;
    const senderUserId = senderUserIdByWorkspaceId.get(task.workspaceId) || null;

    for (const config of triggerConfigs) {
      const thresholdAt = new Date(task.dueDate.getTime() - config.offsetMs);

      if (now < thresholdAt || task.updatedAt > thresholdAt) {
        continue;
      }

      candidates += 1;
      const overdue = now >= task.dueDate;
      const result = await deliverTaskReminderToUser({
        currentUser: recipient,
        task,
        trigger: config,
        senderUserId,
        reminderInAppEnabled,
        reminderEmailEnabled,
        localization,
        overdue
      });
      deliveredInApp += result.deliveredInApp;
      deliveredEmail += result.deliveredEmail;
    }
  }

  return {
    deliveredInApp,
    deliveredEmail,
    candidates
  };
}

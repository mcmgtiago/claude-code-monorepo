import "server-only";

import { getPreferredWorkspaceSenderUserId, sendTrackedEmail } from "@/lib/email";
import { buildLeadReminderDueEmail } from "@/lib/email-html";
import { parseAssignedUserEntries } from "@/lib/lead-assignees";
import { formatLocalizedDateTime, normalizeLocalizationSettings } from "@/lib/localization";
import { prisma } from "@/lib/prisma";

function buildNotificationLink(leadId: string, reminderId: string) {
  return `/pipeline?leadId=${encodeURIComponent(leadId)}&reminderId=${encodeURIComponent(reminderId)}`;
}

type ReminderRecipient = {
  id: string;
  fullName: string;
  email: string;
  workspaceId: string | null;
  status: string;
};

type DueReminderRecord = {
  id: string;
  title: string;
  remindAt: Date;
  leadId: string;
  lead: {
    id: string;
    workspaceId: string | null;
    name: string;
    company: string | null;
    assignedUsersJson: string | null;
    companyRecord: {
      name: string;
    } | null;
  };
};

type ReminderProcessingResult = {
  deliveredInApp: number;
  deliveredEmail: number;
  dueReminders: number;
};

type ReminderProcessingInput = {
  workspaceId?: string;
  now?: Date;
};

async function listDueReminders(input: ReminderProcessingInput = {}) {
  return prisma.leadReminder.findMany({
    where: {
      completedAt: null,
      remindAt: {
        lte: input.now || new Date()
      },
      lead: {
        workspaceId: input.workspaceId
      }
    },
    select: {
      id: true,
      title: true,
      remindAt: true,
      leadId: true,
      lead: {
        select: {
          id: true,
          workspaceId: true,
          name: true,
          company: true,
          assignedUsersJson: true,
          companyRecord: {
            select: { name: true }
          }
        }
      }
    },
    orderBy: { remindAt: "asc" }
  });
}

async function deliverReminderToUser(input: {
  currentUser: ReminderRecipient;
  reminder: DueReminderRecord;
  senderUserId: string | null;
  reminderInAppEnabled: boolean;
  reminderEmailEnabled: boolean;
  localization: ReturnType<typeof normalizeLocalizationSettings>;
}) {
  let deliveredInApp = 0;
  let deliveredEmail = 0;
  const companyName = input.reminder.lead.companyRecord?.name || input.reminder.lead.company || "No company";
  const body = `${input.reminder.lead.name} at ${companyName} is due now. Scheduled for ${formatLocalizedDateTime(input.reminder.remindAt, input.localization)}.`;
  const link = buildNotificationLink(input.reminder.leadId, input.reminder.id);

  const delivery = await prisma.leadReminderDelivery.upsert({
    where: {
      reminderId_userId: {
        reminderId: input.reminder.id,
        userId: input.currentUser.id
      }
    },
    update: {},
    create: {
      reminderId: input.reminder.id,
      userId: input.currentUser.id
    }
  });

  if (input.reminderInAppEnabled && !delivery.notifiedAt) {
    const marked = await prisma.leadReminderDelivery.updateMany({
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
          kind: "LEAD_REMINDER",
          title: input.reminder.title,
          body,
          link
        }
      });
      deliveredInApp += 1;
    }
  }

  if (input.reminderEmailEnabled && !delivery.emailedAt && input.senderUserId) {
    try {
      await sendTrackedEmail({
        userId: input.senderUserId,
        workspaceId: input.currentUser.workspaceId || input.reminder.lead.workspaceId || "",
        to: input.currentUser.email,
        subject: `Reminder: ${input.reminder.title}`,
        html: buildLeadReminderDueEmail({
          recipientName: input.currentUser.fullName,
          reminderTitle: input.reminder.title,
          leadName: input.reminder.lead.name,
          companyName,
          scheduledFor: formatLocalizedDateTime(input.reminder.remindAt, input.localization)
        })
      });

      const emailed = await prisma.leadReminderDelivery.updateMany({
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
            kind: "LEAD_REMINDER",
            title: input.reminder.title,
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

export async function processDueReminderNotificationsForUser(input: { userId: string; workspaceId: string }) {
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
    return { deliveredInApp: 0, deliveredEmail: 0, dueReminders: 0 };
  }

  const [workspaceSettings, senderUserId, dueReminders] = await Promise.all([
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
    listDueReminders({ workspaceId: input.workspaceId })
  ]);

  const localization = normalizeLocalizationSettings(workspaceSettings);
  const reminderInAppEnabled = workspaceSettings?.reminderInAppEnabled ?? true;
  const reminderEmailEnabled = workspaceSettings?.reminderEmailEnabled ?? true;
  const dueForUser = dueReminders.filter((reminder) => {
    const assignedUsers = parseAssignedUserEntries(reminder.lead.assignedUsersJson);
    return assignedUsers.some((entry) => entry.id === currentUser.id || entry.fullName === currentUser.fullName);
  });

  if (!dueForUser.length) {
    return { deliveredInApp: 0, deliveredEmail: 0, dueReminders: 0 };
  }

  let deliveredInApp = 0;
  let deliveredEmail = 0;

  for (const reminder of dueForUser) {
    const result = await deliverReminderToUser({
      currentUser,
      reminder,
      senderUserId,
      reminderInAppEnabled,
      reminderEmailEnabled,
      localization
    });
    deliveredInApp += result.deliveredInApp;
    deliveredEmail += result.deliveredEmail;
  }

  return {
    deliveredInApp,
    deliveredEmail,
    dueReminders: dueForUser.length
  };
}

export async function processDueReminderNotifications(input: ReminderProcessingInput = {}): Promise<ReminderProcessingResult> {
  const dueReminders = await listDueReminders(input);

  if (!dueReminders.length) {
    return { deliveredInApp: 0, deliveredEmail: 0, dueReminders: 0 };
  }

  const workspaceIds = Array.from(
    new Set(
      dueReminders
        .map((reminder) => reminder.lead.workspaceId)
        .filter((workspaceId): workspaceId is string => typeof workspaceId === "string" && workspaceId.length > 0)
    )
  );

  if (!workspaceIds.length) {
    return { deliveredInApp: 0, deliveredEmail: 0, dueReminders: 0 };
  }

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
        workspaceId: { in: workspaceIds }
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
  const usersByWorkspaceAndId = new Map<string, ReminderRecipient>();
  const usersByWorkspaceAndName = new Map<string, ReminderRecipient[]>();

  for (const user of users) {
    if (!user.workspaceId) {
      continue;
    }

    usersByWorkspaceAndId.set(`${user.workspaceId}:${user.id}`, user);
    const key = `${user.workspaceId}:${user.fullName}`;
    const existing = usersByWorkspaceAndName.get(key);

    if (existing) {
      existing.push(user);
      continue;
    }

    usersByWorkspaceAndName.set(key, [user]);
  }

  let deliveredInApp = 0;
  let deliveredEmail = 0;
  let dueReminderCount = 0;

  for (const reminder of dueReminders) {
    const workspaceId = reminder.lead.workspaceId;

    if (!workspaceId) {
      continue;
    }

    const assignedUserEntries = parseAssignedUserEntries(reminder.lead.assignedUsersJson);

    if (!assignedUserEntries.length) {
      continue;
    }

    dueReminderCount += 1;
    const workspaceSettingsForReminder = settingsByWorkspaceId.get(workspaceId);
    const localization = normalizeLocalizationSettings(workspaceSettingsForReminder);
    const reminderInAppEnabled = workspaceSettingsForReminder?.reminderInAppEnabled ?? true;
    const reminderEmailEnabled = workspaceSettingsForReminder?.reminderEmailEnabled ?? true;
    const senderUserId = senderUserIdByWorkspaceId.get(workspaceId) || null;

    for (const assignedUser of assignedUserEntries) {
      const recipients = assignedUser.id
        ? [usersByWorkspaceAndId.get(`${workspaceId}:${assignedUser.id}`)].filter(Boolean) as ReminderRecipient[]
        : usersByWorkspaceAndName.get(`${workspaceId}:${assignedUser.fullName}`) || [];

      for (const recipient of recipients) {
        const result = await deliverReminderToUser({
          currentUser: recipient,
          reminder,
          senderUserId,
          reminderInAppEnabled,
          reminderEmailEnabled,
          localization
        });
        deliveredInApp += result.deliveredInApp;
        deliveredEmail += result.deliveredEmail;
      }
    }
  }

  return {
    deliveredInApp,
    deliveredEmail,
    dueReminders: dueReminderCount
  };
}

const { PrismaClient } = require("@prisma/client");
const { randomBytes, scryptSync } = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const prisma = new PrismaClient();

function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), ".env");

  if (!fs.existsSync(envPath)) {
    return;
  }

  const content = fs.readFileSync(envPath, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();

    if (!key || Object.prototype.hasOwnProperty.call(process.env, key)) {
      continue;
    }

    let value = line.slice(separatorIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

loadEnvFile();

function hashPassword(password) {
  const salt = randomBytes(16);
  const derivedKey = scryptSync(password, salt, 64);

  return `scrypt$${salt.toString("hex")}$${derivedKey.toString("hex")}`;
}

function slugifyWorkspaceName(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "workspace";
}

async function createUniqueWorkspaceSlug(name) {
  const baseSlug = slugifyWorkspaceName(name);
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.workspace.findUnique({
      where: { slug: candidate },
      select: { id: true }
    });

    if (!existing) {
      return candidate;
    }

    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }
}

async function createUniqueMeetingSlug(value, workspaceId) {
  const baseSlug = slugifyWorkspaceName(value || "workspace-owner");
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const [page, preference] = await Promise.all([
      prisma.schedulingPage.findFirst({
        where: { slug: candidate },
        select: { id: true }
      }),
      prisma.meetingPreference.findFirst({
        where: {
          personalMeetingSlug: candidate,
          ...(workspaceId ? { workspaceId: { not: workspaceId } } : {})
        },
        select: { id: true }
      })
    ]);

    if (!page && !preference) {
      return candidate;
    }

    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }
}

async function ensureWorkspaceForGroup(name, createdById) {
  const existing = await prisma.workspace.findFirst({
    where: {
      name,
      ...(createdById ? { createdById } : {})
    },
    select: { id: true, name: true, slug: true, createdById: true }
  });

  if (existing) {
    return existing;
  }

  return prisma.workspace.create({
    data: {
      name,
      slug: await createUniqueWorkspaceSlug(name),
      createdById: createdById || null
    },
    select: { id: true, name: true, slug: true, createdById: true }
  });
}

async function ensureWorkspaceDefaults(workspaceId, ownerName, ownerEmail, slugFallback) {
  await prisma.workspaceSetting.upsert({
    where: { workspaceId },
    update: {},
    create: {
      workspaceId,
      countryCode: "IN",
      timezone: "Asia/Kolkata",
      currencyCode: "INR",
      locale: "en-IN",
      dateFormat: "DD MMM YYYY",
      timeFormat: "12h",
      weekStartsOn: "Monday"
    }
  });

  const personalMeetingSlug = await createUniqueMeetingSlug(slugFallback || ownerName || "workspace-owner", workspaceId);

  await prisma.meetingPreference.upsert({
    where: { workspaceId },
    update: {
      ...(ownerName ? { profileName: ownerName } : {}),
      ...(ownerEmail ? { profileEmail: ownerEmail } : {})
    },
    create: {
      workspaceId,
      profileName: ownerName || "Workspace Owner",
      profileEmail: ownerEmail || "owner@workspace.local",
      personalMeetingSlug
    }
  });

  const existingPage = await prisma.schedulingPage.findFirst({
    where: { workspaceId },
    select: { id: true }
  });

  if (!existingPage) {
    await prisma.schedulingPage.create({
      data: {
        workspaceId,
        title: "Intro call",
        slug: await createUniqueMeetingSlug(`${personalMeetingSlug}-intro`, workspaceId),
        durationMinutes: 30,
        hostType: "Single host",
        active: true,
        hostName: ownerName || "Workspace Owner",
        hostEmail: ownerEmail || "owner@workspace.local"
      }
    });
  }
}

async function migrateLegacyWorkspaceSettings(workspaceId) {
  const legacySettings = await prisma.workspaceSetting.findMany({
    where: { workspaceId: null },
    orderBy: { createdAt: "asc" }
  });

  if (!legacySettings.length) {
    return;
  }

  const source = legacySettings[0];

  await prisma.workspaceSetting.upsert({
    where: { workspaceId },
    update: {
      smtpHost: source.smtpHost,
      smtpPort: source.smtpPort,
      smtpUser: source.smtpUser,
      smtpPass: source.smtpPass,
      smtpFrom: source.smtpFrom,
      imapHost: source.imapHost,
      imapPort: source.imapPort,
      imapUser: source.imapUser,
      imapPass: source.imapPass,
      imapSecure: source.imapSecure,
      countryCode: source.countryCode,
      timezone: source.timezone,
      currencyCode: source.currencyCode,
      locale: source.locale,
      dateFormat: source.dateFormat,
      timeFormat: source.timeFormat,
      weekStartsOn: source.weekStartsOn,
      openTrackingEnabled: source.openTrackingEnabled,
      clickTrackingEnabled: source.clickTrackingEnabled
    },
    create: {
      workspaceId,
      smtpHost: source.smtpHost,
      smtpPort: source.smtpPort,
      smtpUser: source.smtpUser,
      smtpPass: source.smtpPass,
      smtpFrom: source.smtpFrom,
      imapHost: source.imapHost,
      imapPort: source.imapPort,
      imapUser: source.imapUser,
      imapPass: source.imapPass,
      imapSecure: source.imapSecure,
      countryCode: source.countryCode,
      timezone: source.timezone,
      currencyCode: source.currencyCode,
      locale: source.locale,
      dateFormat: source.dateFormat,
      timeFormat: source.timeFormat,
      weekStartsOn: source.weekStartsOn,
      openTrackingEnabled: source.openTrackingEnabled,
      clickTrackingEnabled: source.clickTrackingEnabled
    }
  });

  await prisma.workspaceSetting.deleteMany({
    where: { workspaceId: null }
  });
}

async function migrateLegacyMeetingPreferences(workspaceId) {
  const legacyPreferences = await prisma.meetingPreference.findMany({
    where: { workspaceId: null },
    orderBy: { createdAt: "asc" }
  });

  if (!legacyPreferences.length) {
    return;
  }

  const source = legacyPreferences[0];
  const personalMeetingSlug = await createUniqueMeetingSlug(source.personalMeetingSlug, workspaceId);

  await prisma.meetingPreference.upsert({
    where: { workspaceId },
    update: {
      profileName: source.profileName,
      profileEmail: source.profileEmail,
      personalMeetingSlug,
      timezoneLabel: source.timezoneLabel,
      googleMeetConnected: source.googleMeetConnected,
      zoomConnected: source.zoomConnected,
      microsoftTeamsConnected: source.microsoftTeamsConnected,
      customLink: source.customLink,
      defaultLocationType: source.defaultLocationType,
      weeklyAvailability: source.weeklyAvailability,
      bufferBeforeEnabled: source.bufferBeforeEnabled,
      bufferBeforeMinutes: source.bufferBeforeMinutes,
      bufferAfterEnabled: source.bufferAfterEnabled,
      bufferAfterMinutes: source.bufferAfterMinutes,
      minNoticeValue: source.minNoticeValue,
      minNoticeUnit: source.minNoticeUnit
    },
    create: {
      workspaceId,
      profileName: source.profileName,
      profileEmail: source.profileEmail,
      personalMeetingSlug,
      timezoneLabel: source.timezoneLabel,
      googleMeetConnected: source.googleMeetConnected,
      zoomConnected: source.zoomConnected,
      microsoftTeamsConnected: source.microsoftTeamsConnected,
      customLink: source.customLink,
      defaultLocationType: source.defaultLocationType,
      weeklyAvailability: source.weeklyAvailability,
      bufferBeforeEnabled: source.bufferBeforeEnabled,
      bufferBeforeMinutes: source.bufferBeforeMinutes,
      bufferAfterEnabled: source.bufferAfterEnabled,
      bufferAfterMinutes: source.bufferAfterMinutes,
      minNoticeValue: source.minNoticeValue,
      minNoticeUnit: source.minNoticeUnit
    }
  });

  await prisma.meetingPreference.deleteMany({
    where: { workspaceId: null }
  });
}

async function main() {
  const now = new Date();
  const superuserEmail = process.env.SUPERUSER_EMAIL?.trim().toLowerCase();
  const superuserPassword = process.env.SUPERUSER_PASSWORD?.trim();
  const superuserName = process.env.SUPERUSER_NAME?.trim() || "Platform Owner";

  if (!superuserEmail || !superuserPassword) {
    throw new Error("Missing SUPERUSER_EMAIL or SUPERUSER_PASSWORD in environment.");
  }

  const passwordHash = hashPassword(superuserPassword);

  const superuser = await prisma.user.upsert({
    where: { email: superuserEmail },
    update: {
      fullName: superuserName,
      passwordHash,
      accessRole: "SUPERUSER",
      status: "ACTIVE",
      onboardingCompleted: true,
      onboardingCompletedAt: now,
      workspaceName: "Relix CRM",
      lastActiveAt: now
    },
    create: {
      fullName: superuserName,
      email: superuserEmail,
      passwordHash,
      accessRole: "SUPERUSER",
      status: "ACTIVE",
      onboardingCompleted: true,
      onboardingCompletedAt: now,
      workspaceName: "Relix CRM",
      lastActiveAt: now
    }
  });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      fullName: true,
      email: true,
      workspaceId: true,
      workspaceName: true
    }
  });

  const usersWithoutWorkspace = users.filter((user) => !user.workspaceId);
  const groups = new Map();

  for (const user of usersWithoutWorkspace) {
    const workspaceName = (user.workspaceName || `${user.fullName.split(" ")[0] || "Team"} Workspace`).trim();
    const groupKey = workspaceName.toLowerCase();
    const current = groups.get(groupKey) || {
      name: workspaceName,
      users: []
    };
    current.users.push(user);
    groups.set(groupKey, current);
  }

  const createdWorkspaces = [];

  for (const group of groups.values()) {
    const owner = group.users[0];
    const workspace = await ensureWorkspaceForGroup(group.name, owner?.id || null);
    createdWorkspaces.push({ workspace, owner });

    await prisma.user.updateMany({
      where: { id: { in: group.users.map((user) => user.id) } },
      data: {
        workspaceId: workspace.id,
        workspaceName: workspace.name,
        onboardingCompleted: true,
        onboardingCompletedAt: now
      }
    });

    await ensureWorkspaceDefaults(workspace.id, owner?.fullName, owner?.email, workspace.slug);
  }

  const defaultWorkspaceRecord =
    createdWorkspaces[0]?.workspace ||
    (await ensureWorkspaceForGroup("Relix CRM", superuser.id));
  const defaultOwner = createdWorkspaces[0]?.owner || superuser;

  await prisma.user.update({
    where: { id: superuser.id },
    data: {
      workspaceId: defaultWorkspaceRecord.id,
      workspaceName: defaultWorkspaceRecord.name
    }
  });

  await ensureWorkspaceDefaults(defaultWorkspaceRecord.id, defaultOwner.fullName, defaultOwner.email, defaultWorkspaceRecord.slug);

  await Promise.all([
    prisma.teamInvite.updateMany({
      where: { workspaceId: null },
      data: { workspaceId: defaultWorkspaceRecord.id }
    }),
    prisma.company.updateMany({
      where: { workspaceId: null },
      data: { workspaceId: defaultWorkspaceRecord.id }
    }),
    prisma.contact.updateMany({
      where: { workspaceId: null },
      data: { workspaceId: defaultWorkspaceRecord.id }
    }),
    prisma.lead.updateMany({
      where: { workspaceId: null },
      data: { workspaceId: defaultWorkspaceRecord.id }
    }),
    prisma.task.updateMany({
      where: { workspaceId: null },
      data: { workspaceId: defaultWorkspaceRecord.id }
    }),
    prisma.meetingEvent.updateMany({
      where: { workspaceId: null },
      data: { workspaceId: defaultWorkspaceRecord.id }
    }),
    prisma.schedulingPage.updateMany({
      where: { workspaceId: null },
      data: { workspaceId: defaultWorkspaceRecord.id }
    }),
    prisma.emailThread.updateMany({
      where: { workspaceId: null },
      data: {
        workspaceId: defaultWorkspaceRecord.id,
        mailboxUserId: defaultOwner.id
      }
    }),
    prisma.emailMessage.updateMany({
      where: { workspaceId: null },
      data: {
        workspaceId: defaultWorkspaceRecord.id,
        mailboxUserId: defaultOwner.id
      }
    }),
    prisma.trashEntry.updateMany({
      where: { workspaceId: null },
      data: { workspaceId: defaultWorkspaceRecord.id }
    })
  ]);

  await migrateLegacyWorkspaceSettings(defaultWorkspaceRecord.id);
  await migrateLegacyMeetingPreferences(defaultWorkspaceRecord.id);

  console.log(`Seeded superuser: ${superuser.email}`);
  console.log(`Default workspace: ${defaultWorkspaceRecord.name}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

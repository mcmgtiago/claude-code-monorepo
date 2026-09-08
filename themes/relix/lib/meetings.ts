import { MeetingLocationType, MeetingNoticeUnit, PrismaClient } from "@prisma/client";
import { normalizeMeetingSlug } from "@/lib/meeting-booking";
import { prisma } from "@/lib/prisma";

const DEFAULT_AVAILABILITY = JSON.stringify([
  { day: "Monday", enabled: true, start: "09:00 AM", end: "05:00 PM" },
  { day: "Tuesday", enabled: true, start: "09:00 AM", end: "05:00 PM" },
  { day: "Wednesday", enabled: true, start: "09:00 AM", end: "05:00 PM" },
  { day: "Thursday", enabled: true, start: "09:00 AM", end: "05:00 PM" },
  { day: "Friday", enabled: true, start: "09:00 AM", end: "05:00 PM" },
  { day: "Saturday", enabled: false, start: "09:00 AM", end: "05:00 PM" },
  { day: "Sunday", enabled: false, start: "09:00 AM", end: "05:00 PM" }
]);

const DEFAULT_MEETING_PROFILE = {
  name: "Workspace Owner",
  email: "owner@workspace.local",
  slug: "workspace-owner"
} as const;

const DEFAULT_TIMEZONE_LABEL = "India Standard Time (GMT +5:30)";

type PrismaLike = Pick<
  PrismaClient,
  "meetingPreference" | "schedulingPage"
>;

const defaultPreferences = {
  profileName: DEFAULT_MEETING_PROFILE.name,
  profileEmail: DEFAULT_MEETING_PROFILE.email,
  timezoneLabel: DEFAULT_TIMEZONE_LABEL,
  googleMeetConnected: false,
  zoomConnected: false,
  microsoftTeamsConnected: false,
  customLink: null,
  defaultLocationType: MeetingLocationType.GOOGLE_MEET,
  weeklyAvailability: DEFAULT_AVAILABILITY,
  bufferBeforeEnabled: false,
  bufferBeforeMinutes: 15,
  bufferAfterEnabled: false,
  bufferAfterMinutes: 15,
  minNoticeValue: 1,
  minNoticeUnit: MeetingNoticeUnit.HOURS
};

function fallbackSlugForWorkspace(workspaceId: string) {
  const suffix = normalizeMeetingSlug(workspaceId).slice(-8) || "default";
  return `workspace-${suffix}`;
}

function defaultPageSlugForWorkspace(workspaceId: string) {
  return `${fallbackSlugForWorkspace(workspaceId)}-intro`;
}

export async function isMeetingSlugAvailable(
  slug: string,
  options?: {
    workspaceId?: string;
    excludeSchedulingPageId?: string;
    excludeMeetingPreferenceId?: string;
  },
  db: PrismaLike = prisma
) {
  const [schedulingPage, meetingPreference] = await Promise.all([
    db.schedulingPage.findFirst({
      where: {
        slug,
        ...(options?.excludeSchedulingPageId ? { id: { not: options.excludeSchedulingPageId } } : {})
      },
      select: { id: true }
    }),
    db.meetingPreference.findFirst({
      where: {
        personalMeetingSlug: slug,
        ...(options?.excludeMeetingPreferenceId ? { id: { not: options.excludeMeetingPreferenceId } } : {})
      },
      select: { id: true }
    })
  ]);

  return !schedulingPage && !meetingPreference;
}

export async function createUniqueMeetingSlug(
  value: string,
  options?: {
    workspaceId?: string;
    excludeSchedulingPageId?: string;
    excludeMeetingPreferenceId?: string;
  },
  db: PrismaLike = prisma
) {
  const base = normalizeMeetingSlug(value) || fallbackSlugForWorkspace(options?.workspaceId || "default");

  for (let index = 0; index < 50; index += 1) {
    const candidate = index === 0 ? base : `${base}-${index + 1}`;
    if (await isMeetingSlugAvailable(candidate, options, db)) {
      return candidate;
    }
  }

  return `${base}-${Date.now().toString(36)}`;
}

export async function ensureMeetingWorkspaceDefaults(workspaceId = "default", db: PrismaLike = prisma) {
  const existingPreference = await db.meetingPreference.findUnique({
    where: { workspaceId }
  });
  const personalMeetingSlug =
    existingPreference?.personalMeetingSlug ||
    (await createUniqueMeetingSlug(fallbackSlugForWorkspace(workspaceId), { workspaceId }, db));

  await db.meetingPreference.upsert({
    where: { workspaceId },
    update: {},
    create: {
      workspaceId,
      personalMeetingSlug,
      ...defaultPreferences
    }
  });

  const existingPage = await db.schedulingPage.findFirst({
    where: { workspaceId },
    select: { id: true }
  });

  if (!existingPage) {
    const slug = await createUniqueMeetingSlug(defaultPageSlugForWorkspace(workspaceId), { workspaceId }, db);
    await db.schedulingPage.create({
      data: {
        workspaceId,
        title: "Intro call",
        slug,
        durationMinutes: 30,
        hostType: "Single host",
        active: true,
        hostName: existingPreference?.profileName || DEFAULT_MEETING_PROFILE.name,
        hostEmail: existingPreference?.profileEmail || DEFAULT_MEETING_PROFILE.email
      }
    });
  }
}

export function buildMeetingProfile(fullName: string, email: string) {
  const nameSlug = normalizeMeetingSlug(fullName);
  const emailSlug = normalizeMeetingSlug(email.split("@")[0] || "");

  return {
    profileName: fullName,
    profileEmail: email,
    personalMeetingSlug: nameSlug || emailSlug || "my-meeting"
  };
}

export async function syncMeetingWorkspaceOwner(user: { fullName: string; email: string }, workspaceId = "default") {
  const profile = buildMeetingProfile(user.fullName, user.email);
  const existingPreferences = await prisma.meetingPreference.findFirst({
    where: { workspaceId }
  });

  if (!existingPreferences) {
    const personalMeetingSlug = await createUniqueMeetingSlug(profile.personalMeetingSlug, { workspaceId });
    await prisma.meetingPreference.create({
      data: {
        workspaceId,
        ...defaultPreferences,
        ...profile,
        personalMeetingSlug
      }
    });
  } else {
    const shouldUpdateSlug =
      !existingPreferences.personalMeetingSlug ||
      existingPreferences.personalMeetingSlug === DEFAULT_MEETING_PROFILE.slug ||
      existingPreferences.personalMeetingSlug === fallbackSlugForWorkspace(workspaceId);
    const shouldUpdateProfileName =
      !existingPreferences.profileName ||
      existingPreferences.profileName === DEFAULT_MEETING_PROFILE.name;
    const shouldUpdateProfileEmail =
      !existingPreferences.profileEmail ||
      existingPreferences.profileEmail === DEFAULT_MEETING_PROFILE.email;
    const personalMeetingSlug = shouldUpdateSlug
      ? await createUniqueMeetingSlug(profile.personalMeetingSlug, {
          workspaceId,
          excludeMeetingPreferenceId: existingPreferences.id
        })
      : undefined;

    await prisma.meetingPreference.update({
      where: { id: existingPreferences.id },
      data: {
        ...(shouldUpdateProfileName ? { profileName: profile.profileName } : {}),
        ...(shouldUpdateProfileEmail ? { profileEmail: profile.profileEmail } : {}),
        ...(personalMeetingSlug ? { personalMeetingSlug } : {})
      }
    });

    if (shouldUpdateProfileName || shouldUpdateProfileEmail) {
      await prisma.schedulingPage.updateMany({
        where: {
          workspaceId,
          hostName: DEFAULT_MEETING_PROFILE.name,
          hostEmail: DEFAULT_MEETING_PROFILE.email
        },
        data: {
          hostName: profile.profileName,
          hostEmail: profile.profileEmail
        }
      });
    }
  }

  return profile;
}

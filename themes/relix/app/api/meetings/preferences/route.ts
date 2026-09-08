import { MeetingLocationType, MeetingNoticeUnit } from "@prisma/client";
import { z } from "zod";
import { applyGoogleMeetConnectionStatus, findGoogleCalendarConnectionByUserId } from "@/lib/google-calendar";
import { normalizeMeetingSlug } from "@/lib/meeting-booking";
import { buildMeetingProfile, ensureMeetingWorkspaceDefaults, isMeetingSlugAvailable, syncMeetingWorkspaceOwner } from "@/lib/meetings";
import { prisma } from "@/lib/prisma";
import { requireWorkspaceContext } from "@/lib/workspace";

const DEFAULT_TIMEZONE_LABEL = "India Standard Time (GMT +5:30)";

const availabilitySlotSchema = z.object({
  day: z.string().min(1),
  enabled: z.boolean(),
  start: z.string().min(1),
  end: z.string().min(1)
});

const meetingPreferencesSchema = z.object({
  profileName: z.string().trim().min(1).max(120).optional(),
  profileEmail: z.string().email().optional().or(z.literal("")),
  personalMeetingSlug: z.string().trim().min(1).max(80).optional(),
  timezoneLabel: z.string().min(1).optional(),
  googleMeetConnected: z.boolean().optional(),
  zoomConnected: z.boolean().optional(),
  microsoftTeamsConnected: z.boolean().optional(),
  customLink: z.string().max(500).optional(),
  defaultLocationType: z.nativeEnum(MeetingLocationType).optional(),
  weeklyAvailability: z.array(availabilitySlotSchema).optional(),
  bufferBeforeEnabled: z.boolean().optional(),
  bufferBeforeMinutes: z.number().int().min(0).optional(),
  bufferAfterEnabled: z.boolean().optional(),
  bufferAfterMinutes: z.number().int().min(0).optional(),
  minNoticeValue: z.number().int().min(0).max(90).optional(),
  minNoticeUnit: z.nativeEnum(MeetingNoticeUnit).optional()
});

function normalizeMeetingUrl(value: string | null | undefined) {
  const trimmed = String(value || "").trim();

  if (!trimmed) {
    return "";
  }

  if (/^[a-z][a-z\d+\-.]*:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function isValidMeetingUrl(value: string | null | undefined) {
  try {
    const url = new URL(normalizeMeetingUrl(value));
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET() {
  const { user: currentUser, workspace } = await requireWorkspaceContext();

  await ensureMeetingWorkspaceDefaults(workspace.id);
  await syncMeetingWorkspaceOwner({
    fullName: currentUser.fullName,
    email: currentUser.email
  }, workspace.id);

  const preferences = await prisma.meetingPreference.upsert({
    where: { workspaceId: workspace.id },
    update: {},
    create: { workspaceId: workspace.id }
  });

  const hydratedPreferences = await applyGoogleMeetConnectionStatus(preferences, () => findGoogleCalendarConnectionByUserId(currentUser.id));

  return Response.json({
    ...hydratedPreferences,
    zoomConnected: false,
    microsoftTeamsConnected: false
  });
}

export async function PATCH(request: Request) {
  const { user: currentUser, workspace } = await requireWorkspaceContext();
  const currentProfile = buildMeetingProfile(currentUser.fullName, currentUser.email);

  try {
    const raw = await request.json();
    const payload = meetingPreferencesSchema.parse(raw);
    const customLink = payload.customLink !== undefined ? normalizeMeetingUrl(payload.customLink) : undefined;

    if (customLink !== undefined && customLink && !isValidMeetingUrl(customLink)) {
      return Response.json({ error: "Enter a valid custom meeting link." }, { status: 400 });
    }

    if (payload.defaultLocationType === MeetingLocationType.CUSTOM_LINK && customLink !== undefined && !customLink) {
      return Response.json({ error: "Add a custom meeting link before setting it as the default." }, { status: 400 });
    }

    const existingPreference = await prisma.meetingPreference.findUnique({
      where: { workspaceId: workspace.id },
      select: { id: true }
    });
    const normalizedSlug =
      payload.personalMeetingSlug !== undefined ? normalizeMeetingSlug(payload.personalMeetingSlug) || currentProfile.personalMeetingSlug : undefined;

    if (
      normalizedSlug !== undefined &&
      !(await isMeetingSlugAvailable(normalizedSlug, {
        excludeMeetingPreferenceId: existingPreference?.id
      }))
    ) {
      return Response.json({ error: "That meeting link is already in use. Choose another slug." }, { status: 409 });
    }

    const preferences = await prisma.meetingPreference.upsert({
      where: { workspaceId: workspace.id },
      update: {
        ...(payload.profileName !== undefined ? { profileName: payload.profileName } : {}),
        ...(payload.profileEmail !== undefined ? { profileEmail: payload.profileEmail || currentUser.email } : {}),
        ...(normalizedSlug !== undefined ? { personalMeetingSlug: normalizedSlug } : {}),
        ...(payload.timezoneLabel !== undefined ? { timezoneLabel: payload.timezoneLabel } : {}),
        zoomConnected: false,
        microsoftTeamsConnected: false,
        ...(customLink !== undefined ? { customLink: customLink || null } : {}),
        ...(payload.defaultLocationType !== undefined ? { defaultLocationType: payload.defaultLocationType } : {}),
        ...(payload.weeklyAvailability !== undefined ? { weeklyAvailability: JSON.stringify(payload.weeklyAvailability) } : {}),
        ...(payload.bufferBeforeEnabled !== undefined ? { bufferBeforeEnabled: payload.bufferBeforeEnabled } : {}),
        ...(payload.bufferBeforeMinutes !== undefined ? { bufferBeforeMinutes: payload.bufferBeforeMinutes } : {}),
        ...(payload.bufferAfterEnabled !== undefined ? { bufferAfterEnabled: payload.bufferAfterEnabled } : {}),
        ...(payload.bufferAfterMinutes !== undefined ? { bufferAfterMinutes: payload.bufferAfterMinutes } : {}),
        ...(payload.minNoticeValue !== undefined ? { minNoticeValue: payload.minNoticeValue } : {}),
        ...(payload.minNoticeUnit !== undefined ? { minNoticeUnit: payload.minNoticeUnit } : {})
      },
      create: {
        workspaceId: workspace.id,
        profileName: payload.profileName || currentUser.fullName,
        profileEmail: payload.profileEmail || currentUser.email,
        personalMeetingSlug: normalizedSlug || currentProfile.personalMeetingSlug,
        timezoneLabel: payload.timezoneLabel || DEFAULT_TIMEZONE_LABEL,
        googleMeetConnected: false,
        zoomConnected: false,
        microsoftTeamsConnected: false,
        customLink: customLink || null,
        defaultLocationType: payload.defaultLocationType || MeetingLocationType.GOOGLE_MEET,
        weeklyAvailability: JSON.stringify(payload.weeklyAvailability || []),
        bufferBeforeEnabled: payload.bufferBeforeEnabled ?? false,
        bufferBeforeMinutes: payload.bufferBeforeMinutes ?? 15,
        bufferAfterEnabled: payload.bufferAfterEnabled ?? false,
        bufferAfterMinutes: payload.bufferAfterMinutes ?? 15,
        minNoticeValue: payload.minNoticeValue ?? 1,
        minNoticeUnit: payload.minNoticeUnit || MeetingNoticeUnit.HOURS
      }
    });

    const hydratedPreferences = await applyGoogleMeetConnectionStatus(preferences, () => findGoogleCalendarConnectionByUserId(currentUser.id));

    return Response.json({
      ...hydratedPreferences,
      zoomConnected: false,
      microsoftTeamsConnected: false
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid meeting preferences payload", issues: error.issues }, { status: 400 });
    }

    return Response.json({ error: error instanceof Error ? error.message : "Unable to update meeting preferences" }, { status: 500 });
  }
}

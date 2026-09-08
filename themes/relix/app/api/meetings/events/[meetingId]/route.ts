import { MeetingLocationType } from "@prisma/client";
import { z } from "zod";
import {
  createGoogleMeetEventForConnection,
  deleteGoogleCalendarEventForConnection,
  findGoogleCalendarConnectionByEmail,
  findGoogleCalendarConnectionByUserId,
  isGoogleCalendarProvider,
  updateGoogleCalendarEventForConnection
} from "@/lib/google-calendar";
import { getMeetingEventById, updateMeetingEvent } from "@/lib/meeting-event-store";
import { prisma } from "@/lib/prisma";
import { archiveMeetingEvent } from "@/lib/trash";
import { requireWorkspaceContext } from "@/lib/workspace";

const meetingEventUpdateSchema = z.object({
  title: z.string().trim().min(1).max(180).optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  locationType: z.nativeEnum(MeetingLocationType).optional(),
  locationLabel: z.string().trim().max(120).optional(),
  meetingUrl: z.string().max(500).optional(),
  recordMeeting: z.boolean().optional(),
  insightEnabled: z.boolean().optional(),
  hostName: z.string().trim().max(120).optional(),
  hostEmail: z.string().email().optional().or(z.literal(""))
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

export async function PATCH(request: Request, context: { params: Promise<{ meetingId: string }> }) {
  const { user: currentUser, workspace } = await requireWorkspaceContext();
  const { meetingId } = await context.params;

  try {
    const raw = await request.json();
    const payload = meetingEventUpdateSchema.parse(raw);
    const existingMeeting = await getMeetingEventById(meetingId, workspace.id);

    if (!existingMeeting) {
      return Response.json({ error: "Meeting not found." }, { status: 404 });
    }

    const nextTitle = payload.title ?? existingMeeting.title;
    const nextStartsAt = payload.startsAt ?? existingMeeting.startsAt.toISOString();
    const nextEndsAt = payload.endsAt ?? existingMeeting.endsAt.toISOString();
    const nextLocationType = payload.locationType ?? existingMeeting.locationType;
    let nextLocationLabel = payload.locationLabel !== undefined ? payload.locationLabel || null : existingMeeting.locationLabel;
    const nextHostEmail = payload.hostEmail !== undefined ? payload.hostEmail || currentUser.email : existingMeeting.hostEmail;
    let nextMeetingUrl = payload.meetingUrl !== undefined ? normalizeMeetingUrl(payload.meetingUrl) || null : existingMeeting.meetingUrl;
    let externalCalendarProvider = existingMeeting.externalCalendarProvider;
    let externalCalendarId = existingMeeting.externalCalendarId;
    let externalEventId = existingMeeting.externalEventId;

    if (new Date(nextEndsAt).getTime() <= new Date(nextStartsAt).getTime()) {
      return Response.json({ error: "Meeting end time must be after the start time." }, { status: 400 });
    }

    if (payload.locationType !== undefined && payload.meetingUrl === undefined && nextLocationType !== existingMeeting.locationType) {
      nextMeetingUrl = null;
    }

    if (
      isGoogleCalendarProvider(existingMeeting.externalCalendarProvider) &&
      existingMeeting.externalCalendarId &&
      existingMeeting.externalEventId &&
      nextLocationType !== MeetingLocationType.GOOGLE_MEET
    ) {
      const connection = (await findGoogleCalendarConnectionByEmail(existingMeeting.hostEmail)) || (await findGoogleCalendarConnectionByUserId(currentUser.id));

      if (connection) {
        await deleteGoogleCalendarEventForConnection({
          connection,
          calendarId: existingMeeting.externalCalendarId,
          eventId: existingMeeting.externalEventId
        });
      }

      externalCalendarProvider = null;
      externalCalendarId = null;
      externalEventId = null;
    }

    if (nextLocationType === MeetingLocationType.GOOGLE_MEET) {
      const connection = (await findGoogleCalendarConnectionByEmail(nextHostEmail)) || (await findGoogleCalendarConnectionByUserId(currentUser.id));

      if (isGoogleCalendarProvider(existingMeeting.externalCalendarProvider) && existingMeeting.externalCalendarId && existingMeeting.externalEventId) {
        if (!connection) {
          return Response.json({ error: "Reconnect Google Calendar before updating this Google Meet event." }, { status: 400 });
        }

        const updatedGoogleEvent = await updateGoogleCalendarEventForConnection({
          connection,
          calendarId: existingMeeting.externalCalendarId,
          eventId: existingMeeting.externalEventId,
          title: nextTitle,
          startsAt: nextStartsAt,
          endsAt: nextEndsAt
        });

        nextMeetingUrl = updatedGoogleEvent.meetingUrl || nextMeetingUrl;
      } else if (!nextMeetingUrl) {
        if (!connection) {
          return Response.json({ error: "Connect Google Calendar first or paste a Google Meet link." }, { status: 400 });
        }

        const googleEvent = await createGoogleMeetEventForConnection({
          connection,
          title: nextTitle,
          startsAt: nextStartsAt,
          endsAt: nextEndsAt
        });

        nextMeetingUrl = googleEvent.meetingUrl;
        externalCalendarProvider = googleEvent.externalCalendarProvider;
        externalCalendarId = googleEvent.externalCalendarId;
        externalEventId = googleEvent.externalEventId;
      }
    }

    if (
      nextLocationType !== MeetingLocationType.GOOGLE_MEET &&
      (!nextMeetingUrl || !isValidMeetingUrl(nextMeetingUrl))
    ) {
      return Response.json(
        { error: `Paste a valid ${nextLocationType === MeetingLocationType.CUSTOM_LINK ? "custom" : nextLocationType === MeetingLocationType.ZOOM ? "Zoom" : "Microsoft Teams"} meeting link.` },
        { status: 400 }
      );
    }

    if (nextLocationType === MeetingLocationType.GOOGLE_MEET && nextMeetingUrl && !isValidMeetingUrl(nextMeetingUrl)) {
      return Response.json({ error: "Paste a valid Google Meet link or leave it empty to generate one." }, { status: 400 });
    }

    if (payload.locationType !== undefined && payload.locationLabel === undefined) {
      nextLocationLabel =
        nextLocationType === MeetingLocationType.ZOOM
          ? "Zoom"
          : nextLocationType === MeetingLocationType.MICROSOFT_TEAMS
            ? "Microsoft Teams"
            : nextLocationType === MeetingLocationType.CUSTOM_LINK
              ? "Custom link"
              : "Google Meet";
    }

    const meeting = await updateMeetingEvent(meetingId, {
      ...(payload.title !== undefined ? { title: nextTitle } : {}),
      ...(payload.startsAt !== undefined ? { startsAt: new Date(nextStartsAt) } : {}),
      ...(payload.endsAt !== undefined ? { endsAt: new Date(nextEndsAt) } : {}),
      ...(payload.locationType !== undefined ? { locationType: nextLocationType } : {}),
      ...(payload.locationType !== undefined || payload.locationLabel !== undefined || nextLocationType === MeetingLocationType.GOOGLE_MEET
        ? { locationLabel: nextLocationType === MeetingLocationType.GOOGLE_MEET ? "Google Meet" : nextLocationLabel }
        : {}),
      ...(payload.locationType !== undefined || payload.meetingUrl !== undefined || nextLocationType === MeetingLocationType.GOOGLE_MEET
        ? { meetingUrl: nextMeetingUrl }
        : {}),
      ...(payload.recordMeeting !== undefined ? { recordMeeting: payload.recordMeeting } : {}),
      ...(payload.insightEnabled !== undefined ? { insightEnabled: payload.insightEnabled } : {}),
      ...(payload.hostName !== undefined ? { hostName: payload.hostName } : {}),
      ...(payload.hostEmail !== undefined ? { hostEmail: nextHostEmail } : {}),
      ...(payload.locationType !== undefined || payload.meetingUrl !== undefined
        ? {
            externalCalendarProvider,
            externalCalendarId,
            externalEventId
          }
        : {})
    });

    return Response.json(meeting);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid meeting update payload", issues: error.issues }, { status: 400 });
    }

    return Response.json({ error: error instanceof Error ? error.message : "Unable to update meeting" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ meetingId: string }> }) {
  const { workspace } = await requireWorkspaceContext();
  const { meetingId } = await context.params;

  try {
    const meeting = await getMeetingEventById(meetingId, workspace.id);

    if (!meeting) {
      return Response.json({ error: "Meeting not found." }, { status: 404 });
    }

    if (
      meeting &&
      isGoogleCalendarProvider(meeting.externalCalendarProvider) &&
      meeting.externalCalendarId &&
      meeting.externalEventId
    ) {
      const connection = await findGoogleCalendarConnectionByEmail(meeting.hostEmail);

      if (connection) {
        await deleteGoogleCalendarEventForConnection({
          connection,
          calendarId: meeting.externalCalendarId,
          eventId: meeting.externalEventId
        });
      }
    }

    await prisma.$transaction(async (tx) => {
      await archiveMeetingEvent(tx, meetingId);
      await tx.meetingEvent.delete({ where: { id: meetingId } });
    });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to delete meeting" }, { status: 500 });
  }
}

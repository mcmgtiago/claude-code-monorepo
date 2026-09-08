import { MeetingLocationType } from "@prisma/client";
import { z } from "zod";
import { createGoogleMeetEventForConnection, findGoogleCalendarConnectionByUserId, syncGoogleCalendarEventsForConnection } from "@/lib/google-calendar";
import { createMeetingEvent, listMeetingEvents } from "@/lib/meeting-event-store";
import { ensureMeetingWorkspaceDefaults } from "@/lib/meetings";
import { requireWorkspaceContext } from "@/lib/workspace";

const meetingEventSchema = z.object({
  title: z.string().trim().min(1).max(180),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  locationType: z.nativeEnum(MeetingLocationType),
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

export async function GET() {
  const { user: currentUser, workspace } = await requireWorkspaceContext();
  await ensureMeetingWorkspaceDefaults(workspace.id);
  const connection = await findGoogleCalendarConnectionByUserId(currentUser.id);

  if (connection) {
    await syncGoogleCalendarEventsForConnection({
      connection,
      workspaceId: workspace.id,
      userName: currentUser.fullName,
      userEmail: currentUser.email
    }).catch(() => null);
  }

  const meetings = await listMeetingEvents({
    workspaceId: workspace.id,
    orderBy: [{ startsAt: "asc" }, { createdAt: "desc" }]
  });

  return Response.json(meetings);
}

export async function POST(request: Request) {
  const { user: currentUser, workspace } = await requireWorkspaceContext();

  try {
    const raw = await request.json();
    const payload = meetingEventSchema.parse(raw);
    const startsAt = new Date(payload.startsAt);
    const endsAt = new Date(payload.endsAt);
    let meetingUrl = normalizeMeetingUrl(payload.meetingUrl) || null;
    let locationLabel = payload.locationLabel || null;
    let externalCalendarProvider: string | null = null;
    let externalCalendarId: string | null = null;
    let externalEventId: string | null = null;

    if (endsAt.getTime() <= startsAt.getTime()) {
      return Response.json({ error: "Meeting end time must be after the start time." }, { status: 400 });
    }

    if (payload.locationType === MeetingLocationType.GOOGLE_MEET && !meetingUrl) {
      const connection = await findGoogleCalendarConnectionByUserId(currentUser.id);

      if (!connection) {
        return Response.json({ error: "Connect Google Calendar first or paste a Google Meet link." }, { status: 400 });
      }

      const googleEvent = await createGoogleMeetEventForConnection({
        connection,
        title: payload.title,
        startsAt: payload.startsAt,
        endsAt: payload.endsAt
      });

      meetingUrl = googleEvent.meetingUrl;
      locationLabel = googleEvent.locationLabel;
      externalCalendarProvider = googleEvent.externalCalendarProvider;
      externalCalendarId = googleEvent.externalCalendarId;
      externalEventId = googleEvent.externalEventId;
    }

    if (payload.locationType !== MeetingLocationType.GOOGLE_MEET && (!meetingUrl || !isValidMeetingUrl(meetingUrl))) {
      return Response.json(
        { error: `Paste a valid ${payload.locationType === MeetingLocationType.CUSTOM_LINK ? "custom" : payload.locationType === MeetingLocationType.ZOOM ? "Zoom" : "Microsoft Teams"} meeting link.` },
        { status: 400 }
      );
    }

    if (payload.locationType === MeetingLocationType.GOOGLE_MEET && meetingUrl && !isValidMeetingUrl(meetingUrl)) {
      return Response.json({ error: "Paste a valid Google Meet link or leave it empty to generate one." }, { status: 400 });
    }

    const meeting = await createMeetingEvent({
      workspaceId: workspace.id,
      title: payload.title,
      startsAt,
      endsAt,
      locationType: payload.locationType,
      locationLabel: locationLabel,
      meetingUrl: meetingUrl,
      recordMeeting: payload.recordMeeting ?? false,
      insightEnabled: payload.insightEnabled ?? false,
      hostName: payload.hostName || currentUser.fullName,
      hostEmail: payload.hostEmail || currentUser.email,
      externalCalendarProvider,
      externalCalendarId,
      externalEventId
    });

    return Response.json(meeting, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid meeting payload", issues: error.issues }, { status: 400 });
    }

    return Response.json({ error: error instanceof Error ? error.message : "Unable to create meeting" }, { status: 500 });
  }
}

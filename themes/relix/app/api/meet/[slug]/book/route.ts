import { z } from "zod";
import { MeetingLocationType } from "@prisma/client";
import { buildBookingAvailability, normalizeMeetingSlug, resolveMeetingLocation } from "@/lib/meeting-booking";
import { listMeetingEvents } from "@/lib/meeting-event-store";
import { ensureMeetingWorkspaceDefaults } from "@/lib/meetings";
import { createGoogleMeetEventForConnection, findGoogleCalendarConnectionByEmail } from "@/lib/google-calendar";
import { prisma } from "@/lib/prisma";
import { normalizeLocalizationSettings } from "@/lib/localization";

const bookingAttempts = new Map<string, { count: number; resetAt: number }>();
const BOOKING_ATTEMPT_WINDOW_MS = 10 * 60 * 1000;
const MAX_BOOKING_ATTEMPTS = 8;

const bookingSchema = z.object({
  pageId: z.string().optional(),
  guestName: z.string().trim().min(1).max(120),
  guestEmail: z.string().email(),
  notes: z.string().trim().max(1000).optional(),
  startIso: z.string().datetime(),
  companyWebsite: z.string().optional()
});

function clientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function rateLimitKey(request: Request, email: string) {
  return `${clientIp(request)}:${email.toLowerCase()}`;
}

function checkBookingRateLimit(request: Request, email: string) {
  const key = rateLimitKey(request, email);
  const now = Date.now();
  const current = bookingAttempts.get(key);

  if (!current || current.resetAt <= now) {
    bookingAttempts.set(key, { count: 1, resetAt: now + BOOKING_ATTEMPT_WINDOW_MS });
    return true;
  }

  if (current.count >= MAX_BOOKING_ATTEMPTS) {
    return false;
  }

  current.count += 1;
  return true;
}

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const raw = await request.json();
    const payload = bookingSchema.parse(raw);

    if (payload.companyWebsite?.trim()) {
      return Response.json({ error: "Unable to complete booking." }, { status: 400 });
    }

    if (!checkBookingRateLimit(request, payload.guestEmail)) {
      return Response.json({ error: "Too many booking attempts. Try again later." }, { status: 429 });
    }

    const normalizedSlug = normalizeMeetingSlug(slug);
    const directPageSeed = await prisma.schedulingPage.findFirst({
      where: { slug: normalizedSlug, active: true },
      select: { workspaceId: true }
    });
    const personalMeetingSeed = directPageSeed
      ? null
      : await prisma.meetingPreference.findFirst({
          where: { personalMeetingSlug: normalizedSlug },
          select: { workspaceId: true }
        });
    const workspaceId = directPageSeed?.workspaceId || personalMeetingSeed?.workspaceId || null;

    if (!workspaceId) {
      return Response.json({ error: "Meeting page not found." }, { status: 404 });
    }

    await ensureMeetingWorkspaceDefaults(workspaceId);
    const [preferences, pages, workspaceSettings] = await Promise.all([
      prisma.meetingPreference.findFirst({
        where: { workspaceId }
      }),
      prisma.schedulingPage.findMany({
        where: { workspaceId, active: true },
        orderBy: [{ durationMinutes: "asc" }, { createdAt: "asc" }]
      }),
      prisma.workspaceSetting.findFirst({
        where: { workspaceId },
        select: {
          countryCode: true,
          timezone: true,
          currencyCode: true,
          locale: true,
          dateFormat: true,
          timeFormat: true,
          weekStartsOn: true
        }
      })
    ]);

    if (!preferences) {
      return Response.json({ error: "Meeting page not found." }, { status: 404 });
    }

    const localization = normalizeLocalizationSettings(workspaceSettings);
    const googleCalendarConnection = await findGoogleCalendarConnectionByEmail(preferences.profileEmail);

    const meetings = await listMeetingEvents({
      workspaceId,
      where: {
        endsAt: {
          gte: new Date()
        }
      },
      orderBy: [{ startsAt: "asc" }]
    });
    const directPage = pages.find((page) => page.slug === normalizedSlug) || null;
    const isPersonalMeeting = preferences.personalMeetingSlug === normalizedSlug;

    if (!directPage && !isPersonalMeeting) {
      return Response.json({ error: "Meeting page not found." }, { status: 404 });
    }

    const page = directPage || pages.find((item) => item.id === payload.pageId) || null;

    if (!page) {
      return Response.json({ error: "Select a scheduling page before booking." }, { status: 400 });
    }

    const availableDays = buildBookingAvailability({
      meetings,
      page,
      preferences,
      localization,
      horizonDays: 60,
      maxVisibleDays: 60
    });
    const selectedSlot = availableDays
      .flatMap((day) => day.slots)
      .find((slot) => slot.startIso === payload.startIso);

    if (!selectedSlot) {
      return Response.json({ error: "That time is no longer available. Pick another slot." }, { status: 409 });
    }

    const note = payload.notes?.trim();
    const guestSummary = `${payload.guestName} (${payload.guestEmail})`;
    const meetingTitle = note ? `${page.title} • ${guestSummary} • ${note}` : `${page.title} with ${guestSummary}`;
    const hostEmail = page.hostEmail || preferences.profileEmail;
    const hostName = page.hostName || preferences.profileName;
    const location =
      preferences.defaultLocationType === MeetingLocationType.GOOGLE_MEET
        ? await (async () => {
            const connection = hostEmail === preferences.profileEmail ? googleCalendarConnection : await findGoogleCalendarConnectionByEmail(hostEmail);

            if (!connection) {
              throw new Error("The host must connect Google Calendar before Google Meet bookings can be created.");
            }

            return createGoogleMeetEventForConnection({
              connection,
              title: meetingTitle,
              description: note ? `Agenda: ${note}` : `Booked via ${page.title}`,
              startsAt: selectedSlot.startIso,
              endsAt: selectedSlot.endIso,
              attendee: {
                email: payload.guestEmail,
                displayName: payload.guestName
              }
            });
          })()
        : resolveMeetingLocation(preferences, `${page.slug}-${payload.guestName}`);
    const selectedStart = new Date(selectedSlot.startIso);
    const selectedEnd = new Date(selectedSlot.endIso);
    const bufferBefore = (preferences.bufferBeforeEnabled ? preferences.bufferBeforeMinutes : 0) * 60_000;
    const bufferAfter = (preferences.bufferAfterEnabled ? preferences.bufferAfterMinutes : 0) * 60_000;
    const meeting = await prisma.$transaction(async (tx) => {
      const nearbyMeetings = await tx.meetingEvent.findMany({
        where: {
          workspaceId,
          startsAt: { lt: new Date(selectedEnd.getTime() + bufferAfter) },
          endsAt: { gt: new Date(selectedStart.getTime() - bufferBefore) }
        },
        select: { startsAt: true, endsAt: true }
      });
      const overlaps = nearbyMeetings.some((meeting) => {
        const meetingStart = meeting.startsAt.getTime() - bufferBefore;
        const meetingEnd = meeting.endsAt.getTime() + bufferAfter;
        return selectedStart.getTime() < meetingEnd && selectedEnd.getTime() > meetingStart;
      });

      if (overlaps) {
        throw new Error("That time is no longer available. Pick another slot.");
      }

      return tx.meetingEvent.create({
        data: {
          workspaceId,
          title: meetingTitle,
          startsAt: selectedStart,
          endsAt: selectedEnd,
          locationType: location.locationType,
          locationLabel: location.locationLabel,
          meetingUrl: location.meetingUrl,
          recordMeeting: false,
          insightEnabled: false,
          hostName,
          hostEmail,
          externalCalendarProvider: "externalCalendarProvider" in location ? location.externalCalendarProvider : null,
          externalCalendarId: "externalCalendarId" in location ? location.externalCalendarId : null,
          externalEventId: "externalEventId" in location ? location.externalEventId : null
        }
      });
    });

    return Response.json({
      meeting,
      page,
      guest: {
        name: payload.guestName,
        email: payload.guestEmail,
        notes: note || null
      },
      slot: selectedSlot
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid booking payload", issues: error.issues }, { status: 400 });
    }

    if (error instanceof Error && error.message === "That time is no longer available. Pick another slot.") {
      return Response.json({ error: error.message }, { status: 409 });
    }

    return Response.json({ error: error instanceof Error ? error.message : "Unable to complete booking." }, { status: 500 });
  }
}

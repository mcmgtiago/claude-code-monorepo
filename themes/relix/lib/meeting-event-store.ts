import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const baseMeetingEventSelect = {
  id: true,
  title: true,
  startsAt: true,
  endsAt: true,
  locationType: true,
  locationLabel: true,
  meetingUrl: true,
  recordMeeting: true,
  insightEnabled: true,
  hostName: true,
  hostEmail: true,
  createdAt: true,
  updatedAt: true
} as const;

const extendedMeetingEventSelect = {
  ...baseMeetingEventSelect,
  externalCalendarProvider: true,
  externalCalendarId: true,
  externalEventId: true
} as const;

function hasMissingMeetingEventExternalColumns(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  return (
    message.includes("MeetingEvent.externalCalendarProvider") ||
    message.includes("MeetingEvent.externalCalendarId") ||
    message.includes("MeetingEvent.externalEventId") ||
    message.includes("externalCalendarProvider") ||
    message.includes("externalCalendarId") ||
    message.includes("externalEventId")
  );
}

function withLegacyExternalDefaults<
  T extends {
    id: string;
    title: string;
    startsAt: Date;
    endsAt: Date;
    locationType: string;
    locationLabel: string | null;
    meetingUrl: string | null;
    recordMeeting: boolean;
    insightEnabled: boolean;
    hostName: string;
    hostEmail: string;
    createdAt: Date;
    updatedAt: Date;
  }
>(meeting: T) {
  return {
    ...meeting,
    externalCalendarProvider: null,
    externalCalendarId: null,
    externalEventId: null
  };
}

export async function listMeetingEvents(args?: {
  workspaceId?: string;
  where?: Prisma.MeetingEventWhereInput;
  orderBy?: Prisma.MeetingEventOrderByWithRelationInput | Prisma.MeetingEventOrderByWithRelationInput[];
}) {
  try {
    return await prisma.meetingEvent.findMany({
      where: {
        ...(args?.workspaceId ? { workspaceId: args.workspaceId } : {}),
        ...(args?.where || {})
      },
      orderBy: args?.orderBy,
      select: extendedMeetingEventSelect
    });
  } catch (error) {
    if (!hasMissingMeetingEventExternalColumns(error)) {
      throw error;
    }

    const meetings = await prisma.meetingEvent.findMany({
      where: {
        ...(args?.workspaceId ? { workspaceId: args.workspaceId } : {}),
        ...(args?.where || {})
      },
      orderBy: args?.orderBy,
      select: baseMeetingEventSelect
    });

    return meetings.map(withLegacyExternalDefaults);
  }
}

export async function getMeetingEventById(id: string, workspaceId?: string) {
  try {
    return await prisma.meetingEvent.findFirst({
      where: {
        id,
        ...(workspaceId ? { workspaceId } : {})
      },
      select: extendedMeetingEventSelect
    });
  } catch (error) {
    if (!hasMissingMeetingEventExternalColumns(error)) {
      throw error;
    }

    const meeting = await prisma.meetingEvent.findFirst({
      where: {
        id,
        ...(workspaceId ? { workspaceId } : {})
      },
      select: baseMeetingEventSelect
    });

    return meeting ? withLegacyExternalDefaults(meeting) : null;
  }
}

export async function createMeetingEvent(data: Parameters<typeof prisma.meetingEvent.create>[0]["data"]) {
  try {
    return await prisma.meetingEvent.create({
      data,
      select: extendedMeetingEventSelect
    });
  } catch (error) {
    if (!hasMissingMeetingEventExternalColumns(error)) {
      throw error;
    }

    const { externalCalendarProvider, externalCalendarId, externalEventId, ...legacyData } = data;
    const meeting = await prisma.meetingEvent.create({
      data: legacyData,
      select: baseMeetingEventSelect
    });

    return withLegacyExternalDefaults(meeting);
  }
}

export async function updateMeetingEvent(id: string, data: Parameters<typeof prisma.meetingEvent.update>[0]["data"]) {
  try {
    return await prisma.meetingEvent.update({
      where: { id },
      data,
      select: extendedMeetingEventSelect
    });
  } catch (error) {
    if (!hasMissingMeetingEventExternalColumns(error)) {
      throw error;
    }

    const { externalCalendarProvider, externalCalendarId, externalEventId, ...legacyData } = data;
    const meeting = await prisma.meetingEvent.update({
      where: { id },
      data: legacyData,
      select: baseMeetingEventSelect
    });

    return withLegacyExternalDefaults(meeting);
  }
}

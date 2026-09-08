import "server-only";

import { MeetingLocationType } from "@prisma/client";
import { buildAppUrl } from "@/lib/app-url";
import { getPlatformSettings, isPlatformGoogleConfigured } from "@/lib/platform-settings";
import { prisma } from "@/lib/prisma";

export const GOOGLE_CALENDAR_STATE_COOKIE = "meeting_google_oauth_state";
export const GOOGLE_CALENDAR_RETURN_TO_COOKIE = "meeting_google_oauth_return_to";
const GOOGLE_CALENDAR_SCOPE = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/userinfo.email"
].join(" ");
const GOOGLE_CALENDAR_PROVIDER = "GOOGLE_CALENDAR";
const GOOGLE_CALENDAR_IMPORT_PROVIDER = "GOOGLE_CALENDAR_IMPORT";

type GoogleTokenResponse = {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
};

type GoogleCalendarApiError = {
  error?: {
    code?: number;
    message?: string;
  };
  error_description?: string;
};

type GoogleCalendarEventResponse = {
  id?: string;
  status?: string;
  summary?: string;
  description?: string;
  location?: string;
  hangoutLink?: string;
  htmlLink?: string;
  start?: {
    date?: string;
    dateTime?: string;
    timeZone?: string;
  };
  end?: {
    date?: string;
    dateTime?: string;
    timeZone?: string;
  };
  organizer?: {
    email?: string;
    displayName?: string;
    self?: boolean;
  };
  creator?: {
    email?: string;
    displayName?: string;
    self?: boolean;
  };
  attendees?: Array<{
    email?: string;
    displayName?: string;
    self?: boolean;
    responseStatus?: string;
  }>;
  conferenceData?: {
    entryPoints?: Array<{
      entryPointType?: string;
      uri?: string;
    }>;
  };
};

type GoogleCalendarEventsListResponse = {
  items?: GoogleCalendarEventResponse[];
  nextPageToken?: string;
};

type GoogleCalendarConnectionRecord = Awaited<ReturnType<typeof prisma.googleCalendarConnection.findFirst>>;

function getScopeTokens(scope: string | null | undefined) {
  return String(scope || "")
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function hasGoogleCalendarScope(scope: string | null | undefined) {
  return getScopeTokens(scope).includes("https://www.googleapis.com/auth/calendar.events");
}

function hasGoogleMailScope(scope: string | null | undefined) {
  return getScopeTokens(scope).includes("https://mail.google.com/");
}

function hasMissingGoogleCalendarConnectionTable(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  return message.includes("GoogleCalendarConnection") || message.includes("googleCalendarConnection");
}

async function getGoogleCalendarConfig() {
  const platform = await getPlatformSettings();
  const clientId = platform.googleClientId;
  const clientSecret = platform.googleClientSecret;

  if (!clientId || !clientSecret) {
    throw new Error("Google Calendar is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET first.");
  }

  return {
    clientId,
    clientSecret,
    redirectUri: await buildAppUrl("/api/meetings/google/callback")
  };
}

function getGoogleCalendarError(payload: GoogleTokenResponse | GoogleCalendarApiError | null, fallback: string) {
  if (!payload) {
    return fallback;
  }

  if ("error" in payload && typeof payload.error === "string") {
    return payload.error_description || payload.error || fallback;
  }

  if ("error" in payload && payload.error && typeof payload.error === "object") {
    return payload.error.message || payload.error_description || fallback;
  }

  return payload.error_description || fallback;
}

async function readGoogleJson<T>(response: Response, fallbackMessage: string) {
  const payload = (await response.json().catch(() => null)) as T | GoogleTokenResponse | GoogleCalendarApiError | null;

  if (!response.ok) {
    throw new Error(getGoogleCalendarError(payload as GoogleTokenResponse | GoogleCalendarApiError | null, fallbackMessage));
  }

  return payload as T;
}

async function requestGoogleTokens(body: URLSearchParams, fallbackMessage: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    body
  });

  return readGoogleJson<GoogleTokenResponse>(response, fallbackMessage);
}

async function fetchGoogleUserEmail(accessToken: string) {
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    cache: "no-store"
  });

  const payload = (await response.json().catch(() => null)) as { email?: string } | GoogleCalendarApiError | null;

  if (!response.ok) {
    throw new Error(getGoogleCalendarError(payload as GoogleCalendarApiError | null, "Unable to read the Google account email."));
  }

  return payload && "email" in payload ? payload.email || null : null;
}

async function refreshGoogleAccessToken(connection: NonNullable<GoogleCalendarConnectionRecord>) {
  const { clientId, clientSecret } = await getGoogleCalendarConfig();
  const tokens = await requestGoogleTokens(
    new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: connection.refreshToken,
      grant_type: "refresh_token"
    }),
    "Unable to refresh Google Calendar access."
  );

  if (!tokens.access_token) {
    throw new Error("Google Calendar did not return a fresh access token.");
  }

  const accessTokenExpiresAt = tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null;

  return prisma.googleCalendarConnection.update({
    where: { id: connection.id },
    data: {
      accessToken: tokens.access_token,
      scope: tokens.scope || connection.scope,
      tokenType: tokens.token_type || connection.tokenType,
      accessTokenExpiresAt
    }
  });
}

async function getFreshAccessToken(connection: NonNullable<GoogleCalendarConnectionRecord>) {
  if (connection.accessToken && connection.accessTokenExpiresAt && connection.accessTokenExpiresAt.getTime() > Date.now() + 60_000) {
    return {
      connection,
      accessToken: connection.accessToken
    };
  }

  const updatedConnection = await refreshGoogleAccessToken(connection);

  if (!updatedConnection.accessToken) {
    throw new Error("Google Calendar access could not be refreshed.");
  }

  return {
    connection: updatedConnection,
    accessToken: updatedConnection.accessToken
  };
}

async function runGoogleCalendarRequest<T>({
  connection,
  path,
  method,
  body,
  fallbackMessage
}: {
  connection: NonNullable<GoogleCalendarConnectionRecord>;
  path: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  body?: Record<string, unknown>;
  fallbackMessage: string;
}) {
  const { accessToken } = await getFreshAccessToken(connection);
  const response = await fetch(`https://www.googleapis.com/calendar/v3${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "content-type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store"
  });

  if (method === "DELETE") {
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as GoogleCalendarApiError | null;
      throw new Error(getGoogleCalendarError(payload, fallbackMessage));
    }

    return null as T;
  }

  return readGoogleJson<T>(response, fallbackMessage);
}

function extractMeetUrl(event: GoogleCalendarEventResponse) {
  return (
    event.hangoutLink ||
    event.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === "video")?.uri ||
    event.htmlLink ||
    null
  );
}

function isSelfDeclined(event: GoogleCalendarEventResponse, googleEmail: string) {
  const normalizedEmail = googleEmail.toLowerCase();
  const selfAttendee = event.attendees?.find((attendee) => attendee.self || attendee.email?.toLowerCase() === normalizedEmail);

  return selfAttendee?.responseStatus === "declined";
}

function getImportedEventLocation(event: GoogleCalendarEventResponse) {
  const meetUrl = extractMeetUrl(event);
  const location = event.location?.trim() || "";
  const lookupValue = `${meetUrl || ""} ${location}`.toLowerCase();

  if (meetUrl && (lookupValue.includes("meet.google.com") || lookupValue.includes("hangouts"))) {
    return {
      locationType: MeetingLocationType.GOOGLE_MEET,
      locationLabel: "Google Meet",
      meetingUrl: meetUrl
    };
  }

  if (lookupValue.includes("zoom.us")) {
    return {
      locationType: MeetingLocationType.ZOOM,
      locationLabel: "Zoom",
      meetingUrl: meetUrl || location || null
    };
  }

  if (lookupValue.includes("teams.microsoft.com")) {
    return {
      locationType: MeetingLocationType.MICROSOFT_TEAMS,
      locationLabel: "Microsoft Teams",
      meetingUrl: meetUrl || location || null
    };
  }

  return {
    locationType: MeetingLocationType.CUSTOM_LINK,
    locationLabel: location || "Google Calendar",
    meetingUrl: meetUrl || location || event.htmlLink || null
  };
}

function getImportedEventHost(event: GoogleCalendarEventResponse, fallbackEmail: string, fallbackName: string) {
  const organizer = event.organizer?.email ? event.organizer : event.creator;

  return {
    hostEmail: organizer?.email || fallbackEmail,
    hostName: organizer?.displayName || organizer?.email || fallbackName
  };
}

function getGoogleCalendarSyncWindow() {
  const timeMin = new Date();
  timeMin.setDate(timeMin.getDate() - 90);
  timeMin.setHours(0, 0, 0, 0);

  const timeMax = new Date();
  timeMax.setDate(timeMax.getDate() + 365);
  timeMax.setHours(23, 59, 59, 999);

  return { timeMin, timeMax };
}

export async function isGoogleCalendarConfigured() {
  return isPlatformGoogleConfigured(await getPlatformSettings());
}

export async function buildGoogleCalendarAuthUrl(state: string) {
  const { clientId, redirectUri } = await getGoogleCalendarConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "offline",
    include_granted_scopes: "true",
    prompt: "consent",
    scope: GOOGLE_CALENDAR_SCOPE,
    state
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCalendarCode(code: string, userId: string, fallbackEmail: string) {
  const { clientId, clientSecret, redirectUri } = await getGoogleCalendarConfig();
  const tokens = await requestGoogleTokens(
    new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri
    }),
    "Unable to connect Google Calendar."
  );

  if (!tokens.access_token) {
    throw new Error("Google Calendar did not return an access token.");
  }

  const existingConnection = await prisma.googleCalendarConnection.findUnique({
    where: { userId }
  });
  const googleEmail = (await fetchGoogleUserEmail(tokens.access_token).catch(() => null)) || existingConnection?.googleEmail || fallbackEmail;
  const refreshToken = tokens.refresh_token || existingConnection?.refreshToken;

  if (!refreshToken) {
    throw new Error("Google Calendar did not return a refresh token. Try connecting again and approve access.");
  }

  return prisma.googleCalendarConnection.upsert({
    where: { userId },
    update: {
      googleEmail,
      accessToken: tokens.access_token,
      refreshToken,
      scope: tokens.scope || existingConnection?.scope || null,
      tokenType: tokens.token_type || existingConnection?.tokenType || null,
      accessTokenExpiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null
    },
    create: {
      userId,
      googleEmail,
      accessToken: tokens.access_token,
      refreshToken,
      scope: tokens.scope || null,
      tokenType: tokens.token_type || null,
      accessTokenExpiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null
    }
  });
}

export async function deleteGoogleCalendarConnection(userId: string) {
  try {
    await prisma.googleCalendarConnection.deleteMany({
      where: { userId }
    });
  } catch (error) {
    if (!hasMissingGoogleCalendarConnectionTable(error)) {
      throw error;
    }
  }
}

export async function disconnectGoogleCalendarConnection(userId: string) {
  const connection = await prisma.googleCalendarConnection.findUnique({
    where: { userId }
  });

  if (!connection) {
    return { disconnected: false, mailStillConnected: false };
  }

  const nextScopeTokens = getScopeTokens(connection.scope).filter((token) => token !== "https://www.googleapis.com/auth/calendar.events");
  const nextScope = nextScopeTokens.join(" ");
  const mailStillConnected = hasGoogleMailScope(nextScope);

  if (!nextScope) {
    await prisma.googleCalendarConnection.delete({
      where: { userId }
    });

    return {
      disconnected: true,
      mailStillConnected: false
    };
  }

  await prisma.googleCalendarConnection.update({
    where: { userId },
    data: {
      scope: nextScope
    }
  });

  return {
    disconnected: true,
    mailStillConnected
  };
}

export async function findGoogleCalendarConnectionByUserId(userId: string) {
  try {
    const connection = await prisma.googleCalendarConnection.findUnique({
      where: { userId }
    });

    if (!connection || !connection.googleEmail || !connection.refreshToken || !hasGoogleCalendarScope(connection.scope)) {
      return null;
    }

    return connection;
  } catch (error) {
    if (!hasMissingGoogleCalendarConnectionTable(error)) {
      throw error;
    }

    return null;
  }
}

export async function findGoogleCalendarConnectionByEmail(email: string) {
  try {
    const connection = await prisma.googleCalendarConnection.findFirst({
      where: {
        OR: [{ googleEmail: email }, { user: { email } }]
      }
    });

    if (!connection || !connection.googleEmail || !connection.refreshToken || !hasGoogleCalendarScope(connection.scope)) {
      return null;
    }

    return connection;
  } catch (error) {
    if (!hasMissingGoogleCalendarConnectionTable(error)) {
      throw error;
    }

    return null;
  }
}

export async function syncGoogleMeetPreferenceStatus(status: boolean) {
  await prisma.meetingPreference.upsert({
    where: { id: "default" },
    update: {
      googleMeetConnected: status
    },
    create: {
      id: "default",
      googleMeetConnected: status
    }
  });
}

export async function applyGoogleMeetConnectionStatus<T extends { id: string; googleMeetConnected: boolean }>(
  preferences: T,
  connectionResolver: () => Promise<GoogleCalendarConnectionRecord>
) {
  let connection: GoogleCalendarConnectionRecord = null;

  try {
    connection = await connectionResolver();
  } catch (error) {
    if (!hasMissingGoogleCalendarConnectionTable(error)) {
      throw error;
    }
  }
  const connected = Boolean(connection && hasGoogleCalendarScope(connection.scope));

  if (preferences.googleMeetConnected !== connected) {
    await prisma.meetingPreference.update({
      where: { id: preferences.id },
      data: {
        googleMeetConnected: connected
      }
    });
  }

  return {
    ...preferences,
    googleMeetConnected: connected
  };
}

function buildGoogleCalendarEventBody({
  title,
  description,
  startsAt,
  endsAt,
  attendee
}: {
  title: string;
  description?: string | null;
  startsAt: string;
  endsAt: string;
  attendee?: { email: string; displayName?: string } | null;
}) {
  return {
    summary: title,
    description: description || undefined,
    start: {
      dateTime: startsAt
    },
    end: {
      dateTime: endsAt
    },
    attendees: attendee
      ? [
          {
            email: attendee.email,
            displayName: attendee.displayName
          }
        ]
      : undefined
  };
}

export async function createGoogleMeetEventForConnection({
  connection,
  title,
  description,
  startsAt,
  endsAt,
  attendee
}: {
  connection: NonNullable<GoogleCalendarConnectionRecord>;
  title: string;
  description?: string | null;
  startsAt: string;
  endsAt: string;
  attendee?: { email: string; displayName?: string } | null;
}) {
  const event = await runGoogleCalendarRequest<GoogleCalendarEventResponse>({
    connection,
    method: "POST",
    path: `/calendars/${encodeURIComponent(connection.calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`,
    fallbackMessage: "Unable to create a Google Meet event.",
    body: {
      ...buildGoogleCalendarEventBody({ title, description, startsAt, endsAt, attendee }),
      conferenceData: {
        createRequest: {
          requestId: crypto.randomUUID(),
          conferenceSolutionKey: {
            type: "hangoutsMeet"
          }
        }
      }
    }
  });

  return {
    meetingUrl: extractMeetUrl(event),
    externalCalendarProvider: GOOGLE_CALENDAR_PROVIDER,
    externalCalendarId: connection.calendarId,
    externalEventId: event.id || null,
    locationType: MeetingLocationType.GOOGLE_MEET,
    locationLabel: "Google Meet"
  };
}

export async function updateGoogleCalendarEventForConnection({
  connection,
  calendarId,
  eventId,
  title,
  description,
  startsAt,
  endsAt
}: {
  connection: NonNullable<GoogleCalendarConnectionRecord>;
  calendarId: string;
  eventId: string;
  title: string;
  description?: string | null;
  startsAt: string;
  endsAt: string;
}) {
  const event = await runGoogleCalendarRequest<GoogleCalendarEventResponse>({
    connection,
    method: "PATCH",
    path: `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}?sendUpdates=all`,
    fallbackMessage: "Unable to update the linked Google Calendar event.",
    body: buildGoogleCalendarEventBody({ title, description, startsAt, endsAt })
  });

  return {
    meetingUrl: extractMeetUrl(event)
  };
}

export async function deleteGoogleCalendarEventForConnection({
  connection,
  calendarId,
  eventId
}: {
  connection: NonNullable<GoogleCalendarConnectionRecord>;
  calendarId: string;
  eventId: string;
}) {
  await runGoogleCalendarRequest<void>({
    connection,
    method: "DELETE",
    path: `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}?sendUpdates=all`,
    fallbackMessage: "Unable to remove the linked Google Calendar event."
  });
}

export async function syncGoogleCalendarEventsForConnection({
  connection,
  workspaceId,
  userName,
  userEmail
}: {
  connection: NonNullable<GoogleCalendarConnectionRecord>;
  workspaceId: string;
  userName: string;
  userEmail: string;
}) {
  const { timeMin, timeMax } = getGoogleCalendarSyncWindow();
  const params = new URLSearchParams({
    singleEvents: "true",
    orderBy: "startTime",
    showDeleted: "false",
    maxResults: "2500",
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString()
  });
  const items: GoogleCalendarEventResponse[] = [];
  let nextPageToken: string | undefined;

  do {
    if (nextPageToken) {
      params.set("pageToken", nextPageToken);
    } else {
      params.delete("pageToken");
    }

    const payload = await runGoogleCalendarRequest<GoogleCalendarEventsListResponse>({
      connection,
      method: "GET",
      path: `/calendars/${encodeURIComponent(connection.calendarId)}/events?${params.toString()}`,
      fallbackMessage: "Unable to read Google Calendar events."
    });

    items.push(...(payload.items || []));
    nextPageToken = payload.nextPageToken;
  } while (nextPageToken);

  const googleEvents = items.filter((event) => {
    if (!event.id || event.status === "cancelled" || !event.start?.dateTime || !event.end?.dateTime) {
      return false;
    }

    return !isSelfDeclined(event, connection.googleEmail);
  });
  const syncedEventIds = googleEvents.map((event) => event.id as string);

  for (const event of googleEvents) {
    const externalEventId = event.id as string;
    const startsAt = new Date(event.start?.dateTime as string);
    const endsAt = new Date(event.end?.dateTime as string);

    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt.getTime() <= startsAt.getTime()) {
      continue;
    }

    const existingMeeting = await prisma.meetingEvent.findFirst({
      where: {
        workspaceId,
        externalCalendarId: connection.calendarId,
        externalEventId,
        externalCalendarProvider: {
          in: [GOOGLE_CALENDAR_PROVIDER, GOOGLE_CALENDAR_IMPORT_PROVIDER]
        }
      },
      select: {
        id: true
      }
    });
    const location = getImportedEventLocation(event);
    const host = getImportedEventHost(event, userEmail, userName);
    const data = {
      title: event.summary?.trim() || "Untitled Google Calendar event",
      startsAt,
      endsAt,
      locationType: location.locationType,
      locationLabel: location.locationLabel,
      meetingUrl: location.meetingUrl,
      hostName: host.hostName,
      hostEmail: host.hostEmail
    };

    if (existingMeeting) {
      await prisma.meetingEvent.update({
        where: { id: existingMeeting.id },
        data
      });
      continue;
    }

    await prisma.meetingEvent.create({
      data: {
        workspaceId,
        ...data,
        recordMeeting: false,
        insightEnabled: false,
        externalCalendarProvider: GOOGLE_CALENDAR_IMPORT_PROVIDER,
        externalCalendarId: connection.calendarId,
        externalEventId
      }
    });
  }

  await prisma.meetingEvent.deleteMany({
    where: {
      workspaceId,
      externalCalendarProvider: GOOGLE_CALENDAR_IMPORT_PROVIDER,
      externalCalendarId: connection.calendarId,
      externalEventId: {
        notIn: syncedEventIds
      },
      startsAt: {
        gte: timeMin,
        lte: timeMax
      }
    }
  });
}

export function isGoogleCalendarProvider(value: string | null | undefined) {
  return value === GOOGLE_CALENDAR_PROVIDER;
}

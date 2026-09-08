import { MeetingsWorkspace } from "@/components/meetings-workspace";
import { getAppBaseUrl } from "@/lib/app-url";
import {
  applyGoogleMeetConnectionStatus,
  findGoogleCalendarConnectionByUserId,
  isGoogleCalendarConfigured,
  syncGoogleCalendarEventsForConnection
} from "@/lib/google-calendar";
import { listMeetingEvents } from "@/lib/meeting-event-store";
import { ensureMeetingWorkspaceDefaults, syncMeetingWorkspaceOwner } from "@/lib/meetings";
import { prisma } from "@/lib/prisma";
import { getWorkspaceLocalizationSettings } from "@/lib/workspace-localization";
import { requireWorkspaceContext } from "@/lib/workspace";

export const dynamic = "force-dynamic";

function firstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function meetingFeedbackFromSearchParam(value: string | string[] | undefined, errorMessage: string | string[] | undefined) {
  const status = firstSearchParam(value);
  const detail = firstSearchParam(errorMessage)?.trim();

  if (status === "google-error" && detail) {
    return `Unable to connect Google Calendar. ${detail}`;
  }

  switch (status) {
    case "google-connected":
      return "Google Calendar connected.";
    case "google-denied":
      return "Google Calendar access was cancelled.";
    case "google-invalid-state":
      return "Google Calendar connection expired. Try connecting again.";
    case "google-missing-config":
      return "Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET before connecting Google Calendar.";
    case "google-error":
      return "Unable to connect Google Calendar.";
    default:
      return null;
  }
}

export default async function MeetingsPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { user: currentUser, workspace } = await requireWorkspaceContext();
  const appBaseUrl = await getAppBaseUrl();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const tab = resolvedSearchParams.tab;
  const mode = resolvedSearchParams.mode;
  const initialTab = Array.isArray(tab) ? tab[0] : tab;
  const initialAvailabilityMode = Array.isArray(mode) ? mode[0] : mode;
  const initialFeedback = meetingFeedbackFromSearchParam(resolvedSearchParams.meetingSetup, resolvedSearchParams.meetingSetupError);

  await ensureMeetingWorkspaceDefaults(workspace.id);
  await syncMeetingWorkspaceOwner({
    fullName: currentUser.fullName,
    email: currentUser.email
  }, workspace.id);
  const localization = await getWorkspaceLocalizationSettings();

  const [pages, preferences, googleCalendarConnection] = await Promise.all([
    prisma.schedulingPage.findMany({
      where: { workspaceId: workspace.id },
      orderBy: [{ active: "desc" }, { durationMinutes: "asc" }, { createdAt: "asc" }]
    }),
    prisma.meetingPreference.upsert({
      where: { workspaceId: workspace.id },
      update: {},
      create: { workspaceId: workspace.id }
    }),
    findGoogleCalendarConnectionByUserId(currentUser.id)
  ]);
  let calendarSyncFeedback: string | null = null;

  if (googleCalendarConnection) {
    try {
      await syncGoogleCalendarEventsForConnection({
        connection: googleCalendarConnection,
        workspaceId: workspace.id,
        userName: currentUser.fullName,
        userEmail: currentUser.email
      });
    } catch (error) {
      calendarSyncFeedback = error instanceof Error ? `Google Calendar connected, but events could not be synced. ${error.message}` : "Google Calendar connected, but events could not be synced.";
    }
  }

  const meetings = await listMeetingEvents({
    workspaceId: workspace.id,
    orderBy: [{ startsAt: "asc" }, { createdAt: "desc" }]
  });
  const hydratedPreferences = {
    ...(await applyGoogleMeetConnectionStatus(preferences, () => Promise.resolve(googleCalendarConnection))),
    zoomConnected: false,
    microsoftTeamsConnected: false
  };

  return (
    <MeetingsWorkspace
      appBaseUrl={appBaseUrl}
      initialMeetings={meetings}
      initialPages={pages}
      initialPreferences={hydratedPreferences}
      localization={localization}
      googleCalendarConfigured={await isGoogleCalendarConfigured()}
      initialTab={initialTab === "pages" || initialTab === "availability" ? initialTab : "all"}
      initialAvailabilityMode={initialAvailabilityMode === "setup" ? "setup" : "overview"}
      initialFeedback={initialFeedback || calendarSyncFeedback}
    />
  );
}

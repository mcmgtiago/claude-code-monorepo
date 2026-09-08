import { notFound } from "next/navigation";
import { PublicMeetingBooking } from "@/components/public-meeting-booking";
import { getAppBaseUrl } from "@/lib/app-url";
import {
  applyGoogleMeetConnectionStatus,
  findGoogleCalendarConnectionByEmail,
  isGoogleCalendarConfigured
} from "@/lib/google-calendar";
import { listMeetingEvents } from "@/lib/meeting-event-store";
import { normalizeMeetingSlug } from "@/lib/meeting-booking";
import { ensureMeetingWorkspaceDefaults } from "@/lib/meetings";
import { prisma } from "@/lib/prisma";
import { normalizeLocalizationSettings } from "@/lib/localization";

export const dynamic = "force-dynamic";

export default async function PublicMeetingPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = normalizeMeetingSlug(rawSlug);
  const appBaseUrl = await getAppBaseUrl();
  const directPageSeed = await prisma.schedulingPage.findFirst({
    where: { slug, active: true },
    select: { workspaceId: true }
  });
  const personalMeetingSeed = directPageSeed
    ? null
    : await prisma.meetingPreference.findFirst({
        where: { personalMeetingSlug: slug },
        select: { workspaceId: true }
      });
  const workspaceId = directPageSeed?.workspaceId || personalMeetingSeed?.workspaceId || null;

  if (!workspaceId) {
    notFound();
  }

  await ensureMeetingWorkspaceDefaults(workspaceId);
  const [rawPreferences, pages, workspaceSettings] = await Promise.all([
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

  if (!rawPreferences) {
    notFound();
  }

  const localization = normalizeLocalizationSettings(workspaceSettings);
  const googleCalendarConnection = await findGoogleCalendarConnectionByEmail(rawPreferences.profileEmail);

  const meetings = await listMeetingEvents({
    workspaceId,
    where: {
      endsAt: {
        gte: new Date()
      }
    },
    orderBy: [{ startsAt: "asc" }]
  });
  const preferences = {
    ...(await applyGoogleMeetConnectionStatus(rawPreferences, () => Promise.resolve(googleCalendarConnection))),
    zoomConnected: false,
    microsoftTeamsConnected: false
  };

  const directPage = pages.find((page) => page.slug === slug) || null;
  const isPersonalMeeting = preferences.personalMeetingSlug === slug;

  if (!directPage && !isPersonalMeeting) {
    notFound();
  }

  const visiblePages = directPage ? [directPage] : pages;

  return (
    <PublicMeetingBooking
      appBaseUrl={appBaseUrl}
      slug={slug}
      pages={visiblePages}
      preferences={preferences}
      meetings={meetings}
      localization={localization}
      isPersonalMeeting={isPersonalMeeting}
      initialPageId={visiblePages[0]?.id || null}
      googleCalendarConfigured={await isGoogleCalendarConfigured()}
    />
  );
}

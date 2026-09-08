import { addDays } from "date-fns";
import { MeetingLocationType, MeetingNoticeUnit } from "@prisma/client";
import { formatLocalizedTimeRange, type WorkspaceLocalizationSettings } from "@/lib/localization";

export type BookingAvailabilitySlot = {
  day: string;
  enabled: boolean;
  start: string;
  end: string;
};

export type BookingMeetingRecord = {
  startsAt: string | Date;
  endsAt: string | Date;
};

export type BookingPreferences = {
  weeklyAvailability: string;
  bufferBeforeEnabled: boolean;
  bufferBeforeMinutes: number;
  bufferAfterEnabled: boolean;
  bufferAfterMinutes: number;
  minNoticeValue: number;
  minNoticeUnit: MeetingNoticeUnit;
  defaultLocationType: MeetingLocationType;
  customLink: string | null;
  googleMeetConnected: boolean;
  zoomConnected: boolean;
  microsoftTeamsConnected: boolean;
};

export type BookingPageRecord = {
  id: string;
  title: string;
  slug: string;
  durationMinutes: number;
  hostType: string;
  active: boolean;
  hostName: string;
  hostEmail: string;
};

export type BookingDay = {
  dateKey: string;
  label: string;
  slots: Array<{
    startIso: string;
    endIso: string;
    label: string;
  }>;
};

const defaultDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function normalizeMeetingSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function parseMeetingAvailability(serialized: string): BookingAvailabilitySlot[] {
  try {
    const parsed = JSON.parse(serialized) as BookingAvailabilitySlot[];

    if (Array.isArray(parsed) && parsed.length) {
      return parsed;
    }
  } catch {
    return defaultDays.map((day, index) => ({
      day,
      enabled: index < 5,
      start: "09:00 AM",
      end: "05:00 PM"
    }));
  }

  return defaultDays.map((day, index) => ({
    day,
    enabled: index < 5,
    start: "09:00 AM",
    end: "05:00 PM"
  }));
}

function timeLabelToParts(value: string) {
  const [time, period] = value.split(" ");
  const [hoursRaw, minutesRaw] = time.split(":").map(Number);
  let hours = hoursRaw % 12;

  if (period === "PM") {
    hours += 12;
  }

  return { hours, minutes: minutesRaw };
}

function formatDateKeyInTimeZone(value: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(value);

  const year = parts.find((part) => part.type === "year")?.value || "0000";
  const month = parts.find((part) => part.type === "month")?.value || "01";
  const day = parts.find((part) => part.type === "day")?.value || "01";

  return `${year}-${month}-${day}`;
}

function formatWeekdayInTimeZone(value: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long"
  }).format(value);
}

function getTimeZoneOffset(value: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).formatToParts(value);

  const year = Number(parts.find((part) => part.type === "year")?.value || "0");
  const month = Number(parts.find((part) => part.type === "month")?.value || "1");
  const day = Number(parts.find((part) => part.type === "day")?.value || "1");
  const hour = Number(parts.find((part) => part.type === "hour")?.value || "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value || "0");
  const second = Number(parts.find((part) => part.type === "second")?.value || "0");
  const reconstructedUtc = Date.UTC(year, month - 1, day, hour, minute, second);

  return reconstructedUtc - value.getTime();
}

export function zonedDateTimeToUtc(dateKey: string, timeLabel: string, timeZone: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const { hours, minutes } = timeLabelToParts(timeLabel);
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
  const offset = getTimeZoneOffset(utcGuess, timeZone);
  return new Date(utcGuess.getTime() - offset);
}

function dateLabelForKey(dateKey: string, localization: WorkspaceLocalizationSettings) {
  return new Intl.DateTimeFormat(localization.locale, {
    timeZone: localization.timezone,
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(zonedDateTimeToUtc(dateKey, "12:00 PM", localization.timezone));
}

function minNoticeInMinutes(value: number, unit: MeetingNoticeUnit) {
  switch (unit) {
    case MeetingNoticeUnit.DAYS:
      return value * 24 * 60;
    case MeetingNoticeUnit.HOURS:
    default:
      return value * 60;
  }
}

function createTimeOptionsForRange(start: string, end: string, durationMinutes: number) {
  const startParts = timeLabelToParts(start);
  const endParts = timeLabelToParts(end);
  const startTotal = startParts.hours * 60 + startParts.minutes;
  const endTotal = endParts.hours * 60 + endParts.minutes;
  const slots: string[] = [];

  for (let value = startTotal; value + durationMinutes <= endTotal; value += 30) {
    const hours = Math.floor(value / 60);
    const minutes = value % 60;
    const period = hours >= 12 ? "PM" : "AM";
    const normalizedHours = hours % 12 === 0 ? 12 : hours % 12;
    slots.push(`${String(normalizedHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`);
  }

  return slots;
}

export function buildBookingAvailability({
  meetings,
  page,
  preferences,
  localization,
  horizonDays = 21,
  maxVisibleDays = horizonDays
}: {
  meetings: BookingMeetingRecord[];
  page: BookingPageRecord;
  preferences: BookingPreferences;
  localization: WorkspaceLocalizationSettings;
  horizonDays?: number;
  maxVisibleDays?: number;
}) {
  const availability = parseMeetingAvailability(preferences.weeklyAvailability);
  const days: BookingDay[] = [];
  const now = new Date();
  const noticeThreshold = now.getTime() + minNoticeInMinutes(preferences.minNoticeValue, preferences.minNoticeUnit) * 60_000;
  const bufferBefore = (preferences.bufferBeforeEnabled ? preferences.bufferBeforeMinutes : 0) * 60_000;
  const bufferAfter = (preferences.bufferAfterEnabled ? preferences.bufferAfterMinutes : 0) * 60_000;

  for (let index = 0; index < horizonDays && days.length < maxVisibleDays; index += 1) {
    const candidate = addDays(now, index);
    const dateKey = formatDateKeyInTimeZone(candidate, localization.timezone);
    const weekday = formatWeekdayInTimeZone(candidate, localization.timezone);
    const dayAvailability = availability.find((item) => item.day === weekday && item.enabled);

    if (!dayAvailability) {
      continue;
    }

    const slots = createTimeOptionsForRange(dayAvailability.start, dayAvailability.end, page.durationMinutes)
      .map((timeLabel) => {
        const startDate = zonedDateTimeToUtc(dateKey, timeLabel, localization.timezone);
        const endDate = new Date(startDate.getTime() + page.durationMinutes * 60_000);

        if (startDate.getTime() < noticeThreshold) {
          return null;
        }

        const overlaps = meetings.some((meeting) => {
          const meetingStart = new Date(meeting.startsAt).getTime() - bufferBefore;
          const meetingEnd = new Date(meeting.endsAt).getTime() + bufferAfter;
          return startDate.getTime() < meetingEnd && endDate.getTime() > meetingStart;
        });

        if (overlaps) {
          return null;
        }

        return {
          startIso: startDate.toISOString(),
          endIso: endDate.toISOString(),
          label: formatLocalizedTimeRange(startDate, endDate, localization)
        };
      })
      .filter(Boolean) as BookingDay["slots"];

    if (!slots.length) {
      continue;
    }

    days.push({
      dateKey,
      label: dateLabelForKey(dateKey, localization),
      slots
    });
  }

  return days;
}

export function resolveMeetingLocation(preferences: BookingPreferences, _seed: string) {
  switch (preferences.defaultLocationType) {
    case MeetingLocationType.ZOOM:
      throw new Error("Zoom booking links are not wired yet. Use Google Meet or a custom link.");
    case MeetingLocationType.MICROSOFT_TEAMS:
      throw new Error("Microsoft Teams booking links are not wired yet. Use Google Meet or a custom link.");
    case MeetingLocationType.CUSTOM_LINK:
      return {
        locationType: MeetingLocationType.CUSTOM_LINK,
        locationLabel: "Custom link",
        meetingUrl: preferences.customLink || null
      };
    case MeetingLocationType.GOOGLE_MEET:
    default:
      return {
        locationType: MeetingLocationType.GOOGLE_MEET,
        locationLabel: "Google Meet",
        meetingUrl: null
      };
  }
}

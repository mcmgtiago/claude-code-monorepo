"use client";

import { AppSelect } from "@/components/app-select";
import { AppDatePicker } from "@/components/app-date-time-picker";
import { MeetingLocationType, MeetingNoticeUnit } from "@prisma/client";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  LayoutList,
  Link2,
  Mail,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  MapPin,
  Trash2,
  Calendar,
  Clock,
  Type,
  User,
  X
} from "lucide-react";
import { Card } from "@/components/card";
import { useConfirmAction } from "@/components/confirm-action-modal";
import { FeedbackToast } from "@/components/feedback-toast";
import { MeetingProviderLogo, type MeetingProviderLogoId } from "@/components/meeting-provider-logo";
import { PaginationControls } from "@/components/pagination-controls";
import { SearchHotkeyButton, useCommandKFocus } from "@/components/search-hotkey";
import { zonedDateTimeToUtc } from "@/lib/meeting-booking";
import { formatLocalizedDate, formatLocalizedTimeRange, type WorkspaceLocalizationSettings } from "@/lib/localization";
import { paginateItems } from "@/lib/pagination";

type MeetingEventRecord = {
  id: string;
  title: string;
  startsAt: string | Date;
  endsAt: string | Date;
  locationType: MeetingLocationType;
  locationLabel: string | null;
  meetingUrl: string | null;
  recordMeeting: boolean;
  insightEnabled: boolean;
  hostName: string;
  hostEmail: string;
};

type SchedulingPageRecord = {
  id: string;
  title: string;
  slug: string;
  durationMinutes: number;
  hostType: string;
  active: boolean;
  hostName: string;
  hostEmail: string;
};

type SchedulingPageForm = {
  title: string;
  slug: string;
  durationMinutes: number;
  hostName: string;
  hostEmail: string;
};

type SchedulingPageModalState = {
  mode: "create" | "edit";
  form: SchedulingPageForm;
  targetId?: string;
} | null;

type MeetingPreferenceRecord = {
  id: string;
  profileName: string;
  profileEmail: string;
  personalMeetingSlug: string;
  timezoneLabel: string;
  googleMeetConnected: boolean;
  zoomConnected: boolean;
  microsoftTeamsConnected: boolean;
  customLink: string | null;
  defaultLocationType: MeetingLocationType;
  weeklyAvailability: string;
  bufferBeforeEnabled: boolean;
  bufferBeforeMinutes: number;
  bufferAfterEnabled: boolean;
  bufferAfterMinutes: number;
  minNoticeValue: number;
  minNoticeUnit: MeetingNoticeUnit;
};

type AvailabilitySlot = {
  day: string;
  enabled: boolean;
  start: string;
  end: string;
};

type MeetingForm = {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  locationType: MeetingLocationType;
  meetingUrl: string;
};

type MeetingFilters = {
  locationType: "ALL" | MeetingLocationType;
};

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/20 hover:border-slate-300";

const inputWithIconClassName =
  "w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/20 hover:border-slate-300";

const inputIconWrapperClassName = "absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none h-4 w-4 z-10";

const filterOptionIconClassName = "h-3.5 w-3.5 text-slate-400";

const locationTypeFilterOptions = [
  { value: "ALL", label: "All locations", icon: <MapPin className={filterOptionIconClassName} /> },
  { value: "GOOGLE_MEET", label: "Google Meet", icon: <MeetingProviderLogo provider="GOOGLE_MEET" iconClassName="h-3.5 w-3.5" /> },
  { value: "ZOOM", label: "Zoom", icon: <MeetingProviderLogo provider="ZOOM" iconClassName="h-3.5 w-3.5" /> },
  { value: "MICROSOFT_TEAMS", label: "Microsoft Teams", icon: <MeetingProviderLogo provider="MICROSOFT_TEAMS" iconClassName="h-3.5 w-3.5" /> },
  { value: "CUSTOM_LINK", label: "Custom link", icon: <MeetingProviderLogo provider="CUSTOM_LINK" iconClassName="h-3.5 w-3.5" /> }
];

const selectClassName = `${inputClassName} pr-10 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_10px_center]`;

const selectWithIconClassName = `${inputWithIconClassName} pr-10 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_10px_center]`;

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const timeOptions = Array.from({ length: 48 }, (_, index) => {
  const totalMinutes = index * 30;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const normalizedHours = hours % 12 === 0 ? 12 : hours % 12;
  const label = `${String(normalizedHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
  return label;
});

function defaultAvailability(): AvailabilitySlot[] {
  return days.map((day, index) => ({
    day,
    enabled: index < 5,
    start: "09:00 AM",
    end: "05:00 PM"
  }));
}

function parseAvailability(serialized: string) {
  try {
    const parsed = JSON.parse(serialized) as AvailabilitySlot[];
    if (Array.isArray(parsed) && parsed.length) {
      return parsed;
    }
  } catch {
    return defaultAvailability();
  }

  return defaultAvailability();
}

function emptyMeetingForm(preferences: MeetingPreferenceRecord): MeetingForm {
  return {
    title: "",
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "12:30 PM",
    endTime: "01:30 PM",
    locationType: preferences.defaultLocationType,
    meetingUrl: preferences.defaultLocationType === "CUSTOM_LINK" ? preferences.customLink || "" : ""
  };
}

function normalizeMeetingUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (/^[a-z][a-z\d+\-.]*:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function isValidMeetingUrl(value: string) {
  try {
    const url = new URL(normalizeMeetingUrl(value));
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function meetingLinkRequirement(type: MeetingLocationType, preferences: MeetingPreferenceRecord) {
  if (type === "GOOGLE_MEET" && preferences.googleMeetConnected) {
    return {
      required: false,
      autoGenerated: true,
      label: "Google Meet link",
      placeholder: "",
      help: "A Calendar event and Google Meet link will be created automatically."
    };
  }

  if (type === "GOOGLE_MEET") {
    return {
      required: true,
      autoGenerated: false,
      label: "Google Meet link",
      placeholder: "https://meet.google.com/abc-defg-hij",
      help: "Connect Google Calendar to generate links automatically, or paste an existing Meet link."
    };
  }

  return {
    required: true,
    autoGenerated: false,
    label: `${providerLabel(type)} URL`,
    placeholder:
      type === "ZOOM"
        ? "https://zoom.us/j/123456789"
        : type === "MICROSOFT_TEAMS"
          ? "https://teams.microsoft.com/l/meetup-join/..."
          : "https://meet.google.com/abc-defg-hij",
    help: type === "CUSTOM_LINK" ? "Paste any meeting URL. This opens the link; it does not create a new video room." : "Paste the meeting URL from this provider."
  };
}

function timeLabelToParts(value: string) {
  const [time, period] = value.split(" ");
  const [hoursRaw, minutesRaw] = time.split(":").map(Number);
  let hours = hoursRaw % 12;

  if (period === "PM") {
    hours += 12;
  }

  return {
    hours,
    minutes: minutesRaw
  };
}

function timeLabelToMinutes(value: string) {
  const { hours, minutes } = timeLabelToParts(value);
  return hours * 60 + minutes;
}

function combineMeetingDateTime(date: string, timeLabel: string, localization: WorkspaceLocalizationSettings) {
  return zonedDateTimeToUtc(date, timeLabel, localization.timezone).toISOString();
}

function formatTimeInputLabel(value: string | Date, localization: WorkspaceLocalizationSettings) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: localization.timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }).formatToParts(value instanceof Date ? value : new Date(value));
  const hour = parts.find((part) => part.type === "hour")?.value || "12";
  const minute = parts.find((part) => part.type === "minute")?.value || "00";
  const dayPeriod = parts.find((part) => part.type === "dayPeriod")?.value.toUpperCase() || "AM";
  return `${hour}:${minute} ${dayPeriod}`;
}

function formatDateInputValue(value: string | Date, localization: WorkspaceLocalizationSettings) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: localization.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(value instanceof Date ? value : new Date(value));
  const year = parts.find((part) => part.type === "year")?.value || "0000";
  const month = parts.find((part) => part.type === "month")?.value || "01";
  const day = parts.find((part) => part.type === "day")?.value || "01";
  return `${year}-${month}-${day}`;
}

function meetingFormFromRecord(meeting: MeetingEventRecord, localization: WorkspaceLocalizationSettings): MeetingForm {
  return {
    title: meeting.title,
    date: formatDateInputValue(meeting.startsAt, localization),
    startTime: formatTimeInputLabel(meeting.startsAt, localization),
    endTime: formatTimeInputLabel(meeting.endsAt, localization),
    locationType: meeting.locationType,
    meetingUrl: meeting.meetingUrl || ""
  };
}

function formatMeetingDate(value: string | Date, localization: WorkspaceLocalizationSettings) {
  return formatLocalizedDate(value, localization);
}

function formatMeetingTime(start: string | Date, end: string | Date, localization: WorkspaceLocalizationSettings) {
  return formatLocalizedTimeRange(start, end, localization);
}

function formatDuration(minutes: number) {
  return `${minutes} min`;
}

function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "meeting";
}

function defaultSchedulingPageForm(preferences: MeetingPreferenceRecord): SchedulingPageForm {
  return {
    title: "",
    slug: "",
    durationMinutes: 30,
    hostName: preferences.profileName,
    hostEmail: preferences.profileEmail
  };
}

function calendarDateKey(value: string | Date) {
  return format(value instanceof Date ? value : new Date(value), "yyyy-MM-dd");
}

function calendarMonthLabel(value: Date, localization: WorkspaceLocalizationSettings) {
  return new Intl.DateTimeFormat(localization.locale, {
    month: "long",
    year: "numeric"
  }).format(value);
}

function calendarWeekdayLabel(value: Date, localization: WorkspaceLocalizationSettings) {
  return new Intl.DateTimeFormat(localization.locale, {
    weekday: "short"
  }).format(value);
}

function calendarDayLabel(value: string, localization: WorkspaceLocalizationSettings) {
  return new Intl.DateTimeFormat(localization.locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${value}T12:00:00`));
}

function formatTimeZoneOffset(value: Date, timeZone: string) {
  const offsetName = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset"
  })
    .formatToParts(value)
    .find((part) => part.type === "timeZoneName")?.value;

  if (!offsetName || offsetName === "GMT") {
    return "GMT";
  }

  return offsetName.replace("GMT", "GMT ");
}

function formatTimeZoneLabel(localization: WorkspaceLocalizationSettings) {
  const now = new Date();
  const displayName = new Intl.DateTimeFormat(localization.locale, {
    timeZone: localization.timezone,
    timeZoneName: "long"
  })
    .formatToParts(now)
    .find((part) => part.type === "timeZoneName")?.value;

  return `${displayName || localization.timezone} (${formatTimeZoneOffset(now, localization.timezone)})`;
}

function hostInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function providerLabel(type: MeetingLocationType) {
  switch (type) {
    case "ZOOM":
      return "Zoom";
    case "MICROSOFT_TEAMS":
      return "Microsoft Teams";
    case "CUSTOM_LINK":
      return "Custom link";
    default:
      return "Google Meet";
  }
}

function providerTone(type: MeetingLocationType) {
  switch (type) {
    case "ZOOM":
      return "bg-[#eef4ff] text-[#386df4] border border-[#d6e4ff]";
    case "MICROSOFT_TEAMS":
      return "bg-[#f3efff] text-[#6454d8] border border-[#e2d8ff]";
    case "CUSTOM_LINK":
      return "bg-slate-100 text-slate-600 border border-slate-200";
    default:
      return "bg-[#eefbf5] text-[#18b46f] border border-[#d5f4e4]";
  }
}

function providerCalendarChipTone(type: MeetingLocationType) {
  switch (type) {
    case "ZOOM":
      return "border-[#d6e4ff] bg-[#f6f9ff] text-[#386df4]";
    case "MICROSOFT_TEAMS":
      return "border-[#e5dcff] bg-[#faf8ff] text-[#6454d8]";
    case "CUSTOM_LINK":
      return "border-slate-200 bg-slate-50 text-slate-600";
    default:
      return "border-[#d7f1e3] bg-[#f5fcf8] text-[#18b46f]";
  }
}

function providerConnected(type: MeetingLocationType, preferences: MeetingPreferenceRecord) {
  switch (type) {
    case "ZOOM":
      return preferences.zoomConnected;
    case "MICROSOFT_TEAMS":
      return preferences.microsoftTeamsConnected;
    case "CUSTOM_LINK":
      return Boolean(preferences.customLink?.trim());
    case "GOOGLE_MEET":
    default:
      return preferences.googleMeetConnected;
  }
}

function meetingInsightSummary(meeting: MeetingEventRecord, localization: WorkspaceLocalizationSettings) {
  const title = meeting.title.toLowerCase();

  if (title.includes("standup") || title.includes("sync")) {
    return [
      "Use this insight to capture blockers, owners, and next follow-ups from the discussion.",
      `The meeting is scheduled for ${formatMeetingTime(meeting.startsAt, meeting.endsAt, localization)} with ${meeting.hostName}.`,
      "After the call, keep the action items in Tasks or Pipeline so the team has a clear next step."
    ];
  }

  if (title.includes("discovery") || title.includes("demo") || title.includes("client")) {
    return [
      "Use insight to summarize customer needs, objections, and commercial next steps.",
      `The host is ${meeting.hostName} and the call will run via ${providerLabel(meeting.locationType)}.`,
      "If this is revenue-related, move the follow-up into Pipeline immediately after the meeting."
    ];
  }

  return [
    "Use insight to keep a short meeting summary, owner notes, and follow-up actions in one place.",
    `This event runs ${formatMeetingDate(meeting.startsAt, localization)} at ${formatMeetingTime(meeting.startsAt, meeting.endsAt, localization)}.`,
    "Recording should stay on if you want post-meeting review to make sense in the CRM."
  ];
}

async function parseJson<T>(response: Response) {
  const payload = (await response.json().catch(() => null)) as T | { error?: string } | null;

  if (!response.ok) {
    throw new Error((payload as { error?: string } | null)?.error || "Request failed");
  }

  return payload as T;
}

function NewMeetingModal({
  open,
  form,
  preferences,
  busy,
  heading = "New meeting",
  submitLabel = "Create meeting",
  busyLabel = "Saving...",
  onClose,
  onChange,
  onSubmit
}: {
  open: boolean;
  form: MeetingForm;
  preferences: MeetingPreferenceRecord;
  busy: boolean;
  heading?: string;
  submitLabel?: string;
  busyLabel?: string;
  onClose: () => void;
  onChange: (next: MeetingForm) => void;
  onSubmit: () => void;
}) {
  if (!open) {
    return null;
  }

  const linkInfo = meetingLinkRequirement(form.locationType, preferences);
  const canSubmit = Boolean(form.title.trim()) && (!linkInfo.required || isValidMeetingUrl(form.meetingUrl));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.16)] px-6 backdrop-blur-[2px]">
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-[560px] overflow-y-auto rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-[1.3rem] font-semibold text-slate-900">{heading}</h2>
          <button type="button" aria-label="Close meeting dialog" onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="space-y-2">
            <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Title</label>
            <div className="relative">
              <Type className={inputIconWrapperClassName} />
              <input className={inputWithIconClassName} value={form.title} onChange={(event) => onChange({ ...form, title: event.target.value })} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Date</label>
              <div className="relative">
                <Calendar className={inputIconWrapperClassName} />
                <AppDatePicker className={inputWithIconClassName} value={form.date} onChange={(date) => onChange({ ...form, date })} placeholder="Select date" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Start</label>
              <div className="relative">
                <Clock className={inputIconWrapperClassName} />
                <AppSelect className={selectWithIconClassName} value={form.startTime} onChange={(event) => onChange({ ...form, startTime: event.target.value })}>
                  {timeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </AppSelect>
              </div>
            </div>
            <div className="space-y-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">End</label>
              <div className="relative">
                <Clock className={inputIconWrapperClassName} />
                <AppSelect className={selectWithIconClassName} value={form.endTime} onChange={(event) => onChange({ ...form, endTime: event.target.value })}>
                  {timeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </AppSelect>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Location</label>
              <AppSelect
                className={selectClassName}
                value={form.locationType}
                options={[
                  { value: "GOOGLE_MEET", label: "Google Meet", icon: <MeetingProviderLogo provider="GOOGLE_MEET" iconClassName="h-4 w-4" /> },
                  { value: "ZOOM", label: "Zoom", icon: <MeetingProviderLogo provider="ZOOM" iconClassName="h-4 w-4" /> },
                  { value: "MICROSOFT_TEAMS", label: "Microsoft Teams", icon: <MeetingProviderLogo provider="MICROSOFT_TEAMS" iconClassName="h-4 w-4" /> },
                  { value: "CUSTOM_LINK", label: "Custom link", icon: <MeetingProviderLogo provider="CUSTOM_LINK" iconClassName="h-4 w-4" /> }
                ]}
                onChange={(event) => {
                  const locationType = event.target.value as MeetingLocationType;
                  onChange({
                    ...form,
                    locationType,
                    meetingUrl: locationType === "CUSTOM_LINK" ? preferences.customLink || "" : ""
                  });
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">{linkInfo.label}</label>
              {linkInfo.autoGenerated ? (
                <div className="flex min-h-[42px] items-center gap-2 rounded-xl border border-[#d7f1e3] bg-[#f5fcf8] px-3.5 py-2.5 text-sm font-medium text-[#138553]">
                  <MeetingProviderLogo provider="GOOGLE_MEET" iconClassName="h-4 w-4" />
                  Created automatically
                </div>
              ) : (
                <div className="relative">
                  <Link2 className={inputIconWrapperClassName} />
                  <input
                    className={`${inputWithIconClassName} ${form.meetingUrl.trim() && !isValidMeetingUrl(form.meetingUrl) ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
                    value={form.meetingUrl}
                    onChange={(event) => onChange({ ...form, meetingUrl: event.target.value })}
                    placeholder={linkInfo.placeholder}
                  />
                </div>
              )}
              {form.meetingUrl.trim() && !isValidMeetingUrl(form.meetingUrl) ? (
                <div className="text-xs leading-5 text-red-500">Enter a valid meeting URL.</div>
              ) : null}
            </div>
          </div>

        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button type="button" onClick={onClose} className="crm-btn crm-btn-secondary">
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={busy || !canSubmit}
            className="rounded-xl bg-[#386df4] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? busyLabel : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function SchedulingPageModal({
  open,
  mode,
  form,
  preferences,
  busy,
  onClose,
  onChange,
  onSubmit
}: {
  open: boolean;
  mode: "create" | "edit";
  form: SchedulingPageForm;
  preferences: MeetingPreferenceRecord;
  busy: boolean;
  onClose: () => void;
  onChange: (next: SchedulingPageForm) => void;
  onSubmit: () => void;
}) {
  if (!open) return null;

  const canSubmit = Boolean(form.title.trim()) && Boolean(form.slug.trim());

  const handleTitleChange = (title: string) => {
    if (mode === "create") {
      onChange({ ...form, title, slug: `${preferences.personalMeetingSlug}-${slugifyTitle(title)}` });
    } else {
      onChange({ ...form, title });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.16)] px-6 backdrop-blur-[2px]">
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-[560px] overflow-y-auto rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-[1.3rem] font-semibold text-slate-900">
            {mode === "create" ? "New meeting type" : "Edit meeting type"}
          </h2>
          <button type="button" aria-label="Close" onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="space-y-2">
            <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Title</label>
            <div className="relative">
              <Type className={inputIconWrapperClassName} />
              <input
                className={inputWithIconClassName}
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. 30 Minute Meeting"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Duration</label>
              <div className="relative">
                <Clock className={inputIconWrapperClassName} />
                <AppSelect
                  className={selectWithIconClassName}
                  value={String(form.durationMinutes)}
                  onChange={(e) => onChange({ ...form, durationMinutes: Number(e.target.value) })}
                >
                  {[15, 20, 30, 45, 60, 90].map((min) => (
                    <option key={min} value={String(min)}>
                      {formatDuration(min)}
                    </option>
                  ))}
                </AppSelect>
              </div>
            </div>
            <div className="space-y-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Booking link slug</label>
              <div className="relative">
                <Link2 className={inputIconWrapperClassName} />
                <input
                  className={inputWithIconClassName}
                  value={form.slug}
                  onChange={(e) => onChange({ ...form, slug: e.target.value })}
                  placeholder="e.g. my-30-min-meeting"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Host name</label>
              <div className="relative">
                <User className={inputIconWrapperClassName} />
                <input
                  className={inputWithIconClassName}
                  value={form.hostName}
                  onChange={(e) => onChange({ ...form, hostName: e.target.value })}
                  placeholder="Host display name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase text-slate-500">Host email</label>
              <div className="relative">
                <Mail className={inputIconWrapperClassName} />
                <input
                  type="email"
                  className={inputWithIconClassName}
                  value={form.hostEmail}
                  onChange={(e) => onChange({ ...form, hostEmail: e.target.value })}
                  placeholder="host@example.com"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button type="button" onClick={onClose} className="crm-btn crm-btn-secondary">
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={busy || !canSubmit}
            className="rounded-xl bg-[#386df4] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Saving..." : mode === "create" ? "Create type" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MeetingInsightModal({
  meeting,
  preferences,
  localization,
  busy,
  onClose,
  onToggleRecording,
  onToggleInsight
}: {
  meeting: MeetingEventRecord | null;
  preferences: MeetingPreferenceRecord;
  localization: WorkspaceLocalizationSettings;
  busy: boolean;
  onClose: () => void;
  onToggleRecording: (meeting: MeetingEventRecord, value: boolean) => void;
  onToggleInsight: (meeting: MeetingEventRecord, value: boolean) => void;
}) {
  if (!meeting) {
    return null;
  }

  const connectionReady = providerConnected(meeting.locationType, preferences) || Boolean(meeting.meetingUrl?.trim());
  const summary = meetingInsightSummary(meeting, localization);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,23,42,0.16)] px-6 backdrop-blur-[2px]">
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-[760px] overflow-y-auto rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#386df4]">Meeting insight</div>
            <h2 className="mt-2 text-[1.45rem] font-semibold tracking-tight text-slate-900">{meeting.title}</h2>
            <div className="mt-2 text-sm text-slate-500">
              {formatMeetingDate(meeting.startsAt, localization)} • {formatMeetingTime(meeting.startsAt, meeting.endsAt, localization)} • {providerLabel(meeting.locationType)}
            </div>
          </div>
          <button type="button" aria-label="Close meeting insight" onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 px-6 py-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#dbe5fb] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5">
              <div className="text-sm font-semibold text-slate-900">How this works</div>
              <div className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
                {summary.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-sm font-semibold text-slate-900">Readiness</div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-slate-900">Recording</div>
                    <div className="mt-1 text-xs text-slate-500">Required before insight can be reviewed here.</div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meeting.recordMeeting ? "bg-[#eef4ff] text-[#386df4]" : "bg-slate-100 text-slate-500"}`}>
                    {meeting.recordMeeting ? "On" : "Off"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-slate-900">Insight capture</div>
                    <div className="mt-1 text-xs text-slate-500">This controls whether the meeting stays insight-ready in CRM.</div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meeting.insightEnabled ? "bg-[#eefbf5] text-[#1fa261]" : "bg-slate-100 text-slate-500"}`}>
                    {meeting.insightEnabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-slate-900">Provider connection</div>
                    <div className="mt-1 text-xs text-slate-500">Google Meet, Zoom, Teams, or a custom link must be configured.</div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${connectionReady ? "bg-[#eefbf5] text-[#1fa261]" : "bg-[#fff4f0] text-[#d25d37]"}`}>
                    {connectionReady ? "Ready" : "Missing setup"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-sm font-semibold text-slate-900">Actions</div>
            <div className="mt-4 space-y-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => onToggleRecording(meeting, !meeting.recordMeeting)}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-medium ${
                  meeting.recordMeeting ? "border-[#c8d8ff] bg-[#eef4ff] text-[#386df4]" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>{meeting.recordMeeting ? "Turn recording off" : "Turn recording on"}</span>
                <span>{meeting.recordMeeting ? "On" : "Off"}</span>
              </button>

              <button
                type="button"
                disabled={busy || !meeting.recordMeeting}
                onClick={() => onToggleInsight(meeting, !meeting.insightEnabled)}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-medium ${
                  !meeting.recordMeeting
                    ? "border-slate-200 bg-slate-50 text-slate-300"
                    : meeting.insightEnabled
                      ? "border-[#d6f1e3] bg-[#eefbf5] text-[#1fa261]"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>{meeting.insightEnabled ? "Disable insight" : "Enable insight"}</span>
                <span>{meeting.insightEnabled ? "On" : "Off"}</span>
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
              {!meeting.recordMeeting
                ? "Insight stays unavailable until recording is enabled for this meeting."
                : !connectionReady
                  ? "Recording and insight are enabled in CRM, but the meeting location still needs a working provider or custom link."
                  : "This meeting is fully configured inside the CRM workflow. If you later want actual provider-side video capture or transcripts, that requires provider API/webhook integrations beyond this repo."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MeetingsWorkspace({
  appBaseUrl,
  initialMeetings,
  initialPages,
  initialPreferences,
  localization,
  googleCalendarConfigured,
  initialTab,
  initialAvailabilityMode,
  initialFeedback
}: {
  appBaseUrl: string;
  initialMeetings: MeetingEventRecord[];
  initialPages: SchedulingPageRecord[];
  initialPreferences: MeetingPreferenceRecord;
  localization: WorkspaceLocalizationSettings;
  googleCalendarConfigured: boolean;
  initialTab: "all" | "pages" | "availability";
  initialAvailabilityMode: "overview" | "setup";
  initialFeedback: string | null;
}) {
  const { confirm: requestConfirmation, confirmationDialog } = useConfirmAction();
  const meetingsSearchInputRef = useRef<HTMLInputElement | null>(null);
  const meetingTypesSearchInputRef = useRef<HTMLInputElement | null>(null);
  const [tab, setTab] = useState<"all" | "pages" | "availability">(initialTab);
  const [availabilityMode, setAvailabilityMode] = useState<"overview" | "setup">(initialAvailabilityMode);
  const [meetings, setMeetings] = useState(initialMeetings);
  const [pages, setPages] = useState(initialPages);
  const [preferences, setPreferences] = useState(initialPreferences);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>(() => parseAvailability(initialPreferences.weeklyAvailability));
  const [query, setQuery] = useState("");
  const [pageQuery, setPageQuery] = useState("");
  const [meetingView, setMeetingView] = useState<"list" | "calendar">("list");
  const [meetingFilters, setMeetingFilters] = useState<MeetingFilters>({ locationType: "ALL" });
  const [sortMode, setSortMode] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showNewMeetingModal, setShowNewMeetingModal] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);
  const [pageModal, setPageModal] = useState<SchedulingPageModalState>(null);
  const [pageModalBusy, setPageModalBusy] = useState(false);
  const [insightMeeting, setInsightMeeting] = useState<MeetingEventRecord | null>(null);
  const [newMeetingForm, setNewMeetingForm] = useState<MeetingForm>(() => emptyMeetingForm(initialPreferences));
  const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDateKey, setSelectedDateKey] = useState(() => calendarDateKey(new Date()));
  const [feedback, setFeedback] = useState<string | null>(initialFeedback);
  const meetingBaseUrl = `${appBaseUrl.replace(/\/+$/, "")}/meet`;
  const [isPending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);
  const deferredPageQuery = useDeferredValue(pageQuery);
  useCommandKFocus(meetingsSearchInputRef, { priority: 12 });

  useEffect(() => {
    setMeetings(initialMeetings);
  }, [initialMeetings]);

  useEffect(() => {
    setPages(initialPages);
  }, [initialPages]);

  useEffect(() => {
    setPreferences(initialPreferences);
    setAvailability(parseAvailability(initialPreferences.weeklyAvailability));
    setNewMeetingForm(emptyMeetingForm(initialPreferences));
  }, [initialPreferences]);

  useEffect(() => {
    if (tab !== "availability") {
      setAvailabilityMode("overview");
    }
  }, [tab]);

  useEffect(() => {
    setFeedback(initialFeedback);
  }, [initialFeedback]);

  const filteredMeetings = useMemo(() => {
    const value = deferredQuery.trim().toLowerCase();
    const next = meetings.filter((meeting) => {
      const haystack = `${meeting.title} ${providerLabel(meeting.locationType)} ${meeting.hostName}`.toLowerCase();

      if (value && !haystack.includes(value)) {
        return false;
      }

      if (meetingFilters.locationType !== "ALL" && meeting.locationType !== meetingFilters.locationType) {
        return false;
      }

      return true;
    });

    next.sort((left, right) =>
      sortMode === "asc"
        ? new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime()
        : new Date(right.startsAt).getTime() - new Date(left.startsAt).getTime()
    );

    return next;
  }, [deferredQuery, meetingFilters, meetings, sortMode]);

  useEffect(() => {
    setCurrentPage(1);
  }, [deferredQuery, meetingFilters, sortMode]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredMeetings.length / pageSize));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, filteredMeetings.length, pageSize]);

  const paginatedMeetings = useMemo(() => paginateItems(filteredMeetings, currentPage, pageSize), [currentPage, filteredMeetings, pageSize]);

  const calendarWeekStartsOn = localization.weekStartsOn === "Sunday" ? 0 : 1;

  const meetingsByDay = useMemo(() => {
    const grouped = new Map<string, MeetingEventRecord[]>();

    filteredMeetings.forEach((meeting) => {
      const key = calendarDateKey(meeting.startsAt);
      const current = grouped.get(key) || [];
      current.push(meeting);
      current.sort((left, right) =>
        sortMode === "asc"
          ? new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime()
          : new Date(right.startsAt).getTime() - new Date(left.startsAt).getTime()
      );
      grouped.set(key, current);
    });

    return grouped;
  }, [filteredMeetings, sortMode]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(calendarMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: calendarWeekStartsOn });
    const gridEnd = endOfWeek(endOfMonth(monthStart), { weekStartsOn: calendarWeekStartsOn });

    return eachDayOfInterval({ start: gridStart, end: gridEnd }).map((day) => {
      const key = calendarDateKey(day);

      return {
        date: day,
        key,
        isCurrentMonth: isSameMonth(day, monthStart),
        meetings: meetingsByDay.get(key) || []
      };
    });
  }, [calendarMonth, calendarWeekStartsOn, meetingsByDay]);

  const calendarWeekdays = useMemo(() => {
    const weekStart = startOfWeek(calendarMonth, { weekStartsOn: calendarWeekStartsOn });
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + index);
      return {
        key: format(day, "yyyy-MM-dd"),
        label: calendarWeekdayLabel(day, localization)
      };
    });
  }, [calendarMonth, calendarWeekStartsOn, localization]);

  const selectedDayMeetings = useMemo(() => meetingsByDay.get(selectedDateKey) || [], [meetingsByDay, selectedDateKey]);
  const todayDateKey = calendarDateKey(new Date());
  const selectedDateLabel = useMemo(() => calendarDayLabel(selectedDateKey, localization), [localization, selectedDateKey]);
  const selectedDateIsToday = selectedDateKey === todayDateKey;
  const selectedMonthMeetingCount = useMemo(
    () => calendarDays.filter((day) => day.isCurrentMonth).reduce((total, day) => total + day.meetings.length, 0),
    [calendarDays]
  );
  const isViewingCurrentMonth = isSameMonth(calendarMonth, new Date());
  const activeFilterCount = (meetingFilters.locationType !== "ALL" ? 1 : 0) + (query.trim() ? 1 : 0);

  const meetingStats = useMemo(() => {
    const now = Date.now();
    const todayCount = filteredMeetings.filter((meeting) => calendarDateKey(meeting.startsAt) === todayDateKey).length;
    const upcomingCount = filteredMeetings.filter((meeting) => new Date(meeting.startsAt).getTime() >= now).length;
    const completedCount = filteredMeetings.filter((meeting) => new Date(meeting.endsAt).getTime() < now).length;
    return [
      {
        id: "all",
        label: "Visible meetings",
        value: filteredMeetings.length,
        detail: "After search and filters",
        badge: `${activeFilterCount || 0} filter${activeFilterCount === 1 ? "" : "s"}`,
        icon: CalendarDays,
        iconTone: "bg-[#e8efff] text-[#386df4]",
        cardTone: "bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_52%,#eef4ff_100%)]"
      },
      {
        id: "today",
        label: "Today",
        value: todayCount,
        detail: "Scheduled on your current day",
        badge: "Current day",
        icon: Calendar,
        iconTone: "bg-[#eaf8f0] text-[#18b46f]",
        cardTone: "bg-[linear-gradient(135deg,#ffffff_0%,#f8fdf9_52%,#edf9f1_100%)]"
      },
      {
        id: "upcoming",
        label: "Upcoming",
        value: upcomingCount,
        detail: "Still ahead on the calendar",
        badge: "Forward view",
        icon: Clock3,
        iconTone: "bg-[#fff3df] text-[#c57a10]",
        cardTone: "bg-[linear-gradient(135deg,#ffffff_0%,#fffaf2_52%,#fff3df_100%)]"
      },
      {
        id: "completed",
        label: "Completed",
        value: completedCount,
        detail: "Meetings already finished",
        badge: "History view",
        icon: Clock,
        iconTone: "bg-[#f3efff] text-[#6454d8]",
        cardTone: "bg-[linear-gradient(135deg,#ffffff_0%,#faf8ff_52%,#f3efff_100%)]"
      }
    ];
  }, [activeFilterCount, filteredMeetings, todayDateKey]);

  const filteredPages = useMemo(() => {
    const value = deferredPageQuery.trim().toLowerCase();
    return pages.filter((page) => `${page.title} ${page.slug} ${page.hostName}`.toLowerCase().includes(value));
  }, [deferredPageQuery, pages]);
  const activePagesCount = useMemo(() => pages.filter((page) => page.active).length, [pages]);
  const openNewMeetingModal = (date?: string) => {
    const defaultForm = emptyMeetingForm(preferences);
    setEditingMeetingId(null);
    setNewMeetingForm({
      ...defaultForm,
      date: date || defaultForm.date
    });
    setShowNewMeetingModal(true);
  };

  const openEditMeetingModal = (meeting: MeetingEventRecord) => {
    setEditingMeetingId(meeting.id);
    setNewMeetingForm(meetingFormFromRecord(meeting, localization));
    setShowNewMeetingModal(true);
  };

  const closeMeetingModal = () => {
    setShowNewMeetingModal(false);
    setEditingMeetingId(null);
    setNewMeetingForm(emptyMeetingForm(preferences));
  };

  const setCalendarMonthWithSelection = (next: Date) => {
    const normalized = startOfMonth(next);
    setCalendarMonth(normalized);
    setSelectedDateKey(calendarDateKey(normalized));
  };

  const resetMeetingFilters = () => {
    setQuery("");
    setMeetingFilters({ locationType: "ALL" });
  };

  const createMeeting = () => {
    startTransition(() => {
      void (async () => {
        setFeedback(null);

        try {
          const startsAt = combineMeetingDateTime(newMeetingForm.date, newMeetingForm.startTime, localization);
          const endsAt = combineMeetingDateTime(newMeetingForm.date, newMeetingForm.endTime, localization);
          if (new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
            setFeedback("Meeting end time must be after the start time.");
            return;
          }

          const linkInfo = meetingLinkRequirement(newMeetingForm.locationType, preferences);
          const meetingUrl = linkInfo.autoGenerated ? "" : normalizeMeetingUrl(newMeetingForm.meetingUrl);

          if (linkInfo.required && !isValidMeetingUrl(meetingUrl)) {
            setFeedback("Add a valid meeting link before creating this meeting.");
            return;
          }

          const meeting = await parseJson<MeetingEventRecord>(
            await fetch("/api/meetings/events", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                title: newMeetingForm.title,
                startsAt,
                endsAt,
                locationType: newMeetingForm.locationType,
                locationLabel: providerLabel(newMeetingForm.locationType),
                meetingUrl,
                recordMeeting: false,
                insightEnabled: false
              })
            })
          );

          setMeetings((current) => [meeting, ...current]);
          closeMeetingModal();
          setNewMeetingForm(emptyMeetingForm(preferences));
          setCalendarMonth(startOfMonth(new Date(meeting.startsAt)));
          setSelectedDateKey(calendarDateKey(meeting.startsAt));
          setFeedback("Meeting created.");
          setTab("all");
        } catch (error) {
          setFeedback(error instanceof Error ? error.message : "Unable to create meeting.");
        }
      })();
    });
  };

  const editMeeting = () => {
    if (!editingMeetingId) {
      return;
    }

    startTransition(() => {
      void (async () => {
        setFeedback(null);

        try {
          const startsAt = combineMeetingDateTime(newMeetingForm.date, newMeetingForm.startTime, localization);
          const endsAt = combineMeetingDateTime(newMeetingForm.date, newMeetingForm.endTime, localization);
          if (new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
            setFeedback("Meeting end time must be after the start time.");
            return;
          }

          const linkInfo = meetingLinkRequirement(newMeetingForm.locationType, preferences);
          const meetingUrl = linkInfo.autoGenerated ? "" : normalizeMeetingUrl(newMeetingForm.meetingUrl);

          if (linkInfo.required && !isValidMeetingUrl(meetingUrl)) {
            setFeedback("Add a valid meeting link before saving this meeting.");
            return;
          }

          const updated = await parseJson<MeetingEventRecord>(
            await fetch(`/api/meetings/events/${editingMeetingId}`, {
              method: "PATCH",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                title: newMeetingForm.title,
                startsAt,
                endsAt,
                locationType: newMeetingForm.locationType,
                locationLabel: providerLabel(newMeetingForm.locationType),
                meetingUrl
              })
            })
          );

          setMeetings((current) => current.map((meeting) => (meeting.id === updated.id ? updated : meeting)));
          setInsightMeeting((current) => (current?.id === updated.id ? updated : current));
          setCalendarMonth(startOfMonth(new Date(updated.startsAt)));
          setSelectedDateKey(calendarDateKey(updated.startsAt));
          closeMeetingModal();
          setFeedback("Meeting updated.");
        } catch (error) {
          setFeedback(error instanceof Error ? error.message : "Unable to update meeting.");
        }
      })();
    });
  };

  const updateMeeting = (meetingId: string, payload: Partial<MeetingEventRecord>, successMessage?: string) => {
    startTransition(() => {
      void (async () => {
        try {
          const updated = await parseJson<MeetingEventRecord>(
            await fetch(`/api/meetings/events/${meetingId}`, {
              method: "PATCH",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(payload)
            })
          );

          setMeetings((current) => current.map((meeting) => (meeting.id === updated.id ? updated : meeting)));
          setInsightMeeting((current) => (current?.id === updated.id ? updated : current));
          if (successMessage) {
            setFeedback(successMessage);
          }
        } catch (error) {
          setFeedback(error instanceof Error ? error.message : "Unable to update meeting.");
        }
      })();
    });
  };

  const deleteMeeting = (meeting: MeetingEventRecord) => {
    void (async () => {
      const confirmed = await requestConfirmation({
        title: "Delete meeting?",
        description: `"${meeting.title}" will move to recently deleted items.`,
        confirmLabel: "Delete",
        tone: "danger"
      });

      if (!confirmed) {
        return;
      }

      startTransition(() => {
        void (async () => {
          try {
            await parseJson<{ ok: true }>(
              await fetch(`/api/meetings/events/${meeting.id}`, {
                method: "DELETE"
              })
            );
            setMeetings((current) => current.filter((item) => item.id !== meeting.id));
            setInsightMeeting((current) => (current?.id === meeting.id ? null : current));
            setFeedback("Meeting deleted.");
          } catch (error) {
            setFeedback(error instanceof Error ? error.message : "Unable to delete meeting.");
          }
        })();
      });
    })();
  };

  const updatePreferences = (payload: Record<string, unknown>, successMessage?: string, onSuccess?: () => void) => {
    startTransition(() => {
      void (async () => {
        try {
          const updated = await parseJson<MeetingPreferenceRecord>(
            await fetch("/api/meetings/preferences", {
              method: "PATCH",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(payload)
            })
          );

          setPreferences(updated);
          setAvailability(parseAvailability(updated.weeklyAvailability));
          if (successMessage) {
            setFeedback(successMessage);
          }
          onSuccess?.();
        } catch (error) {
          setFeedback(error instanceof Error ? error.message : "Unable to update meeting preferences.");
        }
      })();
    });
  };

  const openNewPageModal = () => {
    setPageModal({ mode: "create", form: defaultSchedulingPageForm(preferences) });
  };

  const openEditPageModal = (page: SchedulingPageRecord) => {
    setPageModal({
      mode: "edit",
      targetId: page.id,
      form: {
        title: page.title,
        slug: page.slug,
        durationMinutes: page.durationMinutes,
        hostName: page.hostName,
        hostEmail: page.hostEmail
      }
    });
  };

  const openDuplicatePageModal = (page: SchedulingPageRecord) => {
    setPageModal({
      mode: "create",
      form: {
        title: `${page.title} Copy`,
        slug: `${page.slug}-copy`,
        durationMinutes: page.durationMinutes,
        hostName: page.hostName,
        hostEmail: page.hostEmail
      }
    });
  };

  const savePageModal = () => {
    if (!pageModal) return;
    void (async () => {
      setPageModalBusy(true);
      try {
        if (pageModal.mode === "create") {
          const page = await parseJson<SchedulingPageRecord>(
            await fetch("/api/meetings/pages", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                title: pageModal.form.title,
                slug: pageModal.form.slug,
                durationMinutes: pageModal.form.durationMinutes,
                hostName: pageModal.form.hostName,
                hostEmail: pageModal.form.hostEmail,
                hostType: "Single host",
                active: true
              })
            })
          );
          setPages((current) => [...current, page]);
          setFeedback(`"${page.title}" created.`);
        } else {
          const page = await parseJson<SchedulingPageRecord>(
            await fetch(`/api/meetings/pages/${pageModal.targetId}`, {
              method: "PATCH",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                title: pageModal.form.title,
                slug: pageModal.form.slug,
                durationMinutes: pageModal.form.durationMinutes,
                hostName: pageModal.form.hostName,
                hostEmail: pageModal.form.hostEmail
              })
            })
          );
          setPages((current) => current.map((item) => (item.id === page.id ? page : item)));
          setFeedback(`"${page.title}" updated.`);
        }
        setPageModal(null);
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to save meeting type.");
      } finally {
        setPageModalBusy(false);
      }
    })();
  };

  const deleteSchedulingPage = (page: SchedulingPageRecord) => {
    void (async () => {
      const confirmed = await requestConfirmation({
        title: "Delete booking link?",
        description: `"${page.title}" will move to recently deleted items.`,
        confirmLabel: "Delete",
        tone: "danger"
      });

      if (!confirmed) {
        return;
      }

      startTransition(() => {
        void (async () => {
          try {
            await parseJson<{ ok: true }>(
              await fetch(`/api/meetings/pages/${page.id}`, {
                method: "DELETE"
              })
            );
            setPages((current) => current.filter((item) => item.id !== page.id));
            setFeedback("Booking link deleted.");
          } catch (error) {
            setFeedback(error instanceof Error ? error.message : "Unable to delete booking link.");
          }
        })();
      });
    })();
  };

  const toggleSchedulingPage = (page: SchedulingPageRecord) => {
    startTransition(() => {
      void (async () => {
        try {
          const updated = await parseJson<SchedulingPageRecord>(
            await fetch(`/api/meetings/pages/${page.id}`, {
              method: "PATCH",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ active: !page.active })
            })
          );

          setPages((current) => current.map((item) => (item.id === updated.id ? updated : item)));
          setFeedback(`${updated.title} ${updated.active ? "enabled" : "disabled"}.`);
        } catch (error) {
          setFeedback(error instanceof Error ? error.message : "Unable to update scheduling page.");
        }
      })();
    });
  };

  const copyLink = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setFeedback(`${label} copied.`);
    } catch {
      setFeedback(`Unable to copy ${label.toLowerCase()}.`);
    }
  };

  const openLink = (value: string) => {
    window.open(value, "_blank", "noopener,noreferrer");
  };

  const providerOptions = [
    {
      type: "GOOGLE_MEET" as MeetingLocationType,
      connected: preferences.googleMeetConnected,
      subtitle: preferences.googleMeetConnected
        ? `Connected for ${preferences.profileEmail}. Bookings create a real Calendar event with a Meet link.`
        : googleCalendarConfigured
          ? "Connect Google Calendar to generate real Meet links for manual meetings and public bookings."
          : "Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET before connecting Google Calendar.",
      actionLabel: preferences.googleMeetConnected ? "Disconnect" : "Connect Google",
      disabled: !googleCalendarConfigured
    },
    {
      type: "ZOOM" as MeetingLocationType,
      connected: false,
      subtitle: "Zoom booking automation is not wired in this workspace yet.",
      actionLabel: "Coming soon",
      disabled: true
    },
    {
      type: "MICROSOFT_TEAMS" as MeetingLocationType,
      connected: false,
      subtitle: "Microsoft Teams booking automation is not wired in this workspace yet.",
      actionLabel: "Coming soon",
      disabled: true
    }
  ];
  const customLinkValue = preferences.customLink || "";
  const customLinkReady = isValidMeetingUrl(customLinkValue);
  const bookingTimeZoneLabel = formatTimeZoneLabel(localization);
  const hasInvalidAvailabilityRange = availability.some((slot) => slot.enabled && timeLabelToMinutes(slot.end) <= timeLabelToMinutes(slot.start));

  const saveCustomLinkAsDefault = () => {
    const customLink = normalizeMeetingUrl(customLinkValue);

    if (!isValidMeetingUrl(customLink)) {
      setFeedback("Add a valid custom meeting link first.");
      return;
    }

    updatePreferences(
      { customLink, defaultLocationType: "CUSTOM_LINK" },
      "Custom link saved."
    );
  };

  const saveMeetingPreferences = () => {
    if (hasInvalidAvailabilityRange) {
      setFeedback("Fix availability times before saving. End time must be after start time.");
      return;
    }

    if (preferences.defaultLocationType === "CUSTOM_LINK" && !customLinkReady) {
      setFeedback("Add a valid custom meeting link before saving.");
      return;
    }

    updatePreferences(
      {
        profileName: preferences.profileName,
        profileEmail: preferences.profileEmail,
        personalMeetingSlug: preferences.personalMeetingSlug,
        timezoneLabel: bookingTimeZoneLabel,
        zoomConnected: preferences.zoomConnected,
        microsoftTeamsConnected: preferences.microsoftTeamsConnected,
        customLink: preferences.customLink,
        defaultLocationType: preferences.defaultLocationType,
        weeklyAvailability: availability,
        bufferBeforeEnabled: preferences.bufferBeforeEnabled,
        bufferBeforeMinutes: preferences.bufferBeforeMinutes,
        bufferAfterEnabled: preferences.bufferAfterEnabled,
        bufferAfterMinutes: preferences.bufferAfterMinutes,
        minNoticeValue: preferences.minNoticeValue,
        minNoticeUnit: preferences.minNoticeUnit
      },
      "Meeting preferences updated.",
      () => setAvailabilityMode("overview")
    );
  };

  const connectGoogleCalendar = () => {
    if (!googleCalendarConfigured) {
      setFeedback("Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET before connecting Google Calendar.");
      return;
    }

    window.location.assign("/api/meetings/google/connect");
  };

  const disconnectGoogleCalendar = () => {
    void (async () => {
      const confirmed = await requestConfirmation({
        title: "Disconnect Google Calendar?",
        description: "Google Meet booking and synced scheduling will stop until you reconnect your calendar.",
        confirmLabel: "Disconnect",
        tone: "warning"
      });
      if (!confirmed) {
        return;
      }

      startTransition(() => {
        void (async () => {
          try {
            await parseJson<{ ok: true }>(
              await fetch("/api/meetings/google/disconnect", {
                method: "POST"
              })
            );

            setPreferences((current) => ({ ...current, googleMeetConnected: false }));
            if (preferences.defaultLocationType === "GOOGLE_MEET") {
              setFeedback("Google Calendar disconnected. Switch the default location or reconnect Google before taking bookings.");
            } else {
              setFeedback("Google Calendar disconnected.");
            }
          } catch (error) {
            setFeedback(error instanceof Error ? error.message : "Unable to disconnect Google Calendar.");
          }
        })();
      });
    })();
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-4">
        <h1 className="text-[1.85rem] font-semibold tracking-tight text-slate-900">Meetings</h1>
        <div className="flex items-center gap-3">
          {feedback ? <FeedbackToast message={feedback} position="inline" className="max-w-[min(36rem,calc(100vw-12rem))]" /> : null}
          {tab === "availability" && availabilityMode === "overview" ? (
            <button
              onClick={() => setAvailabilityMode("setup")}
              className="crm-btn crm-btn-secondary"
            >
              Edit availability
            </button>
          ) : null}
          <button
            onClick={() => openNewMeetingModal()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#386df4] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2d5de0]"
          >
            <Plus className="h-4 w-4" />
            New meeting
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-8 border-b border-slate-200 px-2">
        {[
          { id: "all", label: "All meetings" },
          { id: "pages", label: "Booking links" },
          { id: "availability", label: "Booking setup" }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id as "all" | "pages" | "availability")}
            className={`border-b-2 px-2 py-3 text-[1.02rem] font-medium ${
              tab === item.id ? "border-[#386df4] text-[#386df4]" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {tab === "all" ? (
        <div>
          <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {meetingStats.map((stat) => {
              const Icon = stat.icon;

              return (
                <Card key={stat.id} className={`overflow-hidden rounded-2xl border-slate-200/80 p-0 ${stat.cardTone}`}>
                  <div className="flex items-start justify-between px-5 pt-5">
                    <div>
                      <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                      <div className="mt-4 flex items-end gap-3">
                        <h3 className="text-[2.1rem] font-semibold tracking-tight text-slate-900">{stat.value}</h3>
                        <span className="mb-1 rounded-full bg-white/85 px-2.5 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200/80">
                          {stat.badge}
                        </span>
                      </div>
                    </div>
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${stat.iconTone}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="px-5 pb-5 pt-4">
                    <p className="text-sm text-slate-400">{stat.detail}</p>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[220px] max-w-[360px] flex-1 lg:flex-none">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input ref={meetingsSearchInputRef} className={`${inputClassName} pl-9 pr-14`} placeholder="Search meetings or hosts" value={query} onChange={(event) => setQuery(event.target.value)} />
                <SearchHotkeyButton inputRef={meetingsSearchInputRef} />
              </div>
              <div className="inline-flex h-[2.25rem] items-center overflow-hidden rounded-[0.55rem] border border-slate-200 bg-white">
                <div className="inline-flex h-full items-center gap-1.5 border-r border-slate-200 px-3 text-[0.8125rem] font-medium text-slate-700">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filter
                </div>
                <AppSelect
                  className="h-full min-w-[150px] border-0 bg-white px-3 pr-8 text-[0.8125rem] font-medium text-slate-700 outline-none"
                  value={meetingFilters.locationType}
                  onChange={(event) => setMeetingFilters((current) => ({ ...current, locationType: event.target.value as MeetingFilters["locationType"] }))}
                  options={locationTypeFilterOptions}
                  hideMenuIcons
                />
              </div>
              {activeFilterCount ? (
                <button
                  onClick={resetMeetingFilters}
                  className="crm-btn crm-btn-secondary"
                >
                  Clear
                </button>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex h-[2.25rem] items-center rounded-[0.7rem] border border-slate-200 bg-slate-50 p-[3px]">
                {[
                  { id: "list" as const, label: "List", icon: LayoutList },
                  { id: "calendar" as const, label: "Calendar", icon: CalendarDays }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setMeetingView(item.id)}
                    className={`relative inline-flex h-full items-center justify-center gap-1.5 rounded-[0.45rem] px-3 text-[0.8125rem] font-medium transition-colors ${
                      meetingView === item.id
                        ? "bg-[#eef4ff] text-[#386df4] shadow-[0_1px_2px_rgba(56,109,244,0.08)] ring-1 ring-[#386df4]/20"
                        : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-700"
                    }`}
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setSortMode((value) => (value === "asc" ? "desc" : "asc"))}
                className="crm-btn crm-btn-secondary h-[2.25rem] px-[0.95rem] text-[0.8125rem]"
              >
                <CalendarDays className="h-3.5 w-3.5" />
                {sortMode === "asc" ? "Oldest first" : "Newest first"}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {meetingView === "list" ? (
            <Card className="overflow-hidden p-0">
              <div className="w-full overflow-x-auto">
                <table className="min-w-[900px] w-full border-separate border-spacing-0 overflow-hidden rounded-2xl border border-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr className="[&>th]:border-b [&>th]:border-slate-200/80">
                      <th className="border-r border-slate-200/80 px-3 py-4 font-medium">Title</th>
                      <th className="border-r border-slate-200/80 px-3 py-4 font-medium">Date</th>
                      <th className="border-r border-slate-200/80 px-3 py-4 font-medium">Time</th>
                      <th className="border-r border-slate-200/80 px-3 py-4 font-medium">Location</th>
                      <th className="px-3 py-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="[&>tr:not(:last-child)>td]:border-b [&>tr:not(:last-child)>td]:border-slate-200/80">
                    {paginatedMeetings.items.map((meeting) => (
                      <tr key={meeting.id} className="text-slate-700 transition hover:bg-slate-50/70">
                        <td className="border-r border-slate-200/80 px-3 py-4">
                          <div className="font-medium text-slate-900">{meeting.title}</div>
                          <div className="mt-1 text-xs text-slate-500">{meeting.hostName}</div>
                        </td>
                        <td className="border-r border-slate-200/80 px-3 py-4">{formatMeetingDate(meeting.startsAt, localization)}</td>
                        <td className="border-r border-slate-200/80 px-3 py-4">{formatMeetingTime(meeting.startsAt, meeting.endsAt, localization)}</td>
                        <td className="border-r border-slate-200/80 px-3 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`flex h-6 min-w-6 items-center justify-center rounded-md ${providerTone(meeting.locationType)}`}>
                              <MeetingProviderLogo provider={meeting.locationType} iconClassName="h-3.5 w-3.5" />
                            </span>
                            {meeting.meetingUrl ? (
                              <a href={meeting.meetingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-[#386df4] hover:text-[#2d5de0]">
                                Join
                                <ArrowUpRight className="h-3.5 w-3.5" />
                              </a>
                            ) : (
                              <span className="text-sm text-slate-400">No link</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex items-center gap-2">
                            <button type="button" aria-label={`Edit ${meeting.title}`} onClick={() => openEditMeetingModal(meeting)} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button type="button" aria-label={`Open insights for ${meeting.title}`} onClick={() => setInsightMeeting(meeting)} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50">
                              <Sparkles className="h-4 w-4" />
                            </button>
                            <button type="button" aria-label={`Delete ${meeting.title}`} onClick={() => deleteMeeting(meeting)} className="rounded-lg border border-red-100 bg-white p-2 text-red-500 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!paginatedMeetings.items.length ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-6">
                          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#386df4]">
                              <CalendarDays className="h-6 w-6" />
                            </div>
                            <div className="mt-4 text-[1.1rem] font-semibold text-slate-900">No meetings found</div>
                            <div className="mt-2 text-sm text-slate-500">No meetings match the current search and filters.</div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              <PaginationControls
                currentPage={paginatedMeetings.safePage}
                pageSize={pageSize}
                pageSizeOptions={[10, 20, 30]}
                totalItems={filteredMeetings.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={(value) => {
                  setPageSize(value);
                  setCurrentPage(1);
                }}
              />
            </Card>
          ) : (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_380px]">
              <Card className="overflow-hidden rounded-2xl border-slate-200/80 p-0">
                <div className="border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-4 py-4 sm:px-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="text-[1.25rem] font-semibold text-slate-900">{calendarMonthLabel(calendarMonth, localization)}</div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
                          {selectedMonthMeetingCount} scheduled this month
                        </span>
                        <span className="inline-flex items-center rounded-full bg-[#eef4ff] px-2.5 py-1 text-[11px] font-semibold text-[#386df4]">
                          {selectedDayMeetings.length} on selected day
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setCalendarMonthWithSelection(subMonths(calendarMonth, 1))}
                        className="crm-btn crm-btn-secondary inline-flex h-8.5 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </button>
                      <button
                        onClick={() => {
                          setCalendarMonth(startOfMonth(new Date()));
                          setSelectedDateKey(todayDateKey);
                        }}
                        className={`crm-btn crm-btn-secondary inline-flex h-8.5 items-center gap-1.5 rounded-lg border px-3 text-[13px] font-medium transition ${
                          isViewingCurrentMonth
                            ? "border-[#c8d8ff] bg-[#eef4ff] text-[#386df4]"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span>Today</span>
                        <span className="hidden text-[11px] font-medium text-current/70 sm:inline">{format(new Date(), "MMM d")}</span>
                      </button>
                      <button
                        onClick={() => setCalendarMonthWithSelection(addMonths(calendarMonth, 1))}
                        className="crm-btn crm-btn-secondary inline-flex h-8.5 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <div className="min-w-[720px]">
                    <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/90">
                      {calendarWeekdays.map((day) => (
                        <div key={day.key} className="px-2 py-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 sm:px-3">
                          {day.label}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 auto-rows-[100px] bg-slate-100/45 sm:auto-rows-[108px] xl:auto-rows-[117px]">
                      {calendarDays.map((day) => {
                        const isSelected = day.key === selectedDateKey;
                        const isToday = day.key === todayDateKey;

                        return (
                          <button
                            key={day.key}
                            type="button"
                            onClick={() => {
                              setSelectedDateKey(day.key);
                              if (!day.isCurrentMonth) {
                                setCalendarMonth(startOfMonth(day.date));
                              }
                            }}
                            className={`h-full border-r border-b border-slate-200 p-2.5 text-left transition last:border-r-0 sm:p-3 ${
                              day.isCurrentMonth ? "bg-white hover:bg-slate-50" : "bg-slate-50/80 text-slate-400 hover:bg-slate-100/70"
                            } ${isSelected ? "bg-[#f4f8ff] shadow-[inset_0_0_0_1px_rgba(56,109,244,0.16)]" : ""}`}
                          >
                        <div className="mb-2.5 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-medium sm:h-8 sm:w-8 sm:text-[13px] ${
                                isSelected ? "bg-[#386df4] text-white shadow-[0_8px_18px_rgba(56,109,244,0.24)]" : isToday ? "bg-slate-900 text-white" : "text-slate-700"
                              }`}
                            >
                              {format(day.date, "d")}
                            </span>
                            {isToday && !isSelected ? <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">Today</span> : null}
                          </div>
                          {day.meetings.length ? (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                              {day.meetings.length}
                            </span>
                          ) : null}
                        </div>

                        <div className="space-y-1.5">
                          {day.meetings.length ? (
                            day.meetings.slice(0, 3).map((meeting) => (
                              <div
                                key={meeting.id}
                                className={`rounded-lg border px-2 py-1.5 shadow-[0_6px_16px_rgba(15,23,42,0.04)] ${providerCalendarChipTone(meeting.locationType)}`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="text-[9px] font-medium uppercase tracking-[0.12em] text-current/80">
                                    {formatMeetingTime(meeting.startsAt, meeting.endsAt, localization).split(" - ")[0]}
                                  </div>
                                  <span className="inline-flex items-center rounded-full bg-white/90 px-1.5 py-0.5 ring-1 ring-black/5">
                                    <MeetingProviderLogo provider={meeting.locationType} iconClassName="h-3 w-3" />
                                  </span>
                                </div>
                                <div className="mt-1 line-clamp-2 text-[12px] font-medium leading-4 text-slate-800">{meeting.title}</div>
                              </div>
                            ))
                          ) : null}
                          {day.meetings.length > 3 ? (
                            <div className="px-1 text-[10px] font-medium text-slate-500">+{day.meetings.length - 3} more</div>
                          ) : null}
                        </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="sticky top-5 self-start overflow-hidden rounded-2xl border-slate-200/80 p-0">
                <div className="border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-4 py-4 sm:px-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        {selectedDateIsToday ? <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold text-[#386df4]">Today</span> : null}
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                          {selectedDayMeetings.length} scheduled
                        </span>
                      </div>
                      <div className="text-[1.2rem] font-semibold text-slate-900">{selectedDateLabel}</div>
                      <div className="mt-1 text-sm text-slate-500">Meetings scheduled for this date</div>
                    </div>
                    <button
                      onClick={() => openNewMeetingModal(selectedDateKey)}
                      className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#386df4] px-3.5 text-sm font-medium text-white hover:bg-[#2d5de0]"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </button>
                  </div>
                </div>

                <div className="max-h-[640px] overflow-y-auto">
                  {selectedDayMeetings.length ? (
                    selectedDayMeetings.map((meeting) => (
                      <div key={meeting.id} className="border-b border-slate-200 px-4 py-4 last:border-b-0 sm:px-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-700">
                              {hostInitials(meeting.hostName)}
                            </div>
                            <div className="min-w-0">
                              <div className="truncate text-[1.02rem] font-semibold text-slate-900">{meeting.title}</div>
                              <div className="mt-2 inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                {formatMeetingTime(meeting.startsAt, meeting.endsAt, localization)}
                              </div>
                              <div className="mt-2 text-sm text-slate-500">{providerLabel(meeting.locationType)} • Hosted by {meeting.hostName}</div>
                            </div>
                          </div>
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${providerCalendarChipTone(meeting.locationType)}`}>
                            <MeetingProviderLogo provider={meeting.locationType} iconClassName="h-3.5 w-3.5" />
                            {providerLabel(meeting.locationType)}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          {meeting.meetingUrl ? (
                            <a
                              href={meeting.meetingUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="crm-btn crm-btn-secondary inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                              Join meeting
                              <ArrowUpRight className="h-4 w-4" />
                            </a>
                          ) : null}
                          <button type="button" onClick={() => openEditMeetingModal(meeting)} className="crm-btn crm-btn-secondary inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            <Pencil className="h-4 w-4" />
                            Edit
                          </button>
                          <button type="button" onClick={() => setInsightMeeting(meeting)} className="crm-btn crm-btn-secondary inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            <Sparkles className="h-4 w-4" />
                            Insight
                          </button>
                          <button type="button" onClick={() => deleteMeeting(meeting)} className="inline-flex items-center gap-2 rounded-lg border border-red-100 bg-white px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-5 py-12 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-[#eef4ff] text-[#386df4]">
                        <CalendarDays className="h-6 w-6" />
                      </div>
                      <div className="mt-4 text-[1.05rem] font-semibold text-slate-900">Nothing booked for this day</div>
                      <div className="mt-2 text-sm text-slate-500">Pick another date or add a meeting directly from the calendar.</div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      ) : null}

      {tab === "pages" ? (
        <div>
          <Card className="mb-5 overflow-hidden rounded-2xl p-0">
            <div className="border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-5 py-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,#f0f5ff,#dbe8ff)] text-sm font-semibold text-[#386df4]">
                    {hostInitials(preferences.profileName)}
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#386df4]">Personal booking link</div>
                    <div className="mt-2 text-[1.4rem] font-semibold text-slate-900">{preferences.profileName}</div>
                    <div className="mt-2 break-all text-sm font-medium text-slate-700">{`${meetingBaseUrl}/${preferences.personalMeetingSlug}`}</div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyLink(`${meetingBaseUrl}/${preferences.personalMeetingSlug}`, "Personal meeting link")}
                    className="crm-btn crm-btn-secondary"
                  >
                    <Copy className="h-4 w-4" />
                    Copy link
                  </button>
                  <button
                    type="button"
                    onClick={() => openLink(`${meetingBaseUrl}/${preferences.personalMeetingSlug}`)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#386df4] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2d5de0]"
                  >
                    Open page
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#eef4ff] px-3 py-1.5 text-sm font-medium text-[#386df4]">{activePagesCount} active meeting types</span>
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">{bookingTimeZoneLabel}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">{providerLabel(preferences.defaultLocationType)} default</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-[1.15rem] font-semibold text-slate-900">Meeting types</h2>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <button type="button" onClick={openNewPageModal} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#386df4] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2d5de0]">
                  <Plus className="h-4 w-4" />
                  New type
                </button>
                <div className="relative min-w-[260px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input ref={meetingTypesSearchInputRef} className={`${inputClassName} pl-9 pr-14`} placeholder="Search meeting types" value={pageQuery} onChange={(event) => setPageQuery(event.target.value)} />
                  <SearchHotkeyButton inputRef={meetingTypesSearchInputRef} />
                </div>
              </div>
            </div>
          </Card>

          <Card className="mb-5 overflow-hidden rounded-2xl p-0">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-[1.15rem] font-semibold text-slate-900">Default availability</h2>
                <div className="mt-1 text-sm text-slate-500">These hours control what people see on your public booking links.</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTab("availability");
                  setAvailabilityMode("setup");
                }}
                className="crm-btn crm-btn-secondary"
              >
                Edit availability
              </button>
            </div>
            <div className="grid gap-3 px-5 py-4 md:grid-cols-2 xl:grid-cols-4">
              {availability.map((slot) => (
                <div key={slot.day} className={`rounded-xl border px-4 py-3 ${slot.enabled ? "border-slate-200 bg-white" : "border-slate-200 bg-slate-50"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-slate-900">{slot.day}</div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${slot.enabled ? "bg-[#eefbf5] text-[#1fa261]" : "bg-slate-100 text-slate-500"}`}>
                      {slot.enabled ? "Open" : "Closed"}
                    </span>
                  </div>
                  <div className={`mt-2 text-sm ${slot.enabled ? "text-slate-600" : "text-slate-400"}`}>
                    {slot.enabled ? `${slot.start} - ${slot.end}` : "Not bookable"}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="overflow-hidden rounded-2xl p-0">
            {filteredPages.length ? (
              filteredPages.map((page, index) => (
                <div key={page.id} className={`flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between ${index === 0 ? "" : "border-t border-slate-200"}`}>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-[1.05rem] font-semibold text-slate-900">{page.title}</div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${page.active ? "bg-[#eefbf5] text-[#1fa261]" : "bg-slate-100 text-slate-500"}`}>
                        {page.active ? "Active" : "Hidden"}
                      </span>
                    </div>
                    <div className="mt-2 break-all text-sm text-slate-500">{`${meetingBaseUrl}/${page.slug}`}</div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{formatDuration(page.durationMinutes)}</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{page.hostType}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => openLink(`${meetingBaseUrl}/${page.slug}`)}
                      className="crm-btn crm-btn-secondary"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => copyLink(`${meetingBaseUrl}/${page.slug}`, `${page.title} link`)}
                      className="crm-btn crm-btn-secondary"
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </button>
                    <button
                      onClick={() => openEditPageModal(page)}
                      className="crm-btn crm-btn-secondary"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => openDuplicatePageModal(page)}
                      className="crm-btn crm-btn-secondary"
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSchedulingPage(page)}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-white px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                    <button
                      onClick={() => toggleSchedulingPage(page)}
                      className={`rounded-xl px-4 py-2.5 text-sm font-medium ${
                        page.active ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-[#386df4] text-white hover:bg-[#2d5de0]"
                      }`}
                    >
                      {page.active ? "Hide" : "Enable"}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center m-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#386df4]">
                  <Link2 className="h-6 w-6" />
                </div>
                <div className="mt-4 text-[1.1rem] font-semibold text-slate-900">No meeting types found</div>
                <div className="mt-2 text-sm text-slate-500">No meeting types match the current search.</div>
              </div>
            )}
          </Card>
        </div>
      ) : null}

      {tab === "availability" ? (
        <div className={availabilityMode === "setup" ? "mx-auto max-w-[1040px]" : ""}>
          {availabilityMode === "overview" ? (
            <div className="space-y-6">
              <Card className="p-0">
                <div className="border-b border-slate-200 px-6 py-5 text-[1.2rem] font-semibold text-slate-900">{preferences.profileName}</div>
                <div className="flex items-center justify-between gap-4 px-6 py-6">
                  <div>
                    <div className="text-[1.02rem] text-slate-500">Associate email address</div>
                    <div className="mt-1 text-[1.08rem] font-semibold text-slate-900">{preferences.profileEmail}</div>
                  </div>
                  {preferences.googleMeetConnected ? (
                    <button
                      onClick={disconnectGoogleCalendar}
                      className="crm-btn crm-btn-secondary"
                    >
                      Disconnect Google
                    </button>
                  ) : (
                    <button
                      onClick={connectGoogleCalendar}
                      disabled={!googleCalendarConfigured}
                      className="crm-btn crm-btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Connect Google
                    </button>
                  )}
                </div>
              </Card>

              <Card className="p-0">
                <div className="border-b border-slate-200 px-6 py-5 text-[1.2rem] font-semibold text-slate-900">Your personal Relix meeting</div>
                <div className="px-6 py-6">
                  <div className="flex overflow-hidden rounded-xl border border-slate-200">
                    <div className="flex items-center bg-[#f8fafc] px-4 text-sm text-slate-300">{`${meetingBaseUrl}/`}</div>
                    <input
                      className="w-full px-4 py-3 text-sm text-slate-800 outline-none"
                      value={preferences.personalMeetingSlug}
                      onChange={(event) => setPreferences((current) => ({ ...current, personalMeetingSlug: event.target.value }))}
                      onBlur={() =>
                        updatePreferences(
                          { personalMeetingSlug: preferences.personalMeetingSlug },
                          "Personal meeting link updated."
                        )
                      }
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-0">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                  <div className="text-[1.2rem] font-semibold text-slate-900">Meeting location</div>
                  <button
                    onClick={() => setAvailabilityMode("setup")}
                    className="crm-btn crm-btn-secondary"
                  >
                    Configure
                  </button>
                </div>
                <div className="space-y-6 px-6 py-6">
                  {providerOptions.map((item) => (
                    <div key={item.type} className="flex items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${providerTone(item.type)}`}>
                          <MeetingProviderLogo provider={item.type} iconClassName="h-5 w-5" />
                        </span>
                        <div>
                          <div className="text-[1.15rem] font-semibold text-slate-900">{providerLabel(item.type)}</div>
                          <div className="mt-1 max-w-[620px] text-sm leading-6 text-slate-500">{item.subtitle}</div>
                        </div>
                      </div>
                      {preferences.defaultLocationType === item.type && item.connected ? (
                        <span className="rounded-full bg-[#eef4ff] px-3 py-1.5 text-sm text-[#386df4]">Default</span>
                      ) : (
                        <button
                          onClick={() => (item.type === "GOOGLE_MEET" ? (item.connected ? disconnectGoogleCalendar() : connectGoogleCalendar()) : null)}
                          disabled={item.disabled}
                          className={`rounded-xl px-4 py-2.5 text-sm font-medium ${
                            item.disabled ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400" : "bg-[#386df4] text-white hover:bg-[#2d5de0]"
                          }`}
                        >
                          {item.actionLabel}
                        </button>
                      )}
                    </div>
                  ))}

                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-1 items-start gap-4">
                      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${providerTone("CUSTOM_LINK")}`}>
                        <MeetingProviderLogo provider="CUSTOM_LINK" iconClassName="h-4.5 w-4.5" />
                      </span>
                      <div className="w-full">
                        <div className="text-[1.15rem] font-semibold text-slate-900">Custom link</div>
                        <input
                          className={`mt-3 ${inputClassName} w-full min-w-0 md:min-w-[520px] ${customLinkValue.trim() && !customLinkReady ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
                          placeholder="Paste a meeting URL"
                          value={preferences.customLink || ""}
                          onChange={(event) => setPreferences((current) => ({ ...current, customLink: event.target.value }))}
                        />
                        <div className={`mt-2 text-xs leading-5 ${customLinkValue.trim() && !customLinkReady ? "text-red-500" : "text-slate-500"}`}>
                          {customLinkValue.trim() && !customLinkReady
                            ? "Enter a valid URL."
                            : "Use this for any existing Meet, Zoom, Teams, or external room link."}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={saveCustomLinkAsDefault}
                      disabled={!customLinkReady}
                      className="rounded-xl bg-[#386df4] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Save link
                    </button>
                  </div>
                </div>
              </Card>

            </div>
          ) : (
            <>
              <div className="mb-6">
                <div>
                  <h2 className="text-[2rem] font-semibold text-slate-900">Set up your meeting preferences</h2>
                  <p className="mt-2 text-[1.12rem] text-slate-500">Manage your availability and make it easy for your contacts to schedule time with you.</p>
                </div>
              </div>

              <Card className="mb-4 overflow-hidden p-0">
                <div className="border-b border-slate-200 px-6 py-4 text-[1.08rem] font-semibold text-slate-900">Your personal Relix meeting link</div>
                <div className="px-6 py-4">
                  <div className="flex overflow-hidden rounded-xl border border-slate-200">
                    <div className="flex items-center bg-[#f8fafc] px-4 text-sm text-slate-300">{`${meetingBaseUrl}/`}</div>
                    <input
                      className="w-full px-4 py-3 text-sm outline-none"
                      value={preferences.personalMeetingSlug}
                      onChange={(event) => setPreferences((current) => ({ ...current, personalMeetingSlug: event.target.value }))}
                    />
                  </div>
                </div>
              </Card>

              <Card className="mb-4 overflow-hidden p-0">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                  <div className="text-[1.08rem] font-semibold text-slate-900">Set your default availability</div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">Current time zone</span>
                    <span className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-700">
                      {bookingTimeZoneLabel}
                    </span>
                  </div>
                </div>

                <div className="px-6 py-4">
                  <div className="space-y-4">
                    {availability.map((slot, index) => (
                      <div key={slot.day} className="grid items-center gap-4 md:grid-cols-[280px_1fr_20px_1fr_48px]">
                        <label className="flex items-center gap-4 text-[1.05rem] text-slate-800">
                          <input
                            type="checkbox"
                            checked={slot.enabled}
                            onChange={(event) =>
                              setAvailability((current) =>
                                current.map((item, itemIndex) => (itemIndex === index ? { ...item, enabled: event.target.checked } : item))
                              )
                            }
                            className="h-4 w-4 rounded border-slate-300 accent-[#386df4]"
                          />
                          {slot.day}
                        </label>

                        <AppSelect
                          className={`${inputClassName} ${slot.enabled ? "" : "bg-slate-50 text-slate-300"}`}
                          value={slot.start}
                          disabled={!slot.enabled}
                          onChange={(event) =>
                            setAvailability((current) =>
                              current.map((item, itemIndex) => (itemIndex === index ? { ...item, start: event.target.value } : item))
                            )
                          }
                        >
                          {timeOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </AppSelect>

                        <span className="text-center text-slate-600">to</span>

                        <AppSelect
                          className={`${inputClassName} ${slot.enabled ? "" : "bg-slate-50 text-slate-300"}`}
                          value={slot.end}
                          disabled={!slot.enabled}
                          onChange={(event) =>
                            setAvailability((current) =>
                              current.map((item, itemIndex) => (itemIndex === index ? { ...item, end: event.target.value } : item))
                            )
                          }
                        >
                          {timeOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </AppSelect>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            aria-label={`Copy ${slot.day} hours to ${availability[index + 1]?.day || "next day"}`}
                            disabled={index >= availability.length - 1}
                            onClick={() =>
                              setAvailability((current) =>
                                current.map((item, itemIndex) =>
                                  itemIndex === index + 1
                                    ? { ...item, enabled: slot.enabled, start: slot.start, end: slot.end }
                                    : item
                                )
                              )
                            }
                            className="rounded-xl border border-slate-200 bg-white p-3 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-200 px-6 py-4">
                  <div className="text-[1.02rem] font-medium text-slate-900">Want to add time before or after your events?</div>
                  <div className="mt-4 space-y-3">
                    <label className="flex items-center gap-4">
                      <input type="checkbox" checked={preferences.bufferBeforeEnabled} onChange={(event) => setPreferences((current) => ({ ...current, bufferBeforeEnabled: event.target.checked }))} className="h-4 w-4 rounded border-slate-300 accent-[#386df4]" />
                      <span className="w-20 text-[1.05rem] text-slate-800">Before</span>
                      <AppSelect
                        className={`${inputClassName} max-w-[140px] ${preferences.bufferBeforeEnabled ? "" : "bg-slate-50 text-slate-300"}`}
                        disabled={!preferences.bufferBeforeEnabled}
                        value={String(preferences.bufferBeforeMinutes)}
                        onChange={(event) => setPreferences((current) => ({ ...current, bufferBeforeMinutes: Number(event.target.value) }))}
                      >
                        {[15, 30, 45, 60].map((option) => (
                          <option key={option} value={option}>
                            {option} min
                          </option>
                        ))}
                      </AppSelect>
                    </label>
                    <label className="flex items-center gap-4">
                      <input type="checkbox" checked={preferences.bufferAfterEnabled} onChange={(event) => setPreferences((current) => ({ ...current, bufferAfterEnabled: event.target.checked }))} className="h-4 w-4 rounded border-slate-300 accent-[#386df4]" />
                      <span className="w-20 text-[1.05rem] text-slate-800">After</span>
                      <AppSelect
                        className={`${inputClassName} max-w-[140px] ${preferences.bufferAfterEnabled ? "" : "bg-slate-50 text-slate-300"}`}
                        disabled={!preferences.bufferAfterEnabled}
                        value={String(preferences.bufferAfterMinutes)}
                        onChange={(event) => setPreferences((current) => ({ ...current, bufferAfterMinutes: Number(event.target.value) }))}
                      >
                        {[15, 30, 45, 60].map((option) => (
                          <option key={option} value={option}>
                            {option} min
                          </option>
                        ))}
                      </AppSelect>
                    </label>
                  </div>
                </div>

                <div className="border-t border-slate-200 px-6 py-4">
                  <div className="grid gap-4 md:grid-cols-[220px_minmax(260px,1fr)_auto] md:items-center">
                    <div className="text-[1.05rem] text-slate-800">Minimum schedule notice</div>
                    <div className="flex items-center gap-2">
                      <input
                        className={`${inputClassName} max-w-[110px]`}
                        value={String(preferences.minNoticeValue)}
                        onChange={(event) => setPreferences((current) => ({ ...current, minNoticeValue: Number(event.target.value) || 0 }))}
                      />
                      <AppSelect
                        className={inputClassName}
                        value={preferences.minNoticeUnit}
                        onChange={(event) => setPreferences((current) => ({ ...current, minNoticeUnit: event.target.value as MeetingNoticeUnit }))}
                      >
                        <option value="HOURS">hours in advance</option>
                        <option value="DAYS">days in advance</option>
                      </AppSelect>
                    </div>
                    <button
                      onClick={saveMeetingPreferences}
                      className="rounded-xl bg-[#386df4] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#2d5de0]"
                    >
                      Save changes
                    </button>
                  </div>
                </div>
              </Card>

              <Card className="p-0">
                <div className="border-b border-slate-200 px-6 py-4 text-[1.08rem] font-semibold text-slate-900">Default meeting location</div>
                <div className="px-6 py-5">
                  <AppSelect
                    className={inputClassName}
                    value={preferences.defaultLocationType}
                    onChange={(event) => setPreferences((current) => ({ ...current, defaultLocationType: event.target.value as MeetingLocationType }))}
                  >
                    <option value="GOOGLE_MEET">Google Meet</option>
                    <option value="ZOOM" disabled>
                      Zoom (coming soon)
                    </option>
                    <option value="MICROSOFT_TEAMS" disabled>
                      Microsoft Teams (coming soon)
                    </option>
                    <option value="CUSTOM_LINK">Custom link</option>
                  </AppSelect>

                  <div className="mt-6 space-y-6">
                    {providerOptions.map((item) => (
                      <div key={item.type} className="flex items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${providerTone(item.type)}`}>
                            <MeetingProviderLogo provider={item.type} iconClassName="h-5 w-5" />
                          </span>
                          <div>
                            <div className="text-[1.15rem] font-semibold text-slate-900">{providerLabel(item.type)}</div>
                            <div className="mt-1 max-w-[620px] text-sm leading-6 text-slate-500">{item.subtitle}</div>
                          </div>
                        </div>
                        {preferences.defaultLocationType === item.type && item.connected ? (
                          <span className="rounded-full bg-[#eef4ff] px-3 py-1.5 text-sm text-[#386df4]">Default</span>
                        ) : (
                          <button
                            onClick={() => (item.type === "GOOGLE_MEET" ? (item.connected ? disconnectGoogleCalendar() : connectGoogleCalendar()) : null)}
                            disabled={item.disabled}
                            className={`rounded-xl px-4 py-2.5 text-sm font-medium ${
                              item.disabled ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400" : "bg-[#386df4] text-white hover:bg-[#2d5de0]"
                            }`}
                          >
                            {item.actionLabel}
                          </button>
                        )}
                      </div>
                    ))}

                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex flex-1 items-start gap-4">
                        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${providerTone("CUSTOM_LINK")}`}>
                          <MeetingProviderLogo provider="CUSTOM_LINK" iconClassName="h-4.5 w-4.5" />
                        </span>
                        <div className="w-full">
                          <div className="text-[1.15rem] font-semibold text-slate-900">Custom link</div>
                          <input
                            className={`mt-3 ${inputClassName} w-full min-w-0 md:min-w-[520px] ${customLinkValue.trim() && !customLinkReady ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
                            placeholder="Paste a meeting URL"
                            value={preferences.customLink || ""}
                            onChange={(event) => setPreferences((current) => ({ ...current, customLink: event.target.value }))}
                          />
                          <div className={`mt-2 text-xs leading-5 ${customLinkValue.trim() && !customLinkReady ? "text-red-500" : "text-slate-500"}`}>
                            {customLinkValue.trim() && !customLinkReady
                              ? "Enter a valid URL."
                              : "Use this for any existing Meet, Zoom, Teams, or external room link."}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={saveCustomLinkAsDefault}
                        disabled={!customLinkReady}
                        className="rounded-xl bg-[#386df4] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Save link
                      </button>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={saveMeetingPreferences}
                  className="rounded-xl bg-[#386df4] px-8 py-3 text-sm font-medium text-white hover:bg-[#2d5de0]"
                >
                  Continue
                </button>
              </div>
            </>
          )}
        </div>
      ) : null}

      <NewMeetingModal
        open={showNewMeetingModal}
        form={newMeetingForm}
        preferences={preferences}
        busy={isPending}
        heading={editingMeetingId ? "Edit meeting" : "New meeting"}
        submitLabel={editingMeetingId ? "Save meeting" : "Create meeting"}
        busyLabel={editingMeetingId ? "Saving..." : "Creating..."}
        onClose={closeMeetingModal}
        onChange={setNewMeetingForm}
        onSubmit={editingMeetingId ? editMeeting : createMeeting}
      />
      <MeetingInsightModal
        meeting={insightMeeting}
        preferences={preferences}
        localization={localization}
        busy={isPending}
        onClose={() => setInsightMeeting(null)}
        onToggleRecording={(meeting, value) => updateMeeting(meeting.id, { recordMeeting: value, insightEnabled: value ? meeting.insightEnabled : false }, "Meeting recording updated.")}
        onToggleInsight={(meeting, value) => updateMeeting(meeting.id, { insightEnabled: value }, "Meeting insight updated.")}
      />
      <SchedulingPageModal
        open={pageModal !== null}
        mode={pageModal?.mode ?? "create"}
        form={pageModal?.form ?? defaultSchedulingPageForm(preferences)}
        preferences={preferences}
        busy={pageModalBusy}
        onClose={() => setPageModal(null)}
        onChange={(next) => setPageModal((current) => (current ? { ...current, form: next } : null))}
        onSubmit={savePageModal}
      />
      {confirmationDialog}
    </div>
  );
}

"use client";

import { AppSelect } from "@/components/app-select";
import { useEffect, useMemo, useState, useTransition } from "react";
import { MeetingLocationType, MeetingNoticeUnit } from "@prisma/client";
import { ArrowUpRight, CalendarDays, CheckCircle2, Clock3, Mail, UserRound } from "lucide-react";
import { Card } from "@/components/card";
import { FeedbackToast } from "@/components/feedback-toast";
import { MeetingProviderLogo } from "@/components/meeting-provider-logo";
import { buildBookingAvailability } from "@/lib/meeting-booking";
import { formatLocalizedDate, type WorkspaceLocalizationSettings } from "@/lib/localization";

type PublicMeetingPageRecord = {
  id: string;
  title: string;
  slug: string;
  durationMinutes: number;
  hostType: string;
  active: boolean;
  hostName: string;
  hostEmail: string;
};

type PublicMeetingPreferences = {
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

type PublicMeetingEvent = {
  startsAt: string | Date;
  endsAt: string | Date;
};

type BookingResponse = {
  meeting: {
    title: string;
    meetingUrl: string | null;
  };
  guest: {
    name: string;
    email: string;
  };
  slot: {
    startIso: string;
    endIso: string;
    label: string;
  };
};

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/20 hover:border-slate-300";

function locationLabel(type: MeetingLocationType) {
  switch (type) {
    case "ZOOM":
      return "Zoom";
    case "MICROSOFT_TEAMS":
      return "Microsoft Teams";
    case "CUSTOM_LINK":
      return "Custom link";
    case "GOOGLE_MEET":
    default:
      return "Google Meet";
  }
}

function dayCountLabel(days: number) {
  if (!days) {
    return "No availability";
  }

  return `${days} day${days === 1 ? "" : "s"} open`;
}

function bookingDayMonthLabel(dateKey: string, localization: WorkspaceLocalizationSettings) {
  return new Intl.DateTimeFormat(localization.locale, {
    month: "short",
    day: "numeric",
    timeZone: localization.timezone
  }).format(new Date(`${dateKey}T12:00:00`));
}

function bookingDayWeekLabel(dateKey: string, localization: WorkspaceLocalizationSettings) {
  return new Intl.DateTimeFormat(localization.locale, {
    weekday: "short",
    timeZone: localization.timezone
  }).format(new Date(`${dateKey}T12:00:00`));
}

function bookingMonthKey(dateKey: string) {
  return dateKey.slice(0, 7);
}

function bookingMonthLabel(dateKey: string, localization: WorkspaceLocalizationSettings) {
  return new Intl.DateTimeFormat(localization.locale, {
    month: "long",
    year: "numeric",
    timeZone: localization.timezone
  }).format(new Date(`${dateKey}T12:00:00`));
}

export function PublicMeetingBooking({
  slug,
  pages,
  preferences,
  meetings,
  localization,
  isPersonalMeeting,
  initialPageId,
  googleCalendarConfigured
}: {
  appBaseUrl: string;
  slug: string;
  pages: PublicMeetingPageRecord[];
  preferences: PublicMeetingPreferences;
  meetings: PublicMeetingEvent[];
  localization: WorkspaceLocalizationSettings;
  isPersonalMeeting: boolean;
  initialPageId: string | null;
  googleCalendarConfigured: boolean;
}) {
  const [selectedPageId, setSelectedPageId] = useState(initialPageId);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [selectedStartIso, setSelectedStartIso] = useState<string | null>(null);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<BookingResponse | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedPage = useMemo(() => pages.find((page) => page.id === selectedPageId) || pages[0] || null, [pages, selectedPageId]);
  const bookingDays = useMemo(
    () =>
      selectedPage
        ? buildBookingAvailability({
            meetings,
            page: selectedPage,
            preferences,
            localization,
            horizonDays: 60,
            maxVisibleDays: 60
          })
        : [],
    [localization, meetings, preferences, selectedPage]
  );
  const bookingMonthOptions = useMemo(() => {
    const map = new Map<string, string>();

    bookingDays.forEach((day) => {
      const key = bookingMonthKey(day.dateKey);
      if (!map.has(key)) {
        map.set(key, bookingMonthLabel(day.dateKey, localization));
      }
    });

    return Array.from(map.entries()).map(([key, label]) => ({ key, label }));
  }, [bookingDays, localization]);
  const visibleBookingDays = useMemo(() => {
    if (!selectedMonthKey) {
      return bookingDays;
    }

    return bookingDays.filter((day) => bookingMonthKey(day.dateKey) === selectedMonthKey);
  }, [bookingDays, selectedMonthKey]);
  const selectedDay = bookingDays.find((day) => day.dateKey === selectedDateKey) || bookingDays[0] || null;
  const selectedSlot = selectedDay?.slots.find((slot) => slot.startIso === selectedStartIso) || null;
  const bookingLocationReady =
    preferences.defaultLocationType === "CUSTOM_LINK"
      ? Boolean(preferences.customLink?.trim())
      : preferences.defaultLocationType === "GOOGLE_MEET"
        ? googleCalendarConfigured && preferences.googleMeetConnected
        : false;
  const bookingLocationMessage =
    preferences.defaultLocationType === "CUSTOM_LINK"
      ? "Bookings on this page use the host's saved custom meeting link."
      : preferences.defaultLocationType === "GOOGLE_MEET"
        ? bookingLocationReady
          ? "Your booking will include a real Google Meet link."
          : googleCalendarConfigured
            ? "The host still needs to connect Google Calendar before this page can accept bookings."
            : "Google Calendar credentials are missing for this workspace."
        : `${locationLabel(preferences.defaultLocationType)} automation is not available on this workspace yet.`;
  const selectedDayMonthLabel = selectedDay ? bookingDayMonthLabel(selectedDay.dateKey, localization) : null;
  const selectedDayWeekLabel = selectedDay ? bookingDayWeekLabel(selectedDay.dateKey, localization) : null;

  useEffect(() => {
    if (!bookingMonthOptions.length) {
      setSelectedMonthKey(null);
      return;
    }

    const selectedDayMonth = selectedDateKey ? bookingMonthKey(selectedDateKey) : null;

    if (selectedDayMonth && bookingMonthOptions.some((option) => option.key === selectedDayMonth)) {
      setSelectedMonthKey(selectedDayMonth);
      return;
    }

    setSelectedMonthKey((current) => (current && bookingMonthOptions.some((option) => option.key === current) ? current : bookingMonthOptions[0]?.key || null));
  }, [bookingMonthOptions, selectedDateKey]);

  useEffect(() => {
    if (!selectedMonthKey) {
      return;
    }

    const firstVisibleDay = visibleBookingDays[0] || null;

    if (!firstVisibleDay) {
      return;
    }

    if (!selectedDateKey || bookingMonthKey(selectedDateKey) !== selectedMonthKey) {
      setSelectedDateKey(firstVisibleDay.dateKey);
      setSelectedStartIso(firstVisibleDay.slots[0]?.startIso || null);
    }
  }, [selectedDateKey, selectedMonthKey, visibleBookingDays]);

  useEffect(() => {
    if (!selectedDay) {
      setSelectedDateKey(bookingDays[0]?.dateKey || null);
      setSelectedStartIso(bookingDays[0]?.slots[0]?.startIso || null);
      return;
    }

    if (!selectedDateKey || !bookingDays.some((day) => day.dateKey === selectedDateKey)) {
      setSelectedDateKey(bookingDays[0]?.dateKey || null);
    }

    if (!selectedStartIso || !selectedDay.slots.some((slot) => slot.startIso === selectedStartIso)) {
      setSelectedStartIso(selectedDay.slots[0]?.startIso || null);
    }
  }, [bookingDays, selectedDateKey, selectedDay, selectedStartIso]);

  useEffect(() => {
    setBookingResult(null);
  }, [selectedPageId, selectedDateKey, selectedStartIso]);

  const submitBooking = () => {
    if (!selectedPage || !selectedSlot) {
      setFeedback("Select a date and time first.");
      return;
    }

    startTransition(() => {
      void (async () => {
        try {
          const response = await fetch(`/api/meet/${slug}/book`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                pageId: selectedPage.id,
                guestName,
                guestEmail,
                notes,
                startIso: selectedSlot.startIso,
                companyWebsite
              })
          });

          const payload = (await response.json()) as BookingResponse | { error?: string };

          if (!response.ok) {
            throw new Error("error" in payload && payload.error ? payload.error : "Unable to complete booking.");
          }

          setBookingResult(payload as BookingResponse);
          setFeedback("Meeting booked.");
        } catch (error) {
          setFeedback(error instanceof Error ? error.message : "Unable to complete booking.");
        }
      })();
    });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#eef4ff_0%,transparent_38%),linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-start gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
          <Card className="self-start overflow-hidden rounded-[28px] border-[#d8e4ff] bg-[linear-gradient(180deg,#f7faff_0%,#eef4ff_100%)] p-0">
            <div className="px-6 py-7">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#386df4]">
                {isPersonalMeeting ? "Book a meeting" : "Scheduling page"}
              </div>
              <div className="mt-3 text-[2rem] font-semibold tracking-tight text-slate-900">{preferences.profileName}</div>
              <div className="mt-3 text-sm leading-6 text-slate-600">
                Choose a meeting type, pick a time, and confirm your details.
              </div>
            </div>

            <div className="border-t border-[#d8e4ff] bg-white/70 px-6 py-6">
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    <UserRound className="h-4 w-4" />
                    Host
                  </div>
                  <div className="mt-2 text-base font-semibold text-slate-900">{preferences.profileName}</div>
                  <div className="mt-1 text-sm text-slate-500">{preferences.profileEmail}</div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    <Clock3 className="h-4 w-4" />
                    Meeting setup
                  </div>
                  <div className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-slate-900">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                      <MeetingProviderLogo provider={preferences.defaultLocationType} iconClassName="h-4 w-4" />
                    </span>
                    {locationLabel(preferences.defaultLocationType)}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">{localization.timezone}</div>
                  <div className="mt-3 text-xs leading-5 text-slate-500">{bookingLocationMessage}</div>
                </div>

                {selectedSlot ? (
                  <div className="rounded-2xl border border-[#d6e3ff] bg-[linear-gradient(180deg,#ffffff_0%,#f5f8ff_100%)] px-4 py-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#386df4]">Selected slot</div>
                    <div className="mt-2 text-sm font-semibold text-slate-900">{selectedPage?.title}</div>
                    <div className="mt-1 text-sm text-slate-600">
                      {formatLocalizedDate(selectedSlot.startIso, localization)} • {selectedSlot.label}
                    </div>
                    <div className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-slate-500">
                      <MeetingProviderLogo provider={preferences.defaultLocationType} iconClassName="h-3.5 w-3.5" />
                      {locationLabel(preferences.defaultLocationType)}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </Card>

          <Card className="rounded-[28px] border-slate-200 p-6 sm:p-7">
            {!selectedPage ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
                No active meeting pages are available right now.
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-4 border-b border-slate-200 pb-6">
                  <div>
                    <div className="text-[1.75rem] font-semibold tracking-tight text-slate-900">{selectedPage.title}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-2">
                        <Clock3 className="h-4 w-4" />
                        {selectedPage.durationMinutes} min
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        {dayCountLabel(bookingDays.length)}
                      </span>
                    </div>
                  </div>

                  {isPersonalMeeting && pages.length > 1 ? (
                    <div className="flex flex-wrap gap-2">
                      {pages.map((page) => {
                        const active = page.id === selectedPage.id;

                        return (
                          <button
                            key={page.id}
                            type="button"
                            onClick={() => setSelectedPageId(page.id)}
                            className={`rounded-2xl border px-4 py-2.5 text-sm font-medium transition ${
                              active ? "border-[#bfd2ff] bg-[#eef4ff] text-[#386df4]" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            {page.title}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>

                {feedback ? (
                  <div className="mt-5">
                    <FeedbackToast message={feedback} position="inline" />
                  </div>
                ) : null}

                {bookingResult ? (
                  <div className="mt-6 rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-5">
                    <div className="flex items-center gap-3 text-emerald-700">
                      <CheckCircle2 className="h-6 w-6" />
                      <div className="text-lg font-semibold">Meeting booked</div>
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-emerald-950">
                      <div>
                        {formatLocalizedDate(bookingResult.slot.startIso, localization)} at {bookingResult.slot.label}
                      </div>
                      <div>{bookingResult.guest.name} • {bookingResult.guest.email}</div>
                      {bookingResult.meeting.meetingUrl ? (
                        <a
                          href={bookingResult.meeting.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 font-medium text-emerald-700 hover:text-emerald-800"
                        >
                          Open meeting link
                          <ArrowUpRight className="h-4 w-4" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {!bookingLocationReady ? (
                  <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 px-6 py-10 text-center text-sm leading-6 text-amber-900">
                    {bookingLocationMessage}
                  </div>
                ) : !bookingDays.length ? (
                  <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                    No bookable slots are available right now.
                  </div>
                ) : (
                  <div className="mt-6 space-y-6">
                    <section className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">1. Choose a date</div>
                          <div className="mt-1 text-sm text-slate-500">Pick from the next 1-2 months of available dates.</div>
                        </div>
                        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{dayCountLabel(bookingDays.length)}</div>
                      </div>
                      {bookingMonthOptions.length > 1 ? (
                        <div className="mt-4 max-w-[240px]">
                          <AppSelect
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none transition focus:border-[#386df4] focus:ring-2 focus:ring-[#386df4]/15"
                            value={selectedMonthKey || bookingMonthOptions[0]?.key || ""}
                            onChange={(event) => setSelectedMonthKey(event.target.value)}
                          >
                            {bookingMonthOptions.map((option) => (
                              <option key={option.key} value={option.key}>
                                {option.label}
                              </option>
                            ))}
                          </AppSelect>
                        </div>
                      ) : null}
                      <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {visibleBookingDays.map((day) => (
                          <button
                            key={day.dateKey}
                            type="button"
                            onClick={() => setSelectedDateKey(day.dateKey)}
                            className={`rounded-[18px] border px-3.5 py-3 text-left transition ${
                              day.dateKey === selectedDay?.dateKey
                                ? "border-[#bfd2ff] bg-[linear-gradient(180deg,#f7faff_0%,#eef4ff_100%)] shadow-[0_14px_30px_rgba(56,109,244,0.12)]"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                  {bookingDayWeekLabel(day.dateKey, localization)}
                                </div>
                                <div className="mt-1 text-base font-semibold text-slate-900">{bookingDayMonthLabel(day.dateKey, localization)}</div>
                              </div>
                              <div
                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                  day.dateKey === selectedDay?.dateKey ? "bg-white text-[#386df4]" : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {day.slots.length} slots
                              </div>
                            </div>
                            <div className="mt-2 text-[11px] text-slate-500">{day.label}</div>
                          </button>
                        ))}
                      </div>
                    </section>

                    <section className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">2. Choose a time</div>
                          <div className="mt-1 text-sm text-slate-500">
                            {selectedDayMonthLabel && selectedDayWeekLabel
                              ? `${selectedDayWeekLabel}, ${selectedDayMonthLabel}`
                              : "Select a day to view available times."}
                          </div>
                        </div>
                        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          {selectedDay?.slots.length || 0} available
                        </div>
                      </div>
                      <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {selectedDay?.slots.map((slot) => (
                          <button
                            key={slot.startIso}
                            type="button"
                            onClick={() => setSelectedStartIso(slot.startIso)}
                            className={`rounded-[18px] border px-3.5 py-3 text-left text-xs font-medium transition ${
                              slot.startIso === selectedSlot?.startIso
                                ? "border-[#bfd2ff] bg-[linear-gradient(180deg,#f7faff_0%,#eef4ff_100%)] text-[#386df4] shadow-[0_14px_30px_rgba(56,109,244,0.12)]"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            <div className="text-sm font-semibold">{slot.label}</div>
                            <div className="mt-1 text-[11px] text-slate-500">{selectedPage.durationMinutes} min</div>
                          </button>
                        ))}
                      </div>
                    </section>

                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                      <div className="text-sm font-semibold text-slate-900">3. Your details</div>
                      <div className="mt-4 space-y-4">
                        <div className="rounded-2xl border border-white bg-white px-4 py-4 text-sm text-slate-600 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                          <div className="font-semibold text-slate-900">{selectedPage.title}</div>
                          <div className="mt-1">
                            {selectedSlot ? `${formatLocalizedDate(selectedSlot.startIso, localization)} • ${selectedSlot.label}` : "Choose a time to continue."}
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
                          <input className={inputClassName} value={guestName} onChange={(event) => setGuestName(event.target.value)} placeholder="Your name" />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Email address</label>
                          <div className="relative">
                            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                              className={`${inputClassName} pl-11`}
                              type="email"
                              value={guestEmail}
                              onChange={(event) => setGuestEmail(event.target.value)}
                              placeholder="you@company.com"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="sr-only" htmlFor="company-website">Company website</label>
                          <input
                            id="company-website"
                            className="hidden"
                            tabIndex={-1}
                            autoComplete="off"
                            value={companyWebsite}
                            onChange={(event) => setCompanyWebsite(event.target.value)}
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Notes</label>
                          <textarea
                            className={`${inputClassName} min-h-[100px] resize-none`}
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                            placeholder="Optional agenda"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={submitBooking}
                          disabled={isPending || !guestName.trim() || !guestEmail.trim() || !selectedSlot || !bookingLocationReady}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#386df4] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#2d5de0] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isPending ? "Booking..." : "Book meeting"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

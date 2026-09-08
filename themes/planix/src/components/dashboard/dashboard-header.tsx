"use client";

import { CalendarDays, Clock3 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

function formatDashboardDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

function formatDashboardTime(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(value);
}

function formatDashboardTimezone(value: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZoneName: "short",
  }).formatToParts(value);

  return parts.find((part) => part.type === "timeZoneName")?.value ?? "Local time";
}

export function DashboardHeader() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const updateClock = () => setNow(new Date());

    updateClock();
    const intervalId = window.setInterval(updateClock, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const dateLabel = useMemo(() => (now ? formatDashboardDate(now) : "Today's overview"), [now]);
  const timeLabel = useMemo(() => (now ? formatDashboardTime(now) : "--:--:--"), [now]);
  const timezoneLabel = useMemo(() => (now ? formatDashboardTimezone(now) : "Local time"), [now]);

  return (
    <header className="flex shrink-0 flex-col gap-5 border-b border-white/6 px-4 py-5 sm:px-6 sm:py-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
      <div>
        <h1 className="type-page-title tracking-tight text-white">Dashboard</h1>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="btn-base btn-secondary type-ui inline-flex h-12 items-center gap-3 rounded-[var(--radius-md)] px-4 font-medium">
          <CalendarDays className="h-4 w-4 text-[var(--accent)]" />
          {dateLabel}
        </div>

        <div className="btn-base btn-secondary type-ui inline-flex h-12 items-center gap-3 rounded-[var(--radius-md)] px-4 font-medium">
          <Clock3 className="h-4 w-4 text-[var(--accent)]" />
          <span>{timeLabel}</span>
          <span className="text-[0.72rem] text-[var(--text-muted)]">{timezoneLabel}</span>
        </div>
      </div>
    </header>
  );
}

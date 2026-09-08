"use client";

import { Bell, Clock3 } from "lucide-react";
import { useMemo } from "react";

import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";

type ReminderPickerProps = {
  value: string;
  onChange: (value: string) => void;
  align?: "left" | "right";
  triggerClassName?: string;
  compact?: boolean;
};

const DEFAULT_TIME = "09:00";

const timeOptions = Array.from({ length: 48 }, (_, index) => {
  const hours = String(Math.floor(index / 2)).padStart(2, "0");
  const minutes = index % 2 === 0 ? "00" : "30";
  const value = `${hours}:${minutes}`;
  const label = formatTimeLabel(value);

  return { value, label };
});

function formatTimeLabel(value: string) {
  const [hoursText = "0", minutesText = "0"] = value.split(":");
  const hours = Number(hoursText);
  const minutes = Number(minutesText);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2026, 0, 1, hours, minutes));
}

function formatDateLabel(value: string) {
  if (!value) {
    return "";
  }

  const parsed = new Date(`${value}T12:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

function toLocalDateParts(value: string) {
  if (!value) {
    return { date: "", time: "" };
  }

  const directMatch = value.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);

  if (directMatch) {
    return {
      date: directMatch[1] ?? "",
      time: directMatch[2] ?? "",
    };
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return { date: "", time: "" };
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  const hours = String(parsed.getHours()).padStart(2, "0");
  const minutes = String(parsed.getMinutes()).padStart(2, "0");

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`,
  };
}

export function ReminderPicker({
  value,
  onChange,
  align = "left",
  triggerClassName,
  compact = false,
}: ReminderPickerProps) {
  const { date, time } = useMemo(() => toLocalDateParts(value), [value]);
  const selectedTime = date ? time || DEFAULT_TIME : DEFAULT_TIME;
  const resolvedTimeOptions = useMemo(() => {
    if (!time || timeOptions.some((option) => option.value === time)) {
      return timeOptions;
    }

    return [{ value: time, label: formatTimeLabel(time) }, ...timeOptions];
  }, [time]);
  const displayValue = date ? `${formatDateLabel(date)} · ${formatTimeLabel(selectedTime)}` : "Select reminder";

  function handleDateChange(nextDate: string) {
    if (!nextDate) {
      onChange("");
      return;
    }

    onChange(`${nextDate}T${selectedTime}`);
  }

  function handleTimeChange(nextTime: string) {
    if (!date) {
      return;
    }

    onChange(`${date}T${nextTime}`);
  }

  return (
    <DatePicker
      value={date}
      onChange={handleDateChange}
      placeholder="Select reminder"
      displayValue={displayValue}
      variant="input"
      icon={Bell}
      align={align}
      direction="up"
      compact={compact}
      closeOnSelect={false}
      triggerClassName={cn("text-[0.86rem]", triggerClassName)}
      panelClassName="p-3.5 sm:w-[286px]"
      footerContent={(
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-[var(--text-muted)]">
            <Clock3 className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
            Reminder Time
          </div>
          <div className="relative">
            <select
              value={selectedTime}
              onChange={(event) => handleTimeChange(event.target.value)}
              disabled={!date}
              className="w-full appearance-none rounded-[12px] border border-white/8 bg-white/[0.03] px-3 py-2.5 pr-9 text-[0.82rem] text-[var(--text-primary)] outline-none transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {resolvedTimeOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-[#1d1e22] text-[var(--text-primary)]">
                  {option.label}
                </option>
              ))}
            </select>
            <Clock3 className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
          </div>
        </div>
      )}
    />
  );
}

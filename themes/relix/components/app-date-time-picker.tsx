"use client";

import type { CSSProperties, ReactNode, RefObject } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";

type PickerPosition = {
  left: number;
  top: number;
  width: number;
  maxHeight: number;
};

type BasePickerProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  ariaLabel?: string;
};

const weekStartsOn = 1;
const menuClassName =
  "fixed z-[100] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.12)]";
const scrollClassName =
  "overscroll-contain [scrollbar-color:#dce3ee_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200/80 [&::-webkit-scrollbar-thumb:hover]:bg-slate-300";
const hourOptions = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));
const clockMinuteOptions = Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, "0"));
const periodOptions = ["AM", "PM"] as const;

function parseDateValue(value: string) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return null;
  }

  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseDateTimeValue(value: string) {
  if (!value) {
    return { date: "", time: "" };
  }

  const [date = "", time = ""] = value.split("T");
  return { date, time: time.slice(0, 5) };
}

function formatDateValue(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function formatTimeLabel(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return value;
  }

  return format(new Date(2000, 0, 1, hours, minutes), "h:mm a");
}

function formatDateLabel(value: string, placeholder: string) {
  const parsed = parseDateValue(value);
  return parsed ? format(parsed, "MMM d, yyyy") : placeholder;
}

function parseTimeParts(value: string) {
  const [rawHours, rawMinutes] = value.split(":").map(Number);
  const hours24 = Number.isFinite(rawHours) ? rawHours : 9;
  const minutes = Number.isFinite(rawMinutes) ? rawMinutes : 0;
  const period: (typeof periodOptions)[number] = hours24 >= 12 ? "PM" : "AM";
  const hour12 = hours24 % 12 || 12;

  return {
    hour: String(hour12).padStart(2, "0"),
    minute: String(minutes).padStart(2, "0"),
    period
  };
}

function composeTimeValue(hour: string, minute: string, period: string) {
  let hours = Number(hour);
  if (!Number.isFinite(hours)) {
    hours = 9;
  }

  if (period === "AM" && hours === 12) {
    hours = 0;
  } else if (period === "PM" && hours !== 12) {
    hours += 12;
  }

  return `${String(hours).padStart(2, "0")}:${minute}`;
}

function calculatePosition(anchor: HTMLElement, preferredWidth: number, preferredHeight: number): PickerPosition {
  const rect = anchor.getBoundingClientRect();
  const viewportPadding = 12;
  const width = Math.min(preferredWidth, window.innerWidth - viewportPadding * 2);
  const availableBelow = window.innerHeight - rect.bottom - viewportPadding;
  const availableAbove = rect.top - viewportPadding;
  const placeAbove = availableBelow < preferredHeight && availableAbove > availableBelow;
  const maxHeight = Math.max(220, Math.min(preferredHeight, placeAbove ? availableAbove - 8 : availableBelow - 8));
  const preferredTop = placeAbove ? rect.top - maxHeight - 8 : rect.bottom + 8;

  return {
    left: Math.max(viewportPadding, Math.min(rect.left, window.innerWidth - width - viewportPadding)),
    top: Math.max(viewportPadding, Math.min(preferredTop, window.innerHeight - maxHeight - viewportPadding)),
    width,
    maxHeight
  };
}

function usePickerPosition(open: boolean, preferredWidth: number, preferredHeight: number) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<PickerPosition | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const updatePosition = () => {
      const button = buttonRef.current;
      if (button) {
        setPosition(calculatePosition(button, preferredWidth, preferredHeight));
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, preferredHeight, preferredWidth]);

  return { buttonRef, menuRef, position };
}

function CalendarGrid({
  value,
  viewMonth,
  onViewMonthChange,
  onSelect
}: {
  value: string;
  viewMonth: Date;
  onViewMonthChange: (date: Date) => void;
  onSelect: (value: string) => void;
}) {
  const selectedDate = parseDateValue(value);
  const today = new Date();
  const days = useMemo(() => {
    const monthStart = startOfMonth(viewMonth);
    return eachDayOfInterval({
      start: startOfWeek(monthStart, { weekStartsOn }),
      end: endOfWeek(endOfMonth(monthStart), { weekStartsOn })
    });
  }, [viewMonth]);
  const weekdays = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn });
    return Array.from({ length: 7 }, (_, index) => format(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + index), "EEE"));
  }, []);

  return (
    <div className="mx-auto w-full max-w-[236px] p-2">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => onViewMonthChange(subMonths(viewMonth, 1))}
          className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <div className="text-xs font-semibold text-slate-900">{format(viewMonth, "MMMM yyyy")}</div>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => onViewMonthChange(addMonths(viewMonth, 1))}
          className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center text-[0.62rem] font-semibold uppercase text-slate-400">
        {weekdays.map((weekday) => (
          <div key={weekday} className="py-1">
            {weekday}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-0.5">
        {days.map((day) => {
          const selected = selectedDate ? isSameDay(day, selectedDate) : false;
          const currentMonth = isSameMonth(day, viewMonth);
          const currentDay = isSameDay(day, today);

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelect(formatDateValue(day))}
              className={`flex aspect-square min-h-6 items-center justify-center rounded-md border text-[0.72rem] font-semibold transition ${
                selected
                  ? "border-[#386df4] bg-[#386df4] text-white shadow-[0_8px_16px_rgba(56,109,244,0.2)]"
                  : currentDay
                    ? "border-[#d7e4ff] bg-[#eef4ff] text-[#386df4]"
                    : currentMonth
                      ? "border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50"
                      : "border-transparent text-slate-300 hover:border-slate-100 hover:bg-slate-50"
              }`}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TimeSelector({
  value,
  onChange,
  onDone,
  compact = false
}: {
  value: string;
  onChange: (value: string) => void;
  onDone?: () => void;
  compact?: boolean;
}) {
  const [selectionMode, setSelectionMode] = useState<"hour" | "minute">("hour");
  const parts = parseTimeParts(value);
  const minuteOptions = clockMinuteOptions.includes(parts.minute) ? clockMinuteOptions : [...clockMinuteOptions, parts.minute].sort();
  const faceSize = compact ? 132 : 158;
  const radius = compact ? 50 : 60;
  const center = faceSize / 2;
  const handLength = radius - (compact ? 12 : 14);
  const clockOptions = selectionMode === "hour" ? hourOptions : minuteOptions;
  const activeValue = selectionMode === "hour" ? parts.hour : parts.minute;
  const activeNumber = selectionMode === "hour" ? Number(parts.hour) % 12 : Number(parts.minute) / 5;
  const handAngle = Number.isFinite(activeNumber) ? activeNumber * 30 : 0;

  const update = (next: Partial<typeof parts>) => {
    onChange(composeTimeValue(next.hour || parts.hour, next.minute || parts.minute, next.period || parts.period));
  };

  return (
    <div className={compact ? "p-2 pb-2.5" : "p-2.5 pb-3"}>
      <div className="grid grid-cols-[1fr_auto_1fr_2.7rem] gap-1.5">
        <button
          type="button"
          onClick={() => setSelectionMode("hour")}
          className={`flex h-11 items-center justify-center rounded-lg border text-2xl font-semibold leading-none ${
            selectionMode === "hour" ? "border-[#d7e4ff] bg-[#eef4ff] text-[#386df4]" : "border-slate-200 bg-slate-50 text-slate-900"
          }`}
        >
          {parts.hour}
        </button>
        <div className="flex h-11 items-center justify-center text-2xl font-semibold leading-none text-slate-900">:</div>
        <button
          type="button"
          onClick={() => setSelectionMode("minute")}
          className={`flex h-11 items-center justify-center rounded-lg border text-2xl font-semibold leading-none ${
            selectionMode === "minute" ? "border-[#d7e4ff] bg-[#eef4ff] text-[#386df4]" : "border-slate-200 bg-slate-50 text-slate-900"
          }`}
        >
          {parts.minute}
        </button>
        <div className="grid h-11 overflow-hidden rounded-lg border border-slate-200 bg-white text-[0.7rem] font-semibold">
          {periodOptions.map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => update({ period })}
              className={parts.period === period ? "bg-[#eef4ff] text-[#386df4]" : "text-slate-500 hover:bg-slate-50"}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 flex justify-center">
        <div className="relative rounded-full bg-slate-50" style={{ width: faceSize, height: faceSize }}>
          <div
            className="absolute left-1/2 top-1/2 w-0.5 origin-bottom rounded-full bg-[#386df4]"
            style={{
              height: handLength,
              marginLeft: -1,
              marginTop: -handLength,
              transform: `rotate(${handAngle}deg)`
            }}
          />
          <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#386df4]" />
          {clockOptions.map((option) => {
            const angle = ((selectionMode === "hour" ? Number(option) % 12 : Number(option) / 5) * 30 - 90) * (Math.PI / 180);
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            const selected = option === activeValue;

            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  update(selectionMode === "hour" ? { hour: option } : { minute: option });
                  if (selectionMode === "hour") {
                    setSelectionMode("minute");
                  }
                }}
                className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-semibold transition ${
                  selected ? "bg-[#386df4] text-white shadow-[0_8px_16px_rgba(56,109,244,0.2)]" : "text-slate-700 hover:bg-white hover:text-[#386df4]"
                }`}
                style={{
                  left: x,
                  top: y,
                  width: compact ? 24 : 30,
                  height: compact ? 24 : 30
                }}
              >
                {selectionMode === "hour" ? String(Number(option)) : option}
              </button>
            );
          })}
        </div>
      </div>

      {onDone ? (
        <button type="button" onClick={onDone} className="mt-3 flex h-8 w-full items-center justify-center rounded-lg bg-[#386df4] text-xs font-semibold text-white hover:bg-[#2d5de0]">
          Done
        </button>
      ) : null}
    </div>
  );
}

function PickerButton({
  ariaLabel,
  children,
  className = "",
  disabled,
  open,
  onClick,
  buttonRef,
  style
}: {
  ariaLabel?: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  open: boolean;
  onClick: () => void;
  buttonRef: RefObject<HTMLButtonElement | null>;
  style?: CSSProperties;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      disabled={disabled}
      aria-label={ariaLabel}
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={`${className} inline-flex items-center text-left disabled:cursor-not-allowed disabled:opacity-60`}
      style={style}
    >
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </button>
  );
}

export function AppDatePicker({ value, onChange, className = "", disabled = false, placeholder = "Select date", ariaLabel }: BasePickerProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = parseDateValue(value);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(selectedDate || new Date()));
  const { buttonRef, menuRef, position } = usePickerPosition(open, 236, 282);

  useEffect(() => {
    if (open) {
      setViewMonth(startOfMonth(selectedDate || new Date()));
    }
  }, [open, value]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const close = (event: PointerEvent) => {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [buttonRef, menuRef, open]);

  const menu =
    open && position
      ? createPortal(
          <div ref={menuRef} role="dialog" className={`${menuClassName} ${scrollClassName} overflow-y-auto`} style={position}>
            <CalendarGrid
              value={value}
              viewMonth={viewMonth}
              onViewMonthChange={setViewMonth}
              onSelect={(nextValue) => {
                onChange(nextValue);
                setOpen(false);
                buttonRef.current?.focus();
              }}
            />
            <div className="flex items-center justify-between border-t border-slate-100 px-2.5 py-1.5">
              <button
                type="button"
                onClick={() => {
                  onChange(formatDateValue(new Date()));
                  setOpen(false);
                  buttonRef.current?.focus();
                }}
                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#386df4] hover:bg-[#eef4ff]"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </button>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <PickerButton ariaLabel={ariaLabel || placeholder} className={className} disabled={disabled} open={open} onClick={() => setOpen((current) => !current)} buttonRef={buttonRef}>
        <span className={value ? "text-slate-800" : "text-slate-400"}>{formatDateLabel(value, placeholder)}</span>
      </PickerButton>
      {menu}
    </>
  );
}

export function AppTimePicker({ value, onChange, className = "", disabled = false, placeholder = "Select time", ariaLabel }: BasePickerProps) {
  const [open, setOpen] = useState(false);
  const { buttonRef, menuRef, position } = usePickerPosition(open, 226, 274);

  useEffect(() => {
    if (!open) {
      return;
    }

    const close = (event: PointerEvent) => {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [buttonRef, menuRef, open]);

  const menu =
    open && position
      ? createPortal(
          <div ref={menuRef} role="dialog" className={menuClassName} style={position}>
            <TimeSelector
              value={value}
              onChange={onChange}
              onDone={() => {
                setOpen(false);
                buttonRef.current?.focus();
              }}
            />
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <PickerButton ariaLabel={ariaLabel || placeholder} className={className} disabled={disabled} open={open} onClick={() => setOpen((current) => !current)} buttonRef={buttonRef}>
        <span className={value ? "text-slate-800" : "text-slate-400"}>{value ? formatTimeLabel(value) : placeholder}</span>
      </PickerButton>
      {menu}
    </>
  );
}

export function AppDateTimePicker({ value, onChange, className = "", disabled = false, placeholder = "Select date and time", ariaLabel }: BasePickerProps) {
  const [open, setOpen] = useState(false);
  const dateTime = parseDateTimeValue(value);
  const selectedDate = parseDateValue(dateTime.date);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(selectedDate || new Date()));
  const { buttonRef, menuRef, position } = usePickerPosition(open, 384, 316);

  useEffect(() => {
    if (open) {
      setViewMonth(startOfMonth(selectedDate || new Date()));
    }
  }, [dateTime.date, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const close = (event: PointerEvent) => {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [buttonRef, menuRef, open]);

  const updateDateTime = (date: string, time: string) => {
    if (!date) {
      onChange("");
      return;
    }

    onChange(`${date}T${time || "09:00"}`);
  };

  const displayValue = dateTime.date ? `${formatDateLabel(dateTime.date, placeholder)}${dateTime.time ? `, ${formatTimeLabel(dateTime.time)}` : ""}` : placeholder;
  const menu =
    open && position
      ? createPortal(
          <div ref={menuRef} role="dialog" className={`${menuClassName} ${scrollClassName} overflow-y-auto`} style={position}>
            <div className="grid max-h-full grid-cols-1 overflow-hidden sm:grid-cols-[minmax(0,1fr)_148px]">
              <div className="min-w-0">
                <CalendarGrid
                  value={dateTime.date}
                  viewMonth={viewMonth}
                  onViewMonthChange={setViewMonth}
                  onSelect={(nextDate) => updateDateTime(nextDate, dateTime.time)}
                />
              </div>
              <div className="border-t border-slate-100 sm:border-l sm:border-t-0">
                <TimeSelector
                  value={dateTime.time}
                  compact
                  onChange={(nextTime) => updateDateTime(dateTime.date || formatDateValue(new Date()), nextTime)}
                  onDone={() => {
                    setOpen(false);
                    buttonRef.current?.focus();
                  }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 px-2.5 py-1.5">
              <button
                type="button"
                onClick={() => updateDateTime(formatDateValue(new Date()), dateTime.time || "09:00")}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#386df4] hover:bg-[#eef4ff]"
              >
                <CalendarDays className="h-3.5 w-3.5" />
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </button>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <PickerButton ariaLabel={ariaLabel || placeholder} className={className} disabled={disabled} open={open} onClick={() => setOpen((current) => !current)} buttonRef={buttonRef}>
        <span className={dateTime.date ? "text-slate-800" : "text-slate-400"}>{displayValue}</span>
      </PickerButton>
      {menu}
    </>
  );
}

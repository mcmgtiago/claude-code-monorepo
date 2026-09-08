"use client";

import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  variant?: "input" | "row" | "minimal";
  icon?: LucideIcon;
  rowLabel?: string;
  triggerClassName?: string;
  panelClassName?: string;
  align?: "left" | "right";
  direction?: "auto" | "up" | "down";
  compact?: boolean;
  closeOnSelect?: boolean;
  displayValue?: string;
  footerContent?: ReactNode;
};

type CalendarCell = {
  date: Date;
  inMonth: boolean;
};

type FloatingPanelStyle = {
  top: number;
  left: number;
};

const weekdayLabels = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function parseDateValue(value: string) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayValue(value: string, placeholder: string) {
  const date = parseDateValue(value);

  if (!date) {
    return placeholder;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function isSameDay(left: Date | null, right: Date | null) {
  if (!left || !right) {
    return false;
  }

  return (
    left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate()
  );
}

function buildCalendarCells(viewDate: Date) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPreviousMonth = new Date(year, month, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;
  const cells: CalendarCell[] = [];

  for (let index = 0; index < 42; index += 1) {
    const dayNumber = index - startOffset + 1;

    if (dayNumber < 1) {
      cells.push({
        date: new Date(year, month - 1, daysInPreviousMonth + dayNumber),
        inMonth: false,
      });
      continue;
    }

    if (dayNumber > daysInMonth) {
      cells.push({
        date: new Date(year, month + 1, dayNumber - daysInMonth),
        inMonth: false,
      });
      continue;
    }

    cells.push({
      date: new Date(year, month, dayNumber),
      inMonth: true,
    });
  }

  return cells;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  variant = "input",
  icon: Icon = CalendarDays,
  rowLabel = "Date",
  triggerClassName,
  panelClassName,
  align = "right",
  direction = "auto",
  compact = false,
  closeOnSelect = true,
  displayValue,
  footerContent,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = useMemo(() => parseDateValue(value), [value]);
  const [viewDate, setViewDate] = useState(() => selectedDate ?? new Date());
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const today = useMemo(() => new Date(), []);
  const cells = useMemo(() => buildCalendarCells(viewDate), [viewDate]);
  const [panelStyle, setPanelStyle] = useState<FloatingPanelStyle | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      setViewDate(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      const clickedTrigger = wrapperRef.current?.contains(target);
      const clickedPanel = panelRef.current?.contains(target);

      if (!clickedTrigger && !clickedPanel) {
        setOpen(false);
      }
    }

    if (open && !isMobileViewport) {
      document.addEventListener("mousedown", handlePointerDown);
    }

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isMobileViewport, open]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateViewport = () => {
      setIsMobileViewport(window.innerWidth < 640);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => {
      window.removeEventListener("resize", updateViewport);
    };
  }, []);

  const updatePanelPosition = useCallback(() => {
    if (!wrapperRef.current) {
      setPanelStyle(null);
      return;
    }

    const rect = wrapperRef.current.getBoundingClientRect();
    const panelWidth = panelRef.current?.offsetWidth ?? 292;
    const panelHeight = panelRef.current?.offsetHeight ?? 352;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const gutter = 12;
    const nextLeft = align === "left" ? rect.left : rect.right - panelWidth;
    const clampedLeft = Math.min(Math.max(nextLeft, gutter), viewportWidth - panelWidth - gutter);
    const roomBelow = viewportHeight - rect.bottom;
    const shouldOpenAbove =
      direction === "up"
        ? true
        : direction === "down"
          ? false
          : roomBelow < panelHeight + gutter && rect.top > roomBelow;
    const preferredTop = shouldOpenAbove ? rect.top - panelHeight - gutter : rect.bottom + gutter;
    const clampedTop = Math.min(Math.max(preferredTop, gutter), viewportHeight - panelHeight - gutter);

    setPanelStyle({
      top: clampedTop,
      left: clampedLeft,
    });
  }, [align, direction]);

  useLayoutEffect(() => {
    if (!open || isMobileViewport) {
      setPanelStyle(null);
      return;
    }

    updatePanelPosition();

    const handleViewportChange = () => updatePanelPosition();
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [isMobileViewport, open, updatePanelPosition]);

  function handleSelect(date: Date) {
    onChange(formatDateValue(date));
    setViewDate(date);
    if (closeOnSelect) {
      setOpen(false);
    }
  }

  const resolvedDisplayValue = displayValue ?? formatDisplayValue(value, placeholder);

  const panelContent = (
    <>
      {isMobileViewport ? (
        <div className="mb-3 flex justify-center">
          <span className="h-1.5 w-12 rounded-full bg-white/10" />
        </div>
      ) : null}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setViewDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-white/5 hover:text-[var(--text-primary)]"
        >
          <ChevronLeft className="h-4.5 w-4.5" />
        </button>
        <div className="text-[0.98rem] font-semibold tracking-tight text-[var(--text-primary)]">
          {new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(viewDate)}
        </div>
        <button
          type="button"
          onClick={() => setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:bg-white/5 hover:text-[var(--text-primary)]"
        >
          <ChevronRight className="h-4.5 w-4.5" />
        </button>
      </div>

      <div className="mb-2.5 grid grid-cols-7 gap-1">
        {weekdayLabels.map((label) => (
          <div key={label} className="flex h-8 items-center justify-center text-[0.82rem] font-medium text-[#d8d4cf]">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell) => {
          const isSelected = isSameDay(cell.date, selectedDate);
          const isToday = isSameDay(cell.date, today);

          return (
            <button
              key={formatDateValue(cell.date)}
              type="button"
              onClick={() => handleSelect(cell.date)}
              className={cn(
                "relative flex h-10 items-center justify-center rounded-[13px] text-[0.94rem] transition",
                cell.inMonth ? "text-[var(--text-primary)]" : "text-[rgba(245,239,232,0.28)]",
                !isSelected && "hover:bg-white/5",
                isSelected && "bg-[var(--accent)] font-semibold text-[#160d09] shadow-[0_10px_24px_rgba(251,138,116,0.28)]",
              )}
            >
              <span>{cell.date.getDate()}</span>
              {isToday && !isSelected && (
                <span className="absolute bottom-[6px] h-1.5 w-1.5 rounded-full bg-[var(--accent)]/70" />
              )}
            </button>
          );
        })}
      </div>

      {footerContent ? (
        <div className="mt-3.5 border-t border-white/6 pt-3.5">
          {footerContent}
        </div>
      ) : null}

      <div className="mt-3.5 flex items-center justify-between border-t border-white/6 pt-3.5">
        <button
          type="button"
          onClick={() => {
            onChange("");
            setOpen(false);
          }}
          className="text-[0.76rem] font-medium text-[var(--text-muted)] transition hover:text-[var(--text-secondary)]"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => handleSelect(today)}
          className="rounded-full bg-white/6 px-2.5 py-1.5 text-[0.76rem] font-medium text-[var(--text-secondary)] transition hover:bg-white/10 hover:text-[var(--text-primary)]"
        >
          Today
        </button>
      </div>
    </>
  );

  return (
    <div className="relative" ref={wrapperRef}>
      {variant === "row" ? (
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className={cn("flex w-full items-center gap-3.5 px-5 py-4 text-left transition hover:bg-white/[0.025]", triggerClassName)}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-white/6">
            <Icon className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-[0.1em] text-[var(--text-muted)]">{rowLabel}</p>
            <p className={cn("mt-0.5 text-[13.5px] font-medium", value ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]")}>
              {formatDisplayValue(value, placeholder)}
            </p>
          </div>
          <ChevronDown className={cn("h-4 w-4 shrink-0 text-[var(--text-muted)] transition", open && "rotate-180")} />
        </button>
      ) : variant === "minimal" ? (
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className={cn(
            "flex w-full items-center justify-between gap-3 border-b border-white/8 bg-transparent px-0 py-0 pb-2 text-left transition hover:border-white/12",
            triggerClassName,
          )}
        >
          <span className={cn("block truncate", value ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]")}>
            {resolvedDisplayValue}
          </span>
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <Icon className="h-3.5 w-3.5" />
            <ChevronDown className={cn("h-3.5 w-3.5 transition", open && "rotate-180")} />
          </div>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className={cn(
            "flex w-full items-center justify-between gap-3 rounded-[var(--radius-md)] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] px-3 py-2.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-[rgba(251,138,116,0.26)] hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))]",
            triggerClassName,
          )}
        >
          {compact && <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />}
          <span className={cn("block min-w-0 flex-1 truncate text-[0.9rem]", value ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]")}>
            {resolvedDisplayValue}
          </span>
          {compact ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[var(--accent-soft)] text-[var(--accent)]">
              <Icon className="h-4 w-4" />
            </div>
          )}
        </button>
      )}

      {open && typeof document !== "undefined" && createPortal(
        isMobileViewport ? (
          <>
            <div className="fixed inset-0 z-[118] bg-black/55 backdrop-blur-sm sm:hidden" onClick={() => setOpen(false)} />
            <div
              ref={panelRef}
              className={cn(
                "fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-[120] max-h-[min(78dvh,560px)] overflow-y-auto rounded-[22px] border border-white/8 bg-[#17181b]/98 p-4 shadow-[0_24px_72px_rgba(0,0,0,0.42)] backdrop-blur-xl sm:hidden",
                panelClassName,
              )}
            >
              {panelContent}
            </div>
          </>
        ) : panelStyle ? (
          <div
            ref={panelRef}
            className={cn(
              "fixed z-[120] w-[292px] rounded-[20px] border border-white/8 bg-[#17181b]/96 p-4 shadow-[0_24px_72px_rgba(0,0,0,0.42)] backdrop-blur-xl",
              panelClassName,
            )}
            style={{ top: panelStyle.top, left: panelStyle.left }}
          >
            {panelContent}
          </div>
        ) : null,
        document.body,
      )}
    </div>
  );
}

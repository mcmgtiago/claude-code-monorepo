"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

type DashboardCardMenuItem = {
  label: string;
  icon: ComponentType<{ className?: string }>;
  onSelect: () => void;
  active?: boolean;
  tone?: "default" | "accent";
};

type DashboardCardMenuProps = {
  label: string;
  items: DashboardCardMenuItem[];
};

export function DashboardCardMenu({ label, items }: DashboardCardMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        className="soft-pill flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
        onClick={() => setOpen((value) => !value)}
      >
        <MoreHorizontal className="h-3.5 w-3.5" />
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close dashboard menu"
            className="fixed inset-0 z-20 bg-transparent sm:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-30 overflow-hidden rounded-[16px] border border-white/8 bg-[#111216]/95 p-1 shadow-[0_24px_64px_-32px_rgba(0,0,0,0.82)] backdrop-blur-xl sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-[calc(100%+8px)] sm:w-[188px]">
            {items.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    item.onSelect();
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-[12px] px-2.5 py-2 text-left text-[0.76rem] leading-tight transition",
                    item.active
                      ? "bg-[var(--accent)]/12 text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)] hover:bg-white/[0.05] hover:text-[var(--text-primary)]",
                    item.tone === "accent" && !item.active && "text-[var(--accent)]",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] border border-white/8 bg-white/[0.04]",
                      item.active && "border-[var(--accent)]/18 bg-[var(--accent)]/10 text-[var(--accent)]",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0 truncate font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}

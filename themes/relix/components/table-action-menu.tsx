"use client";

import { MoreHorizontal } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type MenuPosition = {
  top: number;
  left: number;
  ready: boolean;
};

type TableActionMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  minWidth?: number;
  ariaLabel?: string;
  menuClassName?: string;
};

export function TableActionMenu({
  open,
  onOpenChange,
  children,
  minWidth = 200,
  ariaLabel = "Open actions menu",
  menuClassName
}: TableActionMenuProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }

    const updatePosition = () => {
      const button = buttonRef.current;
      if (!button) {
        return;
      }

      const buttonRect = button.getBoundingClientRect();
      const menuWidth = Math.max(menuRef.current?.offsetWidth ?? 0, minWidth);
      const menuHeight = menuRef.current?.offsetHeight ?? 0;
      const viewportPadding = 12;
      const gap = 8;
      const availableBelow = window.innerHeight - buttonRect.bottom - viewportPadding;
      const availableAbove = buttonRect.top - viewportPadding;
      const shouldOpenAbove = menuHeight > 0 && availableBelow < menuHeight + gap && availableAbove > availableBelow;
      const left = Math.min(
        Math.max(buttonRect.right - menuWidth, viewportPadding),
        window.innerWidth - menuWidth - viewportPadding
      );
      const rawTop = shouldOpenAbove
        ? buttonRect.top - menuHeight - gap
        : buttonRect.bottom + gap;
      const maxTop = Math.max(viewportPadding, window.innerHeight - menuHeight - viewportPadding);
      const top = Math.min(Math.max(rawTop, viewportPadding), maxTop);

      setPosition({ top, left, ready: menuHeight > 0 });
    };

    const frameId = window.requestAnimationFrame(updatePosition);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [minWidth, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onOpenChange, open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={(event) => {
          event.stopPropagation();
          onOpenChange(!open);
        }}
        className="rounded-md border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50"
      >
        <MoreHorizontal className="h-3.5 w-3.5" />
      </button>
      {isMounted && open
        ? createPortal(
            <div
              ref={menuRef}
              onClick={(event) => event.stopPropagation()}
              className={cn(
                "fixed z-[80] rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_60px_rgba(15,23,42,0.12)]",
                !position?.ready && "pointer-events-none opacity-0",
                menuClassName
              )}
              style={{
                top: position?.top ?? 0,
                left: position?.left ?? 0,
                minWidth
              }}
            >
              {children}
            </div>,
            document.body
          )
        : null}
    </>
  );
}

"use client";

import { useEffect, type RefObject } from "react";
import { cn } from "@/lib/utils";

type SearchHotkeyTarget = HTMLInputElement | HTMLTextAreaElement;

type CommandKRegistration = {
  enabled: () => boolean;
  focus: () => boolean;
  order: number;
  priority: number;
};

type UseCommandKFocusOptions = {
  enabled?: boolean;
  priority?: number;
  selectText?: boolean;
};

type SearchHotkeyButtonProps = {
  inputRef: RefObject<SearchHotkeyTarget | null>;
  className?: string;
  label?: string;
};

const registrations = new Set<CommandKRegistration>();
let commandKOrder = 0;
let listening = false;

function focusSearchTarget(target: SearchHotkeyTarget | null, selectText: boolean) {
  if (!target || target.disabled || target.getAttribute("aria-disabled") === "true") {
    return false;
  }

  target.focus();
  if (selectText) {
    target.select();
  }
  return true;
}

function handleCommandK(event: KeyboardEvent) {
  if (event.defaultPrevented || !(event.metaKey || event.ctrlKey) || event.altKey || event.key.toLowerCase() !== "k") {
    return;
  }

  const activeRegistration = Array.from(registrations)
    .filter((registration) => registration.enabled())
    .sort((left, right) => right.priority - left.priority || right.order - left.order)
    .find((registration) => registration.focus());

  if (activeRegistration) {
    event.preventDefault();
  }
}

function ensureListener() {
  if (typeof window === "undefined" || listening) {
    return;
  }

  window.addEventListener("keydown", handleCommandK);
  listening = true;
}

function releaseListener() {
  if (typeof window === "undefined" || !listening || registrations.size > 0) {
    return;
  }

  window.removeEventListener("keydown", handleCommandK);
  listening = false;
}

export function useCommandKFocus(
  inputRef: RefObject<SearchHotkeyTarget | null>,
  { enabled = true, priority = 10, selectText = true }: UseCommandKFocusOptions = {}
) {
  useEffect(() => {
    const registration: CommandKRegistration = {
      enabled: () => enabled,
      focus: () => focusSearchTarget(inputRef.current, selectText),
      order: ++commandKOrder,
      priority
    };

    registrations.add(registration);
    ensureListener();

    return () => {
      registrations.delete(registration);
      releaseListener();
    };
  }, [enabled, inputRef, priority, selectText]);
}

export function SearchHotkeyButton({
  inputRef,
  className,
  label = "⌘ + K"
}: SearchHotkeyButtonProps) {
  return (
    <button
      type="button"
      aria-label="Focus search"
      onClick={() => {
        focusSearchTarget(inputRef.current, true);
      }}
      className={cn(
        "absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-500 transition hover:bg-slate-200 hover:text-slate-700",
        className
      )}
    >
      {label}
    </button>
  );
}

"use client";

import type { CSSProperties, InputHTMLAttributes } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

export type AppComboboxOption = {
  id?: string;
  value: string;
  label?: string;
  description?: string;
};

type AppComboboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "children" | "onChange" | "value"> & {
  value: string;
  options: AppComboboxOption[];
  onValueChange: (value: string) => void;
  onOptionSelect?: (option: AppComboboxOption) => void;
  emptyLabel?: string;
  maxVisibleOptions?: number;
};

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

function optionMatches(option: AppComboboxOption, query: string) {
  if (!query) {
    return true;
  }

  return `${option.label || option.value} ${option.description || ""}`.toLowerCase().includes(query);
}

export function AppCombobox({
  className = "",
  disabled = false,
  emptyLabel = "No matches",
  maxVisibleOptions,
  onBlur,
  onFocus,
  onKeyDown,
  onOptionSelect,
  onValueChange,
  options,
  placeholder,
  style,
  value,
  ...inputProps
}: AppComboboxProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuPosition, setMenuPosition] = useState<{ left: number; top: number; width: number; maxHeight: number } | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const query = normalizeSearch(value);

  const visibleOptions = useMemo(() => {
    const matches = options.filter((option) => optionMatches(option, query));
    return typeof maxVisibleOptions === "number" ? matches.slice(0, maxVisibleOptions) : matches;
  }, [maxVisibleOptions, options, query]);

  const selectedValue = normalizeSearch(value);
  const selectedIndex = visibleOptions.findIndex((option) => normalizeSearch(option.value) === selectedValue);

  const updateMenuPosition = () => {
    const input = inputRef.current;
    if (!input) {
      return;
    }

    const rect = input.getBoundingClientRect();
    const viewportPadding = 12;
    const menuWidth = Math.max(rect.width, 240);
    const rowCount = Math.max(1, visibleOptions.length);
    const naturalHeight = Math.min(rowCount * 54 + 12, 328);
    const availableBelow = window.innerHeight - rect.bottom - viewportPadding;
    const availableAbove = rect.top - viewportPadding;
    const placeAbove = availableBelow < naturalHeight && availableAbove > availableBelow;
    const maxHeight = Math.max(56, Math.min(naturalHeight, placeAbove ? availableAbove - 8 : availableBelow - 8));
    const preferredTop = placeAbove ? rect.top - maxHeight - 8 : rect.bottom + 8;

    setMenuPosition({
      left: Math.max(viewportPadding, Math.min(rect.left, window.innerWidth - menuWidth - viewportPadding)),
      top: Math.max(viewportPadding, Math.min(preferredTop, window.innerHeight - maxHeight - viewportPadding)),
      width: menuWidth,
      maxHeight
    });
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    setActiveIndex(Math.max(0, selectedIndex));
  }, [open, selectedIndex]);

  useEffect(() => {
    if (activeIndex >= visibleOptions.length) {
      setActiveIndex(Math.max(0, visibleOptions.length - 1));
    }
  }, [activeIndex, visibleOptions.length]);

  useEffect(() => {
    if (!open) {
      return;
    }

    updateMenuPosition();

    const closeOnPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (inputRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }

      setOpen(false);
    };

    window.addEventListener("pointerdown", closeOnPointerDown);
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("pointerdown", closeOnPointerDown);
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open, visibleOptions.length]);

  const chooseOption = (option: AppComboboxOption) => {
    if (onOptionSelect) {
      onOptionSelect(option);
    } else {
      onValueChange(option.value);
    }

    setOpen(false);
    inputRef.current?.focus();
  };

  const inputStyle: CSSProperties = {
    ...style,
    paddingRight: style?.paddingRight || "2.5rem"
  };

  const menu = open && menuPosition
    ? createPortal(
        <div
          ref={menuRef}
          role="listbox"
          className="fixed z-[100] overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_14px_34px_rgba(15,23,42,0.12)] [scrollbar-color:#dce3ee_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200/80 [&::-webkit-scrollbar-thumb:hover]:bg-slate-300"
          style={{
            left: menuPosition.left,
            top: menuPosition.top,
            width: menuPosition.width,
            maxHeight: menuPosition.maxHeight
          }}
          onMouseDown={(event) => event.preventDefault()}
        >
          {visibleOptions.length ? (
            <div className="grid gap-1">
              {visibleOptions.map((option, index) => {
                const label = option.label || option.value;
                const active = index === activeIndex;
                const selected = normalizeSearch(option.value) === selectedValue;

                return (
                  <button
                    key={option.id || `${option.value}-${index}`}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => chooseOption(option)}
                    className={`flex min-h-11 w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition ${
                      selected
                        ? "border-[#d7e4ff] bg-[#eef4ff] text-[#386df4]"
                        : active
                          ? "border-slate-200 bg-slate-50 text-slate-900"
                          : "border-transparent bg-white text-slate-700"
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{label}</span>
                      {option.description ? <span className="mt-0.5 block truncate text-xs font-medium text-slate-500">{option.description}</span> : null}
                    </span>
                    {selected ? <Check className="h-3.5 w-3.5 shrink-0" /> : null}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-3 py-2 text-sm font-medium text-slate-500">{emptyLabel}</div>
          )}
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <input
        {...inputProps}
        ref={inputRef}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        className={className}
        style={inputStyle}
        onClick={(event) => {
          event.stopPropagation();
          if (!disabled) {
            setOpen(true);
          }
        }}
        onFocus={(event) => {
          onFocus?.(event);
          if (!disabled) {
            setOpen(true);
          }
        }}
        onBlur={(event) => {
          onBlur?.(event);
          window.setTimeout(() => {
            const activeElement = document.activeElement;
            if (activeElement !== inputRef.current && !menuRef.current?.contains(activeElement)) {
              setOpen(false);
            }
          }, 0);
        }}
        onChange={(event) => {
          setActiveIndex(0);
          setOpen(true);
          onValueChange(event.target.value);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || disabled) {
            return;
          }

          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            if (!open) {
              setOpen(true);
              return;
            }

            if (!visibleOptions.length) {
              return;
            }

            setActiveIndex((current) => (event.key === "ArrowDown" ? (current + 1) % visibleOptions.length : (current - 1 + visibleOptions.length) % visibleOptions.length));
          }

          if (event.key === "Enter" && open && visibleOptions[activeIndex]) {
            event.preventDefault();
            chooseOption(visibleOptions[activeIndex]);
          }

          if (event.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      <ChevronDown className={`pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      {menu}
    </>
  );
}

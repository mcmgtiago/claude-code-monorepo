"use client";

import type { CSSProperties, ReactElement, ReactNode, SelectHTMLAttributes } from "react";
import { Children, isValidElement, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

type AppSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: ReactNode;
};

type OptionElementProps = {
  value?: string | number;
  disabled?: boolean;
  children?: ReactNode;
};

type AppSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "multiple" | "size"> & {
  options?: AppSelectOption[];
  onValueChange?: (value: string) => void;
  placeholder?: string;
  menuMinWidth?: number;
  hideMenuIcons?: boolean;
};

function textFromNode(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") {
    return "";
  }

  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(textFromNode).join("");
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return textFromNode(node.props.children);
  }

  return "";
}

function getOptionItems(children: ReactNode, explicitOptions?: AppSelectOption[]): AppSelectOption[] {
  if (explicitOptions) {
    return explicitOptions;
  }

  return Children.toArray(children)
    .filter(isValidElement)
    .map((child) => {
      const option = child as ReactElement<OptionElementProps>;
      const label = textFromNode(option.props.children).trim();
      return {
        value: option.props.value === undefined ? label : String(option.props.value),
        label,
        disabled: option.props.disabled
      };
    });
}

export function AppSelect({
  children,
  className = "",
  disabled = false,
  name,
  id,
  value,
  defaultValue,
  onChange,
  onValueChange,
  options,
  placeholder,
  menuMinWidth = 204,
  hideMenuIcons = false,
  required,
  style,
  title,
  autoFocus,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy
}: AppSelectProps) {
  const items = useMemo(() => getOptionItems(children, options), [children, options]);
  const initialValue = value ?? defaultValue ?? items.find((item) => !item.disabled)?.value ?? "";
  const [internalValue, setInternalValue] = useState(String(initialValue));
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuPosition, setMenuPosition] = useState<{ left: number; top: number; width: number; maxHeight: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const controlled = value !== undefined;
  const selectedValue = controlled ? String(value) : internalValue;
  const selectedIndex = Math.max(0, items.findIndex((item) => item.value === selectedValue));
  const selected = items.find((item) => item.value === selectedValue);
  const displayLabel = selected?.label || placeholder || items[0]?.label || "";

  useEffect(() => {
    if (open) {
      setActiveIndex(selectedIndex);
    }
  }, [open, selectedIndex]);

  const updateMenuPosition = () => {
    const button = buttonRef.current;
    if (!button) {
      return;
    }

    const rect = button.getBoundingClientRect();
    const viewportPadding = 12;
    const menuWidth = Math.max(rect.width, menuMinWidth);
    const naturalHeight = Math.min(Math.max(items.length * 42 + 12, 54), 292);
    const availableBelow = window.innerHeight - rect.bottom - viewportPadding;
    const availableAbove = rect.top - viewportPadding;
    const placeAbove = availableBelow < naturalHeight && availableAbove > availableBelow;
    const maxHeight = Math.max(54, Math.min(naturalHeight, placeAbove ? availableAbove - 8 : availableBelow - 8));
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

    updateMenuPosition();

    const closeOnPointerDown = (event: PointerEvent) => {
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

    window.addEventListener("pointerdown", closeOnPointerDown);
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("pointerdown", closeOnPointerDown);
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open, items.length]);

  const chooseValue = (nextValue: string) => {
    const nextItem = items.find((item) => item.value === nextValue);
    if (!nextItem || nextItem.disabled) {
      return;
    }

    if (!controlled) {
      setInternalValue(nextValue);
    }

    onValueChange?.(nextValue);
    onChange?.({
      target: { value: nextValue, name },
      currentTarget: { value: nextValue, name }
    } as React.ChangeEvent<HTMLSelectElement>);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const moveActive = (direction: 1 | -1) => {
    if (!items.length) {
      return;
    }

    let nextIndex = activeIndex;
    for (let step = 0; step < items.length; step += 1) {
      nextIndex = (nextIndex + direction + items.length) % items.length;
      if (!items[nextIndex]?.disabled) {
        setActiveIndex(nextIndex);
        return;
      }
    }
  };

  const buttonStyle: CSSProperties = {
    ...style,
    backgroundImage: "none",
    paddingRight: style?.paddingRight || "2.5rem"
  };

  const menu = open && menuPosition
    ? createPortal(
        <div
          ref={menuRef}
          role="listbox"
          aria-labelledby={id}
          className="fixed z-[100] overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_14px_34px_rgba(15,23,42,0.12)] [scrollbar-color:#dce3ee_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200/80 [&::-webkit-scrollbar-thumb:hover]:bg-slate-300"
          style={{
            left: menuPosition.left,
            top: menuPosition.top,
            width: menuPosition.width,
            maxHeight: menuPosition.maxHeight
          }}
        >
          <div className="grid gap-1">
            {items.map((item, index) => {
              const active = index === activeIndex;
              const selectedOption = item.value === selectedValue;

              return (
                <button
                  key={`${item.value}-${index}`}
                  type="button"
                  role="option"
                  aria-selected={selectedOption}
                  disabled={item.disabled}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => chooseValue(item.value)}
                  className={`flex min-h-10 w-full items-center gap-2 rounded-lg border px-2.5 text-left text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-45 ${
                    selectedOption
                      ? "border-[#d7e4ff] bg-[#eef4ff] text-[#386df4]"
                      : active
                        ? "border-slate-200 bg-slate-50 text-slate-900"
                        : "border-transparent bg-white text-slate-700"
                  }`}
                >
                  {!hideMenuIcons && item.icon ? <span className="shrink-0">{item.icon}</span> : null}
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {selectedOption ? <Check className="h-3.5 w-3.5 shrink-0" /> : null}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <button
        id={id}
        ref={buttonRef}
        type="button"
        disabled={disabled}
        title={title}
        autoFocus={autoFocus}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-required={required}
        onClick={(event) => {
          event.stopPropagation();
          if (!disabled) {
            setOpen((current) => !current);
          }
        }}
        onKeyDown={(event) => {
          if (disabled) {
            return;
          }

          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            if (!open) {
              setOpen(true);
              return;
            }
            moveActive(event.key === "ArrowDown" ? 1 : -1);
          }

          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (!open) {
              setOpen(true);
              return;
            }
            chooseValue(items[activeIndex]?.value || selectedValue);
          }
        }}
        className={`${className} relative inline-flex items-center text-left disabled:cursor-not-allowed disabled:opacity-60`}
        style={buttonStyle}
      >
        <span className="inline-flex min-w-0 flex-1 items-center gap-2 truncate">
          {selected?.icon ? <span className="shrink-0">{selected.icon}</span> : null}
          {displayLabel}
        </span>
        <ChevronDown className={`pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {name ? <input type="hidden" name={name} value={selectedValue} required={required} /> : null}
      {menu}
    </>
  );
}

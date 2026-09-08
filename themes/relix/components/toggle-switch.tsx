"use client";

import { cn } from "@/lib/utils";

type ToggleSwitchProps = {
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
  className?: string;
};

export function ToggleSwitch({
  checked,
  disabled = false,
  onChange,
  className
}: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border p-[3px] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#386df4]/15",
        disabled
          ? "cursor-not-allowed border-slate-200 bg-slate-100 opacity-60 shadow-none"
          : checked
            ? "border-[#386df4]/35 bg-[linear-gradient(135deg,#5d84ff_0%,#386df4_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_18px_rgba(56,109,244,0.2)]"
            : "border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#e2e8f0_100%)] shadow-[inset_0_1px_1px_rgba(15,23,42,0.08)]",
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full ring-1 ring-black/5 transition-transform duration-200 ease-out",
          disabled
            ? "bg-white shadow-none"
            : checked
              ? "translate-x-5 bg-white shadow-[0_3px_10px_rgba(15,23,42,0.22)]"
              : "translate-x-0 bg-white shadow-[0_3px_10px_rgba(15,23,42,0.22)]"
        )}
      />
    </button>
  );
}

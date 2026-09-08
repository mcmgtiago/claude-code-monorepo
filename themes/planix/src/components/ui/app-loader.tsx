"use client";

import Image from "next/image";

import { useBranding } from "@/components/providers/brand-provider";
import { cn } from "@/lib/utils";

type AppLoaderProps = {
  label?: string;
  detail?: string;
  fullscreen?: boolean;
  compact?: boolean;
  closing?: boolean;
  className?: string;
};

export function AppLoader({
  label = "Loading workspace",
  detail = "Preparing your latest view",
  fullscreen = true,
  compact = false,
  closing = false,
  className,
}: AppLoaderProps) {
  const branding = useBranding();

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        "overflow-hidden",
        fullscreen
          ? "fixed inset-0 z-[140] flex items-center justify-center bg-[color:var(--background)]/92 px-4 backdrop-blur-xl"
          : "flex min-h-[260px] items-center justify-center rounded-[var(--radius-xl)] px-4 py-10",
        "transition-opacity duration-300",
        closing ? "pointer-events-none opacity-0" : "opacity-100",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,138,116,0.2),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.08),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_40%)]" />
      <div className="loader-grid absolute inset-0" />

      <div
        className={cn(
          "loader-panel relative overflow-hidden rounded-[28px] border border-white/8 bg-[rgba(18,19,22,0.78)] backdrop-blur-2xl",
          compact ? "px-8 py-7" : "px-10 py-9 sm:px-12 sm:py-10",
        )}
      >
        <span className="loader-sheen absolute inset-y-0 left-[-45%] w-[42%] rotate-[18deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.11),transparent)]" />

        <div className="relative flex items-center justify-center">
          <div className={cn("relative shrink-0", compact ? "h-[92px] w-[92px]" : "h-[118px] w-[118px]")}>
            <span className="loader-orbit absolute inset-[-10px] rounded-full border border-dashed border-white/10" />
            <span
              className="loader-orbit absolute inset-[-18px] rounded-full border border-white/6"
              style={{ animationDuration: "9s", animationDirection: "reverse" }}
            />

            <div className="absolute inset-[18px] flex items-center justify-center">
              <span className="loader-logo-stroke absolute inset-0" />
              <span className="loader-logo-stroke loader-logo-stroke-delayed absolute inset-0" />
              {branding.logoUrl.startsWith("/") ? (
                <Image
                  src={branding.logoUrl}
                  alt=""
                  width={compact ? 42 : 52}
                  height={compact ? 42 : 52}
                  priority
                  className="relative z-10 h-auto w-auto drop-shadow-[0_8px_18px_rgba(0,0,0,0.28)]"
                />
              ) : (
                <img
                  src={branding.logoUrl}
                  alt=""
                  className="relative z-10 h-[42px] w-[42px] object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.28)]"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type FeedbackToastTone = "auto" | "info" | "success" | "error";
type FeedbackToastPosition = "top-right" | "inline";

function resolveTone(message: string, tone: FeedbackToastTone) {
  if (tone !== "auto") {
    return tone;
  }

  return /unable|invalid|missing|failed|error|do not match|unauthorized|not found/i.test(message) ? "error" : "info";
}

export function FeedbackToast({
  message,
  tone = "auto",
  position = "top-right",
  autoDismissMs = 5000,
  className
}: {
  message: string;
  tone?: FeedbackToastTone;
  position?: FeedbackToastPosition;
  autoDismissMs?: number | false;
  className?: string;
}) {
  const [visible, setVisible] = useState(true);
  const resolvedTone = resolveTone(message, tone);
  const baseInlineClassName = "rounded-2xl border px-4 py-2 text-sm leading-5";
  const baseFloatingClassName =
    "w-fit max-w-[min(42rem,calc(100vw-3rem))] rounded-2xl border px-4 py-2.5 text-sm leading-5 backdrop-blur-[6px]";
  const toneClassName =
    resolvedTone === "error"
      ? "border-[#f3cfc6] bg-[linear-gradient(180deg,rgba(255,250,248,0.98)_0%,rgba(255,242,238,0.98)_100%)] text-[#c96542] shadow-[0_10px_24px_rgba(201,101,66,0.08)]"
      : resolvedTone === "success"
        ? "border-[#cfe2d5] bg-[linear-gradient(180deg,rgba(252,255,253,0.98)_0%,rgba(241,250,244,0.98)_100%)] text-[#2d7a52] shadow-[0_10px_24px_rgba(45,122,82,0.08)]"
        : "border-[#cfdbff] bg-[linear-gradient(180deg,rgba(251,253,255,0.98)_0%,rgba(238,244,255,0.98)_100%)] text-[#315fc4] shadow-[0_10px_24px_rgba(49,95,196,0.08)]";

  useEffect(() => {
    setVisible(true);

    if (autoDismissMs === false || autoDismissMs <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setVisible(false);
    }, autoDismissMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [autoDismissMs, message]);

  if (!visible) {
    return null;
  }

  if (position === "inline") {
    return (
      <div className={cn(baseInlineClassName, toneClassName, className)}>
        {message}
      </div>
    );
  }

  return (
    <div className={cn("pointer-events-none fixed right-6 top-6 z-[80] flex justify-end", className)}>
      <div
        className={cn(
          baseFloatingClassName,
          toneClassName
        )}
      >
        {message}
      </div>
    </div>
  );
}

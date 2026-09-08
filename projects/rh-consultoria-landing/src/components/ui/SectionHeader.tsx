import type { ReactNode } from "react";
import { FadeUp } from "./FadeUp";
import { cn } from "../../lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <FadeUp
      className={cn(
        "mx-auto mb-12 md:mb-16",
        align === "center" ? "max-w-3xl text-center" : "max-w-2xl text-left",
        className
      )}
    >
      {eyebrow && (
        <p className="mb-4 inline-flex rounded-full bg-[var(--color-brand-blue)]/10 px-4 py-2 text-sm font-semibold text-[var(--color-brand-blue)]">
          {eyebrow}
        </p>
      )}
      <h2 className="text-[clamp(2.25rem,6vw,4.5rem)] font-bold tracking-tight text-[var(--color-ink)]">
        {title}
      </h2>
      {description && (
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[var(--color-ink-soft)]">
          {description}
        </p>
      )}
    </FadeUp>
  );
}
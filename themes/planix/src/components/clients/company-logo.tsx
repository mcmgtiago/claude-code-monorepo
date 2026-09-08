"use client";

import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import { getCompanyInitials, getCompanyLogoSources } from "@/lib/company-brand";

type CompanyLogoProps = {
  company: string;
  website: string;
  logoUrl?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizeClasses = {
  sm: "h-10 w-10 rounded-[var(--radius-md)] text-[0.68rem]",
  md: "h-11 w-11 rounded-[var(--radius-md)] text-[0.74rem]",
  lg: "h-16 w-16 rounded-[var(--radius-lg)] text-[0.9rem]",
  xl: "h-22 w-22 rounded-[var(--radius-xl)] text-[1rem]",
} as const;

export function CompanyLogo({
  company,
  website,
  logoUrl,
  size = "md",
  className,
}: CompanyLogoProps) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const logoSources = useMemo(
    () => getCompanyLogoSources(website, logoUrl),
    [logoUrl, website],
  );
  const resolvedLogoUrl = logoSources[sourceIndex] ?? "";
  const initials = useMemo(() => getCompanyInitials(company), [company]);

  useEffect(() => {
    setSourceIndex(0);
  }, [logoSources]);

  function handleImageError() {
    setSourceIndex((current) => current + 1);
  }

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] text-[var(--text-primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
        sizeClasses[size],
        className,
      )}
    >
      {resolvedLogoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolvedLogoUrl}
          alt={company}
          onError={handleImageError}
          className="h-[68%] w-[68%] bg-transparent object-contain"
        />
      ) : (
        <span className="font-semibold uppercase tracking-[0.12em]">{initials}</span>
      )}
    </div>
  );
}

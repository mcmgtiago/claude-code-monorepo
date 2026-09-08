"use client";

import { useState } from "react";
import { initials } from "@/lib/people";

const fallbackPalettes = [
  { background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", color: "#1d4ed8", borderColor: "rgba(59, 130, 246, 0.16)" },
  { background: "linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)", color: "#0f766e", borderColor: "rgba(20, 184, 166, 0.16)" },
  { background: "linear-gradient(135deg, #f5f3ff 0%, #e9d5ff 100%)", color: "#7c3aed", borderColor: "rgba(124, 58, 237, 0.16)" },
  { background: "linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)", color: "#c2410c", borderColor: "rgba(249, 115, 22, 0.18)" },
  { background: "linear-gradient(135deg, #fefce8 0%, #fde68a 100%)", color: "#a16207", borderColor: "rgba(234, 179, 8, 0.2)" },
  { background: "linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%)", color: "#15803d", borderColor: "rgba(34, 197, 94, 0.18)" },
  { background: "linear-gradient(135deg, #fff1f2 0%, #fecdd3 100%)", color: "#be123c", borderColor: "rgba(244, 63, 94, 0.18)" },
  { background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)", color: "#334155", borderColor: "rgba(100, 116, 139, 0.18)" }
] as const;

function getFallbackPalette(value: string) {
  const normalized = value.trim().toLowerCase();
  const hash = normalized.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  return fallbackPalettes[hash % fallbackPalettes.length];
}

export function CompanyLogo({
  name,
  logoUrl,
  className,
  fallbackClassName,
  textClassName = "text-xs"
}: {
  name: string;
  logoUrl?: string | null;
  className: string;
  fallbackClassName: string;
  textClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(logoUrl) && !failed;
  const label = initials(name) || name.trim().slice(0, 2).toUpperCase() || "?";
  const palette = getFallbackPalette(name || label);

  if (showImage) {
    return (
      <img
        src={logoUrl || undefined}
        alt={`${name} logo`}
        className={className}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span
      className={`${className} ${fallbackClassName} ${textClassName}`}
      style={{
        background: palette.background,
        color: palette.color,
        borderColor: palette.borderColor,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)"
      }}
    >
      {label}
    </span>
  );
}

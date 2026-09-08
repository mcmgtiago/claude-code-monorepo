"use client";

import { MapPin } from "lucide-react";

export function CityBadge({ city }: { city: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-text"
      aria-label={`Atendendo em ${city}`}
    >
      <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
      {city}
    </span>
  );
}

export function CityBadgeSkeleton() {
  return <span className="inline-block h-6 w-24 rounded-full bg-surface" aria-hidden="true" />;
}
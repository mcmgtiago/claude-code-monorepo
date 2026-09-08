"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { TenantHeroMedia } from "@/config/tenantTypes";
import { cn } from "@/lib/utils";

export function MediaVideo({ media, className }: { media: TenantHeroMedia; className?: string }) {
  const [canPlayMotion, setCanPlayMotion] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setCanPlayMotion(!query.matches && media.type === "video");
  }, [media.type]);

  if (!canPlayMotion || failed || media.type === "image") {
    return (
      <Image
        src={media.poster || media.src}
        alt={media.alt}
        fill
        priority
        sizes="100vw"
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    <video
      className={cn("h-full w-full object-cover", className)}
      poster={media.poster}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={media.alt}
      onError={() => setFailed(true)}
    >
      <source src={media.src} type="video/mp4" />
    </video>
  );
}

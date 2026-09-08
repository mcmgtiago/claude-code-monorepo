"use client";

import { Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type MeetingProviderLogoId = "GOOGLE_MEET" | "ZOOM" | "MICROSOFT_TEAMS" | "CUSTOM_LINK" | "OUTLOOK" | "GMAIL";

type MeetingProviderLogoProps = {
  provider: MeetingProviderLogoId;
  className?: string;
  iconClassName?: string;
};

const providerLogoSrc: Record<Exclude<MeetingProviderLogoId, "CUSTOM_LINK">, string> = {
  GOOGLE_MEET: "/provider-logos/google-meet.svg",
  ZOOM: "/provider-logos/zoom.svg",
  MICROSOFT_TEAMS: "/provider-logos/microsoft-teams.svg",
  OUTLOOK: "/provider-logos/outlook.svg",
  GMAIL: "/provider-logos/gmail.svg"
};

export function MeetingProviderLogo({ provider, className, iconClassName }: MeetingProviderLogoProps) {
  if (provider === "CUSTOM_LINK") {
    return <Link2 className={cn("h-4.5 w-4.5", iconClassName, className)} aria-hidden="true" />;
  }

  return <img src={providerLogoSrc[provider]} alt="" aria-hidden="true" className={cn("h-5 w-5", iconClassName, className)} />;
}

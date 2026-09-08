import type { MeetingProviderLogoId } from "@/components/meeting-provider-logo";

export type SettingsIntegrationId =
  | "google-meet"
  | "slack"
  | "zoom"
  | "microsoft-teams"
  | "salesforce"
  | "hubspot"
  | "pipedrive"
  | "hubspot-data-enrichment";

export type SettingsIntegrationAvailability = "connected" | "available" | "coming_soon";
export type SettingsIntegrationSetupMode = "google_oauth" | "slack_webhook" | null;
export type SettingsIntegrationActionVariant = "primary" | "secondary" | "muted";

export type SettingsIntegrationItem = {
  id: SettingsIntegrationId;
  name: string;
  description: string;
  availability: SettingsIntegrationAvailability;
  connected: boolean;
  tone: string;
  badge: string;
  providerLogo?: MeetingProviderLogoId;
  setupMode: SettingsIntegrationSetupMode;
  actionLabel: string | null;
  actionVariant: SettingsIntegrationActionVariant;
  disabled?: boolean;
  statusLabel?: string | null;
  detail?: string | null;
};

type SettingsIntegrationMeta = Pick<SettingsIntegrationItem, "id" | "name" | "tone" | "badge" | "providerLogo">;

export const settingsIntegrationCatalog: Record<SettingsIntegrationId, SettingsIntegrationMeta> = {
  "google-meet": {
    id: "google-meet",
    name: "Google Meet",
    tone: "bg-[#eefbf5] text-[#1fa261]",
    badge: "Gm",
    providerLogo: "GOOGLE_MEET"
  },
  slack: {
    id: "slack",
    name: "Slack",
    tone: "bg-[#f4efff] text-[#6c46c7]",
    badge: "Sl"
  },
  zoom: {
    id: "zoom",
    name: "Zoom",
    tone: "bg-[#edf4ff] text-[#2f66e5]",
    badge: "Zm",
    providerLogo: "ZOOM"
  },
  "microsoft-teams": {
    id: "microsoft-teams",
    name: "Microsoft Teams",
    tone: "bg-[#f3efff] text-[#6454d8]",
    badge: "Ms",
    providerLogo: "MICROSOFT_TEAMS"
  },
  salesforce: {
    id: "salesforce",
    name: "Salesforce",
    tone: "bg-[#eef7ff] text-[#1e8ce6]",
    badge: "Sf"
  },
  hubspot: {
    id: "hubspot",
    name: "HubSpot",
    tone: "bg-[#fff3ec] text-[#f46c3f]",
    badge: "Hs"
  },
  pipedrive: {
    id: "pipedrive",
    name: "Pipedrive",
    tone: "bg-[#f5f6f7] text-[#2f343b]",
    badge: "Pd"
  },
  "hubspot-data-enrichment": {
    id: "hubspot-data-enrichment",
    name: "HubSpot Data Enrichment",
    tone: "bg-[#fff3ec] text-[#f46c3f]",
    badge: "Hs"
  }
};

export const comingSoonIntegrationIds = [
  "zoom",
  "microsoft-teams",
  "salesforce",
  "hubspot",
  "pipedrive",
  "hubspot-data-enrichment"
] as const satisfies readonly Exclude<SettingsIntegrationId, "google-meet" | "slack">[];

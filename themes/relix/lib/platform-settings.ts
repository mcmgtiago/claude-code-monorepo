import "server-only";

import { cache } from "react";
import { prisma } from "@/lib/prisma";

export type PlatformSettings = {
  appName: string;
  appDescription: string;
  appLogoUrl: string;
  appUrl: string;
  supportEmail: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  imapHost: string;
  imapPort: string;
  imapUser: string;
  imapPass: string;
  imapSecure: boolean;
  googleClientId: string;
  googleClientSecret: string;
  openAiApiKey: string;
  openAiModel: string;
  openTrackingEnabled: boolean;
  clickTrackingEnabled: boolean;
};

function normalizeString(value: string | null | undefined) {
  const trimmed = (value || "").trim();
  return trimmed || "";
}

function normalizePort(value: string | number | null | undefined, fallback = "") {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  const normalized = normalizeString(typeof value === "string" ? value : "");
  return normalized || fallback;
}

export const getPlatformSettings = cache(async (): Promise<PlatformSettings> => {
  const stored = await prisma.platformSetting.findUnique({
    where: { id: "platform" }
  });

  return {
    appName: normalizeString(stored?.appName) || normalizeString(process.env.APP_NAME) || "Relix",
    appDescription: normalizeString(stored?.appDescription),
    appLogoUrl: stored?.appLogoData ? `/api/superuser/platform/logo` : "",
    appUrl:
      normalizeString(stored?.appUrl) ||
      normalizeString(process.env.NEXT_PUBLIC_APP_URL) ||
      normalizeString(process.env.APP_URL) ||
      normalizeString(process.env.NEXTAUTH_URL),
    supportEmail: normalizeString(stored?.supportEmail),
    smtpHost: normalizeString(stored?.smtpHost) || normalizeString(process.env.SMTP_HOST),
    smtpPort: normalizePort(stored?.smtpPort, normalizePort(process.env.SMTP_PORT, "587")),
    smtpUser: normalizeString(stored?.smtpUser) || normalizeString(process.env.SMTP_USER),
    smtpPass: normalizeString(stored?.smtpPass) || normalizeString(process.env.SMTP_PASS),
    smtpFrom: normalizeString(stored?.smtpFrom) || normalizeString(process.env.SMTP_FROM),
    imapHost: normalizeString(stored?.imapHost) || normalizeString(process.env.IMAP_HOST),
    imapPort: normalizePort(stored?.imapPort, normalizePort(process.env.IMAP_PORT, "993")),
    imapUser: normalizeString(stored?.imapUser) || normalizeString(process.env.IMAP_USER),
    imapPass: normalizeString(stored?.imapPass) || normalizeString(process.env.IMAP_PASS),
    imapSecure: typeof stored?.imapSecure === "boolean" ? stored.imapSecure : process.env.IMAP_SECURE ? process.env.IMAP_SECURE !== "false" : true,
    googleClientId: normalizeString(stored?.googleClientId) || normalizeString(process.env.GOOGLE_CLIENT_ID),
    googleClientSecret: normalizeString(stored?.googleClientSecret) || normalizeString(process.env.GOOGLE_CLIENT_SECRET),
    openAiApiKey: normalizeString(stored?.openAiApiKey) || normalizeString(process.env.OPENAI_API_KEY),
    openAiModel: normalizeString(stored?.openAiModel) || normalizeString(process.env.OPENAI_MODEL) || "gpt-5-mini",
    openTrackingEnabled: stored?.openTrackingEnabled ?? true,
    clickTrackingEnabled: stored?.clickTrackingEnabled ?? true
  };
});

export function isPlatformSmtpConfigured(settings: Pick<PlatformSettings, "smtpHost" | "smtpPort" | "smtpUser" | "smtpPass" | "smtpFrom">) {
  return Boolean(settings.smtpHost && settings.smtpPort && settings.smtpUser && settings.smtpPass && settings.smtpFrom);
}

export function isPlatformImapConfigured(settings: Pick<PlatformSettings, "imapHost" | "imapPort" | "imapUser" | "imapPass">) {
  return Boolean(settings.imapHost && settings.imapPort && settings.imapUser && settings.imapPass);
}

export function isPlatformGoogleConfigured(settings: Pick<PlatformSettings, "googleClientId" | "googleClientSecret">) {
  return Boolean(settings.googleClientId && settings.googleClientSecret);
}

export function isPlatformOpenAiConfigured(settings: Pick<PlatformSettings, "openAiApiKey">) {
  return Boolean(settings.openAiApiKey);
}

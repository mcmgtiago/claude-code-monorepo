export type AppBrandingSettings = {
  appName: string;
  companyName: string;
  appTagline: string;
  logoUrl: string;
  supportEmail: string;
  primaryDomain: string;
  marketingSiteUrl: string;
};

export type AppSmtpSettings = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  contactToEmail: string;
};

export type AppPlatformSettings = {
  allowNewSignups: boolean;
};

export type AppServiceSettings = {
  googleClientId: string;
  googleClientSecret: string;
  webrtcIceServers: string;
  turnUrl: string;
  turnUsername: string;
  turnCredential: string;
};

export type AppMasterSettings = {
  branding: AppBrandingSettings;
  smtp: AppSmtpSettings;
  platform: AppPlatformSettings;
  services: AppServiceSettings;
};

export type AppEmailBranding = AppBrandingSettings & {
  absoluteLogoUrl: string;
  subjectPrefix: string;
};

export type AppPublicRuntimeSettings = {
  localGoogleAuthEnabled: boolean;
  rtcIceServers: RTCIceServer[];
};

type AppAdminSettingsRow = {
  app_name: string | null;
  company_name: string | null;
  app_tagline: string | null;
  logo_url: string | null;
  support_email: string | null;
  primary_domain: string | null;
  marketing_site_url: string | null;
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_user: string | null;
  smtp_pass: string | null;
  smtp_from: string | null;
  contact_to_email: string | null;
  allow_new_signups: boolean | null;
  google_client_id: string | null;
  google_client_secret: string | null;
  webrtc_ice_servers: string | null;
  turn_url: string | null;
  turn_username: string | null;
  turn_credential: string | null;
};

function readEnv(name: string) {
  return process.env[name]?.trim() ?? "";
}

function readEnvNumber(name: string, fallback: number) {
  const raw = process.env[name]?.trim();

  if (!raw) {
    return fallback;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function getAppConfigDbPool() {
  const { getDbPool } = await import("@/lib/db");
  return getDbPool();
}

export function defaultAppBrandingSettings(): AppBrandingSettings {
  return {
    appName: readEnv("PLANIX_APP_NAME") || "Planix",
    companyName: readEnv("PLANIX_COMPANY_NAME") || "Your Company",
    appTagline: readEnv("PLANIX_APP_TAGLINE") || "Projects, people, delivery, and client work in one workspace.",
    logoUrl: readEnv("PLANIX_LOGO_URL") || "/logo.svg",
    supportEmail: readEnv("PLANIX_SUPPORT_EMAIL") || readEnv("CONTACT_TO_EMAIL"),
    primaryDomain: readEnv("PLANIX_PRIMARY_DOMAIN") || readEnv("NEXT_PUBLIC_APP_URL") || "http://localhost:3000",
    marketingSiteUrl: readEnv("PLANIX_MARKETING_SITE_URL") || "https://example.com",
  };
}

export function defaultAppSmtpSettings(): AppSmtpSettings {
  return {
    host: readEnv("SMTP_HOST"),
    port: readEnvNumber("SMTP_PORT", 587),
    user: readEnv("SMTP_USER"),
    pass: readEnv("SMTP_PASS"),
    from: readEnv("SMTP_FROM"),
    contactToEmail: readEnv("CONTACT_TO_EMAIL"),
  };
}

export function defaultAppPlatformSettings(): AppPlatformSettings {
  return {
    allowNewSignups: true,
  };
}

export function defaultAppServiceSettings(): AppServiceSettings {
  return {
    googleClientId: readEnv("NEXT_PUBLIC_GOOGLE_CLIENT_ID"),
    googleClientSecret: readEnv("GOOGLE_CLIENT_SECRET"),
    webrtcIceServers: readEnv("NEXT_PUBLIC_WEBRTC_ICE_SERVERS"),
    turnUrl: readEnv("NEXT_PUBLIC_TURN_URL"),
    turnUsername: readEnv("NEXT_PUBLIC_TURN_USERNAME"),
    turnCredential: readEnv("NEXT_PUBLIC_TURN_CREDENTIAL"),
  };
}

export function defaultAppMasterSettings(): AppMasterSettings {
  return {
    branding: defaultAppBrandingSettings(),
    smtp: defaultAppSmtpSettings(),
    platform: defaultAppPlatformSettings(),
    services: defaultAppServiceSettings(),
  };
}

function normalizeText(value: string | null | undefined, fallback = "") {
  return value?.trim() || fallback;
}

function normalizePort(value: number | null | undefined, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function defaultRtcIceServers(): RTCIceServer[] {
  return [
    { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
  ];
}

function parseRtcIceServers(value: string | null | undefined) {
  const raw = value?.trim();

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as RTCIceServer[];

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

export function resolveRtcIceServers(services: AppServiceSettings): RTCIceServer[] {
  const parsed = parseRtcIceServers(services.webrtcIceServers);

  if (parsed) {
    return parsed;
  }

  if (services.turnUrl.trim()) {
    return [
      ...defaultRtcIceServers(),
      {
        urls: services.turnUrl.trim(),
        username: services.turnUsername.trim() || undefined,
        credential: services.turnCredential.trim() || undefined,
      },
    ];
  }

  return defaultRtcIceServers();
}

export function isLocalGoogleAuthConfigured(services: AppServiceSettings) {
  return Boolean(services.googleClientId.trim() && services.googleClientSecret.trim());
}

export async function ensureAppAdminSettings() {
  const pool = await getAppConfigDbPool();
  await pool.query(
    `
      insert into public.app_admin_settings (id)
      values (1)
      on conflict (id) do nothing
    `,
  );
}

async function readAppAdminSettingsRow() {
  try {
    await ensureAppAdminSettings();
    const pool = await getAppConfigDbPool();
    const result = await pool.query<AppAdminSettingsRow>(
      `
        select
          app_name,
          company_name,
          app_tagline,
          logo_url,
          support_email,
          primary_domain,
          marketing_site_url,
          smtp_host,
          smtp_port,
          smtp_user,
          smtp_pass,
          smtp_from,
          contact_to_email,
          allow_new_signups,
          google_client_id,
          google_client_secret,
          webrtc_ice_servers,
          turn_url,
          turn_username,
          turn_credential
        from public.app_admin_settings
        where id = 1
        limit 1
      `,
    );

    return result.rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function getAppMasterSettings(): Promise<AppMasterSettings> {
  const row = await readAppAdminSettingsRow();
  const defaults = defaultAppMasterSettings();

  return {
    branding: {
      appName: normalizeText(row?.app_name, defaults.branding.appName),
      companyName: normalizeText(row?.company_name, defaults.branding.companyName),
      appTagline: normalizeText(row?.app_tagline, defaults.branding.appTagline),
      logoUrl: normalizeText(row?.logo_url, defaults.branding.logoUrl),
      supportEmail: normalizeText(row?.support_email, defaults.branding.supportEmail),
      primaryDomain: normalizeText(row?.primary_domain, defaults.branding.primaryDomain),
      marketingSiteUrl: normalizeText(row?.marketing_site_url, defaults.branding.marketingSiteUrl),
    },
    smtp: {
      host: normalizeText(row?.smtp_host, defaults.smtp.host),
      port: normalizePort(row?.smtp_port, defaults.smtp.port),
      user: normalizeText(row?.smtp_user, defaults.smtp.user),
      pass: normalizeText(row?.smtp_pass, defaults.smtp.pass),
      from: normalizeText(row?.smtp_from, defaults.smtp.from),
      contactToEmail: normalizeText(row?.contact_to_email, defaults.smtp.contactToEmail),
    },
    platform: {
      allowNewSignups: row?.allow_new_signups ?? defaults.platform.allowNewSignups,
    },
    services: {
      googleClientId: normalizeText(row?.google_client_id, defaults.services.googleClientId),
      googleClientSecret: normalizeText(row?.google_client_secret, defaults.services.googleClientSecret),
      webrtcIceServers: normalizeText(row?.webrtc_ice_servers, defaults.services.webrtcIceServers),
      turnUrl: normalizeText(row?.turn_url, defaults.services.turnUrl),
      turnUsername: normalizeText(row?.turn_username, defaults.services.turnUsername),
      turnCredential: normalizeText(row?.turn_credential, defaults.services.turnCredential),
    },
  };
}

export async function getAppBrandingSettings() {
  const settings = await getAppMasterSettings();
  return settings.branding;
}

export async function getAppSmtpSettings() {
  const settings = await getAppMasterSettings();
  return settings.smtp;
}

export async function getAppPlatformSettings() {
  const settings = await getAppMasterSettings();
  return settings.platform;
}

export async function getAppServiceSettings() {
  const settings = await getAppMasterSettings();
  return settings.services;
}

export async function getAppPublicRuntimeSettings(): Promise<AppPublicRuntimeSettings> {
  const services = await getAppServiceSettings();

  return {
    localGoogleAuthEnabled: isLocalGoogleAuthConfigured(services),
    rtcIceServers: resolveRtcIceServers(services),
  };
}

function resolveAbsoluteAssetUrl(assetUrl: string, origin: string) {
  try {
    return new URL(assetUrl, origin).toString();
  } catch {
    return assetUrl;
  }
}

export async function getAppEmailBranding(fallbackOrigin?: string): Promise<AppEmailBranding> {
  const branding = await getAppBrandingSettings();
  const origin = branding.primaryDomain || fallbackOrigin || "http://localhost:3000";

  return {
    ...branding,
    absoluteLogoUrl: resolveAbsoluteAssetUrl(branding.logoUrl || "/logo.svg", origin),
    subjectPrefix: `[${branding.appName}]`,
  };
}

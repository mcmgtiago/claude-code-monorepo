export type WorkspaceLocalizationSettings = {
  countryCode: string;
  timezone: string;
  currencyCode: string;
  locale: string;
  dateFormat: string;
  timeFormat: string;
  weekStartsOn: string;
};

export const defaultLocalizationSettings: WorkspaceLocalizationSettings = {
  countryCode: "IN",
  timezone: "Asia/Kolkata",
  currencyCode: "INR",
  locale: "en-IN",
  dateFormat: "DD MMM YYYY",
  timeFormat: "12h",
  weekStartsOn: "Monday"
};

export function normalizeLocalizationSettings(
  settings?:
    | Partial<WorkspaceLocalizationSettings>
    | {
        countryCode?: string | null;
        timezone?: string | null;
        currencyCode?: string | null;
        locale?: string | null;
        dateFormat?: string | null;
        timeFormat?: string | null;
        weekStartsOn?: string | null;
      }
    | null
): WorkspaceLocalizationSettings {
  return {
    countryCode: settings?.countryCode || defaultLocalizationSettings.countryCode,
    timezone: settings?.timezone || defaultLocalizationSettings.timezone,
    currencyCode: settings?.currencyCode || defaultLocalizationSettings.currencyCode,
    locale: settings?.locale || defaultLocalizationSettings.locale,
    dateFormat: settings?.dateFormat || defaultLocalizationSettings.dateFormat,
    timeFormat: settings?.timeFormat || defaultLocalizationSettings.timeFormat,
    weekStartsOn: settings?.weekStartsOn || defaultLocalizationSettings.weekStartsOn
  };
}

function toDate(value: string | Date | number) {
  return value instanceof Date ? value : new Date(value);
}

function formatParts(
  value: string | Date | number,
  settings: WorkspaceLocalizationSettings,
  options: Intl.DateTimeFormatOptions
) {
  const formatter = new Intl.DateTimeFormat(settings.locale, {
    timeZone: settings.timezone,
    ...options
  });

  return formatter.formatToParts(toDate(value));
}

function getPart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) {
  return parts.find((part) => part.type === type)?.value || "";
}

export function formatLocalizedCurrency(
  value: number,
  settings: WorkspaceLocalizationSettings,
  options?: { maximumFractionDigits?: number }
) {
  return new Intl.NumberFormat(settings.locale, {
    style: "currency",
    currency: settings.currencyCode,
    maximumFractionDigits: options?.maximumFractionDigits ?? 0
  }).format(value);
}

export function formatLocalizedMonth(
  value: string | Date | number,
  settings: WorkspaceLocalizationSettings,
  month: "short" | "long" = "short"
) {
  return new Intl.DateTimeFormat(settings.locale, {
    timeZone: settings.timezone,
    month
  }).format(toDate(value));
}

export function formatLocalizedDate(
  value: string | Date | number,
  settings: WorkspaceLocalizationSettings,
  variant: "default" | "monthDay" = "default"
) {
  if (variant === "monthDay") {
    return new Intl.DateTimeFormat(settings.locale, {
      timeZone: settings.timezone,
      month: "short",
      day: "numeric"
    }).format(toDate(value));
  }

  const parts = formatParts(value, settings, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  const year = getPart(parts, "year");
  const month = getPart(parts, "month");
  const day = getPart(parts, "day");
  const monthShort = new Intl.DateTimeFormat(settings.locale, {
    timeZone: settings.timezone,
    month: "short"
  }).format(toDate(value));

  switch (settings.dateFormat) {
    case "MMM DD, YYYY":
      return `${monthShort} ${day}, ${year}`;
    case "DD/MM/YYYY":
      return `${day}/${month}/${year}`;
    case "MM/DD/YYYY":
      return `${month}/${day}/${year}`;
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;
    case "DD MMM YYYY":
    default:
      return `${day} ${monthShort} ${year}`;
  }
}

export function formatLocalizedTime(value: string | Date | number, settings: WorkspaceLocalizationSettings) {
  const parts = formatParts(value, settings, {
    hour: "numeric",
    minute: "2-digit",
    hour12: settings.timeFormat === "12h"
  });

  const hour = getPart(parts, "hour");
  const minute = getPart(parts, "minute");
  const dayPeriod = getPart(parts, "dayPeriod");

  if (settings.timeFormat === "24h") {
    return `${hour.padStart(2, "0")}:${minute}`;
  }

  return `${hour}:${minute}${dayPeriod ? ` ${dayPeriod.toUpperCase()}` : ""}`;
}

export function formatLocalizedDateTime(value: string | Date | number, settings: WorkspaceLocalizationSettings) {
  return `${formatLocalizedDate(value, settings)} • ${formatLocalizedTime(value, settings)}`;
}

export function formatLocalizedTimeRange(
  start: string | Date | number,
  end: string | Date | number,
  settings: WorkspaceLocalizationSettings
) {
  return `${formatLocalizedTime(start, settings)} - ${formatLocalizedTime(end, settings)}`;
}

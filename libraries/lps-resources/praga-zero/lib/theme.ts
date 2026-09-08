import type { CSSProperties } from "react";

export type ThemeInput = {
  primary: string;
  danger: string;
  warning: string;
  bg: string;
  text: string;
  muted: string;
  surface: string;
  radius?: string;
};

const HEX_RE = /^#?([a-f\d]{3}|[a-f\d]{6})$/i;

export function normalizeHex(hex: string): string {
  const value = hex.trim();
  if (!HEX_RE.test(value)) return "#25D366";
  const raw = value.replace("#", "");
  if (raw.length === 3) {
    return `#${raw.split("").map((c) => `${c}${c}`).join("")}`.toUpperCase();
  }
  return `#${raw}`.toUpperCase();
}

export function hexToHsl(hex: string): string {
  const normalized = normalizeHex(hex).replace("#", "");
  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function buildThemeCss(theme: ThemeInput): string {
  const radius = theme.radius || "0.75rem";
  return `
:root {
  --primary: ${hexToHsl(theme.primary)};
  --primary-foreground: 0 0% 100%;
  --danger: ${hexToHsl(theme.danger)};
  --warning: ${hexToHsl(theme.warning)};
  --bg: ${hexToHsl(theme.bg)};
  --text: ${hexToHsl(theme.text)};
  --muted: ${hexToHsl(theme.muted)};
  --surface: ${hexToHsl(theme.surface)};
  --border: 220 13% 91%;
  --ring: ${hexToHsl(theme.primary)};
  --radius: ${radius};
}`;
}

export function themeToInlineVars(theme: ThemeInput): CSSProperties {
  return {
    "--primary": hexToHsl(theme.primary),
    "--primary-foreground": "0 0% 100%",
    "--danger": hexToHsl(theme.danger),
    "--warning": hexToHsl(theme.warning),
    "--bg": hexToHsl(theme.bg),
    "--text": hexToHsl(theme.text),
    "--muted": hexToHsl(theme.muted),
    "--surface": hexToHsl(theme.surface),
    "--border": "220 13% 91%",
    "--ring": hexToHsl(theme.primary),
    "--radius": theme.radius || "0.75rem",
  } as CSSProperties;
}

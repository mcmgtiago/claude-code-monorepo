// Idioma das páginas públicas (cliente final): auto-detecção + locales.
import { ptBR, enUS, es } from "date-fns/locale";

export type Lang = "pt" | "en" | "es";
export const LANGS: { code: Lang; flag: string }[] = [
  { code: "en", flag: "🇺🇸" }, { code: "pt", flag: "🇧🇷" }, { code: "es", flag: "🇪🇸" },
];
export const DF: Record<Lang, any> = { pt: ptBR, en: enUS, es };

export function detectLang(): Lang {
  if (typeof navigator === "undefined") return "en";
  const l = (navigator.language || "en").slice(0, 2).toLowerCase();
  return l === "pt" ? "pt" : l === "es" ? "es" : "en";
}

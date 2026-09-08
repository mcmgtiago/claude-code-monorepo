import { buildThemeCss, type ThemeInput } from "@/lib/theme";

export function ThemeProvider({ theme }: { theme: ThemeInput }) {
  return <style id="tenant-theme" dangerouslySetInnerHTML={{ __html: buildThemeCss(theme) }} />;
}

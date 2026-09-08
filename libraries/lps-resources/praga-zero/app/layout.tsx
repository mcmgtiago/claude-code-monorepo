import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/siteConfig";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://pragazero.com.br"),
  title: `${siteConfig.company.name} — Dedetização 24h`,
  description: siteConfig.company.shortDescription,
  openGraph: {
    title: `${siteConfig.company.name} — Dedetização 24h`,
    description: siteConfig.company.shortDescription,
    images: ["/og-image.svg"],
    locale: "pt_BR",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        <ThemeProvider theme={siteConfig.theme} />
        <link rel="preconnect" href="https://images.pexels.com" />
        <link rel="preconnect" href="https://videos.pexels.com" />
      </head>
      <body className={inter.variable}>{children}</body>
    </html>
  );
}

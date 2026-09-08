import type { Metadata } from "next";
import { unstable_noStore } from "next/cache";
import { AppShell } from "@/components/app-shell";
import { getCurrentUser } from "@/lib/auth-server";
import { getPlatformSettings } from "@/lib/platform-settings";
import "./globals.css";

export const dynamic = "force-dynamic";

const publicAppUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(publicAppUrl),
  title: {
    default: "Relix | Best CRM Software",
    template: "Relix | %s"
  },
  description: "Relix is the best modern CRM software to streamline your workflow. Seamlessly manage sales pipelines, contacts, companies, team meetings, tasks, and generate professional invoices in one workspace.",
  keywords: [
    "best crm", 
    "crm software", 
    "Relix", 
    "sales pipeline management", 
    "lead management", 
    "customer relationship management", 
    "sales task management", 
    "modern CRM", 
    "team collaboration CRM",
    "invoice generator for small business",
    "opportunity management",
    "sales forecasting"
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: publicAppUrl,
    title: "Relix | Best CRM Software",
    description: "Relix is the best modern CRM software to streamline your workflow. Seamlessly manage sales pipelines, contacts, companies, team meetings, tasks, and invoices.",
    siteName: "Relix",
  },
  twitter: {
    card: "summary_large_image",
    title: "Relix | Best CRM Software",
    description: "Relix is the best modern CRM software to streamline your workflow. Seamlessly manage sales pipelines, contacts, companies, team meetings, tasks, and invoices.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" }
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }]
  }
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  unstable_noStore();
  const [currentUser, platform] = await Promise.all([getCurrentUser(), getPlatformSettings()]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppShell 
          currentUser={currentUser} 
          appName={platform.appName} 
          appLogoUrl={platform.appLogoUrl} 
        >
          {children}
        </AppShell>
      </body>
    </html>
  );
}

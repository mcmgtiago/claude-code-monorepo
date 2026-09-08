import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import { BrandProvider } from "@/components/providers/brand-provider";
import { RouteLoaderProvider } from "@/components/providers/route-loader-provider";
import { getAppBrandingSettings } from "@/lib/app-config";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getAppBrandingSettings();

  return {
    title: `${branding.companyName} | ${branding.appName}`,
    description: branding.appTagline || `${branding.appName} workspace for projects, tasks, people, notifications, and team collaboration.`,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const branding = await getAppBrandingSettings();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.variable} antialiased`}>
        <BrandProvider value={branding}>
          <RouteLoaderProvider>
            {children}
          </RouteLoaderProvider>
        </BrandProvider>
      </body>
    </html>
  );
}

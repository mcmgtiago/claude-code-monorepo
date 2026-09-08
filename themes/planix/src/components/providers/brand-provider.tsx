"use client";

import { createContext, useContext } from "react";

import type { AppBrandingSettings } from "@/lib/app-config";

const defaultBranding: AppBrandingSettings = {
  appName: "Planix",
  companyName: "Your Company",
  appTagline: "Projects, people, delivery, and client work in one workspace.",
  logoUrl: "/logo.svg",
  supportEmail: "",
  primaryDomain: "http://localhost:3000",
  marketingSiteUrl: "https://example.com",
};

const BrandContext = createContext<AppBrandingSettings>(defaultBranding);

export function BrandProvider({
  value,
  children,
}: {
  value: AppBrandingSettings;
  children: React.ReactNode;
}) {
  return (
    <BrandContext.Provider value={value}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBranding() {
  return useContext(BrandContext);
}

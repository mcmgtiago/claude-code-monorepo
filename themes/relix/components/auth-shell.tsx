"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import forgotArtwork from "@/public/images/auth-page/recovery.webp";
import loginArtwork from "@/public/images/auth-page/signin.webp";
import signupArtwork from "@/public/images/auth-page/signup.webp";
import { AppLogo } from "@/components/app-logo";

type AuthArtworkVariant = "login" | "signup" | "forgot";

type AuthShellProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  compact?: boolean;
  variant?: "split" | "centered";
  highlights?: string[];
  appName?: string;
  appLogoUrl?: string;
  artwork?: AuthArtworkVariant;
};

function artworkCopy(variant: AuthArtworkVariant, appName: string) {
  if (variant === "signup") {
    return {
      title: `Start clean with ${appName}.`,
      description: "Create the workspace once, then bring leads, contacts, and tasks into the same flow."
    };
  }

  if (variant === "forgot") {
    return {
      title: "Back in a few steps.",
      description: "Reset access securely and return to the CRM workspace without losing momentum."
    };
  }

  return {
    title: `Welcome back to ${appName}.`,
    description: "Your pipeline, meetings, and team updates are ready when you sign in."
  };
}

function resolveArtworkSource(variant: AuthArtworkVariant): StaticImageData {
  if (variant === "signup") {
    return signupArtwork;
  }

  if (variant === "forgot") {
    return forgotArtwork;
  }

  return loginArtwork;
}

function AuthPattern({
  source,
  revealArtwork,
  onImageLoad,
  compact = false
}: {
  source: StaticImageData;
  revealArtwork: boolean;
  onImageLoad: () => void;
  compact?: boolean;
}) {
  return (
    <div className="auth-pattern-stage absolute inset-0 overflow-hidden">
      <div className={`auth-artwork-loader absolute inset-0 transition-opacity duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${revealArtwork ? "opacity-0" : "opacity-100"}`} />
      <Image
        key={`${compact ? "mobile" : "desktop"}-${source.src}`}
        src={source}
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes={compact ? "100vw" : "(min-width: 1024px) 53vw, 100vw"}
        placeholder="blur"
        onLoad={onImageLoad}
        className={`auth-artwork-image object-cover object-left ${revealArtwork ? "is-loaded" : ""}`}
      />
      <div className="auth-pattern-photo-wash absolute inset-0" />
    </div>
  );
}

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
  compact = false,
  highlights = [],
  appName = "Relix",
  appLogoUrl = "",
  artwork = "login"
}: AuthShellProps) {
  const copy = artworkCopy(artwork, appName);
  const artworkSource = resolveArtworkSource(artwork);
  const [desktopImageReady, setDesktopImageReady] = useState(false);
  const [mobileImageReady, setMobileImageReady] = useState(false);
  const [introActive, setIntroActive] = useState(false);

  useEffect(() => {
    setDesktopImageReady(false);
    setMobileImageReady(false);
    setIntroActive(false);

    const timer = window.setTimeout(() => {
      setIntroActive(true);
    }, 140);

    return () => window.clearTimeout(timer);
  }, [artworkSource.src]);

  const revealDesktopArtwork = desktopImageReady && introActive;
  const revealMobileArtwork = mobileImageReady && introActive;

  return (
    <main className="min-h-[100dvh] overflow-hidden bg-[radial-gradient(circle_at_top,rgba(56,109,244,0.14),transparent_26%),linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)]">
      <div className="grid min-h-[100dvh] lg:grid-cols-[1.06fr_0.94fr]">
        <section className="relative hidden min-h-[100dvh] overflow-hidden bg-[#e9f3ff] lg:block">
          <AuthPattern
            source={artworkSource}
            revealArtwork={revealDesktopArtwork}
            onImageLoad={() => setDesktopImageReady(true)}
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-start p-8 xl:p-12">
            <div className="max-w-[26rem] rounded-2xl border border-slate-200 bg-white/65 px-6 py-5 text-left shadow-[0_10px_30px_rgba(15,23,42,0.04)] backdrop-blur-xl">
              <p className="text-[1.6rem] font-semibold leading-tight text-slate-950">{copy.title}</p>
              <p className="mt-3 max-w-[22rem] text-[0.95rem] leading-6 text-slate-600">{copy.description}</p>
            </div>
          </div>
        </section>

        <section className={`auth-form-section relative isolate flex min-h-[100dvh] items-center justify-center overflow-y-auto px-4 py-5 sm:px-8 lg:px-10 ${compact ? "lg:py-6" : "lg:py-8"}`}>
          <div className="auth-mobile-artwork absolute inset-x-0 top-0 overflow-hidden lg:hidden">
            <AuthPattern
              source={artworkSource}
              revealArtwork={revealMobileArtwork}
              onImageLoad={() => setMobileImageReady(true)}
              compact
            />
            <div className="auth-mobile-artwork-fade absolute inset-0" />
          </div>

          <div className="relative w-full max-w-[364px]">
            <div className="mb-6 flex flex-col items-start text-left">
              <div className="flex items-center gap-2.5">
                <AppLogo src={appLogoUrl || undefined} className="h-14 w-[44px] shrink-0" />
                <div className="flex items-center gap-1.5">
                  <div className="text-[1.82rem] font-semibold tracking-tight text-slate-900">{appName}</div>
                  <span className="mt-0.5 self-start rounded-full border border-[#cfe0ff] bg-[#eef4ff] px-1.5 py-0.5 text-[0.5rem] font-semibold uppercase tracking-[0.22em] text-[#386df4]">
                    CRM
                  </span>
                </div>
              </div>
              {eyebrow ? <div className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">{eyebrow}</div> : null}
            </div>

            <div className="text-left">
              <h1 className="text-[2rem] font-semibold tracking-tight text-slate-900 sm:text-[2.25rem]">{title}</h1>
              <p className="mt-3 max-w-[380px] text-sm leading-6 text-slate-500">{description}</p>
            </div>

            {highlights.length ? (
              <div className="mt-5 flex flex-wrap items-center justify-start gap-2">
                {highlights.map((item) => (
                  <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                    {item}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-6">
              {children}
            </div>
            {footer ? <div className="mt-6 text-sm text-slate-500">{footer}</div> : null}
          </div>
        </section>
      </div>
    </main>
  );
}

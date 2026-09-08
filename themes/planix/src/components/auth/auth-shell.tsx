"use client";

import forgotArtwork from "../../../public/auth-images/recovery.jpg";
import loginArtwork from "../../../public/auth-images/signin.jpg";
import signupArtwork from "../../../public/auth-images/signup.jpg";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Phone,
  Search,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useBranding } from "@/components/providers/brand-provider";
import { cn } from "@/lib/utils";

type AuthArtworkVariant = "signup" | "login" | "forgot";

function artworkCopy(variant: AuthArtworkVariant, appName: string) {
  if (variant === "signup") {
    return {
      title: `A simple place to begin with ${appName}.`,
      description: "Set up your space, bring in your team, and start working without the noise.",
    };
  }

  if (variant === "forgot") {
    return {
      title: `You’re only a step away from ${appName}.`,
      description: "Reset your password and get back to the work that matters.",
    };
  }

  return {
    title: `${appName} keeps your work in one calm place.`,
    description: "Pick up where you left off, with your tasks, team, and updates ready for you.",
  };
}

function BrandHeader() {
  const branding = useBranding();

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center justify-center">
        <img src={branding.logoUrl} alt={branding.companyName} className="h-14 w-14 object-contain" />
      </div>
      <div className="relative">
        <p className="text-[1.6rem] font-semibold tracking-[-0.05em] text-[var(--text-primary)] sm:text-[1.8rem]">
          {branding.companyName}
        </p>
      </div>
    </div>
  );
}

function artworkOverlay(variant: AuthArtworkVariant) {
  if (variant === "signup") {
    return {
      background:
        "linear-gradient(180deg, rgba(229,143,101,0.16) 0%, rgba(18,22,34,0.2) 34%, rgba(5,7,11,0.56) 100%), radial-gradient(circle at 24% 18%, rgba(229,143,101,0.18), transparent 34%), radial-gradient(circle at 78% 78%, rgba(86,119,255,0.12), transparent 38%)",
    };
  }

  if (variant === "forgot") {
    return {
      background:
        "linear-gradient(180deg, rgba(229,143,101,0.12) 0%, rgba(14,20,16,0.24) 36%, rgba(5,8,6,0.6) 100%), radial-gradient(circle at 22% 20%, rgba(229,143,101,0.16), transparent 32%), radial-gradient(circle at 74% 72%, rgba(104,169,132,0.14), transparent 36%)",
    };
  }

  return {
    background:
      "linear-gradient(180deg, rgba(229,143,101,0.14) 0%, rgba(11,20,22,0.22) 32%, rgba(4,7,8,0.58) 100%), radial-gradient(circle at 18% 18%, rgba(229,143,101,0.16), transparent 34%), radial-gradient(circle at 82% 80%, rgba(67,164,160,0.12), transparent 38%)",
  };
}

function AuthArtworkPanel({ variant }: { variant: AuthArtworkVariant }) {
  const branding = useBranding();
  const artworkSrc = {
    signup: signupArtwork,
    login: loginArtwork,
    forgot: forgotArtwork,
  } satisfies Record<AuthArtworkVariant, typeof signupArtwork>;
  const copy = artworkCopy(variant, branding.appName);
  const [imageReady, setImageReady] = useState(false);
  const [introActive, setIntroActive] = useState(false);

  useEffect(() => {
    setImageReady(false);
    setIntroActive(false);

    const timer = window.setTimeout(() => {
      setIntroActive(true);
    }, 140);

    return () => window.clearTimeout(timer);
  }, [variant]);

  const revealArtwork = imageReady && introActive;

  return (
    <div className="relative hidden h-full min-h-screen w-full overflow-hidden bg-[#07090d] lg:block">
      <div
        className={cn(
          "auth-artwork-loader absolute inset-0 transition-opacity duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]",
          revealArtwork ? "opacity-0" : "opacity-100",
        )}
      />
      <Image
        src={artworkSrc[variant]}
        alt=""
        fill
        priority
        sizes="(min-width: 1024px) 50vw, 100vw"
        placeholder="blur"
        onLoad={() => setImageReady(true)}
        className={cn("auth-artwork-image object-cover object-left", revealArtwork && "is-loaded")}
      />
      <div className="absolute inset-0" style={artworkOverlay(variant)} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_32%,rgba(3,5,8,0.18)_68%,rgba(3,5,8,0.34)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,12,0.06)_0%,rgba(5,8,12,0.24)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-start p-8 xl:p-12">
        <div className="max-w-[26rem] rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(11,14,18,0.28),rgba(11,14,18,0.58))] px-6 py-5 text-left shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur-md">
          <p className="text-[1.6rem] font-semibold leading-[1.1] tracking-[-0.05em] text-white">
            {copy.title}
          </p>
          <p className="mt-3 max-w-[22rem] text-[0.95rem] leading-6 text-white/72">
            {copy.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export function AuthShell({
  title,
  subtitle,
  artwork,
  children,
  centerContent = false,
  contentClassName,
}: {
  title: string;
  subtitle: string;
  artwork: AuthArtworkVariant;
  children: React.ReactNode;
  centerContent?: boolean;
  contentClassName?: string;
}) {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <div className="flex min-h-screen flex-col gap-10 pb-6 sm:pb-8 lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-0 lg:pb-0">
        <AuthArtworkPanel variant={artwork} />

        <section className="relative flex min-h-screen w-full overflow-hidden lg:min-h-0">
          <div className="pointer-events-none absolute left-[-92px] top-[-72px] h-[310px] w-[360px] opacity-100">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 14% 18%, rgba(251,138,116,0.1), transparent 34%), radial-gradient(circle at 64% 14%, rgba(103,138,255,0.08), transparent 32%), radial-gradient(circle at 34% 58%, rgba(94,201,170,0.06), transparent 34%)",
              }}
            />
            <div
              className="loader-grid absolute inset-0 opacity-95"
              style={{
                maskImage: "radial-gradient(circle at top left, black 18%, transparent 74%)",
                WebkitMaskImage: "radial-gradient(circle at top left, black 18%, transparent 74%)",
              }}
            />
          </div>
          <div className="pointer-events-none absolute left-[-26px] top-[12px] h-[150px] w-[150px] rounded-full bg-[radial-gradient(circle,rgba(251,138,116,0.1),transparent_72%)] blur-2xl" />
          <div
            className={cn(
              "relative mx-auto flex w-full max-w-[540px] flex-col justify-center px-5 py-4 sm:px-8 sm:py-8 lg:max-w-none lg:px-10 lg:py-12 xl:px-14",
              centerContent ? "lg:mx-auto" : "lg:mx-0",
            )}
          >
            <div className={cn("mx-auto flex w-full max-w-[460px] flex-col justify-center", contentClassName)}>
              <BrandHeader />
              <div className={cn("mt-10", centerContent && "w-full text-center")}>
                <h1 className="text-[1.9rem] font-semibold tracking-[-0.05em] text-[var(--text-primary)] sm:text-[2.1rem]">
                  {title}
                </h1>
                <p
                  className={cn(
                    "mt-2.5 max-w-[34ch] text-[0.95rem] text-[var(--text-secondary)] sm:text-[1rem]",
                    centerContent && "mx-auto",
                  )}
                >
                  {subtitle}
                </p>
              </div>
              <div className={cn("mt-8", centerContent && "flex w-full justify-center")}>
                {children}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export function AuthField({
  label,
  placeholder,
  type = "text",
  icon,
  trailing,
  inputMode,
  name,
  value,
  onChange,
  autoComplete,
  disabled = false,
}: {
  label: string;
  placeholder: string;
  type?: React.HTMLInputTypeAttribute;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  name?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  autoComplete?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[0.88rem] font-medium text-[var(--white-soft)]">
        {label}
      </span>
      <div className="flex h-[54px] items-center gap-3 rounded-[14px] border border-white/5 bg-[rgba(255,255,255,0.03)] px-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition-colors focus-within:border-[var(--accent)]/40 focus-within:bg-white/[0.045]">
        {icon ? (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.03] text-[var(--text-muted)] ring-1 ring-white/5">
            {icon}
          </span>
        ) : null}
        <input
          name={name}
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          disabled={disabled}
          placeholder={placeholder}
          className="h-full w-full border-0 bg-transparent text-[0.94rem] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
        />
        {trailing ? <span className="text-[var(--text-muted)]">{trailing}</span> : null}
      </div>
    </label>
  );
}

export function AuthPasswordField({
  label,
  placeholder,
  name,
  value,
  onChange,
  autoComplete,
  disabled,
}: {
  label: string;
  placeholder: string;
  name?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  autoComplete?: string;
  disabled?: boolean;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block">
      <span className="mb-2 block text-[0.88rem] font-medium text-[var(--white-soft)]">
        {label}
      </span>
      <div className="flex h-[54px] items-center gap-3 rounded-[14px] border border-white/5 bg-[rgba(255,255,255,0.03)] px-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition-colors focus-within:border-[var(--accent)]/40 focus-within:bg-white/[0.045]">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.03] text-[var(--text-muted)] ring-1 ring-white/5">
          <LockKeyhole className="h-4 w-4" />
        </span>
        <input
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          disabled={disabled}
          placeholder={placeholder}
          className="h-full w-full border-0 bg-transparent text-[0.94rem] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          disabled={disabled}
          aria-label={visible ? "Hide password" : "Show password"}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--text-muted)] transition hover:bg-white/[0.04] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </label>
  );
}

/* ─── Country picker data ─────────────────────────────────── */

type Country = { flag: string; name: string; dial: string };

const COUNTRIES: Country[] = [
  { flag: "🇦🇫", name: "Afghanistan", dial: "+93" },
  { flag: "🇦🇱", name: "Albania", dial: "+355" },
  { flag: "🇩🇿", name: "Algeria", dial: "+213" },
  { flag: "🇦🇩", name: "Andorra", dial: "+376" },
  { flag: "🇦🇴", name: "Angola", dial: "+244" },
  { flag: "🇦🇷", name: "Argentina", dial: "+54" },
  { flag: "🇦🇲", name: "Armenia", dial: "+374" },
  { flag: "🇦🇺", name: "Australia", dial: "+61" },
  { flag: "🇦🇹", name: "Austria", dial: "+43" },
  { flag: "🇦🇿", name: "Azerbaijan", dial: "+994" },
  { flag: "🇧🇭", name: "Bahrain", dial: "+973" },
  { flag: "🇧🇩", name: "Bangladesh", dial: "+880" },
  { flag: "🇧🇾", name: "Belarus", dial: "+375" },
  { flag: "🇧🇪", name: "Belgium", dial: "+32" },
  { flag: "🇧🇿", name: "Belize", dial: "+501" },
  { flag: "🇧🇯", name: "Benin", dial: "+229" },
  { flag: "🇧🇹", name: "Bhutan", dial: "+975" },
  { flag: "🇧🇴", name: "Bolivia", dial: "+591" },
  { flag: "🇧🇦", name: "Bosnia & Herzegovina", dial: "+387" },
  { flag: "🇧🇼", name: "Botswana", dial: "+267" },
  { flag: "🇧🇷", name: "Brazil", dial: "+55" },
  { flag: "🇧🇳", name: "Brunei", dial: "+673" },
  { flag: "🇧🇬", name: "Bulgaria", dial: "+359" },
  { flag: "🇧🇫", name: "Burkina Faso", dial: "+226" },
  { flag: "🇧🇮", name: "Burundi", dial: "+257" },
  { flag: "🇨🇻", name: "Cape Verde", dial: "+238" },
  { flag: "🇰🇭", name: "Cambodia", dial: "+855" },
  { flag: "🇨🇲", name: "Cameroon", dial: "+237" },
  { flag: "🇨🇦", name: "Canada", dial: "+1" },
  { flag: "🇨🇫", name: "Central African Republic", dial: "+236" },
  { flag: "🇹🇩", name: "Chad", dial: "+235" },
  { flag: "🇨🇱", name: "Chile", dial: "+56" },
  { flag: "🇨🇳", name: "China", dial: "+86" },
  { flag: "🇨🇴", name: "Colombia", dial: "+57" },
  { flag: "🇰🇲", name: "Comoros", dial: "+269" },
  { flag: "🇨🇬", name: "Congo", dial: "+242" },
  { flag: "🇨🇷", name: "Costa Rica", dial: "+506" },
  { flag: "🇭🇷", name: "Croatia", dial: "+385" },
  { flag: "🇨🇺", name: "Cuba", dial: "+53" },
  { flag: "🇨🇾", name: "Cyprus", dial: "+357" },
  { flag: "🇨🇿", name: "Czech Republic", dial: "+420" },
  { flag: "🇩🇰", name: "Denmark", dial: "+45" },
  { flag: "🇩🇯", name: "Djibouti", dial: "+253" },
  { flag: "🇩🇴", name: "Dominican Republic", dial: "+1" },
  { flag: "🇪🇨", name: "Ecuador", dial: "+593" },
  { flag: "🇪🇬", name: "Egypt", dial: "+20" },
  { flag: "🇸🇻", name: "El Salvador", dial: "+503" },
  { flag: "🇬🇶", name: "Equatorial Guinea", dial: "+240" },
  { flag: "🇪🇷", name: "Eritrea", dial: "+291" },
  { flag: "🇪🇪", name: "Estonia", dial: "+372" },
  { flag: "🇪🇹", name: "Ethiopia", dial: "+251" },
  { flag: "🇫🇯", name: "Fiji", dial: "+679" },
  { flag: "🇫🇮", name: "Finland", dial: "+358" },
  { flag: "🇫🇷", name: "France", dial: "+33" },
  { flag: "🇬🇦", name: "Gabon", dial: "+241" },
  { flag: "🇬🇲", name: "Gambia", dial: "+220" },
  { flag: "🇬🇪", name: "Georgia", dial: "+995" },
  { flag: "🇩🇪", name: "Germany", dial: "+49" },
  { flag: "🇬🇭", name: "Ghana", dial: "+233" },
  { flag: "🇬🇷", name: "Greece", dial: "+30" },
  { flag: "🇬🇹", name: "Guatemala", dial: "+502" },
  { flag: "🇬🇳", name: "Guinea", dial: "+224" },
  { flag: "🇬🇼", name: "Guinea-Bissau", dial: "+245" },
  { flag: "🇬🇾", name: "Guyana", dial: "+592" },
  { flag: "🇭🇹", name: "Haiti", dial: "+509" },
  { flag: "🇭🇳", name: "Honduras", dial: "+504" },
  { flag: "🇭🇰", name: "Hong Kong", dial: "+852" },
  { flag: "🇭🇺", name: "Hungary", dial: "+36" },
  { flag: "🇮🇸", name: "Iceland", dial: "+354" },
  { flag: "🇮🇳", name: "India", dial: "+91" },
  { flag: "🇮🇩", name: "Indonesia", dial: "+62" },
  { flag: "🇮🇷", name: "Iran", dial: "+98" },
  { flag: "🇮🇶", name: "Iraq", dial: "+964" },
  { flag: "🇮🇪", name: "Ireland", dial: "+353" },
  { flag: "🇮🇱", name: "Israel", dial: "+972" },
  { flag: "🇮🇹", name: "Italy", dial: "+39" },
  { flag: "🇯🇲", name: "Jamaica", dial: "+1" },
  { flag: "🇯🇵", name: "Japan", dial: "+81" },
  { flag: "🇯🇴", name: "Jordan", dial: "+962" },
  { flag: "🇰🇿", name: "Kazakhstan", dial: "+7" },
  { flag: "🇰🇪", name: "Kenya", dial: "+254" },
  { flag: "🇰🇼", name: "Kuwait", dial: "+965" },
  { flag: "🇰🇬", name: "Kyrgyzstan", dial: "+996" },
  { flag: "🇱🇦", name: "Laos", dial: "+856" },
  { flag: "🇱🇻", name: "Latvia", dial: "+371" },
  { flag: "🇱🇧", name: "Lebanon", dial: "+961" },
  { flag: "🇱🇸", name: "Lesotho", dial: "+266" },
  { flag: "🇱🇷", name: "Liberia", dial: "+231" },
  { flag: "🇱🇾", name: "Libya", dial: "+218" },
  { flag: "🇱🇮", name: "Liechtenstein", dial: "+423" },
  { flag: "🇱🇹", name: "Lithuania", dial: "+370" },
  { flag: "🇱🇺", name: "Luxembourg", dial: "+352" },
  { flag: "🇲🇴", name: "Macao", dial: "+853" },
  { flag: "🇲🇬", name: "Madagascar", dial: "+261" },
  { flag: "🇲🇼", name: "Malawi", dial: "+265" },
  { flag: "🇲🇾", name: "Malaysia", dial: "+60" },
  { flag: "🇲🇻", name: "Maldives", dial: "+960" },
  { flag: "🇲🇱", name: "Mali", dial: "+223" },
  { flag: "🇲🇹", name: "Malta", dial: "+356" },
  { flag: "🇲🇷", name: "Mauritania", dial: "+222" },
  { flag: "🇲🇺", name: "Mauritius", dial: "+230" },
  { flag: "🇲🇽", name: "Mexico", dial: "+52" },
  { flag: "🇲🇩", name: "Moldova", dial: "+373" },
  { flag: "🇲🇨", name: "Monaco", dial: "+377" },
  { flag: "🇲🇳", name: "Mongolia", dial: "+976" },
  { flag: "🇲🇪", name: "Montenegro", dial: "+382" },
  { flag: "🇲🇦", name: "Morocco", dial: "+212" },
  { flag: "🇲🇿", name: "Mozambique", dial: "+258" },
  { flag: "🇲🇲", name: "Myanmar", dial: "+95" },
  { flag: "🇳🇦", name: "Namibia", dial: "+264" },
  { flag: "🇳🇵", name: "Nepal", dial: "+977" },
  { flag: "🇳🇱", name: "Netherlands", dial: "+31" },
  { flag: "🇳🇿", name: "New Zealand", dial: "+64" },
  { flag: "🇳🇮", name: "Nicaragua", dial: "+505" },
  { flag: "🇳🇪", name: "Niger", dial: "+227" },
  { flag: "🇳🇬", name: "Nigeria", dial: "+234" },
  { flag: "🇰🇵", name: "North Korea", dial: "+850" },
  { flag: "🇲🇰", name: "North Macedonia", dial: "+389" },
  { flag: "🇳🇴", name: "Norway", dial: "+47" },
  { flag: "🇴🇲", name: "Oman", dial: "+968" },
  { flag: "🇵🇰", name: "Pakistan", dial: "+92" },
  { flag: "🇵🇦", name: "Panama", dial: "+507" },
  { flag: "🇵🇬", name: "Papua New Guinea", dial: "+675" },
  { flag: "🇵🇾", name: "Paraguay", dial: "+595" },
  { flag: "🇵🇪", name: "Peru", dial: "+51" },
  { flag: "🇵🇭", name: "Philippines", dial: "+63" },
  { flag: "🇵🇱", name: "Poland", dial: "+48" },
  { flag: "🇵🇹", name: "Portugal", dial: "+351" },
  { flag: "🇵🇷", name: "Puerto Rico", dial: "+1" },
  { flag: "🇶🇦", name: "Qatar", dial: "+974" },
  { flag: "🇷🇴", name: "Romania", dial: "+40" },
  { flag: "🇷🇺", name: "Russia", dial: "+7" },
  { flag: "🇷🇼", name: "Rwanda", dial: "+250" },
  { flag: "🇸🇦", name: "Saudi Arabia", dial: "+966" },
  { flag: "🇸🇳", name: "Senegal", dial: "+221" },
  { flag: "🇷🇸", name: "Serbia", dial: "+381" },
  { flag: "🇸🇱", name: "Sierra Leone", dial: "+232" },
  { flag: "🇸🇬", name: "Singapore", dial: "+65" },
  { flag: "🇸🇰", name: "Slovakia", dial: "+421" },
  { flag: "🇸🇮", name: "Slovenia", dial: "+386" },
  { flag: "🇸🇴", name: "Somalia", dial: "+252" },
  { flag: "🇿🇦", name: "South Africa", dial: "+27" },
  { flag: "🇰🇷", name: "South Korea", dial: "+82" },
  { flag: "🇸🇸", name: "South Sudan", dial: "+211" },
  { flag: "🇪🇸", name: "Spain", dial: "+34" },
  { flag: "🇱🇰", name: "Sri Lanka", dial: "+94" },
  { flag: "🇸🇩", name: "Sudan", dial: "+249" },
  { flag: "🇸🇷", name: "Suriname", dial: "+597" },
  { flag: "🇸🇿", name: "Swaziland", dial: "+268" },
  { flag: "🇸🇪", name: "Sweden", dial: "+46" },
  { flag: "🇨🇭", name: "Switzerland", dial: "+41" },
  { flag: "🇸🇾", name: "Syria", dial: "+963" },
  { flag: "🇹🇼", name: "Taiwan", dial: "+886" },
  { flag: "🇹🇯", name: "Tajikistan", dial: "+992" },
  { flag: "🇹🇿", name: "Tanzania", dial: "+255" },
  { flag: "🇹🇭", name: "Thailand", dial: "+66" },
  { flag: "🇹🇱", name: "Timor-Leste", dial: "+670" },
  { flag: "🇹🇬", name: "Togo", dial: "+228" },
  { flag: "🇹🇹", name: "Trinidad & Tobago", dial: "+1" },
  { flag: "🇹🇳", name: "Tunisia", dial: "+216" },
  { flag: "🇹🇷", name: "Turkey", dial: "+90" },
  { flag: "🇹🇲", name: "Turkmenistan", dial: "+993" },
  { flag: "🇺🇬", name: "Uganda", dial: "+256" },
  { flag: "🇺🇦", name: "Ukraine", dial: "+380" },
  { flag: "🇦🇪", name: "United Arab Emirates", dial: "+971" },
  { flag: "🇬🇧", name: "United Kingdom", dial: "+44" },
  { flag: "🇺🇸", name: "United States", dial: "+1" },
  { flag: "🇺🇾", name: "Uruguay", dial: "+598" },
  { flag: "🇺🇿", name: "Uzbekistan", dial: "+998" },
  { flag: "🇻🇪", name: "Venezuela", dial: "+58" },
  { flag: "🇻🇳", name: "Vietnam", dial: "+84" },
  { flag: "🇾🇪", name: "Yemen", dial: "+967" },
  { flag: "🇿🇲", name: "Zambia", dial: "+260" },
  { flag: "🇿🇼", name: "Zimbabwe", dial: "+263" },
];

export function AuthPhoneField({
  dialCode,
  onDialCodeChange,
  value,
  onChange,
  disabled = false,
}: {
  dialCode: string;
  onDialCodeChange: (dial: string) => void;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selected = COUNTRIES.find((c) => c.dial === dialCode && c.name === "United States")
    ?? COUNTRIES.find((c) => c.dial === dialCode)
    ?? COUNTRIES.find((c) => c.name === "United States")!;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial.includes(q),
    );
  }, [query]);

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open]);

  function select(country: Country) {
    onDialCodeChange(country.dial);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="block">
      <span className="mb-2 block text-[0.88rem] font-medium text-[var(--white-soft)]">
        Phone Number
      </span>
      <div className="flex h-[54px] items-center gap-3 rounded-[14px] border border-white/5 bg-[rgba(255,255,255,0.03)] px-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition-colors focus-within:border-[var(--accent)]/40 focus-within:bg-white/[0.045]">
        {/* Country picker trigger */}
        <div className="relative shrink-0" ref={wrapperRef}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-[10px] bg-black/20 px-2.5 py-1.5 text-[0.84rem] text-[var(--text-primary)] ring-1 ring-white/5 transition hover:bg-black/30"
          >
            <span aria-hidden="true" className="text-base leading-none">{selected.flag}</span>
            <span className="font-medium tracking-tight">{selected.dial}</span>
            <ChevronDown className={cn("h-3 w-3 text-[var(--text-muted)] transition", open && "rotate-180")} />
          </button>

          {open && (
            <div className="absolute left-0 top-full z-50 mt-2 w-[280px] overflow-hidden rounded-[16px] border border-white/8 bg-[#1c1d21] shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              {/* Search */}
              <div className="flex items-center gap-2 border-b border-white/6 px-3 py-2.5">
                <Search className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search country or dial code"
                  className="w-full bg-transparent text-[0.84rem] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                />
                {query && (
                  <button type="button" onClick={() => setQuery("")} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                    <ChevronDown className="h-3 w-3 rotate-180" />
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-[240px] overflow-y-auto">
                {filtered.length === 0 && (
                  <p className="px-4 py-6 text-center text-[0.8rem] text-[var(--text-muted)]">No results</p>
                )}
                {filtered.map((country) => {
                  const isSelected = country.dial === dialCode && country.name === selected.name;
                  return (
                    <button
                      key={`${country.name}-${country.dial}`}
                      type="button"
                      onClick={() => select(country)}
                      className={cn(
                        "flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-[0.84rem] transition hover:bg-white/5",
                        isSelected ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]",
                      )}
                    >
                      <span className="text-base leading-none">{country.flag}</span>
                      <span className="flex-1 truncate">{country.name}</span>
                      <span className={cn("shrink-0 text-[0.78rem] font-mono", isSelected ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]")}>
                        {country.dial}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <Phone className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          value={value}
          onChange={onChange}
          autoComplete="tel-national"
          disabled={disabled}
          placeholder="000-000-0000"
          className="h-full min-w-0 flex-1 border-0 bg-transparent text-[0.94rem] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
        />
      </div>
    </div>
  );
}

export function AuthPrimaryButton({
  children,
  type = "button",
  disabled = false,
  loading = false,
  onClick,
}: {
  children: React.ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      aria-busy={loading}
      onClick={onClick}
      className="btn-base btn-primary flex h-[50px] w-full items-center justify-center gap-2 rounded-[14px] px-5 text-[0.94rem] font-semibold disabled:translate-y-0 disabled:opacity-60"
    >
      {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
      {children}
      {!loading ? <ArrowRight className="h-4 w-4" /> : null}
    </button>
  );
}

export function AuthGoogleButton({
  disabled = false,
  loading = false,
  onClick,
  label = "Continue with Google",
}: {
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-busy={loading}
      onClick={onClick}
      className="btn-base btn-secondary mt-3 flex h-[50px] w-full items-center justify-center gap-3 rounded-[14px] px-5 text-[0.94rem] font-medium text-[var(--text-primary)] disabled:translate-y-0 disabled:opacity-60"
    >
      {loading ? (
        <LoaderCircle className="h-5 w-5 shrink-0 animate-spin" />
      ) : (
        <svg
          height="24"
          width="24"
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="shrink-0"
        >
          <g clipPath="url(#google-auth-icon)">
            <path d="M23.7663 12.2763C23.7663 11.4605 23.7001 10.6404 23.559 9.83789H12.2402V14.4589H18.722C18.453 15.9492 17.5888 17.2676 16.3233 18.1054V21.1037H20.1903C22.4611 19.0137 23.7663 15.9272 23.7663 12.2763Z" fill="#4285F4" />
            <path d="M12.2401 24.0013C15.4766 24.0013 18.2059 22.9387 20.1945 21.1044L16.3276 18.106C15.2517 18.838 13.8627 19.2525 12.2445 19.2525C9.11388 19.2525 6.45946 17.1404 5.50705 14.3008H1.5166V17.3917C3.55371 21.4439 7.7029 24.0013 12.2401 24.0013Z" fill="#34A853" />
            <path d="M5.50277 14.3007C5.00011 12.8103 5.00011 11.1965 5.50277 9.70618V6.61523H1.51674C-0.185266 10.006 -0.185266 14.0009 1.51674 17.3916L5.50277 14.3007Z" fill="#FBBC04" />
            <path d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z" fill="#EA4335" />
          </g>
          <defs>
            <clipPath id="google-auth-icon">
              <rect height="24" width="24" fill="white" />
            </clipPath>
          </defs>
        </svg>
      )}
      {label}
    </button>
  );
}

export function AuthRememberRow() {
  return (
    <div className="flex items-center justify-between gap-4 text-[0.9rem] text-[var(--text-secondary)]">
      <span className="text-[0.84rem] text-[var(--text-muted)]">Secure session on this device</span>
      <Link href="/forgot-password" className="font-medium text-[var(--text-primary)] transition-colors hover:text-white/80">
        Forgot password
      </Link>
    </div>
  );
}

export function AuthFooter({
  prompt,
  actionLabel,
  href,
}: {
  prompt: string;
  actionLabel: string;
  href: string;
}) {
  return (
    <p className="text-center text-[0.92rem] text-[var(--text-secondary)]">
      {prompt}{" "}
      <Link href={href} className="font-semibold text-[var(--text-primary)] transition-colors hover:text-white/80">
        {actionLabel}
      </Link>
    </p>
  );
}

export function AuthBackLink() {
  return (
    <Link
      href="/login"
      className="inline-flex items-center gap-2 text-[0.92rem] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to login Screen
    </Link>
  );
}

export function AuthFormGrid({
  children,
  compact = false,
}: {
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={cn("w-full space-y-3.5", compact ? "max-w-[420px]" : "max-w-none")}>
      {children}
    </div>
  );
}

export function AuthEmailField() {
  return (
    <AuthField
      label="Email Address"
      placeholder="Enter your email address"
      type="email"
      inputMode="email"
      icon={<Mail className="h-4 w-4" />}
    />
  );
}

export function ControlledAuthEmailField({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
}) {
  return (
    <AuthField
      label="Email Address"
      placeholder="Enter your email address"
      type="email"
      inputMode="email"
      icon={<Mail className="h-4 w-4" />}
      name="email"
      value={value}
      onChange={onChange}
      autoComplete="email"
      disabled={disabled}
    />
  );
}

export function AuthNameField({
  label,
  placeholder,
  name,
  value,
  onChange,
  autoComplete,
  disabled = false,
}: {
  label: string;
  placeholder: string;
  name?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  autoComplete?: string;
  disabled?: boolean;
}) {
  return (
    <AuthField
      label={label}
      placeholder={placeholder}
      icon={<UserRound className="h-4 w-4" />}
      name={name}
      value={value}
      onChange={onChange}
      autoComplete={autoComplete}
      disabled={disabled}
    />
  );
}

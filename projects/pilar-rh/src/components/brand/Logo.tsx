import { LogoMark } from "./LogoMark";

interface LogoProps {
  variant?: "navy" | "white";
  showTagline?: boolean;
  className?: string;
}

export function Logo({ variant = "navy", showTagline = false, className = "" }: LogoProps) {
  const textColor = variant === "navy" ? "text-navy" : "text-white";
  const subtitleColor = variant === "navy" ? "text-navy-soft" : "text-white/70";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoMark size="md" variant={variant} />
      <div className="flex flex-col">
        <span className={`font-sans text-lg font-bold tracking-[0.04em] leading-none ${textColor}`}>
          PILAR
        </span>
        <span className={`font-mono text-[0.6rem] font-medium tracking-[0.12em] leading-tight uppercase mt-0.5 ${subtitleColor}`}>
          RECURSOS HUMANOS
        </span>
        {showTagline && (
          <span className={`text-[0.6rem] font-normal tracking-wide mt-1 ${subtitleColor}`}>
            Pessoas certas. Relações que permanecem.
          </span>
        )}
      </div>
    </div>
  );
}

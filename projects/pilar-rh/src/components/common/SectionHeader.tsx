import { ReactNode } from "react";
import { motion } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const ease = [0.22, 1, 0.36, 1] as const;

interface SectionHeaderProps {
  label?: string;
  heading: string | ReactNode;
  subheading?: string | ReactNode;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  label,
  heading,
  subheading,
  align = "center",
  className = "",
}: SectionHeaderProps) {
  const reducedMotion = useReducedMotion();

  const alignClasses =
    align === "center" ? "text-center" : "text-left";

  const animationProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.6, ease },
      };

  return (
    <motion.div
      {...animationProps}
      className={`${alignClasses} ${className}`}
    >
      {label && (
        <div className="mb-4 flex items-center justify-center gap-3">
          {align === "center" && (
            <div className="h-px w-3 bg-wine" />
          )}
          <span className="text-xs font-mono font-semibold tracking-widest text-ink-soft uppercase">
            {label}
          </span>
          {align === "center" && (
            <div className="h-px w-3 bg-wine" />
          )}
        </div>
      )}
      <h2 className="font-serif text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl">
        {heading}
      </h2>
      {subheading && (
        <p className={`mt-6 text-base text-ink-soft sm:text-lg max-w-3xl ${align === "center" ? "mx-auto" : ""}`}>
          {subheading}
        </p>
      )}
    </motion.div>
  );
}

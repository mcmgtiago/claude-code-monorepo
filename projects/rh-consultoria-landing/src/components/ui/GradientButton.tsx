import { type ReactNode, type ButtonHTMLAttributes, forwardRef } from "react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface GradientButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "ref"> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  href?: string;
}

const sizeMap: Record<Size, string> = {
  sm: "h-10 px-5 text-sm",
  md: "h-12 px-6 text-[15px]",
  lg: "h-14 px-8 text-base",
};

export const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  function GradientButton(
    {
      children,
      className,
      variant = "primary",
      size = "md",
      icon,
      iconRight,
      fullWidth,
      href,
      ...rest
    },
    ref
  ) {
    const base = cn(
      "group relative inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-transform duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-blue)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 disabled:pointer-events-none",
      sizeMap[size],
      fullWidth && "w-full",
      className
    );

    const inner =
      "relative inline-flex items-center justify-center gap-2 rounded-full transition-transform duration-300 group-hover:scale-[1.01]";

    const content = (
      <>
        {variant === "primary" && (
          <>
            <span aria-hidden className="absolute inset-0 rounded-full bg-gradient-brand" />
            <span
              aria-hidden
              className="absolute inset-0 rounded-full bg-gradient-brand opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100"
            />
          </>
        )}
        <span
          className={cn(
            inner,
            sizeMap[size],
            variant === "primary" && "m-[2px] bg-white px-6 text-[var(--color-ink)]",
            variant === "secondary" && "border-gradient-brand bg-white text-[var(--color-ink)]",
            variant === "ghost" && "text-[var(--color-ink)]"
          )}
        >
          {icon && (
            <span
              className={cn(
                "grid place-items-center",
                variant === "primary"
                  ? "size-6 rounded-full bg-gradient-brand text-white"
                  : "text-[var(--color-brand-blue)]"
              )}
            >
              {icon}
            </span>
          )}
          <span>{children}</span>
          {iconRight}
        </span>
      </>
    );

    if (href) {
      return (
        <motion.a
          href={href}
          whileHover={{ scale: variant === "ghost" ? 1.02 : 1.03 }}
          whileTap={{ scale: 0.98 }}
          className={base}
        >
          {content}
        </motion.a>
      );
    }

    return (
      <button ref={ref} className={base} {...rest}>
        <motion.span
          className="contents"
          whileHover={{ scale: variant === "ghost" ? 1.02 : 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          {content}
        </motion.span>
      </button>
    );
  }
);
import { motion, type HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

interface FadeUpProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  amount?: number;
  className?: string;
}

/**
 * FadeUp — elemento que entra com opacidade, deslocamento vertical e blur ao
 * aparecer no viewport. Padrão do design system.
 */
export function FadeUp({
  children,
  delay = 0,
  duration = 0.6,
  y = 24,
  amount = 0.3,
  className,
  ...rest
}: FadeUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
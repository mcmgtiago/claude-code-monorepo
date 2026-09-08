import { ReactNode } from "react";
import { motion } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const ease = [0.22, 1, 0.36, 1] as const;

interface RevealProps {
  children: ReactNode;
  delay?: number;
}

export function Reveal({ children, delay = 0 }: RevealProps) {
  const reducedMotion = useReducedMotion();

  const animationProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 18, filter: "blur(5px)" },
        whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
        viewport: { once: true, amount: 0.2 },
        transition: {
          duration: 0.62,
          delay,
          ease,
        },
      };

  return (
    <motion.div {...animationProps}>
      {children}
    </motion.div>
  );
}

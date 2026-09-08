import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { ease } from "../lib/utils";

type RevealProps = { children: ReactNode; delay?: number; duration?: number; y?: number; className?: string; once?: boolean };

export function Reveal({ children, delay = 0, duration = 0.72, y = 24, className, once = true }: RevealProps) {
  const reduce = useReducedMotion();
  return <motion.div className={className} initial={reduce ? false : { opacity: 0, y, filter: "blur(6px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} viewport={{ once, amount: 0.22 }} transition={{ duration: reduce ? 0 : duration, delay: reduce ? 0 : delay, ease }}>{children}</motion.div>;
}

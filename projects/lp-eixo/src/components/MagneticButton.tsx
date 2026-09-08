import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import type { HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

export function MagneticButton({ children, className = "", ...props }: HTMLMotionProps<"button"> & { children: ReactNode }) {
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 20 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 20 });
  return <motion.button {...props} className={className} style={{ x, y }} onPointerMove={(event) => { if (reduce || event.pointerType === "touch") return; const rect = event.currentTarget.getBoundingClientRect(); x.set(((event.clientX - rect.left) / rect.width - 0.5) * 12); y.set(((event.clientY - rect.top) / rect.height - 0.5) * 12); }} onPointerLeave={() => { x.set(0); y.set(0); }}>{children}</motion.button>;
}

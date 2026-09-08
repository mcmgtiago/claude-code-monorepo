import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

export function MetricTicker({ value, suffix = "", duration = 1.4 }: { value: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null); const inView = useInView(ref, { once: true }); const reduce = useReducedMotion(); const [shown, setShown] = useState(reduce ? value : 0);
  useEffect(() => { if (!inView) return; if (reduce) { setShown(value); return; } const start = performance.now(); let frame = 0; const tick = (now: number) => { const p = Math.min((now - start) / (duration * 1000), 1); setShown(value * (1 - Math.pow(1 - p, 3))); if (p < 1) frame = requestAnimationFrame(tick); }; frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame); }, [duration, inView, reduce, value]);
  const formatted = Number.isInteger(value) ? Math.round(shown).toString() : shown.toFixed(1).replace(".", ",");
  return <span ref={ref} aria-label={`${String(value).replace(".", ",")}${suffix}`}>{formatted}{suffix}</span>;
}

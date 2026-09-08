import { useEffect, useRef, useState } from "react";

interface MetricTickerProps {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

export function MetricTicker({
  target,
  suffix = "",
  prefix = "",
  duration = 1500,
}: MetricTickerProps) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;

    const startTime = performance.now();
    let animFrame: number;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(target * eased));

      if (progress < 1) {
        animFrame = requestAnimationFrame(animate);
      }
    };

    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [started, target, duration]);

  return (
    <span
      ref={ref}
      aria-label={`${prefix}${target}${suffix}`}
      className="font-mono font-semibold"
    >
      {prefix}
      {count.toLocaleString("pt-BR")}
      {suffix}
    </span>
  );
}

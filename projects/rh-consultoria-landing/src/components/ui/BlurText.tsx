import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
  speed?: number; // stagger por palavra em segundos
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

/**
 * BlurText — divide o texto em palavras e anima cada uma (blur 10→0, opacity 0→1, y 12→0)
 * quando entra no viewport. Stagger de 100ms por palavra.
 */
export function BlurText({
  text,
  className,
  delay = 0,
  speed = 0.1,
  as: Tag = "h2",
}: BlurTextProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const words = text.split(" ");

  return (
    <Tag
      ref={ref as never}
      className={className}
      aria-label={text}
      style={{ display: "inline" }}
    >
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ opacity: 0, y: 12, filter: "blur(10px)" }}
          animate={
            inView
              ? { opacity: 1, y: 0, filter: "blur(0px)" }
              : { opacity: 0, y: 12, filter: "blur(10px)" }
          }
          transition={{
            duration: 0.55,
            delay: delay + i * speed,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            display: "inline-block",
            whiteSpace: "pre",
            willChange: "transform, opacity, filter",
          }}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </Tag>
  );
}
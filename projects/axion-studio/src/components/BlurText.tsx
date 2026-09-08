import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

type Direction = "top" | "bottom";

type Props = {
  text: string;
  className?: string;
  by?: "word" | "letter";
  delay?: number;
  stepDuration?: number;
  direction?: Direction;
  threshold?: number;
  rootMargin?: string;
};

export default function BlurText({
  text,
  className = "",
  by = "word",
  delay = 200,
  stepDuration = 0.35,
  direction = "bottom",
  threshold = 0.1,
  rootMargin = "0px",
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const elements = by === "word" ? text.split(" ") : text.split("");

  const initialOffset = direction === "bottom" ? 50 : -50;
  const midOffset = direction === "bottom" ? -5 : 5;

  const buildKeyframes = () => ({
    filter: ["blur(10px)", "blur(5px)", "blur(0px)"],
    opacity: [0, 0.5, 1],
    y: [initialOffset, midOffset, 0],
  });

  return (
    <span ref={ref} className={className}>
      {elements.map((el, i) => (
        <motion.span
          key={i}
          initial={{ filter: "blur(10px)", opacity: 0, y: initialOffset }}
          animate={inView ? buildKeyframes() : { filter: "blur(10px)", opacity: 0, y: initialOffset }}
          transition={{
            duration: stepDuration * 3,
            delay: inView ? (i * delay) / 1000 : 0,
            ease: "easeOut",
          }}
          style={{ display: "inline-block", whiteSpace: "pre" }}
        >
          {el}
          {by === "word" && i < elements.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </span>
  );
}

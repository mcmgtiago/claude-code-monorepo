import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ScrollRevealTextProps {
  text: string;
  className?: string;
}

export default function ScrollRevealText({
  text,
  className = "",
}: ScrollRevealTextProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.9", "start 0.3"],
  });

  const words = text.split(" ");

  return (
    <div ref={containerRef} className={className}>
      <p className="flex flex-wrap justify-center gap-x-[0.3em] gap-y-[0.4em]">
        {words.map((word, i) => {
          const start = i / words.length;
          const end = start + 1 / words.length;
          return (
            <Word
              key={i}
              word={word}
              scrollYProgress={scrollYProgress}
              range={[start, end]}
            />
          );
        })}
      </p>
    </div>
  );
}

function Word({
  word,
  scrollYProgress,
  range,
}: {
  word: string;
  scrollYProgress: any;
  range: [number, number];
}) {
  const opacity = useTransform(scrollYProgress, range, [0.15, 1]);
  return (
    <motion.span
      style={{ opacity }}
      className="inline-block will-change-opacity"
    >
      {word}
    </motion.span>
  );
}
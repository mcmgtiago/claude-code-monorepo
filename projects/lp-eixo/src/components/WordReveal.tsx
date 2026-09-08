import { motion, useReducedMotion } from "motion/react";
import { ease } from "../lib/utils";

export function WordReveal({ text, className }: { text: string; className?: string }) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  return <span className={className} aria-label={text}>{words.map((word, index) => <motion.span aria-hidden="true" className="inline-block" key={`${word}-${index}`} initial={reduce ? false : { opacity: 0, y: 36, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: reduce ? 0 : 0.78, delay: reduce ? 0 : index * 0.065, ease }}>{word}{index < words.length - 1 && "\u00a0"}</motion.span>)}</span>;
}

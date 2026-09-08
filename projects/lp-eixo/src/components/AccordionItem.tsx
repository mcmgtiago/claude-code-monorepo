import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { ease } from "../lib/utils";

export function AccordionItem({ question, answer, open, onToggle, id }: { question: string; answer: string; open: boolean; onToggle: () => void; id: string }) {
  return <div className="faq-item"><button aria-expanded={open} aria-controls={`${id}-panel`} onClick={onToggle}><span>{question}</span><span className={`faq-icon ${open ? "is-open" : ""}`}><ChevronDown size={18}/></span></button><AnimatePresence initial={false}>{open && <motion.div id={`${id}-panel`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease }} className="faq-answer"><p>{answer}</p></motion.div>}</AnimatePresence></div>;
}

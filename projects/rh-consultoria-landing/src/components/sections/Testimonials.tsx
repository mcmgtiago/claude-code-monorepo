import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Quote, Star } from "lucide-react";
import { TESTIMONIALS } from "../../data/content";
import { FadeUp } from "../ui/FadeUp";
import { SectionHeader } from "../ui/SectionHeader";

export function Testimonials() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const current = TESTIMONIALS[index];

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setIndex((value) => (value + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <section className="section-pad overflow-hidden bg-white">
      <div className="container-narrow">
        <SectionHeader
          eyebrow="Depoimentos"
          title={
            <>
              O que nossos <span className="font-serif italic text-gradient">clientes dizem</span>
            </>
          }
          description="Relações de longo prazo nascem quando há confiança, entrega e clareza de impacto."
        />

        <FadeUp>
          <div
            className="relative rounded-[2.5rem] border border-black/5 bg-[var(--color-paper-soft)] p-5 shadow-soft md:p-8"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="absolute right-8 top-8 text-[var(--color-brand-blue)]/20">
              <Quote className="size-24" />
            </div>
            <AnimatePresence mode="wait">
              <motion.article
                key={current.id}
                initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -18, filter: "blur(8px)" }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="relative grid gap-8 md:grid-cols-[auto_1fr] md:items-center"
              >
                <img
                  src={current.avatar}
                  alt={`Foto de ${current.author}`}
                  className="size-24 rounded-full object-cover shadow-soft md:size-32"
                  loading="lazy"
                />
                <div>
                  <div className="mb-5 flex gap-1 text-amber-400">
                    {Array.from({ length: current.rating }).map((_, starIndex) => (
                      <Star key={starIndex} className="size-5 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-2xl font-semibold leading-snug tracking-tight text-[var(--color-ink)] md:text-4xl">
                    “{current.quote}”
                  </blockquote>
                  <div className="mt-7">
                    <p className="font-bold">{current.author}</p>
                    <p className="text-sm text-[var(--color-ink-soft)]">
                      {current.role} — {current.company}
                    </p>
                  </div>
                </div>
              </motion.article>
            </AnimatePresence>

            <div className="mt-8 flex justify-center gap-2">
              {TESTIMONIALS.map((testimonial, dotIndex) => (
                <button
                  key={testimonial.id}
                  type="button"
                  aria-label={`Ver depoimento ${dotIndex + 1}`}
                  onClick={() => setIndex(dotIndex)}
                  className={`h-2 rounded-full transition-all ${
                    dotIndex === index
                      ? "w-8 bg-[var(--color-brand-blue)]"
                      : "w-2 bg-black/20 hover:bg-black/35"
                  }`}
                />
              ))}
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
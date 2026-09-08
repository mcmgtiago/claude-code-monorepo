import { useState } from "react";
import { Container } from "@/components/common/Container";
import { SectionHeader } from "@/components/common/SectionHeader";
import { SectionLabel } from "@/components/common/SectionLabel";
import { Reveal } from "@/components/common/Reveal";
import { testimonials } from "@/data/testimonials";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

export function Testimonials() {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  const item = testimonials[current];

  return (
    <section className="py-16 sm:py-24 bg-paper">
      <Container>
        <div className="max-w-4xl mx-auto mb-12">
          <SectionLabel text="06 / RELAÇÕES DE CONFIANÇA" align="center" className="justify-center" />
          <SectionHeader heading="Quem trabalha conosco sabe a importância de ter acompanhamento próximo." />
        </div>

        <Reveal>
          <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-line p-8 sm:p-12">
            {/* Quote Icon */}
            <div className="mb-6">
              <Quote className="w-8 h-8 text-sand/60" />
            </div>

            {/* Quote */}
            <blockquote className="font-serif text-xl sm:text-2xl text-ink mb-8 leading-relaxed">
              "{item.quote}"
            </blockquote>

            {/* Author */}
            <div className="border-t border-line pt-6 mb-6">
              <p className="font-bold text-ink">{item.name}</p>
              <p className="text-sm text-ink-soft mb-1">{item.role}</p>
              <p className="text-sm text-wine font-medium">{item.company}</p>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrent(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === current ? "bg-wine" : "bg-line"
                    }`}
                    aria-label={`Depoimento ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={prev}
                  className="p-2 rounded-full hover:bg-paper-muted transition-colors"
                  aria-label="Depoimento anterior">
                  <ChevronLeft className="w-5 h-5 text-ink" />
                </button>
                <button
                  onClick={next}
                  className="p-2 rounded-full hover:bg-paper-muted transition-colors"
                  aria-label="Próximo depoimento">
                  <ChevronRight className="w-5 h-5 text-ink" />
                </button>
              </div>
            </div>
          </div>
        </Reveal>

        <p className="text-center text-xs text-muted mt-8">
          Depoimentos fictícios para apresentação do layout.
        </p>
      </Container>
    </section>
  );
}

import { CheckCircle2 } from "lucide-react";
import { CASES } from "../../data/content";
import { FadeUp } from "../ui/FadeUp";
import { SectionHeader } from "../ui/SectionHeader";

export function Cases() {
  return (
    <section id="cases" className="section-pad bg-white">
      <div className="container-content">
        <SectionHeader
          eyebrow="Cases de sucesso"
          title={
            <>
              Transformações reais, <span className="font-serif italic text-gradient">números reais</span>
            </>
          }
          description="Resultados que saíram do discurso e chegaram aos indicadores da operação."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {CASES.map((study, index) => (
            <FadeUp key={study.id} delay={index * 0.1}>
              <article className="group h-full overflow-hidden rounded-[24px] border border-black/5 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={study.image}
                    alt={`Case de sucesso ${study.client}`}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[var(--color-brand-blue)] backdrop-blur-sm">
                      {study.industry}
                    </span>
                    <h3 className="mt-3 text-2xl font-bold text-white">
                      {study.client}
                    </h3>
                  </div>
                </div>
                <div className="p-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-brand-blue)]">
                      Desafio
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-ink-soft)]">
                      {study.challenge}
                    </p>
                  </div>
                  <div className="mt-5">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-brand-purple)]">
                      Solução
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-ink-soft)]">
                      {study.solution}
                    </p>
                  </div>
                  <div className="mt-5 grid gap-2">
                    {study.results.map((result) => (
                      <div
                        key={result}
                        className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700"
                      >
                        <CheckCircle2 className="size-4" />
                        {result}
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
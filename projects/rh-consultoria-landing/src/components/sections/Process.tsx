import { PROCESS } from "../../data/content";
import { FadeUp } from "../ui/FadeUp";
import { SectionHeader } from "../ui/SectionHeader";

export function Process() {
  return (
    <section id="processo" className="section-pad bg-[var(--color-paper-soft)]">
      <div className="container-content">
        <SectionHeader
          eyebrow="Como trabalhamos"
          title="Um processo claro para resultados previsíveis"
          description="Cada etapa tem objetivo, entregável e indicador. O RH deixa de operar no escuro e passa a liderar transformação com dados."
        />

        <div className="relative grid gap-6 lg:grid-cols-4">
          <div className="absolute left-0 right-0 top-14 hidden h-px bg-gradient-to-r from-transparent via-[var(--color-brand-blue)]/30 to-transparent lg:block" />
          {PROCESS.map((step, index) => (
            <FadeUp key={step.number} delay={index * 0.1}>
              <article className="relative h-full rounded-[24px] border border-black/5 bg-white p-6 shadow-soft">
                <div className="mb-6 flex items-center justify-between">
                  <span className="grid size-16 place-items-center rounded-full bg-gradient-brand text-lg font-black text-white shadow-glow">
                    {step.number}
                  </span>
                  <span className="rounded-full bg-[var(--color-paper-soft)] px-3 py-1 text-xs font-bold text-[var(--color-ink-soft)]">
                    {step.duration}
                  </span>
                </div>
                <h3 className="text-2xl font-bold tracking-tight">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--color-ink-soft)]">
                  {step.description}
                </p>
                <ul className="mt-5 grid gap-2">
                  {step.deliverables.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-[var(--color-ink-soft)]">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--color-brand-blue)]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
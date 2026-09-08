import { PROBLEMS } from "../../data/content";
import { FadeUp } from "../ui/FadeUp";
import { Icon } from "../ui/Icon";
import { SectionHeader } from "../ui/SectionHeader";

export function ProblemSolution() {
  return (
    <section id="sobre" className="section-pad bg-[var(--color-paper-soft)]">
      <div className="container-content">
        <SectionHeader
          eyebrow="Problema + Solução"
          title={
            <>
              Você enfrenta algum <span className="font-serif italic text-gradient">desses desafios?</span>
            </>
          }
          description="Quando pessoas, liderança e estratégia deixam de conversar, o crescimento fica caro. Atuamos exatamente nesse ponto de virada."
        />

        <div className="grid gap-6 md:grid-cols-3">
          {PROBLEMS.map((problem, index) => (
            <FadeUp key={problem.id} delay={index * 0.08}>
              <article className="group relative h-full overflow-hidden rounded-[20px] border border-black/5 bg-white p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(0,0,0,0.10)]">
                <span className="absolute inset-x-0 top-0 h-1 bg-gradient-brand opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="mb-6 grid size-14 place-items-center rounded-2xl bg-[var(--color-brand-blue)]/10 text-[var(--color-brand-blue)]">
                  <Icon name={problem.icon} className="size-7" aria-hidden />
                </div>
                <h3 className="text-2xl font-bold tracking-tight">{problem.title}</h3>
                <p className="mt-4 text-base leading-7 text-[var(--color-ink-soft)]">
                  {problem.description}
                </p>
              </article>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
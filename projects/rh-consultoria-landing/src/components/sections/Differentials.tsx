import { DIFFERENTIATORS } from "../../data/content";
import { FadeUp } from "../ui/FadeUp";
import { Icon } from "../ui/Icon";
import { SectionHeader } from "../ui/SectionHeader";

export function Differentials() {
  return (
    <section className="section-pad bg-[var(--color-paper-soft)]">
      <div className="container-content">
        <SectionHeader
          eyebrow="Diferenciais"
          title="Por que nos escolhem"
          description="Consultoria de RH com profundidade técnica, mentalidade de negócio e compromisso real com resultado mensurável."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {DIFFERENTIATORS.map((item, index) => (
            <FadeUp key={item.id} delay={index * 0.08}>
              <article className="group relative h-full overflow-hidden rounded-[20px] border border-black/5 bg-white p-6 shadow-soft transition-all hover:-translate-y-1">
                <span
                  aria-hidden
                  className="absolute -right-10 -top-10 size-32 rounded-full bg-[var(--color-brand-blue)]/10 blur-2xl transition-transform duration-500 group-hover:scale-150"
                />
                <div className="relative grid size-12 place-items-center rounded-2xl bg-black/[0.04] text-[var(--color-brand-blue)]">
                  <Icon name={item.icon} className="size-6" aria-hidden />
                </div>
                <h3 className="relative mt-6 text-xl font-bold tracking-tight">
                  {item.title}
                </h3>
                <p className="relative mt-3 text-sm leading-6 text-[var(--color-ink-soft)]">
                  {item.description}
                </p>
              </article>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
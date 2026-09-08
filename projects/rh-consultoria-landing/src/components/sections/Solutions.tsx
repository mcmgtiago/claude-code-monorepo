import { ArrowRight } from "lucide-react";
import { SERVICES } from "../../data/content";
import { DeepShadowCard } from "../ui/DeepShadowCard";
import { FadeUp } from "../ui/FadeUp";
import { Icon } from "../ui/Icon";
import { SectionHeader } from "../ui/SectionHeader";

export function Solutions() {
  return (
    <section id="solucoes" className="section-pad bg-white">
      <div className="container-content">
        <SectionHeader
          eyebrow="Nossas soluções"
          title={
            <>
              Três pilares que <span className="font-serif italic text-gradient">transformam sua gente</span>
            </>
          }
          description="Da descoberta à execução, conectamos estratégia, liderança e acompanhamento para que o RH seja motor de crescimento."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {SERVICES.map((service, index) => (
            <FadeUp key={service.id} delay={index * 0.1}>
              <DeepShadowCard
                image={service.image}
                imageAlt={`${service.title} em contexto corporativo`}
                className="h-full"
              >
                <div className="mb-5 grid size-14 place-items-center rounded-2xl bg-gradient-brand text-white shadow-glow">
                  <Icon name={service.icon} className="size-7" aria-hidden />
                </div>
                <h3 className="text-2xl font-bold tracking-tight">{service.title}</h3>
                <p className="mt-4 text-base leading-7 text-[var(--color-ink-soft)]">
                  {service.description}
                </p>
                <a
                  href={service.href}
                  className="mt-6 inline-flex items-center gap-2 rounded-full text-sm font-bold text-[var(--color-brand-blue)] transition-colors hover:text-[var(--color-brand-purple)]"
                >
                  {service.cta}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </a>
              </DeepShadowCard>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
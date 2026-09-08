import { CheckCircle2 } from "lucide-react";
import { PRICING } from "../../data/content";
import { formatBRL } from "../../lib/utils";
import { FadeUp } from "../ui/FadeUp";
import { GradientButton } from "../ui/GradientButton";
import { SectionHeader } from "../ui/SectionHeader";

export function Pricing() {
  return (
    <section id="pricing" className="section-pad bg-[var(--color-paper-soft)]">
      <div className="container-content">
        <SectionHeader
          eyebrow="Modalidades"
          title={
            <>
              Investimento estratégico <span className="font-serif italic text-gradient">em gente</span>
            </>
          }
          description="Planos claros para diferentes momentos da empresa. Também criamos propostas customizadas para realidades específicas."
        />

        <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">
          {PRICING.map((plan, index) => (
            <FadeUp key={plan.id} delay={index * 0.1}>
              <article
                className={`relative h-full overflow-hidden rounded-[28px] border p-6 shadow-soft ${
                  plan.highlight
                    ? "border-transparent bg-[var(--color-ink)] text-white"
                    : "border-black/5 bg-white text-[var(--color-ink)]"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute inset-0 opacity-70" aria-hidden>
                    <div className="absolute -left-20 -top-20 size-60 rounded-full bg-[var(--color-brand-blue)]/40 blur-3xl" />
                    <div className="absolute -right-20 top-20 size-60 rounded-full bg-[var(--color-brand-coral)]/30 blur-3xl" />
                  </div>
                )}
                <div className="relative">
                  {plan.badge && (
                    <span className="mb-5 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-[var(--color-brand-blue)]">
                      {plan.badge}
                    </span>
                  )}
                  <h3 className="text-2xl font-bold tracking-tight">{plan.name}</h3>
                  <p
                    className={`mt-3 text-sm leading-6 ${
                      plan.highlight ? "text-white/70" : "text-[var(--color-ink-soft)]"
                    }`}
                  >
                    {plan.description}
                  </p>
                  <div className="mt-7 flex items-end gap-2">
                    <span className="text-4xl font-black tracking-tight">
                      {formatBRL(plan.price)}
                    </span>
                    <span
                      className={`mb-1 text-sm font-medium ${
                        plan.highlight ? "text-white/60" : "text-[var(--color-ink-soft)]"
                      }`}
                    >
                      / {plan.period}
                    </span>
                  </div>
                  <ul className="mt-7 grid gap-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-3 text-sm leading-6">
                        <CheckCircle2
                          className={`mt-0.5 size-5 shrink-0 ${
                            plan.highlight
                              ? "text-emerald-300"
                              : "text-[var(--color-brand-blue)]"
                          }`}
                        />
                        <span className={plan.highlight ? "text-white/82" : "text-[var(--color-ink-soft)]"}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <GradientButton
                    href="#contato"
                    size="lg"
                    fullWidth
                    variant={plan.highlight ? "primary" : "secondary"}
                    className="mt-8"
                  >
                    Solicitar proposta
                  </GradientButton>
                </div>
              </article>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { HERO_BADGES } from "../../data/content";
import { BlurText } from "../ui/BlurText";
import { FadeUp } from "../ui/FadeUp";
import { GradientButton } from "../ui/GradientButton";
import { VideoMarquee } from "../VideoMarquee";

export function Hero() {
  return (
    <section
      id="topo"
      className="relative min-h-screen overflow-hidden bg-white pt-28 md:pt-32"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-0 opacity-80"
        style={{
          background:
            "radial-gradient(circle at 15% 15%, rgba(61,129,227,0.16), transparent 32%), radial-gradient(circle at 85% 5%, rgba(236,72,153,0.10), transparent 30%), linear-gradient(180deg, #fff 0%, #f7f7f7 100%)",
        }}
      />
      <div className="absolute inset-0 -z-0 noise opacity-25" aria-hidden />

      <div className="container-content relative grid min-h-[calc(100vh-8rem)] items-center gap-12 pb-16 lg:grid-cols-[1.02fr_0.98fr] lg:pb-20">
        <div className="max-w-3xl">
          <FadeUp>
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm font-semibold text-[var(--color-ink-soft)] shadow-soft backdrop-blur-sm">
              <span className="relative grid size-5 place-items-center rounded-full bg-[var(--color-brand-blue)] text-white pulse-ring">
                <Sparkles className="size-3" aria-hidden />
              </span>
              Top 3 em RH Estratégico no Brasil
            </div>
          </FadeUp>

          <div className="mt-7">
            <BlurText
              as="h1"
              text="Sua estratégia de gente é a base do crescimento exponencial"
              className="block text-[clamp(3.25rem,8vw,7.2rem)] font-bold tracking-[-0.06em] text-[var(--color-ink)]"
              speed={0.055}
            />
          </div>

          <FadeUp delay={0.28}>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--color-ink-soft)] md:text-xl md:leading-9">
              Somos especialistas em transformar desafios de RH em oportunidades
              de crescimento. Com metodologia comprovada e 15+ anos de mercado,
              ajudamos empresas de todos os tamanhos a maximizar o potencial de
              seus talentos.
            </p>
          </FadeUp>

          <FadeUp delay={0.4}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <GradientButton
                href="#contato"
                size="lg"
                icon={<ArrowRight className="size-3.5" />}
              >
                Começar Diagnóstico
              </GradientButton>
              <GradientButton href="#cases" size="lg" variant="secondary">
                Ver Cases de Sucesso
              </GradientButton>
            </div>
          </FadeUp>

          <FadeUp delay={0.52}>
            <div className="mt-9 grid gap-3 sm:grid-cols-3">
              {HERO_BADGES.map((badge) => (
                <div
                  key={badge.label}
                  className="rounded-3xl border border-black/5 bg-white/70 p-4 shadow-soft backdrop-blur-sm"
                >
                  <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-ink)]">
                    <CheckCircle2 className="size-4 text-[var(--color-brand-blue)]" />
                    {badge.label}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[var(--color-ink-soft)]">
                    {badge.detail}
                  </p>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>

        <FadeUp delay={0.25} className="relative hidden lg:block">
          <VideoMarquee />
        </FadeUp>
      </div>
    </section>
  );
}
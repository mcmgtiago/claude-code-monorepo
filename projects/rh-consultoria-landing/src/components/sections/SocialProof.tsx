import { METRICS, TESTIMONIALS } from "../../data/content";
import { FadeUp } from "../ui/FadeUp";

export function SocialProof() {
  return (
    <section className="bg-white py-12 md:py-16">
      <div className="container-content">
        <FadeUp>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-[var(--color-ink)] p-6 text-white shadow-deep md:p-10">
            <div className="absolute inset-0 opacity-90" aria-hidden>
              <div className="absolute -left-24 -top-24 size-64 rounded-full bg-[var(--color-brand-blue)]/40 blur-3xl" />
              <div className="absolute -right-20 top-10 size-72 rounded-full bg-[var(--color-brand-coral)]/30 blur-3xl" />
            </div>

            <div className="relative grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <div className="flex -space-x-3">
                  {TESTIMONIALS.slice(0, 5).map((testimonial) => (
                    <img
                      key={testimonial.id}
                      src={testimonial.avatar}
                      alt={`Avatar de ${testimonial.author}`}
                      className="size-12 rounded-full border-2 border-white object-cover md:size-14"
                      loading="lazy"
                    />
                  ))}
                </div>
                <h2 className="mt-6 text-3xl font-bold tracking-tight md:text-5xl">
                  Empresas que crescem com pessoas no centro.
                </h2>
                <p className="mt-4 max-w-xl text-base leading-7 text-white/70">
                  Mais de 48 mil profissionais impactados por programas de cultura,
                  liderança e performance construídos para durar.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {METRICS.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-[28px] border border-white/10 bg-white/10 p-6 backdrop-blur-md"
                  >
                    <div className="text-4xl font-black tracking-tight md:text-5xl">
                      {metric.value}
                      <span className="text-gradient">{metric.suffix}</span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-white/70">
                      {metric.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
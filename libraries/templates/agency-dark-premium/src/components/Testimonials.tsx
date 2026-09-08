import { useEffect, useRef, useState } from 'react'
import { Star } from 'lucide-react'
import { FadeIn } from './FadeIn'

interface Testimonial {
  company: string
  result: string
  description: string
}

const testimonials: Testimonial[] = [
  { company: 'Kopenhagen Palmas', result: '+200% da meta atingida', description: 'Faturamento 2x acima do objetivo em período de pico' },
  { company: 'Aurora SPA', result: 'Conversões diárias via Instagram', description: 'Marca consolidada como referência premium em estética' },
  { company: 'LM Engenharia', result: 'Autoridade no mercado técnico', description: 'Vitrine digital de alto nível que fecha projetos' },
  { company: 'Clínica Val Prudêncio', result: 'Diferenciação no mercado', description: 'Protocolos valorizados e clientes qualificados atraídos' },
  { company: 'Studio Petúnia', result: '+1400% de alcance', description: 'De 800 para 12 mil seguidores qualificados em 60 dias' },
  { company: 'Verde Mar Eventos', result: '100% ingressos vendidos', description: 'Próxima edição esgotada em 48h após cobertura' },
  { company: 'Aroma Café', result: 'ROAS 8.7x', description: 'Investimento se pagou no primeiro mês de tráfego' },
  { company: 'Barbearia Cordel', result: '+47 clientes/mês', description: 'Fechamento semanal de clientes pelo Instagram' },
]

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div className="glass-card flex flex-col gap-4 rounded-2xl p-6">
      {/* Stars */}
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} size={14} className="fill-[var(--accent)] text-[var(--accent)]" />
        ))}
      </div>

      {/* Result - main metric */}
      <span className="font-serif text-xl italic text-[var(--accent)]">{t.result}</span>

      {/* Short description */}
      <p className="text-sm leading-relaxed text-white/50">{t.description}</p>

      {/* Company */}
      <div className="mt-auto flex items-center gap-3 border-t border-white/[0.04] pt-4">
        <span className="grid size-8 place-items-center rounded-lg bg-[rgba(255,90,0,0.15)] text-xs font-bold text-[var(--accent)]">
          {t.company[0]}
        </span>
        <span className="text-sm font-medium text-white/70">{t.company}</span>
      </div>
    </div>
  )
}

function MarqueeColumn({ items, reverse = false, speed = 25 }: { items: Testimonial[]; reverse?: boolean; speed?: number }) {
  const [isPaused, setIsPaused] = useState(false)
  const columnRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={columnRef}
      className="flex flex-col gap-4 overflow-hidden"
      style={{ height: '600px' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="flex flex-col gap-4"
        style={{
          animation: `marquee-vertical ${speed}s linear infinite ${reverse ? 'reverse' : ''}`,
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      >
        {items.map((t, i) => (
          <TestimonialCard key={`a-${i}`} t={t} />
        ))}
        {items.map((t, i) => (
          <TestimonialCard key={`b-${i}`} t={t} />
        ))}
      </div>
    </div>
  )
}

export function Testimonials() {
  const col1 = testimonials.slice(0, 4)
  const col2 = testimonials.slice(4)

  return (
    <section className="relative bg-[var(--bg-deep)] py-24 lg:py-36" id="depoimentos">
      <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: 'url(/textures/dot-pattern.svg)', backgroundRepeat: 'repeat' }} />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)] opacity-[0.04] blur-[120px]" />

      <style>{`
        @keyframes marquee-vertical {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
      `}</style>

      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-16">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          {/* Left - heading */}
          <FadeIn y={30}>
            <h2 className="font-serif text-4xl italic leading-[1.05] tracking-[-0.02em] text-white sm:text-5xl lg:text-6xl">
              Quem trabalha <span className="text-[var(--accent)]">conosco, cresce.</span>
            </h2>
            <p className="mt-6 max-w-md text-base text-white/50">
              Resultados reais de marcas que confiaram no método Roxmídia para construir presença digital que converte.
            </p>
          </FadeIn>

          {/* Right - two vertical marquee columns */}
          <div className="relative">
            {/* Top/bottom fade */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-[var(--bg-deep)] to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-gradient-to-t from-[var(--bg-deep)] to-transparent" />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <MarqueeColumn items={col1} speed={60} />
              <div className="hidden md:block">
                <MarqueeColumn items={col2} speed={70} reverse />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

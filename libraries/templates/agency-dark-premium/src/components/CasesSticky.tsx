import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { FadeIn } from './FadeIn'

const cases = [
  {
    number: '01',
    category: 'Aceleração de Vendas',
    name: 'Kopenhagen Palmas',
    result: '+200% da meta',
    description: 'Faturamento 2x acima do objetivo em período de pico. Campanhas ultra segmentadas com criativos de alta conversão.',
    image: 'https://images.pexels.com/photos/2253643/pexels-photo-2253643.jpeg?auto=compress&cs=tinysrgb&w=1200',
    color: 'from-amber-600/90 to-[var(--accent)]/80',
    logo: '/clients/kopenhagen.jpeg',
  },
  {
    number: '02',
    category: 'Posicionamento de Marca',
    name: 'Aurora SPA',
    result: 'Vendas diárias via IG',
    description: 'Narrativa desejável e sofisticada. +30 vídeos estratégicos, cobertura de eventos e Stories diários.',
    image: 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=1200',
    color: 'from-rose-700/80 to-pink-900/70',
    logo: '/clients/aurora.jpeg',
  },
  {
    number: '03',
    category: 'Autoridade Técnica',
    name: 'LM Engenharia',
    result: 'Referência no setor',
    description: 'Conteúdo alinhado às normas técnicas. Linha editorial que gera credibilidade e atrai projetos qualificados.',
    image: 'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=1200',
    color: 'from-blue-800/80 to-slate-900/70',
    logo: '/clients/lm.jpeg',
  },
  {
    number: '04',
    category: 'Estética e Conversão',
    name: 'Clínica Val Prudêncio',
    result: 'Clientes qualificados',
    description: 'Imagem de alta autoridade para protocolos exclusivos. Conteúdos focados em desejo e conversão.',
    image: 'https://images.pexels.com/photos/3985338/pexels-photo-3985338.jpeg?auto=compress&cs=tinysrgb&w=1200',
    color: 'from-purple-800/80 to-violet-900/70',
    logo: '/clients/val-prudencio.jpeg',
  },
]

function CaseCard({ c, index, progress }: { c: typeof cases[0]; index: number; progress: any }) {
  const total = cases.length
  const rangeStart = index / total
  const targetScale = 1 - (total - 1 - index) * 0.04
  const scale = useTransform(progress, [rangeStart, 1], [1, targetScale])
  const opacity = useTransform(progress, [rangeStart, Math.min(rangeStart + 0.25, 1)], [1, index === total - 1 ? 1 : 0.5])

  return (
    <div className="sticky top-6 sm:top-8 md:top-10" style={{ paddingTop: `${index * 14}px` }}>
      <motion.div style={{ scale, opacity }} className="origin-top">
        <div className="relative min-h-[400px] overflow-hidden rounded-[2rem] shadow-2xl shadow-black/40 sm:min-h-[440px]">
          {/* Background image */}
          <div className="absolute inset-0 z-0">
            <img src={c.image} alt="" className="h-full w-full object-cover" loading="lazy" />
            <div className={`absolute inset-0 bg-gradient-to-r ${c.color}`} />
            <div className="absolute inset-0 bg-[var(--bg-deep)]/30" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex h-full min-h-[400px] flex-col justify-between p-8 sm:min-h-[440px] sm:p-10 md:p-14">
            {/* Top */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-5 sm:gap-6">
                <span className="font-serif text-6xl italic leading-none text-white/90 sm:text-7xl lg:text-8xl">{c.number}</span>
                {/* Client logo */}
                <img src={c.logo} alt={c.name} className="size-16 shrink-0 rounded-2xl object-cover border border-white/20 shadow-lg sm:size-20" />
                <div>
                  <span className="text-sm font-medium uppercase tracking-wider text-white/70">{c.category}</span>
                  <span className="mt-1 block font-serif text-3xl italic text-white sm:text-4xl">{c.name}</span>
                </div>
              </div>
            </div>

            {/* Bottom */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-lg text-lg leading-relaxed text-white/80 sm:text-xl">{c.description}</p>
              <span className="shrink-0 rounded-full bg-white px-6 py-3 text-base font-bold text-black">
                {c.result}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export function CasesSticky() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  return (
    <section className="relative bg-[var(--bg-deep)] px-5 sm:px-8 lg:px-16" ref={sectionRef}>
      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/3 top-[20%] h-[600px] w-[600px] rounded-full bg-[var(--accent)] opacity-[0.04] blur-[160px]" />

      <div className="relative mx-auto max-w-[1440px]">
        {/* Heading */}
        <div className="py-20 sm:py-24">
          <FadeIn y={40}>
            <h2 className="max-w-4xl font-serif text-4xl italic leading-[1.05] tracking-[-0.02em] text-white sm:text-6xl">
              Resultados que <span className="text-[var(--accent)]">falam por si.</span>
            </h2>
            <p className="mt-6 max-w-lg text-base text-white/45">
              Cases reais de clientes que confiaram na Roxmídia para crescer no digital.
            </p>
          </FadeIn>
        </div>

        {/* Sticky stacking cards */}
        <div className="pb-[25vh]">
          {cases.map((c, i) => (
            <div key={c.number} className="mb-8 last:mb-0">
              <CaseCard c={c} index={i} progress={scrollYProgress} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

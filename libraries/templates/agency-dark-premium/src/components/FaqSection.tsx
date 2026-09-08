import { useState, useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import { Plus } from 'lucide-react'
import { FadeIn } from './FadeIn'

const faqs = [
  ['Quanto tempo leva para ver resultados?', 'Os sinais iniciais podem surgir nas primeiras semanas. Resultados consistentes em vendas e leads costumam exigir de 60 a 90 dias, conforme o segmento.'],
  ['Vocês criam o conteúdo completo?', 'Sim. Cuidamos de planejamento, roteiro, direção, edição e publicação. Quando a gravação depende do cliente, entregamos orientação prática.'],
  ['Qual é o investimento mínimo em mídia?', 'A recomendação é avaliada caso a caso. Segmento, praça, concorrência e objetivo definem a verba adequada.'],
  ['Existe contrato de fidelidade?', 'Os projetos podem operar com renovação mensal. Condições e escopo são apresentados com transparência na proposta.'],
  ['Vocês atendem em todo o Brasil?', 'Sim. Projetos digitais são atendidos remotamente. Coberturas presenciais dependem da localização e logística.'],
  ['Como funciona o diagnóstico gratuito?', 'Analisamos sua presença digital atual, identificamos oportunidades e apresentamos uma proposta sem compromisso.'],
]

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [spotPos, setSpotPos] = useState({ x: -200, y: -200 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handler = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      setSpotPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }
    el.addEventListener('mousemove', handler)
    return () => el.removeEventListener('mousemove', handler)
  }, [])

  return (
    <section className="relative bg-[var(--bg-deep)] px-5 py-24 sm:px-8 lg:px-16 lg:py-36">
      <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: 'url(/textures/dot-pattern.svg)', backgroundRepeat: 'repeat' }} />

      <div className="relative mx-auto max-w-[1080px]">
        {/* Header */}
        <div className="mb-14 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <FadeIn delay={0}>
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.06] px-3 py-1 text-xs text-white/80 backdrop-blur">
                <span className="size-1.5 rounded-full bg-white/70" /> FAQ
              </span>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h2 className="text-3xl font-normal tracking-[-0.02em] leading-[1.05] text-white sm:text-4xl">
                Respostas para as perguntas<br className="hidden sm:block" /> que mais aparecem.
              </h2>
            </FadeIn>
          </div>
          <FadeIn delay={0.2} className="max-w-sm">
            <p className="text-sm text-white/50 sm:text-base">
              Entenda como a Roxmídia funciona, o que cobre e o que esperar do processo.
            </p>
          </FadeIn>
        </div>

        {/* FAQ cards */}
        <div
          ref={containerRef}
          className="relative flex flex-col gap-3"
        >
          {/* Spotlight ring effect on container */}
          <span
            className="pointer-events-none absolute inset-0 z-0 rounded-2xl"
            style={{
              background: `radial-gradient(300px circle at ${spotPos.x}px ${spotPos.y}px, rgba(255,255,255,0.06), transparent 60%)`,
            }}
          />

          {faqs.map(([q, a], idx) => (
            <motion.div
              key={q}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className={`relative rounded-2xl border px-6 transition-colors duration-300 ${
                openIndex === idx
                  ? 'border-white/[0.06] bg-white/[0.06]'
                  : 'border-white/[0.04] bg-white/[0.025] hover:bg-white/[0.04]'
              }`}
            >
              {/* Per-card spotlight */}
              <span
                className="pointer-events-none absolute inset-0 z-0 rounded-2xl"
                style={{
                  background: `radial-gradient(250px circle at var(--spot-x, -200px) var(--spot-y, -200px), rgba(255,255,255,0.04), transparent 60%)`,
                  padding: '1px',
                  WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                }}
              />

              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="relative z-10 flex w-full min-h-[72px] items-center justify-between gap-4 py-6 text-left text-sm font-medium text-white sm:text-base"
              >
                <span className="flex-1 pr-4">{q}</span>
                <span className={`flex size-7 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.04] text-white/70 transition-transform duration-300 ${openIndex === idx ? 'rotate-45' : ''}`}>
                  <Plus size={14} />
                </span>
              </button>

              {/* Collapsible answer */}
              <div
                className={`relative z-10 overflow-hidden transition-all duration-300 ease-out ${
                  openIndex === idx ? 'max-h-40 pb-6' : 'max-h-0'
                }`}
              >
                <p className="text-sm leading-relaxed text-white/50">{a}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Got Questions card */}
        <div className="mt-8 rounded-2xl border border-white/[0.06] bg-white/[0.04] p-6">
          <h3 className="text-lg font-semibold text-white">Tem outra dúvida?</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/50">Nossa equipe está aqui para facilitar. Fale com a gente pelo WhatsApp ou e-mail.</p>
          <a href="#contato" className="mt-5 inline-flex items-center gap-1 text-sm text-white hover:text-white/80 transition-colors">
            Falar conosco <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </section>
  )
}

import { motion } from 'motion/react'
import { Zap, Target, TrendingUp, Lock, XCircle, CheckCircle2 } from 'lucide-react'
import { FadeIn, FadeInStagger, FadeInItem } from './FadeIn'

const beforeSteps = [
  'Posta sem estratégia ou calendário',
  'Relatórios que ninguém lê',
  'Atendimento robotizado e distante',
  'Foco em curtidas (métricas de vaidade)',
  'Pacotes engessados sem personalização',
  'Sem visão de funil ou conversão',
]

const afterSteps = [
  'Estratégia por trás de cada publicação',
  'Métricas ligadas ao seu faturamento',
  'Equipe próxima no seu WhatsApp',
  'Foco em vendas, leads e conversão',
  'Projeto sob medida para o seu momento',
  'Funil completo do topo à venda',
]

export function Comparison() {
  return (
    <section className="relative overflow-hidden bg-[#0a0a0a] px-5 py-24 text-white sm:px-8 lg:px-16 lg:py-36">
      {/* SVG grid pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.5]" style={{ backgroundImage: 'url(/textures/circuit-board.svg)', backgroundRepeat: 'repeat' }} />
      {/* Ambient glow */}
      <div className="pointer-events-none absolute right-1/4 top-1/3 h-[500px] w-[500px] rounded-full bg-[var(--accent)] opacity-[0.06] blur-[140px]" />
      <div className="relative mx-auto max-w-[1440px]">
        {/* Heading */}
        <FadeIn y={30} className="mb-20 text-center">
          <h2 className="mx-auto max-w-4xl font-serif text-4xl italic leading-[1.05] tracking-[-0.02em] text-white sm:text-5xl lg:text-6xl">
            Pare de improvisar. Comece a <span className="text-[var(--accent)]">posicionar.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-base text-white/50">
            A diferença entre estar nas redes e ter presença digital é método.
          </p>
        </FadeIn>

        {/* Two column comparison */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_1.3fr] lg:gap-8">
          {/* BEFORE - smaller, muted */}
          <FadeIn y={20} delay={0.1}>
            <div className="flex flex-col rounded-3xl border border-white/[0.04] bg-[var(--bg-card)] p-8 sm:p-10">
              <h3 className="mb-8 text-base font-medium text-white/50 uppercase tracking-wider">Agência comum</h3>
              <div className="space-y-5">
                {beforeSteps.map((step, i) => (
                  <div key={step} className="flex items-start gap-3">
                    <XCircle size={16} className="mt-0.5 shrink-0 text-red-300" />
                    <span className="text-sm text-white/55">{step}</span>
                  </div>
                ))}
              </div>
              {/* Time indicator */}
              <div className="mt-10 rounded-full bg-red-50 px-5 py-3 text-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-red-400">Meses sem resultado</span>
              </div>
            </div>
          </FadeIn>

          {/* AFTER - LARGER, ORANGE, PROMINENT */}
          <FadeIn y={20} delay={0.2}>
            <div className="relative flex flex-col overflow-hidden rounded-3xl bg-[var(--accent)] p-8 text-white shadow-[0_30px_80px_-20px_rgba(255,90,0,0.4)] sm:p-10">
              {/* Grain overlay */}
              <div className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay" style={{ backgroundImage: 'url(/textures/grain.png)', backgroundSize: '200px' }} />
              {/* Glow */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-[300px] w-[300px] rounded-full bg-white opacity-[0.08] blur-[80px]" />

              <div className="relative">
                <div className="mb-8 flex items-center justify-between">
                  <h3 className="text-base font-medium uppercase tracking-wider text-white/80">Roxmídia</h3>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">Recomendado</span>
                </div>
                <div className="space-y-5">
                  {afterSteps.map((step) => (
                    <div key={step} className="flex items-start gap-3">
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-white" />
                      <span className="text-sm font-medium text-white/90">{step}</span>
                    </div>
                  ))}
                </div>
                {/* Time indicator */}
                <div className="mt-10 flex items-center gap-3 rounded-full bg-white/15 px-5 py-3">
                  <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/20">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full bg-white"
                      initial={{ width: '0%' }}
                      whileInView={{ width: '100%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                  <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-white">
                    Resultados em semanas
                  </span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Capabilities row with animated icons */}
        <FadeInStagger className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
          {[
            { Icon: Zap, label: 'Velocidade', desc: 'Da estratégia à publicação em dias' },
            { Icon: Target, label: 'Precisão', desc: 'Cada ação orientada por dados reais' },
            { Icon: TrendingUp, label: 'Conversão', desc: 'Foco em vendas, não em vaidade' },
            { Icon: Lock, label: 'Consistência', desc: 'Presença constante e posicionada' },
          ].map((item) => (
            <FadeInItem key={item.label}>
              <div className="flex items-start gap-4 rounded-2xl border border-white/[0.04] bg-[var(--bg-card)] p-5">
                <motion.span
                  className="grid size-10 shrink-0 place-items-center rounded-xl border border-[rgba(255,90,0,0.2)] bg-[rgba(255,90,0,0.05)] text-[var(--accent)]"
                  whileInView={{ rotate: [0, -10, 10, -5, 0] }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
                >
                  <item.Icon size={18} strokeWidth={1.6} />
                </motion.span>
                <div>
                  <span className="block text-sm font-medium text-white">{item.label}</span>
                  <span className="block text-xs text-white/40">{item.desc}</span>
                </div>
              </div>
            </FadeInItem>
          ))}
        </FadeInStagger>
      </div>
    </section>
  )
}

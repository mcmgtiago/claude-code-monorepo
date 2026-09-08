import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

const ease = [0.22, 1, 0.36, 1] as const

const indicators = [
  { value: '18 anos', label: 'de atuação' },
  { value: '12 mil', label: 'contratações' },
  { value: '9 estados', label: 'atendidos' },
]

export function Hero() {
  const fadeUp = {
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 0.62, ease },
  }

  return (
    <section className="bg-paper min-h-[760px] flex items-center">
      <div className="container mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* COLUNA ESQUERDA */}
          <div className="lg:col-span-6 space-y-8 order-1">
            {/* EYEBROW */}
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, ease }}
            >
              <span className="block w-8 h-px bg-wine" aria-hidden="true" />
              <span className="text-xs sm:text-sm tracking-widest uppercase font-mono font-medium text-ink">
                Recursos Humanos com Experiência e Proximidade
              </span>
            </motion.div>

            {/* HEADLINE */}
            <motion.h1
              className="font-sans text-ink"
              style={{
                fontSize: 'clamp(3rem, 6.2vw, 6.8rem)',
                lineHeight: '0.92',
                letterSpacing: '-0.055em',
              }}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease }}
            >
              Pessoas certas tornam o crescimento{' '}
              <span className="font-serif italic">mais seguro.</span>
            </motion.h1>

            {/* SUBHEADLINE */}
            <motion.p
              className="text-base sm:text-lg text-ink-soft max-w-md leading-relaxed"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, delay: 0.05, ease }}
            >
              A PILAR apoia empresas em recrutamento, trabalho temporário, terceirização, administração de pessoal e desenvolvimento de equipes.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 pt-2"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, delay: 0.1, ease }}
            >
              <Link
                to="/empresas"
                onClick={() => trackEvent('hero_company_cta_clicked')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-wine hover:bg-wine-deep text-white px-6 sm:px-8 py-3 rounded-full font-medium transition-all duration-300 hover:-translate-y-0.5 min-h-[44px]"
                aria-label="Solicitar uma proposta para sua empresa"
              >
                Solicitar uma proposta
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                to="/vagas"
                onClick={() => trackEvent('hero_candidate_cta_clicked')}
                className="w-full sm:w-auto inline-flex items-center justify-center bg-transparent hover:bg-paper-muted text-ink px-6 sm:px-8 py-3 rounded-full font-medium border border-line transition-all duration-300 hover:-translate-y-0.5 min-h-[44px]"
                aria-label="Encontrar uma vaga"
              >
                Encontrar uma vaga
              </Link>
            </motion.div>

            {/* MICROCOPY */}
            <motion.p
              className="text-xs sm:text-sm text-ink-soft font-mono pt-2"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.15, ease }}
            >
              Atendimento consultivo, processos claros e acompanhamento próximo em todas as etapas.
            </motion.p>

            {/* INDICADORES */}
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-8 border-t border-line"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2, ease }}
            >
              {indicators.map((indicator) => (
                <div key={indicator.value}>
                  <div className="font-mono font-bold text-xl sm:text-2xl text-wine">
                    {indicator.value}
                  </div>
                  <div className="text-xs sm:text-sm text-ink-soft mt-1">
                    {indicator.label}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* DISCLAIMER */}
            <motion.p
              className="text-xs text-muted font-mono pt-2"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.25, ease }}
            >
              Dados demonstrativos. Indicadores ilustrativos para composição da interface.
            </motion.p>
          </div>

          {/* COLUNA DIREITA - MÍDIA */}
          <div className="lg:col-span-6 order-2">
            <motion.div
              className="relative bg-white rounded-3xl overflow-hidden shadow-lg border border-line"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.65, delay: 0.15, ease }}
            >
              {/* IMAGEM / VÍDEO PLACEHOLDER */}
              <div className="aspect-[4/5] bg-gradient-to-br from-navy-soft/15 via-paper to-wine-soft/15 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/30 to-transparent" />
                <div className="text-center z-10 px-6">
                  <div className="text-xs font-mono uppercase tracking-wider text-muted mb-3">
                    [Vídeo / Foto]
                  </div>
                  <div className="text-3xl text-ink-soft mb-2" aria-hidden="true">◐</div>
                  <div className="text-sm text-ink-soft font-mono">
                    placeholder 4:5
                  </div>
                </div>
              </div>

              {/* ETIQUETA SUPERIOR ESQUERDA */}
              <motion.div
                className="absolute top-4 left-4 z-20"
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.35, ease }}
              >
                <div className="flex items-center gap-2 bg-wine/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-mono font-medium uppercase tracking-wider">
                  <span className="block w-1.5 h-1.5 rounded-full bg-sand animate-pulse" aria-hidden="true" />
                  Atendimento em andamento
                </div>
              </motion.div>

              {/* BLOCO INFERIOR - PROCESSO ATIVO */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-navy-deep via-navy/90 to-transparent p-5 sm:p-6 text-white z-20"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: 0.45, ease }}
              >
                <div className="font-mono text-[10px] sm:text-xs uppercase tracking-widest mb-2 text-sand">
                  Processo ativo
                </div>
                <div className="font-serif text-base sm:text-lg font-medium leading-snug">
                  Recrutamento para operação logística
                </div>
                <div className="text-xs sm:text-sm text-line-light font-mono mt-1">
                  42 posições em acompanhamento
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero

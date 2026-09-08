import { motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'

const ease = [0.22, 1, 0.36, 1] as const

const HeroA = () => {
  const itemVariants = {
    hidden: { opacity: 0, y: 18, filter: 'blur(5px)' },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.62,
        delay: i * 0.1,
        ease
      }
    })
  }

  return (
    <div className="bg-paper min-h-screen lg:min-h-[760px] flex items-center">
      <a href="#content" className="skip-link">Ir para conteúdo principal</a>
      
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* COLUNA ESQUERDA */}
          <motion.div 
            className="lg:col-span-6 space-y-8"
            initial="hidden"
            animate="visible"
          >
            {/* EYEBROW */}
            <motion.div 
              className="flex items-center gap-3"
              variants={itemVariants}
              custom={0}
            >
              <div className="w-2 h-6 bg-wine rounded-full" />
              <span className="text-xs sm:text-sm tracking-widest uppercase font-mono font-medium text-ink">
                Recursos Humanos com Experiência e Proximidade
              </span>
            </motion.div>

            {/* HEADLINE */}
            <motion.h1 
              className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-medium text-ink leading-tight"
              style={{
                fontSize: 'clamp(3rem, 6.2vw, 6.8rem)',
                lineHeight: 0.92,
                letterSpacing: '-0.055em'
              }}
              variants={itemVariants}
              custom={1}
            >
              Pessoas certas tornam o crescimento{' '}
              <span className="font-serif italic">mais seguro.</span>
            </motion.h1>

            {/* SUBHEADLINE */}
            <motion.p 
              className="text-base sm:text-lg text-ink-soft max-w-md leading-relaxed"
              variants={itemVariants}
              custom={2}
            >
              A PILAR apoia empresas em recrutamento, trabalho temporário, terceirização, administração de pessoal e desenvolvimento de equipes.
            </motion.p>

            {/* CTAs */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 pt-4"
              variants={itemVariants}
              custom={3}
            >
              <button 
                className="bg-wine hover:bg-wine-deep text-white px-6 sm:px-8 py-3 rounded-full font-medium transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2 min-h-[44px]"
                aria-label="Solicitar uma proposta para sua empresa"
              >
                Solicitar uma proposta
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <button 
                className="bg-paper-muted hover:bg-paper-muted/80 text-ink px-6 sm:px-8 py-3 rounded-full font-medium border border-line transition-all duration-300 hover:-translate-y-0.5 min-h-[44px]"
                aria-label="Encontrar uma vaga"
              >
                Encontrar uma vaga
              </button>
            </motion.div>

            {/* MICROCOPY */}
            <motion.p 
              className="text-xs sm:text-sm text-ink-soft font-mono pt-4"
              variants={itemVariants}
              custom={4}
            >
              Atendimento consultivo, processos claros e acompanhamento próximo em todas as etapas.
            </motion.p>

            {/* INDICADORES */}
            <motion.div 
              className="grid grid-cols-3 gap-4 pt-8 border-t border-line"
              variants={itemVariants}
              custom={5}
            >
              {[
                { label: '18 anos', value: 'de atuação' },
                { label: '12 mil', value: 'contratações' },
                { label: '9 estados', value: 'atendidos' }
              ].map((indicator, i) => (
                <div key={i}>
                  <div className="font-mono font-bold text-lg sm:text-xl text-wine">
                    {indicator.label}
                  </div>
                  <div className="text-xs text-ink-soft mt-1">
                    {indicator.value}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* NOTA */}
            <motion.p 
              className="text-xs text-muted font-mono pt-4"
              variants={itemVariants}
              custom={6}
            >
              Indicadores ilustrativos. Substituir pelos dados oficiais da empresa antes da publicação.
            </motion.p>
          </motion.div>

          {/* COLUNA DIREITA - MÍDIA */}
          <motion.div 
            className="lg:col-span-6"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.62, delay: 0.4, ease }}
          >
            <div className="relative bg-white rounded-3xl overflow-hidden shadow-lg border border-line">
              {/* IMAGEM PLACEHOLDER */}
              <div className="aspect-[4/5] bg-gradient-to-br from-navy-soft/10 via-paper to-wine-soft/10 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/20 to-transparent" />
                <div className="text-center z-10">
                  <div className="text-sm font-mono uppercase tracking-wider text-muted mb-2">
                    [Vídeo/Foto]
                  </div>
                  <div className="text-2xl text-ink-soft">🎬</div>
                </div>
              </div>

              {/* ETIQUETA SUPERIOR */}
              <motion.div 
                className="absolute top-4 left-4 right-4 z-20"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6, ease }}
              >
                <div className="bg-wine/90 backdrop-blur-sm text-white px-3 py-1.5 rounded text-xs font-mono font-medium inline-block">
                  ATENDIMENTO EM ANDAMENTO
                </div>
              </motion.div>

              {/* BLOCO INFERIOR - PROCESSO ATIVO */}
              <motion.div 
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-navy-deep via-navy to-transparent p-4 text-white z-20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8, ease }}
              >
                <div className="font-mono text-xs uppercase tracking-wider mb-2 text-sand">PROCESSO ATIVO</div>
                <div className="font-serif text-base font-medium mb-1">
                  Recrutamento para operação logística
                </div>
                <div className="text-sm text-line-light font-mono">
                  42 posições em acompanhamento
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default HeroA

import { motion } from 'motion/react'
import { ArrowUpRight, FileText } from 'lucide-react'

const ease = [0.22, 1, 0.36, 1] as const

const HeroB = () => {
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          {/* COLUNA ESQUERDA */}
          <motion.div 
            className="lg:col-span-6 space-y-10 pt-4"
            initial="hidden"
            animate="visible"
          >
            {/* EYEBROW */}
            <motion.div 
              className="flex items-center gap-3"
              variants={itemVariants}
              custom={0}
            >
              <div className="w-1.5 h-5 bg-wine" />
              <span className="text-xs tracking-[0.2em] uppercase font-mono font-medium text-muted">
                Recursos Humanos com Experiência e Proximidade
              </span>
            </motion.div>

            {/* HEADLINE */}
            <motion.h1 
              className="font-serif text-ink"
              style={{
                fontSize: 'clamp(3rem, 6.2vw, 6.8rem)',
                lineHeight: 0.92,
                letterSpacing: '-0.055em'
              }}
              variants={itemVariants}
              custom={1}
            >
              Pessoas certas
              <br />
              tornam o
              <br />
              crescimento{' '}
              <span className="font-serif italic text-wine">mais seguro.</span>
            </motion.h1>

            {/* SUBHEADLINE */}
            <motion.p 
              className="text-base text-ink-soft max-w-sm leading-relaxed"
              variants={itemVariants}
              custom={2}
            >
              A PILAR apoia empresas em recrutamento, trabalho temporário, terceirização, administração de pessoal e desenvolvimento de equipes.
            </motion.p>

            {/* INDICADORES EM BLOCOS COM BORDA */}
            <motion.div 
              className="grid grid-cols-3 gap-3 pt-6"
              variants={itemVariants}
              custom={3}
            >
              {[
                { number: '18', unit: 'anos', desc: 'de atuação' },
                { number: '12k', unit: '', desc: 'contratações' },
                { number: '9', unit: 'UFs', desc: 'atendidos' }
              ].map((item, i) => (
                <div 
                  key={i} 
                  className="border border-line p-3 rounded-sm"
                >
                  <div className="font-mono text-sm font-bold text-navy">
                    {item.number}
                    {item.unit && <span className="text-muted font-normal ml-0.5">{item.unit}</span>}
                  </div>
                  <div className="text-xs text-muted mt-1 leading-tight">
                    {item.desc}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-3 pt-6"
              variants={itemVariants}
              custom={4}
            >
              <button 
                className="bg-wine hover:bg-wine-deep text-white px-7 py-3 rounded-full font-medium transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2 min-h-[46px]"
                aria-label="Solicitar uma proposta"
              >
                Solicitar uma proposta
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <button 
                className="text-navy hover:text-wine px-7 py-3 rounded-full font-medium border border-line hover:border-wine transition-all duration-300 min-h-[46px]"
                aria-label="Encontrar uma vaga"
              >
                Encontrar uma vaga
              </button>
            </motion.div>
          </motion.div>

          {/* COLUNA DIREITA - MIDIA */}
          <motion.div 
            className="lg:col-span-6"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.62, delay: 0.3, ease }}
          >
            <div className="relative bg-white rounded-3xl overflow-hidden border border-line shadow-sm">
              <div className="aspect-[4/5] bg-gradient-to-br from-ivory via-paper to-sand-soft/30 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/30 to-transparent" />
                <div className="text-center z-10">
                  <div className="text-sm font-mono uppercase tracking-wider text-muted mb-2">
                    [Video/Foto]
                  </div>
                  <div className="text-2xl text-ink-soft">🎬</div>
                </div>
              </div>

              {/* ETIQUETA SUPERIOR */}
              <motion.div 
                className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6, ease }}
              >
                <div className="bg-white/90 backdrop-blur-sm border border-line px-3 py-1.5 rounded-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span className="font-mono text-xs text-navy font-medium">ATENDIMENTO</span>
                </div>
              </motion.div>

              {/* BLOCO INFERIOR */}
              <motion.div 
                className="absolute bottom-0 left-0 right-0 z-20 bg-navy-deep/95 p-5 border-t border-line-light"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7, ease }}
              >
                <div className="font-mono text-[10px] uppercase tracking-wider text-sand mb-2">PROCESSO ATIVO</div>
                <div className="font-serif text-white text-base font-medium mb-1">Recrutamento logística</div>
                <div className="text-xs text-white/70 font-mono">42 posições | Jundiaí, SP</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default HeroB

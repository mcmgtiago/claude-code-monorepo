import { motion } from "motion/react"
import { ArrowUpRight, ChevronRight } from "lucide-react"

const ease = [0.22, 1, 0.36, 1] as const

const HeroC = () => {
  const itemVariants = {
    hidden: { opacity: 0, y: 18, filter: "blur(5px)" },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.62, delay: i * 0.1, ease }
    })
  }

  return (
    <div className="bg-paper min-h-screen lg:min-h-[760px] flex items-center">
      <a href="#content" className="skip-link">Ir para conteúdo principal</a>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <motion.div className="lg:col-span-6 space-y-8" initial="hidden" animate="visible">
            <motion.nav className="flex items-center gap-1 text-xs font-mono text-muted" aria-label="Breadcrumb" variants={itemVariants} custom={0}>
              <span>Início</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-navy">Soluções</span>
            </motion.nav>
            <motion.div className="flex items-center gap-3" variants={itemVariants} custom={1}>
              <div className="w-8 h-[2px] bg-wine" />
              <span className="text-xs sm:text-sm tracking-widest uppercase font-mono font-medium text-ink-soft">Recursos Humanos com Experiência e Proximidade</span>
            </motion.div>
            <motion.h1 className="font-serif text-ink" style={{fontSize: "clamp(3rem, 6.2vw, 6.8rem)", lineHeight: 0.92, letterSpacing: "-0.055em"}} variants={itemVariants} custom={2}>
              Pessoas certas tornam o crescimento <span className="font-serif italic">mais seguro.</span>
            </motion.h1>
            <motion.p className="text-base sm:text-lg text-ink-soft max-w-lg leading-relaxed" variants={itemVariants} custom={3}>
              A PILAR apoia empresas em recrutamento, trabalho temporário, terceirização, administração de pessoal e desenvolvimento de equipes.
            </motion.p>
            <motion.div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-6" variants={itemVariants} custom={4}>
              <button className="bg-wine hover:bg-wine-deep text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2 min-h-[48px] shadow-sm">
                Solicitar uma proposta
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <button className="text-navy hover:text-wine font-medium transition-colors duration-300 flex items-center gap-1 min-h-[44px] underline underline-offset-4">
                Encontrar uma vaga
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
            <motion.p className="text-sm text-muted" variants={itemVariants} custom={5}>
              Atendimento consultivo, processos claros e acompanhamento próximo.
            </motion.p>
            <motion.div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-8 border-t border-line" variants={itemVariants} custom={6}>
              <div><div className="font-mono font-bold text-xl text-navy">18 anos</div><div className="text-xs text-muted mt-1">de atuação</div></div>
              <div><div className="font-mono font-bold text-xl text-navy">12 mil</div><div className="text-xs text-muted mt-1">contratações</div></div>
              <div><div className="font-mono font-bold text-xl text-navy">9 estados</div><div className="text-xs text-muted mt-1">atendidos</div></div>
            </motion.div>
          </motion.div>
          <motion.div className="lg:col-span-6" initial={{opacity: 0, y: 24}} animate={{opacity: 1, y: 0}} transition={{duration: 0.62, delay: 0.35, ease}}>
            <div className="relative bg-white rounded-3xl overflow-hidden border border-line">
              <div className="aspect-[4/5] bg-gradient-to-br from-sand-soft/40 via-ivory to-sage-soft/20 flex items-center justify-center relative">
                <div className="text-center z-10"><div className="text-sm font-mono uppercase text-muted">Video/Foto</div><div className="text-2xl">📷</div></div>
              </div>
              <motion.div className="absolute top-4 left-4 z-20" initial={{opacity: 0, y: -10}} animate={{opacity: 1, y: 0}} transition={{duration: 0.5, delay: 0.6, ease}}>
                <div className="bg-paper/95 backdrop-blur-sm px-3 py-2 rounded-lg border border-line">
                  <div className="font-mono text-[10px] uppercase text-wine">ATENDIMENTO</div>
                </div>
              </motion.div>
              <motion.div className="absolute bottom-4 left-4 right-4 z-20" initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{duration: 0.5, delay: 0.8, ease}}>
                <div className="bg-paper/95 backdrop-blur-sm rounded-lg border border-line p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-mono text-[10px] uppercase text-wine">PROCESSO ATIVO</div>
                    <div className="w-2 h-2 rounded-full bg-success" />
                  </div>
                  <div className="font-serif text-navy text-sm font-medium">Recrutamento logística</div>
                  <div className="text-xs text-muted font-mono mt-1">42 posições</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default HeroC

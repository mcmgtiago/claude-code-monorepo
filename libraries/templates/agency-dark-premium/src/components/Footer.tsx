import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { ArrowUpRight, Instagram, Mail, Phone } from 'lucide-react'

const brandLogo = '/logo-rox.png'
const BG_VIDEO = '/hero-bg.mp4'

const links = {
  Serviços: ['Gestão de Redes', 'Tráfego Pago', 'Posicionamento', 'Eventos'],
  Empresa: ['Sobre nós', 'Processo', 'Cases'],
  Contato: ['WhatsApp', 'Instagram', 'E-mail'],
}

export function Footer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end end'],
  })
  const videoOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 1])

  return (
    <footer ref={containerRef} className="relative min-h-screen overflow-hidden bg-[var(--bg-deep)]">
      {/* Video background - same as hero */}
      <motion.div className="absolute inset-0 z-0" style={{ opacity: videoOpacity }}>
        <video className="h-full w-full object-cover" autoPlay muted loop playsInline src={BG_VIDEO} />
        <div className="absolute inset-0 bg-black/70" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-[1440px] px-5 pt-24 pb-8 sm:px-8 lg:px-16">
        {/* Footer card - more subtle */}
        <div className="overflow-hidden rounded-3xl border border-white/[0.06] bg-black/60 p-8 backdrop-blur-2xl sm:p-12">
          {/* Top section */}
          <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
            {/* Logo + tagline */}
            <div className="max-w-sm">
              <img className="h-10 w-auto" src={brandLogo} alt="Roxmídia" />
              <p className="mt-6 text-base leading-relaxed text-white/45">
                Marketing digital e posicionamento estratégico para marcas que querem ser lembradas.
              </p>
              <a
                href="https://wa.me/?text=Ol%C3%A1!%20Vi%20o%20site%20da%20Roxm%C3%ADdia%20e%20quero%20saber%20mais%20sobre%20posicionamento%20digital."
                className="btn-primary mt-8"
              >
                <span>Falar pelo WhatsApp</span>
                <span className="arrow"><ArrowUpRight size={16} /></span>
              </a>
            </div>

            {/* Link columns */}
            <div className="flex flex-wrap gap-12 sm:gap-16">
              {Object.entries(links).map(([title, items]) => (
                <div key={title}>
                  <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-white/30">{title}</h4>
                  <ul className="space-y-3">
                    {items.map((item) => (
                      <li key={item}>
                        <a href="#contato" className="text-sm text-white/50 transition-colors hover:text-[var(--accent)]">{item}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-col gap-4 border-t border-white/[0.06] pt-8 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-white/25">© 2024-2026 Roxmídia. Todos os direitos reservados.</span>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/roxmidia"
                className="flex size-9 items-center justify-center rounded-full border border-white/[0.06] text-white/40 transition-all hover:border-[var(--accent)]/50 hover:text-[var(--accent)]"
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://wa.me/"
                className="flex size-9 items-center justify-center rounded-full border border-white/[0.06] text-white/40 transition-all hover:border-[var(--accent)]/50 hover:text-[var(--accent)]"
                aria-label="WhatsApp"
              >
                <Phone size={16} />
              </a>
              <a
                href="mailto:contato@roxmidia.com"
                className="flex size-9 items-center justify-center rounded-full border border-white/[0.06] text-white/40 transition-all hover:border-[var(--accent)]/50 hover:text-[var(--accent)]"
                aria-label="E-mail"
              >
                <Mail size={16} />
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom blur */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-24 bg-gradient-to-t from-black to-transparent" />
    </footer>
  )
}

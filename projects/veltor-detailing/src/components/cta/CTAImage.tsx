import { MessageCircle } from 'lucide-react'
import { Container } from '../ui/Container'
import { ScrollReveal } from '../ui/ScrollReveal'
import { Button } from '../ui/Button'
import { WhatsAppLink, WHATSAPP_MESSAGES } from '../ui/WhatsAppLink'
import { ctaContent } from '../../data/content'

export function CTAImage() {
  return (
    <section id="cta-imagem" className="relative w-full overflow-hidden">
      {/* Background SVG — paint reflection aesthetic */}
      <div className="absolute inset-0">
        <svg
          viewBox="0 0 1600 800"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="ctaBg" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stopColor="#1A1F23" />
              <stop offset="60%" stopColor="#0f1113" />
              <stop offset="100%" stopColor="#090B0D" />
            </radialGradient>
            <linearGradient id="ctaShine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F6F6F4" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#F6F6F4" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#F6F6F4" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="ctaBronze" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#B88A52" stopOpacity="0.5" />
              <stop offset="60%" stopColor="#B88A52" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#c9995d" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect width="1600" height="800" fill="url(#ctaBg)" />
          {/* Sweeping reflections */}
          <ellipse cx="500" cy="280" rx="500" ry="80" fill="url(#ctaShine)" />
          <ellipse cx="1100" cy="500" rx="450" ry="70" fill="url(#ctaShine)" />
          <ellipse cx="800" cy="380" rx="350" ry="50" fill="url(#ctaShine)" opacity="0.8" />
          {/* Bronze warmth */}
          <rect width="1600" height="800" fill="url(#ctaBronze)" />
          {/* Subtle scanning lines */}
          <g opacity="0.18" stroke="#F6F6F4" strokeWidth="0.5">
            <line x1="0" y1="280" x2="1600" y2="280" />
            <line x1="0" y1="500" x2="1600" y2="500" />
          </g>
          {/* Vignette */}
          <radialGradient id="ctaVig" cx="50%" cy="50%" r="75%">
            <stop offset="55%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.75" />
          </radialGradient>
          <rect width="1600" height="800" fill="url(#ctaVig)" />
        </svg>
      </div>

      {/* Darkening overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(9,11,13,0.35) 0%, rgba(9,11,13,0.65) 100%)',
        }}
      />

      {/* Content */}
      <Container className="relative z-10 py-24 md:py-32 lg:py-40">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="font-display font-semibold tracking-tight text-fg text-3xl md:text-5xl lg:text-6xl">
              {ctaContent.title}
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={1}>
            <p className="mt-6 text-base md:text-lg text-muted leading-relaxed max-w-2xl mx-auto">
              {ctaContent.subtitle}
            </p>
          </ScrollReveal>

          <ScrollReveal delay={2}>
            <div className="mt-10 flex flex-col items-center gap-3">
              <WhatsAppLink message={WHATSAPP_MESSAGES.default}>
                <Button variant="primary" size="lg">
                  <MessageCircle className="w-5 h-5" />
                  {ctaContent.cta}
                </Button>
              </WhatsAppLink>
              <span className="text-xs uppercase tracking-[0.15em] text-muted">
                {ctaContent.footnote}
              </span>
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  )
}
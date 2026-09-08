import { Check, MessageCircle } from 'lucide-react'
import { Section, Container } from '../ui/Container'
import { Eyebrow } from '../ui/Eyebrow'
import { ScrollReveal } from '../ui/ScrollReveal'
import { WhatsAppLink, WHATSAPP_MESSAGES } from '../ui/WhatsAppLink'
import { highlightContent } from '../../data/content'

export function HighlightService() {
  return (
    <Section id="vitrificacao" className="bg-bg">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* LEFT — Cinematic SVG placeholder of ceramic coating being applied */}
          <ScrollReveal delay={0}>
            <div
              className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-border"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 800 600"
                preserveAspectRatio="xMidYMid slice"
                className="absolute inset-0 w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <radialGradient id="hlBase" cx="50%" cy="40%" r="70%">
                    <stop offset="0%" stopColor="#1A1F23" />
                    <stop offset="60%" stopColor="#0f1113" />
                    <stop offset="100%" stopColor="#090B0D" />
                  </radialGradient>

                  <linearGradient id="hlPaint" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0f1113" />
                    <stop offset="50%" stopColor="#1A1F23" />
                    <stop offset="100%" stopColor="#0a0c0e" />
                  </linearGradient>

                  <linearGradient id="hlReflection" x1="0%" y1="0%" x2="100%" y2="50%">
                    <stop offset="0%" stopColor="#F6F6F4" stopOpacity="0" />
                    <stop offset="50%" stopColor="#F6F6F4" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#F6F6F4" stopOpacity="0" />
                  </linearGradient>

                  <linearGradient id="hlBronze" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#B88A52" stopOpacity="0.55" />
                    <stop offset="60%" stopColor="#c9995d" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#B88A52" stopOpacity="0" />
                  </linearGradient>

                  <radialGradient id="hlGlow" cx="50%" cy="40%" r="40%">
                    <stop offset="0%" stopColor="#B88A52" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#B88A52" stopOpacity="0" />
                  </radialGradient>

                  {/* Coating drop gradient */}
                  <radialGradient id="dropGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#F6F6F4" stopOpacity="0.85" />
                    <stop offset="60%" stopColor="#B88A52" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#B88A52" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Background */}
                <rect width="800" height="600" fill="url(#hlBase)" />

                {/* Subtle floor reflection */}
                <rect y="380" width="800" height="220" fill="#000" opacity="0.35" />

                {/* Surface (hood-like) */}
                <g>
                  {/* Main panel */}
                  <path
                    d="M 60 320 Q 120 280 240 270 L 560 270 Q 680 280 740 320 L 740 460 Q 680 480 560 480 L 240 480 Q 120 480 60 460 Z"
                    fill="url(#hlPaint)"
                    stroke="rgba(184, 138, 82, 0.35)"
                    strokeWidth="0.8"
                  />
                  {/* Reflection sweep */}
                  <path
                    d="M 60 320 Q 120 280 240 270 L 560 270 Q 680 280 740 320 L 740 460 Q 680 480 560 480 L 240 480 Q 120 480 60 460 Z"
                    fill="url(#hlReflection)"
                  />
                  {/* Bronze warmth */}
                  <path
                    d="M 60 320 Q 120 280 240 270 L 560 270 Q 680 280 740 320 L 740 460 Q 680 480 560 480 L 240 480 Q 120 480 60 460 Z"
                    fill="url(#hlBronze)"
                  />
                </g>

                {/* Coating droplet being applied */}
                <g>
                  {/* Drop */}
                  <circle cx="400" cy="270" r="14" fill="url(#dropGrad)" />
                  <circle cx="395" cy="265" r="3" fill="#F6F6F4" opacity="0.85" />
                  {/* Spread ring */}
                  <ellipse cx="400" cy="272" rx="22" ry="5" fill="none" stroke="#B88A52" strokeOpacity="0.55" strokeWidth="1.2" />
                  <ellipse cx="400" cy="272" rx="36" ry="8" fill="none" stroke="#B88A52" strokeOpacity="0.3" strokeWidth="1" />
                  <ellipse cx="400" cy="272" rx="52" ry="11" fill="none" stroke="#B88A52" strokeOpacity="0.15" strokeWidth="0.8" />
                </g>

                {/* Applicator pad (above drop) */}
                <g>
                  <rect
                    x="370"
                    y="180"
                    width="60"
                    height="50"
                    rx="6"
                    fill="#13171A"
                    stroke="rgba(184, 138, 82, 0.45)"
                    strokeWidth="1"
                  />
                  <rect x="370" y="220" width="60" height="10" rx="3" fill="#1A1F23" />
                  {/* Highlight on pad */}
                  <rect x="376" y="186" width="20" height="3" rx="1" fill="#F6F6F4" opacity="0.35" />
                  {/* Trace motion */}
                  <line x1="370" y1="240" x2="400" y2="262" stroke="#B88A52" strokeOpacity="0.6" strokeWidth="1" strokeDasharray="2 3" />
                </g>

                {/* Glow accent */}
                <rect width="800" height="600" fill="url(#hlGlow)" />

                {/* Light scan lines (cinematic) */}
                <g opacity="0.18">
                  <line x1="0" y1="140" x2="800" y2="140" stroke="#F6F6F4" strokeWidth="0.5" />
                  <line x1="0" y1="540" x2="800" y2="540" stroke="#F6F6F4" strokeWidth="0.5" />
                </g>

                {/* Corner micro-labels */}
                <g fontFamily="monospace" fontSize="9" fill="#B88A52" opacity="0.5">
                  <text x="40" y="40">CERAMIC COATING</text>
                  <text x="40" y="55" opacity="0.7">9H — 10Y WARRANTY</text>
                  <text x="760" y="565" textAnchor="end" opacity="0.7">VELTOR DETAILING</text>
                  <text x="760" y="550" textAnchor="end">HYDROPHOBIC LAYER</text>
                </g>

                {/* Vignette */}
                <radialGradient id="hlVig" cx="50%" cy="50%" r="70%">
                  <stop offset="60%" stopColor="#000" stopOpacity="0" />
                  <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
                </radialGradient>
                <rect width="800" height="600" fill="url(#hlVig)" />
              </svg>
            </div>
          </ScrollReveal>

          {/* RIGHT — Content */}
          <div className="flex flex-col">
            <ScrollReveal delay={1}>
              <Eyebrow>SERVIÇO DE DESTAQUE</Eyebrow>
            </ScrollReveal>

            <ScrollReveal delay={2}>
              <h2 className="text-fg font-display">{highlightContent.title}</h2>
            </ScrollReveal>

            <ScrollReveal delay={3}>
              <p className="mt-6 text-base md:text-lg text-muted leading-relaxed">
                {highlightContent.description}
              </p>
            </ScrollReveal>

            <ul className="mt-8 space-y-4">
              {highlightContent.benefits.map((benefit, index) => (
                <ScrollReveal key={index} delay={4 + index}>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full border border-bronze bg-bronze-soft flex items-center justify-center mt-0.5">
                      <Check className="w-4 h-4 text-bronze" strokeWidth={2.5} />
                    </span>
                    <span className="text-fg leading-relaxed">{benefit}</span>
                  </li>
                </ScrollReveal>
              ))}
            </ul>

            <ScrollReveal delay={4 + highlightContent.benefits.length}>
              <WhatsAppLink message={WHATSAPP_MESSAGES.vitrificacao} className="mt-8 self-start">
                <span className="inline-flex items-center justify-center gap-2 px-8 min-h-[48px] rounded-full bg-bronze hover:bg-bronze-hover text-bg font-semibold shadow-[0_8px_20px_-6px_rgba(184,138,82,0.4)] hover:shadow-[0_12px_28px_-6px_rgba(184,138,82,0.6)] transition-all duration-300 hover:scale-[1.02] active:scale-95">
                  <MessageCircle className="w-5 h-5" />
                  {highlightContent.cta}
                </span>
              </WhatsAppLink>
            </ScrollReveal>
          </div>
        </div>
      </Container>
    </Section>
  )
}
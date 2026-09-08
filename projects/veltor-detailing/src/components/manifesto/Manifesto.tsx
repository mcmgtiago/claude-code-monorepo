import { ArrowRight } from 'lucide-react'
import { Section, Container } from '../ui/Container'
import { Eyebrow } from '../ui/Eyebrow'
import { ScrollReveal } from '../ui/ScrollReveal'
import { manifestoContent } from '../../data/content'

export function Manifesto() {
  // Split text by paragraph for cleaner rendering
  const paragraphs = manifestoContent.text.split('\n\n').filter(Boolean)

  return (
    <Section id="manifesto" className="bg-bg">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-10 lg:gap-16 items-center">
          {/* LEFT — Image placeholder */}
          <ScrollReveal delay={0}>
            <div
              className="relative w-full min-h-[500px] rounded-lg overflow-hidden border border-border"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 800 600"
                preserveAspectRatio="xMidYMid slice"
                className="absolute inset-0 w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Base dark gradient */}
                  <radialGradient id="paintBase" cx="50%" cy="50%" r="70%">
                    <stop offset="0%" stopColor="#1A1F23" />
                    <stop offset="60%" stopColor="#0f1113" />
                    <stop offset="100%" stopColor="#090B0D" />
                  </radialGradient>

                  {/* Bronze highlight */}
                  <linearGradient id="bronzeHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#B88A52" stopOpacity="0.32" />
                    <stop offset="40%" stopColor="#c9995d" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#B88A52" stopOpacity="0" />
                  </linearGradient>

                  {/* Light scan line */}
                  <linearGradient id="scanLine" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#F6F6F4" stopOpacity="0" />
                    <stop offset="50%" stopColor="#F6F6F4" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#F6F6F4" stopOpacity="0" />
                  </linearGradient>

                  {/* Glow */}
                  <radialGradient id="glow" cx="50%" cy="40%" r="40%">
                    <stop offset="0%" stopColor="#B88A52" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#B88A52" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Background */}
                <rect width="800" height="600" fill="url(#paintBase)" />

                {/* Surface analysis lines */}
                <g opacity="0.25">
                  <path
                    d="M 0 200 Q 200 180 400 220 T 800 200"
                    stroke="#B88A52"
                    strokeWidth="0.5"
                    fill="none"
                  />
                  <path
                    d="M 0 280 Q 250 260 450 300 T 800 280"
                    stroke="#B88A52"
                    strokeWidth="0.5"
                    fill="none"
                  />
                  <path
                    d="M 0 360 Q 200 340 400 380 T 800 360"
                    stroke="#B88A52"
                    strokeWidth="0.5"
                    fill="none"
                  />
                  <path
                    d="M 0 440 Q 250 420 450 460 T 800 440"
                    stroke="#B88A52"
                    strokeWidth="0.5"
                    fill="none"
                  />
                </g>

                {/* Vertical detection lines */}
                <g opacity="0.15">
                  <line x1="120" y1="0" x2="120" y2="600" stroke="#F6F6F4" strokeWidth="0.3" strokeDasharray="2 4" />
                  <line x1="280" y1="0" x2="280" y2="600" stroke="#F6F6F4" strokeWidth="0.3" strokeDasharray="2 4" />
                  <line x1="440" y1="0" x2="440" y2="600" stroke="#F6F6F4" strokeWidth="0.3" strokeDasharray="2 4" />
                  <line x1="600" y1="0" x2="600" y2="600" stroke="#F6F6F4" strokeWidth="0.3" strokeDasharray="2 4" />
                  <line x1="720" y1="0" x2="720" y2="600" stroke="#F6F6F4" strokeWidth="0.3" strokeDasharray="2 4" />
                </g>

                {/* Central glow */}
                <rect width="800" height="600" fill="url(#glow)" />

                {/* Bronze highlight reflection */}
                <rect width="800" height="600" fill="url(#bronzeHighlight)" />

                {/* Light scan line */}
                <line x1="0" y1="120" x2="800" y2="120" stroke="url(#scanLine)" strokeWidth="1" />
                <line x1="0" y1="480" x2="800" y2="480" stroke="url(#scanLine)" strokeWidth="1" />

                {/* HUD markers */}
                <g opacity="0.4">
                  <circle cx="120" cy="200" r="3" fill="none" stroke="#B88A52" strokeWidth="0.8" />
                  <circle cx="120" cy="200" r="1" fill="#B88A52" />
                  <circle cx="600" cy="360" r="3" fill="none" stroke="#B88A52" strokeWidth="0.8" />
                  <circle cx="600" cy="360" r="1" fill="#B88A52" />
                  <circle cx="440" cy="280" r="3" fill="none" stroke="#B88A52" strokeWidth="0.8" />
                  <circle cx="440" cy="280" r="1" fill="#B88A52" />
                </g>

                {/* HUD micro-text */}
                <g opacity="0.4" fontFamily="monospace" fontSize="9" fill="#B88A52">
                  <text x="40" y="40">SURFACE ANALYSIS</text>
                  <text x="40" y="55" opacity="0.7">PAINT — DEPTH 7.2</text>
                  <text x="700" y="540" textAnchor="end">REFLECT 0.94</text>
                  <text x="700" y="555" textAnchor="end" opacity="0.7">CLARITY 0.97</text>
                  <text x="40" y="565">VELTOR DETAILING</text>
                </g>

                {/* Subtle vignette */}
                <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
                  <stop offset="60%" stopColor="#000" stopOpacity="0" />
                  <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
                </radialGradient>
                <rect width="800" height="600" fill="url(#vignette)" />
              </svg>
            </div>
          </ScrollReveal>

          {/* RIGHT — Content */}
          <div className="flex flex-col">
            <ScrollReveal delay={1}>
              <Eyebrow>{manifestoContent.eyebrow}</Eyebrow>
            </ScrollReveal>

            <ScrollReveal delay={2}>
              <h2 className="text-fg font-display">{manifestoContent.title}</h2>
            </ScrollReveal>

            <div className="mt-6 space-y-4">
              {paragraphs.map((paragraph, index) => (
                <ScrollReveal key={index} delay={3 + index}>
                  <p className="text-muted leading-relaxed text-base md:text-lg">
                    {paragraph}
                  </p>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={3 + paragraphs.length}>
              <a
                href="#sobre"
                className="mt-8 inline-flex items-center gap-2 text-bronze hover:text-bronze-hover font-medium transition-colors group self-start"
              >
                {manifestoContent.cta}
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </ScrollReveal>
          </div>
        </div>
      </Container>
    </Section>
  )
}

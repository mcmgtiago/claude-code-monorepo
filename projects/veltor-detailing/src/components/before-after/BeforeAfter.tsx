import { useState } from 'react'
import { ArrowLeftRight } from 'lucide-react'
import { Section, Container } from '../ui/Container'
import { SectionTitle } from '../ui/SectionTitle'
import { ScrollReveal } from '../ui/ScrollReveal'

export function BeforeAfter() {
  return (
    <Section id="antes-depois" className="bg-bg">
      <Container>
        <ScrollReveal>
          <SectionTitle
            eyebrow="RESULTADOS"
            title="Resultados que não precisam de explicação."
            subtitle="Veja a transformação que o nosso trabalho proporciona em diferentes tipos de veículos e superfícies."
          />
        </ScrollReveal>

        <ScrollReveal delay={1}>
          <BeforeAfterSlider />
        </ScrollReveal>
      </Container>
    </Section>
  )
}

function BeforeAfterSlider() {
  const [position, setPosition] = useState(50)

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPosition(Number(e.target.value))
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div
        className="relative w-full overflow-hidden rounded-lg border border-border bg-surface aspect-[16/9]"
        style={{ touchAction: 'none' }}
      >
        {/* BEFORE — dark/opaque */}
        <div className="absolute inset-0 w-full h-full">
          <svg
            viewBox="0 0 800 450"
            preserveAspectRatio="xMidYMid slice"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Antes — pintura opaca"
          >
            <defs>
              <radialGradient id="beforeBg" cx="50%" cy="50%" r="70%">
                <stop offset="0%" stopColor="#1A1F23" />
                <stop offset="100%" stopColor="#0a0c0e" />
              </radialGradient>
            </defs>
            <rect width="800" height="450" fill="url(#beforeBg)" />
            {/* Diffuse light — dull reflection */}
            <ellipse cx="280" cy="180" rx="200" ry="50" fill="#3a3f44" opacity="0.18" />
            <ellipse cx="560" cy="280" rx="180" ry="40" fill="#3a3f44" opacity="0.12" />
            {/* Surface imperfections */}
            <g opacity="0.35" stroke="#9DA3A6" strokeWidth="0.6" fill="none">
              <path d="M 120 220 Q 180 215 240 225" />
              <path d="M 480 240 Q 540 235 600 245" />
              <path d="M 200 320 Q 260 318 320 322" />
              <path d="M 540 350 Q 600 348 660 352" />
            </g>
            {/* Haze overlay */}
            <rect width="800" height="450" fill="#1a1d20" opacity="0.25" />
            {/* Vignette */}
            <radialGradient id="beforeVig" cx="50%" cy="50%" r="70%">
              <stop offset="60%" stopColor="#000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.6" />
            </radialGradient>
            <rect width="800" height="450" fill="url(#beforeVig)" />
          </svg>
        </div>

        {/* AFTER — bright with bronze highlights */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <svg
            viewBox="0 0 800 450"
            preserveAspectRatio="xMidYMid slice"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Depois — brilho profundo"
          >
            <defs>
              <radialGradient id="afterBg" cx="50%" cy="50%" r="70%">
                <stop offset="0%" stopColor="#2a2f33" />
                <stop offset="60%" stopColor="#13171A" />
                <stop offset="100%" stopColor="#090B0D" />
              </radialGradient>
              <linearGradient id="afterShine" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F6F6F4" stopOpacity="0.55" />
                <stop offset="40%" stopColor="#F6F6F4" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#F6F6F4" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="afterBronze" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#B88A52" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#c9995d" stopOpacity="0" />
              </linearGradient>
            </defs>
            <rect width="800" height="450" fill="url(#afterBg)" />
            {/* Crisp reflections */}
            <ellipse cx="280" cy="180" rx="220" ry="45" fill="url(#afterShine)" />
            <ellipse cx="560" cy="280" rx="200" ry="35" fill="url(#afterShine)" />
            {/* Bronze warmth */}
            <rect width="800" height="450" fill="url(#afterBronze)" />
            {/* Sharp horizontal scan line */}
            <line x1="0" y1="225" x2="800" y2="225" stroke="#F6F6F4" strokeOpacity="0.18" strokeWidth="0.6" />
            {/* Vignette */}
            <radialGradient id="afterVig" cx="50%" cy="50%" r="70%">
              <stop offset="60%" stopColor="#000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.5" />
            </radialGradient>
            <rect width="800" height="450" fill="url(#afterVig)" />
          </svg>
        </div>

        {/* Labels */}
        <span className="absolute top-4 left-4 inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-bg/70 backdrop-blur-sm border border-border text-xs tracking-[0.2em] uppercase text-fg">
          Antes
        </span>
        <span className="absolute top-4 right-4 inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-bg/70 backdrop-blur-sm border border-bronze text-xs tracking-[0.2em] uppercase text-bronze">
          Depois
        </span>

        {/* Slider line */}
        <div
          aria-hidden="true"
          className="absolute top-0 bottom-0 w-px bg-bronze pointer-events-none"
          style={{ left: `${position}%`, transform: 'translateX(-0.5px)' }}
        />

        {/* Slider thumb */}
        <div
          aria-hidden="true"
          className="absolute top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-fg text-bg flex items-center justify-center shadow-[0_8px_24px_-4px_rgba(0,0,0,0.6)] pointer-events-none"
          style={{ left: `${position}%`, transform: 'translate(-50%, -50%)' }}
        >
          <ArrowLeftRight className="w-5 h-5" />
        </div>

        {/* Range input */}
        <input
          type="range"
          min={0}
          max={100}
          value={position}
          onChange={handleSliderChange}
          aria-label="Comparação antes e depois"
          className="before-after-range absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
        />
      </div>

      {/* Style for native range thumb (kept transparent so visual thumb shows above) */}
      <style>{`
        .before-after-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 60px;
          height: 100%;
          background: transparent;
          cursor: ew-resize;
        }
        .before-after-range::-moz-range-thumb {
          width: 60px;
          height: 100%;
          background: transparent;
          border: none;
          cursor: ew-resize;
        }
      `}</style>
    </div>
  )
}
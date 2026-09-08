import { motion } from 'motion/react'
import { Container, Section } from '../ui/Container'
import { Eyebrow } from '../ui/Eyebrow'
import { ScrollReveal } from '../ui/ScrollReveal'
import { portfolio } from '../../data/content'

interface CarPlaceholderProps {
  variant: number
}

/**
 * Inline SVG placeholder representing a stylized car silhouette.
 * Each variant uses a slightly different shape so cards feel distinct.
 */
function CarPlaceholder({ variant }: CarPlaceholderProps) {
  const shapes = [
    // 0 — sleek coupe
    'M40,90 C40,75 60,55 110,55 L190,55 C235,55 250,72 252,90 L252,108 L40,108 Z',
    // 1 — SUV
    'M40,90 C40,72 56,50 100,50 L195,50 C235,50 252,70 252,90 L252,112 L40,112 Z',
    // 2 — sedan
    'M40,92 C40,78 58,62 100,58 C130,42 175,42 200,58 C235,62 252,76 252,92 L252,108 L40,108 Z',
    // 3 — sports car (low)
    'M30,96 C30,84 56,72 100,72 L195,72 C240,72 260,84 262,96 L262,106 L30,106 Z',
    // 4 — hatchback
    'M45,88 C45,72 60,56 110,56 L185,56 C228,56 248,72 250,88 L250,110 L45,110 Z',
    // 5 — convertible
    'M50,90 C55,80 75,72 110,72 L195,72 C232,72 250,82 252,92 L252,108 L50,108 Z',
  ]
  const path = shapes[variant % shapes.length]

  return (
    <svg
      viewBox="0 0 300 140"
      preserveAspectRatio="xMidYMid meet"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`grad-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1A1F23" />
          <stop offset="100%" stopColor="#090B0D" />
        </linearGradient>
        <linearGradient id={`body-${variant}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#9DA3A6" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#9DA3A6" stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id={`reflect-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B88A52" stopOpacity="0" />
          <stop offset="50%" stopColor="#B88A52" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#B88A52" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="300" height="140" fill={`url(#grad-${variant})`} />

      {/* Soft floor reflection */}
      <ellipse cx="150" cy="118" rx="110" ry="6" fill="#000" opacity="0.5" />

      {/* Car body silhouette */}
      <path d={path} fill={`url(#body-${variant})`} stroke="#9DA3A6" strokeOpacity="0.15" strokeWidth="1" />

      {/* Wheels */}
      <circle cx="80" cy="108" r="10" fill="#0A0C0E" stroke="#9DA3A6" strokeOpacity="0.25" strokeWidth="1" />
      <circle cx="80" cy="108" r="4" fill="#13171A" />
      <circle cx="215" cy="108" r="10" fill="#0A0C0E" stroke="#9DA3A6" strokeOpacity="0.25" strokeWidth="1" />
      <circle cx="215" cy="108" r="4" fill="#13171A" />

      {/* Bronze reflection sweep */}
      <rect width="300" height="140" fill={`url(#reflect-${variant})`} />

      {/* Window strip */}
      <path
        d={path}
        fill="none"
        stroke="#B88A52"
        strokeOpacity="0.25"
        strokeWidth="1"
        transform="translate(0,-14) scale(0.86, 0.55) translate(0,14)"
      />
    </svg>
  )
}

export function Portfolio() {
  return (
    <Section id="projetos">
      <Container>
        <ScrollReveal className="max-w-3xl mx-auto text-center mb-12 md:mb-16 lg:mb-20">
          <Eyebrow>PROJETOS</Eyebrow>
          <h2 className="font-display font-semibold tracking-tight text-fg">
            Alguns carros que passaram por nossas mãos.
          </h2>
          <p className="mt-5 text-base md:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Uma amostra do padrão Veltor aplicado a veículos de diferentes perfis.
          </p>
        </ScrollReveal>

        {/* Desktop: asymmetric grid */}
        <div className="hidden md:grid grid-cols-3 gap-6 md:gap-8">
          {portfolio.map((item, index) => {
            // 1ª linha: grande + normal  (índices 0,1)
            // 2ª linha: normal + grande  (índices 2,3)
            // 3ª linha: normal + grande  (índices 4,5)
            const isLarge = index === 0 || index === 3 || index === 4
            const aspect = isLarge ? 'aspect-[16/9]' : 'aspect-square'

            return (
              <ScrollReveal
                key={item.id}
                delay={index}
                className={isLarge ? 'md:col-span-2' : 'md:col-span-1'}
              >
                <motion.figure
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className={`group relative ${aspect} w-full overflow-hidden rounded-xl border border-white/10 hover:border-bronze/40 cursor-pointer`}
                >
                  <CarPlaceholder variant={index} />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <figcaption className="absolute inset-x-0 bottom-0 p-5 md:p-7 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <h3 className="font-display font-semibold text-lg md:text-xl text-fg">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-sm text-bronze/90">
                      {item.service}
                    </p>
                  </figcaption>
                </motion.figure>
              </ScrollReveal>
            )
          })}
        </div>

        {/* Mobile: horizontal scroll-snap carousel (CSS native) */}
        <div className="md:hidden -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="flex gap-4 overflow-x-auto px-4 sm:px-6 lg:px-8 snap-x snap-mandatory scroll-smooth pb-4">
            {portfolio.map((item, index) => (
              <figure
                key={item.id}
                className="snap-center shrink-0 w-[78%] max-w-[320px] relative aspect-[16/9] overflow-hidden rounded-xl border border-white/10"
              >
                <CarPlaceholder variant={index} />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                <figcaption className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="font-display font-semibold text-base text-fg">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-xs text-bronze/90">
                    {item.service}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  )
}
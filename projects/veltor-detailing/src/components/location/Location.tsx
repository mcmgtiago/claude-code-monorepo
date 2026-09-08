import { MapPin, MessageCircle, Phone, Clock, Navigation } from 'lucide-react'
import { Container, Section } from '../ui/Container'
import { Eyebrow } from '../ui/Eyebrow'
import { ScrollReveal } from '../ui/ScrollReveal'
import { WhatsAppLink, WHATSAPP_MESSAGES } from '../ui/WhatsAppLink'
import { brandInfo } from '../../data/content'

export function Location() {
  const phoneClean = brandInfo.phone.replace(/\D/g, '')
  const phoneHref = `tel:+${phoneClean}`
  const mapsQuery = encodeURIComponent(brandInfo.location)
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`

  return (
    <Section id="localizacao" className="bg-bg-light border-y border-white/[0.04]">
      <Container>
        <ScrollReveal className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <Eyebrow>NOSSA LOCALIZAÇÃO</Eyebrow>
          <h2 className="font-display font-semibold tracking-tight text-fg">
            Estamos prontos para receber seu <span className="text-bronze">veículo.</span>
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          {/* Left column — info */}
          <ScrollReveal className="flex">
            <div className="glass-panel p-7 md:p-8 rounded-2xl flex flex-col gap-6 w-full">
              <div className="flex items-start gap-4">
                <span className="w-10 h-10 shrink-0 inline-flex items-center justify-center rounded-full bg-bronze-soft text-bronze">
                  <MapPin className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-xs uppercase tracking-[0.15em] text-muted">Endereço</div>
                  <div className="mt-1 text-fg text-base">{brandInfo.location}</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="w-10 h-10 shrink-0 inline-flex items-center justify-center rounded-full bg-bronze-soft text-bronze">
                  <Phone className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-xs uppercase tracking-[0.15em] text-muted">Telefone</div>
                  <a
                    href={phoneHref}
                    className="mt-1 inline-block text-fg text-base hover:text-bronze transition-colors"
                  >
                    {brandInfo.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="w-10 h-10 shrink-0 inline-flex items-center justify-center rounded-full bg-bronze-soft text-bronze">
                  <MessageCircle className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-xs uppercase tracking-[0.15em] text-muted">WhatsApp</div>
                  <WhatsAppLink
                    message={WHATSAPP_MESSAGES.default}
                    className="mt-1 inline-block text-fg text-base hover:text-bronze transition-colors"
                  >
                    Iniciar conversa
                  </WhatsAppLink>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="w-10 h-10 shrink-0 inline-flex items-center justify-center rounded-full bg-bronze-soft text-bronze">
                  <Clock className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-xs uppercase tracking-[0.15em] text-muted">Horário</div>
                  <div className="mt-1 text-fg text-base">{brandInfo.hours.weekdays}</div>
                  <div className="text-muted text-sm">{brandInfo.hours.saturday}</div>
                </div>
              </div>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full border border-bronze/40 bg-bronze-soft text-bronze hover:bg-bronze hover:text-bg font-medium min-h-[48px] px-6 transition-all duration-300"
              >
                <Navigation className="w-4 h-4" />
                Como chegar
              </a>
            </div>
          </ScrollReveal>

          {/* Right column — stylized map placeholder */}
          <ScrollReveal delay={1} className="flex">
            <div className="glass-panel rounded-2xl overflow-hidden w-full aspect-square lg:aspect-auto min-h-[420px]">
              <svg
                viewBox="0 0 800 800"
                preserveAspectRatio="xMidYMid slice"
                className="w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Mapa estilizado da localização da Veltor Detailing"
              >
                <defs>
                  <radialGradient id="mapBg" cx="50%" cy="50%" r="75%">
                    <stop offset="0%" stopColor="#1A1F23" />
                    <stop offset="100%" stopColor="#090B0D" />
                  </radialGradient>
                  <linearGradient id="mapRoads" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9DA3A6" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#9DA3A6" stopOpacity="0.15" />
                  </linearGradient>
                </defs>

                <rect width="800" height="800" fill="url(#mapBg)" />

                {/* Subtle grid */}
                <g stroke="#9DA3A6" strokeOpacity="0.06" strokeWidth="0.5">
                  {[...Array(16)].map((_, i) => (
                    <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="800" />
                  ))}
                  {[...Array(16)].map((_, i) => (
                    <line key={`h${i}`} x1="0" y1={i * 50} x2="800" y2={i * 50} />
                  ))}
                </g>

                {/* Major roads */}
                <g stroke="url(#mapRoads)" strokeWidth="2" fill="none" opacity="0.7">
                  <path d="M 0 240 Q 200 280 400 320 T 800 400" />
                  <path d="M 0 540 Q 250 500 480 540 T 800 520" />
                  <path d="M 200 0 Q 220 250 280 480 T 360 800" />
                  <path d="M 600 0 Q 580 240 540 460 T 480 800" />
                </g>

                {/* Minor roads */}
                <g stroke="#9DA3A6" strokeOpacity="0.15" strokeWidth="1" fill="none">
                  <path d="M 100 100 L 700 100" />
                  <path d="M 100 700 L 700 700" />
                  <path d="M 100 100 L 100 700" />
                  <path d="M 700 100 L 700 700" />
                  <path d="M 50 380 L 750 380" />
                  <path d="M 400 50 L 400 750" />
                </g>

                {/* Park / green block */}
                <rect x="120" y="380" width="180" height="140" fill="#1f2620" opacity="0.5" rx="8" />
                <rect x="540" y="120" width="160" height="120" fill="#1f2620" opacity="0.4" rx="8" />

                {/* Block fills (subtle) */}
                <g fill="#9DA3A6" fillOpacity="0.04">
                  {[...Array(10)].map((_, row) =>
                    [...Array(10)].map((_, col) => (
                      <rect
                        key={`b${row}-${col}`}
                        x={50 + col * 70}
                        y={50 + row * 70}
                        width="60"
                        height="60"
                        rx="4"
                      />
                    ))
                  )}
                </g>

                {/* Pin */}
                <g transform="translate(400 400)">
                  {/* Glow */}
                  <circle r="60" fill="#B88A52" fillOpacity="0.12" />
                  <circle r="30" fill="#B88A52" fillOpacity="0.25" />
                  {/* Pin shape */}
                  <path
                    d="M 0 -28 C -12 -28 -22 -18 -22 -6 C -22 8 0 30 0 30 C 0 30 22 8 22 -6 C 22 -18 12 -28 0 -28 Z"
                    fill="#B88A52"
                    stroke="#c9995d"
                    strokeWidth="1"
                  />
                  <circle cx="0" cy="-8" r="6" fill="#090B0D" />
                </g>

                {/* Label */}
                <g transform="translate(400 470)">
                  <rect
                    x="-95"
                    y="0"
                    width="190"
                    height="34"
                    rx="17"
                    fill="#13171A"
                    stroke="#B88A52"
                    strokeOpacity="0.4"
                  />
                  <text
                    x="0"
                    y="22"
                    textAnchor="middle"
                    fontFamily="Sora, sans-serif"
                    fontSize="13"
                    fontWeight="600"
                    fill="#F6F6F4"
                    letterSpacing="2"
                  >
                    VELTOR DETAILING
                  </text>
                </g>

                {/* Vignette */}
                <radialGradient id="mapVig" cx="50%" cy="50%" r="75%">
                  <stop offset="55%" stopColor="#000" stopOpacity="0" />
                  <stop offset="100%" stopColor="#000" stopOpacity="0.6" />
                </radialGradient>
                <rect width="800" height="800" fill="url(#mapVig)" />
              </svg>
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </Section>
  )
}
import { FadeIn } from './FadeIn'

const services = [
  { number: '01', name: 'Gestão de Redes Sociais', description: 'Planejamento, conteúdo, identidade visual e comunidade trabalhando na mesma direção estratégica para construir marca.' },
  { number: '02', name: 'Tráfego Pago', description: 'Campanhas de alto desempenho no Meta Ads, Google Ads e TikTok Ads. Segmentação inteligente e criativos que convertem.' },
  { number: '03', name: 'Posicionamento Digital', description: 'Tom de voz, presença visual e canais organizados para transmitir autoridade. Sua marca reconhecida antes do preço.' },
  { number: '04', name: 'Produção de Conteúdo', description: 'Roteiro, direção criativa, captação e edição profissional de vídeos curtos que sustentam a estratégia.' },
  { number: '05', name: 'Marketing para Eventos', description: 'Estratégia completa de divulgação, cobertura em tempo real e pós-evento que transforma presença em repercussão.' },
]

export function ServicesList() {
  return (
    <section className="relative overflow-hidden bg-[#0d0d0d] px-5 py-20 text-white sm:px-8 sm:py-24 md:py-32" style={{ borderTopLeftRadius: 'clamp(40px, 6vw, 60px)', borderTopRightRadius: 'clamp(40px, 6vw, 60px)' }}>
      {/* SVG dot pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.5]" style={{ backgroundImage: 'url(/textures/dots-premium.svg)', backgroundRepeat: 'repeat' }} />
      {/* Accent glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-[0.08] blur-[150px]" />
      <div className="relative mx-auto max-w-[1440px]">
        {/* Heading */}
        <FadeIn y={40} className="mb-16 sm:mb-20 md:mb-28">
          <h2 className="max-w-4xl font-serif text-4xl italic leading-[1.05] tracking-[-0.02em] text-white sm:text-6xl lg:text-7xl">
            O que fazemos <span className="text-[var(--accent)]">por sua marca.</span>
          </h2>
          <p className="mt-6 max-w-xl text-base text-white/50">
            Cada serviço pensado para construir posicionamento real e gerar resultado mensurável.
          </p>
        </FadeIn>

        {/* Services list */}
        <div className="mx-auto flex max-w-5xl flex-col items-center">
          {services.map((service, i) => (
            <FadeIn key={service.number} delay={i * 0.1} y={30} className="w-full">
              {i > 0 && <div className="w-full border-t border-white/[0.06]" />}
              <div className="flex w-full items-start gap-6 py-8 sm:gap-8 sm:py-10 md:gap-10 md:py-12">
                {/* Number */}
                <span
                  className="shrink-0 font-serif italic font-black uppercase leading-none text-white"
                  style={{ fontSize: 'clamp(3rem, 10vw, 120px)' }}
                >
                  {service.number}
                </span>
                {/* Name + Description */}
                <div className="flex flex-col gap-2 pt-1 sm:gap-4 md:gap-5">
                  <h3
                    className="font-medium uppercase text-white"
                    style={{ fontSize: 'clamp(1rem, 2.2vw, 2.1rem)' }}
                  >
                    {service.name}
                  </h3>
                  <p
                    className="max-w-2xl font-light leading-relaxed opacity-60"
                    style={{ fontSize: 'clamp(0.85rem, 1.6vw, 1.25rem)' }}
                  >
                    {service.description}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

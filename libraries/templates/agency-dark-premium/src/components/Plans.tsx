import { ArrowUpRight, Check } from 'lucide-react'
import { FadeIn, FadeInStagger, FadeInItem } from './FadeIn'
import { BorderBeam } from './BorderBeam'

const plans = [
  {
    name: 'Essencial',
    subtitle: 'Gestão de uma rede',
    items: ['12 conteúdos por mês', 'Planejamento mensal', 'Relatório de resultados', 'Suporte por WhatsApp'],
    featured: false,
    span: '',
    gradient: true,
  },
  {
    name: 'Crescimento',
    subtitle: 'Conteúdo e mídia paga',
    items: ['Até duas redes sociais', 'Conteúdo recorrente', 'Gestão de tráfego', 'Reunião mensal de resultados'],
    featured: true,
    span: '',
  },
  {
    name: 'Autoridade',
    subtitle: 'Presença completa',
    items: ['Ecossistema multicanal', 'Produção em vídeo', 'Otimização semanal', 'Equipe dedicada'],
    featured: false,
    span: '',
  },
  {
    name: 'Eventos',
    subtitle: 'Projeto avulso',
    items: ['Pré-evento completo', 'Campanha de mídia', 'Cobertura em tempo real', 'Pós-evento e CRM'],
    featured: false,
    span: '',
  },
]

export function Plans() {
  return (
    <section className="relative bg-[#0a0a0a] px-5 py-24 sm:px-8 lg:px-16 lg:py-36">
      {/* Background texture */}
      <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: 'url(/textures/grid-pattern.svg)', backgroundRepeat: 'repeat' }} />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-[0.03] blur-[140px]" />

      <div className="relative mx-auto max-w-[88rem]">
        {/* Header row - two columns */}
        <div className="mb-16 grid grid-cols-1 items-start gap-12 md:grid-cols-2">
          <FadeIn y={30}>
            <h2 className="font-serif text-4xl italic leading-tight tracking-[-0.03em] text-white md:text-5xl" style={{ letterSpacing: '-0.03em' }}>
              Invista no crescimento.
            </h2>
            <a href="#contato" className="btn-primary mt-8">
              <span>Solicitar proposta</span>
              <span className="arrow"><ArrowUpRight size={16} /></span>
            </a>
          </FadeIn>
          <FadeIn y={30} delay={0.15} className="flex items-center">
            <p className="text-xl leading-relaxed text-white/55 md:text-2xl">
              Valores definidos após diagnóstico. Cada plano é adaptado ao momento e objetivo do seu negócio.
            </p>
          </FadeIn>
        </div>

        {/* Cards grid */}
        <FadeInStagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
          {plans.map((plan) => (
            <FadeInItem
              key={plan.name}
              className={`flex min-h-[360px] flex-col justify-between rounded-2xl p-7 ${
                plan.featured
                  ? 'bg-[var(--accent)] text-white shadow-[0_30px_80px_-20px_rgba(255,90,0,0.3)]'
                  : plan.gradient
                    ? 'relative overflow-hidden'
                    : ''
              } ${plan.span} ${
                !plan.featured && !plan.gradient ? 'border border-white/[0.04] bg-white/[0.03]' : ''
              }`}
            >
              {/* Gradient card bg */}
              {plan.gradient && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/20 via-black/95 to-black" />
                  <div className="absolute inset-0 border border-white/[0.04] rounded-2xl" />
                </>
              )}

              {/* Border beam on featured */}
              {plan.featured && <BorderBeam duration={4} size={150} color="rgba(255,255,255,0.6)" />}

              <div className="relative">
                {plan.featured && (
                  <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-white">
                    Mais procurado
                  </span>
                )}
                <h3 className="font-serif text-3xl italic text-white">{plan.name}</h3>
                <span className={`mt-2 block text-sm ${plan.featured ? 'text-white/70' : 'text-white/45'}`}>{plan.subtitle}</span>
              </div>

              <div className="relative">
                <ul className={`mt-8 space-y-3 text-sm ${plan.featured ? 'text-white/85' : 'text-white/55'}`}>
                  {plan.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check size={14} className={`mt-0.5 shrink-0 ${plan.featured ? 'text-white' : 'text-white/35'}`} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#contato"
                  className={`mt-8 inline-flex h-11 w-full items-center justify-center rounded-full text-sm font-medium transition-colors ${
                    plan.featured
                      ? 'bg-white text-black hover:bg-white/90'
                      : 'border border-white/[0.06] text-white hover:bg-white/5'
                  }`}
                >
                  Solicitar proposta
                </a>
              </div>
            </FadeInItem>
          ))}
        </FadeInStagger>
      </div>
    </section>
  )
}

import { Reveal } from './Reveal'
import { waLink } from '@/lib/utils'
import { CheckCircle, ArrowRight } from 'lucide-react'

export function About() {
  return (
    <section id="about" className="py-20">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <Reveal>
            <div className="rounded-xl overflow-hidden">
              <img
                src={new URL('../assets/ref.webp', import.meta.url).href}
                alt="MID em ação"
                className="w-full h-[340px] lg:h-[400px] object-cover rounded-xl"
              />
            </div>
          </Reveal>

          {/* Content */}
          <div>
            <Reveal>
              <span className="badge">◎ SOBRE NÓS</span>
            </Reveal>

            <Reveal delay={0.05}>
              <h2 className="text-[28px] md:text-[36px] font-bold mt-4 tracking-[-0.01em] leading-tight">
                Transformamos Negócios Através do{' '}
                <span className="text-[var(--color-accent)]">Posicionamento Digital</span>
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="text-[14px] text-gray-500 mt-4 leading-relaxed">
                Não somos uma agência que posta por postar. Não vendemos "alcance" nem "likes". Vendemos posicionamento — o tipo que faz seu cliente abrir o Instagram e pensar: "é essa".
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="flex flex-col gap-3 mt-6">
                {['Método próprio MEC', 'Atendimento consultivo', 'Resultados mensuráveis'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle size={16} className="text-[var(--color-accent)] shrink-0" />
                    <span className="text-[14px] font-medium text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="flex items-center gap-8 mt-8">
                <div>
                  <p className="text-[28px] font-bold text-[var(--color-accent)]">30M+</p>
                  <p className="text-[12px] text-gray-400 mt-0.5">Alcance gerado</p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.25}>
              <a
                href={waLink('Quero conhecer a MID.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--color-accent)] mt-6 hover:underline"
              >
                Saiba Mais <ArrowRight size={14} />
              </a>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

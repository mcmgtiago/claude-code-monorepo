import { Reveal } from './Reveal'
import { Star } from 'lucide-react'

const testimonials = [
  { text: 'Nosso engajamento multiplicou e finalmente o perfil passou a trazer clientes reais. A MID entendeu o que a gente não conseguia verbalizar.', name: 'Roberto M.', role: 'CEO, Indústria B2B' },
  { text: 'O método MEC é transformador. Em 2 meses deixamos de ter leads genéricos para receber contatos que já vinham com contexto.', name: 'Carla T.', role: 'Sócia, Consultoria de Gestão' },
  { text: 'A equipe da MID conseguiu traduzir em digital exatamente o que somos no presencial. Meus clientes reconhecem a marca antes de chegar.', name: 'André L.', role: 'Proprietário, Rede de Cafeterias' },
]

export function Testimonials() {
  return (
    <section className="py-20 bg-[var(--color-bg-soft)]">
      <div className="container">
        <div className="text-center mb-12">
          <Reveal><span className="badge mx-auto">◎ DEPOIMENTOS</span></Reveal>
          <Reveal delay={0.05}><h2 className="text-3xl md:text-4xl font-bold mt-3">O que nossos clientes dizem</h2></Reveal>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <div className="card h-full flex flex-col">
                <div className="flex gap-0.5 mb-3">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed flex-1">"{t.text}"</p>
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[var(--color-border)]">
                  <div className="w-9 h-9 rounded-full bg-[var(--color-accent)] flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{t.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-[var(--color-text-light)]">{t.role}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

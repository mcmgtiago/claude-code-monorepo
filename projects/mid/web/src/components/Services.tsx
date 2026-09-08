import { Reveal } from './Reveal'
import { waLink } from '@/lib/utils'
import { Compass, Frame, FileText, Palette, BarChart3, Users, ArrowRight } from 'lucide-react'

const services = [
  { icon: Compass, title: 'Posicionamento Estratégico', description: 'Definimos a essência da marca — o que ela é, para quem é e por que importa.', color: 'bg-indigo-100 text-indigo-600' },
  { icon: Frame, title: 'Presença Digital', description: 'Perfil, bio, destaques, feed. Tudo alinhado com o posicionamento aprovado.', color: 'bg-blue-100 text-blue-600' },
  { icon: FileText, title: 'Conteúdo com Método', description: 'Carrosséis, reels, textos, fotos. Cada peça tem função estratégica.', color: 'bg-purple-100 text-purple-600' },
  { icon: Palette, title: 'Direção Criativa', description: 'Identidade visual, paleta, tipografia, fotografia. Coerência do começo ao fim.', color: 'bg-pink-100 text-pink-600' },
  { icon: BarChart3, title: 'Gestão de Canal', description: 'Operação mensal: planejamento, produção, publicação, análise e ajuste.', color: 'bg-emerald-100 text-emerald-600' },
  { icon: Users, title: 'Treinamento de Equipe', description: 'Seu time aprende a falar a língua da marca. Pra continuar sem depender de fora.', color: 'bg-amber-100 text-amber-600' },
]

export function Services() {
  return (
    <section id="services" className="py-20 bg-[var(--color-bg-soft)]">
      <div className="container">
        {/* Section header - centered like SEOX */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div className="text-center md:text-left">
            <Reveal><span className="badge">◎ NOSSOS SERVIÇOS</span></Reveal>
            <Reveal delay={0.05}><h2 className="text-3xl md:text-[36px] font-bold mt-3 tracking-[-0.01em]">O Que Entregamos</h2></Reveal>
          </div>
          <Reveal delay={0.1}>
            <a href={waLink('Quero montar o escopo da minha marca.')} target="_blank" rel="noopener noreferrer" className="hidden md:inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--color-accent)] border border-[var(--color-accent)] px-4 py-2 rounded-full hover:bg-[var(--color-accent)] hover:text-white transition-colors">
              Ver Todos os Serviços <ArrowRight size={13} />
            </a>
          </Reveal>
        </div>

        {/* Grid 3x2 */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.06}>
              <div className="bg-white border border-[var(--color-border)] rounded-xl p-6 h-full flex flex-col gap-4 hover:border-[var(--color-accent)] hover:shadow-[0_8px_30px_rgba(79,70,229,0.06)] transition-all duration-200">
                <div className={`w-11 h-11 rounded-lg ${s.color} flex items-center justify-center`}>
                  <s.icon size={20} />
                </div>
                <h3 className="text-[15px] font-bold text-gray-900">{s.title}</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed flex-1">{s.description}</p>
                <a href={waLink(`Quero saber mais sobre: ${s.title}`)} target="_blank" rel="noopener noreferrer" className="text-[13px] font-semibold text-[var(--color-accent)] inline-flex items-center gap-1 mt-auto">
                  Saiba mais <ArrowRight size={12} />
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

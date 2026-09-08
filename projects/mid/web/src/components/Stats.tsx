import { Reveal } from './Reveal'
import { TrendingUp, Users, BarChart3, Award } from 'lucide-react'

const stats = [
  { icon: Users, value: '30+', label: 'Marcas Reposicionadas', color: 'bg-indigo-100 text-indigo-600' },
  { icon: TrendingUp, value: '340%', label: 'Engajamento Médio', color: 'bg-green-100 text-green-600' },
  { icon: BarChart3, value: '4×', label: 'Leads Qualificados', color: 'bg-purple-100 text-purple-600' },
  { icon: Award, value: '90%', label: 'Taxa de Retenção', color: 'bg-amber-100 text-amber-600' },
]

export function Stats() {
  return (
    <section className="py-20 bg-[var(--color-bg-soft)]">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Reveal><span className="badge">◎ RESULTADOS</span></Reveal>
            <Reveal delay={0.05}><h2 className="text-3xl md:text-4xl font-bold mt-3">Seu sucesso é nossa prioridade</h2></Reveal>
            <Reveal delay={0.1}><p className="text-[var(--color-text-secondary)] mt-3 leading-relaxed">Construímos resultados mensuráveis, não métricas de vaidade. Cada número aqui reflete posicionamento real gerando negócio real.</p></Reveal>

            <div className="grid grid-cols-2 gap-4 mt-8">
              {stats.map((s, i) => (
                <Reveal key={s.label} delay={0.15 + i * 0.05}>
                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-[var(--color-border)]">
                    <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center shrink-0`}>
                      <s.icon size={18} />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{s.value}</p>
                      <p className="text-xs text-[var(--color-text-light)]">{s.label}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={0.1}>
            <img
              src={new URL('../assets/ref.webp', import.meta.url).href}
              alt="Resultados MID"
              className="w-full h-[380px] object-cover rounded-xl"
            />
          </Reveal>
        </div>
      </div>
    </section>
  )
}

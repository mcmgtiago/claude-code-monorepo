import { Reveal } from './Reveal'
import { waLink } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

const steps = [
  { letter: 'M', name: 'MAPEAR', description: 'Mapeamos operação, cliente, mercado e o que realmente diferencia você. Sem achismo.', deliverables: ['Diagnóstico estratégico', 'Mapa de posicionamento', 'Radar de concorrência'], color: 'bg-indigo-600' },
  { letter: 'E', name: 'ESPELHAR', description: 'Traduzimos a inteligência da sua empresa numa linguagem digital do seu tamanho.', deliverables: ['Identidade verbal', 'Identidade visual', 'Manual de tom de voz'], color: 'bg-purple-600' },
  { letter: 'C', name: 'CONECTAR', description: 'Posicionamos sua marca para ser encontrada pelas pessoas certas, no momento certo.', deliverables: ['Calendário editorial', 'Funil de conteúdo', 'Critérios de mensuração'], color: 'bg-pink-600' },
]

export function MethodMEC() {
  return (
    <section id="method" className="py-20">
      <div className="container">
        {/* Centered header */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <Reveal><span className="badge">◎ NOSSO PROCESSO</span></Reveal>
          <Reveal delay={0.05}><h2 className="text-[28px] md:text-[36px] font-bold mt-3 tracking-[-0.01em]">O Método <span className="text-[var(--color-accent)]">MEC</span></h2></Reveal>
          <Reveal delay={0.1}><p className="text-[14px] text-gray-500 mt-2">Três passos. Um posicionamento inegável.</p></Reveal>
        </div>

        {/* 3 columns */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <Reveal key={step.letter} delay={i * 0.1}>
              <div className="bg-white border border-[var(--color-border)] rounded-xl p-6 h-full flex flex-col hover:border-[var(--color-accent)] hover:shadow-[0_8px_30px_rgba(79,70,229,0.06)] transition-all duration-200">
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-11 h-11 rounded-lg ${step.color} flex items-center justify-center`}>
                    <span className="text-[15px] font-bold text-white">{step.letter}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase">Passo {i + 1}</span>
                </div>
                <h3 className="text-[15px] font-bold text-gray-900 mb-2">{step.name}</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed mb-5 flex-1">{step.description}</p>
                <div className="pt-4 border-t border-gray-100">
                  <ul className="flex flex-col gap-1.5">
                    {step.deliverables.map((d) => (
                      <li key={d} className="flex items-center gap-2 text-[12px] text-gray-500">
                        <span className="w-1 h-1 rounded-full bg-[var(--color-accent)]" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* CTA */}
        <Reveal delay={0.4}>
          <div className="text-center mt-10">
            <a href={waLink('Quero entender como o MEC se aplica ao meu negócio.')} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[var(--color-accent)] text-white text-[13px] font-semibold px-6 py-3 rounded-full hover:bg-[#4338ca] transition-colors">
              Quero o MEC aplicado à minha marca <ArrowRight size={14} />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

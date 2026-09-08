import { Reveal } from './Reveal'
import { waLink } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

const cases = [
  { tag: 'INDÚSTRIA B2B', problem: 'Marca forte no presencial, invisível no digital.', solution: 'Reposicionamento completo + 90 dias de conteúdo com método MEC.', result: '+340% engajamento · 3 novas contas/mês via direct', metric: '+340%' },
  { tag: 'CONSULTORIA DE GESTÃO', problem: 'Comunicação genérica, leads desqualificados, equipe gastando tempo com quem não fechava.', solution: 'Refil de discurso + novo funil de conteúdo por estágio de jornada.', result: '4× leads qualificados em 60 dias · Reuniões de 38% → 71%', metric: '4×' },
  { tag: 'VAREJO LOCAL', problem: 'Dono travado quando perguntavam "o que vocês têm de melhor". O melhor não aparecia no digital.', solution: 'Mapeamento + espelho em 5 vídeos curtos e carrossel de posicionamento.', result: 'Viralizou no nicho da cidade · Cliente voltou a fechar negócios', metric: 'Viral' },
]

export function Cases() {
  return (
    <section id="cases" className="py-20">
      <div className="container">
        <div className="flex items-end justify-between mb-12">
          <div>
            <Reveal><span className="badge">◎ CASES</span></Reveal>
            <Reveal delay={0.05}><h2 className="text-3xl md:text-4xl font-bold mt-3">Resultados que viraram referência</h2></Reveal>
          </div>
          <Reveal delay={0.1}>
            <a href={waLink('Vi os cases e quero resultado assim.')} target="_blank" rel="noopener noreferrer" className="hidden md:inline-flex btn btn-outline text-sm">
              Ver todos os cases <ArrowRight size={14} />
            </a>
          </Reveal>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {cases.map((c, i) => (
            <Reveal key={c.tag} delay={i * 0.08}>
              <div className="card h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-[var(--color-accent)] uppercase">{c.tag}</span>
                  <span className="text-lg font-bold text-green-600">{c.metric}</span>
                </div>
                <div className="flex flex-col gap-3 flex-1">
                  <div>
                    <p className="text-xs font-bold text-[var(--color-text-light)] uppercase mb-1">Problema</p>
                    <p className="text-sm text-[var(--color-text-secondary)]">{c.problem}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--color-text-light)] uppercase mb-1">MEC Aplicado</p>
                    <p className="text-sm text-[var(--color-text-secondary)]">{c.solution}</p>
                  </div>
                  <div className="mt-auto pt-3 border-t border-[var(--color-border)]">
                    <p className="text-xs font-bold text-[var(--color-text-light)] uppercase mb-1">Resultado</p>
                    <p className="text-sm font-medium">{c.result}</p>
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

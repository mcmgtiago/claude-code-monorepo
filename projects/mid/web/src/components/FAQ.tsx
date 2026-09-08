import { useState } from 'react'
import { Reveal } from './Reveal'
import { waLink } from '@/lib/utils'
import { ChevronDown, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqs = [
  {
    question: 'Vocês atendem meu segmento?',
    answer: 'Atendemos marcas que já têm operação real — entregam, vendem, faturam — e querem o digital no mesmo nível. Se você vende, entrega e quer crescer, sim.',
  },
  {
    question: 'Quanto custa?',
    answer: 'Depende do diagnóstico. Cada marca tem um escopo diferente — a gente não aplica tabela fixa. A primeira conversa é gratuita e nela mapeamos o desafio e apresentamos o investimento sem surpresa.',
  },
  {
    question: 'Como funciona o método MEC?',
    answer: 'M — Mapeamos sua operação, cliente e diferencial. E — Espelhamos a inteligência da marca no digital. C — Conectamos a marca com quem precisa dela. É processo, não fórmula.',
  },
  {
    question: 'Em quanto tempo vejo resultado?',
    answer: 'Primeiros ajustes de percepção: 30 dias. Resultados consistentes: 60 a 90 dias. Posicionamento consolidado: a partir de 6 meses. Quem promete resultado em 15 dias está vendendo vaidade.',
  },
  {
    question: 'Já trabalho com outra agência, faz sentido trocar?',
    answer: 'Se sua agência atual só entrega post sem perguntar o "porquê", sim — faz sentido conversar. Se ela já faz diagnóstico estratégico com você, talvez ela já aplique algo parecido com o MEC.',
  },
  {
    question: 'Vocês também fazem tráfego pago?',
    answer: 'Sim — mas só depois do posicionamento. Impulsionar mensagem errada só queima dinheiro mais rápido. A gente prefere construir a mensagem certa primeiro.',
  },
  {
    question: 'Atendem fora da minha cidade?',
    answer: 'Atendemos clientes em todo o Brasil. A operação é 100% remota, com reuniões marcadas, cronograma claro e entregáveis semanais.',
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-24 section-light">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Reveal>
              <span className="badge mb-4">◎ FAQ</span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
                Perguntas frequentes
              </h2>
            </Reveal>
          </div>

          {/* FAQ List */}
          <div className="flex flex-col gap-3">
            {faqs.map((faq, index) => (
              <Reveal key={faq.question} delay={index * 0.06}>
                <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-[var(--color-bg-soft)] transition-colors"
                    aria-expanded={openIndex === index}
                  >
                    <span className="text-sm font-semibold text-[var(--color-text)] pr-4">
                      {faq.question}
                    </span>
                    <ChevronDown
                      size={18}
                      className={cn(
                        'text-[var(--color-text-light)] shrink-0 transition-transform duration-300',
                        openIndex === index && 'rotate-180'
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      'overflow-hidden transition-all duration-300',
                      openIndex === index ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
                    )}
                  >
                    <p className="px-5 pb-5 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* CTA */}
          <Reveal delay={0.5}>
            <div className="text-center mt-10">
              <p className="text-sm text-[var(--color-text-light)] mb-3">Ainda tem dúvida?</p>
              <a
                href={waLink('Tenho uma dúvida específica.')}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Falar no WhatsApp
                <ArrowRight size={16} />
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Container, Section } from '../ui/Container'
import { Eyebrow } from '../ui/Eyebrow'
import { ScrollReveal } from '../ui/ScrollReveal'
import { faqItems } from '../../data/content'

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const handleToggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index))
  }

  return (
    <Section id="faq" className="bg-bg">
      <Container>
        <ScrollReveal className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <Eyebrow>PERGUNTAS FREQUENTES</Eyebrow>
          <h2 className="font-display font-semibold tracking-tight text-fg">
            Dúvidas comuns sobre nossos <span className="text-bronze">serviços.</span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={1} className="max-w-3xl mx-auto">
          <ul className="flex flex-col gap-3">
            {faqItems.map((item, index) => {
              const isOpen = openIndex === index
              return (
                <li
                  key={item.question}
                  className="glass-panel rounded-xl overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => handleToggle(index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${index}`}
                    className="w-full flex items-center justify-between gap-4 p-5 md:p-6 text-left hover:text-bronze transition-colors"
                  >
                    <span className="text-base md:text-lg font-display font-medium text-fg">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 text-bronze transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <div
                    id={`faq-panel-${index}`}
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                      isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 md:px-6 pb-5 md:pb-6 text-sm md:text-base text-muted leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </ScrollReveal>
      </Container>
    </Section>
  )
}
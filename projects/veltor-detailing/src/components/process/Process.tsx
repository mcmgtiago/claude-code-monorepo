import { Container, Section } from '../ui/Container'
import { Eyebrow } from '../ui/Eyebrow'
import { ScrollReveal } from '../ui/ScrollReveal'
import { Button } from '../ui/Button'
import { WhatsAppLink, WHATSAPP_MESSAGES } from '../ui/WhatsAppLink'
import { processSteps } from '../../data/content'

export function Process() {
  return (
    <Section id="processo">
      <Container>
        <ScrollReveal className="max-w-3xl mx-auto text-center mb-12 md:mb-16 lg:mb-20">
          <Eyebrow>COMO FUNCIONA</Eyebrow>
          <h2 className="font-display font-semibold tracking-tight text-fg">
            Do diagnóstico à entrega.
          </h2>
          <p className="mt-5 text-base md:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Um processo claro, transparente e padronizado para você acompanhar cada etapa.
          </p>
        </ScrollReveal>

        {/* Desktop: horizontal timeline */}
        <div className="hidden lg:block relative">
          {/* Horizontal connecting line */}
          <div
            className="absolute top-7 left-[8%] right-[8%] h-px border-t border-dashed border-bronze/40"
            aria-hidden="true"
          />

          <div className="grid grid-cols-6 gap-4">
            {processSteps.map((step, index) => (
              <ScrollReveal key={step.number} delay={index}>
                <div className="relative flex flex-col items-center text-center">
                  {/* Dot marker */}
                  <div className="relative z-10 w-3.5 h-3.5 rounded-full bg-bronze ring-4 ring-bg" />

                  <div className="mt-6 font-display text-2xl text-bronze/80 tracking-tight">
                    {step.number}
                  </div>

                  <h3 className="mt-3 font-display font-semibold text-base text-fg">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-sm text-muted leading-relaxed max-w-[180px]">
                    {step.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Mobile / tablet: vertical timeline */}
        <div className="lg:hidden relative pl-8">
          {/* Vertical connecting line */}
          <div
            className="absolute top-2 bottom-2 left-[11px] w-px border-l border-dashed border-bronze/40"
            aria-hidden="true"
          />

          <div className="flex flex-col gap-10">
            {processSteps.map((step, index) => (
              <ScrollReveal key={step.number} delay={index}>
                <div className="relative">
                  {/* Dot marker */}
                  <div className="absolute -left-[27px] top-1 z-10 w-3.5 h-3.5 rounded-full bg-bronze ring-4 ring-bg" />

                  <div className="font-display text-2xl text-bronze/80 tracking-tight">
                    {step.number}
                  </div>

                  <h3 className="mt-2 font-display font-semibold text-lg text-fg">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-sm text-muted leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        <ScrollReveal delay={1} className="mt-12 md:mt-16 text-center">
          <WhatsAppLink
            message={WHATSAPP_MESSAGES.orcamento}
            className="inline-block"
          >
            <Button variant="primary" size="lg">
              Agendar uma avaliação
            </Button>
          </WhatsAppLink>
        </ScrollReveal>
      </Container>
    </Section>
  )
}
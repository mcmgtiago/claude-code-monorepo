import { motion, useReducedMotion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { Container, Section } from '../ui/Container'
import { Eyebrow } from '../ui/Eyebrow'
import { ScrollReveal } from '../ui/ScrollReveal'
import { services } from '../../data/content'

export function Services() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <Section id="servicos">
      <Container>
        <ScrollReveal className="max-w-3xl mx-auto text-center mb-12 md:mb-16 lg:mb-20">
          <Eyebrow>NOSSOS SERVIÇOS</Eyebrow>
          <h2 className="font-display font-semibold tracking-tight text-fg">
            Cuidado completo.{' '}
            <span className="text-bronze">Resultado extraordinário.</span>
          </h2>
          <p className="mt-5 text-base md:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Soluções profissionais para recuperar, proteger e elevar o acabamento do seu veículo ao máximo padrão.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, index) => (
            <ScrollReveal key={service.id} delay={index}>
              <motion.article
                whileHover={prefersReducedMotion ? undefined : { y: -4 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="glass-panel h-full p-7 md:p-8 rounded-2xl flex flex-col group cursor-pointer hover:border-bronze/30 hover:shadow-[0_20px_50px_-12px_rgba(184,138,82,0.25)]"
              >
                <div className="font-display font-semibold text-3xl text-bronze/80 tracking-tight">
                  {String(index + 1).padStart(2, '0')}
                </div>

                <h3 className="mt-6 font-display font-semibold text-xl md:text-2xl text-fg">
                  {service.title}
                </h3>

                <p className="mt-3 text-sm md:text-base text-muted leading-relaxed flex-grow">
                  {service.description}
                </p>

                <a
                  href="#contato"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-bronze hover:text-bronze-hover self-start group/link"
                >
                  <span className="relative">
                    {service.cta}
                    <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-bronze transition-all duration-300 group-hover/link:w-full" />
                  </span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1" />
                </a>
              </motion.article>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </Section>
  )
}

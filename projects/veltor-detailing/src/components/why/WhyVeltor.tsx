import { motion } from 'motion/react'
import { Container, Section } from '../ui/Container'
import { SectionTitle } from '../ui/SectionTitle'
import { ScrollReveal } from '../ui/ScrollReveal'
import { whyItems } from '../../data/content'

export function WhyVeltor() {
  return (
    <Section id="diferenciais">
      <Container>
        <ScrollReveal>
          <SectionTitle
            eyebrow="DIFERENCIAIS"
            title="Por que escolher a Veltor?"
            subtitle="Excelência que se percebe em cada etapa do processo."
          />
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {whyItems.map((item, index) => (
            <ScrollReveal key={item.number} delay={index}>
              <motion.article
                whileHover={{ y: -2 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="bg-surface border border-white/10 rounded-xl p-6 md:p-8 h-full transition-colors duration-300 hover:border-bronze"
              >
                <div className="font-display text-4xl text-bronze/40 tracking-tight select-none">
                  {item.number}
                </div>

                <h3 className="mt-6 font-display font-semibold text-lg md:text-xl text-fg">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm text-muted leading-relaxed">
                  {item.description}
                </p>
              </motion.article>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </Section>
  )
}
import { Container, Section } from '../ui/Container'
import { ScrollReveal } from '../ui/ScrollReveal'
import { stats } from '../../data/content'

export function TrustBar() {
  return (
    <Section id="confianca" className="py-12 md:py-16 lg:py-20">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 lg:gap-16">
          {stats.map((stat, index) => (
            <ScrollReveal key={stat.label} delay={index} className="text-center md:text-left">
              <div className="font-display font-semibold text-4xl md:text-5xl lg:text-6xl text-bronze leading-none tracking-tight">
                {stat.value}
              </div>
              <div className="mt-3 text-xs md:text-sm uppercase tracking-[0.15em] text-muted">
                {stat.label}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </Section>
  )
}

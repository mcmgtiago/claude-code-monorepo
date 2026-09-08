import { Star } from 'lucide-react'
import { Container, Section } from '../ui/Container'
import { Eyebrow } from '../ui/Eyebrow'
import { ScrollReveal } from '../ui/ScrollReveal'
import { testimonials } from '../../data/content'

export function Testimonials() {
  return (
    <Section id="avaliacoes" className="bg-bg">
      <Container>
        <ScrollReveal className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <Eyebrow>AVALIAÇÕES</Eyebrow>
          <h2 className="font-display font-semibold tracking-tight text-fg">
            A experiência de quem confia na <span className="text-bronze">Veltor.</span>
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <ScrollReveal key={testimonial.author} delay={index}>
              <article className="glass-panel h-full p-7 md:p-8 rounded-2xl flex flex-col hover:border-bronze/30 transition-colors">
                {/* Stars */}
                <div className="flex items-center gap-1 text-bronze" aria-label={`${testimonial.rating} estrelas`}>
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-bronze" />
                  ))}
                </div>

                {/* Text */}
                <blockquote className="mt-6 text-base text-fg leading-relaxed flex-grow">
                  &ldquo;{testimonial.text}&rdquo;
                </blockquote>

                {/* Author */}
                <div className="mt-6 pt-6 border-t border-white/[0.06]">
                  <div className="text-fg font-display font-semibold text-sm">
                    {testimonial.author}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-[0.15em] text-muted">
                    {testimonial.vehicle}
                  </div>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={3} className="mt-12 md:mt-16 text-center">
          <a
            href="https://www.google.com/maps"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-bronze hover:text-bronze-hover transition-colors"
          >
            <span className="relative">
              Ver avaliações no Google
              <span className="absolute left-0 -bottom-0.5 h-px w-full bg-bronze/30" />
            </span>
          </a>
        </ScrollReveal>
      </Container>
    </Section>
  )
}
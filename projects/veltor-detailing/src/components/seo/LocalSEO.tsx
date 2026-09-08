import { Container } from '../ui/Container'
import { seoLocalContent } from '../../data/content'

export function LocalSEO() {
  return (
    <section className="border-t border-white/5 bg-bg" aria-label="SEO local">
      <Container className="py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-sm md:text-base font-display font-semibold uppercase tracking-[0.18em] text-bronze">
            {seoLocalContent.title}
          </h3>
          <p className="mt-3 text-xs md:text-sm text-muted leading-relaxed max-w-3xl mx-auto">
            {seoLocalContent.text}
          </p>
        </div>
      </Container>
    </section>
  )
}
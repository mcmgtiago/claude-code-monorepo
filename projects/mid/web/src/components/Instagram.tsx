import { Reveal } from './Reveal'
import { ArrowRight } from 'lucide-react'

export function Instagram() {
  return (
    <section id="instagram" className="py-24 section-light">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-14">
          <div>
            <Reveal>
              <span className="badge mb-4">◎ INSTAGRAM</span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="text-3xl md:text-4xl font-extrabold">
                Acompanhe no Instagram
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <a
              href="https://www.instagram.com/mid.influencia"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary text-sm"
            >
              Seguir @mid.influencia
              <ArrowRight size={14} />
            </a>
          </Reveal>
        </div>

        {/* Embed area */}
        <Reveal delay={0.15}>
          <div className="bg-[var(--color-bg-soft)] rounded-2xl border border-[var(--color-border)] p-8 md:p-12">
            <div className="max-w-lg mx-auto">
              <blockquote
                className="instagram-media"
                data-instgrm-permalink="https://www.instagram.com/mid.influencia/"
                data-instgrm-version="14"
                style={{
                  background: '#FFF',
                  border: 0,
                  borderRadius: '12px',
                  margin: '0 auto',
                  maxWidth: '540px',
                  minWidth: '280px',
                  padding: 0,
                  width: '100%',
                }}
              >
                <a href="https://www.instagram.com/mid.influencia/" target="_blank" rel="noopener noreferrer">
                  Ver @mid.influencia no Instagram
                </a>
              </blockquote>
            </div>

            {/* Fallback text */}
            <p className="text-center text-sm text-[var(--color-text-light)] mt-6">
              Refletindo o digital que faz diferença. Siga{' '}
              <a
                href="https://www.instagram.com/mid.influencia"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-accent)] font-semibold hover:underline"
              >
                @mid.influencia
              </a>{' '}
              e veja o método em movimento.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

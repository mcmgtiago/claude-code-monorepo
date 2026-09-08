import { Reveal } from './Reveal'
import { waLink } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

export function CTABanner() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="section-dark rounded-2xl px-8 py-16 md:px-16 text-center">
          <Reveal><h2 className="text-3xl md:text-4xl font-bold max-w-2xl mx-auto">Posicione sua marca no digital com a MID</h2></Reveal>
          <Reveal delay={0.1}><p className="mt-4 max-w-lg mx-auto">Diagnóstico gratuito de 15 min no WhatsApp. Sem compromisso.</p></Reveal>
          <Reveal delay={0.15}>
            <a href={waLink('Quero o diagnóstico gratuito de 15 min.')} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp mt-6">
              Diagnosticar minha marca <ArrowRight size={16} />
            </a>
          </Reveal>
          <Reveal delay={0.2}><p className="text-sm text-white/50 mt-4">Resposta em até 2h úteis. Conversa com quem entende do seu mercado.</p></Reveal>
        </div>
      </div>
    </section>
  )
}

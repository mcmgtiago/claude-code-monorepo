import { MessageCircle } from 'lucide-react'
import { Logo } from '../../assets/Logo'
import { Container } from '../ui/Container'
import { ScrollReveal } from '../ui/ScrollReveal'
import { Button } from '../ui/Button'
import { WhatsAppLink, WHATSAPP_MESSAGES } from '../ui/WhatsAppLink'

export function CTABottom() {
  return (
    <section id="cta-final" className="relative w-full overflow-hidden bg-[#0f1113] border-y border-white/[0.04]">
      <Container className="py-20 md:py-28 lg:py-36">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-6 md:gap-8">
          <ScrollReveal>
            <Logo color="#F6F6F4" />
          </ScrollReveal>

          <ScrollReveal delay={1}>
            <h2 className="font-display font-semibold tracking-tight text-fg text-3xl md:text-5xl lg:text-6xl">
              Eleve o padrão do seu <span className="text-bronze">veículo.</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={2}>
            <p className="text-base md:text-lg text-muted leading-relaxed max-w-2xl">
              Entre em contato com a Veltor e descubra como nosso estúdio pode transformar o acabamento do seu carro.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={3}>
            <WhatsAppLink message={WHATSAPP_MESSAGES.default} className="mt-2">
              <Button variant="primary" size="lg">
                <MessageCircle className="w-5 h-5" />
                Falar com a Veltor agora
              </Button>
            </WhatsAppLink>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  )
}
import { MessageCircle, Phone, Camera, Mail } from 'lucide-react'
import { Logo } from '../../assets/Logo'
import { Section, Container } from '../ui/Container'
import { WhatsAppLink, WHATSAPP_MESSAGES, buildWhatsAppUrl } from '../ui/WhatsAppLink'
import { brandInfo } from '../../data/content'

const NAV_ITEMS = [
  { label: 'Início', href: '#hero' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Serviços', href: '#servicos' },
  { label: 'Projetos', href: '#portfolio' },
  { label: 'Avaliações', href: '#avaliacoes' },
  { label: 'Contato', href: '#contato' },
]

const SERVICE_ITEMS = [
  { label: 'Vitrificação', href: '#servicos' },
  { label: 'Polimento', href: '#servicos' },
  { label: 'Higienização', href: '#servicos' },
  { label: 'PPF', href: '#servicos' },
  { label: 'Detalhamento', href: '#servicos' },
  { label: 'Proteção de pintura', href: '#servicos' },
]

const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
  e.preventDefault()
  const target = document.querySelector(href)
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

export function Footer() {
  const whatsappUrl = buildWhatsAppUrl(WHATSAPP_MESSAGES.default)
  const phoneClean = brandInfo.phone.replace(/\D/g, '')
  const instagramUrl = `https://instagram.com/veltordetailing`

  return (
    <Section id="contato" className="bg-[#090B0D] border-t border-white/[0.06] py-16 md:py-20 lg:py-24">
      <Container>
        {/* Top: 4-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 lg:gap-8">
          {/* Coluna 1 — Marca */}
          <div className="flex flex-col gap-5">
            <a
              href="#hero"
              onClick={(e) => handleSmoothScroll(e, '#hero')}
              aria-label="Veltor Detailing — Início"
              className="inline-flex"
            >
              <Logo color="#F6F6F4" />
            </a>
            <p className="text-muted text-sm leading-relaxed max-w-xs">
              Precisão em cada detalhe.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 mt-1">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram da Veltor Detailing"
                className="w-10 h-10 inline-flex items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-muted hover:text-bronze hover:border-bronze/50 transition-colors"
              >
                <Camera className="w-4 h-4" />
              </a>
              <WhatsAppLink
                message={WHATSAPP_MESSAGES.default}
                aria-label="WhatsApp da Veltor Detailing"
                className="w-10 h-10 inline-flex items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-muted hover:text-bronze hover:border-bronze/50 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </WhatsAppLink>
            </div>
          </div>

          {/* Coluna 2 — Navegação */}
          <div className="flex flex-col gap-5">
            <h3 className="text-fg font-display font-semibold text-sm tracking-[0.15em] uppercase">
              Navegação
            </h3>
            <ul className="flex flex-col gap-3">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={(e) => handleSmoothScroll(e, item.href)}
                    className="text-muted text-sm hover:text-bronze transition-colors duration-300"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 3 — Serviços */}
          <div className="flex flex-col gap-5">
            <h3 className="text-fg font-display font-semibold text-sm tracking-[0.15em] uppercase">
              Serviços
            </h3>
            <ul className="flex flex-col gap-3">
              {SERVICE_ITEMS.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    onClick={(e) => handleSmoothScroll(e, item.href)}
                    className="text-muted text-sm hover:text-bronze transition-colors duration-300"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 4 — Contato */}
          <div className="flex flex-col gap-5">
            <h3 className="text-fg font-display font-semibold text-sm tracking-[0.15em] uppercase">
              Contato
            </h3>
            <ul className="flex flex-col gap-4">
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 text-muted text-sm hover:text-bronze transition-colors duration-300"
                  aria-label="Conversar no WhatsApp"
                >
                  <span className="w-9 h-9 inline-flex items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-muted group-hover:text-bronze group-hover:border-bronze/50 transition-colors shrink-0">
                    <MessageCircle className="w-4 h-4" />
                  </span>
                  <span className="break-all">WhatsApp</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:+${phoneClean}`}
                  className="group flex items-center gap-3 text-muted text-sm hover:text-bronze transition-colors duration-300"
                  aria-label="Ligar para a Veltor Detailing"
                >
                  <span className="w-9 h-9 inline-flex items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-muted group-hover:text-bronze group-hover:border-bronze/50 transition-colors shrink-0">
                    <Phone className="w-4 h-4" />
                  </span>
                  <span>{brandInfo.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 text-muted text-sm hover:text-bronze transition-colors duration-300"
                  aria-label="Instagram da Veltor Detailing"
                >
                  <span className="w-9 h-9 inline-flex items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-muted group-hover:text-bronze group-hover:border-bronze/50 transition-colors shrink-0">
                    <Camera className="w-4 h-4" />
                  </span>
                  <span>@veltordetailing</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-muted text-sm">
                  <span className="w-9 h-9 inline-flex items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-muted shrink-0">
                    <Mail className="w-4 h-4" />
                  </span>
                  <span className="leading-relaxed">{brandInfo.location}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom: divider + copyright + legal links */}
        <div className="mt-14 md:mt-16 lg:mt-20 pt-8 border-t border-white/[0.06]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <p className="text-muted text-xs sm:text-sm">
              © 2026 Veltor Detailing. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-muted text-xs sm:text-sm hover:text-bronze transition-colors duration-300"
              >
                Política de Privacidade
              </a>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-muted text-xs sm:text-sm hover:text-bronze transition-colors duration-300"
              >
                Termos de Uso
              </a>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}

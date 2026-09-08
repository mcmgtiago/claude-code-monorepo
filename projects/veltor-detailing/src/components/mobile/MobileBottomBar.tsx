import { MessageCircle, Phone, Navigation } from 'lucide-react'
import { brandInfo } from '../../data/content'
import { buildWhatsAppUrl, WHATSAPP_MESSAGES } from '../ui/WhatsAppLink'

export function MobileBottomBar() {
  const phoneClean = brandInfo.phone.replace(/\D/g, '')
  const phoneHref = `tel:+${phoneClean}`
  const whatsappUrl = buildWhatsAppUrl(WHATSAPP_MESSAGES.default)
  const mapsQuery = encodeURIComponent(brandInfo.location)
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`

  return (
    <nav
      aria-label="Ações rápidas de contato"
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-bg/95 backdrop-blur-md border-t border-white/[0.06]"
    >
      <div className="grid grid-cols-3 gap-px">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1 min-h-[56px] py-2 text-bronze hover:bg-bronze-soft transition-colors"
          aria-label="Falar no WhatsApp"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-[11px] font-medium uppercase tracking-[0.1em]">WhatsApp</span>
        </a>

        <a
          href={phoneHref}
          className="flex flex-col items-center justify-center gap-1 min-h-[56px] py-2 text-bronze hover:bg-bronze-soft transition-colors"
          aria-label="Ligar para a Veltor"
        >
          <Phone className="w-5 h-5" />
          <span className="text-[11px] font-medium uppercase tracking-[0.1em]">Ligar</span>
        </a>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1 min-h-[56px] py-2 text-bronze hover:bg-bronze-soft transition-colors"
          aria-label="Como chegar"
        >
          <Navigation className="w-5 h-5" />
          <span className="text-[11px] font-medium uppercase tracking-[0.1em]">Como chegar</span>
        </a>
      </div>
    </nav>
  )
}
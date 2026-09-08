const WHATSAPP_NUMBER = '5562999999999'

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export const WHATSAPP_MESSAGES = {
  default: 'Olá! Conheci a Veltor pelo site e gostaria de solicitar uma avaliação para meu veículo.',
  vitrificacao: 'Olá! Conheci a Veltor pelo site e gostaria de saber mais sobre vitrificação cerâmica.',
  polimento: 'Olá! Conheci a Veltor pelo site e gostaria de informações sobre polimento técnico.',
  ppf: 'Olá! Conheci a Veltor pelo site e gostaria de conhecer a proteção PPF.',
  orcamento: 'Olá! Gostaria de solicitar um orçamento para estética automotiva.',
}

interface WhatsAppLinkProps {
  children: React.ReactNode
  message?: string
  className?: string
  [key: string]: any
}

export function WhatsAppLink({ children, message = WHATSAPP_MESSAGES.default, className = '', ...props }: WhatsAppLinkProps) {
  return (
    <a href={buildWhatsAppUrl(message)} target="_blank" rel="noopener noreferrer" className={className} {...props}>
      {children}
    </a>
  )
}

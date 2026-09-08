import { Eyebrow } from './Eyebrow'

interface SectionTitleProps {
  eyebrow?: string
  title: string
  subtitle?: string
  className?: string
  align?: 'left' | 'center'
}

export function SectionTitle({ eyebrow, title, subtitle, className = '', align = 'left' }: SectionTitleProps) {
  const alignment = align === 'center' ? 'text-center' : 'text-left'
  return (
    <div className={`max-w-3xl mb-12 md:mb-16 ${alignment} ${align === 'center' ? 'mx-auto' : ''} ${className}`}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="text-fg font-display">{title}</h2>
      {subtitle && <p className="mt-4 text-base md:text-lg text-muted leading-relaxed max-w-2xl">{subtitle}</p>}
    </div>
  )
}

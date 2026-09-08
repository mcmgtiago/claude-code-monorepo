interface LogoProps {
  variant?: 'full' | 'icon'
  className?: string
  color?: string
}

export function Logo({ variant = 'full', className = '', color = 'currentColor' }: LogoProps) {
  if (variant === 'icon') {
    return (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Veltor Detailing">
        {/* V + D combined symbol — geometric, minimal */}
        <path
          d="M8 12L24 38L40 12"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 12C16 12 24 12 30 12C36 12 40 16 40 22C40 28 36 32 30 32C27 32 24 32 24 32"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      <div className="flex items-center gap-3">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" aria-hidden="true">
          <path
            d="M8 12L24 38L40 12"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 12C16 12 24 12 30 12C36 12 40 16 40 22C40 28 36 32 30 32C27 32 24 32 24 32"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="flex flex-col leading-none">
          <span className="text-fg font-display font-bold text-lg tracking-[0.1em] uppercase">VELTOR</span>
          <span className="text-muted text-[10px] tracking-[0.25em] uppercase">DETAILING STUDIO</span>
        </div>
      </div>
    </div>
  )
}

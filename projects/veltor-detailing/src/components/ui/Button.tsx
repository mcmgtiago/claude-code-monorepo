import { clsx } from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Button({ variant = 'primary', size = 'md', children, className, ...props }: ButtonProps) {
  const baseStyles = 'font-medium transition-all duration-300 inline-flex items-center justify-center gap-2 cursor-pointer rounded-full focus-visible:outline-bronze focus-visible:outline-offset-2'

  const variants = {
    primary: 'bg-bronze hover:bg-bronze-hover text-bg font-semibold min-h-[48px] px-8 shadow-[0_8px_20px_-6px_rgba(184,138,82,0.4)] hover:shadow-[0_12px_28px_-6px_rgba(184,138,82,0.6)] hover:scale-[1.02] active:scale-95',
    secondary: 'bg-surface hover:bg-surface-elevated text-fg border border-border hover:border-bronze min-h-[48px] px-8',
  }

  const sizes = {
    sm: 'text-sm px-4 min-h-[40px]',
    md: 'text-base px-6 min-h-[48px]',
    lg: 'text-lg px-8 min-h-[56px]',
  }

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}

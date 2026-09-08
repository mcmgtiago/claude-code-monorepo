import { type ReactNode } from 'react'

interface MarqueeProps {
  children: ReactNode
  speed?: number
  reverse?: boolean
  className?: string
  pauseOnHover?: boolean
}

export function Marquee({ children, speed = 60, reverse = false, className = '', pauseOnHover = true }: MarqueeProps) {
  const id = `marquee-${Math.random().toString(36).slice(2, 8)}`

  return (
    <div className={`group overflow-hidden ${className}`}>
      <style>{`
        @keyframes ${id} {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .${id}-track {
          display: flex;
          width: max-content;
          animation: ${id} ${speed}s linear infinite;
          animation-direction: ${reverse ? 'reverse' : 'normal'};
        }
        ${pauseOnHover ? `.group:hover .${id}-track { animation-play-state: paused; }` : ''}
      `}</style>
      <div className={`${id}-track`}>
        {children}
        {children}
      </div>
    </div>
  )
}

import { useRef, useEffect } from 'react'
import { useInView, animate } from 'motion/react'

interface Props {
  value: number
  suffix?: string
  prefix?: string
  decimals?: number
  className?: string
}

export function AnimatedCounter({ value, suffix = '', prefix = '', decimals = 0, className = '' }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  useEffect(() => {
    if (!inView || !ref.current) return
    animate(0, value, {
      duration: 1.5,
      ease: 'easeOut',
      onUpdate(val) {
        if (ref.current) {
          ref.current.textContent = prefix + val.toFixed(decimals) + suffix
        }
      },
    })
  }, [inView, value, suffix, prefix, decimals])

  return <span ref={ref} className={className}>{prefix}0{suffix}</span>
}

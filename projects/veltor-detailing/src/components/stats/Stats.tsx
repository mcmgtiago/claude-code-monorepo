import { useEffect, useRef } from 'react'
import { motion, useInView, useMotionValue, useTransform, animate } from 'motion/react'
import { Container, Section } from '../ui/Container'
import { ScrollReveal } from '../ui/ScrollReveal'
import { stats } from '../../data/content'

interface AnimatedStatProps {
  value: string
  label: string
  delay: number
}

function AnimatedStat({ value, label, delay }: AnimatedStatProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => Math.round(latest).toString())

  // Parse the numeric portion and the suffix (e.g. "+800", "7+", "4,9", "98%")
  const match = value.match(/^([+-]?)(\d+)([.,]\d+)?([+%a-z]*)$/i)
  const prefix = match?.[1] ?? ''
  const integerPart = match?.[2] ?? ''
  const decimalPart = match?.[3] ?? ''
  const suffix = match?.[4] ?? ''

  const totalDigits = integerPart.length
  const targetNumber = parseInt(integerPart, 10)

  useEffect(() => {
    if (!inView) return
    const controls = animate(count, targetNumber, {
      duration: 1.8,
      delay: delay * 0.1,
      ease: 'easeOut',
    })
    return () => controls.stop()
  }, [inView, count, targetNumber, delay])

  // Reconstruct the formatted value from the animated integer
  const formatted = useTransform(rounded, (latest) => {
    const padded = latest.padStart(totalDigits, '0')
    return `${prefix}${padded}${decimalPart}${suffix}`
  })

  return (
    <ScrollReveal delay={delay} className="text-center">
      <div ref={ref} className="font-display font-semibold text-5xl md:text-6xl lg:text-7xl text-bronze leading-none tracking-tight">
        <motion.span>{formatted}</motion.span>
      </div>
      <div className="mt-3 md:mt-4 text-xs md:text-sm uppercase tracking-[0.15em] text-muted">
        {label}
      </div>
    </ScrollReveal>
  )
}

export function Stats() {
  return (
    <Section id="numeros" className="bg-bg-light border-y border-white/[0.04]">
      <Container>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 lg:gap-16">
          {stats.map((stat, index) => (
            <AnimatedStat key={stat.label} value={stat.value} label={stat.label} delay={index} />
          ))}
        </div>
      </Container>
    </Section>
  )
}

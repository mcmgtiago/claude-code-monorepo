import { motion, useReducedMotion } from 'motion/react'
import { ChevronDown, MessageCircle } from 'lucide-react'
import { Eyebrow } from '../ui/Eyebrow'
import { Button } from '../ui/Button'
import { WhatsAppLink, WHATSAPP_MESSAGES } from '../ui/WhatsAppLink'
import { Container } from '../ui/Container'
import { heroContent } from '../../data/content'

export function Hero() {
  const prefersReducedMotion = useReducedMotion()

  const fadeIn = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.8,
      delay,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  })

  return (
    <section
      id="hero"
      className="relative w-full min-h-[500px] md:min-h-[600px] flex items-center overflow-hidden"
    >
      {/* Background image */}
      <img
        src="/placeholders/hero-car.svg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Radial dark overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(9,11,13,0.55) 0%, rgba(9,11,13,0.85) 60%, rgba(9,11,13,0.95) 100%)',
        }}
      />

      {/* Bottom gradient for extra legibility */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#090B0D]"
      />

      {/* Content */}
      <Container className="relative z-10 py-24 md:py-32 lg:py-40">
        <div className="max-w-3xl">
          <motion.div {...fadeIn(0)}>
            <Eyebrow>{heroContent.eyebrow}</Eyebrow>
          </motion.div>

          <motion.h1
            {...fadeIn(0.1)}
            className="font-display font-semibold tracking-tight text-fg"
          >
            {heroContent.mainTitle}{' '}
            <span className="block text-bronze">{heroContent.highlight}</span>
          </motion.h1>

          <motion.p
            {...fadeIn(0.2)}
            className="mt-6 text-base md:text-lg text-muted max-w-2xl leading-relaxed"
          >
            {heroContent.subtitle}
          </motion.p>

          <motion.div
            {...fadeIn(0.3)}
            className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
          >
            <WhatsAppLink message={WHATSAPP_MESSAGES.default}>
              <motion.div
                whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                <Button variant="primary" size="lg">
                  <MessageCircle className="w-5 h-5" />
                  {heroContent.primaryCta}
                </Button>
              </motion.div>
            </WhatsAppLink>

            <motion.a
              href="#servicos"
              whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="inline-flex"
            >
              <Button variant="secondary" size="lg">
                {heroContent.secondaryCta}
              </Button>
            </motion.a>
          </motion.div>
        </div>
      </Container>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-10"
        aria-hidden="true"
      >
        <motion.a
          href="#servicos"
          animate={
            prefersReducedMotion
              ? undefined
              : { y: [0, 6, 0], opacity: [0.5, 1, 0.5] }
          }
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-white/[0.03] text-muted hover:text-bronze hover:border-bronze/40 transition-colors"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.a>
      </motion.div>
    </section>
  )
}
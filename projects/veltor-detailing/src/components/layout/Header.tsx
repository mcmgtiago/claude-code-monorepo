import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Menu, X, MessageCircle } from 'lucide-react'
import { Logo } from '../../assets/Logo'
import { Button } from '../ui/Button'
import { WhatsAppLink, WHATSAPP_MESSAGES } from '../ui/WhatsAppLink'

const NAV_ITEMS = [
  { label: 'Início', href: '#hero' },
  { label: 'Serviços', href: '#servicos' },
  { label: 'Projetos', href: '#portfolio' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Avaliações', href: '#avaliacoes' },
  { label: 'Contato', href: '#contato' },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  const handleNavClick = (href: string) => {
    setIsMenuOpen(false)
    const target = document.querySelector(href)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
          isScrolled
            ? 'bg-[#090B0D]/85 backdrop-blur-xl border-b border-white/[0.06]'
            : 'bg-transparent border-b border-transparent'
        }`}
        style={{
          transitionProperty: 'background-color, backdrop-filter, border-color, box-shadow',
        }}
      >
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Left: Logo */}
            <a
              href="#hero"
              onClick={(e) => {
                e.preventDefault()
                handleNavClick('#hero')
              }}
              className="relative z-10"
              aria-label="Veltor Detailing — Início"
            >
              <Logo color="#F6F6F4" />
            </a>

            {/* Center: Desktop nav */}
            <nav className="hidden lg:flex items-center gap-8" aria-label="Navegação principal">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault()
                    handleNavClick(item.href)
                  }}
                  className="relative text-sm font-medium text-muted hover:text-fg transition-colors duration-300 group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-bronze transition-all duration-300 group-hover:w-full" />
                </a>
              ))}
            </nav>

            {/* Right: CTA + Mobile toggle */}
            <div className="flex items-center gap-3">
              <WhatsAppLink
                message={WHATSAPP_MESSAGES.orcamento}
                className="hidden sm:inline-flex"
              >
                <Button variant="primary" size="sm">
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden md:inline">Solicitar orçamento</span>
                  <span className="md:hidden">Orçamento</span>
                </Button>
              </WhatsAppLink>

              {/* Mobile hamburger */}
              <button
                type="button"
                onClick={() => setIsMenuOpen((v) => !v)}
                className="lg:hidden relative z-10 w-10 h-10 inline-flex items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-fg hover:border-bronze/50 transition-colors"
                aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-menu"
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden fixed inset-0 z-40 bg-[#090B0D]/95 backdrop-blur-xl"
          >
            <div className="flex flex-col h-full pt-24 pb-8 px-6">
              <nav className="flex-1 flex flex-col gap-2" aria-label="Navegação mobile">
                {NAV_ITEMS.map((item, i) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault()
                      handleNavClick(item.href)
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.1 + i * 0.05,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="group flex items-center justify-between py-4 border-b border-white/[0.06] text-fg font-display font-semibold text-2xl tracking-tight"
                  >
                    <span>{item.label}</span>
                    <span className="text-muted text-sm font-mono">
                      0{i + 1}
                    </span>
                  </motion.a>
                ))}
              </nav>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="pt-6"
              >
                <WhatsAppLink message={WHATSAPP_MESSAGES.orcamento} className="block">
                  <Button variant="primary" size="lg" className="w-full">
                    <MessageCircle className="w-5 h-5" />
                    Solicitar orçamento
                  </Button>
                </WhatsAppLink>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
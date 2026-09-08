import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { waLink } from '@/lib/utils'

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Início', href: '#hero' },
    { label: 'Sobre', href: '#about' },
    { label: 'Serviços', href: '#services' },
    { label: 'Método', href: '#method' },
    { label: 'Cases', href: '#cases' },
    { label: 'Contato', href: '#contact' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
      <div
        className={`flex items-center justify-between w-full max-w-[1100px] h-[56px] px-6 rounded-full transition-all duration-300 ${
          scrolled
            ? 'bg-white shadow-[0_2px_20px_rgba(0,0,0,0.08)] border border-gray-100'
            : 'bg-white shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-gray-100'
        }`}
      >
        {/* Logo */}
        <a href="#hero" className="flex items-center shrink-0">
          <img src="/logomid.png" alt="MID" className="h-7 w-auto" />
        </a>

        {/* Desktop Nav - center */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[14px] font-medium text-gray-700 hover:text-[var(--color-accent)] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA button */}
        <a
          href={waLink('Vim pelo site e quero posicionar minha marca.')}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-2 bg-[var(--color-accent)] text-white text-[13px] font-semibold px-5 py-2.5 rounded-full hover:bg-[#4338ca] transition-colors"
        >
          Falar Conosco
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="ml-0.5">
            <path d="M1 11L11 1M11 1H3M11 1V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-[72px] left-4 right-4 bg-white rounded-2xl shadow-xl border border-gray-100 p-5">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block py-3 text-[14px] font-medium text-gray-700 border-b border-gray-100 last:border-0"
            >
              {link.label}
            </a>
          ))}
          <a
            href={waLink('Vim pelo site e quero posicionar minha marca.')}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-[var(--color-accent)] text-white text-sm font-semibold px-5 py-3 rounded-full mt-4"
          >
            Falar Conosco
          </a>
        </div>
      )}
    </header>
  )
}

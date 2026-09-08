import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ROUTES, navLinks } from "@/lib/routes";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { motion, AnimatePresence } from "motion/react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const scrollDirection = useScrollDirection();
  const isMobile = useIsMobile();

  const isHidden = scrollDirection === "down" && !isMobile && !mobileMenuOpen;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 bg-paper/94 border-b border-line transition-transform duration-300 ${
        isHidden ? "-translate-y-full" : "translate-y-0"
      }`}
      style={{
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={ROUTES.home} className="flex-shrink-0 hover:opacity-80 transition-opacity">
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm font-medium text-ink hover:text-wine transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Desktop CTAs */}
          {!isMobile && (
            <div className="hidden md:flex items-center gap-4">
              <Link
                to={ROUTES.contact}
                className="text-sm font-medium text-ink hover:text-wine transition-colors">
                Entrar em contato
              </Link>
              <Link
                to={ROUTES.companies}
                className="inline-flex items-center gap-2 px-5 h-11 rounded-full bg-wine text-white font-medium hover:bg-wine-deep transition-all hover:translate-y-px">
                Solicitar proposta
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-ink hover:bg-paper-muted rounded-lg transition-colors"
              aria-label="Abrir menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-line bg-navy text-white">
            <div className="px-4 py-6 space-y-4 max-w-6xl mx-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-base font-medium hover:text-sand transition-colors">
                  {link.label}
                </Link>
              ))}
              <hr className="my-4 border-navy-soft" />
              <Link
                to={ROUTES.jobs}
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-3 rounded-full bg-wine text-white font-medium hover:bg-wine-deep transition-colors">
                Encontrar uma vaga
              </Link>
              <Link
                to={ROUTES.companies}
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-3 rounded-full border-2 border-wine text-wine font-medium hover:bg-wine/5 transition-colors">
                Solicitar proposta
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prevent body scroll when menu is open */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/0 z-[-1]"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
}

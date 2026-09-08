import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BRAND, NAV_LINKS } from "../data/content";
import { GradientButton } from "./ui/GradientButton";
import { Icon } from "./ui/Icon";
import { cn } from "../lib/utils";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 py-3 md:px-6">
      <nav
        aria-label="Navegação principal"
        className={cn(
          "container-content flex h-16 items-center justify-between rounded-full border transition-all duration-300",
          scrolled
            ? "liquid-glass border-black/5 bg-white/90 shadow-soft"
            : "border-transparent bg-white/80 backdrop-blur-md"
        )}
      >
        <a href="#topo" className="flex items-center gap-3" aria-label="Página inicial">
          <span className="grid size-11 place-items-center rounded-full bg-gradient-brand text-white shadow-glow">
            <Icon name="Users" className="size-5" aria-hidden />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold tracking-tight md:text-base">
              {BRAND.name}
            </span>
            <span className="block text-[11px] font-medium text-[var(--color-ink-soft)]">
              {BRAND.tagline}
            </span>
          </span>
        </a>

        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-[var(--color-ink-soft)] transition-colors hover:bg-black/[0.04] hover:text-[var(--color-ink)]"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <GradientButton href="#contato" size="sm" icon={<Icon name="ArrowRight" className="size-3.5" />}>
            Agendar Conversa
          </GradientButton>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="grid size-11 place-items-center rounded-full border border-black/10 bg-white text-[var(--color-ink)] lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
        >
          <Icon name={open ? "X" : "Menu"} className="size-5" aria-hidden />
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -12, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="mx-3 mt-3 rounded-[28px] border border-black/5 bg-white p-3 shadow-soft lg:hidden"
          >
            <div className="grid gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-[var(--color-ink-soft)] hover:bg-black/[0.04] hover:text-[var(--color-ink)]"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <GradientButton href="#contato" size="md" fullWidth className="mt-3">
              Agendar Conversa
            </GradientButton>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
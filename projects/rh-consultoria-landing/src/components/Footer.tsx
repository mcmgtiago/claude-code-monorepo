import { Instagram, Linkedin, Mail, Users } from "lucide-react";
import { BRAND, FOOTER_LINKS } from "../data/content";
import { GradientButton } from "./ui/GradientButton";

export function Footer() {
  return (
    <footer className="bg-[var(--color-ink)] text-white">
      <div className="container-content py-14 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1.9fr]">
          <div>
            <a href="#topo" className="flex items-center gap-3" aria-label="Página inicial">
              <span className="grid size-12 place-items-center rounded-full bg-gradient-brand text-white shadow-glow">
                <Users className="size-5" aria-hidden />
              </span>
              <span>
                <span className="block text-lg font-bold tracking-tight">
                  {BRAND.name}
                </span>
                <span className="block text-sm text-white/60">{BRAND.tagline}</span>
              </span>
            </a>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">
              {BRAND.description}
            </p>
            <div className="mt-6 flex gap-3">
              <a aria-label="LinkedIn" href="#" className="grid size-10 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20">
                <Linkedin className="size-5" />
              </a>
              <a aria-label="Instagram" href="#" className="grid size-10 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20">
                <Instagram className="size-5" />
              </a>
              <a aria-label="E-mail" href={`mailto:${BRAND.email}`} className="grid size-10 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20">
                <Mail className="size-5" />
              </a>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FooterColumn title="Empresa" links={FOOTER_LINKS.company} />
            <FooterColumn title="Serviços" links={FOOTER_LINKS.services} />
            <FooterColumn title="Recursos" links={FOOTER_LINKS.resources} />
            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-white/50">
                Newsletter
              </h3>
              <p className="mt-4 text-sm leading-6 text-white/60">
                Receba insights mensais sobre cultura, liderança e performance.
              </p>
              <form className="mt-4 grid gap-3" onSubmit={(event) => event.preventDefault()}>
                <input
                  type="email"
                  placeholder="Seu e-mail"
                  aria-label="Seu e-mail"
                  className="h-12 rounded-full border border-white/10 bg-white/10 px-4 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/40"
                />
                <GradientButton size="md" fullWidth>
                  Assinar
                </GradientButton>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-white/50 md:flex-row md:items-center md:justify-between">
          <p>© 2026 {BRAND.name}. Todos os direitos reservados.</p>
          <div className="flex flex-wrap gap-4">
            {FOOTER_LINKS.legal.map((link) => (
              <a key={link.label} href={link.href} className="hover:text-white">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-white/50">
        {title}
      </h3>
      <ul className="mt-4 grid gap-3">
        {links.map((link) => (
          <li key={link.label}>
            <a href={link.href} className="text-sm text-white/65 transition-colors hover:text-white">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
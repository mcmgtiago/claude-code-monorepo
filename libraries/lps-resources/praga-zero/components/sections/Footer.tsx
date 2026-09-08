import Link from "next/link";
import { Mail, Phone, MessageCircle, Instagram, Facebook } from "lucide-react";
import { siteConfig } from "@/config/siteConfig";
import type { TenantCompany } from "@/config/tenantTypes";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { BrandLogo } from "@/components/brand-logo";

type Props = {
  city: string;
  company?: TenantCompany;
};

export function Footer({ city, company }: Props) {
  const brand = company || { ...siteConfig.company, logo: "/logo.svg" };
  return (
    <footer className="bg-text py-14 text-white">
      <div className="container">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-extrabold"><BrandLogo src={brand.logo} name={brand.name} /></div>
            <p className="mt-4 text-sm text-white/65">{brand.shortDescription}</p>
            <p className="mt-4 text-xs text-white/55">CNPJ: {brand.cnpj}</p>
            <p className="mt-1 text-xs text-white/55">CNAE: {brand.cnae}</p>
          </div>
          <div>
            <h3 className="font-bold">Serviços</h3>
            <ul className="mt-4 space-y-2 text-sm text-white/65">
              {siteConfig.services.slice(0, 6).map((s) => <li key={s.title}><Link href="#servicos" className="hover:text-primary">{s.title}</Link></li>)}
            </ul>
          </div>
          <div>
            <h3 className="font-bold">Contato</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/65">
              <li><a className="inline-flex items-center gap-2 hover:text-primary" href={`tel:+55${brand.phone}`}><Phone className="h-4 w-4" /> {brand.phoneFormatted}</a></li>
              <li><a className="inline-flex items-center gap-2 hover:text-primary" href={`mailto:${brand.email}`}><Mail className="h-4 w-4" /> {brand.email}</a></li>
              <li><a className="inline-flex items-center gap-2 hover:text-primary" href={buildWhatsAppLink({ city, service: "footer", phone: brand.phone, messageTemplate: brand.whatsappMessage })}><MessageCircle className="h-4 w-4" /> WhatsApp</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold">Redes sociais</h3>
            <div className="mt-4 flex gap-3">
              <a href={`https://instagram.com/${brand.instagram.replace("@", "")}`} aria-label="Instagram" className="rounded-full bg-white/10 p-3 hover:bg-primary"><Instagram className="h-5 w-5" /></a>
              <a href={`https://facebook.com${brand.facebook}`} aria-label="Facebook" className="rounded-full bg-white/10 p-3 hover:bg-primary"><Facebook className="h-5 w-5" /></a>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-white/50">
          © 2026 {brand.name}. Todos os direitos reservados. Desenvolvido por LP Local.
        </div>
      </div>
    </footer>
  );
}

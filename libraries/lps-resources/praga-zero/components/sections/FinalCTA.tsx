import { Mail, Phone } from "lucide-react";
import { siteConfig } from "@/config/siteConfig";
import type { TenantCompany } from "@/config/tenantTypes";
import { WhatsappButton } from "@/components/whatsapp-button";

export function FinalCTA({ city, company }: { city: string; company?: TenantCompany }) {
  const brand = company || { ...siteConfig.company, logo: "/logo.svg" };
  return (
    <section className="relative overflow-hidden bg-text py-20 text-white">
      <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:28px_28px]" />
      <div className="container relative z-10 text-center">
        <h2 className="text-balance text-3xl font-extrabold md:text-5xl">Ainda tem praga em casa? Chama agora.</h2>
        <p className="mx-auto mt-5 max-w-2xl text-white/75">Receba orientação rápida, orçamento grátis e atendimento em {city} com garantia escrita.</p>
        <div className="mt-9">
          <WhatsappButton city={city} label="Chamar no WhatsApp Agora" size="xl" service="cta-final" pulse phone={brand.phone} messageTemplate={brand.whatsappMessage} />
        </div>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 text-sm font-semibold text-white/85 sm:flex-row">
          <a href={`tel:+55${brand.phone}`} className="inline-flex items-center gap-2 hover:text-primary"><Phone className="h-4 w-4" /> {brand.phoneFormatted}</a>
          <a href={`mailto:${brand.email}`} className="inline-flex items-center gap-2 hover:text-primary"><Mail className="h-4 w-4" /> {brand.email}</a>
        </div>
      </div>
    </section>
  );
}

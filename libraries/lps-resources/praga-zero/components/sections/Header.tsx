"use client";

import Link from "next/link";
import { Menu, Phone } from "lucide-react";
import { siteConfig } from "@/config/siteConfig";
import type { TenantCompany } from "@/config/tenantTypes";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { WhatsappButton } from "@/components/whatsapp-button";
import { CityBadge } from "@/components/city-badge";
import { BrandLogo } from "@/components/brand-logo";

const nav = [
  { href: "#servicos", label: "Serviços" },
  { href: "#diferenciais", label: "Diferenciais" },
  { href: "#faq", label: "FAQ" },
  { href: "#cobertura", label: "Cobertura" },
];

type Props = {
  city: string;
  company?: TenantCompany;
};

export function Header({ city, company }: Props) {
  const brand = company || { ...siteConfig.company, logo: "/logo.svg" };
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-white/90 shadow-sm backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="#topo" className="flex items-center gap-2 font-extrabold" aria-label={`Ir para o início - ${brand.name}`}>
          <BrandLogo src={brand.logo} name={brand.name} />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium lg:flex" aria-label="Navegação principal">
          {nav.map((item) => <Link key={item.href} href={item.href} className="hover:text-primary">{item.label}</Link>)}
          <CityBadge city={city} />
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <a href={`tel:+55${brand.phone}`} className="inline-flex items-center gap-2 text-sm font-semibold hover:text-primary">
            <Phone className="h-4 w-4" aria-hidden="true" /> {brand.phoneFormatted}
          </a>
          <WhatsappButton city={city} label="WhatsApp" size="sm" phone={brand.phone} messageTemplate={brand.whatsappMessage} />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden" aria-label="Abrir menu">
              <Menu className="h-5 w-5" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetTitle>{brand.name}</SheetTitle>
            <div className="mt-8 flex flex-col gap-5">
              <CityBadge city={city} />
              {nav.map((item) => <Link key={item.href} href={item.href} className="text-lg font-semibold">{item.label}</Link>)}
              <WhatsappButton city={city} className="mt-4" phone={brand.phone} messageTemplate={brand.whatsappMessage} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

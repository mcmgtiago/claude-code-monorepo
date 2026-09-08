"use client";

import { m } from "framer-motion";
import { ShieldCheck, PawPrint, Zap, FileCheck } from "lucide-react";
import { WhatsappButton } from "@/components/whatsapp-button";
import { MediaVideo } from "@/components/media-video";
import type { TenantCompany, TenantHeroMedia } from "@/config/tenantTypes";

const trust = [
  { icon: ShieldCheck, label: "Produto seguro" },
  { icon: PawPrint, label: "Pet friendly" },
  { icon: Zap, label: "24h" },
  { icon: FileCheck, label: "Garantia escrita" },
];

const fallbackMedia: TenantHeroMedia = {
  type: "image",
  src: "/hero-dedetizacao.svg",
  poster: "/hero-dedetizacao.svg",
  alt: "Técnico profissional de dedetização com equipamento de segurança",
};

const fadeUp = {
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
};

type Props = {
  city: string;
  media?: TenantHeroMedia;
  company?: TenantCompany;
};

export function Hero({ city, media = fallbackMedia, company }: Props) {
  return (
    <section id="topo" className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden text-white">
      <div className="absolute inset-0">
        <MediaVideo media={media} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/76 via-black/60 to-black/30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(37,211,102,.20),transparent_30%),radial-gradient(circle_at_80%_70%,rgba(252,211,77,.14),transparent_34%)]" />
      <div className="container relative z-10 py-24">
        <m.div className="max-w-4xl" transition={{ staggerChildren: 0.1 }}>
          <m.p {...fadeUp} transition={{ duration: 0.5 }} className="mb-5 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
            Orçamento grátis em até 30 minutos
          </m.p>
          <m.h1 {...fadeUp} transition={{ duration: 0.5 }} className="text-balance text-4xl font-extrabold leading-tight md:text-6xl">
            Dedetização em {city} <span className="block text-primary">— Atendimento 24h</span>
          </m.h1>
          <m.p {...fadeUp} transition={{ duration: 0.5 }} className="mt-6 max-w-2xl text-lg text-white/90 md:text-xl">
            Elimine baratas, ratos, formigas e escorpiões hoje mesmo. Orçamento grátis no WhatsApp.
          </m.p>
          <m.div {...fadeUp} transition={{ duration: 0.5 }} className="mt-9 flex flex-col gap-4 sm:flex-row">
            <WhatsappButton city={city} label="Chamar no WhatsApp Agora" size="lg" service="geral" pulse phone={company?.phone} messageTemplate={company?.whatsappMessage} />
            <a href="#servicos" className="inline-flex h-14 items-center justify-center rounded-full border border-white/30 px-8 font-semibold text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-primary">
              Ver serviços
            </a>
          </m.div>
          <m.div {...fadeUp} transition={{ duration: 0.5 }} className="mt-8 flex flex-wrap gap-3">
            {trust.map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/12 px-4 py-2 text-sm font-semibold shadow-lg shadow-black/10 backdrop-blur">
                <Icon className="h-4 w-4 text-primary" aria-hidden="true" /> {label}
              </span>
            ))}
          </m.div>
          {media.photographer ? <p className="mt-8 text-[11px] text-white/45">Mídia: {media.photographer}</p> : null}
        </m.div>
      </div>
    </section>
  );
}

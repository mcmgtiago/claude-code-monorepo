"use client";

import Image from "next/image";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { siteConfig } from "@/config/siteConfig";
import type { TenantMediaAsset } from "@/config/tenantTypes";

const fallbackImages: TenantMediaAsset[] = [
  { src: "/resultado-1.svg", alt: "Resultado visual de controle de pragas" },
  { src: "/resultado-2.svg", alt: "Aplicação profissional de dedetização" },
  { src: "/resultado-3.svg", alt: "Garantia escrita de controle de pragas" },
  { src: "/resultado-4.svg", alt: "Ambiente sanitizado após serviço" },
];

type Props = {
  gallery?: TenantMediaAsset[];
  neighborhoods?: readonly string[];
};

export function BeforeAfter({ gallery = fallbackImages, neighborhoods = siteConfig.coverage.neighborhoods }: Props) {
  return (
    <section className="py-20">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold md:text-4xl">Resultados Reais</h2>
          <p className="mt-4 text-muted">Fotos premium para mostrar cuidado, técnica e acabamento profissional.</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {gallery.map((asset, idx) => {
            const district = neighborhoods[idx % neighborhoods.length];
            return (
              <Dialog key={`${asset.src}-${idx}`}>
                <DialogTrigger className="group text-left" aria-label={`Abrir resultado real em ${district}`}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border/60">
                    <Image src={asset.src} alt={asset.alt || `Resultado de dedetização em ${district}`} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover transition duration-300 group-hover:scale-105" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                      <p className="text-sm font-bold">Cliente em {district}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-semibold">Resultado real de cliente em {district}</p>
                  {asset.photographer ? <p className="mt-1 text-[10px] text-muted">Foto: {asset.photographer}</p> : null}
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>Resultado real em {district}</DialogTitle>
                  <DialogDescription>{asset.alt || "Imagem demonstrativa do padrão visual para provas sociais da landing page."}</DialogDescription>
                  <div className="relative mt-3 aspect-video overflow-hidden rounded-xl">
                    <Image src={asset.src} alt={asset.alt || `Imagem ampliada de dedetização em ${district}`} fill sizes="90vw" className="object-cover" />
                  </div>
                </DialogContent>
              </Dialog>
            );
          })}
        </div>
      </div>
    </section>
  );
}

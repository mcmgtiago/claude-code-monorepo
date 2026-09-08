import { MapPin } from "lucide-react";
import { siteConfig } from "@/config/siteConfig";
import type { TenantCompany, TenantCoverage } from "@/config/tenantTypes";
import { WhatsappButton } from "@/components/whatsapp-button";

export function Coverage({ city, state, coverage, company }: { city: string; state: string; coverage?: TenantCoverage; company?: TenantCompany }) {
  const area = coverage || siteConfig.coverage;
  const mapQuery = encodeURIComponent(`${city}, ${state}, Brasil`);
  return (
    <section id="cobertura" className="bg-surface py-20">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-3xl font-extrabold md:text-4xl">Área de Atendimento em {city} e Região</h2>
          <p className="mt-4 text-muted">Atendemos residências, condomínios, comércios, cozinhas industriais e empresas.</p>
        </div>
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <h3 className="text-xl font-bold">Bairros e regiões atendidas</h3>
            <div className="mt-5 flex flex-wrap gap-3">
              {[
                ...area.neighborhoods.map((place) => ({ type: "bairro", place })),
                ...area.regions.map((place) => ({ type: "região", place })),
              ].map(({ type, place }) => (
                <span key={`${type}-${place}`} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm">
                  <MapPin className="h-4 w-4 text-primary" aria-hidden="true" /> {place}
                </span>
              ))}
            </div>
            <div className="mt-8">
              <WhatsappButton city={city} label="Não viu seu bairro? Consulte-nos" service="cobertura" phone={company?.phone} messageTemplate={company?.whatsappMessage} />
            </div>
          </div>
          <div className="order-1 overflow-hidden rounded-2xl bg-white shadow-sm lg:order-2">
            <iframe
              title={`Mapa de atendimento em ${city}`}
              src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
              className="h-[360px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

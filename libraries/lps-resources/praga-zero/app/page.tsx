import type { Metadata } from "next";
import { headers } from "next/headers";
import { getCityFromIP } from "@/lib/geo";
import { loadTenant } from "@/lib/tenants";
import { TenantPage } from "@/components/tenant-page";

const tenant = loadTenant("praga-zero");

export async function generateMetadata(): Promise<Metadata> {
  const geo = await getCityFromIP(headers());
  return {
    title: `Dedetização em ${geo.city} | ${tenant.company.name} — Atendimento 24h`,
    description: `Dedetização em ${geo.city}/${geo.state}: baratas, ratos, formigas, cupins e escorpiões. Orçamento grátis no WhatsApp ${tenant.company.phoneFormatted}.`,
    openGraph: {
      title: `Dedetização em ${geo.city} | ${tenant.company.name}`,
      description: `Controle de pragas urbanas em ${geo.city} com atendimento 24h, garantia escrita e produtos ANVISA.`,
      images: [tenant.media.og.src],
      locale: "pt_BR",
      type: "website",
    },
  };
}

export default async function Home() {
  const geo = await getCityFromIP(headers());
  return <TenantPage tenant={tenant} city={geo.city || tenant.coverage.defaultCity} state={geo.state || tenant.coverage.defaultState} />;
}

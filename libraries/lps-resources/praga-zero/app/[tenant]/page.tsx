import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getCityFromIP } from "@/lib/geo";
import { listTenants, loadTenant, tenantExists } from "@/lib/tenants";
import { TenantPage } from "@/components/tenant-page";

export function generateStaticParams() {
  return listTenants().map((tenant) => ({ tenant: tenant.slug }));
}

export async function generateMetadata({ params }: { params: { tenant: string } }): Promise<Metadata> {
  if (!tenantExists(params.tenant)) return {};
  const tenant = loadTenant(params.tenant);
  const geo = await getCityFromIP(headers());
  return {
    title: `Dedetização em ${geo.city} | ${tenant.company.name} — Atendimento 24h`,
    description: `Dedetização em ${geo.city}/${geo.state}: atendimento 24h, produtos ANVISA, pet friendly e orçamento grátis no WhatsApp ${tenant.company.phoneFormatted}.`,
    openGraph: {
      title: `Dedetização em ${geo.city} | ${tenant.company.name}`,
      description: tenant.company.shortDescription,
      images: [tenant.media.og.src],
      locale: "pt_BR",
      type: "website",
    },
  };
}

export default async function TenantRoute({ params }: { params: { tenant: string } }) {
  if (!tenantExists(params.tenant)) notFound();
  const tenant = loadTenant(params.tenant);
  const geo = await getCityFromIP(headers());
  return <TenantPage tenant={tenant} city={geo.city || tenant.coverage.defaultCity} state={geo.state || tenant.coverage.defaultState} />;
}

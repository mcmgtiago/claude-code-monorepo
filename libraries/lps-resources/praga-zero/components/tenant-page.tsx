import { siteConfig } from "@/config/siteConfig";
import type { TenantConfig } from "@/config/tenantTypes";
import { MotionProvider } from "@/components/motion-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/sections/Header";
import { Hero } from "@/components/sections/Hero";
import { Pain } from "@/components/sections/Pain";
import { Services } from "@/components/sections/Services";
import { Differentials } from "@/components/sections/Differentials";
import { BeforeAfter } from "@/components/sections/BeforeAfter";
import { Testimonials } from "@/components/sections/Testimonials";
import { Stats } from "@/components/sections/Stats";
import { FAQ } from "@/components/sections/FAQ";
import { Coverage } from "@/components/sections/Coverage";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Footer } from "@/components/sections/Footer";

export function TenantJsonLd({ tenant, city, state }: { tenant: TenantConfig; city: string; state: string }) {
  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: tenant.company.name,
    telephone: `+55${tenant.company.phone}`,
    email: tenant.company.email,
    priceRange: "$$",
    image: tenant.media.og.src,
    areaServed: { "@type": "City", name: city, addressRegion: state, addressCountry: "BR" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: tenant.company.googleRating,
      reviewCount: tenant.company.propertiesServed,
    },
  };
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: siteConfig.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
  const services = siteConfig.services.map((service) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.desc,
    areaServed: city,
    provider: { "@type": "LocalBusiness", name: tenant.company.name },
  }));
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(services) }} />
    </>
  );
}

export function TenantPage({ tenant, city, state }: { tenant: TenantConfig; city: string; state: string }) {
  return (
    <MotionProvider>
      <ThemeProvider theme={tenant.theme} />
      <TenantJsonLd tenant={tenant} city={city} state={state} />
      <Header city={city} company={tenant.company} />
      <main>
        <Hero city={city} media={tenant.media.hero} company={tenant.company} />
        <Pain />
        <Services />
        <Differentials companyName={tenant.company.name} />
        <BeforeAfter gallery={tenant.media.gallery} neighborhoods={tenant.coverage.neighborhoods} />
        <Testimonials />
        <Stats />
        <FAQ />
        <Coverage city={city} state={state} coverage={tenant.coverage} company={tenant.company} />
        <FinalCTA city={city} company={tenant.company} />
      </main>
      <Footer city={city} company={tenant.company} />
    </MotionProvider>
  );
}

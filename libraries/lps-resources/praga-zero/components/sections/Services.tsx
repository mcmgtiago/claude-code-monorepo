"use client";

import { m } from "framer-motion";
import { siteConfig } from "@/config/siteConfig";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/icon";

export function Services() {
  return (
    <section id="servicos" className="py-20">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold md:text-4xl">Nossos Serviços</h2>
          <p className="mt-4 text-muted">Controle profissional para as principais pragas urbanas.</p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {siteConfig.services.map((service, idx) => (
            <m.div key={service.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ delay: idx * 0.06 }}>
              <Card className="h-full p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Icon name={service.icon} className="h-9 w-9 text-primary" />
                </div>
                <h3 className="mt-5 font-bold">{service.title}</h3>
                <p className="mt-2 text-sm text-muted">{service.desc}</p>
              </Card>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
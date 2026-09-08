"use client";

import { m } from "framer-motion";
import { siteConfig } from "@/config/siteConfig";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/icon";

export function Differentials({ companyName = siteConfig.company.name }: { companyName?: string }) {
  return (
    <section id="diferenciais" className="bg-surface py-20">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-3xl font-extrabold md:text-4xl">Por que escolher a {companyName}?</h2>
          <p className="mt-4 text-muted">Segurança, garantia e atendimento rápido para sua casa ou empresa.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {siteConfig.differentials.map((item, idx) => (
            <m.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ delay: idx * 0.08 }}>
              <Card className="h-full p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/25">
                  <Icon name={item.icon} className="h-7 w-7 text-text" />
                </div>
                <h3 className="mt-5 text-xl font-bold">{item.title}</h3>
                <p className="mt-2 text-muted">{item.desc}</p>
              </Card>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}

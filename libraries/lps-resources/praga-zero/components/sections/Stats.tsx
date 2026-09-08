"use client";

import { m, useInView } from "framer-motion";
import { useRef } from "react";
import { Award, Home, ShieldCheck, Star } from "lucide-react";
import { siteConfig } from "@/config/siteConfig";
import { formatNumber } from "@/lib/utils";

const stats = [
  { icon: Home, value: `+${formatNumber(siteConfig.company.propertiesServed)}`, label: "imóveis atendidos" },
  { icon: Star, value: `${siteConfig.company.googleRating}/5`, label: "avaliação média" },
  { icon: Award, value: `${siteConfig.company.yearsExperience} anos`, label: "de experiência" },
  { icon: ShieldCheck, value: "100%", label: "produtos ANVISA" },
];

export function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <section className="bg-gradient-to-r from-primary to-primary/80 py-20 text-white">
      <div className="container" ref={ref}>
        <div className="grid gap-8 md:grid-cols-4 md:divide-x md:divide-white/25">
          {stats.map(({ icon: Icon, value, label }, idx) => (
            <m.div key={label} initial={{ opacity: 0, y: 18 }} animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }} transition={{ delay: idx * 0.08 }} className="text-center md:px-6">
              <Icon className="mx-auto h-8 w-8" aria-hidden="true" />
              <div className="mt-4 text-5xl font-extrabold">{value}</div>
              <p className="mt-2 text-sm font-semibold text-white/85">{label}</p>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
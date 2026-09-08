"use client";

import { m } from "framer-motion";
import { Bug, Rat, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";

const pains = [
  { icon: Bug, title: "Baratas e lepismas", desc: "Risco de contaminação em alimentos, armários e áreas úmidas." },
  { icon: Rat, title: "Ratos", desc: "Contaminam comida, roem fios e podem causar curto-circuito." },
  { icon: AlertTriangle, title: "Formigas e cupins", desc: "Avançam rápido, fazem ninhos escondidos e estragam estruturas." },
];

export function Pain() {
  return (
    <section className="bg-danger/5 py-20">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-3xl font-extrabold md:text-4xl">Problema com pragas? Não espere piorar.</h2>
          <p className="mt-4 text-muted">Quanto antes resolver, menor o risco pra sua família.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {pains.map(({ icon: Icon, title, desc }, idx) => (
            <m.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ delay: idx * 0.1 }}>
              <Card className="h-full border-l-4 border-l-danger p-6">
                <Icon className="h-12 w-12 text-danger" aria-hidden="true" />
                <h3 className="mt-5 text-xl font-bold">{title}</h3>
                <p className="mt-3 text-muted">{desc}</p>
              </Card>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
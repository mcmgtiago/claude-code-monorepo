import { Container } from "@/components/common/Container";
import { SectionHeader } from "@/components/common/SectionHeader";
import { SectionLabel } from "@/components/common/SectionLabel";
import { Reveal } from "@/components/common/Reveal";
import { MetricTicker } from "@/components/common/MetricTicker";
import { cases } from "@/data/cases";

export function ResultsSection() {
  return (
    <section className="py-16 sm:py-24 bg-navy-deep text-white">
      <Container>
        <div className="max-w-4xl mx-auto mb-12">
          <SectionLabel text="05 / RESULTADOS CONSTRUÍDOS NO DIA A DIA" align="center" className="justify-center" />
          <SectionHeader
            heading="Indicadores que ajudam empresas a contratar com mais segurança."
            className="text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {cases.map((caseItem, idx) => (
            <Reveal key={caseItem.id} delay={idx * 0.1}>
              <div className="rounded-xl bg-navy-soft/50 backdrop-blur-sm border border-navy-soft p-6 sm:p-8">
                <h3 className="font-serif text-xl font-bold mb-3 text-sand">
                  {caseItem.title}
                </h3>

                <div className="mb-6">
                  <h4 className="font-semibold text-sm mb-2 text-white/70">
                    Desafio
                  </h4>
                  <p className="text-sm text-white/60">{caseItem.challenge}</p>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-sm mb-2 text-white/70">
                    Atuação
                  </h4>
                  <p className="text-sm text-white/60">{caseItem.approach}</p>
                </div>

                <div className="space-y-3 pt-6 border-t border-navy-soft">
                  {caseItem.metrics.map((metric) => (
                    <div key={metric.label} className="flex items-center justify-between">
                      <span className="text-sm text-white/70">{metric.label}</span>
                      <span className="text-2xl font-bold font-mono text-sand">
                        {metric.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <p className="text-center text-xs text-white/50 mt-10">
          Empresas, cenários e indicadores ilustrativos para demonstração da interface.
        </p>
      </Container>
    </section>
  );
}

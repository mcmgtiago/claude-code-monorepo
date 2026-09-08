import { Container } from "@/components/common/Container";
import { SectionHeader } from "@/components/common/SectionHeader";
import { SectionLabel } from "@/components/common/SectionLabel";
import { Reveal } from "@/components/common/Reveal";
import { industries } from "@/data/industries";
import { ArrowRight } from "lucide-react";

export function IndustryGrid() {
  return (
    <section className="py-16 sm:py-24 bg-paper">
      <Container>
        <div className="max-w-4xl mx-auto mb-12">
          <SectionLabel text="03 / EXPERIÊNCIA EM DIFERENTES ROTINAS" align="center" className="justify-center" />
          <SectionHeader heading="Conhecimento do trabalho como ele realmente acontece." />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {industries.map((industry, idx) => (
            <Reveal key={industry.id} delay={idx * 0.05}>
              <div className="group bg-white rounded-xl border border-line p-6 hover:border-wine/30 transition-all cursor-pointer">
                {/* Placeholder de imagem */}
                <div className="w-full h-32 bg-ivory rounded-lg mb-4 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-sand-soft/40 to-sage-soft/40 flex items-center justify-center">
                    <span className="text-xs font-mono text-muted">Imagem</span>
                  </div>
                </div>

                <h3 className="font-serif text-lg font-bold text-ink mb-2">
                  {industry.name}
                </h3>
                <p className="text-sm text-ink-soft mb-4 line-clamp-3">
                  {industry.description}
                </p>

                {/* Positions on hover */}
                <div className="hidden group-hover:block animate-in fade-in">
                  <ul className="space-y-1 text-xs text-muted mb-4">
                    {industry.positions.slice(0, 4).map((pos) => (
                      <li key={pos}>{pos}</li>
                    ))}
                  </ul>
                </div>

                <span className="inline-flex items-center gap-1 text-xs text-wine font-semibold group-hover:text-wine-deep transition-colors">
                  Ver posições
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

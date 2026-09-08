import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Container } from "@/components/common/Container";
import { SectionHeader } from "@/components/common/SectionHeader";
import { SectionLabel } from "@/components/common/SectionLabel";
import { Reveal } from "@/components/common/Reveal";
import { services } from "@/data/services";
import { ROUTES } from "@/lib/routes";
import { ArrowRight } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const ease = [0.22, 1, 0.36, 1] as const;

export function ServicesOverview() {
  const reducedMotion = useReducedMotion();

  return (
    <section id="servicos" className="py-16 sm:py-24 bg-paper">
      <Container>
        <div className="max-w-4xl mx-auto">
          <SectionLabel text="01 / SOLUÇÕES DE RECURSOS HUMANOS" align="center" className="justify-center" />
          <SectionHeader
            heading="Estrutura para contratar, administrar e desenvolver pessoas."
            subheading="Cada serviço pode ser contratado de forma independente ou combinado conforme a necessidade da empresa."
          />
        </div>
      </Container>

      <Container className="mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {services.map((service, idx) => (
            <Reveal key={service.id} delay={idx * 0.1}>
              <motion.div
                className="bg-white rounded-xl border border-line p-6 sm:p-8 hover:border-wine/30 transition-all group"
                whileHover={reducedMotion ? {} : { y: -4 }}
              >
                <div className="mb-4">
                  <span className="text-4xl font-mono font-bold text-sand/60 group-hover:text-wine/40 transition-colors">
                    {service.number}
                  </span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl text-ink font-bold mb-3">
                  {service.title}
                </h3>
                <p className="text-ink-soft text-sm sm:text-base mb-4">
                  {service.description}
                </p>
                <ul className="space-y-2 mb-6 text-xs sm:text-sm text-ink-soft">
                  {service.deliverables.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-wine mt-0.5 flex-shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={ROUTES.companies}
                  className="inline-flex items-center gap-2 text-wine font-semibold text-sm hover:text-wine-deep transition-colors group/link">
                  Conhecer este serviço
                  <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

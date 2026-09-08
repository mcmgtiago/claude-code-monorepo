import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/common/Reveal";
import { ROUTES } from "@/lib/routes";
import { trackEvent } from "@/lib/analytics";

export function CompanyCandidateSplit() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Empresas */}
          <Reveal>
            <div className="bg-navy rounded-2xl p-8 sm:p-12 text-white">
              <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-4">
                Precisa contratar ou estruturar uma operação?
              </h3>
              <p className="text-white/70 mb-6 text-base">
                Conte o que está acontecendo na sua empresa. Nossa equipe ajuda a identificar o formato mais adequado antes de apresentar uma proposta.
              </p>
              <ul className="space-y-2 mb-8 text-sm text-white/60">
                {[
                  "Contratações recorrentes",
                  "Picos de demanda",
                  "Novas unidades",
                  "Substituições",
                  "Operações terceirizadas",
                  "Organização do RH",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-sand"></span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to={ROUTES.companies}
                onClick={() => trackEvent("company_path_selected")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-wine text-white font-semibold hover:bg-wine-deep transition-all">
                Falar com um consultor
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </Reveal>

          {/* Profissionais */}
          <Reveal delay={0.1}>
            <div className="bg-wine rounded-2xl p-8 sm:p-12 text-white">
              <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-4">
                Está buscando uma nova oportunidade?
              </h3>
              <p className="text-white/70 mb-6 text-base">
                Consulte vagas abertas, cadastre seus dados e acompanhe processos conduzidos pela PILAR.
              </p>
              <ul className="space-y-2 mb-8 text-sm text-white/60">
                {[
                  "Vagas operacionais",
                  "Vagas administrativas",
                  "Vagas técnicas",
                  "Oportunidades temporárias",
                  "Bancos de talentos",
                  "Programas de estágio",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-sand-soft"></span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to={ROUTES.jobs}
                onClick={() => trackEvent("candidate_path_selected")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-wine font-semibold hover:bg-ivory transition-all">
                Ver vagas disponíveis
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

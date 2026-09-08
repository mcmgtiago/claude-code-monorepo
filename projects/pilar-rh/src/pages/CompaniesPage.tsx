import { Container } from "@/components/common/Container";
import { CompanyLeadForm } from "@/components/forms/CompanyLeadForm";
import { SectionLabel } from "@/components/common/SectionLabel";
import { Reveal } from "@/components/common/Reveal";
import { services } from "@/data/services";
import { ArrowRight } from "lucide-react";

export default function CompaniesPage() {
  return (
    <div className="min-h-screen pt-28 bg-paper pb-16">
      <Container>
        {/* Hero */}
        <div className="max-w-4xl mx-auto mb-16">
          <SectionLabel text="SOLUÇÕES PARA EMPRESAS" />
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-ink mb-6">
            Contrate, organize e desenvolva pessoas com apoio profissional.
          </h1>
          <p className="text-lg text-ink-soft max-w-2xl">
            A PILAR atua ao lado de empresas em demandas de recrutamento, trabalho temporário, terceirização, gestão de pessoal e desenvolvimento.
          </p>
        </div>

        {/* Situações */}
        <Reveal>
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="font-serif text-2xl font-bold text-ink mb-6">
              Situações que atendemos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "Preciso contratar rapidamente",
                "Preciso de trabalhadores temporários",
                "Vou abrir uma nova unidade",
                "Preciso terceirizar uma operação",
                "Quero organizar meu departamento pessoal",
                "Preciso desenvolver líderes",
                "Tenho alto volume de vagas",
                "Preciso substituir um profissional",
              ].map((situation) => (
                <div
                  key={situation}
                  className="flex items-center gap-3 p-4 rounded-lg border border-line hover:border-wine/30 transition-all cursor-pointer group"
                >
                  <ArrowRight className="w-4 h-4 text-wine group-hover:translate-x-0.5 transition-transform" />
                  <span className="text-ink text-sm font-medium">{situation}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Serviços resumo */}
        <Reveal>
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="font-serif text-2xl font-bold text-ink mb-6">
              Nossos serviços
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <div key={service.id} className="p-4 rounded-lg border border-line">
                  <span className="font-mono text-sm text-wine font-bold">{service.number}</span>
                  <h3 className="font-serif text-lg font-bold text-ink mt-1">{service.title}</h3>
                  <p className="text-sm text-ink-soft mt-2">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Formulário */}
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-2xl font-bold text-ink mb-2">
            Solicitar uma proposta
          </h2>
          <p className="text-ink-soft mb-8">
            Preencha o formulário e nossa equipe entrará em contato para entender o contexto antes de apresentar uma proposta.
          </p>
          <div className="bg-white rounded-xl border border-line p-6 sm:p-8">
            <CompanyLeadForm />
          </div>
        </div>
      </Container>
    </div>
  );
}

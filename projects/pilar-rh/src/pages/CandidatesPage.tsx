import { Container } from "@/components/common/Container";
import { CandidateForm } from "@/components/forms/CandidateForm";
import { SectionLabel } from "@/components/common/SectionLabel";
import { Reveal } from "@/components/common/Reveal";
import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/routes";
import { ShieldAlert, ArrowRight } from "lucide-react";

export default function CandidatesPage() {
  return (
    <div className="min-h-screen pt-28 bg-paper pb-16">
      <Container>
        {/* Hero */}
        <div className="max-w-4xl mx-auto mb-12">
          <SectionLabel text="PARA PROFISSIONAIS" />
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink mb-6">
            Encontre vagas e cadastre seu currículo.
          </h1>
          <p className="text-lg text-ink-soft max-w-2xl">
            Consulte oportunidades abertas, cadastre seus dados e acompanhe processos conduzidos pela PILAR.
          </p>
          <Link
            to={ROUTES.jobs}
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-full bg-wine text-white font-semibold hover:bg-wine-deep transition-colors"
          >
            Ver vagas abertas
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Formulário */}
        <Reveal>
          <div className="max-w-2xl mx-auto mb-12">
            <h2 className="font-serif text-2xl font-bold text-ink mb-2">
              Cadastrar currículo
            </h2>
            <p className="text-ink-soft mb-8">
              Preencha seus dados e envie seu currículo para nosso banco de talentos.
            </p>
            <div className="bg-white rounded-xl border border-line p-6 sm:p-8">
              <CandidateForm />
            </div>
          </div>
        </Reveal>

        {/* Aviso contra golpes */}
        <Reveal>
          <div className="max-w-2xl mx-auto bg-sand-soft/30 border border-wine/20 rounded-xl p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <ShieldAlert className="w-8 h-8 text-wine flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-ink mb-2">Atenção</h3>
                <p className="text-sm text-ink-soft leading-relaxed">
                  A PILAR não cobra taxas para participação em processos seletivos.
                  Desconfie de mensagens que solicitem pagamentos, senhas, códigos bancários ou transferências.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </div>
  );
}

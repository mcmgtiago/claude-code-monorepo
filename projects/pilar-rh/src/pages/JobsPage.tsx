import { Container } from "@/components/common/Container";
import { JobSearch } from "@/components/jobs/JobSearch";
import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/routes";
import { ArrowRight } from "lucide-react";

export default function JobsPage() {
  return (
    <div className="min-h-screen pt-28 bg-paper pb-16">
      <Container>
        <div className="max-w-4xl mx-auto mb-12">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink mb-4">
            Encontre sua próxima oportunidade
          </h1>
          <p className="text-lg text-ink-soft">
            Consulte vagas abertas, filtradas por área, localização e tipo de contratação.
          </p>
        </div>

        <JobSearch />

        <div className="max-w-4xl mx-auto mt-16 bg-white rounded-xl border border-line p-8 text-center">
          <h2 className="font-serif text-2xl font-bold text-ink mb-3">
            Não encontrou a vaga ideal?
          </h2>
          <p className="text-ink-soft mb-6">
            Cadastre seu currículo em nosso banco de talentos e nossa equipe entrará em contato quando surgir uma oportunidade compatível com seu perfil.
          </p>
          <Link
            to={ROUTES.candidates}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-wine text-white font-semibold hover:bg-wine-deep transition-colors"
          >
            Cadastrar currículo
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Container>
    </div>
  );
}

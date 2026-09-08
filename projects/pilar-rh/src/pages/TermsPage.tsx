import { Container } from "@/components/common/Container";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-28 bg-paper pb-16">
      <Container>
        <Breadcrumbs items={[{ label: "Termos de Uso" }]} />
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-4xl font-bold text-ink mb-8">Termos de Uso</h1>
          <div className="space-y-6 text-ink-soft">
            <section>
              <h2 className="text-xl font-bold text-ink mb-3">Aceitação dos Termos</h2>
              <p>Ao acessar e utilizar este site, você concorda com estes termos e condições de uso.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-ink mb-3">Processamento de Candidaturas</h2>
              <p>Candidaturas enviadas através do site são confidenciais e utilizadas exclusivamente para avaliação em processos seletivos conduzidos pela PILAR.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-ink mb-3">Isenção de Responsabilidade</h2>
              <p>O site é fornecido "como está". A PILAR não garante que o site estará sempre disponível ou livre de erros.</p>
            </section>
            <p className="text-xs text-muted mt-8">Última atualização: julho de 2026</p>
          </div>
        </div>
      </Container>
    </div>
  );
}

import { Container } from "@/components/common/Container";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-28 bg-paper pb-16">
      <Container>
        <Breadcrumbs items={[{ label: "Privacidade" }]} />
        
        <div className="max-w-3xl mx-auto prose prose-sm">
          <h1 className="font-serif text-4xl font-bold text-ink mb-8">
            Política de Privacidade
          </h1>
          
          <div className="space-y-6 text-ink-soft">
            <section>
              <h2 className="text-xl font-bold text-ink mb-3">Coleta de Dados</h2>
              <p>
                A PILAR Recursos Humanos coleta dados pessoais fornecidos voluntariamente por candidatos, empresas e visitantes do site, incluindo nome, e-mail, telefone, localização e informações profissionais.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-ink mb-3">Uso dos Dados</h2>
              <p>
                Os dados coletados são utilizados para:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Processar candidaturas e processos seletivos</li>
                <li>Manter contato com candidatos e empresas</li>
                <li>Enviar conteúdos informativos e newsletters</li>
                <li>Melhorar nossos serviços</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-ink mb-3">Direitos do Titular</h2>
              <p>
                Você tem direito a acessar, corrigir, atualizar ou solicitar a exclusão de seus dados pessoais a qualquer momento, conforme previsto na LGPD.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-ink mb-3">Contato</h2>
              <p>
                Para dúvidas sobre privacidade, contate: contato@pilarrh.com.br
              </p>
            </section>

            <p className="text-xs text-muted mt-8">
              Última atualização: julho de 2026
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}

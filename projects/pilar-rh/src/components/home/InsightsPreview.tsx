import { Link } from "react-router-dom";
import { Container } from "@/components/common/Container";
import { SectionHeader } from "@/components/common/SectionHeader";
import { SectionLabel } from "@/components/common/SectionLabel";
import { Reveal } from "@/components/common/Reveal";
import { ROUTES } from "@/lib/routes";
import { ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const articles = [
  {
    id: "preparar-contratacao-temporaria",
    category: "Empresas",
    date: "22 jul 2026",
    title: "Como preparar uma contratação temporária sem perder organização",
    summary:
      "Orientações práticas para empresas que precisam ampliar equipes por períodos determinados sem desorganizar rotinas.",
    readTime: 5,
  },
  {
    id: "primeiros-30-dias",
    category: "Liderança",
    date: "18 jul 2026",
    title: "O que observar nos primeiros 30 dias de um novo colaborador",
    summary:
      "Indicadores de adaptação, acompanhamento e sinais de atenção para gestores durante a integração.",
    readTime: 4,
  },
  {
    id: "curriculo-objetivo",
    category: "Carreira",
    date: "14 jul 2026",
    title: "Como organizar um currículo objetivo e fácil de analisar",
    summary:
      "Estrutura, informações essenciais e erros comuns que dificultam a leitura por recrutadores.",
    readTime: 6,
  },
  {
    id: "descricao-de-vaga",
    category: "Mercado",
    date: "10 jul 2026",
    title: "Quais informações devem aparecer em uma descrição de vaga",
    summary:
      "Elementos obrigatórios e boas práticas para atrair candidatos compatíveis com clareza.",
    readTime: 3,
  },
];

export function InsightsPreview() {
  return (
    <section className="py-16 sm:py-24 bg-ivory">
      <Container>
        <div className="max-w-4xl mx-auto mb-12">
          <SectionLabel text="07 / CONTEÚDOS PARA EMPRESAS E PROFISSIONAIS" align="center" className="justify-center" />
          <SectionHeader heading="Informação prática para decisões de trabalho e gestão." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article, idx) => (
            <Reveal key={article.id} delay={idx * 0.08}>
              <div className="bg-white rounded-xl border border-line p-6 hover:border-wine/30 transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-semibold text-wine bg-wine/10 px-2 py-1 rounded-full">
                    {article.category}
                  </span>
                  <span className="text-xs font-mono text-muted">
                    {article.date}
                  </span>
                </div>

                <h3 className="font-serif text-lg font-bold text-ink mb-3 group-hover:text-wine transition-colors">
                  {article.title}
                </h3>

                <p className="text-sm text-ink-soft mb-4 line-clamp-2">
                  {article.summary}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted font-mono">
                    {article.readTime} min de leitura
                  </span>
                  <span
                    onClick={() => trackEvent("article_opened", { articleId: article.id })}
                    className="inline-flex items-center gap-1 text-wine text-xs font-semibold cursor-pointer">
                    Ler conteúdo
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to={ROUTES.insights}
            className="inline-flex items-center gap-2 text-wine font-semibold hover:text-wine-deep transition-colors">
            Ver todos os conteúdos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Container>
    </section>
  );
}

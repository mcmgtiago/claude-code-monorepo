export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const faq: FaqItem[] = [
  {
    id: "tamanho",
    question: "A PILAR atende empresas de qualquer tamanho?",
    answer:
      "Atendemos diferentes portes de empresa. O formato da atuação muda conforme volume, localização, prazo e complexidade da demanda.",
  },
  {
    id: "apenas-recrutamento",
    question: "É possível contratar apenas o recrutamento?",
    answer:
      "Sim. Os serviços podem ser contratados de forma independente ou combinados em uma solução mais ampla.",
  },
  {
    id: "temporarios",
    question: "Vocês trabalham com vagas temporárias?",
    answer:
      "Sim. A PILAR apoia empresas em demandas sazonais, substituições, projetos e aumentos temporários de operação.",
  },
  {
    id: "curriculo",
    question: "Como envio meu currículo?",
    answer:
      "O currículo pode ser enviado pela área de candidatos ou durante a candidatura em uma vaga específica.",
  },
  {
    id: "garantia",
    question: "O cadastro de currículo garante participação em processos?",
    answer:
      "Não. O cadastro permite que o perfil seja consultado em processos compatíveis, mas não representa garantia de convocação ou contratação.",
  },
  {
    id: "retorno-proposta",
    question: "A empresa recebe retorno após solicitar uma proposta?",
    answer:
      "Sim. A equipe comercial analisa as informações enviadas e entra em contato para compreender o cenário antes de elaborar o escopo.",
  },
  {
    id: "cobranca",
    question: "A PILAR cobra do candidato?",
    answer:
      "Não deve haver cobrança de candidatos para participação em processos seletivos conduzidos pela PILAR.",
  },
];

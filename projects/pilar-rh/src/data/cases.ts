export interface CaseStudy {
  id: string;
  title: string;
  challenge: string;
  approach: string;
  metrics: { label: string; value: string }[];
}

export const cases: CaseStudy[] = [
  {
    id: "rede-varejista",
    title: "Rede varejista",
    challenge:
      "Contratar profissionais para 14 novas unidades em um período reduzido.",
    approach:
      "Central de recrutamento, triagem regional e acompanhamento de admissões.",
    metrics: [
      { label: "Posições preenchidas", value: "186" },
      { label: "Dias de operação", value: "23" },
      { label: "Comparecimento na integração", value: "91%" },
    ],
  },
  {
    id: "operacao-logistica",
    title: "Operação logística",
    challenge:
      "Reforçar o quadro durante um período de aumento expressivo de pedidos.",
    approach:
      "Contratação temporária, documentação, implantação e acompanhamento diário.",
    metrics: [
      { label: "Trabalhadores mobilizados", value: "320" },
      { label: "Turnos atendidos", value: "4" },
      { label: "Posições entregues no prazo", value: "96%" },
    ],
  },
  {
    id: "empresa-servicos",
    title: "Empresa de serviços",
    challenge:
      "Organizar rotinas de administração de pessoal em diferentes unidades.",
    approach:
      "Padronização de admissões, benefícios, ponto e relatórios mensais.",
    metrics: [
      { label: "Unidades integradas", value: "7" },
      { label: "Menos pendências documentais", value: "38%" },
      { label: "Dias antecipados no fechamento", value: "2" },
    ],
  },
];

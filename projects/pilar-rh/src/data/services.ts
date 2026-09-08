export interface Service {
  id: string;
  number: string;
  title: string;
  description: string;
  deliverables: string[];
}

export const services: Service[] = [
  {
    id: "recrutamento",
    number: "01",
    title: "Recrutamento e Seleção",
    description:
      "Condução completa de processos seletivos para posições operacionais, administrativas, técnicas e de liderança.",
    deliverables: [
      "Alinhamento de perfil",
      "Divulgação de vagas",
      "Triagem",
      "Entrevistas",
      "Avaliações",
      "Apresentação de candidatos",
      "Acompanhamento da contratação",
    ],
  },
  {
    id: "temporario",
    number: "02",
    title: "Trabalho Temporário",
    description:
      "Apoio para períodos sazonais, aumento de demanda, substituições e projetos com prazo determinado.",
    deliverables: [
      "Captação de profissionais",
      "Gestão documental",
      "Admissão",
      "Folha e encargos",
      "Atendimento ao trabalhador",
      "Controle de contratos",
    ],
  },
  {
    id: "terceirizacao",
    number: "03",
    title: "Terceirização de Mão de Obra",
    description:
      "Estrutura operacional para atividades de apoio, atendimento, logística, administração e serviços especializados.",
    deliverables: [
      "Implantação",
      "Gestão da equipe",
      "Supervisão",
      "Indicadores",
      "Substituições",
      "Relatórios periódicos",
    ],
  },
  {
    id: "administracao",
    number: "04",
    title: "Administração de Pessoal",
    description:
      "Rotinas de admissão, documentação, benefícios, controle de ponto, férias e apoio à folha.",
    deliverables: [
      "Cadastro",
      "Admissão",
      "Documentos",
      "Ponto",
      "Benefícios",
      "Férias",
      "Desligamentos",
      "Relatórios",
    ],
  },
  {
    id: "treinamento",
    number: "05",
    title: "Treinamento e Desenvolvimento",
    description:
      "Programas práticos para integração, atendimento, liderança, segurança comportamental e desenvolvimento profissional.",
    deliverables: [
      "Levantamento de necessidades",
      "Conteúdo personalizado",
      "Formação presencial ou online",
      "Materiais",
      "Avaliação",
      "Plano de continuidade",
    ],
  },
  {
    id: "consultoria",
    number: "06",
    title: "Consultoria de Gestão Humana",
    description:
      "Apoio para organizar políticas, papéis, avaliações, clima, comunicação e práticas de gestão.",
    deliverables: [
      "Diagnóstico",
      "Descrição de cargos",
      "Avaliação de desempenho",
      "Pesquisa de clima",
      "Plano de desenvolvimento",
      "Políticas internas",
    ],
  },
];

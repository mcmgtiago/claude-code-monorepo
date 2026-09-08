export interface Job {
  id: string;
  slug: string;
  title: string;
  company?: string;
  location: string;
  city?: string;
  state?: string;
  area: string;
  contract: string;
  modality: string;
  level: string;
  publishedAt: string;
  summary: string;
  description?: string;
  requirements?: string[];
  benefits?: string[];
  salaryMin?: number;
  salaryMax?: number;
  isConfidential?: boolean;
}

export const fallbackJobs: Job[] = [
  {
    id: "auxiliar-logistica-jundiai",
    slug: "auxiliar-logistica-jundiai",
    title: "Auxiliar de Logística",
    company: "Empresa confidencial",
    location: "Jundiaí, SP",
    city: "Jundiaí",
    state: "SP",
    area: "Logística",
    contract: "Temporário",
    modality: "Presencial",
    level: "Operacional",
    publishedAt: "2026-07-28",
    summary:
      "Atuação em recebimento, separação, conferência e organização de mercadorias.",
    description:
      "Procuramos auxiliar de logística com experiência em operações de armazém. Responsabilidades incluem recebimento de mercadorias, separação conforme documentação, conferência de quantidades e organização da área de armazenagem. Desejável experiência anterior em operações similares e disponibilidade para trabalhar em diferentes turnos.",
    requirements: [
      "Experiência anterior em logística",
      "Conhecimento de operações de armazém",
      "Disponibilidade para diferentes turnos",
      "Atenção a detalhes",
    ],
    benefits: ["Vale-transporte", "Vale-refeição", "Seguro de vida"],
    isConfidential: true,
  },
  {
    id: "analista-dp-campinas",
    slug: "analista-dp-campinas",
    title: "Analista de Departamento Pessoal",
    company: "Empresa confidencial",
    location: "Campinas, SP",
    city: "Campinas",
    state: "SP",
    area: "Recursos Humanos",
    contract: "CLT",
    modality: "Híbrido",
    level: "Pleno",
    publishedAt: "2026-07-27",
    summary:
      "Responsável por admissão, férias, ponto, benefícios e apoio ao fechamento da folha.",
    description:
      "Buscamos analista de departamento pessoal com experiência em rotinas de RH. Responsabilidades incluem gestão de admissões, controle de férias, ponto eletrônico, beneficiários e apoio direto ao processo de fechamento mensal. Conhecimento em legislação trabalhista e sistemas de DP é essencial.",
    requirements: [
      "Experiência em departamento pessoal",
      "Conhecimento de legislação trabalhista",
      "Domínio de sistemas de DP",
      "Organização e atenção a detalhes",
    ],
    benefits: ["Vale-transporte", "Vale-refeição", "Convênio médico", "Auxílio educação"],
    salaryMin: 2500,
    salaryMax: 3500,
  },
  {
    id: "supervisor-producao-sorocaba",
    slug: "supervisor-producao-sorocaba",
    title: "Supervisor de Produção",
    company: "Empresa confidencial",
    location: "Sorocaba, SP",
    city: "Sorocaba",
    state: "SP",
    area: "Indústria",
    contract: "CLT",
    modality: "Presencial",
    level: "Liderança",
    publishedAt: "2026-07-25",
    summary:
      "Gestão de equipe, indicadores, produtividade e cumprimento do plano de produção.",
    description:
      "Procuramos supervisor de produção experiente para liderar equipe em ambiente fabril. Responsabilidades incluem gestão de equipe, acompanhamento de indicadores de produtividade, cumprimento de metas, qualidade e segurança. Experiência com liderança e ambiente industrial é necessária.",
    requirements: [
      "Experiência em supervisão de produção",
      "Conhecimento de processos industriais",
      "Liderança de equipes",
      "Comunicação clara",
    ],
    benefits: [
      "Vale-transporte",
      "Vale-refeição",
      "Convênio médico",
      "Bônus por desempenho",
    ],
    salaryMin: 4000,
    salaryMax: 5500,
  },
  {
    id: "recepcionista-sao-paulo",
    slug: "recepcionista-sao-paulo",
    title: "Recepcionista",
    company: "Empresa confidencial",
    location: "São Paulo, SP",
    city: "São Paulo",
    state: "SP",
    area: "Atendimento",
    contract: "CLT",
    modality: "Presencial",
    level: "Assistente",
    publishedAt: "2026-07-24",
    summary:
      "Atendimento presencial e telefônico, controle de agenda e apoio administrativo.",
    description:
      "Buscamos recepcionista atenta e prestativa para atendimento de visitantes, telefone e agendamentos. Responsabilidades incluem recepção presencial, atendimento telefônico profissional, gestão de agenda, encaminhamento de chamados e apoio administrativo. Experiência anterior e boa comunicação são essenciais.",
    requirements: [
      "Experiência em recepção",
      "Boa comunicação",
      "Organização",
      "Cortesia e profissionalismo",
    ],
    benefits: ["Vale-transporte", "Vale-refeição"],
  },
  {
    id: "consultor-vendas-remoto",
    slug: "consultor-vendas-remoto",
    title: "Consultor de Vendas",
    company: "Empresa confidencial",
    location: "Remoto, Brasil",
    city: "Remoto",
    state: "",
    area: "Comercial",
    contract: "CLT",
    modality: "Remoto",
    level: "Pleno",
    publishedAt: "2026-07-23",
    summary:
      "Prospecção, relacionamento com clientes e acompanhamento de oportunidades comerciais.",
    description:
      "Procuramos consultor de vendas experiente para atuar em prospecção e fechamento de negócios. Responsabilidades incluem prospecção de clientes, apresentação de soluções, acompanhamento de oportunidades e fechamento de vendas. Experiência em vendas B2B e comissão por desempenho.",
    requirements: [
      "Experiência em vendas",
      "Prospeccção de clientes",
      "Comunicação comercial",
      "Meta e resultados",
    ],
    benefits: ["Salário + comissão", "Convênio médico", "Flexibilidade de horário"],
    salaryMin: 2000,
    salaryMax: 4000,
  },
  {
    id: "estagio-administracao-ribeirao",
    slug: "estagio-administracao-ribeirao",
    title: "Estágio em Administração",
    company: "Empresa confidencial",
    location: "Ribeirão Preto, SP",
    city: "Ribeirão Preto",
    state: "SP",
    area: "Administrativo",
    contract: "Estágio",
    modality: "Presencial",
    level: "Estágio",
    publishedAt: "2026-07-22",
    summary:
      "Apoio em documentos, planilhas, atendimento e rotinas administrativas.",
    description:
      "Buscamos estagiário em administração para apoiar rotinas administrativas em escritório. Responsabilidades incluem organização de documentos, preenchimento de planilhas, atendimento administrativo, apoio em processos e comunicação com departamentos. Estudante de administração, gestão ou similar.",
    requirements: [
      "Estudante de administração/gestão",
      "Conhecimento de Office",
      "Organização",
      "Comunicação clara",
    ],
    benefits: ["Bolsa-auxílio", "Vale-transporte", "Experiência prática"],
  },
];

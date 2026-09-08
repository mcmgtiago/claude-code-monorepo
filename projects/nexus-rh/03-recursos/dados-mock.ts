// =================================================================
// NEXUS — Dados Mock Centralizados
// Todos os textos em Português do Brasil
// =================================================================

export type Service = {
  id: string;
  number: string;
  title: string;
  shortTitle: string;
  description: string;
  outcomes: string[];
};

export type CaseStudy = {
  id: string;
  company: string;
  sector: string;
  people: string;
  challenge: string;
  intervention: string;
  outcome: string;
  metrics: Array<{
    label: string;
    before: number;
    after: number;
    suffix: string;
    direction: "up" | "down";
  }>;
};

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company: string;
};

export type Format = {
  id: string;
  number: string;
  badge: string;
  title: string;
  duration: string;
  description: string;
  deliverables: string[];
};

export type FAQ = {
  question: string;
  answer: string;
};

// =================================================================
// 1. SERVICES (FRENTES DE ATUAÇÃO)
// =================================================================

export const services: Service[] = [
  {
    id: "people-os",
    number: "01",
    title: "People OS",
    shortTitle: "People OS",
    description:
      "Diagnóstico e redesenho do sistema operacional de gente. Estrutura, papéis, rituais e accountability para empresas que precisam virar adultas sem perder a alma.",
    outcomes: [
      "Modelo operacional customizado",
      "Papéis e responsabilidades definidos",
      "Rituais de decisão claros",
      "Indicadores de gestão conectados ao negócio"
    ]
  },
  {
    id: "lideranca-escala",
    number: "02",
    title: "Liderança em Escala",
    shortTitle: "Liderança",
    description:
      "Programa para primeira e segunda linha de gestão. Critérios compartilhados, rituais de feedback, planos de sucessão — para que líderes tomem decisões melhores sem centralizar tudo em poucas pessoas.",
    outcomes: [
      "Mapa de competências críticas",
      "Jornadas para lideranças",
      "Plano de sucessão aplicável",
      "Rituais de feedback estruturados"
    ]
  },
  {
    id: "cultura-desenho",
    number: "03",
    title: "Cultura por Desenho",
    shortTitle: "Cultura",
    description:
      "Tradução de valores em comportamentos observáveis. Cultura não é uma série de eventos — é clareza que aparece todos os dias em mecanismos, rituais e práticas de gestão.",
    outcomes: [
      "Princípios comportamentais observáveis",
      "Ciclos de performance claros",
      "Rituais de alinhamento",
      "Práticas de gestão desenhadas"
    ]
  }
];

// =================================================================
// 2. CASES (RESULTADOS)
// =================================================================

export const cases: CaseStudy[] = [
  {
    id: "skala",
    company: "Skala",
    sector: "Fintech",
    people: "350 pessoas",
    challenge:
      "Crescimento acelerado sem reorganização. Líderes passaram a operar sem critérios compartilhados e a empresa perdia consistência nas decisões.",
    intervention:
      "Diagnóstico de maturidade, redesenho de rituais de liderança e implementação de sistema de performance com critérios claros.",
    outcome:
      "Em quatro meses, a organização reduziu ruídos de priorização e passou a operar com uma linguagem única de gestão.",
    metrics: [
      { label: "Tempo de decisão", before: 15, after: 8, suffix: " dias", direction: "down" },
      { label: "Clareza de prioridades", before: 42, after: 79, suffix: "%", direction: "up" },
      { label: "eNPS de lideranças", before: 31, after: 58, suffix: " pts", direction: "up" }
    ]
  },
  {
    id: "onda",
    company: "Onda",
    sector: "Healthtech",
    people: "620 pessoas",
    challenge:
      "Expansão para novas unidades criou práticas de liderança inconsistentes e aumentou a perda de talentos críticos em posições-chave.",
    intervention:
      "Mapeamento de posições-chave, programa de sucessão estruturado e formação de gestores de primeira linha com foco em clareza.",
    outcome:
      "A empresa criou uma cadência de sucessão mensurável e reduziu dependências individuais em áreas críticas em 12 semanas.",
    metrics: [
      { label: "Turnover voluntário", before: 21.4, after: 12.8, suffix: "%", direction: "down" },
      { label: "Sucessores mapeados", before: 12, after: 67, suffix: "", direction: "up" },
      { label: "Promoções internas", before: 18, after: 49, suffix: "%", direction: "up" }
    ]
  },
  {
    id: "vereda",
    company: "Vereda",
    sector: "Indústria",
    people: "1100 pessoas",
    challenge:
      "Crescimento pós-aquisição gerou sobrecarga de coordenadores e percepção desigual de cultura entre unidades e áreas geográficas.",
    intervention:
      "Escuta organizacional, redesenho de papéis gerenciais e implantação de rituais de comunicação para operação distribuída.",
    outcome:
      "A nova estrutura reduziu retrabalho entre áreas e aproximou a experiência dos times em diferentes unidades em 6 meses.",
    metrics: [
      { label: "Retrabalho entre áreas", before: 34, after: 19, suffix: "%", direction: "down" },
      { label: "Aderência aos rituais", before: 38, after: 82, suffix: "%", direction: "up" },
      { label: "Índice de confiança", before: 51, after: 76, suffix: "%", direction: "up" }
    ]
  }
];

// =================================================================
// 3. TESTIMONIALS (DEPOIMENTOS)
// =================================================================

export const testimonials: Testimonial[] = [
  {
    quote:
      "A NEXUS não trouxe um playbook pronto. Trouxe perguntas melhores, um método muito claro e a disciplina que faltava para transformar intenção em operação.",
    name: "Marina Salles",
    role: "Chief People Officer",
    company: "Skala"
  },
  {
    quote:
      "Pela primeira vez, nossas lideranças passaram a falar sobre performance, cultura e prioridade sem tratar cada tema como um projeto separado.",
    name: "Diego Mattos",
    role: "Diretor de Operações",
    company: "Onda"
  },
  {
    quote:
      "O trabalho foi profundo sem ser burocrático. Em poucas semanas, tínhamos um mapa que a diretoria conseguia usar para decidir.",
    name: "Renata Mello",
    role: "CEO",
    company: "Vereda"
  }
];

// =================================================================
// 4. FORMATS (FORMATOS DE PARCERIA)
// =================================================================

export const formats: Format[] = [
  {
    id: "diagnostico-express",
    number: "01",
    badge: "SPRINT",
    title: "Diagnóstico Express",
    duration: "3 semanas",
    description:
      "Para organizações que precisam enxergar o problema antes de escolher uma solução. Mapeamento executivo do cenário.",
    deliverables: [
      "Diagnóstico objetivo",
      "Mapa de tensões críticas",
      "Prioridades por impacto",
      "Reunião executiva de decisão"
    ]
  },
  {
    id: "projeto-estruturado",
    number: "02",
    badge: "PROGRAMA",
    title: "Projeto Estruturado",
    duration: "12 a 24 semanas",
    description:
      "Para empresas que precisam redesenhar liderança, cultura ou performance com acompanhamento de implantação real.",
    deliverables: [
      "Diagnóstico e estratégia",
      "Rituais e ferramentas desenhadas",
      "Desenvolvimento de líderes",
      "Indicadores de adoção"
    ]
  },
  {
    id: "advisory-mensal",
    number: "03",
    badge: "PARCERIA",
    title: "Advisory Mensal",
    duration: "Ciclo contínuo",
    description:
      "Para times executivos que querem uma consultoria próxima para decisões críticas de pessoas e organização.",
    deliverables: [
      "Conselho estratégico mensal",
      "Suporte a mudanças críticas",
      "Leitura recorrente de indicadores",
      "Ajustes de rota contínuos"
    ]
  }
];

// =================================================================
// 5. FAQ (PERGUNTAS FREQUENTES)
// =================================================================

export const faqs: FAQ[] = [
  {
    question: "Vocês trabalham apenas com grandes empresas?",
    answer:
      "Não. A NEXUS atua principalmente com empresas entre 200 e 2.000 pessoas, adaptando profundidade, cadência e entregáveis ao estágio de maturidade de cada organização."
  },
  {
    question: "Quanto tempo leva para aparecer um primeiro resultado?",
    answer:
      "Em sprints de diagnóstico, clareza e prioridades aparecem nas primeiras semanas. Em projetos estruturados, os primeiros ciclos de adoção costumam ser acompanhados dentro de 90 a 180 dias."
  },
  {
    question: "A NEXUS entrega apenas diagnóstico?",
    answer:
      "Não. Diagnóstico é ponto de partida. Podemos seguir com desenho de estratégia, implantação, desenvolvimento de liderança e acompanhamento de indicadores."
  },
  {
    question: "Vocês substituem o time interno de RH?",
    answer:
      "Não. Trabalhamos para ampliar a capacidade de decisão e execução do time interno, das lideranças e da diretoria — não para substituí-los."
  },
  {
    question: "Como funciona a primeira conversa?",
    answer:
      "Começamos entendendo momento, desafio, urgência e contexto da empresa. Se houver aderência, propomos um próximo passo proporcional ao problema, não uma proposta automática."
  },
  {
    question: "É possível contratar uma frente específica?",
    answer:
      "Sim. A atuação pode começar por People OS, Liderança em Escala ou Cultura por Desenho — conforme o que é mais urgente para o momento da empresa."
  }
];

// =================================================================
// 6. PROBLEMS (TENSÕES / DESALINHAMENTO)
// =================================================================

export const tensions = [
  {
    id: "decisoes-lentas",
    number: "01",
    title: "Decisões lentas",
    description: "Lideranças sem critérios compartilhados compensam incerteza com reuniões, retrabalho e aprovações demais. O que deveria ser simples vira complexo."
  },
  {
    id: "cultura-desigual",
    number: "02",
    title: "Cultura desigual",
    description: "Cada área cria seu próprio jeito de operar, comunicar e cobrar performance. Cultura forte não é uma série de eventos; é clareza que aparece todos os dias."
  },
  {
    id: "talento-desperdicado",
    number: "03",
    title: "Talento desperdiçado",
    description: "Pessoas boas saem ou ficam subutilizadas quando não enxergam clareza, desenvolvimento e contexto. É quando você perde quem mais gostaria de reter."
  }
];

// =================================================================
// 7. METHOD STEPS (ETAPAS DO MÉTODO)
// =================================================================

export const methodSteps = [
  {
    number: "01",
    name: "Mapear",
    duration: "Semanas 1-2",
    description: "Diagnóstico de maturidade e tensões críticas via escuta profunda, análise de dados e observação direta.",
    deliverable: "Mapa executivo de tensões prioritárias",
    icon: "ScanSearch"
  },
  {
    number: "02",
    name: "Direcionar",
    duration: "Semanas 3-4",
    description: "Definição de prioridades, princípios de gestão e plano de ação para os próximos 90-180 dias.",
    deliverable: "Plano estratégico de pessoas",
    icon: "Route"
  },
  {
    number: "03",
    name: "Implantar",
    duration: "Meses 2-4",
    description: "Implantação de rituais, ferramentas e desenvolvimento de líderes com acompanhamento próximo.",
    deliverable: "Sistema operacional de gente",
    icon: "Wrench"
  },
  {
    number: "04",
    name: "Consolidar",
    duration: "Contínuo",
    description: "Estabilização dos indicadores, governança dos rituais e ciclos de ajuste conforme a empresa evolui.",
    deliverable: "Sustentação da operação",
    icon: "ChartNoAxesCombined"
  }
];
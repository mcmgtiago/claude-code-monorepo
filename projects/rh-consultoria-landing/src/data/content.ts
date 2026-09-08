import type {
  BlogPost,
  CaseStudy,
  Differentiator,
  FAQItem,
  Metric,
  PricingPlan,
  ProblemCard,
  ProcessStep,
  Service,
  Testimonial,
} from "../types";

export const BRAND = {
  name: "Talento Estratégico",
  tagline: "Consultoria de RH",
  description:
    "Transformamos desafios de pessoas em resultados de negócio. Diagnóstico, liderança e implementação com ROI comprovado.",
  phone: "+55 11 4002-8922",
  email: "contato@talentoestrategico.com.br",
  address: "Av. Brigadeiro Faria Lima, 3477 — São Paulo, SP",
};

export const NAV_LINKS = [
  { label: "Sobre", href: "#sobre" },
  { label: "Serviços", href: "#solucoes" },
  { label: "Cases", href: "#cases" },
  { label: "Processo", href: "#processo" },
  { label: "Blog", href: "#blog" },
  { label: "Contato", href: "#contato" },
];

export const HERO_BADGES = [
  { label: "4.8/5", detail: "240+ clientes satisfeitos" },
  { label: "Top 3", detail: "RH Estratégico no Brasil" },
  { label: "98%", detail: "Taxa de implementação" },
];

export const SERVICES: Service[] = [
  {
    id: "diagnostico",
    title: "Diagnóstico Estratégico",
    description:
      "Mapeamento profundo de cultura, clima, competências e gaps. Entendemos sua realidade para propor soluções reais — não teoria.",
    icon: "Search",
    image:
      "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1200",
    href: "#solucoes",
    cta: "Conhecer método",
  },
  {
    id: "lideranca",
    title: "Desenvolvimento de Liderança",
    description:
      "Programas customizados de coaching, mentoria e treinamento. Formamos líderes que multiplicam conhecimento e engajam times.",
    icon: "Rocket",
    image:
      "https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=1200",
    href: "#solucoes",
    cta: "Ver programa",
  },
  {
    id: "implementacao",
    title: "Implementação & Suporte",
    description:
      "Não deixamos no papel. Acompanhamos cada passo da jornada até resultados mensuráveis e sustentáveis.",
    icon: "CheckCircle2",
    image:
      "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200",
    href: "#solucoes",
    cta: "Conversar conosco",
  },
];

export const PROBLEMS: ProblemCard[] = [
  {
    id: "rotatividade",
    icon: "TrendingDown",
    title: "Rotatividade Alta",
    description:
      "Perder talentos estratégicos custa até 200% do salário anual. Identificamos a raiz e implementamos planos de retenção que funcionam.",
  },
  {
    id: "alinhamento",
    icon: "Target",
    title: "Falta de Alinhamento Estratégico",
    description:
      "Equipes desconectadas do propósito. Criamos clareza através de OKRs, rituais e engajamento genuíno entre negócio e pessoas.",
  },
  {
    id: "lideranca",
    icon: "Lightbulb",
    title: "Ausência de Liderança Forte",
    description:
      "Líderes sem ferramentas perdem os melhores. Desenvolvemos competências que transformam gestores em multiplicadores de resultado.",
  },
];

export const DIFFERENTIATORS: Differentiator[] = [
  {
    id: "metodologia",
    icon: "GraduationCap",
    title: "Metodologia Própria",
    description:
      "Framework comprovado em 15 anos com +300 empresas. Não é template: é ciência aplicada ao seu contexto.",
  },
  {
    id: "time",
    icon: "Briefcase",
    title: "Time Experiente",
    description:
      "Consultores com vivência em grandes corporações e startups de alta performance. Falam a língua do seu negócio.",
  },
  {
    id: "roi",
    icon: "TrendingUp",
    title: "ROI Garantido",
    description:
      "Você só paga quando vê resultados. Toda entrega tem metas mensuráveis e dashboards de acompanhamento.",
  },
  {
    id: "parceria",
    icon: "Handshake",
    title: "Parceria Real",
    description:
      "Somos extensão do seu time — não uma agência distante. Atuamos lado a lado com sua liderança.",
  },
];

export const METRICS: Metric[] = [
  { label: "Empresas atendidas", value: "320", suffix: "+" },
  { label: "Profissionais impactados", value: "48.000", suffix: "+" },
  { label: "Anos de mercado", value: "15", suffix: "" },
  { label: "NPS de clientes", value: "78", suffix: "" },
];

export const CASES: CaseStudy[] = [
  {
    id: "techcorp",
    client: "TechCorp Brasil",
    industry: "Tecnologia",
    challenge: "Rotatividade 45%, clima organizacional 2.1/5",
    solution:
      "Programa de liderança + plano estruturado de retenção de talentos-chave",
    results: [
      "Rotatividade ↓ 65%",
      "Clima ↑ para 4.3/5",
      "Produtividade +34%",
    ],
    image:
      "https://images.pexels.com/photos/3182811/pexels-photo-3182811.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: "industria",
    client: "IndústriaXYZ",
    industry: "Indústria",
    challenge: "Falta de sucessão para cargos estratégicos e perda de know-how",
    solution:
      "Mapeamento de talentos + programa de mentoria reversa e sucessão",
    results: [
      "8 sucessores identificados",
      "Retenção de key talent +92%",
      "Cultura organizacional +28%",
    ],
    image:
      "https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: "startup",
    client: "StartUp Inovadora",
    industry: "SaaS B2B",
    challenge:
      "Crescimento de 20 para 150 pessoas em 12 meses sem estrutura de RH",
    solution:
      "Implementação de processos de gente, gestão de cultura e onboarding",
    results: [
      "Escalou de 20 → 150 pessoas",
      "Turnover -71%",
      "Employee NPS 8.7",
    ],
    image:
      "https://images.pexels.com/photos/1181605/pexels-photo-1181605.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
];

export const PROCESS: ProcessStep[] = [
  {
    number: "01",
    title: "Descoberta",
    duration: "Semana 1–2",
    description:
      "Imersão profunda no seu negócio para entender contexto, dores e oportunidades reais.",
    deliverables: [
      "Diagnóstico 360°",
      "Entrevistas com lideranças",
      "Análise de dados",
    ],
  },
  {
    number: "02",
    title: "Estratégia",
    duration: "Semana 3–4",
    description:
      "Proposta sob medida, com plano de implementação e metas claras, acordadas com seu time.",
    deliverables: [
      "Proposta customizada",
      "Plano de implementação",
      "Alinhamento de expectativas",
    ],
  },
  {
    number: "03",
    title: "Execução",
    duration: "Mês 2–4",
    description:
      "Workshops, treinamentos e suporte contínuo. Acompanhamos cada passo lado a lado.",
    deliverables: [
      "Workshops e treinamentos",
      "Suporte contínuo",
      "Ajustes em tempo real",
    ],
  },
  {
    number: "04",
    title: "Mensuração",
    duration: "Mês 5+",
    description:
      "Resultados comprovados, relatórios de impacto e plano de evolução para o próximo ciclo.",
    deliverables: [
      "Resultados comprovados",
      "Relatórios de impacto",
      "Roadmap de evolução",
    ],
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    quote:
      "Mudou completamente a forma como enxergamos nossas pessoas. O trabalho foi cirúrgico, objetivo e altamente profissional.",
    author: "Fernando Santos",
    role: "CEO",
    company: "TechCorp Brasil",
    avatar:
      "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400",
    rating: 5,
  },
  {
    id: "t2",
    quote:
      "Fizemos diagnóstico, desenvolvemos liderança e implementamos. Em 6 meses, os resultados foram inquestionáveis.",
    author: "Mariana Costa",
    role: "Diretora de Gente",
    company: "IndústriaXYZ",
    avatar:
      "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400",
    rating: 5,
  },
  {
    id: "t3",
    quote:
      "Profissionais que realmente entendem de negócio, não apenas de processos. Parceria genuína do início ao fim.",
    author: "Roberto Pereira",
    role: "Founder",
    company: "StartUp Inovadora",
    avatar:
      "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400",
    rating: 5,
  },
  {
    id: "t4",
    quote:
      "Consultoria que entrega além da expectativa. Recomendo para qualquer empresa que quer crescer com propósito.",
    author: "Juliana Mendes",
    role: "CHRO",
    company: "Multinacional",
    avatar:
      "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400",
    rating: 5,
  },
  {
    id: "t5",
    quote:
      "Transformação cultural real. Métricas provam: clima, produtividade, retenção. Tudo muda quando você investe certo.",
    author: "Carlos Oliveira",
    role: "Presidente",
    company: "Grupo Industrial",
    avatar:
      "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=400",
    rating: 5,
  },
];

export const PRICING: PricingPlan[] = [
  {
    id: "diagnostico-inicial",
    name: "Diagnóstico Inicial",
    description: "Para empresas que precisam de clareza estratégica.",
    price: 8500,
    period: "one-time",
    features: [
      "Análise completa (2–3 semanas)",
      "Mapeamento de cultura e clima",
      "Relatório estratégico detalhado",
      "Recomendações priorizadas",
      "Sessão de apresentação dos achados",
    ],
  },
  {
    id: "transformacao-90",
    name: "Transformação 90 Dias",
    description: "Implementação acompanhada com resultados mensuráveis.",
    price: 35000,
    period: "trimestral",
    features: [
      "Tudo do Diagnóstico Inicial",
      "Estratégia sob medida",
      "Implementação suportada",
      "Mentoria de liderança",
      "Relatórios mensais de impacto",
      "Suporte semanal dedicado",
    ],
    highlight: true,
    badge: "Mais escolhido",
  },
  {
    id: "parceria-anual",
    name: "Parceria Anual",
    description: "Evolução contínua para empresas em alto crescimento.",
    price: 120000,
    period: "anual",
    features: [
      "Tudo da Transformação 90 Dias",
      "Sessões contínuas quinzenais",
      "Suporte ilimitado por canais dedicados",
      "Rodadas de feedback trimestrais",
      "Workshops internos ilimitados",
      "Acesso a benchmarks do setor",
    ],
  },
];

export const FAQ: FAQItem[] = [
  {
    id: "tempo-resultados",
    question: "Quanto tempo até ver resultados?",
    answer:
      "Métricas iniciais aparecem em 30 dias (engajamento, clareza de plano). Transformação significativa consolida entre 90 e 180 dias, dependendo da profundidade do trabalho e do estágio da empresa.",
  },
  {
    id: "customizacao",
    question: "Como vocês conseguem customizar para nossa realidade?",
    answer:
      "Começamos com um diagnóstico profundo. Cada empresa é única — nossa metodologia é flexível e adaptável ao seu contexto, setor, porte e desafios específicos.",
  },
  {
    id: "porte",
    question: "Vocês trabalham com startups ou só com grandes empresas?",
    answer:
      "Trabalhamos com empresas de 20 a 5.000 pessoas. Adaptamos a abordagem ao tamanho, estágio de maturidade e momento de crescimento do negócio.",
  },
  {
    id: "diferencial",
    question: "Qual é o seu diferencial vs outras consultorias?",
    answer:
      "Resultados mensuráveis, parceria genuína, implementação real (não deixamos no papel) e ROI comprovado por +300 empresas atendidas em 15 anos.",
  },
  {
    id: "comecar",
    question: "Como começar uma conversa?",
    answer:
      "Basta clicar em 'Agendar Conversa' no topo do site. A primeira reunião é gratuita, sem compromisso — apenas um papo honesto sobre como podemos ajudar.",
  },
  {
    id: "garantia",
    question: "Vocês oferecem alguma garantia?",
    answer:
      "Sim. Em projetos de transformação, trabalhamos com metas contratuais. Se não atingirmos os indicadores acordados, devolvemos parte do investimento conforme cláusula de performance.",
  },
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "lideranca-reinventar",
    title: "5 Sinais de que sua liderança precisa se reinventar",
    excerpt:
      "Reconheça os sinais clássicos de líderes estagnados e saiba como destravar o próximo nível da sua gestão.",
    category: "Liderança",
    image:
      "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1200",
    readTime: "6 min",
    date: "12 jul 2026",
  },
  {
    id: "cultura-estrategia",
    title: "Cultura x Estratégia: por que ambas importam",
    excerpt:
      "O papel central das pessoas na execução estratégica e como alinhar crenças com objetivos de negócio.",
    category: "Cultura",
    image:
      "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1200",
    readTime: "8 min",
    date: "05 jul 2026",
  },
  {
    id: "roi-rh",
    title: "ROI em RH: como medir o impacto real",
    excerpt:
      "Metodologia prática para calcular o retorno de investimento em pessoas e justificar budget para a liderança.",
    category: "Métricas",
    image:
      "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1200",
    readTime: "10 min",
    date: "28 jun 2026",
  },
];

export const FOOTER_LINKS = {
  company: [
    { label: "Sobre nós", href: "#sobre" },
    { label: "Cases", href: "#cases" },
    { label: "Blog", href: "#blog" },
    { label: "Carreiras", href: "#" },
  ],
  services: [
    { label: "Diagnóstico Estratégico", href: "#solucoes" },
    { label: "Desenvolvimento de Liderança", href: "#solucoes" },
    { label: "Implementação & Suporte", href: "#solucoes" },
    { label: "Planos & Investimento", href: "#pricing" },
  ],
  resources: [
    { label: "E-book: Guia de RH Estratégico", href: "#contato" },
    { label: "Calculadora de ROI", href: "#contato" },
    { label: "Webinars gratuitos", href: "#blog" },
    { label: "FAQ", href: "#faq" },
  ],
  legal: [
    { label: "Política de Privacidade", href: "#" },
    { label: "Termos de Uso", href: "#" },
    { label: "LGPD", href: "#" },
  ],
};
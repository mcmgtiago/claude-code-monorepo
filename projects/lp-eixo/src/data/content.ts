export type Solution = { id: string; number: string; title: string; shortTitle: string; description: string; outcomes: string[]; image: string; alt: string };
export type CaseStudy = { id: string; company: string; sector: string; people: string; challenge: string; intervention: string; outcome: string; metrics: Array<{ label: string; before: number; after: number; suffix: string; direction: "up" | "down" }> };
export type Testimonial = { quote: string; name: string; role: string; company: string };

export const solutions: Solution[] = [
  { id: "strategy", number: "01", title: "Estratégia de Pessoas", shortTitle: "Estratégia", description: "Transformamos prioridades de negócio em uma arquitetura de pessoas que sustenta decisões, crescimento e execução.", outcomes: ["Modelo operacional de pessoas", "Prioridades por horizonte de impacto", "Indicadores conectados ao negócio"], image: "/assets/estrategia.jpg", alt: "Profissionais em uma conversa estratégica" },
  { id: "leadership", number: "02", title: "Liderança e Sucessão", shortTitle: "Liderança", description: "Criamos rituais, critérios e repertório para que líderes decidam melhor sem centralizar tudo em poucas pessoas.", outcomes: ["Mapa de competências críticas", "Jornadas para liderança", "Planos de sucessão aplicáveis"], image: "/assets/lideranca.jpg", alt: "Time em workshop de liderança" },
  { id: "culture", number: "03", title: "Cultura e Performance", shortTitle: "Cultura", description: "Traduzimos valores em comportamentos, processos e mecanismos que aparecem no dia a dia da operação.", outcomes: ["Princípios observáveis", "Ciclos de performance claros", "Rituais de alinhamento e feedback"], image: "/assets/cultura.jpg", alt: "Profissionais colaborando em uma mesa" },
  { id: "change", number: "04", title: "Mudança Organizacional", shortTitle: "Mudança", description: "Apoiamos reorganizações, novas lideranças e ciclos de expansão para que a mudança seja compreendida e praticada.", outcomes: ["Mapa de impacto da mudança", "Narrativa para lideranças", "Plano de comunicação e adoção"], image: "/assets/mudanca.jpg", alt: "Pessoa analisando anotações e planos" },
];

export const caseStudies: CaseStudy[] = [
  { id: "kairo", company: "Kairo", sector: "Software B2B", people: "280 pessoas", challenge: "A empresa duplicou de tamanho e líderes passaram a operar sem critérios comuns de decisão, desenvolvimento ou performance.", intervention: "Diagnóstico de maturidade, redesenho de rituais de liderança e implementação de sistema de performance.", outcome: "Em quatro meses, a organização reduziu ruídos de priorização e passou a operar com uma linguagem única de gestão.", metrics: [{ label: "Tempo de decisão", before: 18, after: 12, suffix: " dias", direction: "down" }, { label: "Clareza de prioridades", before: 49, after: 76, suffix: "%", direction: "up" }, { label: "eNPS de lideranças", before: 24, after: 51, suffix: " pts", direction: "up" }] },
  { id: "atlas", company: "Atlas", sector: "Indústria", people: "870 pessoas", challenge: "A expansão de unidades criou práticas de liderança inconsistentes e aumentou a perda de talentos críticos.", intervention: "Mapeamento de posições-chave, programa de sucessão e formação de gestores de primeira linha.", outcome: "A empresa criou uma cadência de sucessão mensurável e reduziu dependências individuais em áreas críticas.", metrics: [{ label: "Turnover voluntário", before: 18.7, after: 11.2, suffix: "%", direction: "down" }, { label: "Sucessores mapeados", before: 18, after: 64, suffix: "", direction: "up" }, { label: "Promoções internas", before: 21, after: 47, suffix: "%", direction: "up" }] },
  { id: "viva", company: "Viva", sector: "Saúde", people: "430 pessoas", challenge: "Crescimento rápido, sobrecarga de coordenadores e percepção desigual de cultura entre unidades.", intervention: "Escuta organizacional, redesenho de papéis e implantação de rituais para uma operação distribuída.", outcome: "A nova estrutura reduziu retrabalho entre áreas e aproximou a experiência dos times em diferentes unidades.", metrics: [{ label: "Retrabalho entre áreas", before: 31, after: 18, suffix: "%", direction: "down" }, { label: "Aderência aos rituais", before: 42, after: 81, suffix: "%", direction: "up" }, { label: "Índice de confiança", before: 58, after: 73, suffix: "%", direction: "up" }] },
];

export const testimonials: Testimonial[] = [
  { quote: "A EIXO trouxe perguntas melhores, um método claro e a disciplina para transformar intenção em operação.", name: "Marina Salles", role: "Chief People Officer", company: "Kairo" },
  { quote: "Nossas lideranças passaram a falar sobre performance, cultura e prioridade como partes do mesmo sistema.", name: "Diego Mattos", role: "Diretor de Operações", company: "Atlas" },
  { quote: "O trabalho foi profundo sem ser burocrático. Em semanas, tínhamos um mapa que a diretoria usava para decidir.", name: "Renata Mello", role: "CEO", company: "Viva" },
];

export const methods = [
  { number: "01", name: "Mapear", duration: "Semanas 1–2", delivery: "Diagnóstico de maturidade e tensões críticas" },
  { number: "02", name: "Direcionar", duration: "Semanas 3–4", delivery: "Prioridades, princípios e plano de ação" },
  { number: "03", name: "Implantar", duration: "Mês 2–4", delivery: "Rituais, ferramentas e desenvolvimento de líderes" },
  { number: "04", name: "Consolidar", duration: "Contínuo", delivery: "Indicadores, governança e ciclos de ajuste" },
];

export const faqs = [
  ["Vocês trabalham apenas com grandes empresas?", "Não. A EIXO atua principalmente com empresas entre 80 e 3.000 pessoas, adaptando profundidade e cadência ao estágio de maturidade."],
  ["Quanto tempo leva para aparecer um primeiro resultado?", "Em sprints, clareza e prioridades aparecem nas primeiras semanas. Em transformações estruturadas, acompanhamos os primeiros ciclos dentro de 90 dias."],
  ["A EIXO entrega apenas diagnóstico?", "Não. Diagnóstico é ponto de partida. Seguimos com estratégia, implantação, desenvolvimento de liderança e indicadores."],
  ["Vocês substituem o time interno de RH?", "Não. Trabalhamos para ampliar a capacidade de decisão do time interno, das lideranças e da diretoria."],
  ["Como funciona a primeira conversa?", "Entendemos momento, desafio, urgência e contexto. Se houver aderência, propomos um próximo passo proporcional ao problema."],
  ["É possível contratar uma frente específica?", "Sim. A atuação pode começar por estratégia, liderança, cultura, performance, sucessão ou mudança organizacional."],
];

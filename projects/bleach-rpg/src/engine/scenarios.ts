export interface Scenario {
  id: string; emoji: string; title: string; setup: string; mode: 'any' | 'adventure' | 'adult';
}

export const SCENARIOS: Scenario[] = [
  // AVENTURA
  { id: 'karakura_noite', emoji: '🌃', title: 'Karakura à Noite', mode: 'adventure', setup: 'Acorda numa rua vazia de Karakura, tarde da noite. Sente uma pressão espiritual estranha no ar. Um grito ecoa — algo está devorando uma alma perto dali. Um Hollow.' },
  { id: 'rukongai', emoji: '🏮', title: 'Rukongai', mode: 'adventure', setup: 'Materializa num distrito pobre do Rukongai, Soul Society. Barracos, fome, crianças descalças. Um shinigami patrulha ao longe. Você não deveria estar aqui.' },
  { id: 'hueco_deserto', emoji: '🏜️', title: 'Deserto de Hueco Mundo', mode: 'adventure', setup: 'Desperta no deserto branco eterno de Hueco Mundo. Lua crescente permanente. Árvores de quartzo. Rugidos de Hollows famintos ecoam. Você é presa ou predador?' },
  { id: 'seireitei_portao', emoji: '⛩️', title: 'Portões do Seireitei', mode: 'adventure', setup: 'Acorda diante dos portões brancos do Seireitei. Um guardião gigante ergue a lâmina. "Intruso! Identifique-se ou morra!"' },
  { id: 'escola', emoji: '🏫', title: 'Escola de Karakura', mode: 'adventure', setup: 'Materializa num telhado de escola. Alunos lá embaixo. Você vê correntes saindo do próprio peito — ou é um espírito, ou algo está muito errado.' },
  { id: 'las_noches', emoji: '🏛️', title: 'Las Noches', mode: 'adventure', setup: 'Acorda num corredor infinito de mármore branco — Las Noches, fortaleza de Aizen. Passos ecoam. Um Arrancar dobra a esquina e te encara.' },
  { id: 'cemiterio', emoji: '⚰️', title: 'Cemitério', mode: 'adventure', setup: 'Desperta num cemitério enevoado. Almas perdidas (plus) vagam ao redor, confusas. Uma corrente de destino pende do seu peito. O que você é agora?' },
  { id: 'floresta_menos', emoji: '🌲', title: 'Floresta dos Menos', mode: 'adventure', setup: 'Acorda na Floresta dos Menos, sob as areias de Hueco Mundo. Escuridão. Gillians gigantes caminham entre as árvores de cristal. Você precisa não ser notado.' },
  { id: 'divisao_12', emoji: '🧪', title: 'Laboratório da 12ª', mode: 'adventure', setup: 'Materializa amarrado numa mesa do laboratório de Mayuri Kurotsuchi, 12ª Divisão. Instrumentos afiados. Uma voz curiosa: "Fascinante... de onde você veio?"' },
  { id: 'urahara', emoji: '🏪', title: 'Loja do Urahara', mode: 'adventure', setup: 'Acorda no chão da Urahara Shop. Kisuke Urahara te observa por trás do leque, chapéu listrado: "Ora, ora... você não é daqui, é?"' },

  // +18
  { id: 'quarto_shinigami', emoji: '🛏️', title: 'Quarto no Seireitei', mode: 'adult', setup: 'Acorda nu num quarto do Seireitei. Uma shinigami tenente (Rangiku-style) está ao seu lado, seios fartos mal cobertos, sorrindo: "Você foi... intenso ontem."' },
  { id: 'arrancar_sedutora', emoji: '💋', title: 'Arrancar Sedutora', mode: 'adult', setup: 'Materializa nos aposentos de uma Espada feminina em Las Noches. Ela te prende contra a parede com o reiatsu: "Um humano perdido... vou me divertir com você."' },
  { id: 'onsen', emoji: '♨️', title: 'Banho Termal', mode: 'adult', setup: 'Desperta num onsen escondido. Vapor quente. Yoruichi (ou uma shinigami) está na água, nua, felina: "Demorou pra acordar. Entra logo."' },
  { id: 'capturado_hollow', emoji: '🕸️', title: 'Presa de uma Arrancar', mode: 'adult', setup: 'Acorda preso por fios de reiatsu numa masmorra de Las Noches. Uma Arrancar dominadora circula você, lambendo os lábios: "Meu novo brinquedo acordou."' },
  { id: 'humana_karakura', emoji: '🌸', title: 'Colega de Karakura', mode: 'adult', setup: 'Materializa no quarto de uma estudante de Karakura que consegue te ver. Ela cora, tranca a porta: "Você... apareceu do nada. E está sem roupa."' },
];

export function getRandomScenarios(mode: 'adventure' | 'adult', count = 5): Scenario[] {
  const pool = SCENARIOS.filter(s => s.mode === mode || s.mode === 'any');
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count);
}

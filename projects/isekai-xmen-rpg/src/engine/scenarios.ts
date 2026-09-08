// Cenários de início variados. O jogador escolhe entre 5 opções aleatórias,
// ou deixa a IA gerar. Cada cenário define local, situação e gancho.

export interface Scenario {
  id: string;
  emoji: string;
  title: string;
  setup: string; // instrução detalhada pro Mestre
  mode: 'any' | 'adventure' | 'adult';
}

export const SCENARIOS: Scenario[] = [
  // === AVENTURA / NEUTRO ===
  { id: 'beco_madripoor', emoji: '🌃', title: 'Beco de Madripoor', mode: 'adventure',
    setup: 'Acorda num beco imundo de Lowtown, Madripoor. Chuva, neon, cheiro de lixo e fritura. Ao longe, gritos de uma briga de gangue. Um mutante fugitivo passa correndo. Perigo iminente.' },
  { id: 'metro_ny', emoji: '🚇', title: 'Metrô de NY', mode: 'adventure',
    setup: 'Materializa numa estação de metrô abandonada de Nova York. Luzes piscando, grafite mutante nas paredes. Sons de algo se arrastando nos túneis. Os Morlocks vivem aqui.' },
  { id: 'sentinela_ativa', emoji: '🤖', title: 'Zona de Guerra', mode: 'adventure',
    setup: 'Acorda no meio de escombros — um bairro destruído por Sentinelas. Uma Sentinela gigante ainda patrulha ao longe, escaneando por mutantes. Sirenes. Você precisa se esconder JÁ.' },
  { id: 'floresta_savage', emoji: '🦖', title: 'Savage Land', mode: 'adventure',
    setup: 'Desperta numa selva pré-histórica quente e úmida. Dinossauros rugem ao longe. Savage Land, Antártica. Uma tribo primitiva te observa das árvores.' },
  { id: 'laboratorio', emoji: '🧪', title: 'Laboratório Weapon X', mode: 'adventure',
    setup: 'Acorda amarrado numa maca de laboratório abandonado do programa Weapon X. Tubos, sangue seco, uma janela quebrada. Alarmes desligados. Como você chegou aqui?' },
  { id: 'trem_bala', emoji: '🚄', title: 'Trem em Movimento', mode: 'adventure',
    setup: 'Materializa dentro de um vagão de trem-bala em movimento. Passageiros humanos te olham assustados — você apareceu do nada. Um guarda anti-mutante caminha na sua direção.' },
  { id: 'mansao_xavier', emoji: '🏫', title: 'Portões da Mansão', mode: 'adventure',
    setup: 'Acorda na grama molhada em frente aos portões da Mansão Xavier, Westchester. É noite. As luzes da escola brilham ao longe. Um sistema de segurança acabou de te detectar.' },
  { id: 'arena_luta', emoji: '🥊', title: 'Arena Clandestina', mode: 'adventure',
    setup: 'Desperta numa jaula de uma arena de luta clandestina de mutantes em Madripoor. Multidão gritando por sangue. Uma voz anuncia: "Próximo combate!" — e apontam pra você.' },
  { id: 'esgoto_morlock', emoji: '🕳️', title: 'Esgotos', mode: 'adventure',
    setup: 'Acorda no escuro, água fria até os joelhos. Esgotos de NY. Olhos brilham na escuridão — Morlocks, mutantes desfigurados. Callisto avança: "Território errado, bonito."' },
  { id: 'genosha', emoji: '⛓️', title: 'Genosha', mode: 'adventure',
    setup: 'Materializa numa praia de cinzas de Genosha, a ilha-nação mutante devastada. Ruínas ao redor. Um sobrevivente ferido rasteja em sua direção pedindo ajuda.' },

  // === +18 ===
  { id: 'cama_estranha', emoji: '🛏️', title: 'Cama de Alguém', mode: 'adult',
    setup: 'Acorda nu numa cama macia, lençóis de seda. Uma mutante linda está deitada ao seu lado, a mão dela deslizando pelo seu peito. "Finalmente acordou, gostoso", ela sussurra.' },
  { id: 'clube_bdsm', emoji: '⛓️', title: 'Clube Underground', mode: 'adult',
    setup: 'Materializa num clube BDSM subterrâneo de mutantes. Luz vermelha, correntes, gemidos ao fundo. Uma dominadora de latex te vê aparecer e sorri: "Carne fresca."' },
  { id: 'bordel_madripoor', emoji: '💋', title: 'Bordel de Madripoor', mode: 'adult',
    setup: 'Acorda num quarto de bordel de luxo em Hightown. Uma cortesã mutante te encontrou desmaiado e te trouxe. Ela se aproxima, seminua: "Você me deve pelo quarto, docinho."' },
  { id: 'vestiario', emoji: '🚿', title: 'Vestiário da Mansão', mode: 'adult',
    setup: 'Materializa no vestiário da Mansão Xavier. Vapor no ar. Alguém está no chuveiro, de costas, e não percebeu você ainda. A porta trancada por dentro.' },
  { id: 'capturado', emoji: '🔗', title: 'Prisioneiro', mode: 'adult',
    setup: 'Acorda amarrado a uma cadeira, sem camisa. Uma vilã mutante circula ao seu redor, passando uma faca fria pela sua pele. "Vamos nos divertir antes de eu te matar. Ou não te matar."' },
];

/** Retorna N cenários aleatórios do modo especificado */
export function getRandomScenarios(mode: 'adventure' | 'adult', count = 5): Scenario[] {
  const pool = SCENARIOS.filter(s => s.mode === mode || s.mode === 'any');
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

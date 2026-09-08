export interface Scenario {
  id: string; emoji: string; title: string; setup: string; mode: 'any' | 'adventure' | 'adult';
}

export const SCENARIOS: Scenario[] = [
  // AVENTURA
  { id: 'porto_real_rua', emoji: '🏰', title: 'Rua de Porto Real', mode: 'adventure', setup: 'Acorda numa ruela fedida de Flea Bottom, Porto Real. Cheiro de esgoto e pão queimando. Guardas do rei passam ao longe. Alguém te roubou enquanto dormia.' },
  { id: 'estrada_reis', emoji: '🛤️', title: 'Estrada do Rei', mode: 'adventure', setup: 'Materializa na Estrada do Rei, entre florestas. Um grupo de soldados Lannister se aproxima, pedindo documentos de passagem.' },
  { id: 'muralha', emoji: '🧊', title: 'A Muralha', mode: 'adventure', setup: 'Acorda congelando na base da Muralha, Castelo Negro. Neve pesada. Um patrulheiro da Guarda da Noite te encontra: "Outro desertor?"' },
  { id: 'navio', emoji: '⛵', title: 'Navio em Essos', mode: 'adventure', setup: 'Desperta num porão de navio rumo a Braavos. Correntes nos pulsos. Você foi vendido como escravo — ou alguém acha que foi.' },
  { id: 'torneio', emoji: '🏇', title: 'Torneio', mode: 'adventure', setup: 'Acorda nos campos de um torneio de cavalaria. Tendas coloridas, cavalos, lordes bebendo. Alguém grita seu nome — esperam que você lute.' },
  { id: 'floresta_lobos', emoji: '🐺', title: 'Floresta dos Lobos', mode: 'adventure', setup: 'Materializa numa floresta densa do Norte. Frio cortante. Lobos uivam por perto. Galhos quebram — algo grande se move entre as árvores.' },
  { id: 'calabouco', emoji: '⛓️', title: 'Calabouço', mode: 'adventure', setup: 'Acorda acorrentado num calabouço úmido. Escuridão total. Ratos. Uma voz sussurra da cela ao lado: "Também te pegaram?"' },
  { id: 'dorne', emoji: '☀️', title: 'Dorne', mode: 'adventure', setup: 'Desperta num oásis em Dorne, sol escaldante. Uma caravana de comerciantes observa você com desconfiança. Estão armados.' },
  { id: 'pyke', emoji: '🌊', title: 'Ilhas de Ferro', mode: 'adventure', setup: 'Acorda vomitando água salgada numa praia rochosa de Pyke. Homens de Ferro te cercam: "O mar devolveu um afogado."' },
  { id: 'taverna', emoji: '🍺', title: 'Taverna na Encruzilhada', mode: 'adventure', setup: 'Materializa sentado numa taverna movimentada. Cerveja na frente. Não lembra como chegou. Uma mulher te observa do canto — adaga na cintura.' },

  // +18
  { id: 'bordel_pr', emoji: '💋', title: 'Bordel de Porto Real', mode: 'adult', setup: 'Acorda num quarto luxuoso do bordel de Mindinho. Cortinas de seda. Uma prostituta loira te acorda passando os dedos no peito: "Pagou a noite inteira, meu senhor..."' },
  { id: 'tenda_dorne', emoji: '🌙', title: 'Tenda em Dorne', mode: 'adult', setup: 'Desperta nu numa tenda de seda em Dorne. Uma Martell (ou amante de um) está ao seu lado, pele bronzeada, nua, sorrindo. "Dorneses não dormem sozinhos."' },
  { id: 'banho_castel', emoji: '🛁', title: 'Banhos de Harrenhal', mode: 'adult', setup: 'Materializa nos banhos quentes de Harrenhal. Vapor. Uma mulher guerreira está na água, de costas. Vira e te vê. Não se cobre.' },
  { id: 'cela_vilã', emoji: '⛓️', title: 'Prisioneiro de uma Rainha', mode: 'adult', setup: 'Acorda amarrado numa cama com lençóis de seda. Cersei (ou uma lorde) te observa com um cálice de vinho: "Tenho planos pra você."' },
  { id: 'selvagem', emoji: '🔥', title: 'Acampamento Selvagem', mode: 'adult', setup: 'Desperta perto de uma fogueira além da Muralha. Uma selvagem ruiva te aqueceu a noite toda — e quer continuar aquecendo.' },
];

export function getRandomScenarios(mode: 'adventure' | 'adult', count = 5): Scenario[] {
  const pool = SCENARIOS.filter(s => s.mode === mode || s.mode === 'any');
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count);
}

export interface Scenario {
  id: string; emoji: string; title: string; setup: string; mode: 'any' | 'adventure' | 'adult';
}

export const SCENARIOS: Scenario[] = [
  // AVENTURA / ROMANCE
  { id: 'baile_rainha', emoji: '💃', title: 'Baile da Rainha', mode: 'adventure', setup: 'A temporada social de 1813 começa. Você está no grande baile da Rainha Charlotte, rodeada de pretendentes, mães ambiciosas e olhares avaliadores. A rainha procura o Diamante da Temporada.' },
  { id: 'jardim_secreto', emoji: '🌹', title: 'Jardim Secreto', mode: 'adventure', setup: 'Encontrada sozinha no jardim dos Bridgerton durante uma festa. Não deveria estar aqui sem acompanhante. Passos se aproximam — alguém te seguiu.' },
  { id: 'carruagem', emoji: '🐴', title: 'Carruagem Quebrada', mode: 'adventure', setup: 'Sua carruagem quebrou numa estrada rural. Chuva começa. Um visconde a cavalo se aproxima: "Posso oferecer ajuda, my lady?" Vocês estão sozinhos.' },
  { id: 'livraria', emoji: '📚', title: 'Livraria Proibida', mode: 'adventure', setup: 'Flagrada comprando romances eróticos na livraria escondida de Mayfair. Um duque te reconhece — e sorri: "Também aprecio... ficção."' },
  { id: 'opera', emoji: '🎭', title: 'Ópera', mode: 'adventure', setup: 'No camarote da ópera, alguém se senta ao seu lado sem ser convidado. Uma mão toca a sua no escuro. Quando a luz volta, é alguém que não deveria estar ali.' },
  { id: 'passeio_parque', emoji: '🌳', title: 'Passeio em Hyde Park', mode: 'adventure', setup: 'Passeio matinal em Hyde Park. Toda a alta sociedade presente. Um pretendente indesejado se aproxima — mas outro, mais interessante, intercepta.' },
  { id: 'modista', emoji: '👗', title: 'Na Modista', mode: 'adventure', setup: 'Experimentando vestidos na modista mais famosa de Londres. Pela janela, nota alguém te observando da rua — com interesse demais pra ser coincidência.' },
  { id: 'whistledown', emoji: '📰', title: 'Lady Whistledown Publica', mode: 'adventure', setup: 'Acordo com a cidade inteira falando sobre você. Lady Whistledown publicou algo — bom ou terrível. Seu nome está na boca de todos.' },
  { id: 'proposta', emoji: '💍', title: 'Proposta Inesperada', mode: 'adventure', setup: 'Um lorde que mal conhece aparece na sua casa com um anel e uma proposta. Sua mãe está radiante. Você... não sabe o que sente.' },
  { id: 'duelo', emoji: '⚔️', title: 'Duelo ao Amanhecer', mode: 'adventure', setup: 'Alguém desafiou alguém por sua honra. Duelo ao amanhecer em Primrose Hill. Você pode impedir, assistir, ou fugir com um dos envolvidos.' },

  // +18
  { id: 'closet', emoji: '🚪', title: 'Closet Durante o Baile', mode: 'adult', setup: 'Puxada pra um closet escuro durante o baile. Mãos fortes na sua cintura. Lábios no pescoço. "Não consegui esperar mais", sussurra ele. Música abafada do outro lado da porta.' },
  { id: 'biblioteca_noite', emoji: '📖', title: 'Biblioteca à Meia-Noite', mode: 'adult', setup: 'Sozinha na biblioteca, buscando um livro proibido. Ele aparece. Tranca a porta. "Ninguém vem aqui a essa hora." As mãos dele sobem pela sua saia.' },
  { id: 'lago', emoji: '💧', title: 'Lago da Propriedade', mode: 'adult', setup: 'Nadando sozinha no lago privado da propriedade, nua sob o luar. Galhos quebram na margem. Ele está ali, te assistindo. Não foge quando seus olhos se encontram.' },
  { id: 'honeymoon', emoji: '🛏️', title: 'Noite de Núpcias', mode: 'adult', setup: 'Noite de casamento. O quarto nupcial. Velas, flores, nervosismo. Seu marido/esposa te espera na cama. As mãos dele tremem quando toca seu rosto pela primeira vez sem luvas.' },
  { id: 'caso_secreto', emoji: '🌙', title: 'Caso Secreto', mode: 'adult', setup: 'Meia-noite. Entrada dos fundos da mansão de alguém que não deveria estar visitando. A porta se abre. Ele te puxa pra dentro. "Se nos pegarem, estarei arruinada." "Eu sei", ele diz, e te beija.' },
];

export function getRandomScenarios(mode: 'adventure' | 'adult', count = 5): Scenario[] {
  const pool = SCENARIOS.filter(s => s.mode === mode || s.mode === 'any');
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count);
}

import type { Universe } from '../types';
import { BRIDGERTON_LORE } from './lore';
import { BRIDGERTON_NPCS } from './npcs';
import { BRIDGERTON_NPCS_MINOR } from './npcs-minor';
import { BRIDGERTON_NPC_TABLES } from './npc-tables';

export const BRIDGERTON: Universe = {
  id: 'bridgerton',
  name: 'Bridgerton',
  tagline: 'Escândalo é poder',
  emoji: '🌹',
  theme: { accent: 'rose', accentHex: '#f43f5e' },
  powerLabel: 'Virtudes',
  hasPowerGenerator: false,
  attributes: [
    { key: 'elegancia', label: 'Elegância', short: 'ELG' },
    { key: 'beleza', label: 'Beleza', short: 'BEL' },
    { key: 'astucia', label: 'Astúcia', short: 'AST' },
    { key: 'carisma', label: 'Carisma', short: 'CAR' },
    { key: 'seducao', label: 'Sedução', short: 'SED' },
    { key: 'vontade', label: 'Vontade', short: 'VON' },
    { key: 'conhecimento', label: 'Conhecimento', short: 'CON' },
    { key: 'coragem', label: 'Coragem', short: 'COR' },
  ],
  tiers: [
    { key: 'novato', label: 'Serva', desc: 'Sem status', budget: 22, startLevel: 1 },
    { key: 'veterano', label: 'Gentry', desc: 'Pequena nobreza', budget: 34, startLevel: 5 },
    { key: 'elite', label: 'Viscondessa', desc: 'Alta nobreza', budget: 48, startLevel: 12 },
    { key: 'omega', label: 'Duquesa', desc: 'Topo da sociedade', budget: 80, startLevel: 25 },
  ],
  powerTypes: [
    { key: 'socialite', label: 'Socialite', desc: 'Vive de bailes, intrigas e reputação.' },
    { key: 'rebelde', label: 'Rebelde', desc: 'Desafia normas, vive escândalos.' },
  ],
  skills: [
    // Tier 1
    { name: 'Olhar que Derrete', tree: 'seducao', tier: 1, description: '+1 sedução. Sabe como usar os olhos.', bonusAttribute: 'seducao', bonusAmount: 1 },
    { name: 'Dança Perfeita', tree: 'sociedade', tier: 1, description: '+1 elegância. Graça natural em cada passo.', bonusAttribute: 'elegancia', bonusAmount: 1 },
    { name: 'Fofoqueira', tree: 'intriga', tier: 1, description: '+1 astúcia. Ouve sussurros, colhe informações.', bonusAttribute: 'astucia', bonusAmount: 1 },
    { name: 'Conversa Afiada', tree: 'intriga', tier: 1, description: '+1 carisma. Sempre tem resposta pronta.', bonusAttribute: 'carisma', bonusAmount: 1 },
    { name: 'Leitura de Corpos', tree: 'astúcia', tier: 1, description: '+1 conhecimento. Sabe ler sinais silenciosos.', bonusAttribute: 'conhecimento', bonusAmount: 1 },
    // Tier 2
    { name: 'Manipuladora Elegante', tree: 'intriga', tier: 2, description: '+2 astúcia. Consegue o que quer sem parecer suspeita.', bonusAttribute: 'astucia', bonusAmount: 2 },
    { name: 'Beleza Letal', tree: 'seducao', tier: 2, description: '+2 beleza. Quando entra numa sala, tudo para.', bonusAttribute: 'beleza', bonusAmount: 2 },
    { name: 'Escrita Anônima', tree: 'conhecimento', tier: 2, description: '+2 conhecimento. Escreve cartas que mudam vidas (ou destroem).', bonusAttribute: 'conhecimento', bonusAmount: 2 },
    { name: 'Acesso VIP', tree: 'sociedade', tier: 2, description: '+2 carisma. Convites chegam pra você antes de outros.', bonusAttribute: 'carisma', bonusAmount: 2 },
    // Tier 3
    { name: 'Amante Irresistível', tree: 'seducao', tier: 3, description: '+3 sedução. Ninguém resiste.', bonusAttribute: 'seducao', bonusAmount: 3 },
    { name: 'Diamante da Temporada', tree: 'sociedade', tier: 3, description: '+3 carisma + bônus de reputação automático.', bonusAttribute: 'carisma', bonusAmount: 3 },
    { name: 'Mestra de Escândalos', tree: 'intriga', tier: 3, description: '+3 astúcia. Controla narrativa. Rumores obedecem você.', bonusAttribute: 'astucia', bonusAmount: 3 },
    { name: 'Dama de Ferro', tree: 'coragem', tier: 3, description: '+3 coragem. Enfrentar a sociedade não assusta mais.', bonusAttribute: 'coragem', bonusAmount: 3 },
    // Tier 4+
    { name: 'Lady Whistledown', tree: 'poder', tier: 4, description: '+5 astúcia + controle total de narrativa. A sociedade inteira te teme e adora.', bonusAttribute: 'astucia', bonusAmount: 5 },
  ],
  scenarios: [
    // Início aventura
    { id: 'baile', emoji: '💃', title: 'Baile da Rainha', mode: 'adventure', setup: 'Materializa no grande baile da temporada. Todos olham — um estranho desconhecido apareceu. A rainha ergue a sobrancelha. Sussurros ao seu redor.' },
    { id: 'jardim', emoji: '🌹', title: 'Jardim dos Bridgerton', mode: 'adventure', setup: 'Acorda num jardim privado durante uma festa. Não deveria estar aqui sem convite. Passos se aproximam.' },
    { id: 'modista', emoji: '👗', title: 'Na Modista de Madame Delacroix', mode: 'adventure', setup: 'Aparece na modista mais famosa de Londres com roupas impossíveis. Todos olham horrorizados e fascinados. Madame D levanta uma sobrancelha.' },
    { id: 'parque', emoji: '🌳', title: 'Hyde Park — Hora do Passeio', mode: 'adventure', setup: 'Materializa em Hyde Park durante o passeio matinal da alta sociedade. Sem roupa adequada. Sussurros. Uma Senhora oferece seu braço — "Vamos ser discretos".' },
    { id: 'carruagem', emoji: '🐴', title: 'Carruagem Quebrada na Estrada', mode: 'adventure', setup: 'Acorda numa estrada escura. Uma carruagem nobre parou — uma mulher aristocrata te olha da janela: "Você precisa de ajuda, ou é um bandido?"' },
    { id: 'almacks', emoji: '✨', title: 'Almack\'s Assembly Rooms', mode: 'adventure', setup: 'Você conseguiu um convite para Almack\'s (milagre). Entra numa sala de aristocratas puros. Todas as valsas estão reservadas. Uma mulher te observa de longe.' },
    { id: 'whistledown', emoji: '📰', title: 'Panfleto de Lady Whistledown', mode: 'adventure', setup: 'O novo panfleto chega. E está sobre VOCÊ. Roubo, escândalo, sedução — tudo inventado? Ou verdade? A sociedade já acredita. Você tem 24h pra responder.' },
    { id: 'duelo', emoji: '⚔️', title: 'Desafio de Honra', mode: 'adventure', setup: 'Um conde a desafia por questão de honra. Você não pode recusar. Amanhecer. Pistolas ou espadas? Alguém está torcendo pra você cair.' },
    // Meio jogo
    { id: 'conspiracy', emoji: '👁️', title: 'Conspiração Política', mode: 'adventure', setup: 'Um homem misterioso te encontra. "Seu ser isenção. A rainha planejou isto. Preciso de uma aliada dentro do palácio." Ele conhece teu segredo. Você concorda?' },
    { id: 'rival', emoji: '💢', title: 'Confronto com Rival Social', mode: 'adventure', setup: 'Sua rival de temporada (Cressida?) te encontra em Almack\'s. Ambas querem o mesmo homem. Ambas têm segredos. Quem fala primeiro?' },
    { id: 'noite_intima', emoji: '🕯️', title: 'Convite Privado', mode: 'adventure', setup: 'Você recebe um bilhete bordado: "Minha casa, meia-noite. Sozinha. Sequer diga a seus criados." A letra é elegante. Você não sabe quem é. Vai?' },
    // Fim de jogo
    { id: 'proposta', emoji: '💍', title: 'Proposta de Casamento', mode: 'adventure', setup: 'Ele se ajoelha. Pedindo em casamento. Público. À luz de velas. Toda sociedade observando. Ele é nobre. Você é ninguém. Diz sim e muda de vida. Diz não e vira pária.' },
    { id: 'rainha', emoji: '👑', title: 'Audiência com a Rainha', mode: 'adventure', setup: 'Convocada ao palácio. A Rainha Charlotte quer falar. Você. Sozinha. Ela sabe algo sobre você. Seus olhos te vasculham.' },
    // Adult
    { id: 'closet', emoji: '🚪', title: 'Closet Durante Baile', mode: 'adult', setup: 'Puxado pra um closet escuro. Mãos quentes, perfume caro. "Não consegui esperar", sussurra alguém que você nem viu o rosto. A música continua lá fora.' },
    { id: 'biblioteca', emoji: '📖', title: 'Biblioteca à Meia-Noite', mode: 'adult', setup: 'Sozinho na biblioteca buscando algo secreto. Ele/ela aparece de repente, tranca a porta. "Ninguém vem aqui a essa hora... sabemos o que queremos."' },
    { id: 'lago', emoji: '💧', title: 'Lago da Propriedade', mode: 'adult', setup: 'Nadando nu no lago privado sob o luar. Frio, liberdade. Galhos quebram. Alguém está ali, te assistindo. Não foge. Sorri.' },
    { id: 'quarto', emoji: '🛏️', title: 'Quarto Proibido', mode: 'adult', setup: 'Ele a puxa pra seu quarto durante a festa. Risco total. Se descobrirem, casamento ou morte social. Ele fecha a porta. "Uma hora. Ninguém saberá."' },
    { id: 'escondida', emoji: '🤫', title: 'Segredo de Dormir Juntas', mode: 'adult', setup: 'Duas mulheres da corte vão "dormir" juntas. Chapelonas compradas. Outras criadas dormem fundo. Duas horas. Risco máximo. Recompensa máxima.' },
    // Inícios clássicos de isekai
    { id: 'iso_caminhao', emoji: '🚚', title: 'Morte e Renascimento', mode: 'adventure', setup: 'A última coisa que lembra é o farol de um carro no seu mundo. Depois, escuridão. Agora acorda numa cama de dossel de uma mansão de Mayfair, roupas de época, vivo. Uma criada arqueja: "Milorde/Milady acordou! O médico disse que era a febre. A temporada começa em uma semana."' },
    { id: 'iso_ritual', emoji: '🔮', title: 'Trazido por um Médium', mode: 'adventure', setup: 'Uma sessão espírita da alta sociedade deu terrivelmente errado — e você foi PUXADO do seu mundo para 1813. Damas de véu recuam horrorizadas. Uma delas sussurra: "Os espíritos trouxeram um estranho... de vestes impossíveis. Quem é você, criatura?"' },
    { id: 'iso_portal_jogo', emoji: '🎮', title: 'Sugado pela Tela', mode: 'adventure', setup: 'Você assistia/lia sobre este mundo de romance regencial. A tela brilhou branco — e agora está DENTRO dele, num baile lotado. Você conhece os pares, os escândalos, quem se casa com quem. Mas a Rainha ergue a sobrancelha na sua direção, e Lady Whistledown já pegou a pena.' },
    { id: 'iso_bebe_memoria', emoji: '👶', title: 'Renascido com Memórias', mode: 'adventure', setup: 'Você reencarnou nesta época anos atrás, filho(a) de uma família nobre, mas guardou as memórias da vida moderna. Hoje, na sua primeira temporada social, você joga o jogo do casamento com conhecimento que ninguém mais tem — e ideias perigosamente à frente do seu tempo.' },
    { id: 'iso_sonho', emoji: '💤', title: 'Acordou em Outra Era', mode: 'adventure', setup: 'Você dormiu no seu mundo. Acordou num jardim de rosas de uma propriedade rural inglesa de 1813, roupas modernas totalmente inadequadas. Nenhuma explicação. Passos se aproximam pelo caminho de cascalho — a anfitriã do baile vem ver quem invadiu seus jardins.' },
    { id: 'iso_carta', emoji: '✉️', title: 'A Carta que Mudou Tudo', mode: 'adventure', setup: 'Você morreu — e despertou segurando uma carta lacrada, deitado numa carruagem parada diante de uma mansão de Londres. A carta diz que você é o(a) parente distante esperado(a) para a temporada. Ninguém aqui te viu antes. É a sua chance de forjar uma vida inteira... se convencer a todos.' },
  ],
  systemPromptLore: BRIDGERTON_LORE,
  npcs: [...BRIDGERTON_NPCS, ...BRIDGERTON_NPCS_MINOR],
  npcTables: BRIDGERTON_NPC_TABLES,
  isekaiIntro: `O jogador foi transportado do nosso mundo (2026) pra Londres de 1813. Roupas estranhas, sem título, sem família, sem dinheiro. Um completo desconhecido na alta sociedade — que precisa sobreviver de charme e esperteza. Você não conhece ninguém. Ninguém sabe de onde você é. E a Rainha está observando. A alta sociedade é DIFÍCIL: cada porta é fechada pra um forasteiro sem sangue nem dote, e cada conquista social (uma dança, um convite, o favor de um nobre, o coração de alguém) é duramente merecida. Mas como todo isekai, algo dentro de você pode DESPERTAR a qualquer momento — um carisma sobrenatural, um dom oculto, uma capacidade que ninguém neste mundo entende — em um momento de perigo, paixão ou desespero extremo. Se e como isso se manifesta cabe à história revelar.`,
  imageStyle: 'Regency era, Bridgerton Netflix style, elegant, romantic, candlelit, regency dresses, Georgian architecture',
};

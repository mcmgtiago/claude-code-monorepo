import type { Universe } from '../types';
import { GOT_LORE } from './lore';
import { GOT_NPCS } from './npcs';
import { GOT_NPCS_MINOR } from './npcs-minor';
import { GOT_NPC_TABLES } from './npc-tables';

export const GOT: Universe = {
  id: 'got',
  name: 'Game of Thrones',
  tagline: 'Vença ou morra',
  emoji: '🐉',
  theme: { accent: 'amber', accentHex: '#d4a017' },
  powerLabel: 'Magia',
  hasPowerGenerator: true,

  attributes: [
    { key: 'forca', label: 'Força', short: 'FOR' },
    { key: 'destreza', label: 'Destreza', short: 'DES' },
    { key: 'resistencia', label: 'Resistência', short: 'RES' },
    { key: 'astucia', label: 'Astúcia', short: 'AST' },
    { key: 'comando', label: 'Comando', short: 'CMD' },
    { key: 'seducao', label: 'Sedução', short: 'SED' },
    { key: 'percepcao', label: 'Percepção', short: 'PER' },
    { key: 'vontade', label: 'Vontade', short: 'VON' },
  ],
  tiers: [
    { key: 'novato', label: 'Plebeu', desc: 'Camponês/servo/vagabundo', budget: 22, startLevel: 1 },
    { key: 'veterano', label: 'Cavaleiro', desc: 'Guerreiro treinado/mercenário', budget: 34, startLevel: 5 },
    { key: 'elite', label: 'Nobre', desc: 'Lorde menor de poder regional', budget: 48, startLevel: 12 },
    { key: 'omega', label: 'Grande Lorde', desc: 'Casa soberana, poder de rei', budget: 80, startLevel: 25 },
  ],
  powerTypes: [
    { key: 'magia', label: 'Com Magia', desc: 'Warg, Vidente, R\'hllor, Sangue Valyrio, Sem-Rosto. Raro e perigoso.' },
    { key: 'mundano', label: 'Mundano', desc: 'Sem magia. Guerreiro, político, mercenário, intrigante.' },
  ],
  skills: [
    // Tier 1 (10 skills)
    { name: 'Espadachim', tree: 'combate', tier: 1, description: '+1 força em combate corpo-a-corpo.', bonusAttribute: 'forca', bonusAmount: 1 },
    { name: 'Escudo de Aço', tree: 'combate', tier: 1, description: '+1 resistência em defesa.', bonusAttribute: 'resistencia', bonusAmount: 1 },
    { name: 'Arqueiro', tree: 'combate', tier: 1, description: '+1 destreza com arco.', bonusAttribute: 'destreza', bonusAmount: 1 },
    { name: 'Pés Leves', tree: 'furtividade', tier: 1, description: 'Move-se em silêncio. +1 destreza.', bonusAttribute: 'destreza', bonusAmount: 1 },
    { name: 'Mãos Rápidas', tree: 'furtividade', tier: 1, description: 'Roubo e prestidigitação. +1 destreza.', bonusAttribute: 'destreza', bonusAmount: 1 },
    { name: 'Língua de Prata', tree: 'social', tier: 1, description: '+1 astúcia em persuasão/mentiras.', bonusAttribute: 'astucia', bonusAmount: 1 },
    { name: 'Olhar Sedutor', tree: 'social', tier: 1, description: '+1 sedução.', bonusAttribute: 'seducao', bonusAmount: 1 },
    { name: 'Presença Intimidadora', tree: 'social', tier: 1, description: '+1 comando em intimidação.', bonusAttribute: 'comando', bonusAmount: 1 },
    { name: 'Caçador', tree: 'sobrevivencia', tier: 1, description: '+1 percepção em rastreamento. Nunca passa fome.', bonusAttribute: 'percepcao', bonusAmount: 1 },
    { name: 'Cavaleiro Nato', tree: 'sobrevivencia', tier: 1, description: '+1 destreza em combate montado.', bonusAttribute: 'destreza', bonusAmount: 1 },
    { name: 'Letrado', tree: 'conhecimento', tier: 1, description: 'Lê e escreve. +1 percepção.', bonusAttribute: 'percepcao', bonusAmount: 1 },
    // Tier 2 (9 skills)
    { name: 'Duelista', tree: 'combate', tier: 2, description: 'Vantagem em duelos 1v1. +2 destreza.', bonusAttribute: 'destreza', bonusAmount: 2 },
    { name: 'Brutalidade', tree: 'combate', tier: 2, description: 'Golpes devastadores. +2 força.', bonusAttribute: 'forca', bonusAmount: 2 },
    { name: 'Veneno', tree: 'furtividade', tier: 2, description: 'Pode envenenar comida/armas/bebidas. +2 astúcia.', bonusAttribute: 'astucia', bonusAmount: 2 },
    { name: 'Disfarce', tree: 'furtividade', tier: 2, description: 'Muda aparência convincentemente. +2 astúcia.', bonusAttribute: 'astucia', bonusAmount: 2 },
    { name: 'Manipulador', tree: 'social', tier: 2, description: 'Joga pessoas umas contra as outras. +2 astúcia.', bonusAttribute: 'astucia', bonusAmount: 2 },
    { name: 'Amante Irresistível', tree: 'social', tier: 2, description: '+2 sedução.', bonusAttribute: 'seducao', bonusAmount: 2 },
    { name: 'Curandeiro', tree: 'sobrevivencia', tier: 2, description: 'Trata ferimentos. +2 percepção.', bonusAttribute: 'percepcao', bonusAmount: 2 },
    { name: 'Sobrevivente', tree: 'sobrevivencia', tier: 2, description: 'Resiste a frio, fome, veneno. +2 resistência.', bonusAttribute: 'resistencia', bonusAmount: 2 },
    { name: 'Estrategista', tree: 'conhecimento', tier: 2, description: 'Planeja batalhas. +2 comando.', bonusAttribute: 'comando', bonusAmount: 2 },
    // Tier 3 (6 skills)
    { name: 'Comandante de Batalha', tree: 'combate', tier: 3, description: 'Lidera exércitos. +3 comando.', bonusAttribute: 'comando', bonusAmount: 3 },
    { name: 'Lâmina Mortal', tree: 'combate', tier: 3, description: 'Cada golpe pode ser fatal. +3 força.', bonusAttribute: 'forca', bonusAmount: 3 },
    { name: 'Assassinato Silencioso', tree: 'furtividade', tier: 3, description: 'Mata sem ser detectado. +3 destreza.', bonusAttribute: 'destreza', bonusAmount: 3 },
    { name: 'Senhor do Medo', tree: 'social', tier: 3, description: 'Presença paralisa inimigos. +3 comando.', bonusAttribute: 'comando', bonusAmount: 3 },
    { name: 'Mestre da Corte', tree: 'social', tier: 3, description: 'Domina intrigas políticas. +3 astúcia.', bonusAttribute: 'astucia', bonusAmount: 3 },
    { name: 'Mestre dos Sussurros', tree: 'conhecimento', tier: 3, description: 'Rede de espiões. Sabe tudo. +3 percepção.', bonusAttribute: 'percepcao', bonusAmount: 3 },
  ],
  scenarios: [
    // Início aventura
    { id: 'beco_kingslanding', emoji: '🏰', title: 'Beco de Porto Real', mode: 'adventure', setup: 'Acorda num beco fétido de Porto Real, esgoto correndo pelos pés. A Fortaleza Vermelha domina o horizonte cinzento. Um ladrão te observa de canto, adaga na mão.' },
    { id: 'muralha', emoji: '🧊', title: 'A Muralha (Gelo)', mode: 'adventure', setup: 'Desperta no gelo cortante, frio de morte nos ossos, aos pés da Muralha de 200m. Corvos da Patrulha da Noite se aproximam, lanças em riste, suspeitosos. "Quem vai?"' },
    { id: 'floresta_lobos', emoji: '🐺', title: 'Bosque dos Lobos (Norte)', mode: 'adventure', setup: 'Acorda numa floresta do Norte. Uivos ecoam. Um lobo gigante te encara entre as árvores — olhos inteligentes, não é animal comum. Faminto?' },
    { id: 'taverna', emoji: '🍺', title: 'Taverna na Estrada do Rei', mode: 'adventure', setup: 'Materializa numa taverna barulhenta, fumaça de lã queimada, bebida derramada no chão. Mercenários e cavaleiros bebem. Um deles cospe: "Roupa estranha. Qual casa serve?"' },
    { id: 'naufragio', emoji: '🌊', title: 'Náufrago (Ilhas de Ferro)', mode: 'adventure', setup: 'Acorda numa praia rochosa, cuspido pelo mar. Frio. Ao longe, Pyke — castelo desmoronando sobre penhascos. Saqueadores Greyjoy caminham na praia.' },
    { id: 'dorne', emoji: '🏜️', title: 'Deserto de Dorne', mode: 'adventure', setup: 'Desperta sob sol escaldante de Dorne, arena de areia. Uma caravana Martell passa — uma mulher de rosto coberto, olhos negros perigosos, oferece água envenenada disfarçado de compaixão.' },
    { id: 'campina', emoji: '🌾', title: 'Campina Tyrell', mode: 'adventure', setup: 'Acorda num campo de flores de rosas vermelhas. Calor. Um cavaleiro Tyrell em armadura brilhante o observa. "Quem anda em terra Tyrell sem permissão?"' },
    { id: 'braavos', emoji: '🎭', title: 'Casa do Preto e Branco (Braavos)', mode: 'adventure', setup: 'Materializa numa rua de Braavos, névoa do canal, sons de água por toda parte. Uma figura encapuzada sussurra: "Valar morghulis." Uma faca roça seu rosto.' },
    // Meio jogo
    { id: 'fortaleza_vermelha', emoji: '👑', title: 'Dentro da Fortaleza Vermelha', mode: 'adventure', setup: 'Trazido/a aos aposentos da Fortaleza. Ouro, seda, segredos. Um lorde/lady te oferece vinho. "Preciso de alguém confiável... uma missão discreta."' },
    { id: 'battle_camp', emoji: '⚔️', title: 'Acampamento de Batalha', mode: 'adventure', setup: 'Acordas numa tenda de guerra. Barulho de exército ao redor. Um general te chama: "Preciso de guerreiros. Você serve ou morre."' },
    { id: 'winterfell_interior', emoji: '❄️', title: 'Dentro de Winterfell', mode: 'adventure', setup: 'Trazido/a a Winterfell, fortaleza dos Stark. Pedra cinza, aquecida por fontes termais. Um Stark te estuda: "Você não é daqui. Fale verdade ou morra."' },
    // Adult
    { id: 'bordel', emoji: '💋', title: 'Bordel de Mindinho (Porto Real)', mode: 'adult', setup: 'Acorda numa cama de seda num bordel de luxo. Uma cortesã seminua desliza a mão pelo seu peito: "Acordou, meu doce. Mindinho ordenou que você tivesse o melhor da noite."' },
    { id: 'banho_castelo', emoji: '🛁', title: 'Banhos do Castelo', mode: 'adult', setup: 'Materializa numa câmara de banho quente. Vapor. Uma nobre seminua no banho te vê. Ela não grita — ela sorri: "Um presente dos deuses. Vem."' },
    { id: 'tenda_guerra', emoji: '⚔️', title: 'Tenda de Guerra', mode: 'adult', setup: 'Desperta numa tenda de acampamento. Uma comandante guerreira ao seu lado, seminua. "Você dormiu. Agora me serve de novo."' },
    { id: 'alcova_dorne', emoji: '🏜️', title: 'Alcova de Dorne', mode: 'adult', setup: 'Deitado numa almofada de seda num palácio de Dorne. Uma princesa Martell corre um dedo pelo seu rosto: "Heard você é de outro mundo. Mostre-me coisas novas."' },
    // Inícios clássicos de isekai
    { id: 'iso_caminhao', emoji: '🚚', title: 'Morte e Renascimento', mode: 'adventure', setup: 'A última coisa que lembra é o farol de um caminhão no seu mundo. Depois, escuridão gelada. Agora acorda numa carroça atravessando a estrada do rei, roupas estranhas, vivo. O carroceiro te olha: "Achei você caído na lama. Sorte que os bandidos não te acharam."' },
    { id: 'iso_ritual', emoji: '🔮', title: 'Invocado por um Feiticeiro', mode: 'adventure', setup: 'Chamas verdes de um ritual de sangue crepitam ao seu redor. Você foi ARRANCADO do seu mundo. Uma sacerdotisa vermelha te encara: "O Senhor da Luz o enviou. Você tem um papel na guerra que vem — a Longa Noite se aproxima."' },
    { id: 'iso_portal_jogo', emoji: '🎮', title: 'Sugado pela Tela', mode: 'adventure', setup: 'Você assistia/jogava sobre Westeros. A tela brilhou branco — e agora está DENTRO dele. Você conhece as casas, as traições, quem morre e quando. Mas o aço é real, e um cavaleiro desconhecido puxa a espada na sua direção.' },
    { id: 'iso_bebe_memoria', emoji: '👶', title: 'Renascido com Memórias', mode: 'adventure', setup: 'Você reencarnou em Westeros anos atrás, filho de uma casa menor esquecida, mas com todas as memórias da vida anterior. Hoje adulto, sabe que a Guerra dos Cinco Reis se aproxima. Pode mudar o destino — se sobreviver ao jogo.' },
    { id: 'iso_naufrago', emoji: '🌊', title: 'Náufrago de Outro Mundo', mode: 'adventure', setup: 'Você dormiu no seu mundo. Acordou cuspido pelo mar numa praia rochosa das Ilhas de Ferro, roupas modernas encharcadas. Nenhuma explicação. Saqueadores Greyjoy caminham na sua direção, machados em punho.' },
    { id: 'iso_deuses', emoji: '✨', title: 'Barganha dos Antigos Deuses', mode: 'adventure', setup: 'Você morreu. Perante uma árvore-coração de face esculpida, uma voz ancestral falou: "Sua alma serve ao jogo que vem. Dou-lhe vida em Westeros — mas neste mundo, todos os homens devem morrer. Vença, ou pereça." Você desperta sob um weirwood.' },
  ],
  npcs: [...GOT_NPCS, ...GOT_NPCS_MINOR],
  npcTables: GOT_NPC_TABLES,
  systemPromptLore: GOT_LORE,
  isekaiIntro: `O jogador VEM DE OUTRO MUNDO (2026), transportado instantaneamente pra Westeros. NÃO tem casa, título, terras, exército, aliados nem inimigos. É um FORASTEIRO ABSOLUTO — ninguém conhece, nunca ouviu falar, é invisível socialmente. Começa do ZERO. Casa/título/poder são conquistados no jogo através de intriga, guerra, casamento, ou morte. A única coisa que você tem é a própria vida. E em Westeros, até isso é frágil.`,
  imageStyle: 'Game of Thrones HBO style, medieval dark fantasy, cinematic, gritty, castle architecture, war',
};

import type { Universe } from '../types';
import { WRESTLING_LORE } from './lore';
import { WRESTLING_NPCS } from './npcs';
import { WRESTLING_NPC_TABLES } from './npc-tables';

export const WRESTLING: Universe = {
  id: 'wrestling',
  name: 'Wrestling',
  tagline: 'Kayfabe, promos e a política do ringue',
  emoji: '🎭',
  theme: { accent: 'yellow', accentHex: '#eab308' },
  powerLabel: 'Star Power',
  hasPowerGenerator: false,
  attributes: [
    { key: 'micskills', label: 'Mic Skills (Promo)', short: 'MIC' },
    { key: 'inring', label: 'In-Ring Work', short: 'RING' },
    { key: 'gimmick', label: 'Gimmick (Personagem)', short: 'GIM' },
    { key: 'atletismo', label: 'Atletismo', short: 'ATL' },
    { key: 'carisma', label: 'Carisma', short: 'CAR' },
    { key: 'psicologia', label: 'Psicologia de Ringue', short: 'PSI' },
    { key: 'politica', label: 'Política de Bastidor', short: 'POL' },
    { key: 'resistencia', label: 'Resistência (Bumps)', short: 'RES' },
  ],
  tiers: [
    { key: 'novato', label: 'Jobber/Indie', desc: 'Começando no circuito indie', budget: 22, startLevel: 1 },
    { key: 'veterano', label: 'Midcarder', desc: 'Contratado, disputando cinturões menores', budget: 34, startLevel: 6 },
    { key: 'elite', label: 'Main Eventer', desc: 'Estrela que fecha os shows', budget: 48, startLevel: 15 },
    { key: 'omega', label: 'Lenda / Draw', desc: 'Ícone que vende arenas sozinho', budget: 80, startLevel: 28 },
  ],
  powerTypes: [
    { key: 'promo', label: 'Mestre do Microfone', desc: 'Sua arma é a boca. Promos lendárias fazem a plateia te amar/odiar (estilo The Rock, CM Punk).' },
    { key: 'worker', label: 'In-Ring Worker', desc: 'Suas lutas são obras de arte. Workrate impecável (estilo Omega, Ospreay).' },
    { key: 'powerhouse', label: 'Monstro/Powerhouse', desc: 'Presença física intimidadora. O gigante que domina (estilo Brock, Kane).' },
    { key: 'highflyer', label: 'High-Flyer', desc: 'Aéreo, acrobático, arriscado. Faz a plateia surtar com moves impossíveis.' },
    { key: 'tecnico', label: 'Técnico', desc: 'Mestre do mat wrestling e submissões. Conta histórias no chão.' },
  ],
  skills: [
    // Microfone
    { name: 'Promo Básico', tree: 'promo', tier: 1, description: '+1 micskills. Sabe segurar um microfone sem gaguejar.', bonusAttribute: 'micskills', bonusAmount: 1 },
    { name: 'Trash Talk', tree: 'promo', tier: 1, description: '+1 carisma. Provoca rivais e a plateia adora.', bonusAttribute: 'carisma', bonusAmount: 1 },
    { name: 'Cut a Promo', tree: 'promo', tier: 2, description: '+2 micskills. Promos que geram reação e vendem a luta.', bonusAttribute: 'micskills', bonusAmount: 2 },
    { name: 'Pipe Bomb', tree: 'promo', tier: 3, description: '+3 micskills. Promo lendário que quebra a internet e te faz estrela.', bonusAttribute: 'micskills', bonusAmount: 3 },
    { name: 'Catchphrase', tree: 'promo', tier: 2, description: '+2 carisma. Um bordão que a plateia grita com você.', bonusAttribute: 'carisma', bonusAmount: 2 },
    // In-ring
    { name: 'Fundamentos de Ringue', tree: 'ring', tier: 1, description: '+1 inring. Sabe bater, cair e vender com segurança.', bonusAttribute: 'inring', bonusAmount: 1 },
    { name: 'Selling', tree: 'ring', tier: 1, description: '+1 psicologia. Faz os golpes parecerem devastadores.', bonusAttribute: 'psicologia', bonusAmount: 1 },
    { name: 'Spot Highlight', tree: 'ring', tier: 2, description: '+2 inring. Momentos que viram GIF e clipes virais.', bonusAttribute: 'inring', bonusAmount: 2 },
    { name: 'Match of the Year', tree: 'ring', tier: 3, description: '+3 inring. Capaz de carregar qualquer um numa luta 5 estrelas.', bonusAttribute: 'inring', bonusAmount: 3 },
    { name: 'Psicologia de Ringue', tree: 'ring', tier: 2, description: '+2 psicologia. Conta uma história dentro da luta.', bonusAttribute: 'psicologia', bonusAmount: 2 },
    // Físico / Atletismo
    { name: 'Finisher Devastador', tree: 'fisico', tier: 2, description: '+2 atletismo. Um golpe final que a plateia espera e explode.', bonusAttribute: 'atletismo', bonusAmount: 2 },
    { name: 'High Spot Aéreo', tree: 'fisico', tier: 2, description: '+2 atletismo. Move aéreo de tirar o fôlego (e a coluna).', bonusAttribute: 'atletismo', bonusAmount: 2 },
    { name: 'Aguentar os Bumps', tree: 'fisico', tier: 2, description: '+2 resistencia. Corpo aguenta a punição da estrada.', bonusAttribute: 'resistencia', bonusAmount: 2 },
    { name: 'Presença de Monstro', tree: 'fisico', tier: 3, description: '+3 gimmick. Sua presença física intimida a arena inteira.', bonusAttribute: 'gimmick', bonusAmount: 3 },
    // Gimmick / Personagem
    { name: 'Gimmick Memorável', tree: 'personagem', tier: 1, description: '+1 gimmick. Um personagem que a plateia lembra.', bonusAttribute: 'gimmick', bonusAmount: 1 },
    { name: 'Heel Heat', tree: 'personagem', tier: 2, description: '+2 gimmick. Faz a plateia te ODIAR (trabalho perfeito de vilão).', bonusAttribute: 'gimmick', bonusAmount: 2 },
    { name: 'Babyface Pop', tree: 'personagem', tier: 2, description: '+2 carisma. A plateia surta de alegria quando você aparece.', bonusAttribute: 'carisma', bonusAmount: 2 },
    { name: 'Ícone Cultural', tree: 'personagem', tier: 3, description: '+3 gimmick. Seu personagem transcende o wrestling (tipo Austin, Rock).', bonusAttribute: 'gimmick', bonusAmount: 3 },
    // Política de bastidor
    { name: 'Jogo de Bastidor', tree: 'politica', tier: 2, description: '+2 politica. Sabe agradar bookers e proteger seu spot.', bonusAttribute: 'politica', bonusAmount: 2 },
    { name: 'Favorito do Chefe', tree: 'politica', tier: 3, description: '+3 politica. O dono te ama — pushes garantidos.', bonusAttribute: 'politica', bonusAmount: 3 },
    { name: 'Respeito do Vestiário', tree: 'politica', tier: 2, description: '+2 politica. Os veteranos te protegem e ensinam.', bonusAttribute: 'politica', bonusAmount: 2 },
  ],
  scenarios: [
    // Começo (indie)
    { id: 'estreia_indie', emoji: '🏚️', title: 'Estreia no Ginásio Indie', mode: 'adventure', setup: 'Ginásio de escola, 150 fãs em cadeiras dobráveis, ringue apertado. Sua estreia no wrestling. O promotor te avisa nos bastidores: "Você vai perder pro cara da casa hoje, é assim que funciona. Mas se fizer a plateia acreditar, eu te chamo de novo. Vende a derrota, garoto."' },
    { id: 'primeiro_promo', emoji: '🎙️', title: 'Seu Primeiro Microfone', mode: 'adventure', setup: 'O booker te dá 90 segundos no microfone antes da luta pela primeira vez. A plateia não te conhece. Você pode virar face ou heel agora mesmo, dependendo do que disser. As luzes acendem em você. O silêncio espera. Fale.' },
    { id: 'tryout', emoji: '📹', title: 'Tryout da WWE/AEW', mode: 'adventure', setup: 'Olheiros das grandes empresas estão na plateia hoje. Esta é a chance da sua vida — uma boa luta e você assina contrato, uma ruim e volta pro anonimato dos indies. O oponente é experiente e vai testar cada aspecto do seu jogo.' },
    // Meio de carreira
    { id: 'debut_tv', emoji: '📺', title: 'Estreia na TV', mode: 'adventure', setup: 'Assinou o contrato. Hoje é sua estreia na TV nacional, ao vivo, milhões assistindo. Como você entra? Que gimmick? A primeira impressão define os próximos anos. Os produtores contam nos dedos: "No ar em 5... 4... 3..."' },
    { id: 'feud', emoji: '⚔️', title: 'A Rivalidade', mode: 'adventure', setup: 'O creative te colocou numa rivalidade com um main eventer. Traição, provocações, promos trocados semana após semana. Isso pode te elevar a estrela — se você entregar. Hoje tem confronto no ringue antes do grande combate. A arena está eletrizada.' },
    { id: 'backstage_politica', emoji: '🚪', title: 'Política de Bastidor', mode: 'adventure', setup: 'Você descobre que um veterano invejoso está sabotando você com o creative, pedindo pra te enterrar. Você pode confrontá-lo, apelar aos chefes, jogar o jogo político, ou provar seu valor no ringue de um jeito impossível de ignorar. O que faz?' },
    { id: 'turn', emoji: '🔄', title: 'A Virada (Turn)', mode: 'adventure', setup: 'O momento perfeito pra uma virada de personagem. Você é face amado — e o creative quer te transformar em heel. Ou o contrário. No meio de um segmento ao vivo, você tem a chance de chocar a plateia com uma traição/redenção que definirá sua carreira.' },
    { id: 'title_shot', emoji: '🏆', title: 'Disputa de Título', mode: 'adventure', setup: 'Anos de trabalho levaram a isto: sua chance pelo World Championship no maior show do ano. 60 mil pessoas na arena, o campeão te encara. Mas você sabe que os bookers decidem o resultado — a menos que você seja over demais pra eles te negarem.' },
    // Bastidor / drama
    { id: 'contract_negotiation', emoji: '💰', title: 'Renovação de Contrato', mode: 'adventure', setup: 'Seu contrato vence. A empresa rival ofereceu o dobro e liberdade criativa. Seu chefe atual te chama na sala: "Sei da oferta. Podemos conversar. O que você quer pra ficar?" Sua alavancagem depende do quão over e valioso você é.' },
    { id: 'injury_angle', emoji: '🩹', title: 'Lesão Real no Meio do Angle', mode: 'adventure', setup: 'No meio de uma luta importante ao vivo, você (ou o oponente) se machuca DE VERDADE — não é work. A plateia não sabe. Você precisa improvisar: terminar a luta protegendo a lesão, mudar o final na hora, ou parar tudo. Decisão em segundos, câmeras rolando.' },
    // Adultos
    { id: 'pos_show', emoji: '🔥', title: 'Depois do Show', mode: 'adult', setup: 'A arena esvaziou, a adrenalina do main event ainda queima. Nos bastidores, uma colega de elenco / valete / rival com quem você teve tensão o show todo te encurrala no vestiário vazio: "Aquela química no ringue não era só kayfabe, era? Ninguém mais tá aqui."' },
    { id: 'hotel_estrada', emoji: '🏨', title: 'Vida na Estrada', mode: 'adult', setup: 'Mais uma cidade, mais um quarto de hotel genérico, 2 da manhã. A vida na estrada é solitária. Batem na sua porta — alguém do roster que também não consegue dormir, também cansado de fingir que está tudo bem. "Posso entrar? Não quero ficar sozinha hoje."' },
    { id: 'rival_tensao', emoji: '⚡', title: 'Ódio ou Desejo?', mode: 'adult', setup: 'Meses de rivalidade no ringue, promos ácidos, socos que quase foram reais. Você e sua rival ficam presos sozinhos numa sala dos bastidores após uma discussão acalorada. A linha entre ódio kayfabe e tensão real desaparece. Ela te empurra contra os equipamentos: "Eu deveria te odiar..."' },
  ],
  npcs: WRESTLING_NPCS,
  npcTables: WRESTLING_NPC_TABLES,
  systemPromptLore: WRESTLING_LORE,
  isekaiIntro: `Este NÃO é um isekai. É o mundo REAL da luta livre profissional (WWE, AEW, indies). O jogador é um wrestler. CRÍTICO: aqui as lutas são ROTEIRIZADAS (kayfabe) — o que importa NÃO é "vencer", mas a REAÇÃO DA PLATEIA (ficar over), os PROMOS no microfone, o GIMMICK (personagem) e a POLÍTICA DE BASTIDOR (agradar bookers, proteger seu spot). O drama real acontece nos bastidores: quem tem push, quem é enterrado, quem controla o creative. Uma promo lendária vale mais que mil vitórias. Interprete o mundo dos bastidores com toda a política, ego e drama. As lutas são performance — narre-as como espetáculo coreografado onde os dois trabalham JUNTOS pra contar uma história, mesmo sendo "rivais". Star power e carisma definem tudo.`,
  imageStyle: 'photorealistic, pro wrestling photography, WWE/AEW arena lighting, dramatic entrance pyro, ring ropes, roaring crowd, larger than life',
};

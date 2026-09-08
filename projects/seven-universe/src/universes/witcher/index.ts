import type { Universe } from '../types';
import { WITCHER_LORE } from './lore';
import { WITCHER_NPCS } from './npcs';
import { WITCHER_NPCS_MINOR } from './npcs-minor';
import { WITCHER_NPC_TABLES } from './npc-tables';

export const WITCHER: Universe = {
  id: 'witcher',
  name: 'The Witcher',
  tagline: 'O mal menor',
  emoji: '🐺',
  theme: { accent: 'yellow', accentHex: '#eab308' },
  powerLabel: 'Sinais / Alquimia',
  hasPowerGenerator: false,
  attributes: [
    { key: 'forca', label: 'Força', short: 'FOR' },
    { key: 'agilidade', label: 'Agilidade', short: 'AGI' },
    { key: 'resistencia', label: 'Resistência', short: 'RES' },
    { key: 'sinais', label: 'Sinais', short: 'SIN' },
    { key: 'alquimia', label: 'Alquimia', short: 'ALQ' },
    { key: 'percepcao', label: 'Percepção', short: 'PER' },
    { key: 'vontade', label: 'Vontade', short: 'VON' },
    { key: 'presenca', label: 'Presença', short: 'PRE' },
  ],
  tiers: [
    { key: 'novato', label: 'Forasteiro', desc: 'Sem treino de bruxo', budget: 22, startLevel: 1 },
    { key: 'veterano', label: 'Bruxo', desc: 'Witcher treinado, mutações', budget: 34, startLevel: 8 },
    { key: 'elite', label: 'Bruxo Veterano', desc: 'Lendário caçador de monstros', budget: 48, startLevel: 18 },
    { key: 'omega', label: 'Lenda', desc: 'Geralt / Yennefer level', budget: 80, startLevel: 30 },
  ],
  powerTypes: [
    { key: 'witcher', label: 'Witcher', desc: 'Mutações, sinais mágicos, olhos de gato, caça monstros.' },
    { key: 'mago', label: 'Feiticeiro', desc: 'Magia poderosa, transformação, portais. Confraria dos Feiticeiros.' },
    { key: 'guerreiro', label: 'Guerreiro', desc: 'Sem magia, espada e coragem. Soldado ou mercenário.' },
  ],
  skills: [
    // Sinais
    { name: 'Aard', tree: 'sinais', tier: 1, description: '+1 sinais. Onda telecinética empurra.', bonusAttribute: 'sinais', bonusAmount: 1 },
    { name: 'Igni', tree: 'sinais', tier: 1, description: '+1 sinais. Jato de fogo.', bonusAttribute: 'sinais', bonusAmount: 1 },
    { name: 'Quen', tree: 'sinais', tier: 1, description: '+1 resistencia. Escudo protetor.', bonusAttribute: 'resistencia', bonusAmount: 1 },
    { name: 'Yrden', tree: 'sinais', tier: 2, description: '+2 sinais. Armadilha mágica (retarda, revela invisíveis).', bonusAttribute: 'sinais', bonusAmount: 2 },
    { name: 'Axii', tree: 'sinais', tier: 2, description: '+2 presenca. Controle mental leve.', bonusAttribute: 'presenca', bonusAmount: 2 },
    { name: 'Sinais Avançados', tree: 'sinais', tier: 3, description: '+3 sinais. Domínio total dos 5 sinais.', bonusAttribute: 'sinais', bonusAmount: 3 },
    // Combate
    { name: 'Esgrima Básica', tree: 'combate', tier: 1, description: '+1 agilidade. Fundamentos da espada.', bonusAttribute: 'agilidade', bonusAmount: 1 },
    { name: 'Espadachim Mestre', tree: 'combate', tier: 2, description: '+2 agilidade. Combate com 2 espadas (prata/aço).', bonusAttribute: 'agilidade', bonusAmount: 2 },
    { name: 'Dança da Morte', tree: 'combate', tier: 3, description: '+3 agilidade. Estilo de combate perfeito (Geralt).', bonusAttribute: 'agilidade', bonusAmount: 3 },
    { name: 'Força Bruta', tree: 'combate', tier: 2, description: '+2 forca. Golpes pesados (Escola do Urso).', bonusAttribute: 'forca', bonusAmount: 2 },
    // Alquimia
    { name: 'Alquimista', tree: 'alquimia', tier: 2, description: '+2 alquimia. Poções, óleos, bombas.', bonusAttribute: 'alquimia', bonusAmount: 2 },
    { name: 'Descoções (Decoctions)', tree: 'alquimia', tier: 3, description: '+3 alquimia. Extratos de monstros (tóxico mas poderoso).', bonusAttribute: 'alquimia', bonusAmount: 3 },
    { name: 'Óleos de Lâmina', tree: 'alquimia', tier: 1, description: '+1 alquimia. Óleo específico por tipo de monstro.', bonusAttribute: 'alquimia', bonusAmount: 1 },
    // Witcher específico
    { name: 'Olhos de Gato', tree: 'mutacao', tier: 1, description: '+1 percepcao. Visão no escuro (mutação).', bonusAttribute: 'percepcao', bonusAmount: 1 },
    { name: 'Metabolismo Witcher', tree: 'mutacao', tier: 2, description: '+2 resistencia. Cura acelerada, imune a doenças.', bonusAttribute: 'resistencia', bonusAmount: 2 },
    { name: 'Mutações Avançadas', tree: 'mutacao', tier: 3, description: '+3 resistencia. Mutações extras (raro, arriscado).', bonusAttribute: 'resistencia', bonusAmount: 3 },
    // Conhecimento
    { name: 'Bestiário', tree: 'conhecimento', tier: 1, description: '+1 percepcao. Conhece fraquezas de monstros.', bonusAttribute: 'percepcao', bonusAmount: 1 },
    { name: 'Rastreamento', tree: 'conhecimento', tier: 2, description: '+2 percepcao. Segue trilhas de qualquer criatura.', bonusAttribute: 'percepcao', bonusAmount: 2 },
    // Magia (feiticeiro)
    { name: 'Magia do Caos', tree: 'magia', tier: 2, description: '+2 sinais. Feitiços de mago (mais que sinais).', bonusAttribute: 'sinais', bonusAmount: 2 },
    { name: 'Portais', tree: 'magia', tier: 3, description: '+3 sinais. Teletransporte mágico (feiticeiro).', bonusAttribute: 'sinais', bonusAmount: 3 },
  ],
  scenarios: [
    { id: 'estrada', emoji: '🌲', title: 'Estrada Sombria', mode: 'adventure', setup: 'Acorda numa estrada de terra entre pinheiros. Névoa densa. Uma carroça abandonada, sangue fresco na lama. Garras na madeira.' },
    { id: 'taverna', emoji: '🍺', title: 'Taverna do Vigia', mode: 'adventure', setup: 'Materializa numa taverna miserável. Aldeões sussurram sobre "a criatura nos pântanos". Um velho te olha: "Você tem cara de quem mata monstros. Pago bem."' },
    { id: 'contrato', emoji: '📜', title: 'Quadro de Avisos', mode: 'adventure', setup: 'Surge numa praça de vila. Quadro de avisos: "CONTRATO: Grifo matou 3 pastores. 200 coroas. CUIDADO." Ninguém se candidatou. Os aldeões te olham com esperança.' },
    { id: 'pantano', emoji: '💀', title: 'Pântano Amaldiçoado', mode: 'adventure', setup: 'Desperta num pântano fétido. Fogos-fátuos dançam. Uma bruxa do pântano (Crone) te observa da névoa, sorriso podre: "Carne fresca... ou um visitante?"' },
    { id: 'kaer_morhen', emoji: '🏰', title: 'Kaer Morhen em Ruínas', mode: 'adventure', setup: 'Materializa diante de uma fortaleza em ruínas nas montanhas (Kaer Morhen). Um bruxo solitário aguça a espada na entrada: "Ninguém encontra este lugar por acidente."' },
    { id: 'banho', emoji: '💋', title: 'Banho na Taverna', mode: 'adult', setup: 'Acorda numa banheira de madeira na taverna. Uma feiticeira (cabelos negros, olhos violeta, cheiro de lilás e groselha) aparece no quarto: "Vim falar de negócios... mas podemos começar pelo prazer."' },
    { id: 'succubus', emoji: '😈', title: 'Encontro com Súcubo', mode: 'adult', setup: 'Numa cave, uma criatura de beleza impossível te encontra. Não é humana — é um súcubo. "Não vim te matar, caçador. Vim te oferecer uma noite... em troca de minha vida."' },
    { id: 'novigrad', emoji: '🏙️', title: 'Ruas de Novigrad', mode: 'adventure', setup: 'Materializa em Novigrad, maior cidade do Norte. Caça Bruxas (Radovid) queima magos em fogueiras. Templo da Chama Eterna prega ódio. Espiões por toda parte.' },
    { id: 'skellige', emoji: '⚓', title: 'Ilhas de Skellige', mode: 'adventure', setup: 'Acorda numa praia rochosa de Skellige, terra de guerreiros vikings. Um drakkar aporta. Um jarl te avista: "Forasteiro. Prove seu valor ou vá pro Hall do Morto."' },
    { id: 'baile_maskarada', emoji: '🎭', title: 'Baile de Máscaras (Feiticeiros)', mode: 'adventure', setup: 'Trazido a um baile de máscaras da nobreza. Feiticeiros e nobres conspiram. Yennefer te reconhece: "Você não pertence aqui. O que quer... ou o que sabe?"' },
    { id: 'caca_selvagem', emoji: '❄️', title: 'A Caça Selvagem', mode: 'adventure', setup: 'O céu escurece, gelo cobre tudo. Cavaleiros espectrais em cavalos mortos descem das nuvens. Eredin te encara: "Você viu a garota de olhos verdes? Fale... ou morra congelado."' },
    { id: 'quarto_yennefer', emoji: '💜', title: 'Aposentos de Yennefer', mode: 'adult', setup: 'Yennefer te leva aos aposentos dela. Cheiro de lilás e groselha. "Negócios podem esperar. Você me intriga, forasteiro. Vamos... explorar isso."' },
    // Inícios clássicos de isekai
    { id: 'iso_caminhao', emoji: '🚚', title: 'Morte e Renascimento', mode: 'adventure', setup: 'A última coisa que lembra é o farol de um caminhão. Depois, escuridão. Agora acorda numa carroça balançando por uma estrada de terra — vivo, num corpo que sente estranho. Um mercador te olha: "Achamos você desmaiado na estrada. Sorte que os monstros não te acharam antes."' },
    { id: 'iso_ritual', emoji: '🔮', title: 'Invocado por um Mago', mode: 'adventure', setup: 'Um círculo de runas brilha ao seu redor. Você foi ARRANCADO do seu mundo por um ritual. Um mago de vestes puídas te encara, exausto: "Funcionou... um ser de outro mundo. Preciso da sua ajuda contra a Caça Selvagem. Você não tem escolha."' },
    { id: 'iso_portal_jogo', emoji: '🎮', title: 'Sugado pela Tela', mode: 'adventure', setup: 'Você jogava um RPG sobre este mundo. A tela brilhou branco — e agora está DENTRO dele. Sabe as mecânicas, conhece os monstros, mas seu corpo é real e a dor também. Um grifo grasna ao longe. Isso não é mais um jogo.' },
    { id: 'iso_bebe_memoria', emoji: '👶', title: 'Renascido com Memórias', mode: 'adventure', setup: 'Você reencarnou neste mundo anos atrás, como uma criança comum de vila — mas com todas as memórias da sua vida anterior. Hoje, adulto, um monstro ataca sua vila. É hora de usar o que você sabe do "jogo" que um dia foi só ficção.' },
    { id: 'iso_sonho', emoji: '🌫️', title: 'Acordou no Nevoeiro', mode: 'adventure', setup: 'Você dormiu no seu mundo. Acordou deitado num pântano nevoento do Continente, roupas modernas encharcadas. Nenhuma explicação. Fogos-fátuos dançam. Algo se move na névoa — e não é humano.' },
    { id: 'iso_deusa', emoji: '✨', title: 'Segunda Chance de uma Deusa', mode: 'adventure', setup: 'Você morreu. Uma entidade luminosa (Melitele? Algo mais antigo?) te oferece: "Sua alma serve. Dou-lhe uma segunda vida no Continente — mas ele é cruel. Sobreviva, e talvez entenda por que te escolhi." Tudo escurece, e você desperta numa clareira.' },
  ],
  npcs: [...WITCHER_NPCS, ...WITCHER_NPCS_MINOR],
  npcTables: WITCHER_NPC_TABLES,
  systemPromptLore: WITCHER_LORE,
  isekaiIntro: `O jogador foi transportado do nosso mundo (2026) pro Continente. Pode ter sido submetido a mutações de Witcher (Trial of the Grasses, processo mortal — só 3 de 10 sobrevivem) ou é um forasteiro confuso num mundo brutal. Sem escola, sem espadas de prata/aço, sem conhecimento de monstros, sem coroas. Começa do ZERO. O mundo não perdoa: monstros à noite, políticos venenosos de dia, e a Caça Selvagem no horizonte.`,
  imageStyle: 'The Witcher dark fantasy style, medieval, Slavic mythology, gritty, cinematic, CD Projekt RED',
};

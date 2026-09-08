import type { Universe } from '../types';
import { SKYRIM_LORE } from './lore';
import { SKYRIM_NPCS } from './npcs';
import { SKYRIM_NPCS_MINOR } from './npcs-minor';
import { SKYRIM_NPC_TABLES } from './npc-tables';

export const SKYRIM: Universe = {
  id: 'skyrim',
  name: 'Skyrim',
  tagline: 'Fus Ro Dah',
  emoji: '🐉',
  theme: { accent: 'slate', accentHex: '#94a3b8' },
  powerLabel: 'Thu\'um / Magia',
  hasPowerGenerator: true,

  attributes: [
    { key: 'forca', label: 'Força', short: 'FOR' },
    { key: 'destreza', label: 'Destreza', short: 'DES' },
    { key: 'constituicao', label: 'Constituição', short: 'CON' },
    { key: 'magia', label: 'Magia', short: 'MAG' },
    { key: 'furtividade', label: 'Furtividade', short: 'FUR' },
    { key: 'carisma', label: 'Carisma', short: 'CAR' },
    { key: 'percepcao', label: 'Percepção', short: 'PER' },
    { key: 'vontade', label: 'Vontade', short: 'VON' },
  ],
  tiers: [
    { key: 'novato', label: 'Prisioneiro', desc: 'Recém-escapado, nível 1', budget: 22, startLevel: 1 },
    { key: 'veterano', label: 'Aventureiro', desc: 'Já limpa cavernas', budget: 34, startLevel: 8 },
    { key: 'elite', label: 'Thane', desc: 'Reconhecido pelos Jarls', budget: 48, startLevel: 15 },
    { key: 'omega', label: 'Dragonborn', desc: 'Dovahkiin lendário', budget: 80, startLevel: 30 },
  ],
  powerTypes: [
    { key: 'guerreiro', label: 'Guerreiro', desc: 'Espada, escudo, armadura pesada. Força bruta.' },
    { key: 'mago', label: 'Mago', desc: 'Destruição, conjuração, restauração. Colégio de Winterhold.' },
    { key: 'ladrao', label: 'Ladrão / Assassino', desc: 'Furtividade, arco, veneno, adagas. Guilda dos Ladrões / Dark Brotherhood.' },
    { key: 'dragonborn', label: 'Dragonborn', desc: 'Thu\'um (gritos), absorve almas de dragão, Dovahkiin.' },
    { key: 'puro', label: 'Sem classe definida', desc: 'Híbrido, decide no caminho.' },
  ],

  skills: [
    // Combate
    { name: 'Espadas de Uma Mão', tree: 'combate', tier: 1, description: 'Manejo de espada/machado. +1 força.', bonusAttribute: 'forca', bonusAmount: 1 },
    { name: 'Espadas de Duas Mãos', tree: 'combate', tier: 1, description: 'Montante, martelo de guerra. +1 força.', bonusAttribute: 'forca', bonusAmount: 1 },
    { name: 'Archery', tree: 'combate', tier: 1, description: 'Mira mortal com arco. +1 destreza.', bonusAttribute: 'destreza', bonusAmount: 1 },
    { name: 'Escudo Pesado', tree: 'combate', tier: 1, description: 'Bloqueia qualquer golpe. +1 constituição.', bonusAttribute: 'constituicao', bonusAmount: 1 },
    { name: 'Armadura Pesada', tree: 'combate', tier: 2, description: 'Tanque blindado. +2 constituição.', bonusAttribute: 'constituicao', bonusAmount: 2 },
    { name: 'Berserker', tree: 'combate', tier: 3, description: 'Fúria de combate. +3 força, -1 def.', bonusAttribute: 'forca', bonusAmount: 3 },
    // Magia
    { name: 'Destruição', tree: 'magia', tier: 1, description: 'Bolas de fogo, raios, gelo. +1 magia.', bonusAttribute: 'magia', bonusAmount: 1 },
    { name: 'Conjuração', tree: 'magia', tier: 1, description: 'Invoca atronachs e mortos-vivos. +1 magia.', bonusAttribute: 'magia', bonusAmount: 1 },
    { name: 'Restauração', tree: 'magia', tier: 1, description: 'Cura ferimentos, wards anti-morto. +1 vontade.', bonusAttribute: 'vontade', bonusAmount: 1 },
    { name: 'Ilusão', tree: 'magia', tier: 2, description: 'Invisibilidade, acalmar, frenzy. +2 magia.', bonusAttribute: 'magia', bonusAmount: 2 },
    { name: 'Encantamento', tree: 'magia', tier: 2, description: 'Encantar armas e armaduras. +2 magia.', bonusAttribute: 'magia', bonusAmount: 2 },
    { name: 'Mestre Arcano', tree: 'magia', tier: 3, description: 'Magias devastadoras. +3 magia.', bonusAttribute: 'magia', bonusAmount: 3 },
    // Furtividade
    { name: 'Sneak', tree: 'furtividade', tier: 1, description: 'Move-se nas sombras. +1 furtividade.', bonusAttribute: 'furtividade', bonusAmount: 1 },
    { name: 'Lockpicking', tree: 'furtividade', tier: 1, description: 'Abre qualquer fechadura. +1 destreza.', bonusAttribute: 'destreza', bonusAmount: 1 },
    { name: 'Pickpocket', tree: 'furtividade', tier: 1, description: 'Furta sem ser visto. +1 furtividade.', bonusAttribute: 'furtividade', bonusAmount: 1 },
    { name: 'Assassinato', tree: 'furtividade', tier: 2, description: 'Kill furtivo com dano 15x. +2 furtividade.', bonusAttribute: 'furtividade', bonusAmount: 2 },
    { name: 'Shadow Warrior', tree: 'furtividade', tier: 3, description: 'Desaparece em combate. +3 furtividade.', bonusAttribute: 'furtividade', bonusAmount: 3 },
    // Social
    { name: 'Speech', tree: 'social', tier: 1, description: 'Persuade, intimida, barganha. +1 carisma.', bonusAttribute: 'carisma', bonusAmount: 1 },
    { name: 'Intimidação', tree: 'social', tier: 2, description: 'Faz inimigos renderem. +2 carisma.', bonusAttribute: 'carisma', bonusAmount: 2 },
    // Thu'um (Dragonborn)
    { name: 'Fus Ro Dah', tree: 'thuum', tier: 1, description: 'Empurra inimigos com força. +1 vontade.', bonusAttribute: 'vontade', bonusAmount: 1 },
    { name: 'Yol Toor Shul', tree: 'thuum', tier: 2, description: 'Cospe fogo de dragão. +2 magia.', bonusAttribute: 'magia', bonusAmount: 2 },
    { name: 'Tiid Klo Ul', tree: 'thuum', tier: 2, description: 'Desacelera o tempo. +2 percepção.', bonusAttribute: 'percepcao', bonusAmount: 2 },
    { name: 'Zun Haal Viik', tree: 'thuum', tier: 2, description: 'Desarma inimigos. +2 vontade.', bonusAttribute: 'vontade', bonusAmount: 2 },
    { name: 'Feim Zii Gron', tree: 'thuum', tier: 3, description: 'Fica etéreo (intangível). +3 vontade.', bonusAttribute: 'vontade', bonusAmount: 3 },
  ],
  scenarios: [
    // Aventura
    { id: 'helgen', emoji: '🔥', title: 'Helgen em Chamas', mode: 'adventure', setup: 'Acorda durante a execução em Helgen. Um dragão ataca, destruindo a cidade. Caos, fogo, gritos. Precisa fugir — mas pra onde?' },
    { id: 'estrada', emoji: '🛤️', title: 'Estrada de Whiterun', mode: 'adventure', setup: 'Materializa numa estrada nevada entre montanhas. Ao longe, as muralhas de Whiterun. Um lobo rosna nas árvores. Viajantes feridos pedem ajuda.' },
    { id: 'caverna', emoji: '🕳️', title: 'Caverna de Bandidos', mode: 'adventure', setup: 'Acorda amarrado numa caverna. Bandidos contam moedas ao redor de uma fogueira. Sua mochila está do outro lado. Uma faca caiu perto do seu pé.' },
    { id: 'taverna', emoji: '🍺', title: 'Sleeping Giant Inn', mode: 'adventure', setup: 'Surge numa taverna lotada de Riverwood. Madeira, fumaça, cerveja. Um bardo toca. A dona da taverna te olha: "Não te conheço. De onde veio?"' },
    { id: 'ruina', emoji: '⚔️', title: 'Ruína Nórdica', mode: 'adventure', setup: 'Desperta dentro de uma tumba nórdica antiga. Sarcófagos de pedra ao redor. Um draugr se move no escuro — olhos azuis brilhando.' },
    { id: 'winterhold', emoji: '❄️', title: 'Colégio de Winterhold', mode: 'adventure', setup: 'Materializa nos portões do Colégio de Winterhold, nevasca cortante. Uma elfa te avalia: "Mais um aspirante? Prove que merece entrar."' },
    { id: 'dragao', emoji: '🐉', title: 'Ataque de Dragão', mode: 'adventure', setup: 'Um dragão ataca a cidade onde você está. Fogo do céu, telhados colapsando. Guardas gritam. O dragão pousa na torre e te olha — como se soubesse quem você é.' },
    { id: 'thieves_guild', emoji: '🗡️', title: 'Esgotos de Riften', mode: 'adventure', setup: 'Acorda nos esgotos de Riften, a Ragged Flagon. Ladrões te cercam. Um argoniano oferece um copo: "Caiu do nada. Interessante. Sabe roubar?"' },
    { id: 'dark_brotherhood', emoji: '🖤', title: 'Acorda Numa Cabana', mode: 'adventure', setup: 'Desperta numa cabana abandonada. Uma mulher mascarada senta numa cadeira: "Durma bem? Você matou alguém que era NOSSO contrato. Agora escolha: junte-se ou morra."' },
    // +18
    { id: 'inn_bed', emoji: '🛏️', title: 'Quarto de Taverna', mode: 'adult', setup: 'Acorda pelado num quarto de taverna. Uma Nord loira e forte está na cama, sorrindo: "Você desmaiou depois do hidromeu. Mas prometo que a noite foi... memorável."' },
    { id: 'dibellas', emoji: '💋', title: 'Templo de Dibella', mode: 'adult', setup: 'Materializa no Templo de Dibella (deusa do amor). Sacerdotisas seminuas te rodeiam: "Os deuses enviaram um presente. Vamos... agradecer."' },
    { id: 'hotspring', emoji: '♨️', title: 'Fonte Termal', mode: 'adult', setup: 'Aparece numa fonte termal escondida nas montanhas. Uma caçadora Dunmer nua te encara sem pudor: "O último homem que me viu assim não viveu pra contar."' },
    { id: 'jarl_chambers', emoji: '👑', title: 'Aposentos do Jarl', mode: 'adult', setup: 'Acorda nos aposentos luxuosos de um Jarl. A esposa/marido do Jarl destranca a porta secreta: "Meu cônjuge não volta até amanhã. Você é... exatamente o que eu procurava."' },
    // Inícios clássicos de isekai
    { id: 'iso_caminhao', emoji: '🚚', title: 'Morte e Renascimento', mode: 'adventure', setup: 'A última coisa que lembra é o farol de um caminhão no seu mundo. Depois, nada. Agora acorda numa carroça de prisioneiros rumo a Helgen, mãos amarradas. Um Nord loiro ao seu lado: "Você também? Finalmente acordou. Os Imperiais nos pegaram."' },
    { id: 'iso_ritual', emoji: '🔮', title: 'Invocado por um Mago', mode: 'adventure', setup: 'Runas brilham num círculo do Colégio de Winterhold. Você foi ARRANCADO do seu mundo por um feitiço de convocação. Um mago exausto te encara: "Um ser de outro plano... eu consegui! Preciso de você contra uma ameaça que nem os Divinos entendem."' },
    { id: 'iso_portal_jogo', emoji: '🎮', title: 'Sugado pela Tela', mode: 'adventure', setup: 'Você jogava sobre este mundo. A tela brilhou branco — e agora está DENTRO dele, nas planícies nevadas de Skyrim. Você conhece os gritos, os dragões, as guildas. Mas o frio é real, e um lobo faminto se aproxima.' },
    { id: 'iso_bebe_memoria', emoji: '👶', title: 'Renascido com Memórias', mode: 'adventure', setup: 'Você reencarnou em Skyrim anos atrás como criança de vila, mas guardou todas as memórias da vida anterior. Hoje adulto, um dragão ataca sua vila pela primeira vez em séculos. Você sabe o que isso significa — o mundo vai mudar.' },
    { id: 'iso_sonho', emoji: '❄️', title: 'Acordou na Nevasca', mode: 'adventure', setup: 'Você dormiu no seu mundo. Acordou caído numa nevasca cortante nas montanhas de Skyrim, roupas modernas congelando. Nenhuma explicação. Ao longe, uma torre de vigia — e o rugido distante de algo enorme nos céus.' },
    { id: 'iso_daedra', emoji: '🌀', title: 'Pacto com um Príncipe Daédrico', mode: 'adventure', setup: 'Você morreu — e uma voz ecoou nas trevas. Um Príncipe Daédrico (Sheogorath? Hermaeus Mora?) se divertiu com sua alma: "Que tal um novo jogo, mortal? Dou-lhe vida em Tamriel. Mas nada é de graça." Você desperta numa ruína antiga.' },
  ],
  npcs: [...SKYRIM_NPCS, ...SKYRIM_NPCS_MINOR],
  npcTables: SKYRIM_NPC_TABLES,
  systemPromptLore: SKYRIM_LORE,
  isekaiIntro: `O jogador NÃO é de Tamriel. Foi transportado do nosso mundo (2026) pra Skyrim. Não conhece ninguém, sem gold, sem armas, sem habilidades de combate (a menos que traga do mundo real). Pode ser ou não Dragonborn (escolha do player). Começa do ZERO — forasteiro confuso num mundo brutal de dragões, guerra civil e magia daédrica.`,
  imageStyle: 'Skyrim Elder Scrolls style, nordic fantasy, snowy mountains, medieval, cinematic, dramatic lighting',
};

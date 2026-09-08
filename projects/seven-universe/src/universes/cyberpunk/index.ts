import type { Universe } from '../types';
import { CYBERPUNK_LORE } from './lore';
import { CYBERPUNK_NPCS } from './npcs';
import { CYBERPUNK_NPC_TABLES } from './npc-tables';

export const CYBERPUNK: Universe = {
  id: 'cyberpunk',
  name: 'Cyberpunk 2099',
  tagline: 'Night City nunca dorme',
  emoji: '🌆',
  theme: { accent: 'cyan', accentHex: '#22d3ee' },
  powerLabel: 'Implantes',
  hasPowerGenerator: true,

  attributes: [
    { key: 'corpo', label: 'Corpo', short: 'COR' },
    { key: 'reflexos', label: 'Reflexos', short: 'REF' },
    { key: 'tecnica', label: 'Técnica', short: 'TEC' },
    { key: 'inteligencia', label: 'Inteligência', short: 'INT' },
    { key: 'frieza', label: 'Frieza', short: 'FRI' },
    { key: 'carisma', label: 'Carisma', short: 'CAR' },
    { key: 'percepcao', label: 'Percepção', short: 'PER' },
    { key: 'vontade', label: 'Vontade', short: 'VON' },
  ],
  tiers: [
    { key: 'novato', label: 'Street Kid', desc: 'Rato de rua sem grana', budget: 22, startLevel: 1 },
    { key: 'veterano', label: 'Mercenário', desc: 'Merc experiente', budget: 34, startLevel: 5 },
    { key: 'elite', label: 'Lenda de Night City', desc: 'Nome nas ruas', budget: 48, startLevel: 12 },
    { key: 'omega', label: 'Cyberpsycho Alpha', desc: 'Máquina de guerra total', budget: 80, startLevel: 25 },
  ],
  powerTypes: [
    { key: 'cyborg', label: 'Cyberware Pesado', desc: 'Corpo modificado com implantes militares.' },
    { key: 'netrunner', label: 'Netrunner', desc: 'Hacker que invade mentes e sistemas.' },
    { key: 'natural', label: 'Puro (sem implantes)', desc: 'Corpo natural. Pode instalar cyberware depois.' },
  ],

  skills: [
    // Combate / Cyberware
    { name: 'Gorilla Arms', tree: 'combate', tier: 1, description: '+1 corpo. Braços cibernéticos de força.', bonusAttribute: 'corpo', bonusAmount: 1 },
    { name: 'Kerenzikov', tree: 'combate', tier: 1, description: '+1 reflexos. Boost de reflexos básico.', bonusAttribute: 'reflexos', bonusAmount: 1 },
    { name: 'Mantis Blades', tree: 'combate', tier: 2, description: '+2 reflexos. Lâminas retráteis nos braços.', bonusAttribute: 'reflexos', bonusAmount: 2 },
    { name: 'Reflexos Sandevistan', tree: 'combate', tier: 2, description: '+2 reflexos. Tempo desacelera (bullet time).', bonusAttribute: 'reflexos', bonusAmount: 2 },
    { name: 'Monowire', tree: 'combate', tier: 2, description: '+2 reflexos. Chicote cortante monomolecular.', bonusAttribute: 'reflexos', bonusAmount: 2 },
    { name: 'Corpo Berserk', tree: 'combate', tier: 3, description: '+3 corpo. Chrome militar pesado, tanque humano.', bonusAttribute: 'corpo', bonusAmount: 3 },
    { name: 'Projétil Inteligente', tree: 'combate', tier: 1, description: '+1 tecnica. Balas smart que perseguem alvo.', bonusAttribute: 'tecnica', bonusAmount: 1 },
    // Net / Netrunning
    { name: 'Quickhack', tree: 'net', tier: 1, description: '+1 tecnica. Hacks básicos de combate.', bonusAttribute: 'tecnica', bonusAmount: 1 },
    { name: 'Breach Protocol', tree: 'net', tier: 2, description: '+2 inteligencia. Invade redes fortificadas.', bonusAttribute: 'inteligencia', bonusAmount: 2 },
    { name: 'Contágio Viral', tree: 'net', tier: 2, description: '+2 tecnica. Quickhacks se espalham entre inimigos.', bonusAttribute: 'tecnica', bonusAmount: 2 },
    { name: 'Cyberdeck Militar', tree: 'net', tier: 3, description: '+3 tecnica. Domínio total da Net.', bonusAttribute: 'tecnica', bonusAmount: 3 },
    { name: 'Netrunner Blackwall', tree: 'net', tier: 3, description: '+3 inteligencia. Acessa a Net proibida (IAs rogue).', bonusAttribute: 'inteligencia', bonusAmount: 3 },
    // Social
    { name: 'Lábia de Fixer', tree: 'social', tier: 1, description: '+1 carisma. Negocia qualquer trampo.', bonusAttribute: 'carisma', bonusAmount: 1 },
    { name: 'Sangue Frio', tree: 'social', tier: 2, description: '+2 frieza. Nada te abala.', bonusAttribute: 'frieza', bonusAmount: 2 },
    { name: 'Intimidação de Rua', tree: 'social', tier: 2, description: '+2 corpo. Presença que assusta gonks.', bonusAttribute: 'corpo', bonusAmount: 2 },
    { name: 'Rede de Contatos', tree: 'social', tier: 3, description: '+3 carisma. Conexões em todas as gangues/corpos.', bonusAttribute: 'carisma', bonusAmount: 3 },
    // Técnica
    { name: 'Engenharia Tech', tree: 'tech', tier: 1, description: '+1 tecnica. Conserta e modifica equipamento.', bonusAttribute: 'tecnica', bonusAmount: 1 },
    { name: 'Crafting de Chrome', tree: 'tech', tier: 2, description: '+2 tecnica. Cria/modifica cyberware.', bonusAttribute: 'tecnica', bonusAmount: 2 },
    { name: 'Perícia Braindance', tree: 'tech', tier: 1, description: '+1 percepcao. Analisa gravações BD pra pistas.', bonusAttribute: 'percepcao', bonusAmount: 1 },
  ],
  scenarios: [
    { id: 'beco_ncity', emoji: '🌃', title: 'Beco de Night City', mode: 'adventure', setup: 'Acorda num beco de Watson, chuva ácida caindo. Neon holográfico, anúncios gritando. Um gonk tenta roubar seus órgãos.' },
    { id: 'ripperdoc', emoji: '🔧', title: 'Clínica Ripperdoc', mode: 'adventure', setup: 'Desperta numa maca de ripperdoc clandestino, corpo dolorido — implantes recém-instalados que você não pediu. O doc sumiu.' },
    { id: 'megaedificio', emoji: '🏙️', title: 'Megaedifício H10', mode: 'adventure', setup: 'Materializa no corredor de um megaedifício, 200 andares de miséria empilhada. Gangue Maelstrom bloqueia a saída.' },
    { id: 'corpo_arasaka', emoji: '🏢', title: 'Torre Arasaka', mode: 'adventure', setup: 'Aparece num andar corporativo da Arasaka. Alarme dispara — você é um intruso. Seguranças com cyberware avançam.' },
    { id: 'afterlife', emoji: '🍸', title: 'Bar Afterlife', mode: 'adventure', setup: 'Surge no bar mais famoso de mercenários, o Afterlife. Rogue te encara do balcão: "Nunca te vi. E eu conheço todo mundo."' },
    { id: 'combat_zone', emoji: '💀', title: 'Combat Zone', mode: 'adventure', setup: 'Acorda em Pacifica, a zona de combate abandonada. Tiroteio ao longe. Voodoo Boys observam você de longe.' },
    { id: 'braindance', emoji: '🧠', title: 'Estúdio Braindance', mode: 'adult', setup: 'Materializa num estúdio de braindance XXX. Uma editora sensual remove o headset: "Você não estava no roteiro... mas pode ficar."' },
    { id: 'joytoy', emoji: '💋', title: 'Beco dos Joytoys', mode: 'adult', setup: 'Aparece em Jig-Jig Street. Neon rosa, joytoys chamando. Uma delas te puxa: "Primeira vez? A casa oferece cortesia."' },
    { id: 'penthouse', emoji: '🥂', title: 'Cobertura Corpo', mode: 'adult', setup: 'Acorda numa cobertura de luxo. Uma executiva da Arasaka, seminua, sorri com um copo de uísque: "Meu novo brinquedo acordou."' },
    // Inícios clássicos de isekai
    { id: 'iso_caminhao', emoji: '🚚', title: 'Morte e Renascimento Digital', mode: 'adventure', setup: 'A última coisa que lembra é o farol de um caminhão. Depois, escuridão — e então uma tela de boot. Você acorda numa maca de ripperdoc em Night City, num corpo com chrome que não instalou. O doc range os dentes: "Achei sua consciência num engrama perdido. Bem-vindo a 2099, choom."' },
    { id: 'iso_ritual', emoji: '🔮', title: 'Upload Forçado', mode: 'adventure', setup: 'Um netrunner rogue puxou sua consciência do seu mundo através da Net e a plantou num corpo em Night City. Ele te encara pela tela: "Você é de outra realidade. Sinto muito, mas preciso de alguém que a corpo não consiga rastrear. Você me deve uma."' },
    { id: 'iso_portal_jogo', emoji: '🎮', title: 'Sugado pela Tela', mode: 'adventure', setup: 'Você jogava sobre Night City. A tela brilhou branco — e agora ESTÁ nela. Você conhece os fixers, as gangues, os segredos das corpos. Mas as balas são reais, e um scav já reparou no novato sozinho no beco.' },
    { id: 'iso_bebe_memoria', emoji: '👶', title: 'Renascido com Memórias', mode: 'adventure', setup: 'Você "nasceu" em Night City há anos, criado nas ruas, mas com todas as memórias de uma vida anterior noutro mundo. Hoje, com seu primeiro chrome instalado, você sabe como essa distopia funciona — e como sobreviver a ela melhor que qualquer street kid.' },
    { id: 'iso_sonho', emoji: '💤', title: 'Acordou no Futuro', mode: 'adventure', setup: 'Você dormiu no seu mundo. Acordou num beco de Watson sob chuva ácida e neon, roupas do passado totalmente deslocadas. Nenhuma explicação. Um anúncio holográfico grita sobre você — e uma gangue Maelstrom acabou de te notar.' },
    { id: 'iso_engrama', emoji: '🧠', title: 'Fantasma no Chip', mode: 'adventure', setup: 'Você morreu — e sua consciência foi gravada num chip Relic experimental. Agora habita um corpo alheio em Night City, com memórias de dois mundos brigando na sua cabeça. A corporação que te criou quer o chip de volta. Você quer respostas.' },
  ],
  npcs: CYBERPUNK_NPCS,
  npcTables: CYBERPUNK_NPC_TABLES,
  systemPromptLore: CYBERPUNK_LORE,
  isekaiIntro: `O jogador foi transportado do nosso mundo (2026) pra Night City de 2099. Corpo talvez já com implantes misteriosos (instalados por quem?). Começa do ZERO — sem eddies (dinheiro), sem contatos, um nobody nas ruas. Megacorps governam, gangues controlam quarteirões, e a Net pode fritar seu cérebro. Sobreviva.`,
  imageStyle: 'cyberpunk night city, neon, rain, chrome implants, dystopian, cinematic',
};

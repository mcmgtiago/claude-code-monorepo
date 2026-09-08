import type { Universe } from '../types';
import { XMEN_LORE } from './lore';
import { XMEN_NPCS } from './npcs';
import { XMEN_NPCS_MINOR } from './npcs-minor';
import { XMEN_NPC_TABLES } from './npc-tables';

export const XMEN: Universe = {
  id: 'xmen',
  name: 'Isekai X-Men',
  tagline: 'Um mundo de mutantes te espera',
  emoji: '⚡',
  theme: { accent: 'purple', accentHex: '#a855f7' },
  powerLabel: 'Mutação',
  hasPowerGenerator: true,

  attributes: [
    { key: 'forca', label: 'Força', short: 'FOR' },
    { key: 'velocidade', label: 'Velocidade', short: 'VEL' },
    { key: 'resistencia', label: 'Resistência', short: 'RES' },
    { key: 'poder', label: 'Poder Mutante', short: 'POD' },
    { key: 'controle', label: 'Controle', short: 'CTR' },
    { key: 'percepcao', label: 'Percepção', short: 'PER' },
    { key: 'vontade', label: 'Vontade', short: 'VON' },
    { key: 'presenca', label: 'Presença', short: 'PRE' },
  ],
  tiers: [
    { key: 'novato', label: 'Epsilon/Delta', desc: 'Fraco ou recém-desperto', budget: 22, startLevel: 1 },
    { key: 'veterano', label: 'Beta/Gamma', desc: 'Competente', budget: 34, startLevel: 5 },
    { key: 'elite', label: 'Alpha', desc: 'Muito forte', budget: 48, startLevel: 12 },
    { key: 'omega', label: 'Omega', desc: 'Sem limite teórico', budget: 80, startLevel: 25 },
  ],
  powerTypes: [
    { key: 'mutante', label: 'Mutante', desc: 'X-Gene ativo. Vai escolher ou gerar poder.' },
    { key: 'humano', label: 'Humano Puro', desc: 'Sem poderes. Pode despertar depois.' },
  ],

  skills: [
    // Tier 1
    { name: 'Combatente', tree: 'combate', tier: 1, description: 'Treino de luta. +1 força.', bonusAttribute: 'forca', bonusAmount: 1 },
    { name: 'Reflexos Aguçados', tree: 'combate', tier: 1, description: 'Esquiva rápida. +1 velocidade.', bonusAttribute: 'velocidade', bonusAmount: 1 },
    { name: 'Sedutor', tree: 'social', tier: 1, description: 'Carisma magnético. +1 presença.', bonusAttribute: 'presenca', bonusAmount: 1 },
    { name: 'Sentir Mutantes', tree: 'percepcao', tier: 1, description: 'Detecta X-Genes. +1 percepção.', bonusAttribute: 'percepcao', bonusAmount: 1 },
    { name: 'Resistência Mutante', tree: 'resistencia', tier: 1, description: 'Corpo endurece. +1 resistência.', bonusAttribute: 'resistencia', bonusAmount: 1 },
    // Tier 2
    { name: 'Controle Refinado', tree: 'poder', tier: 2, description: 'Domínio do X-Gene. +2 controle.', bonusAttribute: 'controle', bonusAmount: 2 },
    { name: 'Explosão de Poder', tree: 'poder', tier: 2, description: 'Libera poder bruto. +2 poder.', bonusAttribute: 'poder', bonusAmount: 2 },
    { name: 'Velocidade Sobrehumana', tree: 'velocidade', tier: 2, description: 'Moveência num borrão. +2 velocidade.', bonusAttribute: 'velocidade', bonusAmount: 2 },
    { name: 'Imortalidade (Regeneração)', tree: 'resistencia', tier: 2, description: 'Cura de quase qualquer ferimento. +2 resistência.', bonusAttribute: 'resistencia', bonusAmount: 2 },
    // Tier 3
    { name: 'Controle Total', tree: 'poder', tier: 3, description: 'Domínio absoluto do poder. +3 controle.', bonusAttribute: 'controle', bonusAmount: 3 },
    { name: 'Omega Ascendente', tree: 'poder', tier: 3, description: 'Poder nível Jean Grey. +3 poder.', bonusAttribute: 'poder', bonusAmount: 3 },
    { name: 'Despertar Forçado', tree: 'poder', tier: 3, description: 'X-Gene despertou de forma brutal. +3 vontade (e trauma).', bonusAttribute: 'vontade', bonusAmount: 3 },
  ],
  scenarios: [
    // Início aventura
    { id: 'beco_madripoor', emoji: '🌃', title: 'Beco de Madripoor', mode: 'adventure', setup: 'Acorda num beco imundo de Lowtown, Madripoor. Chuva, neon em cores erradas, cheiro de lixo e fritura velha. Gritos de gangue ao longe. Um mutante fugitivo passa correndo.' },
    { id: 'metro_ny', emoji: '🚇', title: 'Metrô Abandonado de NY', mode: 'adventure', setup: 'Materializa numa estação de metrô abandonada sob NY. Luz piscando, grafite mutante nas paredes. Sons de algo se arrastando nos túneis — Morlocks habitam aqui.' },
    { id: 'sentinela', emoji: '🤖', title: 'Zona de Guerra Sentinela', mode: 'adventure', setup: 'Acorda em escombros — bairro inteiro destruído por patrulha Sentinela. Prédios em ruínas, carro em chamas. Uma Sentinela GIGANTE ainda patrulha ao longe, varrendo com holofotes. Você precisa se esconder JÁ.' },
    { id: 'savage_land', emoji: '🦖', title: 'Savage Land (Antártica)', mode: 'adventure', setup: 'Desperta numa selva pré-histórica impossível — dinossauros rugem, flora alienígena brilha. Trepadeiras deslizam do céu. Uma tribo primitiva com olhos mutantes te observa das árvores.' },
    { id: 'weapon_x', emoji: '🧪', title: 'Laboratório Weapon X', mode: 'adventure', setup: 'Acorda amarrado numa maca de metal em laboratório subterrâneo. Sangue seco em torno. Alarmes desligados, geradores zumbindo longe. Vozes distantes de cientistas.' },
    { id: 'xavier', emoji: '🏫', title: 'Portões da Mansão Xavier', mode: 'adventure', setup: 'Acorda na grama em frente aos portões de ferro da Mansão Xavier em Westchester. Noite. Luzes acendem. Uma voz telepática pergunta: "Quem é você?"' },
    { id: 'arena', emoji: '🥊', title: 'Arena Clandestina Mutante', mode: 'adventure', setup: 'Desperta numa jaula subterrânea em Madripoor. Multidão gritando por sangue ao redor. Luz vermelha de neon. Uma voz anuncia: "Próximo combate!" — apontam pra você.' },
    { id: 'hellfire', emoji: '👑', title: 'Clube Hellfire (Ritual)', mode: 'adventure', setup: 'Aparece no meio de uma cerimônia no Hellfire Club. Homens de terno e mulheres de lingerie em círculo. Emma Frost te vira e sorri: "Bem-vindo, novo brinquedo."' },
    { id: 'genosha', emoji: '🏝️', title: 'Praias de Genosha', mode: 'adventure', setup: 'Acorda nu em praia de cinzas — Genosha, a ilha mutante devastada. Ruínas ao horizon. Sobreviventes feridos rastejam. Um helicóptero se aproxima.' },
    // Meio jogo
    { id: 'krakoa', emoji: '🌴', title: 'Krakoa, Nação Mutante', mode: 'adventure', setup: 'Um portal floral se abre — você é sugado pra Krakoa. Floresta viva, plantas brilham, o próprio solo parece vivo. Mutantes em traje formal. Um deles oferece mão: "Bem-vindo à nação."' },
    { id: 'mansion_interior', emoji: '🏰', title: 'Dentro da Mansão Xavier', mode: 'adventure', setup: 'Xavier te espera na sala de jantar. Jovens mutantes comendo. Wolverine em canto, bebendo. Cyclops e Jean chegam, analíticos. "Precisamos saber do que você é capaz."' },
    { id: 'danger_room', emoji: '⚔️', title: 'Câmara Danger Room', mode: 'adventure', setup: 'Entras numa sala branca. Hologramas acendem. Cenário de combate se materializa. Uma voz: "Começamos?" Inimigos holográficos aparecem. Wolverine assiste atrás de vidro.' },
    // Adult
    { id: 'cama', emoji: '🛏️', title: 'Cama de Alguém', mode: 'adult', setup: 'Acorda nu em cama com lençol de seda. Uma mutante linda deitada ao lado, mão pousada no seu peito. "Finalmente acordou, gostoso", ela sussurra, beijando seu pescoço.' },
    { id: 'clube_bdsm', emoji: '⛓️', title: 'Clube Underground BDSM', mode: 'adult', setup: 'Materializa num clube subterrâneo de mutantes. Luz vermelha escura, correntes nas paredes, corpo seminu em torno. Uma dominadora de latex preto te vê e sorri: "Você vai gostar daqui."' },
    { id: 'quarto_hellfire', emoji: '💎', title: 'Câmara Privada Hellfire', mode: 'adult', setup: 'Levado pra quarto luxuoso do Hellfire Club. Emma Frost está semi-nua na cama, diamante brilhando na pele. "Sebastian quer me presentear. Você interessa?"' },
    { id: 'encontro_secreto', emoji: '🌙', title: 'Encontro nas Sombras', mode: 'adult', setup: 'Rogue te puxa para um beco escuro, longe dos olhos. Sem luvas. "Uma vez na vida", ela sussurra. "Deixa eu sentir você."' },
    // Inícios clássicos de isekai
    { id: 'iso_caminhao', emoji: '🚚', title: 'Morte e Renascimento', mode: 'adventure', setup: 'A última coisa que lembra é o farol de um caminhão. Depois, escuridão. Agora acorda num beco de Nova York, vivo, num corpo que formiga com uma energia nova. Um X-Gene despertou na sua morte-renascimento. Sirenes ao longe. Você não está mais em casa.' },
    { id: 'iso_ritual', emoji: '🔮', title: 'Experimento Dimensional', mode: 'adventure', setup: 'Você foi ARRANCADO do seu mundo por um portal instável — talvez tecnologia Shi\'ar, talvez o Cerebro. Acorda num laboratório da Mansão X. Xavier fala telepaticamente: "Sinto que você não é deste mundo. E você tem poder. Deixe-me ajudá-lo a entendê-lo."' },
    { id: 'iso_portal_jogo', emoji: '🎮', title: 'Sugado pela Tela', mode: 'adventure', setup: 'Você lia/jogava sobre os X-Men. A tela brilhou branco — e agora está DENTRO do universo mutante. Você conhece os heróis, os vilões, os eventos futuros. Mas os Sentinelas são reais, e um deles acabou de te detectar como "mutante desconhecido".' },
    { id: 'iso_bebe_memoria', emoji: '👶', title: 'Renascido com Memórias', mode: 'adventure', setup: 'Você reencarnou neste mundo anos atrás como criança comum, mas guardou as memórias da vida anterior. Hoje, adolescente/adulto, seu X-Gene finalmente se manifesta — de forma explosiva. E você sabe exatamente que mundo perigoso acabou de te reconhecer.' },
    { id: 'iso_sonho', emoji: '💤', title: 'Acordou Diferente', mode: 'adventure', setup: 'Você dormiu no seu mundo. Acordou numa cela do Weapon X, corpo alterado por experimentos que não pediu, roupas modernas rasgadas. Nenhuma explicação. Alarmes soam — houve uma falha de contenção. É agora ou nunca.' },
    { id: 'iso_cosmico', emoji: '🌌', title: 'Escolhido por uma Força Cósmica', mode: 'adventure', setup: 'Você morreu — e uma entidade cósmica (a Força Fênix? Algo maior?) tocou sua alma: "Você serve. Dou-lhe uma nova vida num mundo de mutantes, e uma fagulha do meu poder. Use-a bem... ou seja consumido." Você desperta ardendo em energia.' },
  ],
  npcs: [...XMEN_NPCS, ...XMEN_NPCS_MINOR],
  npcTables: XMEN_NPC_TABLES,
  systemPromptLore: XMEN_LORE,
  isekaiIntro: `O jogador foi ARRANCADO do nosso mundo (2026) e jogado no universo mutante. Ninguém sabe de onde veio. Você ganhou um X-Gene (ou vai despertar um) — ou continua humano. Começa do ZERO: sem aliados de verdade, sem status, confuso, assustado. Bem-vindo ao mundo onde mutantes são minoria oprimida. Não há segurança aqui.`,
  imageStyle: 'dark cyberpunk X-Men comic style, neon noir, rain-soaked streets, mutant aesthetics, cinematic violence',
};

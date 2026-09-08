import type { Universe } from '../types';
import { DBZ_LORE } from './lore';
import { DBZ_NPCS } from './npcs';
import { DBZ_NPCS_MINOR } from './npcs-minor';
import { DBZ_NPC_TABLES } from './npc-tables';

export const DBZ: Universe = {
  id: 'dbz',
  name: 'Dragon Ball',
  tagline: 'Ultrapasse seus limites',
  emoji: '🔥',
  theme: { accent: 'orange', accentHex: '#f97316' },
  powerLabel: 'Ki',
  hasPowerGenerator: true,
  attributes: [
    { key: 'forca', label: 'Força', short: 'FOR' },
    { key: 'ki', label: 'Ki', short: 'KI' },
    { key: 'velocidade', label: 'Velocidade', short: 'VEL' },
    { key: 'resistencia', label: 'Resistência', short: 'RES' },
    { key: 'tecnica', label: 'Técnica', short: 'TEC' },
    { key: 'percepcao', label: 'Percepção', short: 'PER' },
    { key: 'vontade', label: 'Vontade', short: 'VON' },
    { key: 'presenca', label: 'Presença', short: 'PRE' },
  ],
  tiers: [
    { key: 'novato', label: 'Terráqueo', desc: 'Humano comum ou guerreiro fraco', budget: 22, startLevel: 1 },
    { key: 'veterano', label: 'Guerreiro Z', desc: 'Já treinou de verdade', budget: 34, startLevel: 8 },
    { key: 'elite', label: 'Elite Saiyajin', desc: 'Nível Vegeta/Goku base', budget: 48, startLevel: 18 },
    { key: 'omega', label: 'Divino', desc: 'Super Saiyajin Blue / Ultra Instinto', budget: 80, startLevel: 35 },
  ],
  powerTypes: [
    { key: 'saiyajin', label: 'Saiyajin', desc: 'Raça guerreira, transformações, Zenkai Boost.' },
    { key: 'terraqueo', label: 'Terráqueo', desc: 'Humano com técnicas de ki (Kamehameha).' },
    { key: 'namekuense', label: 'Namekuense', desc: 'Regeneração, esticar corpo, fusão.' },
    { key: 'alienigena', label: 'Alienígena', desc: 'Raça própria (Freeza), forma final poderosa.' },
    { key: 'humano_comum', label: 'Sem Treino', desc: 'Sem ki desperto. Pode treinar e ficar absurdo.' },
  ],
  skills: [
    // Ki básico
    { name: 'Kamehameha', tree: 'ki', tier: 1, description: '+1 ki. Onda de ki devastadora.', bonusAttribute: 'ki', bonusAmount: 1 },
    { name: 'Voar', tree: 'ki', tier: 1, description: '+1 velocidade. Controla ki pra voar.', bonusAttribute: 'velocidade', bonusAmount: 1 },
    { name: 'Sentir Ki', tree: 'percepcao', tier: 1, description: '+1 percepcao. Sente poder de outros.', bonusAttribute: 'percepcao', bonusAmount: 1 },
    { name: 'Rajada de Ki', tree: 'ki', tier: 1, description: '+1 ki. Disparos rápidos de energia.', bonusAttribute: 'ki', bonusAmount: 1 },
    // Técnicas
    { name: 'Kaioken', tree: 'tecnica', tier: 2, description: '+2 forca. Multiplica poder temporariamente (dano ao corpo).', bonusAttribute: 'forca', bonusAmount: 2 },
    { name: 'Teleporte Instantâneo', tree: 'tecnica', tier: 2, description: '+2 velocidade. Move a qualquer lugar sentindo ki.', bonusAttribute: 'velocidade', bonusAmount: 2 },
    { name: 'Genki Dama (Spirit Bomb)', tree: 'tecnica', tier: 3, description: '+3 ki. Coleta energia de seres vivos. Letal.', bonusAttribute: 'ki', bonusAmount: 3 },
    { name: 'Final Flash', tree: 'tecnica', tier: 3, description: '+3 ki. Raio concentrado devastador (Vegeta).', bonusAttribute: 'ki', bonusAmount: 3 },
    { name: 'Destructo Disc (Kienzan)', tree: 'tecnica', tier: 2, description: '+2 tecnica. Disco cortante (Krillin).', bonusAttribute: 'tecnica', bonusAmount: 2 },
    // Transformações Saiyajin
    { name: 'Super Saiyajin (SSJ1)', tree: 'transformacao', tier: 2, description: '+2 ki. Cabelo dourado, ×50 poder.', bonusAttribute: 'ki', bonusAmount: 2 },
    { name: 'Super Saiyajin 2', tree: 'transformacao', tier: 3, description: '+3 ki. Eletricidade, ×100.', bonusAttribute: 'ki', bonusAmount: 3 },
    { name: 'Super Saiyajin 3', tree: 'transformacao', tier: 3, description: '+3 ki. Cabelo longo, ×400 (gasta muito).', bonusAttribute: 'ki', bonusAmount: 3 },
    { name: 'Super Saiyajin God', tree: 'transformacao', tier: 3, description: '+3 ki. Cabelo vermelho, poder divino.', bonusAttribute: 'ki', bonusAmount: 3 },
    { name: 'Super Saiyajin Blue', tree: 'transformacao', tier: 3, description: '+3 ki + 3 controle. SSJ God perfeito.', bonusAttribute: 'ki', bonusAmount: 3 },
    { name: 'Ultra Instinto', tree: 'divino', tier: 3, description: '+3 velocidade. Corpo se move sozinho, esquiva perfeita.', bonusAttribute: 'velocidade', bonusAmount: 3 },
    { name: 'Ultra Ego', tree: 'divino', tier: 3, description: '+3 forca. Fica mais forte quanto mais dano leva (Vegeta).', bonusAttribute: 'forca', bonusAmount: 3 },
    { name: 'Ōzaru (Macaco)', tree: 'transformacao', tier: 2, description: '+2 forca. Forma gigante (lua cheia + cauda), ×10.', bonusAttribute: 'forca', bonusAmount: 2 },
    // Raças
    { name: 'Zenkai Boost', tree: 'saiyajin', tier: 2, description: '+2 resistencia. Fica mais forte após quase morrer.', bonusAttribute: 'resistencia', bonusAmount: 2 },
    { name: 'Regeneração Namek', tree: 'namek', tier: 1, description: '+1 resistencia. Regenera membros.', bonusAttribute: 'resistencia', bonusAmount: 1 },
    { name: 'Fusão (Potara/Dança)', tree: 'especial', tier: 3, description: '+3 todos. Funde 2 guerreiros num super-ser.', bonusAttribute: 'ki', bonusAmount: 3 },
    { name: 'Hakai (Destruição)', tree: 'divino', tier: 3, description: '+3 ki. Poder dos Deuses, apaga existência.', bonusAttribute: 'ki', bonusAmount: 3 },
  ],
  scenarios: [
    // Início
    { id: 'cratera', emoji: '💥', title: 'Cratera de Impacto', mode: 'adventure', setup: 'Acorda no fundo de uma cratera recém-formada. Ki poderoso no ar. Ao longe, dois guerreiros voam trocando golpes que abalam montanhas.' },
    { id: 'torneio', emoji: '🥋', title: 'Torneio de Artes Marciais', mode: 'adventure', setup: 'Materializa numa arena de torneio lotada. Um anunciador grita seu nome como próximo competidor. Do outro lado, um lutador musculoso trinca os punhos.' },
    { id: 'invasao', emoji: '🛸', title: 'Invasão Alienígena', mode: 'adventure', setup: 'Surge numa cidade sendo destruída por guerreiros alienígenas. Poder de luta esmagador. Civis fogem. Você sente o ki avassalador se aproximando.' },
    { id: 'kame_house', emoji: '🏝️', title: 'Kame House', mode: 'adventure', setup: 'Desperta numa ilha com casa rosa. Um velho de óculos escuros e barba branca te avalia: "Hm. Ki curioso o seu. Quer treinar, moleque?"' },
    { id: 'sala_tempo', emoji: '⏳', title: 'Sala do Tempo', mode: 'adventure', setup: 'Materializa numa dimensão branca infinita — a Sala do Tempo e Espírito. 1 dia aqui = 1 ano de treino. Gravidade esmagadora. Alguém já treina ali.' },
    { id: 'freeza', emoji: '👑', title: 'Diante do Imperador (Freeza)', mode: 'adventure', setup: 'Aparece em Namekusei devastado. Uma figura flutua diante de você, sorriso cruel: "Um verme novo? Seu nível de poder é... risível. Deixe-me elevá-lo." Ele aponta o dedo.' },
    // Meio
    { id: 'torneio_poder', emoji: '🏆', title: 'Torneio do Poder', mode: 'adventure', setup: 'Materializa no Null Realm. 80 guerreiros de 8 universos. Se seu universo perder, é apagado. Jiren observa do topo. O torneio começa AGORA.' },
    { id: 'beerus_planet', emoji: '😺', title: 'Planeta de Beerus', mode: 'adventure', setup: 'Aparece no planeta do Deus da Destruição. Beerus acorda de mau humor. "Você me acordou. Espero que valha um bom prato... ou vira poeira."' },
    { id: 'saga_cell', emoji: '🦗', title: 'Cell Games', mode: 'adventure', setup: 'Arena do Cell Games. Cell (perfeito) desafia todos. "Venham, um por um. Vamos ver se algum de vocês me diverte antes de destruir tudo."' },
    { id: 'namekusei', emoji: '🟢', title: 'Namekusei (Dragon Balls)', mode: 'adventure', setup: 'Chega a Namekusei. Aldeias verdes, Dragon Balls do tamanho de bolas de futebol. Soldados de Freeza saqueiam. Um Namekuense pede ajuda.' },
    // Adult
    { id: 'termas', emoji: '♨️', title: 'Termas Após Treino', mode: 'adult', setup: 'Desperta numa terma depois de treino brutal. Uma guerreira de corpo esculpido compartilha as águas: "Treino forte deixa o corpo... sensível. Precisa relaxar os músculos?"' },
    { id: 'quarto_bulma', emoji: '💋', title: 'Capsule Corp (Noite)', mode: 'adult', setup: 'Bulma te chama pra "testar equipamento". Sozinhos no laboratório. Ela sorri: "Vegeta está treinando. Eu tô entediada. Você me distrai?"' },
    { id: 'noite_18', emoji: '🤖', title: 'Noite com Androide 18', mode: 'adult', setup: 'Android 18 te encontra. Fria mas curiosa. "Krillin tá dormindo. Eu não canso. Você aguenta uma androide?"' },
    { id: 'sala_tempo_soli', emoji: '⏳', title: 'Sala do Tempo (Sozinhos)', mode: 'adult', setup: 'Preso na Sala do Tempo com uma guerreira por 1 ano (1 dia fora). Tédio, treino, tensão. "Vamos ter que nos... entreter de alguma forma."' },
  ],
  npcs: [...DBZ_NPCS, ...DBZ_NPCS_MINOR],
  npcTables: DBZ_NPC_TABLES,
  systemPromptLore: DBZ_LORE,
  isekaiIntro: `O jogador foi transportado do nosso mundo (2026) pro universo Dragon Ball. Poder de luta inicial: ~5 (civil). Pode ter potencial de ki adormecido, ou ser um Saiyajin perdido (com cauda). Sem treino, fraco no início — mas com potencial de ficar ABSURDAMENTE forte via treino, Zenkai Boost, e transformações. Começa do ZERO. O céu não é o limite — não há limite.`,
  imageStyle: 'Dragon Ball anime style, Akira Toriyama art, ki energy aura, dynamic martial arts, vibrant colors',
};
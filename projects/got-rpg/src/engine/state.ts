// Estado do jogo — Game of Thrones RPG
// Intriga + Combate + Status + Magia opcional

export type Attribute =
  | 'forca'       // combate corpo-a-corpo, resistência física
  | 'destreza'    // agilidade, furtividade, arco, veneno
  | 'resistencia' // HP, sobrevivência, resistência a dor/frio/fome
  | 'astucia'     // intrigas, mentiras, manipulação, política
  | 'comando'     // liderança, exércitos, autoridade, intimidação
  | 'seducao'     // carisma sexual, sedução, beleza, influência pessoal
  | 'percepcao'   // notar emboscadas, ler intenções, espionagem
  | 'vontade';    // coragem, resistência mental, fé, controle

export const ATTRIBUTES: Attribute[] = [
  'forca', 'destreza', 'resistencia', 'astucia',
  'comando', 'seducao', 'percepcao', 'vontade',
];

export const ATTRIBUTE_LABELS: Record<Attribute, string> = {
  forca: 'Força',
  destreza: 'Destreza',
  resistencia: 'Resistência',
  astucia: 'Astúcia',
  comando: 'Comando',
  seducao: 'Sedução',
  percepcao: 'Percepção',
  vontade: 'Vontade',
};

// Casas principais
export type House =
  | 'stark' | 'lannister' | 'targaryen' | 'baratheon'
  | 'greyjoy' | 'tyrell' | 'martell' | 'arryn' | 'tully'
  | 'bolton' | 'frey' | 'nenhuma' | 'personalizada';

export const HOUSE_LABELS: Record<House, string> = {
  stark: 'Casa Stark',
  lannister: 'Casa Lannister',
  targaryen: 'Casa Targaryen',
  baratheon: 'Casa Baratheon',
  greyjoy: 'Casa Greyjoy',
  tyrell: 'Casa Tyrell',
  martell: 'Casa Martell',
  arryn: 'Casa Arryn',
  tully: 'Casa Tully',
  bolton: 'Casa Bolton',
  frey: 'Casa Frey',
  nenhuma: 'Sem Casa (plebeu, bastardo, mercenário)',
  personalizada: 'Casa Personalizada',
};

// Eras jogáveis
export type Era =
  | 'conquista'         // Aegon I, 300 anos antes da série
  | 'targaryen'         // Reinado Targaryen, Dance of Dragons
  | 'robert_rebellion'  // Rebelião de Robert Baratheon
  | 'guerra_cinco_reis' // Era da série principal (GoT)
  | 'pos_guerra'        // Pós Daenerys, reconstrução
  | 'longa_noite';      // White Walkers, apocalipse

export const ERA_LABELS: Record<Era, string> = {
  conquista: 'A Conquista (Aegon I)',
  targaryen: 'Reinado Targaryen (Dança dos Dragões)',
  robert_rebellion: 'Rebelião de Robert',
  guerra_cinco_reis: 'Guerra dos Cinco Reis',
  pos_guerra: 'Pós-Guerra (Reconstrução)',
  longa_noite: 'A Longa Noite (White Walkers)',
};

// Tier / posição social
export type StartingTier = 'plebeu' | 'cavaleiro' | 'nobre_menor' | 'nobre_maior' | 'rei';

// Magia opcional
export type MagicType =
  | 'nenhuma'           // mundano
  | 'warg'             // controle de animais, skinchanging
  | 'vidente'          // visões proféticas (greensight)
  | 'sacerdote_rhllor' // magia de fogo, ressurreição
  | 'sangue_valyrio'   // sangue de dragão, resistência ao fogo
  | 'rostos_sem_nome'  // assassino místico, trocar rosto
  | 'greyscale_immune' // sobreviveu grayscale, resistência a veneno
  | 'personalizada';

export interface MagicPower {
  type: MagicType;
  description: string;
  ability: string | null;
  evolvedAbility: string | null;
  weakness: string;
}

// Sistema de Skills — habilidades aprendidas por experiência
export type SkillTree =
  | 'combate'    // espada, arco, lança, luta, defesa
  | 'furtividade'// assassinato, roubo, disfarce, veneno
  | 'social'     // sedução, intimidação, negociação, mentira, liderança
  | 'sobrevivencia' // caça, rastreamento, medicina, cavalgar, navegar
  | 'conhecimento'  // história, idiomas, estratégia, maester
  | 'magia';     // warg, visões, fogo, sangue

export interface Skill {
  id: string;
  name: string;
  tree: SkillTree;
  tier: number;           // 1-3 (básico, intermediário, avançado)
  description: string;
  passive: boolean;       // true = sempre ativo; false = precisa ativar
  bonusAttribute?: Attribute; // dá bônus em rolls desse atributo
  bonusAmount?: number;       // +1, +2, etc
  requirement?: string;       // skill necessária antes
}

// Skills existentes no mundo (banco de habilidades que a IA pode conceder)
export const SKILL_CATALOG: Omit<Skill, 'id'>[] = [
  // COMBATE
  { name: 'Espadachim', tree: 'combate', tier: 1, description: 'Treinamento básico com espada. +1 em rolls de combate corpo-a-corpo.', passive: true, bonusAttribute: 'forca', bonusAmount: 1 },
  { name: 'Escudo de Aço', tree: 'combate', tier: 1, description: 'Defesa com escudo. Reduz dano recebido em combate.', passive: true, bonusAttribute: 'resistencia', bonusAmount: 1 },
  { name: 'Arqueiro', tree: 'combate', tier: 1, description: 'Precisão com arco. +1 destreza em ataques à distância.', passive: true, bonusAttribute: 'destreza', bonusAmount: 1 },
  { name: 'Duelista', tree: 'combate', tier: 2, description: 'Mestre em combate singular. Vantagem em duelos 1v1.', passive: true, bonusAttribute: 'destreza', bonusAmount: 2, requirement: 'Espadachim' },
  { name: 'Brutalidade', tree: 'combate', tier: 2, description: 'Golpes devastadores. Dano extra contra inimigos feridos.', passive: true, bonusAttribute: 'forca', bonusAmount: 2, requirement: 'Espadachim' },
  { name: 'Comandante de Batalha', tree: 'combate', tier: 3, description: 'Lidera exércitos. +3 comando em batalhas com tropas.', passive: true, bonusAttribute: 'comando', bonusAmount: 3, requirement: 'Duelista' },
  { name: 'Lâmina Mortal', tree: 'combate', tier: 3, description: 'Cada golpe pode ser fatal. Chance de matar instantaneamente (nat 20).', passive: true, bonusAttribute: 'forca', bonusAmount: 3, requirement: 'Brutalidade' },

  // FURTIVIDADE
  { name: 'Pés Leves', tree: 'furtividade', tier: 1, description: 'Move-se em silêncio. +1 destreza em furtividade.', passive: true, bonusAttribute: 'destreza', bonusAmount: 1 },
  { name: 'Mãos Rápidas', tree: 'furtividade', tier: 1, description: 'Roubo e prestidigitação. Pode surrupiar sem ser visto.', passive: true, bonusAttribute: 'destreza', bonusAmount: 1 },
  { name: 'Veneno', tree: 'furtividade', tier: 2, description: 'Conhece venenos. Pode envenenar comida, armas, bebidas.', passive: false, bonusAttribute: 'astucia', bonusAmount: 2, requirement: 'Mãos Rápidas' },
  { name: 'Disfarce', tree: 'furtividade', tier: 2, description: 'Muda aparência convincentemente. Engana guardas e conhecidos.', passive: false, bonusAttribute: 'astucia', bonusAmount: 2, requirement: 'Pés Leves' },
  { name: 'Assassinato Silencioso', tree: 'furtividade', tier: 3, description: 'Mata sem ser detectado. Um golpe, sem som, sem testemunhas.', passive: false, bonusAttribute: 'destreza', bonusAmount: 3, requirement: 'Veneno' },

  // SOCIAL
  { name: 'Língua de Prata', tree: 'social', tier: 1, description: 'Fala persuasivamente. +1 em negociações e mentiras.', passive: true, bonusAttribute: 'astucia', bonusAmount: 1 },
  { name: 'Presença Intimidadora', tree: 'social', tier: 1, description: 'Impõe medo. +1 comando em intimidações.', passive: true, bonusAttribute: 'comando', bonusAmount: 1 },
  { name: 'Olhar Sedutor', tree: 'social', tier: 1, description: 'Atrai atenção sexual. +1 sedução em interações íntimas.', passive: true, bonusAttribute: 'seducao', bonusAmount: 1 },
  { name: 'Manipulador', tree: 'social', tier: 2, description: 'Joga pessoas umas contra as outras. +2 astúcia em intrigas.', passive: true, bonusAttribute: 'astucia', bonusAmount: 2, requirement: 'Língua de Prata' },
  { name: 'Amante Irresistível', tree: 'social', tier: 2, description: 'Seduz quase qualquer um. +2 sedução, resistência a rejeição.', passive: true, bonusAttribute: 'seducao', bonusAmount: 2, requirement: 'Olhar Sedutor' },
  { name: 'Senhor do Medo', tree: 'social', tier: 3, description: 'Sua presença paralisa. Inimigos hesitam antes de atacar.', passive: true, bonusAttribute: 'comando', bonusAmount: 3, requirement: 'Presença Intimidadora' },
  { name: 'Mestre da Corte', tree: 'social', tier: 3, description: 'Domina intrigas políticas. Sabe segredos de todos. +3 astúcia.', passive: true, bonusAttribute: 'astucia', bonusAmount: 3, requirement: 'Manipulador' },

  // SOBREVIVÊNCIA
  { name: 'Caçador', tree: 'sobrevivencia', tier: 1, description: 'Caça e rastreia. Nunca passa fome no campo.', passive: true, bonusAttribute: 'percepcao', bonusAmount: 1 },
  { name: 'Cavaleiro Nato', tree: 'sobrevivencia', tier: 1, description: 'Montaria excelente. Vantagem em combate montado.', passive: true, bonusAttribute: 'destreza', bonusAmount: 1 },
  { name: 'Curandeiro', tree: 'sobrevivencia', tier: 2, description: 'Trata ferimentos. Pode curar aliados fora de combate.', passive: false, bonusAttribute: 'percepcao', bonusAmount: 2, requirement: 'Caçador' },
  { name: 'Sobrevivente', tree: 'sobrevivencia', tier: 2, description: 'Resiste a frio, fome, veneno. +2 resistência.', passive: true, bonusAttribute: 'resistencia', bonusAmount: 2 },
  { name: 'Indestrutível', tree: 'sobrevivencia', tier: 3, description: 'Recusa morrer. Quando HP = 0, chance de se levantar.', passive: true, bonusAttribute: 'resistencia', bonusAmount: 3, requirement: 'Sobrevivente' },

  // CONHECIMENTO
  { name: 'Letrado', tree: 'conhecimento', tier: 1, description: 'Lê e escreve. Entende documentos, mapas, cartas.', passive: true, bonusAttribute: 'percepcao', bonusAmount: 1 },
  { name: 'Estrategista', tree: 'conhecimento', tier: 2, description: 'Planeja batalhas. +2 comando em manobras táticas.', passive: true, bonusAttribute: 'comando', bonusAmount: 2, requirement: 'Letrado' },
  { name: 'Poliglota', tree: 'conhecimento', tier: 2, description: 'Fala Valyriano, Dothraki, língua comum. Entende estrangeiros.', passive: true, bonusAttribute: 'astucia', bonusAmount: 2, requirement: 'Letrado' },
  { name: 'Mestre dos Sussurros', tree: 'conhecimento', tier: 3, description: 'Rede de espiões. Sabe o que acontece antes dos outros.', passive: true, bonusAttribute: 'percepcao', bonusAmount: 3, requirement: 'Estrategista' },
];

export type ItemRarity = 'comum' | 'bom' | 'raro' | 'valyrian' | 'lendário';

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  rarity?: ItemRarity;
  bonuses?: Array<{ attribute: Attribute; amount: number }>;
  equipped?: boolean;
}

export interface Relationship {
  id: string;
  name: string;
  house: string;
  affinity: number; // -100 a +100
  notes: string;
  romantic: boolean;
  portrait: string | null;
  milestones: string[];
  bondStage: string;
}

export interface CharacterSheet {
  name: string;
  age: number | null;
  house: House;
  customHouse: string | null;
  era: Era;
  tier: StartingTier;
  title: string;          // "Lord de Winterfell", "Cavaleiro sem terra", "Bastardo"
  background: string;
  appearance: string;
  personality: string;

  attributes: Record<Attribute, number>;
  level: number;
  xp: number;
  xpToNext: number;
  unspentPoints: number;

  hpMax: number;
  hp: number;
  stress: number;       // 0-100 (intriga aumenta stress)
  honor: number;        // -100 a +100 (tipo moralidade mas é honra)
  gold: number;         // dragões de ouro

  magic: MagicPower | null;
  techniques: Array<{ id: string; name: string; attribute: Attribute; description: string }>;
  skills: Skill[];
  inventory: InventoryItem[];

  // Status político
  lands: string[];      // terras que possui
  armies: number;       // soldados sob comando
  alliances: string[];  // casas aliadas
  enemies: string[];    // casas inimigas
  titles: string[];     // todos os títulos acumulados

  kills: number;
  nearDeaths: number;
  transformations: string[];
}

export interface WorldState {
  location: string;
  region: string;     // "O Norte", "Terras da Coroa", "Dorne", etc
  day: number;
  season: string;     // "verão", "outono", "inverno", "primavera"
  timeOfDay: string;
  weather: string;
  era: Era;
  flags: Record<string, string>;
  reputation: Record<string, number>;
  // Estado político do mundo
  currentKing: string;
  warStatus: string;  // "paz", "guerra civil", "invasão", etc
}

export type Turn = { role: 'player' | 'mestre'; text: string };

export interface Enemy {
  id: string;
  name: string;
  description: string;
  level: number;
  hp: number;
  hpMax: number;
  defeated: boolean;
}

export interface CombatState {
  active: boolean;
  round: number;
  enemies: Enemy[];
}

export interface Nemesis {
  id: string;
  name: string;
  house: string;
  description: string;
  motivation: string;
  level: number;
  encounters: number;
  playerWins: number;
  playerLosses: number;
  grudge: string;
  alive: boolean;
}

export interface Crossroad {
  prompt: string;
  options: string[];
}

export type QuestStatus = 'active' | 'completed' | 'failed';

export interface Quest {
  id: string;
  title: string;
  description: string;
  giver: string | null;
  status: QuestStatus;
}

export interface GameState {
  id: string;
  createdAt: string;
  updatedAt: string;
  tone: { mature: boolean; nsfw: boolean; fadeToBlack: boolean };
  character: CharacterSheet;
  world: WorldState;
  combat: CombatState | null;
  quests: Quest[];
  relationships: Relationship[];
  nemeses: Nemesis[];
  pendingCrossroad: Crossroad | null;
  chronicle: string;
  recentTurns: Turn[];
  turnCount: number;
  currentSceneNpcId: string | null;
}

export interface RollResult {
  attribute: Attribute;
  attributeLabel: string;
  d20: number;
  modifier: number;
  total: number;
  dc: number;
  success: boolean;
  critical: 'hit' | 'fail' | null;
  degree: string;
  reason: string;
}

// Estado do jogo — Bleach RPG

export type Attribute =
  | 'reiatsu'   // pressão espiritual, potência bruta
  | 'zanjutsu'  // combate com espada/zanpakuto
  | 'hakuda'    // combate corpo-a-corpo
  | 'hoho'      // velocidade/mobilidade (shunpo)
  | 'kido'      // feitiçaria, controle de energia
  | 'percepcao' // sentir reiatsu, instinto
  | 'vontade'   // espírito, resistência mental, gatilho de evolução
  | 'presenca'; // carisma, liderança, intimidação

export const ATTRIBUTES: Attribute[] = ['reiatsu', 'zanjutsu', 'hakuda', 'hoho', 'kido', 'percepcao', 'vontade', 'presenca'];

export const ATTRIBUTE_LABELS: Record<Attribute, string> = {
  reiatsu: 'Reiatsu', zanjutsu: 'Zanjutsu', hakuda: 'Hakuda', hoho: 'Hohō',
  kido: 'Kidō', percepcao: 'Percepção', vontade: 'Vontade', presenca: 'Presença',
};

// Raças jogáveis
export type Race = 'shinigami' | 'hollow' | 'quincy' | 'humano' | 'visored' | 'humano_puro';

export const RACE_LABELS: Record<Race, string> = {
  shinigami: 'Shinigami', hollow: 'Hollow / Arrancar', quincy: 'Quincy',
  humano: 'Humano / Fullbringer', visored: 'Visored', humano_puro: 'Humano Comum',
};

// Tier de início
export type StartingTier = 'novato' | 'veterano' | 'elite' | 'capitao';

// Estágios de poder por raça
export type PowerStage =
  | 'asauchi' | 'shikai' | 'bankai'                          // shinigami/visored
  | 'gillian' | 'adjuchas' | 'vasto_lorde' | 'arrancar' | 'resurreccion' // hollow
  | 'base' | 'avancado';                                      // quincy/humano

export const POWER_STAGE_PATH: Record<Race, PowerStage[]> = {
  shinigami: ['asauchi', 'shikai', 'bankai'],
  hollow: ['gillian', 'adjuchas', 'vasto_lorde', 'arrancar', 'resurreccion'],
  quincy: ['base', 'avancado'],
  humano: ['base', 'avancado'],
  visored: ['asauchi', 'shikai', 'bankai'],
  humano_puro: ['base'],
};

export interface Zanpakuto {
  name: string | null;
  spiritPersonality: string;
  releaseCommand: string | null;
  element: string;
  shikaiAbility: string | null;
  bankaiName: string | null;
  bankaiAbility: string | null;
}

export interface Resurreccion {
  zanpakutoName: string | null;
  releasePhrase: string | null;
  form: string | null;
  ability: string | null;
}

// Skills / técnicas
export type SkillTree = 'zanjutsu' | 'kido' | 'hoho' | 'hakuda' | 'hollow' | 'quincy' | 'social';

export interface Skill {
  id: string;
  name: string;
  tree: SkillTree;
  tier: number;
  description: string;
  bonusAttribute?: Attribute;
  bonusAmount?: number;
}

export const SKILL_CATALOG: Omit<Skill, 'id'>[] = [
  // ZANJUTSU
  { name: 'Golpe Preciso', tree: 'zanjutsu', tier: 1, description: 'Ataques de espada calculados. +1 zanjutsu.', bonusAttribute: 'zanjutsu', bonusAmount: 1 },
  { name: 'Nadegiri', tree: 'zanjutsu', tier: 2, description: 'Corte único e limpo capaz de partir ao meio. +2 zanjutsu.', bonusAttribute: 'zanjutsu', bonusAmount: 2 },
  { name: 'Mestre da Lâmina', tree: 'zanjutsu', tier: 3, description: 'Domínio total da espada. +3 zanjutsu, chance de crítico dobrada.', bonusAttribute: 'zanjutsu', bonusAmount: 3 },
  // KIDO
  { name: 'Hadō Básico', tree: 'kido', tier: 1, description: 'Feitiços de ataque até nº 30. +1 kidō.', bonusAttribute: 'kido', bonusAmount: 1 },
  { name: 'Bakudō Avançado', tree: 'kido', tier: 2, description: 'Feitiços de bloqueio poderosos. +2 kidō.', bonusAttribute: 'kido', bonusAmount: 2 },
  { name: 'Mestre do Kidō', tree: 'kido', tier: 3, description: 'Feitiços sem encantamento, nº 90+. +3 kidō.', bonusAttribute: 'kido', bonusAmount: 3 },
  // HOHO
  { name: 'Shunpo', tree: 'hoho', tier: 1, description: 'Passo relâmpago. +1 hohō, iniciativa em combate.', bonusAttribute: 'hoho', bonusAmount: 1 },
  { name: 'Utsusemi', tree: 'hoho', tier: 2, description: 'Deixa uma imagem residual ao esquivar. +2 hohō.', bonusAttribute: 'hoho', bonusAmount: 2 },
  { name: 'Deusa do Relâmpago', tree: 'hoho', tier: 3, description: 'Velocidade lendária, quase teleporte. +3 hohō.', bonusAttribute: 'hoho', bonusAmount: 3 },
  // HAKUDA
  { name: 'Combate Desarmado', tree: 'hakuda', tier: 1, description: 'Luta corpo-a-corpo eficaz. +1 hakuda.', bonusAttribute: 'hakuda', bonusAmount: 1 },
  { name: 'Ikkotsu', tree: 'hakuda', tier: 2, description: 'Soco de osso único devastador. +2 hakuda.', bonusAttribute: 'hakuda', bonusAmount: 2 },
  // HOLLOW
  { name: 'Cero', tree: 'hollow', tier: 1, description: 'Rajada de energia concentrada. +1 reiatsu.', bonusAttribute: 'reiatsu', bonusAmount: 1 },
  { name: 'Hierro', tree: 'hollow', tier: 2, description: 'Pele de aço endurecida por reiatsu. +2 resistência a dano.', bonusAttribute: 'reiatsu', bonusAmount: 2 },
  { name: 'Gran Rey Cero', tree: 'hollow', tier: 3, description: 'Cero de nível Espada, mistura sangue. +3 reiatsu.', bonusAttribute: 'reiatsu', bonusAmount: 3 },
  // QUINCY
  { name: 'Heilig Pfeil', tree: 'quincy', tier: 1, description: 'Flecha sagrada de reishi. +1 percepção.', bonusAttribute: 'percepcao', bonusAmount: 1 },
  { name: 'Blut', tree: 'quincy', tier: 2, description: 'Reishi corre nas veias — defesa e ataque. +2 resistência.', bonusAttribute: 'vontade', bonusAmount: 2 },
  // SOCIAL
  { name: 'Presença de Capitão', tree: 'social', tier: 2, description: 'Reiatsu que impõe respeito. +2 presença.', bonusAttribute: 'presenca', bonusAmount: 2 },
  { name: 'Sedutor Espiritual', tree: 'social', tier: 1, description: 'Carisma sobrenatural. +1 presença em interações íntimas.', bonusAttribute: 'presenca', bonusAmount: 1 },
];

export type ItemRarity = 'comum' | 'incomum' | 'raro' | 'épico' | 'lendário';

export interface InventoryItem {
  id: string; name: string; description: string; quantity: number;
  rarity?: ItemRarity; bonuses?: Array<{ attribute: Attribute; amount: number }>; equipped?: boolean;
}

export interface Relationship {
  id: string; name: string; faction: string; affinity: number;
  notes: string; romantic: boolean; portrait: string | null; milestones: string[]; bondStage: string;
}

export interface CharacterSheet {
  name: string; age: number | null; race: Race;
  hybridRaces: Race[]; // acumula raças (Ichigo-style)
  tier: StartingTier;
  background: string; appearance: string; personality: string;
  attributes: Record<Attribute, number>;
  level: number; xp: number; xpToNext: number; unspentPoints: number;
  hpMax: number; hp: number; reiryokuMax: number; reiryoku: number;
  stress: number; morality: number;
  powerStage: PowerStage;
  zanpakuto: Zanpakuto | null;
  hollowMask: string | null;
  resurreccion: Resurreccion | null;
  soulItem: string | null;       // quincy/fullbring
  signatureAbility: string | null;
  skills: Skill[];
  techniques: Array<{ id: string; name: string; attribute: Attribute; description: string; reiryokuCost: number }>;
  inventory: InventoryItem[];
  rank: string;
  transformations: string[];
  kills: number; nearDeaths: number;
  alliances: string[]; enemies: string[];
}

export interface WorldState {
  location: string; region: string; day: number; timeOfDay: string;
  flags: Record<string, string>; reputation: Record<string, number>;
}

export type Turn = { role: 'player' | 'mestre'; text: string };
export interface Enemy { id: string; name: string; description: string; level: number; hp: number; hpMax: number; defeated: boolean; }
export interface CombatState { active: boolean; round: number; enemies: Enemy[]; }
export interface Crossroad { prompt: string; options: string[]; }
export type QuestStatus = 'active' | 'completed' | 'failed';
export interface Quest { id: string; title: string; description: string; giver: string | null; status: QuestStatus; }

export interface GameState {
  id: string; createdAt: string; updatedAt: string;
  tone: { mature: boolean; nsfw: boolean; fadeToBlack: boolean };
  character: CharacterSheet; world: WorldState;
  combat: CombatState | null; quests: Quest[]; relationships: Relationship[];
  nemeses: any[]; pendingCrossroad: Crossroad | null;
  chronicle: string; recentTurns: Turn[]; turnCount: number; currentSceneNpcId: string | null;
}

export interface RollResult {
  attribute: Attribute; attributeLabel: string; d20: number; modifier: number;
  total: number; dc: number; success: boolean; critical: 'hit' | 'fail' | null; degree: string; reason: string;
}

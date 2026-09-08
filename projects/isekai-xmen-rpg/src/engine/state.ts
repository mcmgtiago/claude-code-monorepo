// Estado completo do jogo — o motor é dono dos números.
// A IA (Mestre) apenas narra e propõe mudanças via tools.

export type Attribute =
  | 'forca'      // força bruta, dano melee
  | 'velocidade' // reflexo, esquiva, iniciativa
  | 'resistencia'// HP, stamina, tanking
  | 'poder'      // potência do X-Gene, dano de habilidade
  | 'controle'   // precisão e refinamento do poder
  | 'percepcao'  // instinto, sentir mutantes, notar detalhes
  | 'vontade'    // resistência mental, gatilho de evolução
  | 'presenca';  // carisma, sedução, liderança, intimidação

export const ATTRIBUTES: Attribute[] = [
  'forca', 'velocidade', 'resistencia', 'poder',
  'controle', 'percepcao', 'vontade', 'presenca',
];

export const ATTRIBUTE_LABELS: Record<Attribute, string> = {
  forca: 'Força',
  velocidade: 'Velocidade',
  resistencia: 'Resistência',
  poder: 'Poder Mutante',
  controle: 'Controle',
  percepcao: 'Percepção',
  vontade: 'Vontade',
  presenca: 'Presença',
};

// Raças / origens jogáveis
export type Race =
  | 'humano_puro'  // sem poderes, pode despertar
  | 'mutante'      // X-Gene ativo
  | 'mutante_omega'// nível Omega (endgame)
  | 'hibrido';     // mais de um tipo de poder

export const RACE_LABELS: Record<Race, string> = {
  humano_puro: 'Humano Puro',
  mutante: 'Mutante',
  mutante_omega: 'Mutante Omega',
  hibrido: 'Híbrido',
};

// Tier de início (define a escala da aventura)
export type StartingTier = 'novato' | 'veterano' | 'elite' | 'omega';

// Estágio de evolução de poder
export type PowerStage =
  | 'dormente'     // humano puro, sem poder
  | 'despertar'    // primeiro uso, instável
  | 'base'         // controle básico
  | 'avancado'     // domínio, técnicas únicas
  | 'omega';       // poder de nível Jean Grey / Magneto

export interface Technique {
  id: string;
  name: string;
  attribute: Attribute;
  description: string;
  energyCost: number;
  unlockedAtLevel: number;
}

export interface XGenePower {
  /** Classe do poder (ou "personalizado" ou "nenhum") */
  class: string;
  /** Descrição do poder (livre, escrita pelo jogador ou gerada) */
  description: string;
  /** Elemento/tema (ex: "gelo", "telepatia", "sombras") */
  element: string;
  /** Habilidade principal */
  primaryAbility: string | null;
  /** Habilidade evoluída (desbloqueada em estágio avançado) */
  evolvedAbility: string | null;
  /** Fraqueza narrativa */
  weakness: string;
}

export type ItemRarity = 'comum' | 'incomum' | 'raro' | 'épico' | 'lendário';

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
  faction: string;
  affinity: number; // -100 a +100
  notes: string;
  romantic: boolean;
  portrait: string | null;
  milestones: string[];
  bondStage: string; // 'hostil' | 'frio' | 'neutro' | 'amigo' | 'confidente' | 'devoto'
}

export interface CharacterSheet {
  name: string;
  age: number | null;
  race: Race;
  tier: StartingTier;
  background: string;     // vida antes do transporte
  appearance: string;
  personality: string;

  attributes: Record<Attribute, number>; // 3..18
  level: number;
  xp: number;
  xpToNext: number;
  unspentPoints: number;

  hpMax: number;
  hp: number;
  energyMax: number;  // energia mutante
  energy: number;
  stress: number;     // 0-100

  morality: number;   // -100 a +100

  powerStage: PowerStage;
  xGene: XGenePower | null; // null se humano_puro
  techniques: Technique[];
  inventory: InventoryItem[];

  rank: string;       // posição no mundo (ex: "aluno Xavier's", "fugitivo")
  /** Histórico de transformações */
  transformations: string[];

  // Tracking
  kills: number;
  nearDeaths: number; // quase morreu
  alliances: string[]; // facções aliadas
  enemies: string[];   // facções inimigas
  powerHistory: string[]; // log de evoluções de poder
  combatStyle: string; // agressivo, defensivo, furtivo, tático
}

export interface WorldState {
  location: string;
  region: string;
  day: number;
  timeOfDay: string;
  weather: string;
  flags: Record<string, string>;
  reputation: Record<string, number>; // facção -> rep
}

export type Turn = {
  role: 'player' | 'mestre';
  text: string;
};

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
  faction: string;
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

// Estado completo de uma partida
export interface GameState {
  id: string;
  createdAt: string;
  updatedAt: string;
  tone: {
    mature: boolean;
    nsfw: boolean;       // cenas explícitas
    fadeToBlack: boolean; // se true, corta antes do explícito
  };
  character: CharacterSheet;
  world: WorldState;
  combat: CombatState | null;
  quests: Quest[];
  relationships: Relationship[];
  nemeses: Nemesis[];
  pendingCrossroad: Crossroad | null;
  /** Resumo dos eventos passados (memória de longo prazo) */
  chronicle: string;
  /** Cenas recentes na íntegra (memória de curto prazo) */
  recentTurns: Turn[];
  turnCount: number;
  /** NPC atualmente em cena (para UI de diálogo) */
  currentSceneNpcId: string | null;
}

// Resultado de rolagem
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

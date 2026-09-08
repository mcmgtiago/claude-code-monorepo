// Estado genérico do jogo — funciona pra qualquer universo.
// Atributos são dinâmicos (Record<string, number>) baseados no universo.

export interface Skill {
  id: string; name: string; tree: string; tier: number; description: string;
  bonusAttribute?: string; bonusAmount?: number;
}

export interface InventoryItem {
  id: string; name: string; description: string; quantity: number;
  rarity?: string; bonuses?: Array<{ attribute: string; amount: number }>; equipped?: boolean;
}

export interface Relationship {
  id: string; name: string; faction: string; affinity: number;
  notes: string; romantic: boolean; portrait: string | null; milestones: string[]; bondStage: string;
}

export interface PowerInfo {
  type: string;          // classe/tipo do poder
  description: string;
  element: string;
  primaryAbility: string | null;
  evolvedAbility: string | null;
  weakness: string;
}

export interface CharacterSheet {
  name: string;
  age: number | null;
  sex: 'masculino' | 'feminino';
  universeId: string;
  powerType: string;     // ex "mutante", "shinigami", "com_magia"
  tier: string;
  background: string;
  appearance: string;
  personality: string;

  attributes: Record<string, number>;
  level: number;
  xp: number;
  xpToNext: number;
  unspentPoints: number;

  hpMax: number; hp: number;
  energyMax: number; energy: number; // energia genérica (reiryoku, mana, mutant energy)
  stress: number;
  morality: number;      // -100 a +100

  powerStage: string;    // dormente, despertar, base, avancado, omega (genérico)
  power: PowerInfo | null;
  skills: Skill[];
  techniques: Array<{ id: string; name: string; attribute: string; description: string }>;
  inventory: InventoryItem[];

  rank: string;
  transformations: string[];
  powerHistory: string[];

  kills: number; nearDeaths: number;
  alliances: string[]; enemies: string[];

  fastGrowth: boolean;   // ascensão rápida (XP multiplicado)
}

export interface WorldState {
  location: string; region: string; day: number; timeOfDay: string; weather: string;
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
  universeId: string;
  tone: { mature: boolean; nsfw: boolean; fadeToBlack: boolean };
  character: CharacterSheet;
  world: WorldState;
  combat: CombatState | null;
  quests: Quest[];
  relationships: Relationship[];
  pendingCrossroad: Crossroad | null;
  chronicle: string;
  recentTurns: Turn[];
  turnCount: number;
  currentSceneNpcId: string | null;
  deepMemory: { facts: any[]; npcCards: any[] }; // memória profunda
}

export interface RollResult {
  attribute: string; attributeLabel: string; d20: number; modifier: number;
  total: number; dc: number; success: boolean; critical: 'hit' | 'fail' | null; degree: string; reason: string;
}

// Estado do jogo — Bridgerton RPG
// Romance Regência, intriga social, escândalos, sedução, poder político via casamento

export type Attribute =
  | 'elegancia'   // comportamento, etiqueta, dança, postura
  | 'beleza'      // atratividade física, presença visual
  | 'astucia'     // manipulação, mentiras, intrigas, fofoca
  | 'carisma'     // charme, conversação, wit, humor
  | 'seducao'     // flerte, tensão sexual, provocação, intimidade
  | 'vontade'     // resistir escândalos, pressão social, tentações
  | 'conhecimento'// literatura, música, artes, idiomas, política
  | 'coragem';    // desafiar normas, enfrentar a sociedade, escândalos públicos

export const ATTRIBUTES: Attribute[] = ['elegancia', 'beleza', 'astucia', 'carisma', 'seducao', 'vontade', 'conhecimento', 'coragem'];

export const ATTRIBUTE_LABELS: Record<Attribute, string> = {
  elegancia: 'Elegância', beleza: 'Beleza', astucia: 'Astúcia', carisma: 'Carisma',
  seducao: 'Sedução', vontade: 'Vontade', conhecimento: 'Conhecimento', coragem: 'Coragem',
};

// Status social
export type SocialClass = 'serva' | 'comerciante' | 'gentry' | 'visconde' | 'duque' | 'realeza';

export const CLASS_LABELS: Record<SocialClass, string> = {
  serva: 'Serva / Criada', comerciante: 'Comerciante', gentry: 'Gentry (pequena nobreza)',
  visconde: 'Visconde / Barão', duque: 'Duque / Marquês', realeza: 'Realeza',
};

// Reputação social (recurso principal em Bridgerton)
export type ReputationStatus = 'arruinada' | 'manchada' | 'questionável' | 'respeitável' | 'impecável' | 'diamante';

export interface Skill {
  id: string; name: string; tree: string; tier: number; description: string;
  bonusAttribute?: Attribute; bonusAmount?: number;
}

export const SKILL_CATALOG: Omit<Skill, 'id'>[] = [
  // SEDUÇÃO
  { name: 'Olhar que Derrete', tree: 'seducao', tier: 1, description: 'Um olhar que faz corações dispararem. +1 sedução.', bonusAttribute: 'seducao', bonusAmount: 1 },
  { name: 'Toque Acidental', tree: 'seducao', tier: 1, description: 'Mestre em toques que parecem inocentes. +1 sedução.', bonusAttribute: 'seducao', bonusAmount: 1 },
  { name: 'Beijo Proibido', tree: 'seducao', tier: 2, description: 'Sabe quando e onde roubar um beijo sem ser vista. +2 sedução.', bonusAttribute: 'seducao', bonusAmount: 2 },
  { name: 'Amante Irresistível', tree: 'seducao', tier: 3, description: 'Ninguém resiste. Até casados vacilam. +3 sedução.', bonusAttribute: 'seducao', bonusAmount: 3 },
  // INTRIGA
  { name: 'Fofoqueira', tree: 'intriga', tier: 1, description: 'Sabe todos os segredos do ton. +1 astúcia.', bonusAttribute: 'astucia', bonusAmount: 1 },
  { name: 'Chantagem Sutil', tree: 'intriga', tier: 2, description: 'Usa segredos como arma sem deixar rastro. +2 astúcia.', bonusAttribute: 'astucia', bonusAmount: 2 },
  { name: 'Lady Whistledown', tree: 'intriga', tier: 3, description: 'Controla a narrativa pública. Uma palavra sua arruina vidas. +3 astúcia.', bonusAttribute: 'astucia', bonusAmount: 3 },
  // SOCIEDADE
  { name: 'Dança Perfeita', tree: 'sociedade', tier: 1, description: 'Valsa impecável. Todos param pra olhar. +1 elegância.', bonusAttribute: 'elegancia', bonusAmount: 1 },
  { name: 'Conversação Brilhante', tree: 'sociedade', tier: 1, description: 'Wit afiado. Arranca risos e suspiros. +1 carisma.', bonusAttribute: 'carisma', bonusAmount: 1 },
  { name: 'Entrada Triunfal', tree: 'sociedade', tier: 2, description: 'Quando você entra, todos viram. +2 beleza.', bonusAttribute: 'beleza', bonusAmount: 2 },
  { name: 'Diamante da Temporada', tree: 'sociedade', tier: 3, description: 'A rainha te nomeou. Você É a temporada. +3 carisma.', bonusAttribute: 'carisma', bonusAmount: 3 },
  // CORAGEM
  { name: 'Escândalo Controlado', tree: 'coragem', tier: 1, description: 'Sabe provocar escândalo sem se destruir. +1 coragem.', bonusAttribute: 'coragem', bonusAmount: 1 },
  { name: 'Desafiar a Rainha', tree: 'coragem', tier: 3, description: 'Não teme ninguém. Nem a coroa. +3 coragem.', bonusAttribute: 'coragem', bonusAmount: 3 },
];

export type ItemRarity = 'simples' | 'fino' | 'luxuoso' | 'real';

export interface InventoryItem {
  id: string; name: string; description: string; quantity: number; rarity?: ItemRarity;
}

export interface Relationship {
  id: string; name: string; family: string; affinity: number;
  notes: string; romantic: boolean; portrait: string | null; milestones: string[]; bondStage: string;
  courtship: boolean; // em cortejo ativo
  scandal: boolean;   // envolvido em escândalo junto
}

export interface CharacterSheet {
  name: string; age: number | null; sex: 'feminino' | 'masculino';
  socialClass: SocialClass; family: string;
  title: string; background: string; appearance: string; personality: string;
  attributes: Record<Attribute, number>;
  level: number; xp: number; xpToNext: number; unspentPoints: number;
  reputation: number;  // -100 (arruinada) a +100 (diamante)
  wealth: number;      // libras
  stress: number;      // pressão social
  scandal: number;     // 0-100, quanto mais alto mais próximo de arruinar
  skills: Skill[];
  inventory: InventoryItem[];
  suitors: string[];   // pretendentes ativos
  secrets: string[];   // segredos que guarda
  titles: string[];
  kills: number; nearDeaths: number; alliances: string[]; enemies: string[];
}

export interface WorldState {
  location: string; region: string; day: number; season: string; timeOfDay: string;
  flags: Record<string, string>; reputation: Record<string, number>;
  currentSeason: string; // "temporada social de 1813"
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

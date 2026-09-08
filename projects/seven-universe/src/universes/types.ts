// Tipo que define um universo jogável. Cada universo (X-Men, GoT, etc)
// exporta um objeto Universe com toda sua config específica.

export interface AttributeDef {
  key: string;
  label: string;
  short: string; // 3 letras
}

export interface TierDef {
  key: string;
  label: string;
  desc: string;
  budget: number; // pontos de atributo
  startLevel: number;
}

export interface PowerType {
  key: string;
  label: string;
  desc: string;
}

export interface Scenario {
  id: string;
  emoji: string;
  title: string;
  setup: string;
  mode: 'any' | 'adventure' | 'adult';
}

export interface SkillDef {
  name: string;
  tree: string;
  tier: number;
  description: string;
  bonusAttribute?: string;
  bonusAmount?: number;
}

// Ficha de NPC canônico do universo. Injetada no contexto quando o NPC
// aparece, pra IA manter coerência (aparência, personalidade, agenda fixas).
export interface CanonNPC {
  id: string;
  name: string;
  faction: string;           // a que grupo/família pertence
  role: string;              // papel no mundo ("Visconde Bridgerton", "Rainha")
  appearance: string;        // descrição física fixa
  personality: string;       // traços de caráter (ambicioso, sarcástico, maternal)
  agenda: string;            // o que quer / persegue nesta temporada
  secret?: string;           // segredo que a IA pode revelar aos poucos
  speech?: string;           // como fala (tom, maneirismos, sotaque)
  powerLevel?: number;       // 1-100, quão perigoso/poderoso/influente
  // Escalabilidade (100+ NPCs): controla injeção seletiva no prompt.
  tier?: 'major' | 'minor';  // major = sempre no contexto; minor = só quando relevante. Ausente = major.
  locations?: string[];      // regiões/locais onde tende a estar (match com world.location/region)
  tags?: string[];           // "combate","social","noite","vilao" — matching por contexto de cena
}

// Tabelas para geração procedural de NPCs menores sob demanda.
// Cada universo exporta um NpcTables pra povoar o mundo infinitamente.
export interface NpcTables {
  names: string[];                    // pool de nomes temáticos do universo
  roles: string[];                    // papéis comuns (mercador, guarda, civil...)
  traits: string[];                   // traços de personalidade (calmo, ganancioso...)
  appearance: {
    build: string[];                  // compleição física
    hair: string[];                   // cabelo
    clothing: string[];               // roupa típica do universo
    detail: string[];                 // marca/detalhe distintivo
  };
}

export interface Universe {
  id: string;
  name: string;              // "Isekai X-Men"
  tagline: string;           // "Um mundo de mutantes"
  emoji: string;
  theme: {
    accent: string;          // cor de destaque (tailwind class)
    accentHex: string;
  };

  attributes: AttributeDef[];
  tiers: TierDef[];
  powerTypes: PowerType[];    // "Mutante"/"Humano", "Shinigami"/"Hollow", etc
  powerLabel: string;         // "Mutação", "Zanpakutō", "Magia"
  hasPowerGenerator: boolean; // se permite gerar poder custom via IA

  skills: SkillDef[];
  scenarios: Scenario[];
  npcs?: CanonNPC[];          // banco de NPCs canônicos (major + minor)
  npcTables?: NpcTables;      // tabelas pra geração procedural de NPCs menores

  // Textos pro system prompt
  systemPromptLore: string;   // toda a lore do mundo
  isekaiIntro: string;        // como o transporte funciona neste mundo

  // Imagem
  imageStyle: string;         // prompt style pra geração de imagem
}

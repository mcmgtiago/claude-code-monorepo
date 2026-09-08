// Memória profunda: banco de fatos estruturados + fichas de NPC persistentes.
// A IA nunca esquece o que importa.

export interface Fact {
  id: string;
  category: 'npc' | 'event' | 'location' | 'secret' | 'promise' | 'threat' | 'relationship';
  subject: string;
  content: string;
  turn: number;
  importance: number; // 1-10
  relatedNpcs: string[];
}

export interface NpcCard {
  id: string;
  name: string;
  faction: string;
  appearance: string;
  personality: string;
  currentMood: string;
  agenda: string;
  knowsAboutPlayer: string[];
  lastSeen: { turn: number; location: string };
  history: string[];
}

export interface DeepMemory {
  facts: Fact[];
  npcCards: NpcCard[];
}

export function createDeepMemory(): DeepMemory {
  return { facts: [], npcCards: [] };
}

/** Adiciona fato, evitando duplicatas por conteúdo similar */
export function addFact(mem: DeepMemory, fact: Omit<Fact, 'id'>): void {
  const norm = fact.content.trim().slice(0, 60).toLowerCase();
  if (mem.facts.some(f => f.content.trim().slice(0, 60).toLowerCase() === norm)) return;
  mem.facts.push({ ...fact, id: crypto.randomUUID() });
  // Limita a 200 fatos — remove os menos importantes e mais antigos
  if (mem.facts.length > 200) {
    mem.facts.sort((a, b) => (b.importance * 100 + b.turn) - (a.importance * 100 + a.turn));
    mem.facts = mem.facts.slice(0, 200);
  }
}

/** Adiciona ou atualiza NPC card */
export function upsertNpc(mem: DeepMemory, npc: Partial<NpcCard> & { name: string }, turn: number, location: string): void {
  let card = mem.npcCards.find(c => c.name.toLowerCase() === npc.name.toLowerCase());
  if (card) {
    if (npc.faction) card.faction = npc.faction;
    if (npc.appearance) card.appearance = npc.appearance;
    if (npc.personality) card.personality = npc.personality;
    if (npc.currentMood) card.currentMood = npc.currentMood;
    if (npc.agenda) card.agenda = npc.agenda;
    if (npc.knowsAboutPlayer) card.knowsAboutPlayer.push(...npc.knowsAboutPlayer);
    card.lastSeen = { turn, location };
  } else {
    mem.npcCards.push({
      id: crypto.randomUUID(), name: npc.name, faction: npc.faction || 'desconhecida',
      appearance: npc.appearance || '', personality: npc.personality || '',
      currentMood: npc.currentMood || 'neutro', agenda: npc.agenda || '',
      knowsAboutPlayer: npc.knowsAboutPlayer || [], lastSeen: { turn, location }, history: [],
    });
  }
}

/** Seleciona fatos relevantes pro contexto atual */
export function selectRelevantFacts(mem: DeepMemory, currentNpcs: string[], location: string, maxFacts = 25): Fact[] {
  const scored = mem.facts.map(f => {
    let score = f.importance;
    if (currentNpcs.some(n => f.relatedNpcs.some(rn => rn.toLowerCase().includes(n.toLowerCase())))) score += 5;
    if (f.subject.toLowerCase().includes(location.toLowerCase())) score += 3;
    if (f.category === 'promise' || f.category === 'threat' || f.category === 'secret') score += 2;
    return { f, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxFacts).map(s => s.f);
}

/** Formata memória pro prompt */
export function formatDeepMemory(mem: DeepMemory, currentNpcs: string[], location: string): string {
  const facts = selectRelevantFacts(mem, currentNpcs, location);
  const relevantNpcs = mem.npcCards.filter(c =>
    currentNpcs.some(n => c.name.toLowerCase().includes(n.toLowerCase())) ||
    c.lastSeen.location === location
  ).slice(0, 8);

  let out = '';
  if (facts.length > 0) {
    out += '## FATOS QUE VOCÊ LEMBRA (mantenha coerência com TODOS):\n';
    out += facts.map(f => `- [${f.category}] ${f.content}`).join('\n');
  }
  if (relevantNpcs.length > 0) {
    out += '\n\n## NPCs CONHECIDOS (fichas — respeite personalidade e agenda):\n';
    out += relevantNpcs.map(c => `- **${c.name}** (${c.faction}): ${c.personality || 'sem descrição'}. Humor: ${c.currentMood}. Quer: ${c.agenda || 'indefinido'}. ${c.knowsAboutPlayer.length ? 'Sabe sobre você: ' + c.knowsAboutPlayer.join('; ') : ''}`).join('\n');
  }
  return out;
}

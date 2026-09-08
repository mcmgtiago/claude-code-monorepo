// Seleção seletiva de NPCs canônicos + geração procedural de NPCs menores.
// Resolve o problema de escala: 100+ NPCs por universo sem explodir o prompt.
//
// Estratégia:
//   - NPCs `major` (ou sem tier): sempre no contexto (referência de tom).
//   - NPCs `minor`: só entram quando relevantes à cena (local, facção, presença, tag).
//   - Quando o player está num local sem NPCs conhecidos, gera menores procedurais.

import type { CanonNPC, NpcTables, Universe } from '../universes/types';
import type { GameState } from './state';
import { upsertNpc, type DeepMemory, type NpcCard } from './memory-deep';

/**
 * Seleciona os NPCs canônicos relevantes ao turno atual.
 * Majors sempre entram; minors são pontuados e cortados no limite.
 */
export function selectCanonNpcs(all: CanonNPC[] | undefined, state: GameState, max = 15): CanonNPC[] {
  if (!all || all.length === 0) return [];

  const loc = (state.world.location || '').toLowerCase();
  const region = (state.world.region || '').toLowerCase();
  const time = (state.world.timeOfDay || '').toLowerCase();
  const inCombat = !!state.combat?.active;
  const knownNames = new Set(state.relationships.map(r => r.name.toLowerCase()));
  const activeFactions = new Set(
    Object.keys(state.world.reputation || {}).map(f => f.toLowerCase())
  );

  const majors: CanonNPC[] = [];
  const scoredMinors: Array<{ npc: CanonNPC; score: number }> = [];

  for (const npc of all) {
    const isMinor = npc.tier === 'minor';
    if (!isMinor) {
      majors.push(npc);
      continue;
    }
    // Pontua minors por relevância ao contexto
    let score = 0;
    if (knownNames.has(npc.name.toLowerCase())) score += 5; // já interagiu
    if (npc.locations?.some(l => {
      const ll = l.toLowerCase();
      return (loc && (ll.includes(loc) || loc.includes(ll))) ||
             (region && (ll.includes(region) || region.includes(ll)));
    })) score += 4;
    if (npc.faction && activeFactions.has(npc.faction.toLowerCase())) score += 3;
    if (npc.tags?.length) {
      if (inCombat && npc.tags.includes('combate')) score += 2;
      if ((time.includes('noite') || time.includes('madrugada')) && npc.tags.includes('noite')) score += 2;
    }
    if (score > 0) scoredMinors.push({ npc, score });
  }

  // Ordena minors por score desc; preenche até o limite após os majors.
  scoredMinors.sort((a, b) => b.score - a.score);
  const slotsForMinors = Math.max(0, max - majors.length);
  const chosenMinors = scoredMinors.slice(0, slotsForMinors).map(s => s.npc);

  return [...majors, ...chosenMinors];
}

/** Formata os NPCs selecionados pro system prompt (compacto). */
export function formatCanonNpcs(npcs: CanonNPC[]): string {
  if (npcs.length === 0) return '';
  const lines = npcs.map(n => {
    const secret = n.secret ? ` | Segredo: ${n.secret}` : '';
    const speech = n.speech ? ` | Fala: ${n.speech}` : '';
    const power = n.powerLevel != null ? `, poder ${n.powerLevel}` : '';
    return `**${n.name}** (${n.role}, ${n.faction}${power}): ${n.appearance} | Personalidade: ${n.personality} | Agenda: ${n.agenda}${secret}${speech}`;
  });
  return `\n## NPCs CANÔNICOS (Personalidade fixa — use como referência)\n${lines.join('\n')}\n`;
}

// --- Geração procedural de NPCs menores -------------------------------------

/** PRNG determinístico (mulberry32) — seed derivada do estado, sem Math.random. */
function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hash simples de string → int, pra derivar seed estável de local/turno. */
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(arr: T[], rnd: () => number): T {
  return arr[Math.floor(rnd() * arr.length)];
}

/**
 * Gera NPCs menores procedurais coerentes com o universo e o local atual.
 * Determinístico: mesmo local + mesmo turno = mesmos NPCs (saves consistentes).
 */
export function generateMinorNpcs(universe: Universe, state: GameState, count = 3): NpcCard[] {
  const tables = universe.npcTables;
  if (!tables) return [];

  const loc = state.world.location || 'Lugar desconhecido';
  const seedBase = hashStr(`${universe.id}:${loc}:${state.world.day}`);
  const factions = universe.powerTypes.map(p => p.label);

  const out: NpcCard[] = [];
  for (let i = 0; i < count; i++) {
    const rnd = seededRandom(seedBase + i * 7919);
    const name = pick(tables.names, rnd);
    const role = pick(tables.roles, rnd);
    const trait1 = pick(tables.traits, rnd);
    const trait2 = pick(tables.traits, rnd);
    const build = pick(tables.appearance.build, rnd);
    const hair = pick(tables.appearance.hair, rnd);
    const clothing = pick(tables.appearance.clothing, rnd);
    const detail = pick(tables.appearance.detail, rnd);
    const faction = factions.length ? pick(factions, rnd) : 'local';

    out.push({
      id: `proc-${seedBase}-${i}`,
      name,
      faction,
      appearance: `${build}, ${hair}, ${clothing}. ${detail}.`,
      personality: `${trait1}, ${trait2}`,
      currentMood: 'neutro',
      agenda: `Sobreviver como ${role} em ${loc}`,
      knowsAboutPlayer: [],
      lastSeen: { turn: state.turnCount, location: loc },
      history: [],
    });
  }
  return out;
}

/**
 * Se o local atual não tem NPCs conhecidos (canônicos ou já-vistos),
 * gera menores procedurais e salva no deepMemory. Chamado no game loop.
 */
export function populateLocationIfEmpty(universe: Universe, state: GameState, mem: DeepMemory): string[] {
  const loc = (state.world.location || '').toLowerCase();
  if (!loc) return [];

  // Já há NPCs (canônicos com locations batendo, ou cards salvos aqui)?
  const hasCanonHere = (universe.npcs || []).some(n =>
    n.locations?.some(l => l.toLowerCase().includes(loc) || loc.includes(l.toLowerCase()))
  );
  const hasCardHere = mem.npcCards.some(c => (c.lastSeen.location || '').toLowerCase() === loc);
  if (hasCanonHere || hasCardHere) return [];

  const generated = generateMinorNpcs(universe, state, 3);
  const names: string[] = [];
  for (const npc of generated) {
    upsertNpc(mem, npc, state.turnCount, state.world.location);
    names.push(npc.name);
  }
  return names;
}

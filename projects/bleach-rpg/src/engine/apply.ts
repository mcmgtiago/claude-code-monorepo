import type { GameState } from './state';
import { computeHpMax, computeReiryokuMax, xpForLevel } from './rules';
import { SKILL_CATALOG } from './state';

export function applyChanges(state: GameState, input: any): string[] {
  const log: string[] = []; const c = state.character; const w = state.world;
  if (input.hp_delta) { c.hp = Math.max(0, Math.min(c.hpMax, c.hp + input.hp_delta)); log.push(`HP ${input.hp_delta > 0 ? '+' : ''}${input.hp_delta} → ${c.hp}/${c.hpMax}`); }
  if (input.reiryoku_delta) { c.reiryoku = Math.max(0, Math.min(c.reiryokuMax, c.reiryoku + input.reiryoku_delta)); log.push(`Reiryoku ${input.reiryoku_delta > 0 ? '+' : ''}${input.reiryoku_delta}`); }
  if (input.stress_delta) { c.stress = Math.max(0, Math.min(100, c.stress + input.stress_delta)); }
  if (input.morality_delta) { c.morality = Math.max(-100, Math.min(100, c.morality + input.morality_delta)); }
  if (input.xp_gain && input.xp_gain > 0) {
    c.xp += input.xp_gain; log.push(`+${input.xp_gain} XP`);
    while (c.xp >= c.xpToNext && c.level < 50) { c.xp -= c.xpToNext; c.level++; c.xpToNext = xpForLevel(c.level); c.hpMax = computeHpMax(c); c.hp = c.hpMax; c.reiryokuMax = computeReiryokuMax(c); c.reiryoku = c.reiryokuMax; if (c.level % 2 === 0) c.unspentPoints++; log.push(`⬆️ Nível ${c.level}!`); }
  }
  if (input.location) { w.location = input.location; log.push(`📍 ${input.location}`); }
  if (input.region) w.region = input.region;
  if (input.time_of_day) w.timeOfDay = input.time_of_day;
  if (input.day_delta) { w.day += input.day_delta; }
  if (input.rank) { c.rank = input.rank; log.push(`Rank: ${input.rank}`); }
  if (input.learn_techniques) { for (const t of input.learn_techniques) { c.techniques.push({ id: t.id || crypto.randomUUID(), name: t.name, attribute: t.attribute, description: t.description, reiryokuCost: t.reiryoku_cost || 0 }); log.push(`🆕 ${t.name}`); } }
  if (input.add_items) { for (const item of input.add_items) { c.inventory.push({ id: crypto.randomUUID(), name: item.name, description: item.description, quantity: item.quantity ?? 1, rarity: item.rarity, equipped: false }); log.push(`📦 +${item.name}`); } }
  if (input.reputation_changes) { for (const rep of input.reputation_changes) { w.reputation[rep.faction] = Math.max(-100, Math.min(100, (w.reputation[rep.faction] ?? 0) + rep.delta)); } }
  if (input.relationships) {
    for (const rel of input.relationships) {
      const existing = rel.id ? state.relationships.find(r => r.id === rel.id) : rel.name ? state.relationships.find(r => r.name.toLowerCase() === rel.name.toLowerCase()) : null;
      if (existing) { if (rel.affinity_delta) existing.affinity = Math.max(-100, Math.min(100, existing.affinity + rel.affinity_delta)); if (rel.notes) existing.notes = rel.notes; if (rel.romantic !== undefined) existing.romantic = rel.romantic; if (rel.milestone) existing.milestones.push(rel.milestone); existing.bondStage = bondStage(existing.affinity); }
      else if (rel.name) { state.relationships.push({ id: crypto.randomUUID(), name: rel.name, faction: rel.faction ?? '', affinity: rel.affinity_delta ?? 0, notes: rel.notes ?? '', romantic: rel.romantic ?? false, portrait: null, milestones: rel.milestone ? [rel.milestone] : [], bondStage: bondStage(rel.affinity_delta ?? 0) }); log.push(`👤 ${rel.name}`); }
    }
  }
  if (input.set_flags) Object.assign(w.flags, input.set_flags);
  if (input.scene_npc !== undefined) state.currentSceneNpcId = input.scene_npc;
  state.updatedAt = new Date().toISOString();
  return log;
}

function bondStage(a: number): string { if (a <= -60) return 'inimigo'; if (a <= -20) return 'rival'; if (a <= 20) return 'neutro'; if (a <= 50) return 'aliado'; if (a <= 80) return 'amigo'; return 'devoto'; }

export function handleLearnSkill(state: GameState, input: any): string {
  const c = state.character;
  if (c.skills.find(s => s.name.toLowerCase() === input.skill_name.toLowerCase())) return `Já conhece: ${input.skill_name}`;
  const cat = SKILL_CATALOG.find(s => s.name.toLowerCase() === input.skill_name.toLowerCase());
  const skill = cat ? { ...cat, id: crypto.randomUUID() } : { id: crypto.randomUUID(), name: input.skill_name, tree: input.tree, tier: 1, description: input.reason };
  c.skills.push(skill as any);
  return `${input.skill_name} (${input.tree})`;
}

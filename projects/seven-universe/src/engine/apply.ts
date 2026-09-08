import type { GameState } from './state';
import { computeHpMax, computeEnergyMax, xpForLevel } from './rules';
import { upsertNpc } from './memory-deep';

export function applyChanges(state: GameState, input: any): string[] {
  const log: string[] = []; const c = state.character; const w = state.world;
  if (input.hp_delta) { c.hp = Math.max(0, Math.min(c.hpMax, c.hp + input.hp_delta)); log.push(`HP ${input.hp_delta > 0 ? '+' : ''}${input.hp_delta} → ${c.hp}/${c.hpMax}`); }
  if (input.energy_delta) { c.energy = Math.max(0, Math.min(c.energyMax, c.energy + input.energy_delta)); }
  if (input.stress_delta) { c.stress = Math.max(0, Math.min(100, c.stress + input.stress_delta)); }
  if (input.morality_delta) { c.morality = Math.max(-100, Math.min(100, c.morality + input.morality_delta)); log.push(`Moral ${input.morality_delta > 0 ? '+' : ''}${input.morality_delta}`); }
  if (input.xp_gain && input.xp_gain > 0) {
    const gain = c.fastGrowth ? input.xp_gain * 3 : input.xp_gain;
    c.xp += gain; log.push(`+${gain} XP`);
    while (c.xp >= c.xpToNext && c.level < 50) { c.xp -= c.xpToNext; c.level++; c.xpToNext = xpForLevel(c.level); c.hpMax = computeHpMax(c); c.hp = c.hpMax; c.energyMax = computeEnergyMax(c); c.energy = c.energyMax; if (c.level % 2 === 0) c.unspentPoints++; log.push(`⬆️ Nível ${c.level}!`); }
  }
  if (input.location) { w.location = input.location; log.push(`📍 ${input.location}`); }
  if (input.region) w.region = input.region;
  if (input.time_of_day) w.timeOfDay = input.time_of_day;
  if (input.weather) w.weather = input.weather;
  if (input.day_delta) w.day += input.day_delta;
  if (input.rank) { c.rank = input.rank; log.push(`${input.rank}`); }
  if (input.add_alliance && !c.alliances.includes(input.add_alliance)) { c.alliances.push(input.add_alliance); log.push(`🤝 ${input.add_alliance}`); }
  if (input.add_enemy && !c.enemies.includes(input.add_enemy)) { c.enemies.push(input.add_enemy); log.push(`⚔️ ${input.add_enemy}`); }
  if (input.learn_techniques) { for (const t of input.learn_techniques) { c.techniques.push({ id: t.id || crypto.randomUUID(), name: t.name, attribute: t.attribute, description: t.description }); log.push(`🆕 ${t.name}`); } }
  if (input.add_items) { for (const item of input.add_items) { c.inventory.push({ id: crypto.randomUUID(), name: item.name, description: item.description, quantity: item.quantity ?? 1, rarity: item.rarity, equipped: false }); log.push(`📦 +${item.name}`); } }
  if (input.reputation_changes) { for (const rep of input.reputation_changes) { w.reputation[rep.faction] = Math.max(-100, Math.min(100, (w.reputation[rep.faction] ?? 0) + rep.delta)); } }
  if (input.relationships) {
    for (const rel of input.relationships) {
      const existing = rel.id ? state.relationships.find(r => r.id === rel.id) : rel.name ? state.relationships.find(r => r.name.toLowerCase() === rel.name.toLowerCase()) : null;
      if (existing) { if (rel.affinity_delta) existing.affinity = Math.max(-100, Math.min(100, existing.affinity + rel.affinity_delta)); if (rel.notes) existing.notes = rel.notes; if (rel.romantic !== undefined) existing.romantic = rel.romantic; if (rel.milestone) existing.milestones.push(rel.milestone); existing.bondStage = bondStage(existing.affinity); }
      else if (rel.name) { state.relationships.push({ id: crypto.randomUUID(), name: rel.name, faction: rel.faction ?? '', affinity: rel.affinity_delta ?? 0, notes: rel.notes ?? '', romantic: rel.romantic ?? false, portrait: null, milestones: rel.milestone ? [rel.milestone] : [], bondStage: bondStage(rel.affinity_delta ?? 0) }); log.push(`👤 ${rel.name}`); if (state.deepMemory) upsertNpc(state.deepMemory, { name: rel.name, faction: rel.faction || '', personality: rel.notes || '' }, state.turnCount, w.location); }
    }
  }
  if (input.set_flags) Object.assign(w.flags, input.set_flags);
  if (input.scene_npc !== undefined) state.currentSceneNpcId = input.scene_npc;
  if (input.advance_power_stage) {
    const stages = ['dormente', 'despertar', 'base', 'avancado', 'omega'];
    const idx = stages.indexOf(c.powerStage); if (idx < stages.length - 1) { c.powerStage = stages[idx + 1]; c.hpMax += 10; c.hp = c.hpMax; c.energyMax += 15; c.energy = c.energyMax; c.powerHistory.push(`${stages[idx]} → ${c.powerStage}`); log.push(`⚡ ${c.powerStage}!`); }
  }
  state.updatedAt = new Date().toISOString();
  return log;
}

function bondStage(a: number): string { if (a <= -60) return 'inimigo'; if (a <= -20) return 'rival'; if (a <= 20) return 'neutro'; if (a <= 50) return 'aliado'; if (a <= 80) return 'confiante'; return 'devoto'; }

export function handleLearnSkill(state: GameState, input: any, skillCatalog: any[]): string {
  const c = state.character;
  if (c.skills.find(s => s.name.toLowerCase() === input.skill_name.toLowerCase())) return `Já conhece: ${input.skill_name}`;
  const cat = skillCatalog.find(s => s.name.toLowerCase() === input.skill_name.toLowerCase());
  const skill = cat ? { ...cat, id: crypto.randomUUID() } : { id: crypto.randomUUID(), name: input.skill_name, tree: input.tree || 'geral', tier: 1, description: input.reason || '' };
  c.skills.push(skill as any);
  return `${input.skill_name}`;
}

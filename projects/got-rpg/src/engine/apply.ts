import type { GameState } from './state';
import { computeHpMax, xpForLevel } from './rules';

export function applyChanges(state: GameState, input: any): string[] {
  const log: string[] = [];
  const c = state.character;
  const w = state.world;

  if (input.hp_delta) { c.hp = Math.max(0, Math.min(c.hpMax, c.hp + input.hp_delta)); log.push(`HP ${input.hp_delta > 0 ? '+' : ''}${input.hp_delta} → ${c.hp}/${c.hpMax}`); }
  if (input.stress_delta) { c.stress = Math.max(0, Math.min(100, c.stress + input.stress_delta)); log.push(`Stress ${input.stress_delta > 0 ? '+' : ''}${input.stress_delta}`); }
  if (input.honor_delta) { c.honor = Math.max(-100, Math.min(100, c.honor + input.honor_delta)); log.push(`Honra ${input.honor_delta > 0 ? '+' : ''}${input.honor_delta} → ${c.honor}`); }
  if (input.gold_delta) { c.gold = Math.max(0, c.gold + input.gold_delta); log.push(`Ouro ${input.gold_delta > 0 ? '+' : ''}${input.gold_delta} → ${c.gold}`); }
  if (input.armies_delta) { c.armies = Math.max(0, c.armies + input.armies_delta); log.push(`Exército ${input.armies_delta > 0 ? '+' : ''}${input.armies_delta} → ${c.armies}`); }

  if (input.xp_gain && input.xp_gain > 0) {
    c.xp += input.xp_gain;
    log.push(`+${input.xp_gain} XP`);
    while (c.xp >= c.xpToNext && c.level < 30) {
      c.xp -= c.xpToNext; c.level += 1; c.xpToNext = xpForLevel(c.level);
      c.hpMax = computeHpMax(c); c.hp = c.hpMax;
      if (c.level % 2 === 0) c.unspentPoints += 1;
      log.push(`⬆️ NÍVEL ${c.level}!`);
    }
  }

  if (input.location) { w.location = input.location; log.push(`📍 ${input.location}`); }
  if (input.region) w.region = input.region;
  if (input.time_of_day) w.timeOfDay = input.time_of_day;
  if (input.season) w.season = input.season;
  if (input.weather) w.weather = input.weather;
  if (input.day_delta) { w.day += input.day_delta; log.push(`⏰ +${input.day_delta} dia(s)`); }
  if (input.war_status) w.warStatus = input.war_status;
  if (input.current_king) w.currentKing = input.current_king;

  if (input.title) { c.title = input.title; if (!c.titles.includes(input.title)) c.titles.push(input.title); log.push(`👑 Título: ${input.title}`); }
  if (input.add_land && !c.lands.includes(input.add_land)) { c.lands.push(input.add_land); log.push(`🏰 Terra: ${input.add_land}`); }
  if (input.add_alliance && !c.alliances.includes(input.add_alliance)) { c.alliances.push(input.add_alliance); log.push(`🤝 Aliança: ${input.add_alliance}`); }
  if (input.add_enemy && !c.enemies.includes(input.add_enemy)) { c.enemies.push(input.add_enemy); log.push(`⚔️ Inimigo: ${input.add_enemy}`); }

  if (input.learn_techniques) {
    for (const t of input.learn_techniques) {
      c.techniques.push({ id: t.id, name: t.name, attribute: t.attribute, description: t.description });
      log.push(`🆕 ${t.name}`);
    }
  }

  if (input.add_items) {
    for (const item of input.add_items) {
      c.inventory.push({ id: crypto.randomUUID(), name: item.name, description: item.description, quantity: item.quantity ?? 1, rarity: item.rarity, equipped: false });
      log.push(`📦 +${item.name}`);
    }
  }

  if (input.reputation_changes) {
    for (const rep of input.reputation_changes) {
      w.reputation[rep.faction] = Math.max(-100, Math.min(100, (w.reputation[rep.faction] ?? 0) + rep.delta));
      log.push(`Reputação ${rep.faction}: ${rep.delta > 0 ? '+' : ''}${rep.delta}`);
    }
  }

  if (input.relationships) {
    for (const rel of input.relationships) {
      const existing = rel.id ? state.relationships.find(r => r.id === rel.id) : rel.name ? state.relationships.find(r => r.name.toLowerCase() === rel.name.toLowerCase()) : null;
      if (existing) {
        if (rel.affinity_delta) existing.affinity = Math.max(-100, Math.min(100, existing.affinity + rel.affinity_delta));
        if (rel.notes) existing.notes = rel.notes;
        if (rel.romantic !== undefined) existing.romantic = rel.romantic;
        if (rel.milestone) existing.milestones.push(rel.milestone);
        existing.bondStage = bondStage(existing.affinity);
      } else if (rel.name) {
        state.relationships.push({ id: crypto.randomUUID(), name: rel.name, house: rel.house ?? 'desconhecida', affinity: rel.affinity_delta ?? 0, notes: rel.notes ?? '', romantic: rel.romantic ?? false, portrait: null, milestones: rel.milestone ? [rel.milestone] : [], bondStage: bondStage(rel.affinity_delta ?? 0) });
        log.push(`👤 ${rel.name}`);
      }
    }
  }

  if (input.set_flags) Object.assign(w.flags, input.set_flags);
  if (input.scene_npc !== undefined) state.currentSceneNpcId = input.scene_npc;

  state.updatedAt = new Date().toISOString();
  return log;
}

function bondStage(a: number): string {
  if (a <= -60) return 'inimigo mortal';
  if (a <= -20) return 'rival';
  if (a <= 20) return 'neutro';
  if (a <= 50) return 'aliado';
  if (a <= 80) return 'leal';
  return 'devoto';
}

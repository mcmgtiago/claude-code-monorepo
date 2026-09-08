// Aplica mudanças propostas pelo Mestre ao estado do jogo.
// Valida e muta o state in-place. Retorna log legível do que mudou.
import type { GameState, Attribute, Quest } from './state';
import { ATTRIBUTES } from './state';
import { computeHpMax, computeEnergyMax, xpForLevel } from './rules';

export interface ApplyChangesInput {
  hp_delta?: number;
  energy_delta?: number;
  stress_delta?: number;
  xp_gain?: number;
  morality_delta?: number;
  attribute_increases?: Array<{ attribute: Attribute; amount: number }>;
  location?: string;
  region?: string;
  time_of_day?: string;
  weather?: string;
  day_delta?: number;
  rank?: string;
  learn_techniques?: Array<{
    id: string;
    name: string;
    attribute: Attribute;
    description: string;
    energy_cost?: number;
  }>;
  add_items?: Array<{
    name: string;
    description: string;
    quantity?: number;
    rarity?: string;
    bonuses?: Array<{ attribute: Attribute; amount: number }>;
    equipped?: boolean;
  }>;
  remove_item_ids?: string[];
  set_flags?: Record<string, string>;
  reputation_changes?: Array<{ faction: string; delta: number }>;
  relationships?: Array<{
    id?: string;
    name?: string;
    faction?: string;
    affinity_delta?: number;
    affinity_set?: number;
    notes?: string;
    romantic?: boolean;
    milestone?: string;
  }>;
  advance_power_stage?: boolean;
  scene_npc?: string | null;
}

export function applyChanges(state: GameState, input: ApplyChangesInput): string[] {
  const log: string[] = [];
  const c = state.character;
  const w = state.world;

  // HP
  if (input.hp_delta) {
    c.hp = Math.max(0, Math.min(c.hpMax, c.hp + input.hp_delta));
    log.push(`HP ${input.hp_delta > 0 ? '+' : ''}${input.hp_delta} → ${c.hp}/${c.hpMax}`);
  }

  // Energy
  if (input.energy_delta) {
    c.energy = Math.max(0, Math.min(c.energyMax, c.energy + input.energy_delta));
    log.push(`Energia ${input.energy_delta > 0 ? '+' : ''}${input.energy_delta} → ${c.energy}/${c.energyMax}`);
  }

  // Stress
  if (input.stress_delta) {
    c.stress = Math.max(0, Math.min(100, c.stress + input.stress_delta));
    log.push(`Stress ${input.stress_delta > 0 ? '+' : ''}${input.stress_delta} → ${c.stress}/100`);
  }

  // XP + level up
  if (input.xp_gain && input.xp_gain > 0) {
    c.xp += input.xp_gain;
    log.push(`+${input.xp_gain} XP`);
    while (c.xp >= c.xpToNext && c.level < 30) {
      c.xp -= c.xpToNext;
      c.level += 1;
      c.xpToNext = xpForLevel(c.level);
      c.hpMax = computeHpMax(c);
      c.hp = c.hpMax; // full heal on level up
      c.energyMax = computeEnergyMax(c);
      c.energy = c.energyMax;
      if (c.level % 2 === 0) c.unspentPoints += 1;
      log.push(`⬆️ NÍVEL ${c.level}! HP max: ${c.hpMax}, Energia max: ${c.energyMax}`);
    }
  }

  // Morality
  if (input.morality_delta) {
    c.morality = Math.max(-100, Math.min(100, c.morality + input.morality_delta));
    log.push(`Moralidade ${input.morality_delta > 0 ? '+' : ''}${input.morality_delta} → ${c.morality}`);
  }

  // Attribute increases
  if (input.attribute_increases) {
    for (const inc of input.attribute_increases) {
      if (c.unspentPoints >= inc.amount && c.attributes[inc.attribute] + inc.amount <= 18) {
        c.attributes[inc.attribute] += inc.amount;
        c.unspentPoints -= inc.amount;
        log.push(`${inc.attribute} +${inc.amount} → ${c.attributes[inc.attribute]}`);
      }
    }
    // Recalculate derived stats
    c.hpMax = computeHpMax(c);
    c.energyMax = computeEnergyMax(c);
  }

  // Location
  if (input.location) {
    w.location = input.location;
    log.push(`📍 ${input.location}`);
  }
  if (input.region) w.region = input.region;
  if (input.time_of_day) w.timeOfDay = input.time_of_day;
  if (input.weather) w.weather = input.weather;
  if (input.day_delta) {
    w.day += input.day_delta;
    log.push(`⏰ +${input.day_delta} dia(s) → Dia ${w.day}`);
  }

  // Rank
  if (input.rank) {
    c.rank = input.rank;
    log.push(`Rank: ${input.rank}`);
  }

  // Techniques
  if (input.learn_techniques) {
    for (const tech of input.learn_techniques) {
      c.techniques.push({
        id: tech.id,
        name: tech.name,
        attribute: tech.attribute,
        description: tech.description,
        energyCost: tech.energy_cost ?? 0,
        unlockedAtLevel: c.level,
      });
      log.push(`🆕 Técnica: ${tech.name}`);
    }
  }

  // Items
  if (input.add_items) {
    for (const item of input.add_items) {
      c.inventory.push({
        id: crypto.randomUUID(),
        name: item.name,
        description: item.description,
        quantity: item.quantity ?? 1,
        rarity: item.rarity as any,
        bonuses: item.bonuses,
        equipped: item.equipped ?? false,
      });
      log.push(`📦 +${item.name}`);
    }
  }
  if (input.remove_item_ids) {
    c.inventory = c.inventory.filter(i => !input.remove_item_ids!.includes(i.id));
  }

  // Flags
  if (input.set_flags) {
    Object.assign(w.flags, input.set_flags);
  }

  // Reputation
  if (input.reputation_changes) {
    for (const rep of input.reputation_changes) {
      w.reputation[rep.faction] = Math.max(-100, Math.min(100,
        (w.reputation[rep.faction] ?? 0) + rep.delta
      ));
      log.push(`Reputação ${rep.faction}: ${rep.delta > 0 ? '+' : ''}${rep.delta}`);
    }
  }

  // Relationships (dedup by name)
  if (input.relationships) {
    for (const rel of input.relationships) {
      // Find existing by id OR by name (prevents duplicates)
      const existing = rel.id
        ? state.relationships.find(r => r.id === rel.id)
        : rel.name
        ? state.relationships.find(r => r.name.toLowerCase() === rel.name!.toLowerCase())
        : null;

      if (existing) {
        if (rel.affinity_delta) existing.affinity = Math.max(-100, Math.min(100, existing.affinity + rel.affinity_delta));
        if (rel.affinity_set !== undefined) existing.affinity = rel.affinity_set;
        if (rel.notes) existing.notes = rel.notes;
        if (rel.romantic !== undefined) existing.romantic = rel.romantic;
        if (rel.milestone) existing.milestones.push(rel.milestone);
        existing.bondStage = computeBondStage(existing.affinity);
      } else if (rel.name) {
        state.relationships.push({
          id: crypto.randomUUID(),
          name: rel.name,
          faction: rel.faction ?? 'desconhecido',
          affinity: rel.affinity_set ?? rel.affinity_delta ?? 0,
          notes: rel.notes ?? '',
          romantic: rel.romantic ?? false,
          portrait: null,
          milestones: rel.milestone ? [rel.milestone] : [],
          bondStage: computeBondStage(rel.affinity_set ?? rel.affinity_delta ?? 0),
        });
        log.push(`👤 Novo NPC: ${rel.name}`);
      }
    }
  }

  // Power stage advance
  if (input.advance_power_stage) {
    const stages: Array<typeof c.powerStage> = ['dormente', 'despertar', 'base', 'avancado', 'omega'];
    const idx = stages.indexOf(c.powerStage);
    if (idx < stages.length - 1) {
      c.powerStage = stages[idx + 1];
      log.push(`⚡ Poder evoluiu → ${c.powerStage}`);
    }
  }

  // Scene NPC
  if (input.scene_npc !== undefined) {
    state.currentSceneNpcId = input.scene_npc;
  }

  state.updatedAt = new Date().toISOString();
  return log;
}

function computeBondStage(affinity: number): string {
  if (affinity <= -60) return 'hostil';
  if (affinity <= -20) return 'frio';
  if (affinity <= 20) return 'neutro';
  if (affinity <= 50) return 'amigo';
  if (affinity <= 80) return 'confidente';
  return 'devoto';
}

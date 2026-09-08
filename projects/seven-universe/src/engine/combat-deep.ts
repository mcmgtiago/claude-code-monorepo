// Combate tático profundo: posicionamento, stance, conditions, combos, finishers.
import type { CombatState } from './state';

export interface Condition {
  name: string;      // 'sangrando', 'atordoado', 'em chamas', 'enfurecido', 'envenenado', 'protegido'
  turnsLeft: number;
  effect: string;    // descrição do efeito
  damagePerTurn?: number;
  attackMod?: number;
  defenseMod?: number;
}

export interface TacticalEnemy {
  id: string; name: string; description: string;
  hp: number; hpMax: number; level: number;
  position: 'melee' | 'ranged' | 'cover';
  behavior: 'aggressive' | 'defensive' | 'ranged' | 'coward' | 'boss';
  conditions: Condition[];
  nextAction: string;   // o que vai fazer no próximo turno (player pode reagir)
  defeated: boolean;
}

export interface TacticalCombat extends CombatState {
  playerPosition: 'melee' | 'ranged' | 'cover' | 'flanking';
  playerStance: 'offensive' | 'defensive' | 'evasive';
  playerConditions: Condition[];
  combo: number;
  cooldowns: Record<string, number>;
  environment: string[];   // objetos usáveis no cenário
  tacticalEnemies: TacticalEnemy[];
}

/** Aplica efeitos de conditions no início do turno */
export function tickConditions(conditions: Condition[]): { log: string[]; totalDamage: number } {
  const log: string[] = []; let totalDamage = 0;
  for (const c of conditions) {
    if (c.damagePerTurn) { totalDamage += c.damagePerTurn; log.push(`${c.name}: -${c.damagePerTurn} HP`); }
    c.turnsLeft--;
  }
  return { log, totalDamage };
}

export function cleanExpiredConditions(conditions: Condition[]): Condition[] {
  return conditions.filter(c => c.turnsLeft > 0);
}

/** Calcula modificador total de stance + conditions */
export function combatModifiers(stance: string, conditions: Condition[]): { atk: number; def: number } {
  let atk = 0, def = 0;
  if (stance === 'offensive') { atk += 2; def -= 2; }
  else if (stance === 'defensive') { def += 3; atk -= 1; }
  else if (stance === 'evasive') { def += 2; }
  for (const c of conditions) { atk += c.attackMod || 0; def += c.defenseMod || 0; }
  return { atk, def };
}

/** Descreve o estado tático pro prompt */
export function describeTacticalCombat(tc: TacticalCombat): string {
  const enemies = tc.tacticalEnemies.filter(e => !e.defeated).map(e =>
    `${e.name} (HP ${e.hp}/${e.hpMax}, ${e.position}, ${e.behavior}${e.conditions.length ? ', ' + e.conditions.map(c => c.name).join('/') : ''}) — vai fazer: ${e.nextAction}`
  ).join('\n');
  const playerCond = tc.playerConditions.length ? tc.playerConditions.map(c => c.name).join(', ') : 'nenhuma';
  return `## COMBATE TÁTICO — Rodada ${tc.round}
Sua posição: ${tc.playerPosition} | Postura: ${tc.playerStance} | Combo: ${tc.combo}x
Suas condições: ${playerCond}
Cooldowns: ${Object.entries(tc.cooldowns).filter(([, v]) => v > 0).map(([k, v]) => `${k}(${v})`).join(', ') || 'nenhum'}
Ambiente usável: ${tc.environment.join(', ') || 'nada notável'}
INIMIGOS:
${enemies}
${tc.combo >= 3 ? '⚡ FINISHER DISPONÍVEL (combo 3+)!' : ''}`;
}

/** Condition presets comuns */
export const CONDITIONS: Record<string, Omit<Condition, 'turnsLeft'>> = {
  sangrando: { name: 'sangrando', effect: 'perde HP por turno', damagePerTurn: 5 },
  atordoado: { name: 'atordoado', effect: 'pode perder o turno', defenseMod: -3 },
  em_chamas: { name: 'em chamas', effect: 'queima', damagePerTurn: 8 },
  enfurecido: { name: 'enfurecido', effect: 'mais dano, menos defesa', attackMod: 4, defenseMod: -2 },
  envenenado: { name: 'envenenado', effect: 'veneno corrói', damagePerTurn: 4 },
  protegido: { name: 'protegido', effect: 'defesa aumentada', defenseMod: 4 },
  focado: { name: 'focado', effect: 'próximo ataque crítico', attackMod: 5 },
};

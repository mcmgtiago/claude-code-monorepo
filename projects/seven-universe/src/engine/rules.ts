import type { CharacterSheet, RollResult } from './state';

export function attributeModifier(v: number): number { return Math.floor((v - 10) / 2); }

export function computeHpMax(sheet: Pick<CharacterSheet, 'attributes' | 'level'>): number {
  const vals = Object.values(sheet.attributes);
  // usa média dos 2 maiores atributos como base de HP
  const sorted = [...vals].sort((a, b) => b - a);
  const top = (sorted[0] + sorted[1]) / 2;
  return Math.max(1, 20 + attributeModifier(top) * 4 + (sheet.level - 1) * 6);
}

export function computeEnergyMax(sheet: Pick<CharacterSheet, 'attributes' | 'level'>): number {
  const vals = Object.values(sheet.attributes);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.max(1, 15 + attributeModifier(avg) * 3 + (sheet.level - 1) * 5);
}

export function xpForLevel(level: number): number { return Math.round(100 * Math.pow(1.3, level - 1)); }

export const ATTRIBUTE_FLOOR = 8;
export const ATTRIBUTE_CAP = 18;

export function rollD20(attribute: string, attributeLabel: string, sheet: Pick<CharacterSheet, 'attributes' | 'level'>, dc: number, options?: { advantage?: boolean; disadvantage?: boolean }): RollResult {
  const attrValue = sheet.attributes[attribute] ?? 10;
  const mod = attributeModifier(attrValue);
  const levelBonus = Math.floor((sheet.level || 1) / 5);
  const highStatBonus = attrValue >= 16 ? (attrValue - 15) : 0;
  const totalMod = mod + levelBonus + highStatBonus;
  let d20: number;
  if (options?.advantage) d20 = Math.max(Math.floor(Math.random() * 20) + 1, Math.floor(Math.random() * 20) + 1);
  else if (options?.disadvantage) d20 = Math.min(Math.floor(Math.random() * 20) + 1, Math.floor(Math.random() * 20) + 1);
  else d20 = Math.floor(Math.random() * 20) + 1;
  const total = d20 + totalMod;
  const success = total >= dc;
  const critical: 'hit' | 'fail' | null = d20 === 20 ? 'hit' : d20 === 1 ? 'fail' : null;
  let degree: string;
  if (critical === 'hit') degree = 'sucesso crítico!'; else if (critical === 'fail') degree = 'falha crítica!';
  else if (success && total >= dc + 10) degree = 'sucesso decisivo'; else if (success && total >= dc + 5) degree = 'sucesso sólido';
  else if (success) degree = 'sucesso por pouco'; else if (total >= dc - 3) degree = 'falha por pouco'; else degree = 'falha clara';
  return { attribute, attributeLabel, d20, modifier: totalMod, total, dc, success: critical === 'hit' ? true : critical === 'fail' ? false : success, critical, degree, reason: '' };
}

export function formatRoll(roll: RollResult): string {
  const crit = roll.critical === 'hit' ? ' 🎯' : roll.critical === 'fail' ? ' 💀' : '';
  return `[${roll.attributeLabel}] d20(${roll.d20})+${roll.modifier}=${roll.total} vs DC${roll.dc} → ${roll.degree}${crit}`;
}

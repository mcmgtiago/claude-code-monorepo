// Sistema de dados e regras mecânicas. O motor rola de verdade.
import type { Attribute, CharacterSheet, RollResult, StartingTier } from './state';
import { ATTRIBUTE_LABELS } from './state';

/** Modificador de atributo: (valor - 10) / 2, arredondado pra baixo */
export function attributeModifier(value: number): number {
  return Math.floor((value - 10) / 2);
}

/** HP máximo: base 20 + (resistencia + vontade mods) * 3 + (level - 1) * 6 */
export function computeHpMax(sheet: Pick<CharacterSheet, 'attributes' | 'level'>): number {
  const base = 20;
  const res = attributeModifier(sheet.attributes.resistencia);
  const von = attributeModifier(sheet.attributes.vontade);
  return Math.max(1, base + (res + von) * 3 + (sheet.level - 1) * 6);
}

/** Energia mutante máxima: base 15 + (poder * 4 + controle * 2) + (level - 1) * 5 */
export function computeEnergyMax(sheet: Pick<CharacterSheet, 'attributes' | 'level'>): number {
  const base = 15;
  const poder = attributeModifier(sheet.attributes.poder);
  const controle = attributeModifier(sheet.attributes.controle);
  return Math.max(1, base + (poder * 4 + controle * 2) + (sheet.level - 1) * 5);
}

/** XP necessário pro próximo nível (curva ~1.35x) */
export function xpForLevel(level: number): number {
  return Math.round(100 * Math.pow(1.35, level - 1));
}

/** Budget de pontos por tier */
export function pointBudgetForTier(tier: StartingTier): number {
  switch (tier) {
    case 'novato': return 22;
    case 'veterano': return 34;
    case 'elite': return 48;
    case 'omega': return 80;
  }
}

/** Nível inicial por tier */
export function startingLevelForTier(tier: StartingTier): number {
  switch (tier) {
    case 'novato': return 1;
    case 'veterano': return 5;
    case 'elite': return 12;
    case 'omega': return 30;
  }
}

/** Banda de poder legível */
export function powerBand(sheet: Pick<CharacterSheet, 'level'>): string {
  if (sheet.level <= 3) return 'Fraco';
  if (sheet.level <= 7) return 'Competente';
  if (sheet.level <= 12) return 'Forte';
  if (sheet.level <= 20) return 'Elite';
  return 'Lendário';
}

export const ATTRIBUTE_FLOOR = 8;
export const ATTRIBUTE_CAP = 18;

/** Rola d20 + modifier + level bonus. Vantagem/desvantagem opcionais. */
export function rollD20(
  attribute: Attribute,
  sheet: Pick<CharacterSheet, 'attributes' | 'level'>,
  dc: number,
  options?: { advantage?: boolean; disadvantage?: boolean }
): RollResult {
  const attrValue = sheet.attributes[attribute];
  const mod = attributeModifier(attrValue);
  // Level bonus: +1 per 5 levels (so level 30 = +6)
  const levelBonus = Math.floor((sheet.level || 1) / 5);
  // High-stat bonus: stats 16+ get extra (16=+1, 17=+2, 18=+3)
  const highStatBonus = attrValue >= 16 ? (attrValue - 15) : 0;
  const totalMod = mod + levelBonus + highStatBonus;

  let d20: number;
  if (options?.advantage) {
    const r1 = Math.floor(Math.random() * 20) + 1;
    const r2 = Math.floor(Math.random() * 20) + 1;
    d20 = Math.max(r1, r2);
  } else if (options?.disadvantage) {
    const r1 = Math.floor(Math.random() * 20) + 1;
    const r2 = Math.floor(Math.random() * 20) + 1;
    d20 = Math.min(r1, r2);
  } else {
    d20 = Math.floor(Math.random() * 20) + 1;
  }

  const total = d20 + totalMod;
  const success = total >= dc;
  const critical: 'hit' | 'fail' | null =
    d20 === 20 ? 'hit' : d20 === 1 ? 'fail' : null;

  let degree: string;
  if (critical === 'hit') degree = 'sucesso crítico!';
  else if (critical === 'fail') degree = 'falha crítica!';
  else if (success && total >= dc + 10) degree = 'sucesso decisivo';
  else if (success && total >= dc + 5) degree = 'sucesso sólido';
  else if (success) degree = 'sucesso por pouco';
  else if (total >= dc - 3) degree = 'falha por pouco';
  else degree = 'falha clara';

  return {
    attribute,
    attributeLabel: ATTRIBUTE_LABELS[attribute],
    d20,
    modifier: totalMod,
    total,
    dc,
    success: critical === 'hit' ? true : critical === 'fail' ? false : success,
    critical,
    degree,
    reason: '',
  };
}

/** Formata resultado de rolagem pra texto */
export function formatRoll(roll: RollResult): string {
  const critText = roll.critical === 'hit' ? ' 🎯 CRÍTICO!' : roll.critical === 'fail' ? ' 💀 FALHA CRÍTICA!' : '';
  return `[${roll.attributeLabel}] d20(${roll.d20}) + ${roll.modifier} = ${roll.total} vs DC ${roll.dc} → ${roll.degree}${critText}`;
}

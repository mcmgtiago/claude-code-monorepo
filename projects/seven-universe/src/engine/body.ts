// Corpo persistente: ferimentos que curam com tempo, cicatrizes, trauma, vícios, envelhecimento.
import type { GameState } from './state';
import { addFact } from './memory-deep';

export interface Wound {
  id: string;
  location: string;     // "braço esquerdo", "rosto", "torso"
  severity: number;     // 1-10
  turnsToHeal: number;
  willScar: boolean;
  description: string;
}

export interface Condition {
  name: string;         // "envenenado", "doente", "grávida", "exausto"
  turnsLeft: number;    // -1 = permanente até curar
  effect: string;
}

export interface Trauma {
  name: string;         // "Viu aliado morrer", "Foi torturado"
  trigger: string;      // o que reativa
  effect: string;       // "paralisa", "fúria descontrolada", "flashback"
  severity: number;
  resolved: boolean;
}

export interface Body {
  wounds: Wound[];
  scars: string[];
  conditions: Condition[];
  traumas: Trauma[];
  addiction: string | null;
  addictionSeverity: number; // 0-100
}

export function createBody(): Body {
  return { wounds: [], scars: [], conditions: [], traumas: [], addiction: null, addictionSeverity: 0 };
}

/** Processa cura/progressão do corpo a cada turno */
export function processBody(state: GameState): string[] {
  const log: string[] = [];
  const body: Body = (state.character as any).body || createBody();

  // Ferimentos curam
  for (const w of body.wounds) {
    w.turnsToHeal--;
    if (w.turnsToHeal <= 0) {
      if (w.willScar) { body.scars.push(`Cicatriz: ${w.description} (${w.location})`); log.push(`🩹 Ferimento no ${w.location} cicatrizou.`); }
      else log.push(`🩹 Ferimento no ${w.location} curou.`);
    }
  }
  body.wounds = body.wounds.filter(w => w.turnsToHeal > 0);

  // Condições expiram
  for (const c of body.conditions) { if (c.turnsLeft > 0) c.turnsLeft--; }
  body.conditions = body.conditions.filter(c => c.turnsLeft !== 0);

  (state.character as any).body = body;
  return log;
}

/** Formata estado do corpo pro contexto */
export function formatBody(state: GameState): string {
  const body: Body = (state.character as any).body;
  if (!body) return '';
  const parts: string[] = [];
  if (body.wounds.length) parts.push(`Ferimentos: ${body.wounds.map(w => `${w.location} (grave ${w.severity})`).join(', ')}`);
  if (body.scars.length) parts.push(`Cicatrizes: ${body.scars.slice(-3).join('; ')}`);
  if (body.conditions.length) parts.push(`Condições: ${body.conditions.map(c => c.name).join(', ')}`);
  if (body.traumas.filter(t => !t.resolved).length) parts.push(`Traumas ativos: ${body.traumas.filter(t => !t.resolved).map(t => `${t.name} (gatilho: ${t.trigger})`).join('; ')}`);
  if (body.addiction) parts.push(`Vício: ${body.addiction} (${body.addictionSeverity}/100)`);
  return parts.length ? `## CORPO: ${parts.join(' | ')}` : '';
}

/** Aplica dano/ferimento */
export function addWound(state: GameState, location: string, severity: number, description: string): void {
  const body: Body = (state.character as any).body || createBody();
  body.wounds.push({
    id: crypto.randomUUID(), location, severity,
    turnsToHeal: severity * 2, willScar: severity >= 6, description,
  });
  (state.character as any).body = body;
}

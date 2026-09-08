// Objetivos de longo prazo + arcos narrativos em 5 atos.
// IA detecta o objetivo do player e conduz crescendo dramático.
import type { GameState } from './state';

export interface LongTermGoal {
  id: string;
  title: string;        // "Destruir os Sentinelas", "Virar Rei do Norte"
  type: 'power' | 'revenge' | 'love' | 'freedom' | 'discovery' | 'domination' | 'survival';
  progress: number;     // 0-100
  active: boolean;
}

export type NarrativeAct = 1 | 2 | 3 | 4 | 5;
// 1 = Chamado (transporte, confusão, primeiro aliado)
// 2 = Ascensão (ganha poder, aliados, status)
// 3 = Queda (traição, perda, momento mais baixo)
// 4 = Renascimento (reconstrói, mais forte)
// 5 = Clímax (confronto final, resolução)

export interface Narrative {
  playerGoals: LongTermGoal[];
  currentAct: NarrativeAct;
  nemesisId: string | null;     // NPC que é o rival recorrente
  tension: number;              // 0-100, quão perto do clímax
  majorEvent: string | null;    // próximo evento grande planejado
}

export function createNarrative(): Narrative {
  return { playerGoals: [], currentAct: 1, nemesisId: null, tension: 0, majorEvent: null };
}

/** Detecta em qual ato a narrativa está baseado em indicadores */
export function detectAct(state: GameState): NarrativeAct {
  const tc = state.turnCount;
  const level = state.character.level;
  const hp = state.character.hp / state.character.hpMax;
  const hasNemesis = state.relationships.some(r => r.affinity <= -50);
  const suffered = state.character.nearDeaths > 0 || state.character.stress > 60;

  if (tc <= 10) return 1;                          // Primeiros turnos = Chamado
  if (tc <= 30 && !suffered) return 2;             // Crescendo, sem queda = Ascensão
  if (suffered && level < 15) return 3;            // Sofreu mas não é forte = Queda
  if (suffered && level >= 15) return 4;           // Sofreu, ficou forte = Renascimento
  if (tc > 50 && level >= 20 && hasNemesis) return 5; // Endgame = Clímax
  return Math.min(5, Math.ceil(tc / 15)) as NarrativeAct; // fallback progressivo
}

/** Gera instrução de tom baseada no ato atual */
export function getActDirective(act: NarrativeAct): string {
  switch (act) {
    case 1: return 'TOM: início de jornada. Confusão, descoberta, primeiro contato. O mundo é novo e perigoso.';
    case 2: return 'TOM: ascensão. O jogador cresce, faz aliados, conquista. Sensação de progresso e poder. Mas plante sementes de conflito futuro.';
    case 3: return 'TOM: queda. Algo dá errado. Perda pessoal, traição, derrota. Momento mais sombrio. Teste a resiliência do jogador.';
    case 4: return 'TOM: renascimento. O jogador se reconstrói mais forte. Aliados se reúnem. O confronto final se aproxima.';
    case 5: return 'TOM: clímax. Confronto definitivo. Escolhas finais com peso máximo. Nada será como antes.';
  }
}

/** Formata objetivos e arco pro contexto */
export function formatNarrative(state: GameState): string {
  const narr: Narrative = (state as any).narrative || createNarrative();
  const act = detectAct(state);
  const directive = getActDirective(act);
  let out = `## ARCO NARRATIVO (Ato ${act}/5): ${directive}`;
  if (narr.playerGoals.filter(g => g.active).length > 0) {
    out += `\nObjetivos do jogador: ${narr.playerGoals.filter(g => g.active).map(g => `${g.title} (${g.progress}%)`).join(', ')}. Conduza a narrativa em direção a esses objetivos.`;
  }
  if (narr.nemesisId) out += `\nNêmesis do jogador: presente. Faça-o reaparecer em momentos dramáticos.`;
  return out;
}

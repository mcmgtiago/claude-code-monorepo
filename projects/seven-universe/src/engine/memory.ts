// Memória de longo prazo: janela de cenas recentes + resumo rolante (chronicle).
// Custo por turno fica ~constante independente de quanto tempo se jogou.
import type { GameState, Turn } from './state';

/** Cenas mantidas na íntegra */
export const RECENT_WINDOW = 14;
/** Quando exceder, compacta */
export const COMPACT_TRIGGER = 20;

export function appendTurn(state: GameState, role: Turn['role'], text: string): void {
  state.recentTurns.push({ role, text });
  state.turnCount += 1;
}

export function needsCompaction(state: GameState): boolean {
  return state.recentTurns.length > COMPACT_TRIGGER;
}

export type Summarizer = (input: {
  existingChronicle: string;
  turnsToFold: Turn[];
}) => Promise<string>;

/**
 * Compacta turnos antigos no chronicle. Se falhar, mantém tudo (não perde dados).
 */
export async function compactMemory(state: GameState, summarize: Summarizer): Promise<void> {
  if (!needsCompaction(state)) return;
  const overflow = state.recentTurns.length - RECENT_WINDOW;
  if (overflow <= 0) return;

  const turnsToFold = state.recentTurns.slice(0, overflow);
  try {
    const newChronicle = await summarize({
      existingChronicle: state.chronicle,
      turnsToFold,
    });
    state.chronicle = newChronicle.trim();
    state.recentTurns = state.recentTurns.slice(overflow);
  } catch (err) {
    console.error('[memory] falha ao resumir:', err);
  }
}

/** Formata cenas recentes pro prompt */
export function formatRecentTurns(turns: Turn[]): string {
  return turns
    .map(t => t.role === 'player' ? `JOGADOR: ${t.text}` : `MESTRE: ${t.text}`)
    .join('\n\n');
}

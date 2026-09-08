// World Tick: simulação de fundo — o mundo se move quando o player não está olhando.
import type { GameState } from './state';
import type { DeepMemory } from './memory-deep';
import { addFact } from './memory-deep';

export interface WorldEvent {
  type: 'faction_move' | 'npc_action' | 'war_change' | 'rumor' | 'death' | 'opportunity';
  title: string;
  description: string;
  affectsPlayer: boolean;
  factions: string[];
}

/** Decide se é hora de rodar um tick (a cada 5 turnos ou time skip) */
export function shouldTick(state: GameState): boolean {
  return state.turnCount > 0 && state.turnCount % 5 === 0;
}

/** Aplica eventos de mundo ao state e à memória */
export function applyWorldEvents(state: GameState, memory: DeepMemory, events: WorldEvent[]): string[] {
  const log: string[] = [];
  for (const ev of events) {
    addFact(memory, {
      category: ev.type === 'death' ? 'event' : ev.type === 'rumor' ? 'secret' : 'event',
      subject: ev.title,
      content: ev.description,
      turn: state.turnCount,
      importance: ev.affectsPlayer ? 8 : 5,
      relatedNpcs: ev.factions,
    });
    log.push(`🌍 ${ev.title}`);
  }
  return log;
}

/** Prompt pra IA gerar eventos de mundo */
export function buildWorldTickPrompt(state: GameState, memory: DeepMemory): string {
  const factions = Object.entries(state.world.reputation).map(([k, v]) => `${k}: ${v}`).join(', ') || 'nenhuma';
  const npcs = memory.npcCards.map(c => `${c.name} (${c.faction}, agenda: ${c.agenda})`).join('; ');
  const flags = Object.entries(state.world.flags).map(([k, v]) => `${k}=${v}`).join(', ');

  return `O mundo do jogo se move. Gere 1-2 eventos que acontecem ENQUANTO O JOGADOR NÃO ESTÁ OLHANDO.

Estado:
- Local do player: ${state.world.location}
- Dia: ${state.world.day}
- Facções: ${factions}
- NPCs conhecidos: ${npcs}
- Flags: ${flags}

Regras:
- Eventos devem ser coerentes com o mundo
- Podem afetar o player (oportunidades, ameaças) ou não (mudanças de fundo)
- NPCs com agenda podem agir (alianças, traições, mortes)
- Guerre/conflitos escalam se não resolvidos
- Máximo 2 eventos

Responda APENAS JSON array:
[{"type":"faction_move|npc_action|war_change|rumor|death|opportunity","title":"título curto","description":"1-2 frases do que aconteceu","affectsPlayer":true/false,"factions":["nomes envolvidos"]}]`;
}

# System Design — Game Engine

**Status:** Design fase 0 (validação pré-implementação)

---

## Game Loop Principal

```
┌─────────────────────────────────────────────────────┐
│                  PLAYER TURN                        │
│  Player sends message (texto livre)                 │
└──────────────────┬──────────────────────────────────┘
                   ▼
┌─────────────────────────────────────────────────────┐
│              ACTION VALIDATION                       │
│  - Personagem pode fazer isso? (stats, location)    │
│  - É coerente com estado atual? (em diálogo? morto?)│
│  - Requer rolagem de dado? (combat, risky action)   │
└──────────────────┬──────────────────────────────────┘
                   ▼
┌─────────────────────────────────────────────────────┐
│              EVENT GENERATION                       │
│  Cria GameEvent estruturado a partir da ação       │
└──────────────────┬──────────────────────────────────┘
                   ▼
┌─────────────────────────────────────────────────────┐
│              STATE TRANSITION                       │
│  Reducer aplica evento → novo state                 │
│  Possível side-effect: mudança de cena/estado       │
└──────────────────┬──────────────────────────────────┘
                   ▼
┌─────────────────────────────────────────────────────┐
│              NARRATION REQUEST                      │
│  AI Orchestrator monta contexto + prompt            │
│  Chama LLM → recebe narração streaming              │
└──────────────────┬──────────────────────────────────┘
                   ▼
┌─────────────────────────────────────────────────────┐
│              POST-PROCESSING                        │
│  - Valida coerência                                 │
│  - Extrai eventos secundários (NPC reage, item drop)│
│  - Detecta condições (HP zero, trauma increase)     │
└──────────────────┬──────────────────────────────────┘
                   ▼
┌─────────────────────────────────────────────────────┐
│              STATE UPDATE                           │
│  Aplica eventos secundários                         │
│  Atualiza UI (painel, chat, mapa)                   │
│  Trigger auto-save se checkpoint                    │
└──────────────────┬──────────────────────────────────┘
                   ▼
              [next turn]
```

---

## State Machine — Estados Globais

```
CHARACTER_CREATION
    └→ [wizard complete] → EXPLORATION

EXPLORATION
    ├→ [initiate dialogue] → DIALOGUE
    ├→ [combat triggered] → COMBAT
    ├→ [enter location] → CUTSCENE (intro location)
    ├→ [rest action] → REST
    └→ [time skip / travel] → EXPLORATION (new location)

DIALOGUE
    ├→ [end conversation] → EXPLORATION
    ├→ [combat triggered] → COMBAT
    └→ [relationship milestone] → CUTSCENE

COMBAT
    ├→ [all enemies defeated] → EXPLORATION
    ├→ [player defeated] → DEATH (or CAPTURE)
    ├→ [flee successful] → EXPLORATION
    └→ [boss defeated] → CUTSCENE (major event)

CUTSCENE
    └→ [scene complete] → EXPLORATION (ou novo estado conforme narrativa)

REST
    └→ [rest complete] → EXPLORATION

DEATH
    ├→ [death was temporary / save point] → EXPLORATION
    └→ [true death] → GAME_OVER → CHARACTER_CREATION (novo personagem)
```

**Detalhe de cada estado:** seção dedicada abaixo.

---

## Estado: CHARACTER_CREATION

**Input do wizard:**

1. **Nome** (texto livre)
2. **Origem no mundo original** (mundano, militar, acadêmico, criminoso, artista, religioso)
3. **Gatilho do isekai** (como foi transportado)
4. **Classe de mutação** (escolha entre 12 ou random com reroll)
5. **Subclasse / especialização** (variação dentro da classe)
6. **Stats iniciais** (point-buy: 27 pontos, range 8-15)
7. **Backstory** (texto livre, 200+ caracteres ideal)
8. **Moralidade inicial** (-100 a +100, default 0)
9. **Traumas iniciais** (opcional: "Assisti meu irmão morrer", etc)

**Validações:**
- Stats totais não podem exceder budget
- Backstory mínimo 200 chars (qualidade)
- Se escolher classe "Telepatia", trauma inicial recomendado (poder tem custo)

**Output:** `Character` object pronto pra serialização.

---

## Estado: EXPLORATION

**Estrutura interna:**

```typescript
type ExplorationState = {
  location: Location;
  time: GameTime;
  weather: Weather;
  present_npcs: NPC[];
  available_actions: Action[];
  triggered_quests: Quest[];
  ambient_events: AmbientEvent[]; // world moves even when player idle
};
```

**Time progression:**
- Player actions consomem tempo (configurável por tipo)
- Fast travel consome horas
- Idle (não joga por 1 dia in-game) → world muda (eventos agendados)

**Ambient events:**
- Roda tick quando player está idle ou em cutscene
- Baseado em faction_dynamics + NPC agendas
- Ex: "Enquanto você descansava em Madripoor, o Professor X convocou reunião de emergência"

---

## Estado: DIALOGUE

**Estrutura:**

```typescript
type DialogueState = {
  npc: NPC;
  topic: DialogueTopic;
  relationship_snapshot: RelationshipScore;
  available_choices: DialogueChoice[];
  emotional_state: EmotionalTone;
  history: DialogueTurn[];
};
```

**NPCs têm:**
- Personalidade (big five + modifiers)
- Agenda (o que querem do player)
- Traumas próprios
- Medos
- Limites (não falam sobre X, não fazem Y)
- Memoria de longo prazo (vê `relationships/`)

**Sistema de afinidade:**
- Ações mudam trust/rival/respect/love scores
- Scores mudam tom do NPC, opções de diálogo, eventos disponíveis

---

## Estado: COMBAT

**Sistema:** Iniciativa + turnos + ações por turno + condições.

```typescript
type CombatState = {
  participants: Combatant[];
  round: number;
  turn_order: Combatant[];
  active_conditions: Map<Combatant, Condition[]>;
  environment: CombatEnvironment;
  morale: Map<Combatant, number>; // -100 a +100
};
```

**Resolução de turno:**

1. Player declara intenção (texto livre)
2. Game Engine valida (ação possível? recurso disponível?)
3. Se precisar rolagem, rola dado (sistema d20 abaixo)
4. Calcula resultado (success/failure/critical)
5. AI narra resultado + consequências
6. Próximo turno

**Sistema de rolagem (d20 + modifier):**

```
d20 + skill_modifier + stat_modifier + situational_bonus
≥ difficulty_class (DC)

DC table:
  5  = trivial
  10 = easy
  15 = medium
  20 = hard
  25 = very hard
  30 = nearly impossible
```

**Condições:** poisoned, stunned, bleeding, prone, grappled, feared, charmed, etc.

---

## Estado: CUTSCENE

**Trigger automático:**
- Entrar em location chave primeira vez
- Boss defeated
- Story milestone
- NPC relationship milestone

**Comportamento:**
- AI narra cena longa
- Player pode apenas `Enter` para avançar
- Estado avança automaticamente após cena

**Interruptos permitidos:**
- Save manual
- Cancelar (volta para estado anterior, mas perde cena)

---

## Estado: REST

**Tipo de descanso:**
- Short rest (1 hora): recupera HP menor, remove minor conditions
- Long rest (8 horas): recupera tudo, avança tempo, possível dream sequence
- Sleep (8+ hours): mesma coisa mas com dream event

**Side effects:**
- Avanço de tempo dispara ambient events
- NPCs podem agir durante o descanso (player ausente)
- Possível ambush se descansou em zona hostil

---

## Estado: DEATH

**Tipos de morte:**

1. **Defeated in combat** — capturado, hospitalizado, ou morto.
2. **Killed by trauma** — suicídio, colapso mental, dano emocional crítico.
3. **Killed by faction** — execução, assassinato político.
4. **Sacrificial death** — escolheu morrer pra salvar outro.

**Consequências:**

- **Morto real:** Campanha termina. Personagem vira NPC na memória do mundo. Novo personagem pode ser criado.
- **Captured:** Estado CAPTURE → eventual escape ou rescue.
- **Hospitalizado:** Volta pra EXPLORATION após recuperação (com possível trauma permanente).

---

## Event Sourcing

### Estrutura de GameEvent

```typescript
type GameEvent =
  | { type: 'COMBAT_ATTACK'; actor: string; target: string; weapon: string }
  | { type: 'DIALOGUE_CHOICE'; npc: string; choice_id: string; tone: string }
  | { type: 'LOCATION_CHANGE'; from: string; to: string; method: string }
  | { type: 'NPC_RELATIONSHIP_CHANGE'; npc: string; axis: string; delta: number }
  | { type: 'XP_GAIN'; amount: number; source: string }
  | { type: 'ITEM_ACQUIRED'; item: string; quantity: number }
  | { type: 'ITEM_LOST'; item: string; quantity: number; reason: string }
  | { type: 'TRAUMA_GAINED'; trauma: string; severity: number }
  | { type: 'TRAUMA_RESOLVED'; trauma: string }
  | { type: 'MORALITY_SHIFT'; delta: number; reason: string }
  | { type: 'FACTION_REP_CHANGE'; faction: string; delta: number }
  | { type: 'NPC_DIED'; npc: string; cause: string }
  | { type: 'QUEST_TRIGGERED'; quest: string }
  | { type: 'QUEST_COMPLETED'; quest: string }
  | { type: 'TIME_PASSED'; from: GameTime; to: GameTime }
  | { type: 'WORLD_EVENT'; event: string; affects: string[] };
```

### Aplicação

```typescript
function applyEvent(state: GameState, event: GameEvent): GameState {
  // pure reducer
  // returns new state, never mutates
}
```

### Save Format

```json
{
  "schema_version": 3,
  "character_id": "char_abc123",
  "snapshot": { /* full state */ },
  "event_log": [
    { "turn": 1, "timestamp": "...", "event": {...} },
    ...
  ],
  "compressed_after_turn": 100
}
```

Event log é comprimido (deduplica eventos triviais) depois de N turnos pra não crescer infinito.

---

## Sistema de Modificadores

Toda ação do player pode ter modificadores baseados em:

```
final_roll = d20
           + relevant_stat_modifier
           + skill_proficiency
           + equipment_bonus
           + faction_standing_bonus
           + relationship_bonus (NPC te ama → +2 em diálogo)
           + trauma_penalty (-2 a -5 se trauma relevante)
           + morality_alignment_bonus (good acts com good characters)
           + environmental_modifier
           - difficulty_modifier
```

**Princípio:** Modificadores são transparentes pro player (UI mostra breakdown).

---

## Sistema de Consequências

Toda ação com peso narrativo gera **cascata de consequências**:

```
Player: "Mato o político corrupto em público"
    ↓
Event 1: NPC killed (político)
Event 2: Morality shift (-15, "executive justice")
Event 3: Faction rep change: Police Department (-30), Vigilantes (+10)
Event 4: NPC reaction: Cape allies (some trust you, some condemn)
Event 5: World event: Police investigation launched
Event 6: Possible follow-up: Suspected vigilantes rounded up
Event 7: Possible follow-up: Your allies targeted
```

Essas cascatas são **persistentes** — não dá pra desfazer com desculpa.

---

## Save/Load — Detalhes Técnicos

### Auto-Save

- Trigger: a cada 10 ações, ou após cena maior, ou a cada 30 min real-time
- Local: `saves/auto_<character_id>_<timestamp>.db`
- Mantém últimos 5 auto-saves (FIFO)

### Manual Save

- Player pode salvar a qualquer momento
- Save name customizável
- Save em slot separado (não sobrescreve auto)

### Load

- Lista de saves com: nome, location, level, time played, last action
- Preview: últimas 3-5 mensagens
- Click load → restaura estado + retoma narração

### Corruption Recovery

- Backup automático do save antes de overwrite
- Se save falhar validação, oferece rollback
- Event log permite replay se snapshot estiver corrompido

---

## Side Effects — World State Evolution

**O mundo se move independente do player:**

```typescript
// A cada tick de tempo in-game
function evolveWorld(state: GameState, timeDelta: number): WorldChange[] {
  const changes = [];
  
  // Faction dynamics
  for (const faction of state.factions) {
    const drift = calculateFactionDrift(faction, state);
    if (Math.abs(drift) > threshold) {
      changes.push({ type: 'FACTION_SHIFT', faction, delta: drift });
    }
  }
  
  // NPC agendas
  for (const npc of state.npcs) {
    if (npc.hasActiveAgenda(npc, state.time)) {
      changes.push({ type: 'NPC_ACTED', npc, action: npc.nextAction });
    }
  }
  
  // Random events
  if (Math.random() < 0.05) {
    changes.push({ type: 'AMBIENT_EVENT', event: randomEventFor(state.location) });
  }
  
  return changes;
}
```

Player pode descobrir essas mudanças via:
- NPCs comentam
- News broadcast (futuro)
- Visual changes em locations (futuro)

---

## Performance e Escalabilidade

**Single-player local-first**, então performance se resume a:

- **Latência de IA:** 1-5s pra Opus 4.8, 2-10s pra Ollama local. Mitigação: streaming.
- **Event log growth:** Compressão após 100 turns. Save inteiro tipicamente < 1MB.
- **NPC memory:** Limite de últimas 50 interações com cada NPC. Resumo automático quando passa.
- **World state:** Mutex para evitar race conditions em ticks concorrentes.

Não há preocupação com multi-usuário, deploy global, ou escala.

---

**Próximo:** `03-AI-ORCHESTRATOR.md` (especificação detalhada do orquestrador IA).

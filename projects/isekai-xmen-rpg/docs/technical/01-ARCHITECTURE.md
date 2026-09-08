# Arquitetura do Sistema

**Status:** Design fase 0 (validação pré-implementação)

---

## Visão em Camadas

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  Next.js 15 (App Router) + React 19 + Tailwind CSS         │
│  - Chat UI (mensagens streaming)                            │
│  - Painel de personagem (stats, inventário, moralidade)     │
│  - Wizard de criação de personagem                          │
│  - Mapa do mundo (visualização de facções/locações)         │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/JSON (REST) + SSE (streaming)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                        │
│  Node.js (API routes do Next.js ou servidor Express)        │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Game Engine  │  │   AI         │  │  Persistence │      │
│  │              │  │ Orchestrator │  │   Manager    │      │
│  │ - state      │  │              │  │              │      │
│  │   machine    │  │ - classifier │  │ - SQLite     │      │
│  │ - scene      │  │ - router     │  │   adapter    │      │
│  │   resolver   │  │ - prompt     │  │ - migrations │      │
│  │ - events     │  │   builder    │  │ - saves      │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼─────────────────┼─────────────────┼──────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌──────────────────┐ ┌─────────────────┐ ┌──────────────┐
│  Domain Logic    │ │  LLM Adapters   │ │  SQLite DB   │
│                  │ │                 │ │              │
│  - character     │ │  - Opus 4.8      │ │  - saves/    │
│    progression   │ │    client       │ │  - world.db  │
│  - combat        │ │  - Ollama       │ │              │
│    resolver      │ │    client       │ │              │
│  - relationship  │ │  - prompt       │ │              │
│    tracker       │ │    cache        │ │              │
└──────────────────┘ └─────────────────┘ └──────────────┘
```

---

## Componentes Principais

### 1. Game Engine (núcleo)

**Responsabilidade:** Manter estado coerente do jogo, validar ações do jogador, aplicar consequências, disparar eventos.

**Tipo:** Máquina de estados finita estendida + event sourcing.

```
Estados possíveis:
- CHARACTER_CREATION (wizard)
- EXPLORATION (livre movimento)
- DIALOGUE (em conversa com NPC)
- COMBAT (em turno)
- CUTSCENE (narrativa não-interativa)
- REST (recuperação, passagem de tempo)
- DEATH (game over parcial — pode haver retorno narrativo)
```

**Princípios:**
- Toda ação do jogador vira um `GameEvent` antes de virar mudança de estado
- Eventos são append-only (event log permite replay e debugging)
- Reducer puro aplica eventos ao estado
- State é serializável para save/load

### 2. AI Orchestrator (crítico)

**Responsabilidade:** Decidir qual modelo chamar, montar o prompt correto, gerenciar contexto, lidar com fallbacks.

**Fluxo:**

```
Player input
    ↓
[1. Pre-classifier] → tipo: combat | romance | dialogue | exploration | explicit
    ↓
[2. Context assembler] → busca:
    - world state atual
    - últimos 20 eventos
    - NPCs relevantes (com memória)
    - location description
    - faction relations relevantes
    - character stats relevantes para a cena
    ↓
[3. Prompt builder] → combina system prompt + context + player input
    ↓
[4. Router] → decide modelo:
    - Narrativa complexa, reflexão, world-building → Opus 4.8 Opus 4.8
    - Violência gráfica intensa, cenas sexuais explícitas → Ollama local
    - Combinação: Opus 4.8 gera cena + Ollama intensifica (pipeline)
    - Fallback: se Ollama cair, Opus 4.8 com prompt cuidadoso
    ↓
[5. LLM adapter] → chamada streaming (SSE para UI)
    ↓
[6. Post-processor] → valida output:
    - Não quebrou continuidade?
    - Mencionou consequências coerentes?
    - Respeitou moralidade atual?
    - Triggou eventos esperados?
    ↓
[7. Event applier] → converte output em GameEvent
    ↓
[8. State update] → aplica mudança
    ↓
[9. Side effects] → atualiza NPC memory, faction relations, etc.
```

**Detalhe completo:** `03-AI-ORCHESTRATOR.md`.

### 3. Persistence Manager

**Responsabilidade:** Salvar/carregar campanhas, manter integridade de dados.

**Esquema SQLite:**

```
character_saves (
  id, name, created_at, updated_at,
  world_state_json, character_json, event_log_json,
  npc_memory_json, faction_state_json,
  current_location, current_state, playtime_seconds
)
```

**Princípios:**
- Save completo do estado = uma linha
- Event log comprimido dentro do JSON (permite replay)
- Backup automático ao carregar (sobrescreve só em sucesso de save novo)
- Migrations versionadas (schema_version na primeira linha)

**Detalhe completo:** `05-DATA-MODEL.md`.

### 4. Domain Logic

**Módulos:**

- **`character/`** — stats, level, perks, mutations, morality, trauma
- **`combat/`** — iniciativa, dano, condições, hazards ambientais
- **`relationships/`** — affinity scores, trust/rival/love/loyalty, decay over time
- **`world/`** — time progression, faction dynamics, event triggers
- **`narration/`** — scene composition, narrative beats, tone control

Cada módulo é puro (recebe estado, retorna novo estado) onde possível.

---

## Fluxo de Dados: Uma Jogada Típica

```
1. Player digita: "Ataco o Sentinela com minha telecinese"
2. Frontend → POST /api/game/action
3. API route valida (autenticação, rate limit)
4. Game Engine processa:
   a. Valida ação (personagem tem telecinese? está em alcance?)
   b. Gera GameEvent: COMBAT_ATTACK_INITIATED
   c. Atualiza state: combat mode + initiative
5. AI Orchestrator:
   a. Classifica: combat
   b. Assembles context (combat state, character, NPCs, world)
   c. Build prompt (system + context + action)
   d. Route → Opus 4.8 Opus 4.8 (narrativa + consequências)
   e. Streams response
6. Post-processor valida (coerência, regras)
7. Aplica mudanças: dano, mortes, morale changes
8. Frontend renderiza streaming text + atualiza painel
9. Save automático a cada N eventos (ou por checkpoint)
```

---

## Padrões e Convenções

### TypeScript Everywhere
- Backend: TypeScript strict
- Frontend: TypeScript strict
- Schemas compartilhados via Zod (validação runtime + tipos estáticos)

### Event Sourcing
- Tudo que muda de estado é um evento
- Reducers são funções puras
- Replay é possível (debug, "undo", save states alternativos)

### Streaming First
- Respostas de IA são SSE (Server-Sent Events)
- UI renderiza incrementalmente (melhor UX, latência percebida menor)
- Frontend mostra tokens chegando em tempo real

### Local-First Mindset
- Tudo funciona offline se Ollama rodando
- Opus 4.8 é enhancement, não dependência crítica
- Saves são arquivos locais, copiáveis

### Separação de Camadas
- Apresentação não conhece IA diretamente
- IA não conhece UI
- Domain logic não toca rede

---

## Stack Técnico Decidido

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Frontend | Next.js 15 (App Router) | SSR, API routes integradas, ecossistema React maduro |
| UI | React 19 + Tailwind CSS | Velocidade de desenvolvimento, flexibilidade |
| State (frontend) | Zustand | Simples, performático, sem boilerplate |
| Backend | Next.js API routes + Node 20+ | Mesma codebase, deploy unificado |
| LLM Cloud | @anthropic-ai/sdk | Cliente oficial, streaming nativo |
| LLM Local | ollama npm client | HTTP local, fácil de mockar/testar |
| DB | better-sqlite3 | Sync API, rápido, arquivo único |
| Validation | Zod | Schemas compartilhados front/back |
| Testes | Vitest | Compatível com TS e Next.js |
| Logging | Pino estruturado | JSON logs, fácil de parsear |

---

## Decisões Arquiteturais (ADRs)

Resumo. Detalhes em `meta/40-DECISIONS-LOG.md`.

- **ADR-001:** Event sourcing para game state — debug, replay, save confiável.
- **ADR-002:** Híbrido Opus 4.8 + Ollama — cobertura completa de conteúdo adulto sem comprometer narrativa.
- **ADR-003:** SQLite local — zero-setup, backup trivial, suficiente para single-player.
- **ADR-004:** Next.js monolítico — MVP rápido, separação de camadas internas mantém opções abertas.
- **ADR-005:** Streaming SSE first — UX importa desde o dia 1.

---

## Diagramas Adicionais

### Boot Sequence

```
npm install
    ↓
[Setup] checa ANTHROPIC_API_KEY (gateway global OK)
    ↓
[Setup] checa Ollama rodando (porta 11434)
    ↓
[Setup] roda migrations SQLite (cria schema se necessário)
    ↓
[Setup] carrega world bible seed (NPCs, factions, locations)
    ↓
Next.js dev server pronto
```

### Save/Load Sequence

```
SAVE:
  1. Snapshot state completo
  2. Compacta event log (deduplica, ordena)
  3. Valida schema (Zod)
  4. Escreve SQLite row
  5. Backup automático do save anterior

LOAD:
  1. Lê SQLite row
  2. Valida schema (Zod)
  3. Migra se schema_version < current
  4. Replay event log (ou usa snapshot se versão bater)
  5. Carrega no Game Engine
  6. Frontend renderiza estado inicial
```

---

**Próximo:** `02-SYSTEM-DESIGN.md` (detalhes do engine, state machine, save/load).

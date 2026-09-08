# Decision Log — Architecture Decision Records (ADRs)

**Status:** Documentação arquitetural

---

## ADR-001: Event Sourcing para Game State

**Status:** DECIDED

**Problema:**
- Save/load precisa ser 100% confiável
- Debug requer replay de eventos
- Undo/alternate timelines seria bom ter opção

**Decisão:**
Usar event sourcing. Estado = snapshot + log de eventos.

**Consequências:**
- ✅ Save é transação (ou tudo, ou nada)
- ✅ Replay permite debug
- ✅ Event log é trilha de auditoria (fair for player disputes)
- ❌ Event log cresce indefinidamente (mitigação: compressão a cada 100 turns)
- ❌ Lógica é mais complexa (reducer puro)

**Alternativas Rejeitadas:**
- Direct state mutations: não confiável, hard to debug
- Relational DB: overkill pra single-player
- NoSQL document: evento sourcing é melhor aqui

---

## ADR-002: Hybrid AI (Opus 4.8 + Ollama)

**Status:** DECIDED

**Problema:**
- Claude API tem content policy (sem explícito adulto)
- Modelos locais são uncensored mas lower quality
- Player quer conteúdo adulto completo

**Decisão:**
Router que decide qual modelo por tipo de cena.

**Consequence Mapping:**
```
Opus 4.8 (Anthropic API):     Narrativa complexa, relacionamentos, diplomacia
Ollama (local uncensored):    Violência gráfica, conteúdo sexual explícito
Pipeline (both):              Cenas que combinam (setup narrativo + explícito)
```

**Consequências:**
- ✅ Cobertura completa de conteúdo
- ✅ Narrativa permanece high-quality (Opus 4.8)
- ✅ Conteúdo adulto sem censura (Ollama)
- ❌ Complexidade de orquestração
- ❌ Custo Opus 4.8 mais alto
- ❌ Ollama requer GPU local (fallback em CPU muito lento)

**Alternativas Rejeitadas:**
- Only Opus 4.8: Censored, player unhappy
- Only Ollama local: Quality inconsistent, sempre offline
- Prompt caching bypass: Not sustainable, against ToS
- Different API (OpenAI, etc): Menos capaz

---

## ADR-003: SQLite vs Postgres vs Files

**Status:** DECIDED

**Problema:**
- Single-player, local-first
- Save/load confiabilidade crítica
- Sem servidor

**Decisão:**
SQLite. Um arquivo, backup trivial, ACID completo.

**Consequências:**
- ✅ Zero setup
- ✅ Portável (copy arquivo)
- ✅ Rápido (local disk)
- ❌ Não multiprocess-safe (mas single-player, ok)
- ❌ Sem replicação automática
- ❌ Sem cloud sync (mas é futura extensão)

**Alternativas Rejeitadas:**
- Postgres: Overkill, requires server
- Files (JSON): Sem schema validation, hard to migrate
- LMDB: Ainda quer abstração melhor

---

## ADR-004: Next.js Monolítico vs Microserviços

**Status:** DECIDED

**Problema:**
- MVP rápido
- Single developer
- Sem deploy complexidade

**Decisão:**
Next.js app router com API routes integradas. Tudo num projeto.

**Benefício:**
- ✅ Rápido pra prototipo
- ✅ Deployment Vercel trivial (futura, se quiser)
- ✅ Código compartilhado frontend/backend (Zod types)
- ✅ DX excelente (HMR, debugging integrado)
- ❌ Escalabilidade limitada
- ❌ Se viral, requer refactor depois

**Alternativas Rejeitadas:**
- Monolito Node/Express: Possível mas Next.js tem mais features
- Microserviços: Overkill pra MVP
- Serverless functions: Cold start issues pra game loop

---

## ADR-005: Streaming SSE First

**Status:** DECIDED

**Problema:**
- Opus 4.8 latência 2-5s perceptível
- UX: user espera feedback

**Decisão:**
Usar streaming (SSE) desde dia 1. Player vê tokens chegando em tempo real.

**Consequências:**
- ✅ Latência percebida reduzida
- ✅ User engagement (vê "IA pensando")
- ✅ Paralelo: UI pode processar enquanto LLM gera
- ❌ Frontend complexity (stream handling)
- ❌ Parsing JSON/events parciais

**Alternativas Rejeitadas:**
- Polling: Mais simples mas lento
- WebSockets: Overkill, SSE basta

---

## ADR-006: No Multiplayer in MVP

**Status:** DECIDED

**Problema:**
- Multiplayer add 5x complexity
- Sem prioridade do user (solo focus)

**Decisão:**
MVP é solo. Multiplayer é post-launch roadmap.

**Consequências:**
- ✅ Simplifica design state (sem race conditions)
- ✅ Simplifica narração (sem "outras pessoas vendo tua cena")
- ❌ Community play não suportado ainda

---

## ADR-007: Português First

**Status:** DECIDED

**Problema:**
- User is PT-BR
- Narrativa é cultural

**Decisão:**
Sistema é 100% português. English futura se houver demand.

**Consequências:**
- ✅ Narrativa mais autêntica
- ✅ Worldbuilding localizado
- ❌ Menos audiência inicial
- ❌ Tradução inglês é futura tarefa

---

## ADR-008: Content Gating (Opt-in Warnings, Not Censoring)

**Status:** DECIDED

**Problema:**
- Conteúdo adulto é core
- Mas player precisa consentir
- Não é censura, é transparency

**Decisão:**
Antes de cena NSFW: "Próxima cena contém [tipo]. Continuar?"

**Consequências:**
- ✅ Player tem controle total
- ✅ Narrativa preservada (não dilui)
- ✅ Safe space: pode pular sem guilt
- ❌ Rompe imersão (mas player escolhe)

---

## ADR-009: Level Max 20 (Not Endless Grind)

**Status:** DECIDED

**Problema:**
- RPG design: player quer progression
- Mas game não é sobre grind

**Decisão:**
Max level 20. Chega-se em ~30-40 horas de gameplay.

**Consequências:**
- ✅ Story arc é closure (não "sempre mais")
- ✅ Power creep controlado
- ✅ Replayability (new game+ com class changes)
- ❌ Alguns players want endless progression

---

## ADR-010: Permadeath (with Story Exceptions)

**Status:** DECIDED

**Problema:**
- Death feels meaningless se respawn
- Mas também player pode acumular frustração

**Decisão:**
Morte é permanente. NPC novo personagem herdando legacy.

**Consequências:**
- ✅ Consequências importam
- ✅ Aversão ao risco real
- ✅ Cada momento conta
- ❌ Player investment pode ser perdido (mitigação: speedrun new character com bônus legacy)

---

## ADR-011: 12 X-Gene Classes (não ilimitado)

**Status:** DECIDED

**Problema:**
- Infinitos poderes = design nightmare
- Mas quer variedade

**Decisão:**
12 classes base com synergies (não 100 builds possíveis).

**Consequências:**
- ✅ Balanceamento gerenciável
- ✅ Replayability (12 arquétipos distintos)
- ✅ Synergies criam meta
- ❌ Some players want full customization

---

## ADR-012: No "New Game+ is Canon" (Branching Timelines Instead)

**Status:** DECIDED

**Problema:**
- New game+ pede "what if"
- Mas mundo não pode ter "many yous"

**Decisão:**
Cada personagem é indepêndente. New game+ começa fresco, mundo ignora chars anteriores.

**Futuro:** Post-launch: NG+ mode onde novo char vê "ruins" do antigo (lore threads).

---

**Próximo:** `41-CHANGELOG.md` (doc history) e `42-TODO.md` (backlog técnico).

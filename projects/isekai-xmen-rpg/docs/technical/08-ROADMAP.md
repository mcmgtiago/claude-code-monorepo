# Roadmap — Fases & Deliverables

**Status:** Planejamento fase 0

---

## Timeline Overview

```
PHASE 0: Documentation        [Current] ~1-2 semanas
PHASE 1: MVP CLI              ~3-4 semanas
PHASE 2: Wizard & Web UI      ~2-3 semanas
PHASE 3: Memória & NPCs       ~2-3 semanas
PHASE 4: Polish & Hybrid AI   ~1-2 semanas
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL ESTIMATED              ~10-15 semanas (~2-3 meses)
```

---

## Phase 0 — Documentation (Current)

**Goal:** Tudo documentado antes de escrever uma linha de código.

### Deliverables
- [x] 00-README.md — Project overview
- [x] 01-ARCHITECTURE.md — Tech stack & flow
- [x] 02-SYSTEM-DESIGN.md — Game engine & state machine
- [x] 03-AI-ORCHESTRATOR.md — IA router & prompts
- [ ] 04-API-CONTRACTS.md — REST endpoints
- [ ] 05-DATA-MODEL.md — SQLite schemas
- [ ] 06-PROMPTS.md — System prompt templates
- [ ] 07-CONTENT-POLICY.md — Content gating & safety
- [ ] 08-ROADMAP.md — Este arquivo
- [ ] 09-DEV-SETUP.md — Local setup guide
- [ ] 10-WORLD-OVERVIEW.md — Lore & cosmology
- [ ] 11-FACTIONS.md — 7 facções detalha + quests
- [ ] 12-X-GENE-CLASSES.md — 12 poderes, synergies
- [ ] 13-NPCS-SEED.md — 30+ NPCs principais
- [ ] 14-ISEKAI-MECHANICS.md — Transporte & memory
- [ ] 15-STORY-ARCS.md — 5 arcos principais
- [ ] 16-LOCATIONS.md — Mapas, descriptions
- [ ] 20-GDD-CORE.md — Game design doc
- [ ] 21-PROGRESSION.md — XP, perks, leveling
- [ ] 22-COMBAT.md — Combat rules & resolution
- [ ] 23-MORALITY.md — Alignment system
- [ ] 24-RELATIONSHIPS.md — NPC affinity & love
- [ ] 25-TRAUMA-AND-MEMORY.md — Trauma system
- [ ] 30-COST-ESTIMATES.md — API pricing
- [ ] 31-LOCAL-MODELS.md — Ollama guide
- [ ] 32-TROUBLESHOOTING.md — Debug & errors
- [ ] 40-DECISIONS-LOG.md — ADRs
- [ ] 41-CHANGELOG.md — Doc changelog
- [ ] 42-TODO.md — Backlog

**Success Criteria:**
- [ ] Todos os docs acima completos
- [ ] Nenhuma contradição entre docs
- [ ] Estimativas técnicas validadas
- [ ] Prompts mestres testados (prompts.md)

**Effort:** ~40-60 horas solo (research + writing + validation)

---

## Phase 1 — MVP CLI (No UI, Terminal Only)

**Goal:** Engine funcionando. Sem visual bonito, sem web. Puro gameplay.

### Features
- Character creation wizard (readline prompts)
- Chat-based input/output (colors no terminal)
- Game loop rodando (input → LLM → consequences → output)
- Save/load (JSON files primeiro, depois SQLite)
- Basic stats (HP, XP, moralidade)
- Combat resolution (d20 + modifiers, simples)
- 2-3 NPCs seed com memória básica
- 2 locations (Xavier's, Madripoor intro)
- ~5 starter quests

### Tech Stack
- Node.js 20+ + TypeScript
- @anthropic-ai/sdk (Opus 4.8 only, não Ollama yet)
- Zod (schemas)
- Pino (logging)
- Better-sqlite3 (DB)
- Chalk (terminal colors)

### Architecture
```
src/
├── core/
│   ├── GameEngine.ts
│   ├── StateManager.ts
│   └── EventSourcing.ts
├── ai/
│   ├── Classifier.ts
│   ├── PromptBuilder.ts
│   └── ApiClient.ts (Anthropic only)
├── domain/
│   ├── Character.ts
│   ├── Combat.ts
│   ├── NPC.ts
│   └── World.ts
├── persistence/
│   ├── SaveManager.ts
│   └── migrations.ts
├── ui/
│   ├── CLI.ts (readline input)
│   └── Formatter.ts
└── index.ts (main game loop)
```

### Validation
- [ ] Personagem criada e salva
- [ ] Comando "talk to [NPC]" funciona
- [ ] Comando "attack [enemy]" resolve combate
- [ ] Save/load funciona (state consistency)
- [ ] AI responde em português
- [ ] Sem crashes em 1h gameplay

**Effort:** ~80-120 horas (engine core, AI integration, basic UI)

---

## Phase 2 — Wizard & Web UI

**Goal:** Interface bonita. Criação visual. Web-ready.

### Features
- Next.js 15 setup (app router, API routes)
- Tailwind CSS (styling)
- Chat UI (messages streaming, better UX)
- Character creation wizard (multi-step form)
- Character sheet panel (stats, inventory, relations)
- Save/load slots visual
- Handoff: carry save files de CLI → web

### Components
```
app/
├── api/
│   ├── game/
│   │   ├── action.ts
│   │   ├── save.ts
│   │   └── load.ts
│   └── character/
│       └── create.ts
├── game/
│   ├── page.tsx (main game UI)
│   ├── layout.tsx
│   ├── components/
│   │   ├── ChatWindow.tsx
│   │   ├── CharacterSheet.tsx
│   │   ├── ActionsPanel.tsx
│   │   └── CreationWizard.tsx
│   └── lib/
│       ├── gameClient.ts
│       └── hooks.ts
└── page.tsx (landing)
```

### Validation
- [ ] Criar personagem via wizard completo
- [ ] Chat streaming (SSE) funciona
- [ ] Character sheet atualiza em tempo real
- [ ] Save/load slots visual
- [ ] Responsivo mobile-ready

**Effort:** ~60-80 horas (UI, streaming, forms, styling)

---

## Phase 3 — Memory & NPCs

**Goal:** NPCs lembram o que você fez. Mundo reage.

### Features
- NPC memory system (últimas 50 interações)
- Relationship tracking (trust/rival/love/loyalty scores)
- NPC agendas (agem mesmo quando offline)
- Faction dynamics (reputação)
- Quest chains (multi-stage)
- 15-20 NPCs expandidos (não só seed)
- World state evolution (ambient events, time passage)

### Persistence
```
npc_memory[
  {
    npc_id: 'rogue',
    interactions: [
      { turn: 42, action: 'PLAYER_HELPED_NPC', notes: 'saved from police' },
      { turn: 50, action: 'PLAYER_KISSED_NPC', notes: 'risky move, she became comatose' }
    ],
    relationship: { trust: 50, love: 80, rival: 0, loyalty: 30 },
    current_mood: 'guilt-ridden',
    agenda: 'find cure for coma'
  },
  // ... mais NPCs
]
```

### Validation
- [ ] NPC lembra eventos de turns anteriores
- [ ] Tone muda baseado em relationship
- [ ] Facção reputação afeta quests disponíveis
- [ ] World events acontecem sem player

**Effort:** ~60-100 horas (state tracking, NPC AI, quest systems)

---

## Phase 4 — Polish & Hybrid AI

**Goal:** Opus 4.8 + Ollama. Conteúdo adulto completo.

### Features
- AI Orchestrator (router Opus 4.8 vs Ollama)
- Ollama integration (local model support)
- Pipeline mode (setup + explicit + aftermath)
- Content gating (age checks, warnings before NSFW)
- Image generation stub (ready for DALL-E/Stable Diffusion later)
- Advanced NPC features (jealousy, trauma, betrayal)
- Story arcs (Intro → Crisis → Climax → Resolution)
- 30+ NPCs completos

### Validation
- [ ] Diálogo romance funciona com Ollama
- [ ] Combate violência funciona
- [ ] Pipeline mode completo
- [ ] Fallback chain testado
- [ ] Cost estimation validada

**Effort:** ~100-150 horas (AI orchestration, fallbacks, story content, NPC depth)

---

## Phase 5+ — Future (Não no MVP)

- Multiplayer co-op
- New Game+ (mundo lembra actions do personagem anterior)
- Character import/export (compartilhar personagens)
- Voice narration
- Background music
- Procedural location generation
- More X-gene types
- Genosha expansion arc
- Hellfire Club deep dive
- End-game scenarios (ascension, exile, leadership)

---

## Dependencies & Blockers

### Phase 1 → Phase 2
- **Blocker:** Phase 1 engine stability. Se crashes, phase 2 breaks.
- **Validation:** 1h gameplay CI CD + no crashes.

### Phase 2 → Phase 3
- **Blocker:** Web UI responsive. NPC system depends on clean state management.
- **Validation:** Mobile browser tests.

### Phase 3 → Phase 4
- **Blocker:** NPC memory stable. AI orchestration complex.
- **Validation:** Prompt templates validated com real Opus 4.8 + Ollama local.

---

## Effort Estimation Summary

| Phase | Estimated Hours | Team Size | Duration |
|-------|-----------------|-----------|----------|
| 0 | 40-60 | 1 | 1-2 semanas |
| 1 | 80-120 | 1 | 2-3 semanas |
| 2 | 60-80 | 1 | 1-2 semanas |
| 3 | 60-100 | 1 | 1-2 semanas |
| 4 | 100-150 | 1 | 2-3 semanas |
| **Total** | **340-510** | **1** | **~3 meses** |

---

## Success Criteria (MVP Complete)

- [ ] Character can be created, saved, loaded
- [ ] 2h+ gameplay without crash
- [ ] AI responds in Portuguese naturally
- [ ] NPCs remember interactions
- [ ] Combat funciona
- [ ] Opus 4.8 + Ollama integrados
- [ ] Content warnings pre-NSFW scenes
- [ ] Save files are portable (web ↔ CLI)

---

**Next:** Return to plan and request approval via ExitPlanMode.

# Isekai X-Men RPG

**Um RPG narrativo baseado em IA generativa. Você é transportado para um universo mutante e suas escolhas definem o destino.**

## Quick Start

```bash
npm install
npm run dev
# Abra http://localhost:3000
```

## Visão Geral

- **Plataforma:** Web browser (Next.js 15)
- **Engine IA:** Claude Opus 4.8 (narrativa) + Ollama local (conteúdo adulto)
- **Persistência:** SQLite local
- **Linguagem:** Português (PT-BR)
- **Foco:** Storytelling narrativo, consequências permanentes, adulto responsável

## Características

✅ **Criação de Personagem Guiada** — stats, mutação, backstory  
✅ **Chat-Based Gameplay** — texto livre, narrativa emergente  
✅ **NPCs com Memória** — lembram tudo que você fez  
✅ **Moralidade Dinâmica** — -100 (vilão) a +100 (herói)  
✅ **Consequências Permanentes** — morte, traição, redenção  
✅ **Conteúdo Adulto** — violência contextualizada, romance, cenas explícitas  
✅ **Save/Load Local** — múltiplos slots  

## Estrutura

```
app/
├── api/game/action    # POST handler para ações do jogador
├── api/character/     # POST handler para criar personagem
├── game/              # Página principal do jogo
│   ├── page.tsx       # Chat UI + state management
│   └── components/    # ChatWindow, CharacterSheet
└── page.tsx           # Landing page

src/
├── core/              # Game engine (reducers, state machine)
├── ai/                # IA adapters (Classifier, PromptBuilder, Anthropic)
├── domain/            # Game logic (Character, World, NPC)
├── persistence/       # SQLite integration
└── types/             # Zod schemas
```

## Documentação

- `docs/` — Arquitetura, game design, lore, NPCs (14+ documentos)
- `DEV-SETUP.md` — Setup local
- `PHASE1-LOG.md` — Progresso da implementação

## Environment

Use **variáveis globais do Windows** (não .env):

```
ANTHROPIC_AUTH_TOKEN=<sua_chave>
ANTHROPIC_BASE_URL=<seu_gateway_ou_anthropic.com>
```

## Roadmap

| Fase | Status | ETA |
|------|--------|-----|
| 0 — Documentação | ✅ | Completo |
| 1 — MVP Core Engine | 🔄 | Esta semana |
| 2 — Web UI Polish | ⏳ | Próxima semana |
| 3 — NPC Memory + World | ⏳ | Semana 3 |
| 4 — Hybrid AI + Ollama | ⏳ | Semana 4 |

## Tecnologias

- **Frontend:** React 19, Next.js 15, Tailwind CSS 4
- **Backend:** Node.js 20, Next.js API Routes
- **LLM:** @anthropic-ai/sdk (Opus 4.8 API)
- **DB:** better-sqlite3
- **Validation:** Zod
- **Language:** TypeScript (strict mode)

## Desenvolvedores

Criado por Claude (Opus 4.8) via Anthropic SDK.

---

**Status:** Phase 1 implementação em progresso  
**Última atualização:** 2026-08-24  
**Licença:** MIT

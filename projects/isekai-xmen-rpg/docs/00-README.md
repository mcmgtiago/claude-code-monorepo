# Isekai X-Men RPG — Visão Geral

**Status:** Documentação fase 0 (pré-implementação)  
**Plataforma:** Web (browser)  
**Backend IA:** Claude Opus 4.8 API + Ollama local (híbrido)  
**Conteúdo:** Adulto completo (violência gráfica + romance maduro + cenas explícitas)  
**Audiência:** Solo (dev = jogador)

---

## Conceito

RPG narrativo em formato chat, onde o jogador é transportado para um universo mutante estilo X-Men (isekai) e deve construir uma vida nesse mundo. Combina:

- **Criação de personagem guiada** (wizard multi-step)
- **Storytelling emergente** gerado por IA com consequências reais
- **Progressão por escolhas narrativas** (não grind mecânico)
- **Conteúdo adulto maturado** (violência contextualizada, romance adulto, cenas explícitas entre adultos)
- **Persistência de campanha** (save/load entre sessões)

O mundo tem facções políticas, NPCs com memória de longo prazo, sistema de moralidade rastreado, trauma persistente e arcos emocionais.

---

## Pilares de Design

1. **Consequência > Coletável** — Toda escolha fecha portas e abre outras. Não existe "boa escolha universal".
2. **NPCs como pessoas** — Têm agendas, traumas, favoritos. Lembram o que você fez. Podem morrer, trair ou se apaixonar.
3. **Poder com custo** — Toda classe de mutação tem fraqueza narrativa + mecânica. Poder demais isola.
4. **Mundo respira** — Fações se movem mesmo quando você não está olhando. Sua ausência tem consequência.
5. **Adulto responsável** — Violência tem peso, romance tem agency, cenas explícitas exigem consentimento narrativo e emocional dos personagens.

---

## Stack Resumido

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 15 + React + Tailwind CSS |
| Backend | Node.js API routes (Next.js) |
| LLM Cloud | Claude Opus 4.8 (Anthropic API via gateway global) |
| LLM Local | Ollama (modelo uncensored, ex: Mythomax 13B) |
| Persistência | SQLite (better-sqlite3) |
| State Engine | Máquina de estados finita + árvore de cenas |
| Geração Imagem | Opcional, via API externa (Stable Diffusion / DALL-E) |

---

## Estrutura da Documentação

```
docs/
├── 00-README.md              ← você está aqui
├── technical/                ← como o sistema funciona
├── world/                    ← lore, facções, NPCs, arcos
├── design/                   ← mecânicas de jogo (progressão, combate, moralidade)
├── ops/                      ← custos, modelos locais, troubleshooting
└── meta/                     ← decisões, changelog, backlog
```

**Ordem de leitura recomendada:**
1. Este arquivo (00-README)
2. `world/10-WORLD-OVERVIEW.md` — entender o setting
3. `design/20-GDD-CORE.md` — entender os pilares
4. `technical/01-ARCHITECTURE.md` — entender como vai ser construído
5. Demais conforme necessidade

---

## Fases do Projeto

| Fase | Entregável | Status |
|------|-----------|--------|
| **0** | Documentação completa | 🔄 Em progresso |
| **1** | MVP CLI: engine narrativo + save/load + stats + combate básico | ⏳ Pendente |
| **2** | Wizard de criação de personagem | ⏳ Pendente |
| **3** | Memória de longo prazo (NPCs + world state) | ⏳ Pendente |
| **4** | Web UI (chat + painel de personagem) | ⏳ Pendente |
| **5** | Orquestrador híbrido Opus 4.8 + Ollama | ⏳ Pendente |
| **6** | Polish (imagens, música, save slots) | ⏳ Pendente |

Detalhes em `technical/08-ROADMAP.md`.

---

## Decisões Chave (até agora)

- **Híbrido IA:** Opus 4.8 para narrativa profunda + reflexão; Ollama local para violência gráfica + cenas explícitas (filtros mais permissivos).
- **Persistência:** SQLite local (arquivo único, backup trivial, sem setup de servidor).
- **Escopo adulto:** Camadas de intensidade, gating baseado em arco narrativo (não aleatório).
- **Single-player:** Sem multiplayer nesta versão. Multiplayer é extensão futura.

Registro completo em `meta/40-DECISIONS-LOG.md`.

---

## Próximos Passos Imediatos

1. ✅ Estrutura de documentação criada
2. 🔄 Preencher world bible (factions, NPCs seed, arcos)
3. ⏳ Validar arquitetura técnica
4. ⏳ Iniciar implementação do MVP CLI (fase 1)

---

**Mantido por:** dev único (você)  
**Última atualização:** 2026-08-24

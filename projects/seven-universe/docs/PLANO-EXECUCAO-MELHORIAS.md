# Plano de Execução — Melhorias Sistêmicas (menos polish visual)

**Escopo:** tudo que melhora qualidade/profundidade dos 17 universos, exceto UI/Visual Novel.
**Método:** uma frente por vez, testar, seguir.

---

## FRENTE 1: Roteamento de Velocidade (Sonnet/Opus) ⚡
**Impacto: ALTÍSSIMO (afeta 100% das interações)**

### Problema
Todo turno usa Opus 4.8 + tool-use loop = 10-20s. Mata o ritmo.

### Solução
Classificar a ação e rotear:
- **Sonnet 4.6** (3-5s): turnos comuns — explorar, conversar, ações simples, criação de personagem, geração de campos
- **Opus 4.8** (10-15s): momentos épicos — combate importante, evolução de poder, cenas-chave, crossroads, boss fights

### Como decidir
Detector simples (keywords + estado): combate ativo, evolução, primeira vez de NPC importante → Opus. Resto → Sonnet.

### Arquivos
- `app/api/game/action/route.ts` — função `pickModel(state, message)` + usar no client.messages.create

**Estimativa: 1h**

---

## FRENTE 2: NPCs Profundos + Memória Estruturada 🧠
**Impacto: ALTÍSSIMO (mundo vivo, coerência)**

### Problema
NPC hoje = { nome, afinidade, bondStage }. IA esquece detalhes, inventa incoerências.

### Solução
Ficha de NPC real e persistente:
```typescript
interface NPCProfile {
  id, name, faction, appearance,     // fixos
  personality, agenda, secrets,       // caráter
  affinity, trust, desire, fear,      // eixos emocionais
  memories: string[],                 // o que lembra do player
  lastSeen: number, status: string,   // vivo/morto/ferido
  history: string[],                  // eventos com o player
}
```
- Deep memory: banco de FATOS que a IA consulta ("o que aconteceu com X?")
- Quando NPC reaparece, IA recebe a ficha completa → coerência total

### Arquivos
- `src/engine/state.ts` — expandir Relationship → NPCProfile
- `src/engine/memory-deep.ts` (novo) — banco de fatos estruturado
- `route.ts` — injetar fichas de NPCs presentes no contexto

**Estimativa: 3h**

---

## FRENTE 3: Consequência em Cascata 🌊
**Impacto: ALTO (escolhas importam de verdade)**

### Problema
Ações não geram reações futuras. Mundo estático.

### Solução
```typescript
interface PendingConsequence {
  trigger: string;      // o que causou
  consequence: string;  // o que vai acontecer
  turnsUntil: number;
  severity: number;
  avoidable: boolean;
}
```
- IA gera 1-3 consequências futuras em ações significativas
- Ficam pendentes, disparam nos próximos turnos
- Matar lorde → vingança da família (5 turnos depois), facção em caos, etc

### Arquivos
- `src/engine/consequences.ts` (novo)
- `route.ts` — tool `add_consequence` + checar pendentes a cada turno

**Estimativa: 2h**

---

## FRENTE 4: Facções Vivas + Reputação Multifacetada 🏛️
**Impacto: ALTO (mundo político real)**

### Problema
Facções são só nome. Reputação é 1 número.

### Solução
```typescript
interface Faction {
  id, name, leader, resources, territory,
  objectives, enemies, allies,
  playerRep, playerRank,        // outsider→membro→líder
  factionRelations,             // rep entre facções
}
interface Reputation {
  byFaction, byRegion, byTrait,  // rede, não número
  title, wanted, bounty,
}
```
- World tick: facções agem sozinhas (guerra, expansão)
- Player sobe de rank, pode virar líder ou fundar facção
- Reputação por região/facção/traço (temido aqui, amado ali)

### Arquivos
- `src/engine/factions.ts` (novo)
- Cada universo define suas facções no `index.ts`
- `route.ts` — world tick de facções + tool de reputação

**Estimativa: 3h**

---

## FRENTE 5: Corpo Persistente + Tempo/Envelhecimento 🩸
**Impacto: MÉDIO-ALTO (imersão, consequência física)**

### Problema
Ferimentos resetam. Sem passagem de tempo real. Sem trauma.

### Solução
```typescript
interface Body {
  wounds: Wound[],       // curam com tempo
  scars: string[],       // permanentes
  conditions: [],        // doente, envenenado, grávida, viciado
  trauma: PsychTrauma[], // dispara em situações
  age, fitness, addiction,
}
```
- Ferimentos curam ao longo de turnos (não reset)
- Cicatrizes entram na descrição permanente
- Trauma dispara em gatilhos (IA narra)
- Tempo passa, NPCs/player envelhecem, eventos com prazo

### Arquivos
- `src/engine/state.ts` — adicionar Body ao character
- `src/engine/body.ts` (novo) — lógica de cura/trauma/tempo
- `route.ts` — processar cura por turno

**Estimativa: 2.5h**

---

## FRENTE 6: Objetivos de Longo Prazo + Arcos Narrativos 🎬
**Impacto: ALTO (direção, crescendo dramático)**

### Problema
Jogo vaga sem rumo. Sem endgame, sem arco.

### Solução
- IA detecta o OBJETIVO do player (virar rei, vingança, dominar poder)
- Conduz arco em 5 atos (chamado→ascensão→queda→renascimento→clímax)
- Move NPCs/eventos em direção ao objetivo
- Detecta em qual ato está (turnCount + powerStage + fatos) e ajusta tom

```typescript
interface Narrative {
  playerGoals: LongTermGoal[],
  currentAct: 1|2|3|4|5,
  nemesis: string | null,   // vilão pessoal recorrente
  tension: number,          // quão perto do clímax
}
```

### Arquivos
- `src/engine/narrative.ts` (novo)
- `route.ts` — detectar objetivos, injetar direção de arco no prompt

**Estimativa: 2.5h**

---

## FRENTE 7: Expandir Lore dos Universos Novos 📚
**Impacto: MÉDIO-ALTO (autenticidade)**

### Problema
Os 13 universos criados hoje têm lore de ~1 parágrafo. IA improvisa demais.

### Solução
Pra cada universo: expandir `systemPromptLore` + criar banco de NPCs canônicos com ficha.
- Naruto: NPCs (Naruto, Sasuke, etc), vilas, jutsus específicos
- DBZ: níveis de poder, sagas, transformações detalhadas
- One Piece: mares, frutas, Yonkou, Marines
- etc (todos)

### Arquivos
- `src/universes/[id]/lore.ts` (novo por universo)
- `src/universes/[id]/npcs.ts` (banco de NPCs canônicos)

**Estimativa: ~40min por universo × 13 = ~9h**

---

## ORDEM DE EXECUÇÃO

| Ordem | Frente | Tempo | Por quê primeiro |
|-------|--------|-------|------------------|
| 1 | Velocidade (Sonnet/Opus) | 1h | Ganho imediato universal |
| 2 | NPCs profundos + memória | 3h | Base pra tudo (facções, consequência usam) |
| 3 | Consequência em cascata | 2h | Usa memória, mundo vivo |
| 4 | Facções vivas + reputação | 3h | Usa NPCs, política real |
| 5 | Corpo + tempo | 2.5h | Independente, imersão |
| 6 | Objetivos + arcos | 2.5h | Amarra tudo em narrativa |
| 7 | Lore dos universos | 9h | Contínuo, por universo |

**Total: ~23h de dev (fora lore que é incremental)**

---

## COMEÇAR POR: Frente 1 (Velocidade)
Ganho imediato, sentido em todos os turnos, base pra testar o resto rápido.

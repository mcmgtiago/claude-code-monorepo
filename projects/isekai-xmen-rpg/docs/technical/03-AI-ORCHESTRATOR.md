# AI Orchestrator — Especificação Completa

**Status:** Design fase 0  
**Crítico:** Este é o componente mais complexo do sistema.

---

## Visão Geral

O Orchestrator é o "cérebro" que decide:
1. **O quê** perguntar ao LLM (prompt assembly)
2. **Para quem** perguntar (routing: Opus 4.8 vs Ollama vs pipeline)
3. **Como** validar a resposta (post-processing)
4. **Quando** corrigir (fallback + retry)

---

## Diagrama de Fluxo Completo

```
┌──────────────────────────────────────────────────────────────┐
│                   PLAYER INPUT                                │
│  Ex: "Beijo a Rogue mesmo sabendo que pode me matar"         │
└─────────────────────────┬────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 1: PRE-CLASSIFIER                                      │
│  Analisa input + current state → classifica cena             │
│                                                              │
│  Classificações:                                             │
│    DIALOGUE        → conversa normal, informação              │
│    COMBAT          → ação agressiva, defesa, fuga             │
│    EXPLORATION     → busca, investigação, movimento           │
│    ROMANCE         → interação afetiva, intimidade            │
│    EXPLICIT_SEXUAL → conteúdo sexual explícito entre adultos  │
│    EXPLICIT_VIOLENCE → tortura, gore detalhado                │
│    INTROSPECTION   → reflexão interna, memória, trauma        │
│    WORLD_EVENT     → algo maior que o player (terremoto, etc) │
│                                                              │
│  Implementação: regex patterns + state context                │
│  (não precisa LLM, é heurística + keywords + state machine)  │
└─────────────────────────┬────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 2: CONTEXT ASSEMBLER                                   │
│                                                              │
│  Busca e monta o contexto relevante:                         │
│                                                              │
│  ┌─────────────────────────────────────────────────┐         │
│  │ a. World state (location, time, weather)        │         │
│  │ b. Character snapshot (stats, hp, moral, perks) │         │
│  │ c. Active NPCs (personalidade + memória curta)  │         │
│  │ d. Últimos 20 eventos (comprimidos)             │         │
│  │ e. Faction standings relevantes                 │         │
│  │ f. Active quests                                │         │
│  │ g. Emotional state do personagem                │         │
│  │ h. Traumas ativos (modificam tom)               │         │
│  └─────────────────────────────────────────────────┘         │
│                                                              │
│  Token budget: ~6000 tokens de contexto + system prompt      │
│  Se exceder, prioriza: recent > character > NPCs > world     │
└─────────────────────────┬────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 3: PROMPT BUILDER                                      │
│                                                              │
│  Monta o prompt final baseado na classificação:              │
│                                                              │
│  system_prompt = BASE_SYSTEM                                 │
│                + SCENE_TYPE_INSTRUCTIONS[classification]      │
│                + TONE_MODIFIERS[character_morality]           │
│                + CONTENT_LEVEL_GATES[classification]          │
│                                                              │
│  user_prompt = CONTEXT_BLOCK (assembled)                     │
│              + PLAYER_ACTION (raw input)                      │
│              + INSTRUCTION (respond as game narrator)         │
│                                                              │
│  Output format: narrativa corrida + sugestões de ação footer │
└─────────────────────────┬────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 4: ROUTER                                              │
│                                                              │
│  Decide qual modelo usar:                                    │
│                                                              │
│  CLASSIFICATION        → MODELO           → JUSTIFICATIVA    │
│  ──────────────────────────────────────────────────────────── │
│  DIALOGUE              → Opus 4.8          → nuance, memória  │
│  COMBAT                → Opus 4.8          → consequências    │
│  EXPLORATION           → Opus 4.8          → world-building   │
│  ROMANCE              → Opus 4.8          → sutileza, tom     │
│  INTROSPECTION        → Opus 4.8          → profundidade      │
│  WORLD_EVENT          → Opus 4.8          → escopo grande     │
│  EXPLICIT_SEXUAL      → Ollama           → sem filtro         │
│  EXPLICIT_VIOLENCE    → Ollama           → sem filtro         │
│                                                              │
│  Pipeline mode (special):                                    │
│  - Opus 4.8 gera cena narrativa (setup, emoção, contexto)     │
│  - Ollama recebe cena + intensifica detalhes explícitos       │
│  - Merger combina (Opus 4.8 intro + Ollama explícito + Opus 4.8 aftermath)  │
│                                                              │
│  Fallback chain:                                             │
│  1. Modelo primário (timeout 30s)                            │
│  2. Retry com prompt simplificado (timeout 30s)              │
│  3. Modelo alternativo (se Ollama down → Opus 4.8 censored-friendly)    │
│  4. Resposta genérica de fallback (nunca crash)              │
└─────────────────────────┬────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 5: LLM ADAPTER                                         │
│                                                              │
│  A. Para Opus 4.8 Opus 4.8 (Anthropic API):                          │
│     - POST /messages (stream: true)                          │
│     - system prompt → system param                           │
│     - user content → messages[0]                             │
│     - Temperature: 0.9 (narrativa), 0.3 (combat resolution) │
│     - Max tokens: 2000 (normal), 4000 (cutscene/major)      │
│     - Prompt caching: ON (system prompt reutilizável)        │
│                                                              │
│  B. Para Ollama Local:                                       │
│     - POST http://localhost:11434/api/chat                   │
│     - format: streaming JSON                                 │
│     - Temperature: 1.0 (explícito), 0.7 (violent)           │
│     - Context window: 4096-8192 (depende do modelo)          │
│     - Num_ctx: ajustável por modelo                          │
│                                                              │
│  Ambos → stream tokens via SSE pro frontend                  │
└─────────────────────────┬────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 6: POST-PROCESSOR                                      │
│                                                              │
│  Validações:                                                 │
│  □ Resposta não está vazia                                   │
│  □ Não quebra 4ª parede (sem "como IA...")                   │
│  □ Coerência com location (não menciona lugar errado)        │
│  □ NPCs presentes estão corretos (não inventou NPC)          │
│  □ Stats do personagem respeitados (não deu poder que não tem)│
│  □ Comprimento mínimo (>50 chars pra ações significativas)   │
│  □ Comprimento máximo (< max tokens)                         │
│  □ Não repetiu última resposta verbatim                      │
│                                                              │
│  Se falhar:                                                  │
│  - Até 2 retries com prompt corretivo                        │
│  - Se 3 falhas → log + resposta genérica segura              │
└─────────────────────────┬────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  STEP 7: EVENT EXTRACTOR                                     │
│                                                              │
│  Analisa resposta do LLM e extrai eventos:                   │
│                                                              │
│  Heurísticas:                                                │
│  - "morreu|killed|dead" → NPC_DIED event                     │
│  - "te ama|I love you" → RELATIONSHIP_MILESTONE              │
│  - "você ganhou|acquired|found" → ITEM_ACQUIRED              │
│  - "dano|ferido|injury" → HP_CHANGE                          │
│  - HP <= 0 → DEATH                                           │
│  - Trigger words por quest → QUEST_TRIGGERED                 │
│                                                              │
│  Futuramente: LLM auxiliar estruturado pra extração          │
│  (Haiku cheap call com schema Zod)                           │
└──────────────────────────────────────────────────────────────┘
```

---

## System Prompts — Templates

### BASE_SYSTEM (sempre presente)

```
Você é o Narrador Mestre de um RPG isekai ambientado em um universo de mutantes.

REGRAS INVIOLÁVEIS:
1. Nunca quebre a 4ª parede. Nunca mencione que é uma IA.
2. O jogador fez escolhas — respeite consequências. Não amenize.
3. NPCs são pessoas. Agem com base em personalidade, história e motivação.
4. O mundo existe independente do jogador. Outras coisas acontecem.
5. Mortes são permanentes (exceto se narrativamente justificado, raro).
6. Poder tem custo. Sempre.
7. Respostas são em segunda pessoa ("Você faz...", "Você sente...").
8. Inclua sensações (cheiro, som, tato, temperatura) pra imersão.
9. No final de cada resposta, ofereça 2-4 opções de ação numeradas + opção livre.
10. Se a ação do jogador é impossível (sem poder, sem recurso), narre a tentativa e o fracasso com dignidade.

INFORMAÇÕES DO PERSONAGEM:
{{character_block}}

ESTADO ATUAL:
{{world_state_block}}

NPCs PRESENTES:
{{npc_block}}

ÚLTIMOS EVENTOS:
{{recent_events_block}}
```

### SCENE_TYPE_INSTRUCTIONS — Exemplos

**COMBAT:**
```
MODO: COMBATE

Regras adicionais para esta cena:
- Descreva ações com peso físico (impacto, dor, exaustão)
- Respeite a iniciativa e ordem de turnos
- NPCs agem conforme inteligência (burros avançam, espertos fogem)
- Descreva dano visual + consequência mecânica
- Se HP do personagem chegar a 0, narrre queda dramática
- Dê ao jogador 2-3 opções táticas + opção criativa livre
```

**ROMANCE:**
```
MODO: ROMANCE / INTIMIDADE

Regras adicionais para esta cena:
- Ambos os personagens (PC e NPC) devem ter agency
- Descreva linguagem corporal, não só diálogo
- Respeite personalidade do NPC (tímido → lento, bold → direto)
- Nunca force relação. Se NPC não está confortável, narre resistência.
- Inclua vulnerabilidade. Intimidade expõe.
- Se evolui pra explícito, descreva com literariedade (nunca pornográfico mecânico)
```

**EXPLICIT_SEXUAL:**
```
MODO: CENA SEXUAL EXPLÍCITA

Regras:
- Ambos os personagens adultos, consentimento presente na narrativa
- Descreva com literariedade e sensorialidade (tato, calor, respiração)
- Emocional misturado com físico (não é mecânico)
- Respeite personalidade do NPC: dominante/passivo/tímido/selvagem/vulnerável
- Inclua diálogo (sussurros, pedidos, nomes)
- Mantenha tom consistente com relationship level
- Encerre com aftermath emocional (não corte seco)
```

**EXPLICIT_VIOLENCE:**
```
MODO: VIOLÊNCIA GRÁFICA

Regras:
- Descreva consequência física real (ossos, sangue, sons)
- Dor é real. Personagens gritam, choram, entram em choque.
- Mortes não são limpas. São feias.
- Se o jogador causa violência contra inocentes, narre o horror.
- Consequências: testemunhas reagem, facções respondem, trauma marca.
- Não glorifique. Apresente. Deixe o jogador processar.
```

---

## Pipeline Mode — Detalhes

Quando uma cena combina narrativa profunda com conteúdo explícito:

```
1. Opus 4.8 gera SETUP (contexto emocional, tensão, buildup)
   - Prompt: "Narre o buildup desta cena até o momento explícito. Pare antes do ato."
   - Output: ~400-800 tokens de setup
   
2. Ollama recebe setup + gera EXPLÍCITO
   - Prompt: "Continue esta cena com detalhes explícitos: {setup_output}"
   - Output: ~200-600 tokens de conteúdo explícito
   
3. Opus 4.8 gera AFTERMATH (consequência emocional)
   - Prompt: "Narre o aftermath desta cena. O que mudou. Como se sentem."
   - Output: ~200-400 tokens
   
4. Merger combina: setup + explícito + aftermath → resposta coesa
```

**Quando usar pipeline vs pure Ollama:**
- Pipeline: cenas com arco emocional (primeiro encontro, reconciliação, cena violenta com peso moral)
- Pure Ollama: ação direta, sem necessidade de contexto profundo (combate gráfico rápido, cena sexual casual)

---

## Context Window Management

### Opus 4.8 Opus 4.8 (200K tokens)
- Sistema prompt base: ~1500 tokens
- Contexto montado: ~4000-6000 tokens
- Player input: ~200-500 tokens
- Response: ~500-2000 tokens
- **Total por call: ~8000-10000 tokens**
- **Prompt caching: system prompt cacheável** (reduz custo)

### Ollama Local (~8K-32K dependendo modelo)
- System prompt simplificado: ~500 tokens
- Contexto essencial: ~1500-2000 tokens
- Player input: ~200-500 tokens
- Response: ~300-1000 tokens
- **Total por call: ~2500-4000 tokens**

### Estratégia de Compressão de Histórico

```
Últimos 20 eventos → raw (detalhados)
Eventos 21-50 → resumidos (1 linha cada)
Eventos 50+ → ultra-comprimidos (5 linhas resumindo tudo)
```

---

## Classifier — Implementação

```typescript
function classifyScene(
  input: string,
  currentState: GameState,
  recentEvents: GameEvent[]
): SceneClassification {
  
  // Keyword matching (fast path)
  const explicit_sexual_keywords = [
    'beijo', 'toca', 'desejo', 'cama', 'corpo', 'nua', 'nu',
    'gemido', 'prazer', 'tira a roupa', 'se entrega', 'faz amor'
  ];
  
  const explicit_violence_keywords = [
    'mata', 'decapita', 'tortura', 'arranca', 'esmaga',
    'sangue', 'tripas', 'executa', 'mutila'
  ];
  
  const combat_keywords = [
    'ataca', 'defende', 'luta', 'combate', 'golpeia',
    'dispara', 'esquiva', 'bloqueia'
  ];
  
  // State context (se já está em combat, qualquer ação é combat)
  if (currentState.mode === 'COMBAT') return 'COMBAT';
  if (currentState.mode === 'DIALOGUE' && !hasCombatIntent(input)) return 'DIALOGUE';
  
  // Keyword scoring
  const scores = scoreKeywords(input, {
    EXPLICIT_SEXUAL: explicit_sexual_keywords,
    EXPLICIT_VIOLENCE: explicit_violence_keywords,
    COMBAT: combat_keywords,
    // ...mais categorias
  });
  
  // Relationship context (se com NPC romantic interest → ROMANCE bias)
  if (currentNPC?.relationship?.love > 50) {
    scores.ROMANCE += 2;
  }
  
  return highestScore(scores);
}
```

---

## Cost Estimation por Sessão

### Sessão típica (1h de jogo, ~40 ações do jogador)

| Modelo | Calls | Tokens/call | Total tokens | Custo est. |
|--------|-------|-------------|--------------|-----------|
| Opus 4.8 input | 35 | 8000 | 280,000 | $4.20 |
| Opus 4.8 output | 35 | 1500 | 52,500 | $3.94 |
| Ollama input | 5 | 3000 | 15,000 | $0 |
| Ollama output | 5 | 800 | 4,000 | $0 |
| **Total** | 40 | — | 351,500 | **~$8.14** |

**Com prompt caching (system prompt reutilizado):**
- Cache hit rate ~80% (mesmo system prompt)
- Custo real estimado: **~$4-5 por sessão de 1h**

**Otimizações possíveis:**
- Usar Haiku pra classificação (barato)
- Cache agressivo de world state
- Compressão de histórico mais agressiva
- Reduzir tamanho do system prompt dinâmico

Detalhes em `ops/30-COST-ESTIMATES.md`.

---

## Error Handling

```
SCENARIO                    → RESPONSE
─────────────────────────────────────────────────
Opus 4.8 API timeout (30s)    → Retry 1x; se falhar → Ollama fallback
Ollama not running          → Detectar no boot; warn user; Opus 4.8 fallback
LLM retorna resposta vazia  → Retry com prompt simplificado
LLM "não posso ajudar"     → Swap pra Ollama (ou pipeline mode)
LLM quebra coerência       → Inject correction + retry
Rate limit Anthropic        → Queue + exponential backoff
Network error               → Offline mode (Ollama only)
Both models down            → Static fallback ("O mundo pausa...")
```

---

## Configuração do Orchestrator

```typescript
// config/orchestrator.ts
export const OrchestratorConfig = {
  // Models
  claudeModel: 'claude-opus-4-8',
  ollamaModel: 'mythomax:latest', // ou dolphin-mistral, etc
  ollamaUrl: 'http://localhost:11434',
  
  // Timeouts
  claudeTimeout: 30_000,
  ollamaTimeout: 60_000, // local é mais lento
  
  // Temperatures
  temperatures: {
    DIALOGUE: 0.85,
    COMBAT: 0.3,
    EXPLORATION: 0.9,
    ROMANCE: 0.95,
    EXPLICIT_SEXUAL: 1.0,
    EXPLICIT_VIOLENCE: 0.8,
    INTROSPECTION: 0.7,
    WORLD_EVENT: 0.7,
  },
  
  // Token limits
  maxResponseTokens: {
    default: 1500,
    CUTSCENE: 3000,
    COMBAT: 1000,
    EXPLICIT_SEXUAL: 2000,
    EXPLICIT_VIOLENCE: 1500,
  },
  
  // Context assembly
  maxContextTokens: 6000,
  recentEventsCount: 20,
  npcMemoryLimit: 50, // interações por NPC
  
  // Retry config
  maxRetries: 2,
  retryDelay: 1000,
  
  // Pipeline mode
  pipelineEnabled: true,
  pipelineMinSetupTokens: 200,
};
```

---

**Próximo:** `04-API-CONTRACTS.md` (endpoints REST, schemas de request/response).

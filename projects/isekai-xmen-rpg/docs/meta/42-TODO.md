# Planejamento Completo — Tudo Que Falta

**Atualizado:** 2026-08-24  
**Estado:** Engine core funcional (tool-use, criação via chat, Opus 4.8)

---

## O QUE JÁ FUNCIONA

| Feature | Status |
|---------|--------|
| Tool-use engine (roll_check, apply_changes, manage_combat, quests, crossroads) | ✅ |
| Criação de personagem via chat (IA guia, extrai dados, monta ficha) | ✅ |
| Opus 4.8 via gateway Avello | ✅ |
| Memória de longo prazo (recent turns + chronicle compaction) | ✅ |
| Sistema de combate estruturado (enemies com HP) | ✅ |
| Quests (start/complete/fail) | ✅ |
| Crossroads (botões de escolha) | ✅ |
| Rolagens d20 reais (motor é dono dos números) | ✅ |
| Moralidade dinâmica | ✅ |
| NPCs/Relacionamentos com afinidade | ✅ |
| Character Sheet sidebar | ✅ |
| NSFW narrativo (Opus) — fade-to-black level | ✅ |
| Imersão inquebrável (nunca quebra personagem) | ✅ |
| UI básica funcional (chat + sidebar) | ✅ |

---

## O QUE FALTA — POR ORDEM

### FASE 1: Estabilidade & Save (código — eu faço)

| # | Task | Dificuldade | Tempo |
|---|------|------------|-------|
| 1 | **Save/Load localStorage** — salvar estado completo, múltiplos slots, carregar na landing | Fácil | 1h |
| 2 | **Auto-save** a cada 5 turnos | Fácil | 15min |
| 3 | **Fix: streaming** — trocar resposta JSON pra streaming (SSE) de volta pra UX melhor | Médio | 1h |
| 4 | **Rolagens visíveis com estilo** — pill colorida na UI (verde=sucesso, vermelho=falha, dourado=crítico) | Fácil | 30min |
| 5 | **Error handling robusto** — retry automático, fallback se Opus timeout | Médio | 1h |

### FASE 2: UI & Polish (código — eu faço)

| # | Task | Dificuldade | Tempo |
|---|------|------------|-------|
| 6 | **Sidebar completa** — quests ativas, inventário, relacionamentos, localização | Médio | 2h |
| 7 | **Crossroads renderizados como cards** (não só botões) | Fácil | 30min |
| 8 | **Mobile responsive** — chat funciona em tela pequena | Médio | 1h |
| 9 | **Tema visual melhorado** — mais atmosférico, animações sutis, typography | Médio | 2h |
| 10 | **Combat UI** — mostrar HP dos inimigos como barras durante combate | Médio | 1h |

### FASE 3: Gameplay Deep (código — eu faço)

| # | Task | Dificuldade | Tempo |
|---|------|------------|-------|
| 11 | **Nêmesis system** — rival recorrente que escala com player | Médio | 2h |
| 12 | **Power evolution stages** — despertar → base → avançado → omega | Médio | 1h |
| 13 | **World events / ambient ticks** — mundo se move entre turnos | Médio | 2h |
| 14 | **Lore bank** — base de dados dos NPCs canônicos X-Men (lookup_lore tool) | Médio | 2h |
| 15 | **Multiple campaigns** — novo personagem com legacy do anterior | Médio | 1h |

### FASE 4: NSFW Explícito — Ollama Local (precisa ação sua + eu configuro)

| # | Task | Quem faz | Tempo |
|---|------|----------|-------|
| 16 | **Instalar Ollama no Windows** | Você | 5min |
| 17 | **Baixar modelo uncensored** | Você | 10-30min (download) |
| 18 | **Integrar Ollama no engine** (router: Opus → Ollama pra NSFW) | Eu | 2h |
| 19 | **Pipeline mode** (Opus setup + Ollama explícito + Opus aftermath) | Eu | 1h |
| 20 | **Testar e calibrar** prompts NSFW | Nós dois | 1h |

---

## FASE 4 DETALHADA: Como Instalar Ollama + Modelos NSFW

### Passo 1: Instalar Ollama (5 minutos)

1. Acesse: **https://ollama.com/download/windows**
2. Baixe o instalador Windows (.exe)
3. Execute, clique Next até instalar
4. Após instalar, abra um terminal e teste:
   ```
   ollama --version
   ```
   Se mostrar versão, está OK.

### Passo 2: Baixar Modelo Uncensored (10-30 min dependendo da internet)

**Opções por VRAM da sua GPU:**

| Modelo | VRAM | Qualidade NSFW | Comando |
|--------|------|----------------|---------|
| **Lumimaid 7B** | 6GB+ | ⭐⭐⭐⭐ (feito pra RP NSFW) | `ollama pull lumimaid:7b` |
| **Mythomax 13B** | 10GB+ | ⭐⭐⭐⭐⭐ (melhor equilíbrio) | `ollama pull mythomax:13b` |
| **Noromaid 20B** | 16GB+ | ⭐⭐⭐⭐⭐ (excelente) | `ollama pull noromaid:20b` |
| **Midnight-Miqu 70B** | 48GB+ | ⭐⭐⭐⭐⭐⭐ (insano) | `ollama pull midnight-miqu:70b` |

**Se não sabe sua VRAM:**
- Abre o Gerenciador de Tarefas → Aba "Desempenho" → "GPU"
- Ou roda no terminal: `nvidia-smi` (se tiver NVIDIA)

**Se não tem GPU forte (< 6GB VRAM):**
- Roda em CPU mesmo (mais lento, ~10-20s por resposta)
- Use Lumimaid 7B: `ollama pull lumimaid:7b`
- Funciona, só é mais lento

**Se não tem GPU nenhuma (integrada Intel/AMD):**
- Funciona em CPU pura
- Use modelo menor: `ollama pull dolphin-mistral:7b`
- Qualidade NSFW inferior mas funcional

### Passo 3: Testar (1 minuto)

```bash
ollama run lumimaid:7b
```

Digita algo no chat que aparece. Se responder, está funcionando. `Ctrl+D` pra sair.

### Passo 4: Eu Integro (eu faço depois)

Depois que Ollama estiver rodando, eu:
1. Crio adapter Ollama (`src/ai/OllamaAdapter.ts`)
2. Crio classifier de cena (detecta quando é NSFW)
3. Implemento router (Opus pra narrativa, Ollama pra explícito)
4. Implemento pipeline mode (melhor qualidade)

### Modelos Recomendados — Explicação

**Lumimaid 7B** — Modelo feito especificamente pra RP NSFW. Sem censura. Entende fetiches, escreve detalhado. Rápido (7B é leve). Melhor custo-benefício se GPU for limitada.

**Mythomax 13B** — Merge de modelos de RP. Excelente em narrativa longa + NSFW. Mais robusto que 7B, menos propenso a repetir. Precisa de ~10GB VRAM.

**Noromaid 20B** — Focado em interação com personagens + NSFW. Muito consistente em manter personality de NPCs durante cenas explícitas. 16GB VRAM.

**Midnight-Miqu 70B** — O melhor que existe pra RP/NSFW. Qualidade próxima de GPT-4 sem censura. Precisa de GPU monstro (A6000, 2x3090, etc.) ou roda em CPU devagar.

---

## FASE 5: Nice to Have (futuro)

| # | Task | Tempo |
|---|------|-------|
| 21 | **Geração de retratos** — IA gera imagem do personagem/NPCs | 2h |
| 22 | **Som ambiente** — música contextual por tipo de cena | 2h |
| 23 | **Export save como JSON** — backup manual, portabilidade | 30min |
| 24 | **Customização de atributos** — player distribui pontos (form opcional) | 1h |
| 25 | **Histórico de rolagens** — log completo de todos os d20 | 30min |
| 26 | **Modo escuro/claro** — theme toggle (provavelmente fica escuro sempre) | 30min |
| 27 | **PWA** — instalar no celular como app | 1h |

---

## RESUMO DE AÇÃO

**O que EU faço (código):**
- Fases 1-3 + parte da 4 (integração Ollama no engine)
- Estimativa: ~20h de dev

**O que VOCÊ faz:**
1. **Testar o jogo** no browser agora (http://localhost:3004)
2. **Dar feedback** (o que tá ruim, o que quer diferente)
3. **Quando quiser NSFW explícito:**
   - Instalar Ollama (5min)
   - Baixar modelo (10-30min)
   - Me avisar que tá rodando → eu integro

**Próximo passo imediato:** Qual fase quer que eu faça agora?
- Se quer **jogar estável**: Fase 1 (save/load + streaming + fixes)
- Se quer **visual bonito**: Fase 2 (UI polish)
- Se quer **gameplay profundo**: Fase 3 (nemesis + evolution + world)
- Se quer **NSFW já**: Fase 4 (mas precisa instalar Ollama primeiro)

---

## CHECKLIST DO PLAYER (Você)

- [ ] Testar jogo atual (http://localhost:3004)
- [ ] Feedback sobre narração (qualidade, tom, comprimento)
- [ ] Feedback sobre UI (o que incomoda)
- [ ] Verificar VRAM da GPU (`nvidia-smi` no terminal)
- [ ] Instalar Ollama quando quiser NSFW: https://ollama.com/download/windows
- [ ] Baixar modelo: `ollama pull lumimaid:7b` (ou mythomax:13b se tiver VRAM)
- [ ] Me avisar quando Ollama estiver rodando

---

**O jogo já é jogável AGORA. O resto é upgrade.**

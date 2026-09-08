---
name: progress-tracker
description: >
  Acompanha evolução do paciente ao longo do tempo. Compara início vs agora,
  usa escalas clínicas (PHQ-9, GAD-7), detecta plateau, e recomenda ação
  (continuar/ajustar/alta/encaminhar). Use com /progress-tracker, "evolução do paciente",
  "como está progredindo", "relatório de progresso", "hora de dar alta?".
user-invocable: true
argument-hint: "[nome-paciente]"
---

# Progress Tracker — Acompanhamento de Evolução

## Objective

Visualizar progresso terapêutico ao longo do tempo. Responde: "Estamos avançando? Para onde? Precisa ajustar?"

**Antes**: Psicólogo tem sensação vaga de "acho que está melhorando" sem dados.
**Depois**: Tabela objetiva de evolução + escalas + recomendação fundamentada.

---

## When to Trigger

- `/progress-tracker [nome]` ou `/progress-tracker`
- "Como está a evolução de [nome]?", "relatório de progresso"
- "Está na hora de dar alta?", "precisa ajustar abordagem?"
- Trimestral (revisão de plano de tratamento)
- Antes de reaplicar escalas
- Quando psicólogo sente "plateau"

---

## Process

### Step 1: Carregar Histórico

Ler `data/patients/[slug].md`:
- Todas as sessões (#1 até #N)
- Plano de tratamento ativo (objetivos SMART)
- Formulação clínica
- Escalas aplicadas (se houver)
- Risk assessments (se houver)

Se arquivo não encontrado: pedir nome/slug correto.
Se < 4 sessões: "Dados insuficientes para tracking robusto. Recomendo reavaliar após sessão 5."

### Step 2: Extrair Indicadores

Para CADA sessão registrada, extrair:

| Indicador | Fonte no Session Notes |
|-----------|----------------------|
| Queixa (intensidade) | Seção S (Subjetivo) — linguagem do paciente |
| Humor observado | Seção O (Objetivo) — observação do terapeuta |
| Engajamento | Presente? Participativo? Resistente? |
| Tarefa entre-sessões | Completou? Parcial? Não fez? |
| Insight reportado | Houve momento de compreensão? |
| Tema emergente | O que dominou a sessão? |

### Step 3: Compilar Escalas (se disponíveis)

Buscar no histórico do paciente qualquer aplicação de:
- PHQ-9 (depressão)
- GAD-7 (ansiedade)
- BDI-II (Beck)
- Outros mencionados

Se não há escalas formais: usar apenas indicadores qualitativos (Step 2).

Referência para significância clínica: `references/clinical-scales.md`

### Step 4: Análise de Objetivos

Ler plano de tratamento (`/treatment-plan`):
- Para CADA objetivo SMART listado:
  - Status: ATINGIDO / EM PROGRESSO / SEM PROGRESSO / PIOROU
  - Evidência: quais sessões mostram progresso (ou não)

### Step 5: Detectar Padrões

| Padrão | Significado | Ação |
|--------|-------------|------|
| **Melhora consistente** | 3+ sessões consecutivas com indicadores positivos | Continuar + celebrar |
| **Plateau** | 4+ sessões sem mudança significativa | Revisar formulação/abordagem |
| **Oscilação** | Sobe-desce sem padrão claro | Investigar gatilhos externos |
| **Deterioração** | Piora em 2+ sessões | Reavaliar urgente + risk-check |
| **Melhora rápida demais** | Todas métricas melhoram em 2-3 sessões | Cuidado: pode ser fuga, people-pleasing, ou resolução real |

### Step 6: Gerar Output

```markdown
## Relatório de Evolução — [Iniciais]
**Período**: Sessão #[primeira] ([data]) → Sessão #[última] ([data])
**Total de sessões no período**: [N]
**Frequência**: [semanal / quinzenal]

---

### Resumo Executivo (1 parágrafo)

[Narrativa concisa: "Paciente iniciou com [queixa] de intensidade [X]. Ao longo
de [N] sessões, apresentou [padrão geral]. Atualmente [estado]. Progresso é
[consistente/parcial/estagnado/oscilante]. Recomendação: [ação]."]

---

### Evolução por Indicador

| Indicador | Sessão #1 | Sessão #[mid] | Sessão #[N] | Direção |
|-----------|-----------|---------------|-------------|---------|
| Queixa principal | [intensidade] | [intensidade] | [intensidade] | ↑↑ / ↑ / → / ↓ / ↓↓ |
| Humor observado | [descritivo] | [descritivo] | [descritivo] | ↑ / → / ↓ |
| Engajamento em sessão | [nível] | [nível] | [nível] | ↑ / → / ↓ |
| Aderência a tarefas | [%] | [%] | [%] | ↑ / → / ↓ |
| Insights reportados | [freq] | [freq] | [freq] | ↑ / → / ↓ |
| Funcionamento geral | [descritivo] | [descritivo] | [descritivo] | ↑ / → / ↓ |

**Legenda**: ↑↑ melhora significativa | ↑ melhora leve | → estável | ↓ piora leve | ↓↓ piora significativa

---

### Escalas Clínicas (se aplicadas)

| Escala | Baseline (Sessão #[X]) | Última (Sessão #[Y]) | Mudança | Significância |
|--------|------------------------|----------------------|---------|---------------|
| PHQ-9 | [score] ([gravidade]) | [score] ([gravidade]) | [±N pts] | [Sim/Não] (threshold: ≥5) |
| GAD-7 | [score] ([gravidade]) | [score] ([gravidade]) | [±N pts] | [Sim/Não] (threshold: ≥4) |

**Nota**: Mudança clinicamente significativa = mudança de faixa de gravidade OU ≥ threshold points.

---

### Progresso nos Objetivos (do Plano de Tratamento)

| Objetivo | Status | Evidência |
|----------|--------|-----------|
| [Objetivo 1] | ✅ Atingido / 🔄 Em progresso / ⏸️ Sem progresso / ⚠️ Piorou | [resumo] |
| [Objetivo 2] | [status] | [resumo] |
| [Objetivo 3] | [status] | [resumo] |

---

### Marcos Terapêuticos

- [x] [Marco 1 — o que, quando] (sessão #[N])
- [x] [Marco 2] (sessão #[N])
- [ ] [Marco pendente — próximo milestone esperado]

---

### Padrão Detectado

**[Melhora consistente / Plateau / Oscilação / Deterioração / Melhora rápida]**

[Explicação: por que classificou assim + evidência das sessões]

---

### Recomendação

| Opção | Justificativa | Ação |
|-------|--------------|------|
| ✅ **Continuar** tratamento | Progresso ativo, objetivos em andamento | Manter frequência + foco |
| 🔄 **Ajustar** abordagem | Plateau detectado / oscilação | Revisar formulação, trocar técnica |
| 🎯 **Preparar alta** | Objetivos atingidos + autonomia | Espaçar sessões, prevenção recaída |
| ↗️ **Encaminhar** | Necessidade fora do escopo | Psiquiatria / neuropsicologia / outro |

**Recomendação principal**: [UMA das opções acima com justificativa]

---

### Próxima Reavaliação

- **Data sugerida**: [daqui 3 meses / sessão #[N+X]]
- **Escalas a reaplicar**: [PHQ-9, GAD-7, etc.]
- **Foco de observação**: [aspecto específico a monitorar]

---

### Observações do Profissional
[Espaço livre para psicólogo adicionar percepções que o sistema não captura]

---
⚠️ RASCUNHO — Requer revisão do profissional responsável
CRP: [from context/my-clinic.md]
```

---

## Edge Cases

1. **Paciente com < 4 sessões**
   - Output simplificado: "Dados iniciais — tracking começará após sessão 5"
   - Mostrar apenas: baseline + impressão clínica inicial

2. **Escalas nunca foram aplicadas**
   - Não inventar scores
   - Usar apenas indicadores qualitativos
   - Sugerir: "Considere aplicar PHQ-9 e GAD-7 na próxima sessão para baseline formal"

3. **Paciente retornou após pausa**
   - Separar: período anterior vs período atual
   - Comparar: "Antes da pausa (sessões 1-8)" vs "Após retorno (sessões 9-N)"
   - Investigar: o que mudou durante a pausa?

4. **Múltiplas queixas**
   - Tracker separado por queixa principal (se treatment-plan tem objetivos distintos)
   - OU: tracker integrado mostrando "qual queixa respondeu melhor?"

5. **Psicólogo discorda do padrão detectado**
   - Aceitar: "Qual sua percepção? O que estou não captando?"
   - Psicólogo pode sobrescrever com observação própria
   - Registrar ambos: "Sistema detectou [X]. Profissional observa [Y]."

6. **Deterioração detectada**
   - Flag URGENTE: "⚠️ Indicadores sugerem piora"
   - Sugerir: `/risk-assessment` se relevante
   - Sugerir: revisão de plano + formulação
   - NÃO alarmar sem necessidade (1 sessão ruim ≠ deterioração)

7. **Paciente próximo da alta**
   - Se "Preparar alta" é recomendação:
   - Sugerir plano de espaçamento: semanal → quinzenal → mensal → follow-up 3 meses
   - Sugerir: sessão de prevenção de recaída
   - Gerar: "Resumo de tratamento" (início → fim, ganhos, recomendações)

---

## Dependencies

- `data/patients/[slug].md` — todo o histórico
- `references/clinical-scales.md` — cutoffs, significância clínica
- Skills que alimentam dados:
  - `/session-notes` (fonte primária)
  - `/treatment-plan` (objetivos)
  - `/case-formulation` (formulação para comparar)
  - `/risk-assessment` (se houve)

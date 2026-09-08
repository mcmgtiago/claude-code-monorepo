---
name: treatment-plan
description: >
  Gera plano de tratamento estruturado: objetivos terapêuticos, intervenções, timeline,
  métricas de progresso, e critérios de alta. Baseado em dados da anamnese + sessões.
  Use com /treatment-plan, "plano terapêutico", "plano de tratamento", "montar plano".
user-invocable: true
argument-hint: "[nome-paciente]"
---

# Treatment Plan — Plano Terapêutico

## Objective

Criar plano de tratamento estruturado, baseado em evidências, com objetivos mensuráveis e timeline realista. Serve como guia para o processo terapêutico e como documentação para compliance.

---

## When to Trigger

- `/treatment-plan [nome]` ou `/treatment-plan`
- "Plano de tratamento", "montar plano terapêutico", "objetivos de terapia"
- Após 3-5 sessões (quando já há dados suficientes para formular)
- Revisão trimestral de plano existente

---

## Input

### Source 1: Patient File (automático)
- Ler `data/patients/[slug].md` — queixa, histórico, sessões anteriores
- Se existe plano anterior: carregar para revisão

### Source 2: Psicólogo Input (conversacional)

Perguntas guiadas:

1. "Qual a queixa principal e como ela se manifesta no dia-a-dia do paciente?"
2. "Qual sua hipótese clínica/diagnóstica? (pode ser provisória)"
3. "Que fatores mantêm o problema? (comportamentais, cognitivos, relacionais)"
4. "Que recursos/forças o paciente já tem?"
5. "Qual seria o resultado ideal ao final do tratamento? (Na perspectiva do paciente)"
6. "Há urgências ou riscos que devem ser priorizados?"
7. "Tempo estimado de tratamento? (breve: 12-20 sessões / médio: 6 meses / longo: 1+ ano)"

---

## Output Format

```markdown
# Plano de Tratamento — [Nome do Paciente]

**Elaborado em**: [data]
**Revisão prevista**: [data + 3 meses]
**Profissional**: [nome + CRP]

---

## 1. Dados do Paciente

- **Nome**: [nome]
- **Idade**: [idade]
- **Início do acompanhamento**: [data]
- **Sessão atual**: #[N]
- **Frequência**: [semanal/quinzenal]

---

## 2. Queixa Principal

[Descrição concisa em linguagem clínica]

**Impacto funcional**: [Como afeta trabalho, relacionamentos, saúde, autonomia]

---

## 3. Hipótese Diagnóstica

- **CID-10**: [código + descrição] (se aplicável)
- **Formulação**: [explicação em termos da abordagem teórica]
- **Fatores de manutenção**: [o que mantém o problema ativo]
- **Fatores de proteção**: [recursos do paciente]

---

## 4. Objetivos Terapêuticos

### Objetivo Geral
[O que queremos alcançar ao final do tratamento — 1 frase]

### Objetivos Específicos

| # | Objetivo | Indicador de Progresso | Prazo |
|---|----------|----------------------|-------|
| 1 | [Objetivo mensurável] | [Como saber se progrediu] | [Sessões ou semanas] |
| 2 | [Objetivo mensurável] | [Como saber se progrediu] | [Sessões ou semanas] |
| 3 | [Objetivo mensurável] | [Como saber se progrediu] | [Sessões ou semanas] |

---

## 5. Intervenções Planejadas

| Fase | Intervenções | Sessões Estimadas |
|------|-------------|-------------------|
| Inicial (vínculo + avaliação) | [técnicas] | 1-4 |
| Intermediária (trabalho ativo) | [técnicas] | 5-12 |
| Final (consolidação + prevenção de recaída) | [técnicas] | 13-16 |

---

## 6. Cronograma

| Mês | Foco | Meta |
|-----|------|------|
| Mês 1 | [foco] | [meta tangível] |
| Mês 2 | [foco] | [meta tangível] |
| Mês 3 | [foco] | [meta tangível] |

---

## 7. Critérios de Alta

O tratamento será considerado concluído quando:
1. [Critério objetivo 1]
2. [Critério objetivo 2]
3. [Critério objetivo 3]

**Prevenção de recaída**: [breve plano]

---

## 8. Riscos e Considerações

- **Riscos identificados**: [ideação suicida, automutilação, substâncias, etc.]
- **Plano de segurança**: [existe / a criar / não necessário]
- **Encaminhamentos**: [psiquiatria, neuro, outros profissionais]
- **Limitações**: [sigilo com menores, divórcio em curso, etc.]

---

## 9. Revisão

**Próxima revisão**: [data]
**Critérios para revisão antecipada**:
- Piora significativa
- Mudança de queixa principal
- Evento de vida significativo
- Pedido do paciente

---

⚠️ RASCUNHO — Requer revisão e assinatura do profissional responsável
CRP: [from context/my-clinic.md]
```

---

## Process Steps

### Step 1: Check Patient History

1. Verificar se paciente tem arquivo em `data/patients/[slug].md`
2. Se sim: carregar sessões anteriores como referência
3. Se não: criar perfil mínimo primeiro

### Step 2: Determine Approach

Ler `context/my-clinic.md` para orientação teórica:

- **TCC**: Objetivos comportamentais, mensuráveis, com timeline definida
- **Psicodinâmica**: Mais exploratório, objetivos de insight, menos timeline rígida
- **Humanista**: Objetivos fenomenológicos, processo over resultado
- **Integrativa**: Mix adaptado ao caso

Adaptar formato de acordo. Os campos são os mesmos, o tom e conteúdo mudam.

### Step 3: Generate Plan

1. Preencher template com dados do paciente + input do psicólogo
2. Manter linguagem clínica mas acessível
3. Objetivos SMART onde possível (Específicos, Mensuráveis, Atingíveis, Relevantes, Temporais)

### Step 4: Save

```bash
# Save to patient file
# data/patients/[slug].md — section "Plano de Tratamento Ativo"
```

Oferecer:
- "Exportar como PDF?"
- "Quer ajustar algum objetivo?"
- "Agendar revisão trimestral?"

---

## Edge Cases

1. **Paciente com comorbidades**
   - Priorizar: o que causa mais sofrimento / risco?
   - Mencionar comorbidades como "fatores a monitorar"
   - Não criar plano para cada diagnóstico — um plano integrado

2. **Psicólogo não quer timeline rígida**
   - Aceitar: substituir "Mês 1-3" por "Fase inicial / intermediária / final"
   - Manter métricas de progresso (importantes para reflexão, não para pressão)

3. **Revisão de plano existente**
   - Carregar plano anterior
   - Perguntar: "O que mudou? Progresso, novos desafios, ajustes necessários?"
   - Gerar versão atualizada com diff visual

4. **Paciente desistiu (dropout)**
   - Gerar "Resumo de alta administrativa"
   - Registrar: sessões realizadas, progresso parcial, razão da saída

5. **Caso de criança/adolescente**
   - Incluir: envolvimento dos responsáveis no plano
   - Objetivos adaptados para faixa etária
   - Considerar: escola, socialização, desenvolvimento

---

## Dependencies

- `context/my-clinic.md` — abordagem teórica, CRP
- `data/patients/[slug].md` — histórico do paciente
- `context/practice-rules.md` — regras de documentação

---

## Metrics

- **Tempo**: De 45-60 min (manual) → 10-15 min (com sistema)
- **Completude**: Todos os campos preenchidos
- **Revisão**: Lembrete automático trimestral

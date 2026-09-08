---
name: session-notes
description: >
  Gera evolução/nota de sessão estruturada em segundos. Input: anotações rápidas, 
  tópicos da sessão, ou áudio transcrito. Output: evolução formatada (SOAP, narrativa, 
  ou personalizado) pronta para copiar no PEP. Use com /session-notes, "anotar sessão", 
  "evolução", "nota de sessão", "registrar atendimento".
user-invocable: true
argument-hint: "[nome-paciente] ou vazio para selecionar"
---

# Session Notes — Evolução Pós-Sessão

## Objective

Transformar anotações rápidas do psicólogo em evolução clínica estruturada, completa e profissional.

**Antes**: Psicólogo gasta 15-30 min escrevendo nota detalhada após cada sessão.
**Depois**: 2-3 min de input → nota completa em formato profissional.

O sistema **NÃO** observa a sessão. Recebe input PÓS-SESSÃO do profissional.

---

## When to Trigger

- `/session-notes` ou `/session-notes [nome-paciente]`
- "Anotar sessão", "evolução do paciente", "registrar atendimento"
- "Nota de sessão de [nome]", "evolução de hoje"

---

## Input Modes

### Mode A: Quick Notes (Recomendado)

Psicólogo digita tópicos rápidos após a sessão:

```
/session-notes Maria
- Trouxe conflito com mãe
- Reatividade forte quando falamos de limites
- Fez tarefa de registro de pensamentos (parcial)
- Trabalhamos reestruturação cognitiva no pensamento "nunca sou boa o suficiente"
- Próxima: aprofundar relação mãe-filha, continuar registro
```

### Mode B: Structured Input (Guided)

Se o psicólogo preferir ser guiado, fazer perguntas:

1. "Qual foi o tema principal da sessão?"
2. "Como o paciente estava no início? (humor, energia, abertura)"
3. "O que vocês trabalharam? (técnica, exercício, exploração)"
4. "Houve progresso, resistência, ou insight importante?"
5. "Tarefa de casa / entre-sessões? Paciente fez a anterior?"
6. "Próxima sessão: foco planejado?"

### Mode C: Transcript Processing (Se usar gravação)

Recebe transcrição de áudio (Otter, Fireflies, manual) e extrai:
- Temas centrais
- Intervenções usadas
- Respostas do paciente
- Plano para próxima

---

## Output Formats

### Format 1: SOAP (Clinical Standard)

```markdown
## Evolução — [Nome do Paciente]
**Data**: [data]  |  **Sessão #**: [número]  |  **Duração**: [duração]

### S (Subjetivo)
Relato do paciente, queixas apresentadas, contexto trazido.
[Gerado a partir do input]

### O (Objetivo)
Observações do terapeuta: humor, postura, engajamento, discurso.
[Gerado a partir do input + inferência cuidadosa]

### A (Avaliação)
Formulação clínica: conexão com hipóteses de trabalho, progresso, obstáculos.
[Gerado — REQUER revisão do profissional]

### P (Plano)
Próximos passos: foco da próxima sessão, tarefas entre-sessões, encaminhamentos.
[Gerado a partir do input]

---
⚠️ RASCUNHO — Requer revisão e assinatura do profissional responsável
CRP: [from context/my-clinic.md]
```

### Format 2: Narrativa (Preferido por muitos)

```markdown
## Evolução — [Nome do Paciente]
**Data**: [data]  |  **Sessão #**: [número]

Paciente compareceu à sessão apresentando [queixa/tema]. 
Relatou [resumo do relato]. Humor observado: [observação].

Durante a sessão, trabalhamos [técnica/abordagem]. O paciente 
demonstrou [resposta: insight, resistência, engajamento, etc.].

Em relação à tarefa entre-sessões ([descrever]), paciente 
[completou / completou parcialmente / não realizou] — [razão se houver].

**Plano**: [próximo foco + tarefa entre-sessões]
**Próxima sessão**: [data ou prazo]

---
⚠️ RASCUNHO — Requer revisão e assinatura do profissional responsável
```

### Format 3: Compact (Para quem usa PEP e precisa preencher campos)

```
Tema: [tema]
Humor: [humor observado]
Intervenção: [técnica usada]
Resposta: [como paciente reagiu]
Tarefa anterior: [feita/parcial/não feita]
Tarefa nova: [descrição]
Próxima sessão: [foco]
Observações: [livre]
```

---

## Process Steps

### Step 1: Identify Patient

Se nome fornecido no argumento:
- Buscar em `data/patients/[nome-slug].md`
- Se existe: carregar contexto (última nota, plano de tratamento, sessão #)
- Se não existe: criar novo arquivo + perguntar dados iniciais

### Step 2: Collect Input

Aceitar qualquer dos 3 modos (A, B, ou C). Se input for Mode A (tópicos soltos), processar como está.

### Step 3: Check for Continuity

Se paciente tem notas anteriores:
- Referenciar última sessão (temas, tarefa pendente)
- Incrementar sessão #
- Verificar: tarefa de casa foi mencionada no input?
  - Se sim: incluir resultado
  - Se não: perguntar "O paciente fez a tarefa de [X] da última vez?"

### Step 4: Generate Note

Usar formato preferido do psicólogo (default: SOAP, ou o que configurou em clinic-setup).

**Regras de geração:**

1. **Linguagem clínica, não coloquial**
   - ❌ "Maria tava meio pra baixo"
   - ✅ "Paciente apresentou humor rebaixado"

2. **Preservar sigilo de MÉTODO terapêutico**
   - Não inventar técnicas que não foram mencionadas
   - Usar apenas o que o psicólogo informou

3. **Seção A (Avaliação) = mais cuidadosa**
   - Basear APENAS no que foi input
   - Não gerar hipóteses diagnósticas não mencionadas
   - Se houver CID/DSM no plano de tratamento, referenciar

4. **Incluir SEMPRE o banner de rascunho**

### Step 5: Save and Offer Actions

```bash
# Save to patient file
# Append to data/patients/[nome-slug].md
```

Oferecer:
- "Quer que eu copie para a área de transferência?"
- "Quer adicionar algo ou corrigir?"
- "Quer atualizar o plano de tratamento?"

---

## Patient File Structure

Cada paciente tem arquivo em `data/patients/[slug].md`:

```markdown
# [Nome do Paciente]

**Início**: [data primeiro atendimento]
**Sessão atual**: #[número]
**Frequência**: [semanal / quinzenal]
**Queixa principal**: [queixa]
**Hipótese diagnóstica**: [CID-10 se houver]
**Abordagem**: [TCC / Psicodinâmica / etc.]

---

## Plano de Tratamento Ativo

[Link para /treatment-plan output se existir]

---

## Sessões

### Sessão #[N] — [Data]
[Nota de evolução completa]

### Sessão #[N-1] — [Data]
[Nota anterior]

...
```

---

## Edge Cases

1. **Primeira sessão (anamnese)**
   - Formato diferente: mais extenso, inclui história de vida, queixa principal, histórico
   - Perguntar: "É a primeira sessão deste paciente? (anamnese)"
   - Se sim: usar template expandido com campos de anamnese

2. **Paciente em crise**
   - Se input menciona ideação suicida, automutilação, ou perigo:
   - Incluir campo: "Avaliação de Risco: [baixo/moderado/alto]"
   - Incluir campo: "Encaminhamento: [sim/não — para quem]"
   - Incluir campo: "Plano de segurança revisado: [sim/não]"

3. **Sessão de casal ou família**
   - Formato adaptado: incluir "Membro A relatou... Membro B relatou..."
   - Dinâmica observada entre membros
   - Intervenções sistêmicas

4. **Psicólogo não deu input suficiente**
   - Se input < 3 linhas: pedir mais detalhes antes de gerar
   - "Preciso de um pouco mais para criar uma nota de qualidade. O que vocês trabalharam?"

5. **Psicólogo quer editar após geração**
   - Aceitar edições inline
   - Regenerar seção específica se pedido
   - Salvar versão final (não intermediária)

6. **Paciente menor de idade**
   - Incluir campo: "Responsável informado: [sim/não/não aplicável]"
   - Verificar em `context/practice-rules.md` se há regras de consentimento

---

## Scheduling

Não é agendada automaticamente. É sob-demanda, pós-sessão.

Recomendação ao psicólogo: usar imediatamente após cada sessão (memória fresca = input melhor).

---

## Dependencies

- `context/my-clinic.md` — para CRP, formato preferido
- `context/my-voice.md` — para tom da nota (formal vs. semi-formal)
- `data/patients/[slug].md` — para continuidade

---

## Metrics

Sucesso medido por:
- **Tempo**: De 15-30 min → 2-5 min por nota
- **Completude**: Todos os campos preenchidos (vs. notas incompletas manuais)
- **Continuidade**: Referência a sessão anterior sempre presente

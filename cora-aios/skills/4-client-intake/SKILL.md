---
name: client-intake
description: >
  Triagem de novo paciente. Avalia compatibilidade com ICP, detecta red flags,
  cria ficha inicial e recomenda decisão (aceitar/condições/referir).
  Use com /client-intake, "novo paciente", "triagem", "primeiro contato",
  "paciente quer agendar", "receber paciente novo".
user-invocable: true
argument-hint: "[nome] ou vazio para formulário guiado"
---

# Client Intake — Triagem de Novo Paciente

## Objective

Estruturar o primeiro contato com paciente novo. Coletar dados mínimos, avaliar fit com a prática, detectar red flags, e gerar decisão fundamentada.

**Antes**: Psicólogo responde WhatsApp, anota mental, esquece detalhes.
**Depois**: Ficha estruturada, scoring automático, red flags detectados, decisão clara.

---

## When to Trigger

- `/client-intake` ou `/client-intake [nome]`
- "Novo paciente", "triagem", "primeiro contato"
- "Paciente quer agendar", "receber paciente novo"
- "Alguém me procurou para terapia"

---

## Process

### Step 1: Coleta de Dados Iniciais

Perguntas ao psicólogo (não ao paciente — o psicólogo relata o contato):

**Dados básicos:**
1. "Nome do paciente?"
2. "Idade?"
3. "Como chegou até você? (indicação, Instagram, Google, Zenklub, etc.)"
4. "Qual a queixa principal? (nas palavras do paciente, como ele descreveu)"

**Contexto:**
5. "Fez terapia antes? Se sim, por quanto tempo e por que parou?"
6. "Toma medicação psiquiátrica atualmente?"
7. "Há urgência? (crise ativa, risco, deadline externo como processo judicial)"

**Logística:**
8. "Preferência de horário? (manhã/tarde/noite, dias específicos)"
9. "Online ou presencial?"
10. "Alguma observação adicional?"

---

### Step 2: Screening de Red Flags

Avaliar input contra lista de red flags. Para CADA flag:
- Se PRESENTE: registrar + classificar severidade
- Se AUSENTE: registrar como "avaliado, não detectado" (Declared Absence)

**Red Flags Checklist:**

| Flag | Indicador | Severidade |
|------|-----------|-----------|
| Risco suicida | Menciona ideação, tentativa prévia, desesperança | IMMINENTE |
| Violência/abuso ativo | Violência doméstica, abuso infantil | IMMINENTE |
| Substâncias ativas | Dependência química não tratada | SIGNIFICATIVO |
| Psicose ativa | Delírios, alucinações, desorganização | SIGNIFICATIVO |
| Menor sem consentimento | Menor de 18 sem responsável informado | SIGNIFICATIVO |
| Litígio em andamento | Processo judicial onde laudo pode ser solicitado | NOTÁVEL |
| Relação dual | Conhecido pessoal, amigo de amigo, colega | NOTÁVEL |
| Mismatch de abordagem | Paciente busca hipnose/EMDR e você não faz | NOTÁVEL |

**Declared Absence Format:**
```
### Red Flags — Avaliação
- Risco suicida: NÃO DETECTADO (paciente não mencionou ideação, humor estável no contato)
- Substâncias: NÃO DETECTADO (não mencionou uso)
- Violência: NÃO DETECTADO
- Psicose: NÃO DETECTADO
- Menor: N/A (adulto)
- Litígio: NÃO DETECTADO
- Relação dual: NÃO DETECTADO
- Mismatch: NÃO DETECTADO (queixa alinhada com especialidade)
```

---

### Step 3: Scoring de Compatibilidade (ICP Match)

Ler `context/my-icp.md` e comparar paciente novo contra perfil ideal:

| Critério | Score (1-5) | Peso |
|----------|-------------|------|
| Queixa alinha com especialidade | __ | 3x |
| Faixa etária dentro do ICP | __ | 2x |
| Disponibilidade compatível | __ | 1x |
| Modalidade compatível (online/presencial) | __ | 1x |
| Motivação aparente | __ | 2x |
| Capacidade financeira (se relevante) | __ | 1x |

**Score ponderado**: (soma × peso) / max possível → percentual

| Score | Classificação |
|-------|--------------|
| 80-100% | Excelente fit |
| 60-79% | Bom fit |
| 40-59% | Fit parcial — considerar |
| 0-39% | Baixo fit — provavelmente referir |

---

### Step 4: Decisão (Three Outcomes)

Com base em red flags + ICP score + contexto:

#### ✅ ACEITAR
- Score ICP ≥ 60%
- Nenhum red flag IMMINENTE ou SIGNIFICATIVO
- Queixa dentro da competência
- Disponibilidade compatível

#### ⚠️ ACEITAR COM CONDIÇÕES
- Score ICP ≥ 40% MAS:
  - Red flag NOTÁVEL presente (ex: litígio → definir escopo antes)
  - Medicação necessária → encaminhar psiquiatria primeiro
  - Menor → obter consentimento do responsável
  - Crise → estabilizar antes de iniciar processo terapêutico regular

**Output das condições**:
```
Aceitar COM as seguintes condições:
1. [Condição 1 — ação necessária antes da primeira sessão]
2. [Condição 2]
```

#### ❌ REFERIR
- Red flag IMMINENTE sem capacidade de manejo
- Score ICP < 40%
- Queixa fora da competência (ex: neuropsicologia e você não faz)
- Relação dual que compromete ética
- Agenda lotada + baixa prioridade

**Output da referência**:
```
Referir para: [tipo de profissional ou nome se souber]
Razão: [explicação honesta e ética]
Como comunicar: [sugestão de mensagem ao paciente]
```

---

### Step 5: Criar Ficha do Paciente

Se decisão = ACEITAR ou ACEITAR COM CONDIÇÕES:

Criar arquivo `data/patients/[nome-slug].md`:

```markdown
# [Nome do Paciente]

**Início**: [data de hoje]
**Sessão atual**: #0 (pré-intake)
**Frequência**: [a definir]
**Queixa principal**: [queixa nas palavras do paciente]
**Hipótese diagnóstica**: [a avaliar]
**Abordagem**: [from context/my-clinic.md]
**Status**: Ativo

---

## Dados de Intake

**Idade**: [idade]
**Como chegou**: [fonte]
**Terapia anterior**: [sim/não — detalhes]
**Medicação**: [sim/não — quais]
**Urgência**: [sim/não]
**Preferência**: [horário + modalidade]

### ICP Score: [X]% — [Excelente/Bom/Parcial/Baixo] fit

### Red Flags
[Declared absence completo aqui]

### Decisão
[ACEITAR / ACEITAR COM CONDIÇÕES / REFERIR]
[Condições se houver]

### Próximos Passos
1. [Ação 1 — agendar sessão / obter consentimento / encaminhar]
2. [Ação 2]

---

## Sessões
[Vazio — será preenchido por /session-notes]
```

---

### Step 6: Output Final

```
📋 TRIAGEM COMPLETA — [Nome]

📊 ICP Score: [X]% ([classificação])
🚦 Red Flags: [X detectados / 0 detectados]
✅ Decisão: [ACEITAR / CONDIÇÕES / REFERIR]

📁 Ficha criada: data/patients/[slug].md

🎯 Próximo passo: [ação]
```

---

## Edge Cases

1. **Paciente em crise aguda**
   - NÃO fazer intake completo
   - Priorizar: `/risk-assessment` imediatamente
   - Se risco iminente: orientar SAMU 192 / CVV 188
   - Intake formal APÓS estabilização

2. **Menor de idade**
   - Obrigatório: nome e contato do responsável
   - Consentimento informado do responsável antes da primeira sessão
   - Registrar: "Menor — responsável: [nome], contato: [tel]"
   - Edge: adolescente 16-17 que vem por conta — orientar sobre marco legal

3. **Paciente que já atendeu com outro profissional do consultório**
   - Check: conflito de interesse?
   - Se sim: abordar com equipe antes de aceitar

4. **Paciente que pede laudo ou atestado no primeiro contato**
   - Red flag NOTÁVEL (motivação pode não ser terapêutica)
   - Aceitar COM CONDIÇÃO: "Laudo só após avaliação de X sessões"

5. **Psicólogo com agenda lotada**
   - Oferecer lista de espera
   - Ou referir para colega com fit parecido
   - Nunca aceitar sabendo que não tem vaga (ético)

6. **Contato veio por mensagem muito vaga**
   - "Quero fazer terapia" sem mais detalhes
   - Step 1 guia as perguntas a fazer ao paciente via WhatsApp
   - Psicólogo cola respostas → sistema processa

---

## Dependencies

- `context/my-icp.md` — para scoring de compatibilidade
- `context/my-clinic.md` — para especialidade + disponibilidade
- `context/practice-rules.md` — para regras de consentimento
- `references/clinical-scales.md` — para red flag reference (C-SSRS)

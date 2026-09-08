---
name: clinic-setup
description: >
  Wizard de configuração para psicólogos. Uma conversa para capturar tudo:
  identidade da clínica, voz profissional, paciente ideal, regras de compliance,
  ferramentas e prioridades. Escreve todos os contextos e cria a estrutura de pastas.
  Use com /clinic-setup ou quando contexto/my-clinic.md está vazio.
user-invocable: true
---

# Clinic Setup — CORA

Uma conversa. Tudo que o sistema precisa saber sobre você e sua prática.

## When to Trigger

- `context/my-clinic.md` não existe ou contém placeholders
- Usuário diz "configurar", "setup", "começar", "inicializar"
- Primeira vez usando qualquer skill que depende de contexto

## Process

Conversar em fases. Perguntar 3-5 por vez. Esperar respostas. Avançar.
Tom: acolhedor, direto, sem jargão técnico demais.

---

### Fase 1: Sua Prática

1. "Como é o nome da sua clínica ou consultório? (Se atende solo, pode ser seu nome)"
2. "Quais são suas especialidades? (ex: TCC para ansiedade, terapia de casal, infantojuvenil)"
3. "Há quanto tempo você atende? E em que estágio está? (recém-formado, construindo clientela, lotado)"
4. "Quantos pacientes você atende por semana atualmente?"
5. "Qual seu maior desafio agora? (documentação, captar pacientes, gestão, conteúdo, tempo)"

---

### Fase 2: Sua Voz

1. "Como você descreveria seu estilo de comunicação com pacientes? (acolhedor, direto, calmo, técnico)"
2. "Cole uma mensagem que você enviou a um paciente e que represente seu tom típico"
3. "O que você NUNCA quer soar? (frio, vendedor, clínico demais, informal demais)"
4. "Se um paciente novo te manda mensagem perguntando sobre a terapia, como você responde?"

---

### Fase 3: Seu Paciente Ideal

1. "Descreva o tipo de paciente que você MAIS gosta de atender (idade, queixa, perfil)"
2. "De onde seus pacientes vêm hoje? (indicação, Instagram, Google, diretórios como Zenklub)"
3. "Quanto custa sua sessão? Tem valor social ou escala diferencial?"
4. "Quem NÃO é um bom fit para você? (queixas que você encaminha, perfis que não combina)"

---

### Fase 4: Compliance & Regras

1. "Qual seu CRP e estado? (ex: CRP/SP 12345)"
2. "Você tem seguro de responsabilidade profissional?"
3. "Como você armazena prontuários hoje? (papel, Word, Notion, PEP, planilha)"
4. "Qual sua política de cancelamento? E de no-show?"
5. "Se um paciente entra em crise fora do horário, qual seu protocolo?"

---

### Fase 5: Suas Ferramentas

1. "Quais ferramentas você usa no dia a dia? (Google Calendar, WhatsApp, Notion, Excel, etc.)"
2. "Você posta em redes sociais? Quais plataformas? (Instagram, LinkedIn, YouTube, TikTok)"
3. "Como seus pacientes agendam sessões? (WhatsApp, link de agendamento, secretária)"
4. "Você usa algum sistema de prontuário eletrônico? Qual?"

---

### Fase 6: Prioridades 90 Dias

1. "Se o sistema pudesse te dar 3 coisas nos próximos 90 dias, o que seriam?"
2. "O que mais te drena energia e você gostaria de tirar do seu prato?"
3. "Quanto tempo por semana você gastaria usando este sistema? (10 min/dia? 30 min/semana?)"

---

## Scaffold Workspace

Após coletar respostas, criar estrutura:

```bash
mkdir -p context data/patients deliverables/exports .tmp logs
```

| Pasta | Propósito |
|-------|-----------|
| `context/` | Arquivos de identidade, voz, ICP, regras |
| `data/patients/` | Prontuários (CONFIDENCIAL — nunca em git) |
| `data/` | SQLite de billing, calendário, leads |
| `deliverables/exports/` | Posts, PDFs gerados (limpar semanalmente) |
| `.tmp/` | Rascunhos temporários |
| `logs/` | Audit trail |

---

## Create Context Files

Com base nas respostas, escrever:

### 1. `context/my-clinic.md`
Compilar Fase 1 + Fase 4 em formato estruturado:
- Nome, CRP, especialidades, stage, sessão/semana
- Desafio principal
- Políticas de cancelamento e no-show
- Protocolo de emergência

### 2. `context/my-voice.md`
Compilar Fase 2:
- Tom (2-3 adjetivos)
- Exemplo de mensagem
- Anti-patterns
- Frases características

### 3. `context/my-icp.md`
Compilar Fase 3:
- Paciente ideal (demográfico + queixa + perfil)
- Onde buscam
- Preço
- Red flags / não-fit

### 4. `context/practice-rules.md`
Compilar Fase 4 + defaults:
- CRP + estado
- Seguro
- Format de notas
- Políticas
- LGPD defaults

### 5. `context/tools-stack.md`
Compilar Fase 5:
- Ferramentas atuais
- Plataformas social
- Sistema de agendamento
- PEP (se houver)

---

## Edge Cases

1. **Psicólogo recém-formado (< 6 meses)**
   - Skip Fase 3 questions about "where do patients come from" (answer: nowhere yet)
   - Focus /patient-acquisition as next step
   - Tone: encouraging, not judgmental

2. **Already has a lot of patients (15+/week)**
   - Skip acquisition skills in recommendation
   - Focus: /session-notes + /admin-dashboard
   - Their pain = documentation + billing, not getting patients

3. **Working with children**
   - Add parent/guardian fields to context
   - Remind about consent forms
   - Notes format differs (play therapy observations vs. standard evolution)

4. **Team clinic (2+ therapists)**
   - Ask who this system serves (individual therapist or the whole clinic?)
   - If whole clinic: need per-therapist context files
   - Recommend separate installations per therapist

5. **Already uses a PEP (electronic health record)**
   - Don't compete with the PEP for clinical records
   - Shift /session-notes to "draft → paste into PEP" mode
   - Focus on what PEP doesn't do: content, acquisition, admin

6. **Uncomfortable with technology**
   - Simplify recommendations: start with /session-notes only
   - Skip content/acquisition until they're comfortable
   - More guidance, smaller steps, celebrate progress

---

## Routing After Setup

Based on their stated biggest challenge:

| Challenge | Route |
|-----------|-------|
| "Documentação" | → `/session-notes` (show them how it works with one example) |
| "Captar pacientes" | → `/patient-acquisition` (strategy first) or `/content-creator` (quick win) |
| "Gestão / tempo" | → `/admin-dashboard` (show Monday morning brief) |
| "Conteúdo" | → `/content-creator` (generate 3 posts now) |
| "Tudo" | → `/session-notes` first (biggest time save per session) |

---

## Output

After setup completes, print:

```
✅ CORA configurado!

📁 Arquivos criados:
  • context/my-clinic.md
  • context/my-voice.md
  • context/my-icp.md
  • context/practice-rules.md
  • context/tools-stack.md

🎯 Seu próximo passo:
  [DYNAMIC: based on routing above]

💡 Dica: você pode sempre rodar /clinic-setup novamente para atualizar.
```

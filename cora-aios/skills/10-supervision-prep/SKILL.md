---
name: supervision-prep
description: >
  Prepara material para supervisão clínica. Organiza caso, formula dúvidas,
  identifica pontos cegos, e gera apresentação estruturada para supervisar.
  Use com /supervision-prep, "preparar supervisão", "caso para supervisão",
  "levar caso para supervisor", "dúvida clínica sobre paciente".
user-invocable: true
argument-hint: "[nome-paciente]"
---

# Supervision Prep — Preparação para Supervisão

## Objective

Estruturar apresentação de caso para supervisão clínica. Organizar: o que aconteceu, onde você está travado, e o que precisa do supervisor.

**Antes**: Psicólogo chega na supervisão e gasta 20 min contextualizando antes de chegar na dúvida.
**Depois**: Resumo estruturado pronto. Vai direto ao ponto.

---

## When to Trigger

- `/supervision-prep [nome]`
- "Preparar supervisão", "caso para supervisão"
- "Estou travado com [nome]", "dúvida clínica"
- Antes de sessão de supervisão individual ou grupo

---

## Process

### Step 1: Identificar o Caso

Ler `data/patients/[slug].md` — últimas 3-5 sessões + formulação + plano.

### Step 2: Perguntar ao Psicólogo

1. "Qual sua principal dúvida ou dificuldade com esse caso?"
2. "O que você tentou que não funcionou?"
3. "O que sente na relação com esse paciente? (contratransferência)"
4. "Há questão ética ou de manejo que te preocupa?"

### Step 3: Gerar Apresentação

```markdown
## Caso para Supervisão — [Iniciais]
**Data da supervisão**: [data]
**Supervisionando**: [seu nome + CRP]
**Sessão atual com paciente**: #[N]

---

### Vinheta Clínica (3-5 linhas)
[Resumo mínimo para contextualizar: quem é, queixa, há quanto tempo, abordagem]

### Formulação Atual (Resumida)
[1 parágrafo com hipótese de manutenção]

### Último Período (Últimas 3-5 sessões)
| Sessão | Tema Central | O que Fiz | Resultado |
|--------|-------------|-----------|-----------|
| #[N-2] | [tema] | [intervenção] | [efeito] |
| #[N-1] | [tema] | [intervenção] | [efeito] |
| #[N] | [tema] | [intervenção] | [efeito] |

### Onde Estou Travado
[Descrição honesta da dificuldade — técnica, relacional, ética]

### O Que Já Tentei
- [Tentativa 1 — resultado]
- [Tentativa 2 — resultado]

### Contratransferência (O Que Sinto)
[O que surge em mim na relação com esse paciente — irritação, tédio, proteção, atração, medo, impotência]

### Questão Ética (se houver)
[Dilema ético, dupla relação, limite de competência, etc.]

### O Que Preciso do Supervisor
- [ ] Validação de formulação
- [ ] Sugestão de técnica/intervenção
- [ ] Reflexão sobre contratransferência
- [ ] Orientação ética
- [ ] Discussão diagnóstica
- [ ] Outro: ___________

### Minha Hipótese (antes de ouvir supervisor)
[O que VOCÊ acha que está acontecendo — registrar para comparar depois]

---
Preparado em: [data]
```

### Step 4: Pós-Supervisão (Optional Follow-Up)

Após a supervisão, o psicólogo pode registrar:

```
### Feedback do Supervisor
- [Ponto 1]
- [Ponto 2]

### Plano de Ação
- [Ação 1 para próxima sessão com paciente]
- [Ação 2]

### Nota Pessoal
[Aprendizado, insight, reflexão]
```

Save append em `data/patients/[slug].md` seção "## Supervisões".

---

## Edge Cases

1. **Psicólogo não faz supervisão formal**
   - Skill funciona como "auto-supervisão" — estrutura reflexão
   - Sugerir: "Mesmo sem supervisor, essa reflexão ajuda a ver pontos cegos"

2. **Caso de grupo (supervisão em grupo)**
   - Format mais conciso (outros esperando)
   - Foco: vinheta curta + 1 pergunta clara

3. **Emergência ética**
   - Se questão ética detectada: flag "⚠️ Consultar CRP ou comitê de ética"
   - Não resolver questão ética via AI — apenas estruturar para discussão humana

4. **Paciente em risco + supervisão**
   - Se risk-assessment indica risco: priorizar ação sobre supervisão
   - Supervisão pode acontecer DEPOIS de ação de segurança

---

## Dependencies

- `data/patients/[slug].md` — histórico
- `references/intervention-library.md` — para nomear o que foi tentado
- Skills anteriores fornecem dados

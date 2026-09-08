---
name: risk-assessment
description: >
  Avaliação estruturada de risco (suicídio, autolesão, violência). Protocolo
  baseado em Columbia C-SSRS. Gera classificação de risco + plano de segurança +
  encaminhamento. Use com /risk-assessment, "avaliar risco", "paciente em risco",
  "ideação suicida", "autolesão", "plano de segurança".
user-invocable: true
argument-hint: "[nome-paciente]"
---

# Risk Assessment — Avaliação de Risco

## Objective

Protocolo sistemático para avaliação de risco clínico. Não é screening casual — é ferramenta clínica séria que estrutura o julgamento profissional.

**O sistema NÃO decide risco. O sistema ESTRUTURA a avaliação para o profissional decidir.**

---

## When to Trigger

- `/risk-assessment` ou `/risk-assessment [nome]`
- "Avaliar risco", "paciente em risco", "ideação suicida"
- "Autolesão", "plano de segurança", "paciente mencionou morte"
- Quando `/client-intake` detecta red flag IMMINENTE
- Quando `/session-notes` input menciona ideação ou comportamento de risco
- PHQ-9 item 9 > 0

---

## AVISO CRÍTICO

```
⚠️ EMERGÊNCIA IMEDIATA: Se há risco iminente de vida:
   → SAMU: 192
   → CVV: 188 (24h)
   → Emergência: 190
   
   NÃO usar este sistema como substituto de ação imediata.
   Este protocolo é para DOCUMENTAR e ESTRUTURAR, não para DECIDIR em emergência.
```

---

## Process

### Step 1: Contextualizar

Perguntas ao psicólogo (NÃO ao paciente — este é input do profissional):

1. "O que motivou esta avaliação? (relato do paciente, observação sua, PHQ-9, outro)"
2. "Quando isso aconteceu? (durante sessão, entre sessões, contato de emergência)"
3. "O paciente está seguro AGORA? (sim/não/não sei)"

Se resposta à pergunta 3 = "não" ou "não sei":
→ PARAR avaliação formal
→ Orientar ação imediata (SAMU 192, acompanhar até emergência)
→ Documentar APÓS paciente estar seguro

---

### Step 2: Protocolo C-SSRS (Adaptado)

Ler `references/clinical-scales.md` seção Columbia C-SSRS.

Psicólogo responde baseado no que OBSERVOU e no que paciente RELATOU:

#### Módulo A: Ideação Suicida

| # | Pergunta | Presente? |
|---|----------|-----------|
| 1 | Desejo de estar morto ("queria não ter nascido", "queria dormir e não acordar") | Sim / Não |
| 2 | Pensamentos suicidas não-específicos ("pensei em me matar" sem plano) | Sim / Não |
| 3 | Ideação com método (pensou em COMO, mas sem plano definido) | Sim / Não |
| 4 | Ideação com intenção (tem alguma intenção de agir) | Sim / Não |
| 5 | Ideação com plano e intenção (detalhes elaborados) | Sim / Não |

**Regra**: O número mais alto marcado "Sim" define o nível base.

#### Módulo B: Intensidade (se ideação presente)

| Fator | Score (1-5) |
|-------|-------------|
| Frequência (raramente → diariamente) | __ |
| Duração (segundos → horas) | __ |
| Controlabilidade (fácil de afastar → impossível) | __ |
| Dissuasores (muitas razões para não → nenhuma) | __ |
| Razão para pensar (fugir da dor → chamar atenção → realmente morrer) | __ |

#### Módulo C: Comportamento (lifetime + últimos 3 meses)

| Comportamento | Lifetime | Últimos 3 meses |
|---------------|----------|-----------------|
| Tentativa real de suicídio | Sim / Não | Sim / Não |
| Tentativa interrompida (por alguém) | Sim / Não | Sim / Não |
| Tentativa abortada (desistiu no momento) | Sim / Não | Sim / Não |
| Atos preparatórios (comprar meios, escrever carta) | Sim / Não | Sim / Não |
| Autolesão SEM intenção suicida | Sim / Não | Sim / Não |

---

### Step 3: Fatores Moduladores

#### Fatores de Risco (AUMENTAM gravidade)

| Fator | Presente? | Notas |
|-------|-----------|-------|
| Tentativa prévia | __ | Método? Letalidade? |
| Acesso a meios letais | __ | Quais? Pode restringir? |
| Isolamento social | __ | Mora só? Sem rede? |
| Perda recente (luto, separação, emprego) | __ | Quando? |
| Abuso de substâncias | __ | Quais? Frequência? |
| Desesperança intensa | __ | PHQ-9? Discurso? |
| Doença crônica / dor | __ | |
| Histórico familiar de suicídio | __ | |
| Insônia grave | __ | |
| Evento estressor agudo | __ | |

#### Fatores de Proteção (REDUZEM urgência)

| Fator | Presente? | Notas |
|-------|-----------|-------|
| Suporte social identificável | __ | Quem? |
| Filhos / responsabilidade familiar | __ | |
| Crenças religiosas/espirituais | __ | |
| Medo de morte/dor | __ | |
| Aliança terapêutica forte | __ | |
| Razões para viver identificadas | __ | Quais? |
| Engajamento no tratamento | __ | |
| Esperança de melhora | __ | |

---

### Step 4: Classificação de Risco

Combinar: Ideação (A) + Intensidade (B) + Comportamento (C) + Moduladores

| Nível | Critérios | Cor |
|-------|-----------|-----|
| **IMINENTE** | Ideação 4-5 + plano + meios acessíveis OU tentativa nas últimas 48h | 🔴 |
| **ALTO** | Ideação 3-4 OU tentativa nos últimos 3 meses OU ideação + múltiplos fatores de risco | 🟠 |
| **MODERADO** | Ideação 1-2 + fatores de risco presentes OU autolesão recorrente | 🟡 |
| **BAIXO** | Ideação 1 isolada + fatores de proteção fortes OU PHQ-9 item 9 = 1 sem contexto | 🟢 |
| **AUSENTE** | Nenhuma ideação + nenhum comportamento + avaliação completa realizada | ⚪ |

---

### Step 5: Plano de Ação por Nível

#### 🔴 IMINENTE
```
AÇÃO IMEDIATA:
1. NÃO deixar paciente sozinho
2. Chamar SAMU 192 ou acompanhar à emergência
3. Restringir acesso a meios (se possível)
4. Contato com familiar/pessoa de confiança (com permissão se possível, sem se risco real)
5. Documentar tudo APÓS paciente estar seguro
6. Encaminhar internação se indicado
```

#### 🟠 ALTO
```
AÇÕES NAS PRÓXIMAS 24-48H:
1. Plano de segurança (ver Step 6)
2. Encaminhar avaliação psiquiátrica URGENTE
3. Aumentar frequência de sessões (2-3x/semana se possível)
4. Contato com rede de apoio (com consentimento)
5. Restringir acesso a meios
6. Combinar check-in diário (mensagem/ligação breve)
7. Reavaliar em 48h
```

#### 🟡 MODERADO
```
AÇÕES NA PRÓXIMA SEMANA:
1. Plano de segurança (ver Step 6)
2. Considerar encaminhamento psiquiátrico
3. Aumentar frequência para semanal (se quinzenal)
4. Monitorar PHQ-9/GAD-7 sessão a sessão
5. Reavaliar risco a cada sessão
6. Psicoeducação sobre sinais de alerta
```

#### 🟢 BAIXO
```
AÇÕES CONTÍNUAS:
1. Documentar avaliação (esta nota)
2. Monitorar item 9 PHQ-9 nas próximas aplicações
3. Manter tema disponível para discussão
4. Reavaliar se houver mudança de contexto
```

#### ⚪ AUSENTE
```
REGISTRO:
1. Documentar que avaliação completa foi realizada
2. Resultado: sem indicadores de risco
3. Próxima reavaliação: [trimestral / se indicadores surgirem]
```

---

### Step 6: Plano de Segurança (se risco MODERADO ou ALTO)

Gerar plano de segurança estruturado:

```markdown
## Plano de Segurança — [Iniciais]
**Data**: [data]
**Elaborado com**: paciente + terapeuta

### 1. Sinais de Alerta (reconheço que estou em risco quando...)
- [sinal 1 — pensamento, sentimento, situação]
- [sinal 2]
- [sinal 3]

### 2. Estratégias de Enfrentamento Internas (posso fazer sozinho)
- [estratégia 1 — ex: respiração, caminhar, banho gelado]
- [estratégia 2]
- [estratégia 3]

### 3. Pessoas/Ambientes que Distraem
- [pessoa/lugar 1 — sem falar sobre a crise]
- [pessoa/lugar 2]

### 4. Pessoas que Posso Pedir Ajuda
- [Nome 1]: [telefone]
- [Nome 2]: [telefone]
- Terapeuta: [telefone]

### 5. Profissionais / Emergência
- CVV: 188 (24h)
- SAMU: 192
- UPA/Emergência: [endereço mais próximo]
- Psiquiatra: [nome + contato se houver]

### 6. Tornar o Ambiente Seguro
- [ação — ex: guardar medicamentos com familiar, retirar acesso a meios]

### 7. Minhas Razões para Viver
- [razão 1]
- [razão 2]
- [razão 3]
```

---

### Step 7: Output Final

```markdown
## Avaliação de Risco — [Iniciais]
**Data**: [data]
**Motivação**: [o que levou à avaliação]
**Avaliador**: [CRP from context]

### Classificação: [🔴 IMINENTE / 🟠 ALTO / 🟡 MODERADO / 🟢 BAIXO / ⚪ AUSENTE]

### Ideação (C-SSRS)
- Nível: [1-5 ou nenhum]
- Frequência: [__/5]
- Controlabilidade: [__/5]

### Comportamento
- Tentativa prévia: [sim/não]
- Tentativa recente (3 meses): [sim/não]
- Autolesão: [sim/não]
- Atos preparatórios: [sim/não]

### Fatores de Risco Presentes
- [lista]

### Fatores de Proteção Presentes
- [lista]

### Declared Absence (fatores avaliados e NÃO encontrados)
- [lista — ex: "Acesso a meios: avaliado — não identificado"]

### Plano de Ação
[Conforme nível — copiar de Step 5]

### Plano de Segurança
[Se MODERADO/ALTO — copiar de Step 6]

### Encaminhamento
- [Psiquiatria / CAPS / Emergência / Nenhum]

### Reavaliação
- Data: [próxima sessão / 48h / imediato]

---
⚠️ RASCUNHO — Requer validação e assinatura do profissional responsável
CRP: [from context/my-clinic.md]

IMPORTANTE: Esta avaliação é uma ferramenta de estruturação.
A decisão clínica final é responsabilidade exclusiva do profissional.
```

---

### Step 8: Log em Audit Trail

OBRIGATÓRIO — Toda avaliação de risco é logada:

```bash
# Append to data/audit-log.md
echo "$(date) | RISK-ASSESSMENT | [iniciais] | Nível: [X] | Ação: [Y]" >> data/audit-log.md
```

---

## Edge Cases

1. **Paciente nega mas terapeuta suspeita**
   - Registrar: "Paciente nega ideação. Terapeuta observa: [indicadores indiretos]"
   - Classificar baseado em julgamento clínico + fatores de risco
   - Declared Absence: "Ideação negada verbalmente, mas [observação X presente]"

2. **Paciente menor de idade**
   - Obrigatório: informar responsável SE risco moderado+
   - Exceção: menor que pede sigilo + risco apenas BAIXO = manter sigilo + monitorar
   - Documentar decisão ética (Art. 13 ECA)

3. **Autolesão SEM intenção suicida**
   - Classificar separadamente (Módulo C)
   - Não equiparar automaticamente a risco suicida
   - MAS: autolesão é fator de risco para suicídio futuro

4. **Reavaliação (não é primeira vez)**
   - Comparar com avaliação anterior
   - Registrar: "Reavaliação — anterior: [nível X em data Y]. Atual: [nível Z]"
   - Se piorou: ajustar plano imediatamente

5. **Paciente em teleconsulta (online)**
   - Limitações: não pode impedir saída, não pode verificar meios
   - Obter endereço + contato de emergência local ANTES da sessão
   - Se risco iminente em sessão online: manter na chamada + acionar SAMU + familiar

6. **Profissional inseguro sobre classificação**
   - Orientar: "Na dúvida, classifique UM nível acima"
   - Orientar: buscar supervisão/interconsulta
   - Registrar: "Classificação com dúvida — supervisão buscada"

---

## Dependencies

- `references/clinical-scales.md` — C-SSRS, PHQ-9 item 9
- `context/my-clinic.md` — CRP, protocolo de emergência
- `context/practice-rules.md` — política de crise
- `data/patients/[slug].md` — histórico do paciente
- `data/audit-log.md` — registro obrigatório

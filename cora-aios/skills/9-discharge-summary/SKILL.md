---
name: discharge-summary
description: >
  Gera resumo de alta ou encerramento de caso. Consolida todo o tratamento:
  motivo, duração, intervenções, ganhos, recomendações. Serve como documento
  oficial e referência futura. Use com /discharge-summary, "alta do paciente",
  "encerrar caso", "resumo de tratamento", "paciente concluiu".
user-invocable: true
argument-hint: "[nome-paciente]"
---

# Discharge Summary — Resumo de Alta

## Objective

Quando paciente conclui tratamento (alta planejada, dropout, ou encaminhamento), gerar documento consolidado que resume toda a jornada terapêutica.

---

## When to Trigger

- `/discharge-summary [nome]`
- "Alta do paciente", "encerrar caso", "paciente concluiu"
- "Resumo de tratamento para [nome]"
- Quando `/progress-tracker` recomenda "Preparar alta"
- Quando paciente desiste (dropout) — registrar diferente

---

## Process

### Step 1: Classificar Tipo de Encerramento

| Tipo | Descrição |
|------|-----------|
| **Alta planejada** | Objetivos atingidos, decisão mútua |
| **Alta a pedido** | Paciente decide sair (sem completar) |
| **Dropout** | Paciente some sem avisar (3+ faltas sem contato) |
| **Encaminhamento** | Transferência para outro profissional |
| **Pausa acordada** | Interrupção temporária com previsão de retorno |

### Step 2: Carregar Histórico Completo

Ler `data/patients/[slug].md` — tudo:
- Intake, formulação, plano, todas as sessões, escalas, risk assessments

### Step 3: Gerar Resumo

```markdown
## Resumo de Alta — [Iniciais]
**Data de início**: [data]
**Data de encerramento**: [data]
**Total de sessões**: [N]
**Frequência predominante**: [semanal/quinzenal]
**Tipo de encerramento**: [Alta planejada / A pedido / Dropout / Encaminhamento / Pausa]

---

### Motivo de Busca (Intake)
[Queixa original nas palavras do paciente — copiar do intake]

### Hipótese Diagnóstica
[CID-10 se definida, ou "a avaliar" se não]

### Formulação (Resumida)
[1 parágrafo — essência da formulação clínica]

### Intervenções Principais
| Intervenção | Sessões | Resultado |
|-------------|---------|-----------|
| [Técnica 1] | #[X]-#[Y] | [eficaz / parcial / sem resposta] |
| [Técnica 2] | #[X]-#[Y] | [eficaz / parcial / sem resposta] |

### Evolução
| Aspecto | Início | Fim | Mudança |
|---------|--------|-----|---------|
| Queixa principal | [intensidade] | [intensidade] | [↑/→/↓] |
| Funcionamento | [nível] | [nível] | [↑/→/↓] |
| PHQ-9 (se aplicado) | [score] | [score] | [±N] |
| GAD-7 (se aplicado) | [score] | [score] | [±N] |

### Objetivos — Status Final
| Objetivo | Status |
|----------|--------|
| [Objetivo 1] | ✅ Atingido / 🔄 Parcial / ❌ Não atingido |
| [Objetivo 2] | [status] |

### Ganhos Terapêuticos (Conquistas)
- [Ganho 1 — comportamental, cognitivo, relacional]
- [Ganho 2]
- [Ganho 3]

### Áreas não Trabalhadas / Pendentes
- [Tema que não houve tempo de abordar]
- [Questão identificada mas não prioritária]

### Recomendações
- [ ] Manutenção autônoma: [o que paciente pode continuar sozinho]
- [ ] Possível retorno: [em que circunstâncias voltar]
- [ ] Encaminhamento: [se necessário — psiquiatria, grupo, outro]
- [ ] Prevenção de recaída: [sinais de alerta + estratégias]

### Motivo do Encerramento
[Se alta planejada: "Objetivos atingidos, paciente e terapeuta concordam"]
[Se dropout: "Paciente não compareceu a partir de [data]. Tentativas de contato em [datas]. Sem retorno."]
[Se encaminhamento: "Encaminhado para [profissional/serviço] por [razão]"]

---
Profissional responsável: [Nome + CRP]
Data: [data]

⚠️ RASCUNHO — Requer revisão e assinatura do profissional responsável
```

### Step 4: Atualizar Status

Em `data/patients/[slug].md`:
- Mudar status: "Ativo" → "[Alta / Dropout / Encaminhado / Pausa]"
- Adicionar seção "## Resumo de Alta" com documento gerado

---

## Edge Cases

1. **Dropout (paciente sumiu)**
   - Registrar tentativas de contato (datas, meio)
   - Tom: factual, sem julgamento
   - Manter prontuário por 5 anos (obrigação legal)

2. **Alta prematura (paciente decide sair cedo)**
   - Registrar: "Alta a pedido do paciente"
   - Documentar: orientações dadas, riscos mencionados
   - Oferecer: porta aberta para retorno

3. **Encaminhamento para outro profissional**
   - Gerar: resumo separado para enviar ao colega (SEM dados confidenciais desnecessários)
   - Versão para colega: foco clínico, sem dados pessoais excessivos

4. **Paciente menor que atinge maioridade**
   - Renegociar contrato (consentimento direto)
   - Documentar transição

---

## Dependencies

- `data/patients/[slug].md` — histórico completo
- Todas as skills anteriores (são fonte de dados)

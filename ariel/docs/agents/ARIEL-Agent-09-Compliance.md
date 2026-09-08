# 🧜‍♀️ ARIEL — Agent 9: Compliance & Prazos Fiscais

**Status:** Fase 2 — Semana 5-6  
**Complexidade:** ⭐⭐⭐ (Alta)  
**Impacto:** 🔴 Alto (evita multa — valor imediato)

---

## 📋 O Que Faz

Calendário fiscal inteligente. Monitora prazos por cliente, avisa antes de vencer, detecta obrigações pendentes, e garante que nenhuma multa aconteça por esquecimento.

---

## 🔔 Quando Ativa

**Triggers:**
1. Automático: todos os dias às 08:00 (checa prazos)
2. Alerta: 5 dias antes, 1 dia antes, no dia do vencimento
3. Manual: "quais meus prazos?"

---

## 🔄 Fluxo Detalhado

```
1. SCAN DIÁRIO
   ├─ Consulta: obrigações vencendo em 7 dias
   ├─ Para CADA obrigação:
   │   ├─ Está preparada? (docs ok, dados completos?)
   │   ├─ Se sim: ✅ confia
   │   └─ Se não: ⚠️ alerta
   └─ Gera resumo do dia

2. ALERTAS PROGRESSIVOS
   ├─ D-5: info suave — "Vencendo em 5 dias"
   ├─ D-1: urgência média — "Amanhã! Precisa de algo?"
   ├─ D-0: urgência alta — "VENCE HOJE!"
   └─ D+1: escalação — "VENCIDO! Ação imediata necessária"

3. AÇÃO PRÓ-ATIVA
   ├─ Verifica dados necessários para cumprir obrigação
   ├─ Se falta dado → cobra do cliente
   ├─ Se tem tudo → gera/entrega automaticamente
   └─ Marca como cumprido
```

---

## ⚙️ Calendário Fiscal por Nicho

### CONTÁBIL
```json
{
  "obrigacoes": [
    {
      "id": "das_simples",
      "nome": "DAS (Simples Nacional)",
      "vencimento": "dia 20 do mês seguinte",
      "aplica_a": ["simples_nacional"],
      "alertas": [5, 3, 1, 0],
      "dados_necessarios": ["faturamento_mes_anterior"],
      "acao_automatica": "gerar_guia_das"
    },
    {
      "id": "dctf",
      "nome": "DCTF (Declaração de Tributos)",
      "vencimento": "15o dia útil do 2o mês subsequente",
      "aplica_a": ["lucro_presumido", "lucro_real"],
      "alertas": [10, 5, 1],
      "dados_necessarios": ["tributos_declarados"],
      "acao_automatica": "nenhuma"
    },
    {
      "id": "fgts",
      "nome": "FGTS Digital",
      "vencimento": "dia 20 do mês seguinte",
      "aplica_a": ["tem_funcionarios"],
      "alertas": [5, 1, 0],
      "dados_necessarios": ["folha_fechada"],
      "acao_automatica": "gerar_guia_fgts"
    },
    {
      "id": "esocial",
      "nome": "E-Social (Eventos)",
      "vencimento": "dia 15 do mês seguinte",
      "aplica_a": ["tem_funcionarios"],
      "alertas": [7, 3, 1],
      "dados_necessarios": ["folha_aprovada"],
      "acao_automatica": "nenhuma"
    },
    {
      "id": "irrf",
      "nome": "IRRF (Retenção na Fonte)",
      "vencimento": "dia 20 do mês seguinte",
      "aplica_a": ["tem_funcionarios", "tem_rpa"],
      "alertas": [5, 1, 0],
      "dados_necessarios": ["folha_fechada", "rpas_processados"],
      "acao_automatica": "gerar_darf"
    },
    {
      "id": "defis",
      "nome": "DEFIS (Declaração Anual Simples)",
      "vencimento": "31 de março",
      "aplica_a": ["simples_nacional"],
      "alertas": [30, 15, 7, 1],
      "dados_necessarios": ["faturamento_anual", "despesas_anual"],
      "acao_automatica": "nenhuma"
    }
  ]
}
```

### JURÍDICO
```json
{
  "obrigacoes": [
    {
      "id": "prazo_recurso",
      "nome": "Prazo Recursal",
      "vencimento": "variável por tipo de recurso",
      "alertas": [5, 3, 1, 0],
      "dados_necessarios": ["decisao_publicada", "tipo_recurso"],
      "acao_automatica": "nenhuma"
    },
    {
      "id": "audiencia",
      "nome": "Audiência",
      "vencimento": "data agendada",
      "alertas": [7, 3, 1, 0],
      "dados_necessarios": ["local", "documentos_preparados"],
      "acao_automatica": "nenhuma"
    },
    {
      "id": "anuidade_oab",
      "nome": "Anuidade OAB",
      "vencimento": "março/anual",
      "alertas": [30, 7],
      "dados_necessarios": [],
      "acao_automatica": "nenhuma"
    }
  ]
}
```

---

## 💬 Exemplos Reais

### Alerta D-5 (Contábil)

```
"Oi João! 📅

Lembrando que em 5 dias vencem:

• DAS Simples (dia 20/09) — R$ 1.250
  Status: ✅ Guia já gerada

• FGTS Digital (dia 20/09) — R$ 840
  Status: ⚠️ Folha não está fechada ainda

Preciso que você aprove a folha até dia 18
pra eu gerar o FGTS a tempo. Manda por aqui!"
```

### Alerta D-0 (Jurídico)

```
"🚨 ATENÇÃO — Dr. Marcos

VENCE HOJE:
• Prazo recursal — Processo 123/2024 (Trabalhista)
• Tipo: Recurso Ordinário
• Tribunal: TRT-2

A petição está pronta para protocolar?
Se sim, confirma aqui que eu registro como cumprido.

[✓ Protocolar] [⚠️ Preciso de ajuda]"
```

---

## 📊 Métricas

| Métrica | Target |
|---------|--------|
| Prazos cumpridos no prazo | 100% (meta absoluta) |
| Alertas enviados/semana | 5-20 por tenant |
| Obrigações em dia | 95%+ |
| Multas por esquecimento | ZERO |

---

## ✅ Checklist

- [ ] Tabelas: `fiscal_calendar`, `obligations`, `obligation_status`
- [ ] Scheduler diário (08:00): scan de prazos
- [ ] Alerta progressivo (D-5, D-3, D-1, D-0, D+1)
- [ ] Verificação de pré-requisitos (dados prontos?)
- [ ] Integração com Agente 6 (cria task se dado falta)
- [ ] Notificação WhatsApp + push
- [ ] Dashboard: calendário visual
- [ ] Config por nicho (obrigações diferentes)
- [ ] Testes: simular mês fiscal completo

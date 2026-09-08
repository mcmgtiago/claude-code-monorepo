# 🧜‍♀️ ARIEL — Agent 8: Relatórios e Insights

**Status:** Fase 2 — Semana 5-6  
**Complexidade:** ⭐⭐⭐ (Alta)  
**Impacto:** 🟡 Médio (tomada de decisão)

---

## 📋 O Que Faz

Gera relatórios automáticos semanais/mensais. Identifica padrões, detecta anomalias, recomenda ações com base em dados. Envia via WhatsApp + web.

---

## 🔔 Quando Ativa

**Triggers:**
1. Automático: toda segunda-feira 09:00
2. Manual: cliente pede "relatório" ou "como foi?"
3. Sob demanda: gestor aciona dashboard

---

## 💬 Exemplos Reais

### Relatório Contábil Semanal
```
📊 RELATÓRIO — Sua Contabilidade (Semana 19-25 ago)

RESUMO:
• 12 documentos processados (NF-e, folha, RPA)
• 5 guias fiscais geradas (DAS, FGTS, E-Social)
• 0 erros detectados

💡 INSIGHTS:
• Faturamento cresceu 8% vs. semana passada
• Você tá com 3 guias de DAS vencendo (ação!)
• Folha de pagamento: tudo em dia

⚡ RECOMENDAÇÕES:
→ Migrar para Lucro Real (economia potencial: R$ 2.500/mês)
→ Revisar despesas (cresceram 15%)

[📅 Ver detalhes]
```

---

## 🔧 Técnico

**Prompt:** Agregar dados de 7 dias, calcular variação, detectar anomalia, formatar insights

**Métricas por nicho:**
- Contábil: faturamento, impostos, documentos processados
- Odonto: pacientes, receita, cancelamentos, taxa média
- Jurídico: processos abertos, recebidos, honorários ganhos

---

## ✅ Checklist

- [ ] Scheduler semanal (segunda 09:00)
- [ ] Agregação de métricas (últimos 7 dias)
- [ ] Cálculo de variação vs. semana anterior
- [ ] Detector de anomalias (threshold configurável)
- [ ] Gerador de insights (recomendações)
- [ ] Formatação para WhatsApp + PDF
- [ ] Dashboard web com gráficos
- [ ] Testes: 4 semanas de dados reais

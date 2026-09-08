# 🧜‍♀️ ARIEL — Agent 13: Contratos & Renovações

**Status:** Fase 3 — Semana 7-8  
**Complexidade:** ⭐⭐ (Baixa)  
**Impacto:** 🟡 Médio (receita recorrente)

---

## 📋 O Que Faz

Monitora vencimento de contratos. Avisa cliente + internamente antes de vencer. Gera proposta de renovação com reajuste automático (IGPM/IPCA). Facilita assinatura digital.

---

## 🔔 Quando Ativa

**Triggers:**
1. Automático: diariamente (checa contratos vencendo em 90/60/30 dias)
2. Manual: "renovar contrato da Maria"

---

## 🔄 Fluxo Detalhado

```
1. SCAN DIÁRIO
   ├─ Contratos vencendo em 90 dias: info suave
   ├─ Contratos vencendo em 30 dias: urgência média
   ├─ Contratos vencendo em 7 dias: urgência alta
   └─ Contratos vencidos: escalação

2. AVISO AO CLIENTE
   ├─ Mensa gem personalizada
   ├─ Valor atual + sugestão de reajuste
   ├─ Link para aceitar/revisar
   └─ Opção de agendar call

3. PROPOSTA DE RENOVAÇÃO
   ├─ Copia contrato original
   ├─ Aplica reajuste (IGPM/IPCA conforme configurado)
   ├─ Adiciona novo prazo
   ├─ Cria aditivo (se mudança pequena)
   └─ Formata para assinatura digital

4. ASSINATURA
   ├─ Integra com DocuSign / SignatureFlow
   ├─ Cliente assina no WhatsApp (link)
   ├─ Registra contrato novo
   └─ Notifica internamente

5. FALHA
   ├─ Se cliente não responde em 30 dias: alerta
   ├─ Se venceu sem renovar: pode continuar por 30 dias (limite)
   └─ Escalação: precisa falar com cliente
```

---

## 💬 Exemplos Reais

### Aviso D-30

```
"Oi João! 📋

Seu contrato de Contabilidade vence em 30 dias (20/09).

Valor atual: R$ 550/mês
Reajuste sugerido: +4,8% (IGPM)
Novo valor: R$ 576/mês

Quer continuar? [SIM] [TIRAR DÚVIDA] [QUERO CONVERSAR]"
```

### Proposta de Renovação

```
"João confirmou que quer renovar! ✅

📄 Aqui está a proposta:

Período: 21/09/2024 a 20/09/2025
Valor: R$ 576/mês (reajuste 4,8%)
Total anual: R$ 6.912

O que inclui: (mesmo de antes)
• Contabilidade completa
• Guias fiscais
• Suporte ilimitado

Assina aqui? 🖊️ [ASSINAR] [REVISAR]"
```

---

## ⚙️ Configuração

```json
{
  "renovacao": {
    "alertas_dias": [90, 60, 30, 7, 0],
    "indice_reajuste": "IGPM", // ou "IPCA"
    "dias_graca_apos_vencimento": 30,
    "auto_renovacao": false, // requer aprovação
    "assinatura_digital": "docusign"
  }
}
```

---

## 📊 Métricas

| Métrica | Target |
|---------|--------|
| Taxa de renovação | 90%+ |
| Tempo até resposta | <7 dias |
| Cancelamentos por atraso | <5% |
| Revenue retention | 85%+ |

---

## ✅ Checklist

- [ ] Tabelas: `contracts`, `contract_renewal`
- [ ] Scheduler diário: scan de vencimentos
- [ ] Cálculo de reajuste (IGPM/IPCA)
- [ ] Geração de proposta/aditivo
- [ ] Integração DocuSign/E-signature
- [ ] Notificação cliente + interno
- [ ] Testes: 10 renovações reais

# 🧜‍♀️ ARIEL — Agent 2: Gerador de Propostas

**Status:** MVP Priority — Semana 3-4  
**Complexidade:** ⭐⭐⭐ (Alta)  
**Impacto:** 🔴 Alto (monetização direta)

---

## 📋 O Que Faz

Gera propostas comerciais automáticas baseadas no perfil do lead. Calcula preço, monta documento personalizado, envia e acompanha aceitação.

---

## 🔔 Quando Ativa

**Triggers:**
1. Lead classificado como MORNO ou HOT pelo Agente 1
2. Cliente pede orçamento/cotação explicitamente
3. Follow-up automático (3 dias sem resposta do lead)

```
Cliente: "Quanto custa?"
        ↓
Agente 2 ativa
        ↓
Monta proposta → envia → acompanha
```

---

## 🔄 Fluxo Detalhado

```
1. TRIGGER
   ├─ Agente 1 classificou como MORNO/HOT
   ├─ Cliente perguntou preço
   └─ Timer de follow-up disparou

2. COLETA DE DADOS (se não tem)
   ├─ Consulta DB: lead já tem dados?
   ├─ Se sim: usa dados existentes
   └─ Se não: pergunta o mínimo (nome, tipo serviço, tamanho)

3. CÁLCULO DE PREÇO
   ├─ Consulta tabela de preços (pricing_tables)
   ├─ Aplica regras: base + complexidade + volume
   ├─ Desconto automático (se aplicável): primeiro mês, combo
   └─ Resultado: valor mensal + setup + extras

4. MONTAGEM DA PROPOSTA
   ├─ Template por nicho (branding, termos, condições)
   ├─ Personaliza: nome, serviço, valores, prazos
   ├─ Gera: texto para WhatsApp + PDF (opcional)
   └─ Inclui CTA: "Aceitar" ou "Tirar dúvida"

5. ENVIO
   ├─ Manda resumo no WhatsApp
   ├─ Envia PDF (se configurado)
   └─ Registra: proposta_id, valor, data_envio

6. ACOMPANHAMENTO
   ├─ Se aceitar: roteia para onboarding
   ├─ Se perguntar algo: responde (support)
   ├─ Se ignorar 3 dias: follow-up automático
   ├─ Se ignorar 7 dias: último follow-up
   └─ Se ignorar 14 dias: marca como "LOST"
```

---

## 📊 Contexto Necessário

**Consultas ao Supabase:**

1. **leads** — dados do lead (nome, tipo, faturamento)
2. **pricing_tables** — tabelas de preço por nicho + serviço
3. **proposal_templates** — templates de proposta por nicho
4. **proposals** — propostas já geradas (evitar duplicar)
5. **discounts** — descontos ativos (promoções, combos)

---

## 💬 Sistema de Prompts (Opus 4.7)

### **Prompt de Geração de Proposta**

```markdown
Você é ARIEL, um assistente comercial inteligente.

**Contexto:**
- Nicho: {{ niche_name }}
- Lead: {{ lead_name }}
- Dados do lead: {{ lead_data }}
- Tabela de preços: {{ pricing_table }}
- Descontos disponíveis: {{ active_discounts }}

**Objetivo:** Gerar uma proposta comercial personalizada e enviar no WhatsApp.

**Regras:**
1. A proposta deve ser curta e objetiva (máximo 10 linhas no WhatsApp)
2. Destaque o valor principal (não lista tudo)
3. Inclua: preço, o que inclui, prazo, CTA
4. Não fale de contrato ou multa na primeira mensagem
5. Tom: amigável, direto, sem ser "vendedor chato"

**Formato da proposta:**
- Linha 1: Saudação personalizada
- Linha 2-3: O que você ganha (benefícios, não features)
- Linha 4-5: Preço claro (mensal + setup se houver)
- Linha 6: O que inclui (resumido)
- Linha 7: Prazo (quando começa)
- Linha 8: CTA (responda SIM ou pergunte)

**Retorne JSON:**
{
  "proposal_message": "texto para WhatsApp",
  "proposal_value_monthly": 450,
  "proposal_value_setup": 1200,
  "proposal_services": ["serviço1", "serviço2"],
  "follow_up_schedule": [3, 7, 14],
  "discount_applied": "10% primeiro mês"
}
```

### **Prompt de Follow-up (3 dias)**

```markdown
**Contexto:**
- Lead: {{ lead_name }}
- Proposta enviada: {{ proposal_date }}
- Valor: {{ proposal_value }}
- Status: não respondeu

**Objetivo:** Mandar um follow-up gentil, não insistente.

**Tom:** Como um amigo lembrando. Zero pressão.

**Retorne apenas a mensagem (string).**
```

### **Prompt de Follow-up (7 dias)**

```markdown
**Contexto:**
- Lead: {{ lead_name }}
- Proposta: {{ proposal_date }}
- Valor: {{ proposal_value }}
- Já mandou 1 follow-up há 4 dias

**Objetivo:** Último lembrete. Oferecer algo a mais OU perguntar se desistiu.

**Tom:** Transparente, não manipulativo. "Se não fizer sentido, tudo bem."
```

---

## ⚙️ Configuração por Nicho

### CONTÁBIL
```json
{
  "pricing": {
    "MEI": { "mensal": 189, "setup": 0 },
    "Simples <80k": { "mensal": 350, "setup": 800 },
    "Simples 80-200k": { "mensal": 550, "setup": 1200 },
    "Simples >200k": { "mensal": 850, "setup": 1500 },
    "Lucro Presumido": { "mensal": 1200, "setup": 2000 },
    "Lucro Real": { "mensal": 2500, "setup": 3500 }
  },
  "extras": {
    "folha_pagamento": { "per_employee": 35 },
    "nota_fiscal": { "included": 50, "per_extra": 2 },
    "certidoes": { "mensal": 50 }
  },
  "discounts": {
    "primeiro_mes_gratis": { "active": true },
    "pagamento_anual": { "percent": 10 }
  }
}
```

### ODONTOLÓGICO
```json
{
  "pricing": {
    "consultorio_pequeno": { "mensal": 299, "setup": 500 },
    "consultorio_medio": { "mensal": 599, "setup": 1000 },
    "clinica_multipla": { "mensal": 1299, "setup": 2500 }
  },
  "extras": {
    "marketing_digital": { "mensal": 500 },
    "gestao_estoque": { "mensal": 200 }
  },
  "discounts": {
    "indicacao": { "percent": 15 },
    "combo_marketing": { "percent": 10 }
  }
}
```

### JURÍDICO
```json
{
  "pricing": {
    "advogado_solo": { "mensal": 399, "setup": 800 },
    "escritorio_pequeno": { "mensal": 799, "setup": 1500 },
    "escritorio_medio": { "mensal": 1599, "setup": 3000 }
  },
  "extras": {
    "pesquisa_jurisprudencia": { "per_query": 25 },
    "peticionamento": { "per_piece": 100 }
  },
  "discounts": {
    "anuidade_oab": { "percent": 5 }
  }
}
```

---

## 💬 Exemplos Reais

### Exemplo 1: Contábil — Simples Nacional

```
LEAD DATA:
- Nome: João Silva
- Tipo: Simples Nacional
- Faturamento: R$ 120k/mês
- Urgência: migrar de contador
- Score: 85 (HOT)

PROPOSTA GERADA:
"Opa João! Com base no que você me disse, montei algo pra você:

📋 Proposta — Contabilidade Simples Nacional

Valor: R$ 550/mês
Setup (migração): R$ 1.200 (parcelamos em 3x)

O que inclui:
• Escrituração fiscal completa
• DAS, DEFIS, E-Social
• Folha até 5 funcionários
• Suporte por WhatsApp ilimitado
• Prazos nunca atrasam (garantia)

Bônus: primeiro mês GRÁTIS pra você ver a diferença.

Começo em até 5 dias úteis após aceitar.

Quer seguir? Responde SIM ou me pergunta qualquer coisa! 😊"
```

### Exemplo 2: Odonto — Clínica Média

```
LEAD DATA:
- Nome: Dra. Maria
- Tipo: Clínica com 3 dentistas
- Pacientes: 200/mês
- Score: 65 (MORNO)

PROPOSTA GERADA:
"Oi Dra. Maria! Vi que sua clínica tem um volume legal de pacientes.

📋 Proposta — Gestão de Clínica Odontológica

Valor: R$ 599/mês
Setup: R$ 1.000 (inclui configuração completa)

O que inclui:
• Agendamento inteligente (reduz no-show em 40%)
• Follow-up automático de pacientes
• Controle financeiro simplificado
• Relatórios semanais de performance
• Suporte WhatsApp 24h

Prazo: ativo em 3 dias úteis.

Faz sentido pra vocês? Qualquer dúvida, responde aqui! 🦷"
```

### Exemplo 3: Follow-up (3 dias)

```
"Oi João! Tudo bem?

Passei aqui pra saber se viu a proposta que mandei.
Alguma dúvida? Posso ajustar algo?

Se quiser, marco uma call rápida de 10 min pra gente conversar. 
Que dia fica bom pra você?"
```

### Exemplo 4: Follow-up (7 dias — último)

```
"Oi João, beleza?

Sei que tá corrido aí. Só queria dizer que a proposta continua de pé.
Se não fizer sentido agora, sem problema nenhum.

Se mudar de ideia no futuro, é só chamar aqui. 👋"
```

---

## 📊 Métricas

1. **Propostas geradas/semana**
   - Meta: 10-20 propostas
   
2. **Taxa de aceitação**
   - Target: 25-40%
   - Alertar se: <15%
   
3. **Tempo entre lead qualificado → proposta**
   - Target: <30 minutos (automático)
   
4. **Valor médio por proposta**
   - Meta: R$ 500-800/mês (depende do nicho)

5. **Follow-up conversion rate**
   - Dia 3: 15-20% converte
   - Dia 7: 5-10% converte
   - Após dia 14: <3%

---

## 🐛 Troubleshooting

| Problema | Causa | Solução |
|----------|-------|--------|
| Proposta com preço errado | Tabela de preços desatualizada | Atualize pricing_tables |
| Follow-up mandando no dia errado | Timer configurado errado | Verifique scheduler |
| Proposta genérica demais | Dados do lead incompletos | Agente 1 deve coletar mais |
| Cliente aceita mas não recebe próximo passo | Falta roteamento pós-aceite | Conecte com onboarding |

---

## ✅ Checklist de Implementação

- [ ] Tabelas: `proposals`, `pricing_tables`, `proposal_templates`
- [ ] Templates de proposta por nicho (texto + PDF)
- [ ] Cálculo dinâmico de preço
- [ ] Integração com Opus 4.7 (gera mensagem)
- [ ] Scheduler para follow-ups (3, 7, 14 dias)
- [ ] Detecção de "aceite" (cliente responde sim/aceito/vamos)
- [ ] Marcação de status: enviada, lida, aceita, rejeitada, lost
- [ ] Testes com 5 propostas reais
- [ ] Deploy em Coolify

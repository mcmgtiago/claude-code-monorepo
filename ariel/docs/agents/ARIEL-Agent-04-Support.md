# 🧜‍♀️ ARIEL — Agent 4: Customer Support

**Status:** MVP Priority — Semana 3-4  
**Complexidade:** ⭐⭐⭐ (Alta)  
**Impacto:** 🔴 Alto (retenção de cliente)

---

## 📋 O Que Faz

Responde dúvidas de clientes existentes de forma automática. Consulta base de conhecimento aprovada, executa ações seguras (consultar saldo, gerar guia, status de pedido), e escala para humano quando necessário — com resumo completo.

---

## 🔔 Quando Ativa

**Triggers:**
1. Cliente existente manda mensagem (já está no CRM)
2. Mensagem NÃO é novo lead (já qualificado)
3. Mensagem NÃO é resposta a proposta (Agente 2 cuida)

---

## 🔄 Fluxo Detalhado

```
1. IDENTIFICAÇÃO
   ├─ Consulta DB: é cliente ativo?
   ├─ Puxa contexto: histórico, serviços contratados, pendências
   └─ Carrega KB (base de conhecimento) do nicho

2. CLASSIFICAÇÃO DE INTENÇÃO
   ├─ Pergunta simples (FAQ) → responde automático
   ├─ Consulta de dados (saldo, prazo) → executa query + responde
   ├─ Ação segura (gerar guia, 2a via) → executa + confirma
   ├─ Ação arriscada (cancelar, alterar contrato) → escala humano
   ├─ Reclamação → escala humano com prioridade
   └─ Não entendeu → pede esclarecimento (max 1x)

3. RESPOSTA
   ├─ Se FAQ: responde direto (fonte citada)
   ├─ Se query: executa, formata resultado, envia
   ├─ Se ação: executa, confirma, registra
   └─ Se escala: notifica humano + envia resumo da conversa

4. ESCALAÇÃO (quando necessário)
   ├─ Monta resumo: quem é, o que quer, contexto
   ├─ Notifica responsável (push + WhatsApp)
   ├─ Avisa cliente: "Vou chamar o especialista, 1 minuto"
   └─ Humano recebe conversa completa (não começa do zero)

5. REGISTRO
   ├─ Log: ticket criado, resposta dada, tempo
   ├─ Satisfação: "Ajudou? 👍 ou 👎"
   └─ Feedback loop: melhora KB se muita gente pergunta o mesmo
```

---

## 📊 Contexto Necessário

**Consultas ao Supabase:**

1. **clientes** — dados do cliente, serviços ativos
2. **knowledge_base** — FAQs, artigos, respostas aprovadas
3. **conversations** — histórico recente (últimas 10 msgs)
4. **services** — o que o cliente contratou
5. **pending_tasks** — tarefas pendentes do cliente

---

## 💬 Sistema de Prompts

### **Prompt Principal**

```markdown
Você é ARIEL, assistente de suporte inteligente.

**Cliente:** {{ client_name }}
**Serviços ativos:** {{ active_services }}
**Histórico recente:** {{ last_5_messages }}
**Mensagem atual:** "{{ current_message }}"

**Base de Conhecimento disponível:**
{{ relevant_kb_articles }}

**Regras:**
1. Responda APENAS com informação da base de conhecimento ou dados do sistema
2. NUNCA invente informação. Se não sabe → escala
3. Seja breve (max 5 linhas por resposta)
4. Cite a fonte quando relevante
5. Se o cliente parece irritado → escala para humano imediatamente
6. Se a pergunta envolve dinheiro/contrato → escala

**Ações que você PODE executar:**
- Consultar prazo de entrega
- Informar status de serviço
- Gerar 2a via de boleto/guia
- Enviar documento já pronto
- Agendar reunião com especialista

**Ações que você NÃO PODE executar (escala):**
- Cancelar serviço
- Alterar valor/contrato
- Reembolsar
- Acessar dados financeiros sensíveis
- Qualquer coisa que pareça reclamação formal

**Retorne JSON:**
{
  "intent": "faq|query|action|escalate|unclear",
  "confidence": 0.0-1.0,
  "response": "mensagem para o cliente",
  "action_taken": "nenhuma|consulta_prazo|gerar_guia|...",
  "should_escalate": false,
  "escalation_reason": "",
  "escalation_summary": ""
}
```

### **Prompt de Escalação**

```markdown
**Contexto de escalação:**
- Cliente: {{ client_name }}
- Serviço: {{ service }}
- Última pergunta: "{{ message }}"
- Conversa completa: {{ conversation_history }}
- Motivo da escalação: {{ reason }}

**Gere resumo para o humano (max 4 linhas):**
- Quem é o cliente
- O que ele quer
- O que já foi tentado
- Próximo passo sugerido
```

---

## ⚙️ Base de Conhecimento por Nicho

### CONTÁBIL — KB

```json
{
  "intents": [
    {
      "intent": "prazo_entrega",
      "keywords": ["prazo", "quando fica pronto", "demora"],
      "response": "O prazo padrão de entrega é de {{ service_deadline }} dias úteis após receber todos os documentos.",
      "source": "Política Interna"
    },
    {
      "intent": "guia_das",
      "keywords": ["guia", "DAS", "imposto", "pagar"],
      "response": "Sua guia DAS de {{ current_month }} vence dia {{ das_due_date }}. Valor: R$ {{ das_value }}.",
      "action": "fetch_das_info",
      "source": "Sistema Fiscal"
    },
    {
      "intent": "nota_fiscal",
      "keywords": ["nota", "NF", "emitir"],
      "response": "Para emitir nota fiscal, preciso de: nome do tomador, CNPJ, valor e descrição do serviço. Me manda esses dados?",
      "source": "Procedimento Operacional"
    },
    {
      "intent": "declaracao_ir",
      "keywords": ["imposto de renda", "IRPF", "declaração"],
      "response": "O prazo da declaração IRPF {{ current_year }} vai até {{ irpf_deadline }}. Você já enviou seus documentos?",
      "source": "Receita Federal"
    }
  ]
}
```

### ODONTOLÓGICO — KB

```json
{
  "intents": [
    {
      "intent": "agendamento",
      "keywords": ["marcar", "agendar", "consulta", "horário"],
      "response": "Vou verificar a agenda! Qual dia e turno prefere? (manhã/tarde)",
      "action": "check_calendar"
    },
    {
      "intent": "preco_procedimento",
      "keywords": ["quanto custa", "valor", "preço"],
      "response": "O {{ procedure_name }} custa a partir de R$ {{ base_price }}. Quer agendar uma avaliação?",
      "source": "Tabela de Preços"
    },
    {
      "intent": "pos_procedimento",
      "keywords": ["dor", "inchaço", "sangramento", "pós"],
      "response": "É normal ter {{ symptom }} nos primeiros {{ days }} dias. Se persistir, vou encaminhar para o Dr(a). {{ dentist_name }}.",
      "action": "escalate_if_severe"
    }
  ]
}
```

### JURÍDICO — KB

```json
{
  "intents": [
    {
      "intent": "andamento_processo",
      "keywords": ["como está", "andamento", "processo", "novidade"],
      "response": "Deixa eu consultar... Seu processo {{ process_number }} está em fase de {{ current_phase }}. Última movimentação: {{ last_update }}.",
      "action": "fetch_process_status"
    },
    {
      "intent": "documento_necessario",
      "keywords": ["documento", "preciso levar", "o que falta"],
      "response": "Para o seu caso, preciso de: {{ required_documents }}. Pode mandar foto por aqui mesmo!",
      "source": "Checklist Processual"
    },
    {
      "intent": "prazo_recurso",
      "keywords": ["prazo", "recurso", "vence quando"],
      "response": "O prazo para recurso no seu processo vence em {{ deadline }}. {{ days_remaining }} dias restantes.",
      "action": "fetch_deadline"
    }
  ]
}
```

---

## 💬 Exemplos Reais

### Exemplo 1: FAQ Simples (Contábil)

```
Cliente: "Quando vence meu DAS?"

Agente:
Intent: "guia_das"
Confidence: 0.95
Action: fetch_das_info

Resposta:
"Sua guia DAS de agosto vence dia 20/09.
Valor: R$ 1.250,00.

Quer que eu envie o código de barras? 📊"
```

### Exemplo 2: Ação Segura (Odonto)

```
Cliente: "Quero marcar uma limpeza"

Agente:
Intent: "agendamento"
Confidence: 0.98
Action: check_calendar

Resposta:
"Ótimo! Pra limpeza dental tenho esses horários disponíveis:

📅 Terça 27/08 — 9h ou 14h
📅 Quarta 28/08 — 10h ou 16h
📅 Sexta 30/08 — 9h

Qual prefere?"
```

### Exemplo 3: Escalação (Jurídico)

```
Cliente: "Não estou satisfeito, quero trocar de advogado no meu caso"

Agente:
Intent: "escalate"
Confidence: 0.99
Should_escalate: true
Reason: "reclamação + alteração de contrato"

Resposta ao cliente:
"Entendo sua preocupação. Vou chamar o Dr. Marcos que é responsável 
pelo seu caso. Ele vai te retornar em até 30 minutos, ok?"

Resumo para humano:
"🚨 ESCALAÇÃO — João Silva (Processo 123/2024)
• Quer trocar de advogado no caso
• Possível insatisfação com andamento
• Não deu detalhes do motivo
• Sugestão: ligar em 30min, ouvir antes de oferecer solução"
```

### Exemplo 4: Incerteza (pede esclarecimento)

```
Cliente: "aquilo lá"

Agente:
Intent: "unclear"
Confidence: 0.15

Resposta:
"Hmm, não consegui entender. 😅
Você quer saber sobre:
1️⃣ Sua guia de imposto
2️⃣ Prazo de entrega
3️⃣ Agendar reunião
4️⃣ Outra coisa

Qual?"
```

---

## 📊 Métricas

| Métrica | Target | Alerta |
|---------|--------|--------|
| Resolução automática | 60-80% | <50% = KB fraco |
| Tempo médio resposta | <15 segundos | >60s = problema |
| CSAT (satisfação) | 4.0+/5.0 | <3.5 = revisar |
| Reopen rate | <10% | >20% = respostas erradas |
| Escalações/dia | <20% do total | >40% = KB incompleto |

---

## 🐛 Troubleshooting

| Problema | Causa | Solução |
|----------|-------|--------|
| Responde errado | KB desatualizado ou intent errado | Revise KB + adicione exemplos |
| Escala demais | Confidence threshold muito alto | Baixe de 0.8 para 0.7 |
| Não escala quando deveria | Não detectou irritação | Adicione keywords de reclamação |
| Resposta genérica | Faltou contexto do cliente | Verifique query ao DB |
| Loop de "não entendi" | Cliente manda áudio/emoji | Adicione handler de mídia |

---

## ✅ Checklist

- [ ] Tabela `knowledge_base` (FAQs por nicho)
- [ ] Classificador de intenção (com fallback)
- [ ] Executor de ações seguras (consulta, gera guia)
- [ ] Sistema de escalação (notifica humano + resumo)
- [ ] Feedback loop (👍/👎 após resposta)
- [ ] Rate limiting (max 50 msgs/min por tenant)
- [ ] Analytics: resolução, CSAT, reopen
- [ ] Testes: 20 cenários por nicho

# 🧜‍♀️ ARIEL — Agent 5: Resumidor de Reuniões

**Status:** Fase 2 — Semana 5-6  
**Complexidade:** ⭐⭐☆ (Média)  
**Impacto:** 🟡 Médio (organização interna)

---

## 📋 O Que Faz

Após conversas longas ou reuniões, extrai automaticamente: decisões tomadas, ações pendentes, prazos, e cria tarefas no sistema. Zero informação se perde.

---

## 🔔 Quando Ativa

**Triggers:**
1. Conversa no WhatsApp passou de 8+ mensagens trocadas
2. Usuário manda comando: "resumo" ou "resume isso"
3. Após reunião (áudio transcrito ou anotações coladas)
4. Timer: se conversa parou há 30min após trocar muitas msgs

---

## 🔄 Fluxo Detalhado

```
1. COLETA
   ├─ Puxa últimas N mensagens da conversa
   ├─ Ou recebe áudio transcrito de reunião
   └─ Ou recebe texto colado pelo usuário

2. ANÁLISE
   ├─ Identifica DECISÕES (o que foi definido)
   ├─ Identifica AÇÕES (quem vai fazer o quê)
   ├─ Identifica PRAZOS (quando deve ser feito)
   ├─ Identifica PENDÊNCIAS (o que ficou sem resolver)
   └─ Identifica SENTIMENTO (cliente satisfeito? irritado?)

3. ESTRUTURAÇÃO
   ├─ Monta resumo em formato padrão
   ├─ Separa por categorias
   └─ Marca responsáveis

4. AÇÕES AUTOMÁTICAS
   ├─ Cria tarefas no Task Manager (Agente 6)
   ├─ Agenda follow-ups se necessário
   ├─ Atualiza status do cliente no CRM
   └─ Notifica responsáveis de ações pendentes

5. ENVIO
   ├─ Manda resumo para quem pediu (WhatsApp)
   ├─ Opcionalmente: manda recap para o cliente
   └─ Salva no histórico do contato
```

---

## 💬 Sistema de Prompts

### **Prompt Principal**

```markdown
Você é ARIEL, agente especializado em resumir interações.

**Conversa a resumir:**
{{ conversation_messages }}

**Contexto:**
- Cliente: {{ client_name }}
- Serviço contratado: {{ service }}
- Histórico relevante: {{ context }}

**Regras:**
1. Extraia APENAS o que realmente foi decidido/combinado
2. Não invente informação que não está na conversa
3. Se algo ficou ambíguo, marque como "PENDÊNCIA"
4. Identifique claramente quem é responsável por cada ação
5. Use datas absolutas (não "amanhã", "semana que vem")
6. Tom: objetivo e conciso

**Retorne JSON:**
{
  "resumo_curto": "1 linha descrevendo o assunto principal",
  "decisoes": [
    {"decisao": "Migrar para Simples Nacional", "responsavel": "escritório"}
  ],
  "acoes": [
    {
      "acao": "Enviar documentação para migração",
      "responsavel": "escritório",
      "prazo": "2024-08-25",
      "prioridade": "alta"
    },
    {
      "acao": "Mandar extrato bancário",
      "responsavel": "cliente",
      "prazo": "2024-08-24",
      "prioridade": "media"
    }
  ],
  "pendencias": [
    "Cliente não decidiu sobre pró-labore"
  ],
  "sentimento_cliente": "satisfeito|neutro|insatisfeito",
  "proximo_contato": "2024-08-28",
  "mensagem_resumo": "texto formatado para WhatsApp"
}
```

---

## 💬 Exemplos Reais

### Exemplo 1: Conversa de Contabilidade

**Conversa (15 mensagens):**
```
Cliente: Oi, preciso migrar de MEI pra Simples
Agente: Claro! Qual seu faturamento?
Cliente: 95k por mês
Agente: Perfeito. Vamos precisar de CNPJ, contrato social...
Cliente: Mando amanhã
Agente: E sobre o pró-labore, já pensou?
Cliente: Ainda não sei
Agente: Sem problema, depois decidimos
Cliente: Quero que fique pronto até fim do mês
...
```

**Resumo gerado:**
```
📋 RESUMO — Conversa com João Silva
Data: 22/08/2024 | 15 mensagens

✅ DECISÕES:
• Migrar de MEI para Simples Nacional
• Prazo desejado: até fim de agosto

→ PRÓXIMOS PASSOS:
[Escritório] Enviar lista de docs necessários — até 23/08
[Cliente] Mandar CNPJ + contrato social — até 24/08
[Escritório] Processar migração — até 30/08

⚠️ PENDÊNCIAS:
• Decisão sobre pró-labore (aguardando cliente)

😊 Sentimento: satisfeito (urgente mas cooperativo)

📅 Próximo contato: 28/08 (verificar se mandou docs)
```

### Exemplo 2: Pós-reunião Jurídico

**Áudio transcrito (reunião 30min):**
```
Advogado: Olhando o caso, vamos entrar com recurso no TRT
Cliente: E as chances?
Advogado: Boas, 70%. Mas preciso dos últimos 3 contracheques
Cliente: Tá, mando essa semana. E o honorário?
Advogado: 20% sobre o que ganhar, sem pagamento antecipado
Cliente: Fechado
...
```

**Resumo gerado:**
```
📋 RESUMO — Reunião com Maria (Trabalhista)
Data: 22/08/2024 | 30 minutos

✅ DECISÕES:
• Entrar com recurso no TRT
• Honorários: 20% êxito (sem antecipado)

→ PRÓXIMOS PASSOS:
[Cliente] Enviar últimos 3 contracheques — até 29/08
[Escritório] Redigir petição de recurso — até 02/09
[Escritório] Protocolar recurso — até 05/09

📊 PROBABILIDADE DE ÊXITO: 70% (estimativa do advogado)

😊 Sentimento: confiante
```

---

## 📊 Métricas

| Métrica | Target |
|---------|--------|
| Resumos gerados/semana | 10-30 |
| Tarefas criadas automaticamente | 80%+ dos resumos geram tasks |
| Precisão (revisão humana) | 90%+ correto |
| Tempo de geração | <10 segundos |

---

## ✅ Checklist

- [ ] Trigger por volume de mensagens (8+)
- [ ] Trigger por comando manual ("resumo")
- [ ] Integração com Opus 4.7 (prompt de resumo)
- [ ] Parser de JSON → cria tasks (Agente 6)
- [ ] Formatação para WhatsApp (emojis, bullet points)
- [ ] Salvar resumo no histórico do contato
- [ ] Opção de mandar recap para cliente
- [ ] Analytics: resumos/semana, tasks criadas

# 🧜‍♀️ ARIEL — Agent 6: Task Manager IA

**Status:** Fase 2 — Semana 5-6  
**Complexidade:** ⭐⭐⭐ (Alta)  
**Impacto:** 🔴 Alto (nada cai no esquecimento)

---

## 📋 O Que Faz

Cria tarefas automaticamente a partir de conversas. Prioriza inteligentemente. Manda lembretes contextualizados (não genéricos). Escala se algo está atrasado. Gera relatório semanal de pendências.

---

## 🔔 Quando Ativa

**Triggers:**
1. Agente 5 criou tarefas (do resumo)
2. Cliente menciona "preciso fazer" / "falta"
3. Agente 2 (propostas) criou ação pós-aceite
4. Timer: diariamente (revisar tarefas do dia)

---

## 🔄 Fluxo Detalhado

```
1. CRIAÇÃO
   ├─ Extrai ação de texto/resumo
   ├─ Define: responsável, prazo, prioridade
   ├─ Vincula ao contato/projeto
   └─ Calcula data de reminder (1 dia antes)

2. PRIORIZAÇÃO
   ├─ Deadline próximo → URGENTE
   ├─ Impacto alto (cliente pode sair) → ALTA
   ├─ Bloqueador de outras tarefas → ALTA
   ├─ Rotina normal → MÉDIA
   └─ Bônus/nice-to-have → BAIXA

3. LEMBRETES INTELIGENTES
   ├─ 1 dia antes: "lembrete soft" (informativo)
   ├─ No dia: "lembrete hard" (chamada à ação)
   ├─ +1 dia: "escalação" (avisa gestor)
   ├─ Tom contextualizado (não genérico)
   └─ Inclui histórico + próximo passo sugerido

4. ACOMPANHAMENTO
   ├─ Se marcou como feito: ✅ registra
   ├─ Se venceu sem fazer: 🚨 escala
   ├─ Se foi reagendada: atualiza prazo
   └─ Notifica interessados

5. RELATÓRIO SEMANAL
   ├─ Tarefas em dia: ✅
   ├─ Tarefas atrasadas: 🚨
   ├─ Tarefas próximas: ⏰
   └─ Sugestão: qual priorizar hoje
```

---

## 💬 Sistema de Prompts

### **Prompt de Criação**

```markdown
**Você é ARIEL, agente de gestão de tarefas.**

**Ação a transformar em tarefa:**
"{{ raw_action }}"

**Contexto:**
- Cliente: {{ client_name }}
- Serviço: {{ service }}
- Histórico recente: {{ context }}

**Transforme em tarefa estruturada:**
{
  "titulo": "descrição breve e acionável",
  "descricao": "detalhes se necessário",
  "responsavel": "quem faz",
  "prazo": "YYYY-MM-DD",
  "prioridade": "URGENTE|ALTA|MEDIA|BAIXA",
  "dependencias": ["outra tarefa se houver"],
  "checklista": ["subtarefa 1", "subtarefa 2"]
}
```

### **Prompt de Lembrete (1 dia antes)**

```markdown
**Lembretes inteligentes (não genéricos):**

Cliente: {{ client_name }}
Tarefa: {{ task }}
Prazo: {{ deadline }}
Responsável: {{ responsible }}

**Tom:** Informativo, não pressionante
**Inclua:** 
- Por que essa tarefa importa
- Que informação ele precisa ter/fazer
- Próximo passo sugerido

**Exemplo bom:**
"João, amanhã vence o prazo de você enviar os docs pra gente começar a migração. 
Precisa de: CPF, CNPJ, último contrato social.
Já tá tudo pronto aí? Se quiser, posso te mandar um drive link pra você enviar por lá."

**Exemplo ruim:**
"Você tem uma tarefa vencendo amanhã"
```

### **Prompt de Escalação (vencida)**

```markdown
**Escalação: Tarefa atrasada**

Tarefa: {{ task }}
Prazo original: {{ original_deadline }}
Dias em atraso: {{ days_late }}
Responsável: {{ responsible }}
Impacto: {{ impact }}

**Gere mensagem de escalação:**
- Pra quem: gerente ou responsável
- Tom: profissional, sem agressividade
- Inclua: contexto, impacto, ação sugerida
```

---

## 💬 Exemplos Reais

### Exemplo 1: Criação de Tarefa

```
Conversa:
Cliente: "Vou enviar o extrato bancário até sexta"

Tarefa criada:
✓ Título: Receber extrato bancário de João
✓ Descrição: Extrato de conta corrente (últimos 3 meses)
✓ Responsável: Cliente (João Silva)
✓ Prazo: 2024-08-23
✓ Prioridade: ALTA (bloqueador da próxima etapa)
✓ Lembrete: 2024-08-22 às 10h
```

### Exemplo 2: Lembrete Contextualizado (1 dia antes)

```
"Oi João! 👋

Só um lembrete: amanhã vence o prazo que você prometeu 
de enviar o extrato bancário. Precisa ser dos últimos 3 meses.

Tá tudo ok? Se quiser, manda por aqui mesmo via WhatsApp 
(faz foto) ou a gente combina um drive.

Valeu! 🙌"
```

### Exemplo 3: Follow-up (no dia do vencimento)

```
"João, bora? 😊

Hoje é o dia! Extrato bancário já foi? 
Se tiver dúvida qual período mandar, é agosto, julho, junho.

Manda logo, que com isso a gente consegue dar sequência!"
```

### Exemplo 4: Escalação (1 dia atrasada)

```
Para gerente:
"🚨 ATENÇÃO — Tarefa atrasada

Tarefa: Receber extrato de João Silva
Prazo: 23/08 (1 dia atrasado)
Impacto: ALTO (bloqueia migração fiscal)

Ação sugerida: Ligar pra João ou mandar mensagem mais direta"
```

### Exemplo 5: Relatório Semanal

```
📊 RELATÓRIO SEMANAL — Sua Agenda
Semana: 19-25 de agosto

✅ CONCLUÍDAS ESTA SEMANA (12):
• Proposta enviada para Maria Clínica
• Documentação processada (4 clientes)
• Guia fiscal gerada (FGTS + DAS)

⏰ VENCENDO HOJE (3):
• [URGENTE] Extrato bancário — João Silva
• [ALTA] Assinatura contrato — Dra. Ana
• [MÉDIA] Feedback de satisfação — Pedro

🚨 ATRASADAS (2):
• [1 dia] Documentação — Empresa XYZ
• [4 dias] Aprovação de proposta — Carlos

💡 SUGESTÃO: Priorize as 3 urgentes até meio-dia.
Depois, ligue pra Empresa XYZ (4 dias é muito!).

[📅 Ver todas]  [✏️ Atualizar status]
```

---

## 📊 Métricas

| Métrica | Target |
|---------|--------|
| Taxa de conclusão on-time | 85%+ |
| Tarefas atrasadas | <5% |
| Lembretes abertos (CTR) | 70%+ |
| Tempo para escalar | <1h após vencimento |
| Tarefas/semana | 20-50 (varia por cliente) |

---

## 🐛 Troubleshooting

| Problema | Causa | Solução |
|----------|-------|--------|
| Cria tarefas demais | Interpretação muito liberal | Aumente threshold de "ação" |
| Lembrete genérico | Falta contexto | Carregue melhor histórico |
| Não notifica vencimento | Scheduler fora | Verifique cron job |
| Cliente não vê taskboard | UI não é clara | Redesenhe dashboard mobile |

---

## ✅ Checklist

- [ ] Tabela `tasks` (com status, prazo, responsável)
- [ ] Tabela `task_reminders` (histórico de lembretes enviados)
- [ ] Scheduler de lembretes (cron: diariamente)
- [ ] Integração com Opus 4.7 (gera lembretes contextualizados)
- [ ] Notificação push (app mobile) + WhatsApp
- [ ] Dashboard de tarefas (web + mobile PWA)
- [ ] Integração com Agente 5 (Resumidor cria tasks)
- [ ] Relatório semanal automático
- [ ] Testes: 30 tarefas com diferentes prazos

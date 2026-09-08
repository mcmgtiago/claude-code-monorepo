# 🧜‍♀️ ARIEL — Agentes de IA para Operações Empresariais

**A salvadora das finanças & operações**

---

## 📍 Visão Geral

ARIEL é uma **plataforma de agentes inteligentes** que roda via WhatsApp. Cada agente é especializado em uma tarefa operacional específica.

**Stack:**
- **LLM:** Claude Opus 4.7 (via API Anthropic)
- **Infra:** VPS + Coolify
- **Banco:** Supabase (PostgreSQL)
- **WhatsApp:** WAHA (por enquanto) → API oficial depois
- **Linguagem:** Node.js + TypeScript
- **Frontend:** Next.js (web) + PWA (mobile)

---

## 🎯 Os 13 Agentes

### **AGENTES DE AQUISIÇÃO** (Trazem negócio novo)
1. [**Lead Qualification**](./ARIEL-Agent-01-LeadQualification.md) — Qualifica novo contato, calcula score, roteia
2. [**Gerador de Propostas**](./ARIEL-Agent-02-Propostas.md) — Monta orçamento automático em PDF
3. [**Site Inteligente**](./ARIEL-Agent-03-SiteInteligente.md) — Webchat + agendamento no site

### **AGENTES DE SUPORTE** (Suportam cliente existente)
4. [**Customer Support**](./ARIEL-Agent-04-Support.md) — Responde dúvida comum automático
5. [**Resumidor de Reuniões**](./ARIEL-Agent-05-Resumidor.md) — Extrai decisões, cria tarefas
6. [**Task Manager IA**](./ARIEL-Agent-06-TaskManager.md) — Cria + lembra tarefas inteligentemente

### **AGENTES DE OPERAÇÃO** (Back office)
7. [**Processador de Documentos**](./ARIEL-Agent-07-Documentos.md) — Extrai NF-e, folha, contrato via IA
8. [**Relatórios e Insights**](./ARIEL-Agent-08-Relatorios.md) — Gera insights semanais automático
9. [**Compliance & Prazos**](./ARIEL-Agent-09-Compliance.md) — Alerta prazos fiscais, evita multa

### **AGENTES DE COMUNICAÇÃO E GESTÃO**
10. [**Newsletter & Comunicação**](./ARIEL-Agent-10-Newsletter.md) — Manda updates segmentados por perfil
11. [**Pesquisa Técnica**](./ARIEL-Agent-11-PesquisaTecnica.md) — Responde dúvida do time (legislação, normas)
12. [**Agendamento Inteligente**](./ARIEL-Agent-12-Agendamento.md) — Marca reuniões, calendário automático
13. [**Contratos & Renovações**](./ARIEL-Agent-13-Contratos.md) — Monitora vencimento, gera aditivos

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────┐
│  Cliente envia mensagem no WhatsApp             │
└─────────────────┬───────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│  WAHA Webhook recebe (por enquanto)             │
│  POST /webhook/whatsapp                         │
└─────────────────┬───────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│  Router inteligente detecta intenção            │
│  - É novo? → Agente 1 (Lead Qualification)     │
│  - Pede orçamento? → Agente 2 (Propostas)     │
│  - Dúvida comum? → Agente 4 (Support)         │
│  - Manda documento? → Agente 7 (Documentos)   │
└─────────────────┬───────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│  Agente específico roda (Opus 4.7)              │
│  - Consulta contexto no Supabase                │
│  - Processa com IA                              │
│  - Executa ação (cria tarefa, gera proposta)   │
│  - Salva resultado no banco                     │
└─────────────────┬───────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│  Resposta volta ao WhatsApp                     │
│  - Texto simples                                │
│  - PDF (proposta, relatório)                    │
│  - Link (agendamento, documento)                │
└─────────────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│  Log tudo (conversa, ação, resultado)           │
│  Atualiza CRM                                   │
└─────────────────────────────────────────────────┘
```

---

## 📊 Fluxo Típico de Um Dia

```
09:00 — NOVO LEAD
  Cliente: "Oi, sou dentista"
  → Agente 1 (Lead Qualification) ativa
  → Coleta: tipo negócio, faturamento, urgência
  → Calcula score
  → Cria registro no CRM

09:30 — CLIENTE PEDE PREÇO
  Cliente: "Quanto custa?"
  → Agente 2 (Propostas) ativa
  → Consulta tabela de preços
  → Monta proposta PDF
  → Envia link

10:00 — CLIENTE MANDA DOCUMENTO
  Cliente: *envia foto de NF-e*
  → Agente 7 (Documentos) ativa
  → Extrai: emitente, valor, impostos
  → Valida contra tabelas
  → Cria draft no sistema

14:00 — CONVERSA LONGA
  Cliente e agente trocaram 20 mensagens
  → Agente 5 (Resumidor) ativa automaticamente
  → Extrai decisões, ações, prazos
  → Monta resumo estruturado
  → Cria tarefas automáticas

17:00 — ROTINA INTERNA
  → Agente 9 (Compliance) checa prazos fiscais
  → Agente 8 (Relatórios) gera insights da semana
  → Agente 11 (Pesquisa) responde dúvidas do time

18:00 — FOLLOW-UP
  → Agente 10 (Newsletter) manda update relevante
  → Agente 6 (Tasks) lembra prazos vencendo
  → Agente 4 (Support) responde dúvidas recorrentes
```

---

## 🔧 Configuração por Nicho

Cada nicho tem um arquivo JSON que define:

**CONTÁBIL** (`config/niches/contabil.json`)
- Campos de qualificação: tipo empresa, faturamento, setor
- Scoring: o que torna um lead "quente"
- Documentos: NF-e, folha, RPA, contrato
- Prazos: DAS, DCTF, DEFIS, E-Social, FGTS
- Propostas: templates e preços

**ODONTOLÓGICO** (`config/niches/odonto.json`)
- Campos: tipo procedimento, pacientes/mês, faturamento
- Documentos: recibos, plano de tratamento
- Agendamento: buffer entre pacientes, horários específicos

**JURÍDICO** (`config/niches/juridico.json`)
- Campos: área do direito, tipo cliente (PF/PJ), prazo do processo
- Documentos: processo judicial, contrato, petição
- Prazos: prazos recursais, audiências

**CONSIGNADORA** (`config/niches/consignadora.json`)
- Campos: renda, tipo de crédito, já tem consignado
- Documentos: contracheque, RG, CPF
- Cálculos: capacidade de endividamento, parcelas

---

## 📚 Estrutura de Documentação

Cada agente tem seu próprio arquivo com seções:

1. **O que faz** — descrição clara
2. **Quando ativa** — trigger (tipo de mensagem, evento)
3. **Fluxo detalhado** — passo a passo
4. **Contexto necessário** — dados que precisa do banco
5. **Sistema de prompts** — como conversa com Opus 4.7
6. **Integrações** — com quais sistemas integra
7. **Configuração por nicho** — variações por setor
8. **Exemplos reais** — conversa completa (entrada → saída)
9. **Métricas** — o que medir
10. **Edge cases** — o que pode dar errado

---

## 🚀 Roadmap de Implementação

### **Semana 1-2: Foundation**
- [ ] Setup: Node.js + TypeScript + estructura de pastas
- [ ] PostgreSQL/Supabase: schema básico
- [ ] Webhook WAHA funcionando
- [ ] Router de intenções funcional
- [ ] Tests: um agente rodando (Lead Qualification)

### **Semana 3-4: MVP (Agentes Core)**
- [ ] Agente 1: Lead Qualification ✅
- [ ] Agente 2: Propostas ✅
- [ ] Agente 4: Support ✅
- [ ] Agente 7: Documentos ✅
- [ ] CRM básico (listar contatos, histórico)

### **Semana 5-6: Operação**
- [ ] Agente 5: Resumidor
- [ ] Agente 6: Task Manager
- [ ] Agente 8: Relatórios
- [ ] Agente 9: Compliance
- [ ] PWA mobile (instalação nativa)

### **Semana 7-8: Comunicação**
- [ ] Agente 10: Newsletter
- [ ] Agente 11: Pesquisa Técnica
- [ ] Agente 12: Agendamento
- [ ] Agente 13: Contratos
- [ ] Editor visual de fluxos

### **Semana 9-12: Escala**
- [ ] Agentes especializados por nicho
- [ ] Integrações externas (Google Calendar, Asaas, etc.)
- [ ] Dashboard avançado
- [ ] Analytics
- [ ] Migração WAHA → API oficial WhatsApp

---

## 📝 Como Ler Esta Documentação

1. **Comece aqui** (este arquivo) — entenda a visão geral
2. **Escolha 1 agente** — comece pelo mais simples (Lead Qualification)
3. **Leia o documento do agente** — fluxo, prompts, exemplos
4. **Implemente** — siga o passo a passo técnico
5. **Teste com dados reais** — ajuste conforme necessário
6. **Passe para o próximo** — repita

**Ordem sugerida:**
1. Agent 1 (Lead Qualification) — entrada de lead
2. Agent 7 (Documentos) — processamento
3. Agent 4 (Support) — atendimento
4. Agent 2 (Propostas) — monetização
5. Depois os outros

---

## 🔐 Segurança & Compliance

- ✅ LGPD: dados criptografados em repouso
- ✅ WhatsApp: compliance com termos de serviço
- ✅ Logs: auditoria de todas as ações
- ✅ Tokens: API keys em .env (nunca em código)
- ✅ Rate limiting: proteção contra abuse

---

## 📞 Suporte

Cada documento de agente tem uma seção **"Troubleshooting"** com:
- Erros comuns
- Como debugar
- Quando escalar para humano

---

## 🎯 Próximos Passos

1. Leia os 13 documentos de agentes (links acima)
2. Setup inicial (Node.js + Supabase)
3. Implemente agentes 1, 7, 4 (MVP)
4. Teste com 3-5 clientes reais
5. Iterate + escale

**Boa sorte, ARIEL está nascendo! 🚀**

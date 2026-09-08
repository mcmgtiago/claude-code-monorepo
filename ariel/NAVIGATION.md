# 🧜‍♀️ ARIEL — Navegação Rápida

## 🗂️ Estrutura do Projeto em `D:/Claude Code/ariel`

```
ariel/
│
├── README.md ⭐ COMECE AQUI
│   └─ Visão geral completa do projeto, como começar, stack
│
├── ROADMAP.md 📅
│   └─ Fases 1-4, timeline, prioridades
│
├── docs/
│   │
│   ├── ARIEL-MASTER.md 📖
│   │   └─ Visão geral técnica, arquitetura, 13 agentes em 1 documento
│   │
│   ├── ARIEL-INDEX.md 📋
│   │   └─ Índice visual dos 13 agentes com quick links
│   │
│   ├── agents/ 🤖
│   │   ├── README.md
│   │   ├── ARIEL-Agent-01-LeadQualification.md ⭐ MVP
│   │   ├── ARIEL-Agent-02-Propostas.md ⭐ MVP
│   │   ├── ARIEL-Agent-03-SiteInteligente.md
│   │   ├── ARIEL-Agent-04-Support.md ⭐ MVP
│   │   ├── ARIEL-Agent-05-Resumidor.md
│   │   ├── ARIEL-Agent-06-TaskManager.md
│   │   ├── ARIEL-Agent-07-Documentos.md ⭐ MVP
│   │   ├── ARIEL-Agent-08-Relatorios.md
│   │   ├── ARIEL-Agent-09-Compliance.md
│   │   ├── ARIEL-Agent-10-Newsletter.md
│   │   ├── ARIEL-Agent-11-PesquisaTecnica.md
│   │   ├── ARIEL-Agent-12-Agendamento.md
│   │   └── ARIEL-Agent-13-Contratos.md
│   │
│   ├── architecture/ (a criar)
│   │   ├── DATABASE-SCHEMA.md
│   │   ├── API-DESIGN.md
│   │   ├── WEBHOOK-FLOW.md
│   │   └── DEPLOYMENT.md
│   │
│   └── nichos/ (a criar)
│       ├── CONTABIL.md
│       ├── ODONTO.md
│       ├── JURIDICO.md
│       └── CONSIGNADORA.md
│
├── config/ (a criar)
│   ├── config.example.json
│   ├── nichos/
│   │   ├── contabil.json
│   │   ├── odonto.json
│   │   ├── juridico.json
│   │   └── consignadora.json
│   └── prompts/
│       ├── agent-01.txt
│       ├── agent-02.txt
│       └── ...
│
└── src/ (a criar)
    ├── index.ts
    ├── services/
    ├── agents/
    ├── models/
    └── utils/
```

---

## 📚 Caminho de Leitura Recomendado

### 🚀 Para Começar HOJE (30 min)
1. `README.md` ← Você está aqui
2. `ARIEL-MASTER.md` (docs/)
3. `ARIEL-INDEX.md` (docs/) ← Índice visual

### 💻 Para Implementar (depois)
1. `ARIEL-Agent-01-LeadQualification.md` ← Padrão base
2. `ARIEL-Agent-02-Propostas.md`
3. `ARIEL-Agent-04-Support.md`
4. `ARIEL-Agent-07-Documentos.md`
5. `ROADMAP.md` ← Quando começa semana 5

### 🏗️ Para Arquitetura (na Semana 1)
1. `docs/architecture/DATABASE-SCHEMA.md` (a criar)
2. `docs/architecture/API-DESIGN.md` (a criar)
3. `docs/architecture/WEBHOOK-FLOW.md` (a criar)

### ⚙️ Para Configurar Nicho
1. `docs/nichos/CONTABIL.md` (a criar) ← Começa por aqui
2. `docs/nichos/ODONTO.md` (a criar)
3. `config/nichos/contabil.json` (a criar)

---

## 🎯 Quick Access

### Agentes por Prioridade

**MVP (Sem isso nada funciona):**
- [Agent 01 — Lead Qualification](./docs/agents/ARIEL-Agent-01-LeadQualification.md)
- [Agent 02 — Propostas](./docs/agents/ARIEL-Agent-02-Propostas.md)
- [Agent 04 — Support](./docs/agents/ARIEL-Agent-04-Support.md)
- [Agent 07 — Documentos](./docs/agents/ARIEL-Agent-07-Documentos.md)

**Fase 2 (Com isso cresce):**
- [Agent 09 — Compliance](./docs/agents/ARIEL-Agent-09-Compliance.md)
- [Agent 12 — Agendamento](./docs/agents/ARIEL-Agent-12-Agendamento.md)

**Resto:**
- [Ver todos em ARIEL-INDEX.md](./docs/ARIEL-INDEX.md)

---

## 📊 O que tem em cada arquivo de agente

```
✅ O Que Faz — descrição simples
✅ Quando Ativa — triggers
✅ Fluxo Detalhado — passo a passo
✅ Contexto Necessário — dados do DB
✅ Sistema de Prompts — Opus 4.7/4.8
✅ Integrações — com outros agentes
✅ Configuração por Nicho — JSON
✅ Exemplos Reais — conversa completa
✅ Métricas — o que medir
✅ Troubleshooting — erros comuns
✅ Checklist — implementação
```

---

## 🚀 Próxima Etapa

```
1. Leia README.md (este arquivo)
   ↓
2. Leia ROADMAP.md
   ↓
3. Leia docs/ARIEL-MASTER.md
   ↓
4. Leia docs/ARIEL-INDEX.md
   ↓
5. Comece a ler agents/ (MVP primeiro)
   ↓
6. Setup (Node.js + Supabase + .env)
   ↓
7. Implemente Agent 01
```

---

## 💾 Arquivos Criados

- ✅ 18 arquivos de documentação
- ✅ 13 agentes completamente descritos
- ✅ Roadmap de 4 fases
- ✅ README principal
- ✅ Índice de navegação

**Próximos (a criar conforme avança):**
- [ ] Database schema (PostgreSQL)
- [ ] API design
- [ ] Webhook flow
- [ ] Deployment guide
- [ ] Nicho configs

---

**Status:** ✅ Documentação pronta para ler e implementar!

# 🧜‍♀️ ARIEL — Plataforma de Agentes IA Multi-Nicho

**A salvadora das finanças & operações**

---

## 📁 Estrutura do Projeto

```
ariel/
├── README.md (este arquivo)
├── docs/
│   ├── ARIEL-INDEX.md ⭐ (Índice visual de agentes)
│   ├── ARIEL-MASTER.md (Visão geral + arquitetura)
│   ├── agents/
│   │   ├── ARIEL-Agent-01-LeadQualification.md
│   │   ├── ARIEL-Agent-02-Propostas.md
│   │   ├── ARIEL-Agent-03-SiteInteligente.md
│   │   ├── ARIEL-Agent-04-Support.md
│   │   ├── ARIEL-Agent-05-Resumidor.md
│   │   ├── ARIEL-Agent-06-TaskManager.md
│   │   ├── ARIEL-Agent-07-Documentos.md
│   │   ├── ARIEL-Agent-08-Relatorios.md
│   │   ├── ARIEL-Agent-09-Compliance.md
│   │   ├── ARIEL-Agent-10-Newsletter.md
│   │   ├── ARIEL-Agent-11-PesquisaTecnica.md
│   │   ├── ARIEL-Agent-12-Agendamento.md
│   │   └── ARIEL-Agent-13-Contratos.md
│   ├── architecture/
│   │   ├── DATABASE-SCHEMA.md (PostgreSQL/Supabase)
│   │   ├── API-DESIGN.md (Node.js REST API)
│   │   ├── WEBHOOK-FLOW.md (WAHA → Processing)
│   │   └── DEPLOYMENT.md (VPS + Coolify)
│   └── nichos/
│       ├── CONTABIL.md
│       ├── ODONTO.md
│       ├── JURIDICO.md
│       └── CONSIGNADORA.md
├── config/
│   ├── config.example.json
│   ├── nichos/
│   │   ├── contabil.json
│   │   ├── odonto.json
│   │   ├── juridico.json
│   │   └── consignadora.json
│   └── prompts/
│       ├── agent-01-qualification.txt
│       ├── agent-02-proposals.txt
│       └── ... (um por agente)
├── src/
│   ├── index.ts (entry point)
│   ├── services/
│   │   ├── WhatsAppService.ts
│   │   ├── OpusService.ts (Claude API)
│   │   ├── SupabaseService.ts
│   │   └── AgentRouter.ts
│   ├── agents/
│   │   ├── Agent01-LeadQualification.ts
│   │   ├── Agent02-Proposals.ts
│   │   └── ... (um por agente)
│   ├── models/
│   │   ├── Contact.ts
│   │   ├── Lead.ts
│   │   ├── Task.ts
│   │   └── ... (tipos)
│   └── utils/
│       ├── prompts.ts
│       ├── validators.ts
│       └── helpers.ts
├── tests/
│   ├── agents/
│   │   ├── agent-01.test.ts
│   │   └── ... (testes por agente)
│   └── integration/
├── package.json
├── tsconfig.json
├── .env.example
└── ROADMAP.md (fases de desenvolvimento)
```

---

## 🚀 Como Começar

### 1️⃣ **Leia a Documentação** (ordem recomendada)

```bash
# Visão geral
docs/ARIEL-MASTER.md

# Índice visual (lado a lado)
docs/ARIEL-INDEX.md

# Agentes (comece pelos do MVP)
docs/agents/ARIEL-Agent-01-LeadQualification.md
docs/agents/ARIEL-Agent-02-Propostas.md
docs/agents/ARIEL-Agent-04-Support.md
docs/agents/ARIEL-Agent-07-Documentos.md

# Depois fase 2, depois fase 3
```

### 2️⃣ **Setup Inicial** (próximas semanas)

```bash
# Clonar repo
cd D:/Claude\ Code/ariel

# Instalar dependências
npm install

# Setup .env
cp .env.example .env
# Editar com credenciais (SUPABASE_URL, ANTHROPIC_API_KEY, WAHA_TOKEN)

# Migrations database
npm run db:migrate

# Rodar servidor
npm run dev
```

### 3️⃣ **Implementação por Fase**

**Fase 1 (MVP) — Semana 1-4:**
- [ ] Setup: Node.js + Supabase + WAHA
- [ ] Agent 01: Lead Qualification
- [ ] Agent 02: Propostas
- [ ] Agent 04: Support
- [ ] Agent 07: Documentos
- [ ] Testes com 5 clientes

**Fase 2 — Semana 5-8:**
- [ ] Agent 03: Site Inteligente
- [ ] Agent 05: Resumidor
- [ ] Agent 06: Task Manager
- [ ] Agent 08: Relatórios
- [ ] Agent 09: Compliance
- [ ] Agent 12: Agendamento

**Fase 3 — Semana 9-12:**
- [ ] Agent 10: Newsletter
- [ ] Agent 11: Pesquisa Técnica
- [ ] Agent 13: Contratos
- [ ] Agentes especializados por nicho
- [ ] Integrações externas
- [ ] v1.0 estável

---

## 📚 Documentação por Tipo

### 📖 Para Entender o Projeto

- **[ARIEL-MASTER.md](docs/ARIEL-MASTER.md)** — Visão geral, stack, roadmap
- **[ARIEL-INDEX.md](docs/ARIEL-INDEX.md)** — Índice visual dos 13 agentes
- **[ROADMAP.md](ROADMAP.md)** — Fases, timelines, dependências

### 🧠 Para Entender os Agentes

- **[docs/agents/](docs/agents/)** — Cada agente (01-13) com:
  - O que faz
  - Quando ativa
  - Fluxo detalhado
  - Prompts prontos
  - Exemplos reais
  - Métricas
  - Troubleshooting

### 🏗️ Para Implementar

- **[docs/architecture/DATABASE-SCHEMA.md](docs/architecture/DATABASE-SCHEMA.md)** — Schema PostgreSQL completo
- **[docs/architecture/API-DESIGN.md](docs/architecture/API-DESIGN.md)** — Endpoints, rotas, estrutura
- **[docs/architecture/WEBHOOK-FLOW.md](docs/architecture/WEBHOOK-FLOW.md)** — Como WAHA → agentes
- **[docs/architecture/DEPLOYMENT.md](docs/architecture/DEPLOYMENT.md)** — VPS + Coolify setup

### 🎯 Por Nicho

- **[docs/nichos/CONTABIL.md](docs/nichos/CONTABIL.md)** — Config para contábil
- **[docs/nichos/ODONTO.md](docs/nichos/ODONTO.md)** — Config para odontologia
- **[docs/nichos/JURIDICO.md](docs/nichos/JURIDICO.md)** — Config para jurídico
- **[docs/nichos/CONSIGNADORA.md](docs/nichos/CONSIGNADORA.md)** — Config para consignadora

---

## 🔧 Stack Técnico

```
Frontend:
- Next.js 14 + TypeScript
- Tailwind CSS
- PWA (instalável no celular)

Backend:
- Node.js + Express/NestJS
- TypeScript
- Supabase (PostgreSQL)

IA:
- Claude Opus 4.8 (via API Anthropic)

WhatsApp:
- WAHA (por enquanto) → API oficial depois

Infra:
- VPS + Coolify
- Docker (conteineres)
- PostgreSQL 15+
```

---

## 📊 13 Agentes Explicados Rápido

| # | Agente | O que faz | Fase | Impacto |
|---|--------|----------|------|---------|
| 1 | Lead Qualification | Qualifica novo contato, calcula score | MVP | 🔴 Alto |
| 2 | Propostas | Gera orçamento automático em PDF | MVP | 🔴 Alto |
| 3 | Site Inteligente | Webchat no site, qualifica visitante | 2 | 🟡 Médio |
| 4 | Customer Support | Responde dúvida common automático | MVP | 🔴 Alto |
| 5 | Resumidor | Extrai decisões de reunião | 2 | 🟡 Médio |
| 6 | Task Manager | Cria + lembra tarefas inteligente | 2 | 🟡 Médio |
| 7 | Documentos | Processa NF-e, folha via IA | MVP | 🔴 Alto |
| 8 | Relatórios | Gera insights semanais | 2 | 🟡 Médio |
| 9 | Compliance | Alerta prazos fiscais (evita multa) | 2 | 🔴 Alto |
| 10 | Newsletter | Manda updates segmentados | 3 | 🟡 Médio |
| 11 | Pesquisa Técnica | Responde dúvida do time | 3 | 🟡 Médio |
| 12 | Agendamento | Marca reunião automático | 2 | 🔴 Alto |
| 13 | Contratos | Monitora renovação, gera aditivo | 3 | 🟡 Médio |

---

## 🎯 Checklist: Por Onde Começar?

### Você (Founder)
- [ ] Leia `docs/ARIEL-MASTER.md`
- [ ] Leia `docs/ARIEL-INDEX.md`
- [ ] Entenda os 13 agentes (leia pelo menos 04 principais)
- [ ] Review stack técnico acima

### Developer
- [ ] Leia `docs/ARIEL-MASTER.md`
- [ ] Leia `docs/agents/ARIEL-Agent-01-LeadQualification.md` (padrão base)
- [ ] Leia `docs/architecture/DATABASE-SCHEMA.md`
- [ ] Setup inicial (Node.js + .env)
- [ ] Comece com Agent 01

### Gestor/CRO
- [ ] Leia `docs/ARIEL-INDEX.md` (índice visual)
- [ ] Foque nos agentes 1, 2, 4 (receita)
- [ ] Depois 8, 9 (insights + compliance)

---

## 🚀 Stack & Credenciais Necessárias

```
✅ Supabase (PostgreSQL gerenciado)
   - URL + Chave API em .env

✅ Anthropic (Claude Opus 4.8)
   - API Key em .env

✅ WAHA (WhatsApp)
   - Token em .env
   - Futuramente: API oficial WhatsApp

✅ Google Calendar (opcional mas recomendado)
   - Para Agente 12 (agendamento)

✅ Asaas / Stripe (futuro)
   - Para pagamentos + webhooks
```

---

## 📞 Estrutura de Pastas Explicada

```
docs/
├── ARIEL-MASTER.md ← Leia primeiro
├── ARIEL-INDEX.md ← Índice visual
├── agents/ ← 13 agentes documentados
├── architecture/ ← Como implementar
│   ├── DATABASE-SCHEMA.md (SQL)
│   ├── API-DESIGN.md (Node.js)
│   ├── WEBHOOK-FLOW.md (WAHA → Agents)
│   └── DEPLOYMENT.md (Coolify)
└── nichos/ ← Config por tipo de negócio
    ├── CONTABIL.json
    ├── ODONTO.json
    ├── JURIDICO.json
    └── CONSIGNADORA.json

config/
├── config.example.json ← Template
├── nichos/ ← Configs do negócio
└── prompts/ ← Prompts de cada agente

src/
├── services/ ← Conexões (WhatsApp, Opus, Supabase)
├── agents/ ← Lógica de cada agente
├── models/ ← Tipos TypeScript
└── utils/ ← Helpers

tests/ ← Testes unitários + integração

ROADMAP.md ← Timeline de desenvolvimento
```

---

## 🔥 Próximos Passos Imediatos

1. **AGORA:** Leia `docs/ARIEL-MASTER.md` + `docs/ARIEL-INDEX.md`
2. **HOJE:** Revise `docs/agents/ARIEL-Agent-01-LeadQualification.md`
3. **SEMANA 1:** Setup Node.js + Supabase + primeiros testes
4. **SEMANA 2:** Agente 01 rodando
5. **SEMANA 3:** Agentes 02, 04, 07 funcionando

---

## 📖 Leitura Recomendada (em ordem)

```
1. Este README
2. docs/ARIEL-MASTER.md
3. docs/ARIEL-INDEX.md
4. docs/agents/ (leia pelo menos 4 primeiros)
5. docs/architecture/ (antes de implementar)
6. docs/nichos/ (para configurar seu nicho)
```

---

## ❓ Dúvidas?

Cada documento de agente tem seção **Troubleshooting**.  
Cada prompt tem exemplos reais.  
Cada fluxo tem passo a passo.

**Se travar:** grep a documentação pelo erro + agente relevante.

---

**Status:** ✅ Documentação 100% pronta para implementar  
**Fase:** MVP (Agentes 1, 2, 4, 7)  
**Tempo estimado:** 12 semanas até v1.0 estável  

🚀 **Vamos construir ARIEL!**

# 🧜‍♀️ ARIEL — Documentação de API

**Base URL:** `http://localhost:4001` (dev) | `https://ariel-api.seudominio.com` (prod)

---

## 🔐 Autenticação

### Webhook WhatsApp
- Header: `X-Waha-Token: {WAHA_SECRET}`

### Endpoints Internos (cron, reports, research)
- Header: `Authorization: Bearer {CRON_SECRET}`

### Webchat (público)
- Sem auth (rate-limited por IP)

---

## 📡 Endpoints

### Sumário

| Método | Endpoint | Agente | Descrição |
|--------|----------|--------|-----------|
| `GET` | `/health` | — | Status do server |
| `POST` | `/webhook/whatsapp` | 01-13 | Recebe mensagens WhatsApp |
| `POST` | `/api/webchat` | 03 | Chat do site (widget) |
| `GET` | `/api/reports/weekly` | 08 | Relatório semanal |
| `POST` | `/api/research` | 11 | Pesquisa técnica |
| `POST` | `/api/cron/compliance` | 09 | Trigger scan compliance |
| `POST` | `/api/cron/contracts` | 13 | Trigger scan contratos |

---

## 1. Health Check

```
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "version": "0.1.0"
}
```

**Exemplo:**
```bash
curl http://localhost:4001/health
```

---

## 2. Webhook WhatsApp (WAHA)

Recebe mensagens do WhatsApp via WAHA. O router interno decide qual agente acionar baseado em:
- Novo contato → Agent 01 (Lead Qualification)
- Lead em qualificação → Agent 01 (continua)
- Lead pede preço → Agent 02 (Propostas)
- Cliente existente → Agent 04 (Support)
- Enviou imagem/documento → Agent 07 (Documentos)
- Pediu agendamento → Agent 12 (Scheduling)

```
POST /webhook/whatsapp
```

**Headers:**
```
Content-Type: application/json
X-Waha-Token: {WAHA_SECRET}
```

**Request Body (formato WAHA):**
```json
{
  "event": "message",
  "payload": {
    "from": "5511999999999",
    "body": "oi, sou dentista e quero trocar de contador",
    "type": "text",
    "pushName": "Dr. Carlos",
    "mediaUrl": null,
    "timestamp": 1724367600
  }
}
```

**Campos do payload:**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `from` | string | ✅ | Número do remetente (formato: `5511999999999`) |
| `body` | string | ✅ | Texto da mensagem |
| `type` | string | ✅ | `text`, `image`, `audio`, `document`, `video` |
| `pushName` | string | ❌ | Nome do contato no WhatsApp |
| `mediaUrl` | string | ❌ | URL da mídia (se imagem/doc) |
| `timestamp` | number | ❌ | Unix timestamp |

**Response (sucesso):**
```json
{
  "ok": true,
  "agent": "agent01"
}
```

**Response (erro de auth):**
```json
{
  "error": "unauthorized"
}
```

**Response (erro interno):**
```json
{
  "error": "internal_error"
}
```

**Exemplos:**

```bash
# Novo lead (texto)
curl -X POST http://localhost:4001/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -H "X-Waha-Token: ariel-waha-secret-2024" \
  -d '{
    "event": "message",
    "payload": {
      "from": "5511999990001",
      "body": "oi, sou dentista e quero trocar de contador. Faturo 90k/mês",
      "type": "text",
      "pushName": "Dr. Carlos"
    }
  }'

# Cliente existente com dúvida
curl -X POST http://localhost:4001/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -H "X-Waha-Token: ariel-waha-secret-2024" \
  -d '{
    "event": "message",
    "payload": {
      "from": "5511888888888",
      "body": "quando vence meu DAS?",
      "type": "text",
      "pushName": "João da Clínica"
    }
  }'

# Cliente mandando documento (NF-e por foto)
curl -X POST http://localhost:4001/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -H "X-Waha-Token: ariel-waha-secret-2024" \
  -d '{
    "event": "message",
    "payload": {
      "from": "5511888888888",
      "body": "NF do fornecedor",
      "type": "image",
      "pushName": "João da Clínica",
      "mediaUrl": "https://exemplo.com/nfe-foto.jpg"
    }
  }'

# Lead pedindo preço
curl -X POST http://localhost:4001/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -H "X-Waha-Token: ariel-waha-secret-2024" \
  -d '{
    "event": "message",
    "payload": {
      "from": "5521777777777",
      "body": "quanto custa a contabilidade pra simples nacional?",
      "type": "text",
      "pushName": "Maria"
    }
  }'
```

---

## 3. Webchat — Agent 03 (Site Inteligente)

Endpoint para o widget de chat no site institucional. Sem auth (público), mas rate-limited.

```
POST /api/webchat
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "sessionId": "visitor-abc123",
  "message": "Quanto custa pra abrir empresa?",
  "visitorData": {
    "page": "/servicos/contabilidade",
    "utm_source": "google_ads",
    "utm_campaign": "contador-sp",
    "referrer": "https://google.com",
    "device": "mobile"
  }
}
```

**Campos:**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `sessionId` | string | ✅ | ID único da sessão do visitante (gere no frontend) |
| `message` | string | ✅ | Mensagem do visitante |
| `visitorData.page` | string | ❌ | Página atual do site |
| `visitorData.utm_source` | string | ❌ | Fonte de tráfego |
| `visitorData.utm_campaign` | string | ❌ | Campanha |
| `visitorData.referrer` | string | ❌ | Referrer |
| `visitorData.device` | string | ❌ | `mobile`, `desktop`, `tablet` |

**Response:**
```json
{
  "reply": "Olá! Pra abrir empresa no Simples Nacional, levamos 15-20 dias úteis. Qual tipo de empresa você quer abrir?",
  "actions": [
    {
      "type": "collect_phone",
      "data": {}
    }
  ]
}
```

**Tipos de action:**

| Action | Descrição | O que o frontend faz |
|--------|-----------|---------------------|
| `collect_phone` | Pedir telefone do visitante | Exibir input de telefone |
| `redirect_whatsapp` | Enviar pro WhatsApp | Abrir link `wa.me/...` |
| `show_calendar` | Mostrar agendamento | Exibir Calendly/embed |
| `show_pricing` | Mostrar preços | Exibir tabela de preços |

**Exemplos:**

```bash
# Primeira mensagem
curl -X POST http://localhost:4001/api/webchat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "visitor-001",
    "message": "Oi, quanto custa?",
    "visitorData": {
      "page": "/precos",
      "utm_source": "google",
      "device": "mobile"
    }
  }'

# Segunda mensagem (mesma sessão)
curl -X POST http://localhost:4001/api/webchat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "visitor-001",
    "message": "Sou MEI, faturo uns 30k"
  }'

# Terceira (converte para WhatsApp)
curl -X POST http://localhost:4001/api/webchat \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "visitor-001",
    "message": "Pode me mandar no WhatsApp? 11 99999-8888"
  }'
```

---

## 4. Relatório Semanal — Agent 08

Gera relatório com métricas da semana (leads, propostas, docs, compliance).

```
GET /api/reports/weekly
```

**Headers:**
```
Authorization: Bearer {CRON_SECRET}
```

**Response:**
```json
{
  "ok": true,
  "report": "📊 RELATÓRIO SEMANAL — ARIEL\nPeríodo: 15/08/2026 a 22/08/2026\n\n🎯 AQUISIÇÃO:\n• Novos leads: 12\n• Propostas enviadas: 8\n• Propostas aceitas: 3 (38%)\n• Novos clientes: 2\n\n📄 OPERAÇÃO:\n• Documentos processados: 47\n• Tarefas concluídas: 15\n• Obrigações fiscais cumpridas: 23\n\n💡 INSIGHTS:\n• ✅ Conversão acima de 30% — bom ritmo!\n• 🚀 Volume alto de documentos\n\n📅 Próximo relatório: 29/08/2026"
}
```

**Exemplo:**
```bash
curl -H "Authorization: Bearer ariel-cron-secret-2024" \
  http://localhost:4001/api/reports/weekly
```

---

## 5. Pesquisa Técnica — Agent 11

Para o time interno consultar legislação, normas, procedimentos fiscais.

```
POST /api/research
```

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {CRON_SECRET}
```

**Request Body:**
```json
{
  "question": "Cliente pode deduzir aluguel no IRPF?",
  "userName": "Ana",
  "userRole": "assistant"
}
```

**Campos:**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `question` | string | ✅ | Pergunta técnica |
| `userName` | string | ❌ | Nome de quem perguntou |
| `userRole` | string | ❌ | `owner`, `senior`, `assistant` |

**Response:**
```json
{
  "ok": true,
  "answer": "✅ SIM, desde que:\n\n1. Aluguel esteja em nome do declarante\n2. Tenha comprovante (recibo ou contrato)\n3. Declare no campo 'Pagamentos Efetuados' código 70\n\n⚠️ Se dividido com cônjuge, cada um declara sua parte.\n\n📚 Fonte: IN RFB 1.500/2014, art. 12"
}
```

**Exemplos:**
```bash
# Pergunta sobre IRPF
curl -X POST http://localhost:4001/api/research \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ariel-cron-secret-2024" \
  -d '{
    "question": "Qual o prazo para retificar DEFIS de 2024?",
    "userName": "Carlos",
    "userRole": "senior"
  }'

# Pergunta sobre regime tributário
curl -X POST http://localhost:4001/api/research \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ariel-cron-secret-2024" \
  -d '{
    "question": "Empresa com faturamento de 4.5M pode ficar no Simples?",
    "userName": "Ana"
  }'
```

---

## 6. Compliance Scan — Agent 09

Trigger manual do scan de obrigações fiscais. Em produção, roda automaticamente via cron (6h BRT diário).

```
POST /api/cron/compliance
```

**Headers:**
```
Authorization: Bearer {CRON_SECRET}
```

**Response:**
```json
{
  "ok": true,
  "alertsSent": 5,
  "obligationsChecked": 23
}
```

**Exemplo:**
```bash
curl -X POST http://localhost:4001/api/cron/compliance \
  -H "Authorization: Bearer ariel-cron-secret-2024"
```

---

## 7. Contract Scan — Agent 13

Trigger manual do scan de contratos vencendo. Em produção, roda via cron (semanal).

```
POST /api/cron/contracts
```

**Headers:**
```
Authorization: Bearer {CRON_SECRET}
```

**Response:**
```json
{
  "ok": true,
  "alertsSent": 2,
  "contractsChecked": 8
}
```

**Exemplo:**
```bash
curl -X POST http://localhost:4001/api/cron/contracts \
  -H "Authorization: Bearer ariel-cron-secret-2024"
```

---

## 🔄 Fluxo de Roteamento (Intent Detection)

Quando chega mensagem no webhook, o router decide:

```
NOVO CONTATO (não existe no DB)
  → Agent 01 (Lead Qualification)

LEAD EM QUALIFICAÇÃO (last_agent = agent01)
  → Agent 01 (continua)

LEAD PEDE PREÇO (keywords: "quanto custa", "preço", "proposta")
  → Agent 02 (Propostas)

CLIENTE MANDA IMAGEM/DOCUMENTO
  → Agent 07 (Documentos)

CLIENTE EXISTENTE (type = "client")
  → Agent 04 (Support)

LEAD QUALIFICADO (score >= 50)
  → Agent 02 (se pediu preço) ou Agent 01 (se não)

FALLBACK
  → Agent 04 (Support)
```

---

## 📊 Cron Jobs (Automáticos)

| Job | Schedule | Agente | O que faz |
|-----|----------|--------|-----------|
| Compliance Scan | Diário 6h BRT | Agent 09 | Varre obrigações fiscais, envia alertas |
| Compliance Report | Seg-Sex 8h BRT | Agent 09 | Envia relatório diário pro dono |
| Follow-up Propostas | Seg-Sex 10h BRT | Agent 02 | Follow-up D+3 e D+7 de propostas |
| Task Reminders | Diário 9h BRT | Agent 06 | Lembra tarefas vencendo |
| Weekly Report | Segunda 9h BRT | Agent 08 | Relatório semanal completo |
| Contract Scan | Semanal (segunda) | Agent 13 | Detecta contratos vencendo |

---

## 🗃️ Banco de Dados (Tabelas Supabase)

| Tabela | Descrição | Usada por |
|--------|-----------|-----------|
| `ariel_tenants` | Escritórios (multi-tenant) | Todos |
| `ariel_tenant_users` | Equipe do escritório | Agent 11 |
| `ariel_contacts` | Leads + clientes | Agents 01, 02, 04, 05, 06 |
| `ariel_conversations` | Conversas WhatsApp | Todos os WhatsApp agents |
| `ariel_messages` | Histórico completo | Todos |
| `ariel_documents` | Docs processados | Agent 07 |
| `ariel_fiscal_obligations` | Obrigações fiscais | Agent 09 |
| `ariel_tasks` | Tarefas | Agents 05, 06 |
| `ariel_proposals` | Propostas comerciais | Agents 01, 02, 13 |
| `ariel_knowledge_base` | FAQ automático | Agent 04 |
| `ariel_audit_log` | Auditoria LGPD | Todos |

---

## 🧪 Testes Rápidos

### Testar tudo de uma vez:

```bash
# 1. Start server
cd workers && API_PORT=4001 npx tsx src/index.ts

# 2. Health
curl http://localhost:4001/health

# 3. Novo lead
curl -X POST http://localhost:4001/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -H "X-Waha-Token: ariel-waha-secret-2024" \
  -d '{"event":"message","payload":{"from":"5511990001111","body":"oi quero contabilidade","type":"text","pushName":"Teste"}}'

# 4. Webchat
curl -X POST http://localhost:4001/api/webchat \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test-1","message":"quanto custa?"}'

# 5. Relatório
curl -H "Authorization: Bearer ariel-cron-secret-2024" \
  http://localhost:4001/api/reports/weekly

# 6. Pesquisa
curl -X POST http://localhost:4001/api/research \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ariel-cron-secret-2024" \
  -d '{"question":"Prazo do DAS?"}'

# 7. Compliance
curl -X POST http://localhost:4001/api/cron/compliance \
  -H "Authorization: Bearer ariel-cron-secret-2024"

# 8. Contratos
curl -X POST http://localhost:4001/api/cron/contracts \
  -H "Authorization: Bearer ariel-cron-secret-2024"
```

---

## 📝 Variáveis de Ambiente

```bash
# Server
API_PORT=4001

# Anthropic (Claude Opus 4.8)
ANTHROPIC_AUTH_TOKEN=sk-xxx
ANTHROPIC_BASE_URL=https://avellogateway.online
ANTHROPIC_MODEL=claude-opus-4-8

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJxxx

# WAHA
WAHA_BASE_URL=http://waha:3000
WAHA_SESSION=default
WAHA_SECRET=seu-segredo-aqui

# Cron/Internal
CRON_SECRET=seu-segredo-cron
```

---

## 🚀 Deploy

### Desenvolvimento Local
```bash
cd workers
cp ../.env.local .env
npx tsx src/index.ts
```

### Produção (Docker/Coolify)
```bash
docker build -t ariel-api ./workers
docker run -p 4001:4001 --env-file .env ariel-api
```

---

## 📐 Rate Limits

| Endpoint | Limite | Motivo |
|----------|--------|--------|
| `/webhook/whatsapp` | 100 req/min | Proteção contra flood |
| `/api/webchat` | 30 req/min por IP | Anti-bot |
| `/api/research` | 10 req/min | Custo de API |
| `/api/reports/*` | 5 req/min | Custo de API |

---

## 🔒 Segurança

- WAHA token validado em toda request do webhook
- CRON_SECRET validado em endpoints internos
- CORS habilitado (configurável por domínio)
- RLS no Supabase (multi-tenant isolation)
- Audit log de todas as ações
- Dados sensíveis NUNCA logados em plaintext

---

## 📚 Links Relacionados

- [Documentação dos Agentes](../docs/agents/)
- [Schema do Banco](../packages/db/migrations/0002_init_prefixed.sql)
- [Prompts](../workers/src/prompts/accounting/)
- [README principal](../README.md)

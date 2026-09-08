# PRÁXIS v1.0 — Mega-Planejamento de Implementação

**Base:** PRÁXIS (Next.js 16, Supabase, WAHA, AI Gateway, multi-tenant)
**Fusão:** + Odontocontrol (Agenda, Pacientes, Procedimentos) + BeautyFlow (Agendamento público, Pacotes)
**Objetivo:** Sistema completo para especialidades médicas delicadas (urologia, proctologia, andrologia)
**Escopo:** Rebranding + Adaptação médica + Novas features + Correções + IA Avello

---

## FASE 1: REBRANDING (PRÁXIS → PRÁXIS)

### 1.1 Identidade Visual

| Item | De | Para |
|------|-----|------|
| Nome | PRÁXIS | PRÁXIS |
| Tagline | "Sistema operacional de vendas" | "Sistema de IA para especialidades médicas" |
| Cor primária | Não definida (neutro) | `#0a5e5c` (teal médico) |
| Logo | Práxis | PRÁXIS (ícone médico) |
| Favicon | Práxis | Ícone P estilizado |

**Arquivos a alterar:**
- `app/layout.tsx` — title, description, og tags
- `public/` — logos, favicon, manifest.json
- `components/shell/` — sidebar logo, header branding
- `app/(public)/` — landing pages, login

### 1.2 Vocabulário

O PRÁXIS tem vocabulário configurável por pipeline. Configurar defaults pra médico:

| CRM Term | PRÁXIS Default |
|----------|---------------|
| Lead | Paciente |
| Deal | Consulta |
| Won | Atendido |
| Lost | Cancelado |
| Pipeline | Fluxo de Atendimento |
| Stage | Etapa |
| Contact | Paciente |
| Conversation | Conversa |
| Assignee | Responsável |

**Arquivo:** Pipeline settings → `vocabulary jsonb`

### 1.3 CRM Stages Default (Urologia)

```
Triagem → Qualificado → Agendado → Confirmado → Em Atendimento → Atendido → Follow-up
```

Estágio "Cancelado" e "No-show" como finais negativos.

---

## FASE 2: INTEGRAÇÃO IA AVELLO

### 2.1 Gateway Config

O PRÁXIS usa Vercel AI Gateway (`AI_GATEWAY_API_KEY`). Para Avello:

**Arquivo:** `lib/ai/gateway.ts`

**Mudança:**
```typescript
// Adicionar Avello como provider option
export function gatewayConfig() {
  // Se tem AVELLO_AUTH_TOKEN, usar como primary
  if (process.env.AVELLO_AUTH_TOKEN) {
    return {
      apiKey: process.env.AVELLO_AUTH_TOKEN,
      baseURL: 'https://avellogateway.online',
      headers: { 'Authorization': `Bearer ${process.env.AVELLO_AUTH_TOKEN}` }
    };
  }
  // Fallback para AI_GATEWAY_API_KEY original
  if (!env.AI_GATEWAY_API_KEY) return null;
  return { apiKey: env.AI_GATEWAY_API_KEY, baseURL: env.AI_GATEWAY_BASE_URL || undefined };
}
```

**Arquivo:** `lib/env.ts`

**Mudança:** Adicionar `AVELLO_AUTH_TOKEN` como variável opcional.

### 2.2 System Prompt (Urologia)

**Arquivo:** `lib/ai/prompts/` — Criar `medical-sensitive.ts`

System prompt especializado para especialidades delicadas:
- Tom discreto, respeitoso
- Triagem em 3-4 perguntas
- Detecção de urgência
- Nunca diagnostica
- Encaminha pra humano em dúvida emocional
- Agendamento automático quando qualificado

### 2.3 AI Agent Config no DB

A tabela `agent_config` (do sistema existente) já suporta configuração por tenant. Preencher com defaults médicos via migration:

```sql
-- Default agent config para clínicas médicas
INSERT INTO ai_agent_defaults (specialty, system_prompt_template, ...)
```

---

## FASE 3: FEATURES A FUNDIR (Odontocontrol + BeautyFlow)

### 3.1 Agenda Visual (do Odontocontrol)

**O que falta no PRÁXIS:** Visualização semanal de horários com grid visual (tipo Google Calendar)

**Implementar:**
- `app/app/agenda/page.tsx` — Agenda semanal com slots de horário
- `components/agenda/` — WeekView, DayColumn, TimeSlot, AppointmentCard
- `lib/agenda/` — helpers (slots, conflitos, horários disponíveis)

**Database:** Tabela `appointments` (já existe no schema do PRÁXIS — `crm_lead_activities` com type `appointment`)

**UI:**
- Grid semanal (Seg-Sex, 7h-18h)
- Cards coloridos por status (agendado=azul, confirmado=verde, cancelado=vermelho)
- Drag-n-drop pra remarcar
- Modal de detalhes ao clicar
- Filtro por profissional

### 3.2 Gestão de Pacientes (do Odontocontrol)

**O que falta:** Ficha completa de paciente com histórico médico

**Implementar:**
- `app/app/pacientes/page.tsx` — Lista + busca
- `app/app/pacientes/[id]/page.tsx` — Ficha completa
- `components/pacientes/` — PatientCard, MedicalHistory, Timeline

**O que a ficha tem:**
- Dados pessoais (nome, CPF, telefone, email, endereço)
- Histórico de consultas
- Exames/documentos upload
- Notas médicas
- Timeline de atividades
- Agendamentos futuros
- Tags (ex: "Paciente VIP", "Primeira consulta", "Retorno")

**Database:** Usar `contacts` existente + enriquecer com `medical_data jsonb`

### 3.3 Procedimentos (do Odontocontrol)

**Implementar:**
- `app/app/procedimentos/page.tsx` — CRUD de procedimentos
- Cada procedimento: nome, duração, preço, categoria, descrição

**Default (Urologia):**
```
- Consulta Urológica (45 min, R$ 350)
- Exame de PSA (20 min, R$ 200)
- Ultrassom (30 min, R$ 250)
- Biópsia (60 min, R$ 800)
- Cirurgia Ambulatorial (120 min, R$ 3.500)
- Retorno (30 min, R$ 180)
```

### 3.4 Agendamento Público (do BeautyFlow)

**O que falta:** Link público onde paciente agenda sozinho

**Implementar:**
- `app/(public)/agendar/[slug]/page.tsx` — Página pública de agendamento
- Paciente vê horários disponíveis (sem login)
- Seleciona procedimento + horário
- Preenche dados mínimos (nome, telefone)
- Confirma

**Fluxo:**
```
Paciente acessa link → Escolhe procedimento → Vê horários → Preenche dados → Confirma
    ↓
Sistema cria agendamento + contato no CRM
    ↓
Automação envia confirmação (WhatsApp ou Email)
    ↓
24h antes: lembrete automático
```

### 3.5 Orçamentos/Propostas (do Odontocontrol)

**Implementar:**
- `app/app/orcamentos/page.tsx` — Lista de orçamentos
- `app/app/orcamentos/[id]/page.tsx` — Detalhe com PDF exportável
- Geração com IA (baseado na consulta)

### 3.6 Pacotes de Tratamento (do BeautyFlow)

**Implementar:**
- `app/app/pacotes/page.tsx` — Pacotes de tratamento recorrente
- Ex: "Check-up urológico anual" (consulta + PSA + ultrassom)
- Precificação: desconto por pacote

### 3.7 Profissionais (do BeautyFlow)

**Implementar:**
- `app/app/profissionais/page.tsx` — Gestão de médicos do consultório
- Horários de cada profissional
- Especialidade
- Agenda individual

---

## FASE 4: CORREÇÕES E MELHORIAS DO CÓDIGO BASE

### 4.1 TODOs Pendentes (20 items)

| Arquivo | Issue | Fix |
|---------|-------|-----|
| `lib/lgpd/pades-signer.ts:48` | TODO: wire signpdf | Implementar assinatura PDF com cert real |
| `lib/agent-engine/edge/egress.ts:3` | TODO: allowlist de rede | Implementar whitelist de hosts |
| `lib/agent-engine/agent/inbound-turn.ts:5` | Cache por lead | Implementar TTL cache |

### 4.2 Tipagem (1 `any` no app — excelente)

Manter strict. Não introduzir novos `any`.

### 4.3 Console.log (0 — perfeito)

Já limpo. Usar `lib/logger.ts` para qualquer log novo.

### 4.4 Vulnerabilidades

Nenhuma `eval`, `innerHTML` ou `dangerouslySetInnerHTML` encontrada. Código seguro.

### 4.5 Dependências

Verificar com `pnpm audit` após instalar. Atualizar deps com CVE conhecidas.

---

## FASE 5: FEATURES NOVAS (Específicas PRÁXIS)

### 5.1 Chat Widget Embeddable

**O que é:** Widget de chat que o médico coloca no site dele (uma linha de código)

**Implementar:**
- `public/widget/praxis-chat.js` — Script embeddable (1 tag script)
- Widget abre no canto inferior direito
- Se conecta à API do PRÁXIS
- Triagem com IA
- Agendamento direto

**Como usar:**
```html
<script src="https://praxis.app/widget/praxis-chat.js" data-clinic="ABC123"></script>
```

### 5.2 Triagem Inteligente (IA pra Especialidades Delicadas)

**O que é:** IA que entende que urologia/proctologia é sensível

**Implementar:**
- System prompt específico (ver Fase 2.2)
- Detecção de constrangimento na mensagem do paciente
- Respostas mais curtas e diretas (sem forçar conversa longa)
- Quick actions: "Agendar" | "Dúvida" | "Urgência"
- Detecção de emergência: sangramento, retenção urinária → orienta pronto-socorro

### 5.3 Lembretes Automáticos (Redução de No-show)

**O que é:** Automação que reduz no-show de 20% pra 5%

**Implementar (via automações do PRÁXIS):**
- 48h antes: "Sua consulta está se aproximando"
- 24h antes: "Confirma presença?" (botão Sim/Não)
- 2h antes: "Dr. Carlos te espera às [hora]. Endereço: ..."
- Se não confirmou: "Precisa remarcar?"

**Fluxo QUANDO/SE/ENTÃO:**
```
QUANDO: appointment.created
SE: status = 'agendado'
ENTÃO: programar lembrete 48h + 24h + 2h
```

### 5.4 Upselling Inteligente (do JSON que você me mandou)

**Baseado no:** `UPSELLINGClinicAI1.json`

**O que é:** Após procedimento, IA analisa histórico e propõe follow-up

**Implementar:**
- Tabela de serviços + tempo de follow-up
- IA analisa última compra/procedimento
- Calcula quando agendar retorno
- Envia mensagem personalizada
- Ex: "Oi João, já faz 6 meses do seu PSA. Hora de repetir?"

### 5.5 Dashboard de Métricas Médicas

**O que é:** Dashboard específico pra consultório (não genérico de CRM)

**Métricas:**
- Taxa de no-show (meta: <5%)
- Pacientes atendidos/semana
- Faturamento do mês
- Horários mais populares
- Taxa de retorno (pacientes que voltam)
- Origem dos pacientes (WhatsApp, site, indicação)
- Tempo médio de triagem (IA)

### 5.6 Prontuário Digital Simplificado

**O que é:** Notas médicas vinculadas ao paciente (não é PEP completo, é anotação)

**Implementar:**
- Campo de notas por consulta realizada
- Timeline de notas
- Anexos (exames, fotos)
- Privacidade: só o médico vê (RBAC)

### 5.7 Relatório de Reativação

**O que é:** Lista de pacientes que deveriam ter voltado e não voltaram

**Implementar:**
- Pacientes com última consulta > X meses
- Score de urgência (baseado no procedimento anterior)
- Botão: "Enviar mensagem de reativação"
- IA gera mensagem personalizada

### 5.8 Multi-Profissional (Consultório com 2+ médicos)

**O que é:** Suporte a consultório com múltiplos médicos

**Implementar:**
- Tabela `professionals` (nome, CRM, especialidade, horários)
- Agenda por profissional
- Roteamento de paciente → médico certo
- Dashboard por profissional

---

## FASE 6: CONFIGURAÇÃO E DEPLOY

### 6.1 Env Vars Necessárias

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# IA (Avello)
AVELLO_AUTH_TOKEN=<sua key sk-...>
AVELLO_BASE_URL=https://avellogateway.online

# WAHA (WhatsApp) - opcional no início
WAHA_API_BASE_URL=
WAHA_API_KEY=
WAHA_WEBHOOK_BASE_URL=

# Redis (Upstash) - para rate limit e filas
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Interno
INTERNAL_SECRET=<gerar random 32 chars>

# Crypto
CPF_ENCRYPTION_KEY=<gerar>
AI_CRED_AES_KEY=<gerar base64 32 bytes>
WAHA_BYO_ENCRYPTION_KEY=<gerar>
```

### 6.2 Database Migrations

Adicionar ao schema existente (77 migrations):
```
0085_medical_procedures.sql — Tabela de procedimentos
0086_appointments_extension.sql — Campos médicos no agendamento
0087_patient_medical_data.sql — Dados médicos no contato
0088_professionals.sql — Tabela de profissionais
0089_treatment_packages.sql — Pacotes de tratamento
0090_public_booking_slots.sql — Slots para agendamento público
0091_upselling_rules.sql — Regras de follow-up/upselling
0092_praxis_defaults.sql — Vocabulário e pipeline defaults médicos
```

### 6.3 Seed Data (Demo Dr. Carlos)

```sql
-- Organização demo
INSERT INTO organizations (id, name, slug) VALUES ('demo-org-uuid', 'Dr. Carlos Mendes - Urologista', 'dr-carlos');

-- Profissional
INSERT INTO professionals (org_id, name, crm, specialty) VALUES ('demo-org-uuid', 'Dr. Carlos Mendes', 'CRM/RS 12345', 'Urologia');

-- Procedimentos
INSERT INTO procedures (org_id, name, duration_min, price_cents, category) VALUES
  ('demo-org-uuid', 'Consulta Urológica', 45, 35000, 'consulta'),
  ('demo-org-uuid', 'Exame de PSA', 20, 20000, 'exame'),
  ('demo-org-uuid', 'Ultrassom Prostático', 30, 25000, 'exame'),
  ('demo-org-uuid', 'Retorno', 30, 18000, 'consulta');

-- Pipeline padrão
INSERT INTO crm_pipelines (org_id, name, vocabulary) VALUES
  ('demo-org-uuid', 'Fluxo de Atendimento', '{"lead":"Paciente","deal":"Consulta","won":"Atendido","lost":"Cancelado"}');

-- Stages
INSERT INTO crm_stages (pipeline_id, name, position, type) VALUES
  (pipeline_id, 'Triagem', 1, 'normal'),
  (pipeline_id, 'Qualificado', 2, 'normal'),
  (pipeline_id, 'Agendado', 3, 'normal'),
  (pipeline_id, 'Confirmado', 4, 'normal'),
  (pipeline_id, 'Atendido', 5, 'won'),
  (pipeline_id, 'No-show', 6, 'lost'),
  (pipeline_id, 'Cancelado', 7, 'lost');
```

---

## FASE 7: PRIORIZAÇÃO E ORDEM DE EXECUÇÃO

### Sprint 1: Funcional (Semana 1-2)
1. ✅ Rebranding completo (nome, cores, textos)
2. ✅ Integração Avello (IA funcionando)
3. ✅ Configurar Supabase (migrations + seed)
4. ✅ npm install + rodar localmente
5. ✅ Login admin + criar organização demo

### Sprint 2: Features Core (Semana 3-4)
6. Agenda visual (Odontocontrol style)
7. Procedimentos (CRUD)
8. Profissionais (multi-médico)
9. Agendamento público (link externo)
10. Triagem com IA (system prompt médico)

### Sprint 3: Automações (Semana 5-6)
11. Lembretes automáticos (no-show reduction)
12. Upselling inteligente (follow-up baseado em tempo)
13. Reativação de pacientes inativos
14. Chat Widget embeddable

### Sprint 4: Polish (Semana 7-8)
15. Dashboard de métricas médicas
16. Prontuário digital simplificado
17. Orçamentos/Propostas com IA
18. Pacotes de tratamento
19. Relatório de reativação

### Sprint 5: QA + Deploy (Semana 9-10)
20. Testes E2E (Playwright)
21. Audit de segurança
22. Performance (Lighthouse)
23. Deploy em produção (Vercel ou VPS)
24. Documentação para cliente final

---

## FEATURES NOVAS SUGERIDAS (NÃO IMPLEMENTAR AGORA — Planejar)

### Futuro v1.1
- **Teleconsulta integrada** — Videochamada dentro do sistema (Daily.co ou similar)
- **Receita digital** — Geração de receita com assinatura digital
- **Integração com planos de saúde** — Verificação de cobertura
- **Portal do paciente** — Paciente vê seus agendamentos, exames, notas
- **WhatsApp Business API oficial** — Migrar de WAHA para BSP oficial
- **Multi-idioma** — Inglês pra clientes internacionais
- **App mobile** — PWA ou React Native
- **Integração com labs** — Resultados de exame automáticos
- **IA pré-consulta** — Questionário inteligente antes da consulta (reduz tempo do médico)
- **Score de risco** — IA avalia risco do paciente baseado em sintomas
- **Relatório para plano de saúde** — PDF automático formatado pra convênio

### Futuro v2.0
- **Multi-clínica** — Um painel pra dono que tem 3+ consultórios
- **Marketplace de especialistas** — Conectar urologista com cardiologista do mesmo paciente
- **IA que aprende** — RAG com base de conhecimento médico do tenant
- **Integração com ERP médico** — Tasy, MV, etc
- **Comparativo de mercado** — "Sua taxa de no-show vs média do mercado"

---

## RISCOS E MITIGAÇÕES

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Supabase precisa de projeto dedicado | Alto | Criar projeto novo específico pro PRÁXIS |
| WAHA precisa de VPS pra WhatsApp | Médio | Deixar WhatsApp pra Sprint 3+ |
| Avello gateway pode ter downtime | Médio | Fallback pra Anthropic direto |
| PRÁXIS é complexo demais pra demo rápido | Médio | Focar Sprint 1 em "rodar + login" |
| Migrations conflitam com schema existente | Alto | Criar novo Supabase do zero |
| Branding incompleto (textos hardcoded) | Baixo | grep + replace global |

---

## DECISÕES PENDENTES (Pra Você — Depois)

1. **Supabase:** Criar projeto novo ou usar `dxvamljoffvbpruljiqa`?
2. **Domínio:** Qual URL de produção? (praxis.app? praxis.med.br?)
3. **WAHA:** Tem VPS pra WhatsApp ou deixa pra depois?
4. **Redis:** Tem Upstash ou quer alternativa?
5. **Logo:** Quer que eu crie ou você faz?
6. **Demo:** Dr. Carlos genérico ou baseado em médico real da lista de leads?

---

## RESUMO EXECUTIVO

```
PRÁXIS v1.0 = PRÁXIS (base robusta)
            + Agenda Visual (odontocontrol)
            + Agendamento Público (beautyflow)
            + Procedimentos + Pacientes (odontocontrol)
            + IA Avello (novo)
            + Triagem Delicada (novo)
            + Lembretes Anti No-show (novo)
            + Upselling Inteligente (novo)
            + Chat Widget Embeddable (novo)
            + Dashboard Médico (novo)
            + Branding PRÁXIS (novo)
```

**Tempo estimado:** 8-10 semanas (1 dev full-time)
**77 migrations existentes + 8 novas = 85 total**
**24 features no roadmap**
**Custo zero de infraestrutura pra MVP (Supabase free, Avello, Vercel free)**

# 🧜‍♀️ ARIEL — Roadmap de Desenvolvimento

---

## Fase 1: MVP (Semana 1-4)

### Semana 1-2: Foundation
- [ ] Setup: Node.js + TypeScript + ESLint + Prettier
- [ ] Setup: Supabase (PostgreSQL + Auth)
- [ ] Setup: WAHA (webhook recebendo mensagens)
- [ ] Schema de banco: tabelas core (tenants, contacts, conversations, messages)
- [ ] Service: WhatsAppService (enviar/receber msg)
- [ ] Service: OpusService (Claude API)
- [ ] Router: AgentRouter (detectar intenção → rotear agente)
- [ ] **Agent 01: Lead Qualification** (versão alpha, 1 nicho: contábil)
- [ ] Testes unitários básicos

### Semana 3-4: MVP Funcional
- [ ] **Agent 02: Gerador de Propostas** (texto + PDF simples)
- [ ] **Agent 04: Customer Support** (FAQ + escalação)
- [ ] **Agent 07: Processador de Documentos** (foto → extração)
- [ ] Config por nicho: contábil (primeiro)
- [ ] Config por nicho: odonto (segundo)
- [ ] CRM básico: listar contatos, ver histórico
- [ ] PWA: tela de login + inbox
- [ ] Deploy: Coolify (VPS)
- [ ] **Teste com 5 clientes reais**

### Entregável Fase 1:
> Sistema funcional onde lead entra no WhatsApp, é qualificado,
> recebe proposta, pode tirar dúvida e mandar documento.
> Tudo logado no CRM.

---

## Fase 2: Expansão (Semana 5-8)

### Semana 5-6: Operação
- [ ] **Agent 03: Site Inteligente** (widget webchat)
- [ ] **Agent 05: Resumidor de Reuniões** (extrai ações)
- [ ] **Agent 06: Task Manager** (cria/lembra tarefas)
- [ ] **Agent 08: Relatórios** (insights semanais)
- [ ] **Agent 09: Compliance** (prazos fiscais)
- [ ] Scheduler: jobs diários/semanais
- [ ] Notificações push (PWA)

### Semana 7-8: Agendamento + Polish
- [ ] **Agent 12: Agendamento** (Google Calendar)
- [ ] CRM: dashboard com métricas
- [ ] CRM: kanban de leads
- [ ] Config: nicho jurídico
- [ ] Config: nicho consignadora
- [ ] Testes: 20+ cenários automatizados
- [ ] **Teste com 10-15 clientes reais**

### Entregável Fase 2:
> Sistema com agendamento automático, compliance, relatórios.
> Cliente recebe insights semanais. Time tem tarefas organizadas.
> 4 nichos configurados.

---

## Fase 3: Escala (Semana 9-12)

### Semana 9-10: Comunicação
- [ ] **Agent 10: Newsletter** (campaigns segmentadas)
- [ ] **Agent 11: Pesquisa Técnica** (base de legislação)
- [ ] **Agent 13: Contratos** (renovação automática)
- [ ] Editor visual de fluxos (drag-and-drop básico)
- [ ] Multi-tenant: painel admin

### Semana 11-12: Escala + Polish
- [ ] Agentes especializados por nicho
- [ ] Integração: Asaas (pagamentos)
- [ ] Integração: DocuSign (assinaturas)
- [ ] Analytics avançado
- [ ] Migração WAHA → API oficial WhatsApp (opcional)
- [ ] Load testing (100+ conversas simultâneas)
- [ ] **v1.0 estável lançada**

### Entregável Fase 3:
> Plataforma completa: 13 agentes funcionando, multi-nicho,
> multi-tenant, pronta para vender.

---

## Fase 4: Crescimento (Mês 4-6)

- [ ] Onboarding self-service (cliente configura sozinho)
- [ ] Marketplace de templates de nicho
- [ ] White-label para revendedores
- [ ] API pública (para integradores)
- [ ] App nativo iOS/Android (opcional)
- [ ] IA learning: melhora prompts com feedback
- [ ] Escala para 50+ clientes

---

## Prioridades de Implementação

### P0 — Sem isso nada funciona
1. Webhook WhatsApp recebendo mensagens
2. Opus 4.8 API respondendo
3. Banco de dados (Supabase)
4. Agent 01 (Lead Qualification)

### P1 — MVP mínimo para testar
5. Agent 04 (Support)
6. Agent 07 (Documentos)
7. Agent 02 (Propostas)

### P2 — MVP completo para vender
8. Agent 12 (Agendamento)
9. Agent 09 (Compliance)
10. CRM mobile (PWA)

### P3 — Escala
11-13. Restante dos agentes
14. Multi-tenant
15. Analytics

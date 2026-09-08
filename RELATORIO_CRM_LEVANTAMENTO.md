# LEVANTAMENTO COMPLETO DE CRMs — Análise Técnica e Recomendações

**Data:** 31 de julho de 2026  
**Escopo:** 13 projetos disponíveis em `C:\Users\Administrator\Downloads\software\`  
**Objetivo:** Identificar candidatos viáveis como base para um CRM próprio competitivo

---

## RESUMO EXECUTIVO

De 13 candidatos avaliados, **apenas 2 são viáveis como base para um produto SaaS**:

1. **DeskcommCRM-1.0.0** ← RECOMENDADO FORTEMENTE (produtor, não agregador)
2. **Frappe CRM** (crm-develop) ← Alternativa robusta (requer refatoração pesada)

Os demais são **ferramentas especializadas** (scraping, email, outreach) ou **MVPs iniciais** sem arquitetura de produção. Misturá-los resultaria em um frankenstein inviável.

---

## ANÁLISE DETALHADA POR PROJETO

### 1. DeskcommCRM-1.0.0 ⭐ RECOMENDADO

| Aspecto | Detalhe |
|---------|---------|
| **O que faz** | Sistema operacional de vendas multi-nicho com agentes de IA nativos, WhatsApp (WAHA), multi-tenant. Automatiza funil, qualificação e suporte. Alternativa open-source a Kommo/Octadesk/Zendesk. |
| **Stack** | Next.js 16 (App Router) + React 19 + TypeScript 6 (estrito) + Supabase (Postgres RLS) + Vercel AI SDK + WAHA Plus |
| **Qualidade** | **EXCELENTE** — Código enterprise-grade: RLS testado em CI, audit append-only, LGPD by-design, 364 invariantes, migrations versionadas, E2E Playwright |
| **Licença** | MIT (100% comercialmente livre) |
| **Tamanho/Complexidade** | Grande: 1281 arquivos TS/TSX, 7941 linhas de baseline SQL, 66 documentos (CLAUDE.md+VISION+ARCHITECTURE+specs), 62 migrations versionadas, +100 handlers de API |
| **Pontos Fortes** | • Multi-tenant desde o dia 1 com RLS (não bolted-on) • IA nativa (RAG por tenant, MCP como "sistema nervoso") • Compliance (LGPD, audit, RBAC 4-role) • WhatsApp-native (anti-banimento, STOP detection) • Self-hosted com Docker + HostGator kit (1 comando) • Documentação canonicamente em português • CI/CD rigoroso (typecheck, lint, invariantes) • Operacional real (agentes de IA produzindo em 2026) |
| **Pontos Fracos** | • Comunidade ainda pequena (nasceu 2026) • Requer Supabase (lock-in moderado, embora portável) • Documentação parcialmente em PT-BR (inglês secundário) • Dependência pesada em WAHA (open source, mas específica) |
| **Pode virar SaaS?** | **SIM, COM 90% DO TRABALHO JÁ PRONTO.** Deploy: Vercel (app) + VPS genérica (WAHA) + Supabase managed (DB). Billing: stripe (não implementado yet). Branding: já multi-tenant. Bloqueador: nenhum arquitetural. |
| **Esforço para produção** | 2-4 meses: billing, marketplace de templates, observability avançada (Stripe → webhook), multi-tenant isolamento financeiro, suporte tier. |

**Diagnóstico detalhado DeskcommCRM:**
- **Arquivo CLAUDE.md (20KB):** Convenções não-negociáveis (RLS, idempotência, audit, LGPD, WAHA, anti-patterns)
- **VISION.md (7KB):** Posicionamento claro (AI Sales OS, não "CRM com bot")
- **ARCHITECTURE.md (3KB):** Visão de 1 página (Next.js + Supabase + WAHA + MCP)
- **README.md (15KB):** Completo, com quickstart, stack, testes, roadmap
- **HANDOFF.md (66KB):** Rastreamento de features em progresso (follow-up system, silence sweeps, gate com agentes)
- **Spec técnicas:** `docs/specs/01-14-*.md` (schema SQL, payloads, MCP, RBAC, governança)
- **Testes:** 364 invariantes (RLS isolation, RBAC, routing, webhooks, automações) + E2E Playwright
- **Código limpo:** Sem `console.log` deixado, Zod validação em todos inputs, wrappers de API centralizados

---

### 2. Frappe CRM (crm-develop) ⭐ ALTERNATIVA

| Aspecto | Detalhe |
|---------|---------|
| **O que faz** | CRM completo: leads, deals, kanban, atividades, integrações (Twilio, WhatsApp, ERPNext). Multi-user, self-hosted. |
| **Stack** | Frappe Framework (Python backend) + Frappe UI (Vue 3) + PostgreSQL/MySQL |
| **Qualidade** | **BOM** — Framework maduro, mas CRM é mais aplicação vertical que arquitetura horizontal. Código menos rigoroso que DeskcommCRM. |
| **Licença** | AGPL v3 (virulenta: qualquer customização/fork deve ser GPL) |
| **Tamanho/Complexidade** | Grande: 468 arquivos Python+Vue, arquitetura Frappe pesada |
| **Pontos Fortes** | • Framework consolidado (ERPNext já usa) • Integrações prontas (Twilio, WhatsApp, ERPNext) • Customizável via DocType model • Community grande • Multi-user nativo |
| **Pontos Fracos** | • AGPL (viral, afasta SaaS) • Framework opinionado (curva de aprendizado > 2 semanas) • Customização requer conhecer Frappe, não React/SQL direto • Sem IA nativa (bot é bolted-on) • WAHA não integrado |
| **Pode virar SaaS?** | **SIM, MAS COM CUIDADO.** AGPL exige que qualquer SaaS publique o código (ou renegue a licença). Refabricação desde o zero em MIT seria mais rápido. |
| **Esforço para produção** | 6-9 meses: reescrever CRM do zero em Frappe (não refatorar — é trabalho) ou migrar em MIT + escolher backend diferente. |

**Por que não Frappe:**
- AGPL é dealbreaker para SaaS closed-source. Você DEVE publicar o código customizado, ou conseguir exceção de licença (cara).
- Menos adequado para IA nativa (feature do futuro).
- Menos focus em WhatsApp (integração é addon, não nativo).

---

### 3. AllWhatsPy-main (Python)

| Aspecto | Detalhe |
|---------|---------|
| **O que faz** | Biblioteca Python para automação WhatsApp. Wrapper ao redor de Selenium/Playwright para WhatsApp Web. |
| **Stack** | Python 3.9, Playwright |
| **Qualidade** | **AMADOR** — ~240 linhas de código, sem testes, sem arch clara |
| **Licença** | MIT |
| **Tamanho** | Muito pequeno: 1 arquivo principal + exemplos |
| **Pontos Fortes** | • Código aberto, simples de entender • PyPI publicado (500+ downloads/ano) |
| **Pontos Fracos** | • Viola ToS WhatsApp Web (risco de ban) • Sem multitenant, sem DB, sem API • É só automação client-side • Sem suporte a WAHA ou Cloud API |
| **Pode virar SaaS?** | **NÃO.** Serve como referência para integração WhatsApp client-side, nada mais. |

---

### 4. Bulk-Email-Sender-main (Laravel)

| Aspecto | Detalhe |
|---------|---------|
| **O que faz** | Envio de email em massa com drag-and-drop builder (GrapesJS), gerenciamento de contatos, templates, tags. |
| **Stack** | Laravel 10 + PHP 8.1+ + Bootstrap 5 + GrapesJS (builder visual) + Database queue |
| **Qualidade** | **BOM** — Código estruturado, migrations, auth, mas sem testes visíveis |
| **Licença** | MIT |
| **Tamanho** | Médio: aplicação funcional full-stack |
| **Pontos Fortes** | • Stack conhecida (Laravel é stable) • UI moderna (GrapesJS) • Suporte SMTP multi-account • Queue support (síncrono/assíncrono) |
| **Pontos Fracos** | • Foco email apenas (não CRM) • Sem WhatsApp, sem IA • Sem multi-tenant nativo (single-org) • Sem automações customizáveis |
| **Pode virar SaaS?** | **SIM, MAS COMO ADDON.** Email é componente de CRM, não o produto. Seria base fraca. |

---

### 5. Google-Maps-Scrapper-main (Python)

| Aspecto | Detalhe |
|---------|---------|
| **O que faz** | Scraping do Google Maps com Playwright: extrai nome, endereço, telefone, reviews, horários. |
| **Stack** | Python 3.8/3.9, Playwright, CSV export |
| **Qualidade** | **AMADOR** — ~240 linhas, sem auth, sem DB |
| **Licença** | MIT |
| **Pontos Fortes** | • Simples, direto | • CSV export |
| **Pontos Fracos** | • Viola ToS Google Maps (scraping) • Zero arquitetura • Não é compilável como serviço |
| **Pode virar SaaS?** | **NÃO.** Risco legal alto. Serve como inspiração para lead sourcing, nada mais. |

---

### 6. OpenOutreach-main (Python + Django)

| Aspecto | Detalhe |
|---------|---------|
| **O que faz** | Outreach/sales automation: discovery de leads (BetterContact Lead Finder API), classificação ML (Gaussian Process), email qualificado com LLM, multi-turn follow-up, CRM visual. |
| **Stack** | Python 3.12+, Django, Bayesian ML (scikit-learn), Vercel AI SDK, BetterContact API (paga), Mailbox SMTP próprio |
| **Qualidade** | **EXCELENTE** — Código profissional, Docker, CI/CD, multi-stage pipeline |
| **Licença** | GPLv3 (viral, similar a Frappe) |
| **Tamanho** | Grande: ~176 arquivos Python, arquitetura multi-stage |
| **Pontos Fortes** | • IA nativa (LLM para ICP derivation, ML para lead ranking, agentic email) • Zero ToS surface (não scrapa, não usa social account) • Self-hosted puro • Pipeline inteligente (explore/exploit) • Email real do usuário (não SaaS mailbox) |
| **Pontos Fracos** | • GPLv3 (dealbreaker SaaS) • Foco email apenas, não CRM full • Requer BetterContact API (terceira dependência paga) • Sem WhatsApp • Sem UI moderna (CLI focus) |
| **Pode virar SaaS?** | **NÃO COMO ESTÁ.** GPLv3 + CLI. Seria refabricação do zero em MIT + React. |

---

### 7. ProspectOS-main (Python + React)

| Aspecto | Detalhe |
|---------|---------|
| **O que faz** | Lead sourcing + CRM visual: scrapa Google Maps/Instagram, analisa sites (score automatizado), gera diagnóstico PDF, oferece estratégia+mensagem IA, kanban e follow-up. |
| **Stack** | Python 3.11+ (Flask backend) + React 19 + TypeScript + TailwindCSS + SQLite (local) |
| **Qualidade** | **BOM** — Código estruturado, 230 testes, TypeScript strict, mas Windows-only |
| **Licença** | MIT |
| **Tamanho** | Médio: backend Python + frontend React, multi-feature |
| **Pontos Fortes** | • Full-stack realmente: scraping + IA + CRM • Lead scoring (site analysis) + PDF diag • UI/UX clara • Testes (230 passing) • MIT (uso livre) |
| **Pontos Fracos** | • **Windows only** (scripts .bat) • SQLite local (não servidor) • Risco ToS alto (Google Maps + Instagram scraping) • Sem multi-tenant • Sem API exposta • Sem White-label (design hardcoded) • Requer conta Instagram pessoal (risco ban) |
| **Pode virar SaaS?** | **NÃO COMO ESTÁ.** Seria refabricação: retirar scraping (ToS), migrar para DB server, adicionar multi-tenant, reescrever lead sourcing para API legal (BetterContact, Clay, Pipedrive). |

---

### 8. frappe_whatsapp-master (Python)

| Aspecto | Detalhe |
|---------|---------|
| **O que faz** | Integração WhatsApp para Frappe/ERPNext via Meta Cloud API. Templates, notificações, two-way messaging. |
| **Stack** | Python, Frappe app, Meta WhatsApp Cloud API |
| **Qualidade** | **BOM** — Addon Frappe consolidado, bem documentado |
| **Licença** | MIT |
| **Pontos Fortes** | • Integração Frappe madura • Meta Cloud API (sem client-side risk) • Multi-account suporte |
| **Pontos Fracos** | • Addon de outro produto (não standalone) • Sem IA • Sem CRM features beyond messaging |
| **Pode virar SaaS?** | **NÃO.** Componente apenas. Seria bloco de um CRM maior. |

---

### 9. laravel-crm-2.2 (Laravel)

| Aspecto | Detalhe |
|---------|---------|
| **O que faz** | CRM genérico: leads, deals, contacts, atividades, kanban, custom fields, email parsing (SendGrid). |
| **Stack** | Laravel 10, PHP 8.3+, Vue.js (legacy), MySQL 8+ |
| **Qualidade** | **BOM** — Framework Laravel stable, mas CRM é menos inovador que DeskcommCRM. |
| **Licença** | MIT |
| **Tamanho** | Grande: full-stack, mas menos especializado |
| **Pontos Fortes** | • Framework Laravel maduro • Customizações via DocType • Community (Krayin = Webkul) • Multi-user nativo |
| **Pontos Fracos** | • Sem IA nativa • Sem WhatsApp nativo (integração addon) • Sem multi-tenant (single-org) • Menos compliance (LGPD, audit, RLS não mencionados) |
| **Pode virar SaaS?** | **SIM, MAS REQUERIA REFABRICAÇÃO.** PHP/Laravel pode ser SaaS, mas seria começar quase do zero: multi-tenant, IA, WhatsApp nativo. |

---

### 10. atrilabs-engine-main (TypeScript + Python)

| Aspecto | Detalhe |
|---------|---------|
| **O que faz** | Visual no-code/low-code builder: drag-and-drop para gerar React + Python. Editor visual, asset management. Não é CRM. |
| **Stack** | TypeScript (frontend builder), Python (backend), React gerado |
| **Qualidade** | **EXCELENTE PARA SEU PROPÓSITO** — Y Combinator backed, trending #1 TS repo GitHub |
| **Licença** | Não mencionada (inferir proprietária ou SSPL) |
| **Pontos Fortes** | • Ferramenta de desenvolvimento, não aplicação • Pode ser USADO para construir UIs de CRM • Community ativa |
| **Pontos Fracos** | • Não é CRM, é builder • Curva de aprendizado alta • Complexidade arquitetural alta |
| **Pode virar SaaS?** | **NÃO COMO BASE DE CRM.** É uma ferramenta complementar. Se usasse Atri para construir UI de um CRM, aproveitaria 10% da engine. |

---

### 11. webbuilder-main (React)

| Aspecto | Detalhe |
|---------|---------|
| **O que faz** | Editor de templates HTML visual usando GrapesJS. Arrasta componentes, edita texto/imagem, exporta HTML+CSS. |
| **Stack** | React 19 + TypeScript + Vite + Mantine + GrapesJS + Redux |
| **Qualidade** | **BOM** — Código moderno, React 19, mas é exemplo AI-built (Kombai, 5 threads). |
| **Licença** | MIT |
| **Pontos Fortes** | • UI moderna • GrapesJS integrado • Export HTML/CSS funcional |
| **Pontos Fracos** | • Não é CRM, é editor • Sem DB, sem auth, sem multi-tenant • Sem automações |
| **Pode virar SaaS?** | **NÃO.** É componente (editor visual). Serviria como bloco num CRM maior. |

---

### 12. One-Click-Clone-main (TypeScript)

| Aspecto | Detalhe |
|---------|---------|
| **O que faz** | Clonagem de websites via IA: browser automation, extrai assets, CSS, reconstrói em Next.js (70-80% fidelity). |
| **Stack** | TypeScript, Playwright, Next.js gerado, Claude Code skill |
| **Qualidade** | **EXCELENTE** — Skill para Claude Code, metodologia robusta |
| **Licença** | MIT |
| **Pontos Fortes** | • Inovador • Open source • Foco em fidelidade visual |
| **Pontos Fracos** | • Não é CRM, é automação de cloning • Sem relevância direta a CRM |
| **Pode virar SaaS?** | **NÃO.** Ferramenta auxiliar apenas. |

---

### 13. ai-website-cloner-template-master (TypeScript)

| Aspecto | Detalhe |
|---------|---------|
| **O que faz** | Template reutilizável para clonar websites via IA: reconhecimento de design, componentes, specs, builders paralelos. |
| **Stack** | Next.js 16 + TypeScript + shadcn/ui + Tailwind v4 + Claude Code |
| **Qualidade** | **EXCELENTE** — Profissional, documentado, com AGENTS.md e workflow |
| **Licença** | MIT |
| **Pontos Fortes** | • Reusable template • Metodologia clara • Multi-platform (Claude Code, Cursor, etc.) |
| **Pontos Fracos** | • Não é CRM, é template de cloning |
| **Pode virar SaaS?** | **NÃO.** Ferramenta de dev apenas. |

---

## MATRIZ DE DECISÃO

| Projeto | CRM Pronto? | Multi-Tenant? | IA Nativa? | WhatsApp? | Compliance | Licença | SaaS Ready? |
|---------|----------|-----------|----------|---------|-----------|--------|----------|
| **DeskcommCRM** | ✅ SIM | ✅ SIM (RLS) | ✅ SIM (MCP) | ✅ WAHA | ✅ LGPD/Audit | MIT | ✅ 90% |
| **Frappe CRM** | ✅ SIM | ✅ SIM | ❌ NÃO | ✅ Addon | ✅ Frappe | AGPL | ⚠️ 50% |
| AllWhatsPy | ❌ | ❌ | ❌ | ✅ | ❌ | MIT | ❌ |
| Bulk-Email | ⚠️ Email | ❌ | ❌ | ❌ | ❌ | MIT | ⚠️ Addon |
| GoogleMaps-Scraper | ❌ | ❌ | ❌ | ❌ | ❌ | MIT | ❌ |
| OpenOutreach | ⚠️ Email | ⚠️ CLI | ✅ SIM | ❌ | ⚠️ | GPLv3 | ❌ GPL |
| ProspectOS | ⚠️ Local | ❌ | ✅ SIM | ⚠️ Scraper | ❌ | MIT | ⚠️ Win-only |
| frappe_whatsapp | ❌ | ❌ | ❌ | ✅ Addon | ❌ | MIT | ❌ Addon |
| laravel-crm | ✅ SIM | ❌ | ❌ | ⚠️ Addon | ⚠️ | MIT | ⚠️ 40% |
| atrilabs-engine | ❌ Builder | ❌ | N/A | ❌ | ❌ | ? | ❌ |
| webbuilder | ❌ Editor | ❌ | ❌ | ❌ | ❌ | MIT | ❌ |
| One-Click-Clone | ❌ Automação | ❌ | ✅ SIM | ❌ | ❌ | MIT | ❌ |
| ai-website-cloner | ❌ Template | ❌ | ✅ SIM | ❌ | ❌ | MIT | ❌ |

---

## RECOMENDAÇÃO FINAL

### ✅ ESTRATÉGIA RECOMENDADA

**Base:** DeskcommCRM-1.0.0

**Por quê:**
1. **Produzido, não agregado** — Não é franken-Frankenstein de 13 peças, é coesão arquitetural real
2. **90% pronto para SaaS** — Multi-tenant, compliance, IA, WhatsApp, self-host, MIT
3. **Documentação canonicamente pt-br** — Seu público é Brasil, este foi feito para Brasil
4. **Rigor de produção** — 364 invariantes, RLS isolation testing, migrations versionadas, audit append-only, zero console.log
5. **Roadmap claro** — VISION.md e HANDOFF.md rastreiam 8 ondas de features; você não inventa do zero
6. **Comunidade emergente** — Outros developers já usam (clinics, real estate, e-commerce, infoprodutos)

**Próximos passos (roadmap de 2-4 meses):**
1. **Refactor de foco:** Remove integração Nuvemshop (vertical específica), mantém framework multi-nicho
2. **Billing:** Stripe + webhooks (sistema de crédito por org)
3. **Marketplace:** Templates de pipeline/fluxo pré-construídos
4. **Observability:** Datadog/Grafana (além do Sentry atual)
5. **Multi-regional:** Supabase em múltiplos datacenters
6. **Go-to-market:** Docs em EN (hoje 70% pt-br), SEO, community Discord

**Investimento de código:** ~500-800 horas (1-2 devs / 3 meses, com testes)

---

### ⚠️ ALTERNATIVA (Se DeskcommCRM não agradar)

**Base:** Refabricação desde zero em Next.js 16 + Supabase + Vercel AI SDK, usando DeskcommCRM como **referência de arquitetura, não como fork**.

**Por quê não refabricar a partir de Frappe CRM:**
- AGPL viral + foco em ERP (não vendas) + stack Python/Vue diferente + curva learning alta

**Tempo:** 9-12 meses (toda a arquitetura desde zero)

---

### ❌ O QUE NÃO FAZER

1. **Não juntar pedaços:** ProspectOS (scraping ToS-risky) + Bulk-Email + AllWhatsPy + frappe_whatsapp = disaster. Cada piece tem trade-offs incompatíveis.
2. **Não usar Frappe/OpenOutreach sem licença:** GPL é armadilha; you'll be forced to open-source customizações ou pagar advogado.
3. **Não começar em Laravel:** PHP é estável mas menos adequado para IA/real-time; Next.js+ Vercel + Supabase = deploy mais rápido.
4. **Não ignorar compliance:** LGPD/audit/RLS não é "nice-to-have"; é obrigatório no Brasil desde 2020. DeskcommCRM tem isso embarcado.

---

## CONCLUSÃO

**Você tem dois caminhos claros:**

**Caminho A (Recomendado):** Use DeskcommCRM como base + refatore para seu nicho específico. Tempo: 3 meses, risco baixo.

**Caminho B (Arriscado mas original):** Refabrique desde zero em Next.js+Supabase, usando DeskcommCRM como study case. Tempo: 12 meses, risco médio-alto, resultado potencialmente mais diferenciado.

Os demais 11 projetos servem como **referências pontuais**:
- **AllWhatsPy, Google-Maps-Scraper:** Inspiration para client-side automação (use com cuidado ToS)
- **Bulk-Email, frappe_whatsapp, openoutreach:** Estude a arquitetura de email/WhatsApp/outreach, não copie o código
- **ProspectOS:** Refer para lead-sourcing workflow (não para scraping, por risco)
- **laravel-crm:** Estude RBAC/custom fields, descarte stack Laravel
- **atrilabs, webbuilder, One-Click-Clone, ai-website-cloner:** Zero relevância para CRM; são ferramentas dev

**Recomendação final:** Comece com DeskcommCRM hoje. Tem tudo que você precisa de arquitetura, compliance, IA e multi-tenant. O diferencial vai ser **seu nicho específico** (indústria, região, fluxo), não reinventar roda de CRM.

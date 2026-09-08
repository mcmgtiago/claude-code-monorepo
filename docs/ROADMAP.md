# Roadmap de Desenvolvimento — Plataforma Unificada

> Objetivo: Um core compartilhado com templates por vertical (barbearia / beleza / estética).  
> Referência de mercado: Trinks, Avec, Booksy, SimplesAgenda.

---

## 📊 Matriz de Features: Estado Atual vs. Meta

| # | Feature | Barbearia | Beleza | Meta |
|---|---|:---:|:---:|:---:|
| 1 | Agendamento Online | ✅ | ✅ | ✅ |
| 2 | Lembretes de Horários (WhatsApp) | ✅ | ❌ | ✅ |
| 3 | Programa de Fidelidade | ✅ | ❌ | ✅ |
| 4 | Envio de Notícias e Promoções | ❌ | ❌ | ✅ |
| 5 | Gestão Financeira | ✅ | ⚠️ | ✅ |
| 6 | Pagamento Online (cliente final) | ❌ | ❌ | ✅ |
| 7 | Relatórios Gerenciais | ✅ | ⚠️ | ✅ |
| 8 | Pacotes de Serviços e Produtos | ❌ | ✅ | ✅ |
| 9 | Gestão de Estoque | ⚠️ | ❌ | ✅ |
| 10 | Comandas e Controle de Consumo | ✅ | ❌ | ✅ |
| 11 | Aniversariantes | ❌ | ⚠️ | ✅ |
| 12 | Lista de Espera | ❌ | ❌ | ✅ |
| 13 | Mensagens de Retorno Automáticas | ❌ | ❌ | ✅ |
| 14 | Pesquisa de Satisfação / NPS | ❌ | ❌ | ✅ |
| 15 | Clube de Clientes | ✅ | ❌ | ✅ |
| 16 | Site do Estabelecimento | ✅ | ✅ | ✅ |
| 17 | Comissões + Vales | ✅ | ❌ | ✅ |
| 18 | WhatsApp integrado (API) | ❌ | ❌ | ✅ (fase 3) |

**Score atual**: Barbearia 11/18, Beleza 5/18

---

## 🗓️ Fases de Desenvolvimento

### Fase 1: Unificação e Base Sólida (2-3 semanas)

**Objetivo**: Combinar o melhor de ambos em um repositório único.

| Task | Esforço | Prioridade |
|---|---|---|
| Migrar pacotes (beleza) → schema unificado | 2d | P0 |
| Adicionar `data_nascimento` ao `customer` | 1h | P0 |
| Adicionar `hora_inicio/hora_fim/dias_atendimento` ao `professional` | 2h | P0 |
| Criar sistema de "vertical" por company (barbearia/beleza/estetica) | 1d | P0 |
| Unificar `plan-features.ts` com todas as features | 4h | P0 |
| Rodar ambos com views OU migrar beleza pro schema unificado | 2d | P0 |
| Testes E2E básicos (login, criar empresa, agendar) | 1d | P1 |
| LP genérica com seletor de vertical | 1d | P2 |

### Fase 2: Features Faltantes — Valor Imediato (3-4 semanas)

**Objetivo**: Chegar a 16/18 features pra competir com Trinks.

| Task | Vertical | Esforço | Prioridade |
|---|---|---|---|
| **Aniversariantes**: tela com lista + alerta + botão WhatsApp | Ambas | 1d | P0 |
| **Lista de Espera**: fila por profissional/horário, notificação | Ambas | 2d | P1 |
| **Pesquisa de Satisfação**: NPS pós-atendimento via link | Ambas | 2d | P1 |
| **Mensagens de Retorno**: reativação automática (cron + WhatsApp) | Ambas | 3d | P1 |
| **Envio de Promoções**: broadcast segmentado (por tag/última visita) | Ambas | 3d | P2 |
| **Pagamento Online**: integrar Pix via gateway (Asaas/PagBank) | Ambas | 5d | P2 |
| **Estoque completo**: alertas de mínimo, movimentações, fornecedores | Barbearia | 2d | P2 |
| **Vales de profissional**: crédito interno consumível na comanda | Barbearia | 2d | P3 |

### Fase 3: WhatsApp Integrado (4-6 semanas)

**Objetivo**: Comunicação bidirecional real com clientes.

| Task | Esforço | Prioridade |
|---|---|---|
| Integrar Evolution API (não-oficial) — QR Code + envio/recebimento | 1 sem | P0 |
| Automação de lembretes (cron: D-1 e D0 automáticos) | 2d | P0 |
| Automação de reativação (clientes inativos >30d) | 2d | P1 |
| Inbox unificada (chat por contato) | 3d | P1 |
| Agente IA para responder automaticamente | 1 sem | P2 |
| Integrar WhatsApp Business API (oficial) como alternativa | 3d | P2 |
| Opt-out automático (palavras "parar", "cancelar") | 1d | P1 |
| Rate limiting (anti-ban) | 1d | P1 |

### Fase 4: Diferenciação e Escala (ongoing)

| Task | Esforço | Prioridade |
|---|---|---|
| PWA (Progressive Web App) — funcionar offline | 1 sem | P1 |
| App mobile (React Native / Capacitor) | 4-8 sem | P2 |
| Multi-idioma (i18n) | 3d | P3 |
| Relatórios avançados com gráficos (Recharts já instalado) | 2d | P1 |
| Dashboard com métricas em real-time | 2d | P2 |
| Sistema de templates/temas por vertical | 3d | P1 |
| Marketplace de serviços (discovery público) | 2 sem | P3 |
| Integração com Google Calendar (já existe no atendezap) | 3d | P2 |

---

## 🎯 Priorização por Impacto × Esforço

### Quick Wins (alto impacto, pouco esforço)

1. ✅ **Aniversariantes** — 1 dia, dados já existem (beleza tem `data_nascimento`)
2. ✅ **Lembretes automáticos no beleza** — copiar de barbearia (já pronto)
3. ✅ **Fidelidade no beleza** — copiar de barbearia (já pronto)
4. ✅ **Pacotes no barbearia** — copiar de beleza (já pronto)

### Médio Esforço, Alto Valor

5. **Lista de espera** — 2 dias, diferencial competitivo
6. **NPS / Satisfação** — 2 dias, dados para marketing ("96% aprovação")
7. **Mensagens de retorno** — 3 dias, recuperação de clientes inativos

### Alto Esforço, Transformacional

8. **WhatsApp integrado** — 1-2 semanas, muda o jogo
9. **Pagamento online** — 1 semana, reduz fricção
10. **App mobile** — 4-8 semanas, acessibilidade

---

## 📐 Arquitetura Futura

```
┌──────────────────────────────────────────────┐
│              Frontend (TanStack Start)         │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│   │ Barbearia│  │  Beleza  │  │ Estética │  │
│   │ template │  │ template │  │ template │  │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│        │              │              │        │
│        └──────────┬───┘──────────────┘        │
│                   │                           │
│        ┌──────────▼──────────┐                │
│        │    Core Shared      │                │
│        │  (auth, tenancy,    │                │
│        │   billing, RLS)     │                │
│        └──────────┬──────────┘                │
└───────────────────┼──────────────────────────┘
                    │
┌───────────────────▼──────────────────────────┐
│              Supabase (PostgreSQL)             │
│  ┌─────────┐ ┌─────────┐ ┌─────────────┐    │
│  │  Auth   │ │  RLS    │ │  Realtime   │    │
│  └─────────┘ └─────────┘ └─────────────┘    │
│  ┌─────────────────────────────────────┐     │
│  │     Schema Unificado (public)       │     │
│  │  company, professional, service,    │     │
│  │  appointment, customer, sale, etc.  │     │
│  └─────────────────────────────────────┘     │
└──────────────────────────────────────────────┘
                    │
┌───────────────────▼──────────────────────────┐
│           Integrações (Fase 3+)               │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │Evolution │ │ WA Biz   │ │ Pix Gateway  │ │
│  │   API    │ │   API    │ │(Asaas/PagBnk)│ │
│  └──────────┘ └──────────┘ └──────────────┘ │
└──────────────────────────────────────────────┘
```

---

## 💰 Modelo de Monetização por Feature

| Plano | Preço Sugerido | Features |
|---|---|---|
| **Starter** | R$ 49/mês | Agendamento, 1 profissional, clientes, booking link |
| **Pro** | R$ 129/mês | + Multi-profissional, comissões, fidelidade, lembretes, financeiro, relatórios, pacotes |
| **Business** | R$ 249/mês | + Clube, WhatsApp automático, NPS, campanhas, estoque, API |
| **Enterprise** | R$ 499/mês | + Multi-unidade, white-label, suporte prioritário |

### Add-ons (cobrados separados)

| Add-on | Preço | Feature |
|---|---|---|
| WhatsApp (Evolution API) | +R$ 49/mês | Automação de mensagens |
| WhatsApp (API Oficial) | +R$ 99/mês | Sem risco de ban |
| Pagamento Online (Pix) | +R$ 29/mês | Gateway integrado |
| App Mobile | +R$ 39/mês | Acesso via app |

---

## ✏️ Convenções de Código

- **Nomes de tabelas**: Inglês (company, professional, service, appointment)
- **Nomes de campos**: Mix (slug em inglês, nomes de domínio em português: `fidelidade_meta`, `preco_cents`)
- **Enums**: Português (`agendado`, `confirmado`, `cancelado`)
- **RLS**: Uma policy por tabela, usando `has_company_access(company_id)`
- **Gating**: `featureEnabled(plan_slug, 'chave')` em tela + serverFn

---

## 📝 Decisões Pendentes

1. **Repositório único ou monorepo?** — Recomendo monorepo (Turborepo/nx) com `packages/core` + `apps/barbearia` + `apps/beleza`
2. **Views ou código?** — Beleza usa views (rápido) ou migra pro schema unificado (clean)?
3. **WhatsApp: Evolution primeiro ou API oficial?** — Evolution = rápido + barato; Oficial = seguro + caro
4. **Mobile: PWA ou React Native?** — PWA primeiro (menos esforço), RN depois se market fit

---

## 🏁 Próximos Passos Imediatos

1. **Rodar ambos local** ✅ (feito)
2. **Colar views de beleza no SQL Editor** → `docs/002_BELEZA_VIEWS.sql`
3. **Criar conta e testar ambos** → primeiro login = super admin
4. **Escolher vertical prioritária** (barbearia ou beleza) pra polir primeiro
5. **Implementar Quick Wins** (aniversariantes, copiar features cruzadas)
6. **Definir se vai pra monorepo ou mantém 2 repos**


# 02 — Arquitetura da Solução

> Como as **4 camadas** se conectam tecnicamente. Este documento serve tanto pra você explicar pra cliente quanto pra você operar a infra sem virar refém do SaaS.

---

## 2.1 Visão geral (1 diagrama)

```
                    ┌──────────────────────────────────┐
                    │        ANÚNCIOS (Ads)            │
                    │  Google · Meta (Instagram/Fb)    │
                    │  TikTok (opcional)               │
                    └─────────────┬────────────────────┘
                                  │ clique (utm_source, utm_campaign)
                                  ▼
          ┌───────────────────────────────────────────────┐
          │   LANDING PAGES DE CAPTAÇÃO (Next.js)         │
          │   - 1 página por campanha                      │
          │   - Pixel Meta + tag Google                    │
          │   - Formulário / WhatsApp Web / CTA            │
          └─────────────┬─────────────────────────────────┘
                        │ POST /api/v1/webhooks/in/<token>
                        ▼
┌─────────────────────────────────────────────────────────────┐
│          CRM DESKCOMM (Next.js + Supabase)                  │
│                                                             │
│  ┌───────────────┐   ┌──────────────────────────────────┐  │
│  │  WAHA (WhatsApp│   │   AGENTE IA (Anthropic Claude) │  │
│  │  multi-número)│   │   - RAG por tenant (pgvector)   │  │
│  │  anti-ban     │◄──┤   - Análise de sentimento       │  │
│  │  multi-mídia  │   │   - Handoff IA→humano           │  │
│  └───────┬───────┘   │   - Conecta no MCP do CRM       │  │
│          │            └──────────────────────────────────┘  │
│          ▼                                                  │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  KANBAN MULTI-NICHO + INBOX + AUTOMAÇÕES              │ │
│  │  (QUANDO/SE/ENTÃO — webhooks externos, tags, etc.)    │ │
│  └───────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │ realtime + webhook de saída
                           ▼
                ┌──────────────────────────────┐
                │  TIME DO CLIENTE             │
                │  (atendentes humanos, gestor) │
                │  acesso: app DeskcommCRM     │
                └──────────────────────────────┘
        ─── ops ───
                A AGÊNCIA OPERA TUDO (mensalidade)
                - Treina IA com material novo
                - Ajusta landing pages
                - Otimiza campanhas de ads
                - Monitora SLA, agenda, métricas
```

---

## 2.2 Onde cada coisa roda (infra física)

### Recomendação padrão: tudo na **VPS HostGator SP-1** (~R$ 130/mês)

A parceria Deskcomm × HostGator ([link de desconto](https://www.hostgator.com.br/52708-141-3-52.html)) dá a VPS com:

- **Datacenter São Paulo** (latência ótima pra WhatsApp BR + Meta/Google)
- **Snapshots automáticos**
- **Acesso root** (a gente controla tudo)

> Por que self-host em vez de SaaS concorrente? Custo + soberania + mesma arquitetura multi-tenant do DeskcommCRM. Cliente **tem** os dados dele; a gente opera mas não controla.

### Divisão dentro da VPS

| Container / serviço | Porta | Função |
|---|---|---|
| `app` (Next.js Site institucional + landing) | 3000 | Site e LPs em `cliente.com.br` e `lp.cliente.com.br/campanha` |
| `crm` (Next.js DeskcommCRM app) | 3001 | Painel do cliente em `app.cliente.com.br` |
| `waha` (WAHA Plus) | 3002 | Engine WhatsApp em `waha.cliente.com.br` |
| `postgres` (Supabase self-hosted ou Supabase Cloud) | 5432 | Dados com RLS por tenant |
| `caddy` (reverse proxy + SSL automático) | 80/443 | TLS automático via Let's Encrypt |

### Custo de infra típico (cliente Scale)

| Item | Custo/mês |
|---|---|
| VPS HostGator SP-1 (recomendado pela parceria) | R$ 130 |
| Supabase Pro (gerenciado, recomendado em produção multi-tenant) | R$ 110 |
| WAHA Plus licence | US$ 50 ≈ R$ 260 |
| Anthropic Claude (tokens) | R$ 50–300 conforme volume |
| Resend (e-mails transacionais) | R$ 0–50 (free tier suficiente no MVP) |
| Upstash Redis (rate limit) | R$ 0–30 (free tier suficiente) |
| **Subtotal infra** | **R$ 550–800** |

Esse é o **nosso custo** (da agência). Cliente paga a mensalidade de gestão (R$ 1.297 no Scale). Margem bruta **~60–70%**.

---

## 2.3 Fluxo do lead — passo a passo (do clique ao atendimento humano)

### Etapas

1. **Usuário clica em anúncio** (Google/Meta/TikTok)
   - URL: `https://cliente.com.br/campanha-black-november?utm_source=meta&utm_campaign=black25`
2. **Landing page carrega** com `pixel Meta` + `tag Google` ativos
   - Pixel dispara `PageView` + `Lead` na conversão
3. **Usuário escolhe canal de contato**:
   - **WhatsApp Web**: abre `wa.me/5511999999999?text=Quero+detalhes`
   - **Formulário**: preenche nome, telefone, e-mail
4. **Webhooks bifurcados**:

#### 4a. Via WhatsApp
- WAHA recebe mensagem → cria/atualiza `contact`
- Se houver `webhook_in_token` configurado, também dispara evento `lead_created` no CRM
- Agente IA responde em **< 30s** usando RAG do tenant (PDFs, FAQ, scripts)
- Análise de sentimento roda a cada mensagem
- Se `confidence < threshold` ou sentimento negativo: **handoff auditado** para humano

#### 4b. Via formulário (landing page)
- POST `/api/v1/webhooks/in/<token>` com payload JSON
- Cria `contact` + `crm_lead` na etapa **"Lead novo"** (configurável)
- Dispara evento que aciona **automação**:
  - Tag automática `utm_source:meta`
  - Mensagem WhatsApp de boas-vindas (template HSM)
  - Atribuição ao corretor / atendente (round-robin)
  - Notificação pro gestor (webhook → Slack/Telegram)
- IA atende no WhatsApp, segue mesma lógica do 4a

5. **Atendente humano** (gestor comercial, corretor, recepção) pega no CRM:
   - Vê histórico no inbox unificado
   - Pode intervir a qualquer momento (`take_over` audita o handoff reverso)
6. **Lead vira cliente?** Marca como `won` (vocabulário configurável: `pago`/`agendado`/`fechado`)
   - Dispara automação de pós-venda (e-mail, mensagem, tarefa)
7. **Métricas** no painel: tempo médio de resposta, taxa de qualificação, ROI por campanha

---

## 2.4 Captações alternativas (sem landing page própria)

Se o cliente **já tem** site ou usa Hotmart/Kiwify/Leadpages, o sistema ainda funciona:

- Cria-se uma **fonte webhook no DeskcommCRM** com URL única
- Aponta o formulário existente pra essa URL
- Mesmo fluxo a partir do passo 4b

> **Ponto de venda na venda**: "Você não precisa trocar de site. Se já tem, plugamos nele."

---

## 2.5 Multi-tenant e isolamento

Cada cliente é uma **organização** no DeskcommCRM:

- **RLS ativo em toda tabela** (`crm_leads`, `contacts`, `conversations`, `messages`)
- **Teste de isolamento no CI** (364 invariantes validam isso)
- **Sua instância multi-tenant** (todos os clientes numa VPS só): menor custo, mais simples de operar
- **Instância single-tenant** (cada cliente na VPS dele): mais caro, mas LGPD corporativo mais limpo para clínicas de grande porte com dados sensíveis

**Recomendação padrão**: multi-tenant até o cliente pedir o contrário ou até você ter > 30 clientes. Depois, migra os "premium" pra single-tenant.

---

## 2.6 Agente IA — como funciona (pra explicar pro cliente)

### 4 modos de atuação

| Modo | Comportamento |
|---|---|
| **Atende primeiro** | Toda mensagem nova do WhatsApp passa pelo agente antes do humano |
| **Atende como humano** | Pega leads atribuídos a ele como se fosse um atendente (assignee de 1ª classe) |
| **Co-piloto** | Sugere respostas pro humano enquanto ele digita |
| **Curador** | Processa leads em massa (reativar base fria, qualificação em lote) |

### RAG por tenant (a "mágica" da personalização)

A IA consulta a **base de conhecimento do próprio cliente**:

- Catálogo de produtos/serviços
- FAQ da clínica/imobiliária
- Scripts de venda do cliente
- PDFs de propostas, contratos, precificação
- Histórico de conversas resolvidas (flywheel de auto-aprimoramento)

Você cadastra: o cliente **upload** dos PDFs na pasta `knowledge/` do tenant. A IA processa, gera embeddings (pgvector), e passa a responder com base neles.

### Sentimento e handoff

Cada mensagem é classificada em:

- `positivo` / `neutro` / `negativo`
- `lead_quente` / `lead_frio` / `insatisfeito`
- `handoff_solicitado` (palavras-chave + baixa confiança)

Se der qualquer `negativo` ou `insatisfeito`: **mensagem para o humano entrar**, com resumo do contexto e sugestão de resposta.

### Budget e governança

Cada tenant tem **budget mensal de IA** (ex.: US$ 50/mês). Quando estourar:

- IA pausa sozinha
- Atendentes humanos continuam
- Alerta vai pro painel admin

**Isso evita a "novela" do invoice de IA no fim do mês.**

---

## 2.7 Ads — como se integra

### Por que a gestão de anúncios é parte do pacote (e não opcional)

A captação alimenta o CRM. Se o cliente tem CRM mas não tem lead, **a mensalidade dele morre em 90 dias**. Se a gente controla os anúncios, a gente controla o volume de leads → a mensalidade se sustenta.

### Setup técnico

#### Meta Ads (Instagram + Facebook)

1. **Business Manager do cliente** (a gente pede acesso via `gerenciar conta` ou usa a BM da agência com portfolio)
2. **Pixel Meta** instalado na LP via `<head>` (Next.js: `<Script>` no `layout.tsx`)
3. **API Conversions** ativada (mais robusto que pixel-only)
4. **Eventos rastreados**: `PageView`, `Lead`, `Contact` (WhatsApp clique), `Purchase` (quando aplicável)

#### Google Ads

1. **Conta Google Ads** do cliente (ou MCC da agência)
2. **Google Tag** instalado (substitui `gtag.js`)
3. **Conversões offline importadas via API** (lead virou venda no CRM → volta pro Google como conversão)
4. **Google Analytics 4** espelhado pro funil

#### TikTok Ads (opcional, pacote Domina)

- Pixel TikTok
- Eventos: `PageView`, `Lead`, `CompletePayment`

### Dashboards

Relatório mensal mostra:

- Custo por lead (CPL)
- Custo por lead qualificado (lead quente)
- Custo por cliente (CPA)
- ROAS (quando aplicável, e-commerce)
- Comparação mês a mês + por campanha

---

## 2.8 LGPD — como a arquitetura já cuida

O DeskcommCRM é **LGPD by-design**:

- **Export de dados do titular** (rota `/api/v1/lgpd/export`)
- **Redact / anonimização** em cascata (rota `/api/v1/lgpd/redact`)
- **Consentimento auditado** (timestamp, IP, versão dos termos)
- **Audit log append-only** com retenção de 5 anos
- **Anonimização preferida sobre delete** (mantém métrica sem expor PII)
- **PII sanitizada no Sentry** antes de enviar (cpf/telefone/e-mail removidos)

> Leia [10-riscos-lgpd-e-contratos.md](10-riscos-lgpd-e-contratos.md) pra entender o que **você** precisa fazer pro cliente estar em conformidade (DPA, política de privacidade, termo de consentimento no formulário).

---

## 2.9 Onde o DeskcommCRM **não** cobre (compras complementares)

| Necessidade | Solução complementar | Custo |
|---|---|---|
| E-mail marketing (nurturing) | **Resend** já integrado p/ transacional; nutrir demanda separado (Brevo, Mailchimp, ActiveCampaign). | R$ 0–200/mês |
| Editor de página sem código p/ cliente alterar LP | Sanity, Payload, Notion como CMS | R$ 0–300/mês |
| Assinatura digital de contrato | ClickSign, Clicksign, Autentique | R$ 0–80/mês |
| BI avançado (Looker, PowerBI) | BigQuery + Looker Studio | R$ 0–100/mês |
| Telefonia VoIP | Direct Talk, Microosft Teams, etc. | Variável |

Essas são **complementos opcionais** cobrados à parte (markup razoável). Mantém a oferta principal enxuta.

---

Próximo: [03-pacotes-e-precos.md](03-pacotes-e-precos.md) — o que entra em cada pacote e quanto cobrar.
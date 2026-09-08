# 05 — Onboarding 7 Dias

> Do contrato assinado ao sistema operando com lead real chegando no CRM. Cronograma executado **em paralelo**, não sequencial. Assim você entrega mais rápido que o concorrente.

---

## 5.1 Visão geral (cronograma)

```
D+0 (seg) — Contrato + kickoff
D+1 (ter) — Infra + dados
D+2 (qua) — Site + LPs (staging)
D+3 (qui) — CRM + IA + WhatsApp (staging)
D+4 (sex) — Testes + primeiro lead piloto
D+5 (seg) — Go-live + publicação
D+6-7     — Handoff + treinamento + ajustes finos
```

Paralelo o tempo todo:
- **Thread 1 (você)**: Site, landing, deployment
- **Thread 2 (seu assistente, ou você revezando)**: CRM, IA, WhatsApp
- **Thread 3 (cliente)**: coleta de dados, aprovações, treinamento

---

## 5.2 D+0 (Segunda) — Contrato + Kickoff

### Seu lado

**Manhã: 1h**
1. Cliente assina e paga 50% do setup (Pix/boleto)
2. Cria pasta do cliente no seu Drive: `/clients/ClienteName-PackageStart` com subpastas:
   - `docs/` (contrato, notas, briefing)
   - `assets/` (logos, cores, PDFs pra RAG)
   - `credentials/` (senhas, tokens — criptografado)
   - `deployment/` (VPS acesso, banco dados, domínio)
3. Cria task/ticket no seu CRM interno (Notion, Linear, etc): "ClienteName Start — go-live D+5"

**Tarde: 2h — Kickoff call (30 min)**
- [ ] Agenda: 30 min com cliente + você
- [ ] Pauta:
  - Confirma ICP: "qual seu nicho? (clínica/imobiliária/e-commerce)" → dita o pipeline/vocabulário no CRM
  - Coleta telefone(s) WhatsApp Business (tira screenshot do WhatsApp Business da empresa)
  - Tira screenshot do domínio (ex: `cliente.com.br`) — confirma quem controla DNS
  - Pede 5 PDFs máximo pra base de IA (FAQ, catálogo, preço, script de venda, case study)
  - Coleta nome/telefone/email de até 3 contatos finais (quem vai usar o CRM)
  - Combina: próxima call semanal (D+5 pela manhã, go-live together)
- [ ] Manda após a call:
  - Documento interno (à você) com resumo do briefing
  - E-mail confirmando prazos + próximo encontro
  - Convite pro seu Slack ou WhatsApp (você escolhe o canal de suporte)

### Cliente precisa fornecer (ou você avisa que vai cobrar extra)

- [ ] Logotipo (PNG transparente, 500×500px mínimo)
- [ ] Cores da marca (hex codes — ex: `#FF6B35`)
- [ ] Conteúdo do site (texto, imagens — ou você cobra copywriting à parte)
- [ ] Acesso Google Ads / Meta Ads (Business Manager ou Manager Account)
- [ ] Acesso ao DNS do domínio (ou confirma que você gerencia tudo)
- [ ] PDFs para base de IA (até 5)
- [ ] Telefone WhatsApp Business (com screenshot comprovante)

---

## 5.3 D+1 (Terça) — Infra + Dados

### Thread 1: Infra (seu assistente OU você — 3h)

- [ ] Aciona HostGator: "nova VPS pra cliente, link de parceria"
  - Nota: leva ~30 min até provisionar
  - Recebe IP, SSH, senha root
- [ ] SSH na VPS:
  ```bash
  ssh root@123.45.67.89
  cd /home && git clone https://github.com/melgarafael/DeskcommCRM.git deskcomm
  cd deskcomm/hostgator-setup-kit
  bash install.sh  # roda tudo: Docker, Caddy, Supabase local (ou cloud), env vars
  ```
- [ ] Configura `.env`:
  - `ANTHROPIC_API_KEY=sk-...` (sua chave, ou cria chave por tenant se quiser)
  - `WAHA_API_KEY=...` (de [waha.devlikeapro.com](https://waha.devlikeapro.com)
  - `SUPABASE_URL=...` (local ou cloud)
  - `DOMAIN=cliente.com.br` (vai usar pra SSL automático)
- [ ] Testa health check: `curl http://VPS_IP:3000/api/v1/health` → deve retornar `{\"status\":\"ok\"}`
- [ ] Nota num arquivo `./DEPLOYMENT.txt`:
  ```
  VPS IP: 123.45.67.89
  SSH user: root
  App: http://123.45.67.89:3000 (staging)
  CRM: http://123.45.67.89:3001 (staging)
  WAHA: http://123.45.67.89:3002 (staging)
  DNS A record → 123.45.67.89
  ```

### Thread 2: Dados (cliente — 2h paralelo)

- [ ] Cliente confirma: logotipo, cores, PDFs de IA
- [ ] Você faz upload dos PDFs no CRM (staging) → IA já começa a processar embeddings

---

## 5.4 D+2 (Quarta) — Site + Landing Pages

### Thread 1: Site + LPs (você — 4h)

Assumindo você tem **template Next.js pronto** (shadcn/ui, Tailwind, componentes reutilizáveis):

1. **Cria novo repo** `git clone seu-template cliente-website`
2. **Customiza**:
   - Substitui logo, cores, favicon
   - Edita homepage (Hero, About, Services, Testimonials, Contact)
   - Cria **1 LP de captação** (`/lp/black-friday` ou `/get-lead`)
   - LP tem: formulário + WhatsApp button + pixel Meta + tag Google
3. **Deploy pré-produção** (Vercel):
   - Vercel detecta repo automaticamente
   - Build roda, deploy em ~2 min
   - URL: `staging-cliente.vercel.app`
4. **Testa**:
   - Pixel Meta funciona? (abrir DevTools → Network → verificar `tr?` request)
   - Google tag carrega? (verificar `gtag()` no console)
   - Formulário envia? (testar POST pra `/api/v1/webhooks/in/TOKEN`)
   - WhatsApp Web clicável? (em mobile, `wa.me/...` abre?)
5. **Pronto pra revisão**: manda link staging pro cliente

### Thread 2: CRM + IA (assistente OU você — 3h paralelo)

- [ ] Acessa CRM em staging: `http://123.45.67.89:3001`
- [ ] **Setup inicial no banco**:
  ```bash
  # Na VPS, dentro do container Next.js
  npm run db:migrate  # aplica schema
  ```
- [ ] **Cria organização do cliente**:
  - Admin portal do Deskcomm (você tem acesso super-admin)
  - Novo tenant: nome, domínio, telefone WhatsApp
- [ ] **Configura pipeline**:
  - Vocabulário: `lead` → `cliente` / `paciente` / `comprador` (conforme nicho)
  - Estágios: ex Imobiliária: "Lead novo" → "Interessado" → "Em visitação" → "Ganho" / "Perdido"
- [ ] **Configura agente IA**:
  - Upload PDFs do cliente → RAG indexação começa
  - Prompt base: "Você é assistente de vendas da [Nome cliente]. Responda em português. Ofereça [serviço]. Se não souber, transfira pro humano."
  - Budget IA: RS$ 50/mês no pacote Start
- [ ] **Configura WAHA**:
  - Número WhatsApp do cliente adicionado (requer QR code scan)
  - Webhook pra receber mensagens → CRM
  - Testa: manda msg de teste no WhatsApp → deve chegar no CRM inbox

### Saída esperada

- [ ] Site staging pronto em Vercel (`staging-cliente.vercel.app`)
- [ ] CRM acessível em VPS staging (`http://123.45.67.89:3001`)
- [ ] Agente IA respondendo no WhatsApp (piloto com seu número)

---

## 5.5 D+3 (Quinta) — Testes + Primeiro Lead Piloto

### QA (você + assistente — 2h)

**Checklist de testes** (rodar tudo em staging, não produção ainda):

- [ ] **Site**
  - [ ] Site carrega rápido (Lighthouse > 80)
  - [ ] SEO básico (meta title, meta description, sitemap.xml)
  - [ ] Pixel Meta + Google tag funcionam (inspecionar request)
  - [ ] LP formulário envia → webhook POST
  
- [ ] **CRM**
  - [ ] Login funciona (criar usuário teste do cliente)
  - [ ] Inbox carrega mensagens (já tem as de piloto do WhatsApp)
  - [ ] Kanban arrasta lead entre estágios (fractional indexing)
  - [ ] Automação dispara (ex: novo lead → tag auto + mensagem de boas-vindas)
  
- [ ] **IA + WhatsApp**
  - [ ] Mensagem no WhatsApp recebida no CRM < 30s
  - [ ] Agente responde em < 30s
  - [ ] Resposta faz sentido (consultou RAG, não alucinação)
  - [ ] Handoff manual funciona (virar de atribuição IA → humano)

**Primeiro lead piloto** (você faz isso):
1. Preenche formulário da LP → deve chegar no CRM como novo lead, etapa "Lead novo"
2. Dispara automação: tag + mensagem WhatsApp de boas-vindas enviada?
3. Responde via WhatsApp → agente pega, responde, qualifica?
4. Marca como ganho → métrica registra (tempo de conversão, etc.)?

### Feedback loop com cliente (30 min call)

- [ ] Manda link de staging pro cliente testar
- [ ] Cliente testa site, landing, WhatsApp
- [ ] Coleta feedback:
  - "Preciso mudar cor de botão?"
  - "Conteúdo está ok?"
  - "A IA respondeu certo?"
- [ ] Anota mudanças urgentes pra D+4
- [ ] Confirma: em 24h vai pro ar (produção)

---

## 5.6 D+4 (Sexta) — Ajustes + Go-live

### Manhã: Alterações (1–2h)

- [ ] Aplica feedback de cliente (cores, textos, pequenas mudanças)
- [ ] Re-deploya site Vercel (auto)
- [ ] Testa novamente os checkpoints críticos

### Tarde: Go-live (2–3h)

**Site + Landing Pages**:
1. [ ] Aponta domínio `cliente.com.br` pra Vercel (CNAME record)
2. [ ] Vercel automático SSL (Let's Encrypt)
3. [ ] Testa: `https://cliente.com.br` carrega do domínio próprio ✅

**CRM + WhatsApp**:
1. [ ] Aponta domínio `app.cliente.com.br` pra VPS (A record)
2. [ ] Caddy (reverse proxy) atualiza certificado SSL (`app.cliente.com.br`)
3. [ ] Acessa `https://app.cliente.com.br` → funciona ✅
4. [ ] Remove "staging" do título do app
5. [ ] Número WhatsApp **ativado de verdade** (não mais teste)

**Anúncios**:
1. [ ] Meta/Google pixel aponta pra domínio de produção (não staging)
2. [ ] Primeiras campanhas pausadas (preparadas mas paradas)
3. [ ] Você faz QA: clique em anúncio teste → se houver → funciona?

---

## 5.7 D+5 (Segunda) — Handoff + Treinamento (4h)

### Kickoff ao vivo com cliente (1h30)

**Call com 3 pessoas**:
- Você (agência)
- Cliente (gerente/dono)
- Até 2 atendentes do cliente (quem vai responder WhatsApp)

**Pauta**:
1. **Visão geral** (10 min)
   - "Seu site está no ar em `cliente.com.br`"
   - "Seu CRM está em `app.cliente.com.br` — aqui chegam os leads"
   - "A IA responde no WhatsApp 24/7 — aqui é a magia"

2. **Demo** (15 min)
   - Mostra site funcionando
   - Preenche LP formulário ao vivo → lead aparece no CRM inbox em tempo real
   - Agente IA responde no WhatsApp
   - Marca como ganho / perdido
   - Mostra métricas (quanto tempo demorou, taxa de qualificação)

3. **Quem faz o quê** (15 min)
   - "Vocês veem o lead no CRM"
   - "Se a IA qualificou direto, virou cliente já"
   - "Se não qualificou, vocês intervêm — digitem normalmente"
   - "Nunca desliguem o agente — ele aprende com cada conversa"

4. **SLA + Suporte** (5 min)
   - "Qualquer dúvida: me chama no WhatsApp"
   - "Respondo em até 24h"
   - "Relatório mensal sai no dia 27"

5. **Próximos passos** (5 min)
   - "D+6 você liga a primeira campanha de anúncios — vamos otimizar junto"
   - "Mês que vem revisamos: IA tá acertando? Lead tá vindo? Precisa ajustar algo?"

### Admin training (30 min — opcional, pra gerente do cliente)

- [ ] Como acessar CRM (2FA, password manager)
- [ ] Como ler o painel de métricas
- [ ] Como criar automação nova (QUANDO/SE/ENTÃO)
- [ ] Como alterar pipeline / estágios se precisar
- [ ] Como baixar relatório de leads

---

## 5.8 D+6-7 (Terça–Quarta) — Ajustes finos + Ads ligadas

### D+6: Ajustes finais (2h)

Cliente começa a usar. Pode aparecer bugs pequenos (typo, cores, fluxo). Você resolve no mesmo dia.

- [ ] Qualquer feedback urgente de cliente
- [ ] Testa novamente fluxo completo: anúncio → landing → lead → IA → CRM

### D+7: Primeiro dia de leads reais (você acompanha — 2h)

Se cliente autorizou, você **liga a primeira campanha de anúncios** (Meta ou Google):

1. [ ] Ativa 1 campanha de teste (budget pequeno: R$ 50/dia)
2. [ ] Acompanha em tempo real:
   - Cliques chegando?
   - Leads criados no CRM?
   - IA respondendo?
   - Pixel Meta/Google registrando conversão?
3. [ ] Qualquer problema, para tudo e explica pro cliente

---

## 5.9 Checklist de go-live (validar antes de liberar)

- [ ] [ ] Domínio aponta pra site (não Vercel staging, mas domínio próprio)
- [ ] [ ] Site carrega > 80 Lighthouse score
- [ ] [ ] SSL válido em `cliente.com.br` e `app.cliente.com.br`
- [ ] [ ] CRM acessível com 3 usuários teste (admin + 2 atendentes)
- [ ] [ ] WhatsApp número ativo, respondendo com IA
- [ ] [ ] Pelo menos 1 lead já processado (piloto seu)
- [ ] [ ] Automações funcionando (novo lead = tag + msg boas-vindas)
- [ ] [ ] Métricas painel aparecem (tempo resposta, taxa qualificação)
- [ ] [ ] Anúncios pixel funciona (abrir inspector, ver requisição)
- [ ] [ ] Cliente fez login com sucesso no CRM
- [ ] [ ] Cliente recebeu treinamento (reunião gravada ou áudio)
- [ ] [ ] Suporte établecido (WhatsApp, email, Slack — escolhido)

---

## 5.10 Ordem de prioridades se atraso

Se algo não der tempo, **nessa ordem de sacrifício**:

1. **TikTok Ads** (opcional, só Domina) → cai fora sem problema
2. **BI avançado / custom reports** → versão simples no Recharts bastam
3. **Integração com Shopify / VTEX** → vai pra semana 2
4. **Multi-agente specializado** → começa com 1 agente genérico
5. **Blog / conteúdo inicial** → primeira postagem entra pra semana 2

**NÃO SACRIFICA**:
- Domínio próprio (fundamental pro cliente)
- CRM no ar (é o core)
- Agente IA respondendo (é o diferencial)
- Primeiro lead piloto testado (prova que funciona)

---

## 5.11 Após onboarding (semana 2+)

- **D+10**: Primeiro relatório mensal (mês parcial, mesmo assim)
- **D+14**: Call de alinhamento mensal (virou routine)
- **D+30**: Revisar: IA tá acertando? Ads tá convertendo? Precisa ajuste?
- **D+60**: Conversa de upsell (se cliente tá feliz)

---

Próximo: [06-mensalidade-de-gestao.md](06-mensalidade-de-gestao.md) — o que você faz todo mês.
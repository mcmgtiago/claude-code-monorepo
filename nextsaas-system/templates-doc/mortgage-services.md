---
slug: mortgage-services
nome: Nexsas Mortgage Services
nicho: Fintech / Mortgage lending (home purchase, refinance, reverse mortgage, eligibility check)
estilo: SaaS corporativo moderno, design system Nexsas compartilhado com o bundle, paleta roxa + cyan + amarelo + verde lima como acentos, dark mode nativo
qualidade: 5
paleta_principal: "#864ffe (primary-500 roxo) + #1a1a1c (secondary/preto) + #fcfcfc (accent/branco) + #83e7ee (ns-cyan) + #f9eb57 (ns-yellow) + #c6f56f (ns-green) + #ffb9a2 (ns-red/coral)"
fonte_titulo: Inter Tight
fonte_corpo: Inter Tight
densidade_secoes: alta
uso_recomendado: Landing page para empresas de mortgage lending, fintechs de home financing, plataformas de refinance, brokers digitais de crédito imobiliário, comparadores de taxa hipotecária
limitacoes: Mesmo design system do bundle Nexsas — diferenciação mortgage é só de copy/imagens, sem calculadora de mortgage real (apenas form de email no hero), sem gráfico de amortization/rate comparison; três cards de feature repetem idêntico título "Flexible loan terms" com imagens diferentes (bug evidente); copy do feature section mistura oferta de serviços criativos ("visual identity, high-performing website, design system") que não fazem sentido em mortgage; template {=$bg-gradient-class}/{$bg-gradient-img} espalhado no footer (placeholder não resolvido); arkitetura HTML de 3794 linhas com 47 páginas idênticas ao bundle base
---

# Nexsas Mortgage Services

Template do mega bundle NextSaaS (StaticMania) focado em mortgage lending. Compartilha 100% do design system, tokens CSS, fontes e estrutura de páginas do bundle Nexsas base — a única diferenciação é a copy (termos como "mortgage solutions", "home purchase", "refinance", "eligibility check") e troca dos mockups ilustrativos do hero/cards.

## Páginas disponíveis

47 arquivos HTML (mesmo set do bundle base):

- **Core:** `index.html`, `about.html`, `contact.html`
- **Produto/Serviços:** `services.html`, `service-details.html`, `features.html`, `use-case.html`, `integration.html`, `process.html`
- **Conversão:** `pricing.html`, `affiliates.html`, `referral-program.html`, `download.html`, `whitepaper.html`, `whitepaper-details.html`
- **Conteúdo:** `blog.html`, `blog-details.html`, `case-study.html`, `case-study-details.html`, `success-stories.html`, `tutorial.html`, `glossary.html`, `changelog.html`
- **Social proof:** `customers.html`, `customer-details.html`, `testimonial.html`, `team.html`, `team-details.html`, `press.html`, `brandkit.html`
- **Carreira:** `career.html`, `career-details.html`, `our-manifesto.html`
- **Suporte:** `faq.html`, `documentation.html`, `support.html`, `security.html`
- **Auth:** `login.html`, `signup.html`, `analytics.html`
- **Legais/Utilitários:** `404.html`, `gdpr.html`, `legal.html`, `privacy-policy.html`, `terms-conditions.html`, `refund-policy.html`, `affiliate-policy.html`, `why-choose-us.html`

## Seções (index.html)

Identificadas via grep dos comentários `<!-- ========================= -->` no HTML:

1. **Header** — sticky pill centralizado (max-width 1140px em xl) com mega-menus (Company, Pages, Blog, Shop, Integrations, More) + theme toggle (claro/escuro)
2. **Mobile Menu** — off-canvas (não visível no grep, mas presente na estrutura padrão Nexsas)
3. **Hero section** (L2093) — bg com gradiente/svg abstrato (`ns-img-128.svg`/`ns-img-dark-97.svg`), H1 "Smart, simple, and stress-free mortgage solutions.", form de email "Get a free quote" + cluster visual complexo com 4 mockups flutuantes: yellow badge, credit limit card com progress bar animada, visa card, transfer success card, green badge, personal loan card, total balance card
4. **Solution section** (L2416) — "Tailored lending solutions, crafted just for you." — 3 cards (Home Purchase, Refinance, Reverse Mortgage) cada um com ícone `ns-shape-46`, heading e CTA "Get a free consultation"
5. **Why choose us section** (L2501) — "Why choose Nexsas" — 6 features divididas em duas colunas (left/right) com ícones `ns-shape-*` (13, 41, 36, 35, 34, 27), bloco central com ilustração
6. **Steps section** (L2672) — "Application Steps" — 3 steps horizontais com progress bar animada (25%/0%/0% inicial, anima ao scroll via `data-ns-animate`): "01 Apply online / 02 Get approved / 03 Close with confidence" + botão "Start your application" → `process.html`
7. **Feature section** (L2772) — "Designed for every homebuyer." — 3 cards em grid (12-col) com imagem (`ns-img-129/130/131.png` + dark variants). **Bug:** todos os 3 cards repetem título idêntico "Flexible loan terms" (deveriam ser 3 features distintas como "Flexible terms", "Low rates", "Fast approval")
8. **Eligibility section** (L2871) — "Check your eligibility in seconds." — card branco rounded-4xl com lista de requisitos (checkmarks `checkmark-dark.svg`), CTA "Check eligibility"
9. **Testimonial section** (L2990) — "What our clients say." — Swiper com 5 slides, cada card com gradient overlay (`ns-img-501.png`), avatar, quote, autor
10. **Contact us section** (L3199) — "Still have questions?" — info de contato (telefone, email, endereço) + form (fullName, emailAddress, messages, agree-terms checkbox)
11. **CTA section** (L3363) — "Ready to take the first step?" — card dark rounded-4xl com bg gradients decorativos (`ns-img-502.png` em ambos os cantos), botão "Start application" → `contact.html`
12. **Footer** (L3425) — `footer-three` dark, logo (light/dark variants), descrição, social links, colunas de links, theme toggle

## Recursos visuais

- **Design tokens (CSS custom properties em `assets/main.css`):**
  - Primary: `#864ffe` (primary-500), com escalas 50 (`#f4f2fe`), 400 (`#a585ff`), 600 (`#7c31f6`)
  - Secondary: `#1a1a1c` (preto quase puro)
  - Accent: `#fcfcfc` (branco off)
  - Backgrounds: `#fcfcfd` (1), `#f9fafb` (2), `#f4f5f8` (3), `#f0f2f6` (4), `#13171e` (5), `#0f1217` (6), `#181d26` (7), `#070b10` (8), `#1f252f` (9)
  - Strokes: `#dfe4eb` (1), `#e3e7ed` (2), `#d7dde5` (3), `#eceff4` (4), `#1b232f` (5), `#202731` (6), `#2a333e` (7), `#303b49` (8)
  - Cores de destaque (ns-*): yellow `#f9eb57`, green `#c6f56f`, red `#ffb9a2`, cyan `#83e7ee` + variantes light (green-light `#e8fbc6`, cyan-light `#cdf5f8`, yellow-light `#fdf7bc`, ivory `#f4efe7`, linen `#beab9a`)
  - Gradientes: `gradient-6` (cyan → green), `gradient-7` (white → cyan), `gradient-8` (white → primary-400), + 7 variações `bg-linear-[156deg,...]` e 2 gradientes animados 45deg (purple-coral, cyan-yellow)
- **Fontes:**
  - `--font-inter-tight: "Inter Tight", sans-serif` — única família, usada para títulos e corpo
  - `--font-sans` e `--font-mono` (fallbacks do sistema, pouco usados)
  - Icon font custom: `next-sass` (eot/ttf/woff) para os ícones `ns-shape-*`
- **Estrutura CSS:**
  - Tailwind-like utility framework próprio (classes `bg-*`, `text-*`, `flex`, `grid grid-cols-12`, `p-*`, `rounded-*`)
  - Custom properties em `:root` para todos os tokens
  - Animações via `data-ns-animate` + IntersectionObserver (delays 0.2/0.3/0.4/0.5/0.6)
  - Dark mode via classe `.dark` (toggle manual presente em todas as páginas)
  - Swiper.js para carrosséis (testimonials, reviews)
  - Vendor: `vendor/` com Leaflet (mapas), provavelmente para contact page
- **Recursos de imagem:**
  - 184 arquivos em `/images/` (incluindo `/shared/` com logo light/dark variants)
  - Ilustrações abstratas de mortgage: `ns-img-128.svg` (hero bg), `ns-img-129/130/131.png` (features), `ns-img-dark-97/98/99.png` (dark variants), `ns-img-501/502.png` (gradientes decorativos)
  - Ícones em `/images/icons/checkmark-dark.svg` e `checkmark-white.svg`
  - Hero com cluster visual complexo de 7 cards flutuantes (credit limit, visa card, transfer, personal loan, total balance + badges)

## Notas de qualidade

**Pontos fortes:**
- Visual moderno e polido — o cluster de mockups flutuantes no hero é sofisticado
- Sistema de animação `data-ns-animate` bem estruturado com delays incrementais (0.2s em diante) cria sensação de reveal orgânico
- Dark mode nativo com variants dedicadas (`dark:` prefix + imagens `ns-img-dark-*`) — bem implementado para um template estático
- 47 páginas dão cobertura completa de um SaaS real (auth, legal, blog, careers, docs)
- Tokens CSS muito bem organizados (12 backgrounds, 9 strokes, 9 ns-* accent colors)
- Copy de mortgage é crível e específica do nicho ("Tailored lending solutions", "Close with confidence", "Check your eligibility in seconds")

**Pontos fracos:**
- **Bug crítico na feature section:** os 3 cards "Flexible loan terms" são cópias exatas com H3 idêntico e mesmo parágrafo — só a imagem muda. Falta edição final do template
- **Copy inconsistente:** o parágrafo introdutório da feature section oferece serviços criativos ("visual identity, high-performing website, design system") que não fazem sentido em mortgage — texto não foi customizado
- **Hero form superficial:** apenas coleta email (não tem zip code, loan amount, property value — campos essenciais de mortgage). Promete "Get a free quote" mas não tem calculadora real
- **CTA "Get a free consultation"** nos 3 solution cards aponta para âncoras/links genéricos
- **Placeholders não resolvidos:** `{=$bg-gradient-class}` e `{=$bg-gradient-img}` aparecem no footer (template engine artifact)
- **Sem gráficos financeiros:** nenhum chart de amortization, comparison de rates, ou projection de pagamento
- **Mockups ilustrativos são genéricos:** os 7 cards flutuantes do hero (credit limit, visa, transfer, balance) parecem screenshots de um app de banking genérico, não de mortgage
- **Footer-three + theme toggle** repetidos em todas as 47 páginas = muito HTML duplicado, bundle pesado
- **Diferenciação por nicho é superficial:** trocar "fintech analytics" por "mortgage" no mesmo design system fica claro que é template, não produto real
- **Localização:** tudo em inglês americano, zero estrutura para PT-BR ou outros mercados

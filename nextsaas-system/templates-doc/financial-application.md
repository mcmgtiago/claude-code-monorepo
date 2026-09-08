---
slug: financial-application
nome: Nexsas Financial Application
nicho: Fintech / Aplicação financeira (gestão de dinheiro, investimentos, analytics financeiro)
estilo: SaaS corporativo moderno, dark mode primário, copy genérico-adaptação financeira sobre o mesmo design system Nexsas
qualidade: 6
paleta_principal: "#864ffe (primary-500 roxo) + #1a1a1c (secondary/preto) + #fcfcfc (accent/branco) + #83e7ee (ns-cyan) + #f9eb57 (ns-yellow) + #c6f56f (ns-green)"
fonte_titulo: Inter Tight
fonte_corpo: Inter Tight
densidade_secoes: média
uso_recomendado: Landing page para fintechs, apps de gestão financeira pessoal, plataformas de investimento, ferramentas de analytics financeiro, consultoria financeira digital
limitacoes: Mesma identidade visual do bundle Nexsas — diferenciação financeira é só de copy, sem mockups de dashboard real, sem gráficos de cotações/wallets/transações; copy placeholder {=$class} espalhado pelo HTML; seções financeiras não exploram profundidade (ex: FAQ só com 4 itens)
---

# Nexsas Financial Application

Template do mega bundle NextSaaS (StaticMania) focado em aplicação financeira. Compartilha 100% do design system, tokens CSS e estrutura do bundle Nexsas — a única diferença em relação a `crypto-marketing` é a copy (termos como "financial efficiency", "invest your money", "financial consulting").

## Páginas disponíveis

47 arquivos HTML (mesmo set do bundle base):

- **Core:** `index.html`, `about.html`, `contact.html`
- **Produto/Serviços:** `services.html`, `service-details.html`, `features.html`, `use-case.html`, `integration.html`, `process.html`
- **Conversão:** `pricing.html`, `affiliates.html`, `referral-program.html`, `download.html`, `whitepaper.html`, `whitepaper-details.html`
- **Conteúdo:** `blog.html`, `blog-details.html`, `case-study.html`, `case-study-details.html`, `success-stories.html`, `tutorial.html`, `glossary.html`, `changelog.html`
- **Social proof:** `customer.html`, `customer-details.html`, `testimonial.html`, `team.html`, `team-details.html`, `press.html`, `brandkit.html`
- **Carreira:** `career.html`, `career-details.html`, `our-manifesto.html`
- **Suporte:** `faq.html`, `documentation.html`, `support.html`, `security.html`
- **Auth:** `login.html`, `signup.html`, `analytics.html`
- **Legais/Utilitários:** `404.html`, `gdpr.html`, `legal.html`, `privacy-policy.html`, `terms-conditions.html`, `refund-policy.html`, `affiliate-policy.html`, `why-choose-us.html`

## Seções (index.html)

Hero, Services (cards com "Real-time analytics" repetido), About (com bloco de "direction, purpose, and clarity in navigating financial growth"), Integration, FAQ (4 itens com placeholder text), Testimonial (4 depoimentos com scores 4.8–5.0 em ns-green), Blog grid, CTA final, Footer.

Estrutura principal identificada via grep de comentários HTML:

1. **Header** — sticky pill centralizado com mega-menu (Company, Pages, Blog, Shop, Integrations, More)
2. **Mobile Menu** — off-canvas
3. **Hero section** — "Boost your financial efficiency / invest your money to achieve better financial outcomes" + CTAs
4. **Service section** — grid de serviços (analytics, gestão, consultoria)
5. **About section** — narrativa institucional + visual
6. **Integration section** — logos de integrações
7. **FAQ section** — 4 accordion items com copy placeholder
8. **Testimonial section** — 4 cards com nota numérica grande em ns-green
9. **Blog section** — grid de artigos
10. **CTA section** — call to action final
11. **Footer** + **Theme toggle**

## Recursos visuais

- **Design tokens (CSS custom properties em `assets/main.css`):**
  - Primary: `#864ffe` (primary-500), com escalas 50 (`#f4f2fe`), 400 (`#a585ff`), 600 (`#7c31f6`)
  - Secondary: `#1a1a1c` (preto quase puro)
  - Accent: `#fcfcfc` (branco off)
  - Backgrounds: `#fcfcfd` (1), `#f9fafb` (2), `#f4f5f8` (3), `#f0f2f6` (4), `#13171e` (5), `#0f1217` (6), `#181d26` (7), `#070b10` (8), `#1f252f` (9)
  - Strokes: `#dfe4eb` (1), `#e3e7ed` (2), `#d7dde5` (3), `#eceff4` (4), `#1b232f` (5), `#202731` (6), `#2a333e` (7), `#303b49` (8)
  - Cores de destaque (ns-*): yellow `#f9eb57`, green `#c6f56f`, red `#ffb9a2`, cyan `#83e7ee` + variantes light (green-light `#e8fbc6`, cyan-light `#cdf5f8`, yellow-light `#fdf7bc`, ivory `#f4efe7`, linen `#beab9a`)
  - Gradientes: `gradient-7` (white → cyan), `gradient-8` (white → primary-400), + gradientes diagonais animados purple-coral e cyan-yellow
- **Fontes:** Inter Tight (Google Fonts) — único typeface carregado, usada em todos os níveis
- **Tipografia customizada:** `next-sass` (icon font próprio em `fonts/next-sass.{eot,svg,ttf,woff}`)
- **Componentes notáveis:**
  - Header pill fixo no topo com mega-menu
  - Cards com hover em background-3/7
  - Accordion FAQ custom (4 itens)
  - Score numérico gigante (text-[64px] font-light) em ns-green nos testimonials
  - Animações de reveal via `data-ns-animate` + `data-direction` + `data-offset`
- **Dark mode primário:** body abre com `dark:bg-background-7`, alternância via theme toggle

## Notas de qualidade

- **Pro:** Bundle mais completo do mercado (47 HTMLs), design system coeso, dark mode polido, código limpo com utility classes Tailwind, animações bem implementadas, paleta generosa (cores ns-* permitem variação sem perder identidade)
- **Contra:** Copy placeholder repetitivo (texto de FAQ idêntico em 3 dos 4 accordions, "Real-time analytics" duplicado como heading de service cards); placeholder literal `{=$class}` aparece no markup (deve ser variável não processada); diferenciação financeira é puramente cosmética — nenhum gráfico real de cotações, dashboard de wallet, fluxo de transação ou mockup de app financeiro; depende 100% da copy para parecer fintech
- **Veredicto:** Bom ponto de partida se você precisa de 47 páginas cobertas rapidamente e aceita reescrever copy + criar assets financeiros reais (charts, mockups de app). Sem esse trabalho extra, fica indistinguível de um SaaS genérico.

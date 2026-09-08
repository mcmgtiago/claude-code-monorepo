---
slug: decrentralized-finance
nome: Nexsas Decentralized Finance
nicho: DeFi / Web3 (finanças descentralizadas, gestão de ativos digitais, educação DeFi)
estilo: SaaS corporativo moderno sobre o mesmo design system Nexsas; dark mode primário; copy DeFi/Web3 sobre infraestrutura idêntica ao bundle
qualidade: 6
paleta_principal: "#864ffe (primary-500 roxo) + #1a1a1c (secondary/preto) + #fcfcfc (accent/branco) + #83e7ee (ns-cyan) + #f9eb57 (ns-yellow) + #c6f56f (ns-green) + #ffb9a2 (ns-red)"
fonte_titulo: Inter Tight
fonte_corpo: Inter Tight
densidade_secoes: média
uso_recomendado: Landing page para protocolos DeFi, plataformas de gestão de ativos digitais, wallets, ferramentas de yield/lending, educação cripto/DeFi, consultorias Web3
limitacoes: Mesma identidade visual e estrutura do bundle Nexsas — diferenciação DeFi é só de copy ("decentralized", "trustless", "DeFi"); nenhum mockup de wallet, dashboard de staking ou gráfico on-chain real; placeholder {=$class} ainda visível no markup; ausência de FAQ (apenas 5 ocorrências de "faq" sem seção dedicada); blog puxa para tom educacional mas sem trilha de conteúdo progressiva
---

# Nexsas Decentralized Finance

Variação do mega bundle NextSaaS (StaticMania) com skin DeFi/Web3. Comparte 100% do design system, tokens CSS, header pill com mega-menu e estrutura de seções do bundle Nexsas — a diferença é puramente textual: termos como "decentralized", "trustless", "borderless finance", "DeFi", "step by step", "global network (80+ countries)", "Finance is evolving".

## Páginas disponíveis

47 arquivos HTML (mesmo set completo do bundle base):

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

Estrutura identificada via grep de comentários HTML em `index.html` (3.535 linhas):

1. **Header** — sticky pill centralizado com mega-menu (Company, Pages, Blog, Shop, Integrations, More) + Mobile Menu off-canvas
2. **Hero section** — H1 "Secure, scalable, 100% decentralized." com `hero-text-gradient` + subhead "Nexsas brings you borderless, trustless finance—powered by DeFi. Access global tools with zero middlemen and full control." + CTAs duplos
3. **Services section** — "Why Nexsas is the smarter way to manage your digital assets." (3 cards em grid 12 col, col-span-4 desktop)
4. **Feature section** — "Backed by a global network / Loved by more than 2 million folks across 80+ countries!" + bloco de stats (ícones circulares com bg-ns-yellow/red/etc.)
5. **Testimonial section** — "What our users say" + quote "DeFi solutions launched our complete financial ecosystem ahead of time—seamless implementation and true collaboration." (Swiper reviews-swiper com gradient-overlay no slide ativo)
6. **Blog section** — "Learn defi, step by step / New to defi? we've got you covered with beginner-friendly guides and insights." (3 artigos com card hover scale-102%)
7. **CTA section** — "Finance is evolving. are you ready? / Sign up for free and experience secure, decentralized financial tools with no borders and no limits"
8. **Footer** + **Theme Toggle Button**

## Recursos visuais

- **Design tokens (CSS custom properties em `assets/main.css`):**
  - Primary: `#864ffe` (primary-500), com escalas 50/100/400/600
  - Secondary: `#1a1a1c` (preto quase puro)
  - Accent: `#fcfcfc` (branco off)
  - Backgrounds: `#fcfcfd` (1), `#f9fafb` (2), `#f4f5f8` (3), `#f0f2f6` (4), `#13171e` (5), `#0f1217` (6), `#181d26` (7), `#070b10` (8), `#1f252f` (9)
  - Strokes: `#dfe4eb` (1), `#e3e7ed` (2), `#d7dde5` (3), `#eceff4` (4), `#1b232f` (5), `#202731` (6), `#2a333e` (7), `#303b49` (8)
  - Cores ns-*: yellow `#f9eb57`, green `#c6f56f`, red `#ffb9a2`, cyan `#83e7ee`, + light variants (green-light `#e8fbc6`, cyan-light `#cdf5f8`, yellow-light `#fdf7bc`, ivory `#f4efe7`, linen `#beab9a`)
  - Gradientes: `gradient-7` (white → cyan), `gradient-8` (white → primary-400 #a585ff), `hero-text-gradient` aplicado no H1
- **Fontes:** Inter Tight (Google Fonts, weight 100-900) — único typeface carregado
- **Tipografia customizada:** `next-sass` (icon font próprio em `fonts/next-sass.{eot,svg,ttf,woff}`)
- **Componentes notáveis:**
  - Header pill fixo (`top-5`, `backdrop-blur-[25px]`) com mega-menu
  - Hero com `hero-text-gradient` + `hero-text-color-1` (gradient-8)
  - Cards de service com hover em background-3/7
  - Stats block com ícones circulares coloridos (ns-yellow, ns-red, ns-green, ns-cyan)
  - Testimonials em Swiper com `gradient-overlay` no slide ativo
  - Blog cards com `hover:scale-[102%]`
  - 69 ocorrências de `data-ns-animate` (reveal on scroll via IntersectionObserver)
- **Dark mode primário:** body `dark:bg-black`, alternância via theme toggle

## Notas de qualidade

- **Pro:** Bundle mais completo do mercado (47 HTMLs), design system coeso, dark mode polido, código limpo com utility classes Tailwind, animações bem implementadas (69 hooks data-ns-animate), paleta generosa (cores ns-* permitem variação sem perder identidade), hero com gradient text reforça o pitch DeFi
- **Contra:** Diferenciação DeFi é puramente cosmética — nenhum mockup de wallet, dashboard de staking, gráfico on-chain, fluxo de swap ou transação blockchain; placeholder literal `{=$class}` aparece no markup (deve ser variável não processada); ausência de FAQ no `index.html` (template tem `faq.html` mas a home não inclui seção de perguntas frequentes — relevante para DeFi onde "what is DeFi?" é pergunta esperada); copy ainda genérica ("Nexsas offers a smarter approach to managing your digital assets") poderia explorar mais jargão Web3 real (TVL, APY, smart contracts, on-chain); stats "2 million folks / 80+ countries" parecem inflados para um template
- **Veredicto:** Bom ponto de partida se você precisa de 47 páginas cobertas rapidamente e aceita reescrever copy + criar assets DeFi reais (wallet UI, swap flow, charts on-chain, staking dashboard). Sem esse trabalho extra, fica visualmente indistinguível de um SaaS genérico com palavras "DeFi" coladas.
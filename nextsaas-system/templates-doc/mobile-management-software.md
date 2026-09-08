---
slug: mobile-management-software
nome: Nexsas Mobile Management Software
nicho: Mobile Device Management (MDM) / Enterprise SaaS
estilo: SaaS moderno com ilustrações 3D e gradientes orgânicos
qualidade: 8
paleta_principal: "#864ffe"
fonte_titulo: Inter Tight
fonte_corpo: Inter Tight
densidade_secoes: alta
uso_recomendado: Landing page para software MDM/MAM, gestão de frotas mobile, segurança enterprise de dispositivos, apps de controle parental ou corporativo.
limitacoes: Texto institucional genérico (lorem-like em vários blocos). Copy mistura MDM com "device strategy" e "money management" — texto precisa ser revisto. Dark mode funcional mas usa mesma foto com filtro (não é redesign dedicado). Estrutura 100% Tailwind v4 — acoplada ao design system do bundle.
---

# Nexsas Mobile Management Software

Template do bundle NextSaaS (StaticMania) focado em **Mobile Device Management**. Identidade visual segue o padrão Nexsas: roxo primário (`#864ffe`), neutros quentes, fundo claro (`#fcfcfd`) com dark mode espelhado em quase todos os componentes. Construído com **Tailwind CSS v4** (variáveis CSS em `:root`), fonte única **Inter Tight** (300–900) e icon font customizada (`next-sass`).

## Páginas disponíveis

47 arquivos HTML cobrindo fluxo completo de SaaS marketing:

- **Core:** index, about, contact, services, features, pricing
- **Produto:** analytics, integration, security, documentation, download, changelog
- **Auth:** login, signup
- **Conteúdo:** blog, blog-details, case-study, case-study-details, whitepaper, whitepaper-details, tutorial, use-case, faq, glossary, glossary-details
- **Social proof:** customers, customer-details, success-stories, testimonial, team, team-details
- **Empresa:** career, career-details, our-manifesto, process, why-choose-us
- **Comercial:** affiliate-policy, affiliates, referral-program, brandkit, press
- **Legal:** legal, privacy-policy, terms-conditions, refund-policy, gdpr
- **Util:** 404

Todas as páginas compartilham o mesmo header (fixo, pill-shape, mega-menu) e footer v3.

## Seções (index.html)

1. **Header v1** — pill flutuante com mega-menu "Explore" + mega-menu "Utility pages", logo, CTA, dark mode toggle, hamburger mobile com sidebar full-height.
2. **Hero** — H1 "Mobile device management software", 3 micro-badges (Free installation / App version 3.9 / 4.4 rated), 2 CTAs ("Take a product tour" / "Start free trial"), hero image responsiva com variante dark (`ns-img-205.jpg` / `ns-img-dark-140.jpg`).
3. **Steps (3-step stack-cards)** — "Manage any device in 3 easy steps" com cards empilhados (sticky scroll): Download the app → Create your account → Start managing. Cada card tem mockup de app e blur gradient de fundo.
4. **Feature grid 6-up** — "Why teams love Nexsas": 3 itens à esquerda + ilustração central + 3 itens à direita (Enforce passcode policies, Lock devices in kiosk mode, Real-time sync, Remote wipe, Compliance reports, Auto onboarding). Container rounded-4xl com gradient bg image.
5. **Feature mosaic 4-cards** — "What we can do for your device strategy": Product analytics, Creative policy control, Smart feature development, Easy deployment & recovery — grid 7/5/5/7 com `ns-shape-*` icons.
6. **Feature v2 (1+3 cards)** — Hero card "Supercharge your app management" + 3 cards menores (Keep all data protected, Multi-device support, Team collaboration, Seamless sync & backup) com SVGs ilustrativos dark/light variants.
7. **Services — progress steps + demo + download** — Bloco triplo:
   - 3 progress bars numeradas (01 Boost team efficiency / 02 Remote device access / 03 Zero maintenance) com scroll-trigger animation.
   - Demo CTA "Designed for security teams that can't afford downtime" + imagem de serviços + 4 bullet checks.
   - Download section dark com QR code concêntrico + botões Apple Store / Google Play.
8. **Testimonial (swiper fade-in)** — 3 cards com avatar circular, citação, nome, cargo. Navegação prev/next lateral + pagination dots.
9. **CTA final** — Card escuro "Control all devices from one dashboard!" com gradient blur de fundo e botão "Book a demo".
10. **Footer v3** — 4 colunas: brand + descrição + social, Sitemap, Utility pages, Contact info. Bottom bar com copyright + legal links.

## Recursos visuais

- **Paleta completa (extraída de `assets/main.css`):**
  - Primary: `#864ffe` (500), `#7c31f6` (600), `#a585ff` (400), `#f4f2fe` (50)
  - Secondary: `#1a1a1c` / Accent: `#fcfcfc`
  - Backgrounds (light → dark): `#fcfcfd` → `#0f1217` (9 níveis)
  - Strokes: `#dfe4eb` → `#303b49` (9 níveis)
  - Acentos neon: `#f9eb57` yellow, `#c6f56f` green, `#ffb9a2` red, `#83e7ee` cyan
  - Gradientes: `linear-gradient(156deg, #fff 32.92%, #a585ff 91%)`
- **Tipografia:** Inter Tight (300–900), headings escalonados de `4.25rem` (h1) a `1.25rem` (h6).
- **Iconografia:** Icon font custom `next-sass` (`.ns-shape-1` ... `.ns-shape-50+`) usada em features + ícones SVG inline para CTAs/social.
- **Animações:** `data-ns-animate` (delay, direction, offset, duration) + IntersectionObserver; stack-cards com scroll pin; swiper fade-in; publish-circle com bordas concêntricas animadas.
- **Dark mode:** classe `dark` espelha quase todas as surfaces, com variantes `*-dark` de imagens (`.dark:hidden` / `.hidden dark:block`).
- **Componentes reutilizáveis:** `btn-{primary|secondary|accent|white|transparent}` em 4 tamanhos, `badge badge-blur`, `btn-*` com hover transitions, cards `rounded-4xl`.

## Notas de qualidade

**Pontos fortes:**
- Identidade visual coesa e profissional — o roxo + Inter Tight + cards rounded-4xl dão um look "premium SaaS 2025".
- Dark mode genuíno (não é só inversão) com assets pareados.
- Mega-menu rico no header e sidebar mobile bem polida.
- Boa hierarquia: hero → steps → features (3 variações) → services → social proof → CTA.
- Animações scroll-trigger bem calibradas, sem exagero.
- Bundle completo (47 páginas) com cobertura real de funil (auth, legal, careers, blog).

**Pontos fracos:**
- Copy genérica: "Manage Anywhere. Anytime." / "Turpis tortor nunc sed amet..." — vários blocos parecem placeholder.
- Texto contradiz o nicho: "Modern tools make managing your money simpler" aparece na seção de MDM (vazamento de outro template).
- "Daownloads available for iOS" tem typo no original.
- Ícones `ns-shape-*` são monocromáticos simples — sem personalidade de marca.
- Imagens de hero/dashboard são genéricas do bundle, não mostram um MDM real (tablet com analytics abstrato).
- Footer repete bloco de social e-mail com placeholder ("support@nexsas.com" hardcoded).
- Cores neon (`ns-yellow/green/cyan`) definidas mas pouco usadas — dead tokens.

**Veredicto:** 8/10. Template sólido e reutilizável para qualquer SaaS B2B que precise de um MDM/enterprise/IT management angle. Copy precisa ser reescrita e algumas imagens trocadas para soar original. Estrutura HTML limpa e fácil de desmontar.

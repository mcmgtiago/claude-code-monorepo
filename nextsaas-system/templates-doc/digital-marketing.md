---
slug: digital-marketing
nome: Nexsas Digital Marketing
nicho: agência / consultoria de marketing digital
estilo: SaaS moderno, dark mode nativo, vibe agency com cards empilhados e marquee
qualidade: 9
paleta_principal: #864ffe
fonte_titulo: Inter Tight
fonte_corpo: Inter Tight
densidade_secoes: alta
uso_recomendado:
  - Landing de agência de marketing digital / performance / SEO-SEM
  - Portfólio de cases (results marquee) com prova social forte
  - Páginas com bullet "audit" e stack-cards interativos para serviços
limitacoes:
  - Identidade "Nexsas" e copyright "smart application for modern business" em todas as páginas — exige rebranding
  - Tailwind v4-style com `@theme` próprio (tokens `--color-*`); refatorar para outro stack custa
  - Animações dependem da lib interna `ns-animate` em `assets/main.js` (não Framer/GSAP puro)
  - Ícones mistos: SVG inline nas seções + icon font `next-sass` em `/fonts`
  - Imagens mockadas (`ns-img-*`) e avatares precisam ser substituídos por ativos reais
---
# Nexsas Digital Marketing

Mesmo bundle NextSaaS Mega Bundle, com header/footer/componentes compartilhados. A diferença para outros "nichos" do bundle é o tema do index — aqui focado em marketing digital/SEO/automation, com seções de services stack-cards, results marquee e audit gratuito.

## Páginas disponíveis

48 arquivos `.html` na raiz do template:

- Core: `index`, `features`, `pricing`, `services`, `service-details`, `process`, `security`, `integration`, `analytics`, `documentation`
- Auth: `login`, `signup`, `download`, `404`
- Marketing: `about`, `team`, `team-details`, `career`, `career-details`, `why-choose-us`, `our-manifesto`, `press`, `whitepaper`, `whitepaper-details`, `changelog`
- Conteúdo: `blog`, `blog-details`, `case-study`, `case-study-details`, `customer`, `customer-details`, `testimonial`, `success-stories`, `use-case`
- Suporte: `faq`, `support`, `tutorial`, `glossary`
- Empresa: `affiliates`, `affiliate-program`, `referral-program`, `brandkit`
- Legal: `privacy-policy`, `terms-conditions`, `gdpr`, `legal`, `refund-policy`, `affiliate-policy`

Assets em `assets/main.css` (Tailwind compilado + theme tokens custom) e `assets/main.js` (animações, marquee, dropdown, counters). Vendors em `vendor/`: Swiper, Leaflet, GSAP + ScrollTrigger, MotionPath, Lenis smooth-scroll, SplitText, vanilla-infinite-marquee, stack-card, number-counter.

## Seções (index.html)

1. **Header v1 (pill)** — Logo + nav com mega-menu `company/platform/resources` (Company, Platform, Resources), theme toggle fixed, botões login/signup. Header flutuante arredondado no topo.
2. **Hero section** — Headline "Fuel your growth with data-driven digital marketing", sub sobre 15 anos de SEO/SEM, dois CTAs (free marketing audit / explore our work), cluster de 4 avatares "Trusted by over 300 clients", logo strip de 5 clientes (white/dark variants).
3. **Services overview (stack-cards)** — Sticky intro à esquerda ("Our performance-focused services"), direita com 6 stack-cards empilhados via JS (stack-card plugin): SEO, SEM, Email marketing & automation, Link building & authority outreach, Local SEO & google business optimization, Analytics & conversion optimization. Cards usam ns-shape icons ou SVG hexagonal (montanha em camadas).
4. **Application Steps** — 3 passos numerados com progress bars horizontais animadas (bg-ns-green): 01 Deep audit & discovery → 02 Campaign planning & execution → 03 Weekly optimization cycles. CTA "Learn about our approach".
5. **Why us section** — Card escuro arredondado (bg-secondary) com gradient ns-img-498 no canto, 6 features em 2 colunas ao redor de imagem central (mobile-style preview): SaaS & tech, Real estate, E-commerce, Healthcare, Local business, Education.
6. **Results marquee** — Heading "Results that speak for themselves" + cards-marquee horizontal infinito com 4+ cards de métricas (clients %, campanhas, leads, conversões). Cards alternam cor no hover revelando gradient blur.
7. **Testimonial marquee** — "Client words", cards-marquee com 3 testimonials grandes (Michael Lee/Urban Brew, Sarah Johnson/TechFlow, Emily Rodriguez/Creative Studios) — avatar circular, nome, empresa, quote, link X/Twitter.
8. **Free audit section** — 2-col com headline "Get a free audit with a personalized plan" + imagem ns-img-294, CTA "Claim my free audit" → pricing.
9. **Blog section** — Badge "Blog", h2 "Actionable insights from real experts", grid 3-col com 3 cards (autor, data, categoria badge-green/yellow, título, link). CTA "Explore the blog".
10. **CTA final** — "Ready to grow smarter?" + parágrafo + botão "Book your free strategy call". Simples, centralizado, em `bg-background-5` no dark.
11. **Footer v3** — Logo + redes sociais (FB, IG, YT, LinkedIn, Dribbble, Behance), 3 colunas (Company, Support, Legal Policies), copyright "Nexsas – smart application for modern business".

## Recursos visuais

- **Cores primárias**: primary `#864ffe` (purple), primary-50 `#f4f2fe`, primary-400 `#a585ff`, primary-500/600 `#7c31f6`; secondary `#1a1a1c`; accent `#fcfcfc`
- **Backgrounds (9 níveis)**: `#fcfcfd` → `#070b10` (clara → escura, dual-mode real)
- **Accents decorativos**: `ns-yellow #f9eb57`, `ns-green #c6f56f`, `ns-red #ffb9a2`, `ns-cyan #83e7ee`, `ns-ivory #f4efe7`, `ns-linen #beab9a`
- **Gradientes nomeados**: `gradient-7` (white→cyan), `gradient-8` (white→purple 156°), além de linear-gradients 45° em animações (`#a585ff,#ffc2ad,#a585ff` e `#83e7ee,#f9eb57,#83e7ee`)
- **Tipografia**: **Inter Tight** (Google Fonts), pesos 100-900 — única fonte em todo o template, usada tanto em títulos quanto corpo
- **Iconografia**: font `next-sass` (eot/ttf/woff/svg em `/fonts`) + SVGs inline nas seções (mega-menu, services, hexagonal SEO icon)
- **Padrões decorativos**: `ns-img-292.svg` (light hero shape), `ns-img-498.png` (purple gradient blur no canto), `ns-img-510.png` (gradient blur para hovers), `ns-img-494.png` (gradient footer)
- **Componentes utilitários**: badges (`badge-cyan`, `badge-green`), buttons (`btn-secondary`, `btn-white`, `btn-dark`, `btn-accent` com seta SVG inline em `::before`), `shadow-4`, `rounded-4xl`, marquee cards, stack-cards (scroll-driven)
- **Animações**: `data-ns-animate` com `data-delay`, `data-direction`, `data-offset` — fade/slide on scroll; SplitText para word-by-word; Lenis para smooth scroll; vanilla-marquee para carrosséis infinitos

## Notas de qualidade

- **Pontos fortes**: stack-cards e marquees dão movimento escancarado sem custar performance; dark mode nativo com tokens `--color-background-*`; SEO meta + OG/Twitter completos em todas as páginas; ARIA labels consistentes (`aria-label`, `role="region"` no steps); proof-of-social forte (300 clients + 4 avatars + logo strip)
- **Tailwind v4-style**: `@theme` custom mapeia tokens para classes utilitárias (`bg-ns-cyan`, `text-secondary/60`, `dark:bg-background-5`, etc.) — refatorar tokens é direto
- **Acessibilidade**: preconnect Google Fonts, `sr-only` em logos sociais, focus states implícitos via transitions, alt text em todas imagens
- **Limitações práticas**: imagens `ns-img-*` numeradas são placeholders; a copy diz "Nexsas" em todos arquivos (logo no footer, copyright, OG tags) — busca/substituição global obrigatória para rebranding
- **Stack lock-in**: `ns-animate` (lib interna ~190 linhas JS) substitui parte do que Framer/GSAP fariam; sair disso requer reescrever animações
- **Pricing page tem plano único (não toggle mensal/anual)** — só `pricing.html` com matriz de features vs. colunas; FAQ/Filters não existem nesta variação do index (mas páginas `faq.html` e `features.html` existem como rotas separadas)
- Fonte via Google Fonts CDN com `preconnect` — fallback system-ui funciona offline

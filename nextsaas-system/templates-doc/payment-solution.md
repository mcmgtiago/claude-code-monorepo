---
slug: payment-solution
nome: Nexsas Payment Solution
nicho: Fintech / Payment Gateway / SaaS financeiro
estilo: Moderno premium (Tailwind v4), glass header pill, gradientes suaves, vibe fintech-clean
qualidade: 8
paleta_principal: #864ffe
fonte_titulo: Inter Tight
fonte_corpo: Inter Tight
densidade_secoes: média (8 seções na home)
uso_recomendado: Landing page de fintech/wallet/pagamento, gateway de pagamento, app de gestão financeira, conta digital, plataforma de transferências, dashboard de cobrança.
limitacoes: Lorem ipsum remanescente em vários blocos (features, hero subtitle, why-choose-us, finance intro). Copy precisa reescrita antes de produção. Sem dark-mode dedicado — só inverte tokens. 56 páginas no bundle, mas foco do template index é marketing, não produto transacional.
---

# Nexsas Payment Solution

Template do mega bundle Nexsas (StaticMania). Foco em marketing de produto financeiro com vibe "smart payment solution / smart wallet". Mesmo produto visual reaproveitado em 56 páginas HTML estáticas com Tailwind v4 e JS próprio para animações/counters/marquee.

## Páginas disponíveis

**Homepage / landing**: index.html (8 seções + header + footer)

**Páginas de marketing**: about.html, services.html, features.html, faq.html, pricing.html, contact.html, process.html, why-choose-us.html, our-manifesto.html

**Páginas de produto/uso**: integration.html, analytics.html, download.html, use-case.html, tutorial.html, documentation.html, whitepaper.html, whitepaper-details.html

**Páginas de prova/relacionamento**: testimonial.html, success-stories.html, case-study.html, case-study-details.html, customer.html, customer-details.html, referral-program.html, affiliates.html

**Páginas editoriais**: blog.html, blog-details.html, glossary.html, glossary-details.html, changelog.html, press.html

**Páginas institucionais**: team.html, team-details.html, career.html, career-details.html, security.html

**Páginas legais**: legal.html, terms-conditions.html, privacy-policy.html, refund-policy.html, gdpr.html, affiliate-policy.html

**Auth**: login.html, signup.html

**Utilitários**: 404.html, brandkit.html

## Seções (index.html)

1. **Header** (lines ~105–2000): pill flutuante `fixed top-5` com `backdrop-blur-[25px]`, mega menu dropdown, navegação escura/transparente.
2. **Hero** (2086–2443): badge amarelo "Digital payment solution", H1 "Smart payment solution for your business", 2 CTAs (Get started / Try it for free), asset central = mockup Visa card com cards flutuantes de "Credit limit $53,224" (counter animado), "Transfer success!" e avatares. Gradients decorativos `ns-img-508.png` / `ns-img-534.png`.
3. **Trusted By Users** (2446–2653): card escuro `bg-secondary` com 3 ratings — 4.7 (verde), 4.3 (vermelho), Trustpilot-style 5 estrelas amarelas.
4. **Feature section** (2656–2828): grid 3 colunas, 6 cards (Smart expense tracking, Real-time analytics, Secure payment processing, Automated budgeting tools, +2). Imagens dark/light variants separadas.
5. **Why Choose Us** (2831–2963): split esquerda (4 bullets com `ns-shape-*` icons do font custom) + direita (imagem transação + card flutuante SVG).
6. **Pricing** (2966–3349): badge amarelo "Our pricing", tabela 4 colunas (Essential Free / +2 planos / +coluna "What's included"). Cards com check/minus icons.
7. **Finance Intro** (3352–3502): split inverso, imagem `ns-img-73.png` + card "Today's Revenue $53,224" com progress bar 88%. Bullets com checks pretos.
8. **Integration** (3505–3700): marquee horizontal de logos (Google, Slack, Confluence, Snapchat, Yammer, Figma, Microsoft, etc.) com fade gradient nas bordas. Heading "Enhance your productivity effortlessly with over 50 integrations."
9. **Blog** (3703–3912): 3 cards (Finance / Crypto / +1) com hover scale-[102%], badge categoria, autor, data, "Read more".
10. **CTA** (3915–4004): "Experience a free trial today" + botão "7-day free trial" + 3 micro-bullets (No Credit Card Required / Free For 30 Day Trial / +1).
11. **Footer** (4010–4381): footer-three com grid de 6 colunas (About, Company, Resources, Legal, social icons), subscribe, copyright.

## Recursos visuais

- **Stack**: Tailwind CSS v4.1.4 (`@layer properties`, sem arquivo `tailwind.config.js` — tokens via CSS variables em `:root`), main.js próprio (no module namespace), zero dependências JS externas.
- **Fontes**: Inter Tight 100–900 italico (Google Fonts) + font icon custom `next-sass` (eot/ttf/woff/svg em `/fonts/`).
- **Paleta CSS variables** (extraídas de `assets/main.css:74-177`):
  - `primary-500: #864ffe` (roxo acento principal — botões, badges, links)
  - `primary-600: #7c31f6` / `primary-400: #a585ff` / `primary-100: #ece8ff` / `primary-50: #f4f2fe`
  - `secondary: #1a1a1c` (preto suave — texto escuro, footer)
  - `accent: #fcfcfc` (off-white — texto em dark mode)
  - `background-1: #fcfcfd` → `background-9: #1f252f` (9 níveis claro/escuro)
  - `stroke-1: #dfe4eb` ... `stroke-8: #303b49` (bordas)
  - **ns-yellow #f9eb57**, **ns-green #c6f56f**, **ns-red #ffb9a2**, **ns-cyan #83e7ee** — accent colors temáticos para badges (yellow=pagamentos, green=features/CTA, red=alerta)
  - Gradients: `linear-gradient(#fff 0%, #83e7ee 100%)` (gradient-7), `linear-gradient(156deg, #fff 32.92%, #a585ff 91%)` (gradient-8 — avatares)
- **Tipografia**: H1 4.25rem/110%, H2 3.25rem/120%, H3 2.5rem, body 1rem/150%, tagline-2 0.875rem, tagline-3 0.75rem.
- **Componentes custom**: `.btn` (variants: primary/secondary/white/white-dark/transparent, sizes md/lg/xl), `.badge` (variants: yellow/green/red/cyan com backdrop-blur), `.footer-three`, `data-ns-animate` (animate-on-scroll com delay/direction/spring), `data-counter` (animação de número), `data-marquee`, `data-parallax-effect`.
- **Header**: pill flutuante com `backdrop-blur-[25px]` e borda translúcida — efeito glassmorphism sutil. Mega menu "Company" com 4 cards (About/Services/Features/Blog) + card "What's New" lateral.
- **Dark mode**: nativo via classe `.dark`, inverte backgrounds e textos. Imagens têm versão dark (`ns-img-dark-*.png/svg`) — exige manutenção duplicada.
- **Imagens**: mockups de produto (cards Visa/transfer/finance), avatares, ilustrações abstratas com gradients roxos/cyan. Diretório `/images/` organizado em `icons/`, `shared/`, `ns-avatar-*`, `ns-img-*`.
- **Animações**: parallax no hero, fade-up on scroll (data-ns-animate), counter de números ($53,224), progress bars animadas (48% / 88%), marquee infinito de logos.

## Notas de qualidade

**Positivo**:
- Identidade visual coesa — paleta fintech (roxo + accents amarelo/verde/vermelho) bem calibrada e atual.
- Componentes JS prontos (counter, marquee, parallax, animate-on-scroll) economizam horas.
- Header glassmorphism é destaque — efeito premium raro em templates da faixa.
- Mega menu bem estruturado com ícones SVG inline.
- 56 páginas cobrem fluxo completo de marketing — não precisa montar do zero.
- Dark mode nativo com variantes de imagem já inclusas.
- Pricing table com coluna "What's included" — boa arquitetura para planos.
- Acessibilidade básica presente (aria-label, role, alt, semantic HTML).
- A11y stars com `role="img" aria-label="5 out of 5 stars"`.

**Negativo**:
- Lorem ipsum remanescente em ~6 seções (hero subtitle, why-choose-us body, features descrições, finance intro, integration intro, blog excerpts). Copy precisa reescrita total.
- Imagens em `/images/` com nomes crípticos (`ns-img-67.png`, `ns-avatar-9.png`) — sem nomes semânticos, dificulta reuso.
- Pricing tem 4 colunas mas só vejo 3 planos (Essential Free + 2 implícitos) — verificar.
- Footer duplica links institucionais + legais sem hierarquia clara.
- JS bundle (main.js 132KB) é monolítico sem tree-shaking — não usa imports ES modules.
- Tailwind v4 sem `tailwind.config.js` exposto — tokens hardcoded em `:root`, dificulta extensão.
- Sem versão React/Vue — HTML estático puro, conversão para SPA requer reescrita.
- Logo "Nexsas" hardcoded em meta tags e estrutura — rebranding exige busca global.
- Inline SVGs repetidos (5 estrelas rating, checks bullets) — poderia ser componente ou `<symbol>`.
- Sem testimonials dedicado na index — só "Trusted by users" genérico com ratings.
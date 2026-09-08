---
slug: smart-solutions
nome: Smart Solutions
nicho: SaaS Multi-vertical / App de produtividade
estilo: Moderno / Premium / Tech-clean
qualidade: 8
paleta_principal: #864ffe
fonte_titulo: Inter Tight
fonte_corpo: Inter Tight
densidade_secoes: Alta
uso_recomendado: SaaS B2B generalista, app de gestão/finanças, plataformas de wealth management, ferramentas de automação para PMEs
limitacoes: Copy e casos偏向 wealth/finance; precisa refilar textos para outros nichos; design rico (muitas seções) pode exigir manutenção visual
---

# Smart Solutions

Template NextSaaS focado em um app smart/SaaS com narrativa híbrida (gestão + finanças pessoais/wealth management). Visual moderno com sticky scroll-cards, marquee de logos e download CTA.

## Páginas disponíveis

- index.html (homepage)
- about.html, team.html, team-details.html
- services.html, service-details.html
- features.html
- pricing.html
- blog.html, blog-details.html
- case-study.html, case-study-details.html
- customers.html, customer-details.html
- testimonial.html, success-stories.html
- career.html, career-details.html
- process.html, our-manifesto.html, why-choose-us.html
- faq.html, contact.html
- integration.html, use-case.html, tutorial.html, documentation.html
- changelog.html, download.html
- whitepaper.html, whitepaper-details.html, glossary.html, glossary-details.html
- press.html, analytics.html, referral-program.html, affiliates.html, affiliate-policy.html
- brandkit.html, security.html, support.html
- login.html, signup.html
- privacy-policy.html, terms-conditions.html, legal.html, refund-policy.html, gdpr.html
- 404.html

## Seções (index.html)

### 1. **Hero** (~linha 1589)
- Headline: "Boost your business with smart apps"
- CTA: "Book a strategy call" → contact.html
- Mockups flutuantes com cards de Income ($48,000), avatar, transfer success
- Background SVG animado (animate-pulse)

### 2. **Team Intro / Quote** (~linha 1903)
- Texto grande centralizado (split-text-team-title)
- CTA: "Meet Nexsas team"

### 3. **Solution / Wealth Management** (~linha 1928)
- Background-2 dark:background-5
- 3 cards: Portfolio management, Financial planning, Growth assist
- Ícones ns-shape-* (webfont next-sass)
- CTA: "View all solutions" → services.html

### 4. **Client Logos Marquee** (~linha 2050)
- "Trusted by 10k+ fast-growing businesses"
- Dois marquees (esquerda/direita) com fade gradient nas bordas

### 5. **Tools / Smart Features** (~linha 2224)
- "Smart features. smarter growth."
- Grid 12-cols assimétrico: Creative automation (8) + Integrations (4) + Permissions (4) + Notifications (8)
- Logos de integração: Shopify, Snapchat, Figma, Slack, Zapier, TikTok

### 6. **Stack Cards / Stand Out** (~linha 2395)
- Sticky left (título "What makes us stand out" + CTA pricing)
- Stack de 4 cards com rotate backgrounds decorativos
- Innovative ideas / Top-rated features / Beautiful interface / Simple solutions
- Animação stack-cards JS

### 7. **Download App** (~linha 2560)
- Bloco dark (bg-secondary / background-5) com badge blur
- "App download & access"
- Visual de celular + botões app store

### 8. **Steps** (~linha 2671)
- 3 colunas com progress-bar animada
- 01 Download the app / 02 Create your profile / 03 Start managing

### 9. **Blog** (~linha 2748)
- "Smart reads for smarter businesses"
- Grid 12-cols: 1 card grande (esquerda) + 2 cards lista (direita)
- Date + read time meta

### 10. **CTA Final** (~linha 3061)
- Bloco secondary dark arredondado (rounded-4xl)
- "Ready to transform your workflow?"
- Botão → pricing.html

### 11. **Footer v3** (~linha 3113)
- 4 colunas (logo + 3 menus)
- Social icons (FB/IG/YT/X/LinkedIn)
- Background white/dark:background-8

## Recursos visuais

**Paleta de Cores:**
- Primária: #864ffe (roxo)
- Primary 50/400/500/600: #f4f2fe / #a585ff / #864ffe / #7c31f6
- Secondary (text dark): #1a1a1c
- Accent (light text): #fcfcfc
- Background light→dark: #fcfcfd / #f9fafb / #f4f5f8 / #f0f2f6 / #13171e / #0f1217 / #181d26
- Acentos ns-yellow #f9eb57, ns-green #c6f56f, ns-red #ffb9a2, ns-cyan #83e7ee

**Tipografia:**
- Família: Inter Tight (Google Fonts, weights 100-900)
- Mesma fonte para títulos e corpo
- Webfont própria: next-sass (ícones ns-shape-*)

**Animações:**
- data-ns-animate (scroll reveal)
- animate-pulse no hero BG
- Stack-cards com JS scroll-driven (z-index stacking)
- Logos marquee infinito (esquerda/direita)
- Progress-line animada nas steps
- Counter animado no hero ($48,000)
- Split-text para o team title
- Hover scale-[102%] nos cards de blog

**Componentes:**
- Header fixo pill-shape (rounded-full, backdrop-blur)
- Mega-menu dropdown (Company / Engage / Explore / Resources)
- Mobile sidebar drawer
- Badges (badge-blur, badge-yellow)
- Buttons (btn-primary / btn-secondary / btn-white / hover variants)
- Cards rounded-[20px] padrão
- Max-width 1290px container

## Notas de qualidade

- **Estrutura:** 11 seções bem segmentadas, densidade alta
- **Responsividade:** mobile-first com sm/md/lg/xl/2xl breakpoints
- **Dark mode:** Total via classes dark: (parity light/dark em quase todos os elementos)
- **Acessibilidade:** aria-label em regiões, sr-only em social, semantic HTML, role="region" nas steps
- **Performance:** Lazy-load via animação on-scroll, parallax leve
- **UX:** Sticky scroll, CTAs múltiplos (4+), social proof via logos e blog
- **Compliance:** Pacote completo de legal (privacy, terms, gdpr, refund, legal)
- **Conversão:** Hero CTA → pricing CTA → stack CTA → final CTA (caminho claro)
- **Customização:** Copy muito específico para "smart apps" + wealth — refile antes de usar em outro vertical
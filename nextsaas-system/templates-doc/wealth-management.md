---
slug: wealth-management
nome: Wealth Management
nicho: Financial Tech / Wealth Management
estilo: Modern Minimalist + Premium Finance
qualidade: 8
paleta_principal: #864ffe
fonte_titulo: Inter Tight (Tailwind CSS)
fonte_corpo: Inter Tight (Tailwind CSS)
densidade_secoes: média
uso_recomendado: Platform landing para wealth management B2C, portfolio advisory services, fintech wealth robo-advisor landing, financial planning apps
limitacoes: Foco em consumer wealth management; sem templates de dashboard admin/trader; copy em inglês apenas
---

# Wealth Management

## Páginas disponíveis

50 templates HTML inclusos, cobrindo full funnel:
- **Core**: index, login, signup, pricing, contact, about
- **Content**: blog, blog-details, tutorial, documentation, FAQ, glossary
- **Use-case focused**: services, features, integration, use-case, process, team
- **Social proof**: customers, testimonials, success-stories, case-studies
- **Reference**: whitepaper, career, press, affiliates, referral-program
- **Legal/Policy**: privacy, terms, GDPR, security, legal

## Seções (index.html)

1. **Header** — Fixed nav com mega-menus (Company, Resources, People). Responsive: desktop XL, collapse mobile.
2. **Hero** — Dual-column: texto + CTA à esquerda; 4x hero imagery staggered à direita (spring animation, parallax). Badge "Finance", headline de confiança, quote + avatar social proof.
3. **Uses Data (Stats)** — 5-card marquee com hover gradient overlay. Stats: 800K+ transactions, $4.8B assets, 200K users, 9.1% avg return, 150+ partnerships. Hover: text color shift to yellow, scale boost.
4. **Why Us** — Accordion "Why choose Nexsas?" (5 items) + image card com gradient overlay. Light/dark theme support. Items: goal-based plans, multi-device access, advisor + automation, investment diversity, clear reporting.
5. **Services** — 5-card grid (3-2 layout): Portfolio management, Financial planning, Growth assist, Retirement planning, Risk management. Icons + description. CTA "Start managing".
6. **Accessibility** — Dark bg section, image + checklist. Copy: "Guiding you with intelligence and heart". Features: iOS/Android/Web, 24/7 access, wealth coaches, live support.
7. **Testimonials** — Swiper carousel (3 slides). Avatar + blockquote + attribution. Navigation arrows.
8. **Blog** — 3-post grid: 1 large (XL col span) + 2 stacked right (L col span). Date + read time. "Informed investors are confident" subheader.
9. **FAQ** — 4 accordion items. "Questions about portfolio?", "Where to start?", "Click away?", "Pricing clarity?".
10. **CTA Final** — Dark background. "Ready to build real wealth?" + dual buttons: "Sign up free" (primary), "Talk to wealth coach" (white/transparent).
11. **Footer** — Standard multi-column (Company, Product, Resources, Legal, Social).

## Recursos visuais

**Design System (main.css)**
- Cores primárias: #864ffe (purple), #7c31f6 (dark purple), #a585ff (light purple)
- Fundos: #fcfcfd (light-1), #13171e (dark-5), #0f1217 (dark-6)
- Accents: #fcfcfc (accent light), #1a1a1c (secondary dark)
- Status colors: #c6f56f (green), #83e7ee (cyan), #f9eb57 (yellow), #ffb9a2 (red)
- Borders: #dfe4eb (light stroke-1), #2a333e (dark stroke-7)

**Tipografia**
- Font: Inter Tight (Google Fonts)
- Weights: 300, 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- Hierarchy: h1, h2 (heading-5), h3 (heading-6), h5, p, tagline-1 to 3

**Componentes**
- Buttons: btn-primary (purple), btn-secondary, btn-white, btn-dark, btn-transparent com hover states
- Badges: badge-cyan, badge-yellow, badge-green (status colors)
- Cards: 360px min-width, 270px min-height, border stroke-4, rounded-20px, hover gradient overlay
- Icons: Custom font "ns-shape-*" (11, 34, 35, 40, 44) para serviços
- Animations: data-ns-animate (delay, offset, direction, spring, duration)

**Imagens**
- Pasta: /images/
- Hero imagery: ns-img-262 a 265, dark variants (-dark-176 etc)
- Backgrounds: ns-img-512, ns-img-513 (gradients), ns-img-520 (CTA)
- Blog thumbnails: ns-img-481 a 483
- Avatars: ns-avatar-1, 6, 7, 8 (PNG, rounded circle)
- Logo: main-logo.svg, logo.svg, logo-dark.svg

## Notas de qualidade

- **Pros**: Clean hierarchy, cohesive dark/light theme, smooth animations, SEO-ready meta tags, accessibility-focused structure (semantic HTML)
- **Cons**: Copy é placeholder em alguns FAQs; serviços icons são font-based (requer customização); sem integration com backend (static HTML)
- **Production-ready**: Sim, com ajustes de copy e imagens próprias
- **Tailwind CSS**: Heavily customized (color vars, font vars, spacing scale). Não está em compilado — usar build step ou incluir CSS asset como-está.

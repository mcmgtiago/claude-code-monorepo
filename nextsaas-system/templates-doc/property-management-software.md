---
slug: property-management-software
nome: Property Management Software
nicho: Prop Tech / Real Estate
estilo: Modern, Dark-Light Mode, Glassmorphism
qualidade: 8/10
paleta_principal: #1a1a1c (dark), #fcfcfc (light), #f9eb57 (accent yellow)
fonte_titulo: Inter Tight (Google Fonts)
fonte_corpo: Inter Tight, sans-serif
densidade_secoes: média
uso_recomendado: Plataformas de gestão de propriedades, SaaS imobiliário, admin dashboards, B2B rentals
limitacoes: Templates genéricos apenas, sem integração real de dados, mock content em features
---

# Property Management Software

## Páginas disponíveis

48 templates em HTML estático:
- **Principal**: index.html (4407 linhas)
- **Autenticação**: login.html, signup.html
- **Core**: pricing.html, features.html, services.html
- **Info**: about.html, team.html, contact.html, faq.html
- **Suporte**: documentation.html, support.html, tutorial.html
- **Marketing**: blog.html, case-study.html, success-stories.html, testimonial.html
- **Compliance**: terms.html, privacy.html, gdpr.html, refund.html, security.html
- **Extras**: analytics.html, integration.html, download.html, manifesto.html, whitepaper.html, press.html

## Seções (index.html)

1. **Header Fixed** — Navbar sticky com logo, mega-menu (Product/Platform/Resources), theme toggle
2. **Hero** — Full-screen com CTA "Request a demo", client logos marquee, gradiente fade-out
3. **Success Metrics** — Stats box (4 cards com ícones, contadores animados)
4. **Feature Highlights** — 2-col: imagem + stats glassmorphic, testimonial + map (Leaflet.js), avatars sobrepostos
5. **Features v2** — Grid 3-col com 5 features (Smart Scheduling, Maintenance Tracking, Inspections, Inventory, Messaging)
6. **Integrations** — 2 marquees com logos (Google, Slack, Figma, Microsoft, etc)
7. **Industry Categories** — 3-col cards com hover zoom (Vacation Rentals, Corporate Housing, Hotels)
8. **Testimonials** — Slider horizontal com 3 cards (avatares, nomes, empresas, tweets)
9. **FAQ** — 4 accordions com ícones SVG, dark/light toggle
10. **CTA Final** — Email form + 2 checkmarks (No CC, 14-day trial)
11. **Footer** — Logo, social links (6), 5 colunas de links

## Recursos visuais

- **Biblioteca de ícones**: 128 custom font-icons (ns-shape-1 até ns-shape-128) via font-family "next-sass"
- **Imagens**: 300+ assets (ns-img-*.png, ns-img-dark-*.svg para dark mode)
- **Animações**: GSAP, Lenis scroll, Framer Motion, Swiper carousels, data-ns-animate com delays
- **UI Components**: Badges, buttons (primary/secondary/accent), accordions, cards com backdrop-blur
- **Vendedores**: leaflet.min.js (maps), vanilla-infinite-marquee, swiper
- **Palette**: 
  - **Cores primárias**: #1a1a1c (secundário), #fcfcfc (accent)
  - **Accents**: #f9eb57 (amarelo), #c6f56f (verde), #ffb9a2 (coral), #83e7ee (ciano)
  - **Backgrounds**: 9 variações (background-1 até background-9)
  - **Strokes**: 9 tons (stroke-1 até stroke-9)

## Notas de qualidade

- ✓ Fully responsive (mobile-first, Tailwind utility classes)
- ✓ Dark mode nativo (toggle com JavaScript, CSS vars)
- ✓ Acessibilidade: aria-labels, semantic HTML, keyboard nav
- ✓ Performance: Lazy loading de imagens, CSS otimizado
- ✓ SEO: Meta tags completos (OG, Twitter Card), schema markup embutido
- ✓ Customização: Design tokens em CSS vars para cores/spacing
- ⚠️ Maps requerem API key (Leaflet placeholder)
- ⚠️ Formulários sem backend (action="#")
- ⚠️ Content é mock (copywriting genérico para property management)

## Estrutura técnica

- **Framework**: HTML + Tailwind CSS 3 + Vanilla JS
- **Build**: CSS em `assets/main.css` (11.8 KB minificado)
- **Vendors**: Swiper, Leaflet, GSAP, Lenis, custom marquee
- **Fonte custom**: `fonts/next-sass.*` (EOT, TTF, WOFF, SVG)
- **Breakpoints**: Mobile, SM (640px), MD (768px), LG (1024px), XL (1280px), 2XL (1536px)

Caminho: `C:/Users/Administrator/Downloads/ui88/Organizado/A - Dashboards & SaaS/NextSaaS - Mega Bundle (47 templates)/main/templates/property-management-software/`

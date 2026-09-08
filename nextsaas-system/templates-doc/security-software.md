---
slug: security-software
nome: Nexsas Security Software
nicho: SaaS / Security Software / Cybersecurity Startup
estilo: Moderno, dark-mode first, hero com gradient fundo, estatísticas animadas com counters, testimonials carousel marquee
qualidade: 8
paleta_principal: "#864ffe" (primary-500 roxo), "#1a1a1c" (secondary preto), "#fcfcfc" (accent branco), "#13171e" (background-5 dark), "#f9fafb" (background-2 light)
fonte_titulo: Inter Tight
fonte_corpo: Inter Tight
densidade_secoes: alta
uso_recomendado: Landing pages de software de segurança/antivírus, SaaS de proteção de dados, ferramentas de compliance. Excelente para demonstrar features de segurança, showcasing de confiabilidade (estatísticas de países/dispositivos), pricing com planos escaláveis, recursos de suporte 24/7, integração de testimonials.
limitacoes: HTML estático puro, sem framework JS — integrações via vanilla JS. Gradientes hardcoded em classe Tailwind; mudança de paleta exige refactor de primaries. Hero exige múltiplas imagens flutuantes (ns-img-266~269); layout responsivo assume viewport mínima 375px. Counters de números (data-counter) usam custom JS — sem validação de performance em números muito grandes.
---

# Nexsas Security Software

## Páginas disponíveis
index, about, features, pricing, contact, faq, blog, blog-details, team, team-details, career, career-details, services, service-details, case-study, case-study-details, customers, customers-details, success-stories, testimonial, integration, documentation, tutorial, support, process, why-choose-us, our-manifesto, analytics, download, brandkit, press, whitepaper, whitepaper-details, glossary, changelog, security, login, signup, 404, affiliates, affiliate-program, referral-program, affiliate-policy, refund-policy, privacy-policy, terms-conditions, gdpr, legal.

## Seções (index.html)

1. **Header v2** — Pill flutuante fixed (backdrop-blur 25px, rounded-full), logo left, mega-menu Company (2 colunas: About/Services/Team), nav items de produto, mobile menu drawer, theme toggle.

2. **Hero section** — Gradient fundo (180deg: #a585ff→#ffc2ac), 4 imagens flutuantes com animações parallax (data-ns-animate data-spring), headline "Security & performance solution", subtext "Your all-in-one advanced protection for devices & digital privacy", 3 checkmarks inline (Complete cybersecurity suite, Boost performance & speed, Protect your data & privacy), 2 CTAs (Free download → contact.html, Get premium → pricing.html), avatar stack "Trusted by 20k+ Customers across the globe".

3. **Testimonial section (Trusted by thousands)** — Background preto (#1a1a1c), headline h2, carousel de avatares clicável, nome/cargo (Mark Thompson / Head of customer Success), blockquote com citação, imagem de gradiente rotacionada no fundo.

4. **Feature section (Email Features)** — Fundo claro, 2 colunas (texto left / imagem right), headline "Nexsas your smart email choice", 4 feature bullets com ícones, imagem grande com shadow + floated card progressbar (Today's Revenue $53,224 com animação progressbar 88%).

5. **Feature v2 section (Built for businesses & individuals)** — Background dark, 4 cards com ícones coloridos + estatísticas (Trusted in 100+ countries, 5M devices secured, 50% faster performance, 4/7 AI threat monitoring), cada card tem background colorido NS (yellow/cyan/red/green).

6. **Feature v3 section (What makes stand out)** — 2 colunas (imagem left + texto right), headline "What makes our security software stand out", 4 bullets com checkmark (Comprehensive antivirus, One-click system cleanup, Encrypted cloud backup, Identity theft protection), CTA "Free download".

7. **Feature v4 section (Features that set NexSaaS apart)** — Background light, headline + descrição, grid 3+2 (3 cards top row, 2 centered bottom) com imagem + título + descrição: Real-time threat protection, One-click optimization, Privacy shield, Software updater, Cross-platform compatibility.

8. **Testimonials Carousel (Client words)** — Background light, headline "Client words", horizontal marquee scroll de cards (min-width 722px lg), cada card: avatar/name/role/social link, blockquote, hover gradient overlay.

9. **Pricing section** — Background light, headline "Select the pricing plan…", grid 4 colunas (left: "What's included" header com lista feature rows, 3 planos: Essential Free, Advanced $99, Enterprise), checkmarks para features incluídas, botões "Get started".

10. **Resources/Support section** — 5 cards em grid (3 top, 2 centered bottom), cada com ícone + headline + descrição: Security guides & tutorials, System optimization tips, FAQs & community support, 24/7 customer assistance, Industry news & updates. Cards com hover `translate-y-[-10px]`.

11. **CTA section (Need help? Contact experts)** — Background preto (#1a1a1c), headline + descrição left, email form + checkmarks right (No credit card required, 14-Day free trial).

12. **Footer v3** — Fundo escuro, colunas (Product, Resources, Company, Legal, Support), newsletter subscribe, social links.

## Recursos visuais

- **Paleta principal**: roxo `#864ffe` (primary-500), violeta claro `#a585ff` (primary-400), preto `#1a1a1c` (secondary), branco `#fcfcfc` (accent). Dark mode via `background-5 #13171e`, `background-8 #070b10`, `background-9 #1f252f`.
- **Accent colors (NS-palette)**: 
  - yellow `#f9eb57` (badges, backgrounds)
  - green `#c6f56f` (success, positive metrics)
  - red `#ffb9a2` (attention, warnings)
  - cyan `#83e7ee` (highlights, secondary accent)
  - Variantes light: green-light `#e8fbc6`, cyan-light `#cdf5f8`, yellow-light `#fdf7bc`
- **Gradients**: 
  - Hero `linear-gradient(180deg, #a585ff 0%, #ffc2ac 100%)`
  - `--color-gradient-6`: cyan→green
  - `--color-gradient-7`: white→cyan
- **Tipografia**: Inter Tight (Google Fonts), CSS vars: `--text-heading-1` 4.25rem, `--text-heading-2` 3.25rem, `--text-heading-3` 2.5rem, `--text-heading-4` 2rem, `--text-heading-5` 1.5rem, `--text-heading-6` 1.25rem, `--text-tagline-1/2/3` 1rem/0.875rem/0.75rem.
- **Componentes**: 
  - Header pill fixed backdrop-blur-[25px], rounded-full
  - Mega-menu 752px width, 2-column layout
  - Hero com 4 floating images rotadas (rotate-[-7deg], rotate-[10deg], etc.)
  - Cards com rounded-[20px], shadow-1/2/3
  - Buttons: btn-secondary (dark bg), btn-primary (roxo), btn-white/white-dark, variants btn-xl/btn-lg/btn-md
  - Progress bars animadas (data-progress-item data-progress-value="88")
  - Counters numerados (data-counter data-number="100" data-speed="1000")
- **Animações**: 
  - `data-ns-animate` com data-delay (0.1s increments), data-direction (up/left/right), data-offset (pixels para trigger)
  - Spring animations (data-spring="true" data-duration="2")
  - Parallax floats (ng-img com data-delay stages 0.3-0.4-0.5-0.6)
  - Marquee carousel (cards-marquee-container, scroll-bar horizontal)
  - Group hover effects (group-hover:opacity-100, group-hover:scale-[102%], etc.)
- **Layout**: Tailwind CSS 3, max-width `1290px` (lp:), responsive breakpoints min-[425px]/sm/md/lg/xl/2xl, flex grids, gap standardization.
- **Imagens**: Floating hero (ns-img-266/267/268/269), feature images (ns-img-73), card images (ns-img-270-274, ns-img-dark-180-184), avatars (ns-avatar-{1-13}.png), gradients/decorations (ns-img-510, ns-img-496).

## Notas de qualidade

- **Pontos fortes**: 
  - Dark mode first-class, ambas paletas bem definidas
  - Rich stat section com counters animados
  - Testimonials marquee smooth + interactive avatar switching
  - 5-tier feature breakdown (hero basics → email → stats → detailed → card grid)
  - Pricing matrix clara (3 tiers escaláveis)
  - 24/7 support messaging + resources grid forte
  - Responsive design consistente (mobile-first breakpoints)
  - SEO completo (meta, OG, Twitter, canonical)
  
- **Pontos fracos**: 
  - Hero depende de 4 imagens flutuantes; 404 visual se assets faltarem
  - Counters JS vanilla sem fallback ou SSR
  - Marquee carousel em loop infinito sem pause control
  - Paleta roxo-heavy; rebranding exige find-replace em ~100+ classes Tailwind
  - Sem i18n; texto hard-coded em português/inglês misto
  - Header pill fixed pode cobrir conteúdo sem `scroll-padding-top` em headings
  
- **Performance**: ~4595 linhas HTML, CSS importado (main.css ~12k linhas), ~10 imagens flutuantes + thumbnails. Mobile em ~340px mínimo. Animações vanilla JS (data-ns-animate) podem impactar FCP se muitos elementos.

- **Veredito**: **8/10** — Base robusta para landing SaaS de segurança/antivírus. Design system consistente, componentes reutilizáveis, dark mode nativo. Migração para Next.js/React seria mecânica dado markup semântico limpo. Ideal para B2B security, compliance, device protection narratives.

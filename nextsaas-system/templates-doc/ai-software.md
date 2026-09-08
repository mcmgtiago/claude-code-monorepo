---
slug: ai-software
nome: Nexsas AI Software
nicho: SaaS / AI Software / Startup
estilo: Moderno, dark-mode nativo, glassy header pill, hero com video parallax
qualidade: 8
paleta_principal: "#864ffe" (primary-500 roxo), "#1a1a1c" (secondary), "#fcfcfc" (accent), "#13171e" (background-5 dark), "#f9fafb" (background-2 light)
fonte_titulo: Inter Tight
fonte_corpo: Inter Tight
densidade_secoes: alta
uso_recomendado: Sites de produto SaaS AI-first (escrita assistida, agentes, copilots, analytics preditivo). Ótimo para narrar stack de IA + captura de leads com pricing + integração.
limitacoes: Hero exige video (Tube.mp4 / Tube-dark.mp4) — sem fallback estático se o arquivo faltar. HTML estático puro, sem React/Vue: integrações JS via vanilla. Cores primárias muito puxadas para roxo; rebranding para paleta diferente exige refactor de classes Tailwind.
---

# Nexsas AI Software

## Páginas disponíveis
index, about, features, pricing, contact, faq, blog, blog-details, team, team-details, career, career-details, services, service-details, case-study, case-study-details, customer, customer-details, success-stories, testimonial, integration, documentation, tutorial, support, process, why-choose-us, our-manifesto, analytics, download, brandkit, press, whitepaper, whitepaper-details, glossary, changelog, security, login, signup, 404, affiliates, affiliate-program, referral-program, affiliate-policy, refund-policy, privacy-policy, terms-conditions, gdpr, legal.

## Seções (index.html)
1. **Hero (id=`scene`)** — Video background fullscreen (Tube.mp4 / Tube-dark.mp4), 5 logos flutuantes em órbita com parallax, headline "Effortlessly build advanced websites with AI-driven solutions", CTAs Get started / Play video.
2. **About section** — Texto "Creating a flawless website down to the last pixel...", imagem grande com screenshot do produto, stat strip.
3. **How it Works section** — 3 passos numerados (01 / 02 / 03) com ícones SVG e descrição.
4. **Feature section** — Grid de features com tab switcher + cards detalhados (AI Tools, Automation, Analytics, Integrations).
5. **Pricing section** — Toggle mensal/anual, 3 planos (Starter / Professional / Enterprise) com lista de features e CTA "Get started".
6. **Integration section** — Logos de integrações em grid + CTA "Explore All Integrations".
7. **Brand / Resources / Press / Video Tool cards** — Strip de recursos com thumb.
8. **Reviews section (Customer Success)** — Carousel de depoimentos com avatar + nome + cargo.
9. **Footer v2** — Colunas (Product, Resources, Company, Legal), bloco CTA "Build a complete website…".

Outros: Header v1 (pill floating com backdrop-blur, mega-menu Company), Mobile Menu drawer, Theme Toggle Button, Video Modal.

## Recursos visuais
- **Paleta principal**: roxo `#864ffe` (primary-500), violeta claro `#a585ff` (primary-400), preto `#1a1a1c` (secondary), branco `#fcfcfc` (accent). Suporte full dark mode via `background-5 #13171e` / `background-8 #070b10`.
- **Accent colors** (NS-): yellow `#f9eb57`, green `#c6f56f`, red `#ffb9a2`, cyan `#83e7ee` — usados em badges e ilustrações.
- **Gradients**: `--color-gradient-7` (white→cyan) e `--color-gradient-8` (white→primary-400 156deg).
- **Tipografia**: Inter Tight (Google Fonts), via CSS variable; headings com `--text-heading-1` 4.25rem / `--text-heading-2` 3.25rem.
- **Componentes**: header pill fixed com backdrop-blur 25px, mega-menu com 2 colunas, hero parallax (data-parallax-value), cards com hover `bg-background-3`, buttons pill rounded-full.
- **Imagens**: logos orbitais em PNG (ns-img-15/16/17), thumbnails em `images/`, videos em `video/`.
- **Animações**: `data-ns-animate` (data-direction + data-offset) para fade-up, parallax custom em hero, carousel nos testimonials.
- **Layout**: Tailwind CSS 3 compilado (presença de `--tw-*` vars confirma), max-width `1290px`, responsive sm/md/lg/xl breakpoints.

## Notas de qualidade
- **Pontos fortes**: Tailwind limpo, dark mode first-class, SEO meta completo (OG, Twitter, canonical), 47+ páginas com sistema de design consistente, mega-menu rico, acessibilidade básica (sr-only, aria-friendly markup).
- **Pontos fracos**: header pill fixed pode cobrir conteúdo no topo sem `scroll-margin`; hero depende de assets de video locais (404 se mover diretório); JS vanilla para menu/animações pode quebrar com CSP estrita; sem i18n.
- **Veredito**: 8/10 — base sólida para SaaS AI; refactor para React/Next seria mecânico dada a estrutura semântica.
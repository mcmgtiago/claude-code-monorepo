---
slug: ai-kw-generator
nome: AI Keyword Generator (Nexsas — NextSaaS)
nicho: SEO / AI Tools / Marketing
estilo: dark futurista, gradientes neon (pink→laranja, purple), tipografia tight em Sora
qualidade: 7
paleta_principal: "#11141D #0D1017 #191D2A #8D59FF #227EFF #D0FF00 #F2709C #FF9472 #F8F9FA"
fonte_titulo: Sora
fonte_corpo: Inter Tight
densidade_secoes: alta
uso_recomendado: Landing page single-product para ferramenta SaaS de IA com herói interativo (form de prompt em typewriter), cards com borda animada, stack-cards e pricing toggle. Bom ponto de partida para produtos AI de nicho (keyword research, copywriting, agentes).
limitacoes: Mesmo DNA visual dos outros 47 templates NextSaaS/Nexsas — exige rebranding forte (logo, fontes, cores) para não parecer genérico. Conteúdo placeholder "Nexsas/RetailShift". Animações pesadas em JS sem fallback prefers-reduced-motion. Página de pricing interna (generate-smart-keyword) é mais demo que SaaS real.
---

# AI Keyword Generator (Nexsas — NextSaaS)

Template da família **NextSaaS / Nexsas** (Tailwind CSS v4) voltado para ferramenta AI de keyword research. Hero centralizado com form de prompt animado em typewriter + sugestão de chips + logos de "trusted by". Tema dark com acentos purple (#8D59FF), lemon (#D0FF00) e gradiente pink→laranja (#F2709C → #FF9472).

## Páginas disponíveis
- index.html
- 404.html
- about.html
- blog.html
- blog-details.html
- contact.html
- generate-smart-keyword.html (página interna estilo app/ferramenta — input + output)
- login.html
- pricing.html
- sign-up.html
- team.html
- team-details.html

## Seções (index.html)
Ordem top-to-bottom no `<main>` (bg-background-5 #11141D):

1. **Header** — pill fixa, transparente com backdrop-blur, mega-menu "Company" com cards (linha 102)
2. **Hero** — "AI keyword generator that drives results" + form typewriter com textarea auto-grow, mic button, btn de generate, chips de sugestão, logos de clientes (linha 1479)
3. **Smarter keyword research** — grid 8 colunas com 4 cards visuais (search bar animada, gráfico, ícones decorativos) (linha 1819)
4. **How Nexsas works / From idea to actionable keywords** — stack-cards com 3 cards empilhados rotacionados via `data-stack-card-wrapper` (linha 2446)
5. **Real Results, Real Fast** — 5 cards com personas (SEO Specialists, Content Marketers, Digital Agencies, E‑commerce Brands, Startup Founders) usando `ns-shape-*` icons da fonte next-sass (linha 2691)
6. **Who It's For / Use cases** — 3 cards com avatar photos + hover overlay gradient (linha 2847)
7. **Pricing** — toggle mensal/trimestral/anual (Save 84% no yearly) + 3 cards (Starter $19, Pro $49, Agency $99) com tabela de features (linha 3004)
8. **Testimonials** — swiper com 4 slides, cards com gradient border animado + avatar + quote (linha 3500)
9. **CTA** — "Ready to transform your customer support?" com globe-image (opai-img-43.png) em mix-blend lighten + btn "Get started" (linha 3903)
10. **Footer** — footer-six em container rounded-2xl bg-background-6, multi-coluna com newsletter, address, links sociais (linha 3981)

## Recursos visuais
- **Tailwind CSS v4.2.1** com custom properties em `:root` (background-2..14, stroke-1/3, opai-purple/blue/lemon, gradient-23 pink→orange).
- **Tema dark-first** — `bg-background-5` (#11141D) na main; texto em `text-white/90` e `text-white/60`. Toggle de tema não exposto nesta landing.
- **Tipografia**:
  - `font-sora` (300–600) para headings h1/h2 com letter-spacing negativo (-1.6 a -3.2px)
  - `font-inter-tight` (300–600) para corpo
  - `font-space-grotesk` para títulos de cards personas
  - `font-ibm-plex-mono` para tagline/CTA buttons
- **Typewriter form** — atributos `data-typewriter`, `data-typewriter-text`, `data-auto-grow` controlam placeholder animado e altura dinâmica do textarea via JS custom.
- **Borda gradient animada** — `.ai-kw-generator-border-animation` aplica efeito de gradiente circulando no p-px wrapper (cards de personas, pricing, testimonials).
- **Stack cards** — `data-stack-card-wrapper` + `data-stack-card-item` + `data-stack-style="rotate"` cria efeito de cards empilhados com rotação ao scroll.
- **Shape icons** — fonte `next-sass` (.eot/.ttf/.woff/.svg em `fonts/`) com classes `ns-shape-30`, `ns-shape-32`… até `ns-shape-38` para ícones decorativos nos cards de persona.
- **Swiper testimonials** — biblioteca Swiper via `ai-kw-generator-testimonial-swiper` com `swiper-wrapper` + `swiper-slide`.
- **Pricing toggle animado** — `tab-slider-wrapper` com `data-active-tab-bg-color` + GSAP power3.out ease para slide do botão ativo.
- **Radial gradients** — `bg-radial-[47.49%_64.27%_at_3.87%_7.86%]` cria spotlights sutis nos cards.
- **Globe image com blend mode** — `mix-blend-lighten` no CTA hero cria efeito de luz sobre dark bg.
- **Animações declarativas** — atributos `data-opai-animate` (scroll-reveal), `data-opai-split-text` (word-by-word heading animation), `data-direction`, `data-delay`, `data-offset`.
- **Botão "Get started" customizado** — bg-background-7 (#f8f9fa), dot-circle deslizante + arrow translate-x no hover.

## Notas de qualidade
- HTML estruturado com `aria-labelledby` em todas as seções, `role="search"` no form, `sr-only` labels em inputs, `role="list"`/`role="listitem"` nos logos.
- SEO completo (Open Graph, Twitter Cards, geo, robots, canonical).
- Manifest + favicons multiformato (`favicon.svg`, `.ico`, `apple-touch-icon.png`, `site.webmanifest`).
- Schema.org markup `WebPage` com `itemprop="headline"`/`description` no hero.
- **Pontos fracos**:
  - "Nexsas/RetailShift" inconsistente atrapalha rebrand (refs ao template, não ao produto).
  - CTA final diz "transform your customer support" — copy de outro produto da família colada neste template.
  - 4332 linhas em index.html — verbosidade alta sem componentização.
  - `data-opai-animate` opacity:0 no CSS inicial — usuários com JS desabilitado veem página em branco até JS carregar.
  - Sem `prefers-reduced-motion` honoring nas animações.
  - generate-smart-keyword.html promete UI de ferramenta real mas é mais demo estática.
  - Pricing toggle mostra $29→$19 sem strikethrough semântico (usa span com line sobreposta, não `<del>`).
- Catálogo enxuto (12 páginas) focado em funnel curto de SaaS single-product — bom para SaaS nascente.

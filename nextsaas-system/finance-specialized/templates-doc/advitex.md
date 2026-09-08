---
slug: advitex
nome: Advitex Finance & Business Consulting
nicho: Consultoria Financeira / Business Consulting
estilo: Template HTML multi-página corporativo-financeiro, sofisticado e neutro, com tipografia editorial (Inter Tight + DM Sans), seções abundantemente espaçadas, animações de scroll (GSAP + WOW), sliders (Swiper), contadores (Odometer) e tema de cores azul-marinho/verde-escuro com acentos pastel.
qualidade: 7
paleta_principal: ["#1c3f3a", "#0075ff", "#604cc3", "#fc6a2b", "#f5f6f7"]
fonte_titulo: "Inter Tight" (Google Fonts, servida localmente em /font)
fonte_corpo: "DM Sans" (Google Fonts, servida localmente em /font) + Inter como secundária
densidade_secoes: alta
uso_recomendado: Sites de consultorias financeiras, advisors, wealth management, contabilidades premium e firmas de business consulting que precisam de template denso, multi-página, com seções ricas em dados (cases, dashboards, FAQs, blog) e animações suaves.
limitacoes: Visual datado (referências visuais de 2023-2024); nenhuma página de dashboard/SaaS real (é um template estático de marketing); 404/coming-soon/error com pouco conteúdo; nenhuma área autenticada; foco em marketing institucional, não em produto.
source: C:/Users/Administrator/Downloads/finance/advitex-finance-and-business-consulting-html-tem-2026-08-22-04-44-59-utc/advitex-package/advitex/
---

# Advitex Finance & Business Consulting

Template HTML estático multipágina premium para o nicho de consultoria financeira e business consulting. Estrutura típica de ThemeForest: `index.html` com hero, about, services, process, case studies, testimonial, blog, FAQs e contact; páginas internas seguem o mesmo layout com header sticky + menu lateral, breadcrumb em `.page-title`, e footer rico com colunas. Estilo visual corporativo-financeiro, com tipografia editorial (Inter Tight em títulos, DM Sans em corpo), paleta sóbria com um verde-petróleo/blue-Marinho como âncora (`--Primary: #1c3f3a`) e versões alternativas de `--Primary` para demos (azul `#0075ff`, roxo `#604cc3`, laranja `#fc6a2b`). Animações via GSAP + ScrollTrigger + WOW.js, contadores com Odometer, sliders com Swiper, marquee infinito, parallax e lazy-load de imagens.

## Páginas disponíveis
- `index.html` — Home principal
- `about.html` — Sobre a empresa
- `services.html` — Listagem de serviços
- `service-details.html` — Detalhe de um serviço
- `finance-consulting.html` — Página de serviço: Finance Consulting
- `finance-advisor.html` — Página de serviço: Finance Advisor
- `marketing-consulting.html` — Página de serviço: Marketing Consulting
- `insurance-consulting.html` — Página de serviço: Insurance Consulting
- `pricing.html` — Tabela de preços / planos
- `portfolio.html` — Listagem de cases/portfolio
- `single-project.html` — Detalhe de um case/projeto
- `team.html` — Equipe
- `career.html` — Página de carreiras/vagas
- `faqs.html` — Perguntas frequentes
- `blog.html` — Listagem do blog
- `single-post.html` — Detalhe de um post
- `contact-us.html` — Contato
- `shop.html` — Loja (produtos físicos/digitais)
- `product-details.html` — Detalhe de produto
- `cart.html` — Carrinho
- `checkout.html` — Checkout
- `coming-soon.html` — Em breve
- `404.html` — Página de erro 404
- `error.html` — Página de erro genérica (vazia, 0 bytes)

## Seções encontradas (na index.html)
1. **Top bar / Header style-default** (header sticky principal, com logo, menu, CTA)
2. **Header / Nav** (`<header class="header style-default header-sticky">` + segundo header logo abaixo — provavelmente mega-menu/mobile nav)
3. **Page-title** (hero da home)
4. **Section About** (`section-about style-2`) — com marquee infinito de logos de clientes, SVG animado, contadores (25+ anos, 1600+ advisors, 3800+ cases)
6. **Section Service** (`section-service style-1 bg-sub-color`) — grid de serviços
7. **Section Process** (`section-process style-1`) — steps de processo com imagem e estatísticas
8. **Section Case Studies** (`section sw-layout-1`) — cases/projetos em slider
9. **Section Testimonial** (`section-testimonial style-1`) — depoimentos (provavelmente Swiper carousel)
10. **Section Blog** (`section-blog style-3`) — posts recentes
11. **Section FAQs** (`section-faqs style-1`) — accordion de perguntas
12. **Section Contact** (`section-contact style-default`) — formulário de contato
13. **Footer** (`footer#footer`) — footer com colunas, logo, links, newsletter
14. **Prograss / progress bar** (`.prograss`) — provavelmente indicador de scroll no topo

## Recursos e diferenciais visuais
- **Animações de scroll**: GSAP (`gsap.min.js`), ScrollTrigger, WOW.js (`wow.min.js`) + Animate.css (`animate.min.css`); classes `wow animate__fadeInUp animate__animated` com `data-wow-delay`.
- **Sliders**: Swiper bundle (`swiper-bundle.min.js` + `swiper-bundle.min.css`) para testemunhos, cases, carouséis.
- **Contadores**: Odometer (`odometer.min.js` + `odometer.min.css`) com `<div class="odometer text_primary" data-number="25">0</div>`.
- **Marquee**: plugin `infinityslide.js` para faixa infinita de logos (`infiniteslide tf-marquee data-clone="2"`).
- **Lazy-load**: `lazysize.min.js` + classe `lazyload` em todas as imagens.
- **Parallax**: `parallaxie.js` e `simpleParallaxVanilla.umd.js`.
- **Lightbox/galeria**: Photoswipe (`photoswipe.esm.min.js` + `photoswipe-lightbox.esm.min.js` + `photoswipe.css`).
- **Efeitos GSAP custom (`handleeffectgsap.js`)**: Splitetext (`Splitetext.js`), ScrollSmooth, ScrollToPlugin — split de texto, smooth scroll.
- **Bootstrap 5** como base de grid/layout (`bootstrap.css` + `bootstrap.min.js` + `bootstrap-select`).
- **Nice Select / NoUiSlider** para selects customizados e sliders de preço (`jquery.nice-select.min.js`, `nouislider.min.js`).
- **Drift Zoom** (`drift.min.js` + `drift-basic.min.css`) para zoom de imagens de produto.
- **Model Viewer** (`model-viewer.min.js`) para 3D.
- **Count-down timer** (`count-down.js`) — provavelmente em promoções.
- **Carousel / Shop JS** (`carousel.js`, `shop.js`, `zoom.js`) para e-commerce.
- **Counter JS próprio** (`counter.js`) além do Odometer.
- **CSS custom properties** com `--Primary` em múltiplos demos (verde-petróleo, azul, roxo, laranja) — útil para re-skin rápido.
- **SCSS source** em `/scss/app.scss` + comando de watch (`sass scss/app.scss css/styles.css --watch` no `readme`).
- **Fontes próprias servidas localmente** em `/font/fonts.css` com `@font-face` apontando para `fonts.gstatic.com` (DM Sans + Inter carregadas via CSS, não link).
- **CSS Animations nativas**: `@keyframes` em SVG (`<animate>` SMIL inline para morphing de paths).

## Notas de qualidade
**Pontos fortes:**
- 23+ páginas prontas — volume alto para um template institucional.
- Toolkit JS completo e bem organizado (carousel, parallax, lightbox, sliders, etc.) — bem acima da média para um ThemeForest template.
- Estrutura modular com classes `tf-spacing-*`, `section-* style-*`, `sw-layout-*` — fácil de reusar em outros projetos.
- Suporte a 4+ temas de cor via override de CSS variables (verde-petróleo nativo, azul, roxo, laranja em demos).
- SCSS source disponível para build customizado.
- Acessibilidade básica: `font-display: swap`, `data-wow-delay` decente, lazy-load em todas as imagens.

**Pontos fracos:**
- `error.html` está vazio (0 bytes) — descuido.
- Tipografia é dupla (Inter Tight + DM Sans + Inter) — pode confundir no rebuild.
- Cores primárias alternativas são definidas inline em `:root` (linhas 65-80) em vez de temas separados — bagunça o `styles.css`.
- Visual segue padrão ThemeForest 2023-2024 (gradientes azul-claro, ícones com `icomoon` legado, formas SVG decorativas) — vai parecer datado em 2026.
- Nenhuma área autenticada / dashboard / app-like — é puro marketing.
- `single-project.html` e `single-post.html` têm ~120KB cada — possível markup verboso/bloated.
- Sem suporte real a dark mode nativo (apenas inversão de cores em alguns demos).

**Score: 7/10** — template competente e completo para o nicho, com bom arsenal técnico (GSAP, Swiper, Photoswipe, Odometer), mas visual datado, algumas páginas incompletas, e nenhuma sofisticação de produto SaaS. Bom para clonar e re-skin rápido em projetos de consultoria financeira / wealth management que não exigem área logada.
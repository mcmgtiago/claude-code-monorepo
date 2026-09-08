---
slug: finazze
nome: Finazze Flask Finance Dashboard
nicho: Finance Dashboard / Web Application
estilo: modern corporate, multi-variant demos
qualidade: 8
paleta_principal: ["#2E0797", "#7C9F37", "#1C3B45", "#FFA800", "#EDF2F7"]
fonte_titulo: Outfit (100-900 weights)
fonte_corpo: Outfit
densidade_secoes: média
uso_recomendado: Agências fintech com múltiplas variações visuais; B2B SaaS finance; Landing pages e dash corporativo
limitacoes: Login template separado; sem dashboard real data-driven; estrutura template-based sem CMS
source: C:/Users/Administrator/Downloads/finance/envato_M6BMUNJ/Finazze-Flask_v1.0/Finazze/
tecnologia: Flask / Python backend, Jinja2 templates, Bootstrap 5, SCSS, jQuery
---

# Finazze Flask Finance Dashboard

Finazze é um template Flask completo e profissional para dashboards financeiros B2B. Oferece cinco variações de homepage otimizadas e múltiplas páginas internas (about, serviços, projetos, blog, FAQs, pricing). Construído sobre Bootstrap 5 com componentização SCSS, utiliza animações fluidas (AOS, GSAP), carrosséis (Owl Carousel, Swiper) e efeitos de paralaxe. Ideal para consultorias financeiras, fintechs ou agências que precisam de landing pages corporativas com múltiplas demonstrações.

## Páginas disponíveis

- **Homepage (5 variações)**: index.html (1), index2.html (2), index3.html (3), index4.html (4), index5.html (5)
- **Páginas internas**: About Us, Our Team, Pricing Plans, Testimonials, Contact, FAQ, Services, Projects, Blog (4 variações), Service Details, Project Details, Blog Single
- **Autenticação**: Login, Register (templates separados, não integrados ao fluxo principal)
- **Erro**: 404 Page

## Seções encontradas (templates ou similar)

### Layout Base
- `layouts/base.html` — estrutura raiz com Jinja2 blocks
- `layouts/landing-layout.html` — wrapper para páginas internas
- Partials compartilhados:
  - `partials/navbar.html` — menu com mega-menu (5 demos)
  - `partials/footer.html` — footer com logos, links rápidos, contato, Instagram feed
  - `partials/mobile-header.html` — menu mobile responsivo
  - `partials/head-css.html` — imports de plugins CSS/JS
  - `partials/preloader.html` — animação de carregamento
  - `partials/sidebar.html` — barra de busca overlay
  - `partials/cta.html` — call-to-action genérico
  - `partials/back-to-top.html` — botão scroll top

### Estrutura de Seções (homepage exemplar)
1. **Hero** — background full-screen, heading animado (text-anime-style-3), CTA dupla, imagem lado direito com elementos decorativos
2. **About** — two-column layout, ícones com descrição, reveal animations
3. **Services** — slider Owl Carousel com cards (Investment, Budgeting, Growth, M&A)
4. **Projects** — case studies com imagens + texto, histórico scrollável
5. **Testimonials** — slider horizontal com 4-5 stars, logos de empresas (SVG inline)
6. **Team** — grid de membros com hover effects
7. **Case Studies/History** — timeline visual ou cards
8. **Blog** — grid de posts com categorias
9. **CTA Final** — "Schedule Consultation" + "Start Your Journey"

## Recursos e diferenciais visuais

### Animações
- **AOS (Animate On Scroll)**: fade-left, fade-up, flip-right, zoon-in — com duração customizável (800-1100ms)
- **GSAP + ScrollTrigger**: parallax, text split animations (classe `text-anime-style-3`)
- **CSS Keyframes**: flutuação de elementos (elements1-7), escala, rotação — aplicadas a decorativos
- **Slick & Owl Carousel**: sliders de serviços, testimonials
- **Swiper**: hero slider, testimonial carousel

### Design System
- **Espaciamento**: classes `.space6` a `.space100` (sistema de margins/gaps em múltiplos de 6px)
- **Tipografia**: Outfit (Google Fonts), variações h1-h6, body text, headings com anime effect
- **Botões**: 
  - `.vl-btn1` — cor principal (#7C9F37 lime/verde), hover com sombra
  - `.vl-btn4` — variante com ícone (cor #2E0797 purple), animação de rotação
- **Cores de fundo alternadas**: #EDF2F7, #EDEBF9, #EFF1FF, #F3F9F5 (paleta pastel suave)

### Interatividade
- Mega-menu com imagens de demo (5 homepage thumbnails)
- Busca overlay (sidebar search form)
- Toggle de preço mensal/anual (pricing page)
- Links dinâmicos via Jinja2 `{{ url_for() }}`
- Form de contato placeholder
- SVG logos inline (Google, Notion, Figma, etc)

### Responsividade
- Bootstrap 5 grid (12 colunas)
- Hide/show com `.d-lg-block d-none` / `.d-lg-none d-block`
- Mobile menu separate component
- Imagens otimizadas com `max-width: 100%`

## Notas de qualidade

**Pontos fortes:**
- Estrutura modular bem organizada (templates/, static/, pages/, partials/)
- 5 homepage demos com variações visuais significativas
- Uso inteligente de animações (AOS, GSAP) sem overhead
- Paleta coerente com tons corporativos + accent vibrante
- Componentes reutilizáveis (buttons, cards, hero sections)
- Suporte a múltiplos carrosséis (Owl, Swiper, Slick)
- Integração Flask limpa via Jinja2 + config.ASSETS_ROOT

**Fracos:**
- Login/Register templates separados, sem integração de autenticação real
- Sem exemplos de dados dinâmicos (blog, case studies hardcoded em HTML)
- CSS compilado (main.css 390KB) sem source maps bem documentados
- Nenhuma página de dashboard/análise real (apenas landing pages)
- Preloader básico, sem loader customizado por seção
- SVG logos inline em testimonials (não escalável)

**Score: 8/10**
- Polimento visual e animações fluidas (+2)
- Variedade de demos e reutilização componentizada (+1.5)
- Falta de integração back-end real e dados dinâmicos (-1)
- Base sólida para customização financeira (+1.5)

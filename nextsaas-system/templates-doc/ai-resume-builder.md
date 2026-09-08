---
slug: ai-resume-builder
nome: AI Resume Builder (Nexsas — NextSaaS)
nicho: SaaS / Ferramentas de IA / Carreira
estilo: "moderno light com acentos em verde-limão (NS Green), cards brancos, ilustrações SVG e parallax"
qualidade: 7
paleta_principal: "#864FFE #7C31F6 #C6F56F #1A1A1C #EAECEB #DFE4EB"
fonte_titulo: Inter Tight
fonte_corpo: Inter Tight
densidade_secoes: média
uso_recomendado: Landing page para produtos SaaS de carreira/IA (geradores de currículo, otimizadores ATS, ferramentas de求职). Forte apelo visual em hero com mockup, cards de features com ícones verdes e seções de templates com efeitos parallax/hover.
limitacoes: Identidade Nexsas/NestSaaS repetida em todas as páginas — exige rebranding textual. Animações dependem de JS custom (data-ns-animate, parallax). Conteúdo placeholder ("Nexsas", "Nora F.") precisa substituição. Copy misturado (pt/en nos títulos de seção).
---

# AI Resume Builder (Nexsas — NextSaaS)

Template da família **NextSaaS / Nexsas** focado em ferramentas de IA para criação de currículos. Tailwind CSS com classes utilitárias custom (data-ns-animate, bg-ns-green, bg-background-3), CSS variables para tema light/dark e tipografia única Inter Tight.

## Páginas disponíveis
- index.html
- 404.html, about.html
- affiliate-policy.html, affiliates.html
- analytics.html, blog.html, blog-details.html
- brandkit.html, career.html, career-details.html
- case-study.html, case-study-details.html
- changelog.html, contact.html
- customers.html, customers-details.html
- documentation.html, download.html
- faq.html, features.html, fonts/
- glossary.html, gdpr.html
- images/, index.html, integration.html
- legal.html, login.html
- our-manifesto.html, press.html, pricing.html
- privacy-policy.html, process.html
- referral-program.html, refund-policy.html
- security.html, services.html, service-details.html
- signup.html, site.webmanifest
- success-stories.html, support.html
- team.html, team-details.html
- terms-conditions.html, testimonial.html
- tutorial.html, use-case.html
- vendor/, whitepaper.html, whitepaper-details.html
- why-choose-us.html

(50+ páginas; pacote completo do bundle NextSaaS reaproveitado)

## Seções (index.html)

1. **Header / Navbar** — Logo Nexsas, menu com mega-menu Company/Services, CTA Get started
2. **Hero section** — Headline "Your resume, perfected by AI", subhead, botões "Get started" + secondary, mockup grande do produto (ns-img-340.png), overlay gradient
3. **Client marquee** — Logos de empresas (Scapic, Asana, Discord, Dropbox, Hotjar, Lattice…) em marquee horizontal
4. **Services / Features grid** — "Everything you need to stand out" — 6 cards em grid 12-col com ícones NS Green: 20+ resume sections, Grammar checker, AI resume tailoring, Chrome extension, Export PDF/TXT, Real-time feedback
5. **Templates showcase** — "Professionally designed resume templates that get results" — Background cinza (bg-background-3), 6 cards com mockups SVG rotacionados, overlays blur, parallax: A4/US Letter, 9 fonts/unlimited colors, Smart Prompts, Adjustable spacing, PDF/TXT downloads, Template categories
6. **How it works** — 4 passos numerados (Sign up, Import/start fresh, Paste job details, Apply & track) com cards alternando bg-background-3 e bg-ns-green, setas conectoras animadas
7. **Testimonials** — Grid de 6 cards com avatares, estrelas, profissão (Nora F. Architect) — versão desktop com cards rotacionados (-14deg) e hover scale, mobile com stack vertical
8. **FAQ** — Accordion com 5+ perguntas (Resume Builder, AI detection, ATS optimization, segurança)
9. **CTA section** — "Get noticed. get hired. get started." — bloco bg-background-12 com ilustrações SVG decorativas (ns-img-336/337) e botões primary/secondary

## Recursos visuais

- **Tipografia**: Inter Tight (100–900, ital) via Google Fonts — única família usada em todo o template
- **Paleta core**:
  - Primária: `#864FFE` / `#7C31F6` (violeta)
  - Accent verde-limão NS: `#C6F56F` (botões, ícones, highlights)
  - Texto: `#1A1A1C` (secondary)
  - Backgrounds: `#FCFCFD` (1), `#F9FAFB` (2), `#F4F5F8` (3), `#EAECEB` (12)
  - Stroke/border: `#DFE4EB` (1), `#E3E7ED` (2)
  - Acentos sazonais: NS Yellow `#F9EB57`, NS Red `#FFB9A2`, NS Cyan `#83E7EE`
- **Botões custom**: classe `.btn-xl-v2.btn-secondary-v2.group-hover/btn-v2:btn-primary-v2` com ícones SVG de pontos animados (grid 5x4)
- **Animações**: `data-ns-animate` (fade/slide), `data-parallax-value` em templates, `data-spring` em imagens flutuantes, `data-direction` left/right/up
- **Layout**: Grid 12-col responsivo (Tailwind), breakpoints sm/md/lg/xl/2xl com padding progressivo
- **Componentes únicos**:
  - Header pill (`rounded-full` com backdrop-blur-25px)
  - Top-nav banner dismissível
  - Cards com `bg-ns-green` para ícones circulares 56px
  - Templates cards com hover scale-105 + parallax SVG overlays
  - Testimonial cards com rotate(-14deg) e hover rotate-0
  - Accordion com chevron SVG + bg-ns-green/secondary state toggle
- **Iconografia**: SVGs inline (zero dependência externa), stroke 1.5/2px, stroke `#12161F` ou `#1A1A1C`
- **Schema markup**: Service, HowToStep, Organization, itemscope/itemtype em todas as seções principais
- **Acessibilidade**: ARIA labels (aria-labelledby, aria-label), roles (region, list, listitem), sr-only para textos de imagem

## Notas de qualidade

- **Pontos fortes**:
  - Visual moderno e coeso com identidade NS Green + violeta — fácil de reconhecer como "AI tool"
  - Hero forte com mockup grande do produto em card arredondado (rounded-2xl) sobre bg accent
  - Seção de templates showcase é destaque único — cards com SVGs rotacionados criam sensação de profundidade
  - Schema.org markup completo (Service, HowToStep) — bom para SEO de produto
  - Responsividade testada (mobile sm, tablet md, desktop lg/xl, 2xl)
  - FAQ accordion funcional com toggle visual claro
- **Pontos fracos**:
  - Branding Nexsas/NestSaaS espalhado — substituição manual em todas as páginas
  - Dependência de JS para animações (data-ns-animate não funciona sem o bundle)
  - CSS variables muito específicas (--color-ns-*, --font-inter-tight) — sair do tema é trabalhoso
  - Sem tema dark completo apesar de classes dark:* presentes — visual primário é light
  - Copy mistura pt/en ("Get noticed. get hired. get started.")
  - Testimonials têm todos mesma pessoa "Nora F. Architect" — placeholder evidente
- **Ideal para**: Produtos SaaS de carreira/IA que precisem de landing com forte showcase visual de templates/features + fluxo "how it works" + prova social (testimonials/FAQ)
- **Bundle**: 50+ páginas — muito além do necessário para landing single-product, mas útil se for vender plataforma completa
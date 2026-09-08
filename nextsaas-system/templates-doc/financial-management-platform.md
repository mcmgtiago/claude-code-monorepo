---
slug: financial-management-platform
nome: Nexsas — Financial Management Platform
nicho: SaaS financeiro / fintech B2B (gestão de caixa, pagamentos, faturas, analytics, automação)
estilo: Corporate-clean com gradiente deep-blue → icy-blue, cards arredondados (rounded-2xl/3xl/4xl/[28px]), ícones em pill azul-marinho, animações de scroll (data-ns-animate), marquee de logos, tabs com indicador animado, swiper de depoimentos, accordion FAQ
qualidade: 7
paleta_principal: #142E6E (deep navy / brand blue) + #EDF2FF (icy blue claro) sobre #FCFCFC (accent/branco); texto #1A1A1C (secondary); backgrounds #F0F2F6 (background-4), #F4F5F8 (background-3); accent util #83E7EE (ns-cyan) na top bar
fonte_titulo: Inter Tight (300–900, Google Fonts)
fonte_corpo: Inter Tight (mesma família, sistema: ui-sans-serif fallback)
densidade_secoes: alta (12 seções no index; ~5.873 linhas, 587 KB de markup)
uso_recomendado: Landing pages de fintech B2B (gateway de pagamento, ERPs financeiros, plataformas de expense management, controle de fluxo de caixa, automação fiscal). Funciona bem como hero-oriented home para produto único. Hero com gradiente funciona melhor com fotos/screenshots financeiros claros (dashboards, gráficos). Tabs Payments/Analytics/Invoices/Security/Automation servem como showcase de features sem nova página.
limitacoes: Identidade visual única (deep blue + icy blue) é difícil de rebrandear sem refazer gradientes. Copy do template cita "Grovia" e "Nexsas" misturados (resíduo de outros templates do bundle — copy não foi totalmente personalizada). Swiper de testimonials tem 8 cards hardcoded com a mesma cor de estrela, sem variantes. Badge grid "Forbes Cloud 100" é ilustrativo, não factual. Densidade de seções comprime o scroll e exige conteúdo real para não vazar placeholders. Hero usa data-ns-animate sem fallback para prefers-reduced-motion. Formulários (login/signup) são páginas separadas — não há demo interativa no index.
---

# Nexsas — Financial Management Platform

Template NextSaaS (Staticmania, bundle de 47) focado em SaaS financeiro corporativo. Stack: HTML estático + Tailwind (compilado em `assets/main.css`) + JS vanilla (`main.js`) + Swiper para carrosséis + fontes Google (Inter Tight). Sem build step, sem dependências npm.

## Páginas disponíveis

45 páginas HTML (todas linkadas no header/nav):

- **Index / Landing**: `index.html` (5873 linhas)
- **Produto**: `features.html`, `services.html`, `service-details.html`, `integration.html`, `process.html`, `why-choose-us.html`, `tutorial.html`, `download.html`
- **Preço / Auth**: `pricing.html`, `login.html`, `signup.html`
- **Empresa**: `about.html`, `team.html`, `team-details.html`, `career.html`, `career-details.html`, `press.html`
- **Conteúdo**: `blog.html`, `blog-details.html`, `whitepaper.html`, `whitepaper-details.html`, `success-stories.html`, `testimonial.html`, `faq.html`, `glossary.html`, `changelog.html`
- **Comercial**: `contact.html`, `customer.html`, `customer-details.html`, `vendor.html`, `affiliates.html`, `referral-program.html`
- **Trust / Legal**: `security.html`, `analytics.html`, `gdpr.html`, `legal.html`, `privacy-policy.html`, `terms-conditions.html`, `refund-policy.html`
- **Sistema**: `404.html`

## Seções (index.html)

Ordem de aparição (cada `<section>` é independente e reordenável):

1. **Top notification bar** (`bg-ns-cyan`, linha 102) — banner dismissível "Financial Management Platform new homepage is live now".
2. **Header fixo** (linha 127) — pill rounded-[20px] flutuante com mega-menu (Explore / Engage / Insights), logo SVG, CTA login.
3. **Hero** (linha 1502) — card rounded-[56px] com gradiente `from-[#142e6e] to-[#edf2ff]`, h1 "Build & grow with scalable financial tools", avatar group + "10,000+ people joined", 2 botões `btn-v3`. Schema.org `SoftwareApplication`.
4. **Trusted by / Clients marquee** (linha 1754) — logos em loop infinito (`logos-marquee-container`).
5. **Services tabs** (linha 1969) — 5 abas (Payments / Analytics / Invoices / Security / Automation) com `data-active-tab-indicator` animado e 5 painéis de conteúdo com screenshots SVG.
6. **Why choose us** (linha 2483) — bloco azul com h2 + imagem dashboard full-width (`ns-img-562.png`).
7. **Make payment easy / 6 feature cards** (linha 2730) — grid 4 colunas com cards brancos em container `bg-background-4`: 1-Click Reports, Smart Invoicing, Real-Time Insights, Bank-Grade Security, Multi-Currency Support, Tax-Ready Books.
8. **Impressive templates** (linha 3137) — bloco azul escuro com 4 cards showcase (Budget $300.689, Automated Workflows, Multi-Currency, Credit Limit), cada um com SVG illustration flutuante.
9. **Awards / badges** (linha 4174) — headline "top financial management platform for 87% of Forbes Cloud 100 firms in 2025" + 5 badges SVG + 3 cards de métricas animadas (93%, 87%, 95% via `data-counter`).
10. **Testimonial swiper** (linha 3618) — `.financial-management-platform-swiper` com 8 depoimentos 5-estrelas, cards `lg:max-w-[317px]`.
11. **FAQ accordion** (linha 4293) — pergunta única destacada à esquerda + accordion com bullets à direita (8 itens hardcoded).
12. **Blog** (linha 4962) — 3 posts em grid `col-span-5/col-span-6`, sobre fundo gradiente azul.
13. **CTA** (linha 5564) — "Ready to experience smarter living?" + 2 botões (Get started Now / Book a Demo).
14. **Footer** (linha 5707) — `bg-secondary` (#1A1A1C), 5 colunas (product / company / resources / legal / newsletter).

## Recursos visuais

- **Paleta CSS customizada** (assets/main.css:75–110): `--color-primary-50` a `600` (violeta, não usado nesta home); `--color-secondary: #1a1a1c`; `--color-accent: #fcfcfc`; tokens `ns-yellow`, `ns-green`, `ns-red`, `ns-cyan (#83e7ee)`, `ns-cyan-light`, etc.
- **Brand efetivo desta página**: gradiente horizontal/vertical `from-[#142e6e] to-[#edf2ff]` aplicado em hero, why-choose-us, impressive-templates, blog e CTA (5 seções).
- **Tipografia**: 100% Inter Tight (300–900) via Google Fonts + Tailwind utilities (`text-heading-3` a `text-heading-6`, `text-tagline-1/2/3`).
- **Componentes próprios**: `.btn-v3` (botão com ícone deslizante, variantes `btn-v3-white`, `btn-v3-secondary`, `btn-v3-lg`), `.accordion` com `data-state`, `.logos-marquee-container`, `.financial-management-platform-swiper`, `data-counter` (animação numérica), `data-ns-animate` (IntersectionObserver scroll-reveal).
- **Background-4 (#F0F2F6)** é a moldura padrão dos cards; **#FFFFFF** é a superfície dos cards internos.
- **Imagens**: PNG/SVG em `./images/` (ns-img-562.png é o dashboard mockup principal; ns-img-565 a 571 são ilustrações SVG inline nos cards showcase).
- **Schema.org markup** em cada seção principal (SoftwareApplication, Service, ItemList, Blog, BlogPosting, AggregateRating).

## Notas de qualidade

**Pontos fortes**
- SEO/meta tags completas (Open Graph, Twitter, canonical, robots, geo).
- Acessibilidade: `aria-label`, `aria-labelledby`, `role`, `tabindex` em tabs, `sr-only` no logo, contraste forte (navy sobre branco).
- Animações bem orquestradas (delays escalonados, `data-instant` para hero).
- Tailwind compilado (CSS gerado, não CDN) — produção-ready, ~12.650 linhas otimizadas.
- Tabs funcionais sem framework (vanilla JS).
- Estrutura modular: cada seção é um `<section>` isolado com padding `py-18 md:py-20 lg:py-24 xl:py-39`.

**Pontos fracos**
- Copy com resíduos de outros templates do bundle ("Grovia" aparece no Impressive Templates; "AI-powered control" no CTA é de outro nicho).
- Badge "Forbes Cloud 100 firms in 2025" sem fonte — não usar literalmente.
- Densidade alta (12 seções no index) gera scroll longo sem strong breaks visuais — pode parecer "tudo junto" se o cliente não tiver conteúdo real para cada slot.
- Hero depende de mockup PNG específico (`ns-img-562.png`) — rebrand exige substituir a imagem mantendo aspect ratio.
- Tab panels repetem o mesmo screenshot genérico — sem diferenciação visual forte entre Payments/Analytics/Invoices/etc.
- Avatar group no hero são PNGs estáticos (`ns-avatar-1/2/3.png`), não geram prova social dinâmica.
- CSS tem `font-family: Helvetica Neue, Arial` em override de Swiper (linha 11497) — pode quebrar consistência.
- `data-ns-animate` não respeita `prefers-reduced-motion` por padrão.
---
slug: data-visualization
nome: Data Visualization
nicho: SaaS, Data Analytics, Business Intelligence, Dashboards
estilo: Modern, Clean, Gradiente suave (purple → peach)
qualidade: 9
paleta_principal: "#864ffe"
fonte_titulo: Inter Tight
fonte_corpo: Inter Tight
densidade_secoes: média
uso_recomendado: Plataformas de visualização de dados, dashboards analíticos, ferramentas de BI no-code/low-code, SaaS de relatórios, produtos que unificam múltiplas fontes de dados
limitacoes: Copy inconsistente em algumas seções (menciona "trading", "finance" e "insurance" fora de contexto), depende de JS para contadores animados e swiper de testimonials, imagens de dashboard fixas (não são gráficos reais)
---

# Data Visualization

Landing page do bundle Nexsas voltada para plataformas de visualização de dados e analytics. Construída com Tailwind CSS v4.1.4 (compilado), dark mode nativo e paleta com gradiente roxo→pêssego característico. Marketing "sem código", foco em unificar fontes de dados em um "command center" visual.

## Páginas disponíveis

- **index.html** — Landing page principal (3230 linhas)
- Páginas de apoio no mesmo diretório (57 arquivos): about, team, career, case-study, customer, testimonial, contact, pricing, features, integration, process, services, use-case, blog, blog-details, documentation, tutorial, faq, support, analytics, whitepaper, glossary, changelog, login, signup, brandkit, download, our-manifesto, press, success-stories, why-choose-us, security, gdpr, legal, terms-conditions, privacy-policy, refund-policy, affiliate-policy, affiliates, referral-program, 404, e detalhes (service-details, team-details, career-details, glossary-details, whitepaper-details, case-study-details, customer-details)

## Seções (index.html)

1. **Header** (linha 105) — Nav fixa em pill flutuante com backdrop-blur. Mega menu "Explore" (Company/Product/Resources/Pricing & Account), dropdowns "Engage" e "Insights", links Blog/Contact. CTA "Get started". Menu mobile em sidebar deslizante com submenus.
2. **Hero** (linha 1588) — Fundo com linhas verticais em gradiente animadas. Título "Transform your data into clear insights." CTA duplo (Take a product tour / Get started now). Prova social: avatares empilhados + "Join 36,000+". Imagem de dashboard (light/dark).
3. **Services** (linha 1759) — 3 cards com ícones `ns-shape-*`: Identify patterns, Improve team performance, Accelerate growth with insights. CTA "Start your free trial today".
4. **Highlights / Stats** (linha 1838) — Faixa com gradiente roxo→pêssego, 3 contadores animados (`data-counter`): 12K+ Projects completed, 98% Positive feedback, 1M+ Charts rendered.
5. **Feature** (linha 1989) — Bloco com imagem de fundo. Título "Track metrics from all your tools" + checklist (Custom dashboards, Flexible data connectors, Scalable for any team). CTA "Connect your data source".
6. **Feature v2** (linha 2109) — "A smarter way to work with data". Grid de 3 features com imagens light/dark: SQL-based analytics, Interactive dashboards, Great usability design.
7. **Process** (linha 2187) — "Metrics are made to be shared". 3 passos numerados (01/02/03) com progress-lines em gradiente: Boost team efficiency, Remote device access, Zero maintenance required.
8. **Feature v3** (linha 2245) — "Why data-driven teams choose us". Lista de 4 diferenciais com ícones `ns-shape-*` + imagem lateral (light/dark).
9. **Testimonial** (linha 2344) — "What our clients say about Nexsas". Carrossel Swiper (reviews-swiper) com slides de avatar + depoimento + nome/cargo, overlay de gradiente no slide ativo.
10. **CTA** (linha 2528) — "Build, launch, and publish to the web fast". Checklist de 3 itens + CTA "Launch your dashboard" + imagem.
11. **Blog** (linha 2644) — Badge "Education & Insights". Grid assimétrico com card grande + cards menores, metadados de data e tempo de leitura, hover scale (102%).
12. **Newsletter / CTA final** (linha 2937) — Fundo escuro (bg-secondary). Badge "Let's start" + "Finance is evolving. are you ready?" + CTA "Book your free strategy call".
13. **Footer v3** (linha 2973) — Fundo escuro com gradiente de topo. Logo, social (Facebook, Instagram, Youtube, LinkedIn, Dribbble, Behance) e 3 colunas de links (Company, Support, Legal Policies).

## Recursos visuais

**Cores (CSS variables em `assets/main.css`)**
- Primary: `#864ffe` (500), `#7c31f6` (600), `#a585ff` (400), `#f4f2fe` (50)
- Secondary (texto dark): `#1a1a1c` · Accent (texto light): `#fcfcfc`
- Backgrounds: `#fcfcfd`, `#f9fafb`, `#f4f5f8`, `#f0f2f6` (light) / `#13171e`, `#0f1217`, `#181d26`, `#070b10`, `#1f252f` (dark)
- Acentos NS: yellow `#f9eb57`, green `#c6f56f`, red `#ffb9a2`, cyan `#83e7ee` (+ variantes light)
- Gradiente principal (`--color-gradient-1`): `linear-gradient(135deg, #a585ff 0%, #ffc2ad 100%)` — usado no hero, stats e process
- Gradientes extras: `--color-gradient-6` (cyan→green), `--color-gradient-7` (white→cyan)

**Tipografia (Inter Tight — via Google Fonts, ital 100..900)**
- Heading 1: 4.25rem / 110% · Heading 2: 3.25rem / 120% · Heading 3: 2.5rem / 120%
- Heading 4: 2rem / 130% · Heading 5: 1.5rem / 140% · Heading 6: 1.25rem / 140%
- Tagline 1: 1rem · Tagline 2: 0.875rem · Tagline 3: 0.75rem (todos 150% line-height)

**Estrutura & interações**
- Tailwind CSS v4.1.4 compilado; dark mode via classe `.dark`
- Ícones-fonte próprios (`@font-face next-sass`, classes `ns-shape-*`)
- Animações de scroll declarativas: `data-ns-animate` com `data-delay` (0.1–1.1), `data-direction`, `data-offset`, `data-instant`
- Contadores numéricos animados (`data-counter` / `data-number` / `data-speed`)
- Carrossel de depoimentos via Swiper
- Grid de 12 colunas + flexbox, responsivo de ~350px (mobile) a 1290px (lp)

## Notas de qualidade

- Design coeso e profissional, alinhado a padrões SaaS modernos; o gradiente roxo→pêssego dá identidade forte.
- Dark mode completo com imagens dedicadas (`ns-img-dark-*`) e bom contraste.
- Responsividade cuidadosa em todos os breakpoints, com variantes de layout por seção.
- Acessibilidade razoável: `sr-only`, `alt` em imagens, HTML semântico (`header`/`main`/`footer`), SVGs decorativos.
- Ponto fraco: a copy de placeholder é inconsistente — há textos de "trading", "finance" e "insurance" que não combinam com o tema de visualização de dados; revisar antes de publicar.
- As "visualizações" do hero e features são imagens estáticas, não gráficos renderizados — trocar por dados reais se o produto exigir interatividade.
- 3230 linhas bem comentadas por seção (`<!-- === section === -->`), fáceis de recortar e reaproveitar.
- Depende de JS externo para contadores e swiper; garantir que os scripts do bundle estejam incluídos.

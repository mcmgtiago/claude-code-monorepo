---
slug: online-banking
nome: Nexsas Online Banking
nicho: Fintech / Banking SaaS (gestão financeira pessoal e empresarial)
estilo: Moderno dark-first com acentos coloridos pastel; ilustrações flutuantes com física spring; pílulas arredondadas (rounded-full / rounded-[20px])
qualidade: 7
paleta_principal: "#7c31f6"
fonte_titulo: Inter Tight
fonte_corpo: Inter Tight
densidade_secoes: alta
uso_recomendado:
  - Landing page de fintech / banco digital / app de gestão financeira
  - Dashboard de despesas, receitas, cash flow e analytics em tempo real
  - Site institucional de SaaS financeiro com hero forte, recursos visuais e pricing
limitacoes:
  - Lorem ipsum pesado em vários blocos (Feature V2, FAQ, copy genérica)
  - Tema é o mesmo template base "Nexsas" reaproveitado — pouco diferencial visual
  - Sem interatividade real de banking (mockups estáticos; sem gráficos ao vivo)
  - Versões dark/light duplicam imagens (ns-img vs ns-img-dark); manutenção pesada
---

# Nexsas Online Banking

Template da bundle NextSaaS focado em fintech / online banking. Reaproveita a base
"Nexsas" do mesmo pacote: header pill flutuante, footer-three, animações `data-ns-animate`
e dark mode como cidadão de primeira classe.

## Páginas disponíveis
A pasta traz **53 HTMLs** (incluindo index). Praticamente todas reaproveitam o mesmo
cabeçalho / rodapé e mudam só o conteúdo:

- Core: `index.html`, `features.html`, `pricing.html`, `contact.html`, `about.html`,
  `services.html`, `service-details.html`, `team.html`, `team-details.html`
- Produto: `process.html`, `use-case.html`, `case-study.html`, `case-study-details.html`,
  `why-choose-us.html`, `success-stories.html`, `customer.html`, `customer-details.html`,
  `integration.html`, `security.html`, `documentation.html`, `tutorial.html`, `changelog.html`,
  `download.html`, `analytics.html`
- Conteúdo: `blog.html`, `blog-details.html`, `faq.html`, `glossary.html`,
  `glossary-details.html`, `whitepaper.html`, `whitepaper-details.html`, `press.html`,
  `testimonial.html`, `career.html`, `career-details.html`, `our-manifesto.html`,
  `brandkit.html`
- Autenticação: `login.html`, `signup.html`
- Marketing: `affiliates.html`, `affiliate-policy.html`, `referral-program.html`
- Legal: `legal.html`, `privacy-policy.html`, `terms-conditions.html`,
  `refund-policy.html`, `gdpr.html`
- Sistema: `support.html`, `404.html`

## Seções (index.html)
Hero + 9 seções principais + footer. Layout vertical, ritmo vertical generoso
(`xl:py-[100px]`).

1. **Header pill fixo** — container rounded-full fixo no topo, mega-menu "Company"
   com cards laterais, mega-menu "Resources", login/signup e theme toggle. Linha 105–2085.
2. **Hero** (`<section class="hero-section">`) — badge "Keep an eye on your finances",
   H1 "The landscape of commerce is evolving.", CTA único, mockup de dashboard
   centralizado com duas ilustrações flutuantes (esq/dir) animadas com spring.
   Linhas 2091–2190.
3. **Feature V1 — "10 years experience"** — split 50/50, dois cards de stat circulares
   (60% project completed, 71 satisfied clients), ilustração com card "Today's Revenue"
   + progress bar 88%. Linhas 2195–2376.
4. **Feature V2 — cards "Managing your money"** — 3 cards (Expences com SVG circular
   60%, Streamlined data processes com chart, Real-time Analytics com chart). Linhas
   2381–2572.
5. **Feature V3 — "Reasons to select us"** — split com 3 mockups sobrepostos à esquerda
   e lista com 4 bullet checks à direita. Linhas 2577–2701.
6. **Clients marquee** — logo strip com gradiente de fade nas bordas. Linhas 2706–2783.
7. **Team grid** — 3 cards com hover-reveal (overlay com social links), imagem
   `bg-background-1` rounded-2xl. Linhas 2788–4045 (inclui estado de loading animado).
8. **Counter / stats band** — barra horizontal `bg-secondary` com 3 métricas (60% Project,
   25 team members, 250 satisfied clients) e ícones em pílulas coloridas. Linhas
   4050–4195.
9. **Pricing** — toggle Mensal/Anual, 3 planos (Free / Pro $30 / Business $60) com
   checklist e CTA full-width. Linhas 4200–4641.
10. **FAQ** — accordion (4 itens) com border-top reveal. Linhas 4646–4839.
11. **CTA newsletter** — card dark `bg-secondary` rounded-[20px] com gradient blur
    verde-água, email input + "No credit card" / "14-Day free trial". Linhas
    4844–4950.
12. **Footer** — `footer-three` com colunas, social, newsletter, copyright.

## Recursos visuais

- **Tipografia**: 100% Inter Tight (Google Fonts, 100–900). `--font-inter-tight`
  no `:root`.
- **Paleta CSS vars** (definidas em `assets/main.css:74–110`):
  - `--color-primary-400: #a585ff` (lavanda) — gradiente texto e ícones
  - `--color-primary-500: #864ffe` / `--color-primary-600: #7c31f6` — CTAs primary
  - `--color-secondary: #1a1a1c` — texto principal / dark surface
  - `--color-accent: #fcfcfc` — texto em dark mode
  - `--color-background-3: #f4f5f8` — fundo da página (light)
  - `--color-background-6: #0f1217` — superfícies de card em dark
  - `--color-ns-yellow: #f9eb57` (badges/ícones)
  - `--color-ns-green: #c6f56f` (stats / progress bars / accent CTA)
  - `--color-ns-cyan: #83e7ee` (badges "badge-cyan")
  - `--color-ns-red: #ffb9a2` (acentos warm)
  - Gradientes de texto: `linear-gradient(45deg, #a585ff, #ffc2ad, #a585ff)` e
    `linear-gradient(45deg, #83e7ee, #f9eb57, #83e7ee)` — animação scroll.
- **Forma**: arredondamento agressivo — `rounded-full` no header, `rounded-[20px]` em
  cards/sections, `rounded-2xl` em avatares. Quase zero canto reto em UI.
- **Imagery**: ilustrações 2D flat com mockups de dashboard/card/pessoa segurando
  cartão. Cada asset tem versão `ns-img-dark-XX.png` para dark mode — bundle pesada.
- **Iconografia**: SVG inline (stroke 1.5–2), 100+ glifos próprios; sets `ns-shape-8/9/12/21`
  usados como bullets.
- **Animações**: framework `data-ns-animate` com `data-delay`, `data-direction`,
  `data-spring="true"`, `data-offset` — implementado em `assets/main.js`. Counters
  animados (`data-counter data-number`), progress bar (`data-progress-bar`),
  accordion, marquee de logos.
- **Classes utilitárias custom**: `lp:max-w-[1290px]` (large breakpoint), `ns-shape-*`,
  `badge-cyan`, `shadow-1`, `ease-team-ease-1`, `btn-primary/secondary/accent`.

## Notas de qualidade

- **Estrutura sólida** — 12 seções bem ritmadas, hierarquia H1→H2→H3 consistente, badges
  uniformes (`badge-cyan` repetido como assinatura visual). Funciona como landing-page
  pronto pra editar.
- **Reaproveitamento evidente** — mesmo header/footer/CTA aparece em todas as 53 páginas;
  textos lorem ipsum em V2 cards, FAQ, descriptions. Não é 53 páginas pensadas do zero,
  é 1 layout multiplicado.
- **Dark mode bem feito** — segunda rende de imagens (`ns-img-*.png` vs `ns-img-dark-*.png`),
  CSS vars por camada (`secondary/60`, `accent/10`), badges com blur no dark.
- **Animação é o destaque** — spring physics nos mockups flutuantes, scroll-reveal com
  delay escalonado, gradient text com background-position loop, counters. Acima da média
  para templates HTML estáticos.
- **Pontos fracos** — copy Lorem ipsum pesado (V2 cards, V1 descrição), stats números
  genéricos (60% / 71 / 25 / 250), sem dados reais de produto bancário, FAQ repetindo a
  mesma resposta 4x. Header mega-menu repete o mesmo bloco dropdown em quase todo nav-item
  (HTML verboso).
- **Nicho honesto** — apesar do nome "Online Banking", o template é genérico-SaaS com
  vestimentas de fintech (badge "Keep an eye on your finances", card "Today's Revenue",
  stat de cash flow). Serve como base, não como solução pronta de banco digital.

**Verdict**: 7/10 — base NextSaaS reaproveitada com camada de identidade fintech.
Qualidade visual acima da média, mas falta profundidade de conteúdo e originalidade
de layout entre as seções.
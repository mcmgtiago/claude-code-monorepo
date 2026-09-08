---
slug: nuvexa-crm
nome: Nuvexa CRM
nicho: CRM / SaaS B2B (vendas, atendimento, marketing automation)
estilo: Moderno / premium roxo com acentos pastel (neobrutalism leve + glassmorphism)
qualidade: 9
paleta_principal: "#864ffe" (primary) · "#1a1a1c" (secondary) · "#fcfcfc" (accent) · acentos ns-yellow #f9eb57 / ns-green #c6f56f / ns-cyan #83e7ee / ns-red #ffb9a2
fonte_titulo: Inter Tight
fonte_corpo: Inter Tight
densidade_secoes: alta
uso_recomendado: |
  Landing pages de CRM/SaaS B2B focadas em conversão (hero com form de email,
  features tabuladas, pricing com toggle anual/mensal, integrações, prova social,
  FAQ). Bom também para ferramentas de vendas, atendimento ao cliente e
  marketing automation. Inclui inner pages completas (blog, docs, careers,
  case study, etc.) caso o produto precise de site institucional.
limitacoes: |
  Identidade visual fortemente atrelada ao roxo primary-500 (#864ffe) e ao
  dark mode em backgrounds profundos (background-5 a 9) — rebranding de cor
  exige mexer em ~10 tokens CSS e em várias classes utilitárias. Copy do
  index.html é genérica de placeholder ("Modern CRM", "Nexsas CRM") e
  precisa ser reescrita. Hero assume formulário de email no topo (não há
  variante hero-only com imagem); se a oferta exigir vídeo/animação maior,
  é necessário estender o grid. Preços são valores fictícios ($1.600,
  $3.342, $4.800) que precisam ser ajustados.
---

# Nuvexa CRM

Template CRM/SaaS do bundle NextSaaS (47 templates). É um dos mais densos do pacote: 56 páginas HTML, ~3.8k linhas só no `index.html` e 13.4k linhas de CSS. Otimizado para converter com form de email no hero, prova social visível cedo (rating 4.9/5.0), pricing toggle e FAQ acordeão. Dark mode é nativo (classe `.dark` redefine os tokens de background).

## Páginas disponíveis

Total: **56 arquivos HTML** (1×404 + 55 páginas).

**Core (marketing):** `index.html`, `features.html`, `integration.html`, `pricing.html`, `download.html`, `security.html`, `process.html`, `our-manifesto.html`, `why-choose-us.html`.

**Produto:** `analytics.html`, `documentation.html`, `tutorial.html`, `changelog.html`, `brandkit.html`, `use-case.html`, `service-details.html`.

**Conteúdo:** `blog.html`, `blog-details.html`, `case-study.html`, `case-study-details.html`, `success-stories.html`, `customers.html`, `customers-details.html`, `whitepaper.html`, `whitepaper-details.html`, `glossary.html`, `glossary-details.html`, `testimonial.html`, `press.html`.

**Conversão / funil:** `contact.html`, `support.html`, `faq.html`.

**Auth:** `login.html`, `signup.html`.

**Institucional:** `about.html`, `team.html`, `team-details.html`, `career.html`, `career-details.html`, `services.html`, `affiliates.html`, `affiliate-policy.html`, `referral-program.html`.

**Legal:** `terms-conditions.html`, `privacy-policy.html`, `gdpr.html`, `legal.html`, `refund-policy.html`.

**Erro:** `404.html`.

## Seções (index.html)

Topbar sticky com nav (Company / Resources / Pages + CTA "Get started"). 9 seções principais + footer:

1. **Hero** (`hero-section pt-[115px]`) — badge "Modern CRM", H1 "AI-powered CRM for businesses", parágrafo + form inline de email + botão "Get started". Background escuro com mockup de produto e contador ao vivo (US$ 53.224 / 88% progresso). Avatar stack de social proof ("Join 50k+ users").
2. **"Reasons to select us" / cash flow** (`bg-background-3`) — lista de benefícios com ícones `ns-shape-8/9` ao lado de imagem. Texto ainda em placeholder "lorem ipsum was born".
3. **Features tabuladas** (`Key features of Nexsas CRM`) — 3 tabs (Sales management, Customer support, Marketing automation) com imagem + texto + botão. ID `sales-management-heading` etc.
4. **Pricing** (`Our pricing`) — 3 cards (Simplified $1.600 / Basic $3.342 / Enhanced $4.800) com toggle mensal/anual e ribbon "save 40%". Annual multiplica ×12.
5. **Integration CTA** (`bg-background-1`) — banner roxo escuro com headline "Boost productivity with 50+ integrations" + CTA "See it in action". Background image `ns-img-510.png`.
6. **"Who uses Nexsas CRM"** — imagem grande `ns-img-73.png` à esquerda + 3 cards de métricas flutuantes (Today's Revenue $53.224, Active deals 2.385, Conversion rate 88%) com `data-counter`.
7. **Reviews flip-cards** (`max-w-[786px]`) — 4 cards com flip 3D (front = bio+rating, back = quote). Ratings: 4.9 / 5.0 / 4.8 / 3.8. Cor `text-ns-green` nos números.
8. **FAQ** (`Frequently Asked Questions`) — acordeão nativo HTML5 (`<details>`/`<summary>`).
9. **CTA final** (`Use Case Overview`) — "Ready to transform your business with NexSaas CRM" + form de email + checks "No credit card required" / "14-Day free trial".
10. **Footer v3** — multi-coluna com nav, social, copyright.

## Recursos visuais

- **Marca-cor:** primary-500 `#864ffe` (roxo vivo) em 6 gradientes (primary-50 → 600). Acentos secundários em tons pastel (`ns-yellow`, `ns-green`, `ns-cyan`, `ns-red`) — quase uma paleta "tech-illustration".
- **Tipografia:** Inter Tight único peso (Google Fonts, weights 100–900, com italico). Sistema de 6 headings (`text-heading-1` a `text-heading-6`) — H1 = 4.25rem / H2 = 3.25rem.
- **Iconografia:** Fonte custom `next-sass` (em eot/ttf/woff/svg) com classes utilitárias `ns-shape-8/9` etc. SVG inline para social/UI.
- **Imagery:** 189 arquivos em `./images/` (avatares `ns-avatar-1` a `23`, mockups `ns-img-73/149/208/240/247-510`, ícones em `./images/icons/`, badges em `./images/badge/`).
- **Animações:** `data-ns-animate` em quase todo elemento revelável, com `data-delay`, `data-direction` (up/right), `data-offset`. Também `data-counter`, `data-progress-value`, `data-spring` (interpolação física via `main.js`).
- **Dark mode:** tokens `.dark` em `:root`. Backgrounds escalam de `#fcfcfd` (claro) para `#070b10`/`#0f1217` (escuro). BGs nomeados `background-1` a `12`.
- **Componentes:** badges (3 variantes: `badge-primary`, `badge-blur`, default), botões (`btn-xl/md` × `btn-white/white-v2/primary/secondary/accent`), cards de pricing com toggle, flip-cards 3D, acordeão nativo, formulários inline com `focus:border-primary-600`.
- **Gradientes notáveis:** `--color-gradient-6: linear-gradient(#83e7ee 0%, #c6f56f 100%)` e `--color-gradient-7: linear-gradient(#fff 0%, #83e7ee 100%)`.

## Notas de qualidade

**Pontos fortes (9/10):**
- Ecossistema completo — 56 páginas cobrem todo o funil (marketing → produto → docs → legal). Pode-se montar um site inteiro sem customizar inner pages.
- Design system bem amarrado via CSS custom properties — re-tematizar para outra cor primária é viável alterando 6 tokens no `:root`.
- Acessibilidade básica presente: `aria-label` em seções principais (`Use Case Overview`, `Frequently Asked Questions`, `Who uses Nexsas CRM`), `aria-hidden` em ícones decorativos, `role` implícito em `<nav>`, `<main>`, `<footer>`.
- Dark mode não é afterthought — está nos tokens e tem variantes explícitas em quase todas as seções.
- Animações com delay encadeado criam sensação de "stagger reveal" sem libs pesadas (provavelmente GSAP ou anime.js local em `main.js`).
- Componentes modernos: flip-cards 3D, contadores animados, badges com blur (`badge-blur`), pricing com spring physics.

**Pontos fracos / ressalvas:**
- Copy de placeholder: "Nexsas CRM", "Modern CRM", "Easily manage your cash flow" e o parágrafo "Until recently, the prevailing view assumed lorem ipsum was born..." são texto dummy — precisam ser reescritos antes de uso real.
- Identidade "Nexsas"/"NexSaas" aparece em vários pontos sem padronização (vê-se `Nexsas`, `NexSaas`, `Nexsas CRM` no HTML) — pequena inconsistência de marca a corrigir.
- O formulário do hero e do CTA final têm `action="#"` — não há backend pronto, é puramente estático.
- Sem `<picture>`/WebP — todos os assets são PNG, pacote fica pesado (189 imagens). Para produção vale converter.
- Fontes externas (Google Fonts) carregadas via `<link>` — se o template for usado offline-first, é preciso baixar Inter Tight localmente.
- Contador `data-counter` no hero (US$ 53.224) e nas métricas de "Who uses" são números hardcoded — sem fonte dinâmica.
- Icon font custom `next-sass` (não é Material/Lucide) — adicionar ícones novos exige editar a fonte ou migrar para SVG sprite.
- `index.html` referencia `./fonts/next-sass.*` com query string `?obdk3g` — pode quebrar com cache busting agressivo se a versão do asset mudar.

**Resumo:** o template mais "pronto para produção" do bundle para um SaaS de CRM. A curva de rebrand é baixa (CSS tokens), mas copy e identidade textual exigem trabalho editorial. Vale 9/10 — perde pontos por copy placeholder e bundle pesado de PNGs.

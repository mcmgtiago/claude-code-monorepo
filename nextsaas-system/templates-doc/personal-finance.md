---
slug: personal-finance
nome: Nexsas Personal Finance
nicho: Fintech / gestão de finanças pessoais (budgeting, savings, debt tracking)
estilo: SaaS corporativo moderno com visual "friendly fintech" (cards rounded, blobs gradient suaves, dark mode)
qualidade: 7
paleta_principal: "#864ffe" (primary-500 roxo) + #1a1a1c (secondary) + #83e7ee (ns-cyan) + #c6f56f (ns-green) + #f9eb57 (ns-yellow) + #ffb9a2 (ns-red)
fonte_titulo: Inter Tight
fonte_corpo: Inter Tight
densidade_secoes: alta
uso_recomendado: Landing page para app de finanças pessoais (budgeting, savings goals, debt tracking, cash flow), plataformas de PFM, fintechs B2C e apps de educação financeira
limitacoes: Mesmo template Nexsas com troca de copy — visual ainda "SaaS genérico" (sem componentes nativos de banking: extrato, transferências, gráficos de investimento); copy parcialmente placeholder ("Finwise smart, secure", "Eight years in fintech"); ícones de feature são shapes próprios (ns-shape-25/34/35/38) que dependem de fonte customizada; copy "homeownership journey" no contact form não bate com o nicho finance
---

# Nexsas Personal Finance

Template do mega bundle NextSaaS (StaticMania) focado em gestão de finanças pessoais. Mesmo design system e tokens do bundle Nexsas, com copy e widgets adaptados para budgeting, savings, debt tracking e cash flow.

## Páginas disponíveis

Bundle completo de 47 arquivos HTML (mesmo conjunto do crypto-marketing — páginas compartilhadas, só copy/imagens mudam):

- **Core:** `index.html`, `about.html`, `contact.html`
- **Produto/Serviços:** `services.html`, `service-details.html`, `features.html`, `use-case.html`, `integration.html`, `process.html`
- **Conversão:** `pricing.html`, `affiliates.html`, `referral-program.html`, `download.html`, `whitepaper.html`, `whitepaper-details.html`
- **Conteúdo:** `blog.html`, `blog-details.html`, `case-study.html`, `case-study-details.html`, `success-stories.html`, `tutorial.html`, `glossary.html`, `changelog.html`
- **Social proof:** `customer.html`, `customer-details.html`, `testimonial.html`, `team.html`, `team-details.html`, `press.html`, `brandkit.html`
- **Carreira:** `career.html`, `career-details.html`, `our-manifesto.html`
- **Suporte:** `faq.html`, `documentation.html`, `support.html`, `security.html`
- **Auth:** `login.html`, `signup.html`, `analytics.html`
- **Legal:** `legal.html`, `terms-conditions.html`, `privacy-policy.html`, `affiliate-policy.html`, `refund-policy.html`, `gdpr.html`
- **Sistema:** `404.html`

## Seções (index.html)

Hero `pt-[150px]` com H1 "Master your money with confidence", subhead sobre track spending + save + plan, CTA primário "Get started for free" e avatar group "Trusted by 20k+" (badges coloridos ns-yellow/red/green/cyan); ao lado, mockup de celular do app (`ns-img-202.png`) com `data-spring="true"`; abaixo, faixa de logos "Trusted by industry leaders" (5 client-logos invertíveis em dark)
About Section em card rounded `bg-secondary` com gradient blob roxo rotacionado — H2 "Your path to financial freedom" + parágrafo Brooklyn creative + checklist de 4 bullets (fintech experience, startups presence, data visualization, new projects)
Features Section em grid 12-col `bg-background-2` — card hero "Modern tools for real-life money management" (com botão Learn more) + 4 widgets funcionais: Crystal-clear budgeting (balance $48,257 com Income/Expenses em badges vermelho/verde), Smarter saving goals (total $56,324 + progress bar 88% com `data-progress-item`), Debt tracking (mockup Visa `ns-img-204.png`), Cash flow overview (chart `ns-img-203.png` com badge rotacionado "90%")
Why Choose Us em layout split — esquerda sticky com badge "Why choose Nexsas?" + H2 "The smarter way to manage your finances" + CTA; direita com 4 stack-cards (efeito `js-stack-cards`) — Simple interface / Personalized tips / Private and secure / Built to empower — usando `ns-shape-25/34/35/38` (glifos da fonte next-sass)
Reviews section `bg-background-2` com cards flip (front/back via `perspective-[1000px]`) — 4 reviews (Sarah Johnson 4.9, Michael Chen 5.0, Emma Rodriguez 4.8, Jaks Rodriguez 3.8) em marquee horizontal; verso do card mostra nota grande verde + logo Trustpilot
Team section com badge "Our team" + H2 "Our innovative, dynamic and talented team" — cards de membros (Wilson, Nick Deo visíveis) com avatar + role
Pricing section "Flexible plans for every budget" em container rounded `bg-background-2` com tabela "What's included" (Pages included / Custom design / etc.) e preço $99 visível
FAQ section com accordion de perguntas
Contact section split — esquerda "Still have questions?" (badge "Why Choose Us" — inconsistente) com info de email/phone/address + form rounded à direita (Full Name / Email / Message / checkbox T&C / Submit). Copy "homeownership journey" não casa com o nicho finance
CTA final `bg-background-2` com badge "Subscribe" + H2 "Transform your finances from stress to success"
Footer full-width `bg-secondary` com gradientes blur laterais (roxo + ciano) + 4 colunas de links + newsletter + social + bottom bar

## Recursos visuais

- Tailwind CSS v4.1.4 (build completo em `assets/main.css`, MIT License)
- Fonte única: **Inter Tight** (Google Fonts) — 100–900, italic
- Tokens CSS em `:root`: paleta `primary-50→600` (roxo `#864ffe` dominante), `secondary #1a1a1c`, `accent #fcfcfc`, backgrounds 1–12, strokes 1–9, paleta "ns" (`ns-yellow #f9eb57`, `ns-green #c6f56f`, `ns-cyan #83e7ee`, `ns-red #ffb9a2` + variantes light/ivory/linen)
- Gradientes prontos: `gradient-5`, `gradient-7` (white→cyan), `gradient-8` (white→primary-400)
- Dark mode nativo via classe `dark:` (default no body: `bg-background-2 dark:bg-background-5`)
- Animações via atributos `data-ns-animate data-direction data-delay data-duration data-offset` (sistema próprio da Nexsas — IntersectionObserver em `main.js`)
- Counters animados: `data-counter data-number data-speed data-interval data-rooms` (usado em $48,257 / $48,000 / $2,321 / $56,324 / 90%)
- Progress bar animada: `data-progress-item data-progress-value data-progress-duration` + `data-progress-bar`/`data-progress-text`
- Stack-cards com scroll stacking: `js-stack-cards` / `js-stack-cards__item` (efeito de empilhar cards no scroll)
- Cards flip 3D: `.flipper` + `.front`/`.back` com `perspective-[1000px]` (usado em reviews — frente com review, verso com nota + Trustpilot)
- Marquee horizontal de reviews: `cards-marquee-container`
- Spring animation no hero mockup: `data-spring="true"` (celular pula ao entrar na viewport)
- Ícones SVG inline (hero, services, social) — sem lib externa tipo Lucide
- Ícone de fonte próprio `next-sass.ttf/woff/svg/eot` (kit da Nexsas) com shapes decorativas `ns-shape-25/34/35/38` usadas na seção Why Choose Us
- Badges reutilizáveis: `badge badge-green`, `badge badge-blur`
- Containers: `main-container` e `2xl:max-w-[1440px] mx-auto`

## Notas de qualidade

- **Prós:** bundle muito completo (47 páginas), widgets financeiros reais e funcionais (counters animados, progress bar, balance/income/expenses, cash flow chart), dark mode first, tokens consistentes, copy já adaptada ao nicho (budgeting, savings goals, debt tracking, cash flow), animações bem amarradas, responsive breakpoints definidos até `2xl`, MIT no Tailwind. Diferencial vs crypto-marketing: aqui os widgets de UI são genuinamente de finanças pessoais (não só troca de palavras).
- **Contras:** visual é o mesmo template Nexsas com troca de copy — falta DNA fintech real (sem gráficos de cotação, conexões bancárias, extrato de transações, transferências, Open Banking UI). Placeholders `{=$class}` no markup final. Copy inconsistente: contact section fala "homeownership journey" e badge "Why Choose Us" (não combina com finanças), why-choose-us menciona "Finwise smart" em um template "Nexsas". Ícones de feature são shapes próprios da fonte next-sass (ns-shape-*) que só renderizam se a fonte for carregada. Densidade alta de seções no index pode parecer过度.
- **Ideal para:** base sólida para landing de app de finanças pessoais / PFM / educação financeira / dashboard de budgeting — customização de copy + adição de gráficos reais (spending categories, monthly trends, savings rate) fecha o nicho.
- **Evitar para:** quem precisa de banking core (transferências, pagamentos, contas), Open Banking UI, dashboards de investimento com cotação ao vivo, ou visual "challenger bank" estilo Nubank/Revolut (esse template é sóbrio/corporativo).

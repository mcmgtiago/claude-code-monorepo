---
slug: ai-chatbot
nome: Nexsas — AI Chatbot Landing
nicho: SaaS / AI Chatbot
estilo: Moderno, neumórfico claro, dark mode nativo, Tailwind utility-first
qualidade: 8
paleta_principal: #864ffe, #a585ff, #83e7ee, #c6f56f, #13171e
fonte_titulo: Inter Tight (Google Fonts)
fonte_corpo: Inter Tight (Google Fonts)
densidade_secoes: média
uso_recomendado: Landing page de produto SaaS para chatbots IA com fluxo de marketing completo (hero, features, pricing, integrações, prova social, CTA).
limitacoes: Template monolítico — exige reescrita para React/Next.js (HTML estático + jQuery/plugins). Copy de placeholder em várias seções ("lorem ipsum", "Contrary to popular belief").
---

# Nexsas — AI Chatbot

Template do mega-bundle **NextSaaS** (47 templates) voltado para uma landing page de produto de chatbot com IA. Stack: HTML + Tailwind CSS (compilado em `./assets/main.css`), JS vanilla para animação/interação. Fonte única via Google Fonts (`Inter Tight`). Tema light + dark nativo via classes `dark:`.

Identidade visual: card-based, cantos generosos (20–32px), gradientes radiais sutis em backgrounds e elementos decorativos, microinterações com parallax/spring animate (`data-ns-animate`, `data-spring`, `data-parallax-value`).

## Páginas disponíveis

Total: **52 páginas HTML** servidas a partir da raiz do template (algumas compartilhadas com outros templates do bundle, todas linkadas pelo header/menu).

**Marketing / Funil principal**
- `index.html` — landing AI Chatbot (página analisada)
- `features.html`, `services.html`, `service-details.html`
- `pricing.html`, `download.html`
- `integration.html`, `use-case.html`, `process.html`
- `why-choose-us.html`, `our-manifesto.html`
- `documentation.html`, `tutorial.html`

**Prova social & autoridade**
- `about.html`, `team.html`, `team-details.html`
- `career.html`, `career-details.html`
- `customer.html`, `customer-details.html`
- `case-study.html`, `case-study-details.html`
- `testimonial.html`, `success-stories.html`
- `press.html`, `brandkit.html`

**Conteúdo & SEO**
- `blog.html`, `blog-details.html`
- `whitepaper.html`, `whitepaper-details.html`
- `glossary.html`, `glossary-details.html`
- `changelog.html`, `faq.html`
- `analytics.html`, `security.html`

**Aquisição & conversão**
- `affiliates.html`, `affiliate-policy.html`, `referral-program.html`
- `login.html`, `signup.html`, `contact.html`, `support.html`

**Legal**
- `privacy-policy.html`, `terms-conditions.html`, `gdpr.html`, `legal.html`, `refund-policy.html`

**Sistema**
- `404.html`

## Seções encontradas (na index.html)

Markup delimitado por comentários HTML `<!-- ========================= ... =========================-->`. Sequência exata (linhas):

1. **Header** (linha 105) — pill-shaped fixed, mega-menu "Explore", dark mode toggle, login/signup.
2. **Mobile Menu** (linha 1140) — sidebar off-canvas com submenus colapsáveis.
3. **Hero section** (linha 1588) — título "Automate your chats effortlessly", badge "Chatbot", input de email + CTA "Get started", 8 imagens orbitais com parallax, mockup de chat.
4. **AI Feature section** (linha 1760) — grid 12 colunas com 3 cards (vendas automatizadas, suporte IA, analytics), cards com mini chat UI inline, avatares com gradiente.
5. **Feature V2 section** (linha 2389) — 2 sub-blocos alternados (texto + imagem), cada um com floating cards decorativos (light/dark variants).
6. **Pricing section** (linha 2642) — 3 planos, toggle mensal/anual, lista de features, CTA por plano.
7. **Integration section** (linha 3131) — marquee horizontal de logos (Notion etc.) com CTA circular central e fade nas bordas.
8. **Understanding section** (linha 3270) — dashboard mockup central com cards flutuantes empilhados, gradient background.
9. **Testimonial section** (linha 3423) — marquee horizontal de cards 3D flip (front/back) com rating "4.9".
10. **CTA section** (linha 3641) — título + 3 trust signals (no credit card, 30-day trial, money back).
11. **Footer v3** (linha 3733) — colunas de links, social, newsletter, bg image.

## Recursos e diferenciais visuais

- **Dark mode first-class**: tokens `bg-background-2/5/6/7`, `dark:` em quase todo elemento. Toggle no header.
- **Microinterações**: `data-ns-animate` (entrada), `data-spring` (física), `data-parallax-value` (parallax por eixo), `data-spring-duration`. Cards 3D flip em testimonials via `perspective-[1000px]`.
- **Paleta acento**: roxo primário `#864ffe` (CTA, badges), mint `#83e7ee` (acentos), lime `#c6f56f` (online dot, success). Acento linear-gradient `#FFF → #A585FF` em avatares.
- **Backgrounds decorativos**: gradientes lineares verticais em bordas laterais (`#ECE8FF → #FAF9FC` no light, `#1b232f → #13171E` no dark), blur de 25px no header (`backdrop-blur-[25px]`).
- **Logos marquee** infinito com fade lateral via gradiente absoluto.
- **Cards oversized**: cantos `rounded-[20px]` e `rounded-4xl` (32px), sombras suaves (`shadow-7`, `shadow-2`).
- **Animações de borda** com marcadores rotacionados 45deg.
- **Badges pill** com variantes (`badge-green-v2`) para categorizar seções.

## Notas de qualidade

**Pontos fortes**
- SEO meta-tags completos (Open Graph, Twitter cards, canonical, structured keywords).
- Acessibilidade: `sr-only`, `aria-label`, `figcaption`, `<time datetime>`, `loading="lazy"` em imagens.
- Responsividade cuidadosa: breakpoints `min-[425px]/[500px]/sm/md/lg/xl/2xl` com ajustes finos (largura máxima do header cresce progressivamente).
- Tema dark maduro: variantes light/dark em quase todas as imagens (`block dark:hidden` + `hidden dark:block`).
- Inter Tight é escolha sólida para SaaS moderno, com escala completa 100–900.

**Pontos fracos**
- Copy de placeholder visível: "lorem ipsum" literal aparece na seção Integration (linha 3146) e em cards de feature ("Contrary to popular belief").
- HTML estático com classes utilitárias Tailwind muito densas — refatoração para componente React/Next seria trabalhosa.
- Dependência de JS proprietário (`data-ns-animate` + `parallax-effect`) — sem o bundle JS, animações ficam inertes (estado `opacity-0`).
- Mega-menu requer JS para toggle (`data-menu="explore-mega-menu"`).
- Estrutura de pastas mistura assets próprios (`./assets/main.css`) com assets compartilhados do bundle — risco de paths quebrados se isolado.
- 52 páginas com muito conteúdo duplicado de header/footer — mudanças globais exigem edição em N arquivos.

---
slug: crypto-marketing
nome: Nexsas Crypto Marketing
nicho: Marketing e promoção de criptomoedas / Web3
estilo: SaaS corporativo moderno com toques crypto (dark mode primário)
qualidade: 7
paleta_principal: "#864ffe" (primary-500 roxo) + #1a1a1c (secondary) + #83e7ee (ns-cyan) + #f9eb57 (ns-yellow)
fonte_titulo: Inter Tight
fonte_corpo: Inter Tight
densidade_secoes: alta
uso_recomendado: Landing page para agências/consultorias de marketing crypto, lançamentos de token, plataformas DeFi com foco em growth, whitepapers e referral programs
limitacoes: Identidade visual ainda muito "SaaS genérico" — pouca diferenciação crypto real (sem gráficos on-chain, tickers, wallets, dashboards); copy placeholder {=$class} espalhado; alguns SVGs são placeholders sem preenchimento
---

# Nexsas Crypto Marketing

Template do mega bundle NextSaaS (StaticMania) focado em marketing de criptomoedas. Mesmo design system e tokens do bundle Nexsas, com copy/tema adaptado para Web3, ICO/IDO, NFT marketing, trading e referral.

## Páginas disponíveis

47 arquivos HTML cobrindo praticamente todos os fluxos de marketing:

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

Hero pt-[200px] com dot-grid de fundo, badge "WEB3" e CTAs gêmeos (Get started + Explore agora)
About Section com tab-bar filtrável (All / Crypto Trading / NFT Project / Token listing / ICO Marketing) e 4 cards de serviços (NFT marketing, DeFi growth, SEO crypto, community mgmt)
How it works section em container dark (`bg-secondary`) com 3 etapas numeradas + badges blur amarelo/verde
Services section "In-depth overview of crypto currency solutions" — grid de 6 serviços (ICO, IDO, IEO, Token Listing, NFT, DeFi marketing) com ícones SVG
Stats inline (até 4 colunas: projetos lançados, traders ativos, volume, satisfaction)
Timeline Integration section em card arredondado com border duplo (claro/escuro) e 5 etapas de processo
Testimonial section com 3 reviews (badge "Review", avatar circular, nome/role/crypto project)
Blog section com 3 cards (badge "Blog", "news & insights") em background cinza
CTA v1 final com headline "Need any help? We're here for you!" e botão "Get Assistance"
Footer full-width `bg-secondary` com gradientes blur laterais (roxo + ciano) + 4 colunas de links + newsletter + social + bottom bar

## Recursos visuais

- Tailwind CSS v4.1.4 (build completo em `assets/main.css`, MIT License)
- Fonte única: **Inter Tight** (Google Fonts) — 100–900, italic
- Tokens CSS em `:root`: paleta `primary-50→600` (roxo `#864ffe` dominante), `secondary #1a1a1c`, `accent #fcfcfc`, backgrounds 1–12, strokes 1–9, paleta "ns" (`ns-yellow #f9eb57`, `ns-green #c6f56f`, `ns-cyan #83e7ee`, `ns-red #ffb9a2` + variantes light/ivory/linen)
- Gradientes prontos: `gradient-5`, `gradient-7` (white→cyan), `gradient-8` (white→primary-400)
- Dark mode nativo via classe `dark:` (default no body: `bg-background-2 dark:bg-background-5`)
- Animações via atributos `data-ns-animate data-direction data-delay data-duration data-offset` (sistema próprio da Nexsas — IntersectionObserver em `main.js`)
- Ícones SVG inline (hero, services, social) — sem lib externa tipo Lucide
- Ícone de fonte próprio `next-sass.ttf/woff/svg/eot` (kit da Nexsas)
- Badges reutilizáveis: `badge badge-green`, `badge badge-blur`
- 312 ocorrências de animações `data-ns-animate` no index — motion denso
- Containers: `main-container` e `2xl:max-w-[1440px] mx-auto` para hero escuro

## Notas de qualidade

- **Prós:** bundle muito completo (47 páginas), dark mode first, tokens consistentes, copy já adaptada ao nicho crypto (ICO/IDO/IEO, NFT, DeFi, whitepaper, referral), animações bem amarradas, responsive breakpoints definidos até `2xl`, MIT no Tailwind.
- **Contras:** visual é o mesmo template Nexsas SaaS com troca de copy — falta DNA crypto (tickers, gráficos de preço on-chain, wallets, charts, 3D coins). Placeholders `{=$class}`, `{=$span-class}`, `{=$badge-text}`, `{=$hide-gradient}` no markup final (template não foi totalmente "dessalinizado"). SVGs de algumas seções vêm com paths sem preenchimento. Densidade alta de seções no index pode parecer过度 (hero → about → how → services → stats → timeline → faq → testimonial → blog → cta).
- **Ideal para:** base sólida para landing de agência crypto, ICO launch, referral program — customização de copy + adição de gráficos reais fecha o nicho.
- **Evitar para:** quem precisa de dashboard DeFi, wallet UI, charts on-chain ou visual cyberpunk/Web3 (esse template é sóbrio/corporativo).
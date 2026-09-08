---
slug: neural-networks
nome: Neural Networks — Nexsas
nicho: AI / SaaS / Tech / Agentes / Automação
estilo: Editorial-tech moderno, limpo, claro, com acentos neon sutis
qualidade: 8
paleta_principal: "#0d0d12"  # background-13 — preto profundo
fonte_titulo: Sora (sans-serif geométrica) — também usa Instrument Serif para acentos
fonte_corpo: Inter Tight (sans-serif) + IBM Plex Mono em pontuação
densidade_secoes: alta
uso_recomendado: Landing pages de plataformas de IA/ML, marketing SaaS técnico, páginas de produto com ênfase em soluções + casos + integrações. Bom para pitches e decks técnicos.
limitacoes: Branding "Nexsas" fortemente acoplado (logo, nome em CTAs, copy). Sistema de components com `<Component src="...">` exige build com Vite + vite-plugin-html-inject (HTML cru do dev não monta). Footer referencia partial extra não documentado.
---

# Neural Networks — Nexsas

Template NextSaaS (bundle "Mega Bundle") com 17 páginas HTML montadas em build Vite + Tailwind v4 a partir de partials `.htm` injetados via `vite-plugin-html-inject`. Identidade visual "Nexsas" — AI/ML SaaS marketing site.

## Páginas disponíveis

17 entradas HTML, todas roteadas para componentes em `src/components/<seção>/`:

| Página | Arquivo | Composição |
|---|---|---|
| Home | `index.html` | hero, clients, solutions, track-record, experience, pricing, ecosystem, testimonial, blog, cta |
| About | `about.html` | about-hero, clients (reuso), vision-and-mission, vision-video, team, cta |
| Services | `services.html` | services-hero, services-track-record, cta |
| Service details | `service-details.html` | details-hero, services-track-record, cta |
| Blog index | `blog.html` | blog-hero, famous-blog, cta |
| Blog post | `blog-details.html` | details-hero, details-markdown, details-related-blog, cta |
| Case study | `case-study.html` | case-study-hero, cta |
| Case study details | `case-study-details.html` | case-study-details-hero, cta |
| Team | `team.html` | team-hero, core-values, cta |
| Team member | `team-details.html` | details-hero, details-core-values, cta |
| Pricing | `pricing.html` | pricing-hero (reusa home/pricing), review-cards, cta |
| Contact | `contact.html` | contact-form |
| Integration | `integration.html` | integration-hero, faq, cta |
| Testimonial | `testimonial.html` | testimonial-hero, review-cards |
| Login | `login.html` | login-hero (form) |
| Signup | `signup.html` | signup-hero (form) |
| 404 | `404.html` | not-found-hero |

## Seções (index.html)

Na ordem em que `index.html` (`bg-background-8` claro, `src/components/home/*`):

1. **Hero** (`hero.htm`) — H1 Sora "AI that transforms businesses, drives growth"; sub, CTA "Request a demo"; figura central grande (opai-img-300.png, 709px); três cards flutuantes com parallax (membro da equipe, "Dev team" com counter 87%, showcase de produto). Animações `data-opai-animate` + `data-move-up-on-scroll-element`.
2. **Clients** (`clients.htm`) — strip de 9 logos monocromáticos (Scapic, Notion, Hotjar, Discord, Dropbox, Stripe, Spotify, Asana, Secure Space).
3. **Solutions** (`solutions.htm`) — grid 12-col, 5–8 cards (Deep Learning, Computer Vision, NLP & Transformers, …) com ícones `ns-shape-*`, links para `service-details.html`.
4. **Track Record** (`track-record.htm`) — heading + 3 case studies (E-Commerce, Healthcare, Finance) com imagem, overlay escuro e texto sobreposto.
5. **Experience** (`experience.htm`) — heading + 3–4 cards "Experience AI in action" (builders, deploy, analytics), cada um branco/escuro alternando, com imagens laterais.
6. **Pricing** (`home/pricing.htm`) — heading branco sobre background `opai-35.jpg`; 3 tiers (Starter $49/mo, Pro, Enterprise) com lista de features e CTA.
7. **Ecosystem** (`ecosystem.htm`) — cards de integração (Slack, Discord, Notion, GitHub, Zapier, Google Drive…) com ícones SVG.
8. **Testimonial** (`testimonial.htm`) — 4+ cards (Jordan Smith, Mia Thompson, etc.) com avatar e quote.
9. **Blog** (`home/blog.htm`) — 3 posts com `blog-card.htm` compartilhado, badges "Press"/"Blog".
10. **CTA** (`shared/cta.htm`) — card "Elevate your business with intelligent solutions" + botão "Learn more".

Padrões compartilhados: cada seção em `<section>` com `py-[80px] md:py-[120px] xl:py-[156px]`, headings `font-sora text-sora-heading-{2,3,4}` centralizados, parágrafos `text-tagline-{1,2}` Inter Tight em `text-background-13/60`. Atributos `data-text-reveal`/`data-opai-animate` controlam GSAP/SplitText reveal-on-scroll.

## Recursos visuais

- **Tipografia**: 7 famílias via Google Fonts — Sora (títulos, com letter-spacing negativo), Inter Tight (corpo), Instrument Serif (acentos serif), Manrope, Space Grotesk, Funnel Display, IBM Plex Mono.
- **Paleta real** (de `src/styles/variable.css`): 14 backgrounds quase-monocromáticos (`#0d0d12` → `#f1f4f6`, escala de cinza-azulada), 3 strokes, 9 cores marca "opai-" (yellow `#fff049`, purple `#8d59ff`, blue `#227eff`, lemon `#d0ff00`, green `#09f647`, red `#ff6b51`, orange `#ff7300`, cyan `#5ddcf6`, indigo `#5f50ff`) e 27 gradients (lineares + radiais + cônicos — o cônico `#30e3ff → #734cff → #fff181 → #ff4c52` é destaque).
- **Componentes reutilizáveis** (`src/components/shared/`): `card/services-card.htm`, `card/ecosystem-card.htm`, `card/testimonial-card.htm`, `card/blog-card.htm`, `button/link-primary.htm`, ícones `ns-shape-*`, navbar fixo (pill) com mega-menu, footer escuro `bg-background-5`, modal.
- **Animações**: GSAP + ScrollTrigger + SplitText + Lenis (vendor em `dist/vendor/`), counter, text-reveal (`data-text-reveal`), parallax cards, mobile menu off-canvas, accordion, modal, marquee, smooth scroll.
- **Header**: pill fixo `fixed top-5` centrado com `backdrop-blur`, mega-menu Company, mega-menu Solutions, dropdown Pages.
- **Schema.org** presente (`Service`, `Product`, `SoftwareApplication`, `Organization`, `ItemList`) em quase todas as seções — bom SEO.
- **Acessibilidade**: `aria-labelledby`, `role="list"`/`listitem`, `itemprop`, `sr-only` em logos, alt text consistente.

## Notas de qualidade

**Pontos fortes (8/10)**

- Componentes limpos, separação clara entre shells (head, nav, footer, cta) e seções por página.
- Tema escuro/claro via CSS variables (`@theme { --color-background-* }`) — fácil de re-tematizar.
- Header fixo com mega-menu e gradient gradient-band é referência sólida de SaaS moderno.
- Build pipeline completo: Vite + Tailwind v4 + Terser + auto-deploy Vercel (`npm run deploy`).
- README detalhado com tabela de páginas e instruções de extensão.
- Schema.org consistente.

**Pontos fracos / atritos**

- Vínculo forte com a marca "Nexsas" — logo, nome em todos os CTAs, headings ("How Nexsas began", "The minds Behind Nexsas"). Re-branding exige refactor global.
- Footer (`shared/footer.htm`) referencia um `<Component>` "extra não documentado" — o próprio README avisa para removê-lo em produção, o que é cheiro de partial de demo do marketplace.
- Cores "opai-*" (yellow/purple/blue/lemon etc.) não aparecem como accents fortes nas seções vistas; a paleta dominante é cinza/preto/branco com sutis pops. É neutro, mas pode parecer sem assinatura cromática.
- `<Component src="...">` é dependência de build (não HTML estático puro) — quem só quer abrir o `index.html` no browser não vê nada renderizado sem `npm run dev`.
- `pricing.html` reusa literalmente `home/pricing.htm` dentro de um wrapper (`<Component src="src/components/home/pricing.htm" />`) — desperdício leve.
- Tipografia é genérica-SaaS (Sora + Inter Tight) — não tem assinatura tipográfica forte. Risco: visualmente indistinguível de 30 outros templates NextSaaS.

**Avaliação**: sólido 8/10. Reaproveita bem como base técnica — estrutura de componentes + tema + animações + build chain são o que vale. Mas copy/visual pedem rework para não parecer mais um SaaS template genérico.

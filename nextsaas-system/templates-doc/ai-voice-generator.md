---
slug: ai-voice-generator
nome: AI Voice Generator (Nexsas)
nicho: AI / SaaS — geração de voz por IA (TTS, voice cloning, voice changer)
estilo: Soft brutalist editorial — dark hero com vídeo de fundo, cards arredondados (rounded-4xl), serif/negrito contraste em destaques em cor de marca (linen/bege)
qualidade: 8
paleta_principal: #beab9a (linen/bege marca) sobre #1a1a1c (secondary charcoal) e #fcfcfc (accent off-white); realces em #f9eb57 (amarelo) e #c6f56f (verde); fundo neutro #f4efe7 (ivory) e #fcfcfd (bg-1)
fonte_titulo: Inter Tight (Google Fonts, weights 100–900, italics)
fonte_corpo: Inter Tight (mesma família, hierarquia por peso — body 400, headings 500–600)
densidade_secoes: alta
uso_recomendado: Landing page para produtos de IA conversacional / TTS / voice cloning; SaaS B2B + B2C com seção pricing multi-tier (Free/Pro/Team/Enterprise) e toggle anual; uso em creators, e-learning, podcasts, ads, enterprise training, storytelling e gaming.
limitacoes: Tema único fixo em light (`data-force-theme="light"`); single-page densa (index.html = 22.611 linhas) com muito conteúdo duplicado em marcadores por celebrity/marquee; vídeo de fundo (./video/big-circle.mp4) exige hosting próprio; ícones em font custom "next-sass" (.eot/.woff) — substituição necessária se rebrandar; copy hard-coded em inglês sem i18n hooks; pricing mostra 4 tiers estáticos sem backend.
---

# AI Voice Generator (Nexsas)

Template NextSaaS focado em produto de IA para geração de voz. Estrutura editorial single-page com 9 seções principais, header sticky e footer institucional de 5 colunas.

## Páginas disponíveis

Total: **47 HTMLs** em `/main/templates/ai-voice-generator/`.

Core (referenciadas no index): `index.html`, `about.html`, `pricing.html`, `features.html`, `integration.html`, `faq.html`, `contact.html`, `blog.html`, `career.html`, `team.html`, `services.html`, `documentation.html`, `support.html`, `tutorial.html`, `customer.html`, `success-stories.html`, `case-study.html`, `use-case.html`, `changelog.html`, `process.html`, `why-choose-us.html`, `our-manifesto.html`, `whitepaper.html`, `press.html`, `testimonial.html`, `glossary.html`, `brandkit.html`, `analytics.html`, `security.html`, `affiliates.html`, `referral-program.html`, `vendor/*`.

Auth/legais: `login.html`, `signup.html`, `download.html`, `terms-conditions.html`, `privacy-policy.html`, `refund-policy.html`, `affiliate-policy.html`, `gdpr.html`, `legal.html`, `404.html`.

Detalhe: `blog-details.html`, `career-details.html`, `case-study-details.html`, `customer-details.html`, `service-details.html`, `team-details.html`, `whitepaper-details.html`.

## Seções (index.html)

1. **Header / Navbar** — sticky, logo + menu com dropdowns, CTA "Get started".
2. **Hero (line 2196)** — full-width com `<video>` autoplay/muted/loop de fundo (`./video/big-circle.mp4`), badge "We're live on productHunt", H1 "Your voice, reinvented by AI." (cor `text-accent` claro sobre vídeo escuro), sub-headline + CTAs + hero mockup visual.
3. **Trusted by / Logos marquee (line 3627)** — "Trusted by 10,000+ creators" + faixa infinita de logos de clientes (Hotjar, etc).
4. **Voice styles grid (line 3880)** — "Choose from the voice styles" — cards horizontais com avatares/play de 12+ vozes (Marie Curie, Leonardo da Vinci, Einstein, Newton, Edison, Ada Lovelace, Jane Goodall, Darwin, Tesla, Hawking, Malala).
5. **Voice samples (line 4720)** — "Hear the difference" — grid de demos com player waveform.
6. **Features / Services (line 19612)** — fundo `bg-ns-ivory`, badge "Features", "Powerful AI voice tools built for everyone". 5 features: API integration, Text to speech, Voice cloning, AI voice changer (mais uma).
7. **Use cases marquee (line 20313)** — "Tailored for every creator and team" — cards horizontais roláveis: E-learning, Podcasts, Ads & marketing, Enterprise training, Storytelling, Gaming & animation.
8. **Process steps (line 20483)** — "How it works" — 4 passos numerados: Write or paste script / Choose your voice style / Customize the delivery / Generate & download.
9. **Integration (line 20664)** — full-bleed escuro "Seamless tool integration" com logos Canva/Notion/Adobe/Google Slides/Webflow e CTA "Explore integration".
10. **Testimonials (line 21012)** — fundo `bg-ns-ivory`, "Proven results, real voices" — cards com logo empresa + quote + avatar + nome (Priya S., Nora Kim, etc).
11. **Pricing (line 21357)** — "Flexible pricing for every stage" — toggle Monthly/Yearly (badge "save 40%"), 4 tiers: Free, Pro, Team, Enterprise, com lista de features cada.
12. **CTA final (line 22177)** — "Start creating stunning voiceover today" + botão signup.
13. **Footer (line 22269)** — 5 colunas (logo+social, company, resources, legal, newsletter), logo + copyright + scroll-to-top.

## Recursos visuais

- **Vídeo de fundo** no hero (`./video/big-circle.mp4`) — autoplay, muted, loop, playsinline, com overlay escuro.
- **Marquees horizontais** duplos (logos + use cases) — CSS animation, pausa em hover.
- **Cards arredondados `rounded-4xl`** com sombras suaves (`shadow-1`, `shadow-2`) — padrão visual dominante.
- **Badges** variantes: `badge-metal`, `badge-ivory`, `badge-white` — pill com border.
- **Player de áudio** com waveform animado (linha 4720+).
- **Animações on-scroll** via atributo `data-ns-animate data-delay` (lib própria `ns-` namespace).
- **Icon font custom** "next-sass" (`fonts/next-sass.{eot,svg,ttf,woff}`) — não Iconify/Lucide.
- **Logo prata/dourado** em SVG inline; ícones sociais próprios.
- **Pricing toggle** estilizado (switch pill com knob animado, badge "save 40%" rotacionado).
- **Accordion / tabs** — presente em sub-páginas (features, FAQ), não no index.
- **Tema dark preparado** mas desativado por `data-force-theme="light"` (variáveis `--color-background-5/6/7/8` ficam disponíveis para reativar).

## Notas de qualidade

**Pontos fortes:** Tailwind CSS v4 com tokens CSS custom (`@theme`); 35+ páginas prontas cobrindo funil completo; acessibilidade razoável (ARIA labels, schema.org ItemList/WebPageElement/Organization, alt texts); SEO meta completo (OG, Twitter cards, canonical, geo tags); design coeso e profissional — visual editorial com contraste linen sobre charcoal é distintivo e atual (2024-25 trend). CSS modular (`assets/main.css` único) e JS único (`main.js`) — fácil de manter.

**Pontos fracos:** index.html monolítico (22.611 linhas) — não componentizado; copy 100% em inglês sem hooks i18n; várias seções com markup repetido (voice cards quase idênticos, copy-paste de testimonial cards); vídeo hero requer hosting próprio (~5-15MB MP4); font custom "next-sass" no lugar de solução padrão (Iconify/Heroicons); pricing sem integração Stripe/payment real; theme switcher JS presente mas bloqueado em light; sem `<noscript>` fallback para vídeo; schema.org markup repetido em duplicata (cada card tem próprio itemscope).

**Avaliação 8/10:** template premium vendável "as-is" para agência de marketing/IA que precisa entregar landing rápida. Requer refactor mínimo para produção real (modularizar, traduzir, hospedar vídeo em CDN). Fonte Inter Tight + paleta linen/charcoal dá identidade forte — não é genérico.

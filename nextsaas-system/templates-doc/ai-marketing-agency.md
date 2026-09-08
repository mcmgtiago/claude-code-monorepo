---
slug: ai-marketing-agency
nome: Nexsas — AI Marketing Agency
nicho: agência de marketing digital / IA
estilo: dark futurista com seções claras intercaladas; glassmorphism + glow gradients
qualidade: 9
paleta_principal: #0d1017
fonte_titulo: Sora (font-sora / text-is-heading-*)
fonte_corpo: Inter Tight (font-inter-tight) + IBM Plex Mono (font-ibm-plex-mono) para CTAs/eyebrows
densidade_secoes: alta
uso_recomendado: landing de agência de marketing/IA, posicionamento premium, captura de leads B2B, vitrines SaaS de serviços criativos
limitacoes: identidade visual muito opinativa (logo "Nexsas", mascote "Opai", nomes de classes `opai-*`), exige troca de marca para reuso; nav pill flutuante frágil em viewports estreitos; sem dark-mode toggle (já é dark por default); copy toda em EN
---

# Nexsas — AI Marketing Agency

Template premium do bundle **NextSaaS (47 templates)**. Mesmo esqueleto do `nexsas-*` (header pill flutuante com mega-menu, design tokens `background-N` + `opai-purple/blue`, stack Tailwind v4). Diferencial: copy dirigida a "AI marketing agency" (crescimento local, social media, paid ads, automação, marcas parceiras), herói com avatar trust-stack, radial-gradient hero glow, serviços com **slide-up image reveal** no cursor, e logos de ferramentas de IA (Gemini, Claude, ChatGPT, etc.) em órbita circular no "Tech Stack".

## Páginas disponíveis

- `index.html` — landing completa (analisada abaixo).
- `about.html` — sobre a agência.
- `services.html` + `service-details.html` — listagem e detalhe de serviços.
- `case-study.html` + `case-study-details.html` — cases / portfólio.
- `team.html` + `team-details.html` — equipe.
- `pricing.html` — planos.
- `blog.html` + `blog-details.html` — blog.
- `contact.html` — contato.
- `login.html`, `signup.html` — auth.
- `404.html` — erro.
- `site.webmanifest`, favicons, OG image Prismic.

## Seções (index.html)

Ordem top→bottom, todas com padding generoso `py-14 → 2xl:py-44` e header eyebrow com SVG sparkle + texto `text-tagline-4` em `font-inter-tight`:

1. **Header / Nav** (`<header>`, L102) — pill flutuante `fixed top-6`, `bg-background-2/15 backdrop-blur-[80px]`, `max-w 350 → 1290px`. Logo, mega-menus (Company, Resources, Pages), CTA "Get started". Mega-menu usa `bg-background-14` com `border-stroke-3/20` e hover glow `from-[#8D59FF66]`.
2. **Hero** (L1677) — `bg-background-5 #11141d`, padding-top 150/200/220px. Headline `text-is-heading-1` (`Sora`): "Intelligent, community-focused & AI-powered marketing". CTA `bg-background-7` com seta deslizante. **Avatars + trust indicator** abaixo ("3.2k+ reviews"). Anima `data-opai-animate` com delay escalonado.
3. **Clients** (L2408) — fundo claro (não usa `bg-*` — herda claro). Logo wall com 8+ marcas (Scapic, Notion, etc.) em `flex-wrap` + `max-md:scale-85`.
4. **Services** (L2493) — `bg-background-5`. Eyebrow "Our Services". H2 "Marketing solutions that drive results". 5 itens com `divide-stroke-1/11 divide-y` e **cursor image-reveal** (`data-image-reveal-cursor`, hover desliza imagem 386×292px rounded-xl).
5. **Why Choose Us** (L2778) — `bg-background-5`, **4 cards** com grid `md:grid-cols-2 lg:grid-cols-4` e scroll-scrub `data-stairs-wrapper` (`data-scrub="true"`, `data-base-offset="200"`). Efeito escada ao rolar.
6. **Our Tech Stack** (L2911) — `bg-white`. **Mosaic de logos orbitando** — 24+ ícones (Gemini, Lovable, Claude AI, Qwen, DeepSeek, Runway, ChatGPT, Mistral, Grok, Perplexity, Google Ads, GitHub) em duas instâncias rotativas sobre fundo claro, blur top/bottom.
7. **Case Study** (L3103) — `bg-white`. Grid 2×2 (4 cases) com overlay gradient `from-0% to-100%` (azul/violeta) e badge "Marketing · AI".
8. **About** (L3795) — `bg-background-5`. Border-line expansiva (`data-opai-border-expand`) com avatares centralizados, sliders/marquee de logos.
9. **Our Process** (L4038) — `bg-background-5`. H2 "How we work" com palavra "work" em `font-instrument-serif` itálico claro (destaque serif). 4 etapas em grid `lg:grid-cols-4`.
10. **Testimonial** (L4121) — `bg-background-5`. Marquee horizontal com **9 cards** brancos (`bg-white rounded-lg`), estrelas `fill-[#FFF049]`, avatares, texto.
11. **Partnership / "Certified by the Best"** (L5349) — `bg-background-7 #f8f9fa`. **3 cards** com glow esquerdo `bg-[#B962E7] blur-[90px]` (parceiros/certificações).
12. **Blog** (L5640) — `bg-background-7`. 2 linhas × 3 cards (6 posts), imagens grandes + tag + título + meta.
13. **CTA final** (L5987) — `bg-background-6 #0d1017` com `overflow-hidden`, headline "Let's scale your brand with AI", CTA pill `bg-background-11`, avatares trust + linhas decorativas (L1/L2).
14. **Footer** (L6152) — `bg-background-6`, padding-top 50→176px. Newsletter input (`border-stroke-3/30`), colunas de links, social, copyright.

## Recursos visuais

- **Glassmorphism nav**: `backdrop-blur-[80px]` + `bg-background-2/15` + border `stroke-3/18` em pill `rounded-[15px]`.
- **Gradientes radiais de glow**: `#8D59FF66` (roxo), `#227EFF` (azul), `bg-[#B962E7] blur-[90px]` (parcerias).
- **Image reveal no cursor** (Services): `data-image-reveal-cursor` com `h-[386px] w-[292px]`, transition follow-mouse.
- **Scroll-scrub stairs** (Why Choose Us): wrapper GSAP-style com `data-scrub="true"`.
- **Border expand animation** (About): `data-opai-border-expand data-length="100%"`.
- **Marquee horizontal** de testimonials e logos (classe `cards-marquee-container`).
- **Sparkle SVG eyebrow** repetido em todas as seções (caminho estrela 16×16 viewBox).
- **CTA pill com seta deslizante**: texto sobe `-translate-y-[105%]` no hover, círculo preto com seta desliza para fora/entra nova.
- **Logo wall rotativa** (Tech Stack): dois grupos de logos opostos em órbita.
- **Tipografia mista**: `font-sora` (títulos `text-is-heading-*`), `font-inter-tight` (sub/eyebrows), `font-ibm-plex-mono` (CTAs/labels), `font-instrument-serif` (destaques serif itálico em "work").

## Notas de qualidade

- **9/10**. Tailwind v4 + CSS custom properties (`background-1..14`, `stroke-1/3`, `opai-purple/blue`) — sistema de design bem definido e reaproveitado em todas as 14 páginas.
- Animações consistentes via atributos `data-opai-animate`, `data-opai-border-expand`, `data-image-reveal*` consumidos pelo `assets/main.js`.
- Responsividade cuidadosa: `max-md:`, `max-sm:`, breakpoints `sm/md/lg/xl/2xl` em quase todo lugar, container `main-container` central.
- Acessibilidade OK: `aria-label`, `sr-only`, `alt` em todas as imagens, `aria-hidden` em SVGs decorativos.
- **Limitações reais**: nomes de classes proprietárias (`opai-*`), identidade de marca "Nexsas" + mascote "Opai" espalhada (eyebrow SVG, copy "Nexsas"), exige rebranding completo para cliente real. Sem toggle de tema (já é dark), copy 100% EN. `tailwindcss v4.1.13` — versão bleeding-edge.
- HTML grande (6550 linhas no `index.html`) e CSS 166KB minified, JS 70KB — performance depende de lazy-load das imagens (que são PNGs/SVGs locais em `./images/`).

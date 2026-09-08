---
slug: time-tracking
nome: Nexsas Time Tracking
nicho: SaaS genérico (produtividade / timesheet / freelancer / payroll)
estilo: Modern dark, dark-first com tema claro opcional, hero em vídeo full-bleed, cards arredondados (rounded-2xl/3xl/4xl), animações GSAP/Lenis/Swiper, ênfase em produtividade
qualidade: 7
paleta_principal: "#c6f56f (verde lima ns-green) + #1a1a1c (preto secundário) + #7c31f6 (roxo primário)"
fonte_titulo: Inter Tight (Google Fonts)
fonte_corpo: Inter Tight (Google Fonts)
densidade_secoes: alta
uso_recomendado:
- Landing de SaaS de time tracking / produtividade
- Páginas com hero em vídeo e lista de features com badges verdes
- Projetos que já aceitam stack Tailwind + GSAP + Lenis + Swiper
- Templates com tema dark/light via toggle
limitacoes:
- Identidade visual é genérica do bundle NextSaaS (não é nicho-específico)
- Hero depende de arquivo de vídeo local (video/getty-watch.mp4)
- Copy mistura referências a "finanças", "investimentos" e "time tracking" — inconsistente entre seções
- Sem dashboard real do app; só marketing/landing
- JS pesado: GSAP, ScrollTrigger, DrawSVG, MotionPath, Lenis, SplitText — overkill para landing simples
---

# Nexsas Time Tracking

## Páginas disponíveis
- `index.html` — landing principal (analisada)
- `about.html`, `contact.html`, `pricing.html`, `features.html`
- `login.html`, `signup.html`, `download.html`
- `blog.html`, `blog-details.html`, `case-study.html`, `case-study-details.html`
- `team.html`, `team-details.html`, `career.html`, `career-details.html`
- `customer.html`, `customer-details.html`, `testimonial.html`, `success-stories.html`
- `services.html`, `service-details.html`, `use-case.html`, `process.html`, `why-choose-us.html`, `our-manifesto.html`
- `faq.html`, `documentation.html`, `tutorial.html`, `support.html`
- `integration.html`, `security.html`, `analytics.html`, `brandkit.html`
- `affiliates.html`, `referral-program.html`, `whitepaper.html`, `whitepaper-details.html`
- `press.html`, `changelog.html`, `glossary.html`
- Páginas legais: `legal.html`, `privacy-policy.html`, `terms-conditions.html`, `gdpr.html`, `refund-policy.html`, `affiliate-policy.html`
- `404.html`

## Seções (index.html)
1. **Header fixo pill** — logo Nexsas + nav com mega menu (Company / Pages / Blog / Support / Pricing) + CTA "Get started", com `data-ns-animate` reveal e blur backdrop.
2. **Mobile menu sidebar** — drawer lateral com toggle hamburger (off-canvas à direita, full-screen).
3. **Hero com vídeo full-bleed** — `<video>` autoplay/muted/loop (`video/getty-watch.mp4`), pt-[170px] até pb-[200px], container com cantos arredondados (xl:rounded-[50px]), badge pill "Keep an eye on your finances", h1 com gradient + 3 checkmarks bullets ("Automated time tracking", "In-depth productivity reports", "Effortless project management") + 2 CTAs (verde `btn-green` e outline `bg-accent/20`).
4. **Features section (grid 3+2)** — bg `background-3`, badge "Features", h2 "Powerful features to elevate your business", grid 12-col com 5 articles (3 na primeira linha + 2 centralizados): Live activity tracking, Team collaboration tools, Automated timesheets, Seamless integrations, Customizable workflows — cada um com imagem (versão light + dark).
5. **Success metrics / stats** — bg `secondary` (preto #1a1a1c) com 3 cards circulares: ícone verde ns-green + número animado via `data-counter` (100+ Active projects, 250K+ Hours tracked, 99% Uptime).
6. **Why Choose Us (split layout)** — bg `background-4`, card branco arredondado (rounded-4xl) com 6 features em 3 colunas (esquerda + imagem central + direita): Flexible & user-friendly, AI-Powered insights, Cloud-based & secure, Fast pre-approvals, Simple process, Free 3-month trial. Imagem central destacada `ns-img-206.png`.
7. **Features v2 (hero card + 3 cards)** — bg `background-2`. Card hero full-width "Time & Attendance Tracking" com círculos concêntricos decorativos (border rings) e ícones flutuantes (Figma, Dropbox, Slack, Asana, Google Drive, Vector). Abaixo grid de 3 cards: Project-Based Tracking, Invoice generation, Seamless payroll integration.
8. **Customer feedback / testimonials** — Swiper com 5 slides (Robert Anderson/Microsoft, Jennifer Martinez/Oracle, David Thompson/Intel, Michael Wilson/Amazon AWS, Emily Rodriguez/Google Cloud) com avatares circulares gradient (laranja/azul/verde), gradient overlay decorativo e CTA "View all Reviews".
9. **CTA v2** — bg white, layout 2-col: esquerda com badge "Get started", h2 "Start tracking smarter today" e parágrafo; direita com form (input email pill + botão verde "Get started") + 2 trust pills ("No credit card required", "14-Day free trial").
10. **Footer** — bg `secondary` (preto) com gradients decorativos (imagens ns-img-493/494), logo + tagline + 6 social icons + 3 colunas (Company / Support / Legal Policies) + copyright "Nexsas – smart application for modern business".
11. **Theme toggle** — botão fixo bottom-right com dark/light icon (Sun/Moon).

## Recursos visuais
- **Vídeo hero full-bleed** com `getty-watch.mp4` (autoplay, muted, loop, scale-[1.1], object-cover)
- **Gradientes circulares decorativos** (background blobs laranja/azul nos cards de testimonial)
- **Background gradients no footer** (`ns-img-493.png` direita, `ns-img-494.png` esquerda)
- **Animações GSAP/Lenis** — `data-ns-animate` com `data-direction`, `data-offset`, `data-delay`, `data-duration` (entradas em reveal on scroll); `split-text.min.js` para animação de texto; `draw-svg.min.js` para traçar SVGs
- **Swiper slider** para testimonials
- **Number counter** (`number-counter.js`) para estatísticas animadas
- **Infinite marquee** disponível (vendor carregado mas não usado nesta página)
- **Ícones SVG inline** + sprite próprio `next-sass.woff/ttf` (icon font)
- **Imagens pareadas light/dark** — cada feature image tem versão `ns-img-XXX.png` + `ns-img-dark-XXX.png` (toggle via classe `dark:`)
- **Círculos concêntricos decorativos** com `border-[#E6EAF0]` (3 anéis de 399/350/288px) com ícones flutuantes posicionados absolutamente
- **Avatares gradient** com `bg-linear-[156deg,_#FFF_32.92%,_#FFB9A2_91%]` (laranja/azul/verde) para testimonials
- **Mega menu** com ícones SVG inline e hover state em background-3
- **Botões com variants** — `btn-green`, `btn-white`, `btn-secondary`, `btn-accent`, `btn-dark`, `btn-transparent` em múltiplos tamanhos (`btn-md`, `btn-lg`, `btn-xl`)
- **Cards rounded** — `rounded-[12px]`, `rounded-2xl`, `rounded-[20px]`, `rounded-4xl` conforme contexto
- **Badge pill** verde `badge-green-v2` ("Features", "Why choose Nexsas?", "Customer success")
- **Form CTA** com input pill (border-stroke-1, focus:border-primary-600) e botão verde
- **Theme toggle** fixed com Sun/Moon icons

## Notas de qualidade
- **Stack técnico**: Tailwind CSS (variants customizadas `ns-green`, `bg-background-3` etc.) + GSAP + ScrollTrigger + Lenis (smooth scroll) + Swiper + Leaflet (carregado mas não usado aqui) + SplitText + DrawSVG + MotionPath + StackCard + NumberCounter + Vanilla Infinite Marquee. JS vendorizado em `/vendor/` (não CDN).
- **Performance**: 14 scripts vendor carregados no footer; peso considerável. Vídeo hero autoplay pode ser pesado em mobile.
- **Acessibilidade**: ARIA labels pontuais (`aria-label="Use Case Overview"`, `sr-only` em ícones sociais); falta skip-link e foco visível consistente.
- **SEO**: Meta tags completas (OG, Twitter Card, canonical, theme-color #000000, geo meta, robots); mas imagens sem `loading="lazy"` no hero/features.
- **Inconsistência de copy**: Hero fala de "time tracking" mas badge diz "Keep an eye on your finances"; Why Choose menciona "financial journey", "long-term growth", "pre-approvals", "fair rates" — copy claramente reaproveitado de outro template (provavelmente fintech/loan) sem adaptação real para time tracking.
- **Design system sólido**: Tokens CSS bem definidos (`--color-primary-500: #864ffe`, `--color-secondary: #1a1a1c`, `--color-accent: #fcfcfc`, escalas de background-1 a 9, ns-green), dark mode consistente em todas seções.
- **Reutilização**: Estrutura típica do bundle NextSaaS (header pill + hero + features grid + stats + why + testimonials + CTA + footer). Cada template do bundle herda esse esqueleto mudando paleta e copy.
- **Responsividade**: Breakpoints sm/md/lg/xl/2xl bem explorados; layout colapsa corretamente para mobile (nav vira hamburger, grids viram 1-col, hero vira centralizado).
- **Animações**: Reveal on scroll com `data-ns-animate` (muito usadas — basicamente toda section tem); counter numérico nos stats; gradient overlay ativo no slide central do swiper.
- **Bundle size**: 3805 linhas em index.html; CSS e JS não minificados; vendor scripts separados.
- **Qualidade percebida**: 7/10. Visual moderno e dark mode caprichado, mas copy genérica/inconsistente, JS pesado, e é um template genérico — exige trabalho editorial para soar específico do nicho de time tracking.
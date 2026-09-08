---
slug: email-marketing
nome: Nexsas Email Marketing
nicho: email marketing SaaS
estilo: SaaS moderno, soft tech, dual light/dark
qualidade: 9
paleta_principal: #864ffe
fonte_titulo: Inter Tight
fonte_corpo: Inter Tight
densidade_secoes: alta
uso_recomendado:
  - Landing de produto SaaS de email marketing/transactional
  - Páginas que precisam de dark mode nativo sem perda de contraste
  - Sites institucionais SaaS com muitas páginas (47+) e fluxos de auth
limitacoes:
  - Identidade visual "Nexsas" aparece em todas as páginas (logo + copy), exige rebranding
  - Tailwind CSS via classes utilitárias + `@theme` customizado; refatorar para outro stack custa
  - Animações dependem de `data-ns-animate` (lib interna `assets/main.js`), não Framer/GSAP
  - Ícones mistos: SVG inline em algumas seções + `next-sass` icon font em outras
  - Imagens mockadas (ns-img-* numeradas) e avatares não substituem ativos reais
---

# Nexsas Email Marketing

Template focado em SaaS de email marketing com pegada "AI-powered". Mesmo bundle (NextSaaS Mega Bundle) reaproveita header, footer e componentes em todas as páginas — a diferença entre "nichos" (email-marketing, hr-management, etc.) é o tema e o copy do index, não a estrutura.

## Páginas disponíveis

47 arquivos `.html` na raiz do template:

- Core: `index`, `features`, `pricing`, `services`, `process`, `security`, `integration`, `analytics`, `documentation`
- Auth: `login`, `signup`, `download`, `404`
- Marketing: `about`, `team`, `career`, `why-choose-us`, `our-manifesto`, `press`, `whitepaper`, `changelog`
- Conteúdo: `blog`, `blog-details`, `case-study`, `case-study-details`, `customer`, `customer-details`, `testimonial`, `success-stories`, `use-case`
- Suporte: `faq`, `support`, `tutorial`, `glossary`, `glossary-details`, `service-details`
- Empresa: `affiliates`, `affiliate-program`, `referral-program`, `brandkit`
- Detalhes longos: `team-details`, `career-details`, `whitepaper-details`
- Legal: `privacy-policy`, `terms-conditions`, `gdpr`, `legal`, `refund-policy`

Assets em `assets/main.css` (Tailwind compilado + theme tokens) e `assets/main.js` (animações `ns-animate`, marquee, dropdown, counters).

## Seções (index.html)

1. **Header v1** — Pill fixa no topo, logo + nav com mega-menu `company` / `platform` / `resources`, theme toggle, CTAs login/signup
2. **Hero section** — Headline "Transform your email marketing with AI-powered precision", badge verde, dois CTAs, mockup de email rotacionado sobre fundo gradient mesh
3. **Customer feedback section** — Card escuro com avatares empilhados ("Trusted by 20k+"), quote, logo marquee
4. **Feature Highlights** — "Nexsas your smart email choice", grid 2-col com imagem + bullets + check-list
5. **Feature section** — "Features that set Nexsas apart", 6 cards: drag-and-drop builder, transactional email API, SMTP relay & webhooks, advanced A/B testing, deliverability management, real-time analytics
6. **Process section** — 3 passos numerados: connect platform → design & automate → optimize & scale
7. **Stats section** — 60% project completed, 25 team members, 71 satisfied clients (counters animados)
8. **Pricing section** — 3 planos: Simplified, Basic, Enhanced, com toggle mensal/anual
9. **Reviews section** — 6 testimonials com avatar, nome, cargo, quote, estrelas
10. **FAQ section** — Accordion com 4+ perguntas (build, customize, integrations, pricing)
11. **CTA section** — Card "Take your email marketing to the next level" com botão primário
12. **Footer v3** — 4 colunas (logo + social, company links, platform links, resources), bottom bar com legal

## Recursos visuais

- Cores: primary `#864ffe` (purple), primary-400 `#a585ff`, primary-600 `#7c31f6`; secondary `#1a1a1c`; accent `#fcfcfc`
- Backgrounds: `#fcfcfd` → `#181d26` (9 níveis, light → dark)
- Accents decorativos: `ns-yellow #f9eb57`, `ns-green #c6f56f`, `ns-red #ffb9a2`, `ns-cyan #83e7ee`, `ns-ivory #f4efe7`, `ns-linen #beab9a`
- Gradientes: `--color-gradient-5` (white→transparent), `gradient-6` (cyan→green), `gradient-7` (white→cyan)
- Tipografia: única fonte — **Inter Tight** (Google Fonts), pesos 100-900
- Iconografia: font `next-sass` (woff/ttf em `/fonts`) + SVGs inline nas seções de header/menu
- Padrões de fundo SVG: `ns-img-109.svg` (light) e `ns-img-dark-81.svg` (dark) usados no hero
- Componentes utilitários: badge (badge-green), btn (btn-primary/secondary/white/dark/accent), shadow-4, rounded-4xl, marquee

## Notas de qualidade

- **Pontos fortes**: design system coeso, dark mode real (não é gambiarra), SEO meta + OG/Twitter completos, animações de scroll via `data-ns-animate`, 47 páginas cobrem praticamente qualquer jornada SaaS
- **Tailwind v4-style**: `@theme` customizado com tokens `--color-*` mapeando para classes utilitárias (`bg-background-1`, `text-accent/60`, etc.)
- **Acessibilidade**: ARIA labels em seções e botões, `sr-only` em logos, `role="group"` em avatar clusters, accordion com `aria-expanded`
- **Limitações práticas**: assets fotográficos são placeholders numerados (`ns-img-422.jpg` etc.) — toda página precisa de sessão de troca de imagens; copy é "Nexsas" em todos arquivos, busca/substituição global é obrigatória
- **Stack lock-in**: reescrever para outro framework (React/Next) requer extrair tokens e reimplementar `ns-animate` (não é GSAP/Framer)
- Fonte carregada via Google Fonts CDN (`preconnect` para fonts.gstatic.com) — funciona offline só com fallback system-ui
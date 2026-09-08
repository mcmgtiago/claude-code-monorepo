---
slug: ai-agency
nome: AI Agency
nicho: Automação & Consultoria IA
estilo: Moderno / Tech-forward
qualidade: 9
paleta_principal: #864ffe
fonte_titulo: Inter Tight
fonte_corpo: Inter Tight
densidade_secoes: Alta
uso_recomendado: Agências de IA, consultoria de automação, SaaS B2B, soluções empresariais
limitacoes: Focado em narrativa B2B de alto valor; menos customização visual por seção; target audience profissional (CXOs)
---

# AI Agency

Template premium para agências de IA e consultoria de automação.

## Páginas disponíveis

- index.html (homepage principal)
- about.html
- services.html
- features.html
- pricing.html
- blog.html & blog-details.html
- case-study.html & case-study-details.html
- contact.html
- team.html, career.html, testimonial.html
- faq.html, documentation.html, tutorial.html
- login.html, signup.html
- privacy-policy.html, terms-conditions.html
- 25+ suporte & recursos (security, gdpr, integration, etc.)

## Seções (index.html)

### 1. **Hero Section** (linha ~2687)
- Background com imagem parallax (ns-img-169.png)
- Call-to-action principal com copywriting forte
- Formas geométricas animadas (left/right shapes)
- Spring animation no eixo Y

### 2. **Features** (linha ~3197)
- Badge verde "Features"
- Título: "Automation that fits your needs."
- Grid de cartões com ícones (SVG)
- Scroll reveal animation

### 3. **Services** (linha ~3317)
- Badge "Services"
- Imagem de fundo parallax
- Descrição: "AI services that deliver real results"
- Layout clean com dark/light toggle

### 4. **Process Section** (linha ~3412)
- Badge "Process"
- Sticky title no desktop (lg:sticky lg:top-28)
- Flex layout: 1 coluna esquerda (sticky) + cards direita
- Gap: 140px horizontal

### 5. **Projects/Case Studies** (linha ~3596)
- Badge "Projects"
- Título: "Proven AI solutions in action"
- Card grid com projeto showcase
- Scroll trigger animations

### 6. **Stats/Metrics** (linha ~3764)
- Sem badge
- Fundo escuro (secondary/background-8)
- KPIs em row com border-radius 20px
- Padding: lg:px-60 py-14

### 7. **Testimonials** (linha ~3843)
- Título: "What our clients are saying"
- Slider Swiper com reviews
- Fundo com imagem parallax
- Delay stagger: 0.2 → 0.4

### 8. **Pricing** (linha ~4063)
- Badge "Pricing plans"
- Toggle Monthly/Billing
- Plans com pricing cards
- Feature matrix integrada

### 9. **CTA Final** (linha ~4691)
- Fundo: secondary dark (preto)
- Título branco: "Let's build a smarter tomorrow"
- Botão primário → CTA em contact.html

### 10. **Footer** (linha ~4722)
- Mega menu com 3 colunas
- Links para recursos, compliance, integrações
- Dropdown structure (resources-mega-menu)

## Recursos visuais

**Paleta de Cores:**
- Primária: #864ffe (Roxo premium)
- Secundária: #1a1a1c (Preto/Charcoal)
- Accent (claro): #fcfcfc (Branco neutro)
- Background: Gradiente #fcfcfd → #13171e (Light → Dark mode)
- Destaque: #c6f56f (Verde neon), #83e7ee (Cyan), #f9eb57 (Amarelo)

**Tipografia:**
- Font: Inter Tight (Google Fonts)
- Weights: 100-900
- Fallback: sans-serif

**Animações:**
- NS-Animate (scroll reveal)
- Parallax effects no hero
- Spring transitions (duration: 1.9s)
- Stagger delays: 0.2 → 0.5s
- Swiper.js para testimonials

**Componentes:**
- Badges (green, blur, yellow variants)
- Buttons (btn-primary, btn-secondary, hover states)
- Cards com rounded-20px padrão
- Dropdowns com mega-menu structure
- Grid responsive (max-w-1290px container)

## Notas de qualidade

- **Estrutura:** Bem segmentada (10+ seções principais)
- **Responsividade:** Breakpoints mobile/tablet/desktop/xl/2xl
- **Dark mode:** Full support (dark: prefixes em Tailwind)
- **Acessibilidade:** sr-only labels, semantic HTML
- **Performance:** Lazy loading de imagens, CSS otimizado
- **UX:** Navegação clara, CTAs estratégicos, social proof (testimonials + stats)
- **Compliance:** Páginas de legal, GDPR, privacy integradas
- **Conversão:** 3 CTAs principais (hero, final, pricing)

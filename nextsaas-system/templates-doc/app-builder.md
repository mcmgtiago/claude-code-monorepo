---
slug: app-builder
nome: Nexsas App Builder
nicho: SaaS, no-code platforms, productivity apps, web application builders
estilo: modern, minimal, clean, professional, tech-focused
qualidade: 9
paleta_principal: "#864ffe"
fonte_titulo: "Inter Tight"
fonte_corpo: "Inter Tight"
densidade_secoes: média
uso_recomendado: "Plataformas de no-code/low-code, ferramentas de criação de apps, SaaS de produtividade, landing pages B2B tech"
limitacoes: "Otimizado para desktop/tablet; animações avançadas requerem JS polido; imagens hero grandes precisam otimização"
---

# Nexsas App Builder

Template premium para plataformas de construção de aplicativos sem código (no-code/low-code). Foco em demonstração de poder, funcionalidades intuitivas e conversão de usuários técnicos. Design moderno com animações de entrada e navegação mega-menu sofisticada.

## Páginas disponíveis

1. **index.html** – Homepage (hero com CTA, use cases, features, contador, workflow, trust section)
2. **features.html** – Recursos principais e capacidades
3. **process.html** – Processo de construção de apps
4. **security.html** – Segurança, compliance e dados
5. **pricing.html** – Planos de preço
6. **integration.html** – Integrações e parceiros
7. **blog.html** – Blog/artigos
8. **tutorial.html** – Tutoriais e guias
9. **faq.html** – Perguntas frequentes
10. **contact.html** – Formulário de contato
11. **login.html** / **signup.html** – Autenticação
12. **about.html** – Sobre a empresa
13. **team.html** – Time
14. **customer.html** / **customers.html** – Casos de clientes
15. **testimonial.html** – Depoimentos
16. **case-study.html** – Case studies
17. **privacy-policy.html** / **terms-conditions.html** – Legal
18. **changelog.html** – Histórico de mudanças

## Seções (index.html)

### 1. Hero Section (pt-[150px] md:pt-[190px] lg:pt-[230px])
- **Layout:** Centralizado, full-width
- **Componentes:** 
  - H1 com destaque em purple (#864ffe) em "powerful apps"
  - Descrição concisa do problema/solução
  - 2 CTAs: "Start building free" (btn-secondary) + "Watch demo video" (btn-white)
  - Imagem hero grande com parallax
- **Animação:** data-ns-animate com delays (0.2–0.6s)
- **Background:** Pattern SVG de fundo (light/dark mode)

### 2. Use Cases Section (bg-background-4 dark:bg-background-5)
- **Badge:** "Integration"
- **Heading:** "Designed for makers, **teams & entrepreneurs**" (purple accent)
- **Layout:** 2 colunas (esquerda: texto sticky; direita: stack de cards)
- **Cards:** 4 items empilhados com ícones (Startups, Business teams, Freelancers & agencies, Educators & creators)
- **Altura:** min-h-[255px] em mobile
- **Spacing:** pt/pb 14 md:16 lg:88 xl:150 (padrão NextSaaS)

### 3. Features Section (bg-background-3 dark:bg-background-7)
- **Badge:** "Core features"
- **Heading:** "Everything you need to **build & launch smarter**"
- **Grid:** 12 colunas com layout assimétrico:
  - Item 1 (col-8): "Drag & drop builder" (featured, large)
  - Item 2 (col-4): "Real-time preview" (small com gradient overlay)
  - Item 3 (col-4): "Custom workflows & automation"
  - Item 4 (col-8): "Secure data management"
- **Border:** 8px white border (border-8) + dark mode com background-9
- **CTA:** "Start building free" centralizado

### 4. Counter/Progress Section
- **3 colunas:** Select template → Customize → Deploy
- **Numeração:** 01, 02, 03 em text-primary-500
- **Progress bars:** Animadas (width 25% no primeiro)
- **Cores:** bg-stroke-2 light / dark:bg-stroke-6 com ns-green progress
- **Spacing:** pt/pb 14 md:16 lg:88 xl:100

### 5. Feature v2 Section (Reasons to select us)
- **Layout:** 2 colunas (lg:col-7 left com imagens com spring animation, lg:col-5 right com texto)
- **Badge:** "Reasons to select us"
- **Heading:** "Why **thousands trust** us to build their apps"
- **Features list:** 4+ items com ícones (ns-shape icons) + descrição
- **Imagens:** 4 figuras com overlays e rotações (rotate-[8deg], spring animations)
- **Cores:** Purple accent em "thousands trust"

### 6. Footer & Additional Sections
- Mega menu navegação com Company, Platform, Resources, Plans & Support
- Mobile sidebar com collapsible submenus
- Newsletter signup
- Legal links (Privacy, GDPR, Terms, etc.)

## Recursos visuais

| Recurso | Detalhe |
|---------|---------|
| **Imagens Hero** | ns-img-150.png até ns-img-159.png (light); ns-img-dark-104.png até 113.png (dark) |
| **Icons/Shapes** | ns-shape-1 até ns-shape-84 (SVG inline) |
| **Logos** | main-logo.svg + logo.svg em /images/shared |
| **Backgrounds** | SVG patterns com parallax |
| **Animações** | data-ns-animate com delays, spring transforms, fade overlays |

### Paleta de cores
```css
--color-primary-500: #864ffe (botões, accents, headings)
--color-primary-600: #7c31f6 (hover states)
--color-primary-200: #dcd4ff (backgrounds claros)
--color-secondary: #1a1a1c (texto dark mode)
--color-accent: #fcfcfc (texto light mode)
--color-background-1: #fcfcfd (cards claros)
--color-background-3: #f4f5f8 (sections light)
--color-background-4: #f0f2f6 (alt sections light)
--color-background-5: #13171e (alt sections dark)
--color-background-6: #0f1217 (background dark primary)
--color-background-7: #181d26 (alt dark sections)
--color-stroke-1: #dfe4eb (borders finos light)
--color-stroke-5: #4a525e (borders escuros)
--ns-green: [dynamic per theme] (progress bars)
```

### Tipografia
- **Família:** Inter Tight (Google Fonts)
- **Headings:** 
  - H1: 4.25rem, 110% line-height, Medium (500)
  - H2: 3.25rem, 120% line-height, Medium (500)
  - H5: 1.5rem, 140% line-height, Normal (400)
  - H6: 1.25rem, 140% line-height, Normal (400)
- **Body:** 
  - Tagline-1: 1rem, 150% line-height, Normal (400)
  - Tagline-2: 0.875rem, 150% line-height, Normal (400)
  - Tagline-3: 0.75rem, 150% line-height, Normal (400)

### Componentes Reutilizáveis
- **Buttons:** btn-md, btn-lg, btn-xl + variantes (secondary, white, white-dark, transparent)
- **Badges:** badge-green com ícone + texto
- **Cards:** p-6/p-8 + border-stroke com gradientes
- **Animações:** data-ns-animate com delay, direction, offset, spring, duration

## Notas de qualidade

**Pontos fortes:**
1. Navegação mega-menu sofisticada e responsiva (desktop/mobile colapsível)
2. Animations suaves (Framer Motion ou similar) com data attributes
3. Layout assimétrico nas features (não-linear, visualmente interessante)
4. Dark mode completo e bem executado
5. Micro-interações (hover states, progress animations)
6. Responsive design mobile-first (max-md, md:, lg:, xl: breakpoints)
7. Acessibilidade: sr-only, aria-labels, semantic HTML

**Limitações conhecidas:**
1. JavaScript necessário para animações de entrada e parallax
2. Imagens hero grandes (.png) → considerar WebP + lazy loading
3. Stack cards em mobile pode parecer comprimido
4. Mega menu fixa no topo ocupa bastante espaço em viewports pequenos
5. Sem fallback visual se JS desabilitado

**Customização comum:**
- Trocar `#864ffe` (purple) por brand primary em search/replace
- Ajustar headings de H1/H2 nas seções
- Customizar CTAs ("Start building free" → "Try for free", etc.)
- Adicionar Google Analytics na head
- Trocar imagens ns-img-* por assets reais
- Ajustar menu items em header nav
- Customizar footer links e social media

## Estrutura de arquivos

```
/templates/app-builder/
├── index.html
├── [page-files].html (features, pricing, etc.)
├── assets/
│   ├── main.css (Tailwind compilado, ~9000+ linhas)
│   └── main.js (animações, interatividade, dados)
├── images/
│   ├── ns-img-150.png até ns-img-159.png
│   ├── ns-img-dark-104.png até 113.png
│   ├── icons/ (SVG inline nos components)
│   ├── shared/ (logos)
│   └── vendors/ (dependencies)
├── fonts/ (Inter Tight via Google Fonts)
└── vendor/ (dependencies)
```

## Meta tags & SEO

- Title: "App Builder || Nexsas"
- Description: "Build powerful apps without writing a single line of code"
- OG image: og-image.jpg (1200x630)
- Robots: index, follow
- Canonical: https://next-sass-html.vercel.app/
- Theme color: #000000

---

**Qualidade:** 9/10 – Template robusto, moderno e pronto para produção. Performance otimizada com animações fluidas. Design limpo adequado para SaaS/tech. Único ponto: JS pesado para animações avançadas, considerar otimização em projetos com muitas imagens.

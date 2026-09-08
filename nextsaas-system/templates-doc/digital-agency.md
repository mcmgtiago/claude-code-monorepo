---
slug: digital-agency
nome: Nexsas Digital Agency
nicho: design studios, creative agencies, digital services
estilo: modern, minimal, premium
qualidade: 9
paleta_principal: "#864ffe"
fonte_titulo: "Inter Tight"
fonte_corpo: "Inter Tight"
densidade_secoes: média
uso_recomendado: "Portfolio de agências digitais, showcases de trabalho, demonstrações de serviços, landing pages B2B"
limitacoes: "Foco em imagens hero; requer conteúdo forte de project/case studies; animações avançadas requerem JS polido"
---

# Nexsas Digital Agency

Template premium de agência digital construído com Tailwind CSS. Focado em portfólios de projeto, showcases de serviço e conversão com animações suaves e componentes interativos.

## Páginas disponíveis

1. **index.html** – Homepage (hero rotating cards + sections)
2. **about.html** – Team & company story
3. **services.html** – Service listings com 3D flip cards
4. **projects.html** – Project showcase com grid destacado
5. **blog.html** – Article listing
6. **blog-details.html** – Article detail page
7. **contact.html** – Contact form
8. **pricing.html** – Pricing plans
9. **team.html** – Team members
10. **team-details.html** – Individual team bio
11. **process.html** – Workflow stages
12. **features.html** – Product/service features
13. **integration.html** – Tech stack integrations
14. **security.html** – Security & compliance
15. **faq.html** – FAQ accordion
16. **login.html** / **signup.html** – Auth pages
17. **privacy-policy.html** / **terms-conditions.html** – Legal pages

## Seções (index.html)

### 1. Hero Section (pt-30 md:pt-35 lg:pt-48)
- **Layout:** Hero text left (70%) + stats/marquee right (30%)
- **Componentes:** 
  - H1 + subtitle copy com text-reveal animation
  - 2 CTA buttons (Get Started em primary-500, Learn More em accent/60)
  - Avatar stack (3 usuarios) com counter animado
  - Stat cards duplos (95% satisfaction, 130+ projects)
  - Client logo marquee scrolling
- **Animação:** data-ns-animate com delays (0.1–0.5s)

### 2. Rotating Cards Carousel (Hero continuation)
- **Componente:** 12 cards em carrossel circular (data-rotating-wheel)
- **Cards incluem:** 
  - Título do serviço (brand, product design, digital experience, etc.)
  - Ícone shape (#ns-shape-1 até #ns-shape-84)
  - Imagem hero
- **Nota:** Height 76vh, overflow hidden com gradientes fade

### 3. Discover Section (pb-14)
- Circular text orbit com logo magnético central
- "DISCOVER OTHER PROJECT ON NEXSAS" spinning text
- data-circular-text + data-magnetic behavior

### 4. About Us (space-y-10/18)
- **Badge:** "ABOUT US" com star icon + gradient lines
- **Heading:** "From vision to reality—we build what your business needs to grow"
- **Layout:** 2 colunas (copy left + button right)
- **Stats Cards:** 3x col-span-4 (65+ partners, 14+ years, 20+ awards)
- **Featured Image:** Large col-span-4 row-span-2

### 5. Services (bg-white py-39/28/18)
- **Badge:** "SERVICES"
- **Heading:** "Smart solutions for growing brands"
- **Card Grid:** 4x col-span-3 (xl)
  - Front: Número + título + descrição curta
  - Back (3D flip): Lista 5 features com checkmarks + "Explore service" link
  - Services: UI/UX, Web Dev, Branding, Growth Marketing
- **Heights:** h-130 md:h-130 xl:h-155 com perspective-1000

### 6. Process Section (bg-white)
- **Badge:** "PROCESS"
- **Heading:** "From concept to conversion—a process built for real results"
- **Expandable Cards:** 3 cards com lg:data-active:w-[39.53%] (outros lg:w-[28.37%])
  - On hover/active: mostra imagem + gradient overlay
  - Stages: Discovery & Planning, Design Development, Scalable Build
  - Numeração: .01, .02, .03

### 7. Projects Showcase (pt/pb 39/28/18)
- **Badge:** "PROJECTS"
- **Heading:** "Where ideas become experiences"
- **Grid:** 12 cols com altura dinâmica (6n+1 370px, 6n+2 450px, 6n+3 280px, etc.)
- **Cards:** data-spotlight-card com imagem + gradient overlay + texto nome/descr
- **Projetos:** FinovaX Pro, Orbit Commerce, Lumora Health, Nexora CRM, Verdant Travel, Pulse Media

### 8. Testimonials/Stat Cards (pt/pb 39/28/18)
- **Badge:** "Trusted by Clients"
- **Heading:** "Trusted by forward-thinking companies"
- **Layout:** columns-1 sm:columns-2 xl:columns-4 (masonry)
- **Card Heights:** h-80 (varying heights para masonry effect)
- **Content:** Logo empresa + quote/stat

### 9. Additional Sections
- **FAQ:** accordion-style com data-faq-trigger
- **Blog preview:** card grid
- **Footer:** Links, newsletter signup

## Recursos visuais

| Recurso | Detalhe |
|---------|---------|
| **Imagens Hero** | ns-img-01.jpg até ns-img-20.jpg em /images |
| **Logos** | Client logos em /images/icons (scapic, lattice, notion, asana, etc.) |
| **Icons** | SVG inline (star, arrow, hamburger, etc.) |
| **Avatars** | ns-avatar-1/2/3.jpg |
| **Brand** | main-logo.svg + logo.svg em /images/logo |

### Gradientes principais
- `bg-linear-to-t from-black/70 via-black/20 to-transparent` (image overlays)
- `from-background-13 to-transparent` (fade edges em marquees)

### Paleta de cores
```css
--color-primary-500: #864ffe (botões CTA)
--color-secondary: #1a1a1c (texto dark)
--color-accent: #fcfcfc (botões secondary/backgrounds claros)
--color-background-13: #f2f5fa (hero background)
--color-stroke-1: #dfe4eb (borders finos)
```

### Tipografia
- **Família:** Inter Tight (Google Fonts)
- **Headings:** Medium (500) em sizes heading-1 até heading-6
- **Body:** Normal (400) em tagline-1 (1rem), tagline-2 (0.875rem), tagline-3 (0.75rem)
- **Line heights:** 110% (h1) até 150% (body)

## Notas de qualidade

**Pontos fortes:**
1. Animações fluidas (data-ns-animate + framer/similar)
2. 3D card flips funcionais (perspective + backface-hidden)
3. Responsive bem pensado (mobile-first com max-w customizado)
4. Componentes reutilizáveis (buttons, cards, badges)
5. Excelente visual hierarchy com spacing consistente

**Limitações conhecidas:**
1. JavaScript pesado para animações (requer lib de motion/animação)
2. Muitas imagens hero grandes → otimizar para web
3. Layouts circular/rotating cards podem ser problemáticos em mobile pequeno
4. Sem fallbacks óbvias para JS desabilitado

**Customização comum:**
- Trocar `#864ffe` por brand primary em busca/replace
- Ajustar texto de headings e CTAs em `data-text-reveal`
- Adicionar Google Analytics/tracking na seção header
- Customizar imagens de projeto e avatars

## Estrutura de arquivos

```
/templates/digital-agency/
├── index.html
├── [page-files].html
├── assets/
│   ├── main.css (Tailwind compilado, 9857 linhas)
│   └── main.js (animações, interatividade)
├── images/
│   ├── ns-img-01.jpg até ns-img-20.jpg
│   ├── icons/ (client logos)
│   └── logo/
├── fonts/ (auto-loaded)
└── vendor/ (dependencies)
```

## Meta tags & SEO

- Title: "Digital Agency || Nexsas"
- Description: Premium digital agency template com Tailwind CSS
- OG image: `og-image.jpg` (1200x630)
- Robots: index, follow
- Canonical: https://next-sass-html.vercel.app/

---

**Qualidade:** 9/10 – Template robusto, moderno e production-ready. Único ponto: animações requerem JS confiável.

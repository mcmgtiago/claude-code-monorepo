---
slug: insurance
nome: Insurance SaaS Template
nicho: Seguros digitais / Insurance Tech
estilo: Moderno, Premium, Professional
qualidade: 9
paleta_principal: #864ffe
fonte_titulo: Inter Tight
fonte_corpo: Inter Tight
densidade_secoes: média
uso_recomendado: Plataformas de seguros fintech; empresas de seguros digitais; marketplaces de seguros; consultoria seguros online
limitacoes: Focado em desktop responsivo; personalização requer conhecimento Tailwind CSS; 48 páginas podem demandar customização seletiva
---

# Insurance SaaS Template

## Páginas disponíveis

- index.html (Hero + Services + Features + Testimonials + FAQ + Contact)
- Navegação: 48 páginas incluindo pricing, blog, docs, autenticação, suporte
- Páginas chave: pricing.html, features.html, about.html, services.html, blog.html, login.html, signup.html, contact.html

## Seções (index.html)

### 1. Header v1 (Fixed Navigation)
- Navbar flutuante com logo responsivo
- Menu dropdown em 4 categorias:
  - **Company**: About, Services, Features, Blog
  - **Collaborate**: Affiliates, Referral, Login, Signup, Download, Integration
  - **Resources**: Documentation, FAQ, Case Studies, Whitepapers, Support, Use Cases, Analytics, Changelog, Glossary
  - **People & Culture**: Process, Team, Career, Testimonials, Customers, Contact
- Suporta light/dark mode com `dark:` Tailwind prefixes
- Totalmente responsivo: desktop nav + mobile hamburger
- Button CTA "Get started"

### 2. Hero Section
- Background image (ns-img-221.png)
- Headline: "Flexible insurance plans for your health, home, car, and future"
- Subheading: Mission-focused copy
- Dual CTA buttons: "Get a quote" + "Explore Coverage"
- Avatar stack (99+ Customers) com confiabilidade social
- Hero image com dark mode variant
- Marquee clientes (logos animados)
- Testimonial card com Jessica Lee, Head of Customer Success
- Decorative gradient shapes (ns-img-504.png)

### 3. Services Section
- Background alternada: background-2 (light) / background-5 (dark)
- Header: "One platform, multiple protections, personalized for you"
- 6 cards em grid 3x2 (lg), 2x2 (md), 1x1 (sm)
- Cada card possui ícone + título + descrição
- Serviços: Health, Life, Auto, Home (com variações)
- CTA: "Talk to an expert" button
- Padding: pt-16/md:pt-20/lg:pt-[90px] xl:pt-[100px]; pb similar

### 4. Why Us Section (Full-Width Dark)
- Background: color-secondary (#1a1a1c) com gradient overlay
- Decorative shape (ns-img-497.png)
- Conteúdo esquerda, imagem direita (lg responsivo)
- Heading: "Why Choose Nexsas?"
- 3 checkmark items com copy leve
- Button: "Talk to an Advisor" (btn-dark)
- Imagem (ns-img-209.png com dark variant)

### 5. Features Section (Personalized Coverage)
- 2-column layout (lg): imagem + conteúdo
- Badge: "Reasons to select us"
- Heading: "Personalized coverage that makes sense"
- 4 feature items com ícones:
  - Understand your options clearly
  - Choose your own coverage limits
  - File claims in minutes, not days
  - Access support from any device

### 6. Testimonial Section
- Background: background-2 (light) / background-5 (dark)
- Heading: "People's **share love**" (com destaque em primary-500)
- Testimonial card max-w-[740px]:
  - Quote blockquote (placeholder "...")
  - Avatar stack (5 avatars sobrepostos com z-index)
  - Nome + Role (placeholder)
  - Avatar clicável interativo

### 7. FAQ Section
- Split: Col 5 heading + Col 7 accordion items
- 5 accordion items com dropdown:
  1. What types of insurance does Nexsas offer?
  2. How much does insurance cost?
  3. Can I file claims online?
  4. Can I customize my policy?
  5. What makes Nexsas different?
- Cada item com gradient hover (ns-img-511.png)
- Plus icon animado ao expandir

### 8. Contact/CTA Section
- Left: Heading + Description + Support button
- Lista de contato (email, phone, address) com ícones
- Right: Contact form (name, email, message, terms checkbox)
- Form inputs com border-radius rounded-full (email/name) e rounded-xl (textarea)
- Botão "Send Message" ao final

## Recursos visuais

### Color System
- **Primary**: #864ffe (purple vibrant) - CTAs, highlights
- **Secondary**: #1a1a1c (dark navy) - texto principal
- **Accent**: #fcfcfc (quase branco) - contraste dark mode
- **Background palette**:
  - bg-1/2/3/4 (light modes: #fcfcfd → #f0f2f6)
  - bg-5/6/7/8/9 (dark modes: #13171e → #070b10)
- **Accent colors**: cyan (#83e7ee), green (#c6f56f), yellow (#f9eb57), red (#ffb9a2)
- **Gradients**: cyan-to-green, white-to-cyan, purple-primary

### Typography
- **Font**: Inter Tight (variable weight 100–900)
- **Load**: Google Fonts link no <head>
- **Weights**: 300–700 (light, normal, medium, semibold, bold)
- **CSS classes**: text-heading-5, text-heading-6, text-tagline-1, text-tagline-2, text-tagline-3

### Animations
- **Framework**: AOS-like (data-ns-animate com data-delay, data-direction, data-offset, data-start)
- **Effects**: Stagger delays (0.1s–1s), directional fade-in (up/left/right), parallax scroll
- **Buttons**: Hover state color swap, scale smooth
- **Accordions**: Slide toggle com max-height

### Images
- Tema: Insurance, segurança, confiança, tech
- Organizadas em `/images/` com variants dark
- Exemplo: ns-img-209.png (default) + ns-img-dark-142.png (dark mode)

## Notas de qualidade

- **Accessibilidade**: ARIA labels (aria-required, aria-hidden, role="region"), semantic HTML (<button>, <form>, <blockquote>)
- **Responsividade**: Tailwind breakpoints max-[400px], min-[425px], sm, md, lg, xl, 2xl
- **Performance**: Lazy load images, CSS minified, SVG icons inline
- **Estrutura**: Seções modularizadas em `<!-- ===== Section Name ===== -->` comments
- **Dark Mode**: Full dark: prefixes na paleta + theme toggle ready
- **Padrão**: Mobile-first design; progressive enhancement para desktop
- **Componentes reutilizáveis**: Buttons (btn-primary, btn-secondary, btn-dark, btn-light), badges (badge-cyan), cards, forms, gradients
- **Documentação**: Meta tags completos (SEO, OpenGraph, Twitter), favicon, manifest
- **Código**:
  - ~3.6K linhas index.html (estrutura limpa, indentação consistente)
  - Classes Tailwind bem organizadas (espaçamento, flexbox, grid)
  - Sem inline styles; tudo via CSS classes

## Próximos passos recomendados

1. **Brand swap**: Substituir Nexsas logo + cores primárias na paleta
2. **Content**: Preencher copys dinâmicos (testimonials, FAQs, serviços)
3. **Images**: Fazer upload de fotos e gráficos seguros customizados
4. **Forms**: Conectar backend (contact form, newsletter signup)
5. **Analytics**: Integrar Google Analytics, Mixpanel via script tags
6. **SEO**: Customizar meta tags e schema markup por página
7. **Localization**: Adicionar suporte multi-idioma (PT-BR, ES, EN)


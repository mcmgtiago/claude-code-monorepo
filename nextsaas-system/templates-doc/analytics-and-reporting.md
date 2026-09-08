---
slug: analytics-and-reporting
nome: Analytics and Reporting
nicho: SaaS, Business Intelligence, Data Analytics
estilo: Modern, Professional, Minimalist
qualidade: 9
paleta_principal: "#c6f56f"
fonte_titulo: Inter Tight
fonte_corpo: Inter Tight
densidade_secoes: média
uso_recomendado: Dashboard pages, analytics platforms, data reporting tools, business intelligence solutions, financial analysis interfaces
limitacoes: Héroe com imagem fixa, requer JS para contadores numéricos
---

# Analytics and Reporting

Template completo de landing page para plataformas de analytics e reporting. Construído com Tailwind CSS e Dark mode nativo. Design moderno com forte paleta verde-lima (#c6f56f) e suporte responsivo completo.

## Páginas disponíveis

- **index.html** — Landing page principal (4856 linhas)
- Arquivos de apoio: analytics.html, login.html, contact.html, blog-details.html, service-details.html, process.html

## Seções (index.html)

1. **Header** (Linha 105-1827)
   - Navegação sticky com mega menu responsivo
   - Logo adaptado (desktop/mobile)
   - Menu dropdowns: Company, Platform, Resources, Plan & Support
   - Tema toggleador (dark/light)

2. **Hero Section** (Linha 2401-2461)
   - Badge com texto "Over 50,000 reliable companies"
   - Título principal: "Showcasing the cutting edge of product evaluation"
   - CTA duplo: "Get started" + "Book a call"
   - Hero perspective image

3. **Features Section** (Linha 2466-2727)
   - 3 cards de features com layouts rotativos
   - Card 1: "Oversee project budgets" com overlay rotacional
   - Card 2: "Optimized data workflows" (verde-lima, com chart de barras)
   - Card 3: "Comprehend user interactions" (com chart de linhas)
   - Avatares agrupados com ícone interativo

4. **Services Section** (Linha 2732-2893)
   - 5 cards de serviços: Real-time analytics, Track Conversions, Sales Management
   - Ícones simbólicos (ns-shape-*)
   - Hover effect: translate-y -10px

5. **Process Section** (Linha 2898-3001)
   - 3 passos: Sign up, Set up analytic process, Reset data after solutions
   - Cards em grid flex wrap
   - CTA: "Try it for 30 days, no credit card required"

6. **FAQ Section** (Linha 3006-3230)
   - Accordion com 3 items (expandíveis)
   - Q1: "What is the primary role of a business agency?"
   - Q2: "What kinds of services should I anticipate from a business agency?"
   - Q3: "How often should I consider updating my website?"

7. **Integration/Partners Section** (Linha 3242-3454)
   - 2 marquees de logos: Google, Slack, Confluence, Snapchat, Figma, Microsoft, etc.
   - Gradientes fade-out nas laterais
   - Grid responsivo de 100px circles com SVGs

8. **Numbers/Stats Section** (Linha 3459-3525)
   - "Over a decade of experience in this"
   - Contadores numéricos (data-counter)
   - Layout 2 colunas

9. **Team Section** (Linha 3528-4080)
   - 4 membros da equipe (grid 1-2-4 colunas)
   - Avatar circular (156x156px) + info + social links
   - Social: Facebook, Dribbble, GitHub, LinkedIn (com hover effects)

10. **Newsletter Section** (Linha 4095-4180)
    - Email input + submit
    - Verificações: email + agendamento

11. **Blog Section** (Linha 4185-4792)
    - Grid assimétrica: 1 artigo grande (left) + 2 pequenas (right)
    - Tags, data publish, read time
    - Hover scale effect (101%)

12. **Footer** (Linha 4793+)
    - Theme toggle button com ícones
    - Copyrights e navegação

## Recursos visuais

**Cores (CSS Variables)**
- Primary (Purple): #864ffe, #7c31f6
- NS Green: #c6f56f (primary accent)
- NS Green Light: #e8fbc6 (badge bg)
- Secondary: #1a1a1c (dark text)
- Accent: #fcfcfc (light text)
- Background 3-6: #f4f5f8, #f0f2f6, #13171e, #0f1217
- NS Yellow: #f9eb57
- NS Red: #ffb9a2
- NS Cyan: #83e7ee

**Tipografia (Inter Tight)**
- Heading 1: 4.25rem / 110% line-height
- Heading 5: 1.5rem / 140% line-height
- Tagline 1-2: 1rem / 0.875rem
- Todos com fallback sans-serif

**Estrutura CSS**
- Tailwind CSS (compiled)
- Dark mode via classe `.dark`
- CSS Grid + Flexbox responsivo
- Animações via data-ns-animate (delays: 0.1-0.8)
- Transitions smoothas (duration-300 a 500ms)

## Notas de qualidade

- Design limpo e profissional, alinhado com padrões SaaS modernos
- Dark mode bem implementado com bom contraste
- Responsividade completa: mobile (425px) → xl (1140px)
- Acessibilidade: alt texts, aria-label, semantic HTML
- Performance: lazy-loading de imagens, otimização de SVG
- Animações subtle mas impactantes (fade-in, slide-up, scale-on-hover)
- Componentes reutilizáveis (badges, buttons, cards)
- 4856 linhas bem estruturadas com comentários HTML claros
- Integração com scripts: number-counter.js para animação de números

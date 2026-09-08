---
slug: lead-capture
nome: Lead Capture
nicho: SaaS / CRM
estilo: Modern, Professional, Data-driven
qualidade: 8
paleta_principal: #864ffe
fonte_titulo: Inter Tight
fonte_corpo: Inter Tight
densidade_secoes: média
uso_recomendado: "SaaS de captura e gestão de leads; plataformas CRM; ferramentas de marketing automation; softwares B2B"
limitacoes: "Foco em lead capture pode limitar aplicações em outros nichos; muitos CTAs para conversão podem parecer agressivos em alguns contextos"
---

# Lead Capture

Template NextSaaS completo para plataformas de captura, qualificação e gestão de leads. Totalmente responsivo, com dark mode, e construído com Tailwind CSS.

## Páginas disponíveis

47 templates inclusos:
- **index.html** (Home/Lead Capture) — Hero com badges animados, features dinâmicas, testimonials com flip cards
- about.html, team.html, careers.html
- features.html, pricing.html, blog.html
- dashboard pages (analytics.html)
- auth flows (login.html, signup.html)
- case studies, whitepapers, affiliate programs
- policy pages (privacy, terms, GDPR)
- suporte e documentação

## Seções (index.html)

1. **Header (Fixed Navigation)** — Logo responsivo, mega menu dropdown, dark/light toggle
2. **Hero Section** — H1 com keyword highlight ("Automate how you collect and qualify leads"), subheading, CTA, avatares + social proof, imagens background layered
3. **Feature Section 1** — 2-coluna: chart (User activity) + progress bars (lead sources: Google, YouTube, Instagram, Pinterest, Facebook) + callout "Custom reports"
4. **Feature Section 2** — "A one-stop solution" — 3-coluna layout (Our products | Hero image | Industries we serve) com lista de features checkboxed
5. **Feature Section 3** — "Your growth, our commitment" — 2 cards com ícones custom + subheading (Monitor stock performance, Real-time campaign monitoring)
6. **Why Us Section** — Left: heading + badge + feature list (4 items com ícones custom). Right: stacked product images com overlays
7. **Benefits Section** — Dark overlay background. 2-coluna: "Our products" (6 sources de leads) | "Industries we serve" (6 setores)
8. **Reviews/Testimonials** — Marquee carousel com 4 flip cards (reveal rating on hover)
9. **FAQ Section** — Left: heading + accordion (4 itens). Right: espaço vazio (flexível)
10. **CTA Final** — Email input + "Get started" button + trust badges (No credit card, 14-day free trial)
11. **Footer** — Logo, social links, 3 colunas links (Company, Support, Resources)

## Recursos visuais

- **Paleta Principal:**
  - Primary: #864ffe (roxo moderno)
  - Verde (accent): #c6f56f (neon green para highlights)
  - Cyan: #83e7ee (highlight secundário)
  - Backgrounds: gradação dark/light (white → dark navy)
  
- **Tipografia:**
  - Inter Tight (sans-serif, 100–900 weights)
  - Heading 1: 4.25rem (110% line-height)
  - Heading 2: 3.25rem (120%)
  - Body: 1rem (150%)
  
- **Componentes:**
  - Badges (cyan, green, blur effects)
  - Cards com rounded corners (20px)
  - Buttons (primary, secondary, white, accent) — xs/md/lg/xl sizes
  - Progress bars animadas
  - Flip cards com transform 3D
  - Custom icons (next-sass font face)
  - Marquee carousels
  - Accordions interativos
  - Animações scroll-triggered (data-ns-animate)

- **Imagens:**
  - Hero images responsivas (light/dark variants)
  - Dashboard mockups
  - Product screenshots
  - Avatar circles (overlapping user stack)
  - Background overlays degradados

## Notas de qualidade

- **Qualidade: 8/10**
  - Prós: Design polido, acessibilidade solid (ARIA labels), animations suaves, dark mode integrado, mega menu bem estruturado, responsividade excelente até mobile
  - Contras: Muito orientado a SaaS/lead gen (pode exigir customização pesada para outros nichos); algumas strings placeholder ("Until recently, lorem ipsum..."); imagens mockup genéricas
  
- **Performance:**
  - Lazy loading em imagens (loading="lazy")
  - CSS Tailwind otimizado
  - JS mínimo (animações CSS + vanilla JS para interações)
  - Light DOM structure, boa composição de classes
  
- **Acessibilidade:**
  - alt texts em todas as imagens
  - sr-only para labels screen reader
  - ARIA labels em sections (aria-label="...")
  - Accordion com button elements apropriados
  - Contraste de cores adequado (WCAG AA compliant nas cores padrão)
  
- **Customização:**
  - Variáveis CSS global (cores, tipografia, spacing)
  - Classes Tailwind bem organizadas
  - Fácil trocar paleta primary/accent
  - Textos em placeholders ou markup simples de buscar+substituir

---

**Caminho absoluto:** `C:/Users/Administrator/Downloads/ui88/Organizado/A - Dashboards & SaaS/NextSaaS - Mega Bundle (47 templates)/main/templates/lead-capture/`

**Arquivo principal:** `index.html` (3.649 linhas)

**Assets:** `/assets/main.css` (Tailwind compiled) + `/fonts/` (Inter Tight, next-sass icons) + `/images/`

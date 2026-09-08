---
slug: ai-gadgets
nome: AI Gadgets
nicho: SaaS / Smart Tech Product
estilo: Modern Minimal + Premium
qualidade: 8
paleta_principal: #1a1a1c
fonte_titulo: Inter Tight (400-700)
fonte_corpo: Inter Tight (400-600)
densidade_secoes: Alta
uso_recomendado: SaaS landing pages, smart home products, tech gadget showcase, product dashboards
limitacoes: Focused on AI/tech narrative; heavy animations; custom design tokens
---

# AI Gadgets

NextSaaS template focused on AI-powered smart gadgets and connected devices. High-touch premium feel with animated hero, service showcase, and interactive components.

## Páginas disponíveis

- index.html (homepage)
- about.html
- services.html
- pricing.html
- login.html
- signup.html
- contact.html
- support.html
- blog.html (+ blog-details.html)
- documentation.html
- faq.html
- tutorial.html
- features.html
- integration.html
- process.html
- team.html
- career.html
- case-study.html (+ case-study-details.html)
- customer.html (+ customer-details.html)
- testimonial.html
- analytics.html
- affiliates.html
- whitepaper.html (+ whitepaper-details.html)
- and 14 more support/policy pages

## Seções (index.html)

1. **Hero** (pt-46 md:pt-[204px])
   - Black background with asymmetric hero images
   - Headline: "Smarter living starts here"
   - Subheading: "Discover the next generation of AI-powered gadgets..."
   - Two CTA buttons: "Explore products" (secondary) + "Explore products" (gray)
   - Banner image showcase
   - Animated entrance (data-ns-animate, staggered delays 0.1-0.4s)

2. **Marquee/Logo Loop** 
   - Client logos scrolling horizontally
   - Light/dark mode toggle variants
   - Gradient overlay sides (15-20% width)

3. **What We Do** (bg-background-12 #eaeceb)
   - Large beige card section
   - Split-text animation on headline
   - Hero message: "Our AI speaker gadget is designed to bring the future of smart home technology..."

4. **Gadgets Grid** (4-column layout with mosaic)
   - Premium gadget access card (2-col span, 4-row span light bg)
   - Device balance showcase (gradient #A585FF → #FFC2AD)
   - Grid items with hover states
   - Counter animations (data-counter, speed 1500ms)
   - Category filters (Smart Home, LifeStyle)
   - CTA buttons with icon swaps

5. **About** (2-col grid)
   - Badge: "About"
   - Headline: "Where bold ideas come to life"
   - Long-form copy (~170 words) with brand story
   - CTA: "Explore more"
   - Right image: rounded photo with hover scale

6. **Services** (bg-secondary #1a1a1c / dark navy)
   - Badge: "services"
   - Headline: "Our smart AI services" (text-accent white)
   - Subheading: "Everything you need to connect, control, and simplify life..."
   - 6 service cards (3×2 grid)
   - Custom icon shapes (ns-shape-47, ns-shape-12, etc.)
   - Card title: "Smart integration" (repeated template)
   - CTA: "See all services"

7. **How It Works** (3-step process)
   - Badge: "How It Works"
   - Headline: "Your AI journey in 3 steps"
   - Subheading: "From setup to automation, getting started with your AI gadget is effortless."
   - 3 numbered circles (1, 2, 3) with border-background-12
   - Step titles: "Connect your device" → "Customize & sync" → "Automate & control"
   - Dashed connector line between steps (hidden on mobile)
   - CTA: "See all process"

8. **Testimonials** (marquee scroll)
   - Badge: "Testimonials"
   - Headline: "What our users say"
   - Subheading: "Trusted by everyday users and tech enthusiasts worldwide."
   - 3-column carousel of testimonial cards (max-w-[500px])
   - 5-star rating (fill-primary-500 #864ffe)
   - Twitter icon link
   - User avatar + name + quote
   - Multiple cards in infinite scroll (top-marquee-container)

9. **Pricing/Offer section** (alternating content pattern)
   - Linked to pricing.html

10. **FAQ Section** (py-28)
    - Heading: "Frequently asked questions"
    - Collapsible accordion items (hidden: overflow-hidden, rotate icon)
    - Multiple FAQ items with expand/collapse

11. **CTA Section** (py-16 lg:py-22 xl:py-28)
    - Final call-to-action
    - Centered button + headline
    - Data-ns-animate with staggered delays

12. **Footer**
    - Navigation links grouped by category
    - Social/legal links

## Recursos visuais

**Color Palette (CSS Variables)**
- Primary: #864ffe (purple-600), #a585ff (purple-400)
- Secondary: #1a1a1c (dark text)
- Accent: #fcfcfc (white text)
- Background-12: #eaeceb (light beige)
- NS-Cyan: #83e7ee (accent cyan)
- NS-Green: #c6f56f (accent lime)
- NS-Red: #ffb9a2 (accent coral)
- Gradients: cyan→lime, white→cyan

**Typography**
- Font family: Inter Tight (100-900 weights)
- Heading-1: 4.25rem (110% LH)
- Heading-2: 3.25rem (120% LH)
- Heading-3: 2.5rem (120% LH)
- Heading-4: 2rem (130% LH)
- Tagline-1: 1rem (150% LH)
- Tagline-2: 0.875rem (150% LH)

**Interactive Elements**
- Buttons: btn-v2 variants (secondary, gray, primary, white)
- Hover: swap icons via translate-x animation
- Badges: badge-gray-light-v2, badge-white
- Cards: rounded-2xl, rounded-3xl, rounded-[20px]
- Animations: data-ns-animate (split-text, direction, delay, spring)

**Images/Assets**
- Hero background: ns-img-540.png, ns-img-541.png (asymmetric geometric)
- Hero banner: ns-img-330.png
- About section: ns-img-338.png
- Service bg: ns-img-328.png
- Client logos: 5 light + 5 dark variants
- Testimonial avatars: ns-avatar-4.png (4 variants)
- Custom SVG icons for navigation, shapes, social

**Responsive Breakpoints** (Tailwind)
- Mobile: base / min-[425px] / min-[500px]
- Tablet: sm / md
- Desktop: lg / xl / 2xl
- Max container: 1290px

## Notas de qualidade

- **Strengths**: Premium polish, sophisticated color system, deep animation library, extensive component library (50+ pages), responsive grid systems, accessibility markup (aria-label), dark mode support
- **Code Quality**: 8/10 — Clean Tailwind CSS, semantic HTML, consistent naming (ns- prefix, bg-{color} system), custom design tokens well-organized in :root
- **Performance**: CSS file ~12.7MB (compiled + vendor scripts); uses lazy loading on images; minimal JS footprint for animations (data attributes drive Gsap/Anime.js)
- **Customization**: High — All colors/fonts in CSS variables; easy to fork and rebrand; good component documentation pattern
- **Accessibility**: Moderate — Semantic structure, ARIA labels present, but animations may impact screen readers; color contrast generally good (light on dark, dark on light)
- **Uniqueness**: Branded aesthetic with custom icon font (next-sass), unique gradient overlays, parametric badge/button system
- **Completeness**: Production-ready; ships with full SaaS flow (auth, pricing, docs, etc.); multi-page linked structure

**Best for**: B2B SaaS, AI/tech product launches, premium service dashboards, startup landing pages with high design ambition and animation budget.

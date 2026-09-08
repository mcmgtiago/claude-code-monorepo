# Template: Agency Dark Premium

Template de landing page premium para agências de marketing, estúdios criativos e empresas de serviços digitais.

## Stack
- React 18 + TypeScript
- Vite
- Tailwind CSS 3
- Motion (framer-motion)
- Lucide React icons

## Características
- Dark theme com gradientes laranja/accent
- Hero com vídeo de fundo + particles
- Glassmorphism cards
- Sticky-stack cases no scroll
- Marquee vertical de depoimentos
- Comparison Before/After
- FAQ com spotlight cursor
- Border beam animado
- Progressive blur entre seções
- SVG textures (grid, dots, topography, circuit-board)
- Scroll-reveal com IntersectionObserver + Motion
- Formulário com validação inline
- Footer com parallax
- Botão WhatsApp flutuante
- Nav com backdrop-blur ao scroll
- Totalmente responsivo

## Como usar

1. Copiar esta pasta para o novo projeto
2. Trocar:
   - Logo em `public/logo-rox.png`
   - Vídeo em `public/hero-bg.mp4`
   - Logos dos clientes em `public/clients/`
   - Textos e dados em `src/App.tsx` e componentes
   - Cores CSS em `src/index.css` (variáveis `--accent`, `--bg-deep`, etc.)
3. `npm install && npm run dev`

## Estrutura de seções

1. Hero (vídeo + headline + stats animados)
2. Serviços (números gigantes + lista)
3. Capabilities (4 ícones + texto)
4. Comparação Before/After (cards lado a lado)
5. Processo (timeline 4 steps)
6. Cases (sticky-stack com fotos)
7. Depoimentos (marquee vertical)
8. Planos (4 cards com border beam)
9. Sobre (split text + manifesto card)
10. FAQ (accordion com spotlight)
11. Contato (formulário validado)
12. Footer (links + social + blur)

## Cores padrão (trocar conforme cliente)

```css
--bg-deep: #080808;
--accent: #ff5a00;        /* laranja - trocar pela cor principal */
--accent-hover: #ff6a1a;
```

## Baseado em
- Referência visual: AgentAI (dark + red glow)
- Kit: premium-agency-site-kit
- Skills: design-taste-frontend, impeccable

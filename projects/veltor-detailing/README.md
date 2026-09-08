# VELTOR DETAILING — Automotive Detailing Studio

Site institucional premium para a marca **Veltor Detailing**, um estúdio de estética automotiva em Goiânia.

## Stack

- React 19
- TypeScript 6
- Vite 8
- Tailwind CSS 4
- Motion (Framer Motion) 12
- Lucide React (ícones)

## Desenvolvimento

```bash
npm install
npm run dev     # http://localhost:5173
```

## Build

```bash
npm run build   # tsc + vite build → dist/
npm run preview # serve produção local
```

## Estrutura

```
src/
├── App.tsx                    # Composição da Home (19 seções)
├── index.css                  # Design tokens (@theme) + base styles
├── data/content.ts            # Todo o conteúdo textual (single source of truth)
├── assets/
│   ├── Logo.tsx               # Logo SVG inline V+D
│   └── placeholders/          # SVGs cinematográficos (substituir por fotos reais)
└── components/
    ├── ui/                    # Primitivos (Button, Container, ScrollReveal, etc.)
    ├── layout/                # Header, Footer
    ├── hero/                  # Hero section
    ├── trust/                 # Barra de confiança
    ├── services/              # Grid de serviços
    ├── manifesto/             # Seção editorial
    ├── before-after/          # Slider interativo antes/depois
    ├── highlight/             # Serviço de destaque (vitrificação)
    ├── why/                   # Diferenciais
    ├── process/               # Timeline de processo
    ├── portfolio/             # Grid assimétrico de projetos
    ├── stats/                 # Números animados
    ├── testimonials/          # Avaliações
    ├── cta/                   # CTAs (imagem + final)
    ├── faq/                   # Accordion de perguntas
    ├── location/              # Mapa + dados de contato
    ├── seo/                   # Bloco SEO local
    └── mobile/                # Bottom bar mobile
```

## Trocar placeholders por fotos reais

Os SVGs em `src/assets/placeholders/` e `public/placeholders/` simulam fotografias cinematográficas. Para substituir por imagens reais:

1. **Hero**: substituir o `src` em `src/components/hero/Hero.tsx` por sua foto real (WebP ou AVIF recomendado, 1920×1080px, fundo escuro, reflexos).

2. **Portfolio**: trocar os SVGs inline em `src/components/portfolio/Portfolio.tsx` por `<img>` apontando para fotos reais em `public/portfolio/`.

3. **Manifesto**: trocar o SVG inline em `src/components/manifesto/Manifesto.tsx` por foto de profissional analisando pintura.

4. **CTA**: trocar SVG background em `src/components/cta/CTAImage.tsx` por foto de pintura com reflexo perfeito.

**Direção de fotografia recomendada:**
- Fundo escuro (estúdio ou garage iluminada)
- Iluminação cinematográfica (lateral, spots)
- Alto contraste com reflexos controlados
- Carros modernos premium (sedan, SUV, esportivo)
- Close-ups de pintura, coating, polimento, rodas, interior

## SEO

- Schema.org `LocalBusiness` em `index.html` (JSON-LD)
- Open Graph + Twitter Cards configurados
- `robots.txt` e `sitemap.xml` em `/public`
- Bloco de SEO local integrado na home

## WhatsApp

Número placeholder: `5562999999999`  
Para alterar, edite a constante em `src/components/ui/WhatsAppLink.tsx`.

## Paleta

| Token | Cor | Uso |
|-------|-----|-----|
| `--color-bg` | `#090B0D` | Fundo principal |
| `--color-surface` | `#13171A` | Cards, menus |
| `--color-bronze` | `#B88A52` | CTAs, destaques |
| `--color-fg` | `#F6F6F4` | Texto principal |
| `--color-muted` | `#9DA3A6` | Texto secundário |

## Licença

Projeto fictício para demonstração.

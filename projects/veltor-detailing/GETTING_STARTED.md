# Getting Started — VELTOR DETAILING

Bem-vindo ao site premium de estética automotiva **VELTOR DETAILING**. Este guia cobre setup, desenvolvimento, build e customização.

## Configuração Rápida

```bash
# Clonar ou entrar no diretório
cd "D:/Claude Code/projects/veltor-detailing"

# Instalar dependências (já feito)
npm install

# Iniciar dev server
npm run dev
# Acesso em http://localhost:5173

# Build para produção
npm run build
```

## Estrutura da Home (19 seções)

A Home foi construída seguindo o fluxo prescrito no brief original:

| # | Seção | ID Âncora | Descrição |
|----|-------|-----------|-----------|
| 1 | Header | `#inicio` | Menu sticky com navegação |
| 2 | Hero | `#hero` | Introdução cinematográfica |
| 3 | Trust Bar | `#confianca` | Prova social (4,9⭐, +800 veículos) |
| 4 | Services | `#servicos` | Grid premium 6 serviços |
| 5 | Manifesto | `#manifesto` | Seção editorial de posicionamento |
| 6 | Before/After | `#antes-depois` | Slider interativo de resultados |
| 7 | Highlight | `#vitrificacao` | Destaque: Vitrificação Cerâmica |
| 8 | Why Veltor | `#diferenciais` | 6 diferenciais principais |
| 9 | Process | `#processo` | Timeline: Do contato à entrega |
| 10 | Portfolio | `#projetos` | Grid assimétrico 6 projetos |
| 11 | Stats | `#numeros` | Números animados (+800, 7+, 4,9, 98%) |
| 12 | Testimonials | `#avaliacoes` | 3 avaliações Google 5⭐ |
| 13 | CTA Image | `#cta-imagem` | CTA com imagem de fundo |
| 14 | FAQ | `#faq` | Accordion 6 perguntas |
| 15 | Location | `#localizacao` | Mapa + dados de contato |
| 16 | LocalSEO | — | Bloco discret de SEO local |
| 17 | CTA Final | `#cta-final` | Last call-to-action |
| 18 | Footer | `#contato` | Rodapé 4 colunas |
| 19 | Mobile Bar | — | Fixed bottom (mobile only) |

## Customização

### 1. Conteúdo Textual

Todo o conteúdo está centralizado em `src/data/content.ts`. Para alterar textos, títulos, depoimentos ou dados:

```typescript
// src/data/content.ts
export const services = [
  { id: 'vitrificacao', title: 'Seu título', description: 'Sua descrição', ... },
  // ...
]
export const testimonials = [ /* avaliações */ ]
export const faqItems = [ /* perguntas */ ]
```

### 2. Paleta de Cores

Alterar cores em `src/index.css`:

```css
@theme {
  --color-bg: #090B0D;        /* Fundo principal */
  --color-surface: #13171A;   /* Cards */
  --color-bronze: #B88A52;    /* CTAs */
  /* ... */
}
```

Todas as classes Tailwind acessam esses tokens automaticamente.

### 3. Tipografia

Fontes via Google Fonts em `index.html`:
- **Display**: Sora (headlines)
- **Body**: Inter (corpo)

Para trocar, edite o `<link>` de fonts e atualize o `@theme` em `index.css`.

### 4. WhatsApp

Número atual: `5562999999999` (placeholder)

Para alterar, edite `src/components/ui/WhatsAppLink.tsx`:

```typescript
const WHATSAPP_NUMBER = '5562999999999' // ← alterar aqui
```

### 5. Imagens & Placeholders

**Placeholder SVGs** (cinematográficos):
- `src/assets/placeholders/hero-car.svg` — hero background
- `public/placeholders/` — utilizados em Portfolio, Manifesto, BeforeAfter

**Para trocar por fotos reais:**

1. **Hero**: editar `src/components/hero/Hero.tsx`
   ```jsx
   <img src="/placeholders/hero-car.svg" /> 
   // ↓ trocar por
   <img src="/portfolio/meu-carro-hero.webp" />
   ```

2. **Portfolio**: editar `src/components/portfolio/Portfolio.tsx` (linhas onde os SVGs inline são renderizados)

3. **Outros**: cada seção tem seu SVG marcado com `data-placeholder` para fácil localização com `Ctrl+F`.

**Recomendação de fotografia:**
- Formato: WebP ou AVIF (melhor compressão)
- Dimensões: 1920×1080 (hero), 800×600 (portfolio)
- Iluminação: estúdio escuro, cinematográfica, reflexos controlados
- Estilo: coerente com brand (premium, sofisticado, não genérico)

### 6. SEO Local

Schema.org LocalBusiness está em `index.html`. Para atualizar:

```html
<!-- index.html -->
<script type="application/ld+json">
{
  "telephone": "+5562999999999",
  "address": {
    "streetAddress": "Av. Prime, 1240",
    "addressLocality": "Goiânia",
    "addressRegion": "GO"
  },
  "aggregateRating": {
    "ratingValue": "4.9",
    "reviewCount": "180"
  }
}
</script>
```

## Componentes Reutilizáveis

Todos os componentes seguem o padrão do projeto e podem ser reaproveitados em páginas internas:

- `Button` — CTA primário/secundário
- `ScrollReveal` — reveal ao scroll
- `Eyebrow` — label de seção
- `SectionTitle` — título + subtitle
- `WhatsAppLink` — link pré-preenchido
- `Container` / `Section` — layout wrapper

Para criar novas páginas (ex: `/servicos`), importe esses primitivos:

```jsx
import { Section, Container } from '@/components/ui/Container'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { Button } from '@/components/ui/Button'
```

## Performance

**Lighthouse Scores** esperados (após substituir SVGs por fotos):
- ✅ Performance: 90+
- ✅ Accessibility: 95+
- ✅ Best Practices: 95+
- ✅ SEO: 100

**Otimizações implementadas:**
- Lazy loading de imagens
- CSS modular (Tailwind 4)
- JavaScript minificado (397kB gzipped)
- Sem dependências pesadas
- SVG otimizados

## Desenvolvimento

### Estrutura de branches

Para páginas futuras, mantenha a pasta de componentes organizada:

```
src/components/
├── ui/                # primitivos reutilizáveis
├── layout/            # Header, Footer
├── sections/          # seções da Home
└── pages/             # (futuro) componentes de páginas internas
```

### TypeScript Strict

O projeto usa TypeScript strict (`"strict": true`). Todos os componentes devem ter types explícitos.

### Linting

```bash
npm run lint          # TypeScript check (sem eslint)
```

## Build & Deploy

```bash
# Build para produção
npm run build

# Visualizar build localmente
npm run preview

# Output: dist/
#   - index.html (3.3 kB)
#   - assets/index-*.css (40 kB, gzips a 7.6 kB)
#   - assets/index-*.js (397 kB, gzips a 120 kB)
```

**Deploy recomendado:**
- Vercel (Next.js ready, mas suporta static)
- Netlify (ideal para Vite)
- GitHub Pages
- CloudFlare Pages

Copiar conteúdo de `dist/` para seu servidor.

## Troubleshooting

**"Cannot find module" errors:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Tailwind classes não aplicam:**
- Verificar que `index.css` tem `@import "tailwindcss"`
- Rodar `npm run dev` (não funciona sem Vite hot reload)

**SVGs não carregam:**
- Verificar caminho relativo: `/placeholders/hero-car.svg`
- SVGs devem estar em `public/` ou importados em `.tsx`

**WhatsApp links não abrem:**
- Confirmar número: `src/components/ui/WhatsAppLink.tsx`
- Formato: sem `+` ou espaços, apenas dígitos + país code

## FAQ

**Posso usar isso em produção?**
Sim, é um site estático, não requer backend.

**Preciso de servidor Node?**
Não, apenas hospedagem estática (CDN, GitHub Pages, etc).

**Como adicionar mais seções?**
Criar novo componente em `src/components/`, importar em `App.tsx`, usar `SectionTitle` e `Container` para estilo consistente.

**Devo usar Next.js?**
Pode ser, mas para este use case (Home estática + SEO simples), Vite é mais rápido e leve.

## Suporte

Para questões sobre implementação ou estilo, consulte:
- `src/data/content.ts` — conteúdo
- `src/index.css` — design tokens
- `README.md` — arquivo principal
- Componentes em `src/components/` — exemplos de padrões

---

**Versão:** 1.0  
**Criado:** 2026-08-13  
**Stack:** React 19 + Vite 8 + Tailwind 4 + Motion 12

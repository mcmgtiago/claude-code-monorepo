# PROMPT MASTER v2 — Landing Page de Consultoria de RH

> Versão premium elevada a partir do prompt original. Mais cara de regras, ancoragem de design, direção visual, interações avançadas, performance e acessibilidade.

---

## 1. Direção Geral

Criar uma landing page de **autoridade premium** para uma consultoria de RH chamada `[NOME]`. Estética: editorial + high-end. A página deve transmitir:

- Confiança executiva
- Sofisticação técnica
- Calma visual
- Profundidade de produto

Não fazer: visual genérico, corporativo datado, coragem clichê ("transformamos pessoas em resultados"), çokito de setas e ícones grandes.

**Referências de nivelamento de qualidade:**
- Apple.com
- Stripe.com
- Linear.app
- Vercel.com
- Framer.com
- Locomotive.app
- Arc.net

---

## 2. Stack Técnica

- React 18 + Vite + TypeScript
- Tailwind CSS v4 com `@tailwindcss/vite`
- `motion/react` (Framer Motion)
- `lucide-react` para ícones
- `radix-ui` quando precisar de acessibilidade em accordion/tabs/dialog
- `hls.js` quando usar vídeos HLS (CloudFront/Mux)
- React Hook Form + Zod para formulários
- Shadcn UI opcional (apenas primitives)

**TypeScript:**
- Strict mode
- Tipagem em todas interfaces, props e variant
- Sem `any`, sem `// @ts-ignore`
- Tipos utilitários compartilhados

---

## 3. Estrutura do Projeto

```
src/
  components/
    ui/                # primitives (Button, Container, Section)
    sections/          # Hero, Services, Cases, Testimonials, FAQ, CTA, Footer
    effects/           # LiquidGlass, SpotlightBorder, DecryptedText, etc
    patterns/          # Gradient, Marquee, BlurText, FadeUp, MouseGlow
  lib/
    utils.ts           # cn(), helpers
    animations.ts      # variants centralizadas
    seo.ts             # helpers de metadata
  hooks/
    useReducedMotion.ts
    useScrollProgress.ts
    useMousePosition.ts
  data/
    mock.ts
  types/
    index.ts
  styles/
    globals.css
    tailwind.css
```

---

## 4. Design Tokens (Design System)

### 4.1 Tipografia

**Fontes base:**
```css
/* Inter variável */
font-family: 'Inter', system-ui, sans-serif;

/* Serif para acentos */
font-family: 'Instrument Serif', 'Times New Roman', serif;
```

**Peso e tracking:**

| Token | Uso |
|-------|-----|
| `text-7xl tracking-[-0.04em] leading-[0.9] font-medium` | Headlines hero |
| `text-5xl tracking-[-0.03em] leading-[1.05] font-medium` | Headlines seção |
| `text-3xl tracking-[-0.02em] leading-[1.15] font-medium` | Subheaders |
| `text-lg tracking-[-0.01em] leading-[1.5] font-normal` | Body grande |
| `text-base tracking-[-0.005em] leading-[1.6] font-normal` | Body padrão |
| `text-sm tracking-[0.005em] leading-[1.5] font-normal` | Body pequena |
| `text-xs tracking-[0.06em] uppercase font-medium` | Eyebrows |

**Anti-glow:** nunca usar `font-bold` com tracking-very-tight. Medium 500 é suficiente.

---

### 4.2 Cores (HSL tokens)

```css
:root {
  /* Light mode */
  --background: 0 0% 100%;
  --foreground: 0 0% 9%;
  --muted: 210 20% 98%;
  --muted-foreground: 215 14% 45%;
  --border: 220 13% 91%;
  --input: 220 13% 91%;
  --ring: 213 90% 65%;

  --brand: 213 90% 65%;
  --brand-foreground: 0 0% 100%;

  --accent: 280 75% 60%;
  --accent-foreground: 0 0% 100%;

  --success: 142 71% 45%;
  --warning: 38 92% 50%;
  --danger: 0 84% 60%;

  /* Surface tints */
  --surface-1: 0 0% 100%;
  --surface-2: 210 20% 98%;
  --surface-3: 220 14% 95%;

  --radius: 9999px;
  --radius-card: 20px;
  --radius-section: 32px;
}
```

**Uso:**
- Background principal: `--background`
- Cards flutuantes: `--surface-1` com `--border` 1px
- Texto primario: `--foreground`
- Texto muted: `--muted-foreground`

**Regra:** usar `--brand` para ações primárias, `--accent` para destaques secundários. Nada mais.

---

### 4.3 Sombras

```css
/* Cards neutros */
--shadow-card:
  0px 0px 0px 1px rgba(0,0,0,0.04),
  0px 2px 4px rgba(0,0,0,0.04),
  0px 8px 24px rgba(0,0,0,0.04);

/* Cards interativos (hover) */
--shadow-card-hover:
  0px 0px 0px 1px rgba(0,0,0,0.06),
  0px 12px 32px rgba(0,0,0,0.08);

/* Sombras de botão (com inset highlight) */
--shadow-button:
  inset 0px 1px 2px rgba(255,255,255,0.45),
  0px 4px 8px rgba(0,0,0,0.06);

/* Liquid glass overlay */
--shadow-glass:
  inset 0 1px 1px rgba(255,255,255,0.10),
  0 24px 80px rgba(0,0,0,0.20);
```

---

### 4.4 Radius

| Elemento | Token |
|----------|-------|
| Pill / Button | 9999px |
| Card padrão | 20px |
| Card bento | 28px |
| Section wrapper | 32px |
| Avatar | 9999px |
| Input | 12px |

---

### 4.5 Espaçamento

- Padding de seção: `py-32` (128px) em desktop, `py-20` em mobile
- Container max-width: `1440px`
- Narrow sections: `max-w-[1180px] mx-auto`
- Gap de grids bento: `gap-3` (fino e elegante, não 6)
- Section margin bottom: `mb-24 md:mb-32`

---

## 5. Componentes Premium

### 5.1 FadeUp

```tsx
import { motion, useReducedMotion } from 'motion/react';
import { ReactNode } from 'react';

interface FadeUpProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  className?: string;
  once?: boolean;
}

export const FadeUp = ({
  children,
  delay = 0,
  duration = 0.6,
  y = 24,
  className,
  once = true,
}: FadeUpProps) => {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y, filter: 'blur(4px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once, amount: 0.3 }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
```

---

### 5.2 BlurText

```tsx
'use client';
import { motion, useReducedMotion } from 'motion/react';

interface BlurTextProps {
  text: string;
  delay?: number;
  stagger?: number;
  className?: string;
  as?: 'h1' | 'h2' | 'p' | 'span';
}

export const BlurText = ({ text, delay = 0, stagger = 0.05, className, as = 'h2' }: BlurTextProps) => {
  const reducedMotion = useReducedMotion();
  const words = text.split(' ');
  const Tag = motion[as];

  if (reducedMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag className={className} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block"
          variants={{
            hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
            visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
          }}
          transition={{ duration: 0.7, delay: delay + i * stagger, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginRight: '0.25em' }}
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  );
};
```

---

### 5.3 DecryptedText

Animação estilo "shuffle" com caracteres trocando até formar a palavra final. Excelente para revelação de headlines premium. Documentação interna deve descrever `sequential` vs `bulk` trigger, `speed`, `revealDirection`.

---

### 5.4 SpotlightBorder

Card com borda que reage ao mouse com gradient radial. Máscara CSS:
```css
mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
mask-composite: exclude;
```

Argumentos: `size`, `intensity`, `radius`, `as`.

---

### 5.5 LiquidGlass

```css
.liquid-glass {
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.10);
  box-shadow: var(--shadow-glass);
  position: relative;
  overflow: hidden;
}

.liquid-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.4px;
  background: linear-gradient(180deg,
    rgba(255,255,255,0.45) 0%,
    rgba(255,255,255,0.15) 20%,
    transparent 40%,
    transparent 60%,
    rgba(255,255,255,0.15) 80%,
    rgba(255,255,255,0.45) 100%);
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
```

Variantes: `liquid-glass`, `liquid-glass-strong`.

---

### 5.6 GradientButton

Botão premium com borda animando em gradient. Hover: `scale(1.03)` + brilho sobe.

```tsx
<button className="
  group relative inline-flex h-10 items-center gap-2
  rounded-full border border-transparent px-5
  bg-foreground text-background text-sm font-medium
  shadow-[inset_0px_1px_2px_rgba(255,255,255,0.30),0px_4px_8px_rgba(0,0,0,0.06)]
  transition-all duration-200 hover:scale-[1.03]
  active:scale-[0.98]
">
  <span className="
    absolute inset-0 -z-10 rounded-full
    bg-[linear-gradient(110deg,#3D81E3,#9333EA,#EC4899,#3D81E3)]
    bg-[length:200%_100%] opacity-0 blur-md
    transition-opacity duration-300 group-hover:opacity-100
  " />
  <span className="
    inline-flex h-5 w-5 items-center justify-center rounded-full
    bg-background text-foreground
  ">
    <ArrowRight className="h-3 w-3" />
  </span>
  <span>{label}</span>
</button>
```

---

### 5.7 BentoGrid

Grid assimétrico moderno. Use `row` e `col` spans por card. Lazy motion com stagger.

```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
  {items.map((item, i) => (
    <div className={item.classes}>
      ...
    </div>
  ))}
</div>
```

---

### 5.8 Marquee

Componente de marquee horizontal ou vertical:
- Infinite scroll via `translateX(-50%)` em 30-60s
- Suspensão ao hover
- Fade gradient nas pontas
- Suporta imagens, vídeos e textos

---

### 5.9 NumberCounter

`motion.span` que anima de 0 até valor final em easing EaseOut. Use:
```tsx
animate={{ count: targetNumber }}
transition={{ duration: 1.8, ease: 'easeOut' }}
```

Triguear com `whileInView`.

---

### 5.10 MouseGlow

`useMousePosition` em container, escreve posicao em CSS vars no doc. Usado para hero e SpotlightBorder.

---

### 5.11 ButtonClickFeedback

Botão que pulsa ao clique (scale 0.95) + ripple visual.

---

### 5.12 SectionIndicator (numerados como Stripe)

Pequeno numero + label no topo da secao, tipo `01 — Processo`, com font-monospace ou uppercase.

---

### 5.13 BentoHoverCard

Card que, ao hover, mostra metadados extras (`product-hover-effect` style), parallax leve e highlight gradient na lateral.

---

### 5.14 ComparisonSlider

Slider antes/depois para reforçar áreas do caso. Valide a11y com aria-roles.

---

### 5.15 AccordionRadixPremium

Usar Radix Accordion com:
- Trigger custom com Plus/Minus
- Transition altura suave via `motion.div`
- Border gradient sutil quando aberto
- Cabeçalho sticky

---

### 5.16 FeatureGrid

Grid de features `grid-cols-2 md:grid-cols-4 gap-px border bg-border` para criar linhas internas parecendo Next.js.

---

### 5.17 AnimatedGradientText

Texto com gradient em background que move horizontalmente em 6s, com `background-clip: text`. Excelente para palavras-chave em headlines ("humanizar", "escalar", "longevidade").

---

### 5.18 HoverImageSwap

Card que troca imagem ao hover com crossfade.

---

### 5.19 ScrollScrubText

Texto que anima cor ou peso conforme scroll (skew, opacidade, scale Y).

---

### 5.20 InfiniteBrandMarquee

Lista de logos/tec em marquee horizontal como Stripe/Mezmo/Vercel fazem.

---

### 5.21 MagneticButton

Botão onde o "inner" segue parcialmente o mouse (efeito magnético). Excelente em CTAs principais. **Usar com parcimônia** apenas no hero CTA.

---

### 5.22 CursorEffect

Cursor customizado sutil para desktop: ponto que cresce ao passar em elementos interativos. Estilo Linear/Stripe.

---

### 5.23 NoiseTexture

SVG noise sutil sobre fundo branco para tirar "flatness".

---

### 5.24 GridPattern

Fundo com grid fino (radial ou linear) que some em mobile.

---

## 6. Animações & Movimento

### 6.1 Timing & Easing

| Padrão | Uso |
|--------|-----|
| `[0.22, 1, 0.36, 1]` | Default hero/element entrance |
| `[0.4, 0, 0.2, 1]` | Transições de estado, abertura de accordion |
| `[0.16, 1, 0.3, 1]` | Material-like spring suave |
| `ease-out` | Default 0.3-0.6s |
| `cubic-bezier(0.83, 0, 0.17, 1)` | Modulação pesada |

### 6.2 Padrões de Motion

- **Entrada:** stagger de children com delay incremental de 60-100ms
- **Hover:** duração curta (180-250ms) com ease suave
- **Scroll:** `useInView` com threshold 0.3, fire once
- **Magnetic:** apenas CTAs principais
- **Marquee:** sempre loop infinito linear
- **Parallax leve:** 8-16px no hero, no máximo
- **Text reveal:** stagger por palavra com blur 10px->0
- **Counter:** 1.8s easeOut
- **Cards:** scale 1.02 + shadow upgrade ao hover

### 6.3 Regras

- TODAS as animações devem respeitar `prefers-reduced-motion`.
- Nada deve pulsar, piscar ou flicker.
- Hover states precisam funcionar mesmo se JS falhar (CSS-first).
- Vídeos nunca devem auto-play com som.

---

## 7. Identidade Visual por "Aesthetic Move"

Cada prompt da biblioteca deve escolher 2-3 movimentos visuais que o tornam memorável. Exemplos:

**HIPER-TECH** (HUMANTECH):
- Bento Grid com scanlines
- Dashboard mockups com tooltips animados
- Comparação antes/depois interativa

**EDITORIAL WARM** (PEOPLE FIRST):
- Cards assimétricos como revista
- Texto serif italic em chamadas
- Background com grain noise

**CORPORATE PREMIUM** (STRATEGO):
- Tableau com kaplan estendido e ouro sutil
- Kaplas de investors-style
- Typography apos entitativa em romanos

**SOCIAL-FIRST** (CULTURECRAFT):
- Cards-video de instagram reels
- Hashes de cultura em marquee
- Before/after job post split

**SAAS DENSE** (OPS PEOPLE):
- Bento denso com mini-dashboards
- Demo de checklist interativo
- Diagram de fluxo animado

**PIPELINE DYNAMIC** (TALENTFLOW):
- Kanban animado scroll horizontal
- Swipe cards
- Timeline timeline timeline

**ACADEMIA** (GROWTH ACADEMY):
- Progress rings, badges, namespaces
- Curriculo accordion
- Learning path

**EQUITY WARM** (BELONG):
- Mosaic de retratos
- Inclusion score gauge
- Heatmap de equidade

**REWARD LAB** (REWARDLAB):
- Salary band bar charts
- Heatmap de pay equity
- Calculadora total rewards

**CINEMATIC DARK** (SHIFTWORKS):
- Hero vídeo full-bleed
- Stakeholder radar
- Adoption curve animada

Cada prompt pode ser finalizado adicionando 2-3 desses `aesthetic moves` em pontos específicos.

---

## 8. Estrutura de Seções Premium

Cada seção deve ter:

1. **Eyebrow numerado** (monospace ou uppercase tracking-wide)
2. **Headline** (com BlurText + palavra em AnimatedGradient ou Instrument Serif italic)
3. **Subheadline** (curta, factual)
4. **Conteúdo principal** (bento, grid, cards ou vídeo)
5. **CTA contextual** se fizer sentido
6. **Visual anchor** (linha de gradiente, ilustração, sparkline)

### Lista ideal (12-14 seções):

1. **Navbar** (sticky com scroll reveal)
2. **Hero** (full-screen com mídia viva + headline + CTAs + proof)
3. **TrustedBy** (logos marquee com fade)
4. **Problem** (3-4 cards de dor com ícones finos)
5. **Solution** (3-4 pilares com motion)
6. **Metrics** (numerais com counters animados)
7. **Services** (bento grid)
8. **Methodology** (timeline com etapas)
9. **Cases** (bento cases ou carrossel)
10. **Testimonials** (carrossel com vídeo)
11. **Pricing** (3 planos com toggle mensal/anual)
12. **FAQ** (accordion premium)
13. **Resources** (3 cards de lead magnets)
14. **CTA Final** (big CTA + form ou botão de agendamento)
15. **Footer** (multi-coluna + newsletter)

---

## 9. Padrões Visuais Recomendados por Seção

### 9.1 Hero

- **Layout:** assimétrico (60/40, 70/30 ou 50/50)
- **Variações:** `min-h-[100svh]` com padding bottom generoso
- **Headline:** 2-3 linhas, quebrando com `aspecto visual`
- **Sub:** max-w 540px
- **Visual:** vídeo fullscreen com fade out ao scroll, ou mockup de produto, ou marquee de dashboards
- **Eyebrow:** pill com gradient border
- **CTAs:** primary rounded-full com borda gradient + secondary minimalista
- **Trust badges:** linha com 3-4 metricas inline
- **Background:** grain noise leve + uma orb de gradient

```tsx
<section className="relative min-h-[100svh] flex items-center px-6 pt-32 pb-20 overflow-hidden">
  <BackgroundGlow />
  <NoiseOverlay />
  <Container>
    <Eyebrow />
    <BlurText />
    <Subheadline />
    <CTAGroup />
    <TrustRow />
  </Container>
  <HeroVisual />
</section>
```

---

### 9.2 Bento Services Grid

```tsx
<div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] gap-3">
  <div className="col-span-2 row-span-2 ..."><BigCard /></div>
  <div className="col-span-2 row-span-1 ..."><WideCard /></div>
  ...
</div>
```

Cada card:
- Hover: brilho percorre borda
- Border subtle 1px
- Padding generoso
- Conteúdo com hierarchy visual clara

---

### 9.3 Métricas / Stats

```tsx
<div className="grid grid-cols-2 md:grid-cols-4 border border-border rounded-3xl bg-surface-1 divide-x divide-y divide-border">
  {stats.map(s => (
    <div className="p-8 md:p-12">
      <Counter value={s.value} suffix={s.suffix} />
      <p className="text-sm text-muted-foreground">{s.label}</p>
    </div>
  ))}
</div>
```

Borda externa uma única, divisões internas finas. Visualmente emblemático e clean.

---

### 9.4 Cases (Bento + Cards)

```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
  {/* Featured Case */}
  <div className="lg:col-span-2 lg:row-span-2 rounded-3xl overflow-hidden ...">
    <video autoPlay muted loop />
    <div className="bottom-overlay">
      <Logo /><Metric /><ReadCaseCTA />
    </div>
  </div>

  {/* Smaller cases */}
  <Card />
  <Card />
</div>
```

---

### 9.5 Carrossel de Testemunhos

- Strip horizontal arrastável (drag)
- Auto-scroll pausado em hover
- Dots de navegação
- Cards com quote > nome > role > foto
- Background com grain leve

---

### 9.6 FAQ Accordion

```tsx
<Accordion.Root type="single" collapsible>
  <Accordion.Item>
    <Accordion.Header>
      <Accordion.Trigger>
        <span className="font-medium">Pergunta</span>
        <PlusMinus />
      </Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Content>
      <motion.div initial height transition>
        Resposta
      </motion.div>
    </Accordion.Content>
  </Accordion.Item>
</Accordion.Root>
```

---

### 9.7 Pricing Tiers

```tsx
<div className="grid md:grid-cols-3 gap-6">
  {plans.map(plan => (
    <Card.Root highlighted={plan.recommended}>
      <Card.Header>
        <Card.Title>{plan.name}</Card.Title>
        <Card.Price>
          <AnimatedNumber value={plan.price} />
          <span>{plan.period}</span>
        </Card.Price>
      </Card.Header>
      <Card.Features items={plan.features} />
      <Card.CTA label="Escolher plano" />
    </Card.Root>
  ))}
</div>
```

Plano recomendado:
- Border gradient
- Background levemente diferente
- Badge "RECOMENDADO"

---

### 9.8 Sticky Footer CTA

Quando o usuario rolar perto do final, mostrar um footer mini-sticky com CTA primário. Aparece ao rolar 80% da página.

---

## 10. Copy & Tom de Voz

### 10.1 Princípios

- **Nunca usar jargon vazio.** "Transformamos pessoas em resultado" é proibido.
- **Sempre focar em transformação concreta:** "Aceleramos liderança executiva em 6 meses" > "Desenvolvemos pessoas".
- **Mostrar números reais sempre que possível.**
- **Manter tom executivo mas humano.** Não é frio, mas também não é "consultoria de coach".
- **Prosa direta, sem rodeios.**

### 10.2 Heurísticas

- Headlines: < 70 caracteres, usar contraste de peso (ex: light + medium)
- Subheadline: 1-2 frases, pode ser maior
- CTAs: verbos no infinitivo claros ("Agendar conversa", "Ver cases")
- Copy longo em Hero: max 35 palavras para a frase principal
- Case-study: 3 parágrafos curtos: contexto, abordagem, resultado

### 10.3 Padrões a evitar

- ❌ "transformação digital" sem contexto
- ❌ "jornada do colaborador" sem ação
- ❌ "você é único" sem nada depois
- ❌ "vamos juntos" etc
- ❌ clichês "o futuro do trabalho"
- ❌ emoji excessivo

### 10.4 Padrões a usar

- ✅ "em 90 dias, contratamos X lideranças"
- ✅ "ROI médio de 4.8x"
- ✅ "estrutura aplicada em 320+ empresas"
- ✅ "projeto começou em [data], resultados consolidados em [data]"

---

## 11. Performance

- **Imagens:** `next/image` ou `astro:assets` ou `unpic`
- **Vídeos:** `<video preload="metadata">` + `poster="..."` + IntersectionObserver para autoplay only when visible
- **Fonts:** preload apenas as 2-3 fontes críticas
- **CSS:** Tailwind prod build, content focada em arquivos importantes
- **Bundle:** < 200kb gzip JS, < 80kb CSS
- **LCP:** < 1.5s
- **FID:** < 100ms
- **CLS:** < 0.05
- **SSR/SSG:** se possível, para LCP
- **Imagens sempre com size conhecido:** width/height para evitar layout shift
- **CSS transform/opacity** only para animações (não animar box-shadow, width, etc)

---

## 12. SEO & Metadata

- title: < 60 caracteres, keyword + brand
- description: 150-160 caracteres, com CTA
- OG image 1200x630 (Cloudflare OG/og-image)
- Twitter Card
- Json-LD: Organization + Service + FAQ
- Canonical URL
- Sitemap (simples)
- H1 único, H2 por seção

---

## 13. Acessibilidade (não negociável)

- HTML semantico (nav, main, section, article, h1-h6)
- Contraste WCAG AA, AAA onde possível
- Reduced motion respeitado em 100% das animações
- Foco visível com ring custom
- Skip-link no topo
- Menu mobile com trap de foco
- Forms com labels e erros inline
- Idioma: `lang="pt-BR"` no html
- Alt text em todas imagens informativas
- Tab order fluído

---

## 14. Mídia — Origem e Padrão

### 14.1 Mídia gratuita

- **Pexels** (principal): `https://www.pexels.com/search/[keyword]`
- **Unsplash**: `https://unsplash.com/s/photos/[keyword]`

### 14.2 Mídia hospedada

- **CloudFront CDN**: vídeos de fundo
- **Mux**: streams HLS
- **Imgur/Giphy**: GIFs curtos (case studies motion)
- **Figma export**: assets próprios

### 14.3 Inputs para projetos

Para cada prompt, especifique:

- `[HeroVideo]: mp4 1920x1080, 8-15s loop`
- `[HeroImage]: 1920x1080`
- `[ServiceCard1-6]: 600x400`
- `[TeamPhotos]: 1200x900`
- `[Avatars]: 200x200`
- `[Icons32]: 32px SVG`
- `[Favicon]`
- `[OG]: 1200x630`

---

## 15. Princípios Anti-Genéricos

Cada prompt de alta qualidade deve:

1. **Não começar com "Somos uma consultoria..."**
2. **Não usar a palavra "transformar" sem qualificar**
3. **Não usar imagens muito "stock"** (salvo quando Pexels retorna boas)
4. **Não usar emoji como ícone.** Use lucide-react sempre.
5. **Não ter section "About Us" genérica.** Sobre é um subcapítulo do `Methodology`.
6. **Não ter testemunho "Lorem ipsum".** Use dados realistas.
7. **Não ter CTA "Saiba mais".** Sempre CTA com verbo de ação.
8. **Não usar "100% personalizado"** como diferencial — todos dizem.
9. **Não ter transição dura entre seções.** Use:
   - alternância tonal (light → surface → dark)
   - ou curvas SVG entre seções
   - ou gradiente sutil
10. **Não ter mais de 2 cores sólidas em toda a página.** Brand + accent.

---

## 16. Forma de Apresentar o Resultado Final

Cada landing page idealmente acompanha:

1. **Código React + Vite + TS** completo, clean
2. **README** com instruções de instalação e variáveis env
3. **Storybook** para componentes individuais (opcional)
4. **Mock JSON** com todos dados editáveis
5. **Light/Dark mode** toggle funcional
6. **Responsive testing** em 360px, 768px, 1024px, 1440px
7. **Performance audit** no Lighthouse com 90+ em todas categorias

---

## 17. Validação de Qualidade do Resultado

Antes de "fechar" a landing page como completa, valide:

- [ ] Headline tem tensão ou contraste (light + medium)
- [ ] CTA primário acima da dobra
- [ ] Trust badges visíveis em 3-5 segundos
- [ ] Cada seção tem um único objetivo claro
- [ ] CTA secundário aparece no bottom de cada sec
- [ ] Reduced motion testado
- [ ] Lighthouse 90+ em todas categorias
- [ ] Foco visível em todos elementos interativos
- [ ] Sem warn no React
- [ ] TypeScript strict sem erros
- [ ] CSS hover funciona mesmo se JS falhar
- [ ] Vídeos não ultrapassam 2MB (se possível)
- [ ] Fonts críticas preloadadas
- [ ] Imagens LCP otimizadas
- [ ] Layout shift 0
- [ ] Mobile menu funciona sem JS básico
- [ ] Footer linkado a Privacy, Terms, Imprint

---

## 18. Considerações Finais

- Esta página é **o ativo de marketing mais importante** da consultoria.
- Ela deve parecer **mais cara do que outras do segmento**.
- Cada detalhe deve sentir **decidido, não aleatório**.
- Use motion para vida, nunca para chamar atenção de outro ponto.

---

# COPY COMPLETA PREMIUM — Landing Page de Consultoria de RH

```markdown
# [NOME] — Consultoria de RH para empresas que escalam com gente

## SEÇÃO 1: NAVBAR (Sticky com Scroll Reveal)

**Estado inicial:**
- Logo [NOME] + tagline compacta
- Links: Sobre | Serviços | Cases | Conteúdo | Contato
- CTA: "Agendar conversa"
- Mobile: hamburger com animação suave
- Background: transparente, com blur ao scroll

**Ao rolar:**
- Border-bottom sutil
- Blur + background white/80
- Reduz padding (de py-5 para py-3)

---

## SEÇÃO 2: HERO (100svh)

**Eyebrow:**
"A consultoria de RH para empresas em crescimento"

**Headline (com BlurText + accent italic):**
"Estruturamos gente **na mesma velocidade** da estratégia"

**Subheadline:**
"Para CEOs e CHROs que escalam com gente. Diagnóstico rápido, plano customizado, execução com líderes reais. Comprovado em **+180 transformações** de RH nos últimos 12 anos."

**CTAs:**
- Primário: "Agendar diagnóstico" (com MagneticButton sutil)
- Secundário: "Ver 3 cases de impacto"

**Trust row:**
- 12 anos de mercado
- 180+ projetos
- 96% taxa de satisfação
- 4.8/5 NPS

**Visual direito:**
- Mock dashboard de "diagnóstico RH" com contadores animados
- Pequenos stat cards: Engagement Score, Turnover, Time-to-Hire, Leadership Index
- Mini sparkline animada

---

## SEÇÃO 3: TRUSTED BY (Logo Marquee com fade)

**Heading pequeno:**
"Confiam na [NOME]:"

**Marquee horizontal com 12 logos** de clientes (Pexels → logomarca estilizada ou inicial estilizada).
Velocidade lenta, fade nas pontas, pausa em hover.

---

## SEÇÃO 4: PROBLEMA — "Você reconhece algum desses sintomas?"

**Headline:**
"Sintomas comuns em empresas que estão escalando sem estrutura"

**3 cards:**

1. ⚠️ **Contrata sem critério**
   - "Lideranças diferentes contratando diferente. Resultado: 1 em 3 contrata precisa ser refeita em 6 meses."

2. ⚠️ **Perde gente estratégica**
   - "Saídas inesperadas de key talent viram crises. Cada saída: R$ 180K-250K de custo total."

3. ⚠️ **Liderança parada no tempo**
   - "Gestores promovidos por competência técnica, sem preparo para conduzir gente. Clima despenca, conflitos crescem."

---

## SEÇÃO 5: SOLUÇÃO (3 pilares)

**Headline:**
"Três frentes para estruturar RH de verdade"

**3 cards com gradient border sutil:**

1. **Diagnóstico Profundo**
   - "Mapeamos cultura, clima, competências e pipeline em 30 dias. Relatório executivo + plano de 90 dias."

2. **Desenvolvimento de Liderança**
   - "Programas baseados em prática. Líderes aplicam no trabalho desde a semana 1."

3. **Operação + Governança**
   - "Implementamos processos, rituais e dashboards que sustentam o crescimento."

---

## SEÇÃO 6: MÉTRICAS (Bento Stats)

**Headline:**
"O que entregamos consistentemente"

**Bento com 4 números:**
- 42% redução média em rotatividade crítica
- 2.3x aceleração em promoções internas
- 18 dias tempo médio para diagnosticar clima
- 96% taxa de satisfação dos clientes

Estilo: grid com divisões internas finas e counters animados.

---

## SEÇÃO 7: SERVIÇOS (Bento Grid)

**Headline:**
"Como podemos ajudar"

**Bento assimétrico com 6 serviços:**

1. Diagnóstico Estratégico (wide)
2. Mapeamento de Cultura
3. Desenvolvimento de Liderança
4. Estruturação de People Ops
5. Recrutamento Estratégico (wide)
6. Mentoria Executiva

Cada card com ícone lucide, título, descrição curta e hover brilhante.

---

## SEÇÃO 8: METODOLOGIA (Timeline Numerada)

**Eyebrow:** "// O método"

**Headline:**
"Como entregamos em 90-180 dias"

**Timeline com 4 etapas numeradas:**

01. **Imersão (Semana 1-3)**
   Entrevistas com C-level e lideranças, diagnóstico de cultura e dados.

02. **Plano (Semana 4-6)**
   Roadmap executivo com quick wins e frentes estruturais.

03. **Execução (Mês 2-5)**
   Workshops + mentorias + rituai, com coaches acompanhando.

04. **Sustentação (Mês 6+)**
   Indicadores, governança, capacidade interna transferida.

---

## SEÇÃO 9: CASES (Bento com vídeo/imagem)

**Headline:**
"Transformações reais"

**3 cases em bento:**

**Featured (large):**
- TechCorp — Escalou de 200 para 800 pessoas em 18 meses mantendo cultura
  - Resultados: eNPS +32, rotatividade -47%, sucessão +340%

**Case 2:**
- Indústria Fortune 500 — Reestruturou 9 áreas com base em clima
  - Resultados: clima 2.8 → 4.6, absenteísmo -38%

**Case 3:**
- StartUp Latam — Implementou People Ops completo
  - Resultados: de 30 para 220 pessoas, sem perder DNA, NPS 9.1

---

## SEÇÃO 10: TESTIMONIALS

**Headline:**
"Quem contratou a [NOME] recomenda"

**Carrossel com 5 quotes:**

1. **CEO, Tech Multinacional**
   "Em 6 meses, viramos RH de estratégico em prática. A metodologia da [NOME] transformou completamente como gerimos gente."

2. **CHRO, Grupo Industrial**
   "Eles não fizeram auditoria. Implementaram. Nosso clima subiu 2 pontos em 90 dias."

3. **Founder, StartUp**
   "De 25 para 200 pessoas sem perder cultura. Só foi possível com a estrutura que eles montaram."

4. **CFO, Multinacional**
   "ROI comprovado: cada R$ 1 investido voltou R$ 4.20 em produtividade."

5. **VP Gente, Varejo**
   "Time de consultores que entende de negócio, não só de RH. Parceria real."

---

## SEÇÃO 11: PRICING

**Headline:**
"Três formatos de engajamento"

**Toggle: Mensal | Trimestral** (default mensal)

**3 cards:**

**Starter** — R$ 18K/trim
- Diagnóstico inicial
- Plano estratégico
- 4 workshops
- **ROI médio 3x**

**Scale** — R$ 65K/trim **RECOMENDADO**
- Diagnóstico + plano
- 10 workshops
- Mentoria 1:1
- Dashboard executivo
- **ROI médio 4.8x**

**Enterprise** — Custom
- Programa anual
- RH on demand
- Acesso direto a sócio
- **ROI médio 6x+**

---

## SEÇÃO 12: FAQ

**Headline:**
"Perguntas comuns"

1. **Quanto tempo até ver resultados?**
   30 dias: quick wins. 90 dias: mudanças culturais mensuráveis. 6-12 meses: transformação consolidada.

2. **Como vocês customizam para nossa realidade?**
   Diagnóstico inicial em 30 dias identifica contexto único. Plano é desenhado para sua cultura, tamanho e maturidade.

3. **Vocês atendem qualquer porte?**
   Sim. Atendemos empresas de 25 a 5.000 colaboradores com abordagem adaptada.

4. **Como é garantido o resultado?**
   Não prometemos milagre. Prometemos plano de 90 dias com KPIs claros. Se não atingirmos, ajustamos sem cobrança extra.

5. **Como começar?**
   Agende conversa inicial gratuita. Em 30 minutos, vamos entender seu desafio e indicar se faz sentido.

---

## SEÇÃO 13: RECURSOS / BLOG

**Headline:**
"Conteúdo que sustenta a decisão"

**3 posts em destaque:**

1. **5 falhas que custam R$ 250K por contratação**
   - Insights sobre recrutamento sem critério

2. **Como construir sucessão em 12 meses**
   - Framework aplicado

3. **Planilha: Calculadora de Custo de Rotatividade**
   - Ferramenta interativa

---

## SEÇÃO 14: CTA FINAL

**Headline:**
"Vamos diagnosticar sua operação de RH?"

**Subhead:**
"Primeira conversa: 30 minutos. Sem cobrança, sem proposta agressiva. Apenas diagnóstico do seu desafio."

**CTAs:**
- Primário: "Agendar conversa diagnóstica"
- Secundário: "Receber material gratuito"

---

## SEÇÃO 15: FOOTER

**Coluna 1:**
Logo + tagline + social icons

**Coluna 2:**
Serviços (links para anchor sections)

**Coluna 3:**
Empresa (Sobre, Cases, Blog, Carreiras)

**Coluna 4:**
Legal + Contato

**Newsletter:**
"Receba 1 framework por mês"

**Bottom:**
"© 2026 [NOME] — Todos direitos reservados"
Política de Privacidade | Termos
```

---

## Observações Finais

Este prompt é um sistema, não apenas um template. Cada projeto pode personalizar:

- Tipografia principal (serif vs sans, peso contraste)
- Cor primária (azul vs violeta vs verde)
- "Hero move" (dashboard, vídeo full-bleed, mockup, marquee)
- Tom de voz (executivo, narrativo, data-driven)

Mas a estrutura de **qualidade visual e técnica** permanece a mesma.

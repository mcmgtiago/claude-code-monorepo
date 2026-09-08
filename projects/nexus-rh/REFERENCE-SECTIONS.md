# NEXUS Landing Page — Referência de Seções

## Seção 01: HERO (Editorial Minimalista)

**Layout:** Grid 12-col, max-width 1440px
- Esquerda (col 1-6): Eyebrow + Headline + Subheadline + 2 CTAs
- Direita (col 7-12): SignalMap SVG

**Headline:**
```
Quando crescer exige mais do que contratar.
                      [mais em verde serif italic]
```

**CTAs:**
- Primary: "Mapear meu cenário" (verde)
- Secondary: "Ver como atuamos" (outline)

**Animação:** WordReveal na headline, stagger 60ms

---

## Seção 02: TENSÕES

**Layout:** Grid 12-col
- Esquerda: Texto introdutório
- Direita: 3 cards empilhados com hover

**Cards:**
```
01 — Decisões lentas
02 — Cultura desigual  
03 — Talento desperdiçado
```

**Hover effect:**
- Número muda para verde
- Ícone ArrowUpRight aparece
- Fundo muda para cinza claro

---

## Seção 03: FRENTES DE ATUAÇÃO

**Background:** Escuro (#1a1a1a)
**Layout:** Grid 12-col
- Esquerda (sticky): Headline + subtexto
- Direita: Seletor de 3 frentes com painel animado

**Frentes:**
```
01 — People OS
02 — Liderança em Escala
03 — Cultura por Desenho
```

**Interação:**
- Click em frente abre painel com AnimatePresence
- Painel mostra descrição + outcomes + CTA
- Mobile: vira accordion

---

## Seção 04: MÉTODO NEXUS

**Layout:** Timeline sticky (240vh total height)
- Desktop: painel sticky com progressão ao scroll
- Mobile: 4 cards empilhados com linha vertical

**Etapas:**
```
01 MAPEAR (Semanas 1-2)
02 DIRECIONAR (Semanas 3-4)
03 IMPLANTAR (Meses 2-4)
04 CONSOLIDAR (Contínuo)
```

**Animation:** useScroll + useTransform para progress bar

---

## Seção 05: RESULTADOS

**Background:** Escuro com glow verde
**Layout:** Grid 12-col
- Esquerda: Seletor de 3 cases
- Direita: Painel com desafio + intervenção + resultado + 3 métricas

**Cases:**
```
01 — Skala (Fintech, 350 pessoas)
02 — Onda (Healthtech, 620 pessoas)
03 — Vereda (Indústria, 1100 pessoas)
```

**Métricas:**
- MetricTicker animado
- Delta pill com direção
- Barra comparativa

---

## Seção 06: FORMATOS DE PARCERIA

**Background:** Claro (#fafaf8)
**Layout:** 3 cards lado a lado (desktop) / empilhados (mobile)

**Cards:**
```
01 SPRINT — Diagnóstico Express (3 semanas)
02 PROGRAMA — Projeto Estruturado (12-24 semanas) ⭐ Destaque
03 PARCERIA — Advisory Mensal (Ciclo contínuo)
```

**Card do meio:**
- Badge verde: "Mais indicado para transformação complexa"

**Hover:** translate-y -1px + shadow

---

## Seção 07: DEPOIMENTOS

**Background:** Cinza claro (#f0eeea)
**Layout:** Grid 12-col
- Esquerda: Headline + subtexto
- Direita: Card escuro + controles

**Card:**
- Citação em Instrument Serif italic grande
- Aspas decorativas no canto (branco 10% opacidade)
- Autor + cargo + empresa no rodapé

**Controles:**
- 2 botões circulares (prev/next)
- Indicador "01/03"
- Barra de progresso com 3 segmentos

**Interação:**
- Sem autoplay
- Suporte a setas do teclado
- AnimatePresence na troca

---

## Seção 08: FAQ

**Background:** Claro
**Layout:** Centralizado, max-width 1000px
**Container:** Accordion com 6 itens

**Perguntas:**
1. Vocês trabalham apenas com grandes empresas?
2. Quanto tempo leva para aparecer um primeiro resultado?
3. A NEXUS entrega apenas diagnóstico?
4. Vocês substituem o time interno de RH?
5. Como funciona a primeira conversa?
6. É possível contratar uma frente específica?

**Item:**
- Pergunta em h3
- Chevron em círculo (rotaciona ao abrir)
- Resposta com AnimatePresence (height + opacity)

---

## Seção 09: CTA + FOOTER

### CTA Final
**Background:** Escuro + grid + glow verde
**Layout:** Grid 12-col
- Esquerda: Headline + Subtexto + Dados de contato
- Direita: Formulário

**Formulário (React Hook Form + Zod):**
```
Nome (text)
E-mail (email)
Empresa (text)
Tamanho (select)
Desafio (textarea)
Consentimento (checkbox)
```

**Submit:**
- Estado de loading com spinner
- Estado de sucesso com CheckCircle2
- Fade-out do formulário, fade-in da mensagem de sucesso

### Footer
**Background:** #0c0e0c (mais escuro)
**Layout:** 4 colunas (desktop) / responsivo (mobile)

**Colunas:**
1. Logo + Descrição + Links (contato, LinkedIn)
2. Navegação (Abordagem, Soluções, Método, Resultados)
3. Conteúdo (Insights, Cases, FAQ, Contato)
4. Legal (Privacidade, Termos, Cookies)

**Rodapé:**
- Copyright
- Tagline

### NAVBAR (fixa em todas as páginas)
**Estados:**
- Scroll 0: Fundo transparent, texto branco/ink
- Scroll > 60px: Fundo blur + border, sticky top, border-radius full

**Estrutura:**
- Logo NEXUS (esquerda)
- Nav (centro): Abordagem, Soluções, Resultados, Insights
- CTA (direita): Mapear meu cenário
- Mobile: Hamburger com drawer fullscreen

---

## Animações Globais

**Reveal:** fade-up + blur ao viewport
```
opacity: 0 → 1
y: 40 → 0
blur: 8px → 0px
duration: 0.8s
ease: [0.22, 1, 0.36, 1]
```

**WordReveal:** Stagger 60ms por palavra

**Hover:** 200ms ease

**AnimatePresence:** 300-350ms com easing suave

---

## Paleta Visual

```css
--paper: #fafaf8                /* Off-white principal */
--paper-strong: #ffffff          /* Branco puro */
--paper-muted: #f0eeea           /* Cinza claro */
--ink: #1a1a1a                   /* Preto natural */
--ink-soft: #4a4a4a              /* Cinza escuro */
--ink-muted: #7a7a7a             /* Cinza médio */
--signal: #2d6a4f                /* Verde-escuro */
--signal-light: #40916c          /* Verde claro */
--signal-pale: #d8f3dc           /* Verde muito pálido */
--tension: #d4622c               /* Laranja-terra */
```

---

## Tipografia

**Fonts:**
- Manrope (sans) — corpo e headlines
- Instrument Serif (serif) — destaque em palavras-chave (italic)
- DM Mono (mono) — labels, números, eyebrows

**Escala:**
- H1 (hero): clamp(2.8rem, 6vw, 4.8rem)
- H2 (sections): clamp(2rem, 4vw, 3.2rem)
- H3 (cards): 1.5rem - 1.75rem
- Body: 16px - 18px
- Labels: 11px - 12px uppercase

---

## Mobile Breakpoints

- **320px:** Extra small phones
- **640px:** Tablets small
- **1024px:** Desktop min
- **1440px:** Desktop max

**Ajustes:**
- Sidebar/sticky → normal flow
- 3 cols → 1 col
- Hover effects → desativados
- Font sizes → reduzidas com clamp()

---

## Acessibilidade

✅ Headings hierárquicos (h1, h2, h3)
✅ Landmarks (nav, main, footer)
✅ Focus-visible em todos os botões
✅ ARIA labels e descriptions
✅ Keyboard navigation (tabs, enter, setas)
✅ Contraste WCAG AA (7:1)
✅ Alt text em imagens/SVGs
✅ Reduced motion respect

---

## SEO

**Title:** NEXUS | Estratégia de Pessoas, Liderança e Cultura

**Meta description:** A NEXUS ajuda empresas em expansão a transformar estratégia, liderança e cultura em sistemas de execução mais claros.

**JSON-LD:** Schema.org ProfessionalService

**Open Graph:** og:title, og:description, og:image

# Guia de Uso — NextSaaS System

## TL;DR — Começar Rápido

1. **Descreva seu site** — tipo, seções, cores, copy
2. **IA monta** — seleciona do catálogo, combina
3. **Customize** — edita `tokens.css` com suas cores
4. **Publish** — HTML + CSS prontos

---

## Passo 1: Descrever Seu Site

Mande uma mensagem como:

```
Quero um site para SaaS de gestão de tarefas.
- Seções: Hero (com vídeo), Features (grid), Pricing (toggle), FAQ, CTA newsletter, Footer
- Cores: Azul #3b82f6, branco, cinza escuro
- Fonte: Inter
- Copy: TaskFlow — Organize seu trabalho, mova-se mais rápido
- Sem: Blog, Blog templates
```

---

## Passo 2: IA Monta

A IA vai:

1. **Procurar no catálogo** os melhores templates para cada seção
   - Prioriza templates do mesmo nicho (gestão de tarefas)
   - Prioriza coerência visual (mesmas cores/fontes)

2. **Selecionar variantes**
   - `hero-video.html` (de qual template?)
   - `features-grid.html` (de qual template?)
   - `pricing-toggle.html` (de qual template?)
   - etc.

3. **Gerar arquivo único**
   - Monta a ordem: Hero → Features → Pricing → FAQ → CTA → Footer
   - Inclui `tokens.css`
   - Substitui placeholders de texto

4. **Output em** `sites/seu-projeto/index.html`

---

## Passo 3: Customizar via Tokens

Abra `tokens/tokens.css` e edite:

```css
:root {
  /* Azul para seu brand */
  --color-primary: #3b82f6;
  
  /* Cinza escuro */
  --color-secondary: #1f2937;
  
  /* Branco */
  --color-accent: #ffffff;
  
  /* Fonte */
  --font-display: "Inter", sans-serif;
  --font-body: "Inter", sans-serif;
}
```

Pronto! Todas as seções já usam esses tokens, então:
- Botões ficarão azuis
- Textos respectarão `--font-display`
- Backgrounds respeitarão a paleta

---

## Passo 4: Editar Copy e Imagens

Abra `sites/seu-projeto/index.html` e:

- **Substitua textos** onde estiverem placeholders
  - "Lorem ipsum" → seu copy real
  - "Hero headline" → seu headline

- **Troque imagens**
  - Pontos onde houver `<img src="assets/...">`
  - Copie suas imagens para `sites/seu-projeto/assets/`

---

## Exemplo Completo

### Seu pedido:
```
Quero site para SaaS de gestão de projetos.
Hero com gradiente, features 3-col, pricing 3 tiers, testimonials, FAQ.
Roxo #8b5cf6, preto, branco. Inter Tight. Nome: ProjectX.
```

### IA faz:

1. Busca `templates-doc/` + `catalog/`
2. Encontra os 5 melhores templates para "gestão de projetos"
3. Extrai:
   - Hero gradiente → payment-solution ou pos-system
   - Features grid 3-col → cloud-software ou insurance
   - Pricing 3-tier → payment-solution ou ai-solutions
   - Testimonials carousel → investment-management ou pos-system
   - FAQ accordion → insurance ou web-hosting

4. Monta:
```
sites/projectx/
├── index.html (montado com as 5 seções)
├── tokens.css (roxo #8b5cf6, Inter Tight)
└── assets/ (imagens copiadas)
```

### Seu arquivo fica assim:

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="tokens.css">
</head>
<body>
  <!-- HERO (de payment-solution) -->
  <section class="hero">
    <!-- seu copy -->
  </section>

  <!-- FEATURES (de cloud-software) -->
  <section class="features">
    <!-- seu copy -->
  </section>

  <!-- PRICING (de ai-solutions) -->
  <section class="pricing">
    <!-- seu copy -->
  </section>

  <!-- TESTIMONIALS (de pos-system) -->
  <section class="testimonials">
    <!-- seu copy -->
  </section>

  <!-- FAQ (de insurance) -->
  <section class="faq">
    <!-- seu copy -->
  </section>
</body>
</html>
```

### Você edita:
- Textos (copy)
- Imagens (assets/)
- Cores (tokens.css)

**Resultado:** Site pronto em ~10 minutos, não horas.

---

## Seções Disponíveis

Cada template contribui com seções que podem ser reutilizadas:

### Hero (variantes)
- `hero-gradient` — Gradient simples
- `hero-video` — Com vídeo de fundo
- `hero-parallax` — Parallax scroll
- `hero-illustration` — Com ilustração
- `hero-animation` — Animação GSAP

### Features (variantes)
- `features-grid` — Grid 3-col
- `features-tabs` — Tabs com tabs.js
- `features-cards` — Cards com hover
- `features-accordion` — Accordion
- `features-before-after` — Before/after

### Pricing (variantes)
- `pricing-toggle` — Toggle mensal/anual
- `pricing-grid-3col` — 3 tiers
- `pricing-grid-4col` — 4 tiers
- `pricing-table` — Tabela comparativa
- `pricing-featured` — 1 destaque + 2 secundários

### Testimonials (variantes)
- `testimonials-carousel` — Swiper carousel
- `testimonials-grid` — Grid estático
- `testimonials-flip` — Flip cards
- `testimonials-marquee` — Marquee animado

### CTA (variantes)
- `cta-newsletter` — Email signup
- `cta-trial` — Trial 14 dias
- `cta-demo` — Demo booking
- `cta-contact` — Contact form

### Navigation (variantes)
- `nav-pill-floating` — Pill floating sticky
- `nav-sticky` — Nav tradicional sticky
- `nav-mega-menu` — Mega menu
- `nav-hamburger` — Mobile hamburger

### Footer (variantes)
- `footer-minimal` — 3-4 colunas
- `footer-mega` — 6+ colunas
- `footer-newsletter` — Com newsletter

### Outras
- `about-timeline` — Timeline da empresa
- `team-grid` — Grid de time
- `values-cards` — Cards de valores
- `blog-featured` — Featured + list
- `integrations-orbit` — Logo orbit animation
- `social-proof-marquee` — Logo marquee

---

## Dicas Práticas

### ✅ Combinar bem
- Templates do **mesmo nicho** → coerência visual automática
- Preferir templates **8+/10 quality** (documentado em cada .md)

### ✅ Customizar rápido
- **Sempre** use `tokens.css`
- **Nunca** edite cores inline no HTML
- Se precisar mudança global de cor, 1 lugar resolve

### ✅ Imagens
- Copie imagens reais pra `assets/`
- Remova imagens placeholder (`ns-img-*.png`)
- Teste responsive em mobile

### ❌ Evitar
- Misturar 5+ templates diferentes (visual desconexo)
- Editar CSS de componentes individuais (mantenha separado)
- Deixar placeholders no deploy

---

## FAQ

**P: Como mudo a cor do botão principal?**  
R: Edite `tokens.css`, mude `--color-primary`. Todos os botões `.btn-primary` ficam com a cor nova.

**P: Posso misturar templates muito diferentes?**  
R: Pode, mas fica visual desconexo. Melhor agrupar por nicho/estilo.

**P: Como adiciono uma seção que não existe no catálogo?**  
R: Você escreve o HTML/CSS da nova seção seguindo a mesma estrutura, e ela usa `tokens.css` automaticamente.

**P: Preciso de dark mode?**  
R: `tokens.css` já tem `@media (prefers-color-scheme: dark)`. Basta ativar os valores dark.

**P: Como faço deploy?**  
R: É HTML puro + CSS. Joga em qualquer hosting: Vercel, Netlify, servidor próprio.

---

*Guia pronto. Comece a pedir seus sites!*

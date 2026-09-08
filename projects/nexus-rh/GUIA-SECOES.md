# GUIA DE FLUXO: NEXUS Landing Page — Seção por Seção

---

## Estrutura Geral

Este projeto gera a landing page da **NEXUS People Strategy** de forma **iterativa e modular**:

1. **PROMPT #1** → Define briefing visual + Hero (3 opções de estilo)
2. **PROMPT #2** → Seção 02: O Custo do Desalinhamento
3. **PROMPT #3** → Seção 03: Frentes de Atuação (seletor interativo)
4. **PROMPT #4** → Seção 04: Método NEXUS (timeline sticky)
5. **PROMPT #5** → Seção 05: Resultados (case selector)
6. **PROMPT #6** → Seção 06: Formatos de Parceria (3 cards)
7. **PROMPT #7** → Seção 07: Depoimentos (carousel manual)
8. **PROMPT #8** → Seção 08: FAQ (accordion)
9. **PROMPT #9** → Seção 09: CTA Final + Formulário + Footer

**Total: 9 prompts para 9 seções + navbar**

---

## Fluxo de Cada Iteração

### Passo 1: Ler o prompt da seção
Exemplo: `02-secoes/PROMPT-02-secao-tensoes.md`

### Passo 2: Copiar o prompt inteiro
Selecionar todo o conteúdo do arquivo `.md`

### Passo 3: Colar em um chat com design-taste-frontend ou impeccable
Coloque o prompt no Claude Code (ou Claude Web) e invoque:
```
/design-taste-frontend [paste prompt]
```
Ou:
```
/impeccable craft [paste prompt]
```

### Passo 4: Receber 3 opções (se for hero) ou código direto (demais seções)
- **Seção 01 (Hero)**: Escolha 1 das 3 opções de estilo
- **Demais seções**: Agente gera direto, apenas com minor tweaks se necessário

### Passo 5: Salvar código em `02-secoes/SECAO-XX-GERADA.jsx`
Exemplo:
```
02-secoes/SECAO-01-HERO-ESCOLHA-1.jsx
02-secoes/SECAO-02-TENSOES.jsx
02-secoes/SECAO-03-FRENTES.jsx
```

### Passo 6: Testar no projeto React local
Copie o código para um arquivo React em seu projeto e teste com `npm run dev`

### Passo 7: Confirmar ou iterar
Se tiver tweaks, descreva-os no prompt e rode novamente

---

## Paleta Visual (mantém consistência entre seções)

```css
:root {
  --paper: #fafaf8;              /* Off-white quente */
  --paper-strong: #ffffff;       /* Branco puro */
  --paper-muted: #f0eeea;        /* Cinza muito claro */
  
  --ink: #1a1a1a;                /* Preto natural */
  --ink-soft: #4a4a4a;           /* Cinza escuro */
  --ink-muted: #7a7a7a;          /* Cinza médio */
  
  --signal: #2d6a4f;             /* Verde-escuro principal */
  --signal-light: #40916c;       /* Verde claro */
  --signal-pale: #d8f3dc;        /* Verde muito pálido */
  
  --tension: #d4622c;            /* Laranja-terra */
  --tension-pale: #f4d5c9;       /* Laranja muito pálido */
  
  --line: rgba(26, 26, 26, 0.12);
  --line-dark: rgba(255, 255, 255, 0.12);
}
```

**Obs:** Se você escolher a **Versão 3 (Dark Hero)** no PROMPT #1, todos os fundos mudam para variantes escuras. Os prompts subsequentes já têm instruções de adaptação.

---

## Tipografia (fixo em todas as seções)

```css
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

:root {
  --font-sans: "Manrope";
  --font-serif: "Instrument Serif";
  --font-mono: "DM Mono";
}
```

---

## Componentes Reutilizáveis (usar em todas as seções)

### 1. Reveal
Fade-up com blur ao entrar em viewport.
```tsx
<Reveal delay={0} duration={0.8}>
  <div>Conteúdo</div>
</Reveal>
```

### 2. WordReveal
Headline com cada palavra entrando sequencialmente.
```tsx
<WordReveal text="Quando crescer exige mais" />
```

### 3. MagneticButton
CTA com movimento leve do conteúdo ao cursor (desktop only).
```tsx
<MagneticButton>Mapear meu cenário</MagneticButton>
```

### 4. MetricTicker
Números animados ao entrar em viewport.
```tsx
<MetricTicker value={72} suffix="%" duration={1.4} />
```

### 5. SignalMap
Visualização SVG de alinhamento organizacional.
```tsx
<SignalMap alignment={72} signals={5} />
```

---

## Lista de Prompts Pendentes

- [ ] **PROMPT #1** — Hero + Briefing Visual (já pronto)
- [ ] **PROMPT #2** — Seção 02: Tensões (já pronto)
- [ ] **PROMPT #3** — Seção 03: Frentes de Atuação
- [ ] **PROMPT #4** — Seção 04: Método NEXUS
- [ ] **PROMPT #5** — Seção 05: Resultados (Cases)
- [ ] **PROMPT #6** — Seção 06: Formatos de Parceria
- [ ] **PROMPT #7** — Seção 07: Depoimentos
- [ ] **PROMPT #8** — Seção 08: FAQ
- [ ] **PROMPT #9** — Seção 09: CTA Final + Formulário + Footer + Navbar

---

## Dados Mock (reutilizáveis)

### Services (Frentes de Atuação)
```javascript
export const services = [
  {
    id: "people-os",
    number: "01",
    title: "People OS",
    description: "Diagnóstico e redesenho do sistema operacional de gente.",
    outcomes: [
      "Modelo operacional customizado",
      "Rituais de decisão claros",
      "Papéis e responsabilidades definidas"
    ]
  },
  {
    id: "lideranca-escala",
    number: "02",
    title: "Liderança em Escala",
    description: "Programa para primeira e segunda linha de gestão.",
    outcomes: [
      "Critérios compartilhados",
      "Rituais de feedback",
      "Plano de sucessão"
    ]
  },
  {
    id: "cultura-desenho",
    number: "03",
    title: "Cultura por Desenho",
    description: "Tradução de valores em comportamentos observáveis.",
    outcomes: [
      "Princípios comportamentais",
      "Mecanismos de gestão",
      "Rituais de alinhamento"
    ]
  }
];
```

### Cases (Resultados)
```javascript
export const cases = [
  {
    id: "skala",
    company: "Skala",
    sector: "Fintech",
    people: "350 pessoas",
    challenge: "Crescimento acelerado sem reorganização",
    outcome: "Em 90 dias, operação estruturada com clarity.",
    metrics: [
      { label: "Tempo de decisão", before: 15, after: 8, suffix: " dias", up: true },
      { label: "Clareza de prioridades", before: 42, after: 79, suffix: "%", up: true },
      { label: "eNPS de lideranças", before: 31, after: 58, suffix: " pts", up: true }
    ]
  },
  // ... mais 2 cases
];
```

### Testimonials (Depoimentos)
```javascript
export const testimonials = [
  {
    quote: "A NEXUS não trouxe um playbook pronto. Trouxe clareza de verdade.",
    name: "Marina Silva",
    role: "CEO",
    company: "Skala"
  },
  // ... mais 2 testimonials
];
```

### Formats (Formatos de Parceria)
```javascript
export const formats = [
  {
    id: "diagnostico-express",
    number: "01",
    title: "Diagnóstico Express",
    duration: "3 semanas",
    description: "Para organizações que precisam enxergar o problema antes de escolher uma solução.",
    deliverables: ["Diagnóstico objetivo", "Mapa de tensões", "Prioridades por impacto", "Reunião executiva"]
  },
  // ... mais 2 formatos
];
```

---

## FAQ (Seção 08)

```javascript
export const faqs = [
  {
    question: "Vocês trabalham apenas com grandes empresas?",
    answer: "Não. A NEXUS atua principalmente com empresas entre 200 e 2000 pessoas."
  },
  // ... mais 5 FAQs
];
```

---

## Checklist Final

Antes de considerar a landing page **pronta**:

- [ ] Navbar funcional (sticky, transição ao scroll, menu mobile)
- [ ] Hero gerado e testado
- [ ] Seção 02 a 09 geradas e integradas
- [ ] Paleta visual consistente em todas as seções
- [ ] Animações reveal funcionando ao viewport
- [ ] Componentes reutilizáveis testados
- [ ] Formulário final com validação Zod
- [ ] Links internos funcionando (smooth scroll)
- [ ] Mobile responsivo (testado em 320px, 640px, 1024px)
- [ ] Acessibilidade WCAG AA (headings, landmarks, focus, alt text)
- [ ] Performance: bundle <350kb, Web Vitals ok
- [ ] SEO: title, meta description, JSON-LD schema
- [ ] Dark mode (opcional, mas no escopo da Versão 3)

---

## Próximos Passos

1. Abra `PROMPT-01-visual-briefing-hero.md`
2. Copie o prompt inteiro
3. Paste em um chat com design-taste-frontend
4. Escolha uma das 3 versões de hero
5. Salve o código gerado em `02-secoes/SECAO-01-HERO.jsx`
6. Volte aqui e repita o processo para `PROMPT-02-secao-tensoes.md`

**Boa sorte! 🚀**

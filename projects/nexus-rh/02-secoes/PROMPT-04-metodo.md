# PROMPT #4: Seção 04 — Método NEXUS

---

## CONTEXTO

Você está criando a landing page da **NEXUS People Strategy**. As seções anteriores (Hero, Tensões, Frentes) já foram geradas. Agora vem o **Método** — como a NEXUS trabalha, em 4 etapas.

Esta seção comunica processo e confiabilidade. O visitante precisa entender que existe um caminho claro entre "chamar a NEXUS" e "ver resultado".

---

## DIREÇÃO VISUAL

- **Fundo:** var(--paper-strong) / #ffffff ou var(--paper) / #fafaf8
- **Texto:** var(--ink) para títulos, var(--ink-soft) para corpo
- **Accent:** var(--signal) para etapa ativa e linha de progresso
- **Labels:** DM Mono, 11px, uppercase
- **Motion:** useScroll + useTransform para progressão sticky (desktop only)

---

## LAYOUT DESKTOP — Timeline Sticky

**Conceito:** Container alto (200-240vh) com painel sticky interno que mostra a progressão das 4 etapas conforme o usuário rola.

### Cabeçalho (antes da timeline)

**Section Label:**
```
04 / MÉTODO NEXUS
```

**Headline:**
```
Fazemos o invisível caber na operação.
```
Manrope 600, clamp(2rem, 4vw, 3.2rem), leading 1.1
Destaque: "invisível" em Instrument Serif italic var(--signal)

**Subtexto:**
```
Da escuta inicial ao acompanhamento de impacto, cada etapa deixa um artefato que o time pode usar depois da consultoria.
```
Manrope 400, 18px, leading 1.6, var(--ink-soft), max-width 680px

---

### Timeline Sticky (Desktop)

**Container:**
```jsx
<div className="relative" style={{ height: '240vh' }}>
  <div className="sticky top-0 flex min-h-screen items-center">
    {/* Conteúdo da timeline */}
  </div>
</div>
```

**Estrutura visual:**
- Linha horizontal central que cresce conforme scroll (de 0% a 100%)
- 4 pontos na linha (equidistantes)
- Ponto ativo: var(--signal), 12px, com glow sutil
- Ponto inativo: var(--line), 8px
- Abaixo da linha: painel da etapa ativa

**Progressão com useScroll:**
```jsx
const containerRef = useRef(null);
const { scrollYProgress } = useScroll({ target: containerRef });
const activeStep = useTransform(scrollYProgress, [0, 0.33, 0.66, 1], [0, 1, 2, 3]);
```

**Não usar scroll-jacking.** O scroll é natural. A timeline apenas responde à posição.

---

### 4 Etapas

#### Etapa 01: Mapear
- **Duração:** Semanas 1-2
- **Descrição:** Diagnóstico de maturidade e tensões críticas via escuta profunda, análise de dados e observação direta.
- **Entrega:** Mapa executivo de tensões prioritárias
- **Ícone:** ScanSearch (Lucide)

#### Etapa 02: Direcionar
- **Duração:** Semanas 3-4
- **Descrição:** Definição de prioridades, princípios de gestão e plano de ação para os próximos 90-180 dias.
- **Entrega:** Plano estratégico de pessoas
- **Ícone:** Route (Lucide)

#### Etapa 03: Implantar
- **Duração:** Meses 2-4
- **Descrição:** Implantação de rituais, ferramentas e desenvolvimento de líderes com acompanhamento próximo.
- **Entrega:** Sistema operacional de gente
- **Ícone:** Wrench (Lucide)

#### Etapa 04: Consolidar
- **Duração:** Contínuo
- **Descrição:** Estabilização dos indicadores, governança dos rituais e ciclos de ajuste conforme a empresa evolui.
- **Entrega:** Sustentação da operação
- **Ícone:** ChartNoAxesCombined (Lucide)

---

### Painel da Etapa Ativa

```
rounded-[24px] border border-[var(--line)] bg-[var(--paper-muted)] p-8 max-w-[600px]
```

**Conteúdo:**
- Ícone: 32px, var(--signal)
- Número: DM Mono, 48px, var(--ink-muted)
- Nome: Manrope 700, 32px
- Duração: DM Mono, 12px, uppercase, var(--ink-muted)
- Descrição: Manrope 400, 16px, leading 1.6, var(--ink-soft)
- Entrega: border-left 3px solid var(--signal), pl-4, Manrope 500, 14px

**Transição entre etapas:**
```jsx
<AnimatePresence mode="wait">
  <motion.div
    key={currentStep}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
  />
</AnimatePresence>
```

---

### Layout Mobile (<1024px)

- **Desativar sticky** completamente
- Renderizar como **4 cards empilhados** com linha vertical à esquerda
- Linha vertical: 2px solid var(--line), com pontos verdes nos nós
- Cada card:
  - Ícone + Número + Nome (mesma linha)
  - Duração abaixo
  - Descrição
  - Entrega com border-left
- Reveal com stagger 100ms entre cards
- Sem dependência de scroll progress

---

## ANIMAÇÕES

- Headline: WordReveal ou Reveal padrão
- Linha horizontal (desktop): width cresce de 0% a 100% conforme scrollYProgress
- Pontos: scale 0.8→1 quando ativo, cor muda
- Painel: AnimatePresence com slide horizontal
- Mobile cards: Reveal com stagger

---

## ACESSIBILIDADE

- aria-label no container da timeline: "Método NEXUS em 4 etapas"
- Cada etapa tem heading adequado (h3)
- Pontos da timeline são decorativos (aria-hidden)
- Mobile: cards são naturalmente acessíveis (sem scroll tricks)
- Reduced motion: desativa sticky, mostra cards empilhados

---

## CRITÉRIOS DE ACEITE

- [ ] Headline com "invisível" em serif itálica verde
- [ ] Desktop: timeline sticky com progressão ao scroll
- [ ] 4 etapas com ícone, número, nome, duração, descrição, entrega
- [ ] Linha horizontal cresce conforme scroll (useScroll)
- [ ] Painel da etapa ativa com AnimatePresence
- [ ] Mobile: 4 cards empilhados com linha vertical
- [ ] Sem scroll-jacking
- [ ] Reduced motion: mostra tudo empilhado
- [ ] Acessibilidade: headings, aria-labels
- [ ] Copy em Português

---

**FIM DO PROMPT #4**
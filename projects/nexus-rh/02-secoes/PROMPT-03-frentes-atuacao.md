# PROMPT #3: Seção 03 — Frentes de Atuação

---

## CONTEXTO

Você está criando a landing page da **NEXUS People Strategy**. O hero e a seção de tensões já foram gerados. Agora vem a seção que mostra **o que a NEXUS faz** — suas 3 frentes de atuação.

Esta seção é a ponte entre "o problema" (tensões) e "como resolvemos" (método). Ela precisa comunicar que a NEXUS não vende pacotes genéricos — ela constrói sistemas sob medida.

---

## DIREÇÃO VISUAL (Herança das seções anteriores)

- **Fundo:** var(--ink) / #1a1a1a (seção escura para contraste)
- **Texto:** branco / rgba(255,255,255,0.65) para subtexto
- **Accent:** var(--signal) / var(--signal-light) para destaques
- **Tipografia:** Manrope para corpo, Instrument Serif italic para palavras-chave
- **Labels:** DM Mono, 11px, uppercase
- **Motion:** Reveal padrão + AnimatePresence na troca de painéis

---

## LAYOUT

### Desktop (12-col grid, max-width 1440px)

```
Col 1-4: Introdução (sticky top-32)
Col 5-12: Seletor de soluções
```

### Coluna Esquerda (Col 1-4, sticky)

**Section Label:**
```
03 / FRENTES DE ATUAÇÃO
```
DM Mono, 11px, uppercase, tracking +0.15em, rgba(255,255,255,0.45)

**Headline:**
```
Não vendemos pacotes.
Construímos sistemas que a operação
consegue sustentar.
```
Manrope 600, clamp(1.8rem, 3vw, 2.6rem), leading 1.1, text-white
Destaque: "sustentar" em Instrument Serif italic var(--signal-light)

**Subtexto:**
```
Cada frente começa pela realidade da empresa e termina em mecanismos práticos de decisão, gestão e acompanhamento.
```
Manrope 400, 16px, leading 1.6, rgba(255,255,255,0.55), max-width 400px

---

### Coluna Direita (Col 5-12) — Seletor Interativo

**Estrutura Desktop:**
- Lista vertical à esquerda (botões/tabs)
- Painel visual à direita
- Primeira frente ativa por padrão
- Clique muda conteúdo com AnimatePresence (opacity + y:12)

**Lista de frentes (role="tablist"):**

Cada item é um botão acessível com:
- Número: DM Mono, 11px, rgba(255,255,255,0.4)
- Título ativo: Manrope 500, 28px, var(--signal-light)
- Título inativo: Manrope 500, 28px, rgba(255,255,255,0.5), hover → white
- Border-top: 1px solid rgba(255,255,255,0.15)
- Padding: py-6
- aria-selected, role="tab"

**Dados das 3 frentes:**

#### Frente 01: People OS
- **Título:** People OS
- **Descrição:** Diagnóstico e redesenho do sistema operacional de gente. Estrutura, papéis, rituais e accountability para empresas que precisam virar adultas sem perder a alma.
- **Outcomes:**
  - Modelo operacional customizado
  - Papéis e responsabilidades definidos
  - Rituais de decisão claros
  - Indicadores de gestão conectados ao negócio

#### Frente 02: Liderança em Escala
- **Título:** Liderança em Escala
- **Descrição:** Programa para primeira e segunda linha de gestão. Critérios compartilhados, rituais de feedback, planos de sucessão — para que líderes tomem decisões melhores sem centralizar tudo em poucas pessoas.
- **Outcomes:**
  - Mapa de competências críticas
  - Jornadas para lideranças
  - Plano de sucessão aplicável
  - Rituais de feedback estruturados

#### Frente 03: Cultura por Desenho
- **Título:** Cultura por Desenho
- **Descrição:** Tradução de valores em comportamentos observáveis. Cultura não é uma série de eventos — é clareza que aparece todos os dias em mecanismos, rituais e práticas de gestão.
- **Outcomes:**
  - Princípios comportamentais observáveis
  - Ciclos de performance claros
  - Rituais de alinhamento
  - Práticas de gestão desenhadas

---

### Painel Visual (à direita do seletor)

```
relative min-h-[480px] overflow-hidden rounded-[28px] border border-white/15 bg-white/[0.04] p-8
```

**Conteúdo do painel (por frente ativa):**
- Número grande: DM Mono, 80px, rgba(255,255,255,0.08)
- Descrição: Manrope 400, 16px, leading 1.6, rgba(255,255,255,0.7)
- Lista de outcomes com ícone Check (Lucide, 16px, var(--signal-light))
- CTA textual: "Explorar esta frente →" (Manrope 500, 14px, var(--signal-light))

**Transição:**
```jsx
<AnimatePresence mode="wait">
  <motion.div
    key={activeService.id}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
  >
    {/* conteúdo da frente ativa */}
  </motion.div>
</AnimatePresence>
```

---

### Layout Mobile (<640px)

- Coluna esquerda vira texto introdutório normal (não sticky)
- Seletor vira **accordion** (apenas uma frente aberta por vez)
- Cada item do accordion:
  - Botão com número + título
  - Ao abrir: mostra descrição + outcomes + CTA
  - AnimatePresence com height auto + opacity
- Não usar painel visual separado no mobile

---

## ANIMAÇÕES

- Reveal geral da seção: fade-up + blur padrão
- Itens da lista: stagger 80ms
- Painel visual: AnimatePresence mode="wait" com fade + slide
- Ícones Check nos outcomes: stagger 50ms após painel entrar

---

## ACESSIBILIDADE

- role="tablist" no container de tabs
- role="tab" + aria-selected em cada botão
- role="tabpanel" no painel visual
- aria-controls e aria-labelledby corretos
- Focus-visible com outline var(--signal-light)
- Keyboard: ArrowDown/ArrowUp para navegar entre tabs

---

## CRITÉRIOS DE ACEITE

- [ ] Fundo escuro (var(--ink)) para contraste com seção anterior
- [ ] Headline com "sustentar" em serif itálica verde
- [ ] 3 frentes como seletor de tabs (desktop) / accordion (mobile)
- [ ] AnimatePresence na troca de painéis
- [ ] Cada frente mostra: descrição + lista de outcomes + CTA
- [ ] Painel com border radius 28px e borda sutil
- [ ] Acessibilidade: tabs com role/aria corretos
- [ ] Coluna esquerda sticky no desktop
- [ ] Mobile: accordion funcional
- [ ] Copy exata em Português

---

**FIM DO PROMPT #3**
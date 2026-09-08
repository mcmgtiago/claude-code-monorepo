# PROMPT #5: Seção 05 — Resultados (Cases)

---

## CONTEXTO

Você está criando a landing page da **NEXUS People Strategy**. As seções anteriores já foram geradas. Agora vem a seção de **Resultados** — onde mostramos cases reais (fictícios para demo) com métricas antes/depois.

Esta é a seção de prova social técnica. Não é sobre elogios — é sobre **mudanças reais em indicadores e comportamento**.

---

## DIREÇÃO VISUAL

- **Fundo:** var(--ink) / #1a1a1a (seção escura)
- **Texto:** branco, com hierarquia de opacidade
- **Accent:** var(--signal-light) para métricas positivas
- **Glow:** radial-gradient verde sutil no canto superior direito
- **Cards:** rounded-[30px] border border-white/15 bg-white/[0.04]

---

## LAYOUT

### Cabeçalho

**Section Label:**
```
05 / RESULTADOS QUE VIRAM ROTINA
```
DM Mono, 11px, uppercase, rgba(255,255,255,0.45)

**Headline:**
```
Mudanças reais precisam aparecer em
comportamento, indicadores e decisões.
```
Manrope 600, clamp(2rem, 4vw, 3rem), text-white
Destaque: "reais" em Instrument Serif italic var(--signal-light)

**Subtexto:**
```
Acompanhe exemplos de como diferentes contextos foram traduzidos em sistemas de gestão mais claros.
```
Manrope 400, 16px, rgba(255,255,255,0.55)

---

### Desktop (12-col grid)

```
Col 1-4: Lista de cases (seletor vertical)
Col 5-12: Painel do case ativo
```

#### Seletor de Cases (Col 1-4)

3 botões empilhados, cada um com:
- Número: "01", "02", "03" (DM Mono, 11px, rgba(255,255,255,0.4))
- Empresa: Manrope 600, 20px, white
- Setor + pessoas: DM Mono, 11px, rgba(255,255,255,0.4)

**Case ativo:**
- Fundo: rgba(255,255,255,0.08)
- Border: 1px solid rgba(255,255,255,0.15)
- Indicador vertical verde à esquerda (3px, var(--signal-light))
- Border-radius: 16px

**Case inativo:**
- Fundo: transparent
- Hover: rgba(255,255,255,0.04)

---

#### Painel do Case Ativo (Col 5-12)

```
rounded-[30px] border border-white/15 bg-white/[0.04] p-6 md:p-10
```

**Conteúdo do painel:**

1. **Header:** empresa + setor + pessoas (DM Mono, 11px, uppercase)
2. **Bloco Desafio:**
   - Label: "DESAFIO" (DM Mono, 10px, rgba(255,255,255,0.4))
   - Texto: Manrope 400, 15px, rgba(255,255,255,0.7)
3. **Bloco Intervenção:**
   - Label: "INTERVENÇÃO" (DM Mono, 10px, rgba(255,255,255,0.4))
   - Texto: Manrope 400, 15px, rgba(255,255,255,0.7)
4. **Frase de resultado em destaque:**
   - Manrope 500, 18px, white, border-left 3px solid var(--signal-light), pl-4
5. **3 Métricas comparativas** (grid 3-col no desktop, 1-col mobile)

---

### Componente Métrica

Cada métrica mostra:
- **Label:** DM Mono, 10px, uppercase, rgba(255,255,255,0.4)
- **Valor anterior:** Manrope 400, 14px, rgba(255,255,255,0.35), line-through sutil
- **Valor final:** Instrument Serif italic, 36px, white (MetricTicker animado)
- **Delta pill:** bg var(--signal-light)/20, text var(--signal-light), border-radius full, 11px
  - Se direction === "down" e é eficiência: pill verde (ex: "-7 dias")
  - Se direction === "up": pill verde (ex: "+37%")
- **Barra comparativa:** height 4px, fundo rgba(255,255,255,0.1), fill var(--signal-light)

---

### Dados dos 3 Cases

#### Case 01: Skala
- **Empresa:** Skala
- **Setor:** Fintech
- **Pessoas:** 350 pessoas
- **Desafio:** Crescimento acelerado sem reorganização. Líderes passaram a operar sem critérios compartilhados e a empresa perdia consistência nas decisões.
- **Intervenção:** Diagnóstico de maturidade, redesenho de rituais de liderança e implementação de sistema de performance com critérios claros.
- **Resultado:** Em quatro meses, a organização reduziu ruídos de priorização e passou a operar com uma linguagem única de gestão.
- **Métricas:**
  - Tempo de decisão: 15 → 8 dias (direction: down)
  - Clareza de prioridades: 42% → 79% (direction: up)
  - eNPS de lideranças: 31 → 58 pts (direction: up)

#### Case 02: Onda
- **Empresa:** Onda
- **Setor:** Healthtech
- **Pessoas:** 620 pessoas
- **Desafio:** Expansão para novas unidades criou práticas de liderança inconsistentes e aumentou a perda de talentos críticos.
- **Intervenção:** Mapeamento de posições-chave, programa de sucessão estruturado e formação de gestores de primeira linha.
- **Resultado:** A empresa criou uma cadência de sucessão mensurável e reduziu dependências individuais em áreas críticas em 12 semanas.
- **Métricas:**
  - Turnover voluntário: 21.4% → 12.8% (direction: down)
  - Sucessores mapeados: 12 → 67 (direction: up)
  - Promoções internas: 18% → 49% (direction: up)

#### Case 03: Vereda
- **Empresa:** Vereda
- **Setor:** Indústria
- **Pessoas:** 1100 pessoas
- **Desafio:** Crescimento pós-aquisição gerou sobrecarga de coordenadores e percepção desigual de cultura entre unidades.
- **Intervenção:** Escuta organizacional, redesenho de papéis gerenciais e implantação de rituais de comunicação para operação distribuída.
- **Resultado:** A nova estrutura reduziu retrabalho entre áreas e aproximou a experiência dos times em diferentes unidades em 6 meses.
- **Métricas:**
  - Retrabalho entre áreas: 34% → 19% (direction: down)
  - Aderência aos rituais: 38% → 82% (direction: up)
  - Índice de confiança: 51% → 76% (direction: up)

---

### Nota de rodapé

```
DADOS ILUSTRATIVOS
```
DM Mono, 10px, uppercase, rgba(255,255,255,0.35)

---

### Mobile

- Seletor vira lista horizontal scrollável (pills) ou dropdown
- Painel aparece abaixo
- Métricas empilhadas (1 coluna)
- AnimatePresence mantido na troca

---

## ANIMAÇÕES

- Reveal geral da seção
- AnimatePresence mode="wait" na troca de case
- MetricTicker: anima de 0 ao valor final ao entrar em viewport
- Barra comparativa: width anima de 0% ao valor proporcional
- Stagger nas 3 métricas: 100ms entre cada

---

## ACESSIBILIDADE

- Seletor com role="tablist" e role="tab"
- Painel com role="tabpanel"
- Métricas com aria-label incluindo valores
- MetricTicker com aria-label do valor final
- Focus-visible nos botões do seletor

---

## CRITÉRIOS DE ACEITE

- [ ] Fundo escuro com glow verde sutil
- [ ] Headline com "reais" em serif itálica verde
- [ ] 3 cases selecionáveis (tabs/seletor)
- [ ] Painel mostra: desafio, intervenção, resultado, 3 métricas
- [ ] Métricas com valor anterior/final, delta pill, barra comparativa
- [ ] MetricTicker animando ao viewport
- [ ] AnimatePresence na troca de case
- [ ] Nota "DADOS ILUSTRATIVOS" no rodapé
- [ ] Mobile: seletor horizontal + métricas empilhadas
- [ ] Copy em Português

---

**FIM DO PROMPT #5**
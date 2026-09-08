# PROMPT v2: HUMANTECH — Data-Driven Premium

## 1. POSICIONAMENTO

**Promessa central:**
"People decisions backed by data, not intuition."

**Público-alvo:**
- CHROs que precisam justificar RH em linguagem de CFO
- CROs e Heads of People em empresas tech/scale-up
- Empresas que querem que RH pare de ser "soft" e vire "finance-returning"

**Tom de copy:**
- Técnico e direto
- Confiança alta
- Data-first
- Sob medida, sem floreio

**Aesthetic moves:**
- Bento grid denso com scanlines
- Dashboard mockup em hero
- ROI calculator como CTA
- Cards com spotlight border em hover

---

## 2. DESIGN SYSTEM

### Cores (HSL/oklch)

```
--bg: #050507
--bg-elevated: #0E0F12
--bg-muted: #11131A
--text-primary: #FAFAFA
--text-secondary: #A0A0AB
--text-muted: #6B7280
--border: rgba(255,255,255,0.06)
--border-strong: rgba(255,255,255,0.10)
--brand: #5B8DEF
--accent: #A78BFA
--success: #22D3EE
--warning: #F59E0B
--danger: #EF4444
--chart-1: #5B8DEF
--chart-2: #A78BFA
--chart-3: #22D3EE
--chart-4: #F472B6
```

### Tipografia

- **Display:** "Inter Tight", weight 600/700, tracking -0.04em
- **Body:** "Inter", weight 400/500
- **Mono:** "JetBrains Mono" para métricas
- **Math:** "Cormorant Garamond" italic para acentuar "data"

### Estrutura

- `bg-bg` no body
- `bg-bg-elevated` nos cards
- `border border-border` para bordas
- `gradient-soft` para backgrounds de heading

---

## 3. STACK TÉCNICA

- React 18 + Vite + TypeScript
- Tailwind CSS v4
- motion/react
- lucide-react
- recharts (para gráficos mock)
- react-countup

---

## 4. COMPONENTES PRINCIPAIS

### 4.1 HeroDashboardMockup

Mockup de dashboard em 3D suave, com:
- 4 stat cards no topo (engagement, turnover, time-to-hire, leadership index)
- Sparkline mini por card
- Heatmap de pulse de atividade
- Trend chart em baixo
- Floating badges com spotlight

### 4.2 DataBentoGrid

Bento de 6-8 cards com:
- Card hero: grande, com gráfico animado
- Cards métricos: AnimatedCounter
- Card comparativo: antes/depois
- Card de quote de cliente com KPI

### 4.3 ScanlinesBackground

Background com linhas de scan animadas sutis:
```css
background: repeating-linear-gradient(
  to bottom,
  transparent 0,
  transparent 80px,
  rgba(91, 141, 239, 0.015) 80px,
  rgba(91, 141, 239, 0.015) 81px
);
```

### 4.4 TickerMetrics

Marquee horizontal lento com KPIs pulsando:
- "320+ empresas"
- "14 anos de dados"
- "R$ 2.8B analisado"
- "94% forecast accuracy"

### 4.5 ComparisonSlider

Componente before/after para comparar HRIS legacy vs HUMANTECH platform.

### 4.6 ROICalculator

Calculadora interativa:
- Input: número de headcount
- Input: turnover atual %
- Input: custo médio per hire
- Output: economia estimada, ROI 12 meses, payback period

### 4.7 SPOTLIGHT CARD

Card com borda react ao mouse:
```tsx
<SpotlightBorder className="rounded-3xl" size={420}>
  <div className="bg-bg-elevated border border-border rounded-3xl p-8">
    ...
  </div>
</SpotlightBorder>
```

---

## 5. SEÇÕES DETALHADAS

### 5.1 Navbar

```
[HUMANTECH] [Platform] [Method] [Pricing] [Customers] [Login] [Book Demo →]
```

- Logo + wordmark
- Links minimalistas
- CTA primary
- Mobile drawer com stagger

### 5.2 HERO

**Eyebrow:**
"PEOPLE ANALYTICS THAT PAYS"

**Headline:**
"HR in real numbers. Real outcomes."

**Sub:**
"The people platform that turns HR data into business outcomes. We help CHROs speak CFO. We help teams stay. We help companies scale without collapse."

**CTAs:**
- "Book ROI Diagnostic" (primary)
- "See the Dashboard" (secondary ghost)

**Visual direito:**
- HeroDashboardMockup com números animando
- Floating badges: "Live", "Forecast", "Anomaly Resolved"
- Glow radial azul no fundo

**Trust row:**
- 320+ empresas
- 94% forecast accuracy
- R$ 2.8B folha analisada
- 6 anos médio de parceria

### 5.3 TICKER METRICS

Marquee horizontal infinito com KPIs.

### 5.4 PROBLEM (3 Dor Cards)

**1. Decisões em Cegueira**
"Most HR decisions still rely on gut feel. We turn intuition into forecast."

**2. Retenção Reativa**
"You find out people leave when they leave. We see it 90 days earlier."

**3. RH Fora da Mesa de Decisão**
"HR is invited to operations after the fact. We get you in the room."

### 5.5 METHODOLOGY (4 Steps em bento)

01 — **Diagnostic**
2-week deep scan of culture, retention, leadership, productivity.

02 — **Forecast**
ML models predict who might leave, where bottlenecks are, what to do.

03 — **Build**
Custom dashboards, KPI trees, OKR cascades, alerts.

04 — **Manage**
Quarterly business reviews with CHROs and CFOs.

### 5.6 DATA BENTO GRID

Bento de 8 cards com dados:
- Engagement trend (line chart)
- Cohort retention (heatmap)
- Leadership readiness (radar)
- Attrition risk (gauge)
- Time-to-productivity (bar)
- DEI representation (bar)
- Compensation equity (box plot)
- Top reasons leaving (treemap)

### 5.7 CASES (3 Cards)

**Case 1: TechCorp**
- Antes: turnover 35%, no forecast
- Depois: turnover 8%, forecast model 92% accuracy
- ROI: 4.2x

**Case 2: RetailCo**
- Antes: time-to-hire 65 days
- Depois: 23 days
- ROI: 3.8x

**Case 3: FinanceGroup**
- Antes: RH fora do board
- Depois: CHRO na mesa, dashboards na reunião
- ROI: 6.1x

### 5.8 ROI CALCULATOR

Calculadora interativa como no item 4.6.

### 5.9 PLATFORM (screenshots/visuals)

Screenshots mockup do produto:
- Dashboard de attrition
- Heatmap de cultura
- Forecast model
- Compensation analytics

### 5.10 PRICING

| | Diagnostic | Pilot | Enterprise |
|--|-----------|-------|------------|
| Duração | 14 dias | 4 meses | 12+ meses |
| Entregas | Report + KPIs | Working dashboards | Platform license |
| Preço | R$ 18K | R$ 65K | Custom |

### 5.11 TESTIMONIALS

Quotes de CHROs:
- "Antes achava que analytics era planilha. HUMANTECH transformou meu papel."
- "Reduzimos turnover em 60% em 6 meses."
- "Conselho me valoriza. Antes era invisível."

### 5.12 FAQ

1. Quanto tempo até ver primeiro insight?
2. Como conectamos ao HRIS?
3. Qual modelo de forecast?
4. Posso integrar com Workday/Gupy?
5. Vocês vendem plataforma?

### 5.13 RESOURCES

Whitepapers, case studies, dashboards templates.

### 5.14 CTA FINAL

"Book your ROI diagnostic. Free."
Form: nome, email, company, team size.

### 5.15 FOOTER

4 colunas + social + copyright.

---

## 6. MOTION SYSTEM

| Elemento | Animação |
|----------|----------|
| Hero headline | Blur reveal por palavra |
| Dashboard numbers | AnimatedCounter 1.8s |
| Bar charts | Width 0→100% on view |
| Line charts | Stroke draw on view |
| Heatmap cells | Opacity stagger |
| Cards | Hover lift + spotlight |
| Ticker | Linear scroll 40s |
| Buttons | Glow on hover |

---

## 7. IMAGENS PEXELS

- "data analytics dashboard"
- "business charts meeting"
- "corporate analytics"
- "AI brain"
- "data visualization"

---

## 8. CHECKLIST DE QUALIDADE

- [ ] Hero tem mockup de dashboard
- [ ] Bento de dados tem 8+ cards
- [ ] Cada métrica tem AnimatedCounter
- [ ] ROI calculator funciona
- [ ] Pelo menos 1 gráfico sparkline
- [ ] Cards com SpotlightBorder
- [ ] Ticker de KPIs visível
- [ ] Background com scanlines sutis
- [ ] Tipografia com mono para metrics
- [ ] Acessibilidade respeitada

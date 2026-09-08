# PROMPT #6: Seção 06 — Formatos de Parceria

---

## CONTEXTO

Você está criando a landing page da **NEXUS People Strategy**. Agora vem a seção de **Formatos de Parceria** — 3 maneiras de trabalhar com a NEXUS.

Esta seção responde "quanto custa?" sem mostrar preço fixo. Mostra formatos proporcionais ao problema, não pacotes genéricos.

---

## DIREÇÃO VISUAL

- **Fundo:** var(--paper) / #fafaf8 (claro)
- **Cards:** rounded-[28px] border border-black/10 bg-[var(--paper-strong)] p-7
- **Hover:** translate-y -1px com sombra sutil
- **Accent:** var(--signal-pale) para badge do card central
- **Labels:** DM Mono, 11px, uppercase

---

## LAYOUT

### Cabeçalho (centralizado)

**Section Label:**
```
06 / FORMAS DE PARCERIA
```

**Headline:**
```
O formato muda. A proximidade não.
```
Manrope 600, clamp(2rem, 4vw, 3rem), text-center

**Subtexto:**
```
Começamos pelo momento da empresa, pela urgência da decisão e pela capacidade real de implementação.
```
Manrope 400, 18px, var(--ink-soft), text-center, max-width 680px, mx-auto

---

### Grid de Cards (3 colunas no desktop)

```
mt-14 grid grid-cols-1 gap-4 md:grid-cols-3
```

Cada card:
```
flex min-h-[440px] flex-col rounded-[28px] border border-black/10 bg-[var(--paper-strong)] p-7 transition-transform duration-300 hover:-translate-y-1
```

---

#### Card 1: Diagnóstico Express

**Badge:** `SPRINT` (DM Mono, 10px, uppercase, var(--ink-muted))
**Número:** `01`
**Título:** `Diagnóstico Express`
**Duração:** `3 semanas`
**Descrição:**
```
Para organizações que precisam enxergar o problema antes de escolher uma solução. Mapeamento executivo do cenário.
```
**Entregas:**
- Diagnóstico objetivo
- Mapa de tensões críticas
- Prioridades por impacto
- Reunião executiva de decisão

**CTA:** `Conversar sobre este formato →`

---

#### Card 2: Projeto Estruturado (destaque)

**Badge especial (topo do card):**
```
rounded-t-[28px] bg-[var(--signal-pale)] px-4 py-2 text-center
Texto: "Mais indicado para transformação complexa"
DM Mono, 10px, uppercase, var(--signal-deep)
```

**Badge:** `PROGRAMA` (DM Mono, 10px, uppercase, var(--ink-muted))
**Número:** `02`
**Título:** `Projeto Estruturado`
**Duração:** `12 a 24 semanas`
**Descrição:**
```
Para empresas que precisam redesenhar liderança, cultura ou performance com acompanhamento de implantação real.
```
**Entregas:**
- Diagnóstico e estratégia
- Rituais e ferramentas desenhadas
- Desenvolvimento de líderes
- Indicadores de adoção

**CTA:** `Conversar sobre este formato →`

---

#### Card 3: Advisory Mensal

**Badge:** `PARCERIA` (DM Mono, 10px, uppercase, var(--ink-muted))
**Número:** `03`
**Título:** `Advisory Mensal`
**Duração:** `Ciclo contínuo`
**Descrição:**
```
Para times executivos que querem uma consultoria próxima para decisões críticas de pessoas e organização.
```
**Entregas:**
- Conselho estratégico mensal
- Suporte a mudanças críticas
- Leitura recorrente de indicadores
- Ajustes de rota contínuos

**CTA:** `Conversar sobre este formato →`

---

### Rodapé da seção

```
mt-8 text-center text-sm text-[var(--ink-muted)]
```
Texto:
```
Escopo e investimento definidos conforme contexto, urgência e profundidade.
```

**Não exibir preço fixo.**

---

### Layout de cada card (interno)

```jsx
<div className="flex min-h-[440px] flex-col rounded-[28px] border border-black/10 bg-[var(--paper-strong)] p-7">
  {/* Topo */}
  <div className="flex items-center gap-3">
    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ink-muted)]">
      {badge}
    </span>
    <span className="font-mono text-[10px] text-[var(--ink-muted)]">{number}</span>
  </div>

  {/* Título + Duração */}
  <h3 className="mt-4 text-2xl font-semibold tracking-tight">{title}</h3>
  <p className="mt-1 font-mono text-xs text-[var(--ink-muted)]">{duration}</p>

  {/* Descrição */}
  <p className="mt-4 text-sm leading-relaxed text-[var(--ink-soft)]">{description}</p>

  {/* Entregas */}
  <ul className="mt-6 space-y-2">
    {deliverables.map(d => (
      <li className="flex items-start gap-2 text-sm text-[var(--ink-soft)]">
        <Check size={14} className="mt-0.5 shrink-0 text-[var(--signal)]" />
        {d}
      </li>
    ))}
  </ul>

  {/* CTA no rodapé */}
  <div className="mt-auto flex items-center justify-between border-t border-black/10 pt-5">
    <span className="text-sm font-semibold">Conversar sobre este formato</span>
    <ArrowUpRight size={16} />
  </div>
</div>
```

---

### Mobile

- Cards empilhados (1 coluna)
- Altura natural (não forçar min-h)
- Badge especial do card 2 mantido
- Hover desativado em touch

---

## ANIMAÇÕES

- Reveal geral da seção (headline + subtexto)
- Cards com stagger 100ms
- Hover: translateY -1px + shadow-base (200ms)
- Ícones Check: estáticos (sem animação individual)

---

## CRITÉRIOS DE ACEITE

- [ ] Fundo claro (var(--paper))
- [ ] 3 cards de formato lado a lado (desktop) / empilhados (mobile)
- [ ] Card do meio com badge verde "Mais indicado para transformação complexa"
- [ ] Cada card: badge, número, título, duração, descrição, entregas, CTA
- [ ] Sem preço fixo — texto explicativo no rodapé
- [ ] Hover sutil (translate-y + shadow)
- [ ] Check icons nas entregas
- [ ] Mobile: altura natural, 1 coluna
- [ ] Copy em Português

---

**FIM DO PROMPT #6**
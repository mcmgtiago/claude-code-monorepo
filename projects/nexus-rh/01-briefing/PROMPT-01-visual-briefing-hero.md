# PROMPT #1: Briefing Visual + Hero (3 Opções de Estilo)

---

## CONTEXTO EXECUTIVO

Você é um diretor de design que trabalha para uma consultoria de estratégia de pessoas chamada **NEXUS People Strategy**. Seu trabalho é desenhar uma landing page que comunique rigor, clareza e humanidade.

A empresa atende CEOs, COOs e CHROs de empresas brasileiras em expansão (200-2000 pessoas). Eles já têm bom senso e recursos. O que falta é clareza nos rituais, papéis, critérios de decisão e mecanismos de gestão.

**Promessa da marca:** "Onde gente e crescimento se encontram."

---

## LEITURA DO BRIEFING (Design Read)

> Reading this as: Consultoria de estratégia de pessoas para executivos brasileiros em escala. Tom sóbrio, editorial, técnico. Sem jargão. Sem AI tells. Referências visuais: McKinsey Quarterly, NYT Magazine, Linear, Stripe. Paleta editorial dark/light, tipografia com serifas em pontos de destaque. Stack React 18 + Tailwind v4 + motion + Lucide. Viés: premium consumer + editorial + trust-first.

---

## DIREÇÃO VISUAL

### Paleta CSS

```css
:root {
  --paper: #fafaf8;
  --paper-strong: #ffffff;
  --paper-muted: #f0eeea;
  --ink: #1a1a1a;
  --ink-soft: #4a4a4a;
  --ink-muted: #7a7a7a;
  --signal: #2d6a4f;
  --signal-light: #40916c;
  --signal-pale: #d8f3dc;
  --signal-deep: #1b4332;
  --tension: #d4622c;
  --tension-pale: #f4d5c9;
  --line: rgba(26, 26, 26, 0.12);
  --line-dark: rgba(255, 255, 255, 0.12);
}
```

### Tipografia

```css
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

:root {
  --font-sans: "Manrope", -apple-system, BlinkMacSystemFont, sans-serif;
  --font-serif: "Instrument Serif", Georgia, serif;
  --font-mono: "DM Mono", monospace;
}
```

**Uso:**
- Corpo: Manrope 400/500, 16-18px, leading 1.6
- Headlines: Manrope 600-800, clamp scaling, tracking -0.02em
- Destaque em serifas: Instrument Serif italic, peso normal, apenas em palavras-chave
- Labels/índices: DM Mono 500, 11-12px, uppercase, tracking +0.1em

### Motion

```javascript
const ease = [0.22, 1, 0.36, 1];
// Reveal: opacity 0→1, y 40→0, blur 8px→0px, duration 0.8s
// Hover: 200ms, sem escala >1.02
```

---

## STACK

- React 18 + TypeScript + Vite
- Tailwind CSS v4 com @tailwindcss/vite
- motion/react para animações
- lucide-react para ícones
- Sem bibliotecas visuais prontas
- Sem dependência de imagens no hero (SVG + CSS + motion)

---

## SEÇÃO HERO — VERSÃO 1: EDITORIAL MINIMALISTA (fundo claro)

**Fundo:** var(--paper) com grid sutil 42x42px (4% opacidade)

**Layout:** Grid 12-col, max-width 1440px, padding 120px top

**Esquerda (col 1-6):**
- Eyebrow: `01 / ESTRATÉGIA DE PESSOAS` (DM Mono, 11px, uppercase, var(--ink-muted))
- Headline: `Quando crescer exige mais do que contratar.`
  - Manrope 700, clamp(2.8rem, 6vw, 4.8rem), leading 1.1, tracking -0.03em
  - Palavra "mais" em Instrument Serif italic var(--signal)
- Subheadline: `A NEXUS desenha sistemas de liderança, cultura e performance para organizações que precisam crescer com clareza, não com improviso.`
  - Manrope 400, 18px, leading 1.6, var(--ink-soft), max-width 600px
- CTA Primário: `Mapear meu cenário` (botão verde var(--signal), texto branco, ArrowUpRight)
- CTA Secundário: `Ver como atuamos` (outline, borda var(--signal))
- Microcopy: `Diagnóstico inicial de 30 minutos. Sem proposta automática.` (12px, var(--ink-muted))

**Direita (col 7-12):**
- SignalMap SVG (620x620 viewBox)
  - Círculos concêntricos de grade, linhas finas
  - 5 nodos: Estratégia, Liderança, Operação, Cultura, Talentos
  - Linhas conectando com stroke-dasharray animado
  - Painel flutuante inferior: "ALINHAMENTO ATUAL: 72/100"
  - Painel flutuante superior: "5 sinais mapeados"

**Animações:**
- WordReveal na headline (stagger 60ms por palavra)
- SignalMap: nodos entram com stagger 80ms
- CTAs: fade-in após headline (delay 600ms)

---

## SEÇÃO HERO — VERSÃO 2: EDITORIAL ASSIMÉTRICO (diagonal accent)

**Diferenças em relação à Versão 1:**
- Fundo: diagonal accent em var(--signal-pale) de canto inferior esquerdo a superior direito
- Layout: headline ocupa 70% da largura, SignalMap compacto à direita abaixo
- SignalMap tem fundo semi-transparente em var(--paper-strong) com border-radius 32px e shadow sutil
- Nodos entram com stagger leve (cada um delay +50ms)
- Navbar: logo com accent de cor var(--signal) em parte do texto
- Grid de fundo com linhas diagonais em vez de ortogonais (30° inclinação, 5% opacidade)

**Copy:** Mesma da Versão 1, mas headline pode quebrar em 2 linhas assimétricas:
```
Quando crescer
exige mais do que contratar.
```

---

## SEÇÃO HERO — VERSÃO 3: DARK HERO (Stripe/Linear inspired)

**Diferenças em relação à Versão 1:**
- Fundo: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)
- Todo texto em branco/cinza claro
- Grid de fundo: linhas brancas 4% opacidade, 48x48px
- Accent: apenas em pontos estratégicos (palavra "mais" em var(--signal-light), botão primary verde)
- SignalMap: fundo escuro, nodos verdes, linhas brancas 20% opacidade
- Navbar: fundo transparent, texto branco, CTA botão mais vibrante (var(--signal-light))
- Linhas do SignalMap pulsam levemente (opacity 0.5→1→0.5, duration 3s)
- Glow verde discreto no canto inferior direito (radial-gradient)

**Copy:** Mesma, mas com cores invertidas:
- Headline: branco, peso 700
- Subheadline: rgba(255,255,255,0.65)
- Eyebrow: rgba(255,255,255,0.45)
- Microcopy: rgba(255,255,255,0.35)

---

## CRITÉRIO DE ESCOLHA

| Versão | Vibe | Para quem |
|--------|------|----------|
| 1 — Editorial Minimalista | Limpo, confiável, atemporal | Quem quer seriedade sem drama |
| 2 — Assimétrico | Dinâmico, memorável, diferenciado | Quem quer destaque visual com elegância |
| 3 — Dark Hero | Ousado, tech, premium | Quem quer impacto imediato e modernidade |

**Escolha 1 das 3.** Após a escolha, a paleta e motion rules são travadas para as próximas seções.

---

## INSTRUÇÕES AO AGENTE

1. Descreva as 3 versões com clareza (cite cores, layout, motion)
2. Pergunte: "Qual das 3 versões prefere para o hero?"
3. Após escolha, gere o código React/TSX completo da versão escolhida
4. Confirme paleta e motion rules para seções futuras
5. Salve o código gerado e informe que o próximo passo é o PROMPT #2 (Seção 02: Tensões)

---

## PRÓXIMAS SEÇÕES

| # | Seção | Prompt |
|---|-------|--------|
| 2 | O Custo do Desalinhamento | PROMPT-02-secao-tensoes.md |
| 3 | Frentes de Atuação | (a criar) |
| 4 | Método NEXUS | (a criar) |
| 5 | Resultados (Cases) | (a criar) |
| 6 | Formatos de Parceria | (a criar) |
| 7 | Depoimentos | (a criar) |
| 8 | FAQ | (a criar) |
| 9 | CTA Final + Footer | (a criar) |

---

**FIM DO PROMPT #1**
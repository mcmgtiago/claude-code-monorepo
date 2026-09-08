# PROMPT #7: Seção 07 — Depoimentos

---

## CONTEXTO

Você está criando a landing page da **NEXUS People Strategy**. Agora vem a seção de **Depoimentos** — prova social emocional com citações de clientes.

Diferente dos cases (dados), aqui é sobre **percepção e confiança**. As citações são curtas, impactantes e pessoais.

---

## DIREÇÃO VISUAL

- **Fundo:** var(--paper-muted) / #f0eeea (cinza claro, contraste sutil)
- **Card do depoimento:** bg-[var(--ink)] / dark, texto branco
- **Tipografia da citação:** Instrument Serif italic, tamanho grande
- **Controles:** botões circulares com ChevronLeft/ChevronRight

---

## LAYOUT

### Desktop (12-col grid)

```
Col 1-4: Texto introdutório
Col 5-12: Card do depoimento ativo + controles
```

#### Coluna Esquerda (Col 1-4)

**Section Label:**
```
07 / QUEM VIVEU O PROCESSO
```

**Headline:**
```
Consultoria boa não cria dependência.
Cria autonomia.
```
Manrope 600, clamp(1.8rem, 3vw, 2.6rem), leading 1.1
Destaque: "autonomia" em Instrument Serif italic var(--signal)

---

#### Coluna Direita (Col 5-12) — Carousel Manual

**Card do depoimento ativo:**
```
relative min-h-[410px] rounded-[30px] bg-[var(--ink)] p-7 text-white md:p-10
```

**Aspas decorativas (canto superior direito):**
```
absolute right-8 top-6 font-serif text-[10rem] leading-none text-white/10 select-none
Conteúdo: ""
```

**Citação:**
```
max-w-[20ch] font-serif text-[clamp(2.2rem,4vw,4.6rem)] italic leading-[0.96] tracking-[-0.04em] text-white
```

**Autor (rodapé do card):**
```
mt-auto pt-8 border-t border-white/10
```
- Nome: Manrope 600, 16px, white
- Cargo + Empresa: DM Mono, 12px, rgba(255,255,255,0.5)

---

### 3 Depoimentos

#### Depoimento 01
- **Citação:** "A NEXUS não trouxe um playbook pronto. Trouxe perguntas melhores, um método muito claro e a disciplina que faltava para transformar intenção em operação."
- **Nome:** Marina Salles
- **Cargo:** Chief People Officer
- **Empresa:** Skala

#### Depoimento 02
- **Citação:** "Pela primeira vez, nossas lideranças passaram a falar sobre performance, cultura e prioridade sem tratar cada tema como um projeto separado."
- **Nome:** Diego Mattos
- **Cargo:** Diretor de Operações
- **Empresa:** Onda

#### Depoimento 03
- **Citação:** "O trabalho foi profundo sem ser burocrático. Em poucas semanas, tínhamos um mapa que a diretoria conseguia usar para decidir."
- **Nome:** Renata Mello
- **Cargo:** CEO
- **Empresa:** Vereda

---

### Controles de Navegação

**Posição:** Abaixo do card, flex row com gap-4

**Botões:**
```
flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)]
transition-colors hover:bg-[var(--ink)] hover:text-white hover:border-[var(--ink)]
```
- ChevronLeft (Lucide, 18px)
- ChevronRight (Lucide, 18px)

**Indicador de progresso:**
```
01 / 03
```
DM Mono, 12px, var(--ink-muted)

**Barra de progresso:**
- 3 segmentos horizontais (cada ~30px largura)
- Segmento ativo: bg var(--signal), height 3px
- Segmento inativo: bg var(--line), height 3px
- Border-radius full em cada segmento

---

### Interação

- Setas do teclado (ArrowLeft/ArrowRight) quando o selector estiver focado
- **Sem autoplay** (respeitar o usuário)
- AnimatePresence na troca:
```jsx
<AnimatePresence mode="wait">
  <motion.div
    key={activeIndex}
    initial={{ opacity: 0, x: 30 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -30 }}
    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
  />
</AnimatePresence>
```

---

### Mobile

- Coluna esquerda e direita viram 1 coluna
- Card do depoimento: full-width, min-h reduzido
- Citação: font-size menor (clamp(1.6rem, 5vw, 2.4rem))
- Controles: centralizados abaixo do card
- Swipe horizontal opcional (mas não obrigatório)

---

## ANIMAÇÕES

- Reveal da seção (headline + card)
- AnimatePresence na troca de depoimento (slide horizontal)
- Aspas decorativas: fade-in lento (1.2s)

---

## ACESSIBILIDADE

- role="group" + aria-roledescription="carousel" no container
- aria-label="Depoimento X de 3" no card
- Botões com aria-label "Depoimento anterior" / "Próximo depoimento"
- Suporte a teclado (ArrowLeft/Right)
- Focus-visible nos botões
- Citação em blockquote semântico

---

## CRITÉRIOS DE ACEITE

- [ ] Fundo var(--paper-muted) para a seção
- [ ] Card escuro com citação em serif itálica grande
- [ ] Aspas decorativas no canto (text-white/10)
- [ ] 3 depoimentos navegáveis manualmente
- [ ] Sem autoplay
- [ ] Controles: botões circulares + indicador "01/03" + barra de progresso
- [ ] AnimatePresence na troca
- [ ] Teclado: ArrowLeft/Right funciona
- [ ] Mobile: layout adaptado, citação menor
- [ ] Copy em Português

---

**FIM DO PROMPT #7**
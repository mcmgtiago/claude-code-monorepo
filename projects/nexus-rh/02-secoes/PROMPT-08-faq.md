# PROMPT #8: Seção 08 — FAQ

---

## CONTEXTO

Você está criando a landing page da **NEXUS People Strategy**. Agora vem o **FAQ** — perguntas diretas que eliminam objeções e dúvidas antes do contato.

Esta seção é funcional e direta. Sem enrolação, sem design exagerado. Apenas clareza.

---

## DIREÇÃO VISUAL

- **Fundo:** var(--paper) / #fafaf8
- **Container:** centralizado, max-width 1000px
- **Accordion:** border-top em cada item, chevron em círculo
- **Tipografia:** Manrope para perguntas, var(--ink-soft) para respostas

---

## LAYOUT

### Cabeçalho (centralizado)

**Section Label:**
```
09 / PERGUNTAS DIRETAS
```
(Nota: numeração como 09 na página final, mas é o prompt 08 do fluxo)

**Headline:**
```
Antes de conversar, vale saber.
```
Manrope 600, clamp(2rem, 4vw, 3rem), text-center

---

### Accordion

**Container:**
```
mx-auto max-w-[1000px] px-6 md:px-10
```

**Regra:** Apenas um item aberto por vez. Ao abrir outro, o anterior fecha.

---

### Componente AccordionItem

**Item:**
```
border-t border-black/15 py-6
```

**Botão:**
```
flex w-full items-center justify-between gap-6 text-left
focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4
```

**Pergunta:**
```
text-xl font-medium tracking-tight md:text-2xl
```

**Chevron em círculo:**
```
flex h-10 w-10 items-center justify-center rounded-full border border-black/15
transition-transform duration-300
```
- Aberto: rotaciona 180°
- Fechado: rotação 0°

**Corpo (resposta):**
```
max-w-[760px] pt-4 pr-12 text-base leading-relaxed text-[var(--ink-soft)]
```

**Animação:**
```jsx
<AnimatePresence initial={false}>
  {isOpen && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden"
    >
      <p>{answer}</p>
    </motion.div>
  )}
</AnimatePresence>
```

---

### 6 Perguntas e Respostas

#### 1.
**P:** Vocês trabalham apenas com grandes empresas?
**R:** Não. A NEXUS atua principalmente com empresas entre 200 e 2.000 pessoas, adaptando profundidade, cadência e entregáveis ao estágio de maturidade de cada organização.

#### 2.
**P:** Quanto tempo leva para aparecer um primeiro resultado?
**R:** Em sprints de diagnóstico, clareza e prioridades aparecem nas primeiras semanas. Em projetos estruturados, os primeiros ciclos de adoção costumam ser acompanhados dentro de 90 a 180 dias.

#### 3.
**P:** A NEXUS entrega apenas diagnóstico?
**R:** Não. Diagnóstico é ponto de partida. Podemos seguir com desenho de estratégia, implantação, desenvolvimento de liderança e acompanhamento de indicadores.

#### 4.
**P:** Vocês substituem o time interno de RH?
**R:** Não. Trabalhamos para ampliar a capacidade de decisão e execução do time interno, das lideranças e da diretoria — não para substituí-los.

#### 5.
**P:** Como funciona a primeira conversa?
**R:** Começamos entendendo momento, desafio, urgência e contexto da empresa. Se houver aderência, propomos um próximo passo proporcional ao problema, não uma proposta automática.

#### 6.
**P:** É possível contratar uma frente específica?
**R:** Sim. A atuação pode começar por People OS, Liderança em Escala ou Cultura por Desenho — conforme o que é mais urgente para o momento da empresa.

---

### Mobile

- Layout idêntico (já é 1 coluna)
- Perguntas podem ter font-size ligeiramente menor (text-lg)
- Chevron mantém comportamento
- Padding lateral reduzido

---

## ACESSIBILIDADE

- Cada botão com aria-expanded (true/false)
- aria-controls apontando para o id do conteúdo
- Conteúdo com role="region" e aria-labelledby
- Focus-visible nos botões
- Keyboard: Enter/Space para toggle

---

## CRITÉRIOS DE ACEITE

- [ ] Fundo claro (var(--paper))
- [ ] Headline centralizado
- [ ] 6 perguntas em accordion
- [ ] Apenas 1 aberto por vez
- [ ] Chevron rotaciona ao abrir/fechar
- [ ] AnimatePresence com height + opacity
- [ ] Respostas em var(--ink-soft), max-width 760px
- [ ] aria-expanded, aria-controls corretos
- [ ] Mobile: layout igual, font-size adaptado
- [ ] Copy em Português

---

**FIM DO PROMPT #8**
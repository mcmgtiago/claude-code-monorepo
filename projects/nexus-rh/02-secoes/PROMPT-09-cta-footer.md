# PROMPT #9: Seção 09 — CTA Final + Formulário + Footer

---

## CONTEXTO

Você está criando a landing page da **NEXUS People Strategy**. Esta é a **última seção** — onde o visitante converte. Inclui:

1. **Seção CTA Final** com formulário de contato
2. **Footer** com links, newsletter e dados

Esta seção precisa ser direta, acolhedora e funcional. O visitante já viu tudo — agora precisa de um caminho claro para agir.

---

## PARTE 1: CTA FINAL + FORMULÁRIO

### Direção Visual

- **Fundo:** var(--ink) / #1a1a1a (escuro)
- **Grid de fundo:** dark-grid (linhas brancas 4% opacidade)
- **Noise:** camada sutil (12% opacidade)
- **Glow:** radial-gradient verde no centro (sutil)
- **Formulário:** card com rounded-[30px] border border-white/15 bg-white/[0.045] backdrop-blur-sm

---

### Layout Desktop (12-col grid)

```
Col 1-6: Texto + Dados de contato
Col 7-12: Formulário
```

#### Coluna Esquerda (Col 1-6)

**Section Label:**
```
10 / COMEÇAR COM CLAREZA
```
DM Mono, 11px, uppercase, rgba(255,255,255,0.45)

**Headline:**
```
A próxima decisão sobre pessoas
pode ser menos nebulosa.
```
Manrope 600, clamp(2rem, 4vw, 3rem), text-white
Destaque: "menos nebulosa" em Instrument Serif italic var(--signal-light)

**Subtexto:**
```
Conte o que está mudando na sua organização. Em até dois dias úteis, alguém da NEXUS responde com um ponto de partida honesto.
```
Manrope 400, 16px, rgba(255,255,255,0.55), max-width 520px

**Dados de contato:**
```
mt-10 space-y-3 text-sm
```
- 📧 contato@nexus.people (rgba(255,255,255,0.7))
- 📍 São Paulo, Brasil — atuação remota (rgba(255,255,255,0.5))

---

#### Coluna Direita (Col 7-12) — Formulário

**Card:**
```
rounded-[30px] border border-white/15 bg-white/[0.045] p-6 backdrop-blur-sm md:p-8
```

---

### Formulário (React Hook Form + Zod)

**Schema de validação:**
```typescript
import { z } from "zod";

const leadSchema = z.object({
  name: z.string().min(2, "Informe seu nome."),
  email: z.string().email("Informe um e-mail corporativo válido."),
  company: z.string().min(2, "Informe sua empresa."),
  headcount: z.string().min(1, "Selecione o tamanho da empresa."),
  challenge: z.string().min(20, "Conte um pouco mais sobre o desafio."),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Você precisa concordar para enviar." })
  })
});
```

**Campos:**

| Label | Campo | Tipo |
|-------|-------|------|
| Nome | name | Text input |
| E-mail corporativo | email | Email input |
| Empresa | company | Text input |
| Tamanho do time | headcount | Select |
| O que está mudando agora? | challenge | Textarea |
| Consentimento | consent | Checkbox |

**Opções do select (headcount):**
- Até 80 pessoas
- 81 a 250 pessoas
- 251 a 700 pessoas
- 701 a 1.500 pessoas
- Mais de 1.500 pessoas

**Estilos dos inputs:**
```
w-full border-b border-white/20 bg-transparent px-0 py-3 text-sm text-white
outline-none placeholder:text-white/30 focus:border-[var(--signal-light)]
transition-colors duration-200
```

**Textarea:**
```
min-h-28 resize-y (mesmas classes dos inputs)
```

**Erros:**
```
mt-1 text-xs text-[#f58b70]
```

**Checkbox:**
```
flex items-start gap-3
input: accent-[var(--signal-light)] w-4 h-4 mt-0.5
label: text-xs text-white/50 leading-relaxed
Texto: "Concordo que a NEXUS entre em contato para uma conversa inicial sobre o cenário descrito."
```

**Botão submit:**
```
mt-6 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full
bg-[var(--signal-light)] px-5 text-sm font-semibold text-[var(--ink)]
transition-colors hover:bg-white
```
Texto: `Enviar contexto`
Ícone: ArrowUpRight (Lucide, 16px)

---

### Estado de Sucesso (após submit)

Após submit simulado (setTimeout 1500ms):
- Ocultar formulário com fade-out
- Mostrar:
  - Ícone: CheckCircle2 (Lucide, 48px, var(--signal-light))
  - Headline: "Recebemos seu contexto."
  - Texto: "Em breve, a NEXUS entra em contato para entender o melhor próximo passo."
  - Botão: "Voltar ao início" (scroll to top)

---

### Mobile

- Coluna esquerda e direita viram 1 coluna
- Formulário ocupa full-width
- Campos mantém 1 coluna
- Botão submit full-width

---

## PARTE 2: FOOTER

### Direção Visual

- **Fundo:** #0c0e0c (mais escuro que a seção CTA)
- **Texto:** white para títulos, rgba(255,255,255,0.55) para links
- **Hover links:** var(--signal-light)
- **Container:** max-width 1440px, padding 56px vertical

---

### Layout

**Topo (grid 4 colunas no desktop):**

```
grid grid-cols-1 gap-12 border-b border-white/10 pb-12 md:grid-cols-[1.3fr_0.7fr_0.7fr_0.7fr]
```

#### Coluna 1: Marca
- Logo NEXUS (DM Mono, 14px, uppercase, tracking wide, white)
- Texto: "Estratégia de pessoas para empresas em movimento."
  - Manrope 400, 14px, rgba(255,255,255,0.55), max-width 280px
- Links:
  - contato@nexus.people
  - LinkedIn

#### Coluna 2: Navegação
- **Título:** "Navegação" (DM Mono, 10px, uppercase, white)
- Links:
  - Abordagem
  - Soluções
  - Método
  - Resultados

#### Coluna 3: Conteúdo
- **Título:** "Conteúdo" (DM Mono, 10px, uppercase, white)
- Links:
  - Insights
  - Cases
  - FAQ
  - Contato

#### Coluna 4: Legal
- **Título:** "Legal" (DM Mono, 10px, uppercase, white)
- Links:
  - Privacidade
  - Termos
  - Cookies

**Estilo dos links:**
```
text-sm text-white/55 transition-colors hover:text-[var(--signal-light)]
```

---

### Rodapé (abaixo da borda)

```
flex flex-col gap-4 pt-6 text-xs text-white/35 md:flex-row md:items-center md:justify-between
```

**Esquerda:**
```
© 2026 NEXUS People Strategy. Todos os direitos reservados.
```

**Direita:**
```
Feito para organizações que querem crescer sem perder coerência.
```

---

### Mobile

- Footer: 2 colunas (2 de links por row) ou 1 coluna
- Marca fica em cima, links embaixo
- Rodapé centralizado

---

## PARTE 3: NAVBAR (incluída neste prompt)

Como é a última seção, incluir aqui a **Navbar** que funciona em toda a página.

### Estado no topo (scroll = 0)
- Fundo: transparent
- Texto: branco (se hero for dark) ou var(--ink) (se hero for claro)
- Logo: NEXUS em DM Mono, 14px, uppercase
- CTA: bg var(--signal), texto branco

### Estado após scroll > 60px
- Fundo: rgba(250, 250, 248, 0.88) + backdrop-blur(16px)
- Border: 1px solid rgba(26, 26, 26, 0.1)
- Border-radius: 9999px
- Topo: 16px
- Max-width: min(100% - 32px, 1440px)
- Logo e texto: var(--ink)
- CTA: bg var(--ink), texto branco

### Estrutura Desktop
| Área | Conteúdo |
|------|----------|
| Esquerda | Logo NEXUS + "People Strategy" |
| Centro | Abordagem, Soluções, Resultados, Insights |
| Direita | Link "Contato" + CTA "Mapear meu cenário" |

### Mobile
- Ocultar nav central
- Botão hamburger (Menu icon)
- Drawer fullscreen escuro ao abrir
- Links grandes com stagger 60ms
- CTA no rodapé do drawer
- Bloquear scroll do body enquanto aberto
- Fechar ao clicar em link

---

## ANIMAÇÕES

- Navbar: transição de 300ms entre estados (cores, fundo, border)
- Formulário campos: focus ring com var(--signal-light)
- Submit: loading state (spinner 1.5s) → success state (fade-in)
- Footer links: color transition 200ms
- Mobile drawer: links com stagger 60ms, fundo fade-in 200ms

---

## ACESSIBILIDADE

- Formulário: labels associados a inputs (htmlFor/id)
- Erros: aria-describedby nos campos com erro
- Submit button: aria-busy durante loading
- Footer: nav com aria-label "Navegação de rodapé"
- Navbar: nav com aria-label "Navegação principal"
- Mobile drawer: focus trap + aria-expanded no botão hamburger
- Escape fecha drawer e modal

---

## SEO (incluir no index.html ou Head)

**Title:**
```
NEXUS | Estratégia de Pessoas, Liderança e Cultura
```

**Meta description:**
```
A NEXUS ajuda empresas em expansão a transformar estratégia, liderança e cultura em sistemas de execução mais claros.
```

**Open Graph:**
```
NEXUS: organizações que crescem com clareza.
```

**JSON-LD:**
```json
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "NEXUS People Strategy",
  "description": "Consultoria de estratégia de pessoas, liderança, cultura e transformação organizacional.",
  "email": "contato@nexus.people",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "São Paulo",
    "addressCountry": "BR"
  }
}
```

---

## CRITÉRIOS DE ACEITE

- [ ] Seção CTA com fundo escuro + grid + glow
- [ ] Headline com "menos nebulosa" em serif itálica verde
- [ ] Formulário com 5 campos + checkbox + validação Zod
- [ ] Erros de validação inline (vermelho suave)
- [ ] Estado de sucesso após submit
- [ ] Footer com 4 colunas + links + rodapé
- [ ] Navbar fixa com transição ao scroll
- [ ] Mobile: drawer fullscreen com stagger
- [ ] SEO: title, meta, JSON-LD
- [ ] Acessibilidade: labels, aria, focus trap
- [ ] Copy em Português

---

**FIM DO PROMPT #9 — ÚLTIMO PROMPT DO PROJETO**

---

## RESUMO DO PROJETO COMPLETO (9 prompts)

| # | Seção | Status |
|---|-------|--------|
| 1 | Hero + Briefing Visual | ✅ Prompt pronto |
| 2 | O Custo do Desalinhamento | ✅ Prompt pronto |
| 3 | Frentes de Atuação | ✅ Prompt pronto |
| 4 | Método NEXUS | ✅ Prompt pronto |
| 5 | Resultados (Cases) | ✅ Prompt pronto |
| 6 | Formatos de Parceria | ✅ Prompt pronto |
| 7 | Depoimentos | ✅ Prompt pronto |
| 8 | FAQ | ✅ Prompt pronto |
| 9 | CTA Final + Footer + Navbar | ✅ Prompt pronto |

**Para montar a landing page completa:**
1. Execute cada prompt na ordem (1 → 9)
2. Após cada execução, salve o código gerado
3. No final, integre todas as seções em um único `App.tsx`
4. Teste responsividade e acessibilidade
5. Deploy!
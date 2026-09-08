---
name: content-creator
description: >
  Gera posts psicoeducativos para Instagram, LinkedIn, blog. 3 posts em 15 minutos.
  Respeita Código de Ética do CFP (sem promessas, sem diagnósticos, sem sensacionalismo).
  Use com /content-creator, "criar post", "conteúdo para Instagram", "post educativo",
  "ideias de conteúdo", "o que postar essa semana".
user-invocable: true
argument-hint: "[plataforma] [tema] ou vazio para sugestões"
---

# Content Creator — Conteúdo Psicoeducativo

## Objective

Criar conteúdo educativo para redes sociais que:
1. Posiciona o psicólogo como referência na sua área
2. Educa o público sem praticar terapia online
3. Atrai pacientes ideais (alinhado com ICP)
4. Respeita CFP Art. 20 (sem autopromoção sensacionalista)

**Meta**: 3 posts prontos em 15 minutos, sem parecer genérico ou antiético.

---

## When to Trigger

- `/content-creator` (sugestões automáticas)
- `/content-creator instagram ansiedade` (plataforma + tema específico)
- "Criar post para Instagram", "O que postar essa semana?"
- "Ideias de conteúdo sobre [tema]"
- "Post sobre [assunto] para LinkedIn"

---

## Input

### Se tem argumento:
Usar tema e plataforma fornecidos.

### Se vazio (recomendações):
1. Ler `context/my-clinic.md` → especialidades
2. Ler `context/my-icp.md` → queixas do paciente ideal
3. Ler `data/content-calendar.md` → o que já foi postado (evitar repetição)
4. Sugerir 5 temas + escolher formato

---

## Platforms & Formats

### Instagram

| Formato | Tipo | Ideal para |
|---------|------|------------|
| **Carrossel** (8-10 slides) | Educativo step-by-step | "5 sinais de que...", "Como lidar com..." |
| **Post único** (imagem + caption) | Reflexão, frase de impacto | Engagement, compartilhamento |
| **Reels script** (30-60s) | Video educativo | Alcance, novos seguidores |
| **Stories** (série de 5-7) | Behind-the-scenes, Q&A | Proximidade, humanização |

### LinkedIn

| Formato | Tipo | Ideal para |
|---------|------|------------|
| **Artigo longo** (800-1200 palavras) | Deep-dive em tema | Autoridade, SEO |
| **Post texto** (200-400 palavras) | Opinião, case anonimizado | Engagement |
| **Carrossel PDF** (5-8 slides) | Framework, lista | Saves, shares |

### Blog / Newsletter

| Formato | Tipo |
|---------|------|
| **Artigo SEO** (1500-2000 palavras) | Captação orgânica |
| **Email semanal** (500-800 palavras) | Nurturing de leads |

---

## Content Frameworks (Templates)

### Framework 1: "Mitos vs. Verdades"
```
🧠 Mito: [crença popular errada]
✅ Verdade: [explicação simples + base científica]
💡 Na prática: [como isso afeta o dia-a-dia]

[CTA suave: "Se identificou? Salva esse post pra lembrar."]
```

### Framework 2: "Sinais de que..."
```
📋 [X] sinais de que [condição/problema]:

1️⃣ [sinal + explicação breve]
2️⃣ [sinal + explicação breve]
3️⃣ [sinal + explicação breve]
...

⚠️ Importante: Esses sinais não são diagnóstico. 
Se você se identificou, buscar um profissional é o melhor caminho.
```

### Framework 3: "Exercício rápido"
```
🎯 Exercício de [benefício] em [tempo]:

Passo 1: [instrução simples]
Passo 2: [instrução simples]
Passo 3: [instrução simples]

💬 Funciona porque: [base teórica simplificada]
```

### Framework 4: "Reflexão" (caption curta)
```
[Frase provocativa ou insight]

[Desenvolvimento em 2-3 linhas]

[Pergunta aberta para engajamento]
```

### Framework 5: "Case Anonimizado" (storytelling)
```
Uma paciente (dados alterados) chegou com [queixa genérica].

O que muitos não sabem é que [insight clínico acessível].

Após [período/processo genérico], ela [resultado genérico positivo].

💡 O ponto aqui não é a técnica. É que [aprendizado universal].
```

### Framework 6: "Dica Prática para o Dia-a-dia"
```
Quando você sentir [gatilho comum], tente:

→ [ação concreta 1]
→ [ação concreta 2]
→ [ação concreta 3]

Não é mágica. É [base científica]. Mas precisa de prática.
```

---

## Process Steps

### Step 1: Define Scope

- Plataforma: Instagram / LinkedIn / Blog / All
- Tema: fornecido ou sugerido (5 opções)
- Formato: carrossel / post / reel / artigo
- Quantidade: default = 3 posts

### Step 2: Read Context

1. `context/my-voice.md` — tom, frases, anti-patterns
2. `context/my-icp.md` — queixa do paciente ideal (o que ressoa)
3. `context/my-clinic.md` — especialidade (não falar fora da área)
4. `data/content-calendar.md` — evitar repetições

### Step 3: Generate Content

Para CADA post:

1. Escolher framework (variar entre posts)
2. Gerar copy na voz do psicólogo
3. Aplicar compliance check:
   - ✅ Educativo, acessível, baseado em evidência
   - ✅ Inclui disclaimer quando necessário
   - ✅ Não promete resultados
   - ✅ Não faz diagnóstico
   - ✅ Não usa depoimento de pacientes
   - ✅ Não é sensacionalista
4. Sugerir hashtags relevantes (Instagram only)
5. Sugerir imagem/visual description (para Canva/designer)

### Step 4: Output & Save

```markdown
---
## Post 1 / 3

**Plataforma**: Instagram Carrossel
**Tema**: Ansiedade no trabalho
**Framework**: "Exercício rápido"

### Slide 1 (Capa):
[Texto da capa — frase de impacto]

### Slide 2-7:
[Conteúdo de cada slide]

### Slide 8 (CTA):
[Chamada para ação suave]

### Caption:
[Texto do caption com hashtags]

### Visual suggestion:
[Descrição de cores, estilo, elementos]

---
```

Salvar em `data/content-calendar.md` com data + status (draft/approved/published).

---

## Content Topic Generator (se vazio)

Combinar:
- Especialidade do psicólogo (TCC? Casal? Infantil?)
- Queixa do ICP (ansiedade? autoestima? relacionamentos?)
- Sazonalidade (Janeiro: propósitos. Setembro: amarelo. Outubro: burnout retorno férias)
- Trending (Google Trends, Instagram Explore)

Output: 5 sugestões com justificativa.

```
1. "5 sinais de burnout que parecem preguiça" — Carrossel
   Razão: tema em alta, alinhado com ICP adultos corporativos

2. "Por que terapia não é 'conselho'" — Post reflexivo
   Razão: mito comum, educa sobre o processo
   
3. ...
```

---

## Compliance Rules (Non-Negotiable)

### ✅ PODE

- Psicoeducação geral ("Ansiedade é uma resposta natural do corpo...")
- Dicas de autocuidado genérico ("Exercícios de respiração ajudam a...")
- Desmistificar terapia ("Terapia não é só para quem está mal...")
- Cases anonimizados E generalizados ("Uma pessoa que..." sem detalhes identificáveis)
- CTA suaves ("Se identificou? Conversar com um profissional pode ajudar")

### ❌ NUNCA

- "Cure sua ansiedade com esses 3 passos" (promessa de resultado)
- "Você tem depressão se..." (diagnóstico via post)
- "Minha paciente Maria disse..." (usar nome ou depoimento)
- "Eu sou a melhor terapeuta para..." (autopromoção sensacionalista)
- "Esse exercício substitui terapia" (deslegitima o processo)
- "Se não buscar ajuda AGORA, vai piorar" (alarmismo)

### ⚠️ SEMPRE INCLUIR (quando aplicável)

```
📌 Este conteúdo é educativo e não substitui acompanhamento profissional.
```

---

## Edge Cases

1. **Psicólogo não posta em redes**
   - Sugerir: "Posso criar posts para começar? 1x/semana é suficiente para construir presença"
   - Start small: 1 carrossel + 1 post reflexivo por semana

2. **Tema sensível (suicídio, abuso, etc.)**
   - Incluir recurso: CVV (188), SAMU, delegacia
   - Tom mais cuidadoso, menos "dica", mais "acolhimento"
   - Sem gatilhos desnecessários

3. **Psicólogo quer repost de outro profissional**
   - Orientar: "Você pode se inspirar, mas reescreva na sua voz"
   - Gerar versão original sobre o mesmo tema

4. **Conteúdo para múltiplas plataformas**
   - Criar "master post" e adaptar per platform
   - Instagram = visual + hashtags
   - LinkedIn = mais formal + sem hashtags excessivas
   - Blog = SEO-friendly + mais longo

5. **Psicólogo de nicho (infantil, casal, etc.)**
   - Adaptar linguagem para o público
   - Infantil → posts para PAIS (não para crianças)
   - Casal → posts sobre comunicação, intimidade, conflitos

---

## Scheduling Suggestion

Recomendação para psicólogos:

| Dia | Formato | Tipo |
|-----|---------|------|
| Monday | Carrossel | Educativo (técnica/dica) |
| Wednesday | Post reflexivo | Engajamento (pergunta aberta) |
| Friday | Reel ou Stories | Humanização (bastidores, dia-a-dia) |

Gerar batch semanal = 15 min para 3 posts.

---

## Dependencies

- `context/my-voice.md` — tom e linguagem
- `context/my-icp.md` — queixa e público
- `context/my-clinic.md` — especialidade
- `data/content-calendar.md` — histórico (evitar repetição)

---
name: case-formulation
description: >
  Gera formulação clínica de caso — a "teoria do caso" que explica POR QUÊ o
  problema se mantém. Adapta-se à abordagem do psicólogo (TCC 5 áreas, psicodinâmica,
  humanista, sistêmica, integrativa). Use com /case-formulation, "formulação de caso",
  "formular caso", "por que o paciente está assim", "hipótese clínica".
user-invocable: true
argument-hint: "[nome-paciente]"
---

# Case Formulation — Formulação Clínica

## Objective

Gerar a "teoria do caso" — a hipótese que conecta queixa, história, fatores de manutenção e direção de tratamento. Diferente do treatment-plan (que diz O QUE fazer), a formulação diz POR QUÊ o problema existe e se mantém.

**Antes**: Psicólogo tem hipótese "na cabeça" mas não documenta de forma estruturada.
**Depois**: Formulação escrita, fundamentada, conectada ao plano de tratamento.

---

## When to Trigger

- `/case-formulation [nome]` ou `/case-formulation`
- "Formulação de caso", "formular caso", "hipótese clínica"
- "Por que o paciente está assim?", "o que mantém o problema?"
- Após sessões 3-5 (dados suficientes para formular)
- Revisão quando padrão muda significativamente

---

## Pre-Requirements

1. Paciente deve ter arquivo em `data/patients/[slug].md`
2. Idealmente: pelo menos 3 sessões registradas via `/session-notes`
3. Se não houver dados suficientes: informar e perguntar ao psicólogo diretamente

---

## Process

### Step 1: Identificar Abordagem

Ler `context/my-clinic.md` → campo "Practice Areas" / "Abordagem":

- Se **TCC / Cognitivo-Comportamental** → Modelo 5 Áreas de Padesky
- Se **Psicodinâmica / Psicanalítica** → Modelo Dinâmico
- Se **Humanista / Existencial** → Modelo Fenomenológico
- Se **Sistêmica / Familiar** → Modelo Sistêmico
- Se **Integrativa / Não especificou** → Perguntar: "Qual modelo de formulação você prefere?"

### Step 2: Coleta de Dados

Ler `data/patients/[slug].md` (sessões anteriores + intake).

Se dados insuficientes, guiar conversa:

1. "Qual a queixa principal e como se manifesta no dia-a-dia?"
2. "O que precipitou a busca por terapia? (gatilho)"
3. "Quais experiências passadas podem ter contribuído? (predisponentes)"
4. "O que mantém o problema ativo hoje? (fatores de manutenção)"
5. "Que recursos/forças o paciente tem? (proteção)"
6. "O que você já observou de padrão repetitivo?"

### Step 3: Gerar Formulação (por abordagem)

---

## Output: Modelo TCC — 5 Áreas de Padesky

```markdown
## Formulação Clínica — [Iniciais]
**Data**: [data]
**Abordagem**: TCC (Modelo 5 Áreas — Padesky & Mooney)
**Sessão**: #[N]

---

### Queixa Principal
[Em termos do paciente — como ele/ela descreve o problema]

---

### Fatores Predisponentes (vulnerabilidade)
- [Experiências da infância/adolescência que criaram vulnerabilidade]
- [Modelos parentais, ambiente, perdas, traumas]
- [Crenças centrais formadas: "Eu sou...", "Os outros são...", "O mundo é..."]

### Fatores Precipitantes (gatilho)
- [Evento(s) que disparou a crise ou busca por terapia]
- [Quando começou? O que mudou?]

### Fatores de Manutenção (ciclo vicioso)

#### Situações-gatilho típicas
[O que ativa o padrão — ex: "crítica do chefe", "silêncio do parceiro"]

#### Pensamentos automáticos
[Os pensamentos que surgem — ex: "Não sou bom o suficiente", "Vou ser rejeitado"]

#### Crenças centrais ativadas
[A crença nuclear — ex: "Sou inadequado", "Sou indigno de amor"]

#### Emoções
[Padrão emocional dominante — ex: "Ansiedade intensa + tristeza + raiva contida"]

#### Comportamentos
[O que faz (e deixa de fazer) — ex: "Evita situações sociais", "Procrastina trabalho"]

#### Fisiologia
[Manifestações corporais — ex: "Insônia, tensão no pescoço, náusea antes de reuniões"]

### O Ciclo (como se retroalimenta)
```
[Situação] → [Pensamento] → [Emoção] → [Comportamento] → [Consequência que confirma crença]
                    ↑                                              ↓
                    └──────────────── reforça ←─────────────────────┘
```

### Fatores de Proteção
- [Recursos internos — inteligência, motivação, insight]
- [Recursos externos — rede de apoio, trabalho, espiritualidade]
- [Experiências positivas que contradizem crenças]

---

### Hipótese Integrativa (1-2 parágrafos)

[Narrativa que conecta tudo: "Devido a [predisponentes], [paciente] desenvolveu
a crença de que [crença central]. Quando [precipitante] ocorreu, esta crença foi
ativada, gerando [emoções + pensamentos automáticos]. Para lidar, [paciente]
adotou [comportamentos], que paradoxalmente mantêm o ciclo porque [explicar
como o comportamento reforça a crença]. O tratamento deve focar em [foco],
usando [técnicas], com atenção a [obstáculos previstos]."]

---

### Implicações para Tratamento

| Foco | Técnica Indicada | Prioridade |
|------|-----------------|-----------|
| [Crença central X] | Reestruturação cognitiva | Alta |
| [Evitação Y] | Exposição gradual | Alta |
| [Habilidade faltante Z] | Treino de habilidades | Média |
| [Fisiologia W] | Relaxamento / regulação | Complementar |

### Obstáculos Previstos
- [O que pode dificultar o progresso — ex: padrão de evitação pode dificultar exposição]
- [Como manejar]

---
⚠️ RASCUNHO — Requer revisão do profissional responsável
CRP: [from context/my-clinic.md]
```

---

## Output: Modelo Psicodinâmico

```markdown
## Formulação Clínica — [Iniciais]
**Data**: [data]
**Abordagem**: Psicodinâmica
**Sessão**: #[N]

---

### Queixa Manifesta
[O que traz — o sintoma, a demanda explícita]

### Queixa Latente (hipótese)
[O que pode estar por trás — o conflito não dito]

---

### Conflito Central
[O conflito inconsciente hipotetizado — ex: "desejo de autonomia vs medo de abandono"]

### Relações de Objeto
[Padrão relacional predominante]
- Objeto interno predominante: [ex: "mãe intrusiva internalizada"]
- Como se repete: [nas relações atuais, como o padrão aparece]
- Na transferência: [como aparece na relação com terapeuta]

### Mecanismos de Defesa Predominantes
| Defesa | Exemplo Observado | Nível |
|--------|-------------------|-------|
| [ex: Intelectualização] | [momento em que apareceu] | Neurótico |
| [ex: Projeção] | [momento] | Imaturo |
| [ex: Idealização/Desvalorização] | [momento] | Imaturo |

### Angústia Central
[Tipo — ex: angústia de separação, angústia de castração, angústia de aniquilamento]

### Hipótese Dinâmica (1-2 parágrafos)
[Narrativa integrativa: "O paciente apresenta um conflito entre [X] e [Y],
originado em [experiências relacionais precoces]. O ego maneja esse conflito
predominantemente via [defesas], o que resulta em [sintomas/padrão]. Na
transferência, observa-se [padrão], sugerindo que [interpretação]. O
trabalho terapêutico deve focar em [foco], com atenção a [resistências previsíveis]."]

### Foco Terapêutico
- Curto prazo: [conflito focal — Malan/Davanloo]
- Longo prazo: [reorganização de padrão]

### Resistências Previsíveis
- [O que pode emergir como resistência — ex: faltas, silêncio, acting out]

---
⚠️ RASCUNHO — Requer revisão do profissional responsável
```

---

## Output: Modelo Humanista/Existencial

```markdown
## Formulação Clínica — [Iniciais]
**Data**: [data]
**Abordagem**: Humanista / Existencial
**Sessão**: #[N]

---

### Experiência Vivida
[Como o paciente EXPERIENCIA o problema — fenomenologia, sem julgamento diagnóstico]

### Self Ideal vs Self Real
- **Self ideal** (quem gostaria de ser): [descrição]
- **Self real** (quem se percebe sendo): [descrição]
- **Incongruência**: [onde divergem — fonte de sofrimento]

### Condições de Valor Introjetadas
[Condições que aprendeu para ser amado/aceito — ex: "Só sou valioso se produtivo"]

### Tendência Atualizante (bloqueios)
[O que impede o crescimento natural — ex: medo de julgamento, introjeções rígidas]

### Dados Existenciais Relevantes
| Dimensão | Como se Apresenta |
|----------|-------------------|
| Liberdade / Responsabilidade | [assume escolhas? Ou vitimiza-se?] |
| Sentido / Propósito | [tem? Perdeu? Busca?] |
| Solidão / Conexão | [isolado? Relações autênticas?] |
| Finitude / Morte | [negação? Angústia? Integração?] |

### Direção Terapêutica
[Não "técnicas a aplicar" mas "como estar com este paciente" — ex:
"Oferecer aceitação incondicional para que [paciente] possa explorar
[aspecto de si] sem medo de rejeição. Facilitar contato com
[emoção/experiência] que está sendo evitada."]

---
⚠️ RASCUNHO — Requer revisão do profissional responsável
```

---

## Output: Modelo Sistêmico

```markdown
## Formulação Clínica — [Iniciais/Família]
**Data**: [data]
**Abordagem**: Sistêmica
**Sessão**: #[N]

---

### Sistema Identificado
[Quem faz parte — nuclear, ampliada, significativos]

### Padrão Interacional
[O "jogo" relacional — ex: "Quanto mais mãe cobra, mais filho se retrai.
Quanto mais filho se retrai, mais mãe cobra."]

### Mapa de Alianças e Coalizões
- Aliança: [quem com quem]
- Coalizão contra: [quem]
- Triangulação: [quem está no meio]
- Membro periférico: [quem está excluído]

### Fronteiras
| Subsistema | Tipo de Fronteira |
|------------|-------------------|
| Conjugal | [rígida / flexível / difusa] |
| Parental | [rígida / flexível / difusa] |
| Fraternal | [rígida / flexível / difusa] |
| Com família de origem | [rígida / flexível / difusa] |

### Paciente Identificado
[Quem "carrega" o sintoma do sistema — e que função o sintoma cumpre]

### Hipótese Sistêmica
[Ex: "O sintoma de [PI] cumpre a função de [manter atenção / evitar conflito conjugal /
equilibrar o sistema]. Se o sintoma desaparecer, o sistema precisará [reorganizar-se]."]

### Direção Terapêutica
- Foco: [reorganização de padrão X]
- Intervenções: [genograma, prescrição de tarefa, reframing, etc.]

---
⚠️ RASCUNHO — Requer revisão do profissional responsável
```

---

## Step 4: Salvar

Append ao arquivo do paciente em `data/patients/[slug].md` na seção "## Formulação Clínica".

Se já existe formulação anterior: mover para "### Formulação anterior ([data])" e substituir pela nova.

---

## Edge Cases

1. **Psicólogo usa abordagem integrativa**
   - Oferecer: "Quer que eu combine elementos de TCC + psicodinâmica? Ou prefere um modelo?"
   - Se sim: usar TCC para fatores de manutenção + psicodinâmica para padrão relacional

2. **Dados insuficientes (< 3 sessões)**
   - Gerar: "Formulação PROVISÓRIA (dados limitados)"
   - Marcar campos como "a aprofundar"
   - Sugerir: "Reavaliar após sessão 5"

3. **Paciente com comorbidade**
   - Uma formulação integrada (não uma por diagnóstico)
   - Mostrar como os quadros se alimentam mutuamente

4. **Caso de criança**
   - TCC: adaptar para "modelo comportamental" (menos crenças centrais)
   - Sistêmico: incluir dinâmica familiar como foco central
   - Incluir: papel dos pais no ciclo de manutenção

5. **Revisão de formulação**
   - Quando: novo dado contradiz hipótese, plateau, mudança de foco
   - Format: "Reformulação — o que mudou e por quê"

6. **Psicólogo discorda da formulação gerada**
   - Aceitar: "Quais ajustes você faria?"
   - Reformular com input dele
   - NUNCA insistir numa formulação que o profissional rejeita

---

## Dependencies

- `context/my-clinic.md` — abordagem teórica
- `data/patients/[slug].md` — dados das sessões
- `references/intervention-library.md` — técnicas por abordagem
- `references/dsm5-categories.md` — referência diagnóstica

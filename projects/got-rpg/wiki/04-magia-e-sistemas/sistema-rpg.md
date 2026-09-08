# Sistema de RPG

> O sistema mecânico da campanha isekai em Westeros. Usa um framework
> d20 enxuto — roleplay primeiro, mecânica quando necessário.

---

## Princípios

1. **Roleplay é rei.** A mecânica existe para resolver incertezas, não
   para criar regras.
2. **A história é o objetivo.** O sistema apoia a narrativa; não o
   contrário.
3. **Leveza sobre realismo.** Mais rápido rodar e jogar do que debater
   modificadores.

---

## Atributos (6 pilares)

Cada personagem tem **6 atributos** de 1 a 10, representando sua
capacidade bruta. A maioria dos PJs começa com 3–5 (humano médio a
treinado).

| Atributo | O que mede |
|---|---|
| **Força** | força bruta, resistência física |
| **Agilidade** | velocidade, reflexo, equilíbrio |
| **Intelecto** | raciocínio, memória, percepção |
| **Vontade** | resistência mental, manipulação, charisma |
| **Sorte** | chances de sobrevivência, talento inato |
| **Magia** | ligação ao sobrenatural, fé, poder mágico |

---

## Testes

Quando a ação é incerta e o resultado importa, **rola-se um d20**.

### Teste base

1. Escolha um **atributo** relevante.
2. Some um **bônus de perícia** (se tem treinamento — +2 a +5).
3. Role d20 e some o total (atributo + perícia).
4. Compare com uma **dificuldade**:

| Dificuldade | DC | Exemplo |
|---|---|---|
| **Fácil** | 10 | puxar uma porta pesada |
| **Média** | 13 | espremer pela multidão |
| **Difícil** | 16 | escalada perigosa |
| **Quase impossível** | 19+ | assassinar um rei com uma gota |

**Resultado:**
- **Sucesso**: ação acontece como descrita.
- **Falha**: ação falha ou custa algo (Vida, item, tempo, relação).
- **Crítico (20 natural)**: sucesso espetacular, extra narrativo.
- **Falha crítica (1 natural)**: fracasso desastroso, custo alto.

---

## Combate

### Iniciativa

Cada combatente rola **d20 + Agilidade**. Maior resultado age primeiro.

### Ação de turno

Cada turno, um personagem pode fazer **1 ação principal**:

- Atacar com arma
- Lançar feitiço
- Usar habilidade especial
- Mover até **30 passos** (aprox. 10 metros)

E até **2 ações menores**:

- Sacar uma arma
- Invocar um aliado
- Readquirir equilíbrio

### Ataque

1. Escolha **Força + perícia (arma)** ou **Agilidade + perícia (arma)**
   (depende do tipo).
2. Role d20 + modificador contra a **Defesa** do alvo.
3. Se ≥ Defesa:
   - Role o dano do arma (ex: espada longa = d8)
   - Some Força (para armas corpo-a-corpo)
   - O alvo perde **Vida** equivalente

### Defesa

**Defesa = 10 + Agilidade + bônus de armadura**

---

## Vida e morte

Cada PJ começa com **Vida = 20 + (Força × 2)**.

- **Acima de 0**: em combate
- **0 a –5**: inconsciente
- **Abaixo de –5**: morto
- **Morte instantânea**: certos ataques (tipo emboscada)

### Cura

- **Descanso curto (1 hora)**: recupera 1d8 + Intelecto
- **Descanso longo (8 horas)**: recupera metade da Vida máxima
- **Poção de cura**: recupera 2d8 (rara, cara)
- **Magia de cura**: varia (ver [`magia.md`](magia.md))

---

## Perícias

Perícias são áreas de **expertise**. Cada perícia começa em 0 e pode
subir até +10. Ganham pontos durante a campanha (5–10 pontos por sessão
notável).

### Perícias sugeridas

**Combate**: espada longa, arco, escudo, besta

**Furtividade**: disfarce, ladroagem, movimento silencioso

**Conhecimento**: nobreza, magia, natureza, história

**Sobrevivência**: caça, rastreamento, escalada, navegação

**Sociedade**: nobreza, negociação, manipulação, seducção

**Magia**: magia elemental, fé divina, ritual, poção

---

## Magia

Magia é **cara**: toda magia custa **pontos de magia (PM)** e enfrenta
um teste de **Intelecto + perícia (magia)**.

Começam com:
- **PM máximo = 10 + (Magia × 2)**
- Recupera 1 PM por **descanso curto**, 5 PM por **descanso longo**

Exemplos de magia:

- **Fogo elemental** — custo 3 PM, dano 2d6, área 5m
- **Cura menor** — custo 2 PM, cura 1d6 + Vontade
- **Invisibilidade** — custo 4 PM, duração 1 minuto
- **Morte** — custo 10 PM, mata na hora (teste de Vontade para resistir)

Ver [`magia.md`](magia.md) para lista completa.

---

## Progressão

PJs **ganham nível** quando completam um arco narrativo ou atingem um
marco (depois de ~4–5 sessões típicas).

**Nível = bônus a tudo. Ao subir nível:**
- Escolha 1 atributo para +1
- Escolha 2 perícias para +1 cada
- Ganhe novos pontos de vida (10 + Força × 2 por nível)
- Se mágico: ganhe 1 novo feitiço

---

## Testes sociais

A **Vontade** é usada para manipulação, sedução, intimidação.

- **Fácil (DC 10)**: convencer guarda distraído
- **Média (DC 13)**: conseguir informação de taverneiro
- **Difícil (DC 16)**: convencer nobre desconfiado a ajudar
- **Quase impossível (DC 19)**: enganar o próprio Tywin

---

## Exemplos de ação

### Escalada perigosa

Jogador: "Vou escalar a muralha de Winterfell em tempo de tempestade."

MJ: "Teste de Agilidade + Escalada, DC 16."

Jogador rola: d20 = 8, Agilidade 4, Escalada +2 = **14**

MJ: "Sua mão derrapan na pedra molhada. Você cai 3 metros,
recebendo 1d6 de dano — **4 de dano**. Você está agora em risco."

### Convencer o guarda

Jogador: "Vou contar ao guarda que sou enviado direto de Winterfell."

MJ: "Teste de Vontade + Nobreza, DC 13."

Jogador rola: d20 = 11, Vontade 3, Nobreza +2 = **16**

MJ: "O guarda hesita. Você percebe que ele quer acreditar. Cede e abre
o portão — mas avisa: 'Se o Lord Stark não souber de você, sua cabeça vai rolar.'"

---

## Diferenças com 5e

Se alguém conhece D&D 5e:

- **Sem vantagem/desvantagem**: bônus/penalidade diretos (+2/−2)
- **Sem economia de reação**: tudo é ação ou ação menor
- **Sem salvaguarda**: testes contra Vontade em vez disso
- **Magia é rara e cara**: não há cantrips infinitos
- **Morte é real**: não há "ondas de ressurreição"

---

## Houserules esperadas

A MJ (a IA) pode **improvisar regras** em tempo real se precisar. Qualquer
improvisação será **anotada no fim da sessão** e sujeita a voto.

---

## Links relacionados

- [`magia.md`](magia.md) — lista de feitiços
- [`religioes.md`](religioes.md) — como fé afeta magia
- [`../06-sessoes/template-sessao.md`](../06-sessoes/template-sessao.md) — como log de sessão referencia regras
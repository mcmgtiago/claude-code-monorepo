# Design — GDD Core (Game Design Document)

**Status:** Design fase 0

---

## Pilares de Design

1. **Escolha > Otimização** — Não há "build vencedor". Cada escolha fecha caminhos e abre outros.
2. **Consequência é Moeda** — Tudo tem custo. Poder, romance, lealdade, inocência.
3. **NPCs Respiram** — Não esperam sua volta. Traem, amam, morrem.
4. **Mortalidade Importa** — Morte é final (ressalvo story exceptions muito raras).
5. **Adulto Responsável** — Violência pesa. Romance respeita consent. Sexo é entre adultos.

---

## Loop Principal

```
1. PLAYER DECIDES (texão livre)
   "Vou beijar Rogue"

2. WORLD REACTS (IA narra + consequences)
   Rogue quer beijar mas não pode (absorve energia)
   Escolhe: arriscar morte / encontrar workaround / recuar

3. CHOICE STICKS (não pode desfazer)
   Se beijar sem proteção, Rogue vira vegetativa por dias
   Facção ouve fofoca, moral muda, relacionamentos morrem

4. NEW SITUATION (mundo avança)
   Xavier furioso, Rogue culpada, Hospital de mutuantes entra em crise
   Nova quest: curar Rogue / encontrar antídoto / pedir desculpas públicas

Loop repete. Mundo é matriz de consequências que se acumulam.
```

---

## Pilares de Gameplay

### Discovery Over Grinding
- Sem sistemas de farm de XP
- XP vem de decisões significativas, quests completadas, relacionamentos desenvolvidos
- Nível máximo ~20, atinge-se por stories completadas, não por kill count

### Moral Ambiguity
- Missão: salve refugiados mutantes no gueto
- Solução 1: Violence contra polícia (100 civis feridos colaterais)
- Solução 2: Hack sistema, legal mas lento (alguns mutantes morrerem esperando)
- Solução 3: Trato com Hellfire Club (salva todos mas vira devedora deles)
- Solução 4: Infiltração (cansativo, risco de descoberta, não resolve raiz)
- Não há "solução boa". Cada uma paga diferente.

### Agency vs. Narrative Rail
- Player sempre pode fazer o que quer
- Mas mundo rejeita ações incompatível com consequência
- Ex: Mata NPC chave pra quest → Quest cancela, mundo muda, novo ramo abre
- Nunca é punido por escolha "errada" narrativamente (é só consequência)

---

## Arquétipos de Personagem — Paths

Não há classes fixas, mas patterns reconhecíveis:

### Path: Guerreira
- X-gene: Força, Transformação, Velocidade, Elemental
- Estilo: Violência é solução
- Arco: De soldada a indivíduo? Ou perpetua ciclo?
- Risk: Muita morte. Facções a usam como arma.

### Path: Diplomata
- X-gene: Telepatia, Empatia, Inteligência
- Estilo: Negociação > violência
- Arco: De mediadora a poder político? Ou manipulada?
- Risk: Fraco contra viga bruta. Inimigos exploram tua empatia.

### Path: Ermitã
- X-gene: Qualquer coisa com weakness forte
- Estilo: Isolamento, autossuficiência
- Arco: De isolada a comunidade? Ou perpetua solidão?
- Risk: Fraca socialmente. Mundo a esquece.

### Path: Aprendiza
- X-gene: Qualquer coisa
- Estilo: Exploração, questões
- Arco: De novata a especialista? A mestra? A revolucionária?
- Risk: Depende de mentores (fácil ser traída).

Cada path tem questlines específicas e relacionamentos únicos.

---

## Progressão — Not Traditional

### XP Categories

Não há "kill XP". XP vem de:

- **Story XP:** Quest completada (100-500 XP)
- **Choice XP:** Decisão significativa com consequence (50-200 XP)
- **Relationship XP:** Milestone com NPC (50-300 XP depende da depth)
- **Discovery XP:** Encontrar lore secret, location oculta (10-100 XP)
- **Moral XP:** Ato consistente com alignment (20-100 XP)

### Leveling

```
Nível 1-5:  Aprendizado (Xavier's School, combate básico)
Nível 6-10: Competência (explorando mundo, relacionamentos profundos)
Nível 11-15: Expertise (dominando X-gene, poder político)
Nível 16-20: Lenda (mundo muda por sua influência)

Saltar níveis:
  - Nível 1 → 3: primeiras 2-3 quests
  - Nível 3 → 5: early companion unlocked
  - Nível 5 → 8: completar Xavier's arc principal
  - Nível 8 → 12: explorar 2 hubs externos
  - Nível 12+: cada quest major = +1-2 níveis
```

### Perks (Vantagens)

Ao level up (ou story milestone), player escolhe 1 perk:

**Combat:**
- +1d4 dano em categoria (melee, elemental, telekinetic)
- Ação adicional em combate uma vez por sessão
- Resistência a tipo de dano

**Social:**
- +2 em um tipo de diálogo (seduction, intimidate, deceive)
- Influência com facção (rep +10)
- Segunda chance em falha social (retry teste)

**Exploration:**
- Sinta movimento de outros mutantes (tipo radar)
- Encontre pistas ocultas (+1 disco secreto por location)
- Toque seguro (não dispara traps accidentalmente)

**Mystery:**
- Compreenda linguagem codificada
- Acesse journals criptografados
- Sinta mentiras (insight sobre verdade de NPC)

---

## Death System — Permanência

### How Permanent Death Works

```
Player HP = 0 ou equivalent failure state

Option 1: TRUE DEATH
  - Personagem morre
  - Mundo reage (NPCs enlutados, facciones se movem)
  - Novo personagem pode ser criado
  - Antigo personagem vira lenda / NPC seed pra próximos characters

Option 2: CAPTURE / COMA
  - Despertou em celula, hospital, ou limbo
  - Tempo passou (dias/semanas)
  - Relacionamentos degradaram (seu silêncio custou)
  - Quest: escape ou resgate

Option 3: SACRIFICE
  - Deu a vida pra salvar outros
  - Campanha encerra (bom final)
  - Antigo personagem vira heroína lendária
  - Novo personagem herda legacy (rep bonuses, contacts)
```

Não há "respawn". Morte é gate narrativo final.

---

## Difficulty & Accessibility

### Modes (futuro)

- **Story mode** (dano reduzido, inimigos mais dumb, mais help)
- **Normal** (balanced, recomendado)
- **Hard** (inimigos inteligentes, menos recursos, mais consequence)
- **Ironman** (1 save slot, True Death sempre)

### Accessibility (MVP)

- Text only (futuro: voice option)
- Colorblind modes (futuro)
- Pacing: player controla quando avança (nenhuma pressa)
- Content warnings: antes de cena NSFW, pergunta "ok continuar?"

---

## Thematic: Power & Sacrifice

Core theme: **Poder sempre exige sacrifício.**

Manifestações:
- Telepatia → isolamento / invasão de privacidade
- Força → falta de controle / morte acidental
- Regeneração → trauma físico eterno / perda de mortalidade
- Velocidade → isolamento temporal / incapacidade de conectar
- Inteligência → arrogância / despair de clareza

Player experience: Conforme fica mais poderosa, mundo inteiro muda (expectativas, inimigos, aliados, moral). Poder não é upgrade puro. É trade-off.

---

**Próximo:** `21-PROGRESSION.md` (sistema de stats, perks, synergies).

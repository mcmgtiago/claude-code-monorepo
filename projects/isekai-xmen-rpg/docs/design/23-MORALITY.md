# Sistema de Moralidade

**Status:** Design fase 0

---

## Alinhamento — Spectrum Contínuo

Não é D&D alignment grid. É um spectrum numérico com consequências.

```
-100 ────────── -50 ────────── 0 ────────── +50 ────────── +100
  VILÃO           ANTI-HERÓI      NEUTRO       HERÓI         SANTO
  
  Apocalypse      Magneto         Wolverine    Cyclops       Xavier
  (destroy)       (ends justify)  (pragmatic)  (duty)        (ideal)
```

### Faixas e Efeitos

| Range | Label | Gameplay Effect |
|-------|-------|-----------------|
| -100 a -70 | **Villain** | Facções legais te caçam. Brotherhood acolhe. NPCs temem. |
| -69 a -30 | **Anti-villain** | Olhado com suspeita. Acesso a mercado negro. NPCs cautelosos. |
| -29 a +29 | **Neutral** | Ninguém te categoriza. Liberdade máxima de ação. |
| +30 a +69 | **Anti-hero** | Xavier's aceita. Mas cobram pureza. Outros dizem "fraco". |
| +70 a +100 | **Hero** | Reverenciado. Pressão imensa. Qualquer falha é escândalo. |

### O que Move a Barra

**Ações que movem pra NEGATIVO:**
- Matar inocentes (-10 a -25)
- Tortura (-15 a -30)
- Traição de aliado (-20)
- Roubo de vulneráveis (-5 a -10)
- Manipulação (usar poder pra forçar) (-5 a -15)
- Assassinato frio (-20 a -40)

**Ações que movem pra POSITIVO:**
- Salvar inocentes (+5 a +15)
- Sacrifício pessoal (+10 a +25)
- Perdão genuíno (+5 a +10)
- Proteger fraco sem recompensa (+5 a +10)
- Recusar poder fácil (+5 a +15)
- Diplomacia sobre violência (+5)

**Ações NEUTRAS (não movem):**
- Self-defense
- Matar em combate justo
- Roubo de corporação opressora
- Mentira pra proteger inocente
- Violência contra vilão confirmado

---

## Consequências Narrativas

### No Mundo

**Vilão (-70+):**
- Sentinelas te caçam
- Xavier's te recusa
- Brotherhood te recruta agressivamente
- NPCs good-aligned fogem de você
- Polícia: kill-on-sight
- Acesso a: mercado negro, assassinos, poder ilegal

**Neutro:**
- Ambos os lados te cortejam
- Ninguém te confia completamente
- Máximo de liberdade de ação
- Acesso a: tudo que ninguém acha que você reporta

**Herói (+70+):**
- Xavier's te dá posição de liderança
- Público te reconhece (perda de anonimato)
- Expectativa de perfeição (qualquer falha = escândalo)
- Vilões te targetam proativamente
- Acesso a: recursos legais, apoio público, governo

### Em Relacionamentos

NPCs reagem ao seu alignment vs o deles:

```
NPC Alignment | Player Match | Player Opposite
──────────────┼──────────────┼─────────────────
Good          | +trust       | -trust, lectures
Evil          | suspicious   | +respect, alliance
Neutral       | comfortable  | uncomfortable
```

Romance também é afetado:
- Rogue (good): não romanceia villains
- Emma Frost (neutral-evil): attracted to power, any alignment
- Magneto (anti-villain): respects conviction regardless of side
- Kael (neutral-good): needs trust, rejects cruelty

---

## Moral Dilemmas — Exemplos de Design

### Dilemma 1: "O Informante"

```
Situação: NPC aliado está vendendo info pra governo. Se você revelar, ele morre.
Se não revelar, seus companheiros são capturados.

Opção A: Denunciar (+5 moral, NPC morre, companheiros salvos)
Opção B: Silenciar (-5 moral, NPC vive, companheiros capturados)
Opção C: Confrontar NPC (0 moral, mas NPC pode fugir ou atacar)
Opção D: Falsificar informação (INT check, 0 moral, mas se falhar = -10)
```

### Dilemma 2: "O Experimento"

```
Situação: Laboratório HYDRA faz experimentos em mutantes crianças.
Você pode destruir o lab (crianças sobrevivem, mas cientistas morrem).
Ou negociar (crianças liberadas eventualmente, mas programa continua).

Opção A: Destruir (-5 moral por mortes, +10 por salvar crianças = +5 net)
Opção B: Negociar (+5 moral diplomacia, -10 se programa mata mais = -5 net)
Opção C: Infiltrar e hackear (INT 15 DC, se sucesso: +10, programa exposto)
Opção D: Ignorar (-15 moral, crianças continuam sofrendo)
```

### Dilemma 3: "O Amor Proibido"

```
Situação: Seu interesse romântico está do lado inimigo (Brotherhood).
Eles pedem que você traia Xavier's pra provar lealdade.

Opção A: Trair Xavier's (-20 moral, relationship +30 com partner, allies -50)
Opção B: Recusar (+5 moral, relationship -30, partner may leave)
Opção C: Duplo-agente (CHA 16 DC, se sucesso: ambos lados +10. Se falhar: -30 ambos)
Opção D: Convencer partner a trocar de lado (WIS 14 DC + trust 70+)
```

---

## Tracking Invisível

Player NÃO vê seu score moral como número (exceto no character sheet como referência).

O que player percebe:
- NPCs mudam tom
- Portas se abrem/fecham
- Manchetes mudam
- Pronomes que mundo usa pra se referir a você ("herói", "assassino", "aquele cara")

Feedback sutil > número explícito.

---

## Redenção e Queda

### Redenção (evil → good)

**Possível mas CARO:**
- Não basta fazer "coisas boas" — precisa confrontar o mal que fez
- NPCs que você machucou não perdoam fácil (trust recovery: 2x mais lento)
- Arco de redenção: 20-30 quests focadas em reparação
- Facções que te acolheram como villain resistem sua saída
- Pode exigir sacrifício (perder poder, status, relacionamento)

### Queda (good → evil)

**Gradual e insidiosa:**
- Começa com "exceções justificadas" (-5 aqui, -5 ali)
- NPCs alertam ("você está mudando...")
- Depois de -30, é difícil voltar sem esforço
- Facções começam a te rejeitar
- Relacionamentos bons deterioram

---

## Interação com Sistema de Trauma

Moral choices under trauma são HARDER:

```
Stress > 60: moral penalties são 50% maiores (mais fácil cair)
Trauma ativo: certas situações triggam reações que custam moral
Ex: Trauma "matei inocente" → ver inocente em perigo → freeze OR overreact

Both freeze (inação) and overreact (violência excessiva) cost moral points.
Only addressing the trauma (therapy, confrontation) breaks the cycle.
```

---

## Moral Alignment e Ending

O ending da campanha é heavily influenced by moral position:

**Villain ending:** Domina. Solidão. Power but no love.
**Anti-hero ending:** Survived. Some bridges burned. Respected but feared.
**Neutral ending:** Free. Uncommitted. World unchanged by you.
**Hero ending:** Sacrificed something. World better. People remember.
**Saint ending:** Impossible without sacrifice of self. Legendary but gone.

---

**Próximo:** `24-RELATIONSHIPS.md` (sistema de afinidade NPC detalhado).

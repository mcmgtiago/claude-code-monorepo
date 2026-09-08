# BLUEPRINT: Seven Universe — RPG Profundo de Verdade

**Versão:** 2.0 — Revisão total de sistemas  
**Objetivo:** Um RPG de IA onde TUDO importa, tudo cascata, o mundo vive.  
**Execução:** Sistema por sistema, testando cada um antes de avançar.

---

## VISÃO CENTRAL

O player não joga um chatbot. Ele habita um MUNDO com:
- Facções que brigam entre si sem ele
- NPCs com vida própria que lembram tudo
- Economia que funciona
- Corpo que envelhece e marca
- Poder que tem custo real
- Escolhas que fecham portas PERMANENTEMENTE
- Arcos narrativos que convergem pra momentos épicos

---

## SISTEMA 1: Facções Vivas

### Cada facção tem:
```typescript
interface Faction {
  id: string;
  name: string;
  leader: string;
  resources: number;        // riqueza/poder militar
  territory: string[];      // locais que controla
  objectives: string[];     // o que quer (expandir, destruir facção X, etc)
  enemies: string[];        // facções inimigas
  allies: string[];
  playerReputation: number; // -100 a +100
  playerRank: string;       // "outsider", "membro", "oficial", "líder"
  // Relacionamento com OUTRAS facções (não só player)
  factionRelations: Record<string, number>; // factionId → rep
}
```

### Comportamento autônomo (world tick):
- Facções com objectives ativos AGEM a cada tick
- "Brotherhood quer destruir Sentinelas" → ataca fábrica → sucesso/falha gera evento
- Guerras escalam: troca de territórios, baixas, alianças mudam
- Player pode se envolver ou ignorar — mas ignorar tem consequência

### Rank dentro de facção:
Outsider → Recruta → Membro → Oficial → Tenente → Comandante → Líder
- Cada rank desbloqueia: missões, recursos, informação, recrutas
- Pode trair uma facção pra outra (com consequências massivas)
- Pode FUNDAR facção própria (endgame)

---

## SISTEMA 2: Economia Real

### Moeda por universo:
- X-Men: créditos (crime + tech)
- GoT: dragões de ouro
- Bleach: (sem moeda, mas favores/débitos)
- Bridgerton: libras
- Cyberpunk: eddies
- Cowboy: dólares de ouro
- Samurai: ryō

### Economia funcional:
```typescript
interface Economy {
  playerWealth: number;
  properties: Property[];      // imóveis que geram renda
  debts: Debt[];              // dívidas que precisam ser pagas
  income: number;             // renda passiva por tick
  expenses: number;           // custos fixos
  investments: Investment[];  // negócios
  priceFluctuation: Record<string, number>; // itens com preço variável
}

interface Property {
  name: string;
  type: 'house' | 'shop' | 'land' | 'fort' | 'base';
  location: string;
  incomePerTick: number;
  condition: number;  // degrada com tempo
}
```

### Como funciona:
- Comprar/vender itens com preços que mudam
- Propriedades geram renda passiva
- Dívidas acumulam juros (Lannister style)
- Investimentos podem dar lucro ou falir
- Exércitos custam dinheiro pra manter
- Pode ficar falido → desesperação → oportunidades negras

---

## SISTEMA 3: Relacionamentos Profundos

### Não é só "afinidade +10". Cada relacionamento tem:
```typescript
interface DeepRelationship {
  id: string;
  npcId: string;
  type: 'stranger' | 'acquaintance' | 'friend' | 'close' | 'intimate' | 'soulmate' | 'enemy' | 'nemesis';
  
  // Eixos emocionais (cada um -100 a +100)
  trust: number;       // confia em mim?
  affection: number;   // gosta de mim?
  respect: number;     // me respeita?
  desire: number;      // me deseja (sexual)?
  fear: number;        // me teme?
  debt: number;        // me deve algo?
  
  // Status
  romantic: boolean;
  sexual: boolean;     // já transaram
  married: boolean;
  children: string[];
  jealousOf: string[]; // ciúme de quem
  
  // Drama
  promises: string[];  // promessas feitas
  betrayals: string[]; // traições cometidas
  sharedSecrets: string[];
  sharedTraumas: string[];
  
  // Estado atual
  lastInteraction: number;
  mood: string;
  willingness: string; // "aberto", "hesitante", "recusando", "desesperado"
}
```

### Romance com estágios reais:
```
Desconhecido → Flerte → Tensão → Primeiro beijo → Intimidade → Paixão → Amor → Compromisso → Casamento → Filhos
      ↓ a qualquer momento
Traição → Vingança → Reconciliação (ou não)
```

### Ciúme e drama:
- Se player romanceia 2+ NPCs, cada um pode descobrir
- NPCs REAGEM: confronto, chantagem, abandono, vingança
- Casamento pode ser político (sem amor) ou real
- Filhos herdam traços, podem morrer, ser sequestrados

---

## SISTEMA 4: Corpo Persistente

```typescript
interface Body {
  wounds: Wound[];          // ferimentos ativos
  scars: string[];          // cicatrizes permanentes
  conditions: BodyCondition[]; // envenenado, doente, grávida, viciado
  appearance: string;       // muda conforme eventos (cicatrizes, envelhecimento)
  age: number;              // envelhece com tempo
  fitness: number;          // degrada sem treino
  addiction: string | null; // vício (álcool, drogas, poder)
  trauma: PsychTrauma[];   // trauma psicológico ativo
}

interface Wound {
  location: string;  // "braço esquerdo", "rosto", "costelas"
  severity: number;  // 1-10
  turnsToHeal: number;
  willScar: boolean;
  penaltyAttribute: string;
  penaltyAmount: number;
}

interface PsychTrauma {
  name: string;       // "Viu amigo morrer", "Foi torturado"
  trigger: string;    // situações que ativam
  effect: string;     // "paralisa", "rage", "flashback"
  severity: number;   // 1-10
  resolving: boolean; // em processo de cura
}
```

### Como funciona:
- Ferimentos curam com TEMPO (não reset mágico)
- Cicatrizes ficam na descrição permanente
- Trauma dispara em situações específicas (IA narra)
- Envelhecimento: a cada 365 dias in-game, +1 ano. Stats degradam com idade (pós-40)
- Vício pode se desenvolver (álcool, poder, sexo) — tem mecânica de abstinência

---

## SISTEMA 5: Consequência em Cascata

### Ação → Reação → Reação da reação → ...
Toda ação significativa gera CADEIA:

```
Player mata lorde rival
  → Família do lorde jura vingança (novo inimigo)
  → Facção do lorde perde líder (caos interno, guerra civil)
  → Rei investiga assassinato (player procurado?)
  → Aliados do player questionam sua moral (trust -20)
  → NPC que amava o lorde planeja envenenamento
  → Propriedades do lorde ficam disponíveis (oportunidade)
```

### Implementação:
IA recebe instrução: "Quando algo significativo acontece, gere 2-3 CONSEQUÊNCIAS FUTURAS que a IA vai executar nos próximos turnos." Ficam como fatos na deep memory com flag "pendente".

```typescript
interface PendingConsequence {
  trigger: string;      // o que causou
  consequence: string;  // o que vai acontecer
  turnsUntil: number;   // daqui a quantos turnos dispara
  severity: number;     // quão impactante
  avoidable: boolean;   // player pode prevenir?
}
```

---

## SISTEMA 6: Tempo e Envelhecimento

### Tempo real progressivo:
- 1 turno ≈ minutos a horas (conforme cena)
- Time skips: viagem, descanso, treinamento
- Estações mudam (afetam mundo)
- Eventos com PRAZO: "o casamento é em 5 dias" — se não agir, acontece sem você

### Envelhecimento:
- Stats físicos degradam após 40 (redução lenta)
- NPCs envelhecem e MORREM de velhice
- Filhos crescem e viram adultos jogáveis
- Legado: morre → filho herda (NG+ automático)

---

## SISTEMA 7: Objetivos de Longo Prazo

### Player define (ou IA detecta) seus objetivos:
```typescript
interface LongTermGoal {
  id: string;
  title: string;        // "Destruir os Sentinelas", "Virar Rei do Norte"
  type: 'power' | 'revenge' | 'love' | 'freedom' | 'discovery' | 'creation';
  steps: string[];      // sub-objetivos detectados
  progress: number;     // 0-100%
  conflictsWith: string[]; // objetivos que são incompatíveis
}
```

### IA conduz arco narrativo baseado no objetivo:
- Detecta: "player quer vingança contra Magneto" → cria sub-quests, obstáculos, aliados temáticos
- Move NPCs relevantes pro caminho do player
- Cria crescendo dramático (não linear, com reveses)

---

## SISTEMA 8: Reputação Multifacetada

Não é 1 número. É uma REDE:

```typescript
interface Reputation {
  byFaction: Record<string, number>;      // X-Men: +50, Brotherhood: -30
  byRegion: Record<string, number>;       // Madripoor: temido, NY: desconhecido
  byTrait: Record<string, number>;        // "honrado": 40, "perigoso": 70, "sedutor": 60
  title: string;                          // "O Lobo de Madripoor", "Sombra Silenciosa"
  wanted: boolean;                        // procurado?
  bounty: number;                         // recompensa pela cabeça
}
```

- Você pode ser AMADO em Madripoor mas ODIADO em Genosha
- Sua "fama" precede você — NPCs reagem antes de te conhecer
- Título evolui conforme ações (IA gera baseado no que você mais faz)

---

## SISTEMA 9: Crafting & Base

### Construir algo que é SEU:
- Base (esconderijo, castelo, laboratório, nave)
- Exército / gangue / rede de espiões
- Itens forjados (espada valyria, cyberware custom)
- Seguidores com fichas (não só "20 soldados" — alguns são nomeados)

```typescript
interface PlayerBase {
  name: string;
  location: string;
  type: string;          // "esconderijo", "castelo", "corporação"
  defenses: number;
  followers: Follower[];
  resources: Record<string, number>;
  upgrades: string[];
}

interface Follower {
  name: string;
  role: string;          // "guarda", "espião", "curandeiro", "amante"
  loyalty: number;
  skill: number;
  alive: boolean;
}
```

---

## SISTEMA 10: Arcos Narrativos Épicos

### IA sabe conduzir ARCOS (não é 100% aleatório):

```
ATO 1: CHAMADO
  Player transportado. Confuso. Primeiro aliado. Primeira ameaça.
  
ATO 2: ASCENSÃO
  Ganha poder. Faz aliados. Entra em facção. Primeiro amor.
  Conquista. Sente-se invencível.
  
ATO 3: QUEDA
  Traição. Perda pessoal (alguém morre). Vilão vence uma.
  Player é humilhado/ferido/preso. Momento mais baixo.
  
ATO 4: RENASCIMENTO
  Player se reconstrói. Mais forte ou mais sábio.
  Aliados reunidos. Confronto final se aproxima.
  
ATO 5: CLÍMAX
  Confronto com nêmesis. Escolha final (não há escolha certa).
  Resolução. Consequências permanentes. Mundo mudou.
```

IA detecta em qual ATO está (baseado em turnCount, powerStage, fatos) e ajusta o TOM conforme. Não força — sugere, conduz, cria pressão.

---

## ORDEM DE IMPLEMENTAÇÃO

| # | Sistema | Impacto | Esforço | Deps |
|---|---------|---------|---------|------|
| 1 | Consequência em cascata | ⭐⭐⭐⭐⭐ | 2h | Deep memory (✅ feito) |
| 2 | Relacionamentos profundos | ⭐⭐⭐⭐⭐ | 3h | — |
| 3 | Facções vivas | ⭐⭐⭐⭐⭐ | 3h | World tick (✅ feito) |
| 4 | Reputação multifacetada | ⭐⭐⭐⭐ | 1.5h | Facções |
| 5 | Corpo persistente | ⭐⭐⭐⭐ | 2h | — |
| 6 | Tempo e envelhecimento | ⭐⭐⭐ | 1.5h | — |
| 7 | Economia | ⭐⭐⭐ | 2h | Facções |
| 8 | Objetivos de longo prazo | ⭐⭐⭐⭐ | 2h | Deep memory |
| 9 | Arcos narrativos | ⭐⭐⭐⭐ | 2h | Objetivos |
| 10 | Crafting & base | ⭐⭐⭐ | 2h | Economia |

**Total: ~22h**

---

## PRÓXIMO PASSO

Começar pelo Sistema 1 (Consequência em Cascata) — já temos a infraestrutura (deep memory, world tick). Só precisa do tipo `PendingConsequence` e a lógica de "executa consequências pendentes quando chega a hora".

Qual sistema quer que comece?

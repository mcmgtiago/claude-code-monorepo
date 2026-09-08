# Plano: Mundo Vivo — Memória + Simulação + Combate

## 1. MEMÓRIA PROFUNDA (Structured Memory)

### Problema atual
O system prompt recebe "últimos 14 turnos + resumo". Se um NPC mencionou algo 20 turnos atrás, a IA esquece.

### Solução: Banco de Fatos (Fact Store)
Em vez de apenas texto corrido, manter uma lista de FATOS estruturados:

```typescript
interface Fact {
  id: string;
  category: 'npc' | 'event' | 'location' | 'secret' | 'promise' | 'threat';
  subject: string;      // "Wolverine", "Guerra de Genosha"
  content: string;      // "Prometeu proteger Rogue se player ajudasse"
  turnRegistered: number;
  importance: number;   // 1-10 (10 = impossível esquecer)
  expires: boolean;     // se pode ser esquecido
  relatedNpcs: string[];
}
```

### Como funciona
1. Após CADA turno, um call barato (Haiku) extrai fatos do texto:
   "O que é novo/importante neste turno? NPCs, promessas, ameaças, segredos."
2. Fatos entram no banco
3. Antes de cada turno, seleciona os fatos RELEVANTES (por NPC em cena, local, contexto)
4. Inclui no prompt: "## FATOS QUE VOCÊ LEMBRA: ..."

### NPC Cards (ficha persistente)
Cada NPC passa a ter uma "card" completa:

```typescript
interface NpcCard {
  id: string;
  name: string;
  faction: string;
  appearance: string;    // descrição fixa (não muda)
  personality: string;   // traços fixos
  currentMood: string;   // muda conforme interações
  agenda: string;        // o que quer (muda ao longo do tempo)
  secretKnowledge: string[];  // o que sabe sobre o player
  lastSeen: { turn: number; location: string };
  history: string[];     // eventos com o player (resumidos)
}
```

### Resultado
IA SEMPRE sabe: quem já encontrou, o que promissou, quem é aliado/inimigo, o que NPCs sabem sobre você. Mundo coerente por centenas de turnos.

---

## 2. SIMULAÇÃO DINÂMICA (World Ticks)

### Problema atual
Se o player não faz nada, nada acontece. Mundo é palco morto.

### Solução: World Tick System
A cada N turnos (ou passagem de tempo in-game), roda uma "simulação":

```typescript
interface WorldTick {
  trigger: 'turns' | 'time_skip' | 'event';
  effects: WorldEvent[];
}

interface WorldEvent {
  type: 'faction_move' | 'npc_action' | 'war_change' | 'rumor' | 'death';
  description: string;
  affectsPlayer: boolean;
  factions: string[];
}
```

### Como funciona
1. A cada 5 turnos, call Sonnet barato: "Dado o estado do mundo [facções, guerra, NPCs], o que acontece quando o player NÃO está olhando? Gere 1-3 eventos."
2. Eventos entram no banco de fatos + world state
3. Player descobre via: rumores, NPCs contando, mudanças visíveis, notícias
4. Alguns eventos FORÇAM reação: "Sentinelas atacam sua localização" (não pode ignorar)

### NPC Agendas
NPCs têm OBJETIVOS e AGENDAS que executam mesmo offline:
- Magneto: "recrutar mutantes pro Brotherhood" (a cada tick, ele avança nisso)
- Cersei: "eliminar ameaças ao poder" (a cada tick, trama contra alguém)
- Se o player ignorar muito tempo, NPC pode: morrer, mudar de facção, virar inimigo, resolver um problema sozinho

### Resultado
Voltar a um lugar e encontrar mudanças. Perder oportunidades por não agir. Mundo que VIVE.

---

## 3. COMBATE PROFUNDO (Tactical System)

### Problema atual
Rola d20, IA narra. Nenhuma decisão tática real.

### Solução: Combat Engine

```typescript
interface TacticalCombat {
  round: number;
  playerPosition: 'melee' | 'ranged' | 'cover' | 'flanking';
  playerStance: 'offensive' | 'defensive' | 'evasive';
  conditions: Condition[]; // bleeding, stunned, enraged, buffed
  cooldowns: Map<string, number>; // skills em cooldown
  enemies: TacticalEnemy[];
  environment: string[]; // coisas no cenário que podem ser usadas
  combo: number; // contador de combo (ações consecutivas sem falha)
}

interface TacticalEnemy {
  id: string; name: string;
  hp: number; hpMax: number;
  position: string;
  behavior: 'aggressive' | 'defensive' | 'ranged' | 'coward';
  conditions: Condition[];
  nextAction: string; // IA informa o que inimigo VAI fazer (player pode reagir)
}

interface Condition {
  name: string; // 'bleeding', 'stunned', 'burning', 'enraged'
  turnsLeft: number;
  effect: string; // "+2 damage" ou "-3 defesa"
}
```

### Mecânicas novas
- **Posicionamento:** melee/ranged/cover/flanking afeta rolls
- **Stance:** offensive (+2 atk, -2 def), defensive, evasive
- **Conditions:** bleeding (dano/turno), stunned (perde turno), enraged (+damage), poisoned
- **Combo:** ações bem-sucedidas consecutivas aumentam combo (3+ = finisher disponível)
- **Cooldowns:** skills fortes não podem ser usadas todo turno
- **Ambiente:** pode usar objetos do cenário (arremessar mesa, derrubar lustre, empurrar em precipício)
- **Previsão:** IA mostra o que inimigo VAI fazer (player pode counter)
- **Finishers:** quando HP do inimigo < 20%, opção de finisher cinematográfico

### Progressão profunda
Skills com SINERGIA:
```
Espadachim + Reflexos → "Counter Attack" (desbloqueado)
Furtividade + Percepção → "Backstab Critical" (desbloqueado)
Sedução + Astúcia → "Manipulação Fatal" (desbloqueado)
```

Árvores que se CRUZAM quando combina 2+ skills do mesmo tier.

### Resultado
Combate com decisões reais, não só "ataco". Builds importam. Posição importa. Timing importa.

---

## Implementação por prioridade

### Sprint 1 (agora): Memória Profunda
- [x] Projetar fact store
- [ ] Criar extrator de fatos (pós-turno)
- [ ] NPC cards persistentes
- [ ] Injetar fatos relevantes no prompt
- [ ] Testar coerência em 30+ turnos

### Sprint 2: Simulação
- [ ] World tick system
- [ ] NPC agendas
- [ ] Eventos de fundo
- [ ] Rumores/descobertas
- [ ] Testar mundo mudando sem player

### Sprint 3: Combate
- [ ] Tactical combat state
- [ ] Posicionamento + stance
- [ ] Conditions + cooldowns
- [ ] Combo + finishers
- [ ] Sinergia de skills
- [ ] Testar combate

---

## Estimativa

| Sprint | Esforço | Impacto |
|--------|---------|---------|
| Memória | 4-5h | ⭐⭐⭐⭐⭐ (muda tudo) |
| Simulação | 3-4h | ⭐⭐⭐⭐ |
| Combate | 4-5h | ⭐⭐⭐⭐ |
| **Total** | ~12h | RPG de nível indie |

Começo pela memória agora?

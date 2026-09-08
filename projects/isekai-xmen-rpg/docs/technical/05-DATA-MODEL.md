# Data Model — SQLite Schemas

**Status:** Design fase 0

---

## Database Structure

```
isekai-xmen-rpg.db
├── character_saves       — savegames
├── characters           — character profiles (seeds para NPCs)
├── npcs                 — NPC definitions
├── npc_memory           — NPC interaction history
├── world_state          — global game state
├── factions             — facção standings
├── quests               — quest definitions
├── quest_progress       — quest state per save
├── events_log           — all game events
├── locations            — location definitions
└── relationships        — character × NPC affinity
```

---

## Core Schemas

### 1. character_saves

Savegame slots.

```sql
CREATE TABLE character_saves (
  id TEXT PRIMARY KEY,              -- 'save_abc123'
  name TEXT NOT NULL,               -- "Meu Herói"
  created_at DATETIME,
  updated_at DATETIME,
  
  -- Comprimido: snapshot completo
  world_state_json BLOB,            -- mundo atual
  character_json BLOB,              -- stats, pos, inventory
  npc_memory_json BLOB,             -- quem fez o quê
  faction_state_json BLOB,          -- rep com cada facção
  
  -- Metadata
  current_location_id TEXT,
  current_game_state TEXT,          -- "EXPLORATION", "COMBAT", etc
  playtime_seconds INT,
  x_gene_class TEXT,
  level INT,
  morality_score INT,               -- -100 a +100
  
  -- Event sourcing
  event_log_json BLOB,              -- últimos 100 eventos
  event_log_compressed_after_turn INT, -- at what turn it was compressed
  
  -- Schema version pra migration
  schema_version INT
);
```

### 2. characters

Permanente profile (created once).

```sql
CREATE TABLE characters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  origin_world_background TEXT,     -- mundano, militar, acadêmico, etc
  isekai_trigger TEXT,              -- como foi transportado
  x_gene_class TEXT,                -- qual dos 12
  x_gene_specialization TEXT,       -- sub-classe/modificação
  
  stats_json BLOB,                  -- {"STR": 14, "DEX": 12, ...}
  backstory TEXT,
  initial_moraliti INT,
  initial_traumas_json BLOB,        -- [{"name": "sibling death", "severity": 8}]
  
  created_at DATETIME,
  playtime_seconds INT,             -- tracked globally
  
  -- Stats globais (não per-save)
  total_deaths INT DEFAULT 0,
  total_quests_completed INT DEFAULT 0,
  relationships_count INT DEFAULT 0
);
```

### 3. npcs

NPCs definitions (static).

```sql
CREATE TABLE npcs (
  id TEXT PRIMARY KEY,              -- 'npc_rogue'
  name TEXT NOT NULL,
  x_gene_class TEXT,
  personality_big_five_json BLOB,   -- {"openness": 70, "conscientiousness": 45, ...}
  
  base_location_id TEXT,
  role_in_world TEXT,               -- "mutant leader", "antagonist", etc
  faction_id TEXT,
  
  backstory TEXT,
  traumas_json BLOB,
  fears_json BLOB,
  goals TEXT,
  
  -- Capabilities
  can_romance INT DEFAULT 0,
  can_betray INT DEFAULT 0,
  can_die INT DEFAULT 1,
  
  -- Relations to other NPCs
  relations_json BLOB,              -- {"ally_id": 50, "rival_id": -30}
  
  created_at DATETIME
);
```

### 4. npc_memory

What NPC remembers about the player.

```sql
CREATE TABLE npc_memory (
  id TEXT PRIMARY KEY,              -- 'nmem_rogue_42'
  npc_id TEXT,
  character_id TEXT (foreign key to characters),
  
  -- Interaction log (comprimido depois de 50)
  interactions_json BLOB,           -- [{"turn": 42, "action": "KISSED", "notes": "risky"}, ...]
  interactions_count INT,
  
  -- Affinity scores
  trust_score INT DEFAULT 0,        -- -100 a +100
  love_score INT DEFAULT 0,
  rival_score INT DEFAULT 0,
  loyalty_score INT DEFAULT 0,
  respect_score INT DEFAULT 0,
  
  -- Current state
  current_mood TEXT,                -- "happy", "angry", "conflicted"
  current_agenda TEXT,              -- o que quer do player
  will_betray INT DEFAULT 0,        -- flag de traição
  will_die_for_player INT DEFAULT 0, -- flag de sacrifício
  
  updated_at DATETIME
);
```

### 5. world_state

Snapshot da estado global.

```sql
CREATE TABLE world_state (
  id TEXT PRIMARY KEY DEFAULT 'current',  -- só 1 row por save
  save_id TEXT,
  
  current_time_json BLOB,           -- {"day": 42, "hour": 14, "minute": 30}
  current_weather TEXT,             -- "rainy", "sunny", "stormy"
  current_location_id TEXT,
  
  factions_state_json BLOB,         -- rep com todas as facções
  global_events_json BLOB,          -- eventos que afetaram mundo
  time_since_last_ambient INT,      -- trigger ambient events periodicamente
  
  updated_at DATETIME
);
```

### 6. relationships

Denormalizado por performance.

```sql
CREATE TABLE relationships (
  id TEXT PRIMARY KEY,
  character_id TEXT,
  npc_id TEXT,
  
  -- Scores (redundante com npc_memory mas desnormalizado pra query rápida)
  trust INT,
  love INT,
  rival INT,
  loyalty INT,
  respect INT,
  
  total_score INT,                  -- sum de tudo, pra sort rápido
  
  -- Milestones
  first_met_at_turn INT,
  last_interaction_turn INT,
  romance_unlocked INT DEFAULT 0,
  betrayal_happened INT DEFAULT 0,
  sacrifice_offered INT DEFAULT 0,
  
  updated_at DATETIME
);
```

### 7. events_log

Event sourcing completo.

```sql
CREATE TABLE events_log (
  id TEXT PRIMARY KEY,              -- 'event_abc123'
  save_id TEXT,
  turn INT,
  timestamp DATETIME,
  
  -- Event data (JSON pra flexibilidade)
  event_type TEXT,                  -- COMBAT_ATTACK, DIALOGUE_CHOICE, etc
  event_data_json BLOB,
  
  -- Consequences
  generated_events_json BLOB,       -- eventos secundários disparados
  
  created_at DATETIME
);
```

### 8. quests

Quest definitions.

```sql
CREATE TABLE quests (
  id TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  giver_npc_id TEXT,               -- who assigned the quest
  faction_id TEXT,
  
  xp_reward INT,
  credits_reward INT,
  item_reward_json BLOB,
  relationship_changes_json BLOB,  -- {"npc_id": {trust_delta: 20, ...}}
  
  is_main_quest INT DEFAULT 0,     -- story critical
  is_repeatable INT DEFAULT 0,
  
  prerequisites_json BLOB,         -- required quests to start
  prerequisite_level INT DEFAULT 0,
  
  objectives_json BLOB,            -- [{"type": "kill_count", "target": 5}, ...]
  
  created_at DATETIME
);
```

### 9. quest_progress

Per-save quest tracking.

```sql
CREATE TABLE quest_progress (
  id TEXT PRIMARY KEY,
  save_id TEXT,
  quest_id TEXT,
  
  started_at_turn INT,
  completed_at_turn INT,
  abandoned INT DEFAULT 0,
  
  progress_json BLOB,              -- current state of objectives
  
  updated_at DATETIME
);
```

---

## Backup & Migration Strategy

### Auto-backup

Antes de overwrite save:

```sql
INSERT INTO character_saves_backup
SELECT * FROM character_saves WHERE id = ?
```

Keep últimas 5 backups por save slot.

### Schema Migration

```typescript
// migrations/001_initial_schema.ts
export function up(db) {
  db.exec(CREATE TABLE character_saves ...);
  // ... resto
}

export function down(db) {
  // rollback
}
```

Rodado automaticamente no boot. Versão controlada via `schema_version` na save.

---

## Performance Indexes

```sql
CREATE INDEX idx_characters_name ON characters(name);
CREATE INDEX idx_npc_memory_npc_char ON npc_memory(npc_id, character_id);
CREATE INDEX idx_relationships_total ON relationships(total_score DESC);
CREATE INDEX idx_events_log_turn ON events_log(save_id, turn);
CREATE INDEX idx_quest_progress_save ON quest_progress(save_id);
```

---

## Serialization (JSON Blobs)

Zod schemas pra cada blob:

```typescript
const CharacterSchema = z.object({
  id: z.string(),
  name: z.string(),
  stats: z.record(z.number()),
  hp: z.number(),
  xp: z.number(),
  level: z.number(),
  position: z.object({ location_id: z.string() }),
  inventory: z.array(z.object({ item_id: z.string(), quantity: z.number() })),
  // ... mais
});

type Character = z.infer<typeof CharacterSchema>;

// Ao salvar
const json = JSON.stringify(character);
db.prepare('UPDATE character_saves SET character_json = ? WHERE id = ?')
  .run(json, save_id);

// Ao carregar
const row = db.prepare('SELECT character_json FROM character_saves WHERE id = ?')
  .get(save_id);
const character = CharacterSchema.parse(JSON.parse(row.character_json));
```

---

**Próximo:** `06-PROMPTS.md` (system prompt templates + versioning).

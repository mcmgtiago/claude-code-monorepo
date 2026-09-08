# Progressão — Stats, Perks, Leveling

**Status:** Design fase 0

---

## Atributos Base (6 stats)

```
STR (Strength)      — força bruta, dano melee, carry weight
DEX (Dexterity)     — velocidade, reflexo, esquiva, mira
CON (Constitution)  — HP, resistência a poison/disease, stamina
INT (Intelligence)  — hacking, crafting, deduction, trap detection
WIS (Wisdom)        — percepção, resistência mental, empathy read
CHA (Charisma)      — persuasão, intimidação, sedução, liderança
```

### Point-Buy System (character creation)

- Budget: **27 pontos**
- Range: **8** (mínimo) a **15** (máximo sem racial bonus)
- Cost table:

| Score | Cost |
|-------|------|
| 8 | 0 |
| 9 | 1 |
| 10 | 2 |
| 11 | 3 |
| 12 | 4 |
| 13 | 5 |
| 14 | 7 |
| 15 | 9 |

- **Modifier** = floor((score - 10) / 2)
- Mods: 8=-1, 9=-1, 10=0, 11=0, 12=+1, 13=+1, 14=+2, 15=+2

### X-Gene Bonus

Classe de mutação dá +2 em stat primário e +1 em secondário:

| X-Gene | Stat +2 | Stat +1 |
|--------|---------|---------|
| Telepatia | WIS | CHA |
| Telecinese | INT | DEX |
| Transformação Corporal | CON | STR |
| Regeneração | CON | WIS |
| Controle Elemental | DEX | INT |
| Empata Emocional | CHA | WIS |
| Sentidos Amplificados | WIS | DEX |
| Cura de Outras | WIS | CHA |
| Inteligência Aumentada | INT | WIS |
| Velocidade Aumentada | DEX | CON |
| Força Sobre-humana | STR | CON |
| Vício Adaptativo | CON | DEX |

---

## HP & Resources

### Hit Points

```
HP_max = (CON * 3) + (level * CON_modifier) + 10
HP at level 1 (CON 12): 12*3 + 1*1 + 10 = 47 HP
HP at level 10 (CON 14): 14*3 + 10*2 + 10 = 72 HP
```

### Mutation Energy (ME)

Recurso gasto ao usar X-gene powers.

```
ME_max = (INT + WIS) * 2 + level * 3
ME at level 1 (INT 12, WIS 10): (12+10)*2 + 1*3 = 47 ME
```

Recuperação:
- Short rest: +25% ME
- Long rest: +100% ME
- Overexertion: pode gastar além de 0 ME, mas cada ponto negativo = 1 trauma tick

### Stress

Recurso oculto que acumula com trauma/combate/decisões morais.

```
Stress 0-30:   Normal (sem efeitos)
Stress 31-60:  Anxious (roll disadvantage em WIS checks)
Stress 61-80:  Strained (-2 CHA, NPC interactions harder)
Stress 81-95:  Breaking (roll CON save or panic attack mid-scene)
Stress 96-100: Broken (forçado a REST, cutscene de colapso)
```

Redução de stress: rest, romance positivo, terapia (NPC specific), meditação, música.

---

## Level Up

### XP Table

| Level | XP Required | Cumulative |
|-------|-------------|-----------|
| 1 → 2 | 300 | 300 |
| 2 → 3 | 500 | 800 |
| 3 → 4 | 800 | 1,600 |
| 4 → 5 | 1,000 | 2,600 |
| 5 → 6 | 1,500 | 4,100 |
| 6 → 7 | 2,000 | 6,100 |
| 7 → 8 | 2,500 | 8,600 |
| 8 → 9 | 3,000 | 11,600 |
| 9 → 10 | 4,000 | 15,600 |
| 10 → 11 | 5,000 | 20,600 |
| 11 → 12 | 6,000 | 26,600 |
| 12 → 13 | 7,000 | 33,600 |
| 13 → 14 | 8,000 | 41,600 |
| 14 → 15 | 9,000 | 50,600 |
| 15 → 16 | 10,000 | 60,600 |
| 16 → 17 | 12,000 | 72,600 |
| 17 → 18 | 14,000 | 86,600 |
| 18 → 19 | 16,000 | 102,600 |
| 19 → 20 | 20,000 | 122,600 |

### On Level Up

1. **+1 stat point** (freely allocated, max 20)
2. **+1 perk** (choose from available list)
3. **HP increases** (per formula)
4. **ME increases** (per formula)
5. **New X-gene ability unlocked** (every 3 levels)

---

## Perk Trees

### Combat Perks

| Perk | Prereq | Effect |
|------|--------|--------|
| **Iron Will** | CON 12+ | +20 max HP |
| **Quick Draw** | DEX 13+ | +2 initiative |
| **Berserker** | STR 14+ | Below 25% HP: +3 damage |
| **Second Wind** | Level 5+ | Once per rest: heal 30% HP |
| **Mutation Surge** | Level 7+ | Overclock X-gene: 2x power, 2x cost |
| **Lethal Focus** | Level 10+ | Critical on 19 or 20 (not just 20) |
| **Last Stand** | Level 15+ | At 0 HP: one final action before falling |

### Social Perks

| Perk | Prereq | Effect |
|------|--------|--------|
| **Silver Tongue** | CHA 12+ | +3 persuasion |
| **Mind Reader** | Telepatia class | Detect lies automatically |
| **Intimidating Presence** | STR or CHA 14+ | Some enemies flee without combat |
| **Seductive** | CHA 14+ | Romance options unlock faster |
| **Faction Broker** | Level 8+ | Can change faction rep by negotiation |
| **Inspiring Leader** | Level 12+ | Allies in combat get +2 morale |
| **Untouchable** | Level 15+ | Immune to mind control (social) |

### Exploration Perks

| Perk | Prereq | Effect |
|------|--------|--------|
| **Eagle Eye** | WIS 12+ | See hidden items/passages |
| **Safe Passage** | DEX 12+ | Avoid traps automatically |
| **Polyglot** | INT 13+ | Understand all languages |
| **Street Wise** | CHA 12+ | Prices 20% cheaper, info easier |
| **Mutation Sense** | WIS 14+ | Detect other mutants nearby |
| **World Walker** | Level 10+ | Fast travel costs 50% less time |
| **Legend** | Level 15+ | NPCs know your reputation before meeting |

### X-Gene Evolution Perks (unique per class)

Unlocked at levels 3, 6, 9, 12, 15, 18. 

**Example: Telepatia tree**

```
Lv 3:  Surface Read     — Read surface thoughts (1 ME)
Lv 6:  Deep Probe       — Enter subconscious (5 ME, risky)
Lv 9:  Mind Shield      — Block other telepaths
Lv 12: Mass Suggestion  — Influence crowd (20 ME)
Lv 15: Memory Edit      — Alter NPC memory (30 ME, permanent)
Lv 18: Psychic Storm    — Incapacitate all in range (50 ME, devastating)
```

Cada classe tem 6 evoluções. Documentar completamente em `12-X-GENE-CLASSES.md`.

---

## Inventory & Equipment

### Slots

```
Head:    helmet, visor, mask
Body:    armor, jacket, suit
Hands:   gloves, gauntlets
Legs:    pants, boots
Carry:   backpack (6 item slots)
Special: 1 X-gene focus item (enhances power)
```

### Item Types

- **Weapons:** Knife, pistol, staff, improvised (chair, bottle)
- **Armor:** Kevlar, unstable molecule suit, energy shield device
- **Consumables:** Med-kit, stimulant, ME-restorer
- **Key items:** Quest items, access cards, passwords
- **X-gene Focus:** Cerebro link (telepathy), kinetic amplifier (TK)

### Economy

- Currency: **Credits (₡)**
- Earn: quests, favors, faction rewards, crime
- Spend: gear, healing, travel, information, bribes
- Not dominant (RPG is about choices, not shop management)

---

## Skill Checks

### How Checks Work

```
Player attempts action with uncertain outcome.
Roll = d20 + stat_modifier + proficiency (if applicable) + situational
vs. DC (set by engine based on difficulty)

Result:
  Critical fail (nat 1): Bad outcome + complication
  Fail (< DC): Action fails, narrative consequence
  Success (≥ DC): Action succeeds
  Critical success (nat 20): Extraordinary success + bonus
```

### Proficiencies

Gained via background + perks:

- Athletics (STR)
- Stealth (DEX)
- Endurance (CON)
- Investigation (INT)
- Perception (WIS)
- Persuasion (CHA)
- Intimidation (STR or CHA)
- Deception (CHA)
- Technology (INT)
- Medicine (WIS or INT)
- Survival (WIS)
- Seduction (CHA)

Proficient = +2 bonus. Expert (perk) = +4.

---

**Próximo:** `22-COMBAT.md` (combat resolution detalhado).

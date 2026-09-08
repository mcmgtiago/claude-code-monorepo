export const GAME_TOOLS = [
  {
    name: 'roll_check',
    description: 'Rola d20 + modificador contra DC. Use quando resultado é incerto: combate, intriga, sedução, furtividade, sobrevivência. CALIBRE DC pelo nível do personagem.',
    input_schema: {
      type: 'object',
      properties: {
        attribute: { type: 'string', enum: ['forca', 'destreza', 'resistencia', 'astucia', 'comando', 'seducao', 'percepcao', 'vontade'] },
        dc: { type: 'integer', description: 'DC: trivial 5, fácil 10, médio 15, difícil 20, heroico 25, lendário 30.' },
        reason: { type: 'string' },
        advantage: { type: 'string', enum: ['normal', 'vantagem', 'desvantagem'] },
      },
      required: ['attribute', 'dc', 'reason'],
    },
  },
  {
    name: 'apply_changes',
    description: 'Registra mudanças no estado. HP, XP, ouro, local, tempo, honra, reputação, alianças, exércitos, títulos.',
    input_schema: {
      type: 'object',
      properties: {
        hp_delta: { type: 'integer' },
        stress_delta: { type: 'integer' },
        xp_gain: { type: 'integer' },
        honor_delta: { type: 'integer', description: 'Mudança de honra (-100 a +100). Atos nobres +, traições -.' },
        gold_delta: { type: 'integer', description: 'Dragões de ouro ganhos/gastos.' },
        armies_delta: { type: 'integer', description: 'Soldados ganhos/perdidos.' },
        location: { type: 'string' },
        region: { type: 'string' },
        time_of_day: { type: 'string' },
        season: { type: 'string' },
        weather: { type: 'string' },
        day_delta: { type: 'integer' },
        title: { type: 'string', description: 'Novo título ganho.' },
        add_land: { type: 'string', description: 'Terra conquistada/herdada.' },
        add_alliance: { type: 'string', description: 'Nova casa aliada.' },
        add_enemy: { type: 'string', description: 'Nova casa inimiga.' },
        learn_techniques: {
          type: 'array',
          items: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' }, attribute: { type: 'string' }, description: { type: 'string' } }, required: ['id', 'name', 'attribute', 'description'] },
        },
        add_items: {
          type: 'array',
          items: { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' }, quantity: { type: 'integer' }, rarity: { type: 'string', enum: ['comum', 'bom', 'raro', 'valyrian', 'lendário'] } }, required: ['name', 'description'] },
        },
        reputation_changes: {
          type: 'array',
          items: { type: 'object', properties: { faction: { type: 'string' }, delta: { type: 'integer' } }, required: ['faction', 'delta'] },
        },
        relationships: {
          type: 'array',
          items: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' }, house: { type: 'string' }, affinity_delta: { type: 'integer' }, notes: { type: 'string' }, romantic: { type: 'boolean' }, milestone: { type: 'string' } } },
        },
        war_status: { type: 'string' },
        current_king: { type: 'string' },
        set_flags: { type: 'object', additionalProperties: { type: 'string' } },
        scene_npc: { type: ['string', 'null'] },
      },
    },
  },
  {
    name: 'manage_combat',
    description: 'Combate estruturado: start, damage, heal, advance_round, end.',
    input_schema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['start', 'damage', 'heal', 'advance_round', 'end'] },
        enemies: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' }, level: { type: 'integer' }, hp: { type: 'integer' } }, required: ['name', 'level'] } },
        enemy_id: { type: 'string' },
        amount: { type: 'integer' },
      },
      required: ['action'],
    },
  },
  {
    name: 'manage_quest',
    description: 'Missões: start, complete, fail.',
    input_schema: {
      type: 'object',
      properties: { action: { type: 'string', enum: ['start', 'complete', 'fail'] }, quest_id: { type: 'string' }, title: { type: 'string' }, description: { type: 'string' }, giver: { type: 'string' } },
      required: ['action'],
    },
  },
  {
    name: 'offer_crossroad',
    description: 'Encruzilhada política/moral. 2-4 opções com consequências reais. ENCERRE turno após oferecer.',
    input_schema: {
      type: 'object',
      properties: { prompt: { type: 'string' }, options: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 4 } },
      required: ['prompt', 'options'],
    },
  },
  {
    name: 'create_character',
    description: 'Cria ficha do personagem GoT.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'integer' },
        house: { type: 'string' },
        era: { type: 'string' },
        tier: { type: 'string', enum: ['plebeu', 'cavaleiro', 'nobre_menor', 'nobre_maior', 'rei'] },
        title: { type: 'string' },
        background: { type: 'string' },
        appearance: { type: 'string' },
        personality: { type: 'string' },
        magic_type: { type: 'string', description: 'nenhuma, warg, vidente, sacerdote_rhllor, sangue_valyrio, rostos_sem_nome, personalizada' },
        magic_description: { type: 'string' },
        attributes: { type: 'object', properties: { forca: { type: 'integer' }, destreza: { type: 'integer' }, resistencia: { type: 'integer' }, astucia: { type: 'integer' }, comando: { type: 'integer' }, seducao: { type: 'integer' }, percepcao: { type: 'integer' }, vontade: { type: 'integer' } } },
      },
      required: ['name', 'house', 'era', 'tier'],
    },
  },
  {
    name: 'record_kill',
    description: 'Registra morte causada pelo personagem.',
    input_schema: {
      type: 'object',
      properties: { victim: { type: 'string' }, context: { type: 'string' }, honor_impact: { type: 'integer' } },
      required: ['victim'],
    },
  },
  {
    name: 'learn_skill',
    description: 'Ensina nova habilidade ao personagem. Use quando: treinar com mestre, sobreviver situação extrema, level up, praticar repetidamente. ÁRVORES: combate (espada/arco/defesa), furtividade (roubo/veneno/assassinato), social (sedução/intimidação/manipulação), sobrevivencia (caça/cura/cavalgar), conhecimento (estratégia/idiomas/espionagem), magia (warg/visões/fogo).',
    input_schema: {
      type: 'object',
      properties: {
        skill_name: { type: 'string', description: 'Nome da skill (do catálogo ou criada): Espadachim, Veneno, Olhar Sedutor, Manipulador, Assassinato Silencioso, etc.' },
        tree: { type: 'string', enum: ['combate', 'furtividade', 'social', 'sobrevivencia', 'conhecimento', 'magia'] },
        reason: { type: 'string', description: 'Por que aprendeu (treino, experiência, mestre, trauma).' },
      },
      required: ['skill_name', 'tree', 'reason'],
    },
  },
] as const;

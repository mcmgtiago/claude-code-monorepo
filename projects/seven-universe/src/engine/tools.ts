// Tools genéricas que funcionam com qualquer universo
import type { Universe } from '../universes/types';

export function buildGameTools(universe: Universe) {
  const attrEnum = universe.attributes.map(a => a.key);

  return [
    {
      name: 'roll_check',
      description: 'Rola d20 + modificador contra DC. Use quando resultado é incerto. CALIBRE DC pelo nível.',
      input_schema: {
        type: 'object',
        properties: {
          attribute: { type: 'string', enum: attrEnum },
          dc: { type: 'integer', description: 'trivial 5, fácil 10, médio 15, difícil 20, heroico 25, lendário 30.' },
          reason: { type: 'string' },
          advantage: { type: 'string', enum: ['normal', 'vantagem', 'desvantagem'] },
        },
        required: ['attribute', 'dc', 'reason'],
      },
    },
    {
      name: 'apply_changes',
      description: 'Registra mudanças. HP, energia, XP, moral, local, tempo, reputação. SEMPRE registre NPCs novos em relationships (nome, facção, afinidade).',
      input_schema: {
        type: 'object',
        properties: {
          hp_delta: { type: 'integer' },
          energy_delta: { type: 'integer' },
          stress_delta: { type: 'integer' },
          xp_gain: { type: 'integer' },
          morality_delta: { type: 'integer' },
          location: { type: 'string' },
          region: { type: 'string' },
          time_of_day: { type: 'string' },
          weather: { type: 'string' },
          day_delta: { type: 'integer' },
          rank: { type: 'string' },
          advance_power_stage: { type: 'boolean' },
          add_alliance: { type: 'string' },
          add_enemy: { type: 'string' },
          learn_techniques: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' }, attribute: { type: 'string' }, description: { type: 'string' } }, required: ['name', 'attribute', 'description'] } },
          add_items: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' }, quantity: { type: 'integer' }, rarity: { type: 'string' } }, required: ['name', 'description'] } },
          reputation_changes: { type: 'array', items: { type: 'object', properties: { faction: { type: 'string' }, delta: { type: 'integer' } }, required: ['faction', 'delta'] } },
          relationships: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, faction: { type: 'string' }, affinity_delta: { type: 'integer' }, notes: { type: 'string' }, romantic: { type: 'boolean' }, milestone: { type: 'string' } } } },
          set_flags: { type: 'object', additionalProperties: { type: 'string' } },
          scene_npc: { type: ['string', 'null'] },
        },
      },
    },
    {
      name: 'manage_combat',
      description: 'Combate: start, damage, advance_round, end.',
      input_schema: { type: 'object', properties: { action: { type: 'string', enum: ['start', 'damage', 'advance_round', 'end'] }, enemies: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, level: { type: 'integer' }, hp: { type: 'integer' } }, required: ['name', 'level'] } }, enemy_id: { type: 'string' }, amount: { type: 'integer' } }, required: ['action'] },
    },
    {
      name: 'manage_quest',
      description: 'Missões: start, complete, fail.',
      input_schema: { type: 'object', properties: { action: { type: 'string', enum: ['start', 'complete', 'fail'] }, title: { type: 'string' }, description: { type: 'string' }, giver: { type: 'string' } }, required: ['action'] },
    },
    {
      name: 'offer_crossroad',
      description: 'Encruzilhada 2-4 opções. ENCERRE turno após oferecer.',
      input_schema: { type: 'object', properties: { prompt: { type: 'string' }, options: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 4 } }, required: ['prompt', 'options'] },
    },
    {
      name: 'create_character',
      description: 'Cria ficha do personagem.',
      input_schema: {
        type: 'object',
        properties: {
          name: { type: 'string' }, age: { type: 'integer' }, sex: { type: 'string', enum: ['masculino', 'feminino'] },
          background: { type: 'string' }, appearance: { type: 'string' }, personality: { type: 'string' },
          power_type: { type: 'string' }, power_description: { type: 'string' },
          tier: { type: 'string' }, rank: { type: 'string' },
          attributes: { type: 'object' },
        },
        required: ['name'],
      },
    },
    {
      name: 'learn_skill',
      description: `Ensina habilidade nova. Skills disponíveis: ${universe.skills.map(s => s.name).join(', ')}. Ou crie custom.`,
      input_schema: { type: 'object', properties: { skill_name: { type: 'string' }, tree: { type: 'string' }, reason: { type: 'string' } }, required: ['skill_name', 'reason'] },
    },
    {
      name: 'record_kill',
      description: 'Registra morte.',
      input_schema: { type: 'object', properties: { victim: { type: 'string' }, morality_impact: { type: 'integer' } }, required: ['victim'] },
    },
  ];
}

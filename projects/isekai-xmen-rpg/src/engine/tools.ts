// Ferramentas que o Mestre (IA) pode chamar. O motor executa deterministicamente.
import type { Attribute } from './state';

export const GAME_TOOLS = [
  {
    name: 'roll_check',
    description: 'Rola d20 + modificador de atributo contra uma DC. Chame SEMPRE que o resultado de uma ação for incerto e relevante.',
    input_schema: {
      type: 'object',
      properties: {
        attribute: {
          type: 'string',
          enum: ['forca', 'velocidade', 'resistencia', 'poder', 'controle', 'percepcao', 'vontade', 'presenca'],
          description: 'Atributo mais apropriado para o teste.',
        },
        dc: {
          type: 'integer',
          description: 'Dificuldade: trivial 5, fácil 10, médio 15, difícil 20, heroico 25, lendário 30.',
        },
        reason: {
          type: 'string',
          description: 'O que está sendo testado.',
        },
        advantage: {
          type: 'string',
          enum: ['normal', 'vantagem', 'desvantagem'],
        },
      },
      required: ['attribute', 'dc', 'reason'],
    },
  },
  {
    name: 'apply_changes',
    description: 'Registra mudanças mecânicas no estado. Inclua APENAS o que realmente mudou neste turno.',
    input_schema: {
      type: 'object',
      properties: {
        hp_delta: { type: 'integer', description: 'Variação de HP (negativo = dano).' },
        energy_delta: { type: 'integer', description: 'Variação de energia mutante.' },
        stress_delta: { type: 'integer', description: 'Variação de stress.' },
        xp_gain: { type: 'integer', description: 'XP concedido.' },
        morality_delta: { type: 'integer', description: 'Variação de moralidade.' },
        location: { type: 'string', description: 'Novo local.' },
        region: { type: 'string', description: 'Nova região.' },
        time_of_day: { type: 'string' },
        weather: { type: 'string' },
        day_delta: { type: 'integer' },
        rank: { type: 'string' },
        advance_power_stage: { type: 'boolean', description: 'Avança estágio de poder.' },
        learn_techniques: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              attribute: { type: 'string', enum: ['forca', 'velocidade', 'resistencia', 'poder', 'controle', 'percepcao', 'vontade', 'presenca'] },
              description: { type: 'string' },
              energy_cost: { type: 'integer' },
            },
            required: ['id', 'name', 'attribute', 'description'],
          },
        },
        add_items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
              quantity: { type: 'integer' },
              rarity: { type: 'string', enum: ['comum', 'incomum', 'raro', 'épico', 'lendário'] },
            },
            required: ['name', 'description'],
          },
        },
        reputation_changes: {
          type: 'array',
          items: {
            type: 'object',
            properties: { faction: { type: 'string' }, delta: { type: 'integer' } },
            required: ['faction', 'delta'],
          },
        },
        relationships: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              faction: { type: 'string' },
              affinity_delta: { type: 'integer' },
              notes: { type: 'string' },
              romantic: { type: 'boolean' },
              milestone: { type: 'string' },
            },
          },
        },
        scene_npc: { type: ['string', 'null'] },
      },
    },
  },
  {
    name: 'manage_combat',
    description: 'Gerencia combate estruturado: start (cria inimigos), damage/heal (ajusta HP de inimigo), advance_round, end.',
    input_schema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['start', 'damage', 'heal', 'advance_round', 'end'],
        },
        enemies: {
          type: 'array',
          description: 'Para action=start: lista de inimigos.',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
              level: { type: 'integer' },
              hp: { type: 'integer' },
            },
            required: ['name', 'level'],
          },
        },
        enemy_id: { type: 'string', description: 'ID do inimigo para damage/heal.' },
        amount: { type: 'integer', description: 'Quantidade de dano/cura.' },
      },
      required: ['action'],
    },
  },
  {
    name: 'manage_quest',
    description: 'Gerencia diário de missões: start, complete, fail.',
    input_schema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['start', 'complete', 'fail'] },
        quest_id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        giver: { type: 'string' },
      },
      required: ['action'],
    },
  },
  {
    name: 'offer_crossroad',
    description: 'Oferece uma encruzilhada ao jogador — 2 a 4 opções concretas como botões. Use em momentos de virada. ENCERRE o turno após oferecer.',
    input_schema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'O dilema/situação.' },
        options: {
          type: 'array',
          items: { type: 'string' },
          description: '2 a 4 caminhos.',
          minItems: 2,
          maxItems: 4,
        },
      },
      required: ['prompt', 'options'],
    },
  },
  {
    name: 'create_character',
    description: 'Cria a ficha do personagem após coletar dados via conversa. Chame quando tiver nome, background, poder e personalidade.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'integer' },
        background: { type: 'string', description: 'Vida antes do transporte.' },
        appearance: { type: 'string' },
        personality: { type: 'string' },
        race: { type: 'string', enum: ['humano_puro', 'mutante'] },
        tier: { type: 'string', enum: ['novato', 'veterano', 'elite', 'omega'] },
        power_class: { type: 'string', description: 'Classe do X-Gene ou "personalizado" ou "nenhum".' },
        power_description: { type: 'string', description: 'Descrição do poder.' },
        power_element: { type: 'string', description: 'Tema/elemento do poder.' },
        power_weakness: { type: 'string', description: 'Fraqueza narrativa.' },
        attributes: {
          type: 'object',
          description: 'Atributos base do personagem (usar os valores informados na config).',
          properties: {
            forca: { type: 'integer' }, velocidade: { type: 'integer' }, resistencia: { type: 'integer' },
            poder: { type: 'integer' }, controle: { type: 'integer' }, percepcao: { type: 'integer' },
            vontade: { type: 'integer' }, presenca: { type: 'integer' },
          },
        },
      },
      required: ['name', 'background', 'race'],
    },
  },
  {
    name: 'evolve_power',
    description: 'Avança o estágio de poder do personagem (dormente→despertar→base→avancado→omega). Use em momentos épicos: desespero extremo, check crítico de vontade, treinamento prolongado, trauma emocional intenso. RARO e significativo.',
    input_schema: {
      type: 'object',
      properties: {
        reason: { type: 'string', description: 'Motivo narrativo da evolução (o que triggou).' },
        new_technique: {
          type: 'object',
          description: 'Nova técnica desbloqueada com a evolução (opcional).',
          properties: {
            name: { type: 'string' },
            attribute: { type: 'string', enum: ['forca', 'velocidade', 'resistencia', 'poder', 'controle', 'percepcao', 'vontade', 'presenca'] },
            description: { type: 'string' },
            energy_cost: { type: 'integer' },
          },
          required: ['name', 'attribute', 'description'],
        },
        reveal_ability: { type: 'string', description: 'Habilidade principal revelada/desbloqueada (preenche primaryAbility ou evolvedAbility do X-Gene).' },
        energy_boost: { type: 'integer', description: 'Aumento permanente de energyMax (tipicamente +10 a +30).' },
      },
      required: ['reason'],
    },
  },
  {
    name: 'record_kill',
    description: 'Registra que o personagem matou alguém. Afeta moralidade e tracking.',
    input_schema: {
      type: 'object',
      properties: {
        victim: { type: 'string', description: 'Quem morreu.' },
        context: { type: 'string', description: 'Contexto (defesa, assassinato frio, acidental).' },
        morality_impact: { type: 'integer', description: 'Impacto na moralidade (-20 assassinato frio, -5 defesa, 0 monstro/sentinela).' },
      },
      required: ['victim'],
    },
  },
] as const;

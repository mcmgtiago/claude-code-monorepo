import type { NpcTables } from '../types';

export const MHA_NPC_TABLES: NpcTables = {
  names: [
    'Sero', 'Ojiro', 'Koda', 'Sato', 'Shoji', 'Aoyama', 'Hagakure', 'Mineta',
    'Tokoyami', 'Monoma', 'Kendo', 'Tetsutetsu', 'Shinso', 'Shoda', 'Kuroiro',
    'Pony', 'Reiko', 'Juzo', 'Kojiro', 'Manga', 'Rin', 'Yosetsu',
    'Snipe', 'Ectoplasm', 'Cementoss', 'Vlad King', 'Thirteen', 'Recovery Girl', 'Lunch Rush',
  ],
  roles: [
    'estudante de herói', 'herói profissional iniciante', 'vilão de rua', 'civil comum',
    'sidekick de agência', 'repórter', 'policial', 'estudante de suporte',
    'guarda de segurança', 'comerciante local', 'vilão menor da Liga',
    'professor da U.A.', 'agente da Comissão', 'estudante de escola rival', 'aspirante a herói',
  ],
  traits: [
    'confiante', 'nervoso', 'ambicioso', 'covarde', 'leal', 'arrogante',
    'gentil', 'sarcástico', 'idealista', 'cínico', 'protetor',
    'imprudente', 'disciplinado', 'sonhador', 'oportunista',
  ],
  appearance: {
    build: ['atlético e ágil', 'musculoso', 'baixo e nervoso', 'alto e imponente', 'compleição comum'],
    hair: ['cabelo colorido espetado', 'penteado extravagante', 'cabelo curto comum', 'estilo chamativo de herói', 'careca'],
    clothing: ['uniforme escolar da U.A.', 'traje de herói colorido', 'roupa casual urbana', 'terno de profissional', 'roupa remendada de vilão'],
    detail: ['tem uma mutação corporal visível (Quirk)', 'usa acessório temático de herói', 'aura de determinação', 'cicatriz de batalha', 'olhar de quem já enfrentou vilões'],
  },
};

import type { NpcTables } from '../types';

export const GOT_NPC_TABLES: NpcTables = {
  names: [
    'Rodrik', 'Jory', 'Lyanna', 'Benjen', 'Luwin', 'Osha', 'Hodor', 'Jojen',
    'Meera', 'Talisa', 'Ros', 'Shae', 'Pyp', 'Edd', 'Grenn', 'Olly',
    'Qyburn', 'Pycelle', 'Barristan', 'Jaqen', 'Syrio', 'Ser Loras',
    'Hound-b', 'Podrick', 'Gendry', 'Hot Pie', 'Walder-b', 'Selyse',
    'Randyll', 'Dickon',
  ],
  roles: [
    'guarda de castelo', 'aldeão camponês', 'cavaleiro errante', 'servo de taverna',
    'mercenário sem bandeira', 'ladrão de estrada', 'meistre aprendiz', 'comerciante viajante',
    'soldado Lannister/Stark/Baratheon', 'cortesã de bordel', 'septão/septã',
    'ferreiro de aldeia', 'senhor menor', 'pescador de vila costeira', 'patrulheiro da Noite',
  ],
  traits: [
    'honrado', 'traiçoeiro', 'ambicioso', 'covarde', 'leal', 'ganancioso',
    'cínico', 'devoto', 'pragmático', 'cruel', 'protetor', 'supersticioso',
    'oportunista', 'melancólico', 'desconfiado',
  ],
  appearance: {
    build: ['magro e curtido', 'corpulento e forte', 'baixo e ágil', 'alto e imponente', 'compleição de soldado'],
    hair: ['cabelo escuro desgrenhado', 'barba ruiva', 'cabelo grisalho amarrado', 'careca', 'cabelo loiro (sangue Lannister?)'],
    clothing: ['cota de malha e tabardo', 'roupas de camponês rústicas', 'vestido de servo', 'capote pesado de viajante', 'armadura de couro e espada'],
    detail: ['tem brasão de casa menor no peito', 'cicatriz de guerra', 'cheira a fumaça e cerveja', 'carrega um dirk (adaga)', 'usa um feroz na veste de um lorde'],
  },
};

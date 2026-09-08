import type { NpcTables } from '../types';

export const WITCHER_NPC_TABLES: NpcTables = {
  names: [
    'Bertram', 'Odo', 'Gwen', 'Haren', 'Sile', 'Vattier', 'Fringilla', 'Rience',
    'Coen', 'Berengar', 'Aiden', 'Milva', 'Cahir', 'Angouleme', 'Percival',
    'Vysogota', 'Stjepan', 'Bran', 'Skjall', 'Gremist', 'Fritz', 'Elsa',
    'Radovid', 'Menno', 'Assire', 'Ida', 'Iorveth', 'Saskia', 'Dethmold', 'Henselt',
  ],
  roles: [
    'aldeão camponês', 'guarda de cidade', 'mercador viajante', 'bandido de estrada',
    'caçador de monstros amador', 'mago errante', 'ferreiro de aldeia', 'taverneiro',
    'soldado nilfgaardiano', 'refugiado de guerra', 'druida', 'contrabandista',
    'nobre menor', 'sacerdote de Melitele', 'mercenário', 'elfo Scoia\'tael',
  ],
  traits: [
    'desconfiado', 'ganancioso', 'corajoso', 'covarde', 'supersticioso', 'leal',
    'amargo', 'pragmático', 'honrado', 'cruel', 'sábio', 'oportunista',
    'protetor', 'cínico', 'devoto',
  ],
  appearance: {
    build: ['magro e curtido', 'robusto', 'baixo e forte', 'alto e esguio', 'compleição comum'],
    hair: ['cabelo grisalho amarrado', 'cabelo escuro sujo', 'careca', 'trança medieval', 'cabelo ruivo desgrenhado'],
    clothing: ['roupas de lã de camponês', 'armadura de couro batido', 'túnica de mago', 'trajes de mercador', 'cota de malha de soldado'],
    detail: ['tem uma cicatriz de guerra', 'usa amuleto contra monstros', 'cheira a hidromel e fumaça', 'olhos cansados de tempos difíceis', 'medalhão ou brasão da região'],
  },
};

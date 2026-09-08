import type { NpcTables } from '../types';

export const SKYRIM_NPC_TABLES: NpcTables = {
  names: [
    'Bjorn', 'Sigrid', 'Torvar', 'Ingrid', 'Ulfgar', 'Runa', 'Gunmar', 'Astrid-b',
    'Vilkas', 'Ria', 'Njada', 'Athis', 'Faendal', 'Sven', 'Camilla', 'Hadvar',
    'Gerdur', 'Alvor', 'Sondas', 'Adrianne', 'Ysolda', 'Mikael', 'Uthgerd',
    'Belethor', 'Carlotta', 'Brenuin', 'Nazeem-b', 'Idolaf', 'Olfrid', 'Vignar',
  ],
  roles: [
    'guarda de cidade', 'aldeão fazendeiro', 'mercenário', 'bandido de caverna',
    'mago do Colégio', 'ferreiro', 'taverneiro', 'caçador',
    'soldado (Império ou Stormcloak)', 'mercador', 'sacerdote de Talos ou Divino',
    'ladrão da guilda', 'minerador', 'aventureiro errante', 'nobre menor da corte',
  ],
  traits: [
    'orgulhoso (Nord)', 'desconfiado', 'corajoso', 'ganancioso', 'supersticioso', 'leal',
    'rude', 'pragmático', 'honrado', 'ranzinza', 'sábio', 'oportunista',
    'protetor', 'cínico', 'devoto a Talos',
  ],
  appearance: {
    build: ['robusto e forte (Nord)', 'magro e ágil', 'baixo e resistente', 'alto e imponente', 'compleição comum'],
    hair: ['cabelo loiro trançado', 'barba grisalha', 'careca com tatuagens de guerra', 'cabelo escuro amarrado', 'juba ruiva selvagem'],
    clothing: ['armadura de aço com peles', 'roupas de fazendeiro de lã', 'robes do Colégio de Winterhold', 'couro de bandido', 'túnica de mercador'],
    detail: ['tem cicatriz de batalha com dragão', 'usa amuleto de um Divino', 'cheira a hidromel e fumaça', 'sotaque nórdico carregado', 'olhar endurecido pelo frio'],
  },
};

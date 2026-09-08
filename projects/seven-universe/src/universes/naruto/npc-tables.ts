import type { NpcTables } from '../types';

// Tabelas para geração procedural de NPCs menores de Naruto.
export const NARUTO_NPC_TABLES: NpcTables = {
  names: [
    'Hayato', 'Rin', 'Kenji', 'Aoi', 'Daichi', 'Sora', 'Ren', 'Yui',
    'Takeshi', 'Mika', 'Haru', 'Nao', 'Kaede', 'Riku', 'Sana', 'Tora',
    'Genma', 'Raidou', 'Izumo', 'Kotetsu', 'Ebisu', 'Hana', 'Moegi', 'Udon',
    'Konohamaru', 'Tsubaki', 'Jiro', 'Kenta', 'Ayame', 'Teuchi',
  ],
  roles: [
    'genin recém-formado', 'chunin de patrulha', 'mercador de armas ninja', 'dono de barraca de ramen',
    'guarda do portão', 'aldeão civil', 'mensageiro', 'ferreiro de kunai',
    'médico da vila', 'espião de baixo escalão', 'caçador-nin', 'instrutor da academia',
    'ronin sem vila', 'bandido de estrada', 'comerciante viajante',
  ],
  traits: [
    'nervoso', 'orgulhoso', 'calmo', 'ambicioso', 'covarde', 'leal',
    'sarcástico', 'ingênuo', 'desconfiado', 'brincalhão', 'sério', 'ganancioso',
    'protetor', 'preguiçoso', 'disciplinado',
  ],
  appearance: {
    build: ['magro e ágil', 'corpo musculoso', 'baixo e atarracado', 'alto e esguio', 'compleição média'],
    hair: ['cabelo preto espetado', 'rabo de cavalo castanho', 'cabelo raspado', 'franja cobrindo os olhos', 'cabelo loiro bagunçado'],
    clothing: ['colete chunin verde', 'roupa ninja preta', 'kimono simples de aldeão', 'casaco com símbolo do clã', 'traje de patrulha com protetor de testa'],
    detail: ['tem uma cicatriz de kunai no rosto', 'usa protetor de testa arranhado', 'carrega um pergaminho velho', 'tem bandagens no braço', 'olhos alertas de quem já lutou'],
  },
};

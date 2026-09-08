import type { NpcTables } from '../types';

export const XMEN_NPC_TABLES: NpcTables = {
  names: [
    'Marcus', 'Selene', 'Dax', 'Tania', 'Kane', 'Lila', 'Vic', 'Nadia',
    'Grant', 'Riko', 'Owen', 'Sasha', 'Cole', 'Mira', 'Dorian', 'Yara',
    'Blink-esque', 'Warpath', 'Sunspot', 'Cannonball', 'Boom-Boom', 'Skids',
    'Rusty', 'Leech', 'Artie', 'Caliban', 'Callisto', 'Forge', 'Banshee', 'Multiple',
  ],
  roles: [
    'mutante recém-desperto', 'agente da MRD (anti-mutante)', 'aluno da Mansão X', 'morador dos túneis Morlock',
    'humano assustado', 'cientista de laboratório', 'mercenário mutante', 'membro do Hellfire Club',
    'seguidor de Magneto (Acolyte)', 'refugiado de Genosha', 'jornalista investigando mutantes',
    'ripper de rua com poderes', 'ativista pró-mutante', 'guarda de Weapon X', 'fugitivo do governo',
  ],
  traits: [
    'assustado', 'orgulhoso do poder', 'ressentido', 'idealista', 'leal', 'ganancioso',
    'traumatizado', 'sarcástico', 'fanático', 'pragmático', 'protetor',
    'imprudente', 'desconfiado', 'esperançoso', 'amargo',
  ],
  appearance: {
    build: ['atlético', 'magro e ágil', 'musculoso', 'compleição comum', 'alto e imponente'],
    hair: ['cabelo colorido incomum', 'careca', 'penteado punk', 'cabelo comprido', 'estilo urbano'],
    clothing: ['uniforme dos X-Men', 'roupa urbana de rua', 'jaleco de laboratório', 'trapos dos túneis Morlock', 'traje tático da MRD'],
    detail: ['tem uma mutação física visível (pele/olhos/asas)', 'aura de energia mutante', 'colar inibidor de poder', 'cicatriz de experimento', 'olhar de quem foge do governo'],
  },
};

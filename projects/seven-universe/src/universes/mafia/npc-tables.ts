import type { NpcTables } from '../types';

export const MAFIA_NPC_TABLES: NpcTables = {
  names: [
    'Vincent', 'Sal', 'Tommy', 'Angelo', 'Frankie', 'Nico', 'Bruno', 'Enzo',
    'Rocco', 'Maria', 'Gina', 'Carmela', 'Lucia', 'Dominic', 'Marco', 'Paulie',
    'Vito', 'Aldo', 'Renzo', 'Cesare', 'Isabella', 'Sofia', 'Emilio', 'Gustavo',
    'Seamus', 'Declan', 'Fergus', 'Molly', 'Arthur', 'Finn',
  ],
  roles: [
    'soldado da família', 'cobrador de dívidas', 'dono de bar clandestino', 'contrabandista de álcool',
    'policial corrupto', 'informante de rua', 'contador da máfia', 'dançarina de cabaré',
    'motorista de fuga', 'agiota', 'dono de casa de apostas', 'estivador do porto',
    'jornalista investigativo', 'padre do bairro', 'imigrante recém-chegado',
  ],
  traits: [
    'leal à família', 'ganancioso', 'violento', 'cauteloso', 'ambicioso', 'covarde',
    'sedutor', 'traiçoeiro', 'honrado (à moda antiga)', 'nervoso', 'frio',
    'protetor', 'oportunista', 'desesperado', 'calculista',
  ],
  appearance: {
    build: ['magro e ágil', 'corpulento e forte', 'baixo e atarracado', 'alto e imponente', 'compleição comum'],
    hair: ['cabelo penteado com brilhantina', 'careca', 'cabelo grisalho aparado', 'penteado da época', 'cachos escondidos sob chapéu'],
    clothing: ['terno de risca de giz', 'boina e sobretudo', 'vestido de cabaré com franjas', 'roupa de trabalhador surrada', 'terno barato de novo-rico'],
    detail: ['carrega um revólver no coldre', 'cicatriz de navalha no rosto', 'cheira a charuto e uísque', 'anel de ouro chamativo', 'olhar de quem já matou'],
  },
};

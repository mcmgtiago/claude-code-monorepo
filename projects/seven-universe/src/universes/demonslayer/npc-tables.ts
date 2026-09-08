import type { NpcTables } from '../types';

export const DEMONSLAYER_NPC_TABLES: NpcTables = {
  names: [
    'Goto', 'Murata', 'Ozaki', 'Sabito', 'Makomo', 'Kiriya', 'Kanata', 'Kiyo',
    'Sumi', 'Naho', 'Terauchi', 'Hisa', 'Tetsuido', 'Kotetsu', 'Kozo',
    'Masachika', 'Suma', 'Makio', 'Hinatsuru', 'Zenko', 'Toko', 'Rokuta',
    'Hanako', 'Takeo', 'Shigeru', 'Chuntaro', 'Yahaba', 'Susamaru', 'Kyogai', 'Rui',
  ],
  roles: [
    'caçador de demônios novato', 'aldeão camponês', 'kakushi (equipe de suporte)', 'ferreiro de nichirin',
    'mercador de vila', 'demônio menor faminto', 'monge de templo', 'gueixa de distrito',
    'dono de casa de chá', 'viajante na estrada', 'pescador de vila costeira',
    'guarda de mansão', 'curandeiro tradicional', 'órfão de rua', 'agricultor de wisteria',
  ],
  traits: [
    'assustado', 'corajoso', 'determinado', 'gentil', 'covarde', 'devoto',
    'melancólico', 'brincalhão', 'sério', 'protetor', 'faminto (demônio)',
    'cruel (demônio)', 'esperançoso', 'traumatizado', 'leal',
  ],
  appearance: {
    build: ['magro e ágil', 'compacto e forte', 'alto e esguio', 'pequeno e frágil', 'musculoso'],
    hair: ['cabelo preto preso em rabo', 'cabelo curto bagunçado', 'raspado de monge', 'penteado tradicional elaborado', 'cabelo desgrenhado'],
    clothing: ['uniforme de caçador de demônios', 'quimono simples de camponês', 'traje kakushi de suporte', 'roupas rasgadas de vítima', 'kimono elegante de distrito'],
    detail: ['carrega uma katana nichirin', 'olhos vermelhos de demônio', 'cicatriz de garra no rosto', 'brincos ou máscara tradicional', 'cheira a wisteria (proteção)'],
  },
};

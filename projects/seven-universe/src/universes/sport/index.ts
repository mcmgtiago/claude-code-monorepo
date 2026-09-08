import type { Universe } from '../types';

export const SPORT: Universe = {
  id: 'sport',
  name: 'Isekai Esportivo',
  tagline: 'O talento é tudo neste mundo',
  emoji: '⚽',
  theme: { accent: 'emerald', accentHex: '#10b981' },
  powerLabel: 'Esporte',
  hasPowerGenerator: false,

  attributes: [
    { key: 'fisico', label: 'Físico', short: 'FIS' },      // força, potência
    { key: 'velocidade', label: 'Velocidade', short: 'VEL' },
    { key: 'tecnica', label: 'Técnica', short: 'TEC' },     // habilidade com bola/movimento
    { key: 'visao', label: 'Visão de Jogo', short: 'VIS' }, // leitura tática
    { key: 'instinto', label: 'Instinto', short: 'INS' },   // reflexo, faro de gol/jogada
    { key: 'mental', label: 'Mental', short: 'MEN' },       // pressão, foco, frieza
    { key: 'resistencia', label: 'Resistência', short: 'RES' },
    { key: 'carisma', label: 'Carisma', short: 'CAR' },     // liderança, fama, mídia
  ],
  tiers: [
    { key: 'novato', label: 'Amador', desc: 'Nunca jogou sério', budget: 22, startLevel: 1 },
    { key: 'veterano', label: 'Semi-Pro', desc: 'Time de base', budget: 34, startLevel: 6 },
    { key: 'elite', label: 'Profissional', desc: 'Titular de time grande', budget: 48, startLevel: 14 },
    { key: 'omega', label: 'Craque Mundial', desc: 'Nível lendário (Messi/Jordan)', budget: 80, startLevel: 28 },
  ],
  powerTypes: [
    { key: 'futebol', label: 'Futebol', desc: 'O esporte mais popular. Gols, dribles, jogadas geniais.' },
    { key: 'basquete', label: 'Basquete', desc: 'Enterradas, arremessos, velocidade explosiva.' },
    { key: 'volei', label: 'Vôlei', desc: 'Cortadas, bloqueios, saques poderosos.' },
    { key: 'luta', label: 'Luta / MMA', desc: 'Combate esportivo, boxe, artes marciais.' },
    { key: 'tenis', label: 'Tênis', desc: 'Duelos individuais, saques, resistência mental.' },
    { key: 'corrida', label: 'Atletismo', desc: 'Velocidade pura, superação de limites.' },
  ],

  skills: [
    // Técnicas de futebol
    { name: 'Drible Relâmpago', tree: 'tecnica', tier: 1, description: 'Passa por marcadores com facilidade. +1 técnica.', bonusAttribute: 'tecnica', bonusAmount: 1 },
    { name: 'Chute Colocado', tree: 'tecnica', tier: 1, description: 'Precisão no canto do gol. +1 técnica.', bonusAttribute: 'tecnica', bonusAmount: 1 },
    { name: 'Chute Fantasma', tree: 'tecnica', tier: 3, description: 'Chute impossível de defender, curva impossível. +3 técnica.', bonusAttribute: 'tecnica', bonusAmount: 3 },
    // Físico
    { name: 'Explosão Muscular', tree: 'fisico', tier: 1, description: 'Aceleração brutal. +1 velocidade.', bonusAttribute: 'velocidade', bonusAmount: 1 },
    { name: 'Corpo de Ferro', tree: 'fisico', tier: 2, description: 'Ninguém te derruba. +2 físico.', bonusAttribute: 'fisico', bonusAmount: 2 },
    { name: 'Motor Infinito', tree: 'fisico', tier: 2, description: 'Corre 90 min sem cansar. +2 resistência.', bonusAttribute: 'resistencia', bonusAmount: 2 },
    // Mental / Visão
    { name: 'Visão de Águia', tree: 'mental', tier: 1, description: 'Enxerga o campo todo. +1 visão.', bonusAttribute: 'visao', bonusAmount: 1 },
    { name: 'Instinto Predador', tree: 'mental', tier: 2, description: 'Faro de gol/jogada decisiva. +2 instinto.', bonusAttribute: 'instinto', bonusAmount: 2 },
    { name: 'Sangue Frio', tree: 'mental', tier: 2, description: 'Nunca treme na pressão. +2 mental.', bonusAttribute: 'mental', bonusAmount: 2 },
    // A ZONA (estado supremo)
    { name: 'A Zona (Flow State)', tree: 'especial', tier: 3, description: 'Tempo desacelera, tudo fica claro. Estado de fluxo perfeito. +3 instinto.', bonusAttribute: 'instinto', bonusAmount: 3 },
    { name: 'Modo Predador', tree: 'especial', tier: 3, description: 'Devora qualquer jogada, egoísmo absoluto pra vencer (Blue Lock). +3 físico.', bonusAttribute: 'fisico', bonusAmount: 3 },
    // Social
    { name: 'Líder de Vestiário', tree: 'social', tier: 1, description: 'Motiva o time. +1 carisma.', bonusAttribute: 'carisma', bonusAmount: 1 },
    { name: 'Queridinho da Mídia', tree: 'social', tier: 2, description: 'Fama, patrocínios, imprensa ama você. +2 carisma.', bonusAttribute: 'carisma', bonusAmount: 2 },
  ],
  scenarios: [
    // Aventura
    { id: 'peneira', emoji: '⚽', title: 'Dia da Peneira', mode: 'adventure', setup: 'Acorda no vestiário de um centro de treinamento de elite. Hoje é a peneira — centenas de jovens disputando uma vaga. Um olheiro grita seu nome (que você nem sabia que estava na lista).' },
    { id: 'estadio', emoji: '🏟️', title: 'Meio do Estádio', mode: 'adventure', setup: 'Materializa no gramado de um estádio LOTADO, 50 mil pessoas gritando. Uma partida está rolando — e você está de uniforme, no meio de campo. O juiz apita: a bola vem na sua direção.' },
    { id: 'blue_lock', emoji: '🔒', title: 'Projeto Elite', mode: 'adventure', setup: 'Acorda numa instalação futurista de treinamento brutal (estilo Blue Lock). Uma voz no alto-falante: "300 candidatos. Só sobra 1. A partir de agora, é cada um por si. Comece a correr."' },
    { id: 'quadra_rua', emoji: '🏀', title: 'Quadra de Rua', mode: 'adventure', setup: 'Surge numa quadra de basquete de rua, sol quente, galera ao redor. Um grupo intimidador domina a quadra: "Novato quer jogar? Aposta ou cai fora."' },
    { id: 'academia', emoji: '🥊', title: 'Academia de Luta', mode: 'adventure', setup: 'Desperta no ringue de uma academia de MMA. Um lutador musculoso te encara do outro lado: "Você entrou na gaiola errada, cara. Vamos ver do que é feito."' },
    { id: 'final', emoji: '🏆', title: 'Final do Campeonato', mode: 'adventure', setup: 'Materializa no banco de reservas de uma FINAL de campeonato. Placar empatado, últimos minutos. O técnico se vira pra você: "Entra. Agora. Ganha isso pra gente."' },
    { id: 'lesao', emoji: '🩹', title: 'Sala de Recuperação', mode: 'adventure', setup: 'Acorda numa clínica esportiva, perna enfaixada. Uma fisioterapeuta te explica: "Você teve uma lesão feia. Sua carreira depende dessa recuperação. E de mim."' },
    { id: 'olheiro', emoji: '📋', title: 'Abordado por Olheiro', mode: 'adventure', setup: 'Surge numa praça onde jovens jogam pelada. Um homem de terno te observa jogar por acaso, depois se aproxima: "Nunca vi ninguém se mover assim. Quem é você? Quero te levar pro profissional."' },
    // +18
    { id: 'vestiario', emoji: '🚿', title: 'Vestiário Vazio', mode: 'adult', setup: 'Acorda no vestiário depois do treino, todos já saíram. Menos uma pessoa — uma colega/o de time atraente sai do chuveiro, surpresa de te ver: "Achei que estava sozinha aqui..."' },
    { id: 'pos_jogo', emoji: '🎉', title: 'Festa Pós-Título', mode: 'adult', setup: 'Materializa numa festa de comemoração de título. Champagne, música, corpos suados de adrenalina. Alguém do time te puxa pra um canto escuro: "Ganhamos. Agora vamos comemorar de VERDADE."' },
    { id: 'massagem', emoji: '💆', title: 'Sessão de Massagem', mode: 'adult', setup: 'Desperta numa maca de massagem esportiva. A massagista desliza as mãos pelos seus músculos: "Você está muito tenso... deixa eu cuidar de todas as suas tensões."' },
    { id: 'fan', emoji: '💋', title: 'Fã Obcecada', mode: 'adult', setup: 'Acorda num quarto de hotel de luxo (concentração do time). Batem na porta — uma fã conseguiu entrar: "Sou sua maior fã. Faria QUALQUER coisa por você. E digo qualquer coisa."' },
  ],
  systemPromptLore: `MUNDO ISEKAI ESPORTIVO: Um mundo paralelo onde o ESPORTE é a coisa mais importante da sociedade. Atletas são celebridades, semi-deuses, mais famosos que reis. Times/clubes têm poder de corporações. Ligas movimentam bilhões. Estilo anime esportivo (Blue Lock, Kuroko no Basket, Haikyuu, Captain Tsubasa, Slam Dunk): os melhores jogadores têm habilidades QUASE SOBRENATURAIS — chutes que quebram a barreira do som, dribles impossíveis, "A ZONA" (flow state onde o tempo desacelera), instinto predador. Estrutura: times de base → profissional → seleção nacional → lendas mundiais. Rivalidades intensas, egos gigantes, superação, trabalho em equipe vs individualismo. Patrocinadores, mídia, torcida fanática, técnicos durões, olheiros. Cada esporte (futebol, basquete, vôlei, luta, tênis, atletismo) tem sua cultura própria. PARTIDAS são o "combate": cada jogada disputada é um teste, o placar importa, a torcida reage. Lesões podem acabar carreiras. Tom: intensidade shounen, superação, drama de vestiário, glória e queda.`,
  isekaiIntro: `O jogador foi transportado do nosso mundo (2026) pra este mundo obcecado por esporte. Talvez fosse atleta amador, talvez nunca tenha jogado. Mas neste mundo, seu corpo tem um POTENCIAL adormecido. Começa do ZERO — sem time, sem fama, sem contrato. Só o talento bruto (ou a falta dele) e a chance de ascender.`,
  imageStyle: 'sports anime style, dynamic action, stadium, athletic, Blue Lock / Haikyuu art style, dramatic',
};

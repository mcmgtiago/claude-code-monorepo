import type { Universe } from '../types';
import { BLEACH_LORE } from './lore';
import { BLEACH_NPCS } from './npcs';
import { BLEACH_NPCS_MINOR } from './npcs-minor';
import { BLEACH_NPC_TABLES } from './npc-tables';

export const BLEACH: Universe = {
  id: 'bleach',
  name: 'Bleach',
  tagline: 'Bankai',
  emoji: '⚔️',
  theme: { accent: 'blue', accentHex: '#3b82f6' },
  powerLabel: 'Poder Espiritual',
  hasPowerGenerator: true,
  attributes: [
    { key: 'reiatsu', label: 'Reiatsu', short: 'REI' },
    { key: 'zanjutsu', label: 'Zanjutsu', short: 'ZAN' },
    { key: 'hakuda', label: 'Hakuda', short: 'HAK' },
    { key: 'hoho', label: 'Hohō', short: 'HOH' },
    { key: 'kido', label: 'Kidō', short: 'KID' },
    { key: 'percepcao', label: 'Percepção', short: 'PER' },
    { key: 'vontade', label: 'Vontade', short: 'VON' },
    { key: 'presenca', label: 'Presença', short: 'PRE' },
  ],
  tiers: [
    { key: 'novato', label: 'Aspirante', desc: 'Acadêmico / Iniciante', budget: 22, startLevel: 1 },
    { key: 'veterano', label: 'Oficial', desc: 'Tenente em potencial', budget: 34, startLevel: 5 },
    { key: 'elite', label: 'Capitão', desc: 'Elite do Gotei 13', budget: 48, startLevel: 12 },
    { key: 'omega', label: 'Transcendente', desc: 'Nível Aizen/Yhwach', budget: 80, startLevel: 25 },
  ],
  powerTypes: [
    { key: 'shinigami', label: 'Shinigami', desc: 'Zanpakutō, Kidō, Shunpo. Evolui: Shikai → Bankai.' },
    { key: 'hollow', label: 'Hollow/Arrancar', desc: 'Cero, Hierro, Sonido. Evolui: Resurrección.' },
    { key: 'quincy', label: 'Quincy', desc: 'Heilig Pfeil, Blut. Evolui: Vollständig.' },
    { key: 'fullbring', label: 'Fullbring', desc: 'Humano com poder espiritual latente.' },
    { key: 'humano', label: 'Humano Comum', desc: 'Sem poderes. Pode despertar.' },
  ],
  skills: [
    // Zanjutsu tree (espada)
    { name: 'Golpe Preciso', tree: 'zanjutsu', tier: 1, description: '+1 zanjutsu. Ataque fundamental.', bonusAttribute: 'zanjutsu', bonusAmount: 1 },
    { name: 'Mestre Espada', tree: 'zanjutsu', tier: 2, description: '+2 zanjutsu. Domínio médio.', bonusAttribute: 'zanjutsu', bonusAmount: 2 },
    { name: 'Lâmina Divina', tree: 'zanjutsu', tier: 3, description: '+3 zanjutsu. Corte perfeito.', bonusAttribute: 'zanjutsu', bonusAmount: 3 },
    { name: 'Lâmina dos Milhares', tree: 'zanjutsu', tier: 3, description: '+3 zanjutsu. Lâmina se divide em milhares.', bonusAttribute: 'zanjutsu', bonusAmount: 3 },
    // Hakuda (corpo-a-corpo)
    { name: 'Punho Espiritual', tree: 'hakuda', tier: 1, description: '+1 hakuda. Combate corpo-a-corpo.', bonusAttribute: 'hakuda', bonusAmount: 1 },
    { name: 'Combate Cego', tree: 'hakuda', tier: 2, description: '+2 hakuda. Luta sem ver.', bonusAttribute: 'hakuda', bonusAmount: 2 },
    { name: 'Punho Divisor', tree: 'hakuda', tier: 3, description: '+3 hakuda. Um golpe desfaz ataques.', bonusAttribute: 'hakuda', bonusAmount: 3 },
    // Hohō (Shunpo/movimento)
    { name: 'Shunpo Básico', tree: 'hoho', tier: 1, description: '+1 hohō. Movimento ultra-rápido.', bonusAttribute: 'hoho', bonusAmount: 1 },
    { name: 'Sombra Cintilante', tree: 'hoho', tier: 2, description: '+2 hohō. Teleporte aparente.', bonusAttribute: 'hoho', bonusAmount: 2 },
    { name: 'Flash Step', tree: 'hoho', tier: 3, description: '+3 hohō. Velocidade luz.', bonusAttribute: 'hoho', bonusAmount: 3 },
    // Kidō (feitiços)
    { name: 'Hadō Iniciante', tree: 'kido', tier: 1, description: '+1 kidō. Feitiços destrutivos básicos.', bonusAttribute: 'kido', bonusAmount: 1 },
    { name: 'Bakudō Iniciante', tree: 'kido', tier: 1, description: '+1 kidō. Feitiços defensivos básicos.', bonusAttribute: 'kido', bonusAmount: 1 },
    { name: 'Hadō Avançado', tree: 'kido', tier: 2, description: '+2 kidō. Feitiços médio/alto nível.', bonusAttribute: 'kido', bonusAmount: 2 },
    { name: 'Bakudō Avançado', tree: 'kido', tier: 2, description: '+2 kidō. Amarrações impossíveis.', bonusAttribute: 'kido', bonusAmount: 2 },
    { name: 'Kurohitsugi (Caixão Negro)', tree: 'kido', tier: 3, description: '+3 kidō. Hadō 90. Destruição massiva.', bonusAttribute: 'kido', bonusAmount: 3 },
    // Hollow/Arrancar powers
    { name: 'Cero Iniciante', tree: 'hollow', tier: 1, description: '+1 reiatsu. Raio espiritual.', bonusAttribute: 'reiatsu', bonusAmount: 1 },
    { name: 'Hierro Avançado', tree: 'hollow', tier: 2, description: '+2 reiatsu. Pele impenetrável.', bonusAttribute: 'reiatsu', bonusAmount: 2 },
    { name: 'Resurrección', tree: 'hollow', tier: 3, description: '+3 reiatsu. Liberação final Hollow. +3 zanjutsu.', bonusAttribute: 'reiatsu', bonusAmount: 3 },
    // Quincy powers
    { name: 'Heilig Pfeil', tree: 'quincy', tier: 1, description: '+1 reiatsu. Flechas espirituais.', bonusAttribute: 'reiatsu', bonusAmount: 1 },
    { name: 'Blut Vene', tree: 'quincy', tier: 2, description: '+2 resistência. Defesa sobre-humana.', bonusAttribute: 'resistencia', bonusAmount: 2 },
    { name: 'Vollständig', tree: 'quincy', tier: 3, description: '+3 reiatsu. Transformação Quincy final.', bonusAttribute: 'reiatsu', bonusAmount: 3 },
    // Exclusivas
    { name: 'Shikai Liberado', tree: 'especial', tier: 2, description: '+2 zanjutsu + acesso Shikai.', bonusAttribute: 'zanjutsu', bonusAmount: 2 },
    { name: 'Bankai Desperto', tree: 'especial', tier: 3, description: '+3 zanjutsu + acesso Bankai.', bonusAttribute: 'zanjutsu', bonusAmount: 3 },
  ],
  scenarios: [
    // Início aventura
    { id: 'karakura_noite', emoji: '🌃', title: 'Karakura à Noite', mode: 'adventure', setup: 'Acorda numa rua residencial de Karakura Town à noite. Pressão espiritual pesada no ar — algo fedido, errado. Um Hollow geme ao longe. Rukia ou Ichigo podem estar por perto.' },
    { id: 'rukongai_distrito', emoji: '🏚️', title: 'Rukongai (Distrito 60)', mode: 'adventure', setup: 'Desperta num distrito pobre do Rukongai. Crianças-alma correm. Você está morto? No Soul Society? Sem identidade, sem Zanpakutō, sem memória clara.' },
    { id: 'hueco_mundo_deserto', emoji: '🌙', title: 'Deserto de Hueco Mundo', mode: 'adventure', setup: 'Materializa no deserto branco eterno de Hueco Mundo. Lua perpétua no céu. Silêncio mortal. Um Adjuchas imenso emerge das dunas, gargalhadas.' },
    { id: 'academia_shino', emoji: '📚', title: 'Academia Shin\'ō', mode: 'adventure', setup: 'Aparece no pátio da Academia Shinigami. Alunos treinando zanjutsu. Um instrutor te olha: "Quem é você? Esta turma está fechada há séculos."' },
    { id: 'seireitei_portao', emoji: '⛩️', title: 'Portões do Seireitei', mode: 'adventure', setup: 'Acorda nos portões do Seireitei. Guardas de elite apontam Zanpakutō: "Nome e propósito. Sem resposta em 5 segundos = morte."' },
    { id: 'urahara_loja', emoji: '🏪', title: 'Urahara Shoten', mode: 'adventure', setup: 'Materializa numa lojinha bizarra com sachês de produtos estranhos. Um homem de chapéu sorri: "Aaah. Mais um visitante de outro mundo. Bem-vindo. Chá?"' },
    { id: 'las_noches_corredor', emoji: '🏰', title: 'Corredor de Las Noches', mode: 'adventure', setup: 'Acorda num corredor infinito de Las Noches, trono branco à frente. Um Arrancar com máscara parcial te vê: "Mais um invasor. Vou te matar por tédio."' },
    // Meio jogo
    { id: 'sokyoku_hill', emoji: '⚔️', title: 'Sōkyoku Hill (Execução)', mode: 'adventure', setup: 'Acordas num campo aberto com uma lança gigante no centro. Multidão de Shinigami ao redor. Alguém está prestes a ser executido. Você apareceu pra interromper?' },
    { id: 'visored_hideout', emoji: '😈', title: 'Esconderijo dos Visored', mode: 'adventure', setup: 'Materializa num esconderijo subterrâneo. Pessoas com máscaras Hollow aparecem. Shinji Hirako (líder) sorri: "Outro? Beleza. Primeiro: consegue aceitar a Hollow dentro de você?"' },
    { id: 'wandenreich_salao', emoji: '👑', title: 'Salão de Wandenreich', mode: 'adventure', setup: 'Acordas num salão branco imenso de Wandenreich (Quincy). Uma figura de branco puro te olha: "Você veio a mim. Por que?". A presença esmaga.' },
    { id: 'hueco_mendo_menostierra', emoji: '🏜️', title: 'Floresta de Menos Tierra', mode: 'adventure', setup: 'A meio caminho entre Hueco Mundo e Karakura, achas um bosque eterno. Florestas de árvore-branca, luz âmbar. Hollows e Arrancar caminham pacificamente.' },
    { id: 'zanpakuto_interior', emoji: '⚡', title: 'Dentro da Zanpakutō', mode: 'adventure', setup: 'Comunhão espiritual. Cai dentro da sua própria Zanpakutō. Paisagem interna — uma cópia do mundo. O espírito da espada fala: "Mostre-me quem você é."' },
    // Fim de jogo
    { id: 'jigoku_no_romon', emoji: '🚪', title: 'Portão do Inferno', mode: 'adventure', setup: 'No fim do ciclo, confronta o Portão do Inferno (Jigoku no Romon). Seu destino aqui decide se salva tudo. Aizen, Yhwach, Ichigo — todos esperam.' },
    // Adult
    { id: 'onsen_soul', emoji: '♨️', title: 'Onsen do Soul Society', mode: 'adult', setup: 'Materializa numa fonte termal tradicional. Rangiku Matsumoto (ou similar) te vê e ri: "Um intruso! Ou um presente?" Ela não cobre nada.' },
    { id: 'quarto_yoruichi', emoji: '🛏️', title: 'Quarto de Yoruichi', mode: 'adult', setup: 'Acordas no quarto luxuoso de Yoruichi (ela está lá, parcialmente nua). Ela ri: "Você ficou. Pensei que ia correr. Vai aproveitar?"' },
    { id: 'las_noches_privada', emoji: '💋', title: 'Quarto Privado em Las Noches', mode: 'adult', setup: 'Uma Arrancar te leva ao quarto dela. Nel Tu ou similar — vulnerável por baixo da máscara. "Mostre-me como é fora da guerra."' },
    { id: 'quarto_hueco', emoji: '🌙', title: 'Quarto no Hueco Mundo', mode: 'adult', setup: 'Em Las Noches, uma Arrancar menor te seduziu. Toca por baixo da máscara. "Mesmo Hollows precisam de toque. Você pode ser meu escape."' },
    { id: 'banho_lendario', emoji: '♨️', title: 'Banho de Capitão', mode: 'adult', setup: 'Invadiu o banho do Capitão-Genral. Unohana te vê e sorri, sem cobrir nada. "Aventureiro. Vai tentar?"' },
  ],
  npcs: [...BLEACH_NPCS, ...BLEACH_NPCS_MINOR],
  npcTables: BLEACH_NPC_TABLES,
  systemPromptLore: BLEACH_LORE,
  isekaiIntro: `O jogador foi transportado do nosso mundo (2026) pra este universo espiritual. Pode ter morrido e ido parar em Rukongai, ou foi puxado vivo pra Soul Society. Não tem Zanpakutō, não tem Shikai/Bankai, não tem divisão nem rank. Pode ou não ter despertado poder espiritual (vai depender da criação). Começa do ZERO, sem aliados, sem memória clara de como veio parar aqui.`,
  imageStyle: 'Bleach anime style, Tite Kubo art, spiritual energy auras, dramatic shadows, Japanese aesthetics',
};
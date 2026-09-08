import type { Universe } from '../types';
import { DEMONSLAYER_LORE } from './lore';
import { DEMONSLAYER_NPCS } from './npcs';
import { DEMONSLAYER_NPCS_MINOR } from './npcs-minor';
import { DEMONSLAYER_NPC_TABLES } from './npc-tables';

export const DEMONSLAYER: Universe = {
  id: 'demonslayer',
  name: 'Demon Slayer',
  tagline: 'A respiração que corta demônios',
  emoji: '🌊',
  theme: { accent: 'teal', accentHex: '#14b8a6' },
  powerLabel: 'Respiração',
  hasPowerGenerator: true,
  attributes: [
    { key: 'forca', label: 'Força', short: 'FOR' },
    { key: 'velocidade', label: 'Velocidade', short: 'VEL' },
    { key: 'resistencia', label: 'Resistência', short: 'RES' },
    { key: 'respiracao', label: 'Respiração', short: 'RESP' },
    { key: 'tecnica', label: 'Técnica', short: 'TEC' },
    { key: 'percepcao', label: 'Percepção', short: 'PER' },
    { key: 'vontade', label: 'Vontade', short: 'VON' },
    { key: 'presenca', label: 'Presença', short: 'PRE' },
  ],
  tiers: [
    { key: 'novato', label: 'Aspirante', desc: 'Sem treino formal', budget: 22, startLevel: 1 },
    { key: 'veterano', label: 'Caçador', desc: 'Membro do Corpo', budget: 34, startLevel: 8 },
    { key: 'elite', label: 'Hashira', desc: 'Pilar de elite', budget: 48, startLevel: 18 },
    { key: 'omega', label: 'Lendário', desc: 'Yoriichi / Lua Superior', budget: 80, startLevel: 32 },
  ],
  powerTypes: [
    { key: 'cacador', label: 'Caçador de Demônios', desc: 'Usa Respirações e katana Nichirin.' },
    { key: 'marca', label: 'Portador de Marca', desc: 'Marca do caçador desperta poder imenso (encurta a vida).' },
    { key: 'demonio', label: 'Demônio', desc: 'Come humanos, regenera, Kekkijutsu, teme o sol.' },
    { key: 'hibrido', label: 'Híbrido', desc: 'Demônio que resiste ao instinto (Nezuko-style).' },
  ],
  skills: [
    // Respirações Primárias (T1)
    { name: 'Respiração da Água (1ª Forma)', tree: 'respiracao', tier: 1, description: '+1 respiracao. Corte horizontal d\'água.', bonusAttribute: 'respiracao', bonusAmount: 1 },
    { name: 'Respiração da Água (10 Formas)', tree: 'respiracao', tier: 2, description: '+2 respiracao. Domínio da Água completa.', bonusAttribute: 'respiracao', bonusAmount: 2 },
    { name: 'Respiração da Água (11ª Forma)', tree: 'respiracao', tier: 3, description: '+3 respiracao. Forma final, morte-renascimento.', bonusAttribute: 'respiracao', bonusAmount: 3 },
    { name: 'Respiração da Chama (9 Formas)', tree: 'respiracao', tier: 3, description: '+3 respiracao. Domínio da Chama (Rengoku-tier).', bonusAttribute: 'respiracao', bonusAmount: 3 },
    { name: 'Respiração do Trovão (1ª)', tree: 'respiracao', tier: 1, description: '+1 velocidade. Corte relâmpago.', bonusAttribute: 'velocidade', bonusAmount: 1 },
    { name: 'Respiração do Trovão (6 Formas)', tree: 'respiracao', tier: 3, description: '+3 velocidade. Domínio do Trovão (Zenitsu dormindo).', bonusAttribute: 'velocidade', bonusAmount: 3 },
    { name: 'Respiração do Vento (9 Formas)', tree: 'respiracao', tier: 3, description: '+3 forca. Vento cortante (Sanemi).', bonusAttribute: 'forca', bonusAmount: 3 },
    { name: 'Respiração da Pedra (5 Formas)', tree: 'respiracao', tier: 3, description: '+3 forca. Defesa absoluta (Gyomei).', bonusAttribute: 'forca', bonusAmount: 3 },
    { name: 'Respiração do Som', tree: 'respiracao', tier: 2, description: '+2 forca. Som explosivo (Uzui).', bonusAttribute: 'forca', bonusAmount: 2 },
    { name: 'Respiração da Névoa', tree: 'respiracao', tier: 2, description: '+2 agilidade. Névoa cortante (Muichiro).', bonusAttribute: 'velocidade', bonusAmount: 2 },
    { name: 'Respiração da Serpente', tree: 'respiracao', tier: 2, description: '+2 velocidade. Movimentos sinuosos (Obanai).', bonusAttribute: 'velocidade', bonusAmount: 2 },
    { name: 'Respiração do Amor', tree: 'respiracao', tier: 2, description: '+2 forca. Lâmina flexível (Mitsuri).', bonusAttribute: 'forca', bonusAmount: 2 },
    { name: 'Respiração do Inseto', tree: 'respiracao', tier: 2, description: '+2 tecnica. Veneno em vez de decapitar (Shinobu).', bonusAttribute: 'tecnica', bonusAmount: 2 },
    { name: 'Respiração da Flor', tree: 'respiracao', tier: 2, description: '+2 tecnica. Flor dançante (Kanao).', bonusAttribute: 'tecnica', bonusAmount: 2 },
    // Origem
    { name: 'Respiração do Sol (Hinokami Kagura)', tree: 'origem', tier: 3, description: '+3 respiracao. A original, 13 formas (Tanjiro).', bonusAttribute: 'respiracao', bonusAmount: 3 },
    { name: 'Respiração da Besta', tree: 'origem', tier: 2, description: '+2 forca. Autodidata (Inosuke).', bonusAttribute: 'forca', bonusAmount: 2 },
    // Técnicas avançadas
    { name: 'Estado Transparente', tree: 'especial', tier: 3, description: '+3 percepcao. Vê fluxo interno do inimigo.', bonusAttribute: 'percepcao', bonusAmount: 3 },
    { name: 'Marca do Caçador', tree: 'especial', tier: 3, description: '+3 forca. Marca ativada (poder Hashira + encurta vida).', bonusAttribute: 'forca', bonusAmount: 3 },
    { name: 'Concentração Total Constante', tree: 'especial', tier: 2, description: '+2 resistencia. Mantém respiração 24h.', bonusAttribute: 'resistencia', bonusAmount: 2 },
    { name: 'Katana Vermelha (Red Blade)', tree: 'especial', tier: 3, description: '+3 tecnica. Nichirin vermelha queima como sol.', bonusAttribute: 'tecnica', bonusAmount: 3 },
    // Demônio
    { name: 'Kekkijutsu (Arte de Sangue)', tree: 'demonio', tier: 2, description: '+2 tecnica. Habilidade demoníaca única (só demônios).', bonusAttribute: 'tecnica', bonusAmount: 2 },
    { name: 'Regeneração Demoníaca', tree: 'demonio', tier: 1, description: '+1 resistencia. Cura ferimentos rapidamente.', bonusAttribute: 'resistencia', bonusAmount: 1 },
    { name: 'Blood Demon Art Avançada', tree: 'demonio', tier: 3, description: '+3 tecnica. Técnica de sangue de Lua Superior.', bonusAttribute: 'tecnica', bonusAmount: 3 },
    { name: 'Imunidade ao Sol', tree: 'hibrido', tier: 3, description: '+3 vontade. Híbrido (Nezuko).', bonusAttribute: 'vontade', bonusAmount: 3 },
  ],
  scenarios: [
    // Início
    { id: 'floresta_noite', emoji: '🌲', title: 'Floresta à Noite', mode: 'adventure', setup: 'Acorda numa floresta escura da era Taisho. Lua cheia. Cheiro de sangue no ar — e algo com garras se move rápido demais entre as árvores.' },
    { id: 'vila_massacre', emoji: '🩸', title: 'Vila Atacada', mode: 'adventure', setup: 'Materializa numa vila silenciosa demais. Portas arrombadas, sangue nas paredes. Um demônio se alimenta de um corpo — e vira a cabeça na sua direção, boca cheia de dentes.' },
    { id: 'sede_caçadores', emoji: '🏯', title: 'Sede dos Caçadores', mode: 'adventure', setup: 'Surge no jardim da mansão dos Caçadores. Espadachins de uniforme te cercam: "Como passou pela segurança?"' },
    { id: 'trem', emoji: '🚂', title: 'Trem Infinito', mode: 'adventure', setup: 'Aparece num trem a vapor da era Taisho. Passageiros dormindo profundamente — sono anormal. Um Hashira de cabelos flamejantes desembainha: "Fique atrás de mim."' },
    { id: 'montanha_seleção', emoji: '⛰️', title: 'Seleção Final', mode: 'adventure', setup: 'Desperta numa montanha coberta de glicínias. É a Seleção Final — sobreviver 7 dias cercado de demônios. A primeira noite acaba de cair.' },
    { id: 'lua_superior', emoji: '🌙', title: 'Diante de Lua Superior', mode: 'adventure', setup: 'Materializa e sente terror primordial. Um demônio de poder inimaginável (Lua Superior) te observa com curiosidade cruel: "Um humano que surge do nada... que sabor interessante."' },
    { id: 'fabrica_espada', emoji: '⚒️', title: 'Vila dos Ferreiros', mode: 'adventure', setup: 'Acorda numa aldeia escondida nas montanhas. Ferreiros forjam katanas. Uma espada muda de cor quando você a toca: preta (única). O ferreiro estuda: "Ninguém teve isso antes."' },
    // Meio
    { id: 'distrito_entretenimento', emoji: '🎎', title: 'Distrito do Entretenimento', mode: 'adventure', setup: 'Yoshiwara de noite. Lanternes vermelhas. Garotas desaparecem. Daki (Lua Superior 6) governa a noite. Você vai caçar ou ser pego?' },
    { id: 'entertainment_district2', emoji: '🏮', title: 'Casa de Courtesã (Gyutaro)', mode: 'adventure', setup: 'Em Yoshiwara, Gyutaro (Lua Superior 6, irmão de Daki) controla tudo. Sangue venenoso, lâminas finas. Hashira Uzui precisa de ajuda.' },
    { id: 'village_sword', emoji: '⚒️', title: 'Aldeia dos Ferreiros (Swordsmith)', mode: 'adventure', setup: 'Ataque de Hantengu (Lua Superior 4). Emoções se dividem em demônios. Medo, Ira, Prazer, Tristeza. Você precisa sobreviver.' },
    { id: 'castle_infinity', emoji: '🏯', title: 'Castelo Infinito (Dimensão)', mode: 'adventure', setup: 'Muzan ativou o Castelo Infinito — dimensão interior. Tudo muda de posição. Você está com Hashira vs. Luas Superiores. Akaza avança. Kokushibo desce.' },
    { id: 'yamanshita', emoji: '🌅', title: 'Amanhecer Final', mode: 'adventure', setup: 'É o amanhecer. Muzan está fraco. Sol está subindo. Cada minuto vale. Você é a diferença entre vitória e derrota.' },
    // Adult
    { id: 'casa_banho', emoji: '💋', title: 'Casa de Banho', mode: 'adult', setup: 'Desperta numa casa de banho Taisho. Uma caçadora (ou demônio sedutora) compartilha água quente: "Você viu demais. Agora terá que me compensar."' },
    { id: 'quarto_mitsuri', emoji: '💕', title: 'Quarto de Mitsuri', mode: 'adult', setup: 'Mitsuri te convidou pro quarto. Forte, mas emocional. "Quero mostrar força em todos os sentidos."' },
    { id: 'quarto_kanao', emoji: '🌸', title: 'Quarto de Kanao', mode: 'adult', setup: 'Kanao joga a moeda. "Cara, eu vou". Coroa. Cara. Ela sorri, pega sua mão: "Vem."' },
    { id: 'casa_rengoku', emoji: '🔥', title: 'Mansão Rengoku', mode: 'adult', setup: 'Senjuro (irmão de Rengoku) te recebe. Calmo, triste. "Você conheceu meu irmão? Era caloroso como fogo." Conforto, calor, intimidade.' },
    { id: 'casa_tanjiro', emoji: '🍃', title: 'Casa dos Kamado (Passado)', mode: 'adult', setup: 'Você aparece na casa dos Kamado, antes do massacre. Nezuko e os irmãos brincam. Hanako grita: "Quem é você? Visitante? Bem-vindo!" Você sabe o que vai acontecer.' },
  ],
  npcs: [...DEMONSLAYER_NPCS, ...DEMONSLAYER_NPCS_MINOR],
  npcTables: DEMONSLAYER_NPC_TABLES,
  systemPromptLore: DEMONSLAYER_LORE,
  isekaiIntro: `O jogador foi transportado do nosso mundo (2026) pro Japão da era Taisho (~1912). Sem treino de respiração, sem katana Nichirin, sem afiliação ao Corpo. Pode ter virado demônio (sangue de Muzan) ou continuar humano. Em qualquer caso, começa do ZERO. À noite, demônios caçam. Wisteria e sol protegem. Você precisa aprender, treinar, sobreviver — ou morrer como comida.`,
  imageStyle: 'Demon Slayer anime style, ufotable, Taisho era Japan, breathing effects, Koyoharu Gotouge art, beautiful combat',
};
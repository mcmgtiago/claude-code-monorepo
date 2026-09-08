import type { Universe } from '../types';
import { NARUTO_LORE } from './lore';
import { NARUTO_NPCS } from './npcs';
import { NARUTO_NPCS_MINOR } from './npcs-minor';
import { NARUTO_NPC_TABLES } from './npc-tables';

export const NARUTO: Universe = {
  id: 'naruto',
  name: 'Naruto',
  tagline: 'O caminho ninja',
  emoji: '🍥',
  theme: { accent: 'orange', accentHex: '#f97316' },
  powerLabel: 'Jutsu',
  hasPowerGenerator: true,
  attributes: [
    { key: 'chakra', label: 'Chakra', short: 'CHA' },
    { key: 'ninjutsu', label: 'Ninjutsu', short: 'NIN' },
    { key: 'taijutsu', label: 'Taijutsu', short: 'TAI' },
    { key: 'genjutsu', label: 'Genjutsu', short: 'GEN' },
    { key: 'velocidade', label: 'Velocidade', short: 'VEL' },
    { key: 'inteligencia', label: 'Inteligência', short: 'INT' },
    { key: 'vontade', label: 'Vontade', short: 'VON' },
    { key: 'sorte', label: 'Sorte', short: 'SOR' },
  ],
  tiers: [
    { key: 'novato', label: 'Genin', desc: 'Acadêmico ninja', budget: 22, startLevel: 1 },
    { key: 'veterano', label: 'Chūnin', desc: 'Ninja de batalha', budget: 34, startLevel: 5 },
    { key: 'elite', label: 'Jōnin', desc: 'Elite, ANBU-tier', budget: 48, startLevel: 12 },
    { key: 'omega', label: 'Kage', desc: 'Lendário, Kage-tier', budget: 80, startLevel: 25 },
  ],
  powerTypes: [
    { key: 'ninja', label: 'Ninja', desc: 'Qualquer afinidade elemental, Kekkei Genkai, Bijuu.' },
    { key: 'civil', label: 'Civil', desc: 'Sem chakra aflorado. Pode despertar.' },
  ],
  skills: [
    // Ninjutsu
    { name: 'Kawarimi (Substituição)', tree: 'ninjutsu', tier: 1, description: '+1 ninjutsu. Troca corpo por objeto.', bonusAttribute: 'ninjutsu', bonusAmount: 1 },
    { name: 'Henge (Transformação)', tree: 'ninjutsu', tier: 1, description: '+1 ninjutsu. Transforma aparência.', bonusAttribute: 'ninjutsu', bonusAmount: 1 },
    { name: 'Bunshin (Clone)', tree: 'ninjutsu', tier: 1, description: '+1 ninjutsu. Cria clones ilusórios.', bonusAttribute: 'ninjutsu', bonusAmount: 1 },
    { name: 'Shadow Clone', tree: 'ninjutsu', tier: 2, description: '+2 ninjutsu. Clones sólidos (Tobirama).', bonusAttribute: 'ninjutsu', bonusAmount: 2 },
    { name: 'Rasengan', tree: 'ninjutsu', tier: 3, description: '+3 ninjutsu. Esfera chakra rotacional.', bonusAttribute: 'ninjutsu', bonusAmount: 3 },
    { name: 'Chidori/Raikiri', tree: 'ninjutsu', tier: 3, description: '+3 ninjutsu. Relâmpago concentrado (Kakashi/Sasuke).', bonusAttribute: 'ninjutsu', bonusAmount: 3 },
    // Elementais
    { name: 'Katon (Fogo)', tree: 'elemento', tier: 1, description: '+1 ninjutsu. Bola/Dragão de fogo.', bonusAttribute: 'ninjutsu', bonusAmount: 1 },
    { name: 'Suiton (Água)', tree: 'elemento', tier: 1, description: '+1 ninjutsu. Dragão de água.', bonusAttribute: 'ninjutsu', bonusAmount: 1 },
    { name: 'Doton (Terra)', tree: 'elemento', tier: 1, description: '+1 ninjutsu. Muros/esferas.', bonusAttribute: 'ninjutsu', bonusAmount: 1 },
    { name: 'Kaze/Raiton (Vento/Relâmpago)', tree: 'elemento', tier: 1, description: '+1 ninjutsu. Lâminas de vento ou raios.', bonusAttribute: 'ninjutsu', bonusAmount: 1 },
    { name: 'Kekkei Genkai', tree: 'sangue', tier: 2, description: '+2 ninjutsu. Genética ninja (Sharingan, Byakugan).', bonusAttribute: 'ninjutsu', bonusAmount: 2 },
    // Taijutsu
    { name: 'Taijutsu Básico', tree: 'taijutsu', tier: 1, description: '+1 taijutsu. Combate corpo-a-corpo.', bonusAttribute: 'taijutsu', bonusAmount: 1 },
    { name: 'Dynamic Entry', tree: 'taijutsu', tier: 2, description: '+2 taijutsu. Chute aéreo surpresa.', bonusAttribute: 'taijutsu', bonusAmount: 2 },
    { name: 'Octopus Fist', tree: 'taijutsu', tier: 2, description: '+2 taijutsu. Golpes em série.', bonusAttribute: 'taijutsu', bonusAmount: 2 },
    { name: 'Hachimon Tonkō (1º Portão)', tree: 'taijutsu', tier: 2, description: '+2 taijutsu. Libera chakra corporal.', bonusAttribute: 'taijutsu', bonusAmount: 2 },
    { name: 'Hachimon Tonkō (4º Portão)', tree: 'taijutsu', tier: 3, description: '+3 taijutsu. Chakra vermelho visível.', bonusAttribute: 'taijutsu', bonusAmount: 3 },
    { name: '8º Portão (Yūton)', tree: 'taijutsu', tier: 3, description: '+3 taijutsu + 3 velocidade. Mortal, dragão vermelho.', bonusAttribute: 'velocidade', bonusAmount: 3 },
    // Genjutsu
    { name: 'Genjutsu Básico', tree: 'genjutsu', tier: 1, description: '+1 genjutsu. Ilusão simples.', bonusAttribute: 'genjutsu', bonusAmount: 1 },
    { name: 'Tsukuyomi', tree: 'genjutsu', tier: 3, description: '+3 genjutsu. Tortura mental infinita (Itachi).', bonusAttribute: 'genjutsu', bonusAmount: 3 },
    // Kekkei Genkai exclusivos
    { name: 'Sharingan (3 Tomoe)', tree: 'sangue', tier: 2, description: '+2 ninjutsu. Cópia, leitura, genjutsu visual.', bonusAttribute: 'ninjutsu', bonusAmount: 2 },
    { name: 'Mangekyō Sharingan', tree: 'sangue', tier: 3, description: '+3 ninjutsu. Poder devastador, perde visão.', bonusAttribute: 'ninjutsu', bonusAmount: 3 },
    { name: 'Byakugan', tree: 'sangue', tier: 2, description: '+2 percepção. Visão 360º + chakra (Hyūga).', bonusAttribute: 'inteligencia', bonusAmount: 2 },
    { name: 'Mokuton (Wood)', tree: 'sangue', tier: 3, description: '+3 chakra. Madeira-viva (Hashirama-clone).', bonusAttribute: 'chakra', bonusAmount: 3 },
    // Bijuu
    { name: 'Jinchūriki (Bijuu)', tree: 'bijuu', tier: 3, description: '+3 chakra. Hospeda 1+ cauda.', bonusAttribute: 'chakra', bonusAmount: 3 },
    { name: 'Modo Sennin', tree: 'sennin', tier: 3, description: '+3 chakra. Chakra natural (Jiraiya/Naruto).', bonusAttribute: 'chakra', bonusAmount: 3 },
    // Fuinjutsu
    { name: 'Fuinjutsu (Selos)', tree: 'fuinjutsu', tier: 1, description: '+1 inteligencia. Selos Uzumaki básicos.', bonusAttribute: 'inteligencia', bonusAmount: 1 },
    { name: 'Edo Tensei', tree: 'fuinjutsu', tier: 3, description: '+3 inteligencia. Reanimar mortos como ninjas.', bonusAttribute: 'inteligencia', bonusAmount: 3 },
  ],
  scenarios: [
    // Início
    { id: 'konoha_portao', emoji: '🌸', title: 'Portões de Konoha', mode: 'adventure', setup: 'Materializa nos portões de Konoha. Faces de Hokage esculpidas na rocha. Guardas te olham desconfiados: "Quem é você? Civil? Ninja? Aldeão?"' },
    { id: 'academia_shinobi', emoji: '📚', title: 'Academia Ninja', mode: 'adventure', setup: 'Aparece na sala de aula da Academia. Iruka-sensei para a aula: "Quem é você? Esta aula é só pra alunos." Crianças te olham.' },
    { id: 'floresta_konoha', emoji: '🌳', title: 'Floresta de Konoha', mode: 'adventure', setup: 'Desperta numa clareira na Floresta de Konoha. Equipe ninja treinando ao longe. Um deles te vê: "Quem tá aí? Mostre-se!"' },
    { id: 'mizusashi', emoji: '🍶', title: 'Bar do País do Fogo', mode: 'adventure', setup: 'Materializa num bar japonês. Três ninjas bêbados de missões. Um cospe: "Civil sem aldeia. Você cheira a problema."' },
    { id: 'chunin_exam', emoji: '🎌', title: 'Exame Chūnin', mode: 'adventure', setup: 'Chega na arena de exame chūnin. Centenas de ninjas de várias vilas. "Exame começa agora. Regra 1: não mate. (Todos mentem.)"' },
    { id: 'sunagakure_deserto', emoji: '🏜️', title: 'Areia de Suna', mode: 'adventure', setup: 'Desperta no deserto perto de Suna. Calor. Areia. Uma tempestura de areia passa. Um ninja de Suna te encontra: "Forasteiro? Aqui é perigoso."' },
    // Meio jogo
    { id: 'akatsuki_reuniao', emoji: '☁️', title: 'Reunião Akatsuki', mode: 'adventure', setup: 'Acordas num círculo de Akatsuki. Dez membros te olham. Itachi te estuda. "Mais um coelho capturado?"' },
    { id: 'orochimaru_lab', emoji: '�', title: 'Laboratório de Orochimaru', mode: 'adventure', setup: 'Acordas amarrado numa maca. Cobra te olha. "Interessante. Seu corpo... posso ter?"' },
    { id: 'uchiha_massacre', emoji: '🔪', title: 'Polícia Uchiha (Passado)', mode: 'adventure', setup: 'Acordas no distrito Uchiha, noite. Itachi está matando clã inteiro. Ele te vê: "Quem é você? ... sai daqui."' },
    { id: 'pain_ataca', emoji: '👁️', title: 'Ataque de Pain a Konoha', mode: 'adventure', setup: 'Konoha em ruínas. Pain no centro, Deva Path. Todos olham pra cima. Naruto chega... tarde demais.' },
    { id: 'war_arena', emoji: '⚔️', title: 'Guerra Ninja (4ª)', mode: 'adventure', setup: 'Materializa numa planície com 100.000 ninjas lutando. Edo Madara libera Susanoo perfeito. Tsunade curando. Naruto + Minato + Bee no campo.' },
    // Fim
    { id: 'infinite_tsukuyomi', emoji: '🌙', title: 'Tsukuyomi Infinito', mode: 'adventure', setup: 'Lua vermelha cobre tudo. Sakura desabrocha. Você vê Kakashi preso na ilusão. A batalha final está aqui.' },
    // Adult
    { id: 'onsen_konoha', emoji: '♨️', title: 'Banho Feminino Konoha', mode: 'adult', setup: 'Entra (sem querer) no banho feminino. Hinata, Sakura, Ino, Tenten estão lá. "AAAH! FORA!" (Com nu intimidação).' },
    { id: 'quarto_yamanaka', emoji: '💋', title: 'Tenda Yamanaka (Ino)', mode: 'adult', setup: 'Ino te puxa pra tenda dela. "Você me olhou muito hoje. Vai aprender."' },
    { id: 'temple_dourado', emoji: '🌟', title: 'Templo Dourado (Tayuya)', mode: 'adult', setup: 'Tayuya (Sound 4) te encontra no templo de Orochimaru. Sorriso predador. "Achei um brinquedo."' },
    { id: 'noite_akatsuki', emoji: '☁️', title: 'Noite em Akatsuki', mode: 'adult', setup: 'Konan te encontrou sozinho. "Você é diferente dos outros. Posso te mostrar algo?"' },
    { id: 'hokage_office', emoji: '👑', title: 'Escritório Hokage (Tsunade)', mode: 'adult', setup: 'Tsunade te convocou. Sozinhos. Bêbada. "Preciso de alguém pra aliviar tensão."' },
    { id: 'anbu_secret', emoji: '⚔️', title: 'ANBU Secreto', mode: 'adult', setup: 'ANBU feminina te captura. "Você viu demais. Mas há outras formas de selar segredos."' },
  ],
  npcs: [...NARUTO_NPCS, ...NARUTO_NPCS_MINOR],
  npcTables: NARUTO_NPC_TABLES,
  systemPromptLore: NARUTO_LORE,
  isekaiIntro: `O jogador foi transportado do nosso mundo (2026) pra universo ninja. Não tem chakra aflorado, não tem clã, não tem aldeia, não tem jutsu. Está em Konoha por padrão (ou outro lugar aleatório). Pode ou não ter descoberto que tem chakra (vai depender da criação). Começa do ZERO — qualquer caminho é possível. Mas cuidado: Kage matou clãs Uchiha pra proteger segredo.`,
  imageStyle: 'Naruto anime style, Konoha village, kunai, ninja headbands, leaf village symbol, Asian martial arts aesthetic',
};
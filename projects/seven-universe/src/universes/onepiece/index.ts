import type { Universe } from '../types';
import { ONEPIECE_LORE } from './lore';
import { ONEPIECE_NPCS } from './npcs';
import { ONEPIECE_NPCS_MINOR } from './npcs-minor';
import { ONEPIECE_NPC_TABLES } from './npc-tables';

export const ONEPIECE: Universe = {
  id: 'onepiece',
  name: 'One Piece',
  tagline: 'Rumo ao One Piece',
  emoji: '🏴‍☠️',
  theme: { accent: 'red', accentHex: '#dc2626' },
  powerLabel: 'Poder',
  hasPowerGenerator: true,
  attributes: [
    { key: 'forca', label: 'Força', short: 'FOR' },
    { key: 'agilidade', label: 'Agilidade', short: 'AGI' },
    { key: 'resistencia', label: 'Resistência', short: 'RES' },
    { key: 'poder', label: 'Poder (Fruta/Arma)', short: 'POD' },
    { key: 'haki', label: 'Haki', short: 'HAK' },
    { key: 'percepcao', label: 'Percepção', short: 'PER' },
    { key: 'vontade', label: 'Vontade', short: 'VON' },
    { key: 'presenca', label: 'Presença', short: 'PRE' },
  ],
  tiers: [
    { key: 'novato', label: 'Novato dos Mares', desc: 'Recompensa baixa/nenhuma', budget: 22, startLevel: 1 },
    { key: 'veterano', label: 'Pirata Notório', desc: 'Recompensa de milhões', budget: 34, startLevel: 8 },
    { key: 'elite', label: 'Supernova', desc: 'Recompensa de 100M+', budget: 48, startLevel: 18 },
    { key: 'omega', label: 'Yonkou/Almirante', desc: 'Imperador dos Mares', budget: 80, startLevel: 35 },
  ],
  powerTypes: [
    { key: 'paramecia', label: 'Fruta Paramecia', desc: 'Poder sobrenatural no corpo.' },
    { key: 'logia', label: 'Fruta Logia', desc: 'Vira um elemento.' },
    { key: 'zoan', label: 'Fruta Zoan', desc: 'Transforma em animal (lendário/ancestral).' },
    { key: 'espadachim', label: 'Espadachim', desc: 'Mestre da lâmina, sem fruta.' },
    { key: 'sem_fruta', label: 'Lutador Puro', desc: 'Sem fruta, Haki e técnica (Garp).' },
  ],
  skills: [
    // Haki
    { name: 'Haki do Armamento', tree: 'haki', tier: 1, description: '+1 haki. Reveste corpo com armadura invisível.', bonusAttribute: 'haki', bonusAmount: 1 },
    { name: 'Haki da Observação', tree: 'haki', tier: 1, description: '+1 percepção. Prevê movimentos.', bonusAttribute: 'percepcao', bonusAmount: 1 },
    { name: 'Haki do Rei', tree: 'haki', tier: 2, description: '+2 presença. Vontade suprema. Raro, desmaia fracos.', bonusAttribute: 'presenca', bonusAmount: 2 },
    { name: 'Haki do Rei Avançado', tree: 'haki', tier: 3, description: '+3 presença + inflige Haki Rei nos ataques.', bonusAttribute: 'presenca', bonusAmount: 3 },
    { name: 'Haki da Observação (Futuro)', tree: 'haki', tier: 3, description: '+3 percepção. Ver o futuro próximo (Katakuri/Luffy).', bonusAttribute: 'percepcao', bonusAmount: 3 },
    { name: 'Haki do Armamento (Avançado)', tree: 'haki', tier: 2, description: '+2 haki. Projeta além do corpo.', bonusAttribute: 'haki', bonusAmount: 2 },
    // Frutas
    { name: 'Domínio da Fruta', tree: 'poder', tier: 2, description: '+2 poder. Controle avançado.', bonusAttribute: 'poder', bonusAmount: 2 },
    { name: 'Awakening', tree: 'poder', tier: 3, description: '+3 poder. Despertar (ambiente ou forma suprema).', bonusAttribute: 'poder', bonusAmount: 3 },
    { name: 'Gear 2 (Gomu Gomu)', tree: 'poder', tier: 2, description: '+2 agilidade + 2 poder. Velocidade sobre-humana.', bonusAttribute: 'agilidade', bonusAmount: 2 },
    { name: 'Gear 4 (Boundman)', tree: 'poder', tier: 3, description: '+3 forca + 3 resistencia. Forma muscular.', bonusAttribute: 'forca', bonusAmount: 3 },
    { name: 'Gear 5 (Nika)', tree: 'poder', tier: 3, description: '+3 todos. Forma de deus, corpo de borracha cartoon.', bonusAttribute: 'poder', bonusAmount: 3 },
    // Combate
    { name: 'Rokushiku (6 Poderes)', tree: 'combate', tier: 2, description: '+2 agilidade + 2 forca. Técnicas físicas (CP9).', bonusAttribute: 'agilidade', bonusAmount: 2 },
    { name: 'Estilo de Espada (1 Tipo)', tree: 'combate', tier: 1, description: '+1 forca. Treinamento de espada básico.', bonusAttribute: 'forca', bonusAmount: 1 },
    { name: 'Santoryu (3 Espadas)', tree: 'combate', tier: 2, description: '+2 forca. Estilo de 3 katanas (Zoro).', bonusAttribute: 'forca', bonusAmount: 2 },
    { name: 'Ittoryu (Espada Lendária)', tree: 'combate', tier: 3, description: '+3 forca. Espada única suprema (Mihawk/Roger).', bonusAttribute: 'forca', bonusAmount: 3 },
    { name: 'Black Leg (Diable Jambe)', tree: 'combate', tier: 2, description: '+2 forca. Pernas de fogo (Sanji).', bonusAttribute: 'forca', bonusAmount: 2 },
    { name: 'Sniper King', tree: 'combate', tier: 1, description: '+1 percepcao. Precisão à distância (Usopp).', bonusAttribute: 'percepcao', bonusAmount: 1 },
    // Akuma no Mi (frutas)
    { name: 'Paramecia Iniciante', tree: 'akuma', tier: 1, description: '+1 poder. Fruta que afeta corpo.', bonusAttribute: 'poder', bonusAmount: 1 },
    { name: 'Logia Iniciante', tree: 'akuma', tier: 2, description: '+2 poder. Fruta elemental (intangível).', bonusAttribute: 'poder', bonusAmount: 2 },
    { name: 'Zoan Iniciante', tree: 'akuma', tier: 1, description: '+1 resistencia. Transformação animal.', bonusAttribute: 'resistencia', bonusAmount: 1 },
    { name: 'Mito Zoan (Lendária)', tree: 'akuma', tier: 3, description: '+3 resistencia. Transformação mítica (dragão, fênix).', bonusAttribute: 'resistencia', bonusAmount: 3 },
  ],
  scenarios: [
    // Início
    { id: 'praia', emoji: '🏖️', title: 'Praia de Ilha Desconhecida', mode: 'adventure', setup: 'Acorda numa praia de uma ilha tropical. Um navio pirata ancorado ao longe. Marcas de batalha na areia. Alguém geme, ferido, atrás de uma pedra.' },
    { id: 'navio', emoji: '⛵', title: 'A Bordo de um Navio', mode: 'adventure', setup: 'Materializa no convés de um navio pirata em alto-mar. A tripulação saca armas: "Um clandestino?! Fala rápido: amigo ou comida pros tubarões?"' },
    { id: 'marinha', emoji: '⚓', title: 'Base da Marinha', mode: 'adventure', setup: 'Surge numa base da Marinha. Soldados de branco te cercam: "Identifique-se! Pirata? Você não está registrado. Prendam-no!"' },
    { id: 'taverna', emoji: '🍺', title: 'Taverna Portuária', mode: 'adventure', setup: 'Aparece numa taverna barulhenta de porto pirata. Piratas bêbados, caçadores de recompensa. Um deles olha seu rosto e franze a testa: "Já vi você em algum cartaz..."' },
    { id: 'grand_line', emoji: '🌊', title: 'Entrada da Grand Line', mode: 'adventure', setup: 'Desperta num bote à deriva na Grand Line, o mar mais perigoso do mundo. Clima insano muda a cada minuto. Um Rei do Mar (monstro colossal) emerge das águas.' },
    { id: 'fruta', emoji: '🍎', title: 'Fruta do Diabo', mode: 'adventure', setup: 'Acorda faminto numa cozinha de navio. Há uma fruta bizarra de espirais na mesa. Você a come sem pensar — e sente seu corpo... mudar.' },
    // Meio
    { id: 'shanks', emoji: '🔴', title: 'Encontro com Yonkou (Shanks)', mode: 'adventure', setup: 'Materializa num bar onde piratas festejam. Um ruivo maneta ergue o copo pra você com um sorriso caloroso — mas o Haki dele faz o ar pesar. "Bebe comigo, forasteiro?"' },
    { id: 'marineford', emoji: '⚔️', title: 'Guerra de Marineford', mode: 'adventure', setup: 'Materializa na maior guerra da história. 100.000 mariners, Barba Branca vs. Almirantes. Luffy está no campo tentando salvar Ace. Está tudo perdido.' },
    { id: 'dressrosa', emoji: '🎪', title: 'Dressrosa (Doflamingo)', mode: 'adventure', setup: 'Acorda na arena de Corrida Coliseu. Doflamingo controla a ilha como marionete. Bonecos voam, pessoas viram brinquedo. "Vai brincar?"' },
    { id: 'whole_cake', emoji: '🍰', title: 'Whole Cake Island', mode: 'adventure', setup: 'Ilha de Big Mom. Doces voam, mas Big Mom quer você. "Faminto." Magia de alma. Relógios de vida, promessas quebradas.' },
    { id: 'wano', emoji: '🏯', title: 'Wano (Kaido)', mode: 'adventure', setup: 'País samurai. Kaido em forma de dragão sobre o castelo. "Prazer em ver você, novo brinquedo." Onigashima em chamas. Luffy em Gear 5.' },
    { id: 'elbaf', emoji: '🗻', title: 'Elbaf (Gigantes)', mode: 'adventure', setup: 'Chega à ilha dos gigantes. Montanhas são casas. Guerreiros de 20m te observam. Loki aprontou.' },
    { id: 'laugh_tale', emoji: '🏝️', title: 'Laugh Tale (One Piece)', mode: 'adventure', setup: 'A última ilha. O One Piece está aqui. Roger riu, chorou. Você vê o tesouro. Mas o que é? Está pronto pra saber?' },
    // Adult
    { id: 'cabine', emoji: '💋', title: 'Cabine da Capitã', mode: 'adult', setup: 'Desperta na cabine luxuosa de uma capitã pirata. Ela te encontra acordado, sorri perigosamente: "Achado no meu navio é meu por direito."' },
    { id: 'boas_palace', emoji: '👑', title: 'Quarto de Boa Hancock', mode: 'adult', setup: 'Hancock te trancou no quarto imperial dela. Sorriso maníaco: "Você olhou pra mim. É MEU agora. Para sempre."' },
    { id: 'bath_alabasta', emoji: '♨️', title: 'Banho Real de Alabasta', mode: 'adult', setup: 'Tivoli te encontra na piscina real. "Você é o novo favorito de Luffy? Prove que vale."' },
    { id: 'robins_silencie', emoji: '📚', title: 'Biblioteca Silenciosa', mode: 'adult', setup: 'Robin te encontra sozinha. Sorriso enigmático. "Quer aprender o que sei? Isso... tem um preço."' },
  ],
  npcs: [...ONEPIECE_NPCS, ...ONEPIECE_NPCS_MINOR],
  npcTables: ONEPIECE_NPC_TABLES,
  systemPromptLore: ONEPIECE_LORE,
  isekaiIntro: `O jogador foi transportado do nosso mundo (2026) pro mundo de One Piece. Sem tripulação, sem barco, sem recompensa, sem fruta (talvez tenha sorte e ache uma). Sem saber nadar bem (talvez já tenha comido fruta e perdido capacidade). Tem Haki latente que pode despertar. Começa do ZERO. A Era dos Piratas está em pleno auge. Seu sonho? Você escolhe.`,
  imageStyle: 'One Piece anime style, Eiichiro Oda art, pirates, ocean adventure, expressive, vibrant',
};
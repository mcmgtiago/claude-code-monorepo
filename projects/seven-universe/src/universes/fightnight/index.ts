import type { Universe } from '../types';
import { FIGHTNIGHT_LORE } from './lore';
import { FIGHTNIGHT_NPCS } from './npcs';
import { FIGHTNIGHT_NPC_TABLES } from './npc-tables';

export const FIGHTNIGHT: Universe = {
  id: 'fightnight',
  name: 'Fight Night',
  tagline: 'Do amador ao cinturão',
  emoji: '🥊',
  theme: { accent: 'red', accentHex: '#dc2626' },
  powerLabel: 'Habilidade',
  hasPowerGenerator: false,
  attributes: [
    { key: 'striking', label: 'Striking', short: 'STR' },
    { key: 'wrestling', label: 'Wrestling', short: 'WRE' },
    { key: 'jiujitsu', label: 'Jiu-Jitsu', short: 'BJJ' },
    { key: 'potencia', label: 'Potência', short: 'POT' },
    { key: 'cardio', label: 'Cardio', short: 'CAR' },
    { key: 'queixo', label: 'Queixo (resistência)', short: 'QXO' },
    { key: 'fightiq', label: 'Fight IQ', short: 'IQ' },
    { key: 'carisma', label: 'Carisma', short: 'CRM' },
  ],
  tiers: [
    { key: 'novato', label: 'Amador', desc: 'Começando na academia', budget: 22, startLevel: 1 },
    { key: 'veterano', label: 'Profissional', desc: 'Lutas regionais/indies', budget: 34, startLevel: 6 },
    { key: 'elite', label: 'Rankeado', desc: 'Top 15 de uma grande organização', budget: 48, startLevel: 15 },
    { key: 'omega', label: 'Campeão/GOAT', desc: 'Cinturão e legado', budget: 80, startLevel: 28 },
  ],
  powerTypes: [
    { key: 'striker', label: 'Striker', desc: 'Especialista em golpes: boxe, muay thai, kickboxing. Busca o nocaute.' },
    { key: 'grappler', label: 'Grappler', desc: 'Wrestling + BJJ. Leva pro chão, controla, finaliza.' },
    { key: 'boxeador', label: 'Boxeador', desc: 'Puro boxe. Mãos rápidas, footwork, 12 rounds.' },
    { key: 'completo', label: 'Lutador Completo (MMA)', desc: 'Domina todas as áreas. O ideal do MMA moderno.' },
  ],
  skills: [
    // Striking
    { name: 'Jab-Direto', tree: 'striking', tier: 1, description: '+1 striking. Fundamentos do boxe.', bonusAttribute: 'striking', bonusAmount: 1 },
    { name: 'Chute Baixo (Low Kick)', tree: 'striking', tier: 1, description: '+1 striking. Destrói a perna do oponente.', bonusAttribute: 'striking', bonusAmount: 1 },
    { name: 'Muay Thai Clinch', tree: 'striking', tier: 2, description: '+2 striking. Joelhadas e cotoveladas no clinch.', bonusAttribute: 'striking', bonusAmount: 2 },
    { name: 'Head Kick', tree: 'striking', tier: 3, description: '+3 striking. Chute na cabeça = nocaute instantâneo.', bonusAttribute: 'striking', bonusAmount: 3 },
    { name: 'Combinações de Boxe', tree: 'striking', tier: 2, description: '+2 striking. Sequências rápidas e precisas.', bonusAttribute: 'striking', bonusAmount: 2 },
    // Wrestling
    { name: 'Takedown Duplo', tree: 'wrestling', tier: 1, description: '+1 wrestling. Derruba o oponente.', bonusAttribute: 'wrestling', bonusAmount: 1 },
    { name: 'Ground and Pound', tree: 'wrestling', tier: 2, description: '+2 wrestling. Socos no chão a partir da montada.', bonusAttribute: 'wrestling', bonusAmount: 2 },
    { name: 'Sprawl (Defesa de Queda)', tree: 'wrestling', tier: 1, description: '+1 wrestling. Anula takedowns.', bonusAttribute: 'wrestling', bonusAmount: 1 },
    { name: 'Controle Dominante', tree: 'wrestling', tier: 3, description: '+3 wrestling. Controla o oponente por rounds inteiros.', bonusAttribute: 'wrestling', bonusAmount: 3 },
    // BJJ
    { name: 'Guarda Fechada', tree: 'jiujitsu', tier: 1, description: '+1 jiujitsu. Defesa e ataque do chão.', bonusAttribute: 'jiujitsu', bonusAmount: 1 },
    { name: 'Mata-Leão (Rear Naked Choke)', tree: 'jiujitsu', tier: 2, description: '+2 jiujitsu. Estrangulamento pelas costas.', bonusAttribute: 'jiujitsu', bonusAmount: 2 },
    { name: 'Armlock/Triângulo', tree: 'jiujitsu', tier: 2, description: '+2 jiujitsu. Finalizações de submissão.', bonusAttribute: 'jiujitsu', bonusAmount: 2 },
    { name: 'Faixa-Preta', tree: 'jiujitsu', tier: 3, description: '+3 jiujitsu. Finaliza qualquer um no chão.', bonusAttribute: 'jiujitsu', bonusAmount: 3 },
    // Físico
    { name: 'Cardio de Ferro', tree: 'fisico', tier: 2, description: '+2 cardio. Ritmo insano por 5 rounds.', bonusAttribute: 'cardio', bonusAmount: 2 },
    { name: 'Queixo de Granito', tree: 'fisico', tier: 2, description: '+2 queixo. Aguenta bombas sem cair.', bonusAttribute: 'queixo', bonusAmount: 2 },
    { name: 'Potência de Nocaute', tree: 'fisico', tier: 3, description: '+3 potencia. Poder de finalizar com um golpe.', bonusAttribute: 'potencia', bonusAmount: 3 },
    // Mental / Carreira
    { name: 'Fight IQ', tree: 'mental', tier: 2, description: '+2 fightiq. Lê o oponente e adapta a estratégia.', bonusAttribute: 'fightiq', bonusAmount: 2 },
    { name: 'Trash Talk', tree: 'mental', tier: 1, description: '+1 carisma. Vende a luta, provoca o rival.', bonusAttribute: 'carisma', bonusAmount: 1 },
    { name: 'Superstar do Esporte', tree: 'mental', tier: 3, description: '+3 carisma. Enche arenas, vende pay-per-views.', bonusAttribute: 'carisma', bonusAmount: 3 },
    { name: 'Killer Instinct', tree: 'mental', tier: 3, description: '+3 fightiq. Sente o oponente ferido e vai pra finalização.', bonusAttribute: 'fightiq', bonusAmount: 3 },
  ],
  scenarios: [
    // Início de carreira
    { id: 'primeira_academia', emoji: '🥋', title: 'Primeiro Dia na Academia', mode: 'adventure', setup: 'O cheiro de suor e couro. Você entra numa academia de MMA pela primeira vez. O treinador te mede de cima a baixo: "Então você quer lutar? Todo mundo quer, até levar o primeiro soco na cara. Sobe no tatame. Vamos ver do que você é feito."' },
    { id: 'luta_amadora', emoji: '🥊', title: 'Primeira Luta Amadora', mode: 'adventure', setup: 'Ginásio pequeno, 200 pessoas, um octógono improvisado. Sua estreia. O oponente te encara do outro lado, mais experiente. Seu coração martela. O árbitro pergunta: "Prontos? LUTEM!"' },
    { id: 'card_regional', emoji: '📋', title: 'Card Regional', mode: 'adventure', setup: 'Sua quarta luta profissional num card regional. Um olheiro do UFC está na plateia. Uma vitória impressionante pode mudar tudo. O oponente é um prospecto invicto e arrogante que te ignorou na pesagem.' },
    { id: 'contrato_ufc', emoji: '✍️', title: 'A Ligação que Muda Tudo', mode: 'adventure', setup: 'Seu telefone toca. É o matchmaker do UFC. "Temos uma vaga de última hora no card do sábado. O adversário é rankeado, você aceita em cima da hora. É agora ou nunca, garoto. Topa?"' },
    // Meio de carreira
    { id: 'pesagem', emoji: '⚖️', title: 'Encarada na Pesagem', mode: 'adventure', setup: 'Corte de peso brutal terminado, você sobe na balança desidratado. O rival está a centímetros do seu rosto na encarada. Os flashes explodem. As câmeras querem drama. O que você faz — encara em silêncio, provoca, ou algo mais?' },
    { id: 'luta_titulo', emoji: '🏆', title: 'Luta pelo Cinturão', mode: 'adventure', setup: 'Arena lotada, 20 mil pessoas gritando. Cinco rounds pelo título mundial. O campeão te encara do outro canto — invicto, mortal. Anos de sacrifício levaram a este momento. O locutor grita seu nome. É agora.' },
    { id: 'coletiva', emoji: '🎙️', title: 'Coletiva de Imprensa Explosiva', mode: 'adventure', setup: 'Mesa de coletiva, você e o rival lado a lado antes da grande luta. Ele começa a te provocar sobre sua família. A imprensa filma tudo. A tensão pode explodir a qualquer segundo. Como você reage — no microfone ou com as mãos?' },
    { id: 'lesao', emoji: '🩹', title: 'A Lesão', mode: 'adventure', setup: 'No meio do fight camp, algo estala no seu joelho. O médico é claro: "Se você lutar assim, pode acabar sua carreira. Mas essa é a maior luta da sua vida, e cancelar pode fechar a janela pra sempre." Sua decisão.' },
    // Boxe
    { id: 'ringue_boxe', emoji: '🥊', title: 'Doze Rounds', mode: 'adventure', setup: 'Ringue de boxe em Las Vegas. Doze rounds pela unificação dos cinturões. Seu oponente tem mãos pesadas e você já está no oitavo round, exausto, sangrando pelo supercílio. O cutman tem 60 segundos pra te consertar. Aguenta mais quatro?' },
    // Bastidor
    { id: 'gym_madrugada', emoji: '🌙', title: 'Academia de Madrugada', mode: 'adventure', setup: 'Três da manhã, só você e o saco de pancada na academia vazia. Obsessão. A próxima luta não sai da sua cabeça. Então a porta abre — alguém mais entrou. Um rival? Um treinador? Alguém que também não consegue dormir?' },
    // Adultos
    { id: 'pos_vitoria', emoji: '🔥', title: 'Comemoração Pós-Vitória', mode: 'adult', setup: 'Você venceu. A adrenalina ainda queima no sangue, o corpo dolorido mas eufórico. No quarto de hotel, uma ring girl / fã / colega de equipe que te admirava fecha a porta: "Você foi INCRÍVEL lá dentro. Eu preciso de você agora, campeão."' },
    { id: 'massagem', emoji: '💆', title: 'Recuperação Pós-Treino', mode: 'adult', setup: 'Corpo destruído depois do fight camp mais duro da vida. A fisioterapeuta/massagista da equipe começa a trabalhar seus músculos numa sala privada. As mãos dela descem, o clima muda: "Você carrega tanta tensão... deixa eu cuidar de tudo."' },
    { id: 'rival_tensao', emoji: '⚡', title: 'Tensão com a Rival', mode: 'adult', setup: 'Depois de meses de trash talk e provocação, você e sua rival se encontram sozinhos no corredor do hotel na noite antes da luta. O ódio e a tensão são indistinguíveis do desejo. Ela te empurra contra a parede: "Amanhã eu te destruo. Mas hoje..."' },
  ],
  npcs: FIGHTNIGHT_NPCS,
  npcTables: FIGHTNIGHT_NPC_TABLES,
  systemPromptLore: FIGHTNIGHT_LORE,
  isekaiIntro: `Este NÃO é um isekai. É o mundo REAL do combate profissional (boxe, UFC, MMA). O jogador é um lutador — pode começar amador na academia ou já estabelecido. A carreira vai do primeiro treino ao cinturão mundial, passando por corte de peso, fight camps, rivalidades, trash talk e o momento da verdade no octógono/ringue. Combate é REAL: resultado incerto, dor real, glória e derrota. Use as ferramentas de combate (roll_check pra golpes/quedas/finalizações, manage_combat pra rastrear a luta round a round). Calibre a dificuldade pelo ranking dos oponentes.`,
  imageStyle: 'photorealistic, MMA and boxing photography, octagon and boxing ring, sweat and intensity, sports action, dramatic arena lighting',
};

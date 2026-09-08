import type { Universe } from '../types';
import { BASQUETE_LORE } from './lore';
import { BASQUETE_NPCS } from './npcs';
import { BASQUETE_NPC_TABLES } from './npc-tables';

export const BASQUETE: Universe = {
  id: 'basquete',
  name: 'NBA Superstar',
  tagline: 'Da quadra de rua ao anel',
  emoji: '🏀',
  theme: { accent: 'orange', accentHex: '#f97316' },
  powerLabel: 'Talento',
  hasPowerGenerator: false,
  attributes: [
    { key: 'arremesso', label: 'Arremesso', short: 'ARR' },
    { key: 'finalizacao', label: 'Finalização', short: 'FIN' },
    { key: 'handle', label: 'Handle (drible)', short: 'HDL' },
    { key: 'defesa', label: 'Defesa', short: 'DEF' },
    { key: 'atletismo', label: 'Atletismo', short: 'ATL' },
    { key: 'iq', label: 'Basketball IQ', short: 'IQ' },
    { key: 'carisma', label: 'Carisma', short: 'CAR' },
    { key: 'clutch', label: 'Clutch', short: 'CLU' },
  ],
  tiers: [
    { key: 'novato', label: 'Recruta', desc: 'High school / universidade', budget: 22, startLevel: 1 },
    { key: 'veterano', label: 'Rookie NBA', desc: 'Draftado, provando valor', budget: 34, startLevel: 6 },
    { key: 'elite', label: 'All-Star', desc: 'Elite da liga', budget: 48, startLevel: 15 },
    { key: 'omega', label: 'MVP / Lenda', desc: 'Rosto da NBA, disputa títulos', budget: 80, startLevel: 28 },
  ],
  powerTypes: [
    { key: 'armador', label: 'Armador (PG)', desc: 'Cérebro do time, distribui e controla o ritmo (Curry, CP3).' },
    { key: 'alaarmador', label: 'Ala-armador (SG)', desc: 'Pontuador e arremessador de elite (Booker, Mitchell).' },
    { key: 'ala', label: 'Ala (SF)', desc: 'Versátil, faz de tudo (LeBron, Durant).' },
    { key: 'alapivo', label: 'Ala-pivô (PF)', desc: 'Força + arremesso, domínio físico (Giannis, AD).' },
    { key: 'pivo', label: 'Pivô (C)', desc: 'Rei do garrafão, rebotes e tocos (Jokić, Embiid).' },
  ],
  skills: [
    // Arremesso
    { name: 'Jump Shot', tree: 'ataque', tier: 1, description: '+1 arremesso. Arremesso de média com boa mecânica.', bonusAttribute: 'arremesso', bonusAmount: 1 },
    { name: 'Bomba de Três', tree: 'ataque', tier: 2, description: '+2 arremesso. Range infinito, três pontos como Curry.', bonusAttribute: 'arremesso', bonusAmount: 2 },
    { name: 'Arremesso Impossível', tree: 'ataque', tier: 3, description: '+3 arremesso. Acerta com mão na cara, do meio da quadra.', bonusAttribute: 'arremesso', bonusAmount: 3 },
    // Finalização
    { name: 'Bandeja Criativa', tree: 'ataque', tier: 1, description: '+1 finalizacao. Termina jogadas perto da cesta.', bonusAttribute: 'finalizacao', bonusAmount: 1 },
    { name: 'Poster Dunk', tree: 'ataque', tier: 2, description: '+2 finalizacao. Enterrada na cara do adversário.', bonusAttribute: 'finalizacao', bonusAmount: 2 },
    { name: 'Domínio no Garrafão', tree: 'ataque', tier: 3, description: '+3 finalizacao. Impossível de parar perto do aro.', bonusAttribute: 'finalizacao', bonusAmount: 3 },
    // Handle
    { name: 'Crossover', tree: 'controle', tier: 1, description: '+1 handle. Drible que quebra tornozelos.', bonusAttribute: 'handle', bonusAmount: 1 },
    { name: 'Handle de Elite', tree: 'controle', tier: 2, description: '+2 handle. Domínio total, cria espaço à vontade.', bonusAttribute: 'handle', bonusAmount: 2 },
    { name: 'Passe Mágico', tree: 'controle', tier: 3, description: '+3 iq. Visão de jogo de gênio (Jokić-style).', bonusAttribute: 'iq', bonusAmount: 3 },
    // Defesa
    { name: 'Marcação Pegajosa', tree: 'defesa', tier: 1, description: '+1 defesa. Gruda no adversário.', bonusAttribute: 'defesa', bonusAmount: 1 },
    { name: 'Tocador (Rim Protector)', tree: 'defesa', tier: 2, description: '+2 defesa. Protege o aro, intimida ataques.', bonusAttribute: 'defesa', bonusAmount: 2 },
    { name: 'DPOY (Defensor do Ano)', tree: 'defesa', tier: 3, description: '+3 defesa. Trava o melhor jogador do outro time.', bonusAttribute: 'defesa', bonusAmount: 3 },
    // Físico
    { name: 'Impulsão', tree: 'fisico', tier: 1, description: '+1 atletismo. Salto explosivo.', bonusAttribute: 'atletismo', bonusAmount: 1 },
    { name: 'Motor Infinito', tree: 'fisico', tier: 2, description: '+2 atletismo. Corre a quadra toda o jogo inteiro.', bonusAttribute: 'atletismo', bonusAmount: 2 },
    { name: 'Freak Atlético', tree: 'fisico', tier: 3, description: '+3 atletismo. Corpo sobre-humano (Giannis-style).', bonusAttribute: 'atletismo', bonusAmount: 3 },
    // Mental / Carreira
    { name: 'Sangue Frio', tree: 'mental', tier: 2, description: '+2 clutch. Acerta a cesta da vitória sem tremer.', bonusAttribute: 'clutch', bonusAmount: 2 },
    { name: 'Mamba Mentality', tree: 'mental', tier: 3, description: '+3 clutch. Obsessão por vencer, mata jogos no final.', bonusAttribute: 'clutch', bonusAmount: 3 },
    { name: 'Rosto da Franquia', tree: 'mental', tier: 2, description: '+2 carisma. Vende ingressos, camisas e tênis.', bonusAttribute: 'carisma', bonusAmount: 2 },
    { name: 'Ícone Global', tree: 'mental', tier: 3, description: '+3 carisma. Marca mundial, além do basquete.', bonusAttribute: 'carisma', bonusAmount: 3 },
  ],
  scenarios: [
    // Início de carreira
    { id: 'quadra_rua', emoji: '🏙️', title: 'Quadra de Rua', mode: 'adventure', setup: 'Quadra rachada no bairro, rede de corrente, o barulho da bola ecoando. Você domina o playground local. Hoje um olheiro de AAU apareceu na arquibancada de concreto — dizem que ele leva garotos pro próximo nível. Prove que você é o melhor daqui.' },
    { id: 'high_school', emoji: '🏫', title: 'Final do Estadual (High School)', mode: 'adventure', setup: 'Ginásio lotado, placar empatado, 10 segundos no relógio. É a final estadual e olheiros de universidades estão na plateia. O técnico desenha a última jogada — e ela é pra você. Toda a sua bolsa universitária pode depender dos próximos 10 segundos.' },
    { id: 'draft', emoji: '🎩', title: 'Noite do Draft', mode: 'adventure', setup: 'Terno de grife, família ao lado, câmeras da ESPN na sua mesa. O comissário se aproxima do microfone. Sua vida inteira levou a este momento: "With the pick, the [franquia] selects..." Você prende a respiração.' },
    { id: 'estreia_nba', emoji: '🏀', title: 'Estreia na NBA', mode: 'adventure', setup: 'Vestiário da NBA pela primeira vez. Sua camisa pendurada com seu nome. 19 mil pessoas lá fora, adversários que você via na TV agora do outro lado da quadra. O técnico te olha: "Você entra no segundo quarto, rookie. Mostra que merece estar aqui."' },
    // Meio de carreira
    { id: 'trade_rumor', emoji: '📱', title: 'Rumores de Troca', mode: 'adventure', setup: 'Seu celular explode de notificações. Um insider vazou que a franquia está te oferecendo em troca. Você construiu uma vida nessa cidade. Reunião com o GM marcada pra amanhã. Você pede pra ficar, exige clareza, ou força uma saída pro seu destino ideal?' },
    { id: 'all_star', emoji: '⭐', title: 'Fim de Semana All-Star', mode: 'adventure', setup: 'Você foi selecionado pro seu primeiro All-Star Game. Luzes, celebridades no courtside, o Dunk Contest, festas VIP a noite toda. É o auge do glamour da NBA — e todos os olhos do mundo do entretenimento estão em você.' },
    { id: 'lesao', emoji: '🩹', title: 'A Lesão', mode: 'adventure', setup: 'Uma aterrissagem errada, um estalo no joelho, o silêncio da arena. O médico do time tem a cara fechada: "Precisamos de exames, mas... pode ser o ligamento." Sua carreira, seu contrato, seu futuro — tudo em suspenso na maca enquanto te carregam pra fora.' },
    { id: 'contrato_max', emoji: '💰', title: 'Contrato Máximo', mode: 'adventure', setup: 'Free agency. Três franquias te querem, uma oferece o supermax de 300 milhões. Seu agente sorri: "Você chegou, garoto." Mas o dinheiro maior nem sempre é o anel maior. Legado ou fortuna? Lealdade ou ambição?' },
    { id: 'finals', emoji: '🏆', title: 'Jogo 7 das Finais', mode: 'adventure', setup: 'Finais da NBA, Jogo 7, decisão do campeonato. Anos de trabalho, sangue e sacrifício resumidos em 48 minutos. A arena ruge. O adversário é o melhor do mundo. É por isso que você joga. Bola ao alto.' },
    // Bastidor / glamour
    { id: 'sneaker_deal', emoji: '👟', title: 'Contrato de Tênis', mode: 'adventure', setup: 'Executivos da Nike, Adidas e Jordan Brand numa sala de reunião de arranha-céu, disputando sua assinatura. Um tênis com o SEU nome, milhões por ano, sua marca global. Mas cada marca quer moldar sua imagem de um jeito. Quem você quer ser pro mundo?' },
    // Adultos
    { id: 'pos_vitoria', emoji: '🔥', title: 'Comemoração Pós-Título', mode: 'adult', setup: 'Você é campeão. Champanhe escorrendo, a festa do título numa boate privada de Miami, o troféu na mão. A adrenalina e a euforia são elétricas. Uma modelo/celebridade que estava no courtside te encontra na área VIP: "Campeão... eu preciso comemorar com você. A sério."' },
    { id: 'courtside', emoji: '💋', title: 'Encontro no Courtside', mode: 'adult', setup: 'Uma influencer/celebridade famosa esteve na primeira fila te assistindo o jogo inteiro, olhos só em você. Depois do jogo, ela te espera do lado de fora do vestiário, chave do hotel na mão: "Você foi lindo lá dentro. Quero você agora, longe das câmeras."' },
    { id: 'hotel_road', emoji: '🏨', title: 'Road Trip Solitária', mode: 'adult', setup: 'Terceira cidade em cinco dias, quarto de hotel de luxo, 1 da manhã, o corpo cansado mas a mente ligada. Batem na porta — uma companheira de viagem (fisioterapeuta / repórter / colega) que também não consegue dormir na estrada: "Vi que sua luz tava acesa..."' },
  ],
  npcs: BASQUETE_NPCS,
  npcTables: BASQUETE_NPC_TABLES,
  systemPromptLore: BASQUETE_LORE,
  isekaiIntro: `Este NÃO é um isekai. É o mundo REAL do basquete profissional (NBA). O jogador é um jogador de basquete — pode começar como recruta de high school/universidade ou já estabelecido na liga. A carreira vai da quadra de rua ao anel de campeão, passando pelo draft, contratos, playoffs, lesões, trades e a fama. O foco é DUPLO: a carreira esportiva (jogos, treino, evolução na quadra) E o mundo glamouroso dos bastidores (dinheiro, fama, festas, relacionamentos, tentações). Use as ferramentas de combate/rolagem pra momentos decisivos de quadra (arremessos clutch, defesas, jogadas). Calibre a dificuldade pelo nível dos adversários (novato vs. All-Stars).`,
  imageStyle: 'photorealistic, NBA basketball photography, arena lighting, dynamic sports action, courtside glamour, dramatic slam dunks',
};

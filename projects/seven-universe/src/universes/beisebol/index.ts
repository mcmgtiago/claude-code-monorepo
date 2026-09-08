import type { Universe } from '../types';
import { BEISEBOL_LORE } from './lore';
import { BEISEBOL_NPCS } from './npcs';
import { BEISEBOL_NPC_TABLES } from './npc-tables';

export const BEISEBOL: Universe = {
  id: 'beisebol',
  name: 'MLB Legend',
  tagline: 'Das minors ao Hall da Fama',
  emoji: '⚾',
  theme: { accent: 'blue', accentHex: '#2563eb' },
  powerLabel: 'Talento',
  hasPowerGenerator: false,
  attributes: [
    { key: 'rebatida', label: 'Rebatida (contato)', short: 'REB' },
    { key: 'poder', label: 'Poder (home run)', short: 'POD' },
    { key: 'arremesso', label: 'Arremesso', short: 'ARR' },
    { key: 'defesa', label: 'Defesa', short: 'DEF' },
    { key: 'velocidade', label: 'Velocidade', short: 'VEL' },
    { key: 'iq', label: 'Baseball IQ', short: 'IQ' },
    { key: 'carisma', label: 'Carisma', short: 'CAR' },
    { key: 'clutch', label: 'Clutch', short: 'CLU' },
  ],
  tiers: [
    { key: 'novato', label: 'Prospecto', desc: 'High school / minor leagues', budget: 22, startLevel: 1 },
    { key: 'veterano', label: 'Rookie MLB', desc: 'Chamado pra The Show', budget: 34, startLevel: 6 },
    { key: 'elite', label: 'All-Star', desc: 'Elite da liga', budget: 48, startLevel: 15 },
    { key: 'omega', label: 'MVP / Lenda', desc: 'Face da MLB, rumo a Cooperstown', budget: 80, startLevel: 28 },
  ],
  powerTypes: [
    { key: 'arremessador', label: 'Arremessador (Pitcher)', desc: 'O rei do jogo. Reta, curva, slider — domina o duelo (deGrom, Ohtani).' },
    { key: 'sluggger', label: 'Slugger (Poder)', desc: 'Rebatedor de home runs, força bruta (Judge, Ruth).' },
    { key: 'contato', label: 'Rebatedor de Contato', desc: 'Média alta, acerta tudo, ledor de arremessos.' },
    { key: 'fivetool', label: 'Five-Tool Player', desc: 'Rebate, corre, defende, tem braço e poder — completo (Trout, Acuña).' },
    { key: 'ohtani', label: 'Two-Way (Ohtani-style)', desc: 'Arremessa E rebate. O unicórnio raríssimo do beisebol.' },
  ],
  skills: [
    // Rebatida
    { name: 'Bom Olho', tree: 'ataque', tier: 1, description: '+1 rebatida. Lê arremessos e faz contato.', bonusAttribute: 'rebatida', bonusAmount: 1 },
    { name: 'Rebatedor de Contato', tree: 'ataque', tier: 2, description: '+2 rebatida. Acerta quase tudo, média alta.', bonusAttribute: 'rebatida', bonusAmount: 2 },
    { name: 'Máquina de Hits', tree: 'ataque', tier: 3, description: '+3 rebatida. Impossível de dominar no plate.', bonusAttribute: 'rebatida', bonusAmount: 3 },
    // Poder
    { name: 'Força na Tacada', tree: 'ataque', tier: 1, description: '+1 poder. Manda a bola longe.', bonusAttribute: 'poder', bonusAmount: 1 },
    { name: 'Rei do Home Run', tree: 'ataque', tier: 2, description: '+2 poder. HR de 130 metros regularmente.', bonusAttribute: 'poder', bonusAmount: 2 },
    { name: 'Grand Slam Legend', tree: 'ataque', tier: 3, description: '+3 poder. Manda pra fora do estádio (Ruth-style).', bonusAttribute: 'poder', bonusAmount: 3 },
    // Arremesso
    { name: 'Reta Rápida', tree: 'arremesso', tier: 1, description: '+1 arremesso. Fastball sólida.', bonusAttribute: 'arremesso', bonusAmount: 1 },
    { name: 'Arsenal de Pitches', tree: 'arremesso', tier: 2, description: '+2 arremesso. Curva, slider, changeup — engana qualquer um.', bonusAttribute: 'arremesso', bonusAmount: 2 },
    { name: 'Ás Dominante', tree: 'arremesso', tier: 3, description: '+3 arremesso. Reta de 100mph + controle cirúrgico (deGrom-style).', bonusAttribute: 'arremesso', bonusAmount: 3 },
    // Defesa
    { name: 'Luva Segura', tree: 'defesa', tier: 1, description: '+1 defesa. Pega tudo que vem.', bonusAttribute: 'defesa', bonusAmount: 1 },
    { name: 'Gold Glove', tree: 'defesa', tier: 2, description: '+2 defesa. Defesas de destaque, braço forte.', bonusAttribute: 'defesa', bonusAmount: 2 },
    { name: 'Defesa Web Gem', tree: 'defesa', tier: 3, description: '+3 defesa. Jogadas impossíveis que viram highlight.', bonusAttribute: 'defesa', bonusAmount: 3 },
    // Velocidade
    { name: 'Corredor Ágil', tree: 'fisico', tier: 1, description: '+1 velocidade. Rápido nas bases.', bonusAttribute: 'velocidade', bonusAmount: 1 },
    { name: 'Ladrão de Bases', tree: 'fisico', tier: 2, description: '+2 velocidade. Rouba bases à vontade.', bonusAttribute: 'velocidade', bonusAmount: 2 },
    { name: 'Speed Demon', tree: 'fisico', tier: 3, description: '+3 velocidade. Transforma singles em triples.', bonusAttribute: 'velocidade', bonusAmount: 3 },
    // Mental / Carreira
    { name: 'Sangue Frio', tree: 'mental', tier: 2, description: '+2 clutch. Rebate/arremessa na hora decisiva.', bonusAttribute: 'clutch', bonusAmount: 2 },
    { name: 'Walk-Off King', tree: 'mental', tier: 3, description: '+3 clutch. O herói do nono inning, sempre.', bonusAttribute: 'clutch', bonusAmount: 3 },
    { name: 'Ídolo da Torcida', tree: 'mental', tier: 2, description: '+2 carisma. A cidade te ama, enche o estádio.', bonusAttribute: 'carisma', bonusAmount: 2 },
    { name: 'Herói Nacional', tree: 'mental', tier: 3, description: '+3 carisma. Ídolo em dois países (Japão/Lat.Am).', bonusAttribute: 'carisma', bonusAmount: 3 },
  ],
  scenarios: [
    // Início de carreira
    { id: 'campo_terra', emoji: '🌾', title: 'Campo de Terra Batida', mode: 'adventure', setup: 'Campo simples do interior, alambrado enferrujado, poeira no ar. Você é a estrela do time local. Hoje um olheiro de organização da MLB veio com o radar de velocidade e a prancheta. Cada arremesso, cada tacada, pode ser sua entrada no sonho. Ele te observa em silêncio.' },
    { id: 'showcase', emoji: '📋', title: 'Showcase de Prospectos', mode: 'adventure', setup: 'Estádio universitário cheio de olheiros de todas as 30 franquias, radares apontados. É o showcase que define seu draft. Sua vez de rebater / arremessar diante de dezenas de olhos que decidem futuros. A pressão é surreal. Mostra o que você tem.' },
    { id: 'draft', emoji: '🎩', title: 'Dia do Draft', mode: 'adventure', setup: 'Você e sua família assistindo à transmissão. Boné de cada time na mesa. O telefone toca — é uma organização confirmando que vai te escolher. Bônus de assinatura na casa dos milhões. O sonho de infância virando realidade em tempo real.' },
    { id: 'minors', emoji: '🚌', title: 'A Vida nas Minor Leagues', mode: 'adventure', setup: 'Ônibus de 8 horas, hotel barato, salário que mal paga a comida. Estádio de liga A com 300 pessoas na arquibancada. Este é o funil onde a maioria dos sonhos morre. Você precisa se destacar HOJE pra subir de nível — ou apodrecer nas minors pra sempre.' },
    { id: 'call_up', emoji: '📞', title: 'The Call-Up', mode: 'adventure', setup: 'O manager das minors te chama na sala. Você prende a respiração, esperando o pior. Ele sorri: "Arruma as malas, garoto. Você foi chamado. Vai jogar na MLB amanhã." Anos de ônibus e sacrifício levaram a este momento. The Show te espera.' },
    // Meio de carreira
    { id: 'estreia_mlb', emoji: '⚾', title: 'Estreia na MLB', mode: 'adventure', setup: 'Estádio lendário, 45 mil pessoas, o gramado perfeito. Sua primeira vez no plate / no montinho da MLB. Do outro lado, jogadores que você via na TV. O locutor anuncia seu nome pela primeira vez. Suas pernas tremem. Play ball.' },
    { id: 'nono_inning', emoji: '🔥', title: 'Fim do Nono Inning', mode: 'adventure', setup: 'Nono inning, dois outs, jogo empatado, corredor na terceira base. A multidão de pé, rugindo. Se você é rebatedor, é a chance do walk-off. Se é arremessador, precisa fechar o jogo. Tudo se resume a este duelo. Silêncio antes da tempestade.' },
    { id: 'trade_deadline', emoji: '📱', title: 'Trade Deadline', mode: 'adventure', setup: 'É 31 de julho, prazo final de trocas. Rumores de que você será enviado a um time contender (ou a um time em reconstrução). Seu celular não para. O GM quer conversar. Sua vida pode mudar de cidade nas próximas horas. Você tem alguma cláusula, alguma voz?' },
    { id: 'lesao_cotovelo', emoji: '🩹', title: 'O Estalo no Cotovelo', mode: 'adventure', setup: 'No meio de um arremesso, uma dor aguda no cotovelo. Todo arremessador teme essas palavras: "ligamento colateral ulnar". A cirurgia Tommy John significa 12-18 meses fora. O médico tem a ressonância na mão e a cara fechada. Seu futuro pende de um exame.' },
    { id: 'contrato_gigante', emoji: '💰', title: 'Contrato de Meio Bilhão', mode: 'adventure', setup: 'Free agency. Seu agente entra na sala com um sorriso: "Eles ofereceram. 10 anos, 500 milhões. Recorde da MLB." Mas o time que oferece mais não é o que você ama, e legado nem sempre segue o dinheiro. A decisão da sua vida.' },
    { id: 'world_series', emoji: '🏆', title: 'Jogo 7 da World Series', mode: 'adventure', setup: 'World Series, Jogo 7, o clássico definitivo do beisebol. Décadas de tradição, uma cidade inteira segurando a respiração. Você é a peça central do momento decisivo. É por isso que você jogou 162 jogos. É por isso que você existe como atleta. Agora.' },
    // Adultos
    { id: 'pos_titulo', emoji: '🍾', title: 'Festa do Título', mode: 'adult', setup: 'Campeão da World Series. Champanhe explodindo no vestiário, a festa da cidade, o troféu erguido. Mais tarde, numa suíte privada, uma modelo/celebridade que acompanhou toda a corrida ao título te encontra: "Você é o herói da cidade agora. Deixa eu te dar meu troféu particular."' },
    { id: 'noite_cidade', emoji: '🌃', title: 'Noite na Cidade Grande', mode: 'adult', setup: 'Recém-chegado à MLB numa cidade grande com dinheiro novo no bolso. Numa boate exclusiva, uma mulher deslumbrante reconhece você da TV: "Você é o novato de quem todo mundo fala. Eu queria ver de perto se o astro é bom fora do campo também."' },
    { id: 'road_trip', emoji: '🏨', title: 'Road Trip de 10 Dias', mode: 'adult', setup: 'Temporada de 162 jogos, road trip interminável, mais um quarto de hotel genérico, saudade e tédio. Batem na porta — uma companheira de viagem do staff do time (fisioterapeuta / repórter / relações públicas), também solitária na estrada: "Não consigo dormir. Posso ficar um pouco?"' },
  ],
  npcs: BEISEBOL_NPCS,
  npcTables: BEISEBOL_NPC_TABLES,
  systemPromptLore: BEISEBOL_LORE,
  isekaiIntro: `Este NÃO é um isekai. É o mundo REAL do beisebol profissional (MLB). O jogador é um jogador de beisebol — pode começar como prospecto de high school/minor leagues ou já estabelecido na MLB. A carreira vai do campo de terra batida ao Hall da Fama, passando pela longa jornada das minors, o draft, a call-up, contratos milionários, playoffs, lesões e a World Series. O foco é DUPLO: a carreira esportiva (o duelo mental pitcher x batter, jogos, evolução) E o mundo dos bastidores (dinheiro, fama, a vida de astro, relacionamentos). Use as ferramentas de rolagem pros momentos decisivos (o arremesso clutch, a tacada no nono inning, o duelo). Calibre a dificuldade pelo nível dos adversários (minors vs. All-Stars).`,
  imageStyle: 'photorealistic, MLB baseball photography, stadium lighting, pitcher vs batter duel, dramatic home run, classic americana',
};

import type { Universe } from '../types';
import { REALLIFE_LORE } from './lore';
import { REALLIFE_NPCS } from './npcs';
import { REALLIFE_NPC_TABLES } from './npc-tables';

export const REALLIFE: Universe = {
  id: 'reallife',
  name: 'Real Life',
  tagline: 'Fama, poder e desejo nos bastidores',
  emoji: '🌟',
  theme: { accent: 'pink', accentHex: '#ec4899' },
  powerLabel: 'Influência',
  hasPowerGenerator: false,
  attributes: [
    { key: 'fisico', label: 'Físico', short: 'FIS' },
    { key: 'combate', label: 'Combate', short: 'CMB' },
    { key: 'carisma', label: 'Carisma', short: 'CAR' },
    { key: 'seducao', label: 'Sedução', short: 'SED' },
    { key: 'astucia', label: 'Astúcia', short: 'AST' },
    { key: 'influencia', label: 'Influência', short: 'INF' },
    { key: 'percepcao', label: 'Percepção', short: 'PER' },
    { key: 'discricao', label: 'Discrição', short: 'DIS' },
  ],
  tiers: [
    { key: 'novato', label: 'Ninguém', desc: 'Sem nome, sem acesso', budget: 22, startLevel: 1 },
    { key: 'veterano', label: 'Nome no Meio', desc: 'Conhecido no círculo', budget: 34, startLevel: 6 },
    { key: 'elite', label: 'Figura de Peso', desc: 'Poder e acesso reais', budget: 48, startLevel: 15 },
    { key: 'omega', label: 'Lenda / Ícone', desc: 'Topo absoluto do mundo VIP', budget: 80, startLevel: 28 },
  ],
  powerTypes: [
    { key: 'seguranca', label: 'Segurança / Bodyguard', desc: 'Protege VIPs. Acesso aos bastidores, corpo treinado, discrição.' },
    { key: 'celebridade', label: 'Celebridade / VIP', desc: 'Você É a estrela: popstar, ator, atleta, influencer.' },
    { key: 'magnata', label: 'Magnata / Bilionário', desc: 'Poder pelo dinheiro. Compra acesso, pessoas, silêncio.' },
    { key: 'aspirante', label: 'Aspirante', desc: 'Quer entrar no mundo VIP. Começa de baixo, sobe na base do charme e da astúcia.' },
  ],
  skills: [
    // Físico / Combate (segurança)
    { name: 'Combate Corpo-a-Corpo', tree: 'seguranca', tier: 1, description: '+1 combate. Treino de luta profissional.', bonusAttribute: 'combate', bonusAmount: 1 },
    { name: 'Leitura de Ameaças', tree: 'seguranca', tier: 1, description: '+1 percepcao. Identifica perigos antes que aconteçam.', bonusAttribute: 'percepcao', bonusAmount: 1 },
    { name: 'Proteção Executiva', tree: 'seguranca', tier: 2, description: '+2 combate. Protocolo de escolta VIP.', bonusAttribute: 'combate', bonusAmount: 2 },
    { name: 'Sombra Invisível', tree: 'seguranca', tier: 2, description: '+2 discricao. Presente sem ser notado.', bonusAttribute: 'discricao', bonusAmount: 2 },
    { name: 'Guarda-costas de Elite', tree: 'seguranca', tier: 3, description: '+3 combate. O melhor da profissão, disputadíssimo.', bonusAttribute: 'combate', bonusAmount: 3 },
    { name: 'Forma Física', tree: 'seguranca', tier: 1, description: '+1 fisico. Corpo treinado e resistente.', bonusAttribute: 'fisico', bonusAmount: 1 },
    // Social / Sedução
    { name: 'Charme Natural', tree: 'social', tier: 1, description: '+1 carisma. As pessoas gostam de você.', bonusAttribute: 'carisma', bonusAmount: 1 },
    { name: 'Olhar Sedutor', tree: 'social', tier: 1, description: '+1 seducao. Sabe usar o corpo e o olhar.', bonusAttribute: 'seducao', bonusAmount: 1 },
    { name: 'Amante Irresistível', tree: 'social', tier: 3, description: '+3 seducao. Poucos resistem a você.', bonusAttribute: 'seducao', bonusAmount: 3 },
    { name: 'Presença de Palco', tree: 'social', tier: 2, description: '+2 carisma. Domina qualquer ambiente.', bonusAttribute: 'carisma', bonusAmount: 2 },
    { name: 'Ícone Adorado', tree: 'social', tier: 3, description: '+3 carisma. Milhões te idolatram.', bonusAttribute: 'carisma', bonusAmount: 3 },
    // Astúcia / Influência
    { name: 'Networking', tree: 'poder', tier: 1, description: '+1 influencia. Conhece as pessoas certas.', bonusAttribute: 'influencia', bonusAmount: 1 },
    { name: 'Jogo de Bastidores', tree: 'poder', tier: 2, description: '+2 astucia. Manipula os jogos de poder.', bonusAttribute: 'astucia', bonusAmount: 2 },
    { name: 'Poder Financeiro', tree: 'poder', tier: 2, description: '+2 influencia. Dinheiro abre todas as portas.', bonusAttribute: 'influencia', bonusAmount: 2 },
    { name: 'Controle de Narrativa', tree: 'poder', tier: 3, description: '+3 influencia. Você controla a imprensa e as redes.', bonusAttribute: 'influencia', bonusAmount: 3 },
    { name: 'Mestre da Discrição', tree: 'poder', tier: 3, description: '+3 discricao. Nenhum segredo vaza por você.', bonusAttribute: 'discricao', bonusAmount: 3 },
    { name: 'Leitura de Pessoas', tree: 'poder', tier: 2, description: '+2 percepcao. Sabe o que cada um quer e esconde.', bonusAttribute: 'percepcao', bonusAmount: 2 },
    // Talento (celebridade)
    { name: 'Talento Bruto', tree: 'talento', tier: 1, description: '+1 carisma. Dom natural (música, atuação, esporte).', bonusAttribute: 'carisma', bonusAmount: 1 },
    { name: 'Estrela em Ascensão', tree: 'talento', tier: 2, description: '+2 influencia. Sua fama cresce rápido.', bonusAttribute: 'influencia', bonusAmount: 2 },
    { name: 'Lenda Viva', tree: 'talento', tier: 3, description: '+3 influencia + 3 carisma. Você é história.', bonusAttribute: 'influencia', bonusAmount: 3 },
  ],
  scenarios: [
    // Segurança
    { id: 'primeiro_dia', emoji: '🕴️', title: 'Primeiro Dia de Serviço', mode: 'adventure', setup: 'Terno preto, ponto no ouvido. Seu primeiro dia protegendo uma celebridade global. O chefe de segurança te avisa: "Regra número um: você não existe. Regra dois: o que vê aqui, morre com você. Ela chega em cinco minutos."' },
    { id: 'camarim', emoji: '🎤', title: 'Backstage do Show', mode: 'adventure', setup: 'Você guarda a porta do camarim durante um show pra 50 mil pessoas. A estrela sai do palco suada, eufórica, adrenalina pura. Ela te olha diferente hoje: "Fica. Preciso descer dessa energia... e você é a única pessoa real aqui."' },
    { id: 'ameaca', emoji: '⚠️', title: 'Ameaça Real', mode: 'adventure', setup: 'Um stalker furou o perímetro no hotel. A pessoa que você protege está em perigo real. Corredor, adrenalina, decisões em segundos. Depois, no quarto seguro, ela tremendo nos seus braços: "Você me salvou. Não me deixa sozinha essa noite."' },
    { id: 'jato', emoji: '✈️', title: 'Jato Particular', mode: 'adventure', setup: 'Voo transatlântico, só vocês dois na cabine de couro do jato. 12 mil metros de altitude, champanhe, luzes baixas. A celebridade tira os saltos, se aproxima: "Odeio voar sozinha. E você... não é como os outros seguranças."' },
    // Celebridade / VIP
    { id: 'tapete_vermelho', emoji: '🎬', title: 'Tapete Vermelho', mode: 'adventure', setup: 'Flashes explodem. Você desce da limusine no tapete vermelho de uma première em Los Angeles. Repórteres gritam seu nome. Esta noite decide sua carreira. E alguém importante está te observando de longe, interessado.' },
    { id: 'penthouse', emoji: '🏙️', title: 'Sua Penthouse', mode: 'adventure', setup: 'Cobertura em Manhattan, vista pra cidade toda iluminada. Você é rico e famoso, mas sozinho de novo numa noite de quinta. Seu celular vibra — um convite para a festa mais exclusiva do ano. Ou você fica, ou vai atrás do que realmente deseja.' },
    { id: 'festa_vip', emoji: '🥂', title: 'Festa Mais Exclusiva do Ano', mode: 'adventure', setup: 'Villa em Ibiza, DJ mundial, os rostos mais famosos e belos do planeta em um só lugar. Champanhe, olhares, tensão. Alguém que você sempre admirou de longe cruza a sala na sua direção, sorrindo só pra você.' },
    { id: 'escandalo', emoji: '📰', title: 'À Beira do Escândalo', mode: 'adventure', setup: 'Um paparazzo tem uma foto que pode destruir sua carreira. Seu agente ligou em pânico. Você tem até amanhã de manhã pra resolver — com dinheiro, charme, ameaça ou um acordo... de outro tipo.' },
    // Magnata
    { id: 'reuniao_poder', emoji: '💼', title: 'Reunião de Bilhões', mode: 'adventure', setup: 'Sala de reunião no topo de um arranha-céu. Você comanda a mesa. Um acordo de bilhões de dólares na balança, e rivais tentando te derrubar. Depois, sua assistente fecha a porta: "Todos foram embora. Você venceu. Como quer... comemorar?"' },
    { id: 'iate', emoji: '🛥️', title: 'Iate em Mônaco', mode: 'adventure', setup: 'Seu iate ancorado na costa de Mônaco durante o Grand Prix. Convidados de elite, champanhe francês, o mar do Mediterrâneo. Uma modelo/ator famoso que você convidou se aproxima da amurada ao seu lado: "Lugar lindo. Mas eu vim mesmo foi por você."' },
    // Adultos
    { id: 'quarto_hotel', emoji: '🛏️', title: 'Suíte Presidencial', mode: 'adult', setup: 'Suíte presidencial de um hotel 7 estrelas em Dubai. Depois do evento, só vocês dois. A tensão que vinha crescendo há semanas finalmente transborda. Ela/ele deixa cair a alça do vestido: "Chega de fingir. Todo mundo já foi embora."' },
    { id: 'depois_show', emoji: '🔥', title: 'Depois do Show', mode: 'adult', setup: 'A adrenalina do palco ainda queima. No camarim trancado, a estrela ainda de figurino te encurrala contra a parede: "Cinquenta mil pessoas gritaram meu nome hoje. Mas é o SEU nome que eu quero gritar agora."' },
    { id: 'piscina', emoji: '💦', title: 'Piscina da Mansão à Noite', mode: 'adult', setup: 'Mansão em Beverly Hills, madrugada, a festa acabou. Só resta você e uma celebridade na piscina infinita iluminada. Ela desliza pra dentro da água, olhando pra você por cima do ombro: "Vem. Ninguém mais tá aqui pra nos ver."' },
    { id: 'nos_bastidores', emoji: '💋', title: 'Segredo nos Bastidores', mode: 'adult', setup: 'Corredor escuro atrás do palco, música ecoando ao longe. Duas pessoas famosas que "oficialmente não se dão bem" se encontram no escuro. Mãos, respiração ofegante, o risco de serem pegos a qualquer segundo: "Rápido, antes que dem por nossa falta."' },
  ],
  npcs: REALLIFE_NPCS,
  npcTables: REALLIFE_NPC_TABLES,
  systemPromptLore: REALLIFE_LORE,
  isekaiIntro: `Este NÃO é um isekai. É o mundo REAL contemporâneo (2020s). O jogador é uma pessoa deste mundo — pode ser o SEGURANÇA que protege celebridades e VIPs, ou a PRÓPRIA pessoa importante (celebridade, atleta, bilionário, influencer). O foco é o mundo dos bastidores dos ricos e famosos: luxo, poder, fama, desejo, roleplay social e adulto. As celebridades são pessoas públicas reais interpretadas em cenários fictícios de bastidores — humanizadas, com desejos e vulnerabilidades que o público não vê. Descreva TUDO com riqueza visual máxima: aparência, maquiagem, roupas de grife, acessórios, ambientes de luxo.`,
  imageStyle: 'photorealistic, celebrity paparazzi and glamour photography, luxury lifestyle, cinematic lighting, high fashion, red carpet',
};

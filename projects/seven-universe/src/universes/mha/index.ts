import type { Universe } from '../types';
import { MHA_LORE } from './lore';
import { MHA_NPCS } from './npcs';
import { MHA_NPCS_MINOR } from './npcs-minor';
import { MHA_NPC_TABLES } from './npc-tables';

export const MHA: Universe = {
  id: 'mha',
  name: 'My Hero Academia',
  tagline: 'Plus Ultra!',
  emoji: '💥',
  theme: { accent: 'green', accentHex: '#22c55e' },
  powerLabel: 'Quirk',
  hasPowerGenerator: true,
  attributes: [
    { key: 'forca', label: 'Força', short: 'FOR' },
    { key: 'velocidade', label: 'Velocidade', short: 'VEL' },
    { key: 'resistencia', label: 'Resistência', short: 'RES' },
    { key: 'quirk', label: 'Quirk', short: 'QRK' },
    { key: 'controle', label: 'Controle', short: 'CTR' },
    { key: 'tecnica', label: 'Técnica', short: 'TEC' },
    { key: 'percepcao', label: 'Percepção', short: 'PER' },
    { key: 'presenca', label: 'Presença', short: 'PRE' },
  ],
  tiers: [
    { key: 'novato', label: 'Sem Licença', desc: 'Estudante ou civil', budget: 22, startLevel: 1 },
    { key: 'veterano', label: 'Herói Iniciante', desc: 'UA / licença provisória', budget: 34, startLevel: 6 },
    { key: 'elite', label: 'Pro Hero', desc: 'Herói profissional ranqueado', budget: 48, startLevel: 15 },
    { key: 'omega', label: 'Top 10 / Vilão Supremo', desc: 'All Might / All For One level', budget: 80, startLevel: 30 },
  ],
  powerTypes: [
    { key: 'emitter', label: 'Emitter', desc: 'Quirk que emite/gera algo (fogo, explosão, gelo).' },
    { key: 'transformation', label: 'Transformation', desc: 'Quirk que transforma seu corpo.' },
    { key: 'mutant', label: 'Mutant/Heteromorph', desc: 'Quirk permanente no corpo (asas, cauda, pele).' },
    { key: 'sem_quirk', label: 'Sem Quirk', desc: 'Os 20% sem poder. Pode receber um depois (One For All?).' },
  ],
  skills: [
    // Quirk
    { name: 'Controle de Quirk', tree: 'quirk', tier: 1, description: '+1 controle. Domina o básico do poder.', bonusAttribute: 'controle', bonusAmount: 1 },
    { name: 'Movimento Especial', tree: 'quirk', tier: 2, description: '+2 quirk. Técnica assinatura devastadora.', bonusAttribute: 'quirk', bonusAmount: 2 },
    { name: 'Quirk Awakening', tree: 'quirk', tier: 3, description: '+3 quirk. Poder desperta a novo patamar.', bonusAttribute: 'quirk', bonusAmount: 3 },
    { name: 'Full Cowl', tree: 'quirk', tier: 3, description: '+3 controle. Poder distribuído pelo corpo (Deku).', bonusAttribute: 'controle', bonusAmount: 3 },
    { name: 'Full Cowl 100%', tree: 'quirk', tier: 3, description: '+3 forca. Poder máximo (quebra o corpo).', bonusAttribute: 'forca', bonusAmount: 3 },
    // Físico
    { name: 'Combate Corporal', tree: 'fisico', tier: 1, description: '+1 forca. Treino de luta.', bonusAttribute: 'forca', bonusAmount: 1 },
    { name: 'Reflexos Heroicos', tree: 'fisico', tier: 2, description: '+2 velocidade. Reação sobre-humana.', bonusAttribute: 'velocidade', bonusAmount: 2 },
    { name: 'Resistência de Herói', tree: 'fisico', tier: 2, description: '+2 resistencia. Aguenta punição.', bonusAttribute: 'resistencia', bonusAmount: 2 },
    { name: 'Manobra de Combate', tree: 'fisico', tier: 3, description: '+3 velocidade. Movimentação de combate de elite.', bonusAttribute: 'velocidade', bonusAmount: 3 },
    // Mental
    { name: 'Análise de Quirk', tree: 'mental', tier: 1, description: '+1 percepcao. Estuda poderes inimigos.', bonusAttribute: 'percepcao', bonusAmount: 1 },
    { name: 'Estratégia de Combate', tree: 'mental', tier: 2, description: '+2 percepcao. Planeja combate perfeito.', bonusAttribute: 'percepcao', bonusAmount: 2 },
    { name: 'Rescue Techniques', tree: 'mental', tier: 2, description: '+2 tecnica. Salvamento em desastres.', bonusAttribute: 'tecnica', bonusAmount: 2 },
    // Social
    { name: 'Presença de Herói', tree: 'social', tier: 2, description: '+2 presenca. Inspira e acalma (All Might).', bonusAttribute: 'presenca', bonusAmount: 2 },
    { name: 'Símbolo da Paz', tree: 'social', tier: 3, description: '+3 presenca. Presença que muda o campo (All Might).', bonusAttribute: 'presenca', bonusAmount: 3 },
    // Quirks específicos
    { name: 'One For All (OFA)', tree: 'especial', tier: 3, description: '+3 quirk + 3 forca. Poder acumulado de 8 gerações.', bonusAttribute: 'quirk', bonusAmount: 3 },
    { name: 'All For One (Roubar Quirks)', tree: 'especial', tier: 3, description: '+3 quirk. Rouba e acumula Quirks (vilão).', bonusAttribute: 'quirk', bonusAmount: 3 },
    { name: 'Explosion Style', tree: 'especial', tier: 2, description: '+2 quirk. Estilo explosivo (Bakugo).', bonusAttribute: 'quirk', bonusAmount: 2 },
    { name: 'Elemental Mastery', tree: 'especial', tier: 2, description: '+2 controle. Domínio de elemento (gelo/fogo, Todoroki).', bonusAttribute: 'controle', bonusAmount: 2 },
  ],
  scenarios: [
    { id: 'ua', emoji: '🏫', title: 'Portões da UA', mode: 'adventure', setup: 'Acorda diante da UA, a escola de heróis mais famosa. Estudantes de uniforme passam. Um professor de visual cansado (Aizawa?) te encara: "Você não é aluno. O que faz aqui?"' },
    { id: 'ataque_vilao', emoji: '💥', title: 'Ataque de Vilão', mode: 'adventure', setup: 'Materializa numa rua movimentada no meio de um ataque de vilão. Prédios desabando, civis fugindo. Heróis chegam. E você está bem no meio do caos.' },
    { id: 'exame', emoji: '📝', title: 'Exame de Admissão', mode: 'adventure', setup: 'Surge numa cidade-teste falsa, robôs gigantes avançando. É o exame de entrada da UA — e você caiu no meio sem saber as regras. Pontos por robô destruído.' },
    { id: 'usj', emoji: '🌊', title: 'USJ Invadido', mode: 'adventure', setup: 'Acorda numa instalação de treinamento (USJ) sendo invadida pela Liga dos Vilões. Um monstro (Nomu) ruge. Estudantes em pânico. Você precisa escolher um lado.' },
    { id: 'beco_vilao', emoji: '🌃', title: 'Beco Sombrio', mode: 'adventure', setup: 'Materializa num beco. Um vilão está prestes a ferir alguém. Nenhum herói à vista. Só você — e a decisão de agir ou fugir.' },
    { id: 'liga', emoji: '🖤', title: 'Esconderijo da Liga', mode: 'adventure', setup: 'Desperta num bar decadente. Figuras sinistras te cercam — a Liga dos Vilões. Shigaraki coça o pescoço: "Um recruta? Ou só comida pro Nomu? Mostre seu Quirk."' },
    { id: 'sem_quirk', emoji: '✨', title: 'O Despertar', mode: 'adventure', setup: 'Acorda num mundo onde todos têm poderes — menos você. Zombado por ser "sem Quirk". Mas hoje, algo dentro de você começa a... mudar.' },
    { id: 'dormitorio', emoji: '🚿', title: 'Dormitório da UA', mode: 'adult', setup: 'Materializa no dormitório da UA à noite. Uma estudante heroína atraente sai do banho, te vê: "Você não deveria estar aqui... mas já que está..."' },
    { id: 'heroina', emoji: '💋', title: 'Agência de Heroína', mode: 'adult', setup: 'Desperta na agência de uma Pro Hero sedutora (estilo Midnight). Ela sorri, o Quirk dela deixando o ar pesado: "Bem-vindo. Deixe-me te ensinar umas... técnicas."' },
  ],
  npcs: [...MHA_NPCS, ...MHA_NPCS_MINOR],
  npcTables: MHA_NPC_TABLES,
  systemPromptLore: MHA_LORE,
  isekaiIntro: `O jogador foi transportado do nosso mundo (2026) pro mundo dos Quirks. Talvez tenha ganhado um Quirk no transporte (ou perdeu sua memória de ter um?), talvez seja "sem Quirk" (os 20%, discriminados). Sem licença de herói, sem escola, sem registro. Começa do ZERO. Usar Quirk sem licença = crime (mesmo pra ajudar). O sistema é rigoroso mas o mundo é insano.`,
  imageStyle: 'My Hero Academia anime style, superhero, dynamic action, Kohei Horikoshi art, vibrant',
};

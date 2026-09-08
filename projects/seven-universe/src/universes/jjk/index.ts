import type { Universe } from '../types';
import { JJK_LORE } from './lore';
import { JJK_NPCS } from './npcs';
import { JJK_NPCS_MINOR } from './npcs-minor';
import { JJK_NPC_TABLES } from './npc-tables';

export const JJK: Universe = {
  id: 'jjk',
  name: 'Jujutsu Kaisen',
  tagline: 'Energia amaldiçoada corre em você',
  emoji: '👁️',
  theme: { accent: 'red', accentHex: '#b91c1c' },
  powerLabel: 'Técnica Amaldiçoada',
  hasPowerGenerator: true,
  attributes: [
    { key: 'energia', label: 'Energia Amaldiçoada', short: 'ENE' },
    { key: 'tecnica', label: 'Técnica', short: 'TEC' },
    { key: 'combate', label: 'Combate Físico', short: 'CMB' },
    { key: 'velocidade', label: 'Velocidade', short: 'VEL' },
    { key: 'controle', label: 'Controle', short: 'CTR' },
    { key: 'percepcao', label: 'Percepção', short: 'PER' },
    { key: 'vontade', label: 'Vontade', short: 'VON' },
    { key: 'presenca', label: 'Presença', short: 'PRE' },
  ],
  tiers: [
    { key: 'novato', label: 'Grau 4', desc: 'Feiticeiro iniciante', budget: 22, startLevel: 1 },
    { key: 'veterano', label: 'Grau 2-3', desc: 'Feiticeiro competente', budget: 34, startLevel: 6 },
    { key: 'elite', label: 'Grau 1', desc: 'Feiticeiro de elite', budget: 48, startLevel: 15 },
    { key: 'omega', label: 'Grau Especial', desc: 'Gojo/Sukuna level', budget: 80, startLevel: 30 },
  ],
  powerTypes: [
    { key: 'tecnica_herdada', label: 'Técnica Herdada', desc: 'Técnica amaldiçoada de clã (Limitless, Ten Shadows).' },
    { key: 'tecnica_propria', label: 'Técnica Própria', desc: 'Sua técnica amaldiçoada única.' },
    { key: 'heavy_hitter', label: 'Punho Amaldiçoado', desc: 'Sem técnica, mas energia bruta imensa (Todo/Yuji).' },
    { key: 'recipiente', label: 'Recipiente', desc: 'Hospeda um espírito amaldiçoado (Yuji/Sukuna).' },
  ],
  skills: [
    // Energia básica
    { name: 'Reforço de Energia', tree: 'energia', tier: 1, description: '+1 combate. Reveste corpo com energia amaldiçoada.', bonusAttribute: 'combate', bonusAmount: 1 },
    { name: 'Sentir Maldições', tree: 'percepcao', tier: 1, description: '+1 percepcao. Detecta espíritos.', bonusAttribute: 'percepcao', bonusAmount: 1 },
    { name: 'Divergent Fist', tree: 'combate', tier: 1, description: '+1 combate. Golpe com delay (energia atrasada).', bonusAttribute: 'combate', bonusAmount: 1 },
    // Combate
    { name: 'Black Flash', tree: 'combate', tier: 2, description: '+2 combate. Impacto de energia distorcida (2.5x).', bonusAttribute: 'combate', bonusAmount: 2 },
    { name: 'Consecutive Black Flash', tree: 'combate', tier: 3, description: '+3 combate. Black Flash em ritmo.', bonusAttribute: 'combate', bonusAmount: 3 },
    // Técnicas
    { name: 'Simple Domain', tree: 'controle', tier: 2, description: '+2 controle. Neutraliza domínios inimigos.', bonusAttribute: 'controle', bonusAmount: 2 },
    { name: 'Domain Expansion (Domínio)', tree: 'especial', tier: 3, description: '+3 tecnica. Territory com acerto garantido.', bonusAttribute: 'tecnica', bonusAmount: 3 },
    { name: 'Reverse Cursed Technique', tree: 'especial', tier: 3, description: '+3 controle. Cura via energia positiva.', bonusAttribute: 'controle', bonusAmount: 3 },
    { name: 'RCT Output (Curar Outros)', tree: 'especial', tier: 3, description: '+3 controle. Pode curar outros (Gojo/Sukuna).', bonusAttribute: 'controle', bonusAmount: 3 },
    // Técnicas específicas
    { name: 'Infinity (Limitless)', tree: 'herdado', tier: 2, description: '+2 controle. Espaço infinito (defesa absoluta).', bonusAttribute: 'controle', bonusAmount: 2 },
    { name: 'Ten Shadows (Invocação)', tree: 'herdado', tier: 2, description: '+2 tecnica. 10 shikigamis das sombras.', bonusAttribute: 'tecnica', bonusAmount: 2 },
    { name: 'Cursed Speech', tree: 'herdado', tier: 2, description: '+2 presenca. Palavras = poder.', bonusAttribute: 'presenca', bonusAmount: 2 },
    { name: 'Boogie Woogie', tree: 'herdado', tier: 2, description: '+2 velocidade. Troca de posição via aplauso.', bonusAttribute: 'velocidade', bonusAmount: 2 },
    { name: 'Straw Doll', tree: 'herdado', tier: 1, description: '+1 tecnica. Boneco de palha (dano transferido).', bonusAttribute: 'tecnica', bonusAmount: 1 },
    // Binding Vow
    { name: 'Binding Vow (Self)', tree: 'binding', tier: 2, description: '+2 energia. Limita em troca de poder (Nanami-style).', bonusAttribute: 'energia', bonusAmount: 2 },
    { name: 'Binding Vow (Target)', tree: 'binding', tier: 3, description: '+3 energia. Pacto que impõe ao inimigo.', bonusAttribute: 'energia', bonusAmount: 3 },
    // Velocidade
    { name: 'Shunpo Amaldiçoado', tree: 'velocidade', tier: 1, description: '+1 velocidade. Movimento burst curto.', bonusAttribute: 'velocidade', bonusAmount: 1 },
    { name: 'Flash Movement', tree: 'velocidade', tier: 2, description: '+2 velocidade. Teleporte aparente.', bonusAttribute: 'velocidade', bonusAmount: 2 },
    // Armas
    { name: 'Cursed Tool', tree: 'arma', tier: 1, description: '+1 tecnica. Usa ferramenta amaldiçoada (katana, pregos).', bonusAttribute: 'tecnica', bonusAmount: 1 },
    { name: 'Special Grade Cursed Tool', tree: 'arma', tier: 3, description: '+3 tecnica. Arma grau especial (Draining Moon Blade, Inverted Spear).', bonusAttribute: 'tecnica', bonusAmount: 3 },
  ],
  scenarios: [
    // Início
    { id: 'escola', emoji: '🏫', title: 'Escola Jujutsu Tóquio', mode: 'adventure', setup: 'Acorda no pátio da Escola Técnica de Jujutsu de Tóquio. Energia amaldiçoada densa no ar. Um estudante te encara: "Você tem energia... mas não te reconheço. Como entrou?"' },
    { id: 'maldicao', emoji: '👹', title: 'Espírito Amaldiçoado', mode: 'adventure', setup: 'Materializa num prédio abandonado. Uma maldição grotesca se arrasta em sua direção, faminta por sua energia. Ninguém pra ajudar.' },
    { id: 'shibuya', emoji: '🌃', title: 'Incidente de Shibuya', mode: 'adventure', setup: 'Surge no meio do caos de Shibuya — véu roxo cobrindo tudo, maldições por toda parte, feiticeiros lutando. Você caiu no pior dia possível.' },
    { id: 'escola_kyoto', emoji: '⚔️', title: 'Evento de Intercâmbio', mode: 'adventure', setup: 'Aparece no meio de uma competição entre escolas. Feiticeiros jovens te cercam, achando que você é do time rival: "Alvo à vista!"' },
    { id: 'gojo_encontro', emoji: '👁️', title: 'Encontro com Gojo', mode: 'adventure', setup: 'Materializa e sente presença ESMAGADORA. Homem de venda nos olhos e sorriso: "Ooh? Você surgiu do nada. Que interessante. Eu sou o mais forte, aliás."' },
    { id: 'sukuna_voice', emoji: '💀', title: 'Voz de Sukuna', mode: 'adventure', setup: 'Acorda com marcas se formando na pele. Voz ancestral dentro de você: "Então... um novo recipiente. Divirta-me, ou morra."' },
    // Meio
    { id: 'colonia_tokyo', emoji: '🎯', title: 'Colônia de Tóquio (Culling Game)', mode: 'adventure', setup: 'Você está numa Colônia. Pontos = matar. Outros feiticeiros caçam. Regras: sobreviva, mate, acumule pontos. Opção de fugir quase zero.' },
    { id: 'kenjaku_conversa', emoji: '🧠', title: 'Kenjaku te Aborda', mode: 'adventure', setup: 'Um homem com cicatrizes na testa te encontra. "Você é interessante. Faria um pacto? Dou poder. Tiro limitações. Mas... há um custo."' },
    { id: 'domain_fight', emoji: '🔮', title: 'Domain vs Domain', mode: 'adventure', setup: 'Você está preso num Domain Expansion inimigo. Tudo que vem, acerta. Como escapar? Simple Domain? Ou abrir o seu próprio?' },
    { id: 'sukuna_awakened', emoji: '👑', title: 'Sukuna Desperto', mode: 'adventure', setup: 'Sukuna tomou controle de Megumi. Malevolent Shrine ativa. Feiticeiros gritam. Gojo está selado. Quem enfrenta o Rei?' },
    // Adult
    { id: 'quarto_pos_missao', emoji: '💋', title: 'Pós-Missão', mode: 'adult', setup: 'Desperta no apartamento de uma feiticeira depois de missão perigosa. Adrenalina. Ela se aproxima: "Sobreviver sempre me deixa com fome de vida."' },
    { id: 'noite_maki', emoji: '⚔️', title: 'Noite com Maki', mode: 'adult', setup: 'Maki treina até tarde. Suada, forte. Te vê olhando: "Quer treinar? Ou quer outra coisa?" Sorri com desdém — mas a mão leva à sua mão.' },
    { id: 'noite_mei_mei', emoji: '💰', title: 'Noite com Mei Mei', mode: 'adult', setup: 'Mei Mei (Grau 1) te contrata pra missão. Paga bem. Mas no hotel: "Serviços adicionais não entram na conta. Só na memória."' },
    { id: 'noite_utahime', emoji: '🍶', title: 'Noite Utahime', mode: 'adult', setup: 'Utahime (professora Kyoto) te encontra em bar jujutsu. Bêbada. "Gojo é um idiota. Você também. Mas você... pelo menos é bonito."' },
  ],
  npcs: [...JJK_NPCS, ...JJK_NPCS_MINOR],
  npcTables: JJK_NPC_TABLES,
  systemPromptLore: JJK_LORE,
  isekaiIntro: `O jogador foi transportado do nosso mundo. Ganhou energia amaldiçoada (rara em humanos comuns) ou hospeda algo. Sem escola, sem grau registrado. Um feiticeiro não-registrado que apareceu do nada. Pode ter técnica amaldiçoada ou não (depende da criação). Começa do ZERO.`,
  imageStyle: 'Jujutsu Kaisen anime style, cursed energy, dark, Gege Akutami art, intense, urban horror',
};
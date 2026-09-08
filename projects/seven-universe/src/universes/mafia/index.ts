import type { Universe } from '../types';
import { MAFIA_LORE } from './lore';
import { MAFIA_NPCS } from './npcs';
import { MAFIA_NPC_TABLES } from './npc-tables';

export const MAFIA: Universe = {
  id: 'mafia',
  name: 'Máfia',
  tagline: 'Sangue é negócio',
  emoji: '🎩',
  theme: { accent: 'zinc', accentHex: '#a1a1aa' },
  powerLabel: 'Influência',
  hasPowerGenerator: false,
  attributes: [
    { key: 'forca', label: 'Força', short: 'FOR' },
    { key: 'mira', label: 'Mira', short: 'MIR' },
    { key: 'resistencia', label: 'Resistência', short: 'RES' },
    { key: 'astucia', label: 'Astúcia', short: 'AST' },
    { key: 'intimidacao', label: 'Intimidação', short: 'INT' },
    { key: 'carisma', label: 'Carisma', short: 'CAR' },
    { key: 'percepcao', label: 'Percepção', short: 'PER' },
    { key: 'frieza', label: 'Frieza', short: 'FRI' },
  ],
  tiers: [
    { key: 'novato', label: 'Ninguém', desc: 'Sem nome nas ruas', budget: 22, startLevel: 1 },
    { key: 'veterano', label: 'Soldado', desc: 'Associado feito', budget: 34, startLevel: 6 },
    { key: 'elite', label: 'Capo', desc: 'Comanda território', budget: 48, startLevel: 15 },
    { key: 'omega', label: 'Don', desc: 'Chefe da família', budget: 80, startLevel: 28 },
  ],
  powerTypes: [
    { key: 'enforcer', label: 'Enforcer', desc: 'Músculo, cobrador, matador. Resolve problemas com violência.' },
    { key: 'brains', label: 'Conselheiro', desc: 'Cérebro da operação. Estratégia, manipulação, política.' },
    { key: 'hustler', label: 'Vigarista', desc: 'Golpes, falsificação, lavagem. Nunca usa as mãos se pode usar palavras.' },
    { key: 'heir', label: 'Herdeiro', desc: 'Nasceu no sangue. Filho do padrinho. Expectativas pesam.' },
  ],
  skills: [
    // Social
    { name: 'Olhar que Mata', tree: 'social', tier: 1, description: '+1 intimidacao. Intimida sem palavras.', bonusAttribute: 'intimidacao', bonusAmount: 1 },
    { name: 'Lingua de Cobra', tree: 'social', tier: 1, description: '+1 astucia. Mente sem piscar.', bonusAttribute: 'astucia', bonusAmount: 1 },
    { name: 'Charme de Rua', tree: 'social', tier: 1, description: '+1 carisma. Conquista qualquer um.', bonusAttribute: 'carisma', bonusAmount: 1 },
    { name: 'Negociador', tree: 'social', tier: 2, description: '+2 carisma. Fecha qualquer acordo.', bonusAttribute: 'carisma', bonusAmount: 2 },
    { name: 'Padrinho', tree: 'social', tier: 3, description: '+3 carisma. Faz ofertas irrecusáveis.', bonusAttribute: 'carisma', bonusAmount: 3 },
    { name: 'Senhor do Medo', tree: 'social', tier: 3, description: '+3 intimidacao. Presença que paralisa.', bonusAttribute: 'intimidacao', bonusAmount: 3 },
    // Combate
    { name: 'Mão Firme', tree: 'combate', tier: 1, description: '+1 mira. Não treme ao puxar o gatilho.', bonusAttribute: 'mira', bonusAmount: 1 },
    { name: 'Briga de Rua', tree: 'combate', tier: 1, description: '+1 forca. Luta suja, eficaz.', bonusAttribute: 'forca', bonusAmount: 1 },
    { name: 'Navalha na Boina', tree: 'combate', tier: 2, description: '+2 mira. Corte assinatura de gangue.', bonusAttribute: 'mira', bonusAmount: 2 },
    { name: 'Executador', tree: 'combate', tier: 2, description: '+2 frieza. Mata limpo e sem rastro.', bonusAttribute: 'frieza', bonusAmount: 2 },
    { name: 'Atirador de Elite', tree: 'combate', tier: 3, description: '+3 mira. Um tiro, uma morte.', bonusAttribute: 'mira', bonusAmount: 3 },
    { name: 'Durão', tree: 'combate', tier: 2, description: '+2 resistencia. Aguenta surra e volta.', bonusAttribute: 'resistencia', bonusAmount: 2 },
    // Astúcia
    { name: 'Rede de Informantes', tree: 'astucia', tier: 2, description: '+2 percepcao. Sabe tudo antes de todos.', bonusAttribute: 'percepcao', bonusAmount: 2 },
    { name: 'Vigarista', tree: 'astucia', tier: 2, description: '+2 astucia. Golpes, falsificação, lavagem.', bonusAttribute: 'astucia', bonusAmount: 2 },
    { name: 'Mestre da Corrupção', tree: 'astucia', tier: 3, description: '+3 astucia. Compra polícia, políticos, juízes.', bonusAttribute: 'astucia', bonusAmount: 3 },
    { name: 'Leitura de Pessoas', tree: 'astucia', tier: 1, description: '+1 percepcao. Sabe quando mentem.', bonusAttribute: 'percepcao', bonusAmount: 1 },
    // Mental
    { name: 'Sangue Frio', tree: 'mental', tier: 2, description: '+2 frieza. Tortura/mata sem remorso.', bonusAttribute: 'frieza', bonusAmount: 2 },
    { name: 'Nervos de Aço', tree: 'mental', tier: 3, description: '+3 frieza. Nada abala. Poker face perfeito.', bonusAttribute: 'frieza', bonusAmount: 3 },
    { name: 'Dirigir Perseguição', tree: 'mental', tier: 1, description: '+1 percepcao. Foge da polícia dirigindo.', bonusAttribute: 'percepcao', bonusAmount: 1 },
  ],
  scenarios: [
    { id: 'beco', emoji: '🌃', title: 'Beco de Birmingham', mode: 'adventure', setup: 'Acorda num beco encharcado dos anos 1920. Botas gastas, boina na cabeça. Uma briga de facas acontece ao virar a esquina. Sangue na parede.' },
    { id: 'pub', emoji: '🍺', title: 'Pub dos Peaky', mode: 'adventure', setup: 'Materializa dentro de um pub esfumaçado. Homens de boina e navalha te encaram: "Nunca te vi por aqui. Quem mandou você, hmm?"' },
    { id: 'corrego', emoji: '🏭', title: 'Fábrica', mode: 'adventure', setup: 'Surge numa fábrica abandonada. Dois homens torturam um terceiro num canto. Te veem: "Merda. Testemunha. Escolhe: ajuda ou vira o próximo."' },
    { id: 'funeral', emoji: '⚰️', title: 'Funeral de um Chefe', mode: 'adventure', setup: 'Aparece num funeral de um chefe mafioso. Famílias rivais presentes. Tensão no ar. Alguém te confunde com um enviado — "O Don espera sua mensagem."' },
    { id: 'casino', emoji: '🎰', title: 'Cassino Clandestino', mode: 'adventure', setup: 'Materializa num cassino ilegal nos porões da cidade. Apostas altas, whisky, tensão. Um jogador te deve dinheiro — e você não lembra de ter emprestado.' },
    { id: 'corrida', emoji: '🐎', title: 'Corrida de Cavalos', mode: 'adventure', setup: 'Surge no hipódromo no dia da grande corrida. A família controla o resultado. Mas alguém sabotou o plano. O Capo te puxa: "Resolva. Agora. Ou pague com sangue."' },
    { id: 'clube_noturno', emoji: '💋', title: 'Clube Noturno', mode: 'adult', setup: 'Acorda num camarim de clube noturno dos anos 20. Uma dançarina do cabaré te olha pelo espelho, cigarro nos lábios: "Você é do tipo perigoso. Eu gosto de homens perigosos."' },
    { id: 'escritorio', emoji: '🖤', title: 'Escritório do Don', mode: 'adult', setup: 'Materializa no escritório privado de uma Don (mulher chefe da família). Porta trancada. Ela serve whisky: "Negocios e prazer, querido. Nessa ordem... ou não."' },
    // Inícios clássicos de isekai
    { id: 'iso_caminhao', emoji: '🚚', title: 'Morte e Renascimento', mode: 'adventure', setup: 'A última coisa que lembra é o farol de um caminhão. Depois, escuridão. Agora acorda no banco de trás de um carro dos anos 1920, terno alheio no corpo, vivo. O motorista te olha pelo retrovisor: "Acordou, hein? O chefe quer falar com você. Espero que tenha uma boa explicação."' },
    { id: 'iso_ritual', emoji: '🔮', title: 'Sessão que Deu Errado', mode: 'adventure', setup: 'Uma cartomante cigana num porão fez um ritual — e você foi PUXADO do seu mundo para os anos 1920. Ela recua, aterrorizada: "Eu chamei um espírito... mas veio um homem de roupas do futuro. O que você é? E o que faço com você agora?"' },
    { id: 'iso_portal_jogo', emoji: '🎮', title: 'Sugado pela Tela', mode: 'adventure', setup: 'Você assistia/jogava sobre gângsteres. A tela brilhou branco — e agora está DENTRO do submundo dos anos 1920. Você conhece as famílias, as traições, os golpes. Mas os revólveres são reais, e dois homens de boina te encurralam num beco.' },
    { id: 'iso_bebe_memoria', emoji: '👶', title: 'Renascido com Memórias', mode: 'adventure', setup: 'Você reencarnou nesta era anos atrás, filho de imigrantes pobres, mas guardou as memórias da vida moderna. Hoje adulto, o submundo te chama. Você sabe como o crime organizado funciona — e como pode subir mais rápido que qualquer um.' },
    { id: 'iso_sonho', emoji: '💤', title: 'Acordou em Outra Época', mode: 'adventure', setup: 'Você dormiu no seu mundo. Acordou num beco encharcado de uma cidade industrial dos anos 1920, roupas modernas fora de lugar. Nenhuma explicação. Uma briga de facas termina a poucos metros — e o vencedor te encara, lâmina pingando.' },
    { id: 'iso_divida', emoji: '🎲', title: 'Herança de uma Dívida', mode: 'adventure', setup: 'Você morreu — e despertou neste mundo assumindo o corpo de alguém que devia MUITO à família errada. Capangas batem na porta cobrando. Você não fez nada disso, mas o mundo não sabe. Pague, fuja, ou entre para o jogo.' },
  ],
  npcs: MAFIA_NPCS,
  npcTables: MAFIA_NPC_TABLES,
  systemPromptLore: MAFIA_LORE,
  isekaiIntro: `O jogador foi transportado do nosso mundo (2026) pra Inglaterra dos anos 1920. Sem família, sem conexões, sem dinheiro. Um forasteiro estrangeiro que fala diferente — visto com suspeita. Precisa se infiltrar ou criar seu próprio caminho no submundo. Começa do ZERO.`,
  imageStyle: 'Peaky Blinders style, 1920s England, gritty, industrial, moody lighting, smoke, cinematic',
};

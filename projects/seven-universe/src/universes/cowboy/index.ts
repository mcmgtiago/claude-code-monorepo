import type { Universe } from '../types';
import { COWBOY_LORE } from './lore';
import { COWBOY_NPCS } from './npcs';
import { COWBOY_NPC_TABLES } from './npc-tables';

export const COWBOY: Universe = {
  id: 'cowboy',
  name: 'Velho Oeste',
  tagline: 'A fronteira não perdoa',
  emoji: '🤠',
  theme: { accent: 'amber', accentHex: '#f59e0b' },
  powerLabel: 'Reputação',
  hasPowerGenerator: false,

  attributes: [
    { key: 'forca', label: 'Força', short: 'FOR' },
    { key: 'mira', label: 'Mira', short: 'MIR' },
    { key: 'resistencia', label: 'Resistência', short: 'RES' },
    { key: 'reflexo', label: 'Reflexo', short: 'REF' },
    { key: 'astucia', label: 'Astúcia', short: 'AST' },
    { key: 'carisma', label: 'Carisma', short: 'CAR' },
    { key: 'percepcao', label: 'Percepção', short: 'PER' },
    { key: 'vontade', label: 'Vontade', short: 'VON' },
  ],
  tiers: [
    { key: 'novato', label: 'Forasteiro', desc: 'Recém-chegado sem nome', budget: 22, startLevel: 1 },
    { key: 'veterano', label: 'Pistoleiro', desc: 'Já matou alguns homens', budget: 34, startLevel: 5 },
    { key: 'elite', label: 'Lenda Viva', desc: 'Cartaz de procurado gordo', budget: 48, startLevel: 12 },
    { key: 'omega', label: 'Mão Mais Rápida', desc: 'Ninguém saca mais rápido', budget: 80, startLevel: 25 },
  ],
  powerTypes: [
    { key: 'pistoleiro', label: 'Pistoleiro', desc: 'Mestre do revólver e do saque rápido.' },
    { key: 'fora_da_lei', label: 'Fora-da-Lei', desc: 'Bandido, ladrão de trens, procurado.' },
    { key: 'lei', label: 'Homem da Lei', desc: 'Xerife, caçador de recompensas, marshal.' },
  ],

  skills: [
    { name: 'Saque Rápido', tree: 'combate', tier: 1, description: 'Saca o revólver num piscar. +1 reflexo.', bonusAttribute: 'reflexo', bonusAmount: 1 },
    { name: 'Atirador de Elite', tree: 'combate', tier: 2, description: 'Acerta uma moeda no ar. +2 mira.', bonusAttribute: 'mira', bonusAmount: 2 },
    { name: 'Deadeye', tree: 'combate', tier: 3, description: 'Tempo congela, você mira em 6 alvos. +3 mira.', bonusAttribute: 'mira', bonusAmount: 3 },
    { name: 'Punho de Ferro', tree: 'combate', tier: 1, description: 'Briga de bar. +1 força.', bonusAttribute: 'forca', bonusAmount: 1 },
    { name: 'Trapaceiro', tree: 'social', tier: 1, description: 'Cartas marcadas, blefe. +1 astúcia.', bonusAttribute: 'astucia', bonusAmount: 1 },
    { name: 'Presença Intimidadora', tree: 'social', tier: 2, description: 'Homens tremem quando você entra. +2 carisma.', bonusAttribute: 'carisma', bonusAmount: 2 },
    { name: 'Rastreador', tree: 'sobrevivencia', tier: 1, description: 'Segue trilhas no deserto. +1 percepção.', bonusAttribute: 'percepcao', bonusAmount: 1 },
    { name: 'Cavaleiro', tree: 'sobrevivencia', tier: 1, description: 'Um com o cavalo. +1 reflexo.', bonusAttribute: 'reflexo', bonusAmount: 1 },
  ],
  scenarios: [
    { id: 'deserto', emoji: '🏜️', title: 'No Meio do Deserto', mode: 'adventure', setup: 'Acorda no deserto escaldante, sol a pino, sem água. Urubus circulam. Ao longe, fumaça de uma vila. Botas gastas nos pés.' },
    { id: 'saloon', emoji: '🍺', title: 'Saloon Poeirento', mode: 'adventure', setup: 'Materializa no meio de um saloon lotado. Piano para. Todos te encaram — um estranho apareceu do nada. Um pistoleiro se levanta.' },
    { id: 'trem', emoji: '🚂', title: 'Assalto ao Trem', mode: 'adventure', setup: 'Aparece dentro de um trem em movimento — no meio de um assalto. Bandidos mascarados apontam armas pros passageiros. E pra você.' },
    { id: 'forca', emoji: '🪢', title: 'Prestes a Ser Enforcado', mode: 'adventure', setup: 'Acorda com uma corda no pescoço, num cadafalso. Multidão gritando. O xerife lê seus "crimes" — que você nem cometeu. O alçapão range.' },
    { id: 'rancho', emoji: '🐎', title: 'Rancho Isolado', mode: 'adventure', setup: 'Desperta num celeiro de um rancho. Uma fazendeira aponta uma espingarda: "Quem diabos é você e o que faz na minha propriedade?"' },
    { id: 'canyon', emoji: '⛰️', title: 'Emboscada no Cânion', mode: 'adventure', setup: 'Aparece num desfiladeiro estreito. Tiros ecoam — você caiu no meio de uma emboscada entre foras-da-lei e caçadores de recompensa.' },
    { id: 'bordel', emoji: '💋', title: 'Bordel da Madame', mode: 'adult', setup: 'Acorda numa cama de veludo vermelho no andar de cima de um bordel. Uma cortesã de espartilho se aproxima: "A madame disse que você pagou a noite toda, forasteiro."' },
    { id: 'banho', emoji: '🛁', title: 'Casa de Banho', mode: 'adult', setup: 'Materializa numa banheira de água quente numa casa de banhos. Não está sozinho — uma mulher bonita compartilha a água, e sorri.' },
    { id: 'viuva', emoji: '🌹', title: 'Viúva Solitária', mode: 'adult', setup: 'Desperta na cama macia de uma fazenda. A viúva dona da casa te encontrou desmaiado e cuidou de você. Agora ela desabotoa o vestido: "Faz tempo que um homem não dorme aqui."' },
    // Inícios clássicos de isekai
    { id: 'iso_caminhao', emoji: '🚚', title: 'Morte e Renascimento', mode: 'adventure', setup: 'A última coisa que lembra é o farol de um caminhão. Depois, escuridão. Agora acorda numa carroça sacolejante sob o sol do deserto, roupas de gado alheias, vivo. O condutor cospe tabaco: "Achei você largado na trilha, forasteiro. Sorte que os corvos não chegaram primeiro."' },
    { id: 'iso_ritual', emoji: '🔮', title: 'Ritual Xamânico', mode: 'adventure', setup: 'Um xamã nativo realizou um ritual sob a lua — e você foi ARRANCADO do seu mundo para a fronteira de 1880. Ele te encara com olhos antigos: "A visão trouxe um espírito de outro tempo. Você tem um caminho a andar aqui, estranho das roupas impossíveis."' },
    { id: 'iso_portal_jogo', emoji: '🎮', title: 'Sugado pela Tela', mode: 'adventure', setup: 'Você jogava um faroeste. A tela brilhou branco — e agora está DENTRO dele, numa rua de terra batida. Você conhece os duelos, os assaltos, quem é confiável. Mas o revólver na cintura do estranho à sua frente é bem real, e a mão dele coça o coldre.' },
    { id: 'iso_bebe_memoria', emoji: '👶', title: 'Renascido com Memórias', mode: 'adventure', setup: 'Você reencarnou na fronteira anos atrás, filho de colonos, mas guardou as memórias da vida moderna. Hoje adulto, com um revólver na cintura, você conhece a história que virá — a ferrovia, o ouro, as guerras de gado. Pode lucrar com isso... se sobreviver aos duelos.' },
    { id: 'iso_sonho', emoji: '💤', title: 'Acordou no Deserto', mode: 'adventure', setup: 'Você dormiu no seu mundo. Acordou no meio de um deserto escaldante do Velho Oeste, roupas modernas encharcadas de suor, sem água. Nenhuma explicação. Urubus circulam. Ao longe, fumaça de uma vila — e cascos de cavalos se aproximando por trás.' },
    { id: 'iso_forca', emoji: '🪢', title: 'Salvo da Forca', mode: 'adventure', setup: 'Você morreu — e despertou neste mundo com uma corda no pescoço, num cadafalso, acusado de crimes que outro cometeu. A multidão grita por sangue. Segundos antes do alçapão abrir, um tiroteio irrompe na praça. É a sua única chance.' },
  ],
  npcs: COWBOY_NPCS,
  npcTables: COWBOY_NPC_TABLES,
  systemPromptLore: COWBOY_LORE,
  isekaiIntro: `O jogador foi transportado do nosso mundo (2026) pro Velho Oeste de 1880. Roupas estranhas, sem cavalo, sem arma, sem dinheiro. Um forasteiro que ninguém conhece — e que fala meio esquisito. Numa terra onde a lei é o revólver e a vida vale pouco.`,
  imageStyle: 'wild west, spaghetti western, dusty, sepia tones, cinematic, Red Dead Redemption style',
};
